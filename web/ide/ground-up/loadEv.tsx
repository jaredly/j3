import { repr } from './Evaluators';
import { bootstrap } from './bootstrap';
import { FullEvalator } from './FullEvalator';
import { expr, stmt } from './round-1/parse';
import { sanitize } from './round-1/sanitize';
import { NUIState } from '../../custom/UIState';
import { urlForId } from './urlForId';
import { bootstrapEvaluator } from './bootstrapEvaluator';
import { fnsEvaluator } from './fnsEvaluator';
import { Tracer, builtins, traceEnv } from './builtins';
import { valueToString } from './valueToString';
import { basicParser, recoveringParser } from './evaluators/parsers';
import { compiler } from './evaluators/compiler';
import { Expr, Stmt, analyzer } from './evaluators/analyze';
import {
    advancedInfer,
    basicInfer,
    typeChecker,
} from './evaluators/type-checker';
import { jsEvaluator } from './jsEvaluator';

const jsUrl = (id: string) => urlForId(id) + (id.endsWith('.js') ? '' : '.js');

export const loadEv = async (
    ids: string[],
): Promise<null | FullEvalator<any, any, any>> => {
    const res = await Promise.all(
        ids.map((id) => fetch(jsUrl(id)).then((res) => res.text())),
    );

    return evaluatorFromText(ids.join(':'), res);
};

export const evaluatorFromText = (
    id: string,
    texts: string[],
): FullEvalator<{ values: { [key: string]: any } }, Stmt, Expr> | null => {
    const benv = { ...builtins(), ...traceEnv() };
    const san = sanitizedEnv(benv);
    const envArgs =
        '{$env,' +
        Object.keys(san)
            .filter((n) => sanitize(n) === n)
            .join(', ') +
        '}';

    let data: any = {};
    for (let text of texts) {
        let result;
        try {
            result = new Function(envArgs, '{' + text + '}')({
                ...san,
                $env: san,
            });
        } catch (err) {
            console.error(err);
            return null;
        }
        if (result.type === 'typecheck') {
            const {
                0: env_nil,
                1: infer_stmt,
                2: infer,
                3: infer_stmts,
                4: type_to_string,
                5: externals_stmt,
                6: names,
                7: get_type,
                8: set_type_trace,
            } = result;
            Object.assign(data, {
                env_nil,
                infer,
                infer_stmt,
                infer_stmts,
                type_to_string,
                externals_stmt,
                names,
                get_type,
                set_type_trace,
            });
        } else if (
            result.type === 'parse-and-compile' ||
            result.type === 'parse-and-compile2'
        ) {
            data.type = 'fns';
            const {
                0: parse_stmt,
                1: parse_expr,
                2: compile_stmt,
                3: compile,
                4: calling_convention,
            } = result;
            Object.assign(data, {
                calling_convention,
                parse_version: result.type === 'parse-and-compile' ? 1 : 2,
                parse_stmt,
                parse_expr,
                compile_stmt,
                compile,
            });
        } else if (result.type === 'fns') {
            Object.assign(data, result);
        } else if (result.type === 'bootstrap') {
            Object.assign(data, result);
        } else {
            console.log(id, `The result type is unknown...?`, result);
            Object.assign(data, result);
        }
    }
    if (data.type === 'full') {
        return data;
    }
    if (data.type === 'fns') {
        const parser =
            data['parse_stmt2'] && data['parse_expr2']
                ? recoveringParser(data)
                : data['parse_stmt'] && data['parse_expr']
                ? basicParser(data)
                : undefined;
        const comp =
            data['compile'] && data['compile_stmt']
                ? compiler(data)
                : undefined;
        const ann =
            data['names'] && data['externals_stmt'] && data['externals_expr']
                ? analyzer(data)
                : undefined;
        const infer =
            data['infer_stmts2'] && data['infer2']
                ? advancedInfer(data)
                : data['infer_stmts'] && data['infer']
                ? basicInfer(data)
                : undefined;
        const typeCheck =
            infer &&
            data['env_nil'] &&
            data['add_stmt'] &&
            data['get_type'] &&
            data['type_to_string']
                ? { ...typeChecker(data), ...infer }
                : undefined;

        if (!parser) {
            throw new Error(
                `fns missing for parser ${Object.keys(data).join(',')}`,
            );
        }
        if (!comp) {
            throw new Error(
                `fns missing for compiler ${Object.keys(data).join(',')}`,
            );
        }

        // console.log('going for it', data);
        return fnsEvaluator(id, parser, comp, ann, typeCheck, san);
    }

    if (data.type === 'bootstrap') {
        return bootstrapEvaluator(id, data) as FullEvalator<any, any, any>;
    }

    console.log(id, 'no data sorry??', data.type);

    return null;
};

export type Trace =
    | { type: 'tloc'; 0: number }
    | { type: 'tcolor'; 0: string }
    | { type: 'tbold'; 0: boolean }
    | { type: 'titalic'; 0: boolean }
    | { type: 'tflash'; 0: boolean }
    | { type: 'ttext'; 0: string }
    | { type: 'tval'; 0: any }
    | { type: 'tnamed'; 0: string; 1: Trace }
    | { type: 'tfmted'; 0: any; 1: string }
    | { type: 'tfmt'; 0: any; 1: (v: any) => string };

export type TraceMap = { [loc: number]: Trace[][] };

export function withTracing(
    traceMap: TraceMap,
    loc: number,
    setTracer: (nw: null | Tracer) => void,
    env: FnsEnv,
) {
    const trace: TraceMap[0] = [];
    traceMap[loc] = trace;

    setTracer((traces: Trace[]) => {
        trace.push(
            traces.map((trace) => {
                if (trace.type === 'tval') {
                    return {
                        type: 'tfmted',
                        0: trace[0],
                        1: valueToString(trace[0]),
                    };
                }
                if (trace.type === 'tfmt') {
                    if (typeof trace[1] === 'string') {
                        const formatter = env.values[trace[1]];
                        let res = formatter(trace[0]);
                        if (typeof res !== 'string') {
                            res = JSON.stringify(res);
                        }
                        return {
                            type: 'tfmted',
                            0: trace[0],
                            1: res,
                        };
                    }
                    return {
                        type: 'tfmted',
                        0: trace[0],
                        1: trace[1](trace[0]),
                    };
                }
                return trace;
            }),
        );
    });
}

export function sanitizedEnv(benv: { [key: string]: any }) {
    const san: { [key: string]: any } = {};
    Object.entries(benv).forEach(([k, v]) => (san[sanitize(k)] = v));
    return san;
}

export type FnsEnv = {
    js: string[];
    values: { [key: string]: any };
    // typeCheck: any;
};

export const loadEvaluator = (
    ev: NUIState['evaluator'],
    fn: (ev: FullEvalator<any, any, any> | null, async: boolean) => void,
) => {
    if (typeof ev === 'string') {
        switch (ev) {
            case ':bootstrap:':
                return fn(bootstrap, false);
            case ':js:':
                return fn(jsEvaluator, false);
            case ':repr:':
                return fn(repr, false);
            // default:
            //     if (ev?.endsWith('.json')) {
            //         // fn(null, false); // clear it out
            //         loadEv([ev]).then((ev) => fn(ev, true));
            //     } else {
            //         fn(null, false);
            //     }
        }
    } else if (ev) {
        loadEv(ev).then(
            (ev) => fn(ev, true),
            (err) => {
                console.error(`Failed to load ev`);
                console.error(err);
                fn(null, true);
            },
        );
    } else {
        fn(null, false);
    }
};
