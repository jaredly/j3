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
const join = /*132*/function name_132(sep) { return /*132*/function name_132(items) { return /*139*/(function match_139($target) {
if ($target.type === "nil") {
return /*143*/""/*<143*/
}
if ($target.type === "cons") {
{
let one = $target[0];
{
let rest = $target[1];
return /*151*/(function match_151($target) {
if ($target.type === "nil") {
return /*155*/one/*<155*/
}
return /*157*//*158*/$pl$pl/*<158*/(/*157*//*159*//*159*//*159*/cons/*<159*/(/*159*//*160*/one/*<160*/)/*<159*/(/*159*//*159*//*159*//*159*/cons/*<159*/(/*159*//*161*/sep/*<161*/)/*<159*/(/*159*//*159*//*159*//*159*/cons/*<159*/(/*159*//*162*//*162*//*163*/join/*<163*/(/*162*//*164*/sep/*<164*/)/*<162*/(/*162*//*165*/rest/*<165*/)/*<162*/)/*<159*/(/*159*//*159*/nil/*<159*/)/*<159*/)/*<159*/)/*<159*/)/*<157*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 151');})(/*!*//*153*/rest/*<153*/)/*<151*/
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 139');})(/*!*//*141*/items/*<141*/)/*<139*/ }/*<132*/ }/*<132*/;

/*166*//*166*//*168*/join/*<168*/(/*166*//*169*/" "/*<169*/)/*<166*/(/*166*//*171*//*171*//*171*/cons/*<171*/(/*171*//*172*/"one"/*<172*/)/*<171*/(/*171*//*171*//*171*//*171*/cons/*<171*/(/*171*//*174*/"two"/*<174*/)/*<171*/(/*171*//*171*//*171*//*171*/cons/*<171*/(/*171*//*176*/"three"/*<176*/)/*<171*/(/*171*//*171*/nil/*<171*/)/*<171*/)/*<171*/)/*<171*/)/*<166*/
/*178*//*178*//*180*/join/*<180*/(/*178*//*181*/" "/*<181*/)/*<178*/(/*178*//*183*/nil/*<183*/)/*<178*/
/*184*//*184*//*186*/join/*<186*/(/*184*//*187*/" "/*<187*/)/*<184*/(/*184*//*189*//*189*//*189*/cons/*<189*/(/*189*//*190*/"one"/*<190*/)/*<189*/(/*189*//*189*/nil/*<189*/)/*<189*/)/*<184*/
const mapi = /*221*/function name_221(i) { return /*221*/function name_221(values) { return /*221*/function name_221(f) { return /*229*/(function match_229($target) {
if ($target.type === "nil") {
return /*233*/nil/*<233*/
}
if ($target.type === "cons") {
{
let one = $target[0];
{
let rest = $target[1];
return /*240*//*240*//*240*/cons/*<240*/(/*240*//*241*//*241*//*242*/f/*<242*/(/*241*//*243*/i/*<243*/)/*<241*/(/*241*//*244*/one/*<244*/)/*<241*/)/*<240*/(/*240*//*245*//*245*//*245*//*249*/mapi/*<249*/(/*245*//*250*//*250*//*251*/$pl/*<251*/(/*250*//*252*/1/*<252*/)/*<250*/(/*250*//*253*/i/*<253*/)/*<250*/)/*<245*/(/*245*//*254*/rest/*<254*/)/*<245*/(/*245*//*255*/f/*<255*/)/*<245*/)/*<240*/
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 229');})(/*!*//*231*/values/*<231*/)/*<229*/ }/*<221*/ }/*<221*/ }/*<221*/;

const snd = /*527*/function name_527(tuple) { return /*533*/(function let_533() {const $target = /*540*/tuple/*<540*/;
if ($target.type === ",") {
{
let v = $target[1];
return /*541*/v/*<541*/
}
};
throw new Error('let pattern not matched 536. ' + valueToString($target));})(/*!*/)/*<533*/ }/*<527*/;

const fst = /*542*/function name_542(tuple) { return /*548*/(function let_548() {const $target = /*555*/tuple/*<555*/;
if ($target.type === ",") {
{
let v = $target[0];
return /*556*/v/*<556*/
}
};
throw new Error('let pattern not matched 551. ' + valueToString($target));})(/*!*/)/*<548*/ }/*<542*/;

const cst$sllist = (v0) => (v1) => ({type: "cst/list", 0: v0, 1: v1});
const cst$slarray = (v0) => (v1) => ({type: "cst/array", 0: v0, 1: v1});
const cst$slspread = (v0) => (v1) => ({type: "cst/spread", 0: v0, 1: v1});
const cst$slidentifier = (v0) => (v1) => ({type: "cst/identifier", 0: v0, 1: v1});
const cst$slstring = (v0) => (v1) => (v2) => ({type: "cst/string", 0: v0, 1: v1, 2: v2});
const tapps = /*898*/function name_898(items) { return /*898*/function name_898(l) { return /*904*/(function match_904($target) {
if ($target.type === "cons") {
{
let one = $target[0];
if ($target[1].type === "nil") {
return /*909*/one/*<909*/
}
}
}
if ($target.type === "cons") {
{
let one = $target[0];
{
let rest = $target[1];
return /*918*//*918*//*918*//*919*/tapp/*<919*/(/*918*//*921*//*921*//*922*/tapps/*<922*/(/*921*//*923*/rest/*<923*/)/*<921*/(/*921*//*4001*/l/*<4001*/)/*<921*/)/*<918*/(/*918*//*5374*/one/*<5374*/)/*<918*/(/*918*//*4000*/l/*<4000*/)/*<918*/
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 904');})(/*!*//*906*/items/*<906*/)/*<904*/ }/*<898*/ }/*<898*/;

const some = (v0) => ({type: "some", 0: v0});
const none = ({type: "none"});
const pairs = /*1684*/function name_1684(list) { return /*1690*/(function match_1690($target) {
if ($target.type === "nil") {
return /*1713*/nil/*<1713*/
}
if ($target.type === "cons") {
{
let one = $target[0];
if ($target[1].type === "cons") {
{
let two = $target[1][0];
{
let rest = $target[1][1];
return /*1700*//*1700*//*1700*/cons/*<1700*/(/*1700*//*1701*//*1701*//*1702*/$co/*<1702*/(/*1701*//*1703*/one/*<1703*/)/*<1701*/(/*1701*//*1705*/two/*<1705*/)/*<1701*/)/*<1700*/(/*1700*//*1706*//*1710*/pairs/*<1710*/(/*1706*//*1711*/rest/*<1711*/)/*<1706*/)/*<1700*/
}
}
}
}
}
return /*3151*//*3152*/fatal/*<3152*/(/*3151*//*3153*/`Pairs given odd number ${/*3155*//*3157*/valueToString/*<3157*/(/*3155*//*3158*/list/*<3158*/)/*<3155*/}`/*<3153*/)/*<3151*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 1690');})(/*!*//*1692*/list/*<1692*/)/*<1690*/ }/*<1684*/;

const replaces = /*2094*/function name_2094(target) { return /*2094*/function name_2094(repl) { return /*2101*/(function match_2101($target) {
if ($target.type === "nil") {
return /*2105*/target/*<2105*/
}
if ($target.type === "cons") {
{
let one = $target[0];
{
let rest = $target[1];
return /*2112*/(function match_2112($target) {
if ($target.type === ",") {
{
let find = $target[0];
{
let nw = $target[1];
return /*2119*//*2119*//*2120*/replaces/*<2120*/(/*2119*//*2121*//*2121*//*2121*//*2122*/replace_all/*<2122*/(/*2121*//*2123*/target/*<2123*/)/*<2121*/(/*2121*//*2124*/find/*<2124*/)/*<2121*/(/*2121*//*2125*/nw/*<2125*/)/*<2121*/)/*<2119*/(/*2119*//*2126*/rest/*<2126*/)/*<2119*/
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 2112');})(/*!*//*2114*/one/*<2114*/)/*<2112*/
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 2101');})(/*!*//*2103*/repl/*<2103*/)/*<2101*/ }/*<2094*/ }/*<2094*/;

const escape_string = /*2127*/function name_2127(string) { return /*2133*//*2133*//*2134*/replaces/*<2134*/(/*2133*//*2135*/string/*<2135*/)/*<2133*/(/*2133*//*2136*//*2136*//*2136*/cons/*<2136*/(/*2136*//*2137*//*2137*//*2720*/$co/*<2720*/(/*2137*//*2721*/"\\"/*<2721*/)/*<2137*/(/*2137*//*2723*/"\\\\"/*<2723*/)/*<2137*/)/*<2136*/(/*2136*//*2136*//*2136*//*2136*/cons/*<2136*/(/*2136*//*2725*//*2725*//*2726*/$co/*<2726*/(/*2725*//*2727*/"\n"/*<2727*/)/*<2725*/(/*2725*//*2729*/"\\n"/*<2729*/)/*<2725*/)/*<2136*/(/*2136*//*2136*//*2136*//*2136*/cons/*<2136*/(/*2136*//*2731*//*2731*//*2732*/$co/*<2732*/(/*2731*//*2733*/"\""/*<2733*/)/*<2731*/(/*2731*//*2735*/"\\\""/*<2735*/)/*<2731*/)/*<2136*/(/*2136*//*2136*//*2136*//*2136*/cons/*<2136*/(/*2136*//*2155*//*2155*//*2156*/$co/*<2156*/(/*2155*//*2157*/"\`"/*<2157*/)/*<2155*/(/*2155*//*2159*/"\\\`"/*<2159*/)/*<2155*/)/*<2136*/(/*2136*//*2136*//*2136*//*2136*/cons/*<2136*/(/*2136*//*2161*//*2161*//*2162*/$co/*<2162*/(/*2161*//*2163*/"\$"/*<2163*/)/*<2161*/(/*2161*//*2165*/"\\\$"/*<2165*/)/*<2161*/)/*<2136*/(/*2136*//*2136*/nil/*<2136*/)/*<2136*/)/*<2136*/)/*<2136*/)/*<2136*/)/*<2136*/)/*<2133*/ }/*<2127*/;

const builtins = /*3135*/"const sanMap = { '-': '_', '+': '\$pl', '*': '\$ti', '=': '\$eq', \n'>': '\$gt', '<': '\$lt', \"'\": '\$qu', '\"': '\$dq', ',': '\$co', '@': '\$at', '/': '\$sl'};\n\nconst kwds = 'case var if return super break while for default';\nconst rx = [];\nkwds.split(' ').forEach((kwd) =>\n    rx.push([new RegExp(\`^\${kwd}\$\`, 'g'), '\$' + kwd]),);\nconst sanitize = (raw) => { if (raw == null) debugger;\n    for (let [key, val] of Object.entries(sanMap)) {\n        raw = raw.replaceAll(key, val);\n    }\n    rx.forEach(([rx, res]) => {\n        raw = raw.replaceAll(rx, res);\n    });\n    return raw;\n};\nconst jsonify = (raw) => JSON.stringify(raw);\nconst string_to_int = (a) => {\n    var v = parseInt(a);\n    if (!isNaN(v) && '' + v === a) return {type: 'some', 0: v}\n    return {type: 'none'}\n}\n\nconst unwrapArray = (v) => {\n    if (!v) debugger\n    return v.type === 'nil' ? [] : [v[0], ...unwrapArray(v[1])]\n};\nconst \$eq = (a) => (b) => a == b;\nconst fatal = (e) => {throw new Error(e)}\nconst nil = { type: 'nil' };\nconst cons = (a) => (b) => ({ type: 'cons', 0: a, 1: b });\nconst \$pl\$pl = (items) => unwrapArray(items).join('');\nconst \$pl = (a) => (b) => a + b;\nconst _ = (a) => (b) => a - b;\nconst int_to_string = (a) => a + '';\nconst replace_all = (a) => (b) => (c) => {\n    return a.replaceAll(b, c);\n};\nconst \$co = (a) => (b) => ({ type: ',', 0: a, 1: b });\nconst reduce = (init) => (items) => (f) => {\n    return unwrapArray(items).reduce((a, b) => f(a)(b), init);\n};\n"/*<3135*/;

const pat_loc = /*4536*/function name_4536(pat) { return /*4542*/(function match_4542($target) {
if ($target.type === "pany") {
{
let l = $target[0];
return /*4548*/l/*<4548*/
}
}
if ($target.type === "pprim") {
{
let l = $target[1];
return /*4553*/l/*<4553*/
}
}
if ($target.type === "pstr") {
{
let l = $target[1];
return /*4558*/l/*<4558*/
}
}
if ($target.type === "pvar") {
{
let l = $target[1];
return /*4564*/l/*<4564*/
}
}
if ($target.type === "pcon") {
{
let l = $target[2];
return /*4570*/l/*<4570*/
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 4542');})(/*!*//*4544*/pat/*<4544*/)/*<4542*/ }/*<4536*/;

const expr_loc = /*4702*/function name_4702(expr) { return /*4708*/(function match_4708($target) {
if ($target.type === "estr") {
{
let l = $target[2];
return /*4716*/l/*<4716*/
}
}
if ($target.type === "eprim") {
{
let l = $target[1];
return /*4722*/l/*<4722*/
}
}
if ($target.type === "evar") {
{
let l = $target[1];
return /*4727*/l/*<4727*/
}
}
if ($target.type === "equotquot") {
{
let l = $target[1];
return /*5834*/l/*<5834*/
}
}
if ($target.type === "equot") {
{
let l = $target[1];
return /*4732*/l/*<4732*/
}
}
if ($target.type === "equot/stmt") {
{
let l = $target[1];
return /*5477*/l/*<5477*/
}
}
if ($target.type === "equot/pat") {
{
let l = $target[1];
return /*5482*/l/*<5482*/
}
}
if ($target.type === "equot/type") {
{
let l = $target[1];
return /*5487*/l/*<5487*/
}
}
if ($target.type === "elambda") {
{
let l = $target[3];
return /*4739*/l/*<4739*/
}
}
if ($target.type === "elet") {
{
let l = $target[3];
return /*4756*/l/*<4756*/
}
}
if ($target.type === "eapp") {
{
let l = $target[2];
return /*4762*/l/*<4762*/
}
}
if ($target.type === "ematch") {
{
let l = $target[2];
return /*4768*/l/*<4768*/
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 4708');})(/*!*//*4710*/expr/*<4710*/)/*<4708*/ }/*<4702*/;

/*5265*//*5267*/escape_string/*<5267*/(/*5265*//*5268*//*5269*/unescapeString/*<5269*/(/*5268*//*5270*/"\n"/*<5270*/)/*<5268*/)/*<5265*/
const rev = /*5377*/function name_5377(arr) { return /*5377*/function name_5377(col) { return /*5384*/(function match_5384($target) {
if ($target.type === "nil") {
return /*5388*/col/*<5388*/
}
if ($target.type === "cons") {
{
let one = $target[0];
if ($target[1].type === "nil") {
return /*5391*//*5391*//*5391*/cons/*<5391*/(/*5391*//*5392*/one/*<5392*/)/*<5391*/(/*5391*//*5393*/col/*<5393*/)/*<5391*/
}
}
}
if ($target.type === "cons") {
{
let one = $target[0];
{
let rest = $target[1];
return /*5403*//*5403*//*5404*/rev/*<5404*/(/*5403*//*5405*/rest/*<5405*/)/*<5403*/(/*5403*//*5406*//*5406*//*5406*/cons/*<5406*/(/*5406*//*5407*/one/*<5407*/)/*<5406*/(/*5406*//*5408*/col/*<5408*/)/*<5406*/)/*<5403*/
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 5384');})(/*!*//*5386*/arr/*<5386*/)/*<5384*/ }/*<5377*/ }/*<5377*/;

const parse_and_compile = (v0) => (v1) => (v2) => (v3) => ({type: "parse-and-compile", 0: v0, 1: v1, 2: v2, 3: v3});
const foldl = /*5855*/function name_5855(init) { return /*5855*/function name_5855(items) { return /*5855*/function name_5855(f) { return /*5863*/(function match_5863($target) {
if ($target.type === "nil") {
return /*5867*/init/*<5867*/
}
if ($target.type === "cons") {
{
let one = $target[0];
{
let rest = $target[1];
return /*5874*//*5874*//*5874*//*5875*/foldl/*<5875*/(/*5874*//*5876*//*5876*//*5877*/f/*<5877*/(/*5876*//*5878*/init/*<5878*/)/*<5876*/(/*5876*//*5879*/one/*<5879*/)/*<5876*/)/*<5874*/(/*5874*//*5880*/rest/*<5880*/)/*<5874*/(/*5874*//*5881*/f/*<5881*/)/*<5874*/
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 5863');})(/*!*//*5865*/items/*<5865*/)/*<5863*/ }/*<5855*/ }/*<5855*/ }/*<5855*/;

const map = /*5882*/function name_5882(values) { return /*5882*/function name_5882(f) { return /*5889*/(function match_5889($target) {
if ($target.type === "nil") {
return /*5893*/nil/*<5893*/
}
if ($target.type === "cons") {
{
let one = $target[0];
{
let rest = $target[1];
return /*5900*//*5900*//*5900*/cons/*<5900*/(/*5900*//*5901*//*5902*/f/*<5902*/(/*5901*//*5903*/one/*<5903*/)/*<5901*/)/*<5900*/(/*5900*//*5904*//*5904*//*5908*/map/*<5908*/(/*5904*//*5909*/rest/*<5909*/)/*<5904*/(/*5904*//*5910*/f/*<5910*/)/*<5904*/)/*<5900*/
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 5889');})(/*!*//*5891*/values/*<5891*/)/*<5889*/ }/*<5882*/ }/*<5882*/;

const foldr = /*5912*/function name_5912(init) { return /*5912*/function name_5912(items) { return /*5912*/function name_5912(f) { return /*5920*/(function match_5920($target) {
if ($target.type === "nil") {
return /*5924*/init/*<5924*/
}
if ($target.type === "cons") {
{
let one = $target[0];
{
let rest = $target[1];
return /*5931*//*5931*//*5932*/f/*<5932*/(/*5931*//*5933*//*5933*//*5933*//*5934*/foldr/*<5934*/(/*5933*//*5935*/init/*<5935*/)/*<5933*/(/*5933*//*5936*/rest/*<5936*/)/*<5933*/(/*5933*//*5937*/f/*<5937*/)/*<5933*/)/*<5931*/(/*5931*//*5938*/one/*<5938*/)/*<5931*/
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 5920');})(/*!*//*5922*/items/*<5922*/)/*<5920*/ }/*<5912*/ }/*<5912*/ }/*<5912*/;

const its = /*5948*/int_to_string/*<5948*/;

/*320*//*320*//*320*//*322*/foldr/*<322*/(/*320*//*323*/nil/*<323*/)/*<320*/(/*320*//*324*//*324*//*324*/cons/*<324*/(/*324*//*325*/1/*<325*/)/*<324*/(/*324*//*324*//*324*//*324*/cons/*<324*/(/*324*//*326*/2/*<326*/)/*<324*/(/*324*//*324*//*324*//*324*/cons/*<324*/(/*324*//*327*/3/*<327*/)/*<324*/(/*324*//*324*//*324*//*324*/cons/*<324*/(/*324*//*328*/4/*<328*/)/*<324*/(/*324*//*324*/nil/*<324*/)/*<324*/)/*<324*/)/*<324*/)/*<324*/)/*<320*/(/*320*//*329*/function name_329(b) { return /*329*/function name_329(a) { return /*5997*//*5997*//*5998*/cons/*<5998*/(/*5997*//*5999*/a/*<5999*/)/*<5997*/(/*5997*//*6000*/b/*<6000*/)/*<5997*/ }/*<329*/ }/*<329*/)/*<320*/
const parse_type = /*692*/function name_692(type) { return /*867*/(function match_867($target) {
if ($target.type === "cst/identifier") {
{
let id = $target[0];
{
let l = $target[1];
return /*874*//*874*//*875*/tcon/*<875*/(/*874*//*876*/id/*<876*/)/*<874*/(/*874*//*3997*/l/*<3997*/)/*<874*/
}
}
}
if ($target.type === "cst/list") {
if ($target[0].type === "nil") {
{
let l = $target[1];
return /*5418*//*5419*/fatal/*<5419*/(/*5418*//*5420*/"(parse-type) with empty list"/*<5420*/)/*<5418*/
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
return /*5588*//*5588*//*5588*//*5589*/foldl/*<5589*/(/*5588*//*5590*//*5591*/parse_type/*<5591*/(/*5590*//*5592*/body/*<5592*/)/*<5590*/)/*<5588*/(/*5588*//*5691*//*5691*//*5593*/rev/*<5593*/(/*5691*//*5692*/args/*<5692*/)/*<5691*/(/*5691*//*5693*/nil/*<5693*/)/*<5691*/)/*<5588*/(/*5588*//*5594*/function name_5594(body) { return /*5594*/function name_5594(arg) { return /*5600*//*5600*//*5600*//*5601*/tapp/*<5601*/(/*5600*//*5602*//*5602*//*5602*//*5603*/tapp/*<5603*/(/*5602*//*5604*//*5604*//*5605*/tcon/*<5605*/(/*5604*//*5606*/"->"/*<5606*/)/*<5604*/(/*5604*//*5608*/-1/*<5608*/)/*<5604*/)/*<5602*/(/*5602*//*5609*//*5610*/parse_type/*<5610*/(/*5609*//*5611*/arg/*<5611*/)/*<5609*/)/*<5602*/(/*5602*//*5612*/-1/*<5612*/)/*<5602*/)/*<5600*/(/*5600*//*5613*/body/*<5613*/)/*<5600*/(/*5600*//*5614*/-1/*<5614*/)/*<5600*/ }/*<5594*/ }/*<5594*/)/*<5588*/
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
return /*881*//*881*//*924*/tapps/*<924*/(/*881*//*5375*//*5375*//*5376*/rev/*<5376*/(/*5375*//*925*//*925*//*926*/map/*<926*/(/*925*//*927*/items/*<927*/)/*<925*/(/*925*//*928*/parse_type/*<928*/)/*<925*/)/*<5375*/(/*5375*//*5413*/nil/*<5413*/)/*<5375*/)/*<881*/(/*881*//*3998*/l/*<3998*/)/*<881*/
}
}
}
return /*3138*//*3139*/fatal/*<3139*/(/*3138*//*3140*/`(parse-type) Invalid type ${/*3142*//*3144*/valueToString/*<3144*/(/*3142*//*3145*/type/*<3145*/)/*<3142*/}`/*<3140*/)/*<3138*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 867');})(/*!*//*869*/type/*<869*/)/*<867*/ }/*<692*/;

const mk_deftype = /*1390*/function name_1390(id) { return /*1390*/function name_1390(li) { return /*1390*/function name_1390(args) { return /*1390*/function name_1390(items) { return /*1390*/function name_1390(l) { return /*1433*//*1433*//*1433*//*1433*//*1433*//*1434*/sdeftype/*<1434*/(/*1433*//*1435*/id/*<1435*/)/*<1433*/(/*1433*//*3980*/li/*<3980*/)/*<1433*/(/*1433*//*5017*//*5017*//*5018*/map/*<5018*/(/*5017*//*5019*/args/*<5019*/)/*<5017*/(/*5017*//*5020*/function name_5020(arg) { return /*5024*/(function match_5024($target) {
if ($target.type === "cst/identifier") {
{
let name = $target[0];
{
let l = $target[1];
return /*5031*//*5031*//*5032*/$co/*<5032*/(/*5031*//*5033*/name/*<5033*/)/*<5031*/(/*5031*//*5034*/l/*<5034*/)/*<5031*/
}
}
}
return /*5036*//*5037*/fatal/*<5037*/(/*5036*//*5038*/"deftype type argument must be identifier"/*<5038*/)/*<5036*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 5024');})(/*!*//*5026*/arg/*<5026*/)/*<5024*/ }/*<5020*/)/*<5017*/)/*<1433*/(/*1433*//*1436*//*1436*//*1437*/map/*<1437*/(/*1436*//*1438*/items/*<1438*/)/*<1436*/(/*1436*//*1439*/function name_1439(constr) { return /*1443*/(function match_1443($target) {
if ($target.type === "cst/list") {
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
return /*1457*//*1457*//*1457*//*1457*//*1458*/$co$co$co/*<1458*/(/*1457*//*1459*/name/*<1459*/)/*<1457*/(/*1457*//*3982*/ni/*<3982*/)/*<1457*/(/*1457*//*1460*//*1460*//*1461*/map/*<1461*/(/*1460*//*1462*/args/*<1462*/)/*<1460*/(/*1460*//*1463*/parse_type/*<1463*/)/*<1460*/)/*<1457*/(/*1457*//*3984*/l/*<3984*/)/*<1457*/
}
}
}
}
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 1443');})(/*!*//*1445*/constr/*<1445*/)/*<1443*/ }/*<1439*/)/*<1436*/)/*<1433*/(/*1433*//*3981*/l/*<3981*/)/*<1433*/ }/*<1390*/ }/*<1390*/ }/*<1390*/ }/*<1390*/ }/*<1390*/;

const parse_pat = /*1721*/function name_1721(pat) { return /*1727*/(function match_1727($target) {
if ($target.type === "cst/identifier") {
if ($target[0] === "_"){
{
let l = $target[1];
return /*1747*//*1748*/pany/*<1748*/(/*1747*//*3641*/l/*<3641*/)/*<1747*/
}
}
}
if ($target.type === "cst/identifier") {
if ($target[0] === "true"){
{
let l = $target[1];
return /*4247*//*4247*//*4248*/pprim/*<4248*/(/*4247*//*4249*//*4249*//*4250*/pbool/*<4250*/(/*4249*//*4251*/true/*<4251*/)/*<4249*/(/*4249*//*4252*/l/*<4252*/)/*<4249*/)/*<4247*/(/*4247*//*4253*/l/*<4253*/)/*<4247*/
}
}
}
if ($target.type === "cst/identifier") {
if ($target[0] === "false"){
{
let l = $target[1];
return /*5847*//*5847*//*5848*/pprim/*<5848*/(/*5847*//*5849*//*5849*//*5850*/pbool/*<5850*/(/*5849*//*5851*/false/*<5851*/)/*<5849*/(/*5849*//*5852*/l/*<5852*/)/*<5849*/)/*<5847*/(/*5847*//*5853*/l/*<5853*/)/*<5847*/
}
}
}
if ($target.type === "cst/string") {
{
let first = $target[0];
if ($target[1].type === "nil") {
{
let l = $target[2];
return /*3285*//*3285*//*3302*/pstr/*<3302*/(/*3285*//*3303*/first/*<3303*/)/*<3285*/(/*3285*//*3642*/l/*<3642*/)/*<3285*/
}
}
}
}
if ($target.type === "cst/identifier") {
{
let id = $target[0];
{
let l = $target[1];
return /*3019*/(function match_3019($target) {
if ($target.type === "some") {
{
let int = $target[0];
return /*3035*//*3035*//*3036*/pprim/*<3036*/(/*3035*//*3037*//*3037*//*3038*/pint/*<3038*/(/*3037*//*3039*/int/*<3039*/)/*<3037*/(/*3037*//*3643*/l/*<3643*/)/*<3037*/)/*<3035*/(/*3035*//*3644*/l/*<3644*/)/*<3035*/
}
}
return /*1737*//*1737*//*1738*/pvar/*<1738*/(/*1737*//*1739*/id/*<1739*/)/*<1737*/(/*1737*//*3645*/l/*<3645*/)/*<1737*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 3019');})(/*!*//*3026*//*3027*/string_to_int/*<3027*/(/*3026*//*3031*/id/*<3031*/)/*<3026*/)/*<3019*/
}
}
}
if ($target.type === "cst/array") {
if ($target[0].type === "nil") {
{
let l = $target[1];
return /*3341*//*3341*//*3341*//*3348*/pcon/*<3348*/(/*3341*//*3349*/"nil"/*<3349*/)/*<3341*/(/*3341*//*3351*/nil/*<3351*/)/*<3341*/(/*3341*//*3646*/l/*<3646*/)/*<3341*/
}
}
}
if ($target.type === "cst/array") {
if ($target[0].type === "cons") {
if ($target[0][0].type === "cst/spread") {
{
let inner = $target[0][0][0];
if ($target[0][1].type === "nil") {
return /*3379*//*3387*/parse_pat/*<3387*/(/*3379*//*3388*/inner/*<3388*/)/*<3379*/
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
return /*3354*//*3354*//*3354*//*3362*/pcon/*<3362*/(/*3354*//*3363*/"cons"/*<3363*/)/*<3354*/(/*3354*//*3365*//*3365*//*3365*/cons/*<3365*/(/*3365*//*3366*//*3367*/parse_pat/*<3367*/(/*3366*//*3368*/one/*<3368*/)/*<3366*/)/*<3365*/(/*3365*//*3365*//*3365*//*3365*/cons/*<3365*/(/*3365*//*3369*//*3370*/parse_pat/*<3370*/(/*3369*//*3371*//*3371*//*3372*/cst$slarray/*<3372*/(/*3371*//*3373*/rest/*<3373*/)/*<3371*/(/*3371*//*3374*/l/*<3374*/)/*<3371*/)/*<3369*/)/*<3365*/(/*3365*//*3365*/nil/*<3365*/)/*<3365*/)/*<3365*/)/*<3354*/(/*3354*//*4263*/l/*<4263*/)/*<3354*/
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
return /*1816*//*1816*//*1816*//*1817*/pcon/*<1817*/(/*1816*//*1818*/name/*<1818*/)/*<1816*/(/*1816*//*1819*//*1819*//*1820*/map/*<1820*/(/*1819*//*1821*/rest/*<1821*/)/*<1819*/(/*1819*//*1822*/parse_pat/*<1822*/)/*<1819*/)/*<1816*/(/*1816*//*3647*/l/*<3647*/)/*<1816*/
}
}
}
}
}
}
return /*3160*//*3161*/fatal/*<3161*/(/*3160*//*3162*/`parse-pat mo match ${/*3164*//*3166*/valueToString/*<3166*/(/*3164*//*3167*/pat/*<3167*/)/*<3164*/}`/*<3162*/)/*<3160*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 1727');})(/*!*//*1730*/pat/*<1730*/)/*<1727*/ }/*<1721*/;

/*3288*//*3296*/parse_pat/*<3296*/(/*3288*//*3297*/{"0":{"0":{"0":"1","1":3375,"type":"cst/identifier"},"1":{"0":{"0":"2","1":3376,"type":"cst/identifier"},"1":{"0":{"0":{"0":"a","1":3389,"type":"cst/identifier"},"1":3395,"type":"cst/spread"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"type":"cons"},"1":3299,"type":"cst/array"}/*<3297*/)/*<3288*/
const trace_wrap = /*4689*/function name_4689(loc) { return /*4689*/function name_4689(trace) { return /*4689*/function name_4689(js) { return /*4699*/(function match_4699($target) {
if ($target.type === "none") {
return /*4784*/js/*<4784*/
}
if ($target.type === "some") {
{
let info = $target[0];
return /*4788*/`\$trace(${/*5949*//*4800*/its/*<4800*/(/*5949*//*5950*/loc/*<5950*/)/*<5949*/}, ${/*4802*//*4804*/jsonify/*<4804*/(/*4802*//*4805*/info/*<4805*/)/*<4802*/}, ${/*4795*/js/*<4795*/})`/*<4788*/
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 4699');})(/*!*//*4778*//*4778*//*4779*/map$slget/*<4779*/(/*4778*//*4780*/trace/*<4780*/)/*<4778*/(/*4778*//*4781*/loc/*<4781*/)/*<4778*/)/*<4699*/ }/*<4689*/ }/*<4689*/ }/*<4689*/;

const trace_and = /*4741*/function name_4741(loc) { return /*4741*/function name_4741(trace) { return /*4741*/function name_4741(value) { return /*4741*/function name_4741(js) { return /*4750*/(function match_4750($target) {
if ($target.type === "none") {
return /*4820*/js/*<4820*/
}
if ($target.type === "some") {
{
let info = $target[0];
return /*4824*/`(\$trace(${/*5942*//*4826*/its/*<4826*/(/*5942*//*5943*/loc/*<5943*/)/*<5942*/}, ${/*4828*//*4830*/jsonify/*<4830*/(/*4828*//*4831*/info/*<4831*/)/*<4828*/}, ${/*4832*/value/*<4832*/}), ${/*4834*/js/*<4834*/})`/*<4824*/
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 4750');})(/*!*//*4814*//*4814*//*4815*/map$slget/*<4815*/(/*4814*//*4816*/trace/*<4816*/)/*<4814*/(/*4814*//*4817*/loc/*<4817*/)/*<4814*/)/*<4750*/ }/*<4741*/ }/*<4741*/ }/*<4741*/ }/*<4741*/;

const trace_and_block = /*4850*/function name_4850(loc) { return /*4850*/function name_4850(trace) { return /*4850*/function name_4850(value) { return /*4850*/function name_4850(js) { return /*4859*/(function match_4859($target) {
if ($target.type === "none") {
return /*4867*/js/*<4867*/
}
if ($target.type === "some") {
{
let info = $target[0];
return /*4871*/`\$trace(${/*5951*//*4873*/its/*<4873*/(/*5951*//*5952*/loc/*<5952*/)/*<5951*/}, ${/*4875*//*4877*/jsonify/*<4877*/(/*4875*//*4878*/info/*<4878*/)/*<4875*/}, ${/*4879*/value/*<4879*/});\n${/*4881*/js/*<4881*/}`/*<4871*/
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 4859');})(/*!*//*4861*//*4861*//*4862*/map$slget/*<4862*/(/*4861*//*4863*/trace/*<4863*/)/*<4861*/(/*4861*//*4864*/loc/*<4864*/)/*<4861*/)/*<4859*/ }/*<4850*/ }/*<4850*/ }/*<4850*/ }/*<4850*/;

const source_map = /*4890*/function name_4890(loc) { return /*4890*/function name_4890(js) { return /*4897*/`/*${/*5953*//*4899*/its/*<4899*/(/*5953*//*5954*/loc/*<5954*/)/*<5953*/}*/${/*4901*/js/*<4901*/}/*<${/*5955*//*4903*/its/*<4903*/(/*5955*//*5956*/loc/*<5956*/)/*<5955*/}*/`/*<4897*/ }/*<4890*/ }/*<4890*/;

/*5529*//*5529*//*5530*/$co/*<5530*/(/*5529*//*931*/parse_type/*<931*/)/*<5529*/(/*5529*//*5532*//*5532*//*5532*/cons/*<5532*/(/*5532*//*5533*//*5533*//*5534*/$co/*<5534*/(/*5533*//*932*/{"0":{"0":{"0":"hi","1":5527,"type":"cst/identifier"},"1":{"0":{"0":"ho","1":5528,"type":"cst/identifier"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"1":5526,"type":"cst/list"}/*<932*/)/*<5533*/(/*5533*//*5537*//*5537*//*5537*//*5538*/tapp/*<5538*/(/*5537*//*5539*//*5539*//*5540*/tcon/*<5540*/(/*5539*//*5541*/"hi"/*<5541*/)/*<5539*/(/*5539*//*5543*/5527/*<5543*/)/*<5539*/)/*<5537*/(/*5537*//*5544*//*5544*//*5545*/tcon/*<5545*/(/*5544*//*5546*/"ho"/*<5546*/)/*<5544*/(/*5544*//*5548*/5528/*<5548*/)/*<5544*/)/*<5537*/(/*5537*//*5549*/5526/*<5549*/)/*<5537*/)/*<5533*/)/*<5532*/(/*5532*//*5532*//*5532*//*5532*/cons/*<5532*/(/*5532*//*5550*//*5550*//*5551*/$co/*<5551*/(/*5550*//*5552*/{"0":{"0":{"0":"fn","1":5556,"type":"cst/identifier"},"1":{"0":{"0":{"0":{"0":"x","1":5558,"type":"cst/identifier"},"1":{"type":"nil"},"type":"cons"},"1":5557,"type":"cst/array"},"1":{"0":{"0":"y","1":5559,"type":"cst/identifier"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"type":"cons"},"1":5555,"type":"cst/list"}/*<5552*/)/*<5550*/(/*5550*//*5553*//*5553*//*5553*//*5659*/tapp/*<5659*/(/*5553*//*5660*//*5660*//*5660*//*5661*/tapp/*<5661*/(/*5660*//*5662*//*5662*//*5663*/tcon/*<5663*/(/*5662*//*5664*/"->"/*<5664*/)/*<5662*/(/*5662*//*5666*/-1/*<5666*/)/*<5662*/)/*<5660*/(/*5660*//*5667*//*5667*//*5668*/tcon/*<5668*/(/*5667*//*5669*/"x"/*<5669*/)/*<5667*/(/*5667*//*5671*/5558/*<5671*/)/*<5667*/)/*<5660*/(/*5660*//*5672*/-1/*<5672*/)/*<5660*/)/*<5553*/(/*5553*//*5673*//*5673*//*5674*/tcon/*<5674*/(/*5673*//*5675*/"y"/*<5675*/)/*<5673*/(/*5673*//*5677*/5559/*<5677*/)/*<5673*/)/*<5553*/(/*5553*//*5678*/-1/*<5678*/)/*<5553*/)/*<5550*/)/*<5532*/(/*5532*//*5532*//*5532*//*5532*/cons/*<5532*/(/*5532*//*5679*//*5679*//*5680*/$co/*<5680*/(/*5679*//*5681*/{"0":{"0":{"0":"fn","1":5686,"type":"cst/identifier"},"1":{"0":{"0":{"0":{"0":"a","1":5688,"type":"cst/identifier"},"1":{"0":{"0":"b","1":5689,"type":"cst/identifier"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"1":5687,"type":"cst/array"},"1":{"0":{"0":"c","1":5690,"type":"cst/identifier"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"type":"cons"},"1":5685,"type":"cst/list"}/*<5681*/)/*<5679*/(/*5679*//*5682*//*5682*//*5682*//*5694*/tapp/*<5694*/(/*5682*//*5695*//*5695*//*5695*//*5696*/tapp/*<5696*/(/*5695*//*5697*//*5697*//*5698*/tcon/*<5698*/(/*5697*//*5699*/"->"/*<5699*/)/*<5697*/(/*5697*//*5701*/-1/*<5701*/)/*<5697*/)/*<5695*/(/*5695*//*5702*//*5702*//*5703*/tcon/*<5703*/(/*5702*//*5704*/"a"/*<5704*/)/*<5702*/(/*5702*//*5706*/5688/*<5706*/)/*<5702*/)/*<5695*/(/*5695*//*5707*/-1/*<5707*/)/*<5695*/)/*<5682*/(/*5682*//*5708*//*5708*//*5708*//*5709*/tapp/*<5709*/(/*5708*//*5710*//*5710*//*5710*//*5711*/tapp/*<5711*/(/*5710*//*5712*//*5712*//*5713*/tcon/*<5713*/(/*5712*//*5714*/"->"/*<5714*/)/*<5712*/(/*5712*//*5716*/-1/*<5716*/)/*<5712*/)/*<5710*/(/*5710*//*5717*//*5717*//*5718*/tcon/*<5718*/(/*5717*//*5719*/"b"/*<5719*/)/*<5717*/(/*5717*//*5721*/5689/*<5721*/)/*<5717*/)/*<5710*/(/*5710*//*5722*/-1/*<5722*/)/*<5710*/)/*<5708*/(/*5708*//*5723*//*5723*//*5724*/tcon/*<5724*/(/*5723*//*5725*/"c"/*<5725*/)/*<5723*/(/*5723*//*5727*/5690/*<5727*/)/*<5723*/)/*<5708*/(/*5708*//*5728*/-1/*<5728*/)/*<5708*/)/*<5682*/(/*5682*//*5729*/-1/*<5729*/)/*<5682*/)/*<5679*/)/*<5532*/(/*5532*//*5532*/nil/*<5532*/)/*<5532*/)/*<5532*/)/*<5532*/)/*<5529*/
const parse_stmt = /*599*/function name_599(cst) { return /*606*/(function match_606($target) {
if ($target.type === "cst/list") {
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
return /*789*//*789*//*789*//*789*//*948*/sdef/*<948*/(/*789*//*949*/id/*<949*/)/*<789*/(/*789*//*3940*/li/*<3940*/)/*<789*/(/*789*//*950*//*951*/parse_expr/*<951*/(/*950*//*952*/value/*<952*/)/*<950*/)/*<789*/(/*789*//*3941*/l/*<3941*/)/*<789*/
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
return /*2010*//*2010*//*2010*//*2010*//*2025*/sdef/*<2025*/(/*2010*//*2026*/id/*<2026*/)/*<2010*/(/*2010*//*3955*/li/*<3955*/)/*<2010*/(/*2010*//*2027*//*2028*/parse_expr/*<2028*/(/*2027*//*2029*//*2029*//*2030*/cst$sllist/*<2030*/(/*2029*//*2031*//*2031*//*2031*/cons/*<2031*/(/*2031*//*2032*//*2032*//*2033*/cst$slidentifier/*<2033*/(/*2032*//*2034*/"fn"/*<2034*/)/*<2032*/(/*2032*//*2036*/a/*<2036*/)/*<2032*/)/*<2031*/(/*2031*//*2031*//*2031*//*2031*/cons/*<2031*/(/*2031*//*2037*//*2037*//*2038*/cst$slarray/*<2038*/(/*2037*//*2039*/args/*<2039*/)/*<2037*/(/*2037*//*2041*/b/*<2041*/)/*<2037*/)/*<2031*/(/*2031*//*2031*//*2031*//*2031*/cons/*<2031*/(/*2031*//*2042*/body/*<2042*/)/*<2031*/(/*2031*//*2031*/nil/*<2031*/)/*<2031*/)/*<2031*/)/*<2031*/)/*<2029*/(/*2029*//*2043*/c/*<2043*/)/*<2029*/)/*<2027*/)/*<2010*/(/*2010*//*3956*/c/*<3956*/)/*<2010*/
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
return /*1365*//*1365*//*1365*//*1365*//*1365*//*1475*/mk_deftype/*<1475*/(/*1365*//*1476*/id/*<1476*/)/*<1365*/(/*1365*//*3976*/li/*<3976*/)/*<1365*/(/*1365*//*5014*/nil/*<5014*/)/*<1365*/(/*1365*//*1477*/items/*<1477*/)/*<1365*/(/*1365*//*3977*/l/*<3977*/)/*<1365*/
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
return /*812*//*812*//*812*//*812*//*812*//*1468*/mk_deftype/*<1468*/(/*812*//*1469*/id/*<1469*/)/*<812*/(/*812*//*3973*/li/*<3973*/)/*<812*/(/*812*//*5015*/args/*<5015*/)/*<812*/(/*812*//*1470*/items/*<1470*/)/*<812*/(/*812*//*3974*/l/*<3974*/)/*<812*/
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
return /*3170*//*3170*//*3171*/sexpr/*<3171*/(/*3170*//*954*//*955*/parse_expr/*<955*/(/*954*//*956*/cst/*<956*/)/*<954*/)/*<3170*/(/*3170*//*4949*/(function match_4949($target) {
if ($target.type === "cst/list") {
{
let l = $target[1];
return /*4956*/l/*<4956*/
}
}
if ($target.type === "cst/identifier") {
{
let l = $target[1];
return /*4961*/l/*<4961*/
}
}
if ($target.type === "cst/array") {
{
let l = $target[1];
return /*4966*/l/*<4966*/
}
}
if ($target.type === "cst/string") {
{
let l = $target[2];
return /*4971*/l/*<4971*/
}
}
if ($target.type === "cst/spread") {
{
let l = $target[1];
return /*5006*/l/*<5006*/
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 4949');})(/*!*//*4951*/cst/*<4951*/)/*<4949*/)/*<3170*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 606');})(/*!*//*608*/cst/*<608*/)/*<606*/ }/*<599*/;


const parse_expr = /*957*/function name_957(cst) { return /*963*/(function match_963($target) {
if ($target.type === "cst/identifier") {
if ($target[0] === "true"){
{
let l = $target[1];
return /*974*//*974*//*978*/eprim/*<978*/(/*974*//*979*//*979*//*980*/pbool/*<980*/(/*979*//*981*/true/*<981*/)/*<979*/(/*979*//*3511*/l/*<3511*/)/*<979*/)/*<974*/(/*974*//*3510*/l/*<3510*/)/*<974*/
}
}
}
if ($target.type === "cst/identifier") {
if ($target[0] === "false"){
{
let l = $target[1];
return /*987*//*987*//*989*/eprim/*<989*/(/*987*//*990*//*990*//*991*/pbool/*<991*/(/*990*//*992*/false/*<992*/)/*<990*/(/*990*//*3512*/l/*<3512*/)/*<990*/)/*<987*/(/*987*//*3513*/l/*<3513*/)/*<987*/
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
return /*994*//*994*//*994*//*1008*/estr/*<1008*/(/*994*//*1009*/first/*<1009*/)/*<994*/(/*994*//*1010*//*1010*//*1011*/map/*<1011*/(/*1010*//*1012*/templates/*<1012*/)/*<1010*/(/*1010*//*1013*/function name_1013(tpl) { return /*1017*/(function let_1017() {const $target = /*1024*/tpl/*<1024*/;
if ($target.type === ",,") {
{
let expr = $target[0];
{
let string = $target[1];
{
let l = $target[2];
return /*1025*//*1025*//*1025*//*1026*/$co$co/*<1026*/(/*1025*//*1027*//*1028*/parse_expr/*<1028*/(/*1027*//*1029*/expr/*<1029*/)/*<1027*/)/*<1025*/(/*1025*//*1030*/string/*<1030*/)/*<1025*/(/*1025*//*3516*/l/*<3516*/)/*<1025*/
}
}
}
};
throw new Error('let pattern not matched 1020. ' + valueToString($target));})(/*!*/)/*<1017*/ }/*<1013*/)/*<1010*/)/*<994*/(/*994*//*3514*/l/*<3514*/)/*<994*/
}
}
}
}
if ($target.type === "cst/identifier") {
{
let id = $target[0];
{
let l = $target[1];
return /*970*/(function match_970($target) {
if ($target.type === "some") {
{
let int = $target[0];
return /*1061*//*1061*//*1062*/eprim/*<1062*/(/*1061*//*1063*//*1063*//*1064*/pint/*<1064*/(/*1063*//*1065*/int/*<1065*/)/*<1063*/(/*1063*//*3535*/l/*<3535*/)/*<1063*/)/*<1061*/(/*1061*//*3536*/l/*<3536*/)/*<1061*/
}
}
if ($target.type === "none") {
return /*1068*//*1068*//*1069*/evar/*<1069*/(/*1068*//*1071*/id/*<1071*/)/*<1068*/(/*1068*//*3537*/l/*<3537*/)/*<1068*/
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 970');})(/*!*//*1055*//*1056*/string_to_int/*<1056*/(/*1055*//*1057*/id/*<1057*/)/*<1055*/)/*<970*/
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
return /*3070*//*3070*//*3079*/equot/*<3079*/(/*3070*//*3080*//*3081*/parse_expr/*<3081*/(/*3080*//*3082*/body/*<3082*/)/*<3080*/)/*<3070*/(/*3070*//*3548*/l/*<3548*/)/*<3070*/
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
return /*3091*//*3091*//*3101*/equotquot/*<3101*/(/*3091*//*3102*/body/*<3102*/)/*<3091*/(/*3091*//*3549*/l/*<3549*/)/*<3091*/
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
return /*5114*//*5114*//*5122*/equot$slstmt/*<5122*/(/*5114*//*5123*//*5124*/parse_stmt/*<5124*/(/*5123*//*5125*/body/*<5125*/)/*<5123*/)/*<5114*/(/*5114*//*5126*/l/*<5126*/)/*<5114*/
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
return /*5292*//*5292*//*5302*/equot$sltype/*<5302*/(/*5292*//*5303*//*5305*/parse_type/*<5305*/(/*5303*//*5306*/body/*<5306*/)/*<5303*/)/*<5292*/(/*5292*//*5307*/l/*<5307*/)/*<5292*/
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
return /*5319*//*5319*//*5320*/equot$slpat/*<5320*/(/*5319*//*5321*//*5322*/parse_pat/*<5322*/(/*5321*//*5323*/body/*<5323*/)/*<5321*/)/*<5319*/(/*5319*//*5324*/l/*<5324*/)/*<5319*/
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
return /*4575*//*4575*//*4575*//*4586*/ematch/*<4586*/(/*4575*//*4587*//*4588*/parse_expr/*<4588*/(/*4587*//*4589*/cond/*<4589*/)/*<4587*/)/*<4575*/(/*4575*//*4590*//*4590*//*4590*/cons/*<4590*/(/*4590*//*4591*//*4591*//*4592*/$co/*<4592*/(/*4591*//*4593*//*4593*//*4594*/pprim/*<4594*/(/*4593*//*4597*//*4597*//*4598*/pbool/*<4598*/(/*4597*//*4599*/true/*<4599*/)/*<4597*/(/*4597*//*4600*/l/*<4600*/)/*<4597*/)/*<4593*/(/*4593*//*4601*/l/*<4601*/)/*<4593*/)/*<4591*/(/*4591*//*4602*//*4603*/parse_expr/*<4603*/(/*4602*//*4604*/yes/*<4604*/)/*<4602*/)/*<4591*/)/*<4590*/(/*4590*//*4590*//*4590*//*4590*/cons/*<4590*/(/*4590*//*4605*//*4605*//*4606*/$co/*<4606*/(/*4605*//*4607*//*4608*/pany/*<4608*/(/*4607*//*4609*/l/*<4609*/)/*<4607*/)/*<4605*/(/*4605*//*4610*//*4611*/parse_expr/*<4611*/(/*4610*//*4612*/no/*<4612*/)/*<4610*/)/*<4605*/)/*<4590*/(/*4590*//*4590*/nil/*<4590*/)/*<4590*/)/*<4590*/)/*<4575*/(/*4575*//*4613*/l/*<4613*/)/*<4575*/
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
return /*1073*//*1073*//*1073*//*1213*/foldr/*<1213*/(/*1073*//*1214*//*1215*/parse_expr/*<1215*/(/*1214*//*1216*/body/*<1216*/)/*<1214*/)/*<1073*/(/*1073*//*1217*/args/*<1217*/)/*<1073*/(/*1073*//*1218*/function name_1218(body) { return /*1218*/function name_1218(arg) { return /*1223*/(function match_1223($target) {
if ($target.type === "cst/identifier") {
{
let name = $target[0];
{
let l = $target[1];
return /*1230*//*1230*//*1230*//*1230*//*1231*/elambda/*<1231*/(/*1230*//*1232*/name/*<1232*/)/*<1230*/(/*1230*//*3566*/l/*<3566*/)/*<1230*/(/*1230*//*1233*/body/*<1233*/)/*<1230*/(/*1230*//*3567*/b/*<3567*/)/*<1230*/
}
}
}
return /*1917*//*1917*//*1917*//*1917*//*1918*/elambda/*<1918*/(/*1917*//*1919*/"\$fn-arg"/*<1919*/)/*<1917*/(/*1917*//*3569*/-1/*<3569*/)/*<1917*/(/*1917*//*1921*//*1921*//*1921*//*1922*/ematch/*<1922*/(/*1921*//*1923*//*1923*//*1924*/evar/*<1924*/(/*1923*//*1925*/"\$fn-arg"/*<1925*/)/*<1923*/(/*1923*//*3901*/-1/*<3901*/)/*<1923*/)/*<1921*/(/*1921*//*1927*//*1927*//*1927*/cons/*<1927*/(/*1927*//*1928*//*1928*//*1929*/$co/*<1929*/(/*1928*//*1930*//*1931*/parse_pat/*<1931*/(/*1930*//*1932*/arg/*<1932*/)/*<1930*/)/*<1928*/(/*1928*//*1933*/body/*<1933*/)/*<1928*/)/*<1927*/(/*1927*//*1927*/nil/*<1927*/)/*<1927*/)/*<1921*/(/*1921*//*3886*/b/*<3886*/)/*<1921*/)/*<1917*/(/*1917*//*3570*/b/*<3570*/)/*<1917*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 1223');})(/*!*//*1225*/arg/*<1225*/)/*<1223*/ }/*<1218*/ }/*<1218*/)/*<1073*/
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
return /*2947*//*2947*//*2947*//*2962*/ematch/*<2962*/(/*2947*//*2963*//*2964*/parse_expr/*<2964*/(/*2963*//*2965*/target/*<2965*/)/*<2963*/)/*<2947*/(/*2947*//*2966*//*2966*//*2967*/map/*<2967*/(/*2966*//*2968*//*2969*/pairs/*<2969*/(/*2968*//*2970*/cases/*<2970*/)/*<2968*/)/*<2966*/(/*2966*//*2971*/function name_2971($case) { return /*2975*/(function let_2975() {const $target = /*3000*/$case/*<3000*/;
if ($target.type === ",") {
{
let pat = $target[0];
{
let expr = $target[1];
return /*2982*//*2982*//*2983*/$co/*<2983*/(/*2982*//*2984*//*2985*/parse_pat/*<2985*/(/*2984*//*2986*/pat/*<2986*/)/*<2984*/)/*<2982*/(/*2982*//*2987*//*2988*/parse_expr/*<2988*/(/*2987*//*2989*/expr/*<2989*/)/*<2987*/)/*<2982*/
}
}
};
throw new Error('let pattern not matched 2978. ' + valueToString($target));})(/*!*/)/*<2975*/ }/*<2971*/)/*<2966*/)/*<2947*/(/*2947*//*3601*/l/*<3601*/)/*<2947*/
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
return /*1628*//*1628*//*1628*//*1643*/foldr/*<1643*/(/*1628*//*1644*//*1645*/parse_expr/*<1645*/(/*1644*//*1646*/body/*<1646*/)/*<1644*/)/*<1628*/(/*1628*//*1647*//*1648*/pairs/*<1648*/(/*1647*//*1649*/inits/*<1649*/)/*<1647*/)/*<1628*/(/*1628*//*1650*/function name_1650(body) { return /*1650*/function name_1650(init) { return /*1656*/(function let_1656() {const $target = /*1663*/init/*<1663*/;
if ($target.type === ",") {
{
let pat = $target[0];
{
let value = $target[1];
return /*1664*//*1664*//*1664*//*1664*//*1665*/elet/*<1665*/(/*1664*//*4324*//*4325*/parse_pat/*<4325*/(/*4324*//*4326*/pat/*<4326*/)/*<4324*/)/*<1664*/(/*1664*//*1667*//*1668*/parse_expr/*<1668*/(/*1667*//*1669*/value/*<1669*/)/*<1667*/)/*<1664*/(/*1664*//*1714*/body/*<1714*/)/*<1664*/(/*1664*//*3810*/l/*<3810*/)/*<1664*/
}
}
};
throw new Error('let pattern not matched 1659. ' + valueToString($target));})(/*!*/)/*<1656*/ }/*<1650*/ }/*<1650*/)/*<1628*/
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
return /*1575*//*1575*//*1575*//*1576*/foldl/*<1576*/(/*1575*//*1577*//*1578*/parse_expr/*<1578*/(/*1577*//*1579*/target/*<1579*/)/*<1577*/)/*<1575*/(/*1575*//*1580*/args/*<1580*/)/*<1575*/(/*1575*//*1581*/function name_1581(target) { return /*1581*/function name_1581(arg) { return /*1586*//*1586*//*1586*//*1587*/eapp/*<1587*/(/*1586*//*1588*/target/*<1588*/)/*<1586*/(/*1586*//*1589*//*1590*/parse_expr/*<1590*/(/*1589*//*1591*/arg/*<1591*/)/*<1589*/)/*<1586*/(/*1586*//*3745*/l/*<3745*/)/*<1586*/ }/*<1581*/ }/*<1581*/)/*<1575*/
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
return /*3407*//*3407*//*3460*/parse_array/*<3460*/(/*3407*//*3461*/args/*<3461*/)/*<3407*/(/*3407*//*3681*/l/*<3681*/)/*<3407*/
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 963');})(/*!*//*965*/cst/*<965*/)/*<963*/ }/*<957*/;


const parse_array = /*3416*/function name_3416(args) { return /*3416*/function name_3416(l) { return /*3422*/(function match_3422($target) {
if ($target.type === "nil") {
return /*3426*//*3426*//*3427*/evar/*<3427*/(/*3426*//*3428*/"nil"/*<3428*/)/*<3426*/(/*3426*//*3675*/l/*<3675*/)/*<3426*/
}
if ($target.type === "cons") {
if ($target[0].type === "cst/spread") {
{
let inner = $target[0][0];
if ($target[1].type === "nil") {
return /*3434*//*3435*/parse_expr/*<3435*/(/*3434*//*3436*/inner/*<3436*/)/*<3434*/
}
}
}
}
if ($target.type === "cons") {
{
let one = $target[0];
{
let rest = $target[1];
return /*3443*//*3443*//*3443*//*3444*/eapp/*<3444*/(/*3443*//*3445*//*3445*//*3445*//*3446*/eapp/*<3446*/(/*3445*//*3450*//*3450*//*3451*/evar/*<3451*/(/*3450*//*3452*/"cons"/*<3452*/)/*<3450*/(/*3450*//*3677*/l/*<3677*/)/*<3450*/)/*<3445*/(/*3445*//*3454*//*3455*/parse_expr/*<3455*/(/*3454*//*3456*/one/*<3456*/)/*<3454*/)/*<3445*/(/*3445*//*3678*/l/*<3678*/)/*<3445*/)/*<3443*/(/*3443*//*3457*//*3457*//*3458*/parse_array/*<3458*/(/*3457*//*3459*/rest/*<3459*/)/*<3457*/(/*3457*//*3676*/l/*<3676*/)/*<3457*/)/*<3443*/(/*3443*//*3679*/l/*<3679*/)/*<3443*/
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 3422');})(/*!*//*3424*/args/*<3424*/)/*<3422*/ }/*<3416*/ }/*<3416*/;

const pat_loop = /*2288*/function name_2288(target) { return /*2288*/function name_2288(args) { return /*2288*/function name_2288(i) { return /*2288*/function name_2288(inner) { return /*2288*/function name_2288(trace) { return /*2297*/(function match_2297($target) {
if ($target.type === "nil") {
return /*2301*/inner/*<2301*/
}
if ($target.type === "cons") {
{
let arg = $target[0];
{
let rest = $target[1];
return /*2308*//*2308*//*2308*//*2308*//*2309*/compile_pat/*<2309*/(/*2308*//*2310*/arg/*<2310*/)/*<2308*/(/*2308*//*2311*/`${/*2395*/target/*<2395*/}[${/*5980*//*2397*/its/*<2397*/(/*5980*//*5981*/i/*<5981*/)/*<5980*/}]`/*<2311*/)/*<2308*/(/*2308*//*2313*//*2313*//*2313*//*2313*//*2313*//*2314*/pat_loop/*<2314*/(/*2313*//*2315*/target/*<2315*/)/*<2313*/(/*2313*//*2316*/rest/*<2316*/)/*<2313*/(/*2313*//*2317*//*2317*//*2318*/$pl/*<2318*/(/*2317*//*2319*/i/*<2319*/)/*<2317*/(/*2317*//*2320*/1/*<2320*/)/*<2317*/)/*<2313*/(/*2313*//*2321*/inner/*<2321*/)/*<2313*/(/*2313*//*4847*/trace/*<4847*/)/*<2313*/)/*<2308*/(/*2308*//*4845*/trace/*<4845*/)/*<2308*/
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 2297');})(/*!*//*2299*/args/*<2299*/)/*<2297*/ }/*<2288*/ }/*<2288*/ }/*<2288*/ }/*<2288*/ }/*<2288*/;


const compile_pat = /*2322*/function name_2322(pat) { return /*2322*/function name_2322(target) { return /*2322*/function name_2322(inner) { return /*2322*/function name_2322(trace) { return /*4883*//*4883*//*4883*//*4883*//*4884*/trace_and_block/*<4884*/(/*4883*//*4885*//*4886*/pat_loc/*<4886*/(/*4885*//*4887*/pat/*<4887*/)/*<4885*/)/*<4883*/(/*4883*//*4888*/trace/*<4888*/)/*<4883*/(/*4883*//*4889*/target/*<4889*/)/*<4883*/(/*4883*//*2330*/(function match_2330($target) {
if ($target.type === "pany") {
{
let l = $target[0];
return /*2335*/inner/*<2335*/
}
}
if ($target.type === "pprim") {
{
let prim = $target[0];
{
let l = $target[1];
return /*2339*/(function match_2339($target) {
if ($target.type === "pint") {
{
let int = $target[0];
return /*2345*/`if (${/*2399*/target/*<2399*/} === ${/*5978*//*2401*/its/*<2401*/(/*5978*//*5979*/int/*<5979*/)/*<5978*/}) {\n${/*2407*/inner/*<2407*/}\n}`/*<2345*/
}
}
if ($target.type === "pbool") {
{
let bool = $target[0];
return /*2350*/`if (${/*2403*/target/*<2403*/} === ${/*5970*/(function match_5970($target) {
if ($target === true) {
return /*5973*/"true"/*<5973*/
}
return /*5976*/"false"/*<5976*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 5970');})(/*!*//*5971*/bool/*<5971*/)/*<5970*/}) {\n${/*2409*/inner/*<2409*/}\n}`/*<2350*/
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 2339');})(/*!*//*2341*/prim/*<2341*/)/*<2339*/
}
}
}
if ($target.type === "pstr") {
{
let str = $target[0];
{
let l = $target[1];
return /*2355*/`if (${/*2411*/target/*<2411*/} === \"${/*2413*/str/*<2413*/}\"){\n${/*2415*/inner/*<2415*/}\n}`/*<2355*/
}
}
}
if ($target.type === "pvar") {
{
let name = $target[0];
{
let l = $target[1];
return /*2360*/`{\nlet ${/*2417*//*2419*/sanitize/*<2419*/(/*2417*//*2420*/name/*<2420*/)/*<2417*/} = ${/*2421*/target/*<2421*/};\n${/*4836*/inner/*<4836*/}\n}`/*<2360*/
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
return /*2366*/`if (${/*2425*/target/*<2425*/}.type === \"${/*2427*/name/*<2427*/}\") {\n${/*2429*//*2429*//*2429*//*2429*//*2429*//*2431*/pat_loop/*<2431*/(/*2429*//*2432*/target/*<2432*/)/*<2429*/(/*2429*//*2433*/args/*<2433*/)/*<2429*/(/*2429*//*2434*/0/*<2434*/)/*<2429*/(/*2429*//*2435*/inner/*<2435*/)/*<2429*/(/*2429*//*4846*/trace/*<4846*/)/*<2429*/}\n}`/*<2366*/
}
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 2330');})(/*!*//*2332*/pat/*<2332*/)/*<2330*/)/*<4883*/ }/*<2322*/ }/*<2322*/ }/*<2322*/ }/*<2322*/;

/*684*//*684*//*1292*/$co/*<1292*/(/*684*//*1293*/parse_stmt/*<1293*/)/*<684*/(/*684*//*1294*//*1294*//*1294*/cons/*<1294*/(/*1294*//*1295*//*1295*//*1296*/$co/*<1296*/(/*1295*//*1297*/{"0":{"0":{"0":"def","1":1301,"type":"cst/identifier"},"1":{"0":{"0":"a","1":1302,"type":"cst/identifier"},"1":{"0":{"0":"2","1":1303,"type":"cst/identifier"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"type":"cons"},"1":1300,"type":"cst/list"}/*<1297*/)/*<1295*/(/*1295*//*1298*//*1298*//*1298*//*1298*//*3942*/sdef/*<3942*/(/*1298*//*3943*/"a"/*<3943*/)/*<1298*/(/*1298*//*3945*/1302/*<3945*/)/*<1298*/(/*1298*//*3946*//*3946*//*3947*/eprim/*<3947*/(/*3946*//*3948*//*3948*//*3949*/pint/*<3949*/(/*3948*//*3950*/2/*<3950*/)/*<3948*/(/*3948*//*3951*/1303/*<3951*/)/*<3948*/)/*<3946*/(/*3946*//*3952*/1303/*<3952*/)/*<3946*/)/*<1298*/(/*1298*//*3953*/1300/*<3953*/)/*<1298*/)/*<1295*/)/*<1294*/(/*1294*//*1294*//*1294*//*1294*/cons/*<1294*/(/*1294*//*1312*//*1312*//*1313*/$co/*<1313*/(/*1312*//*1314*/{"0":{"0":{"0":"deftype","1":1334,"type":"cst/identifier"},"1":{"0":{"0":"what","1":1335,"type":"cst/identifier"},"1":{"0":{"0":{"0":{"0":"one","1":1337,"type":"cst/identifier"},"1":{"0":{"0":"int","1":1338,"type":"cst/identifier"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"1":1336,"type":"cst/list"},"1":{"0":{"0":{"0":{"0":"two","1":1340,"type":"cst/identifier"},"1":{"0":{"0":"bool","1":1341,"type":"cst/identifier"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"1":1339,"type":"cst/list"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"type":"cons"},"type":"cons"},"1":1333,"type":"cst/list"}/*<1314*/)/*<1312*/(/*1312*//*1315*//*1315*//*1315*//*1315*//*1315*//*5079*/sdeftype/*<5079*/(/*1315*//*5080*/"what"/*<5080*/)/*<1315*/(/*1315*//*5082*/1335/*<5082*/)/*<1315*/(/*1315*//*5083*/nil/*<5083*/)/*<1315*/(/*1315*//*5084*//*5084*//*5084*/cons/*<5084*/(/*5084*//*5085*//*5085*//*5085*//*5085*//*5086*/$co$co$co/*<5086*/(/*5085*//*5087*/"one"/*<5087*/)/*<5085*/(/*5085*//*5089*/1337/*<5089*/)/*<5085*/(/*5085*//*5090*//*5090*//*5090*/cons/*<5090*/(/*5090*//*5091*//*5091*//*5092*/tcon/*<5092*/(/*5091*//*5093*/"int"/*<5093*/)/*<5091*/(/*5091*//*5095*/1338/*<5095*/)/*<5091*/)/*<5090*/(/*5090*//*5090*/nil/*<5090*/)/*<5090*/)/*<5085*/(/*5085*//*5096*/1336/*<5096*/)/*<5085*/)/*<5084*/(/*5084*//*5084*//*5084*//*5084*/cons/*<5084*/(/*5084*//*5097*//*5097*//*5097*//*5097*//*5098*/$co$co$co/*<5098*/(/*5097*//*5099*/"two"/*<5099*/)/*<5097*/(/*5097*//*5101*/1340/*<5101*/)/*<5097*/(/*5097*//*5102*//*5102*//*5102*/cons/*<5102*/(/*5102*//*5103*//*5103*//*5104*/tcon/*<5104*/(/*5103*//*5105*/"bool"/*<5105*/)/*<5103*/(/*5103*//*5107*/1341/*<5107*/)/*<5103*/)/*<5102*/(/*5102*//*5102*/nil/*<5102*/)/*<5102*/)/*<5097*/(/*5097*//*5108*/1339/*<5108*/)/*<5097*/)/*<5084*/(/*5084*//*5084*/nil/*<5084*/)/*<5084*/)/*<5084*/)/*<1315*/(/*1315*//*5109*/1333/*<5109*/)/*<1315*/)/*<1312*/)/*<1294*/(/*1294*//*1294*//*1294*//*1294*/cons/*<1294*/(/*1294*//*1478*//*1478*//*1479*/$co/*<1479*/(/*1478*//*1480*/{"0":{"0":{"0":"deftype","1":1484,"type":"cst/identifier"},"1":{"0":{"0":{"0":{"0":"array","1":1486,"type":"cst/identifier"},"1":{"0":{"0":"a","1":1487,"type":"cst/identifier"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"1":1485,"type":"cst/list"},"1":{"0":{"0":{"0":{"0":"nil","1":1489,"type":"cst/identifier"},"1":{"type":"nil"},"type":"cons"},"1":1488,"type":"cst/list"},"1":{"0":{"0":{"0":{"0":"cons","1":1491,"type":"cst/identifier"},"1":{"0":{"0":{"0":{"0":"array","1":1493,"type":"cst/identifier"},"1":{"0":{"0":"a","1":1494,"type":"cst/identifier"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"1":1492,"type":"cst/list"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"1":1490,"type":"cst/list"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"type":"cons"},"type":"cons"},"1":1483,"type":"cst/list"}/*<1480*/)/*<1478*/(/*1478*//*1481*//*1481*//*1481*//*1481*//*1481*//*5040*/sdeftype/*<5040*/(/*1481*//*5041*/"array"/*<5041*/)/*<1481*/(/*1481*//*5043*/1486/*<5043*/)/*<1481*/(/*1481*//*5044*//*5044*//*5044*/cons/*<5044*/(/*5044*//*5045*//*5045*//*5046*/$co/*<5046*/(/*5045*//*5047*/"a"/*<5047*/)/*<5045*/(/*5045*//*5049*/1487/*<5049*/)/*<5045*/)/*<5044*/(/*5044*//*5044*/nil/*<5044*/)/*<5044*/)/*<1481*/(/*1481*//*5050*//*5050*//*5050*/cons/*<5050*/(/*5050*//*5051*//*5051*//*5051*//*5051*//*5052*/$co$co$co/*<5052*/(/*5051*//*5053*/"nil"/*<5053*/)/*<5051*/(/*5051*//*5055*/1489/*<5055*/)/*<5051*/(/*5051*//*5056*/nil/*<5056*/)/*<5051*/(/*5051*//*5057*/1488/*<5057*/)/*<5051*/)/*<5050*/(/*5050*//*5050*//*5050*//*5050*/cons/*<5050*/(/*5050*//*5058*//*5058*//*5058*//*5058*//*5059*/$co$co$co/*<5059*/(/*5058*//*5060*/"cons"/*<5060*/)/*<5058*/(/*5058*//*5062*/1491/*<5062*/)/*<5058*/(/*5058*//*5063*//*5063*//*5063*/cons/*<5063*/(/*5063*//*5064*//*5064*//*5064*//*5065*/tapp/*<5065*/(/*5064*//*5066*//*5066*//*5067*/tcon/*<5067*/(/*5066*//*5068*/"array"/*<5068*/)/*<5066*/(/*5066*//*5070*/1493/*<5070*/)/*<5066*/)/*<5064*/(/*5064*//*5071*//*5071*//*5072*/tcon/*<5072*/(/*5071*//*5073*/"a"/*<5073*/)/*<5071*/(/*5071*//*5075*/1494/*<5075*/)/*<5071*/)/*<5064*/(/*5064*//*5076*/1492/*<5076*/)/*<5064*/)/*<5063*/(/*5063*//*5063*/nil/*<5063*/)/*<5063*/)/*<5058*/(/*5058*//*5077*/1490/*<5077*/)/*<5058*/)/*<5050*/(/*5050*//*5050*/nil/*<5050*/)/*<5050*/)/*<5050*/)/*<1481*/(/*1481*//*5078*/1483/*<5078*/)/*<1481*/)/*<1478*/)/*<1294*/(/*1294*//*1294*//*1294*//*1294*/cons/*<1294*/(/*1294*//*1963*//*1963*//*1964*/$co/*<1964*/(/*1963*//*1965*/{"0":{"0":{"0":"+","1":1969,"type":"cst/identifier"},"1":{"0":{"0":"1","1":1970,"type":"cst/identifier"},"1":{"0":{"0":"2","1":1971,"type":"cst/identifier"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"type":"cons"},"1":1968,"type":"cst/list"}/*<1965*/)/*<1963*/(/*1963*//*1966*//*1966*//*4975*/sexpr/*<4975*/(/*1966*//*4976*//*4976*//*4976*//*4977*/eapp/*<4977*/(/*4976*//*4978*//*4978*//*4978*//*4979*/eapp/*<4979*/(/*4978*//*4980*//*4980*//*4981*/evar/*<4981*/(/*4980*//*4982*/"+"/*<4982*/)/*<4980*/(/*4980*//*4984*/1969/*<4984*/)/*<4980*/)/*<4978*/(/*4978*//*4985*//*4985*//*4986*/eprim/*<4986*/(/*4985*//*4987*//*4987*//*4988*/pint/*<4988*/(/*4987*//*4989*/1/*<4989*/)/*<4987*/(/*4987*//*4990*/1970/*<4990*/)/*<4987*/)/*<4985*/(/*4985*//*4991*/1970/*<4991*/)/*<4985*/)/*<4978*/(/*4978*//*4992*/1968/*<4992*/)/*<4978*/)/*<4976*/(/*4976*//*4993*//*4993*//*4994*/eprim/*<4994*/(/*4993*//*4995*//*4995*//*4996*/pint/*<4996*/(/*4995*//*4997*/2/*<4997*/)/*<4995*/(/*4995*//*4998*/1971/*<4998*/)/*<4995*/)/*<4993*/(/*4993*//*4999*/1971/*<4999*/)/*<4993*/)/*<4976*/(/*4976*//*5000*/1968/*<5000*/)/*<4976*/)/*<1966*/(/*1966*//*5001*/1968/*<5001*/)/*<1966*/)/*<1963*/)/*<1294*/(/*1294*//*1294*//*1294*//*1294*/cons/*<1294*/(/*1294*//*2044*//*2044*//*2045*/$co/*<2045*/(/*2044*//*2046*/{"0":{"0":{"0":"defn","1":2050,"type":"cst/identifier"},"1":{"0":{"0":"a","1":2051,"type":"cst/identifier"},"1":{"0":{"0":{"0":{"0":"m","1":2055,"type":"cst/identifier"},"1":{"type":"nil"},"type":"cons"},"1":2052,"type":"cst/array"},"1":{"0":{"0":"m","1":2053,"type":"cst/identifier"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"type":"cons"},"type":"cons"},"1":2049,"type":"cst/list"}/*<2046*/)/*<2044*/(/*2044*//*2080*//*2080*//*2080*//*2080*//*3957*/sdef/*<3957*/(/*2080*//*3958*/"a"/*<3958*/)/*<2080*/(/*2080*//*3960*/2051/*<3960*/)/*<2080*/(/*2080*//*3961*//*3961*//*3961*//*3961*//*3962*/elambda/*<3962*/(/*3961*//*3963*/"m"/*<3963*/)/*<3961*/(/*3961*//*3965*/2055/*<3965*/)/*<3961*/(/*3961*//*3966*//*3966*//*3967*/evar/*<3967*/(/*3966*//*3968*/"m"/*<3968*/)/*<3966*/(/*3966*//*3970*/2053/*<3970*/)/*<3966*/)/*<3961*/(/*3961*//*3971*/2049/*<3971*/)/*<3961*/)/*<2080*/(/*2080*//*3972*/2049/*<3972*/)/*<2080*/)/*<2044*/)/*<1294*/(/*1294*//*1294*/nil/*<1294*/)/*<1294*/)/*<1294*/)/*<1294*/)/*<1294*/)/*<1294*/)/*<684*/
/*1111*//*1111*//*1156*/$co/*<1156*/(/*1111*//*1157*/parse_expr/*<1157*/)/*<1111*/(/*1111*//*1158*//*1158*//*1158*/cons/*<1158*/(/*1158*//*1159*//*1159*//*1160*/$co/*<1160*/(/*1159*//*1161*/{"0":"true","1":1163,"type":"cst/identifier"}/*<1161*/)/*<1159*/(/*1159*//*1164*//*1164*//*3524*/eprim/*<3524*/(/*1164*//*3525*//*3525*//*3526*/pbool/*<3526*/(/*3525*//*3527*/true/*<3527*/)/*<3525*/(/*3525*//*3528*/1163/*<3528*/)/*<3525*/)/*<1164*/(/*1164*//*3529*/1163/*<3529*/)/*<1164*/)/*<1159*/)/*<1158*/(/*1158*//*1158*//*1158*//*1158*/cons/*<1158*/(/*1158*//*3396*//*3396*//*3397*/$co/*<3397*/(/*3396*//*3398*/{"0":{"0":{"0":"1","1":3402,"type":"cst/identifier"},"1":{"0":{"0":{"0":"b","1":3403,"type":"cst/identifier"},"1":3406,"type":"cst/spread"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"1":3401,"type":"cst/array"}/*<3398*/)/*<3396*/(/*3396*//*3399*//*3399*//*3399*//*3682*/eapp/*<3682*/(/*3399*//*3683*//*3683*//*3683*//*3684*/eapp/*<3684*/(/*3683*//*3685*//*3685*//*3686*/evar/*<3686*/(/*3685*//*3687*/"cons"/*<3687*/)/*<3685*/(/*3685*//*3689*/3401/*<3689*/)/*<3685*/)/*<3683*/(/*3683*//*3690*//*3690*//*3691*/eprim/*<3691*/(/*3690*//*3692*//*3692*//*3693*/pint/*<3693*/(/*3692*//*3694*/1/*<3694*/)/*<3692*/(/*3692*//*3695*/3402/*<3695*/)/*<3692*/)/*<3690*/(/*3690*//*3696*/3402/*<3696*/)/*<3690*/)/*<3683*/(/*3683*//*3697*/3401/*<3697*/)/*<3683*/)/*<3399*/(/*3399*//*3698*//*3698*//*3699*/evar/*<3699*/(/*3698*//*3700*/"b"/*<3700*/)/*<3698*/(/*3698*//*3702*/3403/*<3702*/)/*<3698*/)/*<3399*/(/*3399*//*3703*/3401/*<3703*/)/*<3399*/)/*<3396*/)/*<1158*/(/*1158*//*1158*//*1158*//*1158*/cons/*<1158*/(/*1158*//*1172*//*1172*//*1173*/$co/*<1173*/(/*1172*//*1174*/{"0":"hi","1":{"type":"nil"},"2":1177,"type":"cst/string"}/*<1174*/)/*<1172*/(/*1172*//*1175*//*1175*//*1175*//*3530*/estr/*<3530*/(/*1175*//*3531*/"hi"/*<3531*/)/*<1175*/(/*1175*//*3533*/nil/*<3533*/)/*<1175*/(/*1175*//*3534*/1177/*<3534*/)/*<1175*/)/*<1172*/)/*<1158*/(/*1158*//*1158*//*1158*//*1158*/cons/*<1158*/(/*1158*//*5325*//*5325*//*5326*/$co/*<5326*/(/*5325*//*5327*/{"0":{"0":{"0":"@t","1":5332,"type":"cst/identifier"},"1":{"0":{"0":"a","1":5333,"type":"cst/identifier"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"1":5331,"type":"cst/list"}/*<5327*/)/*<5325*/(/*5325*//*5328*//*5328*//*5490*/equot$sltype/*<5490*/(/*5328*//*5491*//*5491*//*5492*/tcon/*<5492*/(/*5491*//*5493*/"a"/*<5493*/)/*<5491*/(/*5491*//*5495*/5333/*<5495*/)/*<5491*/)/*<5328*/(/*5328*//*5496*/5331/*<5496*/)/*<5328*/)/*<5325*/)/*<1158*/(/*1158*//*1158*//*1158*//*1158*/cons/*<1158*/(/*1158*//*5355*//*5355*//*5356*/$co/*<5356*/(/*5355*//*5357*/{"0":{"0":{"0":"@t","1":5362,"type":"cst/identifier"},"1":{"0":{"0":{"0":{"0":"a","1":5364,"type":"cst/identifier"},"1":{"0":{"0":"b","1":5365,"type":"cst/identifier"},"1":{"0":{"0":"c","1":5366,"type":"cst/identifier"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"type":"cons"},"1":5363,"type":"cst/list"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"1":5360,"type":"cst/list"}/*<5357*/)/*<5355*/(/*5355*//*5358*//*5358*//*5497*/equot$sltype/*<5497*/(/*5358*//*5498*//*5498*//*5498*//*5499*/tapp/*<5499*/(/*5498*//*5500*//*5500*//*5500*//*5501*/tapp/*<5501*/(/*5500*//*5502*//*5502*//*5503*/tcon/*<5503*/(/*5502*//*5504*/"a"/*<5504*/)/*<5502*/(/*5502*//*5506*/5364/*<5506*/)/*<5502*/)/*<5500*/(/*5500*//*5507*//*5507*//*5508*/tcon/*<5508*/(/*5507*//*5509*/"b"/*<5509*/)/*<5507*/(/*5507*//*5511*/5365/*<5511*/)/*<5507*/)/*<5500*/(/*5500*//*5512*/5363/*<5512*/)/*<5500*/)/*<5498*/(/*5498*//*5513*//*5513*//*5514*/tcon/*<5514*/(/*5513*//*5515*/"c"/*<5515*/)/*<5513*/(/*5513*//*5517*/5366/*<5517*/)/*<5513*/)/*<5498*/(/*5498*//*5518*/5363/*<5518*/)/*<5498*/)/*<5358*/(/*5358*//*5519*/5360/*<5519*/)/*<5358*/)/*<5355*/)/*<1158*/(/*1158*//*1158*//*1158*//*1158*/cons/*<1158*/(/*1158*//*5341*//*5341*//*5342*/$co/*<5342*/(/*5341*//*5343*/{"0":{"0":{"0":"@p","1":5348,"type":"cst/identifier"},"1":{"0":{"0":"_","1":5349,"type":"cst/identifier"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"1":5346,"type":"cst/list"}/*<5343*/)/*<5341*/(/*5341*//*5344*//*5344*//*5520*/equot$slpat/*<5520*/(/*5344*//*5521*//*5522*/pany/*<5522*/(/*5521*//*5523*/5349/*<5523*/)/*<5521*/)/*<5344*/(/*5344*//*5524*/5346/*<5524*/)/*<5344*/)/*<5341*/)/*<1158*/(/*1158*//*1158*//*1158*//*1158*/cons/*<1158*/(/*1158*//*4614*//*4614*//*4615*/$co/*<4615*/(/*4614*//*4616*/{"0":{"0":{"0":"if","1":4620,"type":"cst/identifier"},"1":{"0":{"0":{"0":{"0":"=","1":4622,"type":"cst/identifier"},"1":{"0":{"0":"a","1":4623,"type":"cst/identifier"},"1":{"0":{"0":"b","1":4624,"type":"cst/identifier"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"type":"cons"},"1":4621,"type":"cst/list"},"1":{"0":{"0":"a","1":4625,"type":"cst/identifier"},"1":{"0":{"0":"b","1":4626,"type":"cst/identifier"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"type":"cons"},"type":"cons"},"1":4619,"type":"cst/list"}/*<4616*/)/*<4614*/(/*4614*//*4617*//*4617*//*4617*//*4627*/ematch/*<4627*/(/*4617*//*4628*//*4628*//*4628*//*4629*/eapp/*<4629*/(/*4628*//*4630*//*4630*//*4630*//*4631*/eapp/*<4631*/(/*4630*//*4632*//*4632*//*4633*/evar/*<4633*/(/*4632*//*4634*/"="/*<4634*/)/*<4632*/(/*4632*//*4636*/4622/*<4636*/)/*<4632*/)/*<4630*/(/*4630*//*4637*//*4637*//*4638*/evar/*<4638*/(/*4637*//*4639*/"a"/*<4639*/)/*<4637*/(/*4637*//*4641*/4623/*<4641*/)/*<4637*/)/*<4630*/(/*4630*//*4642*/4621/*<4642*/)/*<4630*/)/*<4628*/(/*4628*//*4643*//*4643*//*4644*/evar/*<4644*/(/*4643*//*4645*/"b"/*<4645*/)/*<4643*/(/*4643*//*4647*/4624/*<4647*/)/*<4643*/)/*<4628*/(/*4628*//*4648*/4621/*<4648*/)/*<4628*/)/*<4617*/(/*4617*//*4649*//*4649*//*4649*/cons/*<4649*/(/*4649*//*4650*//*4650*//*4651*/$co/*<4651*/(/*4650*//*4652*//*4652*//*4653*/pprim/*<4653*/(/*4652*//*4654*//*4654*//*4655*/pbool/*<4655*/(/*4654*//*4656*/true/*<4656*/)/*<4654*/(/*4654*//*4657*/4619/*<4657*/)/*<4654*/)/*<4652*/(/*4652*//*4658*/4619/*<4658*/)/*<4652*/)/*<4650*/(/*4650*//*4659*//*4659*//*4660*/evar/*<4660*/(/*4659*//*4661*/"a"/*<4661*/)/*<4659*/(/*4659*//*4663*/4625/*<4663*/)/*<4659*/)/*<4650*/)/*<4649*/(/*4649*//*4649*//*4649*//*4649*/cons/*<4649*/(/*4649*//*4664*//*4664*//*4665*/$co/*<4665*/(/*4664*//*4666*//*4667*/pany/*<4667*/(/*4666*//*4668*/4619/*<4668*/)/*<4666*/)/*<4664*/(/*4664*//*4669*//*4669*//*4670*/evar/*<4670*/(/*4669*//*4671*/"b"/*<4671*/)/*<4669*/(/*4669*//*4673*/4626/*<4673*/)/*<4669*/)/*<4664*/)/*<4649*/(/*4649*//*4649*/nil/*<4649*/)/*<4649*/)/*<4649*/)/*<4617*/(/*4617*//*4674*/4619/*<4674*/)/*<4617*/)/*<4614*/)/*<1158*/(/*1158*//*1158*//*1158*//*1158*/cons/*<1158*/(/*1158*//*3603*//*3603*//*3604*/$co/*<3604*/(/*3603*//*3605*/{"0":"a","1":{"0":{"0":{"0":"1","1":3610,"type":"cst/identifier"},"1":"b","2":3611,"type":",,"},"1":{"type":"nil"},"type":"cons"},"2":3608,"type":"cst/string"}/*<3605*/)/*<3603*/(/*3603*//*3606*//*3606*//*3606*//*3612*/estr/*<3612*/(/*3606*//*3613*/"a"/*<3613*/)/*<3606*/(/*3606*//*3615*//*3615*//*3615*/cons/*<3615*/(/*3615*//*3616*//*3616*//*3616*//*3617*/$co$co/*<3617*/(/*3616*//*3618*//*3618*//*3619*/eprim/*<3619*/(/*3618*//*3620*//*3620*//*3621*/pint/*<3621*/(/*3620*//*3622*/1/*<3622*/)/*<3620*/(/*3620*//*3623*/3610/*<3623*/)/*<3620*/)/*<3618*/(/*3618*//*3624*/3610/*<3624*/)/*<3618*/)/*<3616*/(/*3616*//*3625*/"b"/*<3625*/)/*<3616*/(/*3616*//*3627*/3611/*<3627*/)/*<3616*/)/*<3615*/(/*3615*//*3615*/nil/*<3615*/)/*<3615*/)/*<3606*/(/*3606*//*3628*/3608/*<3628*/)/*<3606*/)/*<3603*/)/*<1158*/(/*1158*//*1158*//*1158*//*1158*/cons/*<1158*/(/*1158*//*3233*//*3233*//*3234*/$co/*<3234*/(/*3233*//*3235*/{"0":{"0":{"0":"1","1":3239,"type":"cst/identifier"},"1":{"0":{"0":"2","1":3240,"type":"cst/identifier"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"1":3238,"type":"cst/array"}/*<3235*/)/*<3233*/(/*3233*//*3236*//*3236*//*3236*//*3704*/eapp/*<3704*/(/*3236*//*3705*//*3705*//*3705*//*3706*/eapp/*<3706*/(/*3705*//*3707*//*3707*//*3708*/evar/*<3708*/(/*3707*//*3709*/"cons"/*<3709*/)/*<3707*/(/*3707*//*3711*/3238/*<3711*/)/*<3707*/)/*<3705*/(/*3705*//*3712*//*3712*//*3713*/eprim/*<3713*/(/*3712*//*3714*//*3714*//*3715*/pint/*<3715*/(/*3714*//*3716*/1/*<3716*/)/*<3714*/(/*3714*//*3717*/3239/*<3717*/)/*<3714*/)/*<3712*/(/*3712*//*3718*/3239/*<3718*/)/*<3712*/)/*<3705*/(/*3705*//*3719*/3238/*<3719*/)/*<3705*/)/*<3236*/(/*3236*//*3720*//*3720*//*3720*//*3721*/eapp/*<3721*/(/*3720*//*3722*//*3722*//*3722*//*3723*/eapp/*<3723*/(/*3722*//*3724*//*3724*//*3725*/evar/*<3725*/(/*3724*//*3726*/"cons"/*<3726*/)/*<3724*/(/*3724*//*3728*/3238/*<3728*/)/*<3724*/)/*<3722*/(/*3722*//*3729*//*3729*//*3730*/eprim/*<3730*/(/*3729*//*3731*//*3731*//*3732*/pint/*<3732*/(/*3731*//*3733*/2/*<3733*/)/*<3731*/(/*3731*//*3734*/3240/*<3734*/)/*<3731*/)/*<3729*/(/*3729*//*3735*/3240/*<3735*/)/*<3729*/)/*<3722*/(/*3722*//*3736*/3238/*<3736*/)/*<3722*/)/*<3720*/(/*3720*//*3737*//*3737*//*3738*/evar/*<3738*/(/*3737*//*3739*/"nil"/*<3739*/)/*<3737*/(/*3737*//*3741*/3238/*<3741*/)/*<3737*/)/*<3720*/(/*3720*//*3742*/3238/*<3742*/)/*<3720*/)/*<3236*/(/*3236*//*3743*/3238/*<3743*/)/*<3236*/)/*<3233*/)/*<1158*/(/*1158*//*1158*//*1158*//*1158*/cons/*<1158*/(/*1158*//*1183*//*1183*//*1184*/$co/*<1184*/(/*1183*//*1185*/{"0":"12","1":1188,"type":"cst/identifier"}/*<1185*/)/*<1183*/(/*1183*//*1186*//*1186*//*3538*/eprim/*<3538*/(/*1186*//*3539*//*3539*//*3540*/pint/*<3540*/(/*3539*//*3541*/12/*<3541*/)/*<3539*/(/*3539*//*3542*/1188/*<3542*/)/*<3539*/)/*<1186*/(/*1186*//*3543*/1188/*<3543*/)/*<1186*/)/*<1183*/)/*<1158*/(/*1158*//*1158*//*1158*//*1158*/cons/*<1158*/(/*1158*//*2990*//*2990*//*2991*/$co/*<2991*/(/*2990*//*2992*/{"0":{"0":{"0":"match","1":2996,"type":"cst/identifier"},"1":{"0":{"0":"2","1":2997,"type":"cst/identifier"},"1":{"0":{"0":"1","1":2998,"type":"cst/identifier"},"1":{"0":{"0":"2","1":2999,"type":"cst/identifier"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"type":"cons"},"type":"cons"},"1":2995,"type":"cst/list"}/*<2992*/)/*<2990*/(/*2990*//*2993*//*2993*//*2993*//*3648*/ematch/*<3648*/(/*2993*//*3649*//*3649*//*3650*/eprim/*<3650*/(/*3649*//*3651*//*3651*//*3652*/pint/*<3652*/(/*3651*//*3653*/2/*<3653*/)/*<3651*/(/*3651*//*3654*/2997/*<3654*/)/*<3651*/)/*<3649*/(/*3649*//*3655*/2997/*<3655*/)/*<3649*/)/*<2993*/(/*2993*//*3656*//*3656*//*3656*/cons/*<3656*/(/*3656*//*3657*//*3657*//*3658*/$co/*<3658*/(/*3657*//*3659*//*3659*//*3660*/pprim/*<3660*/(/*3659*//*3661*//*3661*//*3662*/pint/*<3662*/(/*3661*//*3663*/1/*<3663*/)/*<3661*/(/*3661*//*3664*/2998/*<3664*/)/*<3661*/)/*<3659*/(/*3659*//*3665*/2998/*<3665*/)/*<3659*/)/*<3657*/(/*3657*//*3666*//*3666*//*3667*/eprim/*<3667*/(/*3666*//*3668*//*3668*//*3669*/pint/*<3669*/(/*3668*//*3670*/2/*<3670*/)/*<3668*/(/*3668*//*3671*/2999/*<3671*/)/*<3668*/)/*<3666*/(/*3666*//*3672*/2999/*<3672*/)/*<3666*/)/*<3657*/)/*<3656*/(/*3656*//*3656*/nil/*<3656*/)/*<3656*/)/*<2993*/(/*2993*//*3673*/2995/*<3673*/)/*<2993*/)/*<2990*/)/*<1158*/(/*1158*//*1158*//*1158*//*1158*/cons/*<1158*/(/*1158*//*1195*//*1195*//*1196*/$co/*<1196*/(/*1195*//*1197*/{"0":"abc","1":1200,"type":"cst/identifier"}/*<1197*/)/*<1195*/(/*1195*//*1198*//*1198*//*3544*/evar/*<3544*/(/*1198*//*3545*/"abc"/*<3545*/)/*<1198*/(/*1198*//*3547*/1200/*<3547*/)/*<1198*/)/*<1195*/)/*<1158*/(/*1158*//*1158*//*1158*//*1158*/cons/*<1158*/(/*1158*//*4448*//*4448*//*4449*/$co/*<4449*/(/*4448*//*4450*/{"0":{"0":{"0":"let","1":4454,"type":"cst/identifier"},"1":{"0":{"0":{"0":{"0":"a","1":4456,"type":"cst/identifier"},"1":{"0":{"0":"1","1":4457,"type":"cst/identifier"},"1":{"0":{"0":"b","1":4458,"type":"cst/identifier"},"1":{"0":{"0":"2","1":4459,"type":"cst/identifier"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"type":"cons"},"type":"cons"},"1":4455,"type":"cst/array"},"1":{"0":{"0":"a","1":4460,"type":"cst/identifier"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"type":"cons"},"1":4453,"type":"cst/list"}/*<4450*/)/*<4448*/(/*4448*//*4451*//*4451*//*4451*//*4451*//*4495*/elet/*<4495*/(/*4451*//*4496*//*4496*//*4497*/pvar/*<4497*/(/*4496*//*4498*/"a"/*<4498*/)/*<4496*/(/*4496*//*4500*/4456/*<4500*/)/*<4496*/)/*<4451*/(/*4451*//*4501*//*4501*//*4502*/eprim/*<4502*/(/*4501*//*4503*//*4503*//*4504*/pint/*<4504*/(/*4503*//*4505*/1/*<4505*/)/*<4503*/(/*4503*//*4506*/4457/*<4506*/)/*<4503*/)/*<4501*/(/*4501*//*4507*/4457/*<4507*/)/*<4501*/)/*<4451*/(/*4451*//*4508*//*4508*//*4508*//*4508*//*4509*/elet/*<4509*/(/*4508*//*4510*//*4510*//*4511*/pvar/*<4511*/(/*4510*//*4512*/"b"/*<4512*/)/*<4510*/(/*4510*//*4514*/4458/*<4514*/)/*<4510*/)/*<4508*/(/*4508*//*4515*//*4515*//*4516*/eprim/*<4516*/(/*4515*//*4517*//*4517*//*4518*/pint/*<4518*/(/*4517*//*4519*/2/*<4519*/)/*<4517*/(/*4517*//*4520*/4459/*<4520*/)/*<4517*/)/*<4515*/(/*4515*//*4521*/4459/*<4521*/)/*<4515*/)/*<4508*/(/*4508*//*4522*//*4522*//*4523*/evar/*<4523*/(/*4522*//*4524*/"a"/*<4524*/)/*<4522*/(/*4522*//*4526*/4460/*<4526*/)/*<4522*/)/*<4508*/(/*4508*//*4527*/4453/*<4527*/)/*<4508*/)/*<4451*/(/*4451*//*4528*/4453/*<4528*/)/*<4451*/)/*<4448*/)/*<1158*/(/*1158*//*1158*//*1158*//*1158*/cons/*<1158*/(/*1158*//*1205*//*1205*//*1206*/$co/*<1206*/(/*1205*//*1207*/{"0":{"0":{"0":"fn","1":1236,"type":"cst/identifier"},"1":{"0":{"0":{"0":{"0":"a","1":1238,"type":"cst/identifier"},"1":{"type":"nil"},"type":"cons"},"1":1237,"type":"cst/array"},"1":{"0":{"0":"1","1":1239,"type":"cst/identifier"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"type":"cons"},"1":1235,"type":"cst/list"}/*<1207*/)/*<1205*/(/*1205*//*1208*//*1208*//*1208*//*1208*//*3571*/elambda/*<3571*/(/*1208*//*3572*/"a"/*<3572*/)/*<1208*/(/*1208*//*3574*/1238/*<3574*/)/*<1208*/(/*1208*//*3575*//*3575*//*3576*/eprim/*<3576*/(/*3575*//*3577*//*3577*//*3578*/pint/*<3578*/(/*3577*//*3579*/1/*<3579*/)/*<3577*/(/*3577*//*3580*/1239/*<3580*/)/*<3577*/)/*<3575*/(/*3575*//*3581*/1239/*<3581*/)/*<3575*/)/*<1208*/(/*1208*//*3582*/1235/*<3582*/)/*<1208*/)/*<1205*/)/*<1158*/(/*1158*//*1158*//*1158*//*1158*/cons/*<1158*/(/*1158*//*1248*//*1248*//*1249*/$co/*<1249*/(/*1248*//*1250*/{"0":{"0":{"0":"fn","1":1254,"type":"cst/identifier"},"1":{"0":{"0":{"0":{"0":"a","1":1256,"type":"cst/identifier"},"1":{"0":{"0":"b","1":1257,"type":"cst/identifier"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"1":1255,"type":"cst/array"},"1":{"0":{"0":"2","1":1258,"type":"cst/identifier"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"type":"cons"},"1":1253,"type":"cst/list"}/*<1250*/)/*<1248*/(/*1248*//*1251*//*1251*//*1251*//*1251*//*3583*/elambda/*<3583*/(/*1251*//*3584*/"a"/*<3584*/)/*<1251*/(/*1251*//*3586*/1256/*<3586*/)/*<1251*/(/*1251*//*3587*//*3587*//*3587*//*3587*//*3588*/elambda/*<3588*/(/*3587*//*3589*/"b"/*<3589*/)/*<3587*/(/*3587*//*3591*/1257/*<3591*/)/*<3587*/(/*3587*//*3592*//*3592*//*3593*/eprim/*<3593*/(/*3592*//*3594*//*3594*//*3595*/pint/*<3595*/(/*3594*//*3596*/2/*<3596*/)/*<3594*/(/*3594*//*3597*/1258/*<3597*/)/*<3594*/)/*<3592*/(/*3592*//*3598*/1258/*<3598*/)/*<3592*/)/*<3587*/(/*3587*//*3599*/1253/*<3599*/)/*<3587*/)/*<1251*/(/*1251*//*3600*/1253/*<3600*/)/*<1251*/)/*<1248*/)/*<1158*/(/*1158*//*1158*//*1158*//*1158*/cons/*<1158*/(/*1158*//*1903*//*1903*//*1904*/$co/*<1904*/(/*1903*//*1905*/{"0":{"0":{"0":"fn","1":1909,"type":"cst/identifier"},"1":{"0":{"0":{"0":{"0":{"0":{"0":",","1":1912,"type":"cst/identifier"},"1":{"0":{"0":"a","1":1913,"type":"cst/identifier"},"1":{"0":{"0":"b","1":1914,"type":"cst/identifier"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"type":"cons"},"1":1911,"type":"cst/list"},"1":{"type":"nil"},"type":"cons"},"1":1910,"type":"cst/array"},"1":{"0":{"0":"a","1":1915,"type":"cst/identifier"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"type":"cons"},"1":1908,"type":"cst/list"}/*<1905*/)/*<1903*/(/*1903*//*1906*//*1906*//*1906*//*1906*//*3902*/elambda/*<3902*/(/*1906*//*3903*/"\$fn-arg"/*<3903*/)/*<1906*/(/*1906*//*3905*/-1/*<3905*/)/*<1906*/(/*1906*//*3906*//*3906*//*3906*//*3907*/ematch/*<3907*/(/*3906*//*3908*//*3908*//*3909*/evar/*<3909*/(/*3908*//*3910*/"\$fn-arg"/*<3910*/)/*<3908*/(/*3908*//*3912*/-1/*<3912*/)/*<3908*/)/*<3906*/(/*3906*//*3913*//*3913*//*3913*/cons/*<3913*/(/*3913*//*3914*//*3914*//*3915*/$co/*<3915*/(/*3914*//*3916*//*3916*//*3916*//*3917*/pcon/*<3917*/(/*3916*//*3918*/","/*<3918*/)/*<3916*/(/*3916*//*3920*//*3920*//*3920*/cons/*<3920*/(/*3920*//*3921*//*3921*//*3922*/pvar/*<3922*/(/*3921*//*3923*/"a"/*<3923*/)/*<3921*/(/*3921*//*3925*/1913/*<3925*/)/*<3921*/)/*<3920*/(/*3920*//*3920*//*3920*//*3920*/cons/*<3920*/(/*3920*//*3926*//*3926*//*3927*/pvar/*<3927*/(/*3926*//*3928*/"b"/*<3928*/)/*<3926*/(/*3926*//*3930*/1914/*<3930*/)/*<3926*/)/*<3920*/(/*3920*//*3920*/nil/*<3920*/)/*<3920*/)/*<3920*/)/*<3916*/(/*3916*//*3931*/1911/*<3931*/)/*<3916*/)/*<3914*/(/*3914*//*3932*//*3932*//*3933*/evar/*<3933*/(/*3932*//*3934*/"a"/*<3934*/)/*<3932*/(/*3932*//*3936*/1915/*<3936*/)/*<3932*/)/*<3914*/)/*<3913*/(/*3913*//*3913*/nil/*<3913*/)/*<3913*/)/*<3906*/(/*3906*//*3937*/1908/*<3937*/)/*<3906*/)/*<1906*/(/*1906*//*3938*/1908/*<3938*/)/*<1906*/)/*<1903*/)/*<1158*/(/*1158*//*1158*//*1158*//*1158*/cons/*<1158*/(/*1158*//*1281*//*1281*//*1282*/$co/*<1282*/(/*1281*//*1283*/{"0":{"0":{"0":"+","1":1519,"type":"cst/identifier"},"1":{"0":{"0":"1","1":1520,"type":"cst/identifier"},"1":{"0":{"0":"2","1":1521,"type":"cst/identifier"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"type":"cons"},"1":1288,"type":"cst/list"}/*<1283*/)/*<1281*/(/*1281*//*1284*//*1284*//*1284*//*3760*/eapp/*<3760*/(/*1284*//*3761*//*3761*//*3761*//*3762*/eapp/*<3762*/(/*3761*//*3763*//*3763*//*3764*/evar/*<3764*/(/*3763*//*3765*/"+"/*<3765*/)/*<3763*/(/*3763*//*3767*/1519/*<3767*/)/*<3763*/)/*<3761*/(/*3761*//*3768*//*3768*//*3769*/eprim/*<3769*/(/*3768*//*3770*//*3770*//*3771*/pint/*<3771*/(/*3770*//*3772*/1/*<3772*/)/*<3770*/(/*3770*//*3773*/1520/*<3773*/)/*<3770*/)/*<3768*/(/*3768*//*3774*/1520/*<3774*/)/*<3768*/)/*<3761*/(/*3761*//*3775*/1288/*<3775*/)/*<3761*/)/*<1284*/(/*1284*//*3776*//*3776*//*3777*/eprim/*<3777*/(/*3776*//*3778*//*3778*//*3779*/pint/*<3779*/(/*3778*//*3780*/2/*<3780*/)/*<3778*/(/*3778*//*3781*/1521/*<3781*/)/*<3778*/)/*<3776*/(/*3776*//*3782*/1521/*<3782*/)/*<3776*/)/*<1284*/(/*1284*//*3783*/1288/*<3783*/)/*<1284*/)/*<1281*/)/*<1158*/(/*1158*//*1158*//*1158*//*1158*/cons/*<1158*/(/*1158*//*1609*//*1609*//*1610*/$co/*<1610*/(/*1609*//*1611*/{"0":{"0":{"0":"int-to-string","1":1615,"type":"cst/identifier"},"1":{"0":{"0":"23","1":1616,"type":"cst/identifier"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"1":1614,"type":"cst/list"}/*<1611*/)/*<1609*/(/*1609*//*1612*//*1612*//*1612*//*3746*/eapp/*<3746*/(/*1612*//*3747*//*3747*//*3748*/evar/*<3748*/(/*3747*//*3749*/"int-to-string"/*<3749*/)/*<3747*/(/*3747*//*3751*/1615/*<3751*/)/*<3747*/)/*<1612*/(/*1612*//*3752*//*3752*//*3753*/eprim/*<3753*/(/*3752*//*3754*//*3754*//*3755*/pint/*<3755*/(/*3754*//*3756*/23/*<3756*/)/*<3754*/(/*3754*//*3757*/1616/*<3757*/)/*<3754*/)/*<3752*/(/*3752*//*3758*/1616/*<3758*/)/*<3752*/)/*<1612*/(/*1612*//*3759*/1614/*<3759*/)/*<1612*/)/*<1609*/)/*<1158*/(/*1158*//*1158*//*1158*//*1158*/cons/*<1158*/(/*1158*//*1671*//*1671*//*1672*/$co/*<1672*/(/*1671*//*1673*/{"0":{"0":{"0":"let","1":1677,"type":"cst/identifier"},"1":{"0":{"0":{"0":{"0":"x","1":1679,"type":"cst/identifier"},"1":{"0":{"0":"2","1":1680,"type":"cst/identifier"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"1":1678,"type":"cst/array"},"1":{"0":{"0":"x","1":1681,"type":"cst/identifier"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"type":"cons"},"1":1676,"type":"cst/list"}/*<1673*/)/*<1671*/(/*1671*//*1674*//*1674*//*1674*//*1674*//*4327*/elet/*<4327*/(/*1674*//*4328*//*4328*//*4329*/pvar/*<4329*/(/*4328*//*4330*/"x"/*<4330*/)/*<4328*/(/*4328*//*4332*/1679/*<4332*/)/*<4328*/)/*<1674*/(/*1674*//*4333*//*4333*//*4334*/eprim/*<4334*/(/*4333*//*4335*//*4335*//*4336*/pint/*<4336*/(/*4335*//*4337*/2/*<4337*/)/*<4335*/(/*4335*//*4338*/1680/*<4338*/)/*<4335*/)/*<4333*/(/*4333*//*4339*/1680/*<4339*/)/*<4333*/)/*<1674*/(/*1674*//*4340*//*4340*//*4341*/evar/*<4341*/(/*4340*//*4342*/"x"/*<4342*/)/*<4340*/(/*4340*//*4344*/1681/*<4344*/)/*<4340*/)/*<1674*/(/*1674*//*4345*/1676/*<4345*/)/*<1674*/)/*<1671*/)/*<1158*/(/*1158*//*1158*//*1158*//*1158*/cons/*<1158*/(/*1158*//*1783*//*1783*//*1784*/$co/*<1784*/(/*1783*//*1785*/{"0":{"0":{"0":"let","1":1790,"type":"cst/identifier"},"1":{"0":{"0":{"0":{"0":{"0":{"0":",","1":1793,"type":"cst/identifier"},"1":{"0":{"0":"a","1":1794,"type":"cst/identifier"},"1":{"0":{"0":"b","1":1795,"type":"cst/identifier"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"type":"cons"},"1":1792,"type":"cst/list"},"1":{"0":{"0":{"0":{"0":",","1":1797,"type":"cst/identifier"},"1":{"0":{"0":"2","1":1798,"type":"cst/identifier"},"1":{"0":{"0":"3","1":1799,"type":"cst/identifier"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"type":"cons"},"1":1796,"type":"cst/list"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"1":1791,"type":"cst/array"},"1":{"0":{"0":"1","1":1800,"type":"cst/identifier"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"type":"cons"},"1":1789,"type":"cst/list"}/*<1785*/)/*<1783*/(/*1783*//*1786*//*1786*//*1786*//*1786*//*4346*/elet/*<4346*/(/*1786*//*4347*//*4347*//*4347*//*4348*/pcon/*<4348*/(/*4347*//*4349*/","/*<4349*/)/*<4347*/(/*4347*//*4351*//*4351*//*4351*/cons/*<4351*/(/*4351*//*4352*//*4352*//*4353*/pvar/*<4353*/(/*4352*//*4354*/"a"/*<4354*/)/*<4352*/(/*4352*//*4356*/1794/*<4356*/)/*<4352*/)/*<4351*/(/*4351*//*4351*//*4351*//*4351*/cons/*<4351*/(/*4351*//*4357*//*4357*//*4358*/pvar/*<4358*/(/*4357*//*4359*/"b"/*<4359*/)/*<4357*/(/*4357*//*4361*/1795/*<4361*/)/*<4357*/)/*<4351*/(/*4351*//*4351*/nil/*<4351*/)/*<4351*/)/*<4351*/)/*<4347*/(/*4347*//*4362*/1792/*<4362*/)/*<4347*/)/*<1786*/(/*1786*//*4363*//*4363*//*4363*//*4364*/eapp/*<4364*/(/*4363*//*4365*//*4365*//*4365*//*4366*/eapp/*<4366*/(/*4365*//*4367*//*4367*//*4368*/evar/*<4368*/(/*4367*//*4369*/","/*<4369*/)/*<4367*/(/*4367*//*4371*/1797/*<4371*/)/*<4367*/)/*<4365*/(/*4365*//*4372*//*4372*//*4373*/eprim/*<4373*/(/*4372*//*4374*//*4374*//*4375*/pint/*<4375*/(/*4374*//*4376*/2/*<4376*/)/*<4374*/(/*4374*//*4377*/1798/*<4377*/)/*<4374*/)/*<4372*/(/*4372*//*4378*/1798/*<4378*/)/*<4372*/)/*<4365*/(/*4365*//*4379*/1796/*<4379*/)/*<4365*/)/*<4363*/(/*4363*//*4380*//*4380*//*4381*/eprim/*<4381*/(/*4380*//*4382*//*4382*//*4383*/pint/*<4383*/(/*4382*//*4384*/3/*<4384*/)/*<4382*/(/*4382*//*4385*/1799/*<4385*/)/*<4382*/)/*<4380*/(/*4380*//*4386*/1799/*<4386*/)/*<4380*/)/*<4363*/(/*4363*//*4387*/1796/*<4387*/)/*<4363*/)/*<1786*/(/*1786*//*4388*//*4388*//*4389*/eprim/*<4389*/(/*4388*//*4390*//*4390*//*4391*/pint/*<4391*/(/*4390*//*4392*/1/*<4392*/)/*<4390*/(/*4390*//*4393*/1800/*<4393*/)/*<4390*/)/*<4388*/(/*4388*//*4394*/1800/*<4394*/)/*<4388*/)/*<1786*/(/*1786*//*4395*/1789/*<4395*/)/*<1786*/)/*<1783*/)/*<1158*/(/*1158*//*1158*//*1158*//*1158*/cons/*<1158*/(/*1158*//*3103*//*3103*//*3104*/$co/*<3104*/(/*3103*//*3105*/{"0":{"0":{"0":"@@","1":3109,"type":"cst/identifier"},"1":{"0":{"0":"1","1":3110,"type":"cst/identifier"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"1":3108,"type":"cst/list"}/*<3105*/)/*<3103*/(/*3103*//*3106*//*3106*//*3550*/equotquot/*<3550*/(/*3106*//*3551*//*3551*//*3552*/cst$slidentifier/*<3552*/(/*3551*//*3553*/"1"/*<3553*/)/*<3551*/(/*3551*//*3555*/3110/*<3555*/)/*<3551*/)/*<3106*/(/*3106*//*3556*/3108/*<3556*/)/*<3106*/)/*<3103*/)/*<1158*/(/*1158*//*1158*//*1158*//*1158*/cons/*<1158*/(/*1158*//*3117*//*3117*//*3118*/$co/*<3118*/(/*3117*//*3119*/{"0":{"0":{"0":"@","1":3123,"type":"cst/identifier"},"1":{"0":{"0":"1","1":3124,"type":"cst/identifier"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"1":3122,"type":"cst/list"}/*<3119*/)/*<3117*/(/*3117*//*3120*//*3120*//*3557*/equot/*<3557*/(/*3120*//*3558*//*3558*//*3559*/eprim/*<3559*/(/*3558*//*3560*//*3560*//*3561*/pint/*<3561*/(/*3560*//*3562*/1/*<3562*/)/*<3560*/(/*3560*//*3563*/3124/*<3563*/)/*<3560*/)/*<3558*/(/*3558*//*3564*/3124/*<3564*/)/*<3558*/)/*<3120*/(/*3120*//*3565*/3122/*<3565*/)/*<3120*/)/*<3117*/)/*<1158*/(/*1158*//*1158*/nil/*<1158*/)/*<1158*/)/*<1158*/)/*<1158*/)/*<1158*/)/*<1158*/)/*<1158*/)/*<1158*/)/*<1158*/)/*<1158*/)/*<1158*/)/*<1158*/)/*<1158*/)/*<1158*/)/*<1158*/)/*<1158*/)/*<1158*/)/*<1158*/)/*<1158*/)/*<1158*/)/*<1158*/)/*<1158*/)/*<1158*/)/*<1111*/
/*1146*//*1148*/parse_expr/*<1148*/(/*1146*//*1149*/{"0":{"0":{"0":"fn","1":1152,"type":"cst/identifier"},"1":{"0":{"0":{"0":{"0":"a","1":1154,"type":"cst/identifier"},"1":{"type":"nil"},"type":"cons"},"1":1153,"type":"cst/array"},"1":{"0":{"0":"1","1":1155,"type":"cst/identifier"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"type":"cons"},"1":1151,"type":"cst/list"}/*<1149*/)/*<1146*/
const compile = /*2368*/function name_2368(expr) { return /*2368*/function name_2368(trace) { return /*4905*/(function let_4905() {const $target = /*4912*//*4913*/expr_loc/*<4913*/(/*4912*//*4914*/expr/*<4914*/)/*<4912*/;
{
let loc = $target;
return /*4915*//*4915*//*4916*/source_map/*<4916*/(/*4915*//*4917*/loc/*<4917*/)/*<4915*/(/*4915*//*4769*//*4769*//*4769*//*4770*/trace_wrap/*<4770*/(/*4769*//*4773*/loc/*<4773*/)/*<4769*/(/*4769*//*4776*/trace/*<4776*/)/*<4769*/(/*4769*//*2634*/(function match_2634($target) {
if ($target.type === "estr") {
{
let first = $target[0];
{
let tpls = $target[1];
{
let l = $target[2];
return /*2641*/(function match_2641($target) {
if ($target.type === "nil") {
return /*2645*/`\"${/*2647*//*2649*/escape_string/*<2649*/(/*2647*//*2650*//*2651*/unescapeString/*<2651*/(/*2650*//*2652*/first/*<2652*/)/*<2650*/)/*<2647*/}\"`/*<2645*/
}
return /*2654*/`\`${/*2675*//*2677*/escape_string/*<2677*/(/*2675*//*2678*//*2679*/unescapeString/*<2679*/(/*2678*//*2680*/first/*<2680*/)/*<2678*/)/*<2675*/}${/*2681*//*2681*//*2683*/join/*<2683*/(/*2681*//*2684*/""/*<2684*/)/*<2681*/(/*2681*//*2686*//*2686*//*2687*/map/*<2687*/(/*2686*//*2688*/tpls/*<2688*/)/*<2686*/(/*2686*//*2689*/function name_2689(item) { return /*2693*/(function let_2693() {const $target = /*2700*/item/*<2700*/;
if ($target.type === ",,") {
{
let expr = $target[0];
{
let suffix = $target[1];
{
let l = $target[2];
return /*2701*/`\${${/*2703*//*2703*//*2705*/compile/*<2705*/(/*2703*//*2706*/expr/*<2706*/)/*<2703*/(/*2703*//*4681*/trace/*<4681*/)/*<2703*/}}${/*2707*//*2709*/escape_string/*<2709*/(/*2707*//*2710*//*2711*/unescapeString/*<2711*/(/*2710*//*2712*/suffix/*<2712*/)/*<2710*/)/*<2707*/}`/*<2701*/
}
}
}
};
throw new Error('let pattern not matched 2696. ' + valueToString($target));})(/*!*/)/*<2693*/ }/*<2689*/)/*<2686*/)/*<2681*/}\``/*<2654*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 2641');})(/*!*//*2643*/tpls/*<2643*/)/*<2641*/
}
}
}
}
if ($target.type === "eprim") {
{
let prim = $target[0];
{
let l = $target[1];
return /*2742*/(function match_2742($target) {
if ($target.type === "pint") {
{
let int = $target[0];
return /*2763*//*2764*/int_to_string/*<2764*/(/*2763*//*2765*/int/*<2765*/)/*<2763*/
}
}
if ($target.type === "pbool") {
{
let bool = $target[0];
return /*2769*/(function match_2769($target) {
if ($target === true) {
return /*2773*/"true"/*<2773*/
}
if ($target === false) {
return /*2776*/"false"/*<2776*/
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 2769');})(/*!*//*2771*/bool/*<2771*/)/*<2769*/
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 2742');})(/*!*//*2744*/prim/*<2744*/)/*<2742*/
}
}
}
if ($target.type === "evar") {
{
let name = $target[0];
{
let l = $target[1];
return /*2781*//*2782*/sanitize/*<2782*/(/*2781*//*2783*/name/*<2783*/)/*<2781*/
}
}
}
if ($target.type === "equot") {
{
let inner = $target[0];
{
let l = $target[1];
return /*2787*//*2788*/jsonify/*<2788*/(/*2787*//*2789*/inner/*<2789*/)/*<2787*/
}
}
}
if ($target.type === "equot/stmt") {
{
let inner = $target[0];
{
let l = $target[1];
return /*5456*//*5457*/jsonify/*<5457*/(/*5456*//*5458*/inner/*<5458*/)/*<5456*/
}
}
}
if ($target.type === "equot/type") {
{
let inner = $target[0];
{
let l = $target[1];
return /*5463*//*5464*/jsonify/*<5464*/(/*5463*//*5465*/inner/*<5465*/)/*<5463*/
}
}
}
if ($target.type === "equot/pat") {
{
let inner = $target[0];
{
let l = $target[1];
return /*5470*//*5471*/jsonify/*<5471*/(/*5470*//*5472*/inner/*<5472*/)/*<5470*/
}
}
}
if ($target.type === "equotquot") {
{
let inner = $target[0];
{
let l = $target[1];
return /*5781*//*5785*/jsonify/*<5785*/(/*5781*//*5786*/inner/*<5786*/)/*<5781*/
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
return /*2794*//*2795*/$pl$pl/*<2795*/(/*2794*//*2796*//*2796*//*2796*/cons/*<2796*/(/*2796*//*2797*/`function name_${/*5957*//*5426*/its/*<5426*/(/*5957*//*5958*/l/*<5958*/)/*<5957*/}(`/*<2797*/)/*<2796*/(/*2796*//*2796*//*2796*//*2796*/cons/*<2796*/(/*2796*//*2799*//*2800*/sanitize/*<2800*/(/*2799*//*2801*/name/*<2801*/)/*<2799*/)/*<2796*/(/*2796*//*2796*//*2796*//*2796*/cons/*<2796*/(/*2796*//*2802*/") { return "/*<2802*/)/*<2796*/(/*2796*//*2796*//*2796*//*2796*/cons/*<2796*/(/*2796*//*4806*//*4806*//*4806*//*4806*//*4807*/trace_and/*<4807*/(/*4806*//*4808*/nl/*<4808*/)/*<4806*/(/*4806*//*4812*/trace/*<4812*/)/*<4806*/(/*4806*//*4809*//*4810*/sanitize/*<4810*/(/*4809*//*4811*/name/*<4811*/)/*<4809*/)/*<4806*/(/*4806*//*2804*//*2804*//*2805*/compile/*<2805*/(/*2804*//*2806*/body/*<2806*/)/*<2804*/(/*2804*//*4680*/trace/*<4680*/)/*<2804*/)/*<4806*/)/*<2796*/(/*2796*//*2796*//*2796*//*2796*/cons/*<2796*/(/*2796*//*5428*/" }"/*<5428*/)/*<2796*/(/*2796*//*2796*/nil/*<2796*/)/*<2796*/)/*<2796*/)/*<2796*/)/*<2796*/)/*<2796*/)/*<2794*/
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
return /*2812*/`(function let_${/*5959*//*5422*/its/*<5422*/(/*5959*//*5960*/l/*<5960*/)/*<5959*/}() {const \$target = ${/*4401*//*4401*//*4403*/compile/*<4403*/(/*4401*//*4404*/init/*<4404*/)/*<4401*/(/*4401*//*4679*/trace/*<4679*/)/*<4401*/};\n${/*4397*//*4397*//*4397*//*4397*//*4399*/compile_pat/*<4399*/(/*4397*//*4412*/pat/*<4412*/)/*<4397*/(/*4397*//*4400*/"\$target"/*<4400*/)/*<4397*/(/*4397*//*4406*/`return ${/*4408*//*4408*//*4410*/compile/*<4410*/(/*4408*//*4411*/body/*<4411*/)/*<4408*/(/*4408*//*4682*/trace/*<4682*/)/*<4408*/}`/*<4406*/)/*<4397*/(/*4397*//*4849*/trace/*<4849*/)/*<4397*/};\nthrow new Error('let pattern not matched ${/*5961*//*5962*/its/*<5962*/(/*5961*//*4571*//*4572*/pat_loc/*<4572*/(/*4571*//*4529*/pat/*<4529*/)/*<4571*/)/*<5961*/}. ' + valueToString(\$target));})(/*!*/)`/*<2812*/
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
return /*2836*/(function match_2836($target) {
if ($target.type === "elambda") {
{
let name = $target[0];
return /*4918*/`(${/*4920*//*4920*//*4922*/compile/*<4922*/(/*4920*//*4923*/fn/*<4923*/)/*<4920*/(/*4920*//*4924*/trace/*<4924*/)/*<4920*/})(/*${/*5984*//*4944*/its/*<4944*/(/*5984*//*5985*/l/*<5985*/)/*<5984*/}*/${/*4929*//*4929*//*4925*/compile/*<4925*/(/*4929*//*4930*/arg/*<4930*/)/*<4929*/(/*4929*//*4931*/trace/*<4931*/)/*<4929*/})`/*<4918*/
}
}
return /*4932*/`${/*4934*//*4934*//*4936*/compile/*<4936*/(/*4934*//*4937*/fn/*<4937*/)/*<4934*/(/*4934*//*4938*/trace/*<4938*/)/*<4934*/}(/*${/*5982*//*4946*/its/*<4946*/(/*5982*//*5983*/l/*<5983*/)/*<5982*/}*/${/*4939*//*4939*//*4941*/compile/*<4941*/(/*4939*//*4942*/arg/*<4942*/)/*<4939*/(/*4939*//*4943*/trace/*<4943*/)/*<4939*/})`/*<4932*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 2836');})(/*!*//*2838*/fn/*<2838*/)/*<2836*/
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
return /*2894*/`(function match_${/*5964*//*5424*/its/*<5424*/(/*5964*//*5965*/l/*<5965*/)/*<5964*/}(\$target) {\n${/*2896*//*2896*//*2898*/join/*<2898*/(/*2896*//*2901*/"\n"/*<2901*/)/*<2896*/(/*2896*//*2903*//*2903*//*2904*/map/*<2904*/(/*2903*//*2906*/cases/*<2906*/)/*<2903*/(/*2903*//*2907*/function name_2907($case) { return /*2911*/(function let_2911() {const $target = /*2918*/$case/*<2918*/;
if ($target.type === ",") {
{
let pat = $target[0];
{
let body = $target[1];
return /*2919*//*2919*//*2919*//*2919*//*2920*/compile_pat/*<2920*/(/*2919*//*2921*/pat/*<2921*/)/*<2919*/(/*2919*//*2922*/"\$target"/*<2922*/)/*<2919*/(/*2919*//*2924*/`return ${/*3336*//*3336*//*3338*/compile/*<3338*/(/*3336*//*3339*/body/*<3339*/)/*<3336*/(/*3336*//*4687*/trace/*<4687*/)/*<3336*/}`/*<2924*/)/*<2919*/(/*2919*//*4848*/trace/*<4848*/)/*<2919*/
}
}
};
throw new Error('let pattern not matched 2914. ' + valueToString($target));})(/*!*/)/*<2911*/ }/*<2907*/)/*<2903*/)/*<2896*/}\nthrow new Error('failed to match ' + jsonify(\$target) + '. Loc: ${/*5966*//*4315*/its/*<4315*/(/*5966*//*5967*/l/*<5967*/)/*<5966*/}');})(/*!*/${/*2926*//*2926*//*2928*/compile/*<2928*/(/*2926*//*2929*/target/*<2929*/)/*<2926*/(/*2926*//*4688*/trace/*<4688*/)/*<2926*/})`/*<2894*/
}
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 2634');})(/*!*//*2636*/expr/*<2636*/)/*<2634*/)/*<4769*/)/*<4915*/
};
throw new Error('let pattern not matched 4911. ' + valueToString($target));})(/*!*/)/*<4905*/ }/*<2368*/ }/*<2368*/;

/*2713*//*2713*//*2930*/compile/*<2930*/(/*2713*//*2943*//*2944*/parse_expr/*<2944*/(/*2943*//*2931*/{"0":{"0":{"0":"match","1":2939,"type":"cst/identifier"},"1":{"0":{"0":"2","1":2940,"type":"cst/identifier"},"1":{"0":{"0":"1","1":2941,"type":"cst/identifier"},"1":{"0":{"0":"2","1":2942,"type":"cst/identifier"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"type":"cons"},"type":"cons"},"1":2933,"type":"cst/list"}/*<2931*/)/*<2943*/)/*<2713*/(/*2713*//*4677*/map$slnil/*<4677*/)/*<2713*/
const run = /*4208*/function name_4208(v) { return /*4215*//*4217*/eval/*<4217*/(/*4215*//*4218*//*4218*//*4219*/compile/*<4219*/(/*4218*//*4220*//*4221*/parse_expr/*<4221*/(/*4220*//*4222*/v/*<4222*/)/*<4220*/)/*<4218*/(/*4218*//*4676*/map$slnil/*<4676*/)/*<4218*/)/*<4215*/ }/*<4208*/;

/*4413*//*4413*//*4415*/compile/*<4415*/(/*4413*//*4418*//*4419*/parse_expr/*<4419*/(/*4418*//*4420*/{"0":{"0":{"0":"let","1":4425,"type":"cst/identifier"},"1":{"0":{"0":{"0":{"0":"a","1":4427,"type":"cst/identifier"},"1":{"0":{"0":"1","1":4428,"type":"cst/identifier"},"1":{"0":{"0":"b","1":4429,"type":"cst/identifier"},"1":{"0":{"0":"2","1":4430,"type":"cst/identifier"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"type":"cons"},"type":"cons"},"1":4426,"type":"cst/array"},"1":{"0":{"0":{"0":{"0":"+","1":4432,"type":"cst/identifier"},"1":{"0":{"0":"a","1":4433,"type":"cst/identifier"},"1":{"0":{"0":"b","1":4434,"type":"cst/identifier"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"type":"cons"},"1":4431,"type":"cst/list"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"type":"cons"},"1":4422,"type":"cst/list"}/*<4420*/)/*<4418*/)/*<4413*/(/*4413*//*4678*/map$slnil/*<4678*/)/*<4413*/
/*5135*//*5137*/parse_expr/*<5137*/(/*5135*//*5138*/{"0":{"0":{"0":"@!","1":5141,"type":"cst/identifier"},"1":{"0":{"0":"12","1":5142,"type":"cst/identifier"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"1":5140,"type":"cst/list"}/*<5138*/)/*<5135*/
const compile_stmt = /*404*/function name_404(stmt) { return /*404*/function name_404(trace) { return /*410*/(function match_410($target) {
if ($target.type === "sexpr") {
{
let expr = $target[0];
{
let l = $target[1];
return /*416*//*416*//*417*/compile/*<417*/(/*416*//*418*/expr/*<418*/)/*<416*/(/*416*//*4798*/trace/*<4798*/)/*<416*/
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
return /*423*//*424*/$pl$pl/*<424*/(/*423*//*425*//*425*//*425*/cons/*<425*/(/*425*//*426*/"const "/*<426*/)/*<425*/(/*425*//*425*//*425*//*425*/cons/*<425*/(/*425*//*428*//*429*/sanitize/*<429*/(/*428*//*430*/name/*<430*/)/*<428*/)/*<425*/(/*425*//*425*//*425*//*425*/cons/*<425*/(/*425*//*431*/" = "/*<431*/)/*<425*/(/*425*//*425*//*425*//*425*/cons/*<425*/(/*425*//*433*//*433*//*434*/compile/*<434*/(/*433*//*435*/body/*<435*/)/*<433*/(/*433*//*4799*/trace/*<4799*/)/*<433*/)/*<425*/(/*425*//*425*//*425*//*425*/cons/*<425*/(/*425*//*436*/";\n"/*<436*/)/*<425*/(/*425*//*425*/nil/*<425*/)/*<425*/)/*<425*/)/*<425*/)/*<425*/)/*<425*/)/*<423*/
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
return /*442*//*442*//*443*/join/*<443*/(/*442*//*444*/"\n"/*<444*/)/*<442*/(/*442*//*446*//*446*//*447*/map/*<447*/(/*446*//*448*/cases/*<448*/)/*<446*/(/*446*//*449*/function name_449($case) { return /*453*/(function let_453() {const $target = /*460*/$case/*<460*/;
if ($target.type === ",,,") {
{
let name2 = $target[0];
{
let nl = $target[1];
{
let args = $target[2];
{
let l = $target[3];
return /*461*//*462*/$pl$pl/*<462*/(/*461*//*463*//*463*//*463*/cons/*<463*/(/*463*//*464*/"const "/*<464*/)/*<463*/(/*463*//*463*//*463*//*463*/cons/*<463*/(/*463*//*5430*//*466*/sanitize/*<466*/(/*5430*//*5431*/name2/*<5431*/)/*<5430*/)/*<463*/(/*463*//*463*//*463*//*463*/cons/*<463*/(/*463*//*467*/" = "/*<467*/)/*<463*/(/*463*//*463*//*463*//*463*/cons/*<463*/(/*463*//*469*//*470*/$pl$pl/*<470*/(/*469*//*471*//*471*//*471*//*472*/mapi/*<472*/(/*471*//*473*/0/*<473*/)/*<471*/(/*471*//*474*/args/*<474*/)/*<471*/(/*471*//*475*/function name_475(i) { return /*475*/function name_475(_) { return /*480*//*481*/$pl$pl/*<481*/(/*480*//*482*//*482*//*482*/cons/*<482*/(/*482*//*483*/"(v"/*<483*/)/*<482*/(/*482*//*482*//*482*//*482*/cons/*<482*/(/*482*//*485*//*486*/int_to_string/*<486*/(/*485*//*487*/i/*<487*/)/*<485*/)/*<482*/(/*482*//*482*//*482*//*482*/cons/*<482*/(/*482*//*488*/") => "/*<488*/)/*<482*/(/*482*//*482*/nil/*<482*/)/*<482*/)/*<482*/)/*<482*/)/*<480*/ }/*<475*/ }/*<475*/)/*<471*/)/*<469*/)/*<463*/(/*463*//*463*//*463*//*463*/cons/*<463*/(/*463*//*490*/"({type: \""/*<490*/)/*<463*/(/*463*//*463*//*463*//*463*/cons/*<463*/(/*463*//*492*/name2/*<492*/)/*<463*/(/*463*//*463*//*463*//*463*/cons/*<463*/(/*463*//*493*/"\""/*<493*/)/*<463*/(/*463*//*463*//*463*//*463*/cons/*<463*/(/*463*//*495*//*496*/$pl$pl/*<496*/(/*495*//*497*//*497*//*497*//*498*/mapi/*<498*/(/*497*//*499*/0/*<499*/)/*<497*/(/*497*//*500*/args/*<500*/)/*<497*/(/*497*//*501*/function name_501(i) { return /*501*/function name_501(_) { return /*506*//*507*/$pl$pl/*<507*/(/*506*//*508*//*508*//*508*/cons/*<508*/(/*508*//*509*/", "/*<509*/)/*<508*/(/*508*//*508*//*508*//*508*/cons/*<508*/(/*508*//*511*//*512*/int_to_string/*<512*/(/*511*//*513*/i/*<513*/)/*<511*/)/*<508*/(/*508*//*508*//*508*//*508*/cons/*<508*/(/*508*//*514*/": v"/*<514*/)/*<508*/(/*508*//*508*//*508*//*508*/cons/*<508*/(/*508*//*516*//*517*/int_to_string/*<517*/(/*516*//*518*/i/*<518*/)/*<516*/)/*<508*/(/*508*//*508*/nil/*<508*/)/*<508*/)/*<508*/)/*<508*/)/*<508*/)/*<506*/ }/*<501*/ }/*<501*/)/*<497*/)/*<495*/)/*<463*/(/*463*//*463*//*463*//*463*/cons/*<463*/(/*463*//*519*/"});"/*<519*/)/*<463*/(/*463*//*463*/nil/*<463*/)/*<463*/)/*<463*/)/*<463*/)/*<463*/)/*<463*/)/*<463*/)/*<463*/)/*<463*/)/*<463*/)/*<461*/
}
}
}
}
};
throw new Error('let pattern not matched 456. ' + valueToString($target));})(/*!*/)/*<453*/ }/*<449*/)/*<446*/)/*<442*/
}
}
}
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 410');})(/*!*//*412*/stmt/*<412*/)/*<410*/ }/*<404*/ }/*<404*/;

/*4065*//*4065*//*4067*/$co/*<4067*/(/*4065*//*4068*/run/*<4068*/)/*<4065*/(/*4065*//*4069*//*4069*//*4069*/cons/*<4069*/(/*4069*//*4070*//*4070*//*4071*/$co/*<4071*/(/*4070*//*4072*/{"0":"1","1":4074,"type":"cst/identifier"}/*<4072*/)/*<4070*/(/*4070*//*4075*/1/*<4075*/)/*<4070*/)/*<4069*/(/*4069*//*4069*//*4069*//*4069*/cons/*<4069*/(/*4069*//*4076*//*4076*//*4077*/$co/*<4077*/(/*4076*//*4078*/{"0":"hello","1":{"type":"nil"},"2":4080,"type":"cst/string"}/*<4078*/)/*<4076*/(/*4076*//*4082*/"hello"/*<4082*/)/*<4076*/)/*<4069*/(/*4069*//*4069*//*4069*//*4069*/cons/*<4069*/(/*4069*//*4084*//*4084*//*4085*/$co/*<4085*/(/*4084*//*4086*/{"0":"\\\"","1":{"type":"nil"},"2":4088,"type":"cst/string"}/*<4086*/)/*<4084*/(/*4084*//*4090*/"\""/*<4090*/)/*<4084*/)/*<4069*/(/*4069*//*4069*//*4069*//*4069*/cons/*<4069*/(/*4069*//*5247*//*5247*//*5248*/$co/*<5248*/(/*5247*//*5249*/{"0":"\\n","1":{"type":"nil"},"2":5252,"type":"cst/string"}/*<5249*/)/*<5247*/(/*5247*//*5250*/"\n"/*<5250*/)/*<5247*/)/*<4069*/(/*4069*//*4069*//*4069*//*4069*/cons/*<4069*/(/*4069*//*5275*//*5275*//*5276*/$co/*<5276*/(/*5275*//*5277*/{"0":"\\\\n","1":{"type":"nil"},"2":5280,"type":"cst/string"}/*<5277*/)/*<5275*/(/*5275*//*5278*/"\\n"/*<5278*/)/*<5275*/)/*<4069*/(/*4069*//*4069*//*4069*//*4069*/cons/*<4069*/(/*4069*//*5283*//*5283*//*5284*/$co/*<5284*/(/*5283*//*5285*/{"0":"\\\\\\n","1":{"type":"nil"},"2":5288,"type":"cst/string"}/*<5285*/)/*<5283*/(/*5283*//*5286*/"\\\n"/*<5286*/)/*<5283*/)/*<4069*/(/*4069*//*4069*//*4069*//*4069*/cons/*<4069*/(/*4069*//*4092*//*4092*//*4093*/$co/*<4093*/(/*4092*//*4094*/{"0":{"0":{"0":"+","1":4097,"type":"cst/identifier"},"1":{"0":{"0":"2","1":4098,"type":"cst/identifier"},"1":{"0":{"0":"3","1":4099,"type":"cst/identifier"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"type":"cons"},"1":4096,"type":"cst/list"}/*<4094*/)/*<4092*/(/*4092*//*4100*/5/*<4100*/)/*<4092*/)/*<4069*/(/*4069*//*4069*//*4069*//*4069*/cons/*<4069*/(/*4069*//*4119*//*4119*//*4120*/$co/*<4120*/(/*4119*//*4121*/{"0":"a","1":{"0":{"0":{"0":"2","1":4283,"type":"cst/identifier"},"1":"b","2":4284,"type":",,"},"1":{"type":"nil"},"type":"cons"},"2":4123,"type":"cst/string"}/*<4121*/)/*<4119*/(/*4119*//*4125*/"a2b"/*<4125*/)/*<4119*/)/*<4069*/(/*4069*//*4069*//*4069*//*4069*/cons/*<4069*/(/*4069*//*4127*//*4127*//*4128*/$co/*<4128*/(/*4127*//*4129*/{"0":{"0":{"0":{"0":{"0":"fn","1":4133,"type":"cst/identifier"},"1":{"0":{"0":{"0":{"0":"a","1":4135,"type":"cst/identifier"},"1":{"type":"nil"},"type":"cons"},"1":4134,"type":"cst/array"},"1":{"0":{"0":{"0":{"0":"+","1":4137,"type":"cst/identifier"},"1":{"0":{"0":"a","1":4138,"type":"cst/identifier"},"1":{"0":{"0":"2","1":4139,"type":"cst/identifier"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"type":"cons"},"1":4136,"type":"cst/list"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"type":"cons"},"1":4132,"type":"cst/list"},"1":{"0":{"0":"21","1":4140,"type":"cst/identifier"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"1":4131,"type":"cst/list"}/*<4129*/)/*<4127*/(/*4127*//*4141*/23/*<4141*/)/*<4127*/)/*<4069*/(/*4069*//*4069*//*4069*//*4069*/cons/*<4069*/(/*4069*//*4142*//*4142*//*4143*/$co/*<4143*/(/*4142*//*4144*/{"0":{"0":{"0":"let","1":4147,"type":"cst/identifier"},"1":{"0":{"0":{"0":{"0":"one","1":4149,"type":"cst/identifier"},"1":{"0":{"0":"1","1":4150,"type":"cst/identifier"},"1":{"0":{"0":"two","1":4151,"type":"cst/identifier"},"1":{"0":{"0":"2","1":4152,"type":"cst/identifier"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"type":"cons"},"type":"cons"},"1":4148,"type":"cst/array"},"1":{"0":{"0":{"0":{"0":"+","1":4154,"type":"cst/identifier"},"1":{"0":{"0":"1","1":4155,"type":"cst/identifier"},"1":{"0":{"0":"2","1":4156,"type":"cst/identifier"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"type":"cons"},"1":4153,"type":"cst/list"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"type":"cons"},"1":4146,"type":"cst/list"}/*<4144*/)/*<4142*/(/*4142*//*4157*/3/*<4157*/)/*<4142*/)/*<4069*/(/*4069*//*4069*//*4069*//*4069*/cons/*<4069*/(/*4069*//*4158*//*4158*//*4159*/$co/*<4159*/(/*4158*//*4160*/{"0":{"0":{"0":"match","1":4163,"type":"cst/identifier"},"1":{"0":{"0":"2","1":4164,"type":"cst/identifier"},"1":{"0":{"0":"2","1":4165,"type":"cst/identifier"},"1":{"0":{"0":"1","1":4166,"type":"cst/identifier"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"type":"cons"},"type":"cons"},"1":4162,"type":"cst/list"}/*<4160*/)/*<4158*/(/*4158*//*4167*/1/*<4167*/)/*<4158*/)/*<4069*/(/*4069*//*4069*//*4069*//*4069*/cons/*<4069*/(/*4069*//*4168*//*4168*//*4169*/$co/*<4169*/(/*4168*//*4170*/{"0":{"0":{"0":"let","1":4173,"type":"cst/identifier"},"1":{"0":{"0":{"0":{"0":"a/b","1":4175,"type":"cst/identifier"},"1":{"0":{"0":"2","1":4176,"type":"cst/identifier"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"1":4174,"type":"cst/array"},"1":{"0":{"0":"a/b","1":4177,"type":"cst/identifier"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"type":"cons"},"1":4172,"type":"cst/list"}/*<4170*/)/*<4168*/(/*4168*//*4178*/2/*<4178*/)/*<4168*/)/*<4069*/(/*4069*//*4069*//*4069*//*4069*/cons/*<4069*/(/*4069*//*4179*//*4179*//*4180*/$co/*<4180*/(/*4179*//*4181*/{"0":{"0":{"0":"match","1":4184,"type":"cst/identifier"},"1":{"0":{"0":"true","1":4185,"type":"cst/identifier"},"1":{"0":{"0":"true","1":4186,"type":"cst/identifier"},"1":{"0":{"0":"1","1":4187,"type":"cst/identifier"},"1":{"0":{"0":"2","1":4188,"type":"cst/identifier"},"1":{"0":{"0":"3","1":4224,"type":"cst/identifier"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"type":"cons"},"type":"cons"},"type":"cons"},"type":"cons"},"1":4183,"type":"cst/list"}/*<4181*/)/*<4179*/(/*4179*//*4189*/1/*<4189*/)/*<4179*/)/*<4069*/(/*4069*//*4069*//*4069*//*4069*/cons/*<4069*/(/*4069*//*4190*//*4190*//*4191*/$co/*<4191*/(/*4190*//*4192*/{"0":"`","1":{"0":{"0":{"0":"1","1":4287,"type":"cst/identifier"},"1":"","2":4288,"type":",,"},"1":{"type":"nil"},"type":"cons"},"2":4194,"type":"cst/string"}/*<4192*/)/*<4190*/(/*4190*//*4196*/"\`1"/*<4196*/)/*<4190*/)/*<4069*/(/*4069*//*4069*//*4069*//*4069*/cons/*<4069*/(/*4069*//*4198*//*4198*//*4199*/$co/*<4199*/(/*4198*//*4200*/{"0":"${","1":{"0":{"0":{"0":"1","1":4289,"type":"cst/identifier"},"1":"","2":4290,"type":",,"},"1":{"type":"nil"},"type":"cons"},"2":4202,"type":"cst/string"}/*<4200*/)/*<4198*/(/*4198*//*4204*/"\${1"/*<4204*/)/*<4198*/)/*<4069*/(/*4069*//*4069*//*4069*//*4069*/cons/*<4069*/(/*4069*//*4291*//*4291*//*4292*/$co/*<4292*/(/*4291*//*4293*/{"0":{"0":{"0":"match","1":4297,"type":"cst/identifier"},"1":{"0":{"0":{"0":{"0":"1","1":4299,"type":"cst/identifier"},"1":{"type":"nil"},"type":"cons"},"1":4298,"type":"cst/array"},"1":{"0":{"0":{"type":"nil"},"1":4300,"type":"cst/array"},"1":{"0":{"0":{"type":"nil"},"1":4301,"type":"cst/array"},"1":{"0":{"0":{"0":{"0":"a","1":4303,"type":"cst/identifier"},"1":{"0":{"0":{"0":"b","1":4304,"type":"cst/identifier"},"1":4307,"type":"cst/spread"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"1":4302,"type":"cst/array"},"1":{"0":{"0":"a","1":4308,"type":"cst/identifier"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"type":"cons"},"type":"cons"},"type":"cons"},"type":"cons"},"1":4296,"type":"cst/list"}/*<4293*/)/*<4291*/(/*4291*//*4294*/1/*<4294*/)/*<4291*/)/*<4069*/(/*4069*//*4069*/nil/*<4069*/)/*<4069*/)/*<4069*/)/*<4069*/)/*<4069*/)/*<4069*/)/*<4069*/)/*<4069*/)/*<4069*/)/*<4069*/)/*<4069*/)/*<4069*/)/*<4069*/)/*<4069*/)/*<4069*/)/*<4069*/)/*<4069*/)/*<4065*/
/*4261*//*4261*//*5169*/$co/*<5169*/(/*4261*//*5170*/function name_5170(x) { return /*5174*//*5174*//*5175*/compile_stmt/*<5175*/(/*5174*//*5176*//*5177*/parse_stmt/*<5177*/(/*5176*//*5178*/x/*<5178*/)/*<5176*/)/*<5174*/(/*5174*//*5179*/map$slnil/*<5179*/)/*<5174*/ }/*<5170*/)/*<4261*/(/*4261*//*5180*//*5180*//*5180*/cons/*<5180*/(/*5180*//*5181*//*5181*//*5182*/$co/*<5182*/(/*5181*//*5183*/{"0":{"0":{"0":"deftype","1":5187,"type":"cst/identifier"},"1":{"0":{"0":{"0":{"0":"array","1":5190,"type":"cst/identifier"},"1":{"0":{"0":"a","1":5191,"type":"cst/identifier"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"1":5189,"type":"cst/list"},"1":{"0":{"0":{"0":{"0":"cons","1":5193,"type":"cst/identifier"},"1":{"0":{"0":"a","1":5194,"type":"cst/identifier"},"1":{"0":{"0":{"0":{"0":"array","1":5196,"type":"cst/identifier"},"1":{"0":{"0":"a","1":5197,"type":"cst/identifier"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"1":5195,"type":"cst/list"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"type":"cons"},"1":5192,"type":"cst/list"},"1":{"0":{"0":{"0":{"0":"nil","1":5199,"type":"cst/identifier"},"1":{"type":"nil"},"type":"cons"},"1":5198,"type":"cst/list"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"type":"cons"},"type":"cons"},"1":5185,"type":"cst/list"}/*<5183*/)/*<5181*/(/*5181*//*5186*/"const cons = (v0) => (v1) => ({type: \"cons\", 0: v0, 1: v1});\nconst nil = ({type: \"nil\"});"/*<5186*/)/*<5181*/)/*<5180*/(/*5180*//*5180*//*5180*//*5180*/cons/*<5180*/(/*5180*//*5221*//*5221*//*5222*/$co/*<5222*/(/*5221*//*5223*/{"0":{"0":{"0":"deftype","1":5230,"type":"cst/identifier"},"1":{"0":{"0":"face","1":5231,"type":"cst/identifier"},"1":{"0":{"0":{"0":{"0":"red","1":5233,"type":"cst/identifier"},"1":{"type":"nil"},"type":"cons"},"1":5232,"type":"cst/list"},"1":{"0":{"0":{"0":{"0":"black","1":5235,"type":"cst/identifier"},"1":{"type":"nil"},"type":"cons"},"1":5234,"type":"cst/list"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"type":"cons"},"type":"cons"},"1":5227,"type":"cst/list"}/*<5223*/)/*<5221*/(/*5221*//*5224*/"const red = ({type: \"red\"});\nconst black = ({type: \"black\"});"/*<5224*/)/*<5221*/)/*<5180*/(/*5180*//*5180*/nil/*<5180*/)/*<5180*/)/*<5180*/)/*<4261*/
/*5763*//*5763*//*5763*//*5763*//*5765*/parse_and_compile/*<5765*/(/*5763*//*5766*/parse_stmt/*<5766*/)/*<5763*/(/*5763*//*5767*/parse_expr/*<5767*/)/*<5763*/(/*5763*//*5768*/compile_stmt/*<5768*/)/*<5763*/(/*5763*//*5770*/compile/*<5770*/)/*<5763*/
return /*5763*//*5763*//*5763*//*5763*//*5765*/parse_and_compile/*<5765*/(/*5763*//*5766*/parse_stmt/*<5766*/)/*<5763*/(/*5763*//*5767*/parse_expr/*<5767*/)/*<5763*/(/*5763*//*5768*/compile_stmt/*<5768*/)/*<5763*/(/*5763*//*5770*/compile/*<5770*/)/*<5763*/