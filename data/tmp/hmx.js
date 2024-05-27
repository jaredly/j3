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
let some = (v0) => ({type: "some", 0: v0})
let none = {type: "none"}
let $co = (v0) => (v1) => ({type: ",", 0: v0, 1: v1})
let fst = ({"0": a}) => a
let loop = (v) => (f) => f(v)((nv) => loop(nv)(f))
let force = (x) => (($target) => {
if ($target.type === "some") {
let x = $target[0];
return x
} ;
return fatal("Option is None");
throw new Error('match fail 383:' + JSON.stringify($target))
})(x)
let pint = (v0) => (v1) => ({type: "pint", 0: v0, 1: v1})
let pbool = (v0) => (v1) => ({type: "pbool", 0: v0, 1: v1})
let StateT = (v0) => ({type: "StateT", 0: v0})
let $gt$gt$eq = ({"0": f}) => (next) => StateT((state) => {
let state$$0 = state;
{
let {"1": value, "0": state} = f(state$$0);
{
let {"0": fnext} = next(value);
return fnext(state)
}
}
})
let $lt_ = (x) => StateT((state) => $co(state)(x))
let run_$gt = ({"0": f}) => (state) => {
let {"1": result} = f(state);
return result
}
let $lt_state = StateT((state) => $co(state)(state))
let state_$gt = (v) => StateT((old) => $co(v)(old))
let infer$slprim = (prim) => (($target) => {
if ($target.type === "pint") {
return "int"
} ;
if ($target.type === "pbool") {
return "bool"
} ;
throw new Error('match fail 1382:' + JSON.stringify($target))
})(prim)
let fresh_ty_var = (name) => $gt$gt$eq($lt_state)(({"1": tenv, "0": idx}) => $gt$gt$eq(state_$gt($co(idx + 1)(tenv)))((_1597) => $lt_(`${name}:${int_to_string(idx)}`)))
let cons = (v0) => (v1) => ({type: "cons", 0: v0, 1: v1})
let nil = {type: "nil"}
let cst$sllist = (v0) => (v1) => ({type: "cst/list", 0: v0, 1: v1})
let cst$slarray = (v0) => (v1) => ({type: "cst/array", 0: v0, 1: v1})
let cst$slspread = (v0) => (v1) => ({type: "cst/spread", 0: v0, 1: v1})
let cst$slid = (v0) => (v1) => ({type: "cst/id", 0: v0, 1: v1})
let cst$slstring = (v0) => (v1) => (v2) => ({type: "cst/string", 0: v0, 1: v1, 2: v2})
let pany = (v0) => ({type: "pany", 0: v0})
let pvar = (v0) => (v1) => ({type: "pvar", 0: v0, 1: v1})
let pcon = (v0) => (v1) => (v2) => (v3) => ({type: "pcon", 0: v0, 1: v1, 2: v2, 3: v3})
let pstr = (v0) => (v1) => ({type: "pstr", 0: v0, 1: v1})
let pprim = (v0) => (v1) => ({type: "pprim", 0: v0, 1: v1})
let tvar = (v0) => (v1) => ({type: "tvar", 0: v0, 1: v1})
let tapp = (v0) => (v1) => (v2) => ({type: "tapp", 0: v0, 1: v1, 2: v2})
let tcon = (v0) => (v1) => ({type: "tcon", 0: v0, 1: v1})
let cbool = (v0) => (v1) => ({type: "cbool", 0: v0, 1: v1})
let capp = (v0) => (v1) => (v2) => ({type: "capp", 0: v0, 1: v1, 2: v2})
let cand = (v0) => (v1) => (v2) => ({type: "cand", 0: v0, 1: v1, 2: v2})
let cexists = (v0) => (v1) => (v2) => ({type: "cexists", 0: v0, 1: v1, 2: v2})
let cdef = (v0) => (v1) => (v2) => (v3) => ({type: "cdef", 0: v0, 1: v1, 2: v2, 3: v3})
let cinstance = (v0) => (v1) => (v2) => ({type: "cinstance", 0: v0, 1: v1, 2: v2})

