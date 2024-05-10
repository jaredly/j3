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
const dot = /*7091*/function name_7091(a) { return function name_7091(b) { return function name_7091(c) { return /*7098*//*7099*/a/*<7099*//*7098*/(/*7100*//*7101*/b/*<7101*//*7100*/(/*7102*/c/*<7102*/)/*<7100*/)/*<7098*/ } } }/*<7091*/;

const orr = /*8006*/function name_8006($default) { return function name_8006(v) { return /*8013*/(function match_8013($target) {
if ($target.type === "some") {
{
let v = $target[0];
return /*8019*/v/*<8019*/
}
}
return /*8021*/$default/*<8021*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 8013');})(/*!*//*8015*/v/*<8015*/)/*<8013*/ } }/*<8006*/;

const just_trace = /*8259*/function name_8259(loc) { return function name_8259(trace) { return function name_8259(value) { return /*8267*/(function match_8267($target) {
if ($target.type === "none") {
return /*8275*/""/*<8275*/
}
if ($target.type === "some") {
{
let info = $target[0];
return /*8281*/`\$trace(${/*8285*//*8287*/its/*<8287*//*8285*/(/*8288*/loc/*<8288*/)/*<8285*/}, ${/*8289*//*8291*/jsonify/*<8291*//*8289*/(/*8292*/info/*<8292*/)/*<8289*/}, ${/*8293*/value/*<8293*/});`/*<8281*/
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 8267');})(/*!*//*8269*//*8270*/map$slget/*<8270*//*8269*/(/*8271*/trace/*<8271*/)(/*8272*/loc/*<8272*/)/*<8269*/)/*<8267*/ } } }/*<8259*/;

const nil = ({type: "nil"});
const cons = (v0) => (v1) => ({type: "cons", 0: v0, 1: v1});
const pany = (v0) => ({type: "pany", 0: v0});
const pvar = (v0) => (v1) => ({type: "pvar", 0: v0, 1: v1});
const pcon = (v0) => (v1) => (v2) => ({type: "pcon", 0: v0, 1: v1, 2: v2});
const pstr = (v0) => (v1) => ({type: "pstr", 0: v0, 1: v1});
const pprim = (v0) => (v1) => ({type: "pprim", 0: v0, 1: v1});
const tvar = (v0) => (v1) => ({type: "tvar", 0: v0, 1: v1});
const tapp = (v0) => (v1) => (v2) => ({type: "tapp", 0: v0, 1: v1, 2: v2});
const tcon = (v0) => (v1) => ({type: "tcon", 0: v0, 1: v1});
const cst$sllist = (v0) => (v1) => ({type: "cst/list", 0: v0, 1: v1});
const cst$slarray = (v0) => (v1) => ({type: "cst/array", 0: v0, 1: v1});
const cst$slspread = (v0) => (v1) => ({type: "cst/spread", 0: v0, 1: v1});
const cst$slidentifier = (v0) => (v1) => ({type: "cst/identifier", 0: v0, 1: v1});
const cst$slstring = (v0) => (v1) => (v2) => ({type: "cst/string", 0: v0, 1: v1, 2: v2});
const one = (v0) => ({type: "one", 0: v0});
const many = (v0) => ({type: "many", 0: v0});
const empty = ({type: "empty"});
const join = /*132*/function name_132(sep) { return function name_132(items) { return /*139*/(function match_139($target) {
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
return /*7399*/`${/*7401*/one/*<7401*/}${/*7403*/sep/*<7403*/}${/*7405*//*7407*/join/*<7407*//*7405*/(/*7409*/sep/*<7409*/)(/*7410*/rest/*<7410*/)/*<7405*/}`/*<7399*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 151');})(/*!*//*153*/rest/*<153*/)/*<151*/
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 139');})(/*!*//*141*/items/*<141*/)/*<139*/ } }/*<132*/;

const mapi = /*221*/function name_221(i) { return function name_221(values) { return function name_221(f) { return /*229*/(function match_229($target) {
if ($target.type === "nil") {
return /*233*/nil/*<233*/
}
if ($target.type === "cons") {
{
let one = $target[0];
{
let rest = $target[1];
return /*240*//*240*/cons/*<240*//*240*/(/*241*//*242*/f/*<242*//*241*/(/*243*/i/*<243*/)(/*244*/one/*<244*/)/*<241*/)(/*245*//*249*/mapi/*<249*//*245*/(/*250*//*251*/$pl/*<251*//*250*/(/*252*/1/*<252*/)(/*253*/i/*<253*/)/*<250*/)(/*254*/rest/*<254*/)(/*255*/f/*<255*/)/*<245*/)/*<240*/
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 229');})(/*!*//*231*/values/*<231*/)/*<229*/ } } }/*<221*/;

const tapps = /*898*/function name_898(items) { return function name_898(l) { return /*904*/(function match_904($target) {
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
return /*918*//*919*/tapp/*<919*//*918*/(/*921*//*922*/tapps/*<922*//*921*/(/*923*/rest/*<923*/)(/*4001*/l/*<4001*/)/*<921*/)(/*5374*/one/*<5374*/)(/*4000*/l/*<4000*/)/*<918*/
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 904');})(/*!*//*906*/items/*<906*/)/*<904*/ } }/*<898*/;

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
return /*1700*//*1700*/cons/*<1700*//*1700*/(/*1701*//*1702*/$co/*<1702*//*1701*/(/*1703*/one/*<1703*/)(/*1705*/two/*<1705*/)/*<1701*/)(/*1706*//*1710*/pairs/*<1710*//*1706*/(/*1711*/rest/*<1711*/)/*<1706*/)/*<1700*/
}
}
}
}
}
return /*3151*//*3152*/fatal/*<3152*//*3151*/(/*3153*/`Pairs given odd number ${/*3155*//*3157*/valueToString/*<3157*//*3155*/(/*3158*/list/*<3158*/)/*<3155*/}`/*<3153*/)/*<3151*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 1690');})(/*!*//*1692*/list/*<1692*/)/*<1690*/ }/*<1684*/;

const replaces = /*2094*/function name_2094(target) { return function name_2094(repl) { return /*2101*/(function match_2101($target) {
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
return /*2119*//*2120*/replaces/*<2120*//*2119*/(/*2121*//*2122*/replace_all/*<2122*//*2121*/(/*2123*/target/*<2123*/)(/*2124*/find/*<2124*/)(/*2125*/nw/*<2125*/)/*<2121*/)(/*2126*/rest/*<2126*/)/*<2119*/
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 2112');})(/*!*//*2114*/one/*<2114*/)/*<2112*/
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 2101');})(/*!*//*2103*/repl/*<2103*/)/*<2101*/ } }/*<2094*/;

const escape_string = /*2127*/function name_2127(string) { return /*2133*//*2134*/replaces/*<2134*//*2133*/(/*2135*/string/*<2135*/)(/*2136*//*2136*/cons/*<2136*//*2136*/(/*2137*//*2720*/$co/*<2720*//*2137*/(/*2721*/"\\"/*<2721*/)(/*2723*/"\\\\"/*<2723*/)/*<2137*/)(/*2136*//*2136*/cons/*<2136*//*2136*/(/*2725*//*2726*/$co/*<2726*//*2725*/(/*2727*/"\n"/*<2727*/)(/*2729*/"\\n"/*<2729*/)/*<2725*/)(/*2136*//*2136*/cons/*<2136*//*2136*/(/*2731*//*2732*/$co/*<2732*//*2731*/(/*2733*/"\""/*<2733*/)(/*2735*/"\\\""/*<2735*/)/*<2731*/)(/*2136*//*2136*/cons/*<2136*//*2136*/(/*2155*//*2156*/$co/*<2156*//*2155*/(/*2157*/"\`"/*<2157*/)(/*2159*/"\\\`"/*<2159*/)/*<2155*/)(/*2136*//*2136*/cons/*<2136*//*2136*/(/*2161*//*2162*/$co/*<2162*//*2161*/(/*2163*/"\$"/*<2163*/)(/*2165*/"\\\$"/*<2165*/)/*<2161*/)(/*2136*/nil/*<2136*/)/*<2136*/)/*<2136*/)/*<2136*/)/*<2136*/)/*<2136*/)/*<2133*/ }/*<2127*/;

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

const trace_wrap = /*4689*/function name_4689(loc) { return function name_4689(trace) { return function name_4689(js) { return /*4699*/(function match_4699($target) {
if ($target.type === "none") {
return /*4784*/js/*<4784*/
}
if ($target.type === "some") {
{
let info = $target[0];
return /*4788*/`\$trace(${/*5949*//*4800*/its/*<4800*//*5949*/(/*5950*/loc/*<5950*/)/*<5949*/}, ${/*4802*//*4804*/jsonify/*<4804*//*4802*/(/*4805*/info/*<4805*/)/*<4802*/}, ${/*4795*/js/*<4795*/})`/*<4788*/
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 4699');})(/*!*//*4778*//*4779*/map$slget/*<4779*//*4778*/(/*4780*/trace/*<4780*/)(/*4781*/loc/*<4781*/)/*<4778*/)/*<4699*/ } } }/*<4689*/;

const trace_and = /*4741*/function name_4741(loc) { return function name_4741(trace) { return function name_4741(value) { return function name_4741(js) { return /*4750*/(function match_4750($target) {
if ($target.type === "none") {
return /*4820*/js/*<4820*/
}
if ($target.type === "some") {
{
let info = $target[0];
return /*4824*/`(\$trace(${/*5942*//*4826*/its/*<4826*//*5942*/(/*5943*/loc/*<5943*/)/*<5942*/}, ${/*4828*//*4830*/jsonify/*<4830*//*4828*/(/*4831*/info/*<4831*/)/*<4828*/}, ${/*4832*/value/*<4832*/}), ${/*4834*/js/*<4834*/})`/*<4824*/
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 4750');})(/*!*//*4814*//*4815*/map$slget/*<4815*//*4814*/(/*4816*/trace/*<4816*/)(/*4817*/loc/*<4817*/)/*<4814*/)/*<4750*/ } } } }/*<4741*/;

const trace_and_block = /*4850*/function name_4850(loc) { return function name_4850(trace) { return function name_4850(value) { return function name_4850(js) { return /*4859*/(function match_4859($target) {
if ($target.type === "none") {
return /*4867*/js/*<4867*/
}
if ($target.type === "some") {
{
let info = $target[0];
return /*4871*/`\$trace(${/*5951*//*4873*/its/*<4873*//*5951*/(/*5952*/loc/*<5952*/)/*<5951*/}, ${/*4875*//*4877*/jsonify/*<4877*//*4875*/(/*4878*/info/*<4878*/)/*<4875*/}, ${/*4879*/value/*<4879*/});\n${/*4881*/js/*<4881*/}`/*<4871*/
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 4859');})(/*!*//*4861*//*4862*/map$slget/*<4862*//*4861*/(/*4863*/trace/*<4863*/)(/*4864*/loc/*<4864*/)/*<4861*/)/*<4859*/ } } } }/*<4850*/;

const source_map = /*4890*/function name_4890(loc) { return function name_4890(js) { return /*4897*/`/*${/*5953*//*4899*/its/*<4899*//*5953*/(/*5954*/loc/*<5954*/)/*<5953*/}*/${/*4901*/js/*<4901*/}/*<${/*5955*//*4903*/its/*<4903*//*5955*/(/*5956*/loc/*<5956*/)/*<5955*/}*/`/*<4897*/ } }/*<4890*/;

const rev = /*5377*/function name_5377(arr) { return function name_5377(col) { return /*5384*/(function match_5384($target) {
if ($target.type === "nil") {
return /*5388*/col/*<5388*/
}
if ($target.type === "cons") {
{
let one = $target[0];
if ($target[1].type === "nil") {
return /*5391*//*5391*/cons/*<5391*//*5391*/(/*5392*/one/*<5392*/)(/*5393*/col/*<5393*/)/*<5391*/
}
}
}
if ($target.type === "cons") {
{
let one = $target[0];
{
let rest = $target[1];
return /*5403*//*5404*/rev/*<5404*//*5403*/(/*5405*/rest/*<5405*/)(/*5406*//*5406*/cons/*<5406*//*5406*/(/*5407*/one/*<5407*/)(/*5408*/col/*<5408*/)/*<5406*/)/*<5403*/
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 5384');})(/*!*//*5386*/arr/*<5386*/)/*<5384*/ } }/*<5377*/;

const foldl = /*5855*/function name_5855(init) { return function name_5855(items) { return function name_5855(f) { return /*5863*/(function match_5863($target) {
if ($target.type === "nil") {
return /*5867*/init/*<5867*/
}
if ($target.type === "cons") {
{
let one = $target[0];
{
let rest = $target[1];
return /*5874*//*5875*/foldl/*<5875*//*5874*/(/*5876*//*5877*/f/*<5877*//*5876*/(/*5878*/init/*<5878*/)(/*5879*/one/*<5879*/)/*<5876*/)(/*5880*/rest/*<5880*/)(/*5881*/f/*<5881*/)/*<5874*/
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 5863');})(/*!*//*5865*/items/*<5865*/)/*<5863*/ } } }/*<5855*/;

const map = /*5882*/function name_5882(values) { return function name_5882(f) { return /*5889*/(function match_5889($target) {
if ($target.type === "nil") {
return /*5893*/nil/*<5893*/
}
if ($target.type === "cons") {
{
let one = $target[0];
{
let rest = $target[1];
return /*5900*//*5900*/cons/*<5900*//*5900*/(/*5901*//*5902*/f/*<5902*//*5901*/(/*5903*/one/*<5903*/)/*<5901*/)(/*5904*//*5908*/map/*<5908*//*5904*/(/*5909*/rest/*<5909*/)(/*5910*/f/*<5910*/)/*<5904*/)/*<5900*/
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 5889');})(/*!*//*5891*/values/*<5891*/)/*<5889*/ } }/*<5882*/;

const foldr = /*5912*/function name_5912(init) { return function name_5912(items) { return function name_5912(f) { return /*5920*/(function match_5920($target) {
if ($target.type === "nil") {
return /*5924*/init/*<5924*/
}
if ($target.type === "cons") {
{
let one = $target[0];
{
let rest = $target[1];
return /*5931*//*5932*/f/*<5932*//*5931*/(/*5933*//*5934*/foldr/*<5934*//*5933*/(/*5935*/init/*<5935*/)(/*5936*/rest/*<5936*/)(/*5937*/f/*<5937*/)/*<5933*/)(/*5938*/one/*<5938*/)/*<5931*/
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 5920');})(/*!*//*5922*/items/*<5922*/)/*<5920*/ } } }/*<5912*/;

const bag$sland = /*6567*/function name_6567(first) { return function name_6567(second) { return /*6573*/(function match_6573($target) {
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
return /*6600*//*6601*/many/*<6601*//*6600*/(/*6602*//*6602*/cons/*<6602*//*6602*/(/*6603*/a/*<6603*/)(/*6605*/b/*<6605*/)/*<6602*/)/*<6600*/
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
return /*6612*//*6613*/many/*<6613*//*6612*/(/*6614*//*6614*/cons/*<6614*//*6614*/(/*6615*/a/*<6615*/)(/*6617*/b/*<6617*/)/*<6614*/)/*<6612*/
}
}
}
}
return /*6619*//*6620*/many/*<6620*//*6619*/(/*6621*//*6621*/cons/*<6621*//*6621*/(/*6622*/first/*<6622*/)(/*6621*//*6621*/cons/*<6621*//*6621*/(/*6623*/second/*<6623*/)(/*6621*/nil/*<6621*/)/*<6621*/)/*<6621*/)/*<6619*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 6573');})(/*!*//*6575*//*6576*/$co/*<6576*//*6575*/(/*6577*/first/*<6577*/)(/*6578*/second/*<6578*/)/*<6575*/)/*<6573*/ } }/*<6567*/;

const bag$slfold = /*6624*/function name_6624(f) { return function name_6624(init) { return function name_6624(bag) { return /*6631*/(function match_6631($target) {
if ($target.type === "empty") {
return /*6636*/init/*<6636*/
}
if ($target.type === "one") {
{
let v = $target[0];
return /*6640*//*6641*/f/*<6641*//*6640*/(/*6642*/init/*<6642*/)(/*6643*/v/*<6643*/)/*<6640*/
}
}
if ($target.type === "many") {
{
let items = $target[0];
return /*6647*//*6648*/foldr/*<6648*//*6647*/(/*6649*/init/*<6649*/)(/*6650*/items/*<6650*/)(/*6651*//*6652*/bag$slfold/*<6652*//*6651*/(/*6653*/f/*<6653*/)/*<6651*/)/*<6647*/
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 6631');})(/*!*//*6633*/bag/*<6633*/)/*<6631*/ } } }/*<6624*/;

const bag$slto_list = /*6682*/function name_6682(bag) { return /*6687*//*7334*/bag$slfold/*<7334*//*6687*/(/*7335*/function name_7335(list) { return function name_7335(one) { return /*7340*//*7340*/cons/*<7340*//*7340*/(/*7341*/one/*<7341*/)(/*7342*/list/*<7342*/)/*<7340*/ } }/*<7335*/)(/*7352*/nil/*<7352*/)(/*7351*/bag/*<7351*/)/*<6687*/ }/*<6682*/;

const pat_names = /*6757*/function name_6757(pat) { return /*6762*/(function match_6762($target) {
if ($target.type === "pany") {
return /*6768*/set$slnil/*<6768*/
}
if ($target.type === "pvar") {
{
let name = $target[0];
{
let l = $target[1];
return /*6773*//*6774*/set$sladd/*<6774*//*6773*/(/*6775*/set$slnil/*<6775*/)(/*6776*/name/*<6776*/)/*<6773*/
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
return /*6782*//*6783*/foldl/*<6783*//*6782*/(/*6784*/set$slnil/*<6784*/)(/*6785*/args/*<6785*/)(/*6786*/function name_6786(bound) { return function name_6786(arg) { return /*6791*//*6792*/set$slmerge/*<6792*//*6791*/(/*6793*/bound/*<6793*/)(/*6794*//*6795*/pat_names/*<6795*//*6794*/(/*6796*/arg/*<6796*/)/*<6794*/)/*<6791*/ } }/*<6786*/)/*<6782*/
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
return /*6821*//*6822*/bag$sland/*<6822*//*6821*/(/*6823*//*6824*/one/*<6824*//*6823*/(/*6825*//*6826*/$co$co/*<6826*//*6825*/(/*6827*/name/*<6827*/)(/*6828*//*6829*/value/*<6829*//*6828*//*<6828*/)(/*6830*/l/*<6830*/)/*<6825*/)/*<6823*/)(/*6831*//*6832*/many/*<6832*//*6831*/(/*6833*//*6834*/map/*<6834*//*6833*/(/*6835*/args/*<6835*/)(/*6836*/pat_externals/*<6836*/)/*<6833*/)/*<6831*/)/*<6821*/
}
}
}
}
return /*6838*/empty/*<6838*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 6812');})(/*!*//*6814*/pat/*<6814*/)/*<6812*/ }/*<6807*/;

const externals_type = /*7103*/function name_7103(bound) { return function name_7103(t) { return /*7109*/(function match_7109($target) {
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
return /*7128*//*7129*/one/*<7129*//*7128*/(/*7130*//*7131*/$co$co/*<7131*//*7130*/(/*7132*/name/*<7132*/)(/*7133*//*7134*/type/*<7134*//*7133*//*<7133*/)(/*7135*/l/*<7135*/)/*<7130*/)/*<7128*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 7121');})(/*!*//*7123*//*7124*/set$slhas/*<7124*//*7123*/(/*7125*/bound/*<7125*/)(/*7126*/name/*<7126*/)/*<7123*/)/*<7121*/
}
}
}
if ($target.type === "tapp") {
{
let one = $target[0];
{
let two = $target[1];
return /*7141*//*7142*/bag$sland/*<7142*//*7141*/(/*7143*//*7144*/externals_type/*<7144*//*7143*/(/*7145*/bound/*<7145*/)(/*7146*/one/*<7146*/)/*<7143*/)(/*7147*//*7148*/externals_type/*<7148*//*7147*/(/*7149*/bound/*<7149*/)(/*7150*/two/*<7150*/)/*<7147*/)/*<7141*/
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 7109');})(/*!*//*7111*/t/*<7111*/)/*<7109*/ } }/*<7103*/;

const just_pat = /*7888*/function name_7888(pat) { return /*7895*/(function match_7895($target) {
if ($target.type === "pany") {
return /*7901*//*7902*/none/*<7902*//*7901*//*<7901*/
}
if ($target.type === "pvar") {
{
let name = $target[0];
{
let l = $target[1];
return /*7907*//*7908*/some/*<7908*//*7907*/(/*7909*//*7910*/sanitize/*<7910*//*7909*/(/*7911*/name/*<7911*/)/*<7909*/)/*<7907*/
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
return /*7917*/(function match_7917($target) {
if ($target.type === ",") {
if ($target[1].type === "nil") {
return /*7972*/none/*<7972*/
}
}
if ($target.type === ",") {
{
let items = $target[1];
return /*7977*//*7978*/some/*<7978*//*7977*/(/*7979*/`{${/*7981*//*7982*/join/*<7982*//*7981*/(/*7983*/", "/*<7983*/)(/*7985*//*7986*/rev/*<7986*//*7985*/(/*7987*/items/*<7987*/)(/*7988*/nil/*<7988*/)/*<7985*/)/*<7981*/}}`/*<7979*/)/*<7977*/
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 7917');})(/*!*//*7919*//*7920*/foldl/*<7920*//*7919*/(/*7921*//*7922*/$co/*<7922*//*7921*/(/*7923*/0/*<7923*/)(/*7924*/nil/*<7924*/)/*<7921*/)(/*7925*/args/*<7925*/)(/*7926*/function name_7926(result) { return function name_7926(arg) { return /*9174*/(function let_9174() {const $target = /*9182*/result/*<9182*/;
if ($target.type === ",") {
{
let i = $target[0];
{
let res = $target[1];
return /*7934*/(function match_7934($target) {
if ($target.type === "none") {
return /*7941*//*7942*/$co/*<7942*//*7941*/(/*7943*//*7944*/$pl/*<7944*//*7943*/(/*7945*/i/*<7945*/)(/*7946*/1/*<7946*/)/*<7943*/)(/*7947*/res/*<7947*/)/*<7941*/
}
if ($target.type === "some") {
{
let what = $target[0];
return /*7951*//*7952*/$co/*<7952*//*7951*/(/*7953*//*7954*/$pl/*<7954*//*7953*/(/*7955*/i/*<7955*/)(/*7956*/1/*<7956*/)/*<7953*/)(/*7957*//*7957*/cons/*<7957*//*7957*/(/*7958*/`${/*7960*//*7961*/its/*<7961*//*7960*/(/*7962*/i/*<7962*/)/*<7960*/}: ${/*7964*/what/*<7964*/}`/*<7958*/)(/*7967*/res/*<7967*/)/*<7957*/)/*<7951*/
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 7934');})(/*!*//*7936*//*7937*/just_pat/*<7937*//*7936*/(/*7938*/arg/*<7938*/)/*<7936*/)/*<7934*/
}
}
};
throw new Error('let pattern not matched 9177. ' + valueToString($target));})(/*!*/)/*<9174*/ } }/*<7926*/)/*<7919*/)/*<7917*/
}
}
}
}
if ($target.type === "pstr") {
return /*7994*//*7995*/fatal/*<7995*//*7994*/(/*7996*/"Cant use string as a pattern in this location"/*<7996*/)/*<7994*/
}
if ($target.type === "pprim") {
return /*8002*//*8003*/fatal/*<8003*//*8002*/(/*8004*/"Cant use primitive as a pattern in this location"/*<8004*/)/*<8002*/
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 7895');})(/*!*//*7897*/pat/*<7897*/)/*<7895*/ }/*<7888*/;

const pat_names_loc = /*8184*/function name_8184(pat) { return /*8191*/(function match_8191($target) {
if ($target.type === "pany") {
return /*8197*/empty/*<8197*/
}
if ($target.type === "pvar") {
{
let name = $target[0];
{
let l = $target[1];
return /*8240*//*8241*/one/*<8241*//*8240*/(/*8236*//*8237*/$co/*<8237*//*8236*/(/*8238*/name/*<8238*/)(/*8239*/l/*<8239*/)/*<8236*/)/*<8240*/
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
return /*8211*//*8212*/foldl/*<8212*//*8211*/(/*8213*/empty/*<8213*/)(/*8214*/args/*<8214*/)(/*8215*/function name_8215(bound) { return function name_8215(arg) { return /*8220*//*8221*/bag$sland/*<8221*//*8220*/(/*8222*/bound/*<8222*/)(/*8223*//*8224*/pat_names_loc/*<8224*//*8223*/(/*8225*/arg/*<8225*/)/*<8223*/)/*<8220*/ } }/*<8215*/)/*<8211*/
}
}
}
}
if ($target.type === "pstr") {
{
let string = $target[0];
{
let int = $target[1];
return /*8230*/empty/*<8230*/
}
}
}
if ($target.type === "pprim") {
{
let prim = $target[0];
{
let int = $target[1];
return /*8235*/empty/*<8235*/
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 8191');})(/*!*//*8193*/pat/*<8193*/)/*<8191*/ }/*<8184*/;

const eprim = (v0) => (v1) => ({type: "eprim", 0: v0, 1: v1});
const estr = (v0) => (v1) => (v2) => ({type: "estr", 0: v0, 1: v1, 2: v2});
const evar = (v0) => (v1) => ({type: "evar", 0: v0, 1: v1});
const equot = (v0) => (v1) => ({type: "equot", 0: v0, 1: v1});
const elambda = (v0) => (v1) => (v2) => ({type: "elambda", 0: v0, 1: v1, 2: v2});
const eapp = (v0) => (v1) => (v2) => ({type: "eapp", 0: v0, 1: v1, 2: v2});
const elet = (v0) => (v1) => (v2) => ({type: "elet", 0: v0, 1: v1, 2: v2});
const ematch = (v0) => (v1) => (v2) => ({type: "ematch", 0: v0, 1: v1, 2: v2});

const quot$slexpr = (v0) => ({type: "quot/expr", 0: v0});
const quot$slstmt = (v0) => ({type: "quot/stmt", 0: v0});
const quot$sltype = (v0) => ({type: "quot/type", 0: v0});
const quot$slpat = (v0) => ({type: "quot/pat", 0: v0});
const quot$slquot = (v0) => ({type: "quot/quot", 0: v0});

const stypealias = (v0) => (v1) => (v2) => (v3) => (v4) => ({type: "stypealias", 0: v0, 1: v1, 2: v2, 3: v3, 4: v4});
const sdeftype = (v0) => (v1) => (v2) => (v3) => (v4) => ({type: "sdeftype", 0: v0, 1: v1, 2: v2, 3: v3, 4: v4});
const sdef = (v0) => (v1) => (v2) => (v3) => ({type: "sdef", 0: v0, 1: v1, 2: v2, 3: v3});
const sexpr = (v0) => (v1) => ({type: "sexpr", 0: v0, 1: v1});
const parse_pat = /*1721*/function name_1721(pat) { return /*1727*/(function match_1727($target) {
if ($target.type === "cst/identifier") {
if ($target[0] === "_"){
{
let l = $target[1];
return /*1747*//*1748*/pany/*<1748*//*1747*/(/*3641*/l/*<3641*/)/*<1747*/
}
}
}
if ($target.type === "cst/identifier") {
if ($target[0] === "true"){
{
let l = $target[1];
return /*4247*//*4248*/pprim/*<4248*//*4247*/(/*4249*//*4250*/pbool/*<4250*//*4249*/(/*4251*/true/*<4251*/)(/*4252*/l/*<4252*/)/*<4249*/)(/*4253*/l/*<4253*/)/*<4247*/
}
}
}
if ($target.type === "cst/identifier") {
if ($target[0] === "false"){
{
let l = $target[1];
return /*5847*//*5848*/pprim/*<5848*//*5847*/(/*5849*//*5850*/pbool/*<5850*//*5849*/(/*5851*/false/*<5851*/)(/*5852*/l/*<5852*/)/*<5849*/)(/*5853*/l/*<5853*/)/*<5847*/
}
}
}
if ($target.type === "cst/string") {
{
let first = $target[0];
if ($target[1].type === "nil") {
{
let l = $target[2];
return /*3285*//*3302*/pstr/*<3302*//*3285*/(/*3303*/first/*<3303*/)(/*3642*/l/*<3642*/)/*<3285*/
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
return /*3035*//*3036*/pprim/*<3036*//*3035*/(/*3037*//*3038*/pint/*<3038*//*3037*/(/*3039*/int/*<3039*/)(/*3643*/l/*<3643*/)/*<3037*/)(/*3644*/l/*<3644*/)/*<3035*/
}
}
return /*1737*//*1738*/pvar/*<1738*//*1737*/(/*1739*/id/*<1739*/)(/*3645*/l/*<3645*/)/*<1737*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 3019');})(/*!*//*3026*//*3027*/string_to_int/*<3027*//*3026*/(/*3031*/id/*<3031*/)/*<3026*/)/*<3019*/
}
}
}
if ($target.type === "cst/array") {
if ($target[0].type === "nil") {
{
let l = $target[1];
return /*3341*//*3348*/pcon/*<3348*//*3341*/(/*3349*/"nil"/*<3349*/)(/*3351*/nil/*<3351*/)(/*3646*/l/*<3646*/)/*<3341*/
}
}
}
if ($target.type === "cst/array") {
if ($target[0].type === "cons") {
if ($target[0][0].type === "cst/spread") {
{
let inner = $target[0][0][0];
if ($target[0][1].type === "nil") {
return /*3379*//*3387*/parse_pat/*<3387*//*3379*/(/*3388*/inner/*<3388*/)/*<3379*/
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
return /*3354*//*3362*/pcon/*<3362*//*3354*/(/*3363*/"cons"/*<3363*/)(/*3365*//*3365*/cons/*<3365*//*3365*/(/*3366*//*3367*/parse_pat/*<3367*//*3366*/(/*3368*/one/*<3368*/)/*<3366*/)(/*3365*//*3365*/cons/*<3365*//*3365*/(/*3369*//*3370*/parse_pat/*<3370*//*3369*/(/*3371*//*3372*/cst$slarray/*<3372*//*3371*/(/*3373*/rest/*<3373*/)(/*3374*/l/*<3374*/)/*<3371*/)/*<3369*/)(/*3365*/nil/*<3365*/)/*<3365*/)/*<3365*/)(/*4263*/l/*<4263*/)/*<3354*/
}
}
}
}
}
if ($target.type === "cst/list") {
if ($target[0].type === "nil") {
{
let l = $target[1];
return /*9168*//*9169*/pcon/*<9169*//*9168*/(/*9170*/"()"/*<9170*/)(/*9173*/nil/*<9173*/)(/*9172*/l/*<9172*/)/*<9168*/
}
}
}
if ($target.type === "cst/list") {
if ($target[0].type === "cons") {
if ($target[0][0].type === "cst/identifier") {
if ($target[0][0][0] === ","){
{
let il = $target[0][0][1];
{
let args = $target[0][1];
{
let l = $target[1];
return /*7772*//*7773*/parse_pat_tuple/*<7773*//*7772*/(/*7774*/args/*<7774*/)(/*7775*/il/*<7775*/)(/*7776*/l/*<7776*/)/*<7772*/
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
{
let name = $target[0][0][0];
{
let rest = $target[0][1];
{
let l = $target[1];
return /*1816*//*1817*/pcon/*<1817*//*1816*/(/*1818*/name/*<1818*/)(/*1819*//*1820*/map/*<1820*//*1819*/(/*1821*/rest/*<1821*/)(/*1822*/parse_pat/*<1822*/)/*<1819*/)(/*3647*/l/*<3647*/)/*<1816*/
}
}
}
}
}
}
return /*3160*//*3161*/fatal/*<3161*//*3160*/(/*3162*/`parse-pat mo match ${/*3164*//*3166*/valueToString/*<3166*//*3164*/(/*3167*/pat/*<3167*/)/*<3164*/}`/*<3162*/)/*<3160*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 1727');})(/*!*//*1730*/pat/*<1730*/)/*<1727*/ }/*<1721*/;


const parse_pat_tuple = /*7709*/function name_7709(items) { return function name_7709(il) { return function name_7709(l) { return /*7715*/(function match_7715($target) {
if ($target.type === "nil") {
return /*7722*//*7723*/pcon/*<7723*//*7722*/(/*7726*/","/*<7726*/)(/*7728*/nil/*<7728*/)(/*7729*/il/*<7729*/)/*<7722*/
}
if ($target.type === "cons") {
{
let one = $target[0];
if ($target[1].type === "nil") {
return /*7732*//*7733*/parse_pat/*<7733*//*7732*/(/*7734*/one/*<7734*/)/*<7732*/
}
}
}
if ($target.type === "cons") {
{
let one = $target[0];
{
let rest = $target[1];
return /*7742*//*7743*/pcon/*<7743*//*7742*/(/*7744*/","/*<7744*/)(/*7746*//*7746*/cons/*<7746*//*7746*/(/*7747*//*7748*/parse_pat/*<7748*//*7747*/(/*7749*/one/*<7749*/)/*<7747*/)(/*7746*//*7746*/cons/*<7746*//*7746*/(/*7750*//*7751*/parse_pat_tuple/*<7751*//*7750*/(/*7752*/rest/*<7752*/)(/*7753*/il/*<7753*/)(/*7754*/l/*<7754*/)/*<7750*/)(/*7746*/nil/*<7746*/)/*<7746*/)/*<7746*/)(/*7755*/l/*<7755*/)/*<7742*/
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 7715');})(/*!*//*7720*/items/*<7720*/)/*<7715*/ } } }/*<7709*/;

const pat_loop = /*2288*/function name_2288(target) { return function name_2288(args) { return function name_2288(i) { return function name_2288(inner) { return function name_2288(trace) { return /*2297*/(function match_2297($target) {
if ($target.type === "nil") {
return /*2301*/inner/*<2301*/
}
if ($target.type === "cons") {
{
let arg = $target[0];
{
let rest = $target[1];
return /*2308*//*2309*/compile_pat/*<2309*//*2308*/(/*2310*/arg/*<2310*/)(/*2311*/`${/*2395*/target/*<2395*/}[${/*5980*//*2397*/its/*<2397*//*5980*/(/*5981*/i/*<5981*/)/*<5980*/}]`/*<2311*/)(/*2313*//*2314*/pat_loop/*<2314*//*2313*/(/*2315*/target/*<2315*/)(/*2316*/rest/*<2316*/)(/*2317*//*2318*/$pl/*<2318*//*2317*/(/*2319*/i/*<2319*/)(/*2320*/1/*<2320*/)/*<2317*/)(/*2321*/inner/*<2321*/)(/*4847*/trace/*<4847*/)/*<2313*/)(/*4845*/trace/*<4845*/)/*<2308*/
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 2297');})(/*!*//*2299*/args/*<2299*/)/*<2297*/ } } } } }/*<2288*/;


const compile_pat = /*2322*/function name_2322(pat) { return function name_2322(target) { return function name_2322(inner) { return function name_2322(trace) { return /*4883*//*4884*/trace_and_block/*<4884*//*4883*/(/*4885*//*4886*/pat_loc/*<4886*//*4885*/(/*4887*/pat/*<4887*/)/*<4885*/)(/*4888*/trace/*<4888*/)(/*4889*/target/*<4889*/)(/*2330*/(function match_2330($target) {
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
return /*2345*/`if (${/*2399*/target/*<2399*/} === ${/*5978*//*2401*/its/*<2401*//*5978*/(/*5979*/int/*<5979*/)/*<5978*/}) {\n${/*2407*/inner/*<2407*/}\n}`/*<2345*/
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
return /*2360*/`{\nlet ${/*2417*//*2419*/sanitize/*<2419*//*2417*/(/*2420*/name/*<2420*/)/*<2417*/} = ${/*2421*/target/*<2421*/};\n${/*4836*/inner/*<4836*/}\n}`/*<2360*/
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
return /*2366*/`if (${/*2425*/target/*<2425*/}.type === \"${/*2427*/name/*<2427*/}\") {\n${/*2429*//*2431*/pat_loop/*<2431*//*2429*/(/*2432*/target/*<2432*/)(/*2433*/args/*<2433*/)(/*2434*/0/*<2434*/)(/*2435*/inner/*<2435*/)(/*4846*/trace/*<4846*/)/*<2429*/}\n}`/*<2366*/
}
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 2330');})(/*!*//*2332*/pat/*<2332*/)/*<2330*/)/*<4883*/ } } } }/*<2322*/;

const parse_type = /*692*/function name_692(type) { return /*867*/(function match_867($target) {
if ($target.type === "cst/identifier") {
{
let id = $target[0];
{
let l = $target[1];
return /*874*//*875*/tcon/*<875*//*874*/(/*876*/id/*<876*/)(/*3997*/l/*<3997*/)/*<874*/
}
}
}
if ($target.type === "cst/list") {
if ($target[0].type === "nil") {
{
let l = $target[1];
return /*5418*//*5419*/fatal/*<5419*//*5418*/(/*5420*/"(parse-type) with empty list"/*<5420*/)/*<5418*/
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
return /*5588*//*5589*/foldl/*<5589*//*5588*/(/*5590*//*5591*/parse_type/*<5591*//*5590*/(/*5592*/body/*<5592*/)/*<5590*/)(/*5691*//*5593*/rev/*<5593*//*5691*/(/*5692*/args/*<5692*/)(/*5693*/nil/*<5693*/)/*<5691*/)(/*5594*/function name_5594(body) { return function name_5594(arg) { return /*5600*//*5601*/tapp/*<5601*//*5600*/(/*5602*//*5603*/tapp/*<5603*//*5602*/(/*5604*//*5605*/tcon/*<5605*//*5604*/(/*5606*/"->"/*<5606*/)(/*5608*/-1/*<5608*/)/*<5604*/)(/*5609*//*5610*/parse_type/*<5610*//*5609*/(/*5611*/arg/*<5611*/)/*<5609*/)(/*5612*/-1/*<5612*/)/*<5602*/)(/*5613*/body/*<5613*/)(/*5614*/-1/*<5614*/)/*<5600*/ } }/*<5594*/)/*<5588*/
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
return /*881*//*924*/tapps/*<924*//*881*/(/*5375*//*5376*/rev/*<5376*//*5375*/(/*925*//*926*/map/*<926*//*925*/(/*927*/items/*<927*/)(/*928*/parse_type/*<928*/)/*<925*/)(/*5413*/nil/*<5413*/)/*<5375*/)(/*3998*/l/*<3998*/)/*<881*/
}
}
}
return /*3138*//*3139*/fatal/*<3139*//*3138*/(/*3140*/`(parse-type) Invalid type ${/*3142*//*3144*/valueToString/*<3144*//*3142*/(/*3145*/type/*<3145*/)/*<3142*/}`/*<3140*/)/*<3138*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 867');})(/*!*//*869*/type/*<869*/)/*<867*/ }/*<692*/;

const mk_deftype = /*1390*/function name_1390(id) { return function name_1390(li) { return function name_1390(args) { return function name_1390(items) { return function name_1390(l) { return /*1433*//*1434*/sdeftype/*<1434*//*1433*/(/*1435*/id/*<1435*/)(/*3980*/li/*<3980*/)(/*5017*//*5018*/map/*<5018*//*5017*/(/*5019*/args/*<5019*/)(/*5020*/function name_5020(arg) { return /*5024*/(function match_5024($target) {
if ($target.type === "cst/identifier") {
{
let name = $target[0];
{
let l = $target[1];
return /*5031*//*5032*/$co/*<5032*//*5031*/(/*5033*/name/*<5033*/)(/*5034*/l/*<5034*/)/*<5031*/
}
}
}
return /*5036*//*5037*/fatal/*<5037*//*5036*/(/*5038*/"deftype type argument must be identifier"/*<5038*/)/*<5036*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 5024');})(/*!*//*5026*/arg/*<5026*/)/*<5024*/ }/*<5020*/)/*<5017*/)(/*1436*//*1437*/foldr/*<1437*//*1436*/(/*6021*/nil/*<6021*/)(/*1438*/items/*<1438*/)(/*1439*/function name_1439(res) { return function name_1439(constr) { return /*1443*/(function match_1443($target) {
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
return /*6022*//*6022*/cons/*<6022*//*6022*/(/*1457*//*1458*/$co$co$co/*<1458*//*1457*/(/*1459*/name/*<1459*/)(/*3982*/ni/*<3982*/)(/*1460*//*1461*/map/*<1461*//*1460*/(/*1462*/args/*<1462*/)(/*1463*/parse_type/*<1463*/)/*<1460*/)(/*3984*/l/*<3984*/)/*<1457*/)(/*6023*/res/*<6023*/)/*<6022*/
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
return /*6028*//*6029*/fatal/*<6029*//*6028*/(/*6030*/"Invalid type constructor"/*<6030*/)/*<6028*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 1443');})(/*!*//*1445*/constr/*<1445*/)/*<1443*/ } }/*<1439*/)/*<1436*/)(/*3981*/l/*<3981*/)/*<1433*/ } } } } }/*<1390*/;

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
if ($target.type === "equot") {
{
let l = $target[1];
return /*4732*/l/*<4732*/
}
}
if ($target.type === "elambda") {
{
let l = $target[2];
return /*4739*/l/*<4739*/
}
}
if ($target.type === "elet") {
{
let l = $target[2];
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

const parse_and_compile = (v0) => (v1) => (v2) => (v3) => (v4) => (v5) => (v6) => ({type: "parse-and-compile", 0: v0, 1: v1, 2: v2, 3: v3, 4: v4, 5: v5, 6: v6});
const externals = /*6839*/function name_6839(bound) { return function name_6839(expr) { return /*6845*/(function match_6845($target) {
if ($target.type === "evar") {
{
let name = $target[0];
{
let l = $target[1];
return /*6852*/(function match_6852($target) {
if ($target === true) {
return /*6858*/empty/*<6858*/
}
return /*6859*//*6860*/one/*<6860*//*6859*/(/*6861*//*6862*/$co$co/*<6862*//*6861*/(/*6863*/name/*<6863*/)(/*6864*//*6865*/value/*<6865*//*6864*//*<6864*/)(/*6866*/l/*<6866*/)/*<6861*/)/*<6859*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 6852');})(/*!*//*6854*//*6855*/set$slhas/*<6855*//*6854*/(/*6856*/bound/*<6856*/)(/*6857*/name/*<6857*/)/*<6854*/)/*<6852*/
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
return /*6877*//*6878*/many/*<6878*//*6877*/(/*6879*//*6880*/map/*<6880*//*6879*/(/*6881*/templates/*<6881*/)(/*6882*/function name_6882(arg) { return /*7411*/(function match_7411($target) {
if ($target.type === ",,") {
{
let expr = $target[0];
return /*6890*//*6891*/externals/*<6891*//*6890*/(/*6892*/bound/*<6892*/)(/*6893*/expr/*<6893*/)/*<6890*/
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
if ($target.type === "elambda") {
{
let pats = $target[0];
{
let body = $target[1];
{
let int = $target[2];
return /*8034*//*8035*/bag$sland/*<8035*//*8034*/(/*9139*//*9140*/foldl/*<9140*//*9139*/(/*9141*/empty/*<9141*/)(/*8036*//*8037*/map/*<8037*//*8036*/(/*9142*/pats/*<9142*/)(/*9143*/pat_externals/*<9143*/)/*<8036*/)(/*9144*/bag$sland/*<9144*/)/*<9139*/)(/*6925*//*6926*/externals/*<6926*//*6925*/(/*6927*//*9135*/foldl/*<9135*//*6927*/(/*6929*/bound/*<6929*/)(/*6930*//*8039*/map/*<8039*//*6930*/(/*9136*/pats/*<9136*/)(/*9137*/pat_names/*<9137*/)/*<6930*/)(/*9138*/set$slmerge/*<9138*/)/*<6927*/)(/*6931*/body/*<6931*/)/*<6925*/)/*<8034*/
}
}
}
}
if ($target.type === "elet") {
{
let bindings = $target[0];
{
let body = $target[1];
{
let l = $target[2];
return /*6938*//*6939*/bag$sland/*<6939*//*6938*/(/*9096*//*9097*/foldl/*<9097*//*9096*/(/*9098*/empty/*<9098*/)(/*9099*//*9101*/map/*<9101*//*9099*/(/*9102*/bindings/*<9102*/)(/*9103*/function name_9103(arg) { return /*9201*/(function let_9201() {const $target = /*9208*/arg/*<9208*/;
if ($target.type === ",") {
{
let pat = $target[0];
{
let init = $target[1];
return /*9111*//*9112*/bag$sland/*<9112*//*9111*/(/*9113*//*9114*/pat_externals/*<9114*//*9113*/(/*9115*/pat/*<9115*/)/*<9113*/)(/*9116*//*9117*/externals/*<9117*//*9116*/(/*9118*/bound/*<9118*/)(/*9119*/init/*<9119*/)/*<9116*/)/*<9111*/
}
}
};
throw new Error('let pattern not matched 9204. ' + valueToString($target));})(/*!*/)/*<9201*/ }/*<9103*/)/*<9099*/)(/*9121*/bag$sland/*<9121*/)/*<9096*/)(/*6949*//*6950*/externals/*<6950*//*6949*/(/*6951*//*6952*/foldl/*<6952*//*6951*/(/*6953*/bound/*<6953*/)(/*9122*//*9123*/map/*<9123*//*9122*/(/*9124*/bindings/*<9124*/)(/*9125*/function name_9125(arg) { return /*9192*/(function let_9192() {const $target = /*9199*/arg/*<9199*/;
if ($target.type === ",") {
{
let pat = $target[0];
return /*6954*//*6955*/pat_names/*<6955*//*6954*/(/*6956*/pat/*<6956*/)/*<6954*/
}
};
throw new Error('let pattern not matched 9195. ' + valueToString($target));})(/*!*/)/*<9192*/ }/*<9125*/)/*<9122*/)(/*9133*/set$slmerge/*<9133*/)/*<6951*/)(/*6957*/body/*<6957*/)/*<6949*/)/*<6938*/
}
}
}
}
if ($target.type === "eapp") {
{
let target = $target[0];
{
let args = $target[1];
{
let int = $target[2];
return /*6963*//*6964*/bag$sland/*<6964*//*6963*/(/*6965*//*6966*/externals/*<6966*//*6965*/(/*6967*/bound/*<6967*/)(/*6968*/target/*<6968*/)/*<6965*/)(/*9087*//*9088*/foldl/*<9088*//*9087*/(/*9089*/empty/*<9089*/)(/*9092*//*9090*/map/*<9090*//*9092*/(/*9093*/args/*<9093*/)(/*6969*//*6970*/externals/*<6970*//*6969*/(/*6971*/bound/*<6971*/)/*<6969*/)/*<9092*/)(/*9094*/bag$sland/*<9094*/)/*<9087*/)/*<6963*/
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
return /*6978*//*6979*/bag$sland/*<6979*//*6978*/(/*6980*//*6981*/externals/*<6981*//*6980*/(/*6982*/bound/*<6982*/)(/*6983*/expr/*<6983*/)/*<6980*/)(/*6984*//*6985*/foldl/*<6985*//*6984*/(/*6986*/empty/*<6986*/)(/*6987*/cases/*<6987*/)(/*6988*/function name_6988(bag) { return function name_6988(arg) { return /*7421*/(function match_7421($target) {
if ($target.type === ",") {
{
let pat = $target[0];
{
let body = $target[1];
return /*6996*//*6997*/bag$sland/*<6997*//*6996*/(/*6998*//*6999*/bag$sland/*<6999*//*6998*/(/*7000*/bag/*<7000*/)(/*7001*//*7002*/pat_externals/*<7002*//*7001*/(/*7003*/pat/*<7003*/)/*<7001*/)/*<6998*/)(/*7004*//*7005*/externals/*<7005*//*7004*/(/*7006*//*7007*/set$slmerge/*<7007*//*7006*/(/*7008*/bound/*<7008*/)(/*7009*//*7010*/pat_names/*<7010*//*7009*/(/*7011*/pat/*<7011*/)/*<7009*/)/*<7006*/)(/*7012*/body/*<7012*/)/*<7004*/)/*<6996*/
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 7421');})(/*!*//*7423*/arg/*<7423*/)/*<7421*/ } }/*<6988*/)/*<6984*/)/*<6978*/
}
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 6845');})(/*!*//*6847*/expr/*<6847*/)/*<6845*/ } }/*<6839*/;

const names = /*7151*/function name_7151(stmt) { return /*7156*/(function match_7156($target) {
if ($target.type === "sdef") {
{
let name = $target[0];
{
let l = $target[1];
return /*7165*//*7165*/cons/*<7165*//*7165*/(/*7166*//*7167*/$co$co/*<7167*//*7166*/(/*7168*/name/*<7168*/)(/*7169*//*7170*/value/*<7170*//*7169*//*<7169*/)(/*7171*/l/*<7171*/)/*<7166*/)(/*7165*/nil/*<7165*/)/*<7165*/
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
return /*7184*//*7184*/cons/*<7184*//*7184*/(/*7185*//*7186*/$co$co/*<7186*//*7185*/(/*7187*/name/*<7187*/)(/*7188*//*7189*/type/*<7189*//*7188*//*<7188*/)(/*7190*/l/*<7190*/)/*<7185*/)(/*7184*/nil/*<7184*/)/*<7184*/
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
return /*7198*//*7198*/cons/*<7198*//*7198*/(/*7199*//*7200*/$co$co/*<7200*//*7199*/(/*7201*/name/*<7201*/)(/*7202*//*7203*/type/*<7203*//*7202*//*<7202*/)(/*7204*/l/*<7204*/)/*<7199*/)(/*7206*//*7207*/map/*<7207*//*7206*/(/*7208*/constructors/*<7208*/)(/*7209*/function name_7209(arg) { return /*7429*/(function match_7429($target) {
if ($target.type === ",,,") {
{
let name = $target[0];
{
let l = $target[1];
return /*7218*//*7219*/$co$co/*<7219*//*7218*/(/*7220*/name/*<7220*/)(/*7221*//*7222*/value/*<7222*//*7221*//*<7221*/)(/*7223*/l/*<7223*/)/*<7218*/
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 7429');})(/*!*//*7431*/arg/*<7431*/)/*<7429*/ }/*<7209*/)/*<7206*/)/*<7198*/
}
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 7156');})(/*!*//*7158*/stmt/*<7158*/)/*<7156*/ }/*<7151*/;

const externals_stmt = /*7224*/function name_7224(stmt) { return /*7229*//*7230*/bag$slto_list/*<7230*//*7229*/(/*7231*/(function match_7231($target) {
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
return /*7241*/(function let_7241() {const $target = /*7245*//*7246*/set$slfrom_list/*<7246*//*7245*/(/*7247*//*7248*/map/*<7248*//*7247*/(/*7249*/free/*<7249*/)(/*7250*/fst/*<7250*/)/*<7247*/)/*<7245*/;
{
let frees = $target;
return /*7251*//*7252*/many/*<7252*//*7251*/(/*7253*//*7254*/map/*<7254*//*7253*/(/*7255*/constructors/*<7255*/)(/*7256*/function name_7256(constructor) { return /*7440*/(function match_7440($target) {
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
return /*7271*//*7272*/many/*<7272*//*7271*/(/*7273*//*7274*/map/*<7274*//*7273*/(/*7275*/args/*<7275*/)(/*7276*//*7277*/externals_type/*<7277*//*7276*/(/*7278*/frees/*<7278*/)/*<7276*/)/*<7273*/)/*<7271*/
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
return /*7286*/(function let_7286() {const $target = /*7290*//*7291*/set$slfrom_list/*<7291*//*7290*/(/*7292*//*7293*/map/*<7293*//*7292*/(/*7294*/args/*<7294*/)(/*7295*/fst/*<7295*/)/*<7292*/)/*<7290*/;
{
let frees = $target;
return /*7296*//*7297*/externals_type/*<7297*//*7296*/(/*7298*/frees/*<7298*/)(/*7299*/body/*<7299*/)/*<7296*/
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
return /*7306*//*7307*/externals/*<7307*//*7306*/(/*7308*//*7309*/set$sladd/*<7309*//*7308*/(/*7310*/set$slnil/*<7310*/)(/*7311*/name/*<7311*/)/*<7308*/)(/*7312*/body/*<7312*/)/*<7306*/
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
return /*7317*//*7318*/externals/*<7318*//*7317*/(/*7319*/set$slnil/*<7319*/)(/*7320*/expr/*<7320*/)/*<7317*/
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 7231');})(/*!*//*7233*/stmt/*<7233*/)/*<7231*/)/*<7229*/ }/*<7224*/;

const quot$sljsonify = /*8933*/function name_8933(quot) { return /*8939*/(function match_8939($target) {
if ($target.type === "quot/expr") {
{
let expr = $target[0];
return /*8945*//*8946*/jsonify/*<8946*//*8945*/(/*8947*/expr/*<8947*/)/*<8945*/
}
}
if ($target.type === "quot/type") {
{
let type = $target[0];
return /*8952*//*8953*/jsonify/*<8953*//*8952*/(/*8954*/type/*<8954*/)/*<8952*/
}
}
if ($target.type === "quot/stmt") {
{
let stmt = $target[0];
return /*8958*//*8959*/jsonify/*<8959*//*8958*/(/*8960*/stmt/*<8960*/)/*<8958*/
}
}
if ($target.type === "quot/quot") {
{
let cst = $target[0];
return /*8964*//*8965*/jsonify/*<8965*//*8964*/(/*8966*/cst/*<8966*/)/*<8964*/
}
}
if ($target.type === "quot/pat") {
{
let pat = $target[0];
return /*8970*//*8971*/jsonify/*<8971*//*8970*/(/*8972*/pat/*<8972*/)/*<8970*/
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 8939');})(/*!*//*8941*/quot/*<8941*/)/*<8939*/ }/*<8933*/;

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
return /*789*//*948*/sdef/*<948*//*789*/(/*949*/id/*<949*/)(/*3940*/li/*<3940*/)(/*950*//*951*/parse_expr/*<951*//*950*/(/*952*/value/*<952*/)/*<950*/)(/*3941*/l/*<3941*/)/*<789*/
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
return /*2010*//*2025*/sdef/*<2025*//*2010*/(/*2026*/id/*<2026*/)(/*3955*/li/*<3955*/)(/*2027*//*2028*/parse_expr/*<2028*//*2027*/(/*2029*//*2030*/cst$sllist/*<2030*//*2029*/(/*2031*//*2031*/cons/*<2031*//*2031*/(/*2032*//*2033*/cst$slidentifier/*<2033*//*2032*/(/*2034*/"fn"/*<2034*/)(/*2036*/a/*<2036*/)/*<2032*/)(/*2031*//*2031*/cons/*<2031*//*2031*/(/*2037*//*2038*/cst$slarray/*<2038*//*2037*/(/*2039*/args/*<2039*/)(/*2041*/b/*<2041*/)/*<2037*/)(/*2031*//*2031*/cons/*<2031*//*2031*/(/*2042*/body/*<2042*/)(/*2031*/nil/*<2031*/)/*<2031*/)/*<2031*/)/*<2031*/)(/*2043*/c/*<2043*/)/*<2029*/)/*<2027*/)(/*3956*/c/*<3956*/)/*<2010*/
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
return /*6078*//*6092*/fatal/*<6092*//*6078*/(/*6093*/`Invalid 'defn' ${/*6095*//*6097*/int_to_string/*<6097*//*6095*/(/*6098*/l/*<6098*/)/*<6095*/}`/*<6093*/)/*<6078*/
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
return /*1365*//*1475*/mk_deftype/*<1475*//*1365*/(/*1476*/id/*<1476*/)(/*3976*/li/*<3976*/)(/*5014*/nil/*<5014*/)(/*1477*/items/*<1477*/)(/*3977*/l/*<3977*/)/*<1365*/
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
return /*812*//*1468*/mk_deftype/*<1468*//*812*/(/*1469*/id/*<1469*/)(/*3973*/li/*<3973*/)(/*5015*/args/*<5015*/)(/*1470*/items/*<1470*/)(/*3974*/l/*<3974*/)/*<812*/
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
return /*6277*//*6291*/stypealias/*<6291*//*6277*/(/*6292*/name/*<6292*/)(/*6293*/nl/*<6293*/)(/*6294*/nil/*<6294*/)(/*6295*//*6296*/parse_type/*<6296*//*6295*/(/*6297*/body/*<6297*/)/*<6295*/)(/*6299*/l/*<6299*/)/*<6277*/
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
return /*6344*/(function let_6344() {const $target = /*6370*//*6371*/map/*<6371*//*6370*/(/*6372*/args/*<6372*/)(/*6373*/function name_6373(x) { return /*6380*/(function match_6380($target) {
if ($target.type === "cst/identifier") {
{
let name = $target[0];
{
let l = $target[1];
return /*6387*//*6388*/$co/*<6388*//*6387*/(/*6389*/name/*<6389*/)(/*6390*/l/*<6390*/)/*<6387*/
}
}
}
return /*6392*//*6393*/fatal/*<6393*//*6392*/(/*6394*/"typealias type argument must be identifier"/*<6394*/)/*<6392*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 6380');})(/*!*//*6382*/x/*<6382*/)/*<6380*/ }/*<6373*/)/*<6370*/;
{
let args = $target;
return /*6396*//*6397*/stypealias/*<6397*//*6396*/(/*6398*/name/*<6398*/)(/*6399*/nl/*<6399*/)(/*6400*/args/*<6400*/)(/*6401*//*6403*/parse_type/*<6403*//*6401*/(/*6404*/body/*<6404*/)/*<6401*/)(/*6405*/l/*<6405*/)/*<6396*/
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
return /*6133*//*6134*/fatal/*<6134*//*6133*/(/*6135*/`Invalid 'deftype' ${/*6137*//*6138*/int_to_string/*<6138*//*6137*/(/*6139*/l/*<6139*/)/*<6137*/}`/*<6135*/)/*<6133*/
}
}
}
}
}
return /*3170*//*3171*/sexpr/*<3171*//*3170*/(/*954*//*955*/parse_expr/*<955*//*954*/(/*956*/cst/*<956*/)/*<954*/)(/*4949*/(function match_4949($target) {
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
return /*974*//*978*/eprim/*<978*//*974*/(/*979*//*980*/pbool/*<980*//*979*/(/*981*/true/*<981*/)(/*3511*/l/*<3511*/)/*<979*/)(/*3510*/l/*<3510*/)/*<974*/
}
}
}
if ($target.type === "cst/identifier") {
if ($target[0] === "false"){
{
let l = $target[1];
return /*987*//*989*/eprim/*<989*//*987*/(/*990*//*991*/pbool/*<991*//*990*/(/*992*/false/*<992*/)(/*3512*/l/*<3512*/)/*<990*/)(/*3513*/l/*<3513*/)/*<987*/
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
return /*994*//*1008*/estr/*<1008*//*994*/(/*1009*/first/*<1009*/)(/*1010*//*1011*/map/*<1011*//*1010*/(/*1012*/templates/*<1012*/)(/*1013*/function name_1013(tpl) { return /*1017*/(function let_1017() {const $target = /*1024*/tpl/*<1024*/;
if ($target.type === ",,") {
{
let expr = $target[0];
{
let string = $target[1];
{
let l = $target[2];
return /*1025*//*1026*/$co$co/*<1026*//*1025*/(/*1027*//*1028*/parse_expr/*<1028*//*1027*/(/*1029*/expr/*<1029*/)/*<1027*/)(/*1030*/string/*<1030*/)(/*3516*/l/*<3516*/)/*<1025*/
}
}
}
};
throw new Error('let pattern not matched 1020. ' + valueToString($target));})(/*!*/)/*<1017*/ }/*<1013*/)/*<1010*/)(/*3514*/l/*<3514*/)/*<994*/
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
return /*1061*//*1062*/eprim/*<1062*//*1061*/(/*1063*//*1064*/pint/*<1064*//*1063*/(/*1065*/int/*<1065*/)(/*3535*/l/*<3535*/)/*<1063*/)(/*3536*/l/*<3536*/)/*<1061*/
}
}
if ($target.type === "none") {
return /*1068*//*1069*/evar/*<1069*//*1068*/(/*1071*/id/*<1071*/)(/*3537*/l/*<3537*/)/*<1068*/
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 970');})(/*!*//*1055*//*1056*/string_to_int/*<1056*//*1055*/(/*1057*/id/*<1057*/)/*<1055*/)/*<970*/
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
return /*3070*//*3079*/equot/*<3079*//*3070*/(/*8412*//*8413*/quot$slexpr/*<8413*//*8412*/(/*3080*//*3081*/parse_expr/*<3081*//*3080*/(/*3082*/body/*<3082*/)/*<3080*/)/*<8412*/)(/*3548*/l/*<3548*/)/*<3070*/
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
return /*8414*//*8415*/equot/*<8415*//*8414*/(/*3091*//*3101*/quot$slquot/*<3101*//*3091*/(/*3102*/body/*<3102*/)/*<3091*/)(/*8416*/l/*<8416*/)/*<8414*/
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
return /*8417*//*8418*/equot/*<8418*//*8417*/(/*5114*//*5122*/quot$slstmt/*<5122*//*5114*/(/*5123*//*5124*/parse_stmt/*<5124*//*5123*/(/*5125*/body/*<5125*/)/*<5123*/)/*<5114*/)(/*8419*/l/*<8419*/)/*<8417*/
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
return /*8420*//*8421*/equot/*<8421*//*8420*/(/*5292*//*5302*/quot$sltype/*<5302*//*5292*/(/*5303*//*5305*/parse_type/*<5305*//*5303*/(/*5306*/body/*<5306*/)/*<5303*/)/*<5292*/)(/*8424*/l/*<8424*/)/*<8420*/
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
return /*8422*//*8423*/equot/*<8423*//*8422*/(/*5319*//*5320*/quot$slpat/*<5320*//*5319*/(/*5321*//*5322*/parse_pat/*<5322*//*5321*/(/*5323*/body/*<5323*/)/*<5321*/)/*<5319*/)(/*8425*/l/*<8425*/)/*<8422*/
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
return /*4575*//*4586*/ematch/*<4586*//*4575*/(/*4587*//*4588*/parse_expr/*<4588*//*4587*/(/*4589*/cond/*<4589*/)/*<4587*/)(/*4590*//*4590*/cons/*<4590*//*4590*/(/*4591*//*4592*/$co/*<4592*//*4591*/(/*4593*//*4594*/pprim/*<4594*//*4593*/(/*4597*//*4598*/pbool/*<4598*//*4597*/(/*4599*/true/*<4599*/)(/*4600*/l/*<4600*/)/*<4597*/)(/*4601*/l/*<4601*/)/*<4593*/)(/*4602*//*4603*/parse_expr/*<4603*//*4602*/(/*4604*/yes/*<4604*/)/*<4602*/)/*<4591*/)(/*4590*//*4590*/cons/*<4590*//*4590*/(/*4605*//*4606*/$co/*<4606*//*4605*/(/*4607*//*4608*/pany/*<4608*//*4607*/(/*4609*/l/*<4609*/)/*<4607*/)(/*4610*//*4611*/parse_expr/*<4611*//*4610*/(/*4612*/no/*<4612*/)/*<4610*/)/*<4605*/)(/*4590*/nil/*<4590*/)/*<4590*/)/*<4590*/)(/*4613*/l/*<4613*/)/*<4575*/
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
return /*1073*//*1213*/elambda/*<1213*//*1073*/(/*8408*//*8409*/map/*<8409*//*8408*/(/*8410*/args/*<8410*/)(/*8411*/parse_pat/*<8411*/)/*<8408*/)(/*1214*//*1215*/parse_expr/*<1215*//*1214*/(/*1216*/body/*<1216*/)/*<1214*/)(/*1217*/b/*<1217*/)/*<1073*/
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
return /*6060*//*6070*/fatal/*<6070*//*6060*/(/*6071*/`Invalid 'fn' ${/*6073*//*6075*/int_to_string/*<6075*//*6073*/(/*6076*/l/*<6076*/)/*<6073*/}`/*<6071*/)/*<6060*/
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
return /*2947*//*2962*/ematch/*<2962*//*2947*/(/*2963*//*2964*/parse_expr/*<2964*//*2963*/(/*2965*/target/*<2965*/)/*<2963*/)(/*2966*//*2967*/map/*<2967*//*2966*/(/*2968*//*2969*/pairs/*<2969*//*2968*/(/*2970*/cases/*<2970*/)/*<2968*/)(/*2971*/function name_2971($case) { return /*2975*/(function let_2975() {const $target = /*3000*/$case/*<3000*/;
if ($target.type === ",") {
{
let pat = $target[0];
{
let expr = $target[1];
return /*2982*//*2983*/$co/*<2983*//*2982*/(/*2984*//*2985*/parse_pat/*<2985*//*2984*/(/*2986*/pat/*<2986*/)/*<2984*/)(/*2987*//*2988*/parse_expr/*<2988*//*2987*/(/*2989*/expr/*<2989*/)/*<2987*/)/*<2982*/
}
}
};
throw new Error('let pattern not matched 2978. ' + valueToString($target));})(/*!*/)/*<2975*/ }/*<2971*/)/*<2966*/)(/*3601*/l/*<3601*/)/*<2947*/
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
return /*8370*//*8371*/elet/*<8371*//*8370*/(/*8372*//*8373*/map/*<8373*//*8372*/(/*8374*//*8375*/pairs/*<8375*//*8374*/(/*8376*/inits/*<8376*/)/*<8374*/)(/*8377*/function name_8377(pair) { return /*8387*/(function let_8387() {const $target = /*8394*/pair/*<8394*/;
if ($target.type === ",") {
{
let pat = $target[0];
{
let value = $target[1];
return /*8395*//*8396*/$co/*<8396*//*8395*/(/*8397*//*8398*/parse_pat/*<8398*//*8397*/(/*8400*/pat/*<8400*/)/*<8397*/)(/*8401*//*8402*/parse_expr/*<8402*//*8401*/(/*8403*/value/*<8403*/)/*<8401*/)/*<8395*/
}
}
};
throw new Error('let pattern not matched 8390. ' + valueToString($target));})(/*!*/)/*<8387*/ }/*<8377*/)/*<8372*/)(/*8404*//*8405*/parse_expr/*<8405*//*8404*/(/*8406*/body/*<8406*/)/*<8404*/)(/*8407*/l/*<8407*/)/*<8370*/
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
{
let el = $target[0][0][1];
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
return /*6142*//*6156*/foldr/*<6156*//*6142*/(/*6157*//*6158*/parse_expr/*<6158*//*6157*/(/*6159*/body/*<6159*/)/*<6157*/)(/*6160*//*6161*/pairs/*<6161*//*6160*/(/*6162*/inits/*<6162*/)/*<6160*/)(/*6163*/function name_6163(body) { return function name_6163(init) { return /*6168*/(function let_6168() {const $target = /*6175*/init/*<6175*/;
if ($target.type === ",") {
{
let pat = $target[0];
{
let value = $target[1];
return /*6176*//*6178*/eapp/*<6178*//*6176*/(/*7846*//*7847*/evar/*<7847*//*7846*/(/*7848*/">>="/*<7848*/)(/*7850*/el/*<7850*/)/*<7846*/)(/*8367*//*8367*/cons/*<8367*//*8367*/(/*6179*//*6180*/parse_expr/*<6180*//*6179*/(/*6181*/value/*<6181*/)/*<6179*/)(/*8367*//*8367*/cons/*<8367*//*8367*/(/*6182*//*6183*/elambda/*<6183*//*6182*/(/*8368*//*8368*/cons/*<8368*//*8368*/(/*6184*//*7851*/parse_pat/*<7851*//*6184*/(/*7852*/pat/*<7852*/)/*<6184*/)(/*8368*/nil/*<8368*/)/*<8368*/)(/*6187*/body/*<6187*/)(/*6204*/l/*<6204*/)/*<6182*/)(/*8367*/nil/*<8367*/)/*<8367*/)/*<8367*/)(/*6203*/l/*<6203*/)/*<6176*/
}
}
};
throw new Error('let pattern not matched 6171. ' + valueToString($target));})(/*!*/)/*<6168*/ } }/*<6163*/)/*<6142*/
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
if ($target[0][0][0] === "let"){
{
let l = $target[1];
return /*6046*//*6047*/fatal/*<6047*//*6046*/(/*6048*/`Invalid 'let' ${/*6052*//*6050*/int_to_string/*<6050*//*6052*/(/*6054*/l/*<6054*/)/*<6052*/}`/*<6048*/)/*<6046*/
}
}
}
}
}
if ($target.type === "cst/list") {
if ($target[0].type === "cons") {
if ($target[0][0].type === "cst/identifier") {
if ($target[0][0][0] === ","){
{
let il = $target[0][0][1];
{
let args = $target[0][1];
{
let l = $target[1];
return /*7548*//*7610*/parse_tuple/*<7610*//*7548*/(/*7611*/args/*<7611*/)(/*7612*/il/*<7612*/)(/*7613*/l/*<7613*/)/*<7548*/
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
return /*7553*//*7554*/evar/*<7554*//*7553*/(/*7555*/"()"/*<7555*/)(/*7557*/l/*<7557*/)/*<7553*/
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
return /*1586*//*1587*/eapp/*<1587*//*1586*/(/*8362*//*1588*/parse_expr/*<1588*//*8362*/(/*8363*/target/*<8363*/)/*<8362*/)(/*8359*//*8360*/map/*<8360*//*8359*/(/*8361*/args/*<8361*/)(/*1590*/parse_expr/*<1590*/)/*<8359*/)(/*3745*/l/*<3745*/)/*<1586*/
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
return /*3407*//*3460*/parse_array/*<3460*//*3407*/(/*3461*/args/*<3461*/)(/*3681*/l/*<3681*/)/*<3407*/
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 963');})(/*!*//*965*/cst/*<965*/)/*<963*/ }/*<957*/;


const parse_tuple = /*7563*/function name_7563(args) { return function name_7563(il) { return function name_7563(l) { return /*7570*/(function match_7570($target) {
if ($target.type === "nil") {
return /*7574*//*7576*/evar/*<7576*//*7574*/(/*7577*/","/*<7577*/)(/*7579*/il/*<7579*/)/*<7574*/
}
if ($target.type === "cons") {
{
let one = $target[0];
if ($target[1].type === "nil") {
return /*7582*//*7583*/parse_expr/*<7583*//*7582*/(/*7584*/one/*<7584*/)/*<7582*/
}
}
}
if ($target.type === "cons") {
{
let one = $target[0];
{
let rest = $target[1];
return /*7596*//*7597*/eapp/*<7597*//*7596*/(/*7598*//*7599*/evar/*<7599*//*7598*/(/*7600*/","/*<7600*/)(/*7605*/il/*<7605*/)/*<7598*/)(/*8428*//*8428*/cons/*<8428*//*8428*/(/*7602*//*7603*/parse_expr/*<7603*//*7602*/(/*7604*/one/*<7604*/)/*<7602*/)(/*8428*//*8428*/cons/*<8428*//*8428*/(/*7591*//*7592*/parse_tuple/*<7592*//*7591*/(/*7593*/rest/*<7593*/)(/*7594*/il/*<7594*/)(/*7595*/l/*<7595*/)/*<7591*/)(/*8428*/nil/*<8428*/)/*<8428*/)/*<8428*/)(/*7606*/l/*<7606*/)/*<7596*/
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 7570');})(/*!*//*7572*/args/*<7572*/)/*<7570*/ } } }/*<7563*/;


const parse_array = /*3416*/function name_3416(args) { return function name_3416(l) { return /*3422*/(function match_3422($target) {
if ($target.type === "nil") {
return /*3426*//*3427*/evar/*<3427*//*3426*/(/*3428*/"nil"/*<3428*/)(/*3675*/l/*<3675*/)/*<3426*/
}
if ($target.type === "cons") {
if ($target[0].type === "cst/spread") {
{
let inner = $target[0][0];
if ($target[1].type === "nil") {
return /*3434*//*3435*/parse_expr/*<3435*//*3434*/(/*3436*/inner/*<3436*/)/*<3434*/
}
}
}
}
if ($target.type === "cons") {
{
let one = $target[0];
{
let rest = $target[1];
return /*3443*//*3444*/eapp/*<3444*//*3443*/(/*3450*//*3451*/evar/*<3451*//*3450*/(/*3452*/"cons"/*<3452*/)(/*3677*/l/*<3677*/)/*<3450*/)(/*8429*//*8429*/cons/*<8429*//*8429*/(/*3454*//*3455*/parse_expr/*<3455*//*3454*/(/*3456*/one/*<3456*/)/*<3454*/)(/*8429*//*8429*/cons/*<8429*//*8429*/(/*3457*//*3458*/parse_array/*<3458*//*3457*/(/*3459*/rest/*<3459*/)(/*3676*/l/*<3676*/)/*<3457*/)(/*8429*/nil/*<8429*/)/*<8429*/)/*<8429*/)(/*3679*/l/*<3679*/)/*<3443*/
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 3422');})(/*!*//*3424*/args/*<3424*/)/*<3422*/ } }/*<3416*/;

const compile = /*2368*/function name_2368(expr) { return function name_2368(trace) { return /*4905*/(function let_4905() {const $target = /*4912*//*4913*/expr_loc/*<4913*//*4912*/(/*4914*/expr/*<4914*/)/*<4912*/;
{
let loc = $target;
return /*4915*//*4916*/source_map/*<4916*//*4915*/(/*4917*/loc/*<4917*/)(/*4769*//*4770*/trace_wrap/*<4770*//*4769*/(/*4773*/loc/*<4773*/)(/*4776*/trace/*<4776*/)(/*2634*/(function match_2634($target) {
if ($target.type === "estr") {
{
let first = $target[0];
{
let tpls = $target[1];
{
let l = $target[2];
return /*2641*/(function match_2641($target) {
if ($target.type === "nil") {
return /*2645*/`\"${/*2647*//*2649*/escape_string/*<2649*//*2647*/(/*2650*//*2651*/unescapeString/*<2651*//*2650*/(/*2652*/first/*<2652*/)/*<2650*/)/*<2647*/}\"`/*<2645*/
}
return /*2654*/`\`${/*2675*//*2677*/escape_string/*<2677*//*2675*/(/*2678*//*2679*/unescapeString/*<2679*//*2678*/(/*2680*/first/*<2680*/)/*<2678*/)/*<2675*/}${/*2681*//*2683*/join/*<2683*//*2681*/(/*2684*/""/*<2684*/)(/*2686*//*2687*/map/*<2687*//*2686*/(/*2688*/tpls/*<2688*/)(/*2689*/function name_2689(item) { return /*2693*/(function let_2693() {const $target = /*2700*/item/*<2700*/;
if ($target.type === ",,") {
{
let expr = $target[0];
{
let suffix = $target[1];
{
let l = $target[2];
return /*2701*/`\${${/*2703*//*2705*/compile/*<2705*//*2703*/(/*2706*/expr/*<2706*/)(/*4681*/trace/*<4681*/)/*<2703*/}}${/*2707*//*2709*/escape_string/*<2709*//*2707*/(/*2710*//*2711*/unescapeString/*<2711*//*2710*/(/*2712*/suffix/*<2712*/)/*<2710*/)/*<2707*/}`/*<2701*/
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
return /*2763*//*2764*/int_to_string/*<2764*//*2763*/(/*2765*/int/*<2765*/)/*<2763*/
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
return /*2781*//*2782*/sanitize/*<2782*//*2781*/(/*2783*/name/*<2783*/)/*<2781*/
}
}
}
if ($target.type === "equot") {
{
let inner = $target[0];
{
let l = $target[1];
return /*2787*//*2788*/quot$sljsonify/*<2788*//*2787*/(/*2789*/inner/*<2789*/)/*<2787*/
}
}
}
if ($target.type === "elambda") {
{
let pats = $target[0];
{
let body = $target[1];
{
let l = $target[2];
return /*9073*//*9074*/foldr/*<9074*//*9073*/(/*9075*//*9076*/compile/*<9076*//*9075*/(/*9077*/body/*<9077*/)(/*9078*/trace/*<9078*/)/*<9075*/)(/*9079*/pats/*<9079*/)(/*9081*/function name_9081(body) { return function name_9081(pat) { return /*2797*/`function name_${/*5957*//*5426*/its/*<5426*//*5957*/(/*5958*/l/*<5958*/)/*<5957*/}(${/*7860*//*8028*/orr/*<8028*//*7860*/(/*8029*/"_"/*<8029*/)(/*8031*//*8032*/just_pat/*<8032*//*8031*/(/*8033*/pat/*<8033*/)/*<8031*/)/*<7860*/}) {${/*8168*/(function match_8168($target) {
if ($target.type === "nil") {
return /*8179*/""/*<8179*/
}
{
let names = $target;
return /*8182*//*8183*/join/*<8183*//*8182*/(/*8244*/"\n"/*<8244*/)(/*8248*//*8249*/map/*<8249*//*8248*/(/*8250*/names/*<8250*/)(/*8251*/function name_8251(arg) { return /*9183*/(function let_9183() {const $target = /*9190*/arg/*<9190*/;
if ($target.type === ",") {
{
let name = $target[0];
{
let l = $target[1];
return /*8258*//*8295*/just_trace/*<8295*//*8258*/(/*8296*/l/*<8296*/)(/*8297*/trace/*<8297*/)(/*8299*//*8298*/sanitize/*<8298*//*8299*/(/*8300*/name/*<8300*/)/*<8299*/)/*<8258*/
}
}
};
throw new Error('let pattern not matched 9186. ' + valueToString($target));})(/*!*/)/*<9183*/ }/*<8251*/)/*<8248*/)/*<8182*/
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 8168');})(/*!*//*8242*//*8243*/bag$slto_list/*<8243*//*8242*/(/*8173*//*8174*/pat_names_loc/*<8174*//*8173*/(/*8175*/pat/*<8175*/)/*<8173*/)/*<8242*/)/*<8168*/} return ${/*7884*/body/*<7884*/} }`/*<2797*/ } }/*<9081*/)/*<9073*/
}
}
}
}
if ($target.type === "elet") {
{
let bindings = $target[0];
{
let body = $target[1];
{
let l = $target[2];
return /*9061*//*9062*/foldr/*<9062*//*9061*/(/*9063*//*9064*/compile/*<9064*//*9063*/(/*9065*/body/*<9065*/)(/*9066*/trace/*<9066*/)/*<9063*/)(/*9067*/bindings/*<9067*/)(/*9068*/function name_9068(body) { return function name_9068(binding) { return /*9037*//*9036*/compile_let_binding/*<9036*//*9037*/(/*9038*/binding/*<9038*/)(/*9043*/body/*<9043*/)(/*9060*/trace/*<9060*/)(/*9044*/l/*<9044*/)/*<9037*/ } }/*<9068*/)/*<9061*/
}
}
}
}
if ($target.type === "eapp") {
{
let target = $target[0];
{
let args = $target[1];
{
let l = $target[2];
return /*9012*/`${/*8973*//*8975*/foldl/*<8975*//*8973*/(/*9019*/`${/*8976*/(function match_8976($target) {
if ($target.type === "elambda") {
return /*8984*/`(${/*8986*//*8988*/compile/*<8988*//*8986*/(/*8989*/target/*<8989*/)(/*8990*/trace/*<8990*/)/*<8986*/})`/*<8984*/
}
return /*8992*//*8993*/compile/*<8993*//*8992*/(/*8994*/target/*<8994*/)(/*8995*/trace/*<8995*/)/*<8992*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 8976');})(/*!*//*8978*/target/*<8978*/)/*<8976*/}/*${/*9022*//*9024*/its/*<9024*//*9022*/(/*9025*/l/*<9025*/)/*<9022*/}*/`/*<9019*/)(/*8996*/args/*<8996*/)(/*8997*/function name_8997(target) { return function name_8997(arg) { return /*9003*/`${/*9005*/target/*<9005*/}(${/*9007*//*9009*/compile/*<9009*//*9007*/(/*9010*/arg/*<9010*/)(/*9011*/trace/*<9011*/)/*<9007*/})`/*<9003*/ } }/*<8997*/)/*<8973*/}`/*<9012*/
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
return /*2894*/`(function match_${/*5964*//*5424*/its/*<5424*//*5964*/(/*5965*/l/*<5965*/)/*<5964*/}(\$target) {\n${/*2896*//*2898*/join/*<2898*//*2896*/(/*2901*/"\n"/*<2901*/)(/*2903*//*2904*/map/*<2904*//*2903*/(/*2906*/cases/*<2906*/)(/*2907*/function name_2907($case) { return /*2911*/(function let_2911() {const $target = /*2918*/$case/*<2918*/;
if ($target.type === ",") {
{
let pat = $target[0];
{
let body = $target[1];
return /*2919*//*2920*/compile_pat/*<2920*//*2919*/(/*2921*/pat/*<2921*/)(/*2922*/"\$target"/*<2922*/)(/*2924*/`return ${/*3336*//*3338*/compile/*<3338*//*3336*/(/*3339*/body/*<3339*/)(/*4687*/trace/*<4687*/)/*<3336*/}`/*<2924*/)(/*4848*/trace/*<4848*/)/*<2919*/
}
}
};
throw new Error('let pattern not matched 2914. ' + valueToString($target));})(/*!*/)/*<2911*/ }/*<2907*/)/*<2903*/)/*<2896*/}\nthrow new Error('failed to match ' + jsonify(\$target) + '. Loc: ${/*5966*//*4315*/its/*<4315*//*5966*/(/*5967*/l/*<5967*/)/*<5966*/}');})(/*!*/${/*2926*//*2928*/compile/*<2928*//*2926*/(/*2929*/target/*<2929*/)(/*4688*/trace/*<4688*/)/*<2926*/})`/*<2894*/
}
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 2634');})(/*!*//*2636*/expr/*<2636*/)/*<2634*/)/*<4769*/)/*<4915*/
};
throw new Error('let pattern not matched 4911. ' + valueToString($target));})(/*!*/)/*<4905*/ } }/*<2368*/;


const compile_let_binding = /*9046*/function name_9046(binding) { return function name_9046(body) { return function name_9046(trace) { return function name_9046(l) { return /*9026*/(function let_9026() {const $target = /*9035*/binding/*<9035*/;
if ($target.type === ",") {
{
let pat = $target[0];
{
let init = $target[1];
return /*2812*/`(function let_${/*5959*//*5422*/its/*<5422*//*5959*/(/*5960*/l/*<5960*/)/*<5959*/}() {const \$target = ${/*4401*//*4403*/compile/*<4403*//*4401*/(/*4404*/init/*<4404*/)(/*4679*/trace/*<4679*/)/*<4401*/};\n${/*4397*//*4399*/compile_pat/*<4399*//*4397*/(/*4412*/pat/*<4412*/)(/*4400*/"\$target"/*<4400*/)(/*4406*/`return ${/*4408*/body/*<4408*/}`/*<4406*/)(/*4849*/trace/*<4849*/)/*<4397*/};\nthrow new Error('let pattern not matched ${/*5961*//*5962*/its/*<5962*//*5961*/(/*4571*//*4572*/pat_loc/*<4572*//*4571*/(/*4529*/pat/*<4529*/)/*<4571*/)/*<5961*/}. ' + valueToString(\$target));})(/*!*/)`/*<2812*/
}
}
};
throw new Error('let pattern not matched 9031. ' + valueToString($target));})(/*!*/)/*<9026*/ } } } }/*<9046*/;

const compile_stmt = /*404*/function name_404(stmt) { return function name_404(trace) { return /*410*/(function match_410($target) {
if ($target.type === "sexpr") {
{
let expr = $target[0];
{
let l = $target[1];
return /*416*//*417*/compile/*<417*//*416*/(/*418*/expr/*<418*/)(/*4798*/trace/*<4798*/)/*<416*/
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
return /*423*//*424*/$pl$pl/*<424*//*423*/(/*425*//*425*/cons/*<425*//*425*/(/*426*/"const "/*<426*/)(/*425*//*425*/cons/*<425*//*425*/(/*428*//*429*/sanitize/*<429*//*428*/(/*430*/name/*<430*/)/*<428*/)(/*425*//*425*/cons/*<425*//*425*/(/*431*/" = "/*<431*/)(/*425*//*425*/cons/*<425*//*425*/(/*433*//*434*/compile/*<434*//*433*/(/*435*/body/*<435*/)(/*4799*/trace/*<4799*/)/*<433*/)(/*425*//*425*/cons/*<425*//*425*/(/*436*/";\n"/*<436*/)(/*425*/nil/*<425*/)/*<425*/)/*<425*/)/*<425*/)/*<425*/)/*<425*/)/*<423*/
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
return /*442*//*443*/join/*<443*//*442*/(/*444*/"\n"/*<444*/)(/*446*//*447*/map/*<447*//*446*/(/*448*/cases/*<448*/)(/*449*/function name_449($case) { return /*453*/(function let_453() {const $target = /*460*/$case/*<460*/;
if ($target.type === ",,,") {
{
let name2 = $target[0];
{
let nl = $target[1];
{
let args = $target[2];
{
let l = $target[3];
return /*461*//*462*/$pl$pl/*<462*//*461*/(/*463*//*463*/cons/*<463*//*463*/(/*464*/"const "/*<464*/)(/*463*//*463*/cons/*<463*//*463*/(/*5430*//*466*/sanitize/*<466*//*5430*/(/*5431*/name2/*<5431*/)/*<5430*/)(/*463*//*463*/cons/*<463*//*463*/(/*467*/" = "/*<467*/)(/*463*//*463*/cons/*<463*//*463*/(/*469*//*470*/$pl$pl/*<470*//*469*/(/*471*//*472*/mapi/*<472*//*471*/(/*473*/0/*<473*/)(/*474*/args/*<474*/)(/*475*/function name_475(i) { return function name_475(_) { return /*480*//*481*/$pl$pl/*<481*//*480*/(/*482*//*482*/cons/*<482*//*482*/(/*483*/"(v"/*<483*/)(/*482*//*482*/cons/*<482*//*482*/(/*485*//*486*/int_to_string/*<486*//*485*/(/*487*/i/*<487*/)/*<485*/)(/*482*//*482*/cons/*<482*//*482*/(/*488*/") => "/*<488*/)(/*482*/nil/*<482*/)/*<482*/)/*<482*/)/*<482*/)/*<480*/ } }/*<475*/)/*<471*/)/*<469*/)(/*463*//*463*/cons/*<463*//*463*/(/*490*/"({type: \""/*<490*/)(/*463*//*463*/cons/*<463*//*463*/(/*492*/name2/*<492*/)(/*463*//*463*/cons/*<463*//*463*/(/*493*/"\""/*<493*/)(/*463*//*463*/cons/*<463*//*463*/(/*495*//*496*/$pl$pl/*<496*//*495*/(/*497*//*498*/mapi/*<498*//*497*/(/*499*/0/*<499*/)(/*500*/args/*<500*/)(/*501*/function name_501(i) { return function name_501(_) { return /*506*//*507*/$pl$pl/*<507*//*506*/(/*508*//*508*/cons/*<508*//*508*/(/*509*/", "/*<509*/)(/*508*//*508*/cons/*<508*//*508*/(/*511*//*512*/int_to_string/*<512*//*511*/(/*513*/i/*<513*/)/*<511*/)(/*508*//*508*/cons/*<508*//*508*/(/*514*/": v"/*<514*/)(/*508*//*508*/cons/*<508*//*508*/(/*516*//*517*/int_to_string/*<517*//*516*/(/*518*/i/*<518*/)/*<516*/)(/*508*/nil/*<508*/)/*<508*/)/*<508*/)/*<508*/)/*<508*/)/*<506*/ } }/*<501*/)/*<497*/)/*<495*/)(/*463*//*463*/cons/*<463*//*463*/(/*519*/"});"/*<519*/)(/*463*/nil/*<463*/)/*<463*/)/*<463*/)/*<463*/)/*<463*/)/*<463*/)/*<463*/)/*<463*/)/*<463*/)/*<463*/)/*<461*/
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
throw new Error('failed to match ' + jsonify($target) + '. Loc: 410');})(/*!*//*412*/stmt/*<412*/)/*<410*/ } }/*<404*/;

const run = /*4208*/function name_4208(v) { return /*4215*//*4217*/eval/*<4217*//*4215*/(/*4218*//*4219*/compile/*<4219*//*4218*/(/*4220*//*4221*/parse_expr/*<4221*//*4220*/(/*4222*/v/*<4222*/)/*<4220*/)(/*4676*/map$slnil/*<4676*/)/*<4218*/)/*<4215*/ }/*<4208*/;

return {type: 'fns', bag$sland, bag$slfold, bag$slto_list, builtins, compile, compile_let_binding, compile_pat, compile_stmt, cons, cst$slarray, cst$slidentifier, cst$sllist, cst$slspread, cst$slstring, dot, eapp, elambda, elet, ematch, empty, eprim, equot, escape_string, estr, evar, expr_loc, externals, externals_stmt, externals_type, foldl, foldr, fst, its, join, just_pat, just_trace, many, map, mapi, mk_deftype, names, nil, none, one, orr, pairs, pany, parse_and_compile, parse_array, parse_expr, parse_pat, parse_pat_tuple, parse_stmt, parse_tuple, parse_type, pat_externals, pat_loc, pat_loop, pat_names, pat_names_loc, pbool, pcon, pint, pprim, pstr, pvar, quot$slexpr, quot$sljsonify, quot$slpat, quot$slquot, quot$slstmt, quot$sltype, replaces, rev, run, sdef, sdeftype, sexpr, snd, some, source_map, stypealias, tapp, tapps, tcon, trace_and, trace_and_block, trace_wrap, tvar, type, value}