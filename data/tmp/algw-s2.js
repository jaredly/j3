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
const cons = (v0) => (v1) => ({type: "cons", 0: v0, 1: v1})
const nil = ({type: "nil"})
const forall = (v0) => (v1) => ({type: "forall", 0: v0, 1: v1})
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

const scheme$slfree = ({1: type, 0: vbls}) => set$sldiff(type$slfree(type))(vbls);

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

const infer$slprim = (prim) => (($target) => {
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

const concrete = (t) => forall(set$slnil)(t);

const generic = (vbls) => (t) => forall(set$slfrom_list(vbls))(t);

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

const $co = (v0) => (v1) => ({type: ",", 0: v0, 1: v1})
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

const unwrap_app = (t) => (args) => (($target) => {
if ($target.type === "tapp") {
{
let a = $target[0];
let b = $target[1];
return unwrap_app(a)(cons(b)(args))
}
}
return $co(t)(args)
throw new Error('Failed to match. ' + valueToString($target));
})(t);

const type_$gts_simple = (type) => (($target) => {
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
return `(fn [${type_$gts_simple(arg)}] ${type_$gts_simple(res)})`
}
}
if ($target.type === "tapp") {
{
let target = $target[0];
let arg = $target[1];
return `(${type_$gts_simple(target)} ${type_$gts_simple(arg)})`
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

const tenv = (v0) => (v1) => (v2) => (v3) => ({type: "tenv", 0: v0, 1: v1, 2: v2, 3: v3})
const tenv$slwith_type = ({3: aliases, 2: types, 1: tcons, 0: values}) => (name) => (scheme) => tenv(map$slset(values)(name)(scheme))(tcons)(types)(aliases);

const tenv$slfree = ({0: values}) => foldr(set$slnil)(map(scheme$slfree)(map$slvalues(values)))(set$slmerge);

{
    const test = (a) => set$slto_list(scheme$slfree(a));
    
    const in_0 = forall(set$slfrom_list(cons("a")(nil)))(tvar("a")(-1));
    const mod_0 = test(in_0);
    const out_0 = nil;
    if (!equal(mod_0, out_0)) {
        console.log(mod_0);
        console.log(out_0);
        throw new Error(`Fixture test (501) failing 0. Not equal.`);
    }
    

    const in_1 = forall(set$slfrom_list(nil))(tvar("a")(-1));
    const mod_1 = test(in_1);
    const out_1 = cons("a")(nil);
    if (!equal(mod_1, out_1)) {
        console.log(mod_1);
        console.log(out_1);
        throw new Error(`Fixture test (501) failing 1. Not equal.`);
    }
    
}
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

const generalize = (tenv) => (t) => forall(set$sldiff(type$slfree(t))(tenv$slfree(tenv)))(t);

const StateT = (v0) => ({type: "StateT", 0: v0})
const run_$gt = ({0: f}) => (state) => (({1: result}) => result)(f(state));

const $gt$gt$eq = ({0: f}) => (next) => StateT((state) => (({1: value, 0: state}) => (({0: fnext}) => fnext(state))(next(value)))(f(state)));

const $lt_ = (x) => StateT((state) => $co(state)(x));

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

/* type alias */
const $lt_subst = $gt$gt$eq($lt_state)(({1: subst}) => $lt_(subst));

const reset_state_$gt = $gt$gt$eq($lt_state)((_) => $gt$gt$eq(state_$gt($co(0)(map$slnil)))((_) => $lt_($unit)));

const $lt_next_idx = $gt$gt$eq($lt_state)(({1: subst, 0: idx}) => $gt$gt$eq(state_$gt($co($pl(idx)(1))(subst)))((_) => $lt_(idx)));

const subst_$gt = (new_subst) => $gt$gt$eq($lt_state)(({1: subst, 0: idx}) => $gt$gt$eq(state_$gt($co(idx)(compose_subst(new_subst)(subst))))((_) => $lt_($unit)));

const subst_reset_$gt = (new_subst) => $gt$gt$eq($lt_state)(({1: old_subst, 0: idx}) => $gt$gt$eq(state_$gt($co(idx)(new_subst)))((_) => $lt_(old_subst)));

const state$slnil = $co(0)(map$slnil);

const run$slnil_$gt = (st) => run_$gt(st)(state$slnil);

const new_type_var = (name) => (l) => $gt$gt$eq($lt_next_idx)((nidx) => $lt_(tvar(`${name}:${int_to_string(nidx)}`)(l)));

const make_subst_for_free = (vars) => (l) => $gt$gt$eq(map_$gt((id) => $gt$gt$eq(new_type_var(id)(l))((new_var) => $lt_($co(id)(new_var))))(set$slto_list(vars)))((mapping) => $lt_(map$slfrom_list(mapping)));

const one_subst = ($var) => (type) => map$slfrom_list(cons($co($var)(type))(nil));

const apply_$gt = (f) => (arg) => $gt$gt$eq($lt_subst)((subst) => $lt_(f(subst)(arg)));

const type$slapply_$gt = apply_$gt(type$slapply);

const tenv$slresolve = ({0: values}) => (name) => map$slget(values)(name);

const cst$sllist = (v0) => (v1) => ({type: "cst/list", 0: v0, 1: v1})
const cst$slarray = (v0) => (v1) => ({type: "cst/array", 0: v0, 1: v1})
const cst$slspread = (v0) => (v1) => ({type: "cst/spread", 0: v0, 1: v1})
const cst$slid = (v0) => (v1) => ({type: "cst/id", 0: v0, 1: v1})
const cst$slstring = (v0) => (v1) => (v2) => ({type: "cst/string", 0: v0, 1: v1, 2: v2})
const tenv$slnil = tenv(map$slnil)(map$slnil)(map$slnil)(map$slnil);

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
return (({1: result, 0: args}) => `(fn [${join(" ")(map(type_$gts)(args))}] ${type_$gts(result)})`)(unwrap_fn(type))
}
if ($target.type === "tapp") {
return (({1: args, 0: target}) => `(${type_$gts(target)} ${join(" ")(map(type_$gts)(args))})`)(unwrap_app(type)(nil))
}
if ($target.type === "tcon") {
{
let name = $target[0];
return name
}
}
throw new Error('Failed to match. ' + valueToString($target));
})(type);

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

const instantiate_tcon = ({1: tcons}) => (name) => (l) => (($target) => {
if ($target.type === "none") {
return fatal(`Unknown type constructor: ${name}`)
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

const tenv$slmerge = ({3: a1, 2: t1, 1: c1, 0: v1}) => ({3: a2, 2: t2, 1: c2, 0: v2}) => tenv(map$slmerge(v1)(v2))(map$slmerge(c1)(c2))(map$slmerge(t1)(t2))(map$slmerge(a1)(a2));

const builtin_env = ((k) => ((v) => ((v2) => ((kv) => ((kk) => ((a) => ((b) => tenv(map$slfrom_list(cons($co("+")(concrete(tfns(cons(tint)(cons(tint)(nil)))(tint)(-1))))(cons($co("-")(concrete(tfns(cons(tint)(cons(tint)(nil)))(tint)(-1))))(cons($co(">")(concrete(tfns(cons(tint)(cons(tint)(nil)))(tbool)(-1))))(cons($co("<")(concrete(tfns(cons(tint)(cons(tint)(nil)))(tbool)(-1))))(cons($co("=")(generic(cons("k")(nil))(tfns(cons(k)(cons(k)(nil)))(tbool)(-1))))(cons($co("!=")(generic(cons("k")(nil))(tfns(cons(k)(cons(k)(nil)))(tbool)(-1))))(cons($co(">=")(concrete(tfns(cons(tint)(cons(tint)(nil)))(tbool)(-1))))(cons($co("<=")(concrete(tfns(cons(tint)(cons(tint)(nil)))(tbool)(-1))))(cons($co("()")(concrete(tcon("()")(-1))))(cons($co(",")(generic(cons("a")(cons("b")(nil)))(tfns(cons(a)(cons(b)(nil)))(t$co(a)(b))(-1))))(cons($co("unescapeString")(concrete(tfns(cons(tstring)(nil))(tstring)(-1))))(cons($co("int-to-string")(concrete(tfns(cons(tint)(nil))(tstring)(-1))))(cons($co("string-to-int")(concrete(tfns(cons(tstring)(nil))(toption(tint))(-1))))(cons($co("string-to-float")(concrete(tfns(cons(tstring)(nil))(toption(tcon("float")(-1)))(-1))))(cons($co("map/nil")(kv(tmap(k)(v))))(cons($co("map/set")(kv(tfns(cons(tmap(k)(v))(cons(k)(cons(v)(nil))))(tmap(k)(v))(-1))))(cons($co("map/rm")(kv(tfns(cons(tmap(k)(v))(cons(k)(nil)))(tmap(k)(v))(-1))))(cons($co("map/get")(kv(tfns(cons(tmap(k)(v))(cons(k)(nil)))(toption(v))(-1))))(cons($co("map/map")(generic(cons("k")(cons("v")(cons("v2")(nil))))(tfns(cons(tfns(cons(v)(nil))(v2)(-1))(cons(tmap(k)(v))(nil)))(tmap(k)(v2))(-1))))(cons($co("map/merge")(kv(tfns(cons(tmap(k)(v))(cons(tmap(k)(v))(nil)))(tmap(k)(v))(-1))))(cons($co("map/values")(kv(tfns(cons(tmap(k)(v))(nil))(tlist(v))(-1))))(cons($co("map/keys")(kv(tfns(cons(tmap(k)(v))(nil))(tlist(k))(-1))))(cons($co("set/nil")(kk(tset(k))))(cons($co("set/add")(kk(tfns(cons(tset(k))(cons(k)(nil)))(tset(k))(-1))))(cons($co("set/has")(kk(tfns(cons(tset(k))(cons(k)(nil)))(tbool)(-1))))(cons($co("set/rm")(kk(tfns(cons(tset(k))(cons(k)(nil)))(tset(k))(-1))))(cons($co("set/diff")(kk(tfns(cons(tset(k))(cons(tset(k))(nil)))(tset(k))(-1))))(cons($co("set/merge")(kk(tfns(cons(tset(k))(cons(tset(k))(nil)))(tset(k))(-1))))(cons($co("set/overlap")(kk(tfns(cons(tset(k))(cons(tset(k))(nil)))(tset(k))(-1))))(cons($co("set/to-list")(kk(tfns(cons(tset(k))(nil))(tlist(k))(-1))))(cons($co("set/from-list")(kk(tfns(cons(tlist(k))(nil))(tset(k))(-1))))(cons($co("map/from-list")(kv(tfns(cons(tlist(t$co(k)(v)))(nil))(tmap(k)(v))(-1))))(cons($co("map/to-list")(kv(tfns(cons(tmap(k)(v))(nil))(tlist(t$co(k)(v)))(-1))))(cons($co("jsonify")(generic(cons("v")(nil))(tfns(cons(tvar("v")(-1))(nil))(tstring)(-1))))(cons($co("valueToString")(generic(cons("v")(nil))(tfns(cons(vbl("v"))(nil))(tstring)(-1))))(cons($co("eval")(generic(cons("v")(nil))(tfns(cons(tcon("string")(-1))(nil))(vbl("v"))(-1))))(cons($co("eval-with")(generic(cons("ctx")(cons("v")(nil)))(tfns(cons(tcon("ctx")(-1))(cons(tcon("string")(-1))(nil)))(vbl("v"))(-1))))(cons($co("errorToString")(generic(cons("v")(nil))(tfns(cons(tfns(cons(vbl("v"))(nil))(tstring)(-1))(cons(vbl("v"))(nil)))(tstring)(-1))))(cons($co("sanitize")(concrete(tfns(cons(tstring)(nil))(tstring)(-1))))(cons($co("replace-all")(concrete(tfns(cons(tstring)(cons(tstring)(cons(tstring)(nil))))(tstring)(-1))))(cons($co("fatal")(generic(cons("v")(nil))(tfns(cons(tstring)(nil))(vbl("v"))(-1))))(nil)))))))))))))))))))))))))))))))))))))))))))(map$slfrom_list(cons($co("()")($co(nil)($co(nil)(tcon("()")(-1)))))(cons($co(",")($co(cons("a")(cons("b")(nil)))($co(cons(a)(cons(b)(nil)))(t$co(a)(b)))))(nil))))(map$slfrom_list(cons($co("int")($co(0)(set$slnil)))(cons($co("float")($co(0)(set$slnil)))(cons($co("string")($co(0)(set$slnil)))(cons($co("bool")($co(0)(set$slnil)))(cons($co("map")($co(2)(set$slnil)))(cons($co("set")($co(1)(set$slnil)))(cons($co("->")($co(2)(set$slnil)))(nil)))))))))(map$slnil))(vbl("b")))(vbl("a")))(generic(cons("k")(nil))))(generic(cons("k")(cons("v")(nil)))))(vbl("v2")))(vbl("v")))(vbl("k"));

const tenv$slwith_scope = ({3: aliases, 2: types, 1: tcons, 0: values}) => (scope) => tenv(map$slmerge(scope)(values))(tcons)(types)(aliases);

const scheme_$gts = ({1: type, 0: vbls}) => (($target) => {
if ($target.type === "nil") {
return type_$gts(type)
}
{
let vbls = $target;
return `forall ${join(" ")(vbls)} : ${type_$gts(type)}`
}
throw new Error('Failed to match. ' + valueToString($target));
})(set$slto_list(vbls));

const tcon_and_args = (type) => (coll) => (l) => (($target) => {
if ($target.type === "tvar") {
return fatal(`Type not resolved ${int_to_string(l)} ${jsonify(type)} ${jsonify(coll)}`)
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

{
    const test = type_$gts;
    
    const in_0 = {"0":{"0":{"0":"->","1":11886,"type":"tcon"},"1":{"0":"a","1":11889,"type":"tcon"},"2":11886,"type":"tapp"},"1":{"0":{"0":{"0":"->","1":11886,"type":"tcon"},"1":{"0":"b","1":11890,"type":"tcon"},"2":11886,"type":"tapp"},"1":{"0":{"0":{"0":"->","1":11886,"type":"tcon"},"1":{"0":"c","1":11891,"type":"tcon"},"2":11886,"type":"tapp"},"1":{"0":"d","1":11892,"type":"tcon"},"2":11886,"type":"tapp"},"2":11886,"type":"tapp"},"2":11886,"type":"tapp"};
    const mod_0 = test(in_0);
    const out_0 = "(fn [a b c] d)";
    if (!equal(mod_0, out_0)) {
        console.log(mod_0);
        console.log(out_0);
        throw new Error(`Fixture test (11877) failing 0. Not equal.`);
    }
    

    const in_1 = {"0":{"0":{"0":",","1":11902,"type":"tcon"},"1":{"0":"a","1":11903,"type":"tcon"},"2":11901,"type":"tapp"},"1":{"0":"b","1":11904,"type":"tcon"},"2":11901,"type":"tapp"};
    const mod_1 = test(in_1);
    const out_1 = "(, a b)";
    if (!equal(mod_1, out_1)) {
        console.log(mod_1);
        console.log(out_1);
        throw new Error(`Fixture test (11877) failing 1. Not equal.`);
    }
    
}
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
const scheme$slapply = (subst) => ({1: type, 0: vbls}) => forall(vbls)(type$slapply(map_without(subst)(vbls))(type));

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
const instantiate = ({1: t, 0: vars}) => (l) => $gt$gt$eq(make_subst_for_free(vars)(l))((subst) => $lt_(type$slapply(subst)(t)));

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
return fatal(`Cycle found while unifying type with type variable. ${$var}`)
}
return $gt$gt$eq(subst_$gt(one_subst($var)(type)))((_) => $lt_($unit))
throw new Error('Failed to match. ' + valueToString($target));
})(set$slhas(type$slfree(type))($var))
throw new Error('Failed to match. ' + valueToString($target));
})(type);

const add$sltypealias = ({3: aliases, 2: types, 1: tcons, 0: values}) => (name) => (args) => (type) => tenv(map$slnil)(map$slnil)(map$slnil)(map$slset(map$slnil)(name)($co(map(fst)(args))(type$slcon_to_var(set$slfrom_list(map(fst)(args)))(type))));

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
return $co(nil)($co(nil)(nil))
}
if ($target.type === "cons") {
{
let stmt = $target[0];
let rest = $target[1];
return (({1: {1: others, 0: aliases}, 0: defs}) => (($target) => {
if ($target.type === "tdef") {
{
let name = $target[0];
let nl = $target[1];
let body = $target[2];
let l = $target[3];
return $co(cons($co(name)($co(nl)($co(body)(l))))(defs))($co(aliases)(others))
}
}
if ($target.type === "ttypealias") {
return $co(defs)($co(cons(stmt)(aliases))(others))
}
return $co(defs)($co(aliases)(cons(stmt)(others)))
throw new Error('Failed to match. ' + valueToString($target));
})(stmt))(recur(rest))
}
}
throw new Error('Failed to match. ' + valueToString($target));
})(stmts));

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

