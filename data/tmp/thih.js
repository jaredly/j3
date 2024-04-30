let pint = (v0) => (v1) => ({type: "pint", 0: v0, 1: v1})
let pfloat = (v0) => (v1) => ({type: "pfloat", 0: v0, 1: v1})
let pbool = (v0) => (v1) => ({type: "pbool", 0: v0, 1: v1})
let enumId = (num) => `v${int_to_string(num)}`
let $bar_$gt = (u) => (t) => map$slset(map$slnil)(u)(t)
let compose_transformers = (one) => (two) => (ce) => two(one(ce))
let not = (v) => (($target) => {
if ($target === true) {
return false
} ;
return true;
throw new Error('match fail 7370:' + JSON.stringify($target))
})(v)
let some = (v0) => ({type: "some", 0: v0})
let none = {type: "none"}
let ok = (v0) => ({type: "ok", 0: v0})
let err = (v0) => ({type: "err", 0: v0})
let ok$gt$gt$eq = (res) => (next) => (($target) => {
if ($target.type === "ok") {
let v = $target[0];
return next(v)
} ;
if ($target.type === "err") {
let e = $target[0];
return err(e)
} ;
throw new Error('match fail 10187:' + JSON.stringify($target))
})(res)
let snd = (tuple) => {
let {"1": v} = tuple;
return v
}
let fst = (tuple) => {
let {"0": v} = tuple;
return v
}
let id = (x) => x

let result_$gts = (v_$gts) => (v) => (($target) => {
if ($target.type === "ok") {
let v = $target[0];
return v_$gts(v)
} ;
if ($target.type === "err") {
let e = $target[0];
return e
} ;
throw new Error('match fail 16114:' + JSON.stringify($target))
})(v)
let dot = (a) => (b) => (c) => a(b(c))
let unwrap_tuple = (f) => ({"1": b, "0": a}) => f(a)(b)
let wrap_tuple = (f) => (a) => (b) => f($co(a)(b))
let value = {type: "value"}
let type = {type: "type"}
let tcls = {type: "tcls"}

