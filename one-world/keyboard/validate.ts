import { childLocs } from '../shared/cnodes';
import { Top, Path, isPunct } from './lisp';
import { TestState } from './lisp.test';

const validatePath = (top: Top, path: Path) => {
    if (path.children.length === 0) {
        throw new Error(`empty path`);
    }
    let parent = top.root;
    for (let i = 0; i < path.children.length; i++) {
        const id = path.children[i];
        if (i === 0) {
            if (id !== parent)
                throw new Error(`first id is not root (${parent}) ${id}`);
            continue;
        }
        const children = childLocs(top.nodes[parent]);
        if (!children.includes(id))
            throw new Error(`child ${id} is not a child of ${parent}`);
        parent = id;
    }
    return true;
};
const validateNextLoc = (top: Top) => {
    Object.keys(top.nodes).forEach((loc) => {
        if (top.nodes[+loc].loc !== +loc) {
            throw new Error(`Node.loc doesn't match key ${+loc}`);
        }
        if (+loc >= top.nextLoc) {
            throw new Error(
                `nextLoc invalid, is ${top.nextLoc}, found ${+loc}`,
            );
        }
    });
};
const validateNodes = (top: Top, id: number) => {
    const node = top.nodes[id];
    if (node.type === 'list' && node.kind === 'smooshed') {
        if (node.children.length < 2) {
            throw new Error(`smooshed list shouldn't have fewer than 2 items`);
        }
        let kinds: ('id' | 'punct' | 'other')[] = [];
        node.children.forEach((cid) => {
            const child = top.nodes[cid];
            if (child.type === 'id') {
                if (child.text === '') {
                    throw new Error(`blank id in smooshed should not be`);
                }
                if (isPunct(child, { type: 'id', end: 0 })) {
                    kinds.push('punct');
                } else {
                    kinds.push('id');
                }
            } else {
                kinds.push('other');
            }

            if (child.type === 'list') {
                if (child.kind === 'smooshed' || child.kind === 'spaced') {
                    throw new Error(
                        `smooshed child cant be spaced or smooshed: ${child.kind}`,
                    );
                }
            }
        });

        kinds.forEach((kind, i) => {
            if (i > 0 && kind !== 'other' && kind === kinds[i - 1]) {
                throw new Error(
                    `Cannot have ${kind} adjacent to itself in smooshed`,
                );
            }
        });
    }
    childLocs(node).forEach((cid) => validateNodes(top, cid));
};
export const validate = (state: TestState) => {
    try {
        validatePath(state.top, state.sel.start.path);
    } catch (err) {
        console.log(state.sel.start.path);
        throw err;
    }
    validateNextLoc(state.top);
    validateNodes(state.top, state.top.root);
};
