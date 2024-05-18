let pint = (v0) => (v1) => ({type: "pint", 0: v0, 1: v1})
let pfloat = (v0) => (v1) => ({type: "pfloat", 0: v0, 1: v1})
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
let ok = (v0) => ({type: "ok", 0: v0})
let err = (v0) => ({type: "err", 0: v0})
let $co = (v0) => (v1) => ({type: ",", 0: v0, 1: v1})
let dot = (f) => (g) => (n) => f(g(n))
let oloc = (v0) => (v1) => ({type: "oloc", 0: v0, 1: v1})
let not = (x) => (($target) => {
if ($target === true) {
return false
} ;
return true;
throw new Error('match fail 19310:' + JSON.stringify($target))
})(x)
let ok$gt$gt$eq = (value) => (next) => (($target) => {
if ($target.type === "ok") {
let v = $target[0];
return next(v)
} ;
if ($target.type === "err") {
let e = $target[0];
return err(e)
} ;
throw new Error('match fail 19812:' + JSON.stringify($target))
})(value)
let snd = ({"1": s}) => s
let class_env$slclasses = ({"1": {"0": classes}}) => classes
let none_to = (v) => (opt) => (($target) => {
if ($target.type === "none") {
return v
} ;
if ($target.type === "some") {
let m = $target[0];
return m
} ;
throw new Error('match fail 20685:' + JSON.stringify($target))
})(opt)
let tvar = (v0) => (v1) => ({type: "tvar", 0: v0, 1: v1})
let tapp = (v0) => (v1) => (v2) => ({type: "tapp", 0: v0, 1: v1, 2: v2})
let tcon = (v0) => (v1) => ({type: "tcon", 0: v0, 1: v1})
let cons = (v0) => (v1) => ({type: "cons", 0: v0, 1: v1})
let nil = {type: "nil"}
let pany = (v0) => ({type: "pany", 0: v0})
let pvar = (v0) => (v1) => ({type: "pvar", 0: v0, 1: v1})
let pcon = (v0) => (v1) => (v2) => (v3) => ({type: "pcon", 0: v0, 1: v1, 2: v2, 3: v3})
let pstr = (v0) => (v1) => ({type: "pstr", 0: v0, 1: v1})
let pprim = (v0) => (v1) => ({type: "pprim", 0: v0, 1: v1})
let cst$sllist = (v0) => (v1) => ({type: "cst/list", 0: v0, 1: v1})
let cst$slarray = (v0) => (v1) => ({type: "cst/array", 0: v0, 1: v1})
let cst$slspread = (v0) => (v1) => ({type: "cst/spread", 0: v0, 1: v1})
let cst$slid = (v0) => (v1) => ({type: "cst/id", 0: v0, 1: v1})
let cst$slstring = (v0) => (v1) => (v2) => ({type: "cst/string", 0: v0, 1: v1, 2: v2})
let ex$slany = {type: "ex/any"}
let ex$slconstructor = (v0) => (v1) => (v2) => ({type: "ex/constructor", 0: v0, 1: v1, 2: v2})
let ex$slor = (v0) => (v1) => ({type: "ex/or", 0: v0, 1: v1})
let one = (v0) => ({type: "one", 0: v0})
let many = (v0) => ({type: "many", 0: v0})
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
throw new Error('match fail 324:' + JSON.stringify($target))
})(type)
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
return type;
throw new Error('match fail 558:' + JSON.stringify($target))
})(type)
let map_without = (map) => (set) => foldr(map)(set$slto_list(set))(map$slrm)
let compose_subst = (new_subst) => (old_subst) => map$slmerge(map$slmap(type$slapply(new_subst))(old_subst))(new_subst)
let demo_new_subst = map$slfrom_list(cons($co("a")(tcon("a-mapped")(-1)))(cons($co("b")(tvar("c")(-1)))(nil)))
let StateT = (v0) => ({type: "StateT", 0: v0})
let run_$gt = ({"0": f}) => (state) => {
let {"1": result} = f(state);
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
let $lt_next_idx = $gt$gt$eq($lt_state)(({"1": {"1": {"1": types, "0": preds}, "0": subst}, "0": idx}) => $gt$gt$eq(state_$gt($co(idx + 1)($co(subst)($co(preds)(types)))))((_1548) => $lt_(idx)))
let subst_$gt = (new_subst) => $gt$gt$eq($lt_state)(({"1": {"1": {"1": types, "0": preds}, "0": subst}, "0": idx}) => $gt$gt$eq(state_$gt($co(idx)($co(compose_subst(new_subst)(subst))($co(preds)(types)))))((_1578) => $lt_($unit)))
let subst_reset_$gt = (new_subst) => $gt$gt$eq($lt_state)(({"1": {"1": types, "0": old_subst}, "0": idx}) => $gt$gt$eq(state_$gt($co(idx)($co(new_subst)(types))))((_1610) => $lt_(old_subst)))
let new_type_var = (name) => (l) => $gt$gt$eq($lt_next_idx)((nidx) => $lt_(tvar(`${name}:${int_to_string(nidx)}`)(l)))
let make_subst_for_free = (vars) => (l) => $gt$gt$eq(map_$gt((id) => $gt$gt$eq(new_type_var(id)(l))((new_var) => $lt_($co(id)(new_var))))(set$slto_list(vars)))((mapping) => $lt_(map$slfrom_list(mapping)))
let one_subst = ($var) => (type) => map$slfrom_list(cons($co($var)(type))(nil))
let apply_$gt = (f) => (arg) => $gt$gt$eq($lt_subst)((subst) => $lt_(f(subst)(arg)))
let type$slapply_$gt = apply_$gt(type$slapply)
let tfn = (arg) => (body) => (l) => tapp(tapp(tcon("->")(l))(arg)(l))(body)(l)
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
let type_$gts = (type) => (($target) => {
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
return `(fn [${type_$gts(arg)}] ${type_$gts(res)})`
} 
} 
} 
} ;
if ($target.type === "tapp") {
let target = $target[0];
let arg = $target[1];
return `(${type_$gts(target)} ${type_$gts(arg)})`
} ;
if ($target.type === "tcon") {
let name = $target[0];
return name
} ;
throw new Error('match fail 3224:' + JSON.stringify($target))
})(type)
let tfns = (args) => (body) => (l) => foldr(body)(args)((body) => (arg) => tfn(arg)(body)(l))
let tint = tcon("int")(-1)
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
let type$slunroll_app = (type) => (($target) => {
if ($target.type === "tapp") {
let target = $target[0];
let arg = $target[1];
let l = $target[2];
{
let target$0 = target;
{
let {"1": inner, "0": target} = type$slunroll_app(target$0);
return $co(target)(cons($co(arg)(l))(inner))
}
}
} ;
return $co(type)(nil);
throw new Error('match fail 5764:' + JSON.stringify($target))
})(type)
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
let tbool = tcon("bool")(-1)
let tmap = (k) => (v) => tapp(tapp(tcon("map")(-1))(k)(-1))(v)(-1)
let toption = (arg) => tapp(tcon("option")(-1))(arg)(-1)
let tlist = (arg) => tapp(tcon("list")(-1))(arg)(-1)
let tset = (arg) => tapp(tcon("set")(-1))(arg)(-1)
let vbl = (k) => tvar(k)(-1)
let t$co = (a) => (b) => tapp(tapp(tcon(",")(-1))(a)(-1))(b)(-1)
let tstring = tcon("string")(-1)
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
let tcon_and_args = (type) => (coll) => (l) => (($target) => {
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
let any_list = (arity) => loop(arity)((arity) => (recur) => (($target) => {
if ($target === true) {
return nil
} ;
return cons(ex$slany)(recur(arity - 1));
throw new Error('match fail 11350:' + JSON.stringify($target))
})($eq(0)(arity)))
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
let default_matrix = (matrix) => concat(map((row) => (($target) => {
if ($target.type === "cons") {
if ($target[0].type === "ex/any") {
let rest = $target[1];
return cons(rest)(nil)
} 
} ;
if ($target.type === "cons") {
if ($target[0].type === "ex/or") {
let left = $target[0][0];
let right = $target[0][1];
let rest = $target[1];
return default_matrix(cons(cons(left)(rest))(cons(cons(right)(rest))(nil)))
} 
} ;
return nil;
throw new Error('match fail 10531:' + JSON.stringify($target))
})(row))(matrix))
let fold_ex_pat = (init) => (pat) => (f) => (($target) => {
if ($target.type === "ex/or") {
let left = $target[0];
let right = $target[1];
return f(f(init)(left))(right)
} ;
return f(init)(pat);
throw new Error('match fail 10758:' + JSON.stringify($target))
})(pat)
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
let record_type_$gt = (type) => (loc) => (dont_subst) => $gt$gt$eq($lt_state)(({"1": {"1": {"1": types, "0": preds}, "0": subst}, "0": idx}) => $gt$gt$eq(state_$gt($co(idx)($co(subst)($co(preds)(cons($co(type)($co(loc)(dont_subst)))(types))))))((_12816) => $lt_($unit)))
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
if ($target[0][0].type === "tcon") {
if ($target[0][0][0] === "->") {
let arg = $target[0][1];
let res = $target[1];
{
let res$0 = res;
{
let {"1": res, "0": args} = fn_args_and_body(res$0);
return $co(cons(arg)(args))(res)
}
}
} 
} 
} 
} ;
return $co(nil)(type);
throw new Error('match fail 13154:' + JSON.stringify($target))
})(type)
let isin = (v0) => (v1) => (v2) => ({type: "isin", 0: v0, 1: v1, 2: v2})
let $eq$gt = (v0) => (v1) => ({type: "=>", 0: v0, 1: v1})
let list$eq = (a$qu) => (b$qu) => (eq) => (($target) => {
if ($target.type === ",") {
if ($target[0].type === "cons") {
let one = $target[0][0];
let rest = $target[0][1];
if ($target[1].type === "cons") {
let two = $target[1][0];
let rest$qu = $target[1][1];
{
let $target = eq(one)(two);
if ($target === true) {
return list$eq(rest)(rest$qu)(eq)
} ;
return false;
throw new Error('match fail 14093:' + JSON.stringify($target))
}
} 
} 
} ;
return false;
throw new Error('match fail 14077:' + JSON.stringify($target))
})($co(a$qu)(b$qu))
let pred$eq = ({"1": id, "0": type}) => ({"1": id$qu, "0": type$qu}) => (($target) => {
if ($target === true) {
return type$eq(type)(type$qu)
} ;
return false;
throw new Error('match fail 14158:' + JSON.stringify($target))
})($eq(id)(id$qu))
let predicate$slfree = ({"0": type}) => type$slfree(type)
let predicate$slapply = (subst) => ({"2": l, "1": cls, "0": type}) => isin(type$slapply(subst)(type))(cls)(l)
let pred_$gts = ({"2": locs, "1": cls, "0": type}) => `(isin ${type_$gts(type)} \"${cls}\" ${join(" ")(map(({"1": i, "0": l}) => `${int_to_string(l)}@${int_to_string(i)}`)(locs))}) `
let empty = many(nil)
let bag$sland = (first) => (second) => (($target) => {
if ($target.type === ",") {
if ($target[0].type === "many") {
if ($target[0][0].type === "nil") {
let a = $target[1];
return a
} 
} 
} ;
if ($target.type === ",") {
let a = $target[0];
if ($target[1].type === "many") {
if ($target[1][0].type === "nil") {
return a
} 
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
throw new Error('match fail 14387:' + JSON.stringify($target))
})($co(first)(second))
let bag$slfold = (f) => (init) => (bag) => (($target) => {
if ($target.type === "many") {
if ($target[0].type === "nil") {
return init
} 
} ;
if ($target.type === "one") {
let v = $target[0];
return f(init)(v)
} ;
if ($target.type === "many") {
let items = $target[0];
return foldr(init)(items)(bag$slfold(f))
} ;
throw new Error('match fail 14447:' + JSON.stringify($target))
})(bag)
let bag$slto_list = (bag) => bag$slfold((list) => (one) => cons(one)(list))(nil)(bag)
let $lt_preds = $gt$gt$eq($lt_state)(({"1": {"1": {"0": preds}}}) => $lt_(preds))
let predicate$slreloc = (l) => (i) => ({"1": cls, "0": type}) => isin(type)(cls)(cons(oloc(l)(i))(nil))
let mapi_inner = (i) => (f) => (values) => (($target) => {
if ($target.type === "nil") {
return nil
} ;
if ($target.type === "cons") {
let one = $target[0];
let rest = $target[1];
return cons(f(i)(one))(mapi_inner(i + 1)(f)(rest))
} ;
throw new Error('match fail 15302:' + JSON.stringify($target))
})(values)
let predicate$eq = ({"1": s1, "0": t1}) => ({"1": s2, "0": t2}) => (($target) => {
if ($target === true) {
return type$eq(t1)(t2)
} ;
return false;
throw new Error('match fail 16868:' + JSON.stringify($target))
})($eq(s1)(s2))
let predicate$slmerge = ({"2": l1, "1": s1, "0": t1}) => ({"2": l2, "1": s2, "0": t2}) => (($target) => {
if ($target === true) {
{
let $target = type$eq(t1)(t2);
if ($target === true) {
return some(isin(t1)(s2)(set$slto_list(set$slfrom_list(concat(cons(l1)(cons(l2)(nil)))))))
} ;
return none;
throw new Error('match fail 16906:' + JSON.stringify($target))
}
} ;
return none;
throw new Error('match fail 16888:' + JSON.stringify($target))
})($eq(s1)(s2))
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
throw new Error('match fail 17190:' + JSON.stringify($target))
}
} ;
throw new Error('match fail 17179:' + JSON.stringify($target))
})(lst)
let type$slmatches_free = (free) => (type) => (($target) => {
if ($target.type === "tvar") {
let id = $target[0];
return set$slhas(free)(id)
} ;
if ($target.type === "tcon") {
return false
} ;
if ($target.type === "tapp") {
let a = $target[0];
let b = $target[1];
{
let $target = type$slmatches_free(free)(b);
if ($target === true) {
return true
} ;
return type$slmatches_free(free)(a);
throw new Error('match fail 17250:' + JSON.stringify($target))
}
} ;
throw new Error('match fail 17229:' + JSON.stringify($target))
})(type)
let type_to_js_id = (type) => (($target) => {
if ($target.type === "tvar") {
let name = $target[0];
return sanitize(name)
} ;
if ($target.type === "tcon") {
let name = $target[0];
return sanitize(name)
} ;
if ($target.type === "tapp") {
let target = $target[0];
let arg = $target[1];
return `${type_to_js_id(target)}\$app\$${type_to_js_id(arg)}`
} ;
throw new Error('match fail 17641:' + JSON.stringify($target))
})(type)
let put_in_place = (ordered) => (value) => (idx) => (($target) => {
if ($target.type === "nil") {
return cons($co(value)(idx))(nil)
} ;
if ($target.type === "cons") {
if ($target[0].type === ",") {
let ov = $target[0][0];
let oidx = $target[0][1];
let rest = $target[1];
{
let $target = idx < oidx;
if ($target === true) {
return cons($co(value)(idx))(cons($co(ov)(oidx))(rest))
} ;
return cons($co(ov)(oidx))(put_in_place(rest)(value)(idx));
throw new Error('match fail 17728:' + JSON.stringify($target))
}
} 
} ;
throw new Error('match fail 17710:' + JSON.stringify($target))
})(ordered)
let default_types = cons(tint)(cons(tcon("unit")(-1))(nil))
let reset_preds_$gt = (preds) => $gt$gt$eq($lt_state)(({"1": {"1": {"1": types}, "0": subst}, "0": idx}) => $gt$gt$eq(state_$gt($co(idx)($co(subst)($co(preds)(types)))))((_17900) => $lt_($unit)))
let find_matching_instance = nil
let by_super = (classes) => (pred) => {
let {"2": locs, "1": cls, "0": t} = pred;
{
let {"0": supers} = (($target) => {
if ($target.type === "some") {
let s = $target[0];
return s
} ;
return fatal(`Unknown class '${cls}' in predicate [by-super]`);
throw new Error('match fail 18266:' + JSON.stringify($target))
})(map$slget(classes)(cls));
return cons(pred)(concat(map((i$qu) => by_super(classes)(isin(t)(i$qu)(locs)))(supers)))
}
}
let find_some = (f) => (arr) => (($target) => {
if ($target.type === "nil") {
return none
} ;
if ($target.type === "cons") {
let one = $target[0];
let rest = $target[1];
{
let $target = f(one);
if ($target.type === "some") {
let v = $target[0];
return some(v)
} ;
return find_some(f)(rest);
throw new Error('match fail 18618:' + JSON.stringify($target))
}
} ;
throw new Error('match fail 18608:' + JSON.stringify($target))
})(arr)
let all = (f) => (items) => (($target) => {
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
throw new Error('match fail 18860:' + JSON.stringify($target))
}
} ;
throw new Error('match fail 18851:' + JSON.stringify($target))
})(items)
let ambiguities = (known_variables) => (preds) => {
let vbls_in_preds = foldl(set$slnil)(map(predicate$slfree)(preds))(set$slmerge);
{
let unaccounted_for_variables = set$sldiff(vbls_in_preds)(known_variables);
return map((v) => $co(v)(filter((pred) => any($eq(v))(set$slto_list(predicate$slfree(pred))))(preds)))(set$slto_list(unaccounted_for_variables))
}
}
let joinor = (sep) => ($default) => (items) => (($target) => {
if ($target.type === "nil") {
return $default
} ;
return join(sep)(items);
throw new Error('match fail 19156:' + JSON.stringify($target))
})(items)
let is_empty = (x) => (($target) => {
if ($target.type === "nil") {
return true
} ;
return false;
throw new Error('match fail 19174:' + JSON.stringify($target))
})(x)
let every = (lst) => (f) => (($target) => {
if ($target.type === "nil") {
return true
} ;
if ($target.type === "cons") {
let one = $target[0];
let rest = $target[1];
{
let $target = f(one);
if ($target === true) {
return every(rest)(f)
} ;
return false;
throw new Error('match fail 19336:' + JSON.stringify($target))
}
} ;
throw new Error('match fail 19323:' + JSON.stringify($target))
})(lst)
let numClasses = cons("number")(cons("integral")(cons("floating")(cons("fractional")(cons("real")(cons("realfloat")(cons("realfrac")(nil)))))))
let stdClasses = cons("eq")(cons("ord")(cons("show")(cons("read")(cons("pretty")(cons("bounded")(cons("enum")(cons("ix")(cons("functor")(cons("monad")(cons("monadplus")(numClasses)))))))))))
let head = (lst) => (($target) => {
if ($target.type === "nil") {
return fatal("empty list")
} ;
if ($target.type === "cons") {
let one = $target[0];
return one
} ;
throw new Error('match fail 19407:' + JSON.stringify($target))
})(lst)
let type$slhnf = (type) => (($target) => {
if ($target.type === "tvar") {
return true
} ;
if ($target.type === "tcon") {
return false
} ;
if ($target.type === "tapp") {
let t = $target[0];
return type$slhnf(t)
} ;
throw new Error('match fail 19510:' + JSON.stringify($target))
})(type)
let in_hnf = ({"0": t}) => type$slhnf(t)
let preds_$gts = dot(join("\n"))(map(pred_$gts))
let sc_entail = (ce) => (ps) => (p) => any(any(pred$eq(p)))(map(by_super(ce))(ps))
let map$slok = (f) => (arr) => (($target) => {
if ($target.type === "nil") {
return ok(nil)
} ;
if ($target.type === "cons") {
let one = $target[0];
let rest = $target[1];
{
let $target = f(one);
if ($target.type === "ok") {
let val = $target[0];
{
let $target = map$slok(f)(rest);
if ($target.type === "ok") {
let rest = $target[0];
return ok(cons(val)(rest))
} ;
if ($target.type === "err") {
let e = $target[0];
return err(e)
} ;
throw new Error('match fail 19777:' + JSON.stringify($target))
}
} ;
if ($target.type === "err") {
let e = $target[0];
return err(e)
} ;
throw new Error('match fail 19769:' + JSON.stringify($target))
}
} ;
throw new Error('match fail 19758:' + JSON.stringify($target))
})(arr)
let partition = (arr) => (test) => (($target) => {
if ($target.type === "nil") {
return $co(nil)(nil)
} ;
if ($target.type === "cons") {
let one = $target[0];
let rest = $target[1];
{
let {"1": no, "0": yes} = partition(rest)(test);
{
let $target = test(one);
if ($target === true) {
return $co(cons(one)(yes))(no)
} ;
return $co(yes)(cons(one)(no));
throw new Error('match fail 19891:' + JSON.stringify($target))
}
}
} ;
throw new Error('match fail 19868:' + JSON.stringify($target))
})(arr)
let contains = (arr) => (item) => (item$eq) => (($target) => {
if ($target.type === "nil") {
return false
} ;
if ($target.type === "cons") {
let one = $target[0];
let rest = $target[1];
{
let $target = item$eq(one)(item);
if ($target === true) {
return true
} ;
return contains(rest)(item)(item$eq);
throw new Error('match fail 20018:' + JSON.stringify($target))
}
} ;
throw new Error('match fail 20009:' + JSON.stringify($target))
})(arr)
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

