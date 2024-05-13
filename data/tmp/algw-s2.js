const pint = (v0) => (v1) => ({type: "pint", 0: v0, 1: v1})
const pbool = (v0) => (v1) => ({type: "pbool", 0: v0, 1: v1})
const tvar = (v0) => (v1) => ({type: "tvar", 0: v0, 1: v1})
const tapp = (v0) => (v1) => (v2) => ({type: "tapp", 0: v0, 1: v1, 2: v2})
const tcon = (v0) => (v1) => ({type: "tcon", 0: v0, 1: v1})
const cons = (v0) => (v1) => ({type: "cons", 0: v0, 1: v1})
const nil = ({type: "nil"})
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

const forall = (v0) => (v1) => ({type: "forall", 0: v0, 1: v1})
const tenv = (v0) => (v1) => (v2) => (v3) => ({type: "tenv", 0: v0, 1: v1, 2: v2, 3: v3})
const tenv$slwith_type = ({3: aliases, 2: types, 1: tcons, 0: values}) => (name) => (scheme) => tenv(map$slset(values)(name)(scheme))(tcons)(types)(aliases);

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

const demo_new_subst = map$slfrom_list(cons($co("a")(tcon("a-mapped")(-1)))(cons($co("b")(tvar("c")(-1)))(nil)));

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

const subst_reset_$gt = (new_subst) => $gt$gt$eq($lt_state)(({1: old_subst, 0: idx}) => $gt$gt$eq(state_$gt($co(idx)(new_subst)))((_) => $lt_(old_subst)));

const state$slnil = $co(0)(map$slnil);

const run$slnil_$gt = (st) => run_$gt(st)(state$slnil);

const new_type_var = (name) => (l) => $gt$gt$eq($lt_next_idx)((nidx) => $lt_(tvar(`${name}:${int_to_string(nidx)}`)(l)));

const make_subst_for_free = (vars) => (l) => $gt$gt$eq(map_$gt((id) => $gt$gt$eq(new_type_var(id)(l))((new_var) => $lt_($co(id)(new_var))))(set$slto_list(vars)))((mapping) => $lt_(map$slfrom_list(mapping)));

const one_subst = ($var) => (type) => map$slfrom_list(cons($co($var)(type))(nil));

const apply_$gt = (f) => (arg) => $gt$gt$eq($lt_subst)((subst) => $lt_(f(subst)(arg)));

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

const tenv$slresolve = ({0: values}) => (name) => map$slget(values)(name);

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

const loop = (v) => (f) => f(v)((nv) => loop(nv)(f));

const tenv$slmerge = ({3: a1, 2: t1, 1: c1, 0: v1}) => ({3: a2, 2: t2, 1: c2, 0: v2}) => tenv(map$slmerge(v1)(v2))(map$slmerge(c1)(c2))(map$slmerge(t1)(t2))(map$slmerge(a1)(a2));

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

