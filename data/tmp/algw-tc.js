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
const pint = (v0) => (v1) => ({type: "pint", 0: v0, 1: v1})
const pfloat = (v0) => (v1) => ({type: "pfloat", 0: v0, 1: v1})
const pbool = (v0) => (v1) => ({type: "pbool", 0: v0, 1: v1})
const tvar = (v0) => (v1) => ({type: "tvar", 0: v0, 1: v1})
const tapp = (v0) => (v1) => (v2) => ({type: "tapp", 0: v0, 1: v1, 2: v2})
const tcon = (v0) => (v1) => ({type: "tcon", 0: v0, 1: v1})
const cons = (v0) => (v1) => ({type: "cons", 0: v0, 1: v1})
const nil = ({type: "nil"})
const type$slfree = (type) => (($target) => {
if ($target.type === "tvar") {
{
let id = $target[0];
return set$sladd(set$slnil)(id)
}
}
if ($target.type === "tcon") {
return set$slnil
}
if ($target.type === "tapp") {
{
let a = $target[0];
let b = $target[1];
return set$slmerge(type$slfree(a))(type$slfree(b))
}
}
throw new Error('Failed to match. ' + valueToString($target));
})(type);

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

const map = (f) => (values) => (($target) => {
if ($target.type === "nil") {
return nil
}
if ($target.type === "cons") {
{
let one = $target[0];
let rest = $target[1];
return cons(f(one))(map(f)(rest))
}
}
throw new Error('Failed to match. ' + valueToString($target));
})(values);

const some = (v0) => ({type: "some", 0: v0})
const none = ({type: "none"})
const map_without = (map) => (set) => foldr(map)(set$slto_list(set))(map$slrm);

const tfn = (arg) => (body) => (l) => tapp(tapp(tcon("->")(l))(arg)(l))(body)(l);

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

const pany = (v0) => ({type: "pany", 0: v0})
const pvar = (v0) => (v1) => ({type: "pvar", 0: v0, 1: v1})
const pcon = (v0) => (v1) => (v2) => (v3) => ({type: "pcon", 0: v0, 1: v1, 2: v2, 3: v3})
const pstr = (v0) => (v1) => ({type: "pstr", 0: v0, 1: v1})
const pprim = (v0) => (v1) => ({type: "pprim", 0: v0, 1: v1})
const type_$gts = (type) => (($target) => {
if ($target.type === "tvar") {
{
let name = $target[0];
return name
}
}
if ($target.type === "tapp" &&
$target[0].type === "tapp" &&
$target[0][0].type === "tcon" &&
$target[0][0][0] === "->") {
{
let arg = $target[0][1];
let res = $target[1];
return `(fn [${type_$gts(arg)}] ${type_$gts(res)})`
}
}
if ($target.type === "tapp") {
{
let target = $target[0];
let arg = $target[1];
return `(${type_$gts(target)} ${type_$gts(arg)})`
}
}
if ($target.type === "tcon") {
{
let name = $target[0];
return name
}
}
throw new Error('Failed to match. ' + valueToString($target));
})(type);

const tfns = (args) => (body) => (l) => foldr(body)(args)((body) => (arg) => tfn(arg)(body)(l));

const tint = tcon("int")(-1);

const length = (v) => (($target) => {
if ($target.type === "nil") {
return 0
}
if ($target.type === "cons") {
{
let rest = $target[1];
return $pl(1)(length(rest))
}
}
throw new Error('Failed to match. ' + valueToString($target));
})(v);

const type$slcon_to_var = (vars) => (type) => (($target) => {
if ($target.type === "tvar") {
return type
}
if ($target.type === "tcon") {
{
let name = $target[0];
let l = $target[1];
return (($target) => {
if ($target === true) {
return tvar(name)(l)
}
return type
throw new Error('Failed to match. ' + valueToString($target));
})(set$slhas(vars)(name))
}
}
if ($target.type === "tapp") {
{
let a = $target[0];
let b = $target[1];
let l = $target[2];
return tapp(type$slcon_to_var(vars)(a))(type$slcon_to_var(vars)(b))(l)
}
}
throw new Error('Failed to match. ' + valueToString($target));
})(type);

const loop = (v) => (f) => f(v)((nv) => loop(nv)(f));

const join = (sep) => (lst) => (($target) => {
if ($target.type === "nil") {
return ""
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
return `${one}${sep}${join(sep)(rest)}`
}
}
throw new Error('Failed to match. ' + valueToString($target));
})(lst);

const tbool = tcon("bool")(-1);

const tmap = (k) => (v) => tapp(tapp(tcon("map")(-1))(k)(-1))(v)(-1);

const toption = (arg) => tapp(tcon("option")(-1))(arg)(-1);

const tlist = (arg) => tapp(tcon("list")(-1))(arg)(-1);

const tset = (arg) => tapp(tcon("set")(-1))(arg)(-1);

const vbl = (k) => tvar(k)(-1);

const t$co = (a) => (b) => tapp(tapp(tcon(",")(-1))(a)(-1))(b)(-1);

const tstring = tcon("string")(-1);

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
let lists = $target[1];
return cons(one)(concat(cons(rest)(lists)))
}
}
throw new Error('Failed to match. ' + valueToString($target));
})(lists);

const force = (x) => (($target) => {
if ($target.type === "some") {
{
let x = $target[0];
return x
}
}
return fatal("Option is None")
throw new Error('Failed to match. ' + valueToString($target));
})(x);

const ex$slany = ({type: "ex/any"})
const ex$slconstructor = (v0) => (v1) => (v2) => ({type: "ex/constructor", 0: v0, 1: v1, 2: v2})
const ex$slor = (v0) => (v1) => ({type: "ex/or", 0: v0, 1: v1})
const any_list = (arity) => loop(arity)((arity) => (recur) => (($target) => {
if ($target === true) {
return nil
}
return cons(ex$slany)(recur(_(arity)(1)))
throw new Error('Failed to match. ' + valueToString($target));
})($eq(0)(arity)));

const any = (f) => (lst) => (($target) => {
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
return any(f)(rest)
throw new Error('Failed to match. ' + valueToString($target));
})(f(one))
}
}
throw new Error('Failed to match. ' + valueToString($target));
})(lst);

const default_matrix = (matrix) => concat(map((row) => (($target) => {
if ($target.type === "cons" &&
$target[0].type === "ex/any") {
{
let rest = $target[1];
return cons(rest)(nil)
}
}
if ($target.type === "cons" &&
$target[0].type === "ex/or") {
{
let left = $target[0][0];
let right = $target[0][1];
let rest = $target[1];
return default_matrix(cons(cons(left)(rest))(cons(cons(right)(rest))(nil)))
}
}
return nil
throw new Error('Failed to match. ' + valueToString($target));
})(row))(matrix));

const fold_ex_pat = (init) => (pat) => (f) => (($target) => {
if ($target.type === "ex/or") {
{
let left = $target[0];
let right = $target[1];
return f(f(init)(left))(right)
}
}
return f(init)(pat)
throw new Error('Failed to match. ' + valueToString($target));
})(pat);

const fold_ex_pats = (init) => (pats) => (f) => foldl(init)(pats)((init) => (pat) => fold_ex_pat(init)(pat)(f));

const ok = (v0) => ({type: "ok", 0: v0})
const err = (v0) => ({type: "err", 0: v0})
const $co = (v0) => (v1) => ({type: ",", 0: v0, 1: v1})
const list$eq = (a$qu) => (b$qu) => (eq) => (($target) => {
if ($target.type === "," &&
$target[0].type === "cons" &&
$target[1].type === "cons") {
{
let one = $target[0][0];
let rest = $target[0][1];
let two = $target[1][0];
let rest$qu = $target[1][1];
return (($target) => {
if ($target === true) {
return list$eq(rest)(rest$qu)(eq)
}
return false
throw new Error('Failed to match. ' + valueToString($target));
})(eq(one)(two))
}
}
return false
throw new Error('Failed to match. ' + valueToString($target));
})($co(a$qu)(b$qu));

const one = (v0) => ({type: "one", 0: v0})
const many = (v0) => ({type: "many", 0: v0})
const empty = many(nil);

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

const bag$slto_list = (bag) => bag$slfold((list) => (one) => cons(one)(list))(nil)(bag);

const dot = (f) => (g) => (n) => f(g(n));

const oloc = (v0) => (v1) => ({type: "oloc", 0: v0, 1: v1})
const mapi_inner = (i) => (f) => (values) => (($target) => {
if ($target.type === "nil") {
return nil
}
if ($target.type === "cons") {
{
let one = $target[0];
let rest = $target[1];
return cons(f(i)(one))(mapi_inner($pl(i)(1))(f)(rest))
}
}
throw new Error('Failed to match. ' + valueToString($target));
})(values);

const filter = (f) => (lst) => (($target) => {
if ($target.type === "nil") {
return nil
}
if ($target.type === "cons") {
{
let one = $target[0];
let rest = $target[1];
return (($target) => {
if ($target === true) {
return cons(one)(filter(f)(rest))
}
return filter(f)(rest)
throw new Error('Failed to match. ' + valueToString($target));
})(f(one))
}
}
throw new Error('Failed to match. ' + valueToString($target));
})(lst);

const type$slmatches_free = (free) => (type) => (($target) => {
if ($target.type === "tvar") {
{
let id = $target[0];
return set$slhas(free)(id)
}
}
if ($target.type === "tcon") {
return false
}
if ($target.type === "tapp") {
{
let a = $target[0];
let b = $target[1];
return (($target) => {
if ($target === true) {
return true
}
return type$slmatches_free(free)(a)
throw new Error('Failed to match. ' + valueToString($target));
})(type$slmatches_free(free)(b))
}
}
throw new Error('Failed to match. ' + valueToString($target));
})(type);

const name_for_instance = (type) => (cls) => `${type_$gts(type)} < ${cls}`;

const type_to_js_id = (type) => (($target) => {
if ($target.type === "tvar") {
{
let name = $target[0];
return sanitize(name)
}
}
if ($target.type === "tcon") {
{
let name = $target[0];
return sanitize(name)
}
}
if ($target.type === "tapp") {
{
let target = $target[0];
let arg = $target[1];
return `${type_to_js_id(target)}\$app\$${type_to_js_id(arg)}`
}
}
throw new Error('Failed to match. ' + valueToString($target));
})(type);

const put_in_place = (ordered) => (value) => (idx) => (($target) => {
if ($target.type === "nil") {
return cons($co(value)(idx))(nil)
}
if ($target.type === "cons" &&
$target[0].type === ",") {
{
let ov = $target[0][0];
let oidx = $target[0][1];
let rest = $target[1];
return (($target) => {
if ($target === true) {
return cons($co(value)(idx))(cons($co(ov)(oidx))(rest))
}
return cons($co(ov)(oidx))(put_in_place(rest)(value)(idx))
throw new Error('Failed to match. ' + valueToString($target));
})($lt(idx)(oidx))
}
}
throw new Error('Failed to match. ' + valueToString($target));
})(ordered);

const default_types = cons(tint)(cons(tcon("unit")(-1))(nil));

const find_some = (f) => (arr) => (($target) => {
if ($target.type === "nil") {
return none
}
if ($target.type === "cons") {
{
let one = $target[0];
let rest = $target[1];
return (($target) => {
if ($target.type === "some") {
{
let v = $target[0];
return some(v)
}
}
return find_some(f)(rest)
throw new Error('Failed to match. ' + valueToString($target));
})(f(one))
}
}
throw new Error('Failed to match. ' + valueToString($target));
})(arr);

const all = (f) => (items) => (($target) => {
if ($target.type === "nil") {
return true
}
if ($target.type === "cons") {
{
let one = $target[0];
let rest = $target[1];
return (($target) => {
if ($target === true) {
return all(f)(rest)
}
return false
throw new Error('Failed to match. ' + valueToString($target));
})(f(one))
}
}
throw new Error('Failed to match. ' + valueToString($target));
})(items);

const joinor = (sep) => ($default) => (items) => (($target) => {
if ($target.type === "nil") {
return $default
}
return join(sep)(items)
throw new Error('Failed to match. ' + valueToString($target));
})(items);

const is_empty = (x) => (($target) => {
if ($target.type === "nil") {
return true
}
return false
throw new Error('Failed to match. ' + valueToString($target));
})(x);

const not = (x) => (($target) => {
if ($target === true) {
return false
}
return true
throw new Error('Failed to match. ' + valueToString($target));
})(x);

const every = (lst) => (f) => (($target) => {
if ($target.type === "nil") {
return true
}
if ($target.type === "cons") {
{
let one = $target[0];
let rest = $target[1];
return (($target) => {
if ($target === true) {
return every(rest)(f)
}
return false
throw new Error('Failed to match. ' + valueToString($target));
})(f(one))
}
}
throw new Error('Failed to match. ' + valueToString($target));
})(lst);

const numClasses = cons("number")(cons("integral")(cons("floating")(cons("fractional")(cons("real")(cons("realfloat")(cons("realfrac")(nil)))))));

const stdClasses = cons("eq")(cons("ord")(cons("show")(cons("read")(cons("pretty")(cons("bounded")(cons("enum")(cons("ix")(cons("functor")(cons("monad")(cons("monadplus")(numClasses)))))))))));

const head = (lst) => (($target) => {
if ($target.type === "nil") {
return fatal("empty list")
}
if ($target.type === "cons") {
{
let one = $target[0];
return one
}
}
throw new Error('Failed to match. ' + valueToString($target));
})(lst);

const type$slhnf = (type) => (($target) => {
if ($target.type === "tvar") {
return true
}
if ($target.type === "tcon") {
return false
}
if ($target.type === "tapp") {
{
let t = $target[0];
return type$slhnf(t)
}
}
throw new Error('Failed to match. ' + valueToString($target));
})(type);

const map$slok = (f) => (arr) => (($target) => {
if ($target.type === "nil") {
return ok(nil)
}
if ($target.type === "cons") {
{
let one = $target[0];
let rest = $target[1];
return (($target) => {
if ($target.type === "ok") {
{
let val = $target[0];
return (($target) => {
if ($target.type === "ok") {
{
let rest = $target[0];
return ok(cons(val)(rest))
}
}
if ($target.type === "err") {
{
let e = $target[0];
return err(e)
}
}
throw new Error('Failed to match. ' + valueToString($target));
})(map$slok(f)(rest))
}
}
if ($target.type === "err") {
{
let e = $target[0];
return err(e)
}
}
throw new Error('Failed to match. ' + valueToString($target));
})(f(one))
}
}
throw new Error('Failed to match. ' + valueToString($target));
})(arr);

const ok$gt$gt$eq = (value) => (next) => (($target) => {
if ($target.type === "ok") {
{
let v = $target[0];
return next(v)
}
}
if ($target.type === "err") {
{
let e = $target[0];
return err(e)
}
}
throw new Error('Failed to match. ' + valueToString($target));
})(value);

const partition = (arr) => (test) => (($target) => {
if ($target.type === "nil") {
return $co(nil)(nil)
}
if ($target.type === "cons") {
{
let one = $target[0];
let rest = $target[1];
return (({1: no, 0: yes}) => (($target) => {
if ($target === true) {
return $co(cons(one)(yes))(no)
}
return $co(yes)(cons(one)(no))
throw new Error('Failed to match. ' + valueToString($target));
})(test(one)))(partition(rest)(test))
}
}
throw new Error('Failed to match. ' + valueToString($target));
})(arr);

const snd = ({1: s}) => s;

const class_env$slclasses = ({1: {0: classes}}) => classes;

const contains = (arr) => (item) => (item$eq) => (($target) => {
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
return contains(rest)(item)(item$eq)
throw new Error('Failed to match. ' + valueToString($target));
})(item$eq(one)(item))
}
}
throw new Error('Failed to match. ' + valueToString($target));
})(arr);

const none_to = (v) => (opt) => (($target) => {
if ($target.type === "none") {
return v
}
if ($target.type === "some") {
{
let m = $target[0];
return m
}
}
throw new Error('Failed to match. ' + valueToString($target));
})(opt);

{
    const test = (x) => foldl(nil)(x)((ord) => ({1: b, 0: a}) => put_in_place(ord)(a)(b));
    
    const in_0 = cons($co("a")(1))(nil);
    const mod_0 = test(in_0);
    const out_0 = cons($co("a")(1))(nil);
    if (!equal(mod_0, out_0)) {
        console.log(mod_0);
        console.log(out_0);
        throw new Error(`Fixture test (23400) failing 0. Not equal.`);
    }
    

    const in_1 = cons($co("a")(1))(cons($co("b")(2))(nil));
    const mod_1 = test(in_1);
    const out_1 = cons($co("a")(1))(cons($co("b")(2))(nil));
    if (!equal(mod_1, out_1)) {
        console.log(mod_1);
        console.log(out_1);
        throw new Error(`Fixture test (23400) failing 1. Not equal.`);
    }
    

    const in_2 = cons($co("a")(0))(cons($co("b")(1))(nil));
    const mod_2 = test(in_2);
    const out_2 = cons($co("a")(0))(cons($co("b")(1))(nil));
    if (!equal(mod_2, out_2)) {
        console.log(mod_2);
        console.log(out_2);
        throw new Error(`Fixture test (23400) failing 2. Not equal.`);
    }
    

    const in_3 = cons($co("b")(1))(cons($co("a")(0))(nil));
    const mod_3 = test(in_3);
    const out_3 = cons($co("a")(0))(cons($co("b")(1))(nil));
    if (!equal(mod_3, out_3)) {
        console.log(mod_3);
        console.log(out_3);
        throw new Error(`Fixture test (23400) failing 3. Not equal.`);
    }
    

    const in_4 = cons($co("a")(0))(cons($co("c")(2))(cons($co("b")(1))(nil)));
    const mod_4 = test(in_4);
    const out_4 = cons($co("a")(0))(cons($co("b")(1))(cons($co("c")(2))(nil)));
    if (!equal(mod_4, out_4)) {
        console.log(mod_4);
        console.log(out_4);
        throw new Error(`Fixture test (23400) failing 4. Not equal.`);
    }
    
}
const specialized_matrix = (constructor) => (arity) => (matrix) => concat(map(specialize_row(constructor)(arity))(matrix));


