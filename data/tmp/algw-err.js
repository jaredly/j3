let pint = (v0) => (v1) => ({type: "pint", 0: v0, 1: v1})
let pbool = (v0) => (v1) => ({type: "pbool", 0: v0, 1: v1})
let some = (v0) => ({type: "some", 0: v0})
let none = {type: "none"}
let its = int_to_string
let and_loc = (locs) => (l) => (s) => (($target) => {
if ($target === true) {
return `${s}:${(($target) => {
if ($target === true) {
return "🚨"
} ;
return its(l);
throw new Error('match fail 11002:' + JSON.stringify($target))
})($eq(l)(-1))}`
} ;
return s;
throw new Error('match fail 10964:' + JSON.stringify($target))
})(locs)
let value = {type: "value"}
let type = {type: "type"}
let apply_tuple = (f) => ({"1": b, "0": a}) => f(a)(b)
let map$slhas = (map) => (k) => (($target) => {
if ($target.type === "some") {
return true
} ;
return false;
throw new Error('match fail 13436:' + JSON.stringify($target))
})(map$slget(map)(k))
let fst = ({"0": a}) => a
let dot = (a) => (b) => (c) => a(b(c))
let ok = (v0) => ({type: "ok", 0: v0})
let err = (v0) => ({type: "err", 0: v0})
let force = (e_$gts) => (result) => (($target) => {
if ($target.type === "ok") {
let v = $target[0];
return v
} ;
if ($target.type === "err") {
let e = $target[0];
return fatal(`Result Error ${e_$gts(e)}`)
} ;
throw new Error('match fail 16706:' + JSON.stringify($target))
})(result)
let prim_$gts = (prim) => (($target) => {
if ($target.type === "pint") {
let num = $target[0];
return its(num)
} ;
if ($target.type === "pbool") {
let bool = $target[0];
let int = $target[1];
{
let $target = bool;
if ($target === true) {
return "true"
} ;
return "false";
throw new Error('match fail 18670:' + JSON.stringify($target))
}
} ;
throw new Error('match fail 18656:' + JSON.stringify($target))
})(prim)
let debug_invariant = false
let $co$co0 = ({"0": a}) => a
let rev_pair = ({"1": b, "0": a}) => $co(b)(a)
let with_name = (map) => (id) => (($target) => {
if ($target.type === "some") {
let v = $target[0];
return `${v}:${its(id)}`
} ;
return `?:${its(id)}`;
throw new Error('match fail 22801:' + JSON.stringify($target))
})(map$slget(map)(id))
let loop = (value) => (run) => run(value)((next_value) => loop(next_value)(run))
let tvar = (v0) => (v1) => ({type: "tvar", 0: v0, 1: v1})
let tapp = (v0) => (v1) => (v2) => ({type: "tapp", 0: v0, 1: v1, 2: v2})
let tcon = (v0) => (v1) => ({type: "tcon", 0: v0, 1: v1})
let tcolor = (v0) => ({type: "tcolor", 0: v0})
let tbold = (v0) => ({type: "tbold", 0: v0})
let titalic = (v0) => ({type: "titalic", 0: v0})
let tflash = (v0) => ({type: "tflash", 0: v0})
let ttext = (v0) => ({type: "ttext", 0: v0})
let tval = (v0) => ({type: "tval", 0: v0})
let tloc = (v0) => ({type: "tloc", 0: v0})
let tnamed = (v0) => (v1) => ({type: "tnamed", 0: v0, 1: v1})
let tfmted = (v0) => (v1) => ({type: "tfmted", 0: v0, 1: v1})
let tfmt = (v0) => (v1) => ({type: "tfmt", 0: v0, 1: v1})
let cons = (v0) => (v1) => ({type: "cons", 0: v0, 1: v1})
let nil = {type: "nil"}
let cst$sllist = (v0) => (v1) => ({type: "cst/list", 0: v0, 1: v1})
let cst$slarray = (v0) => (v1) => ({type: "cst/array", 0: v0, 1: v1})
let cst$slspread = (v0) => (v1) => ({type: "cst/spread", 0: v0, 1: v1})
let cst$slidentifier = (v0) => (v1) => ({type: "cst/identifier", 0: v0, 1: v1})
let cst$slstring = (v0) => (v1) => (v2) => ({type: "cst/string", 0: v0, 1: v1, 2: v2})
let terr = (v0) => (v1) => ({type: "terr", 0: v0, 1: v1})
let ttypes = (v0) => (v1) => ({type: "ttypes", 0: v0, 1: v1})
let twrap = (v0) => (v1) => ({type: "twrap", 0: v0, 1: v1})
let tmissing = (v0) => ({type: "tmissing", 0: v0})
let scheme = (v0) => (v1) => ({type: "scheme", 0: v0, 1: v1})
let type_free = (type) => (($target) => {
if ($target.type === "tvar") {
let n = $target[0];
return set$sladd(set$slnil)(n)
} ;
if ($target.type === "tcon") {
return set$slnil
} ;
if ($target.type === "tapp") {
let a = $target[0];
let b = $target[1];
return set$slmerge(type_free(a))(type_free(b))
} ;
throw new Error('match fail 761:' + JSON.stringify($target))
})(type)
let type_apply = (subst) => (type) => (($target) => {
if ($target.type === "tvar") {
let n = $target[0];
{
let $target = map$slget(subst)(n);
if ($target.type === "none") {
return type
} ;
if ($target.type === "some") {
let t = $target[0];
return t
} ;
throw new Error('match fail 854:' + JSON.stringify($target))
}
} ;
if ($target.type === "tapp") {
let a = $target[0];
let b = $target[1];
let c = $target[2];
return tapp(type_apply(subst)(a))(type_apply(subst)(b))(c)
} ;
return type;
throw new Error('match fail 847:' + JSON.stringify($target))
})(type)
let scheme_free = ({"1": type, "0": vbls}) => set$sldiff(type_free(type))(vbls)
let map = (values) => (f) => (($target) => {
if ($target.type === "nil") {
return nil
} ;
if ($target.type === "cons") {
let one = $target[0];
let rest = $target[1];
return cons(f(one))(map(rest)(f))
} ;
throw new Error('match fail 1012:' + JSON.stringify($target))
})(values)
let mapi = (i) => (values) => (f) => (($target) => {
if ($target.type === "nil") {
return nil
} ;
if ($target.type === "cons") {
let one = $target[0];
let rest = $target[1];
return cons(f(i)(one))(mapi(1 + i)(rest)(f))
} ;
throw new Error('match fail 1042:' + JSON.stringify($target))
})(values)
let foldl = (init) => (items) => (f) => (($target) => {
if ($target.type === "nil") {
return init
} ;
if ($target.type === "cons") {
let one = $target[0];
let rest = $target[1];
return foldl(f(init)(one))(rest)(f)
} ;
throw new Error('match fail 1077:' + JSON.stringify($target))
})(items)
let foldr = (init) => (items) => (f) => (($target) => {
if ($target.type === "nil") {
return init
} ;
if ($target.type === "cons") {
let one = $target[0];
let rest = $target[1];
return f(foldr(init)(rest)(f))(one)
} ;
throw new Error('match fail 1114:' + JSON.stringify($target))
})(items)
let t_prim = (prim) => (($target) => {
if ($target.type === "pint") {
let l = $target[1];
return tcon("int")(l)
} ;
if ($target.type === "pbool") {
let l = $target[1];
return tcon("bool")(l)
} ;
throw new Error('match fail 1633:' + JSON.stringify($target))
})(prim)
let tfn = (a) => (b) => (l) => tapp(tapp(tcon("->")(l))(a)(l))(b)(l)
let tint = tcon("int")(-1)
let map_without = (map) => (set) => foldr(map)(set$slto_list(set))(map$slrm)
let demo_new_subst = map$slfrom_list(cons($co("a")(tcon("a-mapped")(-1)))(cons($co("b")(tvar("c")(-1)))(nil)))
let tconstructor = (v0) => (v1) => (v2) => (v3) => ({type: "tconstructor", 0: v0, 1: v1, 2: v2, 3: v3})
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
let a = $target[0][0];
let one = $target[0][1];
if ($target[1].type === "cons") {
let b = $target[1][0];
let two = $target[1][1];
return cons($co(a)(b))(zip(one)(two))
} 
} 
} ;
return nil;
throw new Error('match fail 3523:' + JSON.stringify($target))
})($co(one)(two))
let type_with_free = (type) => (free) => (($target) => {
if ($target.type === "tvar") {
return type
} ;
if ($target.type === "tcon") {
let s = $target[0];
let l = $target[1];
{
let $target = set$slhas(free)(s);
if ($target === true) {
return tvar(s)(l)
} ;
return type;
throw new Error('match fail 5191:' + JSON.stringify($target))
}
} ;
if ($target.type === "tapp") {
let a = $target[0];
let b = $target[1];
let l = $target[2];
return tapp(type_with_free(a)(free))(type_with_free(b)(free))(l)
} ;
throw new Error('match fail 5179:' + JSON.stringify($target))
})(type)
let tbool = tcon("bool")(-1)
let at = (arr) => (i) => (default_) => (($target) => {
if ($target.type === "nil") {
return default_
} ;
if ($target.type === "cons") {
let one = $target[0];
let rest = $target[1];
{
let $target = $eq(i)(0);
if ($target === true) {
return one
} ;
return at(rest)(i - 1)(default_);
throw new Error('match fail 5776:' + JSON.stringify($target))
}
} ;
throw new Error('match fail 5753:' + JSON.stringify($target))
})(arr)
let letters = cons("a")(cons("b")(cons("c")(cons("d")(cons("e")(cons("f")(cons("g")(cons("h")(cons("i")(cons("j")(cons("k")(cons("l")(cons("m")(cons("n")(cons("o")(nil)))))))))))))))
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
throw new Error('match fail 5858:' + JSON.stringify($target))
})(t)
let join = (sep) => (arr) => (($target) => {
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
throw new Error('match fail 5939:' + JSON.stringify($target))
})(arr)
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
throw new Error('match fail 6063:' + JSON.stringify($target))
})(arr)
let unwrap_app = (t) => (($target) => {
if ($target.type === "tapp") {
let a = $target[0];
let b = $target[1];
{
let {"1": args, "0": target} = unwrap_app(a);
return $co(target)(cons(b)(args))
}
} ;
return $co(t)(nil);
throw new Error('match fail 6114:' + JSON.stringify($target))
})(t)
let concat = (one) => (two) => (($target) => {
if ($target.type === "nil") {
return two
} ;
if ($target.type === "cons") {
let one = $target[0];
if ($target[1].type === "nil") {
return cons(one)(two)
} 
} ;
if ($target.type === "cons") {
let one = $target[0];
let rest = $target[1];
return cons(one)(concat(rest)(two))
} ;
throw new Error('match fail 7408:' + JSON.stringify($target))
})(one)
let filter = (f) => (list) => (($target) => {
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
throw new Error('match fail 8049:' + JSON.stringify($target))
}
} ;
throw new Error('match fail 8037:' + JSON.stringify($target))
})(list)
let type_loc = (type) => (($target) => {
if ($target.type === "tvar") {
let l = $target[1];
return l
} ;
if ($target.type === "tapp") {
let l = $target[2];
return l
} ;
if ($target.type === "tcon") {
let l = $target[1];
return l
} ;
throw new Error('match fail 8809:' + JSON.stringify($target))
})(type)
let tstring = tcon("string")(-1)
let tmap = (k) => (v) => tapp(tapp(tcon("map")(-1))(k)(-1))(v)(-1)
let tfns = (args) => (result) => foldr(result)(args)((result) => (arg) => tfn(arg)(result)(-1))
let toption = (arg) => tapp(tcon("option")(-1))(arg)(-1)
let tarray = (arg) => tapp(tcon("array")(-1))(arg)(-1)
let concrete = (t) => scheme(set$slnil)(t)
let generic = (vbls) => (t) => scheme(set$slfrom_list(vbls))(t)
let vbl = (k) => tvar(k)(-1)
let tset = (arg) => tapp(tcon("set")(-1))(arg)(-1)
let t$co = (a) => (b) => tapp(tapp(tcon(",")(-1))(a)(-1))(b)(-1)
let scheme$sltype = ({"1": type}) => type
let len = (arr) => (($target) => {
if ($target.type === "nil") {
return 0
} ;
if ($target.type === "cons") {
let one = $target[0];
let rest = $target[1];
return 1 + len(rest)
} ;
throw new Error('match fail 10358:' + JSON.stringify($target))
})(arr)
let type$slset_loc = (loc) => (type) => (($target) => {
if ($target.type === "tvar") {
let name = $target[0];
return tvar(name)(loc)
} ;
if ($target.type === "tapp") {
let a = $target[0];
let b = $target[1];
return tapp(type$slset_loc(loc)(a))(type$slset_loc(loc)(b))(loc)
} ;
if ($target.type === "tcon") {
let name = $target[0];
return tcon(name)(loc)
} ;
throw new Error('match fail 10668:' + JSON.stringify($target))
})(type)
let has_free = (type) => (name) => (($target) => {
if ($target.type === "tvar") {
let n = $target[0];
return $eq(n)(name)
} ;
if ($target.type === "tcon") {
return false
} ;
if ($target.type === "tapp") {
let a = $target[0];
let b = $target[1];
{
let $target = has_free(a)(name);
if ($target === true) {
return true
} ;
return has_free(b)(name);
throw new Error('match fail 12039:' + JSON.stringify($target))
}
} ;
throw new Error('match fail 12017:' + JSON.stringify($target))
})(type)
let any = (values) => (f) => (($target) => {
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
return any(rest)(f);
throw new Error('match fail 12098:' + JSON.stringify($target))
}
} ;
throw new Error('match fail 12087:' + JSON.stringify($target))
})(values)
let extract_type_call = (type) => (args) => (($target) => {
if ($target.type === "tapp") {
let one = $target[0];
let arg = $target[1];
let l = $target[2];
return extract_type_call(one)(cons($co(arg)(l))(args))
} ;
return $co(type)(args);
throw new Error('match fail 13617:' + JSON.stringify($target))
})(type)
let replace_in_type = (subst) => (type) => (($target) => {
if ($target.type === "tvar") {
return type
} ;
if ($target.type === "tcon") {
let name = $target[0];
let l = $target[1];
{
let $target = map$slget(subst)(name);
if ($target.type === "some") {
let v = $target[0];
return type$slset_loc(l)(v)
} ;
return type;
throw new Error('match fail 13774:' + JSON.stringify($target))
}
} ;
if ($target.type === "tapp") {
let one = $target[0];
let two = $target[1];
let l = $target[2];
return tapp(replace_in_type(subst)(one))(replace_in_type(subst)(two))(l)
} ;
throw new Error('match fail 13762:' + JSON.stringify($target))
})(type)
let StateT = (v0) => ({type: "StateT", 0: v0})
let run_$gt = ({"0": f}) => (state) => {
let {"1": result} = f(state);
return result
}
let $lt_ = (x) => StateT((state) => $co(state)(ok(x)))
let $lt_err = (e) => StateT((state) => $co(state)(err(e)))
let ok_$gt = (result) => (($target) => {
if ($target.type === "ok") {
let v = $target[0];
return $lt_(v)
} ;
if ($target.type === "err") {
let e = $target[0];
return $lt_err(e)
} ;
throw new Error('match fail 16608:' + JSON.stringify($target))
})(result)
let $lt_state = StateT((state) => $co(state)(ok(state)))
let state_$gt = (v) => StateT((old) => $co(v)(ok(old)))
let state_f = ({"0": f}) => f
let state$slnil = $co$co(0)($co(nil)($co(nil)(nil)))(map$slnil)
let run$slnil_$gt = (st) => run_$gt(st)(state$slnil)
let map$sladd = (map) => (arg) => (value) => map$slset(map)(arg)((($target) => {
if ($target.type === "none") {
return cons(value)(nil)
} ;
if ($target.type === "some") {
let values = $target[0];
return cons(value)(values)
} ;
throw new Error('match fail 18762:' + JSON.stringify($target))
})(map$slget(map)(arg)))
let type_error = (message) => (loced_items) => terr(message)(loced_items)


