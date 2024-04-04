const pint = (v0) => (v1) => ({type: "pint", 0: v0, 1: v1});
const pbool = (v0) => (v1) => ({type: "pbool", 0: v0, 1: v1});
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

const some = (v0) => ({type: "some", 0: v0});
const none = ({type: "none"});
const builtins = /*3135*/"const sanMap = { '-': '_', '+': '\$pl', '*': '\$ti', '=': '\$eq', \n'>': '\$gt', '<': '\$lt', \"'\": '\$qu', '\"': '\$dq', ',': '\$co', '@': '\$at', '/': '\$sl'};\n\nconst kwds = 'case var if return super break while for default';\nconst rx = [];\nkwds.split(' ').forEach((kwd) =>\n    rx.push([new RegExp(\`^\${kwd}\$\`, 'g'), '\$' + kwd]),);\nconst sanitize = (raw) => { if (raw == null) debugger;\n    for (let [key, val] of Object.entries(sanMap)) {\n        raw = raw.replaceAll(key, val);\n    }\n    rx.forEach(([rx, res]) => {\n        raw = raw.replaceAll(rx, res);\n    });\n    return raw;\n};\nconst jsonify = (raw) => JSON.stringify(raw);\nconst string_to_int = (a) => {\n    var v = parseInt(a);\n    if (!isNaN(v) && '' + v === a) return {type: 'some', 0: v}\n    return {type: 'none'}\n}\n\nconst unwrapArray = (v) => {\n    if (!v) debugger\n    return v.type === 'nil' ? [] : [v[0], ...unwrapArray(v[1])]\n};\nconst \$eq = (a) => (b) => a == b;\nconst fatal = (e) => {throw new Error(e)}\nconst nil = { type: 'nil' };\nconst cons = (a) => (b) => ({ type: 'cons', 0: a, 1: b });\nconst \$pl\$pl = (items) => unwrapArray(items).join('');\nconst \$pl = (a) => (b) => a + b;\nconst _ = (a) => (b) => a - b;\nconst int_to_string = (a) => a + '';\nconst replace_all = (a) => (b) => (c) => {\n    return a.replaceAll(b, c);\n};\nconst \$co = (a) => (b) => ({ type: ',', 0: a, 1: b });\nconst reduce = (init) => (items) => (f) => {\n    return unwrapArray(items).reduce((a, b) => f(a)(b), init);\n};\n"/*<3135*/;

const its = /*5948*/int_to_string/*<5948*/;

const value = ({type: "value"});
const type = ({type: "type"});
const dot = /*7091*/function name_7091(a) { return /*7091*/function name_7091(b) { return /*7091*/function name_7091(c) { return /*7098*//*7099*/a/*<7099*/(/*7098*//*7100*//*7101*/b/*<7101*/(/*7100*//*7102*/c/*<7102*/)/*<7100*/)/*<7098*/ }/*<7091*/ }/*<7091*/ }/*<7091*/;

const nil = ({type: "nil"});
const cons = (v0) => (v1) => ({type: "cons", 0: v0, 1: v1});
const pany = (v0) => ({type: "pany", 0: v0});
const pvar = (v0) => (v1) => ({type: "pvar", 0: v0, 1: v1});
const pcon = (v0) => (v1) => (v2) => ({type: "pcon", 0: v0, 1: v1, 2: v2});
const pstr = (v0) => (v1) => ({type: "pstr", 0: v0, 1: v1});
const pprim = (v0) => (v1) => ({type: "pprim", 0: v0, 1: v1});
const cst$sllist = (v0) => (v1) => ({type: "cst/list", 0: v0, 1: v1});
const cst$slarray = (v0) => (v1) => ({type: "cst/array", 0: v0, 1: v1});
const cst$slspread = (v0) => (v1) => ({type: "cst/spread", 0: v0, 1: v1});
const cst$slidentifier = (v0) => (v1) => ({type: "cst/identifier", 0: v0, 1: v1});
const cst$slstring = (v0) => (v1) => (v2) => ({type: "cst/string", 0: v0, 1: v1, 2: v2});
const one = (v0) => ({type: "one", 0: v0});
const many = (v0) => ({type: "many", 0: v0});
const empty = ({type: "empty"});
const tvar = (v0) => (v1) => ({type: "tvar", 0: v0, 1: v1});
const tapp = (v0) => (v1) => (v2) => ({type: "tapp", 0: v0, 1: v1, 2: v2});
const tcon = (v0) => (v1) => ({type: "tcon", 0: v0, 1: v1});
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
return /*7399*/`${/*7401*/one/*<7401*/}${/*7403*/sep/*<7403*/}${/*7405*//*7405*//*7407*/join/*<7407*/(/*7405*//*7409*/sep/*<7409*/)/*<7405*/(/*7405*//*7410*/rest/*<7410*/)/*<7405*/}`/*<7399*/
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

