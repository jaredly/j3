import { test } from 'bun:test';
import { runFixtures } from './runFixtures';

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

// parse-1 is being run by ...

// parse-0-selfed
// type-1-cache-3
// ???

export type Fixture = {
    id: number;
    name: string;
    file: string;
    evaluator: null | ':javascript:' | number[];
};

const fixtures: Fixture[] = [
    {
        id: 0,
        name: 'bootstrap -> self-1',
        file: 'self-1.json',
        evaluator: null,
    },
    {
        id: 0.5,
        name: 'self-1 -> parse-self',
        file: 'parse-self.json',
        evaluator: [0],
    },
    {
        id: 1,
        name: 'parse-self -> parse-1-args',
        file: 'parse-1-args.json',
        evaluator: [0.5],
    },
    {
        id: 2,
        name: 'parse-1-args -> algw-fast',
        file: 'algw-fast.json',
        evaluator: [1],
    },
    {
        id: 3,
        name: 'parse+aw -> parse-1-args',
        file: 'parse-1-args.json',
        evaluator: [1, 2],
    },
    {
        id: 4,
        name: 'parse+aw -> algw-fast',
        file: 'algw-fast.json',
        evaluator: [1, 2],
    },
    {
        id: 5,
        name: 'self-1 -> parse-self',
        file: 'parse-self.json',
        evaluator: [0],
    },
    {
        id: 6,
        name: 'parse-self.json -> parse-1-args',
        file: 'parse-1-args.json',
        evaluator: [5],
    },
    {
        id: 7,
        name: 'parse-1-args -> parse-1-args',
        file: 'parse-1-args.json',
        evaluator: [6],
    },
    {
        id: 8,
        name: 'parse-1-args -> algw-fast',
        file: 'algw-fast.json',
        evaluator: [7],
    },
    {
        id: 9,
        name: 'parse-1-args + aw-fast -> algw-fast',
        file: 'algw-fast.json',
        evaluator: [7, 8],
    },

    // {
    //     id: 2,
    //     name: 'parse-1-args -> type-args',
    //     file: 'type-args.json',
    //     evaluator: [1],
    // },
    // {
    //     id: 3,
    //     name: 'parse-1-args + type-args -> parse-1',
    //     file: 'parse-1-args.json',
    //     evaluator: [1, 2],
    // },
    // {
    //     id: 10,
    //     name: 'parse-1-args + type-args -> aw-test',
    //     file: 'aw-test.json',
    //     evaluator: [1, 2],
    // },
    // {
    //     id: 4,
    //     name: 'parse-1-args(2) + type-args -> type-args',
    //     file: 'type-args.json',
    //     evaluator: [3, 2],
    // },
    // {
    //     id: 5,
    //     name: 'parse-1 + type-args -> algw-subst',
    //     file: 'algw-subst-old.json',
    //     evaluator: [3, 4],
    // },
    // {
    //     id: 11,
    //     name: 'parse-1-args(2) + aw-fast -> type-args',
    //     file: 'type-args.json',
    //     evaluator: [3, 5],
    // },

    // {
    //     id: 6,
    //     name: 'parse-1 + algw-subst -> algw-subst',
    //     file: 'algw-subst.json',
    //     evaluator: [3, 5],
    // },
    // { id: 7, name: 'p1+ta -> thih', file: 'thih.json', evaluator: [3, 4] },
    // { id: 8, name: 'p1+as -> thih', file: 'thih.json', evaluator: [3, 5] },
    // {
    //     id: 9,
    //     name: 'parse-1-args(2) + type-args -> algw-subst-old',
    //     file: 'algw-subst-old.json',
    //     evaluator: [3, 2],
    // },
];

test(`run self-1.json`, async () => {
    await runFixtures(fixtures);
}, 60000);
