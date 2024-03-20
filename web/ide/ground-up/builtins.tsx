import { MetaData } from '../../custom/UIState';
import { valueToString } from './reduce';
import { slash } from './round-1/bootstrap';
import { sanitize } from './round-1/builtins';
import { arr, unwrapArray, wrapArray } from './round-1/parse';

export function builtins() {
    let tracer:
        | null
        | ((
              loc: number,
              v: any,
              info: NonNullable<MetaData['trace']>,
          ) => void) = null;
    let env = {
        // Math
        '+': (a: number) => (b: number) => a + b,
        '-': (a: number) => (b: number) => a - b,
        '<': (a: number) => (b: number) => a < b,
        '<=': (a: number) => (b: number) => a <= b,
        '>': (a: number) => (b: number) => a > b,
        '>=': (a: number) => (b: number) => a >= b,
        '=': (a: number) => (b: number) => a === b,
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
        'map/rm': (m: [any, any][]) => (k: any) => m.filter((i) => i[0] !== k),
        'map/get': (m: [any, any][]) => (k: any) => {
            const found = m.find((i) => i[0] === k);
            if (found != null) {
                return { type: 'some', 0: found[1] };
            }
            return { type: 'none' };
        },
        'map/map': (fn: (k: any) => any) => (map: [any, any][]) =>
            map.map(([k, v]) => [k, fn(v)]),
        'map/merge': (a: [any, any][]) => (b: [any, any][]) => [...a, ...b],
        'map/values': (m: [any, any][]) => wrapArray(m.map((i) => i[1])),

        'set/nil': [],
        'set/add': (s: any[]) => (v: any) => [v, ...s],
        'set/has': (s: any[]) => (v: any) => s.includes(v),
        'set/rm': (s: any[]) => (v: any) => s.filter((i) => i !== v),
        // NOTE this is only working for primitives
        'set/diff': (a: any[]) => (b: any[]) => a.filter((i) => !b.includes(i)),
        'set/merge': (a: any[]) => (b: any[]) =>
            [...a, ...b.filter((x) => !a.includes(x))],
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
        sanitize,
        $setTracer(nw: null | ((loc: number, value: any) => void)) {
            // console.log('SET TRACRE', !!nw);
            tracer = nw;
        },
        $trace(loc: number, info: any, value: any) {
            // console.log('TRACE MAYBE', tracer, loc, value);
            tracer?.(loc, value, info);
            return value;
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
