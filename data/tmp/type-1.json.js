const ast = "# AST";

const eprim = (v0) => (v1) => ({type: "eprim", 0: v0, 1: v1});
const estr = (v0) => (v1) => (v2) => ({type: "estr", 0: v0, 1: v1, 2: v2});
const evar = (v0) => (v1) => ({type: "evar", 0: v0, 1: v1});
const equot = (v0) => (v1) => ({type: "equot", 0: v0, 1: v1});
const equotquot = (v0) => (v1) => ({type: "equotquot", 0: v0, 1: v1});
const elambda = (v0) => (v1) => (v2) => (v3) => ({type: "elambda", 0: v0, 1: v1, 2: v2, 3: v3});
const eapp = (v0) => (v1) => (v2) => ({type: "eapp", 0: v0, 1: v1, 2: v2});
const ematch = (v0) => (v1) => (v2) => ({type: "ematch", 0: v0, 1: v1, 2: v2});
const pint = (v0) => (v1) => ({type: "pint", 0: v0, 1: v1});
const pbool = (v0) => (v1) => ({type: "pbool", 0: v0, 1: v1});
const pany = (v0) => ({type: "pany", 0: v0});
const pvar = (v0) => (v1) => ({type: "pvar", 0: v0, 1: v1});
const pcon = (v0) => (v1) => (v2) => ({type: "pcon", 0: v0, 1: v1, 2: v2});
const pstr = (v0) => (v1) => ({type: "pstr", 0: v0, 1: v1});
const pprim = (v0) => (v1) => ({type: "pprim", 0: v0, 1: v1});
const tvar = (v0) => (v1) => ({type: "tvar", 0: v0, 1: v1});
const tapp = (v0) => (v1) => (v2) => ({type: "tapp", 0: v0, 1: v1, 2: v2});
const tcon = (v0) => (v1) => ({type: "tcon", 0: v0, 1: v1});
const sdeftype = (v0) => (v1) => (v2) => ({type: "sdeftype", 0: v0, 1: v1, 2: v2});
const sdef = (v0) => (v1) => (v2) => ({type: "sdef", 0: v0, 1: v1, 2: v2});
const sexpr = (v0) => (v1) => ({type: "sexpr", 0: v0, 1: v1});
const type_to_string = (t) => (($target) => {
if ($target.type === "tvar") {
{
let s = $target[0];
return s
}
}
if ($target.type === "tcon") {
{
let s = $target[0];
return s
}
}
if ($target.type === "tapp") {
if ($target[0].type === "tapp") {
if ($target[0][0].type === "tcon") {
if ($target[0][0][0] === "->"){
{
let a = $target[0][1];
{
let b = $target[1];
return `(${type_to_string(a)}) -> ${type_to_string(b)}`
}
}
}
}
}
}
if ($target.type === "tapp") {
{
let a = $target[0];
{
let b = $target[1];
return `(${type_to_string(a)} ${type_to_string(b)})`
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 2105');})(t);

const prelude = "# Prelude";

const map = (values) => (f) => (($target) => {
if ($target.type === "nil") {
return nil
}
if ($target.type === "cons") {
{
let one = $target[0];
{
let rest = $target[1];
return cons(f(one))(map(rest)(f))
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 1012');})(values);

const mapi = (i) => (values) => (f) => (($target) => {
if ($target.type === "nil") {
return nil
}
if ($target.type === "cons") {
{
let one = $target[0];
{
let rest = $target[1];
return cons(f(i)(one))(mapi($pl(1)(i))(rest)(f))
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 1042');})(values);

const foldl = (init) => (items) => (f) => (($target) => {
if ($target.type === "nil") {
return init
}
if ($target.type === "cons") {
{
let one = $target[0];
{
let rest = $target[1];
return foldl(f(init)(one))(rest)(f)
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 1077');})(items);

const foldr = (init) => (items) => (f) => (($target) => {
if ($target.type === "nil") {
return init
}
if ($target.type === "cons") {
{
let one = $target[0];
{
let rest = $target[1];
return f(foldr(init)(rest)(f))(one)
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 1114');})(items);

const scheme = (v0) => (v1) => ({type: "scheme", 0: v0, 1: v1});
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
{
let b = $target[1];
return set$slmerge(type_free(a))(type_free(b))
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 761');})(type);

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
throw new Error('failed to match ' + jsonify($target) + '. Loc: 854');})(map$slget(subst)(n))
}
}
if ($target.type === "tapp") {
{
let a = $target[0];
{
let b = $target[1];
{
let c = $target[2];
return tapp(type_apply(subst)(a))(type_apply(subst)(b))(c)
}
}
}
}
return type
throw new Error('failed to match ' + jsonify($target) + '. Loc: 847');})(type);

const scheme_free = ($fn_arg) => (($target) => {
if ($target.type === "scheme") {
{
let vbls = $target[0];
{
let type = $target[1];
return set$slrm(type_free(type))(vbls)
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 888');})($fn_arg);

const scheme_apply = (subst) => ($fn_arg) => (($target) => {
if ($target.type === "scheme") {
{
let vbls = $target[0];
{
let type = $target[1];
return scheme(vbls)(type_apply(map_without(subst)(vbls))(type))
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 905');})($fn_arg);

const compose_subst = (s1) => (s2) => map$slmerge(map$slmap(type_apply(s1))(s2))(s1);

const remove = (tenv) => ($var) => map$slrm(tenv)($var);

const tenv_free = (tenv) => foldr(set$slnil)(map(map$slvalues(tenv))(type_free))(set$slmerge);

const tenv_apply = (subst) => (tenv) => map$slmap(type_apply(subst))(tenv);

const generalize = (tenv) => (t) => scheme(set$sldiff(type_free(t))(tenv_free(tenv)))(t);

const new_type_var = (prefix) => (nidx) => $co(tvar(`${prefix}:${nidx}`)(-1))($pl(1)(nidx));

const free_for_vars = (vars) => (coll) => (nidx) => (($target) => {
if ($target.type === "nil") {
return $co(coll)(nidx)
}
if ($target.type === "cons") {
{
let v = $target[0];
{
let rest = $target[1];
return (() => {const $target = new_type_var(v)(nidx);
if ($target.type === ",") {
{
let vn = $target[0];
{
let nidx = $target[1];
return free_for_vars(rest)(map$slset(coll)(v)(vn))(nidx)
}
}
};
throw new Error('let pattern not matched 1751. ' + valueToString($target));})()
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 1219');})(vars);

const instantiate = ($fn_arg) => (($target) => {
if ($target.type === "scheme") {
{
let vars = $target[0];
{
let t = $target[1];
return (nidx) => (() => {const $target = free_for_vars(set$slto_list(vars))(map$slnil)(nidx);
if ($target.type === ",") {
{
let subst = $target[0];
{
let nidx = $target[1];
return $co(type_apply(subst)(t))(nidx)
}
}
};
throw new Error('let pattern not matched 1285. ' + valueToString($target));})()
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 1136');})($fn_arg);

const mgu = (t1) => (t2) => (nidx) => (($target) => {
if ($target.type === ",") {
if ($target[0].type === "tapp") {
{
let l = $target[0][0];
{
let r = $target[0][1];
if ($target[1].type === "tapp") {
{
let l$qu = $target[1][0];
{
let r$qu = $target[1][1];
return (() => {const $target = mgu(l)(l$qu)(nidx);
if ($target.type === ",") {
{
let s1 = $target[0];
{
let nidx = $target[1];
return (() => {const $target = mgu(type_apply(s1)(r))(type_apply(s1)(r$qu))(nidx);
if ($target.type === ",") {
{
let s2 = $target[0];
{
let nidx = $target[1];
return $co(compose_subst(s1)(s2))(nidx)
}
}
};
throw new Error('let pattern not matched 1485. ' + valueToString($target));})()
}
}
};
throw new Error('let pattern not matched 1476. ' + valueToString($target));})()
}
}
}
}
}
}
}
if ($target.type === ",") {
if ($target[0].type === "tvar") {
{
let u = $target[0][0];
{
let t = $target[1];
return $co(var_bind(u)(t))(nidx)
}
}
}
}
if ($target.type === ",") {
{
let t = $target[0];
if ($target[1].type === "tvar") {
{
let u = $target[1][0];
return $co(var_bind(u)(t))(nidx)
}
}
}
}
if ($target.type === ",") {
if ($target[0].type === "tcon") {
{
let a = $target[0][0];
if ($target[1].type === "tcon") {
{
let b = $target[1][0];
return (($target) => {
if ($target === true) {
return $co(map$slnil)(nidx)
}
return fatal("cant unify")
throw new Error('failed to match ' + jsonify($target) + '. Loc: 1541');})($eq(a)(b))
}
}
}
}
}
return fatal(`cant unify ${valueToString(t1)} ${valueToString(t2)}`)
throw new Error('failed to match ' + jsonify($target) + '. Loc: 1317');})($co(t1)(t2));

const var_bind = (u) => (t) => (($target) => {
if ($target.type === "tvar") {
{
let v = $target[0];
return (($target) => {
if ($target === true) {
return map$slnil
}
return map$slset(map$slnil)(u)(t)
throw new Error('failed to match ' + jsonify($target) + '. Loc: 1582');})($eq(u)(v))
}
}
return (($target) => {
if ($target === true) {
return fatal("occurs check")
}
return map$slset(map$slnil)(u)(t)
throw new Error('failed to match ' + jsonify($target) + '. Loc: 1597');})(set$slhas(type_free(t))(u))
throw new Error('failed to match ' + jsonify($target) + '. Loc: 1575');})(t);

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
throw new Error('failed to match ' + jsonify($target) + '. Loc: 1633');})(prim);

const tfn = (a) => (b) => (l) => tapp(tapp(tcon("->")(l))(a)(l))(b)(l);

const t_expr = (tenv) => (expr) => (nidx) => (($target) => {
if ($target.type === "evar") {
{
let n = $target[0];
{
let l = $target[1];
return (($target) => {
if ($target.type === "none") {
return fatal(`Unbound variable ${n}`)
}
if ($target.type === "some") {
{
let found = $target[0];
return (() => {const $target = instantiate(found)(nidx);
if ($target.type === ",") {
{
let t = $target[0];
{
let nidx = $target[1];
return $co$co(map$slnil)(t)(nidx)
}
}
};
throw new Error('let pattern not matched 1693. ' + valueToString($target));})()
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 1671');})(map$slget(tenv)(n))
}
}
}
if ($target.type === "eprim") {
{
let prim = $target[0];
return $co$co(map$slnil)(t_prim(prim))(nidx)
}
}
if ($target.type === "elambda") {
{
let name = $target[0];
{
let nl = $target[1];
{
let body = $target[2];
{
let l = $target[3];
return (() => {const $target = new_type_var(name)(nidx);
if ($target.type === ",") {
{
let tv = $target[0];
{
let nidx = $target[1];
return (() => {const $target = map$slrm(tenv)(name);
{
let env$qu = $target;
return (() => {const $target = map$slmerge(env$qu)(map$slset(map$slnil)(name)(scheme(set$slnil)(tv)));
{
let env$qu$qu = $target;
return (() => {const $target = t_expr(env$qu$qu)(body)(nidx);
if ($target.type === ",,") {
{
let s1 = $target[0];
{
let t1 = $target[1];
{
let nidx = $target[2];
return $co$co(s1)(tfn(type_apply(s1)(tv))(t1)(l))(nidx)
}
}
}
};
throw new Error('let pattern not matched 1784. ' + valueToString($target));})()
};
throw new Error('let pattern not matched 1772. ' + valueToString($target));})()
};
throw new Error('let pattern not matched 1767. ' + valueToString($target));})()
}
}
};
throw new Error('let pattern not matched 1726. ' + valueToString($target));})()
}
}
}
}
}
if ($target.type === "eapp") {
{
let target = $target[0];
{
let arg = $target[1];
{
let l = $target[2];
return (() => {const $target = new_type_var("a")(nidx);
if ($target.type === ",") {
{
let tv = $target[0];
{
let nidx = $target[1];
return (() => {const $target = t_expr(tenv)(target)(nidx);
if ($target.type === ",,") {
{
let s1 = $target[0];
{
let t1 = $target[1];
{
let nidx = $target[2];
return (() => {const $target = t_expr(tenv_apply(s1)(tenv))(arg)(nidx);
if ($target.type === ",,") {
{
let s2 = $target[0];
{
let t2 = $target[1];
{
let nidx = $target[2];
return (() => {const $target = mgu(type_apply(s2)(t1))(tfn(t2)(tv)(l))(nidx);
if ($target.type === ",") {
{
let s3 = $target[0];
{
let nidx = $target[1];
return $co$co(compose_subst(s3)(compose_subst(s2)(s1)))(type_apply(s3)(tv))(nidx)
}
}
};
throw new Error('let pattern not matched 1851. ' + valueToString($target));})()
}
}
}
};
throw new Error('let pattern not matched 1837. ' + valueToString($target));})()
}
}
}
};
throw new Error('let pattern not matched 1828. ' + valueToString($target));})()
}
}
};
throw new Error('let pattern not matched 1819. ' + valueToString($target));})()
}
}
}
}
if ($target.type === "elet") {
if ($target[0].type === "pvar") {
{
let name = $target[0][0];
{
let nl = $target[0][1];
{
let init = $target[1];
{
let body = $target[2];
{
let l = $target[3];
return (() => {const $target = t_expr(tenv)(init)(nidx);
if ($target.type === ",,") {
{
let s1 = $target[0];
{
let t1 = $target[1];
{
let nidx = $target[2];
return (() => {const $target = map$slrm(tenv)(name);
{
let env$qu = $target;
return (() => {const $target = generalize(tenv_apply(s1)(tenv))(t1);
{
let t$qu = $target;
return (() => {const $target = map$slset(env$qu)(name)(t$qu);
{
let env$qu$qu = $target;
return (() => {const $target = t_expr(tenv_apply(s1)(env$qu$qu))(body)(nidx);
if ($target.type === ",,") {
{
let s2 = $target[0];
{
let t2 = $target[1];
{
let nidx = $target[2];
return $co$co(compose_subst(s1)(s2))(t2)(nidx)
}
}
}
};
throw new Error('let pattern not matched 1953. ' + valueToString($target));})()
};
throw new Error('let pattern not matched 1947. ' + valueToString($target));})()
};
throw new Error('let pattern not matched 1938. ' + valueToString($target));})()
};
throw new Error('let pattern not matched 1933. ' + valueToString($target));})()
}
}
}
};
throw new Error('let pattern not matched 1923. ' + valueToString($target));})()
}
}
}
}
}
}
}
return fatal(`cannot infer type for ${valueToString(expr)}`)
throw new Error('failed to match ' + jsonify($target) + '. Loc: 1664');})(expr);

const infer = (tenv) => (expr) => (() => {const $target = t_expr(tenv)(expr)(0);
if ($target.type === ",,") {
{
let s = $target[0];
{
let t = $target[1];
{
let nidx = $target[2];
return type_to_string(type_apply(s)(t))
}
}
}
};
throw new Error('let pattern not matched 1987. ' + valueToString($target));})();

const tint = tcon("int")(-1);

const basic = map$slset(map$slnil)("+")(scheme(set$slnil)(tfn(tint)(tfn(tint)(tint)(-1))(-1)));

return {type: 'fns', ast, basic, compose_subst, foldl, foldr, free_for_vars, generalize, infer, instantiate, map, mapi, mgu, new_type_var, prelude, remove, scheme_apply, scheme_free, t_expr, t_prim, tenv_apply, tenv_free, tfn, tint, type_apply, type_free, type_to_string, var_bind}