const specialize_row = (constructor) => (arity) => (row) => (($target) => {
if ($target.type === "nil") {
return fatal("Can't specialize an empty row.")
}
if ($target.type === "cons" &&
$target[0].type === "ex/any") {
{
let rest = $target[1];
return cons(concat(cons(any_list(arity))(cons(rest)(nil))))(nil)
}
}
if ($target.type === "cons" &&
$target[0].type === "ex/constructor") {
{
let name = $target[0][0];
let args = $target[0][2];
let rest = $target[1];
return (($target) => {
if ($target === true) {
return cons(concat(cons(args)(cons(rest)(nil))))(nil)
}
return nil
throw new Error('Failed to match. ' + valueToString($target));
})($eq(name)(constructor))
}
}
if ($target.type === "cons" &&
$target[0].type === "ex/or") {
{
let left = $target[0][0];
let right = $target[0][1];
let rest = $target[1];
return specialized_matrix(constructor)(arity)(cons(cons(left)(rest))(cons(cons(right)(rest))(nil)))
}
}
throw new Error('Failed to match. ' + valueToString($target));
})(row);

const type$eq = (one) => (two) => (($target) => {
if ($target.type === "," &&
$target[0].type === "tvar" &&
$target[1].type === "tvar") {
{
let id = $target[0][0];
let id$qu = $target[1][0];
return $eq(id)(id$qu)
}
}
if ($target.type === "," &&
$target[0].type === "tapp" &&
$target[1].type === "tapp") {
{
let target = $target[0][0];
let arg = $target[0][1];
let target$qu = $target[1][0];
let arg$qu = $target[1][1];
return (($target) => {
if ($target === true) {
return type$eq(arg)(arg$qu)
}
return false
throw new Error('Failed to match. ' + valueToString($target));
})(type$eq(target)(target$qu))
}
}
if ($target.type === "," &&
$target[0].type === "tcon" &&
$target[1].type === "tcon") {
{
let name = $target[0][0];
let name$qu = $target[1][0];
return $eq(name)(name$qu)
}
}
return false
throw new Error('Failed to match. ' + valueToString($target));
})($co(one)(two));

const type$slapply = (subst) => (type) => (($target) => {
if ($target.type === "tvar") {
{
let id = $target[0];
return (($target) => {
if ($target.type === "none") {
return type
}
if ($target.type === "some") {
{
let t = $target[0];
return t
}
}
throw new Error('Failed to match. ' + valueToString($target));
})(map$slget(subst)(id))
}
}
if ($target.type === "tapp") {
{
let target = $target[0];
let arg = $target[1];
let loc = $target[2];
return tapp(type$slapply(subst)(target))(type$slapply(subst)(arg))(loc)
}
}
return type
throw new Error('Failed to match. ' + valueToString($target));
})(type);

{
    const test = type$slapply(map$slfrom_list(cons($co("a")(tcon("int")(-1)))(nil)));
    
    const in_0 = tvar("a")(-1);
    const mod_0 = test(in_0);
    const out_0 = tcon("int")(-1);
    if (!equal(mod_0, out_0)) {
        console.log(mod_0);
        console.log(out_0);
        throw new Error(`Fixture test (597) failing 0. Not equal.`);
    }
    

    const in_1 = tvar("b")(-1);
    const mod_1 = test(in_1);
    const out_1 = tvar("b")(-1);
    if (!equal(mod_1, out_1)) {
        console.log(mod_1);
        console.log(out_1);
        throw new Error(`Fixture test (597) failing 1. Not equal.`);
    }
    

    const in_2 = tapp(tcon("list")(-1))(tvar("a")(-1))(-1);
    const mod_2 = test(in_2);
    const out_2 = tapp(tcon("list")(-1))(tcon("int")(-1))(-1);
    if (!equal(mod_2, out_2)) {
        console.log(mod_2);
        console.log(out_2);
        throw new Error(`Fixture test (597) failing 2. Not equal.`);
    }
    
}
const compose_subst = (new_subst) => (old_subst) => map$slmerge(map$slmap(type$slapply(new_subst))(old_subst))(new_subst);

const demo_new_subst = map$slfrom_list(cons($co("a")(tcon("a-mapped")(-1)))(cons($co("b")(tvar("c")(-1)))(nil)));

const StateT = (v0) => ({type: "StateT", 0: v0})
const run_$gt = ({0: f}) => (state) => (({1: result}) => result)(f(state));

const $gt$gt$eq = ({0: f}) => (next) => StateT((state) => (($target) => {
if ($target.type === "," &&
$target[1].type === "err") {
{
let state = $target[0];
let e = $target[1][0];
return $co(state)(err(e))
}
}
if ($target.type === "," &&
$target[1].type === "ok") {
{
let state = $target[0];
let v = $target[1][0];
return (({0: fnext}) => fnext(state))(next(v))
}
}
throw new Error('Failed to match. ' + valueToString($target));
})(f(state)));

const $lt_ = (x) => StateT((state) => $co(state)(ok(x)));

const $lt_state = StateT((state) => $co(state)(ok(state)));

const state_$gt = (v) => StateT((old) => $co(v)(ok(old)));

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

const $lt_subst = $gt$gt$eq($lt_state)(({1: {0: subst}}) => $lt_(subst));

const reset_state_$gt = $gt$gt$eq($lt_state)(({1: {1: {1: types}}}) => $gt$gt$eq(state_$gt($co(0)($co(map$slnil)($co(empty)(types)))))((_) => $lt_($unit)));

const $lt_next_idx = $gt$gt$eq($lt_state)(({1: {1: {1: types, 0: preds}, 0: subst}, 0: idx}) => $gt$gt$eq(state_$gt($co($pl(idx)(1))($co(subst)($co(preds)(types)))))((_) => $lt_(idx)));

const subst_$gt = (new_subst) => $gt$gt$eq($lt_state)(({1: {1: {1: types, 0: preds}, 0: subst}, 0: idx}) => $gt$gt$eq(state_$gt($co(idx)($co(compose_subst(new_subst)(subst))($co(preds)(types)))))((_) => $lt_($unit)));

const subst_reset_$gt = (new_subst) => $gt$gt$eq($lt_state)(({1: {1: types, 0: old_subst}, 0: idx}) => $gt$gt$eq(state_$gt($co(idx)($co(new_subst)(types))))((_) => $lt_(old_subst)));

const state$slnil = $co(0)($co(map$slnil)($co(empty)(nil)));

const run$slnil_$gt = (st) => run_$gt(st)(state$slnil);

const new_type_var = (name) => (l) => $gt$gt$eq($lt_next_idx)((nidx) => $lt_(tvar(`${name}:${int_to_string(nidx)}`)(l)));

const make_subst_for_free = (vars) => (l) => $gt$gt$eq(map_$gt((id) => $gt$gt$eq(new_type_var(id)(l))((new_var) => $lt_($co(id)(new_var))))(set$slto_list(vars)))((mapping) => $lt_(map$slfrom_list(mapping)));

const one_subst = ($var) => (type) => map$slfrom_list(cons($co($var)(type))(nil));

const apply_$gt = (f) => (arg) => $gt$gt$eq($lt_subst)((subst) => $lt_(f(subst)(arg)));

const type$slapply_$gt = apply_$gt(type$slapply);

const cst$sllist = (v0) => (v1) => ({type: "cst/list", 0: v0, 1: v1})
const cst$slarray = (v0) => (v1) => ({type: "cst/array", 0: v0, 1: v1})
const cst$slspread = (v0) => (v1) => ({type: "cst/spread", 0: v0, 1: v1})
const cst$slid = (v0) => (v1) => ({type: "cst/id", 0: v0, 1: v1})
const cst$slstring = (v0) => (v1) => (v2) => ({type: "cst/string", 0: v0, 1: v1, 2: v2})
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
let one = $target[0][0];
let rest = $target[0][1];
let two = $target[1][0];
let trest = $target[1][1];
return cons($co(one)(two))(zip(rest)(trest))
}
}
return fatal("Cant zip lists of unequal length")
throw new Error('Failed to match. ' + valueToString($target));
})($co(one)(two));

const unzip = (zipped) => (($target) => {
if ($target.type === "nil") {
return $co(nil)(nil)
}
if ($target.type === "cons" &&
$target[0].type === ",") {
{
let a = $target[0][0];
let b = $target[0][1];
let rest = $target[1];
return (({1: two, 0: one}) => $co(cons(a)(one))(cons(b)(two)))(unzip(rest))
}
}
throw new Error('Failed to match. ' + valueToString($target));
})(zipped);

const fst = ({0: a}) => a;

const type$slunroll_app = (type) => (($target) => {
if ($target.type === "tapp") {
{
let target = $target[0];
let arg = $target[1];
let l = $target[2];
return (({1: inner, 0: target}) => $co(target)(cons($co(arg)(l))(inner)))(type$slunroll_app(target))
}
}
return $co(type)(nil)
throw new Error('Failed to match. ' + valueToString($target));
})(type);

const reverse = (lst) => loop($co(lst)(nil))(({1: coll, 0: lst}) => (recur) => (($target) => {
if ($target.type === "nil") {
return coll
}
if ($target.type === "cons") {
{
let one = $target[0];
let rest = $target[1];
return recur($co(rest)(cons(one)(coll)))
}
}
throw new Error('Failed to match. ' + valueToString($target));
})(lst));

const tcon_and_args = (type) => (coll) => (l) => (($target) => {
if ($target.type === "tvar") {
return fatal(`Type not resolved ${int_to_string(l)} it is a tvar at heart. ${jsonify(type)} ${jsonify(coll)}`)
}
if ($target.type === "tcon") {
{
let name = $target[0];
return $co(name)(coll)
}
}
if ($target.type === "tapp") {
{
let target = $target[0];
let arg = $target[1];
return tcon_and_args(target)(cons(arg)(coll))(l)
}
}
throw new Error('Failed to match. ' + valueToString($target));
})(type);

{
    const test = (x) => tcon_and_args(x)(nil)(0);
    
    const in_0 = {"0":{"0":{"0":{"0":"hi","1":10045,"type":"tcon"},"1":{"0":"a","1":10046,"type":"tcon"},"2":10044,"type":"tapp"},"1":{"0":"b","1":10047,"type":"tcon"},"2":10044,"type":"tapp"},"1":{"0":{"0":"c","1":10049,"type":"tcon"},"1":{"0":"d","1":10050,"type":"tcon"},"2":10048,"type":"tapp"},"2":10044,"type":"tapp"};
    const mod_0 = test(in_0);
    const out_0 = $co("hi")(cons(tcon("a")(10046))(cons(tcon("b")(10047))(cons(tapp(tcon("c")(10049))(tcon("d")(10050))(10048))(nil))));
    if (!equal(mod_0, out_0)) {
        console.log(mod_0);
        console.log(out_0);
        throw new Error(`Fixture test (10024) failing 0. Not equal.`);
    }
    
}
const find_gid = (heads) => fold_ex_pats(none)(heads)((gid) => (pat) => (($target) => {
if ($target.type === "ex/constructor") {
{
let id = $target[1];
return (($target) => {
if ($target.type === "none") {
return some(id)
}
if ($target.type === "some") {
{
let oid = $target[0];
return (($target) => {
if ($target === true) {
return fatal("Constructors with different group IDs in the same position.")
}
return some(id)
throw new Error('Failed to match. ' + valueToString($target));
})($ex$eq(oid)(id))
}
}
throw new Error('Failed to match. ' + valueToString($target));
})(gid)
}
}
return gid
throw new Error('Failed to match. ' + valueToString($target));
})(pat));

const $lt_err$ti = (x) => StateT((state) => $co(state)(err(x)));

const map_err_$gt = ({0: f}) => (next) => StateT((state) => (($target) => {
if ($target.type === "," &&
$target[1].type === "err") {
{
let state = $target[0];
let e = $target[1][0];
return $co(state)(next(e))
}
}
if ($target.type === "," &&
$target[1].type === "ok") {
{
let state = $target[0];
let v = $target[1][0];
return $co(state)(ok(v))
}
}
throw new Error('Failed to match. ' + valueToString($target));
})(f(state)));

const state_f = ({0: f}) => f;

const record_type_$gt = (type) => (loc) => (dont_subst) => $gt$gt$eq($lt_state)(({1: {1: {1: types, 0: preds}, 0: subst}, 0: idx}) => $gt$gt$eq(state_$gt($co(idx)($co(subst)($co(preds)(cons($co(type)($co(loc)(dont_subst)))(types))))))((_) => $lt_($unit)));

const target_and_args = (type) => (coll) => (($target) => {
if ($target.type === "tapp") {
{
let target = $target[0];
let arg = $target[1];
return target_and_args(target)(cons(arg)(coll))
}
}
return $co(type)(coll)
throw new Error('Failed to match. ' + valueToString($target));
})(type);

const fn_args_and_body = (type) => (($target) => {
if ($target.type === "tapp" &&
$target[0].type === "tapp" &&
$target[0][0].type === "tcon" &&
$target[0][0][0] === "->") {
{
let arg = $target[0][1];
let res = $target[1];
return (({1: res, 0: args}) => $co(cons(arg)(args))(res))(fn_args_and_body(res))
}
}
return $co(nil)(type)
throw new Error('Failed to match. ' + valueToString($target));
})(type);

const isin = (v0) => (v1) => (v2) => ({type: "isin", 0: v0, 1: v1, 2: v2})
const $eq$gt = (v0) => (v1) => ({type: "=>", 0: v0, 1: v1})
const pred$eq = ({1: id, 0: type}) => ({1: id$qu, 0: type$qu}) => (($target) => {
if ($target === true) {
return type$eq(type)(type$qu)
}
return false
throw new Error('Failed to match. ' + valueToString($target));
})($eq(id)(id$qu));

const predicate$slfree = ({0: type}) => type$slfree(type);

const predicate$slapply = (subst) => ({2: l, 1: cls, 0: type}) => isin(type$slapply(subst)(type))(cls)(l);

const pred_$gts = ({2: locs, 1: cls, 0: type}) => `(isin ${type_$gts(type)} \"${cls}\" ${join(" ")(map(({1: i, 0: l}) => `${int_to_string(l)}@${int_to_string(i)}`)(locs))}) `;

const preds_$gt = (preds) => $gt$gt$eq($lt_state)(({1: {1: {1: types, 0: current}, 0: subst}, 0: idx}) => $gt$gt$eq(state_$gt($co(idx)($co(subst)($co(bag$sland(many(map(one)(preds)))(current))(types)))))((_) => $lt_($unit)));

const $lt_preds = $gt$gt$eq($lt_state)(({1: {1: {0: preds}}}) => $lt_(preds));

const predicate$slreloc = (l) => (i) => ({1: cls, 0: type}) => isin(type)(cls)(cons(oloc(l)(i))(nil));

const mapi = (f) => (values) => mapi_inner(0)(f)(values);

const predicate$eq = ({1: s1, 0: t1}) => ({1: s2, 0: t2}) => (($target) => {
if ($target === true) {
return type$eq(t1)(t2)
}
return false
throw new Error('Failed to match. ' + valueToString($target));
})($eq(s1)(s2));

const predicate$slmerge = ({2: l1, 1: s1, 0: t1}) => ({2: l2, 1: s2, 0: t2}) => (($target) => {
if ($target === true) {
return (($target) => {
if ($target === true) {
return some(isin(t1)(s2)(set$slto_list(set$slfrom_list(concat(cons(l1)(cons(l2)(nil)))))))
}
return none
throw new Error('Failed to match. ' + valueToString($target));
})(type$eq(t1)(t2))
}
return none
throw new Error('Failed to match. ' + valueToString($target));
})($eq(s1)(s2));

const pred_contains = (free) => ({2: loc, 1: cls, 0: type}) => type$slmatches_free(free)(type);

const organize_predicates = (preds) => map$slmap((ol) => mapi((i) => ({1: idx, 0: v}) => (($target) => {
if ($target === true) {
return fatal(`predicates out of order somehow: ${int_to_string(i)} ${int_to_string(idx)}`)
}
return v
throw new Error('Failed to match. ' + valueToString($target));
})($ex$eq(i)(idx)))(ol))(foldl(map$slnil)(preds)((by_loc) => ({2: locs, 1: cls, 0: type}) => ((instance_name) => foldl(by_loc)(locs)((by_loc) => ({1: idx, 0: loc}) => (($target) => {
if ($target.type === "none") {
return map$slset(by_loc)(loc)(cons($co(instance_name)(idx))(nil))
}
if ($target.type === "some") {
{
let current = $target[0];
return map$slset(by_loc)(loc)(put_in_place(current)(instance_name)(idx))
}
}
throw new Error('Failed to match. ' + valueToString($target));
})(map$slget(by_loc)(loc))))(name_for_instance(type)(cls))));

const reset_preds_$gt = (preds) => $gt$gt$eq($lt_state)(({1: {1: {1: types}, 0: subst}, 0: idx}) => $gt$gt$eq(state_$gt($co(idx)($co(subst)($co(preds)(types)))))((_) => $lt_($unit)));

const by_super = (classes) => (pred) => (({2: locs, 1: cls, 0: t}) => (({0: supers}) => cons(pred)(concat(map((i$qu) => by_super(classes)(isin(t)(i$qu)(locs)))(supers))))((($target) => {
if ($target.type === "some") {
{
let s = $target[0];
return s
}
}
return fatal(`Unknown class '${cls}' in predicate [by-super]`)
throw new Error('Failed to match. ' + valueToString($target));
})(map$slget(classes)(cls))))(pred);

