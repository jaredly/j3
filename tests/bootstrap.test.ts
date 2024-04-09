import { expect, test, describe } from 'bun:test';
import { NUIState, RealizedNamespace } from '../web/custom/UIState';
import { stateToBootstrapJs } from '../web/ide/ground-up/to-file';
import { bootstrap } from '../web/ide/ground-up/Evaluators';
import { evaluatorFromText } from '../web/ide/ground-up/loadEv';
import { join } from 'path';
import { writeFileSync } from 'fs';

/*

(1) self-1.json

(2) parse-1-args.json (compiled with 1)

(3) type-args.json (compiled with 2)

(4) parse-1-args.json (compiled with 2 & 3)

(5) type-args.json (compiled with 2 & 3)

(6) algw-subst.json (compiled with 2 & 3)

^ then, we test the various whatsits on ... maybe algw-subst.json?
or thih?

*/

const evaluators: { [key: number]: string } = {};

const fixtures = {
    0: { name: 'bootstrap -> self-1', file: 'self-1.json', evaluator: null },
    1: { name: 'self-1 -> parse-1', file: 'parse-1-args.json', evaluator: [0] },
    2: { name: 'parse-1 -> type-args', file: 'type-args.json', evaluator: [1] },
    3: {
        name: 'parse-1 + type-args -> parse-1',
        file: 'parse-1-args.json',
        evaluator: [1, 2],
    },
    4: {
        name: 'parse-1 (2) + type-args -> type-args',
        file: 'type-args.json',
        evaluator: [3, 2],
    },
    5: {
        name: 'parse-1 + type-args -> algw-subst',
        file: 'algw-subst.json',
        evaluator: [3, 4],
    },
    6: {
        name: 'parse-1 + algw-subst -> algw-subst',
        file: 'algw-subst.json',
        evaluator: [1, 5],
    },
    7: {
        name: 'p1+ta -> algw-subst',
        file: 'algw-subst.json',
        evaluator: [3, 4],
    },
};

test(`run self-1.json`, async () => {
    for (let [id, { name, file, evaluator }] of Object.entries(fixtures)) {
        console.log(`Processing ${id}: ${name}`);
        const state: NUIState = await Bun.file(
            join(__dirname, '../data/tmp/', file),
        ).json();
        const ev =
            evaluator === null
                ? bootstrap
                : evaluatorFromText(
                      `some ev for ${evaluator.join(' ')}`,
                      evaluator.map((id) => evaluators[id]),
                  );

        if (!ev) {
            throw new Error(`couldnt make an evaluator ${id}`);
        }
        let tid;
        Object.keys(state.nsMap).forEach((id) => {
            const ns = state.nsMap[+id] as RealizedNamespace;
            if (typeof ns.plugin === 'string') {
                return;
            } else if (ns.plugin?.id === 'evaluator') {
                tid = ns.top;
            }
        });

        let a = performance.now();
        const result = ev.toFile(state, tid);
        console.log('took ', (performance.now() - a).toFixed(0), 'times');
        // if (Object.keys(result.errors).length) {
        //     throw new Error(JSON.stringify(result.errors));
        // }

        evaluators[+id] = result.js;
        // writeFileSync('./ugh' + id + '.js', result.js);
    }
});
