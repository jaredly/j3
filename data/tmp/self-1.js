const pint = (v0) => (v1) => ({type: "pint", 0: v0, 1: v1})
const pbool = (v0) => (v1) => ({type: "pbool", 0: v0, 1: v1})
const maybe_parens = (inner) => (parens) => (($target) => {
if ($target === true) {
return `(${inner})`
}
return inner
throw new Error('Failed to match. ' + valueToString($target));
})(parens);

const compile_prim = (prim) => (($target) => {
if ($target.type === "pint") {
{
let int = $target[0];
return int_to_string(int)
}
}
if ($target.type === "pbool") {
{
let bool = $target[0];
return (($target) => {
if ($target === true) {
return "true"
}
if ($target === false) {
return "false"
}
throw new Error('Failed to match. ' + valueToString($target));
})(bool)
}
}
throw new Error('Failed to match. ' + valueToString($target));
})(prim);

const some = (v0) => ({type: "some", 0: v0})
const none = ({type: "none"})
const tvar = (v0) => (v1) => ({type: "tvar", 0: v0, 1: v1})
const tapp = (v0) => (v1) => (v2) => ({type: "tapp", 0: v0, 1: v1, 2: v2})
const tcon = (v0) => (v1) => ({type: "tcon", 0: v0, 1: v1})
const nil = ({type: "nil"})
const cons = (v0) => (v1) => ({type: "cons", 0: v0, 1: v1})
const cst$slidentifier = (v0) => (v1) => ({type: "cst/identifier", 0: v0, 1: v1})
const cst$sllist = (v0) => (v1) => ({type: "cst/list", 0: v0, 1: v1})
const cst$slarray = (v0) => (v1) => ({type: "cst/array", 0: v0, 1: v1})
const cst$slrecord = (v0) => (v1) => ({type: "cst/record", 0: v0, 1: v1})
const cst$slspread = (v0) => (v1) => ({type: "cst/spread", 0: v0, 1: v1})
const cst$slstring = (v0) => (v1) => (v2) => ({type: "cst/string", 0: v0, 1: v1, 2: v2})
const join = (sep) => (items) => (($target) => {
if ($target.type === "nil") {
return ""
}
if ($target.type === "cons") {
{
let one = $target[0];
let rest = $target[1];
return (($target) => {
if ($target.type === "nil") {
return one
}
return `${one}${sep}${join(sep)(rest)}`
throw new Error('Failed to match. ' + valueToString($target));
})(rest)
}
}
throw new Error('Failed to match. ' + valueToString($target));
})(items);

const map = (values) => (f) => (($target) => {
if ($target.type === "nil") {
return nil
}
if ($target.type === "cons") {
{
let one = $target[0];
let rest = $target[1];
return cons(f(one))(map(rest)(f))
}
}
throw new Error('Failed to match. ' + valueToString($target));
})(values);

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

const mapi = (i) => (values) => (f) => (($target) => {
if ($target.type === "nil") {
return nil
}
if ($target.type === "cons") {
{
let one = $target[0];
let rest = $target[1];
return cons(f(i)(one))(mapi($pl(1)(i))(rest)(f))
}
}
throw new Error('Failed to match. ' + valueToString($target));
})(values);

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

const replaces = (target) => (repl) => (($target) => {
if ($target.type === "nil") {
return target
}
if ($target.type === "cons") {
{
let one = $target[0];
let rest = $target[1];
return (($target) => {
if ($target.type === ",") {
{
let find = $target[0];
let nw = $target[1];
return replaces(replace_all(target)(find)(nw))(rest)
}
}
throw new Error('Failed to match. ' + valueToString($target));
})(one)
}
}
throw new Error('Failed to match. ' + valueToString($target));
})(repl);

const constructor_fn = (name) => (args) => `({type: \"${name}\"${join("")(mapi(0)(args)((i) => (arg) => `, ${int_to_string(i)}: ${arg}`))}})`;

const escape_string = (string) => replaces(string)(cons($co("\\")("\\\\"))(cons($co("\n")("\\n"))(cons($co("\"")("\\\""))(cons($co("\`")("\\\`"))(cons($co("\$")("\\\$"))(nil))))));

const indices = (lst) => mapi(0)(lst)((i) => (_) => i);

const concat = (lsts) => (($target) => {
if ($target.type === "nil") {
return nil
}
if ($target.type === "cons" &&
$target[1].type === "nil") {
{
let one = $target[0];
return one
}
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
let lsts = $target[1];
return cons(one)(concat(cons(rest)(lsts)))
}
}
throw new Error('Failed to match. ' + valueToString($target));
})(lsts);

const fix_slashes = (str) => escape_string(unescapeString(str));

