// built by parse-1-args.js:algw-list.js:jcst.js on 6/25/2024, 3:24:27 PM

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
  const res = [];
  for (;v.type !== 'nil';v=v[1]) {
    res.push(v[0]);
  }
  return res;
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
    '(': '$lb',
    ')': '$rb',
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
let pint = (v0) => (v1) => ({type: "pint", 0: v0, 1: v1})
let pbool = (v0) => (v1) => ({type: "pbool", 0: v0, 1: v1})
let some = (v0) => ({type: "some", 0: v0})
let none = {type: "none"}
let its = int_to_string
let value = {type: "value"}
let type = {type: "type"}
let dot = (a) => (b) => (c) => a(b(c))
let just_trace = (loc) => (trace) => (value) => (($target) => {
if ($target.type === "none") {
return ""
} ;
if ($target.type === "some") {
let info = $target[0];
return `\$trace(${its(loc)}, ${jsonify(info)}, ${value});`
} ;
throw new Error('match fail 8267:' + JSON.stringify($target))
})(map$slget(trace)(loc))
let j$slint = (v0) => (v1) => ({type: "j/int", 0: v0, 1: v1})
let j$slfloat = (v0) => (v1) => ({type: "j/float", 0: v0, 1: v1})
let j$slbool = (v0) => (v1) => ({type: "j/bool", 0: v0, 1: v1})
let j$slspread = (v0) => ({type: "j/spread", 0: v0})
let left = (v0) => ({type: "left", 0: v0})
let right = (v0) => ({type: "right", 0: v0})
let j$slcompile_prim = (ctx) => (prim) => (($target) => {
if ($target.type === "j/int") {
let int = $target[0];
let l = $target[1];
return int_to_string(int)
} ;
if ($target.type === "j/float") {
let float = $target[0];
let l = $target[1];
return jsonify(float)
} ;
if ($target.type === "j/bool") {
let bool = $target[0];
let l = $target[1];
{
let $target = bool;
if ($target === true) {
return "true"
} ;
return "false";
throw new Error('match fail 10456:' + JSON.stringify($target))
}
} ;
throw new Error('match fail 10430:' + JSON.stringify($target))
})(prim)
let maybe_paren = (text) => (wrap) => (($target) => {
if ($target === true) {
return `(${text})`
} ;
return text;
throw new Error('match fail 10519:' + JSON.stringify($target))
})(wrap)
let map_opt = (v) => (f) => (($target) => {
if ($target.type === "none") {
return none
} ;
if ($target.type === "some") {
let v = $target[0];
return some(f(v))
} ;
throw new Error('match fail 13580:' + JSON.stringify($target))
})(v)
let apply_until = (f) => (v) => (($target) => {
if ($target.type === "some") {
let v = $target[0];
return apply_until(f)(v)
} ;
if ($target.type === "none") {
return v
} ;
throw new Error('match fail 13730:' + JSON.stringify($target))
})(f(v))
let fold$sloption = (inner) => (init) => (value) => (($target) => {
if ($target.type === "none") {
return init
} ;
if ($target.type === "some") {
let v = $target[0];
return inner(init)(v)
} ;
throw new Error('match fail 14922:' + JSON.stringify($target))
})(value)
let fold$sleither = (fleft) => (fright) => (init) => (value) => (($target) => {
if ($target.type === "left") {
let l = $target[0];
return fleft(init)(l)
} ;
if ($target.type === "right") {
let r = $target[0];
return fright(init)(r)
} ;
throw new Error('match fail 15152:' + JSON.stringify($target))
})(value)
let fold$slget = (get) => (f) => (init) => (value) => f(init)(get(value))
let spread$slinner = ({"0": inner}) => inner
let nop = (a) => (b) => a
let force_opt = (x) => (($target) => {
if ($target.type === "none") {
return fatal("empty")
} ;
if ($target.type === "some") {
let x = $target[0];
return x
} ;
throw new Error('match fail 15409:' + JSON.stringify($target))
})(x)
let loop = (init) => (f) => f(init)((v) => loop(v)(f))
let map_some = (f) => (v) => (($target) => {
if ($target.type === "some") {
let v = $target[0];
return some(f(v))
} ;
return none;
throw new Error('match fail 18811:' + JSON.stringify($target))
})(v)
let $co = (v0) => (v1) => ({type: ",", 0: v0, 1: v1})
let usage = (v0) => ({type: "usage", 0: v0})
let decl = {type: "decl"}
let renum = {type: "renum"}
let rrecord = {type: "rrecord"}
let map_opt$qe = (f) => (v) => (($target) => {
if ($target.type === "some") {
let v = $target[0];
return f(v)
} ;
return none;
throw new Error('match fail 20839:' + JSON.stringify($target))
})(v)
let map_or = (f) => (or) => (v) => (($target) => {
if ($target.type === "some") {
let v = $target[0];
return f(v)
} ;
return or;
throw new Error('match fail 20860:' + JSON.stringify($target))
})(v)
let parse_tag = $eval("v => v.startsWith('\\'') ? {type: 'some', 0: v.slice(1)} : {type: 'none'}")
let is_earmuffs = $eval("v => v.startsWith('*') && v.endsWith('*') && v.length > 2")
let is_bang = $eval("v => v.startsWith('!')")
let is_arrow = $eval("v => v.startsWith('<-')")
let builtins_cps = "(() => {return {\n  \$pl: (x, _, done) => done((y, _, done) => done(x + y)),\n  \$co: (x, _, done) => done((y, _, done) => done({type: ',', 0: x, 1: y})),\n  \$unit: 'unit',\n  jsonify: (x, _, done) => done(JSON.stringify(x) ?? 'undefined'),\n  \$get_effect: function(effects, name) {\n    if (!Array.isArray(effects)) throw new Error(\`effects not an array: \${JSON.stringify(effects)}\`)\n  for (let i=effects.length - 1; i>=0; i--) {\n    if (effects[i][name] != undefined) {\n      return effects[i][name];\n    }\n  }\n  throw new Error(\`Effect \${name} not present in effects list \${effects.map(m => Object.keys(m)).join(' ; ')}\`);\n  },\n  \$rebase_handlers: function(name, prev, next, mine) {\n    const at = prev.indexOf(mine);\n    if (at === -1) throw new Error(\`got lost somewhere\`)\n    return [...next, ...prev.slice(at + 1)]\n  },\n  \$remove_me: (eff, save_name, mine) => {\n    if (!eff) return eff\n    const at = eff.indexOf(mine)\n    if (at === -1) return eff // throw new Error('cant remove me, not there');\n    return eff.slice(0, at)\n  },\n}})()"
let opt_or = (v) => (d) => (($target) => {
if ($target.type === "some") {
let v = $target[0];
return v
} ;
return d;
throw new Error('match fail 25344:' + JSON.stringify($target))
})(v)
let or = (a) => (b) => (($target) => {
if ($target === true) {
return true
} ;
return b;
throw new Error('match fail 26434:' + JSON.stringify($target))
})(a)
let efvbl = sanitize("(effects)")
let m = jsonify(1)
let builtins_ex_cps = "function equal(a, b) {\n    if (a === b) return true;\n\n    if (a && b && typeof a == 'object' && typeof b == 'object') {\n        var length, i, keys;\n        if (Array.isArray(a)) {\n            length = a.length;\n            if (length != b.length) return false;\n            for (i = length; i-- !== 0; ) if (!equal(a[i], b[i])) return false;\n            return true;\n        }\n\n        keys = Object.keys(a);\n        length = keys.length;\n        if (length !== Object.keys(b).length) return false;\n\n        for (i = length; i-- !== 0; ) {\n            if (!Object.prototype.hasOwnProperty.call(b, keys[i])) return false;\n        }\n\n        for (i = length; i-- !== 0; ) {\n            var key = keys[i];\n\n            if (!equal(a[key], b[key])) return false;\n        }\n\n        return true;\n    }\n\n    // true if both NaN, false otherwise\n    return a !== a && b !== b;\n}\n\nfunction unescapeString(n) {\n    if (n == null || !n.replaceAll) {\n        debugger;\n        return '';\n    }\n    return n.replaceAll(/\\\\./g, (m) => {\n        if (m[1] === 'n') {\n            return '\\n';\n        }\n        if (m[1] === 't') {\n            return '\\t';\n        }\n        if (m[1] === 'r') {\n            return '\\r';\n        }\n        return m[1];\n    });\n}\n\nfunction unwrapList(v) {\n    return v.type === 'nil' ? [] : [v[0], ...unwrapList(v[1])];\n}\n\nfunction wrapList(v) {\n    let res = { type: 'nil' };\n    for (let i = v.length - 1; i >= 0; i--) {\n        res = { type: 'cons', 0: v[i], 1: res };\n    }\n    return res;\n}\n\nconst sanMap = {\n    // '\$\$\$\$' gets interpreted by replaceAll as '\$\$', for reasons\n    \$: '\$\$\$\$',\n    '-': '_',\n    '+': '\$pl',\n    '*': '\$ti',\n    '=': '\$eq',\n    '>': '\$gt',\n    '<': '\$lt',\n    \"'\": '\$qu',\n    '\"': '\$dq',\n    ',': '\$co',\n    '/': '\$sl',\n    ';': '\$semi',\n    '@': '\$at',\n    ':': '\$cl',\n    '#': '\$ha',\n    '!': '\$ex',\n    '|': '\$bar',\n    '()': '\$unit',\n    '?': '\$qe',\n  };\nconst kwds =\n    'case new var const let if else return super break while for default eval'.split(' ');\n\n// Convert an identifier into a valid js identifier, replacing special characters, and accounting for keywords.\nfunction sanitize(raw) {\n    for (let [key, val] of Object.entries(sanMap)) {\n        raw = raw.replaceAll(key, val);\n    }\n    if (kwds.includes(raw)) return '\$' + raw\n    return raw\n}\n\nconst valueToString = (v) => {\n    if (Array.isArray(v)) {\n        return \`[\${v.map(valueToString).join(', ')}]\`;\n    }\n    if (typeof v === 'object' && v && 'type' in v) {\n        if (v.type === 'cons' || v.type === 'nil') {\n            const un = unwrapList(v);\n            return '[' + un.map(valueToString).join(' ') + ']';\n        }\n\n        let args = [];\n        for (let i = 0; i in v; i++) {\n            args.push(v[i]);\n        }\n        return \`(\${v.type}\${args\n            .map((arg) => ' ' + valueToString(arg))\n            .join('')})\`;\n    }\n    if (typeof v === 'string') {\n        if (v.includes('\"') && !v.includes(\"'\")) {\n            return (\n                \"'\" + JSON.stringify(v).slice(1, -1).replace(/\\\"/g, '\"') + \"'\"\n            );\n        }\n        return JSON.stringify(v);\n    }\n    if (typeof v === 'function') {\n        return '<function>';\n    }\n\n    return '' + v;\n};\n\nreturn {\n    '+': (a, e, d) => d((b, e, d) => d(a + b, e), e),\n    '-': (a, e, d) => d((b, e, d) => d(a - b, e), e),\n    '/': (a, e, d) => d((b, e, d) => d(Math.floor(a / b), e), e),\n    '*': (a, e, d) => d((b, e, d) => d(a * b, e), e),\n    '<': (a, e, d) => d((b, e, d) => d(a < b, e), e),\n    '<=': (a, e, d) => d((b, e, d) => d(a <= b, e), e),\n    '>': (a, e, d) => d((b, e, d) => d(a > b, e), e),\n    '>=': (a, e, d) => d((b, e, d) => d(a >= b, e), e),\n    '=': (a, e, d) => d((b, e, d) => d(equal(a, b), e), e),\n    '!=': (a, e, d) => d((b, e, d) => d(!equal(a, b), e), e),\n    pi: Math.PI,\n    //'replace-all': a => b => c => a.replaceAll(b, c),\n    eval: (source, e, d) => {\n      d(new Function('', 'return ' + source)(), e);\n    },\n    /*'eval-with': ctx => source => {\n      const args = '{' + Object.keys(ctx).join(',') + '}'\n      return new Function(args, 'return ' + source)(ctx);\n    },*/\n    '()': null,\n    \$unit: null,\n/*    errorToString: f => arg => {\n      try {\n        return f(arg)\n      } catch (err) {\n        return err.message;\n      }\n    },\n  */  valueToString: (v, e, d) => d(valueToString(v), e),\n    unescapeString: (v, e, d) => d(unescapeString(v), e),\n    sanitize: (v, e, d) => d(sanitize(v), e),\n    equal: (a, e, d) => d((b, e, d) => d(equal(a, b), e), e),\n    'int-to-string': (a, e, d) => d(a.toString(), e),\n    'string-to-int': (a, e, d) => {\n        const v = Number(a);\n        return d(Number.isInteger(v) && v.toString() === a ? { type: 'some', 0: v } : { type: 'none' }, e);\n    },\n    'string-to-float': (a, e, d) => {\n        const v = Number(a);\n        return d(Number.isFinite(v) ? { type: 'some', 0: v } : { type: 'none' }, e);\n    },\n\n    // maps\n    'map/nil': [],\n    'map/set': (map, e, d) => d((key, e, d) => d((value, e, d) =>\n        d([[key, value], ...map.filter((i) => i[0] !== key)], e), e), e),\n    'map/rm': (map, e, d) => d((key, e, d) => d(map.filter((i) => !equal(i[0], key)), e), e),\n    \n    // ** NOT FIXED YET **\n    /*\n    'map/get': (map) => (key) => {\n        const found = map.find((i) => equal(i[0], key));\n        return found ? { type: 'some', 0: found[1] } : { type: 'none' };\n    },\n    'map/map': (fn) => (map) => map.map(([k, v]) => [k, fn(v)]),\n    'map/merge': (one) => (two) =>\n        [...one, ...two.filter(([key]) => !one.find(([a]) => equal(a, key)))],\n    'map/values': (map) => wrapList(map.map((item) => item[1])),\n    'map/keys': (map) => wrapList(map.map((item) => item[0])),\n    'map/from-list': (list) =>\n        unwrapList(list).map((pair) => [pair[0], pair[1]]),\n    'map/to-list': (map) =>\n        wrapList(map.map(([key, value]) => ({ type: ',', 0: key, 1: value }))),\n\n    // sets\n    'set/nil': [],\n    'set/add': (s) => (v) => [v, ...s.filter((m) => !equal(v, m))],\n    'set/has': (s) => (v) => s.includes(v),\n    'set/rm': (s) => (v) => s.filter((i) => !equal(i, v)),\n    // NOTE this is only working for primitives\n    'set/diff': (a) => (b) => a.filter((i) => !b.some((j) => equal(i, j))),\n    'set/merge': (a) => (b) =>\n        [...a, ...b.filter((x) => !a.some((y) => equal(y, x)))],\n    'set/overlap': (a) => (b) => a.filter((x) => b.some((y) => equal(y, x))),\n    'set/to-list': wrapList,\n    'set/from-list': (s) => {\n        const res = [];\n        unwrapList(s).forEach((item) => {\n            if (res.some((m) => equal(item, m))) {\n                return;\n            }\n            res.push(item);\n        });\n        return res;\n    },\n    */\n\n    // Various debugging stuff\n    jsonify: (v, e, d) => d(JSON.stringify(v) ?? 'undefined', e),\n    fatal: (message) => {\n        throw new Error(\`Fatal runtime: \${message}\`);\n    },\n}"
let builtin_effects = "{\n      '<-http/get'(k, v) {\n        fetch(v).then(res => {\n          if (res.status === 200) {\n            return res.text().then(text => k({type: 'ok', 0: text}, this))\n          } else {\n            k({type: 'err', 0: {tag: 'HTTP/Status', arg: res.status}}, this)\n          }\n        }).catch(err => {\n          k({type: 'err', 0: {tag: 'HTTP/Unknown', arg: err.message || 'Unknown'}}, this)\n        })\n      },\n      '<-log'(k, v) {\n        \$env.valueToString(v, 0, v => \$update(v, true));\n        k(null, this)\n      },\n      '<-fail'(k, v) {\n        \$env.valueToString(v, 0, v => \$update({type: 'error', error: v}));\n      },\n      '<-wait'(k, v) {\n        setTimeout(() => k(null, this), v);\n      },\n      '<-ask/bool'(k, v) {\n        \$ask('bool', v, null, v => k(v, this))\n      },\n      '<-ask/string'(k, v) {\n        \$ask('string', v, null, v => k(v, this))\n      },\n      '<-ask/int'(k, v) {\n        \$ask('int', v, null, v => k(v, this))\n      },\n      '<-ask/int-range'(k, v) {\n        \$ask('int', v[0], [v[1][0], v[1][1]], v => k(v, this))\n      },\n      '<-ask/options'(k, v) {\n        function unwrapList(v) {\n          return v.type === 'nil' ? [] : [v[0], ...unwrapList(v[1])];\n        }\n        \$ask('options', v[0], unwrapList(v[1]), v => k(v, this))\n      },\n      '<-random/int'(k, v) {\n        k(Math.round(Math.random() * (v[1] - v[0]) + v[0]), this)\n      }\n}"
let nil = {type: "nil"}
let cons = (v0) => (v1) => ({type: "cons", 0: v0, 1: v1})
let pany = (v0) => ({type: "pany", 0: v0})
let pvar = (v0) => (v1) => ({type: "pvar", 0: v0, 1: v1})
let pcon = (v0) => (v1) => (v2) => (v3) => ({type: "pcon", 0: v0, 1: v1, 2: v2, 3: v3})
let pstr = (v0) => (v1) => ({type: "pstr", 0: v0, 1: v1})
let pprim = (v0) => (v1) => ({type: "pprim", 0: v0, 1: v1})
let precord = (v0) => (v1) => (v2) => ({type: "precord", 0: v0, 1: v1, 2: v2})
let penum = (v0) => (v1) => (v2) => (v3) => ({type: "penum", 0: v0, 1: v1, 2: v2, 3: v3})
let tvar = (v0) => (v1) => ({type: "tvar", 0: v0, 1: v1})
let tapp = (v0) => (v1) => (v2) => ({type: "tapp", 0: v0, 1: v1, 2: v2})
let tcon = (v0) => (v1) => ({type: "tcon", 0: v0, 1: v1})
let trec = (v0) => (v1) => (v2) => (v3) => ({type: "trec", 0: v0, 1: v1, 2: v2, 3: v3})
let trow = (v0) => (v1) => (v2) => (v3) => ({type: "trow", 0: v0, 1: v1, 2: v2, 3: v3})
let cst$sllist = (v0) => (v1) => ({type: "cst/list", 0: v0, 1: v1})
let cst$slarray = (v0) => (v1) => ({type: "cst/array", 0: v0, 1: v1})
let cst$slspread = (v0) => (v1) => ({type: "cst/spread", 0: v0, 1: v1})
let cst$slrecord = (v0) => (v1) => ({type: "cst/record", 0: v0, 1: v1})
let cst$slaccess = (v0) => (v1) => (v2) => ({type: "cst/access", 0: v0, 1: v1, 2: v2})
let cst$slid = (v0) => (v1) => ({type: "cst/id", 0: v0, 1: v1})
let cst$slstring = (v0) => (v1) => (v2) => ({type: "cst/string", 0: v0, 1: v1, 2: v2})
let one = (v0) => ({type: "one", 0: v0})
let many = (v0) => ({type: "many", 0: v0})
let empty = {type: "empty"}
let j$slpvar = (v0) => (v1) => ({type: "j/pvar", 0: v0, 1: v1})
let j$slparray = (v0) => (v1) => (v2) => ({type: "j/parray", 0: v0, 1: v1, 2: v2})
let j$slpobj = (v0) => (v1) => (v2) => ({type: "j/pobj", 0: v0, 1: v1, 2: v2})
let join = (sep) => (items) => (($target) => {
if ($target.type === "nil") {
return ""
} ;
if ($target.type === "cons") {
let one = $target[0];
let rest = $target[1];
{
let $target = rest;
if ($target.type === "nil") {
return one
} ;
return `${one}${sep}${join(sep)(rest)}`;
throw new Error('match fail 151:' + JSON.stringify($target))
}
} ;
throw new Error('match fail 139:' + JSON.stringify($target))
})(items)
let mapi = (i) => (values) => (f) => (($target) => {
if ($target.type === "nil") {
return nil
} ;
if ($target.type === "cons") {
let one = $target[0];
let rest = $target[1];
return cons(f(i)(one))(mapi(1 + i)(rest)(f))
} ;
throw new Error('match fail 229:' + JSON.stringify($target))
})(values)
let snd = (tuple) => {
let {"1": v} = tuple;
return v
}
let fst = (tuple) => {
let {"0": v} = tuple;
return v
}
let tapps = (items) => (l) => (($target) => {
if ($target.type === "nil") {
return fatal("empty tapps")
} ;
if ($target.type === "cons") {
let one = $target[0];
if ($target[1].type === "nil") {
return one
} 
} ;
if ($target.type === "cons") {
let one = $target[0];
let rest = $target[1];
return tapp(tapps(rest)(l))(one)(l)
} ;
throw new Error('match fail 904:' + JSON.stringify($target))
})(items)
let replaces = (target) => (repl) => (($target) => {
if ($target.type === "nil") {
return target
} ;
if ($target.type === "cons") {
let one = $target[0];
let rest = $target[1];
{
let $target = one;
if ($target.type === ",") {
let find = $target[0];
let nw = $target[1];
return replaces(replace_all(target)(find)(nw))(rest)
} ;
throw new Error('match fail 2112:' + JSON.stringify($target))
}
} ;
throw new Error('match fail 2101:' + JSON.stringify($target))
})(repl)
let escape_string = (string) => replaces(string)(cons($co("\\")("\\\\"))(cons($co("\n")("\\n"))(cons($co("\"")("\\\""))(cons($co("\`")("\\\`"))(cons($co("\$")("\\\$"))(nil))))))
let pat_loc = (pat) => (($target) => {
if ($target.type === "pany") {
let l = $target[0];
return l
} ;
if ($target.type === "pprim") {
let l = $target[1];
return l
} ;
if ($target.type === "pstr") {
let l = $target[1];
return l
} ;
if ($target.type === "pvar") {
let l = $target[1];
return l
} ;
if ($target.type === "pcon") {
let l = $target[3];
return l
} ;
if ($target.type === "precord") {
let l = $target[2];
return l
} ;
if ($target.type === "penum") {
let l = $target[3];
return l
} ;
throw new Error('match fail 4542:' + JSON.stringify($target))
})(pat)
let trace_wrap = (loc) => (trace) => (js) => (($target) => {
if ($target.type === "none") {
return js
} ;
if ($target.type === "some") {
let info = $target[0];
return `\$trace(${its(loc)}, ${jsonify(info)}, ${js})`
} ;
throw new Error('match fail 4699:' + JSON.stringify($target))
})(map$slget(trace)(loc))
let trace_and = (loc) => (trace) => (value) => (js) => (($target) => {
if ($target.type === "none") {
return js
} ;
if ($target.type === "some") {
let info = $target[0];
return `(\$trace(${its(loc)}, ${jsonify(info)}, ${value}), ${js})`
} ;
throw new Error('match fail 4750:' + JSON.stringify($target))
})(map$slget(trace)(loc))
let trace_and_block = (loc) => (trace) => (value) => (js) => (($target) => {
if ($target.type === "none") {
return js
} ;
if ($target.type === "some") {
let info = $target[0];
return `\$trace(${its(loc)}, ${jsonify(info)}, ${value});\n${js}`
} ;
throw new Error('match fail 4859:' + JSON.stringify($target))
})(map$slget(trace)(loc))
let source_map = (loc) => (js) => `/*${its(loc)}*/${js}/*<${its(loc)}*/`
let rev = (arr) => (col) => (($target) => {
if ($target.type === "nil") {
return col
} ;
if ($target.type === "cons") {
let one = $target[0];
if ($target[1].type === "nil") {
return cons(one)(col)
} 
} ;
if ($target.type === "cons") {
let one = $target[0];
let rest = $target[1];
return rev(rest)(cons(one)(col))
} ;
throw new Error('match fail 5384:' + JSON.stringify($target))
})(arr)
let foldl = (init) => (items) => (f) => (($target) => {
if ($target.type === "nil") {
return init
} ;
if ($target.type === "cons") {
let one = $target[0];
let rest = $target[1];
return foldl(f(init)(one))(rest)(f)
} ;
throw new Error('match fail 5863:' + JSON.stringify($target))
})(items)
let map = (values) => (f) => (($target) => {
if ($target.type === "nil") {
return nil
} ;
if ($target.type === "cons") {
let one = $target[0];
let rest = $target[1];
return cons(f(one))(map(rest)(f))
} ;
throw new Error('match fail 5889:' + JSON.stringify($target))
})(values)
let foldr = (init) => (items) => (f) => (($target) => {
if ($target.type === "nil") {
return init
} ;
if ($target.type === "cons") {
let one = $target[0];
let rest = $target[1];
return f(foldr(init)(rest)(f))(one)
} ;
throw new Error('match fail 5920:' + JSON.stringify($target))
})(items)
let bag$sland = (first) => (second) => (($target) => {
if ($target.type === ",") {
if ($target[0].type === "empty") {
let a = $target[1];
return a
} 
} ;
if ($target.type === ",") {
let a = $target[0];
if ($target[1].type === "empty") {
return a
} 
} ;
if ($target.type === ",") {
if ($target[0].type === "many") {
if ($target[0][0].type === "cons") {
let a = $target[0][0][0];
if ($target[0][0][1].type === "nil") {
if ($target[1].type === "many") {
let b = $target[1][0];
return many(cons(a)(b))
} 
} 
} 
} 
} ;
if ($target.type === ",") {
let a = $target[0];
if ($target[1].type === "many") {
let b = $target[1][0];
return many(cons(a)(b))
} 
} ;
return many(cons(first)(cons(second)(nil)));
throw new Error('match fail 6573:' + JSON.stringify($target))
})($co(first)(second))
let bag$slfold = (f) => (init) => (bag) => (($target) => {
if ($target.type === "empty") {
return init
} ;
if ($target.type === "one") {
let v = $target[0];
return f(init)(v)
} ;
if ($target.type === "many") {
let items = $target[0];
return foldr(init)(items)(bag$slfold(f))
} ;
throw new Error('match fail 6631:' + JSON.stringify($target))
})(bag)
let bag$slto_list = (bag) => bag$slfold((list) => (one) => cons(one)(list))(nil)(bag)
let pat_names = (pat) => (($target) => {
if ($target.type === "pany") {
return set$slnil
} ;
if ($target.type === "pvar") {
let name = $target[0];
let l = $target[1];
return set$sladd(set$slnil)(name)
} ;
if ($target.type === "pcon") {
let name = $target[0];
let nl = $target[1];
let args = $target[2];
let l = $target[3];
return foldl(set$slnil)(args)((bound) => (arg) => set$slmerge(bound)(pat_names(arg)))
} ;
if ($target.type === "pstr") {
let string = $target[0];
let int = $target[1];
return set$slnil
} ;
if ($target.type === "pprim") {
let prim = $target[0];
let int = $target[1];
return set$slnil
} ;
if ($target.type === "precord") {
let fields = $target[0];
let spread = $target[1];
let int = $target[2];
return foldl(map_or(pat_names)(set$slnil)(spread))(map(fields)(dot(pat_names)(snd)))(set$slmerge)
} ;
if ($target.type === "penum") {
let arg = $target[2];
return map_or(pat_names)(set$slnil)(arg)
} ;
throw new Error('match fail 6762:' + JSON.stringify($target))
})(pat)
let pat_externals = (pat) => (($target) => {
if ($target.type === "pcon") {
let name = $target[0];
let nl = $target[1];
let args = $target[2];
let l = $target[3];
return bag$sland(one($co(name)($co(value)(nl))))(many(map(args)(pat_externals)))
} ;
return empty;
throw new Error('match fail 6812:' + JSON.stringify($target))
})(pat)
let externals_type = (bound) => (t) => (($target) => {
if ($target.type === "tvar") {
return empty
} ;
if ($target.type === "tcon") {
let name = $target[0];
let l = $target[1];
{
let $target = set$slhas(bound)(name);
if ($target === true) {
return empty
} ;
return one($co(name)($co(type)(l)));
throw new Error('match fail 7121:' + JSON.stringify($target))
}
} ;
if ($target.type === "trec") {
let inner = $target[2];
let l = $target[3];
return externals_type(bound)(inner)
} ;
if ($target.type === "tapp") {
let one = $target[0];
let two = $target[1];
return bag$sland(externals_type(bound)(one))(externals_type(bound)(two))
} ;
if ($target.type === "trow") {
let fields = $target[0];
let spread = $target[1];
return foldl(map_or(externals_type(bound))(empty)(spread))(map(fields)(dot(externals_type(bound))(snd)))(bag$sland)
} ;
throw new Error('match fail 7109:' + JSON.stringify($target))
})(t)
let pat_names_loc = (pat) => (($target) => {
if ($target.type === "pany") {
return empty
} ;
if ($target.type === "pvar") {
let name = $target[0];
let l = $target[1];
return one($co(name)(l))
} ;
if ($target.type === "pcon") {
let name = $target[0];
let nl = $target[1];
let args = $target[2];
let l = $target[3];
return foldl(one($co(name)(nl)))(args)((bound) => (arg) => bag$sland(bound)(pat_names_loc(arg)))
} ;
if ($target.type === "pstr") {
let string = $target[0];
let int = $target[1];
return empty
} ;
if ($target.type === "pprim") {
let prim = $target[0];
let int = $target[1];
return empty
} ;
if ($target.type === "precord") {
let fields = $target[0];
let spread = $target[1];
return foldl(map_or(pat_names_loc)(empty)(spread))(map(fields)(dot(pat_names_loc)(snd)))(bag$sland)
} ;
if ($target.type === "penum") {
let arg = $target[2];
return map_or(pat_names_loc)(empty)(arg)
} ;
throw new Error('match fail 8191:' + JSON.stringify($target))
})(pat)
let fold_type = (init) => (type) => (f) => {
let v = f(init)(type);
{
let $target = type;
if ($target.type === "tapp") {
let target = $target[0];
let arg = $target[1];
return fold_type(fold_type(v)(target)(f))(arg)(f)
} ;
return v;
throw new Error('match fail 9852:' + JSON.stringify($target))
}
}
let type_type = (type) => (($target) => {
if ($target.type === "tapp") {
return "app"
} ;
if ($target.type === "tvar") {
return "var"
} ;
if ($target.type === "tcon") {
return "con"
} ;
if ($target.type === "trec") {
return "rec"
} ;
if ($target.type === "trow") {
return "row"
} ;
throw new Error('match fail 9887:' + JSON.stringify($target))
})(type)
let type_size = (type) => fold_type(0)(type)((v) => (_9922) => 1 + v)
let pat_arg = (ctx) => (pat) => (($target) => {
if ($target.type === "j/pvar") {
let name = $target[0];
let l = $target[1];
return name
} ;
if ($target.type === "j/parray") {
let items = $target[0];
let spread = $target[1];
let l = $target[2];
return `[${join(", ")(map(items)(pat_arg(ctx)))}${(($target) => {
if ($target.type === "some") {
let s = $target[0];
return `...${pat_arg(ctx)(s)}`
} ;
if ($target.type === "none") {
return ""
} ;
throw new Error('match fail 10622:' + JSON.stringify($target))
})(spread)}]`
} ;
if ($target.type === "j/pobj") {
let items = $target[0];
let spread = $target[1];
let l = $target[2];
return `{${join(", ")(map(items)((pair) => `\"${escape_string(fst(pair))}\": ${pat_arg(ctx)(snd(pair))}`))}${(($target) => {
if ($target.type === "some") {
let s = $target[0];
return `...${pat_arg(ctx)(s)}`
} ;
if ($target.type === "none") {
return ""
} ;
throw new Error('match fail 10671:' + JSON.stringify($target))
})(spread)}}`
} ;
throw new Error('match fail 10594:' + JSON.stringify($target))
})(pat)
let $co$co0 = (x) => {
let {"0": a} = x;
return a
}
let $co$co1 = (x) => {
let {"1": {"0": a}} = x;
return a
}
let $co$co2 = (x) => {
let {"1": {"1": a}} = x;
return a
}
let $co$co$co2 = (x) => {
let x$$0 = x;
{
let {"1": {"1": {"0": x}}} = x$$0;
return x
}
}
let pat_$gtj$slpat = (pat) => (($target) => {
if ($target.type === "pany") {
let l = $target[0];
return none
} ;
if ($target.type === "pvar") {
let name = $target[0];
let l = $target[1];
return some(j$slpvar(sanitize(name))(l))
} ;
if ($target.type === "pcon") {
let name = $target[0];
let il = $target[1];
let args = $target[2];
let l = $target[3];
{
let $target = foldl($co(0)(nil))(args)((result) => (arg) => {
let {"1": res, "0": i} = result;
{
let $target = pat_$gtj$slpat(arg);
if ($target.type === "none") {
return $co(i + 1)(res)
} ;
if ($target.type === "some") {
let what = $target[0];
return $co(i + 1)(cons($co(its(i))(what))(res))
} ;
throw new Error('match fail 11408:' + JSON.stringify($target))
}
});
if ($target.type === ",") {
if ($target[1].type === "nil") {
return none
} 
} ;
if ($target.type === ",") {
let items = $target[1];
return some(j$slpobj(items)(none)(l))
} ;
throw new Error('match fail 11386:' + JSON.stringify($target))
}
} ;
if ($target.type === "pstr") {
let string = $target[0];
let l = $target[1];
return fatal("Cant use string as pattern")
} ;
if ($target.type === "pprim") {
let prim = $target[0];
let l = $target[1];
return fatal("Cant use prim as pattern")
} ;
if ($target.type === "precord") {
let fields = $target[0];
let spread = $target[1];
let l = $target[2];
{
let fields$$0 = fields;
{
let fields = map(fields$$0)(({"1": pat, "0": name}) => $co(name)(pat_$gtj$slpat(pat)));
return some(j$slpobj(foldr(nil)(fields)((rest) => ({"1": pat, "0": name}) => (($target) => {
if ($target.type === "none") {
return rest
} ;
if ($target.type === "some") {
let pat = $target[0];
return cons($co(name)(pat))(rest)
} ;
throw new Error('match fail 20344:' + JSON.stringify($target))
})(pat)))((($target) => {
if ($target.type === "none") {
return none
} ;
if ($target.type === "some") {
let v = $target[0];
return pat_$gtj$slpat(v)
} ;
throw new Error('match fail 20362:' + JSON.stringify($target))
})(spread))(l))
}
}
} ;
if ($target.type === "penum") {
let name = $target[0];
let arg = $target[2];
let l = $target[3];
{
let $target = arg;
if ($target.type === "none") {
return none
} ;
if ($target.type === "some") {
let v = $target[0];
{
let $target = pat_$gtj$slpat(v);
if ($target.type === "none") {
return none
} ;
if ($target.type === "some") {
let v = $target[0];
return some(j$slpobj(cons($co("arg")(v))(nil))(none)(l))
} ;
throw new Error('match fail 20394:' + JSON.stringify($target))
}
} ;
throw new Error('match fail 20381:' + JSON.stringify($target))
}
} ;
throw new Error('match fail 11343:' + JSON.stringify($target))
})(pat)
let concat = (lists) => (($target) => {
if ($target.type === "nil") {
return nil
} ;
if ($target.type === "cons") {
if ($target[0].type === "nil") {
let rest = $target[1];
return concat(rest)
} 
} ;
if ($target.type === "cons") {
if ($target[0].type === "cons") {
let one = $target[0][0];
let rest = $target[0][1];
let other = $target[1];
return cons(one)(concat(cons(rest)(other)))
} 
} ;
throw new Error('match fail 12416:' + JSON.stringify($target))
})(lists)
let bops = cons("-")(cons("+")(cons(">")(cons("<")(cons("==")(cons("===")(cons("<=")(cons(">=")(cons("*")(nil)))))))))
let contains = (lst) => (item) => (($target) => {
if ($target.type === "nil") {
return false
} ;
if ($target.type === "cons") {
let one = $target[0];
let rest = $target[1];
{
let $target = $eq(one)(item);
if ($target === true) {
return true
} ;
return contains(rest)(item);
throw new Error('match fail 12648:' + JSON.stringify($target))
}
} ;
throw new Error('match fail 12637:' + JSON.stringify($target))
})(lst)
let len = (x) => (($target) => {
if ($target.type === "nil") {
return 0
} ;
if ($target.type === "cons") {
let one = $target[0];
let rest = $target[1];
return 1 + len(rest)
} ;
throw new Error('match fail 14084:' + JSON.stringify($target))
})(x)
let pat_names$slj = (pat) => (($target) => {
if ($target.type === "j/pvar") {
let name = $target[0];
return one(name)
} ;
if ($target.type === "j/pobj") {
let items = $target[0];
let spread = $target[1];
return foldl((($target) => {
if ($target.type === "none") {
return empty
} ;
if ($target.type === "some") {
let pat = $target[0];
return pat_names$slj(pat)
} ;
throw new Error('match fail 14722:' + JSON.stringify($target))
})(spread))(items)((bag) => ({"1": item, "0": name}) => bag$sland(bag)(pat_names$slj(item)))
} ;
return fatal("Cant get pat names/j");
throw new Error('match fail 14667:' + JSON.stringify($target))
})(pat)
let map$co$co0 = (f) => ({"1": {"1": c, "0": b}, "0": a}) => $co(f(a))($co(b)(c))
let map$co1 = (f) => ({"1": b, "0": a}) => $co(a)(f(b))
let zip = (one) => (two) => (($target) => {
if ($target.type === ",") {
if ($target[0].type === "nil") {
if ($target[1].type === "nil") {
return nil
} 
} 
} ;
if ($target.type === ",") {
if ($target[0].type === "cons") {
let o = $target[0][0];
let one = $target[0][1];
if ($target[1].type === "cons") {
let t = $target[1][0];
let two = $target[1][1];
return cons($co(o)(t))(zip(one)(two))
} 
} 
} ;
return fatal("Mismatched lists to zip");
throw new Error('match fail 15967:' + JSON.stringify($target))
})($co(one)(two))

let StateT = (v0) => ({type: "StateT", 0: v0})
let run_$gt = ({"0": f}) => (state) => {
let {"1": result} = f(state);
return result
}
let state_f = ({"0": f}) => f
let $gt$gt$eq = ({"0": f}) => (next) => StateT((state) => {
let state$$0 = state;
{
let {"1": value, "0": state} = f(state$$0);
return state_f(next(value))(state)
}
})
let $lt_ = (x) => StateT((state) => $co(state)(x))
let $lt_err = (e) => (v) => StateT((state) => $co(cons(e)(state))(v))
let $lt_state = StateT((state) => $co(state)(state))
let state_$gt = (v) => StateT((old) => $co(v)(old))
let map_$gt = (f) => (arr) => (($target) => {
if ($target.type === "nil") {
return $lt_(nil)
} ;
if ($target.type === "cons") {
let one = $target[0];
let rest = $target[1];
return $gt$gt$eq(f(one))((one) => $gt$gt$eq(map_$gt(f)(rest))((rest) => $lt_(cons(one)(rest))))
} ;
throw new Error('match fail 16625:' + JSON.stringify($target))
})(arr)
let do_$gt = (f) => (arr) => (($target) => {
if ($target.type === "nil") {
return $lt_($unit)
} ;
if ($target.type === "cons") {
let one = $target[0];
let rest = $target[1];
return $gt$gt$eq(f(one))((_16672) => $gt$gt$eq(do_$gt(f)(rest))((_16672) => $lt_($unit)))
} ;
throw new Error('match fail 16661:' + JSON.stringify($target))
})(arr)
let seq_$gt = (arr) => (($target) => {
if ($target.type === "nil") {
return $lt_(nil)
} ;
if ($target.type === "cons") {
let one = $target[0];
let rest = $target[1];
return $gt$gt$eq(one)((one) => $gt$gt$eq(seq_$gt(rest))((rest) => $lt_(cons(one)(rest))))
} ;
throw new Error('match fail 16693:' + JSON.stringify($target))
})(arr)
let foldl_$gt = (init) => (values) => (f) => (($target) => {
if ($target.type === "nil") {
return $lt_(init)
} ;
if ($target.type === "cons") {
let one = $target[0];
let rest = $target[1];
return $gt$gt$eq(f(init)(one))((one) => foldl_$gt(one)(rest)(f))
} ;
throw new Error('match fail 16773:' + JSON.stringify($target))
})(values)
let foldr_$gt = (init) => (values) => (f) => (($target) => {
if ($target.type === "nil") {
return $lt_(init)
} ;
if ($target.type === "cons") {
let one = $target[0];
let rest = $target[1];
return $gt$gt$eq(foldr_$gt(init)(rest)(f))((init) => f(init)(one))
} ;
throw new Error('match fail 16805:' + JSON.stringify($target))
})(values)
let state$slnil = nil
let cst_loc = (cst) => (($target) => {
if ($target.type === "cst/id") {
let l = $target[1];
return l
} ;
if ($target.type === "cst/list") {
let l = $target[1];
return l
} ;
if ($target.type === "cst/array") {
let l = $target[1];
return l
} ;
if ($target.type === "cst/spread") {
let l = $target[1];
return l
} ;
if ($target.type === "cst/string") {
let l = $target[2];
return l
} ;
if ($target.type === "cst/access") {
let l = $target[2];
return l
} ;
if ($target.type === "cst/record") {
let l = $target[1];
return l
} ;
throw new Error('match fail 17105:' + JSON.stringify($target))
})(cst)
let pat$slidents = (pat) => (($target) => {
if ($target.type === "pvar") {
let name = $target[0];
let l = $target[1];
return one($co(name)(l))
} ;
if ($target.type === "pcon") {
let name = $target[0];
let il = $target[1];
let pats = $target[2];
let l = $target[3];
return many(cons(one($co(name)(il)))(map(pats)(pat$slidents)))
} ;
return empty;
throw new Error('match fail 18605:' + JSON.stringify($target))
})(pat)
let type$slidents = (type) => (($target) => {
if ($target.type === "tvar") {
let name = $target[0];
let l = $target[1];
return one($co(name)(l))
} ;
if ($target.type === "tapp") {
let target = $target[0];
let arg = $target[1];
return bag$sland(type$slidents(target))(type$slidents(arg))
} ;
if ($target.type === "tcon") {
let name = $target[0];
let l = $target[1];
return one($co(name)(l))
} ;
if ($target.type === "trec") {
let name = $target[0];
let nl = $target[1];
let inner = $target[2];
let l = $target[3];
return many(cons(one($co(name)(nl)))(cons(type$slidents(inner))(nil)))
} ;
if ($target.type === "trow") {
let fields = $target[0];
let spread = $target[1];
let l = $target[3];
return foldl(map_or(type$slidents)(empty)(spread))(map(fields)(dot(type$slidents)(snd)))(bag$sland)
} ;
throw new Error('match fail 18755:' + JSON.stringify($target))
})(type)
let pairs_plus = (extra) => (list) => (($target) => {
if ($target.type === "nil") {
return nil
} ;
if ($target.type === "cons") {
let one = $target[0];
if ($target[1].type === "cons") {
let two = $target[1][0];
let rest = $target[1][1];
return cons($co(one)(two))(pairs_plus(extra)(rest))
} 
} ;
if ($target.type === "cons") {
let one = $target[0];
if ($target[1].type === "nil") {
return cons($co(one)(extra))(nil)
} 
} ;
throw new Error('match fail 18956:' + JSON.stringify($target))
})(list)
let local = (v0) => (v1) => ({type: "local", 0: v0, 1: v1})
let global = (v0) => (v1) => (v2) => (v3) => ({type: "global", 0: v0, 1: v1, 2: v2, 3: v3})
let bound_and_names = ({"1": names, "0": bound}) => ({"1": names$qu, "0": bound$qu}) => $co(concat(cons(bound)(cons(bound$qu)(nil))))(bag$sland(names)(names$qu))
let type$slnames = (free) => (body) => (($target) => {
if ($target.type === "tvar") {
let name = $target[0];
let l = $target[1];
{
let $target = map$slget(free)(name);
if ($target.type === "some") {
let dl = $target[0];
return one(local(l)(usage(dl)))
} ;
return empty;
throw new Error('match fail 19893:' + JSON.stringify($target))
}
} ;
if ($target.type === "tcon") {
let name = $target[0];
let l = $target[1];
return one(global(name)(type)(l)(usage($unit)))
} ;
if ($target.type === "trec") {
let name = $target[0];
let nl = $target[1];
let inner = $target[2];
let l = $target[3];
return type$slnames(map$slset(free)(name)(nl))(inner)
} ;
if ($target.type === "trow") {
let fields = $target[0];
let spread = $target[1];
let l = $target[3];
return foldl(map_or(type$slnames(free))(empty)(spread))(map(fields)(dot(type$slnames(free))(snd)))(bag$sland)
} ;
if ($target.type === "tapp") {
let target = $target[0];
let arg = $target[1];
return bag$sland(type$slnames(free)(target))(type$slnames(free)(arg))
} ;
throw new Error('match fail 19886:' + JSON.stringify($target))
})(body)
let expr$slvar_name = (bound) => (name) => (l) => (($target) => {
if ($target.type === "some") {
let dl = $target[0];
return one(local(l)(usage(dl)))
} ;
if ($target.type === "none") {
return one(global(name)(value)(l)(usage($unit)))
} ;
throw new Error('match fail 19541:' + JSON.stringify($target))
})(map$slget(bound)(name))
let eearmuffs = {type: "eearmuffs"}
let ebang = (v0) => ({type: "ebang", 0: v0})
let eeffectful = (v0) => (v1) => (v2) => ({type: "eeffectful", 0: v0, 1: v1, 2: v2})
let go = ({"0": f}) => {
let {"1": value, "0": {"0": has}} = f($co(false)(0));
{
let $target = has;
if ($target === true) {
return right(value)
} ;
return left(value);
throw new Error('match fail 24965:' + JSON.stringify($target))
}
}
let $lt_right = (v) => StateT(({"1": idx}) => $co($co(true)(idx))(v))
let $lt_r = (v) => $gt$gt$eq($lt_state)(({"1": {"1": idx}, "0": wraps}) => $gt$gt$eq(state_$gt($co(wraps)($co(true)(idx))))((_26451) => $lt_(v)))
let pat_as_arg_inner = (pat) => (($target) => {
if ($target.type === "pany") {
return none
} ;
if ($target.type === "pprim") {
return none
} ;
if ($target.type === "pstr") {
return none
} ;
if ($target.type === "pvar") {
let name = $target[0];
return some(sanitize(name))
} ;
if ($target.type === "pcon") {
let args = $target[2];
{
let $target = foldl($co(0)(nil))(args)(({"1": res, "0": i}) => (arg) => $co(i + 1)((($target) => {
if ($target.type === "none") {
return res
} ;
if ($target.type === "some") {
let arg = $target[0];
return cons(`${int_to_string(i)}: ${arg}`)(res)
} ;
throw new Error('match fail 28730:' + JSON.stringify($target))
})(pat_as_arg_inner(arg))));
if ($target.type === ",") {
if ($target[1].type === "nil") {
return none
} 
} ;
if ($target.type === ",") {
let args = $target[1];
return some(`{${join(", ")(args)}}`)
} ;
throw new Error('match fail 28707:' + JSON.stringify($target))
}
} ;
return fatal(`No pat ${jsonify(pat)}`);
throw new Error('match fail 28675:' + JSON.stringify($target))
})(pat)
let pats_tuple = (pats) => (l) => loop(pats)((pats) => (recur) => (($target) => {
if ($target.type === "nil") {
return j$slpvar("\$_")(l)
} ;
if ($target.type === "cons") {
let one = $target[0];
if ($target[1].type === "nil") {
return opt_or(pat_$gtj$slpat(one))(j$slpvar("\$_")(l))
} 
} ;
if ($target.type === "cons") {
let one = $target[0];
let rest = $target[1];
return j$slpobj(cons($co("0")(opt_or(pat_$gtj$slpat(one))(j$slpvar("\$_")(l))))(cons($co("1")(recur(rest)))(nil)))(none)(l)
} ;
throw new Error('match fail 35513:' + JSON.stringify($target))
})(pats))
let jpv = (n) => j$slpvar(n)(-1)
let eprim = (v0) => (v1) => ({type: "eprim", 0: v0, 1: v1})
let estr = (v0) => (v1) => (v2) => ({type: "estr", 0: v0, 1: v1, 2: v2})
let evar = (v0) => (v1) => ({type: "evar", 0: v0, 1: v1})
let eeffect = (v0) => (v1) => (v2) => ({type: "eeffect", 0: v0, 1: v1, 2: v2})
let equot = (v0) => (v1) => ({type: "equot", 0: v0, 1: v1})
let elambda = (v0) => (v1) => (v2) => ({type: "elambda", 0: v0, 1: v1, 2: v2})
let eapp = (v0) => (v1) => (v2) => ({type: "eapp", 0: v0, 1: v1, 2: v2})
let elet = (v0) => (v1) => (v2) => ({type: "elet", 0: v0, 1: v1, 2: v2})
let ematch = (v0) => (v1) => (v2) => ({type: "ematch", 0: v0, 1: v1, 2: v2})
let eenum = (v0) => (v1) => (v2) => (v3) => ({type: "eenum", 0: v0, 1: v1, 2: v2, 3: v3})
let erecord = (v0) => (v1) => (v2) => ({type: "erecord", 0: v0, 1: v1, 2: v2})
let eaccess = (v0) => (v1) => (v2) => ({type: "eaccess", 0: v0, 1: v1, 2: v2})
let eprovide = (v0) => (v1) => (v2) => ({type: "eprovide", 0: v0, 1: v1, 2: v2})

let quot$slexpr = (v0) => ({type: "quot/expr", 0: v0})
let quot$sltop = (v0) => ({type: "quot/top", 0: v0})
let quot$sltype = (v0) => ({type: "quot/type", 0: v0})
let quot$slpat = (v0) => ({type: "quot/pat", 0: v0})
let quot$slquot = (v0) => ({type: "quot/quot", 0: v0})

let ttypealias = (v0) => (v1) => (v2) => (v3) => (v4) => ({type: "ttypealias", 0: v0, 1: v1, 2: v2, 3: v3, 4: v4})
let tdeftype = (v0) => (v1) => (v2) => (v3) => (v4) => ({type: "tdeftype", 0: v0, 1: v1, 2: v2, 3: v3, 4: v4})
let tdef = (v0) => (v1) => (v2) => (v3) => ({type: "tdef", 0: v0, 1: v1, 2: v2, 3: v3})
let texpr = (v0) => (v1) => ({type: "texpr", 0: v0, 1: v1})
let parse_pat = (pat) => (($target) => {
if ($target.type === "cst/id") {
if ($target[0] === "_") {
let l = $target[1];
return $lt_(pany(l))
} 
} ;
if ($target.type === "cst/id") {
if ($target[0] === "true") {
let l = $target[1];
return $lt_(pprim(pbool(true)(l))(l))
} 
} ;
if ($target.type === "cst/id") {
if ($target[0] === "false") {
let l = $target[1];
return $lt_(pprim(pbool(false)(l))(l))
} 
} ;
if ($target.type === "cst/string") {
let first = $target[0];
if ($target[1].type === "nil") {
let l = $target[2];
return $lt_(pstr(first)(l))
} 
} ;
if ($target.type === "cst/id") {
let id = $target[0];
let l = $target[1];
return $lt_((($target) => {
if ($target.type === "some") {
let int = $target[0];
return pprim(pint(int)(l))(l)
} ;
{
let $target = parse_tag(id);
if ($target.type === "some") {
let t = $target[0];
return penum(t)(l)(none)(l)
} ;
return pvar(id)(l);
throw new Error('match fail 21387:' + JSON.stringify($target))
};
throw new Error('match fail 3019:' + JSON.stringify($target))
})(string_to_int(id)))
} ;
if ($target.type === "cst/array") {
if ($target[0].type === "nil") {
let l = $target[1];
return $lt_(pcon("nil")(-1)(nil)(l))
} 
} ;
if ($target.type === "cst/array") {
if ($target[0].type === "cons") {
if ($target[0][0].type === "cst/spread") {
let inner = $target[0][0][0];
if ($target[0][1].type === "nil") {
return parse_pat(inner)
} 
} 
} 
} ;
if ($target.type === "cst/array") {
if ($target[0].type === "cons") {
let one = $target[0][0];
let rest = $target[0][1];
let l = $target[1];
return $gt$gt$eq(parse_pat(one))((one) => $gt$gt$eq(parse_pat(cst$slarray(rest)(l)))((rest) => $lt_(pcon("cons")(-1)(cons(one)(cons(rest)(nil)))(l))))
} 
} ;
if ($target.type === "cst/list") {
if ($target[0].type === "nil") {
let l = $target[1];
return $lt_(pcon("()")(-1)(nil)(l))
} 
} ;
if ($target.type === "cst/list") {
if ($target[0].type === "cons") {
if ($target[0][0].type === "cst/id") {
if ($target[0][0][0] === ",") {
let il = $target[0][0][1];
let args = $target[0][1];
let l = $target[1];
return parse_pat_tuple(args)(il)(l)
} 
} 
} 
} ;
if ($target.type === "cst/list") {
if ($target[0].type === "cons") {
if ($target[0][0].type === "cst/id") {
let name = $target[0][0][0];
let il = $target[0][0][1];
let rest = $target[0][1];
let l = $target[1];
return $gt$gt$eq(map_$gt(parse_pat)(rest))((rest) => (($target) => {
if ($target.type === "some") {
let tag = $target[0];
return $lt_(penum(tag)(il)(some(loop(rest)((rest) => (recur) => (($target) => {
if ($target.type === "nil") {
return fatal("empty tag lol")
} ;
if ($target.type === "cons") {
let one = $target[0];
if ($target[1].type === "nil") {
return one
} 
} ;
if ($target.type === "cons") {
let one = $target[0];
let rest = $target[1];
return pcon(",")(il)(cons(one)(cons(recur(rest))(nil)))(l)
} ;
throw new Error('match fail 21429:' + JSON.stringify($target))
})(rest))))(l))
} ;
return $lt_(pcon(name)(il)(rest)(l));
throw new Error('match fail 21402:' + JSON.stringify($target))
})(parse_tag(name)))
} 
} 
} ;
if ($target.type === "cst/record") {
let items = $target[0];
let l = $target[1];
return $gt$gt$eq(loop(items)((items) => (recur) => (($target) => {
if ($target.type === "nil") {
return $lt_($co(none)(nil))
} ;
if ($target.type === "cons") {
if ($target[0].type === "cst/spread") {
let last = $target[0][0];
if ($target[1].type === "nil") {
return $gt$gt$eq(parse_pat(last))((last) => $lt_($co(some(last))(nil)))
} 
} 
} ;
if ($target.type === "cons") {
if ($target[0].type === "cst/id") {
let id = $target[0][0];
if ($target[1].type === "cons") {
let two = $target[1][0];
let rest = $target[1][1];
return $gt$gt$eq(recur(rest))(({"1": rest, "0": last}) => $gt$gt$eq(parse_pat(two))((two) => $lt_($co(last)(cons($co(id)(two))(rest)))))
} 
} 
} ;
return $lt_err($co(l)("Invalid record pat"))($co(none)(nil));
throw new Error('match fail 21280:' + JSON.stringify($target))
})(items)))(({"1": items, "0": spread}) => $lt_(precord(items)(spread)(l)))
} ;
return $lt_err($co(cst_loc(pat))(`parse-pat mo match ${valueToString(pat)}`))(pany(cst_loc(pat)));
throw new Error('match fail 1727:' + JSON.stringify($target))
})(pat)

let parse_pat_tuple = (items) => (il) => (l) => (($target) => {
if ($target.type === "nil") {
return $lt_(pcon(",")(-1)(nil)(il))
} ;
if ($target.type === "cons") {
let one = $target[0];
if ($target[1].type === "nil") {
return parse_pat(one)
} 
} ;
if ($target.type === "cons") {
let one = $target[0];
let rest = $target[1];
return $gt$gt$eq(parse_pat(one))((one) => $gt$gt$eq(parse_pat_tuple(rest)(il)(l))((rest) => $lt_(pcon(",")(-1)(cons(one)(cons(rest)(nil)))(l))))
} ;
throw new Error('match fail 7715:' + JSON.stringify($target))
})(items)
let j$slapp = (v0) => (v1) => (v2) => ({type: "j/app", 0: v0, 1: v1, 2: v2})
let j$slcom = (v0) => (v1) => ({type: "j/com", 0: v0, 1: v1})
let j$slbin = (v0) => (v1) => (v2) => (v3) => ({type: "j/bin", 0: v0, 1: v1, 2: v2, 3: v3})
let j$slun = (v0) => (v1) => (v2) => ({type: "j/un", 0: v0, 1: v1, 2: v2})
let j$sllambda = (v0) => (v1) => (v2) => ({type: "j/lambda", 0: v0, 1: v1, 2: v2})
let j$slprim = (v0) => (v1) => ({type: "j/prim", 0: v0, 1: v1})
let j$slstr = (v0) => (v1) => (v2) => ({type: "j/str", 0: v0, 1: v1, 2: v2})
let j$slraw = (v0) => (v1) => ({type: "j/raw", 0: v0, 1: v1})
let j$slvar = (v0) => (v1) => ({type: "j/var", 0: v0, 1: v1})
let j$slattr = (v0) => (v1) => (v2) => ({type: "j/attr", 0: v0, 1: v1, 2: v2})
let j$slindex = (v0) => (v1) => (v2) => ({type: "j/index", 0: v0, 1: v1, 2: v2})
let j$sltern = (v0) => (v1) => (v2) => (v3) => ({type: "j/tern", 0: v0, 1: v1, 2: v2, 3: v3})
let j$slassign = (v0) => (v1) => (v2) => (v3) => ({type: "j/assign", 0: v0, 1: v1, 2: v2, 3: v3})
let j$slarray = (v0) => (v1) => ({type: "j/array", 0: v0, 1: v1})
let j$slobj = (v0) => (v1) => ({type: "j/obj", 0: v0, 1: v1})

let j$slblock = (v0) => ({type: "j/block", 0: v0})

let j$slsexpr = (v0) => (v1) => ({type: "j/sexpr", 0: v0, 1: v1})
let j$slsblock = (v0) => (v1) => ({type: "j/sblock", 0: v0, 1: v1})
let j$slif = (v0) => (v1) => (v2) => (v3) => ({type: "j/if", 0: v0, 1: v1, 2: v2, 3: v3})
let j$slfor = (v0) => (v1) => (v2) => (v3) => (v4) => (v5) => ({type: "j/for", 0: v0, 1: v1, 2: v2, 3: v3, 4: v4, 5: v5})
let j$slbreak = (v0) => ({type: "j/break", 0: v0})
let j$slcontinue = (v0) => ({type: "j/continue", 0: v0})
let j$slreturn = (v0) => (v1) => ({type: "j/return", 0: v0, 1: v1})
let j$sllet = (v0) => (v1) => (v2) => ({type: "j/let", 0: v0, 1: v1, 2: v2})
let j$slthrow = (v0) => (v1) => ({type: "j/throw", 0: v0, 1: v1})
let pairs = (list) => (($target) => {
if ($target.type === "nil") {
return $lt_(nil)
} ;
if ($target.type === "cons") {
let one = $target[0];
if ($target[1].type === "cons") {
let two = $target[1][0];
let rest = $target[1][1];
return $gt$gt$eq(pairs(rest))((rest) => $lt_(cons($co(one)(two))(rest)))
} 
} ;
if ($target.type === "cons") {
let one = $target[0];
if ($target[1].type === "nil") {
return $lt_err($co(cst_loc(one))("extra item in pairs"))(nil)
} 
} ;
throw new Error('match fail 1690:' + JSON.stringify($target))
})(list)
let expr_loc = (expr) => (($target) => {
if ($target.type === "estr") {
let l = $target[2];
return l
} ;
if ($target.type === "eprim") {
let l = $target[1];
return l
} ;
if ($target.type === "eeffect") {
let l = $target[2];
return l
} ;
if ($target.type === "eprovide") {
let l = $target[2];
return l
} ;
if ($target.type === "evar") {
let l = $target[1];
return l
} ;
if ($target.type === "equot") {
let l = $target[1];
return l
} ;
if ($target.type === "elambda") {
let l = $target[2];
return l
} ;
if ($target.type === "elet") {
let l = $target[2];
return l
} ;
if ($target.type === "eapp") {
let l = $target[2];
return l
} ;
if ($target.type === "ematch") {
let l = $target[2];
return l
} ;
if ($target.type === "erecord") {
let l = $target[2];
return l
} ;
if ($target.type === "eenum") {
let l = $target[3];
return l
} ;
if ($target.type === "eaccess") {
let l = $target[2];
return l
} ;
throw new Error('match fail 4708:' + JSON.stringify($target))
})(expr)
let parse_and_compile = (v0) => (v1) => (v2) => (v3) => (v4) => (v5) => (v6) => (v7) => (v8) => (v9) => (v10) => ({type: "parse-and-compile", 0: v0, 1: v1, 2: v2, 3: v3, 4: v4, 5: v5, 6: v6, 7: v7, 8: v8, 9: v9, 10: v10})
let externals = (bound) => (expr) => (($target) => {
if ($target.type === "evar") {
let name = $target[0];
let l = $target[1];
{
let $target = set$slhas(bound)(name);
if ($target === true) {
return empty
} ;
return one($co(name)($co(value)(l)));
throw new Error('match fail 6852:' + JSON.stringify($target))
}
} ;
if ($target.type === "eprim") {
let prim = $target[0];
let l = $target[1];
return empty
} ;
if ($target.type === "eeffect") {
if ($target[1].type === "some") {
let args = $target[1][0];
return foldl(empty)(map(args)(externals(bound)))(bag$sland)
} 
} ;
if ($target.type === "eeffect") {
return empty
} ;
if ($target.type === "eprovide") {
let target = $target[0];
let cases = $target[1];
return foldl(externals(bound)(target))(map(cases)(({"1": {"1": {"1": body, "0": k}, "0": nl}, "0": name}) => {
let pats = (($target) => {
if ($target.type === "ebang") {
let pats = $target[0];
return pats
} ;
if ($target.type === "eeffectful") {
let pats = $target[2];
return pats
} ;
return nil;
throw new Error('match fail 23570:' + JSON.stringify($target))
})(k);
return foldl(externals(foldl(bound)(map(pats)(pat_names))(set$slmerge))(body))(map(pats)(pat_externals))(bag$sland)
}))(bag$sland)
} ;
if ($target.type === "eenum") {
let arg = $target[2];
return map_or(externals(bound))(empty)(arg)
} ;
if ($target.type === "erecord") {
let spread = $target[0];
let fields = $target[1];
return foldl(map_or(dot(externals(bound))(fst))(empty)(spread))(map(fields)(dot(externals(bound))(snd)))(bag$sland)
} ;
if ($target.type === "eaccess") {
let target = $target[0];
{
let $target = target;
if ($target.type === "none") {
return empty
} ;
if ($target.type === "some") {
if ($target[0].type === ",") {
let v = $target[0][0];
let l = $target[0][1];
{
let $target = set$slhas(bound)(v);
if ($target === true) {
return empty
} ;
return one($co(v)($co(value)(l)));
throw new Error('match fail 20969:' + JSON.stringify($target))
}
} 
} ;
throw new Error('match fail 20960:' + JSON.stringify($target))
}
} ;
if ($target.type === "estr") {
let first = $target[0];
let templates = $target[1];
let l = $target[2];
return many(map(templates)((arg) => (($target) => {
if ($target.type === ",") {
let expr = $target[0];
if ($target[1].type === ",") {
return externals(bound)(expr)
} 
} ;
throw new Error('match fail 7411:' + JSON.stringify($target))
})(arg)))
} ;
if ($target.type === "equot") {
let expr = $target[0];
let l = $target[1];
return empty
} ;
if ($target.type === "elambda") {
let pats = $target[0];
let body = $target[1];
let l = $target[2];
return bag$sland(foldl(empty)(map(pats)(pat_externals))(bag$sland))(externals(foldl(bound)(map(pats)(pat_names))(set$slmerge))(body))
} ;
if ($target.type === "elet") {
let bindings = $target[0];
let body = $target[1];
let l = $target[2];
return bag$sland(foldl(empty)(map(bindings)((arg) => {
let {"1": init, "0": pat} = arg;
return bag$sland(pat_externals(pat))(externals(bound)(init))
}))(bag$sland))(externals(foldl(bound)(map(bindings)((arg) => {
let {"0": pat} = arg;
return pat_names(pat)
}))(set$slmerge))(body))
} ;
if ($target.type === "eapp") {
let target = $target[0];
let args = $target[1];
let l = $target[2];
return bag$sland(externals(bound)(target))(foldl(empty)(map(args)(externals(bound)))(bag$sland))
} ;
if ($target.type === "ematch") {
let expr = $target[0];
let cases = $target[1];
let l = $target[2];
return bag$sland(externals(bound)(expr))(foldl(empty)(cases)((bag) => (arg) => (($target) => {
if ($target.type === ",") {
let pat = $target[0];
let body = $target[1];
return bag$sland(bag$sland(bag)(pat_externals(pat)))(externals(set$slmerge(bound)(pat_names(pat)))(body))
} ;
throw new Error('match fail 7421:' + JSON.stringify($target))
})(arg)))
} ;
throw new Error('match fail 6845:' + JSON.stringify($target))
})(expr)
let names = (top) => (($target) => {
if ($target.type === "tdef") {
let name = $target[0];
let l = $target[1];
return cons($co(name)($co(value)(l)))(nil)
} ;
if ($target.type === "texpr") {
return nil
} ;
if ($target.type === "ttypealias") {
let name = $target[0];
let l = $target[1];
return cons($co(name)($co(type)(l)))(nil)
} ;
if ($target.type === "tdeftype") {
let name = $target[0];
let l = $target[1];
let constructors = $target[3];
return cons($co(name)($co(type)(l)))(map(constructors)((arg) => (($target) => {
if ($target.type === ",") {
let name = $target[0];
if ($target[1].type === ",") {
let l = $target[1][0];
if ($target[1][1].type === ",") {
return $co(name)($co(value)(l))
} 
} 
} ;
throw new Error('match fail 7429:' + JSON.stringify($target))
})(arg)))
} ;
throw new Error('match fail 7156:' + JSON.stringify($target))
})(top)
let externals_top = (top) => bag$slto_list((($target) => {
if ($target.type === "tdeftype") {
let string = $target[0];
let free = $target[2];
let constructors = $target[3];
{
let frees = set$slfrom_list(map(free)(fst));
return many(map(constructors)((constructor) => (($target) => {
if ($target.type === ",") {
let name = $target[0];
if ($target[1].type === ",") {
let l = $target[1][0];
if ($target[1][1].type === ",") {
let args = $target[1][1][0];
{
let $target = args;
if ($target.type === "nil") {
return empty
} ;
return many(map(args)(externals_type(frees)));
throw new Error('match fail 7265:' + JSON.stringify($target))
}
} 
} 
} ;
throw new Error('match fail 7440:' + JSON.stringify($target))
})(constructor)))
}
} ;
if ($target.type === "ttypealias") {
let name = $target[0];
let args = $target[2];
let body = $target[3];
{
let frees = set$slfrom_list(map(args)(fst));
return externals_type(frees)(body)
}
} ;
if ($target.type === "tdef") {
let name = $target[0];
let body = $target[2];
return externals(set$sladd(set$slnil)(name))(body)
} ;
if ($target.type === "texpr") {
let expr = $target[0];
return externals(set$slnil)(expr)
} ;
throw new Error('match fail 7231:' + JSON.stringify($target))
})(top))
let fold_expr = (init) => (expr) => (f) => {
let v = f(init)(expr);
{
let $target = expr;
if ($target.type === "estr") {
let tpl = $target[1];
return foldl(v)(tpl)((init) => (tpl) => fold_expr(init)($co$co0(tpl))(f))
} ;
if ($target.type === "elambda") {
let body = $target[1];
return fold_expr(v)(body)(f)
} ;
if ($target.type === "elet") {
let bindings = $target[0];
let body = $target[1];
return fold_expr(foldl(v)(bindings)((init) => (binding) => fold_expr(init)(snd(binding))(f)))(body)(f)
} ;
if ($target.type === "eapp") {
let target = $target[0];
let args = $target[1];
return foldl(fold_expr(v)(target)(f))(args)((init) => (expr) => fold_expr(init)(expr)(f))
} ;
if ($target.type === "ematch") {
let expr = $target[0];
let cases = $target[1];
return foldl(fold_expr(v)(expr)(f))(cases)((init) => ($case) => fold_expr(init)(snd($case))(f))
} ;
return v;
throw new Error('match fail 9377:' + JSON.stringify($target))
}
}
let expr_type = (expr) => (($target) => {
if ($target.type === "eprim") {
let prim = $target[0];
let int = $target[1];
return "prim"
} ;
if ($target.type === "estr") {
let string = $target[0];
let int = $target[2];
return "str"
} ;
if ($target.type === "evar") {
let string = $target[0];
let int = $target[1];
return "var"
} ;
if ($target.type === "equot") {
let quot = $target[0];
let int = $target[1];
return "quot"
} ;
if ($target.type === "elambda") {
let expr = $target[1];
let int = $target[2];
return "lambda"
} ;
if ($target.type === "eeffect") {
return "effect"
} ;
if ($target.type === "eprovide") {
return "provide"
} ;
if ($target.type === "eapp") {
let expr = $target[0];
let int = $target[2];
return "app"
} ;
if ($target.type === "elet") {
let expr = $target[1];
let int = $target[2];
return "let"
} ;
if ($target.type === "erecord") {
return "record"
} ;
if ($target.type === "eenum") {
return "enum"
} ;
if ($target.type === "eaccess") {
return "access"
} ;
if ($target.type === "ematch") {
let expr = $target[0];
let int = $target[2];
return "match"
} ;
throw new Error('match fail 9654:' + JSON.stringify($target))
})(expr)
let expr_size = (expr) => fold_expr(0)(expr)((v) => (_9712) => 1 + v)
let top_size = (top) => 1 + (($target) => {
if ($target.type === "tdef") {
let expr = $target[2];
return expr_size(expr)
} ;
if ($target.type === "texpr") {
let expr = $target[0];
return expr_size(expr)
} ;
if ($target.type === "ttypealias") {
let type = $target[3];
return type_size(type)
} ;
if ($target.type === "tdeftype") {
let constructors = $target[3];
return foldl(0)(constructors)((v) => ($const) => foldl(v)(map($co$co$co2($const))(type_size))($pl))
} ;
throw new Error('match fail 9730:' + JSON.stringify($target))
})(top)
let j$slneeds_parens = (expr) => (($target) => {
if ($target.type === "j/bin") {
return true
} ;
if ($target.type === "j/un") {
return true
} ;
if ($target.type === "j/lambda") {
return true
} ;
if ($target.type === "j/prim") {
return true
} ;
if ($target.type === "j/tern") {
return true
} ;
if ($target.type === "j/assign") {
return true
} ;
return false;
throw new Error('match fail 10469:' + JSON.stringify($target))
})(expr)
let is_bop = (op) => contains(bops)(op)
let tx = (v0) => (v1) => (v2) => (v3) => (v4) => (v5) => (v6) => (v7) => ({type: "tx", 0: v0, 1: v1, 2: v2, 3: v3, 4: v4, 5: v5, 6: v6, 7: v7})
let map$slpat = (tx) => (pat) => {
let loop = map$slpat(tx);
{
let {"3": post_p, "2": pre_p} = tx;
{
let $target = pre_p(pat);
if ($target.type === "none") {
return pat
} ;
if ($target.type === "some") {
let pat = $target[0];
return post_p((($target) => {
if ($target.type === "j/pvar") {
return pat
} ;
if ($target.type === "j/parray") {
let items = $target[0];
let spread = $target[1];
let l = $target[2];
return j$slparray(map(items)(loop))(map_opt(spread)(loop))(l)
} ;
if ($target.type === "j/pobj") {
let items = $target[0];
let spread = $target[1];
let l = $target[2];
return j$slpobj(map(items)(({"1": pat, "0": name}) => $co(name)(loop(pat))))(map_opt(spread)(loop))(l)
} ;
throw new Error('match fail 13549:' + JSON.stringify($target))
})(pat))
} ;
throw new Error('match fail 13536:' + JSON.stringify($target))
}
}
}
let simplify_one = (expr) => (($target) => {
if ($target.type === "j/app") {
if ($target[0].type === "j/lambda") {
if ($target[0][0].type === "nil") {
if ($target[0][1].type === "right") {
let inner = $target[0][1][0];
if ($target[1].type === "nil") {
return some(inner)
} 
} 
} 
} 
} ;
if ($target.type === "j/lambda") {
let args = $target[0];
if ($target[1].type === "left") {
if ($target[1][0].type === "j/block") {
if ($target[1][0][0].type === "cons") {
if ($target[1][0][0][0].type === "j/return") {
let value = $target[1][0][0][0][0];
if ($target[1][0][0][1].type === "nil") {
let l = $target[2];
return some(j$sllambda(args)(right(value))(l))
} 
} 
} 
} 
} 
} ;
if ($target.type === "j/lambda") {
let args = $target[0];
if ($target[1].type === "right") {
if ($target[1][0].type === "j/app") {
if ($target[1][0][0].type === "j/lambda") {
if ($target[1][0][0][0].type === "nil") {
let body = $target[1][0][0][1];
let ll = $target[1][0][0][2];
if ($target[1][0][1].type === "nil") {
let al = $target[1][0][2];
let l = $target[2];
return some(j$sllambda(args)(body)(l))
} 
} 
} 
} 
} 
} ;
return none;
throw new Error('match fail 13674:' + JSON.stringify($target))
})(expr)
let simplify_stmt = (stmt) => (($target) => {
if ($target.type === "j/sblock") {
if ($target[0].type === "j/block") {
if ($target[0][0].type === "cons") {
let one = $target[0][0][0];
if ($target[0][0][1].type === "nil") {
let l = $target[1];
{
let $target = one;
if ($target.type === "j/let") {
return none
} ;
return some(one);
throw new Error('match fail 14226:' + JSON.stringify($target))
}
} 
} 
} 
} ;
return none;
throw new Error('match fail 13838:' + JSON.stringify($target))
})(stmt)
let simplify_block = ({"0": items}) => none
let make_lets = (params) => (args) => (l) => (($target) => {
if ($target.type === ",") {
if ($target[0].type === "nil") {
if ($target[1].type === "nil") {
return nil
} 
} 
} ;
if ($target.type === ",") {
if ($target[0].type === "cons") {
let one = $target[0][0];
let params = $target[0][1];
if ($target[1].type === "cons") {
let two = $target[1][0];
let args = $target[1][1];
return cons(j$sllet(one)(j$slcom("make-lets")(two))(l))(make_lets(params)(args)(l))
} 
} 
} ;
return fatal("invalid lets");
throw new Error('match fail 14144:' + JSON.stringify($target))
})($co(params)(args))
let fx = (v0) => (v1) => (v2) => (v3) => ({type: "fx", 0: v0, 1: v1, 2: v2, 3: v3})
let fold$slpat = (fx) => (init) => (pat) => {
let {"1": p} = fx;
return p((($target) => {
if ($target.type === "j/pvar") {
return init
} ;
if ($target.type === "j/pobj") {
let items = $target[0];
let spread = $target[1];
return foldl(fold$sloption(fold$slpat(fx))(init)(spread))(items)((init) => ({"1": pat}) => fold$slpat(fx)(init)(pat))
} ;
if ($target.type === "j/parray") {
let items = $target[0];
let spread = $target[1];
return foldl(fold$sloption(fold$slpat(fx))(init)(spread))(items)(fold$slpat(fx))
} ;
throw new Error('match fail 15016:' + JSON.stringify($target))
})(pat))(pat)
}
let pat_names$slj2 = fx(nop)((names) => (pat) => (($target) => {
if ($target.type === "j/pvar") {
let name = $target[0];
return set$sladd(names)(name)
} ;
return names;
throw new Error('match fail 15358:' + JSON.stringify($target))
})(pat))(nop)(nop)
let map_expr = (f) => (expr) => (($target) => {
if ($target.type === "estr") {
let first = $target[0];
let tpl = $target[1];
let l = $target[2];
return estr(first)(map(tpl)(map$co$co0(map_expr(f))))(l)
} ;
if ($target.type === "elambda") {
let pats = $target[0];
let body = $target[1];
let l = $target[2];
return elambda(pats)(map_expr(f)(body))(l)
} ;
if ($target.type === "elet") {
let bindings = $target[0];
let body = $target[1];
let l = $target[2];
return elet(map(bindings)(map$co1(map_expr(f))))(map_expr(f)(body))(l)
} ;
if ($target.type === "eapp") {
let target = $target[0];
let args = $target[1];
let l = $target[2];
return eapp(map_expr(f)(target))(map(args)(map_expr(f)))(l)
} ;
if ($target.type === "ematch") {
let expr = $target[0];
let cases = $target[1];
let l = $target[2];
return ematch(map_expr(f)(expr))(map(cases)(map$co1(map_expr(f))))(l)
} ;
{
let otherwise = $target;
return otherwise
};
throw new Error('match fail 15819:' + JSON.stringify($target))
})(f(expr))
let trace_pat = (pat) => (trace) => {
let names = bag$slto_list(pat_names_loc(pat));
return foldr(nil)(names)((stmts) => ({"1": loc, "0": name}) => (($target) => {
if ($target.type === "none") {
return stmts
} ;
if ($target.type === "some") {
let info = $target[0];
return cons(j$slsexpr(j$slapp(j$slvar("\$trace")(-1))(cons(j$slprim(j$slint(loc)(-1))(-1))(cons(j$slraw(jsonify(info))(-1))(cons(j$slvar(sanitize(name))(-1))(nil))))(-1))(-1))(stmts)
} ;
throw new Error('match fail 16183:' + JSON.stringify($target))
})(map$slget(trace)(loc)))
}
let maybe_trace = (loc) => (trace) => (expr) => (($target) => {
if ($target.type === "none") {
return expr
} ;
if ($target.type === "some") {
let v = $target[0];
return j$slapp(j$slvar("\$trace")(-1))(cons(j$slprim(j$slint(loc)(-1))(-1))(cons(j$slraw(jsonify(v))(-1))(cons(expr)(nil))))(-1)
} ;
throw new Error('match fail 16279:' + JSON.stringify($target))
})(map$slget(trace)(loc))
let quot$sljsonify = (quot) => (($target) => {
if ($target.type === "quot/expr") {
let expr = $target[0];
return jsonify(expr)
} ;
if ($target.type === "quot/type") {
let type = $target[0];
return jsonify(type)
} ;
if ($target.type === "quot/top") {
let top = $target[0];
return jsonify(top)
} ;
if ($target.type === "quot/quot") {
let cst = $target[0];
return jsonify(cst)
} ;
if ($target.type === "quot/pat") {
let pat = $target[0];
return jsonify(pat)
} ;
throw new Error('match fail 16401:' + JSON.stringify($target))
})(quot)
let run$slnil_$gt = (st) => run_$gt(st)(state$slnil)
let unexpected = (msg) => (cst) => $lt_err($co(cst_loc(cst))(msg))($unit)
let eunit = (l) => evar("()")(l)
let sunit = (k) => texpr(eunit(k))(k)
let locals_at = (locs) => (tl) => (expr) => (($target) => {
if ($target.type === "eprim") {
return none
} ;
if ($target.type === "estr") {
let tpls = $target[1];
return loop(tpls)((tpls) => (recur) => (($target) => {
if ($target.type === "nil") {
return none
} ;
if ($target.type === "cons") {
if ($target[0].type === ",") {
let expr = $target[0][0];
if ($target[0][1].type === ",") {
let rest = $target[1];
{
let $target = locals_at(locs)(tl)(expr);
if ($target.type === "some") {
let v = $target[0];
return some(v)
} ;
return recur(rest);
throw new Error('match fail 18433:' + JSON.stringify($target))
}
} 
} 
} ;
throw new Error('match fail 18417:' + JSON.stringify($target))
})(tpls))
} ;
if ($target.type === "evar") {
let l = $target[1];
{
let $target = $eq(l)(tl);
if ($target === true) {
return some(locs)
} ;
return none;
throw new Error('match fail 18163:' + JSON.stringify($target))
}
} ;
if ($target.type === "eeffect") {
let args = $target[1];
return none
} ;
if ($target.type === "eprovide") {
return none
} ;
if ($target.type === "eaccess") {
let name = $target[0];
return none
} ;
if ($target.type === "erecord") {
return none
} ;
if ($target.type === "eenum") {
return none
} ;
if ($target.type === "equot") {
return none
} ;
if ($target.type === "elambda") {
let pats = $target[0];
let expr = $target[1];
return locals_at(bag$sland(many(map(pats)(pat_names_loc)))(locs))(tl)(expr)
} ;
if ($target.type === "eapp") {
let expr = $target[0];
let args = $target[1];
{
let $target = locals_at(locs)(tl)(expr);
if ($target.type === "some") {
let l = $target[0];
return some(l)
} ;
return loop(args)((args) => (recur) => (($target) => {
if ($target.type === "nil") {
return none
} ;
if ($target.type === "cons") {
let arg = $target[0];
let args = $target[1];
{
let $target = locals_at(locs)(tl)(arg);
if ($target.type === "some") {
let v = $target[0];
return some(v)
} ;
return recur(args);
throw new Error('match fail 18229:' + JSON.stringify($target))
}
} ;
throw new Error('match fail 18217:' + JSON.stringify($target))
})(args));
throw new Error('match fail 18166:' + JSON.stringify($target))
}
} ;
if ($target.type === "elet") {
let bindings = $target[0];
let expr = $target[1];
return loop($co(bindings)(locs))(({"1": locs, "0": bindings}) => (recur) => (($target) => {
if ($target.type === "nil") {
return locals_at(locs)(tl)(expr)
} ;
if ($target.type === "cons") {
if ($target[0].type === ",") {
let pat = $target[0][0];
let init = $target[0][1];
let rest = $target[1];
{
let locs$$0 = locs;
{
let locs = bag$sland(locs$$0)(pat_names_loc(pat));
{
let $target = locals_at(locs)(tl)(init);
if ($target.type === "some") {
let v = $target[0];
return some(v)
} ;
return recur($co(rest)(locs));
throw new Error('match fail 18386:' + JSON.stringify($target))
}
}
}
} 
} ;
throw new Error('match fail 18349:' + JSON.stringify($target))
})(bindings))
} ;
if ($target.type === "ematch") {
let expr = $target[0];
let cases = $target[1];
{
let $target = locals_at(locs)(tl)(expr);
if ($target.type === "some") {
let l = $target[0];
return some(l)
} ;
return loop(cases)((cases) => (recur) => (($target) => {
if ($target.type === "nil") {
return none
} ;
if ($target.type === "cons") {
if ($target[0].type === ",") {
let pat = $target[0][0];
let expr = $target[0][1];
let cases = $target[1];
{
let $target = locals_at(bag$sland(pat_names_loc(pat))(locs))(tl)(expr);
if ($target.type === "some") {
let v = $target[0];
return some(v)
} ;
return recur(cases);
throw new Error('match fail 18314:' + JSON.stringify($target))
}
} 
} ;
throw new Error('match fail 18299:' + JSON.stringify($target))
})(cases));
throw new Error('match fail 18168:' + JSON.stringify($target))
}
} ;
throw new Error('match fail 18095:' + JSON.stringify($target))
})(expr)
let expr$slidents = (expr) => (($target) => {
if ($target.type === "estr") {
let exprs = $target[1];
return many(map(exprs)(dot(expr$slidents)($co$co0)))
} ;
if ($target.type === "evar") {
let name = $target[0];
let l = $target[1];
return one($co(name)(l))
} ;
if ($target.type === "elambda") {
let pats = $target[0];
let expr = $target[1];
let l = $target[2];
return many(cons(expr$slidents(expr))(map(pats)(pat$slidents)))
} ;
if ($target.type === "eapp") {
let target = $target[0];
let args = $target[1];
return many(cons(expr$slidents(target))(map(args)(expr$slidents)))
} ;
if ($target.type === "eeffect") {
if ($target[1].type === "some") {
let args = $target[1][0];
return foldl(empty)(map(args)(expr$slidents))(bag$sland)
} 
} ;
if ($target.type === "elet") {
let bindings = $target[0];
let body = $target[1];
return many(cons(expr$slidents(body))(map(bindings)(({"1": exp, "0": pat}) => bag$sland(pat$slidents(pat))(expr$slidents(exp)))))
} ;
if ($target.type === "ematch") {
let target = $target[0];
let cases = $target[1];
return bag$sland(expr$slidents(target))(many(map(cases)(({"1": exp, "0": pat}) => bag$sland(pat$slidents(pat))(expr$slidents(exp)))))
} ;
return empty;
throw new Error('match fail 18479:' + JSON.stringify($target))
})(expr)
let top$slidents = (top) => (($target) => {
if ($target.type === "tdef") {
let name = $target[0];
let l = $target[1];
let body = $target[2];
return bag$sland(one($co(name)(l)))(expr$slidents(body))
} ;
if ($target.type === "texpr") {
let exp = $target[0];
return expr$slidents(exp)
} ;
if ($target.type === "ttypealias") {
let name = $target[0];
let l = $target[1];
let args = $target[2];
let body = $target[3];
return bag$sland(type$slidents(body))(many(cons(one($co(name)(l)))(map(args)(one))))
} ;
if ($target.type === "tdeftype") {
let name = $target[0];
let l = $target[1];
let args = $target[2];
let constrs = $target[3];
return bag$sland(many(map(constrs)(({"1": {"1": {"0": args}, "0": l}, "0": name}) => bag$sland(one($co(name)(l)))(many(map(args)(type$slidents))))))(bag$sland(one($co(name)(l)))(many(map(args)(one))))
} ;
throw new Error('match fail 18646:' + JSON.stringify($target))
})(top)
let locals_at_top = (locs) => (tl) => (top) => (($target) => {
if ($target.type === "texpr") {
let exp = $target[0];
return locals_at(locs)(tl)(exp)
} ;
if ($target.type === "tdef") {
let exp = $target[2];
return locals_at(locs)(tl)(exp)
} ;
return none;
throw new Error('match fail 18879:' + JSON.stringify($target))
})(top)
let pat$slnames = (pat) => (($target) => {
if ($target.type === "pany") {
return $co(nil)(empty)
} ;
if ($target.type === "pvar") {
let name = $target[0];
let l = $target[1];
return $co(cons($co(name)(l))(nil))(one(local(l)(decl)))
} ;
if ($target.type === "pprim") {
return $co(nil)(empty)
} ;
if ($target.type === "pstr") {
return $co(nil)(empty)
} ;
if ($target.type === "penum") {
let arg = $target[2];
let l = $target[3];
return map_or(pat$slnames)($co(nil)(empty))(arg)
} ;
if ($target.type === "precord") {
let fields = $target[0];
let spread = $target[1];
let l = $target[2];
return foldl(map_or(pat$slnames)($co(nil)(empty))(spread))(map(fields)(dot(pat$slnames)(snd)))(bound_and_names)
} ;
if ($target.type === "pcon") {
let name = $target[0];
let nl = $target[1];
let args = $target[2];
let l = $target[3];
return foldl($co(nil)(one(global(name)(value)(l)(usage($unit)))))(map(args)(pat$slnames))(bound_and_names)
} ;
throw new Error('match fail 19782:' + JSON.stringify($target))
})(pat)
let parse_id = (id) => (l) => (($target) => {
if ($target === true) {
return eeffect(id)(none)(l)
} ;
{
let $target = is_bang(id);
if ($target === true) {
return eeffect(id)(some(nil))(l)
} ;
{
let $target = is_arrow(id);
if ($target === true) {
return eeffect(id)(some(nil))(l)
} ;
{
let $target = string_to_int(id);
if ($target.type === "some") {
let int = $target[0];
return eprim(pint(int)(l))(l)
} ;
if ($target.type === "none") {
{
let $target = parse_tag(id);
if ($target.type === "some") {
let tag = $target[0];
return eenum(tag)(l)(none)(l)
} ;
return evar(id)(l);
throw new Error('match fail 21663:' + JSON.stringify($target))
}
} ;
throw new Error('match fail 970:' + JSON.stringify($target))
};
throw new Error('match fail 31604:' + JSON.stringify($target))
};
throw new Error('match fail 30125:' + JSON.stringify($target))
};
throw new Error('match fail 22729:' + JSON.stringify($target))
})(is_earmuffs(id))
let parse_provide_pat = (pat) => (($target) => {
if ($target.type === "cst/id") {
let id = $target[0];
let l = $target[1];
{
let $target = is_earmuffs(id);
if ($target === true) {
return $lt_($co(id)($co(l)($co(eearmuffs)(l))))
} ;
return $lt_err($co(l)("Wrap in () or must be *earmuffed*"))($co(id)($co(l)($co(eearmuffs)(l))));
throw new Error('match fail 23222:' + JSON.stringify($target))
}
} ;
if ($target.type === "cst/list") {
if ($target[0].type === "cons") {
if ($target[0][0].type === "cst/id") {
let k = $target[0][0][0];
let kl = $target[0][0][1];
if ($target[0][1].type === "cons") {
if ($target[0][1][0].type === "cst/id") {
let id = $target[0][1][0][0];
let il = $target[0][1][0][1];
let pats = $target[0][1][1];
let l = $target[1];
{
let $target = is_bang(k);
if ($target === true) {
return $gt$gt$eq(map_$gt(parse_pat)(cons(cst$slid(id)(il))(pats)))((pats) => $lt_($co(k)($co(kl)($co(ebang(pats))(l)))))
} ;
{
let $target = is_arrow(id);
if ($target === true) {
return $gt$gt$eq(map_$gt(parse_pat)(pats))((pats) => $lt_($co(id)($co(il)($co(eeffectful(k)(kl)(pats))(l)))))
} ;
return $lt_err($co(l)("Unidentified effect kind"))($co(k)($co(kl)($co(ebang(nil))(l))));
throw new Error('match fail 23114:' + JSON.stringify($target))
};
throw new Error('match fail 23091:' + JSON.stringify($target))
}
} 
} 
} 
} 
} ;
if ($target.type === "cst/list") {
if ($target[0].type === "cons") {
if ($target[0][0].type === "cst/id") {
let id = $target[0][0][0];
let il = $target[0][0][1];
let pats = $target[0][1];
let l = $target[1];
{
let $target = is_bang(id);
if ($target === true) {
return $gt$gt$eq(map_$gt(parse_pat)(pats))((pats) => $lt_($co(id)($co(il)($co(ebang(pats))(l)))))
} ;
return $lt_err($co(l)("Unidentified effect kind, expected *earmuffed*, <-arrowed, or !banged"))($co(id)($co(il)($co(ebang(nil))(l))));
throw new Error('match fail 23031:' + JSON.stringify($target))
}
} 
} 
} ;
return fatal("cant do it I think");
throw new Error('match fail 23023:' + JSON.stringify($target))
})(pat)
let finish = (x) => (($target) => {
if ($target.type === "left") {
let x = $target[0];
return x
} ;
if ($target.type === "right") {
let x = $target[0];
return j$slapp(j$sllambda(nil)(left(j$slblock(cons(j$sllet(j$slpvar("\$final")(-1))(j$slstr("-uninitialized-")(nil)(-1))(-1))(cons(j$slsexpr(x(j$sllambda(cons(j$slpvar("x")(-1))(nil))(right(j$slassign("\$final")("=")(j$slvar("x")(-1))(-1)))(-1)))(-1))(cons(j$slreturn(j$slvar("\$final")(-1))(-1))(nil))))))(-1))(nil)(-1)
} ;
throw new Error('match fail 24177:' + JSON.stringify($target))
})(x)
let con_fn = (name) => (l) => (f) => j$sllambda(cons(j$slpvar(name)(l))(nil))(right(f(j$slvar(name)(l))))(l)
let done_fn = con_fn("done")
let left_right = (either) => (name) => (l) => (usage) => (($target) => {
if ($target.type === "left") {
let v = $target[0];
return usage(v)
} ;
if ($target.type === "right") {
let v = $target[0];
return j$slapp(v)(cons(con_fn(name)(l)(usage))(nil))(l)
} ;
throw new Error('match fail 24334:' + JSON.stringify($target))
})(either)
let cps$gt$gt$eq = ({"0": f}) => (next) => StateT((state) => {
let {"1": value, "0": {"1": idx, "0": has}} = f(state);
{
let $target = value;
if ($target.type === "left") {
let v = $target[0];
return state_f(next(v))($co(has)(idx))
} ;
if ($target.type === "right") {
let v = $target[0];
{
let name = `v${int_to_string(idx)}`;
{
let {"1": iner, "0": nstate} = state_f(next(j$slvar(name)(-1)))($co(true)(idx + 1));
return $co(nstate)(j$slapp(v)(cons(j$sllambda(cons(j$slpvar(name)(-1))(nil))(right(iner))(-1))(nil))(-1))
}
}
} ;
throw new Error('match fail 24753:' + JSON.stringify($target))
}
})
let cps$slj2 = (trace) => (expr) => {
let $gt$gt$eq = cps$gt$gt$eq;
{
let $target = expr;
if ($target.type === "evar") {
let n = $target[0];
let l = $target[1];
return left(j$slvar(sanitize(n))(l))
} ;
if ($target.type === "eprim") {
if ($target[0].type === "pint") {
let n = $target[0][0];
let l = $target[0][1];
return left(j$slprim(j$slint(n)(l))(l))
} 
} ;
if ($target.type === "eapp") {
let target = $target[0];
if ($target[1].type === "nil") {
let l = $target[2];
return cps$slj2(trace)(target)
} 
} ;
if ($target.type === "eapp") {
let target = $target[0];
if ($target[1].type === "cons") {
let arg = $target[1][0];
if ($target[1][1].type === "nil") {
let l = $target[2];
return go($gt$gt$eq($lt_(cps$slj2(trace)(target)))((target) => $gt$gt$eq($lt_(cps$slj2(trace)(arg)))((arg) => $lt_right(done_fn(l)((done) => j$slapp(target)(cons(arg)(cons(j$slvar("\$lbeffects\$rb")(l))(cons(done)(nil))))(l))))))
} 
} 
} ;
if ($target.type === "eapp") {
let target = $target[0];
if ($target[1].type === "cons") {
let arg = $target[1][0];
let rest = $target[1][1];
let l = $target[2];
return cps$slj2(trace)(eapp(eapp(target)(cons(arg)(nil))(l))(rest)(l))
} 
} ;
if ($target.type === "elambda") {
if ($target[0].type === "cons") {
let arg = $target[0][0];
if ($target[0][1].type === "nil") {
let body = $target[1];
let l = $target[2];
return left(j$sllambda(cons(opt_or(pat_$gtj$slpat(arg))(j$slpvar("_")(l)))(cons(j$slpvar("\$lbeffects\$rb")(l))(cons(j$slpvar("\$done")(l))(nil))))(right((($target) => {
if ($target.type === "left") {
let body = $target[0];
return j$slapp(j$slvar("\$done")(l))(cons(body)(nil))(l)
} ;
if ($target.type === "right") {
let body = $target[0];
return j$slapp(body)(cons(j$slvar("\$done")(l))(nil))(l)
} ;
throw new Error('match fail 25298:' + JSON.stringify($target))
})(cps$slj2(trace)(body))))(l))
} 
} 
} ;
if ($target.type === "elambda") {
if ($target[0].type === "cons") {
let arg = $target[0][0];
let rest = $target[0][1];
let body = $target[1];
let l = $target[2];
return cps$slj2(trace)(elambda(cons(arg)(nil))(elambda(rest)(body)(l))(l))
} 
} ;
return fatal("no");
throw new Error('match fail 24912:' + JSON.stringify($target))
}
}
let go2 = (l) => ({"0": f}) => {
let {"1": value, "0": {"1": {"0": flag}, "0": wraps}} = f($co(nil)($co(false)(0)));
{
let $target = or($ex$eq(wraps)(nil))(flag);
if ($target === true) {
return right((done) => foldr((($target) => {
if ($target.type === "left") {
let value = $target[0];
return j$slapp(done)(cons(value)(cons(j$slvar(efvbl)(l))(nil)))(l)
} ;
if ($target.type === "right") {
let value = $target[0];
return value(done)
} ;
throw new Error('match fail 27495:' + JSON.stringify($target))
})(value))(wraps)((inner) => ({"1": vbl, "0": thunk}) => thunk(j$sllambda(cons(j$slpvar(vbl)(l))(cons(j$slpvar(efvbl)(l))(nil)))(right(inner))(l))))
} ;
return value;
throw new Error('match fail 25631:' + JSON.stringify($target))
}
}
let $lt_lrt = (nidx) => (t) => (l) => (v) => (($target) => {
if ($target.type === "left") {
let v = $target[0];
return $lt_(t(v))
} ;
if ($target.type === "right") {
let v = $target[0];
return $gt$gt$eq($lt_state)(({"1": {"1": idx, "0": flag}, "0": wraps}) => $gt$gt$eq($lt_(`tmp\$${int_to_string(nidx)}\$${int_to_string(l)}v${int_to_string(idx)}`))((name) => $gt$gt$eq(state_$gt($co(cons($co(v)(name))(wraps))($co(flag)(1 + idx))))((_25709) => $lt_(t(j$slvar(name)(-1))))))
} ;
throw new Error('match fail 25697:' + JSON.stringify($target))
})(v)
let $lt_lr = (idx) => (l) => (v) => $lt_lrt(idx)((x) => x)(l)(v)
let pat_as_arg = (pat) => (($target) => {
if ($target.type === "none") {
return "_"
} ;
if ($target.type === "some") {
let arg = $target[0];
return arg
} ;
throw new Error('match fail 28656:' + JSON.stringify($target))
})(pat_as_arg_inner(pat))
let compile_prim$slj = (prim) => (l) => (($target) => {
if ($target.type === "pint") {
let int = $target[0];
let pl = $target[1];
return j$slprim(j$slint(int)(pl))(l)
} ;
if ($target.type === "pbool") {
let bool = $target[0];
let pl = $target[1];
return j$slprim(j$slbool(bool)(pl))(l)
} ;
throw new Error('match fail 11563:' + JSON.stringify($target))
})(prim)
let $lt_lrn = (n) => (v) => (($target) => {
if ($target.type === "left") {
let v = $target[0];
return $lt_(v)
} ;
if ($target.type === "right") {
let v = $target[0];
return $gt$gt$eq($lt_state)(({"1": {"1": idx, "0": flag}, "0": wraps}) => $gt$gt$eq($lt_(`${n}_${int_to_string(idx)}`))((name) => $gt$gt$eq(state_$gt($co(cons($co(v)(name))(wraps))($co(flag)(1 + idx))))((_30793) => $lt_(j$slvar(name)(-1)))))
} ;
throw new Error('match fail 30779:' + JSON.stringify($target))
})(v)
let resolve_effect = (l) => (name) => j$slapp(j$slvar("\$get_effect")(l))(cons(j$slvar(efvbl)(l))(cons(j$slstr(name)(nil)(l))(nil)))(l)
let push_handlers = (l) => (current_effects) => (save_name) => (new_handlers) => j$slarray(cons(right(j$slspread(current_effects)))(cons(left(j$slstr(save_name)(nil)(l)))(cons(left(new_handlers))(nil))))(l)
let empty_effects = j$slarray(nil)(-1)
let rebase_handlers = (l) => (previous_effects) => (new_effects) => (save_name) => j$slapp(j$slvar("\$rebase_handlers")(l))(cons(j$slstr("lol")(nil)(l))(cons(previous_effects)(cons(new_effects)(cons(j$slvar(save_name)(l))(nil)))))(l)
let iffe = (items) => j$slapp(j$sllambda(nil)(left(j$slblock(items)))(-1))(nil)(-1)
let jv = (n) => j$slvar(n)(-1)
let compile_pat$slj = (pat) => (target) => (inner) => (trace) => (($target) => {
if ($target.type === "pany") {
let l = $target[0];
return inner
} ;
if ($target.type === "penum") {
let name = $target[0];
let nl = $target[1];
let arg = $target[2];
let l = $target[3];
{
let $target = arg;
if ($target.type === "none") {
return cons(j$slif(j$slbin("===")(target)(j$slstr(name)(nil)(nl))(nl))(j$slblock(inner))(none)(l))(nil)
} ;
if ($target.type === "some") {
let pat = $target[0];
return cons(j$slif(j$slbin("===")(j$slattr(target)("tag")(nl))(j$slstr(name)(nil)(nl))(nl))(j$slblock(compile_pat$slj(pat)(j$slattr(target)("arg")(nl))(inner)(trace)))(none)(l))(nil)
} ;
throw new Error('match fail 20435:' + JSON.stringify($target))
}
} ;
if ($target.type === "precord") {
let fields = $target[0];
let spread = $target[1];
let l = $target[2];
return loop(fields)((fields) => (recur) => (($target) => {
if ($target.type === "nil") {
{
let $target = spread;
if ($target.type === "none") {
return inner
} ;
if ($target.type === "some") {
let pat = $target[0];
return cons(j$slsblock(j$slblock(cons(j$sllet(j$slpobj(mapi(0)(fields)((i) => ({"0": name}) => $co(name)(j$slpvar(`_\$${int_to_string(i)}`)(l))))(some(j$slpvar("\$rest")(l)))(l))(target)(l))(compile_pat$slj(pat)(j$slvar("\$rest")(l))(inner)(trace))))(l))(nil)
} ;
throw new Error('match fail 20509:' + JSON.stringify($target))
}
} ;
if ($target.type === "cons") {
if ($target[0].type === ",") {
let name = $target[0][0];
let pat = $target[0][1];
let rest = $target[1];
return compile_pat$slj(pat)(j$slattr(target)(name)(l))(recur(rest))(trace)
} 
} ;
throw new Error('match fail 20505:' + JSON.stringify($target))
})(fields))
} ;
if ($target.type === "pprim") {
let prim = $target[0];
let l = $target[1];
{
let $target = prim;
if ($target.type === "pint") {
let int = $target[0];
let pl = $target[1];
return cons(j$slif(j$slbin("===")(target)(j$slprim(j$slint(int)(pl))(l))(l))(j$slblock(inner))(none)(l))(nil)
} ;
if ($target.type === "pbool") {
let bool = $target[0];
let pl = $target[1];
return cons(j$slif(j$slbin("===")(target)(j$slprim(j$slbool(bool)(pl))(l))(l))(j$slblock(inner))(none)(l))(nil)
} ;
throw new Error('match fail 2339:' + JSON.stringify($target))
}
} ;
if ($target.type === "pstr") {
let str = $target[0];
let l = $target[1];
return cons(j$slif(j$slbin("===")(target)(j$slstr(str)(nil)(l))(l))(j$slblock(inner))(none)(l))(nil)
} ;
if ($target.type === "pvar") {
let name = $target[0];
let l = $target[1];
return cons(j$sllet(j$slpvar(sanitize(name))(l))(target)(l))(inner)
} ;
if ($target.type === "pcon") {
let name = $target[0];
let nl = $target[1];
let args = $target[2];
let l = $target[3];
return cons(j$slif(j$slbin("===")(j$slattr(target)("type")(l))(j$slstr(name)(nil)(l))(l))(j$slblock(pat_loop$slj(target)(args)(0)(inner)(l)(trace)))(none)(l))(nil)
} ;
throw new Error('match fail 2330:' + JSON.stringify($target))
})(pat)

let pat_loop$slj = (target) => (args) => (i) => (inner) => (l) => (trace) => (($target) => {
if ($target.type === "nil") {
return inner
} ;
if ($target.type === "cons") {
let arg = $target[0];
let rest = $target[1];
return compile_pat$slj(arg)(j$slindex(target)(j$slprim(j$slint(i)(l))(l))(l))(pat_loop$slj(target)(rest)(i + 1)(inner)(l)(trace))(trace)
} ;
throw new Error('match fail 11276:' + JSON.stringify($target))
})(args)
let j$slcompile_stmt = (ctx) => (stmt) => (($target) => {
if ($target.type === "j/sexpr") {
let expr = $target[0];
let l = $target[1];
return j$slcompile(ctx)(expr)
} ;
if ($target.type === "j/sblock") {
let block = $target[0];
let l = $target[1];
return j$slcompile_block(ctx)(block)
} ;
if ($target.type === "j/if") {
let cond = $target[0];
let yes = $target[1];
let $else = $target[2];
let l = $target[3];
return `if (${j$slcompile(ctx)(cond)}) ${j$slcompile_block(ctx)(yes)} ${(($target) => {
if ($target.type === "none") {
return ""
} ;
if ($target.type === "some") {
let block = $target[0];
return ` else ${j$slcompile_block(ctx)(block)}`
} ;
throw new Error('match fail 10324:' + JSON.stringify($target))
})($else)}`
} ;
if ($target.type === "j/for") {
let arg = $target[0];
let init = $target[1];
let cond = $target[2];
let inc = $target[3];
let block = $target[4];
let l = $target[5];
return `for (let ${arg} = ${j$slcompile(ctx)(init)}; ${j$slcompile(ctx)(cond)}; ${j$slcompile(ctx)(inc)}) ${j$slcompile_block(ctx)(block)}`
} ;
if ($target.type === "j/break") {
let l = $target[0];
return "break"
} ;
if ($target.type === "j/continue") {
let l = $target[0];
return "continue"
} ;
if ($target.type === "j/return") {
let result = $target[0];
let l = $target[1];
return `return ${j$slcompile(ctx)(result)}`
} ;
if ($target.type === "j/let") {
let pat = $target[0];
let value = $target[1];
let l = $target[2];
return `let ${pat_arg(ctx)(pat)} = ${j$slcompile(ctx)(value)}`
} ;
if ($target.type === "j/throw") {
let value = $target[0];
let l = $target[1];
return `throw ${j$slcompile(ctx)(value)}`
} ;
throw new Error('match fail 10287:' + JSON.stringify($target))
})(stmt)

let j$slcompile = (ctx) => (expr) => (($target) => {
if ($target.type === "j/app") {
let target = $target[0];
let args = $target[1];
let l = $target[2];
return `${j$slparen_expr(ctx)(target)}(${join(", ")(map(args)(j$slcompile(ctx)))})`
} ;
if ($target.type === "j/bin") {
let op = $target[0];
let left = $target[1];
let right = $target[2];
let l = $target[3];
return `${j$slcompile(ctx)(left)} ${op} ${j$slcompile(ctx)(right)}`
} ;
if ($target.type === "j/un") {
let op = $target[0];
let arg = $target[1];
let l = $target[2];
return `${op}${j$slcompile(ctx)(arg)}`
} ;
if ($target.type === "j/raw") {
let raw = $target[0];
let l = $target[1];
return raw
} ;
if ($target.type === "j/com") {
let cm = $target[0];
let inner = $target[1];
return `${j$slcompile(ctx)(inner)}/*${cm}*/`
} ;
if ($target.type === "j/lambda") {
let args = $target[0];
let body = $target[1];
let l = $target[2];
return `(${join(", ")(map(args)(pat_arg(ctx)))}) => ${j$slcompile_body(ctx)(body)}`
} ;
if ($target.type === "j/prim") {
let prim = $target[0];
let l = $target[1];
return j$slcompile_prim(ctx)(prim)
} ;
if ($target.type === "j/str") {
let first = $target[0];
let tpls = $target[1];
let l = $target[2];
{
let $target = tpls;
if ($target.type === "nil") {
return `\"${escape_string(unescapeString(first))}\"`
} ;
return `\`${escape_string(unescapeString(first))}${join("")(map(tpls)((item) => {
let {"1": {"1": l, "0": suffix}, "0": expr} = item;
return `\${${j$slcompile(ctx)(expr)}}${escape_string(unescapeString(suffix))}`
}))}\``;
throw new Error('match fail 12068:' + JSON.stringify($target))
}
} ;
if ($target.type === "j/var") {
let name = $target[0];
let l = $target[1];
return name
} ;
if ($target.type === "j/attr") {
let target = $target[0];
let attr = $target[1];
let l = $target[2];
return `${j$slparen_expr(ctx)(target)}.${sanitize(attr)}`
} ;
if ($target.type === "j/index") {
let target = $target[0];
let idx = $target[1];
let l = $target[2];
return `${j$slparen_expr(ctx)(target)}[${j$slcompile(ctx)(idx)}]`
} ;
if ($target.type === "j/tern") {
let cond = $target[0];
let yes = $target[1];
let no = $target[2];
let l = $target[3];
return `${j$slparen_expr(ctx)(cond)} ? ${j$slparen_expr(ctx)(yes)} : ${j$slparen_expr(ctx)(no)}`
} ;
if ($target.type === "j/assign") {
let name = $target[0];
let op = $target[1];
let value = $target[2];
let l = $target[3];
return `${name} ${op} ${j$slcompile(ctx)(value)}`
} ;
if ($target.type === "j/array") {
let items = $target[0];
let l = $target[1];
return `[${join(", ")(map(items)((item) => (($target) => {
if ($target.type === "left") {
let expr = $target[0];
return j$slcompile(ctx)(expr)
} ;
if ($target.type === "right") {
if ($target[0].type === "j/spread") {
let expr = $target[0][0];
return `...${j$slcompile(ctx)(expr)}`
} 
} ;
throw new Error('match fail 10884:' + JSON.stringify($target))
})(item)))}]`
} ;
if ($target.type === "j/obj") {
let items = $target[0];
let l = $target[1];
return `{${join(", ")(map(items)((item) => (($target) => {
if ($target.type === "left") {
if ($target[0].type === ",") {
let name = $target[0][0];
let value = $target[0][1];
return `\"${name}\": ${j$slcompile(ctx)(value)}`
} 
} ;
if ($target.type === "right") {
if ($target[0].type === "j/spread") {
let expr = $target[0][0];
return `...${j$slcompile(ctx)(expr)}`
} 
} ;
throw new Error('match fail 10924:' + JSON.stringify($target))
})(item)))}}`
} ;
throw new Error('match fail 10696:' + JSON.stringify($target))
})(expr)

let j$slcompile_block = (ctx) => ({"0": block}) => `{\n${join(";\n")(map(block)(j$slcompile_stmt(ctx)))}\n}`

let j$slparen_expr = (ctx) => (target) => maybe_paren(j$slcompile(ctx)(target))(j$slneeds_parens(target))

let j$slcompile_body = (ctx) => (body) => (($target) => {
if ($target.type === "left") {
let block = $target[0];
return j$slcompile_block(ctx)(block)
} ;
if ($target.type === "right") {
let expr = $target[0];
return maybe_paren(j$slcompile(ctx)(expr))((($target) => {
if ($target.type === "j/obj") {
return true
} ;
return false;
throw new Error('match fail 14516:' + JSON.stringify($target))
})(expr))
} ;
throw new Error('match fail 10554:' + JSON.stringify($target))
})(body)
let map$slexpr = (tx) => (expr) => {
let loop = map$slexpr(tx);
{
let {"1": post_e, "0": pre_e} = tx;
{
let $target = pre_e(expr);
if ($target.type === "none") {
return expr
} ;
if ($target.type === "some") {
let expr = $target[0];
return post_e((($target) => {
if ($target.type === "j/app") {
let target = $target[0];
let args = $target[1];
let l = $target[2];
return j$slapp(loop(target))(map(args)(loop))(l)
} ;
if ($target.type === "j/bin") {
let op = $target[0];
let left = $target[1];
let right = $target[2];
let l = $target[3];
return j$slbin(op)(loop(left))(loop(right))(l)
} ;
if ($target.type === "j/un") {
let op = $target[0];
let arg = $target[1];
let l = $target[2];
return j$slun(op)(loop(arg))(l)
} ;
if ($target.type === "j/com") {
let cm = $target[0];
let inner = $target[1];
return j$slcom(cm)(loop(inner))
} ;
if ($target.type === "j/lambda") {
let pats = $target[0];
let body = $target[1];
let l = $target[2];
return j$sllambda(map(pats)(map$slpat(tx)))((($target) => {
if ($target.type === "left") {
let block = $target[0];
return left(map$slblock(tx)(block))
} ;
if ($target.type === "right") {
let expr = $target[0];
return right(loop(expr))
} ;
throw new Error('match fail 13110:' + JSON.stringify($target))
})(body))(l)
} ;
if ($target.type === "j/prim") {
let item = $target[0];
let l = $target[1];
return j$slprim(item)(l)
} ;
if ($target.type === "j/str") {
let string = $target[0];
let tpls = $target[1];
let l = $target[2];
return j$slstr(string)(map(tpls)(({"1": {"1": l, "0": suffix}, "0": expr}) => $co(loop(expr))($co(suffix)(l))))(l)
} ;
if ($target.type === "j/raw") {
let string = $target[0];
let l = $target[1];
return j$slraw(string)(l)
} ;
if ($target.type === "j/var") {
let string = $target[0];
let l = $target[1];
return j$slvar(string)(l)
} ;
if ($target.type === "j/attr") {
let target = $target[0];
let string = $target[1];
let l = $target[2];
return j$slattr(loop(target))(string)(l)
} ;
if ($target.type === "j/index") {
let target = $target[0];
let idx = $target[1];
let l = $target[2];
return j$slindex(loop(target))(loop(idx))(l)
} ;
if ($target.type === "j/tern") {
let cond = $target[0];
let yes = $target[1];
let no = $target[2];
let l = $target[3];
return j$sltern(loop(cond))(loop(yes))(loop(no))(l)
} ;
if ($target.type === "j/assign") {
let name = $target[0];
let op = $target[1];
let value = $target[2];
let l = $target[3];
return j$slassign(name)(op)(loop(value))(l)
} ;
if ($target.type === "j/array") {
let items = $target[0];
let l = $target[1];
return j$slarray(map(items)((item) => (($target) => {
if ($target.type === "left") {
let a = $target[0];
return left(loop(a))
} ;
if ($target.type === "right") {
if ($target[0].type === "j/spread") {
let a = $target[0][0];
return right(j$slspread(loop(a)))
} 
} ;
throw new Error('match fail 13210:' + JSON.stringify($target))
})(item)))(l)
} ;
if ($target.type === "j/obj") {
let items = $target[0];
let l = $target[1];
return j$slobj(map(items)((item) => (($target) => {
if ($target.type === "left") {
if ($target[0].type === ",") {
let name = $target[0][0];
let value = $target[0][1];
return left($co(name)(loop(value)))
} 
} ;
if ($target.type === "right") {
if ($target[0].type === "j/spread") {
let value = $target[0][0];
return right(j$slspread(loop(value)))
} 
} ;
throw new Error('match fail 13245:' + JSON.stringify($target))
})(item)))(l)
} ;
throw new Error('match fail 12858:' + JSON.stringify($target))
})(expr))
} ;
throw new Error('match fail 12976:' + JSON.stringify($target))
}
}
}

let map$slblock = (tx) => (block) => {
let {"7": post_b, "6": pre_b} = tx;
{
let $target = pre_b(block);
if ($target.type === "none") {
return block
} ;
if ($target.type === "some") {
if ($target[0].type === "j/block") {
let stmts = $target[0][0];
return post_b(j$slblock(map(stmts)(map$slstmt(tx))))
} 
} ;
throw new Error('match fail 13916:' + JSON.stringify($target))
}
}

let map$slstmt = (tx) => (stmt) => {
let loop = map$slstmt(tx);
{
let loope = map$slexpr(tx);
{
let {"5": post_s, "4": pre_s} = tx;
{
let $target = pre_s(stmt);
if ($target.type === "none") {
return stmt
} ;
if ($target.type === "some") {
let stmt = $target[0];
return post_s((($target) => {
if ($target.type === "j/sexpr") {
let expr = $target[0];
let l = $target[1];
return j$slsexpr(loope(expr))(l)
} ;
if ($target.type === "j/sblock") {
let block = $target[0];
let l = $target[1];
return j$slsblock(map$slblock(tx)(block))(l)
} ;
if ($target.type === "j/if") {
let cond = $target[0];
let yes = $target[1];
let no = $target[2];
let l = $target[3];
return j$slif(loope(cond))(map$slblock(tx)(yes))((($target) => {
if ($target.type === "none") {
return none
} ;
if ($target.type === "some") {
let v = $target[0];
return some(map$slblock(tx)(v))
} ;
throw new Error('match fail 13450:' + JSON.stringify($target))
})(no))(l)
} ;
if ($target.type === "j/for") {
let string = $target[0];
let init = $target[1];
let cond = $target[2];
let inc = $target[3];
let body = $target[4];
let l = $target[5];
return j$slfor(string)(loope(init))(loope(cond))(loope(inc))(map$slblock(tx)(body))(l)
} ;
if ($target.type === "j/break") {
let l = $target[0];
return stmt
} ;
if ($target.type === "j/continue") {
let l = $target[0];
return stmt
} ;
if ($target.type === "j/return") {
let value = $target[0];
let l = $target[1];
return j$slreturn(loope(value))(l)
} ;
if ($target.type === "j/let") {
let pat = $target[0];
let value = $target[1];
let l = $target[2];
return j$sllet(map$slpat(tx)(pat))(loope(value))(l)
} ;
if ($target.type === "j/throw") {
let value = $target[0];
let l = $target[1];
return j$slthrow(loope(value))(l)
} ;
throw new Error('match fail 13361:' + JSON.stringify($target))
})(stmt))
} ;
throw new Error('match fail 13390:' + JSON.stringify($target))
}
}
}
}
let fold$slstmt = (fx) => (init) => (stmt) => {
let {"3": s, "2": b, "1": p, "0": e} = fx;
return s((($target) => {
if ($target.type === "j/sexpr") {
let expr = $target[0];
return fold$slexpr(fx)(init)(expr)
} ;
if ($target.type === "j/sblock") {
let block = $target[0];
return fold$slblock(fx)(init)(block)
} ;
if ($target.type === "j/if") {
let cond = $target[0];
let yes = $target[1];
let no = $target[2];
return fold$sloption(fold$slblock(fx))(fold$slblock(fx)(fold$slexpr(fx)(init)(cond))(yes))(no)
} ;
if ($target.type === "j/for") {
let iit = $target[1];
let cond = $target[2];
let inc = $target[3];
let body = $target[4];
return fold$slblock(fx)(fold$slexpr(fx)(fold$slexpr(fx)(fold$slexpr(fx)(init)(iit))(cond))(inc))(body)
} ;
if ($target.type === "j/return") {
let value = $target[0];
return fold$slexpr(fx)(init)(value)
} ;
if ($target.type === "j/throw") {
let value = $target[0];
return fold$slexpr(fx)(init)(value)
} ;
if ($target.type === "j/let") {
let pat = $target[0];
let value = $target[1];
return fold$slexpr(fx)(fold$slpat(fx)(init)(pat))(value)
} ;
return init;
throw new Error('match fail 14796:' + JSON.stringify($target))
})(stmt))(stmt)
}

let fold$slexpr = (fx) => (init) => (expr) => {
let {"0": e} = fx;
return e((($target) => {
if ($target.type === "j/app") {
let target = $target[0];
let args = $target[1];
return foldl(fold$slexpr(fx)(init)(target))(args)(fold$slexpr(fx))
} ;
if ($target.type === "j/bin") {
let left = $target[1];
let right = $target[2];
return fold$slexpr(fx)(fold$slexpr(fx)(init)(left))(right)
} ;
if ($target.type === "j/un") {
let arg = $target[1];
return fold$slexpr(fx)(init)(arg)
} ;
if ($target.type === "j/lambda") {
let pats = $target[0];
let body = $target[1];
return foldl(fold$sleither(fold$slblock(fx))(fold$slexpr(fx))(init)(body))(pats)(fold$slpat(fx))
} ;
if ($target.type === "j/str") {
let tpls = $target[1];
return foldl(init)(tpls)(fold$slget($co$co0)(fold$slexpr(fx)))
} ;
if ($target.type === "j/attr") {
let target = $target[0];
return fold$slexpr(fx)(init)(target)
} ;
if ($target.type === "j/index") {
let target = $target[0];
let idx = $target[1];
return fold$slexpr(fx)(fold$slexpr(fx)(init)(target))(idx)
} ;
if ($target.type === "j/tern") {
let cond = $target[0];
let yes = $target[1];
let no = $target[2];
return fold$slexpr(fx)(fold$slexpr(fx)(fold$slexpr(fx)(init)(cond))(yes))(no)
} ;
if ($target.type === "j/assign") {
let value = $target[2];
return fold$slexpr(fx)(init)(value)
} ;
if ($target.type === "j/array") {
let items = $target[0];
return foldl(init)(items)(fold$sleither(fold$slexpr(fx))(fold$slget(spread$slinner)(fold$slexpr(fx))))
} ;
if ($target.type === "j/obj") {
let items = $target[0];
return foldl(init)(items)(fold$sleither(fold$slget(snd)(fold$slexpr(fx)))(fold$slget(spread$slinner)(fold$slexpr(fx))))
} ;
return fatal("cant fold this expr");
throw new Error('match fail 14837:' + JSON.stringify($target))
})(expr))(expr)
}

let fold$slblock = (fx) => (init) => (block) => {
let {"2": b} = fx;
{
let {"0": items} = block;
return b(foldl(init)(items)(fold$slstmt(fx)))(block)
}
}
let pat_loop_list = (target) => (args) => (i) => (($target) => {
if ($target.type === "nil") {
return $co(nil)(nil)
} ;
if ($target.type === "cons") {
let arg = $target[0];
let rest = $target[1];
{
let {"1": assign, "0": check} = compile_pat_list(arg)(j$slindex(target)(j$slprim(j$slint(i)(-1))(-1))(-1));
{
let {"1": a2, "0": c2} = pat_loop_list(target)(rest)(i + 1);
return $co(concat(cons(check)(cons(c2)(nil))))(concat(cons(assign)(cons(a2)(nil))))
}
}
} ;
throw new Error('match fail 28498:' + JSON.stringify($target))
})(args)

let compile_pat_list = (pat) => (target) => (($target) => {
if ($target.type === "pany") {
return $co(nil)(nil)
} ;
if ($target.type === "pprim") {
let prim = $target[0];
let l = $target[1];
return $co(cons(j$slbin("===")(target)(compile_prim$slj(prim)(l))(l))(nil))(nil)
} ;
if ($target.type === "pstr") {
let str = $target[0];
let l = $target[1];
return $co(cons(j$slbin("===")(target)(j$slstr(str)(nil)(l))(l))(nil))(nil)
} ;
if ($target.type === "pvar") {
let name = $target[0];
let l = $target[1];
return $co(nil)(cons(j$sllet(j$slpvar(sanitize(name))(l))(target)(l))(nil))
} ;
if ($target.type === "pcon") {
let name = $target[0];
let nl = $target[1];
let args = $target[2];
let l = $target[3];
{
let {"1": assign, "0": check} = pat_loop_list(target)(args)(0);
return $co(cons(j$slbin("===")(j$slattr(target)("type")(l))(j$slstr(name)(nil)(l))(l))(check))(assign)
}
} ;
if ($target.type === "penum") {
let name = $target[0];
let nl = $target[1];
if ($target[2].type === "none") {
let l = $target[3];
return $co(cons(j$slbin("===")(target)(j$slstr(name)(nil)(l))(l))(nil))(nil)
} 
} ;
if ($target.type === "penum") {
let name = $target[0];
let nl = $target[1];
if ($target[2].type === "some") {
let arg = $target[2][0];
let l = $target[3];
{
let {"1": assign, "0": check} = compile_pat_list(arg)(j$slattr(target)("arg")(l));
return $co(cons(j$slbin("===")(j$slattr(target)("tag")(l))(j$slstr(name)(nil)(l))(l))(check))(assign)
}
} 
} ;
if ($target.type === "precord") {
let items = $target[0];
let spread = $target[1];
let l = $target[2];
{
let {"1": assign, "0": check} = loop($co(items)($co(nil)(nil)))(({"1": {"1": assign, "0": check}, "0": items}) => (recur) => (($target) => {
if ($target.type === "nil") {
return $co(check)(assign)
} ;
if ($target.type === "cons") {
if ($target[0].type === ",") {
let name = $target[0][0];
let pat = $target[0][1];
let rest = $target[1];
{
let {"1": a, "0": c} = compile_pat_list(pat)(j$slattr(target)(name)(l));
return $co(concat(cons(check)(cons(c)(nil))))(concat(cons(assign)(cons(a)(nil))))
}
} 
} ;
throw new Error('match fail 29991:' + JSON.stringify($target))
})(items));
{
let $target = spread;
if ($target.type === "none") {
return $co(check)(assign)
} ;
if ($target.type === "some") {
let spread = $target[0];
{
let {"1": a, "0": c} = compile_pat_list(spread)(target);
return $co(concat(cons(check)(cons(c)(nil))))(concat(cons(assign)(cons(a)(nil))))
}
} ;
throw new Error('match fail 30006:' + JSON.stringify($target))
}
}
} ;
throw new Error('match fail 28854:' + JSON.stringify($target))
})(pat)
let parse_type = (type) => (($target) => {
if ($target.type === "cst/id") {
let id = $target[0];
let l = $target[1];
return $lt_(tcon(id)(l))
} ;
if ($target.type === "cst/list") {
if ($target[0].type === "nil") {
let l = $target[1];
return $lt_(tcon("()")(l))
} 
} ;
if ($target.type === "cst/list") {
if ($target[0].type === "cons") {
if ($target[0][0].type === "cst/id") {
if ($target[0][0][0] === "fn") {
if ($target[0][1].type === "cons") {
if ($target[0][1][0].type === "cst/array") {
let args = $target[0][1][0][0];
if ($target[0][1][1].type === "cons") {
let body = $target[0][1][1][0];
let rest = $target[0][1][1][1];
let l = $target[1];
return $gt$gt$eq(parse_type(body))((body) => $gt$gt$eq(map_$gt(parse_type)(args))((args) => $gt$gt$eq(do_$gt(unexpected("extra item in type"))(rest))((_17506) => $lt_(foldl(body)(rev(args)(nil))((body) => (arg) => tapp(tapp(tcon("->")(l))(arg)(l))(body)(l))))))
} 
} 
} 
} 
} 
} 
} ;
if ($target.type === "cst/list") {
if ($target[0].type === "cons") {
if ($target[0][0].type === "cst/id") {
if ($target[0][0][0] === "rec") {
if ($target[0][1].type === "cons") {
if ($target[0][1][0].type === "cst/id") {
let name = $target[0][1][0][0];
let nl = $target[0][1][0][1];
if ($target[0][1][1].type === "cons") {
let inner = $target[0][1][1][0];
if ($target[0][1][1][1].type === "nil") {
let l = $target[1];
return $gt$gt$eq(parse_type(inner))((inner) => $lt_(trec(name)(nl)(inner)(l)))
} 
} 
} 
} 
} 
} 
} 
} ;
if ($target.type === "cst/list") {
if ($target[0].type === "cons") {
if ($target[0][0].type === "cst/id") {
if ($target[0][0][0] === ",") {
let cl = $target[0][0][1];
let items = $target[0][1];
let l = $target[1];
return $gt$gt$eq(map_$gt(parse_type)(items))((items) => $lt_(loop(items)((items) => (recur) => (($target) => {
if ($target.type === "nil") {
return fatal("invalid empty tuple")
} ;
if ($target.type === "cons") {
let one = $target[0];
if ($target[1].type === "nil") {
return one
} 
} ;
if ($target.type === "cons") {
let one = $target[0];
let rest = $target[1];
return tapp(tapp(tcon(",")(cl))(one)(l))(recur(rest))(l)
} ;
throw new Error('match fail 19066:' + JSON.stringify($target))
})(items))))
} 
} 
} 
} ;
if ($target.type === "cst/list") {
let items = $target[0];
let l = $target[1];
return $gt$gt$eq(map_$gt(parse_type)(items))((items) => $lt_(tapps(rev(items)(nil))(l)))
} ;
return $lt_err($co(cst_loc(type))(`(parse-type) Invalid type ${valueToString(type)}`))(tcon("()")(cst_loc(type)));
throw new Error('match fail 867:' + JSON.stringify($target))
})(type)
let mk_deftype = (id) => (li) => (args) => (items) => (l) => $gt$gt$eq(foldr_$gt(nil)(args)((args) => (arg) => (($target) => {
if ($target.type === "cst/id") {
let name = $target[0];
let l = $target[1];
return $lt_(cons($co(name)(l))(args))
} ;
return $lt_err($co(l)("deftype type argument must be identifier"))(args);
throw new Error('match fail 5024:' + JSON.stringify($target))
})(arg)))((args) => $gt$gt$eq(foldr_$gt(nil)(items)((res) => (constr) => (($target) => {
if ($target.type === "cst/list") {
if ($target[0].type === "cons") {
if ($target[0][0].type === "cst/id") {
let name = $target[0][0][0];
let ni = $target[0][0][1];
let args = $target[0][1];
let l = $target[1];
return $gt$gt$eq(map_$gt(parse_type)(args))((args) => $lt_(cons($co(name)($co(ni)($co(args)(l))))(res)))
} 
} 
} ;
if ($target.type === "cst/list") {
if ($target[0].type === "nil") {
let l = $target[1];
return $lt_err($co(l)("Empty type constructor"))(res)
} 
} ;
return $lt_err($co(l)("Invalid type constructor"))(res);
throw new Error('match fail 1443:' + JSON.stringify($target))
})(constr)))((items) => $lt_(tdeftype(id)(li)(args)(items)(l))))
let simplify_js = tx((expr) => some(expr))(apply_until(simplify_one))((pat) => none)((pat) => pat)((stmt) => some(stmt))(apply_until(simplify_stmt))((block) => some(block))(apply_until(simplify_block))
let call_at_end = (items) => (($target) => {
if ($target.type === "nil") {
return none
} ;
if ($target.type === "cons") {
if ($target[0].type === "j/return") {
if ($target[0][0].type === "j/app") {
if ($target[0][0][0].type === "j/lambda") {
let params = $target[0][0][0][0];
let body = $target[0][0][0][1];
let ll = $target[0][0][0][2];
let args = $target[0][0][1];
let al = $target[0][0][2];
let l = $target[0][1];
if ($target[1].type === "nil") {
{
let $target = $eq(len(params))(len(args));
if ($target === true) {
return some(cons(j$slsblock(j$slblock(concat(cons(make_lets(params)(args)(ll))(cons((($target) => {
if ($target.type === "left") {
if ($target[0].type === "j/block") {
let items = $target[0][0];
return items
} 
} ;
if ($target.type === "right") {
let expr = $target[0];
return cons(j$slreturn(expr)(l))(nil)
} ;
throw new Error('match fail 14069:' + JSON.stringify($target))
})(body))(nil)))))(l))(nil))
} ;
return none;
throw new Error('match fail 14033:' + JSON.stringify($target))
}
} 
} 
} 
} 
} ;
if ($target.type === "cons") {
let one = $target[0];
let rest = $target[1];
{
let $target = call_at_end(rest);
if ($target.type === "some") {
let v = $target[0];
return some(cons(one)(v))
} ;
{
let none = $target;
return none
};
throw new Error('match fail 14040:' + JSON.stringify($target))
}
} ;
throw new Error('match fail 14020:' + JSON.stringify($target))
})(items)
let j$slcompile_stmts = (ctx) => (stmts) => join("\n")(map(stmts)(j$slcompile_stmt(ctx)))
let let_fix_shadow = ({"1": init, "0": pat}) => (l) => {
let names = pat_names(pat);
{
let used = externals(set$slnil)(init);
{
let overlap = bag$slfold((shadow) => ({"1": {"1": l, "0": kind}, "0": name}) => (($target) => {
if ($target.type === "value") {
{
let $target = set$slhas(names)(name);
if ($target === true) {
return cons($co(name)(l))(shadow)
} ;
return shadow;
throw new Error('match fail 15637:' + JSON.stringify($target))
}
} ;
return shadow;
throw new Error('match fail 15632:' + JSON.stringify($target))
})(kind))(nil)(used);
{
let shadow = set$slto_list(foldl(set$slnil)(overlap)((ov) => ({"0": name}) => set$sladd(ov)(name)));
{
let new_names = mapi(0)(shadow)((i) => (name) => `${name}\$${its(i)}`);
{
let mapping = map$slfrom_list(zip(shadow)(new_names));
{
let by_loc = map$slfrom_list(map(overlap)(({"1": loc, "0": name}) => $co(loc)(force_opt(map$slget(mapping)(name)))));
{
let $target = overlap;
if ($target.type === "nil") {
return cons($co(pat)(init))(nil)
} ;
return concat(cons(map(map$slto_list(mapping))(({"1": $new, "0": old}) => $co(pvar($new)(l))(evar(old)(l))))(cons(cons($co(pat)(map_expr((expr) => (($target) => {
if ($target.type === "evar") {
let l = $target[1];
{
let $target = map$slget(by_loc)(l);
if ($target.type === "some") {
let new_name = $target[0];
return evar(new_name)(l)
} ;
return expr;
throw new Error('match fail 15793:' + JSON.stringify($target))
}
} ;
return expr;
throw new Error('match fail 15762:' + JSON.stringify($target))
})(expr))(init)))(nil))(nil)));
throw new Error('match fail 15609:' + JSON.stringify($target))
}
}
}
}
}
}
}
}
let expand_bindings = (bindings) => (l) => foldr(nil)(bindings)((res) => (binding) => concat(cons(let_fix_shadow(binding)(l))(cons(res)(nil))))
let parse_typealias = (name) => (body) => (l) => $gt$gt$eq($lt_((($target) => {
if ($target.type === "cst/id") {
let name = $target[0];
let nl = $target[1];
return $co(name)($co(nl)(nil))
} ;
if ($target.type === "cst/list") {
if ($target[0].type === "cons") {
if ($target[0][0].type === "cst/id") {
let name = $target[0][0][0];
let nl = $target[0][0][1];
let args = $target[0][1];
return $co(name)($co(nl)(args))
} 
} 
} ;
return fatal("cant parse type alias");
throw new Error('match fail 17297:' + JSON.stringify($target))
})(name)))(({"1": {"1": args, "0": nl}, "0": name}) => $gt$gt$eq(foldr_$gt(nil)(args)((args) => (x) => (($target) => {
if ($target.type === "cst/id") {
let name = $target[0];
let l = $target[1];
return $lt_(cons($co(name)(l))(args))
} ;
return $lt_err($co(cst_loc(x))("typealias type argument must be identifier"))(args);
throw new Error('match fail 17336:' + JSON.stringify($target))
})(x)))((args) => $gt$gt$eq(parse_type(body))((body) => $lt_(ttypealias(name)(nl)(args)(body)(l)))))
let expr$slnames = (bound) => (expr) => (($target) => {
if ($target.type === "evar") {
let name = $target[0];
let l = $target[1];
return expr$slvar_name(bound)(name)(l)
} ;
if ($target.type === "eprim") {
return empty
} ;
if ($target.type === "equot") {
return empty
} ;
if ($target.type === "eprovide") {
let target = $target[0];
let cases = $target[1];
return foldl(expr$slnames(bound)(target))(map(cases)(({"1": {"1": {"1": body, "0": k}, "0": nl}, "0": name}) => {
let pats = (($target) => {
if ($target.type === "ebang") {
let pats = $target[0];
return pats
} ;
if ($target.type === "eeffectful") {
let pats = $target[2];
return pats
} ;
return nil;
throw new Error('match fail 23586:' + JSON.stringify($target))
})(k);
{
let {"1": names$qu, "0": bound$qu} = foldl($co(nil)(empty))(map(pats)(pat$slnames))(bound_and_names);
return bag$sland(expr$slnames(map$slmerge(bound)(map$slfrom_list(bound$qu)))(body))(names$qu)
}
}))(bag$sland)
} ;
if ($target.type === "eeffect") {
if ($target[1].type === "some") {
let args = $target[1][0];
return foldl(empty)(map(args)(expr$slnames(bound)))(bag$sland)
} 
} ;
if ($target.type === "eeffect") {
return empty
} ;
if ($target.type === "eaccess") {
let target = $target[0];
let l = $target[2];
{
let $target = target;
if ($target.type === "none") {
return empty
} ;
if ($target.type === "some") {
if ($target[0].type === ",") {
let v = $target[0][0];
let l = $target[0][1];
return expr$slvar_name(bound)(v)(l)
} 
} ;
throw new Error('match fail 21127:' + JSON.stringify($target))
}
} ;
if ($target.type === "erecord") {
let spread = $target[0];
let fields = $target[1];
let l = $target[2];
return foldl(map_or(dot(expr$slnames(bound))(fst))(empty)(spread))(map(fields)(dot(expr$slnames(bound))(snd)))(bag$sland)
} ;
if ($target.type === "eenum") {
let arg = $target[2];
return map_or(expr$slnames(bound))(empty)(arg)
} ;
if ($target.type === "eapp") {
let target = $target[0];
let args = $target[1];
return foldl(expr$slnames(bound)(target))(map(args)(expr$slnames(bound)))(bag$sland)
} ;
if ($target.type === "elambda") {
let args = $target[0];
let body = $target[1];
{
let {"1": names, "0": bound$qu} = foldl($co(nil)(empty))(map(args)(pat$slnames))(bound_and_names);
return bag$sland(names)(expr$slnames(map$slmerge(bound)(map$slfrom_list(bound$qu)))(body))
}
} ;
if ($target.type === "elet") {
let bindings = $target[0];
let body = $target[1];
return loop($co(bindings)($co(bound)(empty)))(({"1": {"1": names, "0": bound}, "0": bindings}) => (recur) => (($target) => {
if ($target.type === "nil") {
return bag$sland(names)(expr$slnames(bound)(body))
} ;
if ($target.type === "cons") {
if ($target[0].type === ",") {
let pat = $target[0][0];
let expr = $target[0][1];
let rest = $target[1];
{
let {"1": names$qu, "0": bound$qu} = pat$slnames(pat);
{
let bound$$0 = bound;
{
let bound = map$slmerge(bound$$0)(map$slfrom_list(bound$qu));
{
let names$$0 = names;
{
let names = bag$sland(names$$0)(names$qu);
return recur($co(rest)($co(bound)(bag$sland(names)(expr$slnames(bound)(expr)))))
}
}
}
}
}
} 
} ;
throw new Error('match fail 19655:' + JSON.stringify($target))
})(bindings))
} ;
if ($target.type === "ematch") {
let target = $target[0];
let cases = $target[1];
return foldl(expr$slnames(bound)(target))(map(cases)(({"1": body, "0": pat}) => {
let {"1": names$qu, "0": bound$qu} = pat$slnames(pat);
{
let bound$$0 = bound;
{
let bound = map$slmerge(bound$$0)(map$slfrom_list(bound$qu));
return bag$sland(names$qu)(expr$slnames(bound)(body))
}
}
}))(bag$sland)
} ;
if ($target.type === "estr") {
let tpls = $target[1];
return many(map(tpls)(({"0": expr}) => expr$slnames(bound)(expr)))
} ;
throw new Error('match fail 19534:' + JSON.stringify($target))
})(expr)
let provide_empty_effects = (jexp) => j$slapp(j$sllambda(cons(j$slpvar("\$lbeffects\$rb")(-1))(nil))(jexp)(-1))(cons(empty_effects)(nil))(-1)
let parse_provide = (parse_expr) => (target) => (ml) => (cases) => (l) => $gt$gt$eq(parse_expr(target))((target) => $gt$gt$eq($lt_(pairs_plus(cst$slid("()")(ml))(cases)))((cases) => $gt$gt$eq(map_$gt(({"1": expr, "0": pat}) => $gt$gt$eq(parse_expr(expr))((expr) => $gt$gt$eq(parse_provide_pat(pat))(({"1": {"1": {"1": l, "0": epat}, "0": il}, "0": id}) => $lt_($co(id)($co(il)($co(epat)(expr)))))))(cases))((cases) => $lt_(eprovide(target)(cases)(l)))))
let cps$slj = (trace) => (expr) => {
let cps = cps$slj(trace);
{
let $target = expr;
if ($target.type === "eapp") {
let target = $target[0];
if ($target[1].type === "cons") {
let arg = $target[1][0];
if ($target[1][1].type === "nil") {
let l = $target[2];
{
let target$$0 = target;
{
let target = cps(target$$0);
{
let arg$$0 = arg;
{
let arg = cps(arg$$0);
return right(done_fn(l)((done) => left_right(target)("target")(l)((target) => left_right(arg)("arg")(l)((arg) => j$slapp(target)(cons(arg)(cons(j$slvar("\$lbeffects\$rb")(l))(cons(done)(nil))))(l)))))
}
}
}
}
} 
} 
} ;
if ($target.type === "eapp") {
let target = $target[0];
if ($target[1].type === "cons") {
let arg = $target[1][0];
let rest = $target[1][1];
let l = $target[2];
return cps(eapp(eapp(target)(cons(arg)(nil))(l))(rest)(l))
} 
} ;
if ($target.type === "elambda") {
if ($target[0].type === "cons") {
let arg = $target[0][0];
if ($target[0][1].type === "nil") {
let body = $target[1];
let l = $target[2];
{
let pat = (($target) => {
if ($target.type === "none") {
return j$slpvar("_")(l)
} ;
if ($target.type === "some") {
let pat = $target[0];
return pat
} ;
throw new Error('match fail 24535:' + JSON.stringify($target))
})(pat_$gtj$slpat(arg));
return left(j$sllambda(cons(pat)(cons(j$slpvar("\$lbeffects\$rb")(l))(cons(j$slpvar("\$done")(l))(nil))))(right((($target) => {
if ($target.type === "left") {
let body = $target[0];
return j$slapp(j$slvar("\$done")(l))(cons(body)(nil))(l)
} ;
if ($target.type === "right") {
let body = $target[0];
return j$slapp(body)(cons(j$slvar("\$done")(l))(nil))(l)
} ;
throw new Error('match fail 24555:' + JSON.stringify($target))
})(cps(body))))(l))
}
} 
} 
} ;
if ($target.type === "elambda") {
let args = $target[0];
let body = $target[1];
let l = $target[2];
return cps(loop(args)((args) => (recur) => (($target) => {
if ($target.type === "nil") {
return fatal("no args")
} ;
if ($target.type === "cons") {
let one = $target[0];
if ($target[1].type === "nil") {
return elambda(cons(one)(nil))(body)(l)
} 
} ;
if ($target.type === "cons") {
let one = $target[0];
let rest = $target[1];
return elambda(cons(one)(nil))(recur(rest))(l)
} ;
throw new Error('match fail 24479:' + JSON.stringify($target))
})(args)))
} ;
if ($target.type === "eprim") {
if ($target[0].type === "pint") {
let n = $target[0][0];
let l = $target[0][1];
return left(j$slprim(j$slint(n)(l))(l))
} 
} ;
if ($target.type === "evar") {
let n = $target[0];
let l = $target[1];
return left(j$slvar(sanitize(n))(l))
} ;
if ($target.type === "estr") {
let first = $target[0];
if ($target[1].type === "nil") {
let l = $target[2];
return left(j$slstr(first)(nil)(l))
} 
} ;
return fatal("no");
throw new Error('match fail 23618:' + JSON.stringify($target))
}
}
let compile_pat = (pat) => (target) => (inner) => (l) => {
let {"1": assign, "0": check} = compile_pat_list(pat)(target);
{
let inner$$0 = inner;
{
let inner = (($target) => {
if ($target.type === "nil") {
return inner$$0
} ;
return j$slsblock(j$slblock(concat(cons(assign)(cons(cons(inner$$0)(nil))(nil)))))(l);
throw new Error('match fail 28572:' + JSON.stringify($target))
})(assign);
{
let inner$$0 = inner;
{
let inner = (($target) => {
if ($target.type === "nil") {
return inner$$0
} ;
return j$slif(loop(check)((check) => (recur) => (($target) => {
if ($target.type === "nil") {
return j$slprim(j$slbool(true)(l))(l)
} ;
if ($target.type === "cons") {
let one = $target[0];
if ($target[1].type === "nil") {
return one
} 
} ;
if ($target.type === "cons") {
let one = $target[0];
let rest = $target[1];
return j$slbin("&&")(one)(recur(rest))(l)
} ;
throw new Error('match fail 29425:' + JSON.stringify($target))
})(check)))(j$slblock(cons(inner$$0)(nil)))(none)(l);
throw new Error('match fail 28589:' + JSON.stringify($target))
})(check);
return inner
}
}
}
}
}
let parse_top = (cst) => (($target) => {
if ($target.type === "cst/list") {
if ($target[0].type === "cons") {
if ($target[0][0].type === "cst/id") {
if ($target[0][0][0] === "def") {
if ($target[0][1].type === "cons") {
if ($target[0][1][0].type === "cst/id") {
let id = $target[0][1][0][0];
let li = $target[0][1][0][1];
if ($target[0][1][1].type === "cons") {
let value = $target[0][1][1][0];
let rest = $target[0][1][1][1];
let l = $target[1];
return $gt$gt$eq(parse_expr(value))((expr) => $gt$gt$eq(do_$gt(unexpected("extra items in def"))(rest))((_16836) => $lt_(tdef(id)(li)(expr)(l))))
} 
} 
} 
} 
} 
} 
} ;
if ($target.type === "cst/list") {
if ($target[0].type === "cons") {
if ($target[0][0].type === "cst/id") {
if ($target[0][0][0] === "def") {
let l = $target[1];
return $lt_err($co(l)("Invalid 'def'"))(sunit(l))
} 
} 
} 
} ;
if ($target.type === "cst/list") {
if ($target[0].type === "cons") {
if ($target[0][0].type === "cst/id") {
if ($target[0][0][0] === "defn") {
if ($target[0][1].type === "cons") {
if ($target[0][1][0].type === "cst/id") {
let id = $target[0][1][0][0];
let li = $target[0][1][0][1];
if ($target[0][1][1].type === "nil") {
let c = $target[1];
return $lt_(tdef(id)(li)(evar("nil")(c))(c))
} 
} 
} 
} 
} 
} 
} ;
if ($target.type === "cst/list") {
if ($target[0].type === "cons") {
if ($target[0][0].type === "cst/id") {
if ($target[0][0][0] === "defn") {
if ($target[0][1].type === "cons") {
if ($target[0][1][0].type === "cst/id") {
let id = $target[0][1][0][0];
let li = $target[0][1][0][1];
if ($target[0][1][1].type === "cons") {
if ($target[0][1][1][0].type === "cst/array") {
let args = $target[0][1][1][0][0];
let b = $target[0][1][1][0][1];
let rest = $target[0][1][1][1];
let c = $target[1];
return $gt$gt$eq(map_$gt(parse_pat)(args))((args) => $gt$gt$eq((($target) => {
if ($target.type === "nil") {
return $lt_err($co(b)("Empty arguments list"))($unit)
} ;
return $lt_($unit);
throw new Error('match fail 17240:' + JSON.stringify($target))
})(args))((_17057) => (($target) => {
if ($target.type === "nil") {
return $lt_(tdef(id)(li)(evar("nil")(c))(c))
} ;
if ($target.type === "cons") {
let body = $target[0];
let rest = $target[1];
return $gt$gt$eq(parse_expr(body))((body) => $gt$gt$eq(do_$gt(unexpected("extra items in defn"))(rest))((_17050) => $lt_(tdef(id)(li)(elambda(args)(body)(c))(c))))
} ;
throw new Error('match fail 17027:' + JSON.stringify($target))
})(rest)))
} 
} 
} 
} 
} 
} 
} 
} ;
if ($target.type === "cst/list") {
if ($target[0].type === "cons") {
if ($target[0][0].type === "cst/id") {
if ($target[0][0][0] === "defn") {
let l = $target[1];
return $lt_err($co(l)("Invalid 'defn'"))(sunit(l))
} 
} 
} 
} ;
if ($target.type === "cst/list") {
if ($target[0].type === "cons") {
if ($target[0][0].type === "cst/id") {
if ($target[0][0][0] === "deftype") {
if ($target[0][1].type === "cons") {
let name = $target[0][1][0];
let items = $target[0][1][1];
let l = $target[1];
{
let $target = name;
if ($target.type === "cst/id") {
let id = $target[0];
let li = $target[1];
return mk_deftype(id)(li)(nil)(items)(l)
} ;
if ($target.type === "cst/list") {
if ($target[0].type === "cons") {
if ($target[0][0].type === "cst/id") {
let id = $target[0][0][0];
let li = $target[0][0][1];
let args = $target[0][1];
return mk_deftype(id)(li)(args)(items)(l)
} 
} 
} ;
return fatal("Cant parse deftype");
throw new Error('match fail 17376:' + JSON.stringify($target))
}
} 
} 
} 
} 
} ;
if ($target.type === "cst/list") {
if ($target[0].type === "cons") {
if ($target[0][0].type === "cst/id") {
if ($target[0][0][0] === "deftype") {
let l = $target[1];
return $lt_err($co(l)("Invalid deftype"))(sunit(l))
} 
} 
} 
} ;
if ($target.type === "cst/list") {
if ($target[0].type === "cons") {
if ($target[0][0].type === "cst/id") {
if ($target[0][0][0] === "typealias") {
if ($target[0][1].type === "cons") {
let name = $target[0][1][0];
if ($target[0][1][1].type === "cons") {
let body = $target[0][1][1][0];
if ($target[0][1][1][1].type === "nil") {
let l = $target[1];
return parse_typealias(name)(body)(l)
} 
} 
} 
} 
} 
} 
} ;
return $gt$gt$eq(parse_expr(cst))((expr) => $lt_(texpr(expr)(cst_loc(cst))));
throw new Error('match fail 606:' + JSON.stringify($target))
})(cst)

let parse_expr = (cst) => (($target) => {
if ($target.type === "cst/id") {
if ($target[0] === "true") {
let l = $target[1];
return $lt_(eprim(pbool(true)(l))(l))
} 
} ;
if ($target.type === "cst/id") {
if ($target[0] === "false") {
let l = $target[1];
return $lt_(eprim(pbool(false)(l))(l))
} 
} ;
if ($target.type === "cst/string") {
let first = $target[0];
let templates = $target[1];
let l = $target[2];
return $gt$gt$eq(map_$gt(({"1": {"1": l, "0": suffix}, "0": expr}) => $gt$gt$eq(parse_expr(expr))((expr) => $lt_($co(expr)($co(suffix)(l)))))(templates))((tpls) => $lt_(estr(first)(tpls)(l)))
} ;
if ($target.type === "cst/id") {
let id = $target[0];
let l = $target[1];
return $lt_(parse_id(id)(l))
} ;
if ($target.type === "cst/list") {
if ($target[0].type === "cons") {
if ($target[0][0].type === "cst/id") {
if ($target[0][0][0] === "@") {
if ($target[0][1].type === "cons") {
let body = $target[0][1][0];
if ($target[0][1][1].type === "nil") {
let l = $target[1];
return $gt$gt$eq(parse_expr(body))((expr) => $lt_(equot(quot$slexpr(expr))(l)))
} 
} 
} 
} 
} 
} ;
if ($target.type === "cst/list") {
if ($target[0].type === "cons") {
if ($target[0][0].type === "cst/id") {
if ($target[0][0][0] === "@@") {
if ($target[0][1].type === "cons") {
let body = $target[0][1][0];
if ($target[0][1][1].type === "nil") {
let l = $target[1];
return $lt_(equot(quot$slquot(body))(l))
} 
} 
} 
} 
} 
} ;
if ($target.type === "cst/list") {
if ($target[0].type === "cons") {
if ($target[0][0].type === "cst/id") {
if ($target[0][0][0] === "@!") {
if ($target[0][1].type === "cons") {
let body = $target[0][1][0];
if ($target[0][1][1].type === "nil") {
let l = $target[1];
return $gt$gt$eq(parse_top(body))((top) => $lt_(equot(quot$sltop(top))(l)))
} 
} 
} 
} 
} 
} ;
if ($target.type === "cst/list") {
if ($target[0].type === "cons") {
if ($target[0][0].type === "cst/id") {
if ($target[0][0][0] === "@t") {
if ($target[0][1].type === "cons") {
let body = $target[0][1][0];
if ($target[0][1][1].type === "nil") {
let l = $target[1];
return $gt$gt$eq(parse_type(body))((body) => $lt_(equot(quot$sltype(body))(l)))
} 
} 
} 
} 
} 
} ;
if ($target.type === "cst/list") {
if ($target[0].type === "cons") {
if ($target[0][0].type === "cst/id") {
if ($target[0][0][0] === "@p") {
if ($target[0][1].type === "cons") {
let body = $target[0][1][0];
if ($target[0][1][1].type === "nil") {
let l = $target[1];
return $gt$gt$eq(parse_pat(body))((body) => $lt_(equot(quot$slpat(body))(l)))
} 
} 
} 
} 
} 
} ;
if ($target.type === "cst/list") {
if ($target[0].type === "cons") {
if ($target[0][0].type === "cst/id") {
if ($target[0][0][0] === "if") {
if ($target[0][1].type === "cons") {
let cond = $target[0][1][0];
if ($target[0][1][1].type === "cons") {
let yes = $target[0][1][1][0];
if ($target[0][1][1][1].type === "cons") {
let no = $target[0][1][1][1][0];
if ($target[0][1][1][1][1].type === "nil") {
let l = $target[1];
return $gt$gt$eq(parse_expr(cond))((cond) => $gt$gt$eq(parse_expr(yes))((yes) => $gt$gt$eq(parse_expr(no))((no) => $lt_(ematch(cond)(cons($co(pprim(pbool(true)(l))(l))(yes))(cons($co(pany(l))(no))(nil)))(l)))))
} 
} 
} 
} 
} 
} 
} 
} ;
if ($target.type === "cst/list") {
if ($target[0].type === "cons") {
if ($target[0][0].type === "cst/id") {
if ($target[0][0][0] === "fn") {
let ll = $target[0][0][1];
if ($target[0][1].type === "cons") {
let one = $target[0][1][0];
if ($target[0][1][1].type === "nil") {
let l = $target[1];
return $gt$gt$eq(parse_expr(one))((body) => $lt_(elambda(cons(pany(ll))(nil))(body)(l)))
} 
} 
} 
} 
} 
} ;
if ($target.type === "cst/list") {
if ($target[0].type === "cons") {
if ($target[0][0].type === "cst/id") {
if ($target[0][0][0] === "fn") {
let ll = $target[0][0][1];
if ($target[0][1].type === "cons") {
if ($target[0][1][0].type === "cst/array") {
let args = $target[0][1][0][0];
let rest = $target[0][1][1];
let b = $target[1];
return $gt$gt$eq(map_$gt(parse_pat)(args))((args) => $gt$gt$eq(parse_one_expr(rest)(ll)(b))((body) => $lt_(elambda(args)(body)(b))))
} 
} 
} 
} 
} 
} ;
if ($target.type === "cst/list") {
if ($target[0].type === "cons") {
if ($target[0][0].type === "cst/id") {
if ($target[0][0][0] === "fn") {
let l = $target[1];
return $lt_err($co(l)(`Invalid 'fn' ${int_to_string(l)}`))(evar("()")(l))
} 
} 
} 
} ;
if ($target.type === "cst/list") {
if ($target[0].type === "cons") {
if ($target[0][0].type === "cst/id") {
if ($target[0][0][0] === "provide") {
let ml = $target[0][0][1];
if ($target[0][1].type === "cons") {
let target = $target[0][1][0];
let cases = $target[0][1][1];
let l = $target[1];
return parse_provide(parse_expr)(target)(ml)(cases)(l)
} 
} 
} 
} 
} ;
if ($target.type === "cst/list") {
if ($target[0].type === "cons") {
if ($target[0][0].type === "cst/id") {
if ($target[0][0][0] === "match") {
let ml = $target[0][0][1];
if ($target[0][1].type === "cons") {
let target = $target[0][1][0];
let cases = $target[0][1][1];
let l = $target[1];
return $gt$gt$eq(parse_expr(target))((target) => $gt$gt$eq($lt_(pairs_plus(cst$slid("()")(ml))(cases)))((cases) => $gt$gt$eq(map_$gt(({"1": expr, "0": pat}) => $gt$gt$eq(parse_pat(pat))((pat) => $gt$gt$eq(parse_expr(expr))((expr) => $lt_($co(pat)(expr)))))(cases))((cases) => $lt_(ematch(target)(cases)(l)))))
} 
} 
} 
} 
} ;
if ($target.type === "cst/list") {
if ($target[0].type === "cons") {
if ($target[0][0].type === "cst/id") {
if ($target[0][0][0] === "let") {
let ll = $target[0][0][1];
if ($target[0][1].type === "cons") {
if ($target[0][1][0].type === "cst/array") {
let inits = $target[0][1][0][0];
let rest = $target[0][1][1];
let l = $target[1];
return $gt$gt$eq(pairs(inits))((inits) => $gt$gt$eq(map_$gt(({"1": value, "0": pat}) => $gt$gt$eq(parse_pat(pat))((pat) => $gt$gt$eq(parse_expr(value))((value) => $lt_($co(pat)(value)))))(inits))((bindings) => $gt$gt$eq(parse_one_expr(rest)(ll)(l))((body) => $lt_(elet(bindings)(body)(l)))))
} 
} 
} 
} 
} 
} ;
if ($target.type === "cst/list") {
if ($target[0].type === "cons") {
if ($target[0][0].type === "cst/id") {
if ($target[0][0][0] === "let->") {
let el = $target[0][0][1];
if ($target[0][1].type === "cons") {
if ($target[0][1][0].type === "cst/array") {
let inits = $target[0][1][0][0];
if ($target[0][1][1].type === "cons") {
let body = $target[0][1][1][0];
if ($target[0][1][1][1].type === "nil") {
let l = $target[1];
return $gt$gt$eq(parse_expr(body))((body) => $gt$gt$eq(pairs(inits))((inits) => foldr_$gt(body)(inits)((body) => ({"1": value, "0": pat}) => $gt$gt$eq(parse_expr(value))((value) => $gt$gt$eq(parse_pat(pat))((pat) => $lt_(eapp(evar(">>=")(el))(cons(value)(cons(elambda(cons(pat)(nil))(body)(l))(nil)))(l)))))))
} 
} 
} 
} 
} 
} 
} 
} ;
if ($target.type === "cst/list") {
if ($target[0].type === "cons") {
if ($target[0][0].type === "cst/id") {
if ($target[0][0][0] === "let") {
let l = $target[1];
return $lt_err($co(l)(`Invalid 'let' ${int_to_string(l)}`))(evar("()")(l))
} 
} 
} 
} ;
if ($target.type === "cst/list") {
if ($target[0].type === "cons") {
if ($target[0][0].type === "cst/id") {
if ($target[0][0][0] === ",") {
let il = $target[0][0][1];
let args = $target[0][1];
let l = $target[1];
return parse_tuple(args)(il)(l)
} 
} 
} 
} ;
if ($target.type === "cst/list") {
if ($target[0].type === "nil") {
let l = $target[1];
return $lt_(evar("()")(l))
} 
} ;
if ($target.type === "cst/list") {
if ($target[0].type === "cons") {
let target = $target[0][0];
let args = $target[0][1];
let l = $target[1];
{
let $target = (($target) => {
if ($target.type === "cst/id") {
let id = $target[0];
{
let $target = or(is_bang(id))(is_arrow(id));
if ($target === true) {
return some(left(id))
} ;
return map_opt(parse_tag(id))(right);
throw new Error('match fail 31323:' + JSON.stringify($target))
}
} ;
return none;
throw new Error('match fail 21697:' + JSON.stringify($target))
})(target);
if ($target.type === "some") {
if ($target[0].type === "left") {
let effect = $target[0][0];
return $gt$gt$eq(map_$gt(parse_expr)(args))((args) => $lt_(eeffect(effect)(some(args))(l)))
} 
} ;
if ($target.type === "some") {
if ($target[0].type === "right") {
let tag = $target[0][0];
return $gt$gt$eq(map_$gt(parse_expr)(args))((args) => $lt_(eenum(tag)(cst_loc(target))(some(loop(args)((args) => (recur) => (($target) => {
if ($target.type === "nil") {
return fatal("empty tag args")
} ;
if ($target.type === "cons") {
let one = $target[0];
if ($target[1].type === "nil") {
return one
} 
} ;
if ($target.type === "cons") {
let one = $target[0];
let rest = $target[1];
return eapp(evar(",")(l))(cons(one)(cons(recur(rest))(nil)))(l)
} ;
throw new Error('match fail 21744:' + JSON.stringify($target))
})(args))))(l)))
} 
} ;
return $gt$gt$eq(parse_expr(target))((target) => $gt$gt$eq(map_$gt(parse_expr)(args))((args) => $lt_(eapp(target)((($target) => {
if ($target.type === "nil") {
return cons(evar("()")(l))(nil)
} ;
return args;
throw new Error('match fail 32311:' + JSON.stringify($target))
})(args))(l))));
throw new Error('match fail 21695:' + JSON.stringify($target))
}
} 
} ;
if ($target.type === "cst/array") {
let args = $target[0];
let l = $target[1];
return parse_array(args)(l)
} ;
if ($target.type === "cst/access") {
let target = $target[0];
let items = $target[1];
let l = $target[2];
return $lt_(eaccess(target)(items)(l))
} ;
if ($target.type === "cst/record") {
let items = $target[0];
let l = $target[1];
return $gt$gt$eq((($target) => {
if ($target.type === "cons") {
if ($target[0].type === "cst/spread") {
let inner = $target[0][0];
let l = $target[0][1];
let rest = $target[1];
return $gt$gt$eq(parse_expr(inner))((inner) => $lt_($co(some(inner))(rest)))
} 
} ;
return $lt_($co(none)(items));
throw new Error('match fail 21571:' + JSON.stringify($target))
})(items))(({"1": items, "0": spread}) => $gt$gt$eq(loop($co(items)(nil))(({"1": col, "0": items}) => (recur) => (($target) => {
if ($target.type === "nil") {
return $lt_($co(col)(none))
} ;
if ($target.type === "cons") {
if ($target[0].type === "cst/spread") {
let inner = $target[0][0];
let l = $target[0][1];
if ($target[1].type === "nil") {
return $gt$gt$eq(parse_expr(inner))((inner) => $lt_($co(col)(some(inner))))
} 
} 
} ;
if ($target.type === "cons") {
let item = $target[0];
if ($target[1].type === "nil") {
return $lt_err($co(cst_loc(item))("Trailing record item"))($co(col)(none))
} 
} ;
if ($target.type === "cons") {
if ($target[0].type === "cst/id") {
let id = $target[0][0];
let l = $target[0][1];
if ($target[1].type === "cons") {
let two = $target[1][0];
let rest = $target[1][1];
return $gt$gt$eq(parse_expr(two))((value) => recur($co(rest)(cons($co(id)(value))(col))))
} 
} 
} ;
if ($target.type === "cons") {
let key = $target[0];
if ($target[1].type === "cons") {
let rest = $target[1][1];
return $gt$gt$eq(recur($co(rest)(col)))((res) => $lt_err($co(cst_loc(key))("Not an identifier"))(res))
} 
} ;
throw new Error('match fail 22154:' + JSON.stringify($target))
})(items)))(({"1": sprend, "0": items}) => $gt$gt$eq((($target) => {
if ($target.type === ",") {
if ($target[0].type === "some") {
if ($target[1].type === "some") {
return $lt_err($co(l)("Cant have spreads on both sides"))(none)
} 
} 
} ;
if ($target.type === ",") {
if ($target[0].type === "some") {
let s = $target[0][0];
return $lt_(some($co(s)(false)))
} 
} ;
if ($target.type === ",") {
if ($target[1].type === "some") {
let s = $target[1][0];
return $lt_(some($co(s)(true)))
} 
} ;
return $lt_(none);
throw new Error('match fail 22287:' + JSON.stringify($target))
})($co(spread)(sprend)))((spread) => $lt_(erecord(spread)(rev(items)(nil))(l)))))
} ;
return $lt_err($co(cst_loc(cst))("Unable to parse"))(evar("()")(cst_loc(cst)));
throw new Error('match fail 963:' + JSON.stringify($target))
})(cst)

let parse_one_expr = (rest) => (ll) => (l) => (($target) => {
if ($target.type === "cons") {
let body = $target[0];
let rest = $target[1];
return $gt$gt$eq(do_$gt(unexpected("extra item body"))(rest))((_18918) => parse_expr(body))
} ;
if ($target.type === "nil") {
return $lt_err($co(ll)("Missing body"))(evar("()")(l))
} ;
throw new Error('match fail 18909:' + JSON.stringify($target))
})(rest)

let parse_tuple = (args) => (il) => (l) => (($target) => {
if ($target.type === "nil") {
return $lt_(evar(",")(il))
} ;
if ($target.type === "cons") {
let one = $target[0];
if ($target[1].type === "nil") {
return parse_expr(one)
} 
} ;
if ($target.type === "cons") {
let one = $target[0];
let rest = $target[1];
return $gt$gt$eq(parse_expr(one))((one) => $gt$gt$eq(parse_tuple(rest)(il)(l))((tuple) => $lt_(eapp(evar(",")(il))(cons(one)(cons(tuple)(nil)))(l))))
} ;
throw new Error('match fail 7570:' + JSON.stringify($target))
})(args)

let parse_array = (args) => (l) => (($target) => {
if ($target.type === "nil") {
return $lt_(evar("nil")(l))
} ;
if ($target.type === "cons") {
if ($target[0].type === "cst/spread") {
let inner = $target[0][0];
if ($target[1].type === "nil") {
return parse_expr(inner)
} 
} 
} ;
if ($target.type === "cons") {
let one = $target[0];
let rest = $target[1];
return $gt$gt$eq(parse_expr(one))((one) => $gt$gt$eq(parse_array(rest)(l))((rest) => $lt_(eapp(evar("cons")(l))(cons(one)(cons(rest)(nil)))(l))))
} ;
throw new Error('match fail 3422:' + JSON.stringify($target))
})(args)
let compile$slj = (expr) => (trace) => maybe_trace(expr_loc(expr))(trace)((($target) => {
if ($target.type === "estr") {
let first = $target[0];
let tpls = $target[1];
let l = $target[2];
return j$slstr(first)(map(tpls)(({"1": {"1": l, "0": suffix}, "0": expr}) => $co(compile$slj(expr)(trace))($co(suffix)(l))))(l)
} ;
if ($target.type === "eprim") {
let prim = $target[0];
let l = $target[1];
return compile_prim$slj(prim)(l)
} ;
if ($target.type === "evar") {
let name = $target[0];
let l = $target[1];
return j$slvar(sanitize(name))(l)
} ;
if ($target.type === "equot") {
let inner = $target[0];
let l = $target[1];
return j$slraw(quot$sljsonify(inner))(l)
} ;
if ($target.type === "eeffect") {
let name = $target[0];
if ($target[1].type === "none") {
let l = $target[2];
return j$slindex(j$slvar("\$lbeffects\$rb")(l))(j$slstr(name)(nil)(l))(l)
} 
} ;
if ($target.type === "eeffect") {
let name = $target[0];
if ($target[1].type === "some") {
let args = $target[1][0];
let l = $target[2];
return fatal("effect compile not yet")
} 
} ;
if ($target.type === "eprovide") {
let target = $target[0];
let handlers = $target[1];
let l = $target[2];
return j$slapp(j$sllambda(cons(j$slpvar("\$lbeffects\$rb")(l))(nil))(right(compile$slj(target)(trace)))(l))(cons(j$slobj(cons(right(j$slspread(j$slvar("\$lbeffects\$rb")(l))))(map(handlers)(({"1": {"1": {"1": body, "0": kind}, "0": nl}, "0": name}) => (($target) => {
if ($target.type === "eearmuffs") {
return left($co(name)(compile$slj(body)(trace)))
} ;
return fatal("cant compile real effects handlers just yet");
throw new Error('match fail 23542:' + JSON.stringify($target))
})(kind))))(l))(nil))(l)
} ;
if ($target.type === "elambda") {
let pats = $target[0];
let body = $target[1];
let l = $target[2];
return foldr(compile$slj(body)(trace))(pats)((body) => (pat) => j$sllambda(cons((($target) => {
if ($target.type === "none") {
return j$slpvar(`_${its(l)}`)(l)
} ;
if ($target.type === "some") {
let pat = $target[0];
return pat
} ;
throw new Error('match fail 12186:' + JSON.stringify($target))
})(pat_$gtj$slpat(pat)))(cons(j$slpvar("\$lbeffects\$rb")(l))(nil)))((($target) => {
if ($target.type === "nil") {
return right(body)
} ;
{
let stmts = $target;
return left(j$slblock(concat(cons(stmts)(cons(cons(j$slreturn(body)(l))(nil))(nil)))))
};
throw new Error('match fail 16318:' + JSON.stringify($target))
})(trace_pat(pat)(trace)))(l))
} ;
if ($target.type === "elet") {
let bindings = $target[0];
let body = $target[1];
let l = $target[2];
return compile_let$slj(body)(trace)(bindings)(l)
} ;
if ($target.type === "eapp") {
if ($target[0].type === "evar") {
let op = $target[0][0];
let ol = $target[0][1];
if ($target[1].type === "cons") {
let one = $target[1][0];
if ($target[1][1].type === "cons") {
let two = $target[1][1][0];
if ($target[1][1][1].type === "nil") {
let l = $target[2];
{
let $target = is_bop(op);
if ($target === true) {
return j$slbin(op)(compile$slj(one)(trace))(compile$slj(two)(trace))(l)
} ;
return app$slj(evar(op)(ol))(cons(one)(cons(two)(nil)))(trace)(l);
throw new Error('match fail 12659:' + JSON.stringify($target))
}
} 
} 
} 
} 
} ;
if ($target.type === "eapp") {
let target = $target[0];
let args = $target[1];
let l = $target[2];
return app$slj(target)(args)(trace)(l)
} ;
if ($target.type === "eaccess") {
let target = $target[0];
let items = $target[1];
let l = $target[2];
{
let make = (target) => foldl(target)(items)((target) => ({"1": nl, "0": name}) => j$slattr(target)(name)(nl));
{
let $target = target;
if ($target.type === "some") {
if ($target[0].type === ",") {
let t = $target[0][0];
let nl = $target[0][1];
return make(j$slvar(sanitize(t))(nl))
} 
} ;
if ($target.type === "none") {
return j$sllambda(cons(j$slpvar("\$target")(l))(nil))(right(make(j$slvar("\$target")(l))))(l)
} ;
throw new Error('match fail 20623:' + JSON.stringify($target))
}
}
} ;
if ($target.type === "erecord") {
let spread = $target[0];
let fields = $target[1];
let l = $target[2];
{
let fields$$0 = fields;
{
let fields = map(fields$$0)(({"1": value, "0": name}) => left($co(name)(compile$slj(value)(trace))));
return j$slobj((($target) => {
if ($target.type === "none") {
return fields
} ;
if ($target.type === "some") {
if ($target[0].type === ",") {
let s = $target[0][0];
return cons(right(j$slspread(compile$slj(s)(trace))))(fields)
} 
} ;
throw new Error('match fail 20685:' + JSON.stringify($target))
})(spread))(l)
}
}
} ;
if ($target.type === "eenum") {
let name = $target[0];
let nl = $target[1];
let arg = $target[2];
let l = $target[3];
{
let $target = arg;
if ($target.type === "none") {
return j$slstr(name)(nil)(nl)
} ;
if ($target.type === "some") {
let arg = $target[0];
return j$slobj(cons(left($co("tag")(j$slstr(name)(nil)(nl))))(cons(left($co("arg")(compile$slj(arg)(trace))))(nil)))(l)
} ;
throw new Error('match fail 20618:' + JSON.stringify($target))
}
} ;
if ($target.type === "ematch") {
let target = $target[0];
let cases = $target[1];
let l = $target[2];
return j$slapp(j$sllambda(cons(j$slpvar("\$target")(l))(nil))(left(j$slblock(concat(cons(map(cases)(({"1": body, "0": pat}) => j$slsblock(j$slblock(compile_pat$slj(pat)(j$slvar("\$target")(l))(concat(cons(trace_pat(pat)(trace))(cons(cons(j$slreturn(compile$slj(body)(trace))(l))(nil))(nil))))(trace)))(l)))(cons(cons(j$slthrow(j$slraw(`new Error('match fail ${its(l)}:' + JSON.stringify(\$target))`)(0))(0))(nil))(nil))))))(l))(cons(compile$slj(target)(trace))(nil))(l)
} ;
throw new Error('match fail 11496:' + JSON.stringify($target))
})(expr))

let compile_let$slj = (body) => (trace) => (bindings) => (l) => foldr(compile$slj(body)(trace))(expand_bindings(bindings)(l))((body) => (binding) => j$slapp(j$sllambda(nil)(left(j$slblock(concat(cons(cons(compile_let_binding$slj(binding)(trace)(l))(nil))(cons(trace_pat(fst(binding))(trace))(cons(cons(j$slreturn(body)(l))(nil))(nil)))))))(l))(nil)(l))

let app$slj = (target) => (args) => (trace) => (l) => foldl(compile$slj(target)(trace))(args)((target) => (arg) => j$slapp(target)(cons(compile$slj(arg)(trace))(cons(j$slvar("\$lbeffects\$rb")(l))(nil)))(l))

let compile_let_binding$slj = ({"1": init, "0": pat}) => (trace) => (l) => (($target) => {
if ($target.type === "none") {
return j$slsexpr(compile$slj(init)(trace))(l)
} ;
if ($target.type === "some") {
let pat = $target[0];
return j$sllet(pat)(compile$slj(init)(trace))(l)
} ;
throw new Error('match fail 12356:' + JSON.stringify($target))
})(pat_$gtj$slpat(pat))
let cps$slj3 = (trace) => (idx) => (expr) => {
let nidx = 1 + idx;
{
let $target = expr;
if ($target.type === "evar") {
let n = $target[0];
let l = $target[1];
return left(j$slvar(sanitize(n))(l))
} ;
if ($target.type === "equot") {
let inner = $target[0];
let l = $target[1];
return left(j$slraw(`(${quot$sljsonify(inner)})`)(l))
} ;
if ($target.type === "eprim") {
if ($target[0].type === "pint") {
let n = $target[0][0];
let l = $target[0][1];
return left(j$slprim(j$slint(n)(l))(l))
} 
} ;
if ($target.type === "eprim") {
if ($target[0].type === "pbool") {
let b = $target[0][0];
let l = $target[0][1];
return left(j$slprim(j$slbool(b)(l))(l))
} 
} ;
if ($target.type === "eapp") {
let target = $target[0];
if ($target[1].type === "nil") {
let l = $target[2];
return cps$slj3(trace)(nidx)(target)
} 
} ;
if ($target.type === "eapp") {
let target = $target[0];
let args = $target[1];
let l = $target[2];
return go2(l)($gt$gt$eq($lt_lr(nidx)(l)(cps$slj3(trace)(nidx)(target)))((target) => $gt$gt$eq(loop($co(1 + nidx)(rev(args)(nil)))(({"1": args, "0": nidx}) => (recur) => (($target) => {
if ($target.type === "nil") {
return $lt_($co(nidx)(nil))
} ;
if ($target.type === "cons") {
let one = $target[0];
let rest = $target[1];
return $gt$gt$eq($lt_lr(nidx)(l)(cps$slj3(trace)(100 + nidx)(one)))((item) => $gt$gt$eq(recur($co(1 + nidx)(rest)))(({"1": rest, "0": nidx}) => $lt_($co(2 + nidx)(cons(item)(rest)))))
} ;
throw new Error('match fail 34054:' + JSON.stringify($target))
})(args)))(({"1": args, "0": nidx}) => $lt_r(right((done) => loop($co(rev(args)(nil))(target))(({"1": target, "0": args}) => (recur) => (($target) => {
if ($target.type === "nil") {
return fatal("no args")
} ;
if ($target.type === "cons") {
let one = $target[0];
if ($target[1].type === "nil") {
return j$slapp(target)(cons(one)(cons(j$slvar(efvbl)(l))(cons(done)(nil))))(l)
} 
} ;
if ($target.type === "cons") {
let one = $target[0];
let rest = $target[1];
return j$slapp(target)(cons(one)(cons(j$slvar(efvbl)(l))(cons(j$sllambda(cons(j$slpvar("\$t")(l))(cons(j$slpvar(efvbl)(l))(nil)))(right(recur($co(rest)(j$slvar("\$t")(l)))))(l))(nil))))(l)
} ;
throw new Error('match fail 31936:' + JSON.stringify($target))
})(args)))))))
} ;
if ($target.type === "elambda") {
if ($target[0].type === "nil") {
let l = $target[2];
return fatal("no empty lambda args")
} 
} ;
if ($target.type === "elambda") {
if ($target[0].type === "cons") {
let arg = $target[0][0];
if ($target[0][1].type === "nil") {
let body = $target[1];
let l = $target[2];
return left(j$sllambda(cons(opt_or(pat_$gtj$slpat(arg))(j$slpvar("\$_arg")(l)))(cons(j$slpvar(efvbl)(l))(cons(j$slpvar("\$done")(l))(nil))))(right((($target) => {
if ($target.type === "left") {
let body = $target[0];
return j$slapp(j$slvar("\$done")(l))(cons(body)(cons(j$slvar(efvbl)(l))(nil)))(l)
} ;
if ($target.type === "right") {
let body = $target[0];
return body(j$slvar("\$done")(l))
} ;
throw new Error('match fail 25895:' + JSON.stringify($target))
})(cps$slj3(trace)(nidx)(body))))(l))
} 
} 
} ;
if ($target.type === "elambda") {
if ($target[0].type === "cons") {
let arg = $target[0][0];
let rest = $target[0][1];
let body = $target[1];
let l = $target[2];
return cps$slj3(trace)(nidx)(elambda(cons(arg)(nil))(elambda(rest)(body)(l))(l))
} 
} ;
if ($target.type === "eaccess") {
if ($target[0].type === "some") {
if ($target[0][0].type === ",") {
let target = $target[0][0][0];
if ($target[1].type === "cons") {
if ($target[1][0].type === ",") {
let name = $target[1][0][0];
if ($target[1][1].type === "nil") {
let l = $target[2];
return left(j$slindex(j$slvar(target)(l))(j$slstr(name)(nil)(l))(l))
} 
} 
} 
} 
} 
} ;
if ($target.type === "eaccess") {
if ($target[0].type === "none") {
if ($target[1].type === "cons") {
if ($target[1][0].type === ",") {
let name = $target[1][0][0];
if ($target[1][1].type === "nil") {
let l = $target[2];
return left(j$sllambda(cons(j$slpvar("target")(l))(cons(j$slpvar(efvbl)(l))(cons(j$slpvar("done")(l))(nil))))(right(j$slapp(j$slvar("done")(l))(cons(j$slindex(j$slvar("target")(l))(j$slstr(name)(nil)(l))(l))(cons(j$slvar(efvbl)(l))(nil)))(l)))(l))
} 
} 
} 
} 
} ;
if ($target.type === "estr") {
let prefix = $target[0];
let items = $target[1];
let l = $target[2];
return go2(l)($gt$gt$eq(map_$gt(({"1": suffix, "0": expr}) => $gt$gt$eq($lt_lr(nidx)(l)(cps$slj3(trace)(nidx)(expr)))((expr) => $lt_($co(expr)(suffix))))(items))((items) => $lt_(left(j$slstr(prefix)(items)(l)))))
} ;
if ($target.type === "eeffect") {
let name = $target[0];
if ($target[1].type === "none") {
let l = $target[2];
return right((done) => j$slapp(done)(cons(resolve_effect(l)(name))(cons(j$slvar(efvbl)(l))(nil)))(l))
} 
} ;
if ($target.type === "eeffect") {
let name = $target[0];
if ($target[1].type === "some") {
let args = $target[1][0];
let l = $target[2];
return go2(l)($gt$gt$eq(map_$gt((x) => $gt$gt$eq($lt_lr(nidx)(l)(cps$slj3(trace)(nidx)(x)))((v) => $lt_(v)))(args))((args) => {
let tuple = loop(args)((args) => (recur) => (($target) => {
if ($target.type === "nil") {
return j$slvar("\$unit")(l)
} ;
if ($target.type === "cons") {
let one = $target[0];
if ($target[1].type === "nil") {
return one
} 
} ;
if ($target.type === "cons") {
let one = $target[0];
let rest = $target[1];
return j$slobj(cons(left($co("type")(j$slstr(",")(nil)(l))))(cons(left($co("0")(one)))(cons(left($co("1")(recur(rest))))(nil))))(l)
} ;
throw new Error('match fail 31280:' + JSON.stringify($target))
})(args));
return $lt_(right((done) => j$slapp(resolve_effect(l)(name))(cons(done)(cons(tuple)(cons(j$slvar(efvbl)(l))(nil))))(l)))
}))
} 
} ;
if ($target.type === "erecord") {
let spread = $target[0];
let fields = $target[1];
let l = $target[2];
return go2(l)($gt$gt$eq(map_$gt(({"1": value, "0": name}) => $gt$gt$eq($lt_lr(nidx)(l)(cps$slj3(trace)(nidx)(value)))((v) => $lt_(left($co(name)(v)))))(fields))((fields) => $gt$gt$eq((($target) => {
if ($target.type === "none") {
return $lt_(none)
} ;
if ($target.type === "some") {
if ($target[0].type === ",") {
let s = $target[0][0];
return $lt_lrt(nidx)(some)(l)(cps$slj3(trace)(nidx)(s))
} 
} ;
throw new Error('match fail 27149:' + JSON.stringify($target))
})(spread))((spread) => $lt_(left(j$slobj((($target) => {
if ($target.type === "none") {
return fields
} ;
if ($target.type === "some") {
let s = $target[0];
return cons(right(j$slspread(s)))(fields)
} ;
throw new Error('match fail 27103:' + JSON.stringify($target))
})(spread))(l))))))
} ;
if ($target.type === "eenum") {
let name = $target[0];
let nl = $target[1];
let arg = $target[2];
let l = $target[3];
{
let $target = arg;
if ($target.type === "none") {
return left(j$slstr(name)(nil)(nl))
} ;
if ($target.type === "some") {
let arg = $target[0];
return go2(l)($gt$gt$eq($lt_lr(nidx)(l)(cps$slj3(trace)(nidx)(arg)))((arg) => $lt_(left(j$slobj(cons(left($co("tag")(j$slstr(name)(nil)(nl))))(cons(left($co("arg")(arg)))(nil)))(l)))))
} ;
throw new Error('match fail 27743:' + JSON.stringify($target))
}
} ;
if ($target.type === "eprovide") {
let target = $target[0];
let handlers = $target[1];
let l = $target[2];
return cps$slprovide(idx)(l)(trace)(handlers)(target)
} ;
if ($target.type === "elet") {
if ($target[0].type === "cons") {
if ($target[0][0].type === ",") {
let pat = $target[0][0][0];
let expr = $target[0][0][1];
if ($target[0][1].type === "nil") {
let body = $target[1];
let l = $target[2];
return go2(l)($gt$gt$eq($lt_lr(nidx)(l)(cps$slj3(trace)(nidx)(expr)))((value) => $lt_(right((done) => j$slapp(j$sllambda(cons(opt_or(pat_$gtj$slpat(pat))(j$slpvar("\$_arg")(l)))(nil))(right((($target) => {
if ($target.type === "left") {
let body = $target[0];
return j$slapp(done)(cons(body)(cons(j$slvar(efvbl)(l))(nil)))(l)
} ;
if ($target.type === "right") {
let body = $target[0];
return body(done)
} ;
throw new Error('match fail 28188:' + JSON.stringify($target))
})(go2(l)($gt$gt$eq($lt_lr(nidx)(l)(cps$slj3(trace)(nidx)(body)))((body) => $lt_(left(body)))))))(l))(cons(value)(nil))(l)))))
} 
} 
} 
} ;
if ($target.type === "elet") {
let bindings = $target[0];
let body = $target[1];
let l = $target[2];
{
let bindings$$0 = bindings;
{
let bindings = expand_bindings(bindings$$0)(l);
return cps$slj3(trace)(nidx)(foldr(body)(bindings)((body) => (binding) => elet(cons(binding)(nil))(body)(l)))
}
}
} ;
if ($target.type === "ematch") {
let target = $target[0];
let cases = $target[1];
let l = $target[2];
return go2(l)($gt$gt$eq($lt_lr(nidx)(l)(cps$slj3(trace)(nidx)(target)))((target) => $lt_(right((done) => j$slapp(j$sllambda(cons(j$slpvar("\$target")(l))(nil))(left(j$slblock(map(cases)(({"1": body, "0": pat}) => compile_pat(pat)(j$slvar("\$target")(l))(j$slreturn((($target) => {
if ($target.type === "left") {
let b = $target[0];
return j$slapp(done)(cons(b)(cons(j$slvar(efvbl)(l))(nil)))(l)
} ;
if ($target.type === "right") {
let b = $target[0];
return b(done)
} ;
throw new Error('match fail 29587:' + JSON.stringify($target))
})(cps$slj3(trace)(nidx)(body)))(l))(l)))))(l))(cons(target)(nil))(l)))))
} ;
return fatal(`no cps ${jsonify(expr)}`);
throw new Error('match fail 25755:' + JSON.stringify($target))
}
}

let cps$slprovide = (idx) => (l) => (trace) => (handlers) => (target) => {
let idx$$0 = idx;
{
let idx = 1 + idx$$0;
{
let dn = `done\$${its(idx)}`;
{
let self = `self\$${its(idx)}`;
return right((done) => iffe(cons(j$sllet(jpv(self))(j$slraw("null")(l))(l))(cons(j$sllet(j$slpvar(dn)(l))(j$sllambda(cons(jpv("arg"))(cons(jpv("ef"))(nil)))(right(j$slapp(done)(cons(jv("arg"))(cons(j$slraw(`ef?.filter(m => m !== ${self})`)(l))(nil)))(l)))(l))(-1))(cons((($target) => {
if ($target.type === "left") {
let v = $target[0];
return j$slreturn(v)(l)
} ;
if ($target.type === "right") {
let v = $target[0];
return fatal("is this provide a fn?")
} ;
throw new Error('match fail 36534:' + JSON.stringify($target))
})(go2(l)($gt$gt$eq($lt_lr(idx)(l)(cps$sleffects2(trace)(l)(handlers)(idx)(self)(dn)))((effects) => $lt_(left(j$slapp(j$sllambda(cons(j$slpvar(efvbl)(l))(nil))(right((($target) => {
if ($target.type === "left") {
let body = $target[0];
return j$slapp(j$slvar(dn)(l))(cons(body)(cons(j$slvar(efvbl)(l))(nil)))(l)
} ;
if ($target.type === "right") {
let body = $target[0];
return body(j$slvar(dn)(l))
} ;
throw new Error('match fail 36569:' + JSON.stringify($target))
})(cps$slj3(trace)(idx)(target))))(l))(cons(effects)(nil))(l)))))))(nil)))))
}
}
}
}

let cps$sleffects2 = (trace) => (l) => (handlers) => (nidx) => (save_name) => (done) => go2(l)($gt$gt$eq(map_$gt(({"1": {"1": {"1": body, "0": kind}, "0": nl}, "0": name}) => $gt$gt$eq((($target) => {
if ($target.type === "eearmuffs") {
return $lt_lr(nidx)(l)(cps$slj3(trace)(nidx)(body))
} ;
if ($target.type === "ebang") {
let pats = $target[0];
return $lt_lr(nidx)(l)(left(j$sllambda(cons(j$slpvar("\$_ignored_done")(l))(cons(pats_tuple(pats)(l))(cons(j$slpvar(efvbl)(l))(nil))))(left(j$slblock(cons(j$sllet(j$slpvar("done")(l))(j$sllambda(cons(jpv("val"))(cons(jpv("ef"))(nil)))(right(j$slapp(j$slvar(done)(l))(cons(jv("val"))(cons(j$slraw(`ef.slice(0, ef.indexOf(${save_name}))`)(l))(nil)))(l)))(l))(l))(cons(j$slsexpr((($target) => {
if ($target.type === "left") {
let body = $target[0];
return j$slapp(j$slvar("done")(l))(cons(body)(cons(j$slvar(efvbl)(l))(nil)))(l)
} ;
if ($target.type === "right") {
let body = $target[0];
return body(j$slvar("done")(l))
} ;
throw new Error('match fail 35450:' + JSON.stringify($target))
})(cps$slj3(trace)(nidx)(body)))(l))(cons(j$slreturn(j$slraw("function noop() {return noop}")(l))(l))(nil))))))(l)))
} ;
if ($target.type === "eeffectful") {
let k = $target[0];
let kl = $target[1];
let pats = $target[2];
return cps$sleffectful(nidx)(l)(kl)(pats)(done)(k)(save_name)(trace)(body)
} ;
throw new Error('match fail 35352:' + JSON.stringify($target))
})(kind))((value) => $lt_(left($co(name)(value)))))(handlers))((fields) => $lt_(left(push_handlers(l)(j$slvar(efvbl)(l))(save_name)(j$slassign(save_name)("=")(j$slobj(fields)(l))(l))))))

let cps$sleffectful = (nidx) => (l) => (kl) => (pats) => (done) => (k) => (save_name) => (trace) => (body) => $lt_lr(nidx)(l)(left(j$sllambda(cons(j$slpvar("\$lbk\$rb")(kl))(cons(pats_tuple(pats)(l))(cons(j$slpvar("k\$lbeffects\$rb")(kl))(nil))))((() => {
let sdone = `\$save_done${int_to_string(nidx)}`;
return left(j$slblock(cons(j$sllet(j$slpvar("good_and_done")(l))(j$slvar(done)(kl))(kl))(cons(j$sllet(j$slpvar(sdone)(l))(j$sllambda(cons(jpv("val"))(cons(jpv("ef"))(nil)))(right(j$slapp(jv("good_and_done"))(cons(jv("val"))(cons(j$slraw(`ef?.slice(0, ef.indexOf(${save_name}))`)(l))(nil)))(l)))(l))(kl))(cons(j$sllet(j$slpvar(sanitize(k))(kl))(j$sllambda(cons(j$slpvar("value")(kl))(cons(j$slpvar("effects")(kl))(cons(j$slpvar("after_k")(kl))(nil))))(left(j$slblock(cons(j$slsexpr(j$slassign(done)("=")(j$slvar("after_k")(kl))(kl))(kl))(cons(j$slreturn(j$slapp(j$slvar("\$lbk\$rb")(kl))(cons(j$slvar("value")(kl))(cons(rebase_handlers(kl)(j$slvar("k\$lbeffects\$rb")(kl))(j$slvar("effects")(kl))(save_name))(nil)))(kl))(l))(nil)))))(kl))(kl))(cons(j$slsexpr((($target) => {
if ($target.type === "left") {
let body = $target[0];
return j$slapp(j$slvar(sdone)(l))(cons(body)(cons(j$slvar(efvbl)(l))(nil)))(l)
} ;
if ($target.type === "right") {
let body = $target[0];
return body(j$slvar(sdone)(l))
} ;
throw new Error('match fail 35641:' + JSON.stringify($target))
})(cps$slj3(trace)(nidx)(body)))(l))(cons(j$slreturn(j$slraw("function noop() {return noop}")(l))(l))(nil)))))))
})())(l)))
let run$slj = (v) => $eval(`((\$lbeffects\$rb) => ${j$slcompile(0)(compile$slj(run$slnil_$gt(parse_expr(v)))(map$slnil))})({})`)
let example_expr = run$slnil_$gt(parse_expr({"0":{"0":{"0":"match","1":12702,"type":"cst/id"},"1":{"0":{"0":"stmt","1":12703,"type":"cst/id"},"1":{"0":{"0":{"0":{"0":"sexpr","1":12705,"type":"cst/id"},"1":{"0":{"0":"expr","1":12706,"type":"cst/id"},"1":{"0":{"0":"l","1":12707,"type":"cst/id"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"type":"cons"},"1":12704,"type":"cst/list"},"1":{"0":{"0":{"0":{"0":"compile","1":12709,"type":"cst/id"},"1":{"0":{"0":"expr","1":12710,"type":"cst/id"},"1":{"0":{"0":"trace","1":12711,"type":"cst/id"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"type":"cons"},"1":12708,"type":"cst/list"},"1":{"0":{"0":{"0":{"0":"sdef","1":12713,"type":"cst/id"},"1":{"0":{"0":"name","1":12714,"type":"cst/id"},"1":{"0":{"0":"nl","1":12715,"type":"cst/id"},"1":{"0":{"0":"body","1":12716,"type":"cst/id"},"1":{"0":{"0":"l","1":12717,"type":"cst/id"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"type":"cons"},"type":"cons"},"type":"cons"},"1":12712,"type":"cst/list"},"1":{"0":{"0":{"0":{"0":"++","1":12719,"type":"cst/id"},"1":{"0":{"0":{"0":{"0":"const ","1":{"type":"nil"},"2":12721,"type":"cst/string"},"1":{"0":{"0":{"0":{"0":"sanitize","1":12724,"type":"cst/id"},"1":{"0":{"0":"name","1":12725,"type":"cst/id"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"1":12723,"type":"cst/list"},"1":{"0":{"0":" = ","1":{"type":"nil"},"2":12726,"type":"cst/string"},"1":{"0":{"0":{"0":{"0":"compile","1":12729,"type":"cst/id"},"1":{"0":{"0":"body","1":12730,"type":"cst/id"},"1":{"0":{"0":"trace","1":12731,"type":"cst/id"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"type":"cons"},"1":12728,"type":"cst/list"},"1":{"0":{"0":";\\n","1":{"type":"nil"},"2":12732,"type":"cst/string"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"type":"cons"},"type":"cons"},"type":"cons"},"1":12720,"type":"cst/array"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"1":12718,"type":"cst/list"},"1":{"0":{"0":{"0":{"0":"stypealias","1":12735,"type":"cst/id"},"1":{"0":{"0":"name","1":12736,"type":"cst/id"},"1":{"0":{"0":"_","1":12737,"type":"cst/id"},"1":{"0":{"0":"_","1":12738,"type":"cst/id"},"1":{"0":{"0":"_","1":12739,"type":"cst/id"},"1":{"0":{"0":"_","1":12740,"type":"cst/id"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"type":"cons"},"type":"cons"},"type":"cons"},"type":"cons"},"1":12734,"type":"cst/list"},"1":{"0":{"0":"/* type alias ","1":{"0":{"0":{"0":"name","1":12743,"type":"cst/id"},"1":{"0":" */","1":12744,"type":","},"type":","},"1":{"type":"nil"},"type":"cons"},"2":12741,"type":"cst/string"},"1":{"0":{"0":{"0":{"0":"sdeftype","1":12746,"type":"cst/id"},"1":{"0":{"0":"name","1":12747,"type":"cst/id"},"1":{"0":{"0":"nl","1":12748,"type":"cst/id"},"1":{"0":{"0":"type-arg","1":12749,"type":"cst/id"},"1":{"0":{"0":"cases","1":12750,"type":"cst/id"},"1":{"0":{"0":"l","1":12751,"type":"cst/id"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"type":"cons"},"type":"cons"},"type":"cons"},"type":"cons"},"1":12745,"type":"cst/list"},"1":{"0":{"0":{"0":{"0":"join","1":12753,"type":"cst/id"},"1":{"0":{"0":"\\n","1":{"type":"nil"},"2":12754,"type":"cst/string"},"1":{"0":{"0":{"0":{"0":"map","1":12757,"type":"cst/id"},"1":{"0":{"0":"cases","1":12758,"type":"cst/id"},"1":{"0":{"0":{"0":{"0":"fn","1":12760,"type":"cst/id"},"1":{"0":{"0":{"0":{"0":"case","1":12762,"type":"cst/id"},"1":{"type":"nil"},"type":"cons"},"1":12761,"type":"cst/array"},"1":{"0":{"0":{"0":{"0":"let","1":12764,"type":"cst/id"},"1":{"0":{"0":{"0":{"0":{"0":{"0":",","1":12767,"type":"cst/id"},"1":{"0":{"0":"name2","1":12768,"type":"cst/id"},"1":{"0":{"0":"nl","1":12769,"type":"cst/id"},"1":{"0":{"0":"args","1":12770,"type":"cst/id"},"1":{"0":{"0":"l","1":12771,"type":"cst/id"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"type":"cons"},"type":"cons"},"type":"cons"},"1":12766,"type":"cst/list"},"1":{"0":{"0":"case","1":12772,"type":"cst/id"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"1":12765,"type":"cst/array"},"1":{"0":{"0":{"0":{"0":"++","1":12774,"type":"cst/id"},"1":{"0":{"0":{"0":{"0":"const ","1":{"type":"nil"},"2":12776,"type":"cst/string"},"1":{"0":{"0":{"0":{"0":"sanitize","1":12779,"type":"cst/id"},"1":{"0":{"0":"name2","1":12780,"type":"cst/id"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"1":12778,"type":"cst/list"},"1":{"0":{"0":" = ","1":{"type":"nil"},"2":12781,"type":"cst/string"},"1":{"0":{"0":{"0":{"0":"++","1":12784,"type":"cst/id"},"1":{"0":{"0":{"0":{"0":"mapi","1":12786,"type":"cst/id"},"1":{"0":{"0":"0","1":12787,"type":"cst/id"},"1":{"0":{"0":"args","1":12788,"type":"cst/id"},"1":{"0":{"0":{"0":{"0":"fn","1":12790,"type":"cst/id"},"1":{"0":{"0":{"0":{"0":"i","1":12792,"type":"cst/id"},"1":{"0":{"0":"_","1":12793,"type":"cst/id"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"1":12791,"type":"cst/array"},"1":{"0":{"0":{"0":{"0":"++","1":12795,"type":"cst/id"},"1":{"0":{"0":{"0":{"0":"(v","1":{"type":"nil"},"2":12797,"type":"cst/string"},"1":{"0":{"0":{"0":{"0":"int-to-string","1":12800,"type":"cst/id"},"1":{"0":{"0":"i","1":12801,"type":"cst/id"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"1":12799,"type":"cst/list"},"1":{"0":{"0":") => ","1":{"type":"nil"},"2":12802,"type":"cst/string"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"type":"cons"},"1":12796,"type":"cst/array"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"1":12794,"type":"cst/list"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"type":"cons"},"1":12789,"type":"cst/list"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"type":"cons"},"type":"cons"},"1":12785,"type":"cst/list"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"1":12783,"type":"cst/list"},"1":{"0":{"0":"({type: \\\"","1":{"type":"nil"},"2":12804,"type":"cst/string"},"1":{"0":{"0":"name2","1":12806,"type":"cst/id"},"1":{"0":{"0":"\\\"","1":{"type":"nil"},"2":12807,"type":"cst/string"},"1":{"0":{"0":{"0":{"0":"++","1":12810,"type":"cst/id"},"1":{"0":{"0":{"0":{"0":"mapi","1":12812,"type":"cst/id"},"1":{"0":{"0":"0","1":12813,"type":"cst/id"},"1":{"0":{"0":"args","1":12814,"type":"cst/id"},"1":{"0":{"0":{"0":{"0":"fn","1":12816,"type":"cst/id"},"1":{"0":{"0":{"0":{"0":"i","1":12818,"type":"cst/id"},"1":{"0":{"0":"_","1":12819,"type":"cst/id"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"1":12817,"type":"cst/array"},"1":{"0":{"0":{"0":{"0":"++","1":12821,"type":"cst/id"},"1":{"0":{"0":{"0":{"0":", ","1":{"type":"nil"},"2":12823,"type":"cst/string"},"1":{"0":{"0":{"0":{"0":"int-to-string","1":12826,"type":"cst/id"},"1":{"0":{"0":"i","1":12827,"type":"cst/id"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"1":12825,"type":"cst/list"},"1":{"0":{"0":": v","1":{"type":"nil"},"2":12828,"type":"cst/string"},"1":{"0":{"0":{"0":{"0":"int-to-string","1":12831,"type":"cst/id"},"1":{"0":{"0":"i","1":12832,"type":"cst/id"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"1":12830,"type":"cst/list"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"type":"cons"},"type":"cons"},"1":12822,"type":"cst/array"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"1":12820,"type":"cst/list"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"type":"cons"},"1":12815,"type":"cst/list"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"type":"cons"},"type":"cons"},"1":12811,"type":"cst/list"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"1":12809,"type":"cst/list"},"1":{"0":{"0":"});","1":{"type":"nil"},"2":12833,"type":"cst/string"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"type":"cons"},"type":"cons"},"type":"cons"},"type":"cons"},"type":"cons"},"type":"cons"},"type":"cons"},"1":12775,"type":"cst/array"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"1":12773,"type":"cst/list"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"type":"cons"},"1":12763,"type":"cst/list"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"type":"cons"},"1":12759,"type":"cst/list"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"type":"cons"},"1":12756,"type":"cst/list"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"type":"cons"},"1":12752,"type":"cst/list"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"type":"cons"},"type":"cons"},"type":"cons"},"type":"cons"},"type":"cons"},"type":"cons"},"type":"cons"},"type":"cons"},"1":12701,"type":"cst/list"}))
let compile_top$slj = (top) => (trace) => (($target) => {
if ($target.type === "texpr") {
let expr = $target[0];
let l = $target[1];
return cons(j$slsexpr(provide_empty_effects(right(compile$slj(expr)(trace))))(l))(nil)
} ;
if ($target.type === "tdef") {
let name = $target[0];
let nl = $target[1];
let body = $target[2];
let l = $target[3];
return cons(j$sllet(j$slpvar(sanitize(name))(nl))(compile$slj(body)(trace))(l))(nil)
} ;
if ($target.type === "ttypealias") {
let name = $target[0];
return nil
} ;
if ($target.type === "tdeftype") {
let name = $target[0];
let nl = $target[1];
let type_arg = $target[2];
let cases = $target[3];
let l = $target[4];
return map(cases)(($case) => {
let {"1": {"1": {"1": l, "0": args}, "0": nl}, "0": name2} = $case;
return j$sllet(j$slpvar(sanitize(name2))(nl))(foldr(j$slobj(cons(left($co("type")(j$slstr(name2)(nil)(nl))))(mapi(0)(args)((i) => (_14463) => left($co(int_to_string(i))(j$slvar(`v${int_to_string(i)}`)(nl))))))(l))(mapi(0)(args)((i) => (_14556) => j$slpvar(`v${int_to_string(i)}`)(nl)))((body) => (arg) => j$sllambda(cons(arg)(nil))(right(body))(l)))(l)
})
} ;
throw new Error('match fail 14258:' + JSON.stringify($target))
})(top)
let ex = run$slnil_$gt(parse_expr({"0":{"0":{"0":"let","1":16241,"type":"cst/id"},"1":{"0":{"0":{"0":{"0":"x","1":16243,"type":"cst/id"},"1":{"0":{"0":"10","1":16244,"type":"cst/id"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"1":16242,"type":"cst/array"},"1":{"0":{"0":"x","1":16246,"type":"cst/id"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"type":"cons"},"1":16240,"type":"cst/list"}))
let top$slnames = (top) => (($target) => {
if ($target.type === "tdef") {
let name = $target[0];
let l = $target[1];
let body = $target[2];
return bag$sland(one(global(name)(value)(l)(decl)))(expr$slnames(map$slfrom_list(cons($co(name)(l))(nil)))(body))
} ;
if ($target.type === "texpr") {
let body = $target[0];
return expr$slnames(map$slnil)(body)
} ;
if ($target.type === "ttypealias") {
let name = $target[0];
let l = $target[1];
let free = $target[2];
let body = $target[3];
return bag$sland(one(global(name)(type)(l)(decl)))(type$slnames(map$slfrom_list(free))(body))
} ;
if ($target.type === "tdeftype") {
let name = $target[0];
let l = $target[1];
let free = $target[2];
let constructors = $target[3];
return foldl(one(global(name)(type)(l)(decl)))(map(constructors)(({"1": {"1": {"0": args}, "0": l}, "0": name}) => foldl(one(global(name)(value)(l)(decl)))(map(args)(type$slnames(map$slfrom_list(free))))(bag$sland)))(bag$sland)
} ;
throw new Error('match fail 19410:' + JSON.stringify($target))
})(top)
let cps_test2 = (v) => eval_with($eval(builtins_cps))(j$slcompile(0)(provide_empty_effects(right(finish(cps$slj3(0)(0)(v))))))
let rp = (x) => run$slnil_$gt(parse_expr(x))
let compile_top_cps$slj = (top) => (trace) => (($target) => {
if ($target.type === "texpr") {
let expr = $target[0];
let l = $target[1];
return cons(j$slsexpr(provide_empty_effects(right(finish(cps$slj3(trace)(0)(expr)))))(l))(nil)
} ;
if ($target.type === "tdef") {
let name = $target[0];
let nl = $target[1];
let body = $target[2];
let l = $target[3];
return cons(j$sllet(j$slpvar(sanitize(name))(nl))(finish(cps$slj3(trace)(0)(body)))(l))(nil)
} ;
if ($target.type === "ttypealias") {
return nil
} ;
if ($target.type === "tdeftype") {
let name = $target[0];
let nl = $target[1];
let type_arg = $target[2];
let cases = $target[3];
let l = $target[4];
return map(cases)(($case) => {
let {"1": {"1": {"1": l, "0": args}, "0": nl}, "0": name2} = $case;
return j$sllet(j$slpvar(sanitize(name2))(nl))(foldr(j$slobj(cons(left($co("type")(j$slstr(name2)(nil)(nl))))(mapi(0)(args)((i) => (_29800) => left($co(int_to_string(i))(j$slvar(`v${int_to_string(i)}`)(nl))))))(l))(mapi(0)(args)((i) => (_29826) => j$slpvar(`v${int_to_string(i)}`)(nl)))((body) => (arg) => j$sllambda(cons(arg)(cons(j$slpvar(efvbl)(l))(cons(j$slpvar("done")(l))(nil))))(right(j$slapp(j$slvar("done")(l))(cons(body)(cons(j$slvar(efvbl)(l))(nil)))(l)))(l)))(l)
})
} ;
throw new Error('match fail 29692:' + JSON.stringify($target))
})(top)
let compile_cps$slj = (expr) => (trace) => finish(cps$slj3(trace)(0)(expr))
let cps$sleffects = (trace) => (l) => (handlers) => (nidx) => (save_name) => (done) => go2(l)($gt$gt$eq(map_$gt(({"1": {"1": {"1": body, "0": kind}, "0": nl}, "0": name}) => $gt$gt$eq((($target) => {
if ($target.type === "eearmuffs") {
return $lt_lr(nidx)(l)(cps$slj3(trace)(nidx)(body))
} ;
if ($target.type === "ebang") {
let pats = $target[0];
return $lt_lr(nidx)(l)(left(j$sllambda(cons(j$slpvar("\$_ignored_done")(l))(cons(pats_tuple(pats)(l))(nil)))(left(j$slblock(cons(j$slsexpr((($target) => {
if ($target.type === "left") {
let body = $target[0];
return j$slapp(done)(cons(body)(cons(j$slvar(efvbl)(l))(nil)))(l)
} ;
if ($target.type === "right") {
let body = $target[0];
return body(done)
} ;
throw new Error('match fail 31449:' + JSON.stringify($target))
})(cps$slj3(trace)(nidx)(body)))(l))(cons(j$slreturn(j$slraw("function noop() {return noop}")(l))(l))(nil)))))(l)))
} ;
if ($target.type === "eeffectful") {
let k = $target[0];
let kl = $target[1];
let pats = $target[2];
return $lt_lr(nidx)(l)(left(j$sllambda(cons(j$slpvar("\$lbk\$rb")(kl))(cons(pats_tuple(pats)(l))(cons(j$slpvar("k\$lbeffects\$rb")(kl))(nil))))(left(j$slblock(cons(j$sllet(j$slpvar(sanitize(k))(kl))(j$sllambda(cons(j$slpvar("value")(kl))(cons(j$slpvar("effects")(kl))(cons(j$slpvar("ignored_done")(kl))(nil))))(right(j$slapp(j$slvar("\$lbk\$rb")(kl))(cons(j$slvar("value")(kl))(cons(rebase_handlers(kl)(j$slvar("k\$lbeffects\$rb")(kl))(j$slvar("effects")(kl))(save_name))(cons(j$slvar("ignored_done")(kl))(nil))))(kl)))(kl))(kl))(cons(j$slsexpr((($target) => {
if ($target.type === "left") {
let body = $target[0];
return j$slapp(done)(cons(body)(cons(j$slvar(efvbl)(l))(nil)))(l)
} ;
if ($target.type === "right") {
let body = $target[0];
return body(done)
} ;
throw new Error('match fail 31567:' + JSON.stringify($target))
})(cps$slj3(trace)(nidx)(body)))(l))(cons(j$slreturn(j$slraw("function noop() {return noop}")(l))(l))(nil))))))(l)))
} ;
throw new Error('match fail 30383:' + JSON.stringify($target))
})(kind))((value) => $lt_(left($co(name)(value)))))(handlers))((fields) => $lt_(left(push_handlers(l)(j$slvar(efvbl)(l))(save_name)(j$slassign(save_name)("=")(j$slobj(fields)(l))(l))))))
let cps$slprovide_ = (idx) => (l) => (trace) => (handlers) => (target) => {
let nidx = 1 + idx;
{
let $lt_lr$$0 = $lt_lr;
{
let $lt_lr = $lt_lr$$0(nidx);
return right((done) => j$slapp(j$sllambda(nil)(left((() => {
let ndone = `\$done${int_to_string(idx)}`;
{
let save_name = `\$these_effects\$${int_to_string(idx)}`;
return j$slblock(cons(j$sllet(j$slpvar(save_name)(l))(j$slraw("null")(l))(l))(cons(j$sllet(j$slpvar(ndone)(l))(j$sllambda(cons(j$slpvar("\$vbl")(l))(cons(j$slpvar("\$eff")(l))(nil)))(right(j$slapp(done)(cons(j$slvar("\$vbl")(l))(cons(j$slraw(`\$remove_me(\$eff, \"${save_name}\", ${save_name})`)(l))(nil)))(l)))(l))(l))(cons((() => {
let done = j$slvar(ndone)(l);
return j$slreturn((($target) => {
if ($target.type === "left") {
let v = $target[0];
return v
} ;
if ($target.type === "right") {
let v = $target[0];
return fatal("is this provide a fn?")
} ;
throw new Error('match fail 30863:' + JSON.stringify($target))
})(go2(l)($gt$gt$eq($lt_lr(l)(cps$sleffects(trace)(l)(handlers)(nidx)(save_name)(done)))((effects) => $lt_(left(j$slapp(j$sllambda(cons(j$slpvar(efvbl)(l))(nil))(right((($target) => {
if ($target.type === "left") {
let body = $target[0];
return j$slcom("left")(j$slapp(done)(cons(body)(cons(j$slvar(efvbl)(l))(nil)))(l))
} ;
if ($target.type === "right") {
let body = $target[0];
return j$slcom("right")(body(done))
} ;
throw new Error('match fail 26987:' + JSON.stringify($target))
})(cps$slj3(trace)(nidx)(target))))(l))(cons(effects)(nil))(l)))))))(l)
})())(nil))))
}
})()))(l))(nil)(l))
}
}
}
let cps$slprovide23 = (idx) => (l) => (trace) => (handlers) => (target) => {
let nidx = 1 + idx;
{
let $lt_lr$$0 = $lt_lr;
{
let $lt_lr = $lt_lr$$0(nidx);
return right((done) => j$slapp(j$sllambda(nil)(left((() => {
let ndone = `\$done${int_to_string(idx)}`;
{
let save_name = `\$these_effects\$${int_to_string(idx)}`;
return j$slblock(cons(j$sllet(j$slpvar(save_name)(l))(j$slraw("null")(l))(l))(cons(j$sllet(j$slpvar(ndone)(l))(j$sllambda(cons(j$slpvar("\$vbl")(l))(cons(j$slpvar("\$eff")(l))(cons(j$slpvar("more_done")(l))(nil))))(left(j$slblock(cons(j$slsexpr(j$slassign("\$eff")("=")(j$slraw(`\$remove_me(\$eff, \"${save_name}\", ${save_name})`)(l))(l))(l))(cons(j$slif(j$slvar("more_done")(l))(j$slblock(cons(j$slreturn(j$slapp(j$slvar("more_done")(l))(cons(j$slvar("\$vbl")(l))(cons(j$slvar("\$eff")(l))(cons(done)(nil))))(l))(l))(nil)))(some(j$slblock(cons(j$slreturn(j$slapp(done)(cons(j$slvar("\$vbl")(l))(cons(j$slvar("\$eff")(l))(nil)))(l))(l))(nil))))(l))(nil)))))(l))(l))(cons((() => {
let done = j$slvar(ndone)(l);
return j$slreturn((($target) => {
if ($target.type === "left") {
let v = $target[0];
return v
} ;
if ($target.type === "right") {
let v = $target[0];
return fatal("is this provide a fn?")
} ;
throw new Error('match fail 35817:' + JSON.stringify($target))
})(go2(l)($gt$gt$eq($lt_lr(l)(cps$sleffects2(trace)(l)(handlers)(nidx)(save_name)(ndone)))((effects) => $lt_(left(j$slapp(j$sllambda(cons(j$slpvar(efvbl)(l))(nil))(right((($target) => {
if ($target.type === "left") {
let body = $target[0];
return j$slcom("left")(j$slapp(done)(cons(body)(cons(j$slvar(efvbl)(l))(nil)))(l))
} ;
if ($target.type === "right") {
let body = $target[0];
return j$slcom("right")(body(done))
} ;
throw new Error('match fail 35852:' + JSON.stringify($target))
})(cps$slj3(trace)(nidx)(target))))(l))(cons(effects)(nil))(l)))))))(l)
})())(nil))))
}
})()))(l))(nil)(l))
}
}
}
return $eval("({0: parse_stmt2,  1: parse_expr2, 2: compile_stmt2, 3: compile2, 4: names, 5: externals_stmt, 6: externals_expr, 7: stmt_size, 8: expr_size, 9: type_size, 10: locals_at}) => all_names => builtins => ({\ntype: 'fns', parse_stmt2, parse_expr2, compile_stmt2, compile2, names, externals_stmt, externals_expr, stmt_size, expr_size, type_size, locals_at, all_names, builtins,\nprelude: {'\$unit': null,\n\$get_effect: function (effects, name) {\n  for (let i=effects.length - 1; i>=0; i--) {\n    if (effects[i][name] != undefined) {\n      return effects[i][name];\n    }\n  }\n  throw new Error(\`Effect \${name} not present in effects list \${JSON.stringify(effects)}\`);\n},\n  \$rebase_handlers: function(name, prev, next, mine) {\n    const at = prev.indexOf(mine);\n    if (at === -1) throw new Error(\`got lost somewhere\`)\n    return [...next, ...prev.slice(at + 1)]\n  },\n  \$remove_me: (eff, save_name, mine) => {\n    if (!eff) return eff\n    const at = eff.indexOf(mine)\n    if (at === -1) return eff // throw new Error('cant remove me, not there');\n    return eff.slice(0, at)\n  },\n}\n})")(parse_and_compile((top) => state_f(parse_top(top))(state$slnil))((expr) => state_f(parse_expr(expr))(state$slnil))((top) => (type_info) => (ctx) => (($target) => {
if ($target.type === "tvar") {
return j$slcompile_stmts(ctx)(map(compile_top_cps$slj(top)(ctx))(map$slstmt(simplify_js)))
} ;
{
let $target = top;
if ($target.type === "texpr") {
let expr = $target[0];
let l = $target[1];
{
let $target = cps$slj3(ctx)(0)(expr);
if ($target.type === "left") {
return fatal("why is an effectful expr a left?")
} ;
if ($target.type === "right") {
let f = $target[0];
return join("")(cons("({\$type: 'thunk', f: (\$env, respond) => {\nconst \$produce = [];\nconst \$update = (v, waiting) => {\n  \$produce.push(v);\n  respond(\$produce, waiting)\n}\nconst \$ask = (kind, text, options, f) => {\n  const self = {type: 'ask', text, options, kind, f: v => {\n    self.value = v;\n    respond(\$produce, true);\n    f(v)\n  }}\n  \$produce.push(self)\n  respond(\$produce, true);\n}\nconst \$lbeffects\$rb = [")(cons(builtin_effects)(cons("];\n\n")(cons(j$slcompile_stmt(ctx)(map$slstmt(simplify_js)(j$slsexpr(f(j$slraw("((final_value) => {\n  \$env.valueToString(final_value, 0, s => \$update(s, false))\n})")(l)))(l))))(cons("\n}})")(nil))))))
} ;
throw new Error('match fail 32091:' + JSON.stringify($target))
}
} ;
return fatal("non-expr has unbound effects??");
throw new Error('match fail 22589:' + JSON.stringify($target))
};
throw new Error('match fail 22579:' + JSON.stringify($target))
})(type_info))((expr) => (type_info) => (ctx) => {
let expr$$0 = expr;
{
let expr = (($target) => {
if ($target.type === "tvar") {
return expr$$0
} ;
return elambda(cons(pany(-1))(nil))(expr$$0)(-1);
throw new Error('match fail 22559:' + JSON.stringify($target))
})(type_info);
return j$slcompile(ctx)(provide_empty_effects(right(map$slexpr(simplify_js)(compile_cps$slj(expr)(ctx)))))
}
})(names)(externals_top)((expr) => bag$slto_list(externals(set$slnil)(expr)))(top_size)(expr_size)(type_size)((tl) => (top) => (($target) => {
if ($target.type === "some") {
let v = $target[0];
return bag$slto_list(v)
} ;
return nil;
throw new Error('match fail 18854:' + JSON.stringify($target))
})(locals_at_top(empty)(tl)(top))))((top) => bag$slto_list(top$slnames(top)))(builtins_ex_cps)