const merge = (s1) => (s2) => (l) => ((agree) => (($target) => {
if ($target === true) {
return map$slmerge(s1)(s2)
}
return fatal("merge failed")
throw new Error('Failed to match. ' + valueToString($target));
})(agree))(all((v) => $eq(type$slapply(s1)(tvar(v)(l)))(type$slapply(s2)(tvar(v)(l))))(set$slto_list(set$sloverlap(set$slfrom_list(map$slkeys(s1)))(set$slfrom_list(map$slkeys(s2))))));

const ambiguities = (known_variables) => (preds) => ((vbls_in_preds) => ((unaccounted_for_variables) => map((v) => $co(v)(filter((pred) => any($eq(v))(set$slto_list(predicate$slfree(pred))))(preds)))(set$slto_list(unaccounted_for_variables)))(set$sldiff(vbls_in_preds)(known_variables)))(foldl(set$slnil)(map(predicate$slfree)(preds))(set$slmerge));

const tss_$gts = (tss) => joinor("\n")("no tss")(map(dot(joinor("; ")("[empty]"))(map(type_$gts)))(tss));

const vps_$gts = (vps) => joinor("\n")("no vps")(map(({1: preds, 0: a}) => `${a} is in predicates: ${join(";")(map(pred_$gts)(preds))}`)(vps));

const in_hnf = ({0: t}) => type$slhnf(t);

const preds_$gts = dot(join("\n"))(map(pred_$gts));

const sc_entail = (ce) => (ps) => (p) => any(any(pred$eq(p)))(map(by_super(ce))(ps));

const without = (base) => (remove) => (x$eq) => filter((x) => not(contains(remove)(x)(x$eq)))(base);

const eprim = (v0) => (v1) => ({type: "eprim", 0: v0, 1: v1})
const evar = (v0) => (v1) => ({type: "evar", 0: v0, 1: v1})
const estr = (v0) => (v1) => (v2) => ({type: "estr", 0: v0, 1: v1, 2: v2})
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

const tdef = (v0) => (v1) => (v2) => (v3) => ({type: "tdef", 0: v0, 1: v1, 2: v2, 3: v3})
const texpr = (v0) => (v1) => ({type: "texpr", 0: v0, 1: v1})
const tdeftype = (v0) => (v1) => (v2) => (v3) => (v4) => ({type: "tdeftype", 0: v0, 1: v1, 2: v2, 3: v3, 4: v4})
const ttypealias = (v0) => (v1) => (v2) => (v3) => (v4) => ({type: "ttypealias", 0: v0, 1: v1, 2: v2, 3: v3, 4: v4})
const forall = (v0) => (v1) => ({type: "forall", 0: v0, 1: v1})
const tenv = (v0) => (v1) => (v2) => (v3) => (v4) => ({type: "tenv", 0: v0, 1: v1, 2: v2, 3: v3, 4: v4})
const tenv$slwith_type = ({4: typeclasses, 3: aliases, 2: types, 1: tcons, 0: values}) => (name) => (scheme) => tenv(map$slset(values)(name)(scheme))(tcons)(types)(aliases)(typeclasses);

{
    const test = (x) => map$slto_list(compose_subst(demo_new_subst)(map$slfrom_list(x)));
    

    const in_1 = cons($co("x")(tvar("a")(-1)))(nil);
    const mod_1 = test(in_1);
    const out_1 = cons($co("x")(tcon("a-mapped")(-1)))(cons($co("a")(tcon("a-mapped")(-1)))(cons($co("b")(tvar("c")(-1)))(nil)));
    if (!equal(mod_1, out_1)) {
        console.log(mod_1);
        console.log(out_1);
        throw new Error(`Fixture test (832) failing 1. Not equal.`);
    }
    


    const in_3 = cons($co("a")(tvar("b")(-1)))(nil);
    const mod_3 = test(in_3);
    const out_3 = cons($co("a")(tvar("c")(-1)))(cons($co("b")(tvar("c")(-1)))(nil));
    if (!equal(mod_3, out_3)) {
        console.log(mod_3);
        console.log(out_3);
        throw new Error(`Fixture test (832) failing 3. Not equal.`);
    }
    
}
/* type alias */
const infer$slprim = (prim) => (($target) => {
if ($target.type === "pint") {
{
let l = $target[1];
return $gt$gt$eq(new_type_var("number")(l))((tv) => $gt$gt$eq(preds_$gt(cons(isin(tv)("number")(cons(oloc(l)(0))(nil)))(nil)))((_) => $lt_(tv)))
}
}
if ($target.type === "pfloat") {
{
let l = $target[1];
return $gt$gt$eq(new_type_var("floating")(l))((tv) => $gt$gt$eq(preds_$gt(cons(isin(tv)("floating")(cons(oloc(l)(0))(nil)))(nil)))((_) => $lt_(tv)))
}
}
if ($target.type === "pbool") {
{
let l = $target[1];
return $lt_(tcon("bool")(l))
}
}
throw new Error('Failed to match. ' + valueToString($target));
})(prim);

const tenv$slresolve = ({0: values}) => (name) => map$slget(values)(name);

const tenv$slnil = tenv(map$slnil)(map$slnil)(map$slnil)(map$slnil)(map$slnil);

const add$sltypealias = ({4: typeclasses, 3: aliases, 2: types, 1: tcons, 0: values}) => (name) => (args) => (type) => tenv(map$slnil)(map$slnil)(map$slnil)(map$slset(map$slnil)(name)($co(map(fst)(args))(type$slcon_to_var(set$slfrom_list(map(fst)(args)))(type))))(map$slnil);

const type$slresolve_aliases = (aliases) => (type) => (({1: args, 0: target}) => ((args) => (($target) => {
if ($target.type === "tcon") {
{
let name = $target[0];
let l = $target[1];
return (($target) => {
if ($target.type === "some" &&
$target[0].type === ",") {
{
let free = $target[0][0];
let type = $target[0][1];
return ((subst) => type$slresolve_aliases(aliases)(type$slapply(subst)(type)))(map$slfrom_list(zip(free)(args)))
}
}
return foldl(target)(args)((a) => (b) => tapp(a)(b)(l))
throw new Error('Failed to match. ' + valueToString($target));
})(map$slget(aliases)(name))
}
}
if ($target.type === "tvar") {
{
let l = $target[1];
return foldl(target)(args)((a) => (b) => tapp(a)(b)(l))
}
}
return target
throw new Error('Failed to match. ' + valueToString($target));
})(target))(map(type$slresolve_aliases(aliases))(reverse(map(fst)(args)))))(type$slunroll_app(type));

const split_stmts = (stmts) => loop(stmts)((stmts) => (recur) => (($target) => {
if ($target.type === "nil") {
return $co(nil)($co(nil)($co(nil)(nil)))
}
if ($target.type === "cons") {
{
let stmt = $target[0];
let rest = $target[1];
return (({1: {1: {1: others, 0: exprs}, 0: aliases}, 0: defs}) => (($target) => {
if ($target.type === "tdef") {
{
let name = $target[0];
let nl = $target[1];
let body = $target[2];
let l = $target[3];
return $co(cons($co(name)($co(nl)($co(body)(l))))(defs))($co(aliases)($co(exprs)(others)))
}
}
if ($target.type === "ttypealias") {
return $co(defs)($co(cons(stmt)(aliases))($co(exprs)(others)))
}
if ($target.type === "texpr") {
{
let expr = $target[0];
let l = $target[1];
return $co(defs)($co(aliases)($co(cons(expr)(exprs))(others)))
}
}
return $co(defs)($co(aliases)($co(exprs)(cons(stmt)(others))))
throw new Error('Failed to match. ' + valueToString($target));
})(stmt))(recur(rest))
}
}
throw new Error('Failed to match. ' + valueToString($target));
})(stmts));

const tenv$slmerge = ({4: tc1, 3: a1, 2: t1, 1: c1, 0: v1}) => ({4: tc2, 3: a2, 2: t2, 1: c2, 0: v2}) => tenv(map$slmerge(v1)(v2))(map$slmerge(c1)(c2))(map$slmerge(t1)(t2))(map$slmerge(a1)(a2))(foldl(tc1)(map$slto_list(tc2))((tc) => ({1: {1: {1: fns, 0: insts}, 0: supers}, 0: name}) => (($target) => {
if ($target.type === "none") {
return map$slset(tc)(name)($co(supers)($co(insts)(fns)))
}
if ($target.type === "some" &&
$target[0].type === "," &&
$target[0][1].type === ",") {
{
let insts$qu = $target[0][1][0];
return map$slset(tc)(name)($co(supers)($co(concat(cons(insts)(cons(insts$qu)(nil))))(fns)))
}
}
throw new Error('Failed to match. ' + valueToString($target));
})(map$slget(tc)(name))));

const infer$slquot = (quot) => (l) => (($target) => {
if ($target.type === "quot/expr") {
return tcon("expr")(l)
}
if ($target.type === "quot/top") {
return tcon("top")(l)
}
if ($target.type === "quot/type") {
return tcon("type")(l)
}
if ($target.type === "quot/pat") {
return tcon("pat")(l)
}
if ($target.type === "quot/quot") {
return tcon("cst")(l)
}
throw new Error('Failed to match. ' + valueToString($target));
})(quot);

const concrete = (t) => forall(set$slnil)($eq$gt(nil)(t));

const generic = (vbls) => (t) => forall(set$slfrom_list(vbls))($eq$gt(nil)(t));

const builtin_env = ((k) => ((v) => ((v2) => ((kv) => ((kk) => ((a) => ((b) => ((num2) => ((ord2) => ((eq2) => ((inst) => tenv(map$slfrom_list(cons($co("-")(num2))(cons($co(">")(ord2))(cons($co("<")(ord2))(cons($co("=")(eq2))(cons($co("!=")(eq2))(cons($co(">=")(ord2))(cons($co("<=")(ord2))(cons($co("pi")(concrete(tcon("float")(-1))))(cons($co("+")(num2))(cons($co("show")(forall(set$slfrom_list(cons("a")(nil)))($eq$gt(cons(isin(a)("show")(nil))(nil))(tfns(cons(a)(nil))(tstring)(-1)))))(cons($co("show/pretty")(forall(set$slfrom_list(cons("a")(nil)))($eq$gt(cons(isin(a)("pretty")(nil))(nil))(tfns(cons(a)(nil))(tstring)(-1)))))(cons($co("()")(concrete(tcon("()")(-1))))(cons($co(",")(generic(cons("a")(cons("b")(nil)))(tfns(cons(a)(cons(b)(nil)))(t$co(a)(b))(-1))))(cons($co("unescapeString")(concrete(tfns(cons(tstring)(nil))(tstring)(-1))))(cons($co("int-to-string")(concrete(tfns(cons(tint)(nil))(tstring)(-1))))(cons($co("string-to-int")(concrete(tfns(cons(tstring)(nil))(toption(tint))(-1))))(cons($co("string-to-float")(concrete(tfns(cons(tstring)(nil))(toption(tcon("float")(-1)))(-1))))(cons($co("map/nil")(kv(tmap(k)(v))))(cons($co("map/set")(kv(tfns(cons(tmap(k)(v))(cons(k)(cons(v)(nil))))(tmap(k)(v))(-1))))(cons($co("map/rm")(kv(tfns(cons(tmap(k)(v))(cons(k)(nil)))(tmap(k)(v))(-1))))(cons($co("map/get")(kv(tfns(cons(tmap(k)(v))(cons(k)(nil)))(toption(v))(-1))))(cons($co("map/map")(generic(cons("k")(cons("v")(cons("v2")(nil))))(tfns(cons(tfns(cons(v)(nil))(v2)(-1))(cons(tmap(k)(v))(nil)))(tmap(k)(v2))(-1))))(cons($co("map/merge")(kv(tfns(cons(tmap(k)(v))(cons(tmap(k)(v))(nil)))(tmap(k)(v))(-1))))(cons($co("map/values")(kv(tfns(cons(tmap(k)(v))(nil))(tlist(v))(-1))))(cons($co("map/keys")(kv(tfns(cons(tmap(k)(v))(nil))(tlist(k))(-1))))(cons($co("set/nil")(kk(tset(k))))(cons($co("set/add")(kk(tfns(cons(tset(k))(cons(k)(nil)))(tset(k))(-1))))(cons($co("set/has")(kk(tfns(cons(tset(k))(cons(k)(nil)))(tbool)(-1))))(cons($co("set/rm")(kk(tfns(cons(tset(k))(cons(k)(nil)))(tset(k))(-1))))(cons($co("set/diff")(kk(tfns(cons(tset(k))(cons(tset(k))(nil)))(tset(k))(-1))))(cons($co("set/merge")(kk(tfns(cons(tset(k))(cons(tset(k))(nil)))(tset(k))(-1))))(cons($co("set/overlap")(kk(tfns(cons(tset(k))(cons(tset(k))(nil)))(tset(k))(-1))))(cons($co("set/to-list")(kk(tfns(cons(tset(k))(nil))(tlist(k))(-1))))(cons($co("set/from-list")(kk(tfns(cons(tlist(k))(nil))(tset(k))(-1))))(cons($co("map/from-list")(kv(tfns(cons(tlist(t$co(k)(v)))(nil))(tmap(k)(v))(-1))))(cons($co("map/to-list")(kv(tfns(cons(tmap(k)(v))(nil))(tlist(t$co(k)(v)))(-1))))(cons($co("jsonify")(generic(cons("v")(nil))(tfns(cons(tvar("v")(-1))(nil))(tstring)(-1))))(cons($co("valueToString")(generic(cons("v")(nil))(tfns(cons(vbl("v"))(nil))(tstring)(-1))))(cons($co("eval")(generic(cons("v")(nil))(tfns(cons(tcon("string")(-1))(nil))(vbl("v"))(-1))))(cons($co("errorToString")(generic(cons("v")(nil))(tfns(cons(tfns(cons(vbl("v"))(nil))(tstring)(-1))(cons(vbl("v"))(nil)))(tstring)(-1))))(cons($co("sanitize")(concrete(tfns(cons(tstring)(nil))(tstring)(-1))))(cons($co("replace-all")(concrete(tfns(cons(tstring)(cons(tstring)(cons(tstring)(nil))))(tstring)(-1))))(cons($co("fatal")(generic(cons("v")(nil))(tfns(cons(tstring)(nil))(vbl("v"))(-1))))(nil)))))))))))))))))))))))))))))))))))))))))))))(map$slfrom_list(cons($co("()")($co(nil)($co(nil)(tcon("()")(-1)))))(cons($co(",")($co(cons("a")(cons("b")(nil)))($co(cons(a)(cons(b)(nil)))(t$co(a)(b)))))(nil))))(map$slfrom_list(cons($co("int")($co(0)(set$slnil)))(cons($co("float")($co(0)(set$slnil)))(cons($co("string")($co(0)(set$slnil)))(cons($co("bool")($co(0)(set$slnil)))(cons($co("map")($co(2)(set$slnil)))(cons($co("set")($co(1)(set$slnil)))(cons($co("->")($co(2)(set$slnil)))(nil)))))))))(map$slnil)(map$slfrom_list(cons($co("number")($co(cons("ord")(cons("eq")(nil)))($co(cons(inst(tint)("number"))(cons(inst(tcon("float")(-1))("number"))(nil)))(nil))))(cons($co("ord")($co(cons("eq")(nil))($co(cons(inst(tint)("ord"))(cons(inst(tcon("float")(-1))("ord"))(nil)))(nil))))(cons($co("eq")($co(nil)($co(cons(inst(tint)("eq"))(cons(inst(tcon("float")(-1))("eq"))(cons(inst(tbool)("eq"))(cons($eq$gt(cons(isin(tvar("a")(-1))("eq")(nil))(cons(isin(tvar("b")(-1))("eq")(nil))(nil)))(isin(tapp(tapp(tcon(",")(-1))(tvar("a")(-1))(-1))(tvar("b")(-1))(-1))("eq")(nil)))(nil)))))(nil))))(cons($co("floating")($co(nil)($co(cons($eq$gt(nil)(isin(tcon("float")(-1))("floating")(nil)))(nil))(nil))))(cons($co("pretty")($co(nil)($co(cons(inst(tint)("pretty"))(cons(inst(tstring)("pretty"))(cons(inst(tbool)("pretty"))(nil))))(nil))))(cons($co("show")($co(nil)($co(cons(inst(tint)("show"))(cons(inst(tstring)("show"))(cons(inst(tbool)("show"))(cons(inst(tcon("float")(-1))("show"))(nil)))))(nil))))(nil)))))))))((t) => (cls) => $eq$gt(nil)(isin(t)(cls)(nil))))(forall(set$slfrom_list(cons("a")(nil)))($eq$gt(cons(isin(a)("eq")(nil))(nil))(tfns(cons(a)(cons(a)(nil)))(tbool)(-1)))))(forall(set$slfrom_list(cons("a")(nil)))($eq$gt(cons(isin(a)("ord")(nil))(nil))(tfns(cons(a)(cons(a)(nil)))(tbool)(-1)))))(forall(set$slfrom_list(cons("a")(nil)))($eq$gt(cons(isin(a)("number")(nil))(nil))(tfns(cons(a)(cons(a)(nil)))(a)(-1)))))(vbl("b")))(vbl("a")))(generic(cons("k")(nil))))(generic(cons("k")(cons("v")(nil)))))(vbl("v2")))(vbl("v")))(vbl("k"));

const tenv$slwith_scope = ({4: typeclasses, 3: aliases, 2: types, 1: tcons, 0: values}) => (scope) => tenv(map$slmerge(scope)(values))(tcons)(types)(aliases)(typeclasses);

