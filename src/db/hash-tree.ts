// Doing a thing

export type Flat = { [namespacedName: string]: string };

export type Tree = {
    top?: string;
    children: {
        [key: string]: Tree;
    };
};

export type HashedTree = {
    [hash: string]: { [name: string]: string };
};

export const splitNamespaces = (name: string) => {
    if (name.endsWith('//')) {
        return name.slice(0, -2).split('/').concat(['/']);
    }
    return name.split('/');
};

export const addToTree = (tree: Tree, namespacedName: string, hash: string) => {
    let cn = tree;
    const parts = splitNamespaces(namespacedName);
    parts.forEach((n, i) => {
        if (!cn.children[n]) {
            cn.children[n] = { children: {} };
        }
        cn = cn.children[n];
        if (i >= parts.length - 1) {
            cn.top = hash;
        }
    });
};

export const flatToTree = (flat: Flat): Tree => {
    const tree: Tree = { children: {} };
    Object.keys(flat).forEach((k) => addToTree(tree, k, flat[k]));
    return tree;
};

export type MakeHash = (map: HashedTree['']) => string;

export const addToHashedTree = (
    hashedTree: HashedTree,
    tree: Tree,
    makeHash: MakeHash,
    // pass root to merge with a current root.
    root?: string,
): string => {
    const childHashes: HashedTree[''] = root ? { ...hashedTree[root] } : {};
    Object.keys(tree.children)
        .sort()
        .forEach((child) => {
            const hash = addToHashedTree(
                hashedTree,
                tree.children[child],
                makeHash,
                root ? hashedTree[root][child] : undefined,
            );
            childHashes[child] = hash;
        });
    if (tree.top) {
        childHashes[''] = tree.top;
    }
    const hash = makeHash(childHashes);
    hashedTree[hash] = childHashes;
    return hash;
};

export const treeToHashedTree = (
    tree: Tree,
    makeHash: MakeHash,
): { root: string; tree: HashedTree } => {
    const hashedTree: HashedTree = {};
    return {
        root: addToHashedTree(hashedTree, tree, makeHash),
        tree: hashedTree,
    };
};

export const prune = (hashedTree: HashedTree, root: string) => {
    const pruned: HashedTree = {};
    const add = (root: string) => {
        pruned[root] = hashedTree[root];
        Object.keys(hashedTree[root]).forEach((k) => {
            if (k !== '') {
                add(hashedTree[root][k]);
            }
        });
    };
    add(root);
    return pruned;
};

// export const add
