import { Id, NodeID } from '../../shared/cnodes';
import { flatToUpdateNew } from '../rough';
import { Top, Path, parentPath, lastChild, selStart } from '../utils';

export const setIdText = (top: Top, path: Path, text: string, end: number, ccls?: number) => {
    if (text.length === 0) {
        const ppath = parentPath(path);
        const parent = top.nodes[lastChild(ppath)];
        if (parent?.type === 'list' && parent.kind === 'smooshed') {
            let node = top.nodes[lastChild(path)] as Id<NodeID>;
            node = { ...node, text: '', ccls: undefined };
            return flatToUpdateNew(
                parent.children.map((loc) => (loc === node.loc ? node : top.nodes[loc])),
                { node, cursor: { type: 'id', end: 0 } },
                { isParent: true, node: parent, path: ppath },
                {},
                top,
            );
        }
    }
    const node = top.nodes[lastChild(path)];
    if (node.type !== 'id') return;
    return {
        nodes: { [node.loc]: { ...node, text, ccls: text.length === 0 ? undefined : ccls ?? node.ccls } },
        // tmpText: { [current.node.loc]: text },
        selection: { start: selStart(path, { type: 'id', end }) },
    };
}; // oofs. the horror.
