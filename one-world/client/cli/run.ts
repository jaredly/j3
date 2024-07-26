import termkit from 'terminal-kit';
import { matchesSpan } from '../../shared/IR/highlightSpan';
import { Block } from '../../shared/IR/ir-to-blocks';
import { Path, serializePath } from '../../shared/nodes';
import { Store } from '../StoreContext2';
import { handleMovement } from './handleMovement';
import { init } from './init';
import { pickDocument, render, renderSelection } from './render';
import { readSess, writeSess } from './Sess';

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
        if (handleMovement(term, key, docId, cache, sourceMaps, store)) {
            return;
        }
        ({ sourceMaps, cache } = render(term, store, docId));
        renderSelection(term, store, docId, sourceMaps);
    });

    term.on('mouse', (one: string, evt: { x: number; y: number }) => {
        if (one !== 'MOUSE_LEFT_BUTTON_PRESSED') return;
        const found = sourceMaps.find((m) =>
            matchesSpan(evt.x - 1, evt.y - 2, m.shape),
        );
        if (!found) return;
        const top = found.source.top;
        const path: Path = {
            root: cache[top].root,
            children: cache[top].paths[found.source.loc].concat([
                found.source.loc,
            ]),
        };
        store.update({
            type: 'in-session',
            action: { type: 'multi', actions: [] },
            doc: docId,
            selections: [
                {
                    start: {
                        cursor: {
                            type: 'text',
                            end: {
                                index:
                                    found.source.type === 'text'
                                        ? found.source.index
                                        : 0,
                                cursor: 0,
                            },
                        },
                        key: serializePath(path),
                        path,
                    },
                },
            ],
        });
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
