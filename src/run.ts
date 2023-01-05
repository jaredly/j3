// ok?
// @ts-ignore
import { parse } from './grammar';

import fs from 'fs';

console.log(parse(fs.readFileSync('./examples/conway.clj', 'utf8')));
