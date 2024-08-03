import termkit from 'terminal-kit';
import { Block } from '../../shared/IR/ir-to-blocks';
import { handleMouse, handleMouseDrag } from './edit/handleMouse';
import { handleMovement, handleUpDown } from './edit/handleMovement';
import { init } from './init';
import {
    pickDocument,
    redrawWithSelection,
    render,
    renderSelection,
} from './render';
import { readSess, writeSess } from './Sess';
import { handleUpdate } from './edit/handleUpdate';
import { open, openSync, writeSync } from 'fs';

// cursor line
process.stdout.write('\x1b[6 q');

// @ts-ignore
global.window = {};
// @ts-ignore
global.localStorage = {};

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

    let { sourceMaps, cache, block, txt } = render(
        term.width - 10,
        store,
        sess.doc,
    );
    term.clear();
    term.moveTo(0, 2, txt);
    renderSelection(term, store, docId, sourceMaps);

    const unsel = store.on('selection', () => {
        sess.selection = store.getDocSession(docId, store.session).selections;
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

        let txt;

        if (changed) {
            ({ sourceMaps, cache, block, txt } = render(
                term.width - 10,
                store,
                docId,
            ));
        } else {
            ({ txt } = redrawWithSelection(
                block,
                store.getDocSession(docId, store.session).selections,
                store.getState(),
            ));
        }
        term.clear();
        term.moveTo(0, 2, txt);

        renderSelection(term, store, docId, sourceMaps);
        if (lastKey) {
            term.moveTo(0, term.height, lastKey);
        }

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
        if (key === 'CTRL_C') {
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

    term.on(
        'mouse',
        (
            one: string,
            evt: {
                x: number;
                y: number;
                shift: boolean;
                ctrl: boolean;
                alt: boolean;
            },
        ) => {
            if (one === 'MOUSE_DRAG') {
                handleMouseDrag(docId, sourceMaps, evt, cache, store);
            } else if (one === 'MOUSE_LEFT_BUTTON_PRESSED') {
                handleMouse(docId, sourceMaps, evt, cache, store);
            } else {
                return;
            }
            // const { txt } = redrawWithSelection(
            //     block,
            //     store.getDocSession(docId, store.session).selections,
            //     store.getState(),
            // );
            // term.clear();
            // term.moveTo(0, 2, txt);
            // renderSelection(term, store, docId, sourceMaps);
        },
    );
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