let map_err = (f) => (v) => (($target) => {
if ($target.type === "ok") {
return v
} ;
if ($target.type === "err") {
let e = $target[0];
return f(e)
} ;
throw new Error('match fail 21187:' + JSON.stringify($target))
})(v)
let its = int_to_string
let trace_and_block = (loc) => (trace) => (value) => (js) => (($target) => {
if ($target.type === "none") {
return js
} ;
if ($target.type === "some") {
let info = $target[0];
return `\$trace(${its(loc)}, ${jsonify(info)}, ${value});\n${js}`
} ;
throw new Error('match fail 24648:' + JSON.stringify($target))
})(map$slget(trace)(loc))
let trace_wrap = (loc) => (trace) => (js) => (($target) => {
if ($target.type === "none") {
return js
} ;
if ($target.type === "some") {
let info = $target[0];
return `\$trace(${its(loc)}, ${jsonify(info)}, ${js})`
} ;
throw new Error('match fail 24682:' + JSON.stringify($target))
})(map$slget(trace)(loc))
let trace_and = (loc) => (trace) => (value) => (js) => (($target) => {
if ($target.type === "none") {
return js
} ;
if ($target.type === "some") {
let info = $target[0];
return `(\$trace(${its(loc)}, ${jsonify(info)}, ${value}), ${js})`
} ;
throw new Error('match fail 24715:' + JSON.stringify($target))
})(map$slget(trace)(loc))
let source_map = (loc) => (js) => `/*${its(loc)}*/${js}/*<${its(loc)}*/`
let orr = ($default) => (v) => (($target) => {
if ($target.type === "some") {
let v = $target[0];
return v
} ;
return $default;
throw new Error('match fail 24968:' + JSON.stringify($target))
})(v)
let force = (e_$gts) => (v) => (($target) => {
if ($target.type === "ok") {
let v = $target[0];
return v
} ;
if ($target.type === "err") {
let e = $target[0];
return fatal(e_$gts(e))
} ;
throw new Error('match fail 27535:' + JSON.stringify($target))
})(v)
let StateT = (v0) => ({type: "StateT", 0: v0})
let run_$gt = ({"0": f}) => (state) => {
let state$0 = state;
{
let {"1": result, "0": state} = f(state$0);
return $co(state)(result)
}
}
let state_f = ({"0": f}) => f
let $gt$gt$eq = ({"0": f}) => (next) => StateT((state) => (($target) => {
if ($target.type === ",") {
let state = $target[0];
if ($target[1].type === "err") {
let e = $target[1][0];
return $co(state)(err(e))
} 
} ;
if ($target.type === ",") {
let state = $target[0];
if ($target[1].type === "ok") {
let value = $target[1][0];
return state_f(next(value))(state)
} 
} ;
throw new Error('match fail 27945:' + JSON.stringify($target))
})(f(state)))
let $lt_ = (x) => StateT((state) => $co(state)(ok(x)))
let $lt_err = (e) => StateT((state) => $co(state)(err(e)))
let $lt_state = StateT((state) => $co(state)(ok(state)))
let state_$gt = (v) => StateT((old) => $co(v)(ok(old)))
let ok_$gt = (result) => (($target) => {
if ($target.type === "ok") {
let v = $target[0];
return $lt_(v)
} ;
if ($target.type === "err") {
let e = $target[0];
return $lt_err(e)
} ;
throw new Error('match fail 28112:' + JSON.stringify($target))
})(result)
let ti_return = $lt_
let $lt_tenv = $gt$gt$eq($lt_state)(({"2": tenv}) => $lt_(tenv))
let tenv_$gt = (tenv) => $gt$gt$eq($lt_state)(({"3": d, "1": b, "0": a}) => $gt$gt$eq(state_$gt($co$co$co(a)(b)(tenv)(d)))((_28742) => $lt_($unit)))
let prefix = (pre) => (text) => `${pre}${text}`
let nil = {type: "nil"}
let cons = (v0) => (v1) => ({type: "cons", 0: v0, 1: v1})
let pany = (v0) => ({type: "pany", 0: v0})
let pvar = (v0) => (v1) => ({type: "pvar", 0: v0, 1: v1})
let pcon = (v0) => (v1) => (v2) => ({type: "pcon", 0: v0, 1: v1, 2: v2})
let pstr = (v0) => (v1) => ({type: "pstr", 0: v0, 1: v1})
let pprim = (v0) => (v1) => ({type: "pprim", 0: v0, 1: v1})
let star = {type: "star"}
let kfun = (v0) => (v1) => ({type: "kfun", 0: v0, 1: v1})
let one = (v0) => ({type: "one", 0: v0})
let many = (v0) => ({type: "many", 0: v0})
let empty = {type: "empty"}
let ggroup = (v0) => (v1) => ({type: "ggroup", 0: v0, 1: v1})
let gtext = (v0) => ({type: "gtext", 0: v0})
let tyvar = (v0) => (v1) => ({type: "tyvar", 0: v0, 1: v1})
let tycon = (v0) => (v1) => ({type: "tycon", 0: v0, 1: v1})
let tyvar$slkind = ({"1": k, "0": v}) => k
let tycon$slkind = ({"1": k, "0": v}) => k
let nullSubst = nil
let all = (f) => (items) => (($target) => {
if ($target.type === "nil") {
return true
} ;
if ($target.type === "cons") {
let one = $target[0];
let rest = $target[1];
{
let $target = f(one);
if ($target === true) {
return all(f)(rest)
} ;
return false;
throw new Error('match fail 678:' + JSON.stringify($target))
}
} ;
throw new Error('match fail 667:' + JSON.stringify($target))
})(items)
let filter = (f) => (arr) => (($target) => {
if ($target.type === "nil") {
return nil
} ;
if ($target.type === "cons") {
let one = $target[0];
let rest = $target[1];
{
let $target = f(one);
if ($target === true) {
return cons(one)(filter(f)(rest))
} ;
return filter(f)(rest);
throw new Error('match fail 732:' + JSON.stringify($target))
}
} ;
throw new Error('match fail 721:' + JSON.stringify($target))
})(arr)
let kind$eq = (a) => (b) => (($target) => {
if ($target.type === ",") {
if ($target[0].type === "star") {
if ($target[1].type === "star") {
return true
} 
} 
} ;
if ($target.type === ",") {
if ($target[0].type === "kfun") {
let a = $target[0][0];
let b = $target[0][1];
if ($target[1].type === "kfun") {
let a$qu = $target[1][0];
let b$qu = $target[1][1];
{
let $target = kind$eq(a)(a$qu);
if ($target === true) {
return kind$eq(b)(b$qu)
} ;
return false;
throw new Error('match fail 1032:' + JSON.stringify($target))
}
} 
} 
} ;
return false;
throw new Error('match fail 1007:' + JSON.stringify($target))
})($co(a)(b))
let tycon$eq = ({"1": kind, "0": name}) => ({"1": kind$qu, "0": name$qu}) => (($target) => {
if ($target === true) {
return kind$eq(kind)(kind$qu)
} ;
return false;
throw new Error('match fail 1053:' + JSON.stringify($target))
})($eq(name)(name$qu))
let kind_$gts = (a) => (($target) => {
if ($target.type === "star") {
return "*"
} ;
if ($target.type === "kfun") {
let a = $target[0];
let b = $target[1];
return `(${kind_$gts(a)}->${kind_$gts(b)})`
} ;
throw new Error('match fail 1076:' + JSON.stringify($target))
})(a)
let tycon_$gts = ({"1": kind, "0": name}) => (($target) => {
if ($target.type === "star") {
return name
} ;
return `[${name} : ${kind_$gts(kind)}]`;
throw new Error('match fail 16297:' + JSON.stringify($target))
})(kind)
let array$eq = (a$qu) => (b$qu) => (eq) => (($target) => {
if ($target.type === ",") {
if ($target[0].type === "cons") {
let one = $target[0][0];
let rest = $target[0][1];
if ($target[1].type === "cons") {
let two = $target[1][0];
let rest$qu = $target[1][1];
{
let $target = eq(one)(two);
if ($target === true) {
return array$eq(rest)(rest$qu)(eq)
} ;
return false;
throw new Error('match fail 6428:' + JSON.stringify($target))
}
} 
} 
} ;
return false;
throw new Error('match fail 6402:' + JSON.stringify($target))
})($co(a$qu)(b$qu))
let tyvar$eq = ({"1": kind, "0": name}) => ({"1": kind$qu, "0": name$qu}) => (($target) => {
if ($target === true) {
return kind$eq(kind)(kind$qu)
} ;
return false;
throw new Error('match fail 6522:' + JSON.stringify($target))
})($eq(name)(name$qu))
let map = (f) => (items) => (($target) => {
if ($target.type === "nil") {
return nil
} ;
if ($target.type === "cons") {
let one = $target[0];
let rest = $target[1];
return cons(f(one))(map(f)(rest))
} ;
throw new Error('match fail 6644:' + JSON.stringify($target))
})(items)
let foldl = (init) => (items) => (f) => (($target) => {
if ($target.type === "nil") {
return init
} ;
if ($target.type === "cons") {
let one = $target[0];
let rest = $target[1];
return foldl(f(init)(one))(rest)(f)
} ;
throw new Error('match fail 6750:' + JSON.stringify($target))
})(items)
let defined = (opt) => (($target) => {
if ($target.type === "some") {
return true
} ;
return false;
throw new Error('match fail 7019:' + JSON.stringify($target))
})(opt)
let find = (arr) => (f) => (($target) => {
if ($target.type === "nil") {
return none
} ;
if ($target.type === "cons") {
let one = $target[0];
let rest = $target[1];
{
let $target = f(one);
if ($target === true) {
return some(one)
} ;
return find(rest)(f);
throw new Error('match fail 7199:' + JSON.stringify($target))
}
} ;
throw new Error('match fail 7187:' + JSON.stringify($target))
})(arr)
let map$slhas = (map) => (key) => (($target) => {
if ($target.type === "some") {
return true
} ;
return false;
throw new Error('match fail 7385:' + JSON.stringify($target))
})(map$slget(map)(key))
let any = (f) => (arr) => (($target) => {
if ($target.type === "nil") {
return false
} ;
if ($target.type === "cons") {
let one = $target[0];
let rest = $target[1];
{
let $target = f(one);
if ($target === true) {
return true
} ;
return any(f)(rest);
throw new Error('match fail 7605:' + JSON.stringify($target))
}
} ;
throw new Error('match fail 7594:' + JSON.stringify($target))
})(arr)
let apply_transformers = (transformers) => (env) => foldl(env)(transformers)((env) => (f) => f(env))
let concat = (arrays) => (($target) => {
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
let arrays = $target[1];
return cons(one)(concat(cons(rest)(arrays)))
} 
} ;
throw new Error('match fail 7844:' + JSON.stringify($target))
})(arrays)
let find_some = (f) => (arr) => (($target) => {
if ($target.type === "nil") {
return none
} ;
if ($target.type === "cons") {
let one = $target[0];
let rest = $target[1];
{
let $target = f(one);
if ($target.type === "some") {
let v = $target[0];
return some(v)
} ;
return find_some(f)(rest);
throw new Error('match fail 7964:' + JSON.stringify($target))
}
} ;
throw new Error('match fail 7949:' + JSON.stringify($target))
})(arr)
let map$slok = (f) => (arr) => (($target) => {
if ($target.type === "nil") {
return ok(nil)
} ;
if ($target.type === "cons") {
let one = $target[0];
let rest = $target[1];
{
let $target = f(one);
if ($target.type === "ok") {
let val = $target[0];
{
let $target = map$slok(f)(rest);
if ($target.type === "ok") {
let rest = $target[0];
return ok(cons(val)(rest))
} ;
if ($target.type === "err") {
let e = $target[0];
return err(e)
} ;
throw new Error('match fail 8329:' + JSON.stringify($target))
}
} ;
if ($target.type === "err") {
let e = $target[0];
return err(e)
} ;
throw new Error('match fail 8321:' + JSON.stringify($target))
}
} ;
throw new Error('match fail 8308:' + JSON.stringify($target))
})(arr)
let mapi = (f) => (i) => (items) => (($target) => {
if ($target.type === "nil") {
return nil
} ;
if ($target.type === "cons") {
let one = $target[0];
let rest = $target[1];
return cons(f(one)(i))(mapi(f)(i + 1)(rest))
} ;
throw new Error('match fail 8706:' + JSON.stringify($target))
})(items)
let list$slget = (arr) => (i) => (($target) => {
if ($target.type === ",") {
if ($target[0].type === "cons") {
let one = $target[0][0];
if ($target[1] === 0) {
return one
} 
} 
} ;
if ($target.type === ",") {
if ($target[0].type === "cons") {
let rest = $target[0][1];
let i = $target[1];
{
let $target = i <= 0;
if ($target === true) {
return fatal("Index out of range")
} ;
return list$slget(rest)(i - 1);
throw new Error('match fail 9453:' + JSON.stringify($target))
}
} 
} ;
throw new Error('match fail 9428:' + JSON.stringify($target))
})($co(arr)(i))
let foldr = (init) => (items) => (f) => (($target) => {
if ($target.type === "nil") {
return init
} ;
if ($target.type === "cons") {
let one = $target[0];
let rest = $target[1];
return f(foldr(init)(rest)(f))(one)
} ;
throw new Error('match fail 10139:' + JSON.stringify($target))
})(items)
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
return $pl$pl(cons(one)(cons(sep)(cons(join(sep)(rest))(nil))));
throw new Error('match fail 10498:' + JSON.stringify($target))
}
} ;
throw new Error('match fail 10488:' + JSON.stringify($target))
})(items)
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
throw new Error('match fail 10595:' + JSON.stringify($target))
})(arr)
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
throw new Error('match fail 10698:' + JSON.stringify($target))
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
throw new Error('match fail 10783:' + JSON.stringify($target))
}
} ;
throw new Error('match fail 10774:' + JSON.stringify($target))
})(repl)
let tstar = (name) => tycon(name)(star)
let partition = (arr) => (test) => (($target) => {
if ($target.type === "nil") {
return $co(nil)(nil)
} ;
if ($target.type === "cons") {
let one = $target[0];
let rest = $target[1];
{
let {"1": no, "0": yes} = partition(rest)(test);
{
let $target = test(one);
if ($target === true) {
return $co(cons(one)(yes))(no)
} ;
return $co(yes)(cons(one)(no));
throw new Error('match fail 13882:' + JSON.stringify($target))
}
}
} ;
throw new Error('match fail 13852:' + JSON.stringify($target))
})(arr)
let every = (arr) => (f) => (($target) => {
if ($target.type === "nil") {
return true
} ;
if ($target.type === "cons") {
let one = $target[0];
let rest = $target[1];
{
let $target = f(one);
if ($target === true) {
return every(rest)(f)
} ;
return false;
throw new Error('match fail 13926:' + JSON.stringify($target))
}
} ;
throw new Error('match fail 13915:' + JSON.stringify($target))
})(arr)
let contains = (arr) => (item) => (item$eq) => (($target) => {
if ($target.type === "nil") {
return false
} ;
if ($target.type === "cons") {
let one = $target[0];
let rest = $target[1];
{
let $target = item$eq(one)(item);
if ($target === true) {
return true
} ;
return contains(rest)(item)(item$eq);
throw new Error('match fail 13958:' + JSON.stringify($target))
}
} ;
throw new Error('match fail 13947:' + JSON.stringify($target))
})(arr)
let numClasses = cons("num")(cons("integral")(cons("floating")(cons("fractional")(cons("real")(cons("realfloat")(cons("realfrac")(nil)))))))
let $pl$pl$pl = (a) => (b) => concat(cons(a)(cons(b)(nil)))
let head = (arr) => (($target) => {
if ($target.type === "cons") {
let one = $target[0];
return one
} ;
return fatal("head of empty list");
throw new Error('match fail 14248:' + JSON.stringify($target))
})(arr)
let without = (base) => (remove) => (x$eq) => filter((x) => not(contains(remove)(x)(x$eq)))(base)
let zip = (one) => (two) => (($target) => {
if ($target.type === ",") {
if ($target[0].type === "cons") {
let a = $target[0][0];
let one = $target[0][1];
if ($target[1].type === "cons") {
let b = $target[1][0];
let two = $target[1][1];
return cons($co(a)(b))(zip(one)(two))
} 
} 
} ;
return nil;
throw new Error('match fail 14399:' + JSON.stringify($target))
})($co(one)(two))
let infer$slseq = (ti) => (ce) => (as) => (assumptions) => (($target) => {
if ($target.type === "nil") {
return $lt_($co(nil)(nil))
} ;
if ($target.type === "cons") {
let bs = $target[0];
let bss = $target[1];
return $gt$gt$eq(ti(ce)(as)(bs))(({"1": as$qu, "0": ps}) => $gt$gt$eq(infer$slseq(ti)(ce)($pl$pl$pl(as$qu)(as))(bss))(({"1": as$qu$qu, "0": qs}) => $lt_($co($pl$pl$pl(ps)(qs))($pl$pl$pl(as$qu$qu)(as$qu)))))
} ;
throw new Error('match fail 14697:' + JSON.stringify($target))
})(assumptions)
let restricted = (bindings) => {
let simple = ({"1": alternatives, "0": i}) => any(({"0": arguments}) => (($target) => {
if ($target.type === "nil") {
return true
} ;
return false;
throw new Error('match fail 14782:' + JSON.stringify($target))
})(arguments))(alternatives);
return any(simple)(bindings)
}
let zipWith = (f) => (left) => (right) => (($target) => {
if ($target.type === ",") {
if ($target[0].type === "nil") {
if ($target[1].type === "nil") {
return nil
} 
} 
} ;
if ($target.type === ",") {
if ($target[0].type === "cons") {
let one = $target[0][0];
let left = $target[0][1];
if ($target[1].type === "cons") {
let two = $target[1][0];
let right = $target[1][1];
return cons(f(one)(two))(zipWith(f)(left)(right))
} 
} 
} ;
throw new Error('match fail 15058:' + JSON.stringify($target))
})($co(left)(right))
let sequence = (tis) => (($target) => {
if ($target.type === "nil") {
return $lt_(nil)
} ;
if ($target.type === "cons") {
let one = $target[0];
if ($target[1].type === "nil") {
return $gt$gt$eq(one)((res) => $lt_(cons(res)(nil)))
} 
} ;
if ($target.type === "cons") {
let one = $target[0];
let rest = $target[1];
return $gt$gt$eq(one)((res) => $gt$gt$eq(sequence(rest))((rest) => $lt_(cons(res)(rest))))
} ;
throw new Error('match fail 15104:' + JSON.stringify($target))
})(tis)
let foldr1 = (f) => (lst) => (($target) => {
if ($target.type === "nil") {
return fatal("Empty list to foldr1")
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
return f(one)(two)
} 
} 
} ;
if ($target.type === "cons") {
let one = $target[0];
let rest = $target[1];
return f(one)(foldr1(f)(rest))
} ;
throw new Error('match fail 15252:' + JSON.stringify($target))
})(lst)
let intersect = (t$eq) => (one) => (two) => filter((v) => contains(two)(v)(t$eq))(one)
let tyvar_$gts = ({"1": kind, "0": name}) => (($target) => {
if ($target.type === "star") {
return name
} ;
return `[${name} : ${kind_$gts(kind)}]`;
throw new Error('match fail 16543:' + JSON.stringify($target))
})(kind)
let unzip = (list) => (($target) => {
if ($target.type === "nil") {
return $co(nil)(nil)
} ;
if ($target.type === "cons") {
if ($target[0].type === ",") {
let a = $target[0][0];
let b = $target[0][1];
let rest = $target[1];
{
let {"1": right, "0": left} = unzip(rest);
return $co(cons(a)(left))(cons(b)(right))
}
} 
} ;
throw new Error('match fail 19016:' + JSON.stringify($target))
})(list)
let joinor = (sep) => ($default) => (items) => (($target) => {
if ($target.type === "nil") {
return $default
} ;
return join(sep)(items);
throw new Error('match fail 19404:' + JSON.stringify($target))
})(items)
let is_empty = (x) => (($target) => {
if ($target.type === "nil") {
return true
} ;
return false;
throw new Error('match fail 14225:' + JSON.stringify($target))
})(x)
let letters = cons("a")(cons("b")(cons("c")(cons("d")(cons("e")(cons("f")(cons("g")(cons("h")(cons("i")(nil)))))))))
let at = (i) => (lst) => (($target) => {
if ($target.type === "nil") {
return fatal("index out of range")
} ;
if ($target.type === "cons") {
let one = $target[0];
let rest = $target[1];
{
let $target = i <= 0;
if ($target === true) {
return one
} ;
return at(i - 1)(rest);
throw new Error('match fail 20085:' + JSON.stringify($target))
}
} ;
throw new Error('match fail 20071:' + JSON.stringify($target))
})(lst)
let gen_name = (num) => `${at(num)(letters)}`
let bag$sland = (first) => (second) => (($target) => {
if ($target.type === ",") {
if ($target[0].type === "empty") {
let a = $target[1];
return a
} 
} ;
if ($target.type === ",") {
let a = $target[0];
if ($target[1].type === "empty") {
return a
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
throw new Error('match fail 22421:' + JSON.stringify($target))
})($co(first)(second))
let bag$slfold = (f) => (init) => (bag) => (($target) => {
if ($target.type === "empty") {
return init
} ;
if ($target.type === "one") {
let v = $target[0];
return f(init)(v)
} ;
if ($target.type === "many") {
let items = $target[0];
return foldr(init)(items)(bag$slfold(f))
} ;
throw new Error('match fail 22480:' + JSON.stringify($target))
})(bag)
let concat_two = (one) => (two) => (($target) => {
if ($target.type === "nil") {
return two
} ;
if ($target.type === "cons") {
let one = $target[0];
if ($target[1].type === "nil") {
return cons(one)(two)
} 
} ;
if ($target.type === "cons") {
let one = $target[0];
let rest = $target[1];
return cons(one)(concat_two(rest)(two))
} ;
throw new Error('match fail 22510:' + JSON.stringify($target))
})(one)
let bag$slto_list = (bag) => (($target) => {
if ($target.type === "empty") {
return nil
} ;
if ($target.type === "one") {
let a = $target[0];
return cons(a)(nil)
} ;
if ($target.type === "many") {
let bags = $target[0];
return foldr(nil)(bags)((res) => (bag) => (($target) => {
if ($target.type === "empty") {
return res
} ;
if ($target.type === "one") {
let a = $target[0];
return cons(a)(res)
} ;
return concat_two(bag$slto_list(bag))(res);
throw new Error('match fail 22561:' + JSON.stringify($target))
})(bag))
} ;
throw new Error('match fail 22538:' + JSON.stringify($target))
})(bag)
let pat_names = (pat) => (($target) => {
if ($target.type === "pany") {
return set$slnil
} ;
if ($target.type === "pvar") {
let name = $target[0];
let l = $target[1];
return set$sladd(set$slnil)(name)
} ;
if ($target.type === "pcon") {
let name = $target[0];
let args = $target[1];
let l = $target[2];
return foldl(set$slnil)(args)((bound) => (arg) => set$slmerge(bound)(pat_names(arg)))
} ;
if ($target.type === "pstr") {
let string = $target[0];
let int = $target[1];
return set$slnil
} ;
if ($target.type === "pprim") {
let prim = $target[0];
let int = $target[1];
return set$slnil
} ;
throw new Error('match fail 22615:' + JSON.stringify($target))
})(pat)
let pat_externals = (pat) => (($target) => {
if ($target.type === "pcon") {
let name = $target[0];
let args = $target[1];
let l = $target[2];
return bag$sland(one($co$co(name)(value)(l)))(many(map(pat_externals)(args)))
} ;
return empty;
throw new Error('match fail 22666:' + JSON.stringify($target))
})(pat)
let ljoin = (prefix) => (items) => (($target) => {
if ($target.type === "nil") {
return ""
} ;
if ($target.type === "cons") {
let one = $target[0];
let items = $target[1];
return `${prefix}${one}${ljoin(prefix)(items)}`
} ;
throw new Error('match fail 23921:' + JSON.stringify($target))
})(items)
let make_kind = (kinds) => (($target) => {
if ($target.type === "nil") {
return star
} ;
if ($target.type === "cons") {
let one = $target[0];
let rest = $target[1];
return kfun(one)(make_kind(rest))
} ;
throw new Error('match fail 24199:' + JSON.stringify($target))
})(kinds)
let pat_loc = (pat) => (($target) => {
if ($target.type === "pany") {
let l = $target[0];
return l
} ;
if ($target.type === "pprim") {
let l = $target[1];
return l
} ;
if ($target.type === "pstr") {
let l = $target[1];
return l
} ;
if ($target.type === "pvar") {
let l = $target[1];
return l
} ;
if ($target.type === "pcon") {
let l = $target[2];
return l
} ;
throw new Error('match fail 24532:' + JSON.stringify($target))
})(pat)
let escape_string = (string) => replaces(string)(cons($co("\\")("\\\\"))(cons($co("\n")("\\n"))(cons($co("\"")("\\\""))(cons($co("\`")("\\\`"))(cons($co("\$")("\\\$"))(nil))))))
let just_pat = (pat) => (($target) => {
if ($target.type === "pany") {
return none
} ;
if ($target.type === "pvar") {
let name = $target[0];
let l = $target[1];
return some(sanitize(name))
} ;
if ($target.type === "pcon") {
let name = $target[0];
let args = $target[1];
let l = $target[2];
{
let $target = foldl($co(0)(nil))(args)(({"1": res, "0": i}) => (arg) => (($target) => {
if ($target.type === "none") {
return $co(i + 1)(res)
} ;
if ($target.type === "some") {
let what = $target[0];
return $co(i + 1)(cons(`${its(i)}: ${what}`)(res))
} ;
throw new Error('match fail 25022:' + JSON.stringify($target))
})(just_pat(arg)));
if ($target.type === ",") {
if ($target[1].type === "nil") {
return none
} 
} ;
if ($target.type === ",") {
let items = $target[1];
return some(`{${join(", ")(rev(items)(nil))}}`)
} ;
throw new Error('match fail 25005:' + JSON.stringify($target))
}
} ;
if ($target.type === "pstr") {
return fatal("Cant use string as a pattern in this location")
} ;
if ($target.type === "pprim") {
return fatal("Cant use primitive as a pattern in this location")
} ;
throw new Error('match fail 24983:' + JSON.stringify($target))
})(pat)
let mapr = (a) => (b) => map(b)(a)
let splitlast = (arr) => (($target) => {
if ($target.type === "nil") {
return fatal("empty splitlast")
} ;
if ($target.type === "cons") {
let one = $target[0];
if ($target[1].type === "nil") {
return $co(nil)(one)
} 
} ;
if ($target.type === "cons") {
let one = $target[0];
let rest = $target[1];
{
let {"1": last, "0": more} = splitlast(rest);
return $co(cons(one)(more))(last)
}
} ;
throw new Error('match fail 26523:' + JSON.stringify($target))
})(arr)

let type_error_$gts = ({"1": items, "0": msg}) => `${msg}${ljoin("\n - ")(map(({"1": name, "0": loc}) => `${name} (${int_to_string(loc)})`)(items))}`
let map_ok_$gt = (f) => (items) => {
let $gt$gt$eq = ok$gt$gt$eq;
{
let $lt_ = ok;
{
let $target = items;
if ($target.type === "nil") {
return $lt_(nil)
} ;
if ($target.type === "cons") {
let one = $target[0];
let rest = $target[1];
return $gt$gt$eq(f(one))((one) => $gt$gt$eq(map_ok_$gt(f)(rest))((rest) => $lt_(cons(one)(rest))))
} ;
throw new Error('match fail 27328:' + JSON.stringify($target))
}
}
}
let foldl_ok_$gt = (init) => (values) => (f) => {
let $lt_ = ok;
{
let $gt$gt$eq = ok$gt$gt$eq;
{
let $target = values;
if ($target.type === "nil") {
return $lt_(init)
} ;
if ($target.type === "cons") {
let one = $target[0];
let rest = $target[1];
return $gt$gt$eq(f(init)(one))((one) => foldl_ok_$gt(one)(rest)(f))
} ;
throw new Error('match fail 27402:' + JSON.stringify($target))
}
}
}
let $lt_idx = $gt$gt$eq($lt_state)(({"0": idx}) => $lt_(idx))
let $lt_subst = $gt$gt$eq($lt_state)(({"3": subst}) => $lt_(subst))
let idx_$gt = (idx) => $gt$gt$eq($lt_state)(({"3": d, "2": c, "1": b}) => $gt$gt$eq(state_$gt($co$co$co(idx)(b)(c)(d)))((_27789) => $lt_($unit)))
let record_$gt = (loc) => (type) => $gt$gt$eq($lt_state)(({"3": subst, "2": tenv, "1": types, "0": idx}) => $gt$gt$eq(state_$gt($co$co$co(idx)(cons($co(loc)(type))(types))(tenv)(subst)))((_27815) => $lt_($unit)))
let $lt_types = $gt$gt$eq($lt_state)(({"1": types}) => $lt_(types))
let map_$gt = (f) => (arr) => (($target) => {
if ($target.type === "nil") {
return $lt_(nil)
} ;
if ($target.type === "cons") {
let one = $target[0];
let rest = $target[1];
return $gt$gt$eq(f(one))((one) => $gt$gt$eq(map_$gt(f)(rest))((rest) => $lt_(cons(one)(rest))))
} ;
throw new Error('match fail 28047:' + JSON.stringify($target))
})(arr)
let seq_$gt = (arr) => (($target) => {
if ($target.type === "nil") {
return $lt_(nil)
} ;
if ($target.type === "cons") {
let one = $target[0];
let rest = $target[1];
return $gt$gt$eq(one)((one) => $gt$gt$eq(seq_$gt(rest))((rest) => $lt_(cons(one)(rest))))
} ;
throw new Error('match fail 28081:' + JSON.stringify($target))
})(arr)
let foldl_$gt = (init) => (values) => (f) => (($target) => {
if ($target.type === "nil") {
return $lt_(init)
} ;
if ($target.type === "cons") {
let one = $target[0];
let rest = $target[1];
return $gt$gt$eq(f(init)(one))((one) => foldl_$gt(one)(rest)(f))
} ;
throw new Error('match fail 28158:' + JSON.stringify($target))
})(values)
let foldr_$gt = (init) => (values) => (f) => (($target) => {
if ($target.type === "nil") {
return $lt_(init)
} ;
if ($target.type === "cons") {
let one = $target[0];
let rest = $target[1];
return $gt$gt$eq(foldr_$gt(init)(rest)(f))((init) => f(init)(one))
} ;
throw new Error('match fail 28189:' + JSON.stringify($target))
})(values)
let get_subst = $lt_subst
let foldl_ok_fst_$gt = (init) => (init2) => (values) => (f) => (f2) => (($target) => {
if ($target.type === "nil") {
return $co(ok(init))(init2)
} ;
if ($target.type === "cons") {
let one = $target[0];
let rest = $target[1];
{
let {"1": snd, "0": result} = f(init)(one);
{
let snd$0 = snd;
{
let snd = f2(snd$0)(init2);
{
let $target = result;
if ($target.type === "ok") {
let v = $target[0];
return foldl_ok_fst_$gt(v)(snd)(rest)(f)(f2)
} ;
if ($target.type === "err") {
let e = $target[0];
return $co(err(e))(snd)
} ;
throw new Error('match fail 28477:' + JSON.stringify($target))
}
}
}
}
} ;
throw new Error('match fail 28446:' + JSON.stringify($target))
})(values)
let concat2 = (a) => (b) => concat(cons(a)(cons(b)(nil)))
let run$sltenv_$gt = (tenv) => (ti) => run_$gt(ti)($co$co$co(0)(nil)(tenv)(map$slnil))
let next_idx = $gt$gt$eq($lt_idx)((nidx) => $gt$gt$eq(idx_$gt(nidx + 1))((_28785) => $lt_(nidx)))

let group_$gtss = (group) => (($target) => {
if ($target.type === "gtext") {
let text = $target[0];
return cons(text)(nil)
} ;
if ($target.type === "ggroup") {
let header = $target[0];
let items = $target[1];
{
let contents = concat(map(group_$gtss)(items));
{
let $target = contents;
if ($target.type === "nil") {
return nil
} ;
return cons(header)(contents);
throw new Error('match fail 30218:' + JSON.stringify($target))
}
}
} ;
throw new Error('match fail 30191:' + JSON.stringify($target))
})(group)
let groups_$gts = (group) => join("\n")(concat(map(group_$gtss)(group)))
let map$slmerge_deep = (merge) => (one) => (two) => foldr(two)(map$slto_list(one))((res) => ({"1": v, "0": k}) => (($target) => {
if ($target.type === "none") {
return map$slset(res)(k)(v)
} ;
if ($target.type === "some") {
let v2 = $target[0];
return map$slset(res)(k)(merge(k)(v)(v2))
} ;
throw new Error('match fail 30472:' + JSON.stringify($target))
})(map$slget(res)(k)))
let assoc$slget = (lst) => (k) => (($target) => {
if ($target.type === "nil") {
return none
} ;
if ($target.type === "cons") {
if ($target[0].type === ",") {
let a = $target[0][0];
let b = $target[0][1];
let rest = $target[1];
{
let $target = $eq(a)(k);
if ($target === true) {
return some(b)
} ;
return assoc$slget(rest)(k);
throw new Error('match fail 31434:' + JSON.stringify($target))
}
} 
} ;
throw new Error('match fail 31419:' + JSON.stringify($target))
})(lst)
let cst$sllist = (v0) => (v1) => ({type: "cst/list", 0: v0, 1: v1})
let cst$slarray = (v0) => (v1) => ({type: "cst/array", 0: v0, 1: v1})
let cst$slrecord = (v0) => (v1) => ({type: "cst/record", 0: v0, 1: v1})
let cst$slspread = (v0) => (v1) => ({type: "cst/spread", 0: v0, 1: v1})
let cst$slidentifier = (v0) => (v1) => ({type: "cst/identifier", 0: v0, 1: v1})
let cst$slstring = (v0) => (v1) => (v2) => ({type: "cst/string", 0: v0, 1: v1, 2: v2})
let tvar = (v0) => (v1) => ({type: "tvar", 0: v0, 1: v1})
let tapp = (v0) => (v1) => (v2) => ({type: "tapp", 0: v0, 1: v1, 2: v2})
let tcon = (v0) => (v1) => ({type: "tcon", 0: v0, 1: v1})
let tgen = (v0) => (v1) => ({type: "tgen", 0: v0, 1: v1})
let pat_loop = (target) => (args) => (i) => (inner) => (trace) => (($target) => {
if ($target.type === "nil") {
return inner
} ;
if ($target.type === "cons") {
let arg = $target[0];
let rest = $target[1];
return compile_pat(arg)(`${target}[${its(i)}]`)(pat_loop(target)(rest)(i + 1)(inner)(trace))(trace)
} ;
throw new Error('match fail 24821:' + JSON.stringify($target))
})(args)

let compile_pat = (pat) => (target) => (inner) => (trace) => trace_and_block(pat_loc(pat))(trace)(target)((($target) => {
if ($target.type === "pany") {
let l = $target[0];
return inner
} ;
if ($target.type === "pprim") {
let prim = $target[0];
let l = $target[1];
{
let $target = prim;
if ($target.type === "pint") {
let int = $target[0];
return `if (${target} === ${its(int)}) {\n${inner}\n}`
} ;
if ($target.type === "pbool") {
let bool = $target[0];
return `if (${target} === ${(($target) => {
if ($target === true) {
return "true"
} ;
return "false";
throw new Error('match fail 24904:' + JSON.stringify($target))
})(bool)}) {\n${inner}\n}`
} ;
throw new Error('match fail 24879:' + JSON.stringify($target))
}
} ;
if ($target.type === "pstr") {
let str = $target[0];
let l = $target[1];
return `if (${target} === \"${str}\"){\n${inner}\n}`
} ;
if ($target.type === "pvar") {
let name = $target[0];
let l = $target[1];
return `{\nlet ${sanitize(name)} = ${target};\n${inner}\n}`
} ;
if ($target.type === "pcon") {
let name = $target[0];
let args = $target[1];
let l = $target[2];
return `if (${target}.type === \"${name}\") {\n${pat_loop(target)(args)(0)(inner)(trace)}\n}`
} ;
throw new Error('match fail 24868:' + JSON.stringify($target))
})(pat))
let star_con = (name) => tcon(tycon(name)(star))(-1)
let tunit = star_con("()")
let tchar = star_con("char")
let tint = star_con("int")
let tinteger = star_con("int")
let tfloat = star_con("float")
let tdouble = star_con("double")
let tlist = tcon(tycon("list")(kfun(star)(star)))(-1)
let tarrow = tcon(tycon("(->)")(kfun(star)(kfun(star)(star))))(-1)
let ttuple2 = tcon(tycon(",")(kfun(star)(kfun(star)(star))))(-1)
let tstring = star_con("string")
let tfn = (a) => (b) => tapp(tapp(tarrow)(a)(-1))(b)(-1)
let mklist = (t) => tapp(tlist)(t)(-1)
let mkpair = (a) => (b) => tapp(tapp(ttuple2)(a)(-1))(b)(-1)
let type$slapply = (subst) => (type) => (($target) => {
if ($target.type === "tvar") {
let tyvar = $target[0];
{
let $target = map$slget(subst)(tyvar);
if ($target.type === "none") {
return type
} ;
if ($target.type === "some") {
let type = $target[0];
return type
} ;
throw new Error('match fail 520:' + JSON.stringify($target))
}
} ;
if ($target.type === "tapp") {
let target = $target[0];
let arg = $target[1];
let loc = $target[2];
return tapp(type$slapply(subst)(target))(type$slapply(subst)(arg))(loc)
} ;
return type;
throw new Error('match fail 513:' + JSON.stringify($target))
})(type)
let type$sltv = (t) => (($target) => {
if ($target.type === "tvar") {
let u = $target[0];
return set$sladd(set$slnil)(u)
} ;
if ($target.type === "tapp") {
let l = $target[0];
let r = $target[1];
return set$slmerge(type$sltv(l))(type$sltv(r))
} ;
return set$slnil;
throw new Error('match fail 557:' + JSON.stringify($target))
})(t)
let compose_subst = (s1) => (s2) => map$slmerge(map$slmap(type$slapply(s1))(s2))(s1)
let set$slintersect = (one) => (two) => filter((k) => set$slhas(two)(k))(set$slto_list(one))

let isin = (v0) => (v1) => ({type: "isin", 0: v0, 1: v1})
let type$eq = (a) => (b) => (($target) => {
if ($target.type === ",") {
if ($target[0].type === "tvar") {
let ty = $target[0][0];
if ($target[1].type === "tvar") {
let ty$qu = $target[1][0];
return tyvar$eq(ty)(ty$qu)
} 
} 
} ;
if ($target.type === ",") {
if ($target[0].type === "tapp") {
let target = $target[0][0];
let arg = $target[0][1];
if ($target[1].type === "tapp") {
let target$qu = $target[1][0];
let arg$qu = $target[1][1];
{
let $target = type$eq(target)(target$qu);
if ($target === true) {
return type$eq(arg)(arg$qu)
} ;
return false;
throw new Error('match fail 6548:' + JSON.stringify($target))
}
} 
} 
} ;
if ($target.type === ",") {
if ($target[0].type === "tcon") {
let tycon = $target[0][0];
if ($target[1].type === "tcon") {
let tycon$qu = $target[1][0];
return tycon$eq(tycon)(tycon$qu)
} 
} 
} ;
if ($target.type === ",") {
if ($target[0].type === "tgen") {
let n = $target[0][0];
if ($target[1].type === "tgen") {
let n$qu = $target[1][0];
return $eq(n)(n$qu)
} 
} 
} ;
return false;
throw new Error('match fail 6489:' + JSON.stringify($target))
})($co(a)(b))
let pred$slapply = (subst) => ({"1": t, "0": i}) => isin(i)(type$slapply(subst)(t))
let pred$sltv = ({"1": t, "0": i}) => type$sltv(t)
let lift = (m) => ({"1": t, "0": i}) => ({"1": t$qu, "0": i$qu}) => (($target) => {
if ($target === true) {
return m(t)(t$qu)
} ;
return err($co(`classes differ: ${i} vs ${i$qu}`)(nil));
throw new Error('match fail 6784:' + JSON.stringify($target))
})($eq(i)(i$qu))
let type$slhnf = (type) => (($target) => {
if ($target.type === "tvar") {
return true
} ;
if ($target.type === "tcon") {
return false
} ;
if ($target.type === "tgen") {
return fatal("hnf got a tgen, shouldn't happen")
} ;
if ($target.type === "tapp") {
let t = $target[0];
return type$slhnf(t)
} ;
throw new Error('match fail 8211:' + JSON.stringify($target))
})(type)
let in_hnf = ({"1": t}) => type$slhnf(t)
let inst$sltype = (types) => (type) => (($target) => {
if ($target.type === "tapp") {
let l = $target[0];
let r = $target[1];
let loc = $target[2];
return tapp(inst$sltype(types)(l))(inst$sltype(types)(r))(loc)
} ;
if ($target.type === "tgen") {
let n = $target[0];
return list$slget(types)(n)
} ;
{
let t = $target;
return t
};
throw new Error('match fail 9394:' + JSON.stringify($target))
})(type)
let inst$slpred = (types) => ({"1": t, "0": c}) => isin(c)(inst$sltype(types)(t))
let tbool = star_con("bool")
let tapps = (items) => (l) => (($target) => {
if ($target.type === "cons") {
let one = $target[0];
if ($target[1].type === "nil") {
return one
} 
} ;
if ($target.type === "cons") {
let one = $target[0];
let rest = $target[1];
return tapp(tapps(rest)(l))(one)(l)
} ;
throw new Error('match fail 10811:' + JSON.stringify($target))
})(items)
let parse_type = (type) => (($target) => {
if ($target.type === "cst/identifier") {
let id = $target[0];
let l = $target[1];
return tcon(tycon(id)(star))(l)
} ;
if ($target.type === "cst/list") {
if ($target[0].type === "nil") {
let l = $target[1];
return fatal("(parse-type) with empty list")
} 
} ;
if ($target.type === "cst/list") {
if ($target[0].type === "cons") {
if ($target[0][0].type === "cst/identifier") {
if ($target[0][0][0] === "fn") {
if ($target[0][1].type === "cons") {
if ($target[0][1][0].type === "cst/array") {
let args = $target[0][1][0][0];
if ($target[0][1][1].type === "cons") {
let body = $target[0][1][1][0];
if ($target[0][1][1][1].type === "nil") {
return foldl(parse_type(body))(rev(args)(nil))((body) => (arg) => tfn(parse_type(arg))(body))
} 
} 
} 
} 
} 
} 
} 
} ;
if ($target.type === "cst/list") {
let items = $target[0];
let l = $target[1];
return tapps(rev(map(parse_type)(items))(nil))(l)
} ;
return fatal(`(parse-type) Invalid type ${valueToString(type)}`);
throw new Error('match fail 10835:' + JSON.stringify($target))
})(type)
let parse_pat = (pat) => (($target) => {
if ($target.type === "cst/identifier") {
if ($target[0] === "_") {
let l = $target[1];
return pany(l)
} 
} ;
if ($target.type === "cst/identifier") {
if ($target[0] === "true") {
let l = $target[1];
return pprim(pbool(true)(l))(l)
} 
} ;
if ($target.type === "cst/identifier") {
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
if ($target.type === "cst/identifier") {
let id = $target[0];
let l = $target[1];
{
let $target = string_to_int(id);
if ($target.type === "some") {
let int = $target[0];
return pprim(pint(int)(l))(l)
} ;
return pvar(id)(l);
throw new Error('match fail 11076:' + JSON.stringify($target))
}
} ;
if ($target.type === "cst/array") {
if ($target[0].type === "nil") {
let l = $target[1];
return pcon("nil")(nil)(l)
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
return pcon("cons")(cons(parse_pat(one))(cons(parse_pat(cst$slarray(rest)(l)))(nil)))(l)
} 
} ;
if ($target.type === "cst/list") {
if ($target[0].type === "cons") {
if ($target[0][0].type === "cst/identifier") {
let name = $target[0][0][0];
let rest = $target[0][1];
let l = $target[1];
return pcon(name)(map(parse_pat)(rest))(l)
} 
} 
} ;
return fatal(`parse-pat mo match ${valueToString(pat)}`);
throw new Error('match fail 11028:' + JSON.stringify($target))
})(pat)

let stdClasses = $pl$pl$pl(cons("eq")(cons("ord")(cons("show")(cons("read")(cons("pretty")(cons("bounded")(cons("enum")(cons("ix")(cons("functor")(cons("monad")(cons("monadplus")(nil))))))))))))(numClasses)
let preds$sltv = (preds) => foldl(set$slnil)(preds)((res) => (pred) => set$slmerge(res)(pred$sltv(pred)))
let preds$slapply = (subst) => (preds) => map(pred$slapply(subst))(preds)
let type_$gtfn = (type) => (($target) => {
if ($target.type === "tapp") {
if ($target[0].type === "tapp") {
if ($target[0][0].type === "tcon") {
if ($target[0][0][0].type === "tycon") {
if ($target[0][0][0][0] === "(->)") {
let arg = $target[0][1];
let result = $target[1];
{
let $target = type_$gtfn(result);
if ($target.type === ",") {
let args = $target[0];
let result = $target[1];
return $co(cons(arg)(args))(result)
} ;
throw new Error('match fail 16252:' + JSON.stringify($target))
}
} 
} 
} 
} 
} ;
return $co(nil)(type);
throw new Error('match fail 16201:' + JSON.stringify($target))
})(type)
let unwrap_tapp = (target) => (args) => (($target) => {
if ($target.type === "tapp") {
let a = $target[0];
let b = $target[1];
return unwrap_tapp(a)(cons(b)(args))
} ;
return $co(target)(args);
throw new Error('match fail 16310:' + JSON.stringify($target))
})(target)
let tfns = (args) => (res) => foldr(res)(args)((res) => (arg) => tfn(arg)(res))
let tmap = (k) => (v) => tapp(tapp(tcon(tycon("map")(kfun(star)(kfun(star)(star))))(-1))(k)(-1))(v)(-1)
let mk_pred = (g0) => (name) => isin(name)(g0)
let g0 = tgen(0)(-1)
let g1 = tgen(1)(-1)
let g2 = tgen(2)(-1)
let toption = (v) => tapp(tcon(tycon("option")(kfun(star)(star)))(-1))(v)(-1)
let tresult = (ok) => (err) => tapp(tapp(tcon(tycon("result")(kfun(star)(kfun(star)(star))))(-1))(ok)(-1))(err)(-1)
let mkcon = (v) => tcon(tycon(v)(star))(-1)
let tratio = tcon(tycon("ratio")(kfun(star)(star)))(-1)
let trational = tapp(tratio)(tint)(-1)
let new_tvar = (kind) => $gt$gt$eq($lt_idx)((nidx) => $gt$gt$eq(idx_$gt(nidx + 1))((_21292) => $lt_(tvar(tyvar(enumId(nidx))(kind))(-1))))
let externals_type = (bound) => (t) => (($target) => {
if ($target.type === "tvar") {
return empty
} ;
if ($target.type === "tcon") {
if ($target[0].type === "tycon") {
let name = $target[0][0];
let l = $target[1];
{
let $target = set$slhas(bound)(name);
if ($target === true) {
return empty
} ;
return one($co$co(name)(type)(l));
throw new Error('match fail 23028:' + JSON.stringify($target))
}
} 
} ;
if ($target.type === "tapp") {
let one = $target[0];
let two = $target[1];
return bag$sland(externals_type(bound)(one))(externals_type(bound)(two))
} ;
throw new Error('match fail 23016:' + JSON.stringify($target))
})(t)
let replace_tycons = (free_map) => (types) => (type) => (($target) => {
if ($target.type === "tcon") {
if ($target[0].type === "tycon") {
let name = $target[0][0];
let l = $target[1];
{
let $target = map$slget(free_map)(name);
if ($target.type === "some") {
let v = $target[0];
return $lt_(v)
} ;
{
let $target = map$slget(types)(name);
if ($target.type === "some") {
if ($target[0].type === ",") {
let kinds = $target[0][0];
return $lt_(tcon(tycon(name)(make_kind(kinds)))(l))
} 
} ;
return $lt_err($co("Unknonwn type constructor")(cons($co(l)(name))(nil)));
throw new Error('match fail 23583:' + JSON.stringify($target))
};
throw new Error('match fail 23571:' + JSON.stringify($target))
}
} 
} ;
if ($target.type === "tapp") {
let a = $target[0];
let b = $target[1];
let l = $target[2];
return $gt$gt$eq(replace_tycons(free_map)(types)(a))((a) => $gt$gt$eq(replace_tycons(free_map)(types)(b))((b) => $lt_(tapp(a)(b)(l))))
} ;
return $lt_(type);
throw new Error('match fail 23561:' + JSON.stringify($target))
})(type)
let type_loc = (type) => (($target) => {
if ($target.type === "tvar") {
let l = $target[1];
return l
} ;
if ($target.type === "tapp") {
let l = $target[2];
return l
} ;
if ($target.type === "tcon") {
let l = $target[1];
return l
} ;
if ($target.type === "tgen") {
let l = $target[1];
return l
} ;
throw new Error('match fail 26858:' + JSON.stringify($target))
})(type)
let subst_$gt = (new_subst) => $gt$gt$eq($lt_state)(({"3": subst, "2": tenv, "1": types, "0": idx}) => $gt$gt$eq(state_$gt($co$co$co(idx)(types)(tenv)(compose_subst(new_subst)(subst))))((_27861) => $lt_($unit)))
let add_subst = subst_$gt
let fix_kinds = (kind) => (type) => (($target) => {
if ($target.type === "tcon") {
if ($target[0].type === "tycon") {
let n = $target[0][0];
let l = $target[1];
return tcon(tycon(n)(kind))(l)
} 
} ;
if ($target.type === "tapp") {
let target = $target[0];
let arg = $target[1];
let l = $target[2];
return tapp(fix_kinds(kfun(star)(kind))(target))(fix_kinds(star)(arg))(l)
} ;
throw new Error('match fail 30602:' + JSON.stringify($target))
})(type)
let tfn_args = (type) => (cur) => (($target) => {
if ($target.type === "tapp") {
let target = $target[0];
let arg = $target[1];
return tfn_args(target)(cons(arg)(cur))
} ;
return cur;
throw new Error('match fail 30992:' + JSON.stringify($target))
})(type)
let replace_free = (free) => (type) => (($target) => {
if ($target.type === "tcon") {
if ($target[0].type === "tycon") {
let name = $target[0][0];
let l = $target[1];
{
let $target = map$slget(free)(name);
if ($target.type === "some") {
let kind = $target[0];
return tvar(tyvar(name)(kind))(l)
} ;
return type;
throw new Error('match fail 31108:' + JSON.stringify($target))
}
} 
} ;
if ($target.type === "tapp") {
let target = $target[0];
let arg = $target[1];
let l = $target[2];
return tapp(replace_free(free)(target))(replace_free(free)(arg))(l)
} ;
return type;
throw new Error('match fail 31094:' + JSON.stringify($target))
})(type)
let merge = (s1) => (s2) => (l) => {
let agree = all((v) => $eq(type$slapply(s1)(tvar(v)(l)))(type$slapply(s2)(tvar(v)(l))))(set$slintersect(set$slfrom_list(map$slkeys(s1)))(set$slfrom_list(map$slkeys(s2))));
{
let $target = agree;
if ($target === true) {
return map$slmerge(s1)(s2)
} ;
return fatal("merge failed");
throw new Error('match fail 648:' + JSON.stringify($target))
}
}
let $eq$gt = (v0) => (v1) => ({type: "=>", 0: v0, 1: v1})
let pred$eq = ({"1": type, "0": id}) => ({"1": type$qu, "0": id$qu}) => (($target) => {
if ($target === true) {
return type$eq(type)(type$qu)
} ;
return false;
throw new Error('match fail 6471:' + JSON.stringify($target))
})($eq(id)(id$qu))
let qual$slapply = (subst) => ({"1": t, "0": preds}) => (t$slapply) => $eq$gt(map(pred$slapply(subst))(preds))(t$slapply(subst)(t))
let qual$sltv = ({"1": t, "0": preds}) => (t$sltv) => foldl(t$sltv(t))(preds)((tv) => (pred) => set$slmerge(tv)(pred$sltv(pred)))


let class$slord = $co(cons("eq")(nil))(cons($eq$gt(nil)(isin("ord")(tunit)))(cons($eq$gt(nil)(isin("ord")(tchar)))(cons($eq$gt(nil)(isin("ord")(tint)))(cons($eq$gt(cons(isin("ord")(tvar(tyvar("a")(star))(-1)))(cons(isin("ord")(tvar(tyvar("b")(star))(-1)))(nil)))(isin("ord")(mkpair(tvar(tyvar("a")(star))(-1))(tvar(tyvar("b")(star))(-1)))))(nil)))))
let class_env = (v0) => (v1) => ({type: "class-env", 0: v0, 1: v1})
let supers = ({"0": classes}) => (id) => (($target) => {
if ($target.type === "some") {
if ($target[0].type === ",") {
let is = $target[0][0];
if ($target[0][1].type === ",") {
let its = $target[0][1][0];
return is
} 
} 
} ;
return fatal(`Unknown class ${id}`);
throw new Error('match fail 6962:' + JSON.stringify($target))
})(map$slget(classes)(id))
let insts = ({"0": classes}) => (id) => (($target) => {
if ($target.type === "some") {
if ($target[0].type === ",") {
let is = $target[0][0];
let its = $target[0][1];
return its
} 
} ;
return fatal(`Unknown class ${id}`);
throw new Error('match fail 6993:' + JSON.stringify($target))
})(map$slget(classes)(id))
let modify = ({"1": defaults, "0": classes}) => (i) => (c) => class_env(map$slset(classes)(i)(c))(defaults)
let initial_env = class_env(map$slnil)(cons(tinteger)(cons(tdouble)(cons(tfloat)(cons(tunit)(nil)))))
let add_class = ({"1": defaults, "0": classes}) => ({"1": {"1": fns, "0": supers}, "0": name}) => (($target) => {
if ($target.type === "some") {
return fatal(`class ${name} already defined`)
} ;
{
let $target = find(supers)((name) => not(map$slhas(classes)(name)));
if ($target.type === "some") {
let super_ = $target[0];
return fatal(`Superclass not defined ${super_}`)
} ;
return class_env(map$slset(classes)(name)($co(supers)($co(nil)(fns))))(defaults);
throw new Error('match fail 7135:' + JSON.stringify($target))
};
throw new Error('match fail 7119:' + JSON.stringify($target))
})(map$slget(classes)(name))
let core_classes = (env) => foldl(env)(cons($co("eq")($co(nil)(cons($co("=")(tfns(cons(tgen(0)(-1))(cons(tgen(0)(-1))(nil)))(tbool)))(nil))))(cons($co("ix")($co(nil)(nil)))(cons($co("ord")($co(cons("eq")(nil))(nil)))(cons($co("show")($co(nil)(nil)))(cons($co("read")($co(nil)(nil)))(cons($co("pretty")($co(nil)(cons($co("show-pretty")(tfn(tgen(0)(-1))(tstring)))(nil))))(cons($co("bounded")($co(nil)(nil)))(cons($co("enum")($co(nil)(nil)))(cons($co("functor")($co(nil)(nil)))(cons($co("monad")($co(nil)(nil)))(nil)))))))))))(add_class)
let num_classes = (env) => foldl(env)(cons($co("num")($co(cons("eq")(cons("show")(nil)))(nil)))(cons($co("real")($co(cons("num")(cons("ord")(nil)))(nil)))(cons($co("fractional")($co(cons("num")(nil))(nil)))(cons($co("integral")($co(cons("real")(cons("enum")(nil)))(nil)))(cons($co("realfrac")($co(cons("real")(cons("fractional")(nil)))(nil)))(cons($co("floating")($co(cons("fractional")(nil))(nil)))(cons($co("realfloat")($co(cons("realfrac")(cons("floating")(nil)))(nil)))(nil))))))))(add_class)
let by_super = (ce) => (pred) => {
let {"1": t, "0": i} = pred;
{
let {"0": supers} = ce;
{
let {"0": got} = (($target) => {
if ($target.type === "some") {
let s = $target[0];
return s
} ;
return fatal(`Unknown class '${i}' in predicate [by-super]`);
throw new Error('match fail 7906:' + JSON.stringify($target))
})(map$slget(supers)(i));
return cons(pred)(concat(map((i$qu) => by_super(ce)(isin(i$qu)(t)))(got)))
}
}
}
let sc_entail = (ce) => (ps) => (p) => any(any(pred$eq(p)))(map(by_super(ce))(ps))
let forall = (v0) => (v1) => ({type: "forall", 0: v0, 1: v1})
let scheme$slapply = (subst) => ({"1": qt, "0": ks}) => forall(ks)(qual$slapply(subst)(qt)(type$slapply))
let scheme$sltv = ({"1": qt, "0": ks}) => qual$sltv(qt)(type$sltv)
let quantify = (vs) => (qt) => {
let vs$qu = filter((v) => any(tyvar$eq(v))(vs))(set$slto_list(qual$sltv(qt)(type$sltv)));
{
let ks = map(tyvar$slkind)(vs$qu);
{
let subst = map$slfrom_list(mapi((v) => (i) => $co(v)(tgen(i)(-1)))(0)(vs$qu));
return forall(ks)(qual$slapply(subst)(qt)(type$slapply))
}
}
}
let to_scheme = (t) => forall(nil)($eq$gt(nil)(t))
let $ex$gt$ex = (v0) => (v1) => ({type: "!>!", 0: v0, 1: v1})
let assump$slapply = (subst) => ({"1": sc, "0": id}) => $ex$gt$ex(id)(scheme$slapply(subst)(sc))
let assump$sltv = ({"1": sc, "0": id}) => scheme$sltv(sc)
let find_scheme = (id) => (assumps) => (l) => (($target) => {
if ($target.type === "nil") {
return err($co("Unbound identifier")(cons($co(l)(id))(nil)))
} ;
if ($target.type === "cons") {
if ($target[0].type === "!>!") {
let id$qu = $target[0][0];
let sc = $target[0][1];
let rest = $target[1];
{
let $target = $eq(id)(id$qu);
if ($target === true) {
return ok(sc)
} ;
return find_scheme(id)(rest)(l);
throw new Error('match fail 8815:' + JSON.stringify($target))
}
} 
} ;
throw new Error('match fail 8796:' + JSON.stringify($target))
})(assumps)
let type_$gts$qu = (show_kind) => (type) => (($target) => {
if ($target.type === "tvar") {
if ($target[0].type === "tyvar") {
let name = $target[0][0];
let kind = $target[0][1];
return `(var ${name} ${kind_$gts(kind)})`
} 
} ;
if ($target.type === "tapp") {
let target = $target[0];
let arg = $target[1];
{
let $target = type_$gtfn(type);
if ($target.type === ",") {
if ($target[0].type === "nil") {
{
let target$0 = target;
{
let {"1": args, "0": target} = unwrap_tapp(target$0)(cons(arg)(nil));
return `(${type_$gts$qu(show_kind)(target)} ${join(" ")(map(type_$gts$qu(show_kind))(args))})`
}
}
} 
} ;
if ($target.type === ",") {
let args = $target[0];
let result = $target[1];
return `(fn [${join(" ")(map(type_$gts$qu(show_kind))(args))}] ${type_$gts$qu(show_kind)(result)})`
} ;
throw new Error('match fail 16271:' + JSON.stringify($target))
}
} ;
if ($target.type === "tcon") {
if ($target[0].type === "tycon") {
if ($target[0][0] === "[]") {
return "list"
} 
} 
} ;
if ($target.type === "tcon") {
if ($target[0].type === "tycon") {
let name = $target[0][0];
let k = $target[0][1];
{
let $target = show_kind;
if ($target === true) {
return `${name} [${kind_$gts(k)}]`
} ;
return name;
throw new Error('match fail 24105:' + JSON.stringify($target))
}
} 
} ;
if ($target.type === "tcon") {
let con = $target[0];
return tycon_$gts(con)
} ;
if ($target.type === "tgen") {
let num = $target[0];
return gen_name(num)
} ;
throw new Error('match fail 8990:' + JSON.stringify($target))
})(type)
let inst$slpreds = (types) => (preds) => map(inst$slpred(types))(preds)
let infer$slprim = (prim) => (($target) => {
if ($target.type === "pbool") {
return $lt_($co(nil)(tbool))
} ;
if ($target.type === "pfloat") {
return $gt$gt$eq(new_tvar(star))((v) => $lt_($co(cons(isin("floating")(v))(nil))(v)))
} ;
if ($target.type === "pint") {
return $gt$gt$eq(new_tvar(star))((v) => $lt_($co(cons(isin("num")(v))(nil))(v)))
} ;
throw new Error('match fail 9601:' + JSON.stringify($target))
})(prim)
let type_env = (v0) => (v1) => (v2) => ({type: "type-env", 0: v0, 1: v1, 2: v2})
let tenv$slconstr = ({"0": constrs}) => (name) => map$slget(constrs)(name)
let tenv$slvalue = ({"1": values}) => (name) => map$slget(values)(name)
let ambiguities = (ce) => (known_variables) => (preds) => map((v) => $co(v)(filter((pred) => contains(set$slto_list(pred$sltv(pred)))(v)(tyvar$eq))(preds)))(without(set$slto_list(preds$sltv(preds)))(known_variables)(tyvar$eq))
let toScheme = (t) => forall(nil)($eq$gt(nil)(t))
let tenv$slnil = type_env(map$slnil)(map$slnil)(map$slnil)
let class_env$slnil = class_env(map$slnil)(nil)
let class_env$slstd = class_env
let generics = (classes) => (body) => $co(map((_17668) => star)(classes))($eq$gt(concat(mapi((cls) => (i) => map(mk_pred(tgen(i)(-1)))(cls))(0)(classes)))(body))
let generic = (cls) => (body) => generics(cons(cls)(nil))(body)
let tuple_assump = ({"1": {"1": qual, "0": kinds}, "0": name}) => $ex$gt$ex(name)(forall(kinds)(qual))
let tuple_scheme = ({"1": qual, "0": kinds}) => forall(kinds)(qual)
let concrete = generics(nil)
let full_env = (v0) => (v1) => (v2) => ({type: "full-env", 0: v0, 1: v1, 2: v2})
let infer_alias = ({"2": assumps, "1": ce, "0": tenv}) => ({"2": type, "1": args, "0": name}) => fatal("ok here we are")
let infer_deftype = ({"3": constructors, "2": top_args, "1": tnl, "0": name}) => $gt$gt$eq($lt_tenv)(({"2": aliases_, "1": types_, "0": constructors_}) => $gt$gt$eq($lt_(map(({"0": name}) => name)(constructors)))((names) => $gt$gt$eq($lt_(map((_24224) => star)(top_args)))((top_kinds) => $gt$gt$eq($lt_(foldl(star)(top_kinds)((result) => (arg) => kfun(arg)(result))))((kind) => $gt$gt$eq($lt_(map$slset(map$slnil)(name)($co(top_kinds)(set$slfrom_list(names)))))((with_type) => $gt$gt$eq($lt_(foldl($co(tcon(tycon(name)(kind))(tnl))(0))(top_args)(({"1": i, "0": body}) => ({"1": al, "0": arg}) => $co(tapp(body)(tgen(i)(al))(al))(i + 1))))(({"0": final}) => $gt$gt$eq($lt_(map$slfrom_list(mapi(({"1": al, "0": arg}) => (i) => $co(arg)(tgen(i)(al)))(0)(top_args))))((free_idxs) => $gt$gt$eq(foldl_$gt($co(nil)(map$slnil))(constructors)(({"1": constructors, "0": assumps}) => ({"3": l, "2": args, "1": nl, "0": name}) => $gt$gt$eq(map_$gt(replace_tycons(free_idxs)(map$slmerge(types_)(with_type)))(args))((args) => $gt$gt$eq($lt_(tfns(args)(final)))((typ) => $gt$gt$eq($lt_(generics(map((_21399) => nil)(top_args))(typ)))(({"1": qual, "0": kinds}) => $lt_($co(cons($ex$gt$ex(name)(forall(kinds)(qual)))(assumps))(map$slset(constructors)(name)(forall(kinds)(qual)))))))))(({"1": constructors$qu, "0": assumps$qu}) => $gt$gt$eq(tenv_$gt(type_env(map$slmerge(constructors_)(constructors$qu))(map$slmerge(types_)(with_type))(aliases_)))((_20948) => $lt_(full_env(type_env(constructors$qu)(with_type)(map$slnil))(class_env$slnil)(assumps$qu)))))))))))
let get_constructor = (name) => (l) => $gt$gt$eq($lt_tenv)((tenv) => (($target) => {
if ($target.type === "none") {
return $lt_err($co("Unknown constructor")(cons($co(l)(name))(nil)))
} ;
if ($target.type === "some") {
let scheme = $target[0];
return $lt_(scheme)
} ;
throw new Error('match fail 21351:' + JSON.stringify($target))
})(tenv$slconstr(tenv)(name)))
let class_env$slmerge = ({"1": defaults, "0": classes}) => ({"1": defaults$qu, "0": classes$qu}) => class_env(map$slmerge_deep((k) => ({"1": {"1": fns, "0": inst1}, "0": super1}) => ({"1": {"1": fns2, "0": inst2}, "0": super2}) => (($target) => {
if ($target === true) {
return fatal(`Cant merge classes for ${k}: superclasses differ`)
} ;
{
let $target = $ex$eq(fns)(fns2);
if ($target === true) {
return fatal(`Cant merge classes for ${k}: isntance methods differ`)
} ;
return $co(super1)($co(concat(cons(inst1)(cons(inst2)(nil))))(fns));
throw new Error('match fail 31234:' + JSON.stringify($target))
};
throw new Error('match fail 30509:' + JSON.stringify($target))
})($ex$eq(super1)(super2)))(classes)(classes$qu))(concat(cons(defaults)(cons(defaults$qu)(nil))))
let tenv$slmerge = ({"2": aliases, "1": types, "0": const_}) => ({"2": aliases$qu, "1": types$qu, "0": const$qu}) => type_env(map$slmerge(const_)(const$qu))(map$slmerge(types)(types$qu))(map$slmerge(aliases)(aliases$qu))
let type_env$slnil = tenv$slnil
let type_$gts = type_$gts$qu(false)
let type_debug_$gts = type_$gts$qu(true)

let state$slnil = $co$co$co(0)(nil)(type_env$slnil)(map$slnil)
let run$slnil_$gt = (x) => run_$gt(x)(state$slnil)
let full_env$slassumps = ({"2": assumps}) => assumps
let class_env$sladd_default = ({"1": defaults, "0": cls}) => (new_defaults) => class_env(cls)(concat(cons(defaults)(cons(new_defaults)(nil))))
let find_free = (type) => (($target) => {
if ($target.type === "tcon") {
if ($target[0].type === "tycon") {
let name = $target[0][0];
let kind = $target[0][1];
let l = $target[1];
return one($co$co(name)(l)(kind))
} 
} ;
{
let args = tfn_args(type)(nil);
return many(map(find_free)(args))
};
throw new Error('match fail 31027:' + JSON.stringify($target))
})(type)
let eprim = (v0) => (v1) => ({type: "eprim", 0: v0, 1: v1})
let estr = (v0) => (v1) => (v2) => ({type: "estr", 0: v0, 1: v1, 2: v2})
let evar = (v0) => (v1) => ({type: "evar", 0: v0, 1: v1})
let equot = (v0) => (v1) => ({type: "equot", 0: v0, 1: v1})
let equot$slstmt = (v0) => (v1) => ({type: "equot/stmt", 0: v0, 1: v1})
let equot$slpat = (v0) => (v1) => ({type: "equot/pat", 0: v0, 1: v1})
let equot$sltype = (v0) => (v1) => ({type: "equot/type", 0: v0, 1: v1})
let equotquot = (v0) => (v1) => ({type: "equotquot", 0: v0, 1: v1})
let elambda = (v0) => (v1) => (v2) => ({type: "elambda", 0: v0, 1: v1, 2: v2})
let eapp = (v0) => (v1) => (v2) => ({type: "eapp", 0: v0, 1: v1, 2: v2})
let elet = (v0) => (v1) => (v2) => ({type: "elet", 0: v0, 1: v1, 2: v2})
let ematch = (v0) => (v1) => (v2) => ({type: "ematch", 0: v0, 1: v1, 2: v2})

let sdeftype = (v0) => (v1) => (v2) => (v3) => (v4) => ({type: "sdeftype", 0: v0, 1: v1, 2: v2, 3: v3, 4: v4})
let stypealias = (v0) => (v1) => (v2) => (v3) => (v4) => ({type: "stypealias", 0: v0, 1: v1, 2: v2, 3: v3, 4: v4})
let sdef = (v0) => (v1) => (v2) => (v3) => ({type: "sdef", 0: v0, 1: v1, 2: v2, 3: v3})
let sexpr = (v0) => (v1) => ({type: "sexpr", 0: v0, 1: v1})
let sdefinstance = (v0) => (v1) => (v2) => (v3) => (v4) => (v5) => ({type: "sdefinstance", 0: v0, 1: v1, 2: v2, 3: v3, 4: v4, 5: v5})
let sdefclass = (v0) => (v1) => (v2) => ({type: "sdefclass", 0: v0, 1: v1, 2: v2})








let type$slkind = (type) => (($target) => {
if ($target.type === "tcon") {
let tc = $target[0];
return tycon$slkind(tc)
} ;
if ($target.type === "tvar") {
let u = $target[0];
return tyvar$slkind(u)
} ;
if ($target.type === "tapp") {
let t = $target[0];
let l = $target[2];
{
let $target = type$slkind(t);
if ($target.type === "kfun") {
let k = $target[1];
return k
} ;
return fatal(`Invalid ssssssssssssssssssstype application ${int_to_string(l)} while trying to determine the kind of ${type_$gts(type)}: ${type_$gts(t)} isn't a kfun.`);
throw new Error('match fail 403:' + JSON.stringify($target))
}
} ;
throw new Error('match fail 381:' + JSON.stringify($target))
})(type)
let varBind = (u) => (t) => (($target) => {
if ($target.type === "tvar") {
let name = $target[0];
return ok((($target) => {
if ($target === true) {
return map$slnil
} ;
return $bar_$gt(u)(t);
throw new Error('match fail 765:' + JSON.stringify($target))
})($eq(name)(u)))
} ;
{
let $target = set$slhas(type$sltv(t))(u);
if ($target === true) {
return err($co(`Occurs check fails: ${type_$gts(t)} contains ${tyvar_$gts(u)}`)(nil))
} ;
{
let $target = not(kind$eq(tyvar$slkind(u))(type$slkind(t)));
if ($target === true) {
return err($co(`kinds do not match: type variable ${tyvar_$gts(u)} has kind ${kind_$gts(tyvar$slkind(u))}, but ${type_$gts(t)} has kind ${kind_$gts(type$slkind(t))}`)(nil))
} ;
return ok($bar_$gt(u)(t));
throw new Error('match fail 789:' + JSON.stringify($target))
};
throw new Error('match fail 777:' + JSON.stringify($target))
};
throw new Error('match fail 757:' + JSON.stringify($target))
})(t)
let mgu = (t1) => (t2) => (($target) => {
if ($target.type === ",") {
if ($target[0].type === "tapp") {
let l = $target[0][0];
let r = $target[0][1];
if ($target[1].type === "tapp") {
let l$qu = $target[1][0];
let r$qu = $target[1][1];
{
let $target = mgu(l)(l$qu);
if ($target.type === "err") {
let e = $target[0];
return err(e)
} ;
if ($target.type === "ok") {
let s1 = $target[0];
{
let $target = mgu(type$slapply(s1)(r))(type$slapply(s1)(r$qu));
if ($target.type === "err") {
let e = $target[0];
return err(e)
} ;
if ($target.type === "ok") {
let s2 = $target[0];
return ok(compose_subst(s2)(s1))
} ;
throw new Error('match fail 7659:' + JSON.stringify($target))
}
} ;
throw new Error('match fail 7643:' + JSON.stringify($target))
}
} 
} 
} ;
if ($target.type === ",") {
if ($target[0].type === "tvar") {
let u = $target[0][0];
let l = $target[0][1];
let t = $target[1];
return varBind(u)(t)
} 
} ;
if ($target.type === ",") {
let t = $target[0];
if ($target[1].type === "tvar") {
let u = $target[1][0];
let l = $target[1][1];
return varBind(u)(t)
} 
} ;
if ($target.type === ",") {
if ($target[0].type === "tcon") {
let tc1 = $target[0][0];
let l1 = $target[0][1];
if ($target[1].type === "tcon") {
let tc2 = $target[1][0];
let l2 = $target[1][1];
{
let $target = tycon$eq(tc1)(tc2);
if ($target === true) {
return ok(map$slnil)
} ;
return err($co(`Incompatible types ${tycon_$gts(tc1)} vs ${tycon_$gts(tc2)}`)(cons($co(l1)(tycon_$gts(tc1)))(cons($co(l2)(tycon_$gts(tc2)))(nil))));
throw new Error('match fail 892:' + JSON.stringify($target))
}
} 
} 
} ;
if ($target.type === ",") {
let a = $target[0];
let b = $target[1];
return err($co(`Cant unify ${type_$gts(a)} and ${type_$gts(b)}`)(nil))
} ;
throw new Error('match fail 815:' + JSON.stringify($target))
})($co(t1)(t2))
let type_match = (t1) => (t2) => (($target) => {
if ($target.type === ",") {
if ($target[0].type === "tapp") {
let l = $target[0][0];
let r = $target[0][1];
let loc = $target[0][2];
if ($target[1].type === "tapp") {
let l$qu = $target[1][0];
let r$qu = $target[1][1];
{
let $target = type_match(l)(l$qu);
if ($target.type === "ok") {
let sl = $target[0];
{
let $target = type_match(r)(r$qu);
if ($target.type === "ok") {
let sr = $target[0];
return ok(merge(sl)(sr)(loc))
} ;
{
let err = $target;
return err
};
throw new Error('match fail 8052:' + JSON.stringify($target))
}
} ;
{
let err = $target;
return err
};
throw new Error('match fail 8037:' + JSON.stringify($target))
}
} 
} 
} ;
if ($target.type === ",") {
if ($target[0].type === "tvar") {
let u = $target[0][0];
let t = $target[1];
{
let $target = kind$eq(tyvar$slkind(u))(type$slkind(t));
if ($target === true) {
return ok($bar_$gt(u)(t))
} ;
return err($co(`Different Kinds ${kind_$gts(tyvar$slkind(u))} vs ${kind_$gts(type$slkind(t))}`)(nil));
throw new Error('match fail 956:' + JSON.stringify($target))
}
} 
} ;
if ($target.type === ",") {
if ($target[0].type === "tcon") {
let tc1 = $target[0][0];
if ($target[1].type === "tcon") {
let tc2 = $target[1][0];
{
let $target = tycon$eq(tc1)(tc2);
if ($target === true) {
return ok(map$slnil)
} ;
return err($co(`Unable to match types ${tycon_$gts(tc1)} and ${tycon_$gts(tc2)}`)(nil));
throw new Error('match fail 985:' + JSON.stringify($target))
}
} 
} 
} ;
return err($co(`Unable to match ${type_$gts$qu(true)(t1)} vs ${type_$gts$qu(true)(t2)}`)(nil));
throw new Error('match fail 913:' + JSON.stringify($target))
})($co(t1)(t2))
let qual$eq = ({"1": t, "0": preds}) => ({"1": t$qu, "0": preds$qu}) => (t$eq) => (($target) => {
if ($target === true) {
return t$eq(t)(t$qu)
} ;
return false;
throw new Error('match fail 6443:' + JSON.stringify($target))
})(array$eq(preds)(preds$qu)(pred$eq))
let mguPred = lift(mgu)
let matchPred = lift(type_match)
let add_prelude_classes = compose_transformers(core_classes)(num_classes)
let overlap = (p) => (q) => (($target) => {
if ($target.type === "ok") {
return true
} ;
return false;
throw new Error('match fail 7622:' + JSON.stringify($target))
})(mguPred(p)(q))
let by_inst = ({"0": classes}) => (pred) => {
let {"1": t, "0": i} = pred;
{
let {"1": {"0": insts}} = (($target) => {
if ($target.type === "some") {
let s = $target[0];
return s
} ;
return fatal(`Unknown class '${i}' in predicate [by-inst]`);
throw new Error('match fail 7993:' + JSON.stringify($target))
})(map$slget(classes)(i));
return find_some(({"1": h, "0": ps}) => (($target) => {
if ($target.type === "err") {
return none
} ;
if ($target.type === "ok") {
let u = $target[0];
return some(map(pred$slapply(u))(ps))
} ;
throw new Error('match fail 8017:' + JSON.stringify($target))
})(matchPred(h)(pred)))(insts)
}
}
let entail = (ce) => (ps) => (p) => (($target) => {
if ($target === true) {
return true
} ;
{
let $target = by_inst(ce)(p);
if ($target.type === "none") {
return false
} ;
if ($target.type === "some") {
let qs = $target[0];
return all(entail(ce)(ps))(qs)
} ;
throw new Error('match fail 8143:' + JSON.stringify($target))
};
throw new Error('match fail 8129:' + JSON.stringify($target))
})(any(any(pred$eq(p)))(map(by_super(ce))(ps)))
let simplify_inner = (ce) => (rs) => (preds) => (($target) => {
if ($target.type === "nil") {
return rs
} ;
if ($target.type === "cons") {
let p = $target[0];
let ps = $target[1];
{
let $target = entail(ce)(concat(cons(rs)(cons(ps)(nil))))(p);
if ($target === true) {
return simplify_inner(ce)(rs)(ps)
} ;
return simplify_inner(ce)(cons(p)(rs))(ps);
throw new Error('match fail 8461:' + JSON.stringify($target))
}
} ;
throw new Error('match fail 8447:' + JSON.stringify($target))
})(preds)
let simplify = (ce) => simplify_inner(ce)(nil)
let scheme$eq = ({"1": qual, "0": kinds}) => ({"1": qual$qu, "0": kinds$qu}) => (($target) => {
if ($target === true) {
return qual$eq(qual)(qual$qu)(type$eq)
} ;
return false;
throw new Error('match fail 8579:' + JSON.stringify($target))
})(array$eq(kinds)(kinds$qu)(kind$eq))
let inst$slqual = (types) => (inst$slt) => ({"1": t, "0": ps}) => $eq$gt(inst$slpreds(types)(ps))(inst$slt(types)(t))
let fresh_inst = ({"1": qt, "0": ks}) => $gt$gt$eq(map_$gt(new_tvar)(ks))((ts) => $lt_(inst$slqual(ts)(inst$sltype)(qt)))
let mk_deftype = (id) => (li) => (args) => (items) => (l) => sdeftype(id)(li)(map((arg) => (($target) => {
if ($target.type === "cst/identifier") {
let name = $target[0];
let l = $target[1];
return $co(name)(l)
} ;
return fatal("deftype type argument must be identifier");
throw new Error('match fail 12443:' + JSON.stringify($target))
})(arg))(args))(foldr(nil)(items)((res) => (constr) => (($target) => {
if ($target.type === "cst/list") {
if ($target[0].type === "cons") {
if ($target[0][0].type === "cst/identifier") {
let name = $target[0][0][0];
let ni = $target[0][0][1];
let args = $target[0][1];
let l = $target[1];
return cons($co$co$co(name)(ni)(map(parse_type)(args))(l))(res)
} 
} 
} ;
if ($target.type === "cst/list") {
if ($target[0].type === "nil") {
let l = $target[1];
return res
} 
} ;
return fatal("Invalid type constructor");
throw new Error('match fail 12468:' + JSON.stringify($target))
})(constr)))(l)
let candidates = (ce) => ({"1": qs, "0": v}) => {
let {"1": defaults} = ce;
{
let is = map(({"0": i}) => i)(qs);
{
let ts = map(({"1": t}) => t)(qs);
{
let $target = not(every(cons(all(type$eq(tvar(v)(-1)))(ts))(cons(any((x) => contains(numClasses)(x)($eq))(is))(cons(all((x) => contains(stdClasses)(x)($eq))(is))(nil))))((x) => x));
if ($target === true) {
return nil
} ;
return filter((t$qu) => all(entail(ce)(nil))(map((i) => isin(i)(t$qu))(is)))(defaults);
throw new Error('match fail 14085:' + JSON.stringify($target))
}
}
}
}
let pred_$gts = ({"1": type, "0": name}) => `${type_$gts(type)} ∈ ${name}`
let subst_$gts = (subst) => join("\n")(map(({"1": type, "0": tyvar}) => `${tyvar_$gts(tyvar)} = ${type_$gts(type)}`)(map$slto_list(subst)))
let types_$gts = dot(join("\n"))(map(type_$gts))
let preds_$gts = dot(join("\n"))(map(pred_$gts))
let builtin_instances = (() => {
let gen1 = (cls) => (x) => generic(cons(cls)(nil))(isin(cls)(x));
{
let gen2 = (cls) => (x) => generics(cons(cons(cls)(nil))(cons(cons(cls)(nil))(nil)))(isin(cls)(x));
{
let int_ratio = (x) => generic(cons("integral")(nil))(isin(x)(tapp(mkcon("ratio"))(g0)(-1)));
{
let eq = gen1("eq");
{
let eq2 = gen2("eq");
{
let show = gen1("show");
{
let show2 = gen2("show");
{
let list = mklist(g0);
{
let option = toption(g0);
{
let result = tresult(g0)(g1);
{
let pair = mkpair(g0)(g1);
{
let ix = gen1("ix");
{
let ix2 = gen2("ix");
return cons(eq(list))(cons(eq(option))(cons(eq2(result))(cons(int_ratio("eq"))(cons(eq2(pair))(cons(gen1("ord")(list))(cons(int_ratio("ord"))(cons(gen1("ord")(option))(cons(gen2("ord")(result))(cons(gen2("ord")(pair))(cons(int_ratio("num"))(cons(int_ratio("real"))(cons(int_ratio("fractional"))(cons(int_ratio("realfrac"))(cons(show(list))(cons(show(option))(cons(show2(result))(cons(int_ratio("show"))(cons(show2(pair))(cons(ix2(pair))(cons(generics(nil)(isin("monad")(tcon(tycon("option")(kfun(star)(star)))(-1))))(cons(generics(nil)(isin("monad")(tcon(tycon("list")(kfun(star)(star)))(-1))))(concat(map(({"1": names, "0": cls}) => map((name) => $co(nil)($eq$gt(nil)(isin(cls)(mkcon(name)))))(names))(cons($co("eq")(cons("unit")(cons("char")(cons("int")(cons("float")(cons("double")(cons("bool")(cons("ordering")(cons("string")(nil))))))))))(cons($co("ord")(cons("unit")(cons("char")(cons("int")(cons("float")(cons("double")(cons("bool")(cons("ordering")(cons("string")(nil))))))))))(cons($co("num")(cons("int")(cons("float")(cons("double")(nil)))))(cons($co("real")(cons("int")(cons("float")(cons("double")(nil)))))(cons($co("integral")(cons("int")(nil)))(cons($co("fractional")(cons("float")(cons("double")(nil))))(cons($co("floating")(cons("float")(cons("double")(nil))))(cons($co("realfrac")(cons("float")(cons("double")(nil))))(cons($co("show")(cons("unit")(cons("char")(cons("int")(cons("float")(cons("double")(cons("bool")(cons("ordering")(cons("string")(nil))))))))))(cons($co("pretty")(cons("unit")(cons("char")(cons("int")(cons("string")(cons("float")(cons("double")(cons("bool")(cons("ordering")(nil))))))))))(cons($co("ix")(cons("unit")(cons("char")(cons("int")(cons("bool")(cons("ordering")(cons("string")(nil))))))))(nil)))))))))))))))))))))))))))))))))))
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
})()
let builtin_assumptions = (() => {
let map01 = tmap(g0)(g1);
{
let biNum = generic(cons("num")(nil))(tfns(cons(g0)(cons(g0)(nil)))(g0));
{
let uNum = generic(cons("num")(nil))(tfn(g0)(g0));
{
let boolOrd = generic(cons("ord")(nil))(tfns(cons(g0)(cons(g0)(nil)))(tbool));
{
let boolEq = generic(cons("eq")(nil))(tfns(cons(g0)(cons(g0)(nil)))(tbool));
{
let kv = generics(cons(cons("ord")(nil))(cons(nil)(nil)));
{
let g = generics;
{
let con = generics(nil);
{
let float = generic(cons("floating")(nil));
{
let floatUn = float(tfn(g0)(g0));
return map(tuple_assump)(cons($co("+")(biNum))(cons($co("-")(biNum))(cons($co("*")(biNum))(cons($co("()")(generic(nil)(tunit)))(cons($co("negate")(uNum))(cons($co("abs")(uNum))(cons($co("fromInt")(generic(cons("num")(nil))(tfn(tint)(g0))))(cons($co("toInt")(generic(cons("integral")(nil))(tfn(g0)(tint))))(cons($co("/")(generic(cons("fractional")(nil))(tfns(cons(g0)(cons(g0)(nil)))(g0))))(cons($co("pi")(float(g0)))(cons($co("exp")(floatUn))(cons($co("log")(floatUn))(cons($co("sqrt")(floatUn))(cons($co("**")(float(tfns(cons(g0)(cons(g0)(nil)))(g0))))(cons($co("logBase")(float(tfns(cons(g0)(cons(g0)(nil)))(g0))))(cons($co("sin")(floatUn))(cons($co("cos")(floatUn))(cons($co("tan")(floatUn))(cons($co(">")(boolOrd))(cons($co(">=")(boolOrd))(cons($co("<")(boolOrd))(cons($co("<=")(boolOrd))(cons($co("max")(generic(cons("ord")(nil))(tfns(cons(g0)(cons(g0)(nil)))(g0))))(cons($co("min")(generic(cons("ord")(nil))(tfns(cons(g0)(cons(g0)(nil)))(g0))))(cons($co("compare")(generic(cons("ord")(nil))(tfns(cons(g0)(cons(g0)(nil)))(tcon(tycon("ordering")(star))(-1)))))(cons($co("=")(boolEq))(cons($co("!=")(boolEq))(cons($co("show")(generic(cons("show")(nil))(tfn(g0)(tstring))))(cons($co("range")(generic(cons("ix")(nil))(tfn(mkpair(g0)(g0))(mklist(g0)))))(cons($co("index")(generic(cons("ix")(nil))(tfns(cons(mkpair(g0)(g0))(cons(g0)(nil)))(tint))))(cons($co("inRange")(generic(cons("ix")(nil))(tfns(cons(mkpair(g0)(g0))(cons(g0)(nil)))(tbool))))(cons($co("rangeSize")(generic(cons("ix")(nil))(tfns(cons(mkpair(g0)(g0))(nil))(tint))))(cons($co("show-pretty")(generic(cons("pretty")(nil))(tfn(g0)(tstring))))(cons($co("return")($co(cons(kfun(star)(star))(cons(star)(nil)))($eq$gt(cons(isin("monad")(g0))(nil))(tfn(g1)(tapp(g0)(g1)(-1))))))(cons($co(">>=")($co(cons(kfun(star)(star))(cons(star)(cons(star)(nil))))($eq$gt(cons(isin("monad")(g0))(nil))(tfns(cons(tapp(g0)(g1)(-1))(cons(tfn(g1)(tapp(g0)(g2)(-1)))(nil)))(tapp(g0)(g2)(-1))))))(cons($co(">>")($co(cons(kfun(star)(star))(cons(star)(cons(star)(nil))))($eq$gt(cons(isin("monad")(g0))(nil))(tfns(cons(tapp(g0)(g1)(-1))(cons(tapp(g0)(g2)(-1))(nil)))(tapp(g0)(g2)(-1))))))(cons($co("fail")($co(cons(kfun(star)(star))(cons(star)(nil)))($eq$gt(cons(isin("monad")(g0))(nil))(tfn(tstring)(tapp(g0)(g1)(-1))))))(cons($co("map/nil")(kv(tmap(g0)(g1))))(cons($co("map/set")(kv(tfns(cons(map01)(cons(g0)(cons(g1)(nil))))(map01))))(cons($co("map/get")(kv(tfns(cons(map01)(cons(g0)(nil)))(g1))))(cons($co("map/map")(generics(cons(cons("ord")(nil))(cons(nil)(cons(nil)(nil))))(tfns(cons(map01)(cons(tfn(g1)(g2))(nil)))(tmap(g0)(g2)))))(cons($co("map/merge")(kv(tfns(cons(map01)(cons(map01)(nil)))(map01))))(cons($co("map/values")(kv(tfns(cons(map01)(nil))(tapp(tlist)(g1)(-1)))))(cons($co("map/keys")(kv(tfns(cons(map01)(nil))(tapp(tlist)(g0)(-1)))))(cons($co("map/to-list")(kv(tfns(cons(map01)(nil))(tapp(tlist)(mkpair(g0)(g1))(-1)))))(cons($co("map/from-list")(kv(tfns(cons(tapp(tlist)(mkpair(g0)(g1))(-1))(nil))(map01))))(cons($co("nil")(g(cons(nil)(nil))(mklist(g0))))(cons($co("cons")(g(cons(nil)(nil))(tfns(cons(g0)(cons(mklist(g0))(nil)))(mklist(g0)))))(cons($co(",")(g(cons(nil)(cons(nil)(nil)))(tfns(cons(g0)(cons(g1)(nil)))(mkpair(g0)(g1)))))(cons($co("false")(con(tbool)))(cons($co("true")(con(tbool)))(cons($co("ok")(g(cons(nil)(cons(nil)(nil)))(tfn(g0)(tresult(g0)(g1)))))(cons($co("err")(g(cons(nil)(cons(nil)(nil)))(tfn(g1)(tresult(g0)(g1)))))(cons($co("LT")(con(mkcon("ordering"))))(cons($co("EQ")(con(mkcon("ordering"))))(cons($co("GT")(con(mkcon("ordering"))))(nil)))))))))))))))))))))))))))))))))))))))))))))))))))))))))
}
}
}
}
}
}
}
}
}
})()
let tss_$gts = (tss) => joinor("\n")("no tss")(map(dot(joinor("; ")("[empty]"))(map(type_$gts)))(tss))
let vps_$gts = (vps) => joinor("\n")("no vps")(map(({"1": preds, "0": a}) => `${tyvar_$gts(a)} is in predicates: ${join(";")(map(pred_$gts)(preds))}`)(vps))
let builtin_tenv = type_env(map$slfrom_list(cons($co("ok")(tuple_scheme(generics(cons(nil)(cons(nil)(nil)))(tfn(g0)(tresult(g0)(g1))))))(cons($co("err")(tuple_scheme(generics(cons(nil)(cons(nil)(nil)))(tfn(g1)(tresult(g0)(g1))))))(cons($co("cons")(tuple_scheme(generics(cons(nil)(nil))(tfns(cons(g0)(cons(mklist(g0))(nil)))(mklist(g0))))))(cons($co("nil")(tuple_scheme(generics(cons(nil)(nil))(mklist(g0)))))(cons($co(",")(tuple_scheme(generics(cons(nil)(cons(nil)(nil)))(tfns(cons(g0)(cons(g1)(nil)))(mkpair(g0)(g1))))))(nil)))))))(map$slfrom_list(cons($co("int")($co(nil)(set$slnil)))(cons($co("double")($co(nil)(set$slnil)))(cons($co("list")($co(cons(star)(nil))(set$slfrom_list(cons("cons")(cons("nil")(nil))))))(cons($co("result")($co(cons(star)(cons(star)(nil)))(set$slfrom_list(cons("ok")(cons("err")(nil))))))(nil))))))(map$slnil)
let unify_err = (t1) => (t2) => ({"1": items, "0": msg}) => err($co(`Unable to unify -> ${msg}`)(cons($co(type_loc(t1))(type_debug_$gts(t1)))(cons($co(type_loc(t2))(type_debug_$gts(t2)))(items))))
let split_stmts = (stmts) => (sdefs) => (stypes) => (salias) => (sexps) => (sinst) => (($target) => {
if ($target.type === "nil") {
return $co(sdefs)($co(stypes)($co(salias)($co(sexps)(sinst))))
} ;
if ($target.type === "cons") {
let one = $target[0];
let rest = $target[1];
{
let $target = one;
if ($target.type === "sdef") {
return split_stmts(rest)(cons(one)(sdefs))(stypes)(salias)(sexps)(sinst)
} ;
if ($target.type === "sdeftype") {
return split_stmts(rest)(sdefs)(cons(one)(stypes))(salias)(sexps)(sinst)
} ;
if ($target.type === "sdefinstance") {
return split_stmts(rest)(sdefs)(stypes)(salias)(sexps)(cons(one)(sinst))
} ;
if ($target.type === "stypealias") {
let name = $target[0];
let args = $target[2];
let body = $target[3];
return split_stmts(rest)(sdefs)(stypes)(cons($co$co(name)(args)(body))(salias))(sexps)(sinst)
} ;
if ($target.type === "sexpr") {
let expr = $target[0];
return split_stmts(rest)(sdefs)(stypes)(salias)(cons(expr)(sexps))(sinst)
} ;
throw new Error('match fail 21478:' + JSON.stringify($target))
}
} ;
throw new Error('match fail 21464:' + JSON.stringify($target))
})(stmts)
let full_env$slmerge = ({"2": c, "1": b, "0": a}) => ({"2": f, "1": e, "0": d}) => full_env(tenv$slmerge(a)(d))(class_env$slmerge(b)(e))(concat(cons(c)(cons(f)(nil))))
let externals = (bound) => (expr) => (($target) => {
if ($target.type === "evar") {
let name = $target[0];
let l = $target[1];
{
let $target = set$slhas(bound)(name);
if ($target === true) {
return empty
} ;
return one($co$co(name)(value)(l));
throw new Error('match fail 22708:' + JSON.stringify($target))
}
} ;
if ($target.type === "eprim") {
let prim = $target[0];
let l = $target[1];
return empty
} ;
if ($target.type === "estr") {
let first = $target[0];
let templates = $target[1];
let int = $target[2];
return many(map((arg) => (($target) => {
if ($target.type === ",,") {
let expr = $target[0];
return externals(bound)(expr)
} ;
throw new Error('match fail 22744:' + JSON.stringify($target))
})(arg))(templates))
} ;
if ($target.type === "equot") {
let expr = $target[0];
let int = $target[1];
return empty
} ;
if ($target.type === "elambda") {
let pats = $target[0];
let body = $target[1];
let int = $target[2];
return bag$sland(foldl(empty)(map(pat_externals)(pats))(bag$sland))(externals(foldl(bound)(map(pat_names)(pats))(set$slmerge))(body))
} ;
if ($target.type === "elet") {
if ($target[0].type === ",") {
let explicit = $target[0][0];
let inferred = $target[0][1];
let body = $target[1];
let l = $target[2];
{
let bound$0 = bound;
{
let {"1": bound, "0": bag} = foldl($co(empty)(bound$0))(inferred)(({"1": bound, "0": bag}) => (items) => foldl($co(bag)(bound))(items)(({"1": bound, "0": bag}) => ({"1": alts, "0": name}) => foldl($co(bag)(bound))(alts)(({"1": bound, "0": bag}) => ({"1": init, "0": pats}) => $co(foldl(bag)(map(pat_externals)(pats))(bag$sland))(foldl(bound)(map(pat_names)(pats))(set$slmerge)))));
return bag$sland(bag)(externals(bound)(body))
}
}
} 
} ;
if ($target.type === "eapp") {
let target = $target[0];
let args = $target[1];
let int = $target[2];
return bag$sland(externals(bound)(target))(foldl(empty)(map(externals(bound))(args))(bag$sland))
} ;
if ($target.type === "ematch") {
let expr = $target[0];
let cases = $target[1];
let int = $target[2];
return bag$sland(externals(bound)(expr))(foldl(empty)(cases)((bag) => (arg) => (($target) => {
if ($target.type === ",") {
let pat = $target[0];
let body = $target[1];
return bag$sland(bag$sland(bag)(pat_externals(pat)))(externals(set$slmerge(bound)(pat_names(pat)))(body))
} ;
throw new Error('match fail 22885:' + JSON.stringify($target))
})(arg)))
} ;
throw new Error('match fail 22701:' + JSON.stringify($target))
})(expr)
let names = (stmt) => (($target) => {
if ($target.type === "sdef") {
let name = $target[0];
let l = $target[1];
return cons($co$co(name)(value)(l))(nil)
} ;
if ($target.type === "sexpr") {
return nil
} ;
if ($target.type === "stypealias") {
let name = $target[0];
let l = $target[1];
return cons($co$co(name)(type)(l))(nil)
} ;
if ($target.type === "sdefinstance") {
let name = $target[0];
return nil
} ;
if ($target.type === "sdeftype") {
let name = $target[0];
let l = $target[1];
let constructors = $target[3];
return cons($co$co(name)(type)(l))(map(({"1": l, "0": name}) => $co$co(name)(value)(l))(constructors))
} ;
throw new Error('match fail 23064:' + JSON.stringify($target))
})(stmt)
let externals_stmt = (stmt) => bag$slto_list((($target) => {
if ($target.type === "sdeftype") {
let string = $target[0];
let int = $target[1];
let free = $target[2];
let constructors = $target[3];
let l = $target[4];
{
let frees = set$slfrom_list(map(fst)(free));
return many(map(({"2": args, "1": l, "0": name}) => (($target) => {
if ($target.type === "nil") {
return empty
} ;
return many(map(externals_type(frees))(args));
throw new Error('match fail 23174:' + JSON.stringify($target))
})(args))(constructors))
}
} ;
if ($target.type === "sdefinstance") {
let name = $target[0];
let nl = $target[1];
let type = $target[2];
let preds = $target[3];
let items = $target[4];
let l = $target[5];
return bag$sland(one($co$co(name)(tcls)(nl)))(many(map(({"2": fn, "1": nl, "0": name}) => externals(set$slnil)(fn))(items)))
} ;
if ($target.type === "stypealias") {
let name = $target[0];
let nl = $target[1];
let args = $target[2];
let body = $target[3];
let l = $target[4];
{
let frees = set$slfrom_list(map(fst)(args));
return externals_type(frees)(body)
}
} ;
if ($target.type === "sdef") {
let name = $target[0];
let nl = $target[1];
let body = $target[2];
let l = $target[3];
return externals(set$sladd(set$slnil)(name))(body)
} ;
if ($target.type === "sexpr") {
let expr = $target[0];
let l = $target[1];
return externals(set$slnil)(expr)
} ;
throw new Error('match fail 23140:' + JSON.stringify($target))
})(stmt))
let full_env$slnil = full_env(type_env$slnil)(class_env$slnil)(nil)
let scheme_$gts = ({"1": {"1": t, "0": preds}, "0": kinds}) => `${(($target) => {
if ($target.type === "nil") {
return ""
} ;
return `${join(" ")(map(kind_$gts)(kinds))}; `;
throw new Error('match fail 23745:' + JSON.stringify($target))
})(kinds)}${(($target) => {
if ($target.type === "nil") {
return ""
} ;
return `${join(" ")(map(pred_$gts)(preds))}; `;
throw new Error('match fail 23774:' + JSON.stringify($target))
})(preds)}${type_$gts(t)}`
let qual_$gts = (t_$gts) => ({"1": t, "0": preds}) => `${(($target) => {
if ($target.type === "nil") {
return ""
} ;
return `${join("; ")(map(pred_$gts)(preds))} |=> `;
throw new Error('match fail 23867:' + JSON.stringify($target))
})(preds)}${t_$gts(t)}`
let type$slvalid$qe = (type) => (($target) => {
if ($target.type === "tcon") {
return true
} ;
if ($target.type === "tvar") {
return true
} ;
if ($target.type === "tapp") {
let t = $target[0];
let arg = $target[1];
{
let $target = type$slkind(t);
if ($target.type === "kfun") {
let ka = $target[0];
let res = $target[1];
{
let $target = type$slvalid$qe(t);
if ($target === true) {
{
let $target = type$slvalid$qe(arg);
if ($target === true) {
return kind$eq(ka)(type$slkind(arg))
} ;
return false;
throw new Error('match fail 24080:' + JSON.stringify($target))
}
} ;
return false;
throw new Error('match fail 24062:' + JSON.stringify($target))
}
} ;
return false;
throw new Error('match fail 24053:' + JSON.stringify($target))
}
} ;
throw new Error('match fail 24035:' + JSON.stringify($target))
})(type)
let analysis = (v0) => (v1) => (v2) => ({type: "analysis", 0: v0, 1: v1, 2: v2})
let inferator = (v0) => (v1) => (v2) => (v3) => (v4) => (v5) => (v6) => ({type: "inferator", 0: v0, 1: v1, 2: v2, 3: v3, 4: v4, 5: v5, 6: v6})
let parser = (v0) => (v1) => (v2) => (v3) => ({type: "parser", 0: v0, 1: v1, 2: v2, 3: v3})
let expr_loc = (expr) => (($target) => {
if ($target.type === "estr") {
let l = $target[2];
return l
} ;
if ($target.type === "eprim") {
let l = $target[1];
return l
} ;
if ($target.type === "evar") {
let l = $target[1];
return l
} ;
if ($target.type === "equotquot") {
let l = $target[1];
return l
} ;
if ($target.type === "equot") {
let l = $target[1];
return l
} ;
if ($target.type === "equot/stmt") {
let l = $target[1];
return l
} ;
if ($target.type === "equot/pat") {
let l = $target[1];
return l
} ;
if ($target.type === "equot/type") {
let l = $target[1];
return l
} ;
if ($target.type === "elambda") {
let l = $target[2];
return l
} ;
if ($target.type === "elet") {
let l = $target[2];
return l
} ;
if ($target.type === "eapp") {
let l = $target[2];
return l
} ;
if ($target.type === "ematch") {
let l = $target[2];
return l
} ;
throw new Error('match fail 24566:' + JSON.stringify($target))
})(expr)
let compile = (expr) => (trace) => {
let loc = expr_loc(expr);
return trace_wrap(loc)(trace)((($target) => {
if ($target.type === "estr") {
let first = $target[0];
let tpls = $target[1];
let l = $target[2];
{
let $target = tpls;
if ($target.type === "nil") {
return `\"${escape_string(unescapeString(first))}\"`
} ;
return `\`${escape_string(unescapeString(first))}${join("")(mapr(tpls)((item) => {
let {"2": l, "1": suffix, "0": expr} = item;
return `\${${compile(expr)(trace)}}${escape_string(unescapeString(suffix))}`
}))}\``;
throw new Error('match fail 25154:' + JSON.stringify($target))
}
} ;
if ($target.type === "eprim") {
let prim = $target[0];
let l = $target[1];
{
let $target = prim;
if ($target.type === "pint") {
let int = $target[0];
return int_to_string(int)
} ;
if ($target.type === "pfloat") {
let float = $target[0];
return jsonify(float)
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
throw new Error('match fail 25234:' + JSON.stringify($target))
}
} ;
throw new Error('match fail 25213:' + JSON.stringify($target))
}
} ;
if ($target.type === "evar") {
let name = $target[0];
let l = $target[1];
return sanitize(name)
} ;
if ($target.type === "equot") {
let inner = $target[0];
let l = $target[1];
return jsonify(inner)
} ;
if ($target.type === "equot/stmt") {
let inner = $target[0];
let l = $target[1];
return jsonify(inner)
} ;
if ($target.type === "equot/type") {
let inner = $target[0];
let l = $target[1];
return jsonify(inner)
} ;
if ($target.type === "equot/pat") {
let inner = $target[0];
let l = $target[1];
return jsonify(inner)
} ;
if ($target.type === "equotquot") {
let inner = $target[0];
let l = $target[1];
return jsonify(inner)
} ;
if ($target.type === "elambda") {
let pats = $target[0];
let body = $target[1];
let l = $target[2];
return `function lambda_${its(l)}(${join(`) { return function lambda_${its(l)}(`)(mapi((pat) => (i) => orr(`_${int_to_string(i)}`)(just_pat(pat)))(0)(pats))}) { return ${compile(body)(trace)} ${join("")(map((_26161) => "}")(pats))}`
} ;
if ($target.type === "elet") {
if ($target[0].type === ",") {
if ($target[0][0].type === "nil") {
let inferred = $target[0][1];
let body = $target[1];
let l = $target[2];
return foldl(compile(body)(trace))(concat(inferred))((body) => ({"1": {"0": {"1": init}}, "0": name}) => `(function let_${its(l)}() {const ${sanitize(name)} = ${compile(init)(trace)};\n${`return ${body}`};\nthrow new Error('let pattern not matched. ' + valueToString(\$target));\n})()`)
} 
} 
} ;
if ($target.type === "eapp") {
let fn = $target[0];
let args = $target[1];
let l = $target[2];
{
let args$0 = args;
{
let args = join(")(")(map((arg) => compile(arg)(trace))(args$0));
{
let $target = fn;
if ($target.type === "elambda") {
return `(${compile(fn)(trace)})(${args})`
} ;
return `${compile(fn)(trace)}(${args})`;
throw new Error('match fail 25375:' + JSON.stringify($target))
}
}
}
} ;
if ($target.type === "ematch") {
let target = $target[0];
let cases = $target[1];
let l = $target[2];
return `(function match_${its(l)}(\$target) {\n${join("\n")(mapr(cases)(($case) => {
let {"1": body, "0": pat} = $case;
return compile_pat(pat)("\$target")(`return ${compile(body)(trace)}`)(trace)
}))}\nthrow new Error('failed to match ' + jsonify(\$target) + '. Loc: ${its(l)}');\n})(${compile(target)(trace)})`
} ;
throw new Error('match fail 25146:' + JSON.stringify($target))
})(expr))
}
let compile_stmt = (stmt) => (trace) => (($target) => {
if ($target.type === "sexpr") {
let expr = $target[0];
let l = $target[1];
return compile(expr)(trace)
} ;
if ($target.type === "sdef") {
let name = $target[0];
let nl = $target[1];
let body = $target[2];
let l = $target[3];
return $pl$pl(cons("const ")(cons(sanitize(name))(cons(" = ")(cons(compile(body)(trace))(cons(";\n")(nil))))))
} ;
if ($target.type === "stypealias") {
return "/* type alias */"
} ;
if ($target.type === "sdefinstance") {
let name = $target[0];
let nl = $target[1];
let type = $target[2];
let preds = $target[3];
let inst_fns = $target[4];
let l = $target[5];
return `\$_.registerInstance(\"${name}\", ${its(l)}, {${join(", ")(map(({"2": fn, "1": l, "0": name}) => `${sanitize(name)}: ${compile(fn)(trace)}`)(inst_fns))}})`
} ;
if ($target.type === "sdeftype") {
let name = $target[0];
let nl = $target[1];
let type_arg = $target[2];
let cases = $target[3];
let l = $target[4];
return join("\n")(mapr(cases)(($case) => {
let {"3": l, "2": args, "1": nl, "0": name2} = $case;
return $pl$pl(cons("const ")(cons(sanitize(name2))(cons(" = ")(cons($pl$pl(mapi((_25821) => (i) => $pl$pl(cons("(v")(cons(int_to_string(i))(cons(") => ")(nil)))))(0)(args)))(cons("({type: \"")(cons(name2)(cons("\"")(cons($pl$pl(mapi((_25847) => (i) => $pl$pl(cons(", ")(cons(int_to_string(i))(cons(": v")(cons(int_to_string(i))(nil))))))(0)(args)))(cons("});")(nil))))))))))
}))
} ;
throw new Error('match fail 25744:' + JSON.stringify($target))
})(stmt)
let to_hnfs = (ce) => (ps) => (($target) => {
if ($target.type === "err") {
let e = $target[0];
return err(e)
} ;
if ($target.type === "ok") {
let v = $target[0];
return ok(concat(v))
} ;
throw new Error('match fail 8289:' + JSON.stringify($target))
})(map$slok(to_hnf(ce))(ps))

let to_hnf = (ce) => (p) => (($target) => {
if ($target === true) {
return ok(cons(p)(nil))
} ;
{
let $target = by_inst(ce)(p);
if ($target.type === "none") {
{
let {"1": type, "0": name} = p;
return err($co(`Can't find an instance for class '${name}' for type ${type_$gts(type)}`)(nil))
}
} ;
if ($target.type === "some") {
let ps = $target[0];
return to_hnfs(ce)(ps)
} ;
throw new Error('match fail 8270:' + JSON.stringify($target))
};
throw new Error('match fail 8261:' + JSON.stringify($target))
})(in_hnf(p))
let parse_expr = (cst) => (($target) => {
if ($target.type === "cst/identifier") {
if ($target[0] === "true") {
let l = $target[1];
return eprim(pbool(true)(l))(l)
} 
} ;
if ($target.type === "cst/identifier") {
if ($target[0] === "false") {
let l = $target[1];
return eprim(pbool(false)(l))(l)
} 
} ;
if ($target.type === "cst/string") {
let first = $target[0];
let templates = $target[1];
let l = $target[2];
return estr(first)(map((tpl) => {
let {"2": l, "1": string, "0": expr} = tpl;
return $co$co(parse_expr(expr))(string)(l)
})(templates))(l)
} ;
if ($target.type === "cst/identifier") {
let id = $target[0];
let l = $target[1];
{
let $target = string_to_int(id);
if ($target.type === "some") {
let int = $target[0];
return eprim(pint(int)(l))(l)
} ;
if ($target.type === "none") {
{
let $target = string_to_float(id);
if ($target.type === "some") {
let v = $target[0];
return eprim(pfloat(v)(l))(l)
} ;
return evar(id)(l);
throw new Error('match fail 20375:' + JSON.stringify($target))
}
} ;
throw new Error('match fail 11246:' + JSON.stringify($target))
}
} ;
if ($target.type === "cst/list") {
if ($target[0].type === "cons") {
if ($target[0][0].type === "cst/identifier") {
if ($target[0][0][0] === "@") {
if ($target[0][1].type === "cons") {
let body = $target[0][1][0];
if ($target[0][1][1].type === "nil") {
let l = $target[1];
return equot(parse_expr(body))(l)
} 
} 
} 
} 
} 
} ;
if ($target.type === "cst/list") {
if ($target[0].type === "cons") {
if ($target[0][0].type === "cst/identifier") {
if ($target[0][0][0] === "@@") {
if ($target[0][1].type === "cons") {
let body = $target[0][1][0];
if ($target[0][1][1].type === "nil") {
let l = $target[1];
return equotquot(body)(l)
} 
} 
} 
} 
} 
} ;
if ($target.type === "cst/list") {
if ($target[0].type === "cons") {
if ($target[0][0].type === "cst/identifier") {
if ($target[0][0][0] === "@!") {
if ($target[0][1].type === "cons") {
let body = $target[0][1][0];
if ($target[0][1][1].type === "nil") {
let l = $target[1];
return equot$slstmt(parse_stmt(body))(l)
} 
} 
} 
} 
} 
} ;
if ($target.type === "cst/list") {
if ($target[0].type === "cons") {
if ($target[0][0].type === "cst/identifier") {
if ($target[0][0][0] === "@t") {
if ($target[0][1].type === "cons") {
let body = $target[0][1][0];
if ($target[0][1][1].type === "nil") {
let l = $target[1];
return equot$sltype(parse_type(body))(l)
} 
} 
} 
} 
} 
} ;
if ($target.type === "cst/list") {
if ($target[0].type === "cons") {
if ($target[0][0].type === "cst/identifier") {
if ($target[0][0][0] === "@p") {
if ($target[0][1].type === "cons") {
let body = $target[0][1][0];
if ($target[0][1][1].type === "nil") {
let l = $target[1];
return equot$slpat(parse_pat(body))(l)
} 
} 
} 
} 
} 
} ;
if ($target.type === "cst/list") {
if ($target[0].type === "cons") {
if ($target[0][0].type === "cst/identifier") {
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
if ($target[0][0].type === "cst/identifier") {
if ($target[0][0][0] === "fn") {
if ($target[0][1].type === "cons") {
if ($target[0][1][0].type === "cst/array") {
let args = $target[0][1][0][0];
if ($target[0][1][1].type === "cons") {
let body = $target[0][1][1][0];
if ($target[0][1][1][1].type === "nil") {
let b = $target[1];
return elambda(map(parse_pat)(args))(parse_expr(body))(b)
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
if ($target[0][0].type === "cst/identifier") {
if ($target[0][0][0] === "fn") {
let l = $target[1];
return fatal(`Invalid 'fn' ${int_to_string(l)}`)
} 
} 
} 
} ;
if ($target.type === "cst/list") {
if ($target[0].type === "cons") {
if ($target[0][0].type === "cst/identifier") {
if ($target[0][0][0] === "match") {
if ($target[0][1].type === "cons") {
let target = $target[0][1][0];
let cases = $target[0][1][1];
let l = $target[1];
return ematch(parse_expr(target))(map(($case) => {
let {"1": expr, "0": pat} = $case;
return $co(parse_pat(pat))(parse_expr(expr))
})(pairs(cases)))(l)
} 
} 
} 
} 
} ;
if ($target.type === "cst/list") {
if ($target[0].type === "cons") {
if ($target[0][0].type === "cst/identifier") {
if ($target[0][0][0] === "let") {
if ($target[0][1].type === "cons") {
if ($target[0][1][0].type === "cst/array") {
let inits = $target[0][1][0][0];
if ($target[0][1][1].type === "cons") {
let body = $target[0][1][1][0];
if ($target[0][1][1][1].type === "nil") {
let l = $target[1];
return foldr(parse_expr(body))(pairs(inits))((body) => (init) => {
let {"1": value, "0": pat} = init;
{
let $target = pat;
if ($target.type === "cst/identifier") {
let name = $target[0];
let l = $target[1];
return elet($co(nil)(cons(cons($co(name)(cons($co(nil)(parse_expr(value)))(nil)))(nil))(nil)))(body)(l)
} ;
return ematch(parse_expr(value))(cons($co(parse_pat(pat))(body))(nil))(l);
throw new Error('match fail 15660:' + JSON.stringify($target))
}
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
if ($target[0][0].type === "cst/identifier") {
if ($target[0][0][0] === "letrec") {
if ($target[0][1].type === "cons") {
if ($target[0][1][0].type === "cst/array") {
let inits = $target[0][1][0][0];
if ($target[0][1][1].type === "cons") {
let body = $target[0][1][1][0];
if ($target[0][1][1][1].type === "nil") {
let l = $target[1];
return elet($co(nil)(cons(map(({"1": value, "0": pat}) => (($target) => {
if ($target.type === "cst/identifier") {
let name = $target[0];
let l = $target[1];
return $co(name)(cons($co(nil)(parse_expr(value)))(nil))
} ;
throw new Error('match fail 15645:' + JSON.stringify($target))
})(pat))(pairs(inits)))(nil)))(parse_expr(body))(l)
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
if ($target[0][0].type === "cst/identifier") {
if ($target[0][0][0] === "let->") {
if ($target[0][1].type === "cons") {
if ($target[0][1][0].type === "cst/array") {
let inits = $target[0][1][0][0];
if ($target[0][1][1].type === "cons") {
let body = $target[0][1][1][0];
if ($target[0][1][1][1].type === "nil") {
let l = $target[1];
return foldr(parse_expr(body))(pairs(inits))((body) => (init) => {
let {"1": value, "0": pat} = init;
return eapp(parse_expr(value))(cons(elambda(cons(parse_pat(pat))(nil))(body)(l))(nil))(l)
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
if ($target[0][0].type === "cst/identifier") {
if ($target[0][0][0] === "let") {
let l = $target[1];
return fatal(`Invalid 'let' ${int_to_string(l)}`)
} 
} 
} 
} ;
if ($target.type === "cst/list") {
if ($target[0].type === "cons") {
let target = $target[0][0];
let args = $target[0][1];
let l = $target[1];
{
let $target = args;
if ($target.type === "nil") {
return parse_expr(target)
} ;
return eapp(parse_expr(target))(map(parse_expr)(args))(l);
throw new Error('match fail 26566:' + JSON.stringify($target))
}
} 
} ;
if ($target.type === "cst/list") {
if ($target[0].type === "nil") {
let l = $target[1];
return evar("()")(l)
} 
} ;
if ($target.type === "cst/array") {
let args = $target[0];
let l = $target[1];
return parse_array(args)(l)
} ;
throw new Error('match fail 11183:' + JSON.stringify($target))
})(cst)

let parse_stmt = (cst) => (($target) => {
if ($target.type === "cst/list") {
if ($target[0].type === "cons") {
if ($target[0][0].type === "cst/identifier") {
if ($target[0][0][0] === "def") {
if ($target[0][1].type === "cons") {
if ($target[0][1][0].type === "cst/identifier") {
let id = $target[0][1][0][0];
let li = $target[0][1][0][1];
if ($target[0][1][1].type === "cons") {
let value = $target[0][1][1][0];
if ($target[0][1][1][1].type === "nil") {
let l = $target[1];
return sdef(id)(li)(parse_expr(value))(l)
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
if ($target[0][0].type === "cst/identifier") {
if ($target[0][0][0] === "defn") {
let a = $target[0][0][1];
if ($target[0][1].type === "cons") {
if ($target[0][1][0].type === "cst/identifier") {
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
} ;
if ($target.type === "cst/list") {
if ($target[0].type === "cons") {
if ($target[0][0].type === "cst/identifier") {
if ($target[0][0][0] === "defn") {
let l = $target[1];
return fatal(`Invalid 'defn' ${int_to_string(l)}`)
} 
} 
} 
} ;
if ($target.type === "cst/list") {
if ($target[0].type === "cons") {
if ($target[0][0].type === "cst/identifier") {
if ($target[0][0][0] === "deftype") {
if ($target[0][1].type === "cons") {
if ($target[0][1][0].type === "cst/identifier") {
let id = $target[0][1][0][0];
let li = $target[0][1][0][1];
let items = $target[0][1][1];
let l = $target[1];
return mk_deftype(id)(li)(nil)(items)(l)
} 
} 
} 
} 
} 
} ;
if ($target.type === "cst/list") {
if ($target[0].type === "cons") {
if ($target[0][0].type === "cst/identifier") {
if ($target[0][0][0] === "deftype") {
if ($target[0][1].type === "cons") {
if ($target[0][1][0].type === "cst/list") {
if ($target[0][1][0][0].type === "cons") {
if ($target[0][1][0][0][0].type === "cst/identifier") {
let id = $target[0][1][0][0][0][0];
let li = $target[0][1][0][0][0][1];
let args = $target[0][1][0][0][1];
let items = $target[0][1][1];
let l = $target[1];
return mk_deftype(id)(li)(args)(items)(l)
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
if ($target[0][0].type === "cst/identifier") {
if ($target[0][0][0] === "deftype") {
let l = $target[1];
return fatal(`Invalid 'deftype' ${int_to_string(l)}`)
} 
} 
} 
} ;
if ($target.type === "cst/list") {
if ($target[0].type === "cons") {
if ($target[0][0].type === "cst/identifier") {
if ($target[0][0][0] === "definstance") {
if ($target[0][1].type === "cons") {
if ($target[0][1][0].type === "cst/list") {
if ($target[0][1][0][0].type === "cons") {
if ($target[0][1][0][0][0].type === "cst/identifier") {
let cls = $target[0][1][0][0][0][0];
let cl = $target[0][1][0][0][0][1];
if ($target[0][1][0][0][1].type === "cons") {
let typ = $target[0][1][0][0][1][0];
if ($target[0][1][0][0][1][1].type === "nil") {
if ($target[0][1][1].type === "cons") {
if ($target[0][1][1][0].type === "cst/record") {
let items = $target[0][1][1][0][0];
if ($target[0][1][1][1].type === "nil") {
let l = $target[1];
return sdefinstance(cls)(cl)(fix_kinds(star)(parse_type(typ)))(nil)(map(({"1": value, "0": name}) => (($target) => {
if ($target.type === "cst/identifier") {
let name = $target[0];
let l = $target[1];
return $co$co(name)(l)(parse_expr(value))
} ;
return fatal("Invalid record name");
throw new Error('match fail 26323:' + JSON.stringify($target))
})(name))(pairs(items)))(l)
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
} ;
if ($target.type === "cst/list") {
if ($target[0].type === "cons") {
if ($target[0][0].type === "cst/identifier") {
if ($target[0][0][0] === "definstance") {
if ($target[0][1].type === "cons") {
if ($target[0][1][0].type === "cst/list") {
if ($target[0][1][0][0].type === "cons") {
if ($target[0][1][0][0][0].type === "cst/identifier") {
if ($target[0][1][0][0][0][0] === "=>") {
let predlist = $target[0][1][0][0][1];
if ($target[0][1][1].type === "cons") {
if ($target[0][1][1][0].type === "cst/record") {
let items = $target[0][1][1][0][0];
if ($target[0][1][1][1].type === "nil") {
let l = $target[1];
{
let {"1": {"1": typ, "0": name}, "0": preds} = splitlast(map((pred) => (($target) => {
if ($target.type === "cst/list") {
if ($target[0].type === "cons") {
if ($target[0][0].type === "cst/identifier") {
let cls = $target[0][0][0];
let cl = $target[0][0][1];
if ($target[0][1].type === "cons") {
let typ = $target[0][1][0];
if ($target[0][1][1].type === "nil") {
return isin(cls)(fix_kinds(star)(parse_type(typ)))
} 
} 
} 
} 
} ;
return fatal(`Invalid predicate ${its(l)}`);
throw new Error('match fail 26438:' + JSON.stringify($target))
})(pred))(predlist));
return sdefinstance(name)(l)(typ)(preds)(map(({"1": value, "0": name}) => (($target) => {
if ($target.type === "cst/identifier") {
let name = $target[0];
let l = $target[1];
return $co$co(name)(l)(parse_expr(value))
} ;
return fatal("Invalid record name");
throw new Error('match fail 26484:' + JSON.stringify($target))
})(name))(pairs(items)))(l)
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
} ;
return sexpr(parse_expr(cst))((($target) => {
if ($target.type === "cst/list") {
let l = $target[1];
return l
} ;
if ($target.type === "cst/identifier") {
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
throw new Error('match fail 29221:' + JSON.stringify($target))
})(cst));
throw new Error('match fail 12510:' + JSON.stringify($target))
})(cst)

let parse_array = (args) => (l) => (($target) => {
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
return eapp(evar("cons")(l))(cons(parse_expr(one))(cons(parse_array(rest)(l))(nil)))(l)
} ;
throw new Error('match fail 11681:' + JSON.stringify($target))
})(args)
let add_inst = (preconditions) => (inst_pred) => ({"1": defaults, "0": classes}) => {
let {"0": class_name} = inst_pred;
{
let $target = map$slget(classes)(class_name);
if ($target.type === "none") {
return fatal(`no class '${class_name}' found, when trying to add instance. Known classes: ${join(", ")(map$slkeys(classes))}`)
} ;
if ($target.type === "some") {
if ($target[0].type === ",") {
let c_supers = $target[0][0];
if ($target[0][1].type === ",") {
let c_instances = $target[0][1][0];
let fns = $target[0][1][1];
{
let c = $co(c_supers)($co(cons($eq$gt(preconditions)(inst_pred))(c_instances))(fns));
{
let qs = map(({"1": q}) => q)(c_instances);
{
let $target = find(qs)(overlap(inst_pred));
if ($target.type === "some") {
let other = $target[0];
return fatal(`overlapping instance: ${pred_$gts(inst_pred)} and ${pred_$gts(other)}`)
} ;
return class_env(map$slset(classes)(class_name)(c))(defaults);
throw new Error('match fail 7547:' + JSON.stringify($target))
}
}
}
} 
} 
} ;
throw new Error('match fail 7348:' + JSON.stringify($target))
}
}
let example_insts = cons(add_inst(nil)(isin("ord")(tunit)))(cons(add_inst(nil)(isin("ord")(tchar)))(cons(add_inst(nil)(isin("integral")(tint)))(cons(add_inst(nil)(isin("num")(tint)))(cons(add_inst(nil)(isin("floating")(tfloat)))(cons(add_inst(cons(isin("ord")(tvar(tyvar("a")(star))(-1)))(cons(isin("ord")(tvar(tyvar("b")(star))(-1)))(nil)))(isin("ord")(mkpair(tvar(tyvar("a")(star))(-1))(tvar(tyvar("b")(star))(-1)))))(nil))))))
let reduce = (ce) => (ps) => (($target) => {
if ($target.type === "ok") {
let qs = $target[0];
return ok(simplify(ce)(qs))
} ;
if ($target.type === "err") {
let e = $target[0];
return err(e)
} ;
throw new Error('match fail 8509:' + JSON.stringify($target))
})(to_hnfs(ce)(ps))
let withDefaults = (f) => (ce) => (known_variables) => (predicates) => {
let vps = ambiguities(ce)(known_variables)(predicates);
{
let tss = map(candidates(ce))(vps);
{
let $target = any(is_empty)(tss);
if ($target === true) {
return err($co(`Cannot resolve ambiguities: ${vps_$gts(vps)} defaults for variables: ${tss_$gts(tss)} with known variables: ${join("; ")(map(tyvar_$gts)(known_variables))}`)(nil))
} ;
return ok(f(vps)(map(head)(tss)));
throw new Error('match fail 14212:' + JSON.stringify($target))
}
}
}
let defaultedPreds = withDefaults((vps) => (ts) => concat(map(snd)(vps)))
let defaultSubst = withDefaults((vps) => (ts) => map$slfrom_list(zip(map(fst)(vps))(ts)))
let assump_$gts = ({"1": {"1": {"1": type, "0": preds}, "0": kinds}, "0": name}) => `${name}: ${(($target) => {
if ($target.type === "nil") {
return ""
} ;
return `${join("; ")(mapi((kind) => (i) => `${gen_name(i)} ${kind_$gts(kind)}`)(0)(kinds))}; `;
throw new Error('match fail 16085:' + JSON.stringify($target))
})(kinds)}${(($target) => {
if ($target.type === "nil") {
return ""
} ;
return `${join("; ")(map(pred_$gts)(preds))}; `;
throw new Error('match fail 16095:' + JSON.stringify($target))
})(preds)}${type_$gts(type)}`
let assumps_$gts = dot(join("\n"))(map(assump_$gts))
let builtin_env = apply_transformers(example_insts)(add_prelude_classes(initial_env))
let parse_binding = (jcst) => (($target) => {
if ($target.type === "cst/list") {
if ($target[0].type === "cons") {
if ($target[0][0].type === "cst/identifier") {
if ($target[0][0][0] === "fn") {
let l = $target[0][0][1];
if ($target[0][1].type === "cons") {
if ($target[0][1][0].type === "cst/array") {
let items = $target[0][1][0][0];
if ($target[0][1][1].type === "cons") {
let body = $target[0][1][1][0];
if ($target[0][1][1][1].type === "nil") {
return $co("it")(cons($co(map(parse_pat)(items))(parse_expr(body)))(nil))
} 
} 
} 
} 
} 
} 
} 
} ;
return $co("it")(cons($co(nil)(parse_expr(jcst)))(nil));
throw new Error('match fail 19486:' + JSON.stringify($target))
})(jcst)
let program_results_$gts = ({"1": result, "0": {"3": subst, "2": tenv, "1": types, "0": a}}) => (($target) => {
if ($target.type === "ok") {
let b = $target[0];
return join("\n")(map(assump_$gts)(b))
} ;
if ($target.type === "err") {
let e = $target[0];
return `Error! ${type_error_$gts(e)}`
} ;
throw new Error('match fail 26977:' + JSON.stringify($target))
})(result)
let builtin_ce = apply_transformers(map(({"1": qt, "0": kinds}) => {
let tvars = mapi((tv) => (i) => tvar(tyvar(gen_name(i))(tv))(-1))(0)(kinds);
{
let {"1": assertion, "0": preconditions} = inst$slqual(tvars)(inst$slpred)(qt);
return add_inst(preconditions)(assertion)
}
})(builtin_instances))(add_prelude_classes(initial_env))
let builtin_full = full_env(builtin_tenv)(builtin_ce)(builtin_assumptions)
let evaluator = (v0) => (v1) => (v2) => ({type: "evaluator", 0: v0, 1: v1, 2: v2})
let unify = (t1) => (t2) => $gt$gt$eq($lt_subst)((subst) => $gt$gt$eq(ok_$gt(map_err(unify_err(t1)(t2))(mgu(type$slapply(subst)(t1))(type$slapply(subst)(t2)))))((u) => subst_$gt(u)))
let type_env_$gtg = ({"2": aliases, "1": types, "0": constructors}) => cons(ggroup("> Constructors")(map(({"1": scheme, "0": name}) => gtext(` - ${name}: ${scheme_$gts(scheme)}`))(map$slto_list(constructors))))(cons(ggroup("> Types")(map(({"1": {"1": constr_names, "0": kinds}, "0": name}) => gtext(` - ${name}: ${join(",")(map(kind_$gts)(kinds))} ${join(",")(set$slto_list(constr_names))}`))(map$slto_list(types))))(nil))
let class_env_$gtg = ({"1": defaults, "0": instances}) => cons(ggroup("> Instances")(map(({"1": {"1": {"1": fns, "0": quals}, "0": ones}, "0": name}) => gtext(` - ${name} ${(($target) => {
if ($target.type === "nil") {
return ""
} ;
return ` <- ${join(", ")(ones)}`;
throw new Error('match fail 23900:' + JSON.stringify($target))
})(ones)}${(($target) => {
if ($target.type === "nil") {
return "\n   - (no instances)"
} ;
return ljoin("\n   - ")(map(qual_$gts(pred_$gts))(quals));
throw new Error('match fail 23964:' + JSON.stringify($target))
})(quals)}${(($target) => {
if ($target.type === "nil") {
return "\n   - (no fns)"
} ;
return ljoin("\n   - ")(map(({"1": type, "0": name}) => `${name} ${type_$gts(type)}`)(fns));
throw new Error('match fail 31299:' + JSON.stringify($target))
})(fns)}`))(map$slto_list(instances))))(cons(ggroup("> Defaults")(map(dot(dot(gtext)(prefix(" - ")))(type_$gts))(defaults)))(nil))
let run = (v) => eval(compile(parse_expr(v))(map$slnil))
let just_assumps_$gts = ({"2": assumps}) => join("\n")(map(assump_$gts)(assumps))
let example_ce = foldl(foldl(class_env$sladd_default(class_env$slnil)(cons(tint)(nil)))(cons($co("pretty")($co(nil)(cons($co("show-pretty")(tfns(cons(tgen(0)(-1))(nil))(tstring)))(nil))))(cons($co("num")($co(nil)(nil)))(cons($co("ord")($co(nil)(nil)))(nil))))(add_class))(cons($co(nil)(isin("pretty")(tunit)))(cons($co(nil)(isin("num")(tint)))(cons($co(nil)(isin("ord")(tint)))(nil))))((ce) => ({"1": pred, "0": pre}) => add_inst(pre)(pred)(ce))
let class_env_$gts = dot(groups_$gts)(class_env_$gtg)
let infer$slpat = (pat) => (($target) => {
if ($target.type === "pvar") {
let name = $target[0];
let l = $target[1];
return $gt$gt$eq(new_tvar(star))((v) => ti_return($co$co(nil)(cons($ex$gt$ex(name)(to_scheme(v)))(nil))(v)))
} ;
if ($target.type === "pany") {
let l = $target[0];
return $gt$gt$eq(new_tvar(star))((v) => ti_return($co$co(nil)(nil)(v)))
} ;
if ($target.type === "pprim") {
let prim = $target[0];
let l = $target[1];
return $gt$gt$eq(infer$slprim(prim))(({"1": t, "0": ps}) => ti_return($co$co(ps)(nil)(t)))
} ;
if ($target.type === "pcon") {
let name = $target[0];
let patterns = $target[1];
let l = $target[2];
return $gt$gt$eq(get_constructor(name)(l))((scheme) => $gt$gt$eq(infer$slpats(patterns))(({"2": ts, "1": as, "0": ps}) => $gt$gt$eq(new_tvar(star))((t$qu) => $gt$gt$eq(fresh_inst(scheme))(({"1": t, "0": qs}) => $gt$gt$eq(unify(t)(foldr(t$qu)(ts)((res) => (arg) => tfn(arg)(res))))((_9977) => $lt_($co$co(concat(cons(ps)(cons(qs)(nil))))(as)(t$qu)))))))
} ;
throw new Error('match fail 9791:' + JSON.stringify($target))
})(pat)

let infer$slpats = (pats) => $gt$gt$eq(map_$gt(infer$slpat)(pats))((psasts) => {
let ps = concat(map(({"0": ps$qu}) => ps$qu)(psasts));
{
let as = concat(map(({"1": as$qu}) => as$qu)(psasts));
{
let ts = map(({"2": t}) => t)(psasts);
return ti_return($co$co(ps)(as)(ts))
}
}
})
let split = (ce) => (fs) => (gs) => (ps) => $gt$gt$eq(ok_$gt(reduce(ce)(ps)))((ps$qu) => $gt$gt$eq($lt_(partition(ps$qu)(({"1": type, "0": name}) => every(set$slto_list(type$sltv(type)))((x) => contains(fs)(x)(tyvar$eq)))))(({"1": rs, "0": ds}) => $gt$gt$eq(ok_$gt(defaultedPreds(ce)(concat(cons(fs)(cons(gs)(nil))))(rs)))((rs$qu) => ti_return($co(ds)(without(rs)(rs$qu)(pred$eq))))))
let full_env_$gtg = ({"2": assumps, "1": cenv, "0": tenv}) => cons(ggroup("Type Env")(type_env_$gtg(tenv)))(cons(ggroup("Class Env")(class_env_$gtg(cenv)))(cons(ggroup("Assumps")(map(dot(dot(gtext)(prefix(" - ")))(assump_$gts))(assumps)))(nil)))
let full_env_$gts = dot(groups_$gts)(full_env_$gtg)
let infer$slexpr = (ce) => (as) => (expr) => (($target) => {
if ($target.type === "evar") {
let name = $target[0];
let l = $target[1];
return $gt$gt$eq(ok_$gt(find_scheme(name)(as)(l)))((sc) => $gt$gt$eq(fresh_inst(sc))(({"1": t, "0": ps}) => $lt_($co(ps)(t))))
} ;
if ($target.type === "estr") {
let first = $target[0];
let templates = $target[1];
let l = $target[2];
return $gt$gt$eq(map_$gt(infer$slexpr(ce)(as))(map(({"0": expr}) => expr)(templates)))((results) => $gt$gt$eq($lt_(unzip(results)))(({"1": types, "0": ps}) => $gt$gt$eq(map_$gt((_19150) => fresh_inst(forall(cons(star)(nil))($eq$gt(cons(isin("pretty")(tgen(0)(-1)))(nil))(tgen(0)(-1)))))(types))((results$qu) => $gt$gt$eq($lt_(unzip(map(({"1": b, "0": a}) => $co(a)(b))(results$qu))))(({"1": types$qu, "0": ps$qu}) => $gt$gt$eq(map_$gt(({"1": b, "0": a}) => unify(a)(b))(zip(types)(types$qu)))((_18973) => $lt_($co(concat(cons(concat(ps))(cons(concat(ps$qu))(nil))))(tstring)))))))
} ;
if ($target.type === "eprim") {
let prim = $target[0];
let l = $target[1];
return infer$slprim(prim)
} ;
if ($target.type === "equot") {
let l = $target[1];
return $lt_($co(nil)(star_con("expr")))
} ;
if ($target.type === "equot/stmt") {
let stmt = $target[0];
let int = $target[1];
return $lt_($co(nil)(star_con("stmt")))
} ;
if ($target.type === "equot/pat") {
let pat = $target[0];
let int = $target[1];
return $lt_($co(nil)(star_con("pat")))
} ;
if ($target.type === "equot/type") {
let type = $target[0];
let int = $target[1];
return $lt_($co(nil)(star_con("type")))
} ;
if ($target.type === "equotquot") {
let cst = $target[0];
let int = $target[1];
return $lt_($co(nil)(star_con("cst")))
} ;
if ($target.type === "eapp") {
let target = $target[0];
let args = $target[1];
let l = $target[2];
{
let $target = args;
if ($target.type === "cons") {
let arg = $target[0];
if ($target[1].type === "nil") {
return $gt$gt$eq(infer$slexpr(ce)(as)(target))(({"1": target_type, "0": ps}) => $gt$gt$eq(infer$slexpr(ce)(as)(arg))(({"1": arg_type, "0": qs}) => $gt$gt$eq(new_tvar(star))((result_var) => $gt$gt$eq(unify(tfn(arg_type)(result_var))(target_type))((_10388) => $lt_($co(concat(cons(ps)(cons(qs)(nil))))(result_var))))))
} 
} ;
if ($target.type === "cons") {
let one = $target[0];
let rest = $target[1];
return infer$slexpr(ce)(as)(eapp(eapp(target)(cons(one)(nil))(l))(rest)(l))
} ;
throw new Error('match fail 26126:' + JSON.stringify($target))
}
} ;
if ($target.type === "elambda") {
let pats = $target[0];
let body = $target[1];
let l = $target[2];
return infer$slexpr(ce)(as)(elet($co(nil)(cons(cons($co("lambda-arg")(cons($co(pats)(body))(nil)))(nil))(nil)))(evar("lambda-arg")(l))(l))
} ;
if ($target.type === "ematch") {
let target = $target[0];
let cases = $target[1];
let l = $target[2];
return infer$slexpr(ce)(as)(elet($co(nil)(cons(cons($co("match")(map(({"1": body, "0": pat}) => $co(cons(pat)(nil))(body))(cases)))(nil))(nil)))(eapp(evar("match")(l))(cons(target)(nil))(l))(l))
} ;
if ($target.type === "elet") {
let bindings = $target[0];
let body = $target[1];
let l = $target[2];
return $gt$gt$eq(infer$slbinding_group(ce)(as)(bindings))(({"1": as$qu, "0": ps}) => $gt$gt$eq(infer$slexpr(ce)(concat(cons(as$qu)(cons(as)(nil))))(body))(({"1": t, "0": qs}) => $lt_($co(concat(cons(ps)(cons(qs)(nil))))(t))))
} ;
throw new Error('match fail 10168:' + JSON.stringify($target))
})(expr)

let infer$slbinding_group = (class_env) => (as) => ({"1": implicits, "0": explicit}) => {
let expl_assumps = map(({"1": scheme, "0": name}) => $ex$gt$ex(name)(scheme))(explicit);
return $gt$gt$eq(infer$slseq(infer$slimpls)(class_env)($pl$pl$pl(expl_assumps)(as))(implicits))(({"1": impl_assumps, "0": impl_preds}) => $gt$gt$eq(map_$gt(infer$slexpl(class_env)(concat(cons(impl_assumps)(cons(expl_assumps)(cons(as)(nil))))))(explicit))((expl_preds) => $lt_($co(concat(cons(impl_preds)(expl_preds)))(concat(cons(impl_assumps)(cons(expl_assumps)(nil)))))))
}

let infer$slimpls = (class_env) => (assumps) => (bindings) => $gt$gt$eq(map_$gt((_14810) => new_tvar(star))(bindings))((type_vars) => {
let identifiers = map(fst)(bindings);
{
let scs = map(toScheme)(type_vars);
{
let as$qu = $pl$pl$pl(zipWith($ex$gt$ex)(identifiers)(scs))(assumps);
{
let altss = map(snd)(bindings);
return $gt$gt$eq(sequence(zipWith(infer$slalts(class_env)(as$qu))(altss)(type_vars)))((pss) => $gt$gt$eq(get_subst)((s) => {
let ps$qu = preds$slapply(s)(concat(pss));
{
let ts$qu = map(type$slapply(s))(type_vars);
{
let fs = set$slto_list(foldl(set$slnil)(map(assump$slapply(s))(assumps))((res) => (assumps) => set$slmerge(res)(assump$sltv(assumps))));
{
let vss = map(type$sltv)(ts$qu);
{
let gs = without(set$slto_list(foldr1(set$slmerge)(vss)))(fs)(tyvar$eq);
return $gt$gt$eq(split(class_env)(fs)(foldr1(intersect(tyvar$eq))(map(set$slto_list)(vss)))(ps$qu))(({"1": rs, "0": ds}) => $lt_((($target) => {
if ($target === true) {
{
let gs$qu = without(gs)(set$slto_list(preds$sltv(rs)))(tyvar$eq);
{
let scs$qu = map((x) => quantify(gs$qu)($eq$gt(nil)(x)))(ts$qu);
return $co($pl$pl$pl(ds)(rs))(zipWith($ex$gt$ex)(identifiers)(scs$qu))
}
}
} ;
{
let scs$qu = map((x) => quantify(gs)($eq$gt(rs)(x)))(ts$qu);
return $co(ds)(zipWith($ex$gt$ex)(identifiers)(scs$qu))
};
throw new Error('match fail 14945:' + JSON.stringify($target))
})(restricted(bindings))))
}
}
}
}
}))
}
}
}
})

let infer$slexpl = (ce) => (as) => ({"2": alts, "1": sc, "0": i}) => $gt$gt$eq(fresh_inst(sc))(({"1": t, "0": qs}) => $gt$gt$eq(infer$slalts(ce)(as)(alts)(t))((ps) => $gt$gt$eq(get_subst)((s) => {
let qs$qu = preds$slapply(s)(qs);
{
let t$qu = type$slapply(s)(t);
{
let fs = set$slto_list(foldr1(set$slmerge)(map(assump$sltv)(map(assump$slapply(s))(as))));
{
let gs = without(set$slto_list(type$sltv(t$qu)))(fs)(tyvar$eq);
{
let sc$qu = quantify(gs)($eq$gt(qs$qu)(t$qu));
{
let ps$qu = filter((x) => not(entail(ce)(qs$qu)(x)))(preds$slapply(s)(ps));
return $gt$gt$eq(split(ce)(fs)(gs)(ps$qu))(({"1": rs, "0": ds}) => (($target) => {
if ($target === true) {
return $lt_err($co("signature too general")(nil))
} ;
{
let $target = rs;
if ($target.type === "nil") {
return $lt_(ds)
} ;
return $lt_err($co("context too weak")(nil));
throw new Error('match fail 14572:' + JSON.stringify($target))
};
throw new Error('match fail 14562:' + JSON.stringify($target))
})($ex$eq(sc)(sc$qu)))
}
}
}
}
}
})))

let infer$slalts = (ce) => (as) => (alts) => (t) => $gt$gt$eq(map_$gt(infer$slalt(ce)(as))(alts))((psts) => $gt$gt$eq(map_$gt(unify(t))(map(snd)(psts)))((_15163) => ti_return(concat(map(fst)(psts)))))

let infer$slalt = (ce) => (as) => ({"1": body, "0": pats}) => $gt$gt$eq(infer$slpats(pats))(({"2": ts, "1": as$qu, "0": ps}) => $gt$gt$eq(infer$slexpr(ce)(concat(cons(as$qu)(cons(as)(nil))))(body))(({"1": t, "0": qs}) => {
let res_type = foldr(t)(ts)((res) => (arg) => tfn(arg)(res));
return ti_return($co(concat(cons(ps)(cons(qs)(nil))))(res_type))
}))
let infer$slprogram = (ce) => (as) => (bindgroups) => $gt$gt$eq(infer$slseq(infer$slbinding_group)(ce)(as)(bindgroups))(({"1": assumps, "0": preds}) => $gt$gt$eq(get_subst)((subst0) => $gt$gt$eq(ok_$gt(reduce(ce)(preds$slapply(subst0)(preds))))((reduced) => $gt$gt$eq(ok_$gt(defaultSubst(ce)(nil)(reduced)))((subst) => $lt_(map(assump$slapply(compose_subst(subst)(subst0)))(assumps))))))
let infer_stmt = (ce) => (assumps) => (stmt) => (($target) => {
if ($target.type === "sdef") {
let name = $target[0];
let nl = $target[1];
let body = $target[2];
let l = $target[3];
return $gt$gt$eq(infer$slprogram(ce)(assumps)(cons($co(nil)(cons(cons($co(name)(cons((($target) => {
if ($target.type === "elambda") {
let pats = $target[0];
let inner = $target[1];
let l = $target[2];
return $co(pats)(inner)
} ;
return $co(nil)(body);
throw new Error('match fail 24389:' + JSON.stringify($target))
})(body))(nil)))(nil))(nil)))(nil)))((assumps) => $lt_(full_env(type_env$slnil)(class_env$slnil)(filter(({"0": n}) => $eq(n)(name))(assumps))))
} ;
if ($target.type === "stypealias") {
let name = $target[0];
let nl = $target[1];
let args = $target[2];
let type = $target[3];
let l = $target[4];
return $lt_(full_env$slnil)
} ;
if ($target.type === "sdeftype") {
let name = $target[0];
let nl = $target[1];
let args = $target[2];
let constructors = $target[3];
let l = $target[4];
return infer_deftype($co$co$co(name)(nl)(args)(constructors))
} ;
if ($target.type === "sexpr") {
let body = $target[0];
let l = $target[1];
return $gt$gt$eq(infer$slprogram(ce)(assumps)(cons($co(nil)(cons(cons($co("it")(cons($co(nil)(body))(nil)))(nil))(nil)))(nil)))((_20636) => $lt_(full_env$slnil))
} ;
throw new Error('match fail 20567:' + JSON.stringify($target))
})(stmt)
let infer_defs = (ce) => (assumps) => (defs) => $gt$gt$eq(idx_$gt(0))((_20798) => $gt$gt$eq($lt_tenv)((tenv) => $gt$gt$eq(infer$slprogram(ce)(assumps)(cons($co(nil)(cons(map(({"1": body, "0": name}) => $co(name)(cons($co(nil)(body))(nil)))(defs))(nil)))(nil)))((assumps) => $lt_(full_env(tenv)(ce)(assumps)))))
let infer_defns = (ce) => (assumps) => (stmts) => $gt$gt$eq($lt_(set$slfrom_list(map(({"0": name}) => name)(stmts))))((names) => $gt$gt$eq(infer$slprogram(ce)(assumps)(cons($co(nil)(cons(map(({"2": body, "0": name}) => $co(name)(cons((($target) => {
if ($target.type === "elambda") {
let pats = $target[0];
let inner = $target[1];
let l = $target[2];
return $co(pats)(inner)
} ;
return $co(nil)(body);
throw new Error('match fail 27172:' + JSON.stringify($target))
})(body))(nil)))(stmts))(nil)))(nil)))((assumps) => $lt_(full_env(type_env$slnil)(class_env$slnil)(filter(({"0": n}) => set$slhas(names)(n))(assumps)))))
let infer_stmts = (ce) => (assumps) => (stmts) => foldl_$gt(full_env$slnil)(stmts)(({"2": assumps$qu, "1": ce$qu, "0": tenv}) => (stmt) => $gt$gt$eq(infer_stmt(class_env$slmerge(ce)(ce$qu))(concat2(assumps)(assumps$qu))(stmt))((env) => $lt_(full_env$slmerge(full_env(tenv)(ce$qu)(assumps$qu))(env))))
let infer = (ce) => (assumps) => (body) => $gt$gt$eq(infer$slprogram(ce)(assumps)(cons($co(nil)(cons(cons($co("it")(cons($co(nil)(body))(nil)))(nil))(nil)))(nil)))((assumps) => (($target) => {
if ($target.type === "cons") {
if ($target[0].type === "!>!") {
let n = $target[0][0];
let scheme = $target[0][1];
if ($target[1].type === "nil") {
return $lt_(scheme)
} 
} 
} ;
return $lt_err($co("No type found (for 'it')")(nil));
throw new Error('match fail 22352:' + JSON.stringify($target))
})(filter(({"0": n}) => $eq(n)("it"))(assumps)))
let test_expr2 = (v) => program_results_$gts(run$sltenv_$gt(builtin_tenv)(infer$slprogram(builtin_ce)(builtin_assumptions)(cons($co(nil)(cons(cons(parse_binding(v))(nil))(nil)))(nil))))
let test_stmt = (x) => full_env_$gts(force(type_error_$gts)(snd(run$sltenv_$gt(builtin_tenv)(infer_stmts(builtin_ce)(builtin_assumptions)(map(parse_stmt)(x))))))
let infer_sinst = (ce) => (assumps) => ({"5": l, "4": fns, "3": preds, "2": type, "1": nl, "0": name}) => $gt$gt$eq($lt_(foldl(empty)(map(({"1": t}) => find_free(t))(preds))(bag$sland)))((free) => $gt$gt$eq($lt_(map$slfrom_list(map(({"2": kind, "0": name}) => $co(name)(kind))(bag$slto_list(free)))))((free_map) => $gt$gt$eq($lt_(ce))(({"0": classes}) => $gt$gt$eq((($target) => {
if ($target.type === "some") {
let cls = $target[0];
return $lt_(cls)
} ;
if ($target.type === "none") {
return $lt_err($co("Trying to define an instance for a class that hasn't been defined")(nil))
} ;
throw new Error('match fail 31372:' + JSON.stringify($target))
})(map$slget(classes)(name)))(({"1": {"1": inst_fns, "0": b}, "0": a}) => $gt$gt$eq(map_$gt(({"2": f, "1": loc, "0": name}) => (($target) => {
if ($target.type === "some") {
let fn_type = $target[0];
return $gt$gt$eq(infer$slexpr(ce)(assumps)(f))(({"1": t, "0": preds}) => $gt$gt$eq(unify(inst$sltype(cons(replace_free(free_map)(type))(nil))(fn_type))(t))((_31461) => $lt_(t)))
} ;
if ($target.type === "none") {
return $lt_err($co("Unknown instance function")(cons($co(loc)(name))(nil)))
} ;
throw new Error('match fail 31450:' + JSON.stringify($target))
})(assoc$slget(inst_fns)(name)))(fns))((what) => $lt_(full_env(type_env$slnil)(add_inst(map(({"1": type, "0": name}) => isin(name)(replace_free(free_map)(type)))(preds))(isin(name)(replace_free(free_map)(type)))(ce))(nil)))))))
let infer_stmtss = (ce) => (assumps) => (stmts) => $gt$gt$eq($lt_(split_stmts(stmts)(nil)(nil)(nil)(nil)(nil)))(({"1": {"1": {"1": {"1": sinst, "0": sexps}, "0": salias}, "0": stypes}, "0": sdefs}) => $gt$gt$eq(map_$gt((stmt) => infer_stmt(ce)(assumps)(stmt))(stypes))((tts) => $gt$gt$eq(map_$gt((stmt) => infer_sinst(ce)(assumps)(stmt))(sinst))((its) => $gt$gt$eq($lt_(foldl(full_env$slnil)(concat(cons(tts)(cons(its)(nil))))(full_env$slmerge)))(({"2": tc, "1": tb, "0": ta}) => $gt$gt$eq((($target) => {
if ($target.type === "nil") {
return $lt_(full_env$slnil)
} ;
return infer_defns(class_env$slmerge(ce)(tb))(concat(cons(assumps)(cons(tc)(nil))))(sdefs);
throw new Error('match fail 29170:' + JSON.stringify($target))
})(sdefs))(({"2": c, "1": b, "0": a}) => $gt$gt$eq(map_$gt(infer(class_env$slmerge(ce)(tb))(concat(cons(tc)(cons(c)(cons(assumps)(nil))))))(sexps))((types) => $lt_($co(full_env$slmerge(full_env(ta)(tb)(tc))(full_env(a)(b)(c)))(types))))))))
let test_stmts = (ce) => (x) => just_assumps_$gts(fst(force(type_error_$gts)(snd(run$sltenv_$gt(builtin_tenv)(infer_stmtss(ce)(builtin_assumptions)(map(parse_stmt)(x)))))))
let test_full = (ce) => (x) => full_env_$gts(fst(force(type_error_$gts)(snd(run$sltenv_$gt(builtin_tenv)(infer_stmtss(ce)(builtin_assumptions)(map(parse_stmt)(x)))))))
return eval("({0: {0: env_nil, 1: infer_stmts, 2: add_stmt, 3: infer, 4: type_to_string, 5: get_type, 6: infer_stmts2},\n  1: {0: externals_stmt, 1: externals_expr, 2: names},\n  2: {0: parse_stmt, 1: parse_expr, 2: compile_stmt, 3: compile},\n }) => ({type: 'fns', \n   env_nil, infer_stmts, add_stmt, infer, externals_stmt, externals_expr, names, type_to_string, get_type,\n   parse_stmt, parse_expr, compile_stmt, compile, infer_stmts2 \n }) ")(evaluator(inferator(builtin_full)(({"2": assumps, "1": ce, "0": tenv}) => (y) => force(type_error_$gts)(snd(run$sltenv_$gt(tenv)(infer_stmts(ce)(assumps)(y)))))(full_env$slmerge)(({"2": assumps, "1": ce, "0": tenv}) => (y) => force(type_error_$gts)(snd(run$sltenv_$gt(tenv)(infer(ce)(assumps)(y)))))(scheme_$gts)(({"2": assumps, "1": ce, "0": tenv}) => (name) => (($target) => {
if ($target.type === "cons") {
if ($target[0].type === "!>!") {
let scheme = $target[0][1];
return some(scheme)
} 
} ;
return none;
throw new Error('match fail 23371:' + JSON.stringify($target))
})(filter(({"0": n}) => $eq(n)(name))(assumps)))(({"2": assumps, "1": ce, "0": tenv}) => (stms) => {
let {"1": result, "0": {"1": types}} = run$sltenv_$gt(tenv)(infer_stmtss(ce)(assumps)(stms));
return $co$co(result)(types)($co(nil)(nil))
}))(analysis(externals_stmt)((expr) => bag$slto_list(externals(set$slnil)(expr)))(names))(parser(parse_stmt)(parse_expr)(compile_stmt)(compile)))