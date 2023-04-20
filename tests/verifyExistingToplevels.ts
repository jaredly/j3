import { EvalCtx, Store } from '../web/store';
import { fromMCST } from '../src/types/mcst';
import { Node } from '../src/types/cst';
import { nodeToString } from '../src/to-cst/nodeToString';

export function verifyToplevels(
    root: {
        type: 'list';
        values: Node[];
        loc: { idx: number; start: number; end: number };
    },
    ectx: EvalCtx,
    store: Store,
) {
    root.values.forEach((top) => {
        it('top ' + top.loc, () => {
            const result = ectx.results[top.loc];
            if (result.status === 'errors') {
                console.error(store.map);
                console.log(
                    nodeToString(fromMCST(store.root, store.map), ectx.ctx),
                );
                expect(result.errors).toEqual({});
            }
            expect(result.status).toEqual('success');
        });
    });
}
export function verifyExistingToplevels(
    root: {
        type: 'list';
        values: Node[];
        loc: { idx: number; start: number; end: number };
    },
    ectx: EvalCtx,
) {
    root.values.forEach((top) => {
        if (ectx.results[top.loc]) {
            expect(ectx.results[top.loc].status).toEqual('success');
        }
    });
}
