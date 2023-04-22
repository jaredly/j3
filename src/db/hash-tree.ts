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

export const lastName = (name: string) => {
    if (name.endsWith('//')) {
        return '/';
    }
    const parts = name.split('/');
    return parts[parts.length - 1];
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
    prev?: { root: string; tree: HashedTree },
): string | null => {
    const childHashes: HashedTree[''] = prev ? { ...prev.tree[prev.root] } : {};
    let changed = false;
    Object.keys(tree.children)
        .sort()
        .forEach((child) => {
            const hash = addToHashedTree(
                hashedTree,
                tree.children[child],
                makeHash,
                prev && prev.tree[prev.root]
                    ? { root: prev.tree[prev.root][child], tree: prev.tree }
                    : undefined,
            );
            if (hash && childHashes[child] !== hash) {
                childHashes[child] = hash;
                changed = true;
            }
        });
    if (tree.top && childHashes[''] !== tree.top) {
        changed = true;
        childHashes[''] = tree.top;
    }
    if (!changed) {
        return null;
    }
    const hash = makeHash(childHashes);
    hashedTree[hash] = childHashes;
    return hash;
};

export const hashedToFlats = (
    root: string,
    hashed: HashedTree,
): { [hash: string]: string[] } => {
    const flat: { [hash: string]: string[] } = {};
    const traverse = (hash: string, path: string[]) => {
        const tree: Tree = { children: {} };
        Object.keys(hashed[hash]).forEach((name) => {
            if (name === '') {
                const leaf = hashed[hash][name];
                const full = path.join('/');
                if (!flat[leaf]) {
                    flat[leaf] = [full];
                } else {
                    flat[leaf].push(full);
                }
            } else {
                traverse(hashed[hash][name], path.concat([name]));
            }
        });
        return tree;
    };
    traverse(root, []);
    return flat;
};

export const hashedToTree = (root: string, hashed: HashedTree): Tree => {
    const traverse = (hash: string): Tree => {
        const tree: Tree = { children: {} };
        Object.keys(hashed[hash]).forEach((name) => {
            if (name === '') {
                tree.top = hashed[hash][name];
            } else {
                tree.children[name] = traverse(hashed[hash][name]);
            }
        });
        return tree;
    };
    return traverse(root);
};

export const treeToHashedTree = (
    tree: Tree,
    makeHash: MakeHash,
): { root: string; tree: HashedTree } => {
    const hashedTree: HashedTree = {};
    return {
        root: addToHashedTree(hashedTree, tree, makeHash)!,
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
