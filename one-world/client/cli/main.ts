import { drop } from './edit/drop';
import { handleMouseClick, handleMouseDrag } from './edit/handleMouse';
import {
    handleDropdown,
    handleMovement,
    handleUpDown,
} from './edit/handleMovement';
import { handleUpdate } from './edit/handleUpdate';
import { genId, newDocument } from './edit/newDocument';
import { handleDrag, maybeStartDragging } from './handleDrag';
import { init } from './init';
import { pickDocument } from './pickDocument';
import { parseAndCache, render, renderSelection } from './render';
import { Sess, trackSelection } from './Sess';

import { SimplestEvaluator } from '../../evaluators/simplest';
import { Caches, Context } from '../../graphh/by-hand';
import { toChunk } from '../../shared/IR/block-to-attributed-text';
import { recalcDropdown } from '../newStore2';
import { Store } from '../StoreContext2';
import {
    drawToTerminal,
    MouseEvt,
    MouseKind,
    Renderer,
} from './drawToTerminal';
import { IncomingMessage, OutgoingMessage } from './worker';

// TODO NEXT STEP
// refactor this out, so that we can use xtermjs as well
// because that would be super cool

const handleDocument = async (
    sess: Sess,
    store: Store,
    term: Renderer,
    writeSess: (s: Sess) => void,
) => {
    const picked = await pickDocument(store, term);
    if (picked === null) {
        const id = genId();
        store.update(...newDocument(id));
        sess.doc = id;
    } else {
        sess.doc = picked;
    }
    writeSess(sess);
    return sess.doc;
};

export const run = async (
    term: Renderer,
    readSess: () => Sess,
    writeSess: (s: Sess) => void,
) => {
    console.log('initializing store...');
    const sess = readSess();
    const store = await init(sess, writeSess);

    if (!sess.doc) {
        await handleDocument(sess, store, term, writeSess);
    }

    while (true) {
        const finish = await runDocument(
            term,
            store,
            sess,
            sess.doc!,
            writeSess,
        );
        if (finish) {
            break;
        } else {
            await handleDocument(sess, store, term, writeSess);
        }
    }

    setTimeout(() => {
        return process.exit(0);
    }, 50);
};

const WORKER_TIMEOUT = 1000;

const timeoutTracker = (fn: () => void) => {
    let msgId = 0;
    let waiting: { id: number; timer: Timer }[] = [];
    const restart = () => {
        waiting.forEach((w) => clearTimeout(w.timer));
        waiting = [];
        fn();
    };
    return {
        nextMsgId() {
            const id = msgId++;
            waiting.push({
                id,
                timer: setTimeout(restart, WORKER_TIMEOUT),
            });
            return id;
        },
        receivedMessage(id: number) {
            const got = waiting.find((w) => w.id === id);
            if (!got) return;
            waiting.splice(waiting.indexOf(got), 1);
            clearTimeout(got.timer);
        },
    };
};

