let pint = (v0) => (v1) => ({type: "pint", 0: v0, 1: v1})
let pbool = (v0) => (v1) => ({type: "pbool", 0: v0, 1: v1})
let maybe_parens = (inner) => (parens) => (($target) => {
if ($target === true) {
return `(${inner})`
} ;
return inner;
throw new Error('match fail 5125:' + JSON.stringify($target))
})(parens)
let compile_prim = (prim) => (($target) => {
if ($target.type === "pint") {
let int = $target[0];
return int_to_string(int)
} ;
if ($target.type === "pbool") {
let bool = $target[0];
{
let $target = bool;
if ($target === true) {
return "true"
} ;
if ($target === false) {
return "false"
} ;
throw new Error('match fail 1781:' + JSON.stringify($target))
}
} ;
throw new Error('match fail 1752:' + JSON.stringify($target))
})(prim)
let some = (v0) => ({type: "some", 0: v0})
let none = {type: "none"}
let m = jsonify(1)
let tvar = (v0) => (v1) => ({type: "tvar", 0: v0, 1: v1})
let tapp = (v0) => (v1) => (v2) => ({type: "tapp", 0: v0, 1: v1, 2: v2})
let tcon = (v0) => (v1) => ({type: "tcon", 0: v0, 1: v1})
let nil = {type: "nil"}
let cons = (v0) => (v1) => ({type: "cons", 0: v0, 1: v1})
let cst$slidentifier = (v0) => (v1) => ({type: "cst/identifier", 0: v0, 1: v1})
let cst$sllist = (v0) => (v1) => ({type: "cst/list", 0: v0, 1: v1})
let cst$slarray = (v0) => (v1) => ({type: "cst/array", 0: v0, 1: v1})
let cst$slrecord = (v0) => (v1) => ({type: "cst/record", 0: v0, 1: v1})
let cst$slspread = (v0) => (v1) => ({type: "cst/spread", 0: v0, 1: v1})
let cst$slstring = (v0) => (v1) => (v2) => ({type: "cst/string", 0: v0, 1: v1, 2: v2})
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
throw new Error('match fail 2176:' + JSON.stringify($target))
}
} ;
throw new Error('match fail 2020:' + JSON.stringify($target))
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
throw new Error('match fail 2266:' + JSON.stringify($target))
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
throw new Error('match fail 2326:' + JSON.stringify($target))
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
throw new Error('match fail 2435:' + JSON.stringify($target))
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
throw new Error('match fail 2690:' + JSON.stringify($target))
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
throw new Error('match fail 2964:' + JSON.stringify($target))
}
} ;
throw new Error('match fail 2878:' + JSON.stringify($target))
})(repl)
let constructor_fn = (name) => (args) => `({type: \"${name}\"${join("")(mapi(0)(args)((i) => (arg) => `, ${int_to_string(i)}: ${arg}`))}})`
let escape_string = (string) => replaces(string)(cons($co("\\")("\\\\"))(cons($co("\n")("\\n"))(cons($co("\"")("\\\""))(cons($co("\`")("\\\`"))(cons($co("\$")("\\\$"))(nil))))))
let indices = (lst) => mapi(0)(lst)((i) => (_5507) => i)
let concat = (lsts) => (($target) => {
if ($target.type === "nil") {
return nil
} ;
if ($target.type === "cons") {
let one = $target[0];
if ($target[1].type === "nil") {
return one
} 
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
let lsts = $target[1];
return cons(one)(concat(cons(rest)(lsts)))
} 
} ;
throw new Error('match fail 5743:' + JSON.stringify($target))
})(lsts)
let fix_slashes = (str) => escape_string(unescapeString(str))
let pany = (v0) => ({type: "pany", 0: v0})
let pvar = (v0) => (v1) => ({type: "pvar", 0: v0, 1: v1})
let pprim = (v0) => (v1) => ({type: "pprim", 0: v0, 1: v1})
let pstr = (v0) => (v1) => ({type: "pstr", 0: v0, 1: v1})
let pcon = (v0) => (v1) => (v2) => (v3) => ({type: "pcon", 0: v0, 1: v1, 2: v2, 3: v3})
let tdeftype = (v0) => (v1) => (v2) => (v3) => (v4) => ({type: "tdeftype", 0: v0, 1: v1, 2: v2, 3: v3, 4: v4})
let tdef = (v0) => (v1) => (v2) => (v3) => ({type: "tdef", 0: v0, 1: v1, 2: v2, 3: v3})
let texpr = (v0) => (v1) => ({type: "texpr", 0: v0, 1: v1})
let ttypealias = {type: "ttypealias"}

