const builtins = /*3135*/"const sanMap = { '-': '_', '+': '\$pl', '*': '\$ti', '=': '\$eq', \n'>': '\$gt', '<': '\$lt', \"'\": '\$qu', '\"': '\$dq', ',': '\$co', '@': '\$at', '/': '\$sl'};\n\nconst kwds = 'case var if return';\nconst rx = [];\nkwds.split(' ').forEach((kwd) =>\n    rx.push([new RegExp(\`^\${kwd}\$\`, 'g'), '\$' + kwd]),);\nconst sanitize = (raw) => { if (raw == null) debugger;\n    for (let [key, val] of Object.entries(sanMap)) {\n        raw = raw.replaceAll(key, val);\n    }\n    rx.forEach(([rx, res]) => {\n        raw = raw.replaceAll(rx, res);\n    });\n    return raw;\n};\nconst jsonify = (raw) => JSON.stringify(raw);\nconst string_to_int = (a) => {\n    var v = parseInt(a);\n    if (!isNaN(v) && '' + v === a) return {type: 'some', 0: v}\n    return {type: 'none'}\n}\n\nconst unwrapArray = (v) => {\n    if (!v) debugger\n    return v.type === 'nil' ? [] : [v[0], ...unwrapArray(v[1])]\n};\nconst \$eq = (a) => (b) => a == b;\nconst fatal = (e) => {throw new Error(e)}\nconst nil = { type: 'nil' };\nconst cons = (a) => (b) => ({ type: 'cons', 0: a, 1: b });\nconst \$pl\$pl = (items) => unwrapArray(items).join('');\nconst \$pl = (a) => (b) => a + b;\nconst _ = (a) => (b) => a - b;\nconst int_to_string = (a) => a + '';\nconst replace_all = (a) => (b) => (c) => {\n    return a.replaceAll(b, c);\n};\nconst \$co = (a) => (b) => ({ type: ',', 0: a, 1: b });\nconst reduce = (init) => (items) => (f) => {\n    return unwrapArray(items).reduce((a, b) => f(a)(b), init);\n};\n"/*<3135*/;

const ast = /*11*/"# AST"/*<11*/;

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
const parsing = /*564*/"# Parsing"/*<564*/;

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

const pairs = /*1684*/function name_1684(array) { return /*1690*/(function match_1690($target) {
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
return /*3151*//*3152*/fatal/*<3152*/(/*3151*//*3153*/`Pairs given odd number ${/*3155*//*3157*/valueToString/*<3157*/(/*3155*//*3158*/array/*<3158*/)/*<3155*/}`/*<3153*/)/*<3151*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 1690');})(/*!*//*1692*/array/*<1692*/)/*<1690*/ }/*<1684*/;

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

const some = (v0) => ({type: "some", 0: v0});
const none = ({type: "none"});
const prelude = /*130*/"# prelude"/*<130*/;

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

const compilation = /*355*/"# compilation"/*<355*/;

const util = /*525*/"# util"/*<525*/;

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

const unescape_string = /*2167*/function name_2167(string) { return /*2242*//*2242*//*2243*/replaces/*<2243*/(/*2242*//*2244*/string/*<2244*/)/*<2242*/(/*2242*//*2245*//*2245*//*2245*/cons/*<2245*/(/*2245*//*2246*//*2246*//*2247*/$co/*<2247*/(/*2246*//*2248*/"\\\""/*<2248*/)/*<2246*/(/*2246*//*2250*/"\""/*<2250*/)/*<2246*/)/*<2245*/(/*2245*//*2245*//*2245*//*2245*/cons/*<2245*/(/*2245*//*2252*//*2252*//*2253*/$co/*<2253*/(/*2252*//*2254*/"\\n"/*<2254*/)/*<2252*/(/*2252*//*2256*/"\n"/*<2256*/)/*<2252*/)/*<2245*/(/*2245*//*2245*//*2245*//*2245*/cons/*<2245*/(/*2245*//*2258*//*2258*//*2259*/$co/*<2259*/(/*2258*//*2260*/"\\\\"/*<2260*/)/*<2258*/(/*2258*//*2263*/"\\"/*<2263*/)/*<2258*/)/*<2245*/(/*2245*//*2245*/nil/*<2245*/)/*<2245*/)/*<2245*/)/*<2245*/)/*<2242*/ }/*<2167*/;

const its = /*5948*/int_to_string/*<5948*/;

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

const source_map = /*4890*/function name_4890(loc) { return /*4890*/function name_4890(js) { return /*4897*/`/*${/*5953*//*4899*/its/*<4899*/(/*5953*//*5954*/loc/*<5954*/)/*<5953*/}*/${/*4901*/js/*<4901*/}/*<${/*5955*//*4903*/its/*<4903*/(/*5955*//*5956*/loc/*<5956*/)/*<5955*/}*/`/*<4897*/ }/*<4890*/ }/*<4890*/;

const parse_and_compile = (v0) => (v1) => (v2) => (v3) => ({type: "parse-and-compile", 0: v0, 1: v1, 2: v2, 3: v3});
return {type: 'fns', ast, builtins, compilation, compile, compile_pat, compile_stmt, escape_string, expr_loc, foldl, foldr, fst, its, join, map, mapi, mk_deftype, pairs, parse_array, parse_expr, parse_pat, parse_stmt, parse_type, parsing, pat_loc, pat_loop, prelude, replaces, rev, run, snd, source_map, tapps, trace_and, trace_and_block, trace_wrap, unescape_string, util}