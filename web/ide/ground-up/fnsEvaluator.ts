import { fromMCST } from '../../../src/types/mcst';
import { MetaDataMap } from '../../custom/UIState';
import { filterNulls } from '../../custom/old-stuff/filterNulls';
import { plugins } from '../../custom/plugins';
import { workerPlugins } from '../../custom/plugins/worker';
import { depSort } from '../../custom/store/depSort';
import { LocedName } from '../../custom/store/sortTops';
import { unique } from '../../custom/store/unique';
import { Errors, FullEvalator, ProduceItem } from './FullEvalator';
import { valueToNode } from './bootstrap';
import { traceEnv } from './builtins';
import { Env, Expr, Stmt, Type, TypeInfo } from './evaluators/analyze';
import {
    AllNames,
    Analyze,
    Compiler,
    Parser,
    TypeChecker,
} from './evaluators/interface';
import { findTops } from './findTops';
import { FnsEnv, TraceMap, sanitizedEnv, withTracing } from './loadEv';
import { sanitize } from './round-1/sanitize';
import { valueToString } from './valueToString';

/**
 * This is for creating an evaluator out of a sandbox that was compiled
 * to javascript by something other than the `:bootstrap:` evaluator.
 */

export const fnsEvaluator = (
    id: string,
    parser: Parser<Stmt, Expr, any>,
    compiler: Compiler<Stmt, Expr>,
    analyze: undefined | Analyze<Stmt, Expr, Type>,
    typeCheck: undefined | TypeChecker<Env, Stmt, Expr, Type>,
    // san: any,
): FullEvalator<FnsEnv, Stmt, Expr, Env, Type> | null => {
    const san: any = traceEnv();
    return {
        id,
        init() {
            const values = {};
            if (compiler.builtins) {
                const env = new Function(compiler.builtins)();
                Object.assign(values, sanitizedEnv(env), env);
            } else {
                console.warn('No builtins from compiler');
                // console.warn(`using baked-in builtins`);
                // Object.assign(values, sanitizedEnv(builtins()));
            }
            if (compiler.prelude) {
                const total = preludeText(compiler.prelude);
                Object.assign(values, new Function(total)());
            }
            // console.log('doing a values', values);
            return { js: [], values };
        },
        // TODO: allow customization
        valueToString,
        valueToNode,

        compile(expr, typeInfo, meta) {
            return compiler.compileExpr(expr, typeInfo, meta);
        },

        // @ts-ignore
        // _data: data,

        inference: typeCheck,

        analysis: analyze,

        parse(node) {
            return parser.parse(node);
        },

        parseExpr(node) {
            return parser.parseExpr(node);
        },

        toFile(state, target, includePlugins) {
            if (!this.analysis) {
                throw new Error(`toFile requires analysis`);
            }
            let env = this.init();
            env.js.push('const $env = {}');

            if (compiler.builtins) {
                const builtins = new Function(compiler.builtins)();
                env.js.push(
                    `const $builtins = (() => {${compiler.builtins}})();\nObject.assign($env, $builtins);`,
                );
                env.js.push(
                    `const {${Object.keys(builtins)
                        .map((k) => `${JSON.stringify(k)}: ${sanitize(k)}`)
                        .join(', ')}} = $builtins;`,
                );
            }

            if (compiler.prelude) {
                const total = preludeText(compiler.prelude);
                env.js.push(
                    `const $prelude = (() => {${total}})();\nObject.assign($env, $prelude);`,
                );
            }

            const errors: Errors = {};
            const allDeclarations: LocedName[] = [];
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
                        const { stmt } = this.parse(node);
                        if (!stmt) return;
                        return {
                            id: top.top,
                            top,
                            node,
                            stmt,
                            allNames: this.analysis!.allNames(stmt),
                            // names: this.analysis!.names(stmt),
                            // deps: this.analysis!.externalsStmt(stmt),
                        };
                    })
                    .filter(filterNulls),
            );

            const typeEnv = typeCheck?.init();

            sorted.forEach((group) => {
                if (
                    group.length === 1 &&
                    group[0].top.ns.plugin &&
                    includePlugins
                ) {
                    const config = group[0].top.ns.plugin;
                    const plugin = workerPlugins[config.id];
                    if (plugin.compile) {
                        env.js.push(
                            plugin.compile(
                                group[0].node,
                                this,
                                config.options,
                                typeEnv as any,
                            ),
                        );
                        return;
                    }
                }
                if (
                    group.every(
                        (item) =>
                            item.allNames.global.declarations.length === 0,
                    ) &&
                    group[0].top.top !== target
                ) {
                    return;
                }
                const result = this.addStatements(
                    group.map((g) => ({ stmt: g.stmt, names: g.allNames })),
                    env,
                    [], // STOPSHIP hrm
                    {},
                    {},
                    group[0].top.top,
                );
                if (group[0].top.top === target) {
                    if ('js' in result && typeof result.js === 'string') {
                        ret = result.js;
                    } else {
                        console.error(`result for target top doesnt have js`);
                        console.log(result);
                    }
                    return;
                }
                env.js.push((result as any).js);
                env = result.env;
                allDeclarations.push(
                    ...group
                        .flatMap(({ allNames }) => allNames.global.declarations)
                        .filter((n) => n.kind === 'value'),
                );
            });

            if (target != null && ret == null) {
                console.log(
                    target,
                    sorted.filter((t) => t[0].top.top === target),
                );
                debugger;
                throw new Error(`tagtet wasnt a toplevel ${target}`);
            }
            if (ret) {
                env.js.push(`return ${ret}`);
            } else {
                env.js.push(
                    `return {type: 'fns', ${allDeclarations
                        .map(({ name }) => sanitize(name))
                        .sort()
                        .join(', ')}}`,
                );
            }
            return { js: env.js.join('\n'), errors };
        },

        addStatements(
            stmts,
            env,
            typeInfo,
            meta,
            trace,
            top,
            displayResult,
            debugShowJs,
        ) {
            const display: { [key: number]: ProduceItem[] } = {};
            const res = compileStmt({
                compiler,
                san,
                stmts: Object.values(stmts),
                typeInfo,
                env,
                meta,
                traceMap: trace,
                renderValue: displayResult,
                top,
                debugShowJs,
            });

            Object.keys(stmts).forEach((id) => {
                if (display[+id]) {
                    display[+id].push(...res.display);
                } else {
                    display[+id] = res.display;
                }
            });

            return { env, display, values: res.values, js: res.js };
        },

        setTracing(idx, traceMap, env) {
            if (idx != null) {
                withTracing(traceMap, idx, san.$setTracer, env);
            } else {
                san.$setTracer(null);
            }
        },

        evaluate(expr, allNames, typeInfo, env, meta) {
            const mm = prepareMeta(meta);

            const externals =
                allNames.global.usages
                    .filter((n) => n.kind === 'value')
                    .map((n) => n.name) ?? [];
            const { needed, values } = assembleExternals({
                externals,
                env,
                san,
                preludes: compiler.prelude ? Object.keys(compiler.prelude) : [],
            });
            // console.log(`doing evaluate`, needed, values);
            values.$env = {};
            needed.forEach((name) => {
                const got = values[sanitize(name)];
                if (got) {
                    values.$env[name] = got;
                }
            });

            try {
                const js = compiler.compileExpr(expr, typeInfo, meta);
                const fn = new Function(
                    needed.length
                        ? `{${unique(
                              needed.map(sanitize).concat(['$env']),
                          ).join(', ')}}`
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

const compileStmt = ({
    compiler,
    san,
    stmts,
    typeInfo,
    env,
    meta,
    traceMap,
    renderValue = (v) => [valueToString(v)],
    top,
    debugShowJs,
}: {
    compiler: Compiler<Stmt, Expr>;
    san: any;
    stmts: { stmt: Stmt; names?: AllNames }[];
    typeInfo: TypeInfo;
    env: FnsEnv;
    meta: MetaDataMap;
    traceMap: TraceMap;
    renderValue?: (v: any) => ProduceItem[];
    top: number;
    // namedValues?: null | LocedName[],
    debugShowJs?: boolean;
}): {
    env: any;
    display: ProduceItem[];
    values: Record<string, any>;
    js?: string;
} => {
    const externals = stmts
        .flatMap((stmt) => stmt.names?.global.usages ?? [])
        .filter((n) => n.kind === 'value')
        .map((n) => n.name);
    const namedValues = stmts
        .flatMap((s) => s.names?.global.declarations ?? [])
        .filter((n) => n.kind === 'value');
    const { needed, values } = assembleExternals({
        externals,
        env,
        san,
        names: namedValues,
        preludes: compiler.prelude ? Object.keys(compiler.prelude) : [],
    });

    let jss;
    try {
        jss = stmts.map(({ stmt }) =>
            compiler.compileStmt(stmt, typeInfo, meta),
        );
    } catch (err) {
        console.error(err);
        return {
            env,
            display: [
                {
                    type: 'eval',
                    message: `Compilation Error`,
                    inner: (err as Error).message,
                    stack: (err as Error).stack,
                },
            ],
            values: {},
        };
    }
    const js = jss.join('\n\n');

    try {
        let display: ProduceItem[] = [];

        if (debugShowJs) {
            display.push(
                ...jss.map((text) => ({ type: 'pre' as const, text })),
            );
        }

        const fn = new Function(
            needed.length
                ? `{${unique(needed.map(sanitize).concat(['$env'])).join(
                      ', ',
                  )}}`
                : '_',
            `{${
                stmts.length === 1 && !namedValues?.length ? `return ${js}` : js
            };\n${
                namedValues
                    ? 'return {' +
                      namedValues.map(({ name }) => sanitize(name)).join(',') +
                      '}'
                    : ''
            }}`,
        );
        // TODO: only do this if it's actually needed
        values.$env = {};
        needed.forEach((name) => {
            const got = values[sanitize(name)];
            if (got !== undefined) {
                values.$env[name] = got;
            }
        });
        const result_values: { [key: string]: any } = {};
        if (namedValues?.length) {
            let result: { [key: string]: any };
            try {
                result = fn(values);
            } catch (err) {
                // debugger;
                return {
                    env,
                    display: [
                        ...display,
                        {
                            type: 'error',
                            message: `JS Evaluation Error (def): ${
                                (err as Error).message
                            }\n${js}\nDeps: ${needed.join(',')}`,
                        },
                    ],
                    values: {},
                };
            }
            namedValues.forEach(({ name, kind }) => {
                result_values[name] = result[sanitize(name)];
            });
            Object.assign(env.values, result_values);
            display.push(
                ...namedValues
                    .flatMap(({ name }) =>
                        result_values[name] === undefined
                            ? null
                            : typeof result_values[name] !== 'function'
                            ? renderValue(result_values[name])
                            : null,
                    )
                    .filter(filterNulls),
            );
        } else {
            try {
                if (meta[top]?.traceTop) {
                    withTracing(traceMap, top, san.$setTracer, env);
                }
                const result = fn(values);
                if (result && result.$type === 'thunk') {
                    display.push({
                        type: 'trigger',
                        f: (ok) =>
                            result.f(
                                env.values,
                                (produce: ProduceItem[], waiting: boolean) => {
                                    ok(produce, waiting);
                                },
                            ),
                    });
                } else if (result != null) {
                    display.push(...renderValue(result));
                } else {
                    display.push(`<null>`);
                }
            } catch (err) {
                // debugger;
                return {
                    env,
                    display: [
                        ...display,
                        {
                            type: 'error',
                            message: `JS Evaluation Error (expr): ${
                                (err as Error).message
                            }\n${js}\nDeps: ${needed.join(',')}`,
                        },
                        { type: 'pre', text: JSON.stringify(values) },
                    ],
                    values: {},
                };
            }
        }

        return {
            env,
            display,
            values: namedValues?.length ? result_values : {},
            js,
        };
    } catch (err) {
        return {
            env,
            display: [
                `JS Syntax Error: ${(err as Error).message}`,
                'Names: ' + JSON.stringify(namedValues),
                { type: 'pre', text: js },
            ],
            values: {},
        };
    }
};

function preludeText(prelude: Record<string, string>) {
    const text = Object.entries(prelude)
        .map(([name, defn]) => `const ${name} = ${defn};`)
        .join('\n\n');
    const total = text + `\nreturn {${Object.keys(prelude).join(',')}}`;
    return total;
}

function assembleExternals({
    externals,
    env,
    san,
    names,
    preludes,
}: {
    externals: string[];
    env: FnsEnv;
    san: any;
    names?: null | LocedName[];
    preludes: string[];
}) {
    const provided = names?.map((obj) => obj.name) ?? [];
    const needed = unique(
        externals.concat([
            '$trace',
            'jsonify',
            'valueToString',
            // lol HACK HACK would be great to remove.
            // and have the evaluator define what globals needs to
            // be "implicitly required" for evaluation.
            // 'evaluateStmt',
            // 'evaluate',
            ...preludes,
        ]),
    ).filter(
        // Skip recursive self-calls
        (name) => !provided.includes(name),
    );
    // .filter((n) => sanitize(n) === n);
    const values: Record<string, any> = {};
    needed.forEach((name) => {
        const s = name === '$trace' ? '$trace' : sanitize(name);
        if (env.values[name] == null) {
            if (san[s]) {
                values[s] = san[s];
            }
        } else {
            values[s] = env.values[name];
        }
        if (
            values[s] === undefined &&
            name !== 'evaluate' &&
            name !== 'evaluateStmt'
        ) {
            // debugger;
            // console.log(`missing an external!`, name);
        }
    });
    return { needed, values };
}

export function prepareMeta(meta: MetaDataMap) {
    const mm = Object.entries(meta)
        .map(([k, v]) => [+k, v.trace])
        .filter((k) => k[1]);
    return mm;
}