export function runDocument(
    term: Renderer,
    store: Store,
    sess: Sess,
    docId: string,
    writeSess: (s: Sess) => void,
) {
    let lastKey = null as null | string;
    const ev = SimplestEvaluator;

    let worker = self.location
        ? new Worker('./worker.js')
        : new Worker('./one-world/client/cli/worker.ts');

    const handleMessage = (evt: MessageEvent) => {
        const msg: OutgoingMessage = JSON.parse(evt.data);
        tracker.receivedMessage(msg.id);
        Object.keys(msg.output).forEach((id) => {
            rstate.parseAndEval[id].output = msg.output[id];
        });

        rstate = render(term.width - 10, store, docId, rstate.parseAndEval);
        if (needsDropdownRecalc) {
            recalcDropdown(store, docId, rstate, ev);
            needsDropdownRecalc = false;
        }
        drawToTerminal(rstate, term, store, docId, lastKey, ev);
    };

    const restartWorker = () => {
        worker.terminate();
        // console.log('breaking workier');
        worker = self.location
            ? new Worker('./worker.js')
            : new Worker('./one-world/client/cli/worker.ts');
        worker.onmessage = handleMessage;
        // Send latest infos
        const { caches, ctx } = parseAndCache(store, docId, {}, ev);
        sendToWorker(caches, ctx);
    };
    const tracker = timeoutTracker(restartWorker);

    worker.onmessage = handleMessage;
    const sendToWorker = (caches: Caches<unknown>, ctx: Context) => {
        worker.postMessage(
            JSON.stringify({
                type: 'evaluates',
                id: tracker.nextMsgId(),
                ctx,
                evid: 'simplest',
                caches,
                tops: Object.keys(caches.parse),
            } satisfies IncomingMessage),
        );
    };

    let resolve = (quit: boolean) => {};
    const finisher = new Promise<boolean>((res) => (resolve = res));

    const cleanup: (() => void)[] = [
        () => store.update({ type: 'selection', doc: docId, selections: [] }),
    ];
    const clean = (v: () => void) => cleanup.push(v);

    const finish = (quit: boolean) => {
        cleanup.forEach((v) => v());
        resolve(quit);
    };

    // The parse
    const { parseCache, caches, ctx } = parseAndCache(store, docId, {}, ev);
    let rstate = render(term.width - 10, store, docId, parseCache);
    drawToTerminal(rstate, term, store, docId, lastKey, ev);
    clean(trackSelection(store, sess, docId, writeSess));
    sendToWorker(caches, ctx);

    let prevState = store.getState();
    let tid: null | Timer = null;
    let needsDropdownRecalc = false;

    const rerender = () => {
        tid = null;

        // The parse
        const { parseCache, caches, ctx } = parseAndCache(
            store,
            docId,
            rstate.parseAndEval,
            ev,
        );

        // // The eval
        // const evalCache: EvalCache = {};
        // Object.keys(caches.parse).forEach((tid) => {
        //     evalCache[tid] = evaluate(tid, ctx, ev, caches);
        // });

        rstate = render(term.width - 10, store, docId, parseCache);
        if (needsDropdownRecalc) {
            recalcDropdown(store, docId, rstate, ev);
            needsDropdownRecalc = false;
        }
        drawToTerminal(rstate, term, store, docId, lastKey, ev);
        prevState = store.getState();

        sendToWorker(caches, ctx);
    };

    const kick = () => {
        if (tid != null) return;
        tid = setTimeout(rerender, 0);
    };

    clean(
        store.on('selection', (autocomplete) => {
            if (autocomplete) {
                needsDropdownRecalc = true;
                kick();
            }
        }),
    );

    clean(
        store.on('all', () => {
            kick();
        }),
    );

    clean(term.onResize(() => kick()));

    clean(
        term.onKey((key: string) => {
            if (onKey(key)) {
                return;
            }

            if (key === 'ESCAPE') {
                return finish(true);
            }
            if (key === 'CTRL_W') {
                console.log('don???');
                return finish(false);
            }

            term.moveTo(0, term.height, [[toChunk(key)]]);
            renderSelection(term, store, docId, rstate.sourceMaps);
        }),
    );

    clean(
        term.onMouse((evtKind: MouseKind, evt: MouseEvt) => {
            onMouse(evtKind, evt);
        }),
    );

    const onKey = (key: string) => {
        lastKey = key;
        if (key === 'CTRL_W') {
            writeSess({ ssid: sess.ssid });
            return true;
        }

        if (handleDropdown(key, docId, store, rstate, kick, ev)) {
            return true;
        }

        if (
            handleUpDown(key, docId, store, rstate) ||
            handleMovement(key, docId, rstate.cache, store)
        ) {
            return true;
        }
        if (handleUpdate(key, docId, rstate.cache, store)) {
            return true;
        }
    };

    const onMouse = (evtKind: MouseKind, evt: MouseEvt) => {
        const ds = store.getDocSession(docId);
        if (evtKind === 'MOUSE_DRAG') {
            if (ds.dragState) {
                handleDrag(evt, docId, rstate, ds.dragState, store);
                return;
            }
            handleMouseDrag(
                docId,
                rstate.sourceMaps,
                evt,
                store,
                rstate.dropTargets,
                rstate.cache,
            );
        } else if (evtKind === 'MOUSE_LEFT_BUTTON_PRESSED') {
            const sel = ds.selections[0];
            if (
                sel?.type === 'ir' &&
                ds.selections.length &&
                maybeStartDragging(evt, docId, rstate, sel, store)
            ) {
                return;
            }

            // if (evt.y >= term.height - 1) {
            // }
            handleMouseClick(
                docId,
                rstate.sourceMaps,
                rstate.dropTargets,
                evt,
                rstate.cache,
                store,
            );
        } else if (evtKind === 'MOUSE_LEFT_BUTTON_RELEASED') {
            const ds = store.getDocSession(docId);
            const dragState = ds.dragState;
            if (dragState) {
                store.update({ type: 'drag', doc: docId, drag: undefined });
                if (!dragState.dest) {
                    handleMouseClick(
                        docId,
                        rstate.sourceMaps,
                        rstate.dropTargets,
                        evt,
                        rstate.cache,
                        store,
                    );
                } else {
                    drop(dragState.source, dragState.dest, store);
                }
            }

            return;
        }
    };

    return finisher;
}
