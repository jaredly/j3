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
      return new Function('', 'return ' + source)()//ctx);
    },
    'eval-with': ctx => source => {
      const args = '{' + Object.keys(ctx).join(',') + '}'
      return new Function(args, 'return ' + source)(ctx);
    },
    unescapeString,
    equal,
    'int-to-string': (a) => a.toString(),
    'string-to-int': (a) => {
        const v = Number(a);
        return Number.isInteger(v) ? { type: 'some', 0: v } : { type: 'nil' };
    },

    // maps
    'map/nil': [],
    'map/set': (map) => (key) => (value) =>
        [[key, value], ...map.filter((i) => i[0] !== key)],
    'map/rm': (map) => (key) => map.filter((i) => !equal(i[0], key)),
    'map/get': (map) => (key) => {
        const found = map.find((i) => equal(i[0], key));
        return found ? { type: 'some', 0: found } : { type: 'none' };
    },
    'map/map': (fn) => (map) => map.map(([k, v]) => [k, fn(v)]),
    'map/merge': (one) => (two) =>
        [...one, ...two.filter(([key]) => !one.find((a) => equal(a, key)))],
    'map/values': (map) => wrapList(map.map((item) => i[1])),
    'map/keys': (map) => wrapList(map.map((item) => i[0])),
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
const $prelude = (() => {const evaluate = (node, scope) => {
  if (!scope) throw new Error(`evaluate called without scope`)
  switch (node.type) {
    // For primitives, we trivially produce the contained value
    case 'eprim':
      return node[0][0]
    // For strings, we need to handle escapes correctly (e.g. the AST node will have "a\\n", which needs to become "a\n" at runtime) and evaluate
    // any contained template expressions
    case 'estr':
      return unescapeSlashes(node[0]) + unwrapList(node[1]).map(({0: exp, 1: {0: suf}}) => evaluate(exp, scope) + unescapeSlashes(suf)).join('')
    // For variables, we look up the name in the `scope` map that we pass everywhere.
    // We use `sanitize` for compatability with the structured editor environment, which expects variable names to be valid javascript names.
    case 'evar':
      var name = node[0]
      if (name === '()') return null
      if (!Object.hasOwn(scope, name)) {
        throw new Error(`Variable not in scope: ${name} (${node[1]}). ${Object.keys(scope).join(', ')}`)
      }
      return scope[name]
    // For lambdas, we're producing an arrow function that accepts the right number of (curried) arguments, matches each provided value with the
    // corresponding pattern, and then evaluates the body with the `scope` map having all of the resulting bindings.
    // Note that auto-currying means that `(fn [a b] c)` becomes `a => b => c` instead of `(a, b) => c`.
    case 'elambda':
      return unwrapList(node[0]).reduceRight((body, arg) => scope => v => body({...scope, ...evalPat(arg, v)}), scope => evaluate(node[1], scope))(scope)
    // Application is also curried, so we need to loop through the arguments list so that `(eapp t [a b])` becomes `t(a)(b)`.
    case 'eapp':
      return unwrapList(node[1]).reduce((f, arg) => f(evaluate(arg, scope)), evaluate(node[0], scope))
    // For `let`, we go through each binding, evaluate the provided `init` against the pattern, and add any bindings to the scope.
    // We're doing the evaluations in *series* instead of *parallel* to allow later bindings to refer to previous ones.
    // so you can do `(let [a 2 b (+ a 4)] b)` and have it evaluate correctly.
    // Note that this method doesn't allow for self-recursion in let bindings. We'll relax that restriction in the self-hosted compiler.
    case 'elet':
      const inner = unwrapList(node[0]).reduce((scope, {0: pat, 1: init}) => {
        const value = evaluate(init, scope)
        const match = evalPat(pat, value)
        if (match == null) throw new Error(`let pattern didnt't match! ${JSON.stringify(value)} vs ${valueToString(pat)}`)
        return {...scope, ...match}
      }, scope)
      return evaluate(node[1], inner)
    // Match walks through each case, checks to see if the patterns matches the value, and if it does, evaluates the body with any bindings from that
    // pattern added onto the scope.
    // If no cases match, we throw an error.
    case 'ematch':
      const target = evaluate(node[0], scope)
      for (let {0: pat, 1: body} of unwrapList(node[1])) {
        const got = evalPat(pat, target)
        if (got) {
          return evaluate(body, {...scope, ...got})
        }
      }
      throw new Error(`match failed (${node[2]}): ${JSON.stringify(target)} - ${JSON.stringify(node[0])}`)
    // `equot` trivially produces the contained data structure; whether it's CST or AST.
    case 'equot':
      return node[0][0]
  }
  throw new Error(`cant evaluatoe ${node.type}`)
};

const evaluateStmt = (node, env) => {
  switch (node.type) {
    case 'texpr': return evaluate(node[0], env)
    case 'tdef':
      const value = evaluate(node[2], env)
      env[node[0]] = value
      return value
    case 'tdeftype':
      const res = {}
      unwrapList(node[3]).forEach(({0: name, 1: {1: {0: args}}}) => {
        res[name] = env[name] = constrFn(name, args)
      })
      return res
  }
};

const unwrapList = (value) => {
  return value.type === 'nil' ? [] : [value[0], ...unwrapList(value[1])]
};

const constrFn = (name, args) => {
  const next = (args) => {
    if (args.type === 'nil') return values => ({type: name, ...values})
    return values => arg => next(args[1])([...values, arg])
  }
  return next(args)([])
};

const sanitize = (raw) => {
    for (let [key, val] of Object.entries(sanMap)) {
        raw = raw.replaceAll(key, val);
    }
    if (kwds.includes(raw)) return '$' + raw
    return raw
};

const sanMap = {"$":"$$$$","-":"_","+":"$pl","*":"$ti","=":"$eq",">":"$gt","<":"$lt","'":"$qu","\"":"$dq",",":"$co","/":"$sl",";":"$semi","@":"$at",":":"$cl","#":"$ha","!":"$ex","|":"$bar","()":"$unit","?":"$qe"};

const evalPat = (node, v) => {
  switch (node.type) {
    case 'pany': return {}
    case 'pprim': return v === node[0][0] ? {} : null
    case 'pstr': return v === node[0]
    case 'pvar':
      return {[node[0]]: v}
    case 'pcon':
      if (node[0] === '()') return v === null ? {} : null
      if (v.type === node[0]) {
        const args = unwrapList(node[2])
        const scope = {}
        for (let i=0; i<args.length; i++) {
          const sub = evalPat(args[i], v[i])
          if (!sub) return null
          Object.assign(scope, sub)
        }
        return scope
      }
      return null
  }
  throw new Error(`Unexpected pat ${JSON.stringify(node)}`)
};

const kwds = ["case","new","var","const","let","if","else","return","super","break","while","for","default"];

const unescapeSlashes = (n) =>
    n.replaceAll(/\\./g, (m) => {
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

const valueToString = (v) => {
    if (typeof v === 'object' && v && 'type' in v) {
        if (v.type === 'cons' || v.type === 'nil') {
            const un = unwrapList(v);
            return '[' + un.map(valueToString).join(' ') + ']';
        }
        if (v.type === ',') {
            const items = unwrapTuple(v);
            return `(, ${items.map(valueToString).join(' ')})`
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
                "'" + JSON.stringify(v).slice(1, -1).replace(/\\"/g, '"') + "'"
            );
        }
        return JSON.stringify(v);
    }
    if (typeof v === 'function') {
        return '<function>';
    }

    return '' + v;
};
return {evaluate,evaluateStmt,unwrapList,constrFn,sanitize,sanMap,evalPat,kwds,unescapeSlashes,valueToString}})();
Object.assign($env, $prelude);
const pint = (v0) => (v1) => ({type: "pint", 0: v0, 1: v1})
const pbool = (v0) => (v1) => ({type: "pbool", 0: v0, 1: v1})
const pany = (v0) => ({type: "pany", 0: v0})
const pvar = (v0) => (v1) => ({type: "pvar", 0: v0, 1: v1})
const pprim = (v0) => (v1) => ({type: "pprim", 0: v0, 1: v1})
const pstr = (v0) => (v1) => ({type: "pstr", 0: v0, 1: v1})
const pcon = (v0) => (v1) => (v2) => (v3) => ({type: "pcon", 0: v0, 1: v1, 2: v2, 3: v3})
const tvar = (v0) => (v1) => ({type: "tvar", 0: v0, 1: v1})
const tapp = (v0) => (v1) => (v2) => ({type: "tapp", 0: v0, 1: v1, 2: v2})
const tcon = (v0) => (v1) => ({type: "tcon", 0: v0, 1: v1})
const tdeftype = (v0) => (v1) => (v2) => (v3) => (v4) => ({type: "tdeftype", 0: v0, 1: v1, 2: v2, 3: v3, 4: v4})
const tdef = (v0) => (v1) => (v2) => (v3) => ({type: "tdef", 0: v0, 1: v1, 2: v2, 3: v3})
const texpr = (v0) => (v1) => ({type: "texpr", 0: v0, 1: v1})
const ttypealias = ({type: "ttypealias"})
const nil = ({type: "nil"})
const cons = (v0) => (v1) => ({type: "cons", 0: v0, 1: v1})
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
const cst$slidentifier = (v0) => (v1) => ({type: "cst/identifier", 0: v0, 1: v1})
const cst$sllist = (v0) => (v1) => ({type: "cst/list", 0: v0, 1: v1})
const cst$slarray = (v0) => (v1) => ({type: "cst/array", 0: v0, 1: v1})
const cst$slrecord = (v0) => (v1) => ({type: "cst/record", 0: v0, 1: v1})
const cst$slspread = (v0) => (v1) => ({type: "cst/spread", 0: v0, 1: v1})
const cst$slstring = (v0) => (v1) => (v2) => ({type: "cst/string", 0: v0, 1: v1, 2: v2})
const maybe_parens = (inner) => (parens) => (($target) => {
if ($target === true) {
return `(${inner})`
}
return inner
throw new Error('Failed to match. ' + valueToString($target));
})(parens);

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

const some = (v0) => ({type: "some", 0: v0})
const none = ({type: "none"})
const m = jsonify(1);

const $co = (v0) => (v1) => ({type: ",", 0: v0, 1: v1})
const builtins = "function equal(a, b) {\n    if (a === b) return true;\n\n    if (a && b && typeof a == 'object' && typeof b == 'object') {\n        var length, i, keys;\n        if (Array.isArray(a)) {\n            length = a.length;\n            if (length != b.length) return false;\n            for (i = length; i-- !== 0; ) if (!equal(a[i], b[i])) return false;\n            return true;\n        }\n\n        keys = Object.keys(a);\n        length = keys.length;\n        if (length !== Object.keys(b).length) return false;\n\n        for (i = length; i-- !== 0; ) {\n            if (!Object.prototype.hasOwnProperty.call(b, keys[i])) return false;\n        }\n\n        for (i = length; i-- !== 0; ) {\n            var key = keys[i];\n\n            if (!equal(a[key], b[key])) return false;\n        }\n\n        return true;\n    }\n\n    // true if both NaN, false otherwise\n    return a !== a && b !== b;\n}\n\nfunction unescapeString(n) {\n    if (n == null || !n.replaceAll) {\n        debugger;\n        return '';\n    }\n    return n.replaceAll(/\\\\./g, (m) => {\n        if (m[1] === 'n') {\n            return '\\n';\n        }\n        if (m[1] === 't') {\n            return '\\t';\n        }\n        if (m[1] === 'r') {\n            return '\\r';\n        }\n        return m[1];\n    });\n}\n\nfunction unwrapList(v) {\n    return v.type === 'nil' ? [] : [v[0], ...unwrapList(v[1])];\n}\n\nfunction wrapList(v) {\n    let res = { type: 'nil' };\n    for (let i = v.length - 1; i >= 0; i--) {\n        res = { type: 'cons', 0: v[i], 1: res };\n    }\n    return res;\n}\n\nreturn {\n    '+': (a) => (b) => a + b,\n    '-': (a) => (b) => a - b,\n    '<': (a) => (b) => a < b,\n    '<=': (a) => (b) => a <= b,\n    '>': (a) => (b) => a > b,\n    '>=': (a) => (b) => a >= b,\n    '=': (a) => (b) => equal(a, b),\n    '!=': (a) => (b) => !equal(a, b),\n    pi: Math.PI,\n    'replace-all': a => b => c => a.replaceAll(b, c),\n    eval: source => {\n      return new Function('', 'return ' + source)()//ctx);\n    },\n    'eval-with': ctx => source => {\n      const args = '{' + Object.keys(ctx).join(',') + '}'\n      return new Function(args, 'return ' + source)(ctx);\n    },\n    unescapeString,\n    equal,\n    'int-to-string': (a) => a.toString(),\n    'string-to-int': (a) => {\n        const v = Number(a);\n        return Number.isInteger(v) ? { type: 'some', 0: v } : { type: 'nil' };\n    },\n\n    // maps\n    'map/nil': [],\n    'map/set': (map) => (key) => (value) =>\n        [[key, value], ...map.filter((i) => i[0] !== key)],\n    'map/rm': (map) => (key) => map.filter((i) => !equal(i[0], key)),\n    'map/get': (map) => (key) => {\n        const found = map.find((i) => equal(i[0], key));\n        return found ? { type: 'some', 0: found } : { type: 'none' };\n    },\n    'map/map': (fn) => (map) => map.map(([k, v]) => [k, fn(v)]),\n    'map/merge': (one) => (two) =>\n        [...one, ...two.filter(([key]) => !one.find((a) => equal(a, key)))],\n    'map/values': (map) => wrapList(map.map((item) => i[1])),\n    'map/keys': (map) => wrapList(map.map((item) => i[0])),\n    'map/from-list': (list) =>\n        unwrapList(list).map((pair) => [pair[0], pair[1]]),\n    'map/to-list': (map) =>\n        wrapList(map.map(([key, value]) => ({ type: ',', 0: key, 1: value }))),\n\n    // sets\n    'set/nil': [],\n    'set/add': (s) => (v) => [v, ...s.filter((m) => !equal(v, m))],\n    'set/has': (s) => (v) => s.includes(v),\n    'set/rm': (s) => (v) => s.filter((i) => !equal(i, v)),\n    // NOTE this is only working for primitives\n    'set/diff': (a) => (b) => a.filter((i) => !b.some((j) => equal(i, j))),\n    'set/merge': (a) => (b) =>\n        [...a, ...b.filter((x) => !a.some((y) => equal(y, x)))],\n    'set/overlap': (a) => (b) => a.filter((x) => b.some((y) => equal(y, x))),\n    'set/to-list': wrapList,\n    'set/from-list': (s) => {\n        const res = [];\n        unwrapList(s).forEach((item) => {\n            if (res.some((m) => equal(item, m))) {\n                return;\n            }\n            res.push(item);\n        });\n        return res;\n    },\n\n    // Various debugging stuff\n    jsonify: (v) => JSON.stringify(v) ?? 'undefined',\n    fatal: (message) => {\n        throw new Error(\`Fatal runtime: \${message}\`);\n    },\n}";

const builtins_for_eval = eval("builtins => sanitize => {\n  const san = {}\n  Object.keys(builtins).forEach(k => san[sanitize(k)] = builtins[k])\n  return san\n}")(eval(`(() => {${builtins}})()`))(sanitize);

const eval_with_builtins = eval_with(builtins_for_eval);

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

const escape_string = (string) => replaces(string)(cons($co("\\")("\\\\"))(cons($co("\n")("\\n"))(cons($co("\"")("\\\""))(cons($co("\`")("\\\`"))(cons($co("\$")("\\\$"))(nil))))));

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

const fix_slashes = (str) => escape_string(unescapeString(str));

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

return eval("compile => compile_top => builtins => ({type:'fns',  compile: a => _ => compile(a), compile_stmt: a => _ => compile_top(a), builtins})")(compile)(compile_top)(builtins)