import {
    Errors,
    MyEvalError,
    FullEvalator,
    LocError,
    Produce,
    ProduceItem,
} from './Evaluators';
import { valueToString } from './reduce';
import { findTops } from './findTops';
import { arr, expr, stmt, unwrapArray, wrapArray } from './round-1/parse';
import { sanitize } from './round-1/sanitize';
import { fromMCST } from '../../../src/types/mcst';
import { toJCST } from './round-1/j-cst';
import { FnsEnv, TraceMap, withTracing } from './loadEv';
import { MetaDataMap } from '../../custom/UIState';
import { depSort } from '../../custom/store/depSort';
import { sortTops } from '../../custom/store/sortTops';
import { filterNulls } from '../../custom/reduce';
import { unique } from '../../custom/store/getResults';

/**
 * This is for creating an evaluator out of a sandbox that was compiled
 * to javascript by something other than the `:bootstrap:` evaluator.
 */

type CallingConvention = 'curried' | 'tuple' | 'tuple-nil';

const makeTuple = (values: any[]) => {
    let res = values[values.length - 1];
    for (let i = values.length - 2; i >= 0; i--) {
        res = { type: ',', 0: values[i], 1: res };
    }
    return res;
};

const callFn = (fn: Function, args: any[], convention: CallingConvention) => {
    switch (convention) {
        case 'curried': {
            args.forEach((arg) => {
                fn = fn(arg);
            });
            return fn;
        }
        case 'tuple':
            if (args.length === 1) {
                return fn(args[0]);
            }
            return fn(makeTuple(args));
        case 'tuple-nil':
            return fn(makeTuple(args.concat([{ type: '()' }])));
    }
};

