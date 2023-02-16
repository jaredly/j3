import {
    EvalCtx,
    initialStore,
    newEvalCtx,
    Store,
    updateStore,
} from '../web/store';
import {
    ListLikeContents,
    Map,
    MNode,
    MNodeExtra,
    toMCST,
} from '../src/types/mcst';
import { Identifier, Node } from '../src/types/cst';
import { compile } from '../web/compile';
import { AutoCompleteReplace, newCtx } from '../src/to-ast/Ctx';
import { matchesType } from '../src/get-type/matchesType';
import { parse } from '../src/grammar';
import { preprocess } from './preprocess';
import { verifyExistingToplevels } from './verifyExistingToplevels';
import { Expr, Type } from '../src/types/ast';
import { transformExpr } from '../src/types/walk-ast';

export const loadIncremental = (
    text: string,
    autoCompleteChoices?: AutoCompleteChoices,
    verify = true,
) => {
    const { root, omap } = getRoot(text);
    const ectx = newEvalCtx(newCtx());
    const store = initialStore([]);
    store.history.items.push(emptyHistoryItem());

    incrementallyBuildTree(
        store,
        omap,
        ectx,
        autoCompleteChoices,
        verify
            ? () => {
                  verifyExistingToplevels(root, ectx);
              }
            : undefined,
    );
    return { store, ectx };
};

export type AutoCompleteChoices = {
    [key: string]: AutoDisambiguation;
};
export type AutoDisambiguation =
    | {
          type: 'local';
          ann?: Type;
      }
    | {
          type: 'global';
          ann?: Type;
      };

export const emptyHistoryItem = () => ({
    post: {},
    postSelection: null,
    pre: {},
    preSelection: null,
});

export const getRoot = (text: string) => {
    const tree = parse(text).map(preprocess);
    const root = {
        type: 'list',
        values: tree,
        loc: { idx: -1, start: 0, end: 0 },
    } satisfies Node;
    const omap: Map = {};
    toMCST(root, omap);
    return { root, omap };
};

export type PathItem = {
    idx: number;
    // If `child` is -1, that means .tannot
    child: number;
};

export function incrementallyBuildTree(
    store: Store,
    omap: Map,
    ectx: EvalCtx,
    autoCompleteChoices?: {
        [key: string]: AutoDisambiguation;
    },
    finishedATop?: () => void,
) {
    const path: PathItem[] = [{ idx: -1, child: 0 }];
    while (path.length) {
        const last = path[path.length - 1];
        let nidx;
        if (last.child === -1) {
            // tannot time
            nidx = omap[last.idx].tannot!;
            if (nidx == null) {
                throw new Error(`no bueno`);
            }
            const next = omap[nidx];
            path.pop();
            addNext(next, nidx);
            store.map[last.idx].tannot = nidx;
        } else {
            const parent = store.map[last.idx] as ListLikeContents;
            const oparent = omap[last.idx] as ListLikeContents;
            nidx = oparent.values[last.child];
            const next = omap[nidx];
            if (oparent.values.length - 1 > last.child) {
                last.child++;
            } else {
                path.pop();
            }
            addNext(next, nidx);
            parent.values.push(nidx);
        }

        compile(store, ectx);

        const display = ectx.ctx.display[nidx];
        if (display?.autoComplete) {
            let matching = display.autoComplete.filter(
                (item) => item.type === 'replace' && item.exact,
            ) as AutoCompleteReplace[];
            if (matching.length === 1) {
                (store.map[nidx] as Identifier).hash = matching[0].hash;
                compile(store, ectx);
            } else if (
                matching.length &&
                autoCompleteChoices &&
                autoCompleteChoices[matching[0].text]
            ) {
                //
                const choice = autoCompleteChoices[matching[0].text];
                if (choice.type === 'global') {
                    matching = matching.filter((m) => !m.hash.startsWith(':'));
                } else {
                    matching = matching.filter((m) => !m.hash.startsWith(':'));
                }
                if (choice.ann) {
                    matching = matching.filter((m) =>
                        matchesType(m.ann, choice.ann!, ectx.ctx, {
                            type: 'blank',
                            loc: {
                                idx: -2,
                                start: 0,
                                end: 0,
                            },
                        }),
                    );
                }
                if (matching.length !== 1) {
                    throw new Error(`No match for autocomplete choice?`);
                }
                (store.map[nidx] as Identifier).hash = matching[0].hash;
                compile(store, ectx);
            }
        }

        walkBackTree(path, nidx, store, ectx);

        if (path.length === 1 && path[0].idx === -1) {
            // We're (back) at the top level
            finishedATop?.();
        }
    }

    function addNext(next: MNode, nidx: number) {
        if (
            next.type === 'list' ||
            next.type === 'array' ||
            next.type === 'record'
        ) {
            const nchild = { ...next, values: [] };
            store.map[nidx] = nchild;
            path.push({ idx: next.loc.idx, child: 0 });
        } else {
            if (next.tannot != null) {
                const nchild = { ...next, tannot: undefined };
                path.push({ idx: next.loc.idx, child: -1 });
                store.map[nidx] = nchild;
            } else {
                store.map[nidx] = next;
            }
        }
    }
}

