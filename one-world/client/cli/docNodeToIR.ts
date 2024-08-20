import { parse } from '../../boot-ex/format';
import { Evaluator } from '../../boot-ex/types';
import { IRSelection, IR, nodeToIR } from '../../shared/IR/intermediate';
import { IRCache2, lastChild } from '../../shared/IR/nav';
import { transformIR } from '../../shared/IR/transformIR';
import {
    PathRoot,
    fromMap,
    Loc,
    Path,
    pathWithChildren,
    childLocs,
} from '../../shared/nodes';
import { Doc, PersistedState } from '../../shared/state';

export const docNodeToIR = <Top>(
    id: number,
    nodes: number[],
    doc: Doc,
    state: PersistedState,
    cache: IRCache2<Top>,
    ev: Evaluator<Top, any>,
) => {
    const node = doc.nodes[id];
    if (id !== 0) {
        toplevelToIR(
            node.toplevel,
            {
                doc: doc.id,
                ids: nodes.concat([id]),
                toplevel: node.toplevel,
                type: 'doc-node',
            },
            state,
            cache,
            ev,
        );
    }
    if (node.children.length) {
        node.children.forEach((cid) =>
            docNodeToIR(cid, nodes.concat([id]), doc, state, cache, ev),
        );
    }
};

export const applySelectionText = <Top>(
    selections: IRSelection[],
    cache: IRCache2<Top>,
) => {
    selections.forEach((sel) => {
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

const toplevelToIR = <Top>(
    id: string,
    root: PathRoot,
    state: PersistedState,
    cache: IRCache2<Top>,
    ev: Evaluator<Top, any>,
) => {
    const top = state.toplevels[id];
    const paths: Record<number, number[]> = {};
    const recNode = fromMap((n) => [[top.id, n]] as Loc, top.root, top.nodes, {
        children: [],
        map: paths,
    });
    const parsed = ev.parse(recNode);

    const irs: Record<number, IR> = {};

    const process = (id: number, path: Path) => {
        const self = pathWithChildren(path, id);
        irs[id] = nodeToIR(
            top.nodes[id],
            self,
            parsed.styles,
            parsed.layouts,
            {},
        );
        const children = childLocs(top.nodes[id]);
        children.forEach((child) => process(child, self));
    };
    process(top.root, { root, children: [] });
    cache[id] = { irs, paths, root, result: parsed };
};