let tdef = (v0) => (v1) => (v2) => (v3) => ({type: "tdef", 0: v0, 1: v1, 2: v2, 3: v3})
let texpr = (v0) => (v1) => ({type: "texpr", 0: v0, 1: v1})
let tdeftype = (v0) => (v1) => (v2) => (v3) => (v4) => ({type: "tdeftype", 0: v0, 1: v1, 2: v2, 3: v3, 4: v4})
let ttypealias = (v0) => (v1) => (v2) => (v3) => (v4) => ({type: "ttypealias", 0: v0, 1: v1, 2: v2, 3: v3, 4: v4})
let specialized_matrix = (constructor) => (arity) => (matrix) => concat(map(specialize_row(constructor)(arity))(matrix))

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
if ($target.type === "cons") {
if ($target[0].type === "ex/or") {
let left = $target[0][0];
let right = $target[0][1];
let rest = $target[1];
return specialized_matrix(constructor)(arity)(cons(cons(left)(rest))(cons(cons(right)(rest))(nil)))
} 
} ;
throw new Error('match fail 10573:' + JSON.stringify($target))
})(row)
let forall = (v0) => (v1) => ({type: "forall", 0: v0, 1: v1})
let tenv = (v0) => (v1) => (v2) => (v3) => (v4) => ({type: "tenv", 0: v0, 1: v1, 2: v2, 3: v3, 4: v4})
let tenv$slwith_type = ({"4": typeclasses, "3": aliases, "2": types, "1": tcons, "0": values}) => (name) => (scheme) => tenv(map$slset(values)(name)(scheme))(tcons)(types)(aliases)(typeclasses)

