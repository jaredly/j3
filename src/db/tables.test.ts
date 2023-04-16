// lets go

import { nilt } from '../to-ast/builtins';
import { Library, Sandbox } from '../to-ast/library';
import {
    Flat,
    HashedTree,
    addToHashedTree,
    flatToTree,
    treeToHashedTree,
} from './hash-tree';
import { getDefinitions, getNames } from './library';
import { getMemDb } from './node-db';
import {
    addDefinitions,
    addNamespaces,
    addSandbox,
    getSandboxes,
    transact,
} from './sandbox';
import { createTable, initialize } from './tables';

const genId = () => Math.random().toString(36).slice(2);

it('should initialize and add a sandbox', async () => {
    const mem = await getMemDb();
    await initialize(mem);
    const { meta } = await addSandbox(mem, 'an_id', 'Some Sandbox');
    expect(await getSandboxes(mem)).toEqual([meta]);
});

it('should add some definitions', async () => {
    const mem = await getMemDb();
    await initialize(mem);
    const defs: Library['definitions'] = {
        'some-hash': { type: 'type', value: nilt, originalName: 'nil' },
    };
    await transact(mem, () => addDefinitions(mem, defs));
    expect(await getDefinitions(mem)).toEqual(defs);
});

const flat: Flat = {
    one: 'one-hash',
    'one/three': 'one-three-hash',
    two: 'two-hash',
};

const makeHash = (v: { [key: string]: string }) => {
    const keys = Object.keys(v);
    if (keys.length === 1 && keys[0] === '') {
        return v[''];
    }
    return `{${keys
        .sort()
        .map((k) => `${k}=${v[k]}`)
        .join(';')}}`;
};

it('should add some names', async () => {
    const mem = await getMemDb();
    await initialize(mem);
    const { root, tree } = treeToHashedTree(flatToTree(flat), makeHash);
    const rh = { hash: root, date: 1000 };
    await transact(mem, () => addNamespaces(mem, tree, rh));
    expect(await getNames(mem)).toEqual({ names: tree, roots: [rh] });

    const next: HashedTree = {};
    const nextRoot = addToHashedTree(
        next,
        flatToTree({
            four: 'four-hash',
        }),
        makeHash,
        { root, tree },
    );

    const r2 = { hash: nextRoot, date: 2000 };
    await transact(mem, () => addNamespaces(mem, next, r2));
    expect(await getNames(mem)).toEqual({
        names: { ...tree, ...next },
        roots: [r2, rh],
    });
});

/*

So, basically

we get a db
we initialize it

...

we list the sandboxes

...

we load all the info into a library

...

-> loadLibrary(db)

...

then we need functions for incrementally
updating the library

...

and for updating nodes in a sandbox,
which should be easy.
along with the associated history item.

...


and I think that is about it?

...

how does "undo/redo" play into ... updating nodes in the sandbox?
maybe it just does. yeah that's fine I guess.
do the bulk update, no issues.

*/
