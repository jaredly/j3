import { splitGraphemes } from '../../../src/parse/splitGraphemes';
import { RecNodeT, Nodes, fromRec, NodeID } from '../../shared/cnodes';
import { addUpdate } from '../handleDelete';
import { isTag } from '../handleNav';
import { replaceIn } from '../replaceIn';
import { flatten, flatToUpdateNew } from '../rough';
import { Top, Path, Cursor, lastChild, selStart, pathWithChildren, Update } from '../utils';
import { findParent } from './updaters';

export const tagSetAttributes = (top: Top, path: Path, node: RecNodeT<boolean>, cursor: Cursor) => {
    const tag = top.nodes[lastChild(path)];
    if (tag.type !== 'list' || !isTag(tag.kind)) {
        return;
    }
    let nextLoc = top.nextLoc;
    const nodes: Nodes = {};
    let selPath: NodeID[] = [];

    const root = fromRec(node, nodes, (loc, __, path) => {
        const nl = nextLoc!++ + '';
        if (loc === true) {
            selPath = path.concat([nl]);
        }
        return nl;
    });

    nodes[tag.loc] = { ...tag, kind: { ...tag.kind, attributes: root } };

    return {
        nodes,
        nextLoc: top.nextLoc + 1,
        selection: { start: selStart(pathWithChildren(path, ...selPath), cursor) },
    };
};

export const joinInList = (top: Top, path: Path, child: { loc: NodeID; cursor: Cursor }) => {
    const pnode = top.nodes[lastChild(path)];
    const node = top.nodes[child.loc];
    let flat = flatten(pnode, top, {});
    let fat = flat.indexOf(node);
    if (fat === -1) throw new Error(`node not in flattened`);
    if (fat === 0) throw new Error(`node first in flat, should have been handled`);
    for (; fat > 0 && flat[fat - 1].type === 'smoosh'; fat--);
    const prev = flat[fat - 1];
    flat.splice(fat - 1, 1);
    return flatToUpdateNew(flat, { node, cursor: child.cursor }, { isParent: true, node: pnode, path }, {}, top);
}; // like. now I gotta know who the parent issss
// waittt I can just assert that the relevant thing needs to be in the selection path.
// good deal.

export const disolveSmooshed = (update: Update, top: Top) => {
    // So, we go through anything that has an update...
    Object.keys(update.nodes).forEach((loc) => {
        let node = update.nodes[+loc];
        if (node?.type === 'list' && (node.kind === 'smooshed' || node.kind === 'spaced') && node.children.length === 1) {
            const child = node.children[0];
            if (top.root === node.loc) {
                update.root = child;
            } else {
                const ploc = findParent(update.nodes, node.loc) ?? findParent(top.nodes, node.loc);
                if (ploc == null) {
                    console.warn(`cant collapse smoosh; cant find parent of ${node.loc}`);
                    return;
                }
                const pnode = update.nodes[ploc] ?? top.nodes[ploc];
                const parent = replaceIn(pnode, node.loc, child);
                update.nodes[parent.loc] = parent;
            }
            update.nodes[node.loc] = null;
            update.selection = addUpdate(update.selection, { type: 'unparent', loc: node.loc });
        }
    });
};

export const joinSmooshed = (update: Update, top: Top) => {
    // So, we go through anything that has an update...
    Object.keys(update.nodes).forEach((loc) => {
        let node = update.nodes[+loc];
        if (node?.type === 'list' && node.kind === 'smooshed') {
            for (let i = 1; i < node.children.length; i++) {
                const cloc = node.children[i];
                const ploc = node.children[i - 1];
                const child = update.nodes[cloc] ?? top.nodes[cloc];
                const prev = update.nodes[ploc] ?? top.nodes[ploc];

                if (prev.type === 'id' && child.type === 'id' && (prev.ccls === child.ccls || child.text === '' || prev.text === '')) {
                    // we delete one of these
                    update.nodes[prev.loc] = { ...prev, text: prev.text + child.text, ccls: prev.ccls == null ? child.ccls : prev.ccls };
                    update.nodes[child.loc] = null;

                    const children = node.children.slice();
                    children.splice(i, 1);
                    node = { ...node, children };
                    update.nodes[node.loc] = node;
                    i--;

                    update.selection = addUpdate(update.selection, {
                        type: 'id',
                        from: { loc: cloc, offset: 0 },
                        to: { loc: ploc, offset: splitGraphemes(prev.text).length },
                    });
                }
            }
        }
    });
};

export const rebalanceSmooshed = (update: Update, top: Top) => {
    // So, we go through anything that has an update...
    Object.keys(update.nodes).forEach((loc) => {
        let node = update.nodes[+loc];
        if (node?.type === 'list' && node.kind === 'spaced') {
            for (let i = 0; i < node.children.length; i++) {
                const cloc = node.children[i];
                const child = update.nodes[cloc] ?? top.nodes[cloc];
                // We have a spaces within a spaced. splice grandchildren in
                if (child?.type === 'list' && child.kind === 'spaced') {
                    const children = node.children.slice();
                    children.splice(i, 1, ...child.children);
                    node = { ...node, children };
                    update.nodes[node.loc] = node;
                    i += child.children.length - 1;
                    // remove the thing
                    update.selection = addUpdate(update.selection, { type: 'unparent', loc: cloc });
                }
            }
        }

        if (node?.type === 'list' && node.kind === 'smooshed') {
            for (let i = 0; i < node.children.length; i++) {
                const cloc = node.children[i];
                const child = update.nodes[cloc] ?? top.nodes[cloc];
                if (child?.type === 'list' && child.kind === 'smooshed') {
                    const children = node.children.slice();
                    children.splice(i, 1, ...child.children);
                    node = { ...node, children };
                    update.nodes[node.loc] = node;
                    i += child.children.length - 1;
                    // remove the thing
                    update.selection = addUpdate(update.selection, { type: 'unparent', loc: cloc });
                }
            }
        }
    });
};
