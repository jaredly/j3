const builtins = "const sanMap = { '-': '_', '+': '\$pl', '*': '\$ti', '=': '\$eq', \n'>': '\$gt', '<': '\$lt', \"'\": '\$qu', '\"': '\$dq', ',': '\$co', '@': '\$at', '/': '\$sl'};\n\nconst kwds = 'case var if return';\nconst rx = [];\nkwds.split(' ').forEach((kwd) =>\n    rx.push([new RegExp(\`^\${kwd}\$\`, 'g'), '\$' + kwd]),);\nconst sanitize = (raw) => { if (raw == null) debugger;\n    for (let [key, val] of Object.entries(sanMap)) {\n        raw = raw.replaceAll(key, val);\n    }\n    rx.forEach(([rx, res]) => {\n        raw = raw.replaceAll(rx, res);\n    });\n    return raw;\n};\nconst jsonify = (raw) => JSON.stringify(raw);\nconst string_to_int = (a) => {\n    var v = parseInt(a);\n    if (!isNaN(v) && '' + v === a) return {type: 'some', 0: v}\n    return {type: 'none'}\n}\n\nconst unwrapArray = (v) => {\n    if (!v) debugger\n    return v.type === 'nil' ? [] : [v[0], ...unwrapArray(v[1])]\n};\nconst \$eq = (a) => (b) => a == b;\nconst fatal = (e) => {throw new Error(e)}\nconst nil = { type: 'nil' };\nconst cons = (a) => (b) => ({ type: 'cons', 0: a, 1: b });\nconst \$pl\$pl = (items) => unwrapArray(items).join('');\nconst \$pl = (a) => (b) => a + b;\nconst _ = (a) => (b) => a - b;\nconst int_to_string = (a) => a + '';\nconst replace_all = (a) => (b) => (c) => {\n    return a.replaceAll(b, c);\n};\nconst \$co = (a) => (b) => ({ type: ',', 0: a, 1: b });\nconst reduce = (init) => (items) => (f) => {\n    return unwrapArray(items).reduce((a, b) => f(a)(b), init);\n};\n";

const ast = "# AST";

const nil = ({type: "nil"});
const cons = (v0) => (v1) => ({type: "cons", 0: v0, 1: v1});
const eprim = (v0) => ({type: "eprim", 0: v0});
const estr = (v0) => (v1) => ({type: "estr", 0: v0, 1: v1});
const evar = (v0) => ({type: "evar", 0: v0});
const equot = (v0) => ({type: "equot", 0: v0});
const equotquot = (v0) => ({type: "equotquot", 0: v0});
const elambda = (v0) => (v1) => ({type: "elambda", 0: v0, 1: v1});
const eapp = (v0) => (v1) => ({type: "eapp", 0: v0, 1: v1});
const ematch = (v0) => (v1) => ({type: "ematch", 0: v0, 1: v1});
const pint = (v0) => ({type: "pint", 0: v0});
const pbool = (v0) => ({type: "pbool", 0: v0});
const pany = ({type: "pany"});
const pvar = (v0) => ({type: "pvar", 0: v0});
const pcon = (v0) => (v1) => ({type: "pcon", 0: v0, 1: v1});
const pstr = (v0) => ({type: "pstr", 0: v0});
const pprim = (v0) => ({type: "pprim", 0: v0});
const tvar = (v0) => ({type: "tvar", 0: v0});
const tapp = (v0) => (v1) => ({type: "tapp", 0: v0, 1: v1});
const tcon = (v0) => ({type: "tcon", 0: v0});
const sdeftype = (v0) => (v1) => ({type: "sdeftype", 0: v0, 1: v1});
const sdef = (v0) => (v1) => ({type: "sdef", 0: v0, 1: v1});
const sexpr = (v0) => ({type: "sexpr", 0: v0});
const parsing = "# Parsing";

