// Compress...

import { readFileSync, writeFileSync } from 'fs';
import { NUIState } from '../web/custom/UIState';

let [_, __, ...files] = process.argv;
// if (!out) out = inp;

files.forEach((name) => {
    console.log(`for`, name);
    const data: NUIState = JSON.parse(readFileSync(name, 'utf8'));
    // data.history = data.history.slice(-500);
    data.history = [];
    writeFileSync(name, JSON.stringify(data));
});
