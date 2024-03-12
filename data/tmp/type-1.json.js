const ast = "# AST";

const nil = ({type: "nil"});
const cons = (v0) => (v1) => ({type: "cons", 0: v0, 1: v1});
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
const concat = (a) => (b) => (($target) => {if ($target.type === "nil") {
return b
}
if ($target.type === "cons") {
{
let a = $target[0];
if ($target[1].type === "nil") {
return cons(a)(b)
}
}
}
if ($target.type === "cons") {
{
let a = $target[0];
{
let rest = $target[1];
return cons(a)(concat(rest)(b))
}
}
}
throw new Error('Failed to match. ' + valueToString($target))})(a);

const scheme = (v0) => (v1) => ({type: "scheme", 0: v0, 1: v1});
const type_free = (type) => (($target) => {if ($target.type === "tvar") {
{
let n = $target[0];
return cons(n)(nil)
}
}
if ($target.type === "tcon") {
return nil
}
if ($target.type === "tapp") {
{
let a = $target[0];
{
let b = $target[1];
return concat(type_types(a))(type_types(b))
}
}
}
throw new Error('Failed to match. ' + valueToString($target))})(type);

const type_apply = (subst) => (type) => (($target) => {if ($target.type === "tvar") {
{
let n = $target[0];
return (($target) => {if ($target.type === "none") {
return type
}
if ($target.type === "some") {
{
let t = $target[0];
return t
}
}
throw new Error('Failed to match. ' + valueToString($target))})(cons(n)(nil)(subst))
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
throw new Error('Failed to match. ' + valueToString($target))})(type);

return {type: 'fns', ast, concat, type_apply, type_free}