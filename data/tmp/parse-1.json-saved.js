const builtins = "const sanMap = { '-': '_', '+': '\$pl', '*': '\$ti', '=': '\$eq', \n'>': '\$gt', '<': '\$lt', \"'\": '\$qu', '\"': '\$dq', ',': '\$co', '@': '\$at', '/': '\$sl'};\n\nconst kwds = 'case var if return';\nconst rx = [];\nkwds.split(' ').forEach((kwd) =>\n    rx.push([new RegExp(\`^\${kwd}\$\`, 'g'), '\$' + kwd]),);\nconst sanitize = (raw) => { if (raw == null) debugger;\n    for (let [key, val] of Object.entries(sanMap)) {\n        raw = raw.replaceAll(key, val);\n    }\n    rx.forEach(([rx, res]) => {\n        raw = raw.replaceAll(rx, res);\n    });\n    return raw;\n};\nconst jsonify = (raw) => JSON.stringify(raw);\nconst string_to_int = (a) => {\n    var v = parseInt(a);\n    if (!isNaN(v) && '' + v === a) return {type: 'some', 0: v}\n    return {type: 'none'}\n}\n\nconst unwrapArray = (v) => {\n    if (!v) debugger\n    return v.type === 'nil' ? [] : [v[0], ...unwrapArray(v[1])]\n};\nconst \$eq = (a) => (b) => a == b;\nconst fatal = (e) => {throw new Error(e)}\nconst nil = { type: 'nil' };\nconst cons = (a) => (b) => ({ type: 'cons', 0: a, 1: b });\nconst \$pl\$pl = (items) => unwrapArray(items).join('');\nconst \$pl = (a) => (b) => a + b;\nconst _ = (a) => (b) => a - b;\nconst int_to_string = (a) => a + '';\nconst replace_all = (a) => (b) => (c) => {\n    return a.replaceAll(b, c);\n};\nconst \$co = (a) => (b) => ({ type: ',', 0: a, 1: b });\nconst reduce = (init) => (items) => (f) => {\n    return unwrapArray(items).reduce((a, b) => f(a)(b), init);\n};\n";

const ast = "# AST";

const nil = ({type: "nil"});
const cons = (v0) => (v1) => ({type: "cons", 0: v0, 1: v1});
const eprim = (v0) => (v1) => ({type: "eprim", 0: v0, 1: v1});
const estr = (v0) => (v1) => (v2) => ({type: "estr", 0: v0, 1: v1, 2: v2});
const evar = (v0) => (v1) => ({type: "evar", 0: v0, 1: v1});
const equot = (v0) => (v1) => ({type: "equot", 0: v0, 1: v1});
const equot$slstmt = (v0) => (v1) => ({type: "equot/stmt", 0: v0, 1: v1});
const equot$slpat = (v0) => (v1) => ({type: "equot/pat", 0: v0, 1: v1});
const equot$sltype = (v0) => (v1) => ({type: "equot/type", 0: v0, 1: v1});
const equotquot = (v0) => (v1) => ({type: "equotquot", 0: v0, 1: v1});
const elambda = (v0) => (v1) => (v2) => (v3) => ({type: "elambda", 0: v0, 1: v1, 2: v2, 3: v3});
const eapp = (v0) => (v1) => (v2) => ({type: "eapp", 0: v0, 1: v1, 2: v2});
const elet = (v0) => (v1) => (v2) => (v3) => ({type: "elet", 0: v0, 1: v1, 2: v2, 3: v3});
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
const sdeftype = (v0) => (v1) => (v2) => (v3) => (v4) => ({type: "sdeftype", 0: v0, 1: v1, 2: v2, 3: v3, 4: v4});
const sdef = (v0) => (v1) => (v2) => (v3) => ({type: "sdef", 0: v0, 1: v1, 2: v2, 3: v3});
const sexpr = (v0) => (v1) => ({type: "sexpr", 0: v0, 1: v1});
const parsing = "# Parsing";

