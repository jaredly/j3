import { MetaData } from '../../custom/UIState';
import { valueToString } from './valueToString';
import { slash } from './round-1/bootstrap';
import { sanitize } from './round-1/sanitize';
import { arr, unwrapArray as unwrapList, wrapArray } from './round-1/parse';
import { Trace } from './loadEv';
import equal from 'fast-deep-equal';

export type Tracer = (
    // loc: number,
    trace: Trace[],
    // v: any,
    // info: NonNullable<MetaData['trace']>,
) => void;

const filter = <A,>(lst: arr<A>, f: (a: A) => boolean): arr<A> => {
    return lst.type === 'nil'
        ? lst
        : f(lst[0])
        ? lst[1]
        : { ...lst, [1]: filter(lst[1], f) };
};
const concat = <A,>(a: arr<A>, b: arr<A>): arr<A> => {
    return a.type === 'nil' ? b : { ...a, [1]: concat(a[1], b) };
};

function builtins() {
    console.log('doing a builtins', new Error().stack);
    let env = {
        // Math
        // '+': (a: number) => (b: number) => a + b,
        // '-': (a: number) => (b: number) => a - b,
        // '<': (a: number) => (b: number) => a < b,
        // '<=': (a: number) => (b: number) => a <= b,
        // '>': (a: number) => (b: number) => a > b,
        // '>=': (a: number) => (b: number) => a >= b,
        // '=': (a: number) => (b: number) => equal(a, b),
        // '!=': (a: number) => (b: number) => !equal(a, b),
        // pi: Math.PI,
        // unescapeString: slash,
        // 'show-pretty': (v: any) => JSON.stringify(v),
        // show: (v: any) => JSON.stringify(v),
        // equal,
        // 'int-to-string': (a: number) => a + '',
        // 'string-to-float': (a: string) => {
        //     if (!a.match(/^\d*\.\d+$/)) {
        //         return { type: 'none' };
        //     }
        //     var v = parseFloat(a);
        //     if (!isNaN(v)) return { type: 'some', 0: v };
        //     return { type: 'none' };
        // },
        // 'string-to-int': (a: string) => {
        //     var v = parseInt(a);
        //     if (!isNaN(v) && '' + v === a) return { type: 'some', 0: v };
        //     return { type: 'none' };
        // },
        // // Array, tuple
        // nil: { type: 'nil' },
        // cons: (a: any) => (b: any) => ({ type: 'cons', 0: a, 1: b }),
        // // '()': Symbol('unit'),
        // '()': null,
        // ',':
        //     <a, b>(a: a) =>
        //     (b: b) => ({ type: ',', 0: a, 1: b }),
        // // ',,':
        // //     <a, b, c>(a: a) =>
        // //     (b: b) =>
        // //     (c: c) => ({ type: ',,', 0: a, 1: b, 2: c }),
        // // ',,,':
        // //     <a, b, c, d>(a: a) =>
        // //     (b: b) =>
        // //     (c: c) =>
        // //     (d: d) => ({ type: ',,,', 0: a, 1: b, 2: c, 3: d }),
        // '++': (items: arr<string>) => unwrapList(items).join(''),
        // 'map/nil': [],
        // 'map/set': (m: [any, any][]) => (k: any) => (v: any) =>
        //     [[k, v], ...m.filter((i) => i[0] !== k)],
        // 'map/rm': (m: [any, any][]) => (k: any) =>
        //     m.filter((i) => !equal(i[0], k)),
        // 'map/get': (m: [any, any][]) => (k: any) => {
        //     const found = m.find((i) => equal(i[0], k));
        //     if (found != null) {
        //         return { type: 'some', 0: found[1] };
        //     }
        //     return { type: 'none' };
        // },
        // 'map/map': (fn: (k: any) => any) => (map: [any, any][]) =>
        //     map.map(([k, v]) => [k, fn(v)]),
        // 'map/merge': (a: [any, any][]) => (b: [any, any][]) =>
        //     [...a, ...b.filter((item) => !a.find((a) => equal(a[0], item[0])))],
        // 'map/values': (m: [any, any][]) => wrapArray(m.map((i) => i[1])),
        // 'map/keys': (m: [any, any][]) => wrapArray(m.map((i) => i[0])),
        // 'set/nil': [],
        // 'set/add': (s: any[]) => (v: any) =>
        //     [v, ...s.filter((m) => !equal(v, m))],
        // 'set/has': (s: any[]) => (v: any) => s.includes(v),
        // 'set/rm': (s: any[]) => (v: any) => s.filter((i) => !equal(i, v)),
        // // NOTE this is only working for primitives
        // 'set/diff': (a: any[]) => (b: any[]) =>
        //     a.filter((i) => !b.some((j) => equal(i, j))),
        // 'set/merge': (a: any[]) => (b: any[]) =>
        //     [...a, ...b.filter((x) => !a.some((y) => equal(y, x)))],
        // 'set/overlap': (a: any[]) => (b: any[]) =>
        //     a.filter((x) => b.some((y) => equal(y, x))),
        // 'set/to-list': wrapArray,
        // 'set/from-list': (s: arr<any>) => {
        //     const res: any[] = [];
        //     unwrapList(s).forEach((item) => {
        //         if (res.some((m) => equal(item, m))) {
        //             return;
        //         }
        //         res.push(item);
        //     });
        //     return res;
        // },
        // 'map/from-list': (a: arr<{ type: ','; 0: any; 1: any }>) =>
        //     unwrapList(a).map((i) => [i[0], i[1]]),
        // 'map/to-list': (a: [any, any][]) =>
        //     wrapArray(a.map(([k, v]) => ({ type: ',', 0: k, 1: v }))),
        // // 'set/nil': { type: 'nil' },
        // // 'set/add': (s: arr<any>) => (v: any) => ({ type: 'cons', 0: v, 1: s }),
        // // 'set/has': (s: arr<any>) => (v: any) => {
        // //     for (; s.type === 'cons'; s = s[1]) {
        // //         // TODO use `equal` here
        // //         if (s[0] == v) return true;
        // //     }
        // //     return false;
        // // },
        // // 'set/rm': (s: arr<any>) => (v: any) => filter(s, (n) => n !== v),
        // // // NOTE this is only working for primitives
        // // 'set/diff': (a: arr<any>) => (b: arr<any>) => {
        // //     const bs: Record<any, true> = {};
        // //     unwrapArray(b).forEach((i) => (bs[i] = true));
        // //     return filter(a, (v) => !bs[v]);
        // // },
        // // // a.filter((i) => !b.some((j) => equal(i, j))),
        // // 'set/merge': (a: arr<any>) => (b: arr<any>) => {
        // //     const as: Record<any, true> = {};
        // //     unwrapArray(a).forEach((i) => (as[i] = true));
        // //     return concat(
        // //         a,
        // //         filter(b, (n) => !as[n]),
        // //     );
        // // },
        // // // [...a, ...b.filter((x) => !a.some((y) => equal(y, x)))],
        // // 'set/overlap': (a: arr<any>) => (b: arr<any>) => {
        // //     const as: Record<any, true> = {};
        // //     unwrapArray(a).forEach((i) => (as[i] = true));
        // //     return filter(b, (v) => as[v]);
        // // },
        // // // a.filter((x) => b.some((y) => equal(y, x))),
        // // 'set/to-list': (a: arr<any>) => a,
        // // 'set/from-list': (a: arr<any>) => a,
        // // unwrapArray(a).map((i) => [i[0], i[1]]),
        // jsonify: (m: any) => JSON.stringify(m),
        // // Meta stuff
        // valueToString,
        // eval: (v: string) => {
        //     const obj: { [key: string]: any } = {};
        //     Object.entries(env).forEach(([k, v]) => (obj[sanitize(k)] = v));
        //     const k = `{${Object.keys(obj).join(',')}}`;
        //     return new Function(k, 'return ' + v)(obj);
        // },
        // errorToString: (fn: (arg: any) => any) => (arg: any) => {
        //     try {
        //         return fn(arg);
        //     } catch (err) {
        //         return (err as Error).message;
        //     }
        // },
        // sanitize,
        // // Just handy
        // 'replace-all': (a: string) => (b: string) => (c: string) =>
        //     a.replaceAll(b, c),
        // reduce:
        //     <T, A>(init: T) =>
        //     (items: arr<A>) =>
        //     (f: (res: T) => (item: A) => T) =>
        //         unwrapList(items).reduce((a, b) => f(a)(b), init),
        // // Debug
        // fatal: (v: string) => {
        //     throw new Error(`Fatal runtime: ${v}`);
        // },
    };
    return env;
}

export const traceEnv = () => {
    let tracer: null | Tracer = null;
    return {
        $setTracer(nw: null | Tracer) {
            tracer = nw;
        },
        $trace(loc: number, info: any, value: any) {
            if (tracer) {
                // console.log('doing a tracer', loc, value);
                tracer([
                    { type: 'tloc', 0: loc },
                    info.formatter
                        ? { type: 'tfmt', 0: value, 1: info.formatter }
                        : { type: 'tval', 0: value },
                ]);
            }
            // tracer?.(loc, value, info);
            return value;
        },
        trace: (things: arr<Trace>) => {
            tracer?.(unwrapList(things));
        },
    };
};
