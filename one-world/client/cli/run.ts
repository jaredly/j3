import { existsSync, readFileSync, writeFileSync } from 'fs';
import termkit from 'terminal-kit';
import { splitGraphemes } from '../../../src/parse/splitGraphemes';
import { parse } from '../../boot-ex/format';
import { BlockEntry, blockToText } from '../../shared/IR/block-to-text';
import { matchesSpan } from '../../shared/IR/highlightSpan';
import { Control, IR, nodeToIR } from '../../shared/IR/intermediate';
import {
    Block,
    BlockSource,
    hblock,
    irToBlock,
    line,
    vblock,
} from '../../shared/IR/ir-to-blocks';
import { white } from '../../shared/IR/ir-to-text';
import { LayoutChoices, LayoutCtx, layoutIR } from '../../shared/IR/layout';
import { fromMap, Style } from '../../shared/nodes';
import { Doc, PersistedState } from '../../shared/state';
import { newStore } from '../newStore';
import { Store } from '../StoreContext';
import { colors, termColors } from '../TextEdit/colors';

process.stdout.write('\x1b[6 q');

const term = new Promise<termkit.Terminal>((res, rej) =>
    termkit.getDetectedTerminal((err, term) => (err ? rej(err) : res(term))),
);

// termkit.getDetectedTerminal((err, term) => {
//     if (err) {
//         console.log('Failed to detect terminal');
//         return process.exit(1);
//     }
//     term.clear();

//     // term.moveTo(10, 10)
//     const sb = new termkit.ScreenBuffer({ dst: term });
//     sb.moveTo(10, 10);
//     sb.put({}, 'Hello folks');
//     sb.draw();

//     term.hideCursor(false);
//     // term.grabInput(true);
//     let x = 10;
//     setInterval(() => {
//         x++;
//         // term.moveTo(x, 10);
//         sb.clear();
//         sb.moveTo(x, 10);
//         sb.put({ newLine: true }, 'Hello folks\nand stuff');
//         term.clear();
//         sb.draw();
//         sb.moveTo(x, 10);
//         sb.drawCursor();
//     }, 1000);
// });

const sessFile = './.cli.sess';

type Sess = { ssid: string; doc?: string };

const readSess = (): Sess => {
    if (existsSync(sessFile)) {
        return JSON.parse(readFileSync('./.cli.sess', 'utf-8'));
    }
    return { ssid: 'cli' };
};

const writeSess = (sess: Sess) => writeFileSync(sessFile, JSON.stringify(sess));

const init = async (sess: Sess) => {
    const res = await fetch('http://localhost:8227');
    const state = await res.json();
    // const ssid = 'cli';
    const ws = new WebSocket('ws://localhost:8227/ws?ssid=' + sess.ssid);
    const store = await new Promise<Store>((res, rej) => {
        ws.onerror = (err) => rej(err);
        ws.onopen = () => {
            const f = (msg: MessageEvent<any>) => {
                ws.removeEventListener('message', f);
                const data = JSON.parse(String(msg.data));
                if (data.type !== 'hello') {
                    throw new Error(`first message wasnt hello.`);
                }
                if (data.ssid !== sess.ssid) {
                    sess.ssid = data.ssid;
                    writeSess(sess);
                }
                res(newStore(state, ws, sess.ssid));
            };
            ws.addEventListener('message', f);
        };
    });
    return store;
};

const pickDocument = (store: Store, term: termkit.Terminal) => {
    return new Promise<string>((resolve, reject) => {
        const state = store.getState();
        const ids = Object.keys(state.documents);
        let sel = 0;

        const draw = () => {
            term.clear();
            // sb.clear()
            for (let i = 0; i < ids.length; i++) {
                term.moveTo(0, i);
                if (sel === i) {
                    term.bgGreen(state.documents[ids[i]].title);
                } else {
                    term(state.documents[ids[i]].title);
                }
                // sb.put({})
            }
        };

        const key = (key: string) => {
            if (key === 'ENTER') {
                term.off('key', key);
                return resolve(ids[sel]);
            }
            if (key === 'DOWN') {
                sel = Math.min(sel + 1, ids.length - 1);
            }
            if (key === 'UP') {
                sel = Math.max(0, sel - 1);
            }
            if (key === 'ESCAPE') {
                reject('quit');
            }
            draw();
        };

        term.on('key', key);
        draw();
    });
};

// @ts-ignore
global.localStorage = {};

const drawDocNode = (id: number, doc: Doc, state: PersistedState): Block => {
    const node = doc.nodes[id];
    let top: Block | null = null;
    if (id !== 0) {
        top = drawToplevel(node.toplevel, doc, state);
        return top;
    }
    if (node.children.length) {
        const children = node.children.map((id) => drawDocNode(id, doc, state));
        if (top == null) {
            return children.length === 1 ? children[0] : vblock(children);
        }
        return vblock([top, hblock([line(white(4)), vblock(children)])]);
    }

    return top!;
};

