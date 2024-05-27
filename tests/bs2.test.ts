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
    // Building bootstrap.json
    {
        id: 0,
        name: 'jsbootstrap -> bootstrap',
        file: 'bootstrap.json',
        evaluator: ':javascript:',
    },
    {
        id: 0.01,
        name: 'bootstrap -> test',
        file: 'l1-tests.json',
        evaluator: [0],
    },
    {
        id: 0.1,
        name: 'jsbootstrap -> jcst',
        file: 'jcst.json',
        evaluator: ':javascript:',
    },

    // The bootstrap.json -> self-1 and parse-self
    {
        id: 1,
        name: 'bootstrap -> self-1',
        file: 'self-1.json',
        evaluator: [0],
    },
    {
        id: 1.01,
        name: 'self-1 -> test',
        file: 'l1-tests.json',
        evaluator: [0, 1],
    },
    {
        id: 1.1,
        name: 'bootstrap -> parse-self',
        file: 'parse-self.json',
        evaluator: [0],
    },
    {
        id: 1.11,
        name: 'self-1 + self-parse -> test',
        file: 'l1-tests.json',
        evaluator: [0.1, 1.1, 1],
    },

    // {
    //     id: 1.3,
    //     name: 'bootstrap -> algw-fast',
    //     file: 'algw-fast.json',
    //     evaluator: [0],
    // },

    // The self-1 & parse-self  ==>  self-1 & parse-self
    {
        id: 2,
        name: 'bootstrapped-self -> self-1',
        file: 'self-1.json',
        evaluator: [0.1, 1.1, 1],
    },
    {
        id: 2.1,
        name: 'bootstrapped-self -> parse-self',
        file: 'parse-self.json',
        evaluator: [0.1, 1.1, 1],
    },

    // self-1 & parse-self (faster)  ==>  self-1, parse-self, algw-fast, algw-s2
    {
        id: 3,
        name: 'selfed-self -> self-1',
        file: 'self-1.json',
        evaluator: [0.1, 2.1, 2],
    },
    {
        id: 3.1,
        name: 'selfed-self -> parse-self',
        file: 'parse-self.json',
        evaluator: [0.1, 2.1, 2],
    },
    {
        id: 4,
        name: 'selfed-self -> algw-fast',
        file: 'algw-fast.json',
        evaluator: [0.1, 2.1, 2],
    },
    {
        id: 5,
        name: 'selfed-self+type -> parse-self',
        file: 'parse-self.json',
        evaluator: [0.1, 2.1, 2, 4],
    },
    // algw - simplified version!
    {
        id: 6,
        name: 'selfed-self+type -> algw-s2',
        file: 'algw-s2.json',
        evaluator: [0.1, 2.1, 2, 4],
    },

    // algw-s2
    {
        id: 7,
        name: 'selfed-self+algw -> self-1',
        file: 'self-1.json',
        evaluator: [0.1, 2.1, 2, 6],
    },
    {
        id: 8,
        name: 'selfed-self+algw -> algw-fast',
        file: 'algw-fast.json',
        evaluator: [0.1, 2.1, 2, 6],
    },
    {
        id: 9,
        name: 'selfed-self+algw -> parse-self',
        file: 'parse-self.json',
        evaluator: [0.1, 2.1, 2, 6],
    },
    {
        id: 10,
        name: 'selfed-self+algw -> thih',
        file: 'thih.json',
        evaluator: [0.1, 2.1, 2, 6],
    },

    // hmx lets build it
    {
        id: 11,
        name: 'selfed-self+algw -> hmx',
        file: 'hmx.json',
        evaluator: [0.1, 2.1, 2, 6],
    },
    // hmx now try it out on stuff
    {
        id: 11.1,
        name: 'selfed-self+hmx -> self-1',
        file: 'self-1.json',
        evaluator: [0.1, 2.1, 2, 11],
    },
    {
        id: 11.2,
        name: 'selfed-self+hmx -> algw-fast',
        file: 'algw-fast.json',
        evaluator: [0.1, 2.1, 2, 11],
    },
    {
        id: 11.3,
        name: 'selfed-self+hmx -> parse-self',
        file: 'parse-self.json',
        evaluator: [0.1, 2.1, 2, 11],
    },
    {
        id: 11.4,
        name: 'selfed-self+hmx -> thih',
        file: 'thih.json',
        evaluator: [0.1, 2.1, 2, 11],
    },

    //
    // {
    //     id: 2.1,
    //     name: 'bootstrap + self-1 -> parse-self',
    //     file: 'parse-self.json',
    //     evaluator: [0, 1],
    // },
    // {
    //     id: 3,
    //     name: 'parse-self + self-1 -> parse-self',
    //     file: 'parse-self.json',
    //     evaluator: [2, 1],
    // },
    // {
    //     id: 4,
    //     name: 'parse-self + self-1 -> self-1',
    //     file: 'self-1.json',
    //     evaluator: [2, 1],
    // },
    // {
    //     id: 2.1,
    //     name: 'bootstrap -> parse-self',
    //     file: 'parse-self.json',
    //     evaluator: [0],
    // },

    // {
    //     id: 3,
    //     name: ':bootstrap: -> self-1',
    //     file: 'self-1.json',
    //     evaluator: null,
    // },
    // {
    //     id: 4,
    //     name: 'self-1:b: -> parse-self',
    //     file: 'parse-self.json',
    //     evaluator: [3],
    // },
];

test(`run self-1.json`, async () => {
    await runFixtures(fixtures);
}, 60000);
