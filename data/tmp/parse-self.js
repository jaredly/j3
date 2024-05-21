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
const nil = ({type: "nil"})
const cons = (v0) => (v1) => ({type: "cons", 0: v0, 1: v1})
const pint = (v0) => (v1) => ({type: "pint", 0: v0, 1: v1})
const pbool = (v0) => (v1) => ({type: "pbool", 0: v0, 1: v1})
const pany = (v0) => ({type: "pany", 0: v0})
const pvar = (v0) => (v1) => ({type: "pvar", 0: v0, 1: v1})
const pcon = (v0) => (v1) => (v2) => (v3) => ({type: "pcon", 0: v0, 1: v1, 2: v2, 3: v3})
const pstr = (v0) => (v1) => ({type: "pstr", 0: v0, 1: v1})
const pprim = (v0) => (v1) => ({type: "pprim", 0: v0, 1: v1})
const tvar = (v0) => (v1) => ({type: "tvar", 0: v0, 1: v1})
const tapp = (v0) => (v1) => (v2) => ({type: "tapp", 0: v0, 1: v1, 2: v2})
const tcon = (v0) => (v1) => ({type: "tcon", 0: v0, 1: v1})
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

const some = (v0) => ({type: "some", 0: v0})
const none = ({type: "none"})
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

const value = ({type: "value"})
const type = ({type: "type"})
const one = (v0) => ({type: "one", 0: v0})
const many = (v0) => ({type: "many", 0: v0})
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

const loop = (v) => (f) => f(v)((nv) => loop(nv)(f));

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

const usage = (v0) => ({type: "usage", 0: v0})
const decl = ({type: "decl"})
const $co = (v0) => (v1) => ({type: ",", 0: v0, 1: v1})
const snd = (tuple) => (({1: v}) => v)(tuple);

const fst = (tuple) => (({0: v}) => v)(tuple);

const cst$sllist = (v0) => (v1) => ({type: "cst/list", 0: v0, 1: v1})
const cst$slarray = (v0) => (v1) => ({type: "cst/array", 0: v0, 1: v1})
const cst$slspread = (v0) => (v1) => ({type: "cst/spread", 0: v0, 1: v1})
const cst$slid = (v0) => (v1) => ({type: "cst/id", 0: v0, 1: v1})
const cst$slstring = (v0) => (v1) => (v2) => ({type: "cst/string", 0: v0, 1: v1, 2: v2})
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

