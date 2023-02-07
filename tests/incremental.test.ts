import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { getType } from '../src/get-type/get-types-new';
import { preprocess } from './preprocess';
import { parse } from '../src/grammar';
import { EvalCtx, initialStore, newEvalCtx, Store } from '../web/store';
import { ListLikeContents, Map, toMCST } from '../src/types/mcst';
import { Identifier, Node } from '../src/types/cst';
import { compile } from '../web/compile';
import { newCtx } from '../src/to-ast/Ctx';

it('ok', () => {});

describe('can we do it? idk', () => {
    const tree = parse('(def x 10) (def y (, x 20)) (defn hi [x] x)');
    const root = {
        type: 'list',
        values: tree,
        loc: { idx: -1, start: 0, end: 0 },
    } satisfies Node;
    const omap: Map = {};
    toMCST(root, omap);

    const ectx = newEvalCtx(newCtx());

    const store = initialStore([]);

    it('innner', () => {
        incrementallyBuildTree(store, omap, ectx, () => {
            root.values.forEach((top) => {
                if (ectx.results[top.loc.idx]) {
                    expect(ectx.results[top.loc.idx].status).toEqual('success');
                }
            });
        });
        expect(store.map).toEqual(omap);
    });

    compile(store, ectx);
    // expect(ectx.results).toEqual({});
    root.values.forEach((top) => {
        it('top ' + top.loc.idx, () => {
            expect(ectx.results[top.loc.idx].status).toEqual('success');
        });
    });
});

export function incrementallyBuildTree(
    store: Store,
    omap: Map,
    ectx: EvalCtx,
    finishedATop?: () => void,
) {
    const path: { idx: number; child: number }[] = [
        {
            idx: -1,
            child: 0,
        },
    ];
    while (path.length) {
        const last = path[path.length - 1];
        const parent = store.map[last.idx] as ListLikeContents;
        const oparent = omap[last.idx] as ListLikeContents;
        const nidx = oparent.values[last.child];
        const next = omap[nidx];
        if (oparent.values.length - 1 > last.child) {
            last.child++;
        } else {
            path.pop();
        }
        if (
            next.type === 'list' ||
            next.type === 'array' ||
            next.type === 'record'
        ) {
            const nchild = { ...next, values: [] };
            store.map[nidx] = nchild;
            path.push({ idx: next.loc.idx, child: 0 });
        } else {
            store.map[nidx] = omap[nidx];
        }
        parent.values.push(nidx);

        compile(store, ectx);

        const display = ectx.ctx.display[nidx];
        if (
            display?.autoComplete &&
            display.autoComplete[0].type === 'replace'
        ) {
            const replace = display.autoComplete[0];
            (store.map[nidx] as Identifier).hash = replace.hash;
        }

        if (path.length === 1 && path[0].idx === -1) {
            // We're (back) at the top level
            finishedATop?.();
        }
    }
}
