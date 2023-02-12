import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { getType } from '../src/get-type/get-types-new';
import { attachAnnotations, preprocess } from './preprocess';
import { parse } from '../src/grammar';
import { EvalCtx, initialStore, newEvalCtx, Store } from '../web/store';
import {
    fromMCST,
    ListLikeContents,
    Map,
    MNode,
    toMCST,
} from '../src/types/mcst';
import { Identifier, Node } from '../src/types/cst';
import { compile } from '../web/compile';
import { AutoCompleteReplace, newCtx } from '../src/to-ast/Ctx';
import { nodeToString } from '../src/to-cst/nodeToString';
import { nodeForExpr } from '../src/to-cst/nodeForExpr';
import { xpath } from '../web/xpath';
import { Type } from '../src/types/ast';
import { matchesType } from '../src/get-type/matchesType';
import { nodeToType } from '../src/to-ast/nodeToType';

it('ok', () => {});

describe('attachAnnotations', () => {
    it('should work', () => {
        const array = parse('[x :int y z :float]')[0] as {
            type: 'array';
            values: Node[];
        };
        const result = attachAnnotations(array.values);
        expect(result).toHaveLength(3);
    });
});

describe('preprocess', () => {
    it('', () => {
        const tree = preprocess(parse('(fn [x :int] 10)')[0]);
        const map: Map = {};
        const root = toMCST(tree, map);
        const args = xpath(map, root, ['1'])!;
        if (args.type === 'array') {
            expect(args.values).toHaveLength(1);
        } else {
            expect(args).toBe('an array');
        }
    });
});

const getRoot = (text: string) => {
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

export type AutoDisambiguation =
    | {
          type: 'local';
          ann?: Type;
      }
    | {
          type: 'global';
          ann?: Type;
      };

const testValid = (
    text: string,
    autoCompleteChoices?: {
        // hmmm, what should I do here?
        // a type signature?
        // for functions, that will work.
        //
        [key: string]: AutoDisambiguation;
    },
) =>
    describe(text, () => {
        const { root, omap } = getRoot(text);
        const ectx = newEvalCtx(newCtx());
        const store = initialStore([]);
        store.history.items.push({
            post: {},
            postSelection: null,
            pre: {},
            preSelection: null,
        });

        it('innner', () => {
            incrementallyBuildTree(
                store,
                omap,
                ectx,
                autoCompleteChoices,
                () => {
                    root.values.forEach((top) => {
                        if (ectx.results[top.loc.idx]) {
                            expect(ectx.results[top.loc.idx].status).toEqual(
                                'success',
                            );
                        }
                    });
                },
            );
        });

        compile(store, ectx);
        root.values.forEach((top) => {
            it('top ' + top.loc.idx, () => {
                const result = ectx.results[top.loc.idx];
                if (result.status === 'errors') {
                    console.error(store.map);
                    console.log(nodeToString(fromMCST(store.root, store.map)));
                    expect(result.errors).toEqual({});
                }
                expect(result.status).toEqual('success');
            });
        });
    });

const parseType = (raw: string) => {
    const ctx = newCtx();
    const node = parse(raw)[0];
    return nodeToType(node, ctx);
};

testValid('(def x 10) (def y (, x 20))');
// So, what do we do here ...
testValid('(defn what [x :int] 100)');
testValid('+', {
    '+': {
        type: 'global',
        ann: parseType('(fn [float float] float)'),
    },
});
// testValid('(+ 1. 2.)');

export function incrementallyBuildTree(
    store: Store,
    omap: Map,
    ectx: EvalCtx,
    autoCompleteChoices?: {
        [key: string]: AutoDisambiguation;
    },
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