const builtin_env = ((k) => ((v) => ((v2) => ((kv) => ((kk) => ((a) => ((b) => tenv(map$slfrom_list(cons($co("+")(concrete(tfns(cons(tint)(cons(tint)(nil)))(tint)(-1))))(cons($co("-")(concrete(tfns(cons(tint)(cons(tint)(nil)))(tint)(-1))))(cons($co(">")(concrete(tfns(cons(tint)(cons(tint)(nil)))(tbool)(-1))))(cons($co("<")(concrete(tfns(cons(tint)(cons(tint)(nil)))(tbool)(-1))))(cons($co("=")(generic(cons("k")(nil))(tfns(cons(k)(cons(k)(nil)))(tbool)(-1))))(cons($co("!=")(generic(cons("k")(nil))(tfns(cons(k)(cons(k)(nil)))(tbool)(-1))))(cons($co(">=")(concrete(tfns(cons(tint)(cons(tint)(nil)))(tbool)(-1))))(cons($co("<=")(concrete(tfns(cons(tint)(cons(tint)(nil)))(tbool)(-1))))(cons($co("()")(concrete(tcon("()")(-1))))(cons($co(",")(generic(cons("a")(cons("b")(nil)))(tfns(cons(a)(cons(b)(nil)))(t$co(a)(b))(-1))))(cons($co("unescapeString")(concrete(tfns(cons(tstring)(nil))(tstring)(-1))))(cons($co("int-to-string")(concrete(tfns(cons(tint)(nil))(tstring)(-1))))(cons($co("string-to-int")(concrete(tfns(cons(tstring)(nil))(toption(tint))(-1))))(cons($co("string-to-float")(concrete(tfns(cons(tstring)(nil))(toption(tcon("float")(-1)))(-1))))(cons($co("map/nil")(kv(tmap(k)(v))))(cons($co("map/set")(kv(tfns(cons(tmap(k)(v))(cons(k)(cons(v)(nil))))(tmap(k)(v))(-1))))(cons($co("map/rm")(kv(tfns(cons(tmap(k)(v))(cons(k)(nil)))(tmap(k)(v))(-1))))(cons($co("map/get")(kv(tfns(cons(tmap(k)(v))(cons(k)(nil)))(toption(v))(-1))))(cons($co("map/map")(generic(cons("k")(cons("v")(cons("v2")(nil))))(tfns(cons(tfns(cons(v)(nil))(v2)(-1))(cons(tmap(k)(v))(nil)))(tmap(k)(v2))(-1))))(cons($co("map/merge")(kv(tfns(cons(tmap(k)(v))(cons(tmap(k)(v))(nil)))(tmap(k)(v))(-1))))(cons($co("map/values")(kv(tfns(cons(tmap(k)(v))(nil))(tlist(v))(-1))))(cons($co("map/keys")(kv(tfns(cons(tmap(k)(v))(nil))(tlist(k))(-1))))(cons($co("set/nil")(kk(tset(k))))(cons($co("set/add")(kk(tfns(cons(tset(k))(cons(k)(nil)))(tset(k))(-1))))(cons($co("set/has")(kk(tfns(cons(tset(k))(cons(k)(nil)))(tbool)(-1))))(cons($co("set/rm")(kk(tfns(cons(tset(k))(cons(k)(nil)))(tset(k))(-1))))(cons($co("set/diff")(kk(tfns(cons(tset(k))(cons(tset(k))(nil)))(tset(k))(-1))))(cons($co("set/merge")(kk(tfns(cons(tset(k))(cons(tset(k))(nil)))(tset(k))(-1))))(cons($co("set/overlap")(kk(tfns(cons(tset(k))(cons(tset(k))(nil)))(tset(k))(-1))))(cons($co("set/to-list")(kk(tfns(cons(tset(k))(nil))(tlist(k))(-1))))(cons($co("set/from-list")(kk(tfns(cons(tlist(k))(nil))(tset(k))(-1))))(cons($co("map/from-list")(kv(tfns(cons(tlist(t$co(k)(v)))(nil))(tmap(k)(v))(-1))))(cons($co("map/to-list")(kv(tfns(cons(tmap(k)(v))(nil))(tlist(t$co(k)(v)))(-1))))(cons($co("jsonify")(generic(cons("v")(nil))(tfns(cons(tvar("v")(-1))(nil))(tstring)(-1))))(cons($co("valueToString")(generic(cons("v")(nil))(tfns(cons(vbl("v"))(nil))(tstring)(-1))))(cons($co("eval")(generic(cons("v")(nil))(tfns(cons(tcon("string")(-1))(nil))(vbl("v"))(-1))))(cons($co("errorToString")(generic(cons("v")(nil))(tfns(cons(tfns(cons(vbl("v"))(nil))(tstring)(-1))(cons(vbl("v"))(nil)))(tstring)(-1))))(cons($co("sanitize")(concrete(tfns(cons(tstring)(nil))(tstring)(-1))))(cons($co("replace-all")(concrete(tfns(cons(tstring)(cons(tstring)(cons(tstring)(nil))))(tstring)(-1))))(cons($co("fatal")(generic(cons("v")(nil))(tfns(cons(tstring)(nil))(vbl("v"))(-1))))(nil))))))))))))))))))))))))))))))))))))))))))(map$slfrom_list(cons($co("()")($co(nil)($co(nil)(tcon("()")(-1)))))(cons($co(",")($co(cons("a")(cons("b")(nil)))($co(cons(a)(cons(b)(nil)))(t$co(a)(b)))))(nil))))(map$slfrom_list(cons($co("int")($co(0)(set$slnil)))(cons($co("float")($co(0)(set$slnil)))(cons($co("string")($co(0)(set$slnil)))(cons($co("bool")($co(0)(set$slnil)))(cons($co("map")($co(2)(set$slnil)))(cons($co("set")($co(1)(set$slnil)))(cons($co("->")($co(2)(set$slnil)))(nil)))))))))(map$slnil))(vbl("b")))(vbl("a")))(generic(cons("k")(nil))))(generic(cons("k")(cons("v")(nil)))))(vbl("v2")))(vbl("v")))(vbl("k"));

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

const tenv$slwith_scope = ({3: aliases, 2: types, 1: tcons, 0: values}) => (scope) => tenv(map$slmerge(scope)(values))(tcons)(types)(aliases);

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

const ex$slany = ({type: "ex/any"})
const ex$slconstructor = (v0) => (v1) => (v2) => ({type: "ex/constructor", 0: v0, 1: v1, 2: v2})
const ex$slor = (v0) => (v1) => ({type: "ex/or", 0: v0, 1: v1})
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

const fold_ex_pats = (init) => (pats) => (f) => foldl(init)(pats)((init) => (pat) => fold_ex_pat(init)(pat)(f));

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

const tenv$slfree = ({0: values}) => foldr(set$slnil)(map(scheme$slfree)(map$slvalues(values)))(set$slmerge);

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

