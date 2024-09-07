// built by parse-1-args.js:jcst.js:algw-list.js on 6/26/2024, 6:16:51 AM

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
let loop = (v) => (f) => f(v)((nv) => loop(nv)(f))
let force = (x) => (($target) => {
if ($target.type === "some") {
let x = $target[0];
return x
} ;
return fatal("Option is None");
throw new Error('match fail 9781:' + JSON.stringify($target))
})(x)
let fold_ex_pat = (init) => (pat) => (f) => (($target) => {
return f(init)(pat);
throw new Error('match fail 10758:' + JSON.stringify($target))
})(pat)
let ok = (v0) => ({type: "ok", 0: v0})
let err = (v0) => ({type: "err", 0: v0})
let $co = (v0) => (v1) => ({type: ",", 0: v0, 1: v1})
let rrecord = {type: "rrecord"}
let renum = {type: "renum"}
let is_some = (v) => (($target) => {
if ($target.type === "some") {
return true
} ;
return false;
throw new Error('match fail 15114:' + JSON.stringify($target))
})(v)
let not = (x) => (($target) => {
if ($target === true) {
return false
} ;
return true;
throw new Error('match fail 15150:' + JSON.stringify($target))
})(x)
let starts_with = $eval("(prefix) => (str) => str.startsWith(prefix)")
let minf = (v0) => ({type: "minf", 0: v0})
let mname = (v0) => ({type: "mname", 0: v0})
let mopen = (v0) => ({type: "mopen", 0: v0})
let map$slupdate = (map) => (key) => (f) => map$slset(map)(key)(f(map$slget(map)(key)))
let map$slopt = (f) => (v) => (($target) => {
if ($target.type === "none") {
return none
} ;
if ($target.type === "some") {
let v = $target[0];
return some(f(v))
} ;
throw new Error('match fail 18313:' + JSON.stringify($target))
})(v)
let dot = (f) => (g) => (x) => f(g(x))
let is_earmuffs = $eval("v => v.startsWith('*') && v.endsWith('*')")
let type_vbl_items = "abcdefghijklmnopqrstuvwxyz"
let str_idx = $eval("s => i => s[i]")
let cons = (v0) => (v1) => ({type: "cons", 0: v0, 1: v1})
let nil = {type: "nil"}
let pany = (v0) => ({type: "pany", 0: v0})
let pvar = (v0) => (v1) => ({type: "pvar", 0: v0, 1: v1})
let pcon = (v0) => (v1) => (v2) => (v3) => ({type: "pcon", 0: v0, 1: v1, 2: v2, 3: v3})
let pstr = (v0) => (v1) => ({type: "pstr", 0: v0, 1: v1})
let pprim = (v0) => (v1) => ({type: "pprim", 0: v0, 1: v1})
let precord = (v0) => (v1) => (v2) => ({type: "precord", 0: v0, 1: v1, 2: v2})
let penum = (v0) => (v1) => (v2) => (v3) => ({type: "penum", 0: v0, 1: v1, 2: v2, 3: v3})
let cst$sllist = (v0) => (v1) => ({type: "cst/list", 0: v0, 1: v1})
let cst$slarray = (v0) => (v1) => ({type: "cst/array", 0: v0, 1: v1})
let cst$slrecord = (v0) => (v1) => ({type: "cst/record", 0: v0, 1: v1})
let cst$slspread = (v0) => (v1) => ({type: "cst/spread", 0: v0, 1: v1})
let cst$slid = (v0) => (v1) => ({type: "cst/id", 0: v0, 1: v1})
let cst$slstring = (v0) => (v1) => (v2) => ({type: "cst/string", 0: v0, 1: v1, 2: v2})
let foldr = (init) => (items) => (f) => (($target) => {
if ($target.type === "nil") {
return init
} ;
if ($target.type === "cons") {
let one = $target[0];
let rest = $target[1];
return f(foldr(init)(rest)(f))(one)
} ;
throw new Error('match fail 428:' + JSON.stringify($target))
})(items)
let map = (f) => (values) => (($target) => {
if ($target.type === "nil") {
return nil
} ;
if ($target.type === "cons") {
let one = $target[0];
let rest = $target[1];
return cons(f(one))(map(f)(rest))
} ;
throw new Error('match fail 477:' + JSON.stringify($target))
})(values)
let map_without = (map) => (set) => foldr(map)(set$slto_list(set))(map$slrm)
let StateT = (v0) => ({type: "StateT", 0: v0})
let run_$gt = ({"0": f}) => (state) => {
let {"1": result, "0": {"1": {"0": substs}}} = f(state);
return result
}
let $gt$gt$eq = ({"0": f}) => (next) => StateT((state) => (($target) => {
if ($target.type === ",") {
let state = $target[0];
if ($target[1].type === "err") {
let e = $target[1][0];
return $co(state)(err(e))
} 
} ;
if ($target.type === ",") {
let state = $target[0];
if ($target[1].type === "ok") {
let v = $target[1][0];
{
let {"0": fnext} = next(v);
return fnext(state)
}
} 
} ;
throw new Error('match fail 11500:' + JSON.stringify($target))
})(f(state)))
let $lt_ = (x) => StateT((state) => $co(state)(ok(x)))
let $lt_state = StateT((state) => $co(state)(ok(state)))
let state_$gt = (v) => StateT((old) => $co(v)(ok(old)))
let map_$gt = (f) => (arr) => (($target) => {
if ($target.type === "nil") {
return $lt_(nil)
} ;
if ($target.type === "cons") {
let one = $target[0];
let rest = $target[1];
return $gt$gt$eq(f(one))((one) => $gt$gt$eq(map_$gt(f)(rest))((rest) => $lt_(cons(one)(rest))))
} ;
throw new Error('match fail 1224:' + JSON.stringify($target))
})(arr)
let do_$gt = (f) => (arr) => (($target) => {
if ($target.type === "nil") {
return $lt_($unit)
} ;
if ($target.type === "cons") {
let one = $target[0];
let rest = $target[1];
return $gt$gt$eq(f(one))((_1271) => $gt$gt$eq(do_$gt(f)(rest))((_1271) => $lt_($unit)))
} ;
throw new Error('match fail 1260:' + JSON.stringify($target))
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
throw new Error('match fail 1372:' + JSON.stringify($target))
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
throw new Error('match fail 1404:' + JSON.stringify($target))
})(values)
let $lt_subst = $gt$gt$eq($lt_state)(({"1": {"0": subst}}) => $lt_(subst))
let reset_state_$gt = $gt$gt$eq($lt_state)(({"1": {"1": types}}) => $gt$gt$eq(state_$gt($co(0)($co(map$slnil)(types))))((_1524) => $lt_($unit)))
let $lt_next_idx = $gt$gt$eq($lt_state)(({"1": {"1": types, "0": subst}, "0": idx}) => $gt$gt$eq(state_$gt($co(idx + 1)($co(subst)(types))))((_1548) => $lt_(idx)))
let subst_reset_$gt = (new_subst) => $gt$gt$eq($lt_state)(({"1": {"1": types, "0": old_subst}, "0": idx}) => $gt$gt$eq(state_$gt($co(idx)($co(new_subst)(types))))((_1610) => $lt_(old_subst)))
let state$slnil = $co(0)($co(map$slnil)(nil))
let run$slnil_$gt = (st) => run_$gt(st)(state$slnil)
let one_subst = ($var) => (type) => map$slfrom_list(cons($co($var)(type))(nil))
let apply_$gt = (f) => (arg) => $gt$gt$eq($lt_subst)((subst) => $lt_(f(subst)(arg)))
let foldl = (init) => (items) => (f) => (($target) => {
if ($target.type === "nil") {
return init
} ;
if ($target.type === "cons") {
let one = $target[0];
let rest = $target[1];
return foldl(f(init)(one))(rest)(f)
} ;
throw new Error('match fail 2500:' + JSON.stringify($target))
})(items)
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
let one = $target[0][0];
let rest = $target[0][1];
if ($target[1].type === "cons") {
let two = $target[1][0];
let trest = $target[1][1];
return cons($co(one)(two))(zip(rest)(trest))
} 
} 
} ;
return fatal("Cant zip lists of unequal length");
throw new Error('match fail 3621:' + JSON.stringify($target))
})($co(one)(two))
let unzip = (zipped) => (($target) => {
if ($target.type === "nil") {
return $co(nil)(nil)
} ;
if ($target.type === "cons") {
if ($target[0].type === ",") {
let a = $target[0][0];
let b = $target[0][1];
let rest = $target[1];
{
let {"1": two, "0": one} = unzip(rest);
return $co(cons(a)(one))(cons(b)(two))
}
} 
} ;
throw new Error('match fail 4207:' + JSON.stringify($target))
})(zipped)
let fst = ({"0": a}) => a
let length = (v) => (($target) => {
if ($target.type === "nil") {
return 0
} ;
if ($target.type === "cons") {
let rest = $target[1];
return 1 + length(rest)
} ;
throw new Error('match fail 5562:' + JSON.stringify($target))
})(v)
let reverse = (lst) => loop($co(lst)(nil))(({"1": coll, "0": lst}) => (recur) => (($target) => {
if ($target.type === "nil") {
return coll
} ;
if ($target.type === "cons") {
let one = $target[0];
let rest = $target[1];
return recur($co(rest)(cons(one)(coll)))
} ;
throw new Error('match fail 5895:' + JSON.stringify($target))
})(lst))
let join = (sep) => (lst) => (($target) => {
if ($target.type === "nil") {
return ""
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
return `${one}${sep}${join(sep)(rest)}`
} ;
throw new Error('match fail 6314:' + JSON.stringify($target))
})(lst)
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
let lists = $target[1];
return cons(one)(concat(cons(rest)(lists)))
} 
} ;
throw new Error('match fail 9447:' + JSON.stringify($target))
})(lists)
let any = (f) => (lst) => (($target) => {
if ($target.type === "nil") {
return false
} ;
if ($target.type === "cons") {
let one = $target[0];
let rest = $target[1];
{
let $target = f(one);
if ($target === true) {
return true
} ;
return any(f)(rest);
throw new Error('match fail 10481:' + JSON.stringify($target))
}
} ;
throw new Error('match fail 10466:' + JSON.stringify($target))
})(lst)
let fold_ex_pats = (init) => (pats) => (f) => foldl(init)(pats)((init) => (pat) => fold_ex_pat(init)(pat)(f))
let $lt_err$ti = (x) => StateT((state) => $co(state)(err(x)))
let map_err_$gt = ({"0": f}) => (next) => StateT((state) => (($target) => {
if ($target.type === ",") {
let state = $target[0];
if ($target[1].type === "err") {
let e = $target[1][0];
return $co(state)(next(e))
} 
} ;
if ($target.type === ",") {
let state = $target[0];
if ($target[1].type === "ok") {
let v = $target[1][0];
return $co(state)(ok(v))
} 
} ;
throw new Error('match fail 12357:' + JSON.stringify($target))
})(f(state)))
let state_f = ({"0": f}) => f
let record_type_$gt = (type) => (loc) => (dont_subst) => $gt$gt$eq($lt_state)(({"1": {"1": types, "0": subst}, "0": idx}) => $gt$gt$eq(state_$gt($co(idx)($co(subst)(cons($co(type)($co(loc)(dont_subst)))(types)))))((_12816) => $lt_($unit)))
let filter = (f) => (lst) => (($target) => {
if ($target.type === "nil") {
return nil
} ;
if ($target.type === "cons") {
let one = $target[0];
let rest = $target[1];
{
let $target = f(one);
if ($target === true) {
return cons(one)(filter(f)(rest))
} ;
return filter(f)(rest);
throw new Error('match fail 15006:' + JSON.stringify($target))
}
} ;
throw new Error('match fail 14995:' + JSON.stringify($target))
})(lst)
let partition = (f) => (lst) => loop($co(lst)($co(nil)(nil)))(({"1": {"1": no, "0": yes}, "0": lst}) => (recur) => (($target) => {
if ($target.type === "nil") {
return $co(yes)(no)
} ;
if ($target.type === "cons") {
let one = $target[0];
let rest = $target[1];
{
let $target = f(one);
if ($target === true) {
return recur($co(rest)($co(cons(one)(yes))(no)))
} ;
return recur($co(rest)($co(yes)(cons(one)(no))));
throw new Error('match fail 15061:' + JSON.stringify($target))
}
} ;
throw new Error('match fail 15047:' + JSON.stringify($target))
})(lst))
let partition_keys = (map1) => (map2) => {
let {"1": unique, "0": shared} = loop($co(map$slto_list(map1))($co(nil)(nil)))(({"1": {"1": unique, "0": shared}, "0": items}) => (recur) => (($target) => {
if ($target.type === "nil") {
return $co(shared)(unique)
} ;
if ($target.type === "cons") {
if ($target[0].type === ",") {
let key = $target[0][0];
let value = $target[0][1];
let rest = $target[1];
{
let $target = map$slget(map2)(key);
if ($target.type === "some") {
let value2 = $target[0];
return recur($co(rest)($co(cons($co(key)($co(value)(value2)))(shared))(unique)))
} ;
return recur($co(rest)($co(shared)(cons($co(key)(value))(unique))));
throw new Error('match fail 15253:' + JSON.stringify($target))
}
} 
} ;
throw new Error('match fail 15234:' + JSON.stringify($target))
})(items));
return $co(unique)($co(shared)(foldl(nil)(map$slto_list(map2))((unique) => ({"1": value, "0": key}) => (($target) => {
if ($target.type === "none") {
return cons($co(key)(value))(unique)
} ;
return unique;
throw new Error('match fail 15314:' + JSON.stringify($target))
})(map$slget(map1)(key)))))
}
let wrap_ok = (t) => $gt$gt$eq(t)((v) => $lt_(some(v)))
let ginf = (v0) => ({type: "ginf", 0: v0})
let gnames = (v0) => (v1) => ({type: "gnames", 0: v0, 1: v1})
let fill_list = (what) => (num) => loop(num)((num) => (recur) => (($target) => {
if ($target === true) {
return nil
} ;
return cons(what)(recur(num - 1));
throw new Error('match fail 16899:' + JSON.stringify($target))
})($eq(0)(num)))
let matrix_heads = (matrix) => map((row) => (($target) => {
if ($target.type === "nil") {
return fatal("is-complete called with empty row")
} ;
if ($target.type === "cons") {
let head = $target[0];
return head
} ;
throw new Error('match fail 10688:' + JSON.stringify($target))
})(row))(matrix)
let missing_$gts = ({"1": m, "0": prefix}) => `Missing ${(($target) => {
if ($target.type === "nil") {
return ""
} ;
return `${join(" ")(prefix)} `;
throw new Error('match fail 18035:' + JSON.stringify($target))
})(prefix)}${(($target) => {
if ($target.type === "minf") {
let name = $target[0];
return `_ : The infinite type ${name} requires a catchall`
} ;
if ($target.type === "mopen") {
let id = $target[0];
return `_ : Open type (tvar ${id}) requires a catchall`
} ;
if ($target.type === "mname") {
let name = $target[0];
return `${name} : Case not handled`
} ;
throw new Error('match fail 17592:' + JSON.stringify($target))
})(m)}`
let prefix = (prefix) => (missings) => map(({"1": missing, "0": pre}) => $co(cons(prefix)(pre))(missing))(missings)
let filter_$gt = (f) => (items) => foldl_$gt(nil)(items)((res) => (v) => $gt$gt$eq(f(v))((b) => $lt_((($target) => {
if ($target === true) {
return cons(v)(res)
} ;
return res;
throw new Error('match fail 17872:' + JSON.stringify($target))
})(b))))
let all = (f) => (lst) => (($target) => {
if ($target.type === "nil") {
return true
} ;
if ($target.type === "cons") {
let one = $target[0];
let rest = $target[1];
{
let $target = f(one);
if ($target === true) {
return all(f)(rest)
} ;
return false;
throw new Error('match fail 19753:' + JSON.stringify($target))
}
} ;
throw new Error('match fail 19742:' + JSON.stringify($target))
})(lst)
let mapi = (f) => (lst) => loop($co(0)(lst))(({"1": lst, "0": i}) => (recur) => (($target) => {
if ($target.type === "nil") {
return nil
} ;
if ($target.type === "cons") {
let one = $target[0];
let rest = $target[1];
return cons(f(i)(one))(recur($co(i + 1)(rest)))
} ;
throw new Error('match fail 24289:' + JSON.stringify($target))
})(lst))
let eearmuffs = {type: "eearmuffs"}
let ebang = (v0) => ({type: "ebang", 0: v0})
let eeffectful = (v0) => (v1) => (v2) => ({type: "eeffectful", 0: v0, 1: v1, 2: v2})
let type_vbl_name = (name) => $gt$gt$eq($lt_state)(({"1": idx, "0": map}) => (($target) => {
if ($target.type === "some") {
let name = $target[0];
return $lt_(name)
} ;
if ($target.type === "none") {
return $gt$gt$eq($lt_(str_idx(type_vbl_items)(idx)))((n2) => $gt$gt$eq(state_$gt($co(map$slset(map)(name)(n2))(idx + 1)))((_25507) => $lt_(n2)))
} ;
throw new Error('match fail 25490:' + JSON.stringify($target))
})(map$slget(map)(name)))
let tvar = (v0) => (v1) => ({type: "tvar", 0: v0, 1: v1})
let tapp = (v0) => (v1) => (v2) => ({type: "tapp", 0: v0, 1: v1, 2: v2})
let tcon = (v0) => (v1) => ({type: "tcon", 0: v0, 1: v1})
let trec = (v0) => (v1) => (v2) => (v3) => ({type: "trec", 0: v0, 1: v1, 2: v2, 3: v3})
let trow = (v0) => (v1) => (v2) => (v3) => ({type: "trow", 0: v0, 1: v1, 2: v2, 3: v3})
let ex$slany = {type: "ex/any"}
let ex$slconstructor = (v0) => (v1) => (v2) => ({type: "ex/constructor", 0: v0, 1: v1, 2: v2})
let forall = (v0) => (v1) => ({type: "forall", 0: v0, 1: v1})
let tenv = (v0) => (v1) => (v2) => (v3) => ({type: "tenv", 0: v0, 1: v1, 2: v2, 3: v3})
let tenv$slwith_type = ({"3": aliases, "2": types, "1": tcons, "0": values}) => (name) => (scheme) => tenv(map$slset(values)(name)(scheme))(tcons)(types)(aliases)
let type$slfree = (type) => (($target) => {
if ($target.type === "trow") {
let fields = $target[0];
let spread = $target[1];
let kind = $target[2];
let loc = $target[3];
return foldl((($target) => {
if ($target.type === "none") {
return set$slnil
} ;
if ($target.type === "some") {
let v = $target[0];
return type$slfree(v)
} ;
throw new Error('match fail 14085:' + JSON.stringify($target))
})(spread))(map(({"1": t}) => type$slfree(t))(fields))(set$slmerge)
} ;
if ($target.type === "trec") {
let name = $target[0];
let inner = $target[2];
let loc = $target[3];
return set$slrm(type$slfree(inner))(name)
} ;
if ($target.type === "tvar") {
let id = $target[0];
return set$sladd(set$slnil)(id)
} ;
if ($target.type === "tcon") {
return set$slnil
} ;
if ($target.type === "tapp") {
let a = $target[0];
let b = $target[1];
return set$slmerge(type$slfree(a))(type$slfree(b))
} ;
throw new Error('match fail 324:' + JSON.stringify($target))
})(type)
let scheme$slfree = ({"1": type, "0": vbls}) => set$sldiff(type$slfree(type))(vbls)
let tenv$slfree = ({"0": values}) => foldr(set$slnil)(map(scheme$slfree)(map$slvalues(values)))(set$slmerge)
let type$slapply = (subst) => (type) => (($target) => {
if ($target.type === "tvar") {
let id = $target[0];
{
let $target = map$slget(subst)(id);
if ($target.type === "none") {
return type
} ;
if ($target.type === "some") {
let t = $target[0];
return t
} ;
throw new Error('match fail 565:' + JSON.stringify($target))
}
} ;
if ($target.type === "tapp") {
let target = $target[0];
let arg = $target[1];
let loc = $target[2];
return tapp(type$slapply(subst)(target))(type$slapply(subst)(arg))(loc)
} ;
if ($target.type === "trow") {
let fields = $target[0];
let spread = $target[1];
let k = $target[2];
let l = $target[3];
return trow(map(({"1": t, "0": n}) => $co(n)(type$slapply(subst)(t)))(fields))((($target) => {
if ($target.type === "none") {
return spread
} ;
if ($target.type === "some") {
let t = $target[0];
return some(type$slapply(subst)(t))
} ;
throw new Error('match fail 16016:' + JSON.stringify($target))
})(spread))(k)(l)
} ;
if ($target.type === "trec") {
let a = $target[0];
let al = $target[1];
let inner = $target[2];
let l = $target[3];
return trec(a)(al)(type$slapply(map$slrm(subst)(a))(inner))(l)
} ;
return type;
throw new Error('match fail 558:' + JSON.stringify($target))
})(type)
let compose_subst = (new_subst) => (old_subst) => map$slmerge(map$slmap(type$slapply(new_subst))(old_subst))(new_subst)
let demo_new_subst = map$slfrom_list(cons($co("a")(tcon("a-mapped")(-1)))(cons($co("b")(tvar("c")(-1)))(nil)))
let generalize = (tenv) => (t) => forall(set$sldiff(type$slfree(t))(tenv$slfree(tenv)))(t)

