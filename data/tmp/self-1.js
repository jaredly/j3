// built by self-1.js:jcst.js:parse-self.js on 6/22/2024, 3:40:50 PM

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
    '()': '$unit', '(': '$lb', ')': '$rb',
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
    'float-to-string': a => a.toString(),
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
const {"+": $pl, "-": _, "<": $lt, "<=": $lt$eq, ">": $gt, ">=": $gt$eq, "=": $eq, "!=": $ex$eq, "pi": pi, "replace-all": replace_all, "eval": $eval, "eval-with": eval_with, "$unit": $unit, "errorToString": errorToString, "valueToString": valueToString, "unescapeString": unescapeString, "sanitize": sanitize, "equal": equal, "int-to-string": int_to_string, "float-to-string": float_to_string, "string-to-int": string_to_int, "string-to-float": string_to_float, "map/nil": map$slnil, "map/set": map$slset, "map/rm": map$slrm, "map/get": map$slget, "map/map": map$slmap, "map/merge": map$slmerge, "map/values": map$slvalues, "map/keys": map$slkeys, "map/from-list": map$slfrom_list, "map/to-list": map$slto_list, "set/nil": set$slnil, "set/add": set$sladd, "set/has": set$slhas, "set/rm": set$slrm, "set/diff": set$sldiff, "set/merge": set$slmerge, "set/overlap": set$sloverlap, "set/to-list": set$slto_list, "set/from-list": set$slfrom_list, "jsonify": jsonify, "fatal": fatal} = $builtins;
const pint = (v0) => (v1) => ({type: "pint", 0: v0, 1: v1})
const pbool = (v0) => (v1) => ({type: "pbool", 0: v0, 1: v1})
const maybe_parens = (inner) => (parens) => (($target) => {
if ($target === true) {
return `(${inner})`
}
return inner
throw new Error('Failed to match. ' + valueToString($target));
})(parens);

const compile_prim = (prim) => (($target) => {
if ($target.type === "pint") {
{
let int = $target[0];
return int_to_string(int)
}
}
if ($target.type === "pbool") {
{
let bool = $target[0];
return (($target) => {
if ($target === true) {
return "true"
}
if ($target === false) {
return "false"
}
throw new Error('Failed to match. ' + valueToString($target));
})(bool)
}
}
throw new Error('Failed to match. ' + valueToString($target));
})(prim);

const some = (v0) => ({type: "some", 0: v0})
const none = ({type: "none"})
const m = jsonify(1);

