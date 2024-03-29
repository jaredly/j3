import { MetaData } from '../../custom/UIState';
import { valueToString } from './reduce';
import { slash } from './round-1/bootstrap';
import { sanitize } from './round-1/sanitize';
import { arr, unwrapArray, wrapArray } from './round-1/parse';
import { Trace } from './loadEv';
import equal from 'fast-deep-equal';

export type Tracer = (
    // loc: number,
    trace: Trace[],
    // v: any,
    // info: NonNullable<MetaData['trace']>,
) => void;

export function builtins() {
    let tracer: null | Tracer = null;
    let env = {
        // Math
        '+': (a: number) => (b: number) => a + b,
        '-': (a: number) => (b: number) => a - b,
        '<': (a: number) => (b: number) => a < b,
        '<=': (a: number) => (b: number) => a <= b,
        '>': (a: number) => (b: number) => a > b,
        '>=': (a: number) => (b: number) => a >= b,
        '=': (a: number) => (b: number) => a === b,
        '!=': (a: number) => (b: number) => a != b,
        unescapeString: slash,

        'int-to-string': (a: number) => a + '',
        string_to_int: (a: string) => {
            var v = parseInt(a);
            if (!isNaN(v) && '' + v === a) return { type: 'some', 0: v };
            return { type: 'none' };
        },
        // Array, tuple
        nil: { type: 'nil' },
        cons: (a: any) => (b: any) => ({ type: 'cons', 0: a, 1: b }),
        ',':
            <a, b>(a: a) =>
            (b: b) => ({ type: ',', 0: a, 1: b }),
        ',,':
            <a, b, c>(a: a) =>
            (b: b) =>
            (c: c) => ({ type: ',,', 0: a, 1: b, 2: c }),
        ',,,':
            <a, b, c, d>(a: a) =>
            (b: b) =>
            (c: c) =>
            (d: d) => ({ type: ',,,', 0: a, 1: b, 2: c, 3: d }),
        '++': (items: arr<string>) => unwrapArray(items).join(''),
        'map/nil': [],
        'map/set': (m: [any, any][]) => (k: any) => (v: any) => [[k, v], ...m],
        'map/rm': (m: [any, any][]) => (k: any) =>
            m.filter((i) => !equal(i[0], k)),
        'map/get': (m: [any, any][]) => (k: any) => {
            const found = m.find((i) => equal(i[0], k));
            if (found != null) {
                return { type: 'some', 0: found[1] };
            }
            return { type: 'none' };
        },
        'map/map': (fn: (k: any) => any) => (map: [any, any][]) =>
            map.map(([k, v]) => [k, fn(v)]),
        'map/merge': (a: [any, any][]) => (b: [any, any][]) =>
            [...a, ...b.filter((item) => !a.find((a) => equal(a[0], item[0])))],
        'map/values': (m: [any, any][]) => wrapArray(m.map((i) => i[1])),
        'map/keys': (m: [any, any][]) => wrapArray(m.map((i) => i[0])),

        'set/nil': [],
        'set/add': (s: any[]) => (v: any) => [v, ...s],
        'set/has': (s: any[]) => (v: any) => s.includes(v),
        'set/rm': (s: any[]) => (v: any) => s.filter((i) => !equal(i, v)),
        // NOTE this is only working for primitives
        'set/diff': (a: any[]) => (b: any[]) =>
            a.filter((i) => !b.some((j) => equal(i, j))),
        'set/merge': (a: any[]) => (b: any[]) =>
            [...a, ...b.filter((x) => !a.some((y) => equal(y, x)))],
        'set/to-list': wrapArray,
        'set/from-list': unwrapArray,
        'map/from-list': (a: arr<{ type: ','; 0: any; 1: any }>) =>
            unwrapArray(a).map((i) => [i[0], i[1]]),
        'map/to-list': (a: [any, any][]) =>
            wrapArray(a.map(([k, v]) => ({ type: ',', 0: k, 1: v }))),
        // unwrapArray(a).map((i) => [i[0], i[1]]),
        jsonify: (m: any) => JSON.stringify(m),
        // Meta stuff
        valueToString,
        eval: (v: string) => {
            const obj: { [key: string]: any } = {};
            Object.entries(env).forEach(([k, v]) => (obj[sanitize(k)] = v));
            const k = `{${Object.keys(obj).join(',')}}`;
            return new Function(k, 'return ' + v)(obj);
        },
        errorToString: (fn: (arg: any) => any) => (arg: any) => {
            try {
                return fn(arg);
            } catch (err) {
                return (err as Error).message;
            }
        },
        sanitize,
        $setTracer(nw: null | Tracer) {
            tracer = nw;
        },
        $trace(loc: number, info: any, value: any) {
            if (tracer) {
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
            tracer?.(unwrapArray(things));
        },

        // Just handy
        'replace-all': (a: string) => (b: string) => (c: string) =>
            a.replaceAll(b, c),
        reduce:
            <T, A>(init: T) =>
            (items: arr<A>) =>
            (f: (res: T) => (item: A) => T) =>
                unwrapArray(items).reduce((a, b) => f(a)(b), init),
        // Debug
        fatal: (v: string) => {
            throw new Error(`Fatal runtime: ${v}`);
        },
    };
    return env;
}