const bag$sland = /*6567*/function name_6567(first) { return /*6567*/function name_6567(second) { return /*6573*/(function match_6573($target) {
if ($target.type === ",") {
if ($target[0].type === "empty") {
{
let a = $target[1];
return /*6584*/a/*<6584*/
}
}
}
if ($target.type === ",") {
{
let a = $target[0];
if ($target[1].type === "empty") {
return /*6590*/a/*<6590*/
}
}
}
if ($target.type === ",") {
if ($target[0].type === "many") {
if ($target[0][0].type === "cons") {
{
let a = $target[0][0][0];
if ($target[0][0][1].type === "nil") {
if ($target[1].type === "many") {
{
let b = $target[1][0];
return /*6600*//*6601*/many/*<6601*/(/*6600*//*6602*//*6602*//*6602*/cons/*<6602*/(/*6602*//*6603*/a/*<6603*/)/*<6602*/(/*6602*//*6605*/b/*<6605*/)/*<6602*/)/*<6600*/
}
}
}
}
}
}
}
if ($target.type === ",") {
{
let a = $target[0];
if ($target[1].type === "many") {
{
let b = $target[1][0];
return /*6612*//*6613*/many/*<6613*/(/*6612*//*6614*//*6614*//*6614*/cons/*<6614*/(/*6614*//*6615*/a/*<6615*/)/*<6614*/(/*6614*//*6617*/b/*<6617*/)/*<6614*/)/*<6612*/
}
}
}
}
return /*6619*//*6620*/many/*<6620*/(/*6619*//*6621*//*6621*//*6621*/cons/*<6621*/(/*6621*//*6622*/first/*<6622*/)/*<6621*/(/*6621*//*6621*//*6621*//*6621*/cons/*<6621*/(/*6621*//*6623*/second/*<6623*/)/*<6621*/(/*6621*//*6621*/nil/*<6621*/)/*<6621*/)/*<6621*/)/*<6619*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 6573');})(/*!*//*6575*//*6575*//*6576*/$co/*<6576*/(/*6575*//*6577*/first/*<6577*/)/*<6575*/(/*6575*//*6578*/second/*<6578*/)/*<6575*/)/*<6573*/ }/*<6567*/ }/*<6567*/;

const bag$slfold = /*6624*/function name_6624(f) { return /*6624*/function name_6624(init) { return /*6624*/function name_6624(bag) { return /*6631*/(function match_6631($target) {
if ($target.type === "empty") {
return /*6636*/init/*<6636*/
}
if ($target.type === "one") {
{
let v = $target[0];
return /*6640*//*6640*//*6641*/f/*<6641*/(/*6640*//*6642*/init/*<6642*/)/*<6640*/(/*6640*//*6643*/v/*<6643*/)/*<6640*/
}
}
if ($target.type === "many") {
{
let items = $target[0];
return /*6647*//*6647*//*6647*//*6648*/foldr/*<6648*/(/*6647*//*6649*/init/*<6649*/)/*<6647*/(/*6647*//*6650*/items/*<6650*/)/*<6647*/(/*6647*//*6651*//*6652*/bag$slfold/*<6652*/(/*6651*//*6653*/f/*<6653*/)/*<6651*/)/*<6647*/
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 6631');})(/*!*//*6633*/bag/*<6633*/)/*<6631*/ }/*<6624*/ }/*<6624*/ }/*<6624*/;

const bag$slto_list = /*6682*/function name_6682(bag) { return /*6687*//*6687*//*6687*//*7334*/bag$slfold/*<7334*/(/*6687*//*7335*/function name_7335(list) { return /*7335*/function name_7335(one) { return /*7340*//*7340*//*7340*/cons/*<7340*/(/*7340*//*7341*/one/*<7341*/)/*<7340*/(/*7340*//*7342*/list/*<7342*/)/*<7340*/ }/*<7335*/ }/*<7335*/)/*<6687*/(/*6687*//*7352*/nil/*<7352*/)/*<6687*/(/*6687*//*7351*/bag/*<7351*/)/*<6687*/ }/*<6682*/;

const pat_names = /*6757*/function name_6757(pat) { return /*6762*/(function match_6762($target) {
if ($target.type === "pany") {
return /*6768*/set$slnil/*<6768*/
}
if ($target.type === "pvar") {
{
let name = $target[0];
{
let l = $target[1];
return /*6773*//*6773*//*6774*/set$sladd/*<6774*/(/*6773*//*6775*/set$slnil/*<6775*/)/*<6773*/(/*6773*//*6776*/name/*<6776*/)/*<6773*/
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
return /*6782*//*6782*//*6782*//*6783*/foldl/*<6783*/(/*6782*//*6784*/set$slnil/*<6784*/)/*<6782*/(/*6782*//*6785*/args/*<6785*/)/*<6782*/(/*6782*//*6786*/function name_6786(bound) { return /*6786*/function name_6786(arg) { return /*6791*//*6791*//*6792*/set$slmerge/*<6792*/(/*6791*//*6793*/bound/*<6793*/)/*<6791*/(/*6791*//*6794*//*6795*/pat_names/*<6795*/(/*6794*//*6796*/arg/*<6796*/)/*<6794*/)/*<6791*/ }/*<6786*/ }/*<6786*/)/*<6782*/
}
}
}
}
if ($target.type === "pstr") {
{
let string = $target[0];
{
let int = $target[1];
return /*6801*/set$slnil/*<6801*/
}
}
}
if ($target.type === "pprim") {
{
let prim = $target[0];
{
let int = $target[1];
return /*6806*/set$slnil/*<6806*/
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 6762');})(/*!*//*6764*/pat/*<6764*/)/*<6762*/ }/*<6757*/;

const pat_externals = /*6807*/function name_6807(pat) { return /*6812*/(function match_6812($target) {
if ($target.type === "pcon") {
{
let name = $target[0];
{
let args = $target[1];
{
let l = $target[2];
return /*6821*//*6821*//*6822*/bag$sland/*<6822*/(/*6821*//*6823*//*6824*/one/*<6824*/(/*6823*//*6825*//*6825*//*6825*//*6826*/$co$co/*<6826*/(/*6825*//*6827*/name/*<6827*/)/*<6825*/(/*6825*//*6829*/value/*<6829*/)/*<6825*/(/*6825*//*6830*/l/*<6830*/)/*<6825*/)/*<6823*/)/*<6821*/(/*6821*//*6831*//*6832*/many/*<6832*/(/*6831*//*6833*//*6833*//*6834*/map/*<6834*/(/*6833*//*6835*/args/*<6835*/)/*<6833*/(/*6833*//*6836*/pat_externals/*<6836*/)/*<6833*/)/*<6831*/)/*<6821*/
}
}
}
}
return /*6838*/empty/*<6838*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 6812');})(/*!*//*6814*/pat/*<6814*/)/*<6812*/ }/*<6807*/;

const externals_type = /*7103*/function name_7103(bound) { return /*7103*/function name_7103(t) { return /*7109*/(function match_7109($target) {
if ($target.type === "tvar") {
return /*7116*/empty/*<7116*/
}
if ($target.type === "tcon") {
{
let name = $target[0];
{
let l = $target[1];
return /*7121*/(function match_7121($target) {
if ($target === true) {
return /*7127*/empty/*<7127*/
}
return /*7128*//*7129*/one/*<7129*/(/*7128*//*7130*//*7130*//*7130*//*7131*/$co$co/*<7131*/(/*7130*//*7132*/name/*<7132*/)/*<7130*/(/*7130*//*7134*/type/*<7134*/)/*<7130*/(/*7130*//*7135*/l/*<7135*/)/*<7130*/)/*<7128*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 7121');})(/*!*//*7123*//*7123*//*7124*/set$slhas/*<7124*/(/*7123*//*7125*/bound/*<7125*/)/*<7123*/(/*7123*//*7126*/name/*<7126*/)/*<7123*/)/*<7121*/
}
}
}
if ($target.type === "tapp") {
{
let one = $target[0];
{
let two = $target[1];
return /*7141*//*7141*//*7142*/bag$sland/*<7142*/(/*7141*//*7143*//*7143*//*7144*/externals_type/*<7144*/(/*7143*//*7145*/bound/*<7145*/)/*<7143*/(/*7143*//*7146*/one/*<7146*/)/*<7143*/)/*<7141*/(/*7141*//*7147*//*7147*//*7148*/externals_type/*<7148*/(/*7147*//*7149*/bound/*<7149*/)/*<7147*/(/*7147*//*7150*/two/*<7150*/)/*<7147*/)/*<7141*/
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 7109');})(/*!*//*7111*/t/*<7111*/)/*<7109*/ }/*<7103*/ }/*<7103*/;

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

const stypealias = (v0) => (v1) => (v2) => (v3) => (v4) => ({type: "stypealias", 0: v0, 1: v1, 2: v2, 3: v3, 4: v4});
const sdeftype = (v0) => (v1) => (v2) => (v3) => (v4) => ({type: "sdeftype", 0: v0, 1: v1, 2: v2, 3: v3, 4: v4});
const sdef = (v0) => (v1) => (v2) => (v3) => ({type: "sdef", 0: v0, 1: v1, 2: v2, 3: v3});
const sexpr = (v0) => (v1) => ({type: "sexpr", 0: v0, 1: v1});
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
throw new Error('failed to match ' + jsonify($target) + '. Loc: 5024');})(/*!*//*5026*/arg/*<5026*/)/*<5024*/ }/*<5020*/)/*<5017*/)/*<1433*/(/*1433*//*1436*//*1436*//*1436*//*1437*/foldr/*<1437*/(/*1436*//*6021*/nil/*<6021*/)/*<1436*/(/*1436*//*1438*/items/*<1438*/)/*<1436*/(/*1436*//*1439*/function name_1439(res) { return /*1439*/function name_1439(constr) { return /*1443*/(function match_1443($target) {
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
return /*6022*//*6022*//*6022*/cons/*<6022*/(/*6022*//*1457*//*1457*//*1457*//*1457*//*1458*/$co$co$co/*<1458*/(/*1457*//*1459*/name/*<1459*/)/*<1457*/(/*1457*//*3982*/ni/*<3982*/)/*<1457*/(/*1457*//*1460*//*1460*//*1461*/map/*<1461*/(/*1460*//*1462*/args/*<1462*/)/*<1460*/(/*1460*//*1463*/parse_type/*<1463*/)/*<1460*/)/*<1457*/(/*1457*//*3984*/l/*<3984*/)/*<1457*/)/*<6022*/(/*6022*//*6023*/res/*<6023*/)/*<6022*/
}
}
}
}
}
}
}
if ($target.type === "cst/list") {
if ($target[0].type === "nil") {
{
let l = $target[1];
return /*6007*/res/*<6007*/
}
}
}
return /*6028*//*6029*/fatal/*<6029*/(/*6028*//*6030*/"Invalid type constructor"/*<6030*/)/*<6028*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 1443');})(/*!*//*1445*/constr/*<1445*/)/*<1443*/ }/*<1439*/ }/*<1439*/)/*<1436*/)/*<1433*/(/*1433*//*3981*/l/*<3981*/)/*<1433*/ }/*<1390*/ }/*<1390*/ }/*<1390*/ }/*<1390*/ }/*<1390*/;

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

const parse_and_compile = (v0) => (v1) => (v2) => (v3) => (v4) => (v5) => ({type: "parse-and-compile", 0: v0, 1: v1, 2: v2, 3: v3, 4: v4, 5: v5});
const externals = /*6839*/function name_6839(bound) { return /*6839*/function name_6839(expr) { return /*6845*/(function match_6845($target) {
if ($target.type === "evar") {
{
let name = $target[0];
{
let l = $target[1];
return /*6852*/(function match_6852($target) {
if ($target === true) {
return /*6858*/empty/*<6858*/
}
return /*6859*//*6860*/one/*<6860*/(/*6859*//*6861*//*6861*//*6861*//*6862*/$co$co/*<6862*/(/*6861*//*6863*/name/*<6863*/)/*<6861*/(/*6861*//*6865*/value/*<6865*/)/*<6861*/(/*6861*//*6866*/l/*<6866*/)/*<6861*/)/*<6859*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 6852');})(/*!*//*6854*//*6854*//*6855*/set$slhas/*<6855*/(/*6854*//*6856*/bound/*<6856*/)/*<6854*/(/*6854*//*6857*/name/*<6857*/)/*<6854*/)/*<6852*/
}
}
}
if ($target.type === "eprim") {
{
let prim = $target[0];
{
let l = $target[1];
return /*6871*/empty/*<6871*/
}
}
}
if ($target.type === "estr") {
{
let first = $target[0];
{
let templates = $target[1];
{
let int = $target[2];
return /*6877*//*6878*/many/*<6878*/(/*6877*//*6879*//*6879*//*6880*/map/*<6880*/(/*6879*//*6881*/templates/*<6881*/)/*<6879*/(/*6879*//*6882*/function name_6882(arg) { return /*7411*/(function match_7411($target) {
if ($target.type === ",,") {
{
let expr = $target[0];
return /*6890*//*6890*//*6891*/externals/*<6891*/(/*6890*//*6892*/bound/*<6892*/)/*<6890*/(/*6890*//*6893*/expr/*<6893*/)/*<6890*/
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 7411');})(/*!*//*7413*/arg/*<7413*/)/*<7411*/ }/*<6882*/)/*<6879*/)/*<6877*/
}
}
}
}
if ($target.type === "equot") {
{
let expr = $target[0];
{
let int = $target[1];
return /*6898*/empty/*<6898*/
}
}
}
if ($target.type === "equot/type") {
return /*6903*/empty/*<6903*/
}
if ($target.type === "equot/pat") {
return /*6908*/empty/*<6908*/
}
if ($target.type === "equot/stmt") {
return /*6913*/empty/*<6913*/
}
if ($target.type === "equotquot") {
{
let cst = $target[0];
{
let int = $target[1];
return /*6918*/empty/*<6918*/
}
}
}
if ($target.type === "elambda") {
{
let name = $target[0];
{
let int = $target[1];
{
let body = $target[2];
{
let int = $target[3];
return /*6925*//*6925*//*6926*/externals/*<6926*/(/*6925*//*6927*//*6927*//*6928*/set$sladd/*<6928*/(/*6927*//*6929*/bound/*<6929*/)/*<6927*/(/*6927*//*6930*/name/*<6930*/)/*<6927*/)/*<6925*/(/*6925*//*6931*/body/*<6931*/)/*<6925*/
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
return /*6938*//*6938*//*6939*/bag$sland/*<6939*/(/*6938*//*6940*//*6940*//*6941*/bag$sland/*<6941*/(/*6940*//*6942*//*6943*/pat_externals/*<6943*/(/*6942*//*6944*/pat/*<6944*/)/*<6942*/)/*<6940*/(/*6940*//*6945*//*6945*//*6946*/externals/*<6946*/(/*6945*//*6947*/bound/*<6947*/)/*<6945*/(/*6945*//*6948*/init/*<6948*/)/*<6945*/)/*<6940*/)/*<6938*/(/*6938*//*6949*//*6949*//*6950*/externals/*<6950*/(/*6949*//*6951*//*6951*//*6952*/set$slmerge/*<6952*/(/*6951*//*6953*/bound/*<6953*/)/*<6951*/(/*6951*//*6954*//*6955*/pat_names/*<6955*/(/*6954*//*6956*/pat/*<6956*/)/*<6954*/)/*<6951*/)/*<6949*/(/*6949*//*6957*/body/*<6957*/)/*<6949*/)/*<6938*/
}
}
}
}
}
if ($target.type === "eapp") {
{
let target = $target[0];
{
let arg = $target[1];
{
let int = $target[2];
return /*6963*//*6963*//*6964*/bag$sland/*<6964*/(/*6963*//*6965*//*6965*//*6966*/externals/*<6966*/(/*6965*//*6967*/bound/*<6967*/)/*<6965*/(/*6965*//*6968*/target/*<6968*/)/*<6965*/)/*<6963*/(/*6963*//*6969*//*6969*//*6970*/externals/*<6970*/(/*6969*//*6971*/bound/*<6971*/)/*<6969*/(/*6969*//*6972*/arg/*<6972*/)/*<6969*/)/*<6963*/
}
}
}
}
if ($target.type === "ematch") {
{
let expr = $target[0];
{
let cases = $target[1];
{
let int = $target[2];
return /*6978*//*6978*//*6979*/bag$sland/*<6979*/(/*6978*//*6980*//*6980*//*6981*/externals/*<6981*/(/*6980*//*6982*/bound/*<6982*/)/*<6980*/(/*6980*//*6983*/expr/*<6983*/)/*<6980*/)/*<6978*/(/*6978*//*6984*//*6984*//*6984*//*6985*/foldl/*<6985*/(/*6984*//*6986*/empty/*<6986*/)/*<6984*/(/*6984*//*6987*/cases/*<6987*/)/*<6984*/(/*6984*//*6988*/function name_6988(bag) { return /*6988*/function name_6988(arg) { return /*7421*/(function match_7421($target) {
if ($target.type === ",") {
{
let pat = $target[0];
{
let body = $target[1];
return /*6996*//*6996*//*6997*/bag$sland/*<6997*/(/*6996*//*6998*//*6998*//*6999*/bag$sland/*<6999*/(/*6998*//*7000*/bag/*<7000*/)/*<6998*/(/*6998*//*7001*//*7002*/pat_externals/*<7002*/(/*7001*//*7003*/pat/*<7003*/)/*<7001*/)/*<6998*/)/*<6996*/(/*6996*//*7004*//*7004*//*7005*/externals/*<7005*/(/*7004*//*7006*//*7006*//*7007*/set$slmerge/*<7007*/(/*7006*//*7008*/bound/*<7008*/)/*<7006*/(/*7006*//*7009*//*7010*/pat_names/*<7010*/(/*7009*//*7011*/pat/*<7011*/)/*<7009*/)/*<7006*/)/*<7004*/(/*7004*//*7012*/body/*<7012*/)/*<7004*/)/*<6996*/
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 7421');})(/*!*//*7423*/arg/*<7423*/)/*<7421*/ }/*<6988*/ }/*<6988*/)/*<6984*/)/*<6978*/
}
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 6845');})(/*!*//*6847*/expr/*<6847*/)/*<6845*/ }/*<6839*/ }/*<6839*/;

const names = /*7151*/function name_7151(stmt) { return /*7156*/(function match_7156($target) {
if ($target.type === "sdef") {
{
let name = $target[0];
{
let l = $target[1];
return /*7165*//*7165*//*7165*/cons/*<7165*/(/*7165*//*7166*//*7166*//*7166*//*7167*/$co$co/*<7167*/(/*7166*//*7168*/name/*<7168*/)/*<7166*/(/*7166*//*7170*/value/*<7170*/)/*<7166*/(/*7166*//*7171*/l/*<7171*/)/*<7166*/)/*<7165*/(/*7165*//*7165*/nil/*<7165*/)/*<7165*/
}
}
}
if ($target.type === "sexpr") {
return /*7176*/nil/*<7176*/
}
if ($target.type === "stypealias") {
{
let name = $target[0];
{
let l = $target[1];
return /*7184*//*7184*//*7184*/cons/*<7184*/(/*7184*//*7185*//*7185*//*7185*//*7186*/$co$co/*<7186*/(/*7185*//*7187*/name/*<7187*/)/*<7185*/(/*7185*//*7189*/type/*<7189*/)/*<7185*/(/*7185*//*7190*/l/*<7190*/)/*<7185*/)/*<7184*/(/*7184*//*7184*/nil/*<7184*/)/*<7184*/
}
}
}
if ($target.type === "sdeftype") {
{
let name = $target[0];
{
let l = $target[1];
{
let constructors = $target[3];
return /*7198*//*7198*//*7198*/cons/*<7198*/(/*7198*//*7199*//*7199*//*7199*//*7200*/$co$co/*<7200*/(/*7199*//*7201*/name/*<7201*/)/*<7199*/(/*7199*//*7203*/type/*<7203*/)/*<7199*/(/*7199*//*7204*/l/*<7204*/)/*<7199*/)/*<7198*/(/*7198*//*7206*//*7206*//*7207*/map/*<7207*/(/*7206*//*7208*/constructors/*<7208*/)/*<7206*/(/*7206*//*7209*/function name_7209(arg) { return /*7429*/(function match_7429($target) {
if ($target.type === ",,,") {
{
let name = $target[0];
{
let l = $target[1];
return /*7218*//*7218*//*7218*//*7219*/$co$co/*<7219*/(/*7218*//*7220*/name/*<7220*/)/*<7218*/(/*7218*//*7222*/value/*<7222*/)/*<7218*/(/*7218*//*7223*/l/*<7223*/)/*<7218*/
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 7429');})(/*!*//*7431*/arg/*<7431*/)/*<7429*/ }/*<7209*/)/*<7206*/)/*<7198*/
}
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 7156');})(/*!*//*7158*/stmt/*<7158*/)/*<7156*/ }/*<7151*/;

const externals_stmt = /*7224*/function name_7224(stmt) { return /*7229*//*7230*/bag$slto_list/*<7230*/(/*7229*//*7231*/(function match_7231($target) {
if ($target.type === "sdeftype") {
{
let string = $target[0];
{
let int = $target[1];
{
let free = $target[2];
{
let constructors = $target[3];
{
let int = $target[4];
return /*7241*/(function let_7241() {const $target = /*7245*//*7246*/set$slfrom_list/*<7246*/(/*7245*//*7247*//*7247*//*7248*/map/*<7248*/(/*7247*//*7249*/free/*<7249*/)/*<7247*/(/*7247*//*7250*/fst/*<7250*/)/*<7247*/)/*<7245*/;
{
let frees = $target;
return /*7251*//*7252*/many/*<7252*/(/*7251*//*7253*//*7253*//*7254*/map/*<7254*/(/*7253*//*7255*/constructors/*<7255*/)/*<7253*/(/*7253*//*7256*/function name_7256(constructor) { return /*7440*/(function match_7440($target) {
if ($target.type === ",,,") {
{
let name = $target[0];
{
let l = $target[1];
{
let args = $target[2];
return /*7265*/(function match_7265($target) {
if ($target.type === "nil") {
return /*7269*/empty/*<7269*/
}
return /*7271*//*7272*/many/*<7272*/(/*7271*//*7273*//*7273*//*7274*/map/*<7274*/(/*7273*//*7275*/args/*<7275*/)/*<7273*/(/*7273*//*7276*//*7277*/externals_type/*<7277*/(/*7276*//*7278*/frees/*<7278*/)/*<7276*/)/*<7273*/)/*<7271*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 7265');})(/*!*//*7267*/args/*<7267*/)/*<7265*/
}
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 7440');})(/*!*//*7442*/constructor/*<7442*/)/*<7440*/ }/*<7256*/)/*<7253*/)/*<7251*/
};
throw new Error('let pattern not matched 7244. ' + valueToString($target));})(/*!*/)/*<7241*/
}
}
}
}
}
}
if ($target.type === "stypealias") {
{
let name = $target[0];
{
let args = $target[2];
{
let body = $target[3];
return /*7286*/(function let_7286() {const $target = /*7290*//*7291*/set$slfrom_list/*<7291*/(/*7290*//*7292*//*7292*//*7293*/map/*<7293*/(/*7292*//*7294*/args/*<7294*/)/*<7292*/(/*7292*//*7295*/fst/*<7295*/)/*<7292*/)/*<7290*/;
{
let frees = $target;
return /*7296*//*7296*//*7297*/externals_type/*<7297*/(/*7296*//*7298*/frees/*<7298*/)/*<7296*/(/*7296*//*7299*/body/*<7299*/)/*<7296*/
};
throw new Error('let pattern not matched 7289. ' + valueToString($target));})(/*!*/)/*<7286*/
}
}
}
}
if ($target.type === "sdef") {
{
let name = $target[0];
{
let int = $target[1];
{
let body = $target[2];
{
let int = $target[3];
return /*7306*//*7306*//*7307*/externals/*<7307*/(/*7306*//*7308*//*7308*//*7309*/set$sladd/*<7309*/(/*7308*//*7310*/set$slnil/*<7310*/)/*<7308*/(/*7308*//*7311*/name/*<7311*/)/*<7308*/)/*<7306*/(/*7306*//*7312*/body/*<7312*/)/*<7306*/
}
}
}
}
}
if ($target.type === "sexpr") {
{
let expr = $target[0];
{
let int = $target[1];
return /*7317*//*7317*//*7318*/externals/*<7318*/(/*7317*//*7319*/set$slnil/*<7319*/)/*<7317*/(/*7317*//*7320*/expr/*<7320*/)/*<7317*/
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 7231');})(/*!*//*7233*/stmt/*<7233*/)/*<7231*/)/*<7229*/ }/*<7224*/;

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
if ($target[0][0][0] === "defn"){
{
let l = $target[1];
return /*6078*//*6092*/fatal/*<6092*/(/*6078*//*6093*/`Invalid 'defn' ${/*6095*//*6097*/int_to_string/*<6097*/(/*6095*//*6098*/l/*<6098*/)/*<6095*/}`/*<6093*/)/*<6078*/
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
if ($target.type === "cst/list") {
if ($target[0].type === "cons") {
if ($target[0][0].type === "cst/identifier") {
if ($target[0][0][0] === "typealias"){
if ($target[0][1].type === "cons") {
if ($target[0][1][0].type === "cst/identifier") {
{
let name = $target[0][1][0][0];
{
let nl = $target[0][1][0][1];
if ($target[0][1][1].type === "cons") {
{
let body = $target[0][1][1][0];
if ($target[0][1][1][1].type === "nil") {
{
let l = $target[1];
return /*6277*//*6277*//*6277*//*6277*//*6277*//*6291*/stypealias/*<6291*/(/*6277*//*6292*/name/*<6292*/)/*<6277*/(/*6277*//*6293*/nl/*<6293*/)/*<6277*/(/*6277*//*6294*/nil/*<6294*/)/*<6277*/(/*6277*//*6295*//*6296*/parse_type/*<6296*/(/*6295*//*6297*/body/*<6297*/)/*<6295*/)/*<6277*/(/*6277*//*6299*/l/*<6299*/)/*<6277*/
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
if ($target[0][0][0] === "typealias"){
if ($target[0][1].type === "cons") {
if ($target[0][1][0].type === "cst/list") {
if ($target[0][1][0][0].type === "cons") {
if ($target[0][1][0][0][0].type === "cst/identifier") {
{
let name = $target[0][1][0][0][0][0];
{
let nl = $target[0][1][0][0][0][1];
{
let args = $target[0][1][0][0][1];
if ($target[0][1][1].type === "cons") {
{
let body = $target[0][1][1][0];
if ($target[0][1][1][1].type === "nil") {
{
let l = $target[1];
return /*6344*/(function let_6344() {const $target = /*6370*//*6370*//*6371*/map/*<6371*/(/*6370*//*6372*/args/*<6372*/)/*<6370*/(/*6370*//*6373*/function name_6373(x) { return /*6380*/(function match_6380($target) {
if ($target.type === "cst/identifier") {
{
let name = $target[0];
{
let l = $target[1];
return /*6387*//*6387*//*6388*/$co/*<6388*/(/*6387*//*6389*/name/*<6389*/)/*<6387*/(/*6387*//*6390*/l/*<6390*/)/*<6387*/
}
}
}
return /*6392*//*6393*/fatal/*<6393*/(/*6392*//*6394*/"typealias type argument must be identifier"/*<6394*/)/*<6392*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 6380');})(/*!*//*6382*/x/*<6382*/)/*<6380*/ }/*<6373*/)/*<6370*/;
{
let args = $target;
return /*6396*//*6396*//*6396*//*6396*//*6396*//*6397*/stypealias/*<6397*/(/*6396*//*6398*/name/*<6398*/)/*<6396*/(/*6396*//*6399*/nl/*<6399*/)/*<6396*/(/*6396*//*6400*/args/*<6400*/)/*<6396*/(/*6396*//*6401*//*6403*/parse_type/*<6403*/(/*6401*//*6404*/body/*<6404*/)/*<6401*/)/*<6396*/(/*6396*//*6405*/l/*<6405*/)/*<6396*/
};
throw new Error('let pattern not matched 6369. ' + valueToString($target));})(/*!*/)/*<6344*/
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
{
let l = $target[1];
return /*6133*//*6134*/fatal/*<6134*/(/*6133*//*6135*/`Invalid 'deftype' ${/*6137*//*6138*/int_to_string/*<6138*/(/*6137*//*6139*/l/*<6139*/)/*<6137*/}`/*<6135*/)/*<6133*/
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
if ($target[0][0][0] === "fn"){
{
let l = $target[1];
return /*6060*//*6070*/fatal/*<6070*/(/*6060*//*6071*/`Invalid 'fn' ${/*6073*//*6075*/int_to_string/*<6075*/(/*6073*//*6076*/l/*<6076*/)/*<6073*/}`/*<6071*/)/*<6060*/
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
if ($target[0][0].type === "cst/identifier") {
if ($target[0][0][0] === "let->"){
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
return /*6142*//*6142*//*6142*//*6156*/foldr/*<6156*/(/*6142*//*6157*//*6158*/parse_expr/*<6158*/(/*6157*//*6159*/body/*<6159*/)/*<6157*/)/*<6142*/(/*6142*//*6160*//*6161*/pairs/*<6161*/(/*6160*//*6162*/inits/*<6162*/)/*<6160*/)/*<6142*/(/*6142*//*6163*/function name_6163(body) { return /*6163*/function name_6163(init) { return /*6168*/(function let_6168() {const $target = /*6175*/init/*<6175*/;
if ($target.type === ",") {
{
let pat = $target[0];
{
let value = $target[1];
return /*6176*//*6176*//*6176*//*6178*/eapp/*<6178*/(/*6176*//*6179*//*6180*/parse_expr/*<6180*/(/*6179*//*6181*/value/*<6181*/)/*<6179*/)/*<6176*/(/*6176*//*6182*//*6182*//*6182*//*6182*//*6183*/elambda/*<6183*/(/*6182*//*6184*/"\$let"/*<6184*/)/*<6182*/(/*6182*//*6186*/-1/*<6186*/)/*<6182*/(/*6182*//*6187*//*6187*//*6187*//*6189*/ematch/*<6189*/(/*6187*//*6190*//*6190*//*6191*/evar/*<6191*/(/*6190*//*6192*/"\$let"/*<6192*/)/*<6190*/(/*6190*//*6194*/-1/*<6194*/)/*<6190*/)/*<6187*/(/*6187*//*6195*//*6195*//*6195*/cons/*<6195*/(/*6195*//*6196*//*6196*//*6197*/$co/*<6197*/(/*6196*//*6198*//*6199*/parse_pat/*<6199*/(/*6198*//*6200*/pat/*<6200*/)/*<6198*/)/*<6196*/(/*6196*//*6201*/body/*<6201*/)/*<6196*/)/*<6195*/(/*6195*//*6195*/nil/*<6195*/)/*<6195*/)/*<6187*/(/*6187*//*6202*/l/*<6202*/)/*<6187*/)/*<6182*/(/*6182*//*6204*/l/*<6204*/)/*<6182*/)/*<6176*/(/*6176*//*6203*/l/*<6203*/)/*<6176*/
}
}
};
throw new Error('let pattern not matched 6171. ' + valueToString($target));})(/*!*/)/*<6168*/ }/*<6163*/ }/*<6163*/)/*<6142*/
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
if ($target[0][0][0] === "let"){
{
let l = $target[1];
return /*6046*//*6047*/fatal/*<6047*/(/*6046*//*6048*/`Invalid 'let' ${/*6052*//*6050*/int_to_string/*<6050*/(/*6052*//*6054*/l/*<6054*/)/*<6052*/}`/*<6048*/)/*<6046*/
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

const run = /*4208*/function name_4208(v) { return /*4215*//*4217*/eval/*<4217*/(/*4215*//*4218*//*4218*//*4219*/compile/*<4219*/(/*4218*//*4220*//*4221*/parse_expr/*<4221*/(/*4220*//*4222*/v/*<4222*/)/*<4220*/)/*<4218*/(/*4218*//*4676*/map$slnil/*<4676*/)/*<4218*/)/*<4215*/ }/*<4208*/;

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
if ($target.type === "stypealias") {
{
let name = $target[0];
return /*6444*/`/* type alias ${/*6447*/name/*<6447*/} */`/*<6444*/
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

return /*6451*//*6453*//*6452*/eval/*<6452*/(/*6453*//*6454*/"({0: parse_stmt,  1: parse_expr, 2: compile_stmt, 3: compile, 4: names, 5: externals_stmt}) => ({type: 'fns', parse_stmt, parse_expr, compile_stmt, compile, names, externals_stmt})"/*<6454*/)/*<6453*/(/*6451*//*5763*//*5763*//*5763*//*5763*//*5763*//*5763*//*5765*/parse_and_compile/*<5765*/(/*5763*//*5766*/parse_stmt/*<5766*/)/*<5763*/(/*5763*//*5767*/parse_expr/*<5767*/)/*<5763*/(/*5763*//*5768*/compile_stmt/*<5768*/)/*<5763*/(/*5763*//*5770*/compile/*<5770*/)/*<5763*/(/*5763*//*6487*/names/*<6487*/)/*<5763*/(/*5763*//*6488*/externals_stmt/*<6488*/)/*<5763*/)/*<6451*/