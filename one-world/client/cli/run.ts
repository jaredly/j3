import { openSync, writeSync } from 'fs';
import termkit from 'terminal-kit';
import { run } from './main';
import { Terminal } from './drawToTerminal';

const REDIRECT_OUT = false;
if (REDIRECT_OUT) {
    console.log('redirecting output to cli.log');
    const out = openSync('./cli.log', 'W');
    console.log = (...args) => {
        writeSync(out, JSON.stringify(args) + '\n');
    };
}

// cursor line instead of square
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

const tkTerm = (term: termkit.Terminal): Terminal =>
    Object.defineProperties(
        {
            moveTo: term.moveTo,
            write: term,
            clear: term.clear,
            onKey(fn) {
                term.on('key', fn);
                return () => term.off('key', fn);
            },
            onResize(fn) {
                term.on('resize', fn);
                return () => term.off('key', fn);
            },
            onMouse(fn) {
                term.on('mouse', fn);
                return () => term.off('key', fn);
            },
            height: 0,
            width: 0,
        },
        {
            height: { get: () => term.height },
            width: { get: () => term.width },
        },
    );

getTerm().then((term) => {
    process.on('beforeExit', () => {
        term.grabInput(false);
    });
    term.clear();
    term.grabInput({ mouse: 'drag' });
    run(tkTerm(term)).then(
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