const cst$sllist = (v0) => (v1) => ({type: "cst/list", 0: v0, 1: v1});
const cst$slarray = (v0) => (v1) => ({type: "cst/array", 0: v0, 1: v1});
const cst$slidentifier = (v0) => (v1) => ({type: "cst/identifier", 0: v0, 1: v1});
const cst$slstring = (v0) => (v1) => (v2) => ({type: "cst/string", 0: v0, 1: v1, 2: v2});
const better_match = (items) => (($target) => {if ($target.type === "cons") {
{
let one = $target[0];
{
let rest = $target[1];
return (($target) => {
throw new Error('Failed to match. ' + valueToString($target))})(rest)
}
}
}
throw new Error('Failed to match. ' + valueToString($target))})(items);

const tapps = (items) => (($target) => {if ($target.type === "cons") {
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
return tapp(one)(tapps(rest))
}
}
}
throw new Error('Failed to match. ' + valueToString($target))})(items);

const parse_type = (type) => (($target) => {if ($target.type === "cst/identifier") {
{
let id = $target[0];
return tcon(id)
}
}
if ($target.type === "cst/list") {
{
let items = $target[0];
return tapps(map(items)(parse_type))
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
return pany
}
}
if ($target.type === "cst/string") {
{
let first = $target[0];
if ($target[1].type === "nil") {
return pstr(first)
}
}
}
if ($target.type === "cst/identifier") {
{
let id = $target[0];
return (($target) => {if ($target.type === "some") {
{
let int = $target[0];
return pprim(pint(int))
}
}
return pvar(id)
throw new Error('Failed to match. ' + valueToString($target))})(string_to_int(id))
}
}
if ($target.type === "cst/array") {
if ($target[0].type === "nil") {
return pcon("nil")(nil)
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
return pcon("cons")(cons(parse_pat(one))(cons(parse_pat(cst$slarray(re)))(nil)))
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
return pcon(name)(map(rest)(parse_pat))
}
}
}
}
}
return fatal(`parse-pat mo match ${valueToString(pat)}`)
throw new Error('Failed to match. ' + valueToString($target))})(pat);

