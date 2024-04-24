let pint = (v0) => (v1) => ({type: "pint", 0: v0, 1: v1})
let pbool = (v0) => (v1) => ({type: "pbool", 0: v0, 1: v1})
let snd = (tuple) => {
let {"1": v} = tuple;
return v
}
let fst = (tuple) => {
let {"0": v} = tuple;
return v
}
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
let $co$co0 = (x) => {
let {"0": a} = x;
return a
}
let $co$co1 = (x) => {
let {"1": a} = x;
return a
}
let $co$co2 = (x) => {
let {"2": a} = x;
return a
}
let $co$co$co2 = (x) => {
let x$0 = x;
{
let {"2": x} = x$0;
return x
}
}
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
let map$co$co0 = (f) => ({"2": c, "1": b, "0": a}) => $co$co(f(a))(b)(c)
let map$co1 = (f) => ({"1": b, "0": a}) => $co(a)(f(b))

let StateT = (v0) => ({type: "StateT", 0: v0})
let run_$gt = ({"0": f}) => (state) => {
let {"1": result} = f(state);
return result
}
let state_f = ({"0": f}) => f
let $gt$gt$eq = ({"0": f}) => (next) => StateT((state) => {
let state$0 = state;
{
let {"1": value, "0": state} = f(state$0);
return state_f(next(value))(state)
}
})
let $lt_ = (x) => StateT((state) => $co(state)(x))
let $lt_state = StateT((state) => $co(state)(state))
let state_$gt = (v) => StateT((old) => $co(v)(old))
let id = (x) => x
let nil = {type: "nil"}
let cons = (v0) => (v1) => ({type: "cons", 0: v0, 1: v1})
let pany = (v0) => ({type: "pany", 0: v0})
let pvar = (v0) => (v1) => ({type: "pvar", 0: v0, 1: v1})
let pcon = (v0) => (v1) => (v2) => (v3) => ({type: "pcon", 0: v0, 1: v1, 2: v2, 3: v3})
let pstr = (v0) => (v1) => ({type: "pstr", 0: v0, 1: v1})
let pprim = (v0) => (v1) => ({type: "pprim", 0: v0, 1: v1})
let tvar = (v0) => (v1) => ({type: "tvar", 0: v0, 1: v1})
let tapp = (v0) => (v1) => (v2) => ({type: "tapp", 0: v0, 1: v1, 2: v2})
let tcon = (v0) => (v1) => ({type: "tcon", 0: v0, 1: v1})
let cst$sllist = (v0) => (v1) => ({type: "cst/list", 0: v0, 1: v1})
let cst$slarray = (v0) => (v1) => ({type: "cst/array", 0: v0, 1: v1})
let cst$slspread = (v0) => (v1) => ({type: "cst/spread", 0: v0, 1: v1})
let cst$slidentifier = (v0) => (v1) => ({type: "cst/identifier", 0: v0, 1: v1})
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
let tapps = (items) => (l) => (($target) => {
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
throw new Error('match fail 6762:' + JSON.stringify($target))
})(pat)
let pat_externals = (pat) => (($target) => {
if ($target.type === "pcon") {
let name = $target[0];
let nl = $target[1];
let args = $target[2];
let l = $target[3];
return bag$sland(one($co$co(name)(value)(nl)))(many(map(args)(pat_externals)))
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
return one($co$co(name)(type)(l));
throw new Error('match fail 7121:' + JSON.stringify($target))
}
} ;
if ($target.type === "tapp") {
let one = $target[0];
let two = $target[1];
return bag$sland(externals_type(bound)(one))(externals_type(bound)(two))
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
throw new Error('match fail 9887:' + JSON.stringify($target))
})(type)
let type_size = (type) => fold_type(0)(type)((v) => (_9922) => 1 + v)
let pat_arg = (ctx) => (pat) => (($target) => {
if ($target.type === "j/pvar") {
let name = $target[0];
let l = $target[1];
return sanitize(name)
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
return `{${join(", ")(map(items)((pair) => `\"${escape_string(fst(pair))}\": ${pat_arg(ctx)(snd(pair))}`))}}${(($target) => {
if ($target.type === "some") {
let s = $target[0];
return `...${pat_arg(ctx)(s)}`
} ;
if ($target.type === "none") {
return ""
} ;
throw new Error('match fail 10671:' + JSON.stringify($target))
})(spread)}`
} ;
throw new Error('match fail 10594:' + JSON.stringify($target))
})(pat)
let pat_$gtj$slpat = (pat) => (($target) => {
if ($target.type === "pany") {
let l = $target[0];
return none
} ;
if ($target.type === "pvar") {
let name = $target[0];
let l = $target[1];
return some(j$slpvar(name)(l))
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
throw new Error('match fail 14667:' + JSON.stringify($target))
})(pat)
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
throw new Error('match fail 15967:' + JSON.stringify($target))
})($co(one)(two))
let $lt_err = (e) => (v) => StateT((state) => $co(cons(e)(state))(v))
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
if ($target.type === "cst/identifier") {
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
throw new Error('match fail 17105:' + JSON.stringify($target))
})(cst)
let eprim = (v0) => (v1) => ({type: "eprim", 0: v0, 1: v1})
let estr = (v0) => (v1) => (v2) => ({type: "estr", 0: v0, 1: v1, 2: v2})
let evar = (v0) => (v1) => ({type: "evar", 0: v0, 1: v1})
let equot = (v0) => (v1) => ({type: "equot", 0: v0, 1: v1})
let elambda = (v0) => (v1) => (v2) => ({type: "elambda", 0: v0, 1: v1, 2: v2})
let eapp = (v0) => (v1) => (v2) => ({type: "eapp", 0: v0, 1: v1, 2: v2})
let elet = (v0) => (v1) => (v2) => ({type: "elet", 0: v0, 1: v1, 2: v2})
let ematch = (v0) => (v1) => (v2) => ({type: "ematch", 0: v0, 1: v1, 2: v2})

let quot$slexpr = (v0) => ({type: "quot/expr", 0: v0})
let quot$slstmt = (v0) => ({type: "quot/stmt", 0: v0})
let quot$sltype = (v0) => ({type: "quot/type", 0: v0})
let quot$slpat = (v0) => ({type: "quot/pat", 0: v0})
let quot$slquot = (v0) => ({type: "quot/quot", 0: v0})

let stypealias = (v0) => (v1) => (v2) => (v3) => (v4) => ({type: "stypealias", 0: v0, 1: v1, 2: v2, 3: v3, 4: v4})
let sdeftype = (v0) => (v1) => (v2) => (v3) => (v4) => ({type: "sdeftype", 0: v0, 1: v1, 2: v2, 3: v3, 4: v4})
let sdef = (v0) => (v1) => (v2) => (v3) => ({type: "sdef", 0: v0, 1: v1, 2: v2, 3: v3})
let sexpr = (v0) => (v1) => ({type: "sexpr", 0: v0, 1: v1})
let parse_pat = (pat) => (($target) => {
if ($target.type === "cst/identifier") {
if ($target[0] === "_") {
let l = $target[1];
return $lt_(pany(l))
} 
} ;
if ($target.type === "cst/identifier") {
if ($target[0] === "true") {
let l = $target[1];
return $lt_(pprim(pbool(true)(l))(l))
} 
} ;
if ($target.type === "cst/identifier") {
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
if ($target.type === "cst/identifier") {
let id = $target[0];
let l = $target[1];
return $lt_((($target) => {
if ($target.type === "some") {
let int = $target[0];
return pprim(pint(int)(l))(l)
} ;
return pvar(id)(l);
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
if ($target[0][0].type === "cst/identifier") {
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
if ($target[0][0].type === "cst/identifier") {
let name = $target[0][0][0];
let il = $target[0][0][1];
let rest = $target[0][1];
let l = $target[1];
return $gt$gt$eq(map_$gt(parse_pat)(rest))((rest) => $lt_(pcon(name)(il)(rest)(l)))
} 
} 
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
throw new Error('match fail 4708:' + JSON.stringify($target))
})(expr)
let parse_and_compile = (v0) => (v1) => (v2) => (v3) => (v4) => (v5) => (v6) => (v7) => (v8) => (v9) => ({type: "parse-and-compile", 0: v0, 1: v1, 2: v2, 3: v3, 4: v4, 5: v5, 6: v6, 7: v7, 8: v8, 9: v9})
let externals = (bound) => (expr) => (($target) => {
if ($target.type === "evar") {
let name = $target[0];
let l = $target[1];
{
let $target = set$slhas(bound)(name);
if ($target === true) {
return empty
} ;
return one($co$co(name)(value)(l));
throw new Error('match fail 6852:' + JSON.stringify($target))
}
} ;
if ($target.type === "eprim") {
let prim = $target[0];
let l = $target[1];
return empty
} ;
if ($target.type === "estr") {
let first = $target[0];
let templates = $target[1];
let l = $target[2];
return many(map(templates)((arg) => (($target) => {
if ($target.type === ",,") {
let expr = $target[0];
return externals(bound)(expr)
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
let names = (stmt) => (($target) => {
if ($target.type === "sdef") {
let name = $target[0];
let l = $target[1];
return cons($co$co(name)(value)(l))(nil)
} ;
if ($target.type === "sexpr") {
return nil
} ;
if ($target.type === "stypealias") {
let name = $target[0];
let l = $target[1];
return cons($co$co(name)(type)(l))(nil)
} ;
if ($target.type === "sdeftype") {
let name = $target[0];
let l = $target[1];
let constructors = $target[3];
return cons($co$co(name)(type)(l))(map(constructors)((arg) => (($target) => {
if ($target.type === ",,,") {
let name = $target[0];
let l = $target[1];
return $co$co(name)(value)(l)
} ;
throw new Error('match fail 7429:' + JSON.stringify($target))
})(arg)))
} ;
throw new Error('match fail 7156:' + JSON.stringify($target))
})(stmt)
let externals_stmt = (stmt) => bag$slto_list((($target) => {
if ($target.type === "sdeftype") {
let string = $target[0];
let free = $target[2];
let constructors = $target[3];
{
let frees = set$slfrom_list(map(free)(fst));
return many(map(constructors)((constructor) => (($target) => {
if ($target.type === ",,,") {
let name = $target[0];
let l = $target[1];
let args = $target[2];
{
let $target = args;
if ($target.type === "nil") {
return empty
} ;
return many(map(args)(externals_type(frees)));
throw new Error('match fail 7265:' + JSON.stringify($target))
}
} ;
throw new Error('match fail 7440:' + JSON.stringify($target))
})(constructor)))
}
} ;
if ($target.type === "stypealias") {
let name = $target[0];
let args = $target[2];
let body = $target[3];
{
let frees = set$slfrom_list(map(args)(fst));
return externals_type(frees)(body)
}
} ;
if ($target.type === "sdef") {
let name = $target[0];
let body = $target[2];
return externals(set$sladd(set$slnil)(name))(body)
} ;
if ($target.type === "sexpr") {
let expr = $target[0];
return externals(set$slnil)(expr)
} ;
throw new Error('match fail 7231:' + JSON.stringify($target))
})(stmt))
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
if ($target.type === "ematch") {
let expr = $target[0];
let int = $target[2];
return "match"
} ;
throw new Error('match fail 9654:' + JSON.stringify($target))
})(expr)
let expr_size = (expr) => fold_expr(0)(expr)((v) => (_9712) => 1 + v)
let stmt_size = (stmt) => 1 + (($target) => {
if ($target.type === "sdef") {
let string = $target[0];
let expr = $target[2];
return expr_size(expr)
} ;
if ($target.type === "sexpr") {
let expr = $target[0];
return expr_size(expr)
} ;
if ($target.type === "stypealias") {
let string = $target[0];
let args = $target[2];
let type = $target[3];
return type_size(type)
} ;
if ($target.type === "sdeftype") {
let string = $target[0];
let args = $target[2];
let constructors = $target[3];
return foldl(0)(constructors)((v) => ($const) => foldl(v)(map($co$co$co2($const))(type_size))($pl))
} ;
throw new Error('match fail 9730:' + JSON.stringify($target))
})(stmt)
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
let l = $target[0][2];
if ($target[1].type === "nil") {
let l = $target[2];
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
return cons(j$sllet(one)(two)(l))(make_lets(params)(args)(l))
} 
} 
} ;
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
let externals$slj = fx((names) => (expr) => (($target) => {
if ($target.type === "j/var") {
let name = $target[0];
return set$sladd(names)(name)
} ;
return names;
throw new Error('match fail 15447:' + JSON.stringify($target))
})(expr))(nop)(nop)(nop)
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
return foldl(nil)(names)((stmts) => ({"1": loc, "0": name}) => (($target) => {
if ($target.type === "none") {
return stmts
} ;
if ($target.type === "some") {
let info = $target[0];
return cons(j$slsexpr(j$slapp(j$slvar("\$trace")(-1))(cons(j$slprim(j$slint(loc)(-1))(-1))(cons(j$slraw(jsonify(info))(-1))(cons(j$slvar(name)(-1))(nil))))(-1))(-1))(nil)
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
if ($target.type === "quot/stmt") {
let stmt = $target[0];
return jsonify(stmt)
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
let sunit = (k) => sexpr(eunit(k))(k)
let compile_pat$slj = (pat) => (target) => (inner) => (trace) => (($target) => {
if ($target.type === "pany") {
let l = $target[0];
return inner
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
return cons(j$sllet(j$slpvar(name)(l))(target)(l))(inner)
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
let {"2": l, "1": suffix, "0": expr} = item;
return `\${${j$slcompile(ctx)(expr)}}${escape_string(unescapeString(suffix))}`
}))}\``;
throw new Error('match fail 12068:' + JSON.stringify($target))
}
} ;
if ($target.type === "j/var") {
let name = $target[0];
let l = $target[1];
return sanitize(name)
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
return `${name}: ${j$slcompile(ctx)(value)}`
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
return j$slstr(string)(map(tpls)(({"2": l, "1": suffix, "0": expr}) => $co$co(loop(expr))(suffix)(l)))(l)
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
let parse_type = (type) => (($target) => {
if ($target.type === "cst/identifier") {
let id = $target[0];
let l = $target[1];
return $lt_(tcon(id)(l))
} ;
if ($target.type === "cst/list") {
if ($target[0].type === "nil") {
let l = $target[1];
return $lt_err($co(l)("(parse-type) with empty list"))(tcon("()")(l))
} 
} ;
if ($target.type === "cst/list") {
if ($target[0].type === "cons") {
if ($target[0][0].type === "cst/identifier") {
if ($target[0][0][0] === "fn") {
if ($target[0][1].type === "cons") {
if ($target[0][1][0].type === "cst/array") {
let args = $target[0][1][0][0];
if ($target[0][1][1].type === "cons") {
let body = $target[0][1][1][0];
let rest = $target[0][1][1][1];
return $gt$gt$eq(parse_type(body))((body) => $gt$gt$eq(map_$gt(parse_type)(args))((args) => $gt$gt$eq(do_$gt(unexpected("extra item in type"))(rest))((_17506) => $lt_(foldl(body)(rev(args)(nil))((body) => (arg) => tapp(tapp(tcon("->")(-1))(arg)(-1))(body)(-1))))))
} 
} 
} 
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
if ($target.type === "cst/identifier") {
let name = $target[0];
let l = $target[1];
return $lt_(cons($co(name)(l))(args))
} ;
return $lt_err($co(l)("deftype type argument must be identifier"))(args);
throw new Error('match fail 5024:' + JSON.stringify($target))
})(arg)))((args) => $gt$gt$eq(foldr_$gt(nil)(items)((res) => (constr) => (($target) => {
if ($target.type === "cst/list") {
if ($target[0].type === "cons") {
if ($target[0][0].type === "cst/identifier") {
let name = $target[0][0][0];
let ni = $target[0][0][1];
let args = $target[0][1];
let l = $target[1];
return $gt$gt$eq(map_$gt(parse_type)(args))((args) => $lt_(cons($co$co$co(name)(ni)(args)(l))(res)))
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
})(constr)))((items) => $lt_(sdeftype(id)(li)(args)(items)(l))))
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
let overlap = bag$slfold((shadow) => ({"2": l, "1": kind, "0": name}) => (($target) => {
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
if ($target.type === "cst/identifier") {
let name = $target[0];
let nl = $target[1];
return $co$co(name)(nl)(nil)
} ;
if ($target.type === "cst/list") {
if ($target[0].type === "cons") {
if ($target[0][0].type === "cst/identifier") {
let name = $target[0][0][0];
let nl = $target[0][0][1];
let args = $target[0][1];
return $co$co(name)(nl)(args)
} 
} 
} ;
throw new Error('match fail 17297:' + JSON.stringify($target))
})(name)))(({"2": args, "1": nl, "0": name}) => $gt$gt$eq(foldr_$gt(nil)(args)((args) => (x) => (($target) => {
if ($target.type === "cst/identifier") {
let name = $target[0];
let l = $target[1];
return $lt_(cons($co(name)(l))(args))
} ;
return $lt_err($co(cst_loc(x))("typealias type argument must be identifier"))(args);
throw new Error('match fail 17336:' + JSON.stringify($target))
})(x)))((args) => $gt$gt$eq(parse_type(body))((body) => $lt_(stypealias(name)(nl)(args)(body)(l)))))
let parse_stmt = (cst) => (($target) => {
if ($target.type === "cst/list") {
if ($target[0].type === "cons") {
if ($target[0][0].type === "cst/identifier") {
if ($target[0][0][0] === "def") {
if ($target[0][1].type === "cons") {
if ($target[0][1][0].type === "cst/identifier") {
let id = $target[0][1][0][0];
let li = $target[0][1][0][1];
if ($target[0][1][1].type === "cons") {
let value = $target[0][1][1][0];
let rest = $target[0][1][1][1];
let l = $target[1];
return $gt$gt$eq(parse_expr(value))((expr) => $gt$gt$eq(do_$gt(unexpected("extra items in def"))(rest))((_16836) => $lt_(sdef(id)(li)(expr)(l))))
} 
} 
} 
} 
} 
} 
} ;
if ($target.type === "cst/list") {
if ($target[0].type === "cons") {
if ($target[0][0].type === "cst/identifier") {
if ($target[0][0][0] === "def") {
let l = $target[1];
return $lt_err($co(l)("Invalid 'def'"))(sunit(l))
} 
} 
} 
} ;
if ($target.type === "cst/list") {
if ($target[0].type === "cons") {
if ($target[0][0].type === "cst/identifier") {
if ($target[0][0][0] === "defn") {
if ($target[0][1].type === "cons") {
if ($target[0][1][0].type === "cst/identifier") {
let id = $target[0][1][0][0];
let li = $target[0][1][0][1];
if ($target[0][1][1].type === "nil") {
let c = $target[1];
return $lt_(sdef(id)(li)(evar("nil")(c))(c))
} 
} 
} 
} 
} 
} 
} ;
if ($target.type === "cst/list") {
if ($target[0].type === "cons") {
if ($target[0][0].type === "cst/identifier") {
if ($target[0][0][0] === "defn") {
if ($target[0][1].type === "cons") {
if ($target[0][1][0].type === "cst/identifier") {
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
return $lt_(sdef(id)(li)(evar("nil")(c))(c))
} ;
if ($target.type === "cons") {
let body = $target[0];
let rest = $target[1];
return $gt$gt$eq(parse_expr(body))((body) => $gt$gt$eq(do_$gt(unexpected("extra items in defn"))(rest))((_17050) => $lt_(sdef(id)(li)(elambda(args)(body)(c))(c))))
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
if ($target[0][0].type === "cst/identifier") {
if ($target[0][0][0] === "defn") {
let l = $target[1];
return $lt_err($co(l)("Invalid 'defn'"))(sunit(l))
} 
} 
} 
} ;
if ($target.type === "cst/list") {
if ($target[0].type === "cons") {
if ($target[0][0].type === "cst/identifier") {
if ($target[0][0][0] === "deftype") {
if ($target[0][1].type === "cons") {
let name = $target[0][1][0];
let items = $target[0][1][1];
let l = $target[1];
{
let $target = name;
if ($target.type === "cst/identifier") {
let id = $target[0];
let li = $target[1];
return mk_deftype(id)(li)(nil)(items)(l)
} ;
if ($target.type === "cst/list") {
if ($target[0].type === "cons") {
if ($target[0][0].type === "cst/identifier") {
let id = $target[0][0][0];
let li = $target[0][0][1];
let args = $target[0][1];
return mk_deftype(id)(li)(args)(items)(l)
} 
} 
} ;
throw new Error('match fail 17376:' + JSON.stringify($target))
}
} 
} 
} 
} 
} ;
if ($target.type === "cst/list") {
if ($target[0].type === "cons") {
if ($target[0][0].type === "cst/identifier") {
if ($target[0][0][0] === "deftype") {
let l = $target[1];
return $lt_err($co(l)("Invalid deftype"))(sunit(l))
} 
} 
} 
} ;
if ($target.type === "cst/list") {
if ($target[0].type === "cons") {
if ($target[0][0].type === "cst/identifier") {
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
return $gt$gt$eq(parse_expr(cst))((expr) => $lt_(sexpr(expr)(cst_loc(cst))));
throw new Error('match fail 606:' + JSON.stringify($target))
})(cst)

let parse_expr = (cst) => (($target) => {
if ($target.type === "cst/identifier") {
if ($target[0] === "true") {
let l = $target[1];
return $lt_(eprim(pbool(true)(l))(l))
} 
} ;
if ($target.type === "cst/identifier") {
if ($target[0] === "false") {
let l = $target[1];
return $lt_(eprim(pbool(false)(l))(l))
} 
} ;
if ($target.type === "cst/string") {
let first = $target[0];
let templates = $target[1];
let l = $target[2];
return $gt$gt$eq(map_$gt(({"2": l, "1": suffix, "0": expr}) => $gt$gt$eq(parse_expr(expr))((expr) => $lt_($co$co(expr)(suffix)(l))))(templates))((tpls) => $lt_(estr(first)(tpls)(l)))
} ;
if ($target.type === "cst/identifier") {
let id = $target[0];
let l = $target[1];
return $lt_((($target) => {
if ($target.type === "some") {
let int = $target[0];
return eprim(pint(int)(l))(l)
} ;
if ($target.type === "none") {
return evar(id)(l)
} ;
throw new Error('match fail 970:' + JSON.stringify($target))
})(string_to_int(id)))
} ;
if ($target.type === "cst/list") {
if ($target[0].type === "cons") {
if ($target[0][0].type === "cst/identifier") {
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
if ($target[0][0].type === "cst/identifier") {
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
if ($target[0][0].type === "cst/identifier") {
if ($target[0][0][0] === "@!") {
if ($target[0][1].type === "cons") {
let body = $target[0][1][0];
if ($target[0][1][1].type === "nil") {
let l = $target[1];
return $gt$gt$eq(parse_stmt(body))((stmt) => $lt_(equot(quot$slstmt(stmt))(l)))
} 
} 
} 
} 
} 
} ;
if ($target.type === "cst/list") {
if ($target[0].type === "cons") {
if ($target[0][0].type === "cst/identifier") {
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
if ($target[0][0].type === "cst/identifier") {
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
if ($target[0][0].type === "cst/identifier") {
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
if ($target[0][0].type === "cst/identifier") {
if ($target[0][0][0] === "fn") {
if ($target[0][1].type === "cons") {
if ($target[0][1][0].type === "cst/array") {
let args = $target[0][1][0][0];
if ($target[0][1][1].type === "cons") {
let body = $target[0][1][1][0];
let rest = $target[0][1][1][1];
let b = $target[1];
return $gt$gt$eq(map_$gt(parse_pat)(args))((args) => $gt$gt$eq(parse_expr(body))((body) => $gt$gt$eq(do_$gt(unexpected("extra arg in fn"))(rest))((_17702) => $lt_(elambda(args)(body)(b)))))
} 
} 
} 
} 
} 
} 
} ;
if ($target.type === "cst/list") {
if ($target[0].type === "cons") {
if ($target[0][0].type === "cst/identifier") {
if ($target[0][0][0] === "fn") {
let l = $target[1];
return $lt_err($co(l)(`Invalid 'fn' ${int_to_string(l)}`))(evar("()")(l))
} 
} 
} 
} ;
if ($target.type === "cst/list") {
if ($target[0].type === "cons") {
if ($target[0][0].type === "cst/identifier") {
if ($target[0][0][0] === "match") {
if ($target[0][1].type === "cons") {
let target = $target[0][1][0];
let cases = $target[0][1][1];
let l = $target[1];
return $gt$gt$eq(parse_expr(target))((target) => $gt$gt$eq(pairs(cases))((cases) => $gt$gt$eq(map_$gt(({"1": expr, "0": pat}) => $gt$gt$eq(parse_pat(pat))((pat) => $gt$gt$eq(parse_expr(expr))((expr) => $lt_($co(pat)(expr)))))(cases))((cases) => $lt_(ematch(target)(cases)(l)))))
} 
} 
} 
} 
} ;
if ($target.type === "cst/list") {
if ($target[0].type === "cons") {
if ($target[0][0].type === "cst/identifier") {
if ($target[0][0][0] === "let") {
if ($target[0][1].type === "cons") {
if ($target[0][1][0].type === "cst/array") {
let inits = $target[0][1][0][0];
if ($target[0][1][1].type === "cons") {
let body = $target[0][1][1][0];
if ($target[0][1][1][1].type === "nil") {
let l = $target[1];
return $gt$gt$eq(pairs(inits))((inits) => $gt$gt$eq(map_$gt(({"1": value, "0": pat}) => $gt$gt$eq(parse_pat(pat))((pat) => $gt$gt$eq(parse_expr(value))((value) => $lt_($co(pat)(value)))))(inits))((bindings) => $gt$gt$eq(parse_expr(body))((body) => $lt_(elet(bindings)(body)(l)))))
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
if ($target[0][0].type === "cst/identifier") {
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
if ($target[0][0].type === "cst/identifier") {
if ($target[0][0][0] === "let") {
let l = $target[1];
return $lt_err($co(l)(`Invalid 'let' ${int_to_string(l)}`))(evar("()")(l))
} 
} 
} 
} ;
if ($target.type === "cst/list") {
if ($target[0].type === "cons") {
if ($target[0][0].type === "cst/identifier") {
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
return $gt$gt$eq(parse_expr(target))((target) => $gt$gt$eq(map_$gt(parse_expr)(args))((args) => $lt_(eapp(target)(args)(l))))
} 
} ;
if ($target.type === "cst/array") {
let args = $target[0];
let l = $target[1];
return parse_array(args)(l)
} ;
throw new Error('match fail 963:' + JSON.stringify($target))
})(cst)

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
return j$slstr(first)(map(tpls)(({"2": l, "1": suffix, "0": expr}) => $co$co(compile$slj(expr)(trace))(suffix)(l)))(l)
} ;
if ($target.type === "eprim") {
let prim = $target[0];
let l = $target[1];
{
let $target = prim;
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
}
} ;
if ($target.type === "evar") {
let name = $target[0];
let l = $target[1];
return j$slvar(name)(l)
} ;
if ($target.type === "equot") {
let inner = $target[0];
let l = $target[1];
return j$slraw(quot$sljsonify(inner))(l)
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
})(pat_$gtj$slpat(pat)))(nil))((($target) => {
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
if ($target.type === "ematch") {
let target = $target[0];
let cases = $target[1];
let l = $target[2];
return j$slapp(j$sllambda(cons(j$slpvar("\$target")(l))(nil))(left(j$slblock(concat(cons(map(cases)(({"1": body, "0": pat}) => j$slsblock(j$slblock(compile_pat$slj(pat)(j$slvar("\$target")(l))(concat(cons(trace_pat(pat)(trace))(cons(cons(j$slreturn(compile$slj(body)(trace))(l))(nil))(nil))))(trace)))(l)))(cons(cons(j$slthrow(j$slraw(`new Error('match fail ${its(l)}:' + JSON.stringify(\$target))`)(0))(0))(nil))(nil))))))(l))(cons(compile$slj(target)(trace))(nil))(l)
} ;
throw new Error('match fail 11496:' + JSON.stringify($target))
})(expr))

let compile_let$slj = (body) => (trace) => (bindings) => (l) => foldr(compile$slj(body)(trace))(expand_bindings(bindings)(l))((body) => (binding) => j$slapp(j$sllambda(nil)(left(j$slblock(concat(cons(cons(compile_let_binding$slj(binding)(trace)(l))(nil))(cons(trace_pat(fst(binding))(trace))(cons(cons(j$slreturn(body)(l))(nil))(nil)))))))(l))(nil)(l))

let app$slj = (target) => (args) => (trace) => (l) => foldl(compile$slj(target)(trace))(args)((target) => (arg) => j$slapp(target)(cons(compile$slj(arg)(trace))(nil))(l))

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
let run$slj = (v) => eval(j$slcompile(0)(compile$slj(run$slnil_$gt(parse_expr(v)))(map$slnil)))
let simplify_block = ({"0": items}) => (($target) => {
{
let $target = call_at_end(items);
if ($target.type === "none") {
return none
} ;
if ($target.type === "some") {
let items = $target[0];
return some(j$slblock(items))
} ;
throw new Error('match fail 14189:' + JSON.stringify($target))
};
throw new Error('match fail 14526:' + JSON.stringify($target))
})(items)
let example_expr = run$slnil_$gt(parse_expr({"0":{"0":{"0":"match","1":12702,"type":"cst/identifier"},"1":{"0":{"0":"stmt","1":12703,"type":"cst/identifier"},"1":{"0":{"0":{"0":{"0":"sexpr","1":12705,"type":"cst/identifier"},"1":{"0":{"0":"expr","1":12706,"type":"cst/identifier"},"1":{"0":{"0":"l","1":12707,"type":"cst/identifier"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"type":"cons"},"1":12704,"type":"cst/list"},"1":{"0":{"0":{"0":{"0":"compile","1":12709,"type":"cst/identifier"},"1":{"0":{"0":"expr","1":12710,"type":"cst/identifier"},"1":{"0":{"0":"trace","1":12711,"type":"cst/identifier"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"type":"cons"},"1":12708,"type":"cst/list"},"1":{"0":{"0":{"0":{"0":"sdef","1":12713,"type":"cst/identifier"},"1":{"0":{"0":"name","1":12714,"type":"cst/identifier"},"1":{"0":{"0":"nl","1":12715,"type":"cst/identifier"},"1":{"0":{"0":"body","1":12716,"type":"cst/identifier"},"1":{"0":{"0":"l","1":12717,"type":"cst/identifier"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"type":"cons"},"type":"cons"},"type":"cons"},"1":12712,"type":"cst/list"},"1":{"0":{"0":{"0":{"0":"++","1":12719,"type":"cst/identifier"},"1":{"0":{"0":{"0":{"0":"const ","1":{"type":"nil"},"2":12721,"type":"cst/string"},"1":{"0":{"0":{"0":{"0":"sanitize","1":12724,"type":"cst/identifier"},"1":{"0":{"0":"name","1":12725,"type":"cst/identifier"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"1":12723,"type":"cst/list"},"1":{"0":{"0":" = ","1":{"type":"nil"},"2":12726,"type":"cst/string"},"1":{"0":{"0":{"0":{"0":"compile","1":12729,"type":"cst/identifier"},"1":{"0":{"0":"body","1":12730,"type":"cst/identifier"},"1":{"0":{"0":"trace","1":12731,"type":"cst/identifier"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"type":"cons"},"1":12728,"type":"cst/list"},"1":{"0":{"0":";\\n","1":{"type":"nil"},"2":12732,"type":"cst/string"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"type":"cons"},"type":"cons"},"type":"cons"},"1":12720,"type":"cst/array"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"1":12718,"type":"cst/list"},"1":{"0":{"0":{"0":{"0":"stypealias","1":12735,"type":"cst/identifier"},"1":{"0":{"0":"name","1":12736,"type":"cst/identifier"},"1":{"0":{"0":"_","1":12737,"type":"cst/identifier"},"1":{"0":{"0":"_","1":12738,"type":"cst/identifier"},"1":{"0":{"0":"_","1":12739,"type":"cst/identifier"},"1":{"0":{"0":"_","1":12740,"type":"cst/identifier"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"type":"cons"},"type":"cons"},"type":"cons"},"type":"cons"},"1":12734,"type":"cst/list"},"1":{"0":{"0":"/* type alias ","1":{"0":{"0":{"0":"name","1":12743,"type":"cst/identifier"},"1":" */","2":12744,"type":",,"},"1":{"type":"nil"},"type":"cons"},"2":12741,"type":"cst/string"},"1":{"0":{"0":{"0":{"0":"sdeftype","1":12746,"type":"cst/identifier"},"1":{"0":{"0":"name","1":12747,"type":"cst/identifier"},"1":{"0":{"0":"nl","1":12748,"type":"cst/identifier"},"1":{"0":{"0":"type-arg","1":12749,"type":"cst/identifier"},"1":{"0":{"0":"cases","1":12750,"type":"cst/identifier"},"1":{"0":{"0":"l","1":12751,"type":"cst/identifier"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"type":"cons"},"type":"cons"},"type":"cons"},"type":"cons"},"1":12745,"type":"cst/list"},"1":{"0":{"0":{"0":{"0":"join","1":12753,"type":"cst/identifier"},"1":{"0":{"0":"\\n","1":{"type":"nil"},"2":12754,"type":"cst/string"},"1":{"0":{"0":{"0":{"0":"map","1":12757,"type":"cst/identifier"},"1":{"0":{"0":"cases","1":12758,"type":"cst/identifier"},"1":{"0":{"0":{"0":{"0":"fn","1":12760,"type":"cst/identifier"},"1":{"0":{"0":{"0":{"0":"case","1":12762,"type":"cst/identifier"},"1":{"type":"nil"},"type":"cons"},"1":12761,"type":"cst/array"},"1":{"0":{"0":{"0":{"0":"let","1":12764,"type":"cst/identifier"},"1":{"0":{"0":{"0":{"0":{"0":{"0":",,,","1":12767,"type":"cst/identifier"},"1":{"0":{"0":"name2","1":12768,"type":"cst/identifier"},"1":{"0":{"0":"nl","1":12769,"type":"cst/identifier"},"1":{"0":{"0":"args","1":12770,"type":"cst/identifier"},"1":{"0":{"0":"l","1":12771,"type":"cst/identifier"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"type":"cons"},"type":"cons"},"type":"cons"},"1":12766,"type":"cst/list"},"1":{"0":{"0":"case","1":12772,"type":"cst/identifier"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"1":12765,"type":"cst/array"},"1":{"0":{"0":{"0":{"0":"++","1":12774,"type":"cst/identifier"},"1":{"0":{"0":{"0":{"0":"const ","1":{"type":"nil"},"2":12776,"type":"cst/string"},"1":{"0":{"0":{"0":{"0":"sanitize","1":12779,"type":"cst/identifier"},"1":{"0":{"0":"name2","1":12780,"type":"cst/identifier"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"1":12778,"type":"cst/list"},"1":{"0":{"0":" = ","1":{"type":"nil"},"2":12781,"type":"cst/string"},"1":{"0":{"0":{"0":{"0":"++","1":12784,"type":"cst/identifier"},"1":{"0":{"0":{"0":{"0":"mapi","1":12786,"type":"cst/identifier"},"1":{"0":{"0":"0","1":12787,"type":"cst/identifier"},"1":{"0":{"0":"args","1":12788,"type":"cst/identifier"},"1":{"0":{"0":{"0":{"0":"fn","1":12790,"type":"cst/identifier"},"1":{"0":{"0":{"0":{"0":"i","1":12792,"type":"cst/identifier"},"1":{"0":{"0":"_","1":12793,"type":"cst/identifier"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"1":12791,"type":"cst/array"},"1":{"0":{"0":{"0":{"0":"++","1":12795,"type":"cst/identifier"},"1":{"0":{"0":{"0":{"0":"(v","1":{"type":"nil"},"2":12797,"type":"cst/string"},"1":{"0":{"0":{"0":{"0":"int-to-string","1":12800,"type":"cst/identifier"},"1":{"0":{"0":"i","1":12801,"type":"cst/identifier"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"1":12799,"type":"cst/list"},"1":{"0":{"0":") => ","1":{"type":"nil"},"2":12802,"type":"cst/string"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"type":"cons"},"1":12796,"type":"cst/array"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"1":12794,"type":"cst/list"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"type":"cons"},"1":12789,"type":"cst/list"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"type":"cons"},"type":"cons"},"1":12785,"type":"cst/list"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"1":12783,"type":"cst/list"},"1":{"0":{"0":"({type: \\\"","1":{"type":"nil"},"2":12804,"type":"cst/string"},"1":{"0":{"0":"name2","1":12806,"type":"cst/identifier"},"1":{"0":{"0":"\\\"","1":{"type":"nil"},"2":12807,"type":"cst/string"},"1":{"0":{"0":{"0":{"0":"++","1":12810,"type":"cst/identifier"},"1":{"0":{"0":{"0":{"0":"mapi","1":12812,"type":"cst/identifier"},"1":{"0":{"0":"0","1":12813,"type":"cst/identifier"},"1":{"0":{"0":"args","1":12814,"type":"cst/identifier"},"1":{"0":{"0":{"0":{"0":"fn","1":12816,"type":"cst/identifier"},"1":{"0":{"0":{"0":{"0":"i","1":12818,"type":"cst/identifier"},"1":{"0":{"0":"_","1":12819,"type":"cst/identifier"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"1":12817,"type":"cst/array"},"1":{"0":{"0":{"0":{"0":"++","1":12821,"type":"cst/identifier"},"1":{"0":{"0":{"0":{"0":", ","1":{"type":"nil"},"2":12823,"type":"cst/string"},"1":{"0":{"0":{"0":{"0":"int-to-string","1":12826,"type":"cst/identifier"},"1":{"0":{"0":"i","1":12827,"type":"cst/identifier"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"1":12825,"type":"cst/list"},"1":{"0":{"0":": v","1":{"type":"nil"},"2":12828,"type":"cst/string"},"1":{"0":{"0":{"0":{"0":"int-to-string","1":12831,"type":"cst/identifier"},"1":{"0":{"0":"i","1":12832,"type":"cst/identifier"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"1":12830,"type":"cst/list"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"type":"cons"},"type":"cons"},"1":12822,"type":"cst/array"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"1":12820,"type":"cst/list"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"type":"cons"},"1":12815,"type":"cst/list"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"type":"cons"},"type":"cons"},"1":12811,"type":"cst/list"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"1":12809,"type":"cst/list"},"1":{"0":{"0":"});","1":{"type":"nil"},"2":12833,"type":"cst/string"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"type":"cons"},"type":"cons"},"type":"cons"},"type":"cons"},"type":"cons"},"type":"cons"},"type":"cons"},"1":12775,"type":"cst/array"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"1":12773,"type":"cst/list"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"type":"cons"},"1":12763,"type":"cst/list"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"type":"cons"},"1":12759,"type":"cst/list"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"type":"cons"},"1":12756,"type":"cst/list"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"type":"cons"},"1":12752,"type":"cst/list"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"type":"cons"},"type":"cons"},"type":"cons"},"type":"cons"},"type":"cons"},"type":"cons"},"type":"cons"},"type":"cons"},"1":12701,"type":"cst/list"}))
let compile_stmt$slj = (stmt) => (trace) => (($target) => {
if ($target.type === "sexpr") {
let expr = $target[0];
let l = $target[1];
return cons(j$slsexpr(compile$slj(expr)(trace))(l))(nil)
} ;
if ($target.type === "sdef") {
let name = $target[0];
let nl = $target[1];
let body = $target[2];
let l = $target[3];
return cons(j$sllet(j$slpvar(name)(nl))(compile$slj(body)(trace))(l))(nil)
} ;
if ($target.type === "stypealias") {
let name = $target[0];
return nil
} ;
if ($target.type === "sdeftype") {
let name = $target[0];
let nl = $target[1];
let type_arg = $target[2];
let cases = $target[3];
let l = $target[4];
return map(cases)(($case) => {
let {"3": l, "2": args, "1": nl, "0": name2} = $case;
return j$sllet(j$slpvar(name2)(nl))(foldr(j$slobj(cons(left($co("type")(j$slstr(name2)(nil)(nl))))(mapi(0)(args)((i) => (_14463) => left($co(int_to_string(i))(j$slvar(`v${int_to_string(i)}`)(nl))))))(l))(mapi(0)(args)((i) => (_14556) => j$slpvar(`v${int_to_string(i)}`)(nl)))((body) => (arg) => j$sllambda(cons(arg)(nil))(right(body))(l)))(l)
})
} ;
throw new Error('match fail 14258:' + JSON.stringify($target))
})(stmt)
let ex = run$slnil_$gt(parse_expr({"0":{"0":{"0":"let","1":16241,"type":"cst/identifier"},"1":{"0":{"0":{"0":{"0":"x","1":16243,"type":"cst/identifier"},"1":{"0":{"0":"10","1":16244,"type":"cst/identifier"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"1":16242,"type":"cst/array"},"1":{"0":{"0":"x","1":16246,"type":"cst/identifier"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"type":"cons"},"1":16240,"type":"cst/list"}))
let simplify_js = tx((expr) => some(expr))(apply_until(simplify_one))((pat) => none)((pat) => pat)((stmt) => some(stmt))(apply_until(simplify_stmt))((block) => some(block))(apply_until(simplify_block))
return eval("({0: parse_stmt2,  1: parse_expr2, 2: compile_stmt, 3: compile, 4: names, 5: externals_stmt, 6: externals_expr, 7: stmt_size, 8: expr_size, 9: type_size}) => ({\ntype: 'fns', parse_stmt2, parse_expr2, compile_stmt, compile, names, externals_stmt, externals_expr, stmt_size, expr_size, type_size})")(parse_and_compile((stmt) => state_f(parse_stmt(stmt))(state$slnil))((expr) => state_f(parse_expr(expr))(state$slnil))((stmt) => (ctx) => j$slcompile_stmts(ctx)(map(compile_stmt$slj(stmt)(ctx))(map$slstmt(simplify_js))))((expr) => (ctx) => j$slcompile(ctx)(map$slexpr(simplify_js)(compile$slj(expr)(ctx))))(names)(externals_stmt)((expr) => bag$slto_list(externals(set$slnil)(expr)))(stmt_size)(expr_size)(type_size))