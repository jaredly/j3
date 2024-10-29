import { drop } from './edit/drop';
import { handleMouseClick, handleMouseDrag } from './edit/handleMouse';
import {
    handleDropdown,
    handleMovement,
    handleUpDown,
} from './edit/handleMovement';
import { handleUpdate } from './edit/handleUpdate';
// import { genId, newDocument } from './edit/newDocument';
import { handleDrag, maybeStartDragging } from './handleDrag';
import { pickDocument } from './pickDocument';
import { parseAndCache, render, renderSelection } from './render';
import { Sess, trackSelection } from './Sess';

import { SimplestEvaluator } from '../../evaluators/simplest';
import { Caches, Context } from '../../graphh/by-hand';
import { ABlock, toChunk } from '../../shared/IR/block-to-attributed-text';
import { recalcDropdown } from '../newStore2';
import { Store } from '../StoreContext2';
import {
    drawToTerminal,
    MouseEvt,
    MouseKind,
    Renderer,
} from './drawToTerminal';
import { OutgoingMessage } from './worker';
import { previewDocument } from './previewDocument';
import { timeoutTracker } from './timeoutTracker';
import { genId } from './edit/newDocument';

export const run = async (term: Renderer) => {
    console.log('initializing store...');
    let sess = term.readSess();

    if (!sess) {
        // TODO:
        const docs = await term.docList();
        const picked = await pickDocument(docs, term, (id) => {});
        console.log('picked', picked);
        if (picked.id === null) {
            const store = await term.newDoc(picked.title);
            return runDocument(term, store, {
                doc: store.getState().id,
                selection: [],
                ssid: store.session,
            });
            // OK SO here, I think we ...
            // ... initialize a store around that stage?
            // I think.
            // like, the main idea is that we're shrinking
            // the visible surface area of `persistedstate`
            // and the store generally, to just encompass
            // the `DocStage`, which contains a copy of
            // all relevant toplevels.
        }
        const store = await term.loadDoc(picked.id);
        return runDocument(term, store, {
            doc: picked.id,
            selection: [],
            ssid: genId(),
        });
    }

    const store = await term.loadDoc(sess.doc);
    await runDocument(term, store, sess);

    setTimeout(() => {
        return process.exit(0);
    }, 50);
};

export function runDocument(term: Renderer, store: Store, sess: Sess) {
    console.log('running a doc', store);
    // const store = await term.init(sess);
    const docId = store.getState().id;

    let lastKey = null as null | string;
    const ev = SimplestEvaluator;

    const handleMessage = (msg: OutgoingMessage) => {
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

    let worker = term.spawnWorker(handleMessage);

    const restartWorker = () => {
        worker.terminate();
        worker = term.spawnWorker(handleMessage);
        // Send latest infos
        const { caches, ctx } = parseAndCache(store, docId, {}, ev);
        sendToWorker(caches, ctx);
    };
    const tracker = timeoutTracker(restartWorker);

    const sendToWorker = (caches: Caches<unknown>, ctx: Context) => {
        worker.sendMessage({
            type: 'evaluates',
            id: tracker.nextMsgId(),
            ctx,
            evid: 'simplest',
            caches,
            tops: Object.keys(caches.parse),
        });
    };

    let resolve = (quit: boolean) => {};
    const finisher = new Promise<boolean>((res) => (resolve = res));

    const cleanup: (() => void)[] = [
        () => store.update({ type: 'selection', doc: docId, selections: [] }),
    ];
    const clean = (v: () => void) => cleanup.push(v);

    const finish = (quit: boolean) => {
        cleanup.forEach((v) => v());
        setTimeout(() => {
            resolve(quit);
        }, 50);
    };

    // The parse
    const { parseCache, caches, ctx } = parseAndCache(store, docId, {}, ev);
    let rstate = render(term.width - 10, store, docId, parseCache);
    drawToTerminal(rstate, term, store, docId, lastKey, ev);
    clean(trackSelection(store, sess, docId, term.writeSess));
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

        // The eval now happens in the worker

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

            term.moveTo(1, term.height - 1, [
                [toChunk(key, { background: { r: 0, g: 0, b: 0 } })],
            ]);
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
            finish(false);
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