const pany = (v0) => ({type: "pany", 0: v0})
const pvar = (v0) => (v1) => ({type: "pvar", 0: v0, 1: v1})
const pprim = (v0) => (v1) => ({type: "pprim", 0: v0, 1: v1})
const pstr = (v0) => (v1) => ({type: "pstr", 0: v0, 1: v1})
const pcon = (v0) => (v1) => (v2) => (v3) => ({type: "pcon", 0: v0, 1: v1, 2: v2, 3: v3})
const sdeftype = (v0) => (v1) => (v2) => (v3) => (v4) => ({type: "sdeftype", 0: v0, 1: v1, 2: v2, 3: v3, 4: v4})
const sdef = (v0) => (v1) => (v2) => (v3) => ({type: "sdef", 0: v0, 1: v1, 2: v2, 3: v3})
const sexpr = (v0) => (v1) => ({type: "sexpr", 0: v0, 1: v1})
const stypealias = ({type: "stypealias"})

const eprim = (v0) => (v1) => ({type: "eprim", 0: v0, 1: v1})
const estr = (v0) => (v1) => (v2) => ({type: "estr", 0: v0, 1: v1, 2: v2})
const evar = (v0) => (v1) => ({type: "evar", 0: v0, 1: v1})
const equot = (v0) => (v1) => ({type: "equot", 0: v0, 1: v1})
const elambda = (v0) => (v1) => (v2) => ({type: "elambda", 0: v0, 1: v1, 2: v2})
const eapp = (v0) => (v1) => (v2) => ({type: "eapp", 0: v0, 1: v1, 2: v2})
const elet = (v0) => (v1) => (v2) => ({type: "elet", 0: v0, 1: v1, 2: v2})
const ematch = (v0) => (v1) => (v2) => ({type: "ematch", 0: v0, 1: v1, 2: v2})

const quot$slexpr = (v0) => ({type: "quot/expr", 0: v0})
const quot$slstmt = (v0) => ({type: "quot/stmt", 0: v0})
const quot$sltype = (v0) => ({type: "quot/type", 0: v0})
const quot$slpat = (v0) => ({type: "quot/pat", 0: v0})
const quot$slquot = (v0) => ({type: "quot/quot", 0: v0})
const compile_pat_naive = (pat) => (target) => (inner) => (($target) => {
if ($target.type === "pany") {
return inner
}
if ($target.type === "pprim") {
{
let prim = $target[0];
return `if (${target} === ${compile_prim(prim)}) {\n${inner}\n}`
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
let args = $target[2];
return `if (${target}.type === \"${name}\") {\n${pat_loop(target)(args)(0)(inner)}\n}`
}
}
throw new Error('Failed to match. ' + valueToString($target));
})(pat);


const pat_loop = (target) => (args) => (i) => (inner) => (($target) => {
if ($target.type === "nil") {
return inner
}
if ($target.type === "cons") {
{
let arg = $target[0];
let rest = $target[1];
return compile_pat_naive(arg)(`${target}[${int_to_string(i)}]`)(pat_loop(target)(rest)($pl(i)(1))(inner))
}
}
throw new Error('Failed to match. ' + valueToString($target));
})(args);

const compile_pat_list = (pat) => (target) => (($target) => {
if ($target.type === "pany") {
return $co(nil)(nil)
}
if ($target.type === "pprim") {
{
let prim = $target[0];
return $co(cons(`${target} === ${compile_prim(prim)}`)(nil))(nil)
}
}
if ($target.type === "pstr") {
{
let str = $target[0];
return $co(cons(`${target} === \"${str}\"`)(nil))(nil)
}
}
if ($target.type === "pvar") {
{
let name = $target[0];
return $co(nil)(cons(`let ${sanitize(name)} = ${target};`)(nil))
}
}
if ($target.type === "pcon") {
{
let name = $target[0];
let args = $target[2];
return (({1: assign, 0: check}) => $co(cons(`${target}.type === \"${name}\"`)(check))(assign))(pat_loop_list(target)(args)(0))
}
}
throw new Error('Failed to match. ' + valueToString($target));
})(pat);


const pat_loop_list = (target) => (args) => (i) => (($target) => {
if ($target.type === "nil") {
return $co(nil)(nil)
}
if ($target.type === "cons") {
{
let arg = $target[0];
let rest = $target[1];
return (({1: assign, 0: check}) => (({1: a2, 0: c2}) => $co(concat(cons(check)(cons(c2)(nil))))(concat(cons(assign)(cons(a2)(nil)))))(pat_loop_list(target)(rest)($pl(i)(1))))(compile_pat_list(arg)(`${target}[${int_to_string(i)}]`))
}
}
throw new Error('Failed to match. ' + valueToString($target));
})(args);

const pat_as_arg_inner = (pat) => (($target) => {
if ($target.type === "pany") {
return none
}
if ($target.type === "pprim") {
return none
}
if ($target.type === "pstr") {
return none
}
if ($target.type === "pvar") {
{
let name = $target[0];
return some(sanitize(name))
}
}
if ($target.type === "pcon") {
{
let args = $target[2];
return (($target) => {
if ($target.type === "," &&
$target[1].type === "nil") {
return none
}
if ($target.type === ",") {
{
let args = $target[1];
return some(`{${join(", ")(args)}}`)
}
}
throw new Error('Failed to match. ' + valueToString($target));
})(foldl($co(0)(nil))(args)(({1: res, 0: i}) => (arg) => $co($pl(i)(1))((($target) => {
if ($target.type === "none") {
return res
}
if ($target.type === "some") {
{
let arg = $target[0];
return cons(`${int_to_string(i)}: ${arg}`)(res)
}
}
throw new Error('Failed to match. ' + valueToString($target));
})(pat_as_arg_inner(arg)))))
}
}
return fatal(`No pat ${jsonify(pat)}`)
throw new Error('Failed to match. ' + valueToString($target));
})(pat);