let forall = (v0) => (v1) => (v2) => ({type: "forall", 0: v0, 1: v1, 2: v2})
let foldr = (init) => (items) => (f) => (($target) => {
if ($target.type === "nil") {
return init
} ;
if ($target.type === "cons") {
let one = $target[0];
let rest = $target[1];
return f(foldr(init)(rest)(f))(one)
} ;
throw new Error('match fail 50:' + JSON.stringify($target))
})(items)
let foldl = (init) => (items) => (f) => (($target) => {
if ($target.type === "nil") {
return init
} ;
if ($target.type === "cons") {
let one = $target[0];
let rest = $target[1];
return foldl(f(init)(one))(rest)(f)
} ;
throw new Error('match fail 75:' + JSON.stringify($target))
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
throw new Error('match fail 99:' + JSON.stringify($target))
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
throw new Error('match fail 141:' + JSON.stringify($target))
})(zipped)
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
throw new Error('match fail 182:' + JSON.stringify($target))
})(lists)
let map = (f) => (values) => (($target) => {
if ($target.type === "nil") {
return nil
} ;
if ($target.type === "cons") {
let one = $target[0];
let rest = $target[1];
return cons(f(one))(map(f)(rest))
} ;
throw new Error('match fail 217:' + JSON.stringify($target))
})(values)
let map_without = (map) => (set) => foldr(map)(set$slto_list(set))(map$slrm)
let length = (v) => (($target) => {
if ($target.type === "nil") {
return 0
} ;
if ($target.type === "cons") {
let rest = $target[1];
return 1 + length(rest)
} ;
throw new Error('match fail 265:' + JSON.stringify($target))
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
throw new Error('match fail 318:' + JSON.stringify($target))
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
throw new Error('match fail 353:' + JSON.stringify($target))
})(lst)
let type$eq = (one) => (two) => (($target) => {
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
throw new Error('match fail 689:' + JSON.stringify($target))
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
throw new Error('match fail 657:' + JSON.stringify($target))
})($co(one)(two))
let tfn = (arg) => (body) => (l) => tapp(tapp(tcon("->")(l))(arg)(l))(body)(l)
let tfns = (args) => (body) => (l) => foldr(body)(args)((body) => (arg) => tfn(arg)(body)(l))
let tint = tcon("int")(-1)
let type_$gts_simple = (type) => (($target) => {
if ($target.type === "tvar") {
let name = $target[0];
return name
} ;
if ($target.type === "tapp") {
if ($target[0].type === "tapp") {
if ($target[0][0].type === "tcon") {
if ($target[0][0][0] === "->") {
let arg = $target[0][1];
let res = $target[1];
return `(fn [${type_$gts_simple(arg)}] ${type_$gts_simple(res)})`
} 
} 
} 
} ;
if ($target.type === "tapp") {
let target = $target[0];
let arg = $target[1];
return `(${type_$gts_simple(target)} ${type_$gts_simple(arg)})`
} ;
if ($target.type === "tcon") {
let name = $target[0];
return name
} ;
throw new Error('match fail 776:' + JSON.stringify($target))
})(type)
let unwrap_fn = (t) => (($target) => {
if ($target.type === "tapp") {
if ($target[0].type === "tapp") {
if ($target[0][0].type === "tcon") {
if ($target[0][0][0] === "->") {
let a = $target[0][1];
let b = $target[1];
{
let {"1": res, "0": args} = unwrap_fn(b);
return $co(cons(a)(args))(res)
}
} 
} 
} 
} ;
return $co(nil)(t);
throw new Error('match fail 923:' + JSON.stringify($target))
})(t)
let unwrap_app = (t) => (args) => (($target) => {
if ($target.type === "tapp") {
let a = $target[0];
let b = $target[1];
return unwrap_app(a)(cons(b)(args))
} ;
return $co(t)(args);
throw new Error('match fail 968:' + JSON.stringify($target))
})(t)
let map_$gt = (f) => (arr) => (($target) => {
if ($target.type === "nil") {
return $lt_(nil)
} ;
if ($target.type === "cons") {
let one = $target[0];
let rest = $target[1];
return $gt$gt$eq(f(one))((one) => $gt$gt$eq(map_$gt(f)(rest))((rest) => $lt_(cons(one)(rest))))
} ;
throw new Error('match fail 1153:' + JSON.stringify($target))
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
throw new Error('match fail 1190:' + JSON.stringify($target))
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
throw new Error('match fail 1222:' + JSON.stringify($target))
})(values)
let do_$gt = (f) => (arr) => (($target) => {
if ($target.type === "nil") {
return $lt_($unit)
} ;
if ($target.type === "cons") {
let one = $target[0];
let rest = $target[1];
return $gt$gt$eq(f(one))((_1265) => $gt$gt$eq(do_$gt(f)(rest))((_1265) => $lt_($unit)))
} ;
throw new Error('match fail 1254:' + JSON.stringify($target))
})(arr)
let cands = (constrs) => (loc) => loop(constrs)((constrs) => (recur) => (($target) => {
if ($target.type === "nil") {
return cbool(true)(loc)
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
return cand(one)(recur(rest))(loc)
} ;
throw new Error('match fail 1431:' + JSON.stringify($target))
})(constrs))
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
throw new Error('match fail 2296:' + JSON.stringify($target))
}
} ;
if ($target.type === "tapp") {
let target = $target[0];
let arg = $target[1];
let loc = $target[2];
return tapp(type$slapply(subst)(target))(type$slapply(subst)(arg))(loc)
} ;
return type;
throw new Error('match fail 2289:' + JSON.stringify($target))
})(type)
let instantiate = ({"2": type, "1": constraint, "0": vbls}) => (loc) => $gt$gt$eq($lt_(set$slto_list(vbls)))((free) => $gt$gt$eq(map_$gt(fresh_ty_var)(free))((tvs) => $gt$gt$eq($lt_(map$slfrom_list(zip(free)(map((name) => tvar(name)(loc))(tvs)))))((subst) => $lt_(type$slapply(subst)(type)))))
let one_subst = ($var) => (type) => map$slfrom_list(cons($co($var)(type))(nil))
let type$slfree = (type) => (($target) => {
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
throw new Error('match fail 2951:' + JSON.stringify($target))
})(type)
let compose_subst = (new_subst) => (old_subst) => map$slmerge(map$slmap(type$slapply(new_subst))(old_subst))(new_subst)
let scheme$slfree = ({"2": type, "1": cns, "0": vbls}) => set$sldiff(type$slfree(type))(vbls)
let basic_assumps = map$slfrom_list(cons($co(",")(forall(set$slfrom_list(cons("a")(cons("b")(nil))))(cbool(true)(-1))(tfns(cons(tvar("a")(-1))(cons(tvar("b")(-1))(nil)))(tapp(tapp(tcon(",")(-1))(tvar("a")(-1))(-1))(tvar("b")(-1))(-1))(-1))))(cons($co("+")(forall(set$slnil)(cbool(true)(-1))(tfns(cons(tint)(cons(tint)(nil)))(tint)(-1))))(nil)))
let tpair = (a) => (b) => (l) => tapp(tapp(tcon(",")(l))(a)(l))(b)(l)
let with_scope = (inner) => (loc) => (scope) => foldl(inner)(map$slto_list(scope))((inner) => ({"1": type, "0": name}) => cdef(name)(forall(set$slnil)(cbool(true)(loc))(type))(inner)(loc))
let type$slcon_to_var = (vars) => (type) => (($target) => {
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
throw new Error('match fail 5181:' + JSON.stringify($target))
}
} ;
if ($target.type === "tapp") {
let a = $target[0];
let b = $target[1];
let l = $target[2];
return tapp(type$slcon_to_var(vars)(a))(type$slcon_to_var(vars)(b))(l)
} ;
throw new Error('match fail 5169:' + JSON.stringify($target))
})(type)
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
throw new Error('match fail 5314:' + JSON.stringify($target))
})(type)
let tenv = (v0) => (v1) => (v2) => (v3) => ({type: "tenv", 0: v0, 1: v1, 2: v2, 3: v3})
let tenv$slnil = tenv(map$slnil)(map$slnil)(map$slnil)(map$slnil)
let tenv$slwith_global = ({"3": ta, "2": ty, "1": tc, "0": values}) => (name) => (scheme) => tenv(map$slset(values)(name)(scheme))(tc)(ty)(ta)
let tenv$slmerge = ({"3": a1, "2": t1, "1": c1, "0": v1}) => ({"3": a2, "2": t2, "1": c2, "0": v2}) => tenv(map$slmerge(v1)(v2))(map$slmerge(c1)(c2))(map$slmerge(t1)(t2))(map$slmerge(a1)(a2))
let tenv$slresolve = ({"0": values}) => (name) => map$slget(values)(name)
let tbool = tcon("bool")(-1)
let tmap = (k) => (v) => tapp(tapp(tcon("map")(-1))(k)(-1))(v)(-1)
let toption = (arg) => tapp(tcon("option")(-1))(arg)(-1)
let tlist = (arg) => tapp(tcon("list")(-1))(arg)(-1)
let tset = (arg) => tapp(tcon("set")(-1))(arg)(-1)
let concrete = (t) => forall(set$slnil)(cbool(true)(-1))(t)
let generic = (vbls) => (t) => forall(set$slfrom_list(vbls))(cbool(true)(-1))(t)
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
let kv = generic(cons("k")(cons("v")(nil)));
{
let kk = generic(cons("k")(nil));
{
let a = vbl("a");
{
let b = vbl("b");
return tenv(map$slfrom_list(cons($co("+")(concrete(tfns(cons(tint)(cons(tint)(nil)))(tint)(-1))))(cons($co("-")(concrete(tfns(cons(tint)(cons(tint)(nil)))(tint)(-1))))(cons($co(">")(concrete(tfns(cons(tint)(cons(tint)(nil)))(tbool)(-1))))(cons($co("<")(concrete(tfns(cons(tint)(cons(tint)(nil)))(tbool)(-1))))(cons($co("=")(generic(cons("k")(nil))(tfns(cons(k)(cons(k)(nil)))(tbool)(-1))))(cons($co("!=")(generic(cons("k")(nil))(tfns(cons(k)(cons(k)(nil)))(tbool)(-1))))(cons($co(">=")(concrete(tfns(cons(tint)(cons(tint)(nil)))(tbool)(-1))))(cons($co("<=")(concrete(tfns(cons(tint)(cons(tint)(nil)))(tbool)(-1))))(cons($co("()")(concrete(tcon("()")(-1))))(cons($co(",")(generic(cons("a")(cons("b")(nil)))(tfns(cons(a)(cons(b)(nil)))(t$co(a)(b))(-1))))(cons($co("unescapeString")(concrete(tfns(cons(tstring)(nil))(tstring)(-1))))(cons($co("int-to-string")(concrete(tfns(cons(tint)(nil))(tstring)(-1))))(cons($co("string-to-int")(concrete(tfns(cons(tstring)(nil))(toption(tint))(-1))))(cons($co("string-to-float")(concrete(tfns(cons(tstring)(nil))(toption(tcon("float")(-1)))(-1))))(cons($co("map/nil")(kv(tmap(k)(v))))(cons($co("map/set")(kv(tfns(cons(tmap(k)(v))(cons(k)(cons(v)(nil))))(tmap(k)(v))(-1))))(cons($co("map/rm")(kv(tfns(cons(tmap(k)(v))(cons(k)(nil)))(tmap(k)(v))(-1))))(cons($co("map/get")(kv(tfns(cons(tmap(k)(v))(cons(k)(nil)))(toption(v))(-1))))(cons($co("map/map")(generic(cons("k")(cons("v")(cons("v2")(nil))))(tfns(cons(tfns(cons(v)(nil))(v2)(-1))(cons(tmap(k)(v))(nil)))(tmap(k)(v2))(-1))))(cons($co("map/merge")(kv(tfns(cons(tmap(k)(v))(cons(tmap(k)(v))(nil)))(tmap(k)(v))(-1))))(cons($co("map/values")(kv(tfns(cons(tmap(k)(v))(nil))(tlist(v))(-1))))(cons($co("map/keys")(kv(tfns(cons(tmap(k)(v))(nil))(tlist(k))(-1))))(cons($co("set/nil")(kk(tset(k))))(cons($co("set/add")(kk(tfns(cons(tset(k))(cons(k)(nil)))(tset(k))(-1))))(cons($co("set/has")(kk(tfns(cons(tset(k))(cons(k)(nil)))(tbool)(-1))))(cons($co("set/rm")(kk(tfns(cons(tset(k))(cons(k)(nil)))(tset(k))(-1))))(cons($co("set/diff")(kk(tfns(cons(tset(k))(cons(tset(k))(nil)))(tset(k))(-1))))(cons($co("set/merge")(kk(tfns(cons(tset(k))(cons(tset(k))(nil)))(tset(k))(-1))))(cons($co("set/overlap")(kk(tfns(cons(tset(k))(cons(tset(k))(nil)))(tset(k))(-1))))(cons($co("set/to-list")(kk(tfns(cons(tset(k))(nil))(tlist(k))(-1))))(cons($co("set/from-list")(kk(tfns(cons(tlist(k))(nil))(tset(k))(-1))))(cons($co("map/from-list")(kv(tfns(cons(tlist(t$co(k)(v)))(nil))(tmap(k)(v))(-1))))(cons($co("map/to-list")(kv(tfns(cons(tmap(k)(v))(nil))(tlist(t$co(k)(v)))(-1))))(cons($co("jsonify")(generic(cons("v")(nil))(tfns(cons(tvar("v")(-1))(nil))(tstring)(-1))))(cons($co("valueToString")(generic(cons("v")(nil))(tfns(cons(vbl("v"))(nil))(tstring)(-1))))(cons($co("eval")(generic(cons("v")(nil))(tfns(cons(tcon("string")(-1))(nil))(vbl("v"))(-1))))(cons($co("eval-with")(generic(cons("ctx")(cons("v")(nil)))(tfns(cons(tcon("ctx")(-1))(cons(tcon("string")(-1))(nil)))(vbl("v"))(-1))))(cons($co("errorToString")(generic(cons("v")(nil))(tfns(cons(tfns(cons(vbl("v"))(nil))(tstring)(-1))(cons(vbl("v"))(nil)))(tstring)(-1))))(cons($co("sanitize")(concrete(tfns(cons(tstring)(nil))(tstring)(-1))))(cons($co("replace-all")(concrete(tfns(cons(tstring)(cons(tstring)(cons(tstring)(nil))))(tstring)(-1))))(cons($co("fatal")(generic(cons("v")(nil))(tfns(cons(tstring)(nil))(vbl("v"))(-1))))(nil)))))))))))))))))))))))))))))))))))))))))))(map$slfrom_list(cons($co("()")($co(nil)($co(nil)(tcon("()")(-1)))))(cons($co(",")($co(cons("a")(cons("b")(nil)))($co(cons(a)(cons(b)(nil)))(t$co(a)(b)))))(nil))))(map$slfrom_list(cons($co("int")($co(0)(set$slnil)))(cons($co("float")($co(0)(set$slnil)))(cons($co("string")($co(0)(set$slnil)))(cons($co("bool")($co(0)(set$slnil)))(cons($co("map")($co(2)(set$slnil)))(cons($co("set")($co(1)(set$slnil)))(cons($co("->")($co(2)(set$slnil)))(nil)))))))))(map$slnil)
}
}
}
}
}
}
})()
let tdef = (v0) => (v1) => (v2) => (v3) => ({type: "tdef", 0: v0, 1: v1, 2: v2, 3: v3})
let texpr = (v0) => (v1) => ({type: "texpr", 0: v0, 1: v1})
let tdeftype = (v0) => (v1) => (v2) => (v3) => (v4) => ({type: "tdeftype", 0: v0, 1: v1, 2: v2, 3: v3, 4: v4})
let ttypealias = (v0) => (v1) => (v2) => (v3) => (v4) => ({type: "ttypealias", 0: v0, 1: v1, 2: v2, 3: v3, 4: v4})

