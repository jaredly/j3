import generate from '@babel/generator';
import * as t from '@babel/types';
import { nodeToExpr } from '../src/to-ast/nodeToExpr';
import { addDef } from '../src/to-ast/to-ast';
import { Ctx, nil, noForm } from '../src/to-ast/Ctx';
import { stmtToTs } from '../src/to-ast/to-ts';
import { fromMCST, ListLikeContents, Map } from '../src/types/mcst';
import { EvalCtx, notify, Store, Toplevel, UpdateMap } from './store';
import objectHash from 'object-hash';
import { getType, Report } from '../src/get-type/get-types-new';
import { validateExpr } from '../src/get-type/validate';
import { layout } from './layout';
import { Expr } from '../src/types/ast';
import { Identifier, Loc } from '../src/types/cst';

export const builtins = {
    toString: (t: number | boolean) => t + '',
    debugToString: (t: any) => JSON.stringify(t),
};

export const compile = (store: Store, ectx: EvalCtx) => {
    let { ctx, last, terms, nodes, results } = ectx;
    const root = store.map[store.root].node as ListLikeContents;

    const prevErrors = ectx.report.errors;
    const prevResults = { ...results };

    ectx.report.errors = {};
    const allStyles: Ctx['display'] = {};
    const prevStyles = ctx.display;

    const usedHashes: { [hash: string]: number[] } = {};
    Object.keys(store.map).forEach((ridx) => {
        const idx = +ridx;
        const node = store.map[idx].node;
        if (node.type === 'identifier' && node.hash) {
            if (!usedHashes[node.hash]) {
                usedHashes[node.hash] = [];
            }
            usedHashes[node.hash].push(idx);
        }
    });

    const updateMap: UpdateMap = {};
    const tmpMap: Map = { ...store.map };

    root.values.forEach((idx) => {
        // const map = {...store.map, ...updateMap} as Map;

        if (tmpMap[idx].node.type === 'comment') {
            results[idx] = {
                status: 'success',
                value: undefined,
                code: '// a comment',
                expr: nil,
                display: {},
            };
            return;
        }
        ctx.sym.current = 0;

        const report: Report = { errors: {}, types: {} };
        ctx.errors = report.errors;
        ctx.display = {};

        const res = nodeToExpr(fromMCST(idx, tmpMap), ctx);
        const hash = objectHash(noForm(res));

        layout(idx, 0, tmpMap, ctx.display, true);

        if (last[idx] === hash) {
            const prev = results[idx];
            if (prev.status === 'errors') {
                Object.assign(ectx.report.errors, prev.errors);
            }
            prev.display = ctx.display;
            Object.assign(allStyles, prev.display);
            return;
        }

        const prevHashes = getHashes(nodes[idx]);
        const newHashes = exprHashes(res);
        if (prevHashes && newHashes) {
            // const map: {[prevHash:string]:string} = {}
            // Object.entries(newHashes).forEach(([name, hash]) => {
            //     map[newHashes[name]] = prevHashes[name];
            // })
            Object.entries(prevHashes).forEach(([name, hash]) => {
                const newHash = newHashes[name];
                if (!newHash) {
                    return;
                }
                // These are the idx's of identifiers
                // that use the hash.
                const idxs = usedHashes[hash];
                if (idxs) {
                    idxs.forEach((idx) => {
                        const node = tmpMap[idx].node as Identifier & {
                            loc: Loc;
                        };
                        updateMap[idx] = tmpMap[idx] = {
                            node: { ...node, hash: newHash },
                        };
                    });
                }
            });
        }

        ctx = rmPrevious(ctx, nodes[idx]);

        const _ = getType(res, ctx, report);
        validateExpr(res, ctx, report.errors);

        const hasErrors = Object.keys(report.errors).length > 0;

        Object.assign(ectx.report.errors, report.errors);
        Object.assign(ectx.report.types, report.types);
        Object.assign(allStyles, ctx.display);

        if (hasErrors) {
            // console.log(idx, 'had errors I guess');
            results[idx] = {
                status: 'errors',
                expr: res,
                errors: report.errors,
                display: ctx.display,
            };
            last[idx] = hash;
            return;
        }

        let code = 'failed to generate';
        // try {
        const ts = stmtToTs(res, ctx, 'top');
        code = generate(t.file(t.program([ts]))).code;
        // } catch (err) {
        //     code = `Generation fail ${err.message}`;
        //     //
        // }
        // ok, so the increasing idx's are really coming to haunt me.
        // can I reset them?
        try {
            const fn = new Function(
                '$terms',
                `{${Object.keys(builtins).join(',')}}`,
                'fail',
                code,
            );
            results[idx] = {
                status: 'success',
                value: fn(terms, builtins, (message: string) => {
                    // console.log(`Encountered a compilation failure: `, message);
                    throw new Error(message);
                }),
                code,
                expr: res,
                display: ctx.display,
            };
            last[idx] = hash;
        } catch (err) {
            results[idx] = {
                status: 'failure',
                error: (err as Error).message,
                code,
                expr: res,
                display: ctx.display,
            };
            last[idx] = hash;
            return;
        }
        ctx = addDef(res, ctx);
        if (res.type === 'def') {
            nodes[idx] = {
                type: 'Def',
                node: res.value,
                names: { [res.name]: res.hash },
            };
        }
    });

    const hashUpdates = Object.keys(updateMap);
    if (hashUpdates.length) {
        const map = { ...store.map, ...updateMap };
        const last = store.history.items[store.history.idx];
        if (!last) {
            throw new Error(
                `compile is changing things, but there's no history`,
            );
        }
        hashUpdates.forEach((idx) => {
            last.post[idx] = updateMap[idx];
            if (!last.pre[idx]) {
                last.pre[idx] = store.map[+idx];
            }
            if (updateMap[idx] == null) {
                delete store.map[+idx];
            } else {
                store.map[+idx] = updateMap[idx]!;
            }
        });
    }

    // Now figure out what's changed
    const changed: { [key: number]: true } = {};
    Object.keys(prevErrors).forEach((key) => {
        if (!ectx.report.errors[+key]) {
            changed[+key] = true;
        }
    });
    Object.keys(ectx.report.errors).forEach((key) => {
        if (!prevErrors[+key]) {
            changed[+key] = true;
        }
    });

    Object.keys(prevStyles).forEach((key) => {
        if (allStyles[+key]?.style !== prevStyles[+key]?.style) {
            changed[+key] = true;
        }
    });
    Object.keys(allStyles).forEach((key) => {
        if (allStyles[+key]?.style !== prevStyles[+key]?.style) {
            changed[+key] = true;
        }
    });
    Object.keys(results).forEach((key) => {
        if (results[key] !== prevResults[key]) {
            changed[+key] = true;
        }
    });
    ctx.display = allStyles;

    const keys = Object.keys(changed);
    if (keys.length) {
        notify(
            store,
            keys.map((k) => +k),
        );
    }

    ectx.ctx = ctx;
};

const getHashes = (node?: Toplevel): { [name: string]: string } | null => {
    if (node?.type === 'Def') {
        return node.names;
    }
    if (node?.type === 'Deftype') {
        return node.names;
    }
    return null;
};

const exprHashes = (res: Expr): null | { [name: string]: string } => {
    if (res.type === 'def') {
        return { [res.name]: res.hash };
    }
    return null;
};

const rmPrevious = (ctx: Ctx, node?: EvalCtx['nodes'][0]): Ctx => {
    if (!node) {
        return ctx;
    }
    if (node.type === 'Def') {
        const names = { ...ctx.global.names };
        Object.keys(node.names).forEach((key) => {
            names[key] = names[key].filter((h) => h !== node.names[key]);
        });
        return { ...ctx, global: { ...ctx.global, names } };
    }
    return ctx;
};
