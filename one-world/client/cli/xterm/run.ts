import { run } from '../main';
import { Sess } from '../Sess';
import { MouseEvt, MouseKind } from '../drawToTerminal';
import {
    ABlock,
    aBlockToString,
} from '../../../shared/IR/block-to-attributed-text';

const node = document.createElement('canvas');
document.body.append(node);
node.height = 1600;
node.width = 1600;
node.style.width = node.width / 2 + 'px';
node.style.height = node.height / 2 + 'px';

Object.assign(node.style, { padding: '16px' });
node.oncontextmenu = (evt) => evt.preventDefault();

const keymap: { [key: string]: string } = {
    // '\x1B[1;2A': 'SHIFT_UP',
    // '\x1B[1;2B': 'SHIFT_DOWN',
    // '\x1B[1;2C': 'SHIFT_RIGHT',
    // '\x1B[1;2D': 'SHIFT_LEFT',
    ArrowUp: 'UP',
    ArrowDown: 'DOWN',
    ArrowLeft: 'LEFT',
    ArrowRight: 'RIGHT',
    Enter: 'ENTER',
    Backspace: 'BACKSPACE',
    // '\r': 'ENTER',
    // '\x7F': 'BACKSPACE',
    // '\x1B[3~': 'DELETE',
    // '\x1B': 'ESCAPE',
};

document.addEventListener('keydown', (evt) => {
    let key = keymap[evt.key] ?? evt.key;
    if (evt.ctrlKey) {
        key = 'CTRL_' + key;
    }
    if (evt.shiftKey) {
        key = 'SHIFT_' + key;
    }
    if (evt.altKey) {
        key = 'ALT_' + key;
    }
    if (evt.metaKey) {
        key = 'META_' + key;
    }
    keyListeners.forEach((fn) => fn(key));
});

const evtPos = (evt: MouseEvent) => {
    const box = node.getBoundingClientRect();
    const x = (evt.clientX - box.left) * 2;
    const y = (evt.clientY - box.top) * 2;
    return { x: (x / TEXTW - 2) | 0, y: (y / TEXTH) | 0 };
};

let down = false;

node.onmousedown = (evt) => {
    down = true;
    const { x, y } = evtPos(evt);
    sendMouseEvent('MOUSE_LEFT_BUTTON_PRESSED', {
        x,
        y,
        alt: evt.altKey,
        ctrl: evt.ctrlKey,
        shift: evt.shiftKey,
    });
};

window.onmouseup = (evt) => {
    down = false;
    const { x, y } = evtPos(evt);
    sendMouseEvent('MOUSE_LEFT_BUTTON_RELEASED', {
        x,
        y,
        alt: evt.altKey,
        ctrl: evt.ctrlKey,
        shift: evt.shiftKey,
    });
};
node.onmousemove = (evt) => {
    if (down) {
        const { x, y } = evtPos(evt);
        sendMouseEvent('MOUSE_DRAG', {
            x,
            y,
            alt: evt.altKey,
            ctrl: evt.ctrlKey,
            shift: evt.shiftKey,
        });
    }
    // move
};

const mouseListners: ((which: MouseKind, evt: MouseEvt) => void)[] = [];
const keyListeners: ((key: string) => void)[] = [];

const sendMouseEvent = (which: MouseKind, evt: MouseEvt) =>
    mouseListners.forEach((f) => f(which, evt));

// term.onData((data) => {
//     // console.log('data', JSON.stringify(data));
//     const fmt = /\u001b\[<(\d+);(\d+);(\d+)([Mm])/;
//     const match = data.match(fmt);
//     if (match) {
//         const [_, which, col, row, down] = match;
//         switch (which) {
//             case '0':
//                 return sendMouseEvent(
//                     down === 'M'
//                         ? 'MOUSE_LEFT_BUTTON_PRESSED'
//                         : 'MOUSE_LEFT_BUTTON_RELEASED',
//                     {
//                         x: +col,
//                         y: +row,
//                         alt: false,
//                         ctrl: false,
//                         shift: false,
//                     },
//                 );
//             case '32':
//                 return sendMouseEvent('MOUSE_DRAG', {
//                     x: +col,
//                     y: +row,
//                     alt: false,
//                     ctrl: false,
//                     shift: false,
//                 });
//             case '40': // middle drag
//             case '64': // scroll up
//             case '65':
//                 // scroll down
//                 break;
//         }
//     }
// });
// term.onSelectionChange((what) => {
//     console.log('sel', term.getSelectionPosition());
// });

const key = 'j3:cli:sess';

const readSess = (): Sess => {
    const data = localStorage[key];
    if (!data) {
        return { ssid: 'web' };
    }
    return JSON.parse(data);
};

const writeSess = (s: Sess) => (localStorage[key] = JSON.stringify(s));

let pos: { x: number; y: number } = { x: 1, y: 1 };
const ctx = node.getContext('2d')!;

const fontSize = 30;
// const TEXTW = 5;
// const TEXTH = 12;
ctx.font = `${fontSize}px monospace`;
const sz = ctx.measureText('M');
const TEXTW = sz.width;
const TEXTH = fontSize * 1.5;

const rgb = (color: { r: number; g: number; b: number }) =>
    `rgb(${color.r},${color.g},${color.b})`;

const write = (text: ABlock) => {
    const x0 = pos.x;
    text.forEach((line) => {
        pos.x = x0;
        line.forEach((chunk) => {
            if (chunk.style?.background) {
                const w = ctx.measureText(chunk.text);
                ctx.fillStyle = rgb(chunk.style.background);
                ctx.fillRect(
                    pos.x * TEXTW,
                    (pos.y - 1 / 1.3) * TEXTH,
                    w.width + 1,
                    TEXTH,
                );
            }
            ctx.fillStyle = chunk.style?.color
                ? rgb(chunk.style.color)
                : 'white';
            ctx.fillText(chunk.text, pos.x * TEXTW, pos.y * TEXTH);
            pos.x += chunk.len;
        });
        pos.y++;
    });
    pos.y--;
};

run(
    Object.defineProperties(
        {
            moveTo(x, y, text) {
                pos = { x, y };
                if (text) {
                    write(text);
                } else {
                    ctx.fillStyle = 'white';
                    ctx.fillRect(
                        x * TEXTW,
                        (y - 1 / 1.5) * TEXTH,
                        TEXTW / 10,
                        TEXTH / 1.2,
                    );
                }
            },
            write: (t) => {
                write(t);
            },
            clear: () => {
                ctx.clearRect(0, 0, node.width, node.height);
            },
            height: 0,
            width: 0,
            onKey(fn) {
                keyListeners.push(fn);
                return () => {
                    const idx = keyListeners.indexOf(fn);
                    if (idx !== -1) keyListeners.splice(idx, 1);
                };
            },
            onResize(fn) {
                // ignoreee
                return () => {};
            },
            onMouse(fn) {
                mouseListners.push(fn);
                return () => {
                    const idx = mouseListners.indexOf(fn);
                    if (idx !== -1) mouseListners.splice(idx, 1);
                };
            },
        },
        {
            height: { get: () => (node.height / TEXTH) | 0 },
            width: { get: () => (node.width / TEXTW) | 0 },
        },
    ),
    readSess,
    writeSess,
).then(
    (ok) => {
        console.log('good');
    },
    (err) => {
        console.log('bad', err);
    },
);