const textLayout = (text: string, firstLine: number, style?: Style) => {
    const lines = text.split('\n');
    const height = lines.length;
    const inlineHeight = 1;
    let inlineWidth = firstLine;
    let maxWidth = 0;
    lines.forEach((line, i) => {
        inlineWidth = splitGraphemes(line).length;
        if (i === 0) inlineWidth += firstLine;
        maxWidth = Math.max(maxWidth, inlineWidth);
    });
    return { height, inlineHeight, inlineWidth, maxWidth };
};

const controlLayout = (control: Control) => {
    let w = 4;
    if (control.type === 'number') {
        w = control.width + 3;
    }
    return { height: 1, inlineHeight: 1, inlineWidth: w, maxWidth: w };
};

type Pos = { x: number; y: number };
const drawToplevel = (id: string, doc: Doc, state: PersistedState) => {
    const top = state.toplevels[id];
    const recNode = fromMap(top.id, top.root, top.nodes);
    const parsed = parse(recNode);

    const irs: Record<number, IR> = {};
    Object.entries(top.nodes).forEach(([id, node]) => {
        irs[+id] = nodeToIR(node, parsed.styles, parsed.layouts, {});
    });

    const ctx: LayoutCtx = {
        maxWidth: 50,
        leftWidth: 20,
        irs,
        layouts: {},
        textLayout,
        controlLayout,
    };

    const choices: LayoutChoices = {};
    const result = layoutIR(0, 0, irs[top.root], choices, ctx);
    ctx.layouts[top.root] = { choices, result };
    const block = irToBlock(irs[top.root], irs, choices, {
        layouts: ctx.layouts,
        space: ' ',
        color: true,
        top: id,
    });

    return block;
};

const resolve = (state: PersistedState, source: BlockSource) => {
    const top = state.toplevels[source.top];
    return top.nodes[source.loc];
};

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

    const ds = store.getDocSession(sess.doc, store.session);

    const doc = store.getState().documents[sess.doc];

    const sourceMaps: BlockEntry[] = [];

    const block = drawDocNode(0, doc, store.getState());
    const txt = blockToText({ x: 0, y: 0, x0: 0 }, block, {
        sourceMaps,
        color: true,
        styles: new Map(),
    });

    const text =
        txt +
        '\n' +
        JSON.stringify(ds.selections) +
        '\n\n' +
        sourceMaps.map((m) => m.shape.start.join(',')).join(' ') +
        '\n\n' +
        blockInfo(block);

    term.moveTo(0, 2, text);

    term.on('key', (key: string) => {
        if (key === 'ESCAPE') {
            return process.exit(0);
        }
        term.clear();
        term.moveTo(0, 2, text);
        term.moveTo(0, 0, 'The key ' + key);
    });
    term.on('mouse', (one: string, evt: { x: number; y: number }) => {
        if (one !== 'MOUSE_LEFT_BUTTON_PRESSED') return;
        const found = sourceMaps.find((m) =>
            matchesSpan(evt.x - 1, evt.y - 2, m.shape),
        );
        if (found) {
            const styles = new Map();
            styles.set(found.source, {
                type: 'full',
                // type: 'sub',
                // start: 4,
                // end: 100,
                color: termColors.highlight,
            });
            const txt = blockToText({ x: 0, y: 0, x0: 0 }, block, {
                color: true,
                // highlight: found.source,
                styles,
            });

            term.clear();
            term.moveTo(0, 2, txt);
            term.moveTo(
                0,
                10,
                `The mouse ${evt.x},${evt.y} ${JSON.stringify(
                    found.source,
                )}\n${JSON.stringify(
                    resolve(store.getState(), found.source),
                )}\n${evt.x},${evt.y}`,
            );
        } else {
            term.clear();
            let res = text;
            // sourceMaps.forEach((which) => {
            //     res = highlightSpan(res, which.shape);
            // });
            term.moveTo(0, 2, res);
            term.moveTo(
                0,
                20,
                `The mouse ${one} ${evt.x},${evt.y} count:${sourceMaps.length}\nMouse ${evt.x},${evt.y}`,
            );
        }
    });

    // // let iv;
    // const sb = new termkit.ScreenBuffer({ dst: term });
    // // let k = 0;
    // term.on('key', (key: string) => {
    //     clearInterval(iv);
    //     if (key === 'ESCAPE') {
    //         term.grabInput(false);
    //         return process.exit(1);
    //     }
    //     console.log('got key...', key);
    //     term.clear();
    //     sb.clear();
    //     sb.moveTo(10, 10);
    //     sb.put({}, `got key... ${key}`);
    //     sb.draw();
    //     // sb.drawCursor();
    //     // sb.moveTo(10, 10);
    //     // sb.drawCursor();
    //     // lol this is maybe too much.
    //     // I'll just use like bgcolor or something to indicate cursor location? idk
    //     // const sels = [
    //     //     { x: 10, y: 10 },
    //     //     { x: 5, y: 10 },
    //     //     { x: 15, y: 10 },
    //     // ];
    //     // let at = 0;
    //     // iv = setInterval(() => {
    //     //     term.moveTo(sels[at].x, sels[at].y);
    //     //     at++;
    //     //     if (at >= sels.length) at = 0;
    //     // }, 200);
    //     // if (k++ > 10) {
    //     //     // term.grabInput(false);
    //     //     process.exit(1);
    //     // }
    // });
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

term.then((term) => {
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