const parse_expr = (cst) => (($target) => {if ($target.type === "cst/identifier") {
if ($target[0] === "true"){
return eprim(pbool(true))
}
}
if ($target.type === "cst/identifier") {
if ($target[0] === "false"){
return eprim(pbool(false))
}
}
if ($target.type === "cst/string") {
{
let first = $target[0];
{
let templates = $target[1];
return estr(first)(map(templates)((tpl) => (($target) => {if ($target.type === ",") {
{
let expr = $target[0];
{
let string = $target[1];
return $co(parse_expr(expr))(string)
}
}
}
throw new Error('Failed to match. ' + valueToString($target))})(tpl)))
}
}
}
if ($target.type === "cst/identifier") {
{
let id = $target[0];
return (($target) => {if ($target.type === "some") {
{
let int = $target[0];
return eprim(pint(int))
}
}
if ($target.type === "none") {
return evar(id)
}
throw new Error('Failed to match. ' + valueToString($target))})(string_to_int(id))
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
return equot(parse_expr(body))
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
return equotquot(body)
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
return foldr(parse_expr(body))(args)((body) => (arg) => (($target) => {if ($target.type === "cst/identifier") {
{
let name = $target[0];
return elambda(name)(body)
}
}
return elambda("\$fn-arg")(ematch(evar("\$fn-arg"))(cons($co(parse_pat(arg))(body))(nil)))
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
if ($target.type === "cst/list") {
if ($target[0].type === "cons") {
if ($target[0][0].type === "cst/identifier") {
if ($target[0][0][0] === "match"){
if ($target[0][1].type === "cons") {
{
let target = $target[0][1][0];
{
let cases = $target[0][1][1];
return ematch(parse_expr(target))(map(pairs(cases))(($case) => (($target) => {if ($target.type === ",") {
{
let pat = $target[0];
{
let expr = $target[1];
return $co(parse_pat(pat))(parse_expr(expr))
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
return foldl(parse_expr(body))(pairs(inits))((body) => (init) => (($target) => {if ($target.type === ",") {
{
let pat = $target[0];
{
let value = $target[1];
return ematch(parse_expr(value))(cons($co(parse_pat(pat))(body))(nil))
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
if ($target.type === "cst/list") {
if ($target[0].type === "cons") {
{
let target = $target[0][0];
{
let args = $target[0][1];
return foldl(parse_expr(target))(args)((target) => (arg) => eapp(target)(parse_expr(arg)))
}
}
}
}
if ($target.type === "cst/array") {
{
let args = $target[0];
return foldr(evar("nil"))(args)((arr) => (item) => eapp(eapp(evar("cons"))(parse_expr(item)))(arr))
}
}
throw new Error('Failed to match. ' + valueToString($target))})(cst);

const mk_deftype = (id) => (items) => sdeftype(id)(map(items)((constr) => (($target) => {if ($target.type === "cst/list") {
if ($target[0].type === "cons") {
if ($target[0][0].type === "cst/identifier") {
{
let name = $target[0][0][0];
{
let args = $target[0][1];
return $co(name)(map(args)(parse_type))
}
}
}
}
}
throw new Error('Failed to match. ' + valueToString($target))})(constr)));

const parse_stmt = (cst) => (($target) => {if ($target.type === "cst/list") {
if ($target[0].type === "cons") {
if ($target[0][0].type === "cst/identifier") {
if ($target[0][0][0] === "def"){
if ($target[0][1].type === "cons") {
if ($target[0][1][0].type === "cst/identifier") {
{
let id = $target[0][1][0][0];
if ($target[0][1][1].type === "cons") {
{
let value = $target[0][1][1][0];
if ($target[0][1][1][1].type === "nil") {
return sdef(id)(parse_expr(value))
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
return sdef(id)(parse_expr(cst$sllist(cons(cst$slidentifier("fn")(a))(cons(cst$slarray(args)(b))(cons(body)(nil))))(c)))
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
let items = $target[0][1][1];
return mk_deftype(id)(items)
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
let items = $target[0][1][1];
return mk_deftype(id)(items)
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
return sexpr(parse_expr(cst))
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

const compile_stmt = (stmt) => (($target) => {if ($target.type === "sexpr") {
{
let expr = $target[0];
return compile(expr)
}
}
if ($target.type === "sdef") {
{
let name = $target[0];
{
let body = $target[1];
return $pl$pl(cons("const ")(cons(sanitize(name))(cons(" = ")(cons(compile(body))(cons(";\n")(nil))))))
}
}
}
if ($target.type === "sdeftype") {
{
let name = $target[0];
{
let cases = $target[1];
return join("\n")(map(cases)(($case) => (($target) => {if ($target.type === ",") {
{
let name2 = $target[0];
{
let args = $target[1];
return $pl$pl(cons("const ")(cons(name2)(cons(" = ")(cons($pl$pl(mapi(0)(args)((i) => (_) => $pl$pl(cons("(v")(cons(int_to_string(i))(cons(") => ")(nil)))))))(cons("({type: \"")(cons(name2)(cons("\"")(cons($pl$pl(mapi(0)(args)((i) => (_) => $pl$pl(cons(", ")(cons(int_to_string(i))(cons(": v")(cons(int_to_string(i))(nil))))))))(cons("});")(nil))))))))))
}
}
}
throw new Error('Failed to match. ' + valueToString($target))})($case)))
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

const escape_string = (string) => replaces(string)(cons($co("\\")("\\\\"))(cons($co("\n")("\\\n"))(cons($co("\"")("\\\""))(cons($co("\`")("\\\`"))(cons($co("\$")("\\\$"))(nil))))));

const unescape_string = (string) => replaces(string)(cons($co("\\\"")("\""))(cons($co("\\\n")("\n"))(cons($co("\\\\")("\\"))(nil))));

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

const pat_loop = (target) => (args) => (i) => (inner) => (($target) => {if ($target.type === "nil") {
return inner
}
if ($target.type === "cons") {
{
let arg = $target[0];
{
let rest = $target[1];
return compile_pat(arg)(`${target}[${i}]`)(pat_loop(target)(rest)($pl(i)(1))(inner))
}
}
}
throw new Error('Failed to match. ' + valueToString($target))})(args);

const compile_pat = (pat) => (target) => (inner) => (($target) => {if ($target.type === "pany") {
return inner
}
if ($target.type === "pprim") {
{
let prim = $target[0];
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
if ($target.type === "pstr") {
{
let str = $target[0];
return `if (${target} === \"${str}\"){\n${inner}\n}`
}
}
if ($target.type === "pvar") {
{
let name = $target[0];
return `{\nlet ${sanitize(name)} = ${target};\n${inner}\n}`
}
}
if ($target.type === "pcon") {
{
let name = $target[0];
{
let args = $target[1];
return `if (${target}.type === \"${name}\") {\n${pat_loop(target)(args)(0)(inner)}\n}`
}
}
}
throw new Error('Failed to match. ' + valueToString($target))})(pat);

const compile = (expr) => (($target) => {if ($target.type === "estr") {
{
let first = $target[0];
{
let tpls = $target[1];
return (($target) => {if ($target.type === "nil") {
return `\"${escape_string(unescape_string(first))}\"`
}
return `\`${escape_string(unescape_string(first))}${join("")(map(tpls)((item) => (($target) => {if ($target.type === ",") {
{
let expr = $target[0];
{
let suffix = $target[1];
return `\${${compile(expr)}}${escape_string(unescape_string(suffix))}`
}
}
}
throw new Error('Failed to match. ' + valueToString($target))})(item)))}\``
throw new Error('Failed to match. ' + valueToString($target))})(tpls)
}
}
}
if ($target.type === "eprim") {
{
let prim = $target[0];
return (($target) => {if ($target.type === "pstr") {
{
let string = $target[0];
return $pl$pl(cons("\"")(cons(escape_string(unescape_string(string)))(cons("\"")(nil))))
}
}
if ($target.type === "pint") {
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
if ($target.type === "evar") {
{
let name = $target[0];
return sanitize(name)
}
}
if ($target.type === "equot") {
{
let inner = $target[0];
return jsonify(inner)
}
}
if ($target.type === "elambda") {
{
let name = $target[0];
{
let body = $target[1];
return $pl$pl(cons("(")(cons(sanitize(name))(cons(") => ")(cons(compile(body))(nil)))))
}
}
}
if ($target.type === "elet") {
{
let name = $target[0];
{
let init = $target[1];
{
let body = $target[2];
return $pl$pl(cons("((")(cons(sanitize(name))(cons(") => ")(cons(compile(body))(cons(")(")(cons(compile(init))(cons(")")(nil))))))))
}
}
}
}
if ($target.type === "eapp") {
{
let fn = $target[0];
{
let arg = $target[1];
return (($target) => {if ($target.type === "elambda") {
{
let name = $target[0];
return $pl$pl(cons("(")(cons(compile(fn))(cons(")(")(cons(compile(arg))(cons(")")(nil))))))
}
}
return $pl$pl(cons(compile(fn))(cons("(")(cons(compile(arg))(cons(")")(nil)))))
throw new Error('Failed to match. ' + valueToString($target))})(fn)
}
}
}
if ($target.type === "ematch") {
{
let target = $target[0];
{
let cases = $target[1];
return `((\$target) => {\n${join("\n")(map(cases)(($case) => (($target) => {if ($target.type === ",") {
{
let pat = $target[0];
{
let body = $target[1];
return compile_pat(pat)("\$target")(`return ${compile(body)}`)
}
}
}
throw new Error('Failed to match. ' + valueToString($target))})($case)))}\nthrow new Error('failed to match');})(${compile(target)})`
}
}
}
throw new Error('Failed to match. ' + valueToString($target))})(expr);

return {type: 'fns', ast, better_match, builtins, compilation, compile, compile_pat, compile_stmt, consr, escape_string, foldl, foldr, fst, join, map, mapi, mk_deftype, pairs, parse_expr, parse_pat, parse_stmt, parse_type, parsing, pat_loop, prelude, quot, replaces, snd, tapps, unescape_string, util}