const $co = (v0) => (v1) => ({type: ",", 0: v0, 1: v1})
const builtins = "function equal(a, b) {\n    if (a === b) return true;\n\n    if (a && b && typeof a == 'object' && typeof b == 'object') {\n        var length, i, keys;\n        if (Array.isArray(a)) {\n            length = a.length;\n            if (length != b.length) return false;\n            for (i = length; i-- !== 0; ) if (!equal(a[i], b[i])) return false;\n            return true;\n        }\n\n        keys = Object.keys(a);\n        length = keys.length;\n        if (length !== Object.keys(b).length) return false;\n\n        for (i = length; i-- !== 0; ) {\n            if (!Object.prototype.hasOwnProperty.call(b, keys[i])) return false;\n        }\n\n        for (i = length; i-- !== 0; ) {\n            var key = keys[i];\n\n            if (!equal(a[key], b[key])) return false;\n        }\n\n        return true;\n    }\n\n    // true if both NaN, false otherwise\n    return a !== a && b !== b;\n}\n\nfunction unescapeString(n) {\n    if (n == null || !n.replaceAll) {\n        debugger;\n        return '';\n    }\n    return n.replaceAll(/\\\\./g, (m) => {\n        if (m[1] === 'n') {\n            return '\\n';\n        }\n        if (m[1] === 't') {\n            return '\\t';\n        }\n        if (m[1] === 'r') {\n            return '\\r';\n        }\n        return m[1];\n    });\n}\n\nfunction unwrapList(v) {\n  const res = [];\n  for (;v.type !== 'nil';v=v[1]) {\n    res.push(v[0]);\n  }\n  return res;\n}\n\nfunction wrapList(v) {\n    let res = { type: 'nil' };\n    for (let i = v.length - 1; i >= 0; i--) {\n        res = { type: 'cons', 0: v[i], 1: res };\n    }\n    return res;\n}\n\nconst sanMap = {\n    // '\$\$\$\$' gets interpreted by replaceAll as '\$\$', for reasons\n    \$: '\$\$\$\$',\n    '-': '_',\n    '+': '\$pl',\n    '*': '\$ti',\n    '=': '\$eq',\n    '>': '\$gt',\n    '<': '\$lt',\n    \"'\": '\$qu',\n    '\"': '\$dq',\n    ',': '\$co',\n    '/': '\$sl',\n    ';': '\$semi',\n    '@': '\$at',\n    ':': '\$cl',\n    '#': '\$ha',\n    '!': '\$ex',\n    '|': '\$bar',\n    '()': '\$unit',\n    '?': '\$qe',\n  };\nconst kwds =\n    'case new var const let if else return super break while for default eval'.split(' ');\n\n// Convert an identifier into a valid js identifier, replacing special characters, and accounting for keywords.\nfunction sanitize(raw) {\n    for (let [key, val] of Object.entries(sanMap)) {\n        raw = raw.replaceAll(key, val);\n    }\n    if (kwds.includes(raw)) return '\$' + raw\n    return raw\n}\n\nconst valueToString = (v) => {\n    if (Array.isArray(v)) {\n        return \`[\${v.map(valueToString).join(', ')}]\`;\n    }\n    if (typeof v === 'object' && v && 'type' in v) {\n        if (v.type === 'cons' || v.type === 'nil') {\n            const un = unwrapList(v);\n            return '[' + un.map(valueToString).join(' ') + ']';\n        }\n\n        let args = [];\n        for (let i = 0; i in v; i++) {\n            args.push(v[i]);\n        }\n        return \`(\${v.type}\${args\n            .map((arg) => ' ' + valueToString(arg))\n            .join('')})\`;\n    }\n    if (typeof v === 'string') {\n        if (v.includes('\"') && !v.includes(\"'\")) {\n            return (\n                \"'\" + JSON.stringify(v).slice(1, -1).replace(/\\\"/g, '\"') + \"'\"\n            );\n        }\n        return JSON.stringify(v);\n    }\n    if (typeof v === 'function') {\n        return '<function>';\n    }\n\n    return '' + v;\n};\n\nreturn {\n    '+': (a) => (b) => a + b,\n    '-': (a) => (b) => a - b,\n    '<': (a) => (b) => a < b,\n    '<=': (a) => (b) => a <= b,\n    '>': (a) => (b) => a > b,\n    '>=': (a) => (b) => a >= b,\n    '=': (a) => (b) => equal(a, b),\n    '!=': (a) => (b) => !equal(a, b),\n    pi: Math.PI,\n    'replace-all': a => b => c => a.replaceAll(b, c),\n    eval: source => {\n      return new Function('', 'return ' + source)();\n    },\n    'eval-with': ctx => source => {\n      const args = '{' + Object.keys(ctx).join(',') + '}'\n      return new Function(args, 'return ' + source)(ctx);\n    },\n    \$unit: null,\n    errorToString: f => arg => {\n      try {\n        return f(arg)\n      } catch (err) {\n        return err.message;\n      }\n    },\n    valueToString,\n    unescapeString,\n    sanitize,\n    equal: a => b => equal(a, b),\n    'int-to-string': (a) => a.toString(),\n    'float-to-string': a => a.toString(),\n    'string-to-int': (a) => {\n        const v = Number(a);\n        return Number.isInteger(v) && v.toString() === a ? { type: 'some', 0: v } : { type: 'none' };\n    },\n    'string-to-float': (a) => {\n        const v = Number(a);\n        return Number.isFinite(v) ? { type: 'some', 0: v } : { type: 'none' };\n    },\n\n    // maps\n    'map/nil': [],\n    'map/set': (map) => (key) => (value) =>\n        [[key, value], ...map.filter((i) => i[0] !== key)],\n    'map/rm': (map) => (key) => map.filter((i) => !equal(i[0], key)),\n    'map/get': (map) => (key) => {\n        const found = map.find((i) => equal(i[0], key));\n        return found ? { type: 'some', 0: found[1] } : { type: 'none' };\n    },\n    'map/map': (fn) => (map) => map.map(([k, v]) => [k, fn(v)]),\n    'map/merge': (one) => (two) =>\n        [...one, ...two.filter(([key]) => !one.find(([a]) => equal(a, key)))],\n    'map/values': (map) => wrapList(map.map((item) => item[1])),\n    'map/keys': (map) => wrapList(map.map((item) => item[0])),\n    'map/from-list': (list) =>\n        unwrapList(list).map((pair) => [pair[0], pair[1]]),\n    'map/to-list': (map) =>\n        wrapList(map.map(([key, value]) => ({ type: ',', 0: key, 1: value }))),\n\n    // sets\n    'set/nil': [],\n    'set/add': (s) => (v) => [v, ...s.filter((m) => !equal(v, m))],\n    'set/has': (s) => (v) => s.includes(v),\n    'set/rm': (s) => (v) => s.filter((i) => !equal(i, v)),\n    // NOTE this is only working for primitives\n    'set/diff': (a) => (b) => a.filter((i) => !b.some((j) => equal(i, j))),\n    'set/merge': (a) => (b) =>\n        [...a, ...b.filter((x) => !a.some((y) => equal(y, x)))],\n    'set/overlap': (a) => (b) => a.filter((x) => b.some((y) => equal(y, x))),\n    'set/to-list': wrapList,\n    'set/from-list': (s) => {\n        const res = [];\n        unwrapList(s).forEach((item) => {\n            if (res.some((m) => equal(item, m))) {\n                return;\n            }\n            res.push(item);\n        });\n        return res;\n    },\n\n    // Various debugging stuff\n    jsonify: (v) => JSON.stringify(v) ?? 'undefined',\n    fatal: (message) => {\n        throw new Error(\`Fatal runtime: \${message}\`);\n    },\n}";

