import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { NUIState } from '../web/custom/UIState';
import { bootstrap } from '../web/ide/ground-up/Evaluators';

const [_, __, sfile] = process.argv;
const state: NUIState = JSON.parse(readFileSync(sfile, 'utf-8'));

const ev = bootstrap;

const result = ev.toFile(state);
writeFileSync(sfile + '.js', result.js);
