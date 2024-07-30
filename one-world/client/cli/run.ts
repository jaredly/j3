import termkit from 'terminal-kit';
import { Block } from '../../shared/IR/ir-to-blocks';
import { handleMouse } from './edit/handleMouse';
import { handleMovement } from './edit/handleMovement';
import { init } from './init';
import {
    pickDocument,
    redrawWithSelection,
    render,
    renderSelection,
} from './render';
import { readSess, writeSess } from './Sess';
import { handleUpdate } from './edit/handleUpdate';

// cursor line
process.stdout.write('\x1b[6 q');

// @ts-ignore
global.window = {};
// @ts-ignore
global.localStorage = {};

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
    term.grabInput({ mouse: 'button' });

    if (!sess.doc) {
        sess.doc = await pickDocument(store, term);
        writeSess(sess);
    }

    const docId = sess.doc;

    let { sourceMaps, cache, block } = render(term, store, sess.doc);
    renderSelection(term, store, docId, sourceMaps);

    const unsel = store.on('selection', () => {
        sess.selection = store.getDocSession(docId, store.session).selections;
        writeSess(sess);
    });

    process.on('beforeExit', () => {
        unsel();
        store.update({ type: 'selection', doc: docId, selections: [] });
    });

    term.on('resize', (width: number, height: number) => {
        term.clear();
        ({ sourceMaps, cache, block } = render(term, store, docId));
        renderSelection(term, store, docId, sourceMaps);
    });

    term.on('key', (key: string) => {
        if (key === 'ESCAPE') {
            unsel();
            store.update({ type: 'selection', doc: docId, selections: [] });

            setTimeout(() => {
                return process.exit(0);
            }, 50);
        }
        if (handleMovement(key, docId, cache, store)) {
            const { txt } = redrawWithSelection(
                block,
                store.getDocSession(docId, store.session).selections,
                store.getState(),
            );
            term.clear();
            term.moveTo(0, 2, txt);
            renderSelection(term, store, docId, sourceMaps);
            return;
        }
        if (handleUpdate(key, docId, cache, store)) {
            term.clear();
            ({ sourceMaps, cache, block } = render(term, store, docId));
            renderSelection(term, store, docId, sourceMaps);
            return;
        }
        term.moveTo(0, 30, key);
        renderSelection(term, store, docId, sourceMaps);
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
            if (one !== 'MOUSE_LEFT_BUTTON_PRESSED') return;
            handleMouse(docId, sourceMaps, evt, cache, store);
            const { txt } = redrawWithSelection(
                block,
                store.getDocSession(docId, store.session).selections,
                store.getState(),
            );
            term.moveTo(0, 2, txt);
            renderSelection(term, store, docId, sourceMaps);
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
        },
    );
});
