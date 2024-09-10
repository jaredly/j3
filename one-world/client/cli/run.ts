import termkit from 'terminal-kit';
import { BootExampleEvaluator } from '../../boot-ex';
import { Block } from '../../shared/IR/ir-to-blocks';
import { drop } from './edit/drop';
import { handleMouseClick, handleMouseDrag } from './edit/handleMouse';
import {
    handleDropdown,
    handleMovement,
    handleUpDown,
} from './edit/handleMovement';
import { handleUpdate } from './edit/handleUpdate';
import { genId, newDocument } from './edit/newDocument';
import { init } from './init';
import { pickDocument } from './pickDocument';
import { render, renderSelection, RState, selectionPos } from './render';
import { readSess, trackSelection, writeSess } from './Sess';
import { Store } from '../StoreContext2';
import { handleDrag, maybeStartDragging } from './handleDrag';

// cursor line instead of square
process.stdout.write('\x1b[6 q');

// @ts-ignore
global.window = {};
// @ts-ignore
global.localStorage = {};

import { openSync, writeSync } from 'fs';
import { AnyEvaluator } from '../../boot-ex/types';
import { getAutoComplete, menuToBlocks } from './getAutoComplete';
import {
    BlockEntry,
    blockToText,
    DropTarget,
} from '../../shared/IR/block-to-text';
import { DocSession } from '../../shared/state2';
import { recalcDropdown } from '../newStore2';
import { drawToTerminal } from './drawToTerminal';
// NOTE: Uncomment to route logs to a file
const REDIRECT_OUT = false;
if (REDIRECT_OUT) {
    console.log('redirecting output to cli.log');
    const out = openSync('./cli.log', 'W');
    console.log = (...args) => {
        writeSync(out, JSON.stringify(args) + '\n');
    };
}

export type MouseEvt = {
    x: number;
    y: number;
    shift: boolean;
    ctrl: boolean;
    alt: boolean;
};

const run = async (term: termkit.Terminal) => {
    console.log('initializing store...');
    const sess = readSess();
    const store = await init(sess);
    term.clear();
    term.grabInput({ mouse: 'drag' });

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

    let rstate = render(term.width - 10, store, sess.doc, BootExampleEvaluator);
    drawToTerminal(rstate, term, store, docId, lastKey, BootExampleEvaluator);

    const unsel = trackSelection(store, sess, docId);

    let prevState = store.getState();
    let tid: null | Timer = null;

    const rerender = () => {
        tid = null;
        rstate = render(term.width - 10, store, docId, BootExampleEvaluator);
        drawToTerminal(
            rstate,
            term,
            store,
            docId,
            lastKey,
            BootExampleEvaluator,
        );
        prevState = store.getState();
    };

    const kick = () => {
        if (tid != null) return;
        tid = setTimeout(rerender, 0);
    };

    store.on('selection', (autocomplete) => {
        if (autocomplete) {
            recalcDropdown(store, docId, rstate);
            kick();
        }
    });

    store.on('all', () => {
        kick();
    });
    term.on('resize', () => kick());

    term.on('key', (key: string) => {
        lastKey = key;
        if (key === 'CTRL_W') {
            writeSess({ ssid: sess.ssid });
            return;
        }

        if (handleDropdown(key, docId, store, rstate, kick)) {
            return;
        }

        if (
            handleUpDown(key, docId, store, rstate) ||
            handleMovement(key, docId, rstate.cache, store)
        ) {
            return;
        }
        if (handleUpdate(key, docId, rstate.cache, store)) {
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

    term.on('mouse', (one: string, evt: MouseEvt) => {
        const ds = store.getDocSession(docId);
        if (one === 'MOUSE_DRAG') {
            if (ds.dragState) {
                handleDrag(evt, docId, rstate, ds.dragState, store);
                return;
            }
            handleMouseDrag(docId, rstate.sourceMaps, evt, store);
        } else if (one === 'MOUSE_LEFT_BUTTON_PRESSED') {
            if (
                ds.selections.length &&
                maybeStartDragging(evt, docId, rstate, ds.selections[0], store)
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
        } else if (one === 'MOUSE_LEFT_BUTTON_RELEASED') {
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
    });
};

const getTerm = () =>
    new Promise<termkit.Terminal>((res, rej) =>
        termkit.getDetectedTerminal((err, term) =>
            err ? rej(err) : res(term),
        ),
    );

getTerm().then((term) => {
    process.on('beforeExit', () => {
        term.grabInput(false);
    });
    run(term).then(
        () => {
            // console.log('finished turns out');
            // term.grabInput(false);
        },
        (err) => {
            console.log('failed I guess');
            console.log(err);
            term.grabInput(false);
            process.exit(1);
        },
    );
});