const cst$sllist = (v0) => (v1) => ({type: "cst/list", 0: v0, 1: v1});
const cst$slarray = (v0) => (v1) => ({type: "cst/array", 0: v0, 1: v1});
const cst$slspread = (v0) => (v1) => ({type: "cst/spread", 0: v0, 1: v1});
const cst$slidentifier = (v0) => (v1) => ({type: "cst/identifier", 0: v0, 1: v1});
const cst$slstring = (v0) => (v1) => (v2) => ({type: "cst/string", 0: v0, 1: v1, 2: v2});
const tapps = (items) => (l) => (($target) => {if ($target.type === "cons") {
{
let one = $target[0];
if ($target[1].type === "nil") {
return one
}
}
}
if ($target.type === "cons") {
{
let one = $target[0];
{
let rest = $target[1];
return tapp(tapps(rest)(l))(one)(l)
}
}
}
throw new Error('Failed to match. ' + valueToString($target))})(items);

const rev = (arr) => (col) => (($target) => {if ($target.type === "nil") {
return col
}
if ($target.type === "cons") {
{
let one = $target[0];
if ($target[1].type === "nil") {
return cons(one)(col)
}
}
}
if ($target.type === "cons") {
{
let one = $target[0];
{
let rest = $target[1];
return rev(rest)(cons(one)(col))
}
}
}
throw new Error('Failed to match. ' + valueToString($target))})(arr);