const needs_parens = (expr) => (($target) => {
if ($target.type === "elambda") {
return true
}
if ($target.type === "eprim") {
return true
}
return false
throw new Error('Failed to match. ' + valueToString($target));
})(expr);

const compile_quot = (quot) => (($target) => {
if ($target.type === "quot/quot") {
{
let x = $target[0];
return jsonify(x)
}
}
if ($target.type === "quot/expr") {
{
let x = $target[0];
return jsonify(x)
}
}
if ($target.type === "quot/stmt") {
{
let x = $target[0];
return jsonify(x)
}
}
if ($target.type === "quot/pat") {
{
let x = $target[0];
return jsonify(x)
}
}
if ($target.type === "quot/type") {
{
let x = $target[0];
return jsonify(x)
}
}
throw new Error('Failed to match. ' + valueToString($target));
})(quot);

const compile_pat = (pat) => (target) => (inner) => (({1: assign, 0: check}) => ((inner) => ((inner) => inner)((($target) => {
if ($target.type === "nil") {
return inner
}
return `if (${join(" &&\n")(check)}) {\n${inner}\n}`
throw new Error('Failed to match. ' + valueToString($target));
})(check)))((($target) => {
if ($target.type === "nil") {
return inner
}
return `{\n${join("\n")(assign)}\n${inner}\n}`
throw new Error('Failed to match. ' + valueToString($target));
})(assign)))(compile_pat_list(pat)(target));

const pat_as_arg = (pat) => (($target) => {
if ($target.type === "none") {
return "_"
}
if ($target.type === "some") {
{
let arg = $target[0];
return arg
}
}
throw new Error('Failed to match. ' + valueToString($target));
})(pat_as_arg_inner(pat));

const compile = (expr) => (($target) => {
if ($target.type === "estr") {
{
let first = $target[0];
let tpls = $target[1];
return (($target) => {
if ($target.type === "nil") {
return `\"${fix_slashes(first)}\"`
}
return ((tpls) => `\`${fix_slashes(first)}${join("")(tpls)}\``)(map(tpls)((item) => (({1: {0: suffix}, 0: expr}) => `\${${compile(expr)}}${fix_slashes(suffix)}`)(item)))
throw new Error('Failed to match. ' + valueToString($target));
})(tpls)
}
}
if ($target.type === "eprim") {
{
let prim = $target[0];
return compile_prim(prim)
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
return compile_quot(inner)
}
}
if ($target.type === "elambda") {
{
let pats = $target[0];
let body = $target[1];
return foldr(compile(body))(pats)((body) => (pat) => `(${pat_as_arg(pat)}) => ${body}`)
}
}
if ($target.type === "elet") {
{
let bindings = $target[0];
let body = $target[1];
return foldr(compile(body))(bindings)((body) => ({1: init, 0: pat}) => `((${pat_as_arg(pat)}) => ${body})(${compile(init)})`)
}
}
if ($target.type === "eapp") {
{
let f = $target[0];
let args = $target[1];
return foldl(with_parens(f))(args)((target) => (arg) => `${target}(${compile(arg)})`)
}
}
if ($target.type === "ematch") {
{
let target = $target[0];
let cases = $target[1];
return ((cases) => `((\$target) => {\n${join("\n")(cases)}\nthrow new Error('Failed to match. ' + valueToString(\$target));\n})(${compile(target)})`)(map(cases)(($case) => (({1: body, 0: pat}) => compile_pat(pat)("\$target")(`return ${compile(body)}`))($case)))
}
}
throw new Error('Failed to match. ' + valueToString($target));
})(expr);


const with_parens = (expr) => maybe_parens(compile(expr))(needs_parens(expr));

const compile_st = (stmt) => (($target) => {
if ($target.type === "sexpr") {
{
let expr = $target[0];
return compile(expr)
}
}
if ($target.type === "sdef") {
{
let name = $target[0];
let body = $target[2];
return `const ${sanitize(name)} = ${compile(body)};\n`
}
}
if ($target.type === "sdeftype") {
{
let name = $target[0];
let cases = $target[3];
return join("\n")(map(cases)(($case) => (({1: {1: {0: args}}, 0: name}) => ((arrows) => ((body) => `const ${sanitize(name)} = ${arrows}${body}`)(constructor_fn(name)(map(indices(args))((i) => `v${int_to_string(i)}`))))(join("")(map(indices(args))((i) => `(v${int_to_string(i)}) => `))))($case)))
}
}
if ($target.type === "stypealias") {
return "/* type alias */"
}
throw new Error('Failed to match. ' + valueToString($target));
})(stmt);

return eval("compile => compile_stmt => ({type:'fns',compile: a => _ => compile(a), compile_stmt: a => _ => compile_stmt(a)})")(compile)(compile_st)