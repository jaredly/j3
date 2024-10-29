import { run } from '../main';
import { Sess } from '../Sess';
import { MouseEvt, MouseKind } from '../drawToTerminal';
import { ABlock } from '../../../shared/IR/block-to-attributed-text';
import { clearState, init, initLocal } from '../init';
import { PersistedState } from '../../../shared/state2';
import { newStore } from '../../newStore2';

const node = document.createElement('canvas');
document.body.append(node);
node.height = 2000;
node.width = 1600;
node.style.width = node.width / 2 + 'px';
node.style.height = node.height / 2 + 'px';

const addButton = (name: string, action: () => void) => {
    const button = document.createElement('button');
    button.onclick = () => action();
    button.textContent = name;
    document.body.append(button);
};
addButton('Clear Session', () => {
    clearSess();
});

addButton('Clear all', () => {
    clearState();
    clearSess();
});

Object.assign(node.style, { padding: '16px' });
node.oncontextmenu = (evt) => evt.preventDefault();

const keymap: { [key: string]: string } = {
    ArrowUp: 'UP',
    ArrowDown: 'DOWN',
    ArrowLeft: 'LEFT',
    ArrowRight: 'RIGHT',
    Enter: 'ENTER',
    Backspace: 'BACKSPACE',
    Tab: 'TAB',
};

document.addEventListener('keydown', (evt) => {
    let key = keymap[evt.key] ?? evt.key;
    if (['Control', 'Meta', 'Shift', 'Alt'].includes(key)) {
        return;
    }
    if (evt.ctrlKey) {
        key = 'CTRL_' + key.toUpperCase();
    }
    if (
        evt.shiftKey &&
        !'(){}~!@#$%^&*|_+<>?:"'.includes(key) &&
        !key.match(/^[A-Z]$/)
    ) {
        key = 'SHIFT_' + key;
    }
    if (evt.altKey) {
        key = 'ALT_' + key;
    }
    if (evt.metaKey) {
        key = 'META_' + key;
    }
    keyListeners.forEach((fn) => fn(key));
    if (evt.key === 'Tab') {
        evt.preventDefault();
    }
});

const evtPos = (evt: MouseEvent) => {
    const box = node.getBoundingClientRect();
    const x = (evt.clientX - box.left) * 2;
    const y = (evt.clientY - box.top) * 2;
    return { x: (x / TEXTW - 1) | 0, y: (y / TEXTH) | 0 };
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

const key = 'j3:cli:sess';

const readSess = (): Sess | null => {
    const data = localStorage[key];
    if (!data) {
        return null;
    }
    return JSON.parse(data);
};

const writeSess = (s: Sess | null) => {
    if (s == null) {
        delete localStorage[key];
    } else {
        localStorage[key] = JSON.stringify(s);
    }
};
const clearSess = () => localStorage.removeItem(key);

let pos: { x: number; y: number } = { x: 1, y: 1 };
const ctx = node.getContext('2d')!;

const fontSize = 30;
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
            let w;
            if (chunk.style?.background) {
                w = ctx.measureText(chunk.text);
                ctx.fillStyle = rgb(chunk.style.background);
                if (chunk.text === '') {
                    // ctx.fillRect(
                    //     pos.x * TEXTW - TEXTW / 2,
                    //     (pos.y - 1 / 1.3) * TEXTH,
                    //     TEXTW,
                    //     TEXTH,
                    // );
                } else {
                    ctx.fillRect(
                        pos.x * TEXTW,
                        (pos.y - 1 / 1.3) * TEXTH,
                        Math.max(w.width, TEXTW) + 1,
                        TEXTH,
                    );
                }
            }
            if (chunk.style?.fontStyle) {
                ctx.font = `${chunk.style.fontStyle} ${fontSize}px monospace`;
            } else {
                ctx.font = `${fontSize}px monospace`;
            }
            ctx.fillStyle = chunk.style?.color
                ? rgb(chunk.style.color)
                : '#ddd';
            ctx.fillText(chunk.text, pos.x * TEXTW, pos.y * TEXTH);
            if (chunk.style?.textDecoration === 'underline') {
                if (!w) w = ctx.measureText(chunk.text);
                ctx.fillRect(
                    pos.x * TEXTW,
                    pos.y * TEXTH + TEXTH / 8,
                    w.width,
                    2,
                );
            }
            pos.x += chunk.len;
        });
        pos.y++;
    });
    pos.y--;
};

run({
    async docList() {
        const res = await fetch('http://localhost:8227/docs');
        return res.json();
    },
    async newDoc(title) {
        throw new Error('nnot impl');
    },
    async loadDoc(sess) {
        return init(sess, writeSess);
    },
    moveTo(x, y, text) {
        pos = { x, y };
        if (text) {
            write(text);
        }
    },
    drawCursor(color, wide) {
        ctx.fillStyle = color ? rgb(color) : 'white';
        ctx.fillRect(
            pos.x * TEXTW - TEXTW / (wide ? 5 : 20),
            (pos.y - 1 / 1.5) * TEXTH,
            TEXTW / (wide ? 2.5 : 10),
            TEXTH / 1.2,
        );
    },
    write: (t) => {
        write(t);
    },
    clear: () => {
        ctx.clearRect(0, 0, node.width, node.height);
    },
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
    height: (node.height / TEXTH) | 0,
    width: (node.width / TEXTW) | 0,
    // init: (sess) => initLocal(sess),
}).then(
    (ok) => {
        console.log('good');
    },
    (err) => {
        console.log('bad', err);
    },
);