const builtins_for_eval = $eval("builtins => sanitize => {\n  const san = {}\n  Object.keys(builtins).forEach(k => san[sanitize(k)] = builtins[k])\n  return san\n}")($eval(`(() => {${builtins}})()`))(sanitize);

const eval_with_builtins = eval_with(builtins_for_eval);

const tvar = (v0) => (v1) => ({type: "tvar", 0: v0, 1: v1})
const tapp = (v0) => (v1) => (v2) => ({type: "tapp", 0: v0, 1: v1, 2: v2})
const tcon = (v0) => (v1) => ({type: "tcon", 0: v0, 1: v1})
const nil = ({type: "nil"})
const cons = (v0) => (v1) => ({type: "cons", 0: v0, 1: v1})
const cst$slidentifier = (v0) => (v1) => ({type: "cst/identifier", 0: v0, 1: v1})
const cst$sllist = (v0) => (v1) => ({type: "cst/list", 0: v0, 1: v1})
const cst$slarray = (v0) => (v1) => ({type: "cst/array", 0: v0, 1: v1})
const cst$slrecord = (v0) => (v1) => ({type: "cst/record", 0: v0, 1: v1})
const cst$slspread = (v0) => (v1) => ({type: "cst/spread", 0: v0, 1: v1})
const cst$slstring = (v0) => (v1) => (v2) => ({type: "cst/string", 0: v0, 1: v1, 2: v2})
const join = (sep) => (items) => (($target) => {
if ($target.type === "nil") {
return ""
}
if ($target.type === "cons") {
{
let one = $target[0];
let rest = $target[1];
return (($target) => {
if ($target.type === "nil") {
return one
}
return `${one}${sep}${join(sep)(rest)}`
throw new Error('Failed to match. ' + valueToString($target));
})(rest)
}
}
throw new Error('Failed to match. ' + valueToString($target));
})(items);

const map = (values) => (f) => (($target) => {
if ($target.type === "nil") {
return nil
}
if ($target.type === "cons") {
{
let one = $target[0];
let rest = $target[1];
return cons(f(one))(map(rest)(f))
}
}
throw new Error('Failed to match. ' + valueToString($target));
})(values);

const foldl = (init) => (items) => (f) => (($target) => {
if ($target.type === "nil") {
return init
}
if ($target.type === "cons") {
{
let one = $target[0];
let rest = $target[1];
return foldl(f(init)(one))(rest)(f)
}
}
throw new Error('Failed to match. ' + valueToString($target));
})(items);

const mapi = (i) => (values) => (f) => (($target) => {
if ($target.type === "nil") {
return nil
}
if ($target.type === "cons") {
{
let one = $target[0];
let rest = $target[1];
return cons(f(i)(one))(mapi($pl(1)(i))(rest)(f))
}
}
throw new Error('Failed to match. ' + valueToString($target));
})(values);

