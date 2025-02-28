/*

Ok, so DocumentNode is responsible for
- display
- plugin
- etc.
- metaDataMap
- toplevel
- namespace root
    - I worry this will lead to denormalization issues ... but maybe its fine...
        - if there's an issue, it can be a "highlight that it's different and show a button to either remove this or fix that"


Toplevel
- id
- node map
- next loc (nidx)
- root loc
- docstring loc
-

*/

import objectHash from 'object-hash';
import { Nodes } from './nodes';
import { EvaluatorPath, TS } from './state2';

export type Toplevel = {
    id: string;
    // This is a hash of the object (obvs with the /hash/ zeroed out)
    hash?: string;
    module: string; // an ID, where this toplevel "lives"

    syntax: 'lisp' | 'other'; // whether to use 'spaced' lists, and have ,; separators on lists
    nodes: Nodes;
    root: number;
    nextLoc: number;

    ts: TS;
    auxiliaries: number[];
    // plugin?
    // test?
    testConfig?: {
        plugin: string;
        config: any;
        evaluators: EvaluatorPath[];
    };
};

export const hashToplevel = (top: Toplevel): Toplevel => {
    const hash = objectHash({ ...top, hash: undefined });
    return { ...top, hash };
};

export type Toplevels = Record<string, Toplevel>;