let subst_$gt = (new_subst) => $gt$gt$eq($lt_state)(({"1": {"1": types, "0": subst}, "0": idx}) => $gt$gt$eq(state_$gt($co(idx)($co(compose_subst(new_subst)(subst))(types))))((_1578) => $lt_($unit)))
let new_type_var = (name) => (l) => $gt$gt$eq($lt_next_idx)((nidx) => $lt_(tvar(`${name}:${int_to_string(nidx)}`)(l)))
let make_subst_for_free = (vars) => (l) => $gt$gt$eq(map_$gt((id) => $gt$gt$eq(new_type_var(id)(l))((new_var) => $lt_($co(id)(new_var))))(set$slto_list(vars)))((mapping) => $lt_(map$slfrom_list(mapping)))
let var_bind = ($var) => (type) => (l) => (($target) => {
if ($target.type === "tvar") {
let v = $target[0];
{
let $target = $eq($var)(v);
if ($target === true) {
return $lt_($unit)
} ;
return $gt$gt$eq(subst_$gt(one_subst($var)(type)))((_2097) => $lt_($unit));
throw new Error('match fail 2088:' + JSON.stringify($target))
}
} ;
{
let $target = set$slhas(type$slfree(type))($var);
if ($target === true) {
return $gt$gt$eq(subst_$gt(one_subst($var)(trec($var)(l)(type)(l))))((_19112) => $lt_($unit))
} ;
return $gt$gt$eq(subst_$gt(one_subst($var)(type)))((_2132) => $lt_($unit));
throw new Error('match fail 2115:' + JSON.stringify($target))
};
throw new Error('match fail 2081:' + JSON.stringify($target))
})(type)
let type$slapply_$gt = apply_$gt(type$slapply)
let infer$slprim = (prim) => (($target) => {
if ($target.type === "pint") {
let l = $target[1];
return tcon("int")(l)
} ;
if ($target.type === "pbool") {
let l = $target[1];
return tcon("bool")(l)
} ;
throw new Error('match fail 2221:' + JSON.stringify($target))
})(prim)
let tenv$slresolve = ({"0": values}) => (name) => map$slget(values)(name)
let tfn = (effects) => (arg) => (body) => (l) => tapp(tapp(tapp(tcon("->")(l))(effects)(l))(arg)(l))(body)(l)
let tenv$slnil = tenv(map$slnil)(map$slnil)(map$slnil)(map$slnil)
let tfns = (args) => (body) => (l) => foldr(body)(mapi((i) => (arg) => $co(tvar(`tfns-effect:${int_to_string(i)}`)(-1))(arg))(args))((body) => ({"1": arg, "0": effects}) => tfn(effects)(arg)(body)(l))
let tint = tcon("int")(-1)
let type$slunroll_app = (type) => (($target) => {
if ($target.type === "tapp") {
let target = $target[0];
let arg = $target[1];
let l = $target[2];
{
let target$$0 = target;
{
let {"1": inner, "0": target} = type$slunroll_app(target$$0);
return $co(target)(cons($co(arg)(l))(inner))
}
}
} ;
return $co(type)(nil);
throw new Error('match fail 5764:' + JSON.stringify($target))
})(type)
let tenv$slmerge = ({"3": a1, "2": t1, "1": c1, "0": v1}) => ({"3": a2, "2": t2, "1": c2, "0": v2}) => tenv(map$slmerge(v1)(v2))(map$slmerge(c1)(c2))(map$slmerge(t1)(t2))(map$slmerge(a1)(a2))
let tbool = tcon("bool")(-1)
let tmap = (k) => (v) => tapp(tapp(tcon("map")(-1))(k)(-1))(v)(-1)
let toption = (arg) => tapp(tcon("option")(-1))(arg)(-1)
let tlist = (arg) => tapp(tcon("list")(-1))(arg)(-1)
let tset = (arg) => tapp(tcon("set")(-1))(arg)(-1)
let concrete = (t) => forall(set$slnil)(t)
let generic = (vbls) => (t) => forall(set$slfrom_list(vbls))(t)
let vbl = (k) => tvar(k)(-1)
let t$co = (a) => (b) => tapp(tapp(tcon(",")(-1))(a)(-1))(b)(-1)
let tstring = tcon("string")(-1)
let builtin_env = (() => {
let k = vbl("k");
{
let v = vbl("v");
{
let v2 = vbl("v2");
{
let a = vbl("a");
{
let b = vbl("b");
return tenv(map$slfrom_list(map(({"1": type, "0": name}) => $co(name)(forall(type$slfree(type))(type)))(cons($co("+")(tfns(cons(tint)(cons(tint)(nil)))(tint)(-1)))(cons($co("-")(tfns(cons(tint)(cons(tint)(nil)))(tint)(-1)))(cons($co(">")(tfns(cons(tint)(cons(tint)(nil)))(tbool)(-1)))(cons($co("<")(tfns(cons(tint)(cons(tint)(nil)))(tbool)(-1)))(cons($co("/")(tfns(cons(tint)(cons(tint)(nil)))(tint)(-1)))(cons($co("*")(tfns(cons(tint)(cons(tint)(nil)))(tint)(-1)))(cons($co("=")(tfns(cons(k)(cons(k)(nil)))(tbool)(-1)))(cons($co("!=")(tfns(cons(k)(cons(k)(nil)))(tbool)(-1)))(cons($co(">=")(tfns(cons(tint)(cons(tint)(nil)))(tbool)(-1)))(cons($co("<=")(tfns(cons(tint)(cons(tint)(nil)))(tbool)(-1)))(cons($co("()")(tcon("()")(-1)))(cons($co(",")(tfns(cons(a)(cons(b)(nil)))(t$co(a)(b))(-1)))(cons($co("unescapeString")(tfns(cons(tstring)(nil))(tstring)(-1)))(cons($co("int-to-string")(tfns(cons(tint)(nil))(tstring)(-1)))(cons($co("string-to-int")(tfns(cons(tstring)(nil))(toption(tint))(-1)))(cons($co("string-to-float")(tfns(cons(tstring)(nil))(toption(tcon("float")(-1)))(-1)))(cons($co("map/nil")(tmap(k)(v)))(cons($co("map/set")(tfns(cons(tmap(k)(v))(cons(k)(cons(v)(nil))))(tmap(k)(v))(-1)))(cons($co("map/rm")(tfns(cons(tmap(k)(v))(cons(k)(nil)))(tmap(k)(v))(-1)))(cons($co("map/get")(tfns(cons(tmap(k)(v))(cons(k)(nil)))(toption(v))(-1)))(cons($co("map/map")(tfns(cons(tfns(cons(v)(nil))(v2)(-1))(cons(tmap(k)(v))(nil)))(tmap(k)(v2))(-1)))(cons($co("map/merge")(tfns(cons(tmap(k)(v))(cons(tmap(k)(v))(nil)))(tmap(k)(v))(-1)))(cons($co("map/values")(tfns(cons(tmap(k)(v))(nil))(tlist(v))(-1)))(cons($co("map/keys")(tfns(cons(tmap(k)(v))(nil))(tlist(k))(-1)))(cons($co("set/nil")(tset(k)))(cons($co("set/add")(tfns(cons(tset(k))(cons(k)(nil)))(tset(k))(-1)))(cons($co("set/has")(tfns(cons(tset(k))(cons(k)(nil)))(tbool)(-1)))(cons($co("set/rm")(tfns(cons(tset(k))(cons(k)(nil)))(tset(k))(-1)))(cons($co("set/diff")(tfns(cons(tset(k))(cons(tset(k))(nil)))(tset(k))(-1)))(cons($co("set/merge")(tfns(cons(tset(k))(cons(tset(k))(nil)))(tset(k))(-1)))(cons($co("set/overlap")(tfns(cons(tset(k))(cons(tset(k))(nil)))(tset(k))(-1)))(cons($co("set/to-list")(tfns(cons(tset(k))(nil))(tlist(k))(-1)))(cons($co("set/from-list")(tfns(cons(tlist(k))(nil))(tset(k))(-1)))(cons($co("map/from-list")(tfns(cons(tlist(t$co(k)(v)))(nil))(tmap(k)(v))(-1)))(cons($co("map/to-list")(tfns(cons(tmap(k)(v))(nil))(tlist(t$co(k)(v)))(-1)))(cons($co("jsonify")(tfns(cons(tvar("v")(-1))(nil))(tstring)(-1)))(cons($co("valueToString")(tfns(cons(vbl("v"))(nil))(tstring)(-1)))(cons($co("eval")(tfns(cons(tcon("string")(-1))(nil))(vbl("v"))(-1)))(cons($co("errorToString")(tfns(cons(tfns(cons(vbl("v"))(nil))(tstring)(-1))(cons(vbl("v"))(nil)))(tstring)(-1)))(cons($co("sanitize")(tfns(cons(tstring)(nil))(tstring)(-1)))(cons($co("replace-all")(tfns(cons(tstring)(cons(tstring)(cons(tstring)(nil))))(tstring)(-1)))(cons($co("fatal")(tfns(cons(tstring)(nil))(vbl("v"))(-1)))(nil)))))))))))))))))))))))))))))))))))))))))))))(map$slfrom_list(cons($co("()")($co(nil)($co(nil)(tcon("()")(-1)))))(cons($co(",")($co(cons("a")(cons("b")(nil)))($co(cons(a)(cons(b)(nil)))(t$co(a)(b)))))(nil))))(map$slfrom_list(cons($co("int")($co(0)(set$slnil)))(cons($co("float")($co(0)(set$slnil)))(cons($co("string")($co(0)(set$slnil)))(cons($co("bool")($co(0)(set$slnil)))(cons($co("map")($co(2)(set$slnil)))(cons($co("set")($co(1)(set$slnil)))(cons($co("->")($co(2)(set$slnil)))(nil)))))))))(map$slnil)
}
}
}
}
})()
let tenv$slwith_scope = ({"3": aliases, "2": types, "1": tcons, "0": values}) => (scope) => tenv(map$slmerge(scope)(values))(tcons)(types)(aliases)
let tcon_and_args = (type) => (coll) => (l) => (($target) => {
if ($target.type === "trow") {
return fatal("cant apply a row type")
} ;
if ($target.type === "trec") {
let name = $target[0];
let inner = $target[2];
return fatal("cant apply a recursive type?")
} ;
if ($target.type === "tvar") {
return fatal(`Type not resolved ${int_to_string(l)} it is a tvar at heart. ${jsonify(type)} ${jsonify(coll)}`)
} ;
if ($target.type === "tcon") {
let name = $target[0];
return $co(name)(coll)
} ;
if ($target.type === "tapp") {
let target = $target[0];
let arg = $target[1];
return tcon_and_args(target)(cons(arg)(coll))(l)
} ;
throw new Error('match fail 9950:' + JSON.stringify($target))
})(type)
let any_list = fill_list(ex$slany)
let default_matrix = (matrix) => concat(map((row) => (($target) => {
if ($target.type === "cons") {
if ($target[0].type === "ex/any") {
let rest = $target[1];
return cons(rest)(nil)
} 
} ;
return nil;
throw new Error('match fail 10531:' + JSON.stringify($target))
})(row))(matrix))
let specialize_row = (constructor) => (arity) => (row) => (($target) => {
if ($target.type === "nil") {
return fatal("Can't specialize an empty row.")
} ;
if ($target.type === "cons") {
if ($target[0].type === "ex/any") {
let rest = $target[1];
return cons(concat(cons(any_list(arity))(cons(rest)(nil))))(nil)
} 
} ;
if ($target.type === "cons") {
if ($target[0].type === "ex/constructor") {
let name = $target[0][0];
let args = $target[0][2];
let rest = $target[1];
{
let $target = $eq(name)(constructor);
if ($target === true) {
return cons(concat(cons(args)(cons(rest)(nil))))(nil)
} ;
return nil;
throw new Error('match fail 10596:' + JSON.stringify($target))
}
} 
} ;
throw new Error('match fail 10573:' + JSON.stringify($target))
})(row)
let target_and_args = (type) => (coll) => (($target) => {
if ($target.type === "tapp") {
let target = $target[0];
let arg = $target[1];
return target_and_args(target)(cons(arg)(coll))
} ;
return $co(type)(coll);
throw new Error('match fail 13102:' + JSON.stringify($target))
})(type)
let fn_args_and_body = (type) => (($target) => {
if ($target.type === "tapp") {
if ($target[0].type === "tapp") {
if ($target[0][0].type === "tapp") {
if ($target[0][0][0].type === "tcon") {
if ($target[0][0][0][0] === "->") {
let effects = $target[0][0][1];
let arg = $target[0][1];
let res = $target[1];
{
let res$$0 = res;
{
let {"1": res, "0": args} = fn_args_and_body(res$$0);
return $co(cons($co(effects)(arg))(args))(res)
}
}
} 
} 
} 
} 
} ;
return $co(nil)(type);
throw new Error('match fail 13154:' + JSON.stringify($target))
})(type)
let record_if_generic = ({"1": t, "0": free}) => (l) => (($target) => {
if ($target.type === "nil") {
return $lt_($unit)
} ;
return record_type_$gt(t)(l)(true);
throw new Error('match fail 13752:' + JSON.stringify($target))
})(set$slto_list(free))
let map$eq = (v$eq) => (one) => (two) => {
let k1 = map$slkeys(one);
{
let k2 = map$slkeys(two);
{
let $target = $eq(length(k1))(length(k2));
if ($target === true) {
return all((k) => (($target) => {
if ($target.type === ",") {
if ($target[0].type === "some") {
let a = $target[0][0];
if ($target[1].type === "some") {
let b = $target[1][0];
return v$eq(a)(b)
} 
} 
} ;
return false;
throw new Error('match fail 21971:' + JSON.stringify($target))
})($co(map$slget(one)(k))(map$slget(two)(k))))(k1)
} ;
return false;
throw new Error('match fail 21954:' + JSON.stringify($target))
}
}
}
let deep_map = (fields) => (spread) => (k) => {
let map = map$slfrom_list(fields);
{
let $target = spread;
if ($target.type === "some") {
if ($target[0].type === "trow") {
let fields = $target[0][0];
let spread = $target[0][1];
let k2 = $target[0][2];
let l = $target[0][3];
{
let $target = $ex$eq(k2)(k);
if ($target === true) {
return fatal("wrong kind")
} ;
{
let spread$$0 = spread;
{
let {"1": spread, "0": map2} = deep_map(fields)(spread$$0)(k);
return $co(map$slmerge(map)(map2))(spread)
}
};
throw new Error('match fail 14837:' + JSON.stringify($target))
}
} 
} ;
return $co(map)(spread);
throw new Error('match fail 14820:' + JSON.stringify($target))
}
}
let quot_tvar = (t) => (($target) => {
if ($target.type === "tvar") {
return t
} ;
if ($target.type === "tcon") {
let name = $target[0];
let l = $target[1];
{
let $target = starts_with("'")(name);
if ($target === true) {
return tvar(name)(l)
} ;
return t;
throw new Error('match fail 15482:' + JSON.stringify($target))
}
} ;
if ($target.type === "tapp") {
let target = $target[0];
let arg = $target[1];
let l = $target[2];
return tapp(quot_tvar(target))(quot_tvar(arg))(l)
} ;
if ($target.type === "trec") {
let name = $target[0];
let nl = $target[1];
let type = $target[2];
let l = $target[3];
return trec(name)(nl)(quot_tvar(type))(l)
} ;
if ($target.type === "trow") {
let fields = $target[0];
let spread = $target[1];
let k = $target[2];
let l = $target[3];
return trow(map(({"1": type, "0": name}) => $co(name)(quot_tvar(type)))(fields))((($target) => {
if ($target.type === "none") {
return none
} ;
if ($target.type === "some") {
let t = $target[0];
return some(quot_tvar(t))
} ;
throw new Error('match fail 15547:' + JSON.stringify($target))
})(spread))(k)(l)
} ;
throw new Error('match fail 15470:' + JSON.stringify($target))
})(t)
let fold_constructors = (init) => (pats) => (f) => fold_ex_pats(init)(pats)((init) => (pat) => (($target) => {
if ($target.type === "ex/constructor") {
let name = $target[0];
let gid = $target[1];
let args = $target[2];
return f(init)(name)(gid)(args)
} ;
return init;
throw new Error('match fail 16861:' + JSON.stringify($target))
})(pat))
let group_rows = (matrix) => loop($co(matrix)($co(none)($co(map$slnil)(nil))))(({"1": {"1": {"1": anys, "0": by_cstr}, "0": gid}, "0": matrix}) => (recur) => (($target) => {
if ($target.type === "nil") {
return $co(gid)($co(by_cstr)(anys))
} ;
if ($target.type === "cons") {
if ($target[0].type === "cons") {
if ($target[0][0].type === "ex/any") {
let row = $target[0][1];
let rest = $target[1];
return recur($co(rest)($co(gid)($co(by_cstr)(cons(row)(anys)))))
} 
} 
} ;
if ($target.type === "cons") {
if ($target[0].type === "cons") {
if ($target[0][0].type === "ex/constructor") {
let id = $target[0][0][0];
let rgid = $target[0][0][1];
let args = $target[0][0][2];
let row = $target[0][1];
let rest = $target[1];
return recur($co(rest)($co((($target) => {
if ($target.type === "none") {
return some(rgid)
} ;
if ($target.type === "some") {
let gid = $target[0];
{
let $target = $ex$eq(gid)(rgid);
if ($target === true) {
return fatal("different GIDs in the same matrix")
} ;
return some(gid);
throw new Error('match fail 17320:' + JSON.stringify($target))
}
} ;
throw new Error('match fail 17308:' + JSON.stringify($target))
})(gid))($co(map$slupdate(by_cstr)(id)((x) => (($target) => {
if ($target.type === "none") {
return $co(length(args))(cons(concat(cons(args)(cons(row)(nil))))(nil))
} ;
if ($target.type === "some") {
if ($target[0].type === ",") {
let n = $target[0][0];
let rows = $target[0][1];
return $co(n)(cons(concat(cons(args)(cons(row)(nil))))(rows))
} 
} ;
throw new Error('match fail 17253:' + JSON.stringify($target))
})(x)))(anys))))
} 
} 
} ;
if ($target.type === "cons") {
if ($target[0].type === "nil") {
return fatal("empty row?")
} 
} ;
throw new Error('match fail 17153:' + JSON.stringify($target))
})(matrix))
let type$slmap = (f) => (t) => {
let rec = type$slmap(f);
return f((($target) => {
if ($target.type === "tapp") {
let a = $target[0];
let b = $target[1];
let l = $target[2];
return tapp(rec(a))(rec(b))(l)
} ;
if ($target.type === "trow") {
let fields = $target[0];
let spread = $target[1];
let k = $target[2];
let l = $target[3];
return trow(map(({"1": v, "0": k}) => $co(k)(rec(v)))(fields))(map$slopt(rec)(spread))(k)(l)
} ;
return t;
throw new Error('match fail 18237:' + JSON.stringify($target))
})(t))
}
let type$slfold = (init) => (f) => (t) => f((($target) => {
if ($target.type === "tapp") {
let a = $target[0];
let b = $target[1];
let l = $target[2];
return type$slfold(type$slfold(init)(f)(a))(f)(b)
} ;
if ($target.type === "trow") {
let fields = $target[0];
let spread = $target[1];
let k = $target[2];
let l = $target[3];
{
let init$$0 = init;
{
let init = foldl(init$$0)(fields)((init) => ({"1": v, "0": k}) => type$slfold(init)(f)(v));
{
let $target = spread;
if ($target.type === "none") {
return init
} ;
if ($target.type === "some") {
let v = $target[0];
return type$slfold(init)(f)(v)
} ;
throw new Error('match fail 18421:' + JSON.stringify($target))
}
}
}
} ;
return init;
throw new Error('match fail 18357:' + JSON.stringify($target))
})(t))(t)
let type$slcon_to_var = (vars) => (type) => type$slmap((t) => (($target) => {
if ($target.type === "tcon") {
let name = $target[0];
let l = $target[1];
{
let $target = set$slhas(vars)(name);
if ($target === true) {
return tvar(name)(l)
} ;
return t;
throw new Error('match fail 19060:' + JSON.stringify($target))
}
} ;
return t;
throw new Error('match fail 19053:' + JSON.stringify($target))
})(t))(type)

