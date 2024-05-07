const pint = (v0) => (v1) => ({type: "pint", 0: v0, 1: v1})
const pbool = (v0) => (v1) => ({type: "pbool", 0: v0, 1: v1})
const snd = (tuple) => (({1: v}) => v)(tuple);

const fst = (tuple) => (({0: v}) => v)(tuple);

const some = (v0) => ({type: "some", 0: v0})
const none = ({type: "none"})
const its = int_to_string;

const value = ({type: "value"})
const type = ({type: "type"})
const dot = (a) => (b) => (c) => a(b(c));

const just_trace = (loc) => (trace) => (value) => (($target) => {
if ($target.type === "none") {
return ""
}
if ($target.type === "some") {
{
let info = $target[0];
return `\$trace(${its(loc)}, ${jsonify(info)}, ${value});`
}
}
throw new Error('Failed to match. ' + valueToString($target));
})(map$slget(trace)(loc));

const $co$co0 = (x) => (({0: a}) => a)(x);

const $co$co1 = (x) => (({1: {0: a}}) => a)(x);

const $co$co2 = (x) => (({1: {1: a}}) => a)(x);

const $co$co$co2 = (x) => (({1: {1: {0: x}}}) => x)(x);

const map$co$co0 = (f) => ({1: {1: c, 0: b}, 0: a}) => $co(f(a))($co(b)(c));

const map$co1 = (f) => ({1: b, 0: a}) => $co(a)(f(b));

const loop = (v) => (f) => f(v)((nv) => loop(nv)(f));

const nil = ({type: "nil"})
const cons = (v0) => (v1) => ({type: "cons", 0: v0, 1: v1})
const pany = (v0) => ({type: "pany", 0: v0})
const pvar = (v0) => (v1) => ({type: "pvar", 0: v0, 1: v1})
const pcon = (v0) => (v1) => (v2) => (v3) => ({type: "pcon", 0: v0, 1: v1, 2: v2, 3: v3})
const pstr = (v0) => (v1) => ({type: "pstr", 0: v0, 1: v1})
const pprim = (v0) => (v1) => ({type: "pprim", 0: v0, 1: v1})
const tvar = (v0) => (v1) => ({type: "tvar", 0: v0, 1: v1})
const tapp = (v0) => (v1) => (v2) => ({type: "tapp", 0: v0, 1: v1, 2: v2})
const tcon = (v0) => (v1) => ({type: "tcon", 0: v0, 1: v1})
const cst$sllist = (v0) => (v1) => ({type: "cst/list", 0: v0, 1: v1})
const cst$slarray = (v0) => (v1) => ({type: "cst/array", 0: v0, 1: v1})
const cst$slspread = (v0) => (v1) => ({type: "cst/spread", 0: v0, 1: v1})
const cst$slidentifier = (v0) => (v1) => ({type: "cst/identifier", 0: v0, 1: v1})
const cst$slstring = (v0) => (v1) => (v2) => ({type: "cst/string", 0: v0, 1: v1, 2: v2})
const one = (v0) => ({type: "one", 0: v0})
const many = (v0) => ({type: "many", 0: v0})
const empty = ({type: "empty"})
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

const tapps = (items) => (l) => (($target) => {
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
return tapp(tapps(rest)(l))(one)(l)
}
}
throw new Error('Failed to match. ' + valueToString($target));
})(items);

const pairs = (list) => (($target) => {
if ($target.type === "nil") {
return nil
}
if ($target.type === "cons" &&
$target[1].type === "cons") {
{
let one = $target[0];
let two = $target[1][0];
let rest = $target[1][1];
return cons($co(one)(two))(pairs(rest))
}
}
return fatal(`Pairs given odd number ${valueToString(list)}`)
throw new Error('Failed to match. ' + valueToString($target));
})(list);

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

const pat_loc = (pat) => (($target) => {
if ($target.type === "pany") {
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
let l = $target[3];
return l
}
}
throw new Error('Failed to match. ' + valueToString($target));
})(pat);

const trace_wrap = (loc) => (trace) => (js) => (($target) => {
if ($target.type === "none") {
return js
}
if ($target.type === "some") {
{
let info = $target[0];
return `\$trace(${its(loc)}, ${jsonify(info)}, ${js})`
}
}
throw new Error('Failed to match. ' + valueToString($target));
})(map$slget(trace)(loc));

const trace_and = (loc) => (trace) => (value) => (js) => (($target) => {
if ($target.type === "none") {
return js
}
if ($target.type === "some") {
{
let info = $target[0];
return `(\$trace(${its(loc)}, ${jsonify(info)}, ${value}), ${js})`
}
}
throw new Error('Failed to match. ' + valueToString($target));
})(map$slget(trace)(loc));

const trace_and_block = (loc) => (trace) => (value) => (js) => (($target) => {
if ($target.type === "none") {
return js
}
if ($target.type === "some") {
{
let info = $target[0];
return `\$trace(${its(loc)}, ${jsonify(info)}, ${value});\n${js}`
}
}
throw new Error('Failed to match. ' + valueToString($target));
})(map$slget(trace)(loc));

const source_map = (loc) => (js) => `/*${its(loc)}*/${js}/*<${its(loc)}*/`;

