import termkit from 'terminal-kit';
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
import { render, renderSelection } from './render';
import { readSess, trackSelection, writeSess } from './Sess';

import { openSync, writeSync } from 'fs';
import { recalcDropdown } from '../newStore2';
import { drawToTerminal } from './drawToTerminal';
import { SimplestEvaluator } from '../../evaluators/simplest';

export type MouseEvt = {
    x: number;
    y: number;
    shift: boolean;
    ctrl: boolean;
    alt: boolean;
};

// TODO NEXT STEP
// refactor this out, so that we can use xtermjs as well
// because that would be super cool

export const run = async (term: termkit.Terminal) => {
    console.log('initializing store...');
    const sess = readSess();
    const store = await init(sess);
    term.clear();
    term.grabInput({ mouse: 'drag' });

    const ev = SimplestEvaluator;

    if (!sess.doc) {
        const picked = await pickDocument(store, term);
        if (picked === null) {
            const id = genId();
            store.update(...newDocument(id));
            sess.doc = id;
        } else {
            sess.doc = picked;
        }
        writeSess(sess);
    }

    const docId = sess.doc;

    let lastKey = null as null | string;

    let rstate = render(term.width - 10, store, sess.doc, ev);
    drawToTerminal(rstate, term, store, docId, lastKey, ev);

    const unsel = trackSelection(store, sess, docId);

    let prevState = store.getState();
    let tid: null | Timer = null;
    let needsDropdownRecalc = false;

    const rerender = () => {
        tid = null;
        rstate = render(term.width - 10, store, docId, ev);
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

    store.on('selection', (autocomplete) => {
        if (autocomplete) {
            needsDropdownRecalc = true;
            kick();
        }
    });

    store.on('all', () => {
        kick();
    });

    term.on('resize', () => kick());

    term.on('key', (key: string) => {
        if (onKey(key)) {
            return;
        }

        if (key === 'ESCAPE') {
            unsel();
            store.update({ type: 'selection', doc: docId, selections: [] });

            setTimeout(() => {
                return process.exit(0);
            }, 50);
        }

        term.moveTo(0, term.height, key);
        renderSelection(term, store, docId, rstate.sourceMaps);
    });

    term.on('mouse', (evtKind: MouseKind, evt: MouseEvt) => {
        onMouse(evtKind, evt);
    });

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

    type MouseKind =
        | 'MOUSE_DRAG'
        | 'MOUSE_LEFT_BUTTON_PRESSED'
        | 'MOUSE_LEFT_BUTTON_RELEASED';

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
};
