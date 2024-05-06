import { expect, test, describe } from 'bun:test';
import { stateToBootstrapJs } from '../web/ide/ground-up/to-file';
import { writeFileSync } from 'fs';
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
        name: 'jsbootstrap -> bootstrap',
        file: 'bootstrap.json',
        evaluator: ':javascript:',
    },
    {
        id: 1,
        name: 'bootstrap -> self-1',
        file: 'self-1.json',
        evaluator: [0],
    },
    {
        id: 2,
        name: 'bootstrap + self-1 -> parse-self',
        file: 'parse-self.json',
        evaluator: [0, 1],
    },
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