const rev = (arr) => (col) => (($target) => {
if ($target.type === "nil") {
return col
}
if ($target.type === "cons" &&
$target[1].type === "nil") {
{
let one = $target[0];
return cons(one)(col)
}
}
if ($target.type === "cons") {
{
let one = $target[0];
let rest = $target[1];
return rev(rest)(cons(one)(col))
}
}
throw new Error('Failed to match. ' + valueToString($target));
})(arr);

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

const bag$sland = (first) => (second) => (($target) => {
if ($target.type === "," &&
$target[0].type === "empty") {
{
let a = $target[1];
return a
}
}
if ($target.type === "," &&
$target[1].type === "empty") {
{
let a = $target[0];
return a
}
}
if ($target.type === "," &&
$target[0].type === "many" &&
$target[0][0].type === "cons" &&
$target[0][0][1].type === "nil" &&
$target[1].type === "many") {
{
let a = $target[0][0][0];
let b = $target[1][0];
return many(cons(a)(b))
}
}
if ($target.type === "," &&
$target[1].type === "many") {
{
let a = $target[0];
let b = $target[1][0];
return many(cons(a)(b))
}
}
return many(cons(first)(cons(second)(nil)))
throw new Error('Failed to match. ' + valueToString($target));
})($co(first)(second));

const bag$slfold = (f) => (init) => (bag) => (($target) => {
if ($target.type === "empty") {
return init
}
if ($target.type === "one") {
{
let v = $target[0];
return f(init)(v)
}
}
if ($target.type === "many") {
{
let items = $target[0];
return foldr(init)(items)(bag$slfold(f))
}
}
throw new Error('Failed to match. ' + valueToString($target));
})(bag);

const bag$slto_list = (bag) => bag$slfold((list) => (one) => cons(one)(list))(nil)(bag);

const pat_names = (pat) => (($target) => {
if ($target.type === "pany") {
return set$slnil
}
if ($target.type === "pvar") {
{
let name = $target[0];
let l = $target[1];
return set$sladd(set$slnil)(name)
}
}
if ($target.type === "pcon") {
{
let name = $target[0];
let nl = $target[1];
let args = $target[2];
let l = $target[3];
return foldl(set$slnil)(args)((bound) => (arg) => set$slmerge(bound)(pat_names(arg)))
}
}
if ($target.type === "pstr") {
{
let string = $target[0];
let int = $target[1];
return set$slnil
}
}
if ($target.type === "pprim") {
{
let prim = $target[0];
let int = $target[1];
return set$slnil
}
}
throw new Error('Failed to match. ' + valueToString($target));
})(pat);

const pat_externals = (pat) => (($target) => {
if ($target.type === "pcon") {
{
let name = $target[0];
let nl = $target[1];
let args = $target[2];
let l = $target[3];
return bag$sland(one($co(name)($co(value)(nl))))(many(map(args)(pat_externals)))
}
}
return empty
throw new Error('Failed to match. ' + valueToString($target));
})(pat);

const externals_type = (bound) => (t) => (($target) => {
if ($target.type === "tvar") {
return empty
}
if ($target.type === "tcon") {
{
let name = $target[0];
let l = $target[1];
return (($target) => {
if ($target === true) {
return empty
}
return one($co(name)($co(type)(l)))
throw new Error('Failed to match. ' + valueToString($target));
})(set$slhas(bound)(name))
}
}
if ($target.type === "tapp") {
{
let one = $target[0];
let two = $target[1];
return bag$sland(externals_type(bound)(one))(externals_type(bound)(two))
}
}
throw new Error('Failed to match. ' + valueToString($target));
})(t);

const pat_names_loc = (pat) => (($target) => {
if ($target.type === "pany") {
return empty
}
if ($target.type === "pvar") {
{
let name = $target[0];
let l = $target[1];
return one($co(name)(l))
}
}
if ($target.type === "pcon") {
{
let name = $target[0];
let nl = $target[1];
let args = $target[2];
let l = $target[3];
return foldl(one($co(name)(nl)))(args)((bound) => (arg) => bag$sland(bound)(pat_names_loc(arg)))
}
}
if ($target.type === "pstr") {
{
let string = $target[0];
let int = $target[1];
return empty
}
}
if ($target.type === "pprim") {
{
let prim = $target[0];
let int = $target[1];
return empty
}
}
throw new Error('Failed to match. ' + valueToString($target));
})(pat);

const fold_type = (init) => (type) => (f) => ((v) => (($target) => {
if ($target.type === "tapp") {
{
let target = $target[0];
let arg = $target[1];
return fold_type(fold_type(v)(target)(f))(arg)(f)
}
}
return v
throw new Error('Failed to match. ' + valueToString($target));
})(type))(f(init)(type));

const type_type = (type) => (($target) => {
if ($target.type === "tapp") {
return "app"
}
if ($target.type === "tvar") {
return "var"
}
if ($target.type === "tcon") {
return "con"
}
throw new Error('Failed to match. ' + valueToString($target));
})(type);

