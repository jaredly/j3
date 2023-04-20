import { Env } from '../../src/to-ast/library';
import { builtinMap, builtinTree } from '../../src/to-ast/Ctx';
import { getIDB } from '../../src/db/db';
import { addNamespaces, getDefinitions, getNames } from '../../src/db/library';
import { getSandboxes, transact } from '../../src/db/sandbox';
import { HashedTree, addToHashedTree } from '../../src/db/hash-tree';
import * as blake from 'blakejs';
import { Db, initialize } from '../../src/db/tables';

const makeHash = (map: HashedTree['']): string =>
    blake.blake2bHex(JSON.stringify(map));

export const initialData = async () => {
    const db = await getIDB();
    await initialize(db);
    const { names, roots } = await getNames(db);
    const definitions = await getDefinitions(db);
    const sandboxes = await getSandboxes(db);

    const env: Env = {
        builtins: await loadBuiltins(roots, names, db),
        library: {
            definitions,
            history: roots,
            namespaces: names,
            root: roots[0].hash,
        },
    };
    // add back in the builtins
    // hmm do I need a way to ~merge namespaces?
    // yeah I mean we can just turn the namespace back into a tree
    // and then add the tree?
    return { env, sandboxes };
};

async function loadBuiltins(
    roots: { hash: string; date: number }[],
    names: HashedTree,
    db: Db,
) {
    const map = builtinMap();
    const tree = builtinTree();
    const newHashes: HashedTree = {};
    const newRoot = addToHashedTree(
        newHashes,
        tree,
        makeHash,
        roots.length ? { root: roots[0].hash, tree: names } : undefined,
    );
    if (newRoot) {
        console.log('adding roots');
        const root = { hash: newRoot, date: Date.now() / 1000 };
        roots.unshift(root);
        Object.assign(names, newHashes);
        await transact(db, () => addNamespaces(db, newHashes, root));
    }
    return map;
}
