import { test, expect } from 'bun:test';
import { run } from './main';
import {
    KeyFn,
    MouseEvt,
    MouseFn,
    MouseKind,
    Renderer,
} from './drawToTerminal';
import { newStore } from '../newStore2';
import { ABlock } from '../../shared/IR/block-to-attributed-text';
import { splitGraphemes } from '../../../src/parse/splitGraphemes';
import { Sess } from './Sess';
import { DocSession, PersistedState } from '../../shared/state2';
import { Store } from '../StoreContext2';

type Buffer = {
    rows: string[][];
    width: number;
    pos: { x: number; y: number };
    prints: { block: ABlock; pos: { x: number; y: number } }[];
};

const init = (): Buffer => ({
    rows: [[]],
    width: 0,
    pos: { x: 0, y: 0 },
    prints: [],
});
const moveTo = (buf: Buffer, x: number, y: number) => {
    buf.pos = { x, y };
};
const setWidth = (buf: Buffer, width: number) => {
    if (width <= buf.width) return;
    const extra: string[] = [];
    for (let i = width; i < buf.width; i++) {
        extra.push(' ');
    }
    buf.rows.forEach((row) => {
        row.push(...extra);
    });
};
const setHeight = (buf: Buffer, height: number) => {
    if (height <= buf.rows.length) return;
    const extra: string[] = [];
    for (let i = 0; i < buf.width; i++) {
        extra.push(' ');
    }
    for (let i = buf.rows.length; i < height; i++) {
        buf.rows.push(extra.slice());
    }
};

const write = (buf: Buffer, text: ABlock) => {
    buf.prints.push({ block: text, pos: { ...buf.pos } });
    const lines = text.map((line) => {
        let text: string[] = [];
        // let len = 0
        line.forEach((chunk) => {
            text.push(...splitGraphemes(chunk.text));
            // len += chunk.len
        });
        return text;
    });
    const maxWidth = lines.reduce((m, l) => Math.max(m, l.length), 0);
    setWidth(buf, buf.pos.x + maxWidth);
    setHeight(buf, buf.pos.y + lines.length);
    for (let y = 0; y < lines.length; y++) {
        const ri = buf.pos.y + y;
        const line = lines[y];
        buf.rows[ri].splice(buf.pos.x, line.length, ...line);
    }
    buf.pos.y += lines.length - 1;
    buf.pos.x += lines[lines.length - 1].length;
};

const print = (buf: Buffer) =>
    buf.rows.map((row) => row.join('').trimEnd()).join('\n');
// '\n' +
// JSON.stringify(buf.prints, null, 2);

const testRenderer = (
    { width, height }: { width: number; height: number },
    state?: PersistedState,
    docSess?: DocSession,
) => {
    const keys: KeyFn[] = [];
    const mouse: MouseFn[] = [];
    const buf = init();
    let sess: Sess = { ssid: 'test-sess' };
    if (docSess && state) {
        if (!state._documents[docSess.doc]) {
            throw new Error(`missing doc ${docSess.doc} in state`);
        }
        sess.doc = docSess.doc;
    }

    let store: Store | null = null;

    const term: Renderer = {
        width,
        height,
        drawCursor() {
            // noop
        },
        moveTo(x, y, text) {
            moveTo(buf, x, y);
            if (text) {
                write(buf, text);
            }
        },
        clear() {
            buf.rows = [[]];
            buf.width = 0;
        },
        async init(sess) {
            // hrm
            store = newStore(
                state ?? {
                    _toplevels: {},
                    _documents: {},
                    modules: {},
                    stages: {},
                },
                {
                    onMessage(fn) {
                        //
                    },
                    send(msg) {
                        //
                    },
                    close() {},
                },
                'test-sess',
                (id) => docSess ?? null,
            );
            return store;
        },
        onKey(fn) {
            keys.push(fn);
            return () => keys.splice(keys.indexOf(fn), 1);
        },
        onMouse(fn) {
            mouse.push(fn);
            return () => mouse.splice(mouse.indexOf(fn), 1);
        },
        onResize: () => () => {},
        readSess() {
            return sess;
        },
        spawnWorker(onMessage) {
            return {
                sendMessage(msg) {
                    //
                },
                terminate() {
                    //
                },
            };
        },
        write(text) {
            write(buf, text);
        },
        writeSess(s) {
            sess = s;
        },
    };
    return {
        term,
        print: () => print(buf),
        key(key: string) {
            keys.forEach((fn) => fn(key));
        },
        mouse(which: MouseKind, evt: MouseEvt) {
            mouse.forEach((fn) => fn(which, evt));
        },
        getStore() {
            return store;
        },
    };
};

const wait = (n: number) => new Promise((res) => setTimeout(res, n));

test('basic empty', async () => {
    const renderer = testRenderer({ width: 200, height: 5 });
    run(renderer.term);
    await wait(10);
    expect(renderer.print()).toEqual('\nNew Document');
});

test('basic empty, make doc', async () => {
    const renderer = testRenderer({ width: 200, height: 3 });
    run(renderer.term);
    await wait(10);
    renderer.key('ENTER');
    await wait(100);
    expect(renderer.print()).toMatchSnapshot();
});
