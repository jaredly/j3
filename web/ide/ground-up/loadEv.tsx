import { Errors, FullEvalator, bootstrap } from './Evaluators';
import { findTops, urlForId, valueToString } from './reduce';
import { expr, parseExpr, parseStmt, stmt } from './round-1/parse';
import { sanitize } from './round-1/builtins';
import { fromMCST } from '../../../src/types/mcst';

export const loadEv = async (
    id: string,
): Promise<null | FullEvalator<any, any, any>> => {
    const res = await fetch(urlForId(id) + '.js');
    if (res.status !== 200) {
        console.log('Nope', res.status);
        return null;
    }
    return evaluatorFromText(await res.text());
};

export const evaluatorFromText = (
    text: string,
): FullEvalator<string[], stmt & { loc: number }, expr> | null => {
    const data = new Function(text)();
    if (data.type === 'full') {
        return data;
    }
    if (data.type === 'bootstrap') {
        let benv = bootstrap.init();
        data.stmts.forEach((stmt: any) => {
            benv = bootstrap.addStatement(stmt, benv).env;
        });
        const san: { [key: string]: any } = {};
        Object.entries(benv).forEach(([k, v]) => (san[sanitize(k)] = v));
        const envArgs = '{' + Object.keys(san).join(', ') + '}';
        return {
            init(): string[] {
                return [];
            },
            addStatement(stmt: stmt, env) {
                if (stmt.type === 'sdef' || stmt.type === 'sdeftype') {
                    try {
                        env.push(benv['compile-st'](stmt));
                        return { env, display: 'compiled.' };
                    } catch (err) {
                        console.error(err);
                        return {
                            env,
                            display: 'Failed ' + (err as Error).message,
                        };
                    }
                }
                if (stmt.type === 'sexpr') {
                    let raw;
                    try {
                        raw = benv['compile-st'](stmt);
                    } catch (err) {
                        console.error(err);
                        return {
                            env,
                            display:
                                'Compilation failed: ' + (err as Error).message,
                        };
                    }
                    try {
                        const res = new Function(
                            envArgs,
                            '{' + env.join('\n') + '\nreturn ' + raw + '}',
                        )(san);
                        return { env, display: valueToString(res) };
                    } catch (err) {
                        console.log(envArgs);
                        console.log(raw);
                        console.error(err);
                        return {
                            env,
                            display:
                                'Error evaluating! ' +
                                (err as Error).message +
                                '\n' +
                                raw,
                        };
                    }
                }
                return { env, display: 'idk' };
            },
            toFile(state) {
                let env = this.init();
                const errors: Errors = {};
                const names: string[] = [];
                findTops(state).forEach((top) => {
                    const node = fromMCST(top.top, state.map);
                    if (node.type === 'blank') return;
                    const parsed = this.parse(node, errors);
                    if (!parsed) return;
                    if (parsed.type === 'sdef') {
                        names.push(parsed[0]);
                    }
                    try {
                        env = this.addStatement(parsed, env).env;
                    } catch (err) {
                        console.error(err);
                    }
                });
                env.push(
                    `return {${names
                        .map((name) => sanitize(name))
                        .join(', ')}}`,
                );
                return { js: env.join('\n'), errors };
            },
            parse(node, errors) {
                const ctx = { errors, display: {} };
                const stmt = parseStmt(node, ctx) as stmt & { loc: number };
                if (Object.keys(ctx.errors).length || !stmt) {
                    return;
                }
                stmt.loc = node.loc;
                return stmt;
            },
            parseExpr(node, errors) {
                const ctx = { errors, display: {} };
                return parseExpr(node, ctx);
            },
            evaluate(expr, env) {
                let raw;
                try {
                    raw = benv['compile'](expr);
                } catch (err) {
                    console.error(err);
                    return 'Compilation failed: ' + (err as Error).message;
                }
                try {
                    const res = new Function(
                        envArgs,
                        '{' + env.join('\n') + '\nreturn ' + raw + '}',
                    )(san);
                    return res;
                } catch (err) {
                    console.log(raw);
                    console.error(err);
                    return (
                        'Error evaluating! ' + (err as Error).message
                        // '\n' +
                        // raw
                    );
                }
            },
        };
        // first we have to pass everything through the bootstrapping.
    }
    // we have `compile-st` and `compile`.
    // ELSE do ... a thing
    return null;
};