let scheme$slt = ({"1": t}) => t
let type$eq = (one) => (two) => (($target) => {
if ($target.type === ",") {
if ($target[0].type === "tvar") {
let a = $target[0][0];
if ($target[1].type === "tvar") {
let b = $target[1][0];
return $eq(a)(b)
} 
} 
} ;
if ($target.type === ",") {
if ($target[0].type === "tapp") {
let a = $target[0][0];
let b = $target[0][1];
if ($target[1].type === "tapp") {
let c = $target[1][0];
let d = $target[1][1];
{
let $target = type$eq(a)(c);
if ($target === true) {
return type$eq(b)(d)
} ;
return false;
throw new Error('match fail 20848:' + JSON.stringify($target))
}
} 
} 
} ;
if ($target.type === ",") {
if ($target[0].type === "tcon") {
let a = $target[0][0];
if ($target[1].type === "tcon") {
let b = $target[1][0];
return $eq(a)(b)
} 
} 
} ;
return false;
throw new Error('match fail 20815:' + JSON.stringify($target))
})($co(one)(two))
let applied_types = (types) => (subst) => map(types)(({"2": keep, "1": type, "0": loc}) => (($target) => {
if ($target === true) {
return $co(loc)(type)
} ;
return $co(loc)(type_apply(subst)(type));
throw new Error('match fail 20949:' + JSON.stringify($target))
})(keep))
let err$gt$gt$eq = ({"0": f}) => (next) => StateT((state) => (($target) => {
if ($target.type === ",") {
let state = $target[0];
if ($target[1].type === "err") {
let e = $target[1][0];
return $co(state)(next(e))
} 
} ;
if ($target.type === ",") {
let state = $target[0];
let v = $target[1];
return $co(state)(v)
} ;
throw new Error('match fail 23826:' + JSON.stringify($target))
})(f(state)))
let pany = (v0) => ({type: "pany", 0: v0})
let pvar = (v0) => (v1) => ({type: "pvar", 0: v0, 1: v1})
let pcon = (v0) => (v1) => (v2) => (v3) => ({type: "pcon", 0: v0, 1: v1, 2: v2, 3: v3})
let pstr = (v0) => (v1) => ({type: "pstr", 0: v0, 1: v1})
let pprim = (v0) => (v1) => ({type: "pprim", 0: v0, 1: v1})
let sdeftype = (v0) => (v1) => (v2) => (v3) => (v4) => ({type: "sdeftype", 0: v0, 1: v1, 2: v2, 3: v3, 4: v4})
let stypealias = (v0) => (v1) => (v2) => (v3) => (v4) => ({type: "stypealias", 0: v0, 1: v1, 2: v2, 3: v3, 4: v4})
let sdef = (v0) => (v1) => (v2) => (v3) => ({type: "sdef", 0: v0, 1: v1, 2: v2, 3: v3})
let sexpr = (v0) => (v1) => ({type: "sexpr", 0: v0, 1: v1})

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
let tts_inner = (t) => (free) => (locs) => (($target) => {
if ($target.type === "tvar") {
let s = $target[0];
let l = $target[1];
{
let {"1": idx, "0": fmap} = free;
{
let $target = fmap;
if ($target.type === "some") {
let fmap = $target[0];
{
let $target = map$slget(fmap)(s);
if ($target.type === "some") {
let s = $target[0];
return $co(and_loc(locs)(l)(s))(free)
} ;
{
let none = $target;
{
let name = at(letters)(idx)("_too_many_vbls_");
return $co(and_loc(locs)(l)(name))($co(some(map$slset(fmap)(s)(name)))(1 + idx))
}
};
throw new Error('match fail 2113:' + JSON.stringify($target))
}
} ;
return $co(and_loc(locs)(l)(s))(free);
throw new Error('match fail 6340:' + JSON.stringify($target))
}
}
} ;
if ($target.type === "tcon") {
let s = $target[0];
let l = $target[1];
return $co(and_loc(locs)(l)(s))(free)
} ;
if ($target.type === "tapp") {
if ($target[0].type === "tapp") {
if ($target[0][0].type === "tcon") {
if ($target[0][0][0] === "->") {
let a = $target[0][1];
let la = $target[0][2];
let b = $target[1];
let l = $target[2];
{
let {"1": r, "0": iargs} = unwrap_fn(b);
{
let args = cons(a)(iargs);
{
let free$0 = free;
{
let args$1 = args;
{
let {"1": free, "0": args} = tts_list(args$1)(free$0)(locs);
{
let free$0 = free;
{
let {"1": free, "0": two} = tts_inner(r)(free$0)(locs);
return $co(and_loc(locs)(l)(`(fn [${join(" ")(rev(args)(nil))}] ${two})`))(free)
}
}
}
}
}
}
}
} 
} 
} 
} ;
if ($target.type === "tapp") {
let a = $target[0];
let b = $target[1];
let l = $target[2];
{
let {"1": args, "0": target} = unwrap_app(a);
{
let args$0 = args;
{
let args = cons(b)(args$0);
{
let args$0 = args;
{
let args = rev(args$0)(nil);
{
let free$0 = free;
{
let args$1 = args;
{
let {"1": free, "0": args} = tts_list(args$1)(free$0)(locs);
{
let free$0 = free;
{
let {"1": free, "0": one} = tts_inner(target)(free$0)(locs);
return $co(and_loc(locs)(l)(`(${one} ${join(" ")(rev(args)(nil))})`))(free)
}
}
}
}
}
}
}
}
}
}
} ;
throw new Error('match fail 2105:' + JSON.stringify($target))
})(t)

let tts_list = (args) => (free) => (locs) => foldl($co(nil)(free))(args)(({"1": free, "0": args}) => (a) => {
let free$0 = free;
{
let {"1": free, "0": arg} = tts_inner(a)(free$0)(locs);
return $co(cons(arg)(args))(free)
}
})
let one = (v0) => ({type: "one", 0: v0})
let many = (v0) => ({type: "many", 0: v0})
let empty = {type: "empty"}
let ttc_inner = (t) => (free) => (($target) => {
if ($target.type === "tvar") {
let vname = $target[0];
let loc = $target[1];
{
let {"1": idx, "0": fmap} = free;
{
let $target = fmap;
if ($target.type === "some") {
let fmap = $target[0];
{
let $target = map$slget(fmap)(vname);
if ($target.type === "some") {
let name = $target[0];
return $co(cst$slidentifier(name)(loc))(free)
} ;
{
let none = $target;
{
let name = at(letters)(idx)("_too_many_vbls_");
return $co(cst$slidentifier(name)(loc))($co(some(map$slset(fmap)(vname)(name)))(1 + idx))
}
};
throw new Error('match fail 21856:' + JSON.stringify($target))
}
} ;
return $co(cst$slidentifier(vname)(loc))(free);
throw new Error('match fail 21850:' + JSON.stringify($target))
}
}
} ;
if ($target.type === "tcon") {
let name = $target[0];
let l = $target[1];
return $co(cst$slidentifier(name)(l))(free)
} ;
if ($target.type === "tapp") {
if ($target[0].type === "tapp") {
if ($target[0][0].type === "tcon") {
if ($target[0][0][0] === "->") {
let a = $target[0][1];
let la = $target[0][2];
let b = $target[1];
let l = $target[2];
{
let {"1": r, "0": iargs} = unwrap_fn(b);
{
let args = cons(a)(iargs);
{
let free$0 = free;
{
let args$1 = args;
{
let {"1": free, "0": args} = ttc_list(args$1)(free$0);
{
let free$0 = free;
{
let {"1": free, "0": two} = ttc_inner(r)(free$0);
return $co(cst$sllist(cons(cst$slidentifier("fn")(la))(cons(cst$slarray(rev(args)(nil))(la))(cons(two)(nil))))(l))(free)
}
}
}
}
}
}
}
} 
} 
} 
} ;
if ($target.type === "tapp") {
let a = $target[0];
let b = $target[1];
let l = $target[2];
{
let {"1": args, "0": target} = unwrap_app(a);
{
let args$0 = args;
{
let args = cons(b)(args$0);
{
let args$0 = args;
{
let args = rev(args$0)(nil);
{
let free$0 = free;
{
let args$1 = args;
{
let {"1": free, "0": args} = ttc_list(args$1)(free$0);
{
let free$0 = free;
{
let {"1": free, "0": one} = ttc_inner(target)(free$0);
return $co(cst$sllist(cons(one)(rev(args)(nil)))(l))(free)
}
}
}
}
}
}
}
}
}
}
} ;
throw new Error('match fail 21835:' + JSON.stringify($target))
})(t)

