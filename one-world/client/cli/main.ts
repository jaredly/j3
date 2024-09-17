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
import { EvalCache, parseAndCache, render, renderSelection } from './render';
import { Sess, trackSelection } from './Sess';

import { Expr, SimplestEvaluator, Top } from '../../evaluators/simplest';
import { recalcDropdown } from '../newStore2';
import {
    drawToTerminal,
    MouseEvt,
    MouseKind,
    Terminal,
} from './drawToTerminal';
import { Evaluator } from '../../evaluators/boot-ex/types';
import { Store } from '../StoreContext2';
import { evaluate } from '../../graphh/by-hand';

// TODO NEXT STEP
// refactor this out, so that we can use xtermjs as well
// because that would be super cool

const handleDocument = async (
    sess: Sess,
    store: Store,
    term: Terminal,
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
    term: Terminal,
    readSess: () => Sess,
    writeSess: (s: Sess) => void,
) => {
    console.log('initializing store...');
    const sess = readSess();
    const store = await init(sess);

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

export function runDocument(
    term: Terminal,
    store: Store,
    sess: Sess,
    docId: string,
    writeSess: (s: Sess) => void,
) {
    let lastKey = null as null | string;
    const ev = SimplestEvaluator;

    // const worker = new Worker('./worker.ts');

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
    const { parseCache, caches, ctx } = parseAndCache(store, docId, ev);

    // The eval
    Object.keys(parseCache).forEach((tid) => {
        parseCache[tid].output = evaluate(tid, ctx, ev, caches);
    });

    let rstate = render(term.width - 10, store, docId, parseCache);

    drawToTerminal(rstate, term, store, docId, lastKey, ev);

    clean(trackSelection(store, sess, docId, writeSess));

    let prevState = store.getState();
    let tid: null | Timer = null;
    let needsDropdownRecalc = false;

    const rerender = () => {
        tid = null;

        // The parse
        const { parseCache, caches, ctx } = parseAndCache(store, docId, ev);

        // The eval
        const evalCache: EvalCache = {};
        Object.keys(caches.parse).forEach((tid) => {
            evalCache[tid] = evaluate(tid, ctx, ev, caches);
        });

        rstate = render(term.width - 10, store, docId, parseCache);
        if (needsDropdownRecalc) {
            recalcDropdown(store, docId, rstate, ev);
            needsDropdownRecalc = false;
        }
        drawToTerminal(rstate, term, store, docId, lastKey, ev);
        prevState = store.getState();
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

            term.moveTo(0, term.height, key);
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
            handleMouseDrag(docId, rstate.sourceMaps, evt, store);
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