let eprim = (v0) => (v1) => ({type: "eprim", 0: v0, 1: v1})
let estr = (v0) => (v1) => (v2) => ({type: "estr", 0: v0, 1: v1, 2: v2})
let evar = (v0) => (v1) => ({type: "evar", 0: v0, 1: v1})
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
let compile_pat_naive = (pat) => (target) => (inner) => (($target) => {
if ($target.type === "pany") {
return inner
} ;
if ($target.type === "pprim") {
let prim = $target[0];
return `if (${target} === ${compile_prim(prim)}) {\n${inner}\n}`
} ;
if ($target.type === "pstr") {
let str = $target[0];
return `if (${target} === \"${str}\"){\n${inner}\n}`
} ;
if ($target.type === "pvar") {
let name = $target[0];
return `{\nlet ${sanitize(name)} = ${target};\n${inner}\n}`
} ;
if ($target.type === "pcon") {
let name = $target[0];
let args = $target[2];
return `if (${target}.type === \"${name}\") {\n${pat_loop(target)(args)(0)(inner)}\n}`
} ;
throw new Error('match fail 4085:' + JSON.stringify($target))
})(pat)

let pat_loop = (target) => (args) => (i) => (inner) => (($target) => {
if ($target.type === "nil") {
return inner
} ;
if ($target.type === "cons") {
let arg = $target[0];
let rest = $target[1];
return compile_pat_naive(arg)(`${target}[${int_to_string(i)}]`)(pat_loop(target)(rest)(i + 1)(inner))
} ;
throw new Error('match fail 4257:' + JSON.stringify($target))
})(args)
let compile_pat_list = (pat) => (target) => (($target) => {
if ($target.type === "pany") {
return $co(nil)(nil)
} ;
if ($target.type === "pprim") {
let prim = $target[0];
return $co(cons(`${target} === ${compile_prim(prim)}`)(nil))(nil)
} ;
if ($target.type === "pstr") {
let str = $target[0];
return $co(cons(`${target} === \"${str}\"`)(nil))(nil)
} ;
if ($target.type === "pvar") {
let name = $target[0];
return $co(nil)(cons(`let ${sanitize(name)} = ${target};`)(nil))
} ;
if ($target.type === "pcon") {
let name = $target[0];
let args = $target[2];
{
let {"1": assign, "0": check} = pat_loop_list(target)(args)(0);
return $co(cons(`${target}.type === \"${name}\"`)(check))(assign)
}
} ;
throw new Error('match fail 5667:' + JSON.stringify($target))
})(pat)