const scheme_$gts = ({1: {1: type, 0: preds}, 0: vbls}) => `${(($target) => {
if ($target.type === "nil") {
return ""
}
{
let vbls = $target;
return `forall ${join(" ")(vbls)} : `
}
throw new Error('Failed to match. ' + valueToString($target));
})(set$slto_list(vbls))}${join("")(map(pred_$gts)(preds))}${type_$gts(type)}`;

const pattern_to_ex_pattern = (tenv) => ({1: type, 0: pattern}) => (($target) => {
if ($target.type === "pvar") {
return ex$slany
}
if ($target.type === "pany") {
return ex$slany
}
if ($target.type === "pstr") {
{
let str = $target[0];
return ex$slconstructor(str)("string")(nil)
}
}
if ($target.type === "pprim" &&
$target[0].type === "pint") {
{
let v = $target[0][0];
return ex$slconstructor(int_to_string(v))("int")(nil)
}
}
if ($target.type === "pprim" &&
$target[0].type === "pfloat") {
{
let v = $target[0][0];
return ex$slconstructor(jsonify(v))("float")(nil)
}
}
if ($target.type === "pprim" &&
$target[0].type === "pbool") {
{
let v = $target[0][0];
return ex$slconstructor((($target) => {
if ($target === true) {
return "true"
}
return "false"
throw new Error('Failed to match. ' + valueToString($target));
})(v))("bool")(nil)
}
}
if ($target.type === "pcon") {
{
let name = $target[0];
let args = $target[2];
let l = $target[3];
return (({1: targs, 0: tname}) => (({1: tcons}) => (({1: {1: cres, 0: cargs}, 0: free_names}) => ((subst) => ex$slconstructor(name)(tname)(map(pattern_to_ex_pattern(tenv))(zip(args)(map(type$slapply(subst))(cargs)))))(map$slfrom_list(zip(free_names)(targs))))((($target) => {
if ($target.type === "none") {
return fatal(`Unknown type constructor ${name}`)
}
if ($target.type === "some") {
{
let v = $target[0];
return v
}
}
throw new Error('Failed to match. ' + valueToString($target));
})(map$slget(tcons)(name))))(tenv))(tcon_and_args(type)(nil)(l))
}
}
throw new Error('Failed to match. ' + valueToString($target));
})(pattern);

const group_constructors = (tenv) => (gid) => (($target) => {
if ($target === "int") {
return nil
}
if ($target === "bool") {
return cons("true")(cons("false")(nil))
}
if ($target === "string") {
return nil
}
return (({2: types}) => (($target) => {
if ($target.type === "none") {
return fatal(`Unknown type name ${gid}`)
}
if ($target.type === "some" &&
$target[0].type === ",") {
{
let names = $target[0][1];
return set$slto_list(names)
}
}
throw new Error('Failed to match. ' + valueToString($target));
})(map$slget(types)(gid)))(tenv)
throw new Error('Failed to match. ' + valueToString($target));
})(gid);

const terr = (v0) => (v1) => ({type: "terr", 0: v0, 1: v1})
const ttypes = (v0) => (v1) => ({type: "ttypes", 0: v0, 1: v1})
const twrap = (v0) => (v1) => ({type: "twrap", 0: v0, 1: v1})
const tmissing = (v0) => ({type: "tmissing", 0: v0})
const type_error = (message) => (loced_items) => terr(message)(loced_items);

const type_error_$gts = (err) => (($target) => {
if ($target.type === "twrap") {
{
let inner = $target[1];
return type_error_$gts(inner)
}
}
if ($target.type === "tmissing") {
{
let missing = $target[0];
return `Missing values: ${join("")(map(({1: loc, 0: name}) => `\n - ${name} (${int_to_string(loc)})`)(missing))}`
}
}
if ($target.type === "ttypes") {
{
let t1 = $target[0];
let t2 = $target[1];
return `Incompatible types: ${scheme_$gts(t1)} and ${scheme_$gts(t2)}`
}
}
if ($target.type === "terr") {
{
let message = $target[0];
let names = $target[1];
return `${message}${join("")(map(({1: loc, 0: name}) => `\n - ${name} (${int_to_string(loc)})`)(names))}`
}
}
throw new Error('Failed to match. ' + valueToString($target));
})(err);

const err_to_fatal = (x) => (($target) => {
if ($target.type === "ok") {
{
let v = $target[0];
return v
}
}
if ($target.type === "err") {
{
let e = $target[0];
return fatal(`Result is err ${type_error_$gts(e)}`)
}
}
throw new Error('Failed to match. ' + valueToString($target));
})(x);

const $lt_err = (x) => $lt_err$ti(terr(x)(nil));

const $lt_missing = (name) => (loc) => $lt_err$ti(tmissing(cons($co(name)(loc))(nil)));

const $lt_mismatch = (t1) => (t2) => $lt_err$ti(ttypes(forall(set$slnil)($eq$gt(nil)(t1)))(forall(set$slnil)($eq$gt(nil)(t2))));

const type_$gtcst = (type) => (($target) => {
if ($target.type === "tvar") {
{
let name = $target[0];
let l = $target[1];
return cst$slid(name)(l)
}
}
if ($target.type === "tcon") {
{
let name = $target[0];
let l = $target[1];
return cst$slid(name)(l)
}
}
if ($target.type === "tapp" &&
$target[0].type === "tapp" &&
$target[0][0].type === "tcon" &&
$target[0][0][0] === "->") {
{
let l = $target[2];
return (({1: res, 0: args}) => cst$sllist(cons(cst$slid("fn")(l))(cons(cst$slarray(map(type_$gtcst)(args))(l))(cons(type_$gtcst(res))(nil))))(l))(fn_args_and_body(type))
}
}
if ($target.type === "tapp") {
{
let l = $target[2];
return (({1: args, 0: name}) => cst$sllist(cons(type_$gtcst(name))(map(type_$gtcst)(args)))(l))(target_and_args(type)(nil))
}
}
throw new Error('Failed to match. ' + valueToString($target));
})(type);

