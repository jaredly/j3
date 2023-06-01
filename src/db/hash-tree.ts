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

export const lastName = (name: string | null) => {
    if (!name) {
        return `no-hash`;
    }
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

export const addToTree = (
    tree: Tree,
    namespacedName: string,
    hash: string | null,
) => {
    let cn = tree;
    const parts = splitNamespaces(namespacedName);
    parts.forEach((n, i) => {
        if (!Object.hasOwn(cn.children, n)) {
            cn.children[n] = { children: {} };
        }
        cn = cn.children[n];
        if (i >= parts.length - 1) {
            if (hash != null) {
                cn.top = hash;
            }
        }
    });
};

export const flatToTree = (flat: Flat): Tree => {
    const tree: Tree = { children: {} };
    Object.keys(flat).forEach((k) => addToTree(tree, k, flat[k]));
    return tree;
};

export type MakeHash = (map: HashedTree['']) => string;

export const findNameSpace = (
    tree: HashedTree,
    root: string,
    ns: string[],
): string | null => {
    if (!ns.length) {
        return root;
    }
    if (!tree[root] || !tree[root][ns[0]]) {
        return null;
    }
    return findNameSpace(tree, tree[root][ns[0]], ns.slice(1));
};

export const mergeTrees = (tree: Tree, old: Tree | null): Tree => {
    if (!old) return tree;
    const children: Tree['children'] = { ...old.children };
    Object.keys(tree.children).forEach((key) => {
        children[key] = mergeTrees(tree.children[key], children[key]);
    });
    return { top: tree.top ?? old.top, children };
};

export const hashedTreeRename = (
    tree: HashedTree,
    root: string,
    from: string[],
    to: string[],
    makeHash: MakeHash,
): null | { root: string; tree: HashedTree } => {
    const nest = hashedToTree(root, tree);
    let base = nest as null | Tree;
    from.slice(0, -1).forEach((name) => {
        if (base) {
            base = base.children[name];
        }
    });
    if (!base) {
        return null;
    }
    const found = base.children[from[from.length - 1]];
    delete base.children[from[from.length - 1]];

    let dest = nest;
    to.slice(0, -1).forEach((name) => {
        if (!dest.children[name]) {
            dest.children[name] = { children: {} };
        }
        dest = dest.children[name];
    });
    const last = to[to.length - 1];
    dest.children[last] = mergeTrees(found, dest.children[last]);
    return treeToHashedTree(nest, makeHash);
};

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
