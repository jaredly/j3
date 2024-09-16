import { Terminal } from '@xterm/xterm';
// import { createTerminal } from 'terminal-kit';
import { run } from '../main';

const node = document.createElement('div');
document.body.append(node);

var term = new Terminal();
// term.isTTY = true;
term.open(node);
term.write('Hello from \x1B[1;3;31mxterm.js\x1B[0m $ ');
term.onKey((key) => {
    if (key.key === '\r') {
        term.write('\r\n');
    } else {
        term.write(key.key);
    }
    console.log(key);
});

// run(tk).then(
//     (ok) => {
//         console.log('good');
//     },
//     (err) => {
//         console.log('bad', err);
//     },
// );