const foldr = (init) => (items) => (f) => (($target) => {
if ($target.type === "nil") {
return init
}
if ($target.type === "cons") {
{
let one = $target[0];
let rest = $target[1];
return f(foldr(init)(rest)(f))(one)
}
}
throw new Error('Failed to match. ' + valueToString($target));
})(items);

const replaces = (target) => (repl) => (($target) => {
if ($target.type === "nil") {
return target
}
if ($target.type === "cons") {
{
let one = $target[0];
let rest = $target[1];
return (($target) => {
if ($target.type === ",") {
{
let find = $target[0];
let nw = $target[1];
return replaces(replace_all(target)(find)(nw))(rest)
}
}
throw new Error('Failed to match. ' + valueToString($target));
})(one)
}
}
throw new Error('Failed to match. ' + valueToString($target));
})(repl);

const constructor_fn = (name) => (args) => `({type: \"${name}\"${join("")(mapi(0)(args)((i) => (arg) => `, ${int_to_string(i)}: ${arg}`))}})`;

const escape_string = (string) => replaces(string)(cons($co("\\")("\\\\"))(cons($co("\n")("\\n"))(cons($co("\"")("\\\""))(cons($co("\`")("\\\`"))(cons($co("\$")("\\\$"))(nil))))));

const indices = (lst) => mapi(0)(lst)((i) => (_) => i);

const concat = (lsts) => (($target) => {
if ($target.type === "nil") {
return nil
}
if ($target.type === "cons" &&
$target[1].type === "nil") {
{
let one = $target[0];
return one
}
}
if ($target.type === "cons" &&
$target[0].type === "nil") {
{
let rest = $target[1];
return concat(rest)
}
}
if ($target.type === "cons" &&
$target[0].type === "cons") {
{
let one = $target[0][0];
let rest = $target[0][1];
let lsts = $target[1];
return cons(one)(concat(cons(rest)(lsts)))
}
}
throw new Error('Failed to match. ' + valueToString($target));
})(lsts);

const fix_slashes = (str) => escape_string(unescapeString(str));

const pany = (v0) => ({type: "pany", 0: v0})
const pvar = (v0) => (v1) => ({type: "pvar", 0: v0, 1: v1})
const pprim = (v0) => (v1) => ({type: "pprim", 0: v0, 1: v1})
const pstr = (v0) => (v1) => ({type: "pstr", 0: v0, 1: v1})
const pcon = (v0) => (v1) => (v2) => (v3) => ({type: "pcon", 0: v0, 1: v1, 2: v2, 3: v3})
const tdeftype = (v0) => (v1) => (v2) => (v3) => (v4) => ({type: "tdeftype", 0: v0, 1: v1, 2: v2, 3: v3, 4: v4})
const tdef = (v0) => (v1) => (v2) => (v3) => ({type: "tdef", 0: v0, 1: v1, 2: v2, 3: v3})
const texpr = (v0) => (v1) => ({type: "texpr", 0: v0, 1: v1})
const ttypealias = ({type: "ttypealias"})

const eprim = (v0) => (v1) => ({type: "eprim", 0: v0, 1: v1})
const estr = (v0) => (v1) => (v2) => ({type: "estr", 0: v0, 1: v1, 2: v2})
const evar = (v0) => (v1) => ({type: "evar", 0: v0, 1: v1})
const equot = (v0) => (v1) => ({type: "equot", 0: v0, 1: v1})
const elambda = (v0) => (v1) => (v2) => ({type: "elambda", 0: v0, 1: v1, 2: v2})
const eapp = (v0) => (v1) => (v2) => ({type: "eapp", 0: v0, 1: v1, 2: v2})
const elet = (v0) => (v1) => (v2) => ({type: "elet", 0: v0, 1: v1, 2: v2})
const ematch = (v0) => (v1) => (v2) => ({type: "ematch", 0: v0, 1: v1, 2: v2})