const type_size = (type) => fold_type(0)(type)((v) => (_) => $pl(1)(v));

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
let other = $target[1];
return cons(one)(concat(cons(rest)(other)))
}
}
throw new Error('Failed to match. ' + valueToString($target));
})(lists);

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
let o = $target[0][0];
let one = $target[0][1];
let t = $target[1][0];
let two = $target[1][1];
return cons($co(o)(t))(zip(one)(two))
}
}
throw new Error('Failed to match. ' + valueToString($target));
})($co(one)(two));

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

const stypealias = (v0) => (v1) => (v2) => (v3) => (v4) => ({type: "stypealias", 0: v0, 1: v1, 2: v2, 3: v3, 4: v4})
const sdeftype = (v0) => (v1) => (v2) => (v3) => (v4) => ({type: "sdeftype", 0: v0, 1: v1, 2: v2, 3: v3, 4: v4})
const sdef = (v0) => (v1) => (v2) => (v3) => ({type: "sdef", 0: v0, 1: v1, 2: v2, 3: v3})
const sexpr = (v0) => (v1) => ({type: "sexpr", 0: v0, 1: v1})
const parse_pat = (pat) => (($target) => {
if ($target.type === "cst/identifier" &&
$target[0] === "_") {
{
let l = $target[1];
return pany(l)
}
}
if ($target.type === "cst/identifier" &&
$target[0] === "true") {
{
let l = $target[1];
return pprim(pbool(true)(l))(l)
}
}
if ($target.type === "cst/identifier" &&
$target[0] === "false") {
{
let l = $target[1];
return pprim(pbool(false)(l))(l)
}
}
if ($target.type === "cst/string" &&
$target[1].type === "nil") {
{
let first = $target[0];
let l = $target[2];
return pstr(first)(l)
}
}
if ($target.type === "cst/identifier") {
{
let id = $target[0];
let l = $target[1];
return (($target) => {
if ($target.type === "some") {
{
let int = $target[0];
return pprim(pint(int)(l))(l)
}
}
return pvar(id)(l)
throw new Error('Failed to match. ' + valueToString($target));
})(string_to_int(id))
}
}
if ($target.type === "cst/array" &&
$target[0].type === "nil") {
{
let l = $target[1];
return pcon("nil")(-1)(nil)(l)
}
}
if ($target.type === "cst/array" &&
$target[0].type === "cons" &&
$target[0][0].type === "cst/spread" &&
$target[0][1].type === "nil") {
{
let inner = $target[0][0][0];
return parse_pat(inner)
}
}
if ($target.type === "cst/array" &&
$target[0].type === "cons") {
{
let one = $target[0][0];
let rest = $target[0][1];
let l = $target[1];
return pcon("cons")(-1)(cons(parse_pat(one))(cons(parse_pat(cst$slarray(rest)(l)))(nil)))(l)
}
}
if ($target.type === "cst/list" &&
$target[0].type === "nil") {
{
let l = $target[1];
return pcon("()")(-1)(nil)(l)
}
}
if ($target.type === "cst/list" &&
$target[0].type === "cons" &&
$target[0][0].type === "cst/identifier" &&
$target[0][0][0] === ",") {
{
let il = $target[0][0][1];
let args = $target[0][1];
let l = $target[1];
return parse_pat_tuple(args)(il)(l)
}
}
if ($target.type === "cst/list" &&
$target[0].type === "cons" &&
$target[0][0].type === "cst/identifier") {
{
let name = $target[0][0][0];
let il = $target[0][0][1];
let rest = $target[0][1];
let l = $target[1];
return pcon(name)(il)(map(rest)(parse_pat))(l)
}
}
return fatal(`parse-pat mo match ${valueToString(pat)}`)
throw new Error('Failed to match. ' + valueToString($target));
})(pat);


const parse_pat_tuple = (items) => (il) => (l) => (($target) => {
if ($target.type === "nil") {
return pcon(",")(-1)(nil)(il)
}
if ($target.type === "cons" &&
$target[1].type === "nil") {
{
let one = $target[0];
return parse_pat(one)
}
}
if ($target.type === "cons") {
{
let one = $target[0];
let rest = $target[1];
return pcon(",")(-1)(cons(parse_pat(one))(cons(parse_pat_tuple(rest)(il)(l))(nil)))(l)
}
}
throw new Error('Failed to match. ' + valueToString($target));
})(items);

const parse_type = (type) => (($target) => {
if ($target.type === "cst/identifier") {
{
let id = $target[0];
let l = $target[1];
return tcon(id)(l)
}
}
if ($target.type === "cst/list" &&
$target[0].type === "nil") {
{
let l = $target[1];
return fatal("(parse-type) with empty list")
}
}
if ($target.type === "cst/list" &&
$target[0].type === "cons" &&
$target[0][0].type === "cst/identifier" &&
$target[0][0][0] === "fn" &&
$target[0][1].type === "cons" &&
$target[0][1][0].type === "cst/array" &&
$target[0][1][1].type === "cons" &&
$target[0][1][1][1].type === "nil") {
{
let args = $target[0][1][0][0];
let body = $target[0][1][1][0];
return foldl(parse_type(body))(rev(args)(nil))((body) => (arg) => tapp(tapp(tcon("->")(-1))(parse_type(arg))(-1))(body)(-1))
}
}
if ($target.type === "cst/list" &&
$target[0].type === "cons" &&
$target[0][0].type === "cst/identifier" &&
$target[0][0][0] === ",") {
{
let nl = $target[0][0][1];
let items = $target[0][1];
let al = $target[1];
return loop(map(items)(parse_type))((items) => (recur) => (($target) => {
if ($target.type === "cons" &&
$target[1].type === "cons" &&
$target[1][1].type === "nil") {
{
let one = $target[0];
let two = $target[1][0];
return tapp(tapp(tcon(",")(nl))(one)(al))(two)(al)
}
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
return tapp(tapp(tcon(",")(nl))(one)(al))(recur(rest))(al)
}
}
throw new Error('Failed to match. ' + valueToString($target));
})(items))
}
}
if ($target.type === "cst/list") {
{
let items = $target[0];
let l = $target[1];
return loop(rev(map(items)(parse_type))(nil))((items) => (recur) => (($target) => {
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
return tapp(recur(rest))(one)(l)
}
}
throw new Error('Failed to match. ' + valueToString($target));
})(items))
}
}
return fatal(`(parse-type) Invalid type ${valueToString(type)}`)
throw new Error('Failed to match. ' + valueToString($target));
})(type);

