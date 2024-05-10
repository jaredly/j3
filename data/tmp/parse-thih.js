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
const builtins = /*3135*/"const sanMap = { '-': '_', '+': '\$pl', '*': '\$ti', '=': '\$eq', \n'>': '\$gt', '<': '\$lt', \"'\": '\$qu', '\"': '\$dq', ',': '\$co', '@': '\$at', '/': '\$sl'};\n\nconst kwds = 'case var if return';\nconst rx = [];\nkwds.split(' ').forEach((kwd) =>\n    rx.push([new RegExp(\`^\${kwd}\$\`, 'g'), '\$' + kwd]),);\nconst sanitize = (raw) => { if (raw == null) debugger;\n    for (let [key, val] of Object.entries(sanMap)) {\n        raw = raw.replaceAll(key, val);\n    }\n    rx.forEach(([rx, res]) => {\n        raw = raw.replaceAll(rx, res);\n    });\n    return raw;\n};\nconst jsonify = (raw) => JSON.stringify(raw);\nconst string_to_int = (a) => {\n    var v = parseInt(a);\n    if (!isNaN(v) && '' + v === a) return {type: 'some', 0: v}\n    return {type: 'none'}\n}\n\nconst unwrapArray = (v) => {\n    if (!v) debugger\n    return v.type === 'nil' ? [] : [v[0], ...unwrapArray(v[1])]\n};\nconst \$eq = (a) => (b) => a == b;\nconst fatal = (e) => {throw new Error(e)}\nconst nil = { type: 'nil' };\nconst cons = (a) => (b) => ({ type: 'cons', 0: a, 1: b });\nconst \$pl\$pl = (items) => unwrapArray(items).join('');\nconst \$pl = (a) => (b) => a + b;\nconst _ = (a) => (b) => a - b;\nconst int_to_string = (a) => a + '';\nconst replace_all = (a) => (b) => (c) => {\n    return a.replaceAll(b, c);\n};\nconst \$co = (a) => (b) => ({ type: ',', 0: a, 1: b });\nconst reduce = (init) => (items) => (f) => {\n    return unwrapArray(items).reduce((a, b) => f(a)(b), init);\n};\n"/*<3135*/;

const its = /*5948*/int_to_string/*<5948*/;

/* type alias id */
const pint = (v0) => (v1) => ({type: "pint", 0: v0, 1: v1});
const pfloat = (v0) => (v1) => ({type: "pfloat", 0: v0, 1: v1});
const pbool = (v0) => (v1) => ({type: "pbool", 0: v0, 1: v1});
const enumId = /*6966*/function name_6966(num) { return /*6971*/`v${/*6973*//*6974*/int_to_string/*<6974*//*6973*/(/*6975*/num/*<6975*/)/*<6973*/}`/*<6971*/ }/*<6966*/;

const $bar_$gt = /*7700*/function name_7700(u) { return function name_7700(t) { return /*7706*//*7707*/map$slset/*<7707*//*7706*/(/*7708*/map$slnil/*<7708*/)(/*7709*/u/*<7709*/)(/*7710*/t/*<7710*/)/*<7706*/ } }/*<7700*/;