const compose_subst = (new_subst) => (old_subst) => map$slmerge(map$slmap(type$slapply(new_subst))(old_subst))(new_subst);

const generalize = (tenv) => (t) => forall(set$sldiff(type$slfree(t))(tenv$slfree(tenv)))(t);

const subst_$gt = (new_subst) => $gt$gt$eq($lt_state)(({1: subst, 0: idx}) => $gt$gt$eq(state_$gt($co(idx)(compose_subst(new_subst)(subst))))((_) => $lt_($unit)));

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

const type$slapply_$gt = apply_$gt(type$slapply);

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

const add$sltypealias = ({3: aliases, 2: types, 1: tcons, 0: values}) => (name) => (args) => (type) => tenv(map$slnil)(map$slnil)(map$slnil)(map$slset(map$slnil)(name)($co(map(fst)(args))(type$slcon_to_var(set$slfrom_list(map(fst)(args)))(type))));

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

const scheme$slapply = (subst) => ({1: type, 0: vbls}) => forall(vbls)(type$slapply(map_without(subst)(vbls))(type));

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

const tenv$slapply = (subst) => ({3: aliases, 2: types, 1: tcons, 0: values}) => tenv(scope$slapply(subst)(values))(tcons)(types)(aliases);

const tenv$slapply_$gt = apply_$gt(tenv$slapply);

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
return $gt$gt$eq(infer$slexpr(tenv)(target))((target_type) => $gt$gt$eq(new_type_var("match result")(l))((result_type) => $gt$gt$eq(map_$gt(({1: body, 0: pat}) => $gt$gt$eq(infer$slpattern(tenv)(pat))(({1: scope, 0: type}) => $gt$gt$eq(unify(type)(target_type)(l))((_) => $gt$gt$eq(scope$slapply_$gt(scope))((scope) => $gt$gt$eq($lt_(tenv$slwith_scope(tenv)(scope)))((bound_env) => infer$slexpr(bound_env)(body))))))(cases))((all_results) => $gt$gt$eq(do_$gt((one_result) => $gt$gt$eq($lt_subst)((subst) => unify(type$slapply(subst)(one_result))(type$slapply(subst)(result_type))(l)))(all_results))((_) => $gt$gt$eq(check_exhaustiveness(tenv)(target_type)(map(fst)(cases))(l))((_) => type$slapply_$gt(result_type))))))
}
}
throw new Error('Failed to match. ' + valueToString($target));
})(expr);


const infer$slexpr = (tenv) => (expr) => $gt$gt$eq(subst_reset_$gt(map$slnil))((old) => $gt$gt$eq(infer$slexpr_inner(tenv)(expr))((type) => $gt$gt$eq(subst_reset_$gt(old))(($new) => $gt$gt$eq(subst_$gt($new))((_) => $lt_(type)))));

const add$sldefs = (tenv) => (defns) => run$slnil_$gt($gt$gt$eq($lt_(map(({0: name}) => name)(defns)))((names) => $gt$gt$eq($lt_(map(({1: {1: {1: l}}}) => l)(defns)))((locs) => $gt$gt$eq(map_$gt(({1: {0: nl}, 0: name}) => new_type_var(name)(nl))(defns))((vbls) => $gt$gt$eq($lt_(foldl(tenv)(zip(names)(map(forall(set$slnil))(vbls)))((tenv) => ({1: vbl, 0: name}) => tenv$slwith_type(tenv)(name)(vbl))))((bound_env) => $gt$gt$eq(map_$gt(({1: {1: {0: expr}}}) => infer$slexpr(bound_env)(expr))(defns))((types) => $gt$gt$eq(map_$gt(type$slapply_$gt)(vbls))((vbls) => $gt$gt$eq(do_$gt(({1: {1: loc, 0: type}, 0: vbl}) => unify(vbl)(type)(loc))(zip(vbls)(zip(types)(locs))))((_) => $gt$gt$eq(map_$gt(type$slapply_$gt)(types))((types) => $lt_(foldl(tenv$slnil)(zip(names)(types))((tenv) => ({1: type, 0: name}) => tenv$slwith_type(tenv)(name)(generalize(tenv)(type)))))))))))));

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

const add$slstmts = (tenv) => (stmts) => (({1: {1: others, 0: aliases}, 0: defs}) => ((denv) => ((final) => final)(foldl(denv)(concat(cons(aliases)(cons(others)(nil))))((env) => (stmt) => tenv$slmerge(env)(add$slstmt(tenv$slmerge(tenv)(env))(stmt)))))(add$sldefs(tenv)(defs)))(split_stmts(stmts));

return eval("env_nil => add_stmt => get_type => type_to_string => infer_stmts => infer =>\n  ({type: 'fns', env_nil, add_stmt, get_type, type_to_string, infer_stmts, infer})\n")(builtin_env)(tenv$slmerge)(tenv$slresolve)(scheme_$gts)(add$slstmts)((env) => (expr) => forall(set$slnil)(run$slnil_$gt(infer$slexpr(env)(expr))))