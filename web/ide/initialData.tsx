import { Env } from '../../src/to-ast/library';
import { builtinMap, builtinTree } from '../../src/to-ast/Ctx';
import { getIDB } from '../../src/db/db';
import { addNamespaces, getDefinitions, getNames } from '../../src/db/library';
import { getSandbox, getSandboxes } from '../../src/db/sandbox';
import { HashedTree, addToHashedTree } from '../../src/db/hash-tree';
import { Db, initialize } from '../../src/db/tables';
import { makeHash } from './makeHash';

export const initialData = async (sandbox: string | null) => {
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
    const meta = sandbox ? sandboxes.find((s) => s.id === sandbox) : null;
    // add back in the builtins
    // hmm do I need a way to ~merge namespaces?
    // yeah I mean we can just turn the namespace back into a tree
    // and then add the tree?
    return {
        env,
        sandboxes,
        db,
        sandbox: meta ? await getSandbox(db, meta) : null,
    };
};

async function loadBuiltins(
    roots: { hash: string; date: number }[],
    names: HashedTree,
    db: Db,
) {
    const map = builtinMap();
    const tree = { children: { builtin: builtinTree() } };
    const newHashes: HashedTree = {};
    const newRoot = addToHashedTree(
        newHashes,
        tree,
        makeHash,
        roots.length ? { root: roots[0].hash, tree: names } : undefined,
    );
    if (newRoot) {
        const root = { hash: newRoot, date: Date.now() / 1000 };
        roots.unshift(root);
        const newOnes: HashedTree = {};
        Object.keys(newHashes).forEach((hash) => {
            if (!names[hash]) {
                newOnes[hash] = names[hash] = newHashes[hash];
            }
        });
        // console.log('adding roots', newHashes, newRoot, roots);
        await db.transact(() => addNamespaces(db, newOnes, root));
    }
    return map;
}