let eprim = (v0) => (v1) => ({type: "eprim", 0: v0, 1: v1})
let evar = (v0) => (v1) => ({type: "evar", 0: v0, 1: v1})
let estr = (v0) => (v1) => (v2) => ({type: "estr", 0: v0, 1: v1, 2: v2})
let equot = (v0) => (v1) => ({type: "equot", 0: v0, 1: v1})
let elambda = (v0) => (v1) => (v2) => ({type: "elambda", 0: v0, 1: v1, 2: v2})
let eapp = (v0) => (v1) => (v2) => ({type: "eapp", 0: v0, 1: v1, 2: v2})
let elet = (v0) => (v1) => (v2) => ({type: "elet", 0: v0, 1: v1, 2: v2})
let ematch = (v0) => (v1) => (v2) => ({type: "ematch", 0: v0, 1: v1, 2: v2})

let quot$slexpr = (v0) => ({type: "quot/expr", 0: v0})
let quot$sltop = (v0) => ({type: "quot/top", 0: v0})
let quot$sltype = (v0) => ({type: "quot/type", 0: v0})
let quot$slpat = (v0) => ({type: "quot/pat", 0: v0})
let quot$slquot = (v0) => ({type: "quot/quot", 0: v0})
let infer$slpat = (pat) => (type) => (($target) => {
if ($target.type === "pvar") {
let name = $target[0];
let loc = $target[1];
return $lt_($co(cinstance(name)(type)(loc))($co(nil)(map$slset(map$slnil)(name)(type))))
} ;
if ($target.type === "pprim") {
let prim = $target[0];
let loc = $target[1];
return $lt_($co(capp("=")(cons(tcon(infer$slprim(prim))(loc))(cons(type)(nil)))(loc))($co(nil)(map$slnil)))
} ;
if ($target.type === "pany") {
let loc = $target[0];
return $lt_($co(cbool(true)(loc))($co(nil)(map$slnil)))
} ;
if ($target.type === "pstr") {
let loc = $target[1];
return $lt_($co(capp("=")(cons(tcon("string")(loc))(cons(type)(nil)))(loc))($co(nil)(map$slnil)))
} ;
if ($target.type === "pcon") {
let name = $target[0];
let nl = $target[1];
let args = $target[2];
let loc = $target[3];
return $gt$gt$eq($lt_state)(({"1": {"1": types}}) => (($target) => {
if ($target.type === "none") {
return fatal(`Unknown constructor ${name}`)
} ;
if ($target.type === "some") {
if ($target[0].type === ",") {
let free = $target[0][0];
if ($target[0][1].type === ",") {
let cargs = $target[0][1][0];
let tres = $target[0][1][1];
return $gt$gt$eq(map_$gt(fresh_ty_var)(free))((vbls) => $gt$gt$eq($lt_(map$slfrom_list(zip(free)(map((x) => tvar(x)(loc))(vbls)))))((subst) => $gt$gt$eq(infer$slpat_args(subst)(args)(cargs))((arg_con) => $gt$gt$eq($lt_(unzip(arg_con)))(({"1": cvbls, "0": constr}) => $gt$gt$eq($lt_(unzip(cvbls)))(({"1": scopes, "0": cvbls}) => $lt_($co(cand(capp("=")(cons(type$slapply(subst)(tres))(cons(type)(nil)))(loc))(cands(constr)(loc))(loc))($co(concat(cons(vbls)(cvbls)))(foldl(map$slnil)(scopes)(map$slmerge)))))))))
} 
} 
} ;
throw new Error('match fail 2174:' + JSON.stringify($target))
})(map$slget(types)(name)))
} ;
return fatal("l");
throw new Error('match fail 2086:' + JSON.stringify($target))
})(pat)

