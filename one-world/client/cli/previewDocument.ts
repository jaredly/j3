import { blockToABlock } from '../../shared/IR/block-to-attributed-text';
import { Block, vblock } from '../../shared/IR/ir-to-blocks';
import { ParseAndEval } from '../../shared/IR/nav';
import { PathRoot } from '../../shared/nodes';
import { getDoc, getTop } from '../../shared/state2';
import { Store } from '../StoreContext2';
import { iterDocNodes, topFromMap } from './docNodeToIR';
import { drawToplevel } from './drawDocNode';
import { calculateIRs, calculateLayouts } from './render';

// TODO NEXT STEP
// refactor this out, so that we can use xtermjs as well
// because that would be super cool
export const previewDocument = (store: Store, docId: string) => {
    const state = store.getState();
    const data: Block[] = [];
    const doc = getDoc(state, docId);

    const pav: ParseAndEval<any> = {};
    iterDocNodes(0, [], doc, (dnode, path) => {
        const toplevel = getTop(state, doc.id, dnode.toplevel);
        const { paths, node } = topFromMap(toplevel);
        pav[dnode.toplevel] = {
            node,
            parseResult: {
                errors: [],
                exports: [],
                layouts: {},
                references: [],
                styles: {},
                tableHeaders: {},
                top: null,
            },
            paths,
        };
    });

    const ds = store.getDocSession(docId, store.session);
    const cache = calculateIRs(doc, state, ds, pav);

    const layoutCache = calculateLayouts(doc, state, 300, cache);

    iterDocNodes(0, [], doc, (dnode, path) => {
        const toplevel = getTop(state, doc.id, dnode.toplevel);
        const root: PathRoot = {
            doc: doc.id,
            ids: path,
            toplevel: dnode.toplevel,
            type: 'doc-node',
        };
        const rendered = drawToplevel(
            dnode.toplevel,
            root,
            toplevel.root,
            cache[dnode.toplevel].irs,
            layoutCache[dnode.toplevel],
            toplevel.nextLoc,
        );
        data.push(rendered);
    });
    return blockToABlock({ x: 0, x0: 0, y: 0 }, vblock(data), {
        color: true,
        styles: {},
    });
};
