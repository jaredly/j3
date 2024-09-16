import { Terminal } from '@xterm/xterm';
// import { createTerminal } from 'terminal-kit';
import { run } from '../main';
import { Sess } from '../Sess';
import ansis from 'ansis';

const node = document.createElement('div');
document.body.append(node);

var term = new Terminal({
    rows: 100,
    cols: 100,
});
term.open(node);

if (!ansis.isSupported()) {
    throw new Error(
        'ansis isnt going to color things, process.env needs to be set up.',
    );
}

term.write('\x1b[6 q');
term.write('\x1b[?1002h');

const key = 'j3:cli:sess';

const readSess = (): Sess => {
    const data = localStorage[key];
    if (!data) {
        return { ssid: 'web' };
    }
    return JSON.parse(data);
};

const writeSess = (s: Sess) => (localStorage[key] = JSON.stringify(s));

ansis.isSupported();

const keymap: { [key: string]: string } = {
    '\x1B[A': 'UP',
    '\x1B[B': 'DOWN',
    '\x1B[D': 'LEFT',
    '\x1B[C': 'RIGHT',
    '\r': 'ENTER',
    '\x1B': 'ESCAPE',
};

run(
    Object.defineProperties(
        {
            moveTo(x, y, text) {
                term.write(`\x1B[${y};${x}H`);
                if (text) {
                    term.write(text);
                }
            },
            write: (t) => {
                term.write(t);
            },
            clear: () => term.write(`\x1B[2J`),
            height: 0,
            width: 0,
            onKey(fn) {
                return term.onKey((key) => {
                    console.log('key', key);
                    fn(keymap[key.key] ?? key.key);
                }).dispose;
            },
            onResize(fn) {
                return term.onResize(fn).dispose;
            },
            onMouse(fn) {
                return () => {};
            },
            // on(evt: 'key' | 'resize' | 'mouse', fn: Function) {
            //     switch (evt) {
            //         case 'key':
            //             term.onKey(evt)
            //     }
            // },
            // off(evt: 'key' | 'resize' | 'mouse', fn: Function) {
            // }
        },
        {
            height: { get: () => term.rows },
            width: { get: () => term.cols },
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