const quot$slexpr = (v0) => ({type: "quot/expr", 0: v0})
const quot$sltop = (v0) => ({type: "quot/top", 0: v0})
const quot$sltype = (v0) => ({type: "quot/type", 0: v0})
const quot$slpat = (v0) => ({type: "quot/pat", 0: v0})
const quot$slquot = (v0) => ({type: "quot/quot", 0: v0})
const compile_pat_naive = (pat) => (target) => (inner) => (($target) => {
if ($target.type === "pany") {
return inner
}
if ($target.type === "pprim") {
{
let prim = $target[0];
return `if (${target} === ${compile_prim(prim)}) {\n${inner}\n}`
}
}
if ($target.type === "pstr") {
{
let str = $target[0];
return `if (${target} === \"${str}\"){\n${inner}\n}`
}
}
if ($target.type === "pvar") {
{
let name = $target[0];
return `{\nlet ${sanitize(name)} = ${target};\n${inner}\n}`
}
}
if ($target.type === "pcon") {
{
let name = $target[0];
let args = $target[2];
return `if (${target}.type === \"${name}\") {\n${pat_loop(target)(args)(0)(inner)}\n}`
}
}
throw new Error('Failed to match. ' + valueToString($target));
})(pat);


const pat_loop = (target) => (args) => (i) => (inner) => (($target) => {
if ($target.type === "nil") {
return inner
}
if ($target.type === "cons") {
{
let arg = $target[0];
let rest = $target[1];
return compile_pat_naive(arg)(`${target}[${int_to_string(i)}]`)(pat_loop(target)(rest)($pl(i)(1))(inner))
}
}
throw new Error('Failed to match. ' + valueToString($target));
})(args);

const compile_pat_list = (pat) => (target) => (($target) => {
if ($target.type === "pany") {
return $co(nil)(nil)
}
if ($target.type === "pprim") {
{
let prim = $target[0];
return $co(cons(`${target} === ${compile_prim(prim)}`)(nil))(nil)
}
}
if ($target.type === "pstr") {
{
let str = $target[0];
return $co(cons(`${target} === \"${str}\"`)(nil))(nil)
}
}
if ($target.type === "pvar") {
{
let name = $target[0];
return $co(nil)(cons(`let ${sanitize(name)} = ${target};`)(nil))
}
}
if ($target.type === "pcon") {
{
let name = $target[0];
let args = $target[2];
return (({1: assign, 0: check}) => $co(cons(`${target}.type === \"${name}\"`)(check))(assign))(pat_loop_list(target)(args)(0))
}
}
throw new Error('Failed to match. ' + valueToString($target));
})(pat);


const pat_loop_list = (target) => (args) => (i) => (($target) => {
if ($target.type === "nil") {
return $co(nil)(nil)
}
if ($target.type === "cons") {
{
let arg = $target[0];
let rest = $target[1];
return (({1: assign, 0: check}) => (({1: a2, 0: c2}) => $co(concat(cons(check)(cons(c2)(nil))))(concat(cons(assign)(cons(a2)(nil)))))(pat_loop_list(target)(rest)($pl(i)(1))))(compile_pat_list(arg)(`${target}[${int_to_string(i)}]`))
}
}
throw new Error('Failed to match. ' + valueToString($target));
})(args);

const pat_as_arg_inner = (pat) => (($target) => {
if ($target.type === "pany") {
return none
}
if ($target.type === "pprim") {
return none
}
if ($target.type === "pstr") {
return none
}
if ($target.type === "pvar") {
{
let name = $target[0];
return some(sanitize(name))
}
}
if ($target.type === "pcon") {
{
let args = $target[2];
return (($target) => {
if ($target.type === "," &&
$target[1].type === "nil") {
return none
}
if ($target.type === ",") {
{
let args = $target[1];
return some(`{${join(", ")(args)}}`)
}
}
throw new Error('Failed to match. ' + valueToString($target));
})(foldl($co(0)(nil))(args)(({1: res, 0: i}) => (arg) => $co($pl(i)(1))((($target) => {
if ($target.type === "none") {
return res
}
if ($target.type === "some") {
{
let arg = $target[0];
return cons(`${int_to_string(i)}: ${arg}`)(res)
}
}
throw new Error('Failed to match. ' + valueToString($target));
})(pat_as_arg_inner(arg)))))
}
}
return fatal(`No pat ${jsonify(pat)}`)
throw new Error('Failed to match. ' + valueToString($target));
})(pat);

const needs_parens = (expr) => (($target) => {
if ($target.type === "elambda") {
return true
}
if ($target.type === "eprim") {
return true
}
return false
throw new Error('Failed to match. ' + valueToString($target));
})(expr);