let infer$slpat_args = (subst) => (args) => (cargs) => map_$gt(({"1": argt, "0": pat}) => infer$slpat(pat)(type$slapply(subst)(argt)))(zip(args)(cargs))
let constraint$slapply = (subst) => (constraint) => (($target) => {
if ($target.type === "capp") {
let name = $target[0];
let types = $target[1];
let loc = $target[2];
return capp(name)(map(type$slapply(subst))(types))(loc)
} ;
if ($target.type === "cand") {
let one = $target[0];
let two = $target[1];
let loc = $target[2];
return cand(constraint$slapply(subst)(one))(constraint$slapply(subst)(two))(loc)
} ;
if ($target.type === "cinstance") {
let name = $target[0];
let type = $target[1];
let loc = $target[2];
return cinstance(name)(type$slapply(subst)(type))(loc)
} ;
if ($target.type === "cexists") {
let vbls = $target[0];
let inner = $target[1];
let loc = $target[2];
return cexists(vbls)(constraint$slapply(subst)(inner))(loc)
} ;
if ($target.type === "cdef") {
let name = $target[0];
let scheme = $target[1];
let inner = $target[2];
let loc = $target[3];
return cdef(name)(scheme$slapply(subst)(scheme))(constraint$slapply(subst)(inner))(loc)
} ;
return constraint;
throw new Error('match fail 2563:' + JSON.stringify($target))
})(constraint)

