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
const some = (v0) => ({type: "some", 0: v0})
const none = ({type: "none"})
const its = int_to_string;

const value = ({type: "value"})
const type = ({type: "type"})
const dot = (a) => (b) => (c) => a(b(c));

const just_trace = (loc) => (trace) => (value) => (($target) => {
if ($target.type === "none") {
return ""
}
if ($target.type === "some") {
{
let info = $target[0];
return `\$trace(${its(loc)}, ${jsonify(info)}, ${value});`
}
}
throw new Error('Failed to match. ' + valueToString($target));
})(map$slget(trace)(loc));

const j$slint = (v0) => (v1) => ({type: "j/int", 0: v0, 1: v1})
const j$slfloat = (v0) => (v1) => ({type: "j/float", 0: v0, 1: v1})
const j$slbool = (v0) => (v1) => ({type: "j/bool", 0: v0, 1: v1})
const j$slspread = (v0) => ({type: "j/spread", 0: v0})
const left = (v0) => ({type: "left", 0: v0})
const right = (v0) => ({type: "right", 0: v0})
const j$slcompile_prim = (ctx) => (prim) => (($target) => {
if ($target.type === "j/int") {
{
let int = $target[0];
let l = $target[1];
return int_to_string(int)
}
}
if ($target.type === "j/float") {
{
let float = $target[0];
let l = $target[1];
return jsonify(float)
}
}
if ($target.type === "j/bool") {
{
let bool = $target[0];
let l = $target[1];
return (($target) => {
if ($target === true) {
return "true"
}
return "false"
throw new Error('Failed to match. ' + valueToString($target));
})(bool)
}
}
throw new Error('Failed to match. ' + valueToString($target));
})(prim);

const maybe_paren = (text) => (wrap) => (($target) => {
if ($target === true) {
return `(${text})`
}
return text
throw new Error('Failed to match. ' + valueToString($target));
})(wrap);

const map_opt = (v) => (f) => (($target) => {
if ($target.type === "none") {
return none
}
if ($target.type === "some") {
{
let v = $target[0];
return some(f(v))
}
}
throw new Error('Failed to match. ' + valueToString($target));
})(v);

const apply_until = (f) => (v) => (($target) => {
if ($target.type === "some") {
{
let v = $target[0];
return apply_until(f)(v)
}
}
if ($target.type === "none") {
return v
}
throw new Error('Failed to match. ' + valueToString($target));
})(f(v));

const fold$sloption = (inner) => (init) => (value) => (($target) => {
if ($target.type === "none") {
return init
}
if ($target.type === "some") {
{
let v = $target[0];
return inner(init)(v)
}
}
throw new Error('Failed to match. ' + valueToString($target));
})(value);

const fold$sleither = (fleft) => (fright) => (init) => (value) => (($target) => {
if ($target.type === "left") {
{
let l = $target[0];
return fleft(init)(l)
}
}
if ($target.type === "right") {
{
let r = $target[0];
return fright(init)(r)
}
}
throw new Error('Failed to match. ' + valueToString($target));
})(value);

const fold$slget = (get) => (f) => (init) => (value) => f(init)(get(value));

const spread$slinner = ({0: inner}) => inner;

const nop = (a) => (b) => a;

const force_opt = (x) => (($target) => {
if ($target.type === "none") {
return fatal("empty")
}
if ($target.type === "some") {
{
let x = $target[0];
return x
}
}
throw new Error('Failed to match. ' + valueToString($target));
})(x);

const id = (x) => x;

const loop = (init) => (f) => f(init)((v) => loop(v)(f));

const map_some = (f) => (v) => (($target) => {
if ($target.type === "some") {
{
let v = $target[0];
return some(f(v))
}
}
return none
throw new Error('Failed to match. ' + valueToString($target));
})(v);

const $co = (v0) => (v1) => ({type: ",", 0: v0, 1: v1})
const usage = (v0) => ({type: "usage", 0: v0})
const decl = ({type: "decl"})
const builtins = "function equal(a, b) {\n    if (a === b) return true;\n\n    if (a && b && typeof a == 'object' && typeof b == 'object') {\n        var length, i, keys;\n        if (Array.isArray(a)) {\n            length = a.length;\n            if (length != b.length) return false;\n            for (i = length; i-- !== 0; ) if (!equal(a[i], b[i])) return false;\n            return true;\n        }\n\n        keys = Object.keys(a);\n        length = keys.length;\n        if (length !== Object.keys(b).length) return false;\n\n        for (i = length; i-- !== 0; ) {\n            if (!Object.prototype.hasOwnProperty.call(b, keys[i])) return false;\n        }\n\n        for (i = length; i-- !== 0; ) {\n            var key = keys[i];\n\n            if (!equal(a[key], b[key])) return false;\n        }\n\n        return true;\n    }\n\n    // true if both NaN, false otherwise\n    return a !== a && b !== b;\n}\n\nfunction unescapeString(n) {\n    if (n == null || !n.replaceAll) {\n        debugger;\n        return '';\n    }\n    return n.replaceAll(/\\\\./g, (m) => {\n        if (m[1] === 'n') {\n            return '\\n';\n        }\n        if (m[1] === 't') {\n            return '\\t';\n        }\n        if (m[1] === 'r') {\n            return '\\r';\n        }\n        return m[1];\n    });\n}\n\nfunction unwrapList(v) {\n    return v.type === 'nil' ? [] : [v[0], ...unwrapList(v[1])];\n}\n\nfunction wrapList(v) {\n    let res = { type: 'nil' };\n    for (let i = v.length - 1; i >= 0; i--) {\n        res = { type: 'cons', 0: v[i], 1: res };\n    }\n    return res;\n}\n\nconst sanMap = {\n    // '\$\$\$\$' gets interpreted by replaceAll as '\$\$', for reasons\n    \$: '\$\$\$\$',\n    '-': '_',\n    '+': '\$pl',\n    '*': '\$ti',\n    '=': '\$eq',\n    '>': '\$gt',\n    '<': '\$lt',\n    \"'\": '\$qu',\n    '\"': '\$dq',\n    ',': '\$co',\n    '/': '\$sl',\n    ';': '\$semi',\n    '@': '\$at',\n    ':': '\$cl',\n    '#': '\$ha',\n    '!': '\$ex',\n    '|': '\$bar',\n    '()': '\$unit',\n    '?': '\$qe',\n  };\nconst kwds =\n    'case new var const let if else return super break while for default eval'.split(' ');\n\n// Convert an identifier into a valid js identifier, replacing special characters, and accounting for keywords.\nfunction sanitize(raw) {\n    for (let [key, val] of Object.entries(sanMap)) {\n        raw = raw.replaceAll(key, val);\n    }\n    if (kwds.includes(raw)) return '\$' + raw\n    return raw\n}\n\nconst valueToString = (v) => {\n    if (Array.isArray(v)) {\n        return \`[\${v.map(valueToString).join(', ')}]\`;\n    }\n    if (typeof v === 'object' && v && 'type' in v) {\n        if (v.type === 'cons' || v.type === 'nil') {\n            const un = unwrapList(v);\n            return '[' + un.map(valueToString).join(' ') + ']';\n        }\n\n        let args = [];\n        for (let i = 0; i in v; i++) {\n            args.push(v[i]);\n        }\n        return \`(\${v.type}\${args\n            .map((arg) => ' ' + valueToString(arg))\n            .join('')})\`;\n    }\n    if (typeof v === 'string') {\n        if (v.includes('\"') && !v.includes(\"'\")) {\n            return (\n                \"'\" + JSON.stringify(v).slice(1, -1).replace(/\\\"/g, '\"') + \"'\"\n            );\n        }\n        return JSON.stringify(v);\n    }\n    if (typeof v === 'function') {\n        return '<function>';\n    }\n\n    return '' + v;\n};\n\nreturn {\n    '+': (a) => (b) => a + b,\n    '-': (a) => (b) => a - b,\n    '<': (a) => (b) => a < b,\n    '<=': (a) => (b) => a <= b,\n    '>': (a) => (b) => a > b,\n    '>=': (a) => (b) => a >= b,\n    '=': (a) => (b) => equal(a, b),\n    '!=': (a) => (b) => !equal(a, b),\n    pi: Math.PI,\n    'replace-all': a => b => c => a.replaceAll(b, c),\n    eval: source => {\n      return new Function('', 'return ' + source)();\n    },\n    'eval-with': ctx => source => {\n      const args = '{' + Object.keys(ctx).join(',') + '}'\n      return new Function(args, 'return ' + source)(ctx);\n    },\n    \$unit: null,\n    errorToString: f => arg => {\n      try {\n        return f(arg)\n      } catch (err) {\n        return err.message;\n      }\n    },\n    valueToString,\n    unescapeString,\n    sanitize,\n    equal: a => b => equal(a, b),\n    'int-to-string': (a) => a.toString(),\n    'string-to-int': (a) => {\n        const v = Number(a);\n        return Number.isInteger(v) && v.toString() === a ? { type: 'some', 0: v } : { type: 'none' };\n    },\n    'string-to-float': (a) => {\n        const v = Number(a);\n        return Number.isFinite(v) ? { type: 'some', 0: v } : { type: 'none' };\n    },\n\n    // maps\n    'map/nil': [],\n    'map/set': (map) => (key) => (value) =>\n        [[key, value], ...map.filter((i) => i[0] !== key)],\n    'map/rm': (map) => (key) => map.filter((i) => !equal(i[0], key)),\n    'map/get': (map) => (key) => {\n        const found = map.find((i) => equal(i[0], key));\n        return found ? { type: 'some', 0: found[1] } : { type: 'none' };\n    },\n    'map/map': (fn) => (map) => map.map(([k, v]) => [k, fn(v)]),\n    'map/merge': (one) => (two) =>\n        [...one, ...two.filter(([key]) => !one.find(([a]) => equal(a, key)))],\n    'map/values': (map) => wrapList(map.map((item) => item[1])),\n    'map/keys': (map) => wrapList(map.map((item) => item[0])),\n    'map/from-list': (list) =>\n        unwrapList(list).map((pair) => [pair[0], pair[1]]),\n    'map/to-list': (map) =>\n        wrapList(map.map(([key, value]) => ({ type: ',', 0: key, 1: value }))),\n\n    // sets\n    'set/nil': [],\n    'set/add': (s) => (v) => [v, ...s.filter((m) => !equal(v, m))],\n    'set/has': (s) => (v) => s.includes(v),\n    'set/rm': (s) => (v) => s.filter((i) => !equal(i, v)),\n    // NOTE this is only working for primitives\n    'set/diff': (a) => (b) => a.filter((i) => !b.some((j) => equal(i, j))),\n    'set/merge': (a) => (b) =>\n        [...a, ...b.filter((x) => !a.some((y) => equal(y, x)))],\n    'set/overlap': (a) => (b) => a.filter((x) => b.some((y) => equal(y, x))),\n    'set/to-list': wrapList,\n    'set/from-list': (s) => {\n        const res = [];\n        unwrapList(s).forEach((item) => {\n            if (res.some((m) => equal(item, m))) {\n                return;\n            }\n            res.push(item);\n        });\n        return res;\n    },\n\n    // Various debugging stuff\n    jsonify: (v) => JSON.stringify(v) ?? 'undefined',\n    fatal: (message) => {\n        throw new Error(\`Fatal runtime: \${message}\`);\n    },\n}";

const renum = ({type: "renum"})
const rrecord = ({type: "rrecord"})
const map_opt$qe = (f) => (v) => (($target) => {
if ($target.type === "some") {
{
let v = $target[0];
return f(v)
}
}
return none
throw new Error('Failed to match. ' + valueToString($target));
})(v);

const map_or = (f) => (or) => (v) => (($target) => {
if ($target.type === "some") {
{
let v = $target[0];
return f(v)
}
}
return or
throw new Error('Failed to match. ' + valueToString($target));
})(v);

const parse_tag = $eval("v => v.startsWith('\\'') ? {type: 'some', 0: v.slice(1)} : {type: 'none'}");

const is_earmuffs = $eval("v => v.startsWith('*') && v.endsWith('*') && v.length > 2");

const is_bang = $eval("v => v.startsWith('!')");

const is_arrow = $eval("v => v.startsWith('<-')");

const nil = ({type: "nil"})
const cons = (v0) => (v1) => ({type: "cons", 0: v0, 1: v1})
const pany = (v0) => ({type: "pany", 0: v0})
const pvar = (v0) => (v1) => ({type: "pvar", 0: v0, 1: v1})
const pcon = (v0) => (v1) => (v2) => (v3) => ({type: "pcon", 0: v0, 1: v1, 2: v2, 3: v3})
const pstr = (v0) => (v1) => ({type: "pstr", 0: v0, 1: v1})
const pprim = (v0) => (v1) => ({type: "pprim", 0: v0, 1: v1})
const precord = (v0) => (v1) => (v2) => ({type: "precord", 0: v0, 1: v1, 2: v2})
const penum = (v0) => (v1) => (v2) => (v3) => ({type: "penum", 0: v0, 1: v1, 2: v2, 3: v3})
const tvar = (v0) => (v1) => ({type: "tvar", 0: v0, 1: v1})
const tapp = (v0) => (v1) => (v2) => ({type: "tapp", 0: v0, 1: v1, 2: v2})
const tcon = (v0) => (v1) => ({type: "tcon", 0: v0, 1: v1})
const trec = (v0) => (v1) => (v2) => (v3) => ({type: "trec", 0: v0, 1: v1, 2: v2, 3: v3})
const trow = (v0) => (v1) => (v2) => (v3) => ({type: "trow", 0: v0, 1: v1, 2: v2, 3: v3})
const cst$sllist = (v0) => (v1) => ({type: "cst/list", 0: v0, 1: v1})
const cst$slarray = (v0) => (v1) => ({type: "cst/array", 0: v0, 1: v1})
const cst$slspread = (v0) => (v1) => ({type: "cst/spread", 0: v0, 1: v1})
const cst$slrecord = (v0) => (v1) => ({type: "cst/record", 0: v0, 1: v1})
const cst$slaccess = (v0) => (v1) => (v2) => ({type: "cst/access", 0: v0, 1: v1, 2: v2})
const cst$slid = (v0) => (v1) => ({type: "cst/id", 0: v0, 1: v1})
const cst$slstring = (v0) => (v1) => (v2) => ({type: "cst/string", 0: v0, 1: v1, 2: v2})
const one = (v0) => ({type: "one", 0: v0})
const many = (v0) => ({type: "many", 0: v0})
const empty = ({type: "empty"})
const j$slpvar = (v0) => (v1) => ({type: "j/pvar", 0: v0, 1: v1})
const j$slparray = (v0) => (v1) => (v2) => ({type: "j/parray", 0: v0, 1: v1, 2: v2})
const j$slpobj = (v0) => (v1) => (v2) => ({type: "j/pobj", 0: v0, 1: v1, 2: v2})
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

const snd = (tuple) => (({1: v}) => v)(tuple);

const fst = (tuple) => (({0: v}) => v)(tuple);