const mk_deftype = (id) => (li) => (args) => (items) => (l) => sdeftype(id)(li)(map(args)((arg) => (($target) => {
if ($target.type === "cst/identifier") {
{
let name = $target[0];
let l = $target[1];
return $co(name)(l)
}
}
return fatal("deftype type argument must be identifier")
throw new Error('Failed to match. ' + valueToString($target));
})(arg)))(foldr(nil)(items)((res) => (constr) => (($target) => {
if ($target.type === "cst/list" &&
$target[0].type === "cons" &&
$target[0][0].type === "cst/identifier") {
{
let name = $target[0][0][0];
let ni = $target[0][0][1];
let args = $target[0][1];
let l = $target[1];
return cons($co(name)($co(ni)($co(map(args)(parse_type))(l))))(res)
}
}
if ($target.type === "cst/list" &&
$target[0].type === "nil") {
{
let l = $target[1];
return res
}
}
return fatal("Invalid type constructor")
throw new Error('Failed to match. ' + valueToString($target));
})(constr)))(l);

const expr_loc = (expr) => (($target) => {
if ($target.type === "estr") {
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
if ($target.type === "equot") {
{
let l = $target[1];
return l
}
}
if ($target.type === "elambda") {
{
let l = $target[2];
return l
}
}
if ($target.type === "elet") {
{
let l = $target[2];
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
throw new Error('Failed to match. ' + valueToString($target));
})(expr);

const parse_and_compile = (v0) => (v1) => (v2) => (v3) => (v4) => (v5) => (v6) => (v7) => ({type: "parse-and-compile", 0: v0, 1: v1, 2: v2, 3: v3, 4: v4, 5: v5, 6: v6, 7: v7})
const externals = (bound) => (expr) => (($target) => {
if ($target.type === "evar") {
{
let name = $target[0];
let l = $target[1];
return (($target) => {
if ($target === true) {
return empty
}
return one($co(name)($co(value)(l)))
throw new Error('Failed to match. ' + valueToString($target));
})(set$slhas(bound)(name))
}
}
if ($target.type === "eprim") {
{
let prim = $target[0];
let l = $target[1];
return empty
}
}
if ($target.type === "estr") {
{
let first = $target[0];
let templates = $target[1];
let l = $target[2];
return many(map(templates)((arg) => (($target) => {
if ($target.type === "," &&
$target[1].type === ",") {
{
let expr = $target[0];
return externals(bound)(expr)
}
}
throw new Error('Failed to match. ' + valueToString($target));
})(arg)))
}
}
if ($target.type === "equot") {
{
let expr = $target[0];
let l = $target[1];
return empty
}
}
if ($target.type === "elambda") {
{
let pats = $target[0];
let body = $target[1];
let l = $target[2];
return bag$sland(foldl(empty)(map(pats)(pat_externals))(bag$sland))(externals(foldl(bound)(map(pats)(pat_names))(set$slmerge))(body))
}
}
if ($target.type === "elet") {
{
let bindings = $target[0];
let body = $target[1];
let l = $target[2];
return bag$sland(foldl(empty)(map(bindings)((arg) => (({1: init, 0: pat}) => bag$sland(pat_externals(pat))(externals(bound)(init)))(arg)))(bag$sland))(externals(foldl(bound)(map(bindings)((arg) => (({0: pat}) => pat_names(pat))(arg)))(set$slmerge))(body))
}
}
if ($target.type === "eapp") {
{
let target = $target[0];
let args = $target[1];
let l = $target[2];
return bag$sland(externals(bound)(target))(foldl(empty)(map(args)(externals(bound)))(bag$sland))
}
}
if ($target.type === "ematch") {
{
let expr = $target[0];
let cases = $target[1];
let l = $target[2];
return bag$sland(externals(bound)(expr))(foldl(empty)(cases)((bag) => (arg) => (($target) => {
if ($target.type === ",") {
{
let pat = $target[0];
let body = $target[1];
return bag$sland(bag$sland(bag)(pat_externals(pat)))(externals(set$slmerge(bound)(pat_names(pat)))(body))
}
}
throw new Error('Failed to match. ' + valueToString($target));
})(arg)))
}
}
throw new Error('Failed to match. ' + valueToString($target));
})(expr);

const names = (stmt) => (($target) => {
if ($target.type === "sdef") {
{
let name = $target[0];
let l = $target[1];
return cons($co(name)($co(value)(l)))(nil)
}
}
if ($target.type === "sexpr") {
return nil
}
if ($target.type === "stypealias") {
{
let name = $target[0];
let l = $target[1];
return cons($co(name)($co(type)(l)))(nil)
}
}
if ($target.type === "sdeftype") {
{
let name = $target[0];
let l = $target[1];
let constructors = $target[3];
return cons($co(name)($co(type)(l)))(map(constructors)((arg) => (($target) => {
if ($target.type === "," &&
$target[1].type === "," &&
$target[1][1].type === ",") {
{
let name = $target[0];
let l = $target[1][0];
return $co(name)($co(value)(l))
}
}
throw new Error('Failed to match. ' + valueToString($target));
})(arg)))
}
}
throw new Error('Failed to match. ' + valueToString($target));
})(stmt);

const externals_stmt = (stmt) => bag$slto_list((($target) => {
if ($target.type === "sdeftype") {
{
let name = $target[0];
let l = $target[1];
let free = $target[2];
let constructors = $target[3];
return ((frees) => many(map(constructors)((constructor) => (($target) => {
if ($target.type === "," &&
$target[1].type === "," &&
$target[1][1].type === ",") {
{
let name = $target[0];
let l = $target[1][0];
let args = $target[1][1][0];
return (($target) => {
if ($target.type === "nil") {
return empty
}
return many(map(args)(externals_type(frees)))
throw new Error('Failed to match. ' + valueToString($target));
})(args)
}
}
throw new Error('Failed to match. ' + valueToString($target));
})(constructor))))(set$slfrom_list(map(free)(fst)))
}
}
if ($target.type === "stypealias") {
{
let name = $target[0];
let args = $target[2];
let body = $target[3];
return ((frees) => externals_type(frees)(body))(set$slfrom_list(map(args)(fst)))
}
}
if ($target.type === "sdef") {
{
let name = $target[0];
let body = $target[2];
return externals(set$sladd(set$slnil)(name))(body)
}
}
if ($target.type === "sexpr") {
{
let expr = $target[0];
return externals(set$slnil)(expr)
}
}
throw new Error('Failed to match. ' + valueToString($target));
})(stmt));

const fold_expr = (init) => (expr) => (f) => ((v) => (($target) => {
if ($target.type === "estr") {
{
let tpl = $target[1];
return foldl(v)(tpl)((init) => ({0: expr}) => fold_expr(init)(expr)(f))
}
}
if ($target.type === "elambda") {
{
let body = $target[1];
return fold_expr(v)(body)(f)
}
}
if ($target.type === "elet") {
{
let bindings = $target[0];
let body = $target[1];
return fold_expr(foldl(v)(bindings)((init) => (binding) => fold_expr(init)(snd(binding))(f)))(body)(f)
}
}
if ($target.type === "eapp") {
{
let target = $target[0];
let args = $target[1];
return foldl(fold_expr(v)(target)(f))(args)((init) => (expr) => fold_expr(init)(expr)(f))
}
}
if ($target.type === "ematch") {
{
let expr = $target[0];
let cases = $target[1];
return foldl(fold_expr(v)(expr)(f))(cases)((init) => ($case) => fold_expr(init)(snd($case))(f))
}
}
return v
throw new Error('Failed to match. ' + valueToString($target));
})(expr))(f(init)(expr));

const expr_type = (expr) => (($target) => {
if ($target.type === "eprim") {
{
let prim = $target[0];
let int = $target[1];
return "prim"
}
}
if ($target.type === "estr") {
{
let string = $target[0];
let int = $target[2];
return "str"
}
}
if ($target.type === "evar") {
{
let string = $target[0];
let int = $target[1];
return "var"
}
}
if ($target.type === "equot") {
{
let quot = $target[0];
let int = $target[1];
return "quot"
}
}
if ($target.type === "elambda") {
{
let expr = $target[1];
let int = $target[2];
return "lambda"
}
}
if ($target.type === "eapp") {
{
let expr = $target[0];
let int = $target[2];
return "app"
}
}
if ($target.type === "elet") {
{
let expr = $target[1];
let int = $target[2];
return "let"
}
}
if ($target.type === "ematch") {
{
let expr = $target[0];
let int = $target[2];
return "match"
}
}
throw new Error('Failed to match. ' + valueToString($target));
})(expr);

const expr_size = (expr) => fold_expr(0)(expr)((v) => (_) => $pl(1)(v));

const stmt_size = (stmt) => $pl(1)((($target) => {
if ($target.type === "sdef") {
{
let string = $target[0];
let expr = $target[2];
return expr_size(expr)
}
}
if ($target.type === "sexpr") {
{
let expr = $target[0];
return expr_size(expr)
}
}
if ($target.type === "stypealias") {
{
let string = $target[0];
let args = $target[2];
let type = $target[3];
return type_size(type)
}
}
if ($target.type === "sdeftype") {
{
let string = $target[0];
let args = $target[2];
let constructors = $target[3];
return foldl(0)(constructors)((v) => ({1: {1: {0: args}}}) => foldl(v)(map(args)(type_size))($pl))
}
}
throw new Error('Failed to match. ' + valueToString($target));
})(stmt));

const map_expr = (f) => (expr) => (($target) => {
if ($target.type === "estr") {
{
let first = $target[0];
let tpl = $target[1];
let l = $target[2];
return estr(first)(map(tpl)(({1: rest, 0: expr}) => $co(map_expr(f)(expr))(rest)))(l)
}
}
if ($target.type === "elambda") {
{
let pats = $target[0];
let body = $target[1];
let l = $target[2];
return elambda(pats)(map_expr(f)(body))(l)
}
}
if ($target.type === "elet") {
{
let bindings = $target[0];
let body = $target[1];
let l = $target[2];
return elet(map(bindings)(map$co1(map_expr(f))))(map_expr(f)(body))(l)
}
}
if ($target.type === "eapp") {
{
let target = $target[0];
let args = $target[1];
let l = $target[2];
return eapp(map_expr(f)(target))(map(args)(map_expr(f)))(l)
}
}
if ($target.type === "ematch") {
{
let expr = $target[0];
let cases = $target[1];
let l = $target[2];
return ematch(map_expr(f)(expr))(map(cases)(map$co1(map_expr(f))))(l)
}
}
{
let otherwise = $target;
return otherwise
}
throw new Error('Failed to match. ' + valueToString($target));
})(f(expr));

const parse_stmt = (cst) => (($target) => {
if ($target.type === "cst/list" &&
$target[0].type === "cons" &&
$target[0][0].type === "cst/identifier" &&
$target[0][0][0] === "def" &&
$target[0][1].type === "cons" &&
$target[0][1][0].type === "cst/identifier" &&
$target[0][1][1].type === "cons" &&
$target[0][1][1][1].type === "nil") {
{
let id = $target[0][1][0][0];
let li = $target[0][1][0][1];
let value = $target[0][1][1][0];
let l = $target[1];
return sdef(id)(li)(parse_expr(value))(l)
}
}
if ($target.type === "cst/list" &&
$target[0].type === "cons" &&
$target[0][0].type === "cst/identifier" &&
$target[0][0][0] === "defn" &&
$target[0][1].type === "cons" &&
$target[0][1][0].type === "cst/identifier" &&
$target[0][1][1].type === "cons" &&
$target[0][1][1][0].type === "cst/array" &&
$target[0][1][1][1].type === "cons" &&
$target[0][1][1][1][1].type === "nil") {
{
let a = $target[0][0][1];
let id = $target[0][1][0][0];
let li = $target[0][1][0][1];
let args = $target[0][1][1][0][0];
let b = $target[0][1][1][0][1];
let body = $target[0][1][1][1][0];
let c = $target[1];
return sdef(id)(li)(parse_expr(cst$sllist(cons(cst$slidentifier("fn")(a))(cons(cst$slarray(args)(b))(cons(body)(nil))))(c)))(c)
}
}
if ($target.type === "cst/list" &&
$target[0].type === "cons" &&
$target[0][0].type === "cst/identifier" &&
$target[0][0][0] === "defn") {
{
let l = $target[1];
return fatal(`Invalid 'defn' ${int_to_string(l)}`)
}
}
if ($target.type === "cst/list" &&
$target[0].type === "cons" &&
$target[0][0].type === "cst/identifier" &&
$target[0][0][0] === "deftype" &&
$target[0][1].type === "cons" &&
$target[0][1][0].type === "cst/identifier") {
{
let id = $target[0][1][0][0];
let li = $target[0][1][0][1];
let items = $target[0][1][1];
let l = $target[1];
return mk_deftype(id)(li)(nil)(items)(l)
}
}
if ($target.type === "cst/list" &&
$target[0].type === "cons" &&
$target[0][0].type === "cst/identifier" &&
$target[0][0][0] === "deftype" &&
$target[0][1].type === "cons" &&
$target[0][1][0].type === "cst/list" &&
$target[0][1][0][0].type === "cons" &&
$target[0][1][0][0][0].type === "cst/identifier") {
{
let id = $target[0][1][0][0][0][0];
let li = $target[0][1][0][0][0][1];
let args = $target[0][1][0][0][1];
let items = $target[0][1][1];
let l = $target[1];
return mk_deftype(id)(li)(args)(items)(l)
}
}
if ($target.type === "cst/list" &&
$target[0].type === "cons" &&
$target[0][0].type === "cst/identifier" &&
$target[0][0][0] === "typealias" &&
$target[0][1].type === "cons" &&
$target[0][1][0].type === "cst/identifier" &&
$target[0][1][1].type === "cons" &&
$target[0][1][1][1].type === "nil") {
{
let name = $target[0][1][0][0];
let nl = $target[0][1][0][1];
let body = $target[0][1][1][0];
let l = $target[1];
return stypealias(name)(nl)(nil)(parse_type(body))(l)
}
}
if ($target.type === "cst/list" &&
$target[0].type === "cons" &&
$target[0][0].type === "cst/identifier" &&
$target[0][0][0] === "typealias" &&
$target[0][1].type === "cons" &&
$target[0][1][0].type === "cst/list" &&
$target[0][1][0][0].type === "cons" &&
$target[0][1][0][0][0].type === "cst/identifier" &&
$target[0][1][1].type === "cons" &&
$target[0][1][1][1].type === "nil") {
{
let name = $target[0][1][0][0][0][0];
let nl = $target[0][1][0][0][0][1];
let args = $target[0][1][0][0][1];
let body = $target[0][1][1][0];
let l = $target[1];
return ((args) => stypealias(name)(nl)(args)(parse_type(body))(l))(map(args)((x) => (($target) => {
if ($target.type === "cst/identifier") {
{
let name = $target[0];
let l = $target[1];
return $co(name)(l)
}
}
return fatal("typealias type argument must be identifier")
throw new Error('Failed to match. ' + valueToString($target));
})(x)))
}
}
if ($target.type === "cst/list" &&
$target[0].type === "cons" &&
$target[0][0].type === "cst/identifier" &&
$target[0][0][0] === "deftype") {
{
let l = $target[1];
return fatal(`Invalid 'deftype' ${int_to_string(l)}`)
}
}
return sexpr(parse_expr(cst))((($target) => {
if ($target.type === "cst/list") {
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
throw new Error('Failed to match. ' + valueToString($target));
})(cst))
throw new Error('Failed to match. ' + valueToString($target));
})(cst);


const parse_expr = (cst) => (($target) => {
if ($target.type === "cst/identifier" &&
$target[0] === "true") {
{
let l = $target[1];
return eprim(pbool(true)(l))(l)
}
}
if ($target.type === "cst/identifier" &&
$target[0] === "false") {
{
let l = $target[1];
return eprim(pbool(false)(l))(l)
}
}
if ($target.type === "cst/string") {
{
let first = $target[0];
let templates = $target[1];
let l = $target[2];
return estr(first)(map(templates)(({1: {1: l, 0: string}, 0: expr}) => $co(parse_expr(expr))($co(string)(l))))(l)
}
}
if ($target.type === "cst/identifier") {
{
let id = $target[0];
let l = $target[1];
return (($target) => {
if ($target.type === "some") {
{
let int = $target[0];
return eprim(pint(int)(l))(l)
}
}
if ($target.type === "none") {
return evar(id)(l)
}
throw new Error('Failed to match. ' + valueToString($target));
})(string_to_int(id))
}
}
if ($target.type === "cst/list" &&
$target[0].type === "cons" &&
$target[0][0].type === "cst/identifier" &&
$target[0][0][0] === "@" &&
$target[0][1].type === "cons" &&
$target[0][1][1].type === "nil") {
{
let body = $target[0][1][0];
let l = $target[1];
return equot(quot$slexpr(parse_expr(body)))(l)
}
}
if ($target.type === "cst/list" &&
$target[0].type === "cons" &&
$target[0][0].type === "cst/identifier" &&
$target[0][0][0] === "@@" &&
$target[0][1].type === "cons" &&
$target[0][1][1].type === "nil") {
{
let body = $target[0][1][0];
let l = $target[1];
return equot(quot$slquot(body))(l)
}
}
if ($target.type === "cst/list" &&
$target[0].type === "cons" &&
$target[0][0].type === "cst/identifier" &&
$target[0][0][0] === "@!" &&
$target[0][1].type === "cons" &&
$target[0][1][1].type === "nil") {
{
let body = $target[0][1][0];
let l = $target[1];
return equot(quot$slstmt(parse_stmt(body)))(l)
}
}
if ($target.type === "cst/list" &&
$target[0].type === "cons" &&
$target[0][0].type === "cst/identifier" &&
$target[0][0][0] === "@t" &&
$target[0][1].type === "cons" &&
$target[0][1][1].type === "nil") {
{
let body = $target[0][1][0];
let l = $target[1];
return equot(quot$sltype(parse_type(body)))(l)
}
}
if ($target.type === "cst/list" &&
$target[0].type === "cons" &&
$target[0][0].type === "cst/identifier" &&
$target[0][0][0] === "@p" &&
$target[0][1].type === "cons" &&
$target[0][1][1].type === "nil") {
{
let body = $target[0][1][0];
let l = $target[1];
return equot(quot$slpat(parse_pat(body)))(l)
}
}
if ($target.type === "cst/list" &&
$target[0].type === "cons" &&
$target[0][0].type === "cst/identifier" &&
$target[0][0][0] === "if" &&
$target[0][1].type === "cons" &&
$target[0][1][1].type === "cons" &&
$target[0][1][1][1].type === "cons" &&
$target[0][1][1][1][1].type === "nil") {
{
let cond = $target[0][1][0];
let yes = $target[0][1][1][0];
let no = $target[0][1][1][1][0];
let l = $target[1];
return ematch(parse_expr(cond))(cons($co(pprim(pbool(true)(l))(l))(parse_expr(yes)))(cons($co(pany(l))(parse_expr(no)))(nil)))(l)
}
}
if ($target.type === "cst/list" &&
$target[0].type === "cons" &&
$target[0][0].type === "cst/identifier" &&
$target[0][0][0] === "fn" &&
$target[0][1].type === "cons" &&
$target[0][1][0].type === "cst/array" &&
$target[0][1][1].type === "cons" &&
$target[0][1][1][1].type === "nil") {
{
let args = $target[0][1][0][0];
let body = $target[0][1][1][0];
let b = $target[1];
return elambda(map(args)(parse_pat))(parse_expr(body))(b)
}
}
if ($target.type === "cst/list" &&
$target[0].type === "cons" &&
$target[0][0].type === "cst/identifier" &&
$target[0][0][0] === "fn") {
{
let l = $target[1];
return fatal(`Invalid 'fn' ${int_to_string(l)}`)
}
}
if ($target.type === "cst/list" &&
$target[0].type === "cons" &&
$target[0][0].type === "cst/identifier" &&
$target[0][0][0] === "match" &&
$target[0][1].type === "cons") {
{
let target = $target[0][1][0];
let cases = $target[0][1][1];
let l = $target[1];
return ematch(parse_expr(target))(map(pairs(cases))(($case) => (({1: expr, 0: pat}) => $co(parse_pat(pat))(parse_expr(expr)))($case)))(l)
}
}
if ($target.type === "cst/list" &&
$target[0].type === "cons" &&
$target[0][0].type === "cst/identifier" &&
$target[0][0][0] === "let" &&
$target[0][1].type === "cons" &&
$target[0][1][0].type === "cst/array" &&
$target[0][1][1].type === "cons" &&
$target[0][1][1][1].type === "nil") {
{
let inits = $target[0][1][0][0];
let body = $target[0][1][1][0];
let l = $target[1];
return elet(map(pairs(inits))((pair) => (({1: value, 0: pat}) => $co(parse_pat(pat))(parse_expr(value)))(pair)))(parse_expr(body))(l)
}
}
if ($target.type === "cst/list" &&
$target[0].type === "cons" &&
$target[0][0].type === "cst/identifier" &&
$target[0][0][0] === "let->" &&
$target[0][1].type === "cons" &&
$target[0][1][0].type === "cst/array" &&
$target[0][1][1].type === "cons" &&
$target[0][1][1][1].type === "nil") {
{
let el = $target[0][0][1];
let inits = $target[0][1][0][0];
let body = $target[0][1][1][0];
let l = $target[1];
return foldr(parse_expr(body))(pairs(inits))((body) => (init) => (({1: value, 0: pat}) => eapp(evar(">>=")(el))(cons(parse_expr(value))(cons(elambda(cons(parse_pat(pat))(nil))(body)(l))(nil)))(l))(init))
}
}
if ($target.type === "cst/list" &&
$target[0].type === "cons" &&
$target[0][0].type === "cst/identifier" &&
$target[0][0][0] === "let") {
{
let l = $target[1];
return fatal(`Invalid 'let' ${int_to_string(l)}`)
}
}
if ($target.type === "cst/list" &&
$target[0].type === "cons" &&
$target[0][0].type === "cst/identifier" &&
$target[0][0][0] === ",") {
{
let il = $target[0][0][1];
let args = $target[0][1];
let l = $target[1];
return parse_tuple(args)(il)(l)
}
}
if ($target.type === "cst/list" &&
$target[0].type === "nil") {
{
let l = $target[1];
return evar("()")(l)
}
}
if ($target.type === "cst/list" &&
$target[0].type === "cons") {
{
let target = $target[0][0];
let args = $target[0][1];
let l = $target[1];
return eapp(parse_expr(target))(map(args)(parse_expr))(l)
}
}
if ($target.type === "cst/array") {
{
let args = $target[0];
let l = $target[1];
return parse_array(args)(l)
}
}
throw new Error('Failed to match. ' + valueToString($target));
})(cst);


const parse_tuple = (args) => (il) => (l) => (($target) => {
if ($target.type === "nil") {
return evar(",")(il)
}
if ($target.type === "cons" &&
$target[1].type === "nil") {
{
let one = $target[0];
return parse_expr(one)
}
}
if ($target.type === "cons") {
{
let one = $target[0];
let rest = $target[1];
return eapp(evar(",")(il))(cons(parse_expr(one))(cons(parse_tuple(rest)(il)(l))(nil)))(l)
}
}
throw new Error('Failed to match. ' + valueToString($target));
})(args);


const parse_array = (args) => (l) => (($target) => {
if ($target.type === "nil") {
return evar("nil")(l)
}
if ($target.type === "cons" &&
$target[0].type === "cst/spread" &&
$target[1].type === "nil") {
{
let inner = $target[0][0];
return parse_expr(inner)
}
}
if ($target.type === "cons") {
{
let one = $target[0];
let rest = $target[1];
return eapp(evar("cons")(l))(cons(parse_expr(one))(cons(parse_array(rest)(l))(nil)))(l)
}
}
throw new Error('Failed to match. ' + valueToString($target));
})(args);

return eval("({0: parse_stmt,  1: parse_expr, 2: names, 3: externals_stmt, 4: externals_expr, 5: stmt_size, 6: expr_size, 7: type_size}) => ({\ntype: 'fns', parse_stmt, parse_expr, names, externals_stmt, externals_expr, stmt_size, expr_size, type_size})")(parse_and_compile(parse_stmt)(parse_expr)(names)(externals_stmt)((expr) => bag$slto_list(externals(set$slnil)(expr)))(stmt_size)(expr_size)(type_size))