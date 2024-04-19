import { expect, test, describe } from 'bun:test';
import { stateToBootstrapJs } from '../web/ide/ground-up/to-file';
import { writeFileSync } from 'fs';
import { runFixtures } from './runFixtures';

test(
    `checking perf of old vs new parser`,
    async () => {
        await runFixtures([
            {
                id: 0,
                name: 'bootstrap -> self-1',
                file: 'self-1.json',
                evaluator: null,
            },
            {
                id: 1,
                name: 'self-1 -> parse-pre-js',
                file: 'parse-pre-js.json',
                evaluator: [0],
            },
            {
                id: 2,
                name: 'self-1 -> parse-1-args',
                file: 'parse-1-args.json',
                evaluator: [0],
            },
            {
                id: 3,
                name: 'pre-js -> aw-fast',
                file: 'algw-fast.json',
                evaluator: [1],
            },
            {
                id: 4,
                name: 'post-js -> aw-fast',
                file: 'algw-fast.json',
                evaluator: [2],
            },
            {
                id: 5,
                name: 'pre-js[aw-fast] -> thih',
                file: 'thih.json',
                evaluator: [1, 3],
            },
            {
                id: 6,
                name: 'post-js[aw-fast] -> thih',
                file: 'thih.json',
                evaluator: [2, 4],
            },
        ]);
    },
    60 * 1000,
);