const expr_loc = (expr) => (($target) => {
if ($target.type === "evar") {
{
let l = $target[1];
return l
}
}
if ($target.type === "eprim") {
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
if ($target.type === "estr") {
{
let l = $target[2];
return l
}
}
if ($target.type === "elambda") {
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
if ($target.type === "elet") {
{
let l = $target[2];
return l
}
}
throw new Error('Failed to match. ' + valueToString($target));
})(expr);

const record_if_generic = ({1: {1: t}, 0: free}) => (l) => (($target) => {
if ($target.type === "nil") {
return $lt_($unit)
}
return record_type_$gt(t)(l)(true)
throw new Error('Failed to match. ' + valueToString($target));
})(set$slto_list(free));

const qual$eq = ({1: t, 0: preds}) => ({1: t$qu, 0: preds$qu}) => (t$eq) => (($target) => {
if ($target === true) {
return t$eq(t)(t$qu)
}
return false
throw new Error('Failed to match. ' + valueToString($target));
})(list$eq(preds)(preds$qu)(pred$eq));

const qual$slfree = ({1: contents, 0: predicates}) => (contents$slfree) => foldl(contents$slfree(contents))(map(predicate$slfree)(predicates))(set$slmerge);

const qual$slapply = (contents$slapply) => (subst) => ({1: contents, 0: predicates}) => $eq$gt(map(predicate$slapply(subst))(predicates))(contents$slapply(subst)(contents));

const qualt$slapply_$gt = apply_$gt(qual$slapply(type$slapply));

const predicate$slcombine = (preds) => loop($co(nil)(preds))(({1: right, 0: left}) => (recur) => (($target) => {
if ($target.type === "nil") {
return left
}
if ($target.type === "cons") {
{
let one = $target[0];
let rest = $target[1];
return recur($co(loop(left)((left) => (recur) => (($target) => {
if ($target.type === "nil") {
return cons(one)(nil)
}
if ($target.type === "cons") {
{
let lone = $target[0];
let rest = $target[1];
return (($target) => {
if ($target.type === "some") {
{
let merged = $target[0];
return cons(merged)(rest)
}
}
if ($target.type === "none") {
return cons(lone)(recur(rest))
}
throw new Error('Failed to match. ' + valueToString($target));
})(predicate$slmerge(one)(lone))
}
}
throw new Error('Failed to match. ' + valueToString($target));
})(left)))(rest))
}
}
throw new Error('Failed to match. ' + valueToString($target));
})(right));

const with_preds = (preds) => ({1: {1: type, 0: p2}, 0: free}) => forall(free)($eq$gt(concat(cons(p2)(cons(filter(pred_contains(free))(preds))(nil))))(type));

const type_match = (t1) => (t2) => (($target) => {
if ($target.type === "," &&
$target[0].type === "tapp" &&
$target[1].type === "tapp") {
{
let l = $target[0][0];
let r = $target[0][1];
let loc = $target[0][2];
let l$qu = $target[1][0];
let r$qu = $target[1][1];
return (($target) => {
if ($target.type === "ok") {
{
let sl = $target[0];
return (($target) => {
if ($target.type === "ok") {
{
let sr = $target[0];
return ok(merge(sl)(sr)(loc))
}
}
{
let err = $target;
return err
}
throw new Error('Failed to match. ' + valueToString($target));
})(type_match(r)(r$qu))
}
}
{
let err = $target;
return err
}
throw new Error('Failed to match. ' + valueToString($target));
})(type_match(l)(l$qu))
}
}
if ($target.type === "," &&
$target[0].type === "tvar") {
{
let u = $target[0][0];
let t = $target[1];
return ok(map$slset(map$slnil)(u)(t))
}
}
if ($target.type === "," &&
$target[0].type === "tcon" &&
$target[1].type === "tcon") {
{
let tc1 = $target[0][0];
let tc2 = $target[1][0];
return (($target) => {
if ($target === true) {
return ok(map$slnil)
}
return err($co(`Unable to match types ${tc1} and ${tc2}`)(nil))
throw new Error('Failed to match. ' + valueToString($target));
})($eq(tc1)(tc2))
}
}
return err($co(`Unable to match ${type_$gts(t1)} vs ${type_$gts(t2)}`)(nil))
throw new Error('Failed to match. ' + valueToString($target));
})($co(t1)(t2));

const ok_$gt = (result) => (($target) => {
if ($target.type === "ok") {
{
let v = $target[0];
return $lt_(v)
}
}
if ($target.type === "err") {
{
let e = $target[0];
return $lt_err(e)
}
}
throw new Error('Failed to match. ' + valueToString($target));
})(result);

const pred_$gtcst = ({1: name, 0: t}) => cst$sllist(cons(cst$slid("isin")(-1))(cons(type_$gtcst(t))(cons(cst$slstring("name")(nil)(-1))(nil))))(-1);

const run_and_preds = (statet) => (({1: result, 0: {1: {1: {1: types, 0: preds}, 0: subst}, 0: idx}}) => $co(err_to_fatal(result))(predicate$slcombine(map(predicate$slapply(subst))(bag$slto_list(preds)))))(state_f(statet)(state$slnil));

const scheme$slfree = ({1: type, 0: vbls}) => set$sldiff(qual$slfree(type)(type$slfree))(vbls);

const tenv$slfree = ({0: values}) => foldr(set$slnil)(map(scheme$slfree)(map$slvalues(values)))(set$slmerge);

{
    const test = (a) => set$slto_list(scheme$slfree(a));
    
    const in_0 = forall(set$slfrom_list(cons("a")(nil)))($eq$gt(nil)(tvar("a")(-1)));
    const mod_0 = test(in_0);
    const out_0 = nil;
    if (!equal(mod_0, out_0)) {
        console.log(mod_0);
        console.log(out_0);
        throw new Error(`Fixture test (501) failing 0. Not equal.`);
    }
    

    const in_1 = forall(set$slfrom_list(nil))($eq$gt(nil)(tvar("a")(-1)));
    const mod_1 = test(in_1);
    const out_1 = cons("a")(nil);
    if (!equal(mod_1, out_1)) {
        console.log(mod_1);
        console.log(out_1);
        throw new Error(`Fixture test (501) failing 1. Not equal.`);
    }
    
}
const scheme$slapply = (subst) => ({1: qualified_type, 0: vbls}) => forall(vbls)(qual$slapply(type$slapply)(map_without(subst)(vbls))(qualified_type));

const generalize = (tenv) => (qual) => forall(set$sldiff(qual$slfree(qual)(type$slfree))(tenv$slfree(tenv)))(qual);

const instantiate = ({1: qual, 0: vars}) => (l) => $gt$gt$eq(make_subst_for_free(vars)(l))((subst) => $gt$gt$eq($lt_(qual$slapply(type$slapply)(subst)(qual)))(({1: t, 0: preds}) => $gt$gt$eq(preds_$gt(mapi(predicate$slreloc(l))(preds)))((_) => $lt_(t))));

const var_bind = ($var) => (type) => (l) => (($target) => {
if ($target.type === "tvar") {
{
let v = $target[0];
return (($target) => {
if ($target === true) {
return $lt_($unit)
}
return $gt$gt$eq(subst_$gt(one_subst($var)(type)))((_) => $lt_($unit))
throw new Error('Failed to match. ' + valueToString($target));
})($eq($var)(v))
}
}
return (($target) => {
if ($target === true) {
return $lt_err(`Cycle found while unifying type with type variable. ${$var}`)
}
return $gt$gt$eq(subst_$gt(one_subst($var)(type)))((_) => $lt_($unit))
throw new Error('Failed to match. ' + valueToString($target));
})(set$slhas(type$slfree(type))($var))
throw new Error('Failed to match. ' + valueToString($target));
})(type);

const instantiate_tcon = ({1: tcons}) => (name) => (l) => (($target) => {
if ($target.type === "none") {
return $lt_err(`Unknown type constructor: ${name}`)
}
if ($target.type === "some" &&
$target[0].type === "," &&
$target[0][1].type === ",") {
{
let free = $target[0][0];
let cargs = $target[0][1][0];
let cres = $target[0][1][1];
return $gt$gt$eq(make_subst_for_free(set$slfrom_list(free))(l))((subst) => $lt_($co(map(type$slapply(subst))(cargs))(type$slapply(subst)(cres))))
}
}
throw new Error('Failed to match. ' + valueToString($target));
})(map$slget(tcons)(name));

const add$sldeftype = ({3: aliases, 2: types, 1: tcons}) => (name) => (args) => (constrs) => (l) => ((free) => ((free_set) => ((res) => ((parsed_constrs) => tenv(map$slfrom_list(map(({1: {1: {1: res, 0: args}, 0: free}, 0: name}) => $co(name)(forall(set$slfrom_list(free))($eq$gt(nil)(tfns(args)(res)(l)))))(parsed_constrs)))(map$slfrom_list(parsed_constrs))(map$slset(map$slnil)(name)($co(length(args))(set$slfrom_list(map(fst)(constrs)))))(map$slnil)(map$slnil))(map(({1: {1: {0: args}}, 0: name}) => ((args) => ((args) => $co(name)($co(free)($co(args)(res))))(map(type$slresolve_aliases(aliases))(args)))(map(type$slcon_to_var(free_set))(args)))(constrs)))(foldl(tcon(name)(l))(args)((inner) => ({1: l, 0: name}) => tapp(inner)(tvar(name)(l))(l))))(set$slfrom_list(free)))(map(fst)(args));

const scope$slapply = (subst) => (scope) => map$slmap(scheme$slapply(subst))(scope);

const scope$slapply_$gt = apply_$gt(scope$slapply);

const scheme$slapply_$gt = apply_$gt(scheme$slapply);

const args_if_complete = (tenv) => (matrix) => ((heads) => ((gid) => (($target) => {
if ($target.type === "none") {
return map$slnil
}
if ($target.type === "some") {
{
let gid = $target[0];
return ((found) => (($target) => {
if ($target.type === "nil") {
return map$slnil
}
{
let constrs = $target;
return loop(constrs)((constrs) => (recur) => (($target) => {
if ($target.type === "nil") {
return found
}
if ($target.type === "cons") {
{
let id = $target[0];
let rest = $target[1];
return (($target) => {
if ($target.type === "none") {
return map$slnil
}
if ($target.type === "some") {
return recur(rest)
}
throw new Error('Failed to match. ' + valueToString($target));
})(map$slget(found)(id))
}
}
throw new Error('Failed to match. ' + valueToString($target));
})(constrs))
}
throw new Error('Failed to match. ' + valueToString($target));
})(group_constructors(tenv)(gid)))(map$slfrom_list(fold_ex_pats(nil)(heads)((found) => (head) => (($target) => {
if ($target.type === "ex/constructor") {
{
let id = $target[0];
let args = $target[2];
return cons($co(id)(length(args)))(found)
}
}
return found
throw new Error('Failed to match. ' + valueToString($target));
})(head))))
}
}
throw new Error('Failed to match. ' + valueToString($target));
})(gid))(find_gid(heads)))(map((row) => (($target) => {
if ($target.type === "nil") {
return fatal("is-complete called with empty row")
}
if ($target.type === "cons") {
{
let head = $target[0];
return head
}
}
throw new Error('Failed to match. ' + valueToString($target));
})(row))(matrix));

const scheme_$gtcst = ({1: {1: type, 0: preds}}) => ((t) => (($target) => {
if ($target.type === "nil") {
return t
}
return cst$sllist(cons(cst$slid("=>")(-1))(cons(cst$slarray(map(pred_$gtcst)(preds))(-1))(cons(t)(nil))))(-1)
throw new Error('Failed to match. ' + valueToString($target));
})(preds))(type_$gtcst(type));

const by_inst = (classes) => (pred) => (({2: locs, 1: cls, 0: t}) => (({1: {0: insts}}) => find_some(({1: {1: cls2, 0: t2}, 0: ps}) => (($target) => {
if ($target === true) {
return none
}
return (($target) => {
if ($target.type === "err") {
return none
}
if ($target.type === "ok") {
{
let subst = $target[0];
return some(map(predicate$slapply(subst))(ps))
}
}
throw new Error('Failed to match. ' + valueToString($target));
})(type_match(t2)(t))
throw new Error('Failed to match. ' + valueToString($target));
})($ex$eq(cls)(cls2)))(insts))((($target) => {
if ($target.type === "some") {
{
let s = $target[0];
return s
}
}
return fatal(`Unknown class '${cls}' in predicate [by-inst]`)
throw new Error('Failed to match. ' + valueToString($target));
})(map$slget(classes)(cls))))(pred);

const entail = (classes) => (predicates) => (predicate) => (($target) => {
if ($target === true) {
return true
}
return (($target) => {
if ($target.type === "none") {
return false
}
if ($target.type === "some") {
{
let qs = $target[0];
return all(entail(classes)(predicates))(qs)
}
}
throw new Error('Failed to match. ' + valueToString($target));
})(by_inst(classes)(predicate))
throw new Error('Failed to match. ' + valueToString($target));
})(any(any(pred$eq(predicate)))(map(by_super(classes))(predicates)));

const candidates = (classes) => ({1: qs, 0: v}) => ((is) => ((ts) => (($target) => {
if ($target === true) {
return nil
}
return filter((t$qu) => all(entail(classes)(nil))(map((i) => isin(t$qu)(i)(nil))(is)))(default_types)
throw new Error('Failed to match. ' + valueToString($target));
})(not(every(cons(all(type$eq(tvar(v)(-1)))(ts))(cons(any((x) => any($eq(x))(numClasses))(is))(cons(all((x) => any($eq(x))(stdClasses))(is))(nil))))((x) => x))))(map(({0: t}) => t)(qs)))(map(({1: i}) => i)(qs));

const simplify_inner = (ce) => (rs) => (preds) => (($target) => {
if ($target.type === "nil") {
return rs
}
if ($target.type === "cons") {
{
let p = $target[0];
let ps = $target[1];
return (($target) => {
if ($target === true) {
return simplify_inner(ce)(rs)(ps)
}
return simplify_inner(ce)(cons(p)(rs))(ps)
throw new Error('Failed to match. ' + valueToString($target));
})(entail(ce)(concat(cons(rs)(cons(ps)(nil))))(p))
}
}
throw new Error('Failed to match. ' + valueToString($target));
})(preds);

const simplify = (ce) => simplify_inner(ce)(nil);

const to_hnfs = (ce) => (ps) => (($target) => {
if ($target.type === "err") {
{
let e = $target[0];
return err(e)
}
}
if ($target.type === "ok") {
{
let v = $target[0];
return ok(concat(v))
}
}
throw new Error('Failed to match. ' + valueToString($target));
})(map$slok(to_hnf(ce))(ps));


const to_hnf = (ce) => (p) => (($target) => {
if ($target === true) {
return ok(cons(p)(nil))
}
return (($target) => {
if ($target.type === "none") {
return (({1: name, 0: type}) => err(`Can't find an instance for class '${name}' for type ${type_$gts(type)}`))(p)
}
if ($target.type === "some") {
{
let ps = $target[0];
return to_hnfs(ce)(ps)
}
}
throw new Error('Failed to match. ' + valueToString($target));
})(by_inst(ce)(p))
throw new Error('Failed to match. ' + valueToString($target));
})(in_hnf(p));

const tenv$slapply = (subst) => ({4: typeclasses, 3: aliases, 2: types, 1: tcons, 0: values}) => tenv(scope$slapply(subst)(values))(tcons)(types)(aliases)(typeclasses);

const unify_inner = (t1) => (t2) => (l) => (($target) => {
if ($target.type === "," &&
$target[0].type === "tvar") {
{
let $var = $target[0][0];
let l = $target[0][1];
let t = $target[1];
return var_bind($var)(t)(l)
}
}
if ($target.type === "," &&
$target[1].type === "tvar") {
{
let t = $target[0];
let $var = $target[1][0];
let l = $target[1][1];
return var_bind($var)(t)(l)
}
}
if ($target.type === "," &&
$target[0].type === "tcon" &&
$target[1].type === "tcon") {
{
let a = $target[0][0];
let la = $target[0][1];
let b = $target[1][0];
let lb = $target[1][1];
return (($target) => {
if ($target === true) {
return $lt_($unit)
}
return $lt_mismatch(t1)(t2)
throw new Error('Failed to match. ' + valueToString($target));
})($eq(a)(b))
}
}
if ($target.type === "," &&
$target[0].type === "tapp" &&
$target[1].type === "tapp") {
{
let t1 = $target[0][0];
let a1 = $target[0][1];
let t2 = $target[1][0];
let a2 = $target[1][1];
return $gt$gt$eq(unify_inner(t1)(t2)(l))((_) => $gt$gt$eq($lt_subst)((subst) => $gt$gt$eq(unify_inner(type$slapply(subst)(a1))(type$slapply(subst)(a2))(l))((_) => $lt_($unit))))
}
}
return $lt_mismatch(t1)(t2)
throw new Error('Failed to match. ' + valueToString($target));
})($co(t1)(t2));

const tenv$slapply_$gt = apply_$gt(tenv$slapply);

const is_useful = (tenv) => (matrix) => (row) => ((head_and_rest) => (($target) => {
if ($target.type === "none") {
return false
}
if ($target.type === "some" &&
$target[0].type === ",") {
{
let head = $target[0][0];
let rest = $target[0][1];
return (($target) => {
if ($target.type === "ex/constructor") {
{
let id = $target[0];
let args = $target[2];
return is_useful(tenv)(specialized_matrix(id)(length(args))(matrix))(concat(cons(args)(cons(rest)(nil))))
}
}
if ($target.type === "ex/any") {
return (($target) => {
if ($target.type === "nil") {
return (($target) => {
if ($target.type === "nil") {
return true
}
{
let defaults = $target;
return is_useful(tenv)(defaults)(rest)
}
throw new Error('Failed to match. ' + valueToString($target));
})(default_matrix(matrix))
}
{
let alts = $target;
return any(({1: alt, 0: id}) => is_useful(tenv)(specialized_matrix(id)(alt)(matrix))(concat(cons(any_list(alt))(cons(rest)(nil)))))(alts)
}
throw new Error('Failed to match. ' + valueToString($target));
})(map$slto_list(args_if_complete(tenv)(matrix)))
}
if ($target.type === "ex/or") {
{
let left = $target[0];
let right = $target[1];
return (($target) => {
if ($target === true) {
return true
}
return is_useful(tenv)(matrix)(cons(right)(rest))
throw new Error('Failed to match. ' + valueToString($target));
})(is_useful(tenv)(matrix)(cons(left)(rest)))
}
}
throw new Error('Failed to match. ' + valueToString($target));
})(head)
}
}
throw new Error('Failed to match. ' + valueToString($target));
})(head_and_rest))((($target) => {
if ($target.type === "nil") {
return none
}
if ($target.type === "cons" &&
$target[0].type === "nil") {
return none
}
if ($target.type === "cons") {
return (($target) => {
if ($target.type === "nil") {
return none
}
if ($target.type === "cons") {
{
let head = $target[0];
let rest = $target[1];
return some($co(head)(rest))
}
}
throw new Error('Failed to match. ' + valueToString($target));
})(row)
}
throw new Error('Failed to match. ' + valueToString($target));
})(matrix));

const unify = (t1) => (t2) => (l) => map_err_$gt(unify_inner(t1)(t2)(l))((inner) => err(twrap(ttypes(forall(set$slnil)($eq$gt(nil)(t1)))(forall(set$slnil)($eq$gt(nil)(t2))))(inner)));

const with_defaults = (f) => (ce) => (known_variables) => (predicates) => ((vps) => ((tss) => (($target) => {
if ($target === true) {
return err(`Cannot resolve ambiguities: ${vps_$gts(vps)} defaults for variables: ${tss_$gts(tss)} with known variables: ${join("; ")(set$slto_list(known_variables))}`)
}
return ok(f(vps)(map(head)(tss)))
throw new Error('Failed to match. ' + valueToString($target));
})(any(is_empty)(tss)))(map(candidates(ce))(vps)))(ambiguities(known_variables)(predicates));

const reduce = (ce) => (ps) => (($target) => {
if ($target.type === "ok") {
{
let qs = $target[0];
return ok(simplify(ce)(qs))
}
}
if ($target.type === "err") {
{
let e = $target[0];
return err(e)
}
}
throw new Error('Failed to match. ' + valueToString($target));
})(to_hnfs(ce)(ps));

const defaulted_preds = with_defaults((vps) => (ts) => concat(map(snd)(vps)));

const default_subst = with_defaults((vps) => (ts) => map$slfrom_list(zip(map(fst)(vps))(ts)));

const infer$slpattern = (tenv) => (pattern) => (($target) => {
if ($target.type === "pvar") {
{
let name = $target[0];
let l = $target[1];
return $gt$gt$eq(new_type_var(name)(l))((v) => $gt$gt$eq(record_type_$gt(v)(l)(false))((_) => $lt_($co(v)(map$slfrom_list(cons($co(name)(forall(set$slnil)($eq$gt(nil)(v))))(nil))))))
}
}
if ($target.type === "pany") {
{
let l = $target[0];
return $gt$gt$eq(new_type_var("any")(l))((v) => $lt_($co(v)(map$slnil)))
}
}
if ($target.type === "pstr") {
{
let l = $target[1];
return $lt_($co(tcon("string")(l))(map$slnil))
}
}
if ($target.type === "pprim" &&
$target[0].type === "pbool") {
{
let l = $target[1];
return $lt_($co(tcon("bool")(l))(map$slnil))
}
}
if ($target.type === "pprim" &&
$target[0].type === "pint") {
{
let l = $target[1];
return $lt_($co(tcon("int")(l))(map$slnil))
}
}
if ($target.type === "pprim" &&
$target[0].type === "pfloat") {
{
let l = $target[1];
return $lt_($co(tcon("float")(l))(map$slnil))
}
}
if ($target.type === "pcon") {
{
let name = $target[0];
let args = $target[2];
let l = $target[3];
return $gt$gt$eq(instantiate_tcon(tenv)(name)(l))(({1: cres, 0: cargs}) => $gt$gt$eq(record_type_$gt(tfns(cargs)(cres)(l))(l)(false))((_) => $gt$gt$eq(map_$gt(infer$slpattern(tenv))(args))((sub_patterns) => $gt$gt$eq($lt_(unzip(sub_patterns)))(({1: scopes, 0: arg_types}) => $gt$gt$eq(do_$gt(({1: ctype, 0: ptype}) => unify(ptype)(ctype)(l))(zip(arg_types)(cargs)))((_) => $gt$gt$eq(type$slapply_$gt(cres))((cres) => $gt$gt$eq($lt_(foldl(map$slnil)(scopes)(map$slmerge)))((scope) => $lt_($co(cres)(scope)))))))))
}
}
throw new Error('Failed to match. ' + valueToString($target));
})(pattern);

const is_exhaustive = (tenv) => (matrix) => (($target) => {
if ($target === true) {
return false
}
return true
throw new Error('Failed to match. ' + valueToString($target));
})(is_useful(tenv)(matrix)(cons(ex$slany)(nil)));

const split = (ce) => (free_in_scope) => (value_tyvars) => (ps) => $gt$gt$eq(ok_$gt(reduce(ce)(ps)))((ps$qu) => $gt$gt$eq($lt_(partition(ps$qu)(({2: locs, 1: name, 0: type}) => every(set$slto_list(type$slfree(type)))((x) => any($eq(x))(free_in_scope)))))(({1: rs, 0: ds}) => $gt$gt$eq(ok_$gt(defaulted_preds(ce)(set$slfrom_list(concat(cons(free_in_scope)(cons(value_tyvars)(nil)))))(rs)))((rs$qu) => $gt$gt$eq(ok_$gt(default_subst(ce)(set$slfrom_list(concat(cons(free_in_scope)(cons(value_tyvars)(nil)))))(rs)))((subst) => $lt_($co(ds)($co(without(rs)(rs$qu)(pred$eq))($co(map(predicate$slapply(subst))(rs$qu))(subst))))))));

const check_exhaustiveness = (tenv) => (target_type) => (patterns) => (l) => $gt$gt$eq(type$slapply_$gt(target_type))((target_type) => $gt$gt$eq($lt_(map((pat) => cons(pattern_to_ex_pattern(tenv)($co(pat)(target_type)))(nil))(patterns)))((matrix) => (($target) => {
if ($target === true) {
return $lt_($unit)
}
return $lt_err(`Match not exhaustive ${int_to_string(l)}`)
throw new Error('Failed to match. ' + valueToString($target));
})(is_exhaustive(tenv)(matrix))));

const infer$slexpr_inner = (tenv) => (expr) => (($target) => {
if ($target.type === "evar") {
{
let name = $target[0];
let l = $target[1];
return (($target) => {
if ($target.type === "none") {
return $lt_missing(name)(l)
}
if ($target.type === "some") {
{
let scheme = $target[0];
return $gt$gt$eq(record_if_generic(scheme)(l))((_) => instantiate(scheme)(l))
}
}
throw new Error('Failed to match. ' + valueToString($target));
})(tenv$slresolve(tenv)(name))
}
}
if ($target.type === "eprim") {
{
let prim = $target[0];
return infer$slprim(prim)
}
}
if ($target.type === "equot") {
{
let quot = $target[0];
let l = $target[1];
return $lt_(infer$slquot(quot)(l))
}
}
if ($target.type === "estr") {
{
let templates = $target[1];
let l = $target[2];
return $gt$gt$eq(do_$gt(({0: expr}) => $gt$gt$eq(infer$slexpr(tenv)(expr))((t) => $gt$gt$eq(unify(t)(tcon("string")(l))(l))((_) => $lt_($unit))))(templates))((_) => $lt_(tcon("string")(l)))
}
}
if ($target.type === "elambda" &&
$target[0].type === "cons" &&
$target[0][0].type === "pvar" &&
$target[0][1].type === "nil") {
{
let arg = $target[0][0][0];
let al = $target[0][0][1];
let body = $target[1];
let l = $target[2];
return $gt$gt$eq(new_type_var(arg)(al))((arg_type) => $gt$gt$eq(record_type_$gt(arg_type)(al)(false))((_) => $gt$gt$eq($lt_(tenv$slwith_type(tenv)(arg)(forall(set$slnil)($eq$gt(nil)(arg_type)))))((bound_env) => $gt$gt$eq(infer$slexpr(bound_env)(body))((body_type) => $gt$gt$eq(type$slapply_$gt(arg_type))((arg_type) => $lt_(tfn(arg_type)(body_type)(l)))))))
}
}
if ($target.type === "elambda" &&
$target[0].type === "cons" &&
$target[0][1].type === "nil") {
{
let pat = $target[0][0];
let body = $target[1];
let l = $target[2];
return $gt$gt$eq(infer$slpattern(tenv)(pat))(({1: scope, 0: arg_type}) => $gt$gt$eq($lt_(tenv$slwith_scope(tenv)(scope)))((bound_env) => $gt$gt$eq(infer$slexpr(bound_env)(body))((body_type) => $gt$gt$eq(type$slapply_$gt(arg_type))((arg_type) => $lt_(tfn(arg_type)(body_type)(l))))))
}
}
if ($target.type === "elambda" &&
$target[0].type === "cons") {
{
let one = $target[0][0];
let rest = $target[0][1];
let body = $target[1];
let l = $target[2];
return infer$slexpr(tenv)(elambda(cons(one)(nil))(elambda(rest)(body)(l))(l))
}
}
if ($target.type === "elambda" &&
$target[0].type === "nil") {
{
let body = $target[1];
let l = $target[2];
return $lt_err("No args to lambda")
}
}
if ($target.type === "eapp" &&
$target[1].type === "cons" &&
$target[1][1].type === "nil") {
{
let target = $target[0];
let arg = $target[1][0];
let l = $target[2];
return $gt$gt$eq(new_type_var("result")(l))((result_var) => $gt$gt$eq(infer$slexpr(tenv)(target))((target_type) => $gt$gt$eq(tenv$slapply_$gt(tenv))((arg_tenv) => $gt$gt$eq(infer$slexpr(arg_tenv)(arg))((arg_type) => $gt$gt$eq(type$slapply_$gt(target_type))((target_type) => $gt$gt$eq(unify(target_type)(tfn(arg_type)(result_var)(l))(l))((_) => type$slapply_$gt(result_var)))))))
}
}
if ($target.type === "eapp" &&
$target[1].type === "cons") {
{
let target = $target[0];
let one = $target[1][0];
let rest = $target[1][1];
let l = $target[2];
return infer$slexpr(tenv)(eapp(eapp(target)(cons(one)(nil))(l))(rest)(l))
}
}
if ($target.type === "eapp" &&
$target[1].type === "nil") {
{
let target = $target[0];
let l = $target[2];
return infer$slexpr(tenv)(target)
}
}
if ($target.type === "elet" &&
$target[0].type === "cons" &&
$target[0][0].type === "," &&
$target[0][0][0].type === "pvar" &&
$target[0][1].type === "nil") {
{
let name = $target[0][0][0][0];
let nl = $target[0][0][0][1];
let value = $target[0][0][1];
let body = $target[1];
return $gt$gt$eq(infer$slexpr(tenv)(value))((value_type) => $gt$gt$eq(record_type_$gt(value_type)(nl)(false))((_) => $gt$gt$eq(tenv$slapply_$gt(tenv))((applied_env) => $gt$gt$eq($lt_(generalize(applied_env)($eq$gt(nil)(value_type))))((scheme) => $gt$gt$eq($lt_(tenv$slwith_type(applied_env)(name)(scheme)))((bound_env) => infer$slexpr(bound_env)(body))))))
}
}
if ($target.type === "elet" &&
$target[0].type === "cons" &&
$target[0][0].type === "," &&
$target[0][1].type === "nil") {
{
let pat = $target[0][0][0];
let value = $target[0][0][1];
let body = $target[1];
let l = $target[2];
return $gt$gt$eq(infer$slpattern(tenv)(pat))(({1: scope, 0: type}) => $gt$gt$eq(infer$slexpr(tenv)(value))((value_type) => $gt$gt$eq(unify(type)(value_type)(l))((_) => $gt$gt$eq(scope$slapply_$gt(scope))((scope) => $gt$gt$eq($lt_(tenv$slwith_scope(tenv)(scope)))((bound_env) => $gt$gt$eq(infer$slexpr(bound_env)(body))((body_type) => $lt_(body_type)))))))
}
}
if ($target.type === "elet" &&
$target[0].type === "cons") {
{
let one = $target[0][0];
let more = $target[0][1];
let body = $target[1];
let l = $target[2];
return infer$slexpr(tenv)(elet(cons(one)(nil))(elet(more)(body)(l))(l))
}
}
if ($target.type === "elet" &&
$target[0].type === "nil") {
{
let body = $target[1];
let l = $target[2];
return $lt_err("No bindings in let")
}
}
if ($target.type === "ematch") {
{
let target = $target[0];
let cases = $target[1];
let l = $target[2];
return $gt$gt$eq(infer$slexpr(tenv)(target))((target_type) => $gt$gt$eq(new_type_var("match result")(l))((result_type) => $gt$gt$eq(foldl_$gt($co(target_type)(nil))(cases)(({1: results, 0: target_type}) => ({1: body, 0: pat}) => $gt$gt$eq(infer$slpattern(tenv)(pat))(({1: scope, 0: type}) => $gt$gt$eq(unify(type)(target_type)(l))((_) => $gt$gt$eq(scope$slapply_$gt(scope))((scope) => $gt$gt$eq($lt_(tenv$slwith_scope(tenv)(scope)))((bound_env) => $gt$gt$eq(infer$slexpr(bound_env)(body))((body_type) => $gt$gt$eq(type$slapply_$gt(target_type))((target_type) => $lt_($co(target_type)(cons(body_type)(results)))))))))))(({1: all_results, 0: target_type}) => $gt$gt$eq(do_$gt((one_result) => $gt$gt$eq($lt_subst)((subst) => unify(type$slapply(subst)(one_result))(type$slapply(subst)(result_type))(l)))(reverse(all_results)))((_) => $gt$gt$eq(check_exhaustiveness(tenv)(target_type)(map(fst)(cases))(l))((_) => type$slapply_$gt(result_type))))))
}
}
throw new Error('Failed to match. ' + valueToString($target));
})(expr);


const infer$slexpr = (tenv) => (expr) => $gt$gt$eq(subst_reset_$gt(map$slnil))((old) => $gt$gt$eq(infer$slexpr_inner(tenv)(expr))((type) => $gt$gt$eq(subst_reset_$gt(old))(($new) => $gt$gt$eq(subst_$gt($new))((_) => $gt$gt$eq(record_type_$gt(type)(expr_loc(expr))(false))((_) => $lt_(type))))));

const add$sldefs = (tenv) => (defns) => $gt$gt$eq(reset_state_$gt)((_) => $gt$gt$eq($lt_(map(({0: name}) => name)(defns)))((names) => $gt$gt$eq($lt_(map(({1: {1: {1: l}}}) => l)(defns)))((locs) => $gt$gt$eq(map_$gt(({1: {0: nl}, 0: name}) => new_type_var(name)(nl))(defns))((vbls) => $gt$gt$eq($lt_(foldl(tenv)(zip(names)(map(forall(set$slnil))(map($eq$gt(nil))(vbls))))((tenv) => ({1: vbl, 0: name}) => tenv$slwith_type(tenv)(name)(vbl))))((bound_env) => $gt$gt$eq(map_$gt(({1: {1: {0: expr}}}) => infer$slexpr(bound_env)(expr))(defns))((types) => $gt$gt$eq(map_$gt(type$slapply_$gt)(vbls))((vbls) => $gt$gt$eq(do_$gt(({1: {1: loc, 0: type}, 0: vbl}) => unify(vbl)(type)(loc))(zip(vbls)(zip(types)(locs))))((_) => $gt$gt$eq(map_$gt(type$slapply_$gt)(types))((types) => $gt$gt$eq($lt_subst)((subst) => $gt$gt$eq($lt_preds)((preds) => $gt$gt$eq($lt_(predicate$slcombine(map(predicate$slapply(subst))(bag$slto_list(preds)))))((preds) => $gt$gt$eq($lt_(tenv))(({4: class_env}) => $gt$gt$eq(split(class_env)(nil)((($target) => {
if ($target === true) {
return set$slto_list(foldl(set$slnil)(map(type$slfree)(types))(set$slmerge))
}
return nil
throw new Error('Failed to match. ' + valueToString($target));
})(all(({1: {1: {0: body}}}) => (($target) => {
if ($target.type === "elambda") {
return true
}
return false
throw new Error('Failed to match. ' + valueToString($target));
})(body))(defns)))(preds))(({1: {1: {1: subst2, 0: defaulted_preds}, 0: other_preds}, 0: free_preds}) => $gt$gt$eq(preds_$gt(defaulted_preds))((_) => $gt$gt$eq(subst_$gt(subst2))((_) => $gt$gt$eq($lt_(map(type$slapply(subst2))(types)))((types) => $lt_(foldl(tenv$slnil)(zip(names)(types))((tenv) => ({1: type, 0: name}) => tenv$slwith_type(tenv)(name)(with_preds(other_preds)(generalize(tenv)($eq$gt(nil)(type)))))))))))))))))))))));

{
    const test = (x) => run_and_preds(add$sldefs(builtin_env)(map(({3: l, 2: body, 1: nl, 0: name}) => $co(name)($co(nl)($co(body)(l))))(x)));
    
    const in_0 = cons({"0":"even","1":3779,"2":{"0":{"0":{"0":"x","1":3781,"type":"pvar"},"1":{"type":"nil"},"type":"cons"},"1":{"0":{"0":{"0":"=","1":22596,"type":"evar"},"1":{"0":{"0":"x","1":22597,"type":"evar"},"1":{"0":{"0":{"0":0,"1":22598,"type":"pint"},"1":22598,"type":"eprim"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"2":22595,"type":"eapp"},"1":{"0":{"0":{"0":{"0":true,"1":22593,"type":"pbool"},"1":22593,"type":"pprim"},"1":{"0":{"0":true,"1":22599,"type":"pbool"},"1":22599,"type":"eprim"},"type":","},"1":{"0":{"0":{"0":22593,"type":"pany"},"1":{"0":{"0":"odd","1":22601,"type":"evar"},"1":{"0":{"0":{"0":"-","1":22604,"type":"evar"},"1":{"0":{"0":"x","1":22605,"type":"evar"},"1":{"0":{"0":{"0":1,"1":22606,"type":"pint"},"1":22606,"type":"eprim"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"2":22603,"type":"eapp"},"1":{"type":"nil"},"type":"cons"},"2":22600,"type":"eapp"},"type":","},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"2":22593,"type":"ematch"},"2":3776,"type":"elambda"},"3":3776,"type":"tdef"})(cons({"0":"odd","1":3823,"2":{"0":{"0":{"0":"x","1":3825,"type":"pvar"},"1":{"type":"nil"},"type":"cons"},"1":{"0":{"0":{"0":"=","1":22620,"type":"evar"},"1":{"0":{"0":"x","1":22621,"type":"evar"},"1":{"0":{"0":{"0":1,"1":22622,"type":"pint"},"1":22622,"type":"eprim"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"2":22610,"type":"eapp"},"1":{"0":{"0":{"0":{"0":true,"1":22608,"type":"pbool"},"1":22608,"type":"pprim"},"1":{"0":{"0":true,"1":22623,"type":"pbool"},"1":22623,"type":"eprim"},"type":","},"1":{"0":{"0":{"0":22608,"type":"pany"},"1":{"0":{"0":"even","1":22625,"type":"evar"},"1":{"0":{"0":{"0":"-","1":22627,"type":"evar"},"1":{"0":{"0":"x","1":22628,"type":"evar"},"1":{"0":{"0":{"0":1,"1":22629,"type":"pint"},"1":22629,"type":"eprim"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"2":22626,"type":"eapp"},"1":{"type":"nil"},"type":"cons"},"2":22624,"type":"eapp"},"type":","},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"2":22608,"type":"ematch"},"2":3821,"type":"elambda"},"3":3821,"type":"tdef"})(nil));
    const mod_0 = test(in_0);
    const out_0 = $co(tenv(map$slfrom_list(cons($co("odd")(forall(set$slfrom_list(cons("number:18")(nil)))($eq$gt(cons(isin(tvar("number:18")(22622))("number")(cons(oloc(22604)(0))(cons(oloc(22606)(0))(cons(oloc(22622)(0))(nil)))))(nil))(tapp(tapp(tcon("->")(3821))(tvar("number:18")(22622))(3821))(tcon("bool")(22623))(3821)))))(cons($co("even")(forall(set$slfrom_list(cons("number:6")(nil)))($eq$gt(cons(isin(tvar("number:6")(22598))("number")(cons(oloc(22598)(0))(cons(oloc(22627)(0))(cons(oloc(22629)(0))(nil)))))(nil))(tapp(tapp(tcon("->")(3776))(tvar("number:6")(22598))(3776))(tcon("bool")(22599))(3776)))))(nil))))(map$slfrom_list(nil))(map$slfrom_list(nil))(map$slfrom_list(nil))(map$slfrom_list(nil)))(cons(isin(tvar("number:6")(22598))("number")(cons(oloc(22598)(0))(cons(oloc(22627)(0))(cons(oloc(22629)(0))(nil)))))(cons(isin(tvar("number:18")(22622))("number")(cons(oloc(22604)(0))(cons(oloc(22606)(0))(cons(oloc(22622)(0))(nil)))))(cons(isin(tvar("number:18")(22622))("eq")(cons(oloc(22620)(0))(nil)))(cons(isin(tvar("number:6")(22598))("eq")(cons(oloc(22596)(0))(nil)))(nil)))));
    if (!equal(mod_0, out_0)) {
        console.log(mod_0);
        console.log(out_0);
        throw new Error(`Fixture test (3765) failing 0. Not equal.`);
    }
    

    const in_1 = cons({"0":"lol","1":21266,"2":{"0":{"0":"show","1":21268,"type":"evar"},"1":{"0":{"0":{"0":10,"1":21269,"type":"pint"},"1":21269,"type":"eprim"},"1":{"type":"nil"},"type":"cons"},"2":21267,"type":"eapp"},"3":21264,"type":"tdef"})(nil);
    const mod_1 = test(in_1);
    const out_1 = $co(tenv(map$slfrom_list(cons($co("lol")(forall(map$slfrom_list(nil))($eq$gt(nil)(tcon("string")(-1)))))(nil)))(map$slfrom_list(nil))(map$slfrom_list(nil))(map$slfrom_list(nil))(map$slfrom_list(nil)))(cons(isin(tcon("int")(-1))("show")(cons(oloc(21268)(0))(nil)))(cons(isin(tcon("int")(-1))("number")(cons(oloc(21269)(0))(nil)))(nil)));
    if (!equal(mod_1, out_1)) {
        console.log(mod_1);
        console.log(out_1);
        throw new Error(`Fixture test (3765) failing 1. Not equal.`);
    }
    

    const in_2 = cons({"0":"hi","1":23779,"2":{"0":{"0":3,"1":23780,"type":"pint"},"1":23780,"type":"eprim"},"3":23777,"type":"tdef"})(nil);
    const mod_2 = test(in_2);
    const out_2 = $co(tenv(map$slfrom_list(cons($co("hi")(forall(map$slfrom_list(nil))($eq$gt(nil)(tcon("int")(-1)))))(nil)))(map$slfrom_list(nil))(map$slfrom_list(nil))(map$slfrom_list(nil))(map$slfrom_list(nil)))(cons(isin(tcon("int")(-1))("number")(cons(oloc(23780)(0))(nil)))(nil));
    if (!equal(mod_2, out_2)) {
        console.log(mod_2);
        console.log(out_2);
        throw new Error(`Fixture test (3765) failing 2. Not equal.`);
    }
    
}
const add$sldef = (tenv) => (name) => (nl) => (expr) => (l) => $gt$gt$eq(new_type_var(name)(nl))((self) => $gt$gt$eq($lt_(tenv$slwith_type(tenv)(name)(forall(set$slnil)($eq$gt(nil)(self)))))((bound_env) => $gt$gt$eq(infer$slexpr(bound_env)(expr))((type) => $gt$gt$eq(type$slapply_$gt(self))((self) => $gt$gt$eq(unify(self)(type)(l))((_) => $gt$gt$eq(type$slapply_$gt(type))((type) => $gt$gt$eq($lt_subst)((subst) => $gt$gt$eq($lt_preds)((preds) => $lt_(tenv$slwith_type(tenv$slnil)(name)(generalize(tenv)($eq$gt(map(predicate$slapply(subst))(bag$slto_list(preds)))(type))))))))))));

const infer_expr3 = (env) => (expr) => (({1: result, 0: {1: {1: {1: types, 0: preds}, 0: subst}}}) => ((preds) => $co((($target) => {
if ($target.type === "ok") {
{
let t = $target[0];
return ok(forall(set$slnil)($eq$gt(preds)(t)))
}
}
if ($target.type === "err") {
{
let e = $target[0];
return err(e)
}
}
throw new Error('Failed to match. ' + valueToString($target));
})(result))($co(map(({1: {1: dont_apply, 0: l}, 0: t}) => (($target) => {
if ($target === true) {
return $co(l)(forall(set$slnil)($eq$gt(nil)(t)))
}
return $co(l)(forall(set$slnil)($eq$gt(nil)(type$slapply(subst)(t))))
throw new Error('Failed to match. ' + valueToString($target));
})(dont_apply))(types))(organize_predicates(preds))))(predicate$slcombine(map(predicate$slapply(subst))(bag$slto_list(preds)))))(state_f(infer$slexpr(env)(expr))(state$slnil));

const add$slexpr = (tenv) => (expr) => $gt$gt$eq(infer$slexpr(tenv)(expr))((t) => $gt$gt$eq($lt_preds)((preds) => $gt$gt$eq($lt_(tenv))(({4: class_env}) => $gt$gt$eq($lt_subst)((subst) => $gt$gt$eq($lt_(predicate$slcombine(map(predicate$slapply(subst))(bag$slto_list(preds)))))((preds) => $gt$gt$eq(split(class_env)(nil)(nil)(preds))(({1: {1: {1: subst2, 0: defaulted_preds}, 0: other_preds}, 0: free_preds}) => $gt$gt$eq(preds_$gt(defaulted_preds))((_) => $gt$gt$eq(subst_$gt(subst2))((_) => $lt_(type$slapply(subst2)(t))))))))));

const add$slstmt = (tenv) => (stmt) => (($target) => {
if ($target.type === "tdef") {
{
let name = $target[0];
let nl = $target[1];
let expr = $target[2];
let l = $target[3];
return add$sldef(tenv)(name)(nl)(expr)(l)
}
}
if ($target.type === "texpr") {
{
let expr = $target[0];
let l = $target[1];
return $gt$gt$eq(infer$slexpr(tenv)(expr))((_) => $lt_(tenv$slnil))
}
}
if ($target.type === "ttypealias") {
{
let name = $target[0];
let args = $target[2];
let type = $target[3];
return $lt_(add$sltypealias(tenv)(name)(args)(type))
}
}
if ($target.type === "tdeftype") {
{
let name = $target[0];
let args = $target[2];
let constrs = $target[3];
let l = $target[4];
return $lt_(add$sldeftype(tenv)(name)(args)(constrs)(l))
}
}
throw new Error('Failed to match. ' + valueToString($target));
})(stmt);

{
    const test = ({3: l, 2: expr, 1: nl, 0: name}) => (({0: values}) => map$slto_list(values))(err_to_fatal(run$slnil_$gt(add$sldef(builtin_env)(name)(nl)(expr)(l))));
    
    const in_0 = {"0":"x","1":3023,"2":{"0":{"0":10,"1":3024,"type":"pint"},"1":3024,"type":"eprim"},"3":3021,"type":"tdef"};
    const mod_0 = test(in_0);
    const out_0 = cons($co("x")(forall(set$slfrom_list(cons("number:1")(nil)))($eq$gt(cons(isin(tvar("number:1")(3024))("number")(cons(oloc(3024)(0))(nil)))(nil))(tvar("number:1")(3024)))))(nil);
    if (!equal(mod_0, out_0)) {
        console.log(mod_0);
        console.log(out_0);
        throw new Error(`Fixture test (3010) failing 0. Not equal.`);
    }
    

    const in_1 = {"0":"id","1":3046,"2":{"0":{"0":{"0":"x","1":3048,"type":"pvar"},"1":{"type":"nil"},"type":"cons"},"1":{"0":"x","1":3049,"type":"evar"},"2":3044,"type":"elambda"},"3":3044,"type":"tdef"};
    const mod_1 = test(in_1);
    const out_1 = cons($co("id")(forall(set$slfrom_list(cons("x:1")(nil)))($eq$gt(nil)(tapp(tapp(tcon("->")(3044))(tvar("x:1")(3048))(3044))(tvar("x:1")(3048))(3044)))))(nil);
    if (!equal(mod_1, out_1)) {
        console.log(mod_1);
        console.log(out_1);
        throw new Error(`Fixture test (3010) failing 1. Not equal.`);
    }
    

    const in_2 = {"0":"rec","1":3148,"2":{"0":{"0":{"0":"x","1":3150,"type":"pvar"},"1":{"type":"nil"},"type":"cons"},"1":{"0":{"0":{"0":{"0":"m","1":3424,"type":"pvar"},"1":{"0":{"0":"rec","1":3426,"type":"evar"},"1":{"0":{"0":"x","1":3427,"type":"evar"},"1":{"type":"nil"},"type":"cons"},"2":3425,"type":"eapp"},"type":","},"1":{"type":"nil"},"type":"cons"},"1":{"0":{"0":"+","1":3429,"type":"evar"},"1":{"0":{"0":"x","1":3430,"type":"evar"},"1":{"0":{"0":"m","1":3431,"type":"evar"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"2":3428,"type":"eapp"},"2":3378,"type":"elet"},"2":3146,"type":"elambda"},"3":3146,"type":"tdef"};
    const mod_2 = test(in_2);
    const out_2 = cons($co("rec")(forall(set$slfrom_list(cons("result:3")(nil)))($eq$gt(cons(isin(tvar("result:3")(3428))("number")(cons(oloc(3429)(0))(nil)))(nil))(tapp(tapp(tcon("->")(3146))(tvar("result:3")(3428))(3146))(tvar("result:3")(3428))(3146)))))(nil);
    if (!equal(mod_2, out_2)) {
        console.log(mod_2);
        console.log(out_2);
        throw new Error(`Fixture test (3010) failing 2. Not equal.`);
    }
    
}
const add$slstmts = (tenv) => (stmts) => $gt$gt$eq($lt_(split_stmts(stmts)))(({1: {1: {1: others, 0: exprs}, 0: aliases}, 0: defs}) => $gt$gt$eq(add$sldefs(tenv)(defs))((denv) => $gt$gt$eq(foldl_$gt(denv)(concat(cons(aliases)(cons(others)(nil))))((env) => (stmt) => $gt$gt$eq(add$slstmt(tenv$slmerge(tenv)(env))(stmt))((env$qu) => $lt_(tenv$slmerge(env)(env$qu)))))((final) => $gt$gt$eq(map_$gt(add$slexpr(tenv$slmerge(tenv)(final)))(exprs))((types) => $lt_($co(final)(types))))));

{
    const test = ({1: name, 0: x}) => scheme_$gts(force(tenv$slresolve(foldl(tenv$slnil)(x)((env) => (stmts) => tenv$slmerge(env)(fst(err_to_fatal(run$slnil_$gt(add$slstmts(tenv$slmerge(builtin_env)(env))(stmts)))))))(name)));
    
    const in_0 = $co(cons(cons({"0":"x","1":6473,"2":{"0":{"0":"m","1":6474,"type":","},"1":{"type":"nil"},"type":"cons"},"3":{"0":{"0":"a","1":{"0":6477,"1":{"0":{"0":{"0":"m","1":6478,"type":"tcon"},"1":{"type":"nil"},"type":"cons"},"1":6476,"type":","},"type":","},"type":","},"1":{"type":"nil"},"type":"cons"},"4":6470,"type":"tdeftype"})(nil))(cons(cons({"0":"aa","1":6596,"2":{"0":{"0":{"0":"x","1":6484,"type":"pvar"},"1":{"type":"nil"},"type":"cons"},"1":{"0":{"0":"x","1":6487,"type":"evar"},"1":{"0":{"0":{"0":"a","1":6489,"2":{"0":{"0":{"0":2,"1":6490,"type":"pint"},"1":6490,"type":"pprim"},"1":{"type":"nil"},"type":"cons"},"3":6488,"type":"pcon"},"1":{"0":{"0":2,"1":6491,"type":"pint"},"1":6491,"type":"eprim"},"type":","},"1":{"0":{"0":{"0":"a","1":6493,"2":{"0":{"0":"m","1":6494,"type":"pvar"},"1":{"type":"nil"},"type":"cons"},"3":6492,"type":"pcon"},"1":{"0":"m","1":6495,"type":"evar"},"type":","},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"2":6485,"type":"ematch"},"2":6481,"type":"elambda"},"3":6481,"type":"tdef"})(nil))(nil)))("aa");
    const mod_0 = test(in_0);
    const out_0 = "(fn [(x int)] int)";
    if (!equal(mod_0, out_0)) {
        console.log(mod_0);
        console.log(out_0);
        throw new Error(`Fixture test (6456) failing 0. Not equal.`);
    }
    

    const in_1 = $co(cons(cons({"0":"a","1":8485,"2":{"type":"nil"},"3":{"0":"int","1":8486,"type":"tcon"},"4":8482,"type":"ttypealias"})(cons({"0":"lol","1":8493,"2":{"type":"nil"},"3":{"0":{"0":"elol","1":{"0":8495,"1":{"0":{"0":{"0":"a","1":8496,"type":"tcon"},"1":{"type":"nil"},"type":"cons"},"1":8494,"type":","},"type":","},"type":","},"1":{"type":"nil"},"type":"cons"},"4":8491,"type":"tdeftype"})(nil)))(nil))("elol");
    const mod_1 = test(in_1);
    const out_1 = "(fn [int] lol)";
    if (!equal(mod_1, out_1)) {
        console.log(mod_1);
        console.log(out_1);
        throw new Error(`Fixture test (6456) failing 1. Not equal.`);
    }
    

    const in_2 = $co(cons(cons({"0":"alt","1":8595,"2":{"type":"nil"},"3":{"0":{"0":{"0":",","1":8597,"type":"tcon"},"1":{"0":{"0":"list","1":8599,"type":"tcon"},"1":{"0":"pat","1":8600,"type":"tcon"},"2":8598,"type":"tapp"},"2":8596,"type":"tapp"},"1":{"0":"expr","1":8601,"type":"tcon"},"2":8596,"type":"tapp"},"4":8593,"type":"ttypealias"})(cons({"0":"bindgroup","1":8623,"2":{"type":"nil"},"3":{"0":"alt","1":8629,"type":"tcon"},"4":8621,"type":"ttypealias"})(cons({"0":"expr","1":8636,"2":{"type":"nil"},"3":{"0":{"0":"elet","1":{"0":8691,"1":{"0":{"0":{"0":"bindgroup","1":8692,"type":"tcon"},"1":{"0":{"0":"expr","1":8693,"type":"tcon"},"1":{"0":{"0":"int","1":8694,"type":"tcon"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"type":"cons"},"1":8690,"type":","},"type":","},"type":","},"1":{"type":"nil"},"type":"cons"},"4":8634,"type":"tdeftype"})(nil))))(cons(cons({"0":"x","1":8733,"2":{"0":{"0":{"0":"elet","1":8736,"2":{"0":{"0":"b","1":8737,"type":"pvar"},"1":{"0":{"0":8738,"type":"pany"},"1":{"0":{"0":8739,"type":"pany"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"type":"cons"},"3":8735,"type":"pcon"},"1":{"type":"nil"},"type":"cons"},"1":{"0":"b","1":8740,"type":"evar"},"2":8731,"type":"elambda"},"3":8731,"type":"tdef"})(nil))(nil)))("x");
    const mod_2 = test(in_2);
    const out_2 = "(fn [expr] ((, (list pat)) expr))";
    if (!equal(mod_2, out_2)) {
        console.log(mod_2);
        console.log(out_2);
        throw new Error(`Fixture test (6456) failing 2. Not equal.`);
    }
    

    const in_3 = $co(cons(cons({"0":"a","1":9826,"2":{"0":{"0":"b","1":9827,"type":","},"1":{"type":"nil"},"type":"cons"},"3":{"0":{"0":{"0":",","1":9829,"type":"tcon"},"1":{"0":"int","1":9830,"type":"tcon"},"2":9828,"type":"tapp"},"1":{"0":"b","1":9831,"type":"tcon"},"2":9828,"type":"tapp"},"4":9823,"type":"ttypealias"})(cons({"0":"hi","1":9836,"2":{"type":"nil"},"3":{"0":{"0":"red","1":{"0":9838,"1":{"0":{"0":{"0":"int","1":9839,"type":"tcon"},"1":{"type":"nil"},"type":"cons"},"1":9837,"type":","},"type":","},"type":","},"1":{"0":{"0":"blue","1":{"0":9841,"1":{"0":{"type":"nil"},"1":9840,"type":","},"type":","},"type":","},"1":{"0":{"0":"green","1":{"0":9843,"1":{"0":{"0":{"0":{"0":"a","1":9845,"type":"tcon"},"1":{"0":"bool","1":9846,"type":"tcon"},"2":9844,"type":"tapp"},"1":{"type":"nil"},"type":"cons"},"1":9842,"type":","},"type":","},"type":","},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"type":"cons"},"4":9834,"type":"tdeftype"})(nil)))(nil))("green");
    const mod_3 = test(in_3);
    const out_3 = "(fn [((, int) bool)] hi)";
    if (!equal(mod_3, out_3)) {
        console.log(mod_3);
        console.log(out_3);
        throw new Error(`Fixture test (6456) failing 3. Not equal.`);
    }
    

}
const benv_with_pair = tenv$slmerge(builtin_env)(fst(err_to_fatal(run$slnil_$gt(add$slstmts(builtin_env)(cons({"0":",","1":12710,"2":{"0":{"0":"a","1":12711,"type":","},"1":{"0":{"0":"b","1":12712,"type":","},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"3":{"0":{"0":",","1":{"0":12714,"1":{"0":{"0":{"0":"a","1":12715,"type":"tcon"},"1":{"0":{"0":"b","1":12716,"type":"tcon"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"1":12713,"type":","},"type":","},"type":","},"1":{"type":"nil"},"type":"cons"},"4":12707,"type":"tdeftype"})(cons({"0":"list","1":12722,"2":{"0":{"0":"a","1":12723,"type":","},"1":{"type":"nil"},"type":"cons"},"3":{"0":{"0":"nil","1":{"0":12725,"1":{"0":{"type":"nil"},"1":12724,"type":","},"type":","},"type":","},"1":{"0":{"0":"cons","1":{"0":12727,"1":{"0":{"0":{"0":"a","1":12728,"type":"tcon"},"1":{"0":{"0":{"0":"list","1":12730,"type":"tcon"},"1":{"0":"a","1":12731,"type":"tcon"},"2":12729,"type":"tapp"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"1":12726,"type":","},"type":","},"type":","},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"4":12719,"type":"tdeftype"})(nil)))))));

const infer_stmts3 = (env) => (stmts) => (({1: result, 0: {1: {1: {1: types, 0: preds}, 0: subst}}}) => ((preds) => ((preds_by_vbl) => $co((($target) => {
if ($target.type === "err") {
{
let e = $target[0];
return err(e)
}
}
if ($target.type === "ok" &&
$target[0].type === ",") {
{
let tenv = $target[0][0];
let types = $target[0][1];
return ok($co(tenv)(map(forall(set$slnil))(map($eq$gt(nil))(types))))
}
}
throw new Error('Failed to match. ' + valueToString($target));
})(result))($co(map(({1: {1: dont_apply, 0: l}, 0: t}) => (($target) => {
if ($target === true) {
return $co(l)(forall(set$slnil)($eq$gt(nil)(t)))
}
return $co(l)(forall(set$slnil)($eq$gt(predicate$slcombine(concat(map(dot(none_to(nil))(map$slget(preds_by_vbl)))(set$slto_list(type$slfree(t))))))(type$slapply(subst)(t))))
throw new Error('Failed to match. ' + valueToString($target));
})(dont_apply))(types))(organize_predicates(preds))))(foldl(map$slnil)(preds)((map) => (pred) => foldl(map)(set$slto_list(predicate$slfree(pred)))((map) => (v) => (($target) => {
if ($target.type === "none") {
return map$slset(map)(v)(cons(pred)(nil))
}
if ($target.type === "some") {
{
let preds = $target[0];
return map$slset(map)(v)(cons(pred)(preds))
}
}
throw new Error('Failed to match. ' + valueToString($target));
})(map$slget(map)(v))))))(predicate$slcombine(map(predicate$slapply(subst))(bag$slto_list(preds)))))(state_f(add$slstmts(env)(stmts))(state$slnil));

{
    const test = (x) => (({1: res, 0: {1: {1: {0: preds}, 0: subst}}}) => $co(res)(predicate$slcombine(map(predicate$slapply(subst))(bag$slto_list(preds)))))(state_f(add$slexpr(builtin_env)(x))(state$slnil));
    
    const in_0 = {"0":"hi","1":{"type":"nil"},"2":17838,"type":"estr"};
    const mod_0 = test(in_0);
    const out_0 = $co(ok(tcon("string")(17838)))(nil);
    if (!equal(mod_0, out_0)) {
        console.log(mod_0);
        console.log(out_0);
        throw new Error(`Fixture test (17829) failing 0. Not equal.`);
    }
    

    const in_1 = {"0":"show","1":20535,"type":"evar"};
    const mod_1 = test(in_1);
    const out_1 = $co(err(terr("Cannot resolve ambiguities: a:0 is in predicates: (isin a:0 \"show\" 20535@0)  defaults for variables: [empty] with known variables: ")(nil)))(cons(isin(tvar("a:0")(20535))("show")(cons(oloc(20535)(0))(nil)))(nil));
    if (!equal(mod_1, out_1)) {
        console.log(mod_1);
        console.log(out_1);
        throw new Error(`Fixture test (17829) failing 1. Not equal.`);
    }
    

    const in_2 = {"0":"+","1":20264,"type":"evar"};
    const mod_2 = test(in_2);
    const out_2 = $co(ok(tapp(tapp(tcon("->")(-1))(tcon("int")(-1))(-1))(tapp(tapp(tcon("->")(-1))(tcon("int")(-1))(-1))(tcon("int")(-1))(-1))(-1)))(cons(isin(tcon("int")(-1))("number")(cons(oloc(20264)(0))(nil)))(nil));
    if (!equal(mod_2, out_2)) {
        console.log(mod_2);
        console.log(out_2);
        throw new Error(`Fixture test (17829) failing 2. Not equal.`);
    }
    

    const in_3 = {"0":{"0":{"0":"x","1":17998,"type":"pvar"},"1":{"type":"nil"},"type":"cons"},"1":{"0":{"0":"+","1":18000,"type":"evar"},"1":{"0":{"0":{"0":2,"1":18001,"type":"pint"},"1":18001,"type":"eprim"},"1":{"0":{"0":"x","1":18002,"type":"evar"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"2":17999,"type":"eapp"},"2":17995,"type":"elambda"};
    const mod_3 = test(in_3);
    const out_3 = $co(ok(tapp(tapp(tcon("->")(17995))(tcon("int")(-1))(17995))(tcon("int")(-1))(17995)))(cons(isin(tcon("int")(-1))("number")(cons(oloc(18000)(0))(cons(oloc(18001)(0))(nil))))(nil));
    if (!equal(mod_3, out_3)) {
        console.log(mod_3);
        console.log(out_3);
        throw new Error(`Fixture test (17829) failing 3. Not equal.`);
    }
    

    const in_4 = {"0":{"0":1,"1":17846,"type":"pint"},"1":17846,"type":"eprim"};
    const mod_4 = test(in_4);
    const out_4 = $co(ok(tcon("int")(-1)))(cons(isin(tcon("int")(-1))("number")(cons(oloc(17846)(0))(nil)))(nil));
    if (!equal(mod_4, out_4)) {
        console.log(mod_4);
        console.log(out_4);
        throw new Error(`Fixture test (17829) failing 4. Not equal.`);
    }
    
}
{
    const test = (x) => run$slnil_$gt(infer$slexpr(benv_with_pair)(x));
    
    const in_0 = {"0":"a","1":{"type":"nil"},"2":4512,"type":"estr"};
    const mod_0 = test(in_0);
    const out_0 = ok(tcon("string")(4512));
    if (!equal(mod_0, out_0)) {
        console.log(mod_0);
        console.log(out_0);
        throw new Error(`Fixture test (4501) failing 0. Not equal.`);
    }
    

    const in_1 = {"0":"hi","1":4531,"type":"evar"};
    const mod_1 = test(in_1);
    const out_1 = err(tmissing(cons($co("hi")(4531))(nil)));
    if (!equal(mod_1, out_1)) {
        console.log(mod_1);
        console.log(out_1);
        throw new Error(`Fixture test (4501) failing 1. Not equal.`);
    }
    

    const in_2 = {"0":{"0":{"0":{"0":"x","1":4546,"type":"pvar"},"1":{"0":"a","1":{"type":"nil"},"2":4547,"type":"estr"},"type":","},"1":{"type":"nil"},"type":"cons"},"1":{"0":"x","1":4548,"type":"evar"},"2":4543,"type":"elet"};
    const mod_2 = test(in_2);
    const out_2 = ok(tcon("string")(4547));
    if (!equal(mod_2, out_2)) {
        console.log(mod_2);
        console.log(out_2);
        throw new Error(`Fixture test (4501) failing 2. Not equal.`);
    }
    

    const in_3 = {"0":{"0":",","1":4560,"type":"evar"},"1":{"0":{"0":"a","1":{"type":"nil"},"2":4561,"type":"estr"},"1":{"0":{"0":"a","1":{"type":"nil"},"2":4562,"type":"estr"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"2":4559,"type":"eapp"};
    const mod_3 = test(in_3);
    const out_3 = ok(tapp(tapp(tcon(",")(-1))(tcon("string")(4561))(-1))(tcon("string")(4562))(-1));
    if (!equal(mod_3, out_3)) {
        console.log(mod_3);
        console.log(out_3);
        throw new Error(`Fixture test (4501) failing 3. Not equal.`);
    }
    

    const in_4 = {"0":{"0":{"0":"x","1":4694,"type":"pvar"},"1":{"type":"nil"},"type":"cons"},"1":{"0":{"0":{"0":{"0":",","1":4698,"2":{"0":{"0":"a","1":4700,"type":"pvar"},"1":{"0":{"0":"b","1":4701,"type":"pvar"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"3":4698,"type":"pcon"},"1":{"0":"x","1":4703,"type":"evar"},"type":","},"1":{"type":"nil"},"type":"cons"},"1":{"0":"a","1":4702,"type":"evar"},"2":4695,"type":"elet"},"2":4689,"type":"elambda"};
    const mod_4 = test(in_4);
    const out_4 = ok(tapp(tapp(tcon("->")(4689))(tapp(tapp(tcon(",")(-1))(tvar("a:1")(4698))(-1))(tvar("b:2")(4698))(-1))(4689))(tvar("a:1")(4698))(4689));
    if (!equal(mod_4, out_4)) {
        console.log(mod_4);
        console.log(out_4);
        throw new Error(`Fixture test (4501) failing 4. Not equal.`);
    }
    

    const in_5 = {"0":{"0":{"0":{"0":"id","1":4751,"type":"pvar"},"1":{"0":{"0":{"0":"x","1":4755,"type":"pvar"},"1":{"type":"nil"},"type":"cons"},"1":{"0":"x","1":4756,"type":"evar"},"2":4752,"type":"elambda"},"type":","},"1":{"type":"nil"},"type":"cons"},"1":{"0":{"0":",","1":4758,"type":"evar"},"1":{"0":{"0":{"0":"id","1":4760,"type":"evar"},"1":{"0":{"0":{"0":2,"1":4761,"type":"pint"},"1":4761,"type":"eprim"},"1":{"type":"nil"},"type":"cons"},"2":4759,"type":"eapp"},"1":{"0":{"0":{"0":"id","1":4763,"type":"evar"},"1":{"0":{"0":{"0":true,"1":4764,"type":"pbool"},"1":4764,"type":"eprim"},"1":{"type":"nil"},"type":"cons"},"2":4762,"type":"eapp"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"2":4757,"type":"eapp"},"2":4748,"type":"elet"};
    const mod_5 = test(in_5);
    const out_5 = ok(tapp(tapp(tcon(",")(-1))(tvar("result:5")(4759))(-1))(tcon("bool")(4764))(-1));
    if (!equal(mod_5, out_5)) {
        console.log(mod_5);
        console.log(out_5);
        throw new Error(`Fixture test (4501) failing 5. Not equal.`);
    }
    

    const in_6 = {"0":{"0":{"0":"id","1":4817,"type":"pvar"},"1":{"type":"nil"},"type":"cons"},"1":{"0":{"0":",","1":4819,"type":"evar"},"1":{"0":{"0":{"0":"id","1":4821,"type":"evar"},"1":{"0":{"0":{"0":2,"1":4822,"type":"pint"},"1":4822,"type":"eprim"},"1":{"type":"nil"},"type":"cons"},"2":4820,"type":"eapp"},"1":{"0":{"0":{"0":"id","1":4824,"type":"evar"},"1":{"0":{"0":{"0":true,"1":4825,"type":"pbool"},"1":4825,"type":"eprim"},"1":{"type":"nil"},"type":"cons"},"2":4823,"type":"eapp"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"2":4818,"type":"eapp"},"2":4814,"type":"elambda"};
    const mod_6 = test(in_6);
    const out_6 = ok(tapp(tapp(tcon("->")(4814))(tapp(tapp(tcon("->")(4820))(tcon("bool")(4825))(4820))(tvar("result:7")(4823))(4820))(4814))(tapp(tapp(tcon(",")(-1))(tvar("result:7")(4823))(-1))(tvar("result:7")(4823))(-1))(4814));
    if (!equal(mod_6, out_6)) {
        console.log(mod_6);
        console.log(out_6);
        throw new Error(`Fixture test (4501) failing 6. Not equal.`);
    }
    

    const in_7 = {"0":{"0":{"0":"arg","1":4836,"type":"pvar"},"1":{"type":"nil"},"type":"cons"},"1":{"0":{"0":{"0":{"0":",","1":4840,"2":{"0":{"0":"id","1":4842,"type":"pvar"},"1":{"0":{"0":4843,"type":"pany"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"3":4840,"type":"pcon"},"1":{"0":"arg","1":4844,"type":"evar"},"type":","},"1":{"type":"nil"},"type":"cons"},"1":{"0":{"0":",","1":4846,"type":"evar"},"1":{"0":{"0":{"0":"id","1":4848,"type":"evar"},"1":{"0":{"0":{"0":2,"1":4849,"type":"pint"},"1":4849,"type":"eprim"},"1":{"type":"nil"},"type":"cons"},"2":4847,"type":"eapp"},"1":{"0":{"0":{"0":"id","1":4851,"type":"evar"},"1":{"0":{"0":{"0":true,"1":4852,"type":"pbool"},"1":4852,"type":"eprim"},"1":{"type":"nil"},"type":"cons"},"2":4850,"type":"eapp"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"2":4845,"type":"eapp"},"2":4837,"type":"elet"},"2":4833,"type":"elambda"};
    const mod_7 = test(in_7);
    const out_7 = ok(tapp(tapp(tcon("->")(4833))(tapp(tapp(tcon(",")(-1))(tapp(tapp(tcon("->")(4847))(tcon("bool")(4852))(4847))(tvar("result:11")(4850))(4847))(-1))(tvar("b:2")(4840))(-1))(4833))(tapp(tapp(tcon(",")(-1))(tvar("result:11")(4850))(-1))(tvar("result:11")(4850))(-1))(4833));
    if (!equal(mod_7, out_7)) {
        console.log(mod_7);
        console.log(out_7);
        throw new Error(`Fixture test (4501) failing 7. Not equal.`);
    }
    

    const in_8 = {"0":{"0":{"0":{"0":"x","1":4864,"type":"pvar"},"1":{"type":"nil"},"type":"cons"},"1":{"0":"x","1":4865,"type":"evar"},"2":4861,"type":"elambda"},"1":{"0":{"0":{"0":2,"1":4866,"type":"pint"},"1":4866,"type":"eprim"},"1":{"type":"nil"},"type":"cons"},"2":4860,"type":"eapp"};
    const mod_8 = test(in_8);
    const out_8 = ok(tvar("result:0")(4860));
    if (!equal(mod_8, out_8)) {
        console.log(mod_8);
        console.log(out_8);
        throw new Error(`Fixture test (4501) failing 8. Not equal.`);
    }
    

    const in_9 = {"0":{"0":{"0":{"0":"a","1":9709,"type":"pvar"},"1":{"0":{"0":2,"1":9710,"type":"pint"},"1":9710,"type":"eprim"},"type":","},"1":{"type":"nil"},"type":"cons"},"1":{"0":{"0":{"0":{"0":"a","1":9715,"type":"pvar"},"1":{"0":{"0":true,"1":9716,"type":"pbool"},"1":9716,"type":"eprim"},"type":","},"1":{"type":"nil"},"type":"cons"},"1":{"0":"a","1":9717,"type":"evar"},"2":9711,"type":"elet"},"2":9706,"type":"elet"};
    const mod_9 = test(in_9);
    const out_9 = ok(tcon("bool")(9716));
    if (!equal(mod_9, out_9)) {
        console.log(mod_9);
        console.log(out_9);
        throw new Error(`Fixture test (4501) failing 9. Not equal.`);
    }
    

    const in_10 = {"0":{"0":{"0":1,"1":5072,"type":"pint"},"1":5072,"type":"eprim"},"1":{"0":{"0":{"0":{"0":1,"1":5073,"type":"pint"},"1":5073,"type":"pprim"},"1":{"0":{"0":true,"1":5074,"type":"pbool"},"1":5074,"type":"eprim"},"type":","},"1":{"0":{"0":{"0":11378,"type":"pany"},"1":{"0":{"0":false,"1":11379,"type":"pbool"},"1":11379,"type":"eprim"},"type":","},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"2":5068,"type":"ematch"};
    const mod_10 = test(in_10);
    const out_10 = ok(tcon("bool")(5074));
    if (!equal(mod_10, out_10)) {
        console.log(mod_10);
        console.log(out_10);
        throw new Error(`Fixture test (4501) failing 10. Not equal.`);
    }
    

    const in_11 = {"0":{"0":{"0":"x","1":5088,"type":"pvar"},"1":{"type":"nil"},"type":"cons"},"1":{"0":{"0":"x","1":5091,"type":"evar"},"1":{"0":{"0":{"0":",","1":5092,"2":{"0":{"0":{"0":1,"1":5094,"type":"pint"},"1":5094,"type":"pprim"},"1":{"0":{"0":"a","1":5095,"type":"pvar"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"3":5092,"type":"pcon"},"1":{"0":"a","1":5096,"type":"evar"},"type":","},"1":{"0":{"0":{"0":11380,"type":"pany"},"1":{"0":{"0":1,"1":11381,"type":"pint"},"1":11381,"type":"eprim"},"type":","},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"2":5089,"type":"ematch"},"2":5085,"type":"elambda"};
    const mod_11 = test(in_11);
    const out_11 = ok(tapp(tapp(tcon("->")(5085))(tapp(tapp(tcon(",")(-1))(tcon("int")(5094))(-1))(tvar("match result:1")(5089))(-1))(5085))(tvar("match result:1")(5089))(5085));
    if (!equal(mod_11, out_11)) {
        console.log(mod_11);
        console.log(out_11);
        throw new Error(`Fixture test (4501) failing 11. Not equal.`);
    }
    

    const in_12 = {"0":{"0":{"0":1,"1":5141,"type":"pint"},"1":5141,"type":"eprim"},"1":{"0":{"0":{"0":{"0":1,"1":5142,"type":"pint"},"1":5142,"type":"pprim"},"1":{"0":{"0":true,"1":5143,"type":"pbool"},"1":5143,"type":"eprim"},"type":","},"1":{"0":{"0":{"0":{"0":2,"1":5144,"type":"pint"},"1":5144,"type":"pprim"},"1":{"0":"","1":{"type":"nil"},"2":5145,"type":"estr"},"type":","},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"2":5139,"type":"ematch"};
    const mod_12 = test(in_12);
    const out_12 = err(twrap(ttypes(forall(map$slfrom_list(nil))($eq$gt(nil)(tcon("string")(5145))))(forall(map$slfrom_list(nil))($eq$gt(nil)(tcon("bool")(5143)))))(ttypes(forall(map$slfrom_list(nil))($eq$gt(nil)(tcon("string")(5145))))(forall(map$slfrom_list(nil))($eq$gt(nil)(tcon("bool")(5143))))));
    if (!equal(mod_12, out_12)) {
        console.log(mod_12);
        console.log(out_12);
        throw new Error(`Fixture test (4501) failing 12. Not equal.`);
    }
    

    const in_13 = {"0":{"0":{"0":"x","1":6440,"type":"pvar"},"1":{"type":"nil"},"type":"cons"},"1":{"0":{"0":"x","1":6443,"type":"evar"},"1":{"0":{"0":{"0":",","1":6444,"2":{"0":{"0":{"0":2,"1":6446,"type":"pint"},"1":6446,"type":"pprim"},"1":{"0":{"0":6454,"type":"pany"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"3":6444,"type":"pcon"},"1":{"0":{"0":1,"1":6447,"type":"pint"},"1":6447,"type":"eprim"},"type":","},"1":{"0":{"0":{"0":",","1":6448,"2":{"0":{"0":"m","1":6450,"type":"pvar"},"1":{"0":{"0":6455,"type":"pany"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"3":6448,"type":"pcon"},"1":{"0":"m","1":6451,"type":"evar"},"type":","},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"2":6441,"type":"ematch"},"2":6436,"type":"elambda"};
    const mod_13 = test(in_13);
    const out_13 = ok(tapp(tapp(tcon("->")(6436))(tapp(tapp(tcon(",")(-1))(tcon("int")(6446))(-1))(tvar("b:3")(6444))(-1))(6436))(tcon("int")(6446))(6436));
    if (!equal(mod_13, out_13)) {
        console.log(mod_13);
        console.log(out_13);
        throw new Error(`Fixture test (4501) failing 13. Not equal.`);
    }
    

    const in_14 = {"0":{"0":{"0":"hi","1":6703,"type":"evar"},"type":"quot/expr"},"1":6701,"type":"equot"};
    const mod_14 = test(in_14);
    const out_14 = ok(tcon("expr")(6701));
    if (!equal(mod_14, out_14)) {
        console.log(mod_14);
        console.log(out_14);
        throw new Error(`Fixture test (4501) failing 14. Not equal.`);
    }
    

    const in_15 = {"0":"hi","1":{"type":"nil"},"2":6785,"type":"estr"};
    const mod_15 = test(in_15);
    const out_15 = ok(tcon("string")(6785));
    if (!equal(mod_15, out_15)) {
        console.log(mod_15);
        console.log(out_15);
        throw new Error(`Fixture test (4501) failing 15. Not equal.`);
    }
    

    const in_16 = {"0":"hi ","1":{"0":{"0":{"0":{"0":true,"1":6850,"type":"pbool"},"1":6850,"type":"eprim"},"1":{"0":"","1":6851,"type":","},"type":","},"1":{"type":"nil"},"type":"cons"},"2":6848,"type":"estr"};
    const mod_16 = test(in_16);
    const out_16 = err(twrap(ttypes(forall(map$slfrom_list(nil))($eq$gt(nil)(tcon("bool")(6850))))(forall(map$slfrom_list(nil))($eq$gt(nil)(tcon("string")(6848)))))(ttypes(forall(map$slfrom_list(nil))($eq$gt(nil)(tcon("bool")(6850))))(forall(map$slfrom_list(nil))($eq$gt(nil)(tcon("string")(6848))))));
    if (!equal(mod_16, out_16)) {
        console.log(mod_16);
        console.log(out_16);
        throw new Error(`Fixture test (4501) failing 16. Not equal.`);
    }
    

    const in_17 = {"0":{"0":{"0":"x","1":13863,"type":"pvar"},"1":{"type":"nil"},"type":"cons"},"1":{"0":{"0":"x","1":13866,"type":"evar"},"1":{"0":{"0":{"0":"nil","1":13867,"2":{"type":"nil"},"3":13867,"type":"pcon"},"1":{"0":{"0":true,"1":13868,"type":"pbool"},"1":13868,"type":"eprim"},"type":","},"1":{"0":{"0":{"0":"cons","1":13869,"2":{"0":{"0":",","1":13870,"2":{"0":{"0":"a","1":13872,"type":"pvar"},"1":{"0":{"0":"b","1":13873,"type":"pvar"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"3":13870,"type":"pcon"},"1":{"0":{"0":13875,"type":"pany"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"3":13869,"type":"pcon"},"1":{"0":{"0":true,"1":13876,"type":"pbool"},"1":13876,"type":"eprim"},"type":","},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"2":13864,"type":"ematch"},"2":13860,"type":"elambda"};
    const mod_17 = test(in_17);
    const out_17 = ok(tapp(tapp(tcon("->")(13860))(tapp(tcon("list")(12719))(tapp(tapp(tcon(",")(-1))(tvar("a:4")(13870))(-1))(tvar("b:5")(13870))(-1))(12723))(13860))(tcon("bool")(13868))(13860));
    if (!equal(mod_17, out_17)) {
        console.log(mod_17);
        console.log(out_17);
        throw new Error(`Fixture test (4501) failing 17. Not equal.`);
    }
    
}
{
    const test = pattern_to_ex_pattern(benv_with_pair);
    
    const in_0 = $co({"0":"cons","1":11227,"2":{"0":{"0":{"0":2,"1":11228,"type":"pint"},"1":11228,"type":"pprim"},"1":{"0":{"0":"cons","1":11227,"2":{"0":{"0":"a","1":11229,"type":"pvar"},"1":{"0":{"0":"cons","1":11227,"2":{"0":{"0":"b","1":11230,"type":"pvar"},"1":{"0":{"0":"nil","1":11227,"2":{"type":"nil"},"3":11227,"type":"pcon"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"3":11227,"type":"pcon"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"3":11227,"type":"pcon"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"3":11227,"type":"pcon"})({"0":{"0":"list","1":11234,"type":"tcon"},"1":{"0":"int","1":11235,"type":"tcon"},"2":11233,"type":"tapp"});
    const mod_0 = test(in_0);
    const out_0 = ex$slconstructor("cons")("list")(cons(ex$slconstructor("2")("int")(nil))(cons(ex$slconstructor("cons")("list")(cons(ex$slany)(cons(ex$slconstructor("cons")("list")(cons(ex$slany)(cons(ex$slconstructor("nil")("list")(nil))(nil))))(nil))))(nil)));
    if (!equal(mod_0, out_0)) {
        console.log(mod_0);
        console.log(out_0);
        throw new Error(`Fixture test (11181) failing 0. Not equal.`);
    }
    

    const in_1 = $co({"0":",","1":11283,"2":{"0":{"0":{"0":2,"1":11285,"type":"pint"},"1":11285,"type":"pprim"},"1":{"0":{"0":"b","1":11286,"type":"pvar"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"3":11283,"type":"pcon"})({"0":{"0":{"0":",","1":11311,"type":"tcon"},"1":{"0":"1","1":11312,"type":"tcon"},"2":11290,"type":"tapp"},"1":{"0":"2","1":11313,"type":"tcon"},"2":11290,"type":"tapp"});
    const mod_1 = test(in_1);
    const out_1 = ex$slconstructor(",")(",")(cons(ex$slconstructor("2")("int")(nil))(cons(ex$slany)(nil)));
    if (!equal(mod_1, out_1)) {
        console.log(mod_1);
        console.log(out_1);
        throw new Error(`Fixture test (11181) failing 1. Not equal.`);
    }
    
}
return $eval("env_nil => add_stmt => get_type => type_to_string => type_to_cst => infer_stmts3 => infer3 =>\n  ({type: 'fns', env_nil, add_stmt, get_type, type_to_string, type_to_cst, infer_stmts3, infer3})\n")(builtin_env)(tenv$slmerge)(tenv$slresolve)(scheme_$gts)(scheme_$gtcst)(infer_stmts3)(infer_expr3)