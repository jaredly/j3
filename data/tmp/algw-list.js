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
const pbool = (v0) => (v1) => ({type: "pbool", 0: v0, 1: v1})
const tvar = (v0) => (v1) => ({type: "tvar", 0: v0, 1: v1})
const tapp = (v0) => (v1) => (v2) => ({type: "tapp", 0: v0, 1: v1, 2: v2})
const tcon = (v0) => (v1) => ({type: "tcon", 0: v0, 1: v1})
const type_free = (type) => (($target) => {
if ($target.type === "tvar") {
{
let n = $target[0];
return set$sladd(set$slnil)(n)
}
}
if ($target.type === "tcon") {
return set$slnil
}
if ($target.type === "tapp") {
{
let a = $target[0];
let b = $target[1];
return set$slmerge(type_free(a))(type_free(b))
}
}
throw new Error('Failed to match. ' + valueToString($target));
})(type);

const t_prim = (prim) => (($target) => {
if ($target.type === "pint") {
{
let l = $target[1];
return tcon("int")(l)
}
}
if ($target.type === "pbool") {
{
let l = $target[1];
return tcon("bool")(l)
}
}
throw new Error('Failed to match. ' + valueToString($target));
})(prim);

const tfn = (a) => (b) => (l) => tapp(tapp(tcon("->")(l))(a)(l))(b)(l);

const tint = tcon("int")(-1);

const type_with_free = (type) => (free) => (($target) => {
if ($target.type === "tvar") {
return type
}
if ($target.type === "tcon") {
{
let s = $target[0];
let l = $target[1];
return (($target) => {
if ($target === true) {
return tvar(s)(l)
}
return type
throw new Error('Failed to match. ' + valueToString($target));
})(set$slhas(free)(s))
}
}
if ($target.type === "tapp") {
{
let a = $target[0];
let b = $target[1];
let l = $target[2];
return tapp(type_with_free(a)(free))(type_with_free(b)(free))(l)
}
}
throw new Error('Failed to match. ' + valueToString($target));
})(type);

const tbool = tcon("bool")(-1);

const some = (v0) => ({type: "some", 0: v0})
const none = ({type: "none"})
const type_loc = (type) => (($target) => {
if ($target.type === "tvar") {
{
let l = $target[1];
return l
}
}
if ($target.type === "tapp") {
{
let l = $target[2];
return l
}
}
if ($target.type === "tcon") {
{
let l = $target[1];
return l
}
}
throw new Error('Failed to match. ' + valueToString($target));
})(type);

const tstring = tcon("string")(-1);

const tmap = (k) => (v) => tapp(tapp(tcon("map")(-1))(k)(-1))(v)(-1);

const toption = (arg) => tapp(tcon("option")(-1))(arg)(-1);

const tlist = (arg) => tapp(tcon("list")(-1))(arg)(-1);

const vbl = (k) => tvar(k)(-1);

const tset = (arg) => tapp(tcon("set")(-1))(arg)(-1);

const t$co = (a) => (b) => tapp(tapp(tcon(",")(-1))(a)(-1))(b)(-1);

const its = int_to_string;

const type$slset_loc = (loc) => (type) => (($target) => {
if ($target.type === "tvar") {
{
let name = $target[0];
return tvar(name)(loc)
}
}
if ($target.type === "tapp") {
{
let a = $target[0];
let b = $target[1];
return tapp(type$slset_loc(loc)(a))(type$slset_loc(loc)(b))(loc)
}
}
if ($target.type === "tcon") {
{
let name = $target[0];
return tcon(name)(loc)
}
}
throw new Error('Failed to match. ' + valueToString($target));
})(type);

const and_loc = (locs) => (l) => (s) => (($target) => {
if ($target === true) {
return `${s}:${(($target) => {
if ($target === true) {
return "🚨"
}
return its(l)
throw new Error('Failed to match. ' + valueToString($target));
})($eq(l)(-1))}`
}
return s
throw new Error('Failed to match. ' + valueToString($target));
})(locs);

const tcolor = (v0) => ({type: "tcolor", 0: v0})
const tbold = (v0) => ({type: "tbold", 0: v0})
const titalic = (v0) => ({type: "titalic", 0: v0})
const tflash = (v0) => ({type: "tflash", 0: v0})
const ttext = (v0) => ({type: "ttext", 0: v0})
const tval = (v0) => ({type: "tval", 0: v0})
const tloc = (v0) => ({type: "tloc", 0: v0})
const tnamed = (v0) => (v1) => ({type: "tnamed", 0: v0, 1: v1})
const tfmted = (v0) => (v1) => ({type: "tfmted", 0: v0, 1: v1})
const tfmt = (v0) => (v1) => ({type: "tfmt", 0: v0, 1: v1})
const value = ({type: "value"})
const type = ({type: "type"})
const has_free = (type) => (name) => (($target) => {
if ($target.type === "tvar") {
{
let n = $target[0];
return $eq(n)(name)
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
return has_free(b)(name)
throw new Error('Failed to match. ' + valueToString($target));
})(has_free(a)(name))
}
}
throw new Error('Failed to match. ' + valueToString($target));
})(type);

const map$slhas = (map) => (k) => (($target) => {
if ($target.type === "some") {
return true
}
return false
throw new Error('Failed to match. ' + valueToString($target));
})(map$slget(map)(k));

const replace_in_type = (subst) => (type) => (($target) => {
if ($target.type === "tvar") {
return type
}
if ($target.type === "tcon") {
{
let name = $target[0];
let l = $target[1];
return (($target) => {
if ($target.type === "some") {
{
let v = $target[0];
return type$slset_loc(l)(v)
}
}
return type
throw new Error('Failed to match. ' + valueToString($target));
})(map$slget(subst)(name))
}
}
if ($target.type === "tapp") {
{
let one = $target[0];
let two = $target[1];
let l = $target[2];
return tapp(replace_in_type(subst)(one))(replace_in_type(subst)(two))(l)
}
}
throw new Error('Failed to match. ' + valueToString($target));
})(type);

const dot = (a) => (b) => (c) => a(b(c));

const cons = (v0) => (v1) => ({type: "cons", 0: v0, 1: v1})
const nil = ({type: "nil"})
const ok = (v0) => ({type: "ok", 0: v0})
const err = (v0) => ({type: "err", 0: v0})
const force = (e_$gts) => (result) => (($target) => {
if ($target.type === "ok") {
{
let v = $target[0];
return v
}
}
if ($target.type === "err") {
{
let e = $target[0];
return fatal(`Result Error ${e_$gts(e)}`)
}
}
throw new Error('Failed to match. ' + valueToString($target));
})(result);

const prim_$gts = (prim) => (($target) => {
if ($target.type === "pint") {
{
let num = $target[0];
return its(num)
}
}
if ($target.type === "pbool") {
{
let bool = $target[0];
let int = $target[1];
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

const map$sladd = (map) => (arg) => (value) => map$slset(map)(arg)((($target) => {
if ($target.type === "none") {
return cons(value)(nil)
}
if ($target.type === "some") {
{
let values = $target[0];
return cons(value)(values)
}
}
throw new Error('Failed to match. ' + valueToString($target));
})(map$slget(map)(arg)));

const debug_invariant = false;

const with_name = (map) => (id) => (($target) => {
if ($target.type === "some") {
{
let v = $target[0];
return `${v}:${its(id)}`
}
}
return `?:${its(id)}`
throw new Error('Failed to match. ' + valueToString($target));
})(map$slget(map)(id));

const loop = (value) => (run) => run(value)((next_value) => loop(next_value)(run));

const unwrap_type_tuple = (arg2) => loop(arg2)((arg) => (recur) => (($target) => {
if ($target.type === "tapp" &&
$target[0].type === "tapp" &&
$target[0][0].type === "tcon" &&
$target[0][0][0] === ",") {
{
let arg1 = $target[0][1];
let arg2 = $target[1];
return cons(arg1)(recur(arg2))
}
}
return cons(arg)(nil)
throw new Error('Failed to match. ' + valueToString($target));
})(arg));

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

const concat$ti = (lists) => (($target) => {
if ($target.type === "nil") {
return nil
}
if ($target.type === "cons" &&
$target[0].type === "nil") {
{
let rest = $target[1];
return concat$ti(rest)
}
}
if ($target.type === "cons" &&
$target[0].type === "cons") {
{
let one = $target[0][0];
let rest = $target[0][1];
let lsts = $target[1];
return cons(one)(concat$ti(cons(rest)(lsts)))
}
}
throw new Error('Failed to match. ' + valueToString($target));
})(lists);

const length = (lst) => (($target) => {
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
})(lst);

const $co = (v0) => (v1) => ({type: ",", 0: v0, 1: v1})
const scheme = (v0) => (v1) => ({type: "scheme", 0: v0, 1: v1})
const pany = (v0) => ({type: "pany", 0: v0})
const pvar = (v0) => (v1) => ({type: "pvar", 0: v0, 1: v1})
const pcon = (v0) => (v1) => (v2) => (v3) => ({type: "pcon", 0: v0, 1: v1, 2: v2, 3: v3})
const pstr = (v0) => (v1) => ({type: "pstr", 0: v0, 1: v1})
const pprim = (v0) => (v1) => ({type: "pprim", 0: v0, 1: v1})
const type_apply = (subst) => (type) => (($target) => {
if ($target.type === "tvar") {
{
let n = $target[0];
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
})(map$slget(subst)(n))
}
}
if ($target.type === "tapp") {
{
let a = $target[0];
let b = $target[1];
let c = $target[2];
return tapp(type_apply(subst)(a))(type_apply(subst)(b))(c)
}
}
return type
throw new Error('Failed to match. ' + valueToString($target));
})(type);

const scheme_free = ({1: type, 0: vbls}) => set$sldiff(type_free(type))(vbls);

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

const map_without = (map) => (set) => foldr(map)(set$slto_list(set))(map$slrm);

const demo_new_subst = map$slfrom_list(cons($co("a")(tcon("a-mapped")(-1)))(cons($co("b")(tvar("c")(-1)))(nil)));

{
    const test = (a) => set$slto_list(scheme_free(a));
    
    const in_0 = scheme(set$slfrom_list(cons("a")(nil)))(tvar("a")(-1));
    const mod_0 = test(in_0);
    const out_0 = nil;
    if (!equal(mod_0, out_0)) {
        console.log(mod_0);
        console.log(out_0);
        throw new Error(`Fixture test (2910) failing 0. Not equal.`);
    }
    

    const in_1 = scheme(set$slfrom_list(nil))(tvar("a")(-1));
    const mod_1 = test(in_1);
    const out_1 = cons("a")(nil);
    if (!equal(mod_1, out_1)) {
        console.log(mod_1);
        console.log(out_1);
        throw new Error(`Fixture test (2910) failing 1. Not equal.`);
    }
    
}
const tconstructor = (v0) => (v1) => (v2) => (v3) => ({type: "tconstructor", 0: v0, 1: v1, 2: v2, 3: v3})
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
let a = $target[0][0];
let one = $target[0][1];
let b = $target[1][0];
let two = $target[1][1];
return cons($co(a)(b))(zip(one)(two))
}
}
return nil
throw new Error('Failed to match. ' + valueToString($target));
})($co(one)(two));

const at = (arr) => (i) => (default_) => (($target) => {
if ($target.type === "nil") {
return default_
}
if ($target.type === "cons") {
{
let one = $target[0];
let rest = $target[1];
return (($target) => {
if ($target === true) {
return one
}
return at(rest)(_(i)(1))(default_)
throw new Error('Failed to match. ' + valueToString($target));
})($eq(i)(0))
}
}
throw new Error('Failed to match. ' + valueToString($target));
})(arr);

const letters = cons("a")(cons("b")(cons("c")(cons("d")(cons("e")(cons("f")(cons("g")(cons("h")(cons("i")(cons("j")(cons("k")(cons("l")(cons("m")(cons("n")(cons("o")(nil)))))))))))))));

const unwrap_fn = (t) => (($target) => {
if ($target.type === "tapp" &&
$target[0].type === "tapp" &&
$target[0][0].type === "tcon" &&
$target[0][0][0] === "->") {
{
let a = $target[0][1];
let b = $target[1];
return (({1: res, 0: args}) => $co(cons(a)(args))(res))(unwrap_fn(b))
}
}
return $co(nil)(t)
throw new Error('Failed to match. ' + valueToString($target));
})(t);

const join = (sep) => (arr) => (($target) => {
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
})(arr);

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

const unwrap_app = (t) => (($target) => {
if ($target.type === "tapp") {
{
let a = $target[0];
let b = $target[1];
return (({1: args, 0: target}) => $co(target)(cons(b)(args)))(unwrap_app(a))
}
}
return $co(t)(nil)
throw new Error('Failed to match. ' + valueToString($target));
})(t);

const one = (v0) => ({type: "one", 0: v0})
const many = (v0) => ({type: "many", 0: v0})
const empty = ({type: "empty"})
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
let il = $target[1];
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
if ($target.type === "tapp") {
{
let one = $target[0];
let two = $target[1];
return bag$sland(externals_type(bound)(one))(externals_type(bound)(two))
}
}
throw new Error('Failed to match. ' + valueToString($target));
})(t);

const concat = (one) => (two) => (($target) => {
if ($target.type === "nil") {
return two
}
if ($target.type === "cons" &&
$target[1].type === "nil") {
{
let one = $target[0];
return cons(one)(two)
}
}
if ($target.type === "cons") {
{
let one = $target[0];
let rest = $target[1];
return cons(one)(concat(rest)(two))
}
}
throw new Error('Failed to match. ' + valueToString($target));
})(one);

const filter = (f) => (list) => (($target) => {
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
})(list);

const tfns = (args) => (result) => foldr(result)(args)((result) => (arg) => tfn(arg)(result)(-1));

const concrete = (t) => scheme(set$slnil)(t);

const generic = (vbls) => (t) => scheme(set$slfrom_list(vbls))(t);

const scheme$sltype = ({1: type}) => type;

const len = (arr) => (($target) => {
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
})(arr);

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
throw new Error('Failed to match. ' + valueToString($target));
})(pat);

const pat_to_string = (pat) => (($target) => {
if ($target.type === "pany") {
return "_"
}
if ($target.type === "pvar") {
{
let n = $target[0];
return n
}
}
if ($target.type === "pcon") {
{
let c = $target[0];
let il = $target[1];
let pats = $target[2];
return `(${c} ${join(" ")(map(pats)(pat_to_string))})`
}
}
if ($target.type === "pstr") {
{
let s = $target[0];
return `\"${s}\"`
}
}
if ($target.type === "pprim") {
return "prim"
}
throw new Error('Failed to match. ' + valueToString($target));
})(pat);

{
    const test = type_apply(map$slfrom_list(cons($co("a")(tcon("int")(-1)))(nil)));
    
    const in_0 = tvar("a")(-1);
    const mod_0 = test(in_0);
    const out_0 = tcon("int")(-1);
    if (!equal(mod_0, out_0)) {
        console.log(mod_0);
        console.log(out_0);
        throw new Error(`Fixture test (11869) failing 0. Not equal.`);
    }
    

    const in_1 = tvar("b")(-1);
    const mod_1 = test(in_1);
    const out_1 = tvar("b")(-1);
    if (!equal(mod_1, out_1)) {
        console.log(mod_1);
        console.log(out_1);
        throw new Error(`Fixture test (11869) failing 1. Not equal.`);
    }
    

    const in_2 = tapp(tcon("list")(-1))(tvar("a")(-1))(-1);
    const mod_2 = test(in_2);
    const out_2 = tapp(tcon("list")(-1))(tcon("int")(-1))(-1);
    if (!equal(mod_2, out_2)) {
        console.log(mod_2);
        console.log(out_2);
        throw new Error(`Fixture test (11869) failing 2. Not equal.`);
    }
    
}
const apply_tuple = (f) => ({1: b, 0: a}) => f(a)(b);

const any = (values) => (f) => (($target) => {
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
return any(rest)(f)
throw new Error('Failed to match. ' + valueToString($target));
})(f(one))
}
}
throw new Error('Failed to match. ' + valueToString($target));
})(values);

const extract_type_call = (type) => (args) => (($target) => {
if ($target.type === "tapp") {
{
let one = $target[0];
let arg = $target[1];
let l = $target[2];
return extract_type_call(one)(cons($co(arg)(l))(args))
}
}
return $co(type)(args)
throw new Error('Failed to match. ' + valueToString($target));
})(type);

const fst = ({0: a}) => a;

const pat_externals = (pat) => (($target) => {
if ($target.type === "pcon") {
{
let name = $target[0];
let il = $target[1];
let args = $target[2];
let l = $target[3];
return bag$sland(one($co(name)($co(value)(il))))(many(map(args)(pat_externals)))
}
}
return empty
throw new Error('Failed to match. ' + valueToString($target));
})(pat);

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

const find_missing_names = (values) => (ex) => ((externals) => filter(({1: loc, 0: name}) => (($target) => {
if ($target.type === "some") {
return false
}
return true
throw new Error('Failed to match. ' + valueToString($target));
})(map$slget(values)(name)))(map$slto_list(externals)))(bag$slfold((ext) => ({1: {1: l}, 0: name}) => map$slset(ext)(name)(l))(map$slnil)(ex));

const cst$sllist = (v0) => (v1) => ({type: "cst/list", 0: v0, 1: v1})
const cst$slarray = (v0) => (v1) => ({type: "cst/array", 0: v0, 1: v1})
const cst$slspread = (v0) => (v1) => ({type: "cst/spread", 0: v0, 1: v1})
const cst$slid = (v0) => (v1) => ({type: "cst/id", 0: v0, 1: v1})
const cst$slstring = (v0) => (v1) => (v2) => ({type: "cst/string", 0: v0, 1: v1, 2: v2})
const StateT = (v0) => ({type: "StateT", 0: v0})
const run_$gt = ({0: f}) => (state) => (({1: result}) => result)(f(state));

const $lt_ = (x) => StateT((state) => $co(state)(ok(x)));

const $lt_err = (e) => StateT((state) => $co(state)(err(e)));

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

const $lt_state = StateT((state) => $co(state)(ok(state)));

const state_$gt = (v) => StateT((old) => $co(v)(ok(old)));

const state_f = ({0: f}) => f;

const state$slnil = $co(0)($co($co(nil)($co(nil)(nil)))(map$slnil));

const run$slnil_$gt = (st) => run_$gt(st)(state$slnil);

const pat_$gts = (pat) => (($target) => {
if ($target.type === "pany") {
{
let int = $target[0];
return "_"
}
}
if ($target.type === "pvar") {
{
let string = $target[0];
let int = $target[1];
return string
}
}
if ($target.type === "pcon") {
{
let string = $target[0];
let args = $target[2];
let int = $target[3];
return `(${string}${join("")(map(args)((pat) => ` ${pat_$gts(pat)}`))})`
}
}
if ($target.type === "pstr") {
{
let string = $target[0];
let int = $target[1];
return string
}
}
if ($target.type === "pprim") {
{
let prim = $target[0];
let int = $target[1];
return prim_$gts(prim)
}
}
throw new Error('Failed to match. ' + valueToString($target));
})(pat);

const terr = (v0) => (v1) => ({type: "terr", 0: v0, 1: v1})
const ttypes = (v0) => (v1) => ({type: "ttypes", 0: v0, 1: v1})
const twrap = (v0) => (v1) => ({type: "twrap", 0: v0, 1: v1})
const tmissing = (v0) => ({type: "tmissing", 0: v0})
const type_error = (message) => (loced_items) => terr(message)(loced_items);

/* type alias */
/* type alias */
const scheme$slt = ({1: t}) => t;

const type$eq = (one) => (two) => (($target) => {
if ($target.type === "," &&
$target[0].type === "tvar" &&
$target[1].type === "tvar") {
{
let a = $target[0][0];
let b = $target[1][0];
return $eq(a)(b)
}
}
if ($target.type === "," &&
$target[0].type === "tapp" &&
$target[1].type === "tapp") {
{
let a = $target[0][0];
let b = $target[0][1];
let c = $target[1][0];
let d = $target[1][1];
return (($target) => {
if ($target === true) {
return type$eq(b)(d)
}
return false
throw new Error('Failed to match. ' + valueToString($target));
})(type$eq(a)(c))
}
}
if ($target.type === "," &&
$target[0].type === "tcon" &&
$target[1].type === "tcon") {
{
let a = $target[0][0];
let b = $target[1][0];
return $eq(a)(b)
}
}
return false
throw new Error('Failed to match. ' + valueToString($target));
})($co(one)(two));

const applied_types = (types) => (subst) => map(types)(({1: {1: keep, 0: type}, 0: loc}) => (($target) => {
if ($target === true) {
return $co(loc)(type)
}
return $co(loc)(type_apply(subst)(type))
throw new Error('Failed to match. ' + valueToString($target));
})(keep));

const $co$co0 = ({0: a}) => a;

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
throw new Error('Failed to match. ' + valueToString($target));
})(type);

const rev_pair = ({1: b, 0: a}) => $co(b)(a);

const err$gt$gt$eq = ({0: f}) => (next) => StateT((state) => (($target) => {
if ($target.type === "," &&
$target[1].type === "err") {
{
let state = $target[0];
let e = $target[1][0];
return $co(state)(next(e))
}
}
if ($target.type === ",") {
{
let state = $target[0];
let v = $target[1];
return $co(state)(v)
}
}
throw new Error('Failed to match. ' + valueToString($target));
})(f(state)));

