import {
    mkdirSync,
    readFileSync,
    writeFileSync,
    copyFileSync,
    existsSync,
} from 'fs';
import { NUIState } from '../web/custom/UIState';

const files = `
algw-fast.js
algw-fast.json
algw-list.js
algw-s2.clj
algw-s2.js
algw-s2.json
ast.clj
ast.json
bootstrap.clj
bootstrap.js
bootstrap.json
encoding.clj
encoding.js
encoding.json
intro.clj
intro.json
jcst.clj
jcst.js
jcst.json
next.clj
next.json
parse-1-args.clj
parse-1-args.js
parse-1-args.json
parse-self.clj
parse-self.js
parse-self.json
playground.clj
playground.json
self-1.clj
self-1.js
self-1.json
structured-editor.clj
structured-editor.json
thih.clj
thih.js
thih.json
syntax-cheatsheet.json
`
    .trim()
    .split('\n');

mkdirSync(`./web/dist/data/tmp`, { recursive: true });
files.forEach((name) => {
    const dest = `./web/dist/data/tmp/${name}`;
    if (name.endsWith('.json')) {
        const data: NUIState = JSON.parse(
            readFileSync(`./data/tmp/${name}`, 'utf-8'),
        );
        data.history = [];
        writeFileSync(dest, JSON.stringify(data));
    } else {
        copyFileSync(`./data/tmp/${name}`, dest);
    }
});

if (!existsSync('./web/dist/fonts')) {
    mkdirSync('./web/dist/fonts');
    copyFileSync('./web/fonts/prism.css', './web/dist/fonts/prism.css');
    copyFileSync('./web/fonts/prism.js', './web/dist/fonts/prism.js');
    copyFileSync('./web/dist/index.html', './web/dist/200.html');
}
