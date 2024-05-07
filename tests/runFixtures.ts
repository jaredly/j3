import { NUIState, RealizedNamespace } from '../web/custom/UIState';
import { bootstrap } from '../web/ide/ground-up/bootstrap';
import { evaluatorFromText } from '../web/ide/ground-up/loadEv';
import { join } from 'path';
import {
    blankInitialResults,
    getImmediateResults,
} from '../web/custom/store/getImmediateResults';
import { calculateInitialState } from '../web/custom/worker/calculateInitialState';
import { Fixture } from './bootstrap.test';
import { jsEvaluator } from '../web/ide/ground-up/jsEvaluator';

export const runFixtures = async (fixtures: Fixture[]) => {
    const evaluators: { [key: number]: string } = {};

    for (let { id, name, file, evaluator } of fixtures) {
        console.log(`\n[${id}] : ${name}\n`);
        const state: NUIState = await Bun.file(
            join(__dirname, '../data/tmp/', file),
        ).json();
        const ev =
            evaluator === null
                ? bootstrap
                : evaluator === ':javascript:'
                ? jsEvaluator
                : evaluatorFromText(
                      `some ev for ${evaluator.join(' ')}`,
                      evaluator.map((id) => evaluators[id]),
                  );

        if (!ev) {
            throw new Error(
                `couldnt make an evaluator ${id} from ${JSON.stringify(
                    evaluator,
                )}`,
            );
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

        try {
            console.time('toFile');
            const result = ev.toFile(state, tid);
            console.timeEnd('toFile');
            console.log(`js size ${result.js.length}`);
            evaluators[+id] = result.js;
        } catch (err) {
            console.log(`Failed while doing ${id} : ${name}`);
            throw err;
            // no good
        }

        try {
            const results = blankInitialResults();
            console.time('immediate');
            getImmediateResults(state, ev, results);
            console.timeEnd('immediate');
            console.time('worker');
            const worker = calculateInitialState(
                results.nodes,
                ev,
                false,
                false,
            );
            Object.entries(worker.results!.groups).forEach(([key, group]) => {
                if (group.typeFailed) {
                    throw new Error(`group ${key} typeFailed!`);
                }
            });
            Object.entries(worker.results!.tops).forEach(([key, top]) => {
                if (Object.keys(top.errors).length) {
                    throw new Error(`ast errors ${JSON.stringify(top.errors)}`);
                }
                for (let p of top.produce) {
                    if (
                        typeof p !== 'string' &&
                        (p.type === 'withjs' ||
                            p.type === 'error' ||
                            p.type === 'eval')
                    ) {
                        throw new Error(`produce error ${JSON.stringify(p)}`);
                    }
                }
            });
            console.timeEnd('worker');
        } catch (err) {
            console.warn(`worker failed`, (err as Error).message);
            console.error(err);
            throw new Error(`worker failed`);
            break;
        }
        // if (Object.keys(result.errors).length) {
        //     throw new Error(JSON.stringify(result.errors));
        // }
        // writeFileSync('./ugh' + id + '.js', result.js);
    }
};
