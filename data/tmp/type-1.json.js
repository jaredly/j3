const ast = (trace) => (($target) => {if ($target.type === "estr") {
{
let first = $target[0];
{
let tpls = $target[1];
{
let l = $target[2];
return (($target) => {if ($target.type === "nil") {
return `\"${escape_string(unescape_string(first))}\"`
}
return `\`${escape_string(unescape_string(first))}${join("")(map(tpls)((item) => (($target) => {if ($target.type === ",,") {
{
let expr = $target[0];
{
let suffix = $target[1];
{
let l = $target[2];
return `\${${compile(expr)}}${escape_string(unescape_string(suffix))}`
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
if ($target.type === "elambda") {
{
let name = $target[0];
{
let nl = $target[1];
{
let body = $target[2];
{
let l = $target[3];
return $pl$pl(cons("(")(cons(sanitize(name))(cons(") => ")(cons(compile(body))(nil)))))
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
return `(() => {const \$target = ${compile(init)};\n${compile_pat(pat)("\$target")(`return ${compile(body)}`)};\nthrow new Error('let pattern not matched ${pat_loc(pat)}. ' + valueToString(\$target));})()`
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
return $pl$pl(cons("(")(cons(compile(fn))(cons(")(")(cons(compile(arg))(cons(")")(nil))))))
}
}
return $pl$pl(cons(compile(fn))(cons("(")(cons(compile(arg))(cons(")")(nil)))))
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
return `((\$target) => {\n${join("\n")(map(cases)(($case) => (($target) => {if ($target.type === ",") {
{
let pat = $target[0];
{
let body = $target[1];
return compile_pat(pat)("\$target")(`return ${compile(body)}`)
}
}
}
throw new Error('Failed to match. ' + valueToString($target))})($case)))}\nthrow new Error('failed to match ' + jsonify(\$target) + '. Loc: ${l}');})(${compile(target)})`
}
}
}
}
throw new Error('Failed to match. ' + valueToString($target))})(expr);

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
const type_to_string = (trace) => (($target) => {if ($target.type === "estr") {
{
let first = $target[0];
{
let tpls = $target[1];
{
let l = $target[2];
return (($target) => {if ($target.type === "nil") {
return `\"${escape_string(unescape_string(first))}\"`
}
return `\`${escape_string(unescape_string(first))}${join("")(map(tpls)((item) => (($target) => {if ($target.type === ",,") {
{
let expr = $target[0];
{
let suffix = $target[1];
{
let l = $target[2];
return `\${${compile(expr)}}${escape_string(unescape_string(suffix))}`
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
if ($target.type === "elambda") {
{
let name = $target[0];
{
let nl = $target[1];
{
let body = $target[2];
{
let l = $target[3];
return $pl$pl(cons("(")(cons(sanitize(name))(cons(") => ")(cons(compile(body))(nil)))))
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
return `(() => {const \$target = ${compile(init)};\n${compile_pat(pat)("\$target")(`return ${compile(body)}`)};\nthrow new Error('let pattern not matched ${pat_loc(pat)}. ' + valueToString(\$target));})()`
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
return $pl$pl(cons("(")(cons(compile(fn))(cons(")(")(cons(compile(arg))(cons(")")(nil))))))
}
}
return $pl$pl(cons(compile(fn))(cons("(")(cons(compile(arg))(cons(")")(nil)))))
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
return `((\$target) => {\n${join("\n")(map(cases)(($case) => (($target) => {if ($target.type === ",") {
{
let pat = $target[0];
{
let body = $target[1];
return compile_pat(pat)("\$target")(`return ${compile(body)}`)
}
}
}
throw new Error('Failed to match. ' + valueToString($target))})($case)))}\nthrow new Error('failed to match ' + jsonify(\$target) + '. Loc: ${l}');})(${compile(target)})`
}
}
}
}
throw new Error('Failed to match. ' + valueToString($target))})(expr);

const prelude = (trace) => (($target) => {if ($target.type === "estr") {
{
let first = $target[0];
{
let tpls = $target[1];
{
let l = $target[2];
return (($target) => {if ($target.type === "nil") {
return `\"${escape_string(unescape_string(first))}\"`
}
return `\`${escape_string(unescape_string(first))}${join("")(map(tpls)((item) => (($target) => {if ($target.type === ",,") {
{
let expr = $target[0];
{
let suffix = $target[1];
{
let l = $target[2];
return `\${${compile(expr)}}${escape_string(unescape_string(suffix))}`
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
if ($target.type === "elambda") {
{
let name = $target[0];
{
let nl = $target[1];
{
let body = $target[2];
{
let l = $target[3];
return $pl$pl(cons("(")(cons(sanitize(name))(cons(") => ")(cons(compile(body))(nil)))))
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
return `(() => {const \$target = ${compile(init)};\n${compile_pat(pat)("\$target")(`return ${compile(body)}`)};\nthrow new Error('let pattern not matched ${pat_loc(pat)}. ' + valueToString(\$target));})()`
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
return $pl$pl(cons("(")(cons(compile(fn))(cons(")(")(cons(compile(arg))(cons(")")(nil))))))
}
}
return $pl$pl(cons(compile(fn))(cons("(")(cons(compile(arg))(cons(")")(nil)))))
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
return `((\$target) => {\n${join("\n")(map(cases)(($case) => (($target) => {if ($target.type === ",") {
{
let pat = $target[0];
{
let body = $target[1];
return compile_pat(pat)("\$target")(`return ${compile(body)}`)
}
}
}
throw new Error('Failed to match. ' + valueToString($target))})($case)))}\nthrow new Error('failed to match ' + jsonify(\$target) + '. Loc: ${l}');})(${compile(target)})`
}
}
}
}
throw new Error('Failed to match. ' + valueToString($target))})(expr);

const map = (trace) => (($target) => {if ($target.type === "estr") {
{
let first = $target[0];
{
let tpls = $target[1];
{
let l = $target[2];
return (($target) => {if ($target.type === "nil") {
return `\"${escape_string(unescape_string(first))}\"`
}
return `\`${escape_string(unescape_string(first))}${join("")(map(tpls)((item) => (($target) => {if ($target.type === ",,") {
{
let expr = $target[0];
{
let suffix = $target[1];
{
let l = $target[2];
return `\${${compile(expr)}}${escape_string(unescape_string(suffix))}`
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
if ($target.type === "elambda") {
{
let name = $target[0];
{
let nl = $target[1];
{
let body = $target[2];
{
let l = $target[3];
return $pl$pl(cons("(")(cons(sanitize(name))(cons(") => ")(cons(compile(body))(nil)))))
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
return `(() => {const \$target = ${compile(init)};\n${compile_pat(pat)("\$target")(`return ${compile(body)}`)};\nthrow new Error('let pattern not matched ${pat_loc(pat)}. ' + valueToString(\$target));})()`
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
return $pl$pl(cons("(")(cons(compile(fn))(cons(")(")(cons(compile(arg))(cons(")")(nil))))))
}
}
return $pl$pl(cons(compile(fn))(cons("(")(cons(compile(arg))(cons(")")(nil)))))
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
return `((\$target) => {\n${join("\n")(map(cases)(($case) => (($target) => {if ($target.type === ",") {
{
let pat = $target[0];
{
let body = $target[1];
return compile_pat(pat)("\$target")(`return ${compile(body)}`)
}
}
}
throw new Error('Failed to match. ' + valueToString($target))})($case)))}\nthrow new Error('failed to match ' + jsonify(\$target) + '. Loc: ${l}');})(${compile(target)})`
}
}
}
}
throw new Error('Failed to match. ' + valueToString($target))})(expr);

const mapi = (trace) => (($target) => {if ($target.type === "estr") {
{
let first = $target[0];
{
let tpls = $target[1];
{
let l = $target[2];
return (($target) => {if ($target.type === "nil") {
return `\"${escape_string(unescape_string(first))}\"`
}
return `\`${escape_string(unescape_string(first))}${join("")(map(tpls)((item) => (($target) => {if ($target.type === ",,") {
{
let expr = $target[0];
{
let suffix = $target[1];
{
let l = $target[2];
return `\${${compile(expr)}}${escape_string(unescape_string(suffix))}`
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
if ($target.type === "elambda") {
{
let name = $target[0];
{
let nl = $target[1];
{
let body = $target[2];
{
let l = $target[3];
return $pl$pl(cons("(")(cons(sanitize(name))(cons(") => ")(cons(compile(body))(nil)))))
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
return `(() => {const \$target = ${compile(init)};\n${compile_pat(pat)("\$target")(`return ${compile(body)}`)};\nthrow new Error('let pattern not matched ${pat_loc(pat)}. ' + valueToString(\$target));})()`
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
return $pl$pl(cons("(")(cons(compile(fn))(cons(")(")(cons(compile(arg))(cons(")")(nil))))))
}
}
return $pl$pl(cons(compile(fn))(cons("(")(cons(compile(arg))(cons(")")(nil)))))
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
return `((\$target) => {\n${join("\n")(map(cases)(($case) => (($target) => {if ($target.type === ",") {
{
let pat = $target[0];
{
let body = $target[1];
return compile_pat(pat)("\$target")(`return ${compile(body)}`)
}
}
}
throw new Error('Failed to match. ' + valueToString($target))})($case)))}\nthrow new Error('failed to match ' + jsonify(\$target) + '. Loc: ${l}');})(${compile(target)})`
}
}
}
}
throw new Error('Failed to match. ' + valueToString($target))})(expr);

const foldl = (trace) => (($target) => {if ($target.type === "estr") {
{
let first = $target[0];
{
let tpls = $target[1];
{
let l = $target[2];
return (($target) => {if ($target.type === "nil") {
return `\"${escape_string(unescape_string(first))}\"`
}
return `\`${escape_string(unescape_string(first))}${join("")(map(tpls)((item) => (($target) => {if ($target.type === ",,") {
{
let expr = $target[0];
{
let suffix = $target[1];
{
let l = $target[2];
return `\${${compile(expr)}}${escape_string(unescape_string(suffix))}`
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
if ($target.type === "elambda") {
{
let name = $target[0];
{
let nl = $target[1];
{
let body = $target[2];
{
let l = $target[3];
return $pl$pl(cons("(")(cons(sanitize(name))(cons(") => ")(cons(compile(body))(nil)))))
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
return `(() => {const \$target = ${compile(init)};\n${compile_pat(pat)("\$target")(`return ${compile(body)}`)};\nthrow new Error('let pattern not matched ${pat_loc(pat)}. ' + valueToString(\$target));})()`
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
return $pl$pl(cons("(")(cons(compile(fn))(cons(")(")(cons(compile(arg))(cons(")")(nil))))))
}
}
return $pl$pl(cons(compile(fn))(cons("(")(cons(compile(arg))(cons(")")(nil)))))
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
return `((\$target) => {\n${join("\n")(map(cases)(($case) => (($target) => {if ($target.type === ",") {
{
let pat = $target[0];
{
let body = $target[1];
return compile_pat(pat)("\$target")(`return ${compile(body)}`)
}
}
}
throw new Error('Failed to match. ' + valueToString($target))})($case)))}\nthrow new Error('failed to match ' + jsonify(\$target) + '. Loc: ${l}');})(${compile(target)})`
}
}
}
}
throw new Error('Failed to match. ' + valueToString($target))})(expr);

const foldr = (trace) => (($target) => {if ($target.type === "estr") {
{
let first = $target[0];
{
let tpls = $target[1];
{
let l = $target[2];
return (($target) => {if ($target.type === "nil") {
return `\"${escape_string(unescape_string(first))}\"`
}
return `\`${escape_string(unescape_string(first))}${join("")(map(tpls)((item) => (($target) => {if ($target.type === ",,") {
{
let expr = $target[0];
{
let suffix = $target[1];
{
let l = $target[2];
return `\${${compile(expr)}}${escape_string(unescape_string(suffix))}`
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
if ($target.type === "elambda") {
{
let name = $target[0];
{
let nl = $target[1];
{
let body = $target[2];
{
let l = $target[3];
return $pl$pl(cons("(")(cons(sanitize(name))(cons(") => ")(cons(compile(body))(nil)))))
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
return `(() => {const \$target = ${compile(init)};\n${compile_pat(pat)("\$target")(`return ${compile(body)}`)};\nthrow new Error('let pattern not matched ${pat_loc(pat)}. ' + valueToString(\$target));})()`
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
return $pl$pl(cons("(")(cons(compile(fn))(cons(")(")(cons(compile(arg))(cons(")")(nil))))))
}
}
return $pl$pl(cons(compile(fn))(cons("(")(cons(compile(arg))(cons(")")(nil)))))
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
return `((\$target) => {\n${join("\n")(map(cases)(($case) => (($target) => {if ($target.type === ",") {
{
let pat = $target[0];
{
let body = $target[1];
return compile_pat(pat)("\$target")(`return ${compile(body)}`)
}
}
}
throw new Error('Failed to match. ' + valueToString($target))})($case)))}\nthrow new Error('failed to match ' + jsonify(\$target) + '. Loc: ${l}');})(${compile(target)})`
}
}
}
}
throw new Error('Failed to match. ' + valueToString($target))})(expr);

const scheme = (v0) => (v1) => ({type: "scheme", 0: v0, 1: v1});
const type_free = (trace) => (($target) => {if ($target.type === "estr") {
{
let first = $target[0];
{
let tpls = $target[1];
{
let l = $target[2];
return (($target) => {if ($target.type === "nil") {
return `\"${escape_string(unescape_string(first))}\"`
}
return `\`${escape_string(unescape_string(first))}${join("")(map(tpls)((item) => (($target) => {if ($target.type === ",,") {
{
let expr = $target[0];
{
let suffix = $target[1];
{
let l = $target[2];
return `\${${compile(expr)}}${escape_string(unescape_string(suffix))}`
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
if ($target.type === "elambda") {
{
let name = $target[0];
{
let nl = $target[1];
{
let body = $target[2];
{
let l = $target[3];
return $pl$pl(cons("(")(cons(sanitize(name))(cons(") => ")(cons(compile(body))(nil)))))
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
return `(() => {const \$target = ${compile(init)};\n${compile_pat(pat)("\$target")(`return ${compile(body)}`)};\nthrow new Error('let pattern not matched ${pat_loc(pat)}. ' + valueToString(\$target));})()`
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
return $pl$pl(cons("(")(cons(compile(fn))(cons(")(")(cons(compile(arg))(cons(")")(nil))))))
}
}
return $pl$pl(cons(compile(fn))(cons("(")(cons(compile(arg))(cons(")")(nil)))))
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
return `((\$target) => {\n${join("\n")(map(cases)(($case) => (($target) => {if ($target.type === ",") {
{
let pat = $target[0];
{
let body = $target[1];
return compile_pat(pat)("\$target")(`return ${compile(body)}`)
}
}
}
throw new Error('Failed to match. ' + valueToString($target))})($case)))}\nthrow new Error('failed to match ' + jsonify(\$target) + '. Loc: ${l}');})(${compile(target)})`
}
}
}
}
throw new Error('Failed to match. ' + valueToString($target))})(expr);

const type_apply = (trace) => (($target) => {if ($target.type === "estr") {
{
let first = $target[0];
{
let tpls = $target[1];
{
let l = $target[2];
return (($target) => {if ($target.type === "nil") {
return `\"${escape_string(unescape_string(first))}\"`
}
return `\`${escape_string(unescape_string(first))}${join("")(map(tpls)((item) => (($target) => {if ($target.type === ",,") {
{
let expr = $target[0];
{
let suffix = $target[1];
{
let l = $target[2];
return `\${${compile(expr)}}${escape_string(unescape_string(suffix))}`
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
if ($target.type === "elambda") {
{
let name = $target[0];
{
let nl = $target[1];
{
let body = $target[2];
{
let l = $target[3];
return $pl$pl(cons("(")(cons(sanitize(name))(cons(") => ")(cons(compile(body))(nil)))))
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
return `(() => {const \$target = ${compile(init)};\n${compile_pat(pat)("\$target")(`return ${compile(body)}`)};\nthrow new Error('let pattern not matched ${pat_loc(pat)}. ' + valueToString(\$target));})()`
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
return $pl$pl(cons("(")(cons(compile(fn))(cons(")(")(cons(compile(arg))(cons(")")(nil))))))
}
}
return $pl$pl(cons(compile(fn))(cons("(")(cons(compile(arg))(cons(")")(nil)))))
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
return `((\$target) => {\n${join("\n")(map(cases)(($case) => (($target) => {if ($target.type === ",") {
{
let pat = $target[0];
{
let body = $target[1];
return compile_pat(pat)("\$target")(`return ${compile(body)}`)
}
}
}
throw new Error('Failed to match. ' + valueToString($target))})($case)))}\nthrow new Error('failed to match ' + jsonify(\$target) + '. Loc: ${l}');})(${compile(target)})`
}
}
}
}
throw new Error('Failed to match. ' + valueToString($target))})(expr);

const scheme_free = (trace) => (($target) => {if ($target.type === "estr") {
{
let first = $target[0];
{
let tpls = $target[1];
{
let l = $target[2];
return (($target) => {if ($target.type === "nil") {
return `\"${escape_string(unescape_string(first))}\"`
}
return `\`${escape_string(unescape_string(first))}${join("")(map(tpls)((item) => (($target) => {if ($target.type === ",,") {
{
let expr = $target[0];
{
let suffix = $target[1];
{
let l = $target[2];
return `\${${compile(expr)}}${escape_string(unescape_string(suffix))}`
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
if ($target.type === "elambda") {
{
let name = $target[0];
{
let nl = $target[1];
{
let body = $target[2];
{
let l = $target[3];
return $pl$pl(cons("(")(cons(sanitize(name))(cons(") => ")(cons(compile(body))(nil)))))
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
return `(() => {const \$target = ${compile(init)};\n${compile_pat(pat)("\$target")(`return ${compile(body)}`)};\nthrow new Error('let pattern not matched ${pat_loc(pat)}. ' + valueToString(\$target));})()`
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
return $pl$pl(cons("(")(cons(compile(fn))(cons(")(")(cons(compile(arg))(cons(")")(nil))))))
}
}
return $pl$pl(cons(compile(fn))(cons("(")(cons(compile(arg))(cons(")")(nil)))))
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
return `((\$target) => {\n${join("\n")(map(cases)(($case) => (($target) => {if ($target.type === ",") {
{
let pat = $target[0];
{
let body = $target[1];
return compile_pat(pat)("\$target")(`return ${compile(body)}`)
}
}
}
throw new Error('Failed to match. ' + valueToString($target))})($case)))}\nthrow new Error('failed to match ' + jsonify(\$target) + '. Loc: ${l}');})(${compile(target)})`
}
}
}
}
throw new Error('Failed to match. ' + valueToString($target))})(expr);

const scheme_apply = (trace) => (($target) => {if ($target.type === "estr") {
{
let first = $target[0];
{
let tpls = $target[1];
{
let l = $target[2];
return (($target) => {if ($target.type === "nil") {
return `\"${escape_string(unescape_string(first))}\"`
}
return `\`${escape_string(unescape_string(first))}${join("")(map(tpls)((item) => (($target) => {if ($target.type === ",,") {
{
let expr = $target[0];
{
let suffix = $target[1];
{
let l = $target[2];
return `\${${compile(expr)}}${escape_string(unescape_string(suffix))}`
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
if ($target.type === "elambda") {
{
let name = $target[0];
{
let nl = $target[1];
{
let body = $target[2];
{
let l = $target[3];
return $pl$pl(cons("(")(cons(sanitize(name))(cons(") => ")(cons(compile(body))(nil)))))
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
return `(() => {const \$target = ${compile(init)};\n${compile_pat(pat)("\$target")(`return ${compile(body)}`)};\nthrow new Error('let pattern not matched ${pat_loc(pat)}. ' + valueToString(\$target));})()`
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
return $pl$pl(cons("(")(cons(compile(fn))(cons(")(")(cons(compile(arg))(cons(")")(nil))))))
}
}
return $pl$pl(cons(compile(fn))(cons("(")(cons(compile(arg))(cons(")")(nil)))))
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
return `((\$target) => {\n${join("\n")(map(cases)(($case) => (($target) => {if ($target.type === ",") {
{
let pat = $target[0];
{
let body = $target[1];
return compile_pat(pat)("\$target")(`return ${compile(body)}`)
}
}
}
throw new Error('Failed to match. ' + valueToString($target))})($case)))}\nthrow new Error('failed to match ' + jsonify(\$target) + '. Loc: ${l}');})(${compile(target)})`
}
}
}
}
throw new Error('Failed to match. ' + valueToString($target))})(expr);

const compose_subst = (trace) => (($target) => {if ($target.type === "estr") {
{
let first = $target[0];
{
let tpls = $target[1];
{
let l = $target[2];
return (($target) => {if ($target.type === "nil") {
return `\"${escape_string(unescape_string(first))}\"`
}
return `\`${escape_string(unescape_string(first))}${join("")(map(tpls)((item) => (($target) => {if ($target.type === ",,") {
{
let expr = $target[0];
{
let suffix = $target[1];
{
let l = $target[2];
return `\${${compile(expr)}}${escape_string(unescape_string(suffix))}`
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
if ($target.type === "elambda") {
{
let name = $target[0];
{
let nl = $target[1];
{
let body = $target[2];
{
let l = $target[3];
return $pl$pl(cons("(")(cons(sanitize(name))(cons(") => ")(cons(compile(body))(nil)))))
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
return `(() => {const \$target = ${compile(init)};\n${compile_pat(pat)("\$target")(`return ${compile(body)}`)};\nthrow new Error('let pattern not matched ${pat_loc(pat)}. ' + valueToString(\$target));})()`
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
return $pl$pl(cons("(")(cons(compile(fn))(cons(")(")(cons(compile(arg))(cons(")")(nil))))))
}
}
return $pl$pl(cons(compile(fn))(cons("(")(cons(compile(arg))(cons(")")(nil)))))
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
return `((\$target) => {\n${join("\n")(map(cases)(($case) => (($target) => {if ($target.type === ",") {
{
let pat = $target[0];
{
let body = $target[1];
return compile_pat(pat)("\$target")(`return ${compile(body)}`)
}
}
}
throw new Error('Failed to match. ' + valueToString($target))})($case)))}\nthrow new Error('failed to match ' + jsonify(\$target) + '. Loc: ${l}');})(${compile(target)})`
}
}
}
}
throw new Error('Failed to match. ' + valueToString($target))})(expr);

const remove = (trace) => (($target) => {if ($target.type === "estr") {
{
let first = $target[0];
{
let tpls = $target[1];
{
let l = $target[2];
return (($target) => {if ($target.type === "nil") {
return `\"${escape_string(unescape_string(first))}\"`
}
return `\`${escape_string(unescape_string(first))}${join("")(map(tpls)((item) => (($target) => {if ($target.type === ",,") {
{
let expr = $target[0];
{
let suffix = $target[1];
{
let l = $target[2];
return `\${${compile(expr)}}${escape_string(unescape_string(suffix))}`
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
if ($target.type === "elambda") {
{
let name = $target[0];
{
let nl = $target[1];
{
let body = $target[2];
{
let l = $target[3];
return $pl$pl(cons("(")(cons(sanitize(name))(cons(") => ")(cons(compile(body))(nil)))))
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
return `(() => {const \$target = ${compile(init)};\n${compile_pat(pat)("\$target")(`return ${compile(body)}`)};\nthrow new Error('let pattern not matched ${pat_loc(pat)}. ' + valueToString(\$target));})()`
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
return $pl$pl(cons("(")(cons(compile(fn))(cons(")(")(cons(compile(arg))(cons(")")(nil))))))
}
}
return $pl$pl(cons(compile(fn))(cons("(")(cons(compile(arg))(cons(")")(nil)))))
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
return `((\$target) => {\n${join("\n")(map(cases)(($case) => (($target) => {if ($target.type === ",") {
{
let pat = $target[0];
{
let body = $target[1];
return compile_pat(pat)("\$target")(`return ${compile(body)}`)
}
}
}
throw new Error('Failed to match. ' + valueToString($target))})($case)))}\nthrow new Error('failed to match ' + jsonify(\$target) + '. Loc: ${l}');})(${compile(target)})`
}
}
}
}
throw new Error('Failed to match. ' + valueToString($target))})(expr);

const tenv_free = (trace) => (($target) => {if ($target.type === "estr") {
{
let first = $target[0];
{
let tpls = $target[1];
{
let l = $target[2];
return (($target) => {if ($target.type === "nil") {
return `\"${escape_string(unescape_string(first))}\"`
}
return `\`${escape_string(unescape_string(first))}${join("")(map(tpls)((item) => (($target) => {if ($target.type === ",,") {
{
let expr = $target[0];
{
let suffix = $target[1];
{
let l = $target[2];
return `\${${compile(expr)}}${escape_string(unescape_string(suffix))}`
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
if ($target.type === "elambda") {
{
let name = $target[0];
{
let nl = $target[1];
{
let body = $target[2];
{
let l = $target[3];
return $pl$pl(cons("(")(cons(sanitize(name))(cons(") => ")(cons(compile(body))(nil)))))
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
return `(() => {const \$target = ${compile(init)};\n${compile_pat(pat)("\$target")(`return ${compile(body)}`)};\nthrow new Error('let pattern not matched ${pat_loc(pat)}. ' + valueToString(\$target));})()`
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
return $pl$pl(cons("(")(cons(compile(fn))(cons(")(")(cons(compile(arg))(cons(")")(nil))))))
}
}
return $pl$pl(cons(compile(fn))(cons("(")(cons(compile(arg))(cons(")")(nil)))))
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
return `((\$target) => {\n${join("\n")(map(cases)(($case) => (($target) => {if ($target.type === ",") {
{
let pat = $target[0];
{
let body = $target[1];
return compile_pat(pat)("\$target")(`return ${compile(body)}`)
}
}
}
throw new Error('Failed to match. ' + valueToString($target))})($case)))}\nthrow new Error('failed to match ' + jsonify(\$target) + '. Loc: ${l}');})(${compile(target)})`
}
}
}
}
throw new Error('Failed to match. ' + valueToString($target))})(expr);

const tenv_apply = (trace) => (($target) => {if ($target.type === "estr") {
{
let first = $target[0];
{
let tpls = $target[1];
{
let l = $target[2];
return (($target) => {if ($target.type === "nil") {
return `\"${escape_string(unescape_string(first))}\"`
}
return `\`${escape_string(unescape_string(first))}${join("")(map(tpls)((item) => (($target) => {if ($target.type === ",,") {
{
let expr = $target[0];
{
let suffix = $target[1];
{
let l = $target[2];
return `\${${compile(expr)}}${escape_string(unescape_string(suffix))}`
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
if ($target.type === "elambda") {
{
let name = $target[0];
{
let nl = $target[1];
{
let body = $target[2];
{
let l = $target[3];
return $pl$pl(cons("(")(cons(sanitize(name))(cons(") => ")(cons(compile(body))(nil)))))
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
return `(() => {const \$target = ${compile(init)};\n${compile_pat(pat)("\$target")(`return ${compile(body)}`)};\nthrow new Error('let pattern not matched ${pat_loc(pat)}. ' + valueToString(\$target));})()`
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
return $pl$pl(cons("(")(cons(compile(fn))(cons(")(")(cons(compile(arg))(cons(")")(nil))))))
}
}
return $pl$pl(cons(compile(fn))(cons("(")(cons(compile(arg))(cons(")")(nil)))))
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
return `((\$target) => {\n${join("\n")(map(cases)(($case) => (($target) => {if ($target.type === ",") {
{
let pat = $target[0];
{
let body = $target[1];
return compile_pat(pat)("\$target")(`return ${compile(body)}`)
}
}
}
throw new Error('Failed to match. ' + valueToString($target))})($case)))}\nthrow new Error('failed to match ' + jsonify(\$target) + '. Loc: ${l}');})(${compile(target)})`
}
}
}
}
throw new Error('Failed to match. ' + valueToString($target))})(expr);

const generalize = (trace) => (($target) => {if ($target.type === "estr") {
{
let first = $target[0];
{
let tpls = $target[1];
{
let l = $target[2];
return (($target) => {if ($target.type === "nil") {
return `\"${escape_string(unescape_string(first))}\"`
}
return `\`${escape_string(unescape_string(first))}${join("")(map(tpls)((item) => (($target) => {if ($target.type === ",,") {
{
let expr = $target[0];
{
let suffix = $target[1];
{
let l = $target[2];
return `\${${compile(expr)}}${escape_string(unescape_string(suffix))}`
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
if ($target.type === "elambda") {
{
let name = $target[0];
{
let nl = $target[1];
{
let body = $target[2];
{
let l = $target[3];
return $pl$pl(cons("(")(cons(sanitize(name))(cons(") => ")(cons(compile(body))(nil)))))
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
return `(() => {const \$target = ${compile(init)};\n${compile_pat(pat)("\$target")(`return ${compile(body)}`)};\nthrow new Error('let pattern not matched ${pat_loc(pat)}. ' + valueToString(\$target));})()`
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
return $pl$pl(cons("(")(cons(compile(fn))(cons(")(")(cons(compile(arg))(cons(")")(nil))))))
}
}
return $pl$pl(cons(compile(fn))(cons("(")(cons(compile(arg))(cons(")")(nil)))))
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
return `((\$target) => {\n${join("\n")(map(cases)(($case) => (($target) => {if ($target.type === ",") {
{
let pat = $target[0];
{
let body = $target[1];
return compile_pat(pat)("\$target")(`return ${compile(body)}`)
}
}
}
throw new Error('Failed to match. ' + valueToString($target))})($case)))}\nthrow new Error('failed to match ' + jsonify(\$target) + '. Loc: ${l}');})(${compile(target)})`
}
}
}
}
throw new Error('Failed to match. ' + valueToString($target))})(expr);

const new_type_var = (trace) => (($target) => {if ($target.type === "estr") {
{
let first = $target[0];
{
let tpls = $target[1];
{
let l = $target[2];
return (($target) => {if ($target.type === "nil") {
return `\"${escape_string(unescape_string(first))}\"`
}
return `\`${escape_string(unescape_string(first))}${join("")(map(tpls)((item) => (($target) => {if ($target.type === ",,") {
{
let expr = $target[0];
{
let suffix = $target[1];
{
let l = $target[2];
return `\${${compile(expr)}}${escape_string(unescape_string(suffix))}`
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
if ($target.type === "elambda") {
{
let name = $target[0];
{
let nl = $target[1];
{
let body = $target[2];
{
let l = $target[3];
return $pl$pl(cons("(")(cons(sanitize(name))(cons(") => ")(cons(compile(body))(nil)))))
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
return `(() => {const \$target = ${compile(init)};\n${compile_pat(pat)("\$target")(`return ${compile(body)}`)};\nthrow new Error('let pattern not matched ${pat_loc(pat)}. ' + valueToString(\$target));})()`
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
return $pl$pl(cons("(")(cons(compile(fn))(cons(")(")(cons(compile(arg))(cons(")")(nil))))))
}
}
return $pl$pl(cons(compile(fn))(cons("(")(cons(compile(arg))(cons(")")(nil)))))
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
return `((\$target) => {\n${join("\n")(map(cases)(($case) => (($target) => {if ($target.type === ",") {
{
let pat = $target[0];
{
let body = $target[1];
return compile_pat(pat)("\$target")(`return ${compile(body)}`)
}
}
}
throw new Error('Failed to match. ' + valueToString($target))})($case)))}\nthrow new Error('failed to match ' + jsonify(\$target) + '. Loc: ${l}');})(${compile(target)})`
}
}
}
}
throw new Error('Failed to match. ' + valueToString($target))})(expr);

const free_for_vars = (trace) => (($target) => {if ($target.type === "estr") {
{
let first = $target[0];
{
let tpls = $target[1];
{
let l = $target[2];
return (($target) => {if ($target.type === "nil") {
return `\"${escape_string(unescape_string(first))}\"`
}
return `\`${escape_string(unescape_string(first))}${join("")(map(tpls)((item) => (($target) => {if ($target.type === ",,") {
{
let expr = $target[0];
{
let suffix = $target[1];
{
let l = $target[2];
return `\${${compile(expr)}}${escape_string(unescape_string(suffix))}`
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
if ($target.type === "elambda") {
{
let name = $target[0];
{
let nl = $target[1];
{
let body = $target[2];
{
let l = $target[3];
return $pl$pl(cons("(")(cons(sanitize(name))(cons(") => ")(cons(compile(body))(nil)))))
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
return `(() => {const \$target = ${compile(init)};\n${compile_pat(pat)("\$target")(`return ${compile(body)}`)};\nthrow new Error('let pattern not matched ${pat_loc(pat)}. ' + valueToString(\$target));})()`
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
return $pl$pl(cons("(")(cons(compile(fn))(cons(")(")(cons(compile(arg))(cons(")")(nil))))))
}
}
return $pl$pl(cons(compile(fn))(cons("(")(cons(compile(arg))(cons(")")(nil)))))
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
return `((\$target) => {\n${join("\n")(map(cases)(($case) => (($target) => {if ($target.type === ",") {
{
let pat = $target[0];
{
let body = $target[1];
return compile_pat(pat)("\$target")(`return ${compile(body)}`)
}
}
}
throw new Error('Failed to match. ' + valueToString($target))})($case)))}\nthrow new Error('failed to match ' + jsonify(\$target) + '. Loc: ${l}');})(${compile(target)})`
}
}
}
}
throw new Error('Failed to match. ' + valueToString($target))})(expr);

const instantiate = (trace) => (($target) => {if ($target.type === "estr") {
{
let first = $target[0];
{
let tpls = $target[1];
{
let l = $target[2];
return (($target) => {if ($target.type === "nil") {
return `\"${escape_string(unescape_string(first))}\"`
}
return `\`${escape_string(unescape_string(first))}${join("")(map(tpls)((item) => (($target) => {if ($target.type === ",,") {
{
let expr = $target[0];
{
let suffix = $target[1];
{
let l = $target[2];
return `\${${compile(expr)}}${escape_string(unescape_string(suffix))}`
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
if ($target.type === "elambda") {
{
let name = $target[0];
{
let nl = $target[1];
{
let body = $target[2];
{
let l = $target[3];
return $pl$pl(cons("(")(cons(sanitize(name))(cons(") => ")(cons(compile(body))(nil)))))
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
return `(() => {const \$target = ${compile(init)};\n${compile_pat(pat)("\$target")(`return ${compile(body)}`)};\nthrow new Error('let pattern not matched ${pat_loc(pat)}. ' + valueToString(\$target));})()`
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
return $pl$pl(cons("(")(cons(compile(fn))(cons(")(")(cons(compile(arg))(cons(")")(nil))))))
}
}
return $pl$pl(cons(compile(fn))(cons("(")(cons(compile(arg))(cons(")")(nil)))))
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
return `((\$target) => {\n${join("\n")(map(cases)(($case) => (($target) => {if ($target.type === ",") {
{
let pat = $target[0];
{
let body = $target[1];
return compile_pat(pat)("\$target")(`return ${compile(body)}`)
}
}
}
throw new Error('Failed to match. ' + valueToString($target))})($case)))}\nthrow new Error('failed to match ' + jsonify(\$target) + '. Loc: ${l}');})(${compile(target)})`
}
}
}
}
throw new Error('Failed to match. ' + valueToString($target))})(expr);

const mgu = (trace) => (($target) => {if ($target.type === "estr") {
{
let first = $target[0];
{
let tpls = $target[1];
{
let l = $target[2];
return (($target) => {if ($target.type === "nil") {
return `\"${escape_string(unescape_string(first))}\"`
}
return `\`${escape_string(unescape_string(first))}${join("")(map(tpls)((item) => (($target) => {if ($target.type === ",,") {
{
let expr = $target[0];
{
let suffix = $target[1];
{
let l = $target[2];
return `\${${compile(expr)}}${escape_string(unescape_string(suffix))}`
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
if ($target.type === "elambda") {
{
let name = $target[0];
{
let nl = $target[1];
{
let body = $target[2];
{
let l = $target[3];
return $pl$pl(cons("(")(cons(sanitize(name))(cons(") => ")(cons(compile(body))(nil)))))
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
return `(() => {const \$target = ${compile(init)};\n${compile_pat(pat)("\$target")(`return ${compile(body)}`)};\nthrow new Error('let pattern not matched ${pat_loc(pat)}. ' + valueToString(\$target));})()`
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
return $pl$pl(cons("(")(cons(compile(fn))(cons(")(")(cons(compile(arg))(cons(")")(nil))))))
}
}
return $pl$pl(cons(compile(fn))(cons("(")(cons(compile(arg))(cons(")")(nil)))))
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
return `((\$target) => {\n${join("\n")(map(cases)(($case) => (($target) => {if ($target.type === ",") {
{
let pat = $target[0];
{
let body = $target[1];
return compile_pat(pat)("\$target")(`return ${compile(body)}`)
}
}
}
throw new Error('Failed to match. ' + valueToString($target))})($case)))}\nthrow new Error('failed to match ' + jsonify(\$target) + '. Loc: ${l}');})(${compile(target)})`
}
}
}
}
throw new Error('Failed to match. ' + valueToString($target))})(expr);

const var_bind = (trace) => (($target) => {if ($target.type === "estr") {
{
let first = $target[0];
{
let tpls = $target[1];
{
let l = $target[2];
return (($target) => {if ($target.type === "nil") {
return `\"${escape_string(unescape_string(first))}\"`
}
return `\`${escape_string(unescape_string(first))}${join("")(map(tpls)((item) => (($target) => {if ($target.type === ",,") {
{
let expr = $target[0];
{
let suffix = $target[1];
{
let l = $target[2];
return `\${${compile(expr)}}${escape_string(unescape_string(suffix))}`
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
if ($target.type === "elambda") {
{
let name = $target[0];
{
let nl = $target[1];
{
let body = $target[2];
{
let l = $target[3];
return $pl$pl(cons("(")(cons(sanitize(name))(cons(") => ")(cons(compile(body))(nil)))))
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
return `(() => {const \$target = ${compile(init)};\n${compile_pat(pat)("\$target")(`return ${compile(body)}`)};\nthrow new Error('let pattern not matched ${pat_loc(pat)}. ' + valueToString(\$target));})()`
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
return $pl$pl(cons("(")(cons(compile(fn))(cons(")(")(cons(compile(arg))(cons(")")(nil))))))
}
}
return $pl$pl(cons(compile(fn))(cons("(")(cons(compile(arg))(cons(")")(nil)))))
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
return `((\$target) => {\n${join("\n")(map(cases)(($case) => (($target) => {if ($target.type === ",") {
{
let pat = $target[0];
{
let body = $target[1];
return compile_pat(pat)("\$target")(`return ${compile(body)}`)
}
}
}
throw new Error('Failed to match. ' + valueToString($target))})($case)))}\nthrow new Error('failed to match ' + jsonify(\$target) + '. Loc: ${l}');})(${compile(target)})`
}
}
}
}
throw new Error('Failed to match. ' + valueToString($target))})(expr);

const t_prim = (trace) => (($target) => {if ($target.type === "estr") {
{
let first = $target[0];
{
let tpls = $target[1];
{
let l = $target[2];
return (($target) => {if ($target.type === "nil") {
return `\"${escape_string(unescape_string(first))}\"`
}
return `\`${escape_string(unescape_string(first))}${join("")(map(tpls)((item) => (($target) => {if ($target.type === ",,") {
{
let expr = $target[0];
{
let suffix = $target[1];
{
let l = $target[2];
return `\${${compile(expr)}}${escape_string(unescape_string(suffix))}`
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
if ($target.type === "elambda") {
{
let name = $target[0];
{
let nl = $target[1];
{
let body = $target[2];
{
let l = $target[3];
return $pl$pl(cons("(")(cons(sanitize(name))(cons(") => ")(cons(compile(body))(nil)))))
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
return `(() => {const \$target = ${compile(init)};\n${compile_pat(pat)("\$target")(`return ${compile(body)}`)};\nthrow new Error('let pattern not matched ${pat_loc(pat)}. ' + valueToString(\$target));})()`
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
return $pl$pl(cons("(")(cons(compile(fn))(cons(")(")(cons(compile(arg))(cons(")")(nil))))))
}
}
return $pl$pl(cons(compile(fn))(cons("(")(cons(compile(arg))(cons(")")(nil)))))
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
return `((\$target) => {\n${join("\n")(map(cases)(($case) => (($target) => {if ($target.type === ",") {
{
let pat = $target[0];
{
let body = $target[1];
return compile_pat(pat)("\$target")(`return ${compile(body)}`)
}
}
}
throw new Error('Failed to match. ' + valueToString($target))})($case)))}\nthrow new Error('failed to match ' + jsonify(\$target) + '. Loc: ${l}');})(${compile(target)})`
}
}
}
}
throw new Error('Failed to match. ' + valueToString($target))})(expr);

const tfn = (trace) => (($target) => {if ($target.type === "estr") {
{
let first = $target[0];
{
let tpls = $target[1];
{
let l = $target[2];
return (($target) => {if ($target.type === "nil") {
return `\"${escape_string(unescape_string(first))}\"`
}
return `\`${escape_string(unescape_string(first))}${join("")(map(tpls)((item) => (($target) => {if ($target.type === ",,") {
{
let expr = $target[0];
{
let suffix = $target[1];
{
let l = $target[2];
return `\${${compile(expr)}}${escape_string(unescape_string(suffix))}`
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
if ($target.type === "elambda") {
{
let name = $target[0];
{
let nl = $target[1];
{
let body = $target[2];
{
let l = $target[3];
return $pl$pl(cons("(")(cons(sanitize(name))(cons(") => ")(cons(compile(body))(nil)))))
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
return `(() => {const \$target = ${compile(init)};\n${compile_pat(pat)("\$target")(`return ${compile(body)}`)};\nthrow new Error('let pattern not matched ${pat_loc(pat)}. ' + valueToString(\$target));})()`
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
return $pl$pl(cons("(")(cons(compile(fn))(cons(")(")(cons(compile(arg))(cons(")")(nil))))))
}
}
return $pl$pl(cons(compile(fn))(cons("(")(cons(compile(arg))(cons(")")(nil)))))
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
return `((\$target) => {\n${join("\n")(map(cases)(($case) => (($target) => {if ($target.type === ",") {
{
let pat = $target[0];
{
let body = $target[1];
return compile_pat(pat)("\$target")(`return ${compile(body)}`)
}
}
}
throw new Error('Failed to match. ' + valueToString($target))})($case)))}\nthrow new Error('failed to match ' + jsonify(\$target) + '. Loc: ${l}');})(${compile(target)})`
}
}
}
}
throw new Error('Failed to match. ' + valueToString($target))})(expr);

const t_expr = (trace) => (($target) => {if ($target.type === "estr") {
{
let first = $target[0];
{
let tpls = $target[1];
{
let l = $target[2];
return (($target) => {if ($target.type === "nil") {
return `\"${escape_string(unescape_string(first))}\"`
}
return `\`${escape_string(unescape_string(first))}${join("")(map(tpls)((item) => (($target) => {if ($target.type === ",,") {
{
let expr = $target[0];
{
let suffix = $target[1];
{
let l = $target[2];
return `\${${compile(expr)}}${escape_string(unescape_string(suffix))}`
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
if ($target.type === "elambda") {
{
let name = $target[0];
{
let nl = $target[1];
{
let body = $target[2];
{
let l = $target[3];
return $pl$pl(cons("(")(cons(sanitize(name))(cons(") => ")(cons(compile(body))(nil)))))
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
return `(() => {const \$target = ${compile(init)};\n${compile_pat(pat)("\$target")(`return ${compile(body)}`)};\nthrow new Error('let pattern not matched ${pat_loc(pat)}. ' + valueToString(\$target));})()`
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
return $pl$pl(cons("(")(cons(compile(fn))(cons(")(")(cons(compile(arg))(cons(")")(nil))))))
}
}
return $pl$pl(cons(compile(fn))(cons("(")(cons(compile(arg))(cons(")")(nil)))))
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
return `((\$target) => {\n${join("\n")(map(cases)(($case) => (($target) => {if ($target.type === ",") {
{
let pat = $target[0];
{
let body = $target[1];
return compile_pat(pat)("\$target")(`return ${compile(body)}`)
}
}
}
throw new Error('Failed to match. ' + valueToString($target))})($case)))}\nthrow new Error('failed to match ' + jsonify(\$target) + '. Loc: ${l}');})(${compile(target)})`
}
}
}
}
throw new Error('Failed to match. ' + valueToString($target))})(expr);

const infer = (trace) => (($target) => {if ($target.type === "estr") {
{
let first = $target[0];
{
let tpls = $target[1];
{
let l = $target[2];
return (($target) => {if ($target.type === "nil") {
return `\"${escape_string(unescape_string(first))}\"`
}
return `\`${escape_string(unescape_string(first))}${join("")(map(tpls)((item) => (($target) => {if ($target.type === ",,") {
{
let expr = $target[0];
{
let suffix = $target[1];
{
let l = $target[2];
return `\${${compile(expr)}}${escape_string(unescape_string(suffix))}`
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
if ($target.type === "elambda") {
{
let name = $target[0];
{
let nl = $target[1];
{
let body = $target[2];
{
let l = $target[3];
return $pl$pl(cons("(")(cons(sanitize(name))(cons(") => ")(cons(compile(body))(nil)))))
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
return `(() => {const \$target = ${compile(init)};\n${compile_pat(pat)("\$target")(`return ${compile(body)}`)};\nthrow new Error('let pattern not matched ${pat_loc(pat)}. ' + valueToString(\$target));})()`
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
return $pl$pl(cons("(")(cons(compile(fn))(cons(")(")(cons(compile(arg))(cons(")")(nil))))))
}
}
return $pl$pl(cons(compile(fn))(cons("(")(cons(compile(arg))(cons(")")(nil)))))
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
return `((\$target) => {\n${join("\n")(map(cases)(($case) => (($target) => {if ($target.type === ",") {
{
let pat = $target[0];
{
let body = $target[1];
return compile_pat(pat)("\$target")(`return ${compile(body)}`)
}
}
}
throw new Error('Failed to match. ' + valueToString($target))})($case)))}\nthrow new Error('failed to match ' + jsonify(\$target) + '. Loc: ${l}');})(${compile(target)})`
}
}
}
}
throw new Error('Failed to match. ' + valueToString($target))})(expr);

const tint = (trace) => (($target) => {if ($target.type === "estr") {
{
let first = $target[0];
{
let tpls = $target[1];
{
let l = $target[2];
return (($target) => {if ($target.type === "nil") {
return `\"${escape_string(unescape_string(first))}\"`
}
return `\`${escape_string(unescape_string(first))}${join("")(map(tpls)((item) => (($target) => {if ($target.type === ",,") {
{
let expr = $target[0];
{
let suffix = $target[1];
{
let l = $target[2];
return `\${${compile(expr)}}${escape_string(unescape_string(suffix))}`
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
if ($target.type === "elambda") {
{
let name = $target[0];
{
let nl = $target[1];
{
let body = $target[2];
{
let l = $target[3];
return $pl$pl(cons("(")(cons(sanitize(name))(cons(") => ")(cons(compile(body))(nil)))))
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
return `(() => {const \$target = ${compile(init)};\n${compile_pat(pat)("\$target")(`return ${compile(body)}`)};\nthrow new Error('let pattern not matched ${pat_loc(pat)}. ' + valueToString(\$target));})()`
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
return $pl$pl(cons("(")(cons(compile(fn))(cons(")(")(cons(compile(arg))(cons(")")(nil))))))
}
}
return $pl$pl(cons(compile(fn))(cons("(")(cons(compile(arg))(cons(")")(nil)))))
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
return `((\$target) => {\n${join("\n")(map(cases)(($case) => (($target) => {if ($target.type === ",") {
{
let pat = $target[0];
{
let body = $target[1];
return compile_pat(pat)("\$target")(`return ${compile(body)}`)
}
}
}
throw new Error('Failed to match. ' + valueToString($target))})($case)))}\nthrow new Error('failed to match ' + jsonify(\$target) + '. Loc: ${l}');})(${compile(target)})`
}
}
}
}
throw new Error('Failed to match. ' + valueToString($target))})(expr);

const basic = (trace) => (($target) => {if ($target.type === "estr") {
{
let first = $target[0];
{
let tpls = $target[1];
{
let l = $target[2];
return (($target) => {if ($target.type === "nil") {
return `\"${escape_string(unescape_string(first))}\"`
}
return `\`${escape_string(unescape_string(first))}${join("")(map(tpls)((item) => (($target) => {if ($target.type === ",,") {
{
let expr = $target[0];
{
let suffix = $target[1];
{
let l = $target[2];
return `\${${compile(expr)}}${escape_string(unescape_string(suffix))}`
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
if ($target.type === "elambda") {
{
let name = $target[0];
{
let nl = $target[1];
{
let body = $target[2];
{
let l = $target[3];
return $pl$pl(cons("(")(cons(sanitize(name))(cons(") => ")(cons(compile(body))(nil)))))
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
return `(() => {const \$target = ${compile(init)};\n${compile_pat(pat)("\$target")(`return ${compile(body)}`)};\nthrow new Error('let pattern not matched ${pat_loc(pat)}. ' + valueToString(\$target));})()`
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
return $pl$pl(cons("(")(cons(compile(fn))(cons(")(")(cons(compile(arg))(cons(")")(nil))))))
}
}
return $pl$pl(cons(compile(fn))(cons("(")(cons(compile(arg))(cons(")")(nil)))))
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
return `((\$target) => {\n${join("\n")(map(cases)(($case) => (($target) => {if ($target.type === ",") {
{
let pat = $target[0];
{
let body = $target[1];
return compile_pat(pat)("\$target")(`return ${compile(body)}`)
}
}
}
throw new Error('Failed to match. ' + valueToString($target))})($case)))}\nthrow new Error('failed to match ' + jsonify(\$target) + '. Loc: ${l}');})(${compile(target)})`
}
}
}
}
throw new Error('Failed to match. ' + valueToString($target))})(expr);

return {type: 'fns', ast, basic, compose_subst, foldl, foldr, free_for_vars, generalize, infer, instantiate, map, mapi, mgu, new_type_var, prelude, remove, scheme_apply, scheme_free, t_expr, t_prim, tenv_apply, tenv_free, tfn, tint, type_apply, type_free, type_to_string, var_bind}