const orr = /*8686*/function name_8686($default) { return function name_8686(v) { return /*8694*/(function match_8694($target) {
if ($target.type === "some") {
{
let v = $target[0];
return /*8700*/v/*<8700*/
}
}
return /*8702*/$default/*<8702*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 8694');})(/*!*//*8696*/v/*<8696*/)/*<8694*/ } }/*<8686*/;

const nil = ({type: "nil"});
const cons = (v0) => (v1) => ({type: "cons", 0: v0, 1: v1});
const pany = (v0) => ({type: "pany", 0: v0});
const pvar = (v0) => (v1) => ({type: "pvar", 0: v0, 1: v1});
const pcon = (v0) => (v1) => (v2) => ({type: "pcon", 0: v0, 1: v1, 2: v2});
const pstr = (v0) => (v1) => ({type: "pstr", 0: v0, 1: v1});
const pprim = (v0) => (v1) => ({type: "pprim", 0: v0, 1: v1});
const star = ({type: "star"});
const kfun = (v0) => (v1) => ({type: "kfun", 0: v0, 1: v1});
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
return /*157*//*158*/$pl$pl/*<158*//*157*/(/*159*//*159*/cons/*<159*//*159*/(/*160*/one/*<160*/)(/*159*//*159*/cons/*<159*//*159*/(/*161*/sep/*<161*/)(/*159*//*159*/cons/*<159*//*159*/(/*162*//*163*/join/*<163*//*162*/(/*164*/sep/*<164*/)(/*165*/rest/*<165*/)/*<162*/)(/*159*/nil/*<159*/)/*<159*/)/*<159*/)/*<159*/)/*<157*/
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

const tyvar = (v0) => (v1) => ({type: "tyvar", 0: v0, 1: v1});
const tycon = (v0) => (v1) => ({type: "tycon", 0: v0, 1: v1});
const kind$eq = /*7006*/function name_7006(a) { return function name_7006(b) { return /*7012*/(function match_7012($target) {
if ($target.type === ",") {
if ($target[0].type === "star") {
if ($target[1].type === "star") {
return /*7024*/true/*<7024*/
}
}
}
if ($target.type === ",") {
if ($target[0].type === "kfun") {
{
let a = $target[0][0];
{
let b = $target[0][1];
if ($target[1].type === "kfun") {
{
let a$qu = $target[1][0];
{
let b$qu = $target[1][1];
return /*7035*/(function match_7035($target) {
if ($target === true) {
return /*7041*//*7042*/kind$eq/*<7042*//*7041*/(/*7043*/b/*<7043*/)(/*7044*/b$qu/*<7044*/)/*<7041*/
}
return /*7045*/false/*<7045*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 7035');})(/*!*//*7037*//*7038*/kind$eq/*<7038*//*7037*/(/*7039*/a/*<7039*/)(/*7040*/a$qu/*<7040*/)/*<7037*/)/*<7035*/
}
}
}
}
}
}
}
return /*7047*/false/*<7047*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 7012');})(/*!*//*7014*//*7015*/$co/*<7015*//*7014*/(/*7016*/a/*<7016*/)(/*7017*/b/*<7017*/)/*<7014*/)/*<7012*/ } }/*<7006*/;

const kind_$gts = /*7049*/function name_7049(a) { return /*7054*/(function match_7054($target) {
if ($target.type === "star") {
return /*7059*/"*"/*<7059*/
}
if ($target.type === "kfun") {
{
let a = $target[0];
{
let b = $target[1];
return /*7065*/`(${/*7067*//*7068*/kind_$gts/*<7068*//*7067*/(/*7069*/a/*<7069*/)/*<7067*/}->${/*7071*//*7072*/kind_$gts/*<7072*//*7071*/(/*7073*/b/*<7073*/)/*<7071*/})`/*<7065*/
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 7054');})(/*!*//*7056*/a/*<7056*/)/*<7054*/ }/*<7049*/;

const tyvar$eq = /*7076*/function name_7076({0: name, 1: kind}) {
 return function name_7076({0: name$qu, 1: kind$qu}) {
 return /*7088*/(function match_7088($target) {
if ($target === true) {
return /*7094*//*7095*/kind$eq/*<7095*//*7094*/(/*7096*/kind/*<7096*/)(/*7097*/kind$qu/*<7097*/)/*<7094*/
}
return /*7098*/false/*<7098*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 7088');})(/*!*//*7090*//*7091*/$eq/*<7091*//*7090*/(/*7092*/name/*<7092*/)(/*7093*/name$qu/*<7093*/)/*<7090*/)/*<7088*/ } }/*<7076*/;

const tyvar_$gts = /*7100*/function name_7100({0: name, 1: kind}) {
 return /*7108*/(function match_7108($target) {
if ($target.type === "star") {
return /*7113*/name/*<7113*/
}
return /*7115*/`[${/*7117*/name/*<7117*/} : ${/*7119*//*7120*/kind_$gts/*<7120*//*7119*/(/*7121*/kind/*<7121*/)/*<7119*/}]`/*<7115*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 7108');})(/*!*//*7110*/kind/*<7110*/)/*<7108*/ }/*<7100*/;

const letters = /*7210*//*7210*/cons/*<7210*//*7210*/(/*7211*/"a"/*<7211*/)(/*7210*//*7210*/cons/*<7210*//*7210*/(/*7213*/"b"/*<7213*/)(/*7210*//*7210*/cons/*<7210*//*7210*/(/*7215*/"c"/*<7215*/)(/*7210*//*7210*/cons/*<7210*//*7210*/(/*7217*/"d"/*<7217*/)(/*7210*//*7210*/cons/*<7210*//*7210*/(/*7219*/"e"/*<7219*/)(/*7210*//*7210*/cons/*<7210*//*7210*/(/*7221*/"f"/*<7221*/)(/*7210*//*7210*/cons/*<7210*//*7210*/(/*7223*/"g"/*<7223*/)(/*7210*//*7210*/cons/*<7210*//*7210*/(/*7225*/"h"/*<7225*/)(/*7210*//*7210*/cons/*<7210*//*7210*/(/*7227*/"i"/*<7227*/)(/*7210*/nil/*<7210*/)/*<7210*/)/*<7210*/)/*<7210*/)/*<7210*/)/*<7210*/)/*<7210*/)/*<7210*/)/*<7210*/)/*<7210*/;

const at = /*7230*/function name_7230(i) { return function name_7230(lst) { return /*7236*/(function match_7236($target) {
if ($target.type === "nil") {
return /*7240*//*7241*/fatal/*<7241*//*7240*/(/*7242*/"index out of range"/*<7242*/)/*<7240*/
}
if ($target.type === "cons") {
{
let one = $target[0];
{
let rest = $target[1];
return /*7248*/(function match_7248($target) {
if ($target === true) {
return /*7254*/one/*<7254*/
}
return /*7255*//*7256*/at/*<7256*//*7255*/(/*7257*//*7258*/_/*<7258*//*7257*/(/*7259*/i/*<7259*/)(/*7260*/1/*<7260*/)/*<7257*/)(/*7261*/rest/*<7261*/)/*<7255*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 7248');})(/*!*//*7250*//*7251*/$lt$eq/*<7251*//*7250*/(/*7252*/i/*<7252*/)(/*7253*/0/*<7253*/)/*<7250*/)/*<7248*/
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 7236');})(/*!*//*7238*/lst/*<7238*/)/*<7236*/ } }/*<7230*/;

const gen_name = /*7263*/function name_7263(num) { return /*7268*/`${/*7270*//*7271*/at/*<7271*//*7270*/(/*7272*/num/*<7272*/)(/*7273*/letters/*<7273*/)/*<7270*/}`/*<7268*/ }/*<7263*/;

const tycon$eq = /*7501*/function name_7501({0: name, 1: kind}) {
 return function name_7501({0: name$qu, 1: kind$qu}) {
 return /*7513*/(function match_7513($target) {
if ($target === true) {
return /*7519*//*7520*/kind$eq/*<7520*//*7519*/(/*7521*/kind/*<7521*/)(/*7522*/kind$qu/*<7522*/)/*<7519*/
}
return /*7523*/false/*<7523*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 7513');})(/*!*//*7515*//*7516*/$eq/*<7516*//*7515*/(/*7517*/name/*<7517*/)(/*7518*/name$qu/*<7518*/)/*<7515*/)/*<7513*/ } }/*<7501*/;

const tycon_$gts = /*7525*/function name_7525({0: name, 1: kind}) {
 return /*7533*/(function match_7533($target) {
if ($target.type === "star") {
return /*7538*/name/*<7538*/
}
return /*7540*/`[${/*7542*/name/*<7542*/} : ${/*7544*//*7545*/kind_$gts/*<7545*//*7544*/(/*7546*/kind/*<7546*/)/*<7544*/}]`/*<7540*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 7533');})(/*!*//*7535*/kind/*<7535*/)/*<7533*/ }/*<7525*/;

const nullSubst = /*7698*/nil/*<7698*/;

const array$eq = /*8148*/function name_8148(a) { return function name_8148(b) { return function name_8148(v$eq) { return /*8156*/(function match_8156($target) {
if ($target.type === ",") {
if ($target[0].type === "nil") {
if ($target[1].type === "nil") {
return /*8167*/true/*<8167*/
}
}
}
if ($target.type === ",") {
if ($target[0].type === "cons") {
{
let a0 = $target[0][0];
{
let a = $target[0][1];
if ($target[1].type === "cons") {
{
let b0 = $target[1][0];
{
let b = $target[1][1];
return /*8187*/(function match_8187($target) {
if ($target === true) {
return /*8193*//*8194*/array$eq/*<8194*//*8193*/(/*8195*/a/*<8195*/)(/*8196*/b/*<8196*/)(/*8197*/v$eq/*<8197*/)/*<8193*/
}
return /*8198*/false/*<8198*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 8187');})(/*!*//*8189*//*8190*/v$eq/*<8190*//*8189*/(/*8191*/a0/*<8191*/)(/*8192*/b0/*<8192*/)/*<8189*/)/*<8187*/
}
}
}
}
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 8156');})(/*!*//*8158*//*8159*/$co/*<8159*//*8158*/(/*8160*/a/*<8160*/)(/*8161*/b/*<8161*/)/*<8158*/)/*<8156*/ } } }/*<8148*/;

const just_pat = /*8703*/function name_8703(pat) { return /*8708*/(function match_8708($target) {
if ($target.type === "pany") {
return /*8714*//*8715*/none/*<8715*//*8714*//*<8714*/
}
if ($target.type === "pvar") {
{
let name = $target[0];
{
let l = $target[1];
return /*8720*//*8721*/some/*<8721*//*8720*/(/*8722*//*8723*/sanitize/*<8723*//*8722*/(/*8724*/name/*<8724*/)/*<8722*/)/*<8720*/
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
return /*8730*/(function match_8730($target) {
if ($target.type === ",") {
if ($target[1].type === "nil") {
return /*8785*/none/*<8785*/
}
}
if ($target.type === ",") {
{
let items = $target[1];
return /*8790*//*8791*/some/*<8791*//*8790*/(/*8792*/`{${/*8794*//*8795*/join/*<8795*//*8794*/(/*8796*/", "/*<8796*/)(/*8798*//*8799*/rev/*<8799*//*8798*/(/*8800*/items/*<8800*/)(/*8801*/nil/*<8801*/)/*<8798*/)/*<8794*/}}`/*<8792*/)/*<8790*/
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 8730');})(/*!*//*8732*//*8733*/foldl/*<8733*//*8732*/(/*8734*//*8735*/$co/*<8735*//*8734*/(/*8736*/0/*<8736*/)(/*8737*/nil/*<8737*/)/*<8734*/)(/*8738*/args/*<8738*/)(/*8739*/function name_8739({0: i, 1: res}) {
 return function name_8739(arg) { return /*8747*/(function match_8747($target) {
if ($target.type === "none") {
return /*8754*//*8755*/$co/*<8755*//*8754*/(/*8756*//*8757*/$pl/*<8757*//*8756*/(/*8758*/i/*<8758*/)(/*8759*/1/*<8759*/)/*<8756*/)(/*8760*/res/*<8760*/)/*<8754*/
}
if ($target.type === "some") {
{
let what = $target[0];
return /*8764*//*8765*/$co/*<8765*//*8764*/(/*8766*//*8767*/$pl/*<8767*//*8766*/(/*8768*/i/*<8768*/)(/*8769*/1/*<8769*/)/*<8766*/)(/*8770*//*8770*/cons/*<8770*//*8770*/(/*8771*/`${/*8773*//*8774*/its/*<8774*//*8773*/(/*8775*/i/*<8775*/)/*<8773*/}: ${/*8777*/what/*<8777*/}`/*<8771*/)(/*8780*/res/*<8780*/)/*<8770*/)/*<8764*/
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 8747');})(/*!*//*8749*//*8750*/just_pat/*<8750*//*8749*/(/*8751*/arg/*<8751*/)/*<8749*/)/*<8747*/ } }/*<8739*/)/*<8732*/)/*<8730*/
}
}
}
}
if ($target.type === "pstr") {
return /*8807*//*8808*/fatal/*<8808*//*8807*/(/*8809*/"Cant use string as a pattern in this location"/*<8809*/)/*<8807*/
}
if ($target.type === "pprim") {
return /*8815*//*8816*/fatal/*<8816*//*8815*/(/*8817*/"Cant use primitive as a pattern in this location"/*<8817*/)/*<8815*/
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 8708');})(/*!*//*8710*/pat/*<8710*/)/*<8708*/ }/*<8703*/;

const concat = /*8842*/function name_8842(lists) { return /*8848*/(function match_8848($target) {
if ($target.type === "nil") {
return /*8852*/nil/*<8852*/
}
if ($target.type === "cons") {
if ($target[0].type === "nil") {
{
let rest = $target[1];
return /*8883*//*8884*/concat/*<8884*//*8883*/(/*8885*/rest/*<8885*/)/*<8883*/
}
}
}
if ($target.type === "cons") {
if ($target[0].type === "cons") {
{
let one = $target[0][0];
{
let rest = $target[0][1];
{
let lists = $target[1];
return /*8867*//*8867*/cons/*<8867*//*8867*/(/*8868*/one/*<8868*/)(/*8864*//*8865*/concat/*<8865*//*8864*/(/*8866*//*8866*/cons/*<8866*//*8866*/(/*8872*/rest/*<8872*/)(/*8873*/lists/*<8873*/)/*<8866*/)/*<8864*/)/*<8867*/
}
}
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 8848');})(/*!*//*8850*/lists/*<8850*/)/*<8848*/ }/*<8842*/;

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

const cst$sllist = (v0) => (v1) => ({type: "cst/list", 0: v0, 1: v1});
const cst$slarray = (v0) => (v1) => ({type: "cst/array", 0: v0, 1: v1});
const cst$slspread = (v0) => (v1) => ({type: "cst/spread", 0: v0, 1: v1});
const cst$slidentifier = (v0) => (v1) => ({type: "cst/identifier", 0: v0, 1: v1});
const cst$slstring = (v0) => (v1) => (v2) => ({type: "cst/string", 0: v0, 1: v1, 2: v2});
const tvar = (v0) => (v1) => ({type: "tvar", 0: v0, 1: v1});
const tapp = (v0) => (v1) => (v2) => ({type: "tapp", 0: v0, 1: v1, 2: v2});
const tcon = (v0) => (v1) => ({type: "tcon", 0: v0, 1: v1});
const tgen = (v0) => (v1) => ({type: "tgen", 0: v0, 1: v1});
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

const tlist = /*6130*//*6131*/tcon/*<6131*//*6130*/(/*6132*//*6133*/tycon/*<6133*//*6132*/(/*6134*/"[]"/*<6134*/)(/*6136*//*6137*/kfun/*<6137*//*6136*/(/*6138*/star/*<6138*/)(/*6139*/star/*<6139*/)/*<6136*/)/*<6132*/)(/*6289*/-1/*<6289*/)/*<6130*/;

const tarrow = /*6144*//*6145*/tcon/*<6145*//*6144*/(/*6146*//*6147*/tycon/*<6147*//*6146*/(/*6148*/"(->)"/*<6148*/)(/*6150*//*6151*/kfun/*<6151*//*6150*/(/*6152*/star/*<6152*/)(/*6153*//*6154*/kfun/*<6154*//*6153*/(/*6155*/star/*<6155*/)(/*6156*/star/*<6156*/)/*<6153*/)/*<6150*/)/*<6146*/)(/*6290*/-1/*<6290*/)/*<6144*/;

const ttuple2 = /*6161*//*6162*/tcon/*<6162*//*6161*/(/*6163*//*6164*/tycon/*<6164*//*6163*/(/*6165*/"(,)"/*<6165*/)(/*6167*//*6168*/kfun/*<6168*//*6167*/(/*6169*/star/*<6169*/)(/*6170*//*6171*/kfun/*<6171*//*6170*/(/*6172*/star/*<6172*/)(/*6173*/star/*<6173*/)/*<6170*/)/*<6167*/)/*<6163*/)(/*6291*/-1/*<6291*/)/*<6161*/;

const tfn = /*6184*/function name_6184(a) { return function name_6184(b) { return /*6191*//*6192*/tapp/*<6192*//*6191*/(/*6193*//*6194*/tapp/*<6194*//*6193*/(/*6195*/tarrow/*<6195*/)(/*6196*/a/*<6196*/)(/*6294*/-1/*<6294*/)/*<6193*/)(/*6197*/b/*<6197*/)(/*6293*/-1/*<6293*/)/*<6191*/ } }/*<6184*/;

const mklist = /*6198*/function name_6198(t) { return /*6204*//*6205*/tapp/*<6205*//*6204*/(/*6206*/tlist/*<6206*/)(/*6207*/t/*<6207*/)(/*6295*/-1/*<6295*/)/*<6204*/ }/*<6198*/;

const mkpair = /*6208*/function name_6208(a) { return function name_6208(b) { return /*6215*//*6216*/tapp/*<6216*//*6215*/(/*6217*//*6218*/tapp/*<6218*//*6217*/(/*6219*/ttuple2/*<6219*/)(/*6220*/a/*<6220*/)(/*6296*/-1/*<6296*/)/*<6217*/)(/*6221*/b/*<6221*/)(/*6297*/-1/*<6297*/)/*<6215*/ } }/*<6208*/;

const tyvar$slkind = /*6222*/function name_6222({0: v, 1: k}) {
 return /*6232*/k/*<6232*/ }/*<6222*/;

const tycon$slkind = /*6233*/function name_6233({0: v, 1: k}) {
 return /*6243*/k/*<6243*/ }/*<6233*/;

const type_$gtfn = /*7124*/function name_7124(type) { return /*7129*/(function match_7129($target) {
if ($target.type === "tapp") {
if ($target[0].type === "tapp") {
if ($target[0][0].type === "tcon") {
if ($target[0][0][0].type === "tycon") {
if ($target[0][0][0][0] === "(->)"){
{
let arg = $target[0][1];
{
let result = $target[1];
return /*7148*/(function match_7148($target) {
if ($target.type === ",") {
{
let args = $target[0];
{
let result = $target[1];
return /*7157*//*7158*/$co/*<7158*//*7157*/(/*7159*//*7159*/cons/*<7159*//*7159*/(/*7160*/arg/*<7160*/)(/*7162*/args/*<7162*/)/*<7159*/)(/*7163*/result/*<7163*/)/*<7157*/
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 7148');})(/*!*//*7150*//*7151*/type_$gtfn/*<7151*//*7150*/(/*7152*/result/*<7152*/)/*<7150*/)/*<7148*/
}
}
}
}
}
}
}
return /*7165*//*7166*/$co/*<7166*//*7165*/(/*7167*/nil/*<7167*/)(/*7168*/type/*<7168*/)/*<7165*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 7129');})(/*!*//*7131*/type/*<7131*/)/*<7129*/ }/*<7124*/;

const unwrap_tapp = /*7170*/function name_7170(target) { return function name_7170(args) { return /*7176*/(function match_7176($target) {
if ($target.type === "tapp") {
{
let a = $target[0];
{
let b = $target[1];
return /*7184*//*7185*/unwrap_tapp/*<7185*//*7184*/(/*7186*/a/*<7186*/)(/*7187*//*7187*/cons/*<7187*//*7187*/(/*7188*/b/*<7188*/)(/*7190*/args/*<7190*/)/*<7187*/)/*<7184*/
}
}
}
return /*7192*//*7193*/$co/*<7193*//*7192*/(/*7194*/target/*<7194*/)(/*7195*/args/*<7195*/)/*<7192*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 7176');})(/*!*//*7178*/target/*<7178*/)/*<7176*/ } }/*<7170*/;

const type_$gts = /*7276*/function name_7276(type) { return /*7281*/(function match_7281($target) {
if ($target.type === "tvar") {
if ($target[0].type === "tyvar") {
{
let name = $target[0][0];
{
let kind = $target[0][1];
return /*7291*/`(var ${/*7293*/name/*<7293*/} ${/*7295*//*7296*/kind_$gts/*<7296*//*7295*/(/*7297*/kind/*<7297*/)/*<7295*/})`/*<7291*/
}
}
}
}
if ($target.type === "tapp") {
{
let target = $target[0];
{
let arg = $target[1];
return /*7304*/(function match_7304($target) {
if ($target.type === ",") {
if ($target[0].type === "nil") {
return /*7313*/(function let_7313() {const $target = /*7320*//*7321*/unwrap_tapp/*<7321*//*7320*/(/*7322*/target/*<7322*/)(/*7323*//*7323*/cons/*<7323*//*7323*/(/*7324*/arg/*<7324*/)(/*7323*/nil/*<7323*/)/*<7323*/)/*<7320*/;
if ($target.type === ",") {
{
let target = $target[0];
{
let args = $target[1];
return /*7325*/`(${/*7327*//*7328*/type_$gts/*<7328*//*7327*/(/*7329*/target/*<7329*/)/*<7327*/} ${/*7331*//*7332*/join/*<7332*//*7331*/(/*7333*/" "/*<7333*/)(/*7335*//*7336*/map/*<7336*//*7335*/(/*8210*/args/*<8210*/)(/*7337*/type_$gts/*<7337*/)/*<7335*/)/*<7331*/})`/*<7325*/
}
}
};
throw new Error('let pattern not matched 7316. ' + valueToString($target));})(/*!*/)/*<7313*/
}
}
if ($target.type === ",") {
{
let args = $target[0];
{
let result = $target[1];
return /*7344*/`(fn [${/*7346*//*7347*/join/*<7347*//*7346*/(/*7348*/" "/*<7348*/)(/*7350*//*7351*/map/*<7351*//*7350*/(/*8211*/args/*<8211*/)(/*7352*/type_$gts/*<7352*/)/*<7350*/)/*<7346*/}] ${/*7355*//*7356*/type_$gts/*<7356*//*7355*/(/*7357*/result/*<7357*/)/*<7355*/})`/*<7344*/
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 7304');})(/*!*//*7306*//*7307*/type_$gtfn/*<7307*//*7306*/(/*7308*/type/*<7308*/)/*<7306*/)/*<7304*/
}
}
}
if ($target.type === "tcon") {
if ($target[0].type === "tycon") {
if ($target[0][0] === "(,)"){
return /*7367*/","/*<7367*/
}
}
}
if ($target.type === "tcon") {
if ($target[0].type === "tycon") {
if ($target[0][0] === "[]"){
return /*7377*/"list"/*<7377*/
}
}
}
if ($target.type === "tcon") {
if ($target[0].type === "tycon") {
{
let name = $target[0][0];
return /*7386*/name/*<7386*/
}
}
}
if ($target.type === "tcon") {
{
let con = $target[0];
return /*7391*//*7392*/tycon_$gts/*<7392*//*7391*/(/*7393*/con/*<7393*/)/*<7391*/
}
}
if ($target.type === "tgen") {
{
let num = $target[0];
return /*7398*//*7399*/gen_name/*<7399*//*7398*/(/*7400*/num/*<7400*/)/*<7398*/
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 7281');})(/*!*//*7283*/type/*<7283*/)/*<7281*/ }/*<7276*/;

const type$eq = /*7423*/function name_7423(a) { return function name_7423(b) { return /*7429*/(function match_7429($target) {
if ($target.type === ",") {
if ($target[0].type === "tvar") {
{
let ty = $target[0][0];
if ($target[1].type === "tvar") {
{
let ty$qu = $target[1][0];
return /*7445*//*7446*/tyvar$eq/*<7446*//*7445*/(/*7447*/ty/*<7447*/)(/*7448*/ty$qu/*<7448*/)/*<7445*/
}
}
}
}
}
if ($target.type === ",") {
if ($target[0].type === "tapp") {
{
let target = $target[0][0];
{
let arg = $target[0][1];
if ($target[1].type === "tapp") {
{
let target$qu = $target[1][0];
{
let arg$qu = $target[1][1];
return /*7461*/(function match_7461($target) {
if ($target === true) {
return /*7467*//*7468*/type$eq/*<7468*//*7467*/(/*7469*/arg/*<7469*/)(/*7470*/arg$qu/*<7470*/)/*<7467*/
}
return /*7471*/false/*<7471*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 7461');})(/*!*//*7463*//*7464*/type$eq/*<7464*//*7463*/(/*7465*/target/*<7465*/)(/*7466*/target$qu/*<7466*/)/*<7463*/)/*<7461*/
}
}
}
}
}
}
}
if ($target.type === ",") {
if ($target[0].type === "tcon") {
{
let tycon = $target[0][0];
if ($target[1].type === "tcon") {
{
let tycon$qu = $target[1][0];
return /*7482*//*7483*/tycon$eq/*<7483*//*7482*/(/*7484*/tycon/*<7484*/)(/*7485*/tycon$qu/*<7485*/)/*<7482*/
}
}
}
}
}
if ($target.type === ",") {
if ($target[0].type === "tgen") {
{
let n = $target[0][0];
if ($target[1].type === "tgen") {
{
let n$qu = $target[1][0];
return /*7496*//*7497*/$eq/*<7497*//*7496*/(/*7498*/n/*<7498*/)(/*7499*/n$qu/*<7499*/)/*<7496*/
}
}
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 7429');})(/*!*//*7431*//*7432*/$co/*<7432*//*7431*/(/*7433*/a/*<7433*/)(/*7434*/b/*<7434*/)/*<7431*/)/*<7429*/ } }/*<7423*/;

const star_con = /*7549*/function name_7549(name) { return /*7554*//*7555*/tcon/*<7555*//*7554*/(/*7556*//*7557*/tycon/*<7557*//*7556*/(/*7558*/name/*<7558*/)(/*7559*/star/*<7559*/)/*<7556*/)(/*7560*/-1/*<7560*/)/*<7554*/ }/*<7549*/;

const type$slkind = /*7638*/function name_7638(type) { return /*7643*/(function match_7643($target) {
if ($target.type === "tcon") {
{
let tc = $target[0];
return /*7650*//*7651*/tycon$slkind/*<7651*//*7650*/(/*7652*/tc/*<7652*/)/*<7650*/
}
}
if ($target.type === "tvar") {
{
let u = $target[0];
return /*7657*//*7658*/tyvar$slkind/*<7658*//*7657*/(/*7659*/u/*<7659*/)/*<7657*/
}
}
if ($target.type === "tapp") {
{
let t = $target[0];
{
let l = $target[2];
return /*7665*/(function match_7665($target) {
if ($target.type === "kfun") {
{
let k = $target[1];
return /*7674*/k/*<7674*/
}
}
return /*7676*//*7677*/fatal/*<7677*//*7676*/(/*7678*/`Invalid type application ${/*7680*//*7681*/int_to_string/*<7681*//*7680*/(/*7682*/l/*<7682*/)/*<7680*/}`/*<7678*/)/*<7676*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 7665');})(/*!*//*7667*//*7668*/type$slkind/*<7668*//*7667*/(/*7669*/t/*<7669*/)/*<7667*/)/*<7665*/
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 7643');})(/*!*//*7645*/type/*<7645*/)/*<7643*/ }/*<7638*/;

/* type alias subst */
const type$slapply = /*7716*/function name_7716(subst) { return function name_7716(type) { return /*7722*/(function match_7722($target) {
if ($target.type === "tvar") {
{
let tyvar = $target[0];
return /*7729*/(function match_7729($target) {
if ($target.type === "none") {
return /*7737*/type/*<7737*/
}
if ($target.type === "some") {
{
let type = $target[0];
return /*7741*/type/*<7741*/
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 7729');})(/*!*//*7731*//*7732*/map$slget/*<7732*//*7731*/(/*7733*/subst/*<7733*/)(/*7734*/tyvar/*<7734*/)/*<7731*/)/*<7729*/
}
}
if ($target.type === "tapp") {
{
let target = $target[0];
{
let arg = $target[1];
{
let loc = $target[2];
return /*7747*//*7748*/tapp/*<7748*//*7747*/(/*7749*//*7750*/type$slapply/*<7750*//*7749*/(/*7751*/subst/*<7751*/)(/*7752*/target/*<7752*/)/*<7749*/)(/*7753*//*7754*/type$slapply/*<7754*//*7753*/(/*7755*/subst/*<7755*/)(/*7756*/arg/*<7756*/)/*<7753*/)(/*7757*/loc/*<7757*/)/*<7747*/
}
}
}
}
return /*7759*/type/*<7759*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 7722');})(/*!*//*7724*/type/*<7724*/)/*<7722*/ } }/*<7716*/;

const isin = (v0) => (v1) => ({type: "isin", 0: v0, 1: v1});
const $eq$gt = (v0) => (v1) => ({type: "=>", 0: v0, 1: v1});
const pred_$gts = /*8104*/function name_8104({0: name, 1: type}) {
 return /*8112*/`${/*8114*//*8115*/type_$gts/*<8115*//*8114*/(/*8116*/type/*<8116*/)/*<8114*/} ∈ ${/*8118*/name/*<8118*/}`/*<8112*/ }/*<8104*/;

const pred$eq = /*8121*/function name_8121({0: id, 1: type}) {
 return function name_8121({0: id$qu, 1: type$qu}) {
 return /*8133*/(function match_8133($target) {
if ($target === true) {
return /*8139*//*8140*/type$eq/*<8140*//*8139*/(/*8141*/type/*<8141*/)(/*8142*/type$qu/*<8142*/)/*<8139*/
}
return /*8143*/false/*<8143*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 8133');})(/*!*//*8135*//*8136*/$eq/*<8136*//*8135*/(/*8137*/id/*<8137*/)(/*8138*/id$qu/*<8138*/)/*<8135*/)/*<8133*/ } }/*<8121*/;

const parse_type = /*692*/function name_692(type) { return /*867*/(function match_867($target) {
if ($target.type === "cst/identifier") {
{
let id = $target[0];
{
let l = $target[1];
return /*874*//*875*/tcon/*<875*//*874*/(/*6366*//*876*/tycon/*<876*//*6366*/(/*6367*/id/*<6367*/)(/*6368*/star/*<6368*/)/*<6366*/)(/*3997*/l/*<3997*/)/*<874*/
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
return /*5588*//*5589*/foldl/*<5589*//*5588*/(/*5590*//*5591*/parse_type/*<5591*//*5590*/(/*5592*/body/*<5592*/)/*<5590*/)(/*5691*//*5593*/rev/*<5593*//*5691*/(/*5692*/args/*<5692*/)(/*5693*/nil/*<5693*/)/*<5691*/)(/*5594*/function name_5594(body) { return function name_5594(arg) { return /*5600*//*5601*/tapp/*<5601*//*5600*/(/*5602*//*5603*/tapp/*<5603*//*5602*/(/*5604*//*5605*/tcon/*<5605*//*5604*/(/*6360*//*6361*/tycon/*<6361*//*6360*/(/*5606*/"->"/*<5606*/)(/*6362*//*6363*/kfun/*<6363*//*6362*/(/*6364*/star/*<6364*/)(/*6365*/star/*<6365*/)/*<6362*/)/*<6360*/)(/*5608*/-1/*<5608*/)/*<5604*/)(/*5609*//*5610*/parse_type/*<5610*//*5609*/(/*5611*/arg/*<5611*/)/*<5609*/)(/*5612*/-1/*<5612*/)/*<5602*/)(/*5613*/body/*<5613*/)(/*5614*/-1/*<5614*/)/*<5600*/ } }/*<5594*/)/*<5588*/
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

const tunit = /*6052*//*6053*/star_con/*<6053*//*6052*/(/*6056*/"()"/*<6056*/)/*<6052*/;

const tchar = /*6063*//*6064*/star_con/*<6064*//*6063*/(/*6067*/"char"/*<6067*/)/*<6063*/;

const tint = /*6074*//*6075*/star_con/*<6075*//*6074*/(/*6078*/"int"/*<6078*/)/*<6074*/;

const tinteger = /*6085*//*6086*/star_con/*<6086*//*6085*/(/*6089*/"integer"/*<6089*/)/*<6085*/;

const tfloat = /*6096*//*6097*/star_con/*<6097*//*6096*/(/*6100*/"float"/*<6100*/)/*<6096*/;

const tdouble = /*6122*//*6123*/star_con/*<6123*//*6122*/(/*6124*/"double"/*<6124*/)/*<6122*/;

const tstring = /*6178*//*6179*/tapp/*<6179*//*6178*/(/*6180*/tlist/*<6180*/)(/*6181*/tchar/*<6181*/)(/*6292*/-1/*<6292*/)/*<6178*/;

/* type alias class */
/* type alias inst */
const forall = (v0) => (v1) => ({type: "forall", 0: v0, 1: v1});
const to_scheme = /*7955*/function name_7955(t) { return /*7960*//*7961*/forall/*<7961*//*7960*/(/*7962*/nil/*<7962*/)(/*7963*//*7964*/$eq$gt/*<7964*//*7963*/(/*7965*/nil/*<7965*/)(/*7966*/t/*<7966*/)/*<7963*/)/*<7960*/ }/*<7955*/;

const $ex$gt$ex = (v0) => (v1) => ({type: "!>!", 0: v0, 1: v1});
const qual$eq = /*8066*/function name_8066({0: preds, 1: t}) {
 return function name_8066({0: preds$qu, 1: t$qu}) {
 return function name_8066(t$eq) { return /*8079*/(function match_8079($target) {
if ($target === true) {
return /*8086*//*8087*/t$eq/*<8087*//*8086*/(/*8088*/t/*<8088*/)(/*8089*/t$qu/*<8089*/)/*<8086*/
}
return /*8090*/false/*<8090*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 8079');})(/*!*//*8081*//*8082*/array$eq/*<8082*//*8081*/(/*8083*/preds/*<8083*/)(/*8084*/preds$qu/*<8084*/)(/*8085*/pred$eq/*<8085*/)/*<8081*/)/*<8079*/ } } }/*<8066*/;

/* type alias alt */

const eprim = (v0) => (v1) => ({type: "eprim", 0: v0, 1: v1});
const estr = (v0) => (v1) => (v2) => ({type: "estr", 0: v0, 1: v1, 2: v2});
const evar = (v0) => (v1) => ({type: "evar", 0: v0, 1: v1});
const equot = (v0) => (v1) => ({type: "equot", 0: v0, 1: v1});
const equot$slstmt = (v0) => (v1) => ({type: "equot/stmt", 0: v0, 1: v1});
const equot$slpat = (v0) => (v1) => ({type: "equot/pat", 0: v0, 1: v1});
const equot$sltype = (v0) => (v1) => ({type: "equot/type", 0: v0, 1: v1});
const equotquot = (v0) => (v1) => ({type: "equotquot", 0: v0, 1: v1});
const elambda = (v0) => (v1) => (v2) => ({type: "elambda", 0: v0, 1: v1, 2: v2});
const eapp = (v0) => (v1) => (v2) => ({type: "eapp", 0: v0, 1: v1, 2: v2});
const elet = (v0) => (v1) => (v2) => ({type: "elet", 0: v0, 1: v1, 2: v2});
const ematch = (v0) => (v1) => (v2) => ({type: "ematch", 0: v0, 1: v1, 2: v2});

const sdeftype = (v0) => (v1) => (v2) => (v3) => (v4) => ({type: "sdeftype", 0: v0, 1: v1, 2: v2, 3: v3, 4: v4});
const stypealias = (v0) => (v1) => (v2) => (v3) => (v4) => ({type: "stypealias", 0: v0, 1: v1, 2: v2, 3: v3, 4: v4});
const sdef = (v0) => (v1) => (v2) => (v3) => ({type: "sdef", 0: v0, 1: v1, 2: v2, 3: v3});
const sexpr = (v0) => (v1) => ({type: "sexpr", 0: v0, 1: v1});

/* type alias bindgroup */

/* type alias expl */

/* type alias impl */
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
throw new Error('failed to match ' + jsonify($target) + '. Loc: 5024');})(/*!*//*5026*/arg/*<5026*/)/*<5024*/ }/*<5020*/)/*<5017*/)(/*1436*//*1437*/map/*<1437*//*1436*/(/*1438*/items/*<1438*/)(/*1439*/function name_1439(constr) { return /*1443*/(function match_1443($target) {
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
return /*1457*//*1458*/$co$co$co/*<1458*//*1457*/(/*1459*/name/*<1459*/)(/*3982*/ni/*<3982*/)(/*1460*//*1461*/map/*<1461*//*1460*/(/*1462*/args/*<1462*/)(/*1463*/parse_type/*<1463*/)/*<1460*/)(/*3984*/l/*<3984*/)/*<1457*/
}
}
}
}
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 1443');})(/*!*//*1445*/constr/*<1445*/)/*<1443*/ }/*<1439*/)/*<1436*/)(/*3981*/l/*<3981*/)/*<1433*/ } } } } }/*<1390*/;

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

const parse_and_compile = (v0) => (v1) => (v2) => (v3) => ({type: "parse-and-compile", 0: v0, 1: v1, 2: v2, 3: v3});
const assump_$gts = /*7562*/function name_7562({0: name, 1: {0: kinds, 1: {0: preds, 1: type}}}) {


 return /*7576*/`${/*7578*/name/*<7578*/}: ${/*7580*/(function match_7580($target) {
if ($target.type === "nil") {
return /*7584*/""/*<7584*/
}
return /*7587*/`${/*7589*//*7590*/join/*<7590*//*7589*/(/*7591*/"; "/*<7591*/)(/*7593*//*7594*/mapi/*<7594*//*7593*/(/*8212*/0/*<8212*/)(/*8213*/kinds/*<8213*/)(/*7595*/function name_7595(i) { return function name_7595(kind) { return /*7600*/`${/*7602*//*7603*/gen_name/*<7603*//*7602*/(/*7604*/i/*<7604*/)/*<7602*/} ${/*7606*//*7607*/kind_$gts/*<7607*//*7606*/(/*7608*/kind/*<7608*/)/*<7606*/}`/*<7600*/ } }/*<7595*/)/*<7593*/)/*<7589*/}; `/*<7587*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 7580');})(/*!*//*7582*/kinds/*<7582*/)/*<7580*/}${/*7614*/(function match_7614($target) {
if ($target.type === "nil") {
return /*7618*/""/*<7618*/
}
return /*7621*/`${/*7623*//*7624*/join/*<7624*//*7623*/(/*7625*/"; "/*<7625*/)(/*7627*//*7628*/map/*<7628*//*7627*/(/*8215*/preds/*<8215*/)(/*7629*/pred_$gts/*<7629*/)/*<7627*/)/*<7623*/}; `/*<7621*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 7614');})(/*!*//*7616*/preds/*<7616*/)/*<7614*/}${/*7633*//*7634*/type_$gts/*<7634*//*7633*/(/*7635*/type/*<7635*/)/*<7633*/}`/*<7576*/ }/*<7562*/;

const scheme$eq = /*7837*/function name_7837({0: kinds, 1: qual}) {
 return function name_7837({0: kinds$qu, 1: qual$qu}) {
 return /*7849*/(function match_7849($target) {
if ($target === true) {
return /*7856*//*7857*/qual$eq/*<7857*//*7856*/(/*7858*/qual/*<7858*/)(/*7859*/qual$qu/*<7859*/)(/*7860*/type$eq/*<7860*/)/*<7856*/
}
return /*7861*/false/*<7861*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 7849');})(/*!*//*7851*//*7852*/array$eq/*<7852*//*7851*/(/*7853*/kinds/*<7853*/)(/*7854*/kinds$qu/*<7854*/)(/*7855*/kind$eq/*<7855*/)/*<7851*/)/*<7849*/ } }/*<7837*/;

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
return /*6666*/(function match_6666($target) {
if ($target.type === "some") {
{
let float = $target[0];
return /*6674*//*6676*/eprim/*<6676*//*6674*/(/*6677*//*6678*/pfloat/*<6678*//*6677*/(/*6679*/float/*<6679*/)(/*6680*/l/*<6680*/)/*<6677*/)(/*6681*/l/*<6681*/)/*<6674*/
}
}
if ($target.type === "none") {
return /*1068*//*1069*/evar/*<1069*//*1068*/(/*1071*/id/*<1071*/)(/*3537*/l/*<3537*/)/*<1068*/
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 6666');})(/*!*//*6668*//*6669*/string_to_float/*<6669*//*6668*/(/*6670*/id/*<6670*/)/*<6668*/)/*<6666*/
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
return /*3070*//*3079*/equot/*<3079*//*3070*/(/*3080*//*3081*/parse_expr/*<3081*//*3080*/(/*3082*/body/*<3082*/)/*<3080*/)(/*3548*/l/*<3548*/)/*<3070*/
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
return /*3091*//*3101*/equotquot/*<3101*//*3091*/(/*3102*/body/*<3102*/)(/*3549*/l/*<3549*/)/*<3091*/
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
return /*5114*//*5122*/equot$slstmt/*<5122*//*5114*/(/*5123*//*5124*/parse_stmt/*<5124*//*5123*/(/*5125*/body/*<5125*/)/*<5123*/)(/*5126*/l/*<5126*/)/*<5114*/
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
return /*5292*//*5302*/equot$sltype/*<5302*//*5292*/(/*5303*//*5305*/parse_type/*<5305*//*5303*/(/*5306*/body/*<5306*/)/*<5303*/)(/*5307*/l/*<5307*/)/*<5292*/
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
return /*5319*//*5320*/equot$slpat/*<5320*//*5319*/(/*5321*//*5322*/parse_pat/*<5322*//*5321*/(/*5323*/body/*<5323*/)/*<5321*/)(/*5324*/l/*<5324*/)/*<5319*/
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
return /*1073*//*1213*/foldr/*<1213*//*1073*/(/*1214*//*1215*/parse_expr/*<1215*//*1214*/(/*1216*/body/*<1216*/)/*<1214*/)(/*1217*/args/*<1217*/)(/*1218*/function name_1218(body) { return function name_1218(arg) { return /*1917*//*1918*/elambda/*<1918*//*1917*/(/*1919*//*8226*/parse_pat/*<8226*//*1919*/(/*8227*/arg/*<8227*/)/*<1919*/)(/*1921*/body/*<1921*/)(/*3570*/b/*<3570*/)/*<1917*/ } }/*<1218*/)/*<1073*/
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
return /*1628*//*1643*/foldr/*<1643*//*1628*/(/*1644*//*1645*/parse_expr/*<1645*//*1644*/(/*1646*/body/*<1646*/)/*<1644*/)(/*1647*//*1648*/pairs/*<1648*//*1647*/(/*1649*/inits/*<1649*/)/*<1647*/)(/*1650*/function name_1650(body) { return function name_1650(init) { return /*1656*/(function let_1656() {const $target = /*1663*/init/*<1663*/;
if ($target.type === ",") {
{
let pat = $target[0];
{
let value = $target[1];
return /*8241*/(function match_8241($target) {
if ($target.type === "cst/identifier") {
{
let name = $target[0];
{
let l = $target[1];
return /*8248*//*8251*/elet/*<8251*//*8248*/(/*8252*//*8253*/$co/*<8253*//*8252*/(/*8254*/nil/*<8254*/)(/*8255*//*8255*/cons/*<8255*//*8255*/(/*8256*//*8256*/cons/*<8256*//*8256*/(/*8257*//*8258*/$co/*<8258*//*8257*/(/*8259*/name/*<8259*/)(/*8260*//*8260*/cons/*<8260*//*8260*/(/*8261*//*8262*/$co/*<8262*//*8261*/(/*8263*/nil/*<8263*/)(/*8264*//*8265*/parse_expr/*<8265*//*8264*/(/*8266*/value/*<8266*/)/*<8264*/)/*<8261*/)(/*8260*/nil/*<8260*/)/*<8260*/)/*<8257*/)(/*8256*/nil/*<8256*/)/*<8256*/)(/*8255*/nil/*<8255*/)/*<8255*/)/*<8252*/)(/*8267*/body/*<8267*/)(/*8268*/l/*<8268*/)/*<8248*/
}
}
}
return /*1664*//*1665*/elet/*<1665*//*1664*/(/*8229*//*8230*/$co/*<8230*//*8229*/(/*8231*/nil/*<8231*/)(/*8232*//*8232*/cons/*<8232*//*8232*/(/*8228*//*8228*/cons/*<8228*//*8228*/(/*8236*//*8237*/$co/*<8237*//*8236*/(/*8238*/"it"/*<8238*/)(/*8240*//*8240*/cons/*<8240*//*8240*/(/*8233*//*8234*/$co/*<8234*//*8233*/(/*8235*//*8235*/cons/*<8235*//*8235*/(/*4324*//*4325*/parse_pat/*<4325*//*4324*/(/*4326*/pat/*<4326*/)/*<4324*/)(/*8235*/nil/*<8235*/)/*<8235*/)(/*1667*//*1668*/parse_expr/*<1668*//*1667*/(/*1669*/value/*<1669*/)/*<1667*/)/*<8233*/)(/*8240*/nil/*<8240*/)/*<8240*/)/*<8236*/)(/*8228*/nil/*<8228*/)/*<8228*/)(/*8232*/nil/*<8232*/)/*<8232*/)/*<8229*/)(/*1714*/body/*<1714*/)(/*3810*/l/*<3810*/)/*<1664*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 8241');})(/*!*//*8243*/pat/*<8243*/)/*<8241*/
}
}
};
throw new Error('let pattern not matched 1659. ' + valueToString($target));})(/*!*/)/*<1656*/ } }/*<1650*/)/*<1628*/
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
return /*1575*//*1576*/foldl/*<1576*//*1575*/(/*1577*//*1578*/parse_expr/*<1578*//*1577*/(/*1579*/target/*<1579*/)/*<1577*/)(/*1580*/args/*<1580*/)(/*1581*/function name_1581(target) { return function name_1581(arg) { return /*1586*//*1587*/eapp/*<1587*//*1586*/(/*1588*/target/*<1588*/)(/*1589*//*1590*/parse_expr/*<1590*//*1589*/(/*1591*/arg/*<1591*/)/*<1589*/)(/*3745*/l/*<3745*/)/*<1586*/ } }/*<1581*/)/*<1575*/
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
return /*3443*//*3444*/eapp/*<3444*//*3443*/(/*3445*//*3446*/eapp/*<3446*//*3445*/(/*3450*//*3451*/evar/*<3451*//*3450*/(/*3452*/"cons"/*<3452*/)(/*3677*/l/*<3677*/)/*<3450*/)(/*3454*//*3455*/parse_expr/*<3455*//*3454*/(/*3456*/one/*<3456*/)/*<3454*/)(/*3678*/l/*<3678*/)/*<3445*/)(/*3457*//*3458*/parse_array/*<3458*//*3457*/(/*3459*/rest/*<3459*/)(/*3676*/l/*<3676*/)/*<3457*/)(/*3679*/l/*<3679*/)/*<3443*/
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 3422');})(/*!*//*3424*/args/*<3424*/)/*<3422*/ } }/*<3416*/;

const compile = /*2368*/function name_2368(expr) { return function name_2368(trace) { return /*4905*/(function let_4905() {const $target = /*4912*//*4913*/expr_loc/*<4913*//*4912*/(/*4914*/expr/*<4914*/)/*<4912*/;
{
let loc = $target;
return /*4769*//*4770*/trace_wrap/*<4770*//*4769*/(/*4773*/loc/*<4773*/)(/*4776*/trace/*<4776*/)(/*2634*/(function match_2634($target) {
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
if ($target.type === "pfloat") {
{
let float = $target[0];
return /*6625*//*6626*/jsonify/*<6626*//*6625*/(/*6627*/float/*<6627*/)/*<6625*/
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
return /*2787*//*2788*/jsonify/*<2788*//*2787*/(/*2789*/inner/*<2789*/)/*<2787*/
}
}
}
if ($target.type === "equot/stmt") {
{
let inner = $target[0];
{
let l = $target[1];
return /*5456*//*5457*/jsonify/*<5457*//*5456*/(/*5458*/inner/*<5458*/)/*<5456*/
}
}
}
if ($target.type === "equot/type") {
{
let inner = $target[0];
{
let l = $target[1];
return /*5463*//*5464*/jsonify/*<5464*//*5463*/(/*5465*/inner/*<5465*/)/*<5463*/
}
}
}
if ($target.type === "equot/pat") {
{
let inner = $target[0];
{
let l = $target[1];
return /*5470*//*5471*/jsonify/*<5471*//*5470*/(/*5472*/inner/*<5472*/)/*<5470*/
}
}
}
if ($target.type === "equotquot") {
{
let inner = $target[0];
{
let l = $target[1];
return /*5781*//*5785*/jsonify/*<5785*//*5781*/(/*5786*/inner/*<5786*/)/*<5781*/
}
}
}
if ($target.type === "elambda") {
{
let pat = $target[0];
{
let body = $target[1];
{
let l = $target[2];
return /*8587*/`function name_${/*8589*//*8590*/its/*<8590*//*8589*/(/*8591*/l/*<8591*/)/*<8589*/}(${/*8593*//*8594*/orr/*<8594*//*8593*/(/*8595*/"_"/*<8595*/)(/*8597*//*8598*/just_pat/*<8598*//*8597*/(/*8599*/pat/*<8599*/)/*<8597*/)/*<8593*/}) { return ${/*8634*//*8635*/compile/*<8635*//*8634*/(/*8636*/body/*<8636*/)(/*8637*/trace/*<8637*/)/*<8634*/} }`/*<8587*/
}
}
}
}
if ($target.type === "elet") {
if ($target[0].type === ",") {
if ($target[0][0].type === "nil") {
{
let inferred = $target[0][1];
{
let body = $target[1];
{
let l = $target[2];
return /*8820*//*8821*/foldl/*<8821*//*8820*/(/*8822*//*8823*/compile/*<8823*//*8822*/(/*8824*/body/*<8824*/)(/*8825*/trace/*<8825*/)/*<8822*/)(/*8826*//*8827*/concat/*<8827*//*8826*/(/*8828*/inferred/*<8828*/)/*<8826*/)(/*8829*/function name_8829(body) { return function name_8829({0: name, 1: {0: {1: init}}}) {
 return /*8645*/`(function let_${/*8647*//*8648*/its/*<8648*//*8647*/(/*8649*/l/*<8649*/)/*<8647*/}() {const ${/*8916*//*8914*/sanitize/*<8914*//*8916*/(/*8917*/name/*<8917*/)/*<8916*/} = ${/*8651*//*8652*/compile/*<8652*//*8651*/(/*8653*/init/*<8653*/)(/*8654*/trace/*<8654*/)/*<8651*/};\n${/*8908*//*8909*/`return ${/*8912*/body/*<8912*/}`/*<8909*//*8908*//*<8908*/};\nthrow new Error('let pattern not matched. ' + valueToString(\$target));\n})()`/*<8645*/ } }/*<8829*/)/*<8820*/
}
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
return /*4918*/`(${/*4920*//*4922*/compile/*<4922*//*4920*/(/*4923*/fn/*<4923*/)(/*4924*/trace/*<4924*/)/*<4920*/})(${/*4929*//*4925*/compile/*<4925*//*4929*/(/*4930*/arg/*<4930*/)(/*4931*/trace/*<4931*/)/*<4929*/})`/*<4918*/
}
return /*4932*/`${/*4934*//*4936*/compile/*<4936*//*4934*/(/*4937*/fn/*<4937*/)(/*4938*/trace/*<4938*/)/*<4934*/}(${/*4939*//*4941*/compile/*<4941*//*4939*/(/*4942*/arg/*<4942*/)(/*4943*/trace/*<4943*/)/*<4939*/})`/*<4932*/
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
throw new Error('let pattern not matched 2914. ' + valueToString($target));})(/*!*/)/*<2911*/ }/*<2907*/)/*<2903*/)/*<2896*/}\nthrow new Error('failed to match ' + jsonify(\$target) + '. Loc: ${/*5966*//*4315*/its/*<4315*//*5966*/(/*5967*/l/*<5967*/)/*<5966*/}');\n})(${/*2926*//*2928*/compile/*<2928*//*2926*/(/*2929*/target/*<2929*/)(/*4688*/trace/*<4688*/)/*<2926*/})`/*<2894*/
}
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 2634');})(/*!*//*2636*/expr/*<2636*/)/*<2634*/)/*<4769*/
};
throw new Error('let pattern not matched 4911. ' + valueToString($target));})(/*!*/)/*<4905*/ } }/*<2368*/;

const run = /*4208*/function name_4208(v) { return /*4215*//*4217*/eval/*<4217*//*4215*/(/*4218*//*4219*/compile/*<4219*//*4218*/(/*4220*//*4221*/parse_expr/*<4221*//*4220*/(/*4222*/v/*<4222*/)/*<4220*/)(/*4676*/map$slnil/*<4676*/)/*<4218*/)/*<4215*/ }/*<4208*/;

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

return /*6653*//*6656*//*6657*/eval/*<6657*//*6656*/(/*6658*/"({0: parse_stmt,  1: parse_expr, 2: compile_stmt, 3: compile}) => ({\ntype: 'fns', parse_stmt, parse_expr, compile_stmt, compile})"/*<6658*/)/*<6656*//*6653*/(/*6660*//*6661*/parse_and_compile/*<6661*//*6660*/(/*6662*/parse_stmt/*<6662*/)(/*6663*/parse_expr/*<6663*/)(/*6664*/compile_stmt/*<6664*/)(/*6665*/compile/*<6665*/)/*<6660*/)/*<6653*/