{
    const test = parse_type;
    
    const in_0 = {"0":{"0":{"0":"hi","1":5527,"type":"cst/id"},"1":{"0":{"0":"ho","1":5528,"type":"cst/id"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"1":5526,"type":"cst/list"};
    const mod_0 = test(in_0);
    const out_0 = tapp(tcon("hi")(5527))(tcon("ho")(5528))(5526);
    if (!equal(mod_0, out_0)) {
        console.log(mod_0);
        console.log(out_0);
        throw new Error(`Fixture test (5529) failing 0. Not equal.`);
    }
    

    const in_1 = {"0":{"0":{"0":"fn","1":5556,"type":"cst/id"},"1":{"0":{"0":{"0":{"0":"x","1":5558,"type":"cst/id"},"1":{"type":"nil"},"type":"cons"},"1":5557,"type":"cst/array"},"1":{"0":{"0":"y","1":5559,"type":"cst/id"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"type":"cons"},"1":5555,"type":"cst/list"};
    const mod_1 = test(in_1);
    const out_1 = tapp(tapp(tcon("->")(5555))(tcon("x")(5558))(5555))(tcon("y")(5559))(5555);
    if (!equal(mod_1, out_1)) {
        console.log(mod_1);
        console.log(out_1);
        throw new Error(`Fixture test (5529) failing 1. Not equal.`);
    }
    

    const in_2 = {"0":{"0":{"0":"fn","1":5686,"type":"cst/id"},"1":{"0":{"0":{"0":{"0":"a","1":5688,"type":"cst/id"},"1":{"0":{"0":"b","1":5689,"type":"cst/id"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"1":5687,"type":"cst/array"},"1":{"0":{"0":"c","1":5690,"type":"cst/id"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"type":"cons"},"1":5685,"type":"cst/list"};
    const mod_2 = test(in_2);
    const out_2 = tapp(tapp(tcon("->")(5685))(tcon("a")(5688))(5685))(tapp(tapp(tcon("->")(5685))(tcon("b")(5689))(5685))(tcon("c")(5690))(5685))(5685);
    if (!equal(mod_2, out_2)) {
        console.log(mod_2);
        console.log(out_2);
        throw new Error(`Fixture test (5529) failing 2. Not equal.`);
    }
    

    const in_3 = {"0":{"0":{"0":",","1":16610,"type":"cst/id"},"1":{"0":{"0":"a","1":16611,"type":"cst/id"},"1":{"0":{"0":"b","1":16612,"type":"cst/id"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"type":"cons"},"1":16609,"type":"cst/list"};
    const mod_3 = test(in_3);
    const out_3 = tapp(tapp(tcon(",")(16610))(tcon("a")(16611))(16609))(tcon("b")(16612))(16609);
    if (!equal(mod_3, out_3)) {
        console.log(mod_3);
        console.log(out_3);
        throw new Error(`Fixture test (5529) failing 3. Not equal.`);
    }
    

    const in_4 = {"0":{"0":{"0":",","1":16640,"type":"cst/id"},"1":{"0":{"0":"a","1":16643,"type":"cst/id"},"1":{"0":{"0":"b","1":16644,"type":"cst/id"},"1":{"0":{"0":"c","1":16645,"type":"cst/id"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"type":"cons"},"type":"cons"},"1":16639,"type":"cst/list"};
    const mod_4 = test(in_4);
    const out_4 = tapp(tapp(tcon(",")(16640))(tcon("a")(16643))(16639))(tapp(tapp(tcon(",")(16640))(tcon("b")(16644))(16639))(tcon("c")(16645))(16639))(16639);
    if (!equal(mod_4, out_4)) {
        console.log(mod_4);
        console.log(out_4);
        throw new Error(`Fixture test (5529) failing 4. Not equal.`);
    }
    
}
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

{
    const test = bag$slto_list;
    
    const in_0 = many(cons(empty)(cons(one(1))(cons(many(cons(one(2))(cons(empty)(nil))))(cons(one(10))(nil)))));
    const mod_0 = test(in_0);
    const out_0 = cons(1)(cons(2)(cons(10)(nil)));
    if (!equal(mod_0, out_0)) {
        console.log(mod_0);
        console.log(out_0);
        throw new Error(`Fixture test (6730) failing 0. Not equal.`);
    }
    
}
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
if ($target.type === "tapp") {
{
let one = $target[0];
let two = $target[1];
return bag$sland(externals_type(bound)(one))(externals_type(bound)(two))
}
}
throw new Error('Failed to match. ' + valueToString($target));
})(t);

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

{
    const test = parse_pat;
    
    const in_0 = {"0":"1","1":16818,"type":"cst/id"};
    const mod_0 = test(in_0);
    const out_0 = pprim(pint(1)(16818))(16818);
    if (!equal(mod_0, out_0)) {
        console.log(mod_0);
        console.log(out_0);
        throw new Error(`Fixture test (16808) failing 0. Not equal.`);
    }
    

    const in_1 = {"0":"a","1":16824,"type":"cst/id"};
    const mod_1 = test(in_1);
    const out_1 = pvar("a")(16824);
    if (!equal(mod_1, out_1)) {
        console.log(mod_1);
        console.log(out_1);
        throw new Error(`Fixture test (16808) failing 1. Not equal.`);
    }
    

    const in_2 = {"0":"_","1":16830,"type":"cst/id"};
    const mod_2 = test(in_2);
    const out_2 = pany(16830);
    if (!equal(mod_2, out_2)) {
        console.log(mod_2);
        console.log(out_2);
        throw new Error(`Fixture test (16808) failing 2. Not equal.`);
    }
    

    const in_3 = {"0":{"0":{"0":"some","1":16853,"type":"cst/id"},"1":{"0":{"0":"v","1":16854,"type":"cst/id"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"1":16852,"type":"cst/list"};
    const mod_3 = test(in_3);
    const out_3 = pcon("some")(16853)(cons(pvar("v")(16854))(nil))(16852);
    if (!equal(mod_3, out_3)) {
        console.log(mod_3);
        console.log(out_3);
        throw new Error(`Fixture test (16808) failing 3. Not equal.`);
    }
    

    const in_4 = {"0":{"type":"nil"},"1":16872,"type":"cst/array"};
    const mod_4 = test(in_4);
    const out_4 = pcon("nil")(16872)(nil)(16872);
    if (!equal(mod_4, out_4)) {
        console.log(mod_4);
        console.log(out_4);
        throw new Error(`Fixture test (16808) failing 4. Not equal.`);
    }
    

    const in_5 = {"0":{"0":{"0":"1","1":16886,"type":"cst/id"},"1":{"0":{"0":"2","1":16887,"type":"cst/id"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"1":16885,"type":"cst/array"};
    const mod_5 = test(in_5);
    const out_5 = pcon("cons")(16885)(cons(pprim(pint(1)(16886))(16886))(cons(pcon("cons")(16885)(cons(pprim(pint(2)(16887))(16887))(cons(pcon("nil")(16885)(nil)(16885))(nil)))(16885))(nil)))(16885);
    if (!equal(mod_5, out_5)) {
        console.log(mod_5);
        console.log(out_5);
        throw new Error(`Fixture test (16808) failing 5. Not equal.`);
    }
    

    const in_6 = {"0":{"0":{"0":"1","1":17004,"type":"cst/id"},"1":{"0":{"0":{"0":"b","1":17005,"type":"cst/id"},"1":17008,"type":"cst/spread"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"1":17003,"type":"cst/array"};
    const mod_6 = test(in_6);
    const out_6 = pcon("cons")(17003)(cons(pprim(pint(1)(17004))(17004))(cons(pvar("b")(17005))(nil)))(17003);
    if (!equal(mod_6, out_6)) {
        console.log(mod_6);
        console.log(out_6);
        throw new Error(`Fixture test (16808) failing 6. Not equal.`);
    }
    

    const in_7 = {"0":{"0":{"0":",","1":16929,"type":"cst/id"},"1":{"0":{"0":"1","1":16930,"type":"cst/id"},"1":{"0":{"0":"2","1":16931,"type":"cst/id"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"type":"cons"},"1":16928,"type":"cst/list"};
    const mod_7 = test(in_7);
    const out_7 = pcon(",")(16928)(cons(pprim(pint(1)(16930))(16930))(cons(pprim(pint(2)(16931))(16931))(nil)))(16928);
    if (!equal(mod_7, out_7)) {
        console.log(mod_7);
        console.log(out_7);
        throw new Error(`Fixture test (16808) failing 7. Not equal.`);
    }
    

    const in_8 = {"0":{"0":{"0":",","1":16959,"type":"cst/id"},"1":{"0":{"0":"1","1":16960,"type":"cst/id"},"1":{"0":{"0":"2","1":16961,"type":"cst/id"},"1":{"0":{"0":"3","1":16962,"type":"cst/id"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"type":"cons"},"type":"cons"},"1":16958,"type":"cst/list"};
    const mod_8 = test(in_8);
    const out_8 = pcon(",")(16958)(cons(pprim(pint(1)(16960))(16960))(cons(pcon(",")(16958)(cons(pprim(pint(2)(16961))(16961))(cons(pprim(pint(3)(16962))(16962))(nil)))(16958))(nil)))(16958);
    if (!equal(mod_8, out_8)) {
        console.log(mod_8);
        console.log(out_8);
        throw new Error(`Fixture test (16808) failing 8. Not equal.`);
    }
    
}
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

{
    const test = parse_top;
    
    const in_0 = {"0":{"0":{"0":"def","1":1301,"type":"cst/id"},"1":{"0":{"0":"a","1":1302,"type":"cst/id"},"1":{"0":{"0":"2","1":1303,"type":"cst/id"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"type":"cons"},"1":1300,"type":"cst/list"};
    const mod_0 = test(in_0);
    const out_0 = tdef("a")(1302)(eprim(pint(2)(1303))(1303))(1300);
    if (!equal(mod_0, out_0)) {
        console.log(mod_0);
        console.log(out_0);
        throw new Error(`Fixture test (684) failing 0. Not equal.`);
    }
    

    const in_1 = {"0":{"0":{"0":"typealias","1":6270,"type":"cst/id"},"1":{"0":{"0":"hello","1":6271,"type":"cst/id"},"1":{"0":{"0":{"0":{"0":",","1":6273,"type":"cst/id"},"1":{"0":{"0":"int","1":6274,"type":"cst/id"},"1":{"0":{"0":"string","1":6275,"type":"cst/id"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"type":"cons"},"1":6272,"type":"cst/list"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"type":"cons"},"1":6269,"type":"cst/list"};
    const mod_1 = test(in_1);
    const out_1 = ttypealias("hello")(6271)(nil)(tapp(tapp(tcon(",")(6273))(tcon("int")(6274))(6272))(tcon("string")(6275))(6272))(6269);
    if (!equal(mod_1, out_1)) {
        console.log(mod_1);
        console.log(out_1);
        throw new Error(`Fixture test (684) failing 1. Not equal.`);
    }
    

    const in_2 = {"0":{"0":{"0":"typealias","1":6335,"type":"cst/id"},"1":{"0":{"0":{"0":{"0":"hello","1":6337,"type":"cst/id"},"1":{"0":{"0":"t","1":6338,"type":"cst/id"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"1":6336,"type":"cst/list"},"1":{"0":{"0":{"0":{"0":",","1":6340,"type":"cst/id"},"1":{"0":{"0":"int","1":6341,"type":"cst/id"},"1":{"0":{"0":"t","1":6342,"type":"cst/id"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"type":"cons"},"1":6339,"type":"cst/list"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"type":"cons"},"1":6334,"type":"cst/list"};
    const mod_2 = test(in_2);
    const out_2 = ttypealias("hello")(6337)(cons($co("t")(6338))(nil))(tapp(tapp(tcon(",")(6340))(tcon("int")(6341))(6339))(tcon("t")(6342))(6339))(6334);
    if (!equal(mod_2, out_2)) {
        console.log(mod_2);
        console.log(out_2);
        throw new Error(`Fixture test (684) failing 2. Not equal.`);
    }
    

    const in_3 = {"0":{"0":{"0":"deftype","1":1334,"type":"cst/id"},"1":{"0":{"0":"what","1":1335,"type":"cst/id"},"1":{"0":{"0":{"0":{"0":"one","1":1337,"type":"cst/id"},"1":{"0":{"0":"int","1":1338,"type":"cst/id"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"1":1336,"type":"cst/list"},"1":{"0":{"0":{"0":{"0":"two","1":1340,"type":"cst/id"},"1":{"0":{"0":"bool","1":1341,"type":"cst/id"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"1":1339,"type":"cst/list"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"type":"cons"},"type":"cons"},"1":1333,"type":"cst/list"};
    const mod_3 = test(in_3);
    const out_3 = tdeftype("what")(1335)(nil)(cons($co("one")($co(1337)($co(cons(tcon("int")(1338))(nil))(1336))))(cons($co("two")($co(1340)($co(cons(tcon("bool")(1341))(nil))(1339))))(nil)))(1333);
    if (!equal(mod_3, out_3)) {
        console.log(mod_3);
        console.log(out_3);
        throw new Error(`Fixture test (684) failing 3. Not equal.`);
    }
    

    const in_4 = {"0":{"0":{"0":"deftype","1":1484,"type":"cst/id"},"1":{"0":{"0":{"0":{"0":"array","1":1486,"type":"cst/id"},"1":{"0":{"0":"a","1":1487,"type":"cst/id"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"1":1485,"type":"cst/list"},"1":{"0":{"0":{"0":{"0":"nil","1":1489,"type":"cst/id"},"1":{"type":"nil"},"type":"cons"},"1":1488,"type":"cst/list"},"1":{"0":{"0":{"0":{"0":"cons","1":1491,"type":"cst/id"},"1":{"0":{"0":{"0":{"0":"array","1":1493,"type":"cst/id"},"1":{"0":{"0":"a","1":1494,"type":"cst/id"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"1":1492,"type":"cst/list"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"1":1490,"type":"cst/list"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"type":"cons"},"type":"cons"},"1":1483,"type":"cst/list"};
    const mod_4 = test(in_4);
    const out_4 = tdeftype("array")(1486)(cons($co("a")(1487))(nil))(cons($co("nil")($co(1489)($co(nil)(1488))))(cons($co("cons")($co(1491)($co(cons(tapp(tcon("array")(1493))(tcon("a")(1494))(1492))(nil))(1490))))(nil)))(1483);
    if (!equal(mod_4, out_4)) {
        console.log(mod_4);
        console.log(out_4);
        throw new Error(`Fixture test (684) failing 4. Not equal.`);
    }
    

    const in_5 = {"0":{"0":{"0":"+","1":1969,"type":"cst/id"},"1":{"0":{"0":"1","1":1970,"type":"cst/id"},"1":{"0":{"0":"2","1":1971,"type":"cst/id"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"type":"cons"},"1":1968,"type":"cst/list"};
    const mod_5 = test(in_5);
    const out_5 = texpr(eapp(evar("+")(1969))(cons(eprim(pint(1)(1970))(1970))(cons(eprim(pint(2)(1971))(1971))(nil)))(1968))(1968);
    if (!equal(mod_5, out_5)) {
        console.log(mod_5);
        console.log(out_5);
        throw new Error(`Fixture test (684) failing 5. Not equal.`);
    }
    

    const in_6 = {"0":{"0":{"0":"defn","1":2050,"type":"cst/id"},"1":{"0":{"0":"a","1":2051,"type":"cst/id"},"1":{"0":{"0":{"0":{"0":"m","1":2055,"type":"cst/id"},"1":{"type":"nil"},"type":"cons"},"1":2052,"type":"cst/array"},"1":{"0":{"0":"m","1":2053,"type":"cst/id"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"type":"cons"},"type":"cons"},"1":2049,"type":"cst/list"};
    const mod_6 = test(in_6);
    const out_6 = tdef("a")(2051)(elambda(cons(pvar("m")(2055))(nil))(evar("m")(2053))(2049))(2049);
    if (!equal(mod_6, out_6)) {
        console.log(mod_6);
        console.log(out_6);
        throw new Error(`Fixture test (684) failing 6. Not equal.`);
    }
    
}
{
    const test = parse_expr;
    
    const in_0 = {"0":"true","1":1163,"type":"cst/id"};
    const mod_0 = test(in_0);
    const out_0 = eprim(pbool(true)(1163))(1163);
    if (!equal(mod_0, out_0)) {
        console.log(mod_0);
        console.log(out_0);
        throw new Error(`Fixture test (1111) failing 0. Not equal.`);
    }
    

    const in_1 = {"0":{"0":{"0":",","1":7621,"type":"cst/id"},"1":{"0":{"0":"1","1":7622,"type":"cst/id"},"1":{"0":{"0":"2","1":7623,"type":"cst/id"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"type":"cons"},"1":7620,"type":"cst/list"};
    const mod_1 = test(in_1);
    const out_1 = eapp(evar(",")(7621))(cons(eprim(pint(1)(7622))(7622))(cons(eprim(pint(2)(7623))(7623))(nil)))(7620);
    if (!equal(mod_1, out_1)) {
        console.log(mod_1);
        console.log(out_1);
        throw new Error(`Fixture test (1111) failing 1. Not equal.`);
    }
    

    const in_2 = {"0":{"0":{"0":",","1":7531,"type":"cst/id"},"1":{"0":{"0":"1","1":7532,"type":"cst/id"},"1":{"0":{"0":"2","1":7533,"type":"cst/id"},"1":{"0":{"0":"3","1":7534,"type":"cst/id"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"type":"cons"},"type":"cons"},"1":7530,"type":"cst/list"};
    const mod_2 = test(in_2);
    const out_2 = eapp(evar(",")(7531))(cons(eprim(pint(1)(7532))(7532))(cons(eapp(evar(",")(7531))(cons(eprim(pint(2)(7533))(7533))(cons(eprim(pint(3)(7534))(7534))(nil)))(7530))(nil)))(7530);
    if (!equal(mod_2, out_2)) {
        console.log(mod_2);
        console.log(out_2);
        throw new Error(`Fixture test (1111) failing 2. Not equal.`);
    }
    

    const in_3 = {"0":{"0":{"0":"match","1":7783,"type":"cst/id"},"1":{"0":{"0":"1","1":7784,"type":"cst/id"},"1":{"0":{"0":{"0":{"0":",","1":7786,"type":"cst/id"},"1":{"0":{"0":"1","1":7787,"type":"cst/id"},"1":{"0":{"0":"2","1":7788,"type":"cst/id"},"1":{"0":{"0":"3","1":7790,"type":"cst/id"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"type":"cons"},"type":"cons"},"1":7785,"type":"cst/list"},"1":{"0":{"0":"1","1":7791,"type":"cst/id"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"type":"cons"},"type":"cons"},"1":7782,"type":"cst/list"};
    const mod_3 = test(in_3);
    const out_3 = ematch(eprim(pint(1)(7784))(7784))(cons($co(pcon(",")(7785)(cons(pprim(pint(1)(7787))(7787))(cons(pcon(",")(7785)(cons(pprim(pint(2)(7788))(7788))(cons(pprim(pint(3)(7790))(7790))(nil)))(7785))(nil)))(7785))(eprim(pint(1)(7791))(7791)))(nil))(7782);
    if (!equal(mod_3, out_3)) {
        console.log(mod_3);
        console.log(out_3);
        throw new Error(`Fixture test (1111) failing 3. Not equal.`);
    }
    

    const in_4 = {"0":{"0":{"0":"1","1":3402,"type":"cst/id"},"1":{"0":{"0":{"0":"b","1":3403,"type":"cst/id"},"1":3406,"type":"cst/spread"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"1":3401,"type":"cst/array"};
    const mod_4 = test(in_4);
    const out_4 = eapp(evar("cons")(3401))(cons(eprim(pint(1)(3402))(3402))(cons(evar("b")(3403))(nil)))(3401);
    if (!equal(mod_4, out_4)) {
        console.log(mod_4);
        console.log(out_4);
        throw new Error(`Fixture test (1111) failing 4. Not equal.`);
    }
    

    const in_5 = {"0":"hi","1":{"type":"nil"},"2":1177,"type":"cst/string"};
    const mod_5 = test(in_5);
    const out_5 = estr("hi")(nil)(1177);
    if (!equal(mod_5, out_5)) {
        console.log(mod_5);
        console.log(out_5);
        throw new Error(`Fixture test (1111) failing 5. Not equal.`);
    }
    

    const in_6 = {"0":{"0":{"0":"@t","1":5332,"type":"cst/id"},"1":{"0":{"0":"a","1":5333,"type":"cst/id"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"1":5331,"type":"cst/list"};
    const mod_6 = test(in_6);
    const out_6 = equot(quot$sltype(tcon("a")(5333)))(5331);
    if (!equal(mod_6, out_6)) {
        console.log(mod_6);
        console.log(out_6);
        throw new Error(`Fixture test (1111) failing 6. Not equal.`);
    }
    

    const in_7 = {"0":{"0":{"0":"@t","1":5362,"type":"cst/id"},"1":{"0":{"0":{"0":{"0":"a","1":5364,"type":"cst/id"},"1":{"0":{"0":"b","1":5365,"type":"cst/id"},"1":{"0":{"0":"c","1":5366,"type":"cst/id"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"type":"cons"},"1":5363,"type":"cst/list"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"1":5360,"type":"cst/list"};
    const mod_7 = test(in_7);
    const out_7 = equot(quot$sltype(tapp(tapp(tcon("a")(5364))(tcon("b")(5365))(5363))(tcon("c")(5366))(5363)))(5360);
    if (!equal(mod_7, out_7)) {
        console.log(mod_7);
        console.log(out_7);
        throw new Error(`Fixture test (1111) failing 7. Not equal.`);
    }
    

    const in_8 = {"0":{"0":{"0":"@p","1":5348,"type":"cst/id"},"1":{"0":{"0":"_","1":5349,"type":"cst/id"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"1":5346,"type":"cst/list"};
    const mod_8 = test(in_8);
    const out_8 = equot(quot$slpat(pany(5349)))(5346);
    if (!equal(mod_8, out_8)) {
        console.log(mod_8);
        console.log(out_8);
        throw new Error(`Fixture test (1111) failing 8. Not equal.`);
    }
    

    const in_9 = {"0":{"0":{"0":"if","1":4620,"type":"cst/id"},"1":{"0":{"0":{"0":{"0":"=","1":4622,"type":"cst/id"},"1":{"0":{"0":"a","1":4623,"type":"cst/id"},"1":{"0":{"0":"b","1":4624,"type":"cst/id"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"type":"cons"},"1":4621,"type":"cst/list"},"1":{"0":{"0":"a","1":4625,"type":"cst/id"},"1":{"0":{"0":"b","1":4626,"type":"cst/id"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"type":"cons"},"type":"cons"},"1":4619,"type":"cst/list"};
    const mod_9 = test(in_9);
    const out_9 = ematch(eapp(evar("=")(4622))(cons(evar("a")(4623))(cons(evar("b")(4624))(nil)))(4621))(cons($co(pprim(pbool(true)(4619))(4619))(evar("a")(4625)))(cons($co(pany(4619))(evar("b")(4626)))(nil)))(4619);
    if (!equal(mod_9, out_9)) {
        console.log(mod_9);
        console.log(out_9);
        throw new Error(`Fixture test (1111) failing 9. Not equal.`);
    }
    

    const in_10 = {"0":"a","1":{"0":{"0":{"0":"1","1":3610,"type":"cst/id"},"1":{"0":"b","1":3611,"type":","},"type":","},"1":{"type":"nil"},"type":"cons"},"2":3608,"type":"cst/string"};
    const mod_10 = test(in_10);
    const out_10 = estr("a")(cons($co(eprim(pint(1)(3610))(3610))($co("b")(3611)))(nil))(3608);
    if (!equal(mod_10, out_10)) {
        console.log(mod_10);
        console.log(out_10);
        throw new Error(`Fixture test (1111) failing 10. Not equal.`);
    }
    

    const in_11 = {"0":{"0":{"0":"1","1":3239,"type":"cst/id"},"1":{"0":{"0":"2","1":3240,"type":"cst/id"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"1":3238,"type":"cst/array"};
    const mod_11 = test(in_11);
    const out_11 = eapp(evar("cons")(3238))(cons(eprim(pint(1)(3239))(3239))(cons(eapp(evar("cons")(3238))(cons(eprim(pint(2)(3240))(3240))(cons(evar("nil")(3238))(nil)))(3238))(nil)))(3238);
    if (!equal(mod_11, out_11)) {
        console.log(mod_11);
        console.log(out_11);
        throw new Error(`Fixture test (1111) failing 11. Not equal.`);
    }
    

    const in_12 = {"0":"12","1":1188,"type":"cst/id"};
    const mod_12 = test(in_12);
    const out_12 = eprim(pint(12)(1188))(1188);
    if (!equal(mod_12, out_12)) {
        console.log(mod_12);
        console.log(out_12);
        throw new Error(`Fixture test (1111) failing 12. Not equal.`);
    }
    

    const in_13 = {"0":{"0":{"0":"match","1":2996,"type":"cst/id"},"1":{"0":{"0":"2","1":2997,"type":"cst/id"},"1":{"0":{"0":"1","1":2998,"type":"cst/id"},"1":{"0":{"0":"2","1":2999,"type":"cst/id"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"type":"cons"},"type":"cons"},"1":2995,"type":"cst/list"};
    const mod_13 = test(in_13);
    const out_13 = ematch(eprim(pint(2)(2997))(2997))(cons($co(pprim(pint(1)(2998))(2998))(eprim(pint(2)(2999))(2999)))(nil))(2995);
    if (!equal(mod_13, out_13)) {
        console.log(mod_13);
        console.log(out_13);
        throw new Error(`Fixture test (1111) failing 13. Not equal.`);
    }
    

    const in_14 = {"0":"abc","1":1200,"type":"cst/id"};
    const mod_14 = test(in_14);
    const out_14 = evar("abc")(1200);
    if (!equal(mod_14, out_14)) {
        console.log(mod_14);
        console.log(out_14);
        throw new Error(`Fixture test (1111) failing 14. Not equal.`);
    }
    

    const in_15 = {"0":{"0":{"0":"let","1":4454,"type":"cst/id"},"1":{"0":{"0":{"0":{"0":"a","1":4456,"type":"cst/id"},"1":{"0":{"0":"1","1":4457,"type":"cst/id"},"1":{"0":{"0":"b","1":4458,"type":"cst/id"},"1":{"0":{"0":"2","1":4459,"type":"cst/id"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"type":"cons"},"type":"cons"},"1":4455,"type":"cst/array"},"1":{"0":{"0":"a","1":4460,"type":"cst/id"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"type":"cons"},"1":4453,"type":"cst/list"};
    const mod_15 = test(in_15);
    const out_15 = elet(cons($co(pvar("a")(4456))(eprim(pint(1)(4457))(4457)))(cons($co(pvar("b")(4458))(eprim(pint(2)(4459))(4459)))(nil)))(evar("a")(4460))(4453);
    if (!equal(mod_15, out_15)) {
        console.log(mod_15);
        console.log(out_15);
        throw new Error(`Fixture test (1111) failing 15. Not equal.`);
    }
    

    const in_16 = {"0":{"0":{"0":"let->","1":6213,"type":"cst/id"},"1":{"0":{"0":{"0":{"0":"v","1":6215,"type":"cst/id"},"1":{"0":{"0":"hi","1":6216,"type":"cst/id"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"1":6214,"type":"cst/array"},"1":{"0":{"0":"v2","1":6217,"type":"cst/id"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"type":"cons"},"1":6212,"type":"cst/list"};
    const mod_16 = test(in_16);
    const out_16 = eapp(evar(">>=")(6213))(cons(evar("hi")(6216))(cons(elambda(cons(pvar("v")(6215))(nil))(evar("v2")(6217))(6212))(nil)))(6212);
    if (!equal(mod_16, out_16)) {
        console.log(mod_16);
        console.log(out_16);
        throw new Error(`Fixture test (1111) failing 16. Not equal.`);
    }
    

    const in_17 = {"0":{"0":{"0":"fn","1":1236,"type":"cst/id"},"1":{"0":{"0":{"0":{"0":"a","1":1238,"type":"cst/id"},"1":{"type":"nil"},"type":"cons"},"1":1237,"type":"cst/array"},"1":{"0":{"0":"1","1":1239,"type":"cst/id"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"type":"cons"},"1":1235,"type":"cst/list"};
    const mod_17 = test(in_17);
    const out_17 = elambda(cons(pvar("a")(1238))(nil))(eprim(pint(1)(1239))(1239))(1235);
    if (!equal(mod_17, out_17)) {
        console.log(mod_17);
        console.log(out_17);
        throw new Error(`Fixture test (1111) failing 17. Not equal.`);
    }
    

    const in_18 = {"0":{"0":{"0":"fn","1":1254,"type":"cst/id"},"1":{"0":{"0":{"0":{"0":"a","1":1256,"type":"cst/id"},"1":{"0":{"0":"b","1":1257,"type":"cst/id"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"1":1255,"type":"cst/array"},"1":{"0":{"0":"2","1":1258,"type":"cst/id"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"type":"cons"},"1":1253,"type":"cst/list"};
    const mod_18 = test(in_18);
    const out_18 = elambda(cons(pvar("a")(1256))(cons(pvar("b")(1257))(nil)))(eprim(pint(2)(1258))(1258))(1253);
    if (!equal(mod_18, out_18)) {
        console.log(mod_18);
        console.log(out_18);
        throw new Error(`Fixture test (1111) failing 18. Not equal.`);
    }
    

    const in_19 = {"0":{"0":{"0":"fn","1":1909,"type":"cst/id"},"1":{"0":{"0":{"0":{"0":{"0":{"0":",","1":1912,"type":"cst/id"},"1":{"0":{"0":"a","1":1913,"type":"cst/id"},"1":{"0":{"0":"b","1":1914,"type":"cst/id"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"type":"cons"},"1":1911,"type":"cst/list"},"1":{"type":"nil"},"type":"cons"},"1":1910,"type":"cst/array"},"1":{"0":{"0":"a","1":1915,"type":"cst/id"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"type":"cons"},"1":1908,"type":"cst/list"};
    const mod_19 = test(in_19);
    const out_19 = elambda(cons(pcon(",")(1911)(cons(pvar("a")(1913))(cons(pvar("b")(1914))(nil)))(1911))(nil))(evar("a")(1915))(1908);
    if (!equal(mod_19, out_19)) {
        console.log(mod_19);
        console.log(out_19);
        throw new Error(`Fixture test (1111) failing 19. Not equal.`);
    }
    

    const in_20 = {"0":{"0":{"0":"+","1":1519,"type":"cst/id"},"1":{"0":{"0":"1","1":1520,"type":"cst/id"},"1":{"0":{"0":"2","1":1521,"type":"cst/id"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"type":"cons"},"1":1288,"type":"cst/list"};
    const mod_20 = test(in_20);
    const out_20 = eapp(evar("+")(1519))(cons(eprim(pint(1)(1520))(1520))(cons(eprim(pint(2)(1521))(1521))(nil)))(1288);
    if (!equal(mod_20, out_20)) {
        console.log(mod_20);
        console.log(out_20);
        throw new Error(`Fixture test (1111) failing 20. Not equal.`);
    }
    

    const in_21 = {"0":{"0":{"0":"int-to-string","1":1615,"type":"cst/id"},"1":{"0":{"0":"23","1":1616,"type":"cst/id"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"1":1614,"type":"cst/list"};
    const mod_21 = test(in_21);
    const out_21 = eapp(evar("int-to-string")(1615))(cons(eprim(pint(23)(1616))(1616))(nil))(1614);
    if (!equal(mod_21, out_21)) {
        console.log(mod_21);
        console.log(out_21);
        throw new Error(`Fixture test (1111) failing 21. Not equal.`);
    }
    

    const in_22 = {"0":{"0":{"0":"let","1":1677,"type":"cst/id"},"1":{"0":{"0":{"0":{"0":"x","1":1679,"type":"cst/id"},"1":{"0":{"0":"2","1":1680,"type":"cst/id"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"1":1678,"type":"cst/array"},"1":{"0":{"0":"x","1":1681,"type":"cst/id"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"type":"cons"},"1":1676,"type":"cst/list"};
    const mod_22 = test(in_22);
    const out_22 = elet(cons($co(pvar("x")(1679))(eprim(pint(2)(1680))(1680)))(nil))(evar("x")(1681))(1676);
    if (!equal(mod_22, out_22)) {
        console.log(mod_22);
        console.log(out_22);
        throw new Error(`Fixture test (1111) failing 22. Not equal.`);
    }
    

    const in_23 = {"0":{"0":{"0":"let","1":1790,"type":"cst/id"},"1":{"0":{"0":{"0":{"0":{"0":{"0":",","1":1793,"type":"cst/id"},"1":{"0":{"0":"a","1":1794,"type":"cst/id"},"1":{"0":{"0":"b","1":1795,"type":"cst/id"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"type":"cons"},"1":1792,"type":"cst/list"},"1":{"0":{"0":{"0":{"0":",","1":1797,"type":"cst/id"},"1":{"0":{"0":"2","1":1798,"type":"cst/id"},"1":{"0":{"0":"3","1":1799,"type":"cst/id"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"type":"cons"},"1":1796,"type":"cst/list"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"1":1791,"type":"cst/array"},"1":{"0":{"0":"1","1":1800,"type":"cst/id"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"type":"cons"},"1":1789,"type":"cst/list"};
    const mod_23 = test(in_23);
    const out_23 = elet(cons($co(pcon(",")(1792)(cons(pvar("a")(1794))(cons(pvar("b")(1795))(nil)))(1792))(eapp(evar(",")(1797))(cons(eprim(pint(2)(1798))(1798))(cons(eprim(pint(3)(1799))(1799))(nil)))(1796)))(nil))(eprim(pint(1)(1800))(1800))(1789);
    if (!equal(mod_23, out_23)) {
        console.log(mod_23);
        console.log(out_23);
        throw new Error(`Fixture test (1111) failing 23. Not equal.`);
    }
    

    const in_24 = {"0":{"0":{"0":"@@","1":3109,"type":"cst/id"},"1":{"0":{"0":"1","1":3110,"type":"cst/id"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"1":3108,"type":"cst/list"};
    const mod_24 = test(in_24);
    const out_24 = equot(quot$slquot(cst$slid("1")(3110)))(3108);
    if (!equal(mod_24, out_24)) {
        console.log(mod_24);
        console.log(out_24);
        throw new Error(`Fixture test (1111) failing 24. Not equal.`);
    }
    

    const in_25 = {"0":{"0":{"0":"@","1":3123,"type":"cst/id"},"1":{"0":{"0":"1","1":3124,"type":"cst/id"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"1":3122,"type":"cst/list"};
    const mod_25 = test(in_25);
    const out_25 = equot(quot$slexpr(eprim(pint(1)(3124))(3124)))(3122);
    if (!equal(mod_25, out_25)) {
        console.log(mod_25);
        console.log(out_25);
        throw new Error(`Fixture test (1111) failing 25. Not equal.`);
    }
    
}
const parse_and_compile = (v0) => (v1) => (v2) => (v3) => (v4) => ({type: "parse-and-compile", 0: v0, 1: v1, 2: v2, 3: v3, 4: v4})
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

{
    const test = (x) => bag$slto_list(externals(set$slfrom_list(cons("+")(cons("-")(cons("cons")(cons("nil")(nil))))))(x));
    
    const in_0 = parse_expr({"0":"hi","1":7036,"type":"cst/id"});
    const mod_0 = test(in_0);
    const out_0 = cons($co("hi")($co(value)(7036)))(nil);
    if (!equal(mod_0, out_0)) {
        console.log(mod_0);
        console.log(out_0);
        throw new Error(`Fixture test (7013) failing 0. Not equal.`);
    }
    

    const in_1 = parse_expr({"0":{"0":{"0":"1","1":7050,"type":"cst/id"},"1":{"0":{"0":"2","1":7051,"type":"cst/id"},"1":{"0":{"0":"c","1":7052,"type":"cst/id"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"type":"cons"},"1":7049,"type":"cst/array"});
    const mod_1 = test(in_1);
    const out_1 = cons($co("c")($co(value)(7052)))(nil);
    if (!equal(mod_1, out_1)) {
        console.log(mod_1);
        console.log(out_1);
        throw new Error(`Fixture test (7013) failing 1. Not equal.`);
    }
    

    const in_2 = parse_expr({"0":{"0":{"0":"one","1":7066,"type":"cst/id"},"1":{"0":{"0":"two","1":7067,"type":"cst/id"},"1":{"0":{"0":"three","1":7068,"type":"cst/id"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"type":"cons"},"1":7065,"type":"cst/list"});
    const mod_2 = test(in_2);
    const out_2 = cons($co("one")($co(value)(7066)))(cons($co("two")($co(value)(7067)))(cons($co("three")($co(value)(7068)))(nil)));
    if (!equal(mod_2, out_2)) {
        console.log(mod_2);
        console.log(out_2);
        throw new Error(`Fixture test (7013) failing 2. Not equal.`);
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

{
    const test = (x) => externals_top(parse_top(x));
    
    const in_0 = {"0":{"0":{"0":"def","1":16446,"type":"cst/id"},"1":{"0":{"0":"x","1":16447,"type":"cst/id"},"1":{"0":{"0":"10","1":16448,"type":"cst/id"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"type":"cons"},"1":16434,"type":"cst/list"};
    const mod_0 = test(in_0);
    const out_0 = nil;
    if (!equal(mod_0, out_0)) {
        console.log(mod_0);
        console.log(out_0);
        throw new Error(`Fixture test (16417) failing 0. Not equal.`);
    }
    

    const in_1 = {"0":{"0":{"0":"deftype","1":16456,"type":"cst/id"},"1":{"0":{"0":"hi","1":16457,"type":"cst/id"},"1":{"0":{"0":{"0":{"0":"one","1":16459,"type":"cst/id"},"1":{"0":{"0":"int","1":16460,"type":"cst/id"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"1":16458,"type":"cst/list"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"type":"cons"},"1":16455,"type":"cst/list"};
    const mod_1 = test(in_1);
    const out_1 = cons($co("int")($co(type)(16460)))(nil);
    if (!equal(mod_1, out_1)) {
        console.log(mod_1);
        console.log(out_1);
        throw new Error(`Fixture test (16417) failing 1. Not equal.`);
    }
    

    const in_2 = {"0":{"0":{"0":"typealias","1":16478,"type":"cst/id"},"1":{"0":{"0":"lol","1":16479,"type":"cst/id"},"1":{"0":{"0":"int","1":16480,"type":"cst/id"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"type":"cons"},"1":16474,"type":"cst/list"};
    const mod_2 = test(in_2);
    const out_2 = cons($co("int")($co(type)(16480)))(nil);
    if (!equal(mod_2, out_2)) {
        console.log(mod_2);
        console.log(out_2);
        throw new Error(`Fixture test (16417) failing 2. Not equal.`);
    }
    
}
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
return foldl($co(nil)(one(global(name)(type)(l)(usage($unit)))))(map(args)(pat$slnames))(bound_and_names)
}
}
throw new Error('Failed to match. ' + valueToString($target));
})(pat);

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

return $eval("({0: parse_stmt,  1: parse_expr, 2: names, 3: externals_stmt, 4: externals_expr}) => all_names =>\n  ({type: 'fns', parse_stmt, parse_expr, names, externals_stmt, externals_expr, all_names})")(parse_and_compile(parse_top)(parse_expr)(names)(externals_top)((expr) => bag$slto_list(externals(set$slnil)(expr))))(top$slnames)