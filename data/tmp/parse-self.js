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

const sanMap = {"$":"$$$$","-":"_","+":"$pl","*":"$ti","=":"$eq",">":"$gt","<":"$lt","'":"$qu",".":"$do","\"":"$dq",",":"$co","/":"$sl",";":"$semi","@":"$at",":":"$cl","#":"$ha","!":"$ex","|":"$bar","()":"$unit","?":"$qe"};

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

const kwds = ["case","new","var","const","let","if","else","return","super","break","while","for","default","eval"];

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
return {evaluate,evaluateStmt,unwrapList,constrFn,sanMap,evalPat,kwds,unescapeSlashes,valueToString}})();
Object.assign($env, $prelude);
const pint = (v0) => (v1) => ({type: "pint", 0: v0, 1: v1})
const pbool = (v0) => (v1) => ({type: "pbool", 0: v0, 1: v1})
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

const some = (v0) => ({type: "some", 0: v0})
const none = ({type: "none"})
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

const value = ({type: "value"})
const type = ({type: "type"})
const bag$slfold = (f) => (init) => (bag) => (($target) => {
if ($target.type === "many" &&
$target[0].type === "nil") {
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

const pat_bound = (pat) => (($target) => {
if ($target.type === "pany") {
return set$slnil
}
if ($target.type === "pvar") {
{
let name = $target[0];
return set$sladd(set$slnil)(name)
}
}
if ($target.type === "pcon") {
{
let args = $target[2];
return foldl(set$slnil)(args)((bound) => (arg) => set$slmerge(bound)(pat_bound(arg)))
}
}
if ($target.type === "pstr") {
return set$slnil
}
if ($target.type === "pprim") {
return set$slnil
}
throw new Error('Failed to match. ' + valueToString($target));
})(pat);

const loop = (v) => (f) => f(v)((nv) => loop(nv)(f));

const cst_loc = (cst) => (($target) => {
if ($target.type === "cst/list") {
{
let l = $target[1];
return l
}
}
if ($target.type === "cst/id") {
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
if ($target.type === "cst/string") {
{
let l = $target[2];
return l
}
}
if ($target.type === "cst/spread") {
{
let l = $target[1];
return l
}
}
throw new Error('Failed to match. ' + valueToString($target));
})(cst);

const usage = (v0) => ({type: "usage", 0: v0})
const decl = ({type: "decl"})
const $co = (v0) => (v1) => ({type: ",", 0: v0, 1: v1})
const nil = ({type: "nil"})
const cons = (v0) => (v1) => ({type: "cons", 0: v0, 1: v1})
const pany = (v0) => ({type: "pany", 0: v0})
const pvar = (v0) => (v1) => ({type: "pvar", 0: v0, 1: v1})
const pcon = (v0) => (v1) => (v2) => (v3) => ({type: "pcon", 0: v0, 1: v1, 2: v2, 3: v3})
const pstr = (v0) => (v1) => ({type: "pstr", 0: v0, 1: v1})
const pprim = (v0) => (v1) => ({type: "pprim", 0: v0, 1: v1})
const tvar = (v0) => (v1) => ({type: "tvar", 0: v0, 1: v1})
const tapp = (v0) => (v1) => (v2) => ({type: "tapp", 0: v0, 1: v1, 2: v2})
const tcon = (v0) => (v1) => ({type: "tcon", 0: v0, 1: v1})
const cst$sllist = (v0) => (v1) => ({type: "cst/list", 0: v0, 1: v1})
const cst$slarray = (v0) => (v1) => ({type: "cst/array", 0: v0, 1: v1})
const cst$slspread = (v0) => (v1) => ({type: "cst/spread", 0: v0, 1: v1})
const cst$slid = (v0) => (v1) => ({type: "cst/id", 0: v0, 1: v1})
const cst$slstring = (v0) => (v1) => (v2) => ({type: "cst/string", 0: v0, 1: v1, 2: v2})
const one = (v0) => ({type: "one", 0: v0})
const many = (v0) => ({type: "many", 0: v0})
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

const pairs = (list) => (($target) => {
if ($target.type === "nil") {
return nil
}
if ($target.type === "cons" &&
$target[1].type === "cons") {
{
let one = $target[0];
let two = $target[1][0];
let rest = $target[1][1];
return cons($co(one)(two))(pairs(rest))
}
}
return fatal(`Pairs given odd number ${valueToString(list)}`)
throw new Error('Failed to match. ' + valueToString($target));
})(list);

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

const bag$sland = (first) => (second) => (($target) => {
if ($target.type === "," &&
$target[0].type === "many" &&
$target[0][0].type === "nil") {
{
let a = $target[1];
return a
}
}
if ($target.type === "," &&
$target[1].type === "many" &&
$target[1][0].type === "nil") {
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

const bag$slto_list = (bag) => bag$slfold((list) => (one) => cons(one)(list))(nil)(bag);

const names = (stmt) => (($target) => {
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
})(stmt);

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
return fatal("Unbalanced zip")
throw new Error('Failed to match. ' + valueToString($target));
})($co(one)(two));

const get_id = (x) => (($target) => {
if ($target.type === "cst/id") {
{
let name = $target[0];
let l = $target[1];
return $co(name)(l)
}
}
return fatal("type argument must be identifier")
throw new Error('Failed to match. ' + valueToString($target));
})(x);

const id_with_maybe_args = (head) => (($target) => {
if ($target.type === "cst/id") {
{
let id = $target[0];
let li = $target[1];
return $co(id)($co(li)(nil))
}
}
if ($target.type === "cst/list" &&
$target[0].type === "cons" &&
$target[0][0].type === "cst/id") {
{
let id = $target[0][0][0];
let li = $target[0][0][1];
let args = $target[0][1];
return $co(id)($co(li)(map(args)(get_id)))
}
}
return fatal("Invalid type constructor")
throw new Error('Failed to match. ' + valueToString($target));
})(head);

const filter_some = (items) => foldr(nil)(items)((res) => (v) => (($target) => {
if ($target.type === "some") {
{
let v = $target[0];
return cons(v)(res)
}
}
return res
throw new Error('Failed to match. ' + valueToString($target));
})(v));

const empty = many(nil);

/* type alias */
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
if ($target.type === "tapp") {
{
let target = $target[0];
let arg = $target[1];
return bag$sland(type$slnames(free)(target))(type$slnames(free)(arg))
}
}
throw new Error('Failed to match. ' + valueToString($target));
})(body);

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

const ttypealias = (v0) => (v1) => (v2) => (v3) => (v4) => ({type: "ttypealias", 0: v0, 1: v1, 2: v2, 3: v3, 4: v4})
const tdeftype = (v0) => (v1) => (v2) => (v3) => (v4) => ({type: "tdeftype", 0: v0, 1: v1, 2: v2, 3: v3, 4: v4})
const tdef = (v0) => (v1) => (v2) => (v3) => ({type: "tdef", 0: v0, 1: v1, 2: v2, 3: v3})
const texpr = (v0) => (v1) => ({type: "texpr", 0: v0, 1: v1})
const parse_type = (type) => (($target) => {
if ($target.type === "cst/id") {
{
let id = $target[0];
let l = $target[1];
return tcon(id)(l)
}
}
if ($target.type === "cst/list" &&
$target[0].type === "cons" &&
$target[0][0].type === "cst/id" &&
$target[0][0][0] === "fn" &&
$target[0][1].type === "cons" &&
$target[0][1][0].type === "cst/array" &&
$target[0][1][1].type === "cons" &&
$target[0][1][1][1].type === "nil") {
{
let args = $target[0][1][0][0];
let body = $target[0][1][1][0];
let l = $target[1];
return foldl(parse_type(body))(rev(args)(nil))((body) => (arg) => tapp(tapp(tcon("->")(l))(parse_type(arg))(l))(body)(l))
}
}
if ($target.type === "cst/list" &&
$target[0].type === "cons" &&
$target[0][0].type === "cst/id" &&
$target[0][0][0] === ",") {
{
let nl = $target[0][0][1];
let items = $target[0][1];
let al = $target[1];
return loop(map(items)(parse_type))((items) => (recur) => (($target) => {
if ($target.type === "nil") {
return fatal("Empty tuple type")
}
if ($target.type === "cons" &&
$target[1].type === "nil") {
{
let one = $target[0];
return one
}
}
if ($target.type === "cons" &&
$target[1].type === "cons" &&
$target[1][1].type === "nil") {
{
let one = $target[0];
let two = $target[1][0];
return tapp(tapp(tcon(",")(nl))(one)(al))(two)(al)
}
}
if ($target.type === "cons") {
{
let one = $target[0];
let rest = $target[1];
return tapp(tapp(tcon(",")(nl))(one)(al))(recur(rest))(al)
}
}
throw new Error('Failed to match. ' + valueToString($target));
})(items))
}
}
if ($target.type === "cst/list") {
{
let items = $target[0];
let l = $target[1];
return loop(rev(map(items)(parse_type))(nil))((items) => (recur) => (($target) => {
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
return tapp(recur(rest))(one)(l)
}
}
if ($target.type === "nil") {
return tcon("()")(l)
}
throw new Error('Failed to match. ' + valueToString($target));
})(items))
}
}
return fatal(`(parse-type) Invalid type ${valueToString(type)}`)
throw new Error('Failed to match. ' + valueToString($target));
})(type);

const parse_pat = (pat) => (($target) => {
if ($target.type === "cst/id" &&
$target[0] === "_") {
{
let l = $target[1];
return pany(l)
}
}
if ($target.type === "cst/id" &&
$target[0] === "true") {
{
let l = $target[1];
return pprim(pbool(true)(l))(l)
}
}
if ($target.type === "cst/id" &&
$target[0] === "false") {
{
let l = $target[1];
return pprim(pbool(false)(l))(l)
}
}
if ($target.type === "cst/string" &&
$target[1].type === "nil") {
{
let first = $target[0];
let l = $target[2];
return pstr(first)(l)
}
}
if ($target.type === "cst/id") {
{
let id = $target[0];
let l = $target[1];
return (($target) => {
if ($target.type === "some") {
{
let int = $target[0];
return pprim(pint(int)(l))(l)
}
}
return pvar(id)(l)
throw new Error('Failed to match. ' + valueToString($target));
})(string_to_int(id))
}
}
if ($target.type === "cst/array" &&
$target[0].type === "nil") {
{
let l = $target[1];
return pcon("nil")(l)(nil)(l)
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
return pcon("cons")(l)(cons(parse_pat(one))(cons(parse_pat(cst$slarray(rest)(l)))(nil)))(l)
}
}
if ($target.type === "cst/list" &&
$target[0].type === "nil") {
{
let l = $target[1];
return pcon("()")(l)(nil)(l)
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
return loop(args)((items) => (recur) => (($target) => {
if ($target.type === "cons" &&
$target[1].type === "nil") {
{
let one = $target[0];
return parse_pat(one)
}
}
if ($target.type === "nil") {
return pcon(",")(l)(nil)(il)
}
if ($target.type === "cons") {
{
let one = $target[0];
let rest = $target[1];
return pcon(",")(l)(cons(parse_pat(one))(cons(recur(rest))(nil)))(l)
}
}
throw new Error('Failed to match. ' + valueToString($target));
})(items))
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
return pcon(name)(il)(map(rest)(parse_pat))(l)
}
}
return fatal(`Invalid pattern: ${valueToString(pat)}`)
throw new Error('Failed to match. ' + valueToString($target));
})(pat);

const parse_and_compile = (v0) => (v1) => (v2) => (v3) => (v4) => ({type: "parse-and-compile", 0: v0, 1: v1, 2: v2, 3: v3, 4: v4})
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
return empty
}
if ($target.type === "estr") {
{
let templates = $target[1];
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
return empty
}
if ($target.type === "elambda") {
{
let pats = $target[0];
let body = $target[1];
return bag$sland(foldl(empty)(map(pats)(pat_externals))(bag$sland))(externals(foldl(bound)(map(pats)(pat_bound))(set$slmerge))(body))
}
}
if ($target.type === "elet") {
{
let bindings = $target[0];
let body = $target[1];
return bag$sland(foldl(empty)(map(bindings)((arg) => (({1: init, 0: pat}) => bag$sland(pat_externals(pat))(externals(bound)(init)))(arg)))(bag$sland))(externals(foldl(bound)(map(bindings)((arg) => (({0: pat}) => pat_bound(pat))(arg)))(set$slmerge))(body))
}
}
if ($target.type === "eapp") {
{
let target = $target[0];
let args = $target[1];
return bag$sland(externals(bound)(target))(foldl(empty)(map(args)(externals(bound)))(bag$sland))
}
}
if ($target.type === "ematch") {
{
let expr = $target[0];
let cases = $target[1];
return bag$sland(externals(bound)(expr))(foldl(empty)(cases)((bag) => (arg) => (($target) => {
if ($target.type === ",") {
{
let pat = $target[0];
let body = $target[1];
return bag$sland(bag$sland(bag)(pat_externals(pat)))(externals(set$slmerge(bound)(pat_bound(pat)))(body))
}
}
throw new Error('Failed to match. ' + valueToString($target));
})(arg)))
}
}
throw new Error('Failed to match. ' + valueToString($target));
})(expr);

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
if ($target.type === "tapp") {
{
let one = $target[0];
let two = $target[1];
return bag$sland(externals_type(bound)(one))(externals_type(bound)(two))
}
}
throw new Error('Failed to match. ' + valueToString($target));
})(t);

