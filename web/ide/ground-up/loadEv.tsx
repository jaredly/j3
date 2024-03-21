import { FullEvalator, bootstrap } from './Evaluators';
import { urlForId, valueToString } from './reduce';
import { expr, stmt } from './round-1/parse';
import { sanitize } from './round-1/builtins';
import { MetaData, NUIState } from '../../custom/UIState';
import { bootstrapEvaluator } from './bootstrapEvaluator';
import { fnsEvaluator } from './fnsEvaluator';

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
    const benv = bootstrap.init();
    const san = sanitizedEnv(benv);
    const envArgs = '{' + Object.keys(san).join(', ') + '}';

    let data: any = {};
    text.forEach((text) => {
        const result = new Function(envArgs, '{' + text + '}')(san);
        if (result.type === 'typecheck') {
            const {
                0: env_nil,
                1: infer_stmt,
                2: infer,
                3: infer_defns,
                4: type_to_string,
                5: externals_stmt,
                6: names,
            } = result;
            Object.assign(data, {
                env_nil,
                infer,
                infer_stmt,
                infer_defns,
                type_to_string,
                externals_stmt,
                names,
            });
            console.log('um loading');
        } else {
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

export type TraceMap = {
    [loc: number]: {
        [loc: number]: { value: any; at: number; formatted: string }[];
    };
};

export function withTracing(
    traceMap: TraceMap,
    loc: number,
    san: { [key: string]: any },
    env: FnsEnv,
) {
    let count = 0;
    const trace: { [key: number]: any[] } = (traceMap[loc] = {});
    san.$setTracer(
        (loc: number, value: any, info: NonNullable<MetaData['trace']>) => {
            if (!trace[loc]) {
                trace[loc] = [];
            }
            let formatter = info.formatter
                ? env.values[info.formatter]
                : valueToString;
            let formatted = formatter(value);
            if (typeof formatted !== 'string') {
                console.warn(
                    'not formatted',
                    formatted,
                    value,
                    info.formatter,
                    env.values[info.formatter!],
                );
                formatted = 'bad format';
            }
            trace[loc].push({
                value,
                at: count++,
                formatted,
            });
            return value;
        },
    );
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
