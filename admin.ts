// Compress...

import { readFileSync, writeFileSync } from 'fs';
import { NUIState } from './web/custom/UIState';

const [_, __, inp, out] = process.argv;

const data: NUIState = JSON.parse(readFileSync(inp, 'utf8'));
data.history = data.history.slice(-500)
writeFileSync(out, JSON.stringify(data));
