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
const its = /*5948*/int_to_string/*<5948*/;

const value = ({type: "value"});
const type = ({type: "type"});
const dot = /*7091*/function name_7091(a) { return function name_7091(b) { return function name_7091(c) { return /*7098*//*7099*/a/*<7099*//*7098*/(/*7100*//*7101*/b/*<7101*//*7100*/(/*7102*/c/*<7102*/)/*<7100*/)/*<7098*/ } } }/*<7091*/;

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

const j$slint = (v0) => (v1) => ({type: "j/int", 0: v0, 1: v1});
const j$slfloat = (v0) => (v1) => ({type: "j/float", 0: v0, 1: v1});
const j$slbool = (v0) => (v1) => ({type: "j/bool", 0: v0, 1: v1});
const j$slspread = (v0) => ({type: "j/spread", 0: v0});
const left = (v0) => ({type: "left", 0: v0});
const right = (v0) => ({type: "right", 0: v0});
const j$slcompile_prim = /*10424*/function name_10424(ctx) { return function name_10424(prim) { return /*10430*/(function match_10430($target) {
if ($target.type === "j/int") {
{
let int = $target[0];
{
let l = $target[1];
return /*10437*//*10438*/int_to_string/*<10438*//*10437*/(/*10439*/int/*<10439*/)/*<10437*/
}
}
}
if ($target.type === "j/float") {
{
let float = $target[0];
{
let l = $target[1];
return /*10444*//*10445*/jsonify/*<10445*//*10444*/(/*10446*/float/*<10446*/)/*<10444*/
}
}
}
if ($target.type === "j/bool") {
{
let bool = $target[0];
{
let l = $target[1];
return /*10456*/(function match_10456($target) {
if ($target === true) {
return /*10459*/"true"/*<10459*/
}
return /*10461*/"false"/*<10461*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 10456');})(/*!*//*10458*/bool/*<10458*/)/*<10456*/
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 10430');})(/*!*//*10432*/prim/*<10432*/)/*<10430*/ } }/*<10424*/;

const maybe_paren = /*10513*/function name_10513(text) { return function name_10513(wrap) { return /*10519*/(function match_10519($target) {
if ($target === true) {
return /*10522*/`(${/*10524*/text/*<10524*/})`/*<10522*/
}
return /*10526*/text/*<10526*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 10519');})(/*!*//*10521*/wrap/*<10521*/)/*<10519*/ } }/*<10513*/;

const $co$co0 = /*10955*/function name_10955(x) { return /*10961*/(function let_10961() {const $target = /*10971*/x/*<10971*/;
if ($target.type === ",,") {
{
let a = $target[0];
return /*10972*/a/*<10972*/
}
};
throw new Error('let pattern not matched 10966. ' + valueToString($target));})(/*!*/)/*<10961*/ }/*<10955*/;

const $co$co1 = /*10973*/function name_10973(x) { return /*10980*/(function let_10980() {const $target = /*10988*/x/*<10988*/;
if ($target.type === ",,") {
{
let a = $target[1];
return /*10989*/a/*<10989*/
}
};
throw new Error('let pattern not matched 10983. ' + valueToString($target));})(/*!*/)/*<10980*/ }/*<10973*/;

const $co$co2 = /*10990*/function name_10990(x) { return /*10997*/(function let_10997() {const $target = /*11005*/x/*<11005*/;
if ($target.type === ",,") {
{
let a = $target[2];
return /*11006*/a/*<11006*/
}
};
throw new Error('let pattern not matched 11000. ' + valueToString($target));})(/*!*/)/*<10997*/ }/*<10990*/;

const $co$co$co2 = /*11013*/function name_11013(x) { return /*11019*/(function let_11019() {const $target = /*11028*/x/*<11028*/;
if ($target.type === ",,,") {
{
let x = $target[2];
return /*11029*/x/*<11029*/
}
};
throw new Error('let pattern not matched 11022. ' + valueToString($target));})(/*!*/)/*<11019*/ }/*<11013*/;

const map_opt = /*13573*/function name_13573(v) { return function name_13573(f) { return /*13580*/(function match_13580($target) {
if ($target.type === "none") {
return /*13585*//*13595*/none/*<13595*//*13585*//*<13585*/
}
if ($target.type === "some") {
{
let v = $target[0];
return /*13590*//*13591*/some/*<13591*//*13590*/(/*13592*//*13593*/f/*<13593*//*13592*/(/*13594*/v/*<13594*/)/*<13592*/)/*<13590*/
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 13580');})(/*!*//*13582*/v/*<13582*/)/*<13580*/ } }/*<13573*/;

const apply_until = /*13723*/function name_13723(f) { return function name_13723(v) { return /*13730*/(function match_13730($target) {
if ($target.type === "some") {
{
let v = $target[0];
return /*13738*//*13739*/apply_until/*<13739*//*13738*/(/*13740*/f/*<13740*/)(/*13741*/v/*<13741*/)/*<13738*/
}
}
if ($target.type === "none") {
return /*13744*/v/*<13744*/
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 13730');})(/*!*//*13732*//*13733*/f/*<13733*//*13732*/(/*13734*/v/*<13734*/)/*<13732*/)/*<13730*/ } }/*<13723*/;

const fold$sloption = /*14914*/function name_14914(inner) { return function name_14914(init) { return function name_14914(value) { return /*14922*/(function match_14922($target) {
if ($target.type === "none") {
return /*14928*/init/*<14928*/
}
if ($target.type === "some") {
{
let v = $target[0];
return /*14932*//*14933*/inner/*<14933*//*14932*/(/*14934*/init/*<14934*/)(/*14935*/v/*<14935*/)/*<14932*/
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 14922');})(/*!*//*14924*/value/*<14924*/)/*<14922*/ } } }/*<14914*/;

const fold$sleither = /*15141*/function name_15141(fleft) { return function name_15141(fright) { return function name_15141(init) { return function name_15141(value) { return /*15152*/(function match_15152($target) {
if ($target.type === "left") {
{
let l = $target[0];
return /*15159*//*15160*/fleft/*<15160*//*15159*/(/*15161*/init/*<15161*/)(/*15163*/l/*<15163*/)/*<15159*/
}
}
if ($target.type === "right") {
{
let r = $target[0];
return /*15167*//*15168*/fright/*<15168*//*15167*/(/*15169*/init/*<15169*/)(/*15170*/r/*<15170*/)/*<15167*/
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 15152');})(/*!*//*15154*/value/*<15154*/)/*<15152*/ } } } }/*<15141*/;

const fold$slget = /*15184*/function name_15184(get) { return function name_15184(f) { return function name_15184(init) { return function name_15184(value) { return /*15192*//*15194*/f/*<15194*//*15192*/(/*15195*/init/*<15195*/)(/*15198*//*15200*/get/*<15200*//*15198*/(/*15201*/value/*<15201*/)/*<15198*/)/*<15192*/ } } } }/*<15184*/;

const spread$slinner = /*15296*/function name_15296({0: inner}) {
 return /*15308*/inner/*<15308*/ }/*<15296*/;

const nop = /*15339*/function name_15339(a) { return function name_15339(b) { return /*15347*/a/*<15347*/ } }/*<15339*/;

const force_opt = /*15403*/function name_15403(x) { return /*15409*/(function match_15409($target) {
if ($target.type === "none") {
return /*15414*//*15415*/fatal/*<15415*//*15414*/(/*15416*/"empty"/*<15416*/)/*<15414*/
}
if ($target.type === "some") {
{
let x = $target[0];
return /*15421*/x/*<15421*/
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 15409');})(/*!*//*15411*/x/*<15411*/)/*<15409*/ }/*<15403*/;

const map$co$co0 = /*15840*/function name_15840(f) { return function name_15840({0: a, 1: b, 2: c}) {


 return /*15851*//*15852*/$co$co/*<15852*//*15851*/(/*15853*//*15854*/f/*<15854*//*15853*/(/*15855*/a/*<15855*/)/*<15853*/)(/*15856*/b/*<15856*/)(/*15857*/c/*<15857*/)/*<15851*/ } }/*<15840*/;

const map$co1 = /*15888*/function name_15888(f) { return function name_15888({0: a, 1: b}) {

 return /*15898*//*15899*/$co/*<15899*//*15898*/(/*15900*/a/*<15900*/)(/*15901*//*15902*/f/*<15902*//*15901*/(/*15903*/b/*<15903*/)/*<15901*/)/*<15898*/ } }/*<15888*/;

/* type alias parse-error */
const StateT = (v0) => ({type: "StateT", 0: v0});
const run_$gt = /*16475*/function name_16475({0: f}) {
 return function name_16475(state) { return /*16483*/(function let_16483() {const $target = /*16490*//*16491*/f/*<16491*//*16490*/(/*16492*/state/*<16492*/)/*<16490*/;
if ($target.type === ",") {
{
let result = $target[1];
return /*16493*/result/*<16493*/
}
};
throw new Error('let pattern not matched 16486. ' + valueToString($target));})(/*!*/)/*<16483*/ } }/*<16475*/;

const state_f = /*16495*/function name_16495({0: f}) {
 return /*16502*/f/*<16502*/ }/*<16495*/;

const $gt$gt$eq = /*16504*/function name_16504({0: f}) {
 return function name_16504(next) { return /*16512*//*16513*/StateT/*<16513*//*16512*/(/*16514*/function name_16514(state) { return /*16518*/(function let_16518() {const $target = /*16520*//*16521*/f/*<16521*//*16520*/(/*16522*/state/*<16522*/)/*<16520*/;
if ($target.type === ",") {
{
let state = $target[0];
{
let value = $target[1];
return /*16541*//*16542*//*16543*/state_f/*<16543*//*16542*/(/*16544*//*16545*/next/*<16545*//*16544*/(/*16546*/value/*<16546*/)/*<16544*/)/*<16542*//*16541*/(/*16547*/state/*<16547*/)/*<16541*/
}
}
};
throw new Error('let pattern not matched 16941. ' + valueToString($target));})(/*!*/)/*<16518*/ }/*<16514*/)/*<16512*/ } }/*<16504*/;

const $lt_ = /*16549*/function name_16549(x) { return /*16554*//*16555*/StateT/*<16555*//*16554*/(/*16556*/function name_16556(state) { return /*16560*//*16561*/$co/*<16561*//*16560*/(/*16562*/state/*<16562*/)(/*16565*/x/*<16565*/)/*<16560*/ }/*<16556*/)/*<16554*/ }/*<16549*/;

const $lt_state = /*16588*//*16589*/StateT/*<16589*//*16588*/(/*16590*/function name_16590(state) { return /*16594*//*16595*/$co/*<16595*//*16594*/(/*16596*/state/*<16596*/)(/*16597*/state/*<16597*/)/*<16594*/ }/*<16590*/)/*<16588*/;

const state_$gt = /*16601*/function name_16601(v) { return /*16606*//*16607*/StateT/*<16607*//*16606*/(/*16608*/function name_16608(old) { return /*16612*//*16613*/$co/*<16613*//*16612*/(/*16614*/v/*<16614*/)(/*16615*/old/*<16615*/)/*<16612*/ }/*<16608*/)/*<16606*/ }/*<16601*/;

const id = /*16829*/function name_16829(x) { return /*16835*/x/*<16835*/ }/*<16829*/;

const nil = ({type: "nil"});
const cons = (v0) => (v1) => ({type: "cons", 0: v0, 1: v1});
const pany = (v0) => ({type: "pany", 0: v0});
const pvar = (v0) => (v1) => ({type: "pvar", 0: v0, 1: v1});
const pcon = (v0) => (v1) => (v2) => (v3) => ({type: "pcon", 0: v0, 1: v1, 2: v2, 3: v3});
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
const j$slpvar = (v0) => (v1) => ({type: "j/pvar", 0: v0, 1: v1});
const j$slparray = (v0) => (v1) => (v2) => ({type: "j/parray", 0: v0, 1: v1, 2: v2});
const j$slpobj = (v0) => (v1) => (v2) => ({type: "j/pobj", 0: v0, 1: v1, 2: v2});
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
let l = $target[3];
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
let nl = $target[1];
{
let args = $target[2];
{
let l = $target[3];
return /*6782*//*6783*/foldl/*<6783*//*6782*/(/*6784*/set$slnil/*<6784*/)(/*6785*/args/*<6785*/)(/*6786*/function name_6786(bound) { return function name_6786(arg) { return /*6791*//*6792*/set$slmerge/*<6792*//*6791*/(/*6793*/bound/*<6793*/)(/*6794*//*6795*/pat_names/*<6795*//*6794*/(/*6796*/arg/*<6796*/)/*<6794*/)/*<6791*/ } }/*<6786*/)/*<6782*/
}
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
let nl = $target[1];
{
let args = $target[2];
{
let l = $target[3];
return /*6821*//*6822*/bag$sland/*<6822*//*6821*/(/*6823*//*6824*/one/*<6824*//*6823*/(/*6825*//*6826*/$co$co/*<6826*//*6825*/(/*6827*/name/*<6827*/)(/*6828*//*6829*/value/*<6829*//*6828*//*<6828*/)(/*6830*/nl/*<6830*/)/*<6825*/)/*<6823*/)(/*6831*//*6832*/many/*<6832*//*6831*/(/*6833*//*6834*/map/*<6834*//*6833*/(/*6835*/args/*<6835*/)(/*6836*/pat_externals/*<6836*/)/*<6833*/)/*<6831*/)/*<6821*/
}
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
let nl = $target[1];
{
let args = $target[2];
{
let l = $target[3];
return /*8211*//*8212*/foldl/*<8212*//*8211*/(/*8213*//*16358*/one/*<16358*//*8213*/(/*16359*//*16360*/$co/*<16360*//*16359*/(/*16361*/name/*<16361*/)(/*16362*/nl/*<16362*/)/*<16359*/)/*<8213*/)(/*8214*/args/*<8214*/)(/*8215*/function name_8215(bound) { return function name_8215(arg) { return /*8220*//*8221*/bag$sland/*<8221*//*8220*/(/*8222*/bound/*<8222*/)(/*8223*//*8224*/pat_names_loc/*<8224*//*8223*/(/*8225*/arg/*<8225*/)/*<8223*/)/*<8220*/ } }/*<8215*/)/*<8211*/
}
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

const fold_type = /*9835*/function name_9835(init) { return function name_9835(type) { return function name_9835(f) { return /*9843*/(function let_9843() {const $target = /*9848*//*9849*/f/*<9849*//*9848*/(/*9850*/init/*<9850*/)(/*9851*/type/*<9851*/)/*<9848*/;
{
let v = $target;
return /*9852*/(function match_9852($target) {
if ($target.type === "tapp") {
{
let target = $target[0];
{
let arg = $target[1];
return /*9865*//*9872*/fold_type/*<9872*//*9865*/(/*9873*//*9874*/fold_type/*<9874*//*9873*/(/*9875*/v/*<9875*/)(/*9876*/target/*<9876*/)(/*9877*/f/*<9877*/)/*<9873*/)(/*9878*/arg/*<9878*/)(/*9879*/f/*<9879*/)/*<9865*/
}
}
}
return /*9871*/v/*<9871*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 9852');})(/*!*//*9854*/type/*<9854*/)/*<9852*/
};
throw new Error('let pattern not matched 9847. ' + valueToString($target));})(/*!*/)/*<9843*/ } } }/*<9835*/;

const type_type = /*9880*/function name_9880(type) { return /*9887*/(function match_9887($target) {
if ($target.type === "tapp") {
return /*9895*/"app"/*<9895*/
}
if ($target.type === "tvar") {
return /*9901*/"var"/*<9901*/
}
if ($target.type === "tcon") {
return /*9907*/"con"/*<9907*/
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 9887');})(/*!*//*9889*/type/*<9889*/)/*<9887*/ }/*<9880*/;

const type_size = /*9911*/function name_9911(type) { return /*9917*//*9918*/fold_type/*<9918*//*9917*/(/*9919*/0/*<9919*/)(/*9921*/type/*<9921*/)(/*9922*/function name_9922(v) { return function name_9922(_) { return /*9928*//*9929*/$pl/*<9929*//*9928*/(/*9930*/1/*<9930*/)(/*9931*/v/*<9931*/)/*<9928*/ } }/*<9922*/)/*<9917*/ }/*<9911*/;

const pat_arg = /*10588*/function name_10588(ctx) { return function name_10588(pat) { return /*10594*/(function match_10594($target) {
if ($target.type === "j/pvar") {
{
let name = $target[0];
{
let l = $target[1];
return /*10601*//*10602*/sanitize/*<10602*//*10601*/(/*10603*/name/*<10603*/)/*<10601*/
}
}
}
if ($target.type === "j/parray") {
{
let items = $target[0];
{
let spread = $target[1];
{
let l = $target[2];
return /*10609*/`[${/*10611*//*10612*/join/*<10612*//*10611*/(/*10613*/", "/*<10613*/)(/*10615*//*10616*/map/*<10616*//*10615*/(/*10617*/items/*<10617*/)(/*10618*//*10619*/pat_arg/*<10619*//*10618*/(/*10620*/ctx/*<10620*/)/*<10618*/)/*<10615*/)/*<10611*/}${/*10622*/(function match_10622($target) {
if ($target.type === "some") {
{
let s = $target[0];
return /*10628*/`...${/*10630*//*10631*/pat_arg/*<10631*//*10630*/(/*10632*/ctx/*<10632*/)(/*10633*/s/*<10633*/)/*<10630*/}`/*<10628*/
}
}
if ($target.type === "none") {
return /*10637*/""/*<10637*/
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 10622');})(/*!*//*10624*/spread/*<10624*/)/*<10622*/}]`/*<10609*/
}
}
}
}
if ($target.type === "j/pobj") {
{
let items = $target[0];
{
let spread = $target[1];
{
let l = $target[2];
return /*10645*/`{${/*10647*//*10648*/join/*<10648*//*10647*/(/*10649*/", "/*<10649*/)(/*10651*//*10652*/map/*<10652*//*10651*/(/*10653*/items/*<10653*/)(/*10654*/function name_10654(pair) { return /*10661*/`\"${/*12835*//*12836*/escape_string/*<12836*//*12835*/(/*10663*//*11033*/fst/*<11033*//*10663*/(/*11034*/pair/*<11034*/)/*<10663*/)/*<12835*/}\": ${/*10665*//*10666*/pat_arg/*<10666*//*10665*/(/*10667*/ctx/*<10667*/)(/*10668*//*11036*/snd/*<11036*//*10668*/(/*11037*/pair/*<11037*/)/*<10668*/)/*<10665*/}`/*<10661*/ }/*<10654*/)/*<10651*/)/*<10647*/}}${/*10671*/(function match_10671($target) {
if ($target.type === "some") {
{
let s = $target[0];
return /*10677*/`...${/*10679*//*10680*/pat_arg/*<10680*//*10679*/(/*10681*/ctx/*<10681*/)(/*10682*/s/*<10682*/)/*<10679*/}`/*<10677*/
}
}
if ($target.type === "none") {
return /*10686*/""/*<10686*/
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 10671');})(/*!*//*10673*/spread/*<10673*/)/*<10671*/}`/*<10645*/
}
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 10594');})(/*!*//*10596*/pat/*<10596*/)/*<10594*/ } }/*<10588*/;

const pat_$gtj$slpat = /*11337*/function name_11337(pat) { return /*11343*/(function match_11343($target) {
if ($target.type === "pany") {
{
let l = $target[0];
return /*11369*/none/*<11369*/
}
}
if ($target.type === "pvar") {
{
let name = $target[0];
{
let l = $target[1];
return /*11371*//*11372*/some/*<11372*//*11371*/(/*11376*//*11373*/j$slpvar/*<11373*//*11376*/(/*11374*/name/*<11374*/)(/*11375*/l/*<11375*/)/*<11376*/)/*<11371*/
}
}
}
if ($target.type === "pcon") {
{
let name = $target[0];
{
let il = $target[1];
{
let args = $target[2];
{
let l = $target[3];
return /*11386*/(function match_11386($target) {
if ($target.type === ",") {
if ($target[1].type === "nil") {
return /*11446*/none/*<11446*/
}
}
if ($target.type === ",") {
{
let items = $target[1];
return /*11451*//*11452*/some/*<11452*//*11451*/(/*11453*//*11464*/j$slpobj/*<11464*//*11453*/(/*11465*/items/*<11465*/)(/*11466*/none/*<11466*/)(/*11467*/l/*<11467*/)/*<11453*/)/*<11451*/
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 11386');})(/*!*//*11388*//*11389*/foldl/*<11389*//*11388*/(/*11390*//*11391*/$co/*<11391*//*11390*/(/*11392*/0/*<11392*/)(/*11393*/nil/*<11393*/)/*<11390*/)(/*11394*/args/*<11394*/)(/*11395*/function name_11395(result) { return function name_11395(arg) { return /*11400*/(function let_11400() {const $target = /*11407*/result/*<11407*/;
if ($target.type === ",") {
{
let i = $target[0];
{
let res = $target[1];
return /*11408*/(function match_11408($target) {
if ($target.type === "none") {
return /*11415*//*11416*/$co/*<11416*//*11415*/(/*11417*//*11418*/$pl/*<11418*//*11417*/(/*11419*/i/*<11419*/)(/*11420*/1/*<11420*/)/*<11417*/)(/*11421*/res/*<11421*/)/*<11415*/
}
if ($target.type === "some") {
{
let what = $target[0];
return /*11425*//*11426*/$co/*<11426*//*11425*/(/*11427*//*11428*/$pl/*<11428*//*11427*/(/*11429*/i/*<11429*/)(/*11430*/1/*<11430*/)/*<11427*/)(/*11431*//*11431*/cons/*<11431*//*11431*/(/*11432*//*11468*/$co/*<11468*//*11432*/(/*11469*//*11470*/its/*<11470*//*11469*/(/*11471*/i/*<11471*/)/*<11469*/)(/*11472*/what/*<11472*/)/*<11432*/)(/*11441*/res/*<11441*/)/*<11431*/)/*<11425*/
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 11408');})(/*!*//*11410*//*11411*/pat_$gtj$slpat/*<11411*//*11410*/(/*11412*/arg/*<11412*/)/*<11410*/)/*<11408*/
}
}
};
throw new Error('let pattern not matched 11403. ' + valueToString($target));})(/*!*/)/*<11400*/ } }/*<11395*/)/*<11388*/)/*<11386*/
}
}
}
}
}
if ($target.type === "pstr") {
{
let string = $target[0];
{
let l = $target[1];
return /*11378*//*11380*/fatal/*<11380*//*11378*/(/*11381*/"Cant use string as pattern"/*<11381*/)/*<11378*/
}
}
}
if ($target.type === "pprim") {
{
let prim = $target[0];
{
let l = $target[1];
return /*11379*//*11383*/fatal/*<11383*//*11379*/(/*11384*/"Cant use prim as pattern"/*<11384*/)/*<11379*/
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 11343');})(/*!*//*11345*/pat/*<11345*/)/*<11343*/ }/*<11337*/;

const concat = /*12410*/function name_12410(lists) { return /*12416*/(function match_12416($target) {
if ($target.type === "nil") {
return /*12420*/nil/*<12420*/
}
if ($target.type === "cons") {
if ($target[0].type === "nil") {
{
let rest = $target[1];
return /*12427*//*12428*/concat/*<12428*//*12427*/(/*12429*/rest/*<12429*/)/*<12427*/
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
let other = $target[1];
return /*12438*//*12438*/cons/*<12438*//*12438*/(/*12440*/one/*<12440*/)(/*12441*//*12445*/concat/*<12445*//*12441*/(/*12446*//*12446*/cons/*<12446*//*12446*/(/*12447*/rest/*<12447*/)(/*12448*/other/*<12448*/)/*<12446*/)/*<12441*/)/*<12438*/
}
}
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 12416');})(/*!*//*12418*/lists/*<12418*/)/*<12416*/ }/*<12410*/;

const bops = /*12573*//*12573*/cons/*<12573*//*12573*/(/*12575*/"-"/*<12575*/)(/*12573*//*12573*/cons/*<12573*//*12573*/(/*12577*/"+"/*<12577*/)(/*12573*//*12573*/cons/*<12573*//*12573*/(/*12581*/">"/*<12581*/)(/*12573*//*12573*/cons/*<12573*//*12573*/(/*12583*/"<"/*<12583*/)(/*12573*//*12573*/cons/*<12573*//*12573*/(/*12585*/"=="/*<12585*/)(/*12573*//*12573*/cons/*<12573*//*12573*/(/*12587*/"==="/*<12587*/)(/*12573*//*12573*/cons/*<12573*//*12573*/(/*12589*/"<="/*<12589*/)(/*12573*//*12573*/cons/*<12573*//*12573*/(/*12592*/">="/*<12592*/)(/*12573*//*12573*/cons/*<12573*//*12573*/(/*12594*/"*"/*<12594*/)(/*12573*/nil/*<12573*/)/*<12573*/)/*<12573*/)/*<12573*/)/*<12573*/)/*<12573*/)/*<12573*/)/*<12573*/)/*<12573*/)/*<12573*/;

const contains = /*12628*/function name_12628(lst) { return function name_12628(item) { return /*12637*/(function match_12637($target) {
if ($target.type === "nil") {
return /*12641*/false/*<12641*/
}
if ($target.type === "cons") {
{
let one = $target[0];
{
let rest = $target[1];
return /*12648*/(function match_12648($target) {
if ($target === true) {
return /*12654*/true/*<12654*/
}
return /*12655*//*12656*/contains/*<12656*//*12655*/(/*12657*/rest/*<12657*/)(/*12658*/item/*<12658*/)/*<12655*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 12648');})(/*!*//*12650*//*12651*/$eq/*<12651*//*12650*/(/*12652*/one/*<12652*/)(/*12653*/item/*<12653*/)/*<12650*/)/*<12648*/
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 12637');})(/*!*//*12639*/lst/*<12639*/)/*<12637*/ } }/*<12628*/;

const len = /*14078*/function name_14078(x) { return /*14084*/(function match_14084($target) {
if ($target.type === "nil") {
return /*14088*/0/*<14088*/
}
if ($target.type === "cons") {
{
let one = $target[0];
{
let rest = $target[1];
return /*14095*//*14096*/$pl/*<14096*//*14095*/(/*14097*/1/*<14097*/)(/*14098*//*14099*/len/*<14099*//*14098*/(/*14100*/rest/*<14100*/)/*<14098*/)/*<14095*/
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 14084');})(/*!*//*14086*/x/*<14086*/)/*<14084*/ }/*<14078*/;

const pat_names$slj = /*14659*/function name_14659(pat) { return /*14667*/(function match_14667($target) {
if ($target.type === "j/pvar") {
{
let name = $target[0];
return /*14675*//*14676*/one/*<14676*//*14675*/(/*14677*/name/*<14677*/)/*<14675*/
}
}
if ($target.type === "j/pobj") {
{
let items = $target[0];
{
let spread = $target[1];
return /*14682*//*14683*/foldl/*<14683*//*14682*/(/*14722*/(function match_14722($target) {
if ($target.type === "none") {
return /*14727*//*14728*/empty/*<14728*//*14727*//*<14727*/
}
if ($target.type === "some") {
{
let pat = $target[0];
return /*14684*//*14720*/pat_names$slj/*<14720*//*14684*/(/*14721*/pat/*<14721*/)/*<14684*/
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 14722');})(/*!*//*14724*/spread/*<14724*/)/*<14722*/)(/*14685*/items/*<14685*/)(/*14686*/function name_14686(bag) { return function name_14686({0: name, 1: item}) {

 return /*14711*//*14712*/bag$sland/*<14712*//*14711*/(/*14713*/bag/*<14713*/)(/*14691*//*14718*/pat_names$slj/*<14718*//*14691*/(/*14719*/item/*<14719*/)/*<14691*/)/*<14711*/ } }/*<14686*/)/*<14682*/
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 14667');})(/*!*//*14669*/pat/*<14669*/)/*<14667*/ }/*<14659*/;

const zip = /*15960*/function name_15960(one) { return function name_15960(two) { return /*15967*/(function match_15967($target) {
if ($target.type === ",") {
if ($target[0].type === "nil") {
if ($target[1].type === "nil") {
return /*15977*/nil/*<15977*/
}
}
}
if ($target.type === ",") {
if ($target[0].type === "cons") {
{
let o = $target[0][0];
{
let one = $target[0][1];
if ($target[1].type === "cons") {
{
let t = $target[1][0];
{
let two = $target[1][1];
return /*15996*//*15996*/cons/*<15996*//*15996*/(/*15997*//*15998*/$co/*<15998*//*15997*/(/*15999*/o/*<15999*/)(/*16000*/t/*<16000*/)/*<15997*/)(/*16001*//*16005*/zip/*<16005*//*16001*/(/*16006*/one/*<16006*/)(/*16007*/two/*<16007*/)/*<16001*/)/*<15996*/
}
}
}
}
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 15967');})(/*!*//*15969*//*15970*/$co/*<15970*//*15969*/(/*15971*/one/*<15971*/)(/*15972*/two/*<15972*/)/*<15969*/)/*<15967*/ } }/*<15960*/;

const $lt_err = /*16567*/function name_16567(e) { return function name_16567(v) { return /*16572*//*16573*/StateT/*<16573*//*16572*/(/*16574*/function name_16574(state) { return /*16578*//*16579*/$co/*<16579*//*16578*/(/*16931*//*16931*/cons/*<16931*//*16931*/(/*16932*/e/*<16932*/)(/*16580*/state/*<16580*/)/*<16931*/)(/*16581*/v/*<16581*/)/*<16578*/ }/*<16574*/)/*<16572*/ } }/*<16567*/;

const map_$gt = /*16619*/function name_16619(f) { return function name_16619(arr) { return /*16625*/(function match_16625($target) {
if ($target.type === "nil") {
return /*16629*//*16630*/$lt_/*<16630*//*16629*/(/*16631*/nil/*<16631*/)/*<16629*/
}
if ($target.type === "cons") {
{
let one = $target[0];
{
let rest = $target[1];
return /*16636*//*16637*/$gt$gt$eq/*<16637*//*16636*/(/*16640*//*16641*/f/*<16641*//*16640*/(/*16642*/one/*<16642*/)/*<16640*/)(/*16636*/function name_16636(one) { return /*16636*//*16637*/$gt$gt$eq/*<16637*//*16636*/(/*16644*//*16645*/map_$gt/*<16645*//*16644*/(/*16646*/f/*<16646*/)(/*16647*/rest/*<16647*/)/*<16644*/)(/*16636*/function name_16636(rest) { return /*16648*//*16649*/$lt_/*<16649*//*16648*/(/*16650*//*16650*/cons/*<16650*//*16650*/(/*16651*/one/*<16651*/)(/*16653*/rest/*<16653*/)/*<16650*/)/*<16648*/ }/*<16636*/)/*<16636*/ }/*<16636*/)/*<16636*/
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 16625');})(/*!*//*16627*/arr/*<16627*/)/*<16625*/ } }/*<16619*/;

const do_$gt = /*16655*/function name_16655(f) { return function name_16655(arr) { return /*16661*/(function match_16661($target) {
if ($target.type === "nil") {
return /*16665*//*16666*/$lt_/*<16666*//*16665*/(/*16667*/$unit/*<16667*/)/*<16665*/
}
if ($target.type === "cons") {
{
let one = $target[0];
{
let rest = $target[1];
return /*16672*//*16673*/$gt$gt$eq/*<16673*//*16672*/(/*16676*//*16677*/f/*<16677*//*16676*/(/*16678*/one/*<16678*/)/*<16676*/)(/*16672*/function name_16672(_) { return /*16672*//*16673*/$gt$gt$eq/*<16673*//*16672*/(/*16680*//*16681*/do_$gt/*<16681*//*16680*/(/*16682*/f/*<16682*/)(/*16683*/rest/*<16683*/)/*<16680*/)(/*16672*/function name_16672(_) { return /*16684*//*16685*/$lt_/*<16685*//*16684*/(/*16686*/$unit/*<16686*/)/*<16684*/ }/*<16672*/)/*<16672*/ }/*<16672*/)/*<16672*/
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 16661');})(/*!*//*16663*/arr/*<16663*/)/*<16661*/ } }/*<16655*/;

const seq_$gt = /*16688*/function name_16688(arr) { return /*16693*/(function match_16693($target) {
if ($target.type === "nil") {
return /*16697*//*16698*/$lt_/*<16698*//*16697*/(/*16699*/nil/*<16699*/)/*<16697*/
}
if ($target.type === "cons") {
{
let one = $target[0];
{
let rest = $target[1];
return /*16704*//*16705*/$gt$gt$eq/*<16705*//*16704*/(/*16708*/one/*<16708*/)(/*16704*/function name_16704(one) { return /*16704*//*16705*/$gt$gt$eq/*<16705*//*16704*/(/*16710*//*16711*/seq_$gt/*<16711*//*16710*/(/*16712*/rest/*<16712*/)/*<16710*/)(/*16704*/function name_16704(rest) { return /*16713*//*16714*/$lt_/*<16714*//*16713*/(/*16715*//*16715*/cons/*<16715*//*16715*/(/*16716*/one/*<16716*/)(/*16718*/rest/*<16718*/)/*<16715*/)/*<16713*/ }/*<16704*/)/*<16704*/ }/*<16704*/)/*<16704*/
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 16693');})(/*!*//*16695*/arr/*<16695*/)/*<16693*/ }/*<16688*/;

const foldl_$gt = /*16766*/function name_16766(init) { return function name_16766(values) { return function name_16766(f) { return /*16773*/(function match_16773($target) {
if ($target.type === "nil") {
return /*16777*//*16778*/$lt_/*<16778*//*16777*/(/*16779*/init/*<16779*/)/*<16777*/
}
if ($target.type === "cons") {
{
let one = $target[0];
{
let rest = $target[1];
return /*16784*//*16785*/$gt$gt$eq/*<16785*//*16784*/(/*16788*//*16789*/f/*<16789*//*16788*/(/*16790*/init/*<16790*/)(/*16791*/one/*<16791*/)/*<16788*/)(/*16784*/function name_16784(one) { return /*16792*//*16793*/foldl_$gt/*<16793*//*16792*/(/*16794*/one/*<16794*/)(/*16795*/rest/*<16795*/)(/*16796*/f/*<16796*/)/*<16792*/ }/*<16784*/)/*<16784*/
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 16773');})(/*!*//*16775*/values/*<16775*/)/*<16773*/ } } }/*<16766*/;

const foldr_$gt = /*16798*/function name_16798(init) { return function name_16798(values) { return function name_16798(f) { return /*16805*/(function match_16805($target) {
if ($target.type === "nil") {
return /*16809*//*16810*/$lt_/*<16810*//*16809*/(/*16811*/init/*<16811*/)/*<16809*/
}
if ($target.type === "cons") {
{
let one = $target[0];
{
let rest = $target[1];
return /*16816*//*16817*/$gt$gt$eq/*<16817*//*16816*/(/*16820*//*16821*/foldr_$gt/*<16821*//*16820*/(/*16822*/init/*<16822*/)(/*16823*/rest/*<16823*/)(/*16824*/f/*<16824*/)/*<16820*/)(/*16816*/function name_16816(init) { return /*16825*//*16826*/f/*<16826*//*16825*/(/*16827*/init/*<16827*/)(/*16828*/one/*<16828*/)/*<16825*/ }/*<16816*/)/*<16816*/
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 16805');})(/*!*//*16807*/values/*<16807*/)/*<16805*/ } } }/*<16798*/;

const state$slnil = /*16913*/nil/*<16913*/;

const cst_loc = /*17099*/function name_17099(cst) { return /*17105*/(function match_17105($target) {
if ($target.type === "cst/identifier") {
{
let l = $target[1];
return /*17112*/l/*<17112*/
}
}
if ($target.type === "cst/list") {
{
let l = $target[1];
return /*17145*/l/*<17145*/
}
}
if ($target.type === "cst/array") {
{
let l = $target[1];
return /*17146*/l/*<17146*/
}
}
if ($target.type === "cst/spread") {
{
let l = $target[1];
return /*17147*/l/*<17147*/
}
}
if ($target.type === "cst/string") {
{
let l = $target[2];
return /*17149*/l/*<17149*/
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 17105');})(/*!*//*17107*/cst/*<17107*/)/*<17105*/ }/*<17099*/;

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
return /*17924*//*17925*/$lt_/*<17925*//*17924*/(/*1747*//*1748*/pany/*<1748*//*1747*/(/*3641*/l/*<3641*/)/*<1747*/)/*<17924*/
}
}
}
if ($target.type === "cst/identifier") {
if ($target[0] === "true"){
{
let l = $target[1];
return /*17927*//*17928*/$lt_/*<17928*//*17927*/(/*4247*//*4248*/pprim/*<4248*//*4247*/(/*4249*//*4250*/pbool/*<4250*//*4249*/(/*4251*/true/*<4251*/)(/*4252*/l/*<4252*/)/*<4249*/)(/*4253*/l/*<4253*/)/*<4247*/)/*<17927*/
}
}
}
if ($target.type === "cst/identifier") {
if ($target[0] === "false"){
{
let l = $target[1];
return /*17929*//*17930*/$lt_/*<17930*//*17929*/(/*5847*//*5848*/pprim/*<5848*//*5847*/(/*5849*//*5850*/pbool/*<5850*//*5849*/(/*5851*/false/*<5851*/)(/*5852*/l/*<5852*/)/*<5849*/)(/*5853*/l/*<5853*/)/*<5847*/)/*<17929*/
}
}
}
if ($target.type === "cst/string") {
{
let first = $target[0];
if ($target[1].type === "nil") {
{
let l = $target[2];
return /*17931*//*17932*/$lt_/*<17932*//*17931*/(/*3285*//*3302*/pstr/*<3302*//*3285*/(/*3303*/first/*<3303*/)(/*3642*/l/*<3642*/)/*<3285*/)/*<17931*/
}
}
}
}
if ($target.type === "cst/identifier") {
{
let id = $target[0];
{
let l = $target[1];
return /*17933*//*17934*/$lt_/*<17934*//*17933*/(/*3019*/(function match_3019($target) {
if ($target.type === "some") {
{
let int = $target[0];
return /*3035*//*3036*/pprim/*<3036*//*3035*/(/*3037*//*3038*/pint/*<3038*//*3037*/(/*3039*/int/*<3039*/)(/*3643*/l/*<3643*/)/*<3037*/)(/*3644*/l/*<3644*/)/*<3035*/
}
}
return /*1737*//*1738*/pvar/*<1738*//*1737*/(/*1739*/id/*<1739*/)(/*3645*/l/*<3645*/)/*<1737*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 3019');})(/*!*//*3026*//*3027*/string_to_int/*<3027*//*3026*/(/*3031*/id/*<3031*/)/*<3026*/)/*<3019*/)/*<17933*/
}
}
}
if ($target.type === "cst/array") {
if ($target[0].type === "nil") {
{
let l = $target[1];
return /*17935*//*17936*/$lt_/*<17936*//*17935*/(/*3341*//*3348*/pcon/*<3348*//*3341*/(/*3349*/"nil"/*<3349*/)(/*16348*/-1/*<16348*/)(/*3351*/nil/*<3351*/)(/*3646*/l/*<3646*/)/*<3341*/)/*<17935*/
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
return /*17941*//*17944*/$gt$gt$eq/*<17944*//*17941*/(/*17947*//*17948*/parse_pat/*<17948*//*17947*/(/*17949*/one/*<17949*/)/*<17947*/)(/*17941*/function name_17941(one) { return /*17941*//*17944*/$gt$gt$eq/*<17944*//*17941*/(/*3369*//*3370*/parse_pat/*<3370*//*3369*/(/*3371*//*3372*/cst$slarray/*<3372*//*3371*/(/*3373*/rest/*<3373*/)(/*3374*/l/*<3374*/)/*<3371*/)/*<3369*/)(/*17941*/function name_17941(rest) { return /*17937*//*17938*/$lt_/*<17938*//*17937*/(/*3354*//*3362*/pcon/*<3362*//*3354*/(/*3363*/"cons"/*<3363*/)(/*16349*/-1/*<16349*/)(/*3365*//*3365*/cons/*<3365*//*3365*/(/*3366*/one/*<3366*/)(/*3365*//*3365*/cons/*<3365*//*3365*/(/*17952*/rest/*<17952*/)(/*3365*/nil/*<3365*/)/*<3365*/)/*<3365*/)(/*4263*/l/*<4263*/)/*<3354*/)/*<17937*/ }/*<17941*/)/*<17941*/ }/*<17941*/)/*<17941*/
}
}
}
}
}
if ($target.type === "cst/list") {
if ($target[0].type === "nil") {
{
let l = $target[1];
return /*17939*//*17940*/$lt_/*<17940*//*17939*/(/*9168*//*9169*/pcon/*<9169*//*9168*/(/*9170*/"()"/*<9170*/)(/*16350*/-1/*<16350*/)(/*9173*/nil/*<9173*/)(/*9172*/l/*<9172*/)/*<9168*/)/*<17939*/
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
let il = $target[0][0][1];
{
let rest = $target[0][1];
{
let l = $target[1];
return /*17953*//*17954*/$gt$gt$eq/*<17954*//*17953*/(/*1819*//*1820*/map_$gt/*<1820*//*1819*/(/*1822*/parse_pat/*<1822*/)(/*17958*/rest/*<17958*/)/*<1819*/)(/*17953*/function name_17953(rest) { return /*17959*//*17960*/$lt_/*<17960*//*17959*/(/*1816*//*1817*/pcon/*<1817*//*1816*/(/*1818*/name/*<1818*/)(/*16351*/il/*<16351*/)(/*17957*/rest/*<17957*/)(/*3647*/l/*<3647*/)/*<1816*/)/*<17959*/ }/*<17953*/)/*<17953*/
}
}
}
}
}
}
}
return /*3160*//*3161*/$lt_err/*<3161*//*3160*/(/*17961*//*17962*/$co/*<17962*//*17961*/(/*17963*//*17964*/cst_loc/*<17964*//*17963*/(/*17965*/pat/*<17965*/)/*<17963*/)(/*3162*/`parse-pat mo match ${/*3164*//*3166*/valueToString/*<3166*//*3164*/(/*3167*/pat/*<3167*/)/*<3164*/}`/*<3162*/)/*<17961*/)(/*17966*//*17967*/pany/*<17967*//*17966*/(/*17969*//*17970*/cst_loc/*<17970*//*17969*/(/*17971*/pat/*<17971*/)/*<17969*/)/*<17966*/)/*<3160*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 1727');})(/*!*//*1730*/pat/*<1730*/)/*<1727*/ }/*<1721*/;


const parse_pat_tuple = /*7709*/function name_7709(items) { return function name_7709(il) { return function name_7709(l) { return /*7715*/(function match_7715($target) {
if ($target.type === "nil") {
return /*17972*//*17973*/$lt_/*<17973*//*17972*/(/*7722*//*7723*/pcon/*<7723*//*7722*/(/*7726*/","/*<7726*/)(/*16365*/-1/*<16365*/)(/*7728*/nil/*<7728*/)(/*7729*/il/*<7729*/)/*<7722*/)/*<17972*/
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
return /*17974*//*17975*/$gt$gt$eq/*<17975*//*17974*/(/*17978*//*17979*/parse_pat/*<17979*//*17978*/(/*17980*/one/*<17980*/)/*<17978*/)(/*17974*/function name_17974(one) { return /*17974*//*17975*/$gt$gt$eq/*<17975*//*17974*/(/*7750*//*7751*/parse_pat_tuple/*<7751*//*7750*/(/*7752*/rest/*<7752*/)(/*7753*/il/*<7753*/)(/*7754*/l/*<7754*/)/*<7750*/)(/*17974*/function name_17974(rest) { return /*17984*//*17985*/$lt_/*<17985*//*17984*/(/*7742*//*7743*/pcon/*<7743*//*7742*/(/*7744*/","/*<7744*/)(/*16366*/-1/*<16366*/)(/*7746*//*7746*/cons/*<7746*//*7746*/(/*17982*/one/*<17982*/)(/*7746*//*7746*/cons/*<7746*//*7746*/(/*17983*/rest/*<17983*/)(/*7746*/nil/*<7746*/)/*<7746*/)/*<7746*/)(/*7755*/l/*<7755*/)/*<7742*/)/*<17984*/ }/*<17974*/)/*<17974*/ }/*<17974*/)/*<17974*/
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 7715');})(/*!*//*7720*/items/*<7720*/)/*<7715*/ } } }/*<7709*/;

const j$slapp = (v0) => (v1) => (v2) => ({type: "j/app", 0: v0, 1: v1, 2: v2});
const j$slbin = (v0) => (v1) => (v2) => (v3) => ({type: "j/bin", 0: v0, 1: v1, 2: v2, 3: v3});
const j$slun = (v0) => (v1) => (v2) => ({type: "j/un", 0: v0, 1: v1, 2: v2});
const j$sllambda = (v0) => (v1) => (v2) => ({type: "j/lambda", 0: v0, 1: v1, 2: v2});
const j$slprim = (v0) => (v1) => ({type: "j/prim", 0: v0, 1: v1});
const j$slstr = (v0) => (v1) => (v2) => ({type: "j/str", 0: v0, 1: v1, 2: v2});
const j$slraw = (v0) => (v1) => ({type: "j/raw", 0: v0, 1: v1});
const j$slvar = (v0) => (v1) => ({type: "j/var", 0: v0, 1: v1});
const j$slattr = (v0) => (v1) => (v2) => ({type: "j/attr", 0: v0, 1: v1, 2: v2});
const j$slindex = (v0) => (v1) => (v2) => ({type: "j/index", 0: v0, 1: v1, 2: v2});
const j$sltern = (v0) => (v1) => (v2) => (v3) => ({type: "j/tern", 0: v0, 1: v1, 2: v2, 3: v3});
const j$slassign = (v0) => (v1) => (v2) => (v3) => ({type: "j/assign", 0: v0, 1: v1, 2: v2, 3: v3});
const j$slarray = (v0) => (v1) => ({type: "j/array", 0: v0, 1: v1});
const j$slobj = (v0) => (v1) => ({type: "j/obj", 0: v0, 1: v1});

const j$slblock = (v0) => ({type: "j/block", 0: v0});

const j$slsexpr = (v0) => (v1) => ({type: "j/sexpr", 0: v0, 1: v1});
const j$slsblock = (v0) => (v1) => ({type: "j/sblock", 0: v0, 1: v1});
const j$slif = (v0) => (v1) => (v2) => (v3) => ({type: "j/if", 0: v0, 1: v1, 2: v2, 3: v3});
const j$slfor = (v0) => (v1) => (v2) => (v3) => (v4) => (v5) => ({type: "j/for", 0: v0, 1: v1, 2: v2, 3: v3, 4: v4, 5: v5});
const j$slbreak = (v0) => ({type: "j/break", 0: v0});
const j$slcontinue = (v0) => ({type: "j/continue", 0: v0});
const j$slreturn = (v0) => (v1) => ({type: "j/return", 0: v0, 1: v1});
const j$sllet = (v0) => (v1) => (v2) => ({type: "j/let", 0: v0, 1: v1, 2: v2});
const j$slthrow = (v0) => (v1) => ({type: "j/throw", 0: v0, 1: v1});
const pairs = /*1684*/function name_1684(list) { return /*1690*/(function match_1690($target) {
if ($target.type === "nil") {
return /*17989*//*17990*/$lt_/*<17990*//*17989*/(/*1713*/nil/*<1713*/)/*<17989*/
}
if ($target.type === "cons") {
{
let one = $target[0];
if ($target[1].type === "cons") {
{
let two = $target[1][0];
{
let rest = $target[1][1];
return /*17993*//*17994*/$gt$gt$eq/*<17994*//*17993*/(/*17997*//*17998*/pairs/*<17998*//*17997*/(/*17999*/rest/*<17999*/)/*<17997*/)(/*17993*/function name_17993(rest) { return /*17991*//*17992*/$lt_/*<17992*//*17991*/(/*1700*//*1700*/cons/*<1700*//*1700*/(/*1701*//*1702*/$co/*<1702*//*1701*/(/*1703*/one/*<1703*/)(/*1705*/two/*<1705*/)/*<1701*/)(/*1706*/rest/*<1706*/)/*<1700*/)/*<17991*/ }/*<17993*/)/*<17993*/
}
}
}
}
}
if ($target.type === "cons") {
{
let one = $target[0];
if ($target[1].type === "nil") {
return /*18002*//*18004*/$lt_err/*<18004*//*18002*/(/*18006*//*18007*/$co/*<18007*//*18006*/(/*18008*//*18009*/cst_loc/*<18009*//*18008*/(/*18010*/one/*<18010*/)/*<18008*/)(/*18011*/"extra item in pairs"/*<18011*/)/*<18006*/)(/*18013*/nil/*<18013*/)/*<18002*/
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 1690');})(/*!*//*1692*/list/*<1692*/)/*<1690*/ }/*<1684*/;

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

const parse_and_compile = (v0) => (v1) => (v2) => (v3) => (v4) => (v5) => (v6) => (v7) => (v8) => (v9) => ({type: "parse-and-compile", 0: v0, 1: v1, 2: v2, 3: v3, 4: v4, 5: v5, 6: v6, 7: v7, 8: v8, 9: v9});
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
let l = $target[2];
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
let l = $target[1];
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
let l = $target[2];
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
let l = $target[2];
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
let l = $target[2];
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
let free = $target[2];
{
let constructors = $target[3];
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
let body = $target[2];
return /*7306*//*7307*/externals/*<7307*//*7306*/(/*7308*//*7309*/set$sladd/*<7309*//*7308*/(/*7310*/set$slnil/*<7310*/)(/*7311*/name/*<7311*/)/*<7308*/)(/*7312*/body/*<7312*/)/*<7306*/
}
}
}
if ($target.type === "sexpr") {
{
let expr = $target[0];
return /*7317*//*7318*/externals/*<7318*//*7317*/(/*7319*/set$slnil/*<7319*/)(/*7320*/expr/*<7320*/)/*<7317*/
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 7231');})(/*!*//*7233*/stmt/*<7233*/)/*<7231*/)/*<7229*/ }/*<7224*/;

const fold_expr = /*9369*/function name_9369(init) { return function name_9369(expr) { return function name_9369(f) { return /*9384*/(function let_9384() {const $target = /*9388*//*9389*/f/*<9389*//*9388*/(/*9390*/init/*<9390*/)(/*9391*/expr/*<9391*/)/*<9388*/;
{
let v = $target;
return /*9377*/(function match_9377($target) {
if ($target.type === "estr") {
{
let tpl = $target[1];
return /*9396*//*9397*/foldl/*<9397*//*9396*/(/*9398*/v/*<9398*/)(/*9413*/tpl/*<9413*/)(/*9402*/function name_9402(init) { return function name_9402(tpl) { return /*9410*//*9411*/fold_expr/*<9411*//*9410*/(/*9412*/init/*<9412*/)(/*9415*//*11009*/$co$co0/*<11009*//*9415*/(/*11010*/tpl/*<11010*/)/*<9415*/)(/*9416*/f/*<9416*/)/*<9410*/ } }/*<9402*/)/*<9396*/
}
}
if ($target.type === "elambda") {
{
let body = $target[1];
return /*9422*//*9426*/fold_expr/*<9426*//*9422*/(/*9427*/v/*<9427*/)(/*9428*/body/*<9428*/)(/*9429*/f/*<9429*/)/*<9422*/
}
}
if ($target.type === "elet") {
{
let bindings = $target[0];
{
let body = $target[1];
return /*9586*//*9587*/fold_expr/*<9587*//*9586*/(/*9435*//*9436*/foldl/*<9436*//*9435*/(/*9437*/v/*<9437*/)(/*9445*/bindings/*<9445*/)(/*9438*/function name_9438(init) { return function name_9438(binding) { return /*9450*//*9451*/fold_expr/*<9451*//*9450*/(/*9452*/init/*<9452*/)(/*9454*//*11007*/snd/*<11007*//*9454*/(/*11008*/binding/*<11008*/)/*<9454*/)(/*9455*/f/*<9455*/)/*<9450*/ } }/*<9438*/)/*<9435*/)(/*9588*/body/*<9588*/)(/*9589*/f/*<9589*/)/*<9586*/
}
}
}
if ($target.type === "eapp") {
{
let target = $target[0];
{
let args = $target[1];
return /*9461*//*9462*/foldl/*<9462*//*9461*/(/*9463*//*9464*/fold_expr/*<9464*//*9463*/(/*9465*/v/*<9465*/)(/*9466*/target/*<9466*/)(/*9467*/f/*<9467*/)/*<9463*/)(/*9468*/args/*<9468*/)(/*9469*/function name_9469(init) { return function name_9469(expr) { return /*9474*//*9475*/fold_expr/*<9475*//*9474*/(/*9476*/init/*<9476*/)(/*9477*/expr/*<9477*/)(/*9478*/f/*<9478*/)/*<9474*/ } }/*<9469*/)/*<9461*/
}
}
}
if ($target.type === "ematch") {
{
let expr = $target[0];
{
let cases = $target[1];
return /*9484*//*9485*/foldl/*<9485*//*9484*/(/*9486*//*9487*/fold_expr/*<9487*//*9486*/(/*9488*/v/*<9488*/)(/*9489*/expr/*<9489*/)(/*9490*/f/*<9490*/)/*<9486*/)(/*9491*/cases/*<9491*/)(/*9492*/function name_9492(init) { return function name_9492($case) { return /*9502*//*9503*/fold_expr/*<9503*//*9502*/(/*9504*/init/*<9504*/)(/*9505*//*11011*/snd/*<11011*//*9505*/(/*11012*/$case/*<11012*/)/*<9505*/)(/*9506*/f/*<9506*/)/*<9502*/ } }/*<9492*/)/*<9484*/
}
}
}
return /*9508*/v/*<9508*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 9377');})(/*!*//*9382*/expr/*<9382*/)/*<9377*/
};
throw new Error('let pattern not matched 9387. ' + valueToString($target));})(/*!*/)/*<9384*/ } } }/*<9369*/;

const expr_type = /*9590*/function name_9590(expr) { return /*9654*/(function match_9654($target) {
if ($target.type === "eprim") {
{
let prim = $target[0];
{
let int = $target[1];
return /*9657*/"prim"/*<9657*/
}
}
}
if ($target.type === "estr") {
{
let string = $target[0];
{
let int = $target[2];
return /*9659*/"str"/*<9659*/
}
}
}
if ($target.type === "evar") {
{
let string = $target[0];
{
let int = $target[1];
return /*9665*/"var"/*<9665*/
}
}
}
if ($target.type === "equot") {
{
let quot = $target[0];
{
let int = $target[1];
return /*9667*/"quot"/*<9667*/
}
}
}
if ($target.type === "elambda") {
{
let expr = $target[1];
{
let int = $target[2];
return /*9669*/"lambda"/*<9669*/
}
}
}
if ($target.type === "eapp") {
{
let expr = $target[0];
{
let int = $target[2];
return /*9671*/"app"/*<9671*/
}
}
}
if ($target.type === "elet") {
{
let expr = $target[1];
{
let int = $target[2];
return /*9673*/"let"/*<9673*/
}
}
}
if ($target.type === "ematch") {
{
let expr = $target[0];
{
let int = $target[2];
return /*9675*/"match"/*<9675*/
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 9654');})(/*!*//*9656*/expr/*<9656*/)/*<9654*/ }/*<9590*/;

const expr_size = /*9702*/function name_9702(expr) { return /*9708*//*9709*/fold_expr/*<9709*//*9708*/(/*9710*/0/*<9710*/)(/*9711*/expr/*<9711*/)(/*9712*/function name_9712(v) { return function name_9712(_) { return /*9718*//*9719*/$pl/*<9719*//*9718*/(/*9720*/1/*<9720*/)(/*9721*/v/*<9721*/)/*<9718*/ } }/*<9712*/)/*<9708*/ }/*<9702*/;

const stmt_size = /*9722*/function name_9722(stmt) { return /*9832*//*9833*/$pl/*<9833*//*9832*/(/*9834*/1/*<9834*/)(/*9730*/(function match_9730($target) {
if ($target.type === "sdef") {
{
let string = $target[0];
{
let expr = $target[2];
return /*9824*//*9828*/expr_size/*<9828*//*9824*/(/*9829*/expr/*<9829*/)/*<9824*/
}
}
}
if ($target.type === "sexpr") {
{
let expr = $target[0];
return /*9825*//*9826*/expr_size/*<9826*//*9825*/(/*9827*/expr/*<9827*/)/*<9825*/
}
}
if ($target.type === "stypealias") {
{
let string = $target[0];
{
let args = $target[2];
{
let type = $target[3];
return /*9974*//*9975*/type_size/*<9975*//*9974*/(/*9976*/type/*<9976*/)/*<9974*/
}
}
}
}
if ($target.type === "sdeftype") {
{
let string = $target[0];
{
let args = $target[2];
{
let constructors = $target[3];
return /*9830*//*9977*/foldl/*<9977*//*9830*/(/*9978*/0/*<9978*/)(/*9979*/constructors/*<9979*/)(/*9980*/function name_9980(v) { return function name_9980($const) { return /*9999*//*9998*/foldl/*<9998*//*9999*/(/*10000*/v/*<10000*/)(/*10002*//*10001*/map/*<10001*//*10002*/(/*10003*//*11030*/$co$co$co2/*<11030*//*10003*/(/*11031*/$const/*<11031*/)/*<10003*/)(/*10005*/type_size/*<10005*/)/*<10002*/)(/*10006*/$pl/*<10006*/)/*<9999*/ } }/*<9980*/)/*<9830*/
}
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 9730');})(/*!*//*9732*/stmt/*<9732*/)/*<9730*/)/*<9832*/ }/*<9722*/;

const j$slneeds_parens = /*10464*/function name_10464(expr) { return /*10469*/(function match_10469($target) {
if ($target.type === "j/bin") {
return /*10478*/true/*<10478*/
}
if ($target.type === "j/un") {
return /*10484*/true/*<10484*/
}
if ($target.type === "j/lambda") {
return /*10490*/true/*<10490*/
}
if ($target.type === "j/prim") {
return /*10495*/true/*<10495*/
}
if ($target.type === "j/tern") {
return /*10502*/true/*<10502*/
}
if ($target.type === "j/assign") {
return /*10509*/true/*<10509*/
}
return /*10511*/false/*<10511*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 10469');})(/*!*//*10471*/expr/*<10471*/)/*<10469*/ }/*<10464*/;

const is_bop = /*12596*/function name_12596(op) { return /*12602*//*12625*/contains/*<12625*//*12602*/(/*12626*/bops/*<12626*/)(/*12627*/op/*<12627*/)/*<12602*/ }/*<12596*/;

const tx = (v0) => (v1) => (v2) => (v3) => (v4) => (v5) => (v6) => (v7) => ({type: "tx", 0: v0, 1: v1, 2: v2, 3: v3, 4: v4, 5: v5, 6: v6, 7: v7});
const map$slpat = /*13513*/function name_13513(tx) { return function name_13513(pat) { return /*13520*/(function let_13520() {const $target = /*13524*//*13525*/map$slpat/*<13525*//*13524*/(/*13526*/tx/*<13526*/)/*<13524*/;
{
let loop = $target;
return (function let_13520() {const $target = /*13535*/tx/*<13535*/;
if ($target.type === "tx") {
{
let pre_p = $target[2];
{
let post_p = $target[3];
return /*13536*/(function match_13536($target) {
if ($target.type === "none") {
return /*13543*/pat/*<13543*/
}
if ($target.type === "some") {
{
let pat = $target[0];
return /*13547*//*13548*/post_p/*<13548*//*13547*/(/*13549*/(function match_13549($target) {
if ($target.type === "j/pvar") {
return /*13556*/pat/*<13556*/
}
if ($target.type === "j/parray") {
{
let items = $target[0];
{
let spread = $target[1];
{
let l = $target[2];
return /*13562*//*13563*/j$slparray/*<13563*//*13562*/(/*13564*//*13565*/map/*<13565*//*13564*/(/*13566*/items/*<13566*/)(/*13567*/loop/*<13567*/)/*<13564*/)(/*13568*//*13570*/map_opt/*<13570*//*13568*/(/*13571*/spread/*<13571*/)(/*13572*/loop/*<13572*/)/*<13568*/)(/*13596*/l/*<13596*/)/*<13562*/
}
}
}
}
if ($target.type === "j/pobj") {
{
let items = $target[0];
{
let spread = $target[1];
{
let l = $target[2];
return /*13603*//*13604*/j$slpobj/*<13604*//*13603*/(/*13605*//*13606*/map/*<13606*//*13605*/(/*13607*/items/*<13607*/)(/*13608*/function name_13608({0: name, 1: pat}) {

 return /*13616*//*13617*/$co/*<13617*//*13616*/(/*13618*/name/*<13618*/)(/*13619*//*13620*/loop/*<13620*//*13619*/(/*13621*/pat/*<13621*/)/*<13619*/)/*<13616*/ }/*<13608*/)/*<13605*/)(/*13623*//*13624*/map_opt/*<13624*//*13623*/(/*13625*/spread/*<13625*/)(/*13626*/loop/*<13626*/)/*<13623*/)(/*13627*/l/*<13627*/)/*<13603*/
}
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 13549');})(/*!*//*13551*/pat/*<13551*/)/*<13549*/)/*<13547*/
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 13536');})(/*!*//*13538*//*13539*/pre_p/*<13539*//*13538*/(/*13540*/pat/*<13540*/)/*<13538*/)/*<13536*/
}
}
};
throw new Error('let pattern not matched 13527. ' + valueToString($target));})(/*!*/)
};
throw new Error('let pattern not matched 13523. ' + valueToString($target));})(/*!*/)/*<13520*/ } }/*<13513*/;

const simplify_one = /*13665*/function name_13665(expr) { return /*13674*/(function match_13674($target) {
if ($target.type === "j/app") {
if ($target[0].type === "j/lambda") {
if ($target[0][0].type === "nil") {
if ($target[0][1].type === "right") {
{
let inner = $target[0][1][0];
{
let l = $target[0][2];
if ($target[1].type === "nil") {
{
let l = $target[2];
return /*13686*//*13684*/some/*<13684*//*13686*/(/*13687*/inner/*<13687*/)/*<13686*/
}
}
}
}
}
}
}
}
if ($target.type === "j/lambda") {
{
let args = $target[0];
if ($target[1].type === "left") {
if ($target[1][0].type === "j/block") {
if ($target[1][0][0].type === "cons") {
if ($target[1][0][0][0].type === "j/return") {
{
let value = $target[1][0][0][0][0];
if ($target[1][0][0][1].type === "nil") {
{
let l = $target[2];
return /*13717*//*13718*/some/*<13718*//*13717*/(/*13709*//*13710*/j$sllambda/*<13710*//*13709*/(/*13711*/args/*<13711*/)(/*13715*//*13712*/right/*<13712*//*13715*/(/*13716*/value/*<13716*/)/*<13715*/)(/*13713*/l/*<13713*/)/*<13709*/)/*<13717*/
}
}
}
}
}
}
}
}
}
if ($target.type === "j/lambda") {
{
let args = $target[0];
if ($target[1].type === "right") {
if ($target[1][0].type === "j/app") {
if ($target[1][0][0].type === "j/lambda") {
if ($target[1][0][0][0].type === "nil") {
{
let body = $target[1][0][0][1];
{
let ll = $target[1][0][0][2];
if ($target[1][0][1].type === "nil") {
{
let al = $target[1][0][2];
{
let l = $target[2];
return /*13795*//*13796*/some/*<13796*//*13795*/(/*13780*//*13791*/j$sllambda/*<13791*//*13780*/(/*13792*/args/*<13792*/)(/*13793*/body/*<13793*/)(/*13794*/l/*<13794*/)/*<13780*/)/*<13795*/
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
return /*13688*/none/*<13688*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 13674');})(/*!*//*13676*/expr/*<13676*/)/*<13674*/ }/*<13665*/;

const simplify_stmt = /*13832*/function name_13832(stmt) { return /*13838*/(function match_13838($target) {
if ($target.type === "j/sblock") {
if ($target[0].type === "j/block") {
if ($target[0][0].type === "cons") {
{
let one = $target[0][0][0];
if ($target[0][0][1].type === "nil") {
{
let l = $target[1];
return /*14226*/(function match_14226($target) {
if ($target.type === "j/let") {
return /*14235*/none/*<14235*/
}
return /*13847*//*13846*/some/*<13846*//*13847*/(/*13848*/one/*<13848*/)/*<13847*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 14226');})(/*!*//*14228*/one/*<14228*/)/*<14226*/
}
}
}
}
}
}
return /*13850*/none/*<13850*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 13838');})(/*!*//*13840*/stmt/*<13840*/)/*<13838*/ }/*<13832*/;

const make_lets = /*14137*/function name_14137(params) { return function name_14137(args) { return function name_14137(l) { return /*14144*/(function match_14144($target) {
if ($target.type === ",") {
if ($target[0].type === "nil") {
if ($target[1].type === "nil") {
return /*14155*/nil/*<14155*/
}
}
}
if ($target.type === ",") {
if ($target[0].type === "cons") {
{
let one = $target[0][0];
{
let params = $target[0][1];
if ($target[1].type === "cons") {
{
let two = $target[1][0];
{
let args = $target[1][1];
return /*14170*//*14170*/cons/*<14170*//*14170*/(/*14171*//*14173*/j$sllet/*<14173*//*14171*/(/*14174*/one/*<14174*/)(/*14175*/two/*<14175*/)(/*14176*/l/*<14176*/)/*<14171*/)(/*14178*//*14182*/make_lets/*<14182*//*14178*/(/*14183*/params/*<14183*/)(/*14184*/args/*<14184*/)(/*14185*/l/*<14185*/)/*<14178*/)/*<14170*/
}
}
}
}
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 14144');})(/*!*//*14146*//*14147*/$co/*<14147*//*14146*/(/*14148*/params/*<14148*/)(/*14149*/args/*<14149*/)/*<14146*/)/*<14144*/ } } }/*<14137*/;

const fx = (v0) => (v1) => (v2) => (v3) => ({type: "fx", 0: v0, 1: v1, 2: v2, 3: v3});
const fold$slpat = /*14998*/function name_14998(fx) { return function name_14998(init) { return function name_14998(pat) { return /*15006*/(function let_15006() {const $target = /*15015*/fx/*<15015*/;
if ($target.type === "fx") {
{
let p = $target[1];
return /*15024*//*15025*/p/*<15025*//*15024*/(/*15016*/(function match_15016($target) {
if ($target.type === "j/pvar") {
return /*15023*/init/*<15023*/
}
if ($target.type === "j/pobj") {
{
let items = $target[0];
{
let spread = $target[1];
return /*15032*//*15033*/foldl/*<15033*//*15032*/(/*15040*//*15035*/fold$sloption/*<15035*//*15040*/(/*15042*//*15041*/fold$slpat/*<15041*//*15042*/(/*15043*/fx/*<15043*/)/*<15042*/)(/*15047*/init/*<15047*/)(/*15045*/spread/*<15045*/)/*<15040*/)(/*15036*/items/*<15036*/)(/*15037*/function name_15037(init) { return function name_15037({1: pat}) {
 return /*15053*//*15054*/fold$slpat/*<15054*//*15053*/(/*15055*/fx/*<15055*/)(/*15056*/init/*<15056*/)(/*15057*/pat/*<15057*/)/*<15053*/ } }/*<15037*/)/*<15032*/
}
}
}
if ($target.type === "j/parray") {
{
let items = $target[0];
{
let spread = $target[1];
return /*15063*//*15064*/foldl/*<15064*//*15063*/(/*15065*//*15066*/fold$sloption/*<15066*//*15065*/(/*15067*//*15068*/fold$slpat/*<15068*//*15067*/(/*15069*/fx/*<15069*/)/*<15067*/)(/*15070*/init/*<15070*/)(/*15071*/spread/*<15071*/)/*<15065*/)(/*15072*/items/*<15072*/)(/*15073*//*15077*/fold$slpat/*<15077*//*15073*/(/*15078*/fx/*<15078*/)/*<15073*/)/*<15063*/
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 15016');})(/*!*//*15018*/pat/*<15018*/)/*<15016*/)(/*15026*/pat/*<15026*/)/*<15024*/
}
};
throw new Error('let pattern not matched 15009. ' + valueToString($target));})(/*!*/)/*<15006*/ } } }/*<14998*/;

const pat_names$slj2 = /*15355*//*15356*/fx/*<15356*//*15355*/(/*15357*/nop/*<15357*/)(/*15364*/function name_15364(names) { return function name_15364(pat) { return /*15358*/(function match_15358($target) {
if ($target.type === "j/pvar") {
{
let name = $target[0];
return /*15468*//*15371*/set$sladd/*<15371*//*15468*/(/*15469*/names/*<15469*/)(/*15470*/name/*<15470*/)/*<15468*/
}
}
return /*15377*/names/*<15377*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 15358');})(/*!*//*15360*/pat/*<15360*/)/*<15358*/ } }/*<15364*/)(/*15378*/nop/*<15378*/)(/*15379*/nop/*<15379*/)/*<15355*/;

const externals$slj = /*15440*//*15441*/fx/*<15441*//*15440*/(/*15442*/function name_15442(names) { return function name_15442(expr) { return /*15447*/(function match_15447($target) {
if ($target.type === "j/var") {
{
let name = $target[0];
return /*15471*//*15455*/set$sladd/*<15455*//*15471*/(/*15472*/names/*<15472*/)(/*15473*/name/*<15473*/)/*<15471*/
}
}
return /*15461*/names/*<15461*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 15447');})(/*!*//*15449*/expr/*<15449*/)/*<15447*/ } }/*<15442*/)(/*15464*/nop/*<15464*/)(/*15465*/nop/*<15465*/)(/*15466*/nop/*<15466*/)/*<15440*/;

const map_expr = /*15811*/function name_15811(f) { return function name_15811(expr) { return /*15819*/(function match_15819($target) {
if ($target.type === "estr") {
{
let first = $target[0];
{
let tpl = $target[1];
{
let l = $target[2];
return /*15830*//*15831*/estr/*<15831*//*15830*/(/*15832*/first/*<15832*/)(/*15833*//*15834*/map/*<15834*//*15833*/(/*15835*/tpl/*<15835*/)(/*15861*//*15862*/map$co$co0/*<15862*//*15861*/(/*15836*//*15837*/map_expr/*<15837*//*15836*/(/*15838*/f/*<15838*/)/*<15836*/)/*<15861*/)/*<15833*/)(/*15839*/l/*<15839*/)/*<15830*/
}
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
return /*15870*//*15871*/elambda/*<15871*//*15870*/(/*15872*/pats/*<15872*/)(/*15873*//*15874*/map_expr/*<15874*//*15873*/(/*15875*/f/*<15875*/)(/*15876*/body/*<15876*/)/*<15873*/)(/*15877*/l/*<15877*/)/*<15870*/
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
return /*15883*//*15884*/elet/*<15884*//*15883*/(/*15885*//*15886*/map/*<15886*//*15885*/(/*15887*/bindings/*<15887*/)(/*15904*//*15905*/map$co1/*<15905*//*15904*/(/*15906*//*15907*/map_expr/*<15907*//*15906*/(/*15908*/f/*<15908*/)/*<15906*/)/*<15904*/)/*<15885*/)(/*15909*//*15910*/map_expr/*<15910*//*15909*/(/*15913*/f/*<15913*/)(/*15911*/body/*<15911*/)/*<15909*/)(/*15912*/l/*<15912*/)/*<15883*/
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
return /*15919*//*15921*/eapp/*<15921*//*15919*/(/*15922*//*15923*/map_expr/*<15923*//*15922*/(/*15932*/f/*<15932*/)(/*15924*/target/*<15924*/)/*<15922*/)(/*15925*//*15927*/map/*<15927*//*15925*/(/*15928*/args/*<15928*/)(/*15929*//*15930*/map_expr/*<15930*//*15929*/(/*15931*/f/*<15931*/)/*<15929*/)/*<15925*/)(/*15933*/l/*<15933*/)/*<15919*/
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
let l = $target[2];
return /*15939*//*15940*/ematch/*<15940*//*15939*/(/*15941*//*15942*/map_expr/*<15942*//*15941*/(/*15943*/f/*<15943*/)(/*15944*/expr/*<15944*/)/*<15941*/)(/*15945*//*15946*/map/*<15946*//*15945*/(/*15947*/cases/*<15947*/)(/*15948*//*15950*/map$co1/*<15950*//*15948*/(/*15951*//*15952*/map_expr/*<15952*//*15951*/(/*15953*/f/*<15953*/)/*<15951*/)/*<15948*/)/*<15945*/)(/*15954*/l/*<15954*/)/*<15939*/
}
}
}
}
{
let otherwise = $target;
return /*15958*/otherwise/*<15958*/
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 15819');})(/*!*//*15826*//*15821*/f/*<15821*//*15826*/(/*15827*/expr/*<15827*/)/*<15826*/)/*<15819*/ } }/*<15811*/;

const trace_pat = /*16147*/function name_16147(pat) { return function name_16147(trace) { return /*16154*/(function let_16154() {const $target = /*16224*//*16225*/bag$slto_list/*<16225*//*16224*/(/*16160*//*16161*/pat_names_loc/*<16161*//*16160*/(/*16162*/pat/*<16162*/)/*<16160*/)/*<16224*/;
{
let names = $target;
return /*16172*//*16173*/foldl/*<16173*//*16172*/(/*16163*/nil/*<16163*/)(/*16174*/names/*<16174*/)(/*16175*/function name_16175(stmts) { return function name_16175({0: name, 1: loc}) {

 return /*16183*/(function match_16183($target) {
if ($target.type === "none") {
return /*16191*/stmts/*<16191*/
}
if ($target.type === "some") {
{
let info = $target[0];
return /*16195*//*16195*/cons/*<16195*//*16195*/(/*16196*//*16197*/j$slsexpr/*<16197*//*16196*/(/*16199*//*16200*/j$slapp/*<16200*//*16199*/(/*16201*//*16202*/j$slvar/*<16202*//*16201*/(/*16205*/"\$trace"/*<16205*/)(/*16207*/-1/*<16207*/)/*<16201*/)(/*16208*//*16208*/cons/*<16208*//*16208*/(/*16226*//*16227*/j$slprim/*<16227*//*16226*/(/*16209*//*16210*/j$slint/*<16210*//*16209*/(/*16211*/loc/*<16211*/)(/*16212*/-1/*<16212*/)/*<16209*/)(/*16228*/-1/*<16228*/)/*<16226*/)(/*16208*//*16208*/cons/*<16208*//*16208*/(/*16213*//*16214*/j$slraw/*<16214*//*16213*/(/*16215*//*16216*/jsonify/*<16216*//*16215*/(/*16217*/info/*<16217*/)/*<16215*/)(/*16223*/-1/*<16223*/)/*<16213*/)(/*16208*//*16208*/cons/*<16208*//*16208*/(/*16218*//*16219*/j$slvar/*<16219*//*16218*/(/*16220*/name/*<16220*/)(/*16222*/-1/*<16222*/)/*<16218*/)(/*16208*/nil/*<16208*/)/*<16208*/)/*<16208*/)/*<16208*/)(/*16230*/-1/*<16230*/)/*<16199*/)(/*16198*/-1/*<16198*/)/*<16196*/)(/*16195*/nil/*<16195*/)/*<16195*/
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 16183');})(/*!*//*16185*//*16186*/map$slget/*<16186*//*16185*/(/*16187*/trace/*<16187*/)(/*16188*/loc/*<16188*/)/*<16185*/)/*<16183*/ } }/*<16175*/)/*<16172*/
};
throw new Error('let pattern not matched 16159. ' + valueToString($target));})(/*!*/)/*<16154*/ } }/*<16147*/;

const maybe_trace = /*16271*/function name_16271(loc) { return function name_16271(trace) { return function name_16271(expr) { return /*16279*/(function match_16279($target) {
if ($target.type === "none") {
return /*16287*/expr/*<16287*/
}
if ($target.type === "some") {
{
let v = $target[0];
return /*16293*//*16294*/j$slapp/*<16294*//*16293*/(/*16295*//*16296*/j$slvar/*<16296*//*16295*/(/*16297*/"\$trace"/*<16297*/)(/*16299*/-1/*<16299*/)/*<16295*/)(/*16300*//*16300*/cons/*<16300*//*16300*/(/*16301*//*16303*/j$slprim/*<16303*//*16301*/(/*16304*//*16305*/j$slint/*<16305*//*16304*/(/*16306*/loc/*<16306*/)(/*16307*/-1/*<16307*/)/*<16304*/)(/*16308*/-1/*<16308*/)/*<16301*/)(/*16300*//*16300*/cons/*<16300*//*16300*/(/*16309*//*16311*/j$slraw/*<16311*//*16309*/(/*16312*//*16313*/jsonify/*<16313*//*16312*/(/*16314*/v/*<16314*/)/*<16312*/)(/*16315*/-1/*<16315*/)/*<16309*/)(/*16300*//*16300*/cons/*<16300*//*16300*/(/*16316*/expr/*<16316*/)(/*16300*/nil/*<16300*/)/*<16300*/)/*<16300*/)/*<16300*/)(/*16317*/-1/*<16317*/)/*<16293*/
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 16279');})(/*!*//*16281*//*16282*/map$slget/*<16282*//*16281*/(/*16283*/trace/*<16283*/)(/*16284*/loc/*<16284*/)/*<16281*/)/*<16279*/ } } }/*<16271*/;

const quot$sljsonify = /*16394*/function name_16394(quot) { return /*16401*/(function match_16401($target) {
if ($target.type === "quot/expr") {
{
let expr = $target[0];
return /*16407*//*16408*/jsonify/*<16408*//*16407*/(/*16409*/expr/*<16409*/)/*<16407*/
}
}
if ($target.type === "quot/type") {
{
let type = $target[0];
return /*16413*//*16414*/jsonify/*<16414*//*16413*/(/*16415*/type/*<16415*/)/*<16413*/
}
}
if ($target.type === "quot/stmt") {
{
let stmt = $target[0];
return /*16419*//*16420*/jsonify/*<16420*//*16419*/(/*16421*/stmt/*<16421*/)/*<16419*/
}
}
if ($target.type === "quot/quot") {
{
let cst = $target[0];
return /*16425*//*16426*/jsonify/*<16426*//*16425*/(/*16427*/cst/*<16427*/)/*<16425*/
}
}
if ($target.type === "quot/pat") {
{
let pat = $target[0];
return /*16431*//*16432*/jsonify/*<16432*//*16431*/(/*16433*/pat/*<16433*/)/*<16431*/
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 16401');})(/*!*//*16403*/quot/*<16403*/)/*<16401*/ }/*<16394*/;

const run$slnil_$gt = /*16893*/function name_16893(st) { return /*16900*//*16901*/run_$gt/*<16901*//*16900*/(/*16902*/st/*<16902*/)(/*16903*/state$slnil/*<16903*/)/*<16900*/ }/*<16893*/;

const unexpected = /*17083*/function name_17083(msg) { return function name_17083(cst) { return /*17090*//*17091*/$lt_err/*<17091*//*17090*/(/*17092*//*17093*/$co/*<17093*//*17092*/(/*17094*//*17095*/cst_loc/*<17095*//*17094*/(/*17096*/cst/*<17096*/)/*<17094*/)(/*17097*/msg/*<17097*/)/*<17092*/)(/*17150*/$unit/*<17150*/)/*<17090*/ } }/*<17083*/;

const eunit = /*17162*/function name_17162(l) { return /*17169*//*17170*/evar/*<17170*//*17169*/(/*17171*/"()"/*<17171*/)(/*17173*/l/*<17173*/)/*<17169*/ }/*<17162*/;

const sunit = /*17174*/function name_17174(k) { return /*17180*//*17182*/sexpr/*<17182*//*17180*/(/*17183*//*17184*/eunit/*<17184*//*17183*/(/*17185*/k/*<17185*/)/*<17183*/)(/*17186*/k/*<17186*/)/*<17180*/ }/*<17174*/;

const compile_pat$slj = /*2322*/function name_2322(pat) { return function name_2322(target) { return function name_2322(inner) { return function name_2322(trace) { return /*2330*/(function match_2330($target) {
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
{
let pl = $target[1];
return /*11215*//*11215*/cons/*<11215*//*11215*/(/*11148*//*11149*/j$slif/*<11149*//*11148*/(/*11152*//*11154*/j$slbin/*<11154*//*11152*/(/*11155*/"==="/*<11155*/)(/*11157*/target/*<11157*/)(/*11159*//*11160*/j$slprim/*<11160*//*11159*/(/*11161*//*11162*/j$slint/*<11162*//*11161*/(/*11163*/int/*<11163*/)(/*11164*/pl/*<11164*/)/*<11161*/)(/*11228*/l/*<11228*/)/*<11159*/)(/*11226*/l/*<11226*/)/*<11152*/)(/*13957*//*11165*/j$slblock/*<11165*//*13957*/(/*13958*/inner/*<13958*/)/*<13957*/)(/*11166*/none/*<11166*/)(/*11204*/l/*<11204*/)/*<11148*/)(/*11215*/nil/*<11215*/)/*<11215*/
}
}
}
if ($target.type === "pbool") {
{
let bool = $target[0];
{
let pl = $target[1];
return /*11216*//*11216*/cons/*<11216*//*11216*/(/*11169*//*11170*/j$slif/*<11170*//*11169*/(/*11171*//*11172*/j$slbin/*<11172*//*11171*/(/*11173*/"==="/*<11173*/)(/*11175*/target/*<11175*/)(/*11176*//*11177*/j$slprim/*<11177*//*11176*/(/*11178*//*11179*/j$slbool/*<11179*//*11178*/(/*11180*/bool/*<11180*/)(/*11181*/pl/*<11181*/)/*<11178*/)(/*11229*/l/*<11229*/)/*<11176*/)(/*11227*/l/*<11227*/)/*<11171*/)(/*13959*//*11182*/j$slblock/*<11182*//*13959*/(/*13960*/inner/*<13960*/)/*<13959*/)(/*11184*/none/*<11184*/)(/*11205*/l/*<11205*/)/*<11169*/)(/*11216*/nil/*<11216*/)/*<11216*/
}
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
return /*11217*//*11217*/cons/*<11217*//*11217*/(/*11187*//*11188*/j$slif/*<11188*//*11187*/(/*11189*//*11190*/j$slbin/*<11190*//*11189*/(/*11191*/"==="/*<11191*/)(/*11193*/target/*<11193*/)(/*11194*//*11195*/j$slstr/*<11195*//*11194*/(/*11196*/str/*<11196*/)(/*12060*/nil/*<12060*/)(/*11197*/l/*<11197*/)/*<11194*/)(/*11218*/l/*<11218*/)/*<11189*/)(/*13961*//*11198*/j$slblock/*<11198*//*13961*/(/*13962*/inner/*<13962*/)/*<13961*/)(/*11199*/none/*<11199*/)(/*11225*/l/*<11225*/)/*<11187*/)(/*11217*/nil/*<11217*/)/*<11217*/
}
}
}
if ($target.type === "pvar") {
{
let name = $target[0];
{
let l = $target[1];
return /*11206*//*11206*/cons/*<11206*//*11206*/(/*11207*//*11208*/j$sllet/*<11208*//*11207*/(/*11209*//*11210*/j$slpvar/*<11210*//*11209*/(/*11211*/name/*<11211*/)(/*11212*/l/*<11212*/)/*<11209*/)(/*11213*/target/*<11213*/)(/*11231*/l/*<11231*/)/*<11207*/)(/*11214*/inner/*<11214*/)/*<11206*/
}
}
}
if ($target.type === "pcon") {
{
let name = $target[0];
{
let nl = $target[1];
{
let args = $target[2];
{
let l = $target[3];
return /*11224*//*11224*/cons/*<11224*//*11224*/(/*11238*//*11239*/j$slif/*<11239*//*11238*/(/*11240*//*11241*/j$slbin/*<11241*//*11240*/(/*11242*/"==="/*<11242*/)(/*11244*//*11245*/j$slattr/*<11245*//*11244*/(/*11246*/target/*<11246*/)(/*11247*/"type"/*<11247*/)(/*11249*/l/*<11249*/)/*<11244*/)(/*11252*//*11253*/j$slstr/*<11253*//*11252*/(/*11254*/name/*<11254*/)(/*12061*/nil/*<12061*/)(/*11255*/l/*<11255*/)/*<11252*/)(/*11257*/l/*<11257*/)/*<11240*/)(/*13971*//*13972*/j$slblock/*<13972*//*13971*/(/*11258*//*11259*/pat_loop$slj/*<11259*//*11258*/(/*11260*/target/*<11260*/)(/*11261*/args/*<11261*/)(/*11262*/0/*<11262*/)(/*11264*/inner/*<11264*/)(/*11322*/l/*<11322*/)(/*11265*/trace/*<11265*/)/*<11258*/)/*<13971*/)(/*11266*/none/*<11266*/)(/*11319*/l/*<11319*/)/*<11238*/)(/*11224*/nil/*<11224*/)/*<11224*/
}
}
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 2330');})(/*!*//*2332*/pat/*<2332*/)/*<2330*/ } } } }/*<2322*/;


const pat_loop$slj = /*11267*/function name_11267(target) { return function name_11267(args) { return function name_11267(i) { return function name_11267(inner) { return function name_11267(l) { return function name_11267(trace) { return /*11276*/(function match_11276($target) {
if ($target.type === "nil") {
return /*11280*/inner/*<11280*/
}
if ($target.type === "cons") {
{
let arg = $target[0];
{
let rest = $target[1];
return /*11285*//*11286*/compile_pat$slj/*<11286*//*11285*/(/*11287*/arg/*<11287*/)(/*11308*//*11309*/j$slindex/*<11309*//*11308*/(/*11310*/target/*<11310*/)(/*11311*//*11312*/j$slprim/*<11312*//*11311*/(/*11313*//*11314*/j$slint/*<11314*//*11313*/(/*11315*/i/*<11315*/)(/*11316*/l/*<11316*/)/*<11313*/)(/*11317*/l/*<11317*/)/*<11311*/)(/*11318*/l/*<11318*/)/*<11308*/)(/*11296*//*11297*/pat_loop$slj/*<11297*//*11296*/(/*11298*/target/*<11298*/)(/*11299*/rest/*<11299*/)(/*11300*//*11301*/$pl/*<11301*//*11300*/(/*11302*/i/*<11302*/)(/*11303*/1/*<11303*/)/*<11300*/)(/*11304*/inner/*<11304*/)(/*11321*/l/*<11321*/)(/*11305*/trace/*<11305*/)/*<11296*/)(/*11306*/trace/*<11306*/)/*<11285*/
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 11276');})(/*!*//*11278*/args/*<11278*/)/*<11276*/ } } } } } }/*<11267*/;

const j$slcompile_stmt = /*10281*/function name_10281(ctx) { return function name_10281(stmt) { return /*10287*/(function match_10287($target) {
if ($target.type === "j/sexpr") {
{
let expr = $target[0];
{
let l = $target[1];
return /*10294*//*10295*/j$slcompile/*<10295*//*10294*/(/*10296*/ctx/*<10296*/)(/*10297*/expr/*<10297*/)/*<10294*/
}
}
}
if ($target.type === "j/sblock") {
{
let block = $target[0];
{
let l = $target[1];
return /*10302*//*10303*/j$slcompile_block/*<10303*//*10302*/(/*10304*/ctx/*<10304*/)(/*10305*/block/*<10305*/)/*<10302*/
}
}
}
if ($target.type === "j/if") {
{
let cond = $target[0];
{
let yes = $target[1];
{
let $else = $target[2];
{
let l = $target[3];
return /*10312*/`if (${/*10314*//*10315*/j$slcompile/*<10315*//*10314*/(/*10316*/ctx/*<10316*/)(/*10317*/cond/*<10317*/)/*<10314*/}) ${/*10319*//*10320*/j$slcompile_block/*<10320*//*10319*/(/*10321*/ctx/*<10321*/)(/*10322*/yes/*<10322*/)/*<10319*/} ${/*10324*/(function match_10324($target) {
if ($target.type === "none") {
return /*10329*/""/*<10329*/
}
if ($target.type === "some") {
{
let block = $target[0];
return /*10334*/` else ${/*10336*//*10337*/j$slcompile_block/*<10337*//*10336*/(/*10338*/ctx/*<10338*/)(/*10339*/block/*<10339*/)/*<10336*/}`/*<10334*/
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 10324');})(/*!*//*10326*/$else/*<10326*/)/*<10324*/}`/*<10312*/
}
}
}
}
}
if ($target.type === "j/for") {
{
let arg = $target[0];
{
let init = $target[1];
{
let cond = $target[2];
{
let inc = $target[3];
{
let block = $target[4];
{
let l = $target[5];
return /*10350*/`for (let ${/*10352*/arg/*<10352*/} = ${/*10354*//*10355*/j$slcompile/*<10355*//*10354*/(/*10356*/ctx/*<10356*/)(/*10357*/init/*<10357*/)/*<10354*/}; ${/*10359*//*10360*/j$slcompile/*<10360*//*10359*/(/*10361*/ctx/*<10361*/)(/*10362*/cond/*<10362*/)/*<10359*/}; ${/*10364*//*10365*/j$slcompile/*<10365*//*10364*/(/*10366*/ctx/*<10366*/)(/*10367*/inc/*<10367*/)/*<10364*/}) ${/*10369*//*10370*/j$slcompile_block/*<10370*//*10369*/(/*10371*/ctx/*<10371*/)(/*10372*/block/*<10372*/)/*<10369*/}`/*<10350*/
}
}
}
}
}
}
}
if ($target.type === "j/break") {
{
let l = $target[0];
return /*10377*/"break"/*<10377*/
}
}
if ($target.type === "j/continue") {
{
let l = $target[0];
return /*10382*/"continue"/*<10382*/
}
}
if ($target.type === "j/return") {
{
let result = $target[0];
{
let l = $target[1];
return /*10388*/`return ${/*10390*//*10391*/j$slcompile/*<10391*//*10390*/(/*10392*/ctx/*<10392*/)(/*10393*/result/*<10393*/)/*<10390*/}`/*<10388*/
}
}
}
if ($target.type === "j/let") {
{
let pat = $target[0];
{
let value = $target[1];
{
let l = $target[2];
return /*10400*/`let ${/*10402*//*10403*/pat_arg/*<10403*//*10402*/(/*10404*/ctx/*<10404*/)(/*10405*/pat/*<10405*/)/*<10402*/} = ${/*10407*//*10408*/j$slcompile/*<10408*//*10407*/(/*10409*/ctx/*<10409*/)(/*10410*/value/*<10410*/)/*<10407*/}`/*<10400*/
}
}
}
}
if ($target.type === "j/throw") {
{
let value = $target[0];
{
let l = $target[1];
return /*10416*/`throw ${/*10418*//*10419*/j$slcompile/*<10419*//*10418*/(/*10420*/ctx/*<10420*/)(/*10421*/value/*<10421*/)/*<10418*/}`/*<10416*/
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 10287');})(/*!*//*10289*/stmt/*<10289*/)/*<10287*/ } }/*<10281*/;


const j$slcompile = /*10690*/function name_10690(ctx) { return function name_10690(expr) { return /*10696*/(function match_10696($target) {
if ($target.type === "j/app") {
{
let target = $target[0];
{
let args = $target[1];
{
let l = $target[2];
return /*10704*/`${/*10706*//*10707*/j$slparen_expr/*<10707*//*10706*/(/*10708*/ctx/*<10708*/)(/*10709*/target/*<10709*/)/*<10706*/}(${/*10711*//*10712*/join/*<10712*//*10711*/(/*10713*/", "/*<10713*/)(/*10715*//*10716*/map/*<10716*//*10715*/(/*10717*/args/*<10717*/)(/*10718*//*10719*/j$slcompile/*<10719*//*10718*/(/*10720*/ctx/*<10720*/)/*<10718*/)/*<10715*/)/*<10711*/})`/*<10704*/
}
}
}
}
if ($target.type === "j/bin") {
{
let op = $target[0];
{
let left = $target[1];
{
let right = $target[2];
{
let l = $target[3];
return /*10728*/`${/*10730*//*10731*/j$slcompile/*<10731*//*10730*/(/*10732*/ctx/*<10732*/)(/*10733*/left/*<10733*/)/*<10730*/} ${/*10735*/op/*<10735*/} ${/*10737*//*10738*/j$slcompile/*<10738*//*10737*/(/*10739*/ctx/*<10739*/)(/*10740*/right/*<10740*/)/*<10737*/}`/*<10728*/
}
}
}
}
}
if ($target.type === "j/un") {
{
let op = $target[0];
{
let arg = $target[1];
{
let l = $target[2];
return /*10747*/`${/*10749*/op/*<10749*/}${/*10751*//*10752*/j$slcompile/*<10752*//*10751*/(/*10753*/ctx/*<10753*/)(/*10754*/arg/*<10754*/)/*<10751*/}`/*<10747*/
}
}
}
}
if ($target.type === "j/raw") {
{
let raw = $target[0];
{
let l = $target[1];
return /*12174*/raw/*<12174*/
}
}
}
if ($target.type === "j/lambda") {
{
let args = $target[0];
{
let body = $target[1];
{
let l = $target[2];
return /*10761*/`(${/*10763*//*10764*/join/*<10764*//*10763*/(/*10765*/", "/*<10765*/)(/*10767*//*10768*/map/*<10768*//*10767*/(/*10769*/args/*<10769*/)(/*10770*//*10771*/pat_arg/*<10771*//*10770*/(/*10772*/ctx/*<10772*/)/*<10770*/)/*<10767*/)/*<10763*/}) => ${/*10774*//*10775*/j$slcompile_body/*<10775*//*10774*/(/*10776*/ctx/*<10776*/)(/*10777*/body/*<10777*/)/*<10774*/}`/*<10761*/
}
}
}
}
if ($target.type === "j/prim") {
{
let prim = $target[0];
{
let l = $target[1];
return /*10783*//*10784*/j$slcompile_prim/*<10784*//*10783*/(/*10785*/ctx/*<10785*/)(/*10786*/prim/*<10786*/)/*<10783*/
}
}
}
if ($target.type === "j/str") {
{
let first = $target[0];
{
let tpls = $target[1];
{
let l = $target[2];
return /*12068*/(function match_12068($target) {
if ($target.type === "nil") {
return /*12072*/`\"${/*12074*//*12075*/escape_string/*<12075*//*12074*/(/*12076*//*12077*/unescapeString/*<12077*//*12076*/(/*12078*/first/*<12078*/)/*<12076*/)/*<12074*/}\"`/*<12072*/
}
return /*12081*/`\`${/*12083*//*12084*/escape_string/*<12084*//*12083*/(/*12085*//*12086*/unescapeString/*<12086*//*12085*/(/*12087*/first/*<12087*/)/*<12085*/)/*<12083*/}${/*12089*//*12090*/join/*<12090*//*12089*/(/*12091*/""/*<12091*/)(/*12093*//*12094*/map/*<12094*//*12093*/(/*12095*/tpls/*<12095*/)(/*12096*/function name_12096(item) { return /*12100*/(function let_12100() {const $target = /*12108*/item/*<12108*/;
if ($target.type === ",,") {
{
let expr = $target[0];
{
let suffix = $target[1];
{
let l = $target[2];
return /*12109*/`\${${/*12111*//*12112*/j$slcompile/*<12112*//*12111*/(/*12114*/ctx/*<12114*/)(/*12123*/expr/*<12123*/)/*<12111*/}}${/*12116*//*12117*/escape_string/*<12117*//*12116*/(/*12118*//*12119*/unescapeString/*<12119*//*12118*/(/*12120*/suffix/*<12120*/)/*<12118*/)/*<12116*/}`/*<12109*/
}
}
}
};
throw new Error('let pattern not matched 12103. ' + valueToString($target));})(/*!*/)/*<12100*/ }/*<12096*/)/*<12093*/)/*<12089*/}\``/*<12081*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 12068');})(/*!*//*12070*/tpls/*<12070*/)/*<12068*/
}
}
}
}
if ($target.type === "j/var") {
{
let name = $target[0];
{
let l = $target[1];
return /*10791*//*10792*/sanitize/*<10792*//*10791*/(/*10793*/name/*<10793*/)/*<10791*/
}
}
}
if ($target.type === "j/attr") {
{
let target = $target[0];
{
let attr = $target[1];
{
let l = $target[2];
return /*10799*/`${/*10801*//*10802*/j$slparen_expr/*<10802*//*10801*/(/*10803*/ctx/*<10803*/)(/*10804*/target/*<10804*/)/*<10801*/}.${/*10806*//*10807*/sanitize/*<10807*//*10806*/(/*10808*/attr/*<10808*/)/*<10806*/}`/*<10799*/
}
}
}
}
if ($target.type === "j/index") {
{
let target = $target[0];
{
let idx = $target[1];
{
let l = $target[2];
return /*10815*/`${/*10817*//*10818*/j$slparen_expr/*<10818*//*10817*/(/*10819*/ctx/*<10819*/)(/*10820*/target/*<10820*/)/*<10817*/}[${/*10822*//*10823*/j$slcompile/*<10823*//*10822*/(/*10824*/ctx/*<10824*/)(/*10825*/idx/*<10825*/)/*<10822*/}]`/*<10815*/
}
}
}
}
if ($target.type === "j/tern") {
{
let cond = $target[0];
{
let yes = $target[1];
{
let no = $target[2];
{
let l = $target[3];
return /*10833*/`${/*10835*//*10836*/j$slparen_expr/*<10836*//*10835*/(/*10837*/ctx/*<10837*/)(/*10838*/cond/*<10838*/)/*<10835*/} ? ${/*10840*//*10841*/j$slparen_expr/*<10841*//*10840*/(/*10842*/ctx/*<10842*/)(/*10843*/yes/*<10843*/)/*<10840*/} : ${/*10845*//*10846*/j$slparen_expr/*<10846*//*10845*/(/*10847*/ctx/*<10847*/)(/*10848*/no/*<10848*/)/*<10845*/}`/*<10833*/
}
}
}
}
}
if ($target.type === "j/assign") {
{
let name = $target[0];
{
let op = $target[1];
{
let value = $target[2];
{
let l = $target[3];
return /*10856*/`${/*10858*/name/*<10858*/} ${/*10860*/op/*<10860*/} ${/*10862*//*10863*/j$slcompile/*<10863*//*10862*/(/*10864*/ctx/*<10864*/)(/*10865*/value/*<10865*/)/*<10862*/}`/*<10856*/
}
}
}
}
}
if ($target.type === "j/array") {
{
let items = $target[0];
{
let l = $target[1];
return /*10871*/`[${/*10873*//*10874*/join/*<10874*//*10873*/(/*10875*/", "/*<10875*/)(/*10877*//*10878*/map/*<10878*//*10877*/(/*10879*/items/*<10879*/)(/*10880*/function name_10880(item) { return /*10884*/(function match_10884($target) {
if ($target.type === "left") {
{
let expr = $target[0];
return /*10890*//*10891*/j$slcompile/*<10891*//*10890*/(/*10892*/ctx/*<10892*/)(/*10893*/expr/*<10893*/)/*<10890*/
}
}
if ($target.type === "right") {
if ($target[0].type === "j/spread") {
{
let expr = $target[0][0];
return /*10899*/`...${/*10901*//*10902*/j$slcompile/*<10902*//*10901*/(/*10903*/ctx/*<10903*/)(/*10904*/expr/*<10904*/)/*<10901*/}`/*<10899*/
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 10884');})(/*!*//*10886*/item/*<10886*/)/*<10884*/ }/*<10880*/)/*<10877*/)/*<10873*/}]`/*<10871*/
}
}
}
if ($target.type === "j/obj") {
{
let items = $target[0];
{
let l = $target[1];
return /*10911*/`{${/*10913*//*10914*/join/*<10914*//*10913*/(/*10915*/", "/*<10915*/)(/*10917*//*10918*/map/*<10918*//*10917*/(/*10919*/items/*<10919*/)(/*10920*/function name_10920(item) { return /*10924*/(function match_10924($target) {
if ($target.type === "left") {
if ($target[0].type === ",") {
{
let name = $target[0][0];
{
let value = $target[0][1];
return /*10933*/`${/*10935*/name/*<10935*/}: ${/*10937*//*10938*/j$slcompile/*<10938*//*10937*/(/*10939*/ctx/*<10939*/)(/*10940*/value/*<10940*/)/*<10937*/}`/*<10933*/
}
}
}
}
if ($target.type === "right") {
if ($target[0].type === "j/spread") {
{
let expr = $target[0][0];
return /*10947*/`...${/*10949*//*10950*/j$slcompile/*<10950*//*10949*/(/*10951*/ctx/*<10951*/)(/*10952*/expr/*<10952*/)/*<10949*/}`/*<10947*/
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 10924');})(/*!*//*10926*/item/*<10926*/)/*<10924*/ }/*<10920*/)/*<10917*/)/*<10913*/}}`/*<10911*/
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 10696');})(/*!*//*10698*/expr/*<10698*/)/*<10696*/ } }/*<10690*/;


const j$slcompile_block = /*10528*/function name_10528(ctx) { return function name_10528({0: block}) {
 return /*10534*/`{\n${/*10536*//*10537*/join/*<10537*//*10536*/(/*10538*/";\n"/*<10538*/)(/*10540*//*10541*/map/*<10541*//*10540*/(/*10542*/block/*<10542*/)(/*10543*//*10544*/j$slcompile_stmt/*<10544*//*10543*/(/*10545*/ctx/*<10545*/)/*<10543*/)/*<10540*/)/*<10536*/}\n}`/*<10534*/ } }/*<10528*/;


const j$slparen_expr = /*10572*/function name_10572(ctx) { return function name_10572(target) { return /*10578*//*10579*/maybe_paren/*<10579*//*10578*/(/*10580*//*10581*/j$slcompile/*<10581*//*10580*/(/*10582*/ctx/*<10582*/)(/*10583*/target/*<10583*/)/*<10580*/)(/*10584*//*10585*/j$slneeds_parens/*<10585*//*10584*/(/*10586*/target/*<10586*/)/*<10584*/)/*<10578*/ } }/*<10572*/;


const j$slcompile_body = /*10548*/function name_10548(ctx) { return function name_10548(body) { return /*10554*/(function match_10554($target) {
if ($target.type === "left") {
{
let block = $target[0];
return /*10560*//*10561*/j$slcompile_block/*<10561*//*10560*/(/*10562*/ctx/*<10562*/)(/*10563*/block/*<10563*/)/*<10560*/
}
}
if ($target.type === "right") {
{
let expr = $target[0];
return /*14514*//*14515*/maybe_paren/*<14515*//*14514*/(/*10567*//*10568*/j$slcompile/*<10568*//*10567*/(/*10569*/ctx/*<10569*/)(/*10570*/expr/*<10570*/)/*<10567*/)(/*14516*/(function match_14516($target) {
if ($target.type === "j/obj") {
return /*14523*/true/*<14523*/
}
return /*14525*/false/*<14525*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 14516');})(/*!*//*14518*/expr/*<14518*/)/*<14516*/)/*<14514*/
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 10554');})(/*!*//*10556*/body/*<10556*/)/*<10554*/ } }/*<10548*/;

const map$slexpr = /*12841*/function name_12841(tx) { return function name_12841(expr) { return /*13023*/(function let_13023() {const $target = /*13027*//*13028*/map$slexpr/*<13028*//*13027*/(/*13095*/tx/*<13095*/)/*<13027*/;
{
let loop = $target;
return (function let_13023() {const $target = /*13099*/tx/*<13099*/;
if ($target.type === "tx") {
{
let pre_e = $target[0];
{
let post_e = $target[1];
return /*12976*/(function match_12976($target) {
if ($target.type === "none") {
return /*12984*/expr/*<12984*/
}
if ($target.type === "some") {
{
let expr = $target[0];
return /*13017*//*13018*/post_e/*<13018*//*13017*/(/*12858*/(function match_12858($target) {
if ($target.type === "j/app") {
{
let target = $target[0];
{
let args = $target[1];
{
let l = $target[2];
return /*12989*//*12990*/j$slapp/*<12990*//*12989*/(/*12991*//*12992*/loop/*<12992*//*12991*/(/*12995*/target/*<12995*/)/*<12991*/)(/*12996*//*12997*/map/*<12997*//*12996*/(/*13003*/args/*<13003*/)(/*12998*/loop/*<12998*/)/*<12996*/)(/*13004*/l/*<13004*/)/*<12989*/
}
}
}
}
if ($target.type === "j/bin") {
{
let op = $target[0];
{
let left = $target[1];
{
let right = $target[2];
{
let l = $target[3];
return /*13005*//*13019*/j$slbin/*<13019*//*13005*/(/*13042*/op/*<13042*/)(/*13020*//*13031*/loop/*<13031*//*13020*/(/*13032*/left/*<13032*/)/*<13020*/)(/*13033*//*13035*/loop/*<13035*//*13033*/(/*13036*/right/*<13036*/)/*<13033*/)(/*13038*/l/*<13038*/)/*<13005*/
}
}
}
}
}
if ($target.type === "j/un") {
{
let op = $target[0];
{
let arg = $target[1];
{
let l = $target[2];
return /*13006*//*13039*/j$slun/*<13039*//*13006*/(/*13043*/op/*<13043*/)(/*13040*//*13041*/loop/*<13041*//*13040*/(/*13045*/arg/*<13045*/)/*<13040*/)(/*13046*/l/*<13046*/)/*<13006*/
}
}
}
}
if ($target.type === "j/lambda") {
{
let pats = $target[0];
{
let body = $target[1];
{
let l = $target[2];
return /*13007*//*13047*/j$sllambda/*<13047*//*13007*/(/*13048*//*13105*/map/*<13105*//*13048*/(/*13106*/pats/*<13106*/)(/*13107*//*13108*/map$slpat/*<13108*//*13107*/(/*13109*/tx/*<13109*/)/*<13107*/)/*<13048*/)(/*13110*/(function match_13110($target) {
if ($target.type === "left") {
{
let block = $target[0];
return /*13119*//*13120*/left/*<13120*//*13119*/(/*13121*//*13946*/map$slblock/*<13946*//*13121*/(/*13947*/tx/*<13947*/)(/*13948*/block/*<13948*/)/*<13121*/)/*<13119*/
}
}
if ($target.type === "right") {
{
let expr = $target[0];
return /*13130*//*13131*/right/*<13131*//*13130*/(/*13132*//*13134*/loop/*<13134*//*13132*/(/*13135*/expr/*<13135*/)/*<13132*/)/*<13130*/
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 13110');})(/*!*//*13115*/body/*<13115*/)/*<13110*/)(/*13136*/l/*<13136*/)/*<13007*/
}
}
}
}
if ($target.type === "j/prim") {
{
let item = $target[0];
{
let l = $target[1];
return /*13008*//*13137*/j$slprim/*<13137*//*13008*/(/*13138*/item/*<13138*/)(/*13139*/l/*<13139*/)/*<13008*/
}
}
}
if ($target.type === "j/str") {
{
let string = $target[0];
{
let tpls = $target[1];
{
let l = $target[2];
return /*13009*//*13140*/j$slstr/*<13140*//*13009*/(/*13141*/string/*<13141*/)(/*13142*//*13143*/map/*<13143*//*13142*/(/*13144*/tpls/*<13144*/)(/*13145*/function name_13145({0: expr, 1: suffix, 2: l}) {


 return /*13154*//*13155*/$co$co/*<13155*//*13154*/(/*13156*//*13157*/loop/*<13157*//*13156*/(/*13158*/expr/*<13158*/)/*<13156*/)(/*13160*/suffix/*<13160*/)(/*13161*/l/*<13161*/)/*<13154*/ }/*<13145*/)/*<13142*/)(/*13162*/l/*<13162*/)/*<13009*/
}
}
}
}
if ($target.type === "j/raw") {
{
let string = $target[0];
{
let l = $target[1];
return /*13010*//*13163*/j$slraw/*<13163*//*13010*/(/*13164*/string/*<13164*/)(/*13165*/l/*<13165*/)/*<13010*/
}
}
}
if ($target.type === "j/var") {
{
let string = $target[0];
{
let l = $target[1];
return /*13011*//*13166*/j$slvar/*<13166*//*13011*/(/*13167*/string/*<13167*/)(/*13168*/l/*<13168*/)/*<13011*/
}
}
}
if ($target.type === "j/attr") {
{
let target = $target[0];
{
let string = $target[1];
{
let l = $target[2];
return /*13012*//*13169*/j$slattr/*<13169*//*13012*/(/*13170*//*13171*/loop/*<13171*//*13170*/(/*13172*/target/*<13172*/)/*<13170*/)(/*13173*/string/*<13173*/)(/*13174*/l/*<13174*/)/*<13012*/
}
}
}
}
if ($target.type === "j/index") {
{
let target = $target[0];
{
let idx = $target[1];
{
let l = $target[2];
return /*13013*//*13175*/j$slindex/*<13175*//*13013*/(/*13176*//*13177*/loop/*<13177*//*13176*/(/*13178*/target/*<13178*/)/*<13176*/)(/*13179*//*13180*/loop/*<13180*//*13179*/(/*13181*/idx/*<13181*/)/*<13179*/)(/*13182*/l/*<13182*/)/*<13013*/
}
}
}
}
if ($target.type === "j/tern") {
{
let cond = $target[0];
{
let yes = $target[1];
{
let no = $target[2];
{
let l = $target[3];
return /*13014*//*13183*/j$sltern/*<13183*//*13014*/(/*13184*//*13185*/loop/*<13185*//*13184*/(/*13186*/cond/*<13186*/)/*<13184*/)(/*13187*//*13188*/loop/*<13188*//*13187*/(/*13189*/yes/*<13189*/)/*<13187*/)(/*13190*//*13191*/loop/*<13191*//*13190*/(/*13192*/no/*<13192*/)/*<13190*/)(/*13193*/l/*<13193*/)/*<13014*/
}
}
}
}
}
if ($target.type === "j/assign") {
{
let name = $target[0];
{
let op = $target[1];
{
let value = $target[2];
{
let l = $target[3];
return /*13015*//*13194*/j$slassign/*<13194*//*13015*/(/*13195*/name/*<13195*/)(/*13196*/op/*<13196*/)(/*13197*//*13198*/loop/*<13198*//*13197*/(/*13199*/value/*<13199*/)/*<13197*/)(/*13200*/l/*<13200*/)/*<13015*/
}
}
}
}
}
if ($target.type === "j/array") {
{
let items = $target[0];
{
let l = $target[1];
return /*13016*//*13201*/j$slarray/*<13201*//*13016*/(/*13202*//*13203*/map/*<13203*//*13202*/(/*13204*/items/*<13204*/)(/*13205*/function name_13205(item) { return /*13210*/(function match_13210($target) {
if ($target.type === "left") {
{
let a = $target[0];
return /*13232*//*13233*/left/*<13233*//*13232*/(/*13216*//*13218*/loop/*<13218*//*13216*/(/*13219*/a/*<13219*/)/*<13216*/)/*<13232*/
}
}
if ($target.type === "right") {
if ($target[0].type === "j/spread") {
{
let a = $target[0][0];
return /*13225*//*13226*/right/*<13226*//*13225*/(/*13227*//*13228*/j$slspread/*<13228*//*13227*/(/*13229*//*13230*/loop/*<13230*//*13229*/(/*13231*/a/*<13231*/)/*<13229*/)/*<13227*/)/*<13225*/
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 13210');})(/*!*//*13212*/item/*<13212*/)/*<13210*/ }/*<13205*/)/*<13202*/)(/*13217*/l/*<13217*/)/*<13016*/
}
}
}
if ($target.type === "j/obj") {
{
let items = $target[0];
{
let l = $target[1];
return /*13044*//*13236*/j$slobj/*<13236*//*13044*/(/*13237*//*13239*/map/*<13239*//*13237*/(/*13240*/items/*<13240*/)(/*13241*/function name_13241(item) { return /*13245*/(function match_13245($target) {
if ($target.type === "left") {
if ($target[0].type === ",") {
{
let name = $target[0][0];
{
let value = $target[0][1];
return /*13254*//*13255*/left/*<13255*//*13254*/(/*13256*//*13257*/$co/*<13257*//*13256*/(/*13258*/name/*<13258*/)(/*13259*//*13260*/loop/*<13260*//*13259*/(/*13261*/value/*<13261*/)/*<13259*/)/*<13256*/)/*<13254*/
}
}
}
}
if ($target.type === "right") {
if ($target[0].type === "j/spread") {
{
let value = $target[0][0];
return /*13267*//*13268*/right/*<13268*//*13267*/(/*13269*//*13270*/j$slspread/*<13270*//*13269*/(/*13271*//*13272*/loop/*<13272*//*13271*/(/*13273*/value/*<13273*/)/*<13271*/)/*<13269*/)/*<13267*/
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 13245');})(/*!*//*13247*/item/*<13247*/)/*<13245*/ }/*<13241*/)/*<13237*/)(/*13238*/l/*<13238*/)/*<13044*/
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 12858');})(/*!*//*12860*/expr/*<12860*/)/*<12858*/)/*<13017*/
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 12976');})(/*!*//*12979*//*12980*/pre_e/*<12980*//*12979*/(/*12981*/expr/*<12981*/)/*<12979*/)/*<12976*/
}
}
};
throw new Error('let pattern not matched 13096. ' + valueToString($target));})(/*!*/)
};
throw new Error('let pattern not matched 13026. ' + valueToString($target));})(/*!*/)/*<13023*/ } }/*<12841*/;


const map$slblock = /*13889*/function name_13889(tx) { return function name_13889(block) { return /*13896*/(function let_13896() {const $target = /*13915*/tx/*<13915*/;
if ($target.type === "tx") {
{
let pre_b = $target[6];
{
let post_b = $target[7];
return /*13916*/(function match_13916($target) {
if ($target.type === "none") {
return /*13926*/block/*<13926*/
}
if ($target.type === "some") {
if ($target[0].type === "j/block") {
{
let stmts = $target[0][0];
return /*13930*//*13931*/post_b/*<13931*//*13930*/(/*13940*//*13941*/j$slblock/*<13941*//*13940*/(/*13932*//*13933*/map/*<13933*//*13932*/(/*13939*/stmts/*<13939*/)(/*13934*//*13935*/map$slstmt/*<13935*//*13934*/(/*13936*/tx/*<13936*/)/*<13934*/)/*<13932*/)/*<13940*/)/*<13930*/
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 13916');})(/*!*//*13918*//*13919*/pre_b/*<13919*//*13918*/(/*13920*/block/*<13920*/)/*<13918*/)/*<13916*/
}
}
};
throw new Error('let pattern not matched 13905. ' + valueToString($target));})(/*!*/)/*<13896*/ } }/*<13889*/;


const map$slstmt = /*13274*/function name_13274(tx) { return function name_13274(stmt) { return /*13375*/(function let_13375() {const $target = /*13379*//*13380*/map$slstmt/*<13380*//*13379*/(/*13381*/tx/*<13381*/)/*<13379*/;
{
let loop = $target;
return (function let_13375() {const $target = /*13442*//*13443*/map$slexpr/*<13443*//*13442*/(/*13444*/tx/*<13444*/)/*<13442*/;
{
let loope = $target;
return (function let_13375() {const $target = /*13389*/tx/*<13389*/;
if ($target.type === "tx") {
{
let pre_s = $target[4];
{
let post_s = $target[5];
return /*13390*/(function match_13390($target) {
if ($target.type === "none") {
return /*13397*/stmt/*<13397*/
}
if ($target.type === "some") {
{
let stmt = $target[0];
return /*13421*//*13422*/post_s/*<13422*//*13421*/(/*13361*/(function match_13361($target) {
if ($target.type === "j/sexpr") {
{
let expr = $target[0];
{
let l = $target[1];
return /*13364*//*13425*/j$slsexpr/*<13425*//*13364*/(/*13426*//*13427*/loope/*<13427*//*13426*/(/*13429*/expr/*<13429*/)/*<13426*/)(/*13430*/l/*<13430*/)/*<13364*/
}
}
}
if ($target.type === "j/sblock") {
{
let block = $target[0];
{
let l = $target[1];
return /*13365*//*13431*/j$slsblock/*<13431*//*13365*/(/*13432*//*13942*/map$slblock/*<13942*//*13432*/(/*13943*/tx/*<13943*/)(/*13944*/block/*<13944*/)/*<13432*/)(/*13436*/l/*<13436*/)/*<13365*/
}
}
}
if ($target.type === "j/if") {
{
let cond = $target[0];
{
let yes = $target[1];
{
let no = $target[2];
{
let l = $target[3];
return /*13366*//*13437*/j$slif/*<13437*//*13366*/(/*13438*//*13445*/loope/*<13445*//*13438*/(/*13446*/cond/*<13446*/)/*<13438*/)(/*13447*//*13949*/map$slblock/*<13949*//*13447*/(/*13950*/tx/*<13950*/)(/*13951*/yes/*<13951*/)/*<13447*/)(/*13450*/(function match_13450($target) {
if ($target.type === "none") {
return /*13459*//*13460*/none/*<13460*//*13459*//*<13459*/
}
if ($target.type === "some") {
{
let v = $target[0];
return /*13464*//*13465*/some/*<13465*//*13464*/(/*13466*//*13467*/map$slblock/*<13467*//*13466*/(/*13468*/tx/*<13468*/)(/*13470*/v/*<13470*/)/*<13466*/)/*<13464*/
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 13450');})(/*!*//*13456*/no/*<13456*/)/*<13450*/)(/*13453*/l/*<13453*/)/*<13366*/
}
}
}
}
}
if ($target.type === "j/for") {
{
let string = $target[0];
{
let init = $target[1];
{
let cond = $target[2];
{
let inc = $target[3];
{
let body = $target[4];
{
let l = $target[5];
return /*13367*//*13471*/j$slfor/*<13471*//*13367*/(/*13472*/string/*<13472*/)(/*13473*//*13474*/loope/*<13474*//*13473*/(/*13475*/init/*<13475*/)/*<13473*/)(/*13476*//*13477*/loope/*<13477*//*13476*/(/*13478*/cond/*<13478*/)/*<13476*/)(/*13479*//*13480*/loope/*<13480*//*13479*/(/*13481*/inc/*<13481*/)/*<13479*/)(/*13482*//*13483*/map$slblock/*<13483*//*13482*/(/*13954*/tx/*<13954*/)(/*13484*/body/*<13484*/)/*<13482*/)(/*13486*/l/*<13486*/)/*<13367*/
}
}
}
}
}
}
}
if ($target.type === "j/break") {
{
let l = $target[0];
return /*13368*/stmt/*<13368*/
}
}
if ($target.type === "j/continue") {
{
let l = $target[0];
return /*13369*/stmt/*<13369*/
}
}
if ($target.type === "j/return") {
{
let value = $target[0];
{
let l = $target[1];
return /*13370*//*13492*/j$slreturn/*<13492*//*13370*/(/*13493*//*13494*/loope/*<13494*//*13493*/(/*13495*/value/*<13495*/)/*<13493*/)(/*13498*/l/*<13498*/)/*<13370*/
}
}
}
if ($target.type === "j/let") {
{
let pat = $target[0];
{
let value = $target[1];
{
let l = $target[2];
return /*13371*//*13499*/j$sllet/*<13499*//*13371*/(/*13500*//*13501*/map$slpat/*<13501*//*13500*/(/*13502*/tx/*<13502*/)(/*13503*/pat/*<13503*/)/*<13500*/)(/*13504*//*13505*/loope/*<13505*//*13504*/(/*13506*/value/*<13506*/)/*<13504*/)(/*13507*/l/*<13507*/)/*<13371*/
}
}
}
}
if ($target.type === "j/throw") {
{
let value = $target[0];
{
let l = $target[1];
return /*13372*//*13508*/j$slthrow/*<13508*//*13372*/(/*13509*//*13510*/loope/*<13510*//*13509*/(/*13511*/value/*<13511*/)/*<13509*/)(/*13512*/l/*<13512*/)/*<13372*/
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 13361');})(/*!*//*13363*/stmt/*<13363*/)/*<13361*/)/*<13421*/
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 13390');})(/*!*//*13392*//*13393*/pre_s/*<13393*//*13392*/(/*13394*/stmt/*<13394*/)/*<13392*/)/*<13390*/
}
}
};
throw new Error('let pattern not matched 13383. ' + valueToString($target));})(/*!*/)
};
throw new Error('let pattern not matched 13441. ' + valueToString($target));})(/*!*/)
};
throw new Error('let pattern not matched 13378. ' + valueToString($target));})(/*!*/)/*<13375*/ } }/*<13274*/;

const fold$slstmt = /*14776*/function name_14776(fx) { return function name_14776(init) { return function name_14776(stmt) { return /*14783*/(function let_14783() {const $target = /*14795*/fx/*<14795*/;
if ($target.type === "fx") {
{
let e = $target[0];
{
let p = $target[1];
{
let b = $target[2];
{
let s = $target[3];
return /*14811*//*14812*/s/*<14812*//*14811*/(/*14796*/(function match_14796($target) {
if ($target.type === "j/sexpr") {
{
let expr = $target[0];
return /*14803*//*14804*/fold$slexpr/*<14804*//*14803*/(/*14815*/fx/*<14815*/)(/*14874*/init/*<14874*/)(/*14816*/expr/*<14816*/)/*<14803*/
}
}
if ($target.type === "j/sblock") {
{
let block = $target[0];
return /*14848*//*14849*/fold$slblock/*<14849*//*14848*/(/*14850*/fx/*<14850*/)(/*14873*/init/*<14873*/)(/*14851*/block/*<14851*/)/*<14848*/
}
}
if ($target.type === "j/if") {
{
let cond = $target[0];
{
let yes = $target[1];
{
let no = $target[2];
return /*14859*//*14860*/fold$sloption/*<14860*//*14859*/(/*14936*//*14871*/fold$slblock/*<14871*//*14936*/(/*14937*/fx/*<14937*/)/*<14936*/)(/*14863*//*14864*/fold$slblock/*<14864*//*14863*/(/*14872*/fx/*<14872*/)(/*14865*//*14866*/fold$slexpr/*<14866*//*14865*/(/*14867*/fx/*<14867*/)(/*14875*/init/*<14875*/)(/*14868*/cond/*<14868*/)/*<14865*/)(/*14869*/yes/*<14869*/)/*<14863*/)(/*14870*/no/*<14870*/)/*<14859*/
}
}
}
}
if ($target.type === "j/for") {
{
let iit = $target[1];
{
let cond = $target[2];
{
let inc = $target[3];
{
let body = $target[4];
return /*14946*//*14947*/fold$slblock/*<14947*//*14946*/(/*14951*/fx/*<14951*/)(/*14948*//*14949*/fold$slexpr/*<14949*//*14948*/(/*14952*/fx/*<14952*/)(/*14950*//*14953*/fold$slexpr/*<14953*//*14950*/(/*14954*/fx/*<14954*/)(/*14955*//*14956*/fold$slexpr/*<14956*//*14955*/(/*14957*/fx/*<14957*/)(/*14958*/init/*<14958*/)(/*14963*/iit/*<14963*/)/*<14955*/)(/*14959*/cond/*<14959*/)/*<14950*/)(/*14961*/inc/*<14961*/)/*<14948*/)(/*14962*/body/*<14962*/)/*<14946*/
}
}
}
}
}
if ($target.type === "j/return") {
{
let value = $target[0];
return /*14968*//*14969*/fold$slexpr/*<14969*//*14968*/(/*14970*/fx/*<14970*/)(/*14971*/init/*<14971*/)(/*14972*/value/*<14972*/)/*<14968*/
}
}
if ($target.type === "j/throw") {
{
let value = $target[0];
return /*14977*//*14978*/fold$slexpr/*<14978*//*14977*/(/*14979*/fx/*<14979*/)(/*14980*/init/*<14980*/)(/*14981*/value/*<14981*/)/*<14977*/
}
}
if ($target.type === "j/let") {
{
let pat = $target[0];
{
let value = $target[1];
return /*14987*//*14988*/fold$slexpr/*<14988*//*14987*/(/*14989*/fx/*<14989*/)(/*14990*//*14991*/fold$slpat/*<14991*//*14990*/(/*14992*/fx/*<14992*/)(/*14993*/init/*<14993*/)(/*14994*/pat/*<14994*/)/*<14990*/)(/*14995*/value/*<14995*/)/*<14987*/
}
}
}
return /*14997*/init/*<14997*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 14796');})(/*!*//*14798*/stmt/*<14798*/)/*<14796*/)(/*14813*/stmt/*<14813*/)/*<14811*/
}
}
}
}
};
throw new Error('let pattern not matched 14789. ' + valueToString($target));})(/*!*/)/*<14783*/ } } }/*<14776*/;


const fold$slexpr = /*14817*/function name_14817(fx) { return function name_14817(init) { return function name_14817(expr) { return /*14825*/(function let_14825() {const $target = /*14834*/fx/*<14834*/;
if ($target.type === "fx") {
{
let e = $target[0];
return /*14835*//*14836*/e/*<14836*//*14835*/(/*14837*/(function match_14837($target) {
if ($target.type === "j/app") {
{
let target = $target[0];
{
let args = $target[1];
return /*15083*//*15092*/foldl/*<15092*//*15083*/(/*15086*//*15087*/fold$slexpr/*<15087*//*15086*/(/*15088*/fx/*<15088*/)(/*15089*/init/*<15089*/)(/*15090*/target/*<15090*/)/*<15086*/)(/*15091*/args/*<15091*/)(/*15094*//*15097*/fold$slexpr/*<15097*//*15094*/(/*15098*/fx/*<15098*/)/*<15094*/)/*<15083*/
}
}
}
if ($target.type === "j/bin") {
{
let left = $target[1];
{
let right = $target[2];
return /*15105*//*15106*/fold$slexpr/*<15106*//*15105*/(/*15107*/fx/*<15107*/)(/*15108*//*15109*/fold$slexpr/*<15109*//*15108*/(/*15110*/fx/*<15110*/)(/*15111*/init/*<15111*/)(/*15112*/left/*<15112*/)/*<15108*/)(/*15113*/right/*<15113*/)/*<15105*/
}
}
}
if ($target.type === "j/un") {
{
let arg = $target[1];
return /*15119*//*15120*/fold$slexpr/*<15120*//*15119*/(/*15121*/fx/*<15121*/)(/*15122*/init/*<15122*/)(/*15123*/arg/*<15123*/)/*<15119*/
}
}
if ($target.type === "j/lambda") {
{
let pats = $target[0];
{
let body = $target[1];
return /*15129*//*15130*/foldl/*<15130*//*15129*/(/*15132*//*15133*/fold$sleither/*<15133*//*15132*/(/*15171*//*15134*/fold$slblock/*<15134*//*15171*/(/*15172*/fx/*<15172*/)/*<15171*/)(/*15173*//*15174*/fold$slexpr/*<15174*//*15173*/(/*15175*/fx/*<15175*/)/*<15173*/)(/*15135*/init/*<15135*/)(/*15136*/body/*<15136*/)/*<15132*/)(/*15137*/pats/*<15137*/)(/*15138*//*15139*/fold$slpat/*<15139*//*15138*/(/*15140*/fx/*<15140*/)/*<15138*/)/*<15129*/
}
}
}
if ($target.type === "j/str") {
{
let tpls = $target[1];
return /*15181*//*15182*/foldl/*<15182*//*15181*/(/*15183*/init/*<15183*/)(/*15214*/tpls/*<15214*/)(/*15215*//*15216*/fold$slget/*<15216*//*15215*/(/*15217*/$co$co0/*<15217*/)(/*15219*//*15218*/fold$slexpr/*<15218*//*15219*/(/*15220*/fx/*<15220*/)/*<15219*/)/*<15215*/)/*<15181*/
}
}
if ($target.type === "j/attr") {
{
let target = $target[0];
return /*15226*//*15227*/fold$slexpr/*<15227*//*15226*/(/*15228*/fx/*<15228*/)(/*15229*/init/*<15229*/)(/*15230*/target/*<15230*/)/*<15226*/
}
}
if ($target.type === "j/index") {
{
let target = $target[0];
{
let idx = $target[1];
return /*15236*//*15237*/fold$slexpr/*<15237*//*15236*/(/*15238*/fx/*<15238*/)(/*15239*//*15240*/fold$slexpr/*<15240*//*15239*/(/*15241*/fx/*<15241*/)(/*15242*/init/*<15242*/)(/*15243*/target/*<15243*/)/*<15239*/)(/*15245*/idx/*<15245*/)/*<15236*/
}
}
}
if ($target.type === "j/tern") {
{
let cond = $target[0];
{
let yes = $target[1];
{
let no = $target[2];
return /*15252*//*15253*/fold$slexpr/*<15253*//*15252*/(/*15254*/fx/*<15254*/)(/*15255*//*15256*/fold$slexpr/*<15256*//*15255*/(/*15257*/fx/*<15257*/)(/*15258*//*15259*/fold$slexpr/*<15259*//*15258*/(/*15260*/fx/*<15260*/)(/*15262*/init/*<15262*/)(/*15263*/cond/*<15263*/)/*<15258*/)(/*15264*/yes/*<15264*/)/*<15255*/)(/*15265*/no/*<15265*/)/*<15252*/
}
}
}
}
if ($target.type === "j/assign") {
{
let value = $target[2];
return /*15272*//*15273*/fold$slexpr/*<15273*//*15272*/(/*15274*/fx/*<15274*/)(/*15275*/init/*<15275*/)(/*15276*/value/*<15276*/)/*<15272*/
}
}
if ($target.type === "j/array") {
{
let items = $target[0];
return /*15281*//*15282*/foldl/*<15282*//*15281*/(/*15283*/init/*<15283*/)(/*15284*/items/*<15284*/)(/*15285*//*15286*/fold$sleither/*<15286*//*15285*/(/*15288*//*15287*/fold$slexpr/*<15287*//*15288*/(/*15289*/fx/*<15289*/)/*<15288*/)(/*15290*//*15291*/fold$slget/*<15291*//*15290*/(/*15309*/spread$slinner/*<15309*/)(/*15294*//*15293*/fold$slexpr/*<15293*//*15294*/(/*15292*/fx/*<15292*/)/*<15294*/)/*<15290*/)/*<15285*/)/*<15281*/
}
}
if ($target.type === "j/obj") {
{
let items = $target[0];
return /*15314*//*15315*/foldl/*<15315*//*15314*/(/*15316*/init/*<15316*/)(/*15317*/items/*<15317*/)(/*15318*//*15319*/fold$sleither/*<15319*//*15318*/(/*15320*//*15321*/fold$slget/*<15321*//*15320*/(/*15322*/snd/*<15322*/)(/*15323*//*15324*/fold$slexpr/*<15324*//*15323*/(/*15325*/fx/*<15325*/)/*<15323*/)/*<15320*/)(/*15326*//*15327*/fold$slget/*<15327*//*15326*/(/*15328*/spread$slinner/*<15328*/)(/*15329*//*15330*/fold$slexpr/*<15330*//*15329*/(/*15331*/fx/*<15331*/)/*<15329*/)/*<15326*/)/*<15318*/)/*<15314*/
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 14837');})(/*!*//*14839*/expr/*<14839*/)/*<14837*/)(/*14840*/expr/*<14840*/)/*<14835*/
}
};
throw new Error('let pattern not matched 14828. ' + valueToString($target));})(/*!*/)/*<14825*/ } } }/*<14817*/;


const fold$slblock = /*14876*/function name_14876(fx) { return function name_14876(init) { return function name_14876(block) { return /*14884*/(function let_14884() {const $target = /*14894*/fx/*<14894*/;
if ($target.type === "fx") {
{
let b = $target[2];
return (function let_14884() {const $target = /*14904*/block/*<14904*/;
if ($target.type === "j/block") {
{
let items = $target[0];
return /*14895*//*14896*/b/*<14896*//*14895*/(/*14897*//*14898*/foldl/*<14898*//*14897*/(/*14899*/init/*<14899*/)(/*14900*/items/*<14900*/)(/*14905*//*14911*/fold$slstmt/*<14911*//*14905*/(/*14912*/fx/*<14912*/)/*<14905*/)/*<14897*/)(/*14913*/block/*<14913*/)/*<14895*/
}
};
throw new Error('let pattern not matched 14901. ' + valueToString($target));})(/*!*/)
}
};
throw new Error('let pattern not matched 14887. ' + valueToString($target));})(/*!*/)/*<14884*/ } } }/*<14876*/;

const parse_type = /*692*/function name_692(type) { return /*867*/(function match_867($target) {
if ($target.type === "cst/identifier") {
{
let id = $target[0];
{
let l = $target[1];
return /*17492*//*17493*/$lt_/*<17493*//*17492*/(/*874*//*875*/tcon/*<875*//*874*/(/*876*/id/*<876*/)(/*3997*/l/*<3997*/)/*<874*/)/*<17492*/
}
}
}
if ($target.type === "cst/list") {
if ($target[0].type === "nil") {
{
let l = $target[1];
return /*5418*//*5419*/$lt_err/*<5419*//*5418*/(/*17495*//*17496*/$co/*<17496*//*17495*/(/*17497*/l/*<17497*/)(/*5420*/"(parse-type) with empty list"/*<5420*/)/*<17495*/)(/*17499*//*17500*/tcon/*<17500*//*17499*/(/*17501*/"()"/*<17501*/)(/*17503*/l/*<17503*/)/*<17499*/)/*<5418*/
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
{
let rest = $target[0][1][1][1];
return /*17506*//*17507*/$gt$gt$eq/*<17507*//*17506*/(/*17510*//*17511*/parse_type/*<17511*//*17510*/(/*17512*/body/*<17512*/)/*<17510*/)(/*17506*/function name_17506(body) { return /*17506*//*17507*/$gt$gt$eq/*<17507*//*17506*/(/*17583*//*17584*/map_$gt/*<17584*//*17583*/(/*17585*/parse_type/*<17585*/)(/*17586*/args/*<17586*/)/*<17583*/)(/*17506*/function name_17506(args) { return /*17506*//*17507*/$gt$gt$eq/*<17507*//*17506*/(/*17574*//*17575*/do_$gt/*<17575*//*17574*/(/*17576*//*17577*/unexpected/*<17577*//*17576*/(/*17578*/"extra item in type"/*<17578*/)/*<17576*/)(/*17580*/rest/*<17580*/)/*<17574*/)(/*17506*/function name_17506(_) { return /*17587*//*17588*/$lt_/*<17588*//*17587*/(/*5588*//*5589*/foldl/*<5589*//*5588*/(/*5590*/body/*<5590*/)(/*5691*//*5593*/rev/*<5593*//*5691*/(/*5692*/args/*<5692*/)(/*5693*/nil/*<5693*/)/*<5691*/)(/*5594*/function name_5594(body) { return function name_5594(arg) { return /*5600*//*5601*/tapp/*<5601*//*5600*/(/*5602*//*5603*/tapp/*<5603*//*5602*/(/*5604*//*5605*/tcon/*<5605*//*5604*/(/*5606*/"->"/*<5606*/)(/*5608*/-1/*<5608*/)/*<5604*/)(/*5609*/arg/*<5609*/)(/*5612*/-1/*<5612*/)/*<5602*/)(/*5613*/body/*<5613*/)(/*5614*/-1/*<5614*/)/*<5600*/ } }/*<5594*/)/*<5588*/)/*<17587*/ }/*<17506*/)/*<17506*/ }/*<17506*/)/*<17506*/ }/*<17506*/)/*<17506*/
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
return /*17524*//*17525*/$gt$gt$eq/*<17525*//*17524*/(/*17528*//*17529*/map_$gt/*<17529*//*17528*/(/*17531*/parse_type/*<17531*/)(/*17532*/items/*<17532*/)/*<17528*/)(/*17524*/function name_17524(items) { return /*17533*//*17534*/$lt_/*<17534*//*17533*/(/*881*//*924*/tapps/*<924*//*881*/(/*5375*//*5376*/rev/*<5376*//*5375*/(/*925*/items/*<925*/)(/*5413*/nil/*<5413*/)/*<5375*/)(/*3998*/l/*<3998*/)/*<881*/)/*<17533*/ }/*<17524*/)/*<17524*/
}
}
}
return /*3138*//*3139*/$lt_err/*<3139*//*3138*/(/*17535*//*17536*/$co/*<17536*//*17535*/(/*17537*//*17538*/cst_loc/*<17538*//*17537*/(/*17539*/type/*<17539*/)/*<17537*/)(/*3140*/`(parse-type) Invalid type ${/*3142*//*3144*/valueToString/*<3144*//*3142*/(/*3145*/type/*<3145*/)/*<3142*/}`/*<3140*/)/*<17535*/)(/*17540*//*17541*/tcon/*<17541*//*17540*/(/*17542*/"()"/*<17542*/)(/*17544*//*17545*/cst_loc/*<17545*//*17544*/(/*17546*/type/*<17546*/)/*<17544*/)/*<17540*/)/*<3138*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 867');})(/*!*//*869*/type/*<869*/)/*<867*/ }/*<692*/;

const mk_deftype = /*1390*/function name_1390(id) { return function name_1390(li) { return function name_1390(args) { return function name_1390(items) { return function name_1390(l) { return /*16879*//*16880*/$gt$gt$eq/*<16880*//*16879*/(/*5017*//*5018*/foldr_$gt/*<5018*//*5017*/(/*17403*/nil/*<17403*/)(/*5019*/args/*<5019*/)(/*5020*/function name_5020(args) { return function name_5020(arg) { return /*5024*/(function match_5024($target) {
if ($target.type === "cst/identifier") {
{
let name = $target[0];
{
let l = $target[1];
return /*17410*//*17411*/$lt_/*<17411*//*17410*/(/*17405*//*17405*/cons/*<17405*//*17405*/(/*5031*//*5032*/$co/*<5032*//*5031*/(/*5033*/name/*<5033*/)(/*5034*/l/*<5034*/)/*<5031*/)(/*17406*/args/*<17406*/)/*<17405*/)/*<17410*/
}
}
}
return /*5036*//*5037*/$lt_err/*<5037*//*5036*/(/*17412*//*17413*/$co/*<17413*//*17412*/(/*17414*/l/*<17414*/)(/*5038*/"deftype type argument must be identifier"/*<5038*/)/*<17412*/)(/*17415*/args/*<17415*/)/*<5036*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 5024');})(/*!*//*5026*/arg/*<5026*/)/*<5024*/ } }/*<5020*/)/*<5017*/)(/*16879*/function name_16879(args) { return /*16879*//*16880*/$gt$gt$eq/*<16880*//*16879*/(/*1436*//*1437*/foldr_$gt/*<1437*//*1436*/(/*6021*/nil/*<6021*/)(/*1438*/items/*<1438*/)(/*1439*/function name_1439(res) { return function name_1439(constr) { return /*1443*/(function match_1443($target) {
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
return /*17617*//*17618*/$gt$gt$eq/*<17618*//*17617*/(/*17623*//*17624*/map_$gt/*<17624*//*17623*/(/*17625*/parse_type/*<17625*/)(/*17626*/args/*<17626*/)/*<17623*/)(/*17617*/function name_17617(args) { return /*17416*//*17417*/$lt_/*<17417*//*17416*/(/*6022*//*6022*/cons/*<6022*//*6022*/(/*1457*//*1458*/$co$co$co/*<1458*//*1457*/(/*1459*/name/*<1459*/)(/*3982*/ni/*<3982*/)(/*1460*/args/*<1460*/)(/*3984*/l/*<3984*/)/*<1457*/)(/*6023*/res/*<6023*/)/*<6022*/)/*<17416*/ }/*<17617*/)/*<17617*/
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
return /*17424*//*6007*/$lt_err/*<6007*//*17424*/(/*17426*//*17427*/$co/*<17427*//*17426*/(/*17428*/l/*<17428*/)(/*17429*/"Empty type constructor"/*<17429*/)/*<17426*/)(/*17425*/res/*<17425*/)/*<17424*/
}
}
}
return /*6028*//*17418*/$lt_err/*<17418*//*6028*/(/*17420*//*17421*/$co/*<17421*//*17420*/(/*17422*/l/*<17422*/)(/*6030*/"Invalid type constructor"/*<6030*/)/*<17420*/)(/*17423*/res/*<17423*/)/*<6028*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 1443');})(/*!*//*1445*/constr/*<1445*/)/*<1443*/ } }/*<1439*/)/*<1436*/)(/*16879*/function name_16879(items) { return /*16887*//*16888*/$lt_/*<16888*//*16887*/(/*1433*//*1434*/sdeftype/*<1434*//*1433*/(/*1435*/id/*<1435*/)(/*3980*/li/*<3980*/)(/*16884*/args/*<16884*/)(/*16886*/items/*<16886*/)(/*3981*/l/*<3981*/)/*<1433*/)/*<16887*/ }/*<16879*/)/*<16879*/ }/*<16879*/)/*<16879*/ } } } } }/*<1390*/;

const call_at_end = /*14014*/function name_14014(items) { return /*14020*/(function match_14020($target) {
if ($target.type === "nil") {
return /*14042*/none/*<14042*/
}
if ($target.type === "cons") {
if ($target[0].type === "j/return") {
if ($target[0][0].type === "j/app") {
if ($target[0][0][0].type === "j/lambda") {
{
let params = $target[0][0][0][0];
{
let body = $target[0][0][0][1];
{
let ll = $target[0][0][0][2];
{
let args = $target[0][0][1];
{
let al = $target[0][0][2];
{
let l = $target[0][1];
if ($target[1].type === "nil") {
return /*14033*/(function match_14033($target) {
if ($target === true) {
return /*14115*//*14116*/some/*<14116*//*14115*/(/*14118*//*14118*/cons/*<14118*//*14118*/(/*14119*//*14120*/j$slsblock/*<14120*//*14119*/(/*14131*//*14132*/j$slblock/*<14132*//*14131*/(/*14123*//*14124*/concat/*<14124*//*14123*/(/*14126*//*14126*/cons/*<14126*//*14126*/(/*14127*//*14128*/make_lets/*<14128*//*14127*/(/*14129*/params/*<14129*/)(/*14130*/args/*<14130*/)(/*14186*/ll/*<14186*/)/*<14127*/)(/*14126*//*14126*/cons/*<14126*//*14126*/(/*14069*/(function match_14069($target) {
if ($target.type === "left") {
if ($target[0].type === "j/block") {
{
let items = $target[0][0];
return /*14077*/items/*<14077*/
}
}
}
if ($target.type === "right") {
{
let expr = $target[0];
return /*14109*//*14109*/cons/*<14109*//*14109*/(/*14110*//*14111*/j$slreturn/*<14111*//*14110*/(/*14112*/expr/*<14112*/)(/*14113*/l/*<14113*/)/*<14110*/)(/*14109*/nil/*<14109*/)/*<14109*/
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 14069');})(/*!*//*14073*/body/*<14073*/)/*<14069*/)(/*14126*/nil/*<14126*/)/*<14126*/)/*<14126*/)/*<14123*/)/*<14131*/)(/*14133*/l/*<14133*/)/*<14119*/)(/*14118*/nil/*<14118*/)/*<14118*/)/*<14115*/
}
return /*14114*/none/*<14114*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 14033');})(/*!*//*14061*//*14062*/$eq/*<14062*//*14061*/(/*14063*//*14064*/len/*<14064*//*14063*/(/*14065*/params/*<14065*/)/*<14063*/)(/*14066*//*14067*/len/*<14067*//*14066*/(/*14068*/args/*<14068*/)/*<14066*/)/*<14061*/)/*<14033*/
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
if ($target.type === "cons") {
{
let one = $target[0];
{
let rest = $target[1];
return /*14040*/(function match_14040($target) {
if ($target.type === "some") {
{
let v = $target[0];
return /*14050*//*14051*/some/*<14051*//*14050*/(/*14052*//*14052*/cons/*<14052*//*14052*/(/*14053*/one/*<14053*/)(/*14054*/v/*<14054*/)/*<14052*/)/*<14050*/
}
}
{
let none = $target;
return /*14059*/none/*<14059*/
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 14040');})(/*!*//*14044*//*14045*/call_at_end/*<14045*//*14044*/(/*14046*/rest/*<14046*/)/*<14044*/)/*<14040*/
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 14020');})(/*!*//*14022*/items/*<14022*/)/*<14020*/ }/*<14014*/;

const j$slcompile_stmts = /*14495*/function name_14495(ctx) { return function name_14495(stmts) { return /*14504*//*14505*/join/*<14505*//*14504*/(/*14506*/"\n"/*<14506*/)(/*14508*//*14509*/map/*<14509*//*14508*/(/*14510*/stmts/*<14510*/)(/*14511*//*14512*/j$slcompile_stmt/*<14512*//*14511*/(/*14513*/ctx/*<14513*/)/*<14511*/)/*<14508*/)/*<14504*/ } }/*<14495*/;

const let_fix_shadow = /*15585*/function name_15585({0: pat, 1: init}) {

 return function name_15585(l) { return /*15593*/(function let_15593() {const $target = /*15597*//*15598*/pat_names/*<15598*//*15597*/(/*15599*/pat/*<15599*/)/*<15597*/;
{
let names = $target;
return (function let_15593() {const $target = /*15601*//*15602*/externals/*<15602*//*15601*/(/*15619*/set$slnil/*<15619*/)(/*15603*/init/*<15603*/)/*<15601*/;
{
let used = $target;
return (function let_15593() {const $target = /*15605*//*15606*/bag$slfold/*<15606*//*15605*/(/*15622*/function name_15622(shadow) { return function name_15622({0: name, 1: kind, 2: l}) {


 return /*15632*/(function match_15632($target) {
if ($target.type === "value") {
return /*15637*/(function match_15637($target) {
if ($target === true) {
return /*15644*//*15644*/cons/*<15644*//*15644*/(/*15645*//*15646*/$co/*<15646*//*15645*/(/*15647*/name/*<15647*/)(/*15648*/l/*<15648*/)/*<15645*/)(/*15649*/shadow/*<15649*/)/*<15644*/
}
return /*15653*/shadow/*<15653*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 15637');})(/*!*//*15639*//*15640*/set$slhas/*<15640*//*15639*/(/*15641*/names/*<15641*/)(/*15642*/name/*<15642*/)/*<15639*/)/*<15637*/
}
return /*15655*/shadow/*<15655*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 15632');})(/*!*//*15634*/kind/*<15634*/)/*<15632*/ } }/*<15622*/)(/*15620*/nil/*<15620*/)(/*15617*/used/*<15617*/)/*<15605*/;
{
let overlap = $target;
return (function let_15593() {const $target = /*15698*//*15699*/set$slto_list/*<15699*//*15698*/(/*15681*//*15683*/foldl/*<15683*//*15681*/(/*15684*/set$slnil/*<15684*/)(/*15685*/overlap/*<15685*/)(/*15686*/function name_15686(ov) { return function name_15686({0: name}) {
 return /*15694*//*15695*/set$sladd/*<15695*//*15694*/(/*15696*/ov/*<15696*/)(/*15697*/name/*<15697*/)/*<15694*/ } }/*<15686*/)/*<15681*/)/*<15698*/;
{
let shadow = $target;
return (function let_15593() {const $target = /*15701*//*15702*/mapi/*<15702*//*15701*/(/*15703*/0/*<15703*/)(/*15704*/shadow/*<15704*/)(/*15705*/function name_15705(i) { return function name_15705(name) { return /*15710*/`${/*15712*/name/*<15712*/}\$${/*15716*//*15714*/its/*<15714*//*15716*/(/*15717*/i/*<15717*/)/*<15716*/}`/*<15710*/ } }/*<15705*/)/*<15701*/;
{
let new_names = $target;
return (function let_15593() {const $target = /*15719*//*15720*/map$slfrom_list/*<15720*//*15719*/(/*15721*//*15722*/zip/*<15722*//*15721*/(/*15723*/shadow/*<15723*/)(/*15724*/new_names/*<15724*/)/*<15721*/)/*<15719*/;
{
let mapping = $target;
return (function let_15593() {const $target = /*15764*//*15765*/map$slfrom_list/*<15765*//*15764*/(/*15766*//*15767*/map/*<15767*//*15766*/(/*15768*/overlap/*<15768*/)(/*15769*/function name_15769({0: name, 1: loc}) {

 return /*15776*//*15777*/$co/*<15777*//*15776*/(/*15778*/loc/*<15778*/)(/*15783*//*15784*/force_opt/*<15784*//*15783*/(/*15779*//*15780*/map$slget/*<15780*//*15779*/(/*15781*/mapping/*<15781*/)(/*15782*/name/*<15782*/)/*<15779*/)/*<15783*/)/*<15776*/ }/*<15769*/)/*<15766*/)/*<15764*/;
{
let by_loc = $target;
return /*15609*/(function match_15609($target) {
if ($target.type === "nil") {
return /*15671*//*15671*/cons/*<15671*//*15671*/(/*15672*//*15666*/$co/*<15666*//*15672*/(/*15673*/pat/*<15673*/)(/*15674*/init/*<15674*/)/*<15672*/)(/*15671*/nil/*<15671*/)/*<15671*/
}
return /*16044*//*16045*/concat/*<16045*//*16044*/(/*16046*//*16046*/cons/*<16046*//*16046*/(/*15678*//*15725*/map/*<15725*//*15678*/(/*15726*//*15730*/map$slto_list/*<15730*//*15726*/(/*15731*/mapping/*<15731*/)/*<15726*/)(/*15732*/function name_15732({0: old, 1: $new}) {

 return /*15739*//*15740*/$co/*<15740*//*15739*/(/*15741*//*15742*/pvar/*<15742*//*15741*/(/*15743*/$new/*<15743*/)(/*15744*/l/*<15744*/)/*<15741*/)(/*15745*//*15746*/evar/*<15746*//*15745*/(/*15747*/old/*<15747*/)(/*15748*/l/*<15748*/)/*<15745*/)/*<15739*/ }/*<15732*/)/*<15678*/)(/*16046*//*16046*/cons/*<16046*//*16046*/(/*16047*//*16047*/cons/*<16047*//*16047*/(/*15752*//*15753*/$co/*<15753*//*15752*/(/*15754*/pat/*<15754*/)(/*15755*//*15756*/map_expr/*<15756*//*15755*/(/*15758*/function name_15758(expr) { return /*15762*/(function match_15762($target) {
if ($target.type === "evar") {
{
let l = $target[1];
return /*15793*/(function match_15793($target) {
if ($target.type === "some") {
{
let new_name = $target[0];
return /*15802*//*15803*/evar/*<15803*//*15802*/(/*15804*/new_name/*<15804*/)(/*15805*/l/*<15805*/)/*<15802*/
}
}
return /*15807*/expr/*<15807*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 15793');})(/*!*//*15795*//*15796*/map$slget/*<15796*//*15795*/(/*15797*/by_loc/*<15797*/)(/*15798*/l/*<15798*/)/*<15795*/)/*<15793*/
}
}
return /*15809*/expr/*<15809*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 15762');})(/*!*//*15788*/expr/*<15788*/)/*<15762*/ }/*<15758*/)(/*15959*/init/*<15959*/)/*<15755*/)/*<15752*/)(/*16047*/nil/*<16047*/)/*<16047*/)(/*16046*/nil/*<16046*/)/*<16046*/)/*<16046*/)/*<16044*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 15609');})(/*!*//*15657*/overlap/*<15657*/)/*<15609*/
};
throw new Error('let pattern not matched 15763. ' + valueToString($target));})(/*!*/)
};
throw new Error('let pattern not matched 15718. ' + valueToString($target));})(/*!*/)
};
throw new Error('let pattern not matched 15700. ' + valueToString($target));})(/*!*/)
};
throw new Error('let pattern not matched 15680. ' + valueToString($target));})(/*!*/)
};
throw new Error('let pattern not matched 15604. ' + valueToString($target));})(/*!*/)
};
throw new Error('let pattern not matched 15600. ' + valueToString($target));})(/*!*/)
};
throw new Error('let pattern not matched 15596. ' + valueToString($target));})(/*!*/)/*<15593*/ } }/*<15585*/;

const expand_bindings = /*16050*/function name_16050(bindings) { return function name_16050(l) { return /*16056*//*16057*/foldr/*<16057*//*16056*/(/*16058*/nil/*<16058*/)(/*16059*/bindings/*<16059*/)(/*16060*/function name_16060(res) { return function name_16060(binding) { return /*16067*//*16068*/concat/*<16068*//*16067*/(/*16074*//*16074*/cons/*<16074*//*16074*/(/*16069*//*16071*/let_fix_shadow/*<16071*//*16069*/(/*16072*/binding/*<16072*/)(/*16073*/l/*<16073*/)/*<16069*/)(/*16074*//*16074*/cons/*<16074*//*16074*/(/*16075*/res/*<16075*/)(/*16074*/nil/*<16074*/)/*<16074*/)/*<16074*/)/*<16067*/ } }/*<16060*/)/*<16056*/ } }/*<16050*/;

const parse_typealias = /*17464*/function name_17464(name) { return function name_17464(body) { return function name_17464(l) { return /*17276*//*17277*/$gt$gt$eq/*<17277*//*17276*/(/*17472*//*17473*/$lt_/*<17473*//*17472*/(/*17297*/(function match_17297($target) {
if ($target.type === "cst/identifier") {
{
let name = $target[0];
{
let nl = $target[1];
return /*17304*//*17305*/$co$co/*<17305*//*17304*/(/*17306*/name/*<17306*/)(/*17308*/nl/*<17308*/)(/*17307*/nil/*<17307*/)/*<17304*/
}
}
}
if ($target.type === "cst/list") {
if ($target[0].type === "cons") {
if ($target[0][0].type === "cst/identifier") {
{
let name = $target[0][0][0];
{
let nl = $target[0][0][1];
{
let args = $target[0][1];
return /*17321*//*17322*/$co$co/*<17322*//*17321*/(/*17323*/name/*<17323*/)(/*17324*/nl/*<17324*/)(/*17325*/args/*<17325*/)/*<17321*/
}
}
}
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 17297');})(/*!*//*17299*/name/*<17299*/)/*<17297*/)/*<17472*/)(/*17276*/function name_17276({0: name, 1: nl, 2: args}) {


 return /*17276*//*17277*/$gt$gt$eq/*<17277*//*17276*/(/*17329*//*17330*/foldr_$gt/*<17330*//*17329*/(/*17474*/nil/*<17474*/)(/*17331*/args/*<17331*/)(/*17332*/function name_17332(args) { return function name_17332(x) { return /*17336*/(function match_17336($target) {
if ($target.type === "cst/identifier") {
{
let name = $target[0];
{
let l = $target[1];
return /*17477*//*17478*/$lt_/*<17478*//*17477*/(/*17479*//*17479*/cons/*<17479*//*17479*/(/*17343*//*17344*/$co/*<17344*//*17343*/(/*17345*/name/*<17345*/)(/*17346*/l/*<17346*/)/*<17343*/)(/*17480*/args/*<17480*/)/*<17479*/)/*<17477*/
}
}
}
return /*17348*//*17349*/$lt_err/*<17349*//*17348*/(/*17484*//*17485*/$co/*<17485*//*17484*/(/*17486*//*17487*/cst_loc/*<17487*//*17486*/(/*17488*/x/*<17488*/)/*<17486*/)(/*17350*/"typealias type argument must be identifier"/*<17350*/)/*<17484*/)(/*17489*/args/*<17489*/)/*<17348*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 17336');})(/*!*//*17338*/x/*<17338*/)/*<17336*/ } }/*<17332*/)/*<17329*/)(/*17276*/function name_17276(args) { return /*17276*//*17277*/$gt$gt$eq/*<17277*//*17276*/(/*17280*//*17281*/parse_type/*<17281*//*17280*/(/*17282*/body/*<17282*/)/*<17280*/)(/*17276*/function name_17276(body) { return /*17283*//*17284*/$lt_/*<17284*//*17283*/(/*17285*//*17286*/stypealias/*<17286*//*17285*/(/*17287*/name/*<17287*/)(/*17288*/nl/*<17288*/)(/*17289*/args/*<17289*/)(/*17290*/body/*<17290*/)(/*17291*/l/*<17291*/)/*<17285*/)/*<17283*/ }/*<17276*/)/*<17276*/ }/*<17276*/)/*<17276*/ }/*<17276*/)/*<17276*/ } } }/*<17464*/;

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
{
let rest = $target[0][1][1][1];
{
let l = $target[1];
return /*16836*//*16837*/$gt$gt$eq/*<16837*//*16836*/(/*950*//*951*/parse_expr/*<951*//*950*/(/*952*/value/*<952*/)/*<950*/)(/*16836*/function name_16836(expr) { return /*16836*//*16837*/$gt$gt$eq/*<16837*//*16836*/(/*17437*//*17452*/do_$gt/*<17452*//*17437*/(/*17453*//*17455*/unexpected/*<17455*//*17453*/(/*17456*/"extra items in def"/*<17456*/)/*<17453*/)(/*17458*/rest/*<17458*/)/*<17437*/)(/*16836*/function name_16836(_) { return /*16862*//*16863*/$lt_/*<16863*//*16862*/(/*789*//*948*/sdef/*<948*//*789*/(/*949*/id/*<949*/)(/*3940*/li/*<3940*/)(/*16842*/expr/*<16842*/)(/*3941*/l/*<3941*/)/*<789*/)/*<16862*/ }/*<16836*/)/*<16836*/ }/*<16836*/)/*<16836*/
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
if ($target[0][0][0] === "def"){
{
let l = $target[1];
return /*17226*//*17227*/$lt_err/*<17227*//*17226*/(/*17228*//*17229*/$co/*<17229*//*17228*/(/*17230*/l/*<17230*/)(/*17231*/"Invalid 'def'"/*<17231*/)/*<17228*/)(/*17233*//*17234*/sunit/*<17234*//*17233*/(/*17235*/l/*<17235*/)/*<17233*/)/*<17226*/
}
}
}
}
}
if ($target.type === "cst/list") {
if ($target[0].type === "cons") {
if ($target[0][0].type === "cst/identifier") {
if ($target[0][0][0] === "defn"){
if ($target[0][1].type === "cons") {
if ($target[0][1][0].type === "cst/identifier") {
{
let id = $target[0][1][0][0];
{
let li = $target[0][1][0][1];
if ($target[0][1][1].type === "nil") {
{
let c = $target[1];
return /*16979*//*16991*/$lt_/*<16991*//*16979*/(/*16992*//*16993*/sdef/*<16993*//*16992*/(/*16994*/id/*<16994*/)(/*16995*/li/*<16995*/)(/*16996*//*16997*/evar/*<16997*//*16996*/(/*16998*/"nil"/*<16998*/)(/*17000*/c/*<17000*/)/*<16996*/)(/*17001*/c/*<17001*/)/*<16992*/)/*<16979*/
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
{
let rest = $target[0][1][1][1];
{
let c = $target[1];
return /*17057*//*17058*/$gt$gt$eq/*<17058*//*17057*/(/*17061*//*17062*/map_$gt/*<17062*//*17061*/(/*17063*/parse_pat/*<17063*/)(/*17986*/args/*<17986*/)/*<17061*/)(/*17057*/function name_17057(args) { return /*17057*//*17058*/$gt$gt$eq/*<17058*//*17057*/(/*17240*/(function match_17240($target) {
if ($target.type === "nil") {
return /*17246*//*17247*/$lt_err/*<17247*//*17246*/(/*17249*//*17250*/$co/*<17250*//*17249*/(/*17251*/b/*<17251*/)(/*17252*/"Empty arguments list"/*<17252*/)/*<17249*/)(/*17254*/$unit/*<17254*/)/*<17246*/
}
return /*17258*//*17259*/$lt_/*<17259*//*17258*/(/*17260*/$unit/*<17260*/)/*<17258*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 17240');})(/*!*//*17244*/args/*<17244*/)/*<17240*/)(/*17057*/function name_17057(_) { return /*17027*/(function match_17027($target) {
if ($target.type === "nil") {
return /*17006*//*17007*/$lt_/*<17007*//*17006*/(/*17008*//*17041*/sdef/*<17041*//*17008*/(/*17042*/id/*<17042*/)(/*17043*/li/*<17043*/)(/*17044*//*17045*/evar/*<17045*//*17044*/(/*17046*/"nil"/*<17046*/)(/*17048*/c/*<17048*/)/*<17044*/)(/*17049*/c/*<17049*/)/*<17008*/)/*<17006*/
}
if ($target.type === "cons") {
{
let body = $target[0];
{
let rest = $target[1];
return /*17050*//*17051*/$gt$gt$eq/*<17051*//*17050*/(/*17054*//*17055*/parse_expr/*<17055*//*17054*/(/*17056*/body/*<17056*/)/*<17054*/)(/*17050*/function name_17050(body) { return /*17050*//*17051*/$gt$gt$eq/*<17051*//*17050*/(/*17077*//*17078*/do_$gt/*<17078*//*17077*/(/*17152*//*17079*/unexpected/*<17079*//*17152*/(/*17153*/"extra items in defn"/*<17153*/)/*<17152*/)(/*17080*/rest/*<17080*/)/*<17077*/)(/*17050*/function name_17050(_) { return /*17038*//*17039*/$lt_/*<17039*//*17038*/(/*17040*//*17067*/sdef/*<17067*//*17040*/(/*17068*/id/*<17068*/)(/*17069*/li/*<17069*/)(/*17070*//*17071*/elambda/*<17071*//*17070*/(/*17072*/args/*<17072*/)(/*17073*/body/*<17073*/)(/*17074*/c/*<17074*/)/*<17070*/)(/*17075*/c/*<17075*/)/*<17040*/)/*<17038*/ }/*<17050*/)/*<17050*/ }/*<17050*/)/*<17050*/
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 17027');})(/*!*//*17029*/rest/*<17029*/)/*<17027*/ }/*<17057*/)/*<17057*/ }/*<17057*/)/*<17057*/
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
return /*6078*//*6092*/$lt_err/*<6092*//*6078*/(/*16866*//*16867*/$co/*<16867*//*16866*/(/*16869*/l/*<16869*/)(/*6093*/"Invalid 'defn'"/*<6093*/)/*<16866*/)(/*16951*//*17187*/sunit/*<17187*//*16951*/(/*17188*/l/*<17188*/)/*<16951*/)/*<6078*/
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
{
let name = $target[0][1][0];
{
let items = $target[0][1][1];
{
let l = $target[1];
return /*17376*/(function match_17376($target) {
if ($target.type === "cst/identifier") {
{
let id = $target[0];
{
let li = $target[1];
return /*17369*//*17370*/mk_deftype/*<17370*//*17369*/(/*17371*/id/*<17371*/)(/*17372*/li/*<17372*/)(/*17373*/nil/*<17373*/)(/*17374*/items/*<17374*/)(/*17375*/l/*<17375*/)/*<17369*/
}
}
}
if ($target.type === "cst/list") {
if ($target[0].type === "cons") {
if ($target[0][0].type === "cst/identifier") {
{
let id = $target[0][0][0];
{
let li = $target[0][0][1];
{
let args = $target[0][1];
return /*17396*//*17397*/mk_deftype/*<17397*//*17396*/(/*17398*/id/*<17398*/)(/*17399*/li/*<17399*/)(/*17400*/args/*<17400*/)(/*17401*/items/*<17401*/)(/*17402*/l/*<17402*/)/*<17396*/
}
}
}
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 17376');})(/*!*//*17378*/name/*<17378*/)/*<17376*/
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
return /*17202*//*17203*/$lt_err/*<17203*//*17202*/(/*17204*//*17205*/$co/*<17205*//*17204*/(/*17206*/l/*<17206*/)(/*17207*/"Invalid deftype"/*<17207*/)/*<17204*/)(/*17210*//*17209*/sunit/*<17209*//*17210*/(/*17211*/l/*<17211*/)/*<17210*/)/*<17202*/
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
{
let name = $target[0][1][0];
if ($target[0][1][1].type === "cons") {
{
let body = $target[0][1][1][0];
if ($target[0][1][1][1].type === "nil") {
{
let l = $target[1];
return /*17460*//*17459*/parse_typealias/*<17459*//*17460*/(/*17461*/name/*<17461*/)(/*17462*/body/*<17462*/)(/*17463*/l/*<17463*/)/*<17460*/
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
return /*16852*//*16853*/$gt$gt$eq/*<16853*//*16852*/(/*954*//*955*/parse_expr/*<955*//*954*/(/*956*/cst/*<956*/)/*<954*/)(/*16852*/function name_16852(expr) { return /*16877*//*16878*/$lt_/*<16878*//*16877*/(/*3170*//*3171*/sexpr/*<3171*//*3170*/(/*16856*/expr/*<16856*/)(/*4949*//*17212*/cst_loc/*<17212*//*4949*/(/*17213*/cst/*<17213*/)/*<4949*/)/*<3170*/)/*<16877*/ }/*<16852*/)/*<16852*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 606');})(/*!*//*608*/cst/*<608*/)/*<606*/ }/*<599*/;


const parse_expr = /*957*/function name_957(cst) { return /*963*/(function match_963($target) {
if ($target.type === "cst/identifier") {
if ($target[0] === "true"){
{
let l = $target[1];
return /*17636*//*17637*/$lt_/*<17637*//*17636*/(/*974*//*978*/eprim/*<978*//*974*/(/*979*//*980*/pbool/*<980*//*979*/(/*981*/true/*<981*/)(/*3511*/l/*<3511*/)/*<979*/)(/*3510*/l/*<3510*/)/*<974*/)/*<17636*/
}
}
}
if ($target.type === "cst/identifier") {
if ($target[0] === "false"){
{
let l = $target[1];
return /*17638*//*17639*/$lt_/*<17639*//*17638*/(/*987*//*989*/eprim/*<989*//*987*/(/*990*//*991*/pbool/*<991*//*990*/(/*992*/false/*<992*/)(/*3512*/l/*<3512*/)/*<990*/)(/*3513*/l/*<3513*/)/*<987*/)/*<17638*/
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
return /*17642*//*17643*/$gt$gt$eq/*<17643*//*17642*/(/*1010*//*1011*/map_$gt/*<1011*//*1010*/(/*1013*/function name_1013({0: expr, 1: suffix, 2: l}) {


 return /*1017*//*1018*/$gt$gt$eq/*<1018*//*1017*/(/*1027*//*1028*/parse_expr/*<1028*//*1027*/(/*1029*/expr/*<1029*/)/*<1027*/)(/*1017*/function name_1017(expr) { return /*17654*//*17655*/$lt_/*<17655*//*17654*/(/*1025*//*1026*/$co$co/*<1026*//*1025*/(/*17653*/expr/*<17653*/)(/*1030*/suffix/*<1030*/)(/*3516*/l/*<3516*/)/*<1025*/)/*<17654*/ }/*<1017*/)/*<1017*/ }/*<1013*/)(/*17648*/templates/*<17648*/)/*<1010*/)(/*17642*/function name_17642(tpls) { return /*17640*//*17641*/$lt_/*<17641*//*17640*/(/*994*//*1008*/estr/*<1008*//*994*/(/*1009*/first/*<1009*/)(/*17656*/tpls/*<17656*/)(/*3514*/l/*<3514*/)/*<994*/)/*<17640*/ }/*<17642*/)/*<17642*/
}
}
}
}
if ($target.type === "cst/identifier") {
{
let id = $target[0];
{
let l = $target[1];
return /*17657*//*17658*/$lt_/*<17658*//*17657*/(/*970*/(function match_970($target) {
if ($target.type === "some") {
{
let int = $target[0];
return /*1061*//*1062*/eprim/*<1062*//*1061*/(/*1063*//*1064*/pint/*<1064*//*1063*/(/*1065*/int/*<1065*/)(/*3535*/l/*<3535*/)/*<1063*/)(/*3536*/l/*<3536*/)/*<1061*/
}
}
if ($target.type === "none") {
return /*1068*//*1069*/evar/*<1069*//*1068*/(/*1071*/id/*<1071*/)(/*3537*/l/*<3537*/)/*<1068*/
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 970');})(/*!*//*1055*//*1056*/string_to_int/*<1056*//*1055*/(/*1057*/id/*<1057*/)/*<1055*/)/*<970*/)/*<17657*/
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
return /*17659*//*17660*/$gt$gt$eq/*<17660*//*17659*/(/*3080*//*3081*/parse_expr/*<3081*//*3080*/(/*3082*/body/*<3082*/)/*<3080*/)(/*17659*/function name_17659(expr) { return /*17666*//*17667*/$lt_/*<17667*//*17666*/(/*3070*//*3079*/equot/*<3079*//*3070*/(/*8412*//*8413*/quot$slexpr/*<8413*//*8412*/(/*17665*/expr/*<17665*/)/*<8412*/)(/*3548*/l/*<3548*/)/*<3070*/)/*<17666*/ }/*<17659*/)/*<17659*/
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
return /*17886*//*17887*/$lt_/*<17887*//*17886*/(/*8414*//*8415*/equot/*<8415*//*8414*/(/*3091*//*3101*/quot$slquot/*<3101*//*3091*/(/*3102*/body/*<3102*/)/*<3091*/)(/*8416*/l/*<8416*/)/*<8414*/)/*<17886*/
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
return /*17668*//*17669*/$gt$gt$eq/*<17669*//*17668*/(/*17672*//*17673*/parse_stmt/*<17673*//*17672*/(/*17674*/body/*<17674*/)/*<17672*/)(/*17668*/function name_17668(stmt) { return /*17675*//*17676*/$lt_/*<17676*//*17675*/(/*8417*//*8418*/equot/*<8418*//*8417*/(/*5114*//*5122*/quot$slstmt/*<5122*//*5114*/(/*16889*/stmt/*<16889*/)/*<5114*/)(/*8419*/l/*<8419*/)/*<8417*/)/*<17675*/ }/*<17668*/)/*<17668*/
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
return /*17677*//*17678*/$gt$gt$eq/*<17678*//*17677*/(/*17682*//*17683*/parse_type/*<17683*//*17682*/(/*17684*/body/*<17684*/)/*<17682*/)(/*17677*/function name_17677(body) { return /*17685*//*17686*/$lt_/*<17686*//*17685*/(/*8420*//*8421*/equot/*<8421*//*8420*/(/*5292*//*5302*/quot$sltype/*<5302*//*5292*/(/*17615*/body/*<17615*/)/*<5292*/)(/*8424*/l/*<8424*/)/*<8420*/)/*<17685*/ }/*<17677*/)/*<17677*/
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
return /*17688*//*17689*/$gt$gt$eq/*<17689*//*17688*/(/*17692*//*17693*/parse_pat/*<17693*//*17692*/(/*17694*/body/*<17694*/)/*<17692*/)(/*17688*/function name_17688(body) { return /*17695*//*17696*/$lt_/*<17696*//*17695*/(/*8422*//*8423*/equot/*<8423*//*8422*/(/*5319*//*5320*/quot$slpat/*<5320*//*5319*/(/*5321*/body/*<5321*/)/*<5319*/)(/*8425*/l/*<8425*/)/*<8422*/)/*<17695*/ }/*<17688*/)/*<17688*/
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
return /*17892*//*17893*/$gt$gt$eq/*<17893*//*17892*/(/*17896*//*17897*/parse_expr/*<17897*//*17896*/(/*17898*/cond/*<17898*/)/*<17896*/)(/*17892*/function name_17892(cond) { return /*17892*//*17893*/$gt$gt$eq/*<17893*//*17892*/(/*17900*//*17901*/parse_expr/*<17901*//*17900*/(/*17902*/yes/*<17902*/)/*<17900*/)(/*17892*/function name_17892(yes) { return /*17892*//*17893*/$gt$gt$eq/*<17893*//*17892*/(/*17904*//*17905*/parse_expr/*<17905*//*17904*/(/*17906*/no/*<17906*/)/*<17904*/)(/*17892*/function name_17892(no) { return /*17697*//*17698*/$lt_/*<17698*//*17697*/(/*4575*//*4586*/ematch/*<4586*//*4575*/(/*4587*/cond/*<4587*/)(/*4590*//*4590*/cons/*<4590*//*4590*/(/*4591*//*4592*/$co/*<4592*//*4591*/(/*4593*//*4594*/pprim/*<4594*//*4593*/(/*4597*//*4598*/pbool/*<4598*//*4597*/(/*4599*/true/*<4599*/)(/*4600*/l/*<4600*/)/*<4597*/)(/*4601*/l/*<4601*/)/*<4593*/)(/*4602*/yes/*<4602*/)/*<4591*/)(/*4590*//*4590*/cons/*<4590*//*4590*/(/*4605*//*4606*/$co/*<4606*//*4605*/(/*4607*//*4608*/pany/*<4608*//*4607*/(/*4609*/l/*<4609*/)/*<4607*/)(/*4610*/no/*<4610*/)/*<4605*/)(/*4590*/nil/*<4590*/)/*<4590*/)/*<4590*/)(/*4613*/l/*<4613*/)/*<4575*/)/*<17697*/ }/*<17892*/)/*<17892*/ }/*<17892*/)/*<17892*/ }/*<17892*/)/*<17892*/
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
return /*17702*//*17703*/$gt$gt$eq/*<17703*//*17702*/(/*17707*//*17708*/map_$gt/*<17708*//*17707*/(/*17709*/parse_pat/*<17709*/)(/*17710*/args/*<17710*/)/*<17707*/)(/*17702*/function name_17702(args) { return /*17702*//*17703*/$gt$gt$eq/*<17703*//*17702*/(/*17712*//*17715*/parse_expr/*<17715*//*17712*/(/*17716*/body/*<17716*/)/*<17712*/)(/*17702*/function name_17702(body) { return /*17717*//*17718*/$lt_/*<17718*//*17717*/(/*1073*//*1213*/elambda/*<1213*//*1073*/(/*8408*/args/*<8408*/)(/*1214*/body/*<1214*/)(/*1217*/b/*<1217*/)/*<1073*/)/*<17717*/ }/*<17702*/)/*<17702*/ }/*<17702*/)/*<17702*/
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
return /*6060*//*6070*/$lt_err/*<6070*//*6060*/(/*17628*//*17629*/$co/*<17629*//*17628*/(/*17630*/l/*<17630*/)(/*6071*/`Invalid 'fn' ${/*6073*//*6075*/int_to_string/*<6075*//*6073*/(/*6076*/l/*<6076*/)/*<6073*/}`/*<6071*/)/*<17628*/)(/*17631*//*17632*/evar/*<17632*//*17631*/(/*17633*/"()"/*<17633*/)(/*17635*/l/*<17635*/)/*<17631*/)/*<6060*/
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
return /*17719*//*17720*/$gt$gt$eq/*<17720*//*17719*/(/*17723*//*17724*/parse_expr/*<17724*//*17723*/(/*17725*/target/*<17725*/)/*<17723*/)(/*17719*/function name_17719(target) { return /*17719*//*17720*/$gt$gt$eq/*<17720*//*17719*/(/*18021*//*18022*/pairs/*<18022*//*18021*/(/*18023*/cases/*<18023*/)/*<18021*/)(/*17719*/function name_17719(cases) { return /*17719*//*17720*/$gt$gt$eq/*<17720*//*17719*/(/*17729*//*17730*/map_$gt/*<17730*//*17729*/(/*17731*/function name_17731({0: pat, 1: expr}) {

 return /*17735*//*17736*/$gt$gt$eq/*<17736*//*17735*/(/*17745*//*17746*/parse_pat/*<17746*//*17745*/(/*17747*/pat/*<17747*/)/*<17745*/)(/*17735*/function name_17735(pat) { return /*17735*//*17736*/$gt$gt$eq/*<17736*//*17735*/(/*17749*//*17750*/parse_expr/*<17750*//*17749*/(/*17751*/expr/*<17751*/)/*<17749*/)(/*17735*/function name_17735(expr) { return /*17752*//*17753*/$lt_/*<17753*//*17752*/(/*17754*//*17755*/$co/*<17755*//*17754*/(/*17756*/pat/*<17756*/)(/*17757*/expr/*<17757*/)/*<17754*/)/*<17752*/ }/*<17735*/)/*<17735*/ }/*<17735*/)/*<17735*/ }/*<17731*/)(/*17987*/cases/*<17987*/)/*<17729*/)(/*17719*/function name_17719(cases) { return /*17758*//*17759*/$lt_/*<17759*//*17758*/(/*2947*//*2962*/ematch/*<2962*//*2947*/(/*2963*/target/*<2963*/)(/*2966*/cases/*<2966*/)(/*3601*/l/*<3601*/)/*<2947*/)/*<17758*/ }/*<17719*/)/*<17719*/ }/*<17719*/)/*<17719*/ }/*<17719*/)/*<17719*/
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
return /*17760*//*17761*/$gt$gt$eq/*<17761*//*17760*/(/*18025*//*18026*/pairs/*<18026*//*18025*/(/*18027*/inits/*<18027*/)/*<18025*/)(/*17760*/function name_17760(inits) { return /*17760*//*17761*/$gt$gt$eq/*<17761*//*17760*/(/*8372*//*8373*/map_$gt/*<8373*//*8372*/(/*8377*/function name_8377({0: pat, 1: value}) {

 return /*8387*//*8388*/$gt$gt$eq/*<8388*//*8387*/(/*17774*//*17775*/parse_pat/*<17775*//*17774*/(/*17776*/pat/*<17776*/)/*<17774*/)(/*8387*/function name_8387(pat) { return /*8387*//*8388*/$gt$gt$eq/*<8388*//*8387*/(/*17778*//*17779*/parse_expr/*<17779*//*17778*/(/*17780*/value/*<17780*/)/*<17778*/)(/*8387*/function name_8387(value) { return /*8395*//*17781*/$lt_/*<17781*//*8395*/(/*17782*//*17783*/$co/*<17783*//*17782*/(/*17784*/pat/*<17784*/)(/*17785*/value/*<17785*/)/*<17782*/)/*<8395*/ }/*<8387*/)/*<8387*/ }/*<8387*/)/*<8387*/ }/*<8377*/)(/*17769*/inits/*<17769*/)/*<8372*/)(/*17760*/function name_17760(bindings) { return /*17760*//*17761*/$gt$gt$eq/*<17761*//*17760*/(/*17788*//*17789*/parse_expr/*<17789*//*17788*/(/*17790*/body/*<17790*/)/*<17788*/)(/*17760*/function name_17760(body) { return /*17786*//*17787*/$lt_/*<17787*//*17786*/(/*8370*//*8371*/elet/*<8371*//*8370*/(/*17766*/bindings/*<17766*/)(/*8404*/body/*<8404*/)(/*8407*/l/*<8407*/)/*<8370*/)/*<17786*/ }/*<17760*/)/*<17760*/ }/*<17760*/)/*<17760*/ }/*<17760*/)/*<17760*/
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
return /*17791*//*17792*/$gt$gt$eq/*<17792*//*17791*/(/*17797*//*17798*/parse_expr/*<17798*//*17797*/(/*17799*/body/*<17799*/)/*<17797*/)(/*17791*/function name_17791(body) { return /*17791*//*17792*/$gt$gt$eq/*<17792*//*17791*/(/*18029*//*18030*/pairs/*<18030*//*18029*/(/*18031*/inits/*<18031*/)/*<18029*/)(/*17791*/function name_17791(inits) { return /*6142*//*6156*/foldr_$gt/*<6156*//*6142*/(/*6157*/body/*<6157*/)(/*6162*/inits/*<6162*/)(/*6163*/function name_6163(body) { return function name_6163({0: pat, 1: value}) {

 return /*6168*//*6169*/$gt$gt$eq/*<6169*//*6168*/(/*17805*//*17806*/parse_expr/*<17806*//*17805*/(/*17807*/value/*<17807*/)/*<17805*/)(/*6168*/function name_6168(value) { return /*6168*//*6169*/$gt$gt$eq/*<6169*//*6168*/(/*17809*//*17810*/parse_pat/*<17810*//*17809*/(/*17811*/pat/*<17811*/)/*<17809*/)(/*6168*/function name_6168(pat) { return /*17813*//*17814*/$lt_/*<17814*//*17813*/(/*6176*//*6178*/eapp/*<6178*//*6176*/(/*7846*//*7847*/evar/*<7847*//*7846*/(/*7848*/">>="/*<7848*/)(/*7850*/el/*<7850*/)/*<7846*/)(/*8367*//*8367*/cons/*<8367*//*8367*/(/*6179*/value/*<6179*/)(/*8367*//*8367*/cons/*<8367*//*8367*/(/*6182*//*6183*/elambda/*<6183*//*6182*/(/*8368*//*8368*/cons/*<8368*//*8368*/(/*17812*/pat/*<17812*/)(/*8368*/nil/*<8368*/)/*<8368*/)(/*6187*/body/*<6187*/)(/*6204*/l/*<6204*/)/*<6182*/)(/*8367*/nil/*<8367*/)/*<8367*/)/*<8367*/)(/*6203*/l/*<6203*/)/*<6176*/)/*<17813*/ }/*<6168*/)/*<6168*/ }/*<6168*/)/*<6168*/ } }/*<6163*/)/*<6142*/ }/*<17791*/)/*<17791*/ }/*<17791*/)/*<17791*/
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
return /*6046*//*6047*/$lt_err/*<6047*//*6046*/(/*17815*//*17816*/$co/*<17816*//*17815*/(/*17817*/l/*<17817*/)(/*6048*/`Invalid 'let' ${/*6052*//*6050*/int_to_string/*<6050*//*6052*/(/*6054*/l/*<6054*/)/*<6052*/}`/*<6048*/)/*<17815*/)(/*17818*//*17819*/evar/*<17819*//*17818*/(/*17820*/"()"/*<17820*/)(/*17822*/l/*<17822*/)/*<17818*/)/*<6046*/
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
return /*17825*//*17826*/$lt_/*<17826*//*17825*/(/*7553*//*7554*/evar/*<7554*//*7553*/(/*7555*/"()"/*<7555*/)(/*7557*/l/*<7557*/)/*<7553*/)/*<17825*/
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
return /*17831*//*17832*/$gt$gt$eq/*<17832*//*17831*/(/*17836*//*17837*/parse_expr/*<17837*//*17836*/(/*17838*/target/*<17838*/)/*<17836*/)(/*17831*/function name_17831(target) { return /*17831*//*17832*/$gt$gt$eq/*<17832*//*17831*/(/*17840*//*17841*/map_$gt/*<17841*//*17840*/(/*17842*/parse_expr/*<17842*/)(/*17843*/args/*<17843*/)/*<17840*/)(/*17831*/function name_17831(args) { return /*17827*//*17828*/$lt_/*<17828*//*17827*/(/*1586*//*1587*/eapp/*<1587*//*1586*/(/*8362*/target/*<8362*/)(/*8359*/args/*<8359*/)(/*3745*/l/*<3745*/)/*<1586*/)/*<17827*/ }/*<17831*/)/*<17831*/ }/*<17831*/)/*<17831*/
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
return /*17844*//*17845*/$lt_/*<17845*//*17844*/(/*7574*//*7576*/evar/*<7576*//*7574*/(/*7577*/","/*<7577*/)(/*7579*/il/*<7579*/)/*<7574*/)/*<17844*/
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
return /*17848*//*17849*/$gt$gt$eq/*<17849*//*17848*/(/*17852*//*17853*/parse_expr/*<17853*//*17852*/(/*17854*/one/*<17854*/)/*<17852*/)(/*17848*/function name_17848(one) { return /*17848*//*17849*/$gt$gt$eq/*<17849*//*17848*/(/*17856*//*17857*/parse_tuple/*<17857*//*17856*/(/*17858*/rest/*<17858*/)(/*17859*/il/*<17859*/)(/*17860*/l/*<17860*/)/*<17856*/)(/*17848*/function name_17848(tuple) { return /*17846*//*17847*/$lt_/*<17847*//*17846*/(/*7596*//*7597*/eapp/*<7597*//*7596*/(/*7598*//*7599*/evar/*<7599*//*7598*/(/*7600*/","/*<7600*/)(/*7605*/il/*<7605*/)/*<7598*/)(/*8428*//*8428*/cons/*<8428*//*8428*/(/*7602*/one/*<7602*/)(/*8428*//*8428*/cons/*<8428*//*8428*/(/*7591*/tuple/*<7591*/)(/*8428*/nil/*<8428*/)/*<8428*/)/*<8428*/)(/*7606*/l/*<7606*/)/*<7596*/)/*<17846*/ }/*<17848*/)/*<17848*/ }/*<17848*/)/*<17848*/
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 7570');})(/*!*//*7572*/args/*<7572*/)/*<7570*/ } } }/*<7563*/;


const parse_array = /*3416*/function name_3416(args) { return function name_3416(l) { return /*3422*/(function match_3422($target) {
if ($target.type === "nil") {
return /*17861*//*17862*/$lt_/*<17862*//*17861*/(/*3426*//*3427*/evar/*<3427*//*3426*/(/*3428*/"nil"/*<3428*/)(/*3675*/l/*<3675*/)/*<3426*/)/*<17861*/
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
return /*17867*//*17868*/$gt$gt$eq/*<17868*//*17867*/(/*17871*//*17872*/parse_expr/*<17872*//*17871*/(/*17873*/one/*<17873*/)/*<17871*/)(/*17867*/function name_17867(one) { return /*17867*//*17868*/$gt$gt$eq/*<17868*//*17867*/(/*17875*//*17876*/parse_array/*<17876*//*17875*/(/*17877*/rest/*<17877*/)(/*17878*/l/*<17878*/)/*<17875*/)(/*17867*/function name_17867(rest) { return /*17865*//*17866*/$lt_/*<17866*//*17865*/(/*3443*//*3444*/eapp/*<3444*//*3443*/(/*3450*//*3451*/evar/*<3451*//*3450*/(/*3452*/"cons"/*<3452*/)(/*3677*/l/*<3677*/)/*<3450*/)(/*8429*//*8429*/cons/*<8429*//*8429*/(/*3454*/one/*<3454*/)(/*8429*//*8429*/cons/*<8429*//*8429*/(/*3457*/rest/*<3457*/)(/*8429*/nil/*<8429*/)/*<8429*/)/*<8429*/)(/*3679*/l/*<3679*/)/*<3443*/)/*<17865*/ }/*<17867*/)/*<17867*/ }/*<17867*/)/*<17867*/
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 3422');})(/*!*//*3424*/args/*<3424*/)/*<3422*/ } }/*<3416*/;

const compile$slj = /*11476*/function name_11476(expr) { return function name_11476(trace) { return /*16265*//*16266*/maybe_trace/*<16266*//*16265*/(/*16267*//*16268*/expr_loc/*<16268*//*16267*/(/*16269*/expr/*<16269*/)/*<16267*/)(/*16270*/trace/*<16270*/)(/*11496*/(function match_11496($target) {
if ($target.type === "estr") {
{
let first = $target[0];
{
let tpls = $target[1];
{
let l = $target[2];
return /*11504*//*12124*/j$slstr/*<12124*//*11504*/(/*12125*/first/*<12125*/)(/*12126*//*12127*/map/*<12127*//*12126*/(/*12128*/tpls/*<12128*/)(/*12129*/function name_12129({0: expr, 1: suffix, 2: l}) {


 return /*12136*//*12137*/$co$co/*<12137*//*12136*/(/*12138*//*12139*/compile$slj/*<12139*//*12138*/(/*12140*/expr/*<12140*/)(/*12141*/trace/*<12141*/)/*<12138*/)(/*12142*/suffix/*<12142*/)(/*12147*/l/*<12147*/)/*<12136*/ }/*<12129*/)/*<12126*/)(/*12145*/l/*<12145*/)/*<11504*/
}
}
}
}
if ($target.type === "eprim") {
{
let prim = $target[0];
{
let l = $target[1];
return /*11563*/(function match_11563($target) {
if ($target.type === "pint") {
{
let int = $target[0];
{
let pl = $target[1];
return /*11570*//*12148*/j$slprim/*<12148*//*11570*/(/*12149*//*12150*/j$slint/*<12150*//*12149*/(/*12151*/int/*<12151*/)(/*12152*/pl/*<12152*/)/*<12149*/)(/*12153*/l/*<12153*/)/*<11570*/
}
}
}
if ($target.type === "pbool") {
{
let bool = $target[0];
{
let pl = $target[1];
return /*11577*//*12154*/j$slprim/*<12154*//*11577*/(/*12155*//*12156*/j$slbool/*<12156*//*12155*/(/*12157*/bool/*<12157*/)(/*12158*/pl/*<12158*/)/*<12155*/)(/*12159*/l/*<12159*/)/*<11577*/
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 11563');})(/*!*//*11565*/prim/*<11565*/)/*<11563*/
}
}
}
if ($target.type === "evar") {
{
let name = $target[0];
{
let l = $target[1];
return /*11590*//*12160*/j$slvar/*<12160*//*11590*/(/*12161*/name/*<12161*/)(/*12162*/l/*<12162*/)/*<11590*/
}
}
}
if ($target.type === "equot") {
{
let inner = $target[0];
{
let l = $target[1];
return /*12175*//*12176*/j$slraw/*<12176*//*12175*/(/*11597*//*11598*/quot$sljsonify/*<11598*//*11597*/(/*11599*/inner/*<11599*/)/*<11597*/)(/*12177*/l/*<12177*/)/*<12175*/
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
return /*11605*//*11606*/foldr/*<11606*//*11605*/(/*11607*//*11608*/compile$slj/*<11608*//*11607*/(/*11609*/body/*<11609*/)(/*11610*/trace/*<11610*/)/*<11607*/)(/*11611*/pats/*<11611*/)(/*11612*/function name_11612(body) { return function name_11612(pat) { return /*12180*//*12181*/j$sllambda/*<12181*//*12180*/(/*12182*//*12182*/cons/*<12182*//*12182*/(/*12186*/(function match_12186($target) {
if ($target.type === "none") {
return /*12190*//*12191*/j$slpvar/*<12191*//*12190*/(/*12284*/`_${/*12288*//*12286*/its/*<12286*//*12288*/(/*12289*/l/*<12289*/)/*<12288*/}`/*<12284*/)(/*12193*/l/*<12193*/)/*<12190*/
}
if ($target.type === "some") {
{
let pat = $target[0];
return /*12197*/pat/*<12197*/
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 12186');})(/*!*//*12184*//*12183*/pat_$gtj$slpat/*<12183*//*12184*/(/*12185*/pat/*<12185*/)/*<12184*/)/*<12186*/)(/*12182*/nil/*<12182*/)/*<12182*/)(/*16318*/(function match_16318($target) {
if ($target.type === "nil") {
return /*12200*//*12198*/right/*<12198*//*12200*/(/*12201*/body/*<12201*/)/*<12200*/
}
{
let stmts = $target;
return /*16327*//*16328*/left/*<16328*//*16327*/(/*16329*//*16330*/j$slblock/*<16330*//*16329*/(/*16331*//*16332*/concat/*<16332*//*16331*/(/*16333*//*16333*/cons/*<16333*//*16333*/(/*16334*/stmts/*<16334*/)(/*16333*//*16333*/cons/*<16333*//*16333*/(/*16335*//*16335*/cons/*<16335*//*16335*/(/*16336*//*16337*/j$slreturn/*<16337*//*16336*/(/*16338*/body/*<16338*/)(/*16339*/l/*<16339*/)/*<16336*/)(/*16335*/nil/*<16335*/)/*<16335*/)(/*16333*/nil/*<16333*/)/*<16333*/)/*<16333*/)/*<16331*/)/*<16329*/)/*<16327*/
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 16318');})(/*!*//*16320*//*16321*/trace_pat/*<16321*//*16320*/(/*16322*/pat/*<16322*/)(/*16323*/trace/*<16323*/)/*<16320*/)/*<16318*/)(/*12199*/l/*<12199*/)/*<12180*/ } }/*<11612*/)/*<11605*/
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
return /*16026*//*16025*/compile_let$slj/*<16025*//*16026*/(/*16028*/body/*<16028*/)(/*16029*/trace/*<16029*/)(/*16030*/bindings/*<16030*/)(/*16031*/l/*<16031*/)/*<16026*/
}
}
}
}
if ($target.type === "eapp") {
if ($target[0].type === "evar") {
{
let op = $target[0][0];
{
let ol = $target[0][1];
if ($target[1].type === "cons") {
{
let one = $target[1][0];
if ($target[1][1].type === "cons") {
{
let two = $target[1][1][0];
if ($target[1][1][1].type === "nil") {
{
let l = $target[2];
return /*12659*/(function match_12659($target) {
if ($target === true) {
return /*12537*//*12548*/j$slbin/*<12548*//*12537*/(/*12549*/op/*<12549*/)(/*12554*//*12551*/compile$slj/*<12551*//*12554*/(/*12555*/one/*<12555*/)(/*12556*/trace/*<12556*/)/*<12554*/)(/*12557*//*12552*/compile$slj/*<12552*//*12557*/(/*12558*/two/*<12558*/)(/*12559*/trace/*<12559*/)/*<12557*/)(/*12553*/l/*<12553*/)/*<12537*/
}
return /*12665*//*12690*/app$slj/*<12690*//*12665*/(/*12691*//*12692*/evar/*<12692*//*12691*/(/*12693*/op/*<12693*/)(/*12694*/ol/*<12694*/)/*<12691*/)(/*12695*//*12695*/cons/*<12695*//*12695*/(/*12697*/one/*<12697*/)(/*12695*//*12695*/cons/*<12695*//*12695*/(/*12698*/two/*<12698*/)(/*12695*/nil/*<12695*/)/*<12695*/)/*<12695*/)(/*12700*/trace/*<12700*/)(/*12699*/l/*<12699*/)/*<12665*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 12659');})(/*!*//*12662*//*12663*/is_bop/*<12663*//*12662*/(/*12664*/op/*<12664*/)/*<12662*/)/*<12659*/
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
if ($target.type === "eapp") {
{
let target = $target[0];
{
let args = $target[1];
{
let l = $target[2];
return /*12669*//*12668*/app$slj/*<12668*//*12669*/(/*12671*/target/*<12671*/)(/*12689*/args/*<12689*/)(/*12672*/trace/*<12672*/)(/*12676*/l/*<12676*/)/*<12669*/
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
return /*12230*//*12231*/j$slapp/*<12231*//*12230*/(/*12232*//*12233*/j$sllambda/*<12233*//*12232*/(/*12234*//*12234*/cons/*<12234*//*12234*/(/*12243*//*12244*/j$slpvar/*<12244*//*12243*/(/*12247*/"\$target"/*<12247*/)(/*12249*/l/*<12249*/)/*<12243*/)(/*12234*/nil/*<12234*/)/*<12234*/)(/*12250*//*12252*/left/*<12252*//*12250*/(/*13965*//*13966*/j$slblock/*<13966*//*13965*/(/*14629*//*14630*/concat/*<14630*//*14629*/(/*14631*//*14631*/cons/*<14631*//*14631*/(/*12253*//*12254*/map/*<12254*//*12253*/(/*12255*/cases/*<12255*/)(/*12256*/function name_12256({0: pat, 1: body}) {

 return /*12402*//*12403*/j$slsblock/*<12403*//*12402*/(/*13969*//*13970*/j$slblock/*<13970*//*13969*/(/*12265*//*12266*/compile_pat$slj/*<12266*//*12265*/(/*12272*/pat/*<12272*/)(/*12267*//*12268*/j$slvar/*<12268*//*12267*/(/*12269*/"\$target"/*<12269*/)(/*12271*/l/*<12271*/)/*<12267*/)(/*16340*//*16341*/concat/*<16341*//*16340*/(/*16342*//*16342*/cons/*<16342*//*16342*/(/*16343*//*16344*/trace_pat/*<16344*//*16343*/(/*16345*/pat/*<16345*/)(/*16346*/trace/*<16346*/)/*<16343*/)(/*16342*//*16342*/cons/*<16342*//*16342*/(/*12273*//*12273*/cons/*<12273*//*12273*/(/*12274*//*12275*/j$slreturn/*<12275*//*12274*/(/*12276*//*12277*/compile$slj/*<12277*//*12276*/(/*12278*/body/*<12278*/)(/*12279*/trace/*<12279*/)/*<12276*/)(/*12280*/l/*<12280*/)/*<12274*/)(/*12273*/nil/*<12273*/)/*<12273*/)(/*16342*/nil/*<16342*/)/*<16342*/)/*<16342*/)/*<16340*/)(/*12281*/trace/*<12281*/)/*<12265*/)/*<13969*/)(/*12404*/l/*<12404*/)/*<12402*/ }/*<12256*/)/*<12253*/)(/*14631*//*14631*/cons/*<14631*//*14631*/(/*14632*//*14632*/cons/*<14632*//*14632*/(/*14633*//*14634*/j$slthrow/*<14634*//*14633*/(/*14635*//*14638*/j$slraw/*<14638*//*14635*/(/*14639*/`new Error('match fail ${/*14645*//*14643*/its/*<14643*//*14645*/(/*14646*/l/*<14646*/)/*<14645*/}:' + JSON.stringify(\$target))`/*<14639*/)(/*14641*/0/*<14641*/)/*<14635*/)(/*14642*/0/*<14642*/)/*<14633*/)(/*14632*/nil/*<14632*/)/*<14632*/)(/*14631*/nil/*<14631*/)/*<14631*/)/*<14631*/)/*<14629*/)/*<13965*/)/*<12250*/)(/*12251*/l/*<12251*/)/*<12232*/)(/*12235*//*12235*/cons/*<12235*//*12235*/(/*12236*//*12239*/compile$slj/*<12239*//*12236*/(/*12240*/target/*<12240*/)(/*12241*/trace/*<12241*/)/*<12236*/)(/*12235*/nil/*<12235*/)/*<12235*/)(/*12242*/l/*<12242*/)/*<12230*/
}
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 11496');})(/*!*//*11498*/expr/*<11498*/)/*<11496*/)/*<16265*/ } }/*<11476*/;


const compile_let$slj = /*16032*/function name_16032(body) { return function name_16032(trace) { return function name_16032(bindings) { return function name_16032(l) { return /*11676*//*11677*/foldr/*<11677*//*11676*/(/*11678*//*11679*/compile$slj/*<11679*//*11678*/(/*11680*/body/*<11680*/)(/*11681*/trace/*<11681*/)/*<11678*/)(/*16078*//*11682*/expand_bindings/*<11682*//*16078*/(/*16079*/bindings/*<16079*/)(/*16080*/l/*<16080*/)/*<16078*/)(/*11683*/function name_11683(body) { return function name_11683(binding) { return /*12392*//*12393*/j$slapp/*<12393*//*12392*/(/*12385*//*12386*/j$sllambda/*<12386*//*12385*/(/*12387*/nil/*<12387*/)(/*12388*//*12389*/left/*<12389*//*12388*/(/*13963*//*13964*/j$slblock/*<13964*//*13963*/(/*16134*//*16135*/concat/*<16135*//*16134*/(/*12390*//*12390*/cons/*<12390*//*12390*/(/*16136*//*16136*/cons/*<16136*//*16136*/(/*11688*//*11689*/compile_let_binding$slj/*<11689*//*11688*/(/*11690*/binding/*<11690*/)(/*11692*/trace/*<11692*/)(/*11693*/l/*<11693*/)/*<11688*/)(/*16136*/nil/*<16136*/)/*<16136*/)(/*12390*//*12390*/cons/*<12390*//*12390*/(/*16139*//*16140*/trace_pat/*<16140*//*16139*/(/*16141*//*16142*/fst/*<16142*//*16141*/(/*16144*/binding/*<16144*/)/*<16141*/)(/*16146*/trace/*<16146*/)/*<16139*/)(/*12390*//*12390*/cons/*<12390*//*12390*/(/*16138*//*16138*/cons/*<16138*//*16138*/(/*12398*//*12391*/j$slreturn/*<12391*//*12398*/(/*12399*/body/*<12399*/)(/*12401*/l/*<12401*/)/*<12398*/)(/*16138*/nil/*<16138*/)/*<16138*/)(/*12390*/nil/*<12390*/)/*<12390*/)/*<12390*/)/*<12390*/)/*<16134*/)/*<13963*/)/*<12388*/)(/*12397*/l/*<12397*/)/*<12385*/)(/*12395*/nil/*<12395*/)(/*12396*/l/*<12396*/)/*<12392*/ } }/*<11683*/)/*<11676*/ } } } }/*<16032*/;


const app$slj = /*12677*/function name_12677(target) { return function name_12677(args) { return function name_12677(trace) { return function name_12677(l) { return /*12204*//*12205*/foldl/*<12205*//*12204*/(/*12206*//*12207*/compile$slj/*<12207*//*12206*/(/*12208*/target/*<12208*/)(/*12209*/trace/*<12209*/)/*<12206*/)(/*12210*/args/*<12210*/)(/*12211*/function name_12211(target) { return function name_12211(arg) { return /*12216*//*12217*/j$slapp/*<12217*//*12216*/(/*12218*/target/*<12218*/)(/*12223*//*12223*/cons/*<12223*//*12223*/(/*12219*//*12220*/compile$slj/*<12220*//*12219*/(/*12221*/arg/*<12221*/)(/*12222*/trace/*<12222*/)/*<12219*/)(/*12223*/nil/*<12223*/)/*<12223*/)(/*12224*/l/*<12224*/)/*<12216*/ } }/*<12211*/)/*<12204*/ } } } }/*<12677*/;


const compile_let_binding$slj = /*12293*/function name_12293({0: pat, 1: init}) {

 return function name_12293(trace) { return function name_12293(l) { return /*12356*/(function match_12356($target) {
if ($target.type === "none") {
return /*12382*//*12383*/j$slsexpr/*<12383*//*12382*/(/*12379*//*12363*/compile$slj/*<12363*//*12379*/(/*12380*/init/*<12380*/)(/*12381*/trace/*<12381*/)/*<12379*/)(/*12384*/l/*<12384*/)/*<12382*/
}
if ($target.type === "some") {
{
let pat = $target[0];
return /*12351*//*12352*/j$sllet/*<12352*//*12351*/(/*12353*/pat/*<12353*/)(/*12376*//*12370*/compile$slj/*<12370*//*12376*/(/*12377*/init/*<12377*/)(/*12378*/trace/*<12378*/)/*<12376*/)(/*12371*/l/*<12371*/)/*<12351*/
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 12356');})(/*!*//*12358*//*12359*/pat_$gtj$slpat/*<12359*//*12358*/(/*12360*/pat/*<12360*/)/*<12358*/)/*<12356*/ } } }/*<12293*/;

const run$slj = /*11833*/function name_11833(v) { return /*11838*//*11839*/eval/*<11839*//*11838*/(/*12405*//*12406*/j$slcompile/*<12406*//*12405*/(/*12407*/0/*<12407*/)(/*11840*//*11841*/compile$slj/*<11841*//*11840*/(/*18060*//*18061*/run$slnil_$gt/*<18061*//*18060*/(/*11842*//*11843*/parse_expr/*<11843*//*11842*/(/*11844*/v/*<11844*/)/*<11842*/)/*<18060*/)(/*11845*/map$slnil/*<11845*/)/*<11840*/)/*<12405*/)/*<11838*/ }/*<11833*/;

const simplify_block = /*13983*/function name_13983({0: items}) {
 return /*14526*/(function match_14526($target) {
return /*14189*/(function match_14189($target) {
if ($target.type === "none") {
return /*14193*/none/*<14193*/
}
if ($target.type === "some") {
{
let items = $target[0];
return /*14198*//*14200*/some/*<14200*//*14198*/(/*14201*//*14202*/j$slblock/*<14202*//*14201*/(/*14203*/items/*<14203*/)/*<14201*/)/*<14198*/
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 14189');})(/*!*//*14012*//*14187*/call_at_end/*<14187*//*14012*/(/*14188*/items/*<14188*/)/*<14012*/)/*<14189*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 14526');})(/*!*//*14528*/items/*<14528*/)/*<14526*/ }/*<13983*/;

const example_expr = /*18054*//*18055*/run$slnil_$gt/*<18055*//*18054*/(/*11816*//*11817*/parse_expr/*<11817*//*11816*/(/*11818*/{"0":{"0":{"0":"match","1":12702,"type":"cst/identifier"},"1":{"0":{"0":"stmt","1":12703,"type":"cst/identifier"},"1":{"0":{"0":{"0":{"0":"sexpr","1":12705,"type":"cst/identifier"},"1":{"0":{"0":"expr","1":12706,"type":"cst/identifier"},"1":{"0":{"0":"l","1":12707,"type":"cst/identifier"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"type":"cons"},"1":12704,"type":"cst/list"},"1":{"0":{"0":{"0":{"0":"compile","1":12709,"type":"cst/identifier"},"1":{"0":{"0":"expr","1":12710,"type":"cst/identifier"},"1":{"0":{"0":"trace","1":12711,"type":"cst/identifier"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"type":"cons"},"1":12708,"type":"cst/list"},"1":{"0":{"0":{"0":{"0":"sdef","1":12713,"type":"cst/identifier"},"1":{"0":{"0":"name","1":12714,"type":"cst/identifier"},"1":{"0":{"0":"nl","1":12715,"type":"cst/identifier"},"1":{"0":{"0":"body","1":12716,"type":"cst/identifier"},"1":{"0":{"0":"l","1":12717,"type":"cst/identifier"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"type":"cons"},"type":"cons"},"type":"cons"},"1":12712,"type":"cst/list"},"1":{"0":{"0":{"0":{"0":"++","1":12719,"type":"cst/identifier"},"1":{"0":{"0":{"0":{"0":"const ","1":{"type":"nil"},"2":12721,"type":"cst/string"},"1":{"0":{"0":{"0":{"0":"sanitize","1":12724,"type":"cst/identifier"},"1":{"0":{"0":"name","1":12725,"type":"cst/identifier"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"1":12723,"type":"cst/list"},"1":{"0":{"0":" = ","1":{"type":"nil"},"2":12726,"type":"cst/string"},"1":{"0":{"0":{"0":{"0":"compile","1":12729,"type":"cst/identifier"},"1":{"0":{"0":"body","1":12730,"type":"cst/identifier"},"1":{"0":{"0":"trace","1":12731,"type":"cst/identifier"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"type":"cons"},"1":12728,"type":"cst/list"},"1":{"0":{"0":";\\n","1":{"type":"nil"},"2":12732,"type":"cst/string"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"type":"cons"},"type":"cons"},"type":"cons"},"1":12720,"type":"cst/array"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"1":12718,"type":"cst/list"},"1":{"0":{"0":{"0":{"0":"stypealias","1":12735,"type":"cst/identifier"},"1":{"0":{"0":"name","1":12736,"type":"cst/identifier"},"1":{"0":{"0":"_","1":12737,"type":"cst/identifier"},"1":{"0":{"0":"_","1":12738,"type":"cst/identifier"},"1":{"0":{"0":"_","1":12739,"type":"cst/identifier"},"1":{"0":{"0":"_","1":12740,"type":"cst/identifier"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"type":"cons"},"type":"cons"},"type":"cons"},"type":"cons"},"1":12734,"type":"cst/list"},"1":{"0":{"0":"/* type alias ","1":{"0":{"0":{"0":"name","1":12743,"type":"cst/identifier"},"1":" */","2":12744,"type":",,"},"1":{"type":"nil"},"type":"cons"},"2":12741,"type":"cst/string"},"1":{"0":{"0":{"0":{"0":"sdeftype","1":12746,"type":"cst/identifier"},"1":{"0":{"0":"name","1":12747,"type":"cst/identifier"},"1":{"0":{"0":"nl","1":12748,"type":"cst/identifier"},"1":{"0":{"0":"type-arg","1":12749,"type":"cst/identifier"},"1":{"0":{"0":"cases","1":12750,"type":"cst/identifier"},"1":{"0":{"0":"l","1":12751,"type":"cst/identifier"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"type":"cons"},"type":"cons"},"type":"cons"},"type":"cons"},"1":12745,"type":"cst/list"},"1":{"0":{"0":{"0":{"0":"join","1":12753,"type":"cst/identifier"},"1":{"0":{"0":"\\n","1":{"type":"nil"},"2":12754,"type":"cst/string"},"1":{"0":{"0":{"0":{"0":"map","1":12757,"type":"cst/identifier"},"1":{"0":{"0":"cases","1":12758,"type":"cst/identifier"},"1":{"0":{"0":{"0":{"0":"fn","1":12760,"type":"cst/identifier"},"1":{"0":{"0":{"0":{"0":"case","1":12762,"type":"cst/identifier"},"1":{"type":"nil"},"type":"cons"},"1":12761,"type":"cst/array"},"1":{"0":{"0":{"0":{"0":"let","1":12764,"type":"cst/identifier"},"1":{"0":{"0":{"0":{"0":{"0":{"0":",,,","1":12767,"type":"cst/identifier"},"1":{"0":{"0":"name2","1":12768,"type":"cst/identifier"},"1":{"0":{"0":"nl","1":12769,"type":"cst/identifier"},"1":{"0":{"0":"args","1":12770,"type":"cst/identifier"},"1":{"0":{"0":"l","1":12771,"type":"cst/identifier"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"type":"cons"},"type":"cons"},"type":"cons"},"1":12766,"type":"cst/list"},"1":{"0":{"0":"case","1":12772,"type":"cst/identifier"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"1":12765,"type":"cst/array"},"1":{"0":{"0":{"0":{"0":"++","1":12774,"type":"cst/identifier"},"1":{"0":{"0":{"0":{"0":"const ","1":{"type":"nil"},"2":12776,"type":"cst/string"},"1":{"0":{"0":{"0":{"0":"sanitize","1":12779,"type":"cst/identifier"},"1":{"0":{"0":"name2","1":12780,"type":"cst/identifier"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"1":12778,"type":"cst/list"},"1":{"0":{"0":" = ","1":{"type":"nil"},"2":12781,"type":"cst/string"},"1":{"0":{"0":{"0":{"0":"++","1":12784,"type":"cst/identifier"},"1":{"0":{"0":{"0":{"0":"mapi","1":12786,"type":"cst/identifier"},"1":{"0":{"0":"0","1":12787,"type":"cst/identifier"},"1":{"0":{"0":"args","1":12788,"type":"cst/identifier"},"1":{"0":{"0":{"0":{"0":"fn","1":12790,"type":"cst/identifier"},"1":{"0":{"0":{"0":{"0":"i","1":12792,"type":"cst/identifier"},"1":{"0":{"0":"_","1":12793,"type":"cst/identifier"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"1":12791,"type":"cst/array"},"1":{"0":{"0":{"0":{"0":"++","1":12795,"type":"cst/identifier"},"1":{"0":{"0":{"0":{"0":"(v","1":{"type":"nil"},"2":12797,"type":"cst/string"},"1":{"0":{"0":{"0":{"0":"int-to-string","1":12800,"type":"cst/identifier"},"1":{"0":{"0":"i","1":12801,"type":"cst/identifier"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"1":12799,"type":"cst/list"},"1":{"0":{"0":") => ","1":{"type":"nil"},"2":12802,"type":"cst/string"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"type":"cons"},"1":12796,"type":"cst/array"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"1":12794,"type":"cst/list"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"type":"cons"},"1":12789,"type":"cst/list"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"type":"cons"},"type":"cons"},"1":12785,"type":"cst/list"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"1":12783,"type":"cst/list"},"1":{"0":{"0":"({type: \\\"","1":{"type":"nil"},"2":12804,"type":"cst/string"},"1":{"0":{"0":"name2","1":12806,"type":"cst/identifier"},"1":{"0":{"0":"\\\"","1":{"type":"nil"},"2":12807,"type":"cst/string"},"1":{"0":{"0":{"0":{"0":"++","1":12810,"type":"cst/identifier"},"1":{"0":{"0":{"0":{"0":"mapi","1":12812,"type":"cst/identifier"},"1":{"0":{"0":"0","1":12813,"type":"cst/identifier"},"1":{"0":{"0":"args","1":12814,"type":"cst/identifier"},"1":{"0":{"0":{"0":{"0":"fn","1":12816,"type":"cst/identifier"},"1":{"0":{"0":{"0":{"0":"i","1":12818,"type":"cst/identifier"},"1":{"0":{"0":"_","1":12819,"type":"cst/identifier"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"1":12817,"type":"cst/array"},"1":{"0":{"0":{"0":{"0":"++","1":12821,"type":"cst/identifier"},"1":{"0":{"0":{"0":{"0":", ","1":{"type":"nil"},"2":12823,"type":"cst/string"},"1":{"0":{"0":{"0":{"0":"int-to-string","1":12826,"type":"cst/identifier"},"1":{"0":{"0":"i","1":12827,"type":"cst/identifier"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"1":12825,"type":"cst/list"},"1":{"0":{"0":": v","1":{"type":"nil"},"2":12828,"type":"cst/string"},"1":{"0":{"0":{"0":{"0":"int-to-string","1":12831,"type":"cst/identifier"},"1":{"0":{"0":"i","1":12832,"type":"cst/identifier"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"1":12830,"type":"cst/list"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"type":"cons"},"type":"cons"},"1":12822,"type":"cst/array"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"1":12820,"type":"cst/list"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"type":"cons"},"1":12815,"type":"cst/list"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"type":"cons"},"type":"cons"},"1":12811,"type":"cst/list"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"1":12809,"type":"cst/list"},"1":{"0":{"0":"});","1":{"type":"nil"},"2":12833,"type":"cst/string"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"type":"cons"},"type":"cons"},"type":"cons"},"type":"cons"},"type":"cons"},"type":"cons"},"type":"cons"},"1":12775,"type":"cst/array"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"1":12773,"type":"cst/list"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"type":"cons"},"1":12763,"type":"cst/list"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"type":"cons"},"1":12759,"type":"cst/list"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"type":"cons"},"1":12756,"type":"cst/list"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"type":"cons"},"1":12752,"type":"cst/list"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"type":"cons"},"type":"cons"},"type":"cons"},"type":"cons"},"type":"cons"},"type":"cons"},"type":"cons"},"type":"cons"},"1":12701,"type":"cst/list"}/*<11818*/)/*<11816*/)/*<18054*/;

const compile_stmt$slj = /*14250*/function name_14250(stmt) { return function name_14250(trace) { return /*14258*/(function match_14258($target) {
if ($target.type === "sexpr") {
{
let expr = $target[0];
{
let l = $target[1];
return /*14417*//*14417*/cons/*<14417*//*14417*/(/*14405*//*14406*/j$slsexpr/*<14406*//*14405*/(/*14265*//*14266*/compile$slj/*<14266*//*14265*/(/*14267*/expr/*<14267*/)(/*14268*/trace/*<14268*/)/*<14265*/)(/*14407*/l/*<14407*/)/*<14405*/)(/*14417*/nil/*<14417*/)/*<14417*/
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
return /*14418*//*14418*/cons/*<14418*//*14418*/(/*14393*//*14394*/j$sllet/*<14394*//*14393*/(/*14395*//*14396*/j$slpvar/*<14396*//*14395*/(/*14397*/name/*<14397*/)(/*14398*/nl/*<14398*/)/*<14395*/)(/*14399*//*14401*/compile$slj/*<14401*//*14399*/(/*14402*/body/*<14402*/)(/*14403*/trace/*<14403*/)/*<14399*/)(/*14404*/l/*<14404*/)/*<14393*/)(/*14418*/nil/*<14418*/)/*<14418*/
}
}
}
}
}
if ($target.type === "stypealias") {
{
let name = $target[0];
return /*14408*/nil/*<14408*/
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
return /*14416*//*14419*/map/*<14419*//*14416*/(/*14420*/cases/*<14420*/)(/*14421*/function name_14421($case) { return /*14320*/(function let_14320() {const $target = /*14329*/$case/*<14329*/;
if ($target.type === ",,,") {
{
let name2 = $target[0];
{
let nl = $target[1];
{
let args = $target[2];
{
let l = $target[3];
return /*14429*//*14430*/j$sllet/*<14430*//*14429*/(/*14431*//*14432*/j$slpvar/*<14432*//*14431*/(/*14433*/name2/*<14433*/)(/*14434*/nl/*<14434*/)/*<14431*/)(/*14435*//*14436*/foldr/*<14436*//*14435*/(/*14456*//*14457*/j$slobj/*<14457*//*14456*/(/*14615*//*14615*/cons/*<14615*//*14615*/(/*14627*//*14628*/left/*<14628*//*14627*/(/*14617*//*14618*/$co/*<14618*//*14617*/(/*14619*/"type"/*<14619*/)(/*14621*//*14622*/j$slstr/*<14622*//*14621*/(/*14623*/name2/*<14623*/)(/*14626*/nil/*<14626*/)(/*14625*/nl/*<14625*/)/*<14621*/)/*<14617*/)/*<14627*/)(/*14459*//*14460*/mapi/*<14460*//*14459*/(/*14461*/0/*<14461*/)(/*14462*/args/*<14462*/)(/*14463*/function name_14463(i) { return function name_14463(_) { return /*14476*//*14477*/left/*<14477*//*14476*/(/*14468*//*14469*/$co/*<14469*//*14468*/(/*14470*//*14471*/int_to_string/*<14471*//*14470*/(/*14472*/i/*<14472*/)/*<14470*/)(/*14473*//*14478*/j$slvar/*<14478*//*14473*/(/*14492*/`v${/*14479*//*14484*/int_to_string/*<14484*//*14479*/(/*14485*/i/*<14485*/)/*<14479*/}`/*<14492*/)(/*14486*/nl/*<14486*/)/*<14473*/)/*<14468*/)/*<14476*/ } }/*<14463*/)/*<14459*/)/*<14615*/)(/*14458*/l/*<14458*/)/*<14456*/)(/*14552*//*14553*/mapi/*<14553*//*14552*/(/*14554*/0/*<14554*/)(/*14555*/args/*<14555*/)(/*14556*/function name_14556(i) { return function name_14556(_) { return /*14561*//*14562*/j$slpvar/*<14562*//*14561*/(/*14563*/`v${/*14565*//*14566*/int_to_string/*<14566*//*14565*/(/*14567*/i/*<14567*/)/*<14565*/}`/*<14563*/)(/*14569*/nl/*<14569*/)/*<14561*/ } }/*<14556*/)/*<14552*/)(/*14570*/function name_14570(body) { return function name_14570(arg) { return /*14575*//*14576*/j$sllambda/*<14576*//*14575*/(/*14577*//*14577*/cons/*<14577*//*14577*/(/*14578*/arg/*<14578*/)(/*14577*/nil/*<14577*/)/*<14577*/)(/*14579*//*14580*/right/*<14580*//*14579*/(/*14581*/body/*<14581*/)/*<14579*/)(/*14582*/l/*<14582*/)/*<14575*/ } }/*<14570*/)/*<14435*/)(/*14488*/l/*<14488*/)/*<14429*/
}
}
}
}
};
throw new Error('let pattern not matched 14323. ' + valueToString($target));})(/*!*/)/*<14320*/ }/*<14421*/)/*<14416*/
}
}
}
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 14258');})(/*!*//*14260*/stmt/*<14260*/)/*<14258*/ } }/*<14250*/;

const ex = /*18050*//*18051*/run$slnil_$gt/*<18051*//*18050*/(/*16236*//*16237*/parse_expr/*<16237*//*16236*/(/*16238*/{"0":{"0":{"0":"let","1":16241,"type":"cst/identifier"},"1":{"0":{"0":{"0":{"0":"x","1":16243,"type":"cst/identifier"},"1":{"0":{"0":"10","1":16244,"type":"cst/identifier"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"1":16242,"type":"cst/array"},"1":{"0":{"0":"x","1":16246,"type":"cst/identifier"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"type":"cons"},"1":16240,"type":"cst/list"}/*<16238*/)/*<16236*/)/*<18050*/;

const simplify_js = /*13635*//*13636*/tx/*<13636*//*13635*/(/*13637*/function name_13637(expr) { return /*13641*//*13644*/some/*<13644*//*13641*/(/*13645*/expr/*<13645*/)/*<13641*/ }/*<13637*/)(/*13646*//*13745*/apply_until/*<13745*//*13646*/(/*13746*/simplify_one/*<13746*/)/*<13646*/)(/*13747*/function name_13747(pat) { return /*13751*//*13754*/none/*<13754*//*13751*//*<13751*/ }/*<13747*/)(/*13755*/function name_13755(pat) { return /*13759*/pat/*<13759*/ }/*<13755*/)(/*13760*/function name_13760(stmt) { return /*13764*//*13765*/some/*<13765*//*13764*/(/*13766*/stmt/*<13766*/)/*<13764*/ }/*<13760*/)(/*13767*//*13851*/apply_until/*<13851*//*13767*/(/*13852*/simplify_stmt/*<13852*/)/*<13767*/)(/*13973*/function name_13973(block) { return /*13977*//*13978*/some/*<13978*//*13977*/(/*13979*/block/*<13979*/)/*<13977*/ }/*<13973*/)(/*13980*//*13981*/apply_until/*<13981*//*13980*/(/*13982*/simplify_block/*<13982*/)/*<13980*/)/*<13635*/;

return /*6451*//*6453*//*6452*/eval/*<6452*//*6453*/(/*6454*/"({0: parse_stmt,  1: parse_expr, 2: compile_stmt, 3: compile, 4: names, 5: externals_stmt, 6: externals_expr, 7: stmt_size, 8: expr_size, 9: type_size}) => ({\ntype: 'fns', parse_stmt, parse_expr, compile_stmt, compile, names, externals_stmt, externals_expr, stmt_size, expr_size, type_size})"/*<6454*/)/*<6453*//*6451*/(/*5763*//*5765*/parse_and_compile/*<5765*//*5763*/(/*16960*/function name_16960(stmt) { return /*18069*//*18070*/snd/*<18070*//*18069*/(/*16966*//*16970*/state_f/*<16970*//*16966*/(/*16968*//*16967*/parse_stmt/*<16967*//*16968*/(/*16969*/stmt/*<16969*/)/*<16968*/)(/*16971*/state$slnil/*<16971*/)/*<16966*/)/*<18069*/ }/*<16960*/)(/*17908*/function name_17908(expr) { return /*18071*//*18072*/snd/*<18072*//*18071*/(/*17915*//*17916*/state_f/*<17916*//*17915*/(/*17913*//*17909*/parse_expr/*<17909*//*17913*/(/*17914*/expr/*<17914*/)/*<17913*/)(/*17918*/state$slnil/*<17918*/)/*<17915*/)/*<18071*/ }/*<17908*/)(/*14238*/function name_14238(stmt) { return function name_14238(ctx) { return /*14243*//*14244*/j$slcompile_stmts/*<14244*//*14243*/(/*14245*/ctx/*<14245*/)(/*14647*//*14650*/map/*<14650*//*14647*/(/*14246*//*14247*/compile_stmt$slj/*<14247*//*14246*/(/*14248*/stmt/*<14248*/)(/*14249*/ctx/*<14249*/)/*<14246*/)(/*14651*//*14652*/map$slstmt/*<14652*//*14651*/(/*14653*/simplify_js/*<14653*/)/*<14651*/)/*<14647*/)/*<14243*/ } }/*<14238*/)(/*14603*/function name_14603(expr) { return function name_14603(ctx) { return /*14608*//*14609*/j$slcompile/*<14609*//*14608*/(/*14610*/ctx/*<14610*/)(/*14654*//*14655*/map$slexpr/*<14655*//*14654*/(/*14656*/simplify_js/*<14656*/)(/*14611*//*14612*/compile$slj/*<14612*//*14611*/(/*14613*/expr/*<14613*/)(/*14614*/ctx/*<14614*/)/*<14611*/)/*<14654*/)/*<14608*/ } }/*<14603*/)(/*6487*/names/*<6487*/)(/*6488*/externals_stmt/*<6488*/)(/*8146*/function name_8146(expr) { return /*8150*//*8151*/bag$slto_list/*<8151*//*8150*/(/*8152*//*8153*/externals/*<8153*//*8152*/(/*8154*/set$slnil/*<8154*/)(/*8155*/expr/*<8155*/)/*<8152*/)/*<8150*/ }/*<8146*/)(/*10022*/stmt_size/*<10022*/)(/*10023*/expr_size/*<10023*/)(/*10024*/type_size/*<10024*/)/*<5763*/)/*<6451*/