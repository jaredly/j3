const $env = {}
const $builtins = (() => {function equal(a, b) {
    if (a === b) return true;

    if (a && b && typeof a == 'object' && typeof b == 'object') {
        var length, i, keys;
        if (Array.isArray(a)) {
            length = a.length;
            if (length != b.length) return false;
            for (i = length; i-- !== 0; ) if (!equal(a[i], b[i])) return false;
            return true;
        }

        keys = Object.keys(a);
        length = keys.length;
        if (length !== Object.keys(b).length) return false;

        for (i = length; i-- !== 0; ) {
            if (!Object.prototype.hasOwnProperty.call(b, keys[i])) return false;
        }

        for (i = length; i-- !== 0; ) {
            var key = keys[i];

            if (!equal(a[key], b[key])) return false;
        }

        return true;
    }

    // true if both NaN, false otherwise
    return a !== a && b !== b;
}

function unescapeString(n) {
    if (n == null || !n.replaceAll) {
        debugger;
        return '';
    }
    return n.replaceAll(/\\./g, (m) => {
        if (m[1] === 'n') {
            return '\n';
        }
        if (m[1] === 't') {
            return '\t';
        }
        if (m[1] === 'r') {
            return '\r';
        }
        return m[1];
    });
}

function unwrapList(v) {
    return v.type === 'nil' ? [] : [v[0], ...unwrapList(v[1])];
}

function wrapList(v) {
    let res = { type: 'nil' };
    for (let i = v.length - 1; i >= 0; i--) {
        res = { type: 'cons', 0: v[i], 1: res };
    }
    return res;
}

const sanMap = {
    // '$$$$' gets interpreted by replaceAll as '$$', for reasons
    $: '$$$$',
    '-': '_',
    '+': '$pl',
    '*': '$ti',
    '=': '$eq',
    '>': '$gt',
    '<': '$lt',
    "'": '$qu',
    '"': '$dq',
    ',': '$co',
    '/': '$sl',
    ';': '$semi',
    '@': '$at',
    ':': '$cl',
    '#': '$ha',
    '!': '$ex',
    '|': '$bar',
    '()': '$unit',
    '?': '$qe',
  };
const kwds =
    'case new var const let if else return super break while for default eval'.split(' ');

// Convert an identifier into a valid js identifier, replacing special characters, and accounting for keywords.
function sanitize(raw) {
    for (let [key, val] of Object.entries(sanMap)) {
        raw = raw.replaceAll(key, val);
    }
    if (kwds.includes(raw)) return '$' + raw
    return raw
}

const valueToString = (v) => {
    if (Array.isArray(v)) {
        return `[${v.map(valueToString).join(', ')}]`;
    }
    if (typeof v === 'object' && v && 'type' in v) {
        if (v.type === 'cons' || v.type === 'nil') {
            const un = unwrapList(v);
            return '[' + un.map(valueToString).join(' ') + ']';
        }

        let args = [];
        for (let i = 0; i in v; i++) {
            args.push(v[i]);
        }
        return `(${v.type}${args
            .map((arg) => ' ' + valueToString(arg))
            .join('')})`;
    }
    if (typeof v === 'string') {
        if (v.includes('"') && !v.includes("'")) {
            return (
                "'" + JSON.stringify(v).slice(1, -1).replace(/\"/g, '"') + "'"
            );
        }
        return JSON.stringify(v);
    }
    if (typeof v === 'function') {
        return '<function>';
    }

    return '' + v;
};

return {
    '+': (a) => (b) => a + b,
    '-': (a) => (b) => a - b,
    '<': (a) => (b) => a < b,
    '<=': (a) => (b) => a <= b,
    '>': (a) => (b) => a > b,
    '>=': (a) => (b) => a >= b,
    '=': (a) => (b) => equal(a, b),
    '!=': (a) => (b) => !equal(a, b),
    pi: Math.PI,
    'replace-all': a => b => c => a.replaceAll(b, c),
    eval: source => {
      return new Function('', 'return ' + source)();
    },
    'eval-with': ctx => source => {
      const args = '{' + Object.keys(ctx).join(',') + '}'
      return new Function(args, 'return ' + source)(ctx);
    },
    $unit: null,
    errorToString: f => arg => {
      try {
        return f(arg)
      } catch (err) {
        return err.message;
      }
    },
    valueToString,
    unescapeString,
    sanitize,
    equal: a => b => equal(a, b),
    'int-to-string': (a) => a.toString(),
    'string-to-int': (a) => {
        const v = Number(a);
        return Number.isInteger(v) && v.toString() === a ? { type: 'some', 0: v } : { type: 'none' };
    },
    'string-to-float': (a) => {
        const v = Number(a);
        return Number.isFinite(v) ? { type: 'some', 0: v } : { type: 'none' };
    },

    // maps
    'map/nil': [],
    'map/set': (map) => (key) => (value) =>
        [[key, value], ...map.filter((i) => i[0] !== key)],
    'map/rm': (map) => (key) => map.filter((i) => !equal(i[0], key)),
    'map/get': (map) => (key) => {
        const found = map.find((i) => equal(i[0], key));
        return found ? { type: 'some', 0: found[1] } : { type: 'none' };
    },
    'map/map': (fn) => (map) => map.map(([k, v]) => [k, fn(v)]),
    'map/merge': (one) => (two) =>
        [...one, ...two.filter(([key]) => !one.find(([a]) => equal(a, key)))],
    'map/values': (map) => wrapList(map.map((item) => item[1])),
    'map/keys': (map) => wrapList(map.map((item) => item[0])),
    'map/from-list': (list) =>
        unwrapList(list).map((pair) => [pair[0], pair[1]]),
    'map/to-list': (map) =>
        wrapList(map.map(([key, value]) => ({ type: ',', 0: key, 1: value }))),

    // sets
    'set/nil': [],
    'set/add': (s) => (v) => [v, ...s.filter((m) => !equal(v, m))],
    'set/has': (s) => (v) => s.includes(v),
    'set/rm': (s) => (v) => s.filter((i) => !equal(i, v)),
    // NOTE this is only working for primitives
    'set/diff': (a) => (b) => a.filter((i) => !b.some((j) => equal(i, j))),
    'set/merge': (a) => (b) =>
        [...a, ...b.filter((x) => !a.some((y) => equal(y, x)))],
    'set/overlap': (a) => (b) => a.filter((x) => b.some((y) => equal(y, x))),
    'set/to-list': wrapList,
    'set/from-list': (s) => {
        const res = [];
        unwrapList(s).forEach((item) => {
            if (res.some((m) => equal(item, m))) {
                return;
            }
            res.push(item);
        });
        return res;
    },

    // Various debugging stuff
    jsonify: (v) => JSON.stringify(v) ?? 'undefined',
    fatal: (message) => {
        throw new Error(`Fatal runtime: ${message}`);
    },
}})();
Object.assign($env, $builtins);
const {"+": $pl, "-": _, "<": $lt, "<=": $lt$eq, ">": $gt, ">=": $gt$eq, "=": $eq, "!=": $ex$eq, "pi": pi, "replace-all": replace_all, "eval": $eval, "eval-with": eval_with, "$unit": $unit, "errorToString": errorToString, "valueToString": valueToString, "unescapeString": unescapeString, "sanitize": sanitize, "equal": equal, "int-to-string": int_to_string, "string-to-int": string_to_int, "string-to-float": string_to_float, "map/nil": map$slnil, "map/set": map$slset, "map/rm": map$slrm, "map/get": map$slget, "map/map": map$slmap, "map/merge": map$slmerge, "map/values": map$slvalues, "map/keys": map$slkeys, "map/from-list": map$slfrom_list, "map/to-list": map$slto_list, "set/nil": set$slnil, "set/add": set$sladd, "set/has": set$slhas, "set/rm": set$slrm, "set/diff": set$sldiff, "set/merge": set$slmerge, "set/overlap": set$sloverlap, "set/to-list": set$slto_list, "set/from-list": set$slfrom_list, "jsonify": jsonify, "fatal": fatal} = $builtins;
const $prelude = (() => {const $type_class_insts = {};
return {$type_class_insts}})();
Object.assign($env, $prelude);
const x_ = 1;

const hi = (a) => $pl(a)(x_);

const some = (v0) => ({type: "some", 0: v0})
const none = ({type: "none"})
const $co = (v0) => (v1) => ({type: ",", 0: v0, 1: v1})
const nil = ({type: "nil"})
const cons = (v0) => (v1) => ({type: "cons", 0: v0, 1: v1})
const id = (x) => x;

const mfl = map$slfrom_list;

const mn = map$slnil;

const mapo = (k) => (v) => map$slset(map$slnil)(k)(v);

{
    const test = id;
    
    const in_0 = set$slnil;
    const mod_0 = test(in_0);
    const out_0 = set$slnil;
    if (!equal(mod_0, out_0)) {
        console.log(mod_0);
        console.log(out_0);
        throw new Error(`Fixture test (492) failing 0. Not equal.`);
    }
    

    const in_1 = set$slhas(set$sladd(set$slnil)(23))(23);
    const mod_1 = test(in_1);
    const out_1 = true;
    if (!equal(mod_1, out_1)) {
        console.log(mod_1);
        console.log(out_1);
        throw new Error(`Fixture test (492) failing 1. Not equal.`);
    }
    

    const in_2 = set$slhas(set$slnil)(23);
    const mod_2 = test(in_2);
    const out_2 = false;
    if (!equal(mod_2, out_2)) {
        console.log(mod_2);
        console.log(out_2);
        throw new Error(`Fixture test (492) failing 2. Not equal.`);
    }
    

    const in_3 = set$slrm(set$sladd(set$slnil)(23))(23);
    const mod_3 = test(in_3);
    const out_3 = set$slnil;
    if (!equal(mod_3, out_3)) {
        console.log(mod_3);
        console.log(out_3);
        throw new Error(`Fixture test (492) failing 3. Not equal.`);
    }
    

    const in_4 = set$sldiff(set$slfrom_list(cons(2)(cons(3)(cons(4)(cons(5)(nil))))))(set$slfrom_list(cons(3)(cons(4)(nil))));
    const mod_4 = test(in_4);
    const out_4 = set$slfrom_list(cons(2)(cons(5)(nil)));
    if (!equal(mod_4, out_4)) {
        console.log(mod_4);
        console.log(out_4);
        throw new Error(`Fixture test (492) failing 4. Not equal.`);
    }
    

    const in_5 = set$sloverlap(set$slfrom_list(cons(2)(cons(3)(cons(4)(cons(5)(nil))))))(set$slfrom_list(cons(3)(cons(4)(cons(6)(cons(7)(nil))))));
    const mod_5 = test(in_5);
    const out_5 = set$slfrom_list(cons(3)(cons(4)(nil)));
    if (!equal(mod_5, out_5)) {
        console.log(mod_5);
        console.log(out_5);
        throw new Error(`Fixture test (492) failing 5. Not equal.`);
    }
    

    const in_6 = set$slto_list(set$slfrom_list(cons(2)(cons(4)(cons(9)(cons(2)(nil))))));
    const mod_6 = test(in_6);
    const out_6 = cons(2)(cons(4)(cons(9)(nil)));
    if (!equal(mod_6, out_6)) {
        console.log(mod_6);
        console.log(out_6);
        throw new Error(`Fixture test (492) failing 6. Not equal.`);
    }
    
}
{
    const test = (x) => x;
    
    const in_0 = 1;
    const mod_0 = test(in_0);
    const out_0 = 1;
    if (!equal(mod_0, out_0)) {
        console.log(mod_0);
        console.log(out_0);
        throw new Error(`Fixture test (0) failing 0. Not equal.`);
    }
    

    const in_1 = "string";
    const mod_1 = test(in_1);
    const out_1 = "string";
    if (!equal(mod_1, out_1)) {
        console.log(mod_1);
        console.log(out_1);
        throw new Error(`Fixture test (0) failing 1. Not equal.`);
    }
    

    const in_2 = int_to_string(10);
    const mod_2 = test(in_2);
    const out_2 = "10";
    if (!equal(mod_2, out_2)) {
        console.log(mod_2);
        console.log(out_2);
        throw new Error(`Fixture test (0) failing 2. Not equal.`);
    }
    

    const in_3 = 20;
    const mod_3 = test(in_3);
    const out_3 = 20;
    if (!equal(mod_3, out_3)) {
        console.log(mod_3);
        console.log(out_3);
        throw new Error(`Fixture test (0) failing 3. Not equal.`);
    }
    

    const in_4 = ((x) => x)(1);
    const mod_4 = test(in_4);
    const out_4 = 1;
    if (!equal(mod_4, out_4)) {
        console.log(mod_4);
        console.log(out_4);
        throw new Error(`Fixture test (0) failing 4. Not equal.`);
    }
    

    const in_5 = ((x_) => x_)(1);
    const mod_5 = test(in_5);
    const out_5 = 1;
    if (!equal(mod_5, out_5)) {
        console.log(mod_5);
        console.log(out_5);
        throw new Error(`Fixture test (0) failing 5. Not equal.`);
    }
    
}
{
    const test = (x) => x;
    
    const in_0 = map$slget(mn)("hi");
    const mod_0 = test(in_0);
    const out_0 = none;
    if (!equal(mod_0, out_0)) {
        console.log(mod_0);
        console.log(out_0);
        throw new Error(`Fixture test (74) failing 0. Not equal.`);
    }
    

    const in_1 = map$slget(mapo("hi")(2))("hi");
    const mod_1 = test(in_1);
    const out_1 = some(2);
    if (!equal(mod_1, out_1)) {
        console.log(mod_1);
        console.log(out_1);
        throw new Error(`Fixture test (74) failing 1. Not equal.`);
    }
    

    const in_2 = map$slmerge(mfl(cons($co(1)(2))(nil)))(mfl(cons($co(1)(3))(nil)));
    const mod_2 = test(in_2);
    const out_2 = mfl(cons($co(1)(2))(nil));
    if (!equal(mod_2, out_2)) {
        console.log(mod_2);
        console.log(out_2);
        throw new Error(`Fixture test (74) failing 2. Not equal.`);
    }
    

    const in_3 = map$slvalues(mfl(cons($co(1)(2))(cons($co(3)(4))(nil))));
    const mod_3 = test(in_3);
    const out_3 = cons(2)(cons(4)(nil));
    if (!equal(mod_3, out_3)) {
        console.log(mod_3);
        console.log(out_3);
        throw new Error(`Fixture test (74) failing 3. Not equal.`);
    }
    

    const in_4 = map$slkeys(mfl(cons($co(1)(2))(cons($co(3)(4))(nil))));
    const mod_4 = test(in_4);
    const out_4 = cons(1)(cons(3)(nil));
    if (!equal(mod_4, out_4)) {
        console.log(mod_4);
        console.log(out_4);
        throw new Error(`Fixture test (74) failing 4. Not equal.`);
    }
    

    const in_5 = map$slto_list(mfl(cons($co(1)(2))(cons($co(3)(4))(nil))));
    const mod_5 = test(in_5);
    const out_5 = cons($co(1)(2))(cons($co(3)(4))(nil));
    if (!equal(mod_5, out_5)) {
        console.log(mod_5);
        console.log(out_5);
        throw new Error(`Fixture test (74) failing 5. Not equal.`);
    }
    
}
{
    const test = id;
    
    const in_0 = $pl(1)(2);
    const mod_0 = test(in_0);
    const out_0 = 3;
    if (!equal(mod_0, out_0)) {
        console.log(mod_0);
        console.log(out_0);
        throw new Error(`Fixture test (204) failing 0. Not equal.`);
    }
    

    const in_1 = _(4)(1);
    const mod_1 = test(in_1);
    const out_1 = 3;
    if (!equal(mod_1, out_1)) {
        console.log(mod_1);
        console.log(out_1);
        throw new Error(`Fixture test (204) failing 1. Not equal.`);
    }
    

    const in_2 = $lt(4)(2);
    const mod_2 = test(in_2);
    const out_2 = false;
    if (!equal(mod_2, out_2)) {
        console.log(mod_2);
        console.log(out_2);
        throw new Error(`Fixture test (204) failing 2. Not equal.`);
    }
    

    const in_3 = $lt(2)(4);
    const mod_3 = test(in_3);
    const out_3 = true;
    if (!equal(mod_3, out_3)) {
        console.log(mod_3);
        console.log(out_3);
        throw new Error(`Fixture test (204) failing 3. Not equal.`);
    }
    

    const in_4 = $lt$eq(3)(3);
    const mod_4 = test(in_4);
    const out_4 = true;
    if (!equal(mod_4, out_4)) {
        console.log(mod_4);
        console.log(out_4);
        throw new Error(`Fixture test (204) failing 4. Not equal.`);
    }
    

    const in_5 = $gt$eq(3)(3);
    const mod_5 = test(in_5);
    const out_5 = true;
    if (!equal(mod_5, out_5)) {
        console.log(mod_5);
        console.log(out_5);
        throw new Error(`Fixture test (204) failing 5. Not equal.`);
    }
    

    const in_6 = $eq(4)(4);
    const mod_6 = test(in_6);
    const out_6 = true;
    if (!equal(mod_6, out_6)) {
        console.log(mod_6);
        console.log(out_6);
        throw new Error(`Fixture test (204) failing 6. Not equal.`);
    }
    

    const in_7 = $ex$eq(4)(4);
    const mod_7 = test(in_7);
    const out_7 = false;
    if (!equal(mod_7, out_7)) {
        console.log(mod_7);
        console.log(out_7);
        throw new Error(`Fixture test (204) failing 7. Not equal.`);
    }
    

    const in_8 = $gt(pi)(3);
    const mod_8 = test(in_8);
    const out_8 = true;
    if (!equal(mod_8, out_8)) {
        console.log(mod_8);
        console.log(out_8);
        throw new Error(`Fixture test (204) failing 8. Not equal.`);
    }
    

    const in_9 = $lt(pi)(4);
    const mod_9 = test(in_9);
    const out_9 = true;
    if (!equal(mod_9, out_9)) {
        console.log(mod_9);
        console.log(out_9);
        throw new Error(`Fixture test (204) failing 9. Not equal.`);
    }
    

    const in_10 = replace_all("abama")("a")(".");
    const mod_10 = test(in_10);
    const out_10 = ".b.m.";
    if (!equal(mod_10, out_10)) {
        console.log(mod_10);
        console.log(out_10);
        throw new Error(`Fixture test (204) failing 10. Not equal.`);
    }
    

    const in_11 = $eval("1 + 2");
    const mod_11 = test(in_11);
    const out_11 = 3;
    if (!equal(mod_11, out_11)) {
        console.log(mod_11);
        console.log(out_11);
        throw new Error(`Fixture test (204) failing 11. Not equal.`);
    }
    

    const in_12 = valueToString(some(3));
    const mod_12 = test(in_12);
    const out_12 = "(some 3)";
    if (!equal(mod_12, out_12)) {
        console.log(mod_12);
        console.log(out_12);
        throw new Error(`Fixture test (204) failing 12. Not equal.`);
    }
    

    const in_13 = unescapeString("\\n");
    const mod_13 = test(in_13);
    const out_13 = "\n";
    if (!equal(mod_13, out_13)) {
        console.log(mod_13);
        console.log(out_13);
        throw new Error(`Fixture test (204) failing 13. Not equal.`);
    }
    

    const in_14 = sanitize("a,b-c");
    const mod_14 = test(in_14);
    const out_14 = "a\$cob_c";
    if (!equal(mod_14, out_14)) {
        console.log(mod_14);
        console.log(out_14);
        throw new Error(`Fixture test (204) failing 14. Not equal.`);
    }
    

    const in_15 = equal(some(2))(some(2));
    const mod_15 = test(in_15);
    const out_15 = true;
    if (!equal(mod_15, out_15)) {
        console.log(mod_15);
        console.log(out_15);
        throw new Error(`Fixture test (204) failing 15. Not equal.`);
    }
    

    const in_16 = equal(some(2))(some(3));
    const mod_16 = test(in_16);
    const out_16 = false;
    if (!equal(mod_16, out_16)) {
        console.log(mod_16);
        console.log(out_16);
        throw new Error(`Fixture test (204) failing 16. Not equal.`);
    }
    

    const in_17 = int_to_string(23);
    const mod_17 = test(in_17);
    const out_17 = "23";
    if (!equal(mod_17, out_17)) {
        console.log(mod_17);
        console.log(out_17);
        throw new Error(`Fixture test (204) failing 17. Not equal.`);
    }
    

    const in_18 = string_to_int("23");
    const mod_18 = test(in_18);
    const out_18 = some(23);
    if (!equal(mod_18, out_18)) {
        console.log(mod_18);
        console.log(out_18);
        throw new Error(`Fixture test (204) failing 18. Not equal.`);
    }
    

    const in_19 = string_to_int("23a");
    const mod_19 = test(in_19);
    const out_19 = none;
    if (!equal(mod_19, out_19)) {
        console.log(mod_19);
        console.log(out_19);
        throw new Error(`Fixture test (204) failing 19. Not equal.`);
    }
    

    const in_20 = string_to_int("23.1");
    const mod_20 = test(in_20);
    const out_20 = none;
    if (!equal(mod_20, out_20)) {
        console.log(mod_20);
        console.log(out_20);
        throw new Error(`Fixture test (204) failing 20. Not equal.`);
    }
    

    const in_21 = string_to_int("23.0");
    const mod_21 = test(in_21);
    const out_21 = none;
    if (!equal(mod_21, out_21)) {
        console.log(mod_21);
        console.log(out_21);
        throw new Error(`Fixture test (204) failing 21. Not equal.`);
    }
    

    const in_22 = jsonify(some(2));
    const mod_22 = test(in_22);
    const out_22 = "{\"0\":2,\"type\":\"some\"}";
    if (!equal(mod_22, out_22)) {
        console.log(mod_22);
        console.log(out_22);
        throw new Error(`Fixture test (204) failing 22. Not equal.`);
    }
    
}
return 100