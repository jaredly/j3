const pint = (v0) => (v1) => ({type: "pint", 0: v0, 1: v1});
const pfloat = (v0) => (v1) => ({type: "pfloat", 0: v0, 1: v1});
const pbool = (v0) => (v1) => ({type: "pbool", 0: v0, 1: v1});
const enumId = /*154*/function name_154(num) { return /*159*/`v${/*161*//*162*/int_to_string/*<162*//*161*/(/*163*/num/*<163*/)/*<161*/}`/*<159*/ }/*<154*/;

const $bar_$gt = /*427*/function name_427(u) { return function name_427(t) { return /*434*//*435*/map$slset/*<435*//*434*/(/*526*/map$slnil/*<526*/)(/*436*/u/*<436*/)(/*437*/t/*<437*/)/*<434*/ } }/*<427*/;

const compose_transformers = /*7093*/function name_7093(one) { return function name_7093(two) { return function name_7093(ce) { return /*7101*//*7102*/two/*<7102*//*7101*/(/*7103*//*7104*/one/*<7104*//*7103*/(/*7105*/ce/*<7105*/)/*<7103*/)/*<7101*/ } } }/*<7093*/;

const not = /*7364*/function name_7364(v) { return /*7370*/(function match_7370($target) {
if ($target === true) {
return /*7373*/false/*<7373*/
}
return /*7374*/true/*<7374*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 7370');})(/*!*//*7372*/v/*<7372*/)/*<7370*/ }/*<7364*/;

const some = (v0) => ({type: "some", 0: v0});
const none = ({type: "none"});
const ok = (v0) => ({type: "ok", 0: v0});
const err = (v0) => ({type: "err", 0: v0});
const ok$gt$gt$eq = /*10180*/function name_10180(res) { return function name_10180(next) { return /*10187*/(function match_10187($target) {
if ($target.type === "ok") {
{
let v = $target[0];
return /*10193*//*10194*/next/*<10194*//*10193*/(/*10195*/v/*<10195*/)/*<10193*/
}
}
if ($target.type === "err") {
{
let e = $target[0];
return /*10199*//*10200*/err/*<10200*//*10199*/(/*10201*/e/*<10201*/)/*<10199*/
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 10187');})(/*!*//*10189*/res/*<10189*/)/*<10187*/ } }/*<10180*/;

const snd = /*10738*/function name_10738(tuple) { return /*10743*/(function let_10743() {const $target = /*10750*/tuple/*<10750*/;
if ($target.type === ",") {
{
let v = $target[1];
return /*10751*/v/*<10751*/
}
};
throw new Error('let pattern not matched 10746. ' + valueToString($target));})(/*!*/)/*<10743*/ }/*<10738*/;

const fst = /*10753*/function name_10753(tuple) { return /*10758*/(function let_10758() {const $target = /*10765*/tuple/*<10765*/;
if ($target.type === ",") {
{
let v = $target[0];
return /*10766*/v/*<10766*/
}
};
throw new Error('let pattern not matched 10761. ' + valueToString($target));})(/*!*/)/*<10758*/ }/*<10753*/;

const id = /*14107*/function name_14107(x) { return /*14113*/x/*<14113*/ }/*<14107*/;

/* type alias id */
const result_$gts = /*16107*/function name_16107(v_$gts) { return function name_16107(v) { return /*16114*/(function match_16114($target) {
if ($target.type === "ok") {
{
let v = $target[0];
return /*16121*//*16122*/v_$gts/*<16122*//*16121*/(/*16123*/v/*<16123*/)/*<16121*/
}
}
if ($target.type === "err") {
{
let e = $target[0];
return /*16127*/e/*<16127*/
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 16114');})(/*!*//*16116*/v/*<16116*/)/*<16114*/ } }/*<16107*/;

const dot = /*16171*/function name_16171(a) { return function name_16171(b) { return function name_16171(c) { return /*16179*//*16180*/a/*<16180*//*16179*/(/*16181*//*16182*/b/*<16182*//*16181*/(/*16183*/c/*<16183*/)/*<16181*/)/*<16179*/ } } }/*<16171*/;

const unwrap_tuple = /*19828*/function name_19828(f) { return function name_19828({0: a, 1: b}) {
 return /*19839*//*19840*/f/*<19840*//*19839*/(/*19841*/a/*<19841*/)(/*19842*/b/*<19842*/)/*<19839*/ } }/*<19828*/;

const wrap_tuple = /*19843*/function name_19843(f) { return function name_19843(a) { return function name_19843(b) { return /*19851*//*19852*/f/*<19852*//*19851*/(/*19853*//*19854*/$co/*<19854*//*19853*/(/*19855*/a/*<19855*/)(/*19856*/b/*<19856*/)/*<19853*/)/*<19851*/ } } }/*<19843*/;

const value = ({type: "value"});
const type = ({type: "type"});
/* type alias locname */
const map_err = /*21180*/function name_21180(f) { return function name_21180(v) { return /*21187*/(function match_21187($target) {
if ($target.type === "ok") {
return /*21193*/v/*<21193*/
}
if ($target.type === "err") {
{
let e = $target[0];
return /*21197*//*21202*/f/*<21202*//*21197*/(/*21203*/e/*<21203*/)/*<21197*/
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 21187');})(/*!*//*21189*/v/*<21189*/)/*<21187*/ } }/*<21180*/;

const its = /*24638*/int_to_string/*<24638*/;

const trace_and_block = /*24640*/function name_24640(loc) { return function name_24640(trace) { return function name_24640(value) { return function name_24640(js) { return /*24648*/(function match_24648($target) {
if ($target.type === "none") {
return /*24656*/js/*<24656*/
}
if ($target.type === "some") {
{
let info = $target[0];
return /*24660*/`\$trace(${/*24662*//*24663*/its/*<24663*//*24662*/(/*24664*/loc/*<24664*/)/*<24662*/}, ${/*24666*//*24667*/jsonify/*<24667*//*24666*/(/*24668*/info/*<24668*/)/*<24666*/}, ${/*24670*/value/*<24670*/});\n${/*24672*/js/*<24672*/}`/*<24660*/
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 24648');})(/*!*//*24650*//*24651*/map$slget/*<24651*//*24650*/(/*24652*/trace/*<24652*/)(/*24653*/loc/*<24653*/)/*<24650*/)/*<24648*/ } } } }/*<24640*/;

const trace_wrap = /*24675*/function name_24675(loc) { return function name_24675(trace) { return function name_24675(js) { return /*24682*/(function match_24682($target) {
if ($target.type === "none") {
return /*24690*/js/*<24690*/
}
if ($target.type === "some") {
{
let info = $target[0];
return /*24694*/`\$trace(${/*24696*//*24697*/its/*<24697*//*24696*/(/*24698*/loc/*<24698*/)/*<24696*/}, ${/*24700*//*24701*/jsonify/*<24701*//*24700*/(/*24702*/info/*<24702*/)/*<24700*/}, ${/*24704*/js/*<24704*/})`/*<24694*/
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 24682');})(/*!*//*24684*//*24685*/map$slget/*<24685*//*24684*/(/*24686*/trace/*<24686*/)(/*24687*/loc/*<24687*/)/*<24684*/)/*<24682*/ } } }/*<24675*/;

const trace_and = /*24707*/function name_24707(loc) { return function name_24707(trace) { return function name_24707(value) { return function name_24707(js) { return /*24715*/(function match_24715($target) {
if ($target.type === "none") {
return /*24723*/js/*<24723*/
}
if ($target.type === "some") {
{
let info = $target[0];
return /*24727*/`(\$trace(${/*24729*//*24730*/its/*<24730*//*24729*/(/*24731*/loc/*<24731*/)/*<24729*/}, ${/*24733*//*24734*/jsonify/*<24734*//*24733*/(/*24735*/info/*<24735*/)/*<24733*/}, ${/*24737*/value/*<24737*/}), ${/*24739*/js/*<24739*/})`/*<24727*/
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 24715');})(/*!*//*24717*//*24718*/map$slget/*<24718*//*24717*/(/*24719*/trace/*<24719*/)(/*24720*/loc/*<24720*/)/*<24717*/)/*<24715*/ } } } }/*<24707*/;

const source_map = /*24742*/function name_24742(loc) { return function name_24742(js) { return /*24748*/`/*${/*24750*//*24751*/its/*<24751*//*24750*/(/*24752*/loc/*<24752*/)/*<24750*/}*/${/*24754*/js/*<24754*/}/*<${/*24756*//*24757*/its/*<24757*//*24756*/(/*24758*/loc/*<24758*/)/*<24756*/}*/`/*<24748*/ } }/*<24742*/;

const orr = /*24962*/function name_24962($default) { return function name_24962(v) { return /*24968*/(function match_24968($target) {
if ($target.type === "some") {
{
let v = $target[0];
return /*24974*/v/*<24974*/
}
}
return /*24976*/$default/*<24976*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 24968');})(/*!*//*24970*/v/*<24970*/)/*<24968*/ } }/*<24962*/;

const nil = ({type: "nil"});
const cons = (v0) => (v1) => ({type: "cons", 0: v0, 1: v1});
const pany = (v0) => ({type: "pany", 0: v0});
const pvar = (v0) => (v1) => ({type: "pvar", 0: v0, 1: v1});
const pcon = (v0) => (v1) => (v2) => ({type: "pcon", 0: v0, 1: v1, 2: v2});
const pstr = (v0) => (v1) => ({type: "pstr", 0: v0, 1: v1});
const pprim = (v0) => (v1) => ({type: "pprim", 0: v0, 1: v1});
const star = ({type: "star"});
const kfun = (v0) => (v1) => ({type: "kfun", 0: v0, 1: v1});
const one = (v0) => ({type: "one", 0: v0});
const many = (v0) => ({type: "many", 0: v0});
const empty = ({type: "empty"});
const tyvar = (v0) => (v1) => ({type: "tyvar", 0: v0, 1: v1});
const tycon = (v0) => (v1) => ({type: "tycon", 0: v0, 1: v1});
const tyvar$slkind = /*358*/function name_358({0: v, 1: k}) {
 return /*366*/k/*<366*/ }/*<358*/;

const tycon$slkind = /*367*/function name_367({0: v, 1: k}) {
 return /*375*/k/*<375*/ }/*<367*/;

const nullSubst = /*426*/nil/*<426*/;

const all = /*660*/function name_660(f) { return function name_660(items) { return /*667*/(function match_667($target) {
if ($target.type === "nil") {
return /*671*/true/*<671*/
}
if ($target.type === "cons") {
{
let one = $target[0];
{
let rest = $target[1];
return /*678*/(function match_678($target) {
if ($target === true) {
return /*683*//*684*/all/*<684*//*683*/(/*685*/f/*<685*/)(/*686*/rest/*<686*/)/*<683*/
}
return /*687*/false/*<687*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 678');})(/*!*//*680*//*681*/f/*<681*//*680*/(/*682*/one/*<682*/)/*<680*/)/*<678*/
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 667');})(/*!*//*669*/items/*<669*/)/*<667*/ } }/*<660*/;

const filter = /*714*/function name_714(f) { return function name_714(arr) { return /*721*/(function match_721($target) {
if ($target.type === "nil") {
return /*725*/nil/*<725*/
}
if ($target.type === "cons") {
{
let one = $target[0];
{
let rest = $target[1];
return /*732*/(function match_732($target) {
if ($target === true) {
return /*737*//*737*/cons/*<737*//*737*/(/*738*/one/*<738*/)(/*739*//*743*/filter/*<743*//*739*/(/*744*/f/*<744*/)(/*745*/rest/*<745*/)/*<739*/)/*<737*/
}
return /*746*//*747*/filter/*<747*//*746*/(/*748*/f/*<748*/)(/*749*/rest/*<749*/)/*<746*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 732');})(/*!*//*734*//*735*/f/*<735*//*734*/(/*736*/one/*<736*/)/*<734*/)/*<732*/
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 721');})(/*!*//*723*/arr/*<723*/)/*<721*/ } }/*<714*/;

const kind$eq = /*1000*/function name_1000(a) { return function name_1000(b) { return /*1007*/(function match_1007($target) {
if ($target.type === ",") {
if ($target[0].type === "star") {
if ($target[1].type === "star") {
return /*1021*/true/*<1021*/
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
return /*1032*/(function match_1032($target) {
if ($target === true) {
return /*1038*//*1040*/kind$eq/*<1040*//*1038*/(/*1041*/b/*<1041*/)(/*1042*/b$qu/*<1042*/)/*<1038*/
}
return /*1043*/false/*<1043*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 1032');})(/*!*//*1034*//*1035*/kind$eq/*<1035*//*1034*/(/*1036*/a/*<1036*/)(/*1037*/a$qu/*<1037*/)/*<1034*/)/*<1032*/
}
}
}
}
}
}
}
return /*1045*/false/*<1045*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 1007');})(/*!*//*1009*//*1010*/$co/*<1010*//*1009*/(/*1012*/a/*<1012*/)(/*1013*/b/*<1013*/)/*<1009*/)/*<1007*/ } }/*<1000*/;

const tycon$eq = /*1046*/function name_1046({0: name, 1: kind}) {
 return function name_1046({0: name$qu, 1: kind$qu}) {
 return /*1053*/(function match_1053($target) {
if ($target === true) {
return /*1065*//*1066*/kind$eq/*<1066*//*1065*/(/*1067*/kind/*<1067*/)(/*1068*/kind$qu/*<1068*/)/*<1065*/
}
return /*1069*/false/*<1069*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 1053');})(/*!*//*1061*//*1062*/$eq/*<1062*//*1061*/(/*1063*/name/*<1063*/)(/*1064*/name$qu/*<1064*/)/*<1061*/)/*<1053*/ } }/*<1046*/;

const kind_$gts = /*1070*/function name_1070(a) { return /*1076*/(function match_1076($target) {
if ($target.type === "star") {
return /*1081*/"*"/*<1081*/
}
if ($target.type === "kfun") {
{
let a = $target[0];
{
let b = $target[1];
return /*1088*/`(${/*1090*//*1092*/kind_$gts/*<1092*//*1090*/(/*1093*/a/*<1093*/)/*<1090*/}->${/*1094*//*1096*/kind_$gts/*<1096*//*1094*/(/*1099*/b/*<1099*/)/*<1094*/})`/*<1088*/
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 1076');})(/*!*//*1078*/a/*<1078*/)/*<1076*/ }/*<1070*/;

const tycon_$gts = /*1100*/function name_1100({0: name, 1: kind}) {
 return /*16297*/(function match_16297($target) {
if ($target.type === "star") {
return /*16302*/name/*<16302*/
}
return /*1109*/`[${/*1111*/name/*<1111*/} : ${/*1116*//*1113*/kind_$gts/*<1113*//*1116*/(/*1117*/kind/*<1117*/)/*<1116*/}]`/*<1109*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 16297');})(/*!*//*16299*/kind/*<16299*/)/*<16297*/ }/*<1100*/;

const array$eq = /*6394*/function name_6394(a$qu) { return function name_6394(b$qu) { return function name_6394(eq) { return /*6402*/(function match_6402($target) {
if ($target.type === ",") {
if ($target[0].type === "cons") {
{
let one = $target[0][0];
{
let rest = $target[0][1];
if ($target[1].type === "cons") {
{
let two = $target[1][0];
{
let rest$qu = $target[1][1];
return /*6428*/(function match_6428($target) {
if ($target === true) {
return /*6434*//*6435*/array$eq/*<6435*//*6434*/(/*6436*/rest/*<6436*/)(/*6437*/rest$qu/*<6437*/)(/*6438*/eq/*<6438*/)/*<6434*/
}
return /*6439*/false/*<6439*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 6428');})(/*!*//*6430*//*6431*/eq/*<6431*//*6430*/(/*6432*/one/*<6432*/)(/*6433*/two/*<6433*/)/*<6430*/)/*<6428*/
}
}
}
}
}
}
}
return /*6441*/false/*<6441*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 6402');})(/*!*//*6405*//*6406*/$co/*<6406*//*6405*/(/*6407*/a$qu/*<6407*/)(/*6408*/b$qu/*<6408*/)/*<6405*/)/*<6402*/ } } }/*<6394*/;

const tyvar$eq = /*6509*/function name_6509({0: name, 1: kind}) {
 return function name_6509({0: name$qu, 1: kind$qu}) {
 return /*6522*/(function match_6522($target) {
if ($target === true) {
return /*6528*//*6529*/kind$eq/*<6529*//*6528*/(/*6530*/kind/*<6530*/)(/*6533*/kind$qu/*<6533*/)/*<6528*/
}
return /*6534*/false/*<6534*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 6522');})(/*!*//*6524*//*6525*/$eq/*<6525*//*6524*/(/*6526*/name/*<6526*/)(/*6527*/name$qu/*<6527*/)/*<6524*/)/*<6522*/ } }/*<6509*/;

const map = /*6611*/function name_6611(f) { return function name_6611(items) { return /*6644*/(function match_6644($target) {
if ($target.type === "nil") {
return /*6648*/nil/*<6648*/
}
if ($target.type === "cons") {
{
let one = $target[0];
{
let rest = $target[1];
return /*6655*//*6655*/cons/*<6655*//*6655*/(/*6664*//*6656*/f/*<6656*//*6664*/(/*6665*/one/*<6665*/)/*<6664*/)(/*6657*//*6661*/map/*<6661*//*6657*/(/*6662*/f/*<6662*/)(/*6663*/rest/*<6663*/)/*<6657*/)/*<6655*/
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 6644');})(/*!*//*6646*/items/*<6646*/)/*<6644*/ } }/*<6611*/;

const foldl = /*6742*/function name_6742(init) { return function name_6742(items) { return function name_6742(f) { return /*6750*/(function match_6750($target) {
if ($target.type === "nil") {
return /*6754*/init/*<6754*/
}
if ($target.type === "cons") {
{
let one = $target[0];
{
let rest = $target[1];
return /*6761*//*6762*/foldl/*<6762*//*6761*/(/*6763*//*6764*/f/*<6764*//*6763*/(/*6765*/init/*<6765*/)(/*6766*/one/*<6766*/)/*<6763*/)(/*6767*/rest/*<6767*/)(/*6768*/f/*<6768*/)/*<6761*/
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 6750');})(/*!*//*6752*/items/*<6752*/)/*<6750*/ } } }/*<6742*/;

const defined = /*7013*/function name_7013(opt) { return /*7019*/(function match_7019($target) {
if ($target.type === "some") {
return /*7026*/true/*<7026*/
}
return /*7028*/false/*<7028*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 7019');})(/*!*//*7022*/opt/*<7022*/)/*<7019*/ }/*<7013*/;

const find = /*7180*/function name_7180(arr) { return function name_7180(f) { return /*7187*/(function match_7187($target) {
if ($target.type === "nil") {
return /*7191*//*7192*/none/*<7192*//*7191*//*<7191*/
}
if ($target.type === "cons") {
{
let one = $target[0];
{
let rest = $target[1];
return /*7199*/(function match_7199($target) {
if ($target === true) {
return /*7204*//*7205*/some/*<7205*//*7204*/(/*7206*/one/*<7206*/)/*<7204*/
}
return /*7207*//*7208*/find/*<7208*//*7207*/(/*7209*/rest/*<7209*/)(/*7210*/f/*<7210*/)/*<7207*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 7199');})(/*!*//*7201*//*7202*/f/*<7202*//*7201*/(/*7203*/one/*<7203*/)/*<7201*/)/*<7199*/
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 7187');})(/*!*//*7189*/arr/*<7189*/)/*<7187*/ } }/*<7180*/;

const map$slhas = /*7375*/function name_7375(map) { return function name_7375(key) { return /*7385*/(function match_7385($target) {
if ($target.type === "some") {
return /*7394*/true/*<7394*/
}
return /*7396*/false/*<7396*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 7385');})(/*!*//*7387*//*7388*/map$slget/*<7388*//*7387*/(/*7389*/map/*<7389*/)(/*7390*/key/*<7390*/)/*<7387*/)/*<7385*/ } }/*<7375*/;

const any = /*7587*/function name_7587(f) { return function name_7587(arr) { return /*7594*/(function match_7594($target) {
if ($target.type === "nil") {
return /*7598*/false/*<7598*/
}
if ($target.type === "cons") {
{
let one = $target[0];
{
let rest = $target[1];
return /*7605*/(function match_7605($target) {
if ($target === true) {
return /*7610*/true/*<7610*/
}
return /*7611*//*7612*/any/*<7612*//*7611*/(/*7613*/f/*<7613*/)(/*7614*/rest/*<7614*/)/*<7611*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 7605');})(/*!*//*7607*//*7608*/f/*<7608*//*7607*/(/*7609*/one/*<7609*/)/*<7607*/)/*<7605*/
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 7594');})(/*!*//*7596*/arr/*<7596*/)/*<7594*/ } }/*<7587*/;

const apply_transformers = /*7694*/function name_7694(transformers) { return function name_7694(env) { return /*7701*//*7702*/foldl/*<7702*//*7701*/(/*7703*/env/*<7703*/)(/*7712*/transformers/*<7712*/)(/*7704*/function name_7704(env) { return function name_7704(f) { return /*7709*//*7710*/f/*<7710*//*7709*/(/*7711*/env/*<7711*/)/*<7709*/ } }/*<7704*/)/*<7701*/ } }/*<7694*/;

const concat = /*7838*/function name_7838(arrays) { return /*7844*/(function match_7844($target) {
if ($target.type === "nil") {
return /*7848*/nil/*<7848*/
}
if ($target.type === "cons") {
if ($target[0].type === "nil") {
{
let rest = $target[1];
return /*7860*//*7861*/concat/*<7861*//*7860*/(/*7862*/rest/*<7862*/)/*<7860*/
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
let arrays = $target[1];
return /*7874*//*7874*/cons/*<7874*//*7874*/(/*7875*/one/*<7875*/)(/*7876*//*7880*/concat/*<7880*//*7876*/(/*7884*//*7884*/cons/*<7884*//*7884*/(/*7882*/rest/*<7882*/)(/*7885*/arrays/*<7885*/)/*<7884*/)/*<7876*/)/*<7874*/
}
}
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 7844');})(/*!*//*7846*/arrays/*<7846*/)/*<7844*/ }/*<7838*/;

const find_some = /*7942*/function name_7942(f) { return function name_7942(arr) { return /*7949*/(function match_7949($target) {
if ($target.type === "nil") {
return /*7953*//*7954*/none/*<7954*//*7953*//*<7953*/
}
if ($target.type === "cons") {
{
let one = $target[0];
{
let rest = $target[1];
return /*7964*/(function match_7964($target) {
if ($target.type === "some") {
{
let v = $target[0];
return /*7972*//*7973*/some/*<7973*//*7972*/(/*7974*/v/*<7974*/)/*<7972*/
}
}
return /*7976*//*7977*/find_some/*<7977*//*7976*/(/*7978*/f/*<7978*/)(/*7979*/rest/*<7979*/)/*<7976*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 7964');})(/*!*//*7966*//*7967*/f/*<7967*//*7966*/(/*7968*/one/*<7968*/)/*<7966*/)/*<7964*/
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 7949');})(/*!*//*7951*/arr/*<7951*/)/*<7949*/ } }/*<7942*/;

const map$slok = /*8301*/function name_8301(f) { return function name_8301(arr) { return /*8308*/(function match_8308($target) {
if ($target.type === "nil") {
return /*8312*//*8313*/ok/*<8313*//*8312*/(/*8314*/nil/*<8314*/)/*<8312*/
}
if ($target.type === "cons") {
{
let one = $target[0];
{
let rest = $target[1];
return /*8321*/(function match_8321($target) {
if ($target.type === "ok") {
{
let val = $target[0];
return /*8329*/(function match_8329($target) {
if ($target.type === "ok") {
{
let rest = $target[0];
return /*8338*//*8341*/ok/*<8341*//*8338*/(/*8342*//*8342*/cons/*<8342*//*8342*/(/*8343*/val/*<8343*/)(/*8344*/rest/*<8344*/)/*<8342*/)/*<8338*/
}
}
if ($target.type === "err") {
{
let e = $target[0];
return /*8421*//*8349*/err/*<8349*//*8421*/(/*8422*/e/*<8422*/)/*<8421*/
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 8329');})(/*!*//*8331*//*8332*/map$slok/*<8332*//*8331*/(/*8333*/f/*<8333*/)(/*8334*/rest/*<8334*/)/*<8331*/)/*<8329*/
}
}
if ($target.type === "err") {
{
let e = $target[0];
return /*8425*//*8351*/err/*<8351*//*8425*/(/*8426*/e/*<8426*/)/*<8425*/
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 8321');})(/*!*//*8323*//*8324*/f/*<8324*//*8323*/(/*8325*/one/*<8325*/)/*<8323*/)/*<8321*/
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 8308');})(/*!*//*8310*/arr/*<8310*/)/*<8308*/ } }/*<8301*/;

const mapi = /*8698*/function name_8698(f) { return function name_8698(i) { return function name_8698(items) { return /*8706*/(function match_8706($target) {
if ($target.type === "nil") {
return /*8710*/nil/*<8710*/
}
if ($target.type === "cons") {
{
let one = $target[0];
{
let rest = $target[1];
return /*8715*//*8715*/cons/*<8715*//*8715*/(/*8716*//*8717*/f/*<8717*//*8716*/(/*8718*/one/*<8718*/)(/*8725*/i/*<8725*/)/*<8716*/)(/*8720*//*8721*/mapi/*<8721*//*8720*/(/*8722*/f/*<8722*/)(/*8726*//*8728*/$pl/*<8728*//*8726*/(/*8729*/i/*<8729*/)(/*8730*/1/*<8730*/)/*<8726*/)(/*8723*/rest/*<8723*/)/*<8720*/)/*<8715*/
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 8706');})(/*!*//*8708*/items/*<8708*/)/*<8706*/ } } }/*<8698*/;

const list$slget = /*9421*/function name_9421(arr) { return function name_9421(i) { return /*9428*/(function match_9428($target) {
if ($target.type === ",") {
if ($target[0].type === "cons") {
{
let one = $target[0][0];
if ($target[1] === 0) {
return /*9443*/one/*<9443*/
}
}
}
}
if ($target.type === ",") {
if ($target[0].type === "cons") {
{
let rest = $target[0][1];
{
let i = $target[1];
return /*9453*/(function match_9453($target) {
if ($target === true) {
return /*9459*//*9460*/fatal/*<9460*//*9459*/(/*9461*/"Index out of range"/*<9461*/)/*<9459*/
}
return /*9463*//*9464*/list$slget/*<9464*//*9463*/(/*9465*/rest/*<9465*/)(/*9466*//*9468*/_/*<9468*//*9466*/(/*9469*/i/*<9469*/)(/*9470*/1/*<9470*/)/*<9466*/)/*<9463*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 9453');})(/*!*//*9455*//*9474*/$lt$eq/*<9474*//*9455*/(/*9456*/i/*<9456*/)(/*9458*/0/*<9458*/)/*<9455*/)/*<9453*/
}
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 9428');})(/*!*//*9430*//*9431*/$co/*<9431*//*9430*/(/*9432*/arr/*<9432*/)(/*9433*/i/*<9433*/)/*<9430*/)/*<9428*/ } }/*<9421*/;

const foldr = /*10106*/function name_10106(init) { return function name_10106(items) { return function name_10106(f) { return /*10139*/(function match_10139($target) {
if ($target.type === "nil") {
return /*10143*/init/*<10143*/
}
if ($target.type === "cons") {
{
let one = $target[0];
{
let rest = $target[1];
return /*10148*//*10149*/f/*<10149*//*10148*/(/*10150*//*10151*/foldr/*<10151*//*10150*/(/*10152*/init/*<10152*/)(/*10153*/rest/*<10153*/)(/*10154*/f/*<10154*/)/*<10150*/)(/*10155*/one/*<10155*/)/*<10148*/
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 10139');})(/*!*//*10141*/items/*<10141*/)/*<10139*/ } } }/*<10106*/;

const join = /*10482*/function name_10482(sep) { return function name_10482(items) { return /*10488*/(function match_10488($target) {
if ($target.type === "nil") {
return /*10492*/""/*<10492*/
}
if ($target.type === "cons") {
{
let one = $target[0];
{
let rest = $target[1];
return /*10498*/(function match_10498($target) {
if ($target.type === "nil") {
return /*10502*/one/*<10502*/
}
return /*10504*//*10505*/$pl$pl/*<10505*//*10504*/(/*10506*//*10506*/cons/*<10506*//*10506*/(/*10507*/one/*<10507*/)(/*10506*//*10506*/cons/*<10506*//*10506*/(/*10508*/sep/*<10508*/)(/*10506*//*10506*/cons/*<10506*//*10506*/(/*10509*//*10510*/join/*<10510*//*10509*/(/*10511*/sep/*<10511*/)(/*10512*/rest/*<10512*/)/*<10509*/)(/*10506*/nil/*<10506*/)/*<10506*/)/*<10506*/)/*<10506*/)/*<10504*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 10498');})(/*!*//*10500*/rest/*<10500*/)/*<10498*/
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 10488');})(/*!*//*10490*/items/*<10490*/)/*<10488*/ } }/*<10482*/;

const rev = /*10589*/function name_10589(arr) { return function name_10589(col) { return /*10595*/(function match_10595($target) {
if ($target.type === "nil") {
return /*10599*/col/*<10599*/
}
if ($target.type === "cons") {
{
let one = $target[0];
if ($target[1].type === "nil") {
return /*10602*//*10602*/cons/*<10602*//*10602*/(/*10603*/one/*<10603*/)(/*10605*/col/*<10605*/)/*<10602*/
}
}
}
if ($target.type === "cons") {
{
let one = $target[0];
{
let rest = $target[1];
return /*10610*//*10611*/rev/*<10611*//*10610*/(/*10612*/rest/*<10612*/)(/*10613*//*10613*/cons/*<10613*//*10613*/(/*10614*/one/*<10614*/)(/*10616*/col/*<10616*/)/*<10613*/)/*<10610*/
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 10595');})(/*!*//*10597*/arr/*<10597*/)/*<10595*/ } }/*<10589*/;

const pairs = /*10693*/function name_10693(list) { return /*10698*/(function match_10698($target) {
if ($target.type === "nil") {
return /*10702*/nil/*<10702*/
}
if ($target.type === "cons") {
{
let one = $target[0];
if ($target[1].type === "cons") {
{
let two = $target[1][0];
{
let rest = $target[1][1];
return /*10708*//*10708*/cons/*<10708*//*10708*/(/*10709*//*10710*/$co/*<10710*//*10709*/(/*10711*/one/*<10711*/)(/*10712*/two/*<10712*/)/*<10709*/)(/*10714*//*10715*/pairs/*<10715*//*10714*/(/*10716*/rest/*<10716*/)/*<10714*/)/*<10708*/
}
}
}
}
}
return /*10718*//*10719*/fatal/*<10719*//*10718*/(/*10720*/`Pairs given odd number ${/*10722*//*10723*/valueToString/*<10723*//*10722*/(/*10724*/list/*<10724*/)/*<10722*/}`/*<10720*/)/*<10718*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 10698');})(/*!*//*10700*/list/*<10700*/)/*<10698*/ }/*<10693*/;

const replaces = /*10768*/function name_10768(target) { return function name_10768(repl) { return /*10774*/(function match_10774($target) {
if ($target.type === "nil") {
return /*10778*/target/*<10778*/
}
if ($target.type === "cons") {
{
let one = $target[0];
{
let rest = $target[1];
return /*10783*/(function match_10783($target) {
if ($target.type === ",") {
{
let find = $target[0];
{
let nw = $target[1];
return /*10790*//*10791*/replaces/*<10791*//*10790*/(/*10792*//*10793*/replace_all/*<10793*//*10792*/(/*10794*/target/*<10794*/)(/*10795*/find/*<10795*/)(/*10796*/nw/*<10796*/)/*<10792*/)(/*10797*/rest/*<10797*/)/*<10790*/
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 10783');})(/*!*//*10785*/one/*<10785*/)/*<10783*/
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 10774');})(/*!*//*10776*/repl/*<10776*/)/*<10774*/ } }/*<10768*/;

const tstar = /*12901*/function name_12901(name) { return /*12907*//*12908*/tycon/*<12908*//*12907*/(/*12909*/name/*<12909*/)(/*12910*/star/*<12910*/)/*<12907*/ }/*<12901*/;

const partition = /*13843*/function name_13843(arr) { return function name_13843(test) { return /*13852*/(function match_13852($target) {
if ($target.type === "nil") {
return /*13856*//*13857*/$co/*<13857*//*13856*/(/*13858*/nil/*<13858*/)(/*13859*/nil/*<13859*/)/*<13856*/
}
if ($target.type === "cons") {
{
let one = $target[0];
{
let rest = $target[1];
return /*13866*/(function let_13866() {const $target = /*13878*//*13879*/partition/*<13879*//*13878*/(/*13880*/rest/*<13880*/)(/*13881*/test/*<13881*/)/*<13878*/;
if ($target.type === ",") {
{
let yes = $target[0];
{
let no = $target[1];
return /*13882*/(function match_13882($target) {
if ($target === true) {
return /*13889*//*13890*/$co/*<13890*//*13889*/(/*13891*//*13891*/cons/*<13891*//*13891*/(/*13892*/one/*<13892*/)(/*13893*/yes/*<13893*/)/*<13891*/)(/*13897*/no/*<13897*/)/*<13889*/
}
return /*13898*//*13899*/$co/*<13899*//*13898*/(/*13900*/yes/*<13900*/)(/*13901*//*13901*/cons/*<13901*//*13901*/(/*13902*/one/*<13902*/)(/*13903*/no/*<13903*/)/*<13901*/)/*<13898*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 13882');})(/*!*//*13886*//*13887*/test/*<13887*//*13886*/(/*13888*/one/*<13888*/)/*<13886*/)/*<13882*/
}
}
};
throw new Error('let pattern not matched 13874. ' + valueToString($target));})(/*!*/)/*<13866*/
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 13852');})(/*!*//*13854*/arr/*<13854*/)/*<13852*/ } }/*<13843*/;

const every = /*13908*/function name_13908(arr) { return function name_13908(f) { return /*13915*/(function match_13915($target) {
if ($target.type === "nil") {
return /*13919*/true/*<13919*/
}
if ($target.type === "cons") {
{
let one = $target[0];
{
let rest = $target[1];
return /*13926*/(function match_13926($target) {
if ($target === true) {
return /*13931*//*13932*/every/*<13932*//*13931*/(/*13933*/rest/*<13933*/)(/*13934*/f/*<13934*/)/*<13931*/
}
return /*13935*/false/*<13935*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 13926');})(/*!*//*13928*//*13929*/f/*<13929*//*13928*/(/*13930*/one/*<13930*/)/*<13928*/)/*<13926*/
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 13915');})(/*!*//*13917*/arr/*<13917*/)/*<13915*/ } }/*<13908*/;

const contains = /*13938*/function name_13938(arr) { return function name_13938(item) { return function name_13938(item$eq) { return /*13947*/(function match_13947($target) {
if ($target.type === "nil") {
return /*13951*/false/*<13951*/
}
if ($target.type === "cons") {
{
let one = $target[0];
{
let rest = $target[1];
return /*13958*/(function match_13958($target) {
if ($target === true) {
return /*13964*/true/*<13964*/
}
return /*13965*//*13966*/contains/*<13966*//*13965*/(/*13967*/rest/*<13967*/)(/*13968*/item/*<13968*/)(/*13969*/item$eq/*<13969*/)/*<13965*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 13958');})(/*!*//*13960*//*13961*/item$eq/*<13961*//*13960*/(/*13962*/one/*<13962*/)(/*13963*/item/*<13963*/)/*<13960*/)/*<13958*/
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 13947');})(/*!*//*13949*/arr/*<13949*/)/*<13947*/ } } }/*<13938*/;

const numClasses = /*13985*//*13985*/cons/*<13985*//*13985*/(/*13986*/"num"/*<13986*/)(/*13985*//*13985*/cons/*<13985*//*13985*/(/*13988*/"integral"/*<13988*/)(/*13985*//*13985*/cons/*<13985*//*13985*/(/*13990*/"floating"/*<13990*/)(/*13985*//*13985*/cons/*<13985*//*13985*/(/*13992*/"fractional"/*<13992*/)(/*13985*//*13985*/cons/*<13985*//*13985*/(/*13994*/"real"/*<13994*/)(/*13985*//*13985*/cons/*<13985*//*13985*/(/*13996*/"realfloat"/*<13996*/)(/*13985*//*13985*/cons/*<13985*//*13985*/(/*13998*/"realfrac"/*<13998*/)(/*13985*/nil/*<13985*/)/*<13985*/)/*<13985*/)/*<13985*/)/*<13985*/)/*<13985*/)/*<13985*/)/*<13985*/;

const $pl$pl$pl = /*14025*/function name_14025(a) { return function name_14025(b) { return /*14032*//*14033*/concat/*<14033*//*14032*/(/*14034*//*14034*/cons/*<14034*//*14034*/(/*14035*/a/*<14035*/)(/*14034*//*14034*/cons/*<14034*//*14034*/(/*14036*/b/*<14036*/)(/*14034*/nil/*<14034*/)/*<14034*/)/*<14034*/)/*<14032*/ } }/*<14025*/;

const head = /*14242*/function name_14242(arr) { return /*14248*/(function match_14248($target) {
if ($target.type === "cons") {
{
let one = $target[0];
return /*14257*/one/*<14257*/
}
}
return /*14259*//*14260*/fatal/*<14260*//*14259*/(/*14261*/"head of empty list"/*<14261*/)/*<14259*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 14248');})(/*!*//*14250*/arr/*<14250*/)/*<14248*/ }/*<14242*/;

const without = /*14306*/function name_14306(base) { return function name_14306(remove) { return function name_14306(x$eq) { return /*14313*//*14314*/filter/*<14314*//*14313*/(/*14317*/function name_14317(x) { return /*14321*//*14324*/not/*<14324*//*14321*/(/*14325*//*14326*/contains/*<14326*//*14325*/(/*14327*/remove/*<14327*/)(/*14328*/x/*<14328*/)(/*14329*/x$eq/*<14329*/)/*<14325*/)/*<14321*/ }/*<14317*/)(/*14315*/base/*<14315*/)/*<14313*/ } } }/*<14306*/;

const zip = /*14392*/function name_14392(one) { return function name_14392(two) { return /*14399*/(function match_14399($target) {
if ($target.type === ",") {
if ($target[0].type === "cons") {
{
let a = $target[0][0];
{
let one = $target[0][1];
if ($target[1].type === "cons") {
{
let b = $target[1][0];
{
let two = $target[1][1];
return /*14425*//*14425*/cons/*<14425*//*14425*/(/*14426*//*14427*/$co/*<14427*//*14426*/(/*14428*/a/*<14428*/)(/*14429*/b/*<14429*/)/*<14426*/)(/*14430*//*14435*/zip/*<14435*//*14430*/(/*14436*/one/*<14436*/)(/*14437*/two/*<14437*/)/*<14430*/)/*<14425*/
}
}
}
}
}
}
}
return /*14439*/nil/*<14439*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 14399');})(/*!*//*14401*//*14402*/$co/*<14402*//*14401*/(/*14403*/one/*<14403*/)(/*14404*/two/*<14404*/)/*<14401*/)/*<14399*/ } }/*<14392*/;

const restricted = /*14756*/function name_14756(bs) { return /*14762*/(function let_14762() {const $target = /*14766*/function name_14766({0: i, 1: alts}) {
 return /*14773*//*14774*/any/*<14774*//*14773*/(/*14775*/function name_14775({0: v}) { return /*14782*/(function match_14782($target) {
if ($target.type === "nil") {
return /*14786*/true/*<14786*/
}
return /*14788*/false/*<14788*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 14782');})(/*!*//*14784*/v/*<14784*/)/*<14782*/ }/*<14775*/)(/*14789*/alts/*<14789*/)/*<14773*/ }/*<14766*/;
{
let simple = $target;
return /*14790*//*14792*/any/*<14792*//*14790*/(/*14793*/simple/*<14793*/)(/*14794*/bs/*<14794*/)/*<14790*/
};
throw new Error('let pattern not matched 14765. ' + valueToString($target));})(/*!*/)/*<14762*/ }/*<14756*/;

const zipWith = /*15050*/function name_15050(f) { return function name_15050(left) { return function name_15050(right) { return /*15058*/(function match_15058($target) {
if ($target.type === ",") {
if ($target[0].type === "nil") {
if ($target[1].type === "nil") {
return /*15070*/nil/*<15070*/
}
}
}
if ($target.type === ",") {
if ($target[0].type === "cons") {
{
let one = $target[0][0];
{
let left = $target[0][1];
if ($target[1].type === "cons") {
{
let two = $target[1][0];
{
let right = $target[1][1];
return /*15085*//*15085*/cons/*<15085*//*15085*/(/*15086*//*15087*/f/*<15087*//*15086*/(/*15088*/one/*<15088*/)(/*15089*/two/*<15089*/)/*<15086*/)(/*15090*//*15094*/zipWith/*<15094*//*15090*/(/*15095*/f/*<15095*/)(/*15096*/left/*<15096*/)(/*15097*/right/*<15097*/)/*<15090*/)/*<15085*/
}
}
}
}
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 15058');})(/*!*//*15060*//*15061*/$co/*<15061*//*15060*/(/*15062*/left/*<15062*/)(/*15063*/right/*<15063*/)/*<15060*/)/*<15058*/ } } }/*<15050*/;

const foldr1 = /*15245*/function name_15245(f) { return function name_15245(lst) { return /*15252*/(function match_15252($target) {
if ($target.type === "nil") {
return /*15256*//*15257*/fatal/*<15257*//*15256*/(/*15258*/"Empty list to foldr1"/*<15258*/)/*<15256*/
}
if ($target.type === "cons") {
{
let one = $target[0];
if ($target[1].type === "nil") {
return /*15262*/one/*<15262*/
}
}
}
if ($target.type === "cons") {
{
let one = $target[0];
if ($target[1].type === "cons") {
{
let two = $target[1][0];
if ($target[1][1].type === "nil") {
return /*15273*//*15274*/f/*<15274*//*15273*/(/*15275*/one/*<15275*/)(/*15276*/two/*<15276*/)/*<15273*/
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
return /*15284*//*15285*/f/*<15285*//*15284*/(/*15286*/one/*<15286*/)(/*15287*//*15288*/foldr1/*<15288*//*15287*/(/*15290*/f/*<15290*/)(/*15289*/rest/*<15289*/)/*<15287*/)/*<15284*/
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 15252');})(/*!*//*15254*/lst/*<15254*/)/*<15252*/ } }/*<15245*/;

const intersect = /*15297*/function name_15297(t$eq) { return function name_15297(one) { return function name_15297(two) { return /*15305*//*15307*/filter/*<15307*//*15305*/(/*15308*/function name_15308(v) { return /*15314*//*15315*/contains/*<15315*//*15314*/(/*15316*/two/*<15316*/)(/*15317*/v/*<15317*/)(/*15318*/t$eq/*<15318*/)/*<15314*/ }/*<15308*/)(/*15309*/one/*<15309*/)/*<15305*/ } } }/*<15297*/;

const tyvar_$gts = /*16534*/function name_16534({0: name, 1: kind}) {
 return /*16543*/(function match_16543($target) {
if ($target.type === "star") {
return /*16548*/name/*<16548*/
}
return /*16550*/`[${/*16552*/name/*<16552*/} : ${/*16554*//*16557*/kind_$gts/*<16557*//*16554*/(/*16558*/kind/*<16558*/)/*<16554*/}]`/*<16550*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 16543');})(/*!*//*16545*/kind/*<16545*/)/*<16543*/ }/*<16534*/;

const unzip = /*19011*/function name_19011(list) { return /*19016*/(function match_19016($target) {
if ($target.type === "nil") {
return /*19024*//*19025*/$co/*<19025*//*19024*/(/*19026*/nil/*<19026*/)(/*19040*/nil/*<19040*/)/*<19024*/
}
if ($target.type === "cons") {
if ($target[0].type === ",") {
{
let a = $target[0][0];
{
let b = $target[0][1];
{
let rest = $target[1];
return /*19058*/(function let_19058() {const $target = /*19037*//*19044*/unzip/*<19044*//*19037*/(/*19045*/rest/*<19045*/)/*<19037*/;
if ($target.type === ",") {
{
let left = $target[0];
{
let right = $target[1];
return /*19067*//*19068*/$co/*<19068*//*19067*/(/*19069*//*19069*/cons/*<19069*//*19069*/(/*19070*/a/*<19070*/)(/*19071*/left/*<19071*/)/*<19069*/)(/*19075*//*19075*/cons/*<19075*//*19075*/(/*19076*/b/*<19076*/)(/*19077*/right/*<19077*/)/*<19075*/)/*<19067*/
}
}
};
throw new Error('let pattern not matched 19061. ' + valueToString($target));})(/*!*/)/*<19058*/
}
}
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 19016');})(/*!*//*19022*/list/*<19022*/)/*<19016*/ }/*<19011*/;

const joinor = /*19396*/function name_19396(sep) { return function name_19396($default) { return function name_19396(items) { return /*19404*/(function match_19404($target) {
if ($target.type === "nil") {
return /*19408*/$default/*<19408*/
}
return /*19410*//*19412*/join/*<19412*//*19410*/(/*19413*/sep/*<19413*/)(/*19414*/items/*<19414*/)/*<19410*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 19404');})(/*!*//*19406*/items/*<19406*/)/*<19404*/ } } }/*<19396*/;

const is_empty = /*19418*/function name_19418(x) { return /*14225*/(function match_14225($target) {
if ($target.type === "nil") {
return /*14229*/true/*<14229*/
}
return /*14231*/false/*<14231*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 14225');})(/*!*//*14227*/x/*<14227*/)/*<14225*/ }/*<19418*/;

const letters = /*20044*//*20044*/cons/*<20044*//*20044*/(/*20046*/"a"/*<20046*/)(/*20044*//*20044*/cons/*<20044*//*20044*/(/*20048*/"b"/*<20048*/)(/*20044*//*20044*/cons/*<20044*//*20044*/(/*20050*/"c"/*<20050*/)(/*20044*//*20044*/cons/*<20044*//*20044*/(/*20052*/"d"/*<20052*/)(/*20044*//*20044*/cons/*<20044*//*20044*/(/*20054*/"e"/*<20054*/)(/*20044*//*20044*/cons/*<20044*//*20044*/(/*20056*/"f"/*<20056*/)(/*20044*//*20044*/cons/*<20044*//*20044*/(/*20058*/"g"/*<20058*/)(/*20044*//*20044*/cons/*<20044*//*20044*/(/*20060*/"h"/*<20060*/)(/*20044*//*20044*/cons/*<20044*//*20044*/(/*20062*/"i"/*<20062*/)(/*20044*/nil/*<20044*/)/*<20044*/)/*<20044*/)/*<20044*/)/*<20044*/)/*<20044*/)/*<20044*/)/*<20044*/)/*<20044*/)/*<20044*/;

const at = /*20064*/function name_20064(i) { return function name_20064(lst) { return /*20071*/(function match_20071($target) {
if ($target.type === "nil") {
return /*20075*//*20076*/fatal/*<20076*//*20075*/(/*20077*/"index out of range"/*<20077*/)/*<20075*/
}
if ($target.type === "cons") {
{
let one = $target[0];
{
let rest = $target[1];
return /*20085*/(function match_20085($target) {
if ($target === true) {
return /*20092*/one/*<20092*/
}
return /*20093*//*20094*/at/*<20094*//*20093*/(/*20095*//*20098*/_/*<20098*//*20095*/(/*20099*/i/*<20099*/)(/*20100*/1/*<20100*/)/*<20095*/)(/*20101*/rest/*<20101*/)/*<20093*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 20085');})(/*!*//*20087*//*20089*/$lt$eq/*<20089*//*20087*/(/*20090*/i/*<20090*/)(/*20091*/0/*<20091*/)/*<20087*/)/*<20085*/
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 20071');})(/*!*//*20073*/lst/*<20073*/)/*<20071*/ } }/*<20064*/;

const gen_name = /*20106*/function name_20106(num) { return /*9103*/`${/*9105*//*9107*/at/*<9107*//*9105*/(/*9108*/num/*<9108*/)(/*20102*/letters/*<20102*/)/*<9105*/}`/*<9103*/ }/*<20106*/;

const bag$sland = /*22415*/function name_22415(first) { return function name_22415(second) { return /*22421*/(function match_22421($target) {
if ($target.type === ",") {
if ($target[0].type === "empty") {
{
let a = $target[1];
return /*22432*/a/*<22432*/
}
}
}
if ($target.type === ",") {
{
let a = $target[0];
if ($target[1].type === "empty") {
return /*22438*/a/*<22438*/
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
return /*22448*//*22449*/many/*<22449*//*22448*/(/*22450*//*22450*/cons/*<22450*//*22450*/(/*22451*/a/*<22451*/)(/*22453*/b/*<22453*/)/*<22450*/)/*<22448*/
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
return /*22460*//*22461*/many/*<22461*//*22460*/(/*22462*//*22462*/cons/*<22462*//*22462*/(/*22463*/a/*<22463*/)(/*22465*/b/*<22465*/)/*<22462*/)/*<22460*/
}
}
}
}
return /*22467*//*22468*/many/*<22468*//*22467*/(/*22469*//*22469*/cons/*<22469*//*22469*/(/*22470*/first/*<22470*/)(/*22469*//*22469*/cons/*<22469*//*22469*/(/*22471*/second/*<22471*/)(/*22469*/nil/*<22469*/)/*<22469*/)/*<22469*/)/*<22467*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 22421');})(/*!*//*22423*//*22424*/$co/*<22424*//*22423*/(/*22425*/first/*<22425*/)(/*22426*/second/*<22426*/)/*<22423*/)/*<22421*/ } }/*<22415*/;

const bag$slfold = /*22473*/function name_22473(f) { return function name_22473(init) { return function name_22473(bag) { return /*22480*/(function match_22480($target) {
if ($target.type === "empty") {
return /*22485*/init/*<22485*/
}
if ($target.type === "one") {
{
let v = $target[0];
return /*22489*//*22490*/f/*<22490*//*22489*/(/*22491*/init/*<22491*/)(/*22492*/v/*<22492*/)/*<22489*/
}
}
if ($target.type === "many") {
{
let items = $target[0];
return /*22496*//*22497*/foldr/*<22497*//*22496*/(/*22498*/init/*<22498*/)(/*22499*/items/*<22499*/)(/*22500*//*22501*/bag$slfold/*<22501*//*22500*/(/*22502*/f/*<22502*/)/*<22500*/)/*<22496*/
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 22480');})(/*!*//*22482*/bag/*<22482*/)/*<22480*/ } } }/*<22473*/;

const concat_two = /*22504*/function name_22504(one) { return function name_22504(two) { return /*22510*/(function match_22510($target) {
if ($target.type === "nil") {
return /*22514*/two/*<22514*/
}
if ($target.type === "cons") {
{
let one = $target[0];
if ($target[1].type === "nil") {
return /*22517*//*22517*/cons/*<22517*//*22517*/(/*22518*/one/*<22518*/)(/*22520*/two/*<22520*/)/*<22517*/
}
}
}
if ($target.type === "cons") {
{
let one = $target[0];
{
let rest = $target[1];
return /*22525*//*22525*/cons/*<22525*//*22525*/(/*22526*/one/*<22526*/)(/*22528*//*22529*/concat_two/*<22529*//*22528*/(/*22530*/rest/*<22530*/)(/*22531*/two/*<22531*/)/*<22528*/)/*<22525*/
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 22510');})(/*!*//*22512*/one/*<22512*/)/*<22510*/ } }/*<22504*/;

const bag$slto_list = /*22533*/function name_22533(bag) { return /*22538*/(function match_22538($target) {
if ($target.type === "empty") {
return /*22543*/nil/*<22543*/
}
if ($target.type === "one") {
{
let a = $target[0];
return /*22547*//*22547*/cons/*<22547*//*22547*/(/*22548*/a/*<22548*/)(/*22547*/nil/*<22547*/)/*<22547*/
}
}
if ($target.type === "many") {
{
let bags = $target[0];
return /*22552*//*22553*/foldr/*<22553*//*22552*/(/*22554*/nil/*<22554*/)(/*22555*/bags/*<22555*/)(/*22556*/function name_22556(res) { return function name_22556(bag) { return /*22561*/(function match_22561($target) {
if ($target.type === "empty") {
return /*22566*/res/*<22566*/
}
if ($target.type === "one") {
{
let a = $target[0];
return /*22570*//*22570*/cons/*<22570*//*22570*/(/*22571*/a/*<22571*/)(/*22573*/res/*<22573*/)/*<22570*/
}
}
return /*22575*//*22576*/concat_two/*<22576*//*22575*/(/*22577*//*22578*/bag$slto_list/*<22578*//*22577*/(/*22579*/bag/*<22579*/)/*<22577*/)(/*22580*/res/*<22580*/)/*<22575*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 22561');})(/*!*//*22563*/bag/*<22563*/)/*<22561*/ } }/*<22556*/)/*<22552*/
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 22538');})(/*!*//*22540*/bag/*<22540*/)/*<22538*/ }/*<22533*/;

const pat_names = /*22610*/function name_22610(pat) { return /*22615*/(function match_22615($target) {
if ($target.type === "pany") {
return /*22621*/set$slnil/*<22621*/
}
if ($target.type === "pvar") {
{
let name = $target[0];
{
let l = $target[1];
return /*22626*//*22627*/set$sladd/*<22627*//*22626*/(/*22628*/set$slnil/*<22628*/)(/*22629*/name/*<22629*/)/*<22626*/
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
return /*22635*//*22636*/foldl/*<22636*//*22635*/(/*22637*/set$slnil/*<22637*/)(/*22638*/args/*<22638*/)(/*22639*/function name_22639(bound) { return function name_22639(arg) { return /*22644*//*22645*/set$slmerge/*<22645*//*22644*/(/*22646*/bound/*<22646*/)(/*22647*//*22648*/pat_names/*<22648*//*22647*/(/*22649*/arg/*<22649*/)/*<22647*/)/*<22644*/ } }/*<22639*/)/*<22635*/
}
}
}
}
if ($target.type === "pstr") {
{
let string = $target[0];
{
let int = $target[1];
return /*22654*/set$slnil/*<22654*/
}
}
}
if ($target.type === "pprim") {
{
let prim = $target[0];
{
let int = $target[1];
return /*22659*/set$slnil/*<22659*/
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 22615');})(/*!*//*22617*/pat/*<22617*/)/*<22615*/ }/*<22610*/;

const pat_externals = /*22661*/function name_22661(pat) { return /*22666*/(function match_22666($target) {
if ($target.type === "pcon") {
{
let name = $target[0];
{
let args = $target[1];
{
let l = $target[2];
return /*22675*//*22676*/bag$sland/*<22676*//*22675*/(/*22677*//*22678*/one/*<22678*//*22677*/(/*22679*//*22680*/$co$co/*<22680*//*22679*/(/*22681*/name/*<22681*/)(/*22682*//*22683*/value/*<22683*//*22682*//*<22682*/)(/*22684*/l/*<22684*/)/*<22679*/)/*<22677*/)(/*22685*//*22686*/many/*<22686*//*22685*/(/*22687*//*22688*/map/*<22688*//*22687*/(/*22690*/pat_externals/*<22690*/)(/*23268*/args/*<23268*/)/*<22687*/)/*<22685*/)/*<22675*/
}
}
}
}
return /*22692*/empty/*<22692*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 22666');})(/*!*//*22668*/pat/*<22668*/)/*<22666*/ }/*<22661*/;

const ljoin = /*23914*/function name_23914(prefix) { return function name_23914(items) { return /*23921*/(function match_23921($target) {
if ($target.type === "nil") {
return /*23925*/""/*<23925*/
}
if ($target.type === "cons") {
{
let one = $target[0];
{
let items = $target[1];
return /*23933*/`${/*23935*/prefix/*<23935*/}${/*23937*/one/*<23937*/}${/*23939*//*23941*/ljoin/*<23941*//*23939*/(/*23942*/prefix/*<23942*/)(/*23943*/items/*<23943*/)/*<23939*/}`/*<23933*/
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 23921');})(/*!*//*23923*/items/*<23923*/)/*<23921*/ } }/*<23914*/;

const make_kind = /*24193*/function name_24193(kinds) { return /*24199*/(function match_24199($target) {
if ($target.type === "nil") {
return /*24203*/star/*<24203*/
}
if ($target.type === "cons") {
{
let one = $target[0];
{
let rest = $target[1];
return /*24210*//*24211*/kfun/*<24211*//*24210*/(/*24212*/one/*<24212*/)(/*24213*//*24214*/make_kind/*<24214*//*24213*/(/*24215*/rest/*<24215*/)/*<24213*/)/*<24210*/
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 24199');})(/*!*//*24201*/kinds/*<24201*/)/*<24199*/ }/*<24193*/;

const pat_loc = /*24527*/function name_24527(pat) { return /*24532*/(function match_24532($target) {
if ($target.type === "pany") {
{
let l = $target[0];
return /*24538*/l/*<24538*/
}
}
if ($target.type === "pprim") {
{
let l = $target[1];
return /*24543*/l/*<24543*/
}
}
if ($target.type === "pstr") {
{
let l = $target[1];
return /*24548*/l/*<24548*/
}
}
if ($target.type === "pvar") {
{
let l = $target[1];
return /*24553*/l/*<24553*/
}
}
if ($target.type === "pcon") {
{
let l = $target[2];
return /*24559*/l/*<24559*/
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 24532');})(/*!*//*24534*/pat/*<24534*/)/*<24532*/ }/*<24527*/;

const escape_string = /*24765*/function name_24765(string) { return /*24770*//*24771*/replaces/*<24771*//*24770*/(/*24772*/string/*<24772*/)(/*24773*//*24773*/cons/*<24773*//*24773*/(/*24774*//*24775*/$co/*<24775*//*24774*/(/*24776*/"\\"/*<24776*/)(/*24778*/"\\\\"/*<24778*/)/*<24774*/)(/*24773*//*24773*/cons/*<24773*//*24773*/(/*24780*//*24781*/$co/*<24781*//*24780*/(/*24782*/"\n"/*<24782*/)(/*24784*/"\\n"/*<24784*/)/*<24780*/)(/*24773*//*24773*/cons/*<24773*//*24773*/(/*24786*//*24787*/$co/*<24787*//*24786*/(/*24788*/"\""/*<24788*/)(/*24790*/"\\\""/*<24790*/)/*<24786*/)(/*24773*//*24773*/cons/*<24773*//*24773*/(/*24792*//*24793*/$co/*<24793*//*24792*/(/*24794*/"\`"/*<24794*/)(/*24796*/"\\\`"/*<24796*/)/*<24792*/)(/*24773*//*24773*/cons/*<24773*//*24773*/(/*24798*//*24799*/$co/*<24799*//*24798*/(/*24800*/"\$"/*<24800*/)(/*24802*/"\\\$"/*<24802*/)/*<24798*/)(/*24773*/nil/*<24773*/)/*<24773*/)/*<24773*/)/*<24773*/)/*<24773*/)/*<24773*/)/*<24770*/ }/*<24765*/;

const just_pat = /*24978*/function name_24978(pat) { return /*24983*/(function match_24983($target) {
if ($target.type === "pany") {
return /*24989*//*24990*/none/*<24990*//*24989*//*<24989*/
}
if ($target.type === "pvar") {
{
let name = $target[0];
{
let l = $target[1];
return /*24995*//*24996*/some/*<24996*//*24995*/(/*24997*//*24998*/sanitize/*<24998*//*24997*/(/*24999*/name/*<24999*/)/*<24997*/)/*<24995*/
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
return /*25005*/(function match_25005($target) {
if ($target.type === ",") {
if ($target[1].type === "nil") {
return /*25060*/none/*<25060*/
}
}
if ($target.type === ",") {
{
let items = $target[1];
return /*25065*//*25066*/some/*<25066*//*25065*/(/*25067*/`{${/*25069*//*25070*/join/*<25070*//*25069*/(/*25071*/", "/*<25071*/)(/*25073*//*25074*/rev/*<25074*//*25073*/(/*25075*/items/*<25075*/)(/*25076*/nil/*<25076*/)/*<25073*/)/*<25069*/}}`/*<25067*/)/*<25065*/
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 25005');})(/*!*//*25007*//*25008*/foldl/*<25008*//*25007*/(/*25009*//*25010*/$co/*<25010*//*25009*/(/*25011*/0/*<25011*/)(/*25012*/nil/*<25012*/)/*<25009*/)(/*25013*/args/*<25013*/)(/*25014*/function name_25014({0: i, 1: res}) {
 return function name_25014(arg) { return /*25022*/(function match_25022($target) {
if ($target.type === "none") {
return /*25029*//*25030*/$co/*<25030*//*25029*/(/*25031*//*25032*/$pl/*<25032*//*25031*/(/*25033*/i/*<25033*/)(/*25034*/1/*<25034*/)/*<25031*/)(/*25035*/res/*<25035*/)/*<25029*/
}
if ($target.type === "some") {
{
let what = $target[0];
return /*25039*//*25040*/$co/*<25040*//*25039*/(/*25041*//*25042*/$pl/*<25042*//*25041*/(/*25043*/i/*<25043*/)(/*25044*/1/*<25044*/)/*<25041*/)(/*25045*//*25045*/cons/*<25045*//*25045*/(/*25046*/`${/*25048*//*25049*/its/*<25049*//*25048*/(/*25050*/i/*<25050*/)/*<25048*/}: ${/*25052*/what/*<25052*/}`/*<25046*/)(/*25055*/res/*<25055*/)/*<25045*/)/*<25039*/
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 25022');})(/*!*//*25024*//*25025*/just_pat/*<25025*//*25024*/(/*25026*/arg/*<25026*/)/*<25024*/)/*<25022*/ } }/*<25014*/)/*<25007*/)/*<25005*/
}
}
}
}
if ($target.type === "pstr") {
return /*25082*//*25083*/fatal/*<25083*//*25082*/(/*25084*/"Cant use string as a pattern in this location"/*<25084*/)/*<25082*/
}
if ($target.type === "pprim") {
return /*25090*//*25091*/fatal/*<25091*//*25090*/(/*25092*/"Cant use primitive as a pattern in this location"/*<25092*/)/*<25090*/
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 24983');})(/*!*//*24985*/pat/*<24985*/)/*<24983*/ }/*<24978*/;

const mapr = /*25914*/function name_25914(a) { return function name_25914(b) { return /*25923*//*25924*/map/*<25924*//*25923*/(/*25925*/b/*<25925*/)(/*25926*/a/*<25926*/)/*<25923*/ } }/*<25914*/;

const cst$sllist = (v0) => (v1) => ({type: "cst/list", 0: v0, 1: v1});
const cst$slarray = (v0) => (v1) => ({type: "cst/array", 0: v0, 1: v1});
const cst$slspread = (v0) => (v1) => ({type: "cst/spread", 0: v0, 1: v1});
const cst$slidentifier = (v0) => (v1) => ({type: "cst/identifier", 0: v0, 1: v1});
const cst$slstring = (v0) => (v1) => (v2) => ({type: "cst/string", 0: v0, 1: v1, 2: v2});
const tvar = (v0) => (v1) => ({type: "tvar", 0: v0, 1: v1});
const tapp = (v0) => (v1) => (v2) => ({type: "tapp", 0: v0, 1: v1, 2: v2});
const tcon = (v0) => (v1) => ({type: "tcon", 0: v0, 1: v1});
const tgen = (v0) => (v1) => ({type: "tgen", 0: v0, 1: v1});
const pat_loop = /*24812*/function name_24812(target) { return function name_24812(args) { return function name_24812(i) { return function name_24812(inner) { return function name_24812(trace) { return /*24821*/(function match_24821($target) {
if ($target.type === "nil") {
return /*24825*/inner/*<24825*/
}
if ($target.type === "cons") {
{
let arg = $target[0];
{
let rest = $target[1];
return /*24830*//*24831*/compile_pat/*<24831*//*24830*/(/*24832*/arg/*<24832*/)(/*24833*/`${/*24835*/target/*<24835*/}[${/*24837*//*24838*/its/*<24838*//*24837*/(/*24839*/i/*<24839*/)/*<24837*/}]`/*<24833*/)(/*24841*//*24842*/pat_loop/*<24842*//*24841*/(/*24843*/target/*<24843*/)(/*24844*/rest/*<24844*/)(/*24845*//*24846*/$pl/*<24846*//*24845*/(/*24847*/i/*<24847*/)(/*24848*/1/*<24848*/)/*<24845*/)(/*24849*/inner/*<24849*/)(/*24850*/trace/*<24850*/)/*<24841*/)(/*24851*/trace/*<24851*/)/*<24830*/
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 24821');})(/*!*//*24823*/args/*<24823*/)/*<24821*/ } } } } }/*<24812*/;


const compile_pat = /*24853*/function name_24853(pat) { return function name_24853(target) { return function name_24853(inner) { return function name_24853(trace) { return /*24861*//*24862*/trace_and_block/*<24862*//*24861*/(/*24863*//*24864*/pat_loc/*<24864*//*24863*/(/*24865*/pat/*<24865*/)/*<24863*/)(/*24866*/trace/*<24866*/)(/*24867*/target/*<24867*/)(/*24868*/(function match_24868($target) {
if ($target.type === "pany") {
{
let l = $target[0];
return /*24874*/inner/*<24874*/
}
}
if ($target.type === "pprim") {
{
let prim = $target[0];
{
let l = $target[1];
return /*24879*/(function match_24879($target) {
if ($target.type === "pint") {
{
let int = $target[0];
return /*24886*/`if (${/*24888*/target/*<24888*/} === ${/*24890*//*24891*/its/*<24891*//*24890*/(/*24892*/int/*<24892*/)/*<24890*/}) {\n${/*24894*/inner/*<24894*/}\n}`/*<24886*/
}
}
if ($target.type === "pbool") {
{
let bool = $target[0];
return /*24900*/`if (${/*24902*/target/*<24902*/} === ${/*24904*/(function match_24904($target) {
if ($target === true) {
return /*24908*/"true"/*<24908*/
}
return /*24911*/"false"/*<24911*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 24904');})(/*!*//*24906*/bool/*<24906*/)/*<24904*/}) {\n${/*24914*/inner/*<24914*/}\n}`/*<24900*/
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 24879');})(/*!*//*24881*/prim/*<24881*/)/*<24879*/
}
}
}
if ($target.type === "pstr") {
{
let str = $target[0];
{
let l = $target[1];
return /*24920*/`if (${/*24922*/target/*<24922*/} === \"${/*24924*/str/*<24924*/}\"){\n${/*24926*/inner/*<24926*/}\n}`/*<24920*/
}
}
}
if ($target.type === "pvar") {
{
let name = $target[0];
{
let l = $target[1];
return /*24932*/`{\nlet ${/*24934*//*24935*/sanitize/*<24935*//*24934*/(/*24936*/name/*<24936*/)/*<24934*/} = ${/*24938*/target/*<24938*/};\n${/*24940*/inner/*<24940*/}\n}`/*<24932*/
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
return /*24947*/`if (${/*24949*/target/*<24949*/}.type === \"${/*24951*/name/*<24951*/}\") {\n${/*24953*//*24954*/pat_loop/*<24954*//*24953*/(/*24955*/target/*<24955*/)(/*24956*/args/*<24956*/)(/*24957*/0/*<24957*/)(/*24958*/inner/*<24958*/)(/*24959*/trace/*<24959*/)/*<24953*/}\n}`/*<24947*/
}
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 24868');})(/*!*//*24870*/pat/*<24870*/)/*<24868*/)/*<24861*/ } } } }/*<24853*/;

const star_con = /*208*/function name_208(name) { return /*213*//*214*/tcon/*<214*//*213*/(/*215*//*216*/tycon/*<216*//*215*/(/*217*/name/*<217*/)(/*218*/star/*<218*/)/*<215*/)(/*219*/-1/*<219*/)/*<213*/ }/*<208*/;

const tunit = /*223*//*224*/star_con/*<224*//*223*/(/*225*/"()"/*<225*/)/*<223*/;

const tchar = /*230*//*231*/star_con/*<231*//*230*/(/*232*/"char"/*<232*/)/*<230*/;

const tint = /*237*//*238*/star_con/*<238*//*237*/(/*239*/"int"/*<239*/)/*<237*/;

const tinteger = /*244*//*245*/star_con/*<245*//*244*/(/*246*/"int"/*<246*/)/*<244*/;

const tfloat = /*251*//*252*/star_con/*<252*//*251*/(/*253*/"float"/*<253*/)/*<251*/;

const tdouble = /*258*//*259*/star_con/*<259*//*258*/(/*260*/"double"/*<260*/)/*<258*/;

const tlist = /*265*//*266*/tcon/*<266*//*265*/(/*267*//*268*/tycon/*<268*//*267*/(/*269*/"array"/*<269*/)(/*271*//*272*/kfun/*<272*//*271*/(/*273*/star/*<273*/)(/*274*/star/*<274*/)/*<271*/)/*<267*/)(/*275*/-1/*<275*/)/*<265*/;

const tarrow = /*279*//*280*/tcon/*<280*//*279*/(/*281*//*282*/tycon/*<282*//*281*/(/*283*/"(->)"/*<283*/)(/*285*//*286*/kfun/*<286*//*285*/(/*287*/star/*<287*/)(/*288*//*289*/kfun/*<289*//*288*/(/*290*/star/*<290*/)(/*291*/star/*<291*/)/*<288*/)/*<285*/)/*<281*/)(/*292*/-1/*<292*/)/*<279*/;

const ttuple2 = /*296*//*297*/tcon/*<297*//*296*/(/*298*//*299*/tycon/*<299*//*298*/(/*300*/"(,)"/*<300*/)(/*302*//*303*/kfun/*<303*//*302*/(/*304*/star/*<304*/)(/*305*//*306*/kfun/*<306*//*305*/(/*307*/star/*<307*/)(/*308*/star/*<308*/)/*<305*/)/*<302*/)/*<298*/)(/*309*/-1/*<309*/)/*<296*/;

const tstring = /*313*//*20018*/star_con/*<20018*//*313*/(/*20019*/"string"/*<20019*/)/*<313*/;

const tfn = /*318*/function name_318(a) { return function name_318(b) { return /*324*//*325*/tapp/*<325*//*324*/(/*326*//*327*/tapp/*<327*//*326*/(/*328*/tarrow/*<328*/)(/*329*/a/*<329*/)(/*330*/-1/*<330*/)/*<326*/)(/*331*/b/*<331*/)(/*332*/-1/*<332*/)/*<324*/ } }/*<318*/;

const mklist = /*333*/function name_333(t) { return /*338*//*339*/tapp/*<339*//*338*/(/*340*/tlist/*<340*/)(/*341*/t/*<341*/)(/*342*/-1/*<342*/)/*<338*/ }/*<333*/;

const mkpair = /*343*/function name_343(a) { return function name_343(b) { return /*349*//*350*/tapp/*<350*//*349*/(/*351*//*352*/tapp/*<352*//*351*/(/*353*/ttuple2/*<353*/)(/*354*/a/*<354*/)(/*355*/-1/*<355*/)/*<351*/)(/*356*/b/*<356*/)(/*357*/-1/*<357*/)/*<349*/ } }/*<343*/;

const type$slapply = /*440*/function name_440(subst) { return function name_440(type) { return /*513*/(function match_513($target) {
if ($target.type === "tvar") {
{
let tyvar = $target[0];
return /*520*/(function match_520($target) {
if ($target.type === "none") {
return /*530*/type/*<530*/
}
if ($target.type === "some") {
{
let type = $target[0];
return /*534*/type/*<534*/
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 520');})(/*!*//*522*//*523*/map$slget/*<523*//*522*/(/*525*/subst/*<525*/)(/*527*/tyvar/*<527*/)/*<522*/)/*<520*/
}
}
if ($target.type === "tapp") {
{
let target = $target[0];
{
let arg = $target[1];
{
let loc = $target[2];
return /*539*//*540*/tapp/*<540*//*539*/(/*541*//*542*/type$slapply/*<542*//*541*/(/*543*/subst/*<543*/)(/*544*/target/*<544*/)/*<541*/)(/*545*//*546*/type$slapply/*<546*//*545*/(/*547*/subst/*<547*/)(/*548*/arg/*<548*/)/*<545*/)(/*587*/loc/*<587*/)/*<539*/
}
}
}
}
return /*550*/type/*<550*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 513');})(/*!*//*515*/type/*<515*/)/*<513*/ } }/*<440*/;

const type$sltv = /*551*/function name_551(t) { return /*557*/(function match_557($target) {
if ($target.type === "tvar") {
{
let u = $target[0];
return /*564*//*572*/set$sladd/*<572*//*564*/(/*573*/set$slnil/*<573*/)(/*574*/u/*<574*/)/*<564*/
}
}
if ($target.type === "tapp") {
{
let l = $target[0];
{
let r = $target[1];
return /*571*//*575*/set$slmerge/*<575*//*571*/(/*576*//*577*/type$sltv/*<577*//*576*/(/*578*/l/*<578*/)/*<576*/)(/*579*//*580*/type$sltv/*<580*//*579*/(/*581*/r/*<581*/)/*<579*/)/*<571*/
}
}
}
return /*583*/set$slnil/*<583*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 557');})(/*!*//*559*/t/*<559*/)/*<557*/ }/*<551*/;

const compose_subst = /*584*/function name_584(s1) { return function name_584(s2) { return /*594*//*595*/map$slmerge/*<595*//*594*/(/*596*//*597*/map$slmap/*<597*//*596*/(/*599*//*600*/type$slapply/*<600*//*599*/(/*601*/s1/*<601*/)/*<599*/)(/*603*/s2/*<603*/)/*<596*/)(/*602*/s1/*<602*/)/*<594*/ } }/*<584*/;

const set$slintersect = /*691*/function name_691(one) { return function name_691(two) { return /*700*//*701*/filter/*<701*//*700*/(/*706*/function name_706(k) { return /*710*//*711*/set$slhas/*<711*//*710*/(/*712*/two/*<712*/)(/*713*/k/*<713*/)/*<710*/ }/*<706*/)(/*702*//*703*/set$slto_list/*<703*//*702*/(/*704*/one/*<704*/)/*<702*/)/*<700*/ } }/*<691*/;

/* type alias subst */
const isin = (v0) => (v1) => ({type: "isin", 0: v0, 1: v1});
const type$eq = /*6482*/function name_6482(a) { return function name_6482(b) { return /*6489*/(function match_6489($target) {
if ($target.type === ",") {
if ($target[0].type === "tvar") {
{
let ty = $target[0][0];
if ($target[1].type === "tvar") {
{
let ty$qu = $target[1][0];
return /*6505*//*6506*/tyvar$eq/*<6506*//*6505*/(/*6507*/ty/*<6507*/)(/*6508*/ty$qu/*<6508*/)/*<6505*/
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
return /*6548*/(function match_6548($target) {
if ($target === true) {
return /*6554*//*6555*/type$eq/*<6555*//*6554*/(/*6556*/arg/*<6556*/)(/*6557*/arg$qu/*<6557*/)/*<6554*/
}
return /*6558*/false/*<6558*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 6548');})(/*!*//*6550*//*6551*/type$eq/*<6551*//*6550*/(/*6552*/target/*<6552*/)(/*6553*/target$qu/*<6553*/)/*<6550*/)/*<6548*/
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
return /*6570*//*6571*/tycon$eq/*<6571*//*6570*/(/*6572*/tycon/*<6572*/)(/*6573*/tycon$qu/*<6573*/)/*<6570*/
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
return /*6585*//*6586*/$eq/*<6586*//*6585*/(/*6587*/n/*<6587*/)(/*6588*/n$qu/*<6588*/)/*<6585*/
}
}
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 6489');})(/*!*//*6491*//*6492*/$co/*<6492*//*6491*/(/*6493*/a/*<6493*/)(/*6494*/b/*<6494*/)/*<6491*/)/*<6489*/ } }/*<6482*/;

const pred$slapply = /*6607*/function name_6607(subst) { return function name_6607({0: i, 1: t}) {
 return /*6685*//*6686*/isin/*<6686*//*6685*/(/*6687*/i/*<6687*/)(/*6688*//*6689*/type$slapply/*<6689*//*6688*/(/*6690*/subst/*<6690*/)(/*6691*/t/*<6691*/)/*<6688*/)/*<6685*/ } }/*<6607*/;

const pred$sltv = /*6675*/function name_6675({0: i, 1: t}) {
 return /*6701*//*6702*/type$sltv/*<6702*//*6701*/(/*6703*/t/*<6703*/)/*<6701*/ }/*<6675*/;

const lift = /*6770*/function name_6770(m) { return function name_6770({0: i, 1: t}) {
 return function name_6770({0: i$qu, 1: t$qu}) {
 return /*6784*/(function match_6784($target) {
if ($target === true) {
return /*6790*//*6791*/m/*<6791*//*6790*/(/*6792*/t/*<6792*/)(/*6793*/t$qu/*<6793*/)/*<6790*/
}
return /*6794*//*6795*/fatal/*<6795*//*6794*/(/*6796*/"classes differ"/*<6796*/)/*<6794*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 6784');})(/*!*//*6786*//*6787*/$eq/*<6787*//*6786*/(/*6788*/i/*<6788*/)(/*6789*/i$qu/*<6789*/)/*<6786*/)/*<6784*/ } } }/*<6770*/;

const type$slhnf = /*8201*/function name_8201(type) { return /*8211*/(function match_8211($target) {
if ($target.type === "tvar") {
return /*8218*/true/*<8218*/
}
if ($target.type === "tcon") {
return /*8225*/false/*<8225*/
}
if ($target.type === "tapp") {
{
let t = $target[0];
return /*8230*//*8232*/type$slhnf/*<8232*//*8230*/(/*8233*/t/*<8233*/)/*<8230*/
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 8211');})(/*!*//*8213*/type/*<8213*/)/*<8211*/ }/*<8201*/;

const in_hnf = /*8235*/function name_8235({1: t}) { return /*8244*//*8245*/type$slhnf/*<8245*//*8244*/(/*8246*/t/*<8246*/)/*<8244*/ }/*<8235*/;

const inst$sltype = /*9387*/function name_9387(types) { return function name_9387(type) { return /*9394*/(function match_9394($target) {
if ($target.type === "tapp") {
{
let l = $target[0];
{
let r = $target[1];
{
let loc = $target[2];
return /*9401*//*9402*/tapp/*<9402*//*9401*/(/*9403*//*9404*/inst$sltype/*<9404*//*9403*/(/*9405*/types/*<9405*/)(/*9406*/l/*<9406*/)/*<9403*/)(/*9407*//*9408*/inst$sltype/*<9408*//*9407*/(/*9409*/types/*<9409*/)(/*9410*/r/*<9410*/)/*<9407*/)(/*9411*/loc/*<9411*/)/*<9401*/
}
}
}
}
if ($target.type === "tgen") {
{
let n = $target[0];
return /*9417*//*9418*/list$slget/*<9418*//*9417*/(/*9419*/types/*<9419*/)(/*9420*/n/*<9420*/)/*<9417*/
}
}
{
let t = $target;
return /*9476*/t/*<9476*/
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 9394');})(/*!*//*9396*/type/*<9396*/)/*<9394*/ } }/*<9387*/;

const inst$slpred = /*9516*/function name_9516(types) { return function name_9516({0: c, 1: t}) {
 return /*9525*//*9529*/isin/*<9529*//*9525*/(/*9530*/c/*<9530*/)(/*9531*//*9532*/inst$sltype/*<9532*//*9531*/(/*9533*/types/*<9533*/)(/*9534*/t/*<9534*/)/*<9531*/)/*<9525*/ } }/*<9516*/;

const tbool = /*9722*//*9723*/star_con/*<9723*//*9722*/(/*9724*/"bool"/*<9724*/)/*<9722*/;

const tapps = /*10805*/function name_10805(items) { return function name_10805(l) { return /*10811*/(function match_10811($target) {
if ($target.type === "cons") {
{
let one = $target[0];
if ($target[1].type === "nil") {
return /*10816*/one/*<10816*/
}
}
}
if ($target.type === "cons") {
{
let one = $target[0];
{
let rest = $target[1];
return /*10821*//*10822*/tapp/*<10822*//*10821*/(/*10823*//*10824*/tapps/*<10824*//*10823*/(/*10825*/rest/*<10825*/)(/*10826*/l/*<10826*/)/*<10823*/)(/*10827*/one/*<10827*/)(/*10828*/l/*<10828*/)/*<10821*/
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 10811');})(/*!*//*10813*/items/*<10813*/)/*<10811*/ } }/*<10805*/;

const parse_type = /*10830*/function name_10830(type) { return /*10835*/(function match_10835($target) {
if ($target.type === "cst/identifier") {
{
let id = $target[0];
{
let l = $target[1];
return /*10842*//*10843*/tcon/*<10843*//*10842*/(/*12888*//*10844*/tycon/*<10844*//*12888*/(/*12889*/id/*<12889*/)(/*12890*/star/*<12890*/)/*<12888*/)(/*10845*/l/*<10845*/)/*<10842*/
}
}
}
if ($target.type === "cst/list") {
if ($target[0].type === "nil") {
{
let l = $target[1];
return /*10850*//*10851*/fatal/*<10851*//*10850*/(/*10852*/"(parse-type) with empty list"/*<10852*/)/*<10850*/
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
return /*10868*//*10869*/foldl/*<10869*//*10868*/(/*10870*//*10871*/parse_type/*<10871*//*10870*/(/*10872*/body/*<10872*/)/*<10870*/)(/*10873*//*10874*/rev/*<10874*//*10873*/(/*10875*/args/*<10875*/)(/*10876*/nil/*<10876*/)/*<10873*/)(/*10877*/function name_10877(body) { return function name_10877(arg) { return /*10882*//*10883*/tfn/*<10883*//*10882*/(/*10891*//*10892*/parse_type/*<10892*//*10891*/(/*10893*/arg/*<10893*/)/*<10891*/)(/*10895*/body/*<10895*/)/*<10882*/ } }/*<10877*/)/*<10868*/
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
return /*10901*//*10902*/tapps/*<10902*//*10901*/(/*10903*//*10904*/rev/*<10904*//*10903*/(/*10905*//*10906*/map/*<10906*//*10905*/(/*10908*/parse_type/*<10908*/)(/*12887*/items/*<12887*/)/*<10905*/)(/*10909*/nil/*<10909*/)/*<10903*/)(/*10910*/l/*<10910*/)/*<10901*/
}
}
}
return /*10912*//*10913*/fatal/*<10913*//*10912*/(/*10914*/`(parse-type) Invalid type ${/*10916*//*10917*/valueToString/*<10917*//*10916*/(/*10918*/type/*<10918*/)/*<10916*/}`/*<10914*/)/*<10912*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 10835');})(/*!*//*10837*/type/*<10837*/)/*<10835*/ }/*<10830*/;

const parse_pat = /*11023*/function name_11023(pat) { return /*11028*/(function match_11028($target) {
if ($target.type === "cst/identifier") {
if ($target[0] === "_"){
{
let l = $target[1];
return /*11036*//*11037*/pany/*<11037*//*11036*/(/*11038*/l/*<11038*/)/*<11036*/
}
}
}
if ($target.type === "cst/identifier") {
if ($target[0] === "true"){
{
let l = $target[1];
return /*11044*//*11045*/pprim/*<11045*//*11044*/(/*11046*//*11047*/pbool/*<11047*//*11046*/(/*11048*/true/*<11048*/)(/*11049*/l/*<11049*/)/*<11046*/)(/*11050*/l/*<11050*/)/*<11044*/
}
}
}
if ($target.type === "cst/identifier") {
if ($target[0] === "false"){
{
let l = $target[1];
return /*11056*//*11057*/pprim/*<11057*//*11056*/(/*11058*//*11059*/pbool/*<11059*//*11058*/(/*11060*/false/*<11060*/)(/*11061*/l/*<11061*/)/*<11058*/)(/*11062*/l/*<11062*/)/*<11056*/
}
}
}
if ($target.type === "cst/string") {
{
let first = $target[0];
if ($target[1].type === "nil") {
{
let l = $target[2];
return /*11068*//*11069*/pstr/*<11069*//*11068*/(/*11070*/first/*<11070*/)(/*11071*/l/*<11071*/)/*<11068*/
}
}
}
}
if ($target.type === "cst/identifier") {
{
let id = $target[0];
{
let l = $target[1];
return /*11076*/(function match_11076($target) {
if ($target.type === "some") {
{
let int = $target[0];
return /*11084*//*11085*/pprim/*<11085*//*11084*/(/*11086*//*11087*/pint/*<11087*//*11086*/(/*11088*/int/*<11088*/)(/*11089*/l/*<11089*/)/*<11086*/)(/*11090*/l/*<11090*/)/*<11084*/
}
}
return /*11092*//*11093*/pvar/*<11093*//*11092*/(/*11094*/id/*<11094*/)(/*11095*/l/*<11095*/)/*<11092*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 11076');})(/*!*//*11078*//*11079*/string_to_int/*<11079*//*11078*/(/*11080*/id/*<11080*/)/*<11078*/)/*<11076*/
}
}
}
if ($target.type === "cst/array") {
if ($target[0].type === "nil") {
{
let l = $target[1];
return /*11101*//*11102*/pcon/*<11102*//*11101*/(/*11103*/"nil"/*<11103*/)(/*11105*/nil/*<11105*/)(/*11106*/l/*<11106*/)/*<11101*/
}
}
}
if ($target.type === "cst/array") {
if ($target[0].type === "cons") {
if ($target[0][0].type === "cst/spread") {
{
let inner = $target[0][0][0];
if ($target[0][1].type === "nil") {
return /*11115*//*11116*/parse_pat/*<11116*//*11115*/(/*11117*/inner/*<11117*/)/*<11115*/
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
return /*11125*//*11126*/pcon/*<11126*//*11125*/(/*11127*/"cons"/*<11127*/)(/*11129*//*11129*/cons/*<11129*//*11129*/(/*11130*//*11131*/parse_pat/*<11131*//*11130*/(/*11132*/one/*<11132*/)/*<11130*/)(/*11129*//*11129*/cons/*<11129*//*11129*/(/*11133*//*11134*/parse_pat/*<11134*//*11133*/(/*11135*//*11136*/cst$slarray/*<11136*//*11135*/(/*11137*/rest/*<11137*/)(/*11138*/l/*<11138*/)/*<11135*/)/*<11133*/)(/*11129*/nil/*<11129*/)/*<11129*/)/*<11129*/)(/*11139*/l/*<11139*/)/*<11125*/
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
return /*11150*//*11151*/pcon/*<11151*//*11150*/(/*11152*/name/*<11152*/)(/*11153*//*11154*/map/*<11154*//*11153*/(/*11156*/parse_pat/*<11156*/)(/*12927*/rest/*<12927*/)/*<11153*/)(/*11157*/l/*<11157*/)/*<11150*/
}
}
}
}
}
}
return /*11159*//*11160*/fatal/*<11160*//*11159*/(/*11161*/`parse-pat mo match ${/*11163*//*11164*/valueToString/*<11164*//*11163*/(/*11165*/pat/*<11165*/)/*<11163*/}`/*<11161*/)/*<11159*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 11028');})(/*!*//*11030*/pat/*<11030*/)/*<11028*/ }/*<11023*/;

/* type alias ambiguity */
const stdClasses = /*14037*//*14038*/$pl$pl$pl/*<14038*//*14037*/(/*14004*//*14004*/cons/*<14004*//*14004*/(/*14005*/"eq"/*<14005*/)(/*14004*//*14004*/cons/*<14004*//*14004*/(/*14007*/"ord"/*<14007*/)(/*14004*//*14004*/cons/*<14004*//*14004*/(/*14009*/"show"/*<14009*/)(/*14004*//*14004*/cons/*<14004*//*14004*/(/*14011*/"read"/*<14011*/)(/*14004*//*14004*/cons/*<14004*//*14004*/(/*20279*/"pretty"/*<20279*/)(/*14004*//*14004*/cons/*<14004*//*14004*/(/*14013*/"bounded"/*<14013*/)(/*14004*//*14004*/cons/*<14004*//*14004*/(/*14015*/"enum"/*<14015*/)(/*14004*//*14004*/cons/*<14004*//*14004*/(/*14017*/"ix"/*<14017*/)(/*14004*//*14004*/cons/*<14004*//*14004*/(/*14019*/"functor"/*<14019*/)(/*14004*//*14004*/cons/*<14004*//*14004*/(/*14021*/"monad"/*<14021*/)(/*14004*//*14004*/cons/*<14004*//*14004*/(/*14023*/"monadplus"/*<14023*/)(/*14004*/nil/*<14004*/)/*<14004*/)/*<14004*/)/*<14004*/)/*<14004*/)/*<14004*/)/*<14004*/)/*<14004*/)/*<14004*/)/*<14004*/)/*<14004*/)/*<14004*/)(/*14039*/numClasses/*<14039*/)/*<14037*/;

const preds$sltv = /*14333*/function name_14333(preds) { return /*14339*//*14340*/foldl/*<14340*//*14339*/(/*14341*/set$slnil/*<14341*/)(/*14342*/preds/*<14342*/)(/*14343*/function name_14343(res) { return function name_14343(pred) { return /*14349*//*14350*/set$slmerge/*<14350*//*14349*/(/*14351*/res/*<14351*/)(/*14352*//*14353*/pred$sltv/*<14353*//*14352*/(/*14354*/pred/*<14354*/)/*<14352*/)/*<14349*/ } }/*<14343*/)/*<14339*/ }/*<14333*/;

const preds$slapply = /*15209*/function name_15209(subst) { return function name_15209(preds) { return /*15216*//*15217*/map/*<15217*//*15216*/(/*15218*//*15219*/pred$slapply/*<15219*//*15218*/(/*15220*/subst/*<15220*/)/*<15218*/)(/*15221*/preds/*<15221*/)/*<15216*/ } }/*<15209*/;

const type_$gtfn = /*16195*/function name_16195(type) { return /*16201*/(function match_16201($target) {
if ($target.type === "tapp") {
if ($target[0].type === "tapp") {
if ($target[0][0].type === "tcon") {
if ($target[0][0][0].type === "tycon") {
if ($target[0][0][0][0] === "(->)"){
{
let arg = $target[0][1];
{
let result = $target[1];
return /*16252*/(function match_16252($target) {
if ($target.type === ",") {
{
let args = $target[0];
{
let result = $target[1];
return /*16258*//*16259*/$co/*<16259*//*16258*/(/*16260*//*16260*/cons/*<16260*//*16260*/(/*16262*/arg/*<16262*/)(/*16263*/args/*<16263*/)/*<16260*/)(/*16267*/result/*<16267*/)/*<16258*/
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 16252');})(/*!*//*16223*//*16224*/type_$gtfn/*<16224*//*16223*/(/*16225*/result/*<16225*/)/*<16223*/)/*<16252*/
}
}
}
}
}
}
}
return /*16237*//*16268*/$co/*<16268*//*16237*/(/*16269*/nil/*<16269*/)(/*16270*/type/*<16270*/)/*<16237*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 16201');})(/*!*//*16203*/type/*<16203*/)/*<16201*/ }/*<16195*/;

const unwrap_tapp = /*16304*/function name_16304(target) { return function name_16304(args) { return /*16310*/(function match_16310($target) {
if ($target.type === "tapp") {
{
let a = $target[0];
{
let b = $target[1];
return /*16327*//*16328*/unwrap_tapp/*<16328*//*16327*/(/*16329*/a/*<16329*/)(/*16339*//*16339*/cons/*<16339*//*16339*/(/*16340*/b/*<16340*/)(/*16341*/args/*<16341*/)/*<16339*/)/*<16327*/
}
}
}
return /*16346*//*16347*/$co/*<16347*//*16346*/(/*16348*/target/*<16348*/)(/*16349*/args/*<16349*/)/*<16346*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 16310');})(/*!*//*16320*/target/*<16320*/)/*<16310*/ } }/*<16304*/;

const tfns = /*17076*/function name_17076(args) { return function name_17076(res) { return /*17083*//*17084*/foldr/*<17084*//*17083*/(/*17085*/res/*<17085*/)(/*17086*/args/*<17086*/)(/*17087*/function name_17087(res) { return function name_17087(arg) { return /*17092*//*17093*/tfn/*<17093*//*17092*/(/*17094*/arg/*<17094*/)(/*17096*/res/*<17096*/)/*<17092*/ } }/*<17087*/)/*<17083*/ } }/*<17076*/;

const tmap = /*17192*/function name_17192(k) { return function name_17192(v) { return /*17199*//*17200*/tapp/*<17200*//*17199*/(/*17201*//*17202*/tapp/*<17202*//*17201*/(/*17203*//*17204*/tcon/*<17204*//*17203*/(/*17205*//*17206*/tycon/*<17206*//*17205*/(/*17207*/"map"/*<17207*/)(/*17215*//*17216*/kfun/*<17216*//*17215*/(/*17217*/star/*<17217*/)(/*17219*//*17218*/kfun/*<17218*//*17219*/(/*17220*/star/*<17220*/)(/*17221*/star/*<17221*/)/*<17219*/)/*<17215*/)/*<17205*/)(/*17210*/-1/*<17210*/)/*<17203*/)(/*17211*/k/*<17211*/)(/*17212*/-1/*<17212*/)/*<17201*/)(/*17213*/v/*<17213*/)(/*17214*/-1/*<17214*/)/*<17199*/ } }/*<17192*/;

const mk_pred = /*17271*/function name_17271(g0) { return /*17248*/function name_17248(name) { return /*17252*//*17253*/isin/*<17253*//*17252*/(/*17254*/name/*<17254*/)(/*17255*/g0/*<17255*/)/*<17252*/ }/*<17248*/ }/*<17271*/;

const g0 = /*17060*//*17061*/tgen/*<17061*//*17060*/(/*17062*/0/*<17062*/)(/*17063*/-1/*<17063*/)/*<17060*/;

const g1 = /*17280*//*17281*/tgen/*<17281*//*17280*/(/*17282*/1/*<17282*/)(/*17283*/-1/*<17283*/)/*<17280*/;

const g2 = /*17406*//*17408*/tgen/*<17408*//*17406*/(/*17409*/2/*<17409*/)(/*17410*/-1/*<17410*/)/*<17406*/;

const toption = /*17772*/function name_17772(v) { return /*17778*//*17779*/tapp/*<17779*//*17778*/(/*17780*//*17781*/tcon/*<17781*//*17780*/(/*17782*//*17783*/tycon/*<17783*//*17782*/(/*17784*/"option"/*<17784*/)(/*17794*//*17795*/kfun/*<17795*//*17794*/(/*17796*/star/*<17796*/)(/*17797*/star/*<17797*/)/*<17794*/)/*<17782*/)(/*17787*/-1/*<17787*/)/*<17780*/)(/*17792*/v/*<17792*/)(/*17799*/-1/*<17799*/)/*<17778*/ }/*<17772*/;

const tresult = /*17825*/function name_17825(ok) { return function name_17825(err) { return /*17832*//*17833*/tapp/*<17833*//*17832*/(/*17834*//*17835*/tapp/*<17835*//*17834*/(/*17836*//*17837*/tcon/*<17837*//*17836*/(/*17838*//*17839*/tycon/*<17839*//*17838*/(/*17840*/"result"/*<17840*/)(/*17842*//*17843*/kfun/*<17843*//*17842*/(/*17844*/star/*<17844*/)(/*17845*//*17846*/kfun/*<17846*//*17845*/(/*17848*/star/*<17848*/)(/*17849*/star/*<17849*/)/*<17845*/)/*<17842*/)/*<17838*/)(/*17850*/-1/*<17850*/)/*<17836*/)(/*17854*/ok/*<17854*/)(/*17851*/-1/*<17851*/)/*<17834*/)(/*17853*/err/*<17853*/)(/*17852*/-1/*<17852*/)/*<17832*/ } }/*<17825*/;

const mkcon = /*17954*/function name_17954(v) { return /*17961*//*17962*/tcon/*<17962*//*17961*/(/*17963*//*17964*/tycon/*<17964*//*17963*/(/*17965*/v/*<17965*/)(/*17966*/star/*<17966*/)/*<17963*/)(/*17967*/-1/*<17967*/)/*<17961*/ }/*<17954*/;

const tratio = /*18468*//*18469*/tcon/*<18469*//*18468*/(/*18470*//*18471*/tycon/*<18471*//*18470*/(/*18472*/"ratio"/*<18472*/)(/*18474*//*18476*/kfun/*<18476*//*18474*/(/*18477*/star/*<18477*/)(/*18478*/star/*<18478*/)/*<18474*/)/*<18470*/)(/*18480*/-1/*<18480*/)/*<18468*/;

const trational = /*18485*//*18486*/tapp/*<18486*//*18485*/(/*18489*/tratio/*<18489*/)(/*18490*/tint/*<18490*/)(/*18491*/-1/*<18491*/)/*<18485*/;

const externals_type = /*23010*/function name_23010(bound) { return function name_23010(t) { return /*23016*/(function match_23016($target) {
if ($target.type === "tvar") {
return /*23023*/empty/*<23023*/
}
if ($target.type === "tcon") {
if ($target[0].type === "tycon") {
{
let name = $target[0][0];
{
let l = $target[1];
return /*23028*/(function match_23028($target) {
if ($target === true) {
return /*23034*/empty/*<23034*/
}
return /*23035*//*23036*/one/*<23036*//*23035*/(/*23037*//*23038*/$co$co/*<23038*//*23037*/(/*23039*/name/*<23039*/)(/*23040*//*23041*/type/*<23041*//*23040*//*<23040*/)(/*23042*/l/*<23042*/)/*<23037*/)/*<23035*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 23028');})(/*!*//*23030*//*23031*/set$slhas/*<23031*//*23030*/(/*23032*/bound/*<23032*/)(/*23033*/name/*<23033*/)/*<23030*/)/*<23028*/
}
}
}
}
if ($target.type === "tapp") {
{
let one = $target[0];
{
let two = $target[1];
return /*23048*//*23049*/bag$sland/*<23049*//*23048*/(/*23050*//*23051*/externals_type/*<23051*//*23050*/(/*23052*/bound/*<23052*/)(/*23053*/one/*<23053*/)/*<23050*/)(/*23054*//*23055*/externals_type/*<23055*//*23054*/(/*23056*/bound/*<23056*/)(/*23057*/two/*<23057*/)/*<23054*/)/*<23048*/
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 23016');})(/*!*//*23018*/t/*<23018*/)/*<23016*/ } }/*<23010*/;

const replace_tycons = /*23554*/function name_23554(free_map) { return function name_23554(types) { return function name_23554(type) { return /*23561*/(function match_23561($target) {
if ($target.type === "tcon") {
if ($target[0].type === "tycon") {
{
let name = $target[0][0];
{
let l = $target[1];
return /*23571*/(function match_23571($target) {
if ($target.type === "some") {
{
let v = $target[0];
return /*23581*/v/*<23581*/
}
}
return /*23583*/(function match_23583($target) {
if ($target.type === "some") {
if ($target[0].type === ",") {
{
let kinds = $target[0][0];
return /*24176*//*24177*/tcon/*<24177*//*24176*/(/*24178*//*24179*/tycon/*<24179*//*24178*/(/*24180*/name/*<24180*/)(/*24181*//*24182*/make_kind/*<24182*//*24181*/(/*24183*/kinds/*<24183*/)/*<24181*/)/*<24178*/)(/*24184*/l/*<24184*/)/*<24176*/
}
}
}
return /*24186*//*24188*/fatal/*<24188*//*24186*/(/*24189*/`Unknonwn type constructor ${/*24191*/name/*<24191*/}`/*<24189*/)/*<24186*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 23583');})(/*!*//*24166*//*24167*/map$slget/*<24167*//*24166*/(/*24168*/types/*<24168*/)(/*24169*/name/*<24169*/)/*<24166*/)/*<23583*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 23571');})(/*!*//*23573*//*23574*/map$slget/*<23574*//*23573*/(/*23576*/free_map/*<23576*/)(/*23577*/name/*<23577*/)/*<23573*/)/*<23571*/
}
}
}
}
if ($target.type === "tapp") {
{
let a = $target[0];
{
let b = $target[1];
{
let l = $target[2];
return /*23589*//*23590*/tapp/*<23590*//*23589*/(/*23591*//*23593*/replace_tycons/*<23593*//*23591*/(/*23594*/free_map/*<23594*/)(/*24163*/types/*<24163*/)(/*23596*/a/*<23596*/)/*<23591*/)(/*23597*//*23598*/replace_tycons/*<23598*//*23597*/(/*23599*/free_map/*<23599*/)(/*24164*/types/*<24164*/)(/*23600*/b/*<23600*/)/*<23597*/)(/*23601*/l/*<23601*/)/*<23589*/
}
}
}
}
return /*23606*/type/*<23606*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 23561');})(/*!*//*23563*/type/*<23563*/)/*<23561*/ } } }/*<23554*/;

const merge = /*604*/function name_604(s1) { return function name_604(s2) { return function name_604(l) { return /*611*/(function let_611() {const $target = /*615*//*616*/all/*<616*//*615*/(/*617*/function name_617(v) { return /*621*//*622*/$eq/*<622*//*621*/(/*623*//*624*/type$slapply/*<624*//*623*/(/*625*/s1/*<625*/)(/*626*//*627*/tvar/*<627*//*626*/(/*628*/v/*<628*/)(/*688*/l/*<688*/)/*<626*/)/*<623*/)(/*629*//*630*/type$slapply/*<630*//*629*/(/*631*/s2/*<631*/)(/*632*//*633*/tvar/*<633*//*632*/(/*634*/v/*<634*/)(/*690*/l/*<690*/)/*<632*/)/*<629*/)/*<621*/ }/*<617*/)(/*635*//*637*/set$slintersect/*<637*//*635*/(/*644*//*645*/set$slfrom_list/*<645*//*644*/(/*638*//*639*/map$slkeys/*<639*//*638*/(/*640*/s1/*<640*/)/*<638*/)/*<644*/)(/*646*//*647*/set$slfrom_list/*<647*//*646*/(/*641*//*642*/map$slkeys/*<642*//*641*/(/*643*/s2/*<643*/)/*<641*/)/*<646*/)/*<635*/)/*<615*/;
{
let agree = $target;
return /*648*/(function match_648($target) {
if ($target === true) {
return /*651*//*653*/map$slmerge/*<653*//*651*/(/*654*/s1/*<654*/)(/*655*/s2/*<655*/)/*<651*/
}
return /*656*//*657*/fatal/*<657*//*656*/(/*658*/"merge failed"/*<658*/)/*<656*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 648');})(/*!*//*650*/agree/*<650*/)/*<648*/
};
throw new Error('let pattern not matched 614. ' + valueToString($target));})(/*!*/)/*<611*/ } } }/*<604*/;

const $eq$gt = (v0) => (v1) => ({type: "=>", 0: v0, 1: v1});
const pred$eq = /*6456*/function name_6456({0: id, 1: type}) {
 return function name_6456({0: id$qu, 1: type$qu}) {
 return /*6471*/(function match_6471($target) {
if ($target === true) {
return /*6477*//*6478*/type$eq/*<6478*//*6477*/(/*6479*/type/*<6479*/)(/*6480*/type$qu/*<6480*/)/*<6477*/
}
return /*6481*/false/*<6481*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 6471');})(/*!*//*6473*//*6474*/$eq/*<6474*//*6473*/(/*6475*/id/*<6475*/)(/*6476*/id$qu/*<6476*/)/*<6473*/)/*<6471*/ } }/*<6456*/;

const qual$slapply = /*6589*/function name_6589(subst) { return function name_6589({0: preds, 1: t}) {
 return function name_6589(t$slapply) { return /*6602*//*6603*/$eq$gt/*<6603*//*6602*/(/*6604*//*6605*/map/*<6605*//*6604*/(/*6666*//*6667*/pred$slapply/*<6667*//*6666*/(/*6668*/subst/*<6668*/)/*<6666*/)(/*6692*/preds/*<6692*/)/*<6604*/)(/*6669*//*6670*/t$slapply/*<6670*//*6669*/(/*6671*/subst/*<6671*/)(/*6672*/t/*<6672*/)/*<6669*/)/*<6602*/ } } }/*<6589*/;

const qual$sltv = /*6704*/function name_6704({0: preds, 1: t}) {
 return function name_6704(t$sltv) { return /*6716*//*6727*/foldl/*<6727*//*6716*/(/*6728*//*6729*/t$sltv/*<6729*//*6728*/(/*6730*/t/*<6730*/)/*<6728*/)(/*6769*/preds/*<6769*/)(/*6731*/function name_6731(tv) { return function name_6731(pred) { return /*6736*//*6737*/set$slmerge/*<6737*//*6736*/(/*6738*/tv/*<6738*/)(/*6739*//*6740*/pred$sltv/*<6740*//*6739*/(/*6741*/pred/*<6741*/)/*<6739*/)/*<6736*/ } }/*<6731*/)/*<6716*/ } }/*<6704*/;

/* type alias class */
/* type alias inst */
const class$slord = /*6842*//*6843*/$co/*<6843*//*6842*/(/*6844*//*6844*/cons/*<6844*//*6844*/(/*6845*/"eq"/*<6845*/)(/*6844*/nil/*<6844*/)/*<6844*/)(/*6847*//*6847*/cons/*<6847*//*6847*/(/*6848*//*6849*/$eq$gt/*<6849*//*6848*/(/*6850*/nil/*<6850*/)(/*6851*//*6852*/isin/*<6852*//*6851*/(/*6853*/"ord"/*<6853*/)(/*6855*/tunit/*<6855*/)/*<6851*/)/*<6848*/)(/*6847*//*6847*/cons/*<6847*//*6847*/(/*6856*//*6857*/$eq$gt/*<6857*//*6856*/(/*6858*/nil/*<6858*/)(/*6859*//*6860*/isin/*<6860*//*6859*/(/*6861*/"ord"/*<6861*/)(/*6863*/tchar/*<6863*/)/*<6859*/)/*<6856*/)(/*6847*//*6847*/cons/*<6847*//*6847*/(/*6864*//*6865*/$eq$gt/*<6865*//*6864*/(/*6866*/nil/*<6866*/)(/*6870*//*6871*/isin/*<6871*//*6870*/(/*6867*/"ord"/*<6867*/)(/*6869*/tint/*<6869*/)/*<6870*/)/*<6864*/)(/*6847*//*6847*/cons/*<6847*//*6847*/(/*6872*//*6873*/$eq$gt/*<6873*//*6872*/(/*6874*//*6874*/cons/*<6874*//*6874*/(/*6875*//*6876*/isin/*<6876*//*6875*/(/*6877*/"ord"/*<6877*/)(/*6879*//*6880*/tvar/*<6880*//*6879*/(/*6881*//*6882*/tyvar/*<6882*//*6881*/(/*6883*/"a"/*<6883*/)(/*6885*/star/*<6885*/)/*<6881*/)(/*6886*/-1/*<6886*/)/*<6879*/)/*<6875*/)(/*6874*//*6874*/cons/*<6874*//*6874*/(/*6915*//*6917*/isin/*<6917*//*6915*/(/*6918*/"ord"/*<6918*/)(/*6920*//*6921*/tvar/*<6921*//*6920*/(/*6922*//*6923*/tyvar/*<6923*//*6922*/(/*6924*/"b"/*<6924*/)(/*6926*/star/*<6926*/)/*<6922*/)(/*6927*/-1/*<6927*/)/*<6920*/)/*<6915*/)(/*6874*/nil/*<6874*/)/*<6874*/)/*<6874*/)(/*6887*//*6889*/isin/*<6889*//*6887*/(/*6890*/"ord"/*<6890*/)(/*6892*//*6893*/mkpair/*<6893*//*6892*/(/*6907*//*6895*/tvar/*<6895*//*6907*/(/*6896*//*6897*/tyvar/*<6897*//*6896*/(/*6898*/"a"/*<6898*/)(/*6900*/star/*<6900*/)/*<6896*/)(/*6911*/-1/*<6911*/)/*<6907*/)(/*6908*//*6909*/tvar/*<6909*//*6908*/(/*6901*//*6902*/tyvar/*<6902*//*6901*/(/*6903*/"b"/*<6903*/)(/*6905*/star/*<6905*/)/*<6901*/)(/*6912*/-1/*<6912*/)/*<6908*/)/*<6892*/)/*<6887*/)/*<6872*/)(/*6847*/nil/*<6847*/)/*<6847*/)/*<6847*/)/*<6847*/)/*<6847*/)/*<6842*/;

const class_env = (v0) => (v1) => ({type: "class-env", 0: v0, 1: v1});
const supers = /*6952*/function name_6952({0: classes}) { return function name_6952(id) { return /*6962*/(function match_6962($target) {
if ($target.type === "some") {
if ($target[0].type === ",") {
{
let is = $target[0][0];
{
let its = $target[0][1];
return /*6975*/is/*<6975*/
}
}
}
}
return /*6977*//*6978*/fatal/*<6978*//*6977*/(/*6979*/`Unknown class ${/*6981*/id/*<6981*/}`/*<6979*/)/*<6977*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 6962');})(/*!*//*6964*//*6965*/map$slget/*<6965*//*6964*/(/*7350*/classes/*<7350*/)(/*6966*/id/*<6966*/)/*<6964*/)/*<6962*/ } }/*<6952*/;

const insts = /*6983*/function name_6983({0: classes}) { return function name_6983(id) { return /*6993*/(function match_6993($target) {
if ($target.type === "some") {
if ($target[0].type === ",") {
{
let is = $target[0][0];
{
let its = $target[0][1];
return /*7005*/its/*<7005*/
}
}
}
}
return /*7007*//*7008*/fatal/*<7008*//*7007*/(/*7009*/`Unknown class ${/*7011*/id/*<7011*/}`/*<7009*/)/*<7007*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 6993');})(/*!*//*6995*//*6996*/map$slget/*<6996*//*6995*/(/*7351*/classes/*<7351*/)(/*6997*/id/*<6997*/)/*<6995*/)/*<6993*/ } }/*<6983*/;

const modify = /*7029*/function name_7029({0: classes, 1: defaults}) {
 return function name_7029(i) { return function name_7029(c) { return /*7040*//*7041*/class_env/*<7041*//*7040*/(/*7352*//*7353*/map$slset/*<7353*//*7352*/(/*7354*/classes/*<7354*/)(/*7355*/i/*<7355*/)(/*7356*/c/*<7356*/)/*<7352*/)(/*7058*/defaults/*<7058*/)/*<7040*/ } } }/*<7029*/;

const initial_env = /*7063*//*7064*/class_env/*<7064*//*7063*/(/*7065*/map$slnil/*<7065*/)(/*7075*//*7075*/cons/*<7075*//*7075*/(/*7077*/tinteger/*<7077*/)(/*7075*//*7075*/cons/*<7075*//*7075*/(/*7078*/tdouble/*<7078*/)(/*7075*//*7075*/cons/*<7075*//*7075*/(/*16670*/tfloat/*<16670*/)(/*7075*//*7075*/cons/*<7075*//*7075*/(/*16671*/tunit/*<16671*/)(/*7075*/nil/*<7075*/)/*<7075*/)/*<7075*/)/*<7075*/)/*<7075*/)/*<7063*/;

const add_class = /*7106*/function name_7106({0: classes, 1: defaults}) {
 return function name_7106({0: name, 1: supers}) {
 return /*7119*/(function match_7119($target) {
if ($target.type === "some") {
return /*7127*//*7128*/fatal/*<7128*//*7127*/(/*7129*/`class ${/*7131*/name/*<7131*/} already defined`/*<7129*/)/*<7127*/
}
return /*7135*/(function match_7135($target) {
if ($target.type === "some") {
{
let super_ = $target[0];
return /*7162*//*7163*/fatal/*<7163*//*7162*/(/*7164*/`Superclass not defined ${/*7166*/super_/*<7166*/}`/*<7164*/)/*<7162*/
}
}
return /*7171*//*7172*/class_env/*<7172*//*7171*/(/*7397*//*7173*/map$slset/*<7173*//*7397*/(/*7398*/classes/*<7398*/)(/*7399*/name/*<7399*/)(/*7400*//*7401*/$co/*<7401*//*7400*/(/*7402*/supers/*<7402*/)(/*7403*/nil/*<7403*/)/*<7400*/)/*<7397*/)(/*7174*/defaults/*<7174*/)/*<7171*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 7135');})(/*!*//*7141*//*7142*/find/*<7142*//*7141*/(/*7144*/supers/*<7144*/)(/*7145*/function name_7145(name) { return /*7149*//*7359*/not/*<7359*//*7149*/(/*7360*//*7361*/map$slhas/*<7361*//*7360*/(/*7362*/classes/*<7362*/)(/*7363*/name/*<7363*/)/*<7360*/)/*<7149*/ }/*<7145*/)/*<7141*/)/*<7135*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 7119');})(/*!*//*7121*//*7122*/map$slget/*<7122*//*7121*/(/*7357*/classes/*<7357*/)(/*7123*/name/*<7123*/)/*<7121*/)/*<7119*/ } }/*<7106*/;

const core_classes = /*7219*/function name_7219(env) { return /*7404*//*7405*/foldl/*<7405*//*7404*/(/*7425*/env/*<7425*/)(/*7223*//*7223*/cons/*<7223*//*7223*/(/*7225*//*7227*/$co/*<7227*//*7225*/(/*7228*/"eq"/*<7228*/)(/*7230*/nil/*<7230*/)/*<7225*/)(/*7223*//*7223*/cons/*<7223*//*7223*/(/*19875*//*19876*/$co/*<19876*//*19875*/(/*19877*/"ix"/*<19877*/)(/*19879*/nil/*<19879*/)/*<19875*/)(/*7223*//*7223*/cons/*<7223*//*7223*/(/*7231*//*7232*/$co/*<7232*//*7231*/(/*7233*/"ord"/*<7233*/)(/*7235*//*7235*/cons/*<7235*//*7235*/(/*7236*/"eq"/*<7236*/)(/*7235*/nil/*<7235*/)/*<7235*/)/*<7231*/)(/*7223*//*7223*/cons/*<7223*//*7223*/(/*7238*//*7239*/$co/*<7239*//*7238*/(/*7240*/"show"/*<7240*/)(/*7242*/nil/*<7242*/)/*<7238*/)(/*7223*//*7223*/cons/*<7223*//*7223*/(/*7243*//*7244*/$co/*<7244*//*7243*/(/*7245*/"read"/*<7245*/)(/*7247*/nil/*<7247*/)/*<7243*/)(/*7223*//*7223*/cons/*<7223*//*7223*/(/*20273*//*20274*/$co/*<20274*//*20273*/(/*20275*/"pretty"/*<20275*/)(/*20277*/nil/*<20277*/)/*<20273*/)(/*7223*//*7223*/cons/*<7223*//*7223*/(/*7248*//*7249*/$co/*<7249*//*7248*/(/*7250*/"bounded"/*<7250*/)(/*7252*/nil/*<7252*/)/*<7248*/)(/*7223*//*7223*/cons/*<7223*//*7223*/(/*7253*//*7254*/$co/*<7254*//*7253*/(/*7255*/"enum"/*<7255*/)(/*7257*/nil/*<7257*/)/*<7253*/)(/*7223*//*7223*/cons/*<7223*//*7223*/(/*7258*//*7259*/$co/*<7259*//*7258*/(/*7260*/"functor"/*<7260*/)(/*7262*/nil/*<7262*/)/*<7258*/)(/*7223*//*7223*/cons/*<7223*//*7223*/(/*7263*//*7264*/$co/*<7264*//*7263*/(/*7265*/"monad"/*<7265*/)(/*7267*/nil/*<7267*/)/*<7263*/)(/*7223*/nil/*<7223*/)/*<7223*/)/*<7223*/)/*<7223*/)/*<7223*/)/*<7223*/)/*<7223*/)/*<7223*/)/*<7223*/)/*<7223*/)/*<7223*/)(/*7433*/add_class/*<7433*/)/*<7404*/ }/*<7219*/;

const num_classes = /*7268*/function name_7268(env) { return /*7406*//*7407*/foldl/*<7407*//*7406*/(/*7436*/env/*<7436*/)(/*7272*//*7272*/cons/*<7272*//*7272*/(/*7273*//*7274*/$co/*<7274*//*7273*/(/*7275*/"num"/*<7275*/)(/*7277*//*7277*/cons/*<7277*//*7277*/(/*7278*/"eq"/*<7278*/)(/*7277*//*7277*/cons/*<7277*//*7277*/(/*7280*/"show"/*<7280*/)(/*7277*/nil/*<7277*/)/*<7277*/)/*<7277*/)/*<7273*/)(/*7272*//*7272*/cons/*<7272*//*7272*/(/*7284*//*7285*/$co/*<7285*//*7284*/(/*7286*/"real"/*<7286*/)(/*7288*//*7288*/cons/*<7288*//*7288*/(/*7289*/"num"/*<7289*/)(/*7288*//*7288*/cons/*<7288*//*7288*/(/*7291*/"ord"/*<7291*/)(/*7288*/nil/*<7288*/)/*<7288*/)/*<7288*/)/*<7284*/)(/*7272*//*7272*/cons/*<7272*//*7272*/(/*7293*//*7294*/$co/*<7294*//*7293*/(/*7295*/"fractional"/*<7295*/)(/*7297*//*7297*/cons/*<7297*//*7297*/(/*7298*/"num"/*<7298*/)(/*7297*/nil/*<7297*/)/*<7297*/)/*<7293*/)(/*7272*//*7272*/cons/*<7272*//*7272*/(/*7300*//*7301*/$co/*<7301*//*7300*/(/*7302*/"integral"/*<7302*/)(/*7304*//*7304*/cons/*<7304*//*7304*/(/*7305*/"real"/*<7305*/)(/*7304*//*7304*/cons/*<7304*//*7304*/(/*7307*/"enum"/*<7307*/)(/*7304*/nil/*<7304*/)/*<7304*/)/*<7304*/)/*<7300*/)(/*7272*//*7272*/cons/*<7272*//*7272*/(/*7309*//*7310*/$co/*<7310*//*7309*/(/*7311*/"realfrac"/*<7311*/)(/*7313*//*7313*/cons/*<7313*//*7313*/(/*7314*/"real"/*<7314*/)(/*7313*//*7313*/cons/*<7313*//*7313*/(/*7316*/"fractional"/*<7316*/)(/*7313*/nil/*<7313*/)/*<7313*/)/*<7313*/)/*<7309*/)(/*7272*//*7272*/cons/*<7272*//*7272*/(/*7318*//*7319*/$co/*<7319*//*7318*/(/*7320*/"floating"/*<7320*/)(/*7322*//*7322*/cons/*<7322*//*7322*/(/*7323*/"fractional"/*<7323*/)(/*7322*/nil/*<7322*/)/*<7322*/)/*<7318*/)(/*7272*//*7272*/cons/*<7272*//*7272*/(/*7325*//*7326*/$co/*<7326*//*7325*/(/*7327*/"realfloat"/*<7327*/)(/*7329*//*7329*/cons/*<7329*//*7329*/(/*7330*/"realfrac"/*<7330*/)(/*7329*//*7329*/cons/*<7329*//*7329*/(/*7332*/"floating"/*<7332*/)(/*7329*/nil/*<7329*/)/*<7329*/)/*<7329*/)/*<7325*/)(/*7272*/nil/*<7272*/)/*<7272*/)/*<7272*/)/*<7272*/)/*<7272*/)/*<7272*/)/*<7272*/)/*<7272*/)(/*7437*/add_class/*<7437*/)/*<7406*/ }/*<7268*/;

const by_super = /*7799*/function name_7799(ce) { return function name_7799(pred) { return /*7806*/(function let_7806() {const $target = /*7813*/pred/*<7813*/;
if ($target.type === "isin") {
{
let i = $target[0];
{
let t = $target[1];
return (function let_7806() {const $target = /*7899*/ce/*<7899*/;
if ($target.type === "class-env") {
{
let supers = $target[0];
return (function let_7806() {const $target = /*7906*/(function match_7906($target) {
if ($target.type === "some") {
{
let s = $target[0];
return /*7916*/s/*<7916*/
}
}
return /*7918*//*7919*/fatal/*<7919*//*7918*/(/*7920*/`Unknown name ${/*7922*/i/*<7922*/}`/*<7920*/)/*<7918*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 7906');})(/*!*//*7909*//*7910*/map$slget/*<7910*//*7909*/(/*7911*/supers/*<7911*/)(/*7912*/i/*<7912*/)/*<7909*/)/*<7906*/;
if ($target.type === ",") {
{
let got = $target[0];
return /*7814*//*7814*/cons/*<7814*//*7814*/(/*7815*/pred/*<7815*/)(/*7816*//*7820*/concat/*<7820*//*7816*/(/*7821*//*7822*/map/*<7822*//*7821*/(/*7900*/function name_7900(i$qu) { return /*7831*//*7832*/by_super/*<7832*//*7831*/(/*7833*/ce/*<7833*/)(/*7834*//*7835*/isin/*<7835*//*7834*/(/*7836*/i$qu/*<7836*/)(/*7837*/t/*<7837*/)/*<7834*/)/*<7831*/ }/*<7900*/)(/*7901*/got/*<7901*/)/*<7821*/)/*<7816*/)/*<7814*/
}
};
throw new Error('let pattern not matched 7924. ' + valueToString($target));})(/*!*/)
}
};
throw new Error('let pattern not matched 7895. ' + valueToString($target));})(/*!*/)
}
}
};
throw new Error('let pattern not matched 7809. ' + valueToString($target));})(/*!*/)/*<7806*/ } }/*<7799*/;

const sc_entail = /*8530*/function name_8530(ce) { return function name_8530(ps) { return function name_8530(p) { return /*8538*//*8539*/any/*<8539*//*8538*/(/*8551*//*8541*/any/*<8541*//*8551*/(/*8542*//*8543*/pred$eq/*<8543*//*8542*/(/*8544*/p/*<8544*/)/*<8542*/)/*<8551*/)(/*8545*//*8546*/map/*<8546*//*8545*/(/*8547*//*8548*/by_super/*<8548*//*8547*/(/*8549*/ce/*<8549*/)/*<8547*/)(/*8550*/ps/*<8550*/)/*<8545*/)/*<8538*/ } } }/*<8530*/;

const forall = (v0) => (v1) => ({type: "forall", 0: v0, 1: v1});
const scheme$slapply = /*8593*/function name_8593(subst) { return function name_8593({0: ks, 1: qt}) {
 return /*8604*//*8605*/forall/*<8605*//*8604*/(/*8606*/ks/*<8606*/)(/*8607*//*8609*/qual$slapply/*<8609*//*8607*/(/*8612*/subst/*<8612*/)(/*8610*/qt/*<8610*/)(/*8611*/type$slapply/*<8611*/)/*<8607*/)/*<8604*/ } }/*<8593*/;

const scheme$sltv = /*8613*/function name_8613({0: ks, 1: qt}) {
 return /*8624*//*8625*/qual$sltv/*<8625*//*8624*/(/*8626*/qt/*<8626*/)(/*8629*/type$sltv/*<8629*/)/*<8624*/ }/*<8613*/;

const quantify = /*8627*/function name_8627(vs) { return function name_8627(qt) { return /*8635*/(function let_8635() {const $target = /*8639*//*8640*/filter/*<8640*//*8639*/(/*8657*/function name_8657(v) { return /*8641*//*8645*/any/*<8645*//*8641*/(/*8646*//*8647*/tyvar$eq/*<8647*//*8646*/(/*8648*/v/*<8648*/)/*<8646*/)(/*8661*/vs/*<8661*/)/*<8641*/ }/*<8657*/)(/*8655*//*8656*/set$slto_list/*<8656*//*8655*/(/*8649*//*8651*/qual$sltv/*<8651*//*8649*/(/*8652*/qt/*<8652*/)(/*8653*/type$sltv/*<8653*/)/*<8649*/)/*<8655*/)/*<8639*/;
{
let vs$qu = $target;
return (function let_8635() {const $target = /*8670*//*8671*/map/*<8671*//*8670*/(/*8672*/tyvar$slkind/*<8672*/)(/*8673*/vs$qu/*<8673*/)/*<8670*/;
{
let ks = $target;
return (function let_8635() {const $target = /*8733*//*8734*/map$slfrom_list/*<8734*//*8733*/(/*8675*//*8684*/mapi/*<8684*//*8675*/(/*8686*/function name_8686(v) { return function name_8686(i) { return /*8691*//*8692*/$co/*<8692*//*8691*/(/*8693*/v/*<8693*/)(/*8694*//*8695*/tgen/*<8695*//*8694*/(/*8696*/i/*<8696*/)(/*8697*/-1/*<8697*/)/*<8694*/)/*<8691*/ } }/*<8686*/)(/*8732*/0/*<8732*/)(/*8685*/vs$qu/*<8685*/)/*<8675*/)/*<8733*/;
{
let subst = $target;
return /*8642*//*8662*/forall/*<8662*//*8642*/(/*8663*/ks/*<8663*/)(/*8664*//*8665*/qual$slapply/*<8665*//*8664*/(/*8666*/subst/*<8666*/)(/*8667*/qt/*<8667*/)(/*8668*/type$slapply/*<8668*/)/*<8664*/)/*<8642*/
};
throw new Error('let pattern not matched 8674. ' + valueToString($target));})(/*!*/)
};
throw new Error('let pattern not matched 8669. ' + valueToString($target));})(/*!*/)
};
throw new Error('let pattern not matched 8638. ' + valueToString($target));})(/*!*/)/*<8635*/ } }/*<8627*/;

const to_scheme = /*8643*/function name_8643(t) { return /*8740*//*8741*/forall/*<8741*//*8740*/(/*8742*/nil/*<8742*/)(/*8743*//*8744*/$eq$gt/*<8744*//*8743*/(/*8745*/nil/*<8745*/)(/*8746*/t/*<8746*/)/*<8743*/)/*<8740*/ }/*<8643*/;

const $ex$gt$ex = (v0) => (v1) => ({type: "!>!", 0: v0, 1: v1});
const assump$slapply = /*8757*/function name_8757(subst) { return function name_8757({0: id, 1: sc}) {
 return /*8767*//*8768*/$ex$gt$ex/*<8768*//*8767*/(/*8769*/id/*<8769*/)(/*8770*//*8772*/scheme$slapply/*<8772*//*8770*/(/*8775*/subst/*<8775*/)(/*8776*/sc/*<8776*/)/*<8770*/)/*<8767*/ } }/*<8757*/;

const assump$sltv = /*8777*/function name_8777({0: id, 1: sc}) {
 return /*8786*//*8787*/scheme$sltv/*<8787*//*8786*/(/*8788*/sc/*<8788*/)/*<8786*/ }/*<8777*/;

const find_scheme = /*8789*/function name_8789(id) { return function name_8789(assumps) { return /*8796*/(function match_8796($target) {
if ($target.type === "nil") {
return /*8800*//*8801*/err/*<8801*//*8800*/(/*8802*/`Unbound identifier ${/*8804*/id/*<8804*/}`/*<8802*/)/*<8800*/
}
if ($target.type === "cons") {
if ($target[0].type === "!>!") {
{
let id$qu = $target[0][0];
{
let sc = $target[0][1];
{
let rest = $target[1];
return /*8815*/(function match_8815($target) {
if ($target === true) {
return /*8821*//*8822*/ok/*<8822*//*8821*/(/*8823*/sc/*<8823*/)/*<8821*/
}
return /*8824*//*8826*/find_scheme/*<8826*//*8824*/(/*8827*/id/*<8827*/)(/*8828*/rest/*<8828*/)/*<8824*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 8815');})(/*!*//*8817*//*8818*/$eq/*<8818*//*8817*/(/*8819*/id/*<8819*/)(/*8820*/id$qu/*<8820*/)/*<8817*/)/*<8815*/
}
}
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 8796');})(/*!*//*8798*/assumps/*<8798*/)/*<8796*/ } }/*<8789*/;

const type_$gts$qu = /*8982*/function name_8982(show_kind) { return function name_8982(type) { return /*8990*/(function match_8990($target) {
if ($target.type === "tvar") {
if ($target[0].type === "tyvar") {
{
let name = $target[0][0];
{
let kind = $target[0][1];
return /*9065*/`(var ${/*9071*/name/*<9071*/} ${/*9073*//*9075*/kind_$gts/*<9075*//*9073*/(/*9076*/kind/*<9076*/)/*<9073*/})`/*<9065*/
}
}
}
}
if ($target.type === "tapp") {
{
let target = $target[0];
{
let arg = $target[1];
return /*16271*/(function match_16271($target) {
if ($target.type === ",") {
if ($target[0].type === "nil") {
return /*16383*/(function let_16383() {const $target = /*16390*//*16391*/unwrap_tapp/*<16391*//*16390*/(/*16392*/target/*<16392*/)(/*16393*//*16393*/cons/*<16393*//*16393*/(/*16394*/arg/*<16394*/)(/*16393*/nil/*<16393*/)/*<16393*/)/*<16390*/;
if ($target.type === ",") {
{
let target = $target[0];
{
let args = $target[1];
return /*16395*/`(${/*16397*//*16398*/type_$gts$qu/*<16398*//*16397*/(/*24092*/show_kind/*<24092*/)(/*16399*/target/*<16399*/)/*<16397*/} ${/*16401*//*16402*/join/*<16402*//*16401*/(/*16403*/" "/*<16403*/)(/*16405*//*16406*/map/*<16406*//*16405*/(/*24096*//*16407*/type_$gts$qu/*<16407*//*24096*/(/*24095*/show_kind/*<24095*/)/*<24096*/)(/*16408*/args/*<16408*/)/*<16405*/)/*<16401*/})`/*<16395*/
}
}
};
throw new Error('let pattern not matched 16386. ' + valueToString($target));})(/*!*/)/*<16383*/
}
}
if ($target.type === ",") {
{
let args = $target[0];
{
let result = $target[1];
return /*16281*/`(fn [${/*16287*//*16289*/join/*<16289*//*16287*/(/*16290*/" "/*<16290*/)(/*16292*//*16293*/map/*<16293*//*16292*/(/*24097*//*16295*/type_$gts$qu/*<16295*//*24097*/(/*24093*/show_kind/*<24093*/)/*<24097*/)(/*16296*/args/*<16296*/)/*<16292*/)/*<16287*/}] ${/*16283*//*16285*/type_$gts$qu/*<16285*//*16283*/(/*24094*/show_kind/*<24094*/)(/*16286*/result/*<16286*/)/*<16283*/})`/*<16281*/
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 16271');})(/*!*//*16273*//*16274*/type_$gtfn/*<16274*//*16273*/(/*16275*/type/*<16275*/)/*<16273*/)/*<16271*/
}
}
}
if ($target.type === "tcon") {
if ($target[0].type === "tycon") {
if ($target[0][0] === "(,)"){
return /*16432*/","/*<16432*/
}
}
}
if ($target.type === "tcon") {
if ($target[0].type === "tycon") {
if ($target[0][0] === "[]"){
return /*16449*/"list"/*<16449*/
}
}
}
if ($target.type === "tcon") {
if ($target[0].type === "tycon") {
{
let name = $target[0][0];
{
let k = $target[0][1];
return /*24105*/(function match_24105($target) {
if ($target === true) {
return /*24108*/`${/*24110*/name/*<24110*/} [${/*24112*//*24114*/kind_$gts/*<24114*//*24112*/(/*24115*/k/*<24115*/)/*<24112*/}]`/*<24108*/
}
return /*24107*/name/*<24107*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 24105');})(/*!*//*24106*/show_kind/*<24106*/)/*<24105*/
}
}
}
}
if ($target.type === "tcon") {
{
let con = $target[0];
return /*9096*//*9097*/tycon_$gts/*<9097*//*9096*/(/*9098*/con/*<9098*/)/*<9096*/
}
}
if ($target.type === "tgen") {
{
let num = $target[0];
return /*20104*//*20103*/gen_name/*<20103*//*20104*/(/*20105*/num/*<20105*/)/*<20104*/
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 8990');})(/*!*//*8992*/type/*<8992*/)/*<8990*/ } }/*<8982*/;

const inst$slpreds = /*9504*/function name_9504(types) { return function name_9504(preds) { return /*9510*//*9511*/map/*<9511*//*9510*/(/*9512*//*9513*/inst$slpred/*<9513*//*9512*/(/*9514*/types/*<9514*/)/*<9512*/)(/*9515*/preds/*<9515*/)/*<9510*/ } }/*<9504*/;

const type_env = (v0) => (v1) => (v2) => ({type: "type-env", 0: v0, 1: v1, 2: v2});
const tenv$slconstr = /*9935*/function name_9935({0: constrs}) { return function name_9935(name) { return /*9945*//*9946*/map$slget/*<9946*//*9945*/(/*9947*/constrs/*<9947*/)(/*9948*/name/*<9948*/)/*<9945*/ } }/*<9935*/;

const tenv$slvalue = /*10288*/function name_10288({1: values}) { return function name_10288(name) { return /*10303*//*10304*/map$slget/*<10304*//*10303*/(/*10305*/values/*<10305*/)(/*10306*/name/*<10306*/)/*<10303*/ } }/*<10288*/;

const ambiguities = /*14265*/function name_14265(ce) { return function name_14265(known_variables) { return function name_14265(preds) { return /*14273*//*14274*/map/*<14274*//*14273*/(/*14275*/function name_14275(v) { return /*14287*//*14288*/$co/*<14288*//*14287*/(/*14289*/v/*<14289*/)(/*14290*//*14291*/filter/*<14291*//*14290*/(/*14296*/function name_14296(pred) { return /*14292*//*14293*/contains/*<14293*//*14292*/(/*14304*//*14305*/set$slto_list/*<14305*//*14304*/(/*14300*//*14301*/pred$sltv/*<14301*//*14300*/(/*14302*/pred/*<14302*/)/*<14300*/)/*<14304*/)(/*14294*/v/*<14294*/)(/*14303*/tyvar$eq/*<14303*/)/*<14292*/ }/*<14296*/)(/*14295*/preds/*<14295*/)/*<14290*/)/*<14287*/ }/*<14275*/)(/*14278*//*14279*/without/*<14279*//*14278*/(/*14355*//*14356*/set$slto_list/*<14356*//*14355*/(/*14282*//*14280*/preds$sltv/*<14280*//*14282*/(/*14283*/preds/*<14283*/)/*<14282*/)/*<14355*/)(/*14281*/known_variables/*<14281*/)(/*14332*/tyvar$eq/*<14332*/)/*<14278*/)/*<14273*/ } } }/*<14265*/;

const toScheme = /*15037*/function name_15037(t) { return /*15043*//*15044*/forall/*<15044*//*15043*/(/*15045*/nil/*<15045*/)(/*15046*//*15047*/$eq$gt/*<15047*//*15046*/(/*15048*/nil/*<15048*/)(/*15049*/t/*<15049*/)/*<15046*/)/*<15043*/ }/*<15037*/;

const tenv$slnil = /*15905*//*15906*/type_env/*<15906*//*15905*/(/*15907*/map$slnil/*<15907*/)(/*15908*/map$slnil/*<15908*/)(/*22217*/map$slnil/*<22217*/)/*<15905*/;

const class_env$slnil = /*15913*//*15914*/class_env/*<15914*//*15913*/(/*15915*/map$slnil/*<15915*/)(/*15916*/nil/*<15916*/)/*<15913*/;

const class_env$slstd = /*15948*//*15949*/class_env/*<15949*//*15948*//*<15948*/;

const generics = /*17653*/function name_17653(classes) { return function name_17653(body) { return /*17664*//*17665*/$co/*<17665*//*17664*/(/*17666*//*17667*/map/*<17667*//*17666*/(/*17668*/function name_17668(_) { return /*17672*/star/*<17672*/ }/*<17668*/)(/*17673*/classes/*<17673*/)/*<17666*/)(/*17674*//*17675*/$eq$gt/*<17675*//*17674*/(/*17676*//*17677*/concat/*<17677*//*17676*/(/*17678*//*17679*/mapi/*<17679*//*17678*/(/*17680*/function name_17680(cls) { return function name_17680(i) { return /*17685*//*17686*/map/*<17686*//*17685*/(/*17687*//*17688*/mk_pred/*<17688*//*17687*/(/*17689*//*17690*/tgen/*<17690*//*17689*/(/*17691*/i/*<17691*/)(/*17692*/-1/*<17692*/)/*<17689*/)/*<17687*/)(/*17693*/cls/*<17693*/)/*<17685*/ } }/*<17680*/)(/*17694*/0/*<17694*/)(/*17695*/classes/*<17695*/)/*<17678*/)/*<17676*/)(/*17696*/body/*<17696*/)/*<17674*/)/*<17664*/ } }/*<17653*/;

const generic = /*17753*/function name_17753(cls) { return function name_17753(body) { return /*17702*//*17703*/generics/*<17703*//*17702*/(/*17704*//*17704*/cons/*<17704*//*17704*/(/*17705*/cls/*<17705*/)(/*17704*/nil/*<17704*/)/*<17704*/)(/*17706*/body/*<17706*/)/*<17702*/ } }/*<17753*/;

const tuple_assump = /*17532*/function name_17532({0: name, 1: {0: kinds, 1: qual}}) {

 return /*17539*//*17540*/$ex$gt$ex/*<17540*//*17539*/(/*17541*/name/*<17541*/)(/*17542*//*17747*/forall/*<17747*//*17542*/(/*17748*/kinds/*<17748*/)(/*17749*/qual/*<17749*/)/*<17542*/)/*<17539*/ }/*<17532*/;

const tuple_scheme = /*19919*/function name_19919({0: kinds, 1: qual}) {
 return /*19930*//*19931*/forall/*<19931*//*19930*/(/*19932*/kinds/*<19932*/)(/*19933*/qual/*<19933*/)/*<19930*/ }/*<19919*/;

const concrete = /*19967*//*19968*/generics/*<19968*//*19967*/(/*19969*/nil/*<19969*/)/*<19967*/;

const full_env = (v0) => (v1) => (v2) => ({type: "full-env", 0: v0, 1: v1, 2: v2});
const infer_alias = /*20892*/function name_20892({0: tenv, 1: ce, 2: assumps}) {

 return function name_20892({0: name, 1: args, 2: type}) {

 return /*20924*//*20925*/fatal/*<20925*//*20924*/(/*20926*/"ok here we are"/*<20926*/)/*<20924*/ } }/*<20892*/;

const infer_deftype = /*20932*/function name_20932({0: {0: constructors_, 1: types_, 2: aliases_}, 1: ce, 2: assumps}) {



 return function name_20932({0: name, 1: tnl, 2: top_args, 3: constructors}) {


 return /*20948*/(function let_20948() {const $target = /*20958*//*20959*/map/*<20959*//*20958*/(/*20961*/function name_20961({0: name}) { return /*20971*/name/*<20971*/ }/*<20961*/)(/*21007*/constructors/*<21007*/)/*<20958*/;
{
let names = $target;
return (function let_20948() {const $target = /*24222*//*24223*/map/*<24223*//*24222*/(/*24224*/function name_24224(_) { return /*24228*/star/*<24228*/ }/*<24224*/)(/*24229*/top_args/*<24229*/)/*<24222*/;
{
let top_kinds = $target;
return (function let_20948() {const $target = /*23619*//*23620*/foldl/*<23620*//*23619*/(/*23621*/star/*<23621*/)(/*23625*/top_kinds/*<23625*/)(/*23626*/function name_23626(result) { return function name_23626(arg) { return /*23631*//*23632*/kfun/*<23632*//*23631*/(/*23633*/arg/*<23633*/)(/*23634*/result/*<23634*/)/*<23631*/ } }/*<23626*/)/*<23619*/;
{
let kind = $target;
return (function let_20948() {const $target = /*20973*//*20974*/foldl/*<20974*//*20973*/(/*20999*//*21000*/$co/*<21000*//*20999*/(/*20975*//*20976*/tcon/*<20976*//*20975*/(/*20977*//*20978*/tycon/*<20978*//*20977*/(/*20979*/name/*<20979*/)(/*21008*/kind/*<21008*/)/*<20977*/)(/*20981*/tnl/*<20981*/)/*<20975*/)(/*21001*/0/*<21001*/)/*<20999*/)(/*20983*/top_args/*<20983*/)(/*20985*/function name_20985({0: body, 1: i}) {
 return function name_20985({0: arg, 1: al}) {
 return /*21009*//*21010*/$co/*<21010*//*21009*/(/*20993*//*20994*/tapp/*<20994*//*20993*/(/*20995*/body/*<20995*/)(/*20996*//*20997*/tgen/*<20997*//*20996*/(/*20998*/i/*<20998*/)(/*21005*/al/*<21005*/)/*<20996*/)(/*21006*/al/*<21006*/)/*<20993*/)(/*21011*//*21012*/$pl/*<21012*//*21011*/(/*21013*/i/*<21013*/)(/*21014*/1/*<21014*/)/*<21011*/)/*<21009*/ } }/*<20985*/)/*<20973*/;
if ($target.type === ",") {
{
let final = $target[0];
return (function let_20948() {const $target = /*23545*//*23546*/map$slfrom_list/*<23546*//*23545*/(/*21115*//*21116*/mapi/*<21116*//*21115*/(/*21118*/function name_21118({0: arg, 1: al}) {
 return function name_21118(i) { return /*21123*//*21124*/$co/*<21124*//*21123*/(/*21125*/arg/*<21125*/)(/*21126*//*21127*/tgen/*<21127*//*21126*/(/*21128*/i/*<21128*/)(/*21129*/al/*<21129*/)/*<21126*/)/*<21123*/ } }/*<21118*/)(/*21146*/0/*<21146*/)(/*21135*/top_args/*<21135*/)/*<21115*/)/*<23545*/;
{
let free_idxs = $target;
return (function let_20948() {const $target = /*21020*//*21021*/foldl/*<21021*//*21020*/(/*21031*//*21022*/$co/*<21022*//*21031*/(/*21427*/nil/*<21427*/)(/*21032*/map$slnil/*<21032*/)/*<21031*/)(/*21023*/constructors/*<21023*/)(/*21024*/function name_21024({0: assumps, 1: constructors}) {
 return function name_21024({0: name, 1: nl, 2: args, 3: l}) {


 return /*21388*/(function let_21388() {const $target = /*21406*//*21407*/tfns/*<21407*//*21406*/(/*23547*//*21408*/map/*<21408*//*23547*/(/*23549*//*23552*/replace_tycons/*<23552*//*23549*/(/*23553*/free_idxs/*<23553*/)(/*24160*/types_/*<24160*/)/*<23549*/)(/*23548*/args/*<23548*/)/*<23547*/)(/*21411*/final/*<21411*/)/*<21406*/;
{
let typ = $target;
return (function let_21388() {const $target = /*21394*//*21395*/generics/*<21395*//*21394*/(/*21396*//*21397*/map/*<21397*//*21396*/(/*21399*/function name_21399(_) { return /*21404*/nil/*<21404*/ }/*<21399*/)(/*21405*/top_args/*<21405*/)/*<21396*/)(/*21425*/typ/*<21425*/)/*<21394*/;
if ($target.type === ",") {
{
let kinds = $target[0];
{
let qual = $target[1];
return /*21393*//*21412*/$co/*<21412*//*21393*/(/*21413*//*21413*/cons/*<21413*//*21413*/(/*21414*//*21431*/$ex$gt$ex/*<21431*//*21414*/(/*21432*/name/*<21432*/)(/*21433*//*21434*/forall/*<21434*//*21433*/(/*21435*/kinds/*<21435*/)(/*21436*/qual/*<21436*/)/*<21433*/)/*<21414*/)(/*21415*/assumps/*<21415*/)/*<21413*/)(/*21419*//*21420*/map$slset/*<21420*//*21419*/(/*21421*/constructors/*<21421*/)(/*21422*/name/*<21422*/)(/*21423*//*21437*/forall/*<21437*//*21423*/(/*21438*/kinds/*<21438*/)(/*21439*/qual/*<21439*/)/*<21423*/)/*<21419*/)/*<21393*/
}
}
};
throw new Error('let pattern not matched 21392. ' + valueToString($target));})(/*!*/)
};
throw new Error('let pattern not matched 21424. ' + valueToString($target));})(/*!*/)/*<21388*/ } }/*<21024*/)/*<21020*/;
if ($target.type === ",") {
{
let assumps$qu = $target[0];
{
let constructors$qu = $target[1];
return /*20984*//*21440*/full_env/*<21440*//*20984*/(/*21441*//*21442*/type_env/*<21442*//*21441*/(/*21443*/constructors$qu/*<21443*/)(/*21444*//*24217*/map$slset/*<24217*//*21444*/(/*24218*/map$slnil/*<24218*/)(/*24219*/name/*<24219*/)(/*24230*//*24220*/$co/*<24220*//*24230*/(/*24231*/top_kinds/*<24231*/)(/*24232*//*24233*/set$slfrom_list/*<24233*//*24232*/(/*24234*/names/*<24234*/)/*<24232*/)/*<24230*/)/*<21444*/)(/*21445*/map$slnil/*<21445*/)/*<21441*/)(/*21447*/class_env$slnil/*<21447*/)(/*21448*/assumps$qu/*<21448*/)/*<20984*/
}
}
};
throw new Error('let pattern not matched 21019. ' + valueToString($target));})(/*!*/)
};
throw new Error('let pattern not matched 21114. ' + valueToString($target));})(/*!*/)
}
};
throw new Error('let pattern not matched 21016. ' + valueToString($target));})(/*!*/)
};
throw new Error('let pattern not matched 23618. ' + valueToString($target));})(/*!*/)
};
throw new Error('let pattern not matched 24221. ' + valueToString($target));})(/*!*/)
};
throw new Error('let pattern not matched 20957. ' + valueToString($target));})(/*!*/)/*<20948*/ } }/*<20932*/;

const class_env$slmerge = /*22253*/function name_22253({0: classes, 1: defaults}) {
 return function name_22253({0: classes$qu, 1: defaults$qu}) {
 return /*22266*//*22267*/class_env/*<22267*//*22266*/(/*22268*//*22269*/map$slmerge/*<22269*//*22268*/(/*22270*/classes/*<22270*/)(/*22271*/classes$qu/*<22271*/)/*<22268*/)(/*22272*//*22273*/concat/*<22273*//*22272*/(/*22274*//*22274*/cons/*<22274*//*22274*/(/*22275*/defaults/*<22275*/)(/*22274*//*22274*/cons/*<22274*//*22274*/(/*22276*/defaults$qu/*<22276*/)(/*22274*/nil/*<22274*/)/*<22274*/)/*<22274*/)/*<22272*/)/*<22266*/ } }/*<22253*/;

const tenv$slmerge = /*22277*/function name_22277({0: const_, 1: types, 2: aliases}) {

 return function name_22277({0: const$qu, 1: types$qu, 2: aliases$qu}) {

 return /*22292*//*22293*/type_env/*<22293*//*22292*/(/*22294*//*22295*/map$slmerge/*<22295*//*22294*/(/*22296*/const_/*<22296*/)(/*22297*/const$qu/*<22297*/)/*<22294*/)(/*22299*//*22300*/map$slmerge/*<22300*//*22299*/(/*22301*/types/*<22301*/)(/*22302*/types$qu/*<22302*/)/*<22299*/)(/*22303*//*22304*/map$slmerge/*<22304*//*22303*/(/*22305*/aliases/*<22305*/)(/*22306*/aliases$qu/*<22306*/)/*<22303*/)/*<22292*/ } }/*<22277*/;

const type_env$slnil = /*23495*/tenv$slnil/*<23495*/;

const type_$gts = /*24102*//*24103*/type_$gts$qu/*<24103*//*24102*/(/*24104*/false/*<24104*/)/*<24102*/;

const type_debug_$gts = /*24120*//*24121*/type_$gts$qu/*<24121*//*24120*/(/*24122*/true/*<24122*/)/*<24120*/;

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

/* type alias alt */
const type$slkind = /*376*/function name_376(type) { return /*381*/(function match_381($target) {
if ($target.type === "tcon") {
{
let tc = $target[0];
return /*388*//*389*/tycon$slkind/*<389*//*388*/(/*390*/tc/*<390*/)/*<388*/
}
}
if ($target.type === "tvar") {
{
let u = $target[0];
return /*395*//*396*/tyvar$slkind/*<396*//*395*/(/*397*/u/*<397*/)/*<395*/
}
}
if ($target.type === "tapp") {
{
let t = $target[0];
{
let l = $target[2];
return /*403*/(function match_403($target) {
if ($target.type === "kfun") {
{
let k = $target[1];
return /*412*/k/*<412*/
}
}
return /*414*//*415*/fatal/*<415*//*414*/(/*416*/`Invalid type application ${/*418*//*419*/int_to_string/*<419*//*418*/(/*420*/l/*<420*/)/*<418*/} while trying to determine the kind of ${/*23607*//*23609*/type_$gts/*<23609*//*23607*/(/*23612*/type/*<23612*/)/*<23607*/}: ${/*23613*//*23615*/type_$gts/*<23615*//*23613*/(/*23616*/t/*<23616*/)/*<23613*/} isn't a kfun.`/*<416*/)/*<414*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 403');})(/*!*//*405*//*406*/type$slkind/*<406*//*405*/(/*407*/t/*<407*/)/*<405*/)/*<403*/
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 381');})(/*!*//*383*/type/*<383*/)/*<381*/ }/*<376*/;

const varBind = /*750*/function name_750(u) { return function name_750(t) { return /*757*/(function match_757($target) {
if ($target.type === "tvar") {
{
let name = $target[0];
return /*765*/(function match_765($target) {
if ($target === true) {
return /*881*/map$slnil/*<881*/
}
return /*772*//*773*/$bar_$gt/*<773*//*772*/(/*774*/u/*<774*/)(/*775*/t/*<775*/)/*<772*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 765');})(/*!*//*767*//*768*/$eq/*<768*//*767*/(/*769*/name/*<769*/)(/*770*/u/*<770*/)/*<767*/)/*<765*/
}
}
return /*777*/(function match_777($target) {
if ($target === true) {
return /*785*//*786*/fatal/*<786*//*785*/(/*787*/"Occurs check fails"/*<787*/)/*<785*/
}
return /*789*/(function match_789($target) {
if ($target === true) {
return /*800*//*801*/fatal/*<801*//*800*/(/*802*/"kinds do not match"/*<802*/)/*<800*/
}
return /*804*//*805*/$bar_$gt/*<805*//*804*/(/*806*/u/*<806*/)(/*807*/t/*<807*/)/*<804*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 789');})(/*!*//*792*//*793*/$ex$eq/*<793*//*792*/(/*794*//*795*/tyvar$slkind/*<795*//*794*/(/*796*/u/*<796*/)/*<794*/)(/*797*//*798*/type$slkind/*<798*//*797*/(/*799*/t/*<799*/)/*<797*/)/*<792*/)/*<789*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 777');})(/*!*//*779*//*780*/set$slhas/*<780*//*779*/(/*781*//*782*/type$sltv/*<782*//*781*/(/*783*/t/*<783*/)/*<781*/)(/*784*/u/*<784*/)/*<779*/)/*<777*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 757');})(/*!*//*759*/t/*<759*/)/*<757*/ } }/*<750*/;

const mgu = /*808*/function name_808(t1) { return function name_808(t2) { return /*815*/(function match_815($target) {
if ($target.type === ",") {
if ($target[0].type === "tapp") {
{
let l = $target[0][0];
{
let r = $target[0][1];
if ($target[1].type === "tapp") {
{
let l$qu = $target[1][0];
{
let r$qu = $target[1][1];
return /*7643*/(function match_7643($target) {
if ($target.type === "err") {
{
let e = $target[0];
return /*7654*//*7655*/err/*<7655*//*7654*/(/*9110*/e/*<9110*/)/*<7654*/
}
}
if ($target.type === "ok") {
{
let s1 = $target[0];
return /*7659*/(function match_7659($target) {
if ($target.type === "err") {
{
let e = $target[0];
return /*7673*//*7674*/err/*<7674*//*7673*/(/*9112*/e/*<9112*/)/*<7673*/
}
}
if ($target.type === "ok") {
{
let s2 = $target[0];
return /*7678*//*7680*/ok/*<7680*//*7678*/(/*7681*//*7682*/compose_subst/*<7682*//*7681*/(/*7683*/s2/*<7683*/)(/*7685*/s1/*<7685*/)/*<7681*/)/*<7678*/
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 7659');})(/*!*//*7661*//*7662*/mgu/*<7662*//*7661*/(/*7663*//*7664*/type$slapply/*<7664*//*7663*/(/*7665*/s1/*<7665*/)(/*7666*/r/*<7666*/)/*<7663*/)(/*7667*//*7668*/type$slapply/*<7668*//*7667*/(/*7669*/s1/*<7669*/)(/*7670*/r$qu/*<7670*/)/*<7667*/)/*<7661*/)/*<7659*/
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 7643');})(/*!*//*7648*//*7649*/mgu/*<7649*//*7648*/(/*7650*/l/*<7650*/)(/*7651*/l$qu/*<7651*/)/*<7648*/)/*<7643*/
}
}
}
}
}
}
}
if ($target.type === ",") {
if ($target[0].type === "tvar") {
{
let u = $target[0][0];
{
let l = $target[0][1];
{
let t = $target[1];
return /*7636*//*7637*/ok/*<7637*//*7636*/(/*865*//*866*/varBind/*<866*//*865*/(/*867*/u/*<867*/)(/*868*/t/*<868*/)/*<865*/)/*<7636*/
}
}
}
}
}
if ($target.type === ",") {
{
let t = $target[0];
if ($target[1].type === "tvar") {
{
let u = $target[1][0];
{
let l = $target[1][1];
return /*7638*//*7639*/ok/*<7639*//*7638*/(/*877*//*878*/varBind/*<878*//*877*/(/*879*/u/*<879*/)(/*880*/t/*<880*/)/*<877*/)/*<7638*/
}
}
}
}
}
if ($target.type === ",") {
if ($target[0].type === "tcon") {
{
let tc1 = $target[0][0];
if ($target[1].type === "tcon") {
{
let tc2 = $target[1][0];
return /*892*/(function match_892($target) {
if ($target === true) {
return /*7634*//*898*/ok/*<898*//*7634*/(/*7635*/map$slnil/*<7635*/)/*<7634*/
}
return /*9114*//*899*/err/*<899*//*9114*/(/*9115*/`Incompatible types ${/*9117*//*9119*/tycon_$gts/*<9119*//*9117*/(/*9120*/tc1/*<9120*/)/*<9117*/} vs ${/*9121*//*9123*/tycon_$gts/*<9123*//*9121*/(/*9124*/tc2/*<9124*/)/*<9121*/}`/*<9115*/)/*<9114*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 892');})(/*!*//*894*//*895*/tycon$eq/*<895*//*894*/(/*896*/tc1/*<896*/)(/*897*/tc2/*<897*/)/*<894*/)/*<892*/
}
}
}
}
}
if ($target.type === ",") {
{
let a = $target[0];
{
let b = $target[1];
return /*16003*//*16004*/err/*<16004*//*16003*/(/*16005*/`Cant unify ${/*16007*//*16009*/type_$gts/*<16009*//*16007*/(/*16012*/a/*<16012*/)/*<16007*/} and ${/*16013*//*16015*/type_$gts/*<16015*//*16013*/(/*16016*/b/*<16016*/)/*<16013*/}`/*<16005*/)/*<16003*/
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 815');})(/*!*//*817*//*818*/$co/*<818*//*817*/(/*819*/t1/*<819*/)(/*820*/t2/*<820*/)/*<817*/)/*<815*/ } }/*<808*/;

const type_match = /*905*/function name_905(t1) { return function name_905(t2) { return /*913*/(function match_913($target) {
if ($target.type === ",") {
if ($target[0].type === "tapp") {
{
let l = $target[0][0];
{
let r = $target[0][1];
{
let loc = $target[0][2];
if ($target[1].type === "tapp") {
{
let l$qu = $target[1][0];
{
let r$qu = $target[1][1];
return /*8037*/(function match_8037($target) {
if ($target.type === "ok") {
{
let sl = $target[0];
return /*8052*/(function match_8052($target) {
if ($target.type === "ok") {
{
let sr = $target[0];
return /*8065*//*8067*/ok/*<8067*//*8065*/(/*8068*//*8069*/merge/*<8069*//*8068*/(/*8070*/sl/*<8070*/)(/*8071*/sr/*<8071*/)(/*8072*/loc/*<8072*/)/*<8068*/)/*<8065*/
}
}
{
let err = $target;
return /*8116*/err/*<8116*/
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 8052');})(/*!*//*8054*//*8055*/type_match/*<8055*//*8054*/(/*8056*/r/*<8056*/)(/*8057*/r$qu/*<8057*/)/*<8054*/)/*<8052*/
}
}
{
let err = $target;
return /*8098*/err/*<8098*/
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 8037');})(/*!*//*8041*//*8042*/type_match/*<8042*//*8041*/(/*8043*/l/*<8043*/)(/*8044*/l$qu/*<8044*/)/*<8041*/)/*<8037*/
}
}
}
}
}
}
}
}
if ($target.type === ",") {
if ($target[0].type === "tvar") {
{
let u = $target[0][0];
{
let t = $target[1];
return /*956*/(function match_956($target) {
if ($target === true) {
return /*8073*//*8074*/ok/*<8074*//*8073*/(/*967*//*968*/$bar_$gt/*<968*//*967*/(/*969*/u/*<969*/)(/*970*/t/*<970*/)/*<967*/)/*<8073*/
}
return /*971*//*8099*/err/*<8099*//*971*/(/*8100*/"Different Kinds"/*<8100*/)/*<971*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 956');})(/*!*//*961*//*962*/kind$eq/*<962*//*961*/(/*958*//*959*/tyvar$slkind/*<959*//*958*/(/*960*/u/*<960*/)/*<958*/)(/*964*//*965*/type$slkind/*<965*//*964*/(/*966*/t/*<966*/)/*<964*/)/*<961*/)/*<956*/
}
}
}
}
if ($target.type === ",") {
if ($target[0].type === "tcon") {
{
let tc1 = $target[0][0];
if ($target[1].type === "tcon") {
{
let tc2 = $target[1][0];
return /*985*/(function match_985($target) {
if ($target === true) {
return /*8077*//*991*/ok/*<991*//*8077*/(/*8078*/map$slnil/*<8078*/)/*<8077*/
}
return /*992*//*8104*/err/*<8104*//*992*/(/*8105*/`Unable to match types ${/*8107*//*8109*/tycon_$gts/*<8109*//*8107*/(/*8110*/tc1/*<8110*/)/*<8107*/} and ${/*8111*//*8113*/tycon_$gts/*<8113*//*8111*/(/*8114*/tc2/*<8114*/)/*<8111*/}`/*<8105*/)/*<992*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 985');})(/*!*//*987*//*988*/tycon$eq/*<988*//*987*/(/*989*/tc1/*<989*/)(/*990*/tc2/*<990*/)/*<987*/)/*<985*/
}
}
}
}
}
return /*16770*//*16771*/err/*<16771*//*16770*/(/*16772*/`Unable to match ${/*16774*//*16776*/type_$gts/*<16776*//*16774*/(/*16777*/t1/*<16777*/)/*<16774*/} vs ${/*16778*//*16780*/type_$gts/*<16780*//*16778*/(/*16781*/t2/*<16781*/)/*<16778*/}`/*<16772*/)/*<16770*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 913');})(/*!*//*915*//*916*/$co/*<916*//*915*/(/*917*/t1/*<917*/)(/*918*/t2/*<918*/)/*<915*/)/*<913*/ } }/*<905*/;

const qual$eq = /*6380*/function name_6380({0: preds, 1: t}) {
 return function name_6380({0: preds$qu, 1: t$qu}) {
 return function name_6380(t$eq) { return /*6443*/(function match_6443($target) {
if ($target === true) {
return /*6450*//*6452*/t$eq/*<6452*//*6450*/(/*6453*/t/*<6453*/)(/*6454*/t$qu/*<6454*/)/*<6450*/
}
return /*6455*/false/*<6455*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 6443');})(/*!*//*6445*//*6446*/array$eq/*<6446*//*6445*/(/*6447*/preds/*<6447*/)(/*6448*/preds$qu/*<6448*/)(/*6449*/pred$eq/*<6449*/)/*<6445*/)/*<6443*/ } } }/*<6380*/;

const mguPred = /*6802*//*6803*/lift/*<6803*//*6802*/(/*6804*/mgu/*<6804*/)/*<6802*/;

const matchPred = /*6809*//*6810*/lift/*<6810*//*6809*/(/*6811*/type_match/*<6811*/)/*<6809*/;

const add_prelude_classes = /*7215*//*7438*/compose_transformers/*<7438*//*7215*/(/*7439*/core_classes/*<7439*/)(/*7440*/num_classes/*<7440*/)/*<7215*/;

const overlap = /*7615*/function name_7615(p) { return function name_7615(q) { return /*7622*/(function match_7622($target) {
if ($target.type === "ok") {
return /*7631*/true/*<7631*/
}
return /*7633*/false/*<7633*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 7622');})(/*!*//*7624*//*7625*/mguPred/*<7625*//*7624*/(/*7626*/p/*<7626*/)(/*7627*/q/*<7627*/)/*<7624*/)/*<7622*/ } }/*<7615*/;

const by_inst = /*7927*/function name_7927(ce) { return function name_7927(pred) { return /*7934*/(function let_7934() {const $target = /*7941*/pred/*<7941*/;
if ($target.type === "isin") {
{
let i = $target[0];
{
let t = $target[1];
return (function let_7934() {const $target = /*7988*/ce/*<7988*/;
if ($target.type === "class-env") {
{
let classes = $target[0];
return (function let_7934() {const $target = /*7993*/(function match_7993($target) {
if ($target.type === "some") {
{
let s = $target[0];
return /*8002*/s/*<8002*/
}
}
return /*8004*//*8005*/fatal/*<8005*//*8004*/(/*8006*/`unknown name ${/*8008*/i/*<8008*/}`/*<8006*/)/*<8004*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 7993');})(/*!*//*7995*//*7996*/map$slget/*<7996*//*7995*/(/*7997*/classes/*<7997*/)(/*7998*/i/*<7998*/)/*<7995*/)/*<7993*/;
if ($target.type === ",") {
{
let insts = $target[1];
return /*7980*//*7981*/find_some/*<7981*//*7980*/(/*7982*/function name_7982({0: ps, 1: h}) {
 return /*8017*/(function match_8017($target) {
if ($target.type === "err") {
return /*8026*//*8027*/none/*<8027*//*8026*//*<8026*/
}
if ($target.type === "ok") {
{
let u = $target[0];
return /*8118*//*8119*/some/*<8119*//*8118*/(/*8031*//*8032*/map/*<8032*//*8031*/(/*8033*//*8034*/pred$slapply/*<8034*//*8033*/(/*8035*/u/*<8035*/)/*<8033*/)(/*8036*/ps/*<8036*/)/*<8031*/)/*<8118*/
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 8017');})(/*!*//*8019*//*8020*/matchPred/*<8020*//*8019*/(/*8022*/h/*<8022*/)(/*8023*/pred/*<8023*/)/*<8019*/)/*<8017*/ }/*<7982*/)(/*7983*/insts/*<7983*/)/*<7980*/
}
};
throw new Error('let pattern not matched 7989. ' + valueToString($target));})(/*!*/)
}
};
throw new Error('let pattern not matched 7984. ' + valueToString($target));})(/*!*/)
}
}
};
throw new Error('let pattern not matched 7937. ' + valueToString($target));})(/*!*/)/*<7934*/ } }/*<7927*/;

const entail = /*8121*/function name_8121(ce) { return function name_8121(ps) { return function name_8121(p) { return /*8129*/(function match_8129($target) {
if ($target === true) {
return /*8142*/true/*<8142*/
}
return /*8143*/(function match_8143($target) {
if ($target.type === "none") {
return /*8190*/false/*<8190*/
}
if ($target.type === "some") {
{
let qs = $target[0];
return /*8194*//*8195*/all/*<8195*//*8194*/(/*8196*//*8197*/entail/*<8197*//*8196*/(/*8198*/ce/*<8198*/)(/*8199*/ps/*<8199*/)/*<8196*/)(/*8200*/qs/*<8200*/)/*<8194*/
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 8143');})(/*!*//*8184*//*8185*/by_inst/*<8185*//*8184*/(/*8186*/ce/*<8186*/)(/*8187*/p/*<8187*/)/*<8184*/)/*<8143*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 8129');})(/*!*//*8131*//*8132*/any/*<8132*//*8131*/(/*8133*//*8179*/any/*<8179*//*8133*/(/*8180*//*8181*/pred$eq/*<8181*//*8180*/(/*8182*/p/*<8182*/)/*<8180*/)/*<8133*/)(/*8136*//*8137*/map/*<8137*//*8136*/(/*8138*//*8139*/by_super/*<8139*//*8138*/(/*8140*/ce/*<8140*/)/*<8138*/)(/*8141*/ps/*<8141*/)/*<8136*/)/*<8131*/)/*<8129*/ } } }/*<8121*/;

const simplify_inner = /*8441*/function name_8441(ce) { return function name_8441(rs) { return function name_8441(preds) { return /*8447*/(function match_8447($target) {
if ($target.type === "nil") {
return /*8454*/rs/*<8454*/
}
if ($target.type === "cons") {
{
let p = $target[0];
{
let ps = $target[1];
return /*8461*/(function match_8461($target) {
if ($target === true) {
return /*8472*//*8476*/simplify_inner/*<8476*//*8472*/(/*8477*/ce/*<8477*/)(/*8478*/rs/*<8478*/)(/*8479*/ps/*<8479*/)/*<8472*/
}
return /*8480*//*8481*/simplify_inner/*<8481*//*8480*/(/*8482*/ce/*<8482*/)(/*8483*//*8483*/cons/*<8483*//*8483*/(/*8484*/p/*<8484*/)(/*8485*/rs/*<8485*/)/*<8483*/)(/*8489*/ps/*<8489*/)/*<8480*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 8461');})(/*!*//*8463*//*8464*/entail/*<8464*//*8463*/(/*8465*/ce/*<8465*/)(/*8466*//*8467*/concat/*<8467*//*8466*/(/*8468*//*8468*/cons/*<8468*//*8468*/(/*8469*/rs/*<8469*/)(/*8468*//*8468*/cons/*<8468*//*8468*/(/*8470*/ps/*<8470*/)(/*8468*/nil/*<8468*/)/*<8468*/)/*<8468*/)/*<8466*/)(/*8471*/p/*<8471*/)/*<8463*/)/*<8461*/
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 8447');})(/*!*//*8452*/preds/*<8452*/)/*<8447*/ } } }/*<8441*/;

const simplify = /*8490*/function name_8490(ce) { return /*8498*//*8499*/simplify_inner/*<8499*//*8498*/(/*8500*/ce/*<8500*/)(/*8501*/nil/*<8501*/)/*<8498*/ }/*<8490*/;

const scheme$eq = /*8564*/function name_8564({0: kinds, 1: qual}) {
 return function name_8564({0: kinds$qu, 1: qual$qu}) {
 return /*8579*/(function match_8579($target) {
if ($target === true) {
return /*8586*//*8587*/qual$eq/*<8587*//*8586*/(/*8588*/qual/*<8588*/)(/*8590*/qual$qu/*<8590*/)(/*8592*/type$eq/*<8592*/)/*<8586*/
}
return /*8591*/false/*<8591*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 8579');})(/*!*//*8581*//*8582*/array$eq/*<8582*//*8581*/(/*8583*/kinds/*<8583*/)(/*8584*/kinds$qu/*<8584*/)(/*8585*/kind$eq/*<8585*/)/*<8581*/)/*<8579*/ } }/*<8564*/;

const TI = (v0) => ({type: "TI", 0: v0});
const get_subst = /*9145*//*9146*/TI/*<9146*//*9145*/(/*9147*/function name_9147(subst) { return function name_9147(tenv) { return function name_9147(n) { return /*9157*//*9158*/ok/*<9158*//*9157*/(/*9152*//*9153*/$co$co$co/*<9153*//*9152*/(/*9154*/subst/*<9154*/)(/*9906*/tenv/*<9906*/)(/*9155*/n/*<9155*/)(/*9156*/subst/*<9156*/)/*<9152*/)/*<9157*/ } } }/*<9147*/)/*<9145*/;

const add_subst = /*9159*/function name_9159(new_subst) { return /*9166*//*9167*/TI/*<9167*//*9166*/(/*9168*/function name_9168(subst) { return function name_9168(tenv) { return function name_9168(n) { return /*9173*//*9174*/ok/*<9174*//*9173*/(/*9175*//*9176*/$co$co$co/*<9176*//*9175*/(/*9177*//*9178*/compose_subst/*<9178*//*9177*/(/*9179*/new_subst/*<9179*/)(/*9180*/subst/*<9180*/)/*<9177*/)(/*9908*/tenv/*<9908*/)(/*9181*/n/*<9181*/)(/*9182*/0/*<9182*/)/*<9175*/)/*<9173*/ } } }/*<9168*/)/*<9166*/ }/*<9159*/;

const ti_run = /*9278*/function name_9278({0: f}) { return function name_9278(subst) { return function name_9278(tenv) { return function name_9278(nidx) { return /*9288*//*9289*/f/*<9289*//*9288*/(/*9290*/subst/*<9290*/)(/*9919*/tenv/*<9919*/)(/*9291*/nidx/*<9291*/)/*<9288*/ } } } }/*<9278*/;

const ti_return = /*9355*/function name_9355(x) { return /*9363*//*9364*/TI/*<9364*//*9363*/(/*9365*/function name_9365(subst) { return function name_9365(tenv) { return function name_9365(nidx) { return /*9370*//*9371*/ok/*<9371*//*9370*/(/*9372*//*9373*/$co$co$co/*<9373*//*9372*/(/*9374*/subst/*<9374*/)(/*9910*/tenv/*<9910*/)(/*9375*/nidx/*<9375*/)(/*9376*/x/*<9376*/)/*<9372*/)/*<9370*/ } } }/*<9365*/)/*<9363*/ }/*<9355*/;

const inst$slqual = /*9478*/function name_9478(types) { return function name_9478(inst$slt) { return function name_9478({0: ps, 1: t}) {
 return /*9493*//*9494*/$eq$gt/*<9494*//*9493*/(/*9495*//*9496*/inst$slpreds/*<9496*//*9495*/(/*9497*/types/*<9497*/)(/*9498*/ps/*<9498*/)/*<9495*/)(/*9499*//*9500*/inst$slt/*<9500*//*9499*/(/*9502*/types/*<9502*/)(/*9503*/t/*<9503*/)/*<9499*/)/*<9493*/ } } }/*<9478*/;

/* type alias infer */
const ti_then = /*9622*/function name_9622(ti) { return function name_9622(next) { return /*9629*//*9630*/TI/*<9630*//*9629*/(/*9631*/function name_9631(subst) { return function name_9631(tenv) { return function name_9631(nidx) { return /*9636*/(function match_9636($target) {
if ($target.type === "err") {
{
let e = $target[0];
return /*9646*//*9647*/err/*<9647*//*9646*/(/*9648*/e/*<9648*/)/*<9646*/
}
}
if ($target.type === "ok") {
if ($target[0].type === ",,,") {
{
let subst = $target[0][0];
{
let tenv = $target[0][1];
{
let nidx = $target[0][2];
{
let value = $target[0][3];
return /*9657*//*9658*/ti_run/*<9658*//*9657*/(/*9659*//*9660*/next/*<9660*//*9659*/(/*9661*/value/*<9661*/)/*<9659*/)(/*9662*/subst/*<9662*/)(/*9924*/tenv/*<9924*/)(/*9663*/nidx/*<9663*/)/*<9657*/
}
}
}
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 9636');})(/*!*//*9638*//*9639*/ti_run/*<9639*//*9638*/(/*9640*/ti/*<9640*/)(/*9641*/subst/*<9641*/)(/*9922*/tenv/*<9922*/)(/*9642*/nidx/*<9642*/)/*<9638*/)/*<9636*/ } } }/*<9631*/)/*<9629*/ } }/*<9622*/;

const mk_deftype = /*12423*/function name_12423(id) { return function name_12423(li) { return function name_12423(args) { return function name_12423(items) { return function name_12423(l) { return /*12432*//*12433*/sdeftype/*<12433*//*12432*/(/*12434*/id/*<12434*/)(/*12435*/li/*<12435*/)(/*12436*//*12437*/map/*<12437*//*12436*/(/*12439*/function name_12439(arg) { return /*12443*/(function match_12443($target) {
if ($target.type === "cst/identifier") {
{
let name = $target[0];
{
let l = $target[1];
return /*12450*//*12451*/$co/*<12451*//*12450*/(/*12452*/name/*<12452*/)(/*12453*/l/*<12453*/)/*<12450*/
}
}
}
return /*12455*//*12456*/fatal/*<12456*//*12455*/(/*12457*/"deftype type argument must be identifier"/*<12457*/)/*<12455*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 12443');})(/*!*//*12445*/arg/*<12445*/)/*<12443*/ }/*<12439*/)(/*12966*/args/*<12966*/)/*<12436*/)(/*12459*//*12460*/foldr/*<12460*//*12459*/(/*12461*/nil/*<12461*/)(/*12462*/items/*<12462*/)(/*12463*/function name_12463(res) { return function name_12463(constr) { return /*12468*/(function match_12468($target) {
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
return /*12481*//*12481*/cons/*<12481*//*12481*/(/*12482*//*12483*/$co$co$co/*<12483*//*12482*/(/*12484*/name/*<12484*/)(/*12485*/ni/*<12485*/)(/*12486*//*12487*/map/*<12487*//*12486*/(/*12489*/parse_type/*<12489*/)(/*12967*/args/*<12967*/)/*<12486*/)(/*12490*/l/*<12490*/)/*<12482*/)(/*12492*/res/*<12492*/)/*<12481*/
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
return /*12497*/res/*<12497*/
}
}
}
return /*12499*//*12500*/fatal/*<12500*//*12499*/(/*12501*/"Invalid type constructor"/*<12501*/)/*<12499*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 12468');})(/*!*//*12470*/constr/*<12470*/)/*<12468*/ } }/*<12463*/)/*<12459*/)(/*12503*/l/*<12503*/)/*<12432*/ } } } } }/*<12423*/;

const candidates = /*14040*/function name_14040(ce) { return function name_14040({0: v, 1: qs}) {
 return /*14050*/(function let_14050() {const $target = /*14181*/ce/*<14181*/;
if ($target.type === "class-env") {
{
let defaults = $target[1];
return (function let_14050() {const $target = /*14056*//*14057*/map/*<14057*//*14056*/(/*14059*/function name_14059({0: i}) { return /*14066*/i/*<14066*/ }/*<14059*/)(/*14058*/qs/*<14058*/)/*<14056*/;
{
let is = $target;
return (function let_14050() {const $target = /*14077*//*14078*/map/*<14078*//*14077*/(/*14068*/function name_14068({1: t}) { return /*14075*/t/*<14075*/ }/*<14068*/)(/*14079*/qs/*<14079*/)/*<14077*/;
{
let ts = $target;
return /*14085*/(function match_14085($target) {
if ($target === true) {
return /*14105*/nil/*<14105*/
}
return /*14106*//*14143*/filter/*<14143*//*14106*/(/*14144*/function name_14144(t$qu) { return /*14150*//*14155*/all/*<14155*//*14150*/(/*14156*//*14157*/entail/*<14157*//*14156*/(/*14158*/ce/*<14158*/)(/*14159*/nil/*<14159*/)/*<14156*/)(/*14160*//*14161*/map/*<14161*//*14160*/(/*14163*/function name_14163(i) { return /*14167*//*14168*/isin/*<14168*//*14167*/(/*14169*/i/*<14169*/)(/*14170*/t$qu/*<14170*/)/*<14167*/ }/*<14163*/)(/*14172*/is/*<14172*/)/*<14160*/)/*<14150*/ }/*<14144*/)(/*14153*/defaults/*<14153*/)/*<14106*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 14085');})(/*!*//*14087*//*14093*/not/*<14093*//*14087*/(/*14094*//*14095*/every/*<14095*//*14094*/(/*14097*//*14097*/cons/*<14097*//*14097*/(/*14098*//*14099*/all/*<14099*//*14098*/(/*14100*//*14101*/type$eq/*<14101*//*14100*/(/*14102*//*14103*/tvar/*<14103*//*14102*/(/*14104*/v/*<14104*/)(/*14115*/-1/*<14115*/)/*<14102*/)/*<14100*/)(/*14116*/ts/*<14116*/)/*<14098*/)(/*14097*//*14097*/cons/*<14097*//*14097*/(/*14117*//*14118*/any/*<14118*//*14117*/(/*14123*/function name_14123(x) { return /*14119*//*14120*/contains/*<14120*//*14119*/(/*14121*/numClasses/*<14121*/)(/*14127*/x/*<14127*/)(/*14128*/$eq/*<14128*/)/*<14119*/ }/*<14123*/)(/*14122*/is/*<14122*/)/*<14117*/)(/*14097*//*14097*/cons/*<14097*//*14097*/(/*14129*//*14131*/all/*<14131*//*14129*/(/*14132*/function name_14132(x) { return /*14136*//*14137*/contains/*<14137*//*14136*/(/*14138*/stdClasses/*<14138*/)(/*14139*/x/*<14139*/)(/*14140*/$eq/*<14140*/)/*<14136*/ }/*<14132*/)(/*14146*/is/*<14146*/)/*<14129*/)(/*14097*/nil/*<14097*/)/*<14097*/)/*<14097*/)/*<14097*/)(/*14114*/function name_14114(x) { return /*15958*/x/*<15958*/ }/*<14114*/)/*<14094*/)/*<14087*/)/*<14085*/
};
throw new Error('let pattern not matched 14067. ' + valueToString($target));})(/*!*/)
};
throw new Error('let pattern not matched 14055. ' + valueToString($target));})(/*!*/)
}
};
throw new Error('let pattern not matched 14177. ' + valueToString($target));})(/*!*/)/*<14050*/ } }/*<14040*/;

const ti_err = /*14590*/function name_14590(v) { return /*14596*//*14597*/TI/*<14597*//*14596*/(/*14598*/function name_14598(_) { return function name_14598(_) { return function name_14598(_) { return /*14604*//*14605*/err/*<14605*//*14604*/(/*14606*/v/*<14606*/)/*<14604*/ } } }/*<14598*/)/*<14596*/ }/*<14590*/;

const pred_$gts = /*16056*/function name_16056({0: name, 1: type}) {
 return /*16065*/`${/*16069*//*16071*/type_$gts/*<16071*//*16069*/(/*16072*/type/*<16072*/)/*<16069*/} ∈ ${/*16947*/name/*<16947*/}`/*<16065*/ }/*<16056*/;

const subst_$gts = /*16493*/function name_16493(subst) { return /*16499*//*16500*/join/*<16500*//*16499*/(/*16501*/"\n"/*<16501*/)(/*16506*//*16507*/map/*<16507*//*16506*/(/*16510*/function name_16510({0: tyvar, 1: type}) {
 return /*16518*/`${/*16526*//*16528*/tyvar_$gts/*<16528*//*16526*/(/*16529*/tyvar/*<16529*/)/*<16526*/} = ${/*16530*//*16532*/type_$gts/*<16532*//*16530*/(/*16533*/type/*<16533*/)/*<16530*/}`/*<16518*/ }/*<16510*/)(/*16519*//*16508*/map$slto_list/*<16508*//*16519*/(/*16520*/subst/*<16520*/)/*<16519*/)/*<16506*/)/*<16499*/ }/*<16493*/;

const types_$gts = /*16894*//*16895*/dot/*<16895*//*16894*/(/*16896*//*16897*/join/*<16897*//*16896*/(/*16898*/"\n"/*<16898*/)/*<16896*/)(/*16903*//*16902*/map/*<16902*//*16903*/(/*16904*/type_$gts/*<16904*/)/*<16903*/)/*<16894*/;

const preds_$gts = /*16884*//*16885*/dot/*<16885*//*16884*/(/*16886*//*16887*/join/*<16887*//*16886*/(/*16888*/"\n"/*<16888*/)/*<16886*/)(/*16881*//*16882*/map/*<16882*//*16881*/(/*16883*/pred_$gts/*<16883*/)/*<16881*/)/*<16884*/;

const builtin_instances = /*17650*/(function let_17650() {const $target = /*18006*/function name_18006(cls) { return function name_18006(x) { return /*18012*//*18013*/generic/*<18013*//*18012*/(/*18014*//*18014*/cons/*<18014*//*18014*/(/*18015*/cls/*<18015*/)(/*18014*/nil/*<18014*/)/*<18014*/)(/*18016*//*18017*/isin/*<18017*//*18016*/(/*18018*/cls/*<18018*/)(/*18019*/x/*<18019*/)/*<18016*/)/*<18012*/ } }/*<18006*/;
{
let gen1 = $target;
return (function let_17650() {const $target = /*18021*/function name_18021(cls) { return function name_18021(x) { return /*18026*//*18027*/generics/*<18027*//*18026*/(/*18028*//*18028*/cons/*<18028*//*18028*/(/*18030*//*18030*/cons/*<18030*//*18030*/(/*18031*/cls/*<18031*/)(/*18030*/nil/*<18030*/)/*<18030*/)(/*18028*//*18028*/cons/*<18028*//*18028*/(/*18032*//*18032*/cons/*<18032*//*18032*/(/*18033*/cls/*<18033*/)(/*18032*/nil/*<18032*/)/*<18032*/)(/*18028*/nil/*<18028*/)/*<18028*/)/*<18028*/)(/*18034*//*18035*/isin/*<18035*//*18034*/(/*18036*/cls/*<18036*/)(/*18037*/x/*<18037*/)/*<18034*/)/*<18026*/ } }/*<18021*/;
{
let gen2 = $target;
return (function let_17650() {const $target = /*18158*/function name_18158(x) { return /*18141*//*18142*/generic/*<18142*//*18141*/(/*18143*//*18143*/cons/*<18143*//*18143*/(/*18144*/"integral"/*<18144*/)(/*18143*/nil/*<18143*/)/*<18143*/)(/*18146*//*18147*/isin/*<18147*//*18146*/(/*18148*/x/*<18148*/)(/*18150*//*18151*/tapp/*<18151*//*18150*/(/*18152*//*18153*/mkcon/*<18153*//*18152*/(/*18154*/"ratio"/*<18154*/)/*<18152*/)(/*18156*/g0/*<18156*/)(/*18157*/-1/*<18157*/)/*<18150*/)/*<18146*/)/*<18141*/ }/*<18158*/;
{
let int_ratio = $target;
return (function let_17650() {const $target = /*17813*//*18038*/gen1/*<18038*//*17813*/(/*18039*/"eq"/*<18039*/)/*<17813*/;
{
let eq = $target;
return (function let_17650() {const $target = /*17856*//*18041*/gen2/*<18041*//*17856*/(/*18042*/"eq"/*<18042*/)/*<17856*/;
{
let eq2 = $target;
return (function let_17650() {const $target = /*18249*//*18250*/gen1/*<18250*//*18249*/(/*18251*/"show"/*<18251*/)/*<18249*/;
{
let show = $target;
return (function let_17650() {const $target = /*18255*//*18256*/gen2/*<18256*//*18255*/(/*18257*/"show"/*<18257*/)/*<18255*/;
{
let show2 = $target;
return (function let_17650() {const $target = /*18266*//*18267*/mklist/*<18267*//*18266*/(/*18268*/g0/*<18268*/)/*<18266*/;
{
let list = $target;
return (function let_17650() {const $target = /*18270*//*18271*/toption/*<18271*//*18270*/(/*18272*/g0/*<18272*/)/*<18270*/;
{
let option = $target;
return (function let_17650() {const $target = /*18275*//*18276*/tresult/*<18276*//*18275*/(/*18277*/g0/*<18277*/)(/*18278*/g1/*<18278*/)/*<18275*/;
{
let result = $target;
return (function let_17650() {const $target = /*18280*//*18281*/mkpair/*<18281*//*18280*/(/*18282*/g0/*<18282*/)(/*18283*/g1/*<18283*/)/*<18280*/;
{
let pair = $target;
return (function let_17650() {const $target = /*18314*//*18315*/gen1/*<18315*//*18314*/(/*18316*/"ix"/*<18316*/)/*<18314*/;
{
let ix = $target;
return (function let_17650() {const $target = /*18319*//*18320*/gen2/*<18320*//*18319*/(/*18321*/"ix"/*<18321*/)/*<18319*/;
{
let ix2 = $target;
return /*17921*//*17921*/cons/*<17921*//*17921*/(/*17923*//*17924*/eq/*<17924*//*17923*/(/*17925*/list/*<17925*/)/*<17923*/)(/*17921*//*17921*/cons/*<17921*//*17921*/(/*17930*//*17931*/eq/*<17931*//*17930*/(/*17932*/option/*<17932*/)/*<17930*/)(/*17921*//*17921*/cons/*<17921*//*17921*/(/*17935*//*17936*/eq2/*<17936*//*17935*/(/*17937*/result/*<17937*/)/*<17935*/)(/*17921*//*17921*/cons/*<17921*//*17921*/(/*17942*//*18162*/int_ratio/*<18162*//*17942*/(/*18163*/"eq"/*<18163*/)/*<17942*/)(/*17921*//*17921*/cons/*<17921*//*17921*/(/*17978*//*17979*/eq2/*<17979*//*17978*/(/*17980*/pair/*<17980*/)/*<17978*/)(/*17921*//*17921*/cons/*<17921*//*17921*/(/*18004*//*18044*/gen1/*<18044*//*18004*/(/*18045*/"ord"/*<18045*/)(/*18060*/list/*<18060*/)/*<18004*/)(/*17921*//*17921*/cons/*<17921*//*17921*/(/*18165*//*18166*/int_ratio/*<18166*//*18165*/(/*18167*/"ord"/*<18167*/)/*<18165*/)(/*17921*//*17921*/cons/*<17921*//*17921*/(/*18090*//*18091*/gen1/*<18091*//*18090*/(/*18092*/"ord"/*<18092*/)(/*18094*/option/*<18094*/)/*<18090*/)(/*17921*//*17921*/cons/*<17921*//*17921*/(/*18081*//*18083*/gen2/*<18083*//*18081*/(/*18088*/"ord"/*<18088*/)(/*18084*/result/*<18084*/)/*<18081*/)(/*17921*//*17921*/cons/*<17921*//*17921*/(/*18097*//*18098*/gen2/*<18098*//*18097*/(/*18099*/"ord"/*<18099*/)(/*18101*/pair/*<18101*/)/*<18097*/)(/*17921*//*17921*/cons/*<17921*//*17921*/(/*18169*//*18170*/int_ratio/*<18170*//*18169*/(/*18171*/"num"/*<18171*/)/*<18169*/)(/*17921*//*17921*/cons/*<17921*//*17921*/(/*18184*//*18185*/int_ratio/*<18185*//*18184*/(/*18186*/"real"/*<18186*/)/*<18184*/)(/*17921*//*17921*/cons/*<17921*//*17921*/(/*18204*//*18205*/int_ratio/*<18205*//*18204*/(/*18206*/"fractional"/*<18206*/)/*<18204*/)(/*17921*//*17921*/cons/*<17921*//*17921*/(/*18227*//*18228*/int_ratio/*<18228*//*18227*/(/*18229*/"realfrac"/*<18229*/)/*<18227*/)(/*17921*//*17921*/cons/*<17921*//*17921*/(/*18259*//*18260*/show/*<18260*//*18259*/(/*18261*/list/*<18261*/)/*<18259*/)(/*17921*//*17921*/cons/*<17921*//*17921*/(/*18264*//*18284*/show/*<18284*//*18264*/(/*18285*/option/*<18285*/)/*<18264*/)(/*17921*//*17921*/cons/*<17921*//*17921*/(/*18286*//*18287*/show/*<18287*//*18286*/(/*18288*/result/*<18288*/)/*<18286*/)(/*17921*//*17921*/cons/*<17921*//*17921*/(/*18289*//*18290*/int_ratio/*<18290*//*18289*/(/*18291*/"show"/*<18291*/)/*<18289*/)(/*17921*//*17921*/cons/*<17921*//*17921*/(/*18295*//*18296*/show/*<18296*//*18295*/(/*18297*/pair/*<18297*/)/*<18295*/)(/*17921*//*17921*/cons/*<17921*//*17921*/(/*18324*//*18325*/ix/*<18325*//*18324*/(/*18326*/pair/*<18326*/)/*<18324*/)(/*17921*//*17921*/cons/*<17921*//*17921*/(/*18912*//*18913*/generics/*<18913*//*18912*/(/*18914*/nil/*<18914*/)(/*18915*//*18916*/isin/*<18916*//*18915*/(/*18917*/"monad"/*<18917*/)(/*18919*//*18920*/tcon/*<18920*//*18919*/(/*18921*//*18922*/tycon/*<18922*//*18921*/(/*18923*/"option"/*<18923*/)(/*18926*//*18927*/kfun/*<18927*//*18926*/(/*18928*/star/*<18928*/)(/*18929*/star/*<18929*/)/*<18926*/)/*<18921*/)(/*18925*/-1/*<18925*/)/*<18919*/)/*<18915*/)/*<18912*/)(/*17921*//*17921*/cons/*<17921*//*17921*/(/*18931*//*18932*/generics/*<18932*//*18931*/(/*18933*/nil/*<18933*/)(/*18934*//*18935*/isin/*<18935*//*18934*/(/*18936*/"monad"/*<18936*/)(/*18938*//*18939*/tcon/*<18939*//*18938*/(/*18940*//*18941*/tycon/*<18941*//*18940*/(/*18942*/"list"/*<18942*/)(/*18944*//*18945*/kfun/*<18945*//*18944*/(/*18946*/star/*<18946*/)(/*18947*/star/*<18947*/)/*<18944*/)/*<18940*/)(/*18948*/-1/*<18948*/)/*<18938*/)/*<18934*/)/*<18931*/)(/*17919*//*17920*/concat/*<17920*//*17919*/(/*17886*//*17887*/map/*<17887*//*17886*/(/*17888*/function name_17888({0: cls, 1: names}) {
 return /*17895*//*17896*/map/*<17896*//*17895*/(/*17898*/function name_17898(name) { return /*17902*//*17903*/$co/*<17903*//*17902*/(/*17904*/nil/*<17904*/)(/*17905*//*17906*/$eq$gt/*<17906*//*17905*/(/*17907*/nil/*<17907*/)(/*17908*//*17909*/isin/*<17909*//*17908*/(/*17910*/cls/*<17910*/)(/*17912*//*17971*/mkcon/*<17971*//*17912*/(/*17972*/name/*<17972*/)/*<17912*/)/*<17908*/)/*<17905*/)/*<17902*/ }/*<17898*/)(/*17897*/names/*<17897*/)/*<17895*/ }/*<17888*/)(/*17885*//*17885*/cons/*<17885*//*17885*/(/*17881*//*17882*/$co/*<17882*//*17881*/(/*17628*/"eq"/*<17628*/)(/*17630*//*17630*/cons/*<17630*//*17630*/(/*17631*/"unit"/*<17631*/)(/*17630*//*17630*/cons/*<17630*//*17630*/(/*17633*/"char"/*<17633*/)(/*17630*//*17630*/cons/*<17630*//*17630*/(/*17635*/"int"/*<17635*/)(/*17630*//*17630*/cons/*<17630*//*17630*/(/*17637*/"float"/*<17637*/)(/*17630*//*17630*/cons/*<17630*//*17630*/(/*17639*/"double"/*<17639*/)(/*17630*//*17630*/cons/*<17630*//*17630*/(/*17641*/"bool"/*<17641*/)(/*17630*//*17630*/cons/*<17630*//*17630*/(/*17879*/"ordering"/*<17879*/)(/*17630*/nil/*<17630*/)/*<17630*/)/*<17630*/)/*<17630*/)/*<17630*/)/*<17630*/)/*<17630*/)/*<17630*/)/*<17881*/)(/*17885*//*17885*/cons/*<17885*//*17885*/(/*17984*//*17985*/$co/*<17985*//*17984*/(/*17986*/"ord"/*<17986*/)(/*17988*//*17988*/cons/*<17988*//*17988*/(/*17989*/"unit"/*<17989*/)(/*17988*//*17988*/cons/*<17988*//*17988*/(/*17991*/"char"/*<17991*/)(/*17988*//*17988*/cons/*<17988*//*17988*/(/*17993*/"int"/*<17993*/)(/*17988*//*17988*/cons/*<17988*//*17988*/(/*17995*/"float"/*<17995*/)(/*17988*//*17988*/cons/*<17988*//*17988*/(/*17997*/"double"/*<17997*/)(/*17988*//*17988*/cons/*<17988*//*17988*/(/*17999*/"bool"/*<17999*/)(/*17988*//*17988*/cons/*<17988*//*17988*/(/*18001*/"ordering"/*<18001*/)(/*17988*/nil/*<17988*/)/*<17988*/)/*<17988*/)/*<17988*/)/*<17988*/)/*<17988*/)/*<17988*/)/*<17988*/)/*<17984*/)(/*17885*//*17885*/cons/*<17885*//*17885*/(/*18105*//*18106*/$co/*<18106*//*18105*/(/*18107*/"num"/*<18107*/)(/*18109*//*18109*/cons/*<18109*//*18109*/(/*18110*/"int"/*<18110*/)(/*18109*//*18109*/cons/*<18109*//*18109*/(/*18112*/"float"/*<18112*/)(/*18109*//*18109*/cons/*<18109*//*18109*/(/*18114*/"double"/*<18114*/)(/*18109*/nil/*<18109*/)/*<18109*/)/*<18109*/)/*<18109*/)/*<18105*/)(/*17885*//*17885*/cons/*<17885*//*17885*/(/*18173*//*18174*/$co/*<18174*//*18173*/(/*18175*/"real"/*<18175*/)(/*18177*//*18177*/cons/*<18177*//*18177*/(/*18178*/"int"/*<18178*/)(/*18177*//*18177*/cons/*<18177*//*18177*/(/*18180*/"float"/*<18180*/)(/*18177*//*18177*/cons/*<18177*//*18177*/(/*18182*/"double"/*<18182*/)(/*18177*/nil/*<18177*/)/*<18177*/)/*<18177*/)/*<18177*/)/*<18173*/)(/*17885*//*17885*/cons/*<17885*//*17885*/(/*18188*//*18189*/$co/*<18189*//*18188*/(/*18190*/"integral"/*<18190*/)(/*18192*//*18192*/cons/*<18192*//*18192*/(/*18193*/"int"/*<18193*/)(/*18192*/nil/*<18192*/)/*<18192*/)/*<18188*/)(/*17885*//*17885*/cons/*<17885*//*17885*/(/*18195*//*18196*/$co/*<18196*//*18195*/(/*18197*/"fractional"/*<18197*/)(/*18199*//*18199*/cons/*<18199*//*18199*/(/*18200*/"float"/*<18200*/)(/*18199*//*18199*/cons/*<18199*//*18199*/(/*18202*/"double"/*<18202*/)(/*18199*/nil/*<18199*/)/*<18199*/)/*<18199*/)/*<18195*/)(/*17885*//*17885*/cons/*<17885*//*17885*/(/*18208*//*18209*/$co/*<18209*//*18208*/(/*18210*/"floating"/*<18210*/)(/*18212*//*18212*/cons/*<18212*//*18212*/(/*18213*/"float"/*<18213*/)(/*18212*//*18212*/cons/*<18212*//*18212*/(/*18215*/"double"/*<18215*/)(/*18212*/nil/*<18212*/)/*<18212*/)/*<18212*/)/*<18208*/)(/*17885*//*17885*/cons/*<17885*//*17885*/(/*18217*//*18218*/$co/*<18218*//*18217*/(/*18219*/"realfrac"/*<18219*/)(/*18221*//*18221*/cons/*<18221*//*18221*/(/*18222*/"float"/*<18222*/)(/*18221*//*18221*/cons/*<18221*//*18221*/(/*18225*/"double"/*<18225*/)(/*18221*/nil/*<18221*/)/*<18221*/)/*<18221*/)/*<18217*/)(/*17885*//*17885*/cons/*<17885*//*17885*/(/*18231*//*18232*/$co/*<18232*//*18231*/(/*18233*/"show"/*<18233*/)(/*18235*//*18235*/cons/*<18235*//*18235*/(/*18236*/"unit"/*<18236*/)(/*18235*//*18235*/cons/*<18235*//*18235*/(/*18238*/"char"/*<18238*/)(/*18235*//*18235*/cons/*<18235*//*18235*/(/*18240*/"int"/*<18240*/)(/*18235*//*18235*/cons/*<18235*//*18235*/(/*18242*/"float"/*<18242*/)(/*18235*//*18235*/cons/*<18235*//*18235*/(/*18244*/"double"/*<18244*/)(/*18235*//*18235*/cons/*<18235*//*18235*/(/*18246*/"bool"/*<18246*/)(/*18235*//*18235*/cons/*<18235*//*18235*/(/*18293*/"ordering"/*<18293*/)(/*18235*/nil/*<18235*/)/*<18235*/)/*<18235*/)/*<18235*/)/*<18235*/)/*<18235*/)/*<18235*/)/*<18235*/)/*<18231*/)(/*17885*//*17885*/cons/*<17885*//*17885*/(/*20295*//*20296*/$co/*<20296*//*20295*/(/*20297*/"pretty"/*<20297*/)(/*20299*//*20299*/cons/*<20299*//*20299*/(/*20300*/"unit"/*<20300*/)(/*20299*//*20299*/cons/*<20299*//*20299*/(/*20302*/"char"/*<20302*/)(/*20299*//*20299*/cons/*<20299*//*20299*/(/*20304*/"int"/*<20304*/)(/*20299*//*20299*/cons/*<20299*//*20299*/(/*23417*/"string"/*<23417*/)(/*20299*//*20299*/cons/*<20299*//*20299*/(/*20306*/"float"/*<20306*/)(/*20299*//*20299*/cons/*<20299*//*20299*/(/*20308*/"double"/*<20308*/)(/*20299*//*20299*/cons/*<20299*//*20299*/(/*20310*/"bool"/*<20310*/)(/*20299*//*20299*/cons/*<20299*//*20299*/(/*20312*/"ordering"/*<20312*/)(/*20299*/nil/*<20299*/)/*<20299*/)/*<20299*/)/*<20299*/)/*<20299*/)/*<20299*/)/*<20299*/)/*<20299*/)/*<20299*/)/*<20295*/)(/*17885*//*17885*/cons/*<17885*//*17885*/(/*18298*//*18299*/$co/*<18299*//*18298*/(/*18300*/"ix"/*<18300*/)(/*18302*//*18302*/cons/*<18302*//*18302*/(/*18303*/"unit"/*<18303*/)(/*18302*//*18302*/cons/*<18302*//*18302*/(/*18305*/"char"/*<18305*/)(/*18302*//*18302*/cons/*<18302*//*18302*/(/*18307*/"int"/*<18307*/)(/*18302*//*18302*/cons/*<18302*//*18302*/(/*18309*/"bool"/*<18309*/)(/*18302*//*18302*/cons/*<18302*//*18302*/(/*18311*/"ordering"/*<18311*/)(/*18302*/nil/*<18302*/)/*<18302*/)/*<18302*/)/*<18302*/)/*<18302*/)/*<18302*/)/*<18298*/)(/*17885*/nil/*<17885*/)/*<17885*/)/*<17885*/)/*<17885*/)/*<17885*/)/*<17885*/)/*<17885*/)/*<17885*/)/*<17885*/)/*<17885*/)/*<17885*/)/*<17885*/)/*<17886*/)/*<17919*/)/*<17921*/)/*<17921*/)/*<17921*/)/*<17921*/)/*<17921*/)/*<17921*/)/*<17921*/)/*<17921*/)/*<17921*/)/*<17921*/)/*<17921*/)/*<17921*/)/*<17921*/)/*<17921*/)/*<17921*/)/*<17921*/)/*<17921*/)/*<17921*/)/*<17921*/)/*<17921*/)/*<17921*/)/*<17921*/
};
throw new Error('let pattern not matched 18318. ' + valueToString($target));})(/*!*/)
};
throw new Error('let pattern not matched 18313. ' + valueToString($target));})(/*!*/)
};
throw new Error('let pattern not matched 18279. ' + valueToString($target));})(/*!*/)
};
throw new Error('let pattern not matched 18273. ' + valueToString($target));})(/*!*/)
};
throw new Error('let pattern not matched 18269. ' + valueToString($target));})(/*!*/)
};
throw new Error('let pattern not matched 18265. ' + valueToString($target));})(/*!*/)
};
throw new Error('let pattern not matched 18253. ' + valueToString($target));})(/*!*/)
};
throw new Error('let pattern not matched 18248. ' + valueToString($target));})(/*!*/)
};
throw new Error('let pattern not matched 17855. ' + valueToString($target));})(/*!*/)
};
throw new Error('let pattern not matched 17804. ' + valueToString($target));})(/*!*/)
};
throw new Error('let pattern not matched 18139. ' + valueToString($target));})(/*!*/)
};
throw new Error('let pattern not matched 18020. ' + valueToString($target));})(/*!*/)
};
throw new Error('let pattern not matched 18005. ' + valueToString($target));})(/*!*/)/*<17650*/;

const builtin_assumptions = /*17020*/(function let_17020() {const $target = /*17445*//*17446*/tmap/*<17446*//*17445*/(/*17447*/g0/*<17447*/)(/*17448*/g1/*<17448*/)/*<17445*/;
{
let map01 = $target;
return (function let_17020() {const $target = /*17103*//*17104*/generic/*<17104*//*17103*/(/*17105*//*17105*/cons/*<17105*//*17105*/(/*17106*/"num"/*<17106*/)(/*17105*/nil/*<17105*/)/*<17105*/)(/*17108*//*17109*/tfns/*<17109*//*17108*/(/*17110*//*17110*/cons/*<17110*//*17110*/(/*17111*/g0/*<17111*/)(/*17110*//*17110*/cons/*<17110*//*17110*/(/*17112*/g0/*<17112*/)(/*17110*/nil/*<17110*/)/*<17110*/)/*<17110*/)(/*17113*/g0/*<17113*/)/*<17108*/)/*<17103*/;
{
let biNum = $target;
return (function let_17020() {const $target = /*17584*//*17585*/generic/*<17585*//*17584*/(/*17586*//*17586*/cons/*<17586*//*17586*/(/*17587*/"num"/*<17587*/)(/*17586*/nil/*<17586*/)/*<17586*/)(/*17589*//*17590*/tfn/*<17590*//*17589*/(/*17591*/g0/*<17591*/)(/*17592*/g0/*<17592*/)/*<17589*/)/*<17584*/;
{
let uNum = $target;
return (function let_17020() {const $target = /*17123*//*17124*/generic/*<17124*//*17123*/(/*17125*//*17125*/cons/*<17125*//*17125*/(/*17126*/"ord"/*<17126*/)(/*17125*/nil/*<17125*/)/*<17125*/)(/*17128*//*17129*/tfns/*<17129*//*17128*/(/*17130*//*17130*/cons/*<17130*//*17130*/(/*17131*/g0/*<17131*/)(/*17130*//*17130*/cons/*<17130*//*17130*/(/*17132*/g0/*<17132*/)(/*17130*/nil/*<17130*/)/*<17130*/)/*<17130*/)(/*17133*/tbool/*<17133*/)/*<17128*/)/*<17123*/;
{
let boolOrd = $target;
return (function let_17020() {const $target = /*17156*//*17157*/generic/*<17157*//*17156*/(/*17158*//*17158*/cons/*<17158*//*17158*/(/*17159*/"eq"/*<17159*/)(/*17158*/nil/*<17158*/)/*<17158*/)(/*17161*//*17162*/tfns/*<17162*//*17161*/(/*17163*//*17163*/cons/*<17163*//*17163*/(/*17164*/g0/*<17164*/)(/*17163*//*17163*/cons/*<17163*//*17163*/(/*17166*/g0/*<17166*/)(/*17163*/nil/*<17163*/)/*<17163*/)/*<17163*/)(/*17167*/tbool/*<17167*/)/*<17161*/)/*<17156*/;
{
let boolEq = $target;
return (function let_17020() {const $target = /*17306*//*17307*/generics/*<17307*//*17306*/(/*17422*//*17422*/cons/*<17422*//*17422*/(/*17308*//*17308*/cons/*<17308*//*17308*/(/*17309*/"ord"/*<17309*/)(/*17308*/nil/*<17308*/)/*<17308*/)(/*17422*//*17422*/cons/*<17422*//*17422*/(/*17311*/nil/*<17311*/)(/*17422*/nil/*<17422*/)/*<17422*/)/*<17422*/)/*<17306*/;
{
let kv = $target;
return (function let_17020() {const $target = /*18328*/generics/*<18328*/;
{
let g = $target;
return (function let_17020() {const $target = /*20336*//*20337*/generics/*<20337*//*20336*/(/*20338*/nil/*<20338*/)/*<20336*/;
{
let con = $target;
return (function let_17020() {const $target = /*18669*//*18670*/generic/*<18670*//*18669*/(/*18671*//*18671*/cons/*<18671*//*18671*/(/*18672*/"floating"/*<18672*/)(/*18671*/nil/*<18671*/)/*<18671*/)/*<18669*/;
{
let float = $target;
return (function let_17020() {const $target = /*18680*//*18681*/float/*<18681*//*18680*/(/*18682*//*18683*/tfn/*<18683*//*18682*/(/*18684*/g0/*<18684*/)(/*18685*/g0/*<18685*/)/*<18682*/)/*<18680*/;
{
let floatUn = $target;
return /*17530*//*17531*/map/*<17531*//*17530*/(/*19909*/tuple_assump/*<19909*/)(/*17011*//*17011*/cons/*<17011*//*17011*/(/*17016*//*17017*/$co/*<17017*//*17016*/(/*17018*/"+"/*<17018*/)(/*17025*/biNum/*<17025*/)/*<17016*/)(/*17011*//*17011*/cons/*<17011*//*17011*/(/*17100*//*17117*/$co/*<17117*//*17100*/(/*17114*/"-"/*<17114*/)(/*17116*/biNum/*<17116*/)/*<17100*/)(/*17011*//*17011*/cons/*<17011*//*17011*/(/*17561*//*17562*/$co/*<17562*//*17561*/(/*17563*/"*"/*<17563*/)(/*17565*/biNum/*<17565*/)/*<17561*/)(/*17011*//*17011*/cons/*<17011*//*17011*/(/*17568*//*17569*/$co/*<17569*//*17568*/(/*17570*/"negate"/*<17570*/)(/*17572*/uNum/*<17572*/)/*<17568*/)(/*17011*//*17011*/cons/*<17011*//*17011*/(/*17593*//*17594*/$co/*<17594*//*17593*/(/*17595*/"abs"/*<17595*/)(/*17597*/uNum/*<17597*/)/*<17593*/)(/*17011*//*17011*/cons/*<17011*//*17011*/(/*17598*//*17599*/$co/*<17599*//*17598*/(/*17600*/"fromInt"/*<17600*/)(/*17602*//*17603*/generic/*<17603*//*17602*/(/*17604*//*17604*/cons/*<17604*//*17604*/(/*17605*/"num"/*<17605*/)(/*17604*/nil/*<17604*/)/*<17604*/)(/*17607*//*17608*/tfn/*<17608*//*17607*/(/*17609*/tint/*<17609*/)(/*17610*/g0/*<17610*/)/*<17607*/)/*<17602*/)/*<17598*/)(/*17011*//*17011*/cons/*<17011*//*17011*/(/*18548*//*18549*/$co/*<18549*//*18548*/(/*18550*/"toInt"/*<18550*/)(/*18552*//*18553*/generic/*<18553*//*18552*/(/*18554*//*18554*/cons/*<18554*//*18554*/(/*18555*/"integral"/*<18555*/)(/*18554*/nil/*<18554*/)/*<18554*/)(/*18557*//*18558*/tfn/*<18558*//*18557*/(/*18562*/g0/*<18562*/)(/*18559*/tint/*<18559*/)/*<18557*/)/*<18552*/)/*<18548*/)(/*17011*//*17011*/cons/*<17011*//*17011*/(/*18563*//*18564*/$co/*<18564*//*18563*/(/*18565*/"/"/*<18565*/)(/*18567*//*18568*/generic/*<18568*//*18567*/(/*18569*//*18569*/cons/*<18569*//*18569*/(/*18570*/"fractional"/*<18570*/)(/*18569*/nil/*<18569*/)/*<18569*/)(/*18572*//*18573*/tfns/*<18573*//*18572*/(/*18575*//*18575*/cons/*<18575*//*18575*/(/*18576*/g0/*<18576*/)(/*18575*//*18575*/cons/*<18575*//*18575*/(/*18577*/g0/*<18577*/)(/*18575*/nil/*<18575*/)/*<18575*/)/*<18575*/)(/*18578*/g0/*<18578*/)/*<18572*/)/*<18567*/)/*<18563*/)(/*17011*//*17011*/cons/*<17011*//*17011*/(/*18579*//*18580*/$co/*<18580*//*18579*/(/*18581*/"pi"/*<18581*/)(/*18583*//*18584*/float/*<18584*//*18583*/(/*18589*/g0/*<18589*/)/*<18583*/)/*<18579*/)(/*17011*//*17011*/cons/*<17011*//*17011*/(/*18590*//*18591*/$co/*<18591*//*18590*/(/*18592*/"exp"/*<18592*/)(/*18594*/floatUn/*<18594*/)/*<18590*/)(/*17011*//*17011*/cons/*<17011*//*17011*/(/*18603*//*18604*/$co/*<18604*//*18603*/(/*18605*/"log"/*<18605*/)(/*18607*/floatUn/*<18607*/)/*<18603*/)(/*17011*//*17011*/cons/*<17011*//*17011*/(/*18616*//*18617*/$co/*<18617*//*18616*/(/*18618*/"sqrt"/*<18618*/)(/*18620*/floatUn/*<18620*/)/*<18616*/)(/*17011*//*17011*/cons/*<17011*//*17011*/(/*18629*//*18630*/$co/*<18630*//*18629*/(/*18631*/"**"/*<18631*/)(/*18633*//*18634*/float/*<18634*//*18633*/(/*18638*//*18639*/tfns/*<18639*//*18638*/(/*18640*//*18640*/cons/*<18640*//*18640*/(/*18641*/g0/*<18641*/)(/*18640*//*18640*/cons/*<18640*//*18640*/(/*18642*/g0/*<18642*/)(/*18640*/nil/*<18640*/)/*<18640*/)/*<18640*/)(/*18643*/g0/*<18643*/)/*<18638*/)/*<18633*/)/*<18629*/)(/*17011*//*17011*/cons/*<17011*//*17011*/(/*18644*//*18645*/$co/*<18645*//*18644*/(/*18646*/"logBase"/*<18646*/)(/*18648*//*18649*/float/*<18649*//*18648*/(/*18653*//*18654*/tfns/*<18654*//*18653*/(/*18655*//*18655*/cons/*<18655*//*18655*/(/*18656*/g0/*<18656*/)(/*18655*//*18655*/cons/*<18655*//*18655*/(/*18657*/g0/*<18657*/)(/*18655*/nil/*<18655*/)/*<18655*/)/*<18655*/)(/*18658*/g0/*<18658*/)/*<18653*/)/*<18648*/)/*<18644*/)(/*17011*//*17011*/cons/*<17011*//*17011*/(/*18659*//*18660*/$co/*<18660*//*18659*/(/*18661*/"sin"/*<18661*/)(/*18663*/floatUn/*<18663*/)/*<18659*/)(/*17011*//*17011*/cons/*<17011*//*17011*/(/*18686*//*18687*/$co/*<18687*//*18686*/(/*18688*/"cos"/*<18688*/)(/*18690*/floatUn/*<18690*/)/*<18686*/)(/*17011*//*17011*/cons/*<17011*//*17011*/(/*18691*//*18692*/$co/*<18692*//*18691*/(/*18693*/"tan"/*<18693*/)(/*18695*/floatUn/*<18695*/)/*<18691*/)(/*17011*//*17011*/cons/*<17011*//*17011*/(/*17118*//*17119*/$co/*<17119*//*17118*/(/*17120*/">"/*<17120*/)(/*17134*/boolOrd/*<17134*/)/*<17118*/)(/*17011*//*17011*/cons/*<17011*//*17011*/(/*17135*//*17136*/$co/*<17136*//*17135*/(/*17137*/">="/*<17137*/)(/*17139*/boolOrd/*<17139*/)/*<17135*/)(/*17011*//*17011*/cons/*<17011*//*17011*/(/*17140*//*17141*/$co/*<17141*//*17140*/(/*17142*/"<"/*<17142*/)(/*17144*/boolOrd/*<17144*/)/*<17140*/)(/*17011*//*17011*/cons/*<17011*//*17011*/(/*17145*//*17146*/$co/*<17146*//*17145*/(/*17147*/"<="/*<17147*/)(/*17149*/boolOrd/*<17149*/)/*<17145*/)(/*17011*//*17011*/cons/*<17011*//*17011*/(/*18493*//*18494*/$co/*<18494*//*18493*/(/*18495*/"max"/*<18495*/)(/*18497*//*18498*/generic/*<18498*//*18497*/(/*18499*//*18499*/cons/*<18499*//*18499*/(/*18501*/"ord"/*<18501*/)(/*18499*/nil/*<18499*/)/*<18499*/)(/*18503*//*18504*/tfns/*<18504*//*18503*/(/*18505*//*18505*/cons/*<18505*//*18505*/(/*18506*/g0/*<18506*/)(/*18505*//*18505*/cons/*<18505*//*18505*/(/*18507*/g0/*<18507*/)(/*18505*/nil/*<18505*/)/*<18505*/)/*<18505*/)(/*18508*/g0/*<18508*/)/*<18503*/)/*<18497*/)/*<18493*/)(/*17011*//*17011*/cons/*<17011*//*17011*/(/*18510*//*18511*/$co/*<18511*//*18510*/(/*18512*/"min"/*<18512*/)(/*18514*//*18515*/generic/*<18515*//*18514*/(/*18516*//*18516*/cons/*<18516*//*18516*/(/*18517*/"ord"/*<18517*/)(/*18516*/nil/*<18516*/)/*<18516*/)(/*18519*//*18520*/tfns/*<18520*//*18519*/(/*18521*//*18521*/cons/*<18521*//*18521*/(/*18522*/g0/*<18522*/)(/*18521*//*18521*/cons/*<18521*//*18521*/(/*18523*/g0/*<18523*/)(/*18521*/nil/*<18521*/)/*<18521*/)/*<18521*/)(/*18524*/g0/*<18524*/)/*<18519*/)/*<18514*/)/*<18510*/)(/*17011*//*17011*/cons/*<17011*//*17011*/(/*18525*//*18526*/$co/*<18526*//*18525*/(/*18527*/"compare"/*<18527*/)(/*18529*//*18530*/generic/*<18530*//*18529*/(/*18531*//*18531*/cons/*<18531*//*18531*/(/*18532*/"ord"/*<18532*/)(/*18531*/nil/*<18531*/)/*<18531*/)(/*18534*//*18535*/tfns/*<18535*//*18534*/(/*18536*//*18536*/cons/*<18536*//*18536*/(/*18537*/g0/*<18537*/)(/*18536*//*18536*/cons/*<18536*//*18536*/(/*18538*/g0/*<18538*/)(/*18536*/nil/*<18536*/)/*<18536*/)/*<18536*/)(/*18539*//*18540*/tcon/*<18540*//*18539*/(/*18541*//*18542*/tycon/*<18542*//*18541*/(/*18543*/"ordering"/*<18543*/)(/*18545*/star/*<18545*/)/*<18541*/)(/*18546*/-1/*<18546*/)/*<18539*/)/*<18534*/)/*<18529*/)/*<18525*/)(/*17011*//*17011*/cons/*<17011*//*17011*/(/*17150*//*17151*/$co/*<17151*//*17150*/(/*17152*/"="/*<17152*/)(/*17154*/boolEq/*<17154*/)/*<17150*/)(/*17011*//*17011*/cons/*<17011*//*17011*/(/*17168*//*17171*/$co/*<17171*//*17168*/(/*17172*/"!="/*<17172*/)(/*17174*/boolEq/*<17174*/)/*<17168*/)(/*17011*//*17011*/cons/*<17011*//*17011*/(/*17175*//*17176*/$co/*<17176*//*17175*/(/*17177*/"show"/*<17177*/)(/*17179*//*17180*/generic/*<17180*//*17179*/(/*17181*//*17181*/cons/*<17181*//*17181*/(/*17182*/"show"/*<17182*/)(/*17181*/nil/*<17181*/)/*<17181*/)(/*17184*//*17185*/tfn/*<17185*//*17184*/(/*17186*/g0/*<17186*/)(/*17187*/tstring/*<17187*/)/*<17184*/)/*<17179*/)/*<17175*/)(/*17011*//*17011*/cons/*<17011*//*17011*/(/*18696*//*18697*/$co/*<18697*//*18696*/(/*18698*/"range"/*<18698*/)(/*18700*//*18701*/generic/*<18701*//*18700*/(/*18702*//*18702*/cons/*<18702*//*18702*/(/*18703*/"ix"/*<18703*/)(/*18702*/nil/*<18702*/)/*<18702*/)(/*18705*//*18706*/tfn/*<18706*//*18705*/(/*18707*//*18708*/mkpair/*<18708*//*18707*/(/*18709*/g0/*<18709*/)(/*18710*/g0/*<18710*/)/*<18707*/)(/*18711*//*18712*/mklist/*<18712*//*18711*/(/*18713*/g0/*<18713*/)/*<18711*/)/*<18705*/)/*<18700*/)/*<18696*/)(/*17011*//*17011*/cons/*<17011*//*17011*/(/*18714*//*18715*/$co/*<18715*//*18714*/(/*18716*/"index"/*<18716*/)(/*18718*//*18719*/generic/*<18719*//*18718*/(/*18720*//*18720*/cons/*<18720*//*18720*/(/*18721*/"ix"/*<18721*/)(/*18720*/nil/*<18720*/)/*<18720*/)(/*18723*//*18724*/tfns/*<18724*//*18723*/(/*18727*//*18727*/cons/*<18727*//*18727*/(/*18728*//*18729*/mkpair/*<18729*//*18728*/(/*18730*/g0/*<18730*/)(/*18731*/g0/*<18731*/)/*<18728*/)(/*18727*//*18727*/cons/*<18727*//*18727*/(/*18732*/g0/*<18732*/)(/*18727*/nil/*<18727*/)/*<18727*/)/*<18727*/)(/*18733*/tint/*<18733*/)/*<18723*/)/*<18718*/)/*<18714*/)(/*17011*//*17011*/cons/*<17011*//*17011*/(/*18734*//*18735*/$co/*<18735*//*18734*/(/*18736*/"inRange"/*<18736*/)(/*18738*//*18739*/generic/*<18739*//*18738*/(/*18740*//*18740*/cons/*<18740*//*18740*/(/*18741*/"ix"/*<18741*/)(/*18740*/nil/*<18740*/)/*<18740*/)(/*18743*//*18744*/tfns/*<18744*//*18743*/(/*18745*//*18745*/cons/*<18745*//*18745*/(/*18746*//*18747*/mkpair/*<18747*//*18746*/(/*18748*/g0/*<18748*/)(/*18749*/g0/*<18749*/)/*<18746*/)(/*18745*//*18745*/cons/*<18745*//*18745*/(/*18750*/g0/*<18750*/)(/*18745*/nil/*<18745*/)/*<18745*/)/*<18745*/)(/*18751*/tbool/*<18751*/)/*<18743*/)/*<18738*/)/*<18734*/)(/*17011*//*17011*/cons/*<17011*//*17011*/(/*18752*//*18753*/$co/*<18753*//*18752*/(/*18754*/"rangeSize"/*<18754*/)(/*18756*//*18757*/generic/*<18757*//*18756*/(/*18758*//*18758*/cons/*<18758*//*18758*/(/*18759*/"ix"/*<18759*/)(/*18758*/nil/*<18758*/)/*<18758*/)(/*18761*//*18762*/tfns/*<18762*//*18761*/(/*18763*//*18763*/cons/*<18763*//*18763*/(/*18766*//*18767*/mkpair/*<18767*//*18766*/(/*18768*/g0/*<18768*/)(/*18769*/g0/*<18769*/)/*<18766*/)(/*18763*/nil/*<18763*/)/*<18763*/)(/*18770*/tint/*<18770*/)/*<18761*/)/*<18756*/)/*<18752*/)(/*17011*//*17011*/cons/*<17011*//*17011*/(/*18773*//*18774*/$co/*<18774*//*18773*/(/*18775*/"return"/*<18775*/)(/*18777*//*18778*/$co/*<18778*//*18777*/(/*18779*//*18779*/cons/*<18779*//*18779*/(/*18780*//*18781*/kfun/*<18781*//*18780*/(/*18782*/star/*<18782*/)(/*18783*/star/*<18783*/)/*<18780*/)(/*18779*//*18779*/cons/*<18779*//*18779*/(/*18784*/star/*<18784*/)(/*18779*/nil/*<18779*/)/*<18779*/)/*<18779*/)(/*18785*//*18786*/$eq$gt/*<18786*//*18785*/(/*18787*//*18787*/cons/*<18787*//*18787*/(/*18788*//*18789*/isin/*<18789*//*18788*/(/*18790*/"monad"/*<18790*/)(/*18792*/g0/*<18792*/)/*<18788*/)(/*18787*/nil/*<18787*/)/*<18787*/)(/*18793*//*18794*/tfn/*<18794*//*18793*/(/*18795*/g1/*<18795*/)(/*18796*//*18797*/tapp/*<18797*//*18796*/(/*18798*/g0/*<18798*/)(/*18799*/g1/*<18799*/)(/*18800*/-1/*<18800*/)/*<18796*/)/*<18793*/)/*<18785*/)/*<18777*/)/*<18773*/)(/*17011*//*17011*/cons/*<17011*//*17011*/(/*18801*//*18802*/$co/*<18802*//*18801*/(/*18803*/">>="/*<18803*/)(/*18805*//*18806*/$co/*<18806*//*18805*/(/*18807*//*18807*/cons/*<18807*//*18807*/(/*18808*//*18809*/kfun/*<18809*//*18808*/(/*18810*/star/*<18810*/)(/*18811*/star/*<18811*/)/*<18808*/)(/*18807*//*18807*/cons/*<18807*//*18807*/(/*18812*/star/*<18812*/)(/*18807*//*18807*/cons/*<18807*//*18807*/(/*18813*/star/*<18813*/)(/*18807*/nil/*<18807*/)/*<18807*/)/*<18807*/)/*<18807*/)(/*18814*//*18815*/$eq$gt/*<18815*//*18814*/(/*18816*//*18816*/cons/*<18816*//*18816*/(/*18817*//*18818*/isin/*<18818*//*18817*/(/*18819*/"monad"/*<18819*/)(/*18821*/g0/*<18821*/)/*<18817*/)(/*18816*/nil/*<18816*/)/*<18816*/)(/*18822*//*18823*/tfns/*<18823*//*18822*/(/*18824*//*18824*/cons/*<18824*//*18824*/(/*18825*//*18826*/tapp/*<18826*//*18825*/(/*18827*/g0/*<18827*/)(/*18828*/g1/*<18828*/)(/*18829*/-1/*<18829*/)/*<18825*/)(/*18824*//*18824*/cons/*<18824*//*18824*/(/*18830*//*18831*/tfn/*<18831*//*18830*/(/*18832*/g1/*<18832*/)(/*18833*//*18834*/tapp/*<18834*//*18833*/(/*18835*/g0/*<18835*/)(/*18836*/g2/*<18836*/)(/*18837*/-1/*<18837*/)/*<18833*/)/*<18830*/)(/*18824*/nil/*<18824*/)/*<18824*/)/*<18824*/)(/*18838*//*18839*/tapp/*<18839*//*18838*/(/*18840*/g0/*<18840*/)(/*18841*/g2/*<18841*/)(/*18842*/-1/*<18842*/)/*<18838*/)/*<18822*/)/*<18814*/)/*<18805*/)/*<18801*/)(/*17011*//*17011*/cons/*<17011*//*17011*/(/*18844*//*18845*/$co/*<18845*//*18844*/(/*18846*/">>"/*<18846*/)(/*18848*//*18849*/$co/*<18849*//*18848*/(/*18850*//*18850*/cons/*<18850*//*18850*/(/*18851*//*18852*/kfun/*<18852*//*18851*/(/*18853*/star/*<18853*/)(/*18854*/star/*<18854*/)/*<18851*/)(/*18850*//*18850*/cons/*<18850*//*18850*/(/*18855*/star/*<18855*/)(/*18850*//*18850*/cons/*<18850*//*18850*/(/*18856*/star/*<18856*/)(/*18850*/nil/*<18850*/)/*<18850*/)/*<18850*/)/*<18850*/)(/*18857*//*18858*/$eq$gt/*<18858*//*18857*/(/*18859*//*18859*/cons/*<18859*//*18859*/(/*18860*//*18861*/isin/*<18861*//*18860*/(/*18862*/"monad"/*<18862*/)(/*18864*/g0/*<18864*/)/*<18860*/)(/*18859*/nil/*<18859*/)/*<18859*/)(/*18865*//*18867*/tfns/*<18867*//*18865*/(/*18868*//*18868*/cons/*<18868*//*18868*/(/*18869*//*18870*/tapp/*<18870*//*18869*/(/*18871*/g0/*<18871*/)(/*18872*/g1/*<18872*/)(/*18873*/-1/*<18873*/)/*<18869*/)(/*18868*//*18868*/cons/*<18868*//*18868*/(/*18874*//*18875*/tapp/*<18875*//*18874*/(/*18876*/g0/*<18876*/)(/*18877*/g2/*<18877*/)(/*18878*/-1/*<18878*/)/*<18874*/)(/*18868*/nil/*<18868*/)/*<18868*/)/*<18868*/)(/*18879*//*18880*/tapp/*<18880*//*18879*/(/*18881*/g0/*<18881*/)(/*18882*/g2/*<18882*/)(/*18883*/-1/*<18883*/)/*<18879*/)/*<18865*/)/*<18857*/)/*<18848*/)/*<18844*/)(/*17011*//*17011*/cons/*<17011*//*17011*/(/*18884*//*18885*/$co/*<18885*//*18884*/(/*18886*/"fail"/*<18886*/)(/*18888*//*18889*/$co/*<18889*//*18888*/(/*18890*//*18890*/cons/*<18890*//*18890*/(/*18891*//*18892*/kfun/*<18892*//*18891*/(/*18893*/star/*<18893*/)(/*18894*/star/*<18894*/)/*<18891*/)(/*18890*//*18890*/cons/*<18890*//*18890*/(/*18895*/star/*<18895*/)(/*18890*/nil/*<18890*/)/*<18890*/)/*<18890*/)(/*18896*//*18897*/$eq$gt/*<18897*//*18896*/(/*18898*//*18898*/cons/*<18898*//*18898*/(/*18899*//*18900*/isin/*<18900*//*18899*/(/*18901*/"monad"/*<18901*/)(/*18903*/g0/*<18903*/)/*<18899*/)(/*18898*/nil/*<18898*/)/*<18898*/)(/*18904*//*18905*/tfn/*<18905*//*18904*/(/*18906*/tstring/*<18906*/)(/*18907*//*18908*/tapp/*<18908*//*18907*/(/*18909*/g0/*<18909*/)(/*18910*/g1/*<18910*/)(/*18911*/-1/*<18911*/)/*<18907*/)/*<18904*/)/*<18896*/)/*<18888*/)/*<18884*/)(/*17011*//*17011*/cons/*<17011*//*17011*/(/*17189*//*17190*/$co/*<17190*//*17189*/(/*17191*/"map/nil"/*<17191*/)(/*17223*//*17224*/kv/*<17224*//*17223*/(/*17291*//*17292*/tmap/*<17292*//*17291*/(/*17293*/g0/*<17293*/)(/*17294*/g1/*<17294*/)/*<17291*/)/*<17223*/)/*<17189*/)(/*17011*//*17011*/cons/*<17011*//*17011*/(/*17295*//*17296*/$co/*<17296*//*17295*/(/*17297*/"map/set"/*<17297*/)(/*17299*//*17300*/kv/*<17300*//*17299*/(/*17301*//*17312*/tfns/*<17312*//*17301*/(/*17314*//*17314*/cons/*<17314*//*17314*/(/*17315*/map01/*<17315*/)(/*17314*//*17314*/cons/*<17314*//*17314*/(/*17319*/g0/*<17319*/)(/*17314*//*17314*/cons/*<17314*//*17314*/(/*17320*/g1/*<17320*/)(/*17314*/nil/*<17314*/)/*<17314*/)/*<17314*/)/*<17314*/)(/*17321*/map01/*<17321*/)/*<17301*/)/*<17299*/)/*<17295*/)(/*17011*//*17011*/cons/*<17011*//*17011*/(/*17326*//*17327*/$co/*<17327*//*17326*/(/*17328*/"map/get"/*<17328*/)(/*17330*//*17331*/kv/*<17331*//*17330*/(/*17332*//*17333*/tfns/*<17333*//*17332*/(/*17334*//*17334*/cons/*<17334*//*17334*/(/*17335*/map01/*<17335*/)(/*17334*//*17334*/cons/*<17334*//*17334*/(/*17339*/g0/*<17339*/)(/*17334*/nil/*<17334*/)/*<17334*/)/*<17334*/)(/*17340*/g1/*<17340*/)/*<17332*/)/*<17330*/)/*<17326*/)(/*17011*//*17011*/cons/*<17011*//*17011*/(/*17341*//*17342*/$co/*<17342*//*17341*/(/*17343*/"map/map"/*<17343*/)(/*17345*//*17347*/generics/*<17347*//*17345*/(/*17411*//*17411*/cons/*<17411*//*17411*/(/*17412*//*17412*/cons/*<17412*//*17412*/(/*17413*/"ord"/*<17413*/)(/*17412*/nil/*<17412*/)/*<17412*/)(/*17411*//*17411*/cons/*<17411*//*17411*/(/*17415*/nil/*<17415*/)(/*17411*//*17411*/cons/*<17411*//*17411*/(/*17416*/nil/*<17416*/)(/*17411*/nil/*<17411*/)/*<17411*/)/*<17411*/)/*<17411*/)(/*17348*//*17349*/tfns/*<17349*//*17348*/(/*17350*//*17350*/cons/*<17350*//*17350*/(/*17351*/map01/*<17351*/)(/*17350*//*17350*/cons/*<17350*//*17350*/(/*17355*//*17357*/tfn/*<17357*//*17355*/(/*17358*/g1/*<17358*/)(/*17417*/g2/*<17417*/)/*<17355*/)(/*17350*/nil/*<17350*/)/*<17350*/)/*<17350*/)(/*17418*//*17419*/tmap/*<17419*//*17418*/(/*17420*/g0/*<17420*/)(/*17421*/g2/*<17421*/)/*<17418*/)/*<17348*/)/*<17345*/)/*<17341*/)(/*17011*//*17011*/cons/*<17011*//*17011*/(/*17423*//*17424*/$co/*<17424*//*17423*/(/*17425*/"map/merge"/*<17425*/)(/*17427*//*17428*/kv/*<17428*//*17427*/(/*17429*//*17430*/tfns/*<17430*//*17429*/(/*17431*//*17431*/cons/*<17431*//*17431*/(/*17432*/map01/*<17432*/)(/*17431*//*17431*/cons/*<17431*//*17431*/(/*17436*/map01/*<17436*/)(/*17431*/nil/*<17431*/)/*<17431*/)/*<17431*/)(/*17440*/map01/*<17440*/)/*<17429*/)/*<17427*/)/*<17423*/)(/*17011*//*17011*/cons/*<17011*//*17011*/(/*17457*//*17458*/$co/*<17458*//*17457*/(/*17459*/"map/values"/*<17459*/)(/*17461*//*17462*/kv/*<17462*//*17461*/(/*17463*//*17464*/tfns/*<17464*//*17463*/(/*17465*//*17465*/cons/*<17465*//*17465*/(/*17466*/map01/*<17466*/)(/*17465*/nil/*<17465*/)/*<17465*/)(/*17467*//*17468*/tapp/*<17468*//*17467*/(/*17470*/tlist/*<17470*/)(/*17471*/g1/*<17471*/)(/*17472*/-1/*<17472*/)/*<17467*/)/*<17463*/)/*<17461*/)/*<17457*/)(/*17011*//*17011*/cons/*<17011*//*17011*/(/*17473*//*17474*/$co/*<17474*//*17473*/(/*17475*/"map/keys"/*<17475*/)(/*17477*//*17478*/kv/*<17478*//*17477*/(/*17479*//*17480*/tfns/*<17480*//*17479*/(/*17481*//*17481*/cons/*<17481*//*17481*/(/*17482*/map01/*<17482*/)(/*17481*/nil/*<17481*/)/*<17481*/)(/*17483*//*17484*/tapp/*<17484*//*17483*/(/*17485*/tlist/*<17485*/)(/*17486*/g0/*<17486*/)(/*17487*/-1/*<17487*/)/*<17483*/)/*<17479*/)/*<17477*/)/*<17473*/)(/*17011*//*17011*/cons/*<17011*//*17011*/(/*17488*//*17491*/$co/*<17491*//*17488*/(/*17492*/"map/to-list"/*<17492*/)(/*17494*//*17495*/kv/*<17495*//*17494*/(/*17496*//*17497*/tfns/*<17497*//*17496*/(/*17498*//*17498*/cons/*<17498*//*17498*/(/*17499*/map01/*<17499*/)(/*17498*/nil/*<17498*/)/*<17498*/)(/*17500*//*17503*/tapp/*<17503*//*17500*/(/*17504*/tlist/*<17504*/)(/*17505*//*17506*/mkpair/*<17506*//*17505*/(/*17507*/g0/*<17507*/)(/*17508*/g1/*<17508*/)/*<17505*/)(/*17510*/-1/*<17510*/)/*<17500*/)/*<17496*/)/*<17494*/)/*<17488*/)(/*17011*//*17011*/cons/*<17011*//*17011*/(/*17511*//*17512*/$co/*<17512*//*17511*/(/*17513*/"map/from-list"/*<17513*/)(/*17515*//*17516*/kv/*<17516*//*17515*/(/*17517*//*17518*/tfns/*<17518*//*17517*/(/*17519*//*17519*/cons/*<17519*//*17519*/(/*17521*//*17522*/tapp/*<17522*//*17521*/(/*17523*/tlist/*<17523*/)(/*17524*//*17525*/mkpair/*<17525*//*17524*/(/*17526*/g0/*<17526*/)(/*17527*/g1/*<17527*/)/*<17524*/)(/*17528*/-1/*<17528*/)/*<17521*/)(/*17519*/nil/*<17519*/)/*<17519*/)(/*17529*/map01/*<17529*/)/*<17517*/)/*<17515*/)/*<17511*/)(/*17011*//*17011*/cons/*<17011*//*17011*/(/*18330*//*18331*/$co/*<18331*//*18330*/(/*18332*/"nil"/*<18332*/)(/*18334*//*18335*/g/*<18335*//*18334*/(/*18336*//*18336*/cons/*<18336*//*18336*/(/*18337*/nil/*<18337*/)(/*18336*/nil/*<18336*/)/*<18336*/)(/*18340*//*18341*/mklist/*<18341*//*18340*/(/*18342*/g0/*<18342*/)/*<18340*/)/*<18334*/)/*<18330*/)(/*17011*//*17011*/cons/*<17011*//*17011*/(/*18344*//*18345*/$co/*<18345*//*18344*/(/*18346*/"cons"/*<18346*/)(/*18348*//*18349*/g/*<18349*//*18348*/(/*18350*//*18350*/cons/*<18350*//*18350*/(/*18351*/nil/*<18351*/)(/*18350*/nil/*<18350*/)/*<18350*/)(/*18352*//*18354*/tfns/*<18354*//*18352*/(/*20369*//*20369*/cons/*<20369*//*20369*/(/*18355*/g0/*<18355*/)(/*20369*//*20369*/cons/*<20369*//*20369*/(/*20370*//*20371*/mklist/*<20371*//*20370*/(/*20372*/g0/*<20372*/)/*<20370*/)(/*20369*/nil/*<20369*/)/*<20369*/)/*<20369*/)(/*18356*//*18357*/mklist/*<18357*//*18356*/(/*18358*/g0/*<18358*/)/*<18356*/)/*<18352*/)/*<18348*/)/*<18344*/)(/*17011*//*17011*/cons/*<17011*//*17011*/(/*18359*//*18360*/$co/*<18360*//*18359*/(/*18361*/","/*<18361*/)(/*18363*//*18364*/g/*<18364*//*18363*/(/*18365*//*18365*/cons/*<18365*//*18365*/(/*18366*/nil/*<18366*/)(/*18365*//*18365*/cons/*<18365*//*18365*/(/*18367*/nil/*<18367*/)(/*18365*/nil/*<18365*/)/*<18365*/)/*<18365*/)(/*18368*//*18370*/tfns/*<18370*//*18368*/(/*18372*//*18372*/cons/*<18372*//*18372*/(/*18373*/g0/*<18373*/)(/*18372*//*18372*/cons/*<18372*//*18372*/(/*18374*/g1/*<18374*/)(/*18372*/nil/*<18372*/)/*<18372*/)/*<18372*/)(/*18375*//*18376*/mkpair/*<18376*//*18375*/(/*18377*/g0/*<18377*/)(/*18378*/g1/*<18378*/)/*<18375*/)/*<18368*/)/*<18363*/)/*<18359*/)(/*17011*//*17011*/cons/*<17011*//*17011*/(/*18379*//*18380*/$co/*<18380*//*18379*/(/*18381*/"false"/*<18381*/)(/*18383*//*18384*/con/*<18384*//*18383*/(/*18386*/tbool/*<18386*/)/*<18383*/)/*<18379*/)(/*17011*//*17011*/cons/*<17011*//*17011*/(/*18387*//*18388*/$co/*<18388*//*18387*/(/*18389*/"true"/*<18389*/)(/*18391*//*18392*/con/*<18392*//*18391*/(/*18394*/tbool/*<18394*/)/*<18391*/)/*<18387*/)(/*17011*//*17011*/cons/*<17011*//*17011*/(/*18395*//*18396*/$co/*<18396*//*18395*/(/*18397*/"ok"/*<18397*/)(/*18399*//*18400*/g/*<18400*//*18399*/(/*18401*//*18401*/cons/*<18401*//*18401*/(/*18402*/nil/*<18402*/)(/*18401*//*18401*/cons/*<18401*//*18401*/(/*18411*/nil/*<18411*/)(/*18401*/nil/*<18401*/)/*<18401*/)/*<18401*/)(/*18403*//*18404*/tfn/*<18404*//*18403*/(/*18405*/g0/*<18405*/)(/*18406*//*18408*/tresult/*<18408*//*18406*/(/*18409*/g0/*<18409*/)(/*18410*/g1/*<18410*/)/*<18406*/)/*<18403*/)/*<18399*/)/*<18395*/)(/*17011*//*17011*/cons/*<17011*//*17011*/(/*18412*//*18413*/$co/*<18413*//*18412*/(/*18414*/"err"/*<18414*/)(/*18416*//*18417*/g/*<18417*//*18416*/(/*18418*//*18418*/cons/*<18418*//*18418*/(/*18419*/nil/*<18419*/)(/*18418*//*18418*/cons/*<18418*//*18418*/(/*18420*/nil/*<18420*/)(/*18418*/nil/*<18418*/)/*<18418*/)/*<18418*/)(/*18421*//*18422*/tfn/*<18422*//*18421*/(/*18423*/g1/*<18423*/)(/*18424*//*18425*/tresult/*<18425*//*18424*/(/*18426*/g0/*<18426*/)(/*18427*/g1/*<18427*/)/*<18424*/)/*<18421*/)/*<18416*/)/*<18412*/)(/*17011*//*17011*/cons/*<17011*//*17011*/(/*18428*//*18429*/$co/*<18429*//*18428*/(/*18430*/"LT"/*<18430*/)(/*18432*//*18433*/con/*<18433*//*18432*/(/*18437*//*18438*/mkcon/*<18438*//*18437*/(/*18439*/"ordering"/*<18439*/)/*<18437*/)/*<18432*/)/*<18428*/)(/*17011*//*17011*/cons/*<17011*//*17011*/(/*18441*//*18442*/$co/*<18442*//*18441*/(/*18443*/"EQ"/*<18443*/)(/*18445*//*18446*/con/*<18446*//*18445*/(/*18449*//*18450*/mkcon/*<18450*//*18449*/(/*18451*/"ordering"/*<18451*/)/*<18449*/)/*<18445*/)/*<18441*/)(/*17011*//*17011*/cons/*<17011*//*17011*/(/*18453*//*18454*/$co/*<18454*//*18453*/(/*18455*/"GT"/*<18455*/)(/*18457*//*18458*/con/*<18458*//*18457*/(/*18460*//*18461*/mkcon/*<18461*//*18460*/(/*18462*/"ordering"/*<18462*/)/*<18460*/)/*<18457*/)/*<18453*/)(/*17011*/nil/*<17011*/)/*<17011*/)/*<17011*/)/*<17011*/)/*<17011*/)/*<17011*/)/*<17011*/)/*<17011*/)/*<17011*/)/*<17011*/)/*<17011*/)/*<17011*/)/*<17011*/)/*<17011*/)/*<17011*/)/*<17011*/)/*<17011*/)/*<17011*/)/*<17011*/)/*<17011*/)/*<17011*/)/*<17011*/)/*<17011*/)/*<17011*/)/*<17011*/)/*<17011*/)/*<17011*/)/*<17011*/)/*<17011*/)/*<17011*/)/*<17011*/)/*<17011*/)/*<17011*/)/*<17011*/)/*<17011*/)/*<17011*/)/*<17011*/)/*<17011*/)/*<17011*/)/*<17011*/)/*<17011*/)/*<17011*/)/*<17011*/)/*<17011*/)/*<17011*/)/*<17011*/)/*<17011*/)/*<17011*/)/*<17011*/)/*<17011*/)/*<17011*/)/*<17011*/)/*<17011*/)/*<17011*/)/*<17011*/)/*<17530*/
};
throw new Error('let pattern not matched 18679. ' + valueToString($target));})(/*!*/)
};
throw new Error('let pattern not matched 18668. ' + valueToString($target));})(/*!*/)
};
throw new Error('let pattern not matched 20335. ' + valueToString($target));})(/*!*/)
};
throw new Error('let pattern not matched 18327. ' + valueToString($target));})(/*!*/)
};
throw new Error('let pattern not matched 17305. ' + valueToString($target));})(/*!*/)
};
throw new Error('let pattern not matched 17155. ' + valueToString($target));})(/*!*/)
};
throw new Error('let pattern not matched 17122. ' + valueToString($target));})(/*!*/)
};
throw new Error('let pattern not matched 17583. ' + valueToString($target));})(/*!*/)
};
throw new Error('let pattern not matched 17101. ' + valueToString($target));})(/*!*/)
};
throw new Error('let pattern not matched 17444. ' + valueToString($target));})(/*!*/)/*<17020*/;

const tss_$gts = /*19333*/function name_19333(tss) { return /*19340*//*19341*/joinor/*<19341*//*19340*/(/*19342*/"\n"/*<19342*/)(/*19426*/"no tss"/*<19426*/)(/*19344*//*19345*/map/*<19345*//*19344*/(/*19346*//*19347*/dot/*<19347*//*19346*/(/*19348*//*19349*/joinor/*<19349*//*19348*/(/*19350*/"; "/*<19350*/)(/*19415*/"[empty]"/*<19415*/)/*<19348*/)(/*19352*//*19353*/map/*<19353*//*19352*/(/*19354*/type_$gts/*<19354*/)/*<19352*/)/*<19346*/)(/*19355*/tss/*<19355*/)/*<19344*/)/*<19340*/ }/*<19333*/;

const vps_$gts = /*19356*/function name_19356(vps) { return /*19363*//*19364*/joinor/*<19364*//*19363*/(/*19365*/"\n"/*<19365*/)(/*19424*/"no vps"/*<19424*/)(/*19367*//*19368*/map/*<19368*//*19367*/(/*19369*/function name_19369({0: a, 1: preds}) {
 return /*19376*/`${/*19378*//*19379*/tyvar_$gts/*<19379*//*19378*/(/*19380*/a/*<19380*/)/*<19378*/} ${/*19382*//*19383*/join/*<19383*//*19382*/(/*19384*/";"/*<19384*/)(/*19386*//*19387*/map/*<19387*//*19386*/(/*19388*/pred_$gts/*<19388*/)(/*19389*/preds/*<19389*/)/*<19386*/)/*<19382*/}`/*<19376*/ }/*<19369*/)(/*19391*/vps/*<19391*/)/*<19367*/)/*<19363*/ }/*<19356*/;

const builtin_tenv = /*19811*//*19812*/type_env/*<19812*//*19811*/(/*19813*//*19814*/map$slfrom_list/*<19814*//*19813*/(/*19815*//*19815*/cons/*<19815*//*19815*/(/*19819*//*19820*/$co/*<19820*//*19819*/(/*19821*/"ok"/*<19821*/)(/*19934*//*19935*/tuple_scheme/*<19935*//*19934*/(/*19897*//*19898*/generics/*<19898*//*19897*/(/*19899*//*19899*/cons/*<19899*//*19899*/(/*19900*/nil/*<19900*/)(/*19899*//*19899*/cons/*<19899*//*19899*/(/*19901*/nil/*<19901*/)(/*19899*/nil/*<19899*/)/*<19899*/)/*<19899*/)(/*19902*//*19903*/tfn/*<19903*//*19902*/(/*19904*/g0/*<19904*/)(/*19905*//*19906*/tresult/*<19906*//*19905*/(/*19907*/g0/*<19907*/)(/*19908*/g1/*<19908*/)/*<19905*/)/*<19902*/)/*<19897*/)/*<19934*/)/*<19819*/)(/*19815*//*19815*/cons/*<19815*//*19815*/(/*19937*//*19938*/$co/*<19938*//*19937*/(/*19939*/"err"/*<19939*/)(/*19941*//*19942*/tuple_scheme/*<19942*//*19941*/(/*19943*//*19944*/generics/*<19944*//*19943*/(/*19945*//*19945*/cons/*<19945*//*19945*/(/*19946*/nil/*<19946*/)(/*19945*//*19945*/cons/*<19945*//*19945*/(/*19947*/nil/*<19947*/)(/*19945*/nil/*<19945*/)/*<19945*/)/*<19945*/)(/*19948*//*19949*/tfn/*<19949*//*19948*/(/*19950*/g1/*<19950*/)(/*19951*//*19952*/tresult/*<19952*//*19951*/(/*19953*/g0/*<19953*/)(/*19954*/g1/*<19954*/)/*<19951*/)/*<19948*/)/*<19943*/)/*<19941*/)/*<19937*/)(/*19815*//*19815*/cons/*<19815*//*19815*/(/*23420*//*23421*/$co/*<23421*//*23420*/(/*23422*/"cons"/*<23422*/)(/*23424*//*23425*/tuple_scheme/*<23425*//*23424*/(/*23426*//*23427*/generics/*<23427*//*23426*/(/*23428*//*23428*/cons/*<23428*//*23428*/(/*23429*/nil/*<23429*/)(/*23428*/nil/*<23428*/)/*<23428*/)(/*23431*//*23432*/tfns/*<23432*//*23431*/(/*23456*//*23456*/cons/*<23456*//*23456*/(/*23433*/g0/*<23433*/)(/*23456*//*23456*/cons/*<23456*//*23456*/(/*23457*//*23458*/mklist/*<23458*//*23457*/(/*23459*/g0/*<23459*/)/*<23457*/)(/*23456*/nil/*<23456*/)/*<23456*/)/*<23456*/)(/*23434*//*23435*/mklist/*<23435*//*23434*/(/*23436*/g0/*<23436*/)/*<23434*/)/*<23431*/)/*<23426*/)/*<23424*/)/*<23420*/)(/*19815*//*19815*/cons/*<19815*//*19815*/(/*23440*//*23441*/$co/*<23441*//*23440*/(/*23442*/"nil"/*<23442*/)(/*23444*//*23445*/tuple_scheme/*<23445*//*23444*/(/*23446*//*23447*/generics/*<23447*//*23446*/(/*23448*//*23448*/cons/*<23448*//*23448*/(/*23449*/nil/*<23449*/)(/*23448*/nil/*<23448*/)/*<23448*/)(/*23453*//*23454*/mklist/*<23454*//*23453*/(/*23455*/g0/*<23455*/)/*<23453*/)/*<23446*/)/*<23444*/)/*<23440*/)(/*19815*//*19815*/cons/*<19815*//*19815*/(/*19993*//*19994*/$co/*<19994*//*19993*/(/*19995*/","/*<19995*/)(/*19997*//*19998*/tuple_scheme/*<19998*//*19997*/(/*19999*//*20000*/generics/*<20000*//*19999*/(/*20001*//*20001*/cons/*<20001*//*20001*/(/*20002*/nil/*<20002*/)(/*20001*//*20001*/cons/*<20001*//*20001*/(/*20003*/nil/*<20003*/)(/*20001*/nil/*<20001*/)/*<20001*/)/*<20001*/)(/*20004*//*20005*/tfns/*<20005*//*20004*/(/*20011*//*20011*/cons/*<20011*//*20011*/(/*20006*/g0/*<20006*/)(/*20011*//*20011*/cons/*<20011*//*20011*/(/*20012*/g1/*<20012*/)(/*20011*/nil/*<20011*/)/*<20011*/)/*<20011*/)(/*20007*//*20008*/mkpair/*<20008*//*20007*/(/*20009*/g0/*<20009*/)(/*20010*/g1/*<20010*/)/*<20007*/)/*<20004*/)/*<19999*/)/*<19997*/)/*<19993*/)(/*19815*/nil/*<19815*/)/*<19815*/)/*<19815*/)/*<19815*/)/*<19815*/)/*<19815*/)/*<19813*/)(/*19816*//*19817*/map$slfrom_list/*<19817*//*19816*/(/*19818*//*19818*/cons/*<19818*//*19818*/(/*24235*//*24236*/$co/*<24236*//*24235*/(/*24237*/"int"/*<24237*/)(/*24239*//*24240*/$co/*<24240*//*24239*/(/*24241*/nil/*<24241*/)(/*24242*/set$slnil/*<24242*/)/*<24239*/)/*<24235*/)(/*19818*//*19818*/cons/*<19818*//*19818*/(/*24243*//*24244*/$co/*<24244*//*24243*/(/*24245*/"double"/*<24245*/)(/*24247*//*24248*/$co/*<24248*//*24247*/(/*24249*/nil/*<24249*/)(/*24250*/set$slnil/*<24250*/)/*<24247*/)/*<24243*/)(/*19818*//*19818*/cons/*<19818*//*19818*/(/*24269*//*24270*/$co/*<24270*//*24269*/(/*24271*/"array"/*<24271*/)(/*24273*//*24274*/$co/*<24274*//*24273*/(/*24275*//*24275*/cons/*<24275*//*24275*/(/*24276*/star/*<24276*/)(/*24275*/nil/*<24275*/)/*<24275*/)(/*24277*//*24278*/set$slfrom_list/*<24278*//*24277*/(/*24279*//*24279*/cons/*<24279*//*24279*/(/*24280*/"cons"/*<24280*/)(/*24279*//*24279*/cons/*<24279*//*24279*/(/*24282*/"nil"/*<24282*/)(/*24279*/nil/*<24279*/)/*<24279*/)/*<24279*/)/*<24277*/)/*<24273*/)/*<24269*/)(/*19818*//*19818*/cons/*<19818*//*19818*/(/*24251*//*24252*/$co/*<24252*//*24251*/(/*24253*/"result"/*<24253*/)(/*24260*//*24261*/$co/*<24261*//*24260*/(/*24255*//*24255*/cons/*<24255*//*24255*/(/*24256*/star/*<24256*/)(/*24255*//*24255*/cons/*<24255*//*24255*/(/*24257*/star/*<24257*/)(/*24255*/nil/*<24255*/)/*<24255*/)/*<24255*/)(/*24262*//*24263*/set$slfrom_list/*<24263*//*24262*/(/*24264*//*24264*/cons/*<24264*//*24264*/(/*24265*/"ok"/*<24265*/)(/*24264*//*24264*/cons/*<24264*//*24264*/(/*24267*/"err"/*<24267*/)(/*24264*/nil/*<24264*/)/*<24264*/)/*<24264*/)/*<24262*/)/*<24260*/)/*<24251*/)(/*19818*/nil/*<19818*/)/*<19818*/)/*<19818*/)/*<19818*/)/*<19818*/)/*<19816*/)(/*21145*/map$slnil/*<21145*/)/*<19811*/;

const infer_types = /*20851*/function name_20851(full) { return function name_20851(aliases) { return function name_20851(deftypes) { return /*20863*/(function let_20863() {const $target = /*20869*//*20870*/map/*<20870*//*20869*/(/*20872*/function name_20872({0: name, 1: args, 2: type}) {

 return /*20875*/name/*<20875*/ }/*<20872*/)(/*20871*/aliases/*<20871*/)/*<20869*/;
{
let names = $target;
return /*20928*//*20929*/foldl/*<20929*//*20928*/(/*20881*//*20883*/foldl/*<20883*//*20881*/(/*20884*/full/*<20884*/)(/*20885*/aliases/*<20885*/)(/*20886*/infer_alias/*<20886*/)/*<20881*/)(/*20930*/deftypes/*<20930*/)(/*20931*/infer_deftype/*<20931*/)/*<20928*/
};
throw new Error('let pattern not matched 20868. ' + valueToString($target));})(/*!*/)/*<20863*/ } } }/*<20851*/;

const $gt$gt$eq = /*21140*/ti_then/*<21140*/;

const unify_err = /*21204*/function name_21204(t1) { return function name_21204(t2) { return function name_21204(e) { return /*21213*//*21214*/err/*<21214*//*21213*/(/*21215*/`Unable to unify ${/*21217*//*21218*/type_debug_$gts/*<21218*//*21217*/(/*21219*/t1/*<21219*/)/*<21217*/} and ${/*21221*//*21222*/type_debug_$gts/*<21222*//*21221*/(/*21223*/t2/*<21223*/)/*<21221*/}\n-> ${/*21225*/e/*<21225*/}`/*<21215*/)/*<21213*/ } } }/*<21204*/;

const $lt_ = /*21251*/ti_return/*<21251*/;

const next_idx = /*21266*//*21267*/TI/*<21267*//*21266*/(/*21268*/function name_21268(s) { return function name_21268(t) { return function name_21268(n) { return /*21275*//*21276*/ok/*<21276*//*21275*/(/*21277*//*21278*/$co$co$co/*<21278*//*21277*/(/*21279*/s/*<21279*/)(/*21280*/t/*<21280*/)(/*21281*//*21282*/$pl/*<21282*//*21281*/(/*21283*/n/*<21283*/)(/*21284*/1/*<21284*/)/*<21281*/)(/*21285*/n/*<21285*/)/*<21277*/)/*<21275*/ } } }/*<21268*/)/*<21266*/;

const new_tvar = /*21286*/function name_21286(kind) { return /*21292*//*21293*/$gt$gt$eq/*<21293*//*21292*/(/*21299*/next_idx/*<21299*/)(/*21292*/function name_21292(idx) { return /*21310*//*21311*/$lt_/*<21311*//*21310*/(/*21300*//*21301*/tvar/*<21301*//*21300*/(/*21305*//*21302*/tyvar/*<21302*//*21305*/(/*21307*//*21306*/enumId/*<21306*//*21307*/(/*21308*/idx/*<21308*/)/*<21307*/)(/*21309*/kind/*<21309*/)/*<21305*/)(/*21303*/-1/*<21303*/)/*<21300*/)/*<21310*/ }/*<21292*/)/*<21292*/ }/*<21286*/;

const get_tenv = /*21316*//*21317*/TI/*<21317*//*21316*/(/*21318*/function name_21318(s) { return function name_21318(tenv) { return function name_21318(n) { return /*21324*//*21325*/ok/*<21325*//*21324*/(/*21326*//*21327*/$co$co$co/*<21327*//*21326*/(/*21328*/s/*<21328*/)(/*21329*/tenv/*<21329*/)(/*21330*/n/*<21330*/)(/*21331*/tenv/*<21331*/)/*<21326*/)/*<21324*/ } } }/*<21318*/)/*<21316*/;

const get_constructor = /*21338*/function name_21338(name) { return /*21346*//*21347*/$gt$gt$eq/*<21347*//*21346*/(/*21350*/get_tenv/*<21350*/)(/*21346*/function name_21346(tenv) { return /*21351*/(function match_21351($target) {
if ($target.type === "none") {
return /*21359*//*21361*/ti_err/*<21361*//*21359*/(/*21362*/`Unknown constructor ${/*21364*/name/*<21364*/}`/*<21362*/)/*<21359*/
}
if ($target.type === "some") {
{
let scheme = $target[0];
return /*21369*//*21370*/$lt_/*<21370*//*21369*/(/*21371*/scheme/*<21371*/)/*<21369*/
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 21351');})(/*!*//*21353*//*21354*/tenv$slconstr/*<21354*//*21353*/(/*21355*/tenv/*<21355*/)(/*21356*/name/*<21356*/)/*<21353*/)/*<21351*/ }/*<21346*/)/*<21346*/ }/*<21338*/;

const split_stmts = /*21453*/function name_21453(stmts) { return function name_21453(sdefs) { return function name_21453(stypes) { return function name_21453(salias) { return function name_21453(sexps) { return /*21464*/(function match_21464($target) {
if ($target.type === "nil") {
return /*21468*//*21469*/$co$co$co/*<21469*//*21468*/(/*21470*/sdefs/*<21470*/)(/*21471*/stypes/*<21471*/)(/*21472*/salias/*<21472*/)(/*21473*/sexps/*<21473*/)/*<21468*/
}
if ($target.type === "cons") {
{
let one = $target[0];
{
let rest = $target[1];
return /*21478*/(function match_21478($target) {
if ($target.type === "sdef") {
return /*21487*//*21488*/split_stmts/*<21488*//*21487*/(/*21489*/rest/*<21489*/)(/*21490*//*21490*/cons/*<21490*//*21490*/(/*21491*/one/*<21491*/)(/*21493*/sdefs/*<21493*/)/*<21490*/)(/*21494*/stypes/*<21494*/)(/*21495*/salias/*<21495*/)(/*21496*/sexps/*<21496*/)/*<21487*/
}
if ($target.type === "sdeftype") {
return /*21504*//*21505*/split_stmts/*<21505*//*21504*/(/*21506*/rest/*<21506*/)(/*21507*/sdefs/*<21507*/)(/*21508*//*21508*/cons/*<21508*//*21508*/(/*21509*/one/*<21509*/)(/*21511*/stypes/*<21511*/)/*<21508*/)(/*21512*/salias/*<21512*/)(/*21513*/sexps/*<21513*/)/*<21504*/
}
if ($target.type === "stypealias") {
{
let name = $target[0];
{
let args = $target[2];
{
let body = $target[3];
return /*21521*//*21522*/split_stmts/*<21522*//*21521*/(/*21523*/rest/*<21523*/)(/*21524*/sdefs/*<21524*/)(/*21525*/stypes/*<21525*/)(/*21526*//*21526*/cons/*<21526*//*21526*/(/*21527*//*21528*/$co$co/*<21528*//*21527*/(/*21529*/name/*<21529*/)(/*21530*/args/*<21530*/)(/*21531*/body/*<21531*/)/*<21527*/)(/*21533*/salias/*<21533*/)/*<21526*/)(/*21534*/sexps/*<21534*/)/*<21521*/
}
}
}
}
if ($target.type === "sexpr") {
{
let expr = $target[0];
return /*21539*//*21540*/split_stmts/*<21540*//*21539*/(/*21541*/rest/*<21541*/)(/*21542*/sdefs/*<21542*/)(/*21543*/stypes/*<21543*/)(/*21544*/salias/*<21544*/)(/*21545*//*21545*/cons/*<21545*//*21545*/(/*21546*/expr/*<21546*/)(/*21548*/sexps/*<21548*/)/*<21545*/)/*<21539*/
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 21478');})(/*!*//*21480*/one/*<21480*/)/*<21478*/
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 21464');})(/*!*//*21466*/stmts/*<21466*/)/*<21464*/ } } } } }/*<21453*/;

const foldl_$gt = /*22084*/function name_22084(init) { return function name_22084(values) { return function name_22084(f) { return /*22093*/(function match_22093($target) {
if ($target.type === "nil") {
return /*22097*//*22098*/$lt_/*<22098*//*22097*/(/*22099*/init/*<22099*/)/*<22097*/
}
if ($target.type === "cons") {
{
let one = $target[0];
{
let rest = $target[1];
return /*22104*//*22105*/$gt$gt$eq/*<22105*//*22104*/(/*22108*//*22109*/f/*<22109*//*22108*/(/*22110*/init/*<22110*/)(/*22111*/one/*<22111*/)/*<22108*/)(/*22104*/function name_22104(one) { return /*22112*//*22113*/foldl_$gt/*<22113*//*22112*/(/*22114*/one/*<22114*/)(/*22115*/rest/*<22115*/)(/*22116*/f/*<22116*/)/*<22112*/ }/*<22104*/)/*<22104*/
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 22093');})(/*!*//*22095*/values/*<22095*/)/*<22093*/ } } }/*<22084*/;

const foldr_$gt = /*22117*/function name_22117(init) { return function name_22117(values) { return function name_22117(f) { return /*22124*/(function match_22124($target) {
if ($target.type === "nil") {
return /*22128*//*22129*/$lt_/*<22129*//*22128*/(/*22130*/init/*<22130*/)/*<22128*/
}
if ($target.type === "cons") {
{
let one = $target[0];
{
let rest = $target[1];
return /*22135*//*22136*/$gt$gt$eq/*<22136*//*22135*/(/*22139*//*22140*/foldr_$gt/*<22140*//*22139*/(/*22141*/init/*<22141*/)(/*22142*/rest/*<22142*/)(/*22143*/f/*<22143*/)/*<22139*/)(/*22135*/function name_22135(init) { return /*22144*//*22145*/f/*<22145*//*22144*/(/*22146*/init/*<22146*/)(/*22147*/one/*<22147*/)/*<22144*/ }/*<22135*/)/*<22135*/
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 22124');})(/*!*//*22126*/values/*<22126*/)/*<22124*/ } } }/*<22117*/;

const full_env$slmerge = /*22223*/function name_22223({0: a, 1: b, 2: c}) {

 return function name_22223({0: d, 1: e, 2: f}) {

 return /*22238*//*22239*/full_env/*<22239*//*22238*/(/*22240*//*22241*/tenv$slmerge/*<22241*//*22240*/(/*22242*/a/*<22242*/)(/*22243*/d/*<22243*/)/*<22240*/)(/*22244*//*22245*/class_env$slmerge/*<22245*//*22244*/(/*22246*/b/*<22246*/)(/*22247*/e/*<22247*/)/*<22244*/)(/*22248*//*22249*/concat/*<22249*//*22248*/(/*22252*//*22252*/cons/*<22252*//*22252*/(/*22250*/c/*<22250*/)(/*22252*//*22252*/cons/*<22252*//*22252*/(/*22251*/f/*<22251*/)(/*22252*/nil/*<22252*/)/*<22252*/)/*<22252*/)/*<22248*/)/*<22238*/ } }/*<22223*/;

const externals = /*22694*/function name_22694(bound) { return function name_22694(expr) { return /*22701*/(function match_22701($target) {
if ($target.type === "evar") {
{
let name = $target[0];
{
let l = $target[1];
return /*22708*/(function match_22708($target) {
if ($target === true) {
return /*22715*/empty/*<22715*/
}
return /*22717*//*22718*/one/*<22718*//*22717*/(/*22719*//*22720*/$co$co/*<22720*//*22719*/(/*22721*/name/*<22721*/)(/*22722*//*22723*/value/*<22723*//*22722*//*<22722*/)(/*22724*/l/*<22724*/)/*<22719*/)/*<22717*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 22708');})(/*!*//*22710*//*22711*/set$slhas/*<22711*//*22710*/(/*22712*/bound/*<22712*/)(/*22713*/name/*<22713*/)/*<22710*/)/*<22708*/
}
}
}
if ($target.type === "eprim") {
{
let prim = $target[0];
{
let l = $target[1];
return /*22729*/empty/*<22729*/
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
return /*22735*//*22736*/many/*<22736*//*22735*/(/*22737*//*22738*/map/*<22738*//*22737*/(/*22740*/function name_22740(arg) { return /*22744*/(function match_22744($target) {
if ($target.type === ",,") {
{
let expr = $target[0];
return /*22752*//*22753*/externals/*<22753*//*22752*/(/*22754*/bound/*<22754*/)(/*22755*/expr/*<22755*/)/*<22752*/
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 22744');})(/*!*//*22746*/arg/*<22746*/)/*<22744*/ }/*<22740*/)(/*23269*/templates/*<23269*/)/*<22737*/)/*<22735*/
}
}
}
}
if ($target.type === "equot") {
{
let expr = $target[0];
{
let int = $target[1];
return /*22760*/empty/*<22760*/
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
return /*22766*//*22767*/bag$sland/*<22767*//*22766*/(/*22768*//*22769*/foldl/*<22769*//*22768*/(/*22770*/empty/*<22770*/)(/*22771*//*22772*/map/*<22772*//*22771*/(/*22774*/pat_externals/*<22774*/)(/*23271*//*23271*/cons/*<23271*//*23271*/(/*23270*/pats/*<23270*/)(/*23271*/nil/*<23271*/)/*<23271*/)/*<22771*/)(/*22775*/bag$sland/*<22775*/)/*<22768*/)(/*22776*//*22777*/externals/*<22777*//*22776*/(/*22778*//*22779*/foldl/*<22779*//*22778*/(/*22780*/bound/*<22780*/)(/*22781*//*22782*/map/*<22782*//*22781*/(/*22784*/pat_names/*<22784*/)(/*23273*//*23273*/cons/*<23273*//*23273*/(/*23274*/pats/*<23274*/)(/*23273*/nil/*<23273*/)/*<23273*/)/*<22781*/)(/*22785*/set$slmerge/*<22785*/)/*<22778*/)(/*22786*/body/*<22786*/)/*<22776*/)/*<22766*/
}
}
}
}
if ($target.type === "elet") {
if ($target[0].type === ",") {
{
let explicit = $target[0][0];
{
let inferred = $target[0][1];
{
let body = $target[1];
{
let l = $target[2];
return /*22792*/(function let_22792() {const $target = /*22799*//*22800*/foldl/*<22800*//*22799*/(/*22801*//*22802*/$co/*<22802*//*22801*/(/*22803*/empty/*<22803*/)(/*22804*/bound/*<22804*/)/*<22801*/)(/*23275*/inferred/*<23275*/)(/*22806*/function name_22806({0: bag, 1: bound}) {
 return function name_22806(items) { return /*23284*//*23285*/foldl/*<23285*//*23284*/(/*23286*//*23287*/$co/*<23287*//*23286*/(/*23288*/bag/*<23288*/)(/*23289*/bound/*<23289*/)/*<23286*/)(/*23290*/items/*<23290*/)(/*23291*/function name_23291({0: bag, 1: bound}) {
 return function name_23291({0: name, 1: alts}) {
 return /*23297*//*23299*/foldl/*<23299*//*23297*/(/*23300*//*23301*/$co/*<23301*//*23300*/(/*23302*/bag/*<23302*/)(/*23303*/bound/*<23303*/)/*<23300*/)(/*23304*/alts/*<23304*/)(/*23305*/function name_23305({0: bag, 1: bound}) {
 return function name_23305({0: pats, 1: init}) {
 return /*23308*//*23321*/$co/*<23321*//*23308*/(/*23322*//*23338*/foldl/*<23338*//*23322*/(/*23339*/bag/*<23339*/)(/*23340*//*23341*/map/*<23341*//*23340*/(/*23342*/pat_externals/*<23342*/)(/*23343*/pats/*<23343*/)/*<23340*/)(/*23344*/bag$sland/*<23344*/)/*<23322*/)(/*23326*//*23327*/foldl/*<23327*//*23326*/(/*23328*/bound/*<23328*/)(/*23329*//*23332*/map/*<23332*//*23329*/(/*23333*/pat_names/*<23333*/)(/*23334*/pats/*<23334*/)/*<23329*/)(/*23335*/set$slmerge/*<23335*/)/*<23326*/)/*<23308*/ } }/*<23305*/)/*<23297*/ } }/*<23291*/)/*<23284*/ } }/*<22806*/)/*<22799*/;
if ($target.type === ",") {
{
let bag = $target[0];
{
let bound = $target[1];
return /*22837*//*22838*/bag$sland/*<22838*//*22837*/(/*22839*/bag/*<22839*/)(/*22840*//*22841*/externals/*<22841*//*22840*/(/*22842*/bound/*<22842*/)(/*22843*/body/*<22843*/)/*<22840*/)/*<22837*/
}
}
};
throw new Error('let pattern not matched 22795. ' + valueToString($target));})(/*!*/)/*<22792*/
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
let int = $target[2];
return /*22849*//*22850*/bag$sland/*<22850*//*22849*/(/*22851*//*22852*/externals/*<22852*//*22851*/(/*22853*/bound/*<22853*/)(/*22854*/target/*<22854*/)/*<22851*/)(/*22855*//*22856*/foldl/*<22856*//*22855*/(/*22857*/empty/*<22857*/)(/*22858*//*22859*/map/*<22859*//*22858*/(/*22861*//*22862*/externals/*<22862*//*22861*/(/*22863*/bound/*<22863*/)/*<22861*/)(/*23280*//*23280*/cons/*<23280*//*23280*/(/*23279*/args/*<23279*/)(/*23280*/nil/*<23280*/)/*<23280*/)/*<22858*/)(/*22864*/bag$sland/*<22864*/)/*<22855*/)/*<22849*/
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
return /*22870*//*22871*/bag$sland/*<22871*//*22870*/(/*22872*//*22873*/externals/*<22873*//*22872*/(/*22874*/bound/*<22874*/)(/*22875*/expr/*<22875*/)/*<22872*/)(/*22876*//*22877*/foldl/*<22877*//*22876*/(/*22878*/empty/*<22878*/)(/*22879*/cases/*<22879*/)(/*22880*/function name_22880(bag) { return function name_22880(arg) { return /*22885*/(function match_22885($target) {
if ($target.type === ",") {
{
let pat = $target[0];
{
let body = $target[1];
return /*22892*//*22893*/bag$sland/*<22893*//*22892*/(/*22894*//*22895*/bag$sland/*<22895*//*22894*/(/*22896*/bag/*<22896*/)(/*22897*//*22898*/pat_externals/*<22898*//*22897*/(/*22899*/pat/*<22899*/)/*<22897*/)/*<22894*/)(/*22900*//*22901*/externals/*<22901*//*22900*/(/*22902*//*22903*/set$slmerge/*<22903*//*22902*/(/*22904*/bound/*<22904*/)(/*22905*//*22906*/pat_names/*<22906*//*22905*/(/*22907*/pat/*<22907*/)/*<22905*/)/*<22902*/)(/*22908*/body/*<22908*/)/*<22900*/)/*<22892*/
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 22885');})(/*!*//*22887*/arg/*<22887*/)/*<22885*/ } }/*<22880*/)/*<22876*/)/*<22870*/
}
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 22701');})(/*!*//*22703*/expr/*<22703*/)/*<22701*/ } }/*<22694*/;

const names = /*23059*/function name_23059(stmt) { return /*23064*/(function match_23064($target) {
if ($target.type === "sdef") {
{
let name = $target[0];
{
let l = $target[1];
return /*23073*//*23073*/cons/*<23073*//*23073*/(/*23074*//*23075*/$co$co/*<23075*//*23074*/(/*23076*/name/*<23076*/)(/*23077*//*23078*/value/*<23078*//*23077*//*<23077*/)(/*23079*/l/*<23079*/)/*<23074*/)(/*23073*/nil/*<23073*/)/*<23073*/
}
}
}
if ($target.type === "sexpr") {
return /*23084*/nil/*<23084*/
}
if ($target.type === "stypealias") {
{
let name = $target[0];
{
let l = $target[1];
return /*23092*//*23092*/cons/*<23092*//*23092*/(/*23093*//*23094*/$co$co/*<23094*//*23093*/(/*23095*/name/*<23095*/)(/*23096*//*23097*/type/*<23097*//*23096*//*<23096*/)(/*23098*/l/*<23098*/)/*<23093*/)(/*23092*/nil/*<23092*/)/*<23092*/
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
return /*23106*//*23106*/cons/*<23106*//*23106*/(/*23107*//*23108*/$co$co/*<23108*//*23107*/(/*23109*/name/*<23109*/)(/*23110*//*23111*/type/*<23111*//*23110*//*<23110*/)(/*23112*/l/*<23112*/)/*<23107*/)(/*23114*//*23115*/map/*<23115*//*23114*/(/*23117*/function name_23117({0: name, 1: l}) {
 return /*23126*//*23127*/$co$co/*<23127*//*23126*/(/*23128*/name/*<23128*/)(/*23129*//*23130*/value/*<23130*//*23129*//*<23129*/)(/*23131*/l/*<23131*/)/*<23126*/ }/*<23117*/)(/*23346*/constructors/*<23346*/)/*<23114*/)/*<23106*/
}
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 23064');})(/*!*//*23066*/stmt/*<23066*/)/*<23064*/ }/*<23059*/;

const externals_stmt = /*23133*/function name_23133(stmt) { return /*23138*//*23139*/bag$slto_list/*<23139*//*23138*/(/*23140*/(function match_23140($target) {
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
return /*23150*/(function let_23150() {const $target = /*23154*//*23155*/set$slfrom_list/*<23155*//*23154*/(/*23156*//*23157*/map/*<23157*//*23156*/(/*23159*/fst/*<23159*/)(/*23347*/free/*<23347*/)/*<23156*/)/*<23154*/;
{
let frees = $target;
return /*23160*//*23161*/many/*<23161*//*23160*/(/*23162*//*23163*/map/*<23163*//*23162*/(/*23165*/function name_23165({0: name, 1: l, 2: args}) {

 return /*23174*/(function match_23174($target) {
if ($target.type === "nil") {
return /*23178*/empty/*<23178*/
}
return /*23180*//*23181*/many/*<23181*//*23180*/(/*23182*//*23183*/map/*<23183*//*23182*/(/*23185*//*23186*/externals_type/*<23186*//*23185*/(/*23187*/frees/*<23187*/)/*<23185*/)(/*23349*/args/*<23349*/)/*<23182*/)/*<23180*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 23174');})(/*!*//*23176*/args/*<23176*/)/*<23174*/ }/*<23165*/)(/*23348*/constructors/*<23348*/)/*<23162*/)/*<23160*/
};
throw new Error('let pattern not matched 23153. ' + valueToString($target));})(/*!*/)/*<23150*/
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
return /*23195*/(function let_23195() {const $target = /*23199*//*23200*/set$slfrom_list/*<23200*//*23199*/(/*23201*//*23202*/map/*<23202*//*23201*/(/*23204*/fst/*<23204*/)(/*23353*/args/*<23353*/)/*<23201*/)/*<23199*/;
{
let frees = $target;
return /*23205*//*23206*/externals_type/*<23206*//*23205*/(/*23207*/frees/*<23207*/)(/*23208*/body/*<23208*/)/*<23205*/
};
throw new Error('let pattern not matched 23198. ' + valueToString($target));})(/*!*/)/*<23195*/
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
return /*23215*//*23216*/externals/*<23216*//*23215*/(/*23217*//*23218*/set$sladd/*<23218*//*23217*/(/*23219*/set$slnil/*<23219*/)(/*23220*/name/*<23220*/)/*<23217*/)(/*23221*/body/*<23221*/)/*<23215*/
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
return /*23226*//*23227*/externals/*<23227*//*23226*/(/*23228*/set$slnil/*<23228*/)(/*23229*/expr/*<23229*/)/*<23226*/
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 23140');})(/*!*//*23142*/stmt/*<23142*/)/*<23140*/)/*<23138*/ }/*<23133*/;

const full_env$slnil = /*23486*//*23487*/full_env/*<23487*//*23486*/(/*23488*/type_env$slnil/*<23488*/)(/*23489*/class_env$slnil/*<23489*/)(/*23490*/nil/*<23490*/)/*<23486*/;

const scheme_$gts = /*23730*/function name_23730({0: kinds, 1: {0: preds, 1: t}}) {

 return /*23742*/`${/*23745*/(function match_23745($target) {
if ($target.type === "nil") {
return /*23750*/""/*<23750*/
}
return /*23761*/`${/*23753*//*23754*/join/*<23754*//*23753*/(/*23755*/" "/*<23755*/)(/*23757*//*23758*/map/*<23758*//*23757*/(/*23759*/kind_$gts/*<23759*/)(/*23760*/kinds/*<23760*/)/*<23757*/)/*<23753*/}; `/*<23761*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 23745');})(/*!*//*23748*/kinds/*<23748*/)/*<23745*/}${/*23774*/(function match_23774($target) {
if ($target.type === "nil") {
return /*23778*/""/*<23778*/
}
return /*23782*/`${/*23764*//*23767*/join/*<23767*//*23764*/(/*23768*/" "/*<23768*/)(/*23770*//*23771*/map/*<23771*//*23770*/(/*23772*/pred_$gts/*<23772*/)(/*23773*/preds/*<23773*/)/*<23770*/)/*<23764*/}; `/*<23782*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 23774');})(/*!*//*23776*/preds/*<23776*/)/*<23774*/}${/*23785*//*23787*/type_$gts/*<23787*//*23785*/(/*23788*/t/*<23788*/)/*<23785*/}`/*<23742*/ }/*<23730*/;

const qual_$gts = /*23855*/function name_23855(t_$gts) { return function name_23855({0: preds, 1: t}) {
 return /*23865*/`${/*23867*/(function match_23867($target) {
if ($target.type === "nil") {
return /*23872*/""/*<23872*/
}
return /*23874*/`${/*23876*//*23880*/join/*<23880*//*23876*/(/*23881*/"; "/*<23881*/)(/*23883*//*23884*/map/*<23884*//*23883*/(/*23885*/pred_$gts/*<23885*/)(/*23886*/preds/*<23886*/)/*<23883*/)/*<23876*/} `/*<23874*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 23867');})(/*!*//*23870*/preds/*<23870*/)/*<23867*/}${/*23887*//*23889*/t_$gts/*<23889*//*23887*/(/*23890*/t/*<23890*/)/*<23887*/}`/*<23865*/ } }/*<23855*/;

const type$slvalid$qe = /*24029*/function name_24029(type) { return /*24035*/(function match_24035($target) {
if ($target.type === "tcon") {
return /*24042*/true/*<24042*/
}
if ($target.type === "tvar") {
return /*24047*/true/*<24047*/
}
if ($target.type === "tapp") {
{
let t = $target[0];
{
let arg = $target[1];
return /*24053*/(function match_24053($target) {
if ($target.type === "kfun") {
{
let ka = $target[0];
{
let res = $target[1];
return /*24062*/(function match_24062($target) {
if ($target === true) {
return /*24080*/(function match_24080($target) {
if ($target === true) {
return /*24064*//*24065*/kind$eq/*<24065*//*24064*/(/*24066*/ka/*<24066*/)(/*24067*//*24068*/type$slkind/*<24068*//*24067*/(/*24069*/arg/*<24069*/)/*<24067*/)/*<24064*/
}
return /*24088*/false/*<24088*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 24080');})(/*!*//*24082*//*24083*/type$slvalid$qe/*<24083*//*24082*/(/*24084*/arg/*<24084*/)/*<24082*/)/*<24080*/
}
return /*24070*/false/*<24070*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 24062');})(/*!*//*24073*//*24074*/type$slvalid$qe/*<24074*//*24073*/(/*24075*/t/*<24075*/)/*<24073*/)/*<24062*/
}
}
}
return /*24090*/false/*<24090*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 24053');})(/*!*//*24055*//*24056*/type$slkind/*<24056*//*24055*/(/*24057*/t/*<24057*/)/*<24055*/)/*<24053*/
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 24035');})(/*!*//*24037*/type/*<24037*/)/*<24035*/ }/*<24029*/;

const analysis = (v0) => (v1) => (v2) => ({type: "analysis", 0: v0, 1: v1, 2: v2});
const inferator = (v0) => (v1) => (v2) => (v3) => (v4) => (v5) => ({type: "inferator", 0: v0, 1: v1, 2: v2, 3: v3, 4: v4, 5: v5});
const parser = (v0) => (v1) => (v2) => (v3) => ({type: "parser", 0: v0, 1: v1, 2: v2, 3: v3});
const expr_loc = /*24561*/function name_24561(expr) { return /*24566*/(function match_24566($target) {
if ($target.type === "estr") {
{
let l = $target[2];
return /*24574*/l/*<24574*/
}
}
if ($target.type === "eprim") {
{
let l = $target[1];
return /*24579*/l/*<24579*/
}
}
if ($target.type === "evar") {
{
let l = $target[1];
return /*24584*/l/*<24584*/
}
}
if ($target.type === "equotquot") {
{
let l = $target[1];
return /*24589*/l/*<24589*/
}
}
if ($target.type === "equot") {
{
let l = $target[1];
return /*24594*/l/*<24594*/
}
}
if ($target.type === "equot/stmt") {
{
let l = $target[1];
return /*24599*/l/*<24599*/
}
}
if ($target.type === "equot/pat") {
{
let l = $target[1];
return /*24604*/l/*<24604*/
}
}
if ($target.type === "equot/type") {
{
let l = $target[1];
return /*24609*/l/*<24609*/
}
}
if ($target.type === "elambda") {
{
let l = $target[2];
return /*24615*/l/*<24615*/
}
}
if ($target.type === "elet") {
{
let l = $target[2];
return /*24621*/l/*<24621*/
}
}
if ($target.type === "eapp") {
{
let l = $target[2];
return /*24627*/l/*<24627*/
}
}
if ($target.type === "ematch") {
{
let l = $target[2];
return /*24633*/l/*<24633*/
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 24566');})(/*!*//*24568*/expr/*<24568*/)/*<24566*/ }/*<24561*/;

const compile = /*25129*/function name_25129(expr) { return function name_25129(trace) { return /*25135*/(function let_25135() {const $target = /*25139*//*25140*/expr_loc/*<25140*//*25139*/(/*25141*/expr/*<25141*/)/*<25139*/;
{
let loc = $target;
return /*25142*//*25143*/trace_wrap/*<25143*//*25142*/(/*25144*/loc/*<25144*/)(/*25145*/trace/*<25145*/)(/*25146*/(function match_25146($target) {
if ($target.type === "estr") {
{
let first = $target[0];
{
let tpls = $target[1];
{
let l = $target[2];
return /*25154*/(function match_25154($target) {
if ($target.type === "nil") {
return /*25158*/`\"${/*25160*//*25161*/escape_string/*<25161*//*25160*/(/*25162*//*25163*/unescapeString/*<25163*//*25162*/(/*25164*/first/*<25164*/)/*<25162*/)/*<25160*/}\"`/*<25158*/
}
return /*25167*/`\`${/*25169*//*25170*/escape_string/*<25170*//*25169*/(/*25171*//*25172*/unescapeString/*<25172*//*25171*/(/*25173*/first/*<25173*/)/*<25171*/)/*<25169*/}${/*25175*//*25176*/join/*<25176*//*25175*/(/*25177*/""/*<25177*/)(/*25179*//*25180*/mapr/*<25180*//*25179*/(/*25181*/tpls/*<25181*/)(/*25182*/function name_25182(item) { return /*25186*/(function let_25186() {const $target = /*25194*/item/*<25194*/;
if ($target.type === ",,") {
{
let expr = $target[0];
{
let suffix = $target[1];
{
let l = $target[2];
return /*25195*/`\${${/*25197*//*25198*/compile/*<25198*//*25197*/(/*25199*/expr/*<25199*/)(/*25200*/trace/*<25200*/)/*<25197*/}}${/*25202*//*25203*/escape_string/*<25203*//*25202*/(/*25204*//*25205*/unescapeString/*<25205*//*25204*/(/*25206*/suffix/*<25206*/)/*<25204*/)/*<25202*/}`/*<25195*/
}
}
}
};
throw new Error('let pattern not matched 25189. ' + valueToString($target));})(/*!*/)/*<25186*/ }/*<25182*/)/*<25179*/)/*<25175*/}\``/*<25167*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 25154');})(/*!*//*25156*/tpls/*<25156*/)/*<25154*/
}
}
}
}
if ($target.type === "eprim") {
{
let prim = $target[0];
{
let l = $target[1];
return /*25213*/(function match_25213($target) {
if ($target.type === "pint") {
{
let int = $target[0];
return /*25220*//*25221*/int_to_string/*<25221*//*25220*/(/*25222*/int/*<25222*/)/*<25220*/
}
}
if ($target.type === "pfloat") {
{
let float = $target[0];
return /*25227*//*25228*/jsonify/*<25228*//*25227*/(/*25229*/float/*<25229*/)/*<25227*/
}
}
if ($target.type === "pbool") {
{
let bool = $target[0];
return /*25234*/(function match_25234($target) {
if ($target === true) {
return /*25238*/"true"/*<25238*/
}
if ($target === false) {
return /*25241*/"false"/*<25241*/
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 25234');})(/*!*//*25236*/bool/*<25236*/)/*<25234*/
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 25213');})(/*!*//*25215*/prim/*<25215*/)/*<25213*/
}
}
}
if ($target.type === "evar") {
{
let name = $target[0];
{
let l = $target[1];
return /*25247*//*25248*/sanitize/*<25248*//*25247*/(/*25249*/name/*<25249*/)/*<25247*/
}
}
}
if ($target.type === "equot") {
{
let inner = $target[0];
{
let l = $target[1];
return /*25254*//*25255*/jsonify/*<25255*//*25254*/(/*25256*/inner/*<25256*/)/*<25254*/
}
}
}
if ($target.type === "equot/stmt") {
{
let inner = $target[0];
{
let l = $target[1];
return /*25261*//*25262*/jsonify/*<25262*//*25261*/(/*25263*/inner/*<25263*/)/*<25261*/
}
}
}
if ($target.type === "equot/type") {
{
let inner = $target[0];
{
let l = $target[1];
return /*25268*//*25269*/jsonify/*<25269*//*25268*/(/*25270*/inner/*<25270*/)/*<25268*/
}
}
}
if ($target.type === "equot/pat") {
{
let inner = $target[0];
{
let l = $target[1];
return /*25275*//*25276*/jsonify/*<25276*//*25275*/(/*25277*/inner/*<25277*/)/*<25275*/
}
}
}
if ($target.type === "equotquot") {
{
let inner = $target[0];
{
let l = $target[1];
return /*25282*//*25283*/jsonify/*<25283*//*25282*/(/*25284*/inner/*<25284*/)/*<25282*/
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
return /*25290*/`function name_${/*25292*//*25293*/its/*<25293*//*25292*/(/*25294*/l/*<25294*/)/*<25292*/}(${/*25296*//*25297*/orr/*<25297*//*25296*/(/*25298*/"_"/*<25298*/)(/*25300*//*25301*/just_pat/*<25301*//*25300*/(/*25302*/pat/*<25302*/)/*<25300*/)/*<25296*/}) { return ${/*25304*//*25305*/compile/*<25305*//*25304*/(/*25306*/body/*<25306*/)(/*25307*/trace/*<25307*/)/*<25304*/} }`/*<25290*/
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
return /*25317*//*25318*/foldl/*<25318*//*25317*/(/*25319*//*25320*/compile/*<25320*//*25319*/(/*25321*/body/*<25321*/)(/*25322*/trace/*<25322*/)/*<25319*/)(/*25323*//*25324*/concat/*<25324*//*25323*/(/*25325*/inferred/*<25325*/)/*<25323*/)(/*25326*/function name_25326(body) { return function name_25326({0: name, 1: {0: {1: init}}}) {
 return /*25338*/`(function let_${/*25340*//*25341*/its/*<25341*//*25340*/(/*25342*/l/*<25342*/)/*<25340*/}() {const ${/*25344*//*25345*/sanitize/*<25345*//*25344*/(/*25346*/name/*<25346*/)/*<25344*/} = ${/*25348*//*25349*/compile/*<25349*//*25348*/(/*25350*/init/*<25350*/)(/*25351*/trace/*<25351*/)/*<25348*/};\n${/*25353*//*25354*/`return ${/*25356*/body/*<25356*/}`/*<25354*//*25353*//*<25353*/};\nthrow new Error('let pattern not matched. ' + valueToString(\$target));\n})()`/*<25338*/ } }/*<25326*/)/*<25317*/
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
return /*25375*/(function match_25375($target) {
if ($target.type === "elambda") {
return /*25383*/`(${/*25385*//*25386*/compile/*<25386*//*25385*/(/*25387*/fn/*<25387*/)(/*25388*/trace/*<25388*/)/*<25385*/})(${/*25390*//*25391*/compile/*<25391*//*25390*/(/*25392*/arg/*<25392*/)(/*25393*/trace/*<25393*/)/*<25390*/})`/*<25383*/
}
return /*25396*/`${/*25398*//*25399*/compile/*<25399*//*25398*/(/*25400*/fn/*<25400*/)(/*25401*/trace/*<25401*/)/*<25398*/}(${/*25403*//*25404*/compile/*<25404*//*25403*/(/*25405*/arg/*<25405*/)(/*25406*/trace/*<25406*/)/*<25403*/})`/*<25396*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 25375');})(/*!*//*25377*/fn/*<25377*/)/*<25375*/
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
return /*25413*/`(function match_${/*25415*//*25416*/its/*<25416*//*25415*/(/*25417*/l/*<25417*/)/*<25415*/}(\$target) {\n${/*25419*//*25420*/join/*<25420*//*25419*/(/*25421*/"\n"/*<25421*/)(/*25423*//*25424*/mapr/*<25424*//*25423*/(/*25425*/cases/*<25425*/)(/*25426*/function name_25426($case) { return /*25430*/(function let_25430() {const $target = /*25437*/$case/*<25437*/;
if ($target.type === ",") {
{
let pat = $target[0];
{
let body = $target[1];
return /*25438*//*25439*/compile_pat/*<25439*//*25438*/(/*25440*/pat/*<25440*/)(/*25441*/"\$target"/*<25441*/)(/*25443*/`return ${/*25445*//*25446*/compile/*<25446*//*25445*/(/*25447*/body/*<25447*/)(/*25448*/trace/*<25448*/)/*<25445*/}`/*<25443*/)(/*25450*/trace/*<25450*/)/*<25438*/
}
}
};
throw new Error('let pattern not matched 25433. ' + valueToString($target));})(/*!*/)/*<25430*/ }/*<25426*/)/*<25423*/)/*<25419*/}\nthrow new Error('failed to match ' + jsonify(\$target) + '. Loc: ${/*25452*//*25453*/its/*<25453*//*25452*/(/*25454*/l/*<25454*/)/*<25452*/}');\n})(${/*25456*//*25457*/compile/*<25457*//*25456*/(/*25458*/target/*<25458*/)(/*25459*/trace/*<25459*/)/*<25456*/})`/*<25413*/
}
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 25146');})(/*!*//*25148*/expr/*<25148*/)/*<25146*/)/*<25142*/
};
throw new Error('let pattern not matched 25138. ' + valueToString($target));})(/*!*/)/*<25135*/ } }/*<25129*/;

const compile_stmt = /*25738*/function name_25738(stmt) { return function name_25738(trace) { return /*25744*/(function match_25744($target) {
if ($target.type === "sexpr") {
{
let expr = $target[0];
{
let l = $target[1];
return /*25751*//*25752*/compile/*<25752*//*25751*/(/*25753*/expr/*<25753*/)(/*25754*/trace/*<25754*/)/*<25751*/
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
return /*25761*//*25762*/$pl$pl/*<25762*//*25761*/(/*25763*//*25763*/cons/*<25763*//*25763*/(/*25764*/"const "/*<25764*/)(/*25763*//*25763*/cons/*<25763*//*25763*/(/*25766*//*25767*/sanitize/*<25767*//*25766*/(/*25768*/name/*<25768*/)/*<25766*/)(/*25763*//*25763*/cons/*<25763*//*25763*/(/*25769*/" = "/*<25769*/)(/*25763*//*25763*/cons/*<25763*//*25763*/(/*25771*//*25772*/compile/*<25772*//*25771*/(/*25773*/body/*<25773*/)(/*25774*/trace/*<25774*/)/*<25771*/)(/*25763*//*25763*/cons/*<25763*//*25763*/(/*25775*/";\n"/*<25775*/)(/*25763*/nil/*<25763*/)/*<25763*/)/*<25763*/)/*<25763*/)/*<25763*/)/*<25763*/)/*<25761*/
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
return /*25784*//*25785*/join/*<25785*//*25784*/(/*25786*/"\n"/*<25786*/)(/*25788*//*25789*/mapr/*<25789*//*25788*/(/*25790*/cases/*<25790*/)(/*25791*/function name_25791($case) { return /*25795*/(function let_25795() {const $target = /*25804*/$case/*<25804*/;
if ($target.type === ",,,") {
{
let name2 = $target[0];
{
let nl = $target[1];
{
let args = $target[2];
{
let l = $target[3];
return /*25805*//*25806*/$pl$pl/*<25806*//*25805*/(/*25807*//*25807*/cons/*<25807*//*25807*/(/*25808*/"const "/*<25808*/)(/*25807*//*25807*/cons/*<25807*//*25807*/(/*25810*//*25811*/sanitize/*<25811*//*25810*/(/*25812*/name2/*<25812*/)/*<25810*/)(/*25807*//*25807*/cons/*<25807*//*25807*/(/*25813*/" = "/*<25813*/)(/*25807*//*25807*/cons/*<25807*//*25807*/(/*25815*//*25816*/$pl$pl/*<25816*//*25815*/(/*25817*//*25818*/mapi/*<25818*//*25817*/(/*25821*/function name_25821(_) { return function name_25821(i) { return /*25826*//*25827*/$pl$pl/*<25827*//*25826*/(/*25828*//*25828*/cons/*<25828*//*25828*/(/*25829*/"(v"/*<25829*/)(/*25828*//*25828*/cons/*<25828*//*25828*/(/*25831*//*25832*/int_to_string/*<25832*//*25831*/(/*25833*/i/*<25833*/)/*<25831*/)(/*25828*//*25828*/cons/*<25828*//*25828*/(/*25834*/") => "/*<25834*/)(/*25828*/nil/*<25828*/)/*<25828*/)/*<25828*/)/*<25828*/)/*<25826*/ } }/*<25821*/)(/*25927*/0/*<25927*/)(/*25928*/args/*<25928*/)/*<25817*/)/*<25815*/)(/*25807*//*25807*/cons/*<25807*//*25807*/(/*25836*/"({type: \""/*<25836*/)(/*25807*//*25807*/cons/*<25807*//*25807*/(/*25838*/name2/*<25838*/)(/*25807*//*25807*/cons/*<25807*//*25807*/(/*25839*/"\""/*<25839*/)(/*25807*//*25807*/cons/*<25807*//*25807*/(/*25841*//*25842*/$pl$pl/*<25842*//*25841*/(/*25843*//*25844*/mapi/*<25844*//*25843*/(/*25847*/function name_25847(_) { return function name_25847(i) { return /*25852*//*25853*/$pl$pl/*<25853*//*25852*/(/*25854*//*25854*/cons/*<25854*//*25854*/(/*25855*/", "/*<25855*/)(/*25854*//*25854*/cons/*<25854*//*25854*/(/*25857*//*25858*/int_to_string/*<25858*//*25857*/(/*25859*/i/*<25859*/)/*<25857*/)(/*25854*//*25854*/cons/*<25854*//*25854*/(/*25860*/": v"/*<25860*/)(/*25854*//*25854*/cons/*<25854*//*25854*/(/*25862*//*25863*/int_to_string/*<25863*//*25862*/(/*25864*/i/*<25864*/)/*<25862*/)(/*25854*/nil/*<25854*/)/*<25854*/)/*<25854*/)/*<25854*/)/*<25854*/)/*<25852*/ } }/*<25847*/)(/*25931*/0/*<25931*/)(/*25932*/args/*<25932*/)/*<25843*/)/*<25841*/)(/*25807*//*25807*/cons/*<25807*//*25807*/(/*25865*/"});"/*<25865*/)(/*25807*/nil/*<25807*/)/*<25807*/)/*<25807*/)/*<25807*/)/*<25807*/)/*<25807*/)/*<25807*/)/*<25807*/)/*<25807*/)/*<25807*/)/*<25805*/
}
}
}
}
};
throw new Error('let pattern not matched 25798. ' + valueToString($target));})(/*!*/)/*<25795*/ }/*<25791*/)/*<25788*/)/*<25784*/
}
}
}
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 25744');})(/*!*//*25746*/stmt/*<25746*/)/*<25744*/ } }/*<25738*/;

const to_hnfs = /*8247*/function name_8247(ce) { return function name_8247(ps) { return /*8289*/(function match_8289($target) {
if ($target.type === "err") {
{
let e = $target[0];
return /*8430*//*8431*/err/*<8431*//*8430*/(/*8432*/e/*<8432*/)/*<8430*/
}
}
if ($target.type === "ok") {
{
let v = $target[0];
return /*8439*//*8440*/ok/*<8440*//*8439*/(/*8436*//*8437*/concat/*<8437*//*8436*/(/*8438*/v/*<8438*/)/*<8436*/)/*<8439*/
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 8289');})(/*!*//*8295*//*8296*/map$slok/*<8296*//*8295*/(/*8297*//*8298*/to_hnf/*<8298*//*8297*/(/*8299*/ce/*<8299*/)/*<8297*/)(/*8300*/ps/*<8300*/)/*<8295*/)/*<8289*/ } }/*<8247*/;


const to_hnf = /*8254*/function name_8254(ce) { return function name_8254(p) { return /*8261*/(function match_8261($target) {
if ($target === true) {
return /*8268*//*8269*/ok/*<8269*//*8268*/(/*8266*//*8266*/cons/*<8266*//*8266*/(/*8267*/p/*<8267*/)(/*8266*/nil/*<8266*/)/*<8266*/)/*<8268*/
}
return /*8270*/(function match_8270($target) {
if ($target.type === "none") {
return /*16637*/(function let_16637() {const $target = /*16646*/p/*<16646*/;
if ($target.type === "isin") {
{
let name = $target[0];
{
let type = $target[1];
return /*8278*//*8279*/err/*<8279*//*8278*/(/*8280*/`Can't find an instance for class '${/*16647*/name/*<16647*/}' for type ${/*16632*//*16634*/type_$gts/*<16634*//*16632*/(/*16635*/type/*<16635*/)/*<16632*/}`/*<8280*/)/*<8278*/
}
}
};
throw new Error('let pattern not matched 16642. ' + valueToString($target));})(/*!*/)/*<16637*/
}
if ($target.type === "some") {
{
let ps = $target[0];
return /*8285*//*8286*/to_hnfs/*<8286*//*8285*/(/*8287*/ce/*<8287*/)(/*8288*/ps/*<8288*/)/*<8285*/
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 8270');})(/*!*//*8272*//*8273*/by_inst/*<8273*//*8272*/(/*8274*/ce/*<8274*/)(/*8275*/p/*<8275*/)/*<8272*/)/*<8270*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 8261');})(/*!*//*8263*//*8264*/in_hnf/*<8264*//*8263*/(/*8265*/p/*<8265*/)/*<8263*/)/*<8261*/ } }/*<8254*/;

const parse_expr = /*11178*/function name_11178(cst) { return /*11183*/(function match_11183($target) {
if ($target.type === "cst/identifier") {
if ($target[0] === "true"){
{
let l = $target[1];
return /*11191*//*11192*/eprim/*<11192*//*11191*/(/*11193*//*11194*/pbool/*<11194*//*11193*/(/*11195*/true/*<11195*/)(/*11196*/l/*<11196*/)/*<11193*/)(/*11197*/l/*<11197*/)/*<11191*/
}
}
}
if ($target.type === "cst/identifier") {
if ($target[0] === "false"){
{
let l = $target[1];
return /*11203*//*11204*/eprim/*<11204*//*11203*/(/*11205*//*11206*/pbool/*<11206*//*11205*/(/*11207*/false/*<11207*/)(/*11208*/l/*<11208*/)/*<11205*/)(/*11209*/l/*<11209*/)/*<11203*/
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
return /*11215*//*11216*/estr/*<11216*//*11215*/(/*11217*/first/*<11217*/)(/*11218*//*11219*/map/*<11219*//*11218*/(/*11221*/function name_11221(tpl) { return /*11225*/(function let_11225() {const $target = /*11233*/tpl/*<11233*/;
if ($target.type === ",,") {
{
let expr = $target[0];
{
let string = $target[1];
{
let l = $target[2];
return /*11234*//*11235*/$co$co/*<11235*//*11234*/(/*11236*//*11237*/parse_expr/*<11237*//*11236*/(/*11238*/expr/*<11238*/)/*<11236*/)(/*11239*/string/*<11239*/)(/*11240*/l/*<11240*/)/*<11234*/
}
}
}
};
throw new Error('let pattern not matched 11228. ' + valueToString($target));})(/*!*/)/*<11225*/ }/*<11221*/)(/*12972*/templates/*<12972*/)/*<11218*/)(/*11241*/l/*<11241*/)/*<11215*/
}
}
}
}
if ($target.type === "cst/identifier") {
{
let id = $target[0];
{
let l = $target[1];
return /*11246*/(function match_11246($target) {
if ($target.type === "some") {
{
let int = $target[0];
return /*11254*//*11255*/eprim/*<11255*//*11254*/(/*11256*//*11257*/pint/*<11257*//*11256*/(/*11258*/int/*<11258*/)(/*11259*/l/*<11259*/)/*<11256*/)(/*11260*/l/*<11260*/)/*<11254*/
}
}
if ($target.type === "none") {
return /*20375*/(function match_20375($target) {
if ($target.type === "some") {
{
let v = $target[0];
return /*20384*//*20385*/eprim/*<20385*//*20384*/(/*20386*//*20387*/pfloat/*<20387*//*20386*/(/*20388*/v/*<20388*/)(/*20389*/l/*<20389*/)/*<20386*/)(/*20390*/l/*<20390*/)/*<20384*/
}
}
return /*11263*//*11264*/evar/*<11264*//*11263*/(/*11265*/id/*<11265*/)(/*11266*/l/*<11266*/)/*<11263*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 20375');})(/*!*//*20377*//*20379*/string_to_float/*<20379*//*20377*/(/*20380*/id/*<20380*/)/*<20377*/)/*<20375*/
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 11246');})(/*!*//*11248*//*11249*/string_to_int/*<11249*//*11248*/(/*11250*/id/*<11250*/)/*<11248*/)/*<11246*/
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
return /*11277*//*11278*/equot/*<11278*//*11277*/(/*11279*//*11280*/parse_expr/*<11280*//*11279*/(/*11281*/body/*<11281*/)/*<11279*/)(/*11282*/l/*<11282*/)/*<11277*/
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
return /*11293*//*11294*/equotquot/*<11294*//*11293*/(/*11295*/body/*<11295*/)(/*11296*/l/*<11296*/)/*<11293*/
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
return /*11307*//*11308*/equot$slstmt/*<11308*//*11307*/(/*11309*//*11310*/parse_stmt/*<11310*//*11309*/(/*11311*/body/*<11311*/)/*<11309*/)(/*11312*/l/*<11312*/)/*<11307*/
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
return /*11323*//*11324*/equot$sltype/*<11324*//*11323*/(/*11325*//*11326*/parse_type/*<11326*//*11325*/(/*11327*/body/*<11327*/)/*<11325*/)(/*11328*/l/*<11328*/)/*<11323*/
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
return /*11339*//*11340*/equot$slpat/*<11340*//*11339*/(/*11341*//*11342*/parse_pat/*<11342*//*11341*/(/*11343*/body/*<11343*/)/*<11341*/)(/*11344*/l/*<11344*/)/*<11339*/
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
return /*11357*//*11358*/ematch/*<11358*//*11357*/(/*11359*//*11360*/parse_expr/*<11360*//*11359*/(/*11361*/cond/*<11361*/)/*<11359*/)(/*11362*//*11362*/cons/*<11362*//*11362*/(/*11363*//*11364*/$co/*<11364*//*11363*/(/*11365*//*11366*/pprim/*<11366*//*11365*/(/*11367*//*11368*/pbool/*<11368*//*11367*/(/*11369*/true/*<11369*/)(/*11370*/l/*<11370*/)/*<11367*/)(/*11371*/l/*<11371*/)/*<11365*/)(/*11372*//*11373*/parse_expr/*<11373*//*11372*/(/*11374*/yes/*<11374*/)/*<11372*/)/*<11363*/)(/*11362*//*11362*/cons/*<11362*//*11362*/(/*11375*//*11376*/$co/*<11376*//*11375*/(/*11377*//*11378*/pany/*<11378*//*11377*/(/*11379*/l/*<11379*/)/*<11377*/)(/*11380*//*11381*/parse_expr/*<11381*//*11380*/(/*11382*/no/*<11382*/)/*<11380*/)/*<11375*/)(/*11362*/nil/*<11362*/)/*<11362*/)/*<11362*/)(/*11383*/l/*<11383*/)/*<11357*/
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
return /*11399*//*11400*/foldr/*<11400*//*11399*/(/*11401*//*11402*/parse_expr/*<11402*//*11401*/(/*11403*/body/*<11403*/)/*<11401*/)(/*11404*/args/*<11404*/)(/*11405*/function name_11405(body) { return function name_11405(arg) { return /*11417*//*11418*/elambda/*<11418*//*11417*/(/*11419*//*13391*/parse_pat/*<13391*//*11419*/(/*13392*/arg/*<13392*/)/*<11419*/)(/*11421*/body/*<11421*/)(/*11422*/b/*<11422*/)/*<11417*/ } }/*<11405*/)/*<11399*/
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
return /*11456*//*11457*/fatal/*<11457*//*11456*/(/*11458*/`Invalid 'fn' ${/*11460*//*11461*/int_to_string/*<11461*//*11460*/(/*11462*/l/*<11462*/)/*<11460*/}`/*<11458*/)/*<11456*/
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
return /*11476*//*11477*/ematch/*<11477*//*11476*/(/*11478*//*11479*/parse_expr/*<11479*//*11478*/(/*11480*/target/*<11480*/)/*<11478*/)(/*11481*//*11482*/map/*<11482*//*11481*/(/*11486*/function name_11486($case) { return /*11490*/(function let_11490() {const $target = /*11497*/$case/*<11497*/;
if ($target.type === ",") {
{
let pat = $target[0];
{
let expr = $target[1];
return /*11498*//*11499*/$co/*<11499*//*11498*/(/*11500*//*11501*/parse_pat/*<11501*//*11500*/(/*11502*/pat/*<11502*/)/*<11500*/)(/*11503*//*11504*/parse_expr/*<11504*//*11503*/(/*11505*/expr/*<11505*/)/*<11503*/)/*<11498*/
}
}
};
throw new Error('let pattern not matched 11493. ' + valueToString($target));})(/*!*/)/*<11490*/ }/*<11486*/)(/*12969*//*12970*/pairs/*<12970*//*12969*/(/*12971*/cases/*<12971*/)/*<12969*/)/*<11481*/)(/*11506*/l/*<11506*/)/*<11476*/
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
return /*11521*//*11522*/foldr/*<11522*//*11521*/(/*11523*//*11524*/parse_expr/*<11524*//*11523*/(/*11525*/body/*<11525*/)/*<11523*/)(/*11526*//*11527*/pairs/*<11527*//*11526*/(/*11528*/inits/*<11528*/)/*<11526*/)(/*11529*/function name_11529(body) { return function name_11529(init) { return /*11534*/(function let_11534() {const $target = /*11541*/init/*<11541*/;
if ($target.type === ",") {
{
let pat = $target[0];
{
let value = $target[1];
return /*15660*/(function match_15660($target) {
if ($target.type === "cst/identifier") {
{
let name = $target[0];
{
let l = $target[1];
return /*11542*//*11543*/elet/*<11543*//*11542*/(/*15656*//*15657*/$co/*<15657*//*15656*/(/*15658*/nil/*<15658*/)(/*13348*//*13348*/cons/*<13348*//*13348*/(/*15659*//*15659*/cons/*<15659*//*15659*/(/*13347*//*13349*/$co/*<13349*//*13347*/(/*11544*/name/*<11544*/)(/*15674*//*15674*/cons/*<15674*//*15674*/(/*15675*//*15676*/$co/*<15676*//*15675*/(/*15677*/nil/*<15677*/)(/*11547*//*11548*/parse_expr/*<11548*//*11547*/(/*11549*/value/*<11549*/)/*<11547*/)/*<15675*/)(/*15674*/nil/*<15674*/)/*<15674*/)/*<13347*/)(/*15659*/nil/*<15659*/)/*<15659*/)(/*13348*/nil/*<13348*/)/*<13348*/)/*<15656*/)(/*11550*/body/*<11550*/)(/*11551*/l/*<11551*/)/*<11542*/
}
}
}
return /*20137*//*20150*/ematch/*<20150*//*20137*/(/*20151*//*20152*/parse_expr/*<20152*//*20151*/(/*20153*/value/*<20153*/)/*<20151*/)(/*20154*//*20154*/cons/*<20154*//*20154*/(/*20155*//*20156*/$co/*<20156*//*20155*/(/*20157*//*20158*/parse_pat/*<20158*//*20157*/(/*20159*/pat/*<20159*/)/*<20157*/)(/*20160*/body/*<20160*/)/*<20155*/)(/*20154*/nil/*<20154*/)/*<20154*/)(/*20163*/l/*<20163*/)/*<20137*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 15660');})(/*!*//*15669*/pat/*<15669*/)/*<15660*/
}
}
};
throw new Error('let pattern not matched 11537. ' + valueToString($target));})(/*!*/)/*<11534*/ } }/*<11529*/)/*<11521*/
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
if ($target[0][0][0] === "letrec"){
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
return /*13352*//*13366*/elet/*<13366*//*13352*/(/*15641*//*15642*/$co/*<15642*//*15641*/(/*15643*/nil/*<15643*/)(/*20219*//*20219*/cons/*<20219*//*20219*/(/*13367*//*13368*/map/*<13368*//*13367*/(/*13369*/function name_13369({0: pat, 1: value}) {
 return /*15645*/(function match_15645($target) {
if ($target.type === "cst/identifier") {
{
let name = $target[0];
{
let l = $target[1];
return /*13372*//*13384*/$co/*<13384*//*13372*/(/*13385*/name/*<13385*/)(/*15652*//*15652*/cons/*<15652*//*15652*/(/*15653*//*15654*/$co/*<15654*//*15653*/(/*15655*/nil/*<15655*/)(/*13388*//*13389*/parse_expr/*<13389*//*13388*/(/*13390*/value/*<13390*/)/*<13388*/)/*<15653*/)(/*15652*/nil/*<15652*/)/*<15652*/)/*<13372*/
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 15645');})(/*!*//*15647*/pat/*<15647*/)/*<15645*/ }/*<13369*/)(/*13373*//*13374*/pairs/*<13374*//*13373*/(/*13375*/inits/*<13375*/)/*<13373*/)/*<13367*/)(/*20219*/nil/*<20219*/)/*<20219*/)/*<15641*/)(/*13376*//*13377*/parse_expr/*<13377*//*13376*/(/*13378*/body/*<13378*/)/*<13376*/)(/*13379*/l/*<13379*/)/*<13352*/
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
return /*11566*//*11567*/foldr/*<11567*//*11566*/(/*11568*//*11569*/parse_expr/*<11569*//*11568*/(/*11570*/body/*<11570*/)/*<11568*/)(/*11571*//*11572*/pairs/*<11572*//*11571*/(/*11573*/inits/*<11573*/)/*<11571*/)(/*11574*/function name_11574(body) { return function name_11574(init) { return /*11579*/(function let_11579() {const $target = /*11586*/init/*<11586*/;
if ($target.type === ",") {
{
let pat = $target[0];
{
let value = $target[1];
return /*11587*//*11588*/eapp/*<11588*//*11587*/(/*11589*//*11590*/parse_expr/*<11590*//*11589*/(/*11591*/value/*<11591*/)/*<11589*/)(/*11592*//*11593*/elambda/*<11593*//*11592*/(/*11594*//*13345*/parse_pat/*<13345*//*11594*/(/*13346*/pat/*<13346*/)/*<11594*/)(/*11597*/body/*<11597*/)(/*11612*/l/*<11612*/)/*<11592*/)(/*11613*/l/*<11613*/)/*<11587*/
}
}
};
throw new Error('let pattern not matched 11582. ' + valueToString($target));})(/*!*/)/*<11579*/ } }/*<11574*/)/*<11566*/
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
return /*11625*//*11626*/fatal/*<11626*//*11625*/(/*11627*/`Invalid 'let' ${/*11629*//*11630*/int_to_string/*<11630*//*11629*/(/*11631*/l/*<11631*/)/*<11629*/}`/*<11627*/)/*<11625*/
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
return /*11640*//*11641*/foldl/*<11641*//*11640*/(/*11642*//*11643*/parse_expr/*<11643*//*11642*/(/*11644*/target/*<11644*/)/*<11642*/)(/*11645*/args/*<11645*/)(/*11646*/function name_11646(target) { return function name_11646(arg) { return /*11651*//*11652*/eapp/*<11652*//*11651*/(/*11653*/target/*<11653*/)(/*11654*//*11655*/parse_expr/*<11655*//*11654*/(/*11656*/arg/*<11656*/)/*<11654*/)(/*11657*/l/*<11657*/)/*<11651*/ } }/*<11646*/)/*<11640*/
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
return /*11662*//*11663*/parse_array/*<11663*//*11662*/(/*11664*/args/*<11664*/)(/*11665*/l/*<11665*/)/*<11662*/
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 11183');})(/*!*//*11185*/cst/*<11185*/)/*<11183*/ }/*<11178*/;


const parse_stmt = /*12505*/function name_12505(cst) { return /*12510*/(function match_12510($target) {
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
return /*12527*//*12528*/sdef/*<12528*//*12527*/(/*12529*/id/*<12529*/)(/*12530*/li/*<12530*/)(/*12531*//*12532*/parse_expr/*<12532*//*12531*/(/*12533*/value/*<12533*/)/*<12531*/)(/*12534*/l/*<12534*/)/*<12527*/
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
return /*12553*//*12554*/sdef/*<12554*//*12553*/(/*12555*/id/*<12555*/)(/*12556*/li/*<12556*/)(/*12557*//*12558*/parse_expr/*<12558*//*12557*/(/*12559*//*12560*/cst$sllist/*<12560*//*12559*/(/*12561*//*12561*/cons/*<12561*//*12561*/(/*12562*//*12563*/cst$slidentifier/*<12563*//*12562*/(/*12564*/"fn"/*<12564*/)(/*12566*/a/*<12566*/)/*<12562*/)(/*12561*//*12561*/cons/*<12561*//*12561*/(/*12567*//*12568*/cst$slarray/*<12568*//*12567*/(/*12569*/args/*<12569*/)(/*12570*/b/*<12570*/)/*<12567*/)(/*12561*//*12561*/cons/*<12561*//*12561*/(/*12571*/body/*<12571*/)(/*12561*/nil/*<12561*/)/*<12561*/)/*<12561*/)/*<12561*/)(/*12572*/c/*<12572*/)/*<12559*/)/*<12557*/)(/*12573*/c/*<12573*/)/*<12553*/
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
return /*12585*//*12586*/fatal/*<12586*//*12585*/(/*12587*/`Invalid 'defn' ${/*12589*//*12590*/int_to_string/*<12590*//*12589*/(/*12591*/l/*<12591*/)/*<12589*/}`/*<12587*/)/*<12585*/
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
return /*12608*//*12609*/mk_deftype/*<12609*//*12608*/(/*12610*/id/*<12610*/)(/*12611*/li/*<12611*/)(/*12612*/nil/*<12612*/)(/*12613*/items/*<12613*/)(/*12614*/l/*<12614*/)/*<12608*/
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
return /*12636*//*12637*/mk_deftype/*<12637*//*12636*/(/*12638*/id/*<12638*/)(/*12639*/li/*<12639*/)(/*12640*/args/*<12640*/)(/*12641*/items/*<12641*/)(/*12642*/l/*<12642*/)/*<12636*/
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
return /*12654*//*12655*/fatal/*<12655*//*12654*/(/*12656*/`Invalid 'deftype' ${/*12658*//*12659*/int_to_string/*<12659*//*12658*/(/*12660*/l/*<12660*/)/*<12658*/}`/*<12656*/)/*<12654*/
}
}
}
}
}
return /*12663*//*12664*/sexpr/*<12664*//*12663*/(/*12665*//*12666*/parse_expr/*<12666*//*12665*/(/*12667*/cst/*<12667*/)/*<12665*/)(/*12668*/(function match_12668($target) {
if ($target.type === "cst/list") {
{
let l = $target[1];
return /*12675*/l/*<12675*/
}
}
if ($target.type === "cst/identifier") {
{
let l = $target[1];
return /*12680*/l/*<12680*/
}
}
if ($target.type === "cst/array") {
{
let l = $target[1];
return /*12685*/l/*<12685*/
}
}
if ($target.type === "cst/string") {
{
let l = $target[2];
return /*12691*/l/*<12691*/
}
}
if ($target.type === "cst/spread") {
{
let l = $target[1];
return /*12696*/l/*<12696*/
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 12668');})(/*!*//*12670*/cst/*<12670*/)/*<12668*/)/*<12663*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 12510');})(/*!*//*12512*/cst/*<12512*/)/*<12510*/ }/*<12505*/;


const parse_array = /*11675*/function name_11675(args) { return function name_11675(l) { return /*11681*/(function match_11681($target) {
if ($target.type === "nil") {
return /*11685*//*11686*/evar/*<11686*//*11685*/(/*11687*/"nil"/*<11687*/)(/*11689*/l/*<11689*/)/*<11685*/
}
if ($target.type === "cons") {
if ($target[0].type === "cst/spread") {
{
let inner = $target[0][0];
if ($target[1].type === "nil") {
return /*11695*//*11696*/parse_expr/*<11696*//*11695*/(/*11697*/inner/*<11697*/)/*<11695*/
}
}
}
}
if ($target.type === "cons") {
{
let one = $target[0];
{
let rest = $target[1];
return /*11702*//*11703*/eapp/*<11703*//*11702*/(/*11704*//*11705*/eapp/*<11705*//*11704*/(/*11706*//*11707*/evar/*<11707*//*11706*/(/*11708*/"cons"/*<11708*/)(/*11710*/l/*<11710*/)/*<11706*/)(/*11711*//*11712*/parse_expr/*<11712*//*11711*/(/*11713*/one/*<11713*/)/*<11711*/)(/*11714*/l/*<11714*/)/*<11704*/)(/*11715*//*11716*/parse_array/*<11716*//*11715*/(/*11717*/rest/*<11717*/)(/*11718*/l/*<11718*/)/*<11715*/)(/*11719*/l/*<11719*/)/*<11702*/
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 11681');})(/*!*//*11683*/args/*<11683*/)/*<11681*/ } }/*<11675*/;

const add_inst = /*7334*/function name_7334(preds) { return function name_7334(p) { return function name_7334({0: classes, 1: defaults}) {
 return /*7686*/(function let_7686() {const $target = /*7693*/p/*<7693*/;
if ($target.type === "isin") {
{
let name = $target[0];
{
let supers = $target[1];
return /*7348*/(function match_7348($target) {
if ($target.type === "none") {
return /*7510*//*7511*/fatal/*<7511*//*7510*/(/*7512*/`no class ${/*7514*/name/*<7514*/} for instance`/*<7512*/)/*<7510*/
}
if ($target.type === "some") {
if ($target[0].type === ",") {
{
let c_supers = $target[0][0];
{
let c_instances = $target[0][1];
return /*7519*/(function let_7519() {const $target = /*7526*//*7527*/$co/*<7527*//*7526*/(/*7528*/c_supers/*<7528*/)(/*7529*//*7529*/cons/*<7529*//*7529*/(/*7530*//*7533*/$eq$gt/*<7533*//*7530*/(/*7534*/preds/*<7534*/)(/*7535*//*7536*/isin/*<7536*//*7535*/(/*7537*/name/*<7537*/)(/*7538*/supers/*<7538*/)/*<7535*/)/*<7530*/)(/*7539*/c_instances/*<7539*/)/*<7529*/)/*<7526*/;
{
let c = $target;
return (function let_7519() {const $target = /*7544*//*7545*/map/*<7545*//*7544*/(/*7548*/function name_7548({1: q}) { return /*7556*/q/*<7556*/ }/*<7548*/)(/*7567*/c_instances/*<7567*/)/*<7544*/;
{
let qs = $target;
return /*7547*/(function match_7547($target) {
if ($target === true) {
return /*7575*//*7576*/fatal/*<7576*//*7575*/(/*7577*/"overlapping instance"/*<7577*/)/*<7575*/
}
return /*7579*//*7580*/class_env/*<7580*//*7579*/(/*7581*//*7582*/map$slset/*<7582*//*7581*/(/*7583*/classes/*<7583*/)(/*7584*/name/*<7584*/)(/*7585*/c/*<7585*/)/*<7581*/)(/*7586*/defaults/*<7586*/)/*<7579*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 7547');})(/*!*//*7569*//*7570*/any/*<7570*//*7569*/(/*7571*//*7572*/overlap/*<7572*//*7571*/(/*7573*/p/*<7573*/)/*<7571*/)(/*7574*/qs/*<7574*/)/*<7569*/)/*<7547*/
};
throw new Error('let pattern not matched 7543. ' + valueToString($target));})(/*!*/)
};
throw new Error('let pattern not matched 7525. ' + valueToString($target));})(/*!*/)/*<7519*/
}
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 7348');})(/*!*//*7504*//*7505*/map$slget/*<7505*//*7504*/(/*7506*/classes/*<7506*/)(/*7507*/name/*<7507*/)/*<7504*/)/*<7348*/
}
}
};
throw new Error('let pattern not matched 7689. ' + valueToString($target));})(/*!*/)/*<7686*/ } } }/*<7334*/;

const example_insts = /*7719*//*7719*/cons/*<7719*//*7719*/(/*7720*//*7721*/add_inst/*<7721*//*7720*/(/*7722*/nil/*<7722*/)(/*7723*//*7724*/isin/*<7724*//*7723*/(/*7725*/"ord"/*<7725*/)(/*7727*/tunit/*<7727*/)/*<7723*/)/*<7720*/)(/*7719*//*7719*/cons/*<7719*//*7719*/(/*7729*//*7730*/add_inst/*<7730*//*7729*/(/*7731*/nil/*<7731*/)(/*7732*//*7733*/isin/*<7733*//*7732*/(/*7734*/"ord"/*<7734*/)(/*7736*/tchar/*<7736*/)/*<7732*/)/*<7729*/)(/*7719*//*7719*/cons/*<7719*//*7719*/(/*16675*//*16676*/add_inst/*<16676*//*16675*/(/*16677*/nil/*<16677*/)(/*16678*//*16679*/isin/*<16679*//*16678*/(/*16680*/"integral"/*<16680*/)(/*16682*/tint/*<16682*/)/*<16678*/)/*<16675*/)(/*7719*//*7719*/cons/*<7719*//*7719*/(/*16694*//*16695*/add_inst/*<16695*//*16694*/(/*16696*/nil/*<16696*/)(/*16697*//*16698*/isin/*<16698*//*16697*/(/*16699*/"num"/*<16699*/)(/*16701*/tint/*<16701*/)/*<16697*/)/*<16694*/)(/*7719*//*7719*/cons/*<7719*//*7719*/(/*16684*//*16685*/add_inst/*<16685*//*16684*/(/*16686*/nil/*<16686*/)(/*16687*//*16688*/isin/*<16688*//*16687*/(/*16689*/"floating"/*<16689*/)(/*16691*/tfloat/*<16691*/)/*<16687*/)/*<16684*/)(/*7719*//*7719*/cons/*<7719*//*7719*/(/*7745*//*7746*/add_inst/*<7746*//*7745*/(/*7747*//*7747*/cons/*<7747*//*7747*/(/*7748*//*7749*/isin/*<7749*//*7748*/(/*7750*/"ord"/*<7750*/)(/*7752*//*7753*/tvar/*<7753*//*7752*/(/*7754*//*7755*/tyvar/*<7755*//*7754*/(/*7756*/"a"/*<7756*/)(/*7758*/star/*<7758*/)/*<7754*/)(/*7759*/-1/*<7759*/)/*<7752*/)/*<7748*/)(/*7747*//*7747*/cons/*<7747*//*7747*/(/*7760*//*7761*/isin/*<7761*//*7760*/(/*7762*/"ord"/*<7762*/)(/*7764*//*7765*/tvar/*<7765*//*7764*/(/*7766*//*7767*/tyvar/*<7767*//*7766*/(/*7768*/"b"/*<7768*/)(/*7770*/star/*<7770*/)/*<7766*/)(/*7771*/-1/*<7771*/)/*<7764*/)/*<7760*/)(/*7747*/nil/*<7747*/)/*<7747*/)/*<7747*/)(/*7776*//*7777*/isin/*<7777*//*7776*/(/*7778*/"ord"/*<7778*/)(/*7798*//*7781*/mkpair/*<7781*//*7798*/(/*7782*//*7783*/tvar/*<7783*//*7782*/(/*7784*//*7785*/tyvar/*<7785*//*7784*/(/*7786*/"a"/*<7786*/)(/*7788*/star/*<7788*/)/*<7784*/)(/*7789*/-1/*<7789*/)/*<7782*/)(/*7790*//*7791*/tvar/*<7791*//*7790*/(/*7792*//*7793*/tyvar/*<7793*//*7792*/(/*7794*/"b"/*<7794*/)(/*7796*/star/*<7796*/)/*<7792*/)(/*7797*/-1/*<7797*/)/*<7790*/)/*<7798*/)/*<7776*/)/*<7745*/)(/*7719*/nil/*<7719*/)/*<7719*/)/*<7719*/)/*<7719*/)/*<7719*/)/*<7719*/)/*<7719*/;

const reduce = /*8502*/function name_8502(ce) { return function name_8502(ps) { return /*8509*/(function match_8509($target) {
if ($target.type === "ok") {
{
let qs = $target[0];
return /*8518*//*8519*/ok/*<8519*//*8518*/(/*8520*//*8521*/simplify/*<8521*//*8520*/(/*8522*/ce/*<8522*/)(/*8523*/qs/*<8523*/)/*<8520*/)/*<8518*/
}
}
if ($target.type === "err") {
{
let e = $target[0];
return /*8527*//*8528*/err/*<8528*//*8527*/(/*8529*/e/*<8529*/)/*<8527*/
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 8509');})(/*!*//*8511*//*8512*/to_hnfs/*<8512*//*8511*/(/*8513*/ce/*<8513*/)(/*8514*/ps/*<8514*/)/*<8511*/)/*<8509*/ } }/*<8502*/;

const infer$slprim = /*9595*/function name_9595(prim) { return /*9601*/(function match_9601($target) {
if ($target.type === "pbool") {
return /*9615*//*9616*/ti_return/*<9616*//*9615*/(/*9608*//*9612*/$co/*<9612*//*9608*/(/*9613*/nil/*<9613*/)(/*9614*/tbool/*<9614*/)/*<9608*/)/*<9615*/
}
if ($target.type === "pfloat") {
return /*20405*//*20406*/$gt$gt$eq/*<20406*//*20405*/(/*20410*//*20412*/new_tvar/*<20412*//*20410*/(/*20413*/star/*<20413*/)/*<20410*/)(/*20405*/function name_20405(v) { return /*20414*//*20415*/ti_return/*<20415*//*20414*/(/*20416*//*20417*/$co/*<20417*//*20416*/(/*20418*//*20418*/cons/*<20418*//*20418*/(/*20419*//*20420*/isin/*<20420*//*20419*/(/*20421*/"floating"/*<20421*/)(/*20423*/v/*<20423*/)/*<20419*/)(/*20418*/nil/*<20418*/)/*<20418*/)(/*20426*/v/*<20426*/)/*<20416*/)/*<20414*/ }/*<20405*/)/*<20405*/
}
if ($target.type === "pint") {
return /*9767*//*9768*/$gt$gt$eq/*<9768*//*9767*/(/*9771*//*9821*/new_tvar/*<9821*//*9771*/(/*9822*/star/*<9822*/)/*<9771*/)(/*9767*/function name_9767(v) { return /*9776*//*9777*/ti_return/*<9777*//*9776*/(/*9778*//*9779*/$co/*<9779*//*9778*/(/*9780*//*9780*/cons/*<9780*//*9780*/(/*9781*//*9782*/isin/*<9782*//*9781*/(/*9783*/"num"/*<9783*/)(/*9785*/v/*<9785*/)/*<9781*/)(/*9780*/nil/*<9780*/)/*<9780*/)(/*9786*/v/*<9786*/)/*<9778*/)/*<9776*/ }/*<9767*/)/*<9767*/
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 9601');})(/*!*//*9603*/prim/*<9603*/)/*<9601*/ }/*<9595*/;

const ti_from_result = /*13810*/function name_13810(result) { return /*13816*/(function match_13816($target) {
if ($target.type === "ok") {
{
let v = $target[0];
return /*13822*//*13823*/$lt_/*<13823*//*13822*/(/*13824*/v/*<13824*/)/*<13822*/
}
}
if ($target.type === "err") {
{
let e = $target[0];
return /*13828*//*21259*/ti_err/*<21259*//*13828*/(/*21260*/e/*<21260*/)/*<13828*/
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 13816');})(/*!*//*13818*/result/*<13818*/)/*<13816*/ }/*<13810*/;

const withDefaults = /*14182*/function name_14182(f) { return function name_14182(ce) { return function name_14182(known_variables) { return function name_14182(predicates) { return /*14192*/(function let_14192() {const $target = /*14207*//*14208*/ambiguities/*<14208*//*14207*/(/*14209*/ce/*<14209*/)(/*14210*/known_variables/*<14210*/)(/*14211*/predicates/*<14211*/)/*<14207*/;
{
let vps = $target;
return (function let_14192() {const $target = /*14200*//*14201*/map/*<14201*//*14200*/(/*14202*//*14203*/candidates/*<14203*//*14202*/(/*14204*/ce/*<14204*/)/*<14202*/)(/*14205*/vps/*<14205*/)/*<14200*/;
{
let tss = $target;
return /*14212*/(function match_14212($target) {
if ($target === true) {
return /*14218*//*14219*/err/*<14219*//*14218*/(/*14220*/`Cannot resolve ambiguity vps: ${/*19300*//*19392*/vps_$gts/*<19392*//*19300*/(/*19393*/vps/*<19393*/)/*<19300*/} tss: ${/*19278*//*19394*/tss_$gts/*<19394*//*19278*/(/*19395*/tss/*<19395*/)/*<19278*/}`/*<14220*/)/*<14218*/
}
return /*14233*//*14234*/ok/*<14234*//*14233*/(/*14235*//*14236*/f/*<14236*//*14235*/(/*14237*/vps/*<14237*/)(/*14238*//*14239*/map/*<14239*//*14238*/(/*14240*/head/*<14240*/)(/*14241*/tss/*<14241*/)/*<14238*/)/*<14235*/)/*<14233*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 14212');})(/*!*//*14214*//*14215*/any/*<14215*//*14214*/(/*19417*/is_empty/*<19417*/)(/*14217*/tss/*<14217*/)/*<14214*/)/*<14212*/
};
throw new Error('let pattern not matched 14199. ' + valueToString($target));})(/*!*/)
};
throw new Error('let pattern not matched 14206. ' + valueToString($target));})(/*!*/)/*<14192*/ } } } }/*<14182*/;

const defaultedPreds = /*14360*//*14361*/withDefaults/*<14361*//*14360*/(/*14362*/function name_14362(vps) { return function name_14362(ts) { return /*14367*//*14368*/concat/*<14368*//*14367*/(/*14369*//*14370*/map/*<14370*//*14369*/(/*14371*/snd/*<14371*/)(/*14372*/vps/*<14372*/)/*<14369*/)/*<14367*/ } }/*<14362*/)/*<14360*/;

const defaultSubst = /*14377*//*14378*/withDefaults/*<14378*//*14377*/(/*14379*/function name_14379(vps) { return function name_14379(ts) { return /*15878*//*15879*/map$slfrom_list/*<15879*//*15878*/(/*14384*//*14385*/zip/*<14385*//*14384*/(/*14386*//*14388*/map/*<14388*//*14386*/(/*14389*/fst/*<14389*/)(/*14390*/vps/*<14390*/)/*<14386*/)(/*14391*/ts/*<14391*/)/*<14384*/)/*<15878*/ } }/*<14379*/)/*<14377*/;

const infer$slseq = /*14687*/function name_14687(ti) { return function name_14687(ce) { return function name_14687(as) { return function name_14687(assumptions) { return /*14697*/(function match_14697($target) {
if ($target.type === "nil") {
return /*14701*//*14702*/$lt_/*<14702*//*14701*/(/*14703*//*14704*/$co/*<14704*//*14703*/(/*14705*/nil/*<14705*/)(/*14706*/nil/*<14706*/)/*<14703*/)/*<14701*/
}
if ($target.type === "cons") {
{
let bs = $target[0];
{
let bss = $target[1];
return /*14713*//*14714*/$gt$gt$eq/*<14714*//*14713*/(/*14720*//*14721*/ti/*<14721*//*14720*/(/*14722*/ce/*<14722*/)(/*14723*/as/*<14723*/)(/*14724*/bs/*<14724*/)/*<14720*/)(/*14713*/function name_14713({0: ps, 1: as$qu}) {
 return /*14713*//*14714*/$gt$gt$eq/*<14714*//*14713*/(/*14729*//*14730*/infer$slseq/*<14730*//*14729*/(/*14731*/ti/*<14731*/)(/*14732*/ce/*<14732*/)(/*14733*//*14734*/$pl$pl$pl/*<14734*//*14733*/(/*14735*/as$qu/*<14735*/)(/*14736*/as/*<14736*/)/*<14733*/)(/*14737*/bss/*<14737*/)/*<14729*/)(/*14713*/function name_14713({0: qs, 1: as$qu$qu}) {
 return /*14738*//*14739*/$lt_/*<14739*//*14738*/(/*14740*//*14741*/$co/*<14741*//*14740*/(/*14742*//*14743*/$pl$pl$pl/*<14743*//*14742*/(/*14744*/ps/*<14744*/)(/*14745*/qs/*<14745*/)/*<14742*/)(/*14746*//*14747*/$pl$pl$pl/*<14747*//*14746*/(/*14748*/as$qu$qu/*<14748*/)(/*14749*/as$qu/*<14749*/)/*<14746*/)/*<14740*/)/*<14738*/ }/*<14713*/)/*<14713*/ }/*<14713*/)/*<14713*/
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 14697');})(/*!*//*14699*/assumptions/*<14699*/)/*<14697*/ } } } }/*<14687*/;

const sequence = /*15098*/function name_15098(tis) { return /*15104*/(function match_15104($target) {
if ($target.type === "nil") {
return /*15108*//*15109*/$lt_/*<15109*//*15108*/(/*15110*/nil/*<15110*/)/*<15108*/
}
if ($target.type === "cons") {
{
let one = $target[0];
if ($target[1].type === "nil") {
return /*15113*//*15114*/$gt$gt$eq/*<15114*//*15113*/(/*15119*/one/*<15119*/)(/*15113*/function name_15113(res) { return /*15120*//*15121*/$lt_/*<15121*//*15120*/(/*15122*//*15122*/cons/*<15122*//*15122*/(/*15123*/res/*<15123*/)(/*15122*/nil/*<15122*/)/*<15122*/)/*<15120*/ }/*<15113*/)/*<15113*/
}
}
}
if ($target.type === "cons") {
{
let one = $target[0];
{
let rest = $target[1];
return /*15131*//*15132*/$gt$gt$eq/*<15132*//*15131*/(/*15138*/one/*<15138*/)(/*15131*/function name_15131(res) { return /*15131*//*15132*/$gt$gt$eq/*<15132*//*15131*/(/*15142*//*15143*/sequence/*<15143*//*15142*/(/*15144*/rest/*<15144*/)/*<15142*/)(/*15131*/function name_15131(rest) { return /*15145*//*15147*/$lt_/*<15147*//*15145*/(/*15148*//*15148*/cons/*<15148*//*15148*/(/*15149*/res/*<15149*/)(/*15150*/rest/*<15150*/)/*<15148*/)/*<15145*/ }/*<15131*/)/*<15131*/ }/*<15131*/)/*<15131*/
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 15104');})(/*!*//*15106*/tis/*<15106*/)/*<15104*/ }/*<15098*/;

const assump_$gts = /*16024*/function name_16024({0: name, 1: {0: kinds, 1: {0: preds, 1: type}}}) {


 return /*16040*/`${/*16036*/name/*<16036*/}: ${/*16085*/(function match_16085($target) {
if ($target.type === "nil") {
return /*16089*/""/*<16089*/
}
return /*16092*/`${/*16043*//*16045*/join/*<16045*//*16043*/(/*16046*/"; "/*<16046*/)(/*16048*//*16049*/mapi/*<16049*//*16048*/(/*20112*/function name_20112(kind) { return function name_20112(i) { return /*20119*/`${/*20124*//*20126*/gen_name/*<20126*//*20124*/(/*20127*/i/*<20127*/)/*<20124*/} ${/*20122*//*20113*/kind_$gts/*<20113*//*20122*/(/*20123*/kind/*<20123*/)/*<20122*/}`/*<20119*/ } }/*<20112*/)(/*20130*/0/*<20130*/)(/*16052*/kinds/*<16052*/)/*<16048*/)/*<16043*/}; `/*<16092*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 16085');})(/*!*//*16087*/kinds/*<16087*/)/*<16085*/}${/*16095*/(function match_16095($target) {
if ($target.type === "nil") {
return /*16099*/""/*<16099*/
}
return /*16104*/`${/*16077*//*16078*/join/*<16078*//*16077*/(/*16079*/"; "/*<16079*/)(/*16053*//*16074*/map/*<16074*//*16053*/(/*16075*/pred_$gts/*<16075*/)(/*16076*/preds/*<16076*/)/*<16053*/)/*<16077*/}; `/*<16104*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 16095');})(/*!*//*16097*/preds/*<16097*/)/*<16095*/}${/*16081*//*16083*/type_$gts/*<16083*//*16081*/(/*16084*/type/*<16084*/)/*<16081*/}`/*<16040*/ }/*<16024*/;

const assumps_$gts = /*16165*//*16166*/dot/*<16166*//*16165*/(/*16184*//*16185*/join/*<16185*//*16184*/(/*16186*/"\n"/*<16186*/)/*<16184*/)(/*16162*//*16163*/map/*<16163*//*16162*/(/*16164*/assump_$gts/*<16164*/)/*<16162*/)/*<16165*/;

const builtin_env = /*16706*//*16707*/apply_transformers/*<16707*//*16706*/(/*16708*/example_insts/*<16708*/)(/*16709*//*16710*/add_prelude_classes/*<16710*//*16709*/(/*16711*/initial_env/*<16711*/)/*<16709*/)/*<16706*/;

const parse_binding = /*19479*/function name_19479(jcst) { return /*19486*/(function match_19486($target) {
if ($target.type === "cst/list") {
if ($target[0].type === "cons") {
if ($target[0][0].type === "cst/identifier") {
if ($target[0][0][0] === "fn"){
{
let l = $target[0][0][1];
if ($target[0][1].type === "cons") {
if ($target[0][1][0].type === "cst/array") {
{
let items = $target[0][1][0][0];
if ($target[0][1][1].type === "cons") {
{
let body = $target[0][1][1][0];
if ($target[0][1][1][1].type === "nil") {
return /*19517*//*19528*/$co/*<19528*//*19517*/(/*19529*/"it"/*<19529*/)(/*19530*//*19530*/cons/*<19530*//*19530*/(/*19531*//*19532*/$co/*<19532*//*19531*/(/*19533*//*19534*/map/*<19534*//*19533*/(/*19535*/parse_pat/*<19535*/)(/*19536*/items/*<19536*/)/*<19533*/)(/*19537*//*19538*/parse_expr/*<19538*//*19537*/(/*19539*/body/*<19539*/)/*<19537*/)/*<19531*/)(/*19530*/nil/*<19530*/)/*<19530*/)/*<19517*/
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
return /*19647*//*19648*/$co/*<19648*//*19647*/(/*19649*/"it"/*<19649*/)(/*19651*//*19651*/cons/*<19651*//*19651*/(/*19652*//*19653*/$co/*<19653*//*19652*/(/*19654*/nil/*<19654*/)(/*19655*//*19656*/parse_expr/*<19656*//*19655*/(/*19657*/jcst/*<19657*/)/*<19655*/)/*<19652*/)(/*19651*/nil/*<19651*/)/*<19651*/)/*<19647*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 19486');})(/*!*//*19488*/jcst/*<19488*/)/*<19486*/ }/*<19479*/;

const program_results_$gts = /*19546*//*19547*/result_$gts/*<19547*//*19546*/(/*16133*/function name_16133({0: abc, 1: tenv, 2: a, 3: b}) {


 return /*16137*//*16144*/join/*<16144*//*16137*/(/*16145*/"\n"/*<16145*/)(/*16147*//*16148*/map/*<16148*//*16147*/(/*16149*/assump_$gts/*<16149*/)(/*16150*/b/*<16150*/)/*<16147*/)/*<16137*/ }/*<16133*/)/*<19546*/;

const builtin_ce = /*19801*//*19802*/apply_transformers/*<19802*//*19801*/(/*19857*//*19803*/map/*<19803*//*19857*/(/*19858*/function name_19858({1: {0: a, 1: b}}) {
 return /*19871*//*19872*/add_inst/*<19872*//*19871*/(/*19873*/a/*<19873*/)(/*19874*/b/*<19874*/)/*<19871*/ }/*<19858*/)(/*19861*/builtin_instances/*<19861*/)/*<19857*/)(/*19804*//*19805*/add_prelude_classes/*<19805*//*19804*/(/*19806*/initial_env/*<19806*/)/*<19804*/)/*<19801*/;

const map$slti = /*20432*/function name_20432(f) { return function name_20432(arr) { return /*20440*/(function match_20440($target) {
if ($target.type === "nil") {
return /*20444*//*20445*/$lt_/*<20445*//*20444*/(/*20446*/nil/*<20446*/)/*<20444*/
}
if ($target.type === "cons") {
{
let one = $target[0];
{
let rest = $target[1];
return /*20453*//*20454*/$gt$gt$eq/*<20454*//*20453*/(/*20459*//*20460*/f/*<20460*//*20459*/(/*20461*/one/*<20461*/)/*<20459*/)(/*20453*/function name_20453(res) { return /*20453*//*20454*/$gt$gt$eq/*<20454*//*20453*/(/*20465*//*20466*/map$slti/*<20466*//*20465*/(/*20467*/f/*<20467*/)(/*20468*/rest/*<20468*/)/*<20465*/)(/*20453*/function name_20453(rest) { return /*20469*//*20470*/$lt_/*<20470*//*20469*/(/*20471*//*20471*/cons/*<20471*//*20471*/(/*20472*/res/*<20472*/)(/*20473*/rest/*<20473*/)/*<20471*/)/*<20469*/ }/*<20453*/)/*<20453*/ }/*<20453*/)/*<20453*/
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 20440');})(/*!*//*20442*/arr/*<20442*/)/*<20440*/ } }/*<20432*/;

const builtin_full = /*20548*//*20549*/full_env/*<20549*//*20548*/(/*20550*/builtin_tenv/*<20550*/)(/*20551*/builtin_ce/*<20551*/)(/*20552*/builtin_assumptions/*<20552*/)/*<20548*/;

const evaluator = (v0) => (v1) => (v2) => ({type: "evaluator", 0: v0, 1: v1, 2: v2});
const ok_$gtti = /*21246*/ti_from_result/*<21246*/;

const type_env_$gts = /*23692*/function name_23692({0: constructors, 1: types, 2: aliases}) {

 return /*23702*/`## Constructors${/*23704*//*23707*/ljoin/*<23707*//*23704*/(/*23708*/"\n - "/*<23708*/)(/*23710*//*23711*/map/*<23711*//*23710*/(/*23715*/function name_23715({0: name, 1: scheme}) {
 return /*23722*/`${/*23724*/name/*<23724*/}: ${/*23726*//*23728*/scheme_$gts/*<23728*//*23726*/(/*23729*/scheme/*<23729*/)/*<23726*/}`/*<23722*/ }/*<23715*/)(/*23712*//*23713*/map$slto_list/*<23713*//*23712*/(/*23714*/constructors/*<23714*/)/*<23712*/)/*<23710*/)/*<23704*/}`/*<23702*/ }/*<23692*/;

const class_env_$gts = /*23794*/function name_23794({0: instances, 1: defaults}) {
 return /*23803*/`## Instances${/*23814*//*23816*/ljoin/*<23816*//*23814*/(/*23817*/"\n"/*<23817*/)(/*23819*//*23820*/map/*<23820*//*23819*/(/*23821*/function name_23821({0: name, 1: {0: ones, 1: quals}}) {

 return /*23828*/`${/*23836*/name/*<23836*/} ${/*23900*/(function match_23900($target) {
if ($target.type === "nil") {
return /*23904*/""/*<23904*/
}
return /*23911*/` <- ${/*23838*//*23840*/join/*<23840*//*23838*/(/*23841*/", "/*<23841*/)(/*23843*/ones/*<23843*/)/*<23838*/}`/*<23911*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 23900');})(/*!*//*23902*/ones/*<23902*/)/*<23900*/}${/*23964*/(function match_23964($target) {
if ($target.type === "nil") {
return /*23968*/"\n - (no instances)"/*<23968*/
}
return /*23844*//*23846*/ljoin/*<23846*//*23844*/(/*23847*/"\n - "/*<23847*/)(/*23849*//*23850*/map/*<23850*//*23849*/(/*23853*//*23851*/qual_$gts/*<23851*//*23853*/(/*23854*/pred_$gts/*<23854*/)/*<23853*/)(/*23852*/quals/*<23852*/)/*<23849*/)/*<23844*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 23964');})(/*!*//*23966*/quals/*<23966*/)/*<23964*/}`/*<23828*/ }/*<23821*/)(/*23833*//*23834*/map$slto_list/*<23834*//*23833*/(/*23835*/instances/*<23835*/)/*<23833*/)/*<23819*/)/*<23814*/}\n## Defaults${/*23805*//*23807*/ljoin/*<23807*//*23805*/(/*23808*/"\n - "/*<23808*/)(/*23810*//*23811*/map/*<23811*//*23810*/(/*23812*/type_$gts/*<23812*/)(/*23813*/defaults/*<23813*/)/*<23810*/)/*<23805*/}`/*<23803*/ }/*<23794*/;

const run = /*25529*/function name_25529(v) { return /*25534*//*25535*/eval/*<25535*//*25534*/(/*25536*//*25537*/compile/*<25537*//*25536*/(/*25538*//*25539*/parse_expr/*<25539*//*25538*/(/*25540*/v/*<25540*/)/*<25538*/)(/*25541*/map$slnil/*<25541*/)/*<25536*/)/*<25534*/ }/*<25529*/;

const fresh_inst = /*9664*/function name_9664({0: ks, 1: qt}) {
 return /*9754*//*9755*/$gt$gt$eq/*<9755*//*9754*/(/*9679*//*9680*/map$slti/*<9680*//*9679*/(/*9681*/new_tvar/*<9681*/)(/*9682*/ks/*<9682*/)/*<9679*/)(/*9754*/function name_9754(ts) { return /*9759*//*9760*/$lt_/*<9760*//*9759*/(/*9761*//*9762*/inst$slqual/*<9762*//*9761*/(/*9763*/ts/*<9763*/)(/*9764*/inst$sltype/*<9764*/)(/*9765*/qt/*<9765*/)/*<9761*/)/*<9759*/ }/*<9754*/)/*<9754*/ }/*<9664*/;

const split = /*13730*/function name_13730(ce) { return function name_13730(fs) { return function name_13730(gs) { return function name_13730(ps) { return /*13739*//*13740*/$gt$gt$eq/*<13740*//*13739*/(/*13808*//*13809*/ti_from_result/*<13809*//*13808*/(/*13743*//*13744*/reduce/*<13744*//*13743*/(/*13745*/ce/*<13745*/)(/*13746*/ps/*<13746*/)/*<13743*/)/*<13808*/)(/*13739*/function name_13739(ps$qu) { return /*13739*//*13740*/$gt$gt$eq/*<13740*//*13739*/(/*13786*//*13787*/$lt_/*<13787*//*13786*/(/*13754*//*13755*/partition/*<13755*//*13754*/(/*13756*/ps$qu/*<13756*/)(/*13757*/function name_13757({0: name, 1: type}) {
 return /*13761*//*13766*/every/*<13766*//*13761*/(/*13936*//*13937*/set$slto_list/*<13937*//*13936*/(/*13767*//*13768*/type$sltv/*<13768*//*13767*/(/*13769*/type/*<13769*/)/*<13767*/)/*<13936*/)(/*13770*/function name_13770(x) { return /*13774*//*13775*/contains/*<13775*//*13774*/(/*13776*/fs/*<13776*/)(/*13777*/x/*<13777*/)(/*13778*/tyvar$eq/*<13778*/)/*<13774*/ }/*<13770*/)/*<13761*/ }/*<13757*/)/*<13754*/)/*<13786*/)(/*13739*/function name_13739({0: ds, 1: rs}) {
 return /*13739*//*13740*/$gt$gt$eq/*<13740*//*13739*/(/*14754*//*14755*/ti_from_result/*<14755*//*14754*/(/*13791*//*13792*/defaultedPreds/*<13792*//*13791*/(/*13793*/ce/*<13793*/)(/*13794*//*13795*/concat/*<13795*//*13794*/(/*13796*//*13796*/cons/*<13796*//*13796*/(/*13797*/fs/*<13797*/)(/*13796*//*13796*/cons/*<13796*//*13796*/(/*13798*/gs/*<13798*/)(/*13796*/nil/*<13796*/)/*<13796*/)/*<13796*/)/*<13794*/)(/*13799*/rs/*<13799*/)/*<13791*/)/*<14754*/)(/*13739*/function name_13739(rs$qu) { return /*13779*//*13800*/ti_return/*<13800*//*13779*/(/*13801*//*13802*/$co/*<13802*//*13801*/(/*13803*/ds/*<13803*/)(/*13804*//*13805*/without/*<13805*//*13804*/(/*13806*/rs/*<13806*/)(/*13807*/rs$qu/*<13807*/)(/*14331*/pred$eq/*<14331*/)/*<13804*/)/*<13801*/)/*<13779*/ }/*<13739*/)/*<13739*/ }/*<13739*/)/*<13739*/ }/*<13739*/)/*<13739*/ } } } }/*<13730*/;

const unify = /*21147*/function name_21147(t1) { return function name_21147(t2) { return /*21155*//*21156*/$gt$gt$eq/*<21156*//*21155*/(/*21160*/get_subst/*<21160*/)(/*21155*/function name_21155(subst) { return /*21155*//*21156*/$gt$gt$eq/*<21156*//*21155*/(/*21164*//*21165*/ok_$gtti/*<21165*//*21164*/(/*21231*//*21232*/map_err/*<21232*//*21231*/(/*21235*//*21236*/unify_err/*<21236*//*21235*/(/*21238*/t1/*<21238*/)(/*21239*/t2/*<21239*/)/*<21235*/)(/*21166*//*21167*/mgu/*<21167*//*21166*/(/*21168*//*21170*/type$slapply/*<21170*//*21168*/(/*21171*/subst/*<21171*/)(/*21172*/t1/*<21172*/)/*<21168*/)(/*21173*//*21174*/type$slapply/*<21174*//*21173*/(/*21175*/subst/*<21175*/)(/*21176*/t2/*<21176*/)/*<21173*/)/*<21166*/)/*<21231*/)/*<21164*/)(/*21155*/function name_21155(u) { return /*21162*//*21178*/add_subst/*<21178*//*21162*/(/*21179*/u/*<21179*/)/*<21162*/ }/*<21155*/)/*<21155*/ }/*<21155*/)/*<21155*/ } }/*<21147*/;

const full_env_$gts = /*23670*/function name_23670({0: tenv, 1: cenv, 2: assumps}) {

 return /*23688*/`# Type Env\n${/*23690*//*23791*/type_env_$gts/*<23791*//*23690*/(/*23793*/tenv/*<23793*/)/*<23690*/}\n# Class Env\n${/*23891*//*23893*/class_env_$gts/*<23893*//*23891*/(/*23894*/cenv/*<23894*/)/*<23891*/}\n# Assumps${/*23994*//*23997*/ljoin/*<23997*//*23994*/(/*23998*/"\n"/*<23998*/)(/*24000*//*24001*/map/*<24001*//*24000*/(/*24002*/assump_$gts/*<24002*/)(/*24003*/assumps/*<24003*/)/*<24000*/)/*<23994*/}`/*<23688*/ }/*<23670*/;

const infer$slpat = /*9727*/function name_9727(pat) { return /*9791*/(function match_9791($target) {
if ($target.type === "pvar") {
{
let name = $target[0];
{
let l = $target[1];
return /*9797*//*9803*/$gt$gt$eq/*<9803*//*9797*/(/*9806*//*9823*/new_tvar/*<9823*//*9806*/(/*9824*/star/*<9824*/)/*<9806*/)(/*9797*/function name_9797(v) { return /*9825*//*9827*/ti_return/*<9827*//*9825*/(/*9828*//*9829*/$co$co/*<9829*//*9828*/(/*9830*/nil/*<9830*/)(/*9831*//*9831*/cons/*<9831*//*9831*/(/*9832*//*9833*/$ex$gt$ex/*<9833*//*9832*/(/*9834*/name/*<9834*/)(/*9835*//*9836*/to_scheme/*<9836*//*9835*/(/*9837*/v/*<9837*/)/*<9835*/)/*<9832*/)(/*9831*/nil/*<9831*/)/*<9831*/)(/*9838*/v/*<9838*/)/*<9828*/)/*<9825*/ }/*<9797*/)/*<9797*/
}
}
}
if ($target.type === "pany") {
{
let l = $target[0];
return /*9842*//*9844*/$gt$gt$eq/*<9844*//*9842*/(/*9847*//*9848*/new_tvar/*<9848*//*9847*/(/*9849*/star/*<9849*/)/*<9847*/)(/*9842*/function name_9842(v) { return /*9850*//*9851*/ti_return/*<9851*//*9850*/(/*9852*//*9853*/$co$co/*<9853*//*9852*/(/*9854*/nil/*<9854*/)(/*9855*/nil/*<9855*/)(/*9856*/v/*<9856*/)/*<9852*/)/*<9850*/ }/*<9842*/)/*<9842*/
}
}
if ($target.type === "pprim") {
{
let prim = $target[0];
{
let l = $target[1];
return /*9862*//*9863*/$gt$gt$eq/*<9863*//*9862*/(/*9871*//*9873*/infer$slprim/*<9873*//*9871*/(/*9874*/prim/*<9874*/)/*<9871*/)(/*9862*/function name_9862({0: ps, 1: t}) {
 return /*9875*//*9876*/ti_return/*<9876*//*9875*/(/*9877*//*9878*/$co$co/*<9878*//*9877*/(/*9879*/ps/*<9879*/)(/*9880*/nil/*<9880*/)(/*9881*/t/*<9881*/)/*<9877*/)/*<9875*/ }/*<9862*/)/*<9862*/
}
}
}
if ($target.type === "pcon") {
{
let name = $target[0];
{
let patterns = $target[1];
{
let l = $target[2];
return /*9977*//*9978*/$gt$gt$eq/*<9978*//*9977*/(/*21373*//*21374*/get_constructor/*<21374*//*21373*/(/*21375*/name/*<21375*/)/*<21373*/)(/*9977*/function name_9977(scheme) { return /*9977*//*9978*/$gt$gt$eq/*<9978*//*9977*/(/*9987*//*9988*/infer$slpats/*<9988*//*9987*/(/*9989*/patterns/*<9989*/)/*<9987*/)(/*9977*/function name_9977({0: ps, 1: as, 2: ts}) {

 return /*9977*//*9978*/$gt$gt$eq/*<9978*//*9977*/(/*9991*//*9992*/new_tvar/*<9992*//*9991*/(/*9993*/star/*<9993*/)/*<9991*/)(/*9977*/function name_9977(t$qu) { return /*9977*//*9978*/$gt$gt$eq/*<9978*//*9977*/(/*10002*//*10003*/fresh_inst/*<10003*//*10002*/(/*10004*/scheme/*<10004*/)/*<10002*/)(/*9977*/function name_9977({0: qs, 1: t}) {
 return /*9977*//*9978*/$gt$gt$eq/*<9978*//*9977*/(/*10014*//*10015*/unify/*<10015*//*10014*/(/*10016*/t/*<10016*/)(/*10017*//*10018*/foldr/*<10018*//*10017*/(/*10020*/t$qu/*<10020*/)(/*10021*/ts/*<10021*/)(/*10156*/function name_10156(res) { return function name_10156(arg) { return /*16623*//*16624*/tfn/*<16624*//*16623*/(/*16625*/arg/*<16625*/)(/*16626*/res/*<16626*/)/*<16623*/ } }/*<10156*/)/*<10017*/)/*<10014*/)(/*9977*/function name_9977(_) { return /*9995*//*10022*/$lt_/*<10022*//*9995*/(/*10023*//*10024*/$co$co/*<10024*//*10023*/(/*10025*//*10026*/concat/*<10026*//*10025*/(/*10027*//*10027*/cons/*<10027*//*10027*/(/*10028*/ps/*<10028*/)(/*10027*//*10027*/cons/*<10027*//*10027*/(/*10029*/qs/*<10029*/)(/*10027*/nil/*<10027*/)/*<10027*/)/*<10027*/)/*<10025*/)(/*10031*/as/*<10031*/)(/*10032*/t$qu/*<10032*/)/*<10023*/)/*<9995*/ }/*<9977*/)/*<9977*/ }/*<9977*/)/*<9977*/ }/*<9977*/)/*<9977*/ }/*<9977*/)/*<9977*/ }/*<9977*/)/*<9977*/
}
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 9791');})(/*!*//*9793*/pat/*<9793*/)/*<9791*/ }/*<9727*/;


const infer$slpats = /*10033*/function name_10033(pats) { return /*10039*//*10040*/$gt$gt$eq/*<10040*//*10039*/(/*10043*//*10044*/map$slti/*<10044*//*10043*/(/*10045*/infer$slpat/*<10045*/)(/*10046*/pats/*<10046*/)/*<10043*/)(/*10039*/function name_10039(psasts) { return /*10056*/(function let_10056() {const $target = /*10060*//*10061*/concat/*<10061*//*10060*/(/*10062*//*10063*/map/*<10063*//*10062*/(/*10064*/function name_10064({0: ps$qu}) { return /*10072*/ps$qu/*<10072*/ }/*<10064*/)(/*10073*/psasts/*<10073*/)/*<10062*/)/*<10060*/;
{
let ps = $target;
return (function let_10056() {const $target = /*10075*//*10076*/concat/*<10076*//*10075*/(/*10077*//*10078*/map/*<10078*//*10077*/(/*10079*/function name_10079({1: as$qu}) { return /*10087*/as$qu/*<10087*/ }/*<10079*/)(/*10088*/psasts/*<10088*/)/*<10077*/)/*<10075*/;
{
let as = $target;
return (function let_10056() {const $target = /*10090*//*10091*/map/*<10091*//*10090*/(/*10092*/function name_10092({2: t}) { return /*10100*/t/*<10100*/ }/*<10092*/)(/*10101*/psasts/*<10101*/)/*<10090*/;
{
let ts = $target;
return /*10048*//*10050*/ti_return/*<10050*//*10048*/(/*10051*//*10052*/$co$co/*<10052*//*10051*/(/*10053*/ps/*<10053*/)(/*10054*/as/*<10054*/)(/*10055*/ts/*<10055*/)/*<10051*/)/*<10048*/
};
throw new Error('let pattern not matched 10089. ' + valueToString($target));})(/*!*/)
};
throw new Error('let pattern not matched 10074. ' + valueToString($target));})(/*!*/)
};
throw new Error('let pattern not matched 10059. ' + valueToString($target));})(/*!*/)/*<10056*/ }/*<10039*/)/*<10039*/ }/*<10033*/;

const infer$slexpr = /*10162*/function name_10162(ce) { return function name_10162(as) { return function name_10162(expr) { return /*10168*/(function match_10168($target) {
if ($target.type === "evar") {
{
let name = $target[0];
{
let l = $target[1];
return /*10268*//*10269*/$gt$gt$eq/*<10269*//*10268*/(/*21378*//*21379*/ok_$gtti/*<21379*//*21378*/(/*21380*//*21381*/find_scheme/*<21381*//*21380*/(/*21382*/name/*<21382*/)(/*21383*/as/*<21383*/)/*<21380*/)/*<21378*/)(/*10268*/function name_10268(sc) { return /*10268*//*10269*/$gt$gt$eq/*<10269*//*10268*/(/*10277*//*10278*/fresh_inst/*<10278*//*10277*/(/*10279*/sc/*<10279*/)/*<10277*/)(/*10268*/function name_10268({0: ps, 1: t}) {
 return /*10280*//*10281*/$lt_/*<10281*//*10280*/(/*10282*//*10283*/$co/*<10283*//*10282*/(/*10284*/ps/*<10284*/)(/*10285*/t/*<10285*/)/*<10282*/)/*<10280*/ }/*<10268*/)/*<10268*/ }/*<10268*/)/*<10268*/
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
return /*18973*//*18974*/$gt$gt$eq/*<18974*//*18973*/(/*18989*//*18990*/map$slti/*<18990*//*18989*/(/*18992*//*18991*/infer$slexpr/*<18991*//*18992*/(/*18993*/ce/*<18993*/)(/*18994*/as/*<18994*/)/*<18992*/)(/*18996*//*18995*/map/*<18995*//*18996*/(/*18998*/function name_18998({0: expr}) { return /*19006*/expr/*<19006*/ }/*<18998*/)(/*19007*/templates/*<19007*/)/*<18996*/)/*<18989*/)(/*18973*/function name_18973(results) { return /*18973*//*18974*/$gt$gt$eq/*<18974*//*18973*/(/*19138*//*19139*/$lt_/*<19139*//*19138*/(/*19140*//*19141*/unzip/*<19141*//*19140*/(/*19142*/results/*<19142*/)/*<19140*/)/*<19138*/)(/*18973*/function name_18973({0: ps, 1: types}) {
 return /*18973*//*18974*/$gt$gt$eq/*<18974*//*18973*/(/*19148*//*19149*/map$slti/*<19149*//*19148*/(/*19150*/function name_19150(_) { return /*19154*//*19155*/fresh_inst/*<19155*//*19154*/(/*19172*//*19173*/forall/*<19173*//*19172*/(/*19174*//*19174*/cons/*<19174*//*19174*/(/*19175*/star/*<19175*/)(/*19174*/nil/*<19174*/)/*<19174*/)(/*19156*//*19157*/$eq$gt/*<19157*//*19156*/(/*19158*//*19158*/cons/*<19158*//*19158*/(/*19159*//*19160*/isin/*<19160*//*19159*/(/*19161*/"pretty"/*<19161*/)(/*19163*//*19165*/tgen/*<19165*//*19163*/(/*19166*/0/*<19166*/)(/*19167*/-1/*<19167*/)/*<19163*/)/*<19159*/)(/*19158*/nil/*<19158*/)/*<19158*/)(/*19168*//*19169*/tgen/*<19169*//*19168*/(/*19170*/0/*<19170*/)(/*19171*/-1/*<19171*/)/*<19168*/)/*<19156*/)/*<19172*/)/*<19154*/ }/*<19150*/)(/*19176*/types/*<19176*/)/*<19148*/)(/*18973*/function name_18973(results$qu) { return /*18973*//*18974*/$gt$gt$eq/*<18974*//*18973*/(/*19185*//*19186*/$lt_/*<19186*//*19185*/(/*19187*//*19188*/unzip/*<19188*//*19187*/(/*19224*//*19189*/map/*<19189*//*19224*/(/*19226*/function name_19226({0: a, 1: b}) {
 return /*19233*//*19234*/$co/*<19234*//*19233*/(/*19235*/a/*<19235*/)(/*19236*/b/*<19236*/)/*<19233*/ }/*<19226*/)(/*19225*/results$qu/*<19225*/)/*<19224*/)/*<19187*/)/*<19185*/)(/*18973*/function name_18973({0: ps$qu, 1: types$qu}) {
 return /*18973*//*18974*/$gt$gt$eq/*<18974*//*18973*/(/*19193*//*19194*/map$slti/*<19194*//*19193*/(/*19195*/function name_19195({0: a, 1: b}) {
 return /*19202*//*19203*/unify/*<19203*//*19202*/(/*19204*/a/*<19204*/)(/*19205*/b/*<19205*/)/*<19202*/ }/*<19195*/)(/*19206*//*19207*/zip/*<19207*//*19206*/(/*19208*/types/*<19208*/)(/*19209*/types$qu/*<19209*/)/*<19206*/)/*<19193*/)(/*18973*/function name_18973(_) { return /*19106*//*19107*/$lt_/*<19107*//*19106*/(/*19108*//*19109*/$co/*<19109*//*19108*/(/*19237*//*19238*/concat/*<19238*//*19237*/(/*19240*//*19240*/cons/*<19240*//*19240*/(/*19177*//*19110*/concat/*<19110*//*19177*/(/*19178*/ps/*<19178*/)/*<19177*/)(/*19240*//*19240*/cons/*<19240*//*19240*/(/*19241*//*19242*/concat/*<19242*//*19241*/(/*19243*/ps$qu/*<19243*/)/*<19241*/)(/*19240*/nil/*<19240*/)/*<19240*/)/*<19240*/)/*<19237*/)(/*19111*/tstring/*<19111*/)/*<19108*/)/*<19106*/ }/*<18973*/)/*<18973*/ }/*<18973*/)/*<18973*/ }/*<18973*/)/*<18973*/ }/*<18973*/)/*<18973*/ }/*<18973*/)/*<18973*/
}
}
}
}
if ($target.type === "eprim") {
{
let prim = $target[0];
{
let l = $target[1];
return /*10364*//*10380*/infer$slprim/*<10380*//*10364*/(/*10381*/prim/*<10381*/)/*<10364*/
}
}
}
if ($target.type === "eapp") {
{
let target = $target[0];
{
let arg = $target[1];
{
let l = $target[2];
return /*10388*//*10389*/$gt$gt$eq/*<10389*//*10388*/(/*10396*//*10397*/infer$slexpr/*<10397*//*10396*/(/*10398*/ce/*<10398*/)(/*10399*/as/*<10399*/)(/*10400*/target/*<10400*/)/*<10396*/)(/*10388*/function name_10388({0: ps, 1: target_type}) {
 return /*10388*//*10389*/$gt$gt$eq/*<10389*//*10388*/(/*10405*//*10406*/infer$slexpr/*<10406*//*10405*/(/*10407*/ce/*<10407*/)(/*10408*/as/*<10408*/)(/*10409*/arg/*<10409*/)/*<10405*/)(/*10388*/function name_10388({0: qs, 1: arg_type}) {
 return /*10388*//*10389*/$gt$gt$eq/*<10389*//*10388*/(/*10416*//*10418*/new_tvar/*<10418*//*10416*/(/*10419*/star/*<10419*/)/*<10416*/)(/*10388*/function name_10388(result_var) { return /*10388*//*10389*/$gt$gt$eq/*<10389*//*10388*/(/*10425*//*10426*/unify/*<10426*//*10425*/(/*10427*//*10428*/tfn/*<10428*//*10427*/(/*10429*/arg_type/*<10429*/)(/*10431*/result_var/*<10431*/)/*<10427*/)(/*10432*/target_type/*<10432*/)/*<10425*/)(/*10388*/function name_10388(_) { return /*10433*//*10434*/$lt_/*<10434*//*10433*/(/*10436*//*10437*/$co/*<10437*//*10436*/(/*10438*//*10439*/concat/*<10439*//*10438*/(/*10440*//*10440*/cons/*<10440*//*10440*/(/*10441*/ps/*<10441*/)(/*10440*//*10440*/cons/*<10440*//*10440*/(/*10442*/qs/*<10442*/)(/*10440*/nil/*<10440*/)/*<10440*/)/*<10440*/)/*<10438*/)(/*10443*/result_var/*<10443*/)/*<10436*/)/*<10433*/ }/*<10388*/)/*<10388*/ }/*<10388*/)/*<10388*/ }/*<10388*/)/*<10388*/ }/*<10388*/)/*<10388*/
}
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
return /*16804*//*16809*/infer$slexpr/*<16809*//*16804*/(/*16810*/ce/*<16810*/)(/*16811*/as/*<16811*/)(/*16812*//*16813*/elet/*<16813*//*16812*/(/*16814*//*16815*/$co/*<16815*//*16814*/(/*16816*/nil/*<16816*/)(/*16817*//*16817*/cons/*<16817*//*16817*/(/*16826*//*16826*/cons/*<16826*//*16826*/(/*16827*//*16828*/$co/*<16828*//*16827*/(/*16840*/"lambda-arg"/*<16840*/)(/*16831*//*16831*/cons/*<16831*//*16831*/(/*16832*//*16830*/$co/*<16830*//*16832*/(/*16838*//*16838*/cons/*<16838*//*16838*/(/*16839*/pat/*<16839*/)(/*16838*/nil/*<16838*/)/*<16838*/)(/*16833*/body/*<16833*/)/*<16832*/)(/*16831*/nil/*<16831*/)/*<16831*/)/*<16827*/)(/*16826*/nil/*<16826*/)/*<16826*/)(/*16817*/nil/*<16817*/)/*<16817*/)/*<16814*/)(/*16818*//*16820*/evar/*<16820*//*16818*/(/*16821*/"lambda-arg"/*<16821*/)(/*16823*/l/*<16823*/)/*<16818*/)(/*16824*/l/*<16824*/)/*<16812*/)/*<16804*/
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
return /*15804*//*19705*/infer$slexpr/*<19705*//*15804*/(/*19706*/ce/*<19706*/)(/*19707*/as/*<19707*/)(/*19708*//*19709*/elet/*<19709*//*19708*/(/*19722*//*19723*/$co/*<19723*//*19722*/(/*19710*/nil/*<19710*/)(/*19742*//*19742*/cons/*<19742*//*19742*/(/*19743*//*19743*/cons/*<19743*//*19743*/(/*19738*//*19739*/$co/*<19739*//*19738*/(/*19740*/"match"/*<19740*/)(/*19724*//*19725*/map/*<19725*//*19724*/(/*19727*/function name_19727({0: pat, 1: body}) {
 return /*19744*//*19745*/$co/*<19745*//*19744*/(/*19734*//*19734*/cons/*<19734*//*19734*/(/*19754*/pat/*<19754*/)(/*19734*/nil/*<19734*/)/*<19734*/)(/*19753*/body/*<19753*/)/*<19744*/ }/*<19727*/)(/*19726*/cases/*<19726*/)/*<19724*/)/*<19738*/)(/*19743*/nil/*<19743*/)/*<19743*/)(/*19742*/nil/*<19742*/)/*<19742*/)/*<19722*/)(/*19715*//*19716*/eapp/*<19716*//*19715*/(/*19711*//*19712*/evar/*<19712*//*19711*/(/*19713*/"match"/*<19713*/)(/*19717*/l/*<19717*/)/*<19711*/)(/*19718*/target/*<19718*/)(/*19720*/l/*<19720*/)/*<19715*/)(/*19721*/l/*<19721*/)/*<19708*/)/*<15804*/
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
return /*10451*//*10452*/$gt$gt$eq/*<10452*//*10451*/(/*10458*//*10459*/infer$slbinding_group/*<10459*//*10458*/(/*13651*/ce/*<13651*/)(/*13652*/as/*<13652*/)(/*10460*/bindings/*<10460*/)/*<10458*/)(/*10451*/function name_10451({0: ps, 1: as$qu}) {
 return /*10451*//*10452*/$gt$gt$eq/*<10452*//*10451*/(/*13658*//*13659*/infer$slexpr/*<13659*//*13658*/(/*13660*/ce/*<13660*/)(/*13661*//*13662*/concat/*<13662*//*13661*/(/*13663*//*13663*/cons/*<13663*//*13663*/(/*13664*/as$qu/*<13664*/)(/*13663*//*13663*/cons/*<13663*//*13663*/(/*13665*/as/*<13665*/)(/*13663*/nil/*<13663*/)/*<13663*/)/*<13663*/)/*<13661*/)(/*13666*/body/*<13666*/)/*<13658*/)(/*10451*/function name_10451({0: qs, 1: t}) {
 return /*13650*//*13667*/$lt_/*<13667*//*13650*/(/*13674*//*13675*/$co/*<13675*//*13674*/(/*13668*//*13669*/concat/*<13669*//*13668*/(/*13670*//*13670*/cons/*<13670*//*13670*/(/*13671*/ps/*<13671*/)(/*13670*//*13670*/cons/*<13670*//*13670*/(/*13672*/qs/*<13672*/)(/*13670*/nil/*<13670*/)/*<13670*/)/*<13670*/)/*<13668*/)(/*13677*/t/*<13677*/)/*<13674*/)/*<13650*/ }/*<10451*/)/*<10451*/ }/*<10451*/)/*<10451*/
}
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 10168');})(/*!*//*10170*/expr/*<10170*/)/*<10168*/ } } }/*<10162*/;


const infer$slbinding_group = /*14607*/function name_14607(class_env) { return function name_14607(as) { return function name_14607({0: explicit, 1: implicits}) {
 return /*14618*/(function let_14618() {const $target = /*14623*//*14624*/map/*<14624*//*14623*/(/*14626*/function name_14626({0: name, 1: scheme}) {
 return /*14634*//*14635*/$ex$gt$ex/*<14635*//*14634*/(/*14636*/name/*<14636*/)(/*14637*/scheme/*<14637*/)/*<14634*/ }/*<14626*/)(/*14625*/explicit/*<14625*/)/*<14623*/;
{
let expl_assumps = $target;
return /*14638*//*14639*/$gt$gt$eq/*<14639*//*14638*/(/*14647*//*14648*/infer$slseq/*<14648*//*14647*/(/*14649*/infer$slimpls/*<14649*/)(/*14650*/class_env/*<14650*/)(/*14651*//*14652*/$pl$pl$pl/*<14652*//*14651*/(/*14653*/expl_assumps/*<14653*/)(/*14654*/as/*<14654*/)/*<14651*/)(/*14655*/implicits/*<14655*/)/*<14647*/)(/*14638*/function name_14638({0: impl_preds, 1: impl_assumps}) {
 return /*14638*//*14639*/$gt$gt$eq/*<14639*//*14638*/(/*14659*//*14661*/map$slti/*<14661*//*14659*/(/*14662*//*14663*/infer$slexpl/*<14663*//*14662*/(/*14664*/class_env/*<14664*/)(/*14665*//*14666*/concat/*<14666*//*14665*/(/*14667*//*14667*/cons/*<14667*//*14667*/(/*14668*/impl_assumps/*<14668*/)(/*14667*//*14667*/cons/*<14667*//*14667*/(/*14669*/expl_assumps/*<14669*/)(/*14667*//*14667*/cons/*<14667*//*14667*/(/*14670*/as/*<14670*/)(/*14667*/nil/*<14667*/)/*<14667*/)/*<14667*/)/*<14667*/)/*<14665*/)/*<14662*/)(/*14672*/explicit/*<14672*/)/*<14659*/)(/*14638*/function name_14638(expl_preds) { return /*14657*//*14673*/$lt_/*<14673*//*14657*/(/*14674*//*14675*/$co/*<14675*//*14674*/(/*14676*//*14677*/$pl$pl$pl/*<14677*//*14676*/(/*14678*/impl_preds/*<14678*/)(/*14679*//*14681*/concat/*<14681*//*14679*/(/*14682*/expl_preds/*<14682*/)/*<14679*/)/*<14676*/)(/*14683*//*14684*/$pl$pl$pl/*<14684*//*14683*/(/*14685*/impl_assumps/*<14685*/)(/*14686*/expl_assumps/*<14686*/)/*<14683*/)/*<14674*/)/*<14657*/ }/*<14638*/)/*<14638*/ }/*<14638*/)/*<14638*/
};
throw new Error('let pattern not matched 14622. ' + valueToString($target));})(/*!*/)/*<14618*/ } } }/*<14607*/;


const infer$slimpls = /*14795*/function name_14795(ce) { return function name_14795(as) { return function name_14795(bs) { return /*14804*//*14805*/$gt$gt$eq/*<14805*//*14804*/(/*14819*//*14808*//*14809*/map$slti/*<14809*//*14808*/(/*14810*/function name_14810(_) { return /*14814*//*14815*/new_tvar/*<14815*//*14814*/(/*14816*/star/*<14816*/)/*<14814*/ }/*<14810*/)(/*14818*/bs/*<14818*/)/*<14808*//*14819*//*<14819*/)(/*14804*/function name_14804(ts) { return /*14817*/(function let_14817() {const $target = /*14838*//*14839*/map/*<14839*//*14838*/(/*14840*/fst/*<14840*/)(/*14841*/bs/*<14841*/)/*<14838*/;
{
let is = $target;
return (function let_14817() {const $target = /*14843*//*14844*/map/*<14844*//*14843*/(/*14845*/toScheme/*<14845*/)(/*14846*/ts/*<14846*/)/*<14843*/;
{
let scs = $target;
return (function let_14817() {const $target = /*14854*//*14855*/$pl$pl$pl/*<14855*//*14854*/(/*14849*//*14850*/zipWith/*<14850*//*14849*/(/*14851*/$ex$gt$ex/*<14851*/)(/*14852*/is/*<14852*/)(/*14853*/scs/*<14853*/)/*<14849*/)(/*14856*/as/*<14856*/)/*<14854*/;
{
let as$qu = $target;
return (function let_14817() {const $target = /*14858*//*14859*/map/*<14859*//*14858*/(/*14860*/snd/*<14860*/)(/*14861*/bs/*<14861*/)/*<14858*/;
{
let altss = $target;
return /*14862*//*14863*/$gt$gt$eq/*<14863*//*14862*/(/*14868*//*14870*//*14871*/sequence/*<14871*//*14870*/(/*14872*//*14874*/zipWith/*<14874*//*14872*/(/*14875*//*14876*/infer$slalts/*<14876*//*14875*/(/*14877*/ce/*<14877*/)(/*14878*/as$qu/*<14878*/)/*<14875*/)(/*14879*/altss/*<14879*/)(/*14880*/ts/*<14880*/)/*<14872*/)/*<14870*//*14868*//*<14868*/)(/*14862*/function name_14862(pss) { return /*14862*//*14863*/$gt$gt$eq/*<14863*//*14862*/(/*14884*//*14885*/get_subst/*<14885*//*14884*//*<14884*/)(/*14862*/function name_14862(s) { return /*14886*/(function let_14886() {const $target = /*14925*//*14891*/preds$slapply/*<14891*//*14925*/(/*14892*/s/*<14892*/)(/*14893*//*14894*/concat/*<14894*//*14893*/(/*14895*/pss/*<14895*/)/*<14893*/)/*<14925*/;
{
let ps$qu = $target;
return (function let_14886() {const $target = /*14898*//*14899*/map/*<14899*//*14898*/(/*15223*//*15222*/type$slapply/*<15222*//*15223*/(/*14900*/s/*<14900*/)/*<15223*/)(/*14901*/ts/*<14901*/)/*<14898*/;
{
let ts$qu = $target;
return (function let_14886() {const $target = /*15295*//*15296*/set$slto_list/*<15296*//*15295*/(/*14903*//*14904*/foldl/*<14904*//*14903*/(/*15229*/set$slnil/*<15229*/)(/*14905*//*14906*/map/*<14906*//*14905*/(/*15227*//*15226*/assump$slapply/*<15226*//*15227*/(/*15228*/s/*<15228*/)/*<15227*/)(/*14908*/as/*<14908*/)/*<14905*/)(/*15232*/function name_15232(res) { return function name_15232(as) { return /*15240*//*15235*/set$slmerge/*<15235*//*15240*/(/*15241*/res/*<15241*/)(/*15243*//*15242*/assump$sltv/*<15242*//*15243*/(/*15244*/as/*<15244*/)/*<15243*/)/*<15240*/ } }/*<15232*/)/*<14903*/)/*<15295*/;
{
let fs = $target;
return (function let_14886() {const $target = /*14911*//*14912*/map/*<14912*//*14911*/(/*14913*/type$sltv/*<14913*/)(/*14914*/ts$qu/*<14914*/)/*<14911*/;
{
let vss = $target;
return (function let_14886() {const $target = /*14920*//*14921*/without/*<14921*//*14920*/(/*15293*//*15294*/set$slto_list/*<15294*//*15293*/(/*14916*//*14917*/foldr1/*<14917*//*14916*/(/*14918*/set$slmerge/*<14918*/)(/*14919*/vss/*<14919*/)/*<14916*/)/*<15293*/)(/*14922*/fs/*<14922*/)(/*15329*/tyvar$eq/*<15329*/)/*<14920*/;
{
let gs = $target;
return /*14910*//*14927*/$gt$gt$eq/*<14927*//*14910*/(/*14933*//*14935*//*14936*/split/*<14936*//*14935*/(/*14937*/ce/*<14937*/)(/*14938*/fs/*<14938*/)(/*14939*//*14940*/foldr1/*<14940*//*14939*/(/*15319*//*14941*/intersect/*<14941*//*15319*/(/*15320*/tyvar$eq/*<15320*/)/*<15319*/)(/*15326*//*14942*/map/*<14942*//*15326*/(/*15327*/set$slto_list/*<15327*/)(/*15328*/vss/*<15328*/)/*<15326*/)/*<14939*/)(/*14943*/ps$qu/*<14943*/)/*<14935*//*14933*//*<14933*/)(/*14910*/function name_14910({0: ds, 1: rs}) {
 return /*21385*//*21386*/$lt_/*<21386*//*21385*/(/*14945*/(function match_14945($target) {
if ($target === true) {
return /*14952*/(function let_14952() {const $target = /*14956*//*14957*/without/*<14957*//*14956*/(/*14958*/gs/*<14958*/)(/*15330*//*15332*/set$slto_list/*<15332*//*15330*/(/*14959*//*14960*/preds$sltv/*<14960*//*14959*/(/*14961*/rs/*<14961*/)/*<14959*/)/*<15330*/)(/*15333*/tyvar$eq/*<15333*/)/*<14956*/;
{
let gs$qu = $target;
return (function let_14952() {const $target = /*14963*//*14964*/map/*<14964*//*14963*/(/*14968*/function name_14968(x) { return /*14965*//*14966*/quantify/*<14966*//*14965*/(/*14967*/gs$qu/*<14967*/)(/*14972*//*14973*/$eq$gt/*<14973*//*14972*/(/*14974*/nil/*<14974*/)(/*14975*/x/*<14975*/)/*<14972*/)/*<14965*/ }/*<14968*/)(/*14976*/ts$qu/*<14976*/)/*<14963*/;
{
let scs$qu = $target;
return /*14984*//*14985*/$co/*<14985*//*14984*/(/*14986*//*14987*/$pl$pl$pl/*<14987*//*14986*/(/*14988*/ds/*<14988*/)(/*14989*/rs/*<14989*/)/*<14986*/)(/*14990*//*14991*/zipWith/*<14991*//*14990*/(/*14992*/$ex$gt$ex/*<14992*/)(/*14993*/is/*<14993*/)(/*14994*/scs$qu/*<14994*/)/*<14990*/)/*<14984*/
};
throw new Error('let pattern not matched 14962. ' + valueToString($target));})(/*!*/)
};
throw new Error('let pattern not matched 14955. ' + valueToString($target));})(/*!*/)/*<14952*/
}
return /*14995*/(function let_14995() {const $target = /*14999*//*15000*/map/*<15000*//*14999*/(/*15001*/function name_15001(x) { return /*15005*//*15006*/quantify/*<15006*//*15005*/(/*15007*/gs/*<15007*/)(/*15008*//*15009*/$eq$gt/*<15009*//*15008*/(/*15010*/rs/*<15010*/)(/*15011*/x/*<15011*/)/*<15008*/)/*<15005*/ }/*<15001*/)(/*15013*/ts$qu/*<15013*/)/*<14999*/;
{
let scs$qu = $target;
return /*15016*//*15017*/$co/*<15017*//*15016*/(/*15018*/ds/*<15018*/)(/*15032*//*15033*/zipWith/*<15033*//*15032*/(/*15034*/$ex$gt$ex/*<15034*/)(/*15035*/is/*<15035*/)(/*15036*/scs$qu/*<15036*/)/*<15032*/)/*<15016*/
};
throw new Error('let pattern not matched 14998. ' + valueToString($target));})(/*!*/)/*<14995*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 14945');})(/*!*//*14947*//*14948*/restricted/*<14948*//*14947*/(/*14951*/bs/*<14951*/)/*<14947*/)/*<14945*/)/*<21385*/ }/*<14910*/)/*<14910*/
};
throw new Error('let pattern not matched 14915. ' + valueToString($target));})(/*!*/)
};
throw new Error('let pattern not matched 14909. ' + valueToString($target));})(/*!*/)
};
throw new Error('let pattern not matched 14902. ' + valueToString($target));})(/*!*/)
};
throw new Error('let pattern not matched 14896. ' + valueToString($target));})(/*!*/)
};
throw new Error('let pattern not matched 14889. ' + valueToString($target));})(/*!*/)/*<14886*/ }/*<14862*/)/*<14862*/ }/*<14862*/)/*<14862*/
};
throw new Error('let pattern not matched 14857. ' + valueToString($target));})(/*!*/)
};
throw new Error('let pattern not matched 14848. ' + valueToString($target));})(/*!*/)
};
throw new Error('let pattern not matched 14842. ' + valueToString($target));})(/*!*/)
};
throw new Error('let pattern not matched 14837. ' + valueToString($target));})(/*!*/)/*<14817*/ }/*<14804*/)/*<14804*/ } } }/*<14795*/;


const infer$slexpl = /*14440*/function name_14440(ce) { return function name_14440(as) { return function name_14440({0: i, 1: sc, 2: alts}) {

 return /*14452*//*14453*/$gt$gt$eq/*<14453*//*14452*/(/*14461*//*14462*/fresh_inst/*<14462*//*14461*/(/*14463*/sc/*<14463*/)/*<14461*/)(/*14452*/function name_14452({0: qs, 1: t}) {
 return /*14452*//*14453*/$gt$gt$eq/*<14453*//*14452*/(/*14472*//*14473*/infer$slalts/*<14473*//*14472*/(/*14474*/ce/*<14474*/)(/*14475*/as/*<14475*/)(/*14476*/alts/*<14476*/)(/*15356*/t/*<15356*/)/*<14472*/)(/*14452*/function name_14452(ps) { return /*14452*//*14453*/$gt$gt$eq/*<14453*//*14452*/(/*15352*//*15353*/get_subst/*<15353*//*15352*//*<15352*/)(/*14452*/function name_14452(s) { return /*14481*/(function let_14481() {const $target = /*14485*//*14486*/preds$slapply/*<14486*//*14485*/(/*14488*/s/*<14488*/)(/*14489*/qs/*<14489*/)/*<14485*/;
{
let qs$qu = $target;
return (function let_14481() {const $target = /*14491*//*14493*/type$slapply/*<14493*//*14491*/(/*14494*/s/*<14494*/)(/*14495*/t/*<14495*/)/*<14491*/;
{
let t$qu = $target;
return (function let_14481() {const $target = /*15347*//*15348*/set$slto_list/*<15348*//*15347*/(/*15341*//*15342*/foldr1/*<15342*//*15341*/(/*15343*/set$slmerge/*<15343*/)(/*14926*//*15340*/map/*<15340*//*14926*/(/*14498*/assump$sltv/*<14498*/)(/*14499*//*14500*/map/*<14500*//*14499*/(/*15339*//*15338*/assump$slapply/*<15338*//*15339*/(/*14501*/s/*<14501*/)/*<15339*/)(/*14502*/as/*<14502*/)/*<14499*/)/*<14926*/)/*<15341*/)/*<15347*/;
{
let fs = $target;
return (function let_14481() {const $target = /*14507*//*14508*/without/*<14508*//*14507*/(/*15344*//*15345*/set$slto_list/*<15345*//*15344*/(/*14504*//*14505*/type$sltv/*<14505*//*14504*/(/*14506*/t$qu/*<14506*/)/*<14504*/)/*<15344*/)(/*14509*/fs/*<14509*/)(/*15346*/tyvar$eq/*<15346*/)/*<14507*/;
{
let gs = $target;
return (function let_14481() {const $target = /*14522*//*14523*/quantify/*<14523*//*14522*/(/*14524*/gs/*<14524*/)(/*14525*//*14526*/$eq$gt/*<14526*//*14525*/(/*14527*/qs$qu/*<14527*/)(/*14528*/t$qu/*<14528*/)/*<14525*/)/*<14522*/;
{
let sc$qu = $target;
return (function let_14481() {const $target = /*14530*//*14531*/filter/*<14531*//*14530*/(/*14544*/function name_14544(x) { return /*14532*//*14533*/not/*<14533*//*14532*/(/*14548*//*14537*/entail/*<14537*//*14548*/(/*14538*/ce/*<14538*/)(/*14539*/qs$qu/*<14539*/)(/*14549*/x/*<14549*/)/*<14548*/)/*<14532*/ }/*<14544*/)(/*14540*//*14541*/preds$slapply/*<14541*//*14540*/(/*14542*/s/*<14542*/)(/*14543*/ps/*<14543*/)/*<14540*/)/*<14530*/;
{
let ps$qu = $target;
return /*14464*//*14550*/$gt$gt$eq/*<14550*//*14464*/(/*15350*//*14556*//*14557*/split/*<14557*//*14556*/(/*14558*/ce/*<14558*/)(/*14559*/fs/*<14559*/)(/*14560*/gs/*<14560*/)(/*14561*/ps$qu/*<14561*/)/*<14556*//*15350*//*<15350*/)(/*14464*/function name_14464({0: ds, 1: rs}) {
 return /*14562*/(function match_14562($target) {
if ($target === true) {
return /*14568*//*14569*/ti_err/*<14569*//*14568*/(/*14570*/"signature too general"/*<14570*/)/*<14568*/
}
return /*14572*/(function match_14572($target) {
if ($target.type === "nil") {
return /*14580*//*14581*/ti_return/*<14581*//*14580*/(/*14582*/ds/*<14582*/)/*<14580*/
}
return /*14584*//*14587*/ti_err/*<14587*//*14584*/(/*14588*/"context too weak"/*<14588*/)/*<14584*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 14572');})(/*!*//*14578*/rs/*<14578*/)/*<14572*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 14562');})(/*!*//*14564*//*14565*/$ex$eq/*<14565*//*14564*/(/*14566*/sc/*<14566*/)(/*14567*/sc$qu/*<14567*/)/*<14564*/)/*<14562*/ }/*<14464*/)/*<14464*/
};
throw new Error('let pattern not matched 14529. ' + valueToString($target));})(/*!*/)
};
throw new Error('let pattern not matched 14521. ' + valueToString($target));})(/*!*/)
};
throw new Error('let pattern not matched 14503. ' + valueToString($target));})(/*!*/)
};
throw new Error('let pattern not matched 14496. ' + valueToString($target));})(/*!*/)
};
throw new Error('let pattern not matched 14490. ' + valueToString($target));})(/*!*/)
};
throw new Error('let pattern not matched 14484. ' + valueToString($target));})(/*!*/)/*<14481*/ }/*<14452*/)/*<14452*/ }/*<14452*/)/*<14452*/ }/*<14452*/)/*<14452*/ } } }/*<14440*/;


const infer$slalts = /*15154*/function name_15154(ce) { return function name_15154(as) { return function name_15154(alts) { return function name_15154(t) { return /*15163*//*15164*/$gt$gt$eq/*<15164*//*15163*/(/*15167*//*15169*//*15170*/map$slti/*<15170*//*15169*/(/*15171*//*15172*/infer$slalt/*<15172*//*15171*/(/*15173*/ce/*<15173*/)(/*15174*/as/*<15174*/)/*<15171*/)(/*15175*/alts/*<15175*/)/*<15169*//*15167*//*<15167*/)(/*15163*/function name_15163(psts) { return /*15163*//*15164*/$gt$gt$eq/*<15164*//*15163*/(/*15177*//*15179*//*15180*/map$slti/*<15180*//*15179*/(/*15184*//*15185*/unify/*<15185*//*15184*/(/*15186*/t/*<15186*/)/*<15184*/)(/*15187*//*15188*/map/*<15188*//*15187*/(/*15189*/snd/*<15189*/)(/*15190*/psts/*<15190*/)/*<15187*/)/*<15179*//*15177*//*<15177*/)(/*15163*/function name_15163(_) { return /*15183*//*15191*/ti_return/*<15191*//*15183*/(/*15192*//*15781*/concat/*<15781*//*15192*/(/*15782*//*15783*/map/*<15783*//*15782*/(/*15784*/fst/*<15784*/)(/*15785*/psts/*<15785*/)/*<15782*/)/*<15192*/)/*<15183*/ }/*<15163*/)/*<15163*/ }/*<15163*/)/*<15163*/ } } } }/*<15154*/;


const infer$slalt = /*13680*/function name_13680(ce) { return function name_13680(as) { return function name_13680({0: pats, 1: body}) {
 return /*13692*//*13693*/$gt$gt$eq/*<13693*//*13692*/(/*13701*//*13702*/infer$slpats/*<13702*//*13701*/(/*13703*/pats/*<13703*/)/*<13701*/)(/*13692*/function name_13692({0: ps, 1: as$qu, 2: ts}) {

 return /*13692*//*13693*/$gt$gt$eq/*<13693*//*13692*/(/*13708*//*13709*/infer$slexpr/*<13709*//*13708*/(/*13710*/ce/*<13710*/)(/*13711*//*13712*/concat/*<13712*//*13711*/(/*13713*//*13713*/cons/*<13713*//*13713*/(/*13714*/as$qu/*<13714*/)(/*13713*//*13713*/cons/*<13713*//*13713*/(/*13715*/as/*<13715*/)(/*13713*/nil/*<13713*/)/*<13713*/)/*<13713*/)/*<13711*/)(/*13716*/body/*<13716*/)/*<13708*/)(/*13692*/function name_13692({0: qs, 1: t}) {
 return /*16923*/(function let_16923() {const $target = /*16927*//*16928*/foldr/*<16928*//*16927*/(/*16929*/t/*<16929*/)(/*16930*/ts/*<16930*/)(/*16931*/function name_16931(res) { return function name_16931(arg) { return /*16936*//*16937*/tfn/*<16937*//*16936*/(/*16938*/arg/*<16938*/)(/*16939*/res/*<16939*/)/*<16936*/ } }/*<16931*/)/*<16927*/;
{
let res_type = $target;
return /*13717*//*13718*/ti_return/*<13718*//*13717*/(/*13719*//*13720*/$co/*<13720*//*13719*/(/*13721*//*13722*/concat/*<13722*//*13721*/(/*13723*//*13723*/cons/*<13723*//*13723*/(/*13724*/ps/*<13724*/)(/*13723*//*13723*/cons/*<13723*//*13723*/(/*13725*/qs/*<13725*/)(/*13723*/nil/*<13723*/)/*<13723*/)/*<13723*/)/*<13721*/)(/*13726*/res_type/*<13726*/)/*<13719*/)/*<13717*/
};
throw new Error('let pattern not matched 16926. ' + valueToString($target));})(/*!*/)/*<16923*/ }/*<13692*/)/*<13692*/ }/*<13692*/)/*<13692*/ } } }/*<13680*/;

const infer$slprogram = /*15392*/function name_15392(tenv) { return function name_15392(ce) { return function name_15392(as) { return function name_15392(bindgroups) { return /*15886*//*15887*/ti_run/*<15887*//*15886*/(/*15828*//*15829*/$gt$gt$eq/*<15829*//*15828*/(/*15837*//*15838*/infer$slseq/*<15838*//*15837*/(/*15839*/infer$slbinding_group/*<15839*/)(/*15840*/ce/*<15840*/)(/*15841*/as/*<15841*/)(/*15842*/bindgroups/*<15842*/)/*<15837*/)(/*15828*/function name_15828({0: preds, 1: assumps}) {
 return /*15828*//*15829*/$gt$gt$eq/*<15829*//*15828*/(/*15844*//*15846*/get_subst/*<15846*//*15844*//*<15844*/)(/*15828*/function name_15828(subst0) { return /*15828*//*15829*/$gt$gt$eq/*<15829*//*15828*/(/*15866*//*15867*/ti_from_result/*<15867*//*15866*/(/*15850*//*15851*/reduce/*<15851*//*15850*/(/*15852*/ce/*<15852*/)(/*15853*//*15854*/preds$slapply/*<15854*//*15853*/(/*15855*/subst0/*<15855*/)(/*15856*/preds/*<15856*/)/*<15853*/)/*<15850*/)/*<15866*/)(/*15828*/function name_15828(reduced) { return /*15828*//*15829*/$gt$gt$eq/*<15829*//*15828*/(/*15868*//*15869*/ti_from_result/*<15869*//*15868*/(/*15860*//*15861*/defaultSubst/*<15861*//*15860*/(/*15862*/ce/*<15862*/)(/*15863*/nil/*<15863*/)(/*15864*/reduced/*<15864*/)/*<15860*/)/*<15868*/)(/*15828*/function name_15828(subst) { return /*15865*//*15870*/ti_return/*<15870*//*15865*/(/*15871*//*15872*/map/*<15872*//*15871*/(/*15881*//*15880*/assump$slapply/*<15880*//*15881*/(/*15873*//*15874*/compose_subst/*<15874*//*15873*/(/*15875*/subst/*<15875*/)(/*15876*/subst0/*<15876*/)/*<15873*/)/*<15881*/)(/*15877*/assumps/*<15877*/)/*<15871*/)/*<15865*/ }/*<15828*/)/*<15828*/ }/*<15828*/)/*<15828*/ }/*<15828*/)/*<15828*/ }/*<15828*/)/*<15828*/)(/*15888*/map$slnil/*<15888*/)(/*15895*/tenv/*<15895*/)(/*15889*/0/*<15889*/)/*<15886*/ } } } }/*<15392*/;

const infer_stmt = /*20555*/function name_20555({0: tenv, 1: ce, 2: assumps}) {

 return function name_20555(stmt) { return /*20567*/(function match_20567($target) {
if ($target.type === "sdef") {
{
let name = $target[0];
{
let nl = $target[1];
{
let body = $target[2];
{
let l = $target[3];
return /*20575*/(function match_20575($target) {
if ($target.type === "ok") {
if ($target[0].type === ",,,") {
{
let subst = $target[0][0];
{
let tenv = $target[0][1];
{
let nidx = $target[0][2];
{
let assumps = $target[0][3];
return /*23473*//*23474*/full_env/*<23474*//*23473*/(/*23475*/type_env$slnil/*<23475*/)(/*23476*/class_env$slnil/*<23476*/)(/*20666*//*22189*/filter/*<22189*//*20666*/(/*22190*/function name_22190({0: n}) { return /*22194*//*22198*/$eq/*<22198*//*22194*/(/*22199*/n/*<22199*/)(/*22200*/name/*<22200*/)/*<22194*/ }/*<22190*/)(/*22201*/assumps/*<22201*/)/*<20666*/)/*<23473*/
}
}
}
}
}
}
if ($target.type === "err") {
{
let e = $target[0];
return /*20670*//*20671*/fatal/*<20671*//*20670*/(/*20672*/e/*<20672*/)/*<20670*/
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 20575');})(/*!*//*20579*//*20580*/infer$slprogram/*<20580*//*20579*/(/*20581*/tenv/*<20581*/)(/*20582*/ce/*<20582*/)(/*20583*/assumps/*<20583*/)(/*20584*//*20584*/cons/*<20584*//*20584*/(/*20585*//*20586*/$co/*<20586*//*20585*/(/*20587*/nil/*<20587*/)(/*20588*//*20588*/cons/*<20588*//*20588*/(/*20600*//*20600*/cons/*<20600*//*20600*/(/*20591*//*20592*/$co/*<20592*//*20591*/(/*20593*/name/*<20593*/)(/*20594*//*20594*/cons/*<20594*//*20594*/(/*24389*/(function match_24389($target) {
if ($target.type === "elambda") {
{
let pat = $target[0];
{
let inner = $target[1];
{
let l = $target[2];
return /*24401*//*24404*/$co/*<24404*//*24401*/(/*24405*//*24405*/cons/*<24405*//*24405*/(/*24406*/pat/*<24406*/)(/*24405*/nil/*<24405*/)/*<24405*/)(/*24407*/inner/*<24407*/)/*<24401*/
}
}
}
}
return /*20595*//*20596*/$co/*<20596*//*20595*/(/*20597*/nil/*<20597*/)(/*20598*/body/*<20598*/)/*<20595*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 24389');})(/*!*//*24393*/body/*<24393*/)/*<24389*/)(/*20594*/nil/*<20594*/)/*<20594*/)/*<20591*/)(/*20600*/nil/*<20600*/)/*<20600*/)(/*20588*/nil/*<20588*/)/*<20588*/)/*<20585*/)(/*20584*/nil/*<20584*/)/*<20584*/)/*<20579*/)/*<20575*/
}
}
}
}
}
if ($target.type === "stypealias") {
{
let name = $target[0];
{
let nl = $target[1];
{
let args = $target[2];
{
let type = $target[3];
{
let l = $target[4];
return /*20608*/full_env$slnil/*<20608*/
}
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
let args = $target[2];
{
let constructors = $target[3];
{
let l = $target[4];
return /*20630*//*23460*/infer_deftype/*<23460*//*20630*/(/*23461*//*23462*/full_env/*<23462*//*23461*/(/*23463*/tenv/*<23463*/)(/*23464*/ce/*<23464*/)(/*23465*/assumps/*<23465*/)/*<23461*/)(/*23466*//*23467*/$co$co$co/*<23467*//*23466*/(/*23468*/name/*<23468*/)(/*23469*/nl/*<23469*/)(/*23470*/args/*<23470*/)(/*23471*/constructors/*<23471*/)/*<23466*/)/*<20630*/
}
}
}
}
}
}
if ($target.type === "sexpr") {
{
let body = $target[0];
{
let l = $target[1];
return /*20636*/(function match_20636($target) {
if ($target.type === "ok") {
if ($target[0].type === ",,,") {
{
let subst = $target[0][0];
{
let tenv = $target[0][1];
{
let nidx = $target[0][2];
{
let assumps = $target[0][3];
return /*23477*/full_env$slnil/*<23477*/
}
}
}
}
}
}
if ($target.type === "err") {
{
let e = $target[0];
return /*20679*//*20680*/fatal/*<20680*//*20679*/(/*20681*/e/*<20681*/)/*<20679*/
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 20636');})(/*!*//*20640*//*20641*/infer$slprogram/*<20641*//*20640*/(/*20642*/tenv/*<20642*/)(/*20643*/ce/*<20643*/)(/*20644*/assumps/*<20644*/)(/*20645*//*20645*/cons/*<20645*//*20645*/(/*20646*//*20647*/$co/*<20647*//*20646*/(/*20648*/nil/*<20648*/)(/*20649*//*20649*/cons/*<20649*//*20649*/(/*20650*//*20650*/cons/*<20650*//*20650*/(/*20651*//*20652*/$co/*<20652*//*20651*/(/*20653*/"it"/*<20653*/)(/*20654*//*20654*/cons/*<20654*//*20654*/(/*20655*//*20656*/$co/*<20656*//*20655*/(/*20657*/nil/*<20657*/)(/*20658*/body/*<20658*/)/*<20655*/)(/*20654*/nil/*<20654*/)/*<20654*/)/*<20651*/)(/*20650*/nil/*<20650*/)/*<20650*/)(/*20649*/nil/*<20649*/)/*<20649*/)/*<20646*/)(/*20645*/nil/*<20645*/)/*<20645*/)/*<20640*/)/*<20636*/
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 20567');})(/*!*//*20569*/stmt/*<20569*/)/*<20567*/ } }/*<20555*/;

const infer_defs = /*20787*/function name_20787({0: tenv, 1: ce, 2: assumps}) {

 return function name_20787(defs) { return /*20798*/(function match_20798($target) {
if ($target.type === "ok") {
if ($target[0].type === ",,,") {
{
let subst = $target[0][0];
{
let tenv = $target[0][1];
{
let nidx = $target[0][2];
{
let assumps = $target[0][3];
return /*20838*//*20846*/full_env/*<20846*//*20838*/(/*20847*/tenv/*<20847*/)(/*20848*/ce/*<20848*/)(/*20849*/assumps/*<20849*/)/*<20838*/
}
}
}
}
}
}
if ($target.type === "err") {
{
let e = $target[0];
return /*20842*//*20843*/fatal/*<20843*//*20842*/(/*20844*/e/*<20844*/)/*<20842*/
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 20798');})(/*!*//*20800*//*20801*/infer$slprogram/*<20801*//*20800*/(/*20802*/tenv/*<20802*/)(/*20803*/ce/*<20803*/)(/*20804*/assumps/*<20804*/)(/*20805*//*20805*/cons/*<20805*//*20805*/(/*20806*//*20807*/$co/*<20807*//*20806*/(/*20808*/nil/*<20808*/)(/*20809*//*20809*/cons/*<20809*//*20809*/(/*20810*//*20811*/map/*<20811*//*20810*/(/*20813*/function name_20813({0: name, 1: body}) {
 return /*20822*//*20823*/$co/*<20823*//*20822*/(/*20824*/name/*<20824*/)(/*20825*//*20825*/cons/*<20825*//*20825*/(/*20826*//*20827*/$co/*<20827*//*20826*/(/*20828*/nil/*<20828*/)(/*20829*/body/*<20829*/)/*<20826*/)(/*20825*/nil/*<20825*/)/*<20825*/)/*<20822*/ }/*<20813*/)(/*20812*/defs/*<20812*/)/*<20810*/)(/*20809*/nil/*<20809*/)/*<20809*/)/*<20806*/)(/*20805*/nil/*<20805*/)/*<20805*/)/*<20800*/)/*<20798*/ } }/*<20787*/;

const infer_stmts = /*22162*/function name_22162(env) { return function name_22162(stmts) { return /*22173*//*22174*/foldl/*<22174*//*22173*/(/*22175*/full_env$slnil/*<22175*/)(/*22176*/stmts/*<22176*/)(/*22177*/function name_22177(env$qu) { return function name_22177(stmt) { return /*23499*//*23500*/full_env$slmerge/*<23500*//*23499*/(/*23501*/env$qu/*<23501*/)(/*22184*//*22206*/infer_stmt/*<22206*//*22184*/(/*22207*//*23496*/full_env$slmerge/*<23496*//*22207*/(/*23497*/env/*<23497*/)(/*23498*/env$qu/*<23498*/)/*<22207*/)(/*22212*/stmt/*<22212*/)/*<22184*/)/*<23499*/ } }/*<22177*/)/*<22173*/ } }/*<22162*/;

const infer = /*22307*/function name_22307({0: tenv, 1: ce, 2: assumps}) {

 return function name_22307(body) { return /*22322*/(function match_22322($target) {
if ($target.type === "ok") {
if ($target[0].type === ",,,") {
{
let subst = $target[0][0];
{
let tenv = $target[0][1];
{
let nidx = $target[0][2];
{
let assumps = $target[0][3];
return /*22352*/(function match_22352($target) {
if ($target.type === "cons") {
if ($target[0].type === "!>!") {
{
let n = $target[0][0];
if ($target[0][1].type === "forall") {
{
let what = $target[0][1][0];
if ($target[0][1][1].type === "=>") {
{
let kinds = $target[0][1][1][0];
{
let typ = $target[0][1][1][1];
if ($target[1].type === "nil") {
return /*22379*/typ/*<22379*/
}
}
}
}
}
}
}
}
}
return /*22381*//*22382*/fatal/*<22382*//*22381*/(/*22383*/"No type found"/*<22383*/)/*<22381*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 22352');})(/*!*//*22360*//*22361*/filter/*<22361*//*22360*/(/*22362*/function name_22362({0: n}) { return /*22369*//*22370*/$eq/*<22370*//*22369*/(/*22371*/n/*<22371*/)(/*22372*/"it"/*<22372*/)/*<22369*/ }/*<22362*/)(/*22385*/assumps/*<22385*/)/*<22360*/)/*<22352*/
}
}
}
}
}
}
if ($target.type === "err") {
{
let e = $target[0];
return /*22356*//*22357*/fatal/*<22357*//*22356*/(/*22358*/e/*<22358*/)/*<22356*/
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 22322');})(/*!*//*22324*//*22325*/infer$slprogram/*<22325*//*22324*/(/*22326*/tenv/*<22326*/)(/*22327*/ce/*<22327*/)(/*22328*/assumps/*<22328*/)(/*22329*//*22329*/cons/*<22329*//*22329*/(/*22330*//*22331*/$co/*<22331*//*22330*/(/*22332*/nil/*<22332*/)(/*22333*//*22333*/cons/*<22333*//*22333*/(/*22334*//*22334*/cons/*<22334*//*22334*/(/*22335*//*22336*/$co/*<22336*//*22335*/(/*22337*/"it"/*<22337*/)(/*22339*//*22339*/cons/*<22339*//*22339*/(/*22340*//*22341*/$co/*<22341*//*22340*/(/*22342*/nil/*<22342*/)(/*22343*/body/*<22343*/)/*<22340*/)(/*22339*/nil/*<22339*/)/*<22339*/)/*<22335*/)(/*22334*/nil/*<22334*/)/*<22334*/)(/*22333*/nil/*<22333*/)/*<22333*/)/*<22330*/)(/*22329*/nil/*<22329*/)/*<22329*/)/*<22324*/)/*<22322*/ } }/*<22307*/;

const infer$slprogram_no_default = /*24289*/function name_24289(tenv) { return function name_24289(ce) { return function name_24289(as) { return function name_24289(bindgroups) { return /*24299*//*24300*/ti_run/*<24300*//*24299*/(/*24301*//*24302*/$gt$gt$eq/*<24302*//*24301*/(/*24308*//*24309*/infer$slseq/*<24309*//*24308*/(/*24310*/infer$slbinding_group/*<24310*/)(/*24311*/ce/*<24311*/)(/*24312*/as/*<24312*/)(/*24313*/bindgroups/*<24313*/)/*<24308*/)(/*24301*/function name_24301({0: preds, 1: assumps}) {
 return /*24301*//*24302*/$gt$gt$eq/*<24302*//*24301*/(/*24315*//*24316*/get_subst/*<24316*//*24315*//*<24315*/)(/*24301*/function name_24301(subst0) { return /*24301*//*24302*/$gt$gt$eq/*<24302*//*24301*/(/*24318*//*24319*/ti_from_result/*<24319*//*24318*/(/*24320*//*24321*/reduce/*<24321*//*24320*/(/*24322*/ce/*<24322*/)(/*24323*//*24324*/preds$slapply/*<24324*//*24323*/(/*24325*/subst0/*<24325*/)(/*24326*/preds/*<24326*/)/*<24323*/)/*<24320*/)/*<24318*/)(/*24301*/function name_24301(reduced) { return /*24301*//*24302*/$gt$gt$eq/*<24302*//*24301*/(/*24328*//*24329*/ti_from_result/*<24329*//*24328*/(/*24330*//*24331*/defaultSubst/*<24331*//*24330*/(/*24332*/ce/*<24332*/)(/*24333*/nil/*<24333*/)(/*24334*/reduced/*<24334*/)/*<24330*/)/*<24328*/)(/*24301*/function name_24301(subst) { return /*24335*//*24336*/ti_return/*<24336*//*24335*/(/*24364*//*24365*/$co/*<24365*//*24364*/(/*24366*/preds/*<24366*/)(/*24337*//*24338*/map/*<24338*//*24337*/(/*24339*//*24340*/assump$slapply/*<24340*//*24339*/(/*24341*/subst0/*<24341*/)/*<24339*/)(/*24345*/assumps/*<24345*/)/*<24337*/)/*<24364*/)/*<24335*/ }/*<24301*/)/*<24301*/ }/*<24301*/)/*<24301*/ }/*<24301*/)/*<24301*/ }/*<24301*/)/*<24301*/)(/*24346*/map$slnil/*<24346*/)(/*24347*/tenv/*<24347*/)(/*24348*/0/*<24348*/)/*<24299*/ } } } }/*<24289*/;

return /*20484*//*20487*//*20488*/eval/*<20488*//*20487*/(/*20489*/"({0: {0: env_nil, 1: infer_stmts, 2: add_stmt, 3: infer, 4: type_to_string, 5: get_type},\n  1: {0: externals_stmt, 1: externals_expr, 2: names},\n  2: {0: parse_stmt, 1: parse_expr, 2: compile_stmt, 3: compile},\n }) => ({type: 'fns',\n   env_nil, infer_stmts, add_stmt, infer, externals_stmt, externals_expr, names, type_to_string, get_type,\n   parse_stmt, parse_expr, compile_stmt, compile, \n }) "/*<20489*/)/*<20487*//*20484*/(/*20529*//*20783*/evaluator/*<20783*//*20529*/(/*24498*//*20784*/inferator/*<20784*//*24498*/(/*24499*/builtin_full/*<24499*/)(/*20786*/infer_stmts/*<20786*/)(/*22155*/full_env$slmerge/*<22155*/)(/*22156*/infer/*<22156*/)(/*22160*/type_$gts/*<22160*/)(/*22161*/function name_22161({0: tenv, 1: ce, 2: assumps}) {

 return function name_22161(name) { return /*23371*/(function match_23371($target) {
if ($target.type === "cons") {
if ($target[0].type === "!>!") {
if ($target[0][1].type === "forall") {
if ($target[0][1][1].type === "=>") {
{
let typ = $target[0][1][1][1];
return /*23412*//*23401*/some/*<23401*//*23412*/(/*23413*/typ/*<23413*/)/*<23412*/
}
}
}
}
}
return /*23407*//*23411*/none/*<23411*//*23407*//*<23407*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 23371');})(/*!*//*23373*//*23374*/filter/*<23374*//*23373*/(/*23375*/function name_23375({0: n}) { return /*23382*//*23383*/$eq/*<23383*//*23382*/(/*23384*/n/*<23384*/)(/*23385*/name/*<23385*/)/*<23382*/ }/*<23375*/)(/*23386*/assumps/*<23386*/)/*<23373*/)/*<23371*/ } }/*<22161*/)/*<24498*/)(/*24500*//*22157*/analysis/*<22157*//*24500*/(/*24501*/externals_stmt/*<24501*/)(/*23356*/function name_23356(expr) { return /*23361*//*23362*/bag$slto_list/*<23362*//*23361*/(/*22158*//*23354*/externals/*<23354*//*22158*/(/*23355*/set$slnil/*<23355*/)(/*23360*/expr/*<23360*/)/*<22158*/)/*<23361*/ }/*<23356*/)(/*22159*/names/*<22159*/)/*<24500*/)(/*24502*//*24503*/parser/*<24503*//*24502*/(/*24504*/parse_stmt/*<24504*/)(/*24505*/parse_expr/*<24505*/)(/*24506*/compile_stmt/*<24506*/)(/*24507*/compile/*<24507*/)/*<24502*/)/*<20529*/)/*<20484*/