let is_rec_pair = (t1) => (t2) => (($target) => {
if ($target.type === ",") {
if ($target[0].type === "trec") {
return true
} 
} ;
if ($target.type === ",") {
if ($target[1].type === "trec") {
return true
} 
} ;
return false;
throw new Error('match fail 19266:' + JSON.stringify($target))
})($co(t1)(t2))
let lookup_rec = (t) => (lookup) => (($target) => {
if ($target.type === "tvar") {
let name = $target[0];
let l = $target[1];
{
let $target = map$slget(lookup)(name);
if ($target.type === "some") {
let v = $target[0];
return $gt$gt$eq(type$slapply_$gt(v))((v) => $lt_(some(v)))
} ;
return $lt_(none);
throw new Error('match fail 19410:' + JSON.stringify($target))
}
} ;
return $lt_(none);
throw new Error('match fail 19401:' + JSON.stringify($target))
})(t)
let add_rec = (lookup) => (t) => (($target) => {
if ($target.type === "trec") {
let name = $target[0];
let inner = $target[2];
return $co(map$slset(lookup)(name)(inner))(inner)
} ;
return $co(lookup)(t);
throw new Error('match fail 19439:' + JSON.stringify($target))
})(t)
let snum = (v0) => ({type: "snum", 0: v0})
let stype = (v0) => (v1) => (v2) => (v3) => (v4) => ({type: "stype", 0: v0, 1: v1, 2: v2, 3: v3, 4: v4})
let srep = (v0) => ({type: "srep", 0: v0})
let unwrap_tuple_type = (type) => (($target) => {
if ($target.type === "tapp") {
if ($target[0].type === "tapp") {
if ($target[0][0].type === "tcon") {
if ($target[0][0][0] === ",") {
let a = $target[0][1];
let b = $target[1];
{
let inner = unwrap_tuple_type(b);
return cons(a)(inner)
}
} 
} 
} 
} ;
return cons(type)(nil);
throw new Error('match fail 21463:' + JSON.stringify($target))
})(type)
let find_recursives = (type) => type$slfold(nil)((res) => (type) => (($target) => {
if ($target.type === "trec") {
let name = $target[0];
let inner = $target[2];
return cons(type)(res)
} ;
return res;
throw new Error('match fail 21548:' + JSON.stringify($target))
})(type))(type)
let type$slmap_post = (f) => (t) => {
let rec = type$slmap(f);
{
let $target = f(t);
if ($target.type === "tapp") {
let a = $target[0];
let b = $target[1];
let l = $target[2];
return tapp(rec(a))(rec(b))(l)
} ;
if ($target.type === "trow") {
let fields = $target[0];
let spread = $target[1];
let k = $target[2];
let l = $target[3];
return trow(map(({"1": v, "0": k}) => $co(k)(rec(v)))(fields))(map$slopt(rec)(spread))(k)(l)
} ;
{
let t = $target;
return t
};
throw new Error('match fail 21710:' + JSON.stringify($target))
}
}
let is_empty_effects = (effects) => (arg) => (($target) => {
if ($target.type === "tvar") {
let v = $target[0];
return not(set$slhas(type$slfree(arg))(v))
} ;
return false;
throw new Error('match fail 25683:' + JSON.stringify($target))
})(effects)
let eprim = (v0) => (v1) => ({type: "eprim", 0: v0, 1: v1})
let evar = (v0) => (v1) => ({type: "evar", 0: v0, 1: v1})
let estr = (v0) => (v1) => (v2) => ({type: "estr", 0: v0, 1: v1, 2: v2})
let equot = (v0) => (v1) => ({type: "equot", 0: v0, 1: v1})
let eeffect = (v0) => (v1) => (v2) => ({type: "eeffect", 0: v0, 1: v1, 2: v2})
let elambda = (v0) => (v1) => (v2) => ({type: "elambda", 0: v0, 1: v1, 2: v2})
let eapp = (v0) => (v1) => (v2) => ({type: "eapp", 0: v0, 1: v1, 2: v2})
let elet = (v0) => (v1) => (v2) => ({type: "elet", 0: v0, 1: v1, 2: v2})
let ematch = (v0) => (v1) => (v2) => ({type: "ematch", 0: v0, 1: v1, 2: v2})
let eenum = (v0) => (v1) => (v2) => (v3) => ({type: "eenum", 0: v0, 1: v1, 2: v2, 3: v3})
let eprovide = (v0) => (v1) => (v2) => ({type: "eprovide", 0: v0, 1: v1, 2: v2})
let erecord = (v0) => (v1) => (v2) => ({type: "erecord", 0: v0, 1: v1, 2: v2})
let eaccess = (v0) => (v1) => (v2) => ({type: "eaccess", 0: v0, 1: v1, 2: v2})

let quot$slexpr = (v0) => ({type: "quot/expr", 0: v0})
let quot$sltop = (v0) => ({type: "quot/top", 0: v0})
let quot$sltype = (v0) => ({type: "quot/type", 0: v0})
let quot$slpat = (v0) => ({type: "quot/pat", 0: v0})
let quot$slquot = (v0) => ({type: "quot/quot", 0: v0})