export const fnsEvaluator = (
    id: string,
    data: any,
    envArgs: string,
    san: any,
): FullEvalator<FnsEnv, stmt & { loc: number }, expr> | null => {
    if (
        !data['parse_stmt'] ||
        !data['parse_expr'] ||
        !data['compile'] ||
        !data['compile_stmt']
    ) {
        console.log('NOPE', Object.keys(data));
        return null;
    }
    return {
        id,
        init() {
            return {
                js: [],
                values: {},
                typeCheck: data['env_nil'],
            };
        },

        dependencies(stmt) {
            if (!data['externals_stmt']) {
                return [];
            }
            const deps = unwrapArray<{
                type: ',';
                0: string;
                1: { type: 'value' | 'type' };
                2: number;
            }>(data['externals_stmt'](stmt));
            return deps.map((item) => ({
                name: item[0],
                loc: item[2],
                kind: item[1].type,
            }));
        },

        stmtNames(stmt) {
            if (data['names']) {
                return unwrapArray(
                    data['names'](stmt) as arr<{
                        type: ',';
                        0: string;
                        1: { type: 'value' | 'type' };
                        2: number;
                    }>,
                ).map((res) => ({
                    name: res[0],
                    loc: res[2],
                    kind: res[1].type,
                }));
            }
            return [];
        },

        parse(node, errors) {
            const j = toJCST(node);
            if (!j) return;
            try {
                return data['parse_stmt'](j);
            } catch (err) {
                // This is just looking annoying.
                // errors[node.loc] = [
                //     'ParseStmt failed: ' + (err as Error).message,
                // ];
            }
        },

        parseExpr(node, errors) {
            const j = toJCST(node);
            if (!j) return;
            try {
                return data['parse_expr'](j);
            } catch (err) {
                errors[node.loc] = [
                    'parse-expr failed: ' + (err as Error).message,
                ];
            }
        },

        toFile(state, target) {
            let env = this.init();
            const errors: Errors = {};
            const allNames: { name: string; loc: number }[] = [];
            let ret: null | string = null;
            const tops = findTops(state);
            const sorted = depSort(
                tops
                    .map((top) => {
                        const node = fromMCST(top.top, state.map);
                        if (
                            node.type === 'blank' ||
                            node.type === 'comment-node' ||
                            node.type === 'rich-text'
                        ) {
                            return;
                        }
                        const errs = {};
                        const stmt = this.parse(node, errs);
                        if (!stmt) return;
                        return {
                            id: top.top,
                            top,
                            node,
                            stmt,
                            names: this.stmtNames(stmt),
                            deps: this.dependencies(stmt),
                        };
                    })
                    .filter(filterNulls),
            );

            sorted.forEach((group) => {
                const result = this.addStatements(
                    group.map((g) => g.stmt),
                    env,
                    {},
                    {},
                );
                env = result.env;
                allNames.push(...group.flatMap(({ names }) => names));

                if (
                    group[0].top.top === target &&
                    'js' in result &&
                    typeof result.js === 'string'
                ) {
                    ret = result.js;
                }
            });

            if (target != null && ret == null) {
                throw new Error(`tagtet wasnt a toplevel ${target}`);
            }
            if (ret) {
                env.js.push(`return ${ret}`);
            } else {
                env.js.push(
                    `return {type: 'fns', ${allNames
                        .map(({ name }) => sanitize(name))
                        .sort()
                        .join(', ')}}`,
                );
            }
            return { js: env.js.join('\n'), errors };
        },

        addStatements(stmts, env, meta, trace) {
            const display: { [key: number]: Produce } = {};
            const values: Record<string, any> = {};
            let names:
                | {
                      type: ',,';
                      0: string;
                      1: { type: 'value' | 'type' };
                      2: number;
                  }[]
                | null = null;
            if (data['names']) {
                names = Object.values(stmts).flatMap((stmt) =>
                    unwrapArray(data['names'](stmt)),
                );
            }

            if (data['infer_stmts']) {
                try {
                    const result = data['infer_stmts'](env.typeCheck)(
                        wrapArray(Object.values(stmts)),
                    );
                    if (data['add_stmt']) {
                        env.typeCheck = data['add_stmt'](env.typeCheck)(result);
                    } else {
                        env.typeCheck = result;
                    }
                } catch (err) {
                    console.error(err);
                    const display: Record<number, Produce> = {};
                    const myErr = new MyEvalError(`Type Error`, err as Error);
                    Object.keys(stmts).forEach((k) => (display[+k] = myErr));
                    return { env, display, values };
                }
            }

            Object.entries(stmts).forEach(([id, stmt]) => {
                display[+id] = [];

                if (data['names'] && data['get_type'] && stmt.type === 'sdef') {
                    const names: { type: ','; 0: string; 1: number }[] =
                        unwrapArray(data['names'](stmt));
                    const types: any[] = names.map((name) =>
                        data['get_type'](env.typeCheck)(name[0]),
                    );
                    (display[+id] as any[]).push(
                        ...types.map((type, i) =>
                            type.type === 'some'
                                ? `${names[i][0]}: ${data['type_to_string'](
                                      type[0],
                                  )}`
                                : `No type for ${names[i][0]}`,
                        ),
                    );
                }
            });

            const res = compileStmt(
                data,
                san,
                Object.values(stmts),
                env,
                meta,
                trace,
                names,
            );

            return { env, display, values: res.values, js: res.js };
        },

        setTracing(idx, traceMap, env) {
            if (idx != null) {
                withTracing(traceMap, idx, san, env);
            } else {
                san.$setTracer(null);
            }
        },

        evaluate(expr, env, meta) {
            const mm = prepareMeta(meta, data['parse_version'] === 2);

            let type = null;
            if (data['infer']) {
                type = data['type_to_string'](
                    data['infer'](env.typeCheck)(expr),
                );
            }

            const externals: { type: ','; 0: string; 1: number }[] =
                unwrapArray(data['externals_expr'](expr));
            const { needed, values } = assembleExternals(externals, env, san);

            try {
                const js = data['compile'](expr)(mm);
                const fn = new Function(
                    needed.length
                        ? `{${needed.map(sanitize).join(', ')}}`
                        : '_',
                    'return ' + js,
                );
                try {
                    return fn(values);
                } catch (err) {
                    return `Error ${(err as Error).message} Deps:${needed.join(
                        ',',
                    )}`;
                }
            } catch (err) {
                return `Error ${(err as Error).message} Deps:${needed.join(
                    ',',
                )}`;
            }
        },
    };
};

