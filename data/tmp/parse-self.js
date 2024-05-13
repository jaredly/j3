let pint = (v0) => (v1) => ({type: "pint", 0: v0, 1: v1})
let pbool = (v0) => (v1) => ({type: "pbool", 0: v0, 1: v1})
let snd = (tuple) => {
let {"1": v} = tuple;
return v
}
let fst = (tuple) => {
let {"0": v} = tuple;
return v
}
let some = (v0) => ({type: "some", 0: v0})
let none = {type: "none"}
let value = {type: "value"}
let type = {type: "type"}
let loop = (v) => (f) => f(v)((nv) => loop(nv)(f))

let nil = {type: "nil"}
let cons = (v0) => (v1) => ({type: "cons", 0: v0, 1: v1})
let pany = (v0) => ({type: "pany", 0: v0})
let pvar = (v0) => (v1) => ({type: "pvar", 0: v0, 1: v1})
let pcon = (v0) => (v1) => (v2) => (v3) => ({type: "pcon", 0: v0, 1: v1, 2: v2, 3: v3})
let pstr = (v0) => (v1) => ({type: "pstr", 0: v0, 1: v1})
let pprim = (v0) => (v1) => ({type: "pprim", 0: v0, 1: v1})
let tvar = (v0) => (v1) => ({type: "tvar", 0: v0, 1: v1})
let tapp = (v0) => (v1) => (v2) => ({type: "tapp", 0: v0, 1: v1, 2: v2})
let tcon = (v0) => (v1) => ({type: "tcon", 0: v0, 1: v1})
let cst$sllist = (v0) => (v1) => ({type: "cst/list", 0: v0, 1: v1})
let cst$slarray = (v0) => (v1) => ({type: "cst/array", 0: v0, 1: v1})
let cst$slspread = (v0) => (v1) => ({type: "cst/spread", 0: v0, 1: v1})
let cst$slid = (v0) => (v1) => ({type: "cst/id", 0: v0, 1: v1})
let cst$slstring = (v0) => (v1) => (v2) => ({type: "cst/string", 0: v0, 1: v1, 2: v2})
let one = (v0) => ({type: "one", 0: v0})
let many = (v0) => ({type: "many", 0: v0})
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
throw new Error('match fail 151:' + JSON.stringify($target))
}
} ;
throw new Error('match fail 139:' + JSON.stringify($target))
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
throw new Error('match fail 229:' + JSON.stringify($target))
})(values)
let pairs = (list) => (($target) => {
if ($target.type === "nil") {
return nil
} ;
if ($target.type === "cons") {
let one = $target[0];
if ($target[1].type === "cons") {
let two = $target[1][0];
let rest = $target[1][1];
return cons($co(one)(two))(pairs(rest))
} 
} ;
return fatal(`Pairs given odd number ${valueToString(list)}`);
throw new Error('match fail 1690:' + JSON.stringify($target))
})(list)
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
throw new Error('match fail 2112:' + JSON.stringify($target))
}
} ;
throw new Error('match fail 2101:' + JSON.stringify($target))
})(repl)
let rev = (arr) => (col) => (($target) => {
if ($target.type === "nil") {
return col
} ;
if ($target.type === "cons") {
let one = $target[0];
if ($target[1].type === "nil") {
return cons(one)(col)
} 
} ;
if ($target.type === "cons") {
let one = $target[0];
let rest = $target[1];
return rev(rest)(cons(one)(col))
} ;
throw new Error('match fail 5384:' + JSON.stringify($target))
})(arr)
let foldl = (init) => (items) => (f) => (($target) => {
if ($target.type === "nil") {
return init
} ;
if ($target.type === "cons") {
let one = $target[0];
let rest = $target[1];
return foldl(f(init)(one))(rest)(f)
} ;
throw new Error('match fail 5863:' + JSON.stringify($target))
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
throw new Error('match fail 5889:' + JSON.stringify($target))
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
throw new Error('match fail 5920:' + JSON.stringify($target))
})(items)
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
throw new Error('match fail 6573:' + JSON.stringify($target))
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
throw new Error('match fail 6631:' + JSON.stringify($target))
})(bag)
let bag$slto_list = (bag) => bag$slfold((list) => (one) => cons(one)(list))(nil)(bag)
let pat_bound = (pat) => (($target) => {
if ($target.type === "pany") {
return set$slnil
} ;
if ($target.type === "pvar") {
let name = $target[0];
return set$sladd(set$slnil)(name)
} ;
if ($target.type === "pcon") {
let args = $target[2];
return foldl(set$slnil)(args)((bound) => (arg) => set$slmerge(bound)(pat_bound(arg)))
} ;
if ($target.type === "pstr") {
return set$slnil
} ;
if ($target.type === "pprim") {
return set$slnil
} ;
throw new Error('match fail 6762:' + JSON.stringify($target))
})(pat)
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
let other = $target[1];
return cons(one)(concat(cons(rest)(other)))
} 
} ;
throw new Error('match fail 12416:' + JSON.stringify($target))
})(lists)
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
let o = $target[0][0];
let one = $target[0][1];
if ($target[1].type === "cons") {
let t = $target[1][0];
let two = $target[1][1];
return cons($co(o)(t))(zip(one)(two))
} 
} 
} ;
return fatal("Unbalanced zip");
throw new Error('match fail 15967:' + JSON.stringify($target))
})($co(one)(two))
let get_id = (x) => (($target) => {
if ($target.type === "cst/id") {
let name = $target[0];
let l = $target[1];
return $co(name)(l)
} ;
return fatal("type argument must be identifier");
throw new Error('match fail 6380:' + JSON.stringify($target))
})(x)
let id_with_maybe_args = (head) => (($target) => {
if ($target.type === "cst/id") {
let id = $target[0];
let li = $target[1];
return $co(id)($co(li)(nil))
} ;
if ($target.type === "cst/list") {
if ($target[0].type === "cons") {
if ($target[0][0].type === "cst/id") {
let id = $target[0][0][0];
let li = $target[0][0][1];
let args = $target[0][1];
return $co(id)($co(li)(map(args)(get_id)))
} 
} 
} ;
return fatal("Invalid type constructor");
throw new Error('match fail 17314:' + JSON.stringify($target))
})(head)
let cst_loc = (cst) => (($target) => {
if ($target.type === "cst/list") {
let l = $target[1];
return l
} ;
if ($target.type === "cst/id") {
let l = $target[1];
return l
} ;
if ($target.type === "cst/array") {
let l = $target[1];
return l
} ;
if ($target.type === "cst/string") {
let l = $target[2];
return l
} ;
if ($target.type === "cst/spread") {
let l = $target[1];
return l
} ;
throw new Error('match fail 4949:' + JSON.stringify($target))
})(cst)
let filter_some = (items) => foldr(nil)(items)((res) => (v) => (($target) => {
if ($target.type === "some") {
let v = $target[0];
return cons(v)(res)
} ;
return res;
throw new Error('match fail 17526:' + JSON.stringify($target))
})(v))
let empty = many(nil)
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