let ttc_list = (args) => (free) => foldl($co(nil)(free))(args)(({"1": free, "0": args}) => (a) => {
let free$0 = free;
{
let {"1": free, "0": arg} = ttc_inner(a)(free$0);
return $co(cons(arg)(args))(free)
}
})
let scheme_apply = (subst) => ({"1": type, "0": vbls}) => scheme(vbls)(type_apply(map_without(subst)(vbls))(type))
let tenv = (v0) => (v1) => (v2) => (v3) => ({type: "tenv", 0: v0, 1: v1, 2: v2, 3: v3})
let tenv$sltype = ({"0": types}) => (key) => map$slget(types)(key)
let tenv$slcon = ({"1": cons}) => (key) => map$slget(cons)(key)
let tenv$slnames = ({"2": names}) => (key) => map$slget(names)(key)
let tenv$slset_type = ({"3": alias, "2": names, "1": cons, "0": types}) => (k) => (v) => tenv(map$slset(types)(k)(v))(cons)(names)(alias)
let tenv$slnil = tenv(map$slnil)(map$slnil)(map$slnil)(map$slnil)
let type_to_string = (t) => {
let {"0": text} = tts_inner(t)($co(some(map$slnil))(0))(false);
return text
}
let type_to_string_raw = (t) => {
let {"0": text} = tts_inner(t)($co(none)(0))(false);
return text
}
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
throw new Error('match fail 7073:' + JSON.stringify($target))
})($co(first)(second))
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
let il = $target[1];
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
throw new Error('match fail 7183:' + JSON.stringify($target))
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
throw new Error('match fail 14103:' + JSON.stringify($target))
}
} ;
if ($target.type === "tapp") {
let one = $target[0];
let two = $target[1];
return bag$sland(externals_type(bound)(one))(externals_type(bound)(two))
} ;
throw new Error('match fail 7342:' + JSON.stringify($target))
})(t)
let bag$slto_list = (bag) => (($target) => {
if ($target.type === "empty") {
return nil
} ;
if ($target.type === "one") {
let a = $target[0];
return cons(a)(nil)
} ;
if ($target.type === "many") {
let bags = $target[0];
return foldr(nil)(bags)((res) => (bag) => (($target) => {
if ($target.type === "empty") {
return res
} ;
if ($target.type === "one") {
let a = $target[0];
return cons(a)(res)
} ;
return concat(bag$slto_list(bag))(res);
throw new Error('match fail 7450:' + JSON.stringify($target))
})(bag))
} ;
throw new Error('match fail 7383:' + JSON.stringify($target))
})(bag)
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
return cons($co$co(name)(type)(l))(map(constructors)(({"1": l, "0": name}) => $co$co(name)(value)(l)))
} ;
throw new Error('match fail 7517:' + JSON.stringify($target))
})(stmt)
let show_types = (names) => ({"0": types}) => {
let names$0 = names;
{
let names = set$slfrom_list(names$0);
return map(filter(({"1": v, "0": k}) => set$slhas(names)(k))(map$slto_list(types)))(({"1": {"1": l, "0": {"1": type, "0": free}}, "0": name}) => (($target) => {
if ($target.type === "nil") {
return `${name} = ${type_to_string(type)}`
} ;
{
let free = $target;
return `${name} = ${join(",")(free)} : ${type_to_string_raw(type)}`
};
throw new Error('match fail 7938:' + JSON.stringify($target))
})(set$slto_list(free)))
}
}
let show_types_list = (types) => join("\n")(map(types)(type_to_string_raw))
let show_subst = (subst) => join("\n")(map(map$slto_list(subst))(({"1": type, "0": name}) => `${name} -> ${type_to_string_raw(type)}`))
let show_substs = (substs) => join("\n::\n")(map(substs)(show_subst))
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
throw new Error('match fail 10820:' + JSON.stringify($target))
})(expr)
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
throw new Error('match fail 10903:' + JSON.stringify($target))
})(pat)
let pat_to_string = (pat) => (($target) => {
if ($target.type === "pany") {
return "_"
} ;
if ($target.type === "pvar") {
let n = $target[0];
return n
} ;
if ($target.type === "pcon") {
let c = $target[0];
let il = $target[1];
let pats = $target[2];
return `(${c} ${join(" ")(map(pats)(pat_to_string))})`
} ;
if ($target.type === "pstr") {
let s = $target[0];
return `\"${s}\"`
} ;
if ($target.type === "pprim") {
return "prim"
} ;
throw new Error('match fail 11204:' + JSON.stringify($target))
})(pat)
let tenv$slmerge = ({"3": alias, "2": types, "1": constructors, "0": values}) => ({"3": nalias, "2": ntypes, "1": ncons, "0": nvalues}) => tenv(map$slmerge(values)(nvalues))(map$slmerge(constructors)(ncons))(map$slmerge(types)(ntypes))(map$slmerge(alias)(nalias))
let inference = (v0) => (v1) => (v2) => (v3) => (v4) => (v5) => ({type: "inference", 0: v0, 1: v1, 2: v2, 3: v3, 4: v4, 5: v5})
let analysis = (v0) => (v1) => (v2) => ({type: "analysis", 0: v0, 1: v1, 2: v2})
let check_invariant = (place) => (new_subst) => (old_subst) => foldl(none)(map$slkeys(old_subst))((current) => (key) => (($target) => {
if ($target.type === "some") {
let v = $target[0];
return current
} ;
if ($target.type === "none") {
return foldl(none)(map$slto_list(new_subst))((current) => ({"1": type, "0": nkey}) => (($target) => {
if ($target.type === "some") {
let v = $target[0];
return current
} ;
if ($target.type === "none") {
{
let $target = has_free(type)(key);
if ($target === true) {
return some(`compose-subst[${place}]: old-subst has key ${key}, which is used in new-subst for ${nkey} => ${type_to_string_raw(type)}`)
} ;
return current;
throw new Error('match fail 12461:' + JSON.stringify($target))
}
} ;
throw new Error('match fail 12502:' + JSON.stringify($target))
})(current))
} ;
throw new Error('match fail 12487:' + JSON.stringify($target))
})(current))
let tenv$slset_constructors = ({"3": alias, "2": names, "1": cons, "0": types}) => (name) => (vbls) => (ncons) => (loc) => tenv(types)(map$slmerge(cons)(ncons))(map$slset(names)(name)($co$co(vbls)(set$slfrom_list(map$slkeys(ncons)))(loc)))(alias)
let check_type_names = (tenv$qu) => (type) => (($target) => {
if ($target.type === "tvar") {
return true
} ;
if ($target.type === "tcon") {
let name = $target[0];
{
let {"3": alias, "2": types} = tenv$qu;
{
let $target = map$slhas(types)(name);
if ($target === true) {
return true
} ;
{
let $target = map$slhas(alias)(name);
if ($target === true) {
return true
} ;
return fatal(`Unknown type ${name}`);
throw new Error('match fail 13396:' + JSON.stringify($target))
};
throw new Error('match fail 13389:' + JSON.stringify($target))
}
}
} ;
if ($target.type === "tapp") {
let one = $target[0];
let two = $target[1];
{
let $target = check_type_names(tenv$qu)(one);
if ($target === true) {
return check_type_names(tenv$qu)(two)
} ;
return false;
throw new Error('match fail 13414:' + JSON.stringify($target))
}
} ;
throw new Error('match fail 13365:' + JSON.stringify($target))
})(type)
let tenv$slalias = ({"3": alias}) => alias
let split_stmts = (stmts) => (sdefs) => (stypes) => (salias) => (sexps) => (($target) => {
if ($target.type === "nil") {
return $co$co$co(sdefs)(stypes)(salias)(sexps)
} ;
if ($target.type === "cons") {
let one = $target[0];
let rest = $target[1];
{
let $target = one;
if ($target.type === "sdef") {
return split_stmts(rest)(cons(one)(sdefs))(stypes)(salias)(sexps)
} ;
if ($target.type === "sdeftype") {
return split_stmts(rest)(sdefs)(cons(one)(stypes))(salias)(sexps)
} ;
if ($target.type === "stypealias") {
let name = $target[0];
let nl = $target[1];
let args = $target[2];
let body = $target[3];
return split_stmts(rest)(sdefs)(stypes)(cons($co$co$co(name)(args)(body)(nl))(salias))(sexps)
} ;
if ($target.type === "sexpr") {
let expr = $target[0];
return split_stmts(rest)(sdefs)(stypes)(salias)(cons(expr)(sexps))
} ;
throw new Error('match fail 14218:' + JSON.stringify($target))
}
} ;
throw new Error('match fail 14203:' + JSON.stringify($target))
})(stmts)
let tenv$sladd_alias = ({"3": aliases, "2": c, "1": b, "0": a}) => (name) => ({"2": l, "1": body, "0": args}) => tenv(a)(b)(c)(map$slset(aliases)(name)($co$co(args)(body)(l)))
let tenv$sladd_builtin_type = ({"3": d, "2": names, "1": b, "0": a}) => ({"1": args, "0": name}) => tenv(a)(b)(map$slset(names)(name)($co$co(args)(set$slnil)(-1)))(d)
let pat_externals = (pat) => (($target) => {
if ($target.type === "pcon") {
let name = $target[0];
let il = $target[1];
let args = $target[2];
let l = $target[3];
return bag$sland(one($co$co(name)(value)(il)))(many(map(args)(pat_externals)))
} ;
return empty;
throw new Error('match fail 15127:' + JSON.stringify($target))
})(pat)
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
throw new Error('match fail 15224:' + JSON.stringify($target))
})(bag)
let report_missing = (subst) => ({"1": missing_vars, "0": missing}) => (($target) => {
if ($target.type === "nil") {
return $lt_(0)
} ;
{
let vars = $target;
{
let {"0": text} = foldl($co(nil)($co(some(map$slnil))(0)))(map(missing_vars)(type_apply(subst)))(({"1": maps, "0": result}) => (t) => {
let maps$0 = maps;
{
let {"1": maps, "0": text} = tts_inner(t)(maps$0)(false);
return $co(cons(text)(result))(maps)
}
});
return $lt_err(tmissing(map(zip(missing)(map(missing_vars)(type_apply(subst))))(({"1": type, "0": {"1": loc, "0": name}}) => $co$co(name)(loc)(type))))
}
};
throw new Error('match fail 15854:' + JSON.stringify($target))
})(missing_vars)
let find_missing_names = (values) => (ex) => {
let externals = bag$slfold((ext) => ({"2": l, "0": name}) => map$slset(ext)(name)(l))(map$slnil)(ex);
return filter(({"1": loc, "0": name}) => (($target) => {
if ($target.type === "some") {
return false
} ;
return true;
throw new Error('match fail 15301:' + JSON.stringify($target))
})(map$slget(values)(name)))(map$slto_list(externals))
}
let tenv$slvalues = ({"0": values}) => values

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
let value = $target[1][0];
return state_f(next(value))(state)
} 
} ;
throw new Error('match fail 16464:' + JSON.stringify($target))
})(f(state)))
let map_$gt = (f) => (arr) => (($target) => {
if ($target.type === "nil") {
return $lt_(nil)
} ;
if ($target.type === "cons") {
let one = $target[0];
let rest = $target[1];
return $gt$gt$eq(f(one))((one) => $gt$gt$eq(map_$gt(f)(rest))((rest) => $lt_(cons(one)(rest))))
} ;
throw new Error('match fail 16565:' + JSON.stringify($target))
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
throw new Error('match fail 16631:' + JSON.stringify($target))
})(arr)
let $lt_idx = $gt$gt$eq($lt_state)(({"0": idx}) => $lt_(idx))
let idx_$gt = (idx) => $gt$gt$eq($lt_state)(({"2": c, "1": b}) => $gt$gt$eq(state_$gt($co$co(idx)(b)(c)))((_17445) => $lt_($unit)))
let foldl_$gt = (init) => (values) => (f) => (($target) => {
if ($target.type === "nil") {
return $lt_(init)
} ;
if ($target.type === "cons") {
let one = $target[0];
let rest = $target[1];
return $gt$gt$eq(f(init)(one))((one) => foldl_$gt(one)(rest)(f))
} ;
throw new Error('match fail 16761:' + JSON.stringify($target))
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
throw new Error('match fail 16798:' + JSON.stringify($target))
})(values)
let record_$gt = (loc) => (type) => (keep) => $gt$gt$eq($lt_state)(({"2": subst, "1": {"1": usages, "0": types}, "0": idx}) => $gt$gt$eq(state_$gt($co$co(idx)($co(cons($co$co(loc)(type)(keep))(types))(usages))(subst)))((_17491) => $lt_($unit)))
let $lt_types = $gt$gt$eq($lt_state)(({"1": types}) => $lt_(types))
let $lt_subst = $gt$gt$eq($lt_state)(({"2": subst}) => $lt_(subst))
let apply_$gt = (f) => (tenv) => $gt$gt$eq($lt_subst)((subst) => $lt_(f(subst)(tenv)))
let type$slapply_$gt = apply_$gt(type_apply)
let pats_by_loc = (pat) => (($target) => {
if ($target.type === "pany") {
let int = $target[0];
return empty
} ;
if ($target.type === "pvar") {
let string = $target[0];
let int = $target[1];
return one($co(int)(evar(string)(int)))
} ;
if ($target.type === "pcon") {
let string = $target[0];
let pats = $target[2];
let int = $target[3];
return foldl(empty)(map(pats)(pats_by_loc))(bag$sland)
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
throw new Error('match fail 18407:' + JSON.stringify($target))
})(pat)
let pat_$gts = (pat) => (($target) => {
if ($target.type === "pany") {
let int = $target[0];
return "_"
} ;
if ($target.type === "pvar") {
let string = $target[0];
let int = $target[1];
return string
} ;
if ($target.type === "pcon") {
let string = $target[0];
let args = $target[2];
let int = $target[3];
return `(${string}${join("")(map(args)((pat) => ` ${pat_$gts(pat)}`))})`
} ;
if ($target.type === "pstr") {
let string = $target[0];
let int = $target[1];
return string
} ;
if ($target.type === "pprim") {
let prim = $target[0];
let int = $target[1];
return prim_$gts(prim)
} ;
throw new Error('match fail 18683:' + JSON.stringify($target))
})(pat)
let type_error_$gts = (err) => (($target) => {
if ($target.type === "twrap") {
let inner = $target[1];
return type_error_$gts(inner)
} ;
if ($target.type === "tmissing") {
let missing = $target[0];
return `Missing values: ${join("")(map(missing)(({"2": type, "1": loc, "0": name}) => `\n - ${name} (${its(loc)}): ${type_to_string(type)}`))}`
} ;
if ($target.type === "ttypes") {
let t1 = $target[0];
let t2 = $target[1];
return `Incompatible types: ${type_to_string(t1)} and ${type_to_string(t2)}`
} ;
if ($target.type === "terr") {
let message = $target[0];
let names = $target[1];
return `${message}${join("")(map(names)(({"1": loc, "0": name}) => `\n - ${name} (${its(loc)})`))}`
} ;
throw new Error('match fail 23895:' + JSON.stringify($target))
})(err)
let expr_to_string = (expr) => (($target) => {
if ($target.type === "evar") {
let n = $target[0];
return n
} ;
if ($target.type === "elambda") {
let pats = $target[0];
let b = $target[1];
return `(fn [${join(" ")(map(pats)(pat_to_string))}] ${expr_to_string(b)})`
} ;
if ($target.type === "eapp") {
let a = $target[0];
let args = $target[1];
return `(${expr_to_string(a)} ${join(" ")(map(args)(expr_to_string))})`
} ;
if ($target.type === "eprim") {
if ($target[0].type === "pint") {
let n = $target[0][0];
return int_to_string(n)
} 
} ;
if ($target.type === "ematch") {
let t = $target[0];
let cases = $target[1];
return `(match ${expr_to_string(t)} ${join("\n")(map(cases)(({"1": b, "0": a}) => `${pat_to_string(a)} ${expr_to_string(b)}`))}`
} ;
return "??";
throw new Error('match fail 19207:' + JSON.stringify($target))
})(expr)
let record_usage_$gt = (loc) => (provider) => $gt$gt$eq($lt_state)(({"2": subst, "1": {"1": {"1": usages, "0": defs}, "0": types}, "0": idx}) => $gt$gt$eq(state_$gt($co$co(idx)($co(types)($co(defs)(cons($co(loc)(provider))(usages))))(subst)))((_20663) => $lt_($unit)))
let record_def_$gt = (loc) => $gt$gt$eq($lt_state)(({"2": subst, "1": {"1": {"1": usages, "0": defs}, "0": types}, "0": idx}) => $gt$gt$eq(state_$gt($co$co(idx)($co(types)($co(cons(loc)(defs))(usages)))(subst)))((_20720) => $lt_($unit)))
let subst_reset_$gt = (new_subst) => $gt$gt$eq($lt_state)(({"2": subst, "1": types, "0": idx}) => $gt$gt$eq(state_$gt($co$co(idx)(types)(new_subst)))((_21254) => $lt_(subst)))
let do_$gt = (f) => (arr) => (($target) => {
if ($target.type === "nil") {
return $lt_($unit)
} ;
if ($target.type === "cons") {
let one = $target[0];
let rest = $target[1];
return $gt$gt$eq(f(one))((_21308) => $gt$gt$eq(do_$gt(f)(rest))((_21308) => $lt_($unit)))
} ;
throw new Error('match fail 21294:' + JSON.stringify($target))
})(arr)
let externals_type_record = (bound) => (t) => (($target) => {
if ($target.type === "tvar") {
return $lt_(empty)
} ;
if ($target.type === "tcon") {
let name = $target[0];
let l = $target[1];
{
let $target = map$slget(bound)(name);
if ($target.type === "some") {
let pl = $target[0];
return $gt$gt$eq(record_usage_$gt(l)(pl))((_21496) => $lt_(empty))
} ;
return $lt_(one($co$co(name)(type)(l)));
throw new Error('match fail 21487:' + JSON.stringify($target))
}
} ;
if ($target.type === "tapp") {
let one = $target[0];
let two = $target[1];
return $gt$gt$eq(externals_type_record(bound)(one))((one) => $gt$gt$eq(externals_type_record(bound)(two))((two) => $lt_(bag$sland(one)(two))))
} ;
throw new Error('match fail 21473:' + JSON.stringify($target))
})(t)
let record_local_tcon_usages = (locals) => (tenv) => (t) => (($target) => {
if ($target.type === "tvar") {
return $lt_($unit)
} ;
if ($target.type === "tcon") {
let name = $target[0];
let l = $target[1];
{
let $target = map$slget(locals)(name);
if ($target.type === "some") {
let pl = $target[0];
return record_usage_$gt(l)(pl)
} ;
return $lt_($unit);
throw new Error('match fail 21577:' + JSON.stringify($target))
}
} ;
if ($target.type === "tapp") {
let one = $target[0];
let two = $target[1];
return $gt$gt$eq(record_local_tcon_usages(locals)(tenv)(one))((_21606) => $gt$gt$eq(record_local_tcon_usages(locals)(tenv)(two))((_21606) => $lt_($unit)))
} ;
throw new Error('match fail 21564:' + JSON.stringify($target))
})(t)
let record_usages_in_type = (tenv) => (rec) => (type) => {
let {"3": alias, "2": tdefs, "0": types} = tenv;
{
let $target = type;
if ($target.type === "tcon") {
let name = $target[0];
let l = $target[1];
{
let $target = map$slget(alias)(name);
if ($target.type === "some") {
if ($target[0].type === ",,") {
let al = $target[0][2];
return record_usage_$gt(l)(al)
} 
} ;
{
let $target = map$slget(tdefs)(name);
if ($target.type === "some") {
if ($target[0].type === ",,") {
let loc = $target[0][2];
return record_usage_$gt(l)(loc)
} 
} ;
{
let $target = map$slget(rec)(name);
if ($target.type === "some") {
let loc = $target[0];
return record_usage_$gt(l)(loc)
} ;
return $lt_err(type_error("Unbound type")(cons($co(name)(l))(nil)));
throw new Error('match fail 23574:' + JSON.stringify($target))
};
{
let nope = name;
return $lt_($unit)
};
throw new Error('match fail 21665:' + JSON.stringify($target))
};
throw new Error('match fail 21643:' + JSON.stringify($target))
}
} ;
if ($target.type === "tapp") {
let one = $target[0];
let two = $target[1];
let l = $target[2];
return $gt$gt$eq(record_usages_in_type(tenv)(rec)(one))((_21720) => $gt$gt$eq(record_usages_in_type(tenv)(rec)(two))((_21720) => $lt_($unit)))
} ;
return $lt_($unit);
throw new Error('match fail 21636:' + JSON.stringify($target))
}
}
let type_to_cst = (t) => {
let {"0": cst} = ttc_inner(t)($co(some(map$slnil))(0));
return cst
}
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
throw new Error('match fail 22510:' + JSON.stringify($target))
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
throw new Error('match fail 22620:' + JSON.stringify($target))
})(type)
let type_with_free_rec = (free) => (type) => (($target) => {
if ($target.type === "tvar") {
return $lt_(type)
} ;
if ($target.type === "tcon") {
let s = $target[0];
let l = $target[1];
{
let $target = map$slget(free)(s);
if ($target.type === "some") {
let fl = $target[0];
return $gt$gt$eq(record_usage_$gt(l)(fl))((_23503) => $lt_(tvar(s)(l)))
} ;
return $lt_(type);
throw new Error('match fail 23471:' + JSON.stringify($target))
}
} ;
if ($target.type === "tapp") {
let a = $target[0];
let b = $target[1];
let l = $target[2];
return $gt$gt$eq(type_with_free_rec(free)(a))((a) => $gt$gt$eq(type_with_free_rec(free)(b))((b) => $lt_(tapp(a)(b)(l))))
} ;
throw new Error('match fail 23459:' + JSON.stringify($target))
})(type)
let tdefs_$gts = (tdefs) => (constructors) => map(map$slto_list(tdefs))(({"1": {"2": loc, "1": cnames, "0": num_args}, "0": name}) => `\n - ${name}${join("")(map(set$slto_list(cnames))((cname) => `\n   - ${cname} ${(($target) => {
if ($target.type === "none") {
return `Cant find defn for ${cname}`
} ;
if ($target.type === "some") {
if ($target[0].type === "tconstructor") {
let free = $target[0][0];
let args = $target[0][1];
let res = $target[0][2];
let loc = $target[0][3];
return type_to_string(tfns(args)(res))
} 
} ;
throw new Error('match fail 24179:' + JSON.stringify($target))
})(map$slget(constructors)(cname))}`))}`)
let values_$gts = (values) => map(map$slto_list(values))(({"1": {"1": loc, "0": {"1": type, "0": free}}, "0": name}) => `\n - ${name} ${type_to_string(type)}`)
let tenv$slrm = ({"3": alias, "2": names, "1": cons, "0": types}) => ($var) => tenv(map$slrm(types)($var))(cons)(names)(alias)
let compose_subst = (place) => (new_subst) => (old_subst) => (($target) => {
if ($target.type === "some") {
let message = $target[0];
return fatal(message)
} ;
return map$slmerge(map$slmap(type_apply(new_subst))(old_subst))(new_subst);
throw new Error('match fail 12160:' + JSON.stringify($target))
})((($target) => {
if ($target === true) {
return check_invariant(place)(new_subst)(old_subst)
} ;
return none;
throw new Error('match fail 21238:' + JSON.stringify($target))
})(debug_invariant))
let tenv_free = ({"0": types}) => foldr(set$slnil)(map(map$slvalues(types))(({"0": s}) => scheme_free(s)))(set$slmerge)
let tenv_apply = (subst) => ({"3": alias, "2": names, "1": cons, "0": types}) => tenv(map$slmap(({"1": l, "0": s}) => $co(scheme_apply(subst)(s))(l))(types))(cons)(names)(alias)
let generalize = (tenv) => (t) => scheme(set$sldiff(type_free(t))(tenv_free(tenv)))(t)
let new_type_var = (prefix) => (l) => $gt$gt$eq($lt_idx)((nidx) => $gt$gt$eq(idx_$gt(nidx + 1))((_16872) => $lt_(tvar(`${prefix}:${its(nidx)}`)(l))))
let basic = tenv(map$slfrom_list(cons($co("+")($co(scheme(set$slnil)(tfn(tint)(tfn(tint)(tint)(-1))(-1)))(-1)))(cons($co("-")($co(scheme(set$slnil)(tfn(tint)(tfn(tint)(tint)(-1))(-1)))(-1)))(cons($co("()")($co(scheme(set$slnil)(tcon("()")(-1)))(-1)))(cons($co(",")($co(scheme(set$slfrom_list(cons("a")(cons("b")(nil))))(tfn(tvar("a")(-1))(tfn(tvar("b")(-1))(tapp(tapp(tcon(",")(-1))(tvar("a")(-1))(-1))(tvar("b")(-1))(-1))(-1))(-1)))(-1)))(nil))))))(map$slfrom_list(cons($co(",")(tconstructor(set$slfrom_list(cons("a")(cons("b")(nil))))(cons(tvar("a")(-1))(cons(tvar("b")(-1))(nil)))(tapp(tapp(tcon(",")(-1))(tvar("a")(-1))(-1))(tvar("b")(-1))(-1))(-1)))(nil)))(map$slfrom_list(cons($co("int")($co$co(0)(set$slnil)(-1)))(cons($co("string")($co$co(0)(set$slnil)(-1)))(cons($co("bool")($co$co(0)(set$slnil)(-1)))(nil)))))(map$slnil)
let typecheck = (v0) => (v1) => (v2) => (v3) => ({type: "typecheck", 0: v0, 1: v1, 2: v2, 3: v3})
let subst_to_string = (subst) => join("\n")(map(map$slto_list(subst))(({"1": v, "0": k}) => `${k} : ${type_to_string_raw(v)}`))
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
throw new Error('match fail 19516:' + JSON.stringify($target))
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
let int = $target[2];
return many(map(templates)((arg) => (($target) => {
if ($target.type === ",,") {
let expr = $target[0];
return externals(bound)(expr)
} ;
throw new Error('match fail 19552:' + JSON.stringify($target))
})(arg)))
} ;
if ($target.type === "equot") {
let expr = $target[0];
let int = $target[1];
return empty
} ;
if ($target.type === "elambda") {
let pats = $target[0];
let body = $target[1];
let int = $target[2];
return bag$sland(foldl(empty)(map(pats)(pat_externals))(bag$sland))(externals(foldl(bound)(map(pats)(pat_names))(set$slmerge))(body))
} ;
if ($target.type === "elet") {
let bindings = $target[0];
let body = $target[1];
let l = $target[2];
{
let bound$0 = bound;
{
let {"1": bound, "0": bag} = foldl($co(empty)(bound$0))(bindings)(({"1": bound, "0": bag}) => ({"1": init, "0": pat}) => $co(bag$sland(bag)(bag$sland(pat_externals(pat))(externals(bound)(init))))(set$slmerge(bound)(pat_names(pat))));
return bag$sland(bag)(externals(bound)(body))
}
}
} ;
if ($target.type === "eapp") {
let target = $target[0];
let args = $target[1];
let int = $target[2];
return bag$sland(externals(bound)(target))(foldl(empty)(map(args)(externals(bound)))(bag$sland))
} ;
if ($target.type === "ematch") {
let expr = $target[0];
let cases = $target[1];
let int = $target[2];
return bag$sland(externals(bound)(expr))(foldl(empty)(cases)((bag) => (arg) => (($target) => {
if ($target.type === ",") {
let pat = $target[0];
let body = $target[1];
return bag$sland(bag$sland(bag)(pat_externals(pat)))(externals(set$slmerge(bound)(pat_names(pat)))(body))
} ;
throw new Error('match fail 19693:' + JSON.stringify($target))
})(arg)))
} ;
throw new Error('match fail 19509:' + JSON.stringify($target))
})(expr)
let externals_stmt = (stmt) => bag$slto_list((($target) => {
if ($target.type === "sdeftype") {
let string = $target[0];
let free = $target[2];
let constructors = $target[3];
{
let frees = set$slfrom_list(map(free)(fst));
return many(map(constructors)(({"2": args, "1": l, "0": name}) => (($target) => {
if ($target.type === "nil") {
return empty
} ;
return many(map(args)(externals_type(frees)));
throw new Error('match fail 14067:' + JSON.stringify($target))
})(args)))
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
throw new Error('match fail 7296:' + JSON.stringify($target))
})(stmt))
let subst_aliases = (alias) => (type) => $gt$gt$eq($lt_(extract_type_call(type)(nil)))(({"1": args, "0": base}) => $gt$gt$eq(map_$gt(({"1": l, "0": arg}) => $gt$gt$eq(subst_aliases(alias)(arg))((arg) => $lt_($co(arg)(l))))(args))((args) => (($target) => {
if ($target.type === "tcon") {
let name = $target[0];
let l = $target[1];
{
let $target = map$slget(alias)(name);
if ($target.type === "some") {
if ($target[0].type === ",,") {
let names = $target[0][0];
let subst = $target[0][1];
let al = $target[0][2];
{
let $target = $ex$eq(len(names))(len(args));
if ($target === true) {
return $lt_err(type_error(`Wrong number of args given to alias ${name}: expected ${its(len(names))}, given ${its(len(args))}.`)(cons($co(name)(l))(nil)))
} ;
return $gt$gt$eq($lt_((($target) => {
if ($target === true) {
return subst
} ;
return replace_in_type(map$slfrom_list(zip(names)(map(args)(fst))))(subst);
throw new Error('match fail 14042:' + JSON.stringify($target))
})($eq(len(names))(0))))((subst) => subst_aliases(alias)(subst));
throw new Error('match fail 13672:' + JSON.stringify($target))
}
} 
} ;
return $lt_(foldl(base)(args)((target) => ({"1": l, "0": arg}) => tapp(target)(arg)(l)));
throw new Error('match fail 13659:' + JSON.stringify($target))
}
} ;
return $lt_(foldl(base)(args)((target) => ({"1": l, "0": arg}) => tapp(target)(arg)(l)));
throw new Error('match fail 13652:' + JSON.stringify($target))
})(base)))
let infer_deftype = (tenv$qu) => (mutual_rec) => (tname) => (tnl) => (targs) => (constructors) => (l) => $gt$gt$eq($lt_(map(constructors)(({"0": name}) => name)))((names) => $gt$gt$eq(record_def_$gt(tnl))((_14709) => $gt$gt$eq(foldl_$gt(tcon(tname)(tnl))(targs)((body) => ({"1": al, "0": arg}) => $gt$gt$eq(record_def_$gt(al))((_23329) => $lt_(tapp(body)(tvar(arg)(al))(l)))))((final) => $gt$gt$eq($lt_(map$slfrom_list(targs)))((free_map) => $gt$gt$eq($lt_(set$slfrom_list(map$slkeys(free_map))))((free_set) => $gt$gt$eq(foldl_$gt($co(map$slnil)(map$slnil))(constructors)(({"1": cons, "0": values}) => ({"3": l, "2": args, "1": nl, "0": name}) => $gt$gt$eq(map_$gt(type_with_free_rec(free_map))(args))((args) => $gt$gt$eq(do_$gt(record_usages_in_type(tenv$qu)(mutual_rec))(args))((_14791) => $gt$gt$eq(record_def_$gt(nl))((_14791) => $gt$gt$eq(map_$gt(subst_aliases(tenv$slalias(tenv$qu)))(args))((args) => $lt_($co(map$slset(values)(name)($co(scheme(set$slfrom_list(map$slkeys(free_map)))(foldr(final)(args)((body) => (arg) => tfn(arg)(body)(l))))(nl)))(map$slset(cons)(name)(tconstructor(free_set)(args)(final)(nl))))))))))(({"1": cons, "0": values}) => $lt_(tenv(values)(cons)(map$slset(map$slnil)(tname)($co$co(len(targs))(set$slfrom_list(names))(tnl)))(map$slnil))))))))
let externals_list = (x) => bag$slto_list(externals(set$slnil)(x))
let vars_for_names = (names) => (tenv) => foldr_$gt($co(tenv)(nil))(names)(({"1": vars, "0": tenv}) => ({"1": loc, "0": name}) => $gt$gt$eq(new_type_var(name)(loc))((self) => $lt_($co(tenv$slset_type(tenv)(name)($co(scheme(set$slnil)(self))(loc)))(cons(self)(vars)))))
let externals_defs = (stmts) => foldr(empty)(map(stmts)(({"2": body}) => externals(set$slnil)(body)))(bag$sland)
let find_missing = (tenv) => (externals) => $gt$gt$eq($lt_(find_missing_names(tenv$slvalues(tenv))(externals)))((missing_names) => $gt$gt$eq(vars_for_names(missing_names)(tenv))(({"1": missing_vars, "0": tenv}) => $lt_($co(tenv)($co(missing_names)(missing_vars)))))
let run$slrecord = (st) => run_$gt($gt$gt$eq(st)((value) => $gt$gt$eq($lt_types)((types) => $lt_($co(value)(types)))))(state$slnil)
let subst_$gt = (new_subst) => $gt$gt$eq($lt_state)(({"2": subst, "1": types, "0": idx}) => $gt$gt$eq(state_$gt($co$co(idx)(types)(compose_subst("")(new_subst)(subst))))((_17634) => $lt_($unit)))
let tenv$slapply_$gt = apply_$gt(tenv_apply)
let things_by_loc = (expr) => bag$sland(one($co(expr_loc(expr))(expr)))((($target) => {
if ($target.type === "estr") {
let string = $target[0];
let templates = $target[1];
let int = $target[2];
return foldl(empty)(map(templates)(({"0": expr}) => things_by_loc(expr)))(bag$sland)
} ;
if ($target.type === "elambda") {
let pats = $target[0];
let expr = $target[1];
let int = $target[2];
return bag$sland(foldl(empty)(map(pats)(pats_by_loc))(bag$sland))(things_by_loc(expr))
} ;
if ($target.type === "eapp") {
let target = $target[0];
let args = $target[1];
let int = $target[2];
return bag$sland(things_by_loc(target))(foldl(empty)(map(args)(things_by_loc))(bag$sland))
} ;
if ($target.type === "elet") {
let bindings = $target[0];
let body = $target[1];
let int = $target[2];
return bag$sland(foldl(empty)(map(bindings)(({"1": init, "0": pat}) => bag$sland(pats_by_loc(pat))(things_by_loc(init))))(bag$sland))(things_by_loc(body))
} ;
if ($target.type === "ematch") {
let expr = $target[0];
let cases = $target[1];
let int = $target[2];
return bag$sland(things_by_loc(expr))(foldl(empty)(map(cases)(({"1": expr, "0": pat}) => things_by_loc(expr)))(bag$sland))
} ;
return empty;
throw new Error('match fail 18054:' + JSON.stringify($target))
})(expr))
let expr_$gts = (expr) => (($target) => {
if ($target.type === "eprim") {
let prim = $target[0];
let int = $target[1];
return prim_$gts(prim)
} ;
if ($target.type === "estr") {
let string = $target[0];
let templates = $target[1];
let int = $target[2];
return `\"${string}${join("")(map(templates)(({"1": suffix, "0": expr}) => `${expr_$gts(expr)}${suffix}`))}\"`
} ;
if ($target.type === "evar") {
let string = $target[0];
let int = $target[1];
return string
} ;
if ($target.type === "elambda") {
let pats = $target[0];
let expr = $target[1];
let int = $target[2];
return `(fn [${join(" ")(map(pats)(pat_$gts))}] ${expr_$gts(expr)})`
} ;
if ($target.type === "eapp") {
let target = $target[0];
let args = $target[1];
let int = $target[2];
return `(${expr_$gts(target)} ${join(" ")(map(args)(expr_$gts))})`
} ;
if ($target.type === "elet") {
let bindings = $target[0];
let body = $target[1];
let int = $target[2];
return `(let [${join(" ")(map(bindings)(({"1": init, "0": pat}) => `${pat_$gts(pat)} ${expr_$gts(init)}`))}]\n  ${expr_$gts(body)})`
} ;
if ($target.type === "ematch") {
let expr = $target[0];
let cases = $target[1];
let int = $target[2];
return `(match ${expr_$gts(expr)}\n  ${join("\n  ")(map(cases)(({"1": body, "0": pat}) => `${pat_$gts(pat)}	${expr_$gts(body)}`))}`
} ;
throw new Error('match fail 18473:' + JSON.stringify($target))
})(expr)
let pat_name = (pat) => new_type_var((($target) => {
if ($target.type === "pvar") {
let name = $target[0];
return name
} ;
return "\$arg";
throw new Error('match fail 16257:' + JSON.stringify($target))
})(pat))(pat_loc(pat))
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
throw new Error('match fail 22436:' + JSON.stringify($target))
})(expr)
let stmt$slidents = (stmt) => (($target) => {
if ($target.type === "sdef") {
let name = $target[0];
let l = $target[1];
let body = $target[2];
return bag$sland(one($co(name)(l)))(expr$slidents(body))
} ;
if ($target.type === "sexpr") {
let exp = $target[0];
return expr$slidents(exp)
} ;
if ($target.type === "stypealias") {
let name = $target[0];
let l = $target[1];
let args = $target[2];
let body = $target[3];
return bag$sland(type$slidents(body))(many(cons(one($co(name)(l)))(map(args)(one))))
} ;
if ($target.type === "sdeftype") {
let name = $target[0];
let l = $target[1];
let args = $target[2];
let constrs = $target[3];
return bag$sland(many(map(constrs)(({"2": args, "1": l, "0": name}) => bag$sland(one($co(name)(l)))(many(map(args)(type$slidents))))))(bag$sland(one($co(name)(l)))(many(map(args)(one))))
} ;
throw new Error('match fail 22611:' + JSON.stringify($target))
})(stmt)
let tenv_$gts = ({"3": aliases, "2": tdefs, "1": constructors, "0": values}) => `Type Env\n# Values${join("")(values_$gts(values))}\n# Types${join("")(tdefs_$gts(tdefs)(constructors))}`
let instantiate = ({"1": t, "0": vars}) => (l) => $gt$gt$eq($lt_(set$slto_list(vars)))((names) => $gt$gt$eq(map_$gt((name) => new_type_var(name)(l))(names))((with_types) => $gt$gt$eq($lt_(map$slfrom_list(zip(names)(with_types))))((subst) => $lt_($co(type_apply(subst)(t))(subst)))))
let var_bind = ($var) => (type) => (l) => (($target) => {
if ($target.type === "tvar") {
let v = $target[0];
{
let $target = $eq($var)(v);
if ($target === true) {
return $lt_($unit)
} ;
return $gt$gt$eq(subst_$gt(map$slset(map$slnil)($var)(type)))((_17669) => $lt_($unit));
throw new Error('match fail 1582:' + JSON.stringify($target))
}
} ;
{
let $target = set$slhas(type_free(type))($var);
if ($target === true) {
return $lt_err(type_error("Cycle found while unifying type with type variable")(cons($co(type_to_string_raw(type))(type_loc(type)))(cons($co($var)(l))(nil))))
} ;
return $gt$gt$eq(subst_$gt(map$slset(map$slnil)($var)(type)))((_17682) => $lt_($unit));
throw new Error('match fail 1597:' + JSON.stringify($target))
};
throw new Error('match fail 1575:' + JSON.stringify($target))
})(type)
let infer_stypes = (tenv$qu) => (stypes) => (salias) => $gt$gt$eq($lt_(foldl(map(salias)(({"3": nl, "0": name}) => $co(name)(nl)))(stypes)((names) => ({"1": nl, "0": name}) => cons($co(name)(nl))(names))))((names) => $gt$gt$eq($lt_(tenv$qu))(({"3": aliases, "2": types}) => $gt$gt$eq($lt_(set$slmerge(set$slfrom_list(map$slkeys(types)))(set$slmerge(set$slfrom_list(map(names)(fst)))(set$slfrom_list(map$slkeys(aliases))))))((bound) => $gt$gt$eq($lt_(map$slfrom_list(names)))((mutual_rec) => $gt$gt$eq(foldl_$gt(tenv$slnil)(salias)((tenv) => ({"3": nl, "2": body, "1": args, "0": name}) => (($target) => {
if ($target.type === "nil") {
return $gt$gt$eq(record_def_$gt(nl))((_21417) => $gt$gt$eq(record_local_tcon_usages(map$slfrom_list(args))(tenv)(body))((_21417) => $gt$gt$eq(record_usages_in_type(tenv$qu)(map$slmerge(map$slfrom_list(args))(mutual_rec))(body))((_21417) => $lt_(tenv$sladd_alias(tenv)(name)($co$co(map(args)(fst))(body)(nl))))))
} ;
{
let unbound = $target;
return $lt_err(type_error("Unbound types")(map(unbound)(({"2": l, "0": name}) => $co(name)(l))))
};
throw new Error('match fail 14529:' + JSON.stringify($target))
})(bag$slto_list(externals_type(set$slmerge(bound)(set$slfrom_list(map(args)(fst))))(body)))))((tenv) => $gt$gt$eq($lt_(tenv$slmerge(tenv)(tenv$qu)))((merged) => $gt$gt$eq(foldl_$gt(tenv)(stypes)((tenv) => ({"4": l, "3": constructors, "2": args, "1": tnl, "0": name}) => $gt$gt$eq(infer_deftype(merged)(mutual_rec)(name)(tnl)(args)(constructors)(l))((tenv$qu) => $lt_(tenv$slmerge(tenv$qu)(tenv)))))((tenv) => $gt$gt$eq($lt_(tenv$slmerge(tenv)(tenv$qu)))((tenv$qu) => $lt_(tenv)))))))))
let unify_inner = (t1) => (t2) => (l) => (($target) => {
if ($target.type === ",") {
if ($target[0].type === "tapp") {
let target_1 = $target[0][0];
let arg_1 = $target[0][1];
if ($target[1].type === "tapp") {
let target_2 = $target[1][0];
let arg_2 = $target[1][1];
return $gt$gt$eq(unify_inner(target_1)(target_2)(l))((_1326) => $gt$gt$eq($lt_subst)((subst) => $gt$gt$eq(unify_inner(type_apply(subst)(arg_1))(type_apply(subst)(arg_2))(l))((_1326) => $lt_($unit))))
} 
} 
} ;
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
return $lt_err(type_error("Incompatible type constructors")(cons($co(a)(la))(cons($co(b)(lb))(nil))));
throw new Error('match fail 1541:' + JSON.stringify($target))
}
} 
} 
} ;
return $lt_err(ttypes(t1)(t2));
throw new Error('match fail 1317:' + JSON.stringify($target))
})($co(t1)(t2))
let unify = (t1) => (t2) => (l) => err$gt$gt$eq(unify_inner(t1)(t2)(l))((e) => err(twrap(ttypes(t1)(t2))(e)))
let t_pat_inner = (tenv) => (pat) => (($target) => {
if ($target.type === "pany") {
let nl = $target[0];
return $gt$gt$eq(new_type_var("any")(nl))(($var) => $lt_($co($var)(map$slnil)))
} ;
if ($target.type === "pvar") {
let name = $target[0];
let nl = $target[1];
return $gt$gt$eq(new_type_var(name)(nl))(($var) => $gt$gt$eq(record_def_$gt(nl))((_3450) => $lt_($co($var)(map$slset(map$slnil)(name)($co($var)(nl))))))
} ;
if ($target.type === "pstr") {
let nl = $target[1];
return $lt_($co(tcon("string")(nl))(map$slnil))
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
if ($target.type === "pcon") {
let name = $target[0];
let il = $target[1];
let args = $target[2];
let l = $target[3];
return $gt$gt$eq((($target) => {
if ($target.type === "none") {
return $lt_err(type_error("Unknown type constructor")(cons($co(name)(l))(nil)))
} ;
if ($target.type === "some") {
let v = $target[0];
return $lt_(v)
} ;
throw new Error('match fail 3661:' + JSON.stringify($target))
})(tenv$slcon(tenv)(name)))(({"3": cloc, "2": cres, "1": cargs, "0": free}) => $gt$gt$eq(record_usage_$gt(il)(cloc))((_3479) => $gt$gt$eq(record_$gt(il)(tfns(cargs)(cres))(true))((_3479) => $gt$gt$eq(instantiate(scheme(free)(cres))(l))(({"1": tsubst, "0": tres}) => $gt$gt$eq($lt_(type$slset_loc(l)(tres)))((tres) => $gt$gt$eq($lt_(map(cargs)(type_apply(tsubst))))((cargs) => $gt$gt$eq($lt_(zip(args)(cargs)))((zipped) => $gt$gt$eq((($target) => {
if ($target === true) {
return $lt_err(type_error(`Wrong number of arguments to type constructor: given ${its(len(args))}, but the type constructor expects ${its(len(cargs))}`)(cons($co(name)(il))(nil)))
} ;
return $lt_($unit);
throw new Error('match fail 10323:' + JSON.stringify($target))
})($ex$eq(len(args))(len(cargs))))((_3479) => $gt$gt$eq(foldl_$gt(map$slnil)(zipped)((bindings) => ({"1": carg, "0": arg}) => $gt$gt$eq(t_pat(tenv)(arg))(({"1": pat_bind, "0": pat_type}) => $gt$gt$eq($lt_subst)((subst) => $gt$gt$eq(unify(type_apply(subst)(pat_type))(type_apply(subst)(type$slset_loc(l)(carg)))(l))((_3611) => $lt_(map$slmerge(bindings)(pat_bind)))))))((bindings) => $gt$gt$eq($lt_subst)((subst) => $lt_($co(type_apply(subst)(tres))(map$slmap(({"1": l, "0": t}) => $co(type_apply(subst)(t))(l))(bindings)))))))))))))
} ;
throw new Error('match fail 2475:' + JSON.stringify($target))
})(pat)

let t_pat = (tenv) => (pat) => $gt$gt$eq(t_pat_inner(tenv)(pat))(({"1": bindings, "0": t}) => $gt$gt$eq(record_$gt(pat_loc(pat))(t)(false))((_17595) => $lt_($co(t)(bindings))))
let t_expr_inner = (tenv) => (expr) => (($target) => {
if ($target.type === "evar") {
if ($target[0] === "()") {
let l = $target[1];
return $lt_(tcon("()")(l))
} 
} ;
if ($target.type === "evar") {
let name = $target[0];
let l = $target[1];
{
let $target = tenv$sltype(tenv)(name);
if ($target.type === "none") {
return $lt_err(type_error("Unbound variable")(cons($co(name)(l))(nil)))
} ;
if ($target.type === "some") {
if ($target[0].type === ",") {
let found = $target[0][0];
let fl = $target[0][1];
return $gt$gt$eq(instantiate(found)(l))(({"0": t}) => $gt$gt$eq(record_$gt(l)(scheme$slt(found))(true))((_1690) => $gt$gt$eq(record_usage_$gt(l)(fl))((_1690) => $lt_(type$slset_loc(l)(t)))))
} 
} ;
throw new Error('match fail 1671:' + JSON.stringify($target))
}
} ;
if ($target.type === "equot") {
let quot = $target[0];
let l = $target[1];
return $lt_(tcon((($target) => {
if ($target.type === "quot/expr") {
return "expr"
} ;
if ($target.type === "quot/stmt") {
return "stmt"
} ;
if ($target.type === "quot/quot") {
return "cst"
} ;
if ($target.type === "quot/type") {
return "type"
} ;
if ($target.type === "quot/pat") {
return "pat"
} ;
throw new Error('match fail 19312:' + JSON.stringify($target))
})(quot))(l))
} ;
if ($target.type === "eprim") {
let prim = $target[0];
return $lt_(t_prim(prim))
} ;
if ($target.type === "estr") {
let first = $target[0];
let templates = $target[1];
let l = $target[2];
return $gt$gt$eq($lt_(tcon("string")(l)))((string_type) => $gt$gt$eq(do_$gt(({"2": sl, "1": suffix, "0": expr}) => $gt$gt$eq(t_expr(tenv)(expr))((t) => unify(t)(string_type)(l)))(templates))((_6800) => $lt_(string_type)))
} ;
if ($target.type === "elambda") {
let pats = $target[0];
let body = $target[1];
let l = $target[2];
return $gt$gt$eq(map_$gt(pat_name)(pats))((arg_types) => $gt$gt$eq(map_$gt(t_pat(tenv))(pats))((pts) => $gt$gt$eq($lt_(foldr($co(nil)(map$slnil))(pts)(({"1": bindings, "0": ptypes}) => ({"1": bs, "0": pt}) => $co(cons(pt)(ptypes))(map$slmerge(bindings)(bs)))))(({"1": bindings, "0": pat_types}) => $gt$gt$eq(do_$gt(({"1": patt, "0": argt}) => unify(argt)(patt)(l))(zip(arg_types)(pat_types)))((_19951) => $gt$gt$eq($lt_subst)((composed) => $gt$gt$eq($lt_(map$slmap(({"1": l, "0": t}) => $co(type_apply(composed)(t))(l))(bindings)))((bindings) => $gt$gt$eq($lt_(map$slmap(({"1": l, "0": t}) => $co(scheme(set$slnil)(t))(l))(bindings)))((schemes) => $gt$gt$eq($lt_(foldr(tenv_apply(composed)(tenv))(map$slto_list(schemes))((tenv) => ({"1": {"1": l, "0": scheme}, "0": name}) => tenv$slset_type(tenv)(name)($co(scheme)(l)))))((bound_env) => $gt$gt$eq(t_expr(tenv_apply(composed)(bound_env))(body))((body_type) => $gt$gt$eq(type$slapply_$gt(body_type))((body_type) => $gt$gt$eq(map_$gt(type$slapply_$gt)(arg_types))((arg_types) => $lt_(foldr(body_type)(arg_types)((body) => (arg) => tfn(arg)(body)(l))))))))))))))
} ;
if ($target.type === "eapp") {
let target = $target[0];
let args = $target[1];
let l = $target[2];
return foldl(t_expr(tenv)(target))(args)((target_$gt) => (arg) => $gt$gt$eq(new_type_var("res")(l))((result_var) => $gt$gt$eq(target_$gt)((target_type) => $gt$gt$eq(tenv$slapply_$gt(tenv))((arg_tenv) => $gt$gt$eq(t_expr(arg_tenv)(arg))((arg_type) => $gt$gt$eq(type$slapply_$gt(target_type))((target_type) => $gt$gt$eq(unify(target_type)(tfn(arg_type)(result_var)(l))(l))((_20379) => type$slapply_$gt(result_var))))))))
} ;
if ($target.type === "elet") {
let bindings = $target[0];
let body = $target[1];
let l = $target[2];
{
let $target = bindings;
if ($target.type === "cons") {
if ($target[0].type === ",") {
let pat = $target[0][0];
let init = $target[0][1];
if ($target[1].type === "nil") {
return $gt$gt$eq(t_expr(tenv)(init))((inited) => pat_and_body(tenv)(pat)(body)(inited)(false))
} 
} 
} ;
return t_expr(tenv)(foldr(body)(bindings)((body) => ({"1": init, "0": pat}) => elet(cons($co(pat)(init))(nil))(body)(l)));
throw new Error('match fail 19367:' + JSON.stringify($target))
}
} ;
if ($target.type === "ematch") {
let target = $target[0];
let cases = $target[1];
let l = $target[2];
return $gt$gt$eq(new_type_var("match-res")(l))((result_var) => $gt$gt$eq(t_expr(tenv)(target))((target_type) => $gt$gt$eq(foldl_$gt($co(target_type)(result_var))(cases)(({"1": result, "0": target_type}) => ({"1": body, "0": pat}) => $gt$gt$eq(pat_and_body(tenv)(pat)(body)(target_type)(false))((body) => $gt$gt$eq($lt_subst)((subst) => $gt$gt$eq(unify(type_apply(subst)(result))(body)(l))((_10271) => $gt$gt$eq($lt_subst)((subst) => $lt_($co(type_apply(subst)(target_type))(type_apply(subst)(result)))))))))(({"1": result_type}) => $lt_(result_type))))
} ;
return $lt_err(type_error("Expression not supported (?)")(cons($co(expr_$gts(expr))(expr_loc(expr)))(nil)));
throw new Error('match fail 1664:' + JSON.stringify($target))
})(expr)

let t_expr = (tenv) => (expr) => $gt$gt$eq(subst_reset_$gt(map$slnil))((old) => $gt$gt$eq(t_expr_inner(tenv)(expr))((type) => $gt$gt$eq(subst_reset_$gt(old))(($new) => $gt$gt$eq(subst_$gt($new))((_16724) => $gt$gt$eq(record_$gt(expr_loc(expr))(type)(false))((_16724) => $lt_(type))))))

let pat_and_body = (tenv) => (pat) => (body) => (value_type) => (monomorphic) => $gt$gt$eq(t_pat(tenv)(pat))(({"1": bindings, "0": pat_type}) => $gt$gt$eq(unify(value_type)(pat_type)(pat_loc(pat)))((_4289) => $gt$gt$eq($lt_subst)((composed) => $gt$gt$eq($lt_(map$slmap(({"1": l, "0": t}) => $co(type_apply(composed)(t))(l))(bindings)))((bindings) => $gt$gt$eq($lt_(map$slmap(({"1": l, "0": t}) => $co((($target) => {
if ($target === true) {
return scheme(set$slnil)(t)
} ;
return generalize(tenv_apply(composed)(tenv))(t);
throw new Error('match fail 16407:' + JSON.stringify($target))
})(monomorphic))(l))(bindings)))((schemes) => $gt$gt$eq($lt_(foldr(tenv_apply(composed)(tenv))(map$slto_list(schemes))((tenv) => ({"1": {"1": l, "0": scheme}, "0": name}) => tenv$slset_type(tenv)(name)($co(scheme)(l)))))((bound_env) => $gt$gt$eq(t_expr(tenv_apply(composed)(bound_env))(body))((body_type) => type$slapply_$gt(body_type))))))))
let infer = (tenv) => (expr) => $gt$gt$eq(find_missing(tenv)(externals(set$slnil)(expr)))(({"1": missing, "0": tenv}) => $gt$gt$eq(t_expr(tenv)(expr))((type) => $gt$gt$eq($lt_subst)((subst) => $gt$gt$eq(report_missing(subst)(missing))((_1984) => $lt_(type_apply(subst)(type))))))
let infer_stmt = (tenv$qu) => (stmt) => (($target) => {
if ($target.type === "sdef") {
let name = $target[0];
let nl = $target[1];
let expr = $target[2];
let l = $target[3];
return $gt$gt$eq(idx_$gt(0))((_5499) => $gt$gt$eq(new_type_var(name)(l))((self) => $gt$gt$eq(record_def_$gt(nl))((_5499) => $gt$gt$eq($lt_(tenv$slset_type(tenv$qu)(name)($co(scheme(set$slnil)(self))(nl))))((self_bound) => $gt$gt$eq(find_missing(self_bound)(externals(set$slnil)(expr)))(({"1": missing, "0": self_bound}) => $gt$gt$eq(t_expr(self_bound)(expr))((t) => $gt$gt$eq($lt_subst)((subst) => $gt$gt$eq(report_missing(subst)(missing))((_5499) => $gt$gt$eq($lt_(type_apply(subst)(self)))((selfed) => $gt$gt$eq(unify(selfed)(t)(l))((_5499) => $gt$gt$eq($lt_subst)((subst) => $gt$gt$eq($lt_(type_apply(subst)(t)))((t) => $gt$gt$eq(record_$gt(nl)(t)(false))((_5499) => $lt_(tenv$slset_type(tenv$slnil)(name)($co(generalize(tenv$qu)(t))(nl))))))))))))))))
} ;
if ($target.type === "stypealias") {
let name = $target[0];
let nl = $target[1];
let args = $target[2];
let body = $target[3];
let l = $target[4];
return $gt$gt$eq(record_def_$gt(nl))((_21358) => $gt$gt$eq(record_usages_in_type(tenv$qu)(map$slnil)(body))((_21358) => $lt_(tenv(map$slnil)(map$slnil)(map$slnil)(map$slset(map$slnil)(name)($co$co(map(args)(({"0": name}) => name))(body)(nl))))))
} ;
if ($target.type === "sexpr") {
let expr = $target[0];
let l = $target[1];
return $gt$gt$eq(infer(tenv$qu)(expr))((_4568) => $lt_(tenv$slnil))
} ;
if ($target.type === "sdeftype") {
let tname = $target[0];
let tnl = $target[1];
let targs = $target[2];
let constructors = $target[3];
let l = $target[4];
return infer_deftype(tenv$qu)(map$slnil)(tname)(tnl)(targs)(constructors)(l)
} ;
throw new Error('match fail 4547:' + JSON.stringify($target))
})(stmt)
let infer_show = (tenv) => (x) => (($target) => {
if ($target.type === "ok") {
let v = $target[0];
return type_to_string(v)
} ;
if ($target.type === "err") {
let e = $target[0];
return `${type_error_$gts(e)}`
} ;
throw new Error('match fail 17107:' + JSON.stringify($target))
})(run$slnil_$gt(infer(tenv)(x)))
let infer_several_inner = (bound) => (types) => ({"1": {"3": l, "2": body, "1": nl, "0": name}, "0": $var}) => $gt$gt$eq($lt_subst)((subst) => $gt$gt$eq(t_expr(tenv_apply(subst)(bound))(body))((body_type) => $gt$gt$eq($lt_subst)((subst) => $gt$gt$eq($lt_(type_apply(subst)($var)))((selfed) => $gt$gt$eq(unify(selfed)(body_type)(l))((_8391) => $gt$gt$eq($lt_subst)((subst) => $gt$gt$eq($lt_(type_apply(subst)(body_type)))((body_type) => $gt$gt$eq(record_$gt(nl)(body_type)(false))((_8391) => $lt_(cons(body_type)(types))))))))))
let show_all_types = (tenv) => (expr) => {
let {"1": result, "0": {"2": subst, "1": {"1": usages, "0": types}}} = state_f(infer(tenv)(expr))(state$slnil);
{
let type_map = foldr(map$slnil)(types)((map) => ({"2": keep, "1": type, "0": loc}) => map$sladd(map)(loc)((($target) => {
if ($target === true) {
return type
} ;
return type_apply(subst)(type);
throw new Error('match fail 20934:' + JSON.stringify($target))
})(keep)));
{
let final = (($target) => {
if ($target.type === "ok") {
let v = $target[0];
return type_to_string(v)
} ;
if ($target.type === "err") {
let e = $target[0];
return type_error_$gts(e)
} ;
throw new Error('match fail 17964:' + JSON.stringify($target))
})(result);
{
let exprs = foldr(map$slnil)(bag$slto_list(things_by_loc(expr)))((map) => ({"1": expr, "0": loc}) => map$sladd(map)(loc)(expr));
return `Result: ${final}\nExprs:\n${join("\n\n")(map(map$slto_list(exprs))(({"1": exprs, "0": loc}) => `${join(";	")(map(exprs)(expr_$gts))}\n -> ${(($target) => {
if ($target.type === "none") {
return `No type at ${its(loc)}`
} ;
if ($target.type === "some") {
let t = $target[0];
return `${join(";	")(map(t)(type_to_string))}`
} ;
throw new Error('match fail 18356:' + JSON.stringify($target))
})(map$slget(type_map)(loc))}`))}`
}
}
}
}
let infer_several = (tenv) => (stmts) => $gt$gt$eq(idx_$gt(0))((_8300) => $gt$gt$eq($lt_(map(stmts)((stmt) => (($target) => {
if ($target.type === "sdef") {
let name = $target[0];
let nl = $target[1];
return $co(name)(nl)
} ;
return fatal("Cant infer-several with sdefs? idk maybe you can ...");
throw new Error('match fail 14179:' + JSON.stringify($target))
})(stmt))))((names) => $gt$gt$eq(vars_for_names(map(stmts)(({"1": nl, "0": name}) => $co(name)(nl)))(tenv))(({"1": vars, "0": bound}) => $gt$gt$eq(find_missing(bound)(externals_defs(stmts)))(({"1": missing, "0": bound2}) => $gt$gt$eq(foldr_$gt(nil)(zip(vars)(stmts))(infer_several_inner(bound2)))((types) => $gt$gt$eq($lt_subst)((subst) => $gt$gt$eq(report_missing(subst)(missing))((_8300) => $lt_(zip(names)(map(types)(type_apply(subst)))))))))))
let infer_defns = (tenv) => (stmts) => (($target) => {
if ($target.type === "cons") {
let one = $target[0];
if ($target[1].type === "nil") {
return infer_stmt(tenv)(one)
} 
} ;
return $gt$gt$eq(infer_several(tenv)(stmts))((zipped) => $gt$gt$eq(map_$gt(({"1": type, "0": {"1": nl, "0": name}}) => record_$gt(nl)(type)(false))(zipped))((_17190) => $lt_(foldl(tenv$slnil)(zipped)((tenv) => ({"1": type, "0": {"1": nl, "0": name}}) => tenv$slset_type(tenv)(name)($co(generalize(tenv)(type))(nl))))));
throw new Error('match fail 11782:' + JSON.stringify($target))
})(stmts)
let infer_stmtss = (tenv$qu) => (stmts) => $gt$gt$eq($lt_(split_stmts(stmts)(nil)(nil)(nil)(nil)))(({"3": sexps, "2": salias, "1": stypes, "0": sdefs}) => $gt$gt$eq(infer_stypes(tenv$qu)(stypes)(salias))((type_tenv) => $gt$gt$eq($lt_(tenv$slmerge(type_tenv)(tenv$qu)))((tenv$qu) => $gt$gt$eq(infer_defns(tenv$qu)(sdefs))((val_tenv) => $gt$gt$eq(map_$gt(infer(tenv$slmerge(val_tenv)(tenv$qu)))(sexps))((expr_types) => $lt_($co(tenv$slmerge(type_tenv)(val_tenv))(expr_types)))))))
let infer_stmts2 = (tenv) => (stmts) => {
let {"1": result, "0": {"2": subst, "1": {"1": usage_record, "0": types}}} = state_f(infer_stmtss(tenv)(stmts))(state$slnil);
return $co$co(result)(applied_types(types)(subst))(usage_record)
}
let run$slusages = (tenv) => (stmts) => {
let {"0": {"1": {"1": {"1": uses, "0": defns}}}} = state_f(foldl_$gt(tenv)(stmts)((tenv) => (stmt) => $gt$gt$eq(infer_stmtss(tenv)(cons(stmt)(nil)))(({"0": nenv}) => $lt_(tenv$slmerge(tenv)(nenv)))))(state$slnil);
{
let idents = map$slfrom_list(map(bag$slto_list(many(map(stmts)(stmt$slidents))))(rev_pair));
return $co(map(defns)(with_name(idents)))(map(uses)(({"1": prov, "0": user}) => $co(with_name(idents)(user))(prov)))
}
}
let test_multi = (tenv) => (stmts) => (($target) => {
if ($target.type === "err") {
let e = $target[0];
return type_error_$gts(e)
} ;
if ($target.type === "ok") {
if ($target[0].type === ",") {
let tenv = $target[0][0];
let types = $target[0][1];
return join("\n")(map(types)(type_to_string))
} 
} ;
throw new Error('match fail 24252:' + JSON.stringify($target))
})(run$slnil_$gt(infer_stmtss(tenv)(stmts)))
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
return foldl(tenv(map$slmap((b) => $co(b)(-1))(map$slfrom_list(cons($co("+")(concrete(tfns(cons(tint)(cons(tint)(nil)))(tint))))(cons($co("-")(concrete(tfns(cons(tint)(cons(tint)(nil)))(tint))))(cons($co(">")(concrete(tfns(cons(tint)(cons(tint)(nil)))(tbool))))(cons($co("<")(concrete(tfns(cons(tint)(cons(tint)(nil)))(tbool))))(cons($co("=")(generic(cons("k")(nil))(tfns(cons(k)(cons(k)(nil)))(tbool))))(cons($co("!=")(generic(cons("k")(nil))(tfns(cons(k)(cons(k)(nil)))(tbool))))(cons($co(">=")(concrete(tfns(cons(tint)(cons(tint)(nil)))(tbool))))(cons($co("<=")(concrete(tfns(cons(tint)(cons(tint)(nil)))(tbool))))(cons($co("()")(concrete(tcon("()")(-1))))(cons($co("trace")(kk(tfns(cons(tapp(tcon("array")(-1))(tapp(tcon("trace-fmt")(-1))(k)(-1))(-1))(nil))(tcon("()")(-1)))))(cons($co("unescapeString")(concrete(tfns(cons(tstring)(nil))(tstring))))(cons($co("int-to-string")(concrete(tfns(cons(tint)(nil))(tstring))))(cons($co("string-to-int")(concrete(tfns(cons(tstring)(nil))(toption(tint)))))(cons($co("string-to-float")(concrete(tfns(cons(tstring)(nil))(toption(tcon("float")(-1))))))(cons($co("++")(concrete(tfns(cons(tarray(tstring))(nil))(tstring))))(cons($co("map/nil")(kv(tmap(k)(v))))(cons($co("map/set")(kv(tfns(cons(tmap(k)(v))(cons(k)(cons(v)(nil))))(tmap(k)(v)))))(cons($co("map/rm")(kv(tfns(cons(tmap(k)(v))(cons(k)(nil)))(tmap(k)(v)))))(cons($co("map/get")(kv(tfns(cons(tmap(k)(v))(cons(k)(nil)))(toption(v)))))(cons($co("map/map")(generic(cons("k")(cons("v")(cons("v2")(nil))))(tfns(cons(tfns(cons(v)(nil))(v2))(cons(tmap(k)(v))(nil)))(tmap(k)(v2)))))(cons($co("map/merge")(kv(tfns(cons(tmap(k)(v))(cons(tmap(k)(v))(nil)))(tmap(k)(v)))))(cons($co("map/values")(kv(tfns(cons(tmap(k)(v))(nil))(tarray(v)))))(cons($co("map/keys")(kv(tfns(cons(tmap(k)(v))(nil))(tarray(k)))))(cons($co("set/nil")(kk(tset(k))))(cons($co("set/add")(kk(tfns(cons(tset(k))(cons(k)(nil)))(tset(k)))))(cons($co("set/has")(kk(tfns(cons(tset(k))(cons(k)(nil)))(tbool))))(cons($co("set/rm")(kk(tfns(cons(tset(k))(cons(k)(nil)))(tset(k)))))(cons($co("set/diff")(kk(tfns(cons(tset(k))(cons(tset(k))(nil)))(tset(k)))))(cons($co("set/merge")(kk(tfns(cons(tset(k))(cons(tset(k))(nil)))(tset(k)))))(cons($co("set/overlap")(kk(tfns(cons(tset(k))(cons(tset(k))(nil)))(tset(k)))))(cons($co("set/to-list")(kk(tfns(cons(tset(k))(nil))(tarray(k)))))(cons($co("set/from-list")(kk(tfns(cons(tarray(k))(nil))(tset(k)))))(cons($co("map/from-list")(kv(tfns(cons(tarray(t$co(k)(v)))(nil))(tmap(k)(v)))))(cons($co("map/to-list")(kv(tfns(cons(tmap(k)(v))(nil))(tarray(t$co(k)(v))))))(cons($co("jsonify")(generic(cons("v")(nil))(tfns(cons(tvar("v")(-1))(nil))(tstring))))(cons($co("valueToString")(generic(cons("v")(nil))(tfns(cons(vbl("v"))(nil))(tstring))))(cons($co("eval")(generic(cons("v")(nil))(tfns(cons(tcon("string")(-1))(nil))(vbl("v")))))(cons($co("errorToString")(generic(cons("v")(nil))(tfns(cons(tfns(cons(vbl("v"))(nil))(tstring))(cons(vbl("v"))(nil)))(tstring))))(cons($co("sanitize")(concrete(tfns(cons(tstring)(nil))(tstring))))(cons($co("replace-all")(concrete(tfns(cons(tstring)(cons(tstring)(cons(tstring)(nil))))(tstring))))(cons($co("fatal")(generic(cons("v")(nil))(tfns(cons(tstring)(nil))(vbl("v")))))(nil))))))))))))))))))))))))))))))))))))))))))))(map$slfrom_list(cons($co("()")(tconstructor(set$slnil)(nil)(tcon("()")(-1))(-1)))(nil)))(map$slfrom_list(cons($co("int")($co$co(0)(set$slnil)(-1)))(cons($co("float")($co$co(0)(set$slnil)(-1)))(cons($co("string")($co$co(0)(set$slnil)(-1)))(cons($co("bool")($co$co(0)(set$slnil)(-1)))(cons($co("map")($co$co(2)(set$slnil)(-1)))(cons($co("set")($co$co(1)(set$slnil)(-1)))(cons($co("->")($co$co(2)(set$slnil)(-1)))(nil)))))))))(map$slnil))(cons({"0":",","1":5319,"2":{"0":{"0":"a","1":5320,"type":","},"1":{"0":{"0":"b","1":5321,"type":","},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"3":{"0":{"0":",","1":5323,"2":{"0":{"0":"a","1":5324,"type":"tcon"},"1":{"0":{"0":"b","1":5325,"type":"tcon"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"3":5322,"type":",,,"},"1":{"type":"nil"},"type":"cons"},"4":5316,"type":"sdeftype"})(cons({"0":",,","1":5335,"2":{"0":{"0":"a","1":5336,"type":","},"1":{"0":{"0":"b","1":5337,"type":","},"1":{"0":{"0":"c","1":5338,"type":","},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"type":"cons"},"3":{"0":{"0":",,","1":5340,"2":{"0":{"0":"a","1":5343,"type":"tcon"},"1":{"0":{"0":"b","1":5344,"type":"tcon"},"1":{"0":{"0":"c","1":5345,"type":"tcon"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"type":"cons"},"3":5339,"type":",,,"},"1":{"type":"nil"},"type":"cons"},"4":5332,"type":"sdeftype"})(cons({"0":",,,","1":5351,"2":{"0":{"0":"a","1":5352,"type":","},"1":{"0":{"0":"b","1":5353,"type":","},"1":{"0":{"0":"c","1":5354,"type":","},"1":{"0":{"0":"d","1":5355,"type":","},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"type":"cons"},"type":"cons"},"3":{"0":{"0":",,,","1":5357,"2":{"0":{"0":"a","1":5358,"type":"tcon"},"1":{"0":{"0":"b","1":5359,"type":"tcon"},"1":{"0":{"0":"c","1":5360,"type":"tcon"},"1":{"0":{"0":"d","1":5361,"type":"tcon"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"type":"cons"},"type":"cons"},"3":5356,"type":",,,"},"1":{"type":"nil"},"type":"cons"},"4":5348,"type":"sdeftype"})(cons({"0":",,,,","1":5367,"2":{"0":{"0":"a","1":5368,"type":","},"1":{"0":{"0":"b","1":5369,"type":","},"1":{"0":{"0":"c","1":5370,"type":","},"1":{"0":{"0":"d","1":5371,"type":","},"1":{"0":{"0":"e","1":5372,"type":","},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"type":"cons"},"type":"cons"},"type":"cons"},"3":{"0":{"0":",,,,","1":5374,"2":{"0":{"0":"a","1":5375,"type":"tcon"},"1":{"0":{"0":"b","1":5376,"type":"tcon"},"1":{"0":{"0":"c","1":5377,"type":"tcon"},"1":{"0":{"0":"d","1":5378,"type":"tcon"},"1":{"0":{"0":"e","1":5379,"type":"tcon"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"type":"cons"},"type":"cons"},"type":"cons"},"3":5373,"type":",,,"},"1":{"type":"nil"},"type":"cons"},"4":5364,"type":"sdeftype"})(cons({"0":"trace-fmt","1":11392,"2":{"0":{"0":"a","1":11393,"type":","},"1":{"type":"nil"},"type":"cons"},"3":{"0":{"0":"tcolor","1":11395,"2":{"0":{"0":"string","1":11396,"type":"tcon"},"1":{"type":"nil"},"type":"cons"},"3":11394,"type":",,,"},"1":{"0":{"0":"tbold","1":11398,"2":{"0":{"0":"bool","1":11399,"type":"tcon"},"1":{"type":"nil"},"type":"cons"},"3":11397,"type":",,,"},"1":{"0":{"0":"titalic","1":11401,"2":{"0":{"0":"bool","1":11402,"type":"tcon"},"1":{"type":"nil"},"type":"cons"},"3":11400,"type":",,,"},"1":{"0":{"0":"tflash","1":11404,"2":{"0":{"0":"bool","1":11405,"type":"tcon"},"1":{"type":"nil"},"type":"cons"},"3":11403,"type":",,,"},"1":{"0":{"0":"ttext","1":11407,"2":{"0":{"0":"string","1":11408,"type":"tcon"},"1":{"type":"nil"},"type":"cons"},"3":11406,"type":",,,"},"1":{"0":{"0":"tval","1":11410,"2":{"0":{"0":"a","1":11411,"type":"tcon"},"1":{"type":"nil"},"type":"cons"},"3":11409,"type":",,,"},"1":{"0":{"0":"tloc","1":11566,"2":{"0":{"0":"int","1":11567,"type":"tcon"},"1":{"type":"nil"},"type":"cons"},"3":11565,"type":",,,"},"1":{"0":{"0":"tnamed","1":11569,"2":{"0":{"0":{"0":"trace-fmt","1":11571,"type":"tcon"},"1":{"0":"a","1":11572,"type":"tcon"},"2":11570,"type":"tapp"},"1":{"type":"nil"},"type":"cons"},"3":11568,"type":",,,"},"1":{"0":{"0":"tfmted","1":11413,"2":{"0":{"0":"a","1":11414,"type":"tcon"},"1":{"0":{"0":"string","1":11415,"type":"tcon"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"3":11412,"type":",,,"},"1":{"0":{"0":"tfmt","1":11417,"2":{"0":{"0":"a","1":11418,"type":"tcon"},"1":{"0":{"0":{"0":{"0":"->","1":-1,"type":"tcon"},"1":{"0":"a","1":11422,"type":"tcon"},"2":-1,"type":"tapp"},"1":{"0":"string","1":11423,"type":"tcon"},"2":-1,"type":"tapp"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"3":11416,"type":",,,"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"type":"cons"},"type":"cons"},"type":"cons"},"type":"cons"},"type":"cons"},"type":"cons"},"type":"cons"},"type":"cons"},"4":11389,"type":"sdeftype"})(nil))))))((tenv) => (stmt) => tenv$slmerge(tenv)(fst(force(type_error_$gts)(run$slnil_$gt(infer_stmtss(tenv)(cons(stmt)(nil)))))))
}
}
}
}
})()
let several = (tenv) => (stmts) => (($target) => {
if ($target.type === "nil") {
return $lt_err(type_error("Final stmt should be an expr")(nil))
} ;
if ($target.type === "cons") {
if ($target[0].type === "sexpr") {
let expr = $target[0][0];
if ($target[1].type === "nil") {
return $gt$gt$eq(idx_$gt(0))((_17290) => infer(tenv)(expr))
} 
} 
} ;
if ($target.type === "cons") {
let one = $target[0];
let rest = $target[1];
return $gt$gt$eq(infer_stmtss(tenv)(cons(one)(nil)))(({"0": tenv$qu}) => several(tenv$slmerge(tenv)(tenv$qu))(rest))
} ;
throw new Error('match fail 6659:' + JSON.stringify($target))
})(stmts)
let infer_stmts = (tenv) => (stmts) => foldl_$gt(tenv)(stmts)((tenv) => (stmt) => $gt$gt$eq(infer_stmtss(tenv)(cons(stmt)(nil)))(({"1": types, "0": tenv$qu}) => $lt_(tenv$slmerge(tenv)(tenv$qu))))
return eval("({0: {0:  env_nil, 1: infer_stmts, 2: infer_stmts2,  3: add_stmt,  4: infer, 5: infer2},\n  1: type_to_string, 2: get_type, 3: type_to_cst\n }) => ({type: 'fns',\n   env_nil, infer_stmts, infer_stmts2, add_stmt, infer, infer2, type_to_string, get_type, type_to_cst \n }) ")(typecheck(inference(builtin_env)((tenv) => (stmts) => fst(force(type_error_$gts)(run$slnil_$gt(infer_stmtss(tenv)(stmts)))))(infer_stmts2)(tenv$slmerge)((tenv) => (expr) => force(type_error_$gts)(run$slnil_$gt(infer(tenv)(expr))))((tenv) => (expr) => {
let {"1": result, "0": {"2": subst, "1": {"1": usage_record, "0": types}}} = state_f(infer(tenv)(expr))(state$slnil);
return $co$co(result)(applied_types(types)(subst))(usage_record)
}))(type_to_string)((tenv) => (name) => (($target) => {
if ($target.type === "some") {
if ($target[0].type === ",") {
let v = $target[0][0];
return some(scheme$sltype(v))
} 
} ;
return none;
throw new Error('match fail 10103:' + JSON.stringify($target))
})(tenv$sltype(tenv)(name)))(type_to_cst))