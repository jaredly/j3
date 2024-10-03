import { openSync, writeSync } from 'fs';
import termkit from 'terminal-kit';
import { run } from './main';
import { Renderer } from './drawToTerminal';
import { readSess, writeSess } from './Sess';
import { aBlockToString } from '../../shared/IR/block-to-attributed-text';
import { init } from './init';

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

const tkTerm = (term: termkit.Terminal): Renderer =>
    Object.defineProperties(
        {
            moveTo(x, y, text) {
                term.moveTo(x, y);
                if (text) {
                    aBlockToString(text, true)
                        .split('\n')
                        .forEach((line, i) => {
                            if (i > 0) {
                                term.moveTo(x, y + i);
                            }
                            term(line);
                        });
                }
            },
            drawCursor() {
                // nvm
            },
            write(text) {
                term(aBlockToString(text, true));
            },
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
            readSess,
            writeSess,
            spawnWorker(onMessage) {
                // const msg: OutgoingMessage = JSON.parse(evt.data);
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
