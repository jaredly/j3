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

const tts_list = /*1328*/function name_1328(args) { return /*1328*/function name_1328(free) { return /*1328*/function name_1328(locs) { return /*1335*//*1335*//*1335*//*1336*/foldl/*<1336*/(/*1335*//*1337*//*1337*//*1338*/$co/*<1338*/(/*1337*//*1339*/nil/*<1339*/)/*<1337*/(/*1337*//*1340*/free/*<1340*/)/*<1337*/)/*<1335*/(/*1335*//*1341*/args/*<1341*/)/*<1335*/(/*1335*//*1342*/function name_1342($fn_arg) { return /*1342*/(function match_1342($target) {
if ($target.type === ",") {
{
let args = $target[0];
{
let free = $target[1];
return /*1342*/function name_1342(a) { return /*1350*/(function let_1350() {const $target = /*1357*//*1357*//*1357*//*1358*/tts_inner/*<1358*/(/*1357*//*1359*/a/*<1359*/)/*<1357*/(/*1357*//*1360*/free/*<1360*/)/*<1357*/(/*1357*//*1361*/locs/*<1361*/)/*<1357*/;
if ($target.type === ",") {
{
let a = $target[0];
{
let free = $target[1];
return /*1362*//*1362*//*1363*/$co/*<1363*/(/*1362*//*1364*//*1364*//*1364*/cons/*<1364*/(/*1364*//*1365*/a/*<1365*/)/*<1364*/(/*1364*//*1367*/args/*<1367*/)/*<1364*/)/*<1362*/(/*1362*//*1368*/free/*<1368*/)/*<1362*/
}
}
};
throw new Error('let pattern not matched 1353. ' + valueToString($target));})(/*!*/)/*<1350*/ }/*<1342*/
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 1342');})(/*!*//*-1*/$fn_arg/*<-1*/)/*<1342*/ }/*<1342*/)/*<1335*/ }/*<1328*/ }/*<1328*/ }/*<1328*/;

const and_loc = /*1369*/function name_1369(locs) { return /*1369*/function name_1369(l) { return /*1369*/function name_1369(s) { return /*1376*/(function match_1376($target) {
if ($target === true) {
return /*1379*/`${/*1381*/s/*<1381*/}:${/*1383*/(function match_1383($target) {
if ($target === true) {
return /*1389*/"🚨"/*<1389*/
}
return /*1391*//*1392*/its/*<1392*/(/*1391*//*1393*/l/*<1393*/)/*<1391*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 1383');})(/*!*//*1385*//*1385*//*1386*/$eq/*<1386*/(/*1385*//*1387*/l/*<1387*/)/*<1385*/(/*1385*//*1388*/-1/*<1388*/)/*<1385*/)/*<1383*/}`/*<1379*/
}
return /*1395*/s/*<1395*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 1376');})(/*!*//*1378*/locs/*<1378*/)/*<1376*/ }/*<1369*/ }/*<1369*/ }/*<1369*/;

const tts_inner = /*1396*/function name_1396(t) { return /*1396*/function name_1396(free) { return /*1396*/function name_1396(locs) { return /*1403*/(function match_1403($target) {
if ($target.type === "tvar") {
{
let s = $target[0];
{
let l = $target[1];
return /*1410*/(function let_1410() {const $target = /*1417*/free/*<1417*/;
if ($target.type === ",") {
{
let fmap = $target[0];
{
let idx = $target[1];
return /*1418*/(function match_1418($target) {
if ($target.type === "some") {
{
let fmap = $target[0];
return /*1424*/(function match_1424($target) {
if ($target.type === "some") {
{
let s = $target[0];
return /*1433*//*1433*//*1434*/$co/*<1434*/(/*1433*//*1435*//*1435*//*1435*//*1436*/and_loc/*<1436*/(/*1435*//*1437*/locs/*<1437*/)/*<1435*/(/*1435*//*1438*/l/*<1438*/)/*<1435*/(/*1435*//*1439*/s/*<1439*/)/*<1435*/)/*<1433*/(/*1433*//*1440*/free/*<1440*/)/*<1433*/
}
}
{
let none = $target;
return /*1442*/(function let_1442() {const $target = /*1446*//*1446*//*1446*//*1447*/at/*<1447*/(/*1446*//*1448*/letters/*<1448*/)/*<1446*/(/*1446*//*1449*/idx/*<1449*/)/*<1446*/(/*1446*//*1450*/"_too_many_vbls_"/*<1450*/)/*<1446*/;
{
let name = $target;
return /*1452*//*1452*//*1453*/$co/*<1453*/(/*1452*//*1454*//*1454*//*1454*//*1455*/and_loc/*<1455*/(/*1454*//*1456*/locs/*<1456*/)/*<1454*/(/*1454*//*1457*/l/*<1457*/)/*<1454*/(/*1454*//*1458*/name/*<1458*/)/*<1454*/)/*<1452*/(/*1452*//*1459*//*1459*//*1460*/$co/*<1460*/(/*1459*//*1461*//*1462*/some/*<1462*/(/*1461*//*1463*//*1463*//*1463*//*1464*/map$slset/*<1464*/(/*1463*//*1465*/fmap/*<1465*/)/*<1463*/(/*1463*//*1466*/s/*<1466*/)/*<1463*/(/*1463*//*1467*/name/*<1467*/)/*<1463*/)/*<1461*/)/*<1459*/(/*1459*//*1468*//*1468*//*1469*/$pl/*<1469*/(/*1468*//*1470*/1/*<1470*/)/*<1468*/(/*1468*//*1471*/idx/*<1471*/)/*<1468*/)/*<1459*/)/*<1452*/
};
throw new Error('let pattern not matched 1445. ' + valueToString($target));})(/*!*/)/*<1442*/
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 1424');})(/*!*//*1426*//*1426*//*1427*/map$slget/*<1427*/(/*1426*//*1428*/fmap/*<1428*/)/*<1426*/(/*1426*//*1429*/s/*<1429*/)/*<1426*/)/*<1424*/
}
}
return /*1473*//*1473*//*1474*/$co/*<1474*/(/*1473*//*1475*//*1475*//*1475*//*1476*/and_loc/*<1476*/(/*1475*//*1477*/locs/*<1477*/)/*<1475*/(/*1475*//*1478*/l/*<1478*/)/*<1475*/(/*1475*//*1479*/s/*<1479*/)/*<1475*/)/*<1473*/(/*1473*//*1480*/free/*<1480*/)/*<1473*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 1418');})(/*!*//*1420*/fmap/*<1420*/)/*<1418*/
}
}
};
throw new Error('let pattern not matched 1413. ' + valueToString($target));})(/*!*/)/*<1410*/
}
}
}
if ($target.type === "tcon") {
{
let s = $target[0];
{
let l = $target[1];
return /*1485*//*1485*//*1486*/$co/*<1486*/(/*1485*//*1487*//*1487*//*1487*//*1488*/and_loc/*<1488*/(/*1487*//*1489*/locs/*<1489*/)/*<1487*/(/*1487*//*1490*/l/*<1490*/)/*<1487*/(/*1487*//*1491*/s/*<1491*/)/*<1487*/)/*<1485*/(/*1485*//*1492*/free/*<1492*/)/*<1485*/
}
}
}
if ($target.type === "tapp") {
if ($target[0].type === "tapp") {
if ($target[0][0].type === "tcon") {
if ($target[0][0][0] === "->"){
{
let a = $target[0][1];
{
let la = $target[0][2];
{
let b = $target[1];
{
let l = $target[2];
return /*1506*/(function let_1506() {const $target = /*1513*//*1514*/unwrap_fn/*<1514*/(/*1513*//*1515*/b/*<1515*/)/*<1513*/;
if ($target.type === ",") {
{
let args = $target[0];
{
let r = $target[1];
return /*1506*/(function let_1506() {const $target = /*1517*//*1517*//*1517*/cons/*<1517*/(/*1517*//*1518*/a/*<1518*/)/*<1517*/(/*1517*//*1520*/args/*<1520*/)/*<1517*/;
{
let args = $target;
return /*1506*/(function let_1506() {const $target = /*1525*//*1525*//*1525*//*1526*/tts_list/*<1526*/(/*1525*//*1527*/args/*<1527*/)/*<1525*/(/*1525*//*1528*/free/*<1528*/)/*<1525*/(/*1525*//*1529*/locs/*<1529*/)/*<1525*/;
if ($target.type === ",") {
{
let args = $target[0];
{
let free = $target[1];
return /*1506*/(function let_1506() {const $target = /*1534*//*1534*//*1534*//*1535*/tts_inner/*<1535*/(/*1534*//*1536*/r/*<1536*/)/*<1534*/(/*1534*//*1537*/free/*<1537*/)/*<1534*/(/*1534*//*1538*/locs/*<1538*/)/*<1534*/;
if ($target.type === ",") {
{
let two = $target[0];
{
let free = $target[1];
return /*1539*//*1539*//*1540*/$co/*<1540*/(/*1539*//*1541*//*1541*//*1541*//*1542*/and_loc/*<1542*/(/*1541*//*1543*/locs/*<1543*/)/*<1541*/(/*1541*//*1544*/l/*<1544*/)/*<1541*/(/*1541*//*1545*/`(fn [${/*1547*//*1547*//*1548*/join/*<1548*/(/*1547*//*1549*/" "/*<1549*/)/*<1547*/(/*1547*//*1551*//*1551*//*1552*/rev/*<1552*/(/*1551*//*1553*/args/*<1553*/)/*<1551*/(/*1551*//*1554*/nil/*<1554*/)/*<1551*/)/*<1547*/}] ${/*1556*/two/*<1556*/})`/*<1545*/)/*<1541*/)/*<1539*/(/*1539*//*1558*/free/*<1558*/)/*<1539*/
}
}
};
throw new Error('let pattern not matched 1530. ' + valueToString($target));})(/*!*/)/*<1506*/
}
}
};
throw new Error('let pattern not matched 1521. ' + valueToString($target));})(/*!*/)/*<1506*/
};
throw new Error('let pattern not matched 1516. ' + valueToString($target));})(/*!*/)/*<1506*/
}
}
};
throw new Error('let pattern not matched 1509. ' + valueToString($target));})(/*!*/)/*<1506*/
}
}
}
}
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
return /*1564*/(function let_1564() {const $target = /*1571*//*1572*/unwrap_app/*<1572*/(/*1571*//*1573*/a/*<1573*/)/*<1571*/;
if ($target.type === ",") {
{
let target = $target[0];
{
let args = $target[1];
return /*1564*/(function let_1564() {const $target = /*1575*//*1575*//*1575*/cons/*<1575*/(/*1575*//*1576*/b/*<1576*/)/*<1575*/(/*1575*//*1578*/args/*<1578*/)/*<1575*/;
{
let args = $target;
return /*1564*/(function let_1564() {const $target = /*1580*//*1580*//*1581*/rev/*<1581*/(/*1580*//*1582*/args/*<1582*/)/*<1580*/(/*1580*//*1583*/nil/*<1583*/)/*<1580*/;
{
let args = $target;
return /*1564*/(function let_1564() {const $target = /*1588*//*1588*//*1588*//*1589*/tts_list/*<1589*/(/*1588*//*1590*/args/*<1590*/)/*<1588*/(/*1588*//*1591*/free/*<1591*/)/*<1588*/(/*1588*//*1592*/locs/*<1592*/)/*<1588*/;
if ($target.type === ",") {
{
let args = $target[0];
{
let free = $target[1];
return /*1564*/(function let_1564() {const $target = /*1597*//*1597*//*1597*//*1598*/tts_inner/*<1598*/(/*1597*//*1599*/target/*<1599*/)/*<1597*/(/*1597*//*1600*/free/*<1600*/)/*<1597*/(/*1597*//*1601*/locs/*<1601*/)/*<1597*/;
if ($target.type === ",") {
{
let one = $target[0];
{
let free = $target[1];
return /*1602*//*1602*//*1603*/$co/*<1603*/(/*1602*//*1604*//*1604*//*1604*//*1605*/and_loc/*<1605*/(/*1604*//*1606*/locs/*<1606*/)/*<1604*/(/*1604*//*1607*/l/*<1607*/)/*<1604*/(/*1604*//*1608*/`(${/*1610*/one/*<1610*/} ${/*1612*//*1612*//*1613*/join/*<1613*/(/*1612*//*1614*/" "/*<1614*/)/*<1612*/(/*1612*//*1616*//*1616*//*1617*/rev/*<1617*/(/*1616*//*1618*/args/*<1618*/)/*<1616*/(/*1616*//*1619*/nil/*<1619*/)/*<1616*/)/*<1612*/})`/*<1608*/)/*<1604*/)/*<1602*/(/*1602*//*1621*/free/*<1621*/)/*<1602*/
}
}
};
throw new Error('let pattern not matched 1593. ' + valueToString($target));})(/*!*/)/*<1564*/
}
}
};
throw new Error('let pattern not matched 1584. ' + valueToString($target));})(/*!*/)/*<1564*/
};
throw new Error('let pattern not matched 1579. ' + valueToString($target));})(/*!*/)/*<1564*/
};
throw new Error('let pattern not matched 1574. ' + valueToString($target));})(/*!*/)/*<1564*/
}
}
};
throw new Error('let pattern not matched 1567. ' + valueToString($target));})(/*!*/)/*<1564*/
}
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 1403');})(/*!*//*1405*/t/*<1405*/)/*<1403*/ }/*<1396*/ }/*<1396*/ }/*<1396*/;

const type_to_string = /*1622*/function name_1622(t) { return /*1627*/(function let_1627() {const $target = /*1634*//*1634*//*1634*//*1635*/tts_inner/*<1635*/(/*1634*//*1636*/t/*<1636*/)/*<1634*/(/*1634*//*1637*//*1637*//*1638*/$co/*<1638*/(/*1637*//*1639*//*1640*/some/*<1640*/(/*1639*//*1641*/map$slnil/*<1641*/)/*<1639*/)/*<1637*/(/*1637*//*1642*/0/*<1642*/)/*<1637*/)/*<1634*/(/*1634*//*1643*/false/*<1643*/)/*<1634*/;
if ($target.type === ",") {
{
let text = $target[0];
return /*1644*/text/*<1644*/
}
};
throw new Error('let pattern not matched 1630. ' + valueToString($target));})(/*!*/)/*<1627*/ }/*<1622*/;

const type_to_string_raw = /*1682*/function name_1682(t) { return /*1687*/(function let_1687() {const $target = /*1694*//*1694*//*1694*//*1695*/tts_inner/*<1695*/(/*1694*//*1696*/t/*<1696*/)/*<1694*/(/*1694*//*1697*//*1697*//*1698*/$co/*<1698*/(/*1697*//*1699*/none/*<1699*/)/*<1697*/(/*1697*//*1700*/0/*<1700*/)/*<1697*/)/*<1694*/(/*1694*//*1701*/false/*<1701*/)/*<1694*/;
if ($target.type === ",") {
{
let text = $target[0];
return /*1702*/text/*<1702*/
}
};
throw new Error('let pattern not matched 1690. ' + valueToString($target));})(/*!*/)/*<1687*/ }/*<1682*/;

return {type: 'fns', and_loc, expr_loc, expr_to_string, letters, pat_loc, pat_to_string, tts_inner, tts_list, type$slset_loc, type_loc, type_to_string, type_to_string_raw, type_with_free, unwrap_app, unwrap_fn}