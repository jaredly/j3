import { MyEvalError, LocError } from './Evaluators';
import { Errors, FullEvalator, Produce, ProduceItem } from './FullEvalator';
import { valueToString } from './valueToString';
import { findTops } from './findTops';
import { arr, expr, stmt, unwrapArray, wrapArray } from './round-1/parse';
import { sanitize } from './round-1/sanitize';
import { fromMCST } from '../../../src/types/mcst';
import { fromJCST, toJCST } from './round-1/j-cst';
import { FnsEnv, TraceMap, sanitizedEnv, withTracing } from './loadEv';
import { MetaDataMap } from '../../custom/UIState';
import { depSort } from '../../custom/store/depSort';
import { LocedName } from '../../custom/store/sortTops';
import { unique } from '../../custom/store/unique';
import { builtins } from './builtins';
import { filterNulls } from '../../custom/old-stuff/filterNulls';
import { fixDuplicateLocs } from '../../../src/state/fixDuplicateLocs';
import { Analyze, Compiler, Parser, TypeChecker } from './evaluators/interface';
import { add } from '../../custom/worker/add';
import { Env, Expr, Stmt, Type } from './evaluators/analyze';
import { valueToNode } from './bootstrap';

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
    san: any,
): FullEvalator<FnsEnv, Stmt, Expr, Env, Type> | null => {
    return {
        id,
        init() {
            const values = sanitizedEnv(builtins());
            if (compiler.prelude) {
                const total = preludeText(compiler);
                Object.assign(values, new Function(total)());
            }
            // console.log('doing a values', values);
            return { js: [], values };
        },
        // TODO: allow customization
        valueToString,
        valueToNode,

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

        toFile(state, target) {
            if (!this.analysis) {
                throw new Error(`toFile requires analysis`);
            }
            let env = this.init();

            if (compiler.prelude) {
                const total = preludeText(compiler);
                env.js.push(
                    `const $prelude = (() => {${total}})();\nObject.assign($env, $prelude);`,
                );
            }

            const errors: Errors = {};
            const allNames: LocedName[] = [];
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
                            names: this.analysis!.names(stmt),
                            deps: this.analysis!.externalsStmt(stmt),
                        };
                    })
                    .filter(filterNulls),
            );

            sorted.forEach((group) => {
                if (
                    group.every((item) => item.names.length === 0) &&
                    group[0].top.top !== target
                ) {
                    return;
                }
                const result = this.addStatements(
                    group.map((g) => g.stmt),
                    env,
                    {},
                    {},
                    group[0].top.top,
                );
                if (
                    group[0].top.top === target &&
                    'js' in result &&
                    typeof result.js === 'string'
                ) {
                    ret = result.js;
                    return;
                }
                env.js.push((result as any).js);
                env = result.env;
                allNames.push(
                    ...group
                        .flatMap(({ names }) => names)
                        .filter((n) => n.kind === 'value'),
                );
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

        addStatements(
            stmts,
            env,
            meta,
            trace,
            top,
            displayResult,
            debugShowJs,
        ) {
            const display: { [key: number]: ProduceItem[] } = {};
            // const values: Record<string, any> = {};
            let names: LocedName[] | null = null;
            if (analyze) {
                try {
                    names = Object.values(stmts).flatMap((stmt) =>
                        analyze.names(stmt),
                    );
                } catch (err) {
                    console.error(`cant get names`, err);
                    Object.keys(stmts).forEach((k) => {
                        display[+k] = [
                            {
                                type: 'error',
                                message:
                                    'Error while getting stmt names ' +
                                    (err as Error).message,
                            },
                        ];
                    });
                }
            }

            const res = compileStmt(
                compiler,
                analyze,
                san,
                Object.values(stmts),
                env,
                meta,
                trace,
                displayResult,
                top,
                names,
                debugShowJs,
            );

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

        evaluate(expr, env, meta) {
            const mm = prepareMeta(meta);

            const externals =
                analyze
                    ?.externalsExpr(expr)
                    .filter((n) => n.kind === 'value')
                    .map((n) => n.name) ?? [];
            const { needed, values } = assembleExternals(externals, env, san);
            values.$env = env.values;

            try {
                const js = compiler.compileExpr(expr, meta);
                const fn = new Function(
                    needed.length
                        ? `{$env,${needed.map(sanitize).join(', ')}}`
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
    compiler: Compiler<Stmt, Expr>,
    analyzer: undefined | Analyze<Stmt, Expr, Type>,
    san: any,
    stmts: Stmt[],
    env: FnsEnv,
    meta: MetaDataMap,
    traceMap: TraceMap,
    renderValue: (v: any) => ProduceItem[] = (v) => [valueToString(v)],
    top: number,
    names?: null | LocedName[],
    debugShowJs?: boolean,
): {
    env: any;
    display: ProduceItem[];
    values: Record<string, any>;
    js?: string;
} => {
    let externals: string[] = [];
    if (analyzer) {
        try {
            externals = stmts
                .flatMap((stmt) => analyzer.externalsStmt(stmt))
                .filter((n) => n.kind === 'value')
                .map((n) => n.name);
        } catch (err) {
            console.error('Unable to calculate externals');
            console.error(err);
        }
    }
    const { needed, values } = assembleExternals(externals, env, san, names);

    let jss;
    try {
        jss = stmts.map((stmt) => compiler.compileStmt(stmt, meta));
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
        const fn = new Function(
            needed.length
                ? `{${needed.map(sanitize).concat(['$env']).join(', ')}}`
                : '_',
            `{${stmts.length === 1 && !names?.length ? `return ${js}` : js};\n${
                names
                    ? 'return {' +
                      names
                          .filter((n) => n.kind === 'value')
                          .map(({ name }) => sanitize(name))
                          .join(',') +
                      '}'
                    : ''
            }}`,
        );
        values.$env = env.values;
        const result_values: { [key: string]: any } = {};
        if (names?.length) {
            let result: { [key: string]: any };
            try {
                result = fn(values);
            } catch (err) {
                // debugger;
                return {
                    env,
                    display: [
                        {
                            type: 'error',
                            message: `JS Evaluation Error: ${
                                (err as Error).message
                            }\n${js}\nDeps: ${needed.join(',')}`,
                        },
                    ],
                    values: {},
                };
            }
            names.forEach(({ name }) => {
                result_values[name] = result[sanitize(name)];
            });
            Object.assign(env.values, result_values);
            display = names
                .flatMap(({ name }) =>
                    result_values[name] === undefined
                        ? null
                        : typeof result_values[name] !== 'function'
                        ? renderValue(result_values[name])
                        : null,
                )
                .filter(filterNulls);
        } else {
            try {
                if (meta[top]?.traceTop) {
                    withTracing(traceMap, top, san.$setTracer, env);
                }
                const result = fn(values);
                if (result != null) {
                    display.push(...renderValue(result));
                } else {
                    display.push(`<null>`);
                }
            } catch (err) {
                return {
                    env,
                    display: [
                        {
                            type: 'error',
                            message: `JS Evaluation Error: ${
                                (err as Error).message
                            }\n${js}\nDeps: ${needed.join(',')}`,
                        },
                    ],
                    values: {},
                };
            }
        }
        // display += '\n' + fn;
        if (debugShowJs) {
            display.push(
                ...jss.map((text) => ({ type: 'pre' as const, text })),
            );
        }

        return { env, display, values: names?.length ? result_values : {}, js };
    } catch (err) {
        return {
            env,
            display: [
                `JS Syntax Error: ${(err as Error).message}\n${js}`,
                { type: 'pre', text: js },
            ],
            values: {},
        };
    }
};

function preludeText(compiler: Compiler<Stmt, Expr>) {
    const text = Object.entries(compiler.prelude!)
        .map(([name, defn]) => `const ${name} = ${defn};`)
        .join('\n\n');
    const total =
        text + `\nreturn {${Object.keys(compiler.prelude!).join(',')}}`;
    return total;
}

function assembleExternals(
    externals: string[],
    env: FnsEnv,
    san: any,
    names?: null | LocedName[],
) {
    const provided = names?.map((obj) => obj.name) ?? [];
    const needed = unique(
        externals.concat(['$trace', 'jsonify', 'valueToString']),
    ).filter(
        // Skip recursive self-calls
        (name) => !provided.includes(name),
    );
    // .filter((n) => sanitize(n) === n);
    const values: Record<string, any> = {};
    needed.forEach((name) => {
        if (env.values[name] == null) {
            if (san[sanitize(name)]) {
                values[sanitize(name)] = san[sanitize(name)];
            }
        } else {
            values[sanitize(name)] = env.values[name];
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