const compile_quot = (quot) => (($target) => {
if ($target.type === "quot/quot") {
{
let x = $target[0];
return jsonify(x)
}
}
if ($target.type === "quot/expr") {
{
let x = $target[0];
return jsonify(x)
}
}
if ($target.type === "quot/top") {
{
let x = $target[0];
return jsonify(x)
}
}
if ($target.type === "quot/pat") {
{
let x = $target[0];
return jsonify(x)
}
}
if ($target.type === "quot/type") {
{
let x = $target[0];
return jsonify(x)
}
}
throw new Error('Failed to match. ' + valueToString($target));
})(quot);

const compile_pat = (pat) => (target) => (inner) => (({1: assign, 0: check}) => ((inner) => ((inner) => inner)((($target) => {
if ($target.type === "nil") {
return inner
}
return `if (${join(" &&\n")(check)}) {\n${inner}\n}`
throw new Error('Failed to match. ' + valueToString($target));
})(check)))((($target) => {
if ($target.type === "nil") {
return inner
}
return `{\n${join("\n")(assign)}\n${inner}\n}`
throw new Error('Failed to match. ' + valueToString($target));
})(assign)))(compile_pat_list(pat)(target));

const pat_as_arg = (pat) => (($target) => {
if ($target.type === "none") {
return "_"
}
if ($target.type === "some") {
{
let arg = $target[0];
return arg
}
}
throw new Error('Failed to match. ' + valueToString($target));
})(pat_as_arg_inner(pat));

const compile = (expr) => (($target) => {
if ($target.type === "estr") {
{
let first = $target[0];
let tpls = $target[1];
return (($target) => {
if ($target.type === "nil") {
return `\"${fix_slashes(first)}\"`
}
return ((tpls) => `\`${fix_slashes(first)}${join("")(tpls)}\``)(map(tpls)(({1: {0: suffix}, 0: expr}) => `\${${compile(expr)}}${fix_slashes(suffix)}`))
throw new Error('Failed to match. ' + valueToString($target));
})(tpls)
}
}
if ($target.type === "eprim") {
{
let prim = $target[0];
return compile_prim(prim)
}
}
if ($target.type === "evar") {
{
let name = $target[0];
return sanitize(name)
}
}
if ($target.type === "equot") {
{
let inner = $target[0];
return compile_quot(inner)
}
}
if ($target.type === "elambda") {
{
let pats = $target[0];
let body = $target[1];
return foldr(compile(body))(pats)((body) => (pat) => `(${pat_as_arg(pat)}) => ${body}`)
}
}
if ($target.type === "elet") {
{
let bindings = $target[0];
let body = $target[1];
return foldr(compile(body))(bindings)((body) => ({1: init, 0: pat}) => `((${pat_as_arg(pat)}) => ${body})(${compile(init)})`)
}
}
if ($target.type === "eapp") {
{
let f = $target[0];
let args = $target[1];
return foldl(with_parens(f))(args)((target) => (arg) => `${target}(${compile(arg)})`)
}
}
if ($target.type === "ematch") {
{
let target = $target[0];
let cases = $target[1];
return ((cases) => `((\$target) => {\n${join("\n")(cases)}\nthrow new Error('Failed to match. ' + valueToString(\$target));\n})(${compile(target)})`)(map(cases)(($case) => (({1: body, 0: pat}) => compile_pat(pat)("\$target")(`return ${compile(body)}`))($case)))
}
}
throw new Error('Failed to match. ' + valueToString($target));
})(expr);


const with_parens = (expr) => maybe_parens(compile(expr))(needs_parens(expr));

const compile_top = (top) => (($target) => {
if ($target.type === "texpr") {
{
let expr = $target[0];
return compile(expr)
}
}
if ($target.type === "tdef") {
{
let name = $target[0];
let body = $target[2];
return `const ${sanitize(name)} = ${compile(body)};\n`
}
}
if ($target.type === "tdeftype") {
{
let name = $target[0];
let cases = $target[3];
return join("\n")(map(cases)(($case) => (({1: {1: {0: args}}, 0: name}) => ((arrows) => ((body) => `const ${sanitize(name)} = ${arrows}${body}`)(constructor_fn(name)(map(indices(args))((i) => `v${int_to_string(i)}`))))(join("")(map(indices(args))((i) => `(v${int_to_string(i)}) => `))))($case)))
}
}
if ($target.type === "ttypealias") {
return "/* type alias */"
}
throw new Error('Failed to match. ' + valueToString($target));
})(top);

return $eval("compile => compile_top => builtins => ({type:'fns',  compile: a => _ => compile(a), compile_stmt: a => _ => compile_top(a), builtins})")(compile)(compile_top)(builtins)