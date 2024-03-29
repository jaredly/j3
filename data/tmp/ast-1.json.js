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
const pat_loc = /*918*/function name_918(pat) { return /*923*/(function match_923($target) {
if ($target.type === "pany") {
{
let l = $target[0];
return /*929*/l/*<929*/
}
}
if ($target.type === "pprim") {
{
let l = $target[1];
return /*934*/l/*<934*/
}
}
if ($target.type === "pstr") {
{
let l = $target[1];
return /*939*/l/*<939*/
}
}
if ($target.type === "pvar") {
{
let l = $target[1];
return /*944*/l/*<944*/
}
}
if ($target.type === "pcon") {
{
let l = $target[2];
return /*950*/l/*<950*/
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 923');})(/*!*//*925*/pat/*<925*/)/*<923*/ }/*<918*/;

const expr_loc = /*951*/function name_951(expr) { return /*956*/(function match_956($target) {
if ($target.type === "estr") {
{
let l = $target[2];
return /*964*/l/*<964*/
}
}
if ($target.type === "eprim") {
{
let l = $target[1];
return /*969*/l/*<969*/
}
}
if ($target.type === "evar") {
{
let l = $target[1];
return /*974*/l/*<974*/
}
}
if ($target.type === "equotquot") {
{
let l = $target[1];
return /*979*/l/*<979*/
}
}
if ($target.type === "equot") {
{
let l = $target[1];
return /*984*/l/*<984*/
}
}
if ($target.type === "equot/stmt") {
{
let l = $target[1];
return /*989*/l/*<989*/
}
}
if ($target.type === "equot/pat") {
{
let l = $target[1];
return /*994*/l/*<994*/
}
}
if ($target.type === "equot/type") {
{
let l = $target[1];
return /*999*/l/*<999*/
}
}
if ($target.type === "elambda") {
{
let l = $target[3];
return /*1006*/l/*<1006*/
}
}
if ($target.type === "elet") {
{
let l = $target[3];
return /*1013*/l/*<1013*/
}
}
if ($target.type === "eapp") {
{
let l = $target[2];
return /*1019*/l/*<1019*/
}
}
if ($target.type === "ematch") {
{
let l = $target[2];
return /*1025*/l/*<1025*/
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 956');})(/*!*//*958*/expr/*<958*/)/*<956*/ }/*<951*/;

const type$slset_loc = /*1026*/function name_1026(loc) { return /*1026*/function name_1026(type) { return /*1032*/(function match_1032($target) {
if ($target.type === "tvar") {
{
let name = $target[0];
return /*1039*//*1039*//*1040*/tvar/*<1040*/(/*1039*//*1041*/name/*<1041*/)/*<1039*/(/*1039*//*1042*/loc/*<1042*/)/*<1039*/
}
}
if ($target.type === "tapp") {
{
let a = $target[0];
{
let b = $target[1];
return /*1048*//*1048*//*1048*//*1049*/tapp/*<1049*/(/*1048*//*1050*//*1050*//*1051*/type$slset_loc/*<1051*/(/*1050*//*1052*/loc/*<1052*/)/*<1050*/(/*1050*//*1053*/a/*<1053*/)/*<1050*/)/*<1048*/(/*1048*//*1054*//*1054*//*1055*/type$slset_loc/*<1055*/(/*1054*//*1056*/loc/*<1056*/)/*<1054*/(/*1054*//*1057*/b/*<1057*/)/*<1054*/)/*<1048*/(/*1048*//*1058*/loc/*<1058*/)/*<1048*/
}
}
}
if ($target.type === "tcon") {
{
let name = $target[0];
return /*1063*//*1063*//*1064*/tcon/*<1064*/(/*1063*//*1065*/name/*<1065*/)/*<1063*/(/*1063*//*1066*/loc/*<1066*/)/*<1063*/
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 1032');})(/*!*//*1034*/type/*<1034*/)/*<1032*/ }/*<1026*/ }/*<1026*/;

const sdeftype = (v0) => (v1) => (v2) => (v3) => (v4) => ({type: "sdeftype", 0: v0, 1: v1, 2: v2, 3: v3, 4: v4});
const sdef = (v0) => (v1) => (v2) => (v3) => ({type: "sdef", 0: v0, 1: v1, 2: v2, 3: v3});
const sexpr = (v0) => (v1) => ({type: "sexpr", 0: v0, 1: v1});
const type_with_free = /*1101*/function name_1101(type) { return /*1101*/function name_1101(free) { return /*1107*/(function match_1107($target) {
if ($target.type === "tvar") {
return /*1114*/type/*<1114*/
}
if ($target.type === "tcon") {
{
let s = $target[0];
{
let l = $target[1];
return /*1119*/(function match_1119($target) {
if ($target === true) {
return /*1125*//*1125*//*1126*/tvar/*<1126*/(/*1125*//*1127*/s/*<1127*/)/*<1125*/(/*1125*//*1128*/l/*<1128*/)/*<1125*/
}
return /*1129*/type/*<1129*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 1119');})(/*!*//*1121*//*1121*//*1122*/set$slhas/*<1122*/(/*1121*//*1123*/free/*<1123*/)/*<1121*/(/*1121*//*1124*/s/*<1124*/)/*<1121*/)/*<1119*/
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
return /*1135*//*1135*//*1135*//*1136*/tapp/*<1136*/(/*1135*//*1137*//*1137*//*1138*/type_with_free/*<1138*/(/*1137*//*1139*/a/*<1139*/)/*<1137*/(/*1137*//*1140*/free/*<1140*/)/*<1137*/)/*<1135*/(/*1135*//*1141*//*1141*//*1142*/type_with_free/*<1142*/(/*1141*//*1143*/b/*<1143*/)/*<1141*/(/*1141*//*1144*/free/*<1144*/)/*<1141*/)/*<1135*/(/*1135*//*1145*/l/*<1145*/)/*<1135*/
}
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 1107');})(/*!*//*1109*/type/*<1109*/)/*<1107*/ }/*<1101*/ }/*<1101*/;

const type_loc = /*1146*/function name_1146(type) { return /*1151*/(function match_1151($target) {
if ($target.type === "tvar") {
{
let l = $target[1];
return /*1158*/l/*<1158*/
}
}
if ($target.type === "tapp") {
{
let l = $target[2];
return /*1164*/l/*<1164*/
}
}
if ($target.type === "tcon") {
{
let l = $target[1];
return /*1169*/l/*<1169*/
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 1151');})(/*!*//*1153*/type/*<1153*/)/*<1151*/ }/*<1146*/;

const tcolor = (v0) => ({type: "tcolor", 0: v0});
const tbold = (v0) => ({type: "tbold", 0: v0});
const titalic = (v0) => ({type: "titalic", 0: v0});
const tflash = (v0) => ({type: "tflash", 0: v0});
const ttext = (v0) => ({type: "ttext", 0: v0});
const tval = (v0) => ({type: "tval", 0: v0});
const tloc = (v0) => ({type: "tloc", 0: v0});
const tnamed = (v0) => (v1) => ({type: "tnamed", 0: v0, 1: v1});
const tfmted = (v0) => (v1) => ({type: "tfmted", 0: v0, 1: v1});
const tfmt = (v0) => (v1) => ({type: "tfmt", 0: v0, 1: v1});
const letters = /*1219*//*1219*//*1219*/cons/*<1219*/(/*1219*//*1220*/"a"/*<1220*/)/*<1219*/(/*1219*//*1219*//*1219*//*1219*/cons/*<1219*/(/*1219*//*1222*/"b"/*<1222*/)/*<1219*/(/*1219*//*1219*//*1219*//*1219*/cons/*<1219*/(/*1219*//*1224*/"c"/*<1224*/)/*<1219*/(/*1219*//*1219*//*1219*//*1219*/cons/*<1219*/(/*1219*//*1226*/"d"/*<1226*/)/*<1219*/(/*1219*//*1219*//*1219*//*1219*/cons/*<1219*/(/*1219*//*1228*/"e"/*<1228*/)/*<1219*/(/*1219*//*1219*//*1219*//*1219*/cons/*<1219*/(/*1219*//*1230*/"f"/*<1230*/)/*<1219*/(/*1219*//*1219*//*1219*//*1219*/cons/*<1219*/(/*1219*//*1232*/"g"/*<1232*/)/*<1219*/(/*1219*//*1219*//*1219*//*1219*/cons/*<1219*/(/*1219*//*1234*/"h"/*<1234*/)/*<1219*/(/*1219*//*1219*//*1219*//*1219*/cons/*<1219*/(/*1219*//*1236*/"i"/*<1236*/)/*<1219*/(/*1219*//*1219*//*1219*//*1219*/cons/*<1219*/(/*1219*//*1238*/"j"/*<1238*/)/*<1219*/(/*1219*//*1219*//*1219*//*1219*/cons/*<1219*/(/*1219*//*1240*/"k"/*<1240*/)/*<1219*/(/*1219*//*1219*//*1219*//*1219*/cons/*<1219*/(/*1219*//*1242*/"l"/*<1242*/)/*<1219*/(/*1219*//*1219*//*1219*//*1219*/cons/*<1219*/(/*1219*//*1244*/"m"/*<1244*/)/*<1219*/(/*1219*//*1219*//*1219*//*1219*/cons/*<1219*/(/*1219*//*1246*/"n"/*<1246*/)/*<1219*/(/*1219*//*1219*//*1219*//*1219*/cons/*<1219*/(/*1219*//*1248*/"o"/*<1248*/)/*<1219*/(/*1219*//*1219*/nil/*<1219*/)/*<1219*/)/*<1219*/)/*<1219*/)/*<1219*/)/*<1219*/)/*<1219*/)/*<1219*/)/*<1219*/)/*<1219*/)/*<1219*/)/*<1219*/)/*<1219*/)/*<1219*/)/*<1219*/)/*<1219*/;

const unwrap_fn = /*1250*/function name_1250(t) { return /*1255*/(function match_1255($target) {
if ($target.type === "tapp") {
if ($target[0].type === "tapp") {
if ($target[0][0].type === "tcon") {
if ($target[0][0][0] === "->"){
{
let a = $target[0][1];
{
let b = $target[1];
return /*1271*/(function let_1271() {const $target = /*1278*//*1279*/unwrap_fn/*<1279*/(/*1278*//*1280*/b/*<1280*/)/*<1278*/;
if ($target.type === ",") {
{
let args = $target[0];
{
let res = $target[1];
return /*1281*//*1281*//*1282*/$co/*<1282*/(/*1281*//*1283*//*1283*//*1283*/cons/*<1283*/(/*1283*//*1284*/a/*<1284*/)/*<1283*/(/*1283*//*1286*/args/*<1286*/)/*<1283*/)/*<1281*/(/*1281*//*1287*/res/*<1287*/)/*<1281*/
}
}
};
throw new Error('let pattern not matched 1274. ' + valueToString($target));})(/*!*/)/*<1271*/
}
}
}
}
}
}
return /*1289*//*1289*//*1290*/$co/*<1290*/(/*1289*//*1291*/nil/*<1291*/)/*<1289*/(/*1289*//*1292*/t/*<1292*/)/*<1289*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 1255');})(/*!*//*1257*/t/*<1257*/)/*<1255*/ }/*<1250*/;

const unwrap_app = /*1293*/function name_1293(t) { return /*1298*/(function match_1298($target) {
if ($target.type === "tapp") {
{
let a = $target[0];
{
let b = $target[1];
return /*1306*/(function let_1306() {const $target = /*1313*//*1314*/unwrap_app/*<1314*/(/*1313*//*1315*/a/*<1315*/)/*<1313*/;
if ($target.type === ",") {
{
let target = $target[0];
{
let args = $target[1];
return /*1316*//*1316*//*1317*/$co/*<1317*/(/*1316*//*1318*/target/*<1318*/)/*<1316*/(/*1316*//*1319*//*1319*//*1319*/cons/*<1319*/(/*1319*//*1320*/b/*<1320*/)/*<1319*/(/*1319*//*1322*/args/*<1322*/)/*<1319*/)/*<1316*/
}
}
};
throw new Error('let pattern not matched 1309. ' + valueToString($target));})(/*!*/)/*<1306*/
}
}
}
return /*1324*//*1324*//*1325*/$co/*<1325*/(/*1324*//*1326*/t/*<1326*/)/*<1324*/(/*1324*//*1327*/nil/*<1327*/)/*<1324*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 1298');})(/*!*//*1300*/t/*<1300*/)/*<1298*/ }/*<1293*/;

/*1734*/tcon/*<1734*/
const join = /*1736*/function name_1736(sep) { return /*1736*/function name_1736(arr) { return /*1745*/(function match_1745($target) {
if ($target.type === "nil") {
return /*1749*/""/*<1749*/
}
if ($target.type === "cons") {
{
let one = $target[0];
if ($target[1].type === "nil") {
return /*1757*/one/*<1757*/
}
}
}
if ($target.type === "cons") {
{
let one = $target[0];
{
let rest = $target[1];
return /*1764*/`${/*1766*/one/*<1766*/}${/*1768*/sep/*<1768*/}${/*1770*//*1770*//*1772*/join/*<1772*/(/*1770*//*1773*/sep/*<1773*/)/*<1770*/(/*1770*//*1774*/rest/*<1774*/)/*<1770*/}`/*<1764*/
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 1745');})(/*!*//*1747*/arr/*<1747*/)/*<1745*/ }/*<1736*/ }/*<1736*/;

const map = /*1775*/function name_1775(list) { return /*1775*/function name_1775(fn) { return /*1782*/(function match_1782($target) {
if ($target.type === "nil") {
return /*1786*/nil/*<1786*/
}
if ($target.type === "cons") {
{
let one = $target[0];
{
let rest = $target[1];
return /*1796*//*1796*//*1796*/cons/*<1796*/(/*1796*//*1797*//*1798*/fn/*<1798*/(/*1797*//*1799*/one/*<1799*/)/*<1797*/)/*<1796*/(/*1796*//*1800*//*1800*//*1804*/map/*<1804*/(/*1800*//*1805*/rest/*<1805*/)/*<1800*/(/*1800*//*1806*/fn/*<1806*/)/*<1800*/)/*<1796*/
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 1782');})(/*!*//*1784*/list/*<1784*/)/*<1782*/ }/*<1775*/ }/*<1775*/;

const pat_to_string = /*816*/function name_816(pat) { return /*821*/(function match_821($target) {
if ($target.type === "pany") {
return /*827*/"_"/*<827*/
}
if ($target.type === "pvar") {
{
let n = $target[0];
return /*833*/n/*<833*/
}
}
if ($target.type === "pcon") {
{
let c = $target[0];
{
let pats = $target[1];
return /*839*/`(${/*841*/c/*<841*/} ${/*843*//*843*//*844*/join/*<844*/(/*843*//*845*/" "/*<845*/)/*<843*/(/*843*//*847*//*847*//*848*/map/*<848*/(/*847*//*849*/pats/*<849*/)/*<847*/(/*847*//*850*/pat_to_string/*<850*/)/*<847*/)/*<843*/})`/*<839*/
}
}
}
if ($target.type === "pstr") {
{
let s = $target[0];
return /*856*/`\"${/*858*/s/*<858*/}\"`/*<856*/
}
}
if ($target.type === "pprim") {
return /*864*/"prim"/*<864*/
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 821');})(/*!*//*823*/pat/*<823*/)/*<821*/ }/*<816*/;

const expr_to_string = /*725*/function name_725(expr) { return /*730*/(function match_730($target) {
if ($target.type === "evar") {
{
let n = $target[0];
return /*737*/n/*<737*/
}
}
if ($target.type === "elambda") {
{
let n = $target[0];
{
let b = $target[2];
return /*744*/`(fn [${/*746*/n/*<746*/}] ${/*748*//*749*/expr_to_string/*<749*/(/*748*//*750*/b/*<750*/)/*<748*/})`/*<744*/
}
}
}
if ($target.type === "eapp") {
{
let a = $target[0];
{
let b = $target[1];
return /*757*/`(${/*759*//*760*/expr_to_string/*<760*/(/*759*//*761*/a/*<761*/)/*<759*/} ${/*763*//*764*/expr_to_string/*<764*/(/*763*//*765*/b/*<765*/)/*<763*/})`/*<757*/
}
}
}
if ($target.type === "eprim") {
if ($target[0].type === "pint") {
{
let n = $target[0][0];
return /*774*//*775*/int_to_string/*<775*/(/*774*//*776*/n/*<776*/)/*<774*/
}
}
}
if ($target.type === "ematch") {
{
let t = $target[0];
{
let cases = $target[1];
return /*782*/`(match ${/*784*//*785*/expr_to_string/*<785*/(/*784*//*786*/t/*<786*/)/*<784*/} ${/*788*//*788*//*789*/join/*<789*/(/*788*//*790*/"\n"/*<790*/)/*<788*/(/*788*//*792*//*792*//*793*/map/*<793*/(/*792*//*794*/cases/*<794*/)/*<792*/(/*792*//*795*/function name_795($fn_arg) { return /*795*/(function match_795($target) {
if ($target.type === ",") {
{
let a = $target[0];
{
let b = $target[1];
return /*802*/`${/*804*//*805*/pat_to_string/*<805*/(/*804*//*806*/a/*<806*/)/*<804*/} ${/*808*//*809*/expr_to_string/*<809*/(/*808*//*810*/b/*<810*/)/*<808*/}`/*<802*/
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 795');})(/*!*//*-1*/$fn_arg/*<-1*/)/*<795*/ }/*<795*/)/*<792*/)/*<788*/}`/*<782*/
}
}
}
return /*814*/"??"/*<814*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 730');})(/*!*//*732*/expr/*<732*/)/*<730*/ }/*<725*/;

return {type: 'fns', eapp, elambda, elet, ematch, eprim, equot, equot$slpat, equot$slstmt, equot$sltype, equotquot, estr, evar, expr_loc, expr_to_string, join, letters, map, pany, pat_loc, pat_to_string, pbool, pcon, pint, pprim, pstr, pvar, sdef, sdeftype, sexpr, tapp, tbold, tcolor, tcon, tflash, tfmt, tfmted, titalic, tloc, tnamed, ttext, tval, tvar, type$slset_loc, type_loc, type_with_free, unwrap_app, unwrap_fn}