let reset_state_$gt = $gt$gt$eq($lt_state)(({"1": {"1": {"1": types}}}) => $gt$gt$eq(state_$gt($co(0)($co(map$slnil)($co(empty)(types)))))((_1524) => $lt_($unit)))
let state$slnil = $co(0)($co(map$slnil)($co(empty)(nil)))
let run$slnil_$gt = (st) => run_$gt(st)(state$slnil)
let tenv$slresolve = ({"0": values}) => (name) => map$slget(values)(name)
let tenv$slnil = tenv(map$slnil)(map$slnil)(map$slnil)(map$slnil)(map$slnil)
let add$sltypealias = ({"4": typeclasses, "3": aliases, "2": types, "1": tcons, "0": values}) => (name) => (args) => (type) => tenv(map$slnil)(map$slnil)(map$slnil)(map$slset(map$slnil)(name)($co(map(fst)(args))(type$slcon_to_var(set$slfrom_list(map(fst)(args)))(type))))(map$slnil)
let type$slresolve_aliases = (aliases) => (type) => {
let {"1": args, "0": target} = type$slunroll_app(type);
{
let args$0 = args;
{
let args = map(type$slresolve_aliases(aliases))(reverse(map(fst)(args$0)));
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
let tenv$slmerge = ({"4": tc1, "3": a1, "2": t1, "1": c1, "0": v1}) => ({"4": tc2, "3": a2, "2": t2, "1": c2, "0": v2}) => tenv(map$slmerge(v1)(v2))(map$slmerge(c1)(c2))(map$slmerge(t1)(t2))(map$slmerge(a1)(a2))(foldl(tc1)(map$slto_list(tc2))((tc) => ({"1": {"1": {"1": fns, "0": insts}, "0": supers}, "0": name}) => (($target) => {
if ($target.type === "none") {
return map$slset(tc)(name)($co(supers)($co(insts)(fns)))
} ;
if ($target.type === "some") {
if ($target[0].type === ",") {
if ($target[0][1].type === ",") {
let insts$qu = $target[0][1][0];
return map$slset(tc)(name)($co(supers)($co(concat(cons(insts)(cons(insts$qu)(nil))))(fns)))
} 
} 
} ;
throw new Error('match fail 16700:' + JSON.stringify($target))
})(map$slget(tc)(name))))
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
let concrete = (t) => forall(set$slnil)($eq$gt(nil)(t))
let generic = (vbls) => (t) => forall(set$slfrom_list(vbls))($eq$gt(nil)(t))
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
{
let num2 = forall(set$slfrom_list(cons("a")(nil)))($eq$gt(cons(isin(a)("number")(nil))(nil))(tfns(cons(a)(cons(a)(nil)))(a)(-1)));
{
let ord2 = forall(set$slfrom_list(cons("a")(nil)))($eq$gt(cons(isin(a)("ord")(nil))(nil))(tfns(cons(a)(cons(a)(nil)))(tbool)(-1)));
{
let eq2 = forall(set$slfrom_list(cons("a")(nil)))($eq$gt(cons(isin(a)("eq")(nil))(nil))(tfns(cons(a)(cons(a)(nil)))(tbool)(-1)));
{
let inst = (t) => (cls) => $eq$gt(nil)(isin(t)(cls)(nil));
return tenv(map$slfrom_list(cons($co("-")(num2))(cons($co(">")(ord2))(cons($co("<")(ord2))(cons($co("=")(eq2))(cons($co("!=")(eq2))(cons($co(">=")(ord2))(cons($co("<=")(ord2))(cons($co("pi")(concrete(tcon("float")(-1))))(cons($co("+")(num2))(cons($co("show")(forall(set$slfrom_list(cons("a")(nil)))($eq$gt(cons(isin(a)("show")(nil))(nil))(tfns(cons(a)(nil))(tstring)(-1)))))(cons($co("show/pretty")(forall(set$slfrom_list(cons("a")(nil)))($eq$gt(cons(isin(a)("pretty")(nil))(nil))(tfns(cons(a)(nil))(tstring)(-1)))))(cons($co("()")(concrete(tcon("()")(-1))))(cons($co(",")(generic(cons("a")(cons("b")(nil)))(tfns(cons(a)(cons(b)(nil)))(t$co(a)(b))(-1))))(cons($co("unescapeString")(concrete(tfns(cons(tstring)(nil))(tstring)(-1))))(cons($co("int-to-string")(concrete(tfns(cons(tint)(nil))(tstring)(-1))))(cons($co("string-to-int")(concrete(tfns(cons(tstring)(nil))(toption(tint))(-1))))(cons($co("string-to-float")(concrete(tfns(cons(tstring)(nil))(toption(tcon("float")(-1)))(-1))))(cons($co("map/nil")(kv(tmap(k)(v))))(cons($co("map/set")(kv(tfns(cons(tmap(k)(v))(cons(k)(cons(v)(nil))))(tmap(k)(v))(-1))))(cons($co("map/rm")(kv(tfns(cons(tmap(k)(v))(cons(k)(nil)))(tmap(k)(v))(-1))))(cons($co("map/get")(kv(tfns(cons(tmap(k)(v))(cons(k)(nil)))(toption(v))(-1))))(cons($co("map/map")(generic(cons("k")(cons("v")(cons("v2")(nil))))(tfns(cons(tfns(cons(v)(nil))(v2)(-1))(cons(tmap(k)(v))(nil)))(tmap(k)(v2))(-1))))(cons($co("map/merge")(kv(tfns(cons(tmap(k)(v))(cons(tmap(k)(v))(nil)))(tmap(k)(v))(-1))))(cons($co("map/values")(kv(tfns(cons(tmap(k)(v))(nil))(tlist(v))(-1))))(cons($co("map/keys")(kv(tfns(cons(tmap(k)(v))(nil))(tlist(k))(-1))))(cons($co("set/nil")(kk(tset(k))))(cons($co("set/add")(kk(tfns(cons(tset(k))(cons(k)(nil)))(tset(k))(-1))))(cons($co("set/has")(kk(tfns(cons(tset(k))(cons(k)(nil)))(tbool)(-1))))(cons($co("set/rm")(kk(tfns(cons(tset(k))(cons(k)(nil)))(tset(k))(-1))))(cons($co("set/diff")(kk(tfns(cons(tset(k))(cons(tset(k))(nil)))(tset(k))(-1))))(cons($co("set/merge")(kk(tfns(cons(tset(k))(cons(tset(k))(nil)))(tset(k))(-1))))(cons($co("set/overlap")(kk(tfns(cons(tset(k))(cons(tset(k))(nil)))(tset(k))(-1))))(cons($co("set/to-list")(kk(tfns(cons(tset(k))(nil))(tlist(k))(-1))))(cons($co("set/from-list")(kk(tfns(cons(tlist(k))(nil))(tset(k))(-1))))(cons($co("map/from-list")(kv(tfns(cons(tlist(t$co(k)(v)))(nil))(tmap(k)(v))(-1))))(cons($co("map/to-list")(kv(tfns(cons(tmap(k)(v))(nil))(tlist(t$co(k)(v)))(-1))))(cons($co("jsonify")(generic(cons("v")(nil))(tfns(cons(tvar("v")(-1))(nil))(tstring)(-1))))(cons($co("valueToString")(generic(cons("v")(nil))(tfns(cons(vbl("v"))(nil))(tstring)(-1))))(cons($co("eval")(generic(cons("v")(nil))(tfns(cons(tcon("string")(-1))(nil))(vbl("v"))(-1))))(cons($co("errorToString")(generic(cons("v")(nil))(tfns(cons(tfns(cons(vbl("v"))(nil))(tstring)(-1))(cons(vbl("v"))(nil)))(tstring)(-1))))(cons($co("sanitize")(concrete(tfns(cons(tstring)(nil))(tstring)(-1))))(cons($co("replace-all")(concrete(tfns(cons(tstring)(cons(tstring)(cons(tstring)(nil))))(tstring)(-1))))(cons($co("fatal")(generic(cons("v")(nil))(tfns(cons(tstring)(nil))(vbl("v"))(-1))))(nil)))))))))))))))))))))))))))))))))))))))))))))(map$slfrom_list(cons($co("()")($co(nil)($co(nil)(tcon("()")(-1)))))(cons($co(",")($co(cons("a")(cons("b")(nil)))($co(cons(a)(cons(b)(nil)))(t$co(a)(b)))))(nil))))(map$slfrom_list(cons($co("int")($co(0)(set$slnil)))(cons($co("float")($co(0)(set$slnil)))(cons($co("string")($co(0)(set$slnil)))(cons($co("bool")($co(0)(set$slnil)))(cons($co("map")($co(2)(set$slnil)))(cons($co("set")($co(1)(set$slnil)))(cons($co("->")($co(2)(set$slnil)))(nil)))))))))(map$slnil)(map$slfrom_list(cons($co("number")($co(nil)($co(cons(inst(tint)("number"))(cons(inst(tcon("float")(-1))("number"))(nil)))(nil))))(cons($co("ord")($co(nil)($co(cons(inst(tint)("ord"))(cons(inst(tcon("float")(-1))("ord"))(nil)))(nil))))(cons($co("eq")($co(nil)($co(cons(inst(tint)("eq"))(cons(inst(tcon("float")(-1))("eq"))(cons(inst(tbool)("eq"))(nil))))(nil))))(cons($co("floating")($co(nil)($co(cons($eq$gt(nil)(isin(tcon("float")(-1))("floating")(nil)))(nil))(nil))))(cons($co("show")($co(nil)($co(cons(inst(tint)("show"))(cons(inst(tstring)("show"))(cons(inst(tbool)("show"))(cons(inst(tcon("float")(-1))("show"))(nil)))))(nil))))(nil)))))))
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
})()
let tenv$slwith_scope = ({"4": typeclasses, "3": aliases, "2": types, "1": tcons, "0": values}) => (scope) => tenv(map$slmerge(scope)(values))(tcons)(types)(aliases)(typeclasses)
let scheme_$gts = ({"1": {"1": type, "0": preds}, "0": vbls}) => `${(($target) => {
if ($target.type === "nil") {
return ""
} ;
{
let vbls = $target;
return `forall ${join(" ")(vbls)} : `
};
throw new Error('match fail 15351:' + JSON.stringify($target))
})(set$slto_list(vbls))}${join("")(map(pred_$gts)(preds))}${type_$gts(type)}`
let pattern_to_ex_pattern = (tenv) => ({"1": type, "0": pattern}) => (($target) => {
if ($target.type === "pvar") {
return ex$slany
} ;
if ($target.type === "pany") {
return ex$slany
} ;
if ($target.type === "pstr") {
let str = $target[0];
return ex$slconstructor(str)("string")(nil)
} ;
if ($target.type === "pprim") {
if ($target[0].type === "pint") {
let v = $target[0][0];
return ex$slconstructor(int_to_string(v))("int")(nil)
} 
} ;
if ($target.type === "pprim") {
if ($target[0].type === "pfloat") {
let v = $target[0][0];
return ex$slconstructor(jsonify(v))("float")(nil)
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
})(v))("bool")(nil)
} 
} ;
if ($target.type === "pcon") {
let name = $target[0];
let args = $target[2];
let l = $target[3];
{
let {"1": targs, "0": tname} = tcon_and_args(type)(nil)(l);
{
let {"1": tcons} = tenv;
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
return ex$slconstructor(name)(tname)(map(pattern_to_ex_pattern(tenv))(zip(args)(map(type$slapply(subst))(cargs))))
}
}
}
}
} ;
throw new Error('match fail 9888:' + JSON.stringify($target))
})(pattern)
let find_gid = (heads) => fold_ex_pats(none)(heads)((gid) => (pat) => (($target) => {
if ($target.type === "ex/constructor") {
let id = $target[1];
{
let $target = gid;
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
}
} ;
return gid;
throw new Error('match fail 10790:' + JSON.stringify($target))
})(pat))
let group_constructors = (tenv) => (gid) => (($target) => {
if ($target === "int") {
return nil
} ;
if ($target === "bool") {
return cons("true")(cons("false")(nil))
} ;
if ($target === "string") {
return nil
} ;
{
let {"2": types} = tenv;
{
let $target = map$slget(types)(gid);
if ($target.type === "none") {
return fatal(`Unknown type name ${gid}`)
} ;
if ($target.type === "some") {
if ($target[0].type === ",") {
let names = $target[0][1];
return set$slto_list(names)
} 
} ;
throw new Error('match fail 10915:' + JSON.stringify($target))
}
};
throw new Error('match fail 10888:' + JSON.stringify($target))
})(gid)
let type_$gtcst = (type) => (($target) => {
if ($target.type === "tvar") {
let name = $target[0];
let l = $target[1];
return cst$slid(name)(l)
} ;
if ($target.type === "tcon") {
let name = $target[0];
let l = $target[1];
return cst$slid(name)(l)
} ;
if ($target.type === "tapp") {
if ($target[0].type === "tapp") {
if ($target[0][0].type === "tcon") {
if ($target[0][0][0] === "->") {
let l = $target[2];
{
let {"1": res, "0": args} = fn_args_and_body(type);
return cst$sllist(cons(cst$slid("fn")(l))(cons(cst$slarray(map(type_$gtcst)(args))(l))(cons(type_$gtcst(res))(nil))))(l)
}
} 
} 
} 
} ;
if ($target.type === "tapp") {
let l = $target[2];
{
let {"1": args, "0": name} = target_and_args(type)(nil);
return cst$sllist(cons(type_$gtcst(name))(map(type_$gtcst)(args)))(l)
}
} ;
throw new Error('match fail 13013:' + JSON.stringify($target))
})(type)
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
throw new Error('match fail 13630:' + JSON.stringify($target))
})(expr)
let record_if_generic = ({"1": {"1": t}, "0": free}) => (l) => (($target) => {
if ($target.type === "nil") {
return $lt_($unit)
} ;
return record_type_$gt(t)(l)(true);
throw new Error('match fail 13752:' + JSON.stringify($target))
})(set$slto_list(free))
let qual$eq = ({"1": t, "0": preds}) => ({"1": t$qu, "0": preds$qu}) => (t$eq) => (($target) => {
if ($target === true) {
return t$eq(t)(t$qu)
} ;
return false;
throw new Error('match fail 14056:' + JSON.stringify($target))
})(list$eq(preds)(preds$qu)(pred$eq))
let qual$slfree = ({"1": contents, "0": predicates}) => (contents$slfree) => foldl(contents$slfree(contents))(map(predicate$slfree)(predicates))(set$slmerge)
let qual$slapply = (contents$slapply) => (subst) => ({"1": contents, "0": predicates}) => $eq$gt(map(predicate$slapply(subst))(predicates))(contents$slapply(subst)(contents))
let preds_$gt = (preds) => $gt$gt$eq($lt_state)(({"1": {"1": {"1": types, "0": current}, "0": subst}, "0": idx}) => $gt$gt$eq(state_$gt($co(idx)($co(subst)($co(bag$sland(many(map(one)(preds)))(current))(types)))))((_14329) => $lt_($unit)))
let qualt$slapply_$gt = apply_$gt(qual$slapply(type$slapply))
let mapi = (f) => (values) => mapi_inner(0)(f)(values)
let predicate$slcombine = (preds) => loop($co(nil)(preds))(({"1": right, "0": left}) => (recur) => (($target) => {
if ($target.type === "nil") {
return left
} ;
if ($target.type === "cons") {
let one = $target[0];
let rest = $target[1];
return recur($co(loop(left)((left) => (recur) => (($target) => {
if ($target.type === "nil") {
return cons(one)(nil)
} ;
if ($target.type === "cons") {
let lone = $target[0];
let rest = $target[1];
{
let $target = predicate$slmerge(one)(lone);
if ($target.type === "some") {
let merged = $target[0];
return cons(merged)(rest)
} ;
if ($target.type === "none") {
return cons(lone)(recur(rest))
} ;
throw new Error('match fail 16847:' + JSON.stringify($target))
}
} ;
throw new Error('match fail 16835:' + JSON.stringify($target))
})(left)))(rest))
} ;
throw new Error('match fail 16816:' + JSON.stringify($target))
})(right))
let pred_contains = (free) => ({"2": loc, "1": cls, "0": type}) => type$slmatches_free(free)(type)
let name_for_instance = (type) => (cls) => `\$_inst_${type_to_js_id(type)}\$${cls}`
let merge = (s1) => (s2) => (l) => {
let agree = all((v) => $eq(type$slapply(s1)(tvar(v)(l)))(type$slapply(s2)(tvar(v)(l))))(set$slto_list(set$sloverlap(set$slfrom_list(map$slkeys(s1)))(set$slfrom_list(map$slkeys(s2)))));
{
let $target = agree;
if ($target === true) {
return map$slmerge(s1)(s2)
} ;
return fatal("merge failed");
throw new Error('match fail 18832:' + JSON.stringify($target))
}
}
let tss_$gts = (tss) => joinor("\n")("no tss")(map(dot(joinor("; ")("[empty]"))(map(type_$gts)))(tss))
let vps_$gts = (vps) => joinor("\n")("no vps")(map(({"1": preds, "0": a}) => `${a} is in predicates: ${join(";")(map(pred_$gts)(preds))}`)(vps))
let without = (base) => (remove) => (x$eq) => filter((x) => not(contains(remove)(x)(x$eq)))(base)
let pred_$gtcst = ({"1": name, "0": t}) => cst$sllist(cons(cst$slid("isin")(-1))(cons(type_$gtcst(t))(cons(cst$slstring("name")(nil)(-1))(nil))))(-1)
let terr = (v0) => (v1) => ({type: "terr", 0: v0, 1: v1})
let ttypes = (v0) => (v1) => ({type: "ttypes", 0: v0, 1: v1})
let twrap = (v0) => (v1) => ({type: "twrap", 0: v0, 1: v1})
let tmissing = (v0) => ({type: "tmissing", 0: v0})
let scheme$slfree = ({"1": type, "0": vbls}) => set$sldiff(qual$slfree(type)(type$slfree))(vbls)
let tenv$slfree = ({"0": values}) => foldr(set$slnil)(map(scheme$slfree)(map$slvalues(values)))(set$slmerge)
let scheme$slapply = (subst) => ({"1": qualified_type, "0": vbls}) => forall(vbls)(qual$slapply(type$slapply)(map_without(subst)(vbls))(qualified_type))
let generalize = (tenv) => (qual) => forall(set$sldiff(qual$slfree(qual)(type$slfree))(tenv$slfree(tenv)))(qual)
let instantiate = ({"1": qual, "0": vars}) => (l) => $gt$gt$eq(make_subst_for_free(vars)(l))((subst) => $gt$gt$eq($lt_(qual$slapply(type$slapply)(subst)(qual)))(({"1": t, "0": preds}) => $gt$gt$eq(preds_$gt(mapi(predicate$slreloc(l))(preds)))((_1869) => $lt_(t))))
let infer$slprim = (prim) => (($target) => {
if ($target.type === "pint") {
let l = $target[1];
return $gt$gt$eq(new_type_var("number")(l))((tv) => $gt$gt$eq(preds_$gt(cons(isin(tv)("number")(cons(oloc(l)(0))(nil)))(nil)))((_15373) => $lt_(tv)))
} ;
if ($target.type === "pfloat") {
let l = $target[1];
return $gt$gt$eq(new_type_var("floating")(l))((tv) => $gt$gt$eq(preds_$gt(cons(isin(tv)("floating")(cons(oloc(l)(0))(nil)))(nil)))((_15402) => $lt_(tv)))
} ;
if ($target.type === "pbool") {
let l = $target[1];
return $lt_(tcon("bool")(l))
} ;
throw new Error('match fail 2221:' + JSON.stringify($target))
})(prim)
let add$sldeftype = ({"3": aliases, "2": types, "1": tcons}) => (name) => (args) => (constrs) => (l) => {
let free = map(fst)(args);
{
let free_set = set$slfrom_list(free);
{
let res = foldl(tcon(name)(l))(args)((inner) => ({"1": l, "0": name}) => tapp(inner)(tvar(name)(l))(l));
{
let parsed_constrs = map(({"1": {"1": {"0": args}}, "0": name}) => {
let args$0 = args;
{
let args = map(type$slcon_to_var(free_set))(args$0);
{
let args$0 = args;
{
let args = map(type$slresolve_aliases(aliases))(args$0);
return $co(name)($co(free)($co(args)(res)))
}
}
}
})(constrs);
return tenv(map$slfrom_list(map(({"1": {"1": {"1": res, "0": args}, "0": free}, "0": name}) => $co(name)(forall(set$slfrom_list(free))($eq$gt(nil)(tfns(args)(res)(l)))))(parsed_constrs)))(map$slfrom_list(parsed_constrs))(map$slset(map$slnil)(name)($co(length(args))(set$slfrom_list(map(fst)(constrs)))))(map$slnil)(map$slnil)
}
}
}
}
let scope$slapply = (subst) => (scope) => map$slmap(scheme$slapply(subst))(scope)
let scope$slapply_$gt = apply_$gt(scope$slapply)
let scheme$slapply_$gt = apply_$gt(scheme$slapply)
let args_if_complete = (tenv) => (matrix) => {
let heads = map((row) => (($target) => {
if ($target.type === "nil") {
return fatal("is-complete called with empty row")
} ;
if ($target.type === "cons") {
let head = $target[0];
return head
} ;
throw new Error('match fail 10688:' + JSON.stringify($target))
})(row))(matrix);
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
let found = map$slfrom_list(fold_ex_pats(nil)(heads)((found) => (head) => (($target) => {
if ($target.type === "ex/constructor") {
let id = $target[0];
let args = $target[2];
return cons($co(id)(length(args)))(found)
} ;
return found;
throw new Error('match fail 11013:' + JSON.stringify($target))
})(head)));
{
let $target = group_constructors(tenv)(gid);
if ($target.type === "nil") {
return map$slnil
} ;
{
let constrs = $target;
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
};
throw new Error('match fail 10846:' + JSON.stringify($target))
}
}
} ;
throw new Error('match fail 10704:' + JSON.stringify($target))
}
}
}
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
let $lt_mismatch = (t1) => (t2) => $lt_err$ti(ttypes(forall(set$slnil)($eq$gt(nil)(t1)))(forall(set$slnil)($eq$gt(nil)(t2))))
let scheme_$gtcst = ({"1": {"1": type, "0": preds}}) => {
let t = type_$gtcst(type);
{
let $target = preds;
if ($target.type === "nil") {
return t
} ;
return cst$sllist(cons(cst$slid("=>")(-1))(cons(cst$slarray(map(pred_$gtcst)(preds))(-1))(cons(t)(nil))))(-1);
throw new Error('match fail 20712:' + JSON.stringify($target))
}
}
let with_preds = (preds) => ({"1": {"1": type, "0": p2}, "0": free}) => forall(free)($eq$gt(concat(cons(p2)(cons(filter(pred_contains(free))(preds))(nil))))(type))
let organize_predicates = (preds) => map$slmap((ol) => mapi((i) => ({"1": idx, "0": v}) => (($target) => {
if ($target === true) {
return fatal(`predicates out of order somehow: ${int_to_string(i)} ${int_to_string(idx)}`)
} ;
return v;
throw new Error('match fail 17784:' + JSON.stringify($target))
})($ex$eq(i)(idx)))(ol))(foldl(map$slnil)(preds)((by_loc) => ({"2": locs, "1": cls, "0": type}) => {
let instance_name = name_for_instance(type)(cls);
return foldl(by_loc)(locs)((by_loc) => ({"1": idx, "0": loc}) => (($target) => {
if ($target.type === "none") {
return map$slset(by_loc)(loc)(cons($co(instance_name)(idx))(nil))
} ;
if ($target.type === "some") {
let current = $target[0];
return map$slset(by_loc)(loc)(put_in_place(current)(instance_name)(idx))
} ;
throw new Error('match fail 17599:' + JSON.stringify($target))
})(map$slget(by_loc)(loc)))
}))
let type_match = (t1) => (t2) => (($target) => {
if ($target.type === ",") {
if ($target[0].type === "tapp") {
let l = $target[0][0];
let r = $target[0][1];
let loc = $target[0][2];
if ($target[1].type === "tapp") {
let l$qu = $target[1][0];
let r$qu = $target[1][1];
{
let $target = type_match(l)(l$qu);
if ($target.type === "ok") {
let sl = $target[0];
{
let $target = type_match(r)(r$qu);
if ($target.type === "ok") {
let sr = $target[0];
return ok(merge(sl)(sr)(loc))
} ;
{
let err = $target;
return err
};
throw new Error('match fail 18670:' + JSON.stringify($target))
}
} ;
{
let err = $target;
return err
};
throw new Error('match fail 18661:' + JSON.stringify($target))
}
} 
} 
} ;
if ($target.type === ",") {
if ($target[0].type === "tvar") {
let u = $target[0][0];
let t = $target[1];
return ok(map$slset(map$slnil)(u)(t))
} 
} ;
if ($target.type === ",") {
if ($target[0].type === "tcon") {
let tc1 = $target[0][0];
if ($target[1].type === "tcon") {
let tc2 = $target[1][0];
{
let $target = $eq(tc1)(tc2);
if ($target === true) {
return ok(map$slnil)
} ;
return err($co(`Unable to match types ${tc1} and ${tc2}`)(nil));
throw new Error('match fail 18742:' + JSON.stringify($target))
}
} 
} 
} ;
return err($co(`Unable to match ${type_$gts(t1)} vs ${type_$gts(t2)}`)(nil));
throw new Error('match fail 18643:' + JSON.stringify($target))
})($co(t1)(t2))
let ok_$gt = (result) => (($target) => {
if ($target.type === "ok") {
let v = $target[0];
return $lt_(v)
} ;
if ($target.type === "err") {
let e = $target[0];
return $lt_err(e)
} ;
throw new Error('match fail 19842:' + JSON.stringify($target))
})(result)
let run_and_preds = (statet) => {
let {"1": result, "0": {"1": {"1": {"1": types, "0": preds}, "0": subst}, "0": idx}} = state_f(statet)(state$slnil);
return $co(err_to_fatal(result))(predicate$slcombine(map(predicate$slapply(subst))(bag$slto_list(preds))))
}
let tenv$slapply = (subst) => ({"4": typeclasses, "3": aliases, "2": types, "1": tcons, "0": values}) => tenv(scope$slapply(subst)(values))(tcons)(types)(aliases)(typeclasses)
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
return $lt_err(`Cycle found while unifying type with type variable. ${$var}`)
} ;
return $gt$gt$eq(subst_$gt(one_subst($var)(type)))((_2132) => $lt_($unit));
throw new Error('match fail 2115:' + JSON.stringify($target))
};
throw new Error('match fail 2081:' + JSON.stringify($target))
})(type)
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
let is_useful = (tenv) => (matrix) => (row) => {
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
return is_useful(tenv)(specialized_matrix(id)(length(args))(matrix))(concat(cons(args)(cons(rest)(nil))))
} ;
if ($target.type === "ex/any") {
{
let $target = map$slto_list(args_if_complete(tenv)(matrix));
if ($target.type === "nil") {
{
let $target = default_matrix(matrix);
if ($target.type === "nil") {
return true
} ;
{
let defaults = $target;
return is_useful(tenv)(defaults)(rest)
};
throw new Error('match fail 10407:' + JSON.stringify($target))
}
} ;
{
let alts = $target;
return any(({"1": alt, "0": id}) => is_useful(tenv)(specialized_matrix(id)(alt)(matrix))(concat(cons(any_list(alt))(cons(rest)(nil)))))(alts)
};
throw new Error('match fail 10395:' + JSON.stringify($target))
}
} ;
if ($target.type === "ex/or") {
let left = $target[0];
let right = $target[1];
{
let $target = is_useful(tenv)(matrix)(cons(left)(rest));
if ($target === true) {
return true
} ;
return is_useful(tenv)(matrix)(cons(right)(rest));
throw new Error('match fail 11134:' + JSON.stringify($target))
}
} ;
throw new Error('match fail 10381:' + JSON.stringify($target))
}
} 
} ;
throw new Error('match fail 11090:' + JSON.stringify($target))
}
}
let by_inst = (classes) => (pred) => {
let {"2": locs, "1": cls, "0": t} = pred;
{
let {"1": {"0": insts}} = (($target) => {
if ($target.type === "some") {
let s = $target[0];
return s
} ;
return fatal(`Unknown class '${cls}' in predicate [by-inst]`);
throw new Error('match fail 18324:' + JSON.stringify($target))
})(map$slget(classes)(cls));
return find_some(({"1": {"1": cls2, "0": t2}, "0": ps}) => (($target) => {
if ($target === true) {
return none
} ;
{
let $target = type_match(t2)(t);
if ($target.type === "err") {
return none
} ;
if ($target.type === "ok") {
let subst = $target[0];
return some(map(predicate$slapply(subst))(ps))
} ;
throw new Error('match fail 18350:' + JSON.stringify($target))
};
throw new Error('match fail 18878:' + JSON.stringify($target))
})($ex$eq(cls)(cls2)))(insts)
}
}
let entail = (classes) => (predicates) => (predicate) => (($target) => {
if ($target === true) {
return true
} ;
{
let $target = by_inst(classes)(predicate);
if ($target.type === "none") {
return false
} ;
if ($target.type === "some") {
let qs = $target[0];
return all(entail(classes)(predicates))(qs)
} ;
throw new Error('match fail 18396:' + JSON.stringify($target))
};
throw new Error('match fail 18380:' + JSON.stringify($target))
})(any(any(pred$eq(predicate)))(map(by_super(classes))(predicates)))
let candidates = (classes) => ({"1": qs, "0": v}) => {
let is = map(({"1": i}) => i)(qs);
{
let ts = map(({"0": t}) => t)(qs);
{
let $target = not(every(cons(all(type$eq(tvar(v)(-1)))(ts))(cons(any((x) => any($eq(x))(numClasses))(is))(cons(all((x) => any($eq(x))(stdClasses))(is))(nil))))((x) => x));
if ($target === true) {
return nil
} ;
return filter((t$qu) => all(entail(classes)(nil))(map((i) => isin(t$qu)(i)(nil))(is)))(default_types);
throw new Error('match fail 19224:' + JSON.stringify($target))
}
}
}
let simplify_inner = (ce) => (rs) => (preds) => (($target) => {
if ($target.type === "nil") {
return rs
} ;
if ($target.type === "cons") {
let p = $target[0];
let ps = $target[1];
{
let $target = entail(ce)(concat(cons(rs)(cons(ps)(nil))))(p);
if ($target === true) {
return simplify_inner(ce)(rs)(ps)
} ;
return simplify_inner(ce)(cons(p)(rs))(ps);
throw new Error('match fail 19649:' + JSON.stringify($target))
}
} ;
throw new Error('match fail 19640:' + JSON.stringify($target))
})(preds)
let simplify = (ce) => simplify_inner(ce)(nil)
let to_hnfs = (ce) => (ps) => (($target) => {
if ($target.type === "err") {
let e = $target[0];
return err(e)
} ;
if ($target.type === "ok") {
let v = $target[0];
return ok(concat(v))
} ;
throw new Error('match fail 19558:' + JSON.stringify($target))
})(map$slok(to_hnf(ce))(ps))