const tapps = (items) => (l) => (($target) => {
if ($target.type === "nil") {
return fatal("empty tapps")
}
if ($target.type === "cons" &&
$target[1].type === "nil") {
{
let one = $target[0];
return one
}
}
if ($target.type === "cons") {
{
let one = $target[0];
let rest = $target[1];
return tapp(tapps(rest)(l))(one)(l)
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

const escape_string = (string) => replaces(string)(cons($co("\\")("\\\\"))(cons($co("\n")("\\n"))(cons($co("\"")("\\\""))(cons($co("\`")("\\\`"))(cons($co("\$")("\\\$"))(nil))))));

const pat_loc = (pat) => (($target) => {
if ($target.type === "pany") {
{
let l = $target[0];
return l
}
}
if ($target.type === "pprim") {
{
let l = $target[1];
return l
}
}
if ($target.type === "pstr") {
{
let l = $target[1];
return l
}
}
if ($target.type === "pvar") {
{
let l = $target[1];
return l
}
}
if ($target.type === "pcon") {
{
let l = $target[3];
return l
}
}
if ($target.type === "precord") {
{
let l = $target[2];
return l
}
}
if ($target.type === "penum") {
{
let l = $target[3];
return l
}
}
throw new Error('Failed to match. ' + valueToString($target));
})(pat);

const trace_wrap = (loc) => (trace) => (js) => (($target) => {
if ($target.type === "none") {
return js
}
if ($target.type === "some") {
{
let info = $target[0];
return `\$trace(${its(loc)}, ${jsonify(info)}, ${js})`
}
}
throw new Error('Failed to match. ' + valueToString($target));
})(map$slget(trace)(loc));

const trace_and = (loc) => (trace) => (value) => (js) => (($target) => {
if ($target.type === "none") {
return js
}
if ($target.type === "some") {
{
let info = $target[0];
return `(\$trace(${its(loc)}, ${jsonify(info)}, ${value}), ${js})`
}
}
throw new Error('Failed to match. ' + valueToString($target));
})(map$slget(trace)(loc));

const trace_and_block = (loc) => (trace) => (value) => (js) => (($target) => {
if ($target.type === "none") {
return js
}
if ($target.type === "some") {
{
let info = $target[0];
return `\$trace(${its(loc)}, ${jsonify(info)}, ${value});\n${js}`
}
}
throw new Error('Failed to match. ' + valueToString($target));
})(map$slget(trace)(loc));

const source_map = (loc) => (js) => `/*${its(loc)}*/${js}/*<${its(loc)}*/`;

const rev = (arr) => (col) => (($target) => {
if ($target.type === "nil") {
return col
}
if ($target.type === "cons" &&
$target[1].type === "nil") {
{
let one = $target[0];
return cons(one)(col)
}
}
if ($target.type === "cons") {
{
let one = $target[0];
let rest = $target[1];
return rev(rest)(cons(one)(col))
}
}
throw new Error('Failed to match. ' + valueToString($target));
})(arr);

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

const bag$sland = (first) => (second) => (($target) => {
if ($target.type === "," &&
$target[0].type === "empty") {
{
let a = $target[1];
return a
}
}
if ($target.type === "," &&
$target[1].type === "empty") {
{
let a = $target[0];
return a
}
}
if ($target.type === "," &&
$target[0].type === "many" &&
$target[0][0].type === "cons" &&
$target[0][0][1].type === "nil" &&
$target[1].type === "many") {
{
let a = $target[0][0][0];
let b = $target[1][0];
return many(cons(a)(b))
}
}
if ($target.type === "," &&
$target[1].type === "many") {
{
let a = $target[0];
let b = $target[1][0];
return many(cons(a)(b))
}
}
return many(cons(first)(cons(second)(nil)))
throw new Error('Failed to match. ' + valueToString($target));
})($co(first)(second));

const bag$slfold = (f) => (init) => (bag) => (($target) => {
if ($target.type === "empty") {
return init
}
if ($target.type === "one") {
{
let v = $target[0];
return f(init)(v)
}
}
if ($target.type === "many") {
{
let items = $target[0];
return foldr(init)(items)(bag$slfold(f))
}
}
throw new Error('Failed to match. ' + valueToString($target));
})(bag);

const bag$slto_list = (bag) => bag$slfold((list) => (one) => cons(one)(list))(nil)(bag);

const pat_names = (pat) => (($target) => {
if ($target.type === "pany") {
return set$slnil
}
if ($target.type === "pvar") {
{
let name = $target[0];
let l = $target[1];
return set$sladd(set$slnil)(name)
}
}
if ($target.type === "pcon") {
{
let name = $target[0];
let nl = $target[1];
let args = $target[2];
let l = $target[3];
return foldl(set$slnil)(args)((bound) => (arg) => set$slmerge(bound)(pat_names(arg)))
}
}
if ($target.type === "pstr") {
{
let string = $target[0];
let int = $target[1];
return set$slnil
}
}
if ($target.type === "pprim") {
{
let prim = $target[0];
let int = $target[1];
return set$slnil
}
}
if ($target.type === "precord") {
{
let fields = $target[0];
let spread = $target[1];
let int = $target[2];
return foldl(map_or(pat_names)(set$slnil)(spread))(map(fields)(dot(pat_names)(snd)))(set$slmerge)
}
}
if ($target.type === "penum") {
{
let arg = $target[2];
return map_or(pat_names)(set$slnil)(arg)
}
}
throw new Error('Failed to match. ' + valueToString($target));
})(pat);

const pat_externals = (pat) => (($target) => {
if ($target.type === "pcon") {
{
let name = $target[0];
let nl = $target[1];
let args = $target[2];
let l = $target[3];
return bag$sland(one($co(name)($co(value)(nl))))(many(map(args)(pat_externals)))
}
}
return empty
throw new Error('Failed to match. ' + valueToString($target));
})(pat);

const externals_type = (bound) => (t) => (($target) => {
if ($target.type === "tvar") {
return empty
}
if ($target.type === "tcon") {
{
let name = $target[0];
let l = $target[1];
return (($target) => {
if ($target === true) {
return empty
}
return one($co(name)($co(type)(l)))
throw new Error('Failed to match. ' + valueToString($target));
})(set$slhas(bound)(name))
}
}
if ($target.type === "trec") {
{
let inner = $target[2];
let l = $target[3];
return externals_type(bound)(inner)
}
}
if ($target.type === "tapp") {
{
let one = $target[0];
let two = $target[1];
return bag$sland(externals_type(bound)(one))(externals_type(bound)(two))
}
}
if ($target.type === "trow") {
{
let fields = $target[0];
let spread = $target[1];
return foldl(map_or(externals_type(bound))(empty)(spread))(map(fields)(dot(externals_type(bound))(snd)))(bag$sland)
}
}
throw new Error('Failed to match. ' + valueToString($target));
})(t);

const pat_names_loc = (pat) => (($target) => {
if ($target.type === "pany") {
return empty
}
if ($target.type === "pvar") {
{
let name = $target[0];
let l = $target[1];
return one($co(name)(l))
}
}
if ($target.type === "pcon") {
{
let name = $target[0];
let nl = $target[1];
let args = $target[2];
let l = $target[3];
return foldl(one($co(name)(nl)))(args)((bound) => (arg) => bag$sland(bound)(pat_names_loc(arg)))
}
}
if ($target.type === "pstr") {
{
let string = $target[0];
let int = $target[1];
return empty
}
}
if ($target.type === "pprim") {
{
let prim = $target[0];
let int = $target[1];
return empty
}
}
if ($target.type === "precord") {
{
let fields = $target[0];
let spread = $target[1];
return foldl(map_or(pat_names_loc)(empty)(spread))(map(fields)(dot(pat_names_loc)(snd)))(bag$sland)
}
}
if ($target.type === "penum") {
{
let arg = $target[2];
return map_or(pat_names_loc)(empty)(arg)
}
}
throw new Error('Failed to match. ' + valueToString($target));
})(pat);

const fold_type = (init) => (type) => (f) => ((v) => (($target) => {
if ($target.type === "tapp") {
{
let target = $target[0];
let arg = $target[1];
return fold_type(fold_type(v)(target)(f))(arg)(f)
}
}
return v
throw new Error('Failed to match. ' + valueToString($target));
})(type))(f(init)(type));

const type_type = (type) => (($target) => {
if ($target.type === "tapp") {
return "app"
}
if ($target.type === "tvar") {
return "var"
}
if ($target.type === "tcon") {
return "con"
}
if ($target.type === "trec") {
return "rec"
}
if ($target.type === "trow") {
return "row"
}
throw new Error('Failed to match. ' + valueToString($target));
})(type);

const type_size = (type) => fold_type(0)(type)((v) => (_) => $pl(1)(v));

const pat_arg = (ctx) => (pat) => (($target) => {
if ($target.type === "j/pvar") {
{
let name = $target[0];
let l = $target[1];
return name
}
}
if ($target.type === "j/parray") {
{
let items = $target[0];
let spread = $target[1];
let l = $target[2];
return `[${join(", ")(map(items)(pat_arg(ctx)))}${(($target) => {
if ($target.type === "some") {
{
let s = $target[0];
return `...${pat_arg(ctx)(s)}`
}
}
if ($target.type === "none") {
return ""
}
throw new Error('Failed to match. ' + valueToString($target));
})(spread)}]`
}
}
if ($target.type === "j/pobj") {
{
let items = $target[0];
let spread = $target[1];
let l = $target[2];
return `{${join(", ")(map(items)((pair) => `\"${escape_string(fst(pair))}\": ${pat_arg(ctx)(snd(pair))}`))}${(($target) => {
if ($target.type === "some") {
{
let s = $target[0];
return `...${pat_arg(ctx)(s)}`
}
}
if ($target.type === "none") {
return ""
}
throw new Error('Failed to match. ' + valueToString($target));
})(spread)}}`
}
}
throw new Error('Failed to match. ' + valueToString($target));
})(pat);

const $co$co0 = (x) => (({0: a}) => a)(x);

const $co$co1 = (x) => (({1: {0: a}}) => a)(x);

const $co$co2 = (x) => (({1: {1: a}}) => a)(x);

const $co$co$co2 = (x) => (({1: {1: {0: x}}}) => x)(x);

const pat_$gtj$slpat = (pat) => (($target) => {
if ($target.type === "pany") {
{
let l = $target[0];
return none
}
}
if ($target.type === "pvar") {
{
let name = $target[0];
let l = $target[1];
return some(j$slpvar(sanitize(name))(l))
}
}
if ($target.type === "pcon") {
{
let name = $target[0];
let il = $target[1];
let args = $target[2];
let l = $target[3];
return (($target) => {
if ($target.type === "," &&
$target[1].type === "nil") {
return none
}
if ($target.type === ",") {
{
let items = $target[1];
return some(j$slpobj(items)(none)(l))
}
}
throw new Error('Failed to match. ' + valueToString($target));
})(foldl($co(0)(nil))(args)((result) => (arg) => (({1: res, 0: i}) => (($target) => {
if ($target.type === "none") {
return $co($pl(i)(1))(res)
}
if ($target.type === "some") {
{
let what = $target[0];
return $co($pl(i)(1))(cons($co(its(i))(what))(res))
}
}
throw new Error('Failed to match. ' + valueToString($target));
})(pat_$gtj$slpat(arg)))(result)))
}
}
if ($target.type === "pstr") {
{
let string = $target[0];
let l = $target[1];
return fatal("Cant use string as pattern")
}
}
if ($target.type === "pprim") {
{
let prim = $target[0];
let l = $target[1];
return fatal("Cant use prim as pattern")
}
}
if ($target.type === "precord") {
{
let fields = $target[0];
let spread = $target[1];
let l = $target[2];
return ((fields) => some(j$slpobj(foldr(nil)(fields)((rest) => ({1: pat, 0: name}) => (($target) => {
if ($target.type === "none") {
return rest
}
if ($target.type === "some") {
{
let pat = $target[0];
return cons($co(name)(pat))(rest)
}
}
throw new Error('Failed to match. ' + valueToString($target));
})(pat)))((($target) => {
if ($target.type === "none") {
return none
}
if ($target.type === "some") {
{
let v = $target[0];
return pat_$gtj$slpat(v)
}
}
throw new Error('Failed to match. ' + valueToString($target));
})(spread))(l)))(map(fields)(({1: pat, 0: name}) => $co(name)(pat_$gtj$slpat(pat))))
}
}
if ($target.type === "penum") {
{
let name = $target[0];
let arg = $target[2];
let l = $target[3];
return (($target) => {
if ($target.type === "none") {
return none
}
if ($target.type === "some") {
{
let v = $target[0];
return (($target) => {
if ($target.type === "none") {
return none
}
if ($target.type === "some") {
{
let v = $target[0];
return some(j$slpobj(cons($co("arg")(v))(nil))(none)(l))
}
}
throw new Error('Failed to match. ' + valueToString($target));
})(pat_$gtj$slpat(v))
}
}
throw new Error('Failed to match. ' + valueToString($target));
})(arg)
}
}
throw new Error('Failed to match. ' + valueToString($target));
})(pat);

const concat = (lists) => (($target) => {
if ($target.type === "nil") {
return nil
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
let other = $target[1];
return cons(one)(concat(cons(rest)(other)))
}
}
throw new Error('Failed to match. ' + valueToString($target));
})(lists);

const bops = cons("-")(cons("+")(cons(">")(cons("<")(cons("==")(cons("===")(cons("<=")(cons(">=")(cons("*")(nil)))))))));

const contains = (lst) => (item) => (($target) => {
if ($target.type === "nil") {
return false
}
if ($target.type === "cons") {
{
let one = $target[0];
let rest = $target[1];
return (($target) => {
if ($target === true) {
return true
}
return contains(rest)(item)
throw new Error('Failed to match. ' + valueToString($target));
})($eq(one)(item))
}
}
throw new Error('Failed to match. ' + valueToString($target));
})(lst);

const len = (x) => (($target) => {
if ($target.type === "nil") {
return 0
}
if ($target.type === "cons") {
{
let one = $target[0];
let rest = $target[1];
return $pl(1)(len(rest))
}
}
throw new Error('Failed to match. ' + valueToString($target));
})(x);

const pat_names$slj = (pat) => (($target) => {
if ($target.type === "j/pvar") {
{
let name = $target[0];
return one(name)
}
}
if ($target.type === "j/pobj") {
{
let items = $target[0];
let spread = $target[1];
return foldl((($target) => {
if ($target.type === "none") {
return empty
}
if ($target.type === "some") {
{
let pat = $target[0];
return pat_names$slj(pat)
}
}
throw new Error('Failed to match. ' + valueToString($target));
})(spread))(items)((bag) => ({1: item, 0: name}) => bag$sland(bag)(pat_names$slj(item)))
}
}
return fatal("Cant get pat names/j")
throw new Error('Failed to match. ' + valueToString($target));
})(pat);

const map$co$co0 = (f) => ({1: {1: c, 0: b}, 0: a}) => $co(f(a))($co(b)(c));

const map$co1 = (f) => ({1: b, 0: a}) => $co(a)(f(b));

const zip = (one) => (two) => (($target) => {
if ($target.type === "," &&
$target[0].type === "nil" &&
$target[1].type === "nil") {
return nil
}
if ($target.type === "," &&
$target[0].type === "cons" &&
$target[1].type === "cons") {
{
let o = $target[0][0];
let one = $target[0][1];
let t = $target[1][0];
let two = $target[1][1];
return cons($co(o)(t))(zip(one)(two))
}
}
return fatal("Mismatched lists to zip")
throw new Error('Failed to match. ' + valueToString($target));
})($co(one)(two));

/* type alias */
const StateT = (v0) => ({type: "StateT", 0: v0})
const run_$gt = ({0: f}) => (state) => (({1: result}) => result)(f(state));

const state_f = ({0: f}) => f;

const $gt$gt$eq = ({0: f}) => (next) => StateT((state) => (({1: value, 0: state}) => state_f(next(value))(state))(f(state)));

const $lt_ = (x) => StateT((state) => $co(state)(x));

const $lt_err = (e) => (v) => StateT((state) => $co(cons(e)(state))(v));

const $lt_state = StateT((state) => $co(state)(state));

const state_$gt = (v) => StateT((old) => $co(v)(old));

const map_$gt = (f) => (arr) => (($target) => {
if ($target.type === "nil") {
return $lt_(nil)
}
if ($target.type === "cons") {
{
let one = $target[0];
let rest = $target[1];
return $gt$gt$eq(f(one))((one) => $gt$gt$eq(map_$gt(f)(rest))((rest) => $lt_(cons(one)(rest))))
}
}
throw new Error('Failed to match. ' + valueToString($target));
})(arr);

const do_$gt = (f) => (arr) => (($target) => {
if ($target.type === "nil") {
return $lt_($unit)
}
if ($target.type === "cons") {
{
let one = $target[0];
let rest = $target[1];
return $gt$gt$eq(f(one))((_) => $gt$gt$eq(do_$gt(f)(rest))((_) => $lt_($unit)))
}
}
throw new Error('Failed to match. ' + valueToString($target));
})(arr);

const seq_$gt = (arr) => (($target) => {
if ($target.type === "nil") {
return $lt_(nil)
}
if ($target.type === "cons") {
{
let one = $target[0];
let rest = $target[1];
return $gt$gt$eq(one)((one) => $gt$gt$eq(seq_$gt(rest))((rest) => $lt_(cons(one)(rest))))
}
}
throw new Error('Failed to match. ' + valueToString($target));
})(arr);

const foldl_$gt = (init) => (values) => (f) => (($target) => {
if ($target.type === "nil") {
return $lt_(init)
}
if ($target.type === "cons") {
{
let one = $target[0];
let rest = $target[1];
return $gt$gt$eq(f(init)(one))((one) => foldl_$gt(one)(rest)(f))
}
}
throw new Error('Failed to match. ' + valueToString($target));
})(values);

const foldr_$gt = (init) => (values) => (f) => (($target) => {
if ($target.type === "nil") {
return $lt_(init)
}
if ($target.type === "cons") {
{
let one = $target[0];
let rest = $target[1];
return $gt$gt$eq(foldr_$gt(init)(rest)(f))((init) => f(init)(one))
}
}
throw new Error('Failed to match. ' + valueToString($target));
})(values);

const state$slnil = nil;

const cst_loc = (cst) => (($target) => {
if ($target.type === "cst/id") {
{
let l = $target[1];
return l
}
}
if ($target.type === "cst/list") {
{
let l = $target[1];
return l
}
}
if ($target.type === "cst/array") {
{
let l = $target[1];
return l
}
}
if ($target.type === "cst/spread") {
{
let l = $target[1];
return l
}
}
if ($target.type === "cst/string") {
{
let l = $target[2];
return l
}
}
if ($target.type === "cst/access") {
{
let l = $target[2];
return l
}
}
if ($target.type === "cst/record") {
{
let l = $target[1];
return l
}
}
throw new Error('Failed to match. ' + valueToString($target));
})(cst);

const pat$slidents = (pat) => (($target) => {
if ($target.type === "pvar") {
{
let name = $target[0];
let l = $target[1];
return one($co(name)(l))
}
}
if ($target.type === "pcon") {
{
let name = $target[0];
let il = $target[1];
let pats = $target[2];
let l = $target[3];
return many(cons(one($co(name)(il)))(map(pats)(pat$slidents)))
}
}
return empty
throw new Error('Failed to match. ' + valueToString($target));
})(pat);

const type$slidents = (type) => (($target) => {
if ($target.type === "tvar") {
{
let name = $target[0];
let l = $target[1];
return one($co(name)(l))
}
}
if ($target.type === "tapp") {
{
let target = $target[0];
let arg = $target[1];
return bag$sland(type$slidents(target))(type$slidents(arg))
}
}
if ($target.type === "tcon") {
{
let name = $target[0];
let l = $target[1];
return one($co(name)(l))
}
}
if ($target.type === "trec") {
{
let name = $target[0];
let nl = $target[1];
let inner = $target[2];
let l = $target[3];
return many(cons(one($co(name)(nl)))(cons(type$slidents(inner))(nil)))
}
}
if ($target.type === "trow") {
{
let fields = $target[0];
let spread = $target[1];
let l = $target[3];
return foldl(map_or(type$slidents)(empty)(spread))(map(fields)(dot(type$slidents)(snd)))(bag$sland)
}
}
throw new Error('Failed to match. ' + valueToString($target));
})(type);

const pairs_plus = (extra) => (list) => (($target) => {
if ($target.type === "nil") {
return nil
}
if ($target.type === "cons" &&
$target[1].type === "cons") {
{
let one = $target[0];
let two = $target[1][0];
let rest = $target[1][1];
return cons($co(one)(two))(pairs_plus(extra)(rest))
}
}
if ($target.type === "cons" &&
$target[1].type === "nil") {
{
let one = $target[0];
return cons($co(one)(extra))(nil)
}
}
throw new Error('Failed to match. ' + valueToString($target));
})(list);

const local = (v0) => (v1) => ({type: "local", 0: v0, 1: v1})
const global = (v0) => (v1) => (v2) => (v3) => ({type: "global", 0: v0, 1: v1, 2: v2, 3: v3})
const bound_and_names = ({1: names, 0: bound}) => ({1: names$qu, 0: bound$qu}) => $co(concat(cons(bound)(cons(bound$qu)(nil))))(bag$sland(names)(names$qu));

const type$slnames = (free) => (body) => (($target) => {
if ($target.type === "tvar") {
{
let name = $target[0];
let l = $target[1];
return (($target) => {
if ($target.type === "some") {
{
let dl = $target[0];
return one(local(l)(usage(dl)))
}
}
return empty
throw new Error('Failed to match. ' + valueToString($target));
})(map$slget(free)(name))
}
}
if ($target.type === "tcon") {
{
let name = $target[0];
let l = $target[1];
return one(global(name)(type)(l)(usage($unit)))
}
}
if ($target.type === "trec") {
{
let name = $target[0];
let nl = $target[1];
let inner = $target[2];
let l = $target[3];
return type$slnames(map$slset(free)(name)(nl))(inner)
}
}
if ($target.type === "trow") {
{
let fields = $target[0];
let spread = $target[1];
let l = $target[3];
return foldl(map_or(type$slnames(free))(empty)(spread))(map(fields)(dot(type$slnames(free))(snd)))(bag$sland)
}
}
if ($target.type === "tapp") {
{
let target = $target[0];
let arg = $target[1];
return bag$sland(type$slnames(free)(target))(type$slnames(free)(arg))
}
}
throw new Error('Failed to match. ' + valueToString($target));
})(body);

const builtins_for_eval = $eval("builtins => sanitize => {\n  const san = {}\n  Object.keys(builtins).forEach(k => san[sanitize(k)] = builtins[k])\n  return san\n}")($eval(`(() => {${builtins}})()`))(sanitize);

const eval_with_builtins = eval_with(builtins_for_eval);

const expr$slvar_name = (bound) => (name) => (l) => (($target) => {
if ($target.type === "some") {
{
let dl = $target[0];
return one(local(l)(usage(dl)))
}
}
if ($target.type === "none") {
return one(global(name)(value)(l)(usage($unit)))
}
throw new Error('Failed to match. ' + valueToString($target));
})(map$slget(bound)(name));

const eearmuffs = ({type: "eearmuffs"})
const ebang = (v0) => ({type: "ebang", 0: v0})
const eeffectful = (v0) => (v1) => (v2) => ({type: "eeffectful", 0: v0, 1: v1, 2: v2})
const eprim = (v0) => (v1) => ({type: "eprim", 0: v0, 1: v1})
const estr = (v0) => (v1) => (v2) => ({type: "estr", 0: v0, 1: v1, 2: v2})
const evar = (v0) => (v1) => ({type: "evar", 0: v0, 1: v1})
const eeffect = (v0) => (v1) => (v2) => ({type: "eeffect", 0: v0, 1: v1, 2: v2})
const equot = (v0) => (v1) => ({type: "equot", 0: v0, 1: v1})
const elambda = (v0) => (v1) => (v2) => ({type: "elambda", 0: v0, 1: v1, 2: v2})
const eapp = (v0) => (v1) => (v2) => ({type: "eapp", 0: v0, 1: v1, 2: v2})
const elet = (v0) => (v1) => (v2) => ({type: "elet", 0: v0, 1: v1, 2: v2})
const ematch = (v0) => (v1) => (v2) => ({type: "ematch", 0: v0, 1: v1, 2: v2})
const eenum = (v0) => (v1) => (v2) => (v3) => ({type: "eenum", 0: v0, 1: v1, 2: v2, 3: v3})
const erecord = (v0) => (v1) => (v2) => ({type: "erecord", 0: v0, 1: v1, 2: v2})
const eaccess = (v0) => (v1) => (v2) => ({type: "eaccess", 0: v0, 1: v1, 2: v2})
const eprovide = (v0) => (v1) => (v2) => ({type: "eprovide", 0: v0, 1: v1, 2: v2})

const quot$slexpr = (v0) => ({type: "quot/expr", 0: v0})
const quot$sltop = (v0) => ({type: "quot/top", 0: v0})
const quot$sltype = (v0) => ({type: "quot/type", 0: v0})
const quot$slpat = (v0) => ({type: "quot/pat", 0: v0})
const quot$slquot = (v0) => ({type: "quot/quot", 0: v0})

const ttypealias = (v0) => (v1) => (v2) => (v3) => (v4) => ({type: "ttypealias", 0: v0, 1: v1, 2: v2, 3: v3, 4: v4})
const tdeftype = (v0) => (v1) => (v2) => (v3) => (v4) => ({type: "tdeftype", 0: v0, 1: v1, 2: v2, 3: v3, 4: v4})
const tdef = (v0) => (v1) => (v2) => (v3) => ({type: "tdef", 0: v0, 1: v1, 2: v2, 3: v3})
const texpr = (v0) => (v1) => ({type: "texpr", 0: v0, 1: v1})
const parse_pat = (pat) => (($target) => {
if ($target.type === "cst/id" &&
$target[0] === "_") {
{
let l = $target[1];
return $lt_(pany(l))
}
}
if ($target.type === "cst/id" &&
$target[0] === "true") {
{
let l = $target[1];
return $lt_(pprim(pbool(true)(l))(l))
}
}
if ($target.type === "cst/id" &&
$target[0] === "false") {
{
let l = $target[1];
return $lt_(pprim(pbool(false)(l))(l))
}
}
if ($target.type === "cst/string" &&
$target[1].type === "nil") {
{
let first = $target[0];
let l = $target[2];
return $lt_(pstr(first)(l))
}
}
if ($target.type === "cst/id") {
{
let id = $target[0];
let l = $target[1];
return $lt_((($target) => {
if ($target.type === "some") {
{
let int = $target[0];
return pprim(pint(int)(l))(l)
}
}
return (($target) => {
if ($target.type === "some") {
{
let t = $target[0];
return penum(t)(l)(none)(l)
}
}
return pvar(id)(l)
throw new Error('Failed to match. ' + valueToString($target));
})(parse_tag(id))
throw new Error('Failed to match. ' + valueToString($target));
})(string_to_int(id)))
}
}
if ($target.type === "cst/array" &&
$target[0].type === "nil") {
{
let l = $target[1];
return $lt_(pcon("nil")(-1)(nil)(l))
}
}
if ($target.type === "cst/array" &&
$target[0].type === "cons" &&
$target[0][0].type === "cst/spread" &&
$target[0][1].type === "nil") {
{
let inner = $target[0][0][0];
return parse_pat(inner)
}
}
if ($target.type === "cst/array" &&
$target[0].type === "cons") {
{
let one = $target[0][0];
let rest = $target[0][1];
let l = $target[1];
return $gt$gt$eq(parse_pat(one))((one) => $gt$gt$eq(parse_pat(cst$slarray(rest)(l)))((rest) => $lt_(pcon("cons")(-1)(cons(one)(cons(rest)(nil)))(l))))
}
}
if ($target.type === "cst/list" &&
$target[0].type === "nil") {
{
let l = $target[1];
return $lt_(pcon("()")(-1)(nil)(l))
}
}
if ($target.type === "cst/list" &&
$target[0].type === "cons" &&
$target[0][0].type === "cst/id" &&
$target[0][0][0] === ",") {
{
let il = $target[0][0][1];
let args = $target[0][1];
let l = $target[1];
return parse_pat_tuple(args)(il)(l)
}
}
if ($target.type === "cst/list" &&
$target[0].type === "cons" &&
$target[0][0].type === "cst/id") {
{
let name = $target[0][0][0];
let il = $target[0][0][1];
let rest = $target[0][1];
let l = $target[1];
return $gt$gt$eq(map_$gt(parse_pat)(rest))((rest) => (($target) => {
if ($target.type === "some") {
{
let tag = $target[0];
return $lt_(penum(tag)(il)(some(loop(rest)((rest) => (recur) => (($target) => {
if ($target.type === "nil") {
return fatal("empty tag lol")
}
if ($target.type === "cons" &&
$target[1].type === "nil") {
{
let one = $target[0];
return one
}
}
if ($target.type === "cons") {
{
let one = $target[0];
let rest = $target[1];
return pcon(",")(il)(cons(one)(cons(recur(rest))(nil)))(l)
}
}
throw new Error('Failed to match. ' + valueToString($target));
})(rest))))(l))
}
}
return $lt_(pcon(name)(il)(rest)(l))
throw new Error('Failed to match. ' + valueToString($target));
})(parse_tag(name)))
}
}
if ($target.type === "cst/record") {
{
let items = $target[0];
let l = $target[1];
return $gt$gt$eq(loop(items)((items) => (recur) => (($target) => {
if ($target.type === "nil") {
return $lt_($co(none)(nil))
}
if ($target.type === "cons" &&
$target[0].type === "cst/spread" &&
$target[1].type === "nil") {
{
let last = $target[0][0];
return $gt$gt$eq(parse_pat(last))((last) => $lt_($co(some(last))(nil)))
}
}
if ($target.type === "cons" &&
$target[0].type === "cst/id" &&
$target[1].type === "cons") {
{
let id = $target[0][0];
let two = $target[1][0];
let rest = $target[1][1];
return $gt$gt$eq(recur(rest))(({1: rest, 0: last}) => $gt$gt$eq(parse_pat(two))((two) => $lt_($co(last)(cons($co(id)(two))(rest)))))
}
}
return $lt_err($co(l)("Invalid record pat"))($co(none)(nil))
throw new Error('Failed to match. ' + valueToString($target));
})(items)))(({1: items, 0: spread}) => $lt_(precord(items)(spread)(l)))
}
}
return $lt_err($co(cst_loc(pat))(`parse-pat mo match ${valueToString(pat)}`))(pany(cst_loc(pat)))
throw new Error('Failed to match. ' + valueToString($target));
})(pat);


const parse_pat_tuple = (items) => (il) => (l) => (($target) => {
if ($target.type === "nil") {
return $lt_(pcon(",")(-1)(nil)(il))
}
if ($target.type === "cons" &&
$target[1].type === "nil") {
{
let one = $target[0];
return parse_pat(one)
}
}
if ($target.type === "cons") {
{
let one = $target[0];
let rest = $target[1];
return $gt$gt$eq(parse_pat(one))((one) => $gt$gt$eq(parse_pat_tuple(rest)(il)(l))((rest) => $lt_(pcon(",")(-1)(cons(one)(cons(rest)(nil)))(l))))
}
}
throw new Error('Failed to match. ' + valueToString($target));
})(items);

const j$slapp = (v0) => (v1) => (v2) => ({type: "j/app", 0: v0, 1: v1, 2: v2})
const j$slbin = (v0) => (v1) => (v2) => (v3) => ({type: "j/bin", 0: v0, 1: v1, 2: v2, 3: v3})
const j$slun = (v0) => (v1) => (v2) => ({type: "j/un", 0: v0, 1: v1, 2: v2})
const j$sllambda = (v0) => (v1) => (v2) => ({type: "j/lambda", 0: v0, 1: v1, 2: v2})
const j$slprim = (v0) => (v1) => ({type: "j/prim", 0: v0, 1: v1})
const j$slstr = (v0) => (v1) => (v2) => ({type: "j/str", 0: v0, 1: v1, 2: v2})
const j$slraw = (v0) => (v1) => ({type: "j/raw", 0: v0, 1: v1})
const j$slvar = (v0) => (v1) => ({type: "j/var", 0: v0, 1: v1})
const j$slattr = (v0) => (v1) => (v2) => ({type: "j/attr", 0: v0, 1: v1, 2: v2})
const j$slindex = (v0) => (v1) => (v2) => ({type: "j/index", 0: v0, 1: v1, 2: v2})
const j$sltern = (v0) => (v1) => (v2) => (v3) => ({type: "j/tern", 0: v0, 1: v1, 2: v2, 3: v3})
const j$slassign = (v0) => (v1) => (v2) => (v3) => ({type: "j/assign", 0: v0, 1: v1, 2: v2, 3: v3})
const j$slarray = (v0) => (v1) => ({type: "j/array", 0: v0, 1: v1})
const j$slobj = (v0) => (v1) => ({type: "j/obj", 0: v0, 1: v1})

const j$slblock = (v0) => ({type: "j/block", 0: v0})

const j$slsexpr = (v0) => (v1) => ({type: "j/sexpr", 0: v0, 1: v1})
const j$slsblock = (v0) => (v1) => ({type: "j/sblock", 0: v0, 1: v1})
const j$slif = (v0) => (v1) => (v2) => (v3) => ({type: "j/if", 0: v0, 1: v1, 2: v2, 3: v3})
const j$slfor = (v0) => (v1) => (v2) => (v3) => (v4) => (v5) => ({type: "j/for", 0: v0, 1: v1, 2: v2, 3: v3, 4: v4, 5: v5})
const j$slbreak = (v0) => ({type: "j/break", 0: v0})
const j$slcontinue = (v0) => ({type: "j/continue", 0: v0})
const j$slreturn = (v0) => (v1) => ({type: "j/return", 0: v0, 1: v1})
const j$sllet = (v0) => (v1) => (v2) => ({type: "j/let", 0: v0, 1: v1, 2: v2})
const j$slthrow = (v0) => (v1) => ({type: "j/throw", 0: v0, 1: v1})
const pairs = (list) => (($target) => {
if ($target.type === "nil") {
return $lt_(nil)
}
if ($target.type === "cons" &&
$target[1].type === "cons") {
{
let one = $target[0];
let two = $target[1][0];
let rest = $target[1][1];
return $gt$gt$eq(pairs(rest))((rest) => $lt_(cons($co(one)(two))(rest)))
}
}
if ($target.type === "cons" &&
$target[1].type === "nil") {
{
let one = $target[0];
return $lt_err($co(cst_loc(one))("extra item in pairs"))(nil)
}
}
throw new Error('Failed to match. ' + valueToString($target));
})(list);

const expr_loc = (expr) => (($target) => {
if ($target.type === "estr") {
{
let l = $target[2];
return l
}
}
if ($target.type === "eprim") {
{
let l = $target[1];
return l
}
}
if ($target.type === "eeffect") {
{
let l = $target[2];
return l
}
}
if ($target.type === "eprovide") {
{
let l = $target[2];
return l
}
}
if ($target.type === "evar") {
{
let l = $target[1];
return l
}
}
if ($target.type === "equot") {
{
let l = $target[1];
return l
}
}
if ($target.type === "elambda") {
{
let l = $target[2];
return l
}
}
if ($target.type === "elet") {
{
let l = $target[2];
return l
}
}
if ($target.type === "eapp") {
{
let l = $target[2];
return l
}
}
if ($target.type === "ematch") {
{
let l = $target[2];
return l
}
}
if ($target.type === "erecord") {
{
let l = $target[2];
return l
}
}
if ($target.type === "eenum") {
{
let l = $target[3];
return l
}
}
if ($target.type === "eaccess") {
{
let l = $target[2];
return l
}
}
throw new Error('Failed to match. ' + valueToString($target));
})(expr);

const parse_and_compile = (v0) => (v1) => (v2) => (v3) => (v4) => (v5) => (v6) => (v7) => (v8) => (v9) => (v10) => ({type: "parse-and-compile", 0: v0, 1: v1, 2: v2, 3: v3, 4: v4, 5: v5, 6: v6, 7: v7, 8: v8, 9: v9, 10: v10})
const externals = (bound) => (expr) => (($target) => {
if ($target.type === "evar") {
{
let name = $target[0];
let l = $target[1];
return (($target) => {
if ($target === true) {
return empty
}
return one($co(name)($co(value)(l)))
throw new Error('Failed to match. ' + valueToString($target));
})(set$slhas(bound)(name))
}
}
if ($target.type === "eprim") {
{
let prim = $target[0];
let l = $target[1];
return empty
}
}
if ($target.type === "eeffect") {
return empty
}
if ($target.type === "eprovide") {
{
let target = $target[0];
let cases = $target[1];
return foldl(externals(bound)(target))(map(cases)(({1: {1: {1: body, 0: k}, 0: nl}, 0: name}) => ((pats) => foldl(externals(foldl(bound)(map(pats)(pat_names))(set$slmerge))(body))(map(pats)(pat_externals))(bag$sland))((($target) => {
if ($target.type === "ebang") {
{
let pats = $target[0];
return pats
}
}
if ($target.type === "eeffectful") {
{
let pats = $target[2];
return pats
}
}
return nil
throw new Error('Failed to match. ' + valueToString($target));
})(k))))(bag$sland)
}
}
if ($target.type === "eenum") {
{
let arg = $target[2];
return map_or(externals(bound))(empty)(arg)
}
}
if ($target.type === "erecord") {
{
let spread = $target[0];
let fields = $target[1];
return foldl(map_or(dot(externals(bound))(fst))(empty)(spread))(map(fields)(dot(externals(bound))(snd)))(bag$sland)
}
}
if ($target.type === "eaccess") {
{
let target = $target[0];
return (($target) => {
if ($target.type === "none") {
return empty
}
if ($target.type === "some" &&
$target[0].type === ",") {
{
let v = $target[0][0];
let l = $target[0][1];
return (($target) => {
if ($target === true) {
return empty
}
return one($co(v)($co(value)(l)))
throw new Error('Failed to match. ' + valueToString($target));
})(set$slhas(bound)(v))
}
}
throw new Error('Failed to match. ' + valueToString($target));
})(target)
}
}
if ($target.type === "estr") {
{
let first = $target[0];
let templates = $target[1];
let l = $target[2];
return many(map(templates)((arg) => (($target) => {
if ($target.type === "," &&
$target[1].type === ",") {
{
let expr = $target[0];
return externals(bound)(expr)
}
}
throw new Error('Failed to match. ' + valueToString($target));
})(arg)))
}
}
if ($target.type === "equot") {
{
let expr = $target[0];
let l = $target[1];
return empty
}
}
if ($target.type === "elambda") {
{
let pats = $target[0];
let body = $target[1];
let l = $target[2];
return bag$sland(foldl(empty)(map(pats)(pat_externals))(bag$sland))(externals(foldl(bound)(map(pats)(pat_names))(set$slmerge))(body))
}
}
if ($target.type === "elet") {
{
let bindings = $target[0];
let body = $target[1];
let l = $target[2];
return bag$sland(foldl(empty)(map(bindings)((arg) => (({1: init, 0: pat}) => bag$sland(pat_externals(pat))(externals(bound)(init)))(arg)))(bag$sland))(externals(foldl(bound)(map(bindings)((arg) => (({0: pat}) => pat_names(pat))(arg)))(set$slmerge))(body))
}
}
if ($target.type === "eapp") {
{
let target = $target[0];
let args = $target[1];
let l = $target[2];
return bag$sland(externals(bound)(target))(foldl(empty)(map(args)(externals(bound)))(bag$sland))
}
}
if ($target.type === "ematch") {
{
let expr = $target[0];
let cases = $target[1];
let l = $target[2];
return bag$sland(externals(bound)(expr))(foldl(empty)(cases)((bag) => (arg) => (($target) => {
if ($target.type === ",") {
{
let pat = $target[0];
let body = $target[1];
return bag$sland(bag$sland(bag)(pat_externals(pat)))(externals(set$slmerge(bound)(pat_names(pat)))(body))
}
}
throw new Error('Failed to match. ' + valueToString($target));
})(arg)))
}
}
throw new Error('Failed to match. ' + valueToString($target));
})(expr);

const names = (top) => (($target) => {
if ($target.type === "tdef") {
{
let name = $target[0];
let l = $target[1];
return cons($co(name)($co(value)(l)))(nil)
}
}
if ($target.type === "texpr") {
return nil
}
if ($target.type === "ttypealias") {
{
let name = $target[0];
let l = $target[1];
return cons($co(name)($co(type)(l)))(nil)
}
}
if ($target.type === "tdeftype") {
{
let name = $target[0];
let l = $target[1];
let constructors = $target[3];
return cons($co(name)($co(type)(l)))(map(constructors)((arg) => (($target) => {
if ($target.type === "," &&
$target[1].type === "," &&
$target[1][1].type === ",") {
{
let name = $target[0];
let l = $target[1][0];
return $co(name)($co(value)(l))
}
}
throw new Error('Failed to match. ' + valueToString($target));
})(arg)))
}
}
throw new Error('Failed to match. ' + valueToString($target));
})(top);

const externals_top = (top) => bag$slto_list((($target) => {
if ($target.type === "tdeftype") {
{
let string = $target[0];
let free = $target[2];
let constructors = $target[3];
return ((frees) => many(map(constructors)((constructor) => (($target) => {
if ($target.type === "," &&
$target[1].type === "," &&
$target[1][1].type === ",") {
{
let name = $target[0];
let l = $target[1][0];
let args = $target[1][1][0];
return (($target) => {
if ($target.type === "nil") {
return empty
}
return many(map(args)(externals_type(frees)))
throw new Error('Failed to match. ' + valueToString($target));
})(args)
}
}
throw new Error('Failed to match. ' + valueToString($target));
})(constructor))))(set$slfrom_list(map(free)(fst)))
}
}
if ($target.type === "ttypealias") {
{
let name = $target[0];
let args = $target[2];
let body = $target[3];
return ((frees) => externals_type(frees)(body))(set$slfrom_list(map(args)(fst)))
}
}
if ($target.type === "tdef") {
{
let name = $target[0];
let body = $target[2];
return externals(set$sladd(set$slnil)(name))(body)
}
}
if ($target.type === "texpr") {
{
let expr = $target[0];
return externals(set$slnil)(expr)
}
}
throw new Error('Failed to match. ' + valueToString($target));
})(top));

const fold_expr = (init) => (expr) => (f) => ((v) => (($target) => {
if ($target.type === "estr") {
{
let tpl = $target[1];
return foldl(v)(tpl)((init) => (tpl) => fold_expr(init)($co$co0(tpl))(f))
}
}
if ($target.type === "elambda") {
{
let body = $target[1];
return fold_expr(v)(body)(f)
}
}
if ($target.type === "elet") {
{
let bindings = $target[0];
let body = $target[1];
return fold_expr(foldl(v)(bindings)((init) => (binding) => fold_expr(init)(snd(binding))(f)))(body)(f)
}
}
if ($target.type === "eapp") {
{
let target = $target[0];
let args = $target[1];
return foldl(fold_expr(v)(target)(f))(args)((init) => (expr) => fold_expr(init)(expr)(f))
}
}
if ($target.type === "ematch") {
{
let expr = $target[0];
let cases = $target[1];
return foldl(fold_expr(v)(expr)(f))(cases)((init) => ($case) => fold_expr(init)(snd($case))(f))
}
}
return v
throw new Error('Failed to match. ' + valueToString($target));
})(expr))(f(init)(expr));

const expr_type = (expr) => (($target) => {
if ($target.type === "eprim") {
{
let prim = $target[0];
let int = $target[1];
return "prim"
}
}
if ($target.type === "estr") {
{
let string = $target[0];
let int = $target[2];
return "str"
}
}
if ($target.type === "evar") {
{
let string = $target[0];
let int = $target[1];
return "var"
}
}
if ($target.type === "equot") {
{
let quot = $target[0];
let int = $target[1];
return "quot"
}
}
if ($target.type === "elambda") {
{
let expr = $target[1];
let int = $target[2];
return "lambda"
}
}
if ($target.type === "eeffect") {
return "effect"
}
if ($target.type === "eprovide") {
return "provide"
}
if ($target.type === "eapp") {
{
let expr = $target[0];
let int = $target[2];
return "app"
}
}
if ($target.type === "elet") {
{
let expr = $target[1];
let int = $target[2];
return "let"
}
}
if ($target.type === "erecord") {
return "record"
}
if ($target.type === "eenum") {
return "enum"
}
if ($target.type === "eaccess") {
return "access"
}
if ($target.type === "ematch") {
{
let expr = $target[0];
let int = $target[2];
return "match"
}
}
throw new Error('Failed to match. ' + valueToString($target));
})(expr);

const expr_size = (expr) => fold_expr(0)(expr)((v) => (_) => $pl(1)(v));

const top_size = (top) => $pl(1)((($target) => {
if ($target.type === "tdef") {
{
let expr = $target[2];
return expr_size(expr)
}
}
if ($target.type === "texpr") {
{
let expr = $target[0];
return expr_size(expr)
}
}
if ($target.type === "ttypealias") {
{
let type = $target[3];
return type_size(type)
}
}
if ($target.type === "tdeftype") {
{
let constructors = $target[3];
return foldl(0)(constructors)((v) => ($const) => foldl(v)(map($co$co$co2($const))(type_size))($pl))
}
}
throw new Error('Failed to match. ' + valueToString($target));
})(top));

const j$slneeds_parens = (expr) => (($target) => {
if ($target.type === "j/bin") {
return true
}
if ($target.type === "j/un") {
return true
}
if ($target.type === "j/lambda") {
return true
}
if ($target.type === "j/prim") {
return true
}
if ($target.type === "j/tern") {
return true
}
if ($target.type === "j/assign") {
return true
}
return false
throw new Error('Failed to match. ' + valueToString($target));
})(expr);

const is_bop = (op) => contains(bops)(op);

const tx = (v0) => (v1) => (v2) => (v3) => (v4) => (v5) => (v6) => (v7) => ({type: "tx", 0: v0, 1: v1, 2: v2, 3: v3, 4: v4, 5: v5, 6: v6, 7: v7})
const map$slpat = (tx) => (pat) => ((loop) => (({3: post_p, 2: pre_p}) => (($target) => {
if ($target.type === "none") {
return pat
}
if ($target.type === "some") {
{
let pat = $target[0];
return post_p((($target) => {
if ($target.type === "j/pvar") {
return pat
}
if ($target.type === "j/parray") {
{
let items = $target[0];
let spread = $target[1];
let l = $target[2];
return j$slparray(map(items)(loop))(map_opt(spread)(loop))(l)
}
}
if ($target.type === "j/pobj") {
{
let items = $target[0];
let spread = $target[1];
let l = $target[2];
return j$slpobj(map(items)(({1: pat, 0: name}) => $co(name)(loop(pat))))(map_opt(spread)(loop))(l)
}
}
throw new Error('Failed to match. ' + valueToString($target));
})(pat))
}
}
throw new Error('Failed to match. ' + valueToString($target));
})(pre_p(pat)))(tx))(map$slpat(tx));

const simplify_one = (expr) => (($target) => {
if ($target.type === "j/app" &&
$target[0].type === "j/lambda" &&
$target[0][0].type === "nil" &&
$target[0][1].type === "right" &&
$target[1].type === "nil") {
{
let inner = $target[0][1][0];
return some(inner)
}
}
if ($target.type === "j/lambda" &&
$target[1].type === "left" &&
$target[1][0].type === "j/block" &&
$target[1][0][0].type === "cons" &&
$target[1][0][0][0].type === "j/return" &&
$target[1][0][0][1].type === "nil") {
{
let args = $target[0];
let value = $target[1][0][0][0][0];
let l = $target[2];
return some(j$sllambda(args)(right(value))(l))
}
}
if ($target.type === "j/lambda" &&
$target[1].type === "right" &&
$target[1][0].type === "j/app" &&
$target[1][0][0].type === "j/lambda" &&
$target[1][0][0][0].type === "nil" &&
$target[1][0][1].type === "nil") {
{
let args = $target[0];
let body = $target[1][0][0][1];
let ll = $target[1][0][0][2];
let al = $target[1][0][2];
let l = $target[2];
return some(j$sllambda(args)(body)(l))
}
}
return none
throw new Error('Failed to match. ' + valueToString($target));
})(expr);

const simplify_stmt = (stmt) => (($target) => {
if ($target.type === "j/sblock" &&
$target[0].type === "j/block" &&
$target[0][0].type === "cons" &&
$target[0][0][1].type === "nil") {
{
let one = $target[0][0][0];
let l = $target[1];
return (($target) => {
if ($target.type === "j/let") {
return none
}
return some(one)
throw new Error('Failed to match. ' + valueToString($target));
})(one)
}
}
return none
throw new Error('Failed to match. ' + valueToString($target));
})(stmt);

const make_lets = (params) => (args) => (l) => (($target) => {
if ($target.type === "," &&
$target[0].type === "nil" &&
$target[1].type === "nil") {
return nil
}
if ($target.type === "," &&
$target[0].type === "cons" &&
$target[1].type === "cons") {
{
let one = $target[0][0];
let params = $target[0][1];
let two = $target[1][0];
let args = $target[1][1];
return cons(j$sllet(one)(two)(l))(make_lets(params)(args)(l))
}
}
return fatal("invalid lets")
throw new Error('Failed to match. ' + valueToString($target));
})($co(params)(args));

const fx = (v0) => (v1) => (v2) => (v3) => ({type: "fx", 0: v0, 1: v1, 2: v2, 3: v3})
const fold$slpat = (fx) => (init) => (pat) => (({1: p}) => p((($target) => {
if ($target.type === "j/pvar") {
return init
}
if ($target.type === "j/pobj") {
{
let items = $target[0];
let spread = $target[1];
return foldl(fold$sloption(fold$slpat(fx))(init)(spread))(items)((init) => ({1: pat}) => fold$slpat(fx)(init)(pat))
}
}
if ($target.type === "j/parray") {
{
let items = $target[0];
let spread = $target[1];
return foldl(fold$sloption(fold$slpat(fx))(init)(spread))(items)(fold$slpat(fx))
}
}
throw new Error('Failed to match. ' + valueToString($target));
})(pat))(pat))(fx);

const pat_names$slj2 = fx(nop)((names) => (pat) => (($target) => {
if ($target.type === "j/pvar") {
{
let name = $target[0];
return set$sladd(names)(name)
}
}
return names
throw new Error('Failed to match. ' + valueToString($target));
})(pat))(nop)(nop);

const externals$slj = fx((names) => (expr) => (($target) => {
if ($target.type === "j/var") {
{
let name = $target[0];
return set$sladd(names)(name)
}
}
return names
throw new Error('Failed to match. ' + valueToString($target));
})(expr))(nop)(nop)(nop);

const map_expr = (f) => (expr) => (($target) => {
if ($target.type === "estr") {
{
let first = $target[0];
let tpl = $target[1];
let l = $target[2];
return estr(first)(map(tpl)(map$co$co0(map_expr(f))))(l)
}
}
if ($target.type === "elambda") {
{
let pats = $target[0];
let body = $target[1];
let l = $target[2];
return elambda(pats)(map_expr(f)(body))(l)
}
}
if ($target.type === "elet") {
{
let bindings = $target[0];
let body = $target[1];
let l = $target[2];
return elet(map(bindings)(map$co1(map_expr(f))))(map_expr(f)(body))(l)
}
}
if ($target.type === "eapp") {
{
let target = $target[0];
let args = $target[1];
let l = $target[2];
return eapp(map_expr(f)(target))(map(args)(map_expr(f)))(l)
}
}
if ($target.type === "ematch") {
{
let expr = $target[0];
let cases = $target[1];
let l = $target[2];
return ematch(map_expr(f)(expr))(map(cases)(map$co1(map_expr(f))))(l)
}
}
{
let otherwise = $target;
return otherwise
}
throw new Error('Failed to match. ' + valueToString($target));
})(f(expr));

const trace_pat = (pat) => (trace) => ((names) => foldr(nil)(names)((stmts) => ({1: loc, 0: name}) => (($target) => {
if ($target.type === "none") {
return stmts
}
if ($target.type === "some") {
{
let info = $target[0];
return cons(j$slsexpr(j$slapp(j$slvar("\$trace")(-1))(cons(j$slprim(j$slint(loc)(-1))(-1))(cons(j$slraw(jsonify(info))(-1))(cons(j$slvar(sanitize(name))(-1))(nil))))(-1))(-1))(stmts)
}
}
throw new Error('Failed to match. ' + valueToString($target));
})(map$slget(trace)(loc))))(bag$slto_list(pat_names_loc(pat)));

const maybe_trace = (loc) => (trace) => (expr) => (($target) => {
if ($target.type === "none") {
return expr
}
if ($target.type === "some") {
{
let v = $target[0];
return j$slapp(j$slvar("\$trace")(-1))(cons(j$slprim(j$slint(loc)(-1))(-1))(cons(j$slraw(jsonify(v))(-1))(cons(expr)(nil))))(-1)
}
}
throw new Error('Failed to match. ' + valueToString($target));
})(map$slget(trace)(loc));

const quot$sljsonify = (quot) => (($target) => {
if ($target.type === "quot/expr") {
{
let expr = $target[0];
return jsonify(expr)
}
}
if ($target.type === "quot/type") {
{
let type = $target[0];
return jsonify(type)
}
}
if ($target.type === "quot/top") {
{
let top = $target[0];
return jsonify(top)
}
}
if ($target.type === "quot/quot") {
{
let cst = $target[0];
return jsonify(cst)
}
}
if ($target.type === "quot/pat") {
{
let pat = $target[0];
return jsonify(pat)
}
}
throw new Error('Failed to match. ' + valueToString($target));
})(quot);

const run$slnil_$gt = (st) => run_$gt(st)(state$slnil);

const unexpected = (msg) => (cst) => $lt_err($co(cst_loc(cst))(msg))($unit);

const eunit = (l) => evar("()")(l);

const sunit = (k) => texpr(eunit(k))(k);

const locals_at = (locs) => (tl) => (expr) => (($target) => {
if ($target.type === "eprim") {
return none
}
if ($target.type === "estr") {
{
let tpls = $target[1];
return loop(tpls)((tpls) => (recur) => (($target) => {
if ($target.type === "nil") {
return none
}
if ($target.type === "cons" &&
$target[0].type === "," &&
$target[0][1].type === ",") {
{
let expr = $target[0][0];
let rest = $target[1];
return (($target) => {
if ($target.type === "some") {
{
let v = $target[0];
return some(v)
}
}
return recur(rest)
throw new Error('Failed to match. ' + valueToString($target));
})(locals_at(locs)(tl)(expr))
}
}
throw new Error('Failed to match. ' + valueToString($target));
})(tpls))
}
}
if ($target.type === "evar") {
{
let l = $target[1];
return (($target) => {
if ($target === true) {
return some(locs)
}
return none
throw new Error('Failed to match. ' + valueToString($target));
})($eq(l)(tl))
}
}
if ($target.type === "eeffect") {
return none
}
if ($target.type === "eprovide") {
return none
}
if ($target.type === "eaccess") {
{
let name = $target[0];
return none
}
}
if ($target.type === "erecord") {
return none
}
if ($target.type === "eenum") {
return none
}
if ($target.type === "equot") {
return none
}
if ($target.type === "elambda") {
{
let pats = $target[0];
let expr = $target[1];
return locals_at(bag$sland(many(map(pats)(pat_names_loc)))(locs))(tl)(expr)
}
}
if ($target.type === "eapp") {
{
let expr = $target[0];
let args = $target[1];
return (($target) => {
if ($target.type === "some") {
{
let l = $target[0];
return some(l)
}
}
return loop(args)((args) => (recur) => (($target) => {
if ($target.type === "nil") {
return none
}
if ($target.type === "cons") {
{
let arg = $target[0];
let args = $target[1];
return (($target) => {
if ($target.type === "some") {
{
let v = $target[0];
return some(v)
}
}
return recur(args)
throw new Error('Failed to match. ' + valueToString($target));
})(locals_at(locs)(tl)(arg))
}
}
throw new Error('Failed to match. ' + valueToString($target));
})(args))
throw new Error('Failed to match. ' + valueToString($target));
})(locals_at(locs)(tl)(expr))
}
}
if ($target.type === "elet") {
{
let bindings = $target[0];
let expr = $target[1];
return loop($co(bindings)(locs))(({1: locs, 0: bindings}) => (recur) => (($target) => {
if ($target.type === "nil") {
return locals_at(locs)(tl)(expr)
}
if ($target.type === "cons" &&
$target[0].type === ",") {
{
let pat = $target[0][0];
let init = $target[0][1];
let rest = $target[1];
return ((locs) => (($target) => {
if ($target.type === "some") {
{
let v = $target[0];
return some(v)
}
}
return recur($co(rest)(locs))
throw new Error('Failed to match. ' + valueToString($target));
})(locals_at(locs)(tl)(init)))(bag$sland(locs)(pat_names_loc(pat)))
}
}
throw new Error('Failed to match. ' + valueToString($target));
})(bindings))
}
}
if ($target.type === "ematch") {
{
let expr = $target[0];
let cases = $target[1];
return (($target) => {
if ($target.type === "some") {
{
let l = $target[0];
return some(l)
}
}
return loop(cases)((cases) => (recur) => (($target) => {
if ($target.type === "nil") {
return none
}
if ($target.type === "cons" &&
$target[0].type === ",") {
{
let pat = $target[0][0];
let expr = $target[0][1];
let cases = $target[1];
return (($target) => {
if ($target.type === "some") {
{
let v = $target[0];
return some(v)
}
}
return recur(cases)
throw new Error('Failed to match. ' + valueToString($target));
})(locals_at(bag$sland(pat_names_loc(pat))(locs))(tl)(expr))
}
}
throw new Error('Failed to match. ' + valueToString($target));
})(cases))
throw new Error('Failed to match. ' + valueToString($target));
})(locals_at(locs)(tl)(expr))
}
}
throw new Error('Failed to match. ' + valueToString($target));
})(expr);

const expr$slidents = (expr) => (($target) => {
if ($target.type === "estr") {
{
let exprs = $target[1];
return many(map(exprs)(dot(expr$slidents)($co$co0)))
}
}
if ($target.type === "evar") {
{
let name = $target[0];
let l = $target[1];
return one($co(name)(l))
}
}
if ($target.type === "elambda") {
{
let pats = $target[0];
let expr = $target[1];
let l = $target[2];
return many(cons(expr$slidents(expr))(map(pats)(pat$slidents)))
}
}
if ($target.type === "eapp") {
{
let target = $target[0];
let args = $target[1];
return many(cons(expr$slidents(target))(map(args)(expr$slidents)))
}
}
if ($target.type === "elet") {
{
let bindings = $target[0];
let body = $target[1];
return many(cons(expr$slidents(body))(map(bindings)(({1: exp, 0: pat}) => bag$sland(pat$slidents(pat))(expr$slidents(exp)))))
}
}
if ($target.type === "ematch") {
{
let target = $target[0];
let cases = $target[1];
return bag$sland(expr$slidents(target))(many(map(cases)(({1: exp, 0: pat}) => bag$sland(pat$slidents(pat))(expr$slidents(exp)))))
}
}
return empty
throw new Error('Failed to match. ' + valueToString($target));
})(expr);

const top$slidents = (top) => (($target) => {
if ($target.type === "tdef") {
{
let name = $target[0];
let l = $target[1];
let body = $target[2];
return bag$sland(one($co(name)(l)))(expr$slidents(body))
}
}
if ($target.type === "texpr") {
{
let exp = $target[0];
return expr$slidents(exp)
}
}
if ($target.type === "ttypealias") {
{
let name = $target[0];
let l = $target[1];
let args = $target[2];
let body = $target[3];
return bag$sland(type$slidents(body))(many(cons(one($co(name)(l)))(map(args)(one))))
}
}
if ($target.type === "tdeftype") {
{
let name = $target[0];
let l = $target[1];
let args = $target[2];
let constrs = $target[3];
return bag$sland(many(map(constrs)(({1: {1: {0: args}, 0: l}, 0: name}) => bag$sland(one($co(name)(l)))(many(map(args)(type$slidents))))))(bag$sland(one($co(name)(l)))(many(map(args)(one))))
}
}
throw new Error('Failed to match. ' + valueToString($target));
})(top);

const locals_at_top = (locs) => (tl) => (top) => (($target) => {
if ($target.type === "texpr") {
{
let exp = $target[0];
return locals_at(locs)(tl)(exp)
}
}
if ($target.type === "tdef") {
{
let exp = $target[2];
return locals_at(locs)(tl)(exp)
}
}
return none
throw new Error('Failed to match. ' + valueToString($target));
})(top);

const pat$slnames = (pat) => (($target) => {
if ($target.type === "pany") {
return $co(nil)(empty)
}
if ($target.type === "pvar") {
{
let name = $target[0];
let l = $target[1];
return $co(cons($co(name)(l))(nil))(one(local(l)(decl)))
}
}
if ($target.type === "pprim") {
return $co(nil)(empty)
}
if ($target.type === "pstr") {
return $co(nil)(empty)
}
if ($target.type === "penum") {
{
let arg = $target[2];
let l = $target[3];
return map_or(pat$slnames)($co(nil)(empty))(arg)
}
}
if ($target.type === "precord") {
{
let fields = $target[0];
let spread = $target[1];
let l = $target[2];
return foldl(map_or(pat$slnames)($co(nil)(empty))(spread))(map(fields)(dot(pat$slnames)(snd)))(bound_and_names)
}
}
if ($target.type === "pcon") {
{
let name = $target[0];
let nl = $target[1];
let args = $target[2];
let l = $target[3];
return foldl($co(nil)(one(global(name)(value)(l)(usage($unit)))))(map(args)(pat$slnames))(bound_and_names)
}
}
throw new Error('Failed to match. ' + valueToString($target));
})(pat);

const provide_empty_effects = (jexp) => j$slapp(j$sllambda(cons(j$slpvar("\$lbeffects\$rb")(-1))(nil))(jexp)(-1))(cons(j$slobj(nil)(-1))(nil))(-1);

const parse_id = (id) => (l) => (($target) => {
if ($target === true) {
return eeffect(id)(false)(l)
}
return (($target) => {
if ($target.type === "some") {
{
let int = $target[0];
return eprim(pint(int)(l))(l)
}
}
if ($target.type === "none") {
return (($target) => {
if ($target.type === "some") {
{
let tag = $target[0];
return eenum(tag)(l)(none)(l)
}
}
return evar(id)(l)
throw new Error('Failed to match. ' + valueToString($target));
})(parse_tag(id))
}
throw new Error('Failed to match. ' + valueToString($target));
})(string_to_int(id))
throw new Error('Failed to match. ' + valueToString($target));
})(is_earmuffs(id));

const parse_provide_pat = (pat) => (($target) => {
if ($target.type === "cst/id") {
{
let id = $target[0];
let l = $target[1];
return (($target) => {
if ($target === true) {
return $lt_($co(id)($co(l)($co(eearmuffs)(l))))
}
return $lt_err($co(l)("Wrap in () or must be *earmuffed*"))($co(id)($co(l)($co(eearmuffs)(l))))
throw new Error('Failed to match. ' + valueToString($target));
})(is_earmuffs(id))
}
}
if ($target.type === "cst/list" &&
$target[0].type === "cons" &&
$target[0][0].type === "cst/id" &&
$target[0][1].type === "cons" &&
$target[0][1][0].type === "cst/id") {
{
let k = $target[0][0][0];
let kl = $target[0][0][1];
let id = $target[0][1][0][0];
let il = $target[0][1][0][1];
let pats = $target[0][1][1];
let l = $target[1];
return (($target) => {
if ($target === true) {
return $gt$gt$eq(map_$gt(parse_pat)(cons(cst$slid(id)(il))(pats)))((pats) => $lt_($co(k)($co(kl)($co(ebang(pats))(l)))))
}
return (($target) => {
if ($target === true) {
return $gt$gt$eq(map_$gt(parse_pat)(pats))((pats) => $lt_($co(id)($co(il)($co(eeffectful(k)(kl)(pats))(l)))))
}
return $lt_err($co(l)("Unidentified effect kind"))($co(k)($co(kl)($co(ebang(nil))(l))))
throw new Error('Failed to match. ' + valueToString($target));
})(is_arrow(id))
throw new Error('Failed to match. ' + valueToString($target));
})(is_bang(k))
}
}
if ($target.type === "cst/list" &&
$target[0].type === "cons" &&
$target[0][0].type === "cst/id") {
{
let id = $target[0][0][0];
let il = $target[0][0][1];
let pats = $target[0][1];
let l = $target[1];
return (($target) => {
if ($target === true) {
return $gt$gt$eq(map_$gt(parse_pat)(pats))((pats) => $lt_($co(id)($co(il)($co(ebang(pats))(l)))))
}
return $lt_err($co(l)("Unidentified effect kind, expected *earmuffed*, <-arrowed, or !banged"))($co(id)($co(il)($co(ebang(nil))(l))))
throw new Error('Failed to match. ' + valueToString($target));
})(is_bang(id))
}
}
return fatal("cant do it I think")
throw new Error('Failed to match. ' + valueToString($target));
})(pat);

const compile_pat$slj = (pat) => (target) => (inner) => (trace) => (($target) => {
if ($target.type === "pany") {
{
let l = $target[0];
return inner
}
}
if ($target.type === "penum") {
{
let name = $target[0];
let nl = $target[1];
let arg = $target[2];
let l = $target[3];
return (($target) => {
if ($target.type === "none") {
return cons(j$slif(j$slbin("===")(target)(j$slstr(name)(nil)(nl))(nl))(j$slblock(inner))(none)(l))(nil)
}
if ($target.type === "some") {
{
let pat = $target[0];
return cons(j$slif(j$slbin("===")(j$slattr(target)("tag")(nl))(j$slstr(name)(nil)(nl))(nl))(j$slblock(compile_pat$slj(pat)(j$slattr(target)("arg")(nl))(inner)(trace)))(none)(l))(nil)
}
}
throw new Error('Failed to match. ' + valueToString($target));
})(arg)
}
}
if ($target.type === "precord") {
{
let fields = $target[0];
let spread = $target[1];
let l = $target[2];
return loop(fields)((fields) => (recur) => (($target) => {
if ($target.type === "nil") {
return (($target) => {
if ($target.type === "none") {
return inner
}
if ($target.type === "some") {
{
let pat = $target[0];
return cons(j$slsblock(j$slblock(cons(j$sllet(j$slpobj(mapi(0)(fields)((i) => ({0: name}) => $co(name)(j$slpvar(`_\$${int_to_string(i)}`)(l))))(some(j$slpvar("\$rest")(l)))(l))(target)(l))(compile_pat$slj(pat)(j$slvar("\$rest")(l))(inner)(trace))))(l))(nil)
}
}
throw new Error('Failed to match. ' + valueToString($target));
})(spread)
}
if ($target.type === "cons" &&
$target[0].type === ",") {
{
let name = $target[0][0];
let pat = $target[0][1];
let rest = $target[1];
return compile_pat$slj(pat)(j$slattr(target)(name)(l))(recur(rest))(trace)
}
}
throw new Error('Failed to match. ' + valueToString($target));
})(fields))
}
}
if ($target.type === "pprim") {
{
let prim = $target[0];
let l = $target[1];
return (($target) => {
if ($target.type === "pint") {
{
let int = $target[0];
let pl = $target[1];
return cons(j$slif(j$slbin("===")(target)(j$slprim(j$slint(int)(pl))(l))(l))(j$slblock(inner))(none)(l))(nil)
}
}
if ($target.type === "pbool") {
{
let bool = $target[0];
let pl = $target[1];
return cons(j$slif(j$slbin("===")(target)(j$slprim(j$slbool(bool)(pl))(l))(l))(j$slblock(inner))(none)(l))(nil)
}
}
throw new Error('Failed to match. ' + valueToString($target));
})(prim)
}
}
if ($target.type === "pstr") {
{
let str = $target[0];
let l = $target[1];
return cons(j$slif(j$slbin("===")(target)(j$slstr(str)(nil)(l))(l))(j$slblock(inner))(none)(l))(nil)
}
}
if ($target.type === "pvar") {
{
let name = $target[0];
let l = $target[1];
return cons(j$sllet(j$slpvar(sanitize(name))(l))(target)(l))(inner)
}
}
if ($target.type === "pcon") {
{
let name = $target[0];
let nl = $target[1];
let args = $target[2];
let l = $target[3];
return cons(j$slif(j$slbin("===")(j$slattr(target)("type")(l))(j$slstr(name)(nil)(l))(l))(j$slblock(pat_loop$slj(target)(args)(0)(inner)(l)(trace)))(none)(l))(nil)
}
}
throw new Error('Failed to match. ' + valueToString($target));
})(pat);


const pat_loop$slj = (target) => (args) => (i) => (inner) => (l) => (trace) => (($target) => {
if ($target.type === "nil") {
return inner
}
if ($target.type === "cons") {
{
let arg = $target[0];
let rest = $target[1];
return compile_pat$slj(arg)(j$slindex(target)(j$slprim(j$slint(i)(l))(l))(l))(pat_loop$slj(target)(rest)($pl(i)(1))(inner)(l)(trace))(trace)
}
}
throw new Error('Failed to match. ' + valueToString($target));
})(args);

const j$slcompile_stmt = (ctx) => (stmt) => (($target) => {
if ($target.type === "j/sexpr") {
{
let expr = $target[0];
let l = $target[1];
return j$slcompile(ctx)(expr)
}
}
if ($target.type === "j/sblock") {
{
let block = $target[0];
let l = $target[1];
return j$slcompile_block(ctx)(block)
}
}
if ($target.type === "j/if") {
{
let cond = $target[0];
let yes = $target[1];
let $else = $target[2];
let l = $target[3];
return `if (${j$slcompile(ctx)(cond)}) ${j$slcompile_block(ctx)(yes)} ${(($target) => {
if ($target.type === "none") {
return ""
}
if ($target.type === "some") {
{
let block = $target[0];
return ` else ${j$slcompile_block(ctx)(block)}`
}
}
throw new Error('Failed to match. ' + valueToString($target));
})($else)}`
}
}
if ($target.type === "j/for") {
{
let arg = $target[0];
let init = $target[1];
let cond = $target[2];
let inc = $target[3];
let block = $target[4];
let l = $target[5];
return `for (let ${arg} = ${j$slcompile(ctx)(init)}; ${j$slcompile(ctx)(cond)}; ${j$slcompile(ctx)(inc)}) ${j$slcompile_block(ctx)(block)}`
}
}
if ($target.type === "j/break") {
{
let l = $target[0];
return "break"
}
}
if ($target.type === "j/continue") {
{
let l = $target[0];
return "continue"
}
}
if ($target.type === "j/return") {
{
let result = $target[0];
let l = $target[1];
return `return ${j$slcompile(ctx)(result)}`
}
}
if ($target.type === "j/let") {
{
let pat = $target[0];
let value = $target[1];
let l = $target[2];
return `let ${pat_arg(ctx)(pat)} = ${j$slcompile(ctx)(value)}`
}
}
if ($target.type === "j/throw") {
{
let value = $target[0];
let l = $target[1];
return `throw ${j$slcompile(ctx)(value)}`
}
}
throw new Error('Failed to match. ' + valueToString($target));
})(stmt);


const j$slcompile = (ctx) => (expr) => (($target) => {
if ($target.type === "j/app") {
{
let target = $target[0];
let args = $target[1];
let l = $target[2];
return `${j$slparen_expr(ctx)(target)}(${join(", ")(map(args)(j$slcompile(ctx)))})`
}
}
if ($target.type === "j/bin") {
{
let op = $target[0];
let left = $target[1];
let right = $target[2];
let l = $target[3];
return `${j$slcompile(ctx)(left)} ${op} ${j$slcompile(ctx)(right)}`
}
}
if ($target.type === "j/un") {
{
let op = $target[0];
let arg = $target[1];
let l = $target[2];
return `${op}${j$slcompile(ctx)(arg)}`
}
}
if ($target.type === "j/raw") {
{
let raw = $target[0];
let l = $target[1];
return raw
}
}
if ($target.type === "j/lambda") {
{
let args = $target[0];
let body = $target[1];
let l = $target[2];
return `(${join(", ")(map(args)(pat_arg(ctx)))}) => ${j$slcompile_body(ctx)(body)}`
}
}
if ($target.type === "j/prim") {
{
let prim = $target[0];
let l = $target[1];
return j$slcompile_prim(ctx)(prim)
}
}
if ($target.type === "j/str") {
{
let first = $target[0];
let tpls = $target[1];
let l = $target[2];
return (($target) => {
if ($target.type === "nil") {
return `\"${escape_string(unescapeString(first))}\"`
}
return `\`${escape_string(unescapeString(first))}${join("")(map(tpls)((item) => (({1: {1: l, 0: suffix}, 0: expr}) => `\${${j$slcompile(ctx)(expr)}}${escape_string(unescapeString(suffix))}`)(item)))}\``
throw new Error('Failed to match. ' + valueToString($target));
})(tpls)
}
}
if ($target.type === "j/var") {
{
let name = $target[0];
let l = $target[1];
return name
}
}
if ($target.type === "j/attr") {
{
let target = $target[0];
let attr = $target[1];
let l = $target[2];
return `${j$slparen_expr(ctx)(target)}.${sanitize(attr)}`
}
}
if ($target.type === "j/index") {
{
let target = $target[0];
let idx = $target[1];
let l = $target[2];
return `${j$slparen_expr(ctx)(target)}[${j$slcompile(ctx)(idx)}]`
}
}
if ($target.type === "j/tern") {
{
let cond = $target[0];
let yes = $target[1];
let no = $target[2];
let l = $target[3];
return `${j$slparen_expr(ctx)(cond)} ? ${j$slparen_expr(ctx)(yes)} : ${j$slparen_expr(ctx)(no)}`
}
}
if ($target.type === "j/assign") {
{
let name = $target[0];
let op = $target[1];
let value = $target[2];
let l = $target[3];
return `${name} ${op} ${j$slcompile(ctx)(value)}`
}
}
if ($target.type === "j/array") {
{
let items = $target[0];
let l = $target[1];
return `[${join(", ")(map(items)((item) => (($target) => {
if ($target.type === "left") {
{
let expr = $target[0];
return j$slcompile(ctx)(expr)
}
}
if ($target.type === "right" &&
$target[0].type === "j/spread") {
{
let expr = $target[0][0];
return `...${j$slcompile(ctx)(expr)}`
}
}
throw new Error('Failed to match. ' + valueToString($target));
})(item)))}]`
}
}
if ($target.type === "j/obj") {
{
let items = $target[0];
let l = $target[1];
return `{${join(", ")(map(items)((item) => (($target) => {
if ($target.type === "left" &&
$target[0].type === ",") {
{
let name = $target[0][0];
let value = $target[0][1];
return `\"${name}\": ${j$slcompile(ctx)(value)}`
}
}
if ($target.type === "right" &&
$target[0].type === "j/spread") {
{
let expr = $target[0][0];
return `...${j$slcompile(ctx)(expr)}`
}
}
throw new Error('Failed to match. ' + valueToString($target));
})(item)))}}`
}
}
throw new Error('Failed to match. ' + valueToString($target));
})(expr);


const j$slcompile_block = (ctx) => ({0: block}) => `{\n${join(";\n")(map(block)(j$slcompile_stmt(ctx)))}\n}`;


const j$slparen_expr = (ctx) => (target) => maybe_paren(j$slcompile(ctx)(target))(j$slneeds_parens(target));


const j$slcompile_body = (ctx) => (body) => (($target) => {
if ($target.type === "left") {
{
let block = $target[0];
return j$slcompile_block(ctx)(block)
}
}
if ($target.type === "right") {
{
let expr = $target[0];
return maybe_paren(j$slcompile(ctx)(expr))((($target) => {
if ($target.type === "j/obj") {
return true
}
return false
throw new Error('Failed to match. ' + valueToString($target));
})(expr))
}
}
throw new Error('Failed to match. ' + valueToString($target));
})(body);

const map$slexpr = (tx) => (expr) => ((loop) => (({1: post_e, 0: pre_e}) => (($target) => {
if ($target.type === "none") {
return expr
}
if ($target.type === "some") {
{
let expr = $target[0];
return post_e((($target) => {
if ($target.type === "j/app") {
{
let target = $target[0];
let args = $target[1];
let l = $target[2];
return j$slapp(loop(target))(map(args)(loop))(l)
}
}
if ($target.type === "j/bin") {
{
let op = $target[0];
let left = $target[1];
let right = $target[2];
let l = $target[3];
return j$slbin(op)(loop(left))(loop(right))(l)
}
}
if ($target.type === "j/un") {
{
let op = $target[0];
let arg = $target[1];
let l = $target[2];
return j$slun(op)(loop(arg))(l)
}
}
if ($target.type === "j/lambda") {
{
let pats = $target[0];
let body = $target[1];
let l = $target[2];
return j$sllambda(map(pats)(map$slpat(tx)))((($target) => {
if ($target.type === "left") {
{
let block = $target[0];
return left(map$slblock(tx)(block))
}
}
if ($target.type === "right") {
{
let expr = $target[0];
return right(loop(expr))
}
}
throw new Error('Failed to match. ' + valueToString($target));
})(body))(l)
}
}
if ($target.type === "j/prim") {
{
let item = $target[0];
let l = $target[1];
return j$slprim(item)(l)
}
}
if ($target.type === "j/str") {
{
let string = $target[0];
let tpls = $target[1];
let l = $target[2];
return j$slstr(string)(map(tpls)(({1: {1: l, 0: suffix}, 0: expr}) => $co(loop(expr))($co(suffix)(l))))(l)
}
}
if ($target.type === "j/raw") {
{
let string = $target[0];
let l = $target[1];
return j$slraw(string)(l)
}
}
if ($target.type === "j/var") {
{
let string = $target[0];
let l = $target[1];
return j$slvar(string)(l)
}
}
if ($target.type === "j/attr") {
{
let target = $target[0];
let string = $target[1];
let l = $target[2];
return j$slattr(loop(target))(string)(l)
}
}
if ($target.type === "j/index") {
{
let target = $target[0];
let idx = $target[1];
let l = $target[2];
return j$slindex(loop(target))(loop(idx))(l)
}
}
if ($target.type === "j/tern") {
{
let cond = $target[0];
let yes = $target[1];
let no = $target[2];
let l = $target[3];
return j$sltern(loop(cond))(loop(yes))(loop(no))(l)
}
}
if ($target.type === "j/assign") {
{
let name = $target[0];
let op = $target[1];
let value = $target[2];
let l = $target[3];
return j$slassign(name)(op)(loop(value))(l)
}
}
if ($target.type === "j/array") {
{
let items = $target[0];
let l = $target[1];
return j$slarray(map(items)((item) => (($target) => {
if ($target.type === "left") {
{
let a = $target[0];
return left(loop(a))
}
}
if ($target.type === "right" &&
$target[0].type === "j/spread") {
{
let a = $target[0][0];
return right(j$slspread(loop(a)))
}
}
throw new Error('Failed to match. ' + valueToString($target));
})(item)))(l)
}
}
if ($target.type === "j/obj") {
{
let items = $target[0];
let l = $target[1];
return j$slobj(map(items)((item) => (($target) => {
if ($target.type === "left" &&
$target[0].type === ",") {
{
let name = $target[0][0];
let value = $target[0][1];
return left($co(name)(loop(value)))
}
}
if ($target.type === "right" &&
$target[0].type === "j/spread") {
{
let value = $target[0][0];
return right(j$slspread(loop(value)))
}
}
throw new Error('Failed to match. ' + valueToString($target));
})(item)))(l)
}
}
throw new Error('Failed to match. ' + valueToString($target));
})(expr))
}
}
throw new Error('Failed to match. ' + valueToString($target));
})(pre_e(expr)))(tx))(map$slexpr(tx));


const map$slblock = (tx) => (block) => (({7: post_b, 6: pre_b}) => (($target) => {
if ($target.type === "none") {
return block
}
if ($target.type === "some" &&
$target[0].type === "j/block") {
{
let stmts = $target[0][0];
return post_b(j$slblock(map(stmts)(map$slstmt(tx))))
}
}
throw new Error('Failed to match. ' + valueToString($target));
})(pre_b(block)))(tx);


const map$slstmt = (tx) => (stmt) => ((loop) => ((loope) => (({5: post_s, 4: pre_s}) => (($target) => {
if ($target.type === "none") {
return stmt
}
if ($target.type === "some") {
{
let stmt = $target[0];
return post_s((($target) => {
if ($target.type === "j/sexpr") {
{
let expr = $target[0];
let l = $target[1];
return j$slsexpr(loope(expr))(l)
}
}
if ($target.type === "j/sblock") {
{
let block = $target[0];
let l = $target[1];
return j$slsblock(map$slblock(tx)(block))(l)
}
}
if ($target.type === "j/if") {
{
let cond = $target[0];
let yes = $target[1];
let no = $target[2];
let l = $target[3];
return j$slif(loope(cond))(map$slblock(tx)(yes))((($target) => {
if ($target.type === "none") {
return none
}
if ($target.type === "some") {
{
let v = $target[0];
return some(map$slblock(tx)(v))
}
}
throw new Error('Failed to match. ' + valueToString($target));
})(no))(l)
}
}
if ($target.type === "j/for") {
{
let string = $target[0];
let init = $target[1];
let cond = $target[2];
let inc = $target[3];
let body = $target[4];
let l = $target[5];
return j$slfor(string)(loope(init))(loope(cond))(loope(inc))(map$slblock(tx)(body))(l)
}
}
if ($target.type === "j/break") {
{
let l = $target[0];
return stmt
}
}
if ($target.type === "j/continue") {
{
let l = $target[0];
return stmt
}
}
if ($target.type === "j/return") {
{
let value = $target[0];
let l = $target[1];
return j$slreturn(loope(value))(l)
}
}
if ($target.type === "j/let") {
{
let pat = $target[0];
let value = $target[1];
let l = $target[2];
return j$sllet(map$slpat(tx)(pat))(loope(value))(l)
}
}
if ($target.type === "j/throw") {
{
let value = $target[0];
let l = $target[1];
return j$slthrow(loope(value))(l)
}
}
throw new Error('Failed to match. ' + valueToString($target));
})(stmt))
}
}
throw new Error('Failed to match. ' + valueToString($target));
})(pre_s(stmt)))(tx))(map$slexpr(tx)))(map$slstmt(tx));

const fold$slstmt = (fx) => (init) => (stmt) => (({3: s, 2: b, 1: p, 0: e}) => s((($target) => {
if ($target.type === "j/sexpr") {
{
let expr = $target[0];
return fold$slexpr(fx)(init)(expr)
}
}
if ($target.type === "j/sblock") {
{
let block = $target[0];
return fold$slblock(fx)(init)(block)
}
}
if ($target.type === "j/if") {
{
let cond = $target[0];
let yes = $target[1];
let no = $target[2];
return fold$sloption(fold$slblock(fx))(fold$slblock(fx)(fold$slexpr(fx)(init)(cond))(yes))(no)
}
}
if ($target.type === "j/for") {
{
let iit = $target[1];
let cond = $target[2];
let inc = $target[3];
let body = $target[4];
return fold$slblock(fx)(fold$slexpr(fx)(fold$slexpr(fx)(fold$slexpr(fx)(init)(iit))(cond))(inc))(body)
}
}
if ($target.type === "j/return") {
{
let value = $target[0];
return fold$slexpr(fx)(init)(value)
}
}
if ($target.type === "j/throw") {
{
let value = $target[0];
return fold$slexpr(fx)(init)(value)
}
}
if ($target.type === "j/let") {
{
let pat = $target[0];
let value = $target[1];
return fold$slexpr(fx)(fold$slpat(fx)(init)(pat))(value)
}
}
return init
throw new Error('Failed to match. ' + valueToString($target));
})(stmt))(stmt))(fx);


const fold$slexpr = (fx) => (init) => (expr) => (({0: e}) => e((($target) => {
if ($target.type === "j/app") {
{
let target = $target[0];
let args = $target[1];
return foldl(fold$slexpr(fx)(init)(target))(args)(fold$slexpr(fx))
}
}
if ($target.type === "j/bin") {
{
let left = $target[1];
let right = $target[2];
return fold$slexpr(fx)(fold$slexpr(fx)(init)(left))(right)
}
}
if ($target.type === "j/un") {
{
let arg = $target[1];
return fold$slexpr(fx)(init)(arg)
}
}
if ($target.type === "j/lambda") {
{
let pats = $target[0];
let body = $target[1];
return foldl(fold$sleither(fold$slblock(fx))(fold$slexpr(fx))(init)(body))(pats)(fold$slpat(fx))
}
}
if ($target.type === "j/str") {
{
let tpls = $target[1];
return foldl(init)(tpls)(fold$slget($co$co0)(fold$slexpr(fx)))
}
}
if ($target.type === "j/attr") {
{
let target = $target[0];
return fold$slexpr(fx)(init)(target)
}
}
if ($target.type === "j/index") {
{
let target = $target[0];
let idx = $target[1];
return fold$slexpr(fx)(fold$slexpr(fx)(init)(target))(idx)
}
}
if ($target.type === "j/tern") {
{
let cond = $target[0];
let yes = $target[1];
let no = $target[2];
return fold$slexpr(fx)(fold$slexpr(fx)(fold$slexpr(fx)(init)(cond))(yes))(no)
}
}
if ($target.type === "j/assign") {
{
let value = $target[2];
return fold$slexpr(fx)(init)(value)
}
}
if ($target.type === "j/array") {
{
let items = $target[0];
return foldl(init)(items)(fold$sleither(fold$slexpr(fx))(fold$slget(spread$slinner)(fold$slexpr(fx))))
}
}
if ($target.type === "j/obj") {
{
let items = $target[0];
return foldl(init)(items)(fold$sleither(fold$slget(snd)(fold$slexpr(fx)))(fold$slget(spread$slinner)(fold$slexpr(fx))))
}
}
return fatal("cant fold this expr")
throw new Error('Failed to match. ' + valueToString($target));
})(expr))(expr))(fx);


const fold$slblock = (fx) => (init) => (block) => (({2: b}) => (({0: items}) => b(foldl(init)(items)(fold$slstmt(fx)))(block))(block))(fx);

const parse_type = (type) => (($target) => {
if ($target.type === "cst/id") {
{
let id = $target[0];
let l = $target[1];
return $lt_(tcon(id)(l))
}
}
if ($target.type === "cst/list" &&
$target[0].type === "nil") {
{
let l = $target[1];
return $lt_(tcon("()")(l))
}
}
if ($target.type === "cst/list" &&
$target[0].type === "cons" &&
$target[0][0].type === "cst/id" &&
$target[0][0][0] === "fn" &&
$target[0][1].type === "cons" &&
$target[0][1][0].type === "cst/array" &&
$target[0][1][1].type === "cons") {
{
let args = $target[0][1][0][0];
let body = $target[0][1][1][0];
let rest = $target[0][1][1][1];
let l = $target[1];
return $gt$gt$eq(parse_type(body))((body) => $gt$gt$eq(map_$gt(parse_type)(args))((args) => $gt$gt$eq(do_$gt(unexpected("extra item in type"))(rest))((_) => $lt_(foldl(body)(rev(args)(nil))((body) => (arg) => tapp(tapp(tcon("->")(l))(arg)(l))(body)(l))))))
}
}
if ($target.type === "cst/list" &&
$target[0].type === "cons" &&
$target[0][0].type === "cst/id" &&
$target[0][0][0] === "rec" &&
$target[0][1].type === "cons" &&
$target[0][1][0].type === "cst/id" &&
$target[0][1][1].type === "cons" &&
$target[0][1][1][1].type === "nil") {
{
let name = $target[0][1][0][0];
let nl = $target[0][1][0][1];
let inner = $target[0][1][1][0];
let l = $target[1];
return $gt$gt$eq(parse_type(inner))((inner) => $lt_(trec(name)(nl)(inner)(l)))
}
}
if ($target.type === "cst/list" &&
$target[0].type === "cons" &&
$target[0][0].type === "cst/id" &&
$target[0][0][0] === ",") {
{
let cl = $target[0][0][1];
let items = $target[0][1];
let l = $target[1];
return $gt$gt$eq(map_$gt(parse_type)(items))((items) => $lt_(loop(items)((items) => (recur) => (($target) => {
if ($target.type === "nil") {
return fatal("invalid empty tuple")
}
if ($target.type === "cons" &&
$target[1].type === "nil") {
{
let one = $target[0];
return one
}
}
if ($target.type === "cons") {
{
let one = $target[0];
let rest = $target[1];
return tapp(tapp(tcon(",")(cl))(one)(l))(recur(rest))(l)
}
}
throw new Error('Failed to match. ' + valueToString($target));
})(items))))
}
}
if ($target.type === "cst/list") {
{
let items = $target[0];
let l = $target[1];
return $gt$gt$eq(map_$gt(parse_type)(items))((items) => $lt_(tapps(rev(items)(nil))(l)))
}
}
return $lt_err($co(cst_loc(type))(`(parse-type) Invalid type ${valueToString(type)}`))(tcon("()")(cst_loc(type)))
throw new Error('Failed to match. ' + valueToString($target));
})(type);

const mk_deftype = (id) => (li) => (args) => (items) => (l) => $gt$gt$eq(foldr_$gt(nil)(args)((args) => (arg) => (($target) => {
if ($target.type === "cst/id") {
{
let name = $target[0];
let l = $target[1];
return $lt_(cons($co(name)(l))(args))
}
}
return $lt_err($co(l)("deftype type argument must be identifier"))(args)
throw new Error('Failed to match. ' + valueToString($target));
})(arg)))((args) => $gt$gt$eq(foldr_$gt(nil)(items)((res) => (constr) => (($target) => {
if ($target.type === "cst/list" &&
$target[0].type === "cons" &&
$target[0][0].type === "cst/id") {
{
let name = $target[0][0][0];
let ni = $target[0][0][1];
let args = $target[0][1];
let l = $target[1];
return $gt$gt$eq(map_$gt(parse_type)(args))((args) => $lt_(cons($co(name)($co(ni)($co(args)(l))))(res)))
}
}
if ($target.type === "cst/list" &&
$target[0].type === "nil") {
{
let l = $target[1];
return $lt_err($co(l)("Empty type constructor"))(res)
}
}
return $lt_err($co(l)("Invalid type constructor"))(res)
throw new Error('Failed to match. ' + valueToString($target));
})(constr)))((items) => $lt_(tdeftype(id)(li)(args)(items)(l))));

const call_at_end = (items) => (($target) => {
if ($target.type === "nil") {
return none
}
if ($target.type === "cons" &&
$target[0].type === "j/return" &&
$target[0][0].type === "j/app" &&
$target[0][0][0].type === "j/lambda" &&
$target[1].type === "nil") {
{
let params = $target[0][0][0][0];
let body = $target[0][0][0][1];
let ll = $target[0][0][0][2];
let args = $target[0][0][1];
let al = $target[0][0][2];
let l = $target[0][1];
return (($target) => {
if ($target === true) {
return some(cons(j$slsblock(j$slblock(concat(cons(make_lets(params)(args)(ll))(cons((($target) => {
if ($target.type === "left" &&
$target[0].type === "j/block") {
{
let items = $target[0][0];
return items
}
}
if ($target.type === "right") {
{
let expr = $target[0];
return cons(j$slreturn(expr)(l))(nil)
}
}
throw new Error('Failed to match. ' + valueToString($target));
})(body))(nil)))))(l))(nil))
}
return none
throw new Error('Failed to match. ' + valueToString($target));
})($eq(len(params))(len(args)))
}
}
if ($target.type === "cons") {
{
let one = $target[0];
let rest = $target[1];
return (($target) => {
if ($target.type === "some") {
{
let v = $target[0];
return some(cons(one)(v))
}
}
{
let none = $target;
return none
}
throw new Error('Failed to match. ' + valueToString($target));
})(call_at_end(rest))
}
}
throw new Error('Failed to match. ' + valueToString($target));
})(items);

const j$slcompile_stmts = (ctx) => (stmts) => join("\n")(map(stmts)(j$slcompile_stmt(ctx)));

const let_fix_shadow = ({1: init, 0: pat}) => (l) => ((names) => ((used) => ((overlap) => ((shadow) => ((new_names) => ((mapping) => ((by_loc) => (($target) => {
if ($target.type === "nil") {
return cons($co(pat)(init))(nil)
}
return concat(cons(map(map$slto_list(mapping))(({1: $new, 0: old}) => $co(pvar($new)(l))(evar(old)(l))))(cons(cons($co(pat)(map_expr((expr) => (($target) => {
if ($target.type === "evar") {
{
let l = $target[1];
return (($target) => {
if ($target.type === "some") {
{
let new_name = $target[0];
return evar(new_name)(l)
}
}
return expr
throw new Error('Failed to match. ' + valueToString($target));
})(map$slget(by_loc)(l))
}
}
return expr
throw new Error('Failed to match. ' + valueToString($target));
})(expr))(init)))(nil))(nil)))
throw new Error('Failed to match. ' + valueToString($target));
})(overlap))(map$slfrom_list(map(overlap)(({1: loc, 0: name}) => $co(loc)(force_opt(map$slget(mapping)(name)))))))(map$slfrom_list(zip(shadow)(new_names))))(mapi(0)(shadow)((i) => (name) => `${name}\$${its(i)}`)))(set$slto_list(foldl(set$slnil)(overlap)((ov) => ({0: name}) => set$sladd(ov)(name)))))(bag$slfold((shadow) => ({1: {1: l, 0: kind}, 0: name}) => (($target) => {
if ($target.type === "value") {
return (($target) => {
if ($target === true) {
return cons($co(name)(l))(shadow)
}
return shadow
throw new Error('Failed to match. ' + valueToString($target));
})(set$slhas(names)(name))
}
return shadow
throw new Error('Failed to match. ' + valueToString($target));
})(kind))(nil)(used)))(externals(set$slnil)(init)))(pat_names(pat));

const expand_bindings = (bindings) => (l) => foldr(nil)(bindings)((res) => (binding) => concat(cons(let_fix_shadow(binding)(l))(cons(res)(nil))));

const parse_typealias = (name) => (body) => (l) => $gt$gt$eq($lt_((($target) => {
if ($target.type === "cst/id") {
{
let name = $target[0];
let nl = $target[1];
return $co(name)($co(nl)(nil))
}
}
if ($target.type === "cst/list" &&
$target[0].type === "cons" &&
$target[0][0].type === "cst/id") {
{
let name = $target[0][0][0];
let nl = $target[0][0][1];
let args = $target[0][1];
return $co(name)($co(nl)(args))
}
}
return fatal("cant parse type alias")
throw new Error('Failed to match. ' + valueToString($target));
})(name)))(({1: {1: args, 0: nl}, 0: name}) => $gt$gt$eq(foldr_$gt(nil)(args)((args) => (x) => (($target) => {
if ($target.type === "cst/id") {
{
let name = $target[0];
let l = $target[1];
return $lt_(cons($co(name)(l))(args))
}
}
return $lt_err($co(cst_loc(x))("typealias type argument must be identifier"))(args)
throw new Error('Failed to match. ' + valueToString($target));
})(x)))((args) => $gt$gt$eq(parse_type(body))((body) => $lt_(ttypealias(name)(nl)(args)(body)(l)))));

const expr$slnames = (bound) => (expr) => (($target) => {
if ($target.type === "evar") {
{
let name = $target[0];
let l = $target[1];
return expr$slvar_name(bound)(name)(l)
}
}
if ($target.type === "eprim") {
return empty
}
if ($target.type === "equot") {
return empty
}
if ($target.type === "eprovide") {
{
let target = $target[0];
let cases = $target[1];
return foldl(expr$slnames(bound)(target))(map(cases)(({1: {1: {1: body, 0: k}, 0: nl}, 0: name}) => ((pats) => (({1: names$qu, 0: bound$qu}) => bag$sland(expr$slnames(map$slmerge(bound)(map$slfrom_list(bound$qu)))(body))(names$qu))(foldl($co(nil)(empty))(map(pats)(pat$slnames))(bound_and_names)))((($target) => {
if ($target.type === "ebang") {
{
let pats = $target[0];
return pats
}
}
if ($target.type === "eeffectful") {
{
let pats = $target[2];
return pats
}
}
return nil
throw new Error('Failed to match. ' + valueToString($target));
})(k))))(bag$sland)
}
}
if ($target.type === "eeffect") {
return empty
}
if ($target.type === "eaccess") {
{
let target = $target[0];
let l = $target[2];
return (($target) => {
if ($target.type === "none") {
return empty
}
if ($target.type === "some" &&
$target[0].type === ",") {
{
let v = $target[0][0];
let l = $target[0][1];
return expr$slvar_name(bound)(v)(l)
}
}
throw new Error('Failed to match. ' + valueToString($target));
})(target)
}
}
if ($target.type === "erecord") {
{
let spread = $target[0];
let fields = $target[1];
let l = $target[2];
return foldl(map_or(dot(expr$slnames(bound))(fst))(empty)(spread))(map(fields)(dot(expr$slnames(bound))(snd)))(bag$sland)
}
}
if ($target.type === "eenum") {
{
let arg = $target[2];
return map_or(expr$slnames(bound))(empty)(arg)
}
}
if ($target.type === "eapp") {
{
let target = $target[0];
let args = $target[1];
return foldl(expr$slnames(bound)(target))(map(args)(expr$slnames(bound)))(bag$sland)
}
}
if ($target.type === "elambda") {
{
let args = $target[0];
let body = $target[1];
return (({1: names, 0: bound$qu}) => bag$sland(names)(expr$slnames(map$slmerge(bound)(map$slfrom_list(bound$qu)))(body)))(foldl($co(nil)(empty))(map(args)(pat$slnames))(bound_and_names))
}
}
if ($target.type === "elet") {
{
let bindings = $target[0];
let body = $target[1];
return loop($co(bindings)($co(bound)(empty)))(({1: {1: names, 0: bound}, 0: bindings}) => (recur) => (($target) => {
if ($target.type === "nil") {
return bag$sland(names)(expr$slnames(bound)(body))
}
if ($target.type === "cons" &&
$target[0].type === ",") {
{
let pat = $target[0][0];
let expr = $target[0][1];
let rest = $target[1];
return (({1: names$qu, 0: bound$qu}) => ((bound) => ((names) => recur($co(rest)($co(bound)(bag$sland(names)(expr$slnames(bound)(expr))))))(bag$sland(names)(names$qu)))(map$slmerge(bound)(map$slfrom_list(bound$qu))))(pat$slnames(pat))
}
}
throw new Error('Failed to match. ' + valueToString($target));
})(bindings))
}
}
if ($target.type === "ematch") {
{
let target = $target[0];
let cases = $target[1];
return foldl(expr$slnames(bound)(target))(map(cases)(({1: body, 0: pat}) => (({1: names$qu, 0: bound$qu}) => ((bound) => bag$sland(names$qu)(expr$slnames(bound)(body)))(map$slmerge(bound)(map$slfrom_list(bound$qu))))(pat$slnames(pat))))(bag$sland)
}
}
if ($target.type === "estr") {
{
let tpls = $target[1];
return many(map(tpls)(({0: expr}) => expr$slnames(bound)(expr)))
}
}
throw new Error('Failed to match. ' + valueToString($target));
})(expr);

const parse_provide = (parse_expr) => (target) => (ml) => (cases) => (l) => $gt$gt$eq(parse_expr(target))((target) => $gt$gt$eq($lt_(pairs_plus(cst$slid("()")(ml))(cases)))((cases) => $gt$gt$eq(map_$gt(({1: expr, 0: pat}) => $gt$gt$eq(parse_expr(expr))((expr) => $gt$gt$eq(parse_provide_pat(pat))(({1: {1: {1: l, 0: epat}, 0: il}, 0: id}) => $lt_($co(id)($co(il)($co(epat)(expr)))))))(cases))((cases) => $lt_(eprovide(target)(cases)(l)))));

const parse_top = (cst) => (($target) => {
if ($target.type === "cst/list" &&
$target[0].type === "cons" &&
$target[0][0].type === "cst/id" &&
$target[0][0][0] === "def" &&
$target[0][1].type === "cons" &&
$target[0][1][0].type === "cst/id" &&
$target[0][1][1].type === "cons") {
{
let id = $target[0][1][0][0];
let li = $target[0][1][0][1];
let value = $target[0][1][1][0];
let rest = $target[0][1][1][1];
let l = $target[1];
return $gt$gt$eq(parse_expr(value))((expr) => $gt$gt$eq(do_$gt(unexpected("extra items in def"))(rest))((_) => $lt_(tdef(id)(li)(expr)(l))))
}
}
if ($target.type === "cst/list" &&
$target[0].type === "cons" &&
$target[0][0].type === "cst/id" &&
$target[0][0][0] === "def") {
{
let l = $target[1];
return $lt_err($co(l)("Invalid 'def'"))(sunit(l))
}
}
if ($target.type === "cst/list" &&
$target[0].type === "cons" &&
$target[0][0].type === "cst/id" &&
$target[0][0][0] === "defn" &&
$target[0][1].type === "cons" &&
$target[0][1][0].type === "cst/id" &&
$target[0][1][1].type === "nil") {
{
let id = $target[0][1][0][0];
let li = $target[0][1][0][1];
let c = $target[1];
return $lt_(tdef(id)(li)(evar("nil")(c))(c))
}
}
if ($target.type === "cst/list" &&
$target[0].type === "cons" &&
$target[0][0].type === "cst/id" &&
$target[0][0][0] === "defn" &&
$target[0][1].type === "cons" &&
$target[0][1][0].type === "cst/id" &&
$target[0][1][1].type === "cons" &&
$target[0][1][1][0].type === "cst/array") {
{
let id = $target[0][1][0][0];
let li = $target[0][1][0][1];
let args = $target[0][1][1][0][0];
let b = $target[0][1][1][0][1];
let rest = $target[0][1][1][1];
let c = $target[1];
return $gt$gt$eq(map_$gt(parse_pat)(args))((args) => $gt$gt$eq((($target) => {
if ($target.type === "nil") {
return $lt_err($co(b)("Empty arguments list"))($unit)
}
return $lt_($unit)
throw new Error('Failed to match. ' + valueToString($target));
})(args))((_) => (($target) => {
if ($target.type === "nil") {
return $lt_(tdef(id)(li)(evar("nil")(c))(c))
}
if ($target.type === "cons") {
{
let body = $target[0];
let rest = $target[1];
return $gt$gt$eq(parse_expr(body))((body) => $gt$gt$eq(do_$gt(unexpected("extra items in defn"))(rest))((_) => $lt_(tdef(id)(li)(elambda(args)(body)(c))(c))))
}
}
throw new Error('Failed to match. ' + valueToString($target));
})(rest)))
}
}
if ($target.type === "cst/list" &&
$target[0].type === "cons" &&
$target[0][0].type === "cst/id" &&
$target[0][0][0] === "defn") {
{
let l = $target[1];
return $lt_err($co(l)("Invalid 'defn'"))(sunit(l))
}
}
if ($target.type === "cst/list" &&
$target[0].type === "cons" &&
$target[0][0].type === "cst/id" &&
$target[0][0][0] === "deftype" &&
$target[0][1].type === "cons") {
{
let name = $target[0][1][0];
let items = $target[0][1][1];
let l = $target[1];
return (($target) => {
if ($target.type === "cst/id") {
{
let id = $target[0];
let li = $target[1];
return mk_deftype(id)(li)(nil)(items)(l)
}
}
if ($target.type === "cst/list" &&
$target[0].type === "cons" &&
$target[0][0].type === "cst/id") {
{
let id = $target[0][0][0];
let li = $target[0][0][1];
let args = $target[0][1];
return mk_deftype(id)(li)(args)(items)(l)
}
}
return fatal("Cant parse deftype")
throw new Error('Failed to match. ' + valueToString($target));
})(name)
}
}
if ($target.type === "cst/list" &&
$target[0].type === "cons" &&
$target[0][0].type === "cst/id" &&
$target[0][0][0] === "deftype") {
{
let l = $target[1];
return $lt_err($co(l)("Invalid deftype"))(sunit(l))
}
}
if ($target.type === "cst/list" &&
$target[0].type === "cons" &&
$target[0][0].type === "cst/id" &&
$target[0][0][0] === "typealias" &&
$target[0][1].type === "cons" &&
$target[0][1][1].type === "cons" &&
$target[0][1][1][1].type === "nil") {
{
let name = $target[0][1][0];
let body = $target[0][1][1][0];
let l = $target[1];
return parse_typealias(name)(body)(l)
}
}
return $gt$gt$eq(parse_expr(cst))((expr) => $lt_(texpr(expr)(cst_loc(cst))))
throw new Error('Failed to match. ' + valueToString($target));
})(cst);


const parse_expr = (cst) => (($target) => {
if ($target.type === "cst/id" &&
$target[0] === "true") {
{
let l = $target[1];
return $lt_(eprim(pbool(true)(l))(l))
}
}
if ($target.type === "cst/id" &&
$target[0] === "false") {
{
let l = $target[1];
return $lt_(eprim(pbool(false)(l))(l))
}
}
if ($target.type === "cst/string") {
{
let first = $target[0];
let templates = $target[1];
let l = $target[2];
return $gt$gt$eq(map_$gt(({1: {1: l, 0: suffix}, 0: expr}) => $gt$gt$eq(parse_expr(expr))((expr) => $lt_($co(expr)($co(suffix)(l)))))(templates))((tpls) => $lt_(estr(first)(tpls)(l)))
}
}
if ($target.type === "cst/id") {
{
let id = $target[0];
let l = $target[1];
return $lt_(parse_id(id)(l))
}
}
if ($target.type === "cst/list" &&
$target[0].type === "cons" &&
$target[0][0].type === "cst/id" &&
$target[0][0][0] === "@" &&
$target[0][1].type === "cons" &&
$target[0][1][1].type === "nil") {
{
let body = $target[0][1][0];
let l = $target[1];
return $gt$gt$eq(parse_expr(body))((expr) => $lt_(equot(quot$slexpr(expr))(l)))
}
}
if ($target.type === "cst/list" &&
$target[0].type === "cons" &&
$target[0][0].type === "cst/id" &&
$target[0][0][0] === "@@" &&
$target[0][1].type === "cons" &&
$target[0][1][1].type === "nil") {
{
let body = $target[0][1][0];
let l = $target[1];
return $lt_(equot(quot$slquot(body))(l))
}
}
if ($target.type === "cst/list" &&
$target[0].type === "cons" &&
$target[0][0].type === "cst/id" &&
$target[0][0][0] === "@!" &&
$target[0][1].type === "cons" &&
$target[0][1][1].type === "nil") {
{
let body = $target[0][1][0];
let l = $target[1];
return $gt$gt$eq(parse_top(body))((top) => $lt_(equot(quot$sltop(top))(l)))
}
}
if ($target.type === "cst/list" &&
$target[0].type === "cons" &&
$target[0][0].type === "cst/id" &&
$target[0][0][0] === "@t" &&
$target[0][1].type === "cons" &&
$target[0][1][1].type === "nil") {
{
let body = $target[0][1][0];
let l = $target[1];
return $gt$gt$eq(parse_type(body))((body) => $lt_(equot(quot$sltype(body))(l)))
}
}
if ($target.type === "cst/list" &&
$target[0].type === "cons" &&
$target[0][0].type === "cst/id" &&
$target[0][0][0] === "@p" &&
$target[0][1].type === "cons" &&
$target[0][1][1].type === "nil") {
{
let body = $target[0][1][0];
let l = $target[1];
return $gt$gt$eq(parse_pat(body))((body) => $lt_(equot(quot$slpat(body))(l)))
}
}
if ($target.type === "cst/list" &&
$target[0].type === "cons" &&
$target[0][0].type === "cst/id" &&
$target[0][0][0] === "if" &&
$target[0][1].type === "cons" &&
$target[0][1][1].type === "cons" &&
$target[0][1][1][1].type === "cons" &&
$target[0][1][1][1][1].type === "nil") {
{
let cond = $target[0][1][0];
let yes = $target[0][1][1][0];
let no = $target[0][1][1][1][0];
let l = $target[1];
return $gt$gt$eq(parse_expr(cond))((cond) => $gt$gt$eq(parse_expr(yes))((yes) => $gt$gt$eq(parse_expr(no))((no) => $lt_(ematch(cond)(cons($co(pprim(pbool(true)(l))(l))(yes))(cons($co(pany(l))(no))(nil)))(l)))))
}
}
if ($target.type === "cst/list" &&
$target[0].type === "cons" &&
$target[0][0].type === "cst/id" &&
$target[0][0][0] === "fn" &&
$target[0][1].type === "cons" &&
$target[0][1][0].type === "cst/array") {
{
let ll = $target[0][0][1];
let args = $target[0][1][0][0];
let rest = $target[0][1][1];
let b = $target[1];
return $gt$gt$eq(map_$gt(parse_pat)(args))((args) => $gt$gt$eq(parse_one_expr(rest)(ll)(b))((body) => $lt_(elambda(args)(body)(b))))
}
}
if ($target.type === "cst/list" &&
$target[0].type === "cons" &&
$target[0][0].type === "cst/id" &&
$target[0][0][0] === "fn") {
{
let l = $target[1];
return $lt_err($co(l)(`Invalid 'fn' ${int_to_string(l)}`))(evar("()")(l))
}
}
if ($target.type === "cst/list" &&
$target[0].type === "cons" &&
$target[0][0].type === "cst/id" &&
$target[0][0][0] === "provide" &&
$target[0][1].type === "cons") {
{
let ml = $target[0][0][1];
let target = $target[0][1][0];
let cases = $target[0][1][1];
let l = $target[1];
return parse_provide(parse_expr)(target)(ml)(cases)(l)
}
}
if ($target.type === "cst/list" &&
$target[0].type === "cons" &&
$target[0][0].type === "cst/id" &&
$target[0][0][0] === "match" &&
$target[0][1].type === "cons") {
{
let ml = $target[0][0][1];
let target = $target[0][1][0];
let cases = $target[0][1][1];
let l = $target[1];
return $gt$gt$eq(parse_expr(target))((target) => $gt$gt$eq($lt_(pairs_plus(cst$slid("()")(ml))(cases)))((cases) => $gt$gt$eq(map_$gt(({1: expr, 0: pat}) => $gt$gt$eq(parse_pat(pat))((pat) => $gt$gt$eq(parse_expr(expr))((expr) => $lt_($co(pat)(expr)))))(cases))((cases) => $lt_(ematch(target)(cases)(l)))))
}
}
if ($target.type === "cst/list" &&
$target[0].type === "cons" &&
$target[0][0].type === "cst/id" &&
$target[0][0][0] === "let" &&
$target[0][1].type === "cons" &&
$target[0][1][0].type === "cst/array") {
{
let ll = $target[0][0][1];
let inits = $target[0][1][0][0];
let rest = $target[0][1][1];
let l = $target[1];
return $gt$gt$eq(pairs(inits))((inits) => $gt$gt$eq(map_$gt(({1: value, 0: pat}) => $gt$gt$eq(parse_pat(pat))((pat) => $gt$gt$eq(parse_expr(value))((value) => $lt_($co(pat)(value)))))(inits))((bindings) => $gt$gt$eq(parse_one_expr(rest)(ll)(l))((body) => $lt_(elet(bindings)(body)(l)))))
}
}
if ($target.type === "cst/list" &&
$target[0].type === "cons" &&
$target[0][0].type === "cst/id" &&
$target[0][0][0] === "let->" &&
$target[0][1].type === "cons" &&
$target[0][1][0].type === "cst/array" &&
$target[0][1][1].type === "cons" &&
$target[0][1][1][1].type === "nil") {
{
let el = $target[0][0][1];
let inits = $target[0][1][0][0];
let body = $target[0][1][1][0];
let l = $target[1];
return $gt$gt$eq(parse_expr(body))((body) => $gt$gt$eq(pairs(inits))((inits) => foldr_$gt(body)(inits)((body) => ({1: value, 0: pat}) => $gt$gt$eq(parse_expr(value))((value) => $gt$gt$eq(parse_pat(pat))((pat) => $lt_(eapp(evar(">>=")(el))(cons(value)(cons(elambda(cons(pat)(nil))(body)(l))(nil)))(l)))))))
}
}
if ($target.type === "cst/list" &&
$target[0].type === "cons" &&
$target[0][0].type === "cst/id" &&
$target[0][0][0] === "let") {
{
let l = $target[1];
return $lt_err($co(l)(`Invalid 'let' ${int_to_string(l)}`))(evar("()")(l))
}
}
if ($target.type === "cst/list" &&
$target[0].type === "cons" &&
$target[0][0].type === "cst/id" &&
$target[0][0][0] === ",") {
{
let il = $target[0][0][1];
let args = $target[0][1];
let l = $target[1];
return parse_tuple(args)(il)(l)
}
}
if ($target.type === "cst/list" &&
$target[0].type === "nil") {
{
let l = $target[1];
return $lt_(evar("()")(l))
}
}
if ($target.type === "cst/list" &&
$target[0].type === "cons") {
{
let target = $target[0][0];
let args = $target[0][1];
let l = $target[1];
return (($target) => {
if ($target.type === "some") {
{
let tag = $target[0];
return $gt$gt$eq(map_$gt(parse_expr)(args))((args) => $lt_(eenum(tag)(cst_loc(target))(some(loop(args)((args) => (recur) => (($target) => {
if ($target.type === "nil") {
return fatal("empty tag args")
}
if ($target.type === "cons" &&
$target[1].type === "nil") {
{
let one = $target[0];
return one
}
}
if ($target.type === "cons") {
{
let one = $target[0];
let rest = $target[1];
return eapp(evar(",")(l))(cons(one)(cons(recur(rest))(nil)))(l)
}
}
throw new Error('Failed to match. ' + valueToString($target));
})(args))))(l)))
}
}
return $gt$gt$eq(parse_expr(target))((target) => $gt$gt$eq(map_$gt(parse_expr)(args))((args) => $lt_(eapp(target)(args)(l))))
throw new Error('Failed to match. ' + valueToString($target));
})((($target) => {
if ($target.type === "cst/id") {
{
let id = $target[0];
return parse_tag(id)
}
}
return none
throw new Error('Failed to match. ' + valueToString($target));
})(target))
}
}
if ($target.type === "cst/array") {
{
let args = $target[0];
let l = $target[1];
return parse_array(args)(l)
}
}
if ($target.type === "cst/access") {
{
let target = $target[0];
let items = $target[1];
let l = $target[2];
return $lt_(eaccess(target)(items)(l))
}
}
if ($target.type === "cst/record") {
{
let items = $target[0];
let l = $target[1];
return $gt$gt$eq((($target) => {
if ($target.type === "cons" &&
$target[0].type === "cst/spread") {
{
let inner = $target[0][0];
let l = $target[0][1];
let rest = $target[1];
return $gt$gt$eq(parse_expr(inner))((inner) => $lt_($co(some(inner))(rest)))
}
}
return $lt_($co(none)(items))
throw new Error('Failed to match. ' + valueToString($target));
})(items))(({1: items, 0: spread}) => $gt$gt$eq(loop($co(items)(nil))(({1: col, 0: items}) => (recur) => (($target) => {
if ($target.type === "nil") {
return $lt_($co(col)(none))
}
if ($target.type === "cons" &&
$target[0].type === "cst/spread" &&
$target[1].type === "nil") {
{
let inner = $target[0][0];
let l = $target[0][1];
return $gt$gt$eq(parse_expr(inner))((inner) => $lt_($co(col)(some(inner))))
}
}
if ($target.type === "cons" &&
$target[1].type === "nil") {
{
let item = $target[0];
return $lt_err($co(cst_loc(item))("Trailing record item"))($co(col)(none))
}
}
if ($target.type === "cons" &&
$target[0].type === "cst/id" &&
$target[1].type === "cons") {
{
let id = $target[0][0];
let l = $target[0][1];
let two = $target[1][0];
let rest = $target[1][1];
return $gt$gt$eq(parse_expr(two))((value) => recur($co(rest)(cons($co(id)(value))(col))))
}
}
if ($target.type === "cons" &&
$target[1].type === "cons") {
{
let key = $target[0];
let rest = $target[1][1];
return $gt$gt$eq(recur($co(rest)(col)))((res) => $lt_err($co(cst_loc(key))("Not an identifier"))(res))
}
}
throw new Error('Failed to match. ' + valueToString($target));
})(items)))(({1: sprend, 0: items}) => $gt$gt$eq((($target) => {
if ($target.type === "," &&
$target[0].type === "some" &&
$target[1].type === "some") {
return $lt_err($co(l)("Cant have spreads on both sides"))(none)
}
if ($target.type === "," &&
$target[0].type === "some") {
{
let s = $target[0][0];
return $lt_(some($co(s)(false)))
}
}
if ($target.type === "," &&
$target[1].type === "some") {
{
let s = $target[1][0];
return $lt_(some($co(s)(true)))
}
}
return $lt_(none)
throw new Error('Failed to match. ' + valueToString($target));
})($co(spread)(sprend)))((spread) => $lt_(erecord(spread)(rev(items)(nil))(l)))))
}
}
return $lt_err($co(cst_loc(cst))("Unable to parse"))(evar("()")(cst_loc(cst)))
throw new Error('Failed to match. ' + valueToString($target));
})(cst);


const parse_one_expr = (rest) => (ll) => (l) => (($target) => {
if ($target.type === "cons") {
{
let body = $target[0];
let rest = $target[1];
return $gt$gt$eq(do_$gt(unexpected("extra item body"))(rest))((_) => parse_expr(body))
}
}
if ($target.type === "nil") {
return $lt_err($co(ll)("Missing body"))(evar("()")(l))
}
throw new Error('Failed to match. ' + valueToString($target));
})(rest);


const parse_tuple = (args) => (il) => (l) => (($target) => {
if ($target.type === "nil") {
return $lt_(evar(",")(il))
}
if ($target.type === "cons" &&
$target[1].type === "nil") {
{
let one = $target[0];
return parse_expr(one)
}
}
if ($target.type === "cons") {
{
let one = $target[0];
let rest = $target[1];
return $gt$gt$eq(parse_expr(one))((one) => $gt$gt$eq(parse_tuple(rest)(il)(l))((tuple) => $lt_(eapp(evar(",")(il))(cons(one)(cons(tuple)(nil)))(l))))
}
}
throw new Error('Failed to match. ' + valueToString($target));
})(args);


const parse_array = (args) => (l) => (($target) => {
if ($target.type === "nil") {
return $lt_(evar("nil")(l))
}
if ($target.type === "cons" &&
$target[0].type === "cst/spread" &&
$target[1].type === "nil") {
{
let inner = $target[0][0];
return parse_expr(inner)
}
}
if ($target.type === "cons") {
{
let one = $target[0];
let rest = $target[1];
return $gt$gt$eq(parse_expr(one))((one) => $gt$gt$eq(parse_array(rest)(l))((rest) => $lt_(eapp(evar("cons")(l))(cons(one)(cons(rest)(nil)))(l))))
}
}
throw new Error('Failed to match. ' + valueToString($target));
})(args);

const compile$slj = (expr) => (trace) => maybe_trace(expr_loc(expr))(trace)((($target) => {
if ($target.type === "estr") {
{
let first = $target[0];
let tpls = $target[1];
let l = $target[2];
return j$slstr(first)(map(tpls)(({1: {1: l, 0: suffix}, 0: expr}) => $co(compile$slj(expr)(trace))($co(suffix)(l))))(l)
}
}
if ($target.type === "eprim") {
{
let prim = $target[0];
let l = $target[1];
return (($target) => {
if ($target.type === "pint") {
{
let int = $target[0];
let pl = $target[1];
return j$slprim(j$slint(int)(pl))(l)
}
}
if ($target.type === "pbool") {
{
let bool = $target[0];
let pl = $target[1];
return j$slprim(j$slbool(bool)(pl))(l)
}
}
throw new Error('Failed to match. ' + valueToString($target));
})(prim)
}
}
if ($target.type === "evar") {
{
let name = $target[0];
let l = $target[1];
return j$slvar(sanitize(name))(l)
}
}
if ($target.type === "equot") {
{
let inner = $target[0];
let l = $target[1];
return j$slraw(quot$sljsonify(inner))(l)
}
}
if ($target.type === "eeffect" &&
$target[1] === false) {
{
let name = $target[0];
let l = $target[2];
return j$slindex(j$slvar("\$lbeffects\$rb")(l))(j$slstr(name)(nil)(l))(l)
}
}
if ($target.type === "eeffect" &&
$target[1] === true) {
{
let name = $target[0];
let l = $target[2];
return fatal("effect compile not yet")
}
}
if ($target.type === "eprovide") {
{
let target = $target[0];
let handlers = $target[1];
let l = $target[2];
return j$slapp(j$sllambda(cons(j$slpvar("\$lbeffects\$rb")(l))(nil))(right(compile$slj(target)(trace)))(l))(cons(j$slobj(cons(right(j$slspread(j$slvar("\$lbeffects\$rb")(l))))(map(handlers)(({1: {1: {1: body, 0: kind}, 0: nl}, 0: name}) => (($target) => {
if ($target.type === "eearmuffs") {
return left($co(name)(compile$slj(body)(trace)))
}
return fatal("cant compile real effects handlers just yet")
throw new Error('Failed to match. ' + valueToString($target));
})(kind))))(l))(nil))(l)
}
}
if ($target.type === "elambda") {
{
let pats = $target[0];
let body = $target[1];
let l = $target[2];
return foldr(compile$slj(body)(trace))(pats)((body) => (pat) => j$sllambda(cons((($target) => {
if ($target.type === "none") {
return j$slpvar(`_${its(l)}`)(l)
}
if ($target.type === "some") {
{
let pat = $target[0];
return pat
}
}
throw new Error('Failed to match. ' + valueToString($target));
})(pat_$gtj$slpat(pat)))(cons(j$slpvar("\$lbeffects\$rb")(l))(nil)))((($target) => {
if ($target.type === "nil") {
return right(body)
}
{
let stmts = $target;
return left(j$slblock(concat(cons(stmts)(cons(cons(j$slreturn(body)(l))(nil))(nil)))))
}
throw new Error('Failed to match. ' + valueToString($target));
})(trace_pat(pat)(trace)))(l))
}
}
if ($target.type === "elet") {
{
let bindings = $target[0];
let body = $target[1];
let l = $target[2];
return compile_let$slj(body)(trace)(bindings)(l)
}
}
if ($target.type === "eapp" &&
$target[0].type === "evar" &&
$target[1].type === "cons" &&
$target[1][1].type === "cons" &&
$target[1][1][1].type === "nil") {
{
let op = $target[0][0];
let ol = $target[0][1];
let one = $target[1][0];
let two = $target[1][1][0];
let l = $target[2];
return (($target) => {
if ($target === true) {
return j$slbin(op)(compile$slj(one)(trace))(compile$slj(two)(trace))(l)
}
return app$slj(evar(op)(ol))(cons(one)(cons(two)(nil)))(trace)(l)
throw new Error('Failed to match. ' + valueToString($target));
})(is_bop(op))
}
}
if ($target.type === "eapp") {
{
let target = $target[0];
let args = $target[1];
let l = $target[2];
return app$slj(target)(args)(trace)(l)
}
}
if ($target.type === "eaccess") {
{
let target = $target[0];
let items = $target[1];
let l = $target[2];
return ((make) => (($target) => {
if ($target.type === "some" &&
$target[0].type === ",") {
{
let t = $target[0][0];
let nl = $target[0][1];
return make(j$slvar(sanitize(t))(nl))
}
}
if ($target.type === "none") {
return j$sllambda(cons(j$slpvar("\$target")(l))(nil))(right(make(j$slvar("\$target")(l))))(l)
}
throw new Error('Failed to match. ' + valueToString($target));
})(target))((target) => foldl(target)(items)((target) => ({1: nl, 0: name}) => j$slattr(target)(name)(nl)))
}
}
if ($target.type === "erecord") {
{
let spread = $target[0];
let fields = $target[1];
let l = $target[2];
return ((fields) => j$slobj((($target) => {
if ($target.type === "none") {
return fields
}
if ($target.type === "some" &&
$target[0].type === ",") {
{
let s = $target[0][0];
return cons(right(j$slspread(compile$slj(s)(trace))))(fields)
}
}
throw new Error('Failed to match. ' + valueToString($target));
})(spread))(l))(map(fields)(({1: value, 0: name}) => left($co(name)(compile$slj(value)(trace)))))
}
}
if ($target.type === "eenum") {
{
let name = $target[0];
let nl = $target[1];
let arg = $target[2];
let l = $target[3];
return (($target) => {
if ($target.type === "none") {
return j$slstr(name)(nil)(nl)
}
if ($target.type === "some") {
{
let arg = $target[0];
return j$slobj(cons(left($co("tag")(j$slstr(name)(nil)(nl))))(cons(left($co("arg")(compile$slj(arg)(trace))))(nil)))(l)
}
}
throw new Error('Failed to match. ' + valueToString($target));
})(arg)
}
}
if ($target.type === "ematch") {
{
let target = $target[0];
let cases = $target[1];
let l = $target[2];
return j$slapp(j$sllambda(cons(j$slpvar("\$target")(l))(nil))(left(j$slblock(concat(cons(map(cases)(({1: body, 0: pat}) => j$slsblock(j$slblock(compile_pat$slj(pat)(j$slvar("\$target")(l))(concat(cons(trace_pat(pat)(trace))(cons(cons(j$slreturn(compile$slj(body)(trace))(l))(nil))(nil))))(trace)))(l)))(cons(cons(j$slthrow(j$slraw(`new Error('match fail ${its(l)}:' + JSON.stringify(\$target))`)(0))(0))(nil))(nil))))))(l))(cons(compile$slj(target)(trace))(nil))(l)
}
}
throw new Error('Failed to match. ' + valueToString($target));
})(expr));


const compile_let$slj = (body) => (trace) => (bindings) => (l) => foldr(compile$slj(body)(trace))(expand_bindings(bindings)(l))((body) => (binding) => j$slapp(j$sllambda(nil)(left(j$slblock(concat(cons(cons(compile_let_binding$slj(binding)(trace)(l))(nil))(cons(trace_pat(fst(binding))(trace))(cons(cons(j$slreturn(body)(l))(nil))(nil)))))))(l))(nil)(l));


const app$slj = (target) => (args) => (trace) => (l) => foldl(compile$slj(target)(trace))(args)((target) => (arg) => j$slapp(target)(cons(compile$slj(arg)(trace))(cons(j$slvar("\$lbeffects\$rb")(l))(nil)))(l));


const compile_let_binding$slj = ({1: init, 0: pat}) => (trace) => (l) => (($target) => {
if ($target.type === "none") {
return j$slsexpr(compile$slj(init)(trace))(l)
}
if ($target.type === "some") {
{
let pat = $target[0];
return j$sllet(pat)(compile$slj(init)(trace))(l)
}
}
throw new Error('Failed to match. ' + valueToString($target));
})(pat_$gtj$slpat(pat));

const run$slj = (v) => $eval(`((\$lbeffects\$rb) => ${j$slcompile(0)(compile$slj(run$slnil_$gt(parse_expr(v)))(map$slnil))})({})`);

const simplify_block = ({0: items}) => (($target) => {
return (($target) => {
if ($target.type === "none") {
return none
}
if ($target.type === "some") {
{
let items = $target[0];
return some(j$slblock(items))
}
}
throw new Error('Failed to match. ' + valueToString($target));
})(call_at_end(items))
throw new Error('Failed to match. ' + valueToString($target));
})(items);

const example_expr = run$slnil_$gt(parse_expr({"0":{"0":{"0":"match","1":12702,"type":"cst/id"},"1":{"0":{"0":"stmt","1":12703,"type":"cst/id"},"1":{"0":{"0":{"0":{"0":"sexpr","1":12705,"type":"cst/id"},"1":{"0":{"0":"expr","1":12706,"type":"cst/id"},"1":{"0":{"0":"l","1":12707,"type":"cst/id"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"type":"cons"},"1":12704,"type":"cst/list"},"1":{"0":{"0":{"0":{"0":"compile","1":12709,"type":"cst/id"},"1":{"0":{"0":"expr","1":12710,"type":"cst/id"},"1":{"0":{"0":"trace","1":12711,"type":"cst/id"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"type":"cons"},"1":12708,"type":"cst/list"},"1":{"0":{"0":{"0":{"0":"sdef","1":12713,"type":"cst/id"},"1":{"0":{"0":"name","1":12714,"type":"cst/id"},"1":{"0":{"0":"nl","1":12715,"type":"cst/id"},"1":{"0":{"0":"body","1":12716,"type":"cst/id"},"1":{"0":{"0":"l","1":12717,"type":"cst/id"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"type":"cons"},"type":"cons"},"type":"cons"},"1":12712,"type":"cst/list"},"1":{"0":{"0":{"0":{"0":"++","1":12719,"type":"cst/id"},"1":{"0":{"0":{"0":{"0":"const ","1":{"type":"nil"},"2":12721,"type":"cst/string"},"1":{"0":{"0":{"0":{"0":"sanitize","1":12724,"type":"cst/id"},"1":{"0":{"0":"name","1":12725,"type":"cst/id"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"1":12723,"type":"cst/list"},"1":{"0":{"0":" = ","1":{"type":"nil"},"2":12726,"type":"cst/string"},"1":{"0":{"0":{"0":{"0":"compile","1":12729,"type":"cst/id"},"1":{"0":{"0":"body","1":12730,"type":"cst/id"},"1":{"0":{"0":"trace","1":12731,"type":"cst/id"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"type":"cons"},"1":12728,"type":"cst/list"},"1":{"0":{"0":";\\n","1":{"type":"nil"},"2":12732,"type":"cst/string"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"type":"cons"},"type":"cons"},"type":"cons"},"1":12720,"type":"cst/array"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"1":12718,"type":"cst/list"},"1":{"0":{"0":{"0":{"0":"stypealias","1":12735,"type":"cst/id"},"1":{"0":{"0":"name","1":12736,"type":"cst/id"},"1":{"0":{"0":"_","1":12737,"type":"cst/id"},"1":{"0":{"0":"_","1":12738,"type":"cst/id"},"1":{"0":{"0":"_","1":12739,"type":"cst/id"},"1":{"0":{"0":"_","1":12740,"type":"cst/id"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"type":"cons"},"type":"cons"},"type":"cons"},"type":"cons"},"1":12734,"type":"cst/list"},"1":{"0":{"0":"/* type alias ","1":{"0":{"0":{"0":"name","1":12743,"type":"cst/id"},"1":{"0":" */","1":12744,"type":","},"type":","},"1":{"type":"nil"},"type":"cons"},"2":12741,"type":"cst/string"},"1":{"0":{"0":{"0":{"0":"sdeftype","1":12746,"type":"cst/id"},"1":{"0":{"0":"name","1":12747,"type":"cst/id"},"1":{"0":{"0":"nl","1":12748,"type":"cst/id"},"1":{"0":{"0":"type-arg","1":12749,"type":"cst/id"},"1":{"0":{"0":"cases","1":12750,"type":"cst/id"},"1":{"0":{"0":"l","1":12751,"type":"cst/id"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"type":"cons"},"type":"cons"},"type":"cons"},"type":"cons"},"1":12745,"type":"cst/list"},"1":{"0":{"0":{"0":{"0":"join","1":12753,"type":"cst/id"},"1":{"0":{"0":"\\n","1":{"type":"nil"},"2":12754,"type":"cst/string"},"1":{"0":{"0":{"0":{"0":"map","1":12757,"type":"cst/id"},"1":{"0":{"0":"cases","1":12758,"type":"cst/id"},"1":{"0":{"0":{"0":{"0":"fn","1":12760,"type":"cst/id"},"1":{"0":{"0":{"0":{"0":"case","1":12762,"type":"cst/id"},"1":{"type":"nil"},"type":"cons"},"1":12761,"type":"cst/array"},"1":{"0":{"0":{"0":{"0":"let","1":12764,"type":"cst/id"},"1":{"0":{"0":{"0":{"0":{"0":{"0":",","1":12767,"type":"cst/id"},"1":{"0":{"0":"name2","1":12768,"type":"cst/id"},"1":{"0":{"0":"nl","1":12769,"type":"cst/id"},"1":{"0":{"0":"args","1":12770,"type":"cst/id"},"1":{"0":{"0":"l","1":12771,"type":"cst/id"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"type":"cons"},"type":"cons"},"type":"cons"},"1":12766,"type":"cst/list"},"1":{"0":{"0":"case","1":12772,"type":"cst/id"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"1":12765,"type":"cst/array"},"1":{"0":{"0":{"0":{"0":"++","1":12774,"type":"cst/id"},"1":{"0":{"0":{"0":{"0":"const ","1":{"type":"nil"},"2":12776,"type":"cst/string"},"1":{"0":{"0":{"0":{"0":"sanitize","1":12779,"type":"cst/id"},"1":{"0":{"0":"name2","1":12780,"type":"cst/id"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"1":12778,"type":"cst/list"},"1":{"0":{"0":" = ","1":{"type":"nil"},"2":12781,"type":"cst/string"},"1":{"0":{"0":{"0":{"0":"++","1":12784,"type":"cst/id"},"1":{"0":{"0":{"0":{"0":"mapi","1":12786,"type":"cst/id"},"1":{"0":{"0":"0","1":12787,"type":"cst/id"},"1":{"0":{"0":"args","1":12788,"type":"cst/id"},"1":{"0":{"0":{"0":{"0":"fn","1":12790,"type":"cst/id"},"1":{"0":{"0":{"0":{"0":"i","1":12792,"type":"cst/id"},"1":{"0":{"0":"_","1":12793,"type":"cst/id"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"1":12791,"type":"cst/array"},"1":{"0":{"0":{"0":{"0":"++","1":12795,"type":"cst/id"},"1":{"0":{"0":{"0":{"0":"(v","1":{"type":"nil"},"2":12797,"type":"cst/string"},"1":{"0":{"0":{"0":{"0":"int-to-string","1":12800,"type":"cst/id"},"1":{"0":{"0":"i","1":12801,"type":"cst/id"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"1":12799,"type":"cst/list"},"1":{"0":{"0":") => ","1":{"type":"nil"},"2":12802,"type":"cst/string"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"type":"cons"},"1":12796,"type":"cst/array"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"1":12794,"type":"cst/list"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"type":"cons"},"1":12789,"type":"cst/list"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"type":"cons"},"type":"cons"},"1":12785,"type":"cst/list"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"1":12783,"type":"cst/list"},"1":{"0":{"0":"({type: \\\"","1":{"type":"nil"},"2":12804,"type":"cst/string"},"1":{"0":{"0":"name2","1":12806,"type":"cst/id"},"1":{"0":{"0":"\\\"","1":{"type":"nil"},"2":12807,"type":"cst/string"},"1":{"0":{"0":{"0":{"0":"++","1":12810,"type":"cst/id"},"1":{"0":{"0":{"0":{"0":"mapi","1":12812,"type":"cst/id"},"1":{"0":{"0":"0","1":12813,"type":"cst/id"},"1":{"0":{"0":"args","1":12814,"type":"cst/id"},"1":{"0":{"0":{"0":{"0":"fn","1":12816,"type":"cst/id"},"1":{"0":{"0":{"0":{"0":"i","1":12818,"type":"cst/id"},"1":{"0":{"0":"_","1":12819,"type":"cst/id"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"1":12817,"type":"cst/array"},"1":{"0":{"0":{"0":{"0":"++","1":12821,"type":"cst/id"},"1":{"0":{"0":{"0":{"0":", ","1":{"type":"nil"},"2":12823,"type":"cst/string"},"1":{"0":{"0":{"0":{"0":"int-to-string","1":12826,"type":"cst/id"},"1":{"0":{"0":"i","1":12827,"type":"cst/id"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"1":12825,"type":"cst/list"},"1":{"0":{"0":": v","1":{"type":"nil"},"2":12828,"type":"cst/string"},"1":{"0":{"0":{"0":{"0":"int-to-string","1":12831,"type":"cst/id"},"1":{"0":{"0":"i","1":12832,"type":"cst/id"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"1":12830,"type":"cst/list"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"type":"cons"},"type":"cons"},"1":12822,"type":"cst/array"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"1":12820,"type":"cst/list"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"type":"cons"},"1":12815,"type":"cst/list"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"type":"cons"},"type":"cons"},"1":12811,"type":"cst/list"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"1":12809,"type":"cst/list"},"1":{"0":{"0":"});","1":{"type":"nil"},"2":12833,"type":"cst/string"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"type":"cons"},"type":"cons"},"type":"cons"},"type":"cons"},"type":"cons"},"type":"cons"},"type":"cons"},"1":12775,"type":"cst/array"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"1":12773,"type":"cst/list"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"type":"cons"},"1":12763,"type":"cst/list"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"type":"cons"},"1":12759,"type":"cst/list"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"type":"cons"},"1":12756,"type":"cst/list"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"type":"cons"},"1":12752,"type":"cst/list"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"type":"cons"},"type":"cons"},"type":"cons"},"type":"cons"},"type":"cons"},"type":"cons"},"type":"cons"},"type":"cons"},"1":12701,"type":"cst/list"}));

const compile_top$slj = (top) => (trace) => (($target) => {
if ($target.type === "texpr") {
{
let expr = $target[0];
let l = $target[1];
return cons(j$slsexpr(provide_empty_effects(right(compile$slj(expr)(trace))))(l))(nil)
}
}
if ($target.type === "tdef") {
{
let name = $target[0];
let nl = $target[1];
let body = $target[2];
let l = $target[3];
return cons(j$sllet(j$slpvar(sanitize(name))(nl))(compile$slj(body)(trace))(l))(nil)
}
}
if ($target.type === "ttypealias") {
{
let name = $target[0];
return nil
}
}
if ($target.type === "tdeftype") {
{
let name = $target[0];
let nl = $target[1];
let type_arg = $target[2];
let cases = $target[3];
let l = $target[4];
return map(cases)(($case) => (({1: {1: {1: l, 0: args}, 0: nl}, 0: name2}) => j$sllet(j$slpvar(sanitize(name2))(nl))(foldr(j$slobj(cons(left($co("type")(j$slstr(name2)(nil)(nl))))(mapi(0)(args)((i) => (_) => left($co(int_to_string(i))(j$slvar(`v${int_to_string(i)}`)(nl))))))(l))(mapi(0)(args)((i) => (_) => j$slpvar(`v${int_to_string(i)}`)(nl)))((body) => (arg) => j$sllambda(cons(arg)(nil))(right(body))(l)))(l))($case))
}
}
throw new Error('Failed to match. ' + valueToString($target));
})(top);

const ex = run$slnil_$gt(parse_expr({"0":{"0":{"0":"let","1":16241,"type":"cst/id"},"1":{"0":{"0":{"0":{"0":"x","1":16243,"type":"cst/id"},"1":{"0":{"0":"10","1":16244,"type":"cst/id"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"1":16242,"type":"cst/array"},"1":{"0":{"0":"x","1":16246,"type":"cst/id"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"type":"cons"},"1":16240,"type":"cst/list"}));

const top$slnames = (top) => (($target) => {
if ($target.type === "tdef") {
{
let name = $target[0];
let l = $target[1];
let body = $target[2];
return bag$sland(one(global(name)(value)(l)(decl)))(expr$slnames(map$slfrom_list(cons($co(name)(l))(nil)))(body))
}
}
if ($target.type === "texpr") {
{
let body = $target[0];
return expr$slnames(map$slnil)(body)
}
}
if ($target.type === "ttypealias") {
{
let name = $target[0];
let l = $target[1];
let free = $target[2];
let body = $target[3];
return bag$sland(one(global(name)(type)(l)(decl)))(type$slnames(map$slfrom_list(free))(body))
}
}
if ($target.type === "tdeftype") {
{
let name = $target[0];
let l = $target[1];
let free = $target[2];
let constructors = $target[3];
return foldl(one(global(name)(type)(l)(decl)))(map(constructors)(({1: {1: {0: args}, 0: l}, 0: name}) => foldl(one(global(name)(value)(l)(decl)))(map(args)(type$slnames(map$slfrom_list(free))))(bag$sland)))(bag$sland)
}
}
throw new Error('Failed to match. ' + valueToString($target));
})(top);

const simplify_js = tx((expr) => some(expr))(apply_until(simplify_one))((pat) => none)((pat) => pat)((stmt) => some(stmt))(apply_until(simplify_stmt))((block) => some(block))(apply_until(simplify_block));

return $eval("({0: parse_stmt2,  1: parse_expr2, 2: compile_stmt2, 3: compile2, 4: names, 5: externals_stmt, 6: externals_expr, 7: stmt_size, 8: expr_size, 9: type_size, 10: locals_at}) => all_names => builtins => ({\ntype: 'fns', parse_stmt2, parse_expr2, compile_stmt2, compile2, names, externals_stmt, externals_expr, stmt_size, expr_size, type_size, locals_at, all_names, builtins})")(parse_and_compile((top) => state_f(parse_top(top))(state$slnil))((expr) => state_f(parse_expr(expr))(state$slnil))((top) => (type_info) => (ctx) => ((top) => j$slcompile_stmts(ctx)(map(compile_top$slj(top)(ctx))(map$slstmt(simplify_js))))((($target) => {
if ($target.type === "tvar") {
return top
}
return (($target) => {
if ($target.type === "texpr") {
{
let e = $target[0];
let l = $target[1];
return texpr(elambda(cons(pany(-1))(nil))(e)(l))(l)
}
}
return fatal("non-expr has unbound effects??")
throw new Error('Failed to match. ' + valueToString($target));
})(top)
throw new Error('Failed to match. ' + valueToString($target));
})(type_info)))((expr) => (type_info) => (ctx) => ((expr) => j$slcompile(ctx)(provide_empty_effects(right(map$slexpr(simplify_js)(compile$slj(expr)(ctx))))))((($target) => {
if ($target.type === "tvar") {
return expr
}
return elambda(cons(pany(-1))(nil))(expr)(-1)
throw new Error('Failed to match. ' + valueToString($target));
})(type_info)))(names)(externals_top)((expr) => bag$slto_list(externals(set$slnil)(expr)))(top_size)(expr_size)(type_size)((tl) => (top) => (($target) => {
if ($target.type === "some") {
{
let v = $target[0];
return bag$slto_list(v)
}
}
return nil
throw new Error('Failed to match. ' + valueToString($target));
})(locals_at_top(empty)(tl)(top))))((top) => bag$slto_list(top$slnames(top)))(builtins)