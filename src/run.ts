// ok?
// @ts-ignore
import { parse } from './grammar';

import fs from 'fs';

const [_, __, fname] = process.argv;

if (!fname) {
    console.log(`give me a file`);
    process.exit(1);
}
if (!fs.existsSync(fname)) {
    console.log(`cant fint ${fname}`);
    process.exit(1);
}
console.log(parse(fs.readFileSync(fname, 'utf8')));
