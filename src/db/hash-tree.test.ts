import {
    Flat,
    HashedTree,
    Tree,
    addToHashedTree,
    flatToTree,
    prune,
    treeToHashedTree,
} from './hash-tree';

// FLAT = name/spaced/names => hashes
// TREE = {name: {children: {spaced: {children: {names: {top: hashes}}}}}}
// HASHTREE = {hash: {name: hash2}, hash2: {spaced: hash3}, hash3: {names: hash4}, hash4: {'': hashes}}

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

const flat: Flat = {
    one: 'one-hash',
    'one/three': 'one-three-hash',
    two: 'two-hash',
};

const tree: Tree = {
    children: {
        one: {
            top: 'one-hash',
            children: {
                three: {
                    top: 'one-three-hash',
                    children: {},
                },
            },
        },
        two: {
            top: 'two-hash',
            children: {},
        },
    },
};

const root = '{one={=one-hash;three=one-three-hash};two=two-hash}';

const hashedTree: HashedTree = {
    'one-three-hash': {
        '': 'one-three-hash',
    },
    '{=one-hash;three=one-three-hash}': {
        '': 'one-hash',
        three: 'one-three-hash',
    },
    'two-hash': { '': 'two-hash' },
    [root]: {
        one: '{=one-hash;three=one-three-hash}',
        two: 'two-hash',
    },
};

// Noww the question is:
// can I Update the Library
// without recomputing a ton of things?
// definitely seems like it ought to be doable.

//k so that's one ns

it('should turn a flat to a hash, and hash the tree', () => {
    expect(flatToTree(flat)).toEqual(tree);
    expect(treeToHashedTree(tree, makeHash)).toEqual({
        root,
        tree: hashedTree,
    });
});

it('should be able to build up too', () => {
    const hashed: HashedTree = {};
    let root = undefined as undefined | string;
    Object.keys(flat).forEach((key) => {
        const tree = flatToTree({ [key]: flat[key] });
        root = addToHashedTree(hashed, tree, makeHash, root);
    });
    expect(prune(hashed, root!)).toEqual(hashedTree);
});
