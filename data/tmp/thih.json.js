const pint = (v0) => (v1) => ({type: "pint", 0: v0, 1: v1});
const pbool = (v0) => (v1) => ({type: "pbool", 0: v0, 1: v1});
const enumId = /*154*/function name_154(num) { return /*159*/`v${/*161*//*162*/int_to_string/*<162*/(/*161*//*163*/num/*<163*/)/*<161*/}`/*<159*/ }/*<154*/;

const $bar_$gt = /*427*/function name_427(u) { return /*427*/function name_427(t) { return /*434*//*434*//*434*//*435*/map$slset/*<435*/(/*434*//*526*/map$slnil/*<526*/)/*<434*/(/*434*//*436*/u/*<436*/)/*<434*/(/*434*//*437*/t/*<437*/)/*<434*/ }/*<427*/ }/*<427*/;

const compose_transformers = /*7093*/function name_7093(one) { return /*7093*/function name_7093(two) { return /*7093*/function name_7093(ce) { return /*7101*//*7102*/two/*<7102*/(/*7101*//*7103*//*7104*/one/*<7104*/(/*7103*//*7105*/ce/*<7105*/)/*<7103*/)/*<7101*/ }/*<7093*/ }/*<7093*/ }/*<7093*/;

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
const result_then = /*10180*/function name_10180(res) { return /*10180*/function name_10180(next) { return /*10187*/(function match_10187($target) {
if ($target.type === "ok") {
{
let v = $target[0];
return /*10193*//*10194*/next/*<10194*/(/*10193*//*10195*/v/*<10195*/)/*<10193*/
}
}
if ($target.type === "err") {
{
let e = $target[0];
return /*10199*//*10200*/err/*<10200*/(/*10199*//*10201*/e/*<10201*/)/*<10199*/
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 10187');})(/*!*//*10189*/res/*<10189*/)/*<10187*/ }/*<10180*/ }/*<10180*/;

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
/*15953*/13915/*<15953*/
const result_$gts = /*16107*/function name_16107(v_$gts) { return /*16107*/function name_16107(v) { return /*16114*/(function match_16114($target) {
if ($target.type === "ok") {
{
let v = $target[0];
return /*16121*//*16122*/v_$gts/*<16122*/(/*16121*//*16123*/v/*<16123*/)/*<16121*/
}
}
if ($target.type === "err") {
{
let e = $target[0];
return /*16127*/e/*<16127*/
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 16114');})(/*!*//*16116*/v/*<16116*/)/*<16114*/ }/*<16107*/ }/*<16107*/;

const dot = /*16171*/function name_16171(a) { return /*16171*/function name_16171(b) { return /*16171*/function name_16171(c) { return /*16179*//*16180*/a/*<16180*/(/*16179*//*16181*//*16182*/b/*<16182*/(/*16181*//*16183*/c/*<16183*/)/*<16181*/)/*<16179*/ }/*<16171*/ }/*<16171*/ }/*<16171*/;

const nil = ({type: "nil"});
const cons = (v0) => (v1) => ({type: "cons", 0: v0, 1: v1});
const pany = (v0) => ({type: "pany", 0: v0});
const pvar = (v0) => (v1) => ({type: "pvar", 0: v0, 1: v1});
const pcon = (v0) => (v1) => (v2) => ({type: "pcon", 0: v0, 1: v1, 2: v2});
const pstr = (v0) => (v1) => ({type: "pstr", 0: v0, 1: v1});
const pprim = (v0) => (v1) => ({type: "pprim", 0: v0, 1: v1});
const star = ({type: "star"});
const kfun = (v0) => (v1) => ({type: "kfun", 0: v0, 1: v1});
const tyvar = (v0) => (v1) => ({type: "tyvar", 0: v0, 1: v1});
const tycon = (v0) => (v1) => ({type: "tycon", 0: v0, 1: v1});
const tyvar$slkind = /*358*/function name_358($fn_arg) { return /*358*/(function match_358($target) {
if ($target.type === "tyvar") {
{
let v = $target[0];
{
let k = $target[1];
return /*366*/k/*<366*/
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 358');})(/*!*//*-1*/$fn_arg/*<-1*/)/*<358*/ }/*<358*/;

const tycon$slkind = /*367*/function name_367($fn_arg) { return /*367*/(function match_367($target) {
if ($target.type === "tycon") {
{
let v = $target[0];
{
let k = $target[1];
return /*375*/k/*<375*/
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 367');})(/*!*//*-1*/$fn_arg/*<-1*/)/*<367*/ }/*<367*/;

const nullSubst = /*426*/nil/*<426*/;

const all = /*660*/function name_660(f) { return /*660*/function name_660(items) { return /*667*/(function match_667($target) {
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
return /*683*//*683*//*684*/all/*<684*/(/*683*//*685*/f/*<685*/)/*<683*/(/*683*//*686*/rest/*<686*/)/*<683*/
}
return /*687*/false/*<687*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 678');})(/*!*//*680*//*681*/f/*<681*/(/*680*//*682*/one/*<682*/)/*<680*/)/*<678*/
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 667');})(/*!*//*669*/items/*<669*/)/*<667*/ }/*<660*/ }/*<660*/;

const filter = /*714*/function name_714(f) { return /*714*/function name_714(arr) { return /*721*/(function match_721($target) {
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
return /*737*//*737*//*737*/cons/*<737*/(/*737*//*738*/one/*<738*/)/*<737*/(/*737*//*739*//*739*//*743*/filter/*<743*/(/*739*//*744*/f/*<744*/)/*<739*/(/*739*//*745*/rest/*<745*/)/*<739*/)/*<737*/
}
return /*746*//*746*//*747*/filter/*<747*/(/*746*//*748*/f/*<748*/)/*<746*/(/*746*//*749*/rest/*<749*/)/*<746*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 732');})(/*!*//*734*//*735*/f/*<735*/(/*734*//*736*/one/*<736*/)/*<734*/)/*<732*/
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 721');})(/*!*//*723*/arr/*<723*/)/*<721*/ }/*<714*/ }/*<714*/;

const kind$eq = /*1000*/function name_1000(a) { return /*1000*/function name_1000(b) { return /*1007*/(function match_1007($target) {
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
return /*1038*//*1038*//*1040*/kind$eq/*<1040*/(/*1038*//*1041*/b/*<1041*/)/*<1038*/(/*1038*//*1042*/b$qu/*<1042*/)/*<1038*/
}
return /*1043*/false/*<1043*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 1032');})(/*!*//*1034*//*1034*//*1035*/kind$eq/*<1035*/(/*1034*//*1036*/a/*<1036*/)/*<1034*/(/*1034*//*1037*/a$qu/*<1037*/)/*<1034*/)/*<1032*/
}
}
}
}
}
}
}
return /*1045*/false/*<1045*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 1007');})(/*!*//*1009*//*1009*//*1010*/$co/*<1010*/(/*1009*//*1012*/a/*<1012*/)/*<1009*/(/*1009*//*1013*/b/*<1013*/)/*<1009*/)/*<1007*/ }/*<1000*/ }/*<1000*/;

const tycon$eq = /*1046*/function name_1046($fn_arg) { return /*1046*/(function match_1046($target) {
if ($target.type === "tycon") {
{
let name = $target[0];
{
let kind = $target[1];
return /*1046*/function name_1046($fn_arg) { return /*1046*/(function match_1046($target) {
if ($target.type === "tycon") {
{
let name$qu = $target[0];
{
let kind$qu = $target[1];
return /*1053*/(function match_1053($target) {
if ($target === true) {
return /*1065*//*1065*//*1066*/kind$eq/*<1066*/(/*1065*//*1067*/kind/*<1067*/)/*<1065*/(/*1065*//*1068*/kind$qu/*<1068*/)/*<1065*/
}
return /*1069*/false/*<1069*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 1053');})(/*!*//*1061*//*1061*//*1062*/$eq/*<1062*/(/*1061*//*1063*/name/*<1063*/)/*<1061*/(/*1061*//*1064*/name$qu/*<1064*/)/*<1061*/)/*<1053*/
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 1046');})(/*!*//*-1*/$fn_arg/*<-1*/)/*<1046*/ }/*<1046*/
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 1046');})(/*!*//*-1*/$fn_arg/*<-1*/)/*<1046*/ }/*<1046*/;

const kind_$gts = /*1070*/function name_1070(a) { return /*1076*/(function match_1076($target) {
if ($target.type === "star") {
return /*1081*/"*"/*<1081*/
}
if ($target.type === "kfun") {
{
let a = $target[0];
{
let b = $target[1];
return /*1088*/`(${/*1090*//*1092*/kind_$gts/*<1092*/(/*1090*//*1093*/a/*<1093*/)/*<1090*/}->${/*1094*//*1096*/kind_$gts/*<1096*/(/*1094*//*1099*/b/*<1099*/)/*<1094*/})`/*<1088*/
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 1076');})(/*!*//*1078*/a/*<1078*/)/*<1076*/ }/*<1070*/;

const tycon_$gts = /*1100*/function name_1100($fn_arg) { return /*1100*/(function match_1100($target) {
if ($target.type === "tycon") {
{
let name = $target[0];
{
let kind = $target[1];
return /*16297*/(function match_16297($target) {
if ($target.type === "star") {
return /*16302*/name/*<16302*/
}
return /*1109*/`[${/*1111*/name/*<1111*/} : ${/*1116*//*1113*/kind_$gts/*<1113*/(/*1116*//*1117*/kind/*<1117*/)/*<1116*/}]`/*<1109*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 16297');})(/*!*//*16299*/kind/*<16299*/)/*<16297*/
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 1100');})(/*!*//*-1*/$fn_arg/*<-1*/)/*<1100*/ }/*<1100*/;

const array$eq = /*6394*/function name_6394(a$qu) { return /*6394*/function name_6394(b$qu) { return /*6394*/function name_6394(eq) { return /*6402*/(function match_6402($target) {
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
return /*6434*//*6434*//*6434*//*6435*/array$eq/*<6435*/(/*6434*//*6436*/rest/*<6436*/)/*<6434*/(/*6434*//*6437*/rest$qu/*<6437*/)/*<6434*/(/*6434*//*6438*/eq/*<6438*/)/*<6434*/
}
return /*6439*/false/*<6439*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 6428');})(/*!*//*6430*//*6430*//*6431*/eq/*<6431*/(/*6430*//*6432*/one/*<6432*/)/*<6430*/(/*6430*//*6433*/two/*<6433*/)/*<6430*/)/*<6428*/
}
}
}
}
}
}
}
return /*6441*/false/*<6441*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 6402');})(/*!*//*6405*//*6405*//*6406*/$co/*<6406*/(/*6405*//*6407*/a$qu/*<6407*/)/*<6405*/(/*6405*//*6408*/b$qu/*<6408*/)/*<6405*/)/*<6402*/ }/*<6394*/ }/*<6394*/ }/*<6394*/;

const tyvar$eq = /*6509*/function name_6509($fn_arg) { return /*6509*/(function match_6509($target) {
if ($target.type === "tyvar") {
{
let name = $target[0];
{
let kind = $target[1];
return /*6509*/function name_6509($fn_arg) { return /*6509*/(function match_6509($target) {
if ($target.type === "tyvar") {
{
let name$qu = $target[0];
{
let kind$qu = $target[1];
return /*6522*/(function match_6522($target) {
if ($target === true) {
return /*6528*//*6528*//*6529*/kind$eq/*<6529*/(/*6528*//*6530*/kind/*<6530*/)/*<6528*/(/*6528*//*6533*/kind$qu/*<6533*/)/*<6528*/
}
return /*6534*/false/*<6534*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 6522');})(/*!*//*6524*//*6524*//*6525*/$eq/*<6525*/(/*6524*//*6526*/name/*<6526*/)/*<6524*/(/*6524*//*6527*/name$qu/*<6527*/)/*<6524*/)/*<6522*/
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 6509');})(/*!*//*-1*/$fn_arg/*<-1*/)/*<6509*/ }/*<6509*/
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 6509');})(/*!*//*-1*/$fn_arg/*<-1*/)/*<6509*/ }/*<6509*/;

const map = /*6611*/function name_6611(f) { return /*6611*/function name_6611(items) { return /*6644*/(function match_6644($target) {
if ($target.type === "nil") {
return /*6648*/nil/*<6648*/
}
if ($target.type === "cons") {
{
let one = $target[0];
{
let rest = $target[1];
return /*6655*//*6655*//*6655*/cons/*<6655*/(/*6655*//*6664*//*6656*/f/*<6656*/(/*6664*//*6665*/one/*<6665*/)/*<6664*/)/*<6655*/(/*6655*//*6657*//*6657*//*6661*/map/*<6661*/(/*6657*//*6662*/f/*<6662*/)/*<6657*/(/*6657*//*6663*/rest/*<6663*/)/*<6657*/)/*<6655*/
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 6644');})(/*!*//*6646*/items/*<6646*/)/*<6644*/ }/*<6611*/ }/*<6611*/;

const foldl = /*6742*/function name_6742(init) { return /*6742*/function name_6742(items) { return /*6742*/function name_6742(f) { return /*6750*/(function match_6750($target) {
if ($target.type === "nil") {
return /*6754*/init/*<6754*/
}
if ($target.type === "cons") {
{
let one = $target[0];
{
let rest = $target[1];
return /*6761*//*6761*//*6761*//*6762*/foldl/*<6762*/(/*6761*//*6763*//*6763*//*6764*/f/*<6764*/(/*6763*//*6765*/init/*<6765*/)/*<6763*/(/*6763*//*6766*/one/*<6766*/)/*<6763*/)/*<6761*/(/*6761*//*6767*/rest/*<6767*/)/*<6761*/(/*6761*//*6768*/f/*<6768*/)/*<6761*/
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 6750');})(/*!*//*6752*/items/*<6752*/)/*<6750*/ }/*<6742*/ }/*<6742*/ }/*<6742*/;

const defined = /*7013*/function name_7013(opt) { return /*7019*/(function match_7019($target) {
if ($target.type === "some") {
return /*7026*/true/*<7026*/
}
return /*7028*/false/*<7028*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 7019');})(/*!*//*7022*/opt/*<7022*/)/*<7019*/ }/*<7013*/;

const find = /*7180*/function name_7180(arr) { return /*7180*/function name_7180(f) { return /*7187*/(function match_7187($target) {
if ($target.type === "nil") {
return /*7192*/none/*<7192*/
}
if ($target.type === "cons") {
{
let one = $target[0];
{
let rest = $target[1];
return /*7199*/(function match_7199($target) {
if ($target === true) {
return /*7204*//*7205*/some/*<7205*/(/*7204*//*7206*/one/*<7206*/)/*<7204*/
}
return /*7207*//*7207*//*7208*/find/*<7208*/(/*7207*//*7209*/rest/*<7209*/)/*<7207*/(/*7207*//*7210*/f/*<7210*/)/*<7207*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 7199');})(/*!*//*7201*//*7202*/f/*<7202*/(/*7201*//*7203*/one/*<7203*/)/*<7201*/)/*<7199*/
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 7187');})(/*!*//*7189*/arr/*<7189*/)/*<7187*/ }/*<7180*/ }/*<7180*/;

const map$slhas = /*7375*/function name_7375(map) { return /*7375*/function name_7375(key) { return /*7385*/(function match_7385($target) {
if ($target.type === "some") {
return /*7394*/true/*<7394*/
}
return /*7396*/false/*<7396*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 7385');})(/*!*//*7387*//*7387*//*7388*/map$slget/*<7388*/(/*7387*//*7389*/map/*<7389*/)/*<7387*/(/*7387*//*7390*/key/*<7390*/)/*<7387*/)/*<7385*/ }/*<7375*/ }/*<7375*/;

const any = /*7587*/function name_7587(f) { return /*7587*/function name_7587(arr) { return /*7594*/(function match_7594($target) {
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
return /*7611*//*7611*//*7612*/any/*<7612*/(/*7611*//*7613*/f/*<7613*/)/*<7611*/(/*7611*//*7614*/rest/*<7614*/)/*<7611*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 7605');})(/*!*//*7607*//*7608*/f/*<7608*/(/*7607*//*7609*/one/*<7609*/)/*<7607*/)/*<7605*/
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 7594');})(/*!*//*7596*/arr/*<7596*/)/*<7594*/ }/*<7587*/ }/*<7587*/;

const apply_transformers = /*7694*/function name_7694(transformers) { return /*7694*/function name_7694(env) { return /*7701*//*7701*//*7701*//*7702*/foldl/*<7702*/(/*7701*//*7703*/env/*<7703*/)/*<7701*/(/*7701*//*7712*/transformers/*<7712*/)/*<7701*/(/*7701*//*7704*/function name_7704(env) { return /*7704*/function name_7704(f) { return /*7709*//*7710*/f/*<7710*/(/*7709*//*7711*/env/*<7711*/)/*<7709*/ }/*<7704*/ }/*<7704*/)/*<7701*/ }/*<7694*/ }/*<7694*/;

const concat = /*7838*/function name_7838(arrays) { return /*7844*/(function match_7844($target) {
if ($target.type === "nil") {
return /*7848*/nil/*<7848*/
}
if ($target.type === "cons") {
if ($target[0].type === "nil") {
{
let rest = $target[1];
return /*7860*//*7861*/concat/*<7861*/(/*7860*//*7862*/rest/*<7862*/)/*<7860*/
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
return /*7874*//*7874*//*7874*/cons/*<7874*/(/*7874*//*7875*/one/*<7875*/)/*<7874*/(/*7874*//*7876*//*7880*/concat/*<7880*/(/*7876*//*7884*//*7884*//*7884*/cons/*<7884*/(/*7884*//*7882*/rest/*<7882*/)/*<7884*/(/*7884*//*7885*/arrays/*<7885*/)/*<7884*/)/*<7876*/)/*<7874*/
}
}
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 7844');})(/*!*//*7846*/arrays/*<7846*/)/*<7844*/ }/*<7838*/;

const find_some = /*7942*/function name_7942(f) { return /*7942*/function name_7942(arr) { return /*7949*/(function match_7949($target) {
if ($target.type === "nil") {
return /*7954*/none/*<7954*/
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
return /*7972*//*7973*/some/*<7973*/(/*7972*//*7974*/v/*<7974*/)/*<7972*/
}
}
return /*7976*//*7976*//*7977*/find_some/*<7977*/(/*7976*//*7978*/f/*<7978*/)/*<7976*/(/*7976*//*7979*/rest/*<7979*/)/*<7976*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 7964');})(/*!*//*7966*//*7967*/f/*<7967*/(/*7966*//*7968*/one/*<7968*/)/*<7966*/)/*<7964*/
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 7949');})(/*!*//*7951*/arr/*<7951*/)/*<7949*/ }/*<7942*/ }/*<7942*/;

const map$slok = /*8301*/function name_8301(f) { return /*8301*/function name_8301(arr) { return /*8308*/(function match_8308($target) {
if ($target.type === "nil") {
return /*8312*//*8313*/ok/*<8313*/(/*8312*//*8314*/nil/*<8314*/)/*<8312*/
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
return /*8338*//*8341*/ok/*<8341*/(/*8338*//*8342*//*8342*//*8342*/cons/*<8342*/(/*8342*//*8343*/val/*<8343*/)/*<8342*/(/*8342*//*8344*/rest/*<8344*/)/*<8342*/)/*<8338*/
}
}
if ($target.type === "err") {
{
let e = $target[0];
return /*8421*//*8349*/err/*<8349*/(/*8421*//*8422*/e/*<8422*/)/*<8421*/
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 8329');})(/*!*//*8331*//*8331*//*8332*/map$slok/*<8332*/(/*8331*//*8333*/f/*<8333*/)/*<8331*/(/*8331*//*8334*/rest/*<8334*/)/*<8331*/)/*<8329*/
}
}
if ($target.type === "err") {
{
let e = $target[0];
return /*8425*//*8351*/err/*<8351*/(/*8425*//*8426*/e/*<8426*/)/*<8425*/
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 8321');})(/*!*//*8323*//*8324*/f/*<8324*/(/*8323*//*8325*/one/*<8325*/)/*<8323*/)/*<8321*/
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 8308');})(/*!*//*8310*/arr/*<8310*/)/*<8308*/ }/*<8301*/ }/*<8301*/;

const mapi = /*8698*/function name_8698(f) { return /*8698*/function name_8698(i) { return /*8698*/function name_8698(items) { return /*8706*/(function match_8706($target) {
if ($target.type === "nil") {
return /*8710*/nil/*<8710*/
}
if ($target.type === "cons") {
{
let one = $target[0];
{
let rest = $target[1];
return /*8715*//*8715*//*8715*/cons/*<8715*/(/*8715*//*8716*//*8716*//*8717*/f/*<8717*/(/*8716*//*8718*/one/*<8718*/)/*<8716*/(/*8716*//*8725*/i/*<8725*/)/*<8716*/)/*<8715*/(/*8715*//*8720*//*8720*//*8720*//*8721*/mapi/*<8721*/(/*8720*//*8722*/f/*<8722*/)/*<8720*/(/*8720*//*8726*//*8726*//*8728*/$pl/*<8728*/(/*8726*//*8729*/i/*<8729*/)/*<8726*/(/*8726*//*8730*/1/*<8730*/)/*<8726*/)/*<8720*/(/*8720*//*8723*/rest/*<8723*/)/*<8720*/)/*<8715*/
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 8706');})(/*!*//*8708*/items/*<8708*/)/*<8706*/ }/*<8698*/ }/*<8698*/ }/*<8698*/;

const list$slget = /*9421*/function name_9421(arr) { return /*9421*/function name_9421(i) { return /*9428*/(function match_9428($target) {
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
return /*9459*//*9460*/fatal/*<9460*/(/*9459*//*9461*/"Index out of range"/*<9461*/)/*<9459*/
}
return /*9463*//*9463*//*9464*/list$slget/*<9464*/(/*9463*//*9465*/rest/*<9465*/)/*<9463*/(/*9463*//*9466*//*9466*//*9468*/_/*<9468*/(/*9466*//*9469*/i/*<9469*/)/*<9466*/(/*9466*//*9470*/1/*<9470*/)/*<9466*/)/*<9463*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 9453');})(/*!*//*9455*//*9455*//*9474*/$lt$eq/*<9474*/(/*9455*//*9456*/i/*<9456*/)/*<9455*/(/*9455*//*9458*/0/*<9458*/)/*<9455*/)/*<9453*/
}
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 9428');})(/*!*//*9430*//*9430*//*9431*/$co/*<9431*/(/*9430*//*9432*/arr/*<9432*/)/*<9430*/(/*9430*//*9433*/i/*<9433*/)/*<9430*/)/*<9428*/ }/*<9421*/ }/*<9421*/;

const foldr = /*10106*/function name_10106(init) { return /*10106*/function name_10106(items) { return /*10106*/function name_10106(f) { return /*10139*/(function match_10139($target) {
if ($target.type === "nil") {
return /*10143*/init/*<10143*/
}
if ($target.type === "cons") {
{
let one = $target[0];
{
let rest = $target[1];
return /*10148*//*10148*//*10149*/f/*<10149*/(/*10148*//*10150*//*10150*//*10150*//*10151*/foldr/*<10151*/(/*10150*//*10152*/init/*<10152*/)/*<10150*/(/*10150*//*10153*/rest/*<10153*/)/*<10150*/(/*10150*//*10154*/f/*<10154*/)/*<10150*/)/*<10148*/(/*10148*//*10155*/one/*<10155*/)/*<10148*/
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 10139');})(/*!*//*10141*/items/*<10141*/)/*<10139*/ }/*<10106*/ }/*<10106*/ }/*<10106*/;

const join = /*10482*/function name_10482(sep) { return /*10482*/function name_10482(items) { return /*10488*/(function match_10488($target) {
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
return /*10504*//*10505*/$pl$pl/*<10505*/(/*10504*//*10506*//*10506*//*10506*/cons/*<10506*/(/*10506*//*10507*/one/*<10507*/)/*<10506*/(/*10506*//*10506*//*10506*//*10506*/cons/*<10506*/(/*10506*//*10508*/sep/*<10508*/)/*<10506*/(/*10506*//*10506*//*10506*//*10506*/cons/*<10506*/(/*10506*//*10509*//*10509*//*10510*/join/*<10510*/(/*10509*//*10511*/sep/*<10511*/)/*<10509*/(/*10509*//*10512*/rest/*<10512*/)/*<10509*/)/*<10506*/(/*10506*//*10506*/nil/*<10506*/)/*<10506*/)/*<10506*/)/*<10506*/)/*<10504*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 10498');})(/*!*//*10500*/rest/*<10500*/)/*<10498*/
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 10488');})(/*!*//*10490*/items/*<10490*/)/*<10488*/ }/*<10482*/ }/*<10482*/;

/*10514*//*10514*//*10515*/join/*<10515*/(/*10514*//*10516*/" "/*<10516*/)/*<10514*/(/*10514*//*10518*//*10518*//*10518*/cons/*<10518*/(/*10518*//*10519*/"one"/*<10519*/)/*<10518*/(/*10518*//*10518*//*10518*//*10518*/cons/*<10518*/(/*10518*//*10521*/"two"/*<10521*/)/*<10518*/(/*10518*//*10518*//*10518*//*10518*/cons/*<10518*/(/*10518*//*10523*/"three"/*<10523*/)/*<10518*/(/*10518*//*10518*/nil/*<10518*/)/*<10518*/)/*<10518*/)/*<10518*/)/*<10514*/
/*10526*//*10526*//*10527*/join/*<10527*/(/*10526*//*10528*/" "/*<10528*/)/*<10526*/(/*10526*//*10530*/nil/*<10530*/)/*<10526*/
/*10532*//*10532*//*10533*/join/*<10533*/(/*10532*//*10534*/" "/*<10534*/)/*<10532*/(/*10532*//*10536*//*10536*//*10536*/cons/*<10536*/(/*10536*//*10537*/"one"/*<10537*/)/*<10536*/(/*10536*//*10536*/nil/*<10536*/)/*<10536*/)/*<10532*/
/*10571*//*10571*//*10571*//*10572*/foldr/*<10572*/(/*10571*//*10573*/nil/*<10573*/)/*<10571*/(/*10571*//*10574*//*10574*//*10574*/cons/*<10574*/(/*10574*//*10575*/1/*<10575*/)/*<10574*/(/*10574*//*10574*//*10574*//*10574*/cons/*<10574*/(/*10574*//*10576*/2/*<10576*/)/*<10574*/(/*10574*//*10574*//*10574*//*10574*/cons/*<10574*/(/*10574*//*10577*/3/*<10577*/)/*<10574*/(/*10574*//*10574*//*10574*//*10574*/cons/*<10574*/(/*10574*//*10578*/4/*<10578*/)/*<10574*/(/*10574*//*10574*/nil/*<10574*/)/*<10574*/)/*<10574*/)/*<10574*/)/*<10574*/)/*<10571*/(/*10571*//*10579*/function name_10579(b) { return /*10579*/function name_10579(a) { return /*10584*//*10584*//*10585*/cons/*<10585*/(/*10584*//*10586*/a/*<10586*/)/*<10584*/(/*10584*//*10587*/b/*<10587*/)/*<10584*/ }/*<10579*/ }/*<10579*/)/*<10571*/
const rev = /*10589*/function name_10589(arr) { return /*10589*/function name_10589(col) { return /*10595*/(function match_10595($target) {
if ($target.type === "nil") {
return /*10599*/col/*<10599*/
}
if ($target.type === "cons") {
{
let one = $target[0];
if ($target[1].type === "nil") {
return /*10602*//*10602*//*10602*/cons/*<10602*/(/*10602*//*10603*/one/*<10603*/)/*<10602*/(/*10602*//*10605*/col/*<10605*/)/*<10602*/
}
}
}
if ($target.type === "cons") {
{
let one = $target[0];
{
let rest = $target[1];
return /*10610*//*10610*//*10611*/rev/*<10611*/(/*10610*//*10612*/rest/*<10612*/)/*<10610*/(/*10610*//*10613*//*10613*//*10613*/cons/*<10613*/(/*10613*//*10614*/one/*<10614*/)/*<10613*/(/*10613*//*10616*/col/*<10616*/)/*<10613*/)/*<10610*/
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 10595');})(/*!*//*10597*/arr/*<10597*/)/*<10595*/ }/*<10589*/ }/*<10589*/;

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
return /*10708*//*10708*//*10708*/cons/*<10708*/(/*10708*//*10709*//*10709*//*10710*/$co/*<10710*/(/*10709*//*10711*/one/*<10711*/)/*<10709*/(/*10709*//*10712*/two/*<10712*/)/*<10709*/)/*<10708*/(/*10708*//*10714*//*10715*/pairs/*<10715*/(/*10714*//*10716*/rest/*<10716*/)/*<10714*/)/*<10708*/
}
}
}
}
}
return /*10718*//*10719*/fatal/*<10719*/(/*10718*//*10720*/`Pairs given odd number ${/*10722*//*10723*/valueToString/*<10723*/(/*10722*//*10724*/list/*<10724*/)/*<10722*/}`/*<10720*/)/*<10718*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 10698');})(/*!*//*10700*/list/*<10700*/)/*<10698*/ }/*<10693*/;

const replaces = /*10768*/function name_10768(target) { return /*10768*/function name_10768(repl) { return /*10774*/(function match_10774($target) {
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
return /*10790*//*10790*//*10791*/replaces/*<10791*/(/*10790*//*10792*//*10792*//*10792*//*10793*/replace_all/*<10793*/(/*10792*//*10794*/target/*<10794*/)/*<10792*/(/*10792*//*10795*/find/*<10795*/)/*<10792*/(/*10792*//*10796*/nw/*<10796*/)/*<10792*/)/*<10790*/(/*10790*//*10797*/rest/*<10797*/)/*<10790*/
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 10783');})(/*!*//*10785*/one/*<10785*/)/*<10783*/
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 10774');})(/*!*//*10776*/repl/*<10776*/)/*<10774*/ }/*<10768*/ }/*<10768*/;

const tstar = /*12901*/function name_12901(name) { return /*12907*//*12907*//*12908*/tycon/*<12908*/(/*12907*//*12909*/name/*<12909*/)/*<12907*/(/*12907*//*12910*/star/*<12910*/)/*<12907*/ }/*<12901*/;

const partition = /*13843*/function name_13843(arr) { return /*13843*/function name_13843(test) { return /*13852*/(function match_13852($target) {
if ($target.type === "nil") {
return /*13856*//*13856*//*13857*/$co/*<13857*/(/*13856*//*13858*/nil/*<13858*/)/*<13856*/(/*13856*//*13859*/nil/*<13859*/)/*<13856*/
}
if ($target.type === "cons") {
{
let one = $target[0];
{
let rest = $target[1];
return /*13866*/(function let_13866() {const $target = /*13878*//*13878*//*13879*/partition/*<13879*/(/*13878*//*13880*/rest/*<13880*/)/*<13878*/(/*13878*//*13881*/test/*<13881*/)/*<13878*/;
if ($target.type === ",") {
{
let yes = $target[0];
{
let no = $target[1];
return /*13882*/(function match_13882($target) {
if ($target === true) {
return /*13889*//*13889*//*13890*/$co/*<13890*/(/*13889*//*13891*//*13891*//*13891*/cons/*<13891*/(/*13891*//*13892*/one/*<13892*/)/*<13891*/(/*13891*//*13893*/yes/*<13893*/)/*<13891*/)/*<13889*/(/*13889*//*13897*/no/*<13897*/)/*<13889*/
}
return /*13898*//*13898*//*13899*/$co/*<13899*/(/*13898*//*13900*/yes/*<13900*/)/*<13898*/(/*13898*//*13901*//*13901*//*13901*/cons/*<13901*/(/*13901*//*13902*/one/*<13902*/)/*<13901*/(/*13901*//*13903*/no/*<13903*/)/*<13901*/)/*<13898*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 13882');})(/*!*//*13886*//*13887*/test/*<13887*/(/*13886*//*13888*/one/*<13888*/)/*<13886*/)/*<13882*/
}
}
};
throw new Error('let pattern not matched 13874. ' + valueToString($target));})(/*!*/)/*<13866*/
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 13852');})(/*!*//*13854*/arr/*<13854*/)/*<13852*/ }/*<13843*/ }/*<13843*/;

const every = /*13908*/function name_13908(arr) { return /*13908*/function name_13908(f) { return /*13915*/(function match_13915($target) {
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
return /*13931*//*13931*//*13932*/every/*<13932*/(/*13931*//*13933*/rest/*<13933*/)/*<13931*/(/*13931*//*13934*/f/*<13934*/)/*<13931*/
}
return /*13935*/false/*<13935*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 13926');})(/*!*//*13928*//*13929*/f/*<13929*/(/*13928*//*13930*/one/*<13930*/)/*<13928*/)/*<13926*/
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 13915');})(/*!*//*13917*/arr/*<13917*/)/*<13915*/ }/*<13908*/ }/*<13908*/;

const contains = /*13938*/function name_13938(arr) { return /*13938*/function name_13938(item) { return /*13938*/function name_13938(item$eq) { return /*13947*/(function match_13947($target) {
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
return /*13965*//*13965*//*13965*//*13966*/contains/*<13966*/(/*13965*//*13967*/rest/*<13967*/)/*<13965*/(/*13965*//*13968*/item/*<13968*/)/*<13965*/(/*13965*//*13969*/item$eq/*<13969*/)/*<13965*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 13958');})(/*!*//*13960*//*13960*//*13961*/item$eq/*<13961*/(/*13960*//*13962*/one/*<13962*/)/*<13960*/(/*13960*//*13963*/item/*<13963*/)/*<13960*/)/*<13958*/
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 13947');})(/*!*//*13949*/arr/*<13949*/)/*<13947*/ }/*<13938*/ }/*<13938*/ }/*<13938*/;

const numClasses = /*13985*//*13985*//*13985*/cons/*<13985*/(/*13985*//*13986*/"num"/*<13986*/)/*<13985*/(/*13985*//*13985*//*13985*//*13985*/cons/*<13985*/(/*13985*//*13988*/"integral"/*<13988*/)/*<13985*/(/*13985*//*13985*//*13985*//*13985*/cons/*<13985*/(/*13985*//*13990*/"floating"/*<13990*/)/*<13985*/(/*13985*//*13985*//*13985*//*13985*/cons/*<13985*/(/*13985*//*13992*/"fractional"/*<13992*/)/*<13985*/(/*13985*//*13985*//*13985*//*13985*/cons/*<13985*/(/*13985*//*13994*/"real"/*<13994*/)/*<13985*/(/*13985*//*13985*//*13985*//*13985*/cons/*<13985*/(/*13985*//*13996*/"realfloat"/*<13996*/)/*<13985*/(/*13985*//*13985*//*13985*//*13985*/cons/*<13985*/(/*13985*//*13998*/"realfrac"/*<13998*/)/*<13985*/(/*13985*//*13985*/nil/*<13985*/)/*<13985*/)/*<13985*/)/*<13985*/)/*<13985*/)/*<13985*/)/*<13985*/)/*<13985*/;

const $pl$pl$pl = /*14025*/function name_14025(a) { return /*14025*/function name_14025(b) { return /*14032*//*14033*/concat/*<14033*/(/*14032*//*14034*//*14034*//*14034*/cons/*<14034*/(/*14034*//*14035*/a/*<14035*/)/*<14034*/(/*14034*//*14034*//*14034*//*14034*/cons/*<14034*/(/*14034*//*14036*/b/*<14036*/)/*<14034*/(/*14034*//*14034*/nil/*<14034*/)/*<14034*/)/*<14034*/)/*<14032*/ }/*<14025*/ }/*<14025*/;

const head = /*14242*/function name_14242(arr) { return /*14248*/(function match_14248($target) {
if ($target.type === "cons") {
{
let one = $target[0];
return /*14257*/one/*<14257*/
}
}
return /*14259*//*14260*/fatal/*<14260*/(/*14259*//*14261*/"head of empty list"/*<14261*/)/*<14259*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 14248');})(/*!*//*14250*/arr/*<14250*/)/*<14248*/ }/*<14242*/;

const without = /*14306*/function name_14306(base) { return /*14306*/function name_14306(remove) { return /*14306*/function name_14306(x$eq) { return /*14313*//*14313*//*14314*/filter/*<14314*/(/*14313*//*14317*/function name_14317(x) { return /*14321*//*14324*/not/*<14324*/(/*14321*//*14325*//*14325*//*14325*//*14326*/contains/*<14326*/(/*14325*//*14327*/remove/*<14327*/)/*<14325*/(/*14325*//*14328*/x/*<14328*/)/*<14325*/(/*14325*//*14329*/x$eq/*<14329*/)/*<14325*/)/*<14321*/ }/*<14317*/)/*<14313*/(/*14313*//*14315*/base/*<14315*/)/*<14313*/ }/*<14306*/ }/*<14306*/ }/*<14306*/;

const zip = /*14392*/function name_14392(one) { return /*14392*/function name_14392(two) { return /*14399*/(function match_14399($target) {
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
return /*14425*//*14425*//*14425*/cons/*<14425*/(/*14425*//*14426*//*14426*//*14427*/$co/*<14427*/(/*14426*//*14428*/a/*<14428*/)/*<14426*/(/*14426*//*14429*/b/*<14429*/)/*<14426*/)/*<14425*/(/*14425*//*14430*//*14430*//*14435*/zip/*<14435*/(/*14430*//*14436*/one/*<14436*/)/*<14430*/(/*14430*//*14437*/two/*<14437*/)/*<14430*/)/*<14425*/
}
}
}
}
}
}
}
return /*14439*/nil/*<14439*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 14399');})(/*!*//*14401*//*14401*//*14402*/$co/*<14402*/(/*14401*//*14403*/one/*<14403*/)/*<14401*/(/*14401*//*14404*/two/*<14404*/)/*<14401*/)/*<14399*/ }/*<14392*/ }/*<14392*/;

const restricted = /*14756*/function name_14756(bs) { return /*14762*/(function let_14762() {const $target = /*14766*/function name_14766($fn_arg) { return /*14766*/(function match_14766($target) {
if ($target.type === ",") {
{
let i = $target[0];
{
let alts = $target[1];
return /*14773*//*14773*//*14774*/any/*<14774*/(/*14773*//*14775*/function name_14775($fn_arg) { return /*14775*/(function match_14775($target) {
if ($target.type === ",") {
{
let v = $target[0];
return /*14782*/(function match_14782($target) {
if ($target.type === "nil") {
return /*14786*/true/*<14786*/
}
return /*14788*/false/*<14788*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 14782');})(/*!*//*14784*/v/*<14784*/)/*<14782*/
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 14775');})(/*!*//*-1*/$fn_arg/*<-1*/)/*<14775*/ }/*<14775*/)/*<14773*/(/*14773*//*14789*/alts/*<14789*/)/*<14773*/
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 14766');})(/*!*//*-1*/$fn_arg/*<-1*/)/*<14766*/ }/*<14766*/;
{
let simple = $target;
return /*14790*//*14790*//*14792*/any/*<14792*/(/*14790*//*14793*/simple/*<14793*/)/*<14790*/(/*14790*//*14794*/bs/*<14794*/)/*<14790*/
};
throw new Error('let pattern not matched 14765. ' + valueToString($target));})(/*!*/)/*<14762*/ }/*<14756*/;

const zipWith = /*15050*/function name_15050(f) { return /*15050*/function name_15050(left) { return /*15050*/function name_15050(right) { return /*15058*/(function match_15058($target) {
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
return /*15085*//*15085*//*15085*/cons/*<15085*/(/*15085*//*15086*//*15086*//*15087*/f/*<15087*/(/*15086*//*15088*/one/*<15088*/)/*<15086*/(/*15086*//*15089*/two/*<15089*/)/*<15086*/)/*<15085*/(/*15085*//*15090*//*15090*//*15090*//*15094*/zipWith/*<15094*/(/*15090*//*15095*/f/*<15095*/)/*<15090*/(/*15090*//*15096*/left/*<15096*/)/*<15090*/(/*15090*//*15097*/right/*<15097*/)/*<15090*/)/*<15085*/
}
}
}
}
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 15058');})(/*!*//*15060*//*15060*//*15061*/$co/*<15061*/(/*15060*//*15062*/left/*<15062*/)/*<15060*/(/*15060*//*15063*/right/*<15063*/)/*<15060*/)/*<15058*/ }/*<15050*/ }/*<15050*/ }/*<15050*/;

const foldr1 = /*15245*/function name_15245(f) { return /*15245*/function name_15245(lst) { return /*15252*/(function match_15252($target) {
if ($target.type === "nil") {
return /*15256*//*15257*/fatal/*<15257*/(/*15256*//*15258*/"Empty list to foldr1"/*<15258*/)/*<15256*/
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
return /*15273*//*15273*//*15274*/f/*<15274*/(/*15273*//*15275*/one/*<15275*/)/*<15273*/(/*15273*//*15276*/two/*<15276*/)/*<15273*/
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
return /*15284*//*15284*//*15285*/f/*<15285*/(/*15284*//*15286*/one/*<15286*/)/*<15284*/(/*15284*//*15287*//*15287*//*15288*/foldr1/*<15288*/(/*15287*//*15290*/f/*<15290*/)/*<15287*/(/*15287*//*15289*/rest/*<15289*/)/*<15287*/)/*<15284*/
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 15252');})(/*!*//*15254*/lst/*<15254*/)/*<15252*/ }/*<15245*/ }/*<15245*/;

const intersect = /*15297*/function name_15297(t$eq) { return /*15297*/function name_15297(one) { return /*15297*/function name_15297(two) { return /*15305*//*15305*//*15307*/filter/*<15307*/(/*15305*//*15308*/function name_15308(v) { return /*15314*//*15314*//*15314*//*15315*/contains/*<15315*/(/*15314*//*15316*/two/*<15316*/)/*<15314*/(/*15314*//*15317*/v/*<15317*/)/*<15314*/(/*15314*//*15318*/t$eq/*<15318*/)/*<15314*/ }/*<15308*/)/*<15305*/(/*15305*//*15309*/one/*<15309*/)/*<15305*/ }/*<15297*/ }/*<15297*/ }/*<15297*/;

const tyvar_$gts = /*16534*/function name_16534($fn_arg) { return /*16534*/(function match_16534($target) {
if ($target.type === "tyvar") {
{
let name = $target[0];
{
let kind = $target[1];
return /*16543*/(function match_16543($target) {
if ($target.type === "star") {
return /*16548*/name/*<16548*/
}
return /*16550*/`[${/*16552*/name/*<16552*/} : ${/*16554*//*16557*/kind_$gts/*<16557*/(/*16554*//*16558*/kind/*<16558*/)/*<16554*/}]`/*<16550*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 16543');})(/*!*//*16545*/kind/*<16545*/)/*<16543*/
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 16534');})(/*!*//*-1*/$fn_arg/*<-1*/)/*<16534*/ }/*<16534*/;

const cst$sllist = (v0) => (v1) => ({type: "cst/list", 0: v0, 1: v1});
const cst$slarray = (v0) => (v1) => ({type: "cst/array", 0: v0, 1: v1});
const cst$slspread = (v0) => (v1) => ({type: "cst/spread", 0: v0, 1: v1});
const cst$slidentifier = (v0) => (v1) => ({type: "cst/identifier", 0: v0, 1: v1});
const cst$slstring = (v0) => (v1) => (v2) => ({type: "cst/string", 0: v0, 1: v1, 2: v2});
const tvar = (v0) => (v1) => ({type: "tvar", 0: v0, 1: v1});
const tapp = (v0) => (v1) => (v2) => ({type: "tapp", 0: v0, 1: v1, 2: v2});
const tcon = (v0) => (v1) => ({type: "tcon", 0: v0, 1: v1});
const tgen = (v0) => (v1) => ({type: "tgen", 0: v0, 1: v1});
const star_con = /*208*/function name_208(name) { return /*213*//*213*//*214*/tcon/*<214*/(/*213*//*215*//*215*//*216*/tycon/*<216*/(/*215*//*217*/name/*<217*/)/*<215*/(/*215*//*218*/star/*<218*/)/*<215*/)/*<213*/(/*213*//*219*/-1/*<219*/)/*<213*/ }/*<208*/;

const tunit = /*223*//*224*/star_con/*<224*/(/*223*//*225*/"()"/*<225*/)/*<223*/;

const tchar = /*230*//*231*/star_con/*<231*/(/*230*//*232*/"char"/*<232*/)/*<230*/;

const tint = /*237*//*238*/star_con/*<238*/(/*237*//*239*/"int"/*<239*/)/*<237*/;

const tinteger = /*244*//*245*/star_con/*<245*/(/*244*//*246*/"integer"/*<246*/)/*<244*/;

const tfloat = /*251*//*252*/star_con/*<252*/(/*251*//*253*/"float"/*<253*/)/*<251*/;

const tdouble = /*258*//*259*/star_con/*<259*/(/*258*//*260*/"double"/*<260*/)/*<258*/;

const tlist = /*265*//*265*//*266*/tcon/*<266*/(/*265*//*267*//*267*//*268*/tycon/*<268*/(/*267*//*269*/"[]"/*<269*/)/*<267*/(/*267*//*271*//*271*//*272*/kfun/*<272*/(/*271*//*273*/star/*<273*/)/*<271*/(/*271*//*274*/star/*<274*/)/*<271*/)/*<267*/)/*<265*/(/*265*//*275*/-1/*<275*/)/*<265*/;

const tarrow = /*279*//*279*//*280*/tcon/*<280*/(/*279*//*281*//*281*//*282*/tycon/*<282*/(/*281*//*283*/"(->)"/*<283*/)/*<281*/(/*281*//*285*//*285*//*286*/kfun/*<286*/(/*285*//*287*/star/*<287*/)/*<285*/(/*285*//*288*//*288*//*289*/kfun/*<289*/(/*288*//*290*/star/*<290*/)/*<288*/(/*288*//*291*/star/*<291*/)/*<288*/)/*<285*/)/*<281*/)/*<279*/(/*279*//*292*/-1/*<292*/)/*<279*/;

const ttuple2 = /*296*//*296*//*297*/tcon/*<297*/(/*296*//*298*//*298*//*299*/tycon/*<299*/(/*298*//*300*/"(,)"/*<300*/)/*<298*/(/*298*//*302*//*302*//*303*/kfun/*<303*/(/*302*//*304*/star/*<304*/)/*<302*/(/*302*//*305*//*305*//*306*/kfun/*<306*/(/*305*//*307*/star/*<307*/)/*<305*/(/*305*//*308*/star/*<308*/)/*<305*/)/*<302*/)/*<298*/)/*<296*/(/*296*//*309*/-1/*<309*/)/*<296*/;

const tstring = /*313*//*313*//*313*//*314*/tapp/*<314*/(/*313*//*315*/tlist/*<315*/)/*<313*/(/*313*//*316*/tchar/*<316*/)/*<313*/(/*313*//*317*/-1/*<317*/)/*<313*/;

const tfn = /*318*/function name_318(a) { return /*318*/function name_318(b) { return /*324*//*324*//*324*//*325*/tapp/*<325*/(/*324*//*326*//*326*//*326*//*327*/tapp/*<327*/(/*326*//*328*/tarrow/*<328*/)/*<326*/(/*326*//*329*/a/*<329*/)/*<326*/(/*326*//*330*/-1/*<330*/)/*<326*/)/*<324*/(/*324*//*331*/b/*<331*/)/*<324*/(/*324*//*332*/-1/*<332*/)/*<324*/ }/*<318*/ }/*<318*/;

const mklist = /*333*/function name_333(t) { return /*338*//*338*//*338*//*339*/tapp/*<339*/(/*338*//*340*/tlist/*<340*/)/*<338*/(/*338*//*341*/t/*<341*/)/*<338*/(/*338*//*342*/-1/*<342*/)/*<338*/ }/*<333*/;

const mkpair = /*343*/function name_343(a) { return /*343*/function name_343(b) { return /*349*//*349*//*349*//*350*/tapp/*<350*/(/*349*//*351*//*351*//*351*//*352*/tapp/*<352*/(/*351*//*353*/ttuple2/*<353*/)/*<351*/(/*351*//*354*/a/*<354*/)/*<351*/(/*351*//*355*/-1/*<355*/)/*<351*/)/*<349*/(/*349*//*356*/b/*<356*/)/*<349*/(/*349*//*357*/-1/*<357*/)/*<349*/ }/*<343*/ }/*<343*/;

const type$slkind = /*376*/function name_376(type) { return /*381*/(function match_381($target) {
if ($target.type === "tcon") {
{
let tc = $target[0];
return /*388*//*389*/tycon$slkind/*<389*/(/*388*//*390*/tc/*<390*/)/*<388*/
}
}
if ($target.type === "tvar") {
{
let u = $target[0];
return /*395*//*396*/tyvar$slkind/*<396*/(/*395*//*397*/u/*<397*/)/*<395*/
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
return /*414*//*415*/fatal/*<415*/(/*414*//*416*/`Invalid type application ${/*418*//*419*/int_to_string/*<419*/(/*418*//*420*/l/*<420*/)/*<418*/}`/*<416*/)/*<414*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 403');})(/*!*//*405*//*406*/type$slkind/*<406*/(/*405*//*407*/t/*<407*/)/*<405*/)/*<403*/
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 381');})(/*!*//*383*/type/*<383*/)/*<381*/ }/*<376*/;

const type$slapply = /*440*/function name_440(subst) { return /*440*/function name_440(type) { return /*513*/(function match_513($target) {
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
throw new Error('failed to match ' + jsonify($target) + '. Loc: 520');})(/*!*//*522*//*522*//*523*/map$slget/*<523*/(/*522*//*525*/subst/*<525*/)/*<522*/(/*522*//*527*/tyvar/*<527*/)/*<522*/)/*<520*/
}
}
if ($target.type === "tapp") {
{
let target = $target[0];
{
let arg = $target[1];
{
let loc = $target[2];
return /*539*//*539*//*539*//*540*/tapp/*<540*/(/*539*//*541*//*541*//*542*/type$slapply/*<542*/(/*541*//*543*/subst/*<543*/)/*<541*/(/*541*//*544*/target/*<544*/)/*<541*/)/*<539*/(/*539*//*545*//*545*//*546*/type$slapply/*<546*/(/*545*//*547*/subst/*<547*/)/*<545*/(/*545*//*548*/arg/*<548*/)/*<545*/)/*<539*/(/*539*//*587*/loc/*<587*/)/*<539*/
}
}
}
}
return /*550*/type/*<550*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 513');})(/*!*//*515*/type/*<515*/)/*<513*/ }/*<440*/ }/*<440*/;

const type$sltv = /*551*/function name_551(t) { return /*557*/(function match_557($target) {
if ($target.type === "tvar") {
{
let u = $target[0];
return /*564*//*564*//*572*/set$sladd/*<572*/(/*564*//*573*/set$slnil/*<573*/)/*<564*/(/*564*//*574*/u/*<574*/)/*<564*/
}
}
if ($target.type === "tapp") {
{
let l = $target[0];
{
let r = $target[1];
return /*571*//*571*//*575*/set$slmerge/*<575*/(/*571*//*576*//*577*/type$sltv/*<577*/(/*576*//*578*/l/*<578*/)/*<576*/)/*<571*/(/*571*//*579*//*580*/type$sltv/*<580*/(/*579*//*581*/r/*<581*/)/*<579*/)/*<571*/
}
}
}
return /*583*/set$slnil/*<583*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 557');})(/*!*//*559*/t/*<559*/)/*<557*/ }/*<551*/;

const compose_subst = /*584*/function name_584(s1) { return /*584*/function name_584(s2) { return /*594*//*594*//*595*/map$slmerge/*<595*/(/*594*//*596*//*596*//*597*/map$slmap/*<597*/(/*596*//*599*//*600*/type$slapply/*<600*/(/*599*//*601*/s1/*<601*/)/*<599*/)/*<596*/(/*596*//*603*/s2/*<603*/)/*<596*/)/*<594*/(/*594*//*602*/s1/*<602*/)/*<594*/ }/*<584*/ }/*<584*/;

const set$slintersect = /*691*/function name_691(one) { return /*691*/function name_691(two) { return /*700*//*700*//*701*/filter/*<701*/(/*700*//*706*/function name_706(k) { return /*710*//*710*//*711*/set$slhas/*<711*/(/*710*//*712*/two/*<712*/)/*<710*/(/*710*//*713*/k/*<713*/)/*<710*/ }/*<706*/)/*<700*/(/*700*//*702*//*703*/set$slto_list/*<703*/(/*702*//*704*/one/*<704*/)/*<702*/)/*<700*/ }/*<691*/ }/*<691*/;

const varBind = /*750*/function name_750(u) { return /*750*/function name_750(t) { return /*757*/(function match_757($target) {
if ($target.type === "tvar") {
{
let name = $target[0];
return /*765*/(function match_765($target) {
if ($target === true) {
return /*881*/map$slnil/*<881*/
}
return /*772*//*772*//*773*/$bar_$gt/*<773*/(/*772*//*774*/u/*<774*/)/*<772*/(/*772*//*775*/t/*<775*/)/*<772*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 765');})(/*!*//*767*//*767*//*768*/$eq/*<768*/(/*767*//*769*/name/*<769*/)/*<767*/(/*767*//*770*/u/*<770*/)/*<767*/)/*<765*/
}
}
return /*777*/(function match_777($target) {
if ($target === true) {
return /*785*//*786*/fatal/*<786*/(/*785*//*787*/"Occurs check fails"/*<787*/)/*<785*/
}
return /*789*/(function match_789($target) {
if ($target === true) {
return /*800*//*801*/fatal/*<801*/(/*800*//*802*/"kinds do not match"/*<802*/)/*<800*/
}
return /*804*//*804*//*805*/$bar_$gt/*<805*/(/*804*//*806*/u/*<806*/)/*<804*/(/*804*//*807*/t/*<807*/)/*<804*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 789');})(/*!*//*792*//*792*//*793*/$ex$eq/*<793*/(/*792*//*794*//*795*/tyvar$slkind/*<795*/(/*794*//*796*/u/*<796*/)/*<794*/)/*<792*/(/*792*//*797*//*798*/type$slkind/*<798*/(/*797*//*799*/t/*<799*/)/*<797*/)/*<792*/)/*<789*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 777');})(/*!*//*779*//*779*//*780*/set$slhas/*<780*/(/*779*//*781*//*782*/type$sltv/*<782*/(/*781*//*783*/t/*<783*/)/*<781*/)/*<779*/(/*779*//*784*/u/*<784*/)/*<779*/)/*<777*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 757');})(/*!*//*759*/t/*<759*/)/*<757*/ }/*<750*/ }/*<750*/;

/* type alias subst */
const isin = (v0) => (v1) => ({type: "isin", 0: v0, 1: v1});
const type$eq = /*6482*/function name_6482(a) { return /*6482*/function name_6482(b) { return /*6489*/(function match_6489($target) {
if ($target.type === ",") {
if ($target[0].type === "tvar") {
{
let ty = $target[0][0];
if ($target[1].type === "tvar") {
{
let ty$qu = $target[1][0];
return /*6505*//*6505*//*6506*/tyvar$eq/*<6506*/(/*6505*//*6507*/ty/*<6507*/)/*<6505*/(/*6505*//*6508*/ty$qu/*<6508*/)/*<6505*/
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
return /*6554*//*6554*//*6555*/type$eq/*<6555*/(/*6554*//*6556*/arg/*<6556*/)/*<6554*/(/*6554*//*6557*/arg$qu/*<6557*/)/*<6554*/
}
return /*6558*/false/*<6558*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 6548');})(/*!*//*6550*//*6550*//*6551*/type$eq/*<6551*/(/*6550*//*6552*/target/*<6552*/)/*<6550*/(/*6550*//*6553*/target$qu/*<6553*/)/*<6550*/)/*<6548*/
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
return /*6570*//*6570*//*6571*/tycon$eq/*<6571*/(/*6570*//*6572*/tycon/*<6572*/)/*<6570*/(/*6570*//*6573*/tycon$qu/*<6573*/)/*<6570*/
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
return /*6585*//*6585*//*6586*/$eq/*<6586*/(/*6585*//*6587*/n/*<6587*/)/*<6585*/(/*6585*//*6588*/n$qu/*<6588*/)/*<6585*/
}
}
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 6489');})(/*!*//*6491*//*6491*//*6492*/$co/*<6492*/(/*6491*//*6493*/a/*<6493*/)/*<6491*/(/*6491*//*6494*/b/*<6494*/)/*<6491*/)/*<6489*/ }/*<6482*/ }/*<6482*/;

const pred$slapply = /*6607*/function name_6607(subst) { return /*6607*/function name_6607($fn_arg) { return /*6607*/(function match_6607($target) {
if ($target.type === "isin") {
{
let i = $target[0];
{
let t = $target[1];
return /*6685*//*6685*//*6686*/isin/*<6686*/(/*6685*//*6687*/i/*<6687*/)/*<6685*/(/*6685*//*6688*//*6688*//*6689*/type$slapply/*<6689*/(/*6688*//*6690*/subst/*<6690*/)/*<6688*/(/*6688*//*6691*/t/*<6691*/)/*<6688*/)/*<6685*/
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 6607');})(/*!*//*-1*/$fn_arg/*<-1*/)/*<6607*/ }/*<6607*/ }/*<6607*/;

const pred$sltv = /*6675*/function name_6675($fn_arg) { return /*6675*/(function match_6675($target) {
if ($target.type === "isin") {
{
let i = $target[0];
{
let t = $target[1];
return /*6701*//*6702*/type$sltv/*<6702*/(/*6701*//*6703*/t/*<6703*/)/*<6701*/
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 6675');})(/*!*//*-1*/$fn_arg/*<-1*/)/*<6675*/ }/*<6675*/;

const lift = /*6770*/function name_6770(m) { return /*6770*/function name_6770($fn_arg) { return /*6770*/(function match_6770($target) {
if ($target.type === "isin") {
{
let i = $target[0];
{
let t = $target[1];
return /*6770*/function name_6770($fn_arg) { return /*6770*/(function match_6770($target) {
if ($target.type === "isin") {
{
let i$qu = $target[0];
{
let t$qu = $target[1];
return /*6784*/(function match_6784($target) {
if ($target === true) {
return /*6790*//*6790*//*6791*/m/*<6791*/(/*6790*//*6792*/t/*<6792*/)/*<6790*/(/*6790*//*6793*/t$qu/*<6793*/)/*<6790*/
}
return /*6794*//*6795*/fatal/*<6795*/(/*6794*//*6796*/"classes differ"/*<6796*/)/*<6794*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 6784');})(/*!*//*6786*//*6786*//*6787*/$eq/*<6787*/(/*6786*//*6788*/i/*<6788*/)/*<6786*/(/*6786*//*6789*/i$qu/*<6789*/)/*<6786*/)/*<6784*/
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 6770');})(/*!*//*-1*/$fn_arg/*<-1*/)/*<6770*/ }/*<6770*/
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 6770');})(/*!*//*-1*/$fn_arg/*<-1*/)/*<6770*/ }/*<6770*/ }/*<6770*/;

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
return /*8230*//*8232*/type$slhnf/*<8232*/(/*8230*//*8233*/t/*<8233*/)/*<8230*/
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 8211');})(/*!*//*8213*/type/*<8213*/)/*<8211*/ }/*<8201*/;

const in_hnf = /*8235*/function name_8235($fn_arg) { return /*8235*/(function match_8235($target) {
if ($target.type === "isin") {
{
let t = $target[1];
return /*8244*//*8245*/type$slhnf/*<8245*/(/*8244*//*8246*/t/*<8246*/)/*<8244*/
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 8235');})(/*!*//*-1*/$fn_arg/*<-1*/)/*<8235*/ }/*<8235*/;

const inst$sltype = /*9387*/function name_9387(types) { return /*9387*/function name_9387(type) { return /*9394*/(function match_9394($target) {
if ($target.type === "tapp") {
{
let l = $target[0];
{
let r = $target[1];
{
let loc = $target[2];
return /*9401*//*9401*//*9401*//*9402*/tapp/*<9402*/(/*9401*//*9403*//*9403*//*9404*/inst$sltype/*<9404*/(/*9403*//*9405*/types/*<9405*/)/*<9403*/(/*9403*//*9406*/l/*<9406*/)/*<9403*/)/*<9401*/(/*9401*//*9407*//*9407*//*9408*/inst$sltype/*<9408*/(/*9407*//*9409*/types/*<9409*/)/*<9407*/(/*9407*//*9410*/r/*<9410*/)/*<9407*/)/*<9401*/(/*9401*//*9411*/loc/*<9411*/)/*<9401*/
}
}
}
}
if ($target.type === "tgen") {
{
let n = $target[0];
return /*9417*//*9417*//*9418*/list$slget/*<9418*/(/*9417*//*9419*/types/*<9419*/)/*<9417*/(/*9417*//*9420*/n/*<9420*/)/*<9417*/
}
}
{
let t = $target;
return /*9476*/t/*<9476*/
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 9394');})(/*!*//*9396*/type/*<9396*/)/*<9394*/ }/*<9387*/ }/*<9387*/;

const inst$slpred = /*9516*/function name_9516(types) { return /*9516*/function name_9516($fn_arg) { return /*9516*/(function match_9516($target) {
if ($target.type === "isin") {
{
let c = $target[0];
{
let t = $target[1];
return /*9525*//*9525*//*9529*/isin/*<9529*/(/*9525*//*9530*/c/*<9530*/)/*<9525*/(/*9525*//*9531*//*9531*//*9532*/inst$sltype/*<9532*/(/*9531*//*9533*/types/*<9533*/)/*<9531*/(/*9531*//*9534*/t/*<9534*/)/*<9531*/)/*<9525*/
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 9516');})(/*!*//*-1*/$fn_arg/*<-1*/)/*<9516*/ }/*<9516*/ }/*<9516*/;

const tbool = /*9722*//*9723*/star_con/*<9723*/(/*9722*//*9724*/"bool"/*<9724*/)/*<9722*/;

const tapps = /*10805*/function name_10805(items) { return /*10805*/function name_10805(l) { return /*10811*/(function match_10811($target) {
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
return /*10821*//*10821*//*10821*//*10822*/tapp/*<10822*/(/*10821*//*10823*//*10823*//*10824*/tapps/*<10824*/(/*10823*//*10825*/rest/*<10825*/)/*<10823*/(/*10823*//*10826*/l/*<10826*/)/*<10823*/)/*<10821*/(/*10821*//*10827*/one/*<10827*/)/*<10821*/(/*10821*//*10828*/l/*<10828*/)/*<10821*/
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 10811');})(/*!*//*10813*/items/*<10813*/)/*<10811*/ }/*<10805*/ }/*<10805*/;

const parse_type = /*10830*/function name_10830(type) { return /*10835*/(function match_10835($target) {
if ($target.type === "cst/identifier") {
{
let id = $target[0];
{
let l = $target[1];
return /*10842*//*10842*//*10843*/tcon/*<10843*/(/*10842*//*12888*//*12888*//*10844*/tycon/*<10844*/(/*12888*//*12889*/id/*<12889*/)/*<12888*/(/*12888*//*12890*/star/*<12890*/)/*<12888*/)/*<10842*/(/*10842*//*10845*/l/*<10845*/)/*<10842*/
}
}
}
if ($target.type === "cst/list") {
if ($target[0].type === "nil") {
{
let l = $target[1];
return /*10850*//*10851*/fatal/*<10851*/(/*10850*//*10852*/"(parse-type) with empty list"/*<10852*/)/*<10850*/
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
return /*10868*//*10868*//*10868*//*10869*/foldl/*<10869*/(/*10868*//*10870*//*10871*/parse_type/*<10871*/(/*10870*//*10872*/body/*<10872*/)/*<10870*/)/*<10868*/(/*10868*//*10873*//*10873*//*10874*/rev/*<10874*/(/*10873*//*10875*/args/*<10875*/)/*<10873*/(/*10873*//*10876*/nil/*<10876*/)/*<10873*/)/*<10868*/(/*10868*//*10877*/function name_10877(body) { return /*10877*/function name_10877(arg) { return /*10882*//*10882*//*10883*/tfn/*<10883*/(/*10882*//*10891*//*10892*/parse_type/*<10892*/(/*10891*//*10893*/arg/*<10893*/)/*<10891*/)/*<10882*/(/*10882*//*10895*/body/*<10895*/)/*<10882*/ }/*<10877*/ }/*<10877*/)/*<10868*/
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
return /*10901*//*10901*//*10902*/tapps/*<10902*/(/*10901*//*10903*//*10903*//*10904*/rev/*<10904*/(/*10903*//*10905*//*10905*//*10906*/map/*<10906*/(/*10905*//*10908*/parse_type/*<10908*/)/*<10905*/(/*10905*//*12887*/items/*<12887*/)/*<10905*/)/*<10903*/(/*10903*//*10909*/nil/*<10909*/)/*<10903*/)/*<10901*/(/*10901*//*10910*/l/*<10910*/)/*<10901*/
}
}
}
return /*10912*//*10913*/fatal/*<10913*/(/*10912*//*10914*/`(parse-type) Invalid type ${/*10916*//*10917*/valueToString/*<10917*/(/*10916*//*10918*/type/*<10918*/)/*<10916*/}`/*<10914*/)/*<10912*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 10835');})(/*!*//*10837*/type/*<10837*/)/*<10835*/ }/*<10830*/;

/*10921*//*10921*//*10922*/$co/*<10922*/(/*10921*//*10923*/parse_type/*<10923*/)/*<10921*/(/*10921*//*10924*//*10924*//*10924*/cons/*<10924*/(/*10924*//*10925*//*10925*//*10926*/$co/*<10926*/(/*10925*//*10927*/{"0":{"0":{"0":"hi","1":10930,"type":"cst/identifier"},"1":{"0":{"0":"ho","1":10931,"type":"cst/identifier"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"1":10929,"type":"cst/list"}/*<10927*/)/*<10925*/(/*10925*//*10932*//*10932*//*10932*//*15509*/tapp/*<15509*/(/*10932*//*15510*//*15510*//*15511*/tcon/*<15511*/(/*15510*//*15512*//*15512*//*15513*/tycon/*<15513*/(/*15512*//*15514*/"hi"/*<15514*/)/*<15512*/(/*15512*//*15517*/star/*<15517*/)/*<15512*/)/*<15510*/(/*15510*//*15518*/10930/*<15518*/)/*<15510*/)/*<10932*/(/*10932*//*15519*//*15519*//*15520*/tcon/*<15520*/(/*15519*//*15521*//*15521*//*15522*/tycon/*<15522*/(/*15521*//*15523*/"ho"/*<15523*/)/*<15521*/(/*15521*//*15526*/star/*<15526*/)/*<15521*/)/*<15519*/(/*15519*//*15527*/10931/*<15527*/)/*<15519*/)/*<10932*/(/*10932*//*15528*/10929/*<15528*/)/*<10932*/)/*<10925*/)/*<10924*/(/*10924*//*10924*//*10924*//*10924*/cons/*<10924*/(/*10924*//*10945*//*10945*//*10946*/$co/*<10946*/(/*10945*//*10947*/{"0":{"0":{"0":"fn","1":10950,"type":"cst/identifier"},"1":{"0":{"0":{"0":{"0":"x","1":10952,"type":"cst/identifier"},"1":{"type":"nil"},"type":"cons"},"1":10951,"type":"cst/array"},"1":{"0":{"0":"y","1":10953,"type":"cst/identifier"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"type":"cons"},"1":10949,"type":"cst/list"}/*<10947*/)/*<10945*/(/*10945*//*10954*//*10954*//*10954*//*15529*/tapp/*<15529*/(/*10954*//*15530*//*15530*//*15530*//*15531*/tapp/*<15531*/(/*15530*//*15532*//*15532*//*15533*/tcon/*<15533*/(/*15532*//*15534*//*15534*//*15535*/tycon/*<15535*/(/*15534*//*15536*/"(->)"/*<15536*/)/*<15534*/(/*15534*//*15538*//*15538*//*15539*/kfun/*<15539*/(/*15538*//*15541*/star/*<15541*/)/*<15538*/(/*15538*//*15542*//*15542*//*15543*/kfun/*<15543*/(/*15542*//*15545*/star/*<15545*/)/*<15542*/(/*15542*//*15547*/star/*<15547*/)/*<15542*/)/*<15538*/)/*<15534*/)/*<15532*/(/*15532*//*15548*/-1/*<15548*/)/*<15532*/)/*<15530*/(/*15530*//*15549*//*15549*//*15550*/tcon/*<15550*/(/*15549*//*15551*//*15551*//*15552*/tycon/*<15552*/(/*15551*//*15553*/"x"/*<15553*/)/*<15551*/(/*15551*//*15556*/star/*<15556*/)/*<15551*/)/*<15549*/(/*15549*//*15557*/10952/*<15557*/)/*<15549*/)/*<15530*/(/*15530*//*15558*/-1/*<15558*/)/*<15530*/)/*<10954*/(/*10954*//*15559*//*15559*//*15560*/tcon/*<15560*/(/*15559*//*15561*//*15561*//*15562*/tycon/*<15562*/(/*15561*//*15563*/"y"/*<15563*/)/*<15561*/(/*15561*//*15566*/star/*<15566*/)/*<15561*/)/*<15559*/(/*15559*//*15567*/10953/*<15567*/)/*<15559*/)/*<10954*/(/*10954*//*15568*/-1/*<15568*/)/*<10954*/)/*<10945*/)/*<10924*/(/*10924*//*10924*//*10924*//*10924*/cons/*<10924*/(/*10924*//*10975*//*10975*//*10976*/$co/*<10976*/(/*10975*//*10977*/{"0":{"0":{"0":"fn","1":10980,"type":"cst/identifier"},"1":{"0":{"0":{"0":{"0":"a","1":10982,"type":"cst/identifier"},"1":{"0":{"0":"b","1":10983,"type":"cst/identifier"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"1":10981,"type":"cst/array"},"1":{"0":{"0":"c","1":10984,"type":"cst/identifier"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"type":"cons"},"1":10979,"type":"cst/list"}/*<10977*/)/*<10975*/(/*10975*//*10985*//*10985*//*10985*//*15569*/tapp/*<15569*/(/*10985*//*15570*//*15570*//*15570*//*15571*/tapp/*<15571*/(/*15570*//*15572*//*15572*//*15573*/tcon/*<15573*/(/*15572*//*15574*//*15574*//*15575*/tycon/*<15575*/(/*15574*//*15576*/"(->)"/*<15576*/)/*<15574*/(/*15574*//*15578*//*15578*//*15579*/kfun/*<15579*/(/*15578*//*15581*/star/*<15581*/)/*<15578*/(/*15578*//*15582*//*15582*//*15583*/kfun/*<15583*/(/*15582*//*15585*/star/*<15585*/)/*<15582*/(/*15582*//*15587*/star/*<15587*/)/*<15582*/)/*<15578*/)/*<15574*/)/*<15572*/(/*15572*//*15588*/-1/*<15588*/)/*<15572*/)/*<15570*/(/*15570*//*15589*//*15589*//*15590*/tcon/*<15590*/(/*15589*//*15591*//*15591*//*15592*/tycon/*<15592*/(/*15591*//*15593*/"a"/*<15593*/)/*<15591*/(/*15591*//*15596*/star/*<15596*/)/*<15591*/)/*<15589*/(/*15589*//*15597*/10982/*<15597*/)/*<15589*/)/*<15570*/(/*15570*//*15598*/-1/*<15598*/)/*<15570*/)/*<10985*/(/*10985*//*15599*//*15599*//*15599*//*15600*/tapp/*<15600*/(/*15599*//*15601*//*15601*//*15601*//*15602*/tapp/*<15602*/(/*15601*//*15603*//*15603*//*15604*/tcon/*<15604*/(/*15603*//*15605*//*15605*//*15606*/tycon/*<15606*/(/*15605*//*15607*/"(->)"/*<15607*/)/*<15605*/(/*15605*//*15609*//*15609*//*15610*/kfun/*<15610*/(/*15609*//*15612*/star/*<15612*/)/*<15609*/(/*15609*//*15613*//*15613*//*15614*/kfun/*<15614*/(/*15613*//*15616*/star/*<15616*/)/*<15613*/(/*15613*//*15618*/star/*<15618*/)/*<15613*/)/*<15609*/)/*<15605*/)/*<15603*/(/*15603*//*15619*/-1/*<15619*/)/*<15603*/)/*<15601*/(/*15601*//*15620*//*15620*//*15621*/tcon/*<15621*/(/*15620*//*15622*//*15622*//*15623*/tycon/*<15623*/(/*15622*//*15624*/"b"/*<15624*/)/*<15622*/(/*15622*//*15627*/star/*<15627*/)/*<15622*/)/*<15620*/(/*15620*//*15628*/10983/*<15628*/)/*<15620*/)/*<15601*/(/*15601*//*15629*/-1/*<15629*/)/*<15601*/)/*<15599*/(/*15599*//*15630*//*15630*//*15631*/tcon/*<15631*/(/*15630*//*15632*//*15632*//*15633*/tycon/*<15633*/(/*15632*//*15634*/"c"/*<15634*/)/*<15632*/(/*15632*//*15637*/star/*<15637*/)/*<15632*/)/*<15630*/(/*15630*//*15638*/10984/*<15638*/)/*<15630*/)/*<15599*/(/*15599*//*15639*/-1/*<15639*/)/*<15599*/)/*<10985*/(/*10985*//*15640*/-1/*<15640*/)/*<10985*/)/*<10975*/)/*<10924*/(/*10924*//*10924*/nil/*<10924*/)/*<10924*/)/*<10924*/)/*<10924*/)/*<10921*/
const parse_pat = /*11023*/function name_11023(pat) { return /*11028*/(function match_11028($target) {
if ($target.type === "cst/identifier") {
if ($target[0] === "_"){
{
let l = $target[1];
return /*11036*//*11037*/pany/*<11037*/(/*11036*//*11038*/l/*<11038*/)/*<11036*/
}
}
}
if ($target.type === "cst/identifier") {
if ($target[0] === "true"){
{
let l = $target[1];
return /*11044*//*11044*//*11045*/pprim/*<11045*/(/*11044*//*11046*//*11046*//*11047*/pbool/*<11047*/(/*11046*//*11048*/true/*<11048*/)/*<11046*/(/*11046*//*11049*/l/*<11049*/)/*<11046*/)/*<11044*/(/*11044*//*11050*/l/*<11050*/)/*<11044*/
}
}
}
if ($target.type === "cst/identifier") {
if ($target[0] === "false"){
{
let l = $target[1];
return /*11056*//*11056*//*11057*/pprim/*<11057*/(/*11056*//*11058*//*11058*//*11059*/pbool/*<11059*/(/*11058*//*11060*/false/*<11060*/)/*<11058*/(/*11058*//*11061*/l/*<11061*/)/*<11058*/)/*<11056*/(/*11056*//*11062*/l/*<11062*/)/*<11056*/
}
}
}
if ($target.type === "cst/string") {
{
let first = $target[0];
if ($target[1].type === "nil") {
{
let l = $target[2];
return /*11068*//*11068*//*11069*/pstr/*<11069*/(/*11068*//*11070*/first/*<11070*/)/*<11068*/(/*11068*//*11071*/l/*<11071*/)/*<11068*/
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
return /*11084*//*11084*//*11085*/pprim/*<11085*/(/*11084*//*11086*//*11086*//*11087*/pint/*<11087*/(/*11086*//*11088*/int/*<11088*/)/*<11086*/(/*11086*//*11089*/l/*<11089*/)/*<11086*/)/*<11084*/(/*11084*//*11090*/l/*<11090*/)/*<11084*/
}
}
return /*11092*//*11092*//*11093*/pvar/*<11093*/(/*11092*//*11094*/id/*<11094*/)/*<11092*/(/*11092*//*11095*/l/*<11095*/)/*<11092*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 11076');})(/*!*//*11078*//*11079*/string_to_int/*<11079*/(/*11078*//*11080*/id/*<11080*/)/*<11078*/)/*<11076*/
}
}
}
if ($target.type === "cst/array") {
if ($target[0].type === "nil") {
{
let l = $target[1];
return /*11101*//*11101*//*11101*//*11102*/pcon/*<11102*/(/*11101*//*11103*/"nil"/*<11103*/)/*<11101*/(/*11101*//*11105*/nil/*<11105*/)/*<11101*/(/*11101*//*11106*/l/*<11106*/)/*<11101*/
}
}
}
if ($target.type === "cst/array") {
if ($target[0].type === "cons") {
if ($target[0][0].type === "cst/spread") {
{
let inner = $target[0][0][0];
if ($target[0][1].type === "nil") {
return /*11115*//*11116*/parse_pat/*<11116*/(/*11115*//*11117*/inner/*<11117*/)/*<11115*/
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
return /*11125*//*11125*//*11125*//*11126*/pcon/*<11126*/(/*11125*//*11127*/"cons"/*<11127*/)/*<11125*/(/*11125*//*11129*//*11129*//*11129*/cons/*<11129*/(/*11129*//*11130*//*11131*/parse_pat/*<11131*/(/*11130*//*11132*/one/*<11132*/)/*<11130*/)/*<11129*/(/*11129*//*11129*//*11129*//*11129*/cons/*<11129*/(/*11129*//*11133*//*11134*/parse_pat/*<11134*/(/*11133*//*11135*//*11135*//*11136*/cst$slarray/*<11136*/(/*11135*//*11137*/rest/*<11137*/)/*<11135*/(/*11135*//*11138*/l/*<11138*/)/*<11135*/)/*<11133*/)/*<11129*/(/*11129*//*11129*/nil/*<11129*/)/*<11129*/)/*<11129*/)/*<11125*/(/*11125*//*11139*/l/*<11139*/)/*<11125*/
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
return /*11150*//*11150*//*11150*//*11151*/pcon/*<11151*/(/*11150*//*11152*/name/*<11152*/)/*<11150*/(/*11150*//*11153*//*11153*//*11154*/map/*<11154*/(/*11153*//*11156*/parse_pat/*<11156*/)/*<11153*/(/*11153*//*12927*/rest/*<12927*/)/*<11153*/)/*<11150*/(/*11150*//*11157*/l/*<11157*/)/*<11150*/
}
}
}
}
}
}
return /*11159*//*11160*/fatal/*<11160*/(/*11159*//*11161*/`parse-pat mo match ${/*11163*//*11164*/valueToString/*<11164*/(/*11163*//*11165*/pat/*<11165*/)/*<11163*/}`/*<11161*/)/*<11159*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 11028');})(/*!*//*11030*/pat/*<11030*/)/*<11028*/ }/*<11023*/;

/*11168*//*11169*/parse_pat/*<11169*/(/*11168*//*11170*/{"0":{"0":{"0":"1","1":11173,"type":"cst/identifier"},"1":{"0":{"0":"2","1":11174,"type":"cst/identifier"},"1":{"0":{"0":{"0":"a","1":11176,"type":"cst/identifier"},"1":11175,"type":"cst/spread"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"type":"cons"},"1":11172,"type":"cst/array"}/*<11170*/)/*<11168*/
/* type alias ambiguity */
const stdClasses = /*14037*//*14037*//*14038*/$pl$pl$pl/*<14038*/(/*14037*//*14004*//*14004*//*14004*/cons/*<14004*/(/*14004*//*14005*/"eq"/*<14005*/)/*<14004*/(/*14004*//*14004*//*14004*//*14004*/cons/*<14004*/(/*14004*//*14007*/"ord"/*<14007*/)/*<14004*/(/*14004*//*14004*//*14004*//*14004*/cons/*<14004*/(/*14004*//*14009*/"show"/*<14009*/)/*<14004*/(/*14004*//*14004*//*14004*//*14004*/cons/*<14004*/(/*14004*//*14011*/"read"/*<14011*/)/*<14004*/(/*14004*//*14004*//*14004*//*14004*/cons/*<14004*/(/*14004*//*14013*/"bounded"/*<14013*/)/*<14004*/(/*14004*//*14004*//*14004*//*14004*/cons/*<14004*/(/*14004*//*14015*/"enum"/*<14015*/)/*<14004*/(/*14004*//*14004*//*14004*//*14004*/cons/*<14004*/(/*14004*//*14017*/"ix"/*<14017*/)/*<14004*/(/*14004*//*14004*//*14004*//*14004*/cons/*<14004*/(/*14004*//*14019*/"functor"/*<14019*/)/*<14004*/(/*14004*//*14004*//*14004*//*14004*/cons/*<14004*/(/*14004*//*14021*/"monad"/*<14021*/)/*<14004*/(/*14004*//*14004*//*14004*//*14004*/cons/*<14004*/(/*14004*//*14023*/"monadplus"/*<14023*/)/*<14004*/(/*14004*//*14004*/nil/*<14004*/)/*<14004*/)/*<14004*/)/*<14004*/)/*<14004*/)/*<14004*/)/*<14004*/)/*<14004*/)/*<14004*/)/*<14004*/)/*<14004*/)/*<14037*/(/*14037*//*14039*/numClasses/*<14039*/)/*<14037*/;

const preds$sltv = /*14333*/function name_14333(preds) { return /*14339*//*14339*//*14339*//*14340*/foldl/*<14340*/(/*14339*//*14341*/set$slnil/*<14341*/)/*<14339*/(/*14339*//*14342*/preds/*<14342*/)/*<14339*/(/*14339*//*14343*/function name_14343(res) { return /*14343*/function name_14343(pred) { return /*14349*//*14349*//*14350*/set$slmerge/*<14350*/(/*14349*//*14351*/res/*<14351*/)/*<14349*/(/*14349*//*14352*//*14353*/pred$sltv/*<14353*/(/*14352*//*14354*/pred/*<14354*/)/*<14352*/)/*<14349*/ }/*<14343*/ }/*<14343*/)/*<14339*/ }/*<14333*/;

const preds$slapply = /*15209*/function name_15209(subst) { return /*15209*/function name_15209(preds) { return /*15216*//*15216*//*15217*/map/*<15217*/(/*15216*//*15218*//*15219*/pred$slapply/*<15219*/(/*15218*//*15220*/subst/*<15220*/)/*<15218*/)/*<15216*/(/*15216*//*15221*/preds/*<15221*/)/*<15216*/ }/*<15209*/ }/*<15209*/;

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
return /*16258*//*16258*//*16259*/$co/*<16259*/(/*16258*//*16260*//*16260*//*16260*/cons/*<16260*/(/*16260*//*16262*/arg/*<16262*/)/*<16260*/(/*16260*//*16263*/args/*<16263*/)/*<16260*/)/*<16258*/(/*16258*//*16267*/result/*<16267*/)/*<16258*/
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 16252');})(/*!*//*16223*//*16224*/type_$gtfn/*<16224*/(/*16223*//*16225*/result/*<16225*/)/*<16223*/)/*<16252*/
}
}
}
}
}
}
}
return /*16237*//*16237*//*16268*/$co/*<16268*/(/*16237*//*16269*/nil/*<16269*/)/*<16237*/(/*16237*//*16270*/type/*<16270*/)/*<16237*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 16201');})(/*!*//*16203*/type/*<16203*/)/*<16201*/ }/*<16195*/;

/*16241*//*16243*/type_$gtfn/*<16243*/(/*16241*//*16244*//*16244*//*16245*/tfn/*<16245*/(/*16244*//*16246*/tint/*<16246*/)/*<16244*/(/*16244*//*16249*//*16249*//*16247*/tfn/*<16247*/(/*16249*//*16250*/tfloat/*<16250*/)/*<16249*/(/*16249*//*16251*/tbool/*<16251*/)/*<16249*/)/*<16244*/)/*<16241*/
const unwrap_tapp = /*16304*/function name_16304(target) { return /*16304*/function name_16304(args) { return /*16310*/(function match_16310($target) {
if ($target.type === "tapp") {
{
let a = $target[0];
{
let b = $target[1];
return /*16327*//*16327*//*16328*/unwrap_tapp/*<16328*/(/*16327*//*16329*/a/*<16329*/)/*<16327*/(/*16327*//*16339*//*16339*//*16339*/cons/*<16339*/(/*16339*//*16340*/b/*<16340*/)/*<16339*/(/*16339*//*16341*/args/*<16341*/)/*<16339*/)/*<16327*/
}
}
}
return /*16346*//*16346*//*16347*/$co/*<16347*/(/*16346*//*16348*/target/*<16348*/)/*<16346*/(/*16346*//*16349*/args/*<16349*/)/*<16346*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 16310');})(/*!*//*16320*/target/*<16320*/)/*<16310*/ }/*<16304*/ }/*<16304*/;

const merge = /*604*/function name_604(s1) { return /*604*/function name_604(s2) { return /*604*/function name_604(l) { return /*611*/(function let_611() {const $target = /*615*//*615*//*616*/all/*<616*/(/*615*//*617*/function name_617(v) { return /*621*//*621*//*622*/$eq/*<622*/(/*621*//*623*//*623*//*624*/type$slapply/*<624*/(/*623*//*625*/s1/*<625*/)/*<623*/(/*623*//*626*//*626*//*627*/tvar/*<627*/(/*626*//*628*/v/*<628*/)/*<626*/(/*626*//*688*/l/*<688*/)/*<626*/)/*<623*/)/*<621*/(/*621*//*629*//*629*//*630*/type$slapply/*<630*/(/*629*//*631*/s2/*<631*/)/*<629*/(/*629*//*632*//*632*//*633*/tvar/*<633*/(/*632*//*634*/v/*<634*/)/*<632*/(/*632*//*690*/l/*<690*/)/*<632*/)/*<629*/)/*<621*/ }/*<617*/)/*<615*/(/*615*//*635*//*635*//*637*/set$slintersect/*<637*/(/*635*//*644*//*645*/set$slfrom_list/*<645*/(/*644*//*638*//*639*/map$slkeys/*<639*/(/*638*//*640*/s1/*<640*/)/*<638*/)/*<644*/)/*<635*/(/*635*//*646*//*647*/set$slfrom_list/*<647*/(/*646*//*641*//*642*/map$slkeys/*<642*/(/*641*//*643*/s2/*<643*/)/*<641*/)/*<646*/)/*<635*/)/*<615*/;
{
let agree = $target;
return /*648*/(function match_648($target) {
if ($target === true) {
return /*651*//*651*//*653*/map$slmerge/*<653*/(/*651*//*654*/s1/*<654*/)/*<651*/(/*651*//*655*/s2/*<655*/)/*<651*/
}
return /*656*//*657*/fatal/*<657*/(/*656*//*658*/"merge failed"/*<658*/)/*<656*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 648');})(/*!*//*650*/agree/*<650*/)/*<648*/
};
throw new Error('let pattern not matched 614. ' + valueToString($target));})(/*!*/)/*<611*/ }/*<604*/ }/*<604*/ }/*<604*/;

const type_match = /*905*/function name_905(t1) { return /*905*/function name_905(t2) { return /*913*/(function match_913($target) {
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
return /*8065*//*8067*/ok/*<8067*/(/*8065*//*8068*//*8068*//*8068*//*8069*/merge/*<8069*/(/*8068*//*8070*/sl/*<8070*/)/*<8068*/(/*8068*//*8071*/sr/*<8071*/)/*<8068*/(/*8068*//*8072*/loc/*<8072*/)/*<8068*/)/*<8065*/
}
}
{
let err = $target;
return /*8116*/err/*<8116*/
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 8052');})(/*!*//*8054*//*8054*//*8055*/type_match/*<8055*/(/*8054*//*8056*/r/*<8056*/)/*<8054*/(/*8054*//*8057*/r$qu/*<8057*/)/*<8054*/)/*<8052*/
}
}
{
let err = $target;
return /*8098*/err/*<8098*/
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 8037');})(/*!*//*8041*//*8041*//*8042*/type_match/*<8042*/(/*8041*//*8043*/l/*<8043*/)/*<8041*/(/*8041*//*8044*/l$qu/*<8044*/)/*<8041*/)/*<8037*/
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
return /*8073*//*8074*/ok/*<8074*/(/*8073*//*967*//*967*//*968*/$bar_$gt/*<968*/(/*967*//*969*/u/*<969*/)/*<967*/(/*967*//*970*/t/*<970*/)/*<967*/)/*<8073*/
}
return /*971*//*8099*/err/*<8099*/(/*971*//*8100*/"Different Kinds"/*<8100*/)/*<971*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 956');})(/*!*//*961*//*961*//*962*/kind$eq/*<962*/(/*961*//*958*//*959*/tyvar$slkind/*<959*/(/*958*//*960*/u/*<960*/)/*<958*/)/*<961*/(/*961*//*964*//*965*/type$slkind/*<965*/(/*964*//*966*/t/*<966*/)/*<964*/)/*<961*/)/*<956*/
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
return /*8077*//*991*/ok/*<991*/(/*8077*//*8078*/map$slnil/*<8078*/)/*<8077*/
}
return /*992*//*8104*/err/*<8104*/(/*992*//*8105*/`Unable to match types ${/*8107*//*8109*/tycon_$gts/*<8109*/(/*8107*//*8110*/tc1/*<8110*/)/*<8107*/} and ${/*8111*//*8113*/tycon_$gts/*<8113*/(/*8111*//*8114*/tc2/*<8114*/)/*<8111*/}`/*<8105*/)/*<992*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 985');})(/*!*//*987*//*987*//*988*/tycon$eq/*<988*/(/*987*//*989*/tc1/*<989*/)/*<987*/(/*987*//*990*/tc2/*<990*/)/*<987*/)/*<985*/
}
}
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 913');})(/*!*//*915*//*915*//*916*/$co/*<916*/(/*915*//*917*/t1/*<917*/)/*<915*/(/*915*//*918*/t2/*<918*/)/*<915*/)/*<913*/ }/*<905*/ }/*<905*/;

const $eq$gt = (v0) => (v1) => ({type: "=>", 0: v0, 1: v1});
const pred$eq = /*6456*/function name_6456($fn_arg) { return /*6456*/(function match_6456($target) {
if ($target.type === "isin") {
{
let id = $target[0];
{
let type = $target[1];
return /*6456*/function name_6456($fn_arg) { return /*6456*/(function match_6456($target) {
if ($target.type === "isin") {
{
let id$qu = $target[0];
{
let type$qu = $target[1];
return /*6471*/(function match_6471($target) {
if ($target === true) {
return /*6477*//*6477*//*6478*/type$eq/*<6478*/(/*6477*//*6479*/type/*<6479*/)/*<6477*/(/*6477*//*6480*/type$qu/*<6480*/)/*<6477*/
}
return /*6481*/false/*<6481*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 6471');})(/*!*//*6473*//*6473*//*6474*/$eq/*<6474*/(/*6473*//*6475*/id/*<6475*/)/*<6473*/(/*6473*//*6476*/id$qu/*<6476*/)/*<6473*/)/*<6471*/
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 6456');})(/*!*//*-1*/$fn_arg/*<-1*/)/*<6456*/ }/*<6456*/
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 6456');})(/*!*//*-1*/$fn_arg/*<-1*/)/*<6456*/ }/*<6456*/;

const qual$slapply = /*6589*/function name_6589(subst) { return /*6589*/function name_6589($fn_arg) { return /*6589*/(function match_6589($target) {
if ($target.type === "=>") {
{
let preds = $target[0];
{
let t = $target[1];
return /*6589*/function name_6589(t$slapply) { return /*6602*//*6602*//*6603*/$eq$gt/*<6603*/(/*6602*//*6604*//*6604*//*6605*/map/*<6605*/(/*6604*//*6666*//*6667*/pred$slapply/*<6667*/(/*6666*//*6668*/subst/*<6668*/)/*<6666*/)/*<6604*/(/*6604*//*6692*/preds/*<6692*/)/*<6604*/)/*<6602*/(/*6602*//*6669*//*6669*//*6670*/t$slapply/*<6670*/(/*6669*//*6671*/subst/*<6671*/)/*<6669*/(/*6669*//*6672*/t/*<6672*/)/*<6669*/)/*<6602*/ }/*<6589*/
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 6589');})(/*!*//*-1*/$fn_arg/*<-1*/)/*<6589*/ }/*<6589*/ }/*<6589*/;

const qual$sltv = /*6704*/function name_6704($fn_arg) { return /*6704*/(function match_6704($target) {
if ($target.type === "=>") {
{
let preds = $target[0];
{
let t = $target[1];
return /*6704*/function name_6704(t$sltv) { return /*6716*//*6716*//*6716*//*6727*/foldl/*<6727*/(/*6716*//*6728*//*6729*/t$sltv/*<6729*/(/*6728*//*6730*/t/*<6730*/)/*<6728*/)/*<6716*/(/*6716*//*6769*/preds/*<6769*/)/*<6716*/(/*6716*//*6731*/function name_6731(tv) { return /*6731*/function name_6731(pred) { return /*6736*//*6736*//*6737*/set$slmerge/*<6737*/(/*6736*//*6738*/tv/*<6738*/)/*<6736*/(/*6736*//*6739*//*6740*/pred$sltv/*<6740*/(/*6739*//*6741*/pred/*<6741*/)/*<6739*/)/*<6736*/ }/*<6731*/ }/*<6731*/)/*<6716*/ }/*<6704*/
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 6704');})(/*!*//*-1*/$fn_arg/*<-1*/)/*<6704*/ }/*<6704*/;

const matchPred = /*6809*//*6810*/lift/*<6810*/(/*6809*//*6811*/type_match/*<6811*/)/*<6809*/;

/* type alias class */
/* type alias inst */
const class$slord = /*6842*//*6842*//*6843*/$co/*<6843*/(/*6842*//*6844*//*6844*//*6844*/cons/*<6844*/(/*6844*//*6845*/"eq"/*<6845*/)/*<6844*/(/*6844*//*6844*/nil/*<6844*/)/*<6844*/)/*<6842*/(/*6842*//*6847*//*6847*//*6847*/cons/*<6847*/(/*6847*//*6848*//*6848*//*6849*/$eq$gt/*<6849*/(/*6848*//*6850*/nil/*<6850*/)/*<6848*/(/*6848*//*6851*//*6851*//*6852*/isin/*<6852*/(/*6851*//*6853*/"ord"/*<6853*/)/*<6851*/(/*6851*//*6855*/tunit/*<6855*/)/*<6851*/)/*<6848*/)/*<6847*/(/*6847*//*6847*//*6847*//*6847*/cons/*<6847*/(/*6847*//*6856*//*6856*//*6857*/$eq$gt/*<6857*/(/*6856*//*6858*/nil/*<6858*/)/*<6856*/(/*6856*//*6859*//*6859*//*6860*/isin/*<6860*/(/*6859*//*6861*/"ord"/*<6861*/)/*<6859*/(/*6859*//*6863*/tchar/*<6863*/)/*<6859*/)/*<6856*/)/*<6847*/(/*6847*//*6847*//*6847*//*6847*/cons/*<6847*/(/*6847*//*6864*//*6864*//*6865*/$eq$gt/*<6865*/(/*6864*//*6866*/nil/*<6866*/)/*<6864*/(/*6864*//*6870*//*6870*//*6871*/isin/*<6871*/(/*6870*//*6867*/"ord"/*<6867*/)/*<6870*/(/*6870*//*6869*/tint/*<6869*/)/*<6870*/)/*<6864*/)/*<6847*/(/*6847*//*6847*//*6847*//*6847*/cons/*<6847*/(/*6847*//*6872*//*6872*//*6873*/$eq$gt/*<6873*/(/*6872*//*6874*//*6874*//*6874*/cons/*<6874*/(/*6874*//*6875*//*6875*//*6876*/isin/*<6876*/(/*6875*//*6877*/"ord"/*<6877*/)/*<6875*/(/*6875*//*6879*//*6879*//*6880*/tvar/*<6880*/(/*6879*//*6881*//*6881*//*6882*/tyvar/*<6882*/(/*6881*//*6883*/"a"/*<6883*/)/*<6881*/(/*6881*//*6885*/star/*<6885*/)/*<6881*/)/*<6879*/(/*6879*//*6886*/-1/*<6886*/)/*<6879*/)/*<6875*/)/*<6874*/(/*6874*//*6874*//*6874*//*6874*/cons/*<6874*/(/*6874*//*6915*//*6915*//*6917*/isin/*<6917*/(/*6915*//*6918*/"ord"/*<6918*/)/*<6915*/(/*6915*//*6920*//*6920*//*6921*/tvar/*<6921*/(/*6920*//*6922*//*6922*//*6923*/tyvar/*<6923*/(/*6922*//*6924*/"b"/*<6924*/)/*<6922*/(/*6922*//*6926*/star/*<6926*/)/*<6922*/)/*<6920*/(/*6920*//*6927*/-1/*<6927*/)/*<6920*/)/*<6915*/)/*<6874*/(/*6874*//*6874*/nil/*<6874*/)/*<6874*/)/*<6874*/)/*<6872*/(/*6872*//*6887*//*6887*//*6889*/isin/*<6889*/(/*6887*//*6890*/"ord"/*<6890*/)/*<6887*/(/*6887*//*6892*//*6892*//*6893*/mkpair/*<6893*/(/*6892*//*6907*//*6907*//*6895*/tvar/*<6895*/(/*6907*//*6896*//*6896*//*6897*/tyvar/*<6897*/(/*6896*//*6898*/"a"/*<6898*/)/*<6896*/(/*6896*//*6900*/star/*<6900*/)/*<6896*/)/*<6907*/(/*6907*//*6911*/-1/*<6911*/)/*<6907*/)/*<6892*/(/*6892*//*6908*//*6908*//*6909*/tvar/*<6909*/(/*6908*//*6901*//*6901*//*6902*/tyvar/*<6902*/(/*6901*//*6903*/"b"/*<6903*/)/*<6901*/(/*6901*//*6905*/star/*<6905*/)/*<6901*/)/*<6908*/(/*6908*//*6912*/-1/*<6912*/)/*<6908*/)/*<6892*/)/*<6887*/)/*<6872*/)/*<6847*/(/*6847*//*6847*/nil/*<6847*/)/*<6847*/)/*<6847*/)/*<6847*/)/*<6847*/)/*<6842*/;

const class_env = (v0) => (v1) => ({type: "class-env", 0: v0, 1: v1});
const supers = /*6952*/function name_6952($fn_arg) { return /*6952*/(function match_6952($target) {
if ($target.type === "class-env") {
{
let classes = $target[0];
return /*6952*/function name_6952(id) { return /*6962*/(function match_6962($target) {
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
return /*6977*//*6978*/fatal/*<6978*/(/*6977*//*6979*/`Unknown class ${/*6981*/id/*<6981*/}`/*<6979*/)/*<6977*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 6962');})(/*!*//*6964*//*6964*//*6965*/map$slget/*<6965*/(/*6964*//*7350*/classes/*<7350*/)/*<6964*/(/*6964*//*6966*/id/*<6966*/)/*<6964*/)/*<6962*/ }/*<6952*/
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 6952');})(/*!*//*-1*/$fn_arg/*<-1*/)/*<6952*/ }/*<6952*/;

const insts = /*6983*/function name_6983($fn_arg) { return /*6983*/(function match_6983($target) {
if ($target.type === "class-env") {
{
let classes = $target[0];
return /*6983*/function name_6983(id) { return /*6993*/(function match_6993($target) {
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
return /*7007*//*7008*/fatal/*<7008*/(/*7007*//*7009*/`Unknown class ${/*7011*/id/*<7011*/}`/*<7009*/)/*<7007*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 6993');})(/*!*//*6995*//*6995*//*6996*/map$slget/*<6996*/(/*6995*//*7351*/classes/*<7351*/)/*<6995*/(/*6995*//*6997*/id/*<6997*/)/*<6995*/)/*<6993*/ }/*<6983*/
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 6983');})(/*!*//*-1*/$fn_arg/*<-1*/)/*<6983*/ }/*<6983*/;

const modify = /*7029*/function name_7029($fn_arg) { return /*7029*/(function match_7029($target) {
if ($target.type === "class-env") {
{
let classes = $target[0];
{
let defaults = $target[1];
return /*7029*/function name_7029(i) { return /*7029*/function name_7029(c) { return /*7040*//*7040*//*7041*/class_env/*<7041*/(/*7040*//*7352*//*7352*//*7352*//*7353*/map$slset/*<7353*/(/*7352*//*7354*/classes/*<7354*/)/*<7352*/(/*7352*//*7355*/i/*<7355*/)/*<7352*/(/*7352*//*7356*/c/*<7356*/)/*<7352*/)/*<7040*/(/*7040*//*7058*/defaults/*<7058*/)/*<7040*/ }/*<7029*/ }/*<7029*/
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 7029');})(/*!*//*-1*/$fn_arg/*<-1*/)/*<7029*/ }/*<7029*/;

const initial_env = /*7063*//*7063*//*7064*/class_env/*<7064*/(/*7063*//*7065*/map$slnil/*<7065*/)/*<7063*/(/*7063*//*7075*//*7075*//*7075*/cons/*<7075*/(/*7075*//*7077*/tinteger/*<7077*/)/*<7075*/(/*7075*//*7075*//*7075*//*7075*/cons/*<7075*/(/*7075*//*7078*/tdouble/*<7078*/)/*<7075*/(/*7075*//*7075*/nil/*<7075*/)/*<7075*/)/*<7075*/)/*<7063*/;

const add_class = /*7106*/function name_7106($fn_arg) { return /*7106*/(function match_7106($target) {
if ($target.type === "class-env") {
{
let classes = $target[0];
{
let defaults = $target[1];
return /*7106*/function name_7106($fn_arg) { return /*7106*/(function match_7106($target) {
if ($target.type === ",") {
{
let name = $target[0];
{
let supers = $target[1];
return /*7119*/(function match_7119($target) {
if ($target.type === "some") {
return /*7127*//*7128*/fatal/*<7128*/(/*7127*//*7129*/`class ${/*7131*/name/*<7131*/} already defined`/*<7129*/)/*<7127*/
}
return /*7135*/(function match_7135($target) {
if ($target.type === "some") {
{
let super_ = $target[0];
return /*7162*//*7163*/fatal/*<7163*/(/*7162*//*7164*/`Superclass not defined ${/*7166*/super_/*<7166*/}`/*<7164*/)/*<7162*/
}
}
return /*7171*//*7171*//*7172*/class_env/*<7172*/(/*7171*//*7397*//*7397*//*7397*//*7173*/map$slset/*<7173*/(/*7397*//*7398*/classes/*<7398*/)/*<7397*/(/*7397*//*7399*/name/*<7399*/)/*<7397*/(/*7397*//*7400*//*7400*//*7401*/$co/*<7401*/(/*7400*//*7402*/supers/*<7402*/)/*<7400*/(/*7400*//*7403*/nil/*<7403*/)/*<7400*/)/*<7397*/)/*<7171*/(/*7171*//*7174*/defaults/*<7174*/)/*<7171*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 7135');})(/*!*//*7141*//*7141*//*7142*/find/*<7142*/(/*7141*//*7144*/supers/*<7144*/)/*<7141*/(/*7141*//*7145*/function name_7145(name) { return /*7149*//*7359*/not/*<7359*/(/*7149*//*7360*//*7360*//*7361*/map$slhas/*<7361*/(/*7360*//*7362*/classes/*<7362*/)/*<7360*/(/*7360*//*7363*/name/*<7363*/)/*<7360*/)/*<7149*/ }/*<7145*/)/*<7141*/)/*<7135*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 7119');})(/*!*//*7121*//*7121*//*7122*/map$slget/*<7122*/(/*7121*//*7357*/classes/*<7357*/)/*<7121*/(/*7121*//*7123*/name/*<7123*/)/*<7121*/)/*<7119*/
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 7106');})(/*!*//*-1*/$fn_arg/*<-1*/)/*<7106*/ }/*<7106*/
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 7106');})(/*!*//*-1*/$fn_arg/*<-1*/)/*<7106*/ }/*<7106*/;

const core_classes = /*7219*/function name_7219(env) { return /*7404*//*7404*//*7404*//*7405*/foldl/*<7405*/(/*7404*//*7425*/env/*<7425*/)/*<7404*/(/*7404*//*7223*//*7223*//*7223*/cons/*<7223*/(/*7223*//*7225*//*7225*//*7227*/$co/*<7227*/(/*7225*//*7228*/"eq"/*<7228*/)/*<7225*/(/*7225*//*7230*/nil/*<7230*/)/*<7225*/)/*<7223*/(/*7223*//*7223*//*7223*//*7223*/cons/*<7223*/(/*7223*//*7231*//*7231*//*7232*/$co/*<7232*/(/*7231*//*7233*/"ord"/*<7233*/)/*<7231*/(/*7231*//*7235*//*7235*//*7235*/cons/*<7235*/(/*7235*//*7236*/"eq"/*<7236*/)/*<7235*/(/*7235*//*7235*/nil/*<7235*/)/*<7235*/)/*<7231*/)/*<7223*/(/*7223*//*7223*//*7223*//*7223*/cons/*<7223*/(/*7223*//*7238*//*7238*//*7239*/$co/*<7239*/(/*7238*//*7240*/"show"/*<7240*/)/*<7238*/(/*7238*//*7242*/nil/*<7242*/)/*<7238*/)/*<7223*/(/*7223*//*7223*//*7223*//*7223*/cons/*<7223*/(/*7223*//*7243*//*7243*//*7244*/$co/*<7244*/(/*7243*//*7245*/"read"/*<7245*/)/*<7243*/(/*7243*//*7247*/nil/*<7247*/)/*<7243*/)/*<7223*/(/*7223*//*7223*//*7223*//*7223*/cons/*<7223*/(/*7223*//*7248*//*7248*//*7249*/$co/*<7249*/(/*7248*//*7250*/"bounded"/*<7250*/)/*<7248*/(/*7248*//*7252*/nil/*<7252*/)/*<7248*/)/*<7223*/(/*7223*//*7223*//*7223*//*7223*/cons/*<7223*/(/*7223*//*7253*//*7253*//*7254*/$co/*<7254*/(/*7253*//*7255*/"enum"/*<7255*/)/*<7253*/(/*7253*//*7257*/nil/*<7257*/)/*<7253*/)/*<7223*/(/*7223*//*7223*//*7223*//*7223*/cons/*<7223*/(/*7223*//*7258*//*7258*//*7259*/$co/*<7259*/(/*7258*//*7260*/"functor"/*<7260*/)/*<7258*/(/*7258*//*7262*/nil/*<7262*/)/*<7258*/)/*<7223*/(/*7223*//*7223*//*7223*//*7223*/cons/*<7223*/(/*7223*//*7263*//*7263*//*7264*/$co/*<7264*/(/*7263*//*7265*/"monad"/*<7265*/)/*<7263*/(/*7263*//*7267*/nil/*<7267*/)/*<7263*/)/*<7223*/(/*7223*//*7223*/nil/*<7223*/)/*<7223*/)/*<7223*/)/*<7223*/)/*<7223*/)/*<7223*/)/*<7223*/)/*<7223*/)/*<7223*/)/*<7404*/(/*7404*//*7433*/add_class/*<7433*/)/*<7404*/ }/*<7219*/;

const num_classes = /*7268*/function name_7268(env) { return /*7406*//*7406*//*7406*//*7407*/foldl/*<7407*/(/*7406*//*7436*/env/*<7436*/)/*<7406*/(/*7406*//*7272*//*7272*//*7272*/cons/*<7272*/(/*7272*//*7273*//*7273*//*7274*/$co/*<7274*/(/*7273*//*7275*/"num"/*<7275*/)/*<7273*/(/*7273*//*7277*//*7277*//*7277*/cons/*<7277*/(/*7277*//*7278*/"eq"/*<7278*/)/*<7277*/(/*7277*//*7277*//*7277*//*7277*/cons/*<7277*/(/*7277*//*7280*/"show"/*<7280*/)/*<7277*/(/*7277*//*7277*/nil/*<7277*/)/*<7277*/)/*<7277*/)/*<7273*/)/*<7272*/(/*7272*//*7272*//*7272*//*7272*/cons/*<7272*/(/*7272*//*7284*//*7284*//*7285*/$co/*<7285*/(/*7284*//*7286*/"real"/*<7286*/)/*<7284*/(/*7284*//*7288*//*7288*//*7288*/cons/*<7288*/(/*7288*//*7289*/"num"/*<7289*/)/*<7288*/(/*7288*//*7288*//*7288*//*7288*/cons/*<7288*/(/*7288*//*7291*/"ord"/*<7291*/)/*<7288*/(/*7288*//*7288*/nil/*<7288*/)/*<7288*/)/*<7288*/)/*<7284*/)/*<7272*/(/*7272*//*7272*//*7272*//*7272*/cons/*<7272*/(/*7272*//*7293*//*7293*//*7294*/$co/*<7294*/(/*7293*//*7295*/"fractional"/*<7295*/)/*<7293*/(/*7293*//*7297*//*7297*//*7297*/cons/*<7297*/(/*7297*//*7298*/"num"/*<7298*/)/*<7297*/(/*7297*//*7297*/nil/*<7297*/)/*<7297*/)/*<7293*/)/*<7272*/(/*7272*//*7272*//*7272*//*7272*/cons/*<7272*/(/*7272*//*7300*//*7300*//*7301*/$co/*<7301*/(/*7300*//*7302*/"integral"/*<7302*/)/*<7300*/(/*7300*//*7304*//*7304*//*7304*/cons/*<7304*/(/*7304*//*7305*/"real"/*<7305*/)/*<7304*/(/*7304*//*7304*//*7304*//*7304*/cons/*<7304*/(/*7304*//*7307*/"enum"/*<7307*/)/*<7304*/(/*7304*//*7304*/nil/*<7304*/)/*<7304*/)/*<7304*/)/*<7300*/)/*<7272*/(/*7272*//*7272*//*7272*//*7272*/cons/*<7272*/(/*7272*//*7309*//*7309*//*7310*/$co/*<7310*/(/*7309*//*7311*/"realfrac"/*<7311*/)/*<7309*/(/*7309*//*7313*//*7313*//*7313*/cons/*<7313*/(/*7313*//*7314*/"real"/*<7314*/)/*<7313*/(/*7313*//*7313*//*7313*//*7313*/cons/*<7313*/(/*7313*//*7316*/"fractional"/*<7316*/)/*<7313*/(/*7313*//*7313*/nil/*<7313*/)/*<7313*/)/*<7313*/)/*<7309*/)/*<7272*/(/*7272*//*7272*//*7272*//*7272*/cons/*<7272*/(/*7272*//*7318*//*7318*//*7319*/$co/*<7319*/(/*7318*//*7320*/"floating"/*<7320*/)/*<7318*/(/*7318*//*7322*//*7322*//*7322*/cons/*<7322*/(/*7322*//*7323*/"fractional"/*<7323*/)/*<7322*/(/*7322*//*7322*/nil/*<7322*/)/*<7322*/)/*<7318*/)/*<7272*/(/*7272*//*7272*//*7272*//*7272*/cons/*<7272*/(/*7272*//*7325*//*7325*//*7326*/$co/*<7326*/(/*7325*//*7327*/"realfloat"/*<7327*/)/*<7325*/(/*7325*//*7329*//*7329*//*7329*/cons/*<7329*/(/*7329*//*7330*/"realfrac"/*<7330*/)/*<7329*/(/*7329*//*7329*//*7329*//*7329*/cons/*<7329*/(/*7329*//*7332*/"floating"/*<7332*/)/*<7329*/(/*7329*//*7329*/nil/*<7329*/)/*<7329*/)/*<7329*/)/*<7325*/)/*<7272*/(/*7272*//*7272*/nil/*<7272*/)/*<7272*/)/*<7272*/)/*<7272*/)/*<7272*/)/*<7272*/)/*<7272*/)/*<7272*/)/*<7406*/(/*7406*//*7437*/add_class/*<7437*/)/*<7406*/ }/*<7268*/;

/*7446*//*7448*/core_classes/*<7448*/(/*7446*//*7449*/initial_env/*<7449*/)/*<7446*/
const by_super = /*7799*/function name_7799(ce) { return /*7799*/function name_7799(pred) { return /*7806*/(function let_7806() {const $target = /*7813*/pred/*<7813*/;
if ($target.type === "isin") {
{
let i = $target[0];
{
let t = $target[1];
return /*7806*/(function let_7806() {const $target = /*7899*/ce/*<7899*/;
if ($target.type === "class-env") {
{
let supers = $target[0];
return /*7806*/(function let_7806() {const $target = /*7906*/(function match_7906($target) {
if ($target.type === "some") {
{
let s = $target[0];
return /*7916*/s/*<7916*/
}
}
return /*7918*//*7919*/fatal/*<7919*/(/*7918*//*7920*/`Unknown name ${/*7922*/i/*<7922*/}`/*<7920*/)/*<7918*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 7906');})(/*!*//*7909*//*7909*//*7910*/map$slget/*<7910*/(/*7909*//*7911*/supers/*<7911*/)/*<7909*/(/*7909*//*7912*/i/*<7912*/)/*<7909*/)/*<7906*/;
if ($target.type === ",") {
{
let got = $target[0];
return /*7814*//*7814*//*7814*/cons/*<7814*/(/*7814*//*7815*/pred/*<7815*/)/*<7814*/(/*7814*//*7816*//*7820*/concat/*<7820*/(/*7816*//*7821*//*7821*//*7822*/map/*<7822*/(/*7821*//*7900*/function name_7900(i$qu) { return /*7831*//*7831*//*7832*/by_super/*<7832*/(/*7831*//*7833*/ce/*<7833*/)/*<7831*/(/*7831*//*7834*//*7834*//*7835*/isin/*<7835*/(/*7834*//*7836*/i$qu/*<7836*/)/*<7834*/(/*7834*//*7837*/t/*<7837*/)/*<7834*/)/*<7831*/ }/*<7900*/)/*<7821*/(/*7821*//*7901*/got/*<7901*/)/*<7821*/)/*<7816*/)/*<7814*/
}
};
throw new Error('let pattern not matched 7924. ' + valueToString($target));})(/*!*/)/*<7806*/
}
};
throw new Error('let pattern not matched 7895. ' + valueToString($target));})(/*!*/)/*<7806*/
}
}
};
throw new Error('let pattern not matched 7809. ' + valueToString($target));})(/*!*/)/*<7806*/ }/*<7799*/ }/*<7799*/;

const by_inst = /*7927*/function name_7927(ce) { return /*7927*/function name_7927(pred) { return /*7934*/(function let_7934() {const $target = /*7941*/pred/*<7941*/;
if ($target.type === "isin") {
{
let i = $target[0];
{
let t = $target[1];
return /*7934*/(function let_7934() {const $target = /*7988*/ce/*<7988*/;
if ($target.type === "class-env") {
{
let classes = $target[0];
return /*7934*/(function let_7934() {const $target = /*7993*/(function match_7993($target) {
if ($target.type === "some") {
{
let s = $target[0];
return /*8002*/s/*<8002*/
}
}
return /*8004*//*8005*/fatal/*<8005*/(/*8004*//*8006*/`unknown name ${/*8008*/i/*<8008*/}`/*<8006*/)/*<8004*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 7993');})(/*!*//*7995*//*7995*//*7996*/map$slget/*<7996*/(/*7995*//*7997*/classes/*<7997*/)/*<7995*/(/*7995*//*7998*/i/*<7998*/)/*<7995*/)/*<7993*/;
if ($target.type === ",") {
{
let insts = $target[1];
return /*7980*//*7980*//*7981*/find_some/*<7981*/(/*7980*//*7982*/function name_7982($fn_arg) { return /*7982*/(function match_7982($target) {
if ($target.type === "=>") {
{
let ps = $target[0];
{
let h = $target[1];
return /*8017*/(function match_8017($target) {
if ($target.type === "err") {
return /*8027*/none/*<8027*/
}
if ($target.type === "ok") {
{
let u = $target[0];
return /*8118*//*8119*/some/*<8119*/(/*8118*//*8031*//*8031*//*8032*/map/*<8032*/(/*8031*//*8033*//*8034*/pred$slapply/*<8034*/(/*8033*//*8035*/u/*<8035*/)/*<8033*/)/*<8031*/(/*8031*//*8036*/ps/*<8036*/)/*<8031*/)/*<8118*/
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 8017');})(/*!*//*8019*//*8019*//*8020*/matchPred/*<8020*/(/*8019*//*8022*/h/*<8022*/)/*<8019*/(/*8019*//*8023*/pred/*<8023*/)/*<8019*/)/*<8017*/
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 7982');})(/*!*//*-1*/$fn_arg/*<-1*/)/*<7982*/ }/*<7982*/)/*<7980*/(/*7980*//*7983*/insts/*<7983*/)/*<7980*/
}
};
throw new Error('let pattern not matched 7989. ' + valueToString($target));})(/*!*/)/*<7934*/
}
};
throw new Error('let pattern not matched 7984. ' + valueToString($target));})(/*!*/)/*<7934*/
}
}
};
throw new Error('let pattern not matched 7937. ' + valueToString($target));})(/*!*/)/*<7934*/ }/*<7927*/ }/*<7927*/;

const entail = /*8121*/function name_8121(ce) { return /*8121*/function name_8121(ps) { return /*8121*/function name_8121(p) { return /*8129*/(function match_8129($target) {
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
return /*8194*//*8194*//*8195*/all/*<8195*/(/*8194*//*8196*//*8196*//*8197*/entail/*<8197*/(/*8196*//*8198*/ce/*<8198*/)/*<8196*/(/*8196*//*8199*/ps/*<8199*/)/*<8196*/)/*<8194*/(/*8194*//*8200*/qs/*<8200*/)/*<8194*/
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 8143');})(/*!*//*8184*//*8184*//*8185*/by_inst/*<8185*/(/*8184*//*8186*/ce/*<8186*/)/*<8184*/(/*8184*//*8187*/p/*<8187*/)/*<8184*/)/*<8143*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 8129');})(/*!*//*8131*//*8131*//*8132*/any/*<8132*/(/*8131*//*8133*//*8179*/any/*<8179*/(/*8133*//*8180*//*8181*/pred$eq/*<8181*/(/*8180*//*8182*/p/*<8182*/)/*<8180*/)/*<8133*/)/*<8131*/(/*8131*//*8136*//*8136*//*8137*/map/*<8137*/(/*8136*//*8138*//*8139*/by_super/*<8139*/(/*8138*//*8140*/ce/*<8140*/)/*<8138*/)/*<8136*/(/*8136*//*8141*/ps/*<8141*/)/*<8136*/)/*<8131*/)/*<8129*/ }/*<8121*/ }/*<8121*/ }/*<8121*/;

const simplify_inner = /*8441*/function name_8441(ce) { return /*8441*/function name_8441(rs) { return /*8441*/function name_8441(preds) { return /*8447*/(function match_8447($target) {
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
return /*8472*//*8472*//*8472*//*8476*/simplify_inner/*<8476*/(/*8472*//*8477*/ce/*<8477*/)/*<8472*/(/*8472*//*8478*/rs/*<8478*/)/*<8472*/(/*8472*//*8479*/ps/*<8479*/)/*<8472*/
}
return /*8480*//*8480*//*8480*//*8481*/simplify_inner/*<8481*/(/*8480*//*8482*/ce/*<8482*/)/*<8480*/(/*8480*//*8483*//*8483*//*8483*/cons/*<8483*/(/*8483*//*8484*/p/*<8484*/)/*<8483*/(/*8483*//*8485*/rs/*<8485*/)/*<8483*/)/*<8480*/(/*8480*//*8489*/ps/*<8489*/)/*<8480*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 8461');})(/*!*//*8463*//*8463*//*8463*//*8464*/entail/*<8464*/(/*8463*//*8465*/ce/*<8465*/)/*<8463*/(/*8463*//*8466*//*8467*/concat/*<8467*/(/*8466*//*8468*//*8468*//*8468*/cons/*<8468*/(/*8468*//*8469*/rs/*<8469*/)/*<8468*/(/*8468*//*8468*//*8468*//*8468*/cons/*<8468*/(/*8468*//*8470*/ps/*<8470*/)/*<8468*/(/*8468*//*8468*/nil/*<8468*/)/*<8468*/)/*<8468*/)/*<8466*/)/*<8463*/(/*8463*//*8471*/p/*<8471*/)/*<8463*/)/*<8461*/
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 8447');})(/*!*//*8452*/preds/*<8452*/)/*<8447*/ }/*<8441*/ }/*<8441*/ }/*<8441*/;

const simplify = /*8490*/function name_8490(ce) { return /*8498*//*8498*//*8499*/simplify_inner/*<8499*/(/*8498*//*8500*/ce/*<8500*/)/*<8498*/(/*8498*//*8501*/nil/*<8501*/)/*<8498*/ }/*<8490*/;

const sc_entail = /*8530*/function name_8530(ce) { return /*8530*/function name_8530(ps) { return /*8530*/function name_8530(p) { return /*8538*//*8538*//*8539*/any/*<8539*/(/*8538*//*8551*//*8541*/any/*<8541*/(/*8551*//*8542*//*8543*/pred$eq/*<8543*/(/*8542*//*8544*/p/*<8544*/)/*<8542*/)/*<8551*/)/*<8538*/(/*8538*//*8545*//*8545*//*8546*/map/*<8546*/(/*8545*//*8547*//*8548*/by_super/*<8548*/(/*8547*//*8549*/ce/*<8549*/)/*<8547*/)/*<8545*/(/*8545*//*8550*/ps/*<8550*/)/*<8545*/)/*<8538*/ }/*<8530*/ }/*<8530*/ }/*<8530*/;

const forall = (v0) => (v1) => ({type: "forall", 0: v0, 1: v1});
const scheme$slapply = /*8593*/function name_8593(subst) { return /*8593*/function name_8593($fn_arg) { return /*8593*/(function match_8593($target) {
if ($target.type === "forall") {
{
let ks = $target[0];
{
let qt = $target[1];
return /*8604*//*8604*//*8605*/forall/*<8605*/(/*8604*//*8606*/ks/*<8606*/)/*<8604*/(/*8604*//*8607*//*8607*//*8607*//*8609*/qual$slapply/*<8609*/(/*8607*//*8612*/subst/*<8612*/)/*<8607*/(/*8607*//*8610*/qt/*<8610*/)/*<8607*/(/*8607*//*8611*/type$slapply/*<8611*/)/*<8607*/)/*<8604*/
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 8593');})(/*!*//*-1*/$fn_arg/*<-1*/)/*<8593*/ }/*<8593*/ }/*<8593*/;

const scheme$sltv = /*8613*/function name_8613($fn_arg) { return /*8613*/(function match_8613($target) {
if ($target.type === "forall") {
{
let ks = $target[0];
{
let qt = $target[1];
return /*8624*//*8624*//*8625*/qual$sltv/*<8625*/(/*8624*//*8626*/qt/*<8626*/)/*<8624*/(/*8624*//*8629*/type$sltv/*<8629*/)/*<8624*/
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 8613');})(/*!*//*-1*/$fn_arg/*<-1*/)/*<8613*/ }/*<8613*/;

const quantify = /*8627*/function name_8627(vs) { return /*8627*/function name_8627(qt) { return /*8635*/(function let_8635() {const $target = /*8639*//*8639*//*8640*/filter/*<8640*/(/*8639*//*8657*/function name_8657(v) { return /*8641*//*8641*//*8645*/any/*<8645*/(/*8641*//*8646*//*8647*/tyvar$eq/*<8647*/(/*8646*//*8648*/v/*<8648*/)/*<8646*/)/*<8641*/(/*8641*//*8661*/vs/*<8661*/)/*<8641*/ }/*<8657*/)/*<8639*/(/*8639*//*8655*//*8656*/set$slto_list/*<8656*/(/*8655*//*8649*//*8649*//*8651*/qual$sltv/*<8651*/(/*8649*//*8652*/qt/*<8652*/)/*<8649*/(/*8649*//*8653*/type$sltv/*<8653*/)/*<8649*/)/*<8655*/)/*<8639*/;
{
let vs$qu = $target;
return /*8635*/(function let_8635() {const $target = /*8670*//*8670*//*8671*/map/*<8671*/(/*8670*//*8672*/tyvar$slkind/*<8672*/)/*<8670*/(/*8670*//*8673*/vs$qu/*<8673*/)/*<8670*/;
{
let ks = $target;
return /*8635*/(function let_8635() {const $target = /*8733*//*8734*/map$slfrom_list/*<8734*/(/*8733*//*8675*//*8675*//*8675*//*8684*/mapi/*<8684*/(/*8675*//*8686*/function name_8686(v) { return /*8686*/function name_8686(i) { return /*8691*//*8691*//*8692*/$co/*<8692*/(/*8691*//*8693*/v/*<8693*/)/*<8691*/(/*8691*//*8694*//*8694*//*8695*/tgen/*<8695*/(/*8694*//*8696*/i/*<8696*/)/*<8694*/(/*8694*//*8697*/-1/*<8697*/)/*<8694*/)/*<8691*/ }/*<8686*/ }/*<8686*/)/*<8675*/(/*8675*//*8732*/0/*<8732*/)/*<8675*/(/*8675*//*8685*/vs$qu/*<8685*/)/*<8675*/)/*<8733*/;
{
let subst = $target;
return /*8642*//*8642*//*8662*/forall/*<8662*/(/*8642*//*8663*/ks/*<8663*/)/*<8642*/(/*8642*//*8664*//*8664*//*8664*//*8665*/qual$slapply/*<8665*/(/*8664*//*8666*/subst/*<8666*/)/*<8664*/(/*8664*//*8667*/qt/*<8667*/)/*<8664*/(/*8664*//*8668*/type$slapply/*<8668*/)/*<8664*/)/*<8642*/
};
throw new Error('let pattern not matched 8674. ' + valueToString($target));})(/*!*/)/*<8635*/
};
throw new Error('let pattern not matched 8669. ' + valueToString($target));})(/*!*/)/*<8635*/
};
throw new Error('let pattern not matched 8638. ' + valueToString($target));})(/*!*/)/*<8635*/ }/*<8627*/ }/*<8627*/;

const to_scheme = /*8643*/function name_8643(t) { return /*8740*//*8740*//*8741*/forall/*<8741*/(/*8740*//*8742*/nil/*<8742*/)/*<8740*/(/*8740*//*8743*//*8743*//*8744*/$eq$gt/*<8744*/(/*8743*//*8745*/nil/*<8745*/)/*<8743*/(/*8743*//*8746*/t/*<8746*/)/*<8743*/)/*<8740*/ }/*<8643*/;

const $ex$gt$ex = (v0) => (v1) => ({type: "!>!", 0: v0, 1: v1});
const assump$slapply = /*8757*/function name_8757(subst) { return /*8757*/function name_8757($fn_arg) { return /*8757*/(function match_8757($target) {
if ($target.type === "!>!") {
{
let id = $target[0];
{
let sc = $target[1];
return /*8767*//*8767*//*8768*/$ex$gt$ex/*<8768*/(/*8767*//*8769*/id/*<8769*/)/*<8767*/(/*8767*//*8770*//*8770*//*8772*/scheme$slapply/*<8772*/(/*8770*//*8775*/subst/*<8775*/)/*<8770*/(/*8770*//*8776*/sc/*<8776*/)/*<8770*/)/*<8767*/
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 8757');})(/*!*//*-1*/$fn_arg/*<-1*/)/*<8757*/ }/*<8757*/ }/*<8757*/;

const assump$sltv = /*8777*/function name_8777($fn_arg) { return /*8777*/(function match_8777($target) {
if ($target.type === "!>!") {
{
let id = $target[0];
{
let sc = $target[1];
return /*8786*//*8787*/scheme$sltv/*<8787*/(/*8786*//*8788*/sc/*<8788*/)/*<8786*/
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 8777');})(/*!*//*-1*/$fn_arg/*<-1*/)/*<8777*/ }/*<8777*/;

const find_scheme = /*8789*/function name_8789(id) { return /*8789*/function name_8789(assumps) { return /*8796*/(function match_8796($target) {
if ($target.type === "nil") {
return /*8800*//*8801*/err/*<8801*/(/*8800*//*8802*/`Unbound identifier ${/*8804*/id/*<8804*/}`/*<8802*/)/*<8800*/
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
return /*8821*//*8822*/ok/*<8822*/(/*8821*//*8823*/sc/*<8823*/)/*<8821*/
}
return /*8824*//*8824*//*8826*/find_scheme/*<8826*/(/*8824*//*8827*/id/*<8827*/)/*<8824*/(/*8824*//*8828*/rest/*<8828*/)/*<8824*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 8815');})(/*!*//*8817*//*8817*//*8818*/$eq/*<8818*/(/*8817*//*8819*/id/*<8819*/)/*<8817*/(/*8817*//*8820*/id$qu/*<8820*/)/*<8817*/)/*<8815*/
}
}
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 8796');})(/*!*//*8798*/assumps/*<8798*/)/*<8796*/ }/*<8789*/ }/*<8789*/;

const type_$gts = /*8982*/function name_8982(type) { return /*8990*/(function match_8990($target) {
if ($target.type === "tvar") {
if ($target[0].type === "tyvar") {
{
let name = $target[0][0];
{
let kind = $target[0][1];
return /*9065*/`var ${/*9071*/name/*<9071*/} : ${/*9073*//*9075*/kind_$gts/*<9075*/(/*9073*//*9076*/kind/*<9076*/)/*<9073*/}`/*<9065*/
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
return /*16383*/(function let_16383() {const $target = /*16390*//*16390*//*16391*/unwrap_tapp/*<16391*/(/*16390*//*16392*/target/*<16392*/)/*<16390*/(/*16390*//*16393*//*16393*//*16393*/cons/*<16393*/(/*16393*//*16394*/arg/*<16394*/)/*<16393*/(/*16393*//*16393*/nil/*<16393*/)/*<16393*/)/*<16390*/;
if ($target.type === ",") {
{
let target = $target[0];
{
let args = $target[1];
return /*16395*/`(${/*16397*//*16398*/type_$gts/*<16398*/(/*16397*//*16399*/target/*<16399*/)/*<16397*/} ${/*16401*//*16401*//*16402*/join/*<16402*/(/*16401*//*16403*/" "/*<16403*/)/*<16401*/(/*16401*//*16405*//*16405*//*16406*/map/*<16406*/(/*16405*//*16407*/type_$gts/*<16407*/)/*<16405*/(/*16405*//*16408*/args/*<16408*/)/*<16405*/)/*<16401*/})`/*<16395*/
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
return /*16281*/`(fn [${/*16287*//*16287*//*16289*/join/*<16289*/(/*16287*//*16290*/" "/*<16290*/)/*<16287*/(/*16287*//*16292*//*16292*//*16293*/map/*<16293*/(/*16292*//*16295*/type_$gts/*<16295*/)/*<16292*/(/*16292*//*16296*/args/*<16296*/)/*<16292*/)/*<16287*/}] ${/*16283*//*16285*/type_$gts/*<16285*/(/*16283*//*16286*/result/*<16286*/)/*<16283*/})`/*<16281*/
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 16271');})(/*!*//*16273*//*16274*/type_$gtfn/*<16274*/(/*16273*//*16275*/type/*<16275*/)/*<16273*/)/*<16271*/
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
return /*16458*/name/*<16458*/
}
}
}
if ($target.type === "tcon") {
{
let con = $target[0];
return /*9096*//*9097*/tycon_$gts/*<9097*/(/*9096*//*9098*/con/*<9098*/)/*<9096*/
}
}
if ($target.type === "tgen") {
{
let num = $target[0];
return /*9103*/`gen${/*9105*//*9107*/int_to_string/*<9107*/(/*9105*//*9108*/num/*<9108*/)/*<9105*/}`/*<9103*/
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 8990');})(/*!*//*8992*/type/*<8992*/)/*<8990*/ }/*<8982*/;

const inst$slpreds = /*9504*/function name_9504(types) { return /*9504*/function name_9504(preds) { return /*9510*//*9510*//*9511*/map/*<9511*/(/*9510*//*9512*//*9513*/inst$slpred/*<9513*/(/*9512*//*9514*/types/*<9514*/)/*<9512*/)/*<9510*/(/*9510*//*9515*/preds/*<9515*/)/*<9510*/ }/*<9504*/ }/*<9504*/;

const type_env = (v0) => (v1) => ({type: "type-env", 0: v0, 1: v1});
const tenv$slconstr = /*9935*/function name_9935($fn_arg) { return /*9935*/(function match_9935($target) {
if ($target.type === "type-env") {
{
let constrs = $target[0];
return /*9935*/function name_9935(name) { return /*9945*//*9945*//*9946*/map$slget/*<9946*/(/*9945*//*9947*/constrs/*<9947*/)/*<9945*/(/*9945*//*9948*/name/*<9948*/)/*<9945*/ }/*<9935*/
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 9935');})(/*!*//*-1*/$fn_arg/*<-1*/)/*<9935*/ }/*<9935*/;

const tenv$slvalue = /*10288*/function name_10288($fn_arg) { return /*10288*/(function match_10288($target) {
if ($target.type === "type-env") {
{
let values = $target[1];
return /*10288*/function name_10288(name) { return /*10303*//*10303*//*10304*/map$slget/*<10304*/(/*10303*//*10305*/values/*<10305*/)/*<10303*/(/*10303*//*10306*/name/*<10306*/)/*<10303*/ }/*<10288*/
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 10288');})(/*!*//*-1*/$fn_arg/*<-1*/)/*<10288*/ }/*<10288*/;

const candidates = /*14040*/function name_14040(ce) { return /*14040*/function name_14040($fn_arg) { return /*14040*/(function match_14040($target) {
if ($target.type === ",") {
{
let v = $target[0];
{
let qs = $target[1];
return /*14050*/(function let_14050() {const $target = /*14181*/ce/*<14181*/;
if ($target.type === "class-env") {
{
let defaults = $target[1];
return /*14050*/(function let_14050() {const $target = /*14056*//*14056*//*14057*/map/*<14057*/(/*14056*//*14059*/function name_14059($fn_arg) { return /*14059*/(function match_14059($target) {
if ($target.type === "isin") {
{
let i = $target[0];
return /*14066*/i/*<14066*/
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 14059');})(/*!*//*-1*/$fn_arg/*<-1*/)/*<14059*/ }/*<14059*/)/*<14056*/(/*14056*//*14058*/qs/*<14058*/)/*<14056*/;
{
let is = $target;
return /*14050*/(function let_14050() {const $target = /*14077*//*14077*//*14078*/map/*<14078*/(/*14077*//*14068*/function name_14068($fn_arg) { return /*14068*/(function match_14068($target) {
if ($target.type === "isin") {
{
let t = $target[1];
return /*14075*/t/*<14075*/
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 14068');})(/*!*//*-1*/$fn_arg/*<-1*/)/*<14068*/ }/*<14068*/)/*<14077*/(/*14077*//*14079*/qs/*<14079*/)/*<14077*/;
{
let ts = $target;
return /*14085*/(function match_14085($target) {
if ($target === true) {
return /*14105*/nil/*<14105*/
}
return /*14106*//*14106*//*14143*/filter/*<14143*/(/*14106*//*14144*/function name_14144(t$qu) { return /*14150*//*14150*//*14155*/all/*<14155*/(/*14150*//*14156*//*14156*//*14157*/entail/*<14157*/(/*14156*//*14158*/ce/*<14158*/)/*<14156*/(/*14156*//*14159*/nil/*<14159*/)/*<14156*/)/*<14150*/(/*14150*//*14160*//*14160*//*14161*/map/*<14161*/(/*14160*//*14163*/function name_14163(i) { return /*14167*//*14167*//*14168*/isin/*<14168*/(/*14167*//*14169*/i/*<14169*/)/*<14167*/(/*14167*//*14170*/t$qu/*<14170*/)/*<14167*/ }/*<14163*/)/*<14160*/(/*14160*//*14172*/is/*<14172*/)/*<14160*/)/*<14150*/ }/*<14144*/)/*<14106*/(/*14106*//*14153*/defaults/*<14153*/)/*<14106*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 14085');})(/*!*//*14087*//*14093*/not/*<14093*/(/*14087*//*14094*//*14094*//*14095*/every/*<14095*/(/*14094*//*14097*//*14097*//*14097*/cons/*<14097*/(/*14097*//*14098*//*14098*//*14099*/all/*<14099*/(/*14098*//*14100*//*14101*/type$eq/*<14101*/(/*14100*//*14102*//*14102*//*14103*/tvar/*<14103*/(/*14102*//*14104*/v/*<14104*/)/*<14102*/(/*14102*//*14115*/-1/*<14115*/)/*<14102*/)/*<14100*/)/*<14098*/(/*14098*//*14116*/ts/*<14116*/)/*<14098*/)/*<14097*/(/*14097*//*14097*//*14097*//*14097*/cons/*<14097*/(/*14097*//*14117*//*14117*//*14118*/any/*<14118*/(/*14117*//*14123*/function name_14123(x) { return /*14119*//*14119*//*14119*//*14120*/contains/*<14120*/(/*14119*//*14121*/numClasses/*<14121*/)/*<14119*/(/*14119*//*14127*/x/*<14127*/)/*<14119*/(/*14119*//*14128*/$eq/*<14128*/)/*<14119*/ }/*<14123*/)/*<14117*/(/*14117*//*14122*/is/*<14122*/)/*<14117*/)/*<14097*/(/*14097*//*14097*//*14097*//*14097*/cons/*<14097*/(/*14097*//*14129*//*14129*//*14131*/all/*<14131*/(/*14129*//*14132*/function name_14132(x) { return /*14136*//*14136*//*14136*//*14137*/contains/*<14137*/(/*14136*//*14138*/stdClasses/*<14138*/)/*<14136*/(/*14136*//*14139*/x/*<14139*/)/*<14136*/(/*14136*//*14140*/$eq/*<14140*/)/*<14136*/ }/*<14132*/)/*<14129*/(/*14129*//*14146*/is/*<14146*/)/*<14129*/)/*<14097*/(/*14097*//*14097*/nil/*<14097*/)/*<14097*/)/*<14097*/)/*<14097*/)/*<14094*/(/*14094*//*14114*/function name_14114(x) { return /*15958*/x/*<15958*/ }/*<14114*/)/*<14094*/)/*<14087*/)/*<14085*/
};
throw new Error('let pattern not matched 14067. ' + valueToString($target));})(/*!*/)/*<14050*/
};
throw new Error('let pattern not matched 14055. ' + valueToString($target));})(/*!*/)/*<14050*/
}
};
throw new Error('let pattern not matched 14177. ' + valueToString($target));})(/*!*/)/*<14050*/
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 14040');})(/*!*//*-1*/$fn_arg/*<-1*/)/*<14040*/ }/*<14040*/ }/*<14040*/;

const ambiguities = /*14265*/function name_14265(ce) { return /*14265*/function name_14265(vs) { return /*14265*/function name_14265(ps) { return /*14273*//*14273*//*14274*/map/*<14274*/(/*14273*//*14275*/function name_14275(v) { return /*14287*//*14287*//*14288*/$co/*<14288*/(/*14287*//*14289*/v/*<14289*/)/*<14287*/(/*14287*//*14290*//*14290*//*14291*/filter/*<14291*/(/*14290*//*14296*/function name_14296(pred) { return /*14292*//*14292*//*14292*//*14293*/contains/*<14293*/(/*14292*//*14304*//*14305*/set$slto_list/*<14305*/(/*14304*//*14300*//*14301*/pred$sltv/*<14301*/(/*14300*//*14302*/pred/*<14302*/)/*<14300*/)/*<14304*/)/*<14292*/(/*14292*//*14294*/v/*<14294*/)/*<14292*/(/*14292*//*14303*/tyvar$eq/*<14303*/)/*<14292*/ }/*<14296*/)/*<14290*/(/*14290*//*14295*/ps/*<14295*/)/*<14290*/)/*<14287*/ }/*<14275*/)/*<14273*/(/*14273*//*14278*//*14278*//*14278*//*14279*/without/*<14279*/(/*14278*//*14355*//*14356*/set$slto_list/*<14356*/(/*14355*//*14282*//*14280*/preds$sltv/*<14280*/(/*14282*//*14283*/ps/*<14283*/)/*<14282*/)/*<14355*/)/*<14278*/(/*14278*//*14281*/vs/*<14281*/)/*<14278*/(/*14278*//*14332*/tyvar$eq/*<14332*/)/*<14278*/)/*<14273*/ }/*<14265*/ }/*<14265*/ }/*<14265*/;

const toScheme = /*15037*/function name_15037(t) { return /*15043*//*15043*//*15044*/forall/*<15044*/(/*15043*//*15045*/nil/*<15045*/)/*<15043*/(/*15043*//*15046*//*15046*//*15047*/$eq$gt/*<15047*/(/*15046*//*15048*/nil/*<15048*/)/*<15046*/(/*15046*//*15049*/t/*<15049*/)/*<15046*/)/*<15043*/ }/*<15037*/;

const tenv$slnil = /*15905*//*15905*//*15906*/type_env/*<15906*/(/*15905*//*15907*/map$slnil/*<15907*/)/*<15905*/(/*15905*//*15908*/map$slnil/*<15908*/)/*<15905*/;

const class_env$slnil = /*15913*//*15913*//*15914*/class_env/*<15914*/(/*15913*//*15915*/map$slnil/*<15915*/)/*<15913*/(/*15913*//*15916*/nil/*<15916*/)/*<15913*/;

const class_env$slstd = /*15949*/class_env/*<15949*/;

const pred_$gts = /*16056*/function name_16056($fn_arg) { return /*16056*/(function match_16056($target) {
if ($target.type === "isin") {
{
let name = $target[0];
{
let type = $target[1];
return /*16065*/`class ${/*16067*/name/*<16067*/} <- ${/*16069*//*16071*/type_$gts/*<16071*/(/*16069*//*16072*/type/*<16072*/)/*<16069*/}`/*<16065*/
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 16056');})(/*!*//*-1*/$fn_arg/*<-1*/)/*<16056*/ }/*<16056*/;

/*16188*//*16190*/type_$gts/*<16190*/(/*16188*//*16191*/tstring/*<16191*/)/*<16188*/
/*16410*//*16412*/type_$gts/*<16412*/(/*16410*//*16413*//*16413*//*16414*/mkpair/*<16414*/(/*16413*//*16415*/tint/*<16415*/)/*<16413*/(/*16413*//*16416*/tbool/*<16416*/)/*<16413*/)/*<16410*/
/*16465*//*16467*/type_$gts/*<16467*/(/*16465*//*16468*//*16468*//*16469*/tfn/*<16469*/(/*16468*//*16471*/tint/*<16471*/)/*<16468*/(/*16468*//*16472*//*16472*//*16473*/tfn/*<16473*/(/*16472*//*16474*/tfloat/*<16474*/)/*<16472*/(/*16472*//*16475*/tbool/*<16475*/)/*<16472*/)/*<16468*/)/*<16465*/
const subst_$gts = /*16493*/function name_16493(subst) { return /*16499*//*16499*//*16500*/join/*<16500*/(/*16499*//*16501*/"\n"/*<16501*/)/*<16499*/(/*16499*//*16506*//*16506*//*16507*/map/*<16507*/(/*16506*//*16510*/function name_16510($fn_arg) { return /*16510*/(function match_16510($target) {
if ($target.type === ",") {
{
let tyvar = $target[0];
{
let type = $target[1];
return /*16518*/`${/*16526*//*16528*/tyvar_$gts/*<16528*/(/*16526*//*16529*/tyvar/*<16529*/)/*<16526*/} = ${/*16530*//*16532*/type_$gts/*<16532*/(/*16530*//*16533*/type/*<16533*/)/*<16530*/}`/*<16518*/
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 16510');})(/*!*//*-1*/$fn_arg/*<-1*/)/*<16510*/ }/*<16510*/)/*<16506*/(/*16506*//*16519*//*16508*/map$slto_list/*<16508*/(/*16519*//*16520*/subst/*<16520*/)/*<16519*/)/*<16506*/)/*<16499*/ }/*<16493*/;

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
const sdef = (v0) => (v1) => (v2) => (v3) => ({type: "sdef", 0: v0, 1: v1, 2: v2, 3: v3});
const sexpr = (v0) => (v1) => ({type: "sexpr", 0: v0, 1: v1});

/* type alias bindgroup */

/* type alias expl */

/* type alias impl */

/* type alias alt */
const to_hnfs = /*8247*/function name_8247(ce) { return /*8247*/function name_8247(ps) { return /*8289*/(function match_8289($target) {
if ($target.type === "err") {
{
let e = $target[0];
return /*8430*//*8431*/err/*<8431*/(/*8430*//*8432*/e/*<8432*/)/*<8430*/
}
}
if ($target.type === "ok") {
{
let v = $target[0];
return /*8439*//*8440*/ok/*<8440*/(/*8439*//*8436*//*8437*/concat/*<8437*/(/*8436*//*8438*/v/*<8438*/)/*<8436*/)/*<8439*/
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 8289');})(/*!*//*8295*//*8295*//*8296*/map$slok/*<8296*/(/*8295*//*8297*//*8298*/to_hnf/*<8298*/(/*8297*//*8299*/ce/*<8299*/)/*<8297*/)/*<8295*/(/*8295*//*8300*/ps/*<8300*/)/*<8295*/)/*<8289*/ }/*<8247*/ }/*<8247*/;


const to_hnf = /*8254*/function name_8254(ce) { return /*8254*/function name_8254(p) { return /*8261*/(function match_8261($target) {
if ($target === true) {
return /*8268*//*8269*/ok/*<8269*/(/*8268*//*8266*//*8266*//*8266*/cons/*<8266*/(/*8266*//*8267*/p/*<8267*/)/*<8266*/(/*8266*//*8266*/nil/*<8266*/)/*<8266*/)/*<8268*/
}
return /*8270*/(function match_8270($target) {
if ($target.type === "none") {
return /*8278*//*8279*/err/*<8279*/(/*8278*//*8280*/"context reduction"/*<8280*/)/*<8278*/
}
if ($target.type === "some") {
{
let ps = $target[0];
return /*8285*//*8285*//*8286*/to_hnfs/*<8286*/(/*8285*//*8287*/ce/*<8287*/)/*<8285*/(/*8285*//*8288*/ps/*<8288*/)/*<8285*/
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 8270');})(/*!*//*8272*//*8272*//*8273*/by_inst/*<8273*/(/*8272*//*8274*/ce/*<8274*/)/*<8272*/(/*8272*//*8275*/p/*<8275*/)/*<8272*/)/*<8270*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 8261');})(/*!*//*8263*//*8264*/in_hnf/*<8264*/(/*8263*//*8265*/p/*<8265*/)/*<8263*/)/*<8261*/ }/*<8254*/ }/*<8254*/;

const mgu = /*808*/function name_808(t1) { return /*808*/function name_808(t2) { return /*815*/(function match_815($target) {
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
return /*7654*//*7655*/err/*<7655*/(/*7654*//*9110*/e/*<9110*/)/*<7654*/
}
}
if ($target.type === "ok") {
{
let s1 = $target[0];
return /*7659*/(function match_7659($target) {
if ($target.type === "err") {
{
let e = $target[0];
return /*7673*//*7674*/err/*<7674*/(/*7673*//*9112*/e/*<9112*/)/*<7673*/
}
}
if ($target.type === "ok") {
{
let s2 = $target[0];
return /*7678*//*7680*/ok/*<7680*/(/*7678*//*7681*//*7681*//*7682*/compose_subst/*<7682*/(/*7681*//*7683*/s2/*<7683*/)/*<7681*/(/*7681*//*7685*/s1/*<7685*/)/*<7681*/)/*<7678*/
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 7659');})(/*!*//*7661*//*7661*//*7662*/mgu/*<7662*/(/*7661*//*7663*//*7663*//*7664*/type$slapply/*<7664*/(/*7663*//*7665*/s1/*<7665*/)/*<7663*/(/*7663*//*7666*/r/*<7666*/)/*<7663*/)/*<7661*/(/*7661*//*7667*//*7667*//*7668*/type$slapply/*<7668*/(/*7667*//*7669*/s1/*<7669*/)/*<7667*/(/*7667*//*7670*/r$qu/*<7670*/)/*<7667*/)/*<7661*/)/*<7659*/
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 7643');})(/*!*//*7648*//*7648*//*7649*/mgu/*<7649*/(/*7648*//*7650*/l/*<7650*/)/*<7648*/(/*7648*//*7651*/l$qu/*<7651*/)/*<7648*/)/*<7643*/
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
return /*7636*//*7637*/ok/*<7637*/(/*7636*//*865*//*865*//*866*/varBind/*<866*/(/*865*//*867*/u/*<867*/)/*<865*/(/*865*//*868*/t/*<868*/)/*<865*/)/*<7636*/
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
return /*7638*//*7639*/ok/*<7639*/(/*7638*//*877*//*877*//*878*/varBind/*<878*/(/*877*//*879*/u/*<879*/)/*<877*/(/*877*//*880*/t/*<880*/)/*<877*/)/*<7638*/
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
return /*7634*//*898*/ok/*<898*/(/*7634*//*7635*/map$slnil/*<7635*/)/*<7634*/
}
return /*9114*//*899*/err/*<899*/(/*9114*//*9115*/`Incompatible types ${/*9117*//*9119*/tycon_$gts/*<9119*/(/*9117*//*9120*/tc1/*<9120*/)/*<9117*/} vs ${/*9121*//*9123*/tycon_$gts/*<9123*/(/*9121*//*9124*/tc2/*<9124*/)/*<9121*/}`/*<9115*/)/*<9114*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 892');})(/*!*//*894*//*894*//*895*/tycon$eq/*<895*/(/*894*//*896*/tc1/*<896*/)/*<894*/(/*894*//*897*/tc2/*<897*/)/*<894*/)/*<892*/
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
return /*16003*//*16004*/err/*<16004*/(/*16003*//*16005*/`Cant unify ${/*16007*//*16009*/jsonify/*<16009*/(/*16007*//*16012*/a/*<16012*/)/*<16007*/} and ${/*16013*//*16015*/type_$gts/*<16015*/(/*16013*//*16016*/b/*<16016*/)/*<16013*/}`/*<16005*/)/*<16003*/
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 815');})(/*!*//*817*//*817*//*818*/$co/*<818*/(/*817*//*819*/t1/*<819*/)/*<817*/(/*817*//*820*/t2/*<820*/)/*<817*/)/*<815*/ }/*<808*/ }/*<808*/;

const qual$eq = /*6380*/function name_6380($fn_arg) { return /*6380*/(function match_6380($target) {
if ($target.type === "=>") {
{
let preds = $target[0];
{
let t = $target[1];
return /*6380*/function name_6380($fn_arg) { return /*6380*/(function match_6380($target) {
if ($target.type === "=>") {
{
let preds$qu = $target[0];
{
let t$qu = $target[1];
return /*6380*/function name_6380(t$eq) { return /*6443*/(function match_6443($target) {
if ($target === true) {
return /*6450*//*6450*//*6452*/t$eq/*<6452*/(/*6450*//*6453*/t/*<6453*/)/*<6450*/(/*6450*//*6454*/t$qu/*<6454*/)/*<6450*/
}
return /*6455*/false/*<6455*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 6443');})(/*!*//*6445*//*6445*//*6445*//*6446*/array$eq/*<6446*/(/*6445*//*6447*/preds/*<6447*/)/*<6445*/(/*6445*//*6448*/preds$qu/*<6448*/)/*<6445*/(/*6445*//*6449*/pred$eq/*<6449*/)/*<6445*/)/*<6443*/ }/*<6380*/
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 6380');})(/*!*//*-1*/$fn_arg/*<-1*/)/*<6380*/ }/*<6380*/
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 6380');})(/*!*//*-1*/$fn_arg/*<-1*/)/*<6380*/ }/*<6380*/;

const mguPred = /*6802*//*6803*/lift/*<6803*/(/*6802*//*6804*/mgu/*<6804*/)/*<6802*/;

const add_prelude_classes = /*7215*//*7215*//*7438*/compose_transformers/*<7438*/(/*7215*//*7439*/core_classes/*<7439*/)/*<7215*/(/*7215*//*7440*/num_classes/*<7440*/)/*<7215*/;

/*7441*//*7444*/add_prelude_classes/*<7444*/(/*7441*//*7445*/initial_env/*<7445*/)/*<7441*/
const overlap = /*7615*/function name_7615(p) { return /*7615*/function name_7615(q) { return /*7622*/(function match_7622($target) {
if ($target.type === "ok") {
return /*7631*/true/*<7631*/
}
return /*7633*/false/*<7633*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 7622');})(/*!*//*7624*//*7624*//*7625*/mguPred/*<7625*/(/*7624*//*7626*/p/*<7626*/)/*<7624*/(/*7624*//*7627*/q/*<7627*/)/*<7624*/)/*<7622*/ }/*<7615*/ }/*<7615*/;

const reduce = /*8502*/function name_8502(ce) { return /*8502*/function name_8502(ps) { return /*8509*/(function match_8509($target) {
if ($target.type === "ok") {
{
let qs = $target[0];
return /*8518*//*8519*/ok/*<8519*/(/*8518*//*8520*//*8520*//*8521*/simplify/*<8521*/(/*8520*//*8522*/ce/*<8522*/)/*<8520*/(/*8520*//*8523*/qs/*<8523*/)/*<8520*/)/*<8518*/
}
}
if ($target.type === "err") {
{
let e = $target[0];
return /*8527*//*8528*/err/*<8528*/(/*8527*//*8529*/e/*<8529*/)/*<8527*/
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 8509');})(/*!*//*8511*//*8511*//*8512*/to_hnfs/*<8512*/(/*8511*//*8513*/ce/*<8513*/)/*<8511*/(/*8511*//*8514*/ps/*<8514*/)/*<8511*/)/*<8509*/ }/*<8502*/ }/*<8502*/;

const scheme$eq = /*8564*/function name_8564($fn_arg) { return /*8564*/(function match_8564($target) {
if ($target.type === "forall") {
{
let kinds = $target[0];
{
let qual = $target[1];
return /*8564*/function name_8564($fn_arg) { return /*8564*/(function match_8564($target) {
if ($target.type === "forall") {
{
let kinds$qu = $target[0];
{
let qual$qu = $target[1];
return /*8579*/(function match_8579($target) {
if ($target === true) {
return /*8586*//*8586*//*8586*//*8587*/qual$eq/*<8587*/(/*8586*//*8588*/qual/*<8588*/)/*<8586*/(/*8586*//*8590*/qual$qu/*<8590*/)/*<8586*/(/*8586*//*8592*/type$eq/*<8592*/)/*<8586*/
}
return /*8591*/false/*<8591*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 8579');})(/*!*//*8581*//*8581*//*8581*//*8582*/array$eq/*<8582*/(/*8581*//*8583*/kinds/*<8583*/)/*<8581*/(/*8581*//*8584*/kinds$qu/*<8584*/)/*<8581*/(/*8581*//*8585*/kind$eq/*<8585*/)/*<8581*/)/*<8579*/
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 8564');})(/*!*//*-1*/$fn_arg/*<-1*/)/*<8564*/ }/*<8564*/
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 8564');})(/*!*//*-1*/$fn_arg/*<-1*/)/*<8564*/ }/*<8564*/;

const TI = (v0) => ({type: "TI", 0: v0});
const get_subst = /*9145*//*9146*/TI/*<9146*/(/*9145*//*9147*/function name_9147(subst) { return /*9147*/function name_9147(tenv) { return /*9147*/function name_9147(n) { return /*9157*//*9158*/ok/*<9158*/(/*9157*//*9152*//*9152*//*9152*//*9152*//*9153*/$co$co$co/*<9153*/(/*9152*//*9154*/subst/*<9154*/)/*<9152*/(/*9152*//*9906*/tenv/*<9906*/)/*<9152*/(/*9152*//*9155*/n/*<9155*/)/*<9152*/(/*9152*//*9156*/subst/*<9156*/)/*<9152*/)/*<9157*/ }/*<9147*/ }/*<9147*/ }/*<9147*/)/*<9145*/;

const ext_subst = /*9159*/function name_9159(s$qu) { return /*9166*//*9167*/TI/*<9167*/(/*9166*//*9168*/function name_9168(subst) { return /*9168*/function name_9168(tenv) { return /*9168*/function name_9168(n) { return /*9173*//*9174*/ok/*<9174*/(/*9173*//*9175*//*9175*//*9175*//*9175*//*9176*/$co$co$co/*<9176*/(/*9175*//*9177*//*9177*//*9178*/compose_subst/*<9178*/(/*9177*//*9179*/s$qu/*<9179*/)/*<9177*/(/*9177*//*9180*/subst/*<9180*/)/*<9177*/)/*<9175*/(/*9175*//*9908*/tenv/*<9908*/)/*<9175*/(/*9175*//*9181*/n/*<9181*/)/*<9175*/(/*9175*//*9182*/0/*<9182*/)/*<9175*/)/*<9173*/ }/*<9168*/ }/*<9168*/ }/*<9168*/)/*<9166*/ }/*<9159*/;

const ti_run = /*9278*/function name_9278($fn_arg) { return /*9278*/(function match_9278($target) {
if ($target.type === "TI") {
{
let f = $target[0];
return /*9278*/function name_9278(subst) { return /*9278*/function name_9278(tenv) { return /*9278*/function name_9278(nidx) { return /*9288*//*9288*//*9288*//*9289*/f/*<9289*/(/*9288*//*9290*/subst/*<9290*/)/*<9288*/(/*9288*//*9919*/tenv/*<9919*/)/*<9288*/(/*9288*//*9291*/nidx/*<9291*/)/*<9288*/ }/*<9278*/ }/*<9278*/ }/*<9278*/
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 9278');})(/*!*//*-1*/$fn_arg/*<-1*/)/*<9278*/ }/*<9278*/;

const ti_return = /*9355*/function name_9355(x) { return /*9363*//*9364*/TI/*<9364*/(/*9363*//*9365*/function name_9365(subst) { return /*9365*/function name_9365(tenv) { return /*9365*/function name_9365(nidx) { return /*9370*//*9371*/ok/*<9371*/(/*9370*//*9372*//*9372*//*9372*//*9372*//*9373*/$co$co$co/*<9373*/(/*9372*//*9374*/subst/*<9374*/)/*<9372*/(/*9372*//*9910*/tenv/*<9910*/)/*<9372*/(/*9372*//*9375*/nidx/*<9375*/)/*<9372*/(/*9372*//*9376*/x/*<9376*/)/*<9372*/)/*<9370*/ }/*<9365*/ }/*<9365*/ }/*<9365*/)/*<9363*/ }/*<9355*/;

const inst$slqual = /*9478*/function name_9478(types) { return /*9478*/function name_9478(inst$slt) { return /*9478*/function name_9478($fn_arg) { return /*9478*/(function match_9478($target) {
if ($target.type === "=>") {
{
let ps = $target[0];
{
let t = $target[1];
return /*9493*//*9493*//*9494*/$eq$gt/*<9494*/(/*9493*//*9495*//*9495*//*9496*/inst$slpreds/*<9496*/(/*9495*//*9497*/types/*<9497*/)/*<9495*/(/*9495*//*9498*/ps/*<9498*/)/*<9495*/)/*<9493*/(/*9493*//*9499*//*9499*//*9500*/inst$slt/*<9500*/(/*9499*//*9502*/types/*<9502*/)/*<9499*/(/*9499*//*9503*/t/*<9503*/)/*<9499*/)/*<9493*/
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 9478');})(/*!*//*-1*/$fn_arg/*<-1*/)/*<9478*/ }/*<9478*/ }/*<9478*/ }/*<9478*/;

const ti_then = /*9622*/function name_9622(ti) { return /*9622*/function name_9622(next) { return /*9629*//*9630*/TI/*<9630*/(/*9629*//*9631*/function name_9631(subst) { return /*9631*/function name_9631(tenv) { return /*9631*/function name_9631(nidx) { return /*9636*/(function match_9636($target) {
if ($target.type === "err") {
{
let e = $target[0];
return /*9646*//*9647*/err/*<9647*/(/*9646*//*9648*/e/*<9648*/)/*<9646*/
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
return /*9657*//*9657*//*9657*//*9657*//*9658*/ti_run/*<9658*/(/*9657*//*9659*//*9660*/next/*<9660*/(/*9659*//*9661*/value/*<9661*/)/*<9659*/)/*<9657*/(/*9657*//*9662*/subst/*<9662*/)/*<9657*/(/*9657*//*9924*/tenv/*<9924*/)/*<9657*/(/*9657*//*9663*/nidx/*<9663*/)/*<9657*/
}
}
}
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 9636');})(/*!*//*9638*//*9638*//*9638*//*9638*//*9639*/ti_run/*<9639*/(/*9638*//*9640*/ti/*<9640*/)/*<9638*/(/*9638*//*9641*/subst/*<9641*/)/*<9638*/(/*9638*//*9922*/tenv/*<9922*/)/*<9638*/(/*9638*//*9642*/nidx/*<9642*/)/*<9638*/)/*<9636*/ }/*<9631*/ }/*<9631*/ }/*<9631*/)/*<9629*/ }/*<9622*/ }/*<9622*/;

const ti_fail = /*10246*/function name_10246(e) { return /*10252*//*10253*/TI/*<10253*/(/*10252*//*10254*/function name_10254(a) { return /*10254*/function name_10254(b) { return /*10254*/function name_10254(c) { return /*10260*//*10261*/err/*<10261*/(/*10260*//*10262*/e/*<10262*/)/*<10260*/ }/*<10254*/ }/*<10254*/ }/*<10254*/)/*<10252*/ }/*<10246*/;

const mk_deftype = /*12423*/function name_12423(id) { return /*12423*/function name_12423(li) { return /*12423*/function name_12423(args) { return /*12423*/function name_12423(items) { return /*12423*/function name_12423(l) { return /*12432*//*12432*//*12432*//*12432*//*12432*//*12433*/sdeftype/*<12433*/(/*12432*//*12434*/id/*<12434*/)/*<12432*/(/*12432*//*12435*/li/*<12435*/)/*<12432*/(/*12432*//*12436*//*12436*//*12437*/map/*<12437*/(/*12436*//*12439*/function name_12439(arg) { return /*12443*/(function match_12443($target) {
if ($target.type === "cst/identifier") {
{
let name = $target[0];
{
let l = $target[1];
return /*12450*//*12450*//*12451*/$co/*<12451*/(/*12450*//*12452*/name/*<12452*/)/*<12450*/(/*12450*//*12453*/l/*<12453*/)/*<12450*/
}
}
}
return /*12455*//*12456*/fatal/*<12456*/(/*12455*//*12457*/"deftype type argument must be identifier"/*<12457*/)/*<12455*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 12443');})(/*!*//*12445*/arg/*<12445*/)/*<12443*/ }/*<12439*/)/*<12436*/(/*12436*//*12966*/args/*<12966*/)/*<12436*/)/*<12432*/(/*12432*//*12459*//*12459*//*12459*//*12460*/foldr/*<12460*/(/*12459*//*12461*/nil/*<12461*/)/*<12459*/(/*12459*//*12462*/items/*<12462*/)/*<12459*/(/*12459*//*12463*/function name_12463(res) { return /*12463*/function name_12463(constr) { return /*12468*/(function match_12468($target) {
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
return /*12481*//*12481*//*12481*/cons/*<12481*/(/*12481*//*12482*//*12482*//*12482*//*12482*//*12483*/$co$co$co/*<12483*/(/*12482*//*12484*/name/*<12484*/)/*<12482*/(/*12482*//*12485*/ni/*<12485*/)/*<12482*/(/*12482*//*12486*//*12486*//*12487*/map/*<12487*/(/*12486*//*12489*/parse_type/*<12489*/)/*<12486*/(/*12486*//*12967*/args/*<12967*/)/*<12486*/)/*<12482*/(/*12482*//*12490*/l/*<12490*/)/*<12482*/)/*<12481*/(/*12481*//*12492*/res/*<12492*/)/*<12481*/
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
return /*12499*//*12500*/fatal/*<12500*/(/*12499*//*12501*/"Invalid type constructor"/*<12501*/)/*<12499*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 12468');})(/*!*//*12470*/constr/*<12470*/)/*<12468*/ }/*<12463*/ }/*<12463*/)/*<12459*/)/*<12432*/(/*12432*//*12503*/l/*<12503*/)/*<12432*/ }/*<12423*/ }/*<12423*/ }/*<12423*/ }/*<12423*/ }/*<12423*/;

const ti_from_result = /*13810*/function name_13810(result) { return /*13816*/(function match_13816($target) {
if ($target.type === "ok") {
{
let v = $target[0];
return /*13822*//*13823*/ti_return/*<13823*/(/*13822*//*13824*/v/*<13824*/)/*<13822*/
}
}
if ($target.type === "err") {
{
let e = $target[0];
return /*13828*//*13832*/TI/*<13832*/(/*13828*//*13841*/function name_13841(_) { return /*13841*/function name_13841(_) { return /*13841*/function name_13841(_) { return /*13837*//*13838*/err/*<13838*/(/*13837*//*13839*/e/*<13839*/)/*<13837*/ }/*<13841*/ }/*<13841*/ }/*<13841*/)/*<13828*/
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 13816');})(/*!*//*13818*/result/*<13818*/)/*<13816*/ }/*<13810*/;

const withDefaults = /*14182*/function name_14182(f) { return /*14182*/function name_14182(ce) { return /*14182*/function name_14182(vs) { return /*14182*/function name_14182(ps) { return /*14192*/(function let_14192() {const $target = /*14207*//*14207*//*14207*//*14208*/ambiguities/*<14208*/(/*14207*//*14209*/ce/*<14209*/)/*<14207*/(/*14207*//*14210*/vs/*<14210*/)/*<14207*/(/*14207*//*14211*/ps/*<14211*/)/*<14207*/;
{
let vps = $target;
return /*14192*/(function let_14192() {const $target = /*14200*//*14200*//*14201*/map/*<14201*/(/*14200*//*14202*//*14203*/candidates/*<14203*/(/*14202*//*14204*/ce/*<14204*/)/*<14202*/)/*<14200*/(/*14200*//*14205*/vps/*<14205*/)/*<14200*/;
{
let tss = $target;
return /*14212*/(function match_14212($target) {
if ($target === true) {
return /*14218*//*14219*/err/*<14219*/(/*14218*//*14220*/"Cannot resolve ambiguity"/*<14220*/)/*<14218*/
}
return /*14233*//*14234*/ok/*<14234*/(/*14233*//*14235*//*14235*//*14236*/f/*<14236*/(/*14235*//*14237*/vps/*<14237*/)/*<14235*/(/*14235*//*14238*//*14238*//*14239*/map/*<14239*/(/*14238*//*14240*/head/*<14240*/)/*<14238*/(/*14238*//*14241*/tss/*<14241*/)/*<14238*/)/*<14235*/)/*<14233*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 14212');})(/*!*//*14214*//*14214*//*14215*/any/*<14215*/(/*14214*//*14216*/function name_14216(x) { return /*14225*/(function match_14225($target) {
if ($target.type === "nil") {
return /*14229*/true/*<14229*/
}
return /*14231*/false/*<14231*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 14225');})(/*!*//*14227*/x/*<14227*/)/*<14225*/ }/*<14216*/)/*<14214*/(/*14214*//*14217*/tss/*<14217*/)/*<14214*/)/*<14212*/
};
throw new Error('let pattern not matched 14199. ' + valueToString($target));})(/*!*/)/*<14192*/
};
throw new Error('let pattern not matched 14206. ' + valueToString($target));})(/*!*/)/*<14192*/ }/*<14182*/ }/*<14182*/ }/*<14182*/ }/*<14182*/;

const defaultedPreds = /*14360*//*14361*/withDefaults/*<14361*/(/*14360*//*14362*/function name_14362(vps) { return /*14362*/function name_14362(ts) { return /*14367*//*14368*/concat/*<14368*/(/*14367*//*14369*//*14369*//*14370*/map/*<14370*/(/*14369*//*14371*/snd/*<14371*/)/*<14369*/(/*14369*//*14372*/vps/*<14372*/)/*<14369*/)/*<14367*/ }/*<14362*/ }/*<14362*/)/*<14360*/;

const defaultSubst = /*14377*//*14378*/withDefaults/*<14378*/(/*14377*//*14379*/function name_14379(vps) { return /*14379*/function name_14379(ts) { return /*15878*//*15879*/map$slfrom_list/*<15879*/(/*15878*//*14384*//*14384*//*14385*/zip/*<14385*/(/*14384*//*14386*//*14386*//*14388*/map/*<14388*/(/*14386*//*14389*/fst/*<14389*/)/*<14386*/(/*14386*//*14390*/vps/*<14390*/)/*<14386*/)/*<14384*/(/*14384*//*14391*/ts/*<14391*/)/*<14384*/)/*<15878*/ }/*<14379*/ }/*<14379*/)/*<14377*/;

const ti_err = /*14590*/function name_14590(v) { return /*14596*//*14597*/TI/*<14597*/(/*14596*//*14598*/function name_14598(_) { return /*14598*/function name_14598(_) { return /*14598*/function name_14598(_) { return /*14604*//*14605*/err/*<14605*/(/*14604*//*14606*/v/*<14606*/)/*<14604*/ }/*<14598*/ }/*<14598*/ }/*<14598*/)/*<14596*/ }/*<14590*/;

const infer$slseq = /*14687*/function name_14687(ti) { return /*14687*/function name_14687(ce) { return /*14687*/function name_14687(as) { return /*14687*/function name_14687(assumptions) { return /*14697*/(function match_14697($target) {
if ($target.type === "nil") {
return /*14701*//*14702*/ti_return/*<14702*/(/*14701*//*14703*//*14703*//*14704*/$co/*<14704*/(/*14703*//*14705*/nil/*<14705*/)/*<14703*/(/*14703*//*14706*/nil/*<14706*/)/*<14703*/)/*<14701*/
}
if ($target.type === "cons") {
{
let bs = $target[0];
{
let bss = $target[1];
return /*14713*//*14752*//*14753*/ti_then/*<14753*/(/*14752*//*14720*//*14720*//*14720*//*14721*/ti/*<14721*/(/*14720*//*14722*/ce/*<14722*/)/*<14720*/(/*14720*//*14723*/as/*<14723*/)/*<14720*/(/*14720*//*14724*/bs/*<14724*/)/*<14720*/)/*<14752*/(/*14713*//*14713*/function name_14713($let) { return /*14713*/(function match_14713($target) {
if ($target.type === ",") {
{
let ps = $target[0];
{
let as$qu = $target[1];
return /*14713*//*14750*//*14751*/ti_then/*<14751*/(/*14750*//*14729*//*14729*//*14729*//*14729*//*14730*/infer$slseq/*<14730*/(/*14729*//*14731*/ti/*<14731*/)/*<14729*/(/*14729*//*14732*/ce/*<14732*/)/*<14729*/(/*14729*//*14733*//*14733*//*14734*/$pl$pl$pl/*<14734*/(/*14733*//*14735*/as$qu/*<14735*/)/*<14733*/(/*14733*//*14736*/as/*<14736*/)/*<14733*/)/*<14729*/(/*14729*//*14737*/bss/*<14737*/)/*<14729*/)/*<14750*/(/*14713*//*14713*/function name_14713($let) { return /*14713*/(function match_14713($target) {
if ($target.type === ",") {
{
let qs = $target[0];
{
let as$qu$qu = $target[1];
return /*14738*//*14739*/ti_return/*<14739*/(/*14738*//*14740*//*14740*//*14741*/$co/*<14741*/(/*14740*//*14742*//*14742*//*14743*/$pl$pl$pl/*<14743*/(/*14742*//*14744*/ps/*<14744*/)/*<14742*/(/*14742*//*14745*/qs/*<14745*/)/*<14742*/)/*<14740*/(/*14740*//*14746*//*14746*//*14747*/$pl$pl$pl/*<14747*/(/*14746*//*14748*/as$qu$qu/*<14748*/)/*<14746*/(/*14746*//*14749*/as$qu/*<14749*/)/*<14746*/)/*<14740*/)/*<14738*/
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 14713');})(/*!*//*-1*/$let/*<-1*/)/*<14713*/ }/*<14713*/)/*<14713*/
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 14713');})(/*!*//*-1*/$let/*<-1*/)/*<14713*/ }/*<14713*/)/*<14713*/
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 14697');})(/*!*//*14699*/assumptions/*<14699*/)/*<14697*/ }/*<14687*/ }/*<14687*/ }/*<14687*/ }/*<14687*/;

const sequence = /*15098*/function name_15098(tis) { return /*15104*/(function match_15104($target) {
if ($target.type === "nil") {
return /*15108*//*15109*/ti_return/*<15109*/(/*15108*//*15110*/nil/*<15110*/)/*<15108*/
}
if ($target.type === "cons") {
{
let one = $target[0];
if ($target[1].type === "nil") {
return /*15113*//*15117*//*15118*/ti_then/*<15118*/(/*15117*//*15119*/one/*<15119*/)/*<15117*/(/*15113*//*15113*/function name_15113($let) { return /*15113*/(function match_15113($target) {
{
let res = $target;
return /*15120*//*15121*/ti_return/*<15121*/(/*15120*//*15122*//*15122*//*15122*/cons/*<15122*/(/*15122*//*15123*/res/*<15123*/)/*<15122*/(/*15122*//*15122*/nil/*<15122*/)/*<15122*/)/*<15120*/
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 15113');})(/*!*//*-1*/$let/*<-1*/)/*<15113*/ }/*<15113*/)/*<15113*/
}
}
}
if ($target.type === "cons") {
{
let one = $target[0];
{
let rest = $target[1];
return /*15131*//*15136*//*15137*/ti_then/*<15137*/(/*15136*//*15138*/one/*<15138*/)/*<15136*/(/*15131*//*15131*/function name_15131($let) { return /*15131*/(function match_15131($target) {
{
let res = $target;
return /*15131*//*15140*//*15141*/ti_then/*<15141*/(/*15140*//*15142*//*15143*/sequence/*<15143*/(/*15142*//*15144*/rest/*<15144*/)/*<15142*/)/*<15140*/(/*15131*//*15131*/function name_15131($let) { return /*15131*/(function match_15131($target) {
{
let rest = $target;
return /*15145*//*15147*/ti_return/*<15147*/(/*15145*//*15148*//*15148*//*15148*/cons/*<15148*/(/*15148*//*15149*/res/*<15149*/)/*<15148*/(/*15148*//*15150*/rest/*<15150*/)/*<15148*/)/*<15145*/
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 15131');})(/*!*//*-1*/$let/*<-1*/)/*<15131*/ }/*<15131*/)/*<15131*/
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 15131');})(/*!*//*-1*/$let/*<-1*/)/*<15131*/ }/*<15131*/)/*<15131*/
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 15104');})(/*!*//*15106*/tis/*<15106*/)/*<15104*/ }/*<15098*/;

const assump_$gts = /*16024*/function name_16024($fn_arg) { return /*16024*/(function match_16024($target) {
if ($target.type === "!>!") {
{
let name = $target[0];
if ($target[1].type === "forall") {
{
let kinds = $target[1][0];
if ($target[1][1].type === "=>") {
{
let preds = $target[1][1][0];
{
let type = $target[1][1][1];
return /*16040*/`${/*16036*/name/*<16036*/}:${/*16085*/(function match_16085($target) {
if ($target.type === "nil") {
return /*16089*/""/*<16089*/
}
return /*16092*/` arg kinds: ${/*16043*//*16043*//*16045*/join/*<16045*/(/*16043*//*16046*/","/*<16046*/)/*<16043*/(/*16043*//*16048*//*16048*//*16049*/map/*<16049*/(/*16048*//*16051*/kind_$gts/*<16051*/)/*<16048*/(/*16048*//*16052*/kinds/*<16052*/)/*<16048*/)/*<16043*/}`/*<16092*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 16085');})(/*!*//*16087*/kinds/*<16087*/)/*<16085*/}${/*16095*/(function match_16095($target) {
if ($target.type === "nil") {
return /*16099*/""/*<16099*/
}
return /*16104*/` typeclasses: ${/*16077*//*16077*//*16078*/join/*<16078*/(/*16077*//*16079*/","/*<16079*/)/*<16077*/(/*16077*//*16053*//*16053*//*16074*/map/*<16074*/(/*16053*//*16075*/pred_$gts/*<16075*/)/*<16053*/(/*16053*//*16076*/preds/*<16076*/)/*<16053*/)/*<16077*/}`/*<16104*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 16095');})(/*!*//*16097*/preds/*<16097*/)/*<16095*/} ${/*16081*//*16083*/type_$gts/*<16083*/(/*16081*//*16084*/type/*<16084*/)/*<16081*/}`/*<16040*/
}
}
}
}
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 16024');})(/*!*//*-1*/$fn_arg/*<-1*/)/*<16024*/ }/*<16024*/;

const assumps_$gts = /*16165*//*16165*//*16166*/dot/*<16166*/(/*16165*//*16184*//*16185*/join/*<16185*/(/*16184*//*16186*/"\n"/*<16186*/)/*<16184*/)/*<16165*/(/*16165*//*16162*//*16163*/map/*<16163*/(/*16162*//*16164*/assump_$gts/*<16164*/)/*<16162*/)/*<16165*/;

const parse_expr = /*11178*/function name_11178(cst) { return /*11183*/(function match_11183($target) {
if ($target.type === "cst/identifier") {
if ($target[0] === "true"){
{
let l = $target[1];
return /*11191*//*11191*//*11192*/eprim/*<11192*/(/*11191*//*11193*//*11193*//*11194*/pbool/*<11194*/(/*11193*//*11195*/true/*<11195*/)/*<11193*/(/*11193*//*11196*/l/*<11196*/)/*<11193*/)/*<11191*/(/*11191*//*11197*/l/*<11197*/)/*<11191*/
}
}
}
if ($target.type === "cst/identifier") {
if ($target[0] === "false"){
{
let l = $target[1];
return /*11203*//*11203*//*11204*/eprim/*<11204*/(/*11203*//*11205*//*11205*//*11206*/pbool/*<11206*/(/*11205*//*11207*/false/*<11207*/)/*<11205*/(/*11205*//*11208*/l/*<11208*/)/*<11205*/)/*<11203*/(/*11203*//*11209*/l/*<11209*/)/*<11203*/
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
return /*11215*//*11215*//*11215*//*11216*/estr/*<11216*/(/*11215*//*11217*/first/*<11217*/)/*<11215*/(/*11215*//*11218*//*11218*//*11219*/map/*<11219*/(/*11218*//*11221*/function name_11221(tpl) { return /*11225*/(function let_11225() {const $target = /*11233*/tpl/*<11233*/;
if ($target.type === ",,") {
{
let expr = $target[0];
{
let string = $target[1];
{
let l = $target[2];
return /*11234*//*11234*//*11234*//*11235*/$co$co/*<11235*/(/*11234*//*11236*//*11237*/parse_expr/*<11237*/(/*11236*//*11238*/expr/*<11238*/)/*<11236*/)/*<11234*/(/*11234*//*11239*/string/*<11239*/)/*<11234*/(/*11234*//*11240*/l/*<11240*/)/*<11234*/
}
}
}
};
throw new Error('let pattern not matched 11228. ' + valueToString($target));})(/*!*/)/*<11225*/ }/*<11221*/)/*<11218*/(/*11218*//*12972*/templates/*<12972*/)/*<11218*/)/*<11215*/(/*11215*//*11241*/l/*<11241*/)/*<11215*/
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
return /*11254*//*11254*//*11255*/eprim/*<11255*/(/*11254*//*11256*//*11256*//*11257*/pint/*<11257*/(/*11256*//*11258*/int/*<11258*/)/*<11256*/(/*11256*//*11259*/l/*<11259*/)/*<11256*/)/*<11254*/(/*11254*//*11260*/l/*<11260*/)/*<11254*/
}
}
if ($target.type === "none") {
return /*11263*//*11263*//*11264*/evar/*<11264*/(/*11263*//*11265*/id/*<11265*/)/*<11263*/(/*11263*//*11266*/l/*<11266*/)/*<11263*/
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 11246');})(/*!*//*11248*//*11249*/string_to_int/*<11249*/(/*11248*//*11250*/id/*<11250*/)/*<11248*/)/*<11246*/
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
return /*11277*//*11277*//*11278*/equot/*<11278*/(/*11277*//*11279*//*11280*/parse_expr/*<11280*/(/*11279*//*11281*/body/*<11281*/)/*<11279*/)/*<11277*/(/*11277*//*11282*/l/*<11282*/)/*<11277*/
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
return /*11293*//*11293*//*11294*/equotquot/*<11294*/(/*11293*//*11295*/body/*<11295*/)/*<11293*/(/*11293*//*11296*/l/*<11296*/)/*<11293*/
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
return /*11307*//*11307*//*11308*/equot$slstmt/*<11308*/(/*11307*//*11309*//*11310*/parse_stmt/*<11310*/(/*11309*//*11311*/body/*<11311*/)/*<11309*/)/*<11307*/(/*11307*//*11312*/l/*<11312*/)/*<11307*/
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
return /*11323*//*11323*//*11324*/equot$sltype/*<11324*/(/*11323*//*11325*//*11326*/parse_type/*<11326*/(/*11325*//*11327*/body/*<11327*/)/*<11325*/)/*<11323*/(/*11323*//*11328*/l/*<11328*/)/*<11323*/
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
return /*11339*//*11339*//*11340*/equot$slpat/*<11340*/(/*11339*//*11341*//*11342*/parse_pat/*<11342*/(/*11341*//*11343*/body/*<11343*/)/*<11341*/)/*<11339*/(/*11339*//*11344*/l/*<11344*/)/*<11339*/
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
return /*11357*//*11357*//*11357*//*11358*/ematch/*<11358*/(/*11357*//*11359*//*11360*/parse_expr/*<11360*/(/*11359*//*11361*/cond/*<11361*/)/*<11359*/)/*<11357*/(/*11357*//*11362*//*11362*//*11362*/cons/*<11362*/(/*11362*//*11363*//*11363*//*11364*/$co/*<11364*/(/*11363*//*11365*//*11365*//*11366*/pprim/*<11366*/(/*11365*//*11367*//*11367*//*11368*/pbool/*<11368*/(/*11367*//*11369*/true/*<11369*/)/*<11367*/(/*11367*//*11370*/l/*<11370*/)/*<11367*/)/*<11365*/(/*11365*//*11371*/l/*<11371*/)/*<11365*/)/*<11363*/(/*11363*//*11372*//*11373*/parse_expr/*<11373*/(/*11372*//*11374*/yes/*<11374*/)/*<11372*/)/*<11363*/)/*<11362*/(/*11362*//*11362*//*11362*//*11362*/cons/*<11362*/(/*11362*//*11375*//*11375*//*11376*/$co/*<11376*/(/*11375*//*11377*//*11378*/pany/*<11378*/(/*11377*//*11379*/l/*<11379*/)/*<11377*/)/*<11375*/(/*11375*//*11380*//*11381*/parse_expr/*<11381*/(/*11380*//*11382*/no/*<11382*/)/*<11380*/)/*<11375*/)/*<11362*/(/*11362*//*11362*/nil/*<11362*/)/*<11362*/)/*<11362*/)/*<11357*/(/*11357*//*11383*/l/*<11383*/)/*<11357*/
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
return /*11399*//*11399*//*11399*//*11400*/foldr/*<11400*/(/*11399*//*11401*//*11402*/parse_expr/*<11402*/(/*11401*//*11403*/body/*<11403*/)/*<11401*/)/*<11399*/(/*11399*//*11404*/args/*<11404*/)/*<11399*/(/*11399*//*11405*/function name_11405(body) { return /*11405*/function name_11405(arg) { return /*11417*//*11417*//*11417*//*11418*/elambda/*<11418*/(/*11417*//*11419*//*13391*/parse_pat/*<13391*/(/*11419*//*13392*/arg/*<13392*/)/*<11419*/)/*<11417*/(/*11417*//*11421*/body/*<11421*/)/*<11417*/(/*11417*//*11422*/b/*<11422*/)/*<11417*/ }/*<11405*/ }/*<11405*/)/*<11399*/
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
return /*11456*//*11457*/fatal/*<11457*/(/*11456*//*11458*/`Invalid 'fn' ${/*11460*//*11461*/int_to_string/*<11461*/(/*11460*//*11462*/l/*<11462*/)/*<11460*/}`/*<11458*/)/*<11456*/
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
return /*11476*//*11476*//*11476*//*11477*/ematch/*<11477*/(/*11476*//*11478*//*11479*/parse_expr/*<11479*/(/*11478*//*11480*/target/*<11480*/)/*<11478*/)/*<11476*/(/*11476*//*11481*//*11481*//*11482*/map/*<11482*/(/*11481*//*11486*/function name_11486($case) { return /*11490*/(function let_11490() {const $target = /*11497*/$case/*<11497*/;
if ($target.type === ",") {
{
let pat = $target[0];
{
let expr = $target[1];
return /*11498*//*11498*//*11499*/$co/*<11499*/(/*11498*//*11500*//*11501*/parse_pat/*<11501*/(/*11500*//*11502*/pat/*<11502*/)/*<11500*/)/*<11498*/(/*11498*//*11503*//*11504*/parse_expr/*<11504*/(/*11503*//*11505*/expr/*<11505*/)/*<11503*/)/*<11498*/
}
}
};
throw new Error('let pattern not matched 11493. ' + valueToString($target));})(/*!*/)/*<11490*/ }/*<11486*/)/*<11481*/(/*11481*//*12969*//*12970*/pairs/*<12970*/(/*12969*//*12971*/cases/*<12971*/)/*<12969*/)/*<11481*/)/*<11476*/(/*11476*//*11506*/l/*<11506*/)/*<11476*/
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
return /*11521*//*11521*//*11521*//*11522*/foldr/*<11522*/(/*11521*//*11523*//*11524*/parse_expr/*<11524*/(/*11523*//*11525*/body/*<11525*/)/*<11523*/)/*<11521*/(/*11521*//*11526*//*11527*/pairs/*<11527*/(/*11526*//*11528*/inits/*<11528*/)/*<11526*/)/*<11521*/(/*11521*//*11529*/function name_11529(body) { return /*11529*/function name_11529(init) { return /*11534*/(function let_11534() {const $target = /*11541*/init/*<11541*/;
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
return /*11542*//*11542*//*11542*//*11543*/elet/*<11543*/(/*11542*//*15656*//*15656*//*15657*/$co/*<15657*/(/*15656*//*15658*/nil/*<15658*/)/*<15656*/(/*15656*//*13348*//*13348*//*13348*/cons/*<13348*/(/*13348*//*15659*//*15659*//*15659*/cons/*<15659*/(/*15659*//*13347*//*13347*//*13349*/$co/*<13349*/(/*13347*//*11544*/name/*<11544*/)/*<13347*/(/*13347*//*15674*//*15674*//*15674*/cons/*<15674*/(/*15674*//*15675*//*15675*//*15676*/$co/*<15676*/(/*15675*//*15677*/nil/*<15677*/)/*<15675*/(/*15675*//*11547*//*11548*/parse_expr/*<11548*/(/*11547*//*11549*/value/*<11549*/)/*<11547*/)/*<15675*/)/*<15674*/(/*15674*//*15674*/nil/*<15674*/)/*<15674*/)/*<13347*/)/*<15659*/(/*15659*//*15659*/nil/*<15659*/)/*<15659*/)/*<13348*/(/*13348*//*13348*/nil/*<13348*/)/*<13348*/)/*<15656*/)/*<11542*/(/*11542*//*11550*/body/*<11550*/)/*<11542*/(/*11542*//*11551*/l/*<11551*/)/*<11542*/
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 15660');})(/*!*//*15669*/pat/*<15669*/)/*<15660*/
}
}
};
throw new Error('let pattern not matched 11537. ' + valueToString($target));})(/*!*/)/*<11534*/ }/*<11529*/ }/*<11529*/)/*<11521*/
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
return /*13352*//*13352*//*13352*//*13366*/elet/*<13366*/(/*13352*//*15641*//*15641*//*15642*/$co/*<15642*/(/*15641*//*15643*/nil/*<15643*/)/*<15641*/(/*15641*//*13367*//*13367*//*13368*/map/*<13368*/(/*13367*//*13369*/function name_13369($fn_arg) { return /*13369*/(function match_13369($target) {
if ($target.type === ",") {
{
let pat = $target[0];
{
let value = $target[1];
return /*15645*/(function match_15645($target) {
if ($target.type === "cst/identifier") {
{
let name = $target[0];
{
let l = $target[1];
return /*15644*//*15644*//*15644*/cons/*<15644*/(/*15644*//*13372*//*13372*//*13384*/$co/*<13384*/(/*13372*//*13385*/name/*<13385*/)/*<13372*/(/*13372*//*15652*//*15652*//*15652*/cons/*<15652*/(/*15652*//*15653*//*15653*//*15654*/$co/*<15654*/(/*15653*//*15655*/nil/*<15655*/)/*<15653*/(/*15653*//*13388*//*13389*/parse_expr/*<13389*/(/*13388*//*13390*/value/*<13390*/)/*<13388*/)/*<15653*/)/*<15652*/(/*15652*//*15652*/nil/*<15652*/)/*<15652*/)/*<13372*/)/*<15644*/(/*15644*//*15644*/nil/*<15644*/)/*<15644*/
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 15645');})(/*!*//*15647*/pat/*<15647*/)/*<15645*/
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 13369');})(/*!*//*-1*/$fn_arg/*<-1*/)/*<13369*/ }/*<13369*/)/*<13367*/(/*13367*//*13373*//*13374*/pairs/*<13374*/(/*13373*//*13375*/inits/*<13375*/)/*<13373*/)/*<13367*/)/*<15641*/)/*<13352*/(/*13352*//*13376*//*13377*/parse_expr/*<13377*/(/*13376*//*13378*/body/*<13378*/)/*<13376*/)/*<13352*/(/*13352*//*13379*/l/*<13379*/)/*<13352*/
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
return /*11566*//*11566*//*11566*//*11567*/foldr/*<11567*/(/*11566*//*11568*//*11569*/parse_expr/*<11569*/(/*11568*//*11570*/body/*<11570*/)/*<11568*/)/*<11566*/(/*11566*//*11571*//*11572*/pairs/*<11572*/(/*11571*//*11573*/inits/*<11573*/)/*<11571*/)/*<11566*/(/*11566*//*11574*/function name_11574(body) { return /*11574*/function name_11574(init) { return /*11579*/(function let_11579() {const $target = /*11586*/init/*<11586*/;
if ($target.type === ",") {
{
let pat = $target[0];
{
let value = $target[1];
return /*11587*//*11587*//*11587*//*11588*/eapp/*<11588*/(/*11587*//*11589*//*11590*/parse_expr/*<11590*/(/*11589*//*11591*/value/*<11591*/)/*<11589*/)/*<11587*/(/*11587*//*11592*//*11592*//*11592*//*11593*/elambda/*<11593*/(/*11592*//*11594*//*13345*/parse_pat/*<13345*/(/*11594*//*13346*/pat/*<13346*/)/*<11594*/)/*<11592*/(/*11592*//*11597*/body/*<11597*/)/*<11592*/(/*11592*//*11612*/l/*<11612*/)/*<11592*/)/*<11587*/(/*11587*//*11613*/l/*<11613*/)/*<11587*/
}
}
};
throw new Error('let pattern not matched 11582. ' + valueToString($target));})(/*!*/)/*<11579*/ }/*<11574*/ }/*<11574*/)/*<11566*/
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
return /*11625*//*11626*/fatal/*<11626*/(/*11625*//*11627*/`Invalid 'let' ${/*11629*//*11630*/int_to_string/*<11630*/(/*11629*//*11631*/l/*<11631*/)/*<11629*/}`/*<11627*/)/*<11625*/
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
return /*11640*//*11640*//*11640*//*11641*/foldl/*<11641*/(/*11640*//*11642*//*11643*/parse_expr/*<11643*/(/*11642*//*11644*/target/*<11644*/)/*<11642*/)/*<11640*/(/*11640*//*11645*/args/*<11645*/)/*<11640*/(/*11640*//*11646*/function name_11646(target) { return /*11646*/function name_11646(arg) { return /*11651*//*11651*//*11651*//*11652*/eapp/*<11652*/(/*11651*//*11653*/target/*<11653*/)/*<11651*/(/*11651*//*11654*//*11655*/parse_expr/*<11655*/(/*11654*//*11656*/arg/*<11656*/)/*<11654*/)/*<11651*/(/*11651*//*11657*/l/*<11657*/)/*<11651*/ }/*<11646*/ }/*<11646*/)/*<11640*/
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
return /*11662*//*11662*//*11663*/parse_array/*<11663*/(/*11662*//*11664*/args/*<11664*/)/*<11662*/(/*11662*//*11665*/l/*<11665*/)/*<11662*/
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
return /*12527*//*12527*//*12527*//*12527*//*12528*/sdef/*<12528*/(/*12527*//*12529*/id/*<12529*/)/*<12527*/(/*12527*//*12530*/li/*<12530*/)/*<12527*/(/*12527*//*12531*//*12532*/parse_expr/*<12532*/(/*12531*//*12533*/value/*<12533*/)/*<12531*/)/*<12527*/(/*12527*//*12534*/l/*<12534*/)/*<12527*/
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
return /*12553*//*12553*//*12553*//*12553*//*12554*/sdef/*<12554*/(/*12553*//*12555*/id/*<12555*/)/*<12553*/(/*12553*//*12556*/li/*<12556*/)/*<12553*/(/*12553*//*12557*//*12558*/parse_expr/*<12558*/(/*12557*//*12559*//*12559*//*12560*/cst$sllist/*<12560*/(/*12559*//*12561*//*12561*//*12561*/cons/*<12561*/(/*12561*//*12562*//*12562*//*12563*/cst$slidentifier/*<12563*/(/*12562*//*12564*/"fn"/*<12564*/)/*<12562*/(/*12562*//*12566*/a/*<12566*/)/*<12562*/)/*<12561*/(/*12561*//*12561*//*12561*//*12561*/cons/*<12561*/(/*12561*//*12567*//*12567*//*12568*/cst$slarray/*<12568*/(/*12567*//*12569*/args/*<12569*/)/*<12567*/(/*12567*//*12570*/b/*<12570*/)/*<12567*/)/*<12561*/(/*12561*//*12561*//*12561*//*12561*/cons/*<12561*/(/*12561*//*12571*/body/*<12571*/)/*<12561*/(/*12561*//*12561*/nil/*<12561*/)/*<12561*/)/*<12561*/)/*<12561*/)/*<12559*/(/*12559*//*12572*/c/*<12572*/)/*<12559*/)/*<12557*/)/*<12553*/(/*12553*//*12573*/c/*<12573*/)/*<12553*/
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
return /*12585*//*12586*/fatal/*<12586*/(/*12585*//*12587*/`Invalid 'defn' ${/*12589*//*12590*/int_to_string/*<12590*/(/*12589*//*12591*/l/*<12591*/)/*<12589*/}`/*<12587*/)/*<12585*/
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
return /*12608*//*12608*//*12608*//*12608*//*12608*//*12609*/mk_deftype/*<12609*/(/*12608*//*12610*/id/*<12610*/)/*<12608*/(/*12608*//*12611*/li/*<12611*/)/*<12608*/(/*12608*//*12612*/nil/*<12612*/)/*<12608*/(/*12608*//*12613*/items/*<12613*/)/*<12608*/(/*12608*//*12614*/l/*<12614*/)/*<12608*/
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
return /*12636*//*12636*//*12636*//*12636*//*12636*//*12637*/mk_deftype/*<12637*/(/*12636*//*12638*/id/*<12638*/)/*<12636*/(/*12636*//*12639*/li/*<12639*/)/*<12636*/(/*12636*//*12640*/args/*<12640*/)/*<12636*/(/*12636*//*12641*/items/*<12641*/)/*<12636*/(/*12636*//*12642*/l/*<12642*/)/*<12636*/
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
return /*12654*//*12655*/fatal/*<12655*/(/*12654*//*12656*/`Invalid 'deftype' ${/*12658*//*12659*/int_to_string/*<12659*/(/*12658*//*12660*/l/*<12660*/)/*<12658*/}`/*<12656*/)/*<12654*/
}
}
}
}
}
return /*12663*//*12663*//*12664*/sexpr/*<12664*/(/*12663*//*12665*//*12666*/parse_expr/*<12666*/(/*12665*//*12667*/cst/*<12667*/)/*<12665*/)/*<12663*/(/*12663*//*12668*/(function match_12668($target) {
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


const parse_array = /*11675*/function name_11675(args) { return /*11675*/function name_11675(l) { return /*11681*/(function match_11681($target) {
if ($target.type === "nil") {
return /*11685*//*11685*//*11686*/evar/*<11686*/(/*11685*//*11687*/"nil"/*<11687*/)/*<11685*/(/*11685*//*11689*/l/*<11689*/)/*<11685*/
}
if ($target.type === "cons") {
if ($target[0].type === "cst/spread") {
{
let inner = $target[0][0];
if ($target[1].type === "nil") {
return /*11695*//*11696*/parse_expr/*<11696*/(/*11695*//*11697*/inner/*<11697*/)/*<11695*/
}
}
}
}
if ($target.type === "cons") {
{
let one = $target[0];
{
let rest = $target[1];
return /*11702*//*11702*//*11702*//*11703*/eapp/*<11703*/(/*11702*//*11704*//*11704*//*11704*//*11705*/eapp/*<11705*/(/*11704*//*11706*//*11706*//*11707*/evar/*<11707*/(/*11706*//*11708*/"cons"/*<11708*/)/*<11706*/(/*11706*//*11710*/l/*<11710*/)/*<11706*/)/*<11704*/(/*11704*//*11711*//*11712*/parse_expr/*<11712*/(/*11711*//*11713*/one/*<11713*/)/*<11711*/)/*<11704*/(/*11704*//*11714*/l/*<11714*/)/*<11704*/)/*<11702*/(/*11702*//*11715*//*11715*//*11716*/parse_array/*<11716*/(/*11715*//*11717*/rest/*<11717*/)/*<11715*/(/*11715*//*11718*/l/*<11718*/)/*<11715*/)/*<11702*/(/*11702*//*11719*/l/*<11719*/)/*<11702*/
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 11681');})(/*!*//*11683*/args/*<11683*/)/*<11681*/ }/*<11675*/ }/*<11675*/;

const add_inst = /*7334*/function name_7334(preds) { return /*7334*/function name_7334(p) { return /*7334*/function name_7334($fn_arg) { return /*7334*/(function match_7334($target) {
if ($target.type === "class-env") {
{
let classes = $target[0];
{
let defaults = $target[1];
return /*7686*/(function let_7686() {const $target = /*7693*/p/*<7693*/;
if ($target.type === "isin") {
{
let name = $target[0];
{
let supers = $target[1];
return /*7348*/(function match_7348($target) {
if ($target.type === "none") {
return /*7510*//*7511*/fatal/*<7511*/(/*7510*//*7512*/`no class ${/*7514*/name/*<7514*/} for instance`/*<7512*/)/*<7510*/
}
if ($target.type === "some") {
if ($target[0].type === ",") {
{
let c_supers = $target[0][0];
{
let c_instances = $target[0][1];
return /*7519*/(function let_7519() {const $target = /*7526*//*7526*//*7527*/$co/*<7527*/(/*7526*//*7528*/c_supers/*<7528*/)/*<7526*/(/*7526*//*7529*//*7529*//*7529*/cons/*<7529*/(/*7529*//*7530*//*7530*//*7533*/$eq$gt/*<7533*/(/*7530*//*7534*/preds/*<7534*/)/*<7530*/(/*7530*//*7535*//*7535*//*7536*/isin/*<7536*/(/*7535*//*7537*/name/*<7537*/)/*<7535*/(/*7535*//*7538*/supers/*<7538*/)/*<7535*/)/*<7530*/)/*<7529*/(/*7529*//*7539*/c_instances/*<7539*/)/*<7529*/)/*<7526*/;
{
let c = $target;
return /*7519*/(function let_7519() {const $target = /*7544*//*7544*//*7545*/map/*<7545*/(/*7544*//*7548*/function name_7548($fn_arg) { return /*7548*/(function match_7548($target) {
if ($target.type === "=>") {
{
let q = $target[1];
return /*7556*/q/*<7556*/
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 7548');})(/*!*//*-1*/$fn_arg/*<-1*/)/*<7548*/ }/*<7548*/)/*<7544*/(/*7544*//*7567*/c_instances/*<7567*/)/*<7544*/;
{
let qs = $target;
return /*7547*/(function match_7547($target) {
if ($target === true) {
return /*7575*//*7576*/fatal/*<7576*/(/*7575*//*7577*/"overlapping instance"/*<7577*/)/*<7575*/
}
return /*7579*//*7579*//*7580*/class_env/*<7580*/(/*7579*//*7581*//*7581*//*7581*//*7582*/map$slset/*<7582*/(/*7581*//*7583*/classes/*<7583*/)/*<7581*/(/*7581*//*7584*/name/*<7584*/)/*<7581*/(/*7581*//*7585*/c/*<7585*/)/*<7581*/)/*<7579*/(/*7579*//*7586*/defaults/*<7586*/)/*<7579*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 7547');})(/*!*//*7569*//*7569*//*7570*/any/*<7570*/(/*7569*//*7571*//*7572*/overlap/*<7572*/(/*7571*//*7573*/p/*<7573*/)/*<7571*/)/*<7569*/(/*7569*//*7574*/qs/*<7574*/)/*<7569*/)/*<7547*/
};
throw new Error('let pattern not matched 7543. ' + valueToString($target));})(/*!*/)/*<7519*/
};
throw new Error('let pattern not matched 7525. ' + valueToString($target));})(/*!*/)/*<7519*/
}
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 7348');})(/*!*//*7504*//*7504*//*7505*/map$slget/*<7505*/(/*7504*//*7506*/classes/*<7506*/)/*<7504*/(/*7504*//*7507*/name/*<7507*/)/*<7504*/)/*<7348*/
}
}
};
throw new Error('let pattern not matched 7689. ' + valueToString($target));})(/*!*/)/*<7686*/
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 7334');})(/*!*//*-1*/$fn_arg/*<-1*/)/*<7334*/ }/*<7334*/ }/*<7334*/ }/*<7334*/;

const example_insts = /*7719*//*7719*//*7719*/cons/*<7719*/(/*7719*//*7720*//*7720*//*7721*/add_inst/*<7721*/(/*7720*//*7722*/nil/*<7722*/)/*<7720*/(/*7720*//*7723*//*7723*//*7724*/isin/*<7724*/(/*7723*//*7725*/"ord"/*<7725*/)/*<7723*/(/*7723*//*7727*/tunit/*<7727*/)/*<7723*/)/*<7720*/)/*<7719*/(/*7719*//*7719*//*7719*//*7719*/cons/*<7719*/(/*7719*//*7729*//*7729*//*7730*/add_inst/*<7730*/(/*7729*//*7731*/nil/*<7731*/)/*<7729*/(/*7729*//*7732*//*7732*//*7733*/isin/*<7733*/(/*7732*//*7734*/"ord"/*<7734*/)/*<7732*/(/*7732*//*7736*/tchar/*<7736*/)/*<7732*/)/*<7729*/)/*<7719*/(/*7719*//*7719*//*7719*//*7719*/cons/*<7719*/(/*7719*//*7737*//*7737*//*7738*/add_inst/*<7738*/(/*7737*//*7739*/nil/*<7739*/)/*<7737*/(/*7737*//*7740*//*7740*//*7741*/isin/*<7741*/(/*7740*//*7742*/"ord"/*<7742*/)/*<7740*/(/*7740*//*7744*/tint/*<7744*/)/*<7740*/)/*<7737*/)/*<7719*/(/*7719*//*7719*//*7719*//*7719*/cons/*<7719*/(/*7719*//*7745*//*7745*//*7746*/add_inst/*<7746*/(/*7745*//*7747*//*7747*//*7747*/cons/*<7747*/(/*7747*//*7748*//*7748*//*7749*/isin/*<7749*/(/*7748*//*7750*/"ord"/*<7750*/)/*<7748*/(/*7748*//*7752*//*7752*//*7753*/tvar/*<7753*/(/*7752*//*7754*//*7754*//*7755*/tyvar/*<7755*/(/*7754*//*7756*/"a"/*<7756*/)/*<7754*/(/*7754*//*7758*/star/*<7758*/)/*<7754*/)/*<7752*/(/*7752*//*7759*/-1/*<7759*/)/*<7752*/)/*<7748*/)/*<7747*/(/*7747*//*7747*//*7747*//*7747*/cons/*<7747*/(/*7747*//*7760*//*7760*//*7761*/isin/*<7761*/(/*7760*//*7762*/"ord"/*<7762*/)/*<7760*/(/*7760*//*7764*//*7764*//*7765*/tvar/*<7765*/(/*7764*//*7766*//*7766*//*7767*/tyvar/*<7767*/(/*7766*//*7768*/"b"/*<7768*/)/*<7766*/(/*7766*//*7770*/star/*<7770*/)/*<7766*/)/*<7764*/(/*7764*//*7771*/-1/*<7771*/)/*<7764*/)/*<7760*/)/*<7747*/(/*7747*//*7747*/nil/*<7747*/)/*<7747*/)/*<7747*/)/*<7745*/(/*7745*//*7776*//*7776*//*7777*/isin/*<7777*/(/*7776*//*7778*/"ord"/*<7778*/)/*<7776*/(/*7776*//*7798*//*7798*//*7781*/mkpair/*<7781*/(/*7798*//*7782*//*7782*//*7783*/tvar/*<7783*/(/*7782*//*7784*//*7784*//*7785*/tyvar/*<7785*/(/*7784*//*7786*/"a"/*<7786*/)/*<7784*/(/*7784*//*7788*/star/*<7788*/)/*<7784*/)/*<7782*/(/*7782*//*7789*/-1/*<7789*/)/*<7782*/)/*<7798*/(/*7798*//*7790*//*7790*//*7791*/tvar/*<7791*/(/*7790*//*7792*//*7792*//*7793*/tyvar/*<7793*/(/*7792*//*7794*/"b"/*<7794*/)/*<7792*/(/*7792*//*7796*/star/*<7796*/)/*<7792*/)/*<7790*/(/*7790*//*7797*/-1/*<7797*/)/*<7790*/)/*<7798*/)/*<7776*/)/*<7745*/)/*<7719*/(/*7719*//*7719*/nil/*<7719*/)/*<7719*/)/*<7719*/)/*<7719*/)/*<7719*/;

const unify = /*8831*/function name_8831(t1) { return /*8831*/function name_8831(t2) { return /*8952*//*8953*/TI/*<8953*/(/*8952*//*8954*/function name_8954(subst) { return /*8954*/function name_8954(tenv) { return /*8954*/function name_8954(nidx) { return /*8841*/(function match_8841($target) {
if ($target.type === "ok") {
{
let v = $target[0];
return /*8870*//*8871*/ok/*<8871*/(/*8870*//*8860*//*8860*//*8860*//*8860*//*8861*/$co$co$co/*<8861*/(/*8860*//*8862*//*8862*//*8863*/compose_subst/*<8863*/(/*8862*//*8864*/v/*<8864*/)/*<8862*/(/*8862*//*8865*/subst/*<8865*/)/*<8862*/)/*<8860*/(/*8860*//*9902*/tenv/*<9902*/)/*<8860*/(/*8860*//*8866*/nidx/*<8866*/)/*<8860*/(/*8860*//*8959*/0/*<8959*/)/*<8860*/)/*<8870*/
}
}
if ($target.type === "err") {
{
let e = $target[0];
return /*8868*//*8970*/err/*<8970*/(/*8868*//*8971*/`Unable to unify ${/*8974*//*8976*/type_$gts/*<8976*/(/*8974*//*8977*/t1/*<8977*/)/*<8974*/} and ${/*8978*//*8980*/type_$gts/*<8980*/(/*8978*//*8981*/t2/*<8981*/)/*<8978*/}\n-> ${/*9127*/e/*<9127*/}`/*<8971*/)/*<8868*/
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 8841');})(/*!*//*8844*//*8844*//*8848*/mgu/*<8848*/(/*8844*//*8849*//*8849*//*8850*/type$slapply/*<8850*/(/*8849*//*8851*/subst/*<8851*/)/*<8849*/(/*8849*//*8852*/t1/*<8852*/)/*<8849*/)/*<8844*/(/*8844*//*8853*//*8853*//*8854*/type$slapply/*<8854*/(/*8853*//*8855*/subst/*<8855*/)/*<8853*/(/*8853*//*8856*/t2/*<8856*/)/*<8853*/)/*<8844*/)/*<8841*/ }/*<8954*/ }/*<8954*/ }/*<8954*/)/*<8952*/ }/*<8831*/ }/*<8831*/;

const new_tvar = /*8872*/function name_8872(kind) { return /*9129*//*9130*/TI/*<9130*/(/*9129*//*9132*/function name_9132(subst) { return /*9132*/function name_9132(tenv) { return /*9132*/function name_9132(nidx) { return /*8882*/(function let_8882() {const $target = /*8886*//*8886*//*8887*/tyvar/*<8887*/(/*8886*//*8888*//*8889*/enumId/*<8889*/(/*8888*//*8890*/nidx/*<8890*/)/*<8888*/)/*<8886*/(/*8886*//*8891*/kind/*<8891*/)/*<8886*/;
{
let v = $target;
return /*9137*//*9138*/ok/*<9138*/(/*9137*//*8892*//*8892*//*8892*//*8892*//*8893*/$co$co$co/*<8893*/(/*8892*//*8894*/subst/*<8894*/)/*<8892*/(/*8892*//*9904*/tenv/*<9904*/)/*<8892*/(/*8892*//*8895*//*8895*//*8897*/$pl/*<8897*/(/*8895*//*8898*/nidx/*<8898*/)/*<8895*/(/*8895*//*8899*/1/*<8899*/)/*<8895*/)/*<8892*/(/*8892*//*8900*//*8900*//*8901*/tvar/*<8901*/(/*8900*//*8902*/v/*<8902*/)/*<8900*/(/*8900*//*8903*/-1/*<8903*/)/*<8900*/)/*<8892*/)/*<9137*/
};
throw new Error('let pattern not matched 8885. ' + valueToString($target));})(/*!*/)/*<8882*/ }/*<9132*/ }/*<9132*/ }/*<9132*/)/*<9129*/ }/*<8872*/;

const map$slti = /*9183*/function name_9183(f) { return /*9183*/function name_9183(arr) { return /*9200*/(function match_9200($target) {
if ($target.type === "nil") {
return /*9204*//*9205*/TI/*<9205*/(/*9204*//*9206*/function name_9206(s) { return /*9206*/function name_9206(t) { return /*9206*/function name_9206(n) { return /*9276*//*9277*/ok/*<9277*/(/*9276*//*9211*//*9211*//*9211*//*9211*//*9212*/$co$co$co/*<9212*/(/*9211*//*9213*/s/*<9213*/)/*<9211*/(/*9211*//*9917*/t/*<9917*/)/*<9211*/(/*9211*//*9215*/n/*<9215*/)/*<9211*/(/*9211*//*9216*/nil/*<9216*/)/*<9211*/)/*<9276*/ }/*<9206*/ }/*<9206*/ }/*<9206*/)/*<9204*/
}
if ($target.type === "cons") {
{
let one = $target[0];
{
let rest = $target[1];
return /*9190*//*9193*/TI/*<9193*/(/*9190*//*9194*/function name_9194(subst) { return /*9194*/function name_9194(tenv) { return /*9194*/function name_9194(nidx) { return /*9199*/(function match_9199($target) {
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
return /*9242*/(function match_9242($target) {
if ($target.type === "ok") {
if ($target[0].type === ",,,") {
{
let subst = $target[0][0];
{
let tenv = $target[0][1];
{
let nidx = $target[0][2];
{
let results = $target[0][3];
return /*9252*//*9253*/ok/*<9253*/(/*9252*//*9254*//*9254*//*9254*//*9254*//*9255*/$co$co$co/*<9255*/(/*9254*//*9256*/subst/*<9256*/)/*<9254*/(/*9254*//*9915*/tenv/*<9915*/)/*<9254*/(/*9254*//*9257*/nidx/*<9257*/)/*<9254*/(/*9254*//*9258*//*9258*//*9258*/cons/*<9258*/(/*9258*//*9259*/value/*<9259*/)/*<9258*/(/*9258*//*9260*/results/*<9260*/)/*<9258*/)/*<9254*/)/*<9252*/
}
}
}
}
}
}
if ($target.type === "err") {
{
let e = $target[0];
return /*9267*//*9268*/err/*<9268*/(/*9267*//*9269*/e/*<9269*/)/*<9267*/
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 9242');})(/*!*//*9236*//*9236*//*9236*//*9236*//*9293*/ti_run/*<9293*/(/*9236*//*9292*//*9292*//*9237*/map$slti/*<9237*/(/*9292*//*9238*/f/*<9238*/)/*<9292*/(/*9292*//*9239*/rest/*<9239*/)/*<9292*/)/*<9236*/(/*9236*//*9240*/subst/*<9240*/)/*<9236*/(/*9236*//*9914*/tenv/*<9914*/)/*<9236*/(/*9236*//*9241*/nidx/*<9241*/)/*<9236*/)/*<9242*/
}
}
}
}
}
}
if ($target.type === "err") {
{
let e = $target[0];
return /*9273*//*9274*/err/*<9274*/(/*9273*//*9275*/e/*<9275*/)/*<9273*/
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 9199');})(/*!*//*9224*//*9224*//*9224*//*9224*//*9295*/ti_run/*<9295*/(/*9224*//*9294*//*9225*/f/*<9225*/(/*9294*//*9226*/one/*<9226*/)/*<9294*/)/*<9224*/(/*9224*//*9227*/subst/*<9227*/)/*<9224*/(/*9224*//*9912*/tenv/*<9912*/)/*<9224*/(/*9224*//*9228*/nidx/*<9228*/)/*<9224*/)/*<9199*/ }/*<9194*/ }/*<9194*/ }/*<9194*/)/*<9190*/
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 9200');})(/*!*//*9202*/arr/*<9202*/)/*<9200*/ }/*<9183*/ }/*<9183*/;

const fresh_inst = /*9664*/function name_9664($fn_arg) { return /*9664*/(function match_9664($target) {
if ($target.type === "forall") {
{
let ks = $target[0];
{
let qt = $target[1];
return /*9754*//*9673*//*9678*/ti_then/*<9678*/(/*9673*//*9679*//*9679*//*9680*/map$slti/*<9680*/(/*9679*//*9681*/new_tvar/*<9681*/)/*<9679*/(/*9679*//*9682*/ks/*<9682*/)/*<9679*/)/*<9673*/(/*9754*//*9754*/function name_9754($let) { return /*9754*/(function match_9754($target) {
{
let ts = $target;
return /*9759*//*9760*/ti_return/*<9760*/(/*9759*//*9761*//*9761*//*9761*//*9762*/inst$slqual/*<9762*/(/*9761*//*9763*/ts/*<9763*/)/*<9761*/(/*9761*//*9764*/inst$sltype/*<9764*/)/*<9761*/(/*9761*//*9765*/qt/*<9765*/)/*<9761*/)/*<9759*/
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 9754');})(/*!*//*-1*/$let/*<-1*/)/*<9754*/ }/*<9754*/)/*<9754*/
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 9664');})(/*!*//*-1*/$fn_arg/*<-1*/)/*<9664*/ }/*<9664*/;

const ntv = /*9808*/function name_9808(kind) { return /*9816*//*9817*/ti_then/*<9817*/(/*9816*//*9818*//*9819*/new_tvar/*<9819*/(/*9818*//*9820*/kind/*<9820*/)/*<9818*/)/*<9816*/ }/*<9808*/;

/*11667*//*11668*/parse_expr/*<11668*/(/*11667*//*11669*/{"0":{"0":{"0":"@!","1":11672,"type":"cst/identifier"},"1":{"0":{"0":"12","1":11673,"type":"cst/identifier"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"1":11671,"type":"cst/list"}/*<11669*/)/*<11667*/
/*11721*//*11721*//*11722*/$co/*<11722*/(/*11721*//*11723*/parse_expr/*<11723*/)/*<11721*/(/*11721*//*11724*//*11724*//*11724*/cons/*<11724*/(/*11724*//*11725*//*11725*//*11726*/$co/*<11726*/(/*11725*//*11727*/{"0":"true","1":11729,"type":"cst/identifier"}/*<11727*/)/*<11725*/(/*11725*//*11730*//*11730*//*12976*/eprim/*<12976*/(/*11730*//*12977*//*12977*//*12978*/pbool/*<12978*/(/*12977*//*12979*/true/*<12979*/)/*<12977*/(/*12977*//*12980*/11729/*<12980*/)/*<12977*/)/*<11730*/(/*11730*//*12981*/11729/*<12981*/)/*<11730*/)/*<11725*/)/*<11724*/(/*11724*//*11724*//*11724*//*11724*/cons/*<11724*/(/*11724*//*11737*//*11737*//*11738*/$co/*<11738*/(/*11737*//*11739*/{"0":{"0":{"0":"1","1":11742,"type":"cst/identifier"},"1":{"0":{"0":{"0":"b","1":11744,"type":"cst/identifier"},"1":11743,"type":"cst/spread"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"1":11741,"type":"cst/array"}/*<11739*/)/*<11737*/(/*11737*//*11745*//*11745*//*11745*//*12982*/eapp/*<12982*/(/*11745*//*12983*//*12983*//*12983*//*12984*/eapp/*<12984*/(/*12983*//*12985*//*12985*//*12986*/evar/*<12986*/(/*12985*//*12987*/"cons"/*<12987*/)/*<12985*/(/*12985*//*12989*/11741/*<12989*/)/*<12985*/)/*<12983*/(/*12983*//*12990*//*12990*//*12991*/eprim/*<12991*/(/*12990*//*12992*//*12992*//*12993*/pint/*<12993*/(/*12992*//*12994*/1/*<12994*/)/*<12992*/(/*12992*//*12995*/11742/*<12995*/)/*<12992*/)/*<12990*/(/*12990*//*12996*/11742/*<12996*/)/*<12990*/)/*<12983*/(/*12983*//*12997*/11741/*<12997*/)/*<12983*/)/*<11745*/(/*11745*//*12998*//*12998*//*12999*/evar/*<12999*/(/*12998*//*13000*/"b"/*<13000*/)/*<12998*/(/*12998*//*13002*/11744/*<13002*/)/*<12998*/)/*<11745*/(/*11745*//*13003*/11741/*<13003*/)/*<11745*/)/*<11737*/)/*<11724*/(/*11724*//*11724*//*11724*//*11724*/cons/*<11724*/(/*11724*//*11768*//*11768*//*11769*/$co/*<11769*/(/*11768*//*11770*/{"0":"hi","1":{"type":"nil"},"2":11772,"type":"cst/string"}/*<11770*/)/*<11768*/(/*11768*//*11774*//*11774*//*11774*//*13004*/estr/*<13004*/(/*11774*//*13005*/"hi"/*<13005*/)/*<11774*/(/*11774*//*13007*/nil/*<13007*/)/*<11774*/(/*11774*//*13008*/11772/*<13008*/)/*<11774*/)/*<11768*/)/*<11724*/(/*11724*//*11724*//*11724*//*11724*/cons/*<11724*/(/*11724*//*11780*//*11780*//*11781*/$co/*<11781*/(/*11780*//*11782*/{"0":{"0":{"0":"@t","1":11785,"type":"cst/identifier"},"1":{"0":{"0":"a","1":11786,"type":"cst/identifier"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"1":11784,"type":"cst/list"}/*<11782*/)/*<11780*/(/*11780*//*11787*//*11787*//*13009*/equot$sltype/*<13009*/(/*11787*//*13010*//*13010*//*13011*/tcon/*<13011*/(/*13010*//*13012*//*13012*//*13013*/tycon/*<13013*/(/*13012*//*13014*/"a"/*<13014*/)/*<13012*/(/*13012*//*13017*/star/*<13017*/)/*<13012*/)/*<13010*/(/*13010*//*13018*/11786/*<13018*/)/*<13010*/)/*<11787*/(/*11787*//*13019*/11784/*<13019*/)/*<11787*/)/*<11780*/)/*<11724*/(/*11724*//*11724*//*11724*//*11724*/cons/*<11724*/(/*11724*//*11795*//*11795*//*11796*/$co/*<11796*/(/*11795*//*11797*/{"0":{"0":{"0":"@t","1":11800,"type":"cst/identifier"},"1":{"0":{"0":{"0":{"0":"a","1":11802,"type":"cst/identifier"},"1":{"0":{"0":"b","1":11803,"type":"cst/identifier"},"1":{"0":{"0":"c","1":11804,"type":"cst/identifier"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"type":"cons"},"1":11801,"type":"cst/list"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"1":11799,"type":"cst/list"}/*<11797*/)/*<11795*/(/*11795*//*11805*//*11805*//*13020*/equot$sltype/*<13020*/(/*11805*//*13021*//*13021*//*13021*//*13022*/tapp/*<13022*/(/*13021*//*13023*//*13023*//*13023*//*13024*/tapp/*<13024*/(/*13023*//*13025*//*13025*//*13026*/tcon/*<13026*/(/*13025*//*13027*//*13027*//*13028*/tycon/*<13028*/(/*13027*//*13029*/"a"/*<13029*/)/*<13027*/(/*13027*//*13032*/star/*<13032*/)/*<13027*/)/*<13025*/(/*13025*//*13033*/11802/*<13033*/)/*<13025*/)/*<13023*/(/*13023*//*13034*//*13034*//*13035*/tcon/*<13035*/(/*13034*//*13036*//*13036*//*13037*/tycon/*<13037*/(/*13036*//*13038*/"b"/*<13038*/)/*<13036*/(/*13036*//*13041*/star/*<13041*/)/*<13036*/)/*<13034*/(/*13034*//*13042*/11803/*<13042*/)/*<13034*/)/*<13023*/(/*13023*//*13043*/11801/*<13043*/)/*<13023*/)/*<13021*/(/*13021*//*13044*//*13044*//*13045*/tcon/*<13045*/(/*13044*//*13046*//*13046*//*13047*/tycon/*<13047*/(/*13046*//*13048*/"c"/*<13048*/)/*<13046*/(/*13046*//*13051*/star/*<13051*/)/*<13046*/)/*<13044*/(/*13044*//*13052*/11804/*<13052*/)/*<13044*/)/*<13021*/(/*13021*//*13053*/11801/*<13053*/)/*<13021*/)/*<11805*/(/*11805*//*13054*/11799/*<13054*/)/*<11805*/)/*<11795*/)/*<11724*/(/*11724*//*11724*//*11724*//*11724*/cons/*<11724*/(/*11724*//*11829*//*11829*//*11830*/$co/*<11830*/(/*11829*//*11831*/{"0":{"0":{"0":"@p","1":11834,"type":"cst/identifier"},"1":{"0":{"0":"_","1":11835,"type":"cst/identifier"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"1":11833,"type":"cst/list"}/*<11831*/)/*<11829*/(/*11829*//*11836*//*11836*//*13393*/equot$slpat/*<13393*/(/*11836*//*13394*//*13395*/pany/*<13395*/(/*13394*//*13396*/11835/*<13396*/)/*<13394*/)/*<11836*/(/*11836*//*13397*/11833/*<13397*/)/*<11836*/)/*<11829*/)/*<11724*/(/*11724*//*11724*//*11724*//*11724*/cons/*<11724*/(/*11724*//*11842*//*11842*//*11843*/$co/*<11843*/(/*11842*//*11844*/{"0":{"0":{"0":"if","1":11847,"type":"cst/identifier"},"1":{"0":{"0":{"0":{"0":"=","1":11849,"type":"cst/identifier"},"1":{"0":{"0":"a","1":11850,"type":"cst/identifier"},"1":{"0":{"0":"b","1":11851,"type":"cst/identifier"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"type":"cons"},"1":11848,"type":"cst/list"},"1":{"0":{"0":"a","1":11852,"type":"cst/identifier"},"1":{"0":{"0":"b","1":11853,"type":"cst/identifier"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"type":"cons"},"type":"cons"},"1":11846,"type":"cst/list"}/*<11844*/)/*<11842*/(/*11842*//*11854*//*11854*//*11854*//*13055*/ematch/*<13055*/(/*11854*//*13056*//*13056*//*13056*//*13057*/eapp/*<13057*/(/*13056*//*13058*//*13058*//*13058*//*13059*/eapp/*<13059*/(/*13058*//*13060*//*13060*//*13061*/evar/*<13061*/(/*13060*//*13062*/"="/*<13062*/)/*<13060*/(/*13060*//*13064*/11849/*<13064*/)/*<13060*/)/*<13058*/(/*13058*//*13065*//*13065*//*13066*/evar/*<13066*/(/*13065*//*13067*/"a"/*<13067*/)/*<13065*/(/*13065*//*13069*/11850/*<13069*/)/*<13065*/)/*<13058*/(/*13058*//*13070*/11848/*<13070*/)/*<13058*/)/*<13056*/(/*13056*//*13071*//*13071*//*13072*/evar/*<13072*/(/*13071*//*13073*/"b"/*<13073*/)/*<13071*/(/*13071*//*13075*/11851/*<13075*/)/*<13071*/)/*<13056*/(/*13056*//*13076*/11848/*<13076*/)/*<13056*/)/*<11854*/(/*11854*//*13077*//*13077*//*13077*/cons/*<13077*/(/*13077*//*13078*//*13078*//*13079*/$co/*<13079*/(/*13078*//*13080*//*13080*//*13081*/pprim/*<13081*/(/*13080*//*13082*//*13082*//*13083*/pbool/*<13083*/(/*13082*//*13084*/true/*<13084*/)/*<13082*/(/*13082*//*13085*/11846/*<13085*/)/*<13082*/)/*<13080*/(/*13080*//*13086*/11846/*<13086*/)/*<13080*/)/*<13078*/(/*13078*//*13087*//*13087*//*13088*/evar/*<13088*/(/*13087*//*13089*/"a"/*<13089*/)/*<13087*/(/*13087*//*13091*/11852/*<13091*/)/*<13087*/)/*<13078*/)/*<13077*/(/*13077*//*13077*//*13077*//*13077*/cons/*<13077*/(/*13077*//*13092*//*13092*//*13093*/$co/*<13093*/(/*13092*//*13094*//*13095*/pany/*<13095*/(/*13094*//*13096*/11846/*<13096*/)/*<13094*/)/*<13092*/(/*13092*//*13097*//*13097*//*13098*/evar/*<13098*/(/*13097*//*13099*/"b"/*<13099*/)/*<13097*/(/*13097*//*13101*/11853/*<13101*/)/*<13097*/)/*<13092*/)/*<13077*/(/*13077*//*13077*/nil/*<13077*/)/*<13077*/)/*<13077*/)/*<11854*/(/*11854*//*13102*/11846/*<13102*/)/*<11854*/)/*<11842*/)/*<11724*/(/*11724*//*11724*//*11724*//*11724*/cons/*<11724*/(/*11724*//*11903*//*11903*//*11904*/$co/*<11904*/(/*11903*//*11905*/{"0":"a","1":{"0":{"0":{"0":"1","1":11909,"type":"cst/identifier"},"1":"b","2":11910,"type":",,"},"1":{"type":"nil"},"type":"cons"},"2":11907,"type":"cst/string"}/*<11905*/)/*<11903*/(/*11903*//*11911*//*11911*//*11911*//*13103*/estr/*<13103*/(/*11911*//*13104*/"a"/*<13104*/)/*<11911*/(/*11911*//*13106*//*13106*//*13106*/cons/*<13106*/(/*13106*//*13107*//*13107*//*13107*//*13108*/$co$co/*<13108*/(/*13107*//*13109*//*13109*//*13110*/eprim/*<13110*/(/*13109*//*13111*//*13111*//*13112*/pint/*<13112*/(/*13111*//*13113*/1/*<13113*/)/*<13111*/(/*13111*//*13114*/11909/*<13114*/)/*<13111*/)/*<13109*/(/*13109*//*13115*/11909/*<13115*/)/*<13109*/)/*<13107*/(/*13107*//*13116*/"b"/*<13116*/)/*<13107*/(/*13107*//*13118*/11910/*<13118*/)/*<13107*/)/*<13106*/(/*13106*//*13106*/nil/*<13106*/)/*<13106*/)/*<11911*/(/*11911*//*13119*/11907/*<13119*/)/*<11911*/)/*<11903*/)/*<11724*/(/*11724*//*11724*//*11724*//*11724*/cons/*<11724*/(/*11724*//*11929*//*11929*//*11930*/$co/*<11930*/(/*11929*//*11931*/{"0":{"0":{"0":"1","1":11934,"type":"cst/identifier"},"1":{"0":{"0":"2","1":11935,"type":"cst/identifier"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"1":11933,"type":"cst/array"}/*<11931*/)/*<11929*/(/*11929*//*11936*//*11936*//*11936*//*13120*/eapp/*<13120*/(/*11936*//*13121*//*13121*//*13121*//*13122*/eapp/*<13122*/(/*13121*//*13123*//*13123*//*13124*/evar/*<13124*/(/*13123*//*13125*/"cons"/*<13125*/)/*<13123*/(/*13123*//*13127*/11933/*<13127*/)/*<13123*/)/*<13121*/(/*13121*//*13128*//*13128*//*13129*/eprim/*<13129*/(/*13128*//*13130*//*13130*//*13131*/pint/*<13131*/(/*13130*//*13132*/1/*<13132*/)/*<13130*/(/*13130*//*13133*/11934/*<13133*/)/*<13130*/)/*<13128*/(/*13128*//*13134*/11934/*<13134*/)/*<13128*/)/*<13121*/(/*13121*//*13135*/11933/*<13135*/)/*<13121*/)/*<11936*/(/*11936*//*13136*//*13136*//*13136*//*13137*/eapp/*<13137*/(/*13136*//*13138*//*13138*//*13138*//*13139*/eapp/*<13139*/(/*13138*//*13140*//*13140*//*13141*/evar/*<13141*/(/*13140*//*13142*/"cons"/*<13142*/)/*<13140*/(/*13140*//*13144*/11933/*<13144*/)/*<13140*/)/*<13138*/(/*13138*//*13145*//*13145*//*13146*/eprim/*<13146*/(/*13145*//*13147*//*13147*//*13148*/pint/*<13148*/(/*13147*//*13149*/2/*<13149*/)/*<13147*/(/*13147*//*13150*/11935/*<13150*/)/*<13147*/)/*<13145*/(/*13145*//*13151*/11935/*<13151*/)/*<13145*/)/*<13138*/(/*13138*//*13152*/11933/*<13152*/)/*<13138*/)/*<13136*/(/*13136*//*13153*//*13153*//*13154*/evar/*<13154*/(/*13153*//*13155*/"nil"/*<13155*/)/*<13153*/(/*13153*//*13157*/11933/*<13157*/)/*<13153*/)/*<13136*/(/*13136*//*13158*/11933/*<13158*/)/*<13136*/)/*<11936*/(/*11936*//*13159*/11933/*<13159*/)/*<11936*/)/*<11929*/)/*<11724*/(/*11724*//*11724*//*11724*//*11724*/cons/*<11724*/(/*11724*//*11977*//*11977*//*11978*/$co/*<11978*/(/*11977*//*11979*/{"0":"12","1":11981,"type":"cst/identifier"}/*<11979*/)/*<11977*/(/*11977*//*11982*//*11982*//*13160*/eprim/*<13160*/(/*11982*//*13161*//*13161*//*13162*/pint/*<13162*/(/*13161*//*13163*/12/*<13163*/)/*<13161*/(/*13161*//*13164*/11981/*<13164*/)/*<13161*/)/*<11982*/(/*11982*//*13165*/11981/*<13165*/)/*<11982*/)/*<11977*/)/*<11724*/(/*11724*//*11724*//*11724*//*11724*/cons/*<11724*/(/*11724*//*11989*//*11989*//*11990*/$co/*<11990*/(/*11989*//*11991*/{"0":{"0":{"0":"match","1":11994,"type":"cst/identifier"},"1":{"0":{"0":"2","1":11995,"type":"cst/identifier"},"1":{"0":{"0":"1","1":11996,"type":"cst/identifier"},"1":{"0":{"0":"2","1":11997,"type":"cst/identifier"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"type":"cons"},"type":"cons"},"1":11993,"type":"cst/list"}/*<11991*/)/*<11989*/(/*11989*//*11998*//*11998*//*11998*//*13166*/ematch/*<13166*/(/*11998*//*13167*//*13167*//*13168*/eprim/*<13168*/(/*13167*//*13169*//*13169*//*13170*/pint/*<13170*/(/*13169*//*13171*/2/*<13171*/)/*<13169*/(/*13169*//*13172*/11995/*<13172*/)/*<13169*/)/*<13167*/(/*13167*//*13173*/11995/*<13173*/)/*<13167*/)/*<11998*/(/*11998*//*13174*//*13174*//*13174*/cons/*<13174*/(/*13174*//*13175*//*13175*//*13176*/$co/*<13176*/(/*13175*//*13177*//*13177*//*13178*/pprim/*<13178*/(/*13177*//*13179*//*13179*//*13180*/pint/*<13180*/(/*13179*//*13181*/1/*<13181*/)/*<13179*/(/*13179*//*13182*/11996/*<13182*/)/*<13179*/)/*<13177*/(/*13177*//*13183*/11996/*<13183*/)/*<13177*/)/*<13175*/(/*13175*//*13184*//*13184*//*13185*/eprim/*<13185*/(/*13184*//*13186*//*13186*//*13187*/pint/*<13187*/(/*13186*//*13188*/2/*<13188*/)/*<13186*/(/*13186*//*13189*/11997/*<13189*/)/*<13186*/)/*<13184*/(/*13184*//*13190*/11997/*<13190*/)/*<13184*/)/*<13175*/)/*<13174*/(/*13174*//*13174*/nil/*<13174*/)/*<13174*/)/*<11998*/(/*11998*//*13191*/11993/*<13191*/)/*<11998*/)/*<11989*/)/*<11724*/(/*11724*//*11724*//*11724*//*11724*/cons/*<11724*/(/*11724*//*12025*//*12025*//*12026*/$co/*<12026*/(/*12025*//*12027*/{"0":"abc","1":12029,"type":"cst/identifier"}/*<12027*/)/*<12025*/(/*12025*//*12030*//*12030*//*13438*/evar/*<13438*/(/*12030*//*13439*/"abc"/*<13439*/)/*<12030*/(/*12030*//*13441*/12029/*<13441*/)/*<12030*/)/*<12025*/)/*<11724*/(/*11724*//*11724*//*11724*//*11724*/cons/*<11724*/(/*11724*//*12035*//*12035*//*12036*/$co/*<12036*/(/*12035*//*12037*/{"0":{"0":{"0":"let","1":12040,"type":"cst/identifier"},"1":{"0":{"0":{"0":{"0":"a","1":12042,"type":"cst/identifier"},"1":{"0":{"0":"1","1":12043,"type":"cst/identifier"},"1":{"0":{"0":"b","1":12044,"type":"cst/identifier"},"1":{"0":{"0":"2","1":12045,"type":"cst/identifier"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"type":"cons"},"type":"cons"},"1":12041,"type":"cst/array"},"1":{"0":{"0":"a","1":12046,"type":"cst/identifier"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"type":"cons"},"1":12039,"type":"cst/list"}/*<12037*/)/*<12035*/(/*12035*//*12047*//*12047*//*12047*//*15680*/elet/*<15680*/(/*12047*//*15681*//*15681*//*15682*/$co/*<15682*/(/*15681*//*15683*/nil/*<15683*/)/*<15681*/(/*15681*//*15684*//*15684*//*15684*/cons/*<15684*/(/*15684*//*15685*//*15685*//*15685*/cons/*<15685*/(/*15685*//*15686*//*15686*//*15687*/$co/*<15687*/(/*15686*//*15688*/"a"/*<15688*/)/*<15686*/(/*15686*//*15690*//*15690*//*15690*/cons/*<15690*/(/*15690*//*15691*//*15691*//*15692*/$co/*<15692*/(/*15691*//*15693*/nil/*<15693*/)/*<15691*/(/*15691*//*15694*//*15694*//*15695*/eprim/*<15695*/(/*15694*//*15696*//*15696*//*15697*/pint/*<15697*/(/*15696*//*15698*/1/*<15698*/)/*<15696*/(/*15696*//*15699*/12043/*<15699*/)/*<15696*/)/*<15694*/(/*15694*//*15700*/12043/*<15700*/)/*<15694*/)/*<15691*/)/*<15690*/(/*15690*//*15690*/nil/*<15690*/)/*<15690*/)/*<15686*/)/*<15685*/(/*15685*//*15685*/nil/*<15685*/)/*<15685*/)/*<15684*/(/*15684*//*15684*/nil/*<15684*/)/*<15684*/)/*<15681*/)/*<12047*/(/*12047*//*15701*//*15701*//*15701*//*15702*/elet/*<15702*/(/*15701*//*15703*//*15703*//*15704*/$co/*<15704*/(/*15703*//*15705*/nil/*<15705*/)/*<15703*/(/*15703*//*15706*//*15706*//*15706*/cons/*<15706*/(/*15706*//*15707*//*15707*//*15707*/cons/*<15707*/(/*15707*//*15708*//*15708*//*15709*/$co/*<15709*/(/*15708*//*15710*/"b"/*<15710*/)/*<15708*/(/*15708*//*15712*//*15712*//*15712*/cons/*<15712*/(/*15712*//*15713*//*15713*//*15714*/$co/*<15714*/(/*15713*//*15715*/nil/*<15715*/)/*<15713*/(/*15713*//*15716*//*15716*//*15717*/eprim/*<15717*/(/*15716*//*15718*//*15718*//*15719*/pint/*<15719*/(/*15718*//*15720*/2/*<15720*/)/*<15718*/(/*15718*//*15721*/12045/*<15721*/)/*<15718*/)/*<15716*/(/*15716*//*15722*/12045/*<15722*/)/*<15716*/)/*<15713*/)/*<15712*/(/*15712*//*15712*/nil/*<15712*/)/*<15712*/)/*<15708*/)/*<15707*/(/*15707*//*15707*/nil/*<15707*/)/*<15707*/)/*<15706*/(/*15706*//*15706*/nil/*<15706*/)/*<15706*/)/*<15703*/)/*<15701*/(/*15701*//*15723*//*15723*//*15724*/evar/*<15724*/(/*15723*//*15725*/"a"/*<15725*/)/*<15723*/(/*15723*//*15727*/12046/*<15727*/)/*<15723*/)/*<15701*/(/*15701*//*15728*/12044/*<15728*/)/*<15701*/)/*<12047*/(/*12047*//*15729*/12042/*<15729*/)/*<12047*/)/*<12035*/)/*<11724*/(/*11724*//*11724*//*11724*//*11724*/cons/*<11724*/(/*11724*//*12082*//*12082*//*12083*/$co/*<12083*/(/*12082*//*12084*/{"0":{"0":{"0":"let->","1":12087,"type":"cst/identifier"},"1":{"0":{"0":{"0":{"0":"v","1":12089,"type":"cst/identifier"},"1":{"0":{"0":"hi","1":12090,"type":"cst/identifier"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"1":12088,"type":"cst/array"},"1":{"0":{"0":"v2","1":12091,"type":"cst/identifier"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"type":"cons"},"1":12086,"type":"cst/list"}/*<12084*/)/*<12082*/(/*12082*//*12092*//*12092*//*12092*//*13442*/eapp/*<13442*/(/*12092*//*13443*//*13443*//*13444*/evar/*<13444*/(/*13443*//*13445*/"hi"/*<13445*/)/*<13443*/(/*13443*//*13447*/12090/*<13447*/)/*<13443*/)/*<12092*/(/*12092*//*13448*//*13448*//*13448*//*13449*/elambda/*<13449*/(/*13448*//*13450*//*13450*//*13451*/pvar/*<13451*/(/*13450*//*13452*/"v"/*<13452*/)/*<13450*/(/*13450*//*13454*/12089/*<13454*/)/*<13450*/)/*<13448*/(/*13448*//*13455*//*13455*//*13456*/evar/*<13456*/(/*13455*//*13457*/"v2"/*<13457*/)/*<13455*/(/*13455*//*13459*/12091/*<13459*/)/*<13455*/)/*<13448*/(/*13448*//*13460*/12086/*<13460*/)/*<13448*/)/*<12092*/(/*12092*//*13461*/12086/*<13461*/)/*<12092*/)/*<12082*/)/*<11724*/(/*11724*//*11724*//*11724*//*11724*/cons/*<11724*/(/*11724*//*12127*//*12127*//*12128*/$co/*<12128*/(/*12127*//*12129*/{"0":{"0":{"0":"fn","1":12132,"type":"cst/identifier"},"1":{"0":{"0":{"0":{"0":"a","1":12134,"type":"cst/identifier"},"1":{"type":"nil"},"type":"cons"},"1":12133,"type":"cst/array"},"1":{"0":{"0":"1","1":12135,"type":"cst/identifier"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"type":"cons"},"1":12131,"type":"cst/list"}/*<12129*/)/*<12127*/(/*12127*//*12136*//*12136*//*12136*//*13462*/elambda/*<13462*/(/*12136*//*13463*//*13463*//*13464*/pvar/*<13464*/(/*13463*//*13465*/"a"/*<13465*/)/*<13463*/(/*13463*//*13467*/12134/*<13467*/)/*<13463*/)/*<12136*/(/*12136*//*13468*//*13468*//*13469*/eprim/*<13469*/(/*13468*//*13470*//*13470*//*13471*/pint/*<13471*/(/*13470*//*13472*/1/*<13472*/)/*<13470*/(/*13470*//*13473*/12135/*<13473*/)/*<13470*/)/*<13468*/(/*13468*//*13474*/12135/*<13474*/)/*<13468*/)/*<12136*/(/*12136*//*13475*/12131/*<13475*/)/*<12136*/)/*<12127*/)/*<11724*/(/*11724*//*11724*//*11724*//*11724*/cons/*<11724*/(/*11724*//*12149*//*12149*//*12150*/$co/*<12150*/(/*12149*//*12151*/{"0":{"0":{"0":"fn","1":12154,"type":"cst/identifier"},"1":{"0":{"0":{"0":{"0":"a","1":12156,"type":"cst/identifier"},"1":{"0":{"0":"b","1":12157,"type":"cst/identifier"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"1":12155,"type":"cst/array"},"1":{"0":{"0":"2","1":12158,"type":"cst/identifier"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"type":"cons"},"1":12153,"type":"cst/list"}/*<12151*/)/*<12149*/(/*12149*//*12159*//*12159*//*12159*//*13476*/elambda/*<13476*/(/*12159*//*13477*//*13477*//*13478*/pvar/*<13478*/(/*13477*//*13479*/"a"/*<13479*/)/*<13477*/(/*13477*//*13481*/12156/*<13481*/)/*<13477*/)/*<12159*/(/*12159*//*13482*//*13482*//*13482*//*13483*/elambda/*<13483*/(/*13482*//*13484*//*13484*//*13485*/pvar/*<13485*/(/*13484*//*13486*/"b"/*<13486*/)/*<13484*/(/*13484*//*13488*/12157/*<13488*/)/*<13484*/)/*<13482*/(/*13482*//*13489*//*13489*//*13490*/eprim/*<13490*/(/*13489*//*13491*//*13491*//*13492*/pint/*<13492*/(/*13491*//*13493*/2/*<13493*/)/*<13491*/(/*13491*//*13494*/12158/*<13494*/)/*<13491*/)/*<13489*/(/*13489*//*13495*/12158/*<13495*/)/*<13489*/)/*<13482*/(/*13482*//*13496*/12153/*<13496*/)/*<13482*/)/*<12159*/(/*12159*//*13497*/12153/*<13497*/)/*<12159*/)/*<12149*/)/*<11724*/(/*11724*//*11724*//*11724*//*11724*/cons/*<11724*/(/*11724*//*12178*//*12178*//*12179*/$co/*<12179*/(/*12178*//*12180*/{"0":{"0":{"0":"fn","1":12183,"type":"cst/identifier"},"1":{"0":{"0":{"0":{"0":{"0":{"0":",","1":12186,"type":"cst/identifier"},"1":{"0":{"0":"a","1":12187,"type":"cst/identifier"},"1":{"0":{"0":"b","1":12188,"type":"cst/identifier"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"type":"cons"},"1":12185,"type":"cst/list"},"1":{"type":"nil"},"type":"cons"},"1":12184,"type":"cst/array"},"1":{"0":{"0":"a","1":12189,"type":"cst/identifier"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"type":"cons"},"1":12182,"type":"cst/list"}/*<12180*/)/*<12178*/(/*12178*//*12190*//*12190*//*12190*//*13498*/elambda/*<13498*/(/*12190*//*13499*//*13499*//*13499*//*13500*/pcon/*<13500*/(/*13499*//*13501*/","/*<13501*/)/*<13499*/(/*13499*//*13503*//*13503*//*13503*/cons/*<13503*/(/*13503*//*13504*//*13504*//*13505*/pvar/*<13505*/(/*13504*//*13506*/"a"/*<13506*/)/*<13504*/(/*13504*//*13508*/12187/*<13508*/)/*<13504*/)/*<13503*/(/*13503*//*13503*//*13503*//*13503*/cons/*<13503*/(/*13503*//*13509*//*13509*//*13510*/pvar/*<13510*/(/*13509*//*13511*/"b"/*<13511*/)/*<13509*/(/*13509*//*13513*/12188/*<13513*/)/*<13509*/)/*<13503*/(/*13503*//*13503*/nil/*<13503*/)/*<13503*/)/*<13503*/)/*<13499*/(/*13499*//*13514*/12185/*<13514*/)/*<13499*/)/*<12190*/(/*12190*//*13515*//*13515*//*13516*/evar/*<13516*/(/*13515*//*13517*/"a"/*<13517*/)/*<13515*/(/*13515*//*13519*/12189/*<13519*/)/*<13515*/)/*<12190*/(/*12190*//*13520*/12182/*<13520*/)/*<12190*/)/*<12178*/)/*<11724*/(/*11724*//*11724*//*11724*//*11724*/cons/*<11724*/(/*11724*//*12228*//*12228*//*12229*/$co/*<12229*/(/*12228*//*12230*/{"0":{"0":{"0":"+","1":12233,"type":"cst/identifier"},"1":{"0":{"0":"1","1":12234,"type":"cst/identifier"},"1":{"0":{"0":"2","1":12235,"type":"cst/identifier"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"type":"cons"},"1":12232,"type":"cst/list"}/*<12230*/)/*<12228*/(/*12228*//*12236*//*12236*//*12236*//*13521*/eapp/*<13521*/(/*12236*//*13522*//*13522*//*13522*//*13523*/eapp/*<13523*/(/*13522*//*13524*//*13524*//*13525*/evar/*<13525*/(/*13524*//*13526*/"+"/*<13526*/)/*<13524*/(/*13524*//*13528*/12233/*<13528*/)/*<13524*/)/*<13522*/(/*13522*//*13529*//*13529*//*13530*/eprim/*<13530*/(/*13529*//*13531*//*13531*//*13532*/pint/*<13532*/(/*13531*//*13533*/1/*<13533*/)/*<13531*/(/*13531*//*13534*/12234/*<13534*/)/*<13531*/)/*<13529*/(/*13529*//*13535*/12234/*<13535*/)/*<13529*/)/*<13522*/(/*13522*//*13536*/12232/*<13536*/)/*<13522*/)/*<12236*/(/*12236*//*13537*//*13537*//*13538*/eprim/*<13538*/(/*13537*//*13539*//*13539*//*13540*/pint/*<13540*/(/*13539*//*13541*/2/*<13541*/)/*<13539*/(/*13539*//*13542*/12235/*<13542*/)/*<13539*/)/*<13537*/(/*13537*//*13543*/12235/*<13543*/)/*<13537*/)/*<12236*/(/*12236*//*13544*/12232/*<13544*/)/*<12236*/)/*<12228*/)/*<11724*/(/*11724*//*11724*//*11724*//*11724*/cons/*<11724*/(/*11724*//*12261*//*12261*//*12262*/$co/*<12262*/(/*12261*//*12263*/{"0":{"0":{"0":"int-to-string","1":12266,"type":"cst/identifier"},"1":{"0":{"0":"23","1":12267,"type":"cst/identifier"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"1":12265,"type":"cst/list"}/*<12263*/)/*<12261*/(/*12261*//*12268*//*12268*//*12268*//*13545*/eapp/*<13545*/(/*12268*//*13546*//*13546*//*13547*/evar/*<13547*/(/*13546*//*13548*/"int-to-string"/*<13548*/)/*<13546*/(/*13546*//*13550*/12266/*<13550*/)/*<13546*/)/*<12268*/(/*12268*//*13551*//*13551*//*13552*/eprim/*<13552*/(/*13551*//*13553*//*13553*//*13554*/pint/*<13554*/(/*13553*//*13555*/23/*<13555*/)/*<13553*/(/*13553*//*13556*/12267/*<13556*/)/*<13553*/)/*<13551*/(/*13551*//*13557*/12267/*<13557*/)/*<13551*/)/*<12268*/(/*12268*//*13558*/12265/*<13558*/)/*<12268*/)/*<12261*/)/*<11724*/(/*11724*//*11724*//*11724*//*11724*/cons/*<11724*/(/*11724*//*12283*//*12283*//*12284*/$co/*<12284*/(/*12283*//*12285*/{"0":{"0":{"0":"let","1":12288,"type":"cst/identifier"},"1":{"0":{"0":{"0":{"0":"x","1":12290,"type":"cst/identifier"},"1":{"0":{"0":"2","1":12291,"type":"cst/identifier"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"1":12289,"type":"cst/array"},"1":{"0":{"0":"x","1":12292,"type":"cst/identifier"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"type":"cons"},"1":12287,"type":"cst/list"}/*<12285*/)/*<12283*/(/*12283*//*12293*//*12293*//*12293*//*15730*/elet/*<15730*/(/*12293*//*15731*//*15731*//*15732*/$co/*<15732*/(/*15731*//*15733*/nil/*<15733*/)/*<15731*/(/*15731*//*15734*//*15734*//*15734*/cons/*<15734*/(/*15734*//*15735*//*15735*//*15735*/cons/*<15735*/(/*15735*//*15736*//*15736*//*15737*/$co/*<15737*/(/*15736*//*15738*/"x"/*<15738*/)/*<15736*/(/*15736*//*15740*//*15740*//*15740*/cons/*<15740*/(/*15740*//*15741*//*15741*//*15742*/$co/*<15742*/(/*15741*//*15743*/nil/*<15743*/)/*<15741*/(/*15741*//*15744*//*15744*//*15745*/eprim/*<15745*/(/*15744*//*15746*//*15746*//*15747*/pint/*<15747*/(/*15746*//*15748*/2/*<15748*/)/*<15746*/(/*15746*//*15749*/12291/*<15749*/)/*<15746*/)/*<15744*/(/*15744*//*15750*/12291/*<15750*/)/*<15744*/)/*<15741*/)/*<15740*/(/*15740*//*15740*/nil/*<15740*/)/*<15740*/)/*<15736*/)/*<15735*/(/*15735*//*15735*/nil/*<15735*/)/*<15735*/)/*<15734*/(/*15734*//*15734*/nil/*<15734*/)/*<15734*/)/*<15731*/)/*<12293*/(/*12293*//*15751*//*15751*//*15752*/evar/*<15752*/(/*15751*//*15753*/"x"/*<15753*/)/*<15751*/(/*15751*//*15755*/12292/*<15755*/)/*<15751*/)/*<12293*/(/*12293*//*15756*/12290/*<15756*/)/*<12293*/)/*<12283*/)/*<11724*/(/*11724*//*11724*//*11724*//*11724*/cons/*<11724*/(/*11724*//*12314*/$co/*<12314*/)/*<11724*/(/*11724*//*11724*//*11724*//*11724*/cons/*<11724*/(/*11724*//*12380*//*12380*//*12381*/$co/*<12381*/(/*12380*//*12382*/{"0":{"0":{"0":"@@","1":12385,"type":"cst/identifier"},"1":{"0":{"0":"1","1":12386,"type":"cst/identifier"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"1":12384,"type":"cst/list"}/*<12382*/)/*<12380*/(/*12380*//*12387*//*12387*//*13634*/equotquot/*<13634*/(/*12387*//*13635*//*13635*//*13636*/cst$slidentifier/*<13636*/(/*13635*//*13637*/"1"/*<13637*/)/*<13635*/(/*13635*//*13639*/12386/*<13639*/)/*<13635*/)/*<12387*/(/*12387*//*13640*/12384/*<13640*/)/*<12387*/)/*<12380*/)/*<11724*/(/*11724*//*11724*//*11724*//*11724*/cons/*<11724*/(/*11724*//*12395*//*12395*//*12396*/$co/*<12396*/(/*12395*//*12397*/{"0":{"0":{"0":"@","1":12400,"type":"cst/identifier"},"1":{"0":{"0":"1","1":12401,"type":"cst/identifier"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"1":12399,"type":"cst/list"}/*<12397*/)/*<12395*/(/*12395*//*12402*//*12402*//*13641*/equot/*<13641*/(/*12402*//*13642*//*13642*//*13643*/eprim/*<13643*/(/*13642*//*13644*//*13644*//*13645*/pint/*<13645*/(/*13644*//*13646*/1/*<13646*/)/*<13644*/(/*13644*//*13647*/12401/*<13647*/)/*<13644*/)/*<13642*/(/*13642*//*13648*/12401/*<13648*/)/*<13642*/)/*<12402*/(/*12402*//*13649*/12399/*<13649*/)/*<12402*/)/*<12395*/)/*<11724*/(/*11724*//*11724*/nil/*<11724*/)/*<11724*/)/*<11724*/)/*<11724*/)/*<11724*/)/*<11724*/)/*<11724*/)/*<11724*/)/*<11724*/)/*<11724*/)/*<11724*/)/*<11724*/)/*<11724*/)/*<11724*/)/*<11724*/)/*<11724*/)/*<11724*/)/*<11724*/)/*<11724*/)/*<11724*/)/*<11724*/)/*<11724*/)/*<11724*/)/*<11724*/)/*<11721*/
/*12413*//*12414*/parse_expr/*<12414*/(/*12413*//*12415*/{"0":{"0":{"0":"fn","1":12418,"type":"cst/identifier"},"1":{"0":{"0":{"0":{"0":"a","1":12420,"type":"cst/identifier"},"1":{"type":"nil"},"type":"cons"},"1":12419,"type":"cst/array"},"1":{"0":{"0":"1","1":12421,"type":"cst/identifier"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"type":"cons"},"1":12417,"type":"cst/list"}/*<12415*/)/*<12413*/
/*12698*//*12698*//*12699*/$co/*<12699*/(/*12698*//*12700*/parse_stmt/*<12700*/)/*<12698*/(/*12698*//*12701*//*12701*//*12701*/cons/*<12701*/(/*12701*//*12702*//*12702*//*12703*/$co/*<12703*/(/*12702*//*12704*/{"0":{"0":{"0":"def","1":12707,"type":"cst/identifier"},"1":{"0":{"0":"a","1":12708,"type":"cst/identifier"},"1":{"0":{"0":"2","1":12709,"type":"cst/identifier"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"type":"cons"},"1":12706,"type":"cst/list"}/*<12704*/)/*<12702*/(/*12702*//*12710*//*12710*//*12710*//*12710*//*13200*/sdef/*<13200*/(/*12710*//*13201*/"a"/*<13201*/)/*<12710*/(/*12710*//*13203*/12708/*<13203*/)/*<12710*/(/*12710*//*13204*//*13204*//*13205*/eprim/*<13205*/(/*13204*//*13206*//*13206*//*13207*/pint/*<13207*/(/*13206*//*13208*/2/*<13208*/)/*<13206*/(/*13206*//*13209*/12709/*<13209*/)/*<13206*/)/*<13204*/(/*13204*//*13210*/12709/*<13210*/)/*<13204*/)/*<12710*/(/*12710*//*13211*/12706/*<13211*/)/*<12710*/)/*<12702*/)/*<12701*/(/*12701*//*12701*//*12701*//*12701*/cons/*<12701*/(/*12701*//*12723*//*12723*//*12724*/$co/*<12724*/(/*12723*//*12725*/{"0":{"0":{"0":"deftype","1":12728,"type":"cst/identifier"},"1":{"0":{"0":"what","1":12729,"type":"cst/identifier"},"1":{"0":{"0":{"0":{"0":"one","1":12731,"type":"cst/identifier"},"1":{"0":{"0":"int","1":12732,"type":"cst/identifier"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"1":12730,"type":"cst/list"},"1":{"0":{"0":{"0":{"0":"two","1":12734,"type":"cst/identifier"},"1":{"0":{"0":"bool","1":12735,"type":"cst/identifier"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"1":12733,"type":"cst/list"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"type":"cons"},"type":"cons"},"1":12727,"type":"cst/list"}/*<12725*/)/*<12723*/(/*12723*//*12736*//*12736*//*12736*//*12736*//*12736*//*13212*/sdeftype/*<13212*/(/*12736*//*13213*/"what"/*<13213*/)/*<12736*/(/*12736*//*13215*/12729/*<13215*/)/*<12736*/(/*12736*//*13216*/nil/*<13216*/)/*<12736*/(/*12736*//*13217*//*13217*//*13217*/cons/*<13217*/(/*13217*//*13218*//*13218*//*13218*//*13218*//*13219*/$co$co$co/*<13219*/(/*13218*//*13220*/"one"/*<13220*/)/*<13218*/(/*13218*//*13222*/12731/*<13222*/)/*<13218*/(/*13218*//*13223*//*13223*//*13223*/cons/*<13223*/(/*13223*//*13224*//*13224*//*13225*/tcon/*<13225*/(/*13224*//*13226*//*13226*//*13227*/tycon/*<13227*/(/*13226*//*13228*/"int"/*<13228*/)/*<13226*/(/*13226*//*13231*/star/*<13231*/)/*<13226*/)/*<13224*/(/*13224*//*13232*/12732/*<13232*/)/*<13224*/)/*<13223*/(/*13223*//*13223*/nil/*<13223*/)/*<13223*/)/*<13218*/(/*13218*//*13233*/12730/*<13233*/)/*<13218*/)/*<13217*/(/*13217*//*13217*//*13217*//*13217*/cons/*<13217*/(/*13217*//*13234*//*13234*//*13234*//*13234*//*13235*/$co$co$co/*<13235*/(/*13234*//*13236*/"two"/*<13236*/)/*<13234*/(/*13234*//*13238*/12734/*<13238*/)/*<13234*/(/*13234*//*13239*//*13239*//*13239*/cons/*<13239*/(/*13239*//*13240*//*13240*//*13241*/tcon/*<13241*/(/*13240*//*13242*//*13242*//*13243*/tycon/*<13243*/(/*13242*//*13244*/"bool"/*<13244*/)/*<13242*/(/*13242*//*13247*/star/*<13247*/)/*<13242*/)/*<13240*/(/*13240*//*13248*/12735/*<13248*/)/*<13240*/)/*<13239*/(/*13239*//*13239*/nil/*<13239*/)/*<13239*/)/*<13234*/(/*13234*//*13249*/12733/*<13249*/)/*<13234*/)/*<13217*/(/*13217*//*13217*/nil/*<13217*/)/*<13217*/)/*<13217*/)/*<12736*/(/*12736*//*13250*/12727/*<13250*/)/*<12736*/)/*<12723*/)/*<12701*/(/*12701*//*12701*//*12701*//*12701*/cons/*<12701*/(/*12701*//*12768*//*12768*//*12769*/$co/*<12769*/(/*12768*//*12770*/{"0":{"0":{"0":"deftype","1":12773,"type":"cst/identifier"},"1":{"0":{"0":{"0":{"0":"array","1":12775,"type":"cst/identifier"},"1":{"0":{"0":"a","1":12776,"type":"cst/identifier"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"1":12774,"type":"cst/list"},"1":{"0":{"0":{"0":{"0":"nil","1":12778,"type":"cst/identifier"},"1":{"type":"nil"},"type":"cons"},"1":12777,"type":"cst/list"},"1":{"0":{"0":{"0":{"0":"cons","1":12780,"type":"cst/identifier"},"1":{"0":{"0":{"0":{"0":"array","1":12782,"type":"cst/identifier"},"1":{"0":{"0":"a","1":12783,"type":"cst/identifier"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"1":12781,"type":"cst/list"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"1":12779,"type":"cst/list"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"type":"cons"},"type":"cons"},"1":12772,"type":"cst/list"}/*<12770*/)/*<12768*/(/*12768*//*12784*//*12784*//*12784*//*12784*//*12784*//*13251*/sdeftype/*<13251*/(/*12784*//*13252*/"array"/*<13252*/)/*<12784*/(/*12784*//*13254*/12775/*<13254*/)/*<12784*/(/*12784*//*13255*//*13255*//*13255*/cons/*<13255*/(/*13255*//*13256*//*13256*//*13257*/$co/*<13257*/(/*13256*//*13258*/"a"/*<13258*/)/*<13256*/(/*13256*//*13260*/12776/*<13260*/)/*<13256*/)/*<13255*/(/*13255*//*13255*/nil/*<13255*/)/*<13255*/)/*<12784*/(/*12784*//*13261*//*13261*//*13261*/cons/*<13261*/(/*13261*//*13262*//*13262*//*13262*//*13262*//*13263*/$co$co$co/*<13263*/(/*13262*//*13264*/"nil"/*<13264*/)/*<13262*/(/*13262*//*13266*/12778/*<13266*/)/*<13262*/(/*13262*//*13267*/nil/*<13267*/)/*<13262*/(/*13262*//*13268*/12777/*<13268*/)/*<13262*/)/*<13261*/(/*13261*//*13261*//*13261*//*13261*/cons/*<13261*/(/*13261*//*13269*//*13269*//*13269*//*13269*//*13270*/$co$co$co/*<13270*/(/*13269*//*13271*/"cons"/*<13271*/)/*<13269*/(/*13269*//*13273*/12780/*<13273*/)/*<13269*/(/*13269*//*13274*//*13274*//*13274*/cons/*<13274*/(/*13274*//*13275*//*13275*//*13275*//*13276*/tapp/*<13276*/(/*13275*//*13277*//*13277*//*13278*/tcon/*<13278*/(/*13277*//*13279*//*13279*//*13280*/tycon/*<13280*/(/*13279*//*13281*/"array"/*<13281*/)/*<13279*/(/*13279*//*13284*/star/*<13284*/)/*<13279*/)/*<13277*/(/*13277*//*13285*/12782/*<13285*/)/*<13277*/)/*<13275*/(/*13275*//*13286*//*13286*//*13287*/tcon/*<13287*/(/*13286*//*13288*//*13288*//*13289*/tycon/*<13289*/(/*13288*//*13290*/"a"/*<13290*/)/*<13288*/(/*13288*//*13293*/star/*<13293*/)/*<13288*/)/*<13286*/(/*13286*//*13294*/12783/*<13294*/)/*<13286*/)/*<13275*/(/*13275*//*13295*/12781/*<13295*/)/*<13275*/)/*<13274*/(/*13274*//*13274*/nil/*<13274*/)/*<13274*/)/*<13269*/(/*13269*//*13296*/12779/*<13296*/)/*<13269*/)/*<13261*/(/*13261*//*13261*/nil/*<13261*/)/*<13261*/)/*<13261*/)/*<12784*/(/*12784*//*13297*/12772/*<13297*/)/*<12784*/)/*<12768*/)/*<12701*/(/*12701*//*12701*//*12701*//*12701*/cons/*<12701*/(/*12701*//*12824*//*12824*//*12825*/$co/*<12825*/(/*12824*//*12826*/{"0":{"0":{"0":"+","1":12829,"type":"cst/identifier"},"1":{"0":{"0":"1","1":12830,"type":"cst/identifier"},"1":{"0":{"0":"2","1":12831,"type":"cst/identifier"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"type":"cons"},"1":12828,"type":"cst/list"}/*<12826*/)/*<12824*/(/*12824*//*12832*//*12832*//*13298*/sexpr/*<13298*/(/*12832*//*13299*//*13299*//*13299*//*13300*/eapp/*<13300*/(/*13299*//*13301*//*13301*//*13301*//*13302*/eapp/*<13302*/(/*13301*//*13303*//*13303*//*13304*/evar/*<13304*/(/*13303*//*13305*/"+"/*<13305*/)/*<13303*/(/*13303*//*13307*/12829/*<13307*/)/*<13303*/)/*<13301*/(/*13301*//*13308*//*13308*//*13309*/eprim/*<13309*/(/*13308*//*13310*//*13310*//*13311*/pint/*<13311*/(/*13310*//*13312*/1/*<13312*/)/*<13310*/(/*13310*//*13313*/12830/*<13313*/)/*<13310*/)/*<13308*/(/*13308*//*13314*/12830/*<13314*/)/*<13308*/)/*<13301*/(/*13301*//*13315*/12828/*<13315*/)/*<13301*/)/*<13299*/(/*13299*//*13316*//*13316*//*13317*/eprim/*<13317*/(/*13316*//*13318*//*13318*//*13319*/pint/*<13319*/(/*13318*//*13320*/2/*<13320*/)/*<13318*/(/*13318*//*13321*/12831/*<13321*/)/*<13318*/)/*<13316*/(/*13316*//*13322*/12831/*<13322*/)/*<13316*/)/*<13299*/(/*13299*//*13323*/12828/*<13323*/)/*<13299*/)/*<12832*/(/*12832*//*13324*/12828/*<13324*/)/*<12832*/)/*<12824*/)/*<12701*/(/*12701*//*12701*//*12701*//*12701*/cons/*<12701*/(/*12701*//*12860*//*12860*//*12861*/$co/*<12861*/(/*12860*//*12862*/{"0":{"0":{"0":"defn","1":12865,"type":"cst/identifier"},"1":{"0":{"0":"a","1":12866,"type":"cst/identifier"},"1":{"0":{"0":{"0":{"0":"m","1":12868,"type":"cst/identifier"},"1":{"type":"nil"},"type":"cons"},"1":12867,"type":"cst/array"},"1":{"0":{"0":"m","1":12869,"type":"cst/identifier"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"type":"cons"},"type":"cons"},"1":12864,"type":"cst/list"}/*<12862*/)/*<12860*/(/*12860*//*12870*//*12870*//*12870*//*12870*//*15759*/sdef/*<15759*/(/*12870*//*15760*/"a"/*<15760*/)/*<12870*/(/*12870*//*15762*/12866/*<15762*/)/*<12870*/(/*12870*//*15763*//*15763*//*15763*//*15764*/elambda/*<15764*/(/*15763*//*15765*//*15765*//*15766*/pvar/*<15766*/(/*15765*//*15767*/"m"/*<15767*/)/*<15765*/(/*15765*//*15769*/12868/*<15769*/)/*<15765*/)/*<15763*/(/*15763*//*15770*//*15770*//*15771*/evar/*<15771*/(/*15770*//*15772*/"m"/*<15772*/)/*<15770*/(/*15770*//*15774*/12869/*<15774*/)/*<15770*/)/*<15763*/(/*15763*//*15775*/12864/*<15775*/)/*<15763*/)/*<12870*/(/*12870*//*15776*/12864/*<15776*/)/*<12870*/)/*<12860*/)/*<12701*/(/*12701*//*12701*/nil/*<12701*/)/*<12701*/)/*<12701*/)/*<12701*/)/*<12701*/)/*<12701*/)/*<12698*/
const split = /*13730*/function name_13730(ce) { return /*13730*/function name_13730(fs) { return /*13730*/function name_13730(gs) { return /*13730*/function name_13730(ps) { return /*13739*//*13781*//*13782*/ti_then/*<13782*/(/*13781*//*13808*//*13809*/ti_from_result/*<13809*/(/*13808*//*13743*//*13743*//*13744*/reduce/*<13744*/(/*13743*//*13745*/ce/*<13745*/)/*<13743*/(/*13743*//*13746*/ps/*<13746*/)/*<13743*/)/*<13808*/)/*<13781*/(/*13739*//*13739*/function name_13739($let) { return /*13739*/(function match_13739($target) {
{
let ps$qu = $target;
return /*13739*//*13784*//*13785*/ti_then/*<13785*/(/*13784*//*13786*//*13787*/ti_return/*<13787*/(/*13786*//*13754*//*13754*//*13755*/partition/*<13755*/(/*13754*//*13756*/ps$qu/*<13756*/)/*<13754*/(/*13754*//*13757*/function name_13757($fn_arg) { return /*13757*/(function match_13757($target) {
if ($target.type === "isin") {
{
let name = $target[0];
{
let type = $target[1];
return /*13761*//*13761*//*13766*/every/*<13766*/(/*13761*//*13936*//*13937*/set$slto_list/*<13937*/(/*13936*//*13767*//*13768*/type$sltv/*<13768*/(/*13767*//*13769*/type/*<13769*/)/*<13767*/)/*<13936*/)/*<13761*/(/*13761*//*13770*/function name_13770(x) { return /*13774*//*13774*//*13774*//*13775*/contains/*<13775*/(/*13774*//*13776*/fs/*<13776*/)/*<13774*/(/*13774*//*13777*/x/*<13777*/)/*<13774*/(/*13774*//*13778*/tyvar$eq/*<13778*/)/*<13774*/ }/*<13770*/)/*<13761*/
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 13757');})(/*!*//*-1*/$fn_arg/*<-1*/)/*<13757*/ }/*<13757*/)/*<13754*/)/*<13786*/)/*<13784*/(/*13739*//*13739*/function name_13739($let) { return /*13739*/(function match_13739($target) {
if ($target.type === ",") {
{
let ds = $target[0];
{
let rs = $target[1];
return /*13739*//*13789*//*13790*/ti_then/*<13790*/(/*13789*//*14754*//*14755*/ti_from_result/*<14755*/(/*14754*//*13791*//*13791*//*13791*//*13792*/defaultedPreds/*<13792*/(/*13791*//*13793*/ce/*<13793*/)/*<13791*/(/*13791*//*13794*//*13795*/concat/*<13795*/(/*13794*//*13796*//*13796*//*13796*/cons/*<13796*/(/*13796*//*13797*/fs/*<13797*/)/*<13796*/(/*13796*//*13796*//*13796*//*13796*/cons/*<13796*/(/*13796*//*13798*/gs/*<13798*/)/*<13796*/(/*13796*//*13796*/nil/*<13796*/)/*<13796*/)/*<13796*/)/*<13794*/)/*<13791*/(/*13791*//*13799*/rs/*<13799*/)/*<13791*/)/*<14754*/)/*<13789*/(/*13739*//*13739*/function name_13739($let) { return /*13739*/(function match_13739($target) {
{
let rs$qu = $target;
return /*13779*//*13800*/ti_return/*<13800*/(/*13779*//*13801*//*13801*//*13802*/$co/*<13802*/(/*13801*//*13803*/ds/*<13803*/)/*<13801*/(/*13801*//*13804*//*13804*//*13804*//*13805*/without/*<13805*/(/*13804*//*13806*/rs/*<13806*/)/*<13804*/(/*13804*//*13807*/rs$qu/*<13807*/)/*<13804*/(/*13804*//*14331*/pred$eq/*<14331*/)/*<13804*/)/*<13801*/)/*<13779*/
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 13739');})(/*!*//*-1*/$let/*<-1*/)/*<13739*/ }/*<13739*/)/*<13739*/
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 13739');})(/*!*//*-1*/$let/*<-1*/)/*<13739*/ }/*<13739*/)/*<13739*/
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 13739');})(/*!*//*-1*/$let/*<-1*/)/*<13739*/ }/*<13739*/)/*<13739*/ }/*<13730*/ }/*<13730*/ }/*<13730*/ }/*<13730*/;

const infer$slprim = /*9595*/function name_9595(prim) { return /*9601*/(function match_9601($target) {
if ($target.type === "pbool") {
return /*9615*//*9616*/ti_return/*<9616*/(/*9615*//*9608*//*9608*//*9612*/$co/*<9612*/(/*9608*//*9613*/nil/*<9613*/)/*<9608*/(/*9608*//*9614*/tbool/*<9614*/)/*<9608*/)/*<9615*/
}
if ($target.type === "pint") {
return /*9767*//*9771*//*9821*/ntv/*<9821*/(/*9771*//*9822*/star/*<9822*/)/*<9771*/(/*9767*//*9767*/function name_9767($let) { return /*9767*/(function match_9767($target) {
{
let v = $target;
return /*9776*//*9777*/ti_return/*<9777*/(/*9776*//*9778*//*9778*//*9779*/$co/*<9779*/(/*9778*//*9780*//*9780*//*9780*/cons/*<9780*/(/*9780*//*9781*//*9781*//*9782*/isin/*<9782*/(/*9781*//*9783*/"num"/*<9783*/)/*<9781*/(/*9781*//*9785*/v/*<9785*/)/*<9781*/)/*<9780*/(/*9780*//*9780*/nil/*<9780*/)/*<9780*/)/*<9778*/(/*9778*//*9786*/v/*<9786*/)/*<9778*/)/*<9776*/
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 9767');})(/*!*//*-1*/$let/*<-1*/)/*<9767*/ }/*<9767*/)/*<9767*/
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 9601');})(/*!*//*9603*/prim/*<9603*/)/*<9601*/ }/*<9595*/;

const infer$slpat = /*9727*/function name_9727(pat) { return /*9791*/(function match_9791($target) {
if ($target.type === "pvar") {
{
let name = $target[0];
{
let l = $target[1];
return /*9797*//*9806*//*9823*/ntv/*<9823*/(/*9806*//*9824*/star/*<9824*/)/*<9806*/(/*9797*//*9797*/function name_9797($let) { return /*9797*/(function match_9797($target) {
{
let v = $target;
return /*9825*//*9827*/ti_return/*<9827*/(/*9825*//*9828*//*9828*//*9828*//*9829*/$co$co/*<9829*/(/*9828*//*9830*/nil/*<9830*/)/*<9828*/(/*9828*//*9831*//*9831*//*9831*/cons/*<9831*/(/*9831*//*9832*//*9832*//*9833*/$ex$gt$ex/*<9833*/(/*9832*//*9834*/name/*<9834*/)/*<9832*/(/*9832*//*9835*//*9836*/to_scheme/*<9836*/(/*9835*//*9837*/v/*<9837*/)/*<9835*/)/*<9832*/)/*<9831*/(/*9831*//*9831*/nil/*<9831*/)/*<9831*/)/*<9828*/(/*9828*//*9838*/v/*<9838*/)/*<9828*/)/*<9825*/
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 9797');})(/*!*//*-1*/$let/*<-1*/)/*<9797*/ }/*<9797*/)/*<9797*/
}
}
}
if ($target.type === "pany") {
{
let l = $target[0];
return /*9842*//*9847*//*9848*/ntv/*<9848*/(/*9847*//*9849*/star/*<9849*/)/*<9847*/(/*9842*//*9842*/function name_9842($let) { return /*9842*/(function match_9842($target) {
{
let v = $target;
return /*9850*//*9851*/ti_return/*<9851*/(/*9850*//*9852*//*9852*//*9852*//*9853*/$co$co/*<9853*/(/*9852*//*9854*/nil/*<9854*/)/*<9852*/(/*9852*//*9855*/nil/*<9855*/)/*<9852*/(/*9852*//*9856*/v/*<9856*/)/*<9852*/)/*<9850*/
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 9842');})(/*!*//*-1*/$let/*<-1*/)/*<9842*/ }/*<9842*/)/*<9842*/
}
}
if ($target.type === "pprim") {
{
let prim = $target[0];
{
let l = $target[1];
return /*9862*//*9869*//*9870*/ti_then/*<9870*/(/*9869*//*9871*//*9873*/infer$slprim/*<9873*/(/*9871*//*9874*/prim/*<9874*/)/*<9871*/)/*<9869*/(/*9862*//*9862*/function name_9862($let) { return /*9862*/(function match_9862($target) {
if ($target.type === ",") {
{
let ps = $target[0];
{
let t = $target[1];
return /*9875*//*9876*/ti_return/*<9876*/(/*9875*//*9877*//*9877*//*9877*//*9878*/$co$co/*<9878*/(/*9877*//*9879*/ps/*<9879*/)/*<9877*/(/*9877*//*9880*/nil/*<9880*/)/*<9877*/(/*9877*//*9881*/t/*<9881*/)/*<9877*/)/*<9875*/
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 9862');})(/*!*//*-1*/$let/*<-1*/)/*<9862*/ }/*<9862*/)/*<9862*/
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
return /*9887*//*9925*/TI/*<9925*/(/*9887*//*9926*/function name_9926(subst) { return /*9926*/function name_9926(tenv) { return /*9926*/function name_9926(nidx) { return /*9932*/(function match_9932($target) {
if ($target.type === "none") {
return /*9966*//*9967*/fatal/*<9967*/(/*9966*//*9968*/`Unknonwn constructor ${/*9972*/name/*<9972*/}`/*<9968*/)/*<9966*/
}
if ($target.type === "some") {
{
let scheme = $target[0];
return /*10157*//*10157*//*10157*//*10157*//*10158*/ti_run/*<10158*/(/*10157*//*9977*//*9985*//*9986*/ti_then/*<9986*/(/*9985*//*9987*//*9988*/infer$slpats/*<9988*/(/*9987*//*9989*/patterns/*<9989*/)/*<9987*/)/*<9985*/(/*9977*//*9977*/function name_9977($let) { return /*9977*/(function match_9977($target) {
if ($target.type === ",,") {
{
let ps = $target[0];
{
let as = $target[1];
{
let ts = $target[2];
return /*9977*//*9991*//*9992*/ntv/*<9992*/(/*9991*//*9993*/star/*<9993*/)/*<9991*/(/*9977*//*9977*/function name_9977($let) { return /*9977*/(function match_9977($target) {
{
let t$qu = $target;
return /*9977*//*9999*//*10001*/ti_then/*<10001*/(/*9999*//*10002*//*10003*/fresh_inst/*<10003*/(/*10002*//*10004*/scheme/*<10004*/)/*<10002*/)/*<9999*/(/*9977*//*9977*/function name_9977($let) { return /*9977*/(function match_9977($target) {
if ($target.type === "=>") {
{
let qs = $target[0];
{
let t = $target[1];
return /*9977*//*10104*//*10105*/ti_then/*<10105*/(/*10104*//*10014*//*10014*//*10015*/unify/*<10015*/(/*10014*//*10016*/t/*<10016*/)/*<10014*/(/*10014*//*10017*//*10017*//*10017*//*10018*/foldr/*<10018*/(/*10017*//*10020*/t$qu/*<10020*/)/*<10017*/(/*10017*//*10021*/ts/*<10021*/)/*<10017*/(/*10017*//*10156*/function name_10156(res) { return /*10156*/function name_10156(arg) { return /*16623*//*16623*//*16624*/tfn/*<16624*/(/*16623*//*16625*/arg/*<16625*/)/*<16623*/(/*16623*//*16626*/res/*<16626*/)/*<16623*/ }/*<10156*/ }/*<10156*/)/*<10017*/)/*<10014*/)/*<10104*/(/*9977*//*9977*/function name_9977($let) { return /*9977*/(function match_9977($target) {
return /*9995*//*10022*/ti_return/*<10022*/(/*9995*//*10023*//*10023*//*10023*//*10024*/$co$co/*<10024*/(/*10023*//*10025*//*10026*/concat/*<10026*/(/*10025*//*10027*//*10027*//*10027*/cons/*<10027*/(/*10027*//*10028*/ps/*<10028*/)/*<10027*/(/*10027*//*10027*//*10027*//*10027*/cons/*<10027*/(/*10027*//*10029*/qs/*<10029*/)/*<10027*/(/*10027*//*10027*/nil/*<10027*/)/*<10027*/)/*<10027*/)/*<10025*/)/*<10023*/(/*10023*//*10031*/as/*<10031*/)/*<10023*/(/*10023*//*10032*/t$qu/*<10032*/)/*<10023*/)/*<9995*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 9977');})(/*!*//*-1*/$let/*<-1*/)/*<9977*/ }/*<9977*/)/*<9977*/
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 9977');})(/*!*//*-1*/$let/*<-1*/)/*<9977*/ }/*<9977*/)/*<9977*/
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 9977');})(/*!*//*-1*/$let/*<-1*/)/*<9977*/ }/*<9977*/)/*<9977*/
}
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 9977');})(/*!*//*-1*/$let/*<-1*/)/*<9977*/ }/*<9977*/)/*<9977*/)/*<10157*/(/*10157*//*10159*/subst/*<10159*/)/*<10157*/(/*10157*//*10160*/tenv/*<10160*/)/*<10157*/(/*10157*//*10161*/nidx/*<10161*/)/*<10157*/
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 9932');})(/*!*//*9934*//*9934*//*9962*/tenv$slconstr/*<9962*/(/*9934*//*9963*/tenv/*<9963*/)/*<9934*/(/*9934*//*9970*/name/*<9970*/)/*<9934*/)/*<9932*/ }/*<9926*/ }/*<9926*/ }/*<9926*/)/*<9887*/
}
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 9791');})(/*!*//*9793*/pat/*<9793*/)/*<9791*/ }/*<9727*/;


const infer$slpats = /*10033*/function name_10033(pats) { return /*10039*//*10102*//*10103*/ti_then/*<10103*/(/*10102*//*10043*//*10043*//*10044*/map$slti/*<10044*/(/*10043*//*10045*/infer$slpat/*<10045*/)/*<10043*/(/*10043*//*10046*/pats/*<10046*/)/*<10043*/)/*<10102*/(/*10039*//*10039*/function name_10039($let) { return /*10039*/(function match_10039($target) {
{
let psasts = $target;
return /*10056*/(function let_10056() {const $target = /*10060*//*10061*/concat/*<10061*/(/*10060*//*10062*//*10062*//*10063*/map/*<10063*/(/*10062*//*10064*/function name_10064($fn_arg) { return /*10064*/(function match_10064($target) {
if ($target.type === ",,") {
{
let ps$qu = $target[0];
return /*10072*/ps$qu/*<10072*/
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 10064');})(/*!*//*-1*/$fn_arg/*<-1*/)/*<10064*/ }/*<10064*/)/*<10062*/(/*10062*//*10073*/psasts/*<10073*/)/*<10062*/)/*<10060*/;
{
let ps = $target;
return /*10056*/(function let_10056() {const $target = /*10075*//*10076*/concat/*<10076*/(/*10075*//*10077*//*10077*//*10078*/map/*<10078*/(/*10077*//*10079*/function name_10079($fn_arg) { return /*10079*/(function match_10079($target) {
if ($target.type === ",,") {
{
let as$qu = $target[1];
return /*10087*/as$qu/*<10087*/
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 10079');})(/*!*//*-1*/$fn_arg/*<-1*/)/*<10079*/ }/*<10079*/)/*<10077*/(/*10077*//*10088*/psasts/*<10088*/)/*<10077*/)/*<10075*/;
{
let as = $target;
return /*10056*/(function let_10056() {const $target = /*10090*//*10090*//*10091*/map/*<10091*/(/*10090*//*10092*/function name_10092($fn_arg) { return /*10092*/(function match_10092($target) {
if ($target.type === ",,") {
{
let t = $target[2];
return /*10100*/t/*<10100*/
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 10092');})(/*!*//*-1*/$fn_arg/*<-1*/)/*<10092*/ }/*<10092*/)/*<10090*/(/*10090*//*10101*/psasts/*<10101*/)/*<10090*/;
{
let ts = $target;
return /*10048*//*10050*/ti_return/*<10050*/(/*10048*//*10051*//*10051*//*10051*//*10052*/$co$co/*<10052*/(/*10051*//*10053*/ps/*<10053*/)/*<10051*/(/*10051*//*10054*/as/*<10054*/)/*<10051*/(/*10051*//*10055*/ts/*<10055*/)/*<10051*/)/*<10048*/
};
throw new Error('let pattern not matched 10089. ' + valueToString($target));})(/*!*/)/*<10056*/
};
throw new Error('let pattern not matched 10074. ' + valueToString($target));})(/*!*/)/*<10056*/
};
throw new Error('let pattern not matched 10059. ' + valueToString($target));})(/*!*/)/*<10056*/
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 10039');})(/*!*//*-1*/$let/*<-1*/)/*<10039*/ }/*<10039*/)/*<10039*/ }/*<10033*/;

const infer$slexpr = /*10162*/function name_10162(ce) { return /*10162*/function name_10162(as) { return /*10162*/function name_10162(expr) { return /*10168*/(function match_10168($target) {
if ($target.type === "evar") {
{
let name = $target[0];
{
let l = $target[1];
return /*10225*/(function match_10225($target) {
if ($target.type === "err") {
{
let e = $target[0];
return /*10235*//*10311*/TI/*<10311*/(/*10235*//*10312*/function name_10312(subst) { return /*10312*/function name_10312(tenv) { return /*10312*/function name_10312(nidx) { return /*10318*/(function match_10318($target) {
if ($target.type === "none") {
return /*10327*//*10328*/err/*<10328*/(/*10327*//*10329*/`Unbound variable ${/*10359*/name/*<10359*/}`/*<10329*/)/*<10327*/
}
if ($target.type === "some") {
{
let scheme = $target[0];
return /*10333*//*10333*//*10333*//*10333*//*10334*/ti_run/*<10334*/(/*10333*//*10335*//*10346*//*10347*/ti_then/*<10347*/(/*10346*//*10348*//*10349*/fresh_inst/*<10349*/(/*10348*//*10350*/scheme/*<10350*/)/*<10348*/)/*<10346*/(/*10335*//*10335*/function name_10335($let) { return /*10335*/(function match_10335($target) {
if ($target.type === "=>") {
{
let ps = $target[0];
{
let t = $target[1];
return /*10351*//*10352*/ti_return/*<10352*/(/*10351*//*10353*//*10353*//*10354*/$co/*<10354*/(/*10353*//*10355*/ps/*<10355*/)/*<10353*/(/*10353*//*10356*/t/*<10356*/)/*<10353*/)/*<10351*/
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 10335');})(/*!*//*-1*/$let/*<-1*/)/*<10335*/ }/*<10335*/)/*<10335*/)/*<10333*/(/*10333*//*10338*/subst/*<10338*/)/*<10333*/(/*10333*//*10339*/tenv/*<10339*/)/*<10333*/(/*10333*//*10340*/nidx/*<10340*/)/*<10333*/
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 10318');})(/*!*//*10320*//*10320*//*10321*/tenv$slvalue/*<10321*/(/*10320*//*10322*/tenv/*<10322*/)/*<10320*/(/*10320*//*10323*/name/*<10323*/)/*<10320*/)/*<10318*/ }/*<10312*/ }/*<10312*/ }/*<10312*/)/*<10235*/
}
}
if ($target.type === "ok") {
{
let sc = $target[0];
return /*10268*//*10275*//*10276*/ti_then/*<10276*/(/*10275*//*10277*//*10278*/fresh_inst/*<10278*/(/*10277*//*10279*/sc/*<10279*/)/*<10277*/)/*<10275*/(/*10268*//*10268*/function name_10268($let) { return /*10268*/(function match_10268($target) {
if ($target.type === "=>") {
{
let ps = $target[0];
{
let t = $target[1];
return /*10280*//*10281*/ti_return/*<10281*/(/*10280*//*10282*//*10282*//*10283*/$co/*<10283*/(/*10282*//*10284*/ps/*<10284*/)/*<10282*/(/*10282*//*10285*/t/*<10285*/)/*<10282*/)/*<10280*/
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 10268');})(/*!*//*-1*/$let/*<-1*/)/*<10268*/ }/*<10268*/)/*<10268*/
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 10225');})(/*!*//*10228*//*10228*//*10229*/find_scheme/*<10229*/(/*10228*//*10230*/name/*<10230*/)/*<10228*/(/*10228*//*10231*/as/*<10231*/)/*<10228*/)/*<10225*/
}
}
}
if ($target.type === "eprim") {
{
let prim = $target[0];
{
let l = $target[1];
return /*10364*//*10380*/infer$slprim/*<10380*/(/*10364*//*10381*/prim/*<10381*/)/*<10364*/
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
return /*10388*//*10412*//*10413*/ti_then/*<10413*/(/*10412*//*10396*//*10396*//*10396*//*10397*/infer$slexpr/*<10397*/(/*10396*//*10398*/ce/*<10398*/)/*<10396*/(/*10396*//*10399*/as/*<10399*/)/*<10396*/(/*10396*//*10400*/target/*<10400*/)/*<10396*/)/*<10412*/(/*10388*//*10388*/function name_10388($let) { return /*10388*/(function match_10388($target) {
if ($target.type === ",") {
{
let ps = $target[0];
{
let target_type = $target[1];
return /*10388*//*10414*//*10415*/ti_then/*<10415*/(/*10414*//*10405*//*10405*//*10405*//*10406*/infer$slexpr/*<10406*/(/*10405*//*10407*/ce/*<10407*/)/*<10405*/(/*10405*//*10408*/as/*<10408*/)/*<10405*/(/*10405*//*10409*/arg/*<10409*/)/*<10405*/)/*<10414*/(/*10388*//*10388*/function name_10388($let) { return /*10388*/(function match_10388($target) {
if ($target.type === ",") {
{
let qs = $target[0];
{
let arg_type = $target[1];
return /*10388*//*10416*//*10418*/ntv/*<10418*/(/*10416*//*10419*/star/*<10419*/)/*<10416*/(/*10388*//*10388*/function name_10388($let) { return /*10388*/(function match_10388($target) {
{
let result_var = $target;
return /*10388*//*10422*//*10424*/ti_then/*<10424*/(/*10422*//*10425*//*10425*//*10426*/unify/*<10426*/(/*10425*//*10427*//*10427*//*10428*/tfn/*<10428*/(/*10427*//*10429*/arg_type/*<10429*/)/*<10427*/(/*10427*//*10431*/result_var/*<10431*/)/*<10427*/)/*<10425*/(/*10425*//*10432*/target_type/*<10432*/)/*<10425*/)/*<10422*/(/*10388*//*10388*/function name_10388($let) { return /*10388*/(function match_10388($target) {
return /*10433*//*10434*/ti_return/*<10434*/(/*10433*//*10436*//*10436*//*10437*/$co/*<10437*/(/*10436*//*10438*//*10439*/concat/*<10439*/(/*10438*//*10440*//*10440*//*10440*/cons/*<10440*/(/*10440*//*10441*/ps/*<10441*/)/*<10440*/(/*10440*//*10440*//*10440*//*10440*/cons/*<10440*/(/*10440*//*10442*/qs/*<10442*/)/*<10440*/(/*10440*//*10440*/nil/*<10440*/)/*<10440*/)/*<10440*/)/*<10438*/)/*<10436*/(/*10436*//*10443*/result_var/*<10443*/)/*<10436*/)/*<10433*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 10388');})(/*!*//*-1*/$let/*<-1*/)/*<10388*/ }/*<10388*/)/*<10388*/
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 10388');})(/*!*//*-1*/$let/*<-1*/)/*<10388*/ }/*<10388*/)/*<10388*/
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 10388');})(/*!*//*-1*/$let/*<-1*/)/*<10388*/ }/*<10388*/)/*<10388*/
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 10388');})(/*!*//*-1*/$let/*<-1*/)/*<10388*/ }/*<10388*/)/*<10388*/
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
return /*15804*//*15811*/fatal/*<15811*/(/*15804*//*15812*/`This match should have been turned into an elet ${/*15814*//*15816*/int_to_string/*<15816*/(/*15814*//*15818*/l/*<15818*/)/*<15814*/}`/*<15812*/)/*<15804*/
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
return /*10451*//*15378*//*15379*/ti_then/*<15379*/(/*15378*//*10458*//*10458*//*10458*//*10459*/infer$slbinding_group/*<10459*/(/*10458*//*13651*/ce/*<13651*/)/*<10458*/(/*10458*//*13652*/as/*<13652*/)/*<10458*/(/*10458*//*10460*/bindings/*<10460*/)/*<10458*/)/*<15378*/(/*10451*//*10451*/function name_10451($let) { return /*10451*/(function match_10451($target) {
if ($target.type === ",") {
{
let ps = $target[0];
{
let as$qu = $target[1];
return /*10451*//*15376*//*15377*/ti_then/*<15377*/(/*15376*//*13658*//*13658*//*13658*//*13659*/infer$slexpr/*<13659*/(/*13658*//*13660*/ce/*<13660*/)/*<13658*/(/*13658*//*13661*//*13662*/concat/*<13662*/(/*13661*//*13663*//*13663*//*13663*/cons/*<13663*/(/*13663*//*13664*/as$qu/*<13664*/)/*<13663*/(/*13663*//*13663*//*13663*//*13663*/cons/*<13663*/(/*13663*//*13665*/as/*<13665*/)/*<13663*/(/*13663*//*13663*/nil/*<13663*/)/*<13663*/)/*<13663*/)/*<13661*/)/*<13658*/(/*13658*//*13666*/body/*<13666*/)/*<13658*/)/*<15376*/(/*10451*//*10451*/function name_10451($let) { return /*10451*/(function match_10451($target) {
if ($target.type === ",") {
{
let qs = $target[0];
{
let t = $target[1];
return /*13650*//*13667*/ti_return/*<13667*/(/*13650*//*13674*//*13674*//*13675*/$co/*<13675*/(/*13674*//*13668*//*13669*/concat/*<13669*/(/*13668*//*13670*//*13670*//*13670*/cons/*<13670*/(/*13670*//*13671*/ps/*<13671*/)/*<13670*/(/*13670*//*13670*//*13670*//*13670*/cons/*<13670*/(/*13670*//*13672*/qs/*<13672*/)/*<13670*/(/*13670*//*13670*/nil/*<13670*/)/*<13670*/)/*<13670*/)/*<13668*/)/*<13674*/(/*13674*//*13677*/t/*<13677*/)/*<13674*/)/*<13650*/
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 10451');})(/*!*//*-1*/$let/*<-1*/)/*<10451*/ }/*<10451*/)/*<10451*/
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 10451');})(/*!*//*-1*/$let/*<-1*/)/*<10451*/ }/*<10451*/)/*<10451*/
}
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 10168');})(/*!*//*10170*/expr/*<10170*/)/*<10168*/ }/*<10162*/ }/*<10162*/ }/*<10162*/;


const infer$slbinding_group = /*14607*/function name_14607(class_env) { return /*14607*/function name_14607(as) { return /*14607*/function name_14607($fn_arg) { return /*14607*/(function match_14607($target) {
if ($target.type === ",") {
{
let explicit = $target[0];
{
let implicits = $target[1];
return /*14618*/(function let_14618() {const $target = /*14623*//*14623*//*14624*/map/*<14624*/(/*14623*//*14626*/function name_14626($fn_arg) { return /*14626*/(function match_14626($target) {
if ($target.type === ",,") {
{
let name = $target[0];
{
let scheme = $target[1];
return /*14634*//*14634*//*14635*/$ex$gt$ex/*<14635*/(/*14634*//*14636*/name/*<14636*/)/*<14634*/(/*14634*//*14637*/scheme/*<14637*/)/*<14634*/
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 14626');})(/*!*//*-1*/$fn_arg/*<-1*/)/*<14626*/ }/*<14626*/)/*<14623*/(/*14623*//*14625*/explicit/*<14625*/)/*<14623*/;
{
let expl_assumps = $target;
return /*14638*//*15336*//*15337*/ti_then/*<15337*/(/*15336*//*14647*//*14647*//*14647*//*14647*//*14648*/infer$slseq/*<14648*/(/*14647*//*14649*/infer$slimpls/*<14649*/)/*<14647*/(/*14647*//*14650*/class_env/*<14650*/)/*<14647*/(/*14647*//*14651*//*14651*//*14652*/$pl$pl$pl/*<14652*/(/*14651*//*14653*/expl_assumps/*<14653*/)/*<14651*/(/*14651*//*14654*/as/*<14654*/)/*<14651*/)/*<14647*/(/*14647*//*14655*/implicits/*<14655*/)/*<14647*/)/*<15336*/(/*14638*//*14638*/function name_14638($let) { return /*14638*/(function match_14638($target) {
if ($target.type === ",") {
{
let impl_preds = $target[0];
{
let impl_assumps = $target[1];
return /*14638*//*15334*//*15335*/ti_then/*<15335*/(/*15334*//*14659*//*14659*//*14661*/map$slti/*<14661*/(/*14659*//*14662*//*14662*//*14663*/infer$slexpl/*<14663*/(/*14662*//*14664*/class_env/*<14664*/)/*<14662*/(/*14662*//*14665*//*14666*/concat/*<14666*/(/*14665*//*14667*//*14667*//*14667*/cons/*<14667*/(/*14667*//*14668*/impl_assumps/*<14668*/)/*<14667*/(/*14667*//*14667*//*14667*//*14667*/cons/*<14667*/(/*14667*//*14669*/expl_assumps/*<14669*/)/*<14667*/(/*14667*//*14667*//*14667*//*14667*/cons/*<14667*/(/*14667*//*14670*/as/*<14670*/)/*<14667*/(/*14667*//*14667*/nil/*<14667*/)/*<14667*/)/*<14667*/)/*<14667*/)/*<14665*/)/*<14662*/)/*<14659*/(/*14659*//*14672*/explicit/*<14672*/)/*<14659*/)/*<15334*/(/*14638*//*14638*/function name_14638($let) { return /*14638*/(function match_14638($target) {
{
let expl_preds = $target;
return /*14657*//*14673*/ti_return/*<14673*/(/*14657*//*14674*//*14674*//*14675*/$co/*<14675*/(/*14674*//*14676*//*14676*//*14677*/$pl$pl$pl/*<14677*/(/*14676*//*14678*/impl_preds/*<14678*/)/*<14676*/(/*14676*//*14679*//*14681*/concat/*<14681*/(/*14679*//*14682*/expl_preds/*<14682*/)/*<14679*/)/*<14676*/)/*<14674*/(/*14674*//*14683*//*14683*//*14684*/$pl$pl$pl/*<14684*/(/*14683*//*14685*/impl_assumps/*<14685*/)/*<14683*/(/*14683*//*14686*/expl_assumps/*<14686*/)/*<14683*/)/*<14674*/)/*<14657*/
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 14638');})(/*!*//*-1*/$let/*<-1*/)/*<14638*/ }/*<14638*/)/*<14638*/
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 14638');})(/*!*//*-1*/$let/*<-1*/)/*<14638*/ }/*<14638*/)/*<14638*/
};
throw new Error('let pattern not matched 14622. ' + valueToString($target));})(/*!*/)/*<14618*/
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 14607');})(/*!*//*-1*/$fn_arg/*<-1*/)/*<14607*/ }/*<14607*/ }/*<14607*/ }/*<14607*/;


const infer$slimpls = /*14795*/function name_14795(ce) { return /*14795*/function name_14795(as) { return /*14795*/function name_14795(bs) { return /*14804*//*14819*//*14820*/ti_then/*<14820*/(/*14819*//*14808*//*14808*//*14809*/map$slti/*<14809*/(/*14808*//*14810*/function name_14810(_) { return /*14814*//*14815*/new_tvar/*<14815*/(/*14814*//*14816*/star/*<14816*/)/*<14814*/ }/*<14810*/)/*<14808*/(/*14808*//*14818*/bs/*<14818*/)/*<14808*/)/*<14819*/(/*14804*//*14804*/function name_14804($let) { return /*14804*/(function match_14804($target) {
{
let ts = $target;
return /*14817*/(function let_14817() {const $target = /*14838*//*14838*//*14839*/map/*<14839*/(/*14838*//*14840*/fst/*<14840*/)/*<14838*/(/*14838*//*14841*/bs/*<14841*/)/*<14838*/;
{
let is = $target;
return /*14817*/(function let_14817() {const $target = /*14843*//*14843*//*14844*/map/*<14844*/(/*14843*//*14845*/toScheme/*<14845*/)/*<14843*/(/*14843*//*14846*/ts/*<14846*/)/*<14843*/;
{
let scs = $target;
return /*14817*/(function let_14817() {const $target = /*14854*//*14854*//*14855*/$pl$pl$pl/*<14855*/(/*14854*//*14849*//*14849*//*14849*//*14850*/zipWith/*<14850*/(/*14849*//*14851*/$ex$gt$ex/*<14851*/)/*<14849*/(/*14849*//*14852*/is/*<14852*/)/*<14849*/(/*14849*//*14853*/scs/*<14853*/)/*<14849*/)/*<14854*/(/*14854*//*14856*/as/*<14856*/)/*<14854*/;
{
let as$qu = $target;
return /*14817*/(function let_14817() {const $target = /*14858*//*14858*//*14859*/map/*<14859*/(/*14858*//*14860*/snd/*<14860*/)/*<14858*/(/*14858*//*14861*/bs/*<14861*/)/*<14858*/;
{
let altss = $target;
return /*14862*//*14868*//*14869*/ti_then/*<14869*/(/*14868*//*14870*//*14871*/sequence/*<14871*/(/*14870*//*14872*//*14872*//*14872*//*14874*/zipWith/*<14874*/(/*14872*//*14875*//*14875*//*14876*/infer$slalts/*<14876*/(/*14875*//*14877*/ce/*<14877*/)/*<14875*/(/*14875*//*14878*/as$qu/*<14878*/)/*<14875*/)/*<14872*/(/*14872*//*14879*/altss/*<14879*/)/*<14872*/(/*14872*//*14880*/ts/*<14880*/)/*<14872*/)/*<14870*/)/*<14868*/(/*14862*//*14862*/function name_14862($let) { return /*14862*/(function match_14862($target) {
{
let pss = $target;
return /*14862*//*14884*//*14883*/ti_then/*<14883*/(/*14884*//*14885*/get_subst/*<14885*/)/*<14884*/(/*14862*//*14862*/function name_14862($let) { return /*14862*/(function match_14862($target) {
{
let s = $target;
return /*14886*/(function let_14886() {const $target = /*14925*//*14925*//*14891*/preds$slapply/*<14891*/(/*14925*//*14892*/s/*<14892*/)/*<14925*/(/*14925*//*14893*//*14894*/concat/*<14894*/(/*14893*//*14895*/pss/*<14895*/)/*<14893*/)/*<14925*/;
{
let ps$qu = $target;
return /*14886*/(function let_14886() {const $target = /*14898*//*14898*//*14899*/map/*<14899*/(/*14898*//*15223*//*15222*/type$slapply/*<15222*/(/*15223*//*14900*/s/*<14900*/)/*<15223*/)/*<14898*/(/*14898*//*14901*/ts/*<14901*/)/*<14898*/;
{
let ts$qu = $target;
return /*14886*/(function let_14886() {const $target = /*15295*//*15296*/set$slto_list/*<15296*/(/*15295*//*14903*//*14903*//*14903*//*14904*/foldl/*<14904*/(/*14903*//*15229*/set$slnil/*<15229*/)/*<14903*/(/*14903*//*14905*//*14905*//*14906*/map/*<14906*/(/*14905*//*15227*//*15226*/assump$slapply/*<15226*/(/*15227*//*15228*/s/*<15228*/)/*<15227*/)/*<14905*/(/*14905*//*14908*/as/*<14908*/)/*<14905*/)/*<14903*/(/*14903*//*15232*/function name_15232(res) { return /*15232*/function name_15232(as) { return /*15240*//*15240*//*15235*/set$slmerge/*<15235*/(/*15240*//*15241*/res/*<15241*/)/*<15240*/(/*15240*//*15243*//*15242*/assump$sltv/*<15242*/(/*15243*//*15244*/as/*<15244*/)/*<15243*/)/*<15240*/ }/*<15232*/ }/*<15232*/)/*<14903*/)/*<15295*/;
{
let fs = $target;
return /*14886*/(function let_14886() {const $target = /*14911*//*14911*//*14912*/map/*<14912*/(/*14911*//*14913*/type$sltv/*<14913*/)/*<14911*/(/*14911*//*14914*/ts$qu/*<14914*/)/*<14911*/;
{
let vss = $target;
return /*14886*/(function let_14886() {const $target = /*14920*//*14920*//*14920*//*14921*/without/*<14921*/(/*14920*//*15293*//*15294*/set$slto_list/*<15294*/(/*15293*//*14916*//*14916*//*14917*/foldr1/*<14917*/(/*14916*//*14918*/set$slmerge/*<14918*/)/*<14916*/(/*14916*//*14919*/vss/*<14919*/)/*<14916*/)/*<15293*/)/*<14920*/(/*14920*//*14922*/fs/*<14922*/)/*<14920*/(/*14920*//*15329*/tyvar$eq/*<15329*/)/*<14920*/;
{
let gs = $target;
return /*14910*//*14933*//*14934*/ti_then/*<14934*/(/*14933*//*14935*//*14935*//*14935*//*14935*//*14936*/split/*<14936*/(/*14935*//*14937*/ce/*<14937*/)/*<14935*/(/*14935*//*14938*/fs/*<14938*/)/*<14935*/(/*14935*//*14939*//*14939*//*14940*/foldr1/*<14940*/(/*14939*//*15319*//*14941*/intersect/*<14941*/(/*15319*//*15320*/tyvar$eq/*<15320*/)/*<15319*/)/*<14939*/(/*14939*//*15326*//*15326*//*14942*/map/*<14942*/(/*15326*//*15327*/set$slto_list/*<15327*/)/*<15326*/(/*15326*//*15328*/vss/*<15328*/)/*<15326*/)/*<14939*/)/*<14935*/(/*14935*//*14943*/ps$qu/*<14943*/)/*<14935*/)/*<14933*/(/*14910*//*14910*/function name_14910($let) { return /*14910*/(function match_14910($target) {
if ($target.type === ",") {
{
let ds = $target[0];
{
let rs = $target[1];
return /*14945*/(function match_14945($target) {
if ($target === true) {
return /*14952*/(function let_14952() {const $target = /*14956*//*14956*//*14956*//*14957*/without/*<14957*/(/*14956*//*14958*/gs/*<14958*/)/*<14956*/(/*14956*//*15330*//*15332*/set$slto_list/*<15332*/(/*15330*//*14959*//*14960*/preds$sltv/*<14960*/(/*14959*//*14961*/rs/*<14961*/)/*<14959*/)/*<15330*/)/*<14956*/(/*14956*//*15333*/tyvar$eq/*<15333*/)/*<14956*/;
{
let gs$qu = $target;
return /*14952*/(function let_14952() {const $target = /*14963*//*14963*//*14964*/map/*<14964*/(/*14963*//*14968*/function name_14968(x) { return /*14965*//*14965*//*14966*/quantify/*<14966*/(/*14965*//*14967*/gs$qu/*<14967*/)/*<14965*/(/*14965*//*14972*//*14972*//*14973*/$eq$gt/*<14973*/(/*14972*//*14974*/nil/*<14974*/)/*<14972*/(/*14972*//*14975*/x/*<14975*/)/*<14972*/)/*<14965*/ }/*<14968*/)/*<14963*/(/*14963*//*14976*/ts$qu/*<14976*/)/*<14963*/;
{
let scs$qu = $target;
return /*14979*//*14983*/ti_return/*<14983*/(/*14979*//*14984*//*14984*//*14985*/$co/*<14985*/(/*14984*//*14986*//*14986*//*14987*/$pl$pl$pl/*<14987*/(/*14986*//*14988*/ds/*<14988*/)/*<14986*/(/*14986*//*14989*/rs/*<14989*/)/*<14986*/)/*<14984*/(/*14984*//*14990*//*14990*//*14990*//*14991*/zipWith/*<14991*/(/*14990*//*14992*/$ex$gt$ex/*<14992*/)/*<14990*/(/*14990*//*14993*/is/*<14993*/)/*<14990*/(/*14990*//*14994*/scs$qu/*<14994*/)/*<14990*/)/*<14984*/)/*<14979*/
};
throw new Error('let pattern not matched 14962. ' + valueToString($target));})(/*!*/)/*<14952*/
};
throw new Error('let pattern not matched 14955. ' + valueToString($target));})(/*!*/)/*<14952*/
}
return /*14995*/(function let_14995() {const $target = /*14999*//*14999*//*15000*/map/*<15000*/(/*14999*//*15001*/function name_15001(x) { return /*15005*//*15005*//*15006*/quantify/*<15006*/(/*15005*//*15007*/gs/*<15007*/)/*<15005*/(/*15005*//*15008*//*15008*//*15009*/$eq$gt/*<15009*/(/*15008*//*15010*/rs/*<15010*/)/*<15008*/(/*15008*//*15011*/x/*<15011*/)/*<15008*/)/*<15005*/ }/*<15001*/)/*<14999*/(/*14999*//*15013*/ts$qu/*<15013*/)/*<14999*/;
{
let scs$qu = $target;
return /*15014*//*15015*/ti_return/*<15015*/(/*15014*//*15016*//*15016*//*15017*/$co/*<15017*/(/*15016*//*15018*/ds/*<15018*/)/*<15016*/(/*15016*//*15032*//*15032*//*15032*//*15033*/zipWith/*<15033*/(/*15032*//*15034*/$ex$gt$ex/*<15034*/)/*<15032*/(/*15032*//*15035*/is/*<15035*/)/*<15032*/(/*15032*//*15036*/scs$qu/*<15036*/)/*<15032*/)/*<15016*/)/*<15014*/
};
throw new Error('let pattern not matched 14998. ' + valueToString($target));})(/*!*/)/*<14995*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 14945');})(/*!*//*14947*//*14948*/restricted/*<14948*/(/*14947*//*14951*/bs/*<14951*/)/*<14947*/)/*<14945*/
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 14910');})(/*!*//*-1*/$let/*<-1*/)/*<14910*/ }/*<14910*/)/*<14910*/
};
throw new Error('let pattern not matched 14915. ' + valueToString($target));})(/*!*/)/*<14886*/
};
throw new Error('let pattern not matched 14909. ' + valueToString($target));})(/*!*/)/*<14886*/
};
throw new Error('let pattern not matched 14902. ' + valueToString($target));})(/*!*/)/*<14886*/
};
throw new Error('let pattern not matched 14896. ' + valueToString($target));})(/*!*/)/*<14886*/
};
throw new Error('let pattern not matched 14889. ' + valueToString($target));})(/*!*/)/*<14886*/
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 14862');})(/*!*//*-1*/$let/*<-1*/)/*<14862*/ }/*<14862*/)/*<14862*/
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 14862');})(/*!*//*-1*/$let/*<-1*/)/*<14862*/ }/*<14862*/)/*<14862*/
};
throw new Error('let pattern not matched 14857. ' + valueToString($target));})(/*!*/)/*<14817*/
};
throw new Error('let pattern not matched 14848. ' + valueToString($target));})(/*!*/)/*<14817*/
};
throw new Error('let pattern not matched 14842. ' + valueToString($target));})(/*!*/)/*<14817*/
};
throw new Error('let pattern not matched 14837. ' + valueToString($target));})(/*!*/)/*<14817*/
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 14804');})(/*!*//*-1*/$let/*<-1*/)/*<14804*/ }/*<14804*/)/*<14804*/ }/*<14795*/ }/*<14795*/ }/*<14795*/;


const infer$slexpl = /*14440*/function name_14440(ce) { return /*14440*/function name_14440(as) { return /*14440*/function name_14440($fn_arg) { return /*14440*/(function match_14440($target) {
if ($target.type === ",,") {
{
let i = $target[0];
{
let sc = $target[1];
{
let alts = $target[2];
return /*14452*//*14465*//*14466*/ti_then/*<14466*/(/*14465*//*14461*//*14462*/fresh_inst/*<14462*/(/*14461*//*14463*/sc/*<14463*/)/*<14461*/)/*<14465*/(/*14452*//*14452*/function name_14452($let) { return /*14452*/(function match_14452($target) {
if ($target.type === "=>") {
{
let qs = $target[0];
{
let t = $target[1];
return /*14452*//*15354*//*15355*/ti_then/*<15355*/(/*15354*//*14472*//*14472*//*14472*//*14472*//*14473*/infer$slalts/*<14473*/(/*14472*//*14474*/ce/*<14474*/)/*<14472*/(/*14472*//*14475*/as/*<14475*/)/*<14472*/(/*14472*//*14476*/alts/*<14476*/)/*<14472*/(/*14472*//*15356*/t/*<15356*/)/*<14472*/)/*<15354*/(/*14452*//*14452*/function name_14452($let) { return /*14452*/(function match_14452($target) {
{
let ps = $target;
return /*14452*//*15352*//*14478*/ti_then/*<14478*/(/*15352*//*15353*/get_subst/*<15353*/)/*<15352*/(/*14452*//*14452*/function name_14452($let) { return /*14452*/(function match_14452($target) {
{
let s = $target;
return /*14481*/(function let_14481() {const $target = /*14485*//*14485*//*14486*/preds$slapply/*<14486*/(/*14485*//*14488*/s/*<14488*/)/*<14485*/(/*14485*//*14489*/qs/*<14489*/)/*<14485*/;
{
let qs$qu = $target;
return /*14481*/(function let_14481() {const $target = /*14491*//*14491*//*14493*/type$slapply/*<14493*/(/*14491*//*14494*/s/*<14494*/)/*<14491*/(/*14491*//*14495*/t/*<14495*/)/*<14491*/;
{
let t$qu = $target;
return /*14481*/(function let_14481() {const $target = /*15347*//*15348*/set$slto_list/*<15348*/(/*15347*//*15341*//*15341*//*15342*/foldr1/*<15342*/(/*15341*//*15343*/set$slmerge/*<15343*/)/*<15341*/(/*15341*//*14926*//*14926*//*15340*/map/*<15340*/(/*14926*//*14498*/assump$sltv/*<14498*/)/*<14926*/(/*14926*//*14499*//*14499*//*14500*/map/*<14500*/(/*14499*//*15339*//*15338*/assump$slapply/*<15338*/(/*15339*//*14501*/s/*<14501*/)/*<15339*/)/*<14499*/(/*14499*//*14502*/as/*<14502*/)/*<14499*/)/*<14926*/)/*<15341*/)/*<15347*/;
{
let fs = $target;
return /*14481*/(function let_14481() {const $target = /*14507*//*14507*//*14507*//*14508*/without/*<14508*/(/*14507*//*15344*//*15345*/set$slto_list/*<15345*/(/*15344*//*14504*//*14505*/type$sltv/*<14505*/(/*14504*//*14506*/t$qu/*<14506*/)/*<14504*/)/*<15344*/)/*<14507*/(/*14507*//*14509*/fs/*<14509*/)/*<14507*/(/*14507*//*15346*/tyvar$eq/*<15346*/)/*<14507*/;
{
let gs = $target;
return /*14481*/(function let_14481() {const $target = /*14522*//*14522*//*14523*/quantify/*<14523*/(/*14522*//*14524*/gs/*<14524*/)/*<14522*/(/*14522*//*14525*//*14525*//*14526*/$eq$gt/*<14526*/(/*14525*//*14527*/qs$qu/*<14527*/)/*<14525*/(/*14525*//*14528*/t$qu/*<14528*/)/*<14525*/)/*<14522*/;
{
let sc$qu = $target;
return /*14481*/(function let_14481() {const $target = /*14530*//*14530*//*14531*/filter/*<14531*/(/*14530*//*14544*/function name_14544(x) { return /*14532*//*14533*/not/*<14533*/(/*14532*//*14548*//*14548*//*14548*//*14537*/entail/*<14537*/(/*14548*//*14538*/ce/*<14538*/)/*<14548*/(/*14548*//*14539*/qs$qu/*<14539*/)/*<14548*/(/*14548*//*14549*/x/*<14549*/)/*<14548*/)/*<14532*/ }/*<14544*/)/*<14530*/(/*14530*//*14540*//*14540*//*14541*/preds$slapply/*<14541*/(/*14540*//*14542*/s/*<14542*/)/*<14540*/(/*14540*//*14543*/ps/*<14543*/)/*<14540*/)/*<14530*/;
{
let ps$qu = $target;
return /*14464*//*15350*//*15351*/ti_then/*<15351*/(/*15350*//*14556*//*14556*//*14556*//*14556*//*14557*/split/*<14557*/(/*14556*//*14558*/ce/*<14558*/)/*<14556*/(/*14556*//*14559*/fs/*<14559*/)/*<14556*/(/*14556*//*14560*/gs/*<14560*/)/*<14556*/(/*14556*//*14561*/ps$qu/*<14561*/)/*<14556*/)/*<15350*/(/*14464*//*14464*/function name_14464($let) { return /*14464*/(function match_14464($target) {
if ($target.type === ",") {
{
let ds = $target[0];
{
let rs = $target[1];
return /*14562*/(function match_14562($target) {
if ($target === true) {
return /*14568*//*14569*/ti_err/*<14569*/(/*14568*//*14570*/"signature too general"/*<14570*/)/*<14568*/
}
return /*14572*/(function match_14572($target) {
if ($target.type === "nil") {
return /*14580*//*14581*/ti_return/*<14581*/(/*14580*//*14582*/ds/*<14582*/)/*<14580*/
}
return /*14584*//*14587*/ti_err/*<14587*/(/*14584*//*14588*/"context too weak"/*<14588*/)/*<14584*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 14572');})(/*!*//*14578*/rs/*<14578*/)/*<14572*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 14562');})(/*!*//*14564*//*14564*//*14565*/$ex$eq/*<14565*/(/*14564*//*14566*/sc/*<14566*/)/*<14564*/(/*14564*//*14567*/sc$qu/*<14567*/)/*<14564*/)/*<14562*/
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 14464');})(/*!*//*-1*/$let/*<-1*/)/*<14464*/ }/*<14464*/)/*<14464*/
};
throw new Error('let pattern not matched 14529. ' + valueToString($target));})(/*!*/)/*<14481*/
};
throw new Error('let pattern not matched 14521. ' + valueToString($target));})(/*!*/)/*<14481*/
};
throw new Error('let pattern not matched 14503. ' + valueToString($target));})(/*!*/)/*<14481*/
};
throw new Error('let pattern not matched 14496. ' + valueToString($target));})(/*!*/)/*<14481*/
};
throw new Error('let pattern not matched 14490. ' + valueToString($target));})(/*!*/)/*<14481*/
};
throw new Error('let pattern not matched 14484. ' + valueToString($target));})(/*!*/)/*<14481*/
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 14452');})(/*!*//*-1*/$let/*<-1*/)/*<14452*/ }/*<14452*/)/*<14452*/
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 14452');})(/*!*//*-1*/$let/*<-1*/)/*<14452*/ }/*<14452*/)/*<14452*/
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 14452');})(/*!*//*-1*/$let/*<-1*/)/*<14452*/ }/*<14452*/)/*<14452*/
}
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 14440');})(/*!*//*-1*/$fn_arg/*<-1*/)/*<14440*/ }/*<14440*/ }/*<14440*/ }/*<14440*/;


const infer$slalts = /*15154*/function name_15154(ce) { return /*15154*/function name_15154(as) { return /*15154*/function name_15154(alts) { return /*15154*/function name_15154(t) { return /*15163*//*15167*//*15168*/ti_then/*<15168*/(/*15167*//*15169*//*15169*//*15170*/map$slti/*<15170*/(/*15169*//*15171*//*15171*//*15172*/infer$slalt/*<15172*/(/*15171*//*15173*/ce/*<15173*/)/*<15171*/(/*15171*//*15174*/as/*<15174*/)/*<15171*/)/*<15169*/(/*15169*//*15175*/alts/*<15175*/)/*<15169*/)/*<15167*/(/*15163*//*15163*/function name_15163($let) { return /*15163*/(function match_15163($target) {
{
let psts = $target;
return /*15163*//*15177*//*15178*/ti_then/*<15178*/(/*15177*//*15179*//*15179*//*15180*/map$slti/*<15180*/(/*15179*//*15184*//*15185*/unify/*<15185*/(/*15184*//*15186*/t/*<15186*/)/*<15184*/)/*<15179*/(/*15179*//*15187*//*15187*//*15188*/map/*<15188*/(/*15187*//*15189*/snd/*<15189*/)/*<15187*/(/*15187*//*15190*/psts/*<15190*/)/*<15187*/)/*<15179*/)/*<15177*/(/*15163*//*15163*/function name_15163($let) { return /*15163*/(function match_15163($target) {
return /*15183*//*15191*/ti_return/*<15191*/(/*15183*//*15192*//*15781*/concat/*<15781*/(/*15192*//*15782*//*15782*//*15783*/map/*<15783*/(/*15782*//*15784*/fst/*<15784*/)/*<15782*/(/*15782*//*15785*/psts/*<15785*/)/*<15782*/)/*<15192*/)/*<15183*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 15163');})(/*!*//*-1*/$let/*<-1*/)/*<15163*/ }/*<15163*/)/*<15163*/
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 15163');})(/*!*//*-1*/$let/*<-1*/)/*<15163*/ }/*<15163*/)/*<15163*/ }/*<15154*/ }/*<15154*/ }/*<15154*/ }/*<15154*/;


const infer$slalt = /*13680*/function name_13680(ce) { return /*13680*/function name_13680(as) { return /*13680*/function name_13680($fn_arg) { return /*13680*/(function match_13680($target) {
if ($target.type === ",") {
{
let pats = $target[0];
{
let body = $target[1];
return /*13692*//*15357*//*15358*/ti_then/*<15358*/(/*15357*//*13701*//*13702*/infer$slpats/*<13702*/(/*13701*//*13703*/pats/*<13703*/)/*<13701*/)/*<15357*/(/*13692*//*13692*/function name_13692($let) { return /*13692*/(function match_13692($target) {
if ($target.type === ",,") {
{
let ps = $target[0];
{
let as$qu = $target[1];
{
let ts = $target[2];
return /*13692*//*15359*//*15360*/ti_then/*<15360*/(/*15359*//*13708*//*13708*//*13708*//*13709*/infer$slexpr/*<13709*/(/*13708*//*13710*/ce/*<13710*/)/*<13708*/(/*13708*//*13711*//*13712*/concat/*<13712*/(/*13711*//*13713*//*13713*//*13713*/cons/*<13713*/(/*13713*//*13714*/as$qu/*<13714*/)/*<13713*/(/*13713*//*13713*//*13713*//*13713*/cons/*<13713*/(/*13713*//*13715*/as/*<13715*/)/*<13713*/(/*13713*//*13713*/nil/*<13713*/)/*<13713*/)/*<13713*/)/*<13711*/)/*<13708*/(/*13708*//*13716*/body/*<13716*/)/*<13708*/)/*<15359*/(/*13692*//*13692*/function name_13692($let) { return /*13692*/(function match_13692($target) {
if ($target.type === ",") {
{
let qs = $target[0];
{
let t = $target[1];
return /*13717*//*13718*/ti_return/*<13718*/(/*13717*//*13719*//*13719*//*13720*/$co/*<13720*/(/*13719*//*13721*//*13722*/concat/*<13722*/(/*13721*//*13723*//*13723*//*13723*/cons/*<13723*/(/*13723*//*13724*/ps/*<13724*/)/*<13723*/(/*13723*//*13723*//*13723*//*13723*/cons/*<13723*/(/*13723*//*13725*/qs/*<13725*/)/*<13723*/(/*13723*//*13723*/nil/*<13723*/)/*<13723*/)/*<13723*/)/*<13721*/)/*<13719*/(/*13719*//*13726*//*13726*//*13726*//*15370*/foldr/*<15370*/(/*13726*//*15778*/t/*<15778*/)/*<13726*/(/*13726*//*15779*/ts/*<15779*/)/*<13726*/(/*13726*//*15777*/function name_15777(res) { return /*15777*/function name_15777(arg) { return /*16575*//*16575*//*16576*/tfn/*<16576*/(/*16575*//*16577*/arg/*<16577*/)/*<16575*/(/*16575*//*16578*/res/*<16578*/)/*<16575*/ }/*<15777*/ }/*<15777*/)/*<13726*/)/*<13719*/)/*<13717*/
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 13692');})(/*!*//*-1*/$let/*<-1*/)/*<13692*/ }/*<13692*/)/*<13692*/
}
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 13692');})(/*!*//*-1*/$let/*<-1*/)/*<13692*/ }/*<13692*/)/*<13692*/
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 13680');})(/*!*//*-1*/$fn_arg/*<-1*/)/*<13680*/ }/*<13680*/ }/*<13680*/ }/*<13680*/;

const infer$slprogram = /*15392*/function name_15392(tenv) { return /*15392*/function name_15392(ce) { return /*15392*/function name_15392(as) { return /*15392*/function name_15392(bindgroups) { return /*15886*//*15886*//*15886*//*15886*//*15887*/ti_run/*<15887*/(/*15886*//*15828*//*15835*//*15836*/ti_then/*<15836*/(/*15835*//*15837*//*15837*//*15837*//*15837*//*15838*/infer$slseq/*<15838*/(/*15837*//*15839*/infer$slbinding_group/*<15839*/)/*<15837*/(/*15837*//*15840*/ce/*<15840*/)/*<15837*/(/*15837*//*15841*/as/*<15841*/)/*<15837*/(/*15837*//*15842*/bindgroups/*<15842*/)/*<15837*/)/*<15835*/(/*15828*//*15828*/function name_15828($let) { return /*15828*/(function match_15828($target) {
if ($target.type === ",") {
{
let preds = $target[0];
{
let assumps = $target[1];
return /*15828*//*15844*//*15845*/ti_then/*<15845*/(/*15844*//*15846*/get_subst/*<15846*/)/*<15844*/(/*15828*//*15828*/function name_15828($let) { return /*15828*/(function match_15828($target) {
{
let subst0 = $target;
return /*15828*//*15848*//*15849*/ti_then/*<15849*/(/*15848*//*15866*//*15867*/ti_from_result/*<15867*/(/*15866*//*15850*//*15850*//*15851*/reduce/*<15851*/(/*15850*//*15852*/ce/*<15852*/)/*<15850*/(/*15850*//*15853*//*15853*//*15854*/preds$slapply/*<15854*/(/*15853*//*15855*/subst0/*<15855*/)/*<15853*/(/*15853*//*15856*/preds/*<15856*/)/*<15853*/)/*<15850*/)/*<15866*/)/*<15848*/(/*15828*//*15828*/function name_15828($let) { return /*15828*/(function match_15828($target) {
{
let reduced = $target;
return /*15828*//*15858*//*15859*/ti_then/*<15859*/(/*15858*//*15868*//*15869*/ti_from_result/*<15869*/(/*15868*//*15860*//*15860*//*15860*//*15861*/defaultSubst/*<15861*/(/*15860*//*15862*/ce/*<15862*/)/*<15860*/(/*15860*//*15863*/nil/*<15863*/)/*<15860*/(/*15860*//*15864*/reduced/*<15864*/)/*<15860*/)/*<15868*/)/*<15858*/(/*15828*//*15828*/function name_15828($let) { return /*15828*/(function match_15828($target) {
{
let subst = $target;
return /*15865*//*15870*/ti_return/*<15870*/(/*15865*//*15871*//*15871*//*15872*/map/*<15872*/(/*15871*//*15881*//*15880*/assump$slapply/*<15880*/(/*15881*//*15873*//*15873*//*15874*/compose_subst/*<15874*/(/*15873*//*15875*/subst/*<15875*/)/*<15873*/(/*15873*//*15876*/subst0/*<15876*/)/*<15873*/)/*<15881*/)/*<15871*/(/*15871*//*15877*/assumps/*<15877*/)/*<15871*/)/*<15865*/
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 15828');})(/*!*//*-1*/$let/*<-1*/)/*<15828*/ }/*<15828*/)/*<15828*/
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 15828');})(/*!*//*-1*/$let/*<-1*/)/*<15828*/ }/*<15828*/)/*<15828*/
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 15828');})(/*!*//*-1*/$let/*<-1*/)/*<15828*/ }/*<15828*/)/*<15828*/
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 15828');})(/*!*//*-1*/$let/*<-1*/)/*<15828*/ }/*<15828*/)/*<15828*/)/*<15886*/(/*15886*//*15888*/map$slnil/*<15888*/)/*<15886*/(/*15886*//*15895*/tenv/*<15895*/)/*<15886*/(/*15886*//*15889*/0/*<15889*/)/*<15886*/ }/*<15392*/ }/*<15392*/ }/*<15392*/ }/*<15392*/;

/*16131*//*16131*//*16132*/result_$gts/*<16132*/(/*16131*//*16133*/function name_16133($fn_arg) { return /*16133*/(function match_16133($target) {
if ($target.type === ",,,") {
{
let abc = $target[0];
{
let tenv = $target[1];
{
let a = $target[2];
{
let b = $target[3];
return /*16137*//*16137*//*16144*/join/*<16144*/(/*16137*//*16145*/"\n"/*<16145*/)/*<16137*/(/*16137*//*16147*//*16147*//*16148*/map/*<16148*/(/*16147*//*16149*/assump_$gts/*<16149*/)/*<16147*/(/*16147*//*16150*/b/*<16150*/)/*<16147*/)/*<16137*/
}
}
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 16133');})(/*!*//*-1*/$fn_arg/*<-1*/)/*<16133*/ }/*<16133*/)/*<16131*/(/*16131*//*15896*//*15896*//*15896*//*15896*//*15898*/infer$slprogram/*<15898*/(/*15896*//*15899*/tenv$slnil/*<15899*/)/*<15896*/(/*15896*//*15951*//*15900*/add_prelude_classes/*<15900*/(/*15951*//*15952*/initial_env/*<15952*/)/*<15951*/)/*<15896*/(/*15896*//*15919*//*15919*//*15919*/cons/*<15919*/(/*15919*//*15959*//*15959*//*15960*/$ex$gt$ex/*<15960*/(/*15959*//*15961*/"a"/*<15961*/)/*<15959*/(/*15959*//*15963*//*15964*/to_scheme/*<15964*/(/*15963*//*15965*//*15965*//*15966*/tcon/*<15966*/(/*15965*//*15967*//*15967*//*15968*/tycon/*<15968*/(/*15967*//*15969*/"int"/*<15969*/)/*<15967*/(/*15967*//*15971*/star/*<15971*/)/*<15967*/)/*<15965*/(/*15965*//*15972*/-1/*<15972*/)/*<15965*/)/*<15963*/)/*<15959*/)/*<15919*/(/*15919*//*15919*//*15919*//*15919*/cons/*<15919*/(/*15919*//*16477*//*16477*//*16478*/$ex$gt$ex/*<16478*/(/*16477*//*16479*/"pi"/*<16479*/)/*<16477*/(/*16477*//*16481*//*16482*/to_scheme/*<16482*/(/*16481*//*16483*//*16483*//*16484*/tcon/*<16484*/(/*16483*//*16485*//*16485*//*16486*/tycon/*<16486*/(/*16485*//*16487*/"float"/*<16487*/)/*<16485*/(/*16485*//*16489*/star/*<16489*/)/*<16485*/)/*<16483*/(/*16483*//*16490*/-1/*<16490*/)/*<16483*/)/*<16481*/)/*<16477*/)/*<15919*/(/*15919*//*15919*//*15919*//*15919*/cons/*<15919*/(/*15919*//*16581*//*16581*//*16582*/$ex$gt$ex/*<16582*/(/*16581*//*16584*/"++"/*<16584*/)/*<16581*/(/*16581*//*16586*//*16586*//*16587*/forall/*<16587*/(/*16586*//*16588*//*16588*//*16588*/cons/*<16588*/(/*16588*//*16589*/star/*<16589*/)/*<16588*/(/*16588*//*16588*/nil/*<16588*/)/*<16588*/)/*<16586*/(/*16586*//*16590*//*16590*//*16597*/$eq$gt/*<16597*/(/*16590*//*16598*//*16598*//*16598*/cons/*<16598*/(/*16598*//*16600*//*16600*//*16601*/isin/*<16601*/(/*16600*//*16602*/"num"/*<16602*/)/*<16600*/(/*16600*//*16603*//*16603*//*16604*/tgen/*<16604*/(/*16603*//*16605*/0/*<16605*/)/*<16603*/(/*16603*//*16615*/-1/*<16615*/)/*<16603*/)/*<16600*/)/*<16598*/(/*16598*//*16598*/nil/*<16598*/)/*<16598*/)/*<16590*/(/*16590*//*16599*//*16599*//*16608*/tfn/*<16608*/(/*16599*//*16609*//*16609*//*16610*/tgen/*<16610*/(/*16609*//*16611*/0/*<16611*/)/*<16609*/(/*16609*//*16616*/-1/*<16616*/)/*<16609*/)/*<16599*/(/*16599*//*16612*//*16612*//*16613*/tgen/*<16613*/(/*16612*//*16614*/0/*<16614*/)/*<16612*/(/*16612*//*16617*/-1/*<16617*/)/*<16612*/)/*<16599*/)/*<16590*/)/*<16586*/)/*<16581*/)/*<15919*/(/*15919*//*15919*//*15919*//*15919*/cons/*<15919*/(/*15919*//*15979*//*15979*//*15980*/$ex$gt$ex/*<15980*/(/*15979*//*15981*/"+"/*<15981*/)/*<15979*/(/*15979*//*15983*//*15984*/to_scheme/*<15984*/(/*15983*//*15985*//*15985*//*15986*/tfn/*<15986*/(/*15985*//*15987*/tint/*<15987*/)/*<15985*/(/*15985*//*16017*//*16017*//*15988*/tfn/*<15988*/(/*16017*//*16018*/tint/*<16018*/)/*<16017*/(/*16017*//*16019*/tint/*<16019*/)/*<16017*/)/*<15985*/)/*<15983*/)/*<15979*/)/*<15919*/(/*15919*//*15919*/nil/*<15919*/)/*<15919*/)/*<15919*/)/*<15919*/)/*<15919*/)/*<15896*/(/*15896*//*15920*//*15920*//*15920*/cons/*<15920*/(/*15920*//*15922*//*15922*//*15923*/$co/*<15923*/(/*15922*//*15924*/nil/*<15924*/)/*<15922*/(/*15922*//*15925*//*15925*//*15925*/cons/*<15925*/(/*15925*//*15929*//*15929*//*15929*/cons/*<15929*/(/*15929*//*15931*//*15931*//*15932*/$co/*<15932*/(/*15931*//*15933*/"hello"/*<15933*/)/*<15931*/(/*15931*//*15935*//*15935*//*15935*/cons/*<15935*/(/*15935*//*15973*//*15973*//*15974*/$co/*<15974*/(/*15973*//*15975*//*15975*//*15975*/cons/*<15975*/(/*15975*//*16459*//*16459*//*16461*/pvar/*<16461*/(/*16459*//*16462*/"az"/*<16462*/)/*<16459*/(/*16459*//*16464*/-1/*<16464*/)/*<16459*/)/*<15975*/(/*15975*//*15975*/nil/*<15975*/)/*<15975*/)/*<15973*/(/*15973*//*15976*/{"0":{"0":"++","1":15978,"type":"evar"},"1":{"0":{"0":1,"1":16580,"type":"pint"},"1":16580,"type":"eprim"},"2":16579,"type":"eapp"}/*<15976*/)/*<15973*/)/*<15935*/(/*15935*//*15935*/nil/*<15935*/)/*<15935*/)/*<15931*/)/*<15929*/(/*15929*//*15929*/nil/*<15929*/)/*<15929*/)/*<15925*/(/*15925*//*15925*/nil/*<15925*/)/*<15925*/)/*<15922*/)/*<15920*/(/*15920*//*15920*/nil/*<15920*/)/*<15920*/)/*<15896*/)/*<16131*/
return {type: 'fns', $bar_$gt, $eq$gt, $ex$gt$ex, $pl$pl$pl, TI, add_class, add_inst, add_prelude_classes, all, ambiguities, any, apply_transformers, array$eq, assump$slapply, assump$sltv, assump_$gts, assumps_$gts, by_inst, by_super, candidates, class$slord, class_env, class_env$slnil, class_env$slstd, compose_subst, compose_transformers, concat, cons, contains, core_classes, cst$slarray, cst$slidentifier, cst$sllist, cst$slspread, cst$slstring, defaultSubst, defaultedPreds, defined, dot, eapp, elambda, elet, ematch, entail, enumId, eprim, equot, equot$slpat, equot$slstmt, equot$sltype, equotquot, err, estr, evar, every, example_insts, ext_subst, filter, find, find_scheme, find_some, foldl, foldr, foldr1, forall, fresh_inst, fst, get_subst, head, id, in_hnf, infer$slalt, infer$slalts, infer$slbinding_group, infer$slexpl, infer$slexpr, infer$slimpls, infer$slpat, infer$slpats, infer$slprim, infer$slprogram, infer$slseq, initial_env, inst$slpred, inst$slpreds, inst$slqual, inst$sltype, insts, intersect, isin, join, kfun, kind$eq, kind_$gts, lift, list$slget, map, map$slhas, map$slok, map$slti, mapi, matchPred, merge, mgu, mguPred, mk_deftype, mklist, mkpair, modify, new_tvar, nil, none, not, ntv, nullSubst, numClasses, num_classes, ok, overlap, pairs, pany, parse_array, parse_expr, parse_pat, parse_stmt, parse_type, partition, pbool, pcon, pint, pprim, pred$eq, pred$slapply, pred$sltv, pred_$gts, preds$slapply, preds$sltv, pstr, pvar, qual$eq, qual$slapply, qual$sltv, quantify, reduce, replaces, restricted, result_$gts, result_then, rev, sc_entail, scheme$eq, scheme$slapply, scheme$sltv, sdef, sdeftype, sequence, set$slintersect, sexpr, simplify, simplify_inner, snd, some, split, star, star_con, stdClasses, subst_$gts, supers, tapp, tapps, tarrow, tbool, tchar, tcon, tdouble, tenv$slconstr, tenv$slnil, tenv$slvalue, tfloat, tfn, tgen, ti_err, ti_fail, ti_from_result, ti_return, ti_run, ti_then, tint, tinteger, tlist, toScheme, to_hnf, to_hnfs, to_scheme, tstar, tstring, ttuple2, tunit, tvar, tycon, tycon$eq, tycon$slkind, tycon_$gts, type$eq, type$slapply, type$slhnf, type$slkind, type$sltv, type_$gtfn, type_$gts, type_env, type_match, tyvar, tyvar$eq, tyvar$slkind, tyvar_$gts, unify, unwrap_tapp, varBind, withDefaults, without, zip, zipWith}