let pat_loop_list = (target) => (args) => (i) => (($target) => {
if ($target.type === "nil") {
return $co(nil)(nil)
} ;
if ($target.type === "cons") {
let arg = $target[0];
let rest = $target[1];
{
let {"1": assign, "0": check} = compile_pat_list(arg)(`${target}[${int_to_string(i)}]`);
{
let {"1": a2, "0": c2} = pat_loop_list(target)(rest)(i + 1);
return $co(concat(cons(check)(cons(c2)(nil))))(concat(cons(assign)(cons(a2)(nil))))
}
}
} ;
throw new Error('match fail 5816:' + JSON.stringify($target))
})(args)
let pat_as_arg_inner = (pat) => (($target) => {
if ($target.type === "pany") {
return none
} ;
if ($target.type === "pprim") {
return none
} ;
if ($target.type === "pstr") {
return none
} ;
if ($target.type === "pvar") {
let name = $target[0];
return some(sanitize(name))
} ;
if ($target.type === "pcon") {
let args = $target[2];
{
let $target = foldl($co(0)(nil))(args)(({"1": res, "0": i}) => (arg) => $co(i + 1)((($target) => {
if ($target.type === "none") {
return res
} ;
if ($target.type === "some") {
let arg = $target[0];
return cons(`${int_to_string(i)}: ${arg}`)(res)
} ;
throw new Error('match fail 4985:' + JSON.stringify($target))
})(pat_as_arg_inner(arg))));
if ($target.type === ",") {
if ($target[1].type === "nil") {
return none
} 
} ;
if ($target.type === ",") {
let args = $target[1];
return some(`{${join(", ")(args)}}`)
} ;
throw new Error('match fail 5010:' + JSON.stringify($target))
}
} ;
return fatal(`No pat ${jsonify(pat)}`);
throw new Error('match fail 4932:' + JSON.stringify($target))
})(pat)
let needs_parens = (expr) => (($target) => {
if ($target.type === "elambda") {
return true
} ;
if ($target.type === "eprim") {
return true
} ;
return false;
throw new Error('match fail 5139:' + JSON.stringify($target))
})(expr)
let compile_quot = (quot) => (($target) => {
if ($target.type === "quot/quot") {
let x = $target[0];
return jsonify(x)
} ;
if ($target.type === "quot/expr") {
let x = $target[0];
return jsonify(x)
} ;
if ($target.type === "quot/top") {
let x = $target[0];
return jsonify(x)
} ;
if ($target.type === "quot/pat") {
let x = $target[0];
return jsonify(x)
} ;
if ($target.type === "quot/type") {
let x = $target[0];
return jsonify(x)
} ;
throw new Error('match fail 5311:' + JSON.stringify($target))
})(quot)
let compile_pat = (pat) => (target) => (inner) => {
let {"1": assign, "0": check} = compile_pat_list(pat)(target);
{
let inner$0 = inner;
{
let inner$1 = inner;
{
let inner = (($target) => {
if ($target.type === "nil") {
return inner$0
} ;
return `{\n${join("\n")(assign)}\n${inner$0}\n}`;
throw new Error('match fail 5987:' + JSON.stringify($target))
})(assign);
{
let inner$0 = inner;
{
let inner$1 = inner;
{
let inner = (($target) => {
if ($target.type === "nil") {
return inner$0
} ;
return `if (${join(" &&\n")(check)}) {\n${inner$0}\n}`;
throw new Error('match fail 6009:' + JSON.stringify($target))
})(check);
return inner
}
}
}
}
}
}
}
let pat_as_arg = (pat) => (($target) => {
if ($target.type === "none") {
return "_"
} ;
if ($target.type === "some") {
let arg = $target[0];
return arg
} ;
throw new Error('match fail 6317:' + JSON.stringify($target))
})(pat_as_arg_inner(pat))
let compile = (expr) => (($target) => {
if ($target.type === "estr") {
let first = $target[0];
let tpls = $target[1];
{
let $target = tpls;
if ($target.type === "nil") {
return `\"${fix_slashes(first)}\"`
} ;
{
let tpls$0 = tpls;
{
let tpls = map(tpls$0)(({"1": {"0": suffix}, "0": expr}) => `\${${compile(expr)}}${fix_slashes(suffix)}`);
return `\`${fix_slashes(first)}${join("")(tpls)}\``
}
};
throw new Error('match fail 4446:' + JSON.stringify($target))
}
} ;
if ($target.type === "eprim") {
let prim = $target[0];
return compile_prim(prim)
} ;
if ($target.type === "evar") {
let name = $target[0];
return sanitize(name)
} ;
if ($target.type === "equot") {
let inner = $target[0];
return compile_quot(inner)
} ;
if ($target.type === "elambda") {
let pats = $target[0];
let body = $target[1];
return foldr(compile(body))(pats)((body) => (pat) => `(${pat_as_arg(pat)}) => ${body}`)
} ;
if ($target.type === "elet") {
let bindings = $target[0];
let body = $target[1];
return foldr(compile(body))(bindings)((body) => ({"1": init, "0": pat}) => `((${pat_as_arg(pat)}) => ${body})(${compile(init)})`)
} ;
if ($target.type === "eapp") {
let f = $target[0];
let args = $target[1];
return foldl(with_parens(f))(args)((target) => (arg) => `${target}(${compile(arg)})`)
} ;
if ($target.type === "ematch") {
let target = $target[0];
let cases = $target[1];
{
let cases$0 = cases;
{
let cases = map(cases$0)(($case) => {
let {"1": body, "0": pat} = $case;
return compile_pat(pat)("\$target")(`return ${compile(body)}`)
});
return `((\$target) => {\n${join("\n")(cases)}\nthrow new Error('Failed to match. ' + valueToString(\$target));\n})(${compile(target)})`
}
}
} ;
throw new Error('match fail 1746:' + JSON.stringify($target))
})(expr)

let with_parens = (expr) => maybe_parens(compile(expr))(needs_parens(expr))
let compile_top = (top) => (($target) => {
if ($target.type === "texpr") {
let expr = $target[0];
return compile(expr)
} ;
if ($target.type === "tdef") {
let name = $target[0];
let body = $target[2];
return `const ${sanitize(name)} = ${compile(body)};\n`
} ;
if ($target.type === "tdeftype") {
let name = $target[0];
let cases = $target[3];
return join("\n")(map(cases)(($case) => {
let {"1": {"1": {"0": args}}, "0": name} = $case;
{
let arrows = join("")(map(indices(args))((i) => `(v${int_to_string(i)}) => `));
{
let body = constructor_fn(name)(map(indices(args))((i) => `v${int_to_string(i)}`));
return `const ${sanitize(name)} = ${arrows}${body}`
}
}
}))
} ;
if ($target.type === "ttypealias") {
return "/* type alias */"
} ;
throw new Error('match fail 729:' + JSON.stringify($target))
})(top)
return eval("compile => compile_top => ({type:'fns',compile: a => _ => compile(a), compile_top: a => _ => compile_top(a)})")(compile)(compile_top)