const tcon_and_args = (type) => (coll) => (l) => (($target) => {
if ($target.type === "tvar") {
return fatal(`Type not resolved ${int_to_string(l)}`)
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
    
    const in_0 = {"0":{"0":{"0":{"0":"hi","1":25343,"type":"tcon"},"1":{"0":"a","1":25344,"type":"tcon"},"2":25342,"type":"tapp"},"1":{"0":"b","1":25345,"type":"tcon"},"2":25342,"type":"tapp"},"1":{"0":{"0":"c","1":25347,"type":"tcon"},"1":{"0":"d","1":25348,"type":"tcon"},"2":25346,"type":"tapp"},"2":25342,"type":"tapp"};
    const mod_0 = test(in_0);
    const out_0 = $co("hi")(cons(tcon("a")(25344))(cons(tcon("b")(25345))(cons(tapp(tcon("c")(25347))(tcon("d")(25348))(25346))(nil))));
    if (!equal(mod_0, out_0)) {
        console.log(mod_0);
        console.log(out_0);
        throw new Error(`Fixture test (25326) failing 0. Not equal.`);
    }
    
}
const default_matrix = (matrix) => concat$ti(map(matrix)((row) => (($target) => {
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
})(row)));

const fold_ex_pats = (init) => (pats) => (f) => foldl(init)(pats)((init) => (pat) => fold_ex_pat(init)(pat)(f));

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

const tdeftype = (v0) => (v1) => (v2) => (v3) => (v4) => ({type: "tdeftype", 0: v0, 1: v1, 2: v2, 3: v3, 4: v4})
const ttypealias = (v0) => (v1) => (v2) => (v3) => (v4) => ({type: "ttypealias", 0: v0, 1: v1, 2: v2, 3: v3, 4: v4})
const tdef = (v0) => (v1) => (v2) => (v3) => ({type: "tdef", 0: v0, 1: v1, 2: v2, 3: v3})
const texpr = (v0) => (v1) => ({type: "texpr", 0: v0, 1: v1})

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
const tts_inner = (t) => (free) => (locs) => (($target) => {
if ($target.type === "tvar") {
{
let s = $target[0];
let l = $target[1];
return (({1: idx, 0: fmap}) => (($target) => {
if ($target.type === "some") {
{
let fmap = $target[0];
return (($target) => {
if ($target.type === "some") {
{
let s = $target[0];
return $co(and_loc(locs)(l)(s))(free)
}
}
{
let none = $target;
return ((name) => $co(and_loc(locs)(l)(name))($co(some(map$slset(fmap)(s)(name)))($pl(1)(idx))))(at(letters)(idx)("_too_many_vbls_"))
}
throw new Error('Failed to match. ' + valueToString($target));
})(map$slget(fmap)(s))
}
}
return $co(and_loc(locs)(l)(s))(free)
throw new Error('Failed to match. ' + valueToString($target));
})(fmap))(free)
}
}
if ($target.type === "tcon") {
{
let s = $target[0];
let l = $target[1];
return $co(and_loc(locs)(l)(s))(free)
}
}
if ($target.type === "tapp" &&
$target[0].type === "tapp" &&
$target[0][0].type === "tcon" &&
$target[0][0][0] === "->") {
{
let a = $target[0][1];
let la = $target[0][2];
let b = $target[1];
let l = $target[2];
return (({1: r, 0: iargs}) => ((args) => (({1: free, 0: args}) => (({1: free, 0: two}) => $co(and_loc(locs)(l)(`(fn [${join(" ")(rev(args)(nil))}] ${two})`))(free))(tts_inner(r)(free)(locs)))(tts_list(args)(free)(locs)))(cons(a)(iargs)))(unwrap_fn(b))
}
}
if ($target.type === "tapp" &&
$target[0].type === "tapp" &&
$target[0][0].type === "tcon" &&
$target[0][0][0] === ",") {
{
let l$co = $target[0][0][1];
let arg1 = $target[0][1];
let la = $target[0][2];
let arg2 = $target[1];
let l = $target[2];
return ((args) => (({1: free, 0: args}) => $co(and_loc(locs)(l)(`(, ${join(" ")(rev(args)(nil))})`))(free))(tts_list(args)(free)(locs)))(cons(arg1)(unwrap_type_tuple(arg2)))
}
}
if ($target.type === "tapp") {
{
let a = $target[0];
let b = $target[1];
let l = $target[2];
return (({1: args, 0: target}) => ((args) => ((args) => (({1: free, 0: args}) => (({1: free, 0: one}) => $co(and_loc(locs)(l)(`(${one} ${join(" ")(rev(args)(nil))})`))(free))(tts_inner(target)(free)(locs)))(tts_list(args)(free)(locs)))(rev(args)(nil)))(cons(b)(args)))(unwrap_app(a))
}
}
throw new Error('Failed to match. ' + valueToString($target));
})(t);


const tts_list = (args) => (free) => (locs) => foldl($co(nil)(free))(args)(({1: free, 0: args}) => (a) => (({1: free, 0: arg}) => $co(cons(arg)(args))(free))(tts_inner(a)(free)(locs)));

const ttc_inner = (t) => (free) => (($target) => {
if ($target.type === "tvar") {
{
let vname = $target[0];
let loc = $target[1];
return (({1: idx, 0: fmap}) => (($target) => {
if ($target.type === "some") {
{
let fmap = $target[0];
return (($target) => {
if ($target.type === "some") {
{
let name = $target[0];
return $co(cst$slid(name)(loc))(free)
}
}
{
let none = $target;
return ((name) => $co(cst$slid(name)(loc))($co(some(map$slset(fmap)(vname)(name)))($pl(1)(idx))))(at(letters)(idx)("_too_many_vbls_"))
}
throw new Error('Failed to match. ' + valueToString($target));
})(map$slget(fmap)(vname))
}
}
return $co(cst$slid(vname)(loc))(free)
throw new Error('Failed to match. ' + valueToString($target));
})(fmap))(free)
}
}
if ($target.type === "tcon") {
{
let name = $target[0];
let l = $target[1];
return $co(cst$slid(name)(l))(free)
}
}
if ($target.type === "tapp" &&
$target[0].type === "tapp" &&
$target[0][0].type === "tcon" &&
$target[0][0][0] === "->") {
{
let a = $target[0][1];
let la = $target[0][2];
let b = $target[1];
let l = $target[2];
return (({1: r, 0: iargs}) => ((args) => (({1: free, 0: args}) => (({1: free, 0: two}) => $co(cst$sllist(cons(cst$slid("fn")(la))(cons(cst$slarray(rev(args)(nil))(la))(cons(two)(nil))))(l))(free))(ttc_inner(r)(free)))(ttc_list(args)(free)))(cons(a)(iargs)))(unwrap_fn(b))
}
}
if ($target.type === "tapp" &&
$target[0].type === "tapp" &&
$target[0][0].type === "tcon" &&
$target[0][0][0] === ",") {
{
let l$co = $target[0][0][1];
let arg1 = $target[0][1];
let la = $target[0][2];
let arg2 = $target[1];
let l = $target[2];
return ((args) => (({1: free, 0: args}) => $co(cst$sllist(cons(cst$slid(",")(l$co))(rev(args)(nil)))(l))(free))(ttc_list(args)(free)))(cons(arg1)(unwrap_type_tuple(arg2)))
}
}
if ($target.type === "tapp") {
{
let a = $target[0];
let b = $target[1];
let l = $target[2];
return (({1: args, 0: target}) => ((args) => ((args) => (({1: free, 0: args}) => (({1: free, 0: one}) => $co(cst$sllist(cons(one)(rev(args)(nil)))(l))(free))(ttc_inner(target)(free)))(ttc_list(args)(free)))(rev(args)(nil)))(cons(b)(args)))(unwrap_app(a))
}
}
throw new Error('Failed to match. ' + valueToString($target));
})(t);


const ttc_list = (args) => (free) => foldl($co(nil)(free))(args)(({1: free, 0: args}) => (a) => (({1: free, 0: arg}) => $co(cons(arg)(args))(free))(ttc_inner(a)(free)));

const specialized_matrix = (constructor) => (arity) => (matrix) => concat$ti(map(matrix)(specialize_row(constructor)(arity)));


const specialize_row = (constructor) => (arity) => (row) => (($target) => {
if ($target.type === "nil") {
return fatal("Can't specialize an empty row")
}
if ($target.type === "cons" &&
$target[0].type === "ex/any") {
{
let rest = $target[1];
return cons(concat(any_list(arity))(rest))(nil)
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
return cons(concat(args)(rest))(nil)
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

const scheme_apply = (subst) => ({1: type, 0: vbls}) => scheme(vbls)(type_apply(map_without(subst)(vbls))(type));

const tenv = (v0) => (v1) => (v2) => (v3) => ({type: "tenv", 0: v0, 1: v1, 2: v2, 3: v3})
const tenv$sltype = ({0: types}) => (key) => map$slget(types)(key);

const tenv$slcon = ({1: cons}) => (key) => map$slget(cons)(key);

const tenv$slnames = ({2: names}) => (key) => map$slget(names)(key);

const tenv$slset_type = ({3: alias, 2: names, 1: cons, 0: types}) => (k) => (v) => tenv(map$slset(types)(k)(v))(cons)(names)(alias);

const tenv$slnil = tenv(map$slnil)(map$slnil)(map$slnil)(map$slnil);

const type_to_string = (t) => (({0: text}) => text)(tts_inner(t)($co(some(map$slnil))(0))(false));

const type_to_string_raw = (t) => (({0: text}) => text)(tts_inner(t)($co(none)(0))(false));

{
    const test = type_to_string;
    
    const in_0 = {"0":{"0":{"0":"->","1":6755,"type":"tcon"},"1":{"0":"a","1":6757,"type":"tcon"},"2":6754,"type":"tapp"},"1":{"0":{"0":{"0":"->","1":6748,"type":"tcon"},"1":{"0":"b","1":6749,"type":"tcon"},"2":6747,"type":"tapp"},"1":{"0":"c","1":6750,"type":"tcon"},"2":6747,"type":"tapp"},"2":6754,"type":"tapp"};
    const mod_0 = test(in_0);
    const out_0 = "(fn [a b] c)";
    if (!equal(mod_0, out_0)) {
        console.log(mod_0);
        console.log(out_0);
        throw new Error(`Fixture test (6738) failing 0. Not equal.`);
    }
    

    const in_1 = {"0":{"0":{"0":"->","1":6768,"type":"tcon"},"1":{"0":"a","1":6769,"type":"tcon"},"2":6766,"type":"tapp"},"1":{"0":"b","1":6770,"type":"tcon"},"2":6766,"type":"tapp"};
    const mod_1 = test(in_1);
    const out_1 = "(fn [a] b)";
    if (!equal(mod_1, out_1)) {
        console.log(mod_1);
        console.log(out_1);
        throw new Error(`Fixture test (6738) failing 1. Not equal.`);
    }
    

    const in_2 = {"0":{"0":{"0":"cons","1":6778,"type":"tcon"},"1":{"0":"a","1":6779,"type":"tcon"},"2":6777,"type":"tapp"},"1":{"0":"b","1":6780,"type":"tcon"},"2":6777,"type":"tapp"};
    const mod_2 = test(in_2);
    const out_2 = "(cons a b)";
    if (!equal(mod_2, out_2)) {
        console.log(mod_2);
        console.log(out_2);
        throw new Error(`Fixture test (6738) failing 2. Not equal.`);
    }
    

    const in_3 = {"0":{"0":{"0":",","1":24645,"type":"tcon"},"1":{"0":"a","1":24646,"type":"tcon"},"2":24644,"type":"tapp"},"1":{"0":{"0":{"0":",","1":24645,"type":"tcon"},"1":{"0":"b","1":24647,"type":"tcon"},"2":24644,"type":"tapp"},"1":{"0":"c","1":24648,"type":"tcon"},"2":24644,"type":"tapp"},"2":24644,"type":"tapp"};
    const mod_3 = test(in_3);
    const out_3 = "(, a b c)";
    if (!equal(mod_3, out_3)) {
        console.log(mod_3);
        console.log(out_3);
        throw new Error(`Fixture test (6738) failing 3. Not equal.`);
    }
    
}
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
if ($target.type === "estr") {
{
let first = $target[0];
let templates = $target[1];
let int = $target[2];
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
let int = $target[1];
return empty
}
}
if ($target.type === "elambda") {
{
let pats = $target[0];
let body = $target[1];
let int = $target[2];
return bag$sland(foldl(empty)(map(pats)(pat_externals))(bag$sland))(externals(foldl(bound)(map(pats)(pat_names))(set$slmerge))(body))
}
}
if ($target.type === "elet") {
{
let bindings = $target[0];
let body = $target[1];
let l = $target[2];
return (({1: bound, 0: bag}) => bag$sland(bag)(externals(bound)(body)))(foldl($co(empty)(bound))(bindings)(({1: bound, 0: bag}) => ({1: init, 0: pat}) => $co(bag$sland(bag)(bag$sland(pat_externals(pat))(externals(bound)(init))))(set$slmerge(bound)(pat_names(pat)))))
}
}
if ($target.type === "eapp") {
{
let target = $target[0];
let args = $target[1];
let int = $target[2];
return bag$sland(externals(bound)(target))(foldl(empty)(map(args)(externals(bound)))(bag$sland))
}
}
if ($target.type === "ematch") {
{
let expr = $target[0];
let cases = $target[1];
let int = $target[2];
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

const bag$slto_list = bag$slfold((list) => (a) => cons(a)(list))(nil);

{
    const test = bag$slto_list;
    
    const in_0 = many(cons(empty)(cons(one(1))(cons(many(cons(one(2))(cons(empty)(nil))))(cons(one(10))(nil)))));
    const mod_0 = test(in_0);
    const out_0 = cons(1)(cons(2)(cons(10)(nil)));
    if (!equal(mod_0, out_0)) {
        console.log(mod_0);
        console.log(out_0);
        throw new Error(`Fixture test (7494) failing 0. Not equal.`);
    }
    
}
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
return cons($co(name)($co(type)(l)))(map(constructors)(({1: {0: l}, 0: name}) => $co(name)($co(value)(l))))
}
}
throw new Error('Failed to match. ' + valueToString($target));
})(stmt);

const show_types = (names) => ({0: types}) => ((names) => map(filter(({1: v, 0: k}) => set$slhas(names)(k))(map$slto_list(types)))(({1: {1: l, 0: {1: type, 0: free}}, 0: name}) => (($target) => {
if ($target.type === "nil") {
return `${name} = ${type_to_string(type)}`
}
{
let free = $target;
return `${name} = ${join(",")(free)} : ${type_to_string_raw(type)}`
}
throw new Error('Failed to match. ' + valueToString($target));
})(set$slto_list(free))))(set$slfrom_list(names));

const show_types_list = (types) => join("\n")(map(types)(type_to_string_raw));

const show_subst = (subst) => join("\n")(map(map$slto_list(subst))(({1: type, 0: name}) => `${name} -> ${type_to_string_raw(type)}`));

const show_substs = (substs) => join("\n::\n")(map(substs)(show_subst));

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
throw new Error('Failed to match. ' + valueToString($target));
})(expr);

const tenv$slmerge = ({3: alias, 2: types, 1: constructors, 0: values}) => ({3: nalias, 2: ntypes, 1: ncons, 0: nvalues}) => tenv(map$slmerge(values)(nvalues))(map$slmerge(constructors)(ncons))(map$slmerge(types)(ntypes))(map$slmerge(alias)(nalias));

const inference = (v0) => (v1) => (v2) => (v3) => (v4) => (v5) => ({type: "inference", 0: v0, 1: v1, 2: v2, 3: v3, 4: v4, 5: v5})
const analysis = (v0) => (v1) => (v2) => ({type: "analysis", 0: v0, 1: v1, 2: v2})
const check_invariant = (place) => (new_subst) => (old_subst) => foldl(none)(map$slkeys(old_subst))((current) => (key) => (($target) => {
if ($target.type === "some") {
{
let v = $target[0];
return current
}
}
if ($target.type === "none") {
return foldl(none)(map$slto_list(new_subst))((current) => ({1: type, 0: nkey}) => (($target) => {
if ($target.type === "some") {
{
let v = $target[0];
return current
}
}
if ($target.type === "none") {
return (($target) => {
if ($target === true) {
return some(`compose-subst[${place}]: old-subst has key ${key}, which is used in new-subst for ${nkey} => ${type_to_string_raw(type)}`)
}
return current
throw new Error('Failed to match. ' + valueToString($target));
})(has_free(type)(key))
}
throw new Error('Failed to match. ' + valueToString($target));
})(current))
}
throw new Error('Failed to match. ' + valueToString($target));
})(current));

const tenv$slset_constructors = ({3: alias, 2: names, 1: cons, 0: types}) => (name) => (vbls) => (ncons) => (loc) => tenv(types)(map$slmerge(cons)(ncons))(map$slset(names)(name)($co(vbls)($co(set$slfrom_list(map$slkeys(ncons)))(loc))))(alias);

const check_type_names = (tenv$qu) => (type) => (($target) => {
if ($target.type === "tvar") {
return true
}
if ($target.type === "tcon") {
{
let name = $target[0];
return (({3: alias, 2: types}) => (($target) => {
if ($target === true) {
return true
}
return (($target) => {
if ($target === true) {
return true
}
return fatal(`Unknown type ${name}`)
throw new Error('Failed to match. ' + valueToString($target));
})(map$slhas(alias)(name))
throw new Error('Failed to match. ' + valueToString($target));
})(map$slhas(types)(name)))(tenv$qu)
}
}
if ($target.type === "tapp") {
{
let one = $target[0];
let two = $target[1];
return (($target) => {
if ($target === true) {
return check_type_names(tenv$qu)(two)
}
return false
throw new Error('Failed to match. ' + valueToString($target));
})(check_type_names(tenv$qu)(one))
}
}
throw new Error('Failed to match. ' + valueToString($target));
})(type);

const tenv$slalias = ({3: alias}) => alias;

const split_stmts = (stmts) => (sdefs) => (stypes) => (salias) => (sexps) => (($target) => {
if ($target.type === "nil") {
return $co(sdefs)($co(stypes)($co(salias)(sexps)))
}
if ($target.type === "cons") {
{
let one = $target[0];
let rest = $target[1];
return (($target) => {
if ($target.type === "tdef") {
return split_stmts(rest)(cons(one)(sdefs))(stypes)(salias)(sexps)
}
if ($target.type === "tdeftype") {
return split_stmts(rest)(sdefs)(cons(one)(stypes))(salias)(sexps)
}
if ($target.type === "ttypealias") {
{
let name = $target[0];
let nl = $target[1];
let args = $target[2];
let body = $target[3];
return split_stmts(rest)(sdefs)(stypes)(cons($co(name)($co(args)($co(body)(nl))))(salias))(sexps)
}
}
if ($target.type === "texpr") {
{
let expr = $target[0];
return split_stmts(rest)(sdefs)(stypes)(salias)(cons(expr)(sexps))
}
}
throw new Error('Failed to match. ' + valueToString($target));
})(one)
}
}
throw new Error('Failed to match. ' + valueToString($target));
})(stmts);

const tenv$sladd_alias = ({3: aliases, 2: c, 1: b, 0: a}) => (name) => ({1: {1: l, 0: body}, 0: args}) => tenv(a)(b)(c)(map$slset(aliases)(name)($co(args)($co(body)(l))));

const tenv$sladd_builtin_type = ({3: d, 2: names, 1: b, 0: a}) => ({1: args, 0: name}) => tenv(a)(b)(map$slset(names)(name)($co(args)($co(set$slnil)(-1))))(d);

const externals_list = (x) => bag$slto_list(externals(set$slnil)(x));

const report_missing = (subst) => ({1: missing_vars, 0: missing}) => (($target) => {
if ($target.type === "nil") {
return $lt_(0)
}
{
let vars = $target;
return (({0: text}) => $lt_err(tmissing(map(zip(missing)(map(missing_vars)(type_apply(subst))))(({1: type, 0: {1: loc, 0: name}}) => $co(name)($co(loc)(type))))))(foldl($co(nil)($co(some(map$slnil))(0)))(map(missing_vars)(type_apply(subst)))(({1: maps, 0: result}) => (t) => (({1: maps, 0: text}) => $co(cons(text)(result))(maps))(tts_inner(t)(maps)(false))))
}
throw new Error('Failed to match. ' + valueToString($target));
})(missing_vars);

const tenv$slvalues = ({0: values}) => values;

const externals_defs = (stmts) => foldr(empty)(map(stmts)(({2: body}) => externals(set$slnil)(body)))(bag$sland);

{
    const test = dot(bag$slto_list)(externals(set$slfrom_list(cons("+")(cons("-")(cons("cons")(cons("nil")(cons("()")(nil))))))));
    
    const in_0 = {"0":"hi","1":16110,"type":"evar"};
    const mod_0 = test(in_0);
    const out_0 = cons($co("hi")($co(value)(16110)))(nil);
    if (!equal(mod_0, out_0)) {
        console.log(mod_0);
        console.log(out_0);
        throw new Error(`Fixture test (16089) failing 0. Not equal.`);
    }
    

    const in_1 = {"0":{"0":"cons","1":16141,"type":"evar"},"1":{"0":{"0":{"0":1,"1":16142,"type":"pint"},"1":16142,"type":"eprim"},"1":{"0":{"0":{"0":"cons","1":16141,"type":"evar"},"1":{"0":{"0":{"0":2,"1":16143,"type":"pint"},"1":16143,"type":"eprim"},"1":{"0":{"0":{"0":"cons","1":16141,"type":"evar"},"1":{"0":{"0":"c","1":16144,"type":"evar"},"1":{"0":{"0":"nil","1":16141,"type":"evar"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"2":16141,"type":"eapp"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"2":16141,"type":"eapp"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"2":16141,"type":"eapp"};
    const mod_1 = test(in_1);
    const out_1 = cons($co("c")($co(value)(16144)))(nil);
    if (!equal(mod_1, out_1)) {
        console.log(mod_1);
        console.log(out_1);
        throw new Error(`Fixture test (16089) failing 1. Not equal.`);
    }
    

    const in_2 = {"0":{"0":"one","1":16158,"type":"evar"},"1":{"0":{"0":"two","1":16159,"type":"evar"},"1":{"0":{"0":"three","1":16160,"type":"evar"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"2":16157,"type":"eapp"};
    const mod_2 = test(in_2);
    const out_2 = cons($co("one")($co(value)(16158)))(cons($co("two")($co(value)(16159)))(cons($co("three")($co(value)(16160)))(nil)));
    if (!equal(mod_2, out_2)) {
        console.log(mod_2);
        console.log(out_2);
        throw new Error(`Fixture test (16089) failing 2. Not equal.`);
    }
    

    const in_3 = {"0":"()","1":19772,"type":"evar"};
    const mod_3 = test(in_3);
    const out_3 = nil;
    if (!equal(mod_3, out_3)) {
        console.log(mod_3);
        console.log(out_3);
        throw new Error(`Fixture test (16089) failing 3. Not equal.`);
    }
    
}
/* type alias */
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
let value = $target[1][0];
return state_f(next(value))(state)
}
}
throw new Error('Failed to match. ' + valueToString($target));
})(f(state)));

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

const $lt_idx = $gt$gt$eq($lt_state)(({0: idx}) => $lt_(idx));

const idx_$gt = (idx) => $gt$gt$eq($lt_state)(({1: {1: c, 0: b}}) => $gt$gt$eq(state_$gt($co(idx)($co(b)(c))))((_) => $lt_($unit)));

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

const record_$gt = (loc) => (type) => (keep) => $gt$gt$eq($lt_state)(({1: {1: subst, 0: {1: usages, 0: types}}, 0: idx}) => $gt$gt$eq(state_$gt($co(idx)($co($co(cons($co(loc)($co(type)(keep)))(types))(usages))(subst))))((_) => $lt_($unit)));

const $lt_types = $gt$gt$eq($lt_state)(({1: {0: types}}) => $lt_(types));

const $lt_subst = $gt$gt$eq($lt_state)(({1: {1: subst}}) => $lt_(subst));

const apply_$gt = (f) => (tenv) => $gt$gt$eq($lt_subst)((subst) => $lt_(f(subst)(tenv)));

const type$slapply_$gt = apply_$gt(type_apply);

const pats_by_loc = (pat) => (($target) => {
if ($target.type === "pany") {
{
let int = $target[0];
return empty
}
}
if ($target.type === "pvar") {
{
let string = $target[0];
let int = $target[1];
return one($co(int)(evar(string)(int)))
}
}
if ($target.type === "pcon") {
{
let string = $target[0];
let pats = $target[2];
let int = $target[3];
return foldl(empty)(map(pats)(pats_by_loc))(bag$sland)
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
throw new Error('Failed to match. ' + valueToString($target));
})(pat);

const expr_$gts = (expr) => (($target) => {
if ($target.type === "eprim") {
{
let prim = $target[0];
let int = $target[1];
return prim_$gts(prim)
}
}
if ($target.type === "estr") {
{
let string = $target[0];
let templates = $target[1];
let int = $target[2];
return `\"${string}${join("")(map(templates)(({1: {0: suffix}, 0: expr}) => `${expr_$gts(expr)}${suffix}`))}\"`
}
}
if ($target.type === "evar") {
{
let string = $target[0];
let int = $target[1];
return string
}
}
if ($target.type === "elambda") {
{
let pats = $target[0];
let expr = $target[1];
let int = $target[2];
return `(fn [${join(" ")(map(pats)(pat_$gts))}] ${expr_$gts(expr)})`
}
}
if ($target.type === "eapp") {
{
let target = $target[0];
let args = $target[1];
let int = $target[2];
return `(${expr_$gts(target)} ${join(" ")(map(args)(expr_$gts))})`
}
}
if ($target.type === "elet") {
{
let bindings = $target[0];
let body = $target[1];
let int = $target[2];
return `(let [${join(" ")(map(bindings)(({1: init, 0: pat}) => `${pat_$gts(pat)} ${expr_$gts(init)}`))}]\n  ${expr_$gts(body)})`
}
}
if ($target.type === "ematch") {
{
let expr = $target[0];
let cases = $target[1];
let int = $target[2];
return `(match ${expr_$gts(expr)}\n  ${join("\n  ")(map(cases)(({1: body, 0: pat}) => `${pat_$gts(pat)}	${expr_$gts(body)}`))}`
}
}
if ($target.type === "equot") {
return "(equot ...)"
}
throw new Error('Failed to match. ' + valueToString($target));
})(expr);

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
return `Missing values: ${join("")(map(missing)(({1: {1: type, 0: loc}, 0: name}) => `\n - ${name} (${its(loc)}): ${type_to_string(type)}`))}`
}
}
if ($target.type === "ttypes") {
{
let t1 = $target[0];
let t2 = $target[1];
return `Incompatible types: ${type_to_string(t1)} and ${type_to_string(t2)}`
}
}
if ($target.type === "terr") {
{
let message = $target[0];
let names = $target[1];
return `${message}${join("")(map(names)(({1: loc, 0: name}) => `\n - ${name} (${its(loc)})`))}`
}
}
throw new Error('Failed to match. ' + valueToString($target));
})(err);

const expr_to_string = (expr) => (($target) => {
if ($target.type === "evar") {
{
let n = $target[0];
return n
}
}
if ($target.type === "elambda") {
{
let pats = $target[0];
let b = $target[1];
return `(fn [${join(" ")(map(pats)(pat_to_string))}] ${expr_to_string(b)})`
}
}
if ($target.type === "eapp") {
{
let a = $target[0];
let args = $target[1];
return `(${expr_to_string(a)} ${join(" ")(map(args)(expr_to_string))})`
}
}
if ($target.type === "eprim" &&
$target[0].type === "pint") {
{
let n = $target[0][0];
return int_to_string(n)
}
}
if ($target.type === "ematch") {
{
let t = $target[0];
let cases = $target[1];
return `(match ${expr_to_string(t)} ${join("\n")(map(cases)(({1: b, 0: a}) => `${pat_to_string(a)} ${expr_to_string(b)}`))}`
}
}
return "??"
throw new Error('Failed to match. ' + valueToString($target));
})(expr);

const record_usage_$gt = (loc) => (provider) => $gt$gt$eq($lt_state)(({1: {1: subst, 0: {1: {1: usages, 0: defs}, 0: types}}, 0: idx}) => $gt$gt$eq(state_$gt($co(idx)($co($co(types)($co(defs)(cons($co(loc)(provider))(usages))))(subst))))((_) => $lt_($unit)));

const record_def_$gt = (loc) => $gt$gt$eq($lt_state)(({1: {1: subst, 0: {1: {1: usages, 0: defs}, 0: types}}, 0: idx}) => $gt$gt$eq(state_$gt($co(idx)($co($co(types)($co(cons(loc)(defs))(usages)))(subst))))((_) => $lt_($unit)));

const subst_reset_$gt = (new_subst) => $gt$gt$eq($lt_state)(({1: {1: subst, 0: types}, 0: idx}) => $gt$gt$eq(state_$gt($co(idx)($co(types)(new_subst))))((_) => $lt_(subst)));

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

const externals_type_record = (bound) => (t) => (($target) => {
if ($target.type === "tvar") {
return $lt_(empty)
}
if ($target.type === "tcon") {
{
let name = $target[0];
let l = $target[1];
return (($target) => {
if ($target.type === "some") {
{
let pl = $target[0];
return $gt$gt$eq(record_usage_$gt(l)(pl))((_) => $lt_(empty))
}
}
return $lt_(one($co(name)($co(type)(l))))
throw new Error('Failed to match. ' + valueToString($target));
})(map$slget(bound)(name))
}
}
if ($target.type === "tapp") {
{
let one = $target[0];
let two = $target[1];
return $gt$gt$eq(externals_type_record(bound)(one))((one) => $gt$gt$eq(externals_type_record(bound)(two))((two) => $lt_(bag$sland(one)(two))))
}
}
throw new Error('Failed to match. ' + valueToString($target));
})(t);

const record_local_tcon_usages = (locals) => (tenv) => (t) => (($target) => {
if ($target.type === "tvar") {
return $lt_($unit)
}
if ($target.type === "tcon") {
{
let name = $target[0];
let l = $target[1];
return (($target) => {
if ($target.type === "some") {
{
let pl = $target[0];
return record_usage_$gt(l)(pl)
}
}
return $lt_($unit)
throw new Error('Failed to match. ' + valueToString($target));
})(map$slget(locals)(name))
}
}
if ($target.type === "tapp") {
{
let one = $target[0];
let two = $target[1];
return $gt$gt$eq(record_local_tcon_usages(locals)(tenv)(one))((_) => $gt$gt$eq(record_local_tcon_usages(locals)(tenv)(two))((_) => $lt_($unit)))
}
}
throw new Error('Failed to match. ' + valueToString($target));
})(t);

const record_usages_in_type = (tenv) => (rec) => (type) => (({3: alias, 2: tdefs, 0: types}) => (($target) => {
if ($target.type === "tcon") {
{
let name = $target[0];
let l = $target[1];
return (($target) => {
if ($target.type === "some" &&
$target[0].type === "," &&
$target[0][1].type === ",") {
{
let al = $target[0][1][1];
return record_usage_$gt(l)(al)
}
}
return (($target) => {
if ($target.type === "some" &&
$target[0].type === "," &&
$target[0][1].type === ",") {
{
let loc = $target[0][1][1];
return record_usage_$gt(l)(loc)
}
}
return (($target) => {
if ($target.type === "some") {
{
let loc = $target[0];
return record_usage_$gt(l)(loc)
}
}
return $lt_err(type_error("Unbound type")(cons($co(name)(l))(nil)))
throw new Error('Failed to match. ' + valueToString($target));
})(map$slget(rec)(name))
return ((nope) => $lt_($unit))(name)
throw new Error('Failed to match. ' + valueToString($target));
})(map$slget(tdefs)(name))
throw new Error('Failed to match. ' + valueToString($target));
})(map$slget(alias)(name))
}
}
if ($target.type === "tapp") {
{
let one = $target[0];
let two = $target[1];
let l = $target[2];
return $gt$gt$eq(record_usages_in_type(tenv)(rec)(one))((_) => $gt$gt$eq(record_usages_in_type(tenv)(rec)(two))((_) => $lt_($unit)))
}
}
return $lt_($unit)
throw new Error('Failed to match. ' + valueToString($target));
})(type))(tenv);

const type_to_cst = (t) => (({0: cst}) => cst)(ttc_inner(t)($co(some(map$slnil))(0)));

const expr$slidents = (expr) => (($target) => {
if ($target.type === "estr") {
{
let exprs = $target[1];
return many(map(exprs)(dot(expr$slidents)(fst)))
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

const type_with_free_rec = (free) => (type) => (($target) => {
if ($target.type === "tvar") {
return $lt_(type)
}
if ($target.type === "tcon") {
{
let s = $target[0];
let l = $target[1];
return (($target) => {
if ($target.type === "some") {
{
let fl = $target[0];
return $gt$gt$eq(record_usage_$gt(l)(fl))((_) => $lt_(tvar(s)(l)))
}
}
return $lt_(type)
throw new Error('Failed to match. ' + valueToString($target));
})(map$slget(free)(s))
}
}
if ($target.type === "tapp") {
{
let a = $target[0];
let b = $target[1];
let l = $target[2];
return $gt$gt$eq(type_with_free_rec(free)(a))((a) => $gt$gt$eq(type_with_free_rec(free)(b))((b) => $lt_(tapp(a)(b)(l))))
}
}
throw new Error('Failed to match. ' + valueToString($target));
})(type);

const tdefs_$gts = (tdefs) => (constructors) => map(map$slto_list(tdefs))(({1: {1: {1: loc, 0: cnames}, 0: num_args}, 0: name}) => `\n - ${name}${join("")(map(set$slto_list(cnames))((cname) => `\n   - ${cname} ${(($target) => {
if ($target.type === "none") {
return `Cant find defn for ${cname}`
}
if ($target.type === "some" &&
$target[0].type === "tconstructor") {
{
let free = $target[0][0];
let args = $target[0][1];
let res = $target[0][2];
let loc = $target[0][3];
return type_to_string(tfns(args)(res))
}
}
throw new Error('Failed to match. ' + valueToString($target));
})(map$slget(constructors)(cname))}`))}`);

const values_$gts = (values) => map(map$slto_list(values))(({1: {1: loc, 0: {1: type, 0: free}}, 0: name}) => `\n - ${name} ${type_to_string(type)}`);

{
    const test = type_to_cst;
    
    const in_0 = {"0":"hi","1":24524,"type":"tcon"};
    const mod_0 = test(in_0);
    const out_0 = cst$slid("hi")(24524);
    if (!equal(mod_0, out_0)) {
        console.log(mod_0);
        console.log(out_0);
        throw new Error(`Fixture test (24515) failing 0. Not equal.`);
    }
    

    const in_1 = {"0":{"0":{"0":"->","1":24536,"type":"tcon"},"1":{"0":"x","1":24539,"type":"tcon"},"2":24536,"type":"tapp"},"1":{"0":"int","1":24540,"type":"tcon"},"2":24536,"type":"tapp"};
    const mod_1 = test(in_1);
    const out_1 = cst$sllist(cons(cst$slid("fn")(24536))(cons(cst$slarray(cons(cst$slid("x")(24539))(nil))(24536))(cons(cst$slid("int")(24540))(nil))))(24536);
    if (!equal(mod_1, out_1)) {
        console.log(mod_1);
        console.log(out_1);
        throw new Error(`Fixture test (24515) failing 1. Not equal.`);
    }
    

    const in_2 = {"0":{"0":{"0":"->","1":24570,"type":"tcon"},"1":{"0":"a","1":24571,"type":"tcon"},"2":24569,"type":"tapp"},"1":{"0":"b","1":24572,"type":"tcon"},"2":24569,"type":"tapp"};
    const mod_2 = test(in_2);
    const out_2 = cst$sllist(cons(cst$slid("fn")(24569))(cons(cst$slarray(cons(cst$slid("a")(24571))(nil))(24569))(cons(cst$slid("b")(24572))(nil))))(24569);
    if (!equal(mod_2, out_2)) {
        console.log(mod_2);
        console.log(out_2);
        throw new Error(`Fixture test (24515) failing 2. Not equal.`);
    }
    

    const in_3 = {"0":{"0":{"0":"cons","1":24607,"type":"tcon"},"1":{"0":"a","1":24608,"type":"tcon"},"2":24606,"type":"tapp"},"1":{"0":"b","1":24609,"type":"tcon"},"2":24606,"type":"tapp"};
    const mod_3 = test(in_3);
    const out_3 = cst$sllist(cons(cst$slid("cons")(24607))(cons(cst$slid("a")(24608))(cons(cst$slid("b")(24609))(nil))))(24606);
    if (!equal(mod_3, out_3)) {
        console.log(mod_3);
        console.log(out_3);
        throw new Error(`Fixture test (24515) failing 3. Not equal.`);
    }
    

    const in_4 = {"0":{"0":{"0":",","1":24635,"type":"tcon"},"1":{"0":"a","1":24636,"type":"tcon"},"2":24634,"type":"tapp"},"1":{"0":{"0":{"0":",","1":24635,"type":"tcon"},"1":{"0":"b","1":24637,"type":"tcon"},"2":24634,"type":"tapp"},"1":{"0":"c","1":24638,"type":"tcon"},"2":24634,"type":"tapp"},"2":24634,"type":"tapp"};
    const mod_4 = test(in_4);
    const out_4 = cst$sllist(cons(cst$slid(",")(24635))(cons(cst$slid("a")(24636))(cons(cst$slid("b")(24637))(cons(cst$slid("c")(24638))(nil)))))(24634);
    if (!equal(mod_4, out_4)) {
        console.log(mod_4);
        console.log(out_4);
        throw new Error(`Fixture test (24515) failing 4. Not equal.`);
    }
    
}
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
return (({1: targs, 0: tname}) => (({1: tcons}) => (({2: cres, 1: cargs, 0: free_names}) => ((subst) => ex$slconstructor(name)(tname)(map(zip(args)(map(cargs)(type_apply(subst))))(pattern_to_ex_pattern(tenv))))(map$slfrom_list(zip(free_names)(targs))))((($target) => {
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
$target[0].type === "," &&
$target[0][1].type === ",") {
{
let names = $target[0][1][0];
return set$slto_list(names)
}
}
throw new Error('Failed to match. ' + valueToString($target));
})(map$slget(types)(gid)))(tenv)
throw new Error('Failed to match. ' + valueToString($target));
})(gid);

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
})(gid))(find_gid(heads)))(map(matrix)((row) => (($target) => {
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
})(row)));

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
return is_useful(tenv)(specialized_matrix(id)(length(args))(matrix))(concat(args)(rest))
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
return any(alts)(({1: alt, 0: id}) => is_useful(tenv)(specialized_matrix(id)(alt)(matrix))(concat(any_list(alt))(rest)))
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

const tenv$slrm = ({3: alias, 2: names, 1: cons, 0: types}) => ($var) => tenv(map$slrm(types)($var))(cons)(names)(alias);

const compose_subst = (place) => (new_subst) => (old_subst) => (($target) => {
if ($target.type === "some") {
{
let message = $target[0];
return fatal(message)
}
}
return map$slmerge(map$slmap(type_apply(new_subst))(old_subst))(new_subst)
throw new Error('Failed to match. ' + valueToString($target));
})((($target) => {
if ($target === true) {
return check_invariant(place)(new_subst)(old_subst)
}
return none
throw new Error('Failed to match. ' + valueToString($target));
})(debug_invariant));

const tenv_free = ({0: types}) => foldr(set$slnil)(map(map$slvalues(types))(({0: s}) => scheme_free(s)))(set$slmerge);

const tenv_apply = (subst) => ({3: alias, 2: names, 1: cons, 0: types}) => tenv(map$slmap(({1: l, 0: s}) => $co(scheme_apply(subst)(s))(l))(types))(cons)(names)(alias);

const generalize = (tenv) => (t) => scheme(set$sldiff(type_free(t))(tenv_free(tenv)))(t);

const new_type_var = (prefix) => (l) => $gt$gt$eq($lt_idx)((nidx) => $gt$gt$eq(idx_$gt($pl(nidx)(1)))((_) => $lt_(tvar(`${prefix}:${its(nidx)}`)(l))));

const basic = tenv(map$slfrom_list(cons($co("+")($co(scheme(set$slnil)(tfn(tint)(tfn(tint)(tint)(-1))(-1)))(-1)))(cons($co("-")($co(scheme(set$slnil)(tfn(tint)(tfn(tint)(tint)(-1))(-1)))(-1)))(cons($co("()")($co(scheme(set$slnil)(tcon("()")(-1)))(-1)))(cons($co(",")($co(scheme(set$slfrom_list(cons("a")(cons("b")(nil))))(tfn(tvar("a")(-1))(tfn(tvar("b")(-1))(tapp(tapp(tcon(",")(-1))(tvar("a")(-1))(-1))(tvar("b")(-1))(-1))(-1))(-1)))(-1)))(nil))))))(map$slfrom_list(cons($co(",")(tconstructor(cons("a")(cons("b")(nil)))(cons(tvar("a")(-1))(cons(tvar("b")(-1))(nil)))(tapp(tapp(tcon(",")(-1))(tvar("a")(-1))(-1))(tvar("b")(-1))(-1))(-1)))(nil)))(map$slfrom_list(cons($co("int")($co(0)($co(set$slnil)(-1))))(cons($co("string")($co(0)($co(set$slnil)(-1))))(cons($co("bool")($co(0)($co(set$slnil)(-1))))(cons($co(",")($co(2)($co(set$slfrom_list(cons(",")(nil)))(-1))))(nil))))))(map$slnil);

{
    const test = (x) => map$slto_list(compose_subst("test")(demo_new_subst)(map$slfrom_list(x)));
    

    const in_1 = cons($co("x")(tvar("a")(-1)))(nil);
    const mod_1 = test(in_1);
    const out_1 = cons($co("x")(tcon("a-mapped")(-1)))(cons($co("a")(tcon("a-mapped")(-1)))(cons($co("b")(tvar("c")(-1)))(nil)));
    if (!equal(mod_1, out_1)) {
        console.log(mod_1);
        console.log(out_1);
        throw new Error(`Fixture test (2704) failing 1. Not equal.`);
    }
    


    const in_3 = cons($co("a")(tvar("b")(-1)))(nil);
    const mod_3 = test(in_3);
    const out_3 = cons($co("a")(tvar("c")(-1)))(cons($co("b")(tvar("c")(-1)))(nil));
    if (!equal(mod_3, out_3)) {
        console.log(mod_3);
        console.log(out_3);
        throw new Error(`Fixture test (2704) failing 3. Not equal.`);
    }
    
}
const typecheck = (v0) => (v1) => (v2) => (v3) => ({type: "typecheck", 0: v0, 1: v1, 2: v2, 3: v3})
const subst_to_string = (subst) => join("\n")(map(map$slto_list(subst))(({1: v, 0: k}) => `${k} : ${type_to_string_raw(v)}`));

const externals_stmt = (stmt) => bag$slto_list((($target) => {
if ($target.type === "tdeftype") {
{
let string = $target[0];
let free = $target[2];
let constructors = $target[3];
return ((frees) => many(map(constructors)(({1: {1: {0: args}, 0: l}, 0: name}) => (($target) => {
if ($target.type === "nil") {
return empty
}
return many(map(args)(externals_type(frees)))
throw new Error('Failed to match. ' + valueToString($target));
})(args))))(set$slfrom_list(map(free)(fst)))
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
})(stmt));

const subst_aliases = (alias) => (type) => $gt$gt$eq($lt_(extract_type_call(type)(nil)))(({1: args, 0: base}) => $gt$gt$eq(map_$gt(({1: l, 0: arg}) => $gt$gt$eq(subst_aliases(alias)(arg))((arg) => $lt_($co(arg)(l))))(args))((args) => (($target) => {
if ($target.type === "tcon") {
{
let name = $target[0];
let l = $target[1];
return (($target) => {
if ($target.type === "some" &&
$target[0].type === "," &&
$target[0][1].type === ",") {
{
let names = $target[0][0];
let subst = $target[0][1][0];
let al = $target[0][1][1];
return (($target) => {
if ($target === true) {
return $lt_err(type_error(`Wrong number of args given to alias ${name}: expected ${its(len(names))}, given ${its(len(args))}.`)(cons($co(name)(l))(nil)))
}
return $gt$gt$eq($lt_((($target) => {
if ($target === true) {
return subst
}
return replace_in_type(map$slfrom_list(zip(names)(map(args)(fst))))(subst)
throw new Error('Failed to match. ' + valueToString($target));
})($eq(len(names))(0))))((subst) => subst_aliases(alias)(subst))
throw new Error('Failed to match. ' + valueToString($target));
})($ex$eq(len(names))(len(args)))
}
}
return $lt_(foldl(base)(args)((target) => ({1: l, 0: arg}) => tapp(target)(arg)(l)))
throw new Error('Failed to match. ' + valueToString($target));
})(map$slget(alias)(name))
}
}
return $lt_(foldl(base)(args)((target) => ({1: l, 0: arg}) => tapp(target)(arg)(l)))
throw new Error('Failed to match. ' + valueToString($target));
})(base)));

const infer_deftype = (tenv$qu) => (mutual_rec) => (tname) => (tnl) => (targs) => (constructors) => (l) => $gt$gt$eq($lt_(map(constructors)(({0: name}) => name)))((names) => $gt$gt$eq(record_def_$gt(tnl))((_) => $gt$gt$eq(foldl_$gt(tcon(tname)(tnl))(targs)((body) => ({1: al, 0: arg}) => $gt$gt$eq(record_def_$gt(al))((_) => $lt_(tapp(body)(tvar(arg)(al))(l)))))((final) => $gt$gt$eq($lt_(map$slfrom_list(targs)))((free_map) => $gt$gt$eq($lt_(set$slfrom_list(map$slkeys(free_map))))((free_set) => $gt$gt$eq(foldl_$gt($co(map$slnil)(map$slnil))(constructors)(({1: cons, 0: values}) => ({1: {1: {1: l, 0: args}, 0: nl}, 0: name}) => $gt$gt$eq(map_$gt(type_with_free_rec(free_map))(args))((args) => $gt$gt$eq(do_$gt(record_usages_in_type(tenv$qu)(mutual_rec))(args))((_) => $gt$gt$eq(record_def_$gt(nl))((_) => $gt$gt$eq(map_$gt(subst_aliases(tenv$slalias(tenv$qu)))(args))((args) => $lt_($co(map$slset(values)(name)($co(scheme(set$slfrom_list(map$slkeys(free_map)))(foldr(final)(args)((body) => (arg) => tfn(arg)(body)(l))))(nl)))(map$slset(cons)(name)(tconstructor(map(targs)(fst))(args)(final)(nl))))))))))(({1: cons, 0: values}) => $lt_(tenv(values)(cons)(map$slset(map$slnil)(tname)($co(len(targs))($co(set$slfrom_list(names))(tnl))))(map$slnil))))))));

const vars_for_names = (names) => (tenv) => foldr_$gt($co(tenv)(nil))(names)(({1: vars, 0: tenv}) => ({1: loc, 0: name}) => $gt$gt$eq(new_type_var(name)(loc))((self) => $lt_($co(tenv$slset_type(tenv)(name)($co(scheme(set$slnil)(self))(loc)))(cons(self)(vars)))));

const find_missing = (tenv) => (externals) => $gt$gt$eq($lt_(find_missing_names(tenv$slvalues(tenv))(externals)))((missing_names) => $gt$gt$eq(vars_for_names(missing_names)(tenv))(({1: missing_vars, 0: tenv}) => $lt_($co(tenv)($co(missing_names)(missing_vars)))));

const run$slrecord = (st) => run_$gt($gt$gt$eq(st)((value) => $gt$gt$eq($lt_types)((types) => $lt_($co(value)(types)))))(state$slnil);

const subst_$gt = (new_subst) => $gt$gt$eq($lt_state)(({1: {1: subst, 0: types}, 0: idx}) => $gt$gt$eq(state_$gt($co(idx)($co(types)(compose_subst("")(new_subst)(subst)))))((_) => $lt_($unit)));

const tenv$slapply_$gt = apply_$gt(tenv_apply);

const things_by_loc = (expr) => bag$sland(one($co(expr_loc(expr))(expr)))((($target) => {
if ($target.type === "estr") {
{
let string = $target[0];
let templates = $target[1];
let int = $target[2];
return foldl(empty)(map(templates)(({0: expr}) => things_by_loc(expr)))(bag$sland)
}
}
if ($target.type === "elambda") {
{
let pats = $target[0];
let expr = $target[1];
let int = $target[2];
return bag$sland(foldl(empty)(map(pats)(pats_by_loc))(bag$sland))(things_by_loc(expr))
}
}
if ($target.type === "eapp") {
{
let target = $target[0];
let args = $target[1];
let int = $target[2];
return bag$sland(things_by_loc(target))(foldl(empty)(map(args)(things_by_loc))(bag$sland))
}
}
if ($target.type === "elet") {
{
let bindings = $target[0];
let body = $target[1];
let int = $target[2];
return bag$sland(foldl(empty)(map(bindings)(({1: init, 0: pat}) => bag$sland(pats_by_loc(pat))(things_by_loc(init))))(bag$sland))(things_by_loc(body))
}
}
if ($target.type === "ematch") {
{
let expr = $target[0];
let cases = $target[1];
let int = $target[2];
return bag$sland(things_by_loc(expr))(foldl(empty)(map(cases)(({1: expr, 0: pat}) => things_by_loc(expr)))(bag$sland))
}
}
return empty
throw new Error('Failed to match. ' + valueToString($target));
})(expr));

const pat_name = (pat) => new_type_var((($target) => {
if ($target.type === "pvar") {
{
let name = $target[0];
return name
}
}
return "\$arg"
throw new Error('Failed to match. ' + valueToString($target));
})(pat))(pat_loc(pat));

const tenv_$gts = ({3: aliases, 2: tdefs, 1: constructors, 0: values}) => `Type Env\n# Values${join("")(values_$gts(values))}\n# Types${join("")(tdefs_$gts(tdefs)(constructors))}`;

const is_exhaustive = (tenv) => (matrix) => (($target) => {
if ($target === true) {
return false
}
return true
throw new Error('Failed to match. ' + valueToString($target));
})(is_useful(tenv)(matrix)(cons(ex$slany)(nil)));

const instantiate = ({1: t, 0: vars}) => (l) => $gt$gt$eq($lt_(set$slto_list(vars)))((names) => $gt$gt$eq(map_$gt((name) => new_type_var(name)(l))(names))((with_types) => $gt$gt$eq($lt_(map$slfrom_list(zip(names)(with_types))))((subst) => $lt_($co(type_apply(subst)(t))(subst)))));

const var_bind = ($var) => (type) => (l) => (($target) => {
if ($target.type === "tvar") {
{
let v = $target[0];
return (($target) => {
if ($target === true) {
return $lt_($unit)
}
return $gt$gt$eq(subst_$gt(map$slset(map$slnil)($var)(type)))((_) => $lt_($unit))
throw new Error('Failed to match. ' + valueToString($target));
})($eq($var)(v))
}
}
return (($target) => {
if ($target === true) {
return $lt_err(type_error("Cycle found while unifying type with type variable")(cons($co(type_to_string_raw(type))(type_loc(type)))(cons($co($var)(l))(nil))))
}
return $gt$gt$eq(subst_$gt(map$slset(map$slnil)($var)(type)))((_) => $lt_($unit))
throw new Error('Failed to match. ' + valueToString($target));
})(set$slhas(type_free(type))($var))
throw new Error('Failed to match. ' + valueToString($target));
})(type);

const infer_stypes = (tenv$qu) => (stypes) => (salias) => $gt$gt$eq($lt_(foldl(map(salias)(({1: {1: {1: nl}}, 0: name}) => $co(name)(nl)))(stypes)((names) => ({1: nl, 0: name}) => cons($co(name)(nl))(names))))((names) => $gt$gt$eq($lt_(tenv$qu))(({3: aliases, 2: types}) => $gt$gt$eq($lt_(set$slmerge(set$slfrom_list(map$slkeys(types)))(set$slmerge(set$slfrom_list(map(names)(fst)))(set$slfrom_list(map$slkeys(aliases))))))((bound) => $gt$gt$eq($lt_(map$slfrom_list(names)))((mutual_rec) => $gt$gt$eq(foldl_$gt(tenv$slnil)(salias)((tenv) => ({1: {1: {1: nl, 0: body}, 0: args}, 0: name}) => (($target) => {
if ($target.type === "nil") {
return $gt$gt$eq(record_def_$gt(nl))((_) => $gt$gt$eq(record_local_tcon_usages(map$slfrom_list(args))(tenv)(body))((_) => $gt$gt$eq(record_usages_in_type(tenv$qu)(map$slmerge(map$slfrom_list(args))(mutual_rec))(body))((_) => $lt_(tenv$sladd_alias(tenv)(name)($co(map(args)(fst))($co(body)(nl)))))))
}
{
let unbound = $target;
return $lt_err(type_error("Unbound types")(map(unbound)(({1: {1: l}, 0: name}) => $co(name)(l))))
}
throw new Error('Failed to match. ' + valueToString($target));
})(bag$slto_list(externals_type(set$slmerge(bound)(set$slfrom_list(map(args)(fst))))(body)))))((tenv) => $gt$gt$eq($lt_(tenv$slmerge(tenv)(tenv$qu)))((merged) => $gt$gt$eq(foldl_$gt(tenv)(stypes)((tenv) => ({4: l, 3: constructors, 2: args, 1: tnl, 0: name}) => $gt$gt$eq(infer_deftype(merged)(mutual_rec)(name)(tnl)(args)(constructors)(l))((tenv$qu) => $lt_(tenv$slmerge(tenv$qu)(tenv)))))((tenv) => $gt$gt$eq($lt_(tenv$slmerge(tenv)(tenv$qu)))((tenv$qu) => $lt_(tenv)))))))));

const check_exhaustiveness = (tenv) => (target_type) => (patterns) => (l) => $gt$gt$eq(type$slapply_$gt(target_type))((target_type) => $gt$gt$eq($lt_(map(patterns)((pat) => cons(pattern_to_ex_pattern(tenv)($co(pat)(target_type)))(nil))))((matrix) => (($target) => {
if ($target === true) {
return $lt_($unit)
}
return $lt_err(type_error("Match not exhaustive")(cons($co("match")(l))(nil)))
throw new Error('Failed to match. ' + valueToString($target));
})(is_exhaustive(tenv)(matrix))));

const unify_inner = (t1) => (t2) => (l) => (($target) => {
if ($target.type === "," &&
$target[0].type === "tapp" &&
$target[1].type === "tapp") {
{
let target_1 = $target[0][0];
let arg_1 = $target[0][1];
let target_2 = $target[1][0];
let arg_2 = $target[1][1];
return $gt$gt$eq(unify_inner(target_1)(target_2)(l))((_) => $gt$gt$eq($lt_subst)((subst) => $gt$gt$eq(unify_inner(type_apply(subst)(arg_1))(type_apply(subst)(arg_2))(l))((_) => $lt_($unit))))
}
}
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
return $lt_err(type_error("Incompatible type constructors")(cons($co(a)(la))(cons($co(b)(lb))(nil))))
throw new Error('Failed to match. ' + valueToString($target));
})($eq(a)(b))
}
}
return $lt_err(ttypes(t1)(t2))
throw new Error('Failed to match. ' + valueToString($target));
})($co(t1)(t2));

const unify = (t1) => (t2) => (l) => err$gt$gt$eq(unify_inner(t1)(t2)(l))((e) => err(twrap(ttypes(t1)(t2))(e)));

const t_pat_inner = (tenv) => (pat) => (($target) => {
if ($target.type === "pany") {
{
let nl = $target[0];
return $gt$gt$eq(new_type_var("any")(nl))(($var) => $lt_($co($var)(map$slnil)))
}
}
if ($target.type === "pvar") {
{
let name = $target[0];
let nl = $target[1];
return $gt$gt$eq(new_type_var(name)(nl))(($var) => $gt$gt$eq(record_def_$gt(nl))((_) => $lt_($co($var)(map$slset(map$slnil)(name)($co($var)(nl))))))
}
}
if ($target.type === "pstr") {
{
let nl = $target[1];
return $lt_($co(tcon("string")(nl))(map$slnil))
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
if ($target.type === "pcon") {
{
let name = $target[0];
let il = $target[1];
let args = $target[2];
let l = $target[3];
return $gt$gt$eq((($target) => {
if ($target.type === "none") {
return $lt_err(type_error("Unknown type constructor")(cons($co(name)(l))(nil)))
}
if ($target.type === "some") {
{
let v = $target[0];
return $lt_(v)
}
}
throw new Error('Failed to match. ' + valueToString($target));
})(tenv$slcon(tenv)(name)))(({3: cloc, 2: cres, 1: cargs, 0: free}) => $gt$gt$eq(record_usage_$gt(il)(cloc))((_) => $gt$gt$eq(record_$gt(il)(tfns(cargs)(cres))(true))((_) => $gt$gt$eq(instantiate(scheme(set$slfrom_list(free))(cres))(l))(({1: tsubst, 0: tres}) => $gt$gt$eq($lt_(type$slset_loc(l)(tres)))((tres) => $gt$gt$eq($lt_(map(cargs)(type_apply(tsubst))))((cargs) => $gt$gt$eq($lt_(zip(args)(cargs)))((zipped) => $gt$gt$eq((($target) => {
if ($target === true) {
return $lt_err(type_error(`Wrong number of arguments to type constructor: given ${its(len(args))}, but the type constructor expects ${its(len(cargs))}`)(cons($co(name)(il))(nil)))
}
return $lt_($unit)
throw new Error('Failed to match. ' + valueToString($target));
})($ex$eq(len(args))(len(cargs))))((_) => $gt$gt$eq(foldl_$gt(map$slnil)(zipped)((bindings) => ({1: carg, 0: arg}) => $gt$gt$eq(t_pat(tenv)(arg))(({1: pat_bind, 0: pat_type}) => $gt$gt$eq($lt_subst)((subst) => $gt$gt$eq(unify(type_apply(subst)(pat_type))(type_apply(subst)(type$slset_loc(l)(carg)))(l))((_) => $lt_(map$slmerge(bindings)(pat_bind)))))))((bindings) => $gt$gt$eq($lt_subst)((subst) => $lt_($co(type_apply(subst)(tres))(map$slmap(({1: l, 0: t}) => $co(type_apply(subst)(t))(l))(bindings)))))))))))))
}
}
throw new Error('Failed to match. ' + valueToString($target));
})(pat);


const t_pat = (tenv) => (pat) => $gt$gt$eq(t_pat_inner(tenv)(pat))(({1: bindings, 0: t}) => $gt$gt$eq(record_$gt(pat_loc(pat))(t)(false))((_) => $lt_($co(t)(bindings))));

const t_expr_inner = (tenv) => (expr) => (($target) => {
if ($target.type === "evar" &&
$target[0] === "()") {
{
let l = $target[1];
return $lt_(tcon("()")(l))
}
}
if ($target.type === "evar") {
{
let name = $target[0];
let l = $target[1];
return (($target) => {
if ($target.type === "none") {
return $lt_err(type_error("Unbound variable")(cons($co(name)(l))(nil)))
}
if ($target.type === "some" &&
$target[0].type === ",") {
{
let found = $target[0][0];
let fl = $target[0][1];
return $gt$gt$eq(instantiate(found)(l))(({0: t}) => $gt$gt$eq(record_$gt(l)(scheme$slt(found))(true))((_) => $gt$gt$eq(record_usage_$gt(l)(fl))((_) => $lt_(type$slset_loc(l)(t)))))
}
}
throw new Error('Failed to match. ' + valueToString($target));
})(tenv$sltype(tenv)(name))
}
}
if ($target.type === "equot") {
{
let quot = $target[0];
let l = $target[1];
return $lt_(tcon((($target) => {
if ($target.type === "quot/expr") {
return "expr"
}
if ($target.type === "quot/top") {
return "top"
}
if ($target.type === "quot/quot") {
return "cst"
}
if ($target.type === "quot/type") {
return "type"
}
if ($target.type === "quot/pat") {
return "pat"
}
throw new Error('Failed to match. ' + valueToString($target));
})(quot))(l))
}
}
if ($target.type === "eprim") {
{
let prim = $target[0];
return $lt_(t_prim(prim))
}
}
if ($target.type === "estr") {
{
let first = $target[0];
let templates = $target[1];
let l = $target[2];
return $gt$gt$eq($lt_(tcon("string")(l)))((string_type) => $gt$gt$eq(do_$gt(({1: {1: sl, 0: suffix}, 0: expr}) => $gt$gt$eq(t_expr(tenv)(expr))((t) => unify(t)(string_type)(l)))(templates))((_) => $lt_(string_type)))
}
}
if ($target.type === "elambda") {
{
let pats = $target[0];
let body = $target[1];
let l = $target[2];
return $gt$gt$eq(map_$gt(pat_name)(pats))((arg_types) => $gt$gt$eq(map_$gt(t_pat(tenv))(pats))((pts) => $gt$gt$eq($lt_(foldr($co(nil)(map$slnil))(pts)(({1: bindings, 0: ptypes}) => ({1: bs, 0: pt}) => $co(cons(pt)(ptypes))(map$slmerge(bindings)(bs)))))(({1: bindings, 0: pat_types}) => $gt$gt$eq(do_$gt(({1: patt, 0: argt}) => unify(argt)(patt)(l))(zip(arg_types)(pat_types)))((_) => $gt$gt$eq($lt_subst)((composed) => $gt$gt$eq($lt_(map$slmap(({1: l, 0: t}) => $co(type_apply(composed)(t))(l))(bindings)))((bindings) => $gt$gt$eq($lt_(map$slmap(({1: l, 0: t}) => $co(scheme(set$slnil)(t))(l))(bindings)))((schemes) => $gt$gt$eq($lt_(foldr(tenv_apply(composed)(tenv))(map$slto_list(schemes))((tenv) => ({1: {1: l, 0: scheme}, 0: name}) => tenv$slset_type(tenv)(name)($co(scheme)(l)))))((bound_env) => $gt$gt$eq(t_expr(tenv_apply(composed)(bound_env))(body))((body_type) => $gt$gt$eq(type$slapply_$gt(body_type))((body_type) => $gt$gt$eq(map_$gt(type$slapply_$gt)(arg_types))((arg_types) => $lt_(foldr(body_type)(arg_types)((body) => (arg) => tfn(arg)(body)(l))))))))))))))
}
}
if ($target.type === "eapp") {
{
let target = $target[0];
let args = $target[1];
let l = $target[2];
return foldl(t_expr(tenv)(target))(args)((target_$gt) => (arg) => $gt$gt$eq(new_type_var("res")(l))((result_var) => $gt$gt$eq(target_$gt)((target_type) => $gt$gt$eq(tenv$slapply_$gt(tenv))((arg_tenv) => $gt$gt$eq(t_expr(arg_tenv)(arg))((arg_type) => $gt$gt$eq(type$slapply_$gt(target_type))((target_type) => $gt$gt$eq(unify(target_type)(tfn(arg_type)(result_var)(l))(l))((_) => type$slapply_$gt(result_var))))))))
}
}
if ($target.type === "elet") {
{
let bindings = $target[0];
let body = $target[1];
let l = $target[2];
return (($target) => {
if ($target.type === "cons" &&
$target[0].type === "," &&
$target[1].type === "nil") {
{
let pat = $target[0][0];
let init = $target[0][1];
return $gt$gt$eq(t_expr(tenv)(init))((inited) => pat_and_body(tenv)(pat)(body)(inited)(false))
}
}
return t_expr(tenv)(foldr(body)(bindings)((body) => ({1: init, 0: pat}) => elet(cons($co(pat)(init))(nil))(body)(l)))
throw new Error('Failed to match. ' + valueToString($target));
})(bindings)
}
}
if ($target.type === "ematch") {
{
let target = $target[0];
let cases = $target[1];
let l = $target[2];
return $gt$gt$eq(new_type_var("match-res")(l))((result_var) => $gt$gt$eq(t_expr(tenv)(target))((target_type) => $gt$gt$eq(foldl_$gt($co(target_type)(result_var))(cases)(({1: result, 0: target_type}) => ({1: body, 0: pat}) => $gt$gt$eq(pat_and_body(tenv)(pat)(body)(target_type)(false))((body) => $gt$gt$eq($lt_subst)((subst) => $gt$gt$eq(unify(type_apply(subst)(result))(body)(l))((_) => $gt$gt$eq($lt_subst)((subst) => $lt_($co(type_apply(subst)(target_type))(type_apply(subst)(result)))))))))(({1: result_type}) => $gt$gt$eq(check_exhaustiveness(tenv)(target_type)(map(cases)(fst))(l))((_) => $lt_(result_type)))))
}
}
return $lt_err(type_error("Expression not supported (?)")(cons($co(expr_$gts(expr))(expr_loc(expr)))(nil)))
throw new Error('Failed to match. ' + valueToString($target));
})(expr);


const t_expr = (tenv) => (expr) => $gt$gt$eq(subst_reset_$gt(map$slnil))((old) => $gt$gt$eq(t_expr_inner(tenv)(expr))((type) => $gt$gt$eq(subst_reset_$gt(old))(($new) => $gt$gt$eq(subst_$gt($new))((_) => $gt$gt$eq(record_$gt(expr_loc(expr))(type)(false))((_) => $lt_(type))))));


const pat_and_body = (tenv) => (pat) => (body) => (value_type) => (monomorphic) => $gt$gt$eq(t_pat(tenv)(pat))(({1: bindings, 0: pat_type}) => $gt$gt$eq(unify(value_type)(pat_type)(pat_loc(pat)))((_) => $gt$gt$eq($lt_subst)((composed) => $gt$gt$eq($lt_(map$slmap(({1: l, 0: t}) => $co(type_apply(composed)(t))(l))(bindings)))((bindings) => $gt$gt$eq($lt_(map$slmap(({1: l, 0: t}) => $co((($target) => {
if ($target === true) {
return scheme(set$slnil)(t)
}
return generalize(tenv_apply(composed)(tenv))(t)
throw new Error('Failed to match. ' + valueToString($target));
})(monomorphic))(l))(bindings)))((schemes) => $gt$gt$eq($lt_(foldr(tenv_apply(composed)(tenv))(map$slto_list(schemes))((tenv) => ({1: {1: l, 0: scheme}, 0: name}) => tenv$slset_type(tenv)(name)($co(scheme)(l)))))((bound_env) => $gt$gt$eq(t_expr(tenv_apply(composed)(bound_env))(body))((body_type) => type$slapply_$gt(body_type))))))));

const infer = (tenv) => (expr) => $gt$gt$eq(find_missing(tenv)(externals(set$slnil)(expr)))(({1: missing, 0: tenv}) => $gt$gt$eq(t_expr(tenv)(expr))((type) => $gt$gt$eq($lt_subst)((subst) => $gt$gt$eq(report_missing(subst)(missing))((_) => $lt_(type_apply(subst)(type))))));

const infer_top = (tenv$qu) => (top) => (($target) => {
if ($target.type === "tdef") {
{
let name = $target[0];
let nl = $target[1];
let expr = $target[2];
let l = $target[3];
return $gt$gt$eq(idx_$gt(0))((_) => $gt$gt$eq(new_type_var(name)(l))((self) => $gt$gt$eq(record_def_$gt(nl))((_) => $gt$gt$eq($lt_(tenv$slset_type(tenv$qu)(name)($co(scheme(set$slnil)(self))(nl))))((self_bound) => $gt$gt$eq(find_missing(self_bound)(externals(set$slnil)(expr)))(({1: missing, 0: self_bound}) => $gt$gt$eq(t_expr(self_bound)(expr))((t) => $gt$gt$eq($lt_subst)((subst) => $gt$gt$eq(report_missing(subst)(missing))((_) => $gt$gt$eq($lt_(type_apply(subst)(self)))((selfed) => $gt$gt$eq(unify(selfed)(t)(l))((_) => $gt$gt$eq($lt_subst)((subst) => $gt$gt$eq($lt_(type_apply(subst)(t)))((t) => $gt$gt$eq(record_$gt(nl)(t)(false))((_) => $lt_(tenv$slset_type(tenv$slnil)(name)($co(generalize(tenv$qu)(t))(nl))))))))))))))))
}
}
if ($target.type === "ttypealias") {
{
let name = $target[0];
let nl = $target[1];
let args = $target[2];
let body = $target[3];
let l = $target[4];
return $gt$gt$eq(record_def_$gt(nl))((_) => $gt$gt$eq(record_usages_in_type(tenv$qu)(map$slnil)(body))((_) => $lt_(tenv(map$slnil)(map$slnil)(map$slnil)(map$slset(map$slnil)(name)($co(map(args)(({0: name}) => name))($co(body)(nl)))))))
}
}
if ($target.type === "texpr") {
{
let expr = $target[0];
let l = $target[1];
return $gt$gt$eq(infer(tenv$qu)(expr))((_) => $lt_(tenv$slnil))
}
}
if ($target.type === "tdeftype") {
{
let tname = $target[0];
let tnl = $target[1];
let targs = $target[2];
let constructors = $target[3];
let l = $target[4];
return infer_deftype(tenv$qu)(map$slnil)(tname)(tnl)(targs)(constructors)(l)
}
}
throw new Error('Failed to match. ' + valueToString($target));
})(top);

const infer_show = (tenv) => (x) => (($target) => {
if ($target.type === "ok") {
{
let v = $target[0];
return type_to_string(v)
}
}
if ($target.type === "err") {
{
let e = $target[0];
return `${type_error_$gts(e)}`
}
}
throw new Error('Failed to match. ' + valueToString($target));
})(run$slnil_$gt(infer(tenv)(x)));

const infer_several_inner = (bound) => (types) => ({1: {3: l, 2: body, 1: nl, 0: name}, 0: $var}) => $gt$gt$eq($lt_subst)((subst) => $gt$gt$eq(t_expr(tenv_apply(subst)(bound))(body))((body_type) => $gt$gt$eq($lt_subst)((subst) => $gt$gt$eq($lt_(type_apply(subst)($var)))((selfed) => $gt$gt$eq(unify(selfed)(body_type)(l))((_) => $gt$gt$eq($lt_subst)((subst) => $gt$gt$eq($lt_(type_apply(subst)(body_type)))((body_type) => $gt$gt$eq(record_$gt(nl)(body_type)(false))((_) => $lt_(cons(body_type)(types))))))))));

const show_all_types = (tenv) => (expr) => (({1: result, 0: {1: {1: subst, 0: {1: usages, 0: types}}}}) => ((type_map) => ((final) => ((exprs) => `Result: ${final}\nExprs:\n${join("\n\n")(map(map$slto_list(exprs))(({1: exprs, 0: loc}) => `${join(";	")(map(exprs)(expr_$gts))}\n -> ${(($target) => {
if ($target.type === "none") {
return `No type at ${its(loc)}`
}
if ($target.type === "some") {
{
let t = $target[0];
return `${join(";	")(map(t)(type_to_string))}`
}
}
throw new Error('Failed to match. ' + valueToString($target));
})(map$slget(type_map)(loc))}`))}`)(foldr(map$slnil)(bag$slto_list(things_by_loc(expr)))((map) => ({1: expr, 0: loc}) => map$sladd(map)(loc)(expr))))((($target) => {
if ($target.type === "ok") {
{
let v = $target[0];
return type_to_string(v)
}
}
if ($target.type === "err") {
{
let e = $target[0];
return type_error_$gts(e)
}
}
throw new Error('Failed to match. ' + valueToString($target));
})(result)))(foldr(map$slnil)(types)((map) => ({1: {1: keep, 0: type}, 0: loc}) => map$sladd(map)(loc)((($target) => {
if ($target === true) {
return type
}
return type_apply(subst)(type)
throw new Error('Failed to match. ' + valueToString($target));
})(keep)))))(state_f(infer(tenv)(expr))(state$slnil));

{
    const test = infer_show(basic);
    
    const in_0 = {"0":"+","1":2179,"type":"evar"};
    const mod_0 = test(in_0);
    const out_0 = "(fn [int int] int)";
    if (!equal(mod_0, out_0)) {
        console.log(mod_0);
        console.log(out_0);
        throw new Error(`Fixture test (2159) failing 0. Not equal.`);
    }
    

    const in_1 = {"0":"","1":{"type":"nil"},"2":6881,"type":"estr"};
    const mod_1 = test(in_1);
    const out_1 = "string";
    if (!equal(mod_1, out_1)) {
        console.log(mod_1);
        console.log(out_1);
        throw new Error(`Fixture test (2159) failing 1. Not equal.`);
    }
    

    const in_2 = {"0":"hi ","1":{"0":{"0":{"0":"ho","1":{"type":"nil"},"2":6894,"type":"estr"},"1":{"0":"","1":6892,"type":","},"type":","},"1":{"type":"nil"},"type":"cons"},"2":6889,"type":"estr"};
    const mod_2 = test(in_2);
    const out_2 = "string";
    if (!equal(mod_2, out_2)) {
        console.log(mod_2);
        console.log(out_2);
        throw new Error(`Fixture test (2159) failing 2. Not equal.`);
    }
    

    const in_3 = {"0":{"0":{"0":"x","1":6907,"type":"pvar"},"1":{"type":"nil"},"type":"cons"},"1":{"0":"hi ","1":{"0":{"0":{"0":"x","1":6910,"type":"evar"},"1":{"0":"","1":6911,"type":","},"type":","},"1":{"type":"nil"},"type":"cons"},"2":6908,"type":"estr"},"2":6904,"type":"elambda"};
    const mod_3 = test(in_3);
    const out_3 = "(fn [string] string)";
    if (!equal(mod_3, out_3)) {
        console.log(mod_3);
        console.log(out_3);
        throw new Error(`Fixture test (2159) failing 3. Not equal.`);
    }
    

    const in_4 = {"0":{"0":{"0":{"0":"a","1":2295,"type":"pvar"},"1":{"0":{"0":1,"1":2296,"type":"pint"},"1":2296,"type":"eprim"},"type":","},"1":{"type":"nil"},"type":"cons"},"1":{"0":"a","1":2297,"type":"evar"},"2":2292,"type":"elet"};
    const mod_4 = test(in_4);
    const out_4 = "int";
    if (!equal(mod_4, out_4)) {
        console.log(mod_4);
        console.log(out_4);
        throw new Error(`Fixture test (2159) failing 4. Not equal.`);
    }
    

    const in_5 = {"0":{"0":{"0":{"0":"x","1":19764,"type":"pvar"},"1":{"0":"()","1":19765,"type":"evar"},"type":","},"1":{"type":"nil"},"type":"cons"},"1":{"0":"x","1":19766,"type":"evar"},"2":19759,"type":"elet"};
    const mod_5 = test(in_5);
    const out_5 = "()";
    if (!equal(mod_5, out_5)) {
        console.log(mod_5);
        console.log(out_5);
        throw new Error(`Fixture test (2159) failing 5. Not equal.`);
    }
    

    const in_6 = {"0":{"0":{"0":{"0":",","1":2337,"2":{"0":{"0":"a","1":2339,"type":"pvar"},"1":{"0":{"0":"b","1":2340,"type":"pvar"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"3":2337,"type":"pcon"},"1":{"0":{"0":",","1":2342,"type":"evar"},"1":{"0":{"0":{"0":21,"1":2343,"type":"pint"},"1":2343,"type":"eprim"},"1":{"0":{"0":{"0":true,"1":3854,"type":"pbool"},"1":3854,"type":"eprim"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"2":2341,"type":"eapp"},"type":","},"1":{"type":"nil"},"type":"cons"},"1":{"0":{"0":",","1":2345,"type":"evar"},"1":{"0":{"0":"a","1":3758,"type":"evar"},"1":{"0":{"0":"b","1":3759,"type":"evar"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"2":3756,"type":"eapp"},"2":2334,"type":"elet"};
    const mod_6 = test(in_6);
    const out_6 = "(, int bool)";
    if (!equal(mod_6, out_6)) {
        console.log(mod_6);
        console.log(out_6);
        throw new Error(`Fixture test (2159) failing 6. Not equal.`);
    }
    

    const in_7 = {"0":{"0":{"0":"a","1":10137,"type":"pvar"},"1":{"type":"nil"},"type":"cons"},"1":{"0":{"0":"a","1":10139,"type":"evar"},"1":{"0":{"0":{"0":",","1":10140,"2":{"0":{"0":"a","1":10142,"type":"pvar"},"1":{"0":{"0":"b","1":10143,"type":"pvar"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"3":10140,"type":"pcon"},"1":{"0":"a","1":10144,"type":"evar"},"type":","},"1":{"0":{"0":{"0":10145,"type":"pany"},"1":{"0":{"0":1,"1":10146,"type":"pint"},"1":10146,"type":"eprim"},"type":","},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"2":10136,"type":"ematch"},"2":10126,"type":"elambda"};
    const mod_7 = test(in_7);
    const out_7 = "(fn [(, int a)] int)";
    if (!equal(mod_7, out_7)) {
        console.log(mod_7);
        console.log(out_7);
        throw new Error(`Fixture test (2159) failing 7. Not equal.`);
    }
    

    const in_8 = {"0":{"0":123,"1":2188,"type":"pint"},"1":2188,"type":"eprim"};
    const mod_8 = test(in_8);
    const out_8 = "int";
    if (!equal(mod_8, out_8)) {
        console.log(mod_8);
        console.log(out_8);
        throw new Error(`Fixture test (2159) failing 8. Not equal.`);
    }
    

    const in_9 = {"0":{"0":{"0":"a","1":2220,"type":"pvar"},"1":{"type":"nil"},"type":"cons"},"1":{"0":"a","1":2221,"type":"evar"},"2":2217,"type":"elambda"};
    const mod_9 = test(in_9);
    const out_9 = "(fn [a] a)";
    if (!equal(mod_9, out_9)) {
        console.log(mod_9);
        console.log(out_9);
        throw new Error(`Fixture test (2159) failing 9. Not equal.`);
    }
    

    const in_10 = {"0":{"0":{"0":"a","1":2231,"type":"pvar"},"1":{"type":"nil"},"type":"cons"},"1":{"0":{"0":"+","1":2233,"type":"evar"},"1":{"0":{"0":{"0":2,"1":2234,"type":"pint"},"1":2234,"type":"eprim"},"1":{"0":{"0":"a","1":2235,"type":"evar"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"2":2232,"type":"eapp"},"2":2228,"type":"elambda"};
    const mod_10 = test(in_10);
    const out_10 = "(fn [int] int)";
    if (!equal(mod_10, out_10)) {
        console.log(mod_10);
        console.log(out_10);
        throw new Error(`Fixture test (2159) failing 10. Not equal.`);
    }
    

    const in_11 = {"0":{"0":{"0":{"0":",","1":11076,"2":{"0":{"0":"a","1":11078,"type":"pvar"},"1":{"0":{"0":11079,"type":"pany"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"3":11076,"type":"pcon"},"1":{"type":"nil"},"type":"cons"},"1":{"0":{"0":"a","1":11081,"type":"evar"},"1":{"0":{"0":{"0":2,"1":11082,"type":"pint"},"1":11082,"type":"eprim"},"1":{"type":"nil"},"type":"cons"},"2":11080,"type":"eapp"},"2":11073,"type":"elambda"},"1":{"0":{"0":{"0":",","1":11084,"type":"evar"},"1":{"0":{"0":{"0":1,"1":11085,"type":"pint"},"1":11085,"type":"eprim"},"1":{"0":{"0":{"0":2,"1":11086,"type":"pint"},"1":11086,"type":"eprim"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"2":11083,"type":"eapp"},"1":{"type":"nil"},"type":"cons"},"2":11072,"type":"eapp"};
    const mod_11 = test(in_11);
    const out_11 = "Incompatible types: (fn [int] a) and int";
    if (!equal(mod_11, out_11)) {
        console.log(mod_11);
        console.log(out_11);
        throw new Error(`Fixture test (2159) failing 11. Not equal.`);
    }
    

    const in_12 = {"0":{"0":{"0":",","1":11095,"2":{"0":{"0":"a","1":11097,"type":"pvar"},"1":{"0":{"0":11098,"type":"pany"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"3":11095,"type":"pcon"},"1":{"type":"nil"},"type":"cons"},"1":{"0":{"0":"a","1":11100,"type":"evar"},"1":{"0":{"0":{"0":2,"1":11101,"type":"pint"},"1":11101,"type":"eprim"},"1":{"type":"nil"},"type":"cons"},"2":11099,"type":"eapp"},"2":11092,"type":"elambda"};
    const mod_12 = test(in_12);
    const out_12 = "(fn [(, (fn [int] a) b)] a)";
    if (!equal(mod_12, out_12)) {
        console.log(mod_12);
        console.log(out_12);
        throw new Error(`Fixture test (2159) failing 12. Not equal.`);
    }
    

    const in_13 = {"0":{"0":{"0":1,"1":2244,"type":"pint"},"1":2244,"type":"eprim"},"1":{"0":{"0":{"0":{"0":1,"1":2245,"type":"pint"},"1":2245,"type":"pprim"},"1":{"0":{"0":1,"1":2246,"type":"pint"},"1":2246,"type":"eprim"},"type":","},"1":{"0":{"0":{"0":26111,"type":"pany"},"1":{"0":{"0":0,"1":26112,"type":"pint"},"1":26112,"type":"eprim"},"type":","},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"2":2242,"type":"ematch"};
    const mod_13 = test(in_13);
    const out_13 = "int";
    if (!equal(mod_13, out_13)) {
        console.log(mod_13);
        console.log(out_13);
        throw new Error(`Fixture test (2159) failing 13. Not equal.`);
    }
    


    const in_15 = {"0":{"0":{"0":{"0":"mid","1":3214,"type":"pvar"},"1":{"0":{"0":",","1":3216,"type":"evar"},"1":{"0":{"0":{"0":1,"1":3217,"type":"pint"},"1":3217,"type":"eprim"},"1":{"0":{"0":{"0":{"0":"x","1":3221,"type":"pvar"},"1":{"type":"nil"},"type":"cons"},"1":{"0":"x","1":3222,"type":"evar"},"2":3218,"type":"elambda"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"2":3215,"type":"eapp"},"type":","},"1":{"type":"nil"},"type":"cons"},"1":{"0":"mid","1":3223,"type":"evar"},"2":3209,"type":"elet"};
    const mod_15 = test(in_15);
    const out_15 = "(, int (fn [a] a))";
    if (!equal(mod_15, out_15)) {
        console.log(mod_15);
        console.log(out_15);
        throw new Error(`Fixture test (2159) failing 15. Not equal.`);
    }
    

    const in_16 = {"0":{"0":{"0":{"0":",","1":3874,"2":{"0":{"0":"a","1":3885,"type":"pvar"},"1":{"0":{"0":"b","1":3886,"type":"pvar"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"3":3874,"type":"pcon"},"1":{"0":{"0":",","1":3876,"type":"evar"},"1":{"0":{"0":{"0":1,"1":3877,"type":"pint"},"1":3877,"type":"eprim"},"1":{"0":{"0":{"0":{"0":"x","1":3881,"type":"pvar"},"1":{"type":"nil"},"type":"cons"},"1":{"0":"x","1":3882,"type":"evar"},"2":3878,"type":"elambda"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"2":3875,"type":"eapp"},"type":","},"1":{"0":{"0":{"0":"n","1":3887,"type":"pvar"},"1":{"0":{"0":"b","1":3889,"type":"evar"},"1":{"0":{"0":{"0":2,"1":3890,"type":"pint"},"1":3890,"type":"eprim"},"1":{"type":"nil"},"type":"cons"},"2":3888,"type":"eapp"},"type":","},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"1":{"0":"b","1":3883,"type":"evar"},"2":3871,"type":"elet"};
    const mod_16 = test(in_16);
    const out_16 = "(fn [a] a)";
    if (!equal(mod_16, out_16)) {
        console.log(mod_16);
        console.log(out_16);
        throw new Error(`Fixture test (2159) failing 16. Not equal.`);
    }
    

    const in_17 = {"0":{"0":{"0":{"0":"m","1":4105,"type":"pvar"},"1":{"0":{"0":",","1":4107,"type":"evar"},"1":{"0":{"0":{"0":1,"1":4108,"type":"pint"},"1":4108,"type":"eprim"},"1":{"0":{"0":{"0":{"0":"x","1":4112,"type":"pvar"},"1":{"type":"nil"},"type":"cons"},"1":{"0":"x","1":4113,"type":"evar"},"2":4109,"type":"elambda"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"2":4106,"type":"eapp"},"type":","},"1":{"0":{"0":{"0":",","1":4114,"2":{"0":{"0":"a","1":4116,"type":"pvar"},"1":{"0":{"0":"b","1":4117,"type":"pvar"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"3":4114,"type":"pcon"},"1":{"0":"m","1":4118,"type":"evar"},"type":","},"1":{"0":{"0":{"0":"z","1":4120,"type":"pvar"},"1":{"0":{"0":"b","1":4122,"type":"evar"},"1":{"0":{"0":{"0":2,"1":4123,"type":"pint"},"1":4123,"type":"eprim"},"1":{"type":"nil"},"type":"cons"},"2":4121,"type":"eapp"},"type":","},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"type":"cons"},"1":{"0":{"0":",","1":4125,"type":"evar"},"1":{"0":{"0":"m","1":4126,"type":"evar"},"1":{"0":{"0":"b","1":4127,"type":"evar"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"2":4124,"type":"eapp"},"2":4098,"type":"elet"};
    const mod_17 = test(in_17);
    const out_17 = "(, (, int (fn [a] a)) (fn [b] b))";
    if (!equal(mod_17, out_17)) {
        console.log(mod_17);
        console.log(out_17);
        throw new Error(`Fixture test (2159) failing 17. Not equal.`);
    }
    

    const in_18 = {"0":{"0":{"0":"n","1":3925,"type":"pvar"},"1":{"type":"nil"},"type":"cons"},"1":{"0":{"0":{"0":{"0":",","1":3902,"2":{"0":{"0":"a","1":3904,"type":"pvar"},"1":{"0":{"0":"b","1":3905,"type":"pvar"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"3":3902,"type":"pcon"},"1":{"0":{"0":",","1":3907,"type":"evar"},"1":{"0":{"0":{"0":1,"1":3908,"type":"pint"},"1":3908,"type":"eprim"},"1":{"0":{"0":{"0":{"0":"x","1":3912,"type":"pvar"},"1":{"type":"nil"},"type":"cons"},"1":{"0":"n","1":3913,"type":"evar"},"2":3909,"type":"elambda"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"2":3906,"type":"eapp"},"type":","},"1":{"0":{"0":{"0":"m","1":3914,"type":"pvar"},"1":{"0":{"0":"n","1":3916,"type":"evar"},"1":{"0":{"0":{"0":2,"1":3917,"type":"pint"},"1":3917,"type":"eprim"},"1":{"type":"nil"},"type":"cons"},"2":3915,"type":"eapp"},"type":","},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"1":{"0":"b","1":3918,"type":"evar"},"2":3899,"type":"elet"},"2":3919,"type":"elambda"};
    const mod_18 = test(in_18);
    const out_18 = "(fn [(fn [int] a) b int] a)";
    if (!equal(mod_18, out_18)) {
        console.log(mod_18);
        console.log(out_18);
        throw new Error(`Fixture test (2159) failing 18. Not equal.`);
    }
    


    const in_20 = {"0":{"0":{"0":{"0":"id","1":3047,"type":"pvar"},"1":{"0":{"0":{"0":"x","1":3051,"type":"pvar"},"1":{"type":"nil"},"type":"cons"},"1":{"0":"x","1":3052,"type":"evar"},"2":3048,"type":"elambda"},"type":","},"1":{"type":"nil"},"type":"cons"},"1":{"0":"id","1":3053,"type":"evar"},"2":3042,"type":"elet"};
    const mod_20 = test(in_20);
    const out_20 = "(fn [a] a)";
    if (!equal(mod_20, out_20)) {
        console.log(mod_20);
        console.log(out_20);
        throw new Error(`Fixture test (2159) failing 20. Not equal.`);
    }
    

    const in_21 = {"0":{"0":{"0":{"0":"id","1":3063,"type":"pvar"},"1":{"0":{"0":{"0":"x","1":3067,"type":"pvar"},"1":{"type":"nil"},"type":"cons"},"1":{"0":"x","1":3068,"type":"evar"},"2":3064,"type":"elambda"},"type":","},"1":{"type":"nil"},"type":"cons"},"1":{"0":{"0":"id","1":3071,"type":"evar"},"1":{"0":{"0":"id","1":3072,"type":"evar"},"1":{"type":"nil"},"type":"cons"},"2":3070,"type":"eapp"},"2":3060,"type":"elet"};
    const mod_21 = test(in_21);
    const out_21 = "(fn [a] a)";
    if (!equal(mod_21, out_21)) {
        console.log(mod_21);
        console.log(out_21);
        throw new Error(`Fixture test (2159) failing 21. Not equal.`);
    }
    

    const in_22 = {"0":{"0":{"0":{"0":"id","1":3082,"type":"pvar"},"1":{"0":{"0":{"0":"x","1":3086,"type":"pvar"},"1":{"type":"nil"},"type":"cons"},"1":{"0":{"0":{"0":{"0":"y","1":3090,"type":"pvar"},"1":{"0":"x","1":3091,"type":"evar"},"type":","},"1":{"type":"nil"},"type":"cons"},"1":{"0":"y","1":3092,"type":"evar"},"2":3087,"type":"elet"},"2":3083,"type":"elambda"},"type":","},"1":{"type":"nil"},"type":"cons"},"1":{"0":{"0":"id","1":3094,"type":"evar"},"1":{"0":{"0":"id","1":3095,"type":"evar"},"1":{"type":"nil"},"type":"cons"},"2":3093,"type":"eapp"},"2":3079,"type":"elet"};
    const mod_22 = test(in_22);
    const out_22 = "(fn [a] a)";
    if (!equal(mod_22, out_22)) {
        console.log(mod_22);
        console.log(out_22);
        throw new Error(`Fixture test (2159) failing 22. Not equal.`);
    }
    

    const in_23 = {"0":{"0":{"0":{"0":"id","1":3980,"type":"pvar"},"1":{"0":{"0":{"0":"x","1":3984,"type":"pvar"},"1":{"type":"nil"},"type":"cons"},"1":{"0":{"0":{"0":{"0":"y","1":3988,"type":"pvar"},"1":{"0":"x","1":3989,"type":"evar"},"type":","},"1":{"type":"nil"},"type":"cons"},"1":{"0":"y","1":3990,"type":"evar"},"2":3985,"type":"elet"},"2":3981,"type":"elambda"},"type":","},"1":{"type":"nil"},"type":"cons"},"1":{"0":"id","1":3991,"type":"evar"},"2":3977,"type":"elet"};
    const mod_23 = test(in_23);
    const out_23 = "(fn [a] a)";
    if (!equal(mod_23, out_23)) {
        console.log(mod_23);
        console.log(out_23);
        throw new Error(`Fixture test (2159) failing 23. Not equal.`);
    }
    

    const in_24 = {"0":{"0":{"0":"x","1":4049,"type":"pvar"},"1":{"type":"nil"},"type":"cons"},"1":{"0":{"0":{"0":{"0":"y","1":4058,"type":"pvar"},"1":{"0":"x","1":4059,"type":"evar"},"type":","},"1":{"type":"nil"},"type":"cons"},"1":{"0":"y","1":4060,"type":"evar"},"2":4050,"type":"elet"},"2":4046,"type":"elambda"};
    const mod_24 = test(in_24);
    const out_24 = "(fn [a] a)";
    if (!equal(mod_24, out_24)) {
        console.log(mod_24);
        console.log(out_24);
        throw new Error(`Fixture test (2159) failing 24. Not equal.`);
    }
    

    const in_25 = {"0":{"0":{"0":"x","1":4070,"type":"pvar"},"1":{"type":"nil"},"type":"cons"},"1":{"0":{"0":{"0":{"0":",","1":4074,"2":{"0":{"0":"a","1":4076,"type":"pvar"},"1":{"0":{"0":"b","1":4077,"type":"pvar"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"3":4074,"type":"pcon"},"1":{"0":{"0":",","1":4079,"type":"evar"},"1":{"0":{"0":{"0":1,"1":4080,"type":"pint"},"1":4080,"type":"eprim"},"1":{"0":{"0":"x","1":4081,"type":"evar"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"2":4078,"type":"eapp"},"type":","},"1":{"type":"nil"},"type":"cons"},"1":{"0":"b","1":4082,"type":"evar"},"2":4071,"type":"elet"},"2":4067,"type":"elambda"};
    const mod_25 = test(in_25);
    const out_25 = "(fn [a] a)";
    if (!equal(mod_25, out_25)) {
        console.log(mod_25);
        console.log(out_25);
        throw new Error(`Fixture test (2159) failing 25. Not equal.`);
    }
    

    const in_26 = {"0":{"0":{"0":"x","1":12188,"type":"pvar"},"1":{"type":"nil"},"type":"cons"},"1":{"0":{"0":",","1":12190,"type":"evar"},"1":{"0":{"0":{"0":"x","1":12192,"type":"evar"},"1":{"0":{"0":{"0":1,"1":12193,"type":"pint"},"1":12193,"type":"eprim"},"1":{"type":"nil"},"type":"cons"},"2":12191,"type":"eapp"},"1":{"0":{"0":{"0":"x","1":12195,"type":"evar"},"1":{"0":{"0":"1","1":{"type":"nil"},"2":12197,"type":"estr"},"1":{"type":"nil"},"type":"cons"},"2":12194,"type":"eapp"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"2":12189,"type":"eapp"},"2":12183,"type":"elambda"};
    const mod_26 = test(in_26);
    const out_26 = "Incompatible type constructors\n - int (12195)\n - string (12197)";
    if (!equal(mod_26, out_26)) {
        console.log(mod_26);
        console.log(out_26);
        throw new Error(`Fixture test (2159) failing 26. Not equal.`);
    }
    

    const in_27 = {"0":{"0":{"0":{"0":"id","1":3105,"type":"pvar"},"1":{"0":{"0":{"0":"x","1":3109,"type":"pvar"},"1":{"type":"nil"},"type":"cons"},"1":{"0":{"0":{"0":{"0":"y","1":3113,"type":"pvar"},"1":{"0":"x","1":3114,"type":"evar"},"type":","},"1":{"type":"nil"},"type":"cons"},"1":{"0":"y","1":3115,"type":"evar"},"2":3110,"type":"elet"},"2":3106,"type":"elambda"},"type":","},"1":{"type":"nil"},"type":"cons"},"1":{"0":{"0":{"0":"id","1":3118,"type":"evar"},"1":{"0":{"0":"id","1":3119,"type":"evar"},"1":{"type":"nil"},"type":"cons"},"2":3117,"type":"eapp"},"1":{"0":{"0":{"0":2,"1":3120,"type":"pint"},"1":3120,"type":"eprim"},"1":{"type":"nil"},"type":"cons"},"2":3116,"type":"eapp"},"2":3102,"type":"elet"};
    const mod_27 = test(in_27);
    const out_27 = "int";
    if (!equal(mod_27, out_27)) {
        console.log(mod_27);
        console.log(out_27);
        throw new Error(`Fixture test (2159) failing 27. Not equal.`);
    }
    

    const in_28 = {"0":{"0":{"0":{"0":"id","1":3130,"type":"pvar"},"1":{"0":{"0":{"0":"x","1":3134,"type":"pvar"},"1":{"type":"nil"},"type":"cons"},"1":{"0":{"0":"x","1":3136,"type":"evar"},"1":{"0":{"0":"x","1":3137,"type":"evar"},"1":{"type":"nil"},"type":"cons"},"2":3135,"type":"eapp"},"2":3131,"type":"elambda"},"type":","},"1":{"type":"nil"},"type":"cons"},"1":{"0":"id","1":3138,"type":"evar"},"2":3127,"type":"elet"};
    const mod_28 = test(in_28);
    const out_28 = "Cycle found while unifying type with type variable\n - (fn [x:1] res:2) (3135)\n - x:1 (3136)";
    if (!equal(mod_28, out_28)) {
        console.log(mod_28);
        console.log(out_28);
        throw new Error(`Fixture test (2159) failing 28. Not equal.`);
    }
    

    const in_29 = {"0":{"0":{"0":"m","1":3147,"type":"pvar"},"1":{"type":"nil"},"type":"cons"},"1":{"0":{"0":{"0":{"0":"y","1":3151,"type":"pvar"},"1":{"0":"m","1":3153,"type":"evar"},"type":","},"1":{"type":"nil"},"type":"cons"},"1":{"0":{"0":{"0":{"0":"x","1":3156,"type":"pvar"},"1":{"0":{"0":"y","1":3161,"type":"evar"},"1":{"0":{"0":{"0":true,"1":3162,"type":"pbool"},"1":3162,"type":"eprim"},"1":{"type":"nil"},"type":"cons"},"2":3160,"type":"eapp"},"type":","},"1":{"type":"nil"},"type":"cons"},"1":{"0":"x","1":3157,"type":"evar"},"2":3152,"type":"elet"},"2":3148,"type":"elet"},"2":3144,"type":"elambda"};
    const mod_29 = test(in_29);
    const out_29 = "(fn [(fn [bool] a)] a)";
    if (!equal(mod_29, out_29)) {
        console.log(mod_29);
        console.log(out_29);
        throw new Error(`Fixture test (2159) failing 29. Not equal.`);
    }
    

    const in_30 = {"0":{"0":{"0":2,"1":3170,"type":"pint"},"1":3170,"type":"eprim"},"1":{"0":{"0":{"0":2,"1":3171,"type":"pint"},"1":3171,"type":"eprim"},"1":{"type":"nil"},"type":"cons"},"2":3169,"type":"eapp"};
    const mod_30 = test(in_30);
    const out_30 = "Incompatible types: int and (fn [int] a)";
    if (!equal(mod_30, out_30)) {
        console.log(mod_30);
        console.log(out_30);
        throw new Error(`Fixture test (2159) failing 30. Not equal.`);
    }
    
}
const infer_several = (tenv) => (stmts) => $gt$gt$eq(idx_$gt(0))((_) => $gt$gt$eq($lt_(map(stmts)((stmt) => (($target) => {
if ($target.type === "tdef") {
{
let name = $target[0];
let nl = $target[1];
return $co(name)(nl)
}
}
return fatal("Cant infer-several with sdefs? idk maybe you can ...")
throw new Error('Failed to match. ' + valueToString($target));
})(stmt))))((names) => $gt$gt$eq(vars_for_names(map(stmts)(({1: nl, 0: name}) => $co(name)(nl)))(tenv))(({1: vars, 0: bound}) => $gt$gt$eq(find_missing(bound)(externals_defs(stmts)))(({1: missing, 0: bound2}) => $gt$gt$eq(foldr_$gt(nil)(zip(vars)(stmts))(infer_several_inner(bound2)))((types) => $gt$gt$eq($lt_subst)((subst) => $gt$gt$eq(report_missing(subst)(missing))((_) => $lt_(zip(names)(map(types)(type_apply(subst)))))))))));

{
    const test = (x) => (($target) => {
if ($target.type === "ok") {
{
let v = $target[0];
return map(v)(({1: t}) => type_to_string(t))
}
}
if ($target.type === "err") {
{
let e = $target[0];
return cons(type_error_$gts(e))(nil)
}
}
throw new Error('Failed to match. ' + valueToString($target));
})(run$slnil_$gt(infer_several(basic)(x)));
    
    const in_0 = cons({"0":"even","1":8449,"2":{"0":{"0":{"0":"x","1":8451,"type":"pvar"},"1":{"type":"nil"},"type":"cons"},"1":{"0":{"0":"odd","1":8453,"type":"evar"},"1":{"0":{"0":{"0":"-","1":8455,"type":"evar"},"1":{"0":{"0":"x","1":8456,"type":"evar"},"1":{"0":{"0":{"0":1,"1":8457,"type":"pint"},"1":8457,"type":"eprim"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"2":8454,"type":"eapp"},"1":{"0":{"0":"x","1":8458,"type":"evar"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"2":8452,"type":"eapp"},"2":8447,"type":"elambda"},"3":8447,"type":"tdef"})(cons({"0":"odd","1":8463,"2":{"0":{"0":{"0":"x","1":8465,"type":"pvar"},"1":{"0":{"0":"y","1":8466,"type":"pvar"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"1":{"0":"","1":{"0":{"0":{"0":{"0":"even","1":8468,"type":"evar"},"1":{"0":{"0":"x","1":8469,"type":"evar"},"1":{"type":"nil"},"type":"cons"},"2":8467,"type":"eapp"},"1":{"0":"","1":8645,"type":","},"type":","},"1":{"type":"nil"},"type":"cons"},"2":8643,"type":"estr"},"2":8461,"type":"elambda"},"3":8461,"type":"tdef"})(cons({"0":"what","1":8474,"2":{"0":{"0":{"0":"a","1":8476,"type":"pvar"},"1":{"0":{"0":"b","1":8477,"type":"pvar"},"1":{"0":{"0":"c","1":8478,"type":"pvar"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"type":"cons"},"1":{"0":{"0":",","1":8480,"type":"evar"},"1":{"0":{"0":{"0":"even","1":8482,"type":"evar"},"1":{"0":{"0":"a","1":8483,"type":"evar"},"1":{"type":"nil"},"type":"cons"},"2":8481,"type":"eapp"},"1":{"0":{"0":{"0":"odd","1":8485,"type":"evar"},"1":{"0":{"0":"b","1":8486,"type":"evar"},"1":{"0":{"0":"c","1":8487,"type":"evar"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"2":8484,"type":"eapp"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"2":8479,"type":"eapp"},"2":8472,"type":"elambda"},"3":8472,"type":"tdef"})(nil)));
    const mod_0 = test(in_0);
    const out_0 = cons("(fn [int] string)")(cons("(fn [int int] string)")(cons("(fn [int int int] (, string string))")(nil)));
    if (!equal(mod_0, out_0)) {
        console.log(mod_0);
        console.log(out_0);
        throw new Error(`Fixture test (8511) failing 0. Not equal.`);
    }
    

    const in_1 = cons({"0":"even","1":8670,"2":{"0":{"0":{"0":"x","1":8672,"type":"pvar"},"1":{"type":"nil"},"type":"cons"},"1":{"0":{"0":"odd","1":8674,"type":"evar"},"1":{"0":{"0":{"0":"-","1":8676,"type":"evar"},"1":{"0":{"0":"x","1":8677,"type":"evar"},"1":{"0":{"0":{"0":1,"1":8678,"type":"pint"},"1":8678,"type":"eprim"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"2":8675,"type":"eapp"},"1":{"0":{"0":"x","1":8679,"type":"evar"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"2":8673,"type":"eapp"},"2":8668,"type":"elambda"},"3":8668,"type":"tdef"})(cons({"0":"odd","1":8684,"2":{"0":{"0":{"0":"x","1":8686,"type":"pvar"},"1":{"0":{"0":"y","1":8687,"type":"pvar"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"1":{"0":{"0":"even","1":8689,"type":"evar"},"1":{"0":{"0":"x","1":8690,"type":"evar"},"1":{"type":"nil"},"type":"cons"},"2":8688,"type":"eapp"},"2":8682,"type":"elambda"},"3":8682,"type":"tdef"})(cons({"0":"what","1":8695,"2":{"0":{"0":{"0":"a","1":8697,"type":"pvar"},"1":{"0":{"0":"b","1":8698,"type":"pvar"},"1":{"0":{"0":"c","1":8699,"type":"pvar"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"type":"cons"},"1":{"0":{"0":"+","1":8701,"type":"evar"},"1":{"0":{"0":{"0":"even","1":8703,"type":"evar"},"1":{"0":{"0":"a","1":8704,"type":"evar"},"1":{"type":"nil"},"type":"cons"},"2":8702,"type":"eapp"},"1":{"0":{"0":{"0":"odd","1":8706,"type":"evar"},"1":{"0":{"0":"b","1":8707,"type":"evar"},"1":{"0":{"0":"c","1":8708,"type":"evar"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"2":8705,"type":"eapp"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"2":8700,"type":"eapp"},"2":8693,"type":"elambda"},"3":8693,"type":"tdef"})(nil)));
    const mod_1 = test(in_1);
    const out_1 = cons("(fn [int] int)")(cons("(fn [int int] int)")(cons("(fn [int int int] int)")(nil)));
    if (!equal(mod_1, out_1)) {
        console.log(mod_1);
        console.log(out_1);
        throw new Error(`Fixture test (8511) failing 1. Not equal.`);
    }
    

    const in_2 = cons({"0":"what","1":15442,"2":{"0":{"0":{"0":"a","1":15447,"type":"pvar"},"1":{"type":"nil"},"type":"cons"},"1":{"0":{"0":"+","1":15443,"type":"evar"},"1":{"0":{"0":{"0":2,"1":15536,"type":"pint"},"1":15536,"type":"eprim"},"1":{"0":{"0":"ho","1":15537,"type":"evar"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"2":15535,"type":"eapp"},"2":15440,"type":"elambda"},"3":15440,"type":"tdef"})(nil);
    const mod_2 = test(in_2);
    const out_2 = cons("Missing values: \n - ho (15537): int")(nil);
    if (!equal(mod_2, out_2)) {
        console.log(mod_2);
        console.log(out_2);
        throw new Error(`Fixture test (8511) failing 2. Not equal.`);
    }
    
}
const infer_defns = (tenv) => (stmts) => (($target) => {
if ($target.type === "cons" &&
$target[1].type === "nil") {
{
let one = $target[0];
return infer_top(tenv)(one)
}
}
return $gt$gt$eq(infer_several(tenv)(stmts))((zipped) => $gt$gt$eq(map_$gt(({1: type, 0: {1: nl, 0: name}}) => record_$gt(nl)(type)(false))(zipped))((_) => $lt_(foldl(tenv$slnil)(zipped)((tenv) => ({1: type, 0: {1: nl, 0: name}}) => tenv$slset_type(tenv)(name)($co(generalize(tenv)(type))(nl))))))
throw new Error('Failed to match. ' + valueToString($target));
})(stmts);

const infer_stmtss = (tenv$qu) => (stmts) => $gt$gt$eq($lt_(split_stmts(stmts)(nil)(nil)(nil)(nil)))(({1: {1: {1: sexps, 0: salias}, 0: stypes}, 0: sdefs}) => $gt$gt$eq(infer_stypes(tenv$qu)(stypes)(salias))((type_tenv) => $gt$gt$eq($lt_(tenv$slmerge(type_tenv)(tenv$qu)))((tenv$qu) => $gt$gt$eq(infer_defns(tenv$qu)(sdefs))((val_tenv) => $gt$gt$eq(map_$gt(infer(tenv$slmerge(val_tenv)(tenv$qu)))(sexps))((expr_types) => $lt_($co(tenv$slmerge(type_tenv)(val_tenv))(expr_types)))))));

const infer_stmts2 = (tenv) => (stmts) => (({1: result, 0: {1: {1: subst, 0: {1: usage_record, 0: types}}}}) => $co(result)($co(applied_types(types)(subst))(usage_record)))(state_f(infer_stmtss(tenv)(stmts))(state$slnil));

const run$slusages = (tenv) => (tops) => (({0: {1: {0: {1: {1: uses, 0: defns}}}}}) => ((idents) => $co(map(defns)(with_name(idents)))(map(uses)(({1: prov, 0: user}) => $co(with_name(idents)(user))(prov))))(map$slfrom_list(map(bag$slto_list(many(map(tops)(top$slidents))))(rev_pair))))(state_f(foldl_$gt(tenv)(tops)((tenv) => (stmt) => $gt$gt$eq(infer_stmtss(tenv)(cons(stmt)(nil)))(({0: nenv}) => $lt_(tenv$slmerge(tenv)(nenv)))))(state$slnil));

const test_multi = (tenv) => (stmts) => (($target) => {
if ($target.type === "err") {
{
let e = $target[0];
return type_error_$gts(e)
}
}
if ($target.type === "ok" &&
$target[0].type === ",") {
{
let tenv = $target[0][0];
let types = $target[0][1];
return join("\n")(map(types)(type_to_string))
}
}
throw new Error('Failed to match. ' + valueToString($target));
})(run$slnil_$gt(infer_stmtss(tenv)(stmts)));

const builtin_env = ((k) => ((v) => ((v2) => ((kv) => ((kk) => foldl(tenv(map$slmap((b) => $co(b)(-1))(map$slfrom_list(cons($co("+")(concrete(tfns(cons(tint)(cons(tint)(nil)))(tint))))(cons($co("-")(concrete(tfns(cons(tint)(cons(tint)(nil)))(tint))))(cons($co(">")(concrete(tfns(cons(tint)(cons(tint)(nil)))(tbool))))(cons($co("<")(concrete(tfns(cons(tint)(cons(tint)(nil)))(tbool))))(cons($co("=")(generic(cons("k")(nil))(tfns(cons(k)(cons(k)(nil)))(tbool))))(cons($co("!=")(generic(cons("k")(nil))(tfns(cons(k)(cons(k)(nil)))(tbool))))(cons($co(">=")(concrete(tfns(cons(tint)(cons(tint)(nil)))(tbool))))(cons($co("<=")(concrete(tfns(cons(tint)(cons(tint)(nil)))(tbool))))(cons($co("()")(concrete(tcon("()")(-1))))(cons($co("trace")(kk(tfns(cons(tapp(tcon("list")(-1))(tapp(tcon("trace-fmt")(-1))(k)(-1))(-1))(nil))(tcon("()")(-1)))))(cons($co("unescapeString")(concrete(tfns(cons(tstring)(nil))(tstring))))(cons($co("int-to-string")(concrete(tfns(cons(tint)(nil))(tstring))))(cons($co("string-to-int")(concrete(tfns(cons(tstring)(nil))(toption(tint)))))(cons($co("string-to-float")(concrete(tfns(cons(tstring)(nil))(toption(tcon("float")(-1))))))(cons($co("++")(concrete(tfns(cons(tlist(tstring))(nil))(tstring))))(cons($co("map/nil")(kv(tmap(k)(v))))(cons($co("map/set")(kv(tfns(cons(tmap(k)(v))(cons(k)(cons(v)(nil))))(tmap(k)(v)))))(cons($co("map/rm")(kv(tfns(cons(tmap(k)(v))(cons(k)(nil)))(tmap(k)(v)))))(cons($co("map/get")(kv(tfns(cons(tmap(k)(v))(cons(k)(nil)))(toption(v)))))(cons($co("map/map")(generic(cons("k")(cons("v")(cons("v2")(nil))))(tfns(cons(tfns(cons(v)(nil))(v2))(cons(tmap(k)(v))(nil)))(tmap(k)(v2)))))(cons($co("map/merge")(kv(tfns(cons(tmap(k)(v))(cons(tmap(k)(v))(nil)))(tmap(k)(v)))))(cons($co("map/values")(kv(tfns(cons(tmap(k)(v))(nil))(tlist(v)))))(cons($co("map/keys")(kv(tfns(cons(tmap(k)(v))(nil))(tlist(k)))))(cons($co("set/nil")(kk(tset(k))))(cons($co("set/add")(kk(tfns(cons(tset(k))(cons(k)(nil)))(tset(k)))))(cons($co("set/has")(kk(tfns(cons(tset(k))(cons(k)(nil)))(tbool))))(cons($co("set/rm")(kk(tfns(cons(tset(k))(cons(k)(nil)))(tset(k)))))(cons($co("set/diff")(kk(tfns(cons(tset(k))(cons(tset(k))(nil)))(tset(k)))))(cons($co("set/merge")(kk(tfns(cons(tset(k))(cons(tset(k))(nil)))(tset(k)))))(cons($co("set/overlap")(kk(tfns(cons(tset(k))(cons(tset(k))(nil)))(tset(k)))))(cons($co("set/to-list")(kk(tfns(cons(tset(k))(nil))(tlist(k)))))(cons($co("set/from-list")(kk(tfns(cons(tlist(k))(nil))(tset(k)))))(cons($co("map/from-list")(kv(tfns(cons(tlist(t$co(k)(v)))(nil))(tmap(k)(v)))))(cons($co("map/to-list")(kv(tfns(cons(tmap(k)(v))(nil))(tlist(t$co(k)(v))))))(cons($co("jsonify")(generic(cons("v")(nil))(tfns(cons(tvar("v")(-1))(nil))(tstring))))(cons($co("valueToString")(generic(cons("v")(nil))(tfns(cons(vbl("v"))(nil))(tstring))))(cons($co("eval")(generic(cons("v")(nil))(tfns(cons(tcon("string")(-1))(nil))(vbl("v")))))(cons($co("errorToString")(generic(cons("v")(nil))(tfns(cons(tfns(cons(vbl("v"))(nil))(tstring))(cons(vbl("v"))(nil)))(tstring))))(cons($co("sanitize")(concrete(tfns(cons(tstring)(nil))(tstring))))(cons($co("replace-all")(concrete(tfns(cons(tstring)(cons(tstring)(cons(tstring)(nil))))(tstring))))(cons($co("fatal")(generic(cons("v")(nil))(tfns(cons(tstring)(nil))(vbl("v")))))(nil))))))))))))))))))))))))))))))))))))))))))))(map$slfrom_list(cons($co("()")(tconstructor(nil)(nil)(tcon("()")(-1))(-1)))(nil)))(map$slfrom_list(cons($co("int")($co(0)($co(set$slnil)(-1))))(cons($co("float")($co(0)($co(set$slnil)(-1))))(cons($co("string")($co(0)($co(set$slnil)(-1))))(cons($co("()")($co(0)($co(set$slnil)(-1))))(cons($co("bool")($co(0)($co(set$slnil)(-1))))(cons($co("map")($co(2)($co(set$slnil)(-1))))(cons($co("set")($co(1)($co(set$slnil)(-1))))(cons($co("->")($co(2)($co(set$slnil)(-1))))(nil))))))))))(map$slnil))(cons({"0":",","1":5319,"2":{"0":{"0":"a","1":5320,"type":","},"1":{"0":{"0":"b","1":5321,"type":","},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"3":{"0":{"0":",","1":{"0":5323,"1":{"0":{"0":{"0":"a","1":5324,"type":"tcon"},"1":{"0":{"0":"b","1":5325,"type":"tcon"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"1":5322,"type":","},"type":","},"type":","},"1":{"type":"nil"},"type":"cons"},"4":5316,"type":"tdeftype"})(cons({"0":"trace-fmt","1":11392,"2":{"0":{"0":"a","1":11393,"type":","},"1":{"type":"nil"},"type":"cons"},"3":{"0":{"0":"tcolor","1":{"0":11395,"1":{"0":{"0":{"0":"string","1":11396,"type":"tcon"},"1":{"type":"nil"},"type":"cons"},"1":11394,"type":","},"type":","},"type":","},"1":{"0":{"0":"tbold","1":{"0":11398,"1":{"0":{"0":{"0":"bool","1":11399,"type":"tcon"},"1":{"type":"nil"},"type":"cons"},"1":11397,"type":","},"type":","},"type":","},"1":{"0":{"0":"titalic","1":{"0":11401,"1":{"0":{"0":{"0":"bool","1":11402,"type":"tcon"},"1":{"type":"nil"},"type":"cons"},"1":11400,"type":","},"type":","},"type":","},"1":{"0":{"0":"tflash","1":{"0":11404,"1":{"0":{"0":{"0":"bool","1":11405,"type":"tcon"},"1":{"type":"nil"},"type":"cons"},"1":11403,"type":","},"type":","},"type":","},"1":{"0":{"0":"ttext","1":{"0":11407,"1":{"0":{"0":{"0":"string","1":11408,"type":"tcon"},"1":{"type":"nil"},"type":"cons"},"1":11406,"type":","},"type":","},"type":","},"1":{"0":{"0":"tval","1":{"0":11410,"1":{"0":{"0":{"0":"a","1":11411,"type":"tcon"},"1":{"type":"nil"},"type":"cons"},"1":11409,"type":","},"type":","},"type":","},"1":{"0":{"0":"tloc","1":{"0":11566,"1":{"0":{"0":{"0":"int","1":11567,"type":"tcon"},"1":{"type":"nil"},"type":"cons"},"1":11565,"type":","},"type":","},"type":","},"1":{"0":{"0":"tnamed","1":{"0":11569,"1":{"0":{"0":{"0":{"0":"trace-fmt","1":11571,"type":"tcon"},"1":{"0":"a","1":11572,"type":"tcon"},"2":11570,"type":"tapp"},"1":{"type":"nil"},"type":"cons"},"1":11568,"type":","},"type":","},"type":","},"1":{"0":{"0":"tfmted","1":{"0":11413,"1":{"0":{"0":{"0":"a","1":11414,"type":"tcon"},"1":{"0":{"0":"string","1":11415,"type":"tcon"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"1":11412,"type":","},"type":","},"type":","},"1":{"0":{"0":"tfmt","1":{"0":11417,"1":{"0":{"0":{"0":"a","1":11418,"type":"tcon"},"1":{"0":{"0":{"0":{"0":"->","1":11419,"type":"tcon"},"1":{"0":"a","1":11422,"type":"tcon"},"2":11419,"type":"tapp"},"1":{"0":"string","1":11423,"type":"tcon"},"2":11419,"type":"tapp"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"1":11416,"type":","},"type":","},"type":","},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"type":"cons"},"type":"cons"},"type":"cons"},"type":"cons"},"type":"cons"},"type":"cons"},"type":"cons"},"type":"cons"},"4":11389,"type":"tdeftype"})(nil)))((tenv) => (stmt) => tenv$slmerge(tenv)(fst(force(type_error_$gts)(run$slnil_$gt(infer_stmtss(tenv)(cons(stmt)(nil))))))))(generic(cons("k")(nil))))(generic(cons("k")(cons("v")(nil)))))(vbl("v2")))(vbl("v")))(vbl("k"));

const several = (tenv) => (tops) => (($target) => {
if ($target.type === "nil") {
return $lt_err(type_error("Final top should be an expr")(nil))
}
if ($target.type === "cons" &&
$target[0].type === "texpr" &&
$target[1].type === "nil") {
{
let expr = $target[0][0];
return $gt$gt$eq(idx_$gt(0))((_) => infer(tenv)(expr))
}
}
if ($target.type === "cons") {
{
let one = $target[0];
let rest = $target[1];
return $gt$gt$eq(infer_stmtss(tenv)(cons(one)(nil)))(({0: tenv$qu}) => several(tenv$slmerge(tenv)(tenv$qu))(rest))
}
}
throw new Error('Failed to match. ' + valueToString($target));
})(tops);

const infer_stmts = (tenv) => (stmts) => foldl_$gt(tenv)(stmts)((tenv) => (stmt) => $gt$gt$eq(infer_stmtss(tenv)(cons(stmt)(nil)))(({1: types, 0: tenv$qu}) => $lt_(tenv$slmerge(tenv)(tenv$qu))));

{
    const test = run$slusages(builtin_env);
    
    const in_0 = cons({"0":{"0":{"0":{"0":{"0":"x","1":22222,"type":"pvar"},"1":{"0":{"0":1,"1":22223,"type":"pint"},"1":22223,"type":"eprim"},"type":","},"1":{"0":{"0":{"0":"y","1":22225,"type":"pvar"},"1":{"0":{"0":2,"1":22226,"type":"pint"},"1":22226,"type":"eprim"},"type":","},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"1":{"0":"x","1":22224,"type":"evar"},"2":22219,"type":"elet"},"1":22219,"type":"texpr"})(nil);
    const mod_0 = test(in_0);
    const out_0 = $co(cons("y:22225")(cons("x:22222")(nil)))(cons($co("x:22224")(22222))(nil));
    if (!equal(mod_0, out_0)) {
        console.log(mod_0);
        console.log(out_0);
        throw new Error(`Fixture test (22232) failing 0. Not equal.`);
    }
    

    const in_1 = cons({"0":"a","1":22256,"2":{"type":"nil"},"3":{"0":{"0":"b","1":{"0":22258,"1":{"0":{"type":"nil"},"1":22257,"type":","},"type":","},"type":","},"1":{"type":"nil"},"type":"cons"},"4":22254,"type":"tdeftype"})(cons({"0":"c","1":22264,"2":{"type":"nil"},"3":{"0":{"0":"d","1":{"0":22267,"1":{"0":{"0":{"0":"a","1":22268,"type":"tcon"},"1":{"type":"nil"},"type":"cons"},"1":22265,"type":","},"type":","},"type":","},"1":{"type":"nil"},"type":"cons"},"4":22262,"type":"tdeftype"})(nil));
    const mod_1 = test(in_1);
    const out_1 = $co(cons("d:22267")(cons("c:22264")(cons("b:22258")(cons("a:22256")(nil)))))(cons($co("a:22268")(22256))(nil));
    if (!equal(mod_1, out_1)) {
        console.log(mod_1);
        console.log(out_1);
        throw new Error(`Fixture test (22232) failing 1. Not equal.`);
    }
    

    const in_2 = cons({"0":"a","1":22369,"2":{"type":"nil"},"3":{"0":{"0":"b","1":{"0":22371,"1":{"0":{"type":"nil"},"1":22370,"type":","},"type":","},"type":","},"1":{"type":"nil"},"type":"cons"},"4":22367,"type":"tdeftype"})(cons({"0":{"0":{"0":{"0":{"0":"b","1":22378,"2":{"type":"nil"},"3":22377,"type":"pcon"},"1":{"0":{"0":"b","1":22380,"type":"evar"},"1":{"type":"nil"},"2":22379,"type":"eapp"},"type":","},"1":{"type":"nil"},"type":"cons"},"1":{"0":{"0":1,"1":22381,"type":"pint"},"1":22381,"type":"eprim"},"2":22374,"type":"elet"},"1":22374,"type":"texpr"})(nil));
    const mod_2 = test(in_2);
    const out_2 = $co(cons("b:22371")(cons("a:22369")(nil)))(cons($co("b:22378")(22371))(cons($co("b:22380")(22371))(nil)));
    if (!equal(mod_2, out_2)) {
        console.log(mod_2);
        console.log(out_2);
        throw new Error(`Fixture test (22232) failing 2. Not equal.`);
    }
    

    const in_3 = cons({"0":"a","1":22279,"2":{"type":"nil"},"3":{"0":"int","1":22280,"type":"tcon"},"4":22275,"type":"ttypealias"})(cons({"0":"b","1":22289,"2":{"type":"nil"},"3":{"0":"a","1":22290,"type":"tcon"},"4":22285,"type":"ttypealias"})(nil));
    const mod_3 = test(in_3);
    const out_3 = $co(cons("b:22289")(cons("a:22279")(nil)))(cons($co("a:22290")(22279))(cons($co("int:22280")(-1))(nil)));
    if (!equal(mod_3, out_3)) {
        console.log(mod_3);
        console.log(out_3);
        throw new Error(`Fixture test (22232) failing 3. Not equal.`);
    }
    

    const in_4 = cons({"0":"a","1":22299,"2":{"type":"nil"},"3":{"0":"int","1":22300,"type":"tcon"},"4":22297,"type":"ttypealias"})(cons({"0":"c","1":22305,"2":{"type":"nil"},"3":{"0":{"0":"b","1":{"0":22307,"1":{"0":{"0":{"0":"a","1":22308,"type":"tcon"},"1":{"type":"nil"},"type":"cons"},"1":22306,"type":","},"type":","},"type":","},"1":{"type":"nil"},"type":"cons"},"4":22303,"type":"tdeftype"})(nil));
    const mod_4 = test(in_4);
    const out_4 = $co(cons("b:22307")(cons("c:22305")(cons("a:22299")(nil))))(cons($co("a:22308")(22299))(cons($co("int:22300")(-1))(nil)));
    if (!equal(mod_4, out_4)) {
        console.log(mod_4);
        console.log(out_4);
        throw new Error(`Fixture test (22232) failing 4. Not equal.`);
    }
    

    const in_5 = cons({"0":"a","1":23281,"2":{"type":"nil"},"3":{"0":{"0":"b","1":{"0":23283,"1":{"0":{"type":"nil"},"1":23282,"type":","},"type":","},"type":","},"1":{"type":"nil"},"type":"cons"},"4":23279,"type":"tdeftype"})(cons({"0":"c","1":23288,"2":{"type":"nil"},"3":{"0":"a","1":23289,"type":"tcon"},"4":23286,"type":"ttypealias"})(nil));
    const mod_5 = test(in_5);
    const out_5 = $co(cons("c:23288")(cons("b:23283")(cons("a:23281")(nil))))(cons($co("a:23289")(23281))(nil));
    if (!equal(mod_5, out_5)) {
        console.log(mod_5);
        console.log(out_5);
        throw new Error(`Fixture test (22232) failing 5. Not equal.`);
    }
    

    const in_6 = cons({"0":"list","1":23437,"2":{"0":{"0":"a","1":23438,"type":","},"1":{"type":"nil"},"type":"cons"},"3":{"0":{"0":"cons","1":{"0":23441,"1":{"0":{"0":{"0":"a","1":23442,"type":"tcon"},"1":{"0":{"0":{"0":"list","1":23444,"type":"tcon"},"1":{"0":"a","1":23445,"type":"tcon"},"2":23443,"type":"tapp"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"1":23440,"type":","},"type":","},"type":","},"1":{"0":{"0":"nil","1":{"0":23447,"1":{"0":{"type":"nil"},"1":23446,"type":","},"type":","},"type":","},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"4":23433,"type":"tdeftype"})(nil);
    const mod_6 = test(in_6);
    const out_6 = $co(cons("nil:23447")(cons("cons:23441")(cons("a:23438")(cons("list:23437")(nil)))))(cons($co("list:23444")(23437))(cons($co("a:23445")(23438))(cons($co("a:23442")(23438))(nil))));
    if (!equal(mod_6, out_6)) {
        console.log(mod_6);
        console.log(out_6);
        throw new Error(`Fixture test (22232) failing 6. Not equal.`);
    }
    

    const in_7 = cons({"0":"t","1":23670,"2":{"type":"nil"},"3":{"0":{"0":"c","1":{"0":23673,"1":{"0":{"0":{"0":"int","1":23674,"type":"tcon"},"1":{"type":"nil"},"type":"cons"},"1":23671,"type":","},"type":","},"type":","},"1":{"type":"nil"},"type":"cons"},"4":23668,"type":"tdeftype"})(cons({"0":{"0":{"0":{"0":1,"1":23679,"type":"pint"},"1":23679,"type":"eprim"},"1":{"0":{"0":{"0":"c","1":23681,"2":{"0":{"0":23682,"type":"pany"},"1":{"type":"nil"},"type":"cons"},"3":23680,"type":"pcon"},"1":{"0":{"0":1,"1":23683,"type":"pint"},"1":23683,"type":"eprim"},"type":","},"1":{"type":"nil"},"type":"cons"},"2":23677,"type":"ematch"},"1":23677,"type":"texpr"})(nil));
    const mod_7 = test(in_7);
    const out_7 = $co(cons("c:23673")(cons("t:23670")(nil)))(cons($co("c:23681")(23673))(cons($co("int:23674")(-1))(nil)));
    if (!equal(mod_7, out_7)) {
        console.log(mod_7);
        console.log(out_7);
        throw new Error(`Fixture test (22232) failing 7. Not equal.`);
    }
    
}
{
    const test = test_multi(builtin_env);
    
    const in_0 = cons({"0":{"0":{"0":1,"1":24401,"type":"pint"},"1":24401,"type":"eprim"},"1":24401,"type":"texpr"})(nil);
    const mod_0 = test(in_0);
    const out_0 = "int";
    if (!equal(mod_0, out_0)) {
        console.log(mod_0);
        console.log(out_0);
        throw new Error(`Fixture test (24388) failing 0. Not equal.`);
    }
    

    const in_1 = cons({"0":"a","1":24414,"2":{"type":"nil"},"3":{"0":{"0":{"0":",","1":24416,"type":"tcon"},"1":{"0":"int","1":24417,"type":"tcon"},"2":24415,"type":"tapp"},"1":{"0":"expr","1":24418,"type":"tcon"},"2":24415,"type":"tapp"},"4":24410,"type":"ttypealias"})(cons({"0":"b","1":24447,"2":{"type":"nil"},"3":{"0":{"0":{"0":",","1":24449,"type":"tcon"},"1":{"0":"int","1":24450,"type":"tcon"},"2":24448,"type":"tapp"},"1":{"0":"a","1":24451,"type":"tcon"},"2":24448,"type":"tapp"},"4":24445,"type":"ttypealias"})(cons({"0":"expr","1":24424,"2":{"type":"nil"},"3":{"0":{"0":"ea","1":{"0":24426,"1":{"0":{"type":"nil"},"1":24425,"type":","},"type":","},"type":","},"1":{"0":{"0":"eb","1":{"0":24428,"1":{"0":{"0":{"0":"a","1":24429,"type":"tcon"},"1":{"type":"nil"},"type":"cons"},"1":24427,"type":","},"type":","},"type":","},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"4":24422,"type":"tdeftype"})(cons({"0":{"0":{"0":"eb","1":24435,"type":"evar"},"1":{"0":{"0":{"0":",","1":24437,"type":"evar"},"1":{"0":{"0":{"0":1,"1":24438,"type":"pint"},"1":24438,"type":"eprim"},"1":{"0":{"0":{"0":"ea","1":24442,"type":"evar"},"1":{"type":"nil"},"2":24439,"type":"eapp"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"2":24436,"type":"eapp"},"1":{"type":"nil"},"type":"cons"},"2":24434,"type":"eapp"},"1":24434,"type":"texpr"})(nil))));
    const mod_1 = test(in_1);
    const out_1 = "expr";
    if (!equal(mod_1, out_1)) {
        console.log(mod_1);
        console.log(out_1);
        throw new Error(`Fixture test (24388) failing 1. Not equal.`);
    }
    
}
{
    const test = (x) => (($target) => {
if ($target.type === "ok") {
{
let t = $target[0];
return type_to_string(t)
}
}
if ($target.type === "err") {
{
let e = $target[0];
return type_error_$gts(e)
}
}
throw new Error('Failed to match. ' + valueToString($target));
})(run$slnil_$gt(several(basic)(x)));
    
    const in_0 = cons({"0":"list","1":8879,"2":{"0":{"0":"a","1":8880,"type":","},"1":{"type":"nil"},"type":"cons"},"3":{"0":{"0":"cons","1":{"0":8882,"1":{"0":{"0":{"0":"a","1":8883,"type":"tcon"},"1":{"0":{"0":{"0":"list","1":8888,"type":"tcon"},"1":{"0":"a","1":8889,"type":"tcon"},"2":8886,"type":"tapp"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"1":8881,"type":","},"type":","},"type":","},"1":{"0":{"0":"nil","1":{"0":8885,"1":{"0":{"type":"nil"},"1":8884,"type":","},"type":","},"type":","},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"4":8874,"type":"tdeftype"})(cons({"0":"foldr","1":6474,"2":{"0":{"0":{"0":"init","1":6476,"type":"pvar"},"1":{"0":{"0":"items","1":6477,"type":"pvar"},"1":{"0":{"0":"f","1":6478,"type":"pvar"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"type":"cons"},"1":{"0":{"0":"items","1":6481,"type":"evar"},"1":{"0":{"0":{"0":"nil","1":6482,"2":{"type":"nil"},"3":6482,"type":"pcon"},"1":{"0":"init","1":6483,"type":"evar"},"type":","},"1":{"0":{"0":{"0":"cons","1":6484,"2":{"0":{"0":"one","1":6485,"type":"pvar"},"1":{"0":{"0":"rest","1":6486,"type":"pvar"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"3":6484,"type":"pcon"},"1":{"0":{"0":"f","1":6491,"type":"evar"},"1":{"0":{"0":{"0":"foldr","1":6493,"type":"evar"},"1":{"0":{"0":"init","1":6494,"type":"evar"},"1":{"0":{"0":"rest","1":6495,"type":"evar"},"1":{"0":{"0":"f","1":6496,"type":"evar"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"type":"cons"},"2":6492,"type":"eapp"},"1":{"0":{"0":"one","1":6497,"type":"evar"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"2":6490,"type":"eapp"},"type":","},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"2":6479,"type":"ematch"},"2":6472,"type":"elambda"},"3":6472,"type":"tdef"})(cons({"0":{"0":"foldr","1":6695,"type":"evar"},"1":6695,"type":"texpr"})(nil)));
    const mod_0 = test(in_0);
    const out_0 = "(fn [a (list b) (fn [a b] a)] a)";
    if (!equal(mod_0, out_0)) {
        console.log(mod_0);
        console.log(out_0);
        throw new Error(`Fixture test (6646) failing 0. Not equal.`);
    }
    

    const in_1 = cons({"0":"what","1":6536,"2":{"0":{"0":{"0":"f","1":6538,"type":"pvar"},"1":{"0":{"0":"a","1":6539,"type":"pvar"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"1":{"0":{"0":{"0":true,"1":6542,"type":"pbool"},"1":6542,"type":"eprim"},"1":{"0":{"0":{"0":{"0":true,"1":6540,"type":"pbool"},"1":6540,"type":"pprim"},"1":{"0":{"0":"f","1":6544,"type":"evar"},"1":{"0":{"0":{"0":"what","1":6546,"type":"evar"},"1":{"0":{"0":"f","1":6547,"type":"evar"},"1":{"0":{"0":"a","1":6548,"type":"evar"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"2":6545,"type":"eapp"},"1":{"type":"nil"},"type":"cons"},"2":6543,"type":"eapp"},"type":","},"1":{"0":{"0":{"0":6540,"type":"pany"},"1":{"0":{"0":"f","1":6550,"type":"evar"},"1":{"0":{"0":"a","1":6551,"type":"evar"},"1":{"type":"nil"},"type":"cons"},"2":6549,"type":"eapp"},"type":","},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"2":6540,"type":"ematch"},"2":6534,"type":"elambda"},"3":6534,"type":"tdef"})(cons({"0":{"0":"what","1":6704,"type":"evar"},"1":6704,"type":"texpr"})(nil));
    const mod_1 = test(in_1);
    const out_1 = "(fn [(fn [a] a) a] a)";
    if (!equal(mod_1, out_1)) {
        console.log(mod_1);
        console.log(out_1);
        throw new Error(`Fixture test (6646) failing 1. Not equal.`);
    }
    

    const in_2 = cons({"0":"list2","1":6568,"2":{"0":{"0":"a","1":6569,"type":","},"1":{"type":"nil"},"type":"cons"},"3":{"0":{"0":"cons2","1":{"0":6571,"1":{"0":{"0":{"0":"a","1":6572,"type":"tcon"},"1":{"0":{"0":{"0":"list2","1":6574,"type":"tcon"},"1":{"0":"a","1":6575,"type":"tcon"},"2":6573,"type":"tapp"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"1":6570,"type":","},"type":","},"type":","},"1":{"0":{"0":"nil2","1":{"0":6577,"1":{"0":{"type":"nil"},"1":6576,"type":","},"type":","},"type":","},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"4":6565,"type":"tdeftype"})(cons({"0":{"0":{"0":"cons2","1":6712,"type":"evar"},"1":{"0":{"0":{"0":1,"1":6713,"type":"pint"},"1":6713,"type":"eprim"},"1":{"0":{"0":"nil2","1":6714,"type":"evar"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"2":6711,"type":"eapp"},"1":6711,"type":"texpr"})(nil));
    const mod_2 = test(in_2);
    const out_2 = "(list2 int)";
    if (!equal(mod_2, out_2)) {
        console.log(mod_2);
        console.log(out_2);
        throw new Error(`Fixture test (6646) failing 2. Not equal.`);
    }
    

    const in_3 = cons({"0":"fib","1":6614,"2":{"0":{"0":{"0":"x","1":6616,"type":"pvar"},"1":{"type":"nil"},"type":"cons"},"1":{"0":{"0":"+","1":6618,"type":"evar"},"1":{"0":{"0":{"0":1,"1":6619,"type":"pint"},"1":6619,"type":"eprim"},"1":{"0":{"0":{"0":"fib","1":6621,"type":"evar"},"1":{"0":{"0":{"0":"+","1":6623,"type":"evar"},"1":{"0":{"0":{"0":2,"1":6624,"type":"pint"},"1":6624,"type":"eprim"},"1":{"0":{"0":"x","1":6625,"type":"evar"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"2":6622,"type":"eapp"},"1":{"type":"nil"},"type":"cons"},"2":6620,"type":"eapp"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"2":6617,"type":"eapp"},"2":6612,"type":"elambda"},"3":6612,"type":"tdef"})(cons({"0":{"0":"fib","1":6720,"type":"evar"},"1":6720,"type":"texpr"})(nil));
    const mod_3 = test(in_3);
    const out_3 = "(fn [int] int)";
    if (!equal(mod_3, out_3)) {
        console.log(mod_3);
        console.log(out_3);
        throw new Error(`Fixture test (6646) failing 3. Not equal.`);
    }
    

    const in_4 = cons({"0":{"0":{"0":",","1":6642,"type":"evar"},"1":{"0":{"0":{"0":1,"1":6643,"type":"pint"},"1":6643,"type":"eprim"},"1":{"0":{"0":{"0":2,"1":6644,"type":"pint"},"1":6644,"type":"eprim"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"2":6641,"type":"eapp"},"1":6641,"type":"texpr"})(nil);
    const mod_4 = test(in_4);
    const out_4 = "(, int int)";
    if (!equal(mod_4, out_4)) {
        console.log(mod_4);
        console.log(out_4);
        throw new Error(`Fixture test (6646) failing 4. Not equal.`);
    }
    

    const in_5 = cons({"0":"rev","1":9806,"2":{"0":{"0":{"0":"a","1":9808,"type":"pvar"},"1":{"0":{"0":"b","1":9809,"type":"pvar"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"1":{"0":"a","1":9810,"type":"evar"},"2":9804,"type":"elambda"},"3":9804,"type":"tdef"})(cons({"0":{"0":{"0":{"0":{"0":"a","1":9819,"type":"pvar"},"1":{"0":{"0":"rev","1":9821,"type":"evar"},"1":{"0":{"0":{"0":1,"1":9822,"type":"pint"},"1":9822,"type":"eprim"},"1":{"0":{"0":{"0":1,"1":9825,"type":"pint"},"1":9825,"type":"eprim"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"2":9820,"type":"eapp"},"type":","},"1":{"0":{"0":{"0":"b","1":9826,"type":"pvar"},"1":{"0":{"0":"rev","1":9828,"type":"evar"},"1":{"0":{"0":"a","1":{"type":"nil"},"2":9829,"type":"estr"},"1":{"0":{"0":{"0":1,"1":9834,"type":"pint"},"1":9834,"type":"eprim"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"2":9827,"type":"eapp"},"type":","},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"1":{"0":{"0":",","1":9836,"type":"evar"},"1":{"0":{"0":"a","1":9837,"type":"evar"},"1":{"0":{"0":"b","1":9838,"type":"evar"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"2":9835,"type":"eapp"},"2":9816,"type":"elet"},"1":9816,"type":"texpr"})(nil));
    const mod_5 = test(in_5);
    const out_5 = "(, int string)";
    if (!equal(mod_5, out_5)) {
        console.log(mod_5);
        console.log(out_5);
        throw new Error(`Fixture test (6646) failing 5. Not equal.`);
    }
    

    const in_6 = cons({"0":"what-t","1":10022,"2":{"0":{"0":"a","1":10023,"type":","},"1":{"type":"nil"},"type":"cons"},"3":{"0":{"0":"what","1":{"0":10025,"1":{"0":{"0":{"0":"a","1":10026,"type":"tcon"},"1":{"0":{"0":{"0":"what-t","1":10051,"type":"tcon"},"1":{"0":"a","1":10052,"type":"tcon"},"2":10050,"type":"tapp"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"1":10024,"type":","},"type":","},"type":","},"1":{"0":{"0":"one","1":{"0":10065,"1":{"0":{"0":{"0":"a","1":10066,"type":"tcon"},"1":{"type":"nil"},"type":"cons"},"1":10053,"type":","},"type":","},"type":","},"1":{"0":{"0":"no","1":{"0":10068,"1":{"0":{"type":"nil"},"1":10067,"type":","},"type":","},"type":","},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"type":"cons"},"4":10019,"type":"tdeftype"})(cons({"0":{"0":{"0":{"0":{"0":"a","1":10041,"type":"pvar"},"1":{"0":{"0":"what","1":10043,"type":"evar"},"1":{"0":{"0":{"0":1,"1":10044,"type":"pint"},"1":10044,"type":"eprim"},"1":{"0":{"0":{"0":"no","1":10084,"type":"evar"},"1":{"type":"nil"},"2":10055,"type":"eapp"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"2":10042,"type":"eapp"},"type":","},"1":{"0":{"0":{"0":"b","1":10045,"type":"pvar"},"1":{"0":{"0":"what","1":10074,"type":"evar"},"1":{"0":{"0":"a","1":{"type":"nil"},"2":10075,"type":"estr"},"1":{"0":{"0":{"0":"no","1":10083,"type":"evar"},"1":{"type":"nil"},"2":10077,"type":"eapp"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"2":10046,"type":"eapp"},"type":","},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"1":{"0":{"0":",","1":10030,"type":"evar"},"1":{"0":{"0":"a","1":10031,"type":"evar"},"1":{"0":{"0":"b","1":10034,"type":"evar"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"2":10029,"type":"eapp"},"2":10038,"type":"elet"},"1":10038,"type":"texpr"})(nil));
    const mod_6 = test(in_6);
    const out_6 = "(, (what-t int) (what-t string))";
    if (!equal(mod_6, out_6)) {
        console.log(mod_6);
        console.log(out_6);
        throw new Error(`Fixture test (6646) failing 6. Not equal.`);
    }
    

    const in_7 = cons({"0":"list","1":12400,"2":{"0":{"0":"a","1":12401,"type":","},"1":{"type":"nil"},"type":"cons"},"3":{"0":{"0":"cons","1":{"0":12403,"1":{"0":{"0":{"0":"a","1":12404,"type":"tcon"},"1":{"0":{"0":{"0":"list","1":12406,"type":"tcon"},"1":{"0":"a","1":12407,"type":"tcon"},"2":12405,"type":"tapp"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"1":12402,"type":","},"type":","},"type":","},"1":{"0":{"0":"nil","1":{"0":12409,"1":{"0":{"type":"nil"},"1":12408,"type":","},"type":","},"type":","},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"4":12397,"type":"tdeftype"})(cons({"0":{"0":{"0":{"0":"zip","1":12359,"type":"pvar"},"1":{"0":{"0":"one","1":12410,"type":"pvar"},"1":{"0":{"0":"two","1":12360,"type":"pvar"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"type":"cons"},"1":{"0":{"0":{"0":",","1":12364,"type":"evar"},"1":{"0":{"0":"one","1":12365,"type":"evar"},"1":{"0":{"0":"two","1":12366,"type":"evar"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"2":12363,"type":"eapp"},"1":{"0":{"0":{"0":",","1":12367,"2":{"0":{"0":"nil","1":12369,"2":{"type":"nil"},"3":12369,"type":"pcon"},"1":{"0":{"0":"nil","1":12370,"2":{"type":"nil"},"3":12370,"type":"pcon"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"3":12367,"type":"pcon"},"1":{"0":"nil","1":12371,"type":"evar"},"type":","},"1":{"0":{"0":{"0":",","1":12372,"2":{"0":{"0":"cons","1":12374,"2":{"0":{"0":"a","1":12375,"type":"pvar"},"1":{"0":{"0":"one","1":12377,"type":"pvar"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"3":12374,"type":"pcon"},"1":{"0":{"0":"cons","1":12378,"2":{"0":{"0":"b","1":12379,"type":"pvar"},"1":{"0":{"0":"two","1":12381,"type":"pvar"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"3":12378,"type":"pcon"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"3":12372,"type":"pcon"},"1":{"0":{"0":"cons","1":12382,"type":"evar"},"1":{"0":{"0":{"0":",","1":12384,"type":"evar"},"1":{"0":{"0":"a","1":12385,"type":"evar"},"1":{"0":{"0":"b","1":12386,"type":"evar"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"2":12383,"type":"eapp"},"1":{"0":{"0":{"0":"zip","1":12389,"type":"evar"},"1":{"0":{"0":"one","1":12390,"type":"evar"},"1":{"0":{"0":"two","1":12391,"type":"evar"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"2":12388,"type":"eapp"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"2":12382,"type":"eapp"},"type":","},"1":{"0":{"0":{"0":12392,"type":"pany"},"1":{"0":"nil","1":12393,"type":"evar"},"type":","},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"type":"cons"},"2":12361,"type":"ematch"},"2":12356,"type":"elambda"},"1":12356,"type":"texpr"})(nil));
    const mod_7 = test(in_7);
    const out_7 = "(fn [(fn [(list a) (list b)] (list (, a b))) (list a) (list b)] (list (, a b)))";
    if (!equal(mod_7, out_7)) {
        console.log(mod_7);
        console.log(out_7);
        throw new Error(`Fixture test (6646) failing 7. Not equal.`);
    }
    

    const in_8 = cons({"0":"hello","1":13251,"2":{"type":"nil"},"3":{"0":"int","1":13252,"type":"tcon"},"4":13249,"type":"ttypealias"})(cons({"0":"what","1":13259,"2":{"type":"nil"},"3":{"0":{"0":"whatok","1":{"0":13263,"1":{"0":{"0":{"0":"hello","1":13264,"type":"tcon"},"1":{"type":"nil"},"type":"cons"},"1":13262,"type":","},"type":","},"type":","},"1":{"type":"nil"},"type":"cons"},"4":13257,"type":"tdeftype"})(cons({"0":{"0":"whatok","1":13267,"type":"evar"},"1":13267,"type":"texpr"})(nil)));
    const mod_8 = test(in_8);
    const out_8 = "(fn [int] what)";
    if (!equal(mod_8, out_8)) {
        console.log(mod_8);
        console.log(out_8);
        throw new Error(`Fixture test (6646) failing 8. Not equal.`);
    }
    

    const in_9 = cons({"0":",","1":15023,"2":{"0":{"0":"a","1":15024,"type":","},"1":{"0":{"0":"b","1":15025,"type":","},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"3":{"0":{"0":",","1":{"0":15027,"1":{"0":{"0":{"0":"a","1":15028,"type":"tcon"},"1":{"0":{"0":"b","1":15029,"type":"tcon"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"1":15026,"type":","},"type":","},"type":","},"1":{"type":"nil"},"type":"cons"},"4":15020,"type":"tdeftype"})(cons({"0":"hello","1":13589,"2":{"0":{"0":"a","1":13590,"type":","},"1":{"type":"nil"},"type":"cons"},"3":{"0":{"0":{"0":",","1":13592,"type":"tcon"},"1":{"0":"int","1":13593,"type":"tcon"},"2":13591,"type":"tapp"},"1":{"0":"a","1":13922,"type":"tcon"},"2":13591,"type":"tapp"},"4":13586,"type":"ttypealias"})(cons({"0":"what","1":13601,"2":{"type":"nil"},"3":{"0":{"0":"name","1":{"0":13603,"1":{"0":{"0":{"0":{"0":"hello","1":13604,"type":"tcon"},"1":{"0":"string","1":13610,"type":"tcon"},"2":13609,"type":"tapp"},"1":{"type":"nil"},"type":"cons"},"1":13602,"type":","},"type":","},"type":","},"1":{"type":"nil"},"type":"cons"},"4":13598,"type":"tdeftype"})(cons({"0":{"0":{"0":"name","1":13608,"type":"evar"},"1":{"type":"nil"},"2":13841,"type":"eapp"},"1":13841,"type":"texpr"})(nil))));
    const mod_9 = test(in_9);
    const out_9 = "(fn [(, int string)] what)";
    if (!equal(mod_9, out_9)) {
        console.log(mod_9);
        console.log(out_9);
        throw new Error(`Fixture test (6646) failing 9. Not equal.`);
    }
    

    const in_10 = cons({"0":",","1":15036,"2":{"0":{"0":"a","1":15037,"type":","},"1":{"0":{"0":"b","1":15038,"type":","},"1":{"0":{"0":"c","1":15039,"type":","},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"type":"cons"},"3":{"0":{"0":",","1":{"0":15040,"1":{"0":{"0":{"0":"a","1":15041,"type":"tcon"},"1":{"0":{"0":"b","1":15042,"type":"tcon"},"1":{"0":{"0":"c","1":15043,"type":"tcon"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"type":"cons"},"1":15034,"type":","},"type":","},"type":","},"1":{"type":"nil"},"type":"cons"},"4":15032,"type":"tdeftype"})(cons({"0":"id","1":15050,"2":{"type":"nil"},"3":{"0":"string","1":15051,"type":"tcon"},"4":15048,"type":"ttypealias"})(cons({"0":"hello","1":13995,"2":{"0":{"0":"a","1":13996,"type":","},"1":{"type":"nil"},"type":"cons"},"3":{"0":{"0":{"0":",","1":13998,"type":"tcon"},"1":{"0":"int","1":13999,"type":"tcon"},"2":13997,"type":"tapp"},"1":{"0":{"0":{"0":",","1":13998,"type":"tcon"},"1":{"0":"id","1":14000,"type":"tcon"},"2":13997,"type":"tapp"},"1":{"0":"a","1":14015,"type":"tcon"},"2":13997,"type":"tapp"},"2":13997,"type":"tapp"},"4":13992,"type":"ttypealias"})(cons({"0":"what","1":14009,"2":{"type":"nil"},"3":{"0":{"0":"name","1":{"0":14011,"1":{"0":{"0":{"0":{"0":"hello","1":14013,"type":"tcon"},"1":{"0":"bool","1":14014,"type":"tcon"},"2":14012,"type":"tapp"},"1":{"type":"nil"},"type":"cons"},"1":14010,"type":","},"type":","},"type":","},"1":{"type":"nil"},"type":"cons"},"4":14006,"type":"tdeftype"})(cons({"0":{"0":"name","1":14020,"type":"evar"},"1":14020,"type":"texpr"})(nil)))));
    const mod_10 = test(in_10);
    const out_10 = "(fn [(, int string bool)] what)";
    if (!equal(mod_10, out_10)) {
        console.log(mod_10);
        console.log(out_10);
        throw new Error(`Fixture test (6646) failing 10. Not equal.`);
    }
    

    const in_11 = cons({"0":"kind","1":15097,"2":{"type":"nil"},"3":{"0":{"0":"star","1":{"0":15099,"1":{"0":{"type":"nil"},"1":15098,"type":","},"type":","},"type":","},"1":{"0":{"0":"kfun","1":{"0":15101,"1":{"0":{"0":{"0":"kind","1":15102,"type":"tcon"},"1":{"0":{"0":"kind","1":15103,"type":"tcon"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"1":15100,"type":","},"type":","},"type":","},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"4":15095,"type":"tdeftype"})(cons({"0":{"0":{"0":{"0":{"0":"kfun","1":15110,"2":{"0":{"0":"m","1":15111,"type":"pvar"},"1":{"0":{"0":"n","1":15112,"type":"pvar"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"3":15109,"type":"pcon"},"1":{"0":{"0":"star","1":15114,"type":"evar"},"1":{"type":"nil"},"2":15113,"type":"eapp"},"type":","},"1":{"type":"nil"},"type":"cons"},"1":{"0":{"0":1,"1":15115,"type":"pint"},"1":15115,"type":"eprim"},"2":15106,"type":"elet"},"1":15106,"type":"texpr"})(nil));
    const mod_11 = test(in_11);
    const out_11 = "int";
    if (!equal(mod_11, out_11)) {
        console.log(mod_11);
        console.log(out_11);
        throw new Error(`Fixture test (6646) failing 11. Not equal.`);
    }
    
}
{
    const test = (stmts) => (($target) => {
if ($target.type === "err") {
{
let e = $target[0];
return type_error_$gts(e)
}
}
if ($target.type === "ok") {
return "No error?"
}
throw new Error('Failed to match. ' + valueToString($target));
})(run$slnil_$gt(infer_stmts(builtin_env)(stmts)));
    
    const in_0 = cons({"0":"hello","1":10713,"2":{"0":{"0":{"0":"a","1":10715,"type":"pvar"},"1":{"type":"nil"},"type":"cons"},"1":{"0":{"0":"+","1":10760,"type":"evar"},"1":{"0":{"0":{"0":1,"1":10761,"type":"pint"},"1":10761,"type":"eprim"},"1":{"0":{"0":"a","1":10762,"type":"evar"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"2":10716,"type":"eapp"},"2":10711,"type":"elambda"},"3":10711,"type":"tdef"})(cons({"0":{"0":{"0":"hello","1":10720,"type":"evar"},"1":{"0":{"0":"a","1":{"type":"nil"},"2":10738,"type":"estr"},"1":{"type":"nil"},"type":"cons"},"2":10737,"type":"eapp"},"1":10737,"type":"texpr"})(nil));
    const mod_0 = test(in_0);
    const out_0 = "Incompatible type constructors\n - int (10720)\n - string (10738)";
    if (!equal(mod_0, out_0)) {
        console.log(mod_0);
        console.log(out_0);
        throw new Error(`Fixture test (10699) failing 0. Not equal.`);
    }
    

    const in_1 = cons({"0":"one","1":10748,"2":{"type":"nil"},"3":{"0":{"0":"two","1":{"0":10751,"1":{"0":{"type":"nil"},"1":10749,"type":","},"type":","},"type":","},"1":{"0":{"0":"three","1":{"0":10754,"1":{"0":{"0":{"0":"int","1":10755,"type":"tcon"},"1":{"type":"nil"},"type":"cons"},"1":10752,"type":","},"type":","},"type":","},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"4":10746,"type":"tdeftype"})(cons({"0":{"0":{"0":"two","1":10756,"type":"evar"},"1":{"0":{"0":{"0":1,"1":10757,"type":"pint"},"1":10757,"type":"eprim"},"1":{"type":"nil"},"type":"cons"},"2":10753,"type":"eapp"},"1":10753,"type":"texpr"})(nil));
    const mod_1 = test(in_1);
    const out_1 = "Incompatible types: one and (fn [int] a)";
    if (!equal(mod_1, out_1)) {
        console.log(mod_1);
        console.log(out_1);
        throw new Error(`Fixture test (10699) failing 1. Not equal.`);
    }
    
}
return $eval("({0: {0:  env_nil, 1: infer_stmts, 2: infer_stmts2,  3: add_stmt,  4: infer, 5: infer2},\n  1: type_to_string, 2: get_type, 3: type_to_cst\n }) => ({type: 'fns',\n   env_nil, infer_stmts, infer_stmts2, add_stmt, infer, infer2, type_to_string, get_type, type_to_cst \n }) ")(typecheck(inference(builtin_env)((tenv) => (stmts) => fst(force(type_error_$gts)(run$slnil_$gt(infer_stmtss(tenv)(stmts)))))(infer_stmts2)(tenv$slmerge)((tenv) => (expr) => force(type_error_$gts)(run$slnil_$gt(infer(tenv)(expr))))((tenv) => (expr) => (({1: result, 0: {1: {1: subst, 0: {1: usage_record, 0: types}}}}) => $co(result)($co(applied_types(types)(subst))(usage_record)))(state_f(infer(tenv)(expr))(state$slnil))))(type_to_string)((tenv) => (name) => (($target) => {
if ($target.type === "some" &&
$target[0].type === ",") {
{
let v = $target[0][0];
return some(scheme$sltype(v))
}
}
return none
throw new Error('Failed to match. ' + valueToString($target));
})(tenv$sltype(tenv)(name)))(type_to_cst))