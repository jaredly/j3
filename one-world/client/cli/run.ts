import termkit from 'terminal-kit';
import { Block } from '../../shared/IR/ir-to-blocks';
import { handleMouse } from './handleMouse';
import { handleMovement } from './handleMovement';
import { init } from './init';
import { pickDocument, render, renderSelection } from './render';
import { readSess, writeSess } from './Sess';
import { handleUpdate } from './handleUpdate';

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

    let { sourceMaps, cache } = render(term, store, sess.doc);
    renderSelection(term, store, docId, sourceMaps);

    term.on('key', (key: string) => {
        if (key === 'ESCAPE') {
            return process.exit(0);
        }
        if (handleMovement(key, docId, cache, store)) {
            renderSelection(term, store, docId, sourceMaps);
            return;
        }
        if (handleUpdate(key, docId, cache, store)) {
            term.clear()(({ sourceMaps, cache } = render(term, store, docId)));
            renderSelection(term, store, docId, sourceMaps);
            return;
        }
        term.moveTo(0, 30, key);
        // ({ sourceMaps, cache } = render(term, store, docId));
        // renderSelection(term, store, docId, sourceMaps);
    });

    term.on('mouse', (one: string, evt: { x: number; y: number }) => {
        if (one !== 'MOUSE_LEFT_BUTTON_PRESSED') return;
        handleMouse(docId, sourceMaps, evt, cache, store);
        renderSelection(term, store, docId, sourceMaps);
    });
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
