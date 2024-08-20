import termkit from 'terminal-kit';
import { BootExampleEvaluator } from '../../boot-ex';
import { matchesSpan } from '../../shared/IR/highlightSpan';
import { Block } from '../../shared/IR/ir-to-blocks';
import { drop, validDropTargets } from './edit/drop';
import { handleMouseClick, handleMouseDrag } from './edit/handleMouse';
import { handleMovement, handleUpDown } from './edit/handleMovement';
import { handleUpdate } from './edit/handleUpdate';
import { genId, newDocument } from './edit/newDocument';
import { init } from './init';
import { pickDocument } from './pickDocument';
import { redrawWithSelection, render, renderSelection } from './render';
import { multiSelectContains, resolveMultiSelect } from './resolveMultiSelect';
import { readSess, Sess, writeSess } from './Sess';
import { Store } from '../StoreContext2';
import { IRCache2 } from '/Users/jared/clone/exploration/j3/one-world/shared/IR/nav';
import {
    BlockEntry,
    DropTarget,
} from '/Users/jared/clone/exploration/j3/one-world/shared/IR/block-to-text';
import { DocSession } from '../../shared/state2';
import { IRSelection } from '../../shared/IR/intermediate';

// cursor line
process.stdout.write('\x1b[6 q');

// @ts-ignore
global.window = {};
// @ts-ignore
global.localStorage = {};

type Coord = { x: number; y: number };
const dist2 = ({ x, y }: Coord, { x: x2, y: y2 }: Coord) => {
    return (x - x2) * (x - x2) + (y - y2) * (y - y2);
};

// import { openSync, writeSync } from 'fs';
// const out = openSync('./cli.log', 'W');
// console.log = (...args) => {
//     writeSync(out, JSON.stringify(args) + '\n');
// };

const getTerm = () =>
    new Promise<termkit.Terminal>((res, rej) =>
        termkit.getDetectedTerminal((err, term) =>
            err ? rej(err) : res(term),
        ),
    );

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
    drawToTerminal(rstate, term, store, docId, lastKey);

    const unsel = trackSelection(store, sess, docId);

    let prevState = store.getState();
    let tid: null | Timer = null;

    const rerender = () => {
        tid = null;
        rstate = render(term.width - 10, store, docId, BootExampleEvaluator);
        drawToTerminal(rstate, term, store, docId, lastKey);
        prevState = store.getState();
    };

    const kick = () => {
        if (tid != null) return;
        tid = setTimeout(rerender, 0);
    };

    store.on('all', () => kick());
    term.on('resize', () => kick());

    term.on('key', (key: string) => {
        lastKey = key;
        if (key === 'ESCAPE') {
            unsel();
            store.update({ type: 'selection', doc: docId, selections: [] });

            setTimeout(() => {
                return process.exit(0);
            }, 50);
        }
        if (
            handleUpDown(key, docId, store, rstate.sourceMaps) ||
            handleMovement(key, docId, rstate.cache, store)
        ) {
            return;
        }
        if (handleUpdate(key, docId, rstate.cache, store)) {
            return;
        }
        term.moveTo(0, term.height, key);
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
            const sel = ds.selections[0];
            if (maybeStartDragging(evt, docId, rstate, sel, store)) {
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

type MouseEvt = {
    x: number;
    y: number;
    shift: boolean;
    ctrl: boolean;
    alt: boolean;
};

const blockInfo = (block: Block): string => {
    let res = `${block.width}x${block.height}`;
    if (block.type === 'inline') {
        if (typeof block.contents === 'string') {
            res += 'T';
        } else {
            res += `(${block.contents
                .map((line) => line.map(blockInfo).join('|'))
                .join('↩')})`;
        }
    } else if (block.type === 'block') {
        res += `[${block.contents
            .map(blockInfo)
            .join(block.horizontal === false ? '|' : '-')}]`;
    } else {
        res += '[||]';
    }
    return res;
};

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

export type RState = {
    cache: IRCache2<any>;
    sourceMaps: BlockEntry[];
    dropTargets: DropTarget[];
    block: Block;
    txt: string;
};

function trackSelection(store: Store, sess: Sess, docId: string) {
    const unsel = store.on('selection', () => {
        sess.selection = store.getDocSession(docId).selections;
        writeSess(sess);
    });

    process.on('beforeExit', () => {
        unsel();
        store.update({ type: 'selection', doc: docId, selections: [] });
    });
    return unsel;
}

function drawToTerminal(
    rstate: RState,
    term: termkit.Terminal,
    store: Store,
    docId: string,
    lastKey: string | null,
) {
    term.clear();
    term.moveTo(0, 2, rstate.txt);

    if (lastKey) {
        term.moveTo(0, term.height, lastKey);
    }
    const dragState = store.getDocSession(docId)?.dragState;
    if (dragState?.dest) {
        term.moveTo(
            dragState.dest.pos.x +
                1 +
                (dragState.dest.side === 'after' ? -1 : 0),
            dragState.dest.pos.y + 1,
            '⬇️',
        );
        term.moveTo(0, term.height - 5, JSON.stringify(dragState.dest));
    }

    renderSelection(term, store, docId, rstate.sourceMaps);
}

const maybeStartDragging = (
    evt: MouseEvt,
    docId: string,
    rstate: RState,
    sel: IRSelection,
    store: Store,
): boolean => {
    if (!sel.end) return false;
    const multi = resolveMultiSelect(
        sel.start.path,
        sel.end.path,
        store.getState(),
    );
    const x = evt.x - 1;
    const y = evt.y - 2;
    if (!multi) return false;

    const found = rstate.sourceMaps.find((m) => matchesSpan(x, y, m.shape));
    if (!found) {
        const closest = rstate.dropTargets
            .map((target) => ({
                target,
                dx: Math.abs(target.pos.x - x),
                dy: Math.abs(target.pos.y - y),
            }))
            .filter((a) => a.dy === 0)
            .sort((a, b) => a.dx - b.dx);
        if (!closest.length) return true;
        let { path } = closest[0].target;
        if (multiSelectContains(multi, path, store.getState())) {
            store.update({
                type: 'drag',
                doc: docId,
                drag: { source: multi },
            });
            return true;
        }
    }

    if (
        found &&
        multiSelectContains(multi, found.source.path, store.getState())
    ) {
        store.update({
            type: 'drag',
            doc: docId,
            drag: { source: multi },
        });
        return true;
    }

    return false;
};

const handleDrag = (
    evt: MouseEvt,
    docId: string,
    rstate: RState,
    dragState: NonNullable<DocSession['dragState']>,
    store: Store,
) => {
    const pos = { x: evt.x - 1, y: evt.y - 2 };
    const found = validDropTargets(
        rstate.dropTargets,
        dragState.source,
        store.getState(),
    )
        .map((target) => ({
            target,
            dx: Math.abs(target.pos.x - pos.x),
            dy: Math.abs(target.pos.y - pos.y),
        }))
        .filter((a) => a.dy === 0)
        .sort((a, b) => a.dx - b.dx);
    if (!found.length) return;
    const best = found[0];
    if (
        !multiSelectContains(
            dragState.source,
            best.target.path,
            store.getState(),
        )
    ) {
        store.update({
            type: 'drag',
            doc: docId,
            drag: {
                source: dragState.source,
                dest: best.target,
            },
        });
    } else if (dragState.dest) {
        store.update({
            type: 'drag',
            doc: docId,
            drag: {
                source: dragState.source,
            },
        });
    }
};