const parse_type = (type) => (($target) => {if ($target.type === "cst/identifier") {
{
let id = $target[0];
{
let l = $target[1];
return tcon(id)(l)
}
}
}
if ($target.type === "cst/list") {
if ($target[0].type === "nil") {
{
let l = $target[1];
return fatal("(parse-type) with empty list")
}
}
}
if ($target.type === "cst/list") {
if ($target[0].type === "cons") {
if ($target[0][0].type === "cst/identifier") {
if ($target[0][0][0] === "fn"){
if ($target[0][1].type === "cons") {
if ($target[0][1][0].type === "cst/array") {
{
let args = $target[0][1][0][0];
if ($target[0][1][1].type === "cons") {
{
let body = $target[0][1][1][0];
if ($target[0][1][1][1].type === "nil") {
return foldl(parse_type(body))(rev(args)(nil))((body) => (arg) => tapp(tapp(tcon("->")(-1))(parse_type(arg))(-1))(body)(-1))
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
if ($target.type === "cst/list") {
{
let items = $target[0];
{
let l = $target[1];
return tapps(rev(map(items)(parse_type))(nil))(l)
}
}
}
return fatal(`(parse-type) Invalid type ${valueToString(type)}`)
throw new Error('Failed to match. ' + valueToString($target))})(type);

const pairs = (array) => (($target) => {if ($target.type === "nil") {
return nil
}
if ($target.type === "cons") {
{
let one = $target[0];
if ($target[1].type === "cons") {
{
let two = $target[1][0];
{
let rest = $target[1][1];
return cons($co(one)(two))(pairs(rest))
}
}
}
}
}
return fatal(`Pairs given odd number ${valueToString(array)}`)
throw new Error('Failed to match. ' + valueToString($target))})(array);

const parse_pat = (pat) => (($target) => {if ($target.type === "cst/identifier") {
if ($target[0] === "_"){
{
let l = $target[1];
return pany(l)
}
}
}
if ($target.type === "cst/identifier") {
if ($target[0] === "true"){
{
let l = $target[1];
return pprim(pbool(true)(l))(l)
}
}
}
if ($target.type === "cst/identifier") {
if ($target[0] === "false"){
{
let l = $target[1];
return pprim(pbool(false)(l))(l)
}
}
}
if ($target.type === "cst/string") {
{
let first = $target[0];
if ($target[1].type === "nil") {
{
let l = $target[2];
return pstr(first)(l)
}
}
}
}
if ($target.type === "cst/identifier") {
{
let id = $target[0];
{
let l = $target[1];
return (($target) => {if ($target.type === "some") {
{
let int = $target[0];
return pprim(pint(int)(l))(l)
}
}
return pvar(id)(l)
throw new Error('Failed to match. ' + valueToString($target))})(string_to_int(id))
}
}
}
if ($target.type === "cst/array") {
if ($target[0].type === "nil") {
{
let l = $target[1];
return pcon("nil")(nil)(l)
}
}
}
if ($target.type === "cst/array") {
if ($target[0].type === "cons") {
if ($target[0][0].type === "cst/spread") {
{
let inner = $target[0][0][0];
if ($target[0][1].type === "nil") {
return parse_pat(inner)
}
}
}
}
}
if ($target.type === "cst/array") {
if ($target[0].type === "cons") {
{
let one = $target[0][0];
{
let rest = $target[0][1];
{
let l = $target[1];
return pcon("cons")(cons(parse_pat(one))(cons(parse_pat(cst$slarray(rest)(l)))(nil)))(l)
}
}
}
}
}
if ($target.type === "cst/list") {
if ($target[0].type === "cons") {
if ($target[0][0].type === "cst/identifier") {
{
let name = $target[0][0][0];
{
let rest = $target[0][1];
{
let l = $target[1];
return pcon(name)(map(rest)(parse_pat))(l)
}
}
}
}
}
}
return fatal(`parse-pat mo match ${valueToString(pat)}`)
throw new Error('Failed to match. ' + valueToString($target))})(pat);

const parse_expr = (cst) => (($target) => {if ($target.type === "cst/identifier") {
if ($target[0] === "true"){
{
let l = $target[1];
return eprim(pbool(true)(l))(l)
}
}
}
if ($target.type === "cst/identifier") {
if ($target[0] === "false"){
{
let l = $target[1];
return eprim(pbool(false)(l))(l)
}
}
}
if ($target.type === "cst/string") {
{
let first = $target[0];
{
let templates = $target[1];
{
let l = $target[2];
return estr(first)(map(templates)((tpl) => (($target) => {if ($target.type === ",,") {
{
let expr = $target[0];
{
let string = $target[1];
{
let l = $target[2];
return $co$co(parse_expr(expr))(string)(l)
}
}
}
}
throw new Error('Failed to match. ' + valueToString($target))})(tpl)))(l)
}
}
}
}
if ($target.type === "cst/identifier") {
{
let id = $target[0];
{
let l = $target[1];
return (($target) => {if ($target.type === "some") {
{
let int = $target[0];
return eprim(pint(int)(l))(l)
}
}
if ($target.type === "none") {
return evar(id)(l)
}
throw new Error('Failed to match. ' + valueToString($target))})(string_to_int(id))
}
}
}
if ($target.type === "cst/list") {
if ($target[0].type === "cons") {
if ($target[0][0].type === "cst/identifier") {
if ($target[0][0][0] === "@"){
if ($target[0][1].type === "cons") {
{
let body = $target[0][1][0];
if ($target[0][1][1].type === "nil") {
{
let l = $target[1];
return equot(parse_expr(body))(l)
}
}
}
}
}
}
}
}
if ($target.type === "cst/list") {
if ($target[0].type === "cons") {
if ($target[0][0].type === "cst/identifier") {
if ($target[0][0][0] === "@@"){
if ($target[0][1].type === "cons") {
{
let body = $target[0][1][0];
if ($target[0][1][1].type === "nil") {
{
let l = $target[1];
return equotquot(body)(l)
}
}
}
}
}
}
}
}
if ($target.type === "cst/list") {
if ($target[0].type === "cons") {
if ($target[0][0].type === "cst/identifier") {
if ($target[0][0][0] === "@!"){
if ($target[0][1].type === "cons") {
{
let body = $target[0][1][0];
if ($target[0][1][1].type === "nil") {
{
let l = $target[1];
return equot$slstmt(parse_stmt(body))(l)
}
}
}
}
}
}
}
}
if ($target.type === "cst/list") {
if ($target[0].type === "cons") {
if ($target[0][0].type === "cst/identifier") {
if ($target[0][0][0] === "@t"){
if ($target[0][1].type === "cons") {
{
let body = $target[0][1][0];
if ($target[0][1][1].type === "nil") {
{
let l = $target[1];
return equot$sltype(parse_type(body))(l)
}
}
}
}
}
}
}
}
if ($target.type === "cst/list") {
if ($target[0].type === "cons") {
if ($target[0][0].type === "cst/identifier") {
if ($target[0][0][0] === "@p"){
if ($target[0][1].type === "cons") {
{
let body = $target[0][1][0];
if ($target[0][1][1].type === "nil") {
{
let l = $target[1];
return equot$slpat(parse_pat(body))(l)
}
}
}
}
}
}
}
}
if ($target.type === "cst/list") {
if ($target[0].type === "cons") {
if ($target[0][0].type === "cst/identifier") {
if ($target[0][0][0] === "if"){
if ($target[0][1].type === "cons") {
{
let cond = $target[0][1][0];
if ($target[0][1][1].type === "cons") {
{
let yes = $target[0][1][1][0];
if ($target[0][1][1][1].type === "cons") {
{
let no = $target[0][1][1][1][0];
if ($target[0][1][1][1][1].type === "nil") {
{
let l = $target[1];
return ematch(parse_expr(cond))(cons($co(pprim(pbool(true)(l))(l))(parse_expr(yes)))(cons($co(pany(l))(parse_expr(no)))(nil)))(l)
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
}
}
if ($target.type === "cst/list") {
if ($target[0].type === "cons") {
if ($target[0][0].type === "cst/identifier") {
if ($target[0][0][0] === "fn"){
if ($target[0][1].type === "cons") {
if ($target[0][1][0].type === "cst/array") {
{
let args = $target[0][1][0][0];
if ($target[0][1][1].type === "cons") {
{
let body = $target[0][1][1][0];
if ($target[0][1][1][1].type === "nil") {
{
let b = $target[1];
return foldr(parse_expr(body))(args)((body) => (arg) => (($target) => {if ($target.type === "cst/identifier") {
{
let name = $target[0];
{
let l = $target[1];
return elambda(name)(l)(body)(b)
}
}
}
return elambda("\$fn-arg")(-1)(ematch(evar("\$fn-arg")(-1))(cons($co(parse_pat(arg))(body))(nil))(b))(b)
throw new Error('Failed to match. ' + valueToString($target))})(arg))
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
}
if ($target.type === "cst/list") {
if ($target[0].type === "cons") {
if ($target[0][0].type === "cst/identifier") {
if ($target[0][0][0] === "match"){
if ($target[0][1].type === "cons") {
{
let target = $target[0][1][0];
{
let cases = $target[0][1][1];
{
let l = $target[1];
return ematch(parse_expr(target))(map(pairs(cases))(($case) => (($target) => {if ($target.type === ",") {
{
let pat = $target[0];
{
let expr = $target[1];
return $co(parse_pat(pat))(parse_expr(expr))
}
}
}
throw new Error('Failed to match. ' + valueToString($target))})($case)))(l)
}
}
}
}
}
}
}
}
if ($target.type === "cst/list") {
if ($target[0].type === "cons") {
if ($target[0][0].type === "cst/identifier") {
if ($target[0][0][0] === "let"){
if ($target[0][1].type === "cons") {
if ($target[0][1][0].type === "cst/array") {
{
let inits = $target[0][1][0][0];
if ($target[0][1][1].type === "cons") {
{
let body = $target[0][1][1][0];
if ($target[0][1][1][1].type === "nil") {
{
let l = $target[1];
return foldr(parse_expr(body))(pairs(inits))((body) => (init) => (($target) => {if ($target.type === ",") {
{
let pat = $target[0];
{
let value = $target[1];
return elet(parse_pat(pat))(parse_expr(value))(body)(l)
}
}
}
throw new Error('Failed to match. ' + valueToString($target))})(init))
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
}
if ($target.type === "cst/list") {
if ($target[0].type === "cons") {
{
let target = $target[0][0];
{
let args = $target[0][1];
{
let l = $target[1];
return foldl(parse_expr(target))(args)((target) => (arg) => eapp(target)(parse_expr(arg))(l))
}
}
}
}
}
if ($target.type === "cst/array") {
{
let args = $target[0];
{
let l = $target[1];
return parse_array(args)(l)
}
}
}
throw new Error('Failed to match. ' + valueToString($target))})(cst);

const parse_array = (args) => (l) => (($target) => {if ($target.type === "nil") {
return evar("nil")(l)
}
if ($target.type === "cons") {
if ($target[0].type === "cst/spread") {
{
let inner = $target[0][0];
if ($target[1].type === "nil") {
return parse_expr(inner)
}
}
}
}
if ($target.type === "cons") {
{
let one = $target[0];
{
let rest = $target[1];
return eapp(eapp(evar("cons")(l))(parse_expr(one))(l))(parse_array(rest)(l))(l)
}
}
}
throw new Error('Failed to match. ' + valueToString($target))})(args);

const mk_deftype = (id) => (li) => (args) => (items) => (l) => sdeftype(id)(li)(map(args)((arg) => (($target) => {if ($target.type === "cst/identifier") {
{
let name = $target[0];
{
let l = $target[1];
return $co(name)(l)
}
}
}
return fatal("deftype type argument must be identifier")
throw new Error('Failed to match. ' + valueToString($target))})(arg)))(map(items)((constr) => (($target) => {if ($target.type === "cst/list") {
if ($target[0].type === "cons") {
if ($target[0][0].type === "cst/identifier") {
{
let name = $target[0][0][0];
{
let ni = $target[0][0][1];
{
let args = $target[0][1];
{
let l = $target[1];
return $co$co$co(name)(ni)(map(args)(parse_type))(l)
}
}
}
}
}
}
}
throw new Error('Failed to match. ' + valueToString($target))})(constr)))(l);

const parse_stmt = (cst) => (($target) => {if ($target.type === "cst/list") {
if ($target[0].type === "cons") {
if ($target[0][0].type === "cst/identifier") {
if ($target[0][0][0] === "def"){
if ($target[0][1].type === "cons") {
if ($target[0][1][0].type === "cst/identifier") {
{
let id = $target[0][1][0][0];
{
let li = $target[0][1][0][1];
if ($target[0][1][1].type === "cons") {
{
let value = $target[0][1][1][0];
if ($target[0][1][1][1].type === "nil") {
{
let l = $target[1];
return sdef(id)(li)(parse_expr(value))(l)
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
}
}
if ($target.type === "cst/list") {
if ($target[0].type === "cons") {
if ($target[0][0].type === "cst/identifier") {
if ($target[0][0][0] === "defn"){
{
let a = $target[0][0][1];
if ($target[0][1].type === "cons") {
if ($target[0][1][0].type === "cst/identifier") {
{
let id = $target[0][1][0][0];
{
let li = $target[0][1][0][1];
if ($target[0][1][1].type === "cons") {
if ($target[0][1][1][0].type === "cst/array") {
{
let args = $target[0][1][1][0][0];
{
let b = $target[0][1][1][0][1];
if ($target[0][1][1][1].type === "cons") {
{
let body = $target[0][1][1][1][0];
if ($target[0][1][1][1][1].type === "nil") {
{
let c = $target[1];
return sdef(id)(li)(parse_expr(cst$sllist(cons(cst$slidentifier("fn")(a))(cons(cst$slarray(args)(b))(cons(body)(nil))))(c)))(c)
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
}
}
}
}
}
}
}
if ($target.type === "cst/list") {
if ($target[0].type === "cons") {
if ($target[0][0].type === "cst/identifier") {
if ($target[0][0][0] === "deftype"){
if ($target[0][1].type === "cons") {
if ($target[0][1][0].type === "cst/identifier") {
{
let id = $target[0][1][0][0];
{
let li = $target[0][1][0][1];
{
let items = $target[0][1][1];
{
let l = $target[1];
return mk_deftype(id)(li)(nil)(items)(l)
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
if ($target.type === "cst/list") {
if ($target[0].type === "cons") {
if ($target[0][0].type === "cst/identifier") {
if ($target[0][0][0] === "deftype"){
if ($target[0][1].type === "cons") {
if ($target[0][1][0].type === "cst/list") {
if ($target[0][1][0][0].type === "cons") {
if ($target[0][1][0][0][0].type === "cst/identifier") {
{
let id = $target[0][1][0][0][0][0];
{
let li = $target[0][1][0][0][0][1];
{
let args = $target[0][1][0][0][1];
{
let items = $target[0][1][1];
{
let l = $target[1];
return mk_deftype(id)(li)(args)(items)(l)
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
}
}
}
return sexpr(parse_expr(cst))((($target) => {if ($target.type === "cst/list") {
{
let l = $target[1];
return l
}
}
if ($target.type === "cst/identifier") {
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
throw new Error('Failed to match. ' + valueToString($target))})(cst))
throw new Error('Failed to match. ' + valueToString($target))})(cst);

const some = (v0) => ({type: "some", 0: v0});
const none = ({type: "none"});
const prelude = "# prelude";

const join = (sep) => (items) => (($target) => {if ($target.type === "nil") {
return ""
}
if ($target.type === "cons") {
{
let one = $target[0];
{
let rest = $target[1];
return (($target) => {if ($target.type === "nil") {
return one
}
return $pl$pl(cons(one)(cons(sep)(cons(join(sep)(rest))(nil))))
throw new Error('Failed to match. ' + valueToString($target))})(rest)
}
}
}
throw new Error('Failed to match. ' + valueToString($target))})(items);

const map = (values) => (f) => (($target) => {if ($target.type === "nil") {
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
throw new Error('Failed to match. ' + valueToString($target))})(values);

const mapi = (i) => (values) => (f) => (($target) => {if ($target.type === "nil") {
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
throw new Error('Failed to match. ' + valueToString($target))})(values);

const foldl = (init) => (items) => (f) => (($target) => {if ($target.type === "nil") {
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
throw new Error('Failed to match. ' + valueToString($target))})(items);

const foldr = (init) => (items) => (f) => (($target) => {if ($target.type === "nil") {
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
throw new Error('Failed to match. ' + valueToString($target))})(items);

const consr = (a) => (b) => cons(b)(a);

const compilation = "# compilation";

const compile_stmt = (stmt) => (trace) => (($target) => {if ($target.type === "sexpr") {
{
let expr = $target[0];
{
let l = $target[1];
return compile(expr)(trace)
}
}
}
if ($target.type === "sdef") {
{
let name = $target[0];
{
let nl = $target[1];
{
let body = $target[2];
{
let l = $target[3];
return $pl$pl(cons("const ")(cons(sanitize(name))(cons(" = ")(cons(compile(body)(trace))(cons(";\n")(nil))))))
}
}
}
}
}
if ($target.type === "sdeftype") {
{
let name = $target[0];
{
let nl = $target[1];
{
let type_arg = $target[2];
{
let cases = $target[3];
{
let l = $target[4];
return join("\n")(map(cases)(($case) => (($target) => {if ($target.type === ",,,") {
{
let name2 = $target[0];
{
let nl = $target[1];
{
let args = $target[2];
{
let l = $target[3];
return $pl$pl(cons("const ")(cons(sanitize(name2))(cons(" = ")(cons($pl$pl(mapi(0)(args)((i) => (_) => $pl$pl(cons("(v")(cons(int_to_string(i))(cons(") => ")(nil)))))))(cons("({type: \"")(cons(name2)(cons("\"")(cons($pl$pl(mapi(0)(args)((i) => (_) => $pl$pl(cons(", ")(cons(int_to_string(i))(cons(": v")(cons(int_to_string(i))(nil))))))))(cons("});")(nil))))))))))
}
}
}
}
}
throw new Error('Failed to match. ' + valueToString($target))})($case)))
}
}
}
}
}
}
throw new Error('Failed to match. ' + valueToString($target))})(stmt);

const util = "# util";

const snd = (tuple) => (($target) => {if ($target.type === ",") {
{
let v = $target[1];
return v
}
}
throw new Error('Failed to match. ' + valueToString($target))})(tuple);

const fst = (tuple) => (($target) => {if ($target.type === ",") {
{
let v = $target[0];
return v
}
}
throw new Error('Failed to match. ' + valueToString($target))})(tuple);

const replaces = (target) => (repl) => (($target) => {if ($target.type === "nil") {
return target
}
if ($target.type === "cons") {
{
let one = $target[0];
{
let rest = $target[1];
return (($target) => {if ($target.type === ",") {
{
let find = $target[0];
{
let nw = $target[1];
return replaces(replace_all(target)(find)(nw))(rest)
}
}
}
throw new Error('Failed to match. ' + valueToString($target))})(one)
}
}
}
throw new Error('Failed to match. ' + valueToString($target))})(repl);

const escape_string = (string) => replaces(string)(cons($co("\\")("\\\\"))(cons($co("\n")("\\n"))(cons($co("\"")("\\\""))(cons($co("\`")("\\\`"))(cons($co("\$")("\\\$"))(nil))))));

const unescape_string = (string) => replaces(string)(cons($co("\\\"")("\""))(cons($co("\\n")("\n"))(cons($co("\\\\")("\\"))(nil))));

const quot = (expr) => (($target) => {if ($target.type === "eprim") {
{
let prim = $target[0];
return (($target) => {if ($target.type === "pstr") {
{
let string = $target[0];
return $pl$pl(cons("{type: ")(nil))
}
}
throw new Error('Failed to match. ' + valueToString($target))})(prim)
}
}
throw new Error('Failed to match. ' + valueToString($target))})(expr);

const pat_loop = (target) => (args) => (i) => (inner) => (trace) => (($target) => {if ($target.type === "nil") {
return inner
}
if ($target.type === "cons") {
{
let arg = $target[0];
{
let rest = $target[1];
return compile_pat(arg)(`${target}[${i}]`)(pat_loop(target)(rest)($pl(i)(1))(inner)(trace))(trace)
}
}
}
throw new Error('Failed to match. ' + valueToString($target))})(args);

const pat_loc = (pat) => (($target) => {if ($target.type === "pany") {
{
let l = $target[0];
return l
}
}
if ($target.type === "pprim") {
{
let l = $target[1];
return l
}
}
if ($target.type === "pstr") {
{
let l = $target[1];
return l
}
}
if ($target.type === "pvar") {
{
let l = $target[1];
return l
}
}
if ($target.type === "pcon") {
{
let l = $target[2];
return l
}
}
throw new Error('Failed to match. ' + valueToString($target))})(pat);

const compile_pat = (pat) => (target) => (inner) => (trace) => trace_and_block(pat_loc(pat))(trace)(target)((($target) => {if ($target.type === "pany") {
{
let l = $target[0];
return inner
}
}
if ($target.type === "pprim") {
{
let prim = $target[0];
{
let l = $target[1];
return (($target) => {if ($target.type === "pint") {
{
let int = $target[0];
return `if (${target} === ${int}) {\n${inner}\n}`
}
}
if ($target.type === "pbool") {
{
let bool = $target[0];
return `if (${target} === ${bool}) {\n${inner}\n}`
}
}
throw new Error('Failed to match. ' + valueToString($target))})(prim)
}
}
}
if ($target.type === "pstr") {
{
let str = $target[0];
{
let l = $target[1];
return `if (${target} === \"${str}\"){\n${inner}\n}`
}
}
}
if ($target.type === "pvar") {
{
let name = $target[0];
{
let l = $target[1];
return `{\nlet ${sanitize(name)} = ${target};\n${inner}\n}`
}
}
}
if ($target.type === "pcon") {
{
let name = $target[0];
{
let args = $target[1];
{
let l = $target[2];
return `if (${target}.type === \"${name}\") {\n${pat_loop(target)(args)(0)(inner)(trace)}\n}`
}
}
}
}
throw new Error('Failed to match. ' + valueToString($target))})(pat));

const expr_loc = (expr) => (($target) => {if ($target.type === "estr") {
{
let l = $target[2];
return l
}
}
if ($target.type === "eprim") {
{
let l = $target[1];
return l
}
}
if ($target.type === "evar") {
{
let l = $target[1];
return l
}
}
if ($target.type === "equotquot") {
{
let l = $target[1];
return l
}
}
if ($target.type === "equot") {
{
let l = $target[1];
return l
}
}
if ($target.type === "equot/stmt") {
{
let l = $target[1];
return l
}
}
if ($target.type === "equot/pat") {
{
let l = $target[1];
return l
}
}
if ($target.type === "equot/type") {
{
let l = $target[1];
return l
}
}
if ($target.type === "elambda") {
{
let l = $target[3];
return l
}
}
if ($target.type === "elet") {
{
let l = $target[3];
return l
}
}
if ($target.type === "eapp") {
{
let l = $target[2];
return l
}
}
if ($target.type === "ematch") {
{
let l = $target[2];
return l
}
}
throw new Error('Failed to match. ' + valueToString($target))})(expr);

const trace_wrap = (loc) => (trace) => (js) => (($target) => {if ($target.type === "none") {
return js
}
if ($target.type === "some") {
{
let info = $target[0];
return `\$trace(${loc}, ${jsonify(info)}, ${js})`
}
}
throw new Error('Failed to match. ' + valueToString($target))})(map$slget(trace)(loc));

const trace_and = (loc) => (trace) => (value) => (js) => (($target) => {if ($target.type === "none") {
return js
}
if ($target.type === "some") {
{
let info = $target[0];
return `(\$trace(${loc}, ${jsonify(info)}, ${value}), ${js})`
}
}
throw new Error('Failed to match. ' + valueToString($target))})(map$slget(trace)(loc));

const trace_and_block = (loc) => (trace) => (value) => (js) => (($target) => {if ($target.type === "none") {
return js
}
if ($target.type === "some") {
{
let info = $target[0];
return `\$trace(${loc}, ${jsonify(info)}, ${value});\n${js}`
}
}
throw new Error('Failed to match. ' + valueToString($target))})(map$slget(trace)(loc));

const source_map = (loc) => (js) => `/*${loc}*/${js}/*<${loc}*/`;

const compile = (expr) => (trace) => ((loc) => source_map(loc)(trace_wrap(loc)(trace)((($target) => {if ($target.type === "estr") {
{
let first = $target[0];
{
let tpls = $target[1];
{
let l = $target[2];
return (($target) => {if ($target.type === "nil") {
return `\"${escape_string(unescapeString(first))}\"`
}
return `\`${escape_string(unescapeString(first))}${join("")(map(tpls)((item) => (($target) => {if ($target.type === ",,") {
{
let expr = $target[0];
{
let suffix = $target[1];
{
let l = $target[2];
return `\${${compile(expr)(trace)}}${escape_string(unescapeString(suffix))}`
}
}
}
}
throw new Error('Failed to match. ' + valueToString($target))})(item)))}\``
throw new Error('Failed to match. ' + valueToString($target))})(tpls)
}
}
}
}
if ($target.type === "eprim") {
{
let prim = $target[0];
{
let l = $target[1];
return (($target) => {if ($target.type === "pint") {
{
let int = $target[0];
return int_to_string(int)
}
}
if ($target.type === "pbool") {
{
let bool = $target[0];
return (($target) => {if ($target === true) {
return "true"
}
if ($target === false) {
return "false"
}
throw new Error('Failed to match. ' + valueToString($target))})(bool)
}
}
throw new Error('Failed to match. ' + valueToString($target))})(prim)
}
}
}
if ($target.type === "evar") {
{
let name = $target[0];
{
let l = $target[1];
return sanitize(name)
}
}
}
if ($target.type === "equot") {
{
let inner = $target[0];
{
let l = $target[1];
return jsonify(inner)
}
}
}
if ($target.type === "equot/stmt") {
{
let inner = $target[0];
{
let l = $target[1];
return jsonify(inner)
}
}
}
if ($target.type === "equot/type") {
{
let inner = $target[0];
{
let l = $target[1];
return jsonify(inner)
}
}
}
if ($target.type === "equot/pat") {
{
let inner = $target[0];
{
let l = $target[1];
return jsonify(inner)
}
}
}
if ($target.type === "equotquot") {
{
let inner = $target[0];
{
let l = $target[1];
return jsonify(inner)
}
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
return $pl$pl(cons(`function name_${l}(`)(cons(sanitize(name))(cons(") { return ")(cons(trace_and(nl)(trace)(sanitize(name))(compile(body)(trace)))(cons(" }")(nil))))))
}
}
}
}
}
if ($target.type === "elet") {
{
let pat = $target[0];
{
let init = $target[1];
{
let body = $target[2];
{
let l = $target[3];
return `(function let_${l}() {const \$target = ${compile(init)(trace)};\n${compile_pat(pat)("\$target")(`return ${compile(body)(trace)}`)(trace)};\nthrow new Error('let pattern not matched ${pat_loc(pat)}. ' + valueToString(\$target));})(/*!*/)`
}
}
}
}
}
if ($target.type === "eapp") {
{
let fn = $target[0];
{
let arg = $target[1];
{
let l = $target[2];
return (($target) => {if ($target.type === "elambda") {
{
let name = $target[0];
return `(${compile(fn)(trace)})(/*${l}*/${compile(arg)(trace)})`
}
}
return `${compile(fn)(trace)}(/*${l}*/${compile(arg)(trace)})`
throw new Error('Failed to match. ' + valueToString($target))})(fn)
}
}
}
}
if ($target.type === "ematch") {
{
let target = $target[0];
{
let cases = $target[1];
{
let l = $target[2];
return `(function match_${l}(\$target) {\n${join("\n")(map(cases)(($case) => (($target) => {if ($target.type === ",") {
{
let pat = $target[0];
{
let body = $target[1];
return compile_pat(pat)("\$target")(`return ${compile(body)(trace)}`)(trace)
}
}
}
throw new Error('Failed to match. ' + valueToString($target))})($case)))}\nthrow new Error('failed to match ' + jsonify(\$target) + '. Loc: ${l}');})(/*!*/${compile(target)(trace)})`
}
}
}
}
throw new Error('Failed to match. ' + valueToString($target))})(expr))))(expr_loc(expr));

const run = (v) => eval(compile(parse_expr(v))(map$slnil));

return {type: 'fns', ast, builtins, compilation, compile, compile_pat, compile_stmt, consr, escape_string, expr_loc, foldl, foldr, fst, join, map, mapi, mk_deftype, pairs, parse_array, parse_expr, parse_pat, parse_stmt, parse_type, parsing, pat_loc, pat_loop, prelude, quot, replaces, rev, run, snd, source_map, tapps, trace_and, trace_and_block, trace_wrap, unescape_string, util}