/**
 * here's waht we do here
 * - [ ] if we're the first of a list, and we're a locked-down fn
 *       we give you some holes!!! (this means that incrementalBuild
 *       needs to know about holes, instead of just appending. Yes.)
 * - [ ] if we're an arg to a function, and that function needs
 *       to be nailed down, check to see if we now have enough
 *       information.
 * - [ ] is that it? 🤔 maybe do some auto-type application
 *       if it's warranted?
 */
export const walkBackTree = (
    path: PathItem[],
    idx: number,
    store: Store,
    ectx: EvalCtx,
) => {
    if (!path.length) return;
    const node = store.map[idx];
    const last = path[path.length - 1];
    if (last.child === -1) {
        return; // idk
    }

    const type = ectx.report.types[idx];
    if (!type || type.type === 'unresolved') {
        console.log('no type', idx, type);
        return;
    }

    const first = path[0].idx;
    const top = ectx.results[first]?.expr;
    if (!top) {
        console.error('no top', first, ectx.nodes);
        return;
    }

    const firstSiblingIdx = (store.map[last.idx] as ListLikeContents).values[0];
    const firstSibling = store.map[firstSiblingIdx];

    const firstAuto = ectx.ctx.display[firstSiblingIdx]?.autoComplete;
    if (!firstAuto) {
        console.log('no auto for', firstSiblingIdx, firstSibling);
        return;
    }

    const exprMap = constructExprMap(top);

    const parent = exprMap[last.idx];
    if (!parent) {
        console.warn('parent not expr?', exprMap, last.idx);
        return;
    }

    // First item, we're doing a function call,
    // so we should ... update holes! and such
    // Or it might be something other than a function call idk
    if (last.child === 0) {
        return;
    }

    if (parent.type === 'apply') {
        // Ok this is the real deal here.
        if (parent.target.type === 'unresolved') {
            const available = firstAuto.filter((item) => {
                return (
                    item.type === 'replace' &&
                    item.ann.type === 'fn' &&
                    item.ann.args.length >= last.child &&
                    matchesType(
                        type,
                        item.ann.args[last.child - 1],
                        ectx.ctx,
                        type.form,
                    )
                );
            }) as AutoCompleteReplace[];
            console.log('available', available);
            if (available.length === 1) {
                updateStore(
                    store,
                    {
                        map: {
                            [firstSiblingIdx]: {
                                ...(store.map[firstSiblingIdx] as Identifier &
                                    MNodeExtra),
                                hash: available[0].hash,
                            },
                        },
                    },
                    [],
                    'update',
                );
                // (store.map[firstSiblingIdx] as Identifier).hash =
                //     available[0].hash;
                // compile(store, ectx);
                return;
            }
        }
    }
    console.log(parent);
};

function constructExprMap(expr: Expr) {
    const exprMap: { [key: number]: Expr } = {};
    transformExpr(
        expr,
        {
            Expr(node, ctx) {
                ctx[node.form.loc.idx] = node;
                return null;
            },
        },
        exprMap,
    );
    return exprMap;
}
