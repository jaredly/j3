import { IRSelection } from '../../shared/IR/intermediate';
import { IRCache2, lastChild } from '../../shared/IR/nav';
import { transformIR } from '../../shared/IR/transformIR';
import {
    childLocs,
    fromMap,
    Loc,
    Node,
    Nodes,
    Path,
    PathRoot,
    pathWithChildren,
} from '../../shared/nodes';
import { Doc, DocSelection } from '../../shared/state2';
import { DocumentNode } from '../../shared/state2';
import { Toplevel } from '../../shared/toplevels';

export const iterDocNodes = (
    id: number,
    ids: number[],
    doc: Doc,
    f: (n: DocumentNode, ids: number[]) => void,
) => {
    const node = doc.nodes[id];
    const cids = ids.concat([id]);
    // Skip the top docNode's non-toplevel
    if (node.toplevel !== '') {
        f(node, cids);
    }
    node.children.forEach((id) => iterDocNodes(id, cids, doc, f));
};

export const applySelectionText = <Top>(
    selections: DocSelection[],
    cache: IRCache2<Top>,
) => {
    selections.forEach((sel) => {
        if (sel.type !== 'ir') return;
        if (
            sel.start.cursor.type === 'text' &&
            sel.start.cursor.end.text != null
        ) {
            const irs = { ...cache[sel.start.path.root.toplevel].irs };
            const loc = lastChild(sel.start.path);
            if (loc == null || !irs[loc]) {
                throw new Error(
                    `no what ${loc} : ${irs[loc]} : ${Object.keys(irs)}`,
                );
            }
            const { index, text } = sel.start.cursor.end;
            irs[loc] = transformIR(irs[loc], (ir) => {
                if (ir.type === 'text' && ir.index === index) {
                    return { ...ir, text: text.join('') };
                }
                return null;
            });
            cache[sel.start.path.root.toplevel].irs = irs;
        }
    });
};

export const topFromMap = (top: Toplevel) => {
    const paths: Record<number, number[]> = {};
    const node = fromMap((n) => [[top.id, n]] as Loc, top.root, top.nodes, {
        children: [],
        map: paths,
    });
    return { paths, node };
};

export const iterTopNodes = (
    id: number,
    root: PathRoot,
    nodes: Nodes,
    f: (node: Node, path: Path) => void,
) => {
    const process = (id: number, path: Path) => {
        const self = pathWithChildren(path, id);
        f(nodes[id], self);
        const children = childLocs(nodes[id]);
        children.forEach((child) => process(child, self));
    };
    process(id, { root, children: [] });
};