const externals_top = (stmt) => bag$slto_list((($target) => {
if ($target.type === "tdeftype") {
{
let name = $target[0];
let free = $target[2];
let constructors = $target[3];
return ((bound) => many(map(constructors)((constructor) => (($target) => {
if ($target.type === "," &&
$target[1].type === "," &&
$target[1][1].type === ",") {
{
let args = $target[1][1][0];
return (($target) => {
if ($target.type === "nil") {
return empty
}
return many(map(args)(externals_type(bound)))
throw new Error('Failed to match. ' + valueToString($target));
})(args)
}
}
throw new Error('Failed to match. ' + valueToString($target));
})(constructor))))(set$slfrom_list(cons(name)(map(free)(fst))))
}
}
if ($target.type === "ttypealias") {
{
let name = $target[0];
let args = $target[2];
let body = $target[3];
return ((bound) => externals_type(bound)(body))(set$slfrom_list(cons(name)(map(args)(fst))))
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
})(stmt));

const parse_type_constructor = (constr) => (($target) => {
if ($target.type === "cst/list" &&
$target[0].type === "cons" &&
$target[0][0].type === "cst/id") {
{
let name = $target[0][0][0];
let ni = $target[0][0][1];
let args = $target[0][1];
let l = $target[1];
return some($co(name)($co(ni)($co(map(args)(parse_type))(l))))
}
}
if ($target.type === "cst/list" &&
$target[0].type === "nil") {
{
let l = $target[1];
return none
}
}
return fatal("Invalid type constructor")
throw new Error('Failed to match. ' + valueToString($target));
})(constr);

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

const parse_top = (cst) => (($target) => {
if ($target.type === "cst/list" &&
$target[0].type === "cons" &&
$target[0][0].type === "cst/id" &&
$target[0][0][0] === "def" &&
$target[0][1].type === "cons" &&
$target[0][1][0].type === "cst/id" &&
$target[0][1][1].type === "cons" &&
$target[0][1][1][1].type === "nil") {
{
let id = $target[0][1][0][0];
let li = $target[0][1][0][1];
let value = $target[0][1][1][0];
let l = $target[1];
return tdef(id)(li)(parse_expr(value))(l)
}
}
if ($target.type === "cst/list" &&
$target[0].type === "cons" &&
$target[0][0].type === "cst/id" &&
$target[0][0][0] === "defn" &&
$target[0][1].type === "cons" &&
$target[0][1][0].type === "cst/id" &&
$target[0][1][1].type === "cons" &&
$target[0][1][1][0].type === "cst/array" &&
$target[0][1][1][1].type === "cons" &&
$target[0][1][1][1][1].type === "nil") {
{
let a = $target[0][0][1];
let id = $target[0][1][0][0];
let li = $target[0][1][0][1];
let args = $target[0][1][1][0][0];
let b = $target[0][1][1][0][1];
let body = $target[0][1][1][1][0];
let c = $target[1];
return ((body) => tdef(id)(li)(body)(c))(parse_expr(cst$sllist(cons(cst$slid("fn")(a))(cons(cst$slarray(args)(b))(cons(body)(nil))))(c)))
}
}
if ($target.type === "cst/list" &&
$target[0].type === "cons" &&
$target[0][0].type === "cst/id" &&
$target[0][0][0] === "defn") {
{
let l = $target[1];
return fatal(`Invalid 'defn' ${int_to_string(l)}`)
}
}
if ($target.type === "cst/list" &&
$target[0].type === "cons" &&
$target[0][0].type === "cst/id" &&
$target[0][0][0] === "deftype" &&
$target[0][1].type === "cons") {
{
let head = $target[0][1][0];
let items = $target[0][1][1];
let l = $target[1];
return (({1: {1: args, 0: li}, 0: id}) => ((constrs) => tdeftype(id)(li)(args)(constrs)(l))(filter_some(map(items)(parse_type_constructor))))(id_with_maybe_args(head))
}
}
if ($target.type === "cst/list" &&
$target[0].type === "cons" &&
$target[0][0].type === "cst/id" &&
$target[0][0][0] === "deftype") {
{
let l = $target[1];
return fatal(`Invalid 'deftype' ${int_to_string(l)}`)
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
let head = $target[0][1][0];
let body = $target[0][1][1][0];
let l = $target[1];
return (({1: {1: args, 0: li}, 0: id}) => ttypealias(id)(li)(args)(parse_type(body))(l))(id_with_maybe_args(head))
}
}
return texpr(parse_expr(cst))(cst_loc(cst))
throw new Error('Failed to match. ' + valueToString($target));
})(cst);


const parse_expr = (cst) => (($target) => {
if ($target.type === "cst/id" &&
$target[0] === "true") {
{
let l = $target[1];
return eprim(pbool(true)(l))(l)
}
}
if ($target.type === "cst/id" &&
$target[0] === "false") {
{
let l = $target[1];
return eprim(pbool(false)(l))(l)
}
}
if ($target.type === "cst/string") {
{
let first = $target[0];
let templates = $target[1];
let l = $target[2];
return estr(first)(parse_template(templates))(l)
}
}
if ($target.type === "cst/id") {
{
let id = $target[0];
let l = $target[1];
return (($target) => {
if ($target.type === "some") {
{
let int = $target[0];
return eprim(pint(int)(l))(l)
}
}
if ($target.type === "none") {
return evar(id)(l)
}
throw new Error('Failed to match. ' + valueToString($target));
})(string_to_int(id))
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
return equot(quot$slexpr(parse_expr(body)))(l)
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
return equot(quot$slquot(body))(l)
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
return equot(quot$sltop(parse_top(body)))(l)
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
return equot(quot$sltype(parse_type(body)))(l)
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
return equot(quot$slpat(parse_pat(body)))(l)
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
return ematch(parse_expr(cond))(cons($co(pprim(pbool(true)(l))(l))(parse_expr(yes)))(cons($co(pany(l))(parse_expr(no)))(nil)))(l)
}
}
if ($target.type === "cst/list" &&
$target[0].type === "cons" &&
$target[0][0].type === "cst/id" &&
$target[0][0][0] === "fn" &&
$target[0][1].type === "cons" &&
$target[0][1][0].type === "cst/array" &&
$target[0][1][1].type === "cons" &&
$target[0][1][1][1].type === "nil") {
{
let args = $target[0][1][0][0];
let body = $target[0][1][1][0];
let b = $target[1];
return elambda(map(args)(parse_pat))(parse_expr(body))(b)
}
}
if ($target.type === "cst/list" &&
$target[0].type === "cons" &&
$target[0][0].type === "cst/id" &&
$target[0][0][0] === "fn") {
{
let l = $target[1];
return fatal(`Invalid 'fn' ${int_to_string(l)}`)
}
}
if ($target.type === "cst/list" &&
$target[0].type === "cons" &&
$target[0][0].type === "cst/id" &&
$target[0][0][0] === "match" &&
$target[0][1].type === "cons") {
{
let target = $target[0][1][0];
let cases = $target[0][1][1];
let l = $target[1];
return ematch(parse_expr(target))(map(pairs(cases))(($case) => (({1: expr, 0: pat}) => $co(parse_pat(pat))(parse_expr(expr)))($case)))(l)
}
}
if ($target.type === "cst/list" &&
$target[0].type === "cons" &&
$target[0][0].type === "cst/id" &&
$target[0][0][0] === "let" &&
$target[0][1].type === "cons" &&
$target[0][1][0].type === "cst/array" &&
$target[0][1][1].type === "cons" &&
$target[0][1][1][1].type === "nil") {
{
let inits = $target[0][1][0][0];
let body = $target[0][1][1][0];
let l = $target[1];
return elet(map(pairs(inits))((pair) => (({1: value, 0: pat}) => $co(parse_pat(pat))(parse_expr(value)))(pair)))(parse_expr(body))(l)
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
return foldr(parse_expr(body))(pairs(inits))((body) => (init) => (({1: value, 0: pat}) => eapp(evar(">>=")(el))(cons(parse_expr(value))(cons(elambda(cons(parse_pat(pat))(nil))(body)(l))(nil)))(l))(init))
}
}
if ($target.type === "cst/list" &&
$target[0].type === "cons" &&
$target[0][0].type === "cst/id" &&
$target[0][0][0] === "let") {
{
let l = $target[1];
return fatal(`Invalid 'let' ${int_to_string(l)}`)
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
return loop(args)((args) => (recur) => (($target) => {
if ($target.type === "nil") {
return evar(",")(il)
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
return eapp(evar(",")(il))(cons(parse_expr(one))(cons(recur(rest))(nil)))(l)
}
}
throw new Error('Failed to match. ' + valueToString($target));
})(args))
}
}
if ($target.type === "cst/list" &&
$target[0].type === "nil") {
{
let l = $target[1];
return evar("()")(l)
}
}
if ($target.type === "cst/list" &&
$target[0].type === "cons") {
{
let target = $target[0][0];
let args = $target[0][1];
let l = $target[1];
return eapp(parse_expr(target))(map(args)(parse_expr))(l)
}
}
if ($target.type === "cst/array") {
{
let args = $target[0];
let l = $target[1];
return loop(args)((args) => (recur) => (($target) => {
if ($target.type === "nil") {
return evar("nil")(l)
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
return eapp(evar("cons")(l))(cons(parse_expr(one))(cons(recur(rest))(nil)))(l)
}
}
throw new Error('Failed to match. ' + valueToString($target));
})(args))
}
}
return fatal("Invalid expression")
throw new Error('Failed to match. ' + valueToString($target));
})(cst);


const parse_template = (templates) => map(templates)(({1: {1: l, 0: string}, 0: expr}) => $co(parse_expr(expr))($co(string)(l)));

const expr$slnames = (bound) => (expr) => (($target) => {
if ($target.type === "evar") {
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
if ($target.type === "none") {
return one(global(name)(value)(l)(usage($unit)))
}
throw new Error('Failed to match. ' + valueToString($target));
})(map$slget(bound)(name))
}
}
if ($target.type === "eprim") {
return empty
}
if ($target.type === "equot") {
return empty
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

return $eval("({0: parse_stmt,  1: parse_expr, 2: names, 3: externals_stmt, 4: externals_expr}) => all_names =>\n  ({type: 'fns', parse_stmt, parse_expr, names, externals_stmt, externals_expr, all_names})")(parse_and_compile(parse_top)(parse_expr)(names)(externals_top)((expr) => bag$slto_list(externals(set$slnil)(expr))))((top) => bag$slto_list(top$slnames(top)))