const scope$slapply = (subst) => (scope) => map$slmap(scheme$slapply(subst))(scope);

const scope$slapply_$gt = apply_$gt(scope$slapply);

const scheme$slapply_$gt = apply_$gt(scheme$slapply);

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

const tenv$slapply = (subst) => ({3: aliases, 2: types, 1: tcons, 0: values}) => tenv(scope$slapply(subst)(values))(tcons)(types)(aliases);

const unify = (t1) => (t2) => (l) => (($target) => {
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
return fatal(`Incompatible concrete types: ${a} (${int_to_string(la)}) vs ${b} (${int_to_string(lb)})`)
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
return $gt$gt$eq(unify(t1)(t2)(l))((_) => $gt$gt$eq($lt_subst)((subst) => $gt$gt$eq(unify(type$slapply(subst)(a1))(type$slapply(subst)(a2))(l))((_) => $lt_($unit))))
}
}
return fatal(`Incompatible types: ${jsonify(t1)} ${jsonify(t2)}`)
throw new Error('Failed to match. ' + valueToString($target));
})($co(t1)(t2));

const tenv$slapply_$gt = apply_$gt(tenv$slapply);

const infer$slpattern = (tenv) => (pattern) => (($target) => {
if ($target.type === "pvar") {
{
let name = $target[0];
let l = $target[1];
return $gt$gt$eq(new_type_var(name)(l))((v) => $lt_($co(v)(map$slfrom_list(cons($co(name)(forall(set$slnil)(v)))(nil)))))
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
if ($target.type === "pcon") {
{
let name = $target[0];
let args = $target[2];
let l = $target[3];
return $gt$gt$eq(instantiate_tcon(tenv)(name)(l))(({1: cres, 0: cargs}) => $gt$gt$eq(map_$gt(infer$slpattern(tenv))(args))((sub_patterns) => $gt$gt$eq($lt_(unzip(sub_patterns)))(({1: scopes, 0: arg_types}) => $gt$gt$eq(do_$gt(({1: ctype, 0: ptype}) => unify(ptype)(ctype)(l))(zip(arg_types)(cargs)))((_) => $gt$gt$eq(type$slapply_$gt(cres))((cres) => $gt$gt$eq($lt_(foldl(map$slnil)(scopes)(map$slmerge)))((scope) => $lt_($co(cres)(scope))))))))
}
}
throw new Error('Failed to match. ' + valueToString($target));
})(pattern);

const add$sldeftype = ({3: aliases, 2: types, 1: tcons}) => (name) => (args) => (constrs) => (l) => ((free) => ((free_set) => ((res) => ((parsed_constrs) => tenv(map$slfrom_list(map(({1: {1: {1: res, 0: args}, 0: free}, 0: name}) => $co(name)(forall(set$slfrom_list(free))(tfns(args)(res)(l))))(parsed_constrs)))(map$slfrom_list(parsed_constrs))(map$slset(map$slnil)(name)($co(length(args))(set$slfrom_list(map(fst)(constrs)))))(map$slnil))(map(({1: {1: {0: args}}, 0: name}) => ((args) => ((args) => $co(name)($co(free)($co(args)(res))))(map(type$slresolve_aliases(aliases))(args)))(map(type$slcon_to_var(free_set))(args)))(constrs)))(foldl(tcon(name)(l))(args)((inner) => ({1: l, 0: name}) => tapp(inner)(tvar(name)(l))(l))))(set$slfrom_list(free)))(map(fst)(args));

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

const is_exhaustive = (tenv) => (matrix) => (($target) => {
if ($target === true) {
return false
}
return true
throw new Error('Failed to match. ' + valueToString($target));
})(is_useful(tenv)(matrix)(cons(ex$slany)(nil)));

const check_exhaustiveness = (tenv) => (target_type) => (patterns) => (l) => $gt$gt$eq(type$slapply_$gt(target_type))((target_type) => $gt$gt$eq($lt_(map((pat) => cons(pattern_to_ex_pattern(tenv)($co(pat)(target_type)))(nil))(patterns)))((matrix) => (($target) => {
if ($target === true) {
return $lt_($unit)
}
return fatal(`Match not exhaustive ${int_to_string(l)}`)
throw new Error('Failed to match. ' + valueToString($target));
})(is_exhaustive(tenv)(matrix))));

const infer$slexpr_inner = (tenv) => (expr) => (($target) => {
if ($target.type === "evar") {
{
let name = $target[0];
let l = $target[1];
return (($target) => {
if ($target.type === "none") {
return fatal(`Variable not found in scope: ${name}`)
}
if ($target.type === "some") {
{
let scheme = $target[0];
return instantiate(scheme)(l)
}
}
throw new Error('Failed to match. ' + valueToString($target));
})(tenv$slresolve(tenv)(name))
}
}
if ($target.type === "eprim") {
{
let prim = $target[0];
return $lt_(infer$slprim(prim))
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
return $gt$gt$eq(new_type_var(arg)(al))((arg_type) => $gt$gt$eq($lt_(tenv$slwith_type(tenv)(arg)(forall(set$slnil)(arg_type))))((bound_env) => $gt$gt$eq(infer$slexpr(bound_env)(body))((body_type) => $gt$gt$eq(type$slapply_$gt(arg_type))((arg_type) => $lt_(tfn(arg_type)(body_type)(l))))))
}
}
if ($target.type === "elambda" &&
$target[0].type === "cons" &&
$target[0][1].type === "nil") {
{
let pat = $target[0][0];
let body = $target[1];
let l = $target[2];
return $gt$gt$eq(infer$slpattern(tenv)(pat))(({1: scope, 0: arg_type}) => $gt$gt$eq(scope$slapply_$gt(scope))((scope) => $gt$gt$eq($lt_(tenv$slwith_scope(tenv)(scope)))((bound_env) => $gt$gt$eq(infer$slexpr(bound_env)(body))((body_type) => $gt$gt$eq(type$slapply_$gt(arg_type))((arg_type) => $lt_(tfn(arg_type)(body_type)(l)))))))
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
return fatal("No args to lambda")
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
let value = $target[0][0][1];
let body = $target[1];
return $gt$gt$eq(infer$slexpr(tenv)(value))((value_type) => $gt$gt$eq(tenv$slapply_$gt(tenv))((applied_env) => $gt$gt$eq($lt_(generalize(applied_env)(value_type)))((scheme) => $gt$gt$eq($lt_(tenv$slwith_type(applied_env)(name)(scheme)))((bound_env) => infer$slexpr(bound_env)(body)))))
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
return fatal("No bindings in let")
}
}
if ($target.type === "ematch") {
{
let target = $target[0];
let cases = $target[1];
let l = $target[2];
return $gt$gt$eq(infer$slexpr(tenv)(target))((target_type) => $gt$gt$eq(new_type_var("match result")(l))((result_type) => $gt$gt$eq(foldl_$gt($co(target_type)(result_type))(cases)(({1: result, 0: target_type}) => ({1: body, 0: pat}) => $gt$gt$eq(infer$slpattern(tenv)(pat))(({1: scope, 0: type}) => $gt$gt$eq(unify(type)(target_type)(l))((_) => $gt$gt$eq(scope$slapply_$gt(scope))((scope) => $gt$gt$eq(infer$slexpr(tenv$slwith_scope(tenv)(scope))(body))((body_type) => $gt$gt$eq($lt_subst)((subst) => $gt$gt$eq(unify(type$slapply(subst)(result))(body_type)(l))((_) => $gt$gt$eq($lt_subst)((subst) => $lt_($co(type$slapply(subst)(target_type))(type$slapply(subst)(result))))))))))))(({1: final_result}) => $gt$gt$eq(type$slapply_$gt(target_type))((target) => $gt$gt$eq(check_exhaustiveness(tenv)(target)(map(fst)(cases))(l))((_) => $lt_(final_result))))))
}
}
throw new Error('Failed to match. ' + valueToString($target));
})(expr);


const infer$slexpr = (tenv) => (expr) => $gt$gt$eq(subst_reset_$gt(map$slnil))((old) => $gt$gt$eq(infer$slexpr_inner(tenv)(expr))((type) => $gt$gt$eq(subst_reset_$gt(old))(($new) => $gt$gt$eq(subst_$gt($new))((_) => $lt_(type)))));

const add$sldefs = (tenv) => (defns) => run$slnil_$gt($gt$gt$eq($lt_(map(({0: name}) => name)(defns)))((names) => $gt$gt$eq($lt_(map(({1: {1: {1: l}}}) => l)(defns)))((locs) => $gt$gt$eq(map_$gt(({1: {0: nl}, 0: name}) => new_type_var(name)(nl))(defns))((vbls) => $gt$gt$eq($lt_(foldl(tenv)(zip(names)(map(forall(set$slnil))(vbls)))((tenv) => ({1: vbl, 0: name}) => tenv$slwith_type(tenv)(name)(vbl))))((bound_env) => $gt$gt$eq(map_$gt(({1: {1: {0: expr}}}) => infer$slexpr(bound_env)(expr))(defns))((types) => $gt$gt$eq(map_$gt(type$slapply_$gt)(vbls))((vbls) => $gt$gt$eq(do_$gt(({1: {1: loc, 0: type}, 0: vbl}) => unify(vbl)(type)(loc))(zip(vbls)(zip(types)(locs))))((_) => $gt$gt$eq(map_$gt(type$slapply_$gt)(types))((types) => $lt_(foldl(tenv$slnil)(zip(names)(types))((tenv) => ({1: type, 0: name}) => tenv$slwith_type(tenv)(name)(generalize(tenv)(type)))))))))))));

{
    const test = (x) => add$sldefs(builtin_env)(map(({3: l, 2: body, 1: nl, 0: name}) => $co(name)($co(nl)($co(body)(l))))(x));
    
    const in_0 = cons({"0":"even","1":3779,"2":{"0":{"0":{"0":"x","1":3781,"type":"pvar"},"1":{"type":"nil"},"type":"cons"},"1":{"0":{"0":{"0":{"0":"o","1":3785,"type":"pvar"},"1":{"0":{"0":"odd","1":3787,"type":"evar"},"1":{"0":{"0":"x","1":3788,"type":"evar"},"1":{"type":"nil"},"type":"cons"},"2":3786,"type":"eapp"},"type":","},"1":{"type":"nil"},"type":"cons"},"1":{"0":{"0":"+","1":3789,"type":"evar"},"1":{"0":{"0":"x","1":3905,"type":"evar"},"1":{"0":{"0":{"0":2,"1":3906,"type":"pint"},"1":3906,"type":"eprim"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"2":3904,"type":"eapp"},"2":3782,"type":"elet"},"2":3776,"type":"elambda"},"3":3776,"type":"tdef"})(cons({"0":"odd","1":3823,"2":{"0":{"0":{"0":"x","1":3825,"type":"pvar"},"1":{"type":"nil"},"type":"cons"},"1":{"0":{"0":{"0":{"0":"e","1":3830,"type":"pvar"},"1":{"0":{"0":"even","1":3832,"type":"evar"},"1":{"0":{"0":"x","1":3833,"type":"evar"},"1":{"type":"nil"},"type":"cons"},"2":3831,"type":"eapp"},"type":","},"1":{"type":"nil"},"type":"cons"},"1":{"0":{"0":3,"1":3834,"type":"pint"},"1":3834,"type":"eprim"},"2":3826,"type":"elet"},"2":3821,"type":"elambda"},"3":3821,"type":"tdef"})(nil));
    const mod_0 = test(in_0);
    const out_0 = tenv(map$slfrom_list(cons($co("odd")(forall(map$slfrom_list(nil))(tapp(tapp(tcon("->")(3821))(tcon("int")(-1))(3821))(tcon("int")(3834))(3821))))(cons($co("even")(forall(map$slfrom_list(nil))(tapp(tapp(tcon("->")(3776))(tcon("int")(-1))(3776))(tcon("int")(-1))(3776))))(nil))))(map$slnil)(map$slnil)(map$slnil);
    if (!equal(mod_0, out_0)) {
        console.log(mod_0);
        console.log(out_0);
        throw new Error(`Fixture test (3765) failing 0. Not equal.`);
    }
    
}
const add$sldef = (tenv) => (name) => (nl) => (expr) => (l) => run$slnil_$gt($gt$gt$eq(new_type_var(name)(nl))((self) => $gt$gt$eq($lt_(tenv$slwith_type(tenv)(name)(forall(set$slnil)(self))))((bound_env) => $gt$gt$eq(infer$slexpr(bound_env)(expr))((type) => $gt$gt$eq(type$slapply_$gt(self))((self) => $gt$gt$eq(unify(self)(type)(l))((_) => $gt$gt$eq(type$slapply_$gt(type))((type) => $lt_(tenv$slwith_type(tenv$slnil)(name)(generalize(tenv)(type))))))))));

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
return run$slnil_$gt($gt$gt$eq(infer$slexpr(tenv)(expr))((_) => $lt_(tenv$slnil)))
}
}
if ($target.type === "ttypealias") {
{
let name = $target[0];
let args = $target[2];
let type = $target[3];
return add$sltypealias(tenv)(name)(args)(type)
}
}
if ($target.type === "tdeftype") {
{
let name = $target[0];
let args = $target[2];
let constrs = $target[3];
let l = $target[4];
return add$sldeftype(tenv)(name)(args)(constrs)(l)
}
}
throw new Error('Failed to match. ' + valueToString($target));
})(stmt);

{
    const test = ({3: l, 2: expr, 1: nl, 0: name}) => (({0: values}) => map$slto_list(values))(add$sldef(builtin_env)(name)(nl)(expr)(l));
    
    const in_0 = {"0":"x","1":3023,"2":{"0":{"0":10,"1":3024,"type":"pint"},"1":3024,"type":"eprim"},"3":3021,"type":"tdef"};
    const mod_0 = test(in_0);
    const out_0 = cons($co("x")(forall(set$slnil)(tcon("int")(3024))))(nil);
    if (!equal(mod_0, out_0)) {
        console.log(mod_0);
        console.log(out_0);
        throw new Error(`Fixture test (3010) failing 0. Not equal.`);
    }
    

    const in_1 = {"0":"id","1":3046,"2":{"0":{"0":{"0":"x","1":3048,"type":"pvar"},"1":{"type":"nil"},"type":"cons"},"1":{"0":"x","1":3049,"type":"evar"},"2":3044,"type":"elambda"},"3":3044,"type":"tdef"};
    const mod_1 = test(in_1);
    const out_1 = cons($co("id")(forall(set$slfrom_list(cons("x:1")(nil)))(tapp(tapp(tcon("->")(3044))(tvar("x:1")(3048))(3044))(tvar("x:1")(3048))(3044))))(nil);
    if (!equal(mod_1, out_1)) {
        console.log(mod_1);
        console.log(out_1);
        throw new Error(`Fixture test (3010) failing 1. Not equal.`);
    }
    

    const in_2 = {"0":"rec","1":3148,"2":{"0":{"0":{"0":"x","1":3150,"type":"pvar"},"1":{"type":"nil"},"type":"cons"},"1":{"0":{"0":{"0":{"0":"m","1":3424,"type":"pvar"},"1":{"0":{"0":"rec","1":3426,"type":"evar"},"1":{"0":{"0":"x","1":3427,"type":"evar"},"1":{"type":"nil"},"type":"cons"},"2":3425,"type":"eapp"},"type":","},"1":{"type":"nil"},"type":"cons"},"1":{"0":{"0":"+","1":3429,"type":"evar"},"1":{"0":{"0":"x","1":3430,"type":"evar"},"1":{"0":{"0":"m","1":3431,"type":"evar"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"2":3428,"type":"eapp"},"2":3378,"type":"elet"},"2":3146,"type":"elambda"},"3":3146,"type":"tdef"};
    const mod_2 = test(in_2);
    const out_2 = cons($co("rec")(forall(map$slfrom_list(nil))(tapp(tapp(tcon("->")(3146))(tcon("int")(-1))(3146))(tcon("int")(-1))(3146))))(nil);
    if (!equal(mod_2, out_2)) {
        console.log(mod_2);
        console.log(out_2);
        throw new Error(`Fixture test (3010) failing 2. Not equal.`);
    }
    
}
const add$slstmts = (tenv) => (stmts) => (({1: {1: others, 0: aliases}, 0: defs}) => ((denv) => ((final) => final)(foldl(denv)(concat(cons(aliases)(cons(others)(nil))))((env) => (stmt) => tenv$slmerge(env)(add$slstmt(tenv$slmerge(tenv)(env))(stmt)))))(add$sldefs(tenv)(defs)))(split_stmts(stmts));

{
    const test = ({1: name, 0: x}) => scheme_$gts(force(tenv$slresolve(foldl(tenv$slnil)(x)((env) => (stmts) => tenv$slmerge(env)(add$slstmts(tenv$slmerge(builtin_env)(env))(stmts))))(name)));
    
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
    const out_2 = "(fn [expr] (, (list pat) expr))";
    if (!equal(mod_2, out_2)) {
        console.log(mod_2);
        console.log(out_2);
        throw new Error(`Fixture test (6456) failing 2. Not equal.`);
    }
    

    const in_3 = $co(cons(cons({"0":"a","1":9826,"2":{"0":{"0":"b","1":9827,"type":","},"1":{"type":"nil"},"type":"cons"},"3":{"0":{"0":{"0":",","1":9829,"type":"tcon"},"1":{"0":"int","1":9830,"type":"tcon"},"2":9828,"type":"tapp"},"1":{"0":"b","1":9831,"type":"tcon"},"2":9828,"type":"tapp"},"4":9823,"type":"ttypealias"})(cons({"0":"hi","1":9836,"2":{"type":"nil"},"3":{"0":{"0":"red","1":{"0":9838,"1":{"0":{"0":{"0":"int","1":9839,"type":"tcon"},"1":{"type":"nil"},"type":"cons"},"1":9837,"type":","},"type":","},"type":","},"1":{"0":{"0":"blue","1":{"0":9841,"1":{"0":{"type":"nil"},"1":9840,"type":","},"type":","},"type":","},"1":{"0":{"0":"green","1":{"0":9843,"1":{"0":{"0":{"0":{"0":"a","1":9845,"type":"tcon"},"1":{"0":"bool","1":9846,"type":"tcon"},"2":9844,"type":"tapp"},"1":{"type":"nil"},"type":"cons"},"1":9842,"type":","},"type":","},"type":","},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"type":"cons"},"4":9834,"type":"tdeftype"})(nil)))(nil))("green");
    const mod_3 = test(in_3);
    const out_3 = "(fn [(, int bool)] hi)";
    if (!equal(mod_3, out_3)) {
        console.log(mod_3);
        console.log(out_3);
        throw new Error(`Fixture test (6456) failing 3. Not equal.`);
    }
    

}
{
    const test = pattern_to_ex_pattern(tenv$slmerge(builtin_env)(add$slstmts(builtin_env)(cons({"0":",","1":11300,"2":{"0":{"0":"a","1":11301,"type":","},"1":{"0":{"0":"b","1":11302,"type":","},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"3":{"0":{"0":",","1":{"0":11305,"1":{"0":{"0":{"0":"a","1":11306,"type":"tcon"},"1":{"0":{"0":"b","1":11307,"type":"tcon"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"1":11304,"type":","},"type":","},"type":","},"1":{"type":"nil"},"type":"cons"},"4":11297,"type":"tdeftype"})(cons({"0":"list","1":11196,"2":{"0":{"0":"a","1":11197,"type":","},"1":{"type":"nil"},"type":"cons"},"3":{"0":{"0":"nil","1":{"0":11199,"1":{"0":{"type":"nil"},"1":11198,"type":","},"type":","},"type":","},"1":{"0":{"0":"cons","1":{"0":11201,"1":{"0":{"0":{"0":"a","1":11202,"type":"tcon"},"1":{"0":{"0":{"0":"list","1":11204,"type":"tcon"},"1":{"0":"a","1":11205,"type":"tcon"},"2":11203,"type":"tapp"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"1":11200,"type":","},"type":","},"type":","},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"4":11193,"type":"tdeftype"})(nil)))));
    
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
const env_with_pair = tenv$slmerge(builtin_env)(add$slstmts(builtin_env)(cons({"0":",","1":12044,"2":{"0":{"0":"a","1":12045,"type":","},"1":{"0":{"0":"b","1":12046,"type":","},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"3":{"0":{"0":",","1":{"0":12048,"1":{"0":{"0":{"0":"a","1":12049,"type":"tcon"},"1":{"0":{"0":"b","1":12050,"type":"tcon"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"1":12047,"type":","},"type":","},"type":","},"1":{"type":"nil"},"type":"cons"},"4":12041,"type":"tdeftype"})(nil)));

{
    const test = errorToString((x) => type_$gts(run$slnil_$gt(infer$slexpr(env_with_pair)(x))));
    
    const in_0 = {"0":{"0":{"0":"x","1":12099,"type":"pvar"},"1":{"type":"nil"},"type":"cons"},"1":{"0":{"0":{"0":{"0":",","1":12103,"2":{"0":{"0":"a","1":12105,"type":"pvar"},"1":{"0":{"0":12106,"type":"pany"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"3":12103,"type":"pcon"},"1":{"0":"x","1":12107,"type":"evar"},"type":","},"1":{"type":"nil"},"type":"cons"},"1":{"0":{"0":"a","1":12109,"type":"evar"},"1":{"0":{"0":{"0":2,"1":12110,"type":"pint"},"1":12110,"type":"eprim"},"1":{"type":"nil"},"type":"cons"},"2":12108,"type":"eapp"},"2":12100,"type":"elet"},"2":12096,"type":"elambda"};
    const mod_0 = test(in_0);
    const out_0 = "(fn [(, (fn [int] result:5) b:2)] result:5)";
    if (!equal(mod_0, out_0)) {
        console.log(mod_0);
        console.log(out_0);
        throw new Error(`Fixture test (12051) failing 0. Not equal.`);
    }
    

    const in_1 = {"0":{"0":{"0":",","1":12079,"2":{"0":{"0":"a","1":12081,"type":"pvar"},"1":{"0":{"0":12082,"type":"pany"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"3":12079,"type":"pcon"},"1":{"type":"nil"},"type":"cons"},"1":{"0":{"0":"a","1":12084,"type":"evar"},"1":{"0":{"0":{"0":2,"1":12085,"type":"pint"},"1":12085,"type":"eprim"},"1":{"type":"nil"},"type":"cons"},"2":12083,"type":"eapp"},"2":12076,"type":"elambda"};
    const mod_1 = test(in_1);
    const out_1 = "(fn [(, (fn [int] result:4) b:1)] result:4)";
    if (!equal(mod_1, out_1)) {
        console.log(mod_1);
        console.log(out_1);
        throw new Error(`Fixture test (12051) failing 1. Not equal.`);
    }
    
}
{
    const test = errorToString((x) => run$slnil_$gt(infer$slexpr(env_with_pair)(x)));
    
    const in_0 = {"0":{"0":10,"1":4512,"type":"pint"},"1":4512,"type":"eprim"};
    const mod_0 = test(in_0);
    const out_0 = tcon("int")(4512);
    if (!equal(mod_0, out_0)) {
        console.log(mod_0);
        console.log(out_0);
        throw new Error(`Fixture test (4501) failing 0. Not equal.`);
    }
    

    const in_1 = {"0":"hi","1":4531,"type":"evar"};
    const mod_1 = test(in_1);
    const out_1 = "Fatal runtime: Variable not found in scope: hi";
    if (!equal(mod_1, out_1)) {
        console.log(mod_1);
        console.log(out_1);
        throw new Error(`Fixture test (4501) failing 1. Not equal.`);
    }
    

    const in_2 = {"0":{"0":{"0":{"0":"x","1":4546,"type":"pvar"},"1":{"0":{"0":10,"1":4547,"type":"pint"},"1":4547,"type":"eprim"},"type":","},"1":{"type":"nil"},"type":"cons"},"1":{"0":"x","1":4548,"type":"evar"},"2":4543,"type":"elet"};
    const mod_2 = test(in_2);
    const out_2 = tcon("int")(4547);
    if (!equal(mod_2, out_2)) {
        console.log(mod_2);
        console.log(out_2);
        throw new Error(`Fixture test (4501) failing 2. Not equal.`);
    }
    

    const in_3 = {"0":{"0":",","1":4560,"type":"evar"},"1":{"0":{"0":{"0":1,"1":4561,"type":"pint"},"1":4561,"type":"eprim"},"1":{"0":{"0":{"0":2,"1":4562,"type":"pint"},"1":4562,"type":"eprim"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"2":4559,"type":"eapp"};
    const mod_3 = test(in_3);
    const out_3 = tapp(tapp(tcon(",")(-1))(tcon("int")(4561))(-1))(tcon("int")(4562))(-1);
    if (!equal(mod_3, out_3)) {
        console.log(mod_3);
        console.log(out_3);
        throw new Error(`Fixture test (4501) failing 3. Not equal.`);
    }
    

    const in_4 = {"0":{"0":{"0":"x","1":4694,"type":"pvar"},"1":{"type":"nil"},"type":"cons"},"1":{"0":{"0":{"0":{"0":",","1":4698,"2":{"0":{"0":"a","1":4700,"type":"pvar"},"1":{"0":{"0":"b","1":4701,"type":"pvar"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"3":4698,"type":"pcon"},"1":{"0":"x","1":4703,"type":"evar"},"type":","},"1":{"type":"nil"},"type":"cons"},"1":{"0":"a","1":4702,"type":"evar"},"2":4695,"type":"elet"},"2":4689,"type":"elambda"};
    const mod_4 = test(in_4);
    const out_4 = tapp(tapp(tcon("->")(4689))(tapp(tapp(tcon(",")(-1))(tvar("a:1")(4698))(-1))(tvar("b:2")(4698))(-1))(4689))(tvar("a:1")(4698))(4689);
    if (!equal(mod_4, out_4)) {
        console.log(mod_4);
        console.log(out_4);
        throw new Error(`Fixture test (4501) failing 4. Not equal.`);
    }
    

    const in_5 = {"0":{"0":{"0":{"0":"id","1":4751,"type":"pvar"},"1":{"0":{"0":{"0":"x","1":4755,"type":"pvar"},"1":{"type":"nil"},"type":"cons"},"1":{"0":"x","1":4756,"type":"evar"},"2":4752,"type":"elambda"},"type":","},"1":{"type":"nil"},"type":"cons"},"1":{"0":{"0":",","1":4758,"type":"evar"},"1":{"0":{"0":{"0":"id","1":4760,"type":"evar"},"1":{"0":{"0":{"0":2,"1":4761,"type":"pint"},"1":4761,"type":"eprim"},"1":{"type":"nil"},"type":"cons"},"2":4759,"type":"eapp"},"1":{"0":{"0":{"0":"id","1":4763,"type":"evar"},"1":{"0":{"0":{"0":true,"1":4764,"type":"pbool"},"1":4764,"type":"eprim"},"1":{"type":"nil"},"type":"cons"},"2":4762,"type":"eapp"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"2":4757,"type":"eapp"},"2":4748,"type":"elet"};
    const mod_5 = test(in_5);
    const out_5 = tapp(tapp(tcon(",")(-1))(tcon("int")(4761))(-1))(tcon("bool")(4764))(-1);
    if (!equal(mod_5, out_5)) {
        console.log(mod_5);
        console.log(out_5);
        throw new Error(`Fixture test (4501) failing 5. Not equal.`);
    }
    

    const in_6 = {"0":{"0":{"0":"id","1":4817,"type":"pvar"},"1":{"type":"nil"},"type":"cons"},"1":{"0":{"0":",","1":4819,"type":"evar"},"1":{"0":{"0":{"0":"id","1":4821,"type":"evar"},"1":{"0":{"0":{"0":2,"1":4822,"type":"pint"},"1":4822,"type":"eprim"},"1":{"type":"nil"},"type":"cons"},"2":4820,"type":"eapp"},"1":{"0":{"0":{"0":"id","1":4824,"type":"evar"},"1":{"0":{"0":{"0":true,"1":4825,"type":"pbool"},"1":4825,"type":"eprim"},"1":{"type":"nil"},"type":"cons"},"2":4823,"type":"eapp"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"2":4818,"type":"eapp"},"2":4814,"type":"elambda"};
    const mod_6 = test(in_6);
    const out_6 = "Fatal runtime: Incompatible concrete types: int (4822) vs bool (4825)";
    if (!equal(mod_6, out_6)) {
        console.log(mod_6);
        console.log(out_6);
        throw new Error(`Fixture test (4501) failing 6. Not equal.`);
    }
    

    const in_7 = {"0":{"0":{"0":"arg","1":4836,"type":"pvar"},"1":{"type":"nil"},"type":"cons"},"1":{"0":{"0":{"0":{"0":",","1":4840,"2":{"0":{"0":"id","1":4842,"type":"pvar"},"1":{"0":{"0":4843,"type":"pany"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"3":4840,"type":"pcon"},"1":{"0":"arg","1":4844,"type":"evar"},"type":","},"1":{"type":"nil"},"type":"cons"},"1":{"0":{"0":",","1":4846,"type":"evar"},"1":{"0":{"0":{"0":"id","1":4848,"type":"evar"},"1":{"0":{"0":{"0":2,"1":4849,"type":"pint"},"1":4849,"type":"eprim"},"1":{"type":"nil"},"type":"cons"},"2":4847,"type":"eapp"},"1":{"0":{"0":{"0":"id","1":4851,"type":"evar"},"1":{"0":{"0":{"0":true,"1":4852,"type":"pbool"},"1":4852,"type":"eprim"},"1":{"type":"nil"},"type":"cons"},"2":4850,"type":"eapp"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"2":4845,"type":"eapp"},"2":4837,"type":"elet"},"2":4833,"type":"elambda"};
    const mod_7 = test(in_7);
    const out_7 = "Fatal runtime: Incompatible concrete types: int (4849) vs bool (4852)";
    if (!equal(mod_7, out_7)) {
        console.log(mod_7);
        console.log(out_7);
        throw new Error(`Fixture test (4501) failing 7. Not equal.`);
    }
    

    const in_8 = {"0":{"0":{"0":{"0":"x","1":4864,"type":"pvar"},"1":{"type":"nil"},"type":"cons"},"1":{"0":"x","1":4865,"type":"evar"},"2":4861,"type":"elambda"},"1":{"0":{"0":{"0":2,"1":4866,"type":"pint"},"1":4866,"type":"eprim"},"1":{"type":"nil"},"type":"cons"},"2":4860,"type":"eapp"};
    const mod_8 = test(in_8);
    const out_8 = tcon("int")(4866);
    if (!equal(mod_8, out_8)) {
        console.log(mod_8);
        console.log(out_8);
        throw new Error(`Fixture test (4501) failing 8. Not equal.`);
    }
    

    const in_9 = {"0":{"0":{"0":{"0":"a","1":9709,"type":"pvar"},"1":{"0":{"0":2,"1":9710,"type":"pint"},"1":9710,"type":"eprim"},"type":","},"1":{"type":"nil"},"type":"cons"},"1":{"0":{"0":{"0":{"0":"a","1":9715,"type":"pvar"},"1":{"0":{"0":true,"1":9716,"type":"pbool"},"1":9716,"type":"eprim"},"type":","},"1":{"type":"nil"},"type":"cons"},"1":{"0":"a","1":9717,"type":"evar"},"2":9711,"type":"elet"},"2":9706,"type":"elet"};
    const mod_9 = test(in_9);
    const out_9 = tcon("bool")(9716);
    if (!equal(mod_9, out_9)) {
        console.log(mod_9);
        console.log(out_9);
        throw new Error(`Fixture test (4501) failing 9. Not equal.`);
    }
    

    const in_10 = {"0":{"0":{"0":1,"1":5072,"type":"pint"},"1":5072,"type":"eprim"},"1":{"0":{"0":{"0":{"0":1,"1":5073,"type":"pint"},"1":5073,"type":"pprim"},"1":{"0":{"0":true,"1":5074,"type":"pbool"},"1":5074,"type":"eprim"},"type":","},"1":{"0":{"0":{"0":11378,"type":"pany"},"1":{"0":{"0":false,"1":11379,"type":"pbool"},"1":11379,"type":"eprim"},"type":","},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"2":5068,"type":"ematch"};
    const mod_10 = test(in_10);
    const out_10 = tcon("bool")(5074);
    if (!equal(mod_10, out_10)) {
        console.log(mod_10);
        console.log(out_10);
        throw new Error(`Fixture test (4501) failing 10. Not equal.`);
    }
    

    const in_11 = {"0":{"0":{"0":"x","1":5088,"type":"pvar"},"1":{"type":"nil"},"type":"cons"},"1":{"0":{"0":"x","1":5091,"type":"evar"},"1":{"0":{"0":{"0":",","1":5092,"2":{"0":{"0":{"0":1,"1":5094,"type":"pint"},"1":5094,"type":"pprim"},"1":{"0":{"0":"a","1":5095,"type":"pvar"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"3":5092,"type":"pcon"},"1":{"0":"a","1":5096,"type":"evar"},"type":","},"1":{"0":{"0":{"0":11380,"type":"pany"},"1":{"0":{"0":1,"1":11381,"type":"pint"},"1":11381,"type":"eprim"},"type":","},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"2":5089,"type":"ematch"},"2":5085,"type":"elambda"};
    const mod_11 = test(in_11);
    const out_11 = tapp(tapp(tcon("->")(5085))(tapp(tapp(tcon(",")(-1))(tcon("int")(5094))(-1))(tcon("int")(11381))(-1))(5085))(tcon("int")(11381))(5085);
    if (!equal(mod_11, out_11)) {
        console.log(mod_11);
        console.log(out_11);
        throw new Error(`Fixture test (4501) failing 11. Not equal.`);
    }
    

    const in_12 = {"0":{"0":{"0":1,"1":5141,"type":"pint"},"1":5141,"type":"eprim"},"1":{"0":{"0":{"0":{"0":1,"1":5142,"type":"pint"},"1":5142,"type":"pprim"},"1":{"0":{"0":true,"1":5143,"type":"pbool"},"1":5143,"type":"eprim"},"type":","},"1":{"0":{"0":{"0":{"0":2,"1":5144,"type":"pint"},"1":5144,"type":"pprim"},"1":{"0":{"0":2,"1":5145,"type":"pint"},"1":5145,"type":"eprim"},"type":","},"1":{"0":{"0":{"0":11650,"type":"pany"},"1":{"0":{"0":3,"1":11651,"type":"pint"},"1":11651,"type":"eprim"},"type":","},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"type":"cons"},"2":5139,"type":"ematch"};
    const mod_12 = test(in_12);
    const out_12 = "Fatal runtime: Incompatible concrete types: bool (5143) vs int (5145)";
    if (!equal(mod_12, out_12)) {
        console.log(mod_12);
        console.log(out_12);
        throw new Error(`Fixture test (4501) failing 12. Not equal.`);
    }
    

    const in_13 = {"0":{"0":{"0":"x","1":6440,"type":"pvar"},"1":{"type":"nil"},"type":"cons"},"1":{"0":{"0":"x","1":6443,"type":"evar"},"1":{"0":{"0":{"0":",","1":6444,"2":{"0":{"0":{"0":2,"1":6446,"type":"pint"},"1":6446,"type":"pprim"},"1":{"0":{"0":6454,"type":"pany"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"3":6444,"type":"pcon"},"1":{"0":{"0":10,"1":6447,"type":"pint"},"1":6447,"type":"eprim"},"type":","},"1":{"0":{"0":{"0":",","1":6448,"2":{"0":{"0":"m","1":6450,"type":"pvar"},"1":{"0":{"0":6455,"type":"pany"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"3":6448,"type":"pcon"},"1":{"0":"m","1":6451,"type":"evar"},"type":","},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"2":6441,"type":"ematch"},"2":6436,"type":"elambda"};
    const mod_13 = test(in_13);
    const out_13 = tapp(tapp(tcon("->")(6436))(tapp(tapp(tcon(",")(-1))(tcon("int")(6446))(-1))(tvar("b:3")(6444))(-1))(6436))(tcon("int")(6447))(6436);
    if (!equal(mod_13, out_13)) {
        console.log(mod_13);
        console.log(out_13);
        throw new Error(`Fixture test (4501) failing 13. Not equal.`);
    }
    

    const in_14 = {"0":{"0":{"0":"hi","1":6703,"type":"evar"},"type":"quot/expr"},"1":6701,"type":"equot"};
    const mod_14 = test(in_14);
    const out_14 = tcon("expr")(6701);
    if (!equal(mod_14, out_14)) {
        console.log(mod_14);
        console.log(out_14);
        throw new Error(`Fixture test (4501) failing 14. Not equal.`);
    }
    

    const in_15 = {"0":"hi","1":{"type":"nil"},"2":6785,"type":"estr"};
    const mod_15 = test(in_15);
    const out_15 = tcon("string")(6785);
    if (!equal(mod_15, out_15)) {
        console.log(mod_15);
        console.log(out_15);
        throw new Error(`Fixture test (4501) failing 15. Not equal.`);
    }
    

    const in_16 = {"0":"hi ","1":{"0":{"0":{"0":{"0":1,"1":6850,"type":"pint"},"1":6850,"type":"eprim"},"1":{"0":"","1":6851,"type":","},"type":","},"1":{"type":"nil"},"type":"cons"},"2":6848,"type":"estr"};
    const mod_16 = test(in_16);
    const out_16 = "Fatal runtime: Incompatible concrete types: int (6850) vs string (6848)";
    if (!equal(mod_16, out_16)) {
        console.log(mod_16);
        console.log(out_16);
        throw new Error(`Fixture test (4501) failing 16. Not equal.`);
    }
    

    const in_17 = {"0":{"0":{"0":"x","1":11944,"type":"pvar"},"1":{"type":"nil"},"type":"cons"},"1":{"0":{"0":{"0":{"0":",","1":11950,"2":{"0":{"0":"a","1":11952,"type":"pvar"},"1":{"0":{"0":11953,"type":"pany"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"3":11950,"type":"pcon"},"1":{"0":"x","1":11954,"type":"evar"},"type":","},"1":{"type":"nil"},"type":"cons"},"1":{"0":{"0":"a","1":11956,"type":"evar"},"1":{"0":{"0":{"0":2,"1":11957,"type":"pint"},"1":11957,"type":"eprim"},"1":{"type":"nil"},"type":"cons"},"2":11955,"type":"eapp"},"2":11945,"type":"elet"},"2":11941,"type":"elambda"};
    const mod_17 = test(in_17);
    const out_17 = tapp(tapp(tcon("->")(11941))(tapp(tapp(tcon(",")(-1))(tapp(tapp(tcon("->")(11955))(tcon("int")(11957))(11955))(tvar("result:5")(11955))(11955))(-1))(tvar("b:2")(11950))(-1))(11941))(tvar("result:5")(11955))(11941);
    if (!equal(mod_17, out_17)) {
        console.log(mod_17);
        console.log(out_17);
        throw new Error(`Fixture test (4501) failing 17. Not equal.`);
    }
    

    const in_18 = {"0":{"0":{"0":",","1":12020,"2":{"0":{"0":"a","1":12022,"type":"pvar"},"1":{"0":{"0":12023,"type":"pany"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"3":12020,"type":"pcon"},"1":{"type":"nil"},"type":"cons"},"1":{"0":{"0":"a","1":12025,"type":"evar"},"1":{"0":{"0":{"0":2,"1":12026,"type":"pint"},"1":12026,"type":"eprim"},"1":{"type":"nil"},"type":"cons"},"2":12024,"type":"eapp"},"2":12016,"type":"elambda"};
    const mod_18 = test(in_18);
    const out_18 = tapp(tapp(tcon("->")(12016))(tapp(tapp(tcon(",")(-1))(tapp(tapp(tcon("->")(12024))(tcon("int")(12026))(12024))(tvar("result:4")(12024))(12024))(-1))(tvar("b:1")(12020))(-1))(12016))(tvar("result:4")(12024))(12016);
    if (!equal(mod_18, out_18)) {
        console.log(mod_18);
        console.log(out_18);
        throw new Error(`Fixture test (4501) failing 18. Not equal.`);
    }
    
}
return $eval("env_nil => add_stmt => get_type => type_to_string => infer_stmts => infer =>\n  ({type: 'fns', env_nil, add_stmt, get_type, type_to_string, infer_stmts, infer})\n")(builtin_env)(tenv$slmerge)(tenv$slresolve)(scheme_$gts)(add$slstmts)((env) => (expr) => forall(set$slnil)(run$slnil_$gt(infer$slexpr(env)(expr))))