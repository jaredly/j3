// https://www.cl.cam.ac.uk/teaching/1415/L28/type-inference.pdf

import { Node } from '../../../src/types/cst';
import { Exp, Type } from './types';

const equal = (left: Type, right: Type): boolean => {
    switch (left.type) {
        case 'var':
            return right.type === 'var' && left.name === right.name;
        case 'concrete':
            return right.type === 'concrete' && left.name === right.name;
        case 'fn':
            return (
                right.type === 'fn' &&
                equal(left.arg, right.arg) &&
                equal(left.body, right.body)
            );
    }
    return false;
};

const unify = (constraints: [Type, Type][]): [string, Type][] => {
    return constraints.flatMap(([left, right]) => {
        if (equal(left, right)) {
            return [];
        }
        if (left.type === 'var') {
            return [[left.name, right]];
        }
        if (right.type === 'var') {
            return [[right.name, left]];
        }
        if (left.type === 'fn' && right.type === 'fn') {
            return unify([
                [left.arg, right.arg],
                [left.body, right.body],
            ]);
        }
        console.log(left, right);
        throw new Error('unable t unifi');
    });
};

type Scheme = {
    vbls: string[];
    body: Type;
};

type Env = { [name: string]: Scheme };

// const J = (m: Exp, env: Env): Type => {
//     if (m.type === 'var') {
//         // umm
//         env[m.name] = { vbls: [], body: { type: 'var', name: 'aaaa' } };
//     }
//     if (m.type === 'app') {
//         const a = J(m.fn, env);
//         const b = J(m.arg, env);
//         const beta: Type = { type: 'var', name: 'aaa' };
//         const subst = unify([[a, { type: 'fn', arg: b, body: beta }]]);
//     }
// };