let to_hnf = (ce) => (p) => (($target) => {
if ($target === true) {
return ok(cons(p)(nil))
} ;
{
let $target = by_inst(ce)(p);
if ($target.type === "none") {
{
let {"1": name, "0": type} = p;
return err(`Can't find an instance for class '${name}' for type ${type_$gts(type)}`)
}
} ;
if ($target.type === "some") {
let ps = $target[0];
return to_hnfs(ce)(ps)
} ;
throw new Error('match fail 19596:' + JSON.stringify($target))
};
throw new Error('match fail 19587:' + JSON.stringify($target))
})(in_hnf(p))
let unify_inner = (t1) => (t2) => (l) => (($target) => {
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
if ($target[0].type === "tapp") {
let t1 = $target[0][0];
let a1 = $target[0][1];
if ($target[1].type === "tapp") {
let t2 = $target[1][0];
let a2 = $target[1][1];
return $gt$gt$eq(unify_inner(t1)(t2)(l))((_2047) => $gt$gt$eq($lt_subst)((subst) => $gt$gt$eq(unify_inner(type$slapply(subst)(a1))(type$slapply(subst)(a2))(l))((_2047) => $lt_($unit))))
} 
} 
} ;
return $lt_mismatch(t1)(t2);
throw new Error('match fail 1896:' + JSON.stringify($target))
})($co(t1)(t2))
let is_exhaustive = (tenv) => (matrix) => (($target) => {
if ($target === true) {
return false
} ;
return true;
throw new Error('match fail 10333:' + JSON.stringify($target))
})(is_useful(tenv)(matrix)(cons(ex$slany)(nil)))
let unify = (t1) => (t2) => (l) => map_err_$gt(unify_inner(t1)(t2)(l))((inner) => err(twrap(ttypes(forall(set$slnil)($eq$gt(nil)(t1)))(forall(set$slnil)($eq$gt(nil)(t2))))(inner)))
let with_defaults = (f) => (ce) => (known_variables) => (predicates) => {
let vps = ambiguities(known_variables)(predicates);
{
let tss = map(candidates(ce))(vps);
{
let $target = any(is_empty)(tss);
if ($target === true) {
return err(`Cannot resolve ambiguities: ${vps_$gts(vps)} defaults for variables: ${tss_$gts(tss)} with known variables: ${join("; ")(set$slto_list(known_variables))}`)
} ;
return ok(f(vps)(map(head)(tss)));
throw new Error('match fail 18982:' + JSON.stringify($target))
}
}
}
let reduce = (ce) => (ps) => (($target) => {
if ($target.type === "ok") {
let qs = $target[0];
return ok(simplify(ce)(qs))
} ;
if ($target.type === "err") {
let e = $target[0];
return err(e)
} ;
throw new Error('match fail 19703:' + JSON.stringify($target))
})(to_hnfs(ce)(ps))
let defaulted_preds = with_defaults((vps) => (ts) => concat(map(snd)(vps)))
let default_subst = with_defaults((vps) => (ts) => map$slfrom_list(zip(map(fst)(vps))(ts)))
let infer$slpattern = (tenv) => (pattern) => (($target) => {
if ($target.type === "pvar") {
let name = $target[0];
let l = $target[1];
return $gt$gt$eq(new_type_var(name)(l))((v) => $gt$gt$eq(record_type_$gt(v)(l)(false))((_4285) => $lt_($co(v)(map$slfrom_list(cons($co(name)(forall(set$slnil)($eq$gt(nil)(v))))(nil))))))
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
if ($target.type === "pprim") {
if ($target[0].type === "pfloat") {
let l = $target[1];
return $lt_($co(tcon("float")(l))(map$slnil))
} 
} ;
if ($target.type === "pcon") {
let name = $target[0];
let args = $target[2];
let l = $target[3];
return $gt$gt$eq(instantiate_tcon(tenv)(name)(l))(({"1": cres, "0": cargs}) => $gt$gt$eq(record_type_$gt(tfns(cargs)(cres)(l))(l)(false))((_4032) => $gt$gt$eq(map_$gt(infer$slpattern(tenv))(args))((sub_patterns) => $gt$gt$eq($lt_(unzip(sub_patterns)))(({"1": scopes, "0": arg_types}) => $gt$gt$eq(do_$gt(({"1": ctype, "0": ptype}) => unify(ptype)(ctype)(l))(zip(arg_types)(cargs)))((_4032) => $gt$gt$eq(type$slapply_$gt(cres))((cres) => $gt$gt$eq($lt_(foldl(map$slnil)(scopes)(map$slmerge)))((scope) => $lt_($co(cres)(scope)))))))))
} ;
throw new Error('match fail 3998:' + JSON.stringify($target))
})(pattern)
let check_exhaustiveness = (tenv) => (target_type) => (patterns) => (l) => $gt$gt$eq(type$slapply_$gt(target_type))((target_type) => $gt$gt$eq($lt_(map((pat) => cons(pattern_to_ex_pattern(tenv)($co(pat)(target_type)))(nil))(patterns)))((matrix) => (($target) => {
if ($target === true) {
return $lt_($unit)
} ;
return $lt_err(`Match not exhaustive ${int_to_string(l)}`);
throw new Error('match fail 9861:' + JSON.stringify($target))
})(is_exhaustive(tenv)(matrix))))
let split = (ce) => (free_in_scope) => (value_tyvars) => (ps) => $gt$gt$eq(ok_$gt(reduce(ce)(ps)))((ps$qu) => $gt$gt$eq($lt_(partition(ps$qu)(({"2": locs, "1": name, "0": type}) => every(set$slto_list(type$slfree(type)))((x) => any($eq(x))(free_in_scope)))))(({"1": rs, "0": ds}) => $gt$gt$eq(ok_$gt(defaulted_preds(ce)(set$slfrom_list(concat(cons(free_in_scope)(cons(value_tyvars)(nil)))))(rs)))((rs$qu) => $gt$gt$eq(ok_$gt(default_subst(ce)(set$slfrom_list(concat(cons(free_in_scope)(cons(value_tyvars)(nil)))))(rs)))((subst) => $lt_($co(ds)($co(without(rs)(rs$qu)(pred$eq))($co(map(predicate$slapply(subst))(rs$qu))(subst))))))))
let infer$slexpr_inner = (tenv) => (expr) => (($target) => {
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
return infer$slprim(prim)
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
return $gt$gt$eq(new_type_var(arg)(al))((arg_type) => $gt$gt$eq(record_type_$gt(arg_type)(al)(false))((_2727) => $gt$gt$eq($lt_(tenv$slwith_type(tenv)(arg)(forall(set$slnil)($eq$gt(nil)(arg_type)))))((bound_env) => $gt$gt$eq(infer$slexpr(bound_env)(body))((body_type) => $gt$gt$eq(type$slapply_$gt(arg_type))((arg_type) => $lt_(tfn(arg_type)(body_type)(l)))))))
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
return $gt$gt$eq(infer$slpattern(tenv)(pat))(({"1": scope, "0": arg_type}) => $gt$gt$eq($lt_(tenv$slwith_scope(tenv)(scope)))((bound_env) => $gt$gt$eq(infer$slexpr(bound_env)(body))((body_type) => $gt$gt$eq(type$slapply_$gt(arg_type))((arg_type) => $lt_(tfn(arg_type)(body_type)(l))))))
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
return $gt$gt$eq(new_type_var("result")(l))((result_var) => $gt$gt$eq(infer$slexpr(tenv)(target))((target_type) => $gt$gt$eq(tenv$slapply_$gt(tenv))((arg_tenv) => $gt$gt$eq(infer$slexpr(arg_tenv)(arg))((arg_type) => $gt$gt$eq(type$slapply_$gt(target_type))((target_type) => $gt$gt$eq(unify(target_type)(tfn(arg_type)(result_var)(l))(l))((_2428) => type$slapply_$gt(result_var)))))))
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
return $gt$gt$eq(infer$slexpr(tenv)(value))((value_type) => $gt$gt$eq(record_type_$gt(value_type)(nl)(false))((_2816) => $gt$gt$eq(tenv$slapply_$gt(tenv))((applied_env) => $gt$gt$eq($lt_(generalize(applied_env)($eq$gt(nil)(value_type))))((scheme) => $gt$gt$eq($lt_(tenv$slwith_type(applied_env)(name)(scheme)))((bound_env) => infer$slexpr(bound_env)(body))))))
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
return $gt$gt$eq(infer$slpattern(tenv)(pat))(({"1": scope, "0": type}) => $gt$gt$eq(infer$slexpr(tenv)(value))((value_type) => $gt$gt$eq(unify(type)(value_type)(l))((_3987) => $gt$gt$eq(scope$slapply_$gt(scope))((scope) => $gt$gt$eq($lt_(tenv$slwith_scope(tenv)(scope)))((bound_env) => $gt$gt$eq(infer$slexpr(bound_env)(body))((body_type) => $lt_(body_type)))))))
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

let infer$slexpr = (tenv) => (expr) => $gt$gt$eq(subst_reset_$gt(map$slnil))((old) => $gt$gt$eq(infer$slexpr_inner(tenv)(expr))((type) => $gt$gt$eq(subst_reset_$gt(old))(($new) => $gt$gt$eq(subst_$gt($new))((_2977) => $gt$gt$eq(record_type_$gt(type)(expr_loc(expr))(false))((_2977) => $lt_(type))))))
let add$sldefs = (tenv) => (defns) => $gt$gt$eq(reset_state_$gt)((_3545) => $gt$gt$eq($lt_(map(({"0": name}) => name)(defns)))((names) => $gt$gt$eq($lt_(map(({"1": {"1": {"1": l}}}) => l)(defns)))((locs) => $gt$gt$eq(map_$gt(({"1": {"0": nl}, "0": name}) => new_type_var(name)(nl))(defns))((vbls) => $gt$gt$eq($lt_(foldl(tenv)(zip(names)(map(forall(set$slnil))(map($eq$gt(nil))(vbls))))((tenv) => ({"1": vbl, "0": name}) => tenv$slwith_type(tenv)(name)(vbl))))((bound_env) => $gt$gt$eq(map_$gt(({"1": {"1": {"0": expr}}}) => infer$slexpr(bound_env)(expr))(defns))((types) => $gt$gt$eq(map_$gt(type$slapply_$gt)(vbls))((vbls) => $gt$gt$eq(do_$gt(({"1": {"1": loc, "0": type}, "0": vbl}) => unify(vbl)(type)(loc))(zip(vbls)(zip(types)(locs))))((_3545) => $gt$gt$eq(map_$gt(type$slapply_$gt)(types))((types) => $gt$gt$eq($lt_subst)((subst) => $gt$gt$eq($lt_preds)((preds) => $gt$gt$eq($lt_(predicate$slcombine(map(predicate$slapply(subst))(bag$slto_list(preds)))))((preds) => $gt$gt$eq($lt_(tenv))(({"4": class_env}) => $gt$gt$eq(split(class_env)(nil)((($target) => {
if ($target === true) {
return set$slto_list(foldl(set$slnil)(map(type$slfree)(types))(set$slmerge))
} ;
return nil;
throw new Error('match fail 23745:' + JSON.stringify($target))
})(all(({"1": {"1": {"0": body}}}) => (($target) => {
if ($target.type === "elambda") {
return true
} ;
return false;
throw new Error('match fail 23759:' + JSON.stringify($target))
})(body))(defns)))(preds))(({"1": {"1": {"1": subst2, "0": defaulted_preds}, "0": other_preds}, "0": free_preds}) => $gt$gt$eq(preds_$gt(defaulted_preds))((_3545) => $gt$gt$eq(subst_$gt(subst2))((_3545) => $gt$gt$eq($lt_(map(type$slapply(subst2))(types)))((types) => $lt_(foldl(tenv$slnil)(zip(names)(types))((tenv) => ({"1": type, "0": name}) => tenv$slwith_type(tenv)(name)(with_preds(other_preds)(generalize(tenv)($eq$gt(nil)(type)))))))))))))))))))))))
let add$sldef = (tenv) => (name) => (nl) => (expr) => (l) => $gt$gt$eq(new_type_var(name)(nl))((self) => $gt$gt$eq($lt_(tenv$slwith_type(tenv)(name)(forall(set$slnil)($eq$gt(nil)(self)))))((bound_env) => $gt$gt$eq(infer$slexpr(bound_env)(expr))((type) => $gt$gt$eq(type$slapply_$gt(self))((self) => $gt$gt$eq(unify(self)(type)(l))((_5246) => $gt$gt$eq(type$slapply_$gt(type))((type) => $gt$gt$eq($lt_subst)((subst) => $gt$gt$eq($lt_preds)((preds) => $lt_(tenv$slwith_type(tenv$slnil)(name)(generalize(tenv)($eq$gt(map(predicate$slapply(subst))(bag$slto_list(preds)))(type))))))))))))
let infer_expr2 = (env) => (expr) => {
let {"1": result, "0": {"1": {"1": {"1": types, "0": preds}, "0": subst}}} = state_f(infer$slexpr(env)(expr))(state$slnil);
return $co((($target) => {
if ($target.type === "ok") {
let t = $target[0];
return ok(forall(set$slnil)($eq$gt(map(predicate$slapply(subst))(bag$slto_list(preds)))(t)))
} ;
if ($target.type === "err") {
let e = $target[0];
return err(e)
} ;
throw new Error('match fail 12754:' + JSON.stringify($target))
})(result))($co(map(({"1": {"1": dont_apply, "0": l}, "0": t}) => (($target) => {
if ($target === true) {
return $co(l)(forall(set$slnil)($eq$gt(nil)(t)))
} ;
return $co(l)(forall(set$slnil)($eq$gt(nil)(type$slapply(subst)(t))));
throw new Error('match fail 13537:' + JSON.stringify($target))
})(dont_apply))(types))($co(nil)(nil)))
}
let add$slexpr = (tenv) => (expr) => $gt$gt$eq(infer$slexpr(tenv)(expr))((t) => $gt$gt$eq($lt_preds)((preds) => $gt$gt$eq($lt_(tenv))(({"4": class_env}) => $gt$gt$eq($lt_subst)((subst) => $gt$gt$eq($lt_(predicate$slcombine(map(predicate$slapply(subst))(bag$slto_list(preds)))))((preds) => $gt$gt$eq(split(class_env)(nil)(nil)(preds))(({"1": {"1": {"1": subst2, "0": defaulted_preds}, "0": other_preds}, "0": free_preds}) => $gt$gt$eq(preds_$gt(defaulted_preds))((_17856) => $gt$gt$eq(subst_$gt(subst2))((_17856) => $lt_(type$slapply(subst2)(t))))))))))
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
let add$slstmts = (tenv) => (stmts) => $gt$gt$eq($lt_(split_stmts(stmts)))(({"1": {"1": {"1": others, "0": exprs}, "0": aliases}, "0": defs}) => $gt$gt$eq(add$sldefs(tenv)(defs))((denv) => $gt$gt$eq(foldl_$gt(denv)(concat(cons(aliases)(cons(others)(nil))))((env) => (stmt) => $gt$gt$eq(add$slstmt(tenv$slmerge(tenv)(env))(stmt))((env$qu) => $lt_(tenv$slmerge(env)(env$qu)))))((final) => $gt$gt$eq(map_$gt(add$slexpr(tenv$slmerge(tenv)(final)))(exprs))((types) => $lt_($co(final)(types))))))
let benv_with_pair = tenv$slmerge(builtin_env)(fst(err_to_fatal(run$slnil_$gt(add$slstmts(builtin_env)(cons({"0":",","1":12710,"2":{"0":{"0":"a","1":12711,"type":","},"1":{"0":{"0":"b","1":12712,"type":","},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"3":{"0":{"0":",","1":{"0":12714,"1":{"0":{"0":{"0":"a","1":12715,"type":"tcon"},"1":{"0":{"0":"b","1":12716,"type":"tcon"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"1":12713,"type":","},"type":","},"type":","},"1":{"type":"nil"},"type":"cons"},"4":12707,"type":"tdeftype"})(cons({"0":"list","1":12722,"2":{"0":{"0":"a","1":12723,"type":","},"1":{"type":"nil"},"type":"cons"},"3":{"0":{"0":"nil","1":{"0":12725,"1":{"0":{"type":"nil"},"1":12724,"type":","},"type":","},"type":","},"1":{"0":{"0":"cons","1":{"0":12727,"1":{"0":{"0":{"0":"a","1":12728,"type":"tcon"},"1":{"0":{"0":{"0":"list","1":12730,"type":"tcon"},"1":{"0":"a","1":12731,"type":"tcon"},"2":12729,"type":"tapp"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"1":12726,"type":","},"type":","},"type":","},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"4":12719,"type":"tdeftype"})(nil)))))))
let infer_stmts3 = (env) => (stmts) => {
let {"1": result, "0": {"1": {"1": {"1": types, "0": preds}, "0": subst}}} = state_f(add$slstmts(env)(stmts))(state$slnil);
{
let preds$0 = preds;
{
let preds = predicate$slcombine(map(predicate$slapply(subst))(bag$slto_list(preds$0)));
{
let preds_by_vbl = foldl(map$slnil)(preds)((map) => (pred) => foldl(map)(set$slto_list(predicate$slfree(pred)))((map) => (v) => (($target) => {
if ($target.type === "none") {
return map$slset(map)(v)(cons(pred)(nil))
} ;
if ($target.type === "some") {
let preds = $target[0];
return map$slset(map)(v)(cons(pred)(preds))
} ;
throw new Error('match fail 20629:' + JSON.stringify($target))
})(map$slget(map)(v))));
return $co((($target) => {
if ($target.type === "err") {
let e = $target[0];
return err(e)
} ;
if ($target.type === "ok") {
if ($target[0].type === ",") {
let tenv = $target[0][0];
let types = $target[0][1];
return ok($co(tenv)(map(forall(set$slnil))(map($eq$gt(nil))(types))))
} 
} ;
throw new Error('match fail 13208:' + JSON.stringify($target))
})(result))($co(map(({"1": {"1": dont_apply, "0": l}, "0": t}) => (($target) => {
if ($target === true) {
return $co(l)(forall(set$slnil)($eq$gt(nil)(t)))
} ;
return $co(l)(forall(set$slnil)($eq$gt(predicate$slcombine(concat(map(dot(none_to(nil))(map$slget(preds_by_vbl)))(set$slto_list(type$slfree(t))))))(type$slapply(subst)(t))));
throw new Error('match fail 12961:' + JSON.stringify($target))
})(dont_apply))(types))(organize_predicates(preds)))
}
}
}
}
return eval("env_nil => add_stmt => get_type => type_to_string => type_to_cst => infer_stmts3 => infer2 =>\n  ({type: 'fns', env_nil, add_stmt, get_type, type_to_string, type_to_cst, infer_stmts3, infer2})\n")(builtin_env)(tenv$slmerge)(tenv$slresolve)(scheme_$gts)(scheme_$gtcst)(infer_stmts3)(infer_expr2)