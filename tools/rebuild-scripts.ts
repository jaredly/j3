// What do we want to build?

import { readFileSync, writeFileSync } from 'fs';
import { NUIState } from '../web/custom/UIState';
import { AnyEnv } from '../web/ide/ground-up/FullEvalator';
import { jsEvaluator } from '../web/ide/ground-up/jsEvaluator';
import { evaluatorFromText } from '../web/ide/ground-up/loadEv';
import { join } from 'path';

// A key premise here is that the evaluator should *not* influence the runtime behavior, only (potentially) the performance.
// with type-classes, that might no longer be the case...

const findSavePlugin = (state: NUIState) => {
    for (let id of Object.keys(state.nsMap)) {
        const ns = state.nsMap[+id];
        if (typeof ns.plugin === 'string') {
            return;
        } else if (ns.plugin?.id === 'evaluator') {
            return { top: ns.top, name: ns.plugin.options };
        }
    }
};

const selfCombo = ['self-1.json', 'parse-self.json', 'jcst.json'];
const toBuild = [
    { file: 'bootstrap.json', ev: ':javascript:' },
    { file: 'jcst.json', ev: ':javascript:' },
    { file: 'self-1.json', ev: 'bootstrap.json' },
    { file: 'parse-self.json', ev: 'bootstrap.json' },
    { file: 'self-1.json', ev: selfCombo, dest: 'self-1.js' },
    { file: 'parse-self.json', ev: selfCombo, dest: 'parse-self.js' },
    { file: 'algw-s2.json', ev: selfCombo, dest: 'algw-s2.js' },
];

// const evCache: {[key: string]: AnyEnv} = {}
const fileCache: { [key: string]: string } = {};

const loadEv = (...ids: string[]) => {
    const key = ids.join(':');
    // if (evCache[key]) return evCache[key]
    if (ids.some((id) => !fileCache[id])) {
        throw new Error(`files not all ready ${key}`);
    }
    const ev = evaluatorFromText(
        `loading ${key}`,
        ids.map((id) => ({ id, text: fileCache[id] })),
    );
    if (!ev) throw new Error(`nop ev ${key}`);
    // evCache[key] = ev
    return ev;
};

const getEvaluators = (builder: (typeof toBuild)[0]['ev']) => {
    if (builder === ':javascript:') {
        return jsEvaluator;
    }
    if (typeof builder === 'string') {
        return loadEv(builder);
    }
    return loadEv(...builder);
};

toBuild.forEach(({ file, ev, dest }) => {
    const evaluator = getEvaluators(ev);
    const source = join(__dirname, '../data/tmp/', file);
    const state: NUIState = JSON.parse(readFileSync(source, 'utf-8'));
    const save = findSavePlugin(state);
    if (!save) {
        throw new Error(`no save ${file}`);
    }

    console.time('toFile ' + file + ' ' + evaluator.id);
    const text = evaluator.toFile(state, save.top);
    console.timeEnd('toFile ' + file + ' ' + evaluator.id);
    if (dest) {
        console.log(`Writing evaluator to ${dest}`);
        writeFileSync(join(__dirname, '../data/tmp', dest), text.js);
    }
    fileCache[file] = text.js;
});
