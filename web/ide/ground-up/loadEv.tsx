import { FullEvalator, bootstrap } from './Evaluators';
import { urlForId, valueToString } from './reduce';
import { expr, stmt } from './round-1/parse';
import { sanitize } from './round-1/sanitize';
import { MetaData, NUIState } from '../../custom/UIState';
import { bootstrapEvaluator } from './bootstrapEvaluator';
import { fnsEvaluator } from './fnsEvaluator';
import { builtins } from './builtins';

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
    text: string[],
): FullEvalator<unknown, stmt & { loc: number }, expr> | null => {
    const benv = builtins();
    const san = sanitizedEnv(benv);
    const envArgs = '{' + Object.keys(san).join(', ') + '}';

    let data: any = {};
    text.forEach((text) => {
        const result = new Function(envArgs, '{' + text + '}')(san);
        if (result.type === 'typecheck') {
            console.log('TYPECHECK');
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
            console.log('PARSE AND COMPILE');
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
        } else {
            console.log('NOT A TYPE', result.type);
            Object.assign(data, result);
        }
    });
    if (data.type === 'full') {
        return data;
    }
    if (data.type === 'fns') {
        return fnsEvaluator(id, data, envArgs, san);
    }

    if (data.type === 'bootstrap') {
        return bootstrapEvaluator(id, data);
    }

    console.log('no data sorry', data);

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
    san: { [key: string]: any },
    env: FnsEnv,
) {
    const trace: TraceMap[0] = [];
    traceMap[loc] = trace;

    san.$setTracer((traces: Trace[]) => {
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
                        return {
                            type: 'tfmted',
                            0: trace[0],
                            1: formatter(trace[0]),
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
    typeCheck: any;
};