let scheme$slapply = (subst) => ({"2": type, "1": constraint, "0": vbls}) => forall(vbls)(constraint$slapply(subst)(constraint))(type$slapply(subst)(type))
let type_$gts = (type) => (($target) => {
if ($target.type === "tvar") {
let name = $target[0];
return name
} ;
if ($target.type === "tapp") {
if ($target[0].type === "tapp") {
if ($target[0][0].type === "tcon") {
if ($target[0][0][0] === "->") {
{
let {"1": result, "0": args} = unwrap_fn(type);
return `(fn [${join(" ")(map(type_$gts)(args))}] ${type_$gts(result)})`
}
} 
} 
} 
} ;
if ($target.type === "tapp") {
{
let {"1": args, "0": target} = unwrap_app(type)(nil);
return `(${type_$gts(target)} ${join(" ")(map(type_$gts)(args))})`
}
} ;
if ($target.type === "tcon") {
let name = $target[0];
return name
} ;
throw new Error('match fail 835:' + JSON.stringify($target))
})(type)
let var_bind = ($var) => (type) => (($target) => {
if ($target.type === "tvar") {
let v = $target[0];
{
let $target = $eq($var)(v);
if ($target === true) {
return $lt_(map$slnil)
} ;
return $lt_(one_subst($var)(type));
throw new Error('match fail 2892:' + JSON.stringify($target))
}
} ;
{
let $target = set$slhas(type$slfree(type))($var);
if ($target === true) {
return fatal(`Cycle found while unifying type with type variable. ${$var}`)
} ;
return $lt_(one_subst($var)(type));
throw new Error('match fail 2915:' + JSON.stringify($target))
};
throw new Error('match fail 2885:' + JSON.stringify($target))
})(type)
let constraint_$gts = (cns) => (($target) => {
if ($target.type === "cbool") {
if ($target[0] === true) {
return "true"
} 
} ;
if ($target.type === "cbool") {
if ($target[0] === false) {
return "false"
} 
} ;
if ($target.type === "capp") {
if ($target[0] === "=") {
if ($target[1].type === "cons") {
let one = $target[1][0];
if ($target[1][1].type === "cons") {
let two = $target[1][1][0];
if ($target[1][1][1].type === "nil") {
return `(= ${type_$gts(one)} ${type_$gts(two)})`
} 
} 
} 
} 
} ;
if ($target.type === "cand") {
let left = $target[0];
let right = $target[1];
return `${constraint_$gts(left)} &&\n  ${constraint_$gts(right)}`
} ;
if ($target.type === "cexists") {
let vbls = $target[0];
let inner = $target[1];
return `(∃${join(",")(vbls)} ${constraint_$gts(inner)})`
} ;
if ($target.type === "cdef") {
let name = $target[0];
if ($target[1].type === "forall") {
let vbls = $target[1][0];
let cns = $target[1][1];
let type = $target[1][2];
let inner = $target[2];
return `(${name}=(forall ${join(",")(set$slto_list(vbls))} ${constraint_$gts(cns)} ${type_$gts(type)}) ${constraint_$gts(inner)})`
} 
} ;
if ($target.type === "cinstance") {
let name = $target[0];
let type = $target[1];
return `(vbl ${name} is ${type_$gts(type)})`
} ;
return "[some constraint]";
throw new Error('match fail 3117:' + JSON.stringify($target))
})(cns)
let assumps$slfree = (assumps) => foldl(set$slnil)(map(scheme$slfree)(map$slvalues(assumps)))(set$slmerge)
let substs_$gts = (subst) => join("\n")(map(({"1": type, "0": name}) => `${name}	${type_$gts(type)}`)(map$slto_list(subst)))
let basic_tcons = map$slfrom_list(cons($co(",")($co(cons("a")(cons("b")(nil)))($co(cons(tvar("a")(-1))(cons(tvar("b")(-1))(nil)))(tpair(tvar("a")(-1))(tvar("b")(-1))(-1)))))(nil))
let assumps_$gts = (assumps) => join("\n")(map(({"1": {"2": t}, "0": name}) => `${name} : ${type_$gts(t)}`)(map$slto_list(assumps)))
let assumps$slapply = (subst) => (assumps) => map$slmap(scheme$slapply(subst))(assumps)
let add$sltypealias = ({"3": taliases, "2": types, "1": tcons, "0": values}) => (name) => (args) => (type) => tenv(map$slnil)(map$slnil)(map$slnil)(map$slset(map$slnil)(name)($co(map(fst)(args))(type$slcon_to_var(set$slfrom_list(map(fst)(args)))(type))))
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
throw new Error('match fail 5244:' + JSON.stringify($target))
}
} ;
if ($target.type === "tvar") {
let l = $target[1];
return foldl(target)(args)((a) => (b) => tapp(a)(b)(l))
} ;
return target;
throw new Error('match fail 5237:' + JSON.stringify($target))
}
}
}
}
let split_tops = (stmts) => loop(stmts)((stmts) => (recur) => (($target) => {
if ($target.type === "nil") {
return $co(nil)($co(nil)(nil))
} ;
if ($target.type === "cons") {
let stmt = $target[0];
let rest = $target[1];
{
let {"1": {"1": others, "0": aliases}, "0": defs} = recur(rest);
{
let $target = stmt;
if ($target.type === "tdef") {
let name = $target[0];
let nl = $target[1];
let body = $target[2];
let l = $target[3];
return $co(cons($co(name)($co(nl)($co(body)(l))))(defs))($co(aliases)(others))
} ;
if ($target.type === "ttypealias") {
return $co(defs)($co(cons(stmt)(aliases))(others))
} ;
return $co(defs)($co(aliases)(cons(stmt)(others)));
throw new Error('match fail 5452:' + JSON.stringify($target))
}
}
} ;
throw new Error('match fail 5428:' + JSON.stringify($target))
})(stmts))
let builtin_env2 = tenv(basic_assumps)(basic_tcons)(map$slnil)(map$slnil)
let scheme_$gts = ({"2": t}) => type_$gts(t)
let infer$slquot = (quot) => (($target) => {
if ($target.type === "quot/expr") {
let expr = $target[0];
return "expr"
} ;
if ($target.type === "quot/top") {
let top = $target[0];
return "top"
} ;
if ($target.type === "quot/type") {
let type = $target[0];
return "type"
} ;
if ($target.type === "quot/pat") {
let pat = $target[0];
return "pat"
} ;
if ($target.type === "quot/quot") {
let cst = $target[0];
return "cst"
} ;
throw new Error('match fail 7888:' + JSON.stringify($target))
})(quot)
let infer$slexpr = (expr) => (type) => (($target) => {
if ($target.type === "eprim") {
let prim = $target[0];
let loc = $target[1];
return $lt_(capp("=")(cons(tcon(infer$slprim(prim))(loc))(cons(type)(nil)))(loc))
} ;
if ($target.type === "equot") {
let quot = $target[0];
let loc = $target[1];
return $lt_(capp("=")(cons(tcon(infer$slquot(quot))(loc))(cons(type)(nil)))(loc))
} ;
if ($target.type === "estr") {
let prefix = $target[0];
let interps = $target[1];
let loc = $target[2];
return $gt$gt$eq(map_$gt(({"0": expr}) => infer$slexpr(expr)(tcon("string")(-1)))(interps))((inner) => $lt_(cands(cons(capp("=")(cons(tcon("string")(loc))(cons(type)(nil)))(loc))(inner))(loc)))
} ;
if ($target.type === "evar") {
let name = $target[0];
let loc = $target[1];
return $lt_(cinstance(name)(type)(loc))
} ;
if ($target.type === "elambda") {
if ($target[0].type === "cons") {
if ($target[0][0].type === "pvar") {
let name = $target[0][0][0];
let nl = $target[0][0][1];
if ($target[0][1].type === "nil") {
let body = $target[1];
let loc = $target[2];
return $gt$gt$eq(fresh_ty_var(name))((x1) => $gt$gt$eq(fresh_ty_var("lambda-body"))((x2) => $gt$gt$eq(infer$slexpr(body)(tvar(x2)(loc)))((cbody) => $lt_(cexists(cons(x1)(cons(x2)(nil)))(cand(cdef(name)(forall(set$slnil)(cbool(true)(nl))(tvar(x1)(nl)))(cbody)(nl))(capp("=")(cons(tfn(tvar(x1)(nl))(tvar(x2)(loc))(loc))(cons(type)(nil)))(loc))(loc))(loc)))))
} 
} 
} 
} ;
if ($target.type === "elambda") {
if ($target[0].type === "cons") {
let arg = $target[0][0];
if ($target[0][1].type === "nil") {
let body = $target[1];
let loc = $target[2];
return $gt$gt$eq(fresh_ty_var("fn-arg"))((targ) => $gt$gt$eq(fresh_ty_var("fn-body"))((tres) => $gt$gt$eq(infer$slpat(arg)(tvar(targ)(loc)))(({"1": {"1": scope, "0": vbls}, "0": pat}) => $gt$gt$eq(infer$slexpr(body)(tvar(tres)(loc)))((body) => $lt_(cexists(cons(targ)(cons(tres)(vbls)))(cand(with_scope(cand(pat)(body)(loc))(loc)(scope))(capp("=")(cons(tfn(tvar(targ)(loc))(tvar(tres)(loc))(loc))(cons(type)(nil)))(loc))(loc))(loc))))))
} 
} 
} ;
if ($target.type === "elambda") {
if ($target[0].type === "cons") {
let arg = $target[0][0];
let args = $target[0][1];
let body = $target[1];
let loc = $target[2];
return infer$slexpr(elambda(cons(arg)(nil))(elambda(args)(body)(loc))(loc))(type)
} 
} ;
if ($target.type === "elet") {
if ($target[0].type === "cons") {
if ($target[0][0].type === ",") {
if ($target[0][0][0].type === "pvar") {
let name = $target[0][0][0][0];
let nl = $target[0][0][0][1];
let init = $target[0][0][1];
if ($target[0][1].type === "nil") {
let body = $target[1];
let loc = $target[2];
return $gt$gt$eq(fresh_ty_var(name))((x) => $gt$gt$eq(infer$slexpr(init)(tvar(x)(nl)))((init) => $gt$gt$eq(infer$slexpr(body)(type))((body) => $lt_(cdef(name)(forall(set$sladd(set$slnil)(x))(init)(tvar(x)(nl)))(body)(loc)))))
} 
} 
} 
} 
} ;
if ($target.type === "elet") {
if ($target[0].type === "cons") {
if ($target[0][0].type === ",") {
let pat = $target[0][0][0];
let init = $target[0][0][1];
if ($target[0][1].type === "nil") {
let body = $target[1];
let loc = $target[2];
return $gt$gt$eq(fresh_ty_var("let-init"))((tinit) => $gt$gt$eq(infer$slpat(pat)(tvar(tinit)(loc)))(({"1": {"1": scope, "0": vbls}, "0": cpat}) => $gt$gt$eq(infer$slexpr(init)(tvar(tinit)(loc)))((cinit) => $gt$gt$eq(infer$slexpr(body)(type))((cbody) => $lt_(cexists(cons(tinit)(vbls))(cand(cinit)(with_scope(cand(cpat)(cbody)(loc))(loc)(scope))(loc))(loc))))))
} 
} 
} 
} ;
if ($target.type === "elet") {
if ($target[0].type === "cons") {
let pair = $target[0][0];
let rest = $target[0][1];
let body = $target[1];
let loc = $target[2];
return infer$slexpr(elet(cons(pair)(nil))(elet(rest)(body)(loc))(loc))(type)
} 
} ;
if ($target.type === "eapp") {
let target = $target[0];
if ($target[1].type === "cons") {
let arg = $target[1][0];
if ($target[1][1].type === "nil") {
let loc = $target[2];
return $gt$gt$eq(fresh_ty_var("fn-arg"))((x) => $gt$gt$eq(infer$slexpr(target)(tfn(tvar(x)(loc))(type)(loc)))((target) => $gt$gt$eq(infer$slexpr(arg)(tvar(x)(loc)))((arg) => $lt_(cexists(cons(x)(nil))(cand(target)(arg)(loc))(loc)))))
} 
} 
} ;
if ($target.type === "eapp") {
let target = $target[0];
if ($target[1].type === "cons") {
let arg = $target[1][0];
let rest = $target[1][1];
let loc = $target[2];
return infer$slexpr(eapp(eapp(target)(cons(arg)(nil))(loc))(rest)(loc))(type)
} 
} ;
if ($target.type === "eapp") {
let target = $target[0];
if ($target[1].type === "nil") {
let loc = $target[2];
return infer$slexpr(target)(type)
} 
} ;
if ($target.type === "ematch") {
let target = $target[0];
let cases = $target[1];
let loc = $target[2];
return $gt$gt$eq(fresh_ty_var("match-target"))((ttarget) => $gt$gt$eq(fresh_ty_var("match-result"))((tres) => $gt$gt$eq(infer$slexpr(target)(tvar(ttarget)(loc)))((ctarget) => $gt$gt$eq(map_$gt(({"1": expr, "0": pat}) => $gt$gt$eq(infer$slpat(pat)(tvar(ttarget)(loc)))(({"1": {"1": scope, "0": vbls}, "0": pat_con}) => $gt$gt$eq(infer$slexpr(expr)(tvar(tres)(loc)))((exp_con) => $lt_(cexists(vbls)(with_scope(cand(pat_con)(exp_con)(loc))(loc)(scope))(loc)))))(cases))((ccons) => $lt_(cexists(cons(ttarget)(cons(tres)(nil)))(cands(cons(capp("=")(cons(tvar(tres)(loc))(cons(type)(nil)))(loc))(cons(ctarget)(ccons)))(loc))(loc))))))
} ;
return fatal(`lol ${jsonify(expr)}`);
throw new Error('match fail 1285:' + JSON.stringify($target))
})(expr)
let unify = (t1) => (t2) => (($target) => {
if ($target.type === ",") {
if ($target[0].type === "tvar") {
let $var = $target[0][0];
let l = $target[0][1];
let t = $target[1];
return var_bind($var)(t)
} 
} ;
if ($target.type === ",") {
let t = $target[0];
if ($target[1].type === "tvar") {
let $var = $target[1][0];
let l = $target[1][1];
return var_bind($var)(t)
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
return $lt_(map$slnil)
} ;
return fatal(`Incompatible concrete types: ${a} (${int_to_string(la)}) vs ${b} (${int_to_string(lb)})`);
throw new Error('match fail 2788:' + JSON.stringify($target))
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
return $gt$gt$eq(unify(t1)(t2))((target_subst) => $gt$gt$eq(unify(type$slapply(target_subst)(a1))(type$slapply(target_subst)(a2)))((arg_subst) => $lt_(compose_subst(arg_subst)(target_subst))))
} 
} 
} ;
return fatal(`Incompatible types: ${jsonify(t1)} ${jsonify(t2)}`);
throw new Error('match fail 2748:' + JSON.stringify($target))
})($co(t1)(t2))
let add$sldeftype = ({"3": aliases, "2": types, "1": tcons, "0": globals}) => (name) => (args) => (constrs) => (l) => {
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
return tenv(map$slfrom_list(map(({"1": {"1": {"1": res, "0": args}, "0": free}, "0": name}) => $co(name)(forall(set$slfrom_list(free))(cbool(true)(-1))(tfns(args)(res)(l))))(parsed_constrs)))(map$slfrom_list(parsed_constrs))(map$slset(map$slnil)(name)($co(length(args))(set$slfrom_list(map(fst)(constrs)))))(map$slnil)
}
}
}
}
let solve = (constraint) => (assumps) => (free) => (($target) => {
if ($target.type === "cbool") {
if ($target[0] === true) {
return $lt_(map$slnil)
} 
} ;
if ($target.type === "cbool") {
if ($target[0] === false) {
return fatal("got a false")
} 
} ;
if ($target.type === "cand") {
let one = $target[0];
let two = $target[1];
return $gt$gt$eq(solve(one)(assumps)(free))((subst) => $gt$gt$eq(solve(constraint$slapply(subst)(two))(assumps$slapply(subst)(assumps))(free))((s2) => $lt_(compose_subst(s2)(subst))))
} ;
if ($target.type === "capp") {
if ($target[0] === "=") {
if ($target[1].type === "cons") {
let one = $target[1][0];
if ($target[1][1].type === "cons") {
let two = $target[1][1][0];
if ($target[1][1][1].type === "nil") {
return unify(one)(two)
} 
} 
} 
} 
} ;
if ($target.type === "cexists") {
let tvars = $target[0];
let inner = $target[1];
return solve(inner)(assumps)(set$slmerge(free)(set$slfrom_list(tvars)))
} ;
if ($target.type === "cinstance") {
let name = $target[0];
let type = $target[1];
let loc = $target[2];
return $gt$gt$eq((($target) => {
if ($target.type === "some") {
let got = $target[0];
return $lt_(got)
} ;
return $gt$gt$eq($lt_state)(({"1": {"0": globals}}) => (($target) => {
if ($target.type === "none") {
return fatal(`Unbound vbl ${name}`)
} ;
if ($target.type === "some") {
let got = $target[0];
return $lt_(got)
} ;
throw new Error('match fail 6273:' + JSON.stringify($target))
})(map$slget(globals)(name)));
throw new Error('match fail 6245:' + JSON.stringify($target))
})(map$slget(assumps)(name)))((got) => $gt$gt$eq(instantiate(got)(loc))((got) => $gt$gt$eq(unify(got)(type))((subst) => $lt_(subst))))
} ;
if ($target.type === "cdef") {
let name = $target[0];
let scheme = $target[1];
let inner = $target[2];
let loc = $target[3];
return $gt$gt$eq($lt_(scheme))(({"2": t, "1": cns}) => $gt$gt$eq(solve(cns)(assumps)(free))((subst) => $gt$gt$eq($lt_(type$slapply(subst)(t)))((nt) => $gt$gt$eq(solve(constraint$slapply(subst)(inner))(map$slset(assumps$slapply(subst)(assumps))(name)(forall(set$sldiff(type$slfree(nt))(free))(cbool(true)(loc))(nt)))(free))((res) => $lt_(compose_subst(res)(subst))))))
} ;
return fatal("bad news bears");
throw new Error('match fail 1833:' + JSON.stringify($target))
})(constraint)
let check = (expr) => run_$gt($gt$gt$eq(fresh_ty_var("result"))((v) => $gt$gt$eq(infer$slexpr(expr)(tvar(v)(-1)))((constraint) => $gt$gt$eq(solve(constraint)(map$slnil)(set$slnil))((subst) => $lt_($co(constraint)($co(subst)(type$slapply(subst)(tvar(v)(-1)))))))))($co(0)(tenv(basic_assumps)(basic_tcons)(map$slnil)(map$slnil)))
let run_and_solve = (inner) => (assumps) => $gt$gt$eq(inner)((constraint) => $gt$gt$eq(solve(constraint)(assumps)(set$slnil))((subst) => $lt_(subst)))
let add$sldef = (type_env) => (name) => (nl) => (expr) => (l) => run_$gt($gt$gt$eq(fresh_ty_var(name))((v) => $gt$gt$eq(infer$slexpr(expr)(tvar(v)(nl)))((constraint) => $gt$gt$eq(solve(cexists(cons(v)(nil))(cdef(name)(forall(set$slnil)(cbool(true)(l))(tvar(v)(nl)))(constraint)(l))(l))(map$slnil)(set$slnil))((subst) => $gt$gt$eq($lt_(type$slapply(subst)(tvar(v)(nl))))((type) => $lt_(tenv$slwith_global(tenv$slnil)(name)(forall(type$slfree(type))(cbool(true)(l))(type))))))))($co(0)(type_env))
let add$sldefs = (type_env) => (defns) => run_$gt($gt$gt$eq($lt_(map(({"0": name}) => name)(defns)))((names) => $gt$gt$eq($lt_(map(({"1": {"1": {"1": l}}}) => l)(defns)))((locs) => $gt$gt$eq(map_$gt(({"1": {"0": nl}, "0": name}) => fresh_ty_var(name))(defns))((vbls) => $gt$gt$eq(map_$gt(({"1": vbl, "0": {"1": {"1": {"1": l, "0": expr}, "0": nl}, "0": name}}) => infer$slexpr(expr)(tvar(vbl)(nl)))(zip(defns)(vbls)))((constraints) => $gt$gt$eq(solve(foldl(cands(constraints)(-1))(zip(defns)(vbls))((inner) => ({"1": vbl, "0": {"1": {"0": nl}, "0": name}}) => cdef(name)(forall(set$slnil)(cbool(true)(nl))(tvar(vbl)(nl)))(inner)(nl)))(map$slnil)(set$slnil))((subst) => $lt_(foldl(tenv$slnil)(zip(names)(vbls))((tenv) => ({"1": vbl, "0": name}) => tenv$slwith_global(tenv)(name)((() => {
let type = type$slapply(subst)(tvar(vbl)(-1));
return forall(type$slfree(type))(cbool(true)(-1))(type)
})())))))))))($co(0)(type_env))
let add$sltop = (tenv) => (top) => (($target) => {
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
return run_$gt($gt$gt$eq(fresh_ty_var("expr"))((v) => $gt$gt$eq(infer$slexpr(expr)(tvar(v)(l)))((constraint) => $gt$gt$eq(solve(cexists(cons(v)(nil))(constraint)(l))(map$slnil)(set$slnil))((subst) => $gt$gt$eq($lt_(type$slapply(subst)(tvar(v)(l))))((type) => $lt_(tenv$slnil))))))($co(0)(tenv))
} ;
if ($target.type === "ttypealias") {
let name = $target[0];
let args = $target[2];
let type = $target[3];
return add$sltypealias(tenv)(name)(args)(type)
} ;
if ($target.type === "tdeftype") {
let name = $target[0];
let args = $target[2];
let constrs = $target[3];
let l = $target[4];
return add$sldeftype(tenv)(name)(args)(constrs)(l)
} ;
throw new Error('match fail 5354:' + JSON.stringify($target))
})(top)
let add$sltops = (tenv) => (tops) => {
let {"1": {"1": others, "0": aliases}, "0": defs} = split_tops(tops);
{
let denv = add$sldefs(tenv)(defs);
{
let final = foldl(denv)(concat(cons(aliases)(cons(others)(nil))))((env) => (stmt) => tenv$slmerge(env)(add$sltop(tenv$slmerge(tenv)(env))(stmt)));
return final
}
}
}
let add$slexpr = (type_env) => (expr) => run_$gt($gt$gt$eq(fresh_ty_var("expr"))((v) => $gt$gt$eq(infer$slexpr(expr)(tvar(v)(-1)))((constraint) => $gt$gt$eq(solve(cexists(cons(v)(nil))(constraint)(-1))(map$slnil)(set$slnil))((subst) => $gt$gt$eq($lt_(type$slapply(subst)(tvar(v)(-1))))((type) => $lt_(type))))))($co(0)(type_env))
return $eval("env_nil => add_stmt => get_type => type_to_string => infer_stmts => infer =>\n  ({type: 'fns', env_nil, add_stmt, get_type, type_to_string, infer_stmts, infer})\n")(builtin_env)(tenv$slmerge)(tenv$slresolve)(scheme_$gts)(add$sltops)((env) => (expr) => forall(set$slnil)(cbool(true)(-1))(add$slexpr(env)(expr)))