let ttypealias = (v0) => (v1) => (v2) => (v3) => (v4) => ({type: "ttypealias", 0: v0, 1: v1, 2: v2, 3: v3, 4: v4})
let tdeftype = (v0) => (v1) => (v2) => (v3) => (v4) => ({type: "tdeftype", 0: v0, 1: v1, 2: v2, 3: v3, 4: v4})
let tdef = (v0) => (v1) => (v2) => (v3) => ({type: "tdef", 0: v0, 1: v1, 2: v2, 3: v3})
let texpr = (v0) => (v1) => ({type: "texpr", 0: v0, 1: v1})
let parse_type = (type) => (($target) => {
if ($target.type === "cst/id") {
let id = $target[0];
let l = $target[1];
return tcon(id)(l)
} ;
if ($target.type === "cst/list") {
if ($target[0].type === "cons") {
if ($target[0][0].type === "cst/id") {
if ($target[0][0][0] === "fn") {
if ($target[0][1].type === "cons") {
if ($target[0][1][0].type === "cst/array") {
let args = $target[0][1][0][0];
if ($target[0][1][1].type === "cons") {
let body = $target[0][1][1][0];
if ($target[0][1][1][1].type === "nil") {
let l = $target[1];
return foldl(parse_type(body))(rev(args)(nil))((body) => (arg) => tapp(tapp(tcon("->")(l))(parse_type(arg))(l))(body)(l))
} 
} 
} 
} 
} 
} 
} 
} ;
if ($target.type === "cst/list") {
if ($target[0].type === "cons") {
if ($target[0][0].type === "cst/id") {
if ($target[0][0][0] === ",") {
let nl = $target[0][0][1];
let items = $target[0][1];
let al = $target[1];
return loop(map(items)(parse_type))((items) => (recur) => (($target) => {
if ($target.type === "nil") {
return fatal("Empty tuple type")
} ;
if ($target.type === "cons") {
let one = $target[0];
if ($target[1].type === "nil") {
return one
} 
} ;
if ($target.type === "cons") {
let one = $target[0];
if ($target[1].type === "cons") {
let two = $target[1][0];
if ($target[1][1].type === "nil") {
return tapp(tapp(tcon(",")(nl))(one)(al))(two)(al)
} 
} 
} ;
if ($target.type === "cons") {
let one = $target[0];
let rest = $target[1];
return tapp(tapp(tcon(",")(nl))(one)(al))(recur(rest))(al)
} ;
throw new Error('match fail 16555:' + JSON.stringify($target))
})(items))
} 
} 
} 
} ;
if ($target.type === "cst/list") {
let items = $target[0];
let l = $target[1];
return loop(rev(map(items)(parse_type))(nil))((items) => (recur) => (($target) => {
if ($target.type === "cons") {
let one = $target[0];
if ($target[1].type === "nil") {
return one
} 
} ;
if ($target.type === "cons") {
let one = $target[0];
let rest = $target[1];
return tapp(recur(rest))(one)(l)
} ;
if ($target.type === "nil") {
return tcon("()")(l)
} ;
throw new Error('match fail 16756:' + JSON.stringify($target))
})(items))
} ;
return fatal(`(parse-type) Invalid type ${valueToString(type)}`);
throw new Error('match fail 867:' + JSON.stringify($target))
})(type)
let parse_pat = (pat) => (($target) => {
if ($target.type === "cst/id") {
if ($target[0] === "_") {
let l = $target[1];
return pany(l)
} 
} ;
if ($target.type === "cst/id") {
if ($target[0] === "true") {
let l = $target[1];
return pprim(pbool(true)(l))(l)
} 
} ;
if ($target.type === "cst/id") {
if ($target[0] === "false") {
let l = $target[1];
return pprim(pbool(false)(l))(l)
} 
} ;
if ($target.type === "cst/string") {
let first = $target[0];
if ($target[1].type === "nil") {
let l = $target[2];
return pstr(first)(l)
} 
} ;
if ($target.type === "cst/id") {
let id = $target[0];
let l = $target[1];
{
let $target = string_to_int(id);
if ($target.type === "some") {
let int = $target[0];
return pprim(pint(int)(l))(l)
} ;
return pvar(id)(l);
throw new Error('match fail 3019:' + JSON.stringify($target))
}
} ;
if ($target.type === "cst/array") {
if ($target[0].type === "nil") {
let l = $target[1];
return pcon("nil")(l)(nil)(l)
} 
} ;
if ($target.type === "cst/array") {
if ($target[0].type === "cons") {
if ($target[0][0].type === "cst/spread") {
let inner = $target[0][0][0];
if ($target[0][1].type === "nil") {
return parse_pat(inner)
} 
} 
} 
} ;
if ($target.type === "cst/array") {
if ($target[0].type === "cons") {
let one = $target[0][0];
let rest = $target[0][1];
let l = $target[1];
return pcon("cons")(l)(cons(parse_pat(one))(cons(parse_pat(cst$slarray(rest)(l)))(nil)))(l)
} 
} ;
if ($target.type === "cst/list") {
if ($target[0].type === "nil") {
let l = $target[1];
return pcon("()")(l)(nil)(l)
} 
} ;
if ($target.type === "cst/list") {
if ($target[0].type === "cons") {
if ($target[0][0].type === "cst/id") {
if ($target[0][0][0] === ",") {
let il = $target[0][0][1];
let args = $target[0][1];
let l = $target[1];
return loop(args)((items) => (recur) => (($target) => {
if ($target.type === "cons") {
let one = $target[0];
if ($target[1].type === "nil") {
return parse_pat(one)
} 
} ;
if ($target.type === "nil") {
return pcon(",")(l)(nil)(il)
} ;
if ($target.type === "cons") {
let one = $target[0];
let rest = $target[1];
return pcon(",")(l)(cons(parse_pat(one))(cons(recur(rest))(nil)))(l)
} ;
throw new Error('match fail 17727:' + JSON.stringify($target))
})(items))
} 
} 
} 
} ;
if ($target.type === "cst/list") {
if ($target[0].type === "cons") {
if ($target[0][0].type === "cst/id") {
let name = $target[0][0][0];
let il = $target[0][0][1];
let rest = $target[0][1];
let l = $target[1];
return pcon(name)(il)(map(rest)(parse_pat))(l)
} 
} 
} ;
return fatal(`Invalid pattern: ${valueToString(pat)}`);
throw new Error('match fail 1727:' + JSON.stringify($target))
})(pat)
let parse_and_compile = (v0) => (v1) => (v2) => (v3) => (v4) => ({type: "parse-and-compile", 0: v0, 1: v1, 2: v2, 3: v3, 4: v4})
let pat_externals = (pat) => (($target) => {
if ($target.type === "pcon") {
let name = $target[0];
let nl = $target[1];
let args = $target[2];
let l = $target[3];
return bag$sland(one($co(name)($co(value)(nl))))(many(map(args)(pat_externals)))
} ;
return empty;
throw new Error('match fail 6812:' + JSON.stringify($target))
})(pat)
let externals = (bound) => (expr) => (($target) => {
if ($target.type === "evar") {
let name = $target[0];
let l = $target[1];
{
let $target = set$slhas(bound)(name);
if ($target === true) {
return empty
} ;
return one($co(name)($co(value)(l)));
throw new Error('match fail 6852:' + JSON.stringify($target))
}
} ;
if ($target.type === "eprim") {
return empty
} ;
if ($target.type === "estr") {
let templates = $target[1];
return many(map(templates)((arg) => (($target) => {
if ($target.type === ",") {
let expr = $target[0];
if ($target[1].type === ",") {
return externals(bound)(expr)
} 
} ;
throw new Error('match fail 7411:' + JSON.stringify($target))
})(arg)))
} ;
if ($target.type === "equot") {
return empty
} ;
if ($target.type === "elambda") {
let pats = $target[0];
let body = $target[1];
return bag$sland(foldl(empty)(map(pats)(pat_externals))(bag$sland))(externals(foldl(bound)(map(pats)(pat_bound))(set$slmerge))(body))
} ;
if ($target.type === "elet") {
let bindings = $target[0];
let body = $target[1];
return bag$sland(foldl(empty)(map(bindings)((arg) => {
let {"1": init, "0": pat} = arg;
return bag$sland(pat_externals(pat))(externals(bound)(init))
}))(bag$sland))(externals(foldl(bound)(map(bindings)((arg) => {
let {"0": pat} = arg;
return pat_bound(pat)
}))(set$slmerge))(body))
} ;
if ($target.type === "eapp") {
let target = $target[0];
let args = $target[1];
return bag$sland(externals(bound)(target))(foldl(empty)(map(args)(externals(bound)))(bag$sland))
} ;
if ($target.type === "ematch") {
let expr = $target[0];
let cases = $target[1];
return bag$sland(externals(bound)(expr))(foldl(empty)(cases)((bag) => (arg) => (($target) => {
if ($target.type === ",") {
let pat = $target[0];
let body = $target[1];
return bag$sland(bag$sland(bag)(pat_externals(pat)))(externals(set$slmerge(bound)(pat_bound(pat)))(body))
} ;
throw new Error('match fail 7421:' + JSON.stringify($target))
})(arg)))
} ;
throw new Error('match fail 6845:' + JSON.stringify($target))
})(expr)
let externals_type = (bound) => (t) => (($target) => {
if ($target.type === "tvar") {
return empty
} ;
if ($target.type === "tcon") {
let name = $target[0];
let l = $target[1];
{
let $target = set$slhas(bound)(name);
if ($target === true) {
return empty
} ;
return one($co(name)($co(type)(l)));
throw new Error('match fail 7121:' + JSON.stringify($target))
}
} ;
if ($target.type === "tapp") {
let one = $target[0];
let two = $target[1];
return bag$sland(externals_type(bound)(one))(externals_type(bound)(two))
} ;
throw new Error('match fail 7109:' + JSON.stringify($target))
})(t)
let names = (stmt) => (($target) => {
if ($target.type === "tdef") {
let name = $target[0];
let l = $target[1];
return cons($co(name)($co(value)(l)))(nil)
} ;
if ($target.type === "texpr") {
return nil
} ;
if ($target.type === "ttypealias") {
let name = $target[0];
let l = $target[1];
return cons($co(name)($co(type)(l)))(nil)
} ;
if ($target.type === "tdeftype") {
let name = $target[0];
let l = $target[1];
let constructors = $target[3];
return cons($co(name)($co(type)(l)))(map(constructors)((arg) => (($target) => {
if ($target.type === ",") {
let name = $target[0];
if ($target[1].type === ",") {
let l = $target[1][0];
if ($target[1][1].type === ",") {
return $co(name)($co(value)(l))
} 
} 
} ;
throw new Error('match fail 7429:' + JSON.stringify($target))
})(arg)))
} ;
throw new Error('match fail 7156:' + JSON.stringify($target))
})(stmt)
let externals_top = (stmt) => bag$slto_list((($target) => {
if ($target.type === "tdeftype") {
let name = $target[0];
let free = $target[2];
let constructors = $target[3];
{
let bound = set$slfrom_list(cons(name)(map(free)(fst)));
return many(map(constructors)((constructor) => (($target) => {
if ($target.type === ",") {
if ($target[1].type === ",") {
if ($target[1][1].type === ",") {
let args = $target[1][1][0];
{
let $target = args;
if ($target.type === "nil") {
return empty
} ;
return many(map(args)(externals_type(bound)));
throw new Error('match fail 7265:' + JSON.stringify($target))
}
} 
} 
} ;
throw new Error('match fail 7440:' + JSON.stringify($target))
})(constructor)))
}
} ;
if ($target.type === "ttypealias") {
let name = $target[0];
let args = $target[2];
let body = $target[3];
{
let bound = set$slfrom_list(cons(name)(map(args)(fst)));
return externals_type(bound)(body)
}
} ;
if ($target.type === "tdef") {
let name = $target[0];
let body = $target[2];
return externals(set$sladd(set$slnil)(name))(body)
} ;
if ($target.type === "texpr") {
let expr = $target[0];
return externals(set$slnil)(expr)
} ;
throw new Error('match fail 7231:' + JSON.stringify($target))
})(stmt))
let parse_type_constructor = (constr) => (($target) => {
if ($target.type === "cst/list") {
if ($target[0].type === "cons") {
if ($target[0][0].type === "cst/id") {
let name = $target[0][0][0];
let ni = $target[0][0][1];
let args = $target[0][1];
let l = $target[1];
return some($co(name)($co(ni)($co(map(args)(parse_type))(l))))
} 
} 
} ;
if ($target.type === "cst/list") {
if ($target[0].type === "nil") {
let l = $target[1];
return none
} 
} ;
return fatal("Invalid type constructor");
throw new Error('match fail 17464:' + JSON.stringify($target))
})(constr)
let parse_top = (cst) => (($target) => {
if ($target.type === "cst/list") {
if ($target[0].type === "cons") {
if ($target[0][0].type === "cst/id") {
if ($target[0][0][0] === "def") {
if ($target[0][1].type === "cons") {
if ($target[0][1][0].type === "cst/id") {
let id = $target[0][1][0][0];
let li = $target[0][1][0][1];
if ($target[0][1][1].type === "cons") {
let value = $target[0][1][1][0];
if ($target[0][1][1][1].type === "nil") {
let l = $target[1];
return tdef(id)(li)(parse_expr(value))(l)
} 
} 
} 
} 
} 
} 
} 
} ;
if ($target.type === "cst/list") {
if ($target[0].type === "cons") {
if ($target[0][0].type === "cst/id") {
if ($target[0][0][0] === "defn") {
let a = $target[0][0][1];
if ($target[0][1].type === "cons") {
if ($target[0][1][0].type === "cst/id") {
let id = $target[0][1][0][0];
let li = $target[0][1][0][1];
if ($target[0][1][1].type === "cons") {
if ($target[0][1][1][0].type === "cst/array") {
let args = $target[0][1][1][0][0];
let b = $target[0][1][1][0][1];
if ($target[0][1][1][1].type === "cons") {
let body = $target[0][1][1][1][0];
if ($target[0][1][1][1][1].type === "nil") {
let c = $target[1];
{
let body$0 = body;
{
let body = parse_expr(cst$sllist(cons(cst$slid("fn")(a))(cons(cst$slarray(args)(b))(cons(body$0)(nil))))(c));
return tdef(id)(li)(body)(c)
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
} ;
if ($target.type === "cst/list") {
if ($target[0].type === "cons") {
if ($target[0][0].type === "cst/id") {
if ($target[0][0][0] === "defn") {
let l = $target[1];
return fatal(`Invalid 'defn' ${int_to_string(l)}`)
} 
} 
} 
} ;
if ($target.type === "cst/list") {
if ($target[0].type === "cons") {
if ($target[0][0].type === "cst/id") {
if ($target[0][0][0] === "deftype") {
if ($target[0][1].type === "cons") {
let head = $target[0][1][0];
let items = $target[0][1][1];
let l = $target[1];
{
let {"1": {"1": args, "0": li}, "0": id} = id_with_maybe_args(head);
{
let constrs = filter_some(map(items)(parse_type_constructor));
return tdeftype(id)(li)(args)(constrs)(l)
}
}
} 
} 
} 
} 
} ;
if ($target.type === "cst/list") {
if ($target[0].type === "cons") {
if ($target[0][0].type === "cst/id") {
if ($target[0][0][0] === "deftype") {
let l = $target[1];
return fatal(`Invalid 'deftype' ${int_to_string(l)}`)
} 
} 
} 
} ;
if ($target.type === "cst/list") {
if ($target[0].type === "cons") {
if ($target[0][0].type === "cst/id") {
if ($target[0][0][0] === "typealias") {
if ($target[0][1].type === "cons") {
let head = $target[0][1][0];
if ($target[0][1][1].type === "cons") {
let body = $target[0][1][1][0];
if ($target[0][1][1][1].type === "nil") {
let l = $target[1];
{
let {"1": {"1": args, "0": li}, "0": id} = id_with_maybe_args(head);
return ttypealias(id)(li)(args)(parse_type(body))(l)
}
} 
} 
} 
} 
} 
} 
} ;
return texpr(parse_expr(cst))(cst_loc(cst));
throw new Error('match fail 606:' + JSON.stringify($target))
})(cst)

let parse_expr = (cst) => (($target) => {
if ($target.type === "cst/id") {
if ($target[0] === "true") {
let l = $target[1];
return eprim(pbool(true)(l))(l)
} 
} ;
if ($target.type === "cst/id") {
if ($target[0] === "false") {
let l = $target[1];
return eprim(pbool(false)(l))(l)
} 
} ;
if ($target.type === "cst/string") {
let first = $target[0];
let templates = $target[1];
let l = $target[2];
return estr(first)(parse_template(templates))(l)
} ;
if ($target.type === "cst/id") {
let id = $target[0];
let l = $target[1];
{
let $target = string_to_int(id);
if ($target.type === "some") {
let int = $target[0];
return eprim(pint(int)(l))(l)
} ;
if ($target.type === "none") {
return evar(id)(l)
} ;
throw new Error('match fail 970:' + JSON.stringify($target))
}
} ;
if ($target.type === "cst/list") {
if ($target[0].type === "cons") {
if ($target[0][0].type === "cst/id") {
if ($target[0][0][0] === "@") {
if ($target[0][1].type === "cons") {
let body = $target[0][1][0];
if ($target[0][1][1].type === "nil") {
let l = $target[1];
return equot(quot$slexpr(parse_expr(body)))(l)
} 
} 
} 
} 
} 
} ;
if ($target.type === "cst/list") {
if ($target[0].type === "cons") {
if ($target[0][0].type === "cst/id") {
if ($target[0][0][0] === "@@") {
if ($target[0][1].type === "cons") {
let body = $target[0][1][0];
if ($target[0][1][1].type === "nil") {
let l = $target[1];
return equot(quot$slquot(body))(l)
} 
} 
} 
} 
} 
} ;
if ($target.type === "cst/list") {
if ($target[0].type === "cons") {
if ($target[0][0].type === "cst/id") {
if ($target[0][0][0] === "@!") {
if ($target[0][1].type === "cons") {
let body = $target[0][1][0];
if ($target[0][1][1].type === "nil") {
let l = $target[1];
return equot(quot$sltop(parse_top(body)))(l)
} 
} 
} 
} 
} 
} ;
if ($target.type === "cst/list") {
if ($target[0].type === "cons") {
if ($target[0][0].type === "cst/id") {
if ($target[0][0][0] === "@t") {
if ($target[0][1].type === "cons") {
let body = $target[0][1][0];
if ($target[0][1][1].type === "nil") {
let l = $target[1];
return equot(quot$sltype(parse_type(body)))(l)
} 
} 
} 
} 
} 
} ;
if ($target.type === "cst/list") {
if ($target[0].type === "cons") {
if ($target[0][0].type === "cst/id") {
if ($target[0][0][0] === "@p") {
if ($target[0][1].type === "cons") {
let body = $target[0][1][0];
if ($target[0][1][1].type === "nil") {
let l = $target[1];
return equot(quot$slpat(parse_pat(body)))(l)
} 
} 
} 
} 
} 
} ;
if ($target.type === "cst/list") {
if ($target[0].type === "cons") {
if ($target[0][0].type === "cst/id") {
if ($target[0][0][0] === "if") {
if ($target[0][1].type === "cons") {
let cond = $target[0][1][0];
if ($target[0][1][1].type === "cons") {
let yes = $target[0][1][1][0];
if ($target[0][1][1][1].type === "cons") {
let no = $target[0][1][1][1][0];
if ($target[0][1][1][1][1].type === "nil") {
let l = $target[1];
return ematch(parse_expr(cond))(cons($co(pprim(pbool(true)(l))(l))(parse_expr(yes)))(cons($co(pany(l))(parse_expr(no)))(nil)))(l)
} 
} 
} 
} 
} 
} 
} 
} ;
if ($target.type === "cst/list") {
if ($target[0].type === "cons") {
if ($target[0][0].type === "cst/id") {
if ($target[0][0][0] === "fn") {
if ($target[0][1].type === "cons") {
if ($target[0][1][0].type === "cst/array") {
let args = $target[0][1][0][0];
if ($target[0][1][1].type === "cons") {
let body = $target[0][1][1][0];
if ($target[0][1][1][1].type === "nil") {
let b = $target[1];
return elambda(map(args)(parse_pat))(parse_expr(body))(b)
} 
} 
} 
} 
} 
} 
} 
} ;
if ($target.type === "cst/list") {
if ($target[0].type === "cons") {
if ($target[0][0].type === "cst/id") {
if ($target[0][0][0] === "fn") {
let l = $target[1];
return fatal(`Invalid 'fn' ${int_to_string(l)}`)
} 
} 
} 
} ;
if ($target.type === "cst/list") {
if ($target[0].type === "cons") {
if ($target[0][0].type === "cst/id") {
if ($target[0][0][0] === "match") {
if ($target[0][1].type === "cons") {
let target = $target[0][1][0];
let cases = $target[0][1][1];
let l = $target[1];
return ematch(parse_expr(target))(map(pairs(cases))(($case) => {
let {"1": expr, "0": pat} = $case;
return $co(parse_pat(pat))(parse_expr(expr))
}))(l)
} 
} 
} 
} 
} ;
if ($target.type === "cst/list") {
if ($target[0].type === "cons") {
if ($target[0][0].type === "cst/id") {
if ($target[0][0][0] === "let") {
if ($target[0][1].type === "cons") {
if ($target[0][1][0].type === "cst/array") {
let inits = $target[0][1][0][0];
if ($target[0][1][1].type === "cons") {
let body = $target[0][1][1][0];
if ($target[0][1][1][1].type === "nil") {
let l = $target[1];
return elet(map(pairs(inits))((pair) => {
let {"1": value, "0": pat} = pair;
return $co(parse_pat(pat))(parse_expr(value))
}))(parse_expr(body))(l)
} 
} 
} 
} 
} 
} 
} 
} ;
if ($target.type === "cst/list") {
if ($target[0].type === "cons") {
if ($target[0][0].type === "cst/id") {
if ($target[0][0][0] === "let->") {
let el = $target[0][0][1];
if ($target[0][1].type === "cons") {
if ($target[0][1][0].type === "cst/array") {
let inits = $target[0][1][0][0];
if ($target[0][1][1].type === "cons") {
let body = $target[0][1][1][0];
if ($target[0][1][1][1].type === "nil") {
let l = $target[1];
return foldr(parse_expr(body))(pairs(inits))((body) => (init) => {
let {"1": value, "0": pat} = init;
return eapp(evar(">>=")(el))(cons(parse_expr(value))(cons(elambda(cons(parse_pat(pat))(nil))(body)(l))(nil)))(l)
})
} 
} 
} 
} 
} 
} 
} 
} ;
if ($target.type === "cst/list") {
if ($target[0].type === "cons") {
if ($target[0][0].type === "cst/id") {
if ($target[0][0][0] === "let") {
let l = $target[1];
return fatal(`Invalid 'let' ${int_to_string(l)}`)
} 
} 
} 
} ;
if ($target.type === "cst/list") {
if ($target[0].type === "cons") {
if ($target[0][0].type === "cst/id") {
if ($target[0][0][0] === ",") {
let il = $target[0][0][1];
let args = $target[0][1];
let l = $target[1];
return loop(args)((args) => (recur) => (($target) => {
if ($target.type === "nil") {
return evar(",")(il)
} ;
if ($target.type === "cons") {
let one = $target[0];
if ($target[1].type === "nil") {
return parse_expr(one)
} 
} ;
if ($target.type === "cons") {
let one = $target[0];
let rest = $target[1];
return eapp(evar(",")(il))(cons(parse_expr(one))(cons(recur(rest))(nil)))(l)
} ;
throw new Error('match fail 17793:' + JSON.stringify($target))
})(args))
} 
} 
} 
} ;
if ($target.type === "cst/list") {
if ($target[0].type === "nil") {
let l = $target[1];
return evar("()")(l)
} 
} ;
if ($target.type === "cst/list") {
if ($target[0].type === "cons") {
let target = $target[0][0];
let args = $target[0][1];
let l = $target[1];
return eapp(parse_expr(target))(map(args)(parse_expr))(l)
} 
} ;
if ($target.type === "cst/array") {
let args = $target[0];
let l = $target[1];
return loop(args)((args) => (recur) => (($target) => {
if ($target.type === "nil") {
return evar("nil")(l)
} ;
if ($target.type === "cons") {
if ($target[0].type === "cst/spread") {
let inner = $target[0][0];
if ($target[1].type === "nil") {
return parse_expr(inner)
} 
} 
} ;
if ($target.type === "cons") {
let one = $target[0];
let rest = $target[1];
return eapp(evar("cons")(l))(cons(parse_expr(one))(cons(recur(rest))(nil)))(l)
} ;
throw new Error('match fail 17838:' + JSON.stringify($target))
})(args))
} ;
return fatal("Invalid expression");
throw new Error('match fail 963:' + JSON.stringify($target))
})(cst)

let parse_template = (templates) => map(templates)(({"1": {"1": l, "0": string}, "0": expr}) => $co(parse_expr(expr))($co(string)(l)))
return eval("({0: parse_stmt,  1: parse_expr, 2: names, 3: externals_stmt, 4: externals_expr}) =>\n  ({type: 'fns', parse_stmt, parse_expr, names, externals_stmt, externals_expr})")(parse_and_compile(parse_top)(parse_expr)(names)(externals_top)((expr) => bag$slto_list(externals(set$slnil)(expr))))