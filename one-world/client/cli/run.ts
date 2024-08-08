import termkit from 'terminal-kit';
import { Block } from '../../shared/IR/ir-to-blocks';
import { handleMouseClick, handleMouseDrag } from './edit/handleMouse';
import { handleMovement, handleUpDown } from './edit/handleMovement';
import { init } from './init';
import {
    pickDocument,
    redrawWithSelection,
    render,
    renderSelection,
} from './render';
import { multiSelectContains, resolveMultiSelect } from './resolveMultiSelect';
import { readSess, writeSess } from './Sess';
import { handleUpdate } from './edit/handleUpdate';
import { matchesSpan } from '../../shared/IR/highlightSpan';
import { drop, validDropTargets } from './edit/drop';

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
        sess.doc = await pickDocument(store, term);
        writeSess(sess);
    }

    const docId = sess.doc;

    let lastKey = null as null | string;

    let { sourceMaps, dropTargets, cache, block, txt } = render(
        term.width - 10,
        store,
        sess.doc,
    );
    term.clear();
    term.moveTo(0, 2, txt);
    renderSelection(term, store, docId, sourceMaps);

    const unsel = store.on('selection', () => {
        sess.selection = store.getDocSession(docId).selections;
        writeSess(sess);
    });

    process.on('beforeExit', () => {
        unsel();
        store.update({ type: 'selection', doc: docId, selections: [] });
    });

    let changed = false;
    let tid: null | Timer = null;

    const rerender = () => {
        tid = null;

        if (changed) {
            ({ sourceMaps, dropTargets, cache, block, txt } = render(
                term.width - 10,
                store,
                docId,
            ));
        } else {
            const ds = store.getDocSession(docId);
            ({ txt } = redrawWithSelection(
                block,
                ds.selections,
                ds.dragState,
                store.getState(),
            ));
        }
        term.clear();
        term.moveTo(0, 2, txt);

        if (lastKey) {
            term.moveTo(0, term.height, lastKey);
        }
        const ds = store.getDocSession(docId);
        // const sel = ds.selections[0];
        // if (sel) {
        //     term.moveTo(0, term.height - 5, JSON.stringify(sel));
        // }

        if (ds.dragState?.dest) {
            term.moveTo(
                ds.dragState.dest.pos.x +
                    1 +
                    (ds.dragState.dest.side === 'after' ? -1 : 0),
                ds.dragState.dest.pos.y + 1,
                '⬇️',
            );
            term.moveTo(0, term.height - 5, JSON.stringify(ds.dragState.dest));
        }

        renderSelection(term, store, docId, sourceMaps);

        changed = false;
    };

    const kick = () => {
        if (tid != null) return;
        tid = setTimeout(rerender, 0);
    };

    store.on('all', () => {
        changed = true;
        kick();
    });

    store.on('selection', () => {
        kick();
    });

    term.on('resize', () => {
        changed = true;
        kick();
    });

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
            handleUpDown(key, docId, cache, store, sourceMaps) ||
            handleMovement(key, docId, cache, store)
        ) {
            return;
        }
        if (handleUpdate(key, docId, cache, store)) {
            return;
        }
        term.moveTo(0, term.height, key);
    });

    term.on('mouse', (one: string, evt: MouseEvt) => {
        const ds = store.getDocSession(docId);
        if (one === 'MOUSE_DRAG') {
            if (ds.dragState) {
                const pos = { x: evt.x - 1, y: evt.y - 2 };
                const found = validDropTargets(
                    dropTargets,
                    ds.dragState.source,
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
                        ds.dragState.source,
                        best.target.path,
                        store.getState(),
                    )
                ) {
                    store.update({
                        type: 'drag',
                        doc: docId,
                        drag: {
                            source: ds.dragState.source,
                            dest: best.target,
                        },
                    });
                }
                return;
            }
            handleMouseDrag(docId, sourceMaps, evt, cache, store);
        } else if (one === 'MOUSE_LEFT_BUTTON_PRESSED') {
            const sel = ds.selections[0];
            if (sel?.end) {
                const multi = resolveMultiSelect(
                    sel.start.path,
                    sel.end.path,
                    store.getState(),
                );
                if (multi) {
                    const found = sourceMaps.find((m) =>
                        matchesSpan(evt.x - 1, evt.y - 2, m.shape),
                    );
                    if (
                        found &&
                        multiSelectContains(
                            multi,
                            found.source.path,
                            store.getState(),
                        )
                    ) {
                        store.update({
                            type: 'drag',
                            doc: docId,
                            drag: { source: multi },
                        });
                        return;
                    }
                }
            }

            handleMouseClick(docId, sourceMaps, dropTargets, evt, cache, store);
        } else if (one === 'MOUSE_LEFT_BUTTON_RELEASED') {
            const ds = store.getDocSession(docId);
            const dragState = ds.dragState;
            if (dragState) {
                store.update({ type: 'drag', doc: docId, drag: undefined });
                if (!dragState.dest) {
                    handleMouseClick(
                        docId,
                        sourceMaps,
                        dropTargets,
                        evt,
                        cache,
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