let tdef = (v0) => (v1) => (v2) => (v3) => ({type: "tdef", 0: v0, 1: v1, 2: v2, 3: v3})
let texpr = (v0) => (v1) => ({type: "texpr", 0: v0, 1: v1})
let tdeftype = (v0) => (v1) => (v2) => (v3) => (v4) => ({type: "tdeftype", 0: v0, 1: v1, 2: v2, 3: v3, 4: v4})
let ttypealias = (v0) => (v1) => (v2) => (v3) => (v4) => ({type: "ttypealias", 0: v0, 1: v1, 2: v2, 3: v3, 4: v4})
let terr = (v0) => (v1) => ({type: "terr", 0: v0, 1: v1})
let ttypes = (v0) => (v1) => ({type: "ttypes", 0: v0, 1: v1})
let twrap = (v0) => (v1) => ({type: "twrap", 0: v0, 1: v1})
let tmissing = (v0) => ({type: "tmissing", 0: v0})
let type$eq = (one) => (two) => (($target) => {
if ($target.type === ",") {
if ($target[0].type === "trow") {
let f1 = $target[0][0];
let s1 = $target[0][1];
let k1 = $target[0][2];
if ($target[1].type === "trow") {
let f2 = $target[1][0];
let s2 = $target[1][1];
let k2 = $target[1][2];
{
let $target = $eq(k1)(k2);
if ($target === true) {
{
let s1$$0 = s1;
{
let {"1": s1, "0": m1} = deep_map(f1)(s1$$0)(k1);
{
let s2$$0 = s2;
{
let {"1": s2, "0": m2} = deep_map(f2)(s2$$0)(k2);
{
let $target = (($target) => {
if ($target.type === ",") {
if ($target[0].type === "none") {
if ($target[1].type === "none") {
return true
} 
} 
} ;
if ($target.type === ",") {
if ($target[0].type === "some") {
let a = $target[0][0];
if ($target[1].type === "some") {
let b = $target[1][0];
return type$eq(a)(b)
} 
} 
} ;
return false;
throw new Error('match fail 21924:' + JSON.stringify($target))
})($co(s1)(s2));
if ($target === true) {
return map$eq(type$eq)(m1)(m2)
} ;
return false;
throw new Error('match fail 21922:' + JSON.stringify($target))
}
}
}
}
}
} ;
return false;
throw new Error('match fail 14048:' + JSON.stringify($target))
}
} 
} 
} ;
if ($target.type === ",") {
if ($target[0].type === "trec") {
let a = $target[0][0];
let b = $target[0][2];
if ($target[1].type === "trec") {
let c = $target[1][0];
let d = $target[1][2];
{
let $target = $eq(a)(c);
if ($target === true) {
return type$eq(b)(d)
} ;
return false;
throw new Error('match fail 18946:' + JSON.stringify($target))
}
} 
} 
} ;
if ($target.type === ",") {
if ($target[0].type === "tvar") {
let id = $target[0][0];
if ($target[1].type === "tvar") {
let id$qu = $target[1][0];
return $eq(id)(id$qu)
} 
} 
} ;
if ($target.type === ",") {
if ($target[0].type === "tapp") {
let target = $target[0][0];
let arg = $target[0][1];
if ($target[1].type === "tapp") {
let target$qu = $target[1][0];
let arg$qu = $target[1][1];
{
let $target = type$eq(target)(target$qu);
if ($target === true) {
return type$eq(arg)(arg$qu)
} ;
return false;
throw new Error('match fail 240:' + JSON.stringify($target))
}
} 
} 
} ;
if ($target.type === ",") {
if ($target[0].type === "tcon") {
let name = $target[0][0];
if ($target[1].type === "tcon") {
let name$qu = $target[1][0];
return $eq(name)(name$qu)
} 
} 
} ;
return false;
throw new Error('match fail 208:' + JSON.stringify($target))
})($co(one)(two))
let scheme$slapply = (subst) => ({"1": type, "0": vbls}) => forall(vbls)(type$slapply(map_without(subst)(vbls))(type))
let instantiate = ({"1": t, "0": vars}) => (l) => $gt$gt$eq(make_subst_for_free(vars)(l))((subst) => $lt_(type$slapply(subst)(t)))
let type_$gts = (type) => (($target) => {
if ($target.type === "trow") {
let fields = $target[0];
let spread = $target[1];
let kind = $target[2];
let loc = $target[3];
{
let spread$$0 = spread;
{
let {"1": spread, "0": fmap} = deep_map(fields)(spread$$0)(kind);
{
let fields = map$slto_list(fmap);
{
let $target = kind;
if ($target.type === "rrecord") {
return `{${join(" ")(map(({"1": value, "0": tag}) => `${tag} ${type_$gts(value)}`)(fields))}${(($target) => {
if ($target.type === "none") {
return ""
} ;
if ($target.type === "some") {
let t = $target[0];
return ` ..${type_$gts(t)}`
} ;
throw new Error('match fail 15846:' + JSON.stringify($target))
})(spread)}}`
} ;
if ($target.type === "renum") {
return `[${join(" ")(map(({"1": value, "0": tag}) => (($target) => {
if ($target.type === "tcon") {
if ($target[0] === "()") {
return `'${tag}`
} 
} ;
{
let v = $target;
return `('${tag} ${type_$gts(v)})`
};
throw new Error('match fail 15766:' + JSON.stringify($target))
})(value))(fields))}${(($target) => {
if ($target.type === "none") {
return ""
} ;
if ($target.type === "some") {
let t = $target[0];
return ` ..${type_$gts(t)}`
} ;
throw new Error('match fail 15797:' + JSON.stringify($target))
})(spread)}]`
} ;
throw new Error('match fail 14059:' + JSON.stringify($target))
}
}
}
}
} ;
if ($target.type === "tvar") {
let name = $target[0];
return name
} ;
if ($target.type === "trec") {
let name = $target[0];
let inner = $target[2];
return `(rec ${name} ${type_$gts(inner)})`
} ;
if ($target.type === "tapp") {
if ($target[0].type === "tapp") {
if ($target[0][0].type === "tapp") {
if ($target[0][0][0].type === "tcon") {
if ($target[0][0][0][0] === "->") {
{
let {"1": body, "0": args} = fn_args_and_body(type);
return `(fn [${join(" ")(map(({"1": t, "0": e}) => `{${type_$gts(e)}}${type_$gts(t)}`)(args))}] ${type_$gts(body)})`
}
} 
} 
} 
} 
} ;
if ($target.type === "tapp") {
let target = $target[0];
let arg = $target[1];
{
let {"1": args, "0": target} = target_and_args(type)(nil);
return `(${type_$gts(target)} ${join(" ")(map(type_$gts)(args))})`
}
} ;
if ($target.type === "tcon") {
let name = $target[0];
return name
} ;
throw new Error('match fail 3224:' + JSON.stringify($target))
})(type)
let add$sltypealias = ({"3": aliases, "2": types, "1": tcons, "0": values}) => (name) => (args) => (type) => tenv(map$slnil)(map$slnil)(map$slnil)(map$slset(map$slnil)(name)($co(map(fst)(args))(type$slcon_to_var(set$slfrom_list(map(fst)(args)))(type))))
let type$slcon_to_var_ = (vars) => (type) => (($target) => {
if ($target.type === "trow") {
return fatal("cant apply a row")
} ;
if ($target.type === "trec") {
let name = $target[0];
let nl = $target[1];
let inner = $target[2];
let l = $target[3];
return trec(name)(nl)(type$slcon_to_var(vars)(inner))(l)
} ;
if ($target.type === "tvar") {
return type
} ;
if ($target.type === "tcon") {
let name = $target[0];
let l = $target[1];
{
let $target = set$slhas(vars)(name);
if ($target === true) {
return tvar(name)(l)
} ;
return type;
throw new Error('match fail 5640:' + JSON.stringify($target))
}
} ;
if ($target.type === "tapp") {
let a = $target[0];
let b = $target[1];
let l = $target[2];
return tapp(type$slcon_to_var(vars)(a))(type$slcon_to_var(vars)(b))(l)
} ;
throw new Error('match fail 5625:' + JSON.stringify($target))
})(type)
let type$slresolve_aliases = (aliases) => (type) => {
let {"1": args, "0": target} = type$slunroll_app(type);
{
let args$$0 = args;
{
let args = map(type$slresolve_aliases(aliases))(reverse(map(fst)(args$$0)));
{
let $target = target;
if ($target.type === "tcon") {
let name = $target[0];
let l = $target[1];
{
let $target = map$slget(aliases)(name);
if ($target.type === "some") {
if ($target[0].type === ",") {
let free = $target[0][0];
let type = $target[0][1];
{
let subst = map$slfrom_list(zip(free)(args));
return type$slresolve_aliases(aliases)(type$slapply(subst)(type))
}
} 
} ;
return foldl(target)(args)((a) => (b) => tapp(a)(b)(l));
throw new Error('match fail 5813:' + JSON.stringify($target))
}
} ;
if ($target.type === "tvar") {
let l = $target[1];
return foldl(target)(args)((a) => (b) => tapp(a)(b)(l))
} ;
return target;
throw new Error('match fail 5806:' + JSON.stringify($target))
}
}
}
}
let split_stmts = (stmts) => loop(stmts)((stmts) => (recur) => (($target) => {
if ($target.type === "nil") {
return $co(nil)($co(nil)($co(nil)(nil)))
} ;
if ($target.type === "cons") {
let stmt = $target[0];
let rest = $target[1];
{
let {"1": {"1": {"1": others, "0": exprs}, "0": aliases}, "0": defs} = recur(rest);
{
let $target = stmt;
if ($target.type === "tdef") {
let name = $target[0];
let nl = $target[1];
let body = $target[2];
let l = $target[3];
return $co(cons($co(name)($co(nl)($co(body)(l))))(defs))($co(aliases)($co(exprs)(others)))
} ;
if ($target.type === "ttypealias") {
return $co(defs)($co(cons(stmt)(aliases))($co(exprs)(others)))
} ;
if ($target.type === "texpr") {
let expr = $target[0];
let l = $target[1];
return $co(defs)($co(aliases)($co(cons(expr)(exprs))(others)))
} ;
return $co(defs)($co(aliases)($co(exprs)(cons(stmt)(others))));
throw new Error('match fail 6045:' + JSON.stringify($target))
}
}
} ;
throw new Error('match fail 6012:' + JSON.stringify($target))
})(stmts))
let infer$slquot = (quot) => (l) => (($target) => {
if ($target.type === "quot/expr") {
return tcon("expr")(l)
} ;
if ($target.type === "quot/top") {
return tcon("top")(l)
} ;
if ($target.type === "quot/type") {
return tcon("type")(l)
} ;
if ($target.type === "quot/pat") {
return tcon("pat")(l)
} ;
if ($target.type === "quot/quot") {
return tcon("cst")(l)
} ;
throw new Error('match fail 6714:' + JSON.stringify($target))
})(quot)
let scope$slapply = (subst) => (scope) => map$slmap(scheme$slapply(subst))(scope)
let scope$slapply_$gt = apply_$gt(scope$slapply)
let scheme$slapply_$gt = apply_$gt(scheme$slapply)
let scheme_$gts = ({"1": type, "0": vbls}) => (($target) => {
if ($target.type === "nil") {
return type_$gts(type)
} ;
{
let vbls = $target;
return `forall ${join(" ")(vbls)} : ${type_$gts(type)}`
};
throw new Error('match fail 6284:' + JSON.stringify($target))
})(set$slto_list(vbls))
let pattern_to_ex_pattern = (tenv) => ({"1": type, "0": pattern}) => (($target) => {
if ($target.type === "pvar") {
return ex$slany
} ;
if ($target.type === "pany") {
return ex$slany
} ;
if ($target.type === "precord") {
let pfields = $target[0];
let pspread = $target[1];
let l = $target[2];
{
let $target = type;
if ($target.type === "trow") {
let fields = $target[0];
let spread = $target[1];
let kind = $target[2];
let l = $target[3];
{
let spread$$0 = spread;
{
let {"1": spread, "0": fmap} = deep_map(fields)(spread$$0)(kind);
{
(($target) => {
if ($target.type === "none") {
return $unit
} ;
if ($target.type === "some") {
if ($target[0].type === "pany") {
return $unit
} 
} ;
if ($target.type === "some") {
if ($target[0].type === "pvar") {
return $unit
} 
} ;
return fatal("spread pattern must be any or var");
throw new Error('match fail 16762:' + JSON.stringify($target))
})(pspread);
{
let pmap = map$slfrom_list(pfields);
return ex$slconstructor("record")(gnames(cons("record")(nil))(none))(loop(map$slto_list(fmap))((fields) => (recur) => (($target) => {
if ($target.type === "nil") {
return cons(ex$slany)(nil)
} ;
if ($target.type === "cons") {
if ($target[0].type === ",") {
let key = $target[0][0];
let type = $target[0][1];
let rest = $target[1];
return cons((($target) => {
if ($target.type === "none") {
return ex$slany
} ;
if ($target.type === "some") {
let p = $target[0];
return pattern_to_ex_pattern(tenv)($co(p)(type))
} ;
throw new Error('match fail 16731:' + JSON.stringify($target))
})(map$slget(pmap)(key)))(recur(rest))
} 
} ;
throw new Error('match fail 16715:' + JSON.stringify($target))
})(fields)))
}
}
}
}
} ;
return fatal("record type not a row");
throw new Error('match fail 14435:' + JSON.stringify($target))
}
} ;
if ($target.type === "penum") {
let tag = $target[0];
let tl = $target[1];
let arg = $target[2];
let l = $target[3];
{
let $target = type;
if ($target.type === "trow") {
let fields = $target[0];
let spread = $target[1];
let kind = $target[2];
let l = $target[3];
{
let spread$$0 = spread;
{
let {"1": spread, "0": map} = deep_map(fields)(spread$$0)(kind);
{
let $target = map$slget(map)(tag);
if ($target.type === "none") {
return fatal(`enum variant ${tag} not contained in type`)
} ;
if ($target.type === "some") {
let argt = $target[0];
return ex$slconstructor(tag)(gnames(map$slkeys(map))((($target) => {
if ($target.type === "none") {
return none
} ;
if ($target.type === "some") {
if ($target[0].type === "tvar") {
let id = $target[0][0];
return some(id)
} 
} ;
if ($target.type === "some") {
let t = $target[0];
return fatal("spread not a tvar?")
} ;
throw new Error('match fail 16941:' + JSON.stringify($target))
})(spread)))((($target) => {
if ($target.type === "some") {
let arg = $target[0];
return cons(pattern_to_ex_pattern(tenv)($co(arg)(argt)))(nil)
} ;
return nil;
throw new Error('match fail 16396:' + JSON.stringify($target))
})(arg))
} ;
throw new Error('match fail 16370:' + JSON.stringify($target))
}
}
}
} ;
return fatal("enum type not a row");
throw new Error('match fail 14445:' + JSON.stringify($target))
}
} ;
if ($target.type === "pstr") {
let str = $target[0];
return ex$slconstructor(str)(ginf("string"))(nil)
} ;
if ($target.type === "pprim") {
if ($target[0].type === "pint") {
let v = $target[0][0];
return ex$slconstructor(int_to_string(v))(ginf("int"))(nil)
} 
} ;
if ($target.type === "pprim") {
if ($target[0].type === "pbool") {
let v = $target[0][0];
return ex$slconstructor((($target) => {
if ($target === true) {
return "true"
} ;
return "false";
throw new Error('match fail 10204:' + JSON.stringify($target))
})(v))(gnames(cons("true")(cons("false")(nil)))(none))(nil)
} 
} ;
if ($target.type === "pcon") {
if ($target[0] === "()") {
if ($target[2].type === "nil") {
return ex$slconstructor("()")(gnames(nil)(none))(nil)
} 
} 
} ;
if ($target.type === "pcon") {
let name = $target[0];
let args = $target[2];
let l = $target[3];
{
let {"1": targs, "0": tname} = tcon_and_args(type)(nil)(l);
{
let {"2": types, "1": tcons} = tenv;
{
let {"1": {"1": cres, "0": cargs}, "0": free_names} = (($target) => {
if ($target.type === "none") {
return fatal(`Unknown type constructor ${name}`)
} ;
if ($target.type === "some") {
let v = $target[0];
return v
} ;
throw new Error('match fail 10109:' + JSON.stringify($target))
})(map$slget(tcons)(name));
{
let subst = map$slfrom_list(zip(free_names)(targs));
return ex$slconstructor(name)((($target) => {
if ($target.type === "some") {
if ($target[0].type === ",") {
let names = $target[0][1];
return gnames(set$slto_list(names))(none)
} 
} ;
return fatal(`Unknown type ${tname}`);
throw new Error('match fail 16437:' + JSON.stringify($target))
})(map$slget(types)(tname)))(map(pattern_to_ex_pattern(tenv))(zip(args)(map(type$slapply(subst))(cargs))))
}
}
}
}
} ;
throw new Error('match fail 9888:' + JSON.stringify($target))
})(pattern)
let specialized_matrix = (constructor) => (arity) => (matrix) => concat(map(specialize_row(constructor)(arity))(matrix))
let find_gid = (heads) => fold_constructors(none)(heads)((gid) => (_10785) => (id) => (_10785) => (($target) => {
if ($target.type === "none") {
return some(id)
} ;
if ($target.type === "some") {
let oid = $target[0];
{
let $target = $ex$eq(oid)(id);
if ($target === true) {
return fatal("Constructors with different group IDs in the same position.")
} ;
return some(id);
throw new Error('match fail 10809:' + JSON.stringify($target))
}
} ;
throw new Error('match fail 10798:' + JSON.stringify($target))
})(gid))
let type_error = (message) => (loced_items) => terr(message)(loced_items)
let type_error_$gts = (err) => (($target) => {
if ($target.type === "twrap") {
let inner = $target[1];
return type_error_$gts(inner)
} ;
if ($target.type === "tmissing") {
let missing = $target[0];
return `Missing values: ${join("")(map(({"1": loc, "0": name}) => `\n - ${name} (${int_to_string(loc)})`)(missing))}`
} ;
if ($target.type === "ttypes") {
let t1 = $target[0];
let t2 = $target[1];
return `Incompatible types: ${scheme_$gts(t1)} and ${scheme_$gts(t2)}`
} ;
if ($target.type === "terr") {
let message = $target[0];
let names = $target[1];
return `${message}${join("")(map(({"1": loc, "0": name}) => `\n - ${name} (${int_to_string(loc)})`)(names))}`
} ;
throw new Error('match fail 12014:' + JSON.stringify($target))
})(err)
let err_to_fatal = (x) => (($target) => {
if ($target.type === "ok") {
let v = $target[0];
return v
} ;
if ($target.type === "err") {
let e = $target[0];
return fatal(`Result is err ${type_error_$gts(e)}`)
} ;
throw new Error('match fail 12111:' + JSON.stringify($target))
})(x)
let $lt_err = (x) => $lt_err$ti(terr(x)(nil))
let $lt_missing = (name) => (loc) => $lt_err$ti(tmissing(cons($co(name)(loc))(nil)))
let $lt_mismatch = (t1) => (t2) => $lt_err$ti(ttypes(forall(set$slnil)(t1))(forall(set$slnil)(t2)))
let expr_loc = (expr) => (($target) => {
if ($target.type === "evar") {
let l = $target[1];
return l
} ;
if ($target.type === "eprim") {
let l = $target[1];
return l
} ;
if ($target.type === "equot") {
let l = $target[1];
return l
} ;
if ($target.type === "estr") {
let l = $target[2];
return l
} ;
if ($target.type === "elambda") {
let l = $target[2];
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
if ($target.type === "eapp") {
let l = $target[2];
return l
} ;
if ($target.type === "ematch") {
let l = $target[2];
return l
} ;
if ($target.type === "elet") {
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
throw new Error('match fail 13630:' + JSON.stringify($target))
})(expr)
let substs_$gts = (substs) => join("\n")(map(({"1": t, "0": k}) => `${k} => ${type_$gts(t)}`)(map$slto_list(substs)))
let find_missing = (matrix) => (($target) => {
if ($target.type === "nil") {
return nil
} ;
if ($target.type === "cons") {
if ($target[0].type === "nil") {
return nil
} 
} ;
{
let {"1": {"1": anys, "0": by_cstr}, "0": gid} = group_rows(matrix);
{
let $target = gid;
if ($target.type === "none") {
return prefix("_")(find_missing(anys))
} ;
if ($target.type === "some") {
if ($target[0].type === "ginf") {
let name = $target[0][0];
{
let $target = anys;
if ($target.type === "nil") {
return cons($co(nil)(minf(name)))(nil)
} ;
return prefix(name)(find_missing(anys));
throw new Error('match fail 17357:' + JSON.stringify($target))
}
} 
} ;
if ($target.type === "some") {
if ($target[0].type === "gnames") {
let names = $target[0][0];
let open = $target[0][1];
{
let missing_fields = filter((k) => not(is_some(map$slget(by_cstr)(k))))(names);
{
let from_fields = concat(map((name) => (($target) => {
if ($target.type === "none") {
return nil
} ;
if ($target.type === "some") {
if ($target[0].type === ",") {
let n = $target[0][0];
let rows = $target[0][1];
{
let args = any_list(n);
return prefix(name)(find_missing(concat(cons(rows)(cons(map((row) => concat(cons(args)(cons(row)(nil))))(anys))(nil)))))
}
} 
} ;
throw new Error('match fail 17387:' + JSON.stringify($target))
})(map$slget(by_cstr)(name)))(names));
{
let from_any = (($target) => {
if ($target.type === ",") {
if ($target[0].type === "nil") {
return nil
} 
} ;
if ($target.type === ",") {
if ($target[1].type === "nil") {
return map((name) => $co(nil)(mname(name)))(missing_fields)
} 
} ;
if ($target.type === ",") {
return prefix("_")(find_missing(anys))
} ;
throw new Error('match fail 17471:' + JSON.stringify($target))
})($co(missing_fields)(anys));
{
let from_open = (($target) => {
if ($target.type === ",") {
if ($target[0].type === "none") {
return nil
} 
} ;
if ($target.type === ",") {
if ($target[0].type === "some") {
let id = $target[0][0];
if ($target[1].type === "nil") {
return cons($co(nil)(mopen(id)))(nil)
} 
} 
} ;
if ($target.type === ",") {
if ($target[0].type === "some") {
let id = $target[0][0];
let anys = $target[1];
{
let $target = missing_fields;
if ($target.type === "nil") {
return nil
} ;
return prefix("_")(find_missing(anys));
throw new Error('match fail 17542:' + JSON.stringify($target))
}
} 
} ;
throw new Error('match fail 17510:' + JSON.stringify($target))
})($co(open)(anys));
return concat(cons(from_any)(cons(from_open)(cons(from_fields)(nil))))
}
}
}
}
} 
} ;
throw new Error('match fail 17345:' + JSON.stringify($target))
}
};
throw new Error('match fail 17613:' + JSON.stringify($target))
})(matrix)
let free_spreads = (t) => type$slfold(set$slnil)((vbls) => (t) => (($target) => {
if ($target.type === "trow") {
if ($target[1].type === "some") {
if ($target[1][0].type === "tvar") {
let vbl = $target[1][0][0];
if ($target[2].type === "renum") {
return set$sladd(vbls)(vbl)
} 
} 
} 
} ;
return vbls;
throw new Error('match fail 18462:' + JSON.stringify($target))
})(t))(t)
let has_inf_recursion = (t1) => (t2) => (pairs) => any(({"1": b, "0": a}) => (($target) => {
if ($target === true) {
return type$eq(t2)(b)
} ;
return false;
throw new Error('match fail 19241:' + JSON.stringify($target))
})(type$eq(t1)(a)))(pairs)
let simplify_recursive_inner = (t) => (rvbl) => (($target) => {
if ($target.type === "tvar") {
let name = $target[0];
{
let $target = $eq(some(name))(rvbl);
if ($target === true) {
return some(snum(0))
} ;
return none;
throw new Error('match fail 20474:' + JSON.stringify($target))
}
} ;
if ($target.type === "tcon") {
return none
} ;
if ($target.type === "tapp") {
let target = $target[0];
let arg = $target[1];
let l = $target[2];
{
let $target = simplify_recursive_inner(target)(rvbl);
if ($target.type === "some") {
if ($target[0].type === "snum") {
let n = $target[0][0];
return some(snum(n + 1))
} 
} ;
if ($target.type === "some") {
if ($target[0].type === "stype") {
if ($target[0][3] === 0) {
return none
} 
} 
} ;
if ($target.type === "some") {
if ($target[0].type === "stype") {
let t2 = $target[0][0];
let name = $target[0][1];
let inner = $target[0][2];
if ($target[0][3] === 1) {
{
let $target = type$eq(tapp(t2)(arg)(l))(inner);
if ($target === true) {
return some(srep(trec(name)(l)(inner)(l)))
} ;
return none;
throw new Error('match fail 20535:' + JSON.stringify($target))
}
} 
} 
} ;
if ($target.type === "some") {
if ($target[0].type === "stype") {
let t2 = $target[0][0];
let name = $target[0][1];
let inner = $target[0][2];
let n = $target[0][3];
return some(stype(tapp(t2)(arg)(l))(name)(inner)(n - 1)(0))
} 
} ;
if ($target.type === "some") {
if ($target[0].type === "srep") {
let target = $target[0][0];
{
let $target = simplify_recursive_inner(arg)(rvbl);
if ($target.type === "some") {
if ($target[0].type === "srep") {
let arg = $target[0][0];
return some(srep(tapp(target)(arg)(l)))
} 
} ;
if ($target.type === "none") {
return some(srep(tapp(target)(arg)(l)))
} ;
return fatal("simplyfing down both arms somehow...");
throw new Error('match fail 20585:' + JSON.stringify($target))
}
} 
} ;
if ($target.type === "none") {
{
let $target = simplify_recursive_inner(arg)(rvbl);
if ($target.type === "some") {
if ($target[0].type === "snum") {
let n = $target[0][0];
return some(snum(n + 1))
} 
} ;
if ($target.type === "some") {
if ($target[0].type === "stype") {
if ($target[0][3] === 0) {
return none
} 
} 
} ;
if ($target.type === "some") {
if ($target[0].type === "stype") {
let t2 = $target[0][0];
let name = $target[0][1];
let inner = $target[0][2];
if ($target[0][3] === 1) {
{
let $target = type$eq(tapp(target)(t2)(l))(inner);
if ($target === true) {
return some(srep(trec(name)(l)(inner)(l)))
} ;
return none;
throw new Error('match fail 20660:' + JSON.stringify($target))
}
} 
} 
} ;
if ($target.type === "some") {
if ($target[0].type === "stype") {
let t2 = $target[0][0];
let name = $target[0][1];
let inner = $target[0][2];
let n = $target[0][3];
return some(stype(tapp(target)(t2)(l))(name)(inner)(n - 1)(0))
} 
} ;
if ($target.type === "some") {
if ($target[0].type === "srep") {
let arg = $target[0][0];
return some(srep(tapp(target)(arg)(l)))
} 
} ;
if ($target.type === "none") {
return none
} ;
throw new Error('match fail 20623:' + JSON.stringify($target))
}
} ;
throw new Error('match fail 20498:' + JSON.stringify($target))
}
} ;
if ($target.type === "trec") {
let name = $target[0];
let nl = $target[1];
let inner = $target[2];
let l = $target[3];
{
let $target = simplify_recursive_inner(inner)(some(name));
if ($target.type === "none") {
return none
} ;
if ($target.type === "some") {
if ($target[0].type === "snum") {
let n = $target[0][0];
return some(stype(tvar(name)(l))(name)(inner)(n)(0))
} 
} ;
if ($target.type === "some") {
return fatal("why stype at rec?")
} ;
throw new Error('match fail 20729:' + JSON.stringify($target))
}
} ;
return none;
throw new Error('match fail 20467:' + JSON.stringify($target))
})(t)
let types_$gts = dot(join(" "))(map(type_$gts))
let fn_args_and_body_effects = (type) => (($target) => {
if ($target.type === "tapp") {
if ($target[0].type === "tapp") {
if ($target[0][0].type === "tapp") {
if ($target[0][0][0].type === "tcon") {
if ($target[0][0][0][0] === "->") {
let effects = $target[0][0][1];
let arg = $target[0][1];
let res = $target[1];
{
let res$$0 = res;
{
let {"1": res, "0": pairs} = fn_args_and_body_effects(res$$0);
{
let $target = is_empty_effects(effects)(arg);
if ($target === true) {
{
let $target = pairs;
if ($target.type === "nil") {
return $co(cons($co(cons(arg)(nil))(none))(nil))(res)
} ;
if ($target.type === "cons") {
if ($target[0].type === ",") {
let args = $target[0][0];
let effects = $target[0][1];
let rest = $target[1];
return $co(cons($co(cons(arg)(args))(effects))(rest))(res)
} 
} ;
throw new Error('match fail 25734:' + JSON.stringify($target))
}
} ;
return $co(cons($co(cons(arg)(nil))(some(effects)))(pairs))(res);
throw new Error('match fail 25763:' + JSON.stringify($target))
}
}
}
} 
} 
} 
} 
} ;
return $co(nil)(type);
throw new Error('match fail 25624:' + JSON.stringify($target))
})(type)
let unify_inner = (t1) => (t2) => (recstate) => (l) => $gt$gt$eq(check_recursion(t1)(t2)(recstate))(({"1": {"1": recstate, "0": t2}, "0": t1}) => (($target) => {
if ($target.type === ",") {
if ($target[0].type === "tvar") {
let $var = $target[0][0];
let l = $target[0][1];
let t = $target[1];
return var_bind($var)(t)(l)
} 
} ;
if ($target.type === ",") {
let t = $target[0];
if ($target[1].type === "tvar") {
let $var = $target[1][0];
let l = $target[1][1];
return var_bind($var)(t)(l)
} 
} ;
if ($target.type === ",") {
if ($target[0].type === "tcon") {
let a = $target[0][0];
let la = $target[0][1];
if ($target[1].type === "tcon") {
let b = $target[1][0];
let lb = $target[1][1];
{
let $target = $eq(a)(b);
if ($target === true) {
return $lt_($unit)
} ;
return $lt_mismatch(t1)(t2);
throw new Error('match fail 1940:' + JSON.stringify($target))
}
} 
} 
} ;
if ($target.type === ",") {
if ($target[0].type === "trow") {
let f1 = $target[0][0];
let s1 = $target[0][1];
let k1 = $target[0][2];
let l = $target[0][3];
if ($target[1].type === "trow") {
let f2 = $target[1][0];
let s2 = $target[1][1];
let k2 = $target[1][2];
let l2 = $target[1][3];
{
let $target = $ex$eq(k1)(k2);
if ($target === true) {
return $lt_err("enum and record dont match")
} ;
return unify_trows(f1)(s1)(k1)(f2)(s2)(k2)(recstate)(l);
throw new Error('match fail 14691:' + JSON.stringify($target))
}
} 
} 
} ;
if ($target.type === ",") {
if ($target[0].type === "tapp") {
let t1 = $target[0][0];
let a1 = $target[0][1];
if ($target[1].type === "tapp") {
let t2 = $target[1][0];
let a2 = $target[1][1];
return $gt$gt$eq(unify_inner(t1)(t2)(recstate)(l))((_2047) => $gt$gt$eq($lt_subst)((subst) => $gt$gt$eq(unify_inner(type$slapply(subst)(a1))(type$slapply(subst)(a2))(recstate)(l))((_2047) => $lt_($unit))))
} 
} 
} ;
return $lt_mismatch(t1)(t2);
throw new Error('match fail 1896:' + JSON.stringify($target))
})($co(t1)(t2)))

let check_recursion = (t1) => (t2) => ({"1": {"1": count, "0": pairs}, "0": lookup}) => {
let pairs$$0 = pairs;
{
let lookup$$1 = lookup;
{
let t2$$2 = t2;
{
let t1$$3 = t1;
{
let {"1": {"1": {"1": pairs, "0": lookup}, "0": t2}, "0": t1} = (($target) => {
if ($target === true) {
{
let $target = has_inf_recursion(t1$$3)(t2$$2)(pairs$$0);
if ($target === true) {
return fatal("infinite recursion looks like")
} ;
{
let {"1": t1, "0": lookup} = add_rec(lookup$$1)(t1$$3);
{
let {"1": t2, "0": lookup} = add_rec(lookup$$1)(t2$$2);
return $co(t1)($co(t2)($co(lookup)(cons($co(t1)(t2))(pairs$$0))))
}
};
throw new Error('match fail 19532:' + JSON.stringify($target))
}
} ;
return $co(t1$$3)($co(t2$$2)($co(lookup$$1)(pairs$$0)));
throw new Error('match fail 19526:' + JSON.stringify($target))
})(is_rec_pair(t1$$3)(t2$$2));
{
(($target) => {
if ($target === true) {
return fatal("100 deep in unify")
} ;
return $unit;
throw new Error('match fail 27227:' + JSON.stringify($target))
})(count > 100);
return $gt$gt$eq(lookup_rec(t1)(lookup))((r1) => $gt$gt$eq(lookup_rec(t2)(lookup))((r2) => $lt_((($target) => {
if ($target.type === ",") {
if ($target[0].type === "some") {
let t1 = $target[0][0];
if ($target[1].type === "some") {
let t2 = $target[1][0];
{
let $target = equal_modulo_vbls(t1)(t2);
if ($target === true) {
return $co(tcon("\$recur")(-1))($co(tcon("\$recur")(-1))($co(lookup)($co(pairs)(count))))
} ;
return $co(t1)($co(t2)($co(lookup)($co(pairs)(1 + count))));
throw new Error('match fail 19660:' + JSON.stringify($target))
}
} 
} 
} ;
if ($target.type === ",") {
if ($target[0].type === "some") {
let t1 = $target[0][0];
if ($target[1].type === "none") {
return $co(t1)($co(t2)($co(lookup)($co(pairs)(1 + count))))
} 
} 
} ;
if ($target.type === ",") {
if ($target[0].type === "none") {
if ($target[1].type === "some") {
let t2 = $target[1][0];
return $co(t1)($co(t2)($co(lookup)($co(pairs)(1 + count))))
} 
} 
} ;
return $co(t1)($co(t2)($co(lookup)($co(pairs)(count))));
throw new Error('match fail 19456:' + JSON.stringify($target))
})($co(r1)(r2)))))
}
}
}
}
}
}

let unify_trows = (f1) => (s1) => (k1) => (f2) => (s2) => (k2) => (recstate) => (l) => $gt$gt$eq(identify_unique(f1)(s1)(f2)(s2)(recstate)(k1))(({"1": {"1": {"1": s2, "0": u2}, "0": s1}, "0": u1}) => $gt$gt$eq($lt_((($target) => {
if ($target.type === ",") {
if ($target[0].type === "some") {
if ($target[1].type === "some") {
return true
} 
} 
} ;
return false;
throw new Error('match fail 15655:' + JSON.stringify($target))
})($co(s1)(s2))))((open) => $gt$gt$eq((($target) => {
if ($target.type === ",") {
if ($target[1].type === "nil") {
return $lt_($unit)
} 
} ;
if ($target.type === ",") {
if ($target[0].type === "some") {
let s1 = $target[0][0];
return $gt$gt$eq((($target) => {
if ($target === true) {
return wrap_ok(new_type_var("row")(l))
} ;
return $lt_(none);
throw new Error('match fail 15690:' + JSON.stringify($target))
})(open))((v2) => unify_inner(s1)(trow(u2)(v2)(k1)(l))(recstate)(l))
} 
} ;
return $lt_err("unique fields on the right but no spread on the left");
throw new Error('match fail 14723:' + JSON.stringify($target))
})($co(s1)(u2)))((_14702) => $gt$gt$eq((($target) => {
if ($target.type === ",") {
if ($target[1].type === "nil") {
return $lt_($unit)
} 
} ;
if ($target.type === ",") {
if ($target[0].type === "some") {
let s2 = $target[0][0];
return $gt$gt$eq((($target) => {
if ($target === true) {
return wrap_ok(new_type_var("row")(l))
} ;
return $lt_(none);
throw new Error('match fail 15700:' + JSON.stringify($target))
})(open))((v1) => unify_inner(s2)(trow(u1)(v1)(k2)(l))(recstate)(l))
} 
} ;
return $lt_err("unique fields on the left but no spread on the right");
throw new Error('match fail 14753:' + JSON.stringify($target))
})($co(s2)(u1)))((_14702) => $lt_($unit)))))

let equal_modulo_vbls = (t1) => (t2) => {
let {"1": res, "0": {"1": {"0": subst}}} = state_f(unify(t1)(t2)(-1))(state$slnil);
{
let $target = res;
if ($target.type === "ok") {
return all(({"1": v}) => (($target) => {
if ($target.type === "tvar") {
return true
} ;
return false;
throw new Error('match fail 19718:' + JSON.stringify($target))
})(v))(map$slto_list(subst))
} ;
return false;
throw new Error('match fail 21873:' + JSON.stringify($target))
}
}

let identify_unique = (fields1) => (spread1) => (fields2) => (spread2) => (recstate) => (k) => {
let spread1$$0 = spread1;
{
let {"1": spread1, "0": map1} = deep_map(fields1)(spread1$$0)(k);
{
let spread2$$0 = spread2;
{
let {"1": spread2, "0": map2} = deep_map(fields2)(spread2$$0)(k);
{
let {"1": {"1": u2, "0": shared}, "0": u1} = partition_keys(map1)(map2);
return $gt$gt$eq(map_$gt(({"1": {"1": t2, "0": t1}, "0": key}) => unify_inner(t1)(t2)(recstate)(-1))(shared))((_14893) => $lt_($co(u1)($co(spread1)($co(u2)(spread2)))))
}
}
}
}
}

let unify = (t1) => (t2) => (l) => map_err_$gt(unify_inner(t1)(t2)($co(map$slnil)($co(nil)(0)))(l))((inner) => err(twrap(ttypes(forall(set$slnil)(t1))(forall(set$slnil)(t2)))(inner)))
let tenv$slapply = (subst) => ({"3": aliases, "2": types, "1": tcons, "0": values}) => tenv(scope$slapply(subst)(values))(tcons)(types)(aliases)
let tenv$slapply_$gt = apply_$gt(tenv$slapply)
let instantiate_tcon = ({"1": tcons}) => (name) => (l) => (($target) => {
if ($target.type === "none") {
return $lt_err(`Unknown type constructor: ${name}`)
} ;
if ($target.type === "some") {
if ($target[0].type === ",") {
let free = $target[0][0];
if ($target[0][1].type === ",") {
let cargs = $target[0][1][0];
let cres = $target[0][1][1];
return $gt$gt$eq(make_subst_for_free(set$slfrom_list(free))(l))((subst) => $lt_($co(map(type$slapply(subst))(cargs))(type$slapply(subst)(cres))))
} 
} 
} ;
throw new Error('match fail 4084:' + JSON.stringify($target))
})(map$slget(tcons)(name))
let add$sldeftype = ({"3": aliases, "2": types, "1": tcons}) => (name) => (args) => (constrs) => (l) => {
let free = map(fst)(args);
{
let free_set = set$slfrom_list(free);
{
let res = foldl(tcon(name)(l))(args)((inner) => ({"1": l, "0": name}) => tapp(inner)(tvar(name)(l))(l));
{
let parsed_constrs = map(({"1": {"1": {"0": args}}, "0": name}) => {
let args$$0 = args;
{
let args = map(type$slcon_to_var(free_set))(args$$0);
{
let args$$0 = args;
{
let args = map(type$slresolve_aliases(aliases))(args$$0);
return $co(name)($co(free)($co(args)(res)))
}
}
}
})(constrs);
return tenv(map$slfrom_list(map(({"1": {"1": {"1": res, "0": args}, "0": free}, "0": name}) => $co(name)(forall(set$slfrom_list(free))(tfns(args)(res)(l))))(parsed_constrs)))(map$slfrom_list(parsed_constrs))(map$slset(map$slnil)(name)($co(length(args))(set$slfrom_list(map(fst)(constrs)))))(map$slnil)
}
}
}
}
let check_exhaustiveness = (tenv) => (target_type) => (patterns) => (l) => $gt$gt$eq(type$slapply_$gt(target_type))((target_type) => $gt$gt$eq($lt_(map((pat) => cons(pattern_to_ex_pattern(tenv)($co(pat)(target_type)))(nil))(patterns)))((matrix) => $gt$gt$eq(filter_$gt(({"1": missing}) => (($target) => {
if ($target.type === "mopen") {
let vbl = $target[0];
return $gt$gt$eq(unify(tvar(vbl)(-1))(trow(nil)(none)(renum)(-1))(-1))((_17897) => $lt_(false))
} ;
return $lt_(true);
throw new Error('match fail 17890:' + JSON.stringify($target))
})(missing))(find_missing(matrix)))((missing) => (($target) => {
if ($target.type === "nil") {
return $lt_($unit)
} ;
{
let missing = $target;
return $lt_err(`Match not exhaustive ${int_to_string(l)}: \n${join("\n")(map(missing_$gts)(missing))}`)
};
throw new Error('match fail 17555:' + JSON.stringify($target))
})(missing))))
let args_if_complete = (matrix) => {
let heads = matrix_heads(matrix);
{
let gid = find_gid(heads);
{
let $target = gid;
if ($target.type === "none") {
return map$slnil
} ;
if ($target.type === "some") {
let gid = $target[0];
{
let found = map$slfrom_list(fold_constructors(nil)(heads)((found) => (id) => (_10985) => (args) => cons($co(id)(length(args)))(found)));
{
let $target = gid;
if ($target.type === "ginf") {
return map$slnil
} ;
if ($target.type === "gnames") {
let constrs = $target[0];
if ($target[1].type === "some") {
let open = $target[1][0];
return map$slnil
} 
} ;
if ($target.type === "gnames") {
let constrs = $target[0];
return loop(constrs)((constrs) => (recur) => (($target) => {
if ($target.type === "nil") {
return found
} ;
if ($target.type === "cons") {
let id = $target[0];
let rest = $target[1];
{
let $target = map$slget(found)(id);
if ($target.type === "none") {
return map$slnil
} ;
if ($target.type === "some") {
return recur(rest)
} ;
throw new Error('match fail 10952:' + JSON.stringify($target))
}
} ;
throw new Error('match fail 10864:' + JSON.stringify($target))
})(constrs))
} ;
throw new Error('match fail 10846:' + JSON.stringify($target))
}
}
} ;
throw new Error('match fail 10704:' + JSON.stringify($target))
}
}
}
let type_$gtcst_inner = (type) => (($target) => {
if ($target.type === "trow") {
let fields = $target[0];
let spread = $target[1];
let kind = $target[2];
let l = $target[3];
{
let spread$$0 = spread;
{
let {"1": spread, "0": fmap} = deep_map(fields)(spread$$0)(kind);
{
let fields = map$slto_list(fmap);
{
let $target = kind;
if ($target.type === "rrecord") {
return $gt$gt$eq(map_$gt(({"1": v, "0": k}) => $gt$gt$eq(type_$gtcst_inner(v))((v) => $lt_(cons(cst$slid(k)(l))(cons(v)(nil)))))(fields))((fields) => $gt$gt$eq((($target) => {
if ($target.type === "none") {
return $lt_(nil)
} ;
if ($target.type === "some") {
let v = $target[0];
return $gt$gt$eq(type_$gtcst_inner(v))((v) => $lt_(cons(cst$slspread(v)(l))(nil)))
} ;
throw new Error('match fail 25259:' + JSON.stringify($target))
})(spread))((spread) => $lt_(cst$slrecord(concat(cons(concat(fields))(cons(spread)(nil))))(l))))
} ;
if ($target.type === "renum") {
return $gt$gt$eq(map_$gt(({"1": v, "0": k}) => (($target) => {
if ($target.type === "tcon") {
if ($target[0] === "()") {
return $lt_(cst$slid(`'${k}`)(l))
} 
} ;
return $gt$gt$eq(type_$gtcst_inner(v))((v) => $lt_(cst$sllist(cons(cst$slid(`'${k}`)(l))(cons(v)(nil)))(l)));
throw new Error('match fail 25305:' + JSON.stringify($target))
})(v))(fields))((fields) => $gt$gt$eq((($target) => {
if ($target.type === "none") {
return $lt_(nil)
} ;
if ($target.type === "some") {
let v = $target[0];
return $gt$gt$eq(type_$gtcst_inner(v))((v) => $lt_(cons(cst$slspread(v)(l))(nil)))
} ;
throw new Error('match fail 25350:' + JSON.stringify($target))
})(spread))((spread) => $lt_(cst$slarray(concat(cons(fields)(cons(spread)(nil))))(l))))
} ;
throw new Error('match fail 18610:' + JSON.stringify($target))
}
}
}
}
} ;
if ($target.type === "tvar") {
let name = $target[0];
let l = $target[1];
return $gt$gt$eq(type_vbl_name(name))((name) => $lt_(cst$slid(name)(l)))
} ;
if ($target.type === "tcon") {
let name = $target[0];
let l = $target[1];
return $lt_(cst$slid(name)(l))
} ;
if ($target.type === "trec") {
let name = $target[0];
let nl = $target[1];
let inner = $target[2];
let l = $target[3];
return $gt$gt$eq(type_vbl_name(name))((name) => $gt$gt$eq(type_$gtcst_inner(inner))((inner) => $lt_(cst$sllist(cons(cst$slid("rec")(l))(cons(cst$slid(name)(nl))(cons(inner)(nil))))(l))))
} ;
if ($target.type === "tapp") {
if ($target[0].type === "tapp") {
if ($target[0][0].type === "tapp") {
if ($target[0][0][0].type === "tcon") {
if ($target[0][0][0][0] === "->") {
let l = $target[0][2];
return $gt$gt$eq($lt_(fn_args_and_body_effects(type)))(({"1": res, "0": pairs}) => $gt$gt$eq(type_$gtcst_inner(res))((res) => $gt$gt$eq(foldr_$gt(res)(pairs)((res) => ({"1": effects, "0": args}) => $gt$gt$eq(map_$gt(type_$gtcst_inner)(args))((args) => $gt$gt$eq((($target) => {
if ($target.type === "none") {
return $lt_(nil)
} ;
if ($target.type === "some") {
if ($target[0].type === "tvar") {
let n = $target[0][0];
let l = $target[0][1];
return $gt$gt$eq(type_vbl_name(n))((name) => $lt_(cons(cst$slrecord(cons(cst$slid(name)(l))(nil))(l))(nil)))
} 
} ;
if ($target.type === "some") {
let e = $target[0];
return $gt$gt$eq(type_$gtcst_inner(e))((e) => $lt_(cons(e)(nil)))
} ;
throw new Error('match fail 25861:' + JSON.stringify($target))
})(effects))((effects) => $lt_(cst$sllist(concat(cons(cons(cst$slid("fn")(l))(cons(cst$slarray(args)(l))(nil)))(cons(effects)(cons(cons(res)(nil))(nil)))))(l))))))((res) => $lt_(res))))
} 
} 
} 
} 
} ;
if ($target.type === "tapp") {
if ($target[0].type === "tapp") {
if ($target[0][0].type === "tcon") {
if ($target[0][0][0] === ",") {
let cl = $target[0][0][1];
let a = $target[0][1];
let b = $target[1];
let l = $target[2];
return $gt$gt$eq(map_$gt(type_$gtcst_inner)(unwrap_tuple_type(type)))((all) => $lt_(cst$sllist(cons(cst$slid(",")(cl))(all))(l)))
} 
} 
} 
} ;
if ($target.type === "tapp") {
let l = $target[2];
return $gt$gt$eq($lt_(target_and_args(type)(nil)))(({"1": args, "0": name}) => $gt$gt$eq(type_$gtcst_inner(name))((name) => $gt$gt$eq(map_$gt(type_$gtcst_inner)(args))((args) => $lt_(cst$sllist(cons(name)(args))(l)))))
} ;
throw new Error('match fail 13013:' + JSON.stringify($target))
})(type)
let restrict_poly_enum = (t) => {
let {"1": res, "0": args} = fn_args_and_body(t);
{
let free_in = foldl(set$slnil)(map(({"1": b, "0": a}) => set$slmerge(type$slfree(a))(type$slfree(b)))(args))(set$slmerge);
{
let vbls = set$sldiff(free_spreads(res))(free_in);
return $gt$gt$eq(do_$gt((vbl) => unify(tvar(vbl)(-1))(trow(nil)(none)(renum)(-1))(-1))(set$slto_list(vbls)))((_18207) => type$slapply_$gt(t))
}
}
}
let test_unify = ({"1": t2, "0": t1}) => run$slnil_$gt($gt$gt$eq($lt_(quot_tvar(t1)))((t1) => $gt$gt$eq($lt_(quot_tvar(t2)))((t2) => $gt$gt$eq(unify(t1)(t2)(-1))((_15423) => $gt$gt$eq($lt_subst)((subst) => $lt_($co(type$slapply(subst)(t1))(type$slapply(subst)(t2))))))))
let simplify_recursive2 = (type) => (($target) => {
if ($target.type === "some") {
if ($target[0].type === "srep") {
let t = $target[0][0];
return t
} 
} ;
if ($target.type === "some") {
if ($target[0].type === "stype") {
let t = $target[0][0];
let name = $target[0][1];
let inner = $target[0][2];
return type$slapply(map$slfrom_list(cons($co(name)(trec(name)(-1)(inner)(-1)))(nil)))(t)
} 
} ;
return type;
throw new Error('match fail 20338:' + JSON.stringify($target))
})(simplify_recursive_inner(type)(none))
let equal_modulo_vbls_subst = (t1) => (t2) => {
let {"1": res, "0": {"1": {"0": subst}}} = state_f(unify(t1)(t2)(-1))(state$slnil);
{
let $target = res;
if ($target.type === "ok") {
{
let $target = all(({"1": v}) => (($target) => {
if ($target.type === "tvar") {
return true
} ;
return false;
throw new Error('match fail 21671:' + JSON.stringify($target))
})(v))(map$slto_list(subst));
if ($target === true) {
return some(subst)
} ;
return none;
throw new Error('match fail 21684:' + JSON.stringify($target))
}
} ;
return none;
throw new Error('match fail 21864:' + JSON.stringify($target))
}
}
let type_$gtcst = (type) => {
let {"1": rse} = state_f(type_$gtcst_inner(type))($co(map$slnil)(0));
{
let $target = rse;
if ($target.type === "err") {
return fatal("no err")
} ;
if ($target.type === "ok") {
let v = $target[0];
return v
} ;
throw new Error('match fail 25573:' + JSON.stringify($target))
}
}
let infer$slpattern = (tenv) => (pattern) => (($target) => {
if ($target.type === "pvar") {
let name = $target[0];
let l = $target[1];
return $gt$gt$eq(new_type_var(name)(l))((v) => $gt$gt$eq(record_type_$gt(v)(l)(false))((_4285) => $lt_($co(v)(map$slfrom_list(cons($co(name)(forall(set$slnil)(v)))(nil))))))
} ;
if ($target.type === "pany") {
let l = $target[0];
return $gt$gt$eq(new_type_var("any")(l))((v) => $lt_($co(v)(map$slnil)))
} ;
if ($target.type === "pstr") {
let l = $target[1];
return $lt_($co(tcon("string")(l))(map$slnil))
} ;
if ($target.type === "pprim") {
if ($target[0].type === "pbool") {
let l = $target[1];
return $lt_($co(tcon("bool")(l))(map$slnil))
} 
} ;
if ($target.type === "pprim") {
if ($target[0].type === "pint") {
let l = $target[1];
return $lt_($co(tcon("int")(l))(map$slnil))
} 
} ;
if ($target.type === "precord") {
let fields = $target[0];
let spread = $target[1];
let l = $target[2];
return $gt$gt$eq(map_$gt(({"1": pat, "0": name}) => $gt$gt$eq(infer$slpattern(tenv)(pat))(({"1": scope, "0": arg}) => $lt_($co($co(name)(arg))(scope))))(fields))((tfields) => $gt$gt$eq($lt_(unzip(tfields)))(({"1": scopes, "0": tfields}) => $gt$gt$eq((($target) => {
if ($target.type === "none") {
return $gt$gt$eq(new_type_var("spread")(l))((t) => $lt_($co(t)(map$slnil)))
} ;
if ($target.type === "some") {
let t = $target[0];
return infer$slpattern(tenv)(t)
} ;
throw new Error('match fail 16161:' + JSON.stringify($target))
})(spread))(({"1": sscope, "0": spread}) => $lt_($co(trow(tfields)(some(spread))(rrecord)(l))(foldl(sscope)(scopes)(map$slmerge))))))
} ;
if ($target.type === "penum") {
let tag = $target[0];
let tl = $target[1];
let arg = $target[2];
let l = $target[3];
return $gt$gt$eq((($target) => {
if ($target.type === "some") {
let arg = $target[0];
return infer$slpattern(tenv)(arg)
} ;
return $lt_($co(tcon("()")(tl))(map$slnil));
throw new Error('match fail 16108:' + JSON.stringify($target))
})(arg))(({"1": scope, "0": carg}) => $gt$gt$eq(new_type_var(tag)(tl))((t) => $lt_($co(trow(cons($co(tag)(carg))(nil))(some(t))(renum)(l))(scope))))
} ;
if ($target.type === "pcon") {
let name = $target[0];
let args = $target[2];
let l = $target[3];
return $gt$gt$eq(instantiate_tcon(tenv)(name)(l))(({"1": cres, "0": cargs}) => $gt$gt$eq(record_type_$gt(tfns(cargs)(cres)(l))(l)(false))((_4032) => $gt$gt$eq(map_$gt(infer$slpattern(tenv))(args))((sub_patterns) => $gt$gt$eq($lt_(unzip(sub_patterns)))(({"1": scopes, "0": arg_types}) => $gt$gt$eq(do_$gt(({"1": ctype, "0": ptype}) => unify(ptype)(ctype)(l))(zip(arg_types)(cargs)))((_4032) => $gt$gt$eq(type$slapply_$gt(cres))((cres) => $gt$gt$eq($lt_(foldl(map$slnil)(scopes)(map$slmerge)))((scope) => $lt_($co(cres)(scope)))))))))
} ;
throw new Error('match fail 3998:' + JSON.stringify($target))
})(pattern)
let is_useful = (matrix) => (row) => {
let head_and_rest = (($target) => {
if ($target.type === "nil") {
return none
} ;
if ($target.type === "cons") {
if ($target[0].type === "nil") {
return none
} 
} ;
if ($target.type === "cons") {
{
let $target = row;
if ($target.type === "nil") {
return none
} ;
if ($target.type === "cons") {
let head = $target[0];
let rest = $target[1];
return some($co(head)(rest))
} ;
throw new Error('match fail 11050:' + JSON.stringify($target))
}
} ;
throw new Error('match fail 11038:' + JSON.stringify($target))
})(matrix);
{
let $target = head_and_rest;
if ($target.type === "none") {
return false
} ;
if ($target.type === "some") {
if ($target[0].type === ",") {
let head = $target[0][0];
let rest = $target[0][1];
{
let $target = head;
if ($target.type === "ex/constructor") {
let id = $target[0];
let args = $target[2];
return is_useful(specialized_matrix(id)(length(args))(matrix))(concat(cons(args)(cons(rest)(nil))))
} ;
if ($target.type === "ex/any") {
{
let $target = map$slto_list(args_if_complete(matrix));
if ($target.type === "nil") {
{
let $target = default_matrix(matrix);
if ($target.type === "nil") {
return true
} ;
{
let defaults = $target;
return is_useful(defaults)(rest)
};
throw new Error('match fail 10407:' + JSON.stringify($target))
}
} ;
{
let alts = $target;
return any(({"1": alt, "0": id}) => is_useful(specialized_matrix(id)(alt)(matrix))(concat(cons(any_list(alt))(cons(rest)(nil)))))(alts)
};
throw new Error('match fail 10395:' + JSON.stringify($target))
}
} ;
throw new Error('match fail 10381:' + JSON.stringify($target))
}
} 
} ;
throw new Error('match fail 11090:' + JSON.stringify($target))
}
}
let scheme_$gtcst = ({"1": type, "0": vbls}) => type_$gtcst(type)
let simplify_recursive = (type) => {
let recursives = find_recursives(type);
{
let simplify = (type) => loop(recursives)((recs) => (recur) => (($target) => {
if ($target.type === "nil") {
return type
} ;
if ($target.type === "cons") {
let one = $target[0];
let rest = $target[1];
{
let $target = equal_modulo_vbls_subst(one)(type);
if ($target.type === "none") {
return recur(rest)
} ;
if ($target.type === "some") {
let subst = $target[0];
return type$slapply(subst)(one)
} ;
throw new Error('match fail 21608:' + JSON.stringify($target))
}
} ;
throw new Error('match fail 21596:' + JSON.stringify($target))
})(recs));
{
let $target = recursives;
if ($target.type === "nil") {
return type
} ;
return type$slmap_post(simplify)(type);
throw new Error('match fail 21531:' + JSON.stringify($target))
}
}
}
let infer$slexpr_inner = (tenv) => (expr) => (($target) => {
if ($target.type === "erecord") {
let spread = $target[0];
let items = $target[1];
let l = $target[2];
return $gt$gt$eq((($target) => {
if ($target.type === "none") {
return $lt_(none)
} ;
if ($target.type === "some") {
if ($target[0].type === ",") {
let expr = $target[0][0];
let end = $target[0][1];
return $gt$gt$eq(infer$slexpr(tenv)(expr))((type) => $lt_(some($co(type)(end))))
} 
} ;
throw new Error('match fail 14215:' + JSON.stringify($target))
})(spread))((spread) => $gt$gt$eq(map_$gt(({"1": value, "0": name}) => $gt$gt$eq(infer$slexpr(tenv)(value))((value) => $lt_($co(name)(value))))(items))((items) => $gt$gt$eq((($target) => {
if ($target.type === "none") {
return $lt_(none)
} ;
if ($target.type === "some") {
if ($target[0].type === ",") {
let spread = $target[0][0];
if ($target[0][1] === false) {
return $gt$gt$eq(new_type_var("record")(l))((t) => $gt$gt$eq(unify(trow(items)(some(t))(rrecord)(l))(spread)(l))((_14382) => $gt$gt$eq(type$slapply_$gt(t))((t) => $lt_(some(t)))))
} 
} 
} ;
if ($target.type === "some") {
if ($target[0].type === ",") {
let spread = $target[0][0];
if ($target[0][1] === true) {
return $lt_(some(spread))
} 
} 
} ;
throw new Error('match fail 14368:' + JSON.stringify($target))
})(spread))((spread) => type$slapply_$gt(trow(items)(spread)(rrecord)(l)))))
} ;
if ($target.type === "eaccess") {
let target = $target[0];
if ($target[1].type === "cons") {
if ($target[1][0].type === ",") {
let attr = $target[1][0][0];
let al = $target[1][0][1];
if ($target[1][1].type === "nil") {
let l = $target[2];
{
let $target = target;
if ($target.type === "none") {
return $gt$gt$eq(new_type_var("record")(l))((t) => $gt$gt$eq(new_type_var(attr)(l))((a) => $gt$gt$eq(new_type_var("effects")(l))((e) => $lt_(tfn(e)(trow(cons($co(attr)(a))(nil))(some(t))(rrecord)(l))(a)(l)))))
} ;
if ($target.type === "some") {
if ($target[0].type === ",") {
let name = $target[0][0];
let nl = $target[0][1];
return $gt$gt$eq((($target) => {
if ($target.type === "none") {
return $lt_missing(name)(nl)
} ;
if ($target.type === "some") {
let scheme = $target[0];
return $gt$gt$eq(record_if_generic(scheme)(l))((_14597) => instantiate(scheme)(nl))
} ;
throw new Error('match fail 14579:' + JSON.stringify($target))
})(tenv$slresolve(tenv)(name)))((target) => $gt$gt$eq(type$slapply_$gt(target))((target) => $gt$gt$eq(new_type_var("record")(l))((t) => $gt$gt$eq(new_type_var(attr)(al))((at) => $gt$gt$eq(unify(target)(trow(cons($co(attr)(at))(nil))(some(t))(rrecord)(l))(l))((_14575) => type$slapply_$gt(at))))))
} 
} ;
throw new Error('match fail 14567:' + JSON.stringify($target))
}
} 
} 
} 
} ;
if ($target.type === "eaccess") {
let target = $target[0];
let l = $target[2];
return fatal("not yet")
} ;
if ($target.type === "eenum") {
let tag = $target[0];
let nl = $target[1];
let arg = $target[2];
let l = $target[3];
return $gt$gt$eq(new_type_var(tag)(nl))((t) => $gt$gt$eq((($target) => {
if ($target.type === "none") {
return $lt_(tcon("()")(nl))
} ;
if ($target.type === "some") {
let arg = $target[0];
return infer$slexpr(tenv)(arg)
} ;
throw new Error('match fail 14324:' + JSON.stringify($target))
})(arg))((arg) => $lt_(trow(cons($co(tag)(arg))(nil))(some(t))(renum)(l))))
} ;
if ($target.type === "eeffect") {
let name = $target[0];
if ($target[1].type === "none") {
let l = $target[2];
return $gt$gt$eq((($target) => {
if ($target.type === "none") {
return $lt_missing("(effects)")(l)
} ;
if ($target.type === "some") {
if ($target[0].type === "forall") {
let t = $target[0][1];
return type$slapply_$gt(t)
} 
} ;
throw new Error('match fail 24995:' + JSON.stringify($target))
})(tenv$slresolve(tenv)("(effects)")))((effects) => $gt$gt$eq(new_type_var(name)(l))((result) => $gt$gt$eq(new_type_var("effects-rest")(l))((t) => $gt$gt$eq(unify(effects)(trow(cons($co(name)(result))(nil))(some(t))(rrecord)(l))(l))((_24991) => type$slapply_$gt(result)))))
} 
} ;
if ($target.type === "eeffect") {
let name = $target[0];
if ($target[1].type === "some") {
if ($target[1][0].type === ",") {
let args = $target[1][0][0];
let cr = $target[1][0][1];
let l = $target[2];
return $gt$gt$eq(infer$slexpr(tenv)(loop(args)((args) => (recur) => (($target) => {
if ($target.type === "nil") {
return evar("()")(l)
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
return fatal("no");
throw new Error('match fail 27467:' + JSON.stringify($target))
})(args))))((arg) => $gt$gt$eq((($target) => {
if ($target.type === "none") {
return $lt_missing("(effects)")(l)
} ;
if ($target.type === "some") {
if ($target[0].type === "forall") {
let t = $target[0][1];
return type$slapply_$gt(t)
} 
} ;
throw new Error('match fail 26086:' + JSON.stringify($target))
})(tenv$slresolve(tenv)("(effects)")))((effects) => $gt$gt$eq(new_type_var(name)(l))((result) => $gt$gt$eq(new_type_var("effects-rest")(l))((t) => $gt$gt$eq(new_type_var("ignore-effects")(l))((ignore_effects) => $gt$gt$eq(unify(effects)(trow(cons($co(name)(tfn(ignore_effects)(arg)(result)(l)))(nil))(some(t))(rrecord)(l))(l))((_26082) => $gt$gt$eq((($target) => {
if ($target === true) {
return $lt_(result)
} ;
return new_type_var("ignore-result")(l);
throw new Error('match fail 28705:' + JSON.stringify($target))
})(cr))((result) => type$slapply_$gt(result))))))))
} 
} 
} ;
if ($target.type === "eprovide") {
let target = $target[0];
let cases = $target[1];
let l = $target[2];
return $gt$gt$eq((($target) => {
if ($target.type === "none") {
return $lt_missing("(effects)")(l)
} ;
if ($target.type === "some") {
if ($target[0].type === "forall") {
let t = $target[0][1];
return type$slapply_$gt(t)
} 
} ;
throw new Error('match fail 25088:' + JSON.stringify($target))
})(tenv$slresolve(tenv)("(effects)")))((effects) => $gt$gt$eq(new_type_var("provide-result")(expr_loc(target)))((result) => $gt$gt$eq(new_type_var("k-effects")(expr_loc(target)))((k_effects) => $gt$gt$eq(map_$gt(({"1": {"1": {"1": expr, "0": kind}, "0": nl}, "0": name}) => (($target) => {
if ($target.type === "eearmuffs") {
return $gt$gt$eq(infer$slexpr(tenv)(expr))((body) => $lt_($co(name)(body)))
} ;
if ($target.type === "ebang") {
let args = $target[0];
return $gt$gt$eq(map_$gt(infer$slpattern(tenv))(args))((sub_patterns) => $gt$gt$eq($lt_(unzip(sub_patterns)))(({"1": scopes, "0": arg_types}) => $gt$gt$eq($lt_(foldl(map$slnil)(scopes)(map$slmerge)))((scope) => $gt$gt$eq(infer$slexpr(tenv$slwith_scope(tenv)(scope))(expr))((body) => $gt$gt$eq(type$slapply_$gt(result))((result) => $gt$gt$eq(unify(body)(result)(nl))((_25928) => $gt$gt$eq(new_type_var("any-result")(nl))((any_result) => $gt$gt$eq(new_type_var("effects")(nl))((ignore_effects) => $gt$gt$eq(map_$gt(type$slapply_$gt)(arg_types))((arg_types) => $lt_($co(name)(tfn(ignore_effects)(loop(arg_types)((args) => (recur) => (($target) => {
if ($target.type === "nil") {
return tcon("()")(nl)
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
return tapp(tapp(tcon(",")(l))(one)(nl))(recur(rest))(nl)
} ;
throw new Error('match fail 27727:' + JSON.stringify($target))
})(args)))(any_result)(nl))))))))))))
} ;
if ($target.type === "eeffectful") {
let k = $target[0];
let kl = $target[1];
let args = $target[2];
return $gt$gt$eq(new_type_var("k-arg")(kl))((kv) => $gt$gt$eq(new_type_var("k-res")(kl))((kr) => $gt$gt$eq(new_type_var("ignore-2")(kl))((ignore_2) => $gt$gt$eq(map_$gt(infer$slpattern(tenv))(args))((sub_patterns) => $gt$gt$eq($lt_(unzip(sub_patterns)))(({"1": scopes, "0": arg_types}) => $gt$gt$eq($lt_(foldl(map$slnil)(scopes)(map$slmerge)))((scope) => $gt$gt$eq(infer$slexpr(tenv$slwith_type(tenv$slwith_scope(tenv)(scope))(k)(forall(set$slnil)(tfn(k_effects)(kv)(kr)(kl))))(expr))((body) => $gt$gt$eq(unify(body)(result)(nl))((_27570) => $gt$gt$eq(map_$gt(type$slapply_$gt)(arg_types))((arg_types) => $lt_($co(name)(tfn(ignore_2)(loop(arg_types)((args) => (recur) => (($target) => {
if ($target.type === "nil") {
return tcon("()")(nl)
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
return tapp(tapp(tcon(",")(l))(one)(nl))(recur(rest))(nl)
} ;
throw new Error('match fail 27768:' + JSON.stringify($target))
})(args)))(kv)(nl))))))))))))
} ;
throw new Error('match fail 25173:' + JSON.stringify($target))
})(kind))(cases))((rows) => $gt$gt$eq($lt_(trow(rows)(some(effects))(rrecord)(l)))((inner_effects) => $gt$gt$eq(infer$slexpr(tenv$slwith_type(tenv)("(effects)")(forall(set$slnil)(inner_effects)))(target))((target) => $gt$gt$eq(type$slapply_$gt(k_effects))((k_effects) => $gt$gt$eq(type$slapply_$gt(inner_effects))((inner_effects) => $gt$gt$eq(unify(k_effects)(inner_effects)(l))((_25064) => $gt$gt$eq(type$slapply_$gt(result))((result) => $gt$gt$eq(type$slapply_$gt(target))((target) => $gt$gt$eq(unify(target)(result)(l))((_25064) => type$slapply_$gt(target)))))))))))))
} ;
if ($target.type === "evar") {
let name = $target[0];
let l = $target[1];
{
let $target = tenv$slresolve(tenv)(name);
if ($target.type === "none") {
return $lt_missing(name)(l)
} ;
if ($target.type === "some") {
let scheme = $target[0];
return $gt$gt$eq(record_if_generic(scheme)(l))((_13680) => instantiate(scheme)(l))
} ;
throw new Error('match fail 2272:' + JSON.stringify($target))
}
} ;
if ($target.type === "eprim") {
let prim = $target[0];
return $lt_(infer$slprim(prim))
} ;
if ($target.type === "equot") {
let quot = $target[0];
let l = $target[1];
return $lt_(infer$slquot(quot)(l))
} ;
if ($target.type === "estr") {
let templates = $target[1];
let l = $target[2];
return $gt$gt$eq(do_$gt(({"0": expr}) => $gt$gt$eq(infer$slexpr(tenv)(expr))((t) => $gt$gt$eq(unify(t)(tcon("string")(l))(l))((_6807) => $lt_($unit))))(templates))((_6792) => $lt_(tcon("string")(l)))
} ;
if ($target.type === "elambda") {
if ($target[0].type === "cons") {
if ($target[0][0].type === "pvar") {
let arg = $target[0][0][0];
let al = $target[0][0][1];
if ($target[0][1].type === "nil") {
let body = $target[1];
let l = $target[2];
return $gt$gt$eq(new_type_var(arg)(al))((arg_type) => $gt$gt$eq(new_type_var("effects-lam")(al))((effects) => $gt$gt$eq(record_type_$gt(arg_type)(al)(false))((_2727) => $gt$gt$eq($lt_(tenv$slwith_type(tenv$slwith_type(tenv)(arg)(forall(set$slnil)(arg_type)))("(effects)")(forall(set$slnil)(effects))))((bound_env) => $gt$gt$eq(infer$slexpr(bound_env)(body))((body_type) => $gt$gt$eq(type$slapply_$gt(effects))((effects) => $gt$gt$eq(type$slapply_$gt(arg_type))((arg_type) => $lt_(tfn(effects)(arg_type)(body_type)(l)))))))))
} 
} 
} 
} ;
if ($target.type === "elambda") {
if ($target[0].type === "cons") {
let pat = $target[0][0];
if ($target[0][1].type === "nil") {
let body = $target[1];
let l = $target[2];
return $gt$gt$eq(infer$slpattern(tenv)(pat))(({"1": scope, "0": arg_type}) => $gt$gt$eq(new_type_var("effects")(l))((effects) => $gt$gt$eq($lt_(tenv$slwith_type(tenv$slwith_scope(tenv)(scope))("(effects)")(forall(set$slnil)(effects))))((bound_env) => $gt$gt$eq(infer$slexpr(bound_env)(body))((body_type) => $gt$gt$eq(type$slapply_$gt(arg_type))((arg_type) => $gt$gt$eq(type$slapply_$gt(effects))((effects) => $gt$gt$eq(check_exhaustiveness(tenv)(arg_type)(cons(pat)(nil))(l))((_4873) => type$slapply_$gt(tfn(effects)(arg_type)(body_type)(l)))))))))
} 
} 
} ;
if ($target.type === "elambda") {
if ($target[0].type === "cons") {
let one = $target[0][0];
let rest = $target[0][1];
let body = $target[1];
let l = $target[2];
return infer$slexpr(tenv)(elambda(cons(one)(nil))(elambda(rest)(body)(l))(l))
} 
} ;
if ($target.type === "elambda") {
if ($target[0].type === "nil") {
let body = $target[1];
let l = $target[2];
return $lt_err("No args to lambda")
} 
} ;
if ($target.type === "eapp") {
let target = $target[0];
if ($target[1].type === "cons") {
let arg = $target[1][0];
if ($target[1][1].type === "nil") {
let l = $target[2];
return $gt$gt$eq(new_type_var("result")(l))((result_var) => $gt$gt$eq(infer$slexpr(tenv)(target))((target_type) => $gt$gt$eq(tenv$slapply_$gt(tenv))((arg_tenv) => $gt$gt$eq(infer$slexpr(arg_tenv)(arg))((arg_type) => $gt$gt$eq(type$slapply_$gt(target_type))((target_type) => $gt$gt$eq((($target) => {
if ($target.type === "none") {
return $lt_missing("(effects)")(l)
} ;
if ($target.type === "some") {
if ($target[0].type === "forall") {
let t = $target[0][1];
return type$slapply_$gt(t)
} 
} ;
throw new Error('match fail 22161:' + JSON.stringify($target))
})(tenv$slresolve(tenv)("(effects)")))((effects) => $gt$gt$eq(unify(target_type)(tfn(effects)(arg_type)(result_var)(l))(l))((_2428) => type$slapply_$gt(result_var))))))))
} 
} 
} ;
if ($target.type === "eapp") {
let target = $target[0];
if ($target[1].type === "cons") {
let one = $target[1][0];
let rest = $target[1][1];
let l = $target[2];
return infer$slexpr(tenv)(eapp(eapp(target)(cons(one)(nil))(l))(rest)(l))
} 
} ;
if ($target.type === "eapp") {
let target = $target[0];
if ($target[1].type === "nil") {
let l = $target[2];
return infer$slexpr(tenv)(target)
} 
} ;
if ($target.type === "elet") {
if ($target[0].type === "cons") {
if ($target[0][0].type === ",") {
if ($target[0][0][0].type === "pvar") {
let name = $target[0][0][0][0];
let nl = $target[0][0][0][1];
let value = $target[0][0][1];
if ($target[0][1].type === "nil") {
let body = $target[1];
return $gt$gt$eq(infer$slexpr(tenv)(value))((value_type) => $gt$gt$eq(record_type_$gt(value_type)(nl)(false))((_2816) => $gt$gt$eq(tenv$slapply_$gt(tenv))((applied_env) => $gt$gt$eq($lt_(generalize(applied_env)(value_type)))((scheme) => $gt$gt$eq($lt_(tenv$slwith_type(applied_env)(name)(scheme)))((bound_env) => infer$slexpr(bound_env)(body))))))
} 
} 
} 
} 
} ;
if ($target.type === "elet") {
if ($target[0].type === "cons") {
if ($target[0][0].type === ",") {
let pat = $target[0][0][0];
let value = $target[0][0][1];
if ($target[0][1].type === "nil") {
let body = $target[1];
let l = $target[2];
return $gt$gt$eq(infer$slpattern(tenv)(pat))(({"1": scope, "0": type}) => $gt$gt$eq(infer$slexpr(tenv)(value))((value_type) => $gt$gt$eq(unify(type)(value_type)(l))((_3987) => $gt$gt$eq(scope$slapply_$gt(scope))((scope) => $gt$gt$eq($lt_(tenv$slwith_scope(tenv)(scope)))((bound_env) => $gt$gt$eq(infer$slexpr(bound_env)(body))((body_type) => $gt$gt$eq(type$slapply_$gt(type))((type) => $gt$gt$eq(check_exhaustiveness(tenv)(type)(cons(pat)(nil))(l))((_3987) => type$slapply_$gt(body_type)))))))))
} 
} 
} 
} ;
if ($target.type === "elet") {
if ($target[0].type === "cons") {
let one = $target[0][0];
let more = $target[0][1];
let body = $target[1];
let l = $target[2];
return infer$slexpr(tenv)(elet(cons(one)(nil))(elet(more)(body)(l))(l))
} 
} ;
if ($target.type === "elet") {
if ($target[0].type === "nil") {
let body = $target[1];
let l = $target[2];
return $lt_err("No bindings in let")
} 
} ;
if ($target.type === "ematch") {
let target = $target[0];
let cases = $target[1];
let l = $target[2];
return $gt$gt$eq(infer$slexpr(tenv)(target))((target_type) => $gt$gt$eq(new_type_var("match result")(l))((result_type) => $gt$gt$eq(foldl_$gt($co(target_type)(nil))(cases)(({"1": results, "0": target_type}) => ({"1": body, "0": pat}) => $gt$gt$eq(infer$slpattern(tenv)(pat))(({"1": scope, "0": type}) => $gt$gt$eq(unify(type)(target_type)(l))((_13904) => $gt$gt$eq(scope$slapply_$gt(scope))((scope) => $gt$gt$eq($lt_(tenv$slwith_scope(tenv)(scope)))((bound_env) => $gt$gt$eq(infer$slexpr(bound_env)(body))((body_type) => $gt$gt$eq(type$slapply_$gt(target_type))((target_type) => $lt_($co(target_type)(cons(body_type)(results)))))))))))(({"1": all_results, "0": target_type}) => $gt$gt$eq(do_$gt((one_result) => $gt$gt$eq($lt_subst)((subst) => unify(type$slapply(subst)(one_result))(type$slapply(subst)(result_type))(l)))(reverse(all_results)))((_4960) => $gt$gt$eq(check_exhaustiveness(tenv)(target_type)(map(fst)(cases))(l))((_4960) => type$slapply_$gt(result_type))))))
} ;
throw new Error('match fail 2253:' + JSON.stringify($target))
})(expr)

let infer$slexpr = (tenv) => (expr) => $gt$gt$eq(infer$slexpr_inner(tenv)(expr))((type) => $gt$gt$eq(record_type_$gt(type)(expr_loc(expr))(false))((_2977) => $lt_(type)))
let add$sldefs = (tenv) => (defns) => $gt$gt$eq(reset_state_$gt)((_3545) => $gt$gt$eq($lt_(map(({"0": name}) => name)(defns)))((names) => $gt$gt$eq($lt_(map(({"1": {"1": {"1": l}}}) => l)(defns)))((locs) => $gt$gt$eq(map_$gt(({"1": {"0": nl}, "0": name}) => new_type_var(name)(nl))(defns))((vbls) => $gt$gt$eq($lt_(foldl(tenv)(zip(names)(map(forall(set$slnil))(vbls)))((tenv) => ({"1": vbl, "0": name}) => tenv$slwith_type(tenv)(name)(vbl))))((bound_env) => $gt$gt$eq(map_$gt(({"1": {"1": {"0": expr}}}) => infer$slexpr(bound_env)(expr))(defns))((types) => $gt$gt$eq(map_$gt(type$slapply_$gt)(vbls))((vbls) => $gt$gt$eq(do_$gt(({"1": {"1": loc, "0": type}, "0": vbl}) => unify(vbl)(type)(loc))(zip(vbls)(zip(types)(locs))))((_3545) => $gt$gt$eq(map_$gt(type$slapply_$gt)(types))((types) => $lt_(foldl(tenv$slnil)(zip(names)(types))((tenv) => ({"1": type, "0": name}) => tenv$slwith_type(tenv)(name)(generalize(tenv)(simplify_recursive(type))))))))))))))
let add$sldef = (tenv) => (name) => (nl) => (expr) => (l) => $gt$gt$eq(new_type_var(name)(nl))((self) => $gt$gt$eq($lt_(tenv$slwith_type(tenv)(name)(forall(set$slnil)(self))))((bound_env) => $gt$gt$eq(infer$slexpr(bound_env)(expr))((type) => $gt$gt$eq(type$slapply_$gt(self))((self) => $gt$gt$eq(unify(self)(type)(l))((_5246) => $gt$gt$eq(type$slapply_$gt(type))((type) => $lt_(tenv$slwith_type(tenv$slnil)(name)(generalize(tenv)(type)))))))))
let is_exhaustive = (matrix) => (($target) => {
if ($target === true) {
return false
} ;
return true;
throw new Error('match fail 10333:' + JSON.stringify($target))
})(is_useful(matrix)(cons(ex$slany)(nil)))
let infer_expr3 = (env) => (expr) => {
let {"1": result, "0": {"1": {"1": types, "0": subst}}} = state_f($gt$gt$eq(new_type_var("top-effects")(-1))((top_effects) => $gt$gt$eq($lt_(tenv$slwith_type(env)("(effects)")(forall(set$slnil)(trow(nil)(some(top_effects))(rrecord)(-1)))))((env) => $gt$gt$eq(infer$slexpr(env)(expr))((type) => $gt$gt$eq(type$slapply_$gt(top_effects))((top_effects) => $lt_($co(type)(top_effects)))))))(state$slnil);
return $co((($target) => {
if ($target.type === "ok") {
if ($target[0].type === ",") {
let t = $target[0][0];
let top_effects = $target[0][1];
return ok($co(forall(set$slnil)(t))(top_effects))
} 
} ;
if ($target.type === "err") {
let e = $target[0];
return err(e)
} ;
throw new Error('match fail 12754:' + JSON.stringify($target))
})(result))($co(map(({"1": {"1": dont_apply, "0": l}, "0": t}) => (($target) => {
if ($target === true) {
return $co(l)(forall(set$slnil)(t))
} ;
return $co(l)(forall(set$slnil)(type$slapply(subst)(t)));
throw new Error('match fail 13537:' + JSON.stringify($target))
})(dont_apply))(types))($co(nil)(nil)))
}
let add$slstmt = (tenv) => (stmt) => (($target) => {
if ($target.type === "tdef") {
let name = $target[0];
let nl = $target[1];
let expr = $target[2];
let l = $target[3];
return add$sldef(tenv)(name)(nl)(expr)(l)
} ;
if ($target.type === "texpr") {
let expr = $target[0];
let l = $target[1];
return $gt$gt$eq(infer$slexpr(tenv)(expr))((_2953) => $lt_(tenv$slnil))
} ;
if ($target.type === "ttypealias") {
let name = $target[0];
let args = $target[2];
let type = $target[3];
return $lt_(add$sltypealias(tenv)(name)(args)(type))
} ;
if ($target.type === "tdeftype") {
let name = $target[0];
let args = $target[2];
let constrs = $target[3];
let l = $target[4];
return $lt_(add$sldeftype(tenv)(name)(args)(constrs)(l))
} ;
throw new Error('match fail 2876:' + JSON.stringify($target))
})(stmt)
let add$slstmts = (tenv) => (stmts) => $gt$gt$eq($lt_(split_stmts(stmts)))(({"1": {"1": {"1": others, "0": exprs}, "0": aliases}, "0": defs}) => $gt$gt$eq(add$sldefs(tenv)(defs))((denv) => $gt$gt$eq(foldl_$gt(denv)(concat(cons(aliases)(cons(others)(nil))))((env) => (stmt) => $gt$gt$eq(add$slstmt(tenv$slmerge(tenv)(env))(stmt))((env$qu) => $lt_(tenv$slmerge(env)(env$qu)))))((final) => $gt$gt$eq(new_type_var("top-effects")(-1))((top_effects) => $gt$gt$eq(map_$gt(infer$slexpr(tenv$slwith_type(tenv$slmerge(tenv)(final))("(effects)")(forall(set$slnil)(trow(nil)(some(top_effects))(rrecord)(-1)))))(exprs))((types) => $gt$gt$eq(map_$gt(restrict_poly_enum)(types))((types) => $gt$gt$eq(type$slapply_$gt(top_effects))((top_effects) => $lt_($co(final)($co(map(simplify_recursive)(types))(top_effects))))))))))
let benv_with_pair = tenv$slmerge(builtin_env)(fst(err_to_fatal(run$slnil_$gt(add$slstmts(builtin_env)(cons({"0":",","1":12710,"2":{"0":{"0":"a","1":12711,"type":","},"1":{"0":{"0":"b","1":12712,"type":","},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"3":{"0":{"0":",","1":{"0":12714,"1":{"0":{"0":{"0":"a","1":12715,"type":"tcon"},"1":{"0":{"0":"b","1":12716,"type":"tcon"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"1":12713,"type":","},"type":","},"type":","},"1":{"type":"nil"},"type":"cons"},"4":12707,"type":"tdeftype"})(cons({"0":"option","1":17670,"2":{"0":{"0":"a","1":17671,"type":","},"1":{"type":"nil"},"type":"cons"},"3":{"0":{"0":"none","1":{"0":17673,"1":{"0":{"type":"nil"},"1":17672,"type":","},"type":","},"type":","},"1":{"0":{"0":"some","1":{"0":17675,"1":{"0":{"0":{"0":"a","1":17676,"type":"tcon"},"1":{"type":"nil"},"type":"cons"},"1":17674,"type":","},"type":","},"type":","},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"4":17667,"type":"tdeftype"})(cons({"0":"list","1":12722,"2":{"0":{"0":"a","1":12723,"type":","},"1":{"type":"nil"},"type":"cons"},"3":{"0":{"0":"nil","1":{"0":12725,"1":{"0":{"type":"nil"},"1":12724,"type":","},"type":","},"type":","},"1":{"0":{"0":"cons","1":{"0":12727,"1":{"0":{"0":{"0":"a","1":12728,"type":"tcon"},"1":{"0":{"0":{"0":"list","1":12730,"type":"tcon"},"1":{"0":"a","1":12731,"type":"tcon"},"2":12729,"type":"tapp"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"1":12726,"type":","},"type":","},"type":","},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"4":12719,"type":"tdeftype"})(nil))))))))
let infer_stmts3 = (env) => (stmts) => {
let {"1": result, "0": {"1": {"1": types, "0": subst}}} = state_f(add$slstmts(env)(stmts))(state$slnil);
return $co((($target) => {
if ($target.type === "err") {
let e = $target[0];
return err(e)
} ;
if ($target.type === "ok") {
if ($target[0].type === ",") {
let tenv = $target[0][0];
if ($target[0][1].type === ",") {
let types = $target[0][1][0];
let top_effects = $target[0][1][1];
return ok($co(tenv)($co(map(forall(set$slnil))(types))(top_effects)))
} 
} 
} ;
throw new Error('match fail 13208:' + JSON.stringify($target))
})(result))($co(map(({"1": {"1": dont_apply, "0": l}, "0": t}) => (($target) => {
if ($target === true) {
return $co(l)(forall(set$slnil)(t))
} ;
return $co(l)(forall(set$slnil)(type$slapply(subst)(t)));
throw new Error('match fail 12961:' + JSON.stringify($target))
})(dont_apply))(types))($co(nil)(nil)))
}
let test_infer_str = ({"3": l, "2": expr, "1": nl, "0": name}) => {
let {"0": values} = err_to_fatal(run$slnil_$gt($gt$gt$eq(add$slstmts(tenv$slnil)(cons({"0":"option","1":21096,"2":{"0":{"0":"a","1":21097,"type":","},"1":{"type":"nil"},"type":"cons"},"3":{"0":{"0":"some","1":{"0":21099,"1":{"0":{"0":{"0":"a","1":21100,"type":"tcon"},"1":{"type":"nil"},"type":"cons"},"1":21098,"type":","},"type":","},"type":","},"1":{"0":{"0":"none","1":{"0":21102,"1":{"0":{"type":"nil"},"1":21101,"type":","},"type":","},"type":","},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"4":21093,"type":"tdeftype"})(cons({"0":",","1":21108,"2":{"0":{"0":"a","1":21109,"type":","},"1":{"0":{"0":"b","1":21110,"type":","},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"3":{"0":{"0":",","1":{"0":21112,"1":{"0":{"0":{"0":"a","1":21113,"type":"tcon"},"1":{"0":{"0":"b","1":21114,"type":"tcon"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"1":21111,"type":","},"type":","},"type":","},"1":{"type":"nil"},"type":"cons"},"4":21105,"type":"tdeftype"})(nil))))(({"0": tenv}) => add$sldef(tenv)(name)(nl)(expr)(l))));
{
let $target = map$slget(values)(name);
if ($target.type === "some") {
let t = $target[0];
return scheme_$gts(t)
} ;
return `type not found for ${name}`;
throw new Error('match fail 21148:' + JSON.stringify($target))
}
}
return $eval("env_nil => add_stmt => get_type => type_to_string => type_to_cst => infer_stmts3 => infer3 =>\n  ({type: 'fns', env_nil, add_stmt, get_type, type_to_string, type_to_cst, infer_stmts3, infer3})\n")(builtin_env)(tenv$slmerge)(tenv$slresolve)(scheme_$gts)(scheme_$gtcst)(infer_stmts3)(infer_expr3)