const compileStmt = (
    data: any,
    san: any,
    stmts: stmt[],
    env: FnsEnv,
    meta: MetaDataMap,
    traceMap: TraceMap,
    names?:
        | null
        | { type: ',,'; 0: string; 1: { type: 'value' | 'type' }; 2: number }[],
) => {
    const mm = prepareMeta(meta, data['parse_version'] === 2);

    const externals: { type: ','; 0: string; 1: number }[] = stmts.flatMap(
        (stmt) => unwrapArray(data['externals_stmt'](stmt)),
    );
    const { needed, values } = assembleExternals(externals, env, san);

    if (stmts.length === 1 && stmts[0].type === 'sexpr') {
        let type = null;
        if (data['infer']) {
            try {
                type = data['type_to_string'](
                    data['infer'](env.typeCheck)(stmts[0][0]),
                );
            } catch (err) {
                console.error(err);
                return {
                    env,
                    display: new MyEvalError(`Type Error`, err as Error),
                    values: {},
                };
            }
        }

        let js;
        try {
            js = data['compile'](stmts[0][0])(mm);
        } catch (err) {
            console.log('error');
            console.error(err);
            return {
                env,
                display: new MyEvalError(`Compilation Error`, err as Error),
                values: {},
            };
        }
        let fn;
        try {
            fn = new Function(
                needed.length ? `{${needed.map(sanitize).join(', ')}}` : '_',
                'return ' + js,
            );
        } catch (err) {
            return {
                env,
                display: `JS Syntax Error: ${
                    (err as Error).message
                }\n${js}\nDeps: ${needed.join(',')}`,
                values: {},
            };
        }
        try {
            if (meta[stmts[0][1]]?.traceTop) {
                withTracing(traceMap, stmts[0][1], san, env);
            }
            const value = fn(values);

            san.$setTracer(null);
            return {
                env,
                display: valueToString(value) + (type ? '\nType: ' + type : ''),
                values: { _: value },
                js,
            };
        } catch (err) {
            const locs: { row: number; col: number }[] = [];
            (err as Error).stack!.replace(
                /<anonymous>:(\d+):(\d+)/g,
                (a, row, col) => {
                    locs.push({ row: +row, col: +col });
                    return '';
                },
            );
            return {
                env,
                display: new LocError(err as Error, fn + ''),
                values: {},
            };
        }
    }

    let js;
    try {
        js = stmts.map((stmt) => data['compile_stmt'](stmt)(mm)).join('\n\n');
    } catch (err) {
        console.error(err);
        return {
            env,
            display: new MyEvalError(`Compilation Error`, err as Error),
            values: {},
        };
    }

    const name = names?.length ? names[0][0] : null;

    try {
        let display = '';
        const fn = new Function(
            needed.length ? `{${needed.map(sanitize).join(', ')}}` : '_',
            `{${js};\n${name ? 'return ' + sanitize(name) : ''}}`,
        );
        let value;
        if (name) {
            try {
                value = fn(values);
            } catch (err) {
                return {
                    env,
                    display: `JS Evaluation Error: ${
                        (err as Error).message
                    }\n${js}\nDeps: ${needed.join(',')}`,
                    values: {},
                };
            }
            env.values[name] = value;
            if (typeof value !== 'function') {
                display = valueToString(value);
            }
        }

        return { env, display, values: name ? { [name]: value } : {}, js };
    } catch (err) {
        return {
            env,
            display: `JS Syntax Error: ${(err as Error).message}\n${js}`,
            values: {},
        };
    }
};

function assembleExternals(
    externals: { type: ','; 0: string; 1: number }[],
    env: FnsEnv,
    san: any,
) {
    const needed = unique(externals.map((ex) => ex[0]));
    const values: Record<string, any> = {};
    needed.forEach((name) => {
        if (env.values[name] == null) {
            console.warn(`Name not defined?`, name);
            if (san[sanitize(name)]) {
                values[sanitize(name)] = san[sanitize(name)];
            }
        } else {
            values[sanitize(name)] = env.values[name];
        }
    });
    return { needed, values };
}

function prepareMeta(meta: MetaDataMap, and_how: boolean) {
    const mm = Object.entries(meta)
        .map(([k, v]) => [+k, v.trace])
        .filter((k) => k[1]);
    return and_how ? { type: ',', 0: mm, 1: false } : mm;
}
