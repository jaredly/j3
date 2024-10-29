import { Terminal } from '@xterm/xterm';
// import { createTerminal } from 'terminal-kit';
import { run } from '../main';
import { Sess } from '../Sess';
import ansis from 'ansis';
import { MouseEvt, MouseKind } from '../drawToTerminal';
import { aBlockToString } from '../../../shared/IR/block-to-attributed-text';
import { init } from '../init';

const node = document.createElement('div');
document.body.append(node);
Object.assign(node.style, {
    padding: '16px',
    // background: 'black',
});
node.oncontextmenu = (evt) => evt.preventDefault();

var term = new Terminal({
    rows: 50,
    cols: 100,
});
term.open(node);

if (!ansis.isSupported()) {
    throw new Error(
        'ansis isnt going to color things, process.env needs to be set up.',
    );
}

// 1000h for just clicks, 1003h for all mouse moves all the time
term.write('\x1B[?1002h\x1B[?1015h\x1B[?1006h');
// Vertical bar cursor
term.write('\x1B[6 q');

const mouseListners: ((which: MouseKind, evt: MouseEvt) => void)[] = [];

const sendMouseEvent = (which: MouseKind, evt: MouseEvt) =>
    mouseListners.forEach((f) => f(which, evt));

term.onData((data) => {
    // console.log('data', JSON.stringify(data));
    const fmt = /\u001b\[<(\d+);(\d+);(\d+)([Mm])/;
    const match = data.match(fmt);
    if (match) {
        const [_, which, col, row, down] = match;
        switch (which) {
            case '0':
                return sendMouseEvent(
                    down === 'M'
                        ? 'MOUSE_LEFT_BUTTON_PRESSED'
                        : 'MOUSE_LEFT_BUTTON_RELEASED',
                    {
                        x: +col,
                        y: +row,
                        alt: false,
                        ctrl: false,
                        shift: false,
                    },
                );
            // click
            // case '2':
            //     // right click
            // case '8':
            //     // middle click
            // case '16':
            //     // ctrl-click
            // case '10':
            //     // alt-right
            //     break
            case '32':
                return sendMouseEvent('MOUSE_DRAG', {
                    x: +col,
                    y: +row,
                    alt: false,
                    ctrl: false,
                    shift: false,
                });
            case '40': // middle drag
            case '64': // scroll up
            case '65':
                // scroll down
                break;
        }
        // console.log(match);
    }
});
// term.onSelectionChange((what) => {
//     console.log('sel', term.getSelectionPosition());
// });

const key = 'j3:cli:sess';

const readSess = (): Sess | null => {
    const data = localStorage[key];
    if (!data) {
        return null;
    }
    return JSON.parse(data);
};

const writeSess = (s: Sess | null) => {
    if (!s) {
        localStorage.removeItem(key);
    } else {
        localStorage[key] = JSON.stringify(s);
    }
};

ansis.isSupported();

const keymap: { [key: string]: string } = {
    '\x1B[1;2A': 'SHIFT_UP',
    '\x1B[1;2B': 'SHIFT_DOWN',
    '\x1B[1;2C': 'SHIFT_RIGHT',
    '\x1B[1;2D': 'SHIFT_LEFT',
    '\x1B[A': 'UP',
    '\x1B[B': 'DOWN',
    '\x1B[D': 'LEFT',
    '\x1B[C': 'RIGHT',
    '\r': 'ENTER',
    '\x7F': 'BACKSPACE',
    '\x1B[3~': 'DELETE',
    '\x1B': 'ESCAPE',
};

run(
    Object.defineProperties(
        {
            docList() {
                throw new Error('not impl');
            },
            loadDoc(id) {
                throw new Error('not impl');
            },
            newDoc(title) {
                throw new Error('not impl');
            },
            drawCursor() {},
            moveTo(x, y, text) {
                term.write(`\x1B[${y};${x}H`);
                if (text) {
                    term.write(
                        aBlockToString(text, true).replaceAll('\n', '\r\n'),
                    );
                }
            },
            write: (t) => {
                term.write(aBlockToString(t, true).replaceAll('\n', '\r\n'));
            },
            clear: () => {
                term.write('\x1b[H\x1b[2J');
                // term.write(`\x1B[2J`)
            },
            height: 0,
            width: 0,
            onKey(fn) {
                return term.onKey((key, evt) => {
                    console.log('key', key);
                    fn(keymap[key.key] ?? key.key);
                }).dispose;
            },
            onResize(fn) {
                return term.onResize(fn).dispose;
            },
            onMouse(fn) {
                mouseListners.push(fn);
                return () => {
                    const idx = mouseListners.indexOf(fn);
                    if (idx !== -1) mouseListners.splice(idx, 1);
                };
            },
            readSess,
            writeSess,
            spawnWorker(onMessage) {
                const worker = self.location
                    ? new Worker('./worker.js')
                    : new Worker('./one-world/client/cli/worker.ts');
                worker.onmessage = (evt) => {
                    onMessage(JSON.parse(evt.data));
                };
                return {
                    sendMessage(msg) {
                        worker.postMessage(JSON.stringify(msg));
                    },
                    terminate() {
                        worker.terminate();
                    },
                };
            },
            init: (sess) => init(sess, writeSess),
        },
        {
            height: { get: () => term.rows },
            width: { get: () => term.cols },
        },
    ),
).then(
    (ok) => {
        console.log('good');
    },
    (err) => {
        console.log('bad', err);
    },
);
