const pint = (v0) => (v1) => ({type: "pint", 0: v0, 1: v1});
const pbool = (v0) => (v1) => ({type: "pbool", 0: v0, 1: v1});
const some = (v0) => ({type: "some", 0: v0});
const none = ({type: "none"});
const its = /*10495*/int_to_string/*<10495*/;

const and_loc = /*10956*/function name_10956(locs) { return function name_10956(l) { return function name_10956(s) { return /*10964*/(function match_10964($target) {
if ($target === true) {
return /*10968*/`${/*10970*/s/*<10970*/}:${/*11002*/(function match_11002($target) {
if ($target === true) {
return /*11008*/"🚨"/*<11008*/
}
return /*10975*//*10972*/its/*<10972*//*10975*/(/*10976*/l/*<10976*/)/*<10975*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 11002');})(/*!*//*11004*//*11005*/$eq/*<11005*//*11004*/(/*11006*/l/*<11006*/)(/*11007*/-1/*<11007*/)/*<11004*/)/*<11002*/}`/*<10968*/
}
return /*10977*/s/*<10977*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 10964');})(/*!*//*10967*/locs/*<10967*/)/*<10964*/ } } }/*<10956*/;

const value = ({type: "value"});
const type = ({type: "type"});
const apply_tuple = /*11883*/function name_11883(f) { return function name_11883({0: a, 1: b}) {
 return /*11894*//*11895*/f/*<11895*//*11894*/(/*11896*/a/*<11896*/)(/*11897*/b/*<11897*/)/*<11894*/ } }/*<11883*/;

const map$slhas = /*13428*/function name_13428(map) { return function name_13428(k) { return /*13436*/(function match_13436($target) {
if ($target.type === "some") {
return /*13445*/true/*<13445*/
}
return /*13447*/false/*<13447*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 13436');})(/*!*//*13438*//*13439*/map$slget/*<13439*//*13438*/(/*13440*/map/*<13440*/)(/*13441*/k/*<13441*/)/*<13438*/)/*<13436*/ } }/*<13428*/;

const fst = /*13743*/function name_13743({0: a}) { return /*13752*/a/*<13752*/ }/*<13743*/;

const dot = /*16114*/function name_16114(a) { return function name_16114(b) { return function name_16114(c) { return /*16123*//*16124*/a/*<16124*//*16123*/(/*16125*//*16126*/b/*<16126*//*16125*/(/*16127*/c/*<16127*/)/*<16125*/)/*<16123*/ } } }/*<16114*/;

const ok = (v0) => ({type: "ok", 0: v0});
const err = (v0) => ({type: "err", 0: v0});
const force = /*16700*/function name_16700(e_$gts) { return function name_16700(result) { return /*16706*/(function match_16706($target) {
if ($target.type === "ok") {
{
let v = $target[0];
return /*16712*/v/*<16712*/
}
}
if ($target.type === "err") {
{
let e = $target[0];
return /*16718*//*16719*/fatal/*<16719*//*16718*/(/*16720*//*18487*/e_$gts/*<18487*//*16720*/(/*18488*/e/*<18488*/)/*<16720*/)/*<16718*/
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 16706');})(/*!*//*16708*/result/*<16708*/)/*<16706*/ } }/*<16700*/;

const snd = /*18373*/function name_18373({1: v}) { return /*18382*/v/*<18382*/ }/*<18373*/;

const type_error = /*18440*/function name_18440(message) { return function name_18440(loced_items) { return /*18448*//*18449*/$co/*<18449*//*18448*/(/*18450*/message/*<18450*/)(/*18451*/loced_items/*<18451*/)/*<18448*/ } }/*<18440*/;

const tvar = (v0) => (v1) => ({type: "tvar", 0: v0, 1: v1});
const tapp = (v0) => (v1) => (v2) => ({type: "tapp", 0: v0, 1: v1, 2: v2});
const tcon = (v0) => (v1) => ({type: "tcon", 0: v0, 1: v1});
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
const cons = (v0) => (v1) => ({type: "cons", 0: v0, 1: v1});
const nil = ({type: "nil"});
const cst$sllist = (v0) => (v1) => ({type: "cst/list", 0: v0, 1: v1});
const cst$slarray = (v0) => (v1) => ({type: "cst/array", 0: v0, 1: v1});
const cst$slspread = (v0) => (v1) => ({type: "cst/spread", 0: v0, 1: v1});
const cst$slidentifier = (v0) => (v1) => ({type: "cst/identifier", 0: v0, 1: v1});
const cst$slstring = (v0) => (v1) => (v2) => ({type: "cst/string", 0: v0, 1: v1, 2: v2});
const scheme = (v0) => (v1) => ({type: "scheme", 0: v0, 1: v1});
const type_free = /*754*/function name_754(type) { return /*761*/(function match_761($target) {
if ($target.type === "tvar") {
{
let n = $target[0];
return /*769*//*953*/set$sladd/*<953*//*769*/(/*954*/set$slnil/*<954*/)(/*955*/n/*<955*/)/*<769*/
}
}
if ($target.type === "tcon") {
return /*775*/set$slnil/*<775*/
}
if ($target.type === "tapp") {
{
let a = $target[0];
{
let b = $target[1];
return /*781*//*794*/set$slmerge/*<794*//*781*/(/*795*//*796*/type_free/*<796*//*795*/(/*797*/a/*<797*/)/*<795*/)(/*798*//*799*/type_free/*<799*//*798*/(/*800*/b/*<800*/)/*<798*/)/*<781*/
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 761');})(/*!*//*763*/type/*<763*/)/*<761*/ }/*<754*/;

const type_apply = /*839*/function name_839(subst) { return function name_839(type) { return /*847*/(function match_847($target) {
if ($target.type === "tvar") {
{
let n = $target[0];
return /*854*/(function match_854($target) {
if ($target.type === "none") {
return /*864*/type/*<864*/
}
if ($target.type === "some") {
{
let t = $target[0];
return /*868*/t/*<868*/
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 854');})(/*!*//*856*//*928*/map$slget/*<928*//*856*/(/*861*/subst/*<861*/)(/*929*/n/*<929*/)/*<856*/)/*<854*/
}
}
if ($target.type === "tapp") {
{
let a = $target[0];
{
let b = $target[1];
{
let c = $target[2];
return /*874*//*875*/tapp/*<875*//*874*/(/*876*//*877*/type_apply/*<877*//*876*/(/*878*/subst/*<878*/)(/*879*/a/*<879*/)/*<876*/)(/*881*//*882*/type_apply/*<882*//*881*/(/*883*/subst/*<883*/)(/*884*/b/*<884*/)/*<881*/)(/*885*/c/*<885*/)/*<874*/
}
}
}
}
return /*887*/type/*<887*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 847');})(/*!*//*849*/type/*<849*/)/*<847*/ } }/*<839*/;

const scheme_free = /*888*/function name_888({0: vbls, 1: type}) {
 return /*895*//*900*/set$sldiff/*<900*//*895*/(/*901*//*902*/type_free/*<902*//*901*/(/*903*/type/*<903*/)/*<901*/)(/*904*/vbls/*<904*/)/*<895*/ }/*<888*/;

const map = /*1005*/function name_1005(values) { return function name_1005(f) { return /*1012*/(function match_1012($target) {
if ($target.type === "nil") {
return /*1016*/nil/*<1016*/
}
if ($target.type === "cons") {
{
let one = $target[0];
{
let rest = $target[1];
return /*1023*//*1023*/cons/*<1023*//*1023*/(/*1024*//*1025*/f/*<1025*//*1024*/(/*1026*/one/*<1026*/)/*<1024*/)(/*1027*//*1031*/map/*<1031*//*1027*/(/*1032*/rest/*<1032*/)(/*1033*/f/*<1033*/)/*<1027*/)/*<1023*/
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 1012');})(/*!*//*1014*/values/*<1014*/)/*<1012*/ } }/*<1005*/;

const mapi = /*1034*/function name_1034(i) { return function name_1034(values) { return function name_1034(f) { return /*1042*/(function match_1042($target) {
if ($target.type === "nil") {
return /*1046*/nil/*<1046*/
}
if ($target.type === "cons") {
{
let one = $target[0];
{
let rest = $target[1];
return /*1053*//*1053*/cons/*<1053*//*1053*/(/*1054*//*1055*/f/*<1055*//*1054*/(/*1056*/i/*<1056*/)(/*1057*/one/*<1057*/)/*<1054*/)(/*1058*//*1062*/mapi/*<1062*//*1058*/(/*1063*//*1064*/$pl/*<1064*//*1063*/(/*1065*/1/*<1065*/)(/*1066*/i/*<1066*/)/*<1063*/)(/*1067*/rest/*<1067*/)(/*1068*/f/*<1068*/)/*<1058*/)/*<1053*/
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 1042');})(/*!*//*1044*/values/*<1044*/)/*<1042*/ } } }/*<1034*/;

const foldl = /*1069*/function name_1069(init) { return function name_1069(items) { return function name_1069(f) { return /*1077*/(function match_1077($target) {
if ($target.type === "nil") {
return /*1081*/init/*<1081*/
}
if ($target.type === "cons") {
{
let one = $target[0];
{
let rest = $target[1];
return /*1088*//*1089*/foldl/*<1089*//*1088*/(/*1090*//*1091*/f/*<1091*//*1090*/(/*1092*/init/*<1092*/)(/*1093*/one/*<1093*/)/*<1090*/)(/*1094*/rest/*<1094*/)(/*1095*/f/*<1095*/)/*<1088*/
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 1077');})(/*!*//*1079*/items/*<1079*/)/*<1077*/ } } }/*<1069*/;

const foldr = /*1106*/function name_1106(init) { return function name_1106(items) { return function name_1106(f) { return /*1114*/(function match_1114($target) {
if ($target.type === "nil") {
return /*1118*/init/*<1118*/
}
if ($target.type === "cons") {
{
let one = $target[0];
{
let rest = $target[1];
return /*1125*//*1126*/f/*<1126*//*1125*/(/*1127*//*1128*/foldr/*<1128*//*1127*/(/*1129*/init/*<1129*/)(/*1130*/rest/*<1130*/)(/*1131*/f/*<1131*/)/*<1127*/)(/*1132*/one/*<1132*/)/*<1125*/
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 1114');})(/*!*//*1116*/items/*<1116*/)/*<1114*/ } } }/*<1106*/;

const var_bind = /*1567*/function name_1567($var) { return function name_1567(type) { return /*1575*/(function match_1575($target) {
if ($target.type === "tvar") {
{
let v = $target[0];
return /*1582*/(function match_1582($target) {
if ($target === true) {
return /*1588*/map$slnil/*<1588*/
}
return /*1592*//*1617*/map$slset/*<1617*//*1592*/(/*1618*/map$slnil/*<1618*/)(/*1619*/$var/*<1619*/)(/*1620*/type/*<1620*/)/*<1592*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 1582');})(/*!*//*1584*//*1585*/$eq/*<1585*//*1584*/(/*1586*/$var/*<1586*/)(/*1587*/v/*<1587*/)/*<1584*/)/*<1582*/
}
}
return /*1597*/(function match_1597($target) {
if ($target === true) {
return /*1605*//*1606*/fatal/*<1606*//*1605*/(/*1607*/"occurs check"/*<1607*/)/*<1605*/
}
return /*1614*//*1610*/map$slset/*<1610*//*1614*/(/*1611*/map$slnil/*<1611*/)(/*1612*/$var/*<1612*/)(/*1613*/type/*<1613*/)/*<1614*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 1597');})(/*!*//*1599*//*1600*/set$slhas/*<1600*//*1599*/(/*1601*//*1602*/type_free/*<1602*//*1601*/(/*1603*/type/*<1603*/)/*<1601*/)(/*1604*/$var/*<1604*/)/*<1599*/)/*<1597*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 1575');})(/*!*//*1577*/type/*<1577*/)/*<1575*/ } }/*<1567*/;

const t_prim = /*1627*/function name_1627(prim) { return /*1633*/(function match_1633($target) {
if ($target.type === "pint") {
{
let l = $target[1];
return /*1639*//*1640*/tcon/*<1640*//*1639*/(/*1641*/"int"/*<1641*/)(/*1643*/l/*<1643*/)/*<1639*/
}
}
if ($target.type === "pbool") {
{
let l = $target[1];
return /*1649*//*1650*/tcon/*<1650*//*1649*/(/*1651*/"bool"/*<1651*/)(/*1653*/l/*<1653*/)/*<1649*/
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 1633');})(/*!*//*1635*/prim/*<1635*/)/*<1633*/ }/*<1627*/;

const tfn = /*1865*/function name_1865(a) { return function name_1865(b) { return function name_1865(l) { return /*1873*//*1874*/tapp/*<1874*//*1873*/(/*1875*//*1876*/tapp/*<1876*//*1875*/(/*1877*//*1878*/tcon/*<1878*//*1877*/(/*1879*/"->"/*<1879*/)(/*1881*/l/*<1881*/)/*<1877*/)(/*1882*/a/*<1882*/)(/*1886*/l/*<1886*/)/*<1875*/)(/*1887*/b/*<1887*/)(/*1888*/l/*<1888*/)/*<1873*/ } } }/*<1865*/;

const tint = /*2055*//*2056*/tcon/*<2056*//*2055*/(/*2057*/"int"/*<2057*/)(/*2059*/-1/*<2059*/)/*<2055*/;

const map_without = /*2665*/function name_2665(map) { return function name_2665(set) { return /*2672*//*2673*/foldr/*<2673*//*2672*/(/*2674*/map/*<2674*/)(/*2675*//*2676*/set$slto_list/*<2676*//*2675*/(/*2678*/set/*<2678*/)/*<2675*/)(/*2679*/map$slrm/*<2679*/)/*<2672*/ } }/*<2665*/;

const demo_new_subst = /*2692*//*2693*/map$slfrom_list/*<2693*//*2692*/(/*2694*//*2694*/cons/*<2694*//*2694*/(/*2695*//*2696*/$co/*<2696*//*2695*/(/*2697*/"a"/*<2697*/)(/*2699*//*2700*/tcon/*<2700*//*2699*/(/*2701*/"a-mapped"/*<2701*/)(/*2703*/-1/*<2703*/)/*<2699*/)/*<2695*/)(/*2694*//*2694*/cons/*<2694*//*2694*/(/*2774*//*2775*/$co/*<2775*//*2774*/(/*2776*/"b"/*<2776*/)(/*2778*//*2779*/tvar/*<2779*//*2778*/(/*2780*/"c"/*<2780*/)(/*2782*/-1/*<2782*/)/*<2778*/)/*<2774*/)(/*2694*/nil/*<2694*/)/*<2694*/)/*<2694*/)/*<2692*/;

const tconstructor = (v0) => (v1) => (v2) => ({type: "tconstructor", 0: v0, 1: v1, 2: v2});
const zip = /*3516*/function name_3516(one) { return function name_3516(two) { return /*3523*/(function match_3523($target) {
if ($target.type === ",") {
if ($target[0].type === "nil") {
if ($target[1].type === "nil") {
return /*3534*/nil/*<3534*/
}
}
}
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
return /*3561*//*3561*/cons/*<3561*//*3561*/(/*3562*//*3563*/$co/*<3563*//*3562*/(/*3564*/a/*<3564*/)(/*3565*/b/*<3565*/)/*<3562*/)(/*3566*//*3570*/zip/*<3570*//*3566*/(/*3571*/one/*<3571*/)(/*3572*/two/*<3572*/)/*<3566*/)/*<3561*/
}
}
}
}
}
}
}
return /*3576*/nil/*<3576*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 3523');})(/*!*//*3525*//*3526*/$co/*<3526*//*3525*/(/*3527*/one/*<3527*/)(/*3528*/two/*<3528*/)/*<3525*/)/*<3523*/ } }/*<3516*/;

const type_with_free = /*5172*/function name_5172(type) { return function name_5172(free) { return /*5179*/(function match_5179($target) {
if ($target.type === "tvar") {
return /*5186*/type/*<5186*/
}
if ($target.type === "tcon") {
{
let s = $target[0];
{
let l = $target[1];
return /*5191*/(function match_5191($target) {
if ($target === true) {
return /*5198*//*5199*/tvar/*<5199*//*5198*/(/*5200*/s/*<5200*/)(/*5201*/l/*<5201*/)/*<5198*/
}
return /*5202*/type/*<5202*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 5191');})(/*!*//*5193*//*5195*/set$slhas/*<5195*//*5193*/(/*5196*/free/*<5196*/)(/*5197*/s/*<5197*/)/*<5193*/)/*<5191*/
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
return /*5209*//*5210*/tapp/*<5210*//*5209*/(/*5211*//*5212*/type_with_free/*<5212*//*5211*/(/*5213*/a/*<5213*/)(/*5214*/free/*<5214*/)/*<5211*/)(/*5215*//*5216*/type_with_free/*<5216*//*5215*/(/*5217*/b/*<5217*/)(/*5218*/free/*<5218*/)/*<5215*/)(/*5219*/l/*<5219*/)/*<5209*/
}
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 5179');})(/*!*//*5181*/type/*<5181*/)/*<5179*/ } }/*<5172*/;

const tbool = /*5416*//*5417*/tcon/*<5417*//*5416*/(/*5418*/"bool"/*<5418*/)(/*5421*/-1/*<5421*/)/*<5416*/;

const at = /*5746*/function name_5746(arr) { return function name_5746(i) { return function name_5746(default_) { return /*5753*/(function match_5753($target) {
if ($target.type === "nil") {
return /*5768*/default_/*<5768*/
}
if ($target.type === "cons") {
{
let one = $target[0];
{
let rest = $target[1];
return /*5776*/(function match_5776($target) {
if ($target === true) {
return /*5784*/one/*<5784*/
}
return /*5785*//*5786*/at/*<5786*//*5785*/(/*5787*/rest/*<5787*/)(/*5788*//*5789*/_/*<5789*//*5788*/(/*5790*/i/*<5790*/)(/*5791*/1/*<5791*/)/*<5788*/)(/*5792*/default_/*<5792*/)/*<5785*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 5776');})(/*!*//*5778*//*5781*/$eq/*<5781*//*5778*/(/*5782*/i/*<5782*/)(/*5783*/0/*<5783*/)/*<5778*/)/*<5776*/
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 5753');})(/*!*//*5766*/arr/*<5766*/)/*<5753*/ } } }/*<5746*/;

const letters = /*5798*//*5798*/cons/*<5798*//*5798*/(/*5799*/"a"/*<5799*/)(/*5798*//*5798*/cons/*<5798*//*5798*/(/*5801*/"b"/*<5801*/)(/*5798*//*5798*/cons/*<5798*//*5798*/(/*5803*/"c"/*<5803*/)(/*5798*//*5798*/cons/*<5798*//*5798*/(/*5805*/"d"/*<5805*/)(/*5798*//*5798*/cons/*<5798*//*5798*/(/*5807*/"e"/*<5807*/)(/*5798*//*5798*/cons/*<5798*//*5798*/(/*5809*/"f"/*<5809*/)(/*5798*//*5798*/cons/*<5798*//*5798*/(/*5811*/"g"/*<5811*/)(/*5798*//*5798*/cons/*<5798*//*5798*/(/*5813*/"h"/*<5813*/)(/*5798*//*5798*/cons/*<5798*//*5798*/(/*5815*/"i"/*<5815*/)(/*5798*//*5798*/cons/*<5798*//*5798*/(/*6782*/"j"/*<6782*/)(/*5798*//*5798*/cons/*<5798*//*5798*/(/*6784*/"k"/*<6784*/)(/*5798*//*5798*/cons/*<5798*//*5798*/(/*6786*/"l"/*<6786*/)(/*5798*//*5798*/cons/*<5798*//*5798*/(/*6788*/"m"/*<6788*/)(/*5798*//*5798*/cons/*<5798*//*5798*/(/*6790*/"n"/*<6790*/)(/*5798*//*5798*/cons/*<5798*//*5798*/(/*6792*/"o"/*<6792*/)(/*5798*/nil/*<5798*/)/*<5798*/)/*<5798*/)/*<5798*/)/*<5798*/)/*<5798*/)/*<5798*/)/*<5798*/)/*<5798*/)/*<5798*/)/*<5798*/)/*<5798*/)/*<5798*/)/*<5798*/)/*<5798*/)/*<5798*/;

const unwrap_fn = /*5852*/function name_5852(t) { return /*5858*/(function match_5858($target) {
if ($target.type === "tapp") {
if ($target[0].type === "tapp") {
if ($target[0][0].type === "tcon") {
if ($target[0][0][0] === "->"){
{
let a = $target[0][1];
{
let b = $target[1];
return /*5875*/(function let_5875() {const $target = /*5882*//*5883*/unwrap_fn/*<5883*//*5882*/(/*5884*/b/*<5884*/)/*<5882*/;
if ($target.type === ",") {
{
let args = $target[0];
{
let res = $target[1];
return /*5885*//*5886*/$co/*<5886*//*5885*/(/*5887*//*5887*/cons/*<5887*//*5887*/(/*5888*/a/*<5888*/)(/*5893*/args/*<5893*/)/*<5887*/)(/*5899*/res/*<5899*/)/*<5885*/
}
}
};
throw new Error('let pattern not matched 5878. ' + valueToString($target));})(/*!*/)/*<5875*/
}
}
}
}
}
}
return /*5901*//*5902*/$co/*<5902*//*5901*/(/*5903*/nil/*<5903*/)(/*5904*/t/*<5904*/)/*<5901*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 5858');})(/*!*//*5860*/t/*<5860*/)/*<5858*/ }/*<5852*/;

const join = /*5929*/function name_5929(sep) { return function name_5929(arr) { return /*5939*/(function match_5939($target) {
if ($target.type === "nil") {
return /*5945*/""/*<5945*/
}
if ($target.type === "cons") {
{
let one = $target[0];
if ($target[1].type === "nil") {
return /*6011*/one/*<6011*/
}
}
}
if ($target.type === "cons") {
{
let one = $target[0];
{
let rest = $target[1];
return /*5953*/`${/*5955*/one/*<5955*/}${/*5957*/sep/*<5957*/}${/*5959*//*5961*/join/*<5961*//*5959*/(/*5962*/sep/*<5962*/)(/*5963*/rest/*<5963*/)/*<5959*/}`/*<5953*/
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 5939');})(/*!*//*5943*/arr/*<5943*/)/*<5939*/ } }/*<5929*/;

const rev = /*6057*/function name_6057(arr) { return function name_6057(col) { return /*6063*/(function match_6063($target) {
if ($target.type === "nil") {
return /*6067*/col/*<6067*/
}
if ($target.type === "cons") {
{
let one = $target[0];
if ($target[1].type === "nil") {
return /*6070*//*6070*/cons/*<6070*//*6070*/(/*6071*/one/*<6071*/)(/*6082*/col/*<6082*/)/*<6070*/
}
}
}
if ($target.type === "cons") {
{
let one = $target[0];
{
let rest = $target[1];
return /*6078*//*6079*/rev/*<6079*//*6078*/(/*6080*/rest/*<6080*/)(/*6086*//*6086*/cons/*<6086*//*6086*/(/*6087*/one/*<6087*/)(/*6088*/col/*<6088*/)/*<6086*/)/*<6078*/
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 6063');})(/*!*//*6065*/arr/*<6065*/)/*<6063*/ } }/*<6057*/;

const unwrap_app = /*6108*/function name_6108(t) { return /*6114*/(function match_6114($target) {
if ($target.type === "tapp") {
{
let a = $target[0];
{
let b = $target[1];
return /*6122*/(function let_6122() {const $target = /*6129*//*6130*/unwrap_app/*<6130*//*6129*/(/*6131*/a/*<6131*/)/*<6129*/;
if ($target.type === ",") {
{
let target = $target[0];
{
let args = $target[1];
return /*6132*//*6133*/$co/*<6133*//*6132*/(/*6134*/target/*<6134*/)(/*6135*//*6135*/cons/*<6135*//*6135*/(/*6136*/b/*<6136*/)(/*6137*/args/*<6137*/)/*<6135*/)/*<6132*/
}
}
};
throw new Error('let pattern not matched 6125. ' + valueToString($target));})(/*!*/)/*<6122*/
}
}
}
return /*6251*//*6252*/$co/*<6252*//*6251*/(/*6253*/t/*<6253*/)(/*6254*/nil/*<6254*/)/*<6251*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 6114');})(/*!*//*6116*/t/*<6116*/)/*<6114*/ }/*<6108*/;

const concat = /*7401*/function name_7401(one) { return function name_7401(two) { return /*7408*/(function match_7408($target) {
if ($target.type === "nil") {
return /*7412*/two/*<7412*/
}
if ($target.type === "cons") {
{
let one = $target[0];
if ($target[1].type === "nil") {
return /*7416*//*7416*/cons/*<7416*//*7416*/(/*7417*/one/*<7417*/)(/*7418*/two/*<7418*/)/*<7416*/
}
}
}
if ($target.type === "cons") {
{
let one = $target[0];
{
let rest = $target[1];
return /*7428*//*7428*/cons/*<7428*//*7428*/(/*7429*/one/*<7429*/)(/*7430*//*7434*/concat/*<7434*//*7430*/(/*7437*/rest/*<7437*/)(/*7438*/two/*<7438*/)/*<7430*/)/*<7428*/
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 7408');})(/*!*//*7410*/one/*<7410*/)/*<7408*/ } }/*<7401*/;

const filter = /*8028*/function name_8028(f) { return function name_8028(list) { return /*8037*/(function match_8037($target) {
if ($target.type === "nil") {
return /*8042*/nil/*<8042*/
}
if ($target.type === "cons") {
{
let one = $target[0];
{
let rest = $target[1];
return /*8049*/(function match_8049($target) {
if ($target === true) {
return /*8054*//*8054*/cons/*<8054*//*8054*/(/*8055*/one/*<8055*/)(/*8056*//*8060*/filter/*<8060*//*8056*/(/*8061*/f/*<8061*/)(/*8062*/rest/*<8062*/)/*<8056*/)/*<8054*/
}
return /*8063*//*8064*/filter/*<8064*//*8063*/(/*8065*/f/*<8065*/)(/*8066*/rest/*<8066*/)/*<8063*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 8049');})(/*!*//*8051*//*8052*/f/*<8052*//*8051*/(/*8053*/one/*<8053*/)/*<8051*/)/*<8049*/
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 8037');})(/*!*//*8040*/list/*<8040*/)/*<8037*/ } }/*<8028*/;

const type_loc = /*8803*/function name_8803(type) { return /*8809*/(function match_8809($target) {
if ($target.type === "tvar") {
{
let l = $target[1];
return /*8816*/l/*<8816*/
}
}
if ($target.type === "tapp") {
{
let l = $target[2];
return /*8822*/l/*<8822*/
}
}
if ($target.type === "tcon") {
{
let l = $target[1];
return /*8827*/l/*<8827*/
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 8809');})(/*!*//*8811*/type/*<8811*/)/*<8809*/ }/*<8803*/;

const tstring = /*8906*//*8907*/tcon/*<8907*//*8906*/(/*8908*/"string"/*<8908*/)(/*8910*/-1/*<8910*/)/*<8906*/;

const tmap = /*8997*/function name_8997(k) { return function name_8997(v) { return /*9004*//*9005*/tapp/*<9005*//*9004*/(/*9006*//*9007*/tapp/*<9007*//*9006*/(/*9008*//*9009*/tcon/*<9009*//*9008*/(/*9010*/"map"/*<9010*/)(/*9012*/-1/*<9012*/)/*<9008*/)(/*9013*/k/*<9013*/)(/*9732*/-1/*<9732*/)/*<9006*/)(/*9018*/v/*<9018*/)(/*9730*/-1/*<9730*/)/*<9004*/ } }/*<8997*/;

const tfns = /*9041*/function name_9041(args) { return function name_9041(result) { return /*9048*//*9049*/foldr/*<9049*//*9048*/(/*9050*/result/*<9050*/)(/*9051*/args/*<9051*/)(/*9052*/function name_9052(result) { return function name_9052(arg) { return /*9059*//*9060*/tfn/*<9060*//*9059*/(/*9061*/arg/*<9061*/)(/*9062*/result/*<9062*/)(/*9063*/-1/*<9063*/)/*<9059*/ } }/*<9052*/)/*<9048*/ } }/*<9041*/;

const toption = /*9110*/function name_9110(arg) { return /*9116*//*9117*/tapp/*<9117*//*9116*/(/*9118*//*9119*/tcon/*<9119*//*9118*/(/*9120*/"option"/*<9120*/)(/*9122*/-1/*<9122*/)/*<9118*/)(/*9123*/arg/*<9123*/)(/*9139*/-1/*<9139*/)/*<9116*/ }/*<9110*/;

const tarray = /*9124*/function name_9124(arg) { return /*9130*//*9131*/tapp/*<9131*//*9130*/(/*9132*//*9133*/tcon/*<9133*//*9132*/(/*9134*/"array"/*<9134*/)(/*9136*/-1/*<9136*/)/*<9132*/)(/*9137*/arg/*<9137*/)(/*9138*/-1/*<9138*/)/*<9130*/ }/*<9124*/;

const concrete = /*9144*/function name_9144(t) { return /*9150*//*9151*/scheme/*<9151*//*9150*/(/*9152*/set$slnil/*<9152*/)(/*9153*/t/*<9153*/)/*<9150*/ }/*<9144*/;

const generic = /*9154*/function name_9154(vbls) { return function name_9154(t) { return /*9161*//*9162*/scheme/*<9162*//*9161*/(/*9164*//*9165*/set$slfrom_list/*<9165*//*9164*/(/*9166*/vbls/*<9166*/)/*<9164*/)(/*9167*/t/*<9167*/)/*<9161*/ } }/*<9154*/;

const vbl = /*9178*/function name_9178(k) { return /*9185*//*9186*/tvar/*<9186*//*9185*/(/*9187*/k/*<9187*/)(/*9188*/-1/*<9188*/)/*<9185*/ }/*<9178*/;

const tset = /*9390*/function name_9390(arg) { return /*9396*//*9397*/tapp/*<9397*//*9396*/(/*9400*//*9401*/tcon/*<9401*//*9400*/(/*9402*/"set"/*<9402*/)(/*9404*/-1/*<9404*/)/*<9400*/)(/*9405*/arg/*<9405*/)(/*9406*/-1/*<9406*/)/*<9396*/ }/*<9390*/;

const t$co = /*9544*/function name_9544(a) { return function name_9544(b) { return /*9551*//*9552*/tapp/*<9552*//*9551*/(/*9553*//*9554*/tapp/*<9554*//*9553*/(/*9555*//*9556*/tcon/*<9556*//*9555*/(/*9557*/","/*<9557*/)(/*9559*/-1/*<9559*/)/*<9555*/)(/*9560*/a/*<9560*/)(/*9731*/-1/*<9731*/)/*<9553*/)(/*9561*/b/*<9561*/)(/*9729*/-1/*<9729*/)/*<9551*/ } }/*<9544*/;

const scheme$sltype = /*10092*/function name_10092({1: type}) { return /*10102*/type/*<10102*/ }/*<10092*/;

const len = /*10352*/function name_10352(arr) { return /*10358*/(function match_10358($target) {
if ($target.type === "nil") {
return /*10362*/0/*<10362*/
}
if ($target.type === "cons") {
{
let one = $target[0];
{
let rest = $target[1];
return /*10369*//*10370*/$pl/*<10370*//*10369*/(/*10371*/1/*<10371*/)(/*10372*//*10373*/len/*<10373*//*10372*/(/*10374*/rest/*<10374*/)/*<10372*/)/*<10369*/
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 10358');})(/*!*//*10360*/arr/*<10360*/)/*<10358*/ }/*<10352*/;

const type$slset_loc = /*10661*/function name_10661(loc) { return function name_10661(type) { return /*10668*/(function match_10668($target) {
if ($target.type === "tvar") {
{
let name = $target[0];
return /*10675*//*10676*/tvar/*<10676*//*10675*/(/*10677*/name/*<10677*/)(/*10678*/loc/*<10678*/)/*<10675*/
}
}
if ($target.type === "tapp") {
{
let a = $target[0];
{
let b = $target[1];
return /*10684*//*10685*/tapp/*<10685*//*10684*/(/*11010*//*10686*/type$slset_loc/*<10686*//*11010*/(/*11011*/loc/*<11011*/)(/*11012*/a/*<11012*/)/*<11010*/)(/*11013*//*11014*/type$slset_loc/*<11014*//*11013*/(/*11015*/loc/*<11015*/)(/*10687*/b/*<10687*/)/*<11013*/)(/*10688*/loc/*<10688*/)/*<10684*/
}
}
}
if ($target.type === "tcon") {
{
let name = $target[0];
return /*10693*//*10694*/tcon/*<10694*//*10693*/(/*10695*/name/*<10695*/)(/*10696*/loc/*<10696*/)/*<10693*/
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 10668');})(/*!*//*10670*/type/*<10670*/)/*<10668*/ } }/*<10661*/;

const has_free = /*12010*/function name_12010(type) { return function name_12010(name) { return /*12017*/(function match_12017($target) {
if ($target.type === "tvar") {
{
let n = $target[0];
return /*12024*//*12025*/$eq/*<12025*//*12024*/(/*12026*/n/*<12026*/)(/*12027*/name/*<12027*/)/*<12024*/
}
}
if ($target.type === "tcon") {
return /*12033*/false/*<12033*/
}
if ($target.type === "tapp") {
{
let a = $target[0];
{
let b = $target[1];
return /*12039*/(function match_12039($target) {
if ($target === true) {
return /*12108*/true/*<12108*/
}
return /*12045*//*12046*/has_free/*<12046*//*12045*/(/*12047*/b/*<12047*/)(/*12048*/name/*<12048*/)/*<12045*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 12039');})(/*!*//*12041*//*12042*/has_free/*<12042*//*12041*/(/*12043*/a/*<12043*/)(/*12044*/name/*<12044*/)/*<12041*/)/*<12039*/
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 12017');})(/*!*//*12019*/type/*<12019*/)/*<12017*/ } }/*<12010*/;

const any = /*12080*/function name_12080(values) { return function name_12080(f) { return /*12087*/(function match_12087($target) {
if ($target.type === "nil") {
return /*12091*/false/*<12091*/
}
if ($target.type === "cons") {
{
let one = $target[0];
{
let rest = $target[1];
return /*12098*/(function match_12098($target) {
if ($target === true) {
return /*12103*/true/*<12103*/
}
return /*12104*//*12105*/any/*<12105*//*12104*/(/*12106*/rest/*<12106*/)(/*12107*/f/*<12107*/)/*<12104*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 12098');})(/*!*//*12100*//*12101*/f/*<12101*//*12100*/(/*12102*/one/*<12102*/)/*<12100*/)/*<12098*/
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 12087');})(/*!*//*12089*/values/*<12089*/)/*<12087*/ } }/*<12080*/;

const extract_type_call = /*13611*/function name_13611(type) { return function name_13611(args) { return /*13617*/(function match_13617($target) {
if ($target.type === "tapp") {
{
let one = $target[0];
{
let arg = $target[1];
{
let l = $target[2];
return /*13631*//*13632*/extract_type_call/*<13632*//*13631*/(/*13633*/one/*<13633*/)(/*13636*//*13636*/cons/*<13636*//*13636*/(/*13721*//*13637*/$co/*<13637*//*13721*/(/*13722*/arg/*<13722*/)(/*13724*/l/*<13724*/)/*<13721*/)(/*13931*/args/*<13931*/)/*<13636*/)/*<13631*/
}
}
}
}
return /*13638*//*13639*/$co/*<13639*//*13638*/(/*13640*/type/*<13640*/)(/*13641*/args/*<13641*/)/*<13638*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 13617');})(/*!*//*13619*/type/*<13619*/)/*<13617*/ } }/*<13611*/;

const replace_in_type = /*13753*/function name_13753(subst) { return function name_13753(type) { return /*13762*/(function match_13762($target) {
if ($target.type === "tvar") {
return /*13769*/type/*<13769*/
}
if ($target.type === "tcon") {
{
let name = $target[0];
{
let l = $target[1];
return /*13774*/(function match_13774($target) {
if ($target.type === "some") {
{
let v = $target[0];
return /*13785*//*13783*/type$slset_loc/*<13783*//*13785*/(/*13787*/l/*<13787*/)(/*13805*/v/*<13805*/)/*<13785*/
}
}
return /*13788*/type/*<13788*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 13774');})(/*!*//*13776*//*13777*/map$slget/*<13777*//*13776*/(/*13778*/subst/*<13778*/)(/*13779*/name/*<13779*/)/*<13776*/)/*<13774*/
}
}
}
if ($target.type === "tapp") {
{
let one = $target[0];
{
let two = $target[1];
{
let l = $target[2];
return /*13794*//*13795*/tapp/*<13795*//*13794*/(/*13796*//*13797*/replace_in_type/*<13797*//*13796*/(/*13798*/subst/*<13798*/)(/*13799*/one/*<13799*/)/*<13796*/)(/*13800*//*13801*/replace_in_type/*<13801*//*13800*/(/*13802*/subst/*<13802*/)(/*13803*/two/*<13803*/)/*<13800*/)(/*13804*/l/*<13804*/)/*<13794*/
}
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 13762');})(/*!*//*13764*/type/*<13764*/)/*<13762*/ } }/*<13753*/;

const StateT = (v0) => ({type: "StateT", 0: v0});
/* type alias State */
const run_$gt = /*16467*/function name_16467({0: f}) { return function name_16467(state) { return /*17041*//*17042*/snd/*<17042*//*17041*/(/*16476*//*16477*/f/*<16477*//*16476*/(/*16478*/state/*<16478*/)/*<16476*/)/*<17041*/ } }/*<16467*/;

const $lt_ = /*16525*/function name_16525(x) { return /*16531*//*16532*/StateT/*<16532*//*16531*/(/*16533*/function name_16533(state) { return /*18394*//*18395*/$co/*<18395*//*18394*/(/*18396*/state/*<18396*/)(/*16537*//*16538*/ok/*<16538*//*16537*/(/*16542*/x/*<16542*/)/*<16537*/)/*<18394*/ }/*<16533*/)/*<16531*/ }/*<16525*/;

const $lt_err = /*16543*/function name_16543(e) { return /*16549*//*16550*/StateT/*<16550*//*16549*/(/*16551*/function name_16551(state) { return /*18398*//*18399*/$co/*<18399*//*18398*/(/*18400*/state/*<18400*/)(/*16555*//*16556*/err/*<16556*//*16555*/(/*16557*/e/*<16557*/)/*<16555*/)/*<18398*/ }/*<16551*/)/*<16549*/ }/*<16543*/;

const ok_$gt = /*16601*/function name_16601(result) { return /*16608*/(function match_16608($target) {
if ($target.type === "ok") {
{
let v = $target[0];
return /*16615*//*16616*/$lt_/*<16616*//*16615*/(/*16617*/v/*<16617*/)/*<16615*/
}
}
if ($target.type === "err") {
{
let e = $target[0];
return /*16621*//*16622*/$lt_err/*<16622*//*16621*/(/*16624*/e/*<16624*/)/*<16621*/
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 16608');})(/*!*//*16610*/result/*<16610*/)/*<16608*/ }/*<16601*/;

const $lt_state = /*16686*//*16687*/StateT/*<16687*//*16686*/(/*16688*/function name_16688(state) { return /*18401*//*18402*/$co/*<18402*//*18401*/(/*18404*/state/*<18404*/)(/*16692*//*16693*/ok/*<16693*//*16692*/(/*16697*/state/*<16697*/)/*<16692*/)/*<18401*/ }/*<16688*/)/*<16686*/;

const state_$gt = /*16833*/function name_16833(v) { return /*16839*//*16840*/StateT/*<16840*//*16839*/(/*16841*/function name_16841(old) { return /*18405*//*18406*/$co/*<18406*//*18405*/(/*18407*/v/*<18407*/)(/*16845*//*16846*/ok/*<16846*//*16845*/(/*16850*/old/*<16850*/)/*<16845*/)/*<18405*/ }/*<16841*/)/*<16839*/ }/*<16833*/;

const state_f = /*17058*/function name_17058({0: f}) { return /*17068*/f/*<17068*/ }/*<17058*/;

const state$slnil = /*17467*//*17468*/$co/*<17468*//*17467*/(/*17469*/0/*<17469*/)(/*17470*/nil/*<17470*/)/*<17467*/;

const run$slnil_$gt = /*17474*/function name_17474(st) { return /*17480*//*17481*/run_$gt/*<17481*//*17480*/(/*17482*/st/*<17482*/)(/*17483*/state$slnil/*<17483*/)/*<17480*/ }/*<17474*/;

/* type alias type-error-t */
/* type alias usage-record */
const type_error_$gts = /*18489*/function name_18489({0: message, 1: items}) {
 return /*18557*/`${/*18498*/message/*<18498*/}${/*18560*//*18562*/join/*<18562*//*18560*/(/*18563*/""/*<18563*/)(/*18565*//*18566*/map/*<18566*//*18565*/(/*18567*/items/*<18567*/)(/*18568*/function name_18568({0: name, 1: l}) {
 return /*18572*/`\n - ${/*18577*/name/*<18577*/} (${/*18579*//*18581*/its/*<18581*//*18579*/(/*18582*/l/*<18582*/)/*<18579*/})`/*<18572*/ }/*<18568*/)/*<18565*/)/*<18560*/}`/*<18557*/ }/*<18489*/;

const pany = (v0) => ({type: "pany", 0: v0});
const pvar = (v0) => (v1) => ({type: "pvar", 0: v0, 1: v1});
const pcon = (v0) => (v1) => (v2) => ({type: "pcon", 0: v0, 1: v1, 2: v2});
const pstr = (v0) => (v1) => ({type: "pstr", 0: v0, 1: v1});
const pprim = (v0) => (v1) => ({type: "pprim", 0: v0, 1: v1});
const sdeftype = (v0) => (v1) => (v2) => (v3) => (v4) => ({type: "sdeftype", 0: v0, 1: v1, 2: v2, 3: v3, 4: v4});
const stypealias = (v0) => (v1) => (v2) => (v3) => (v4) => ({type: "stypealias", 0: v0, 1: v1, 2: v2, 3: v3, 4: v4});
const sdef = (v0) => (v1) => (v2) => (v3) => ({type: "sdef", 0: v0, 1: v1, 2: v2, 3: v3});
const sexpr = (v0) => (v1) => ({type: "sexpr", 0: v0, 1: v1});

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
const tts_inner = /*2099*/function name_2099(t) { return function name_2099(free) { return function name_2099(locs) { return /*2105*/(function match_2105($target) {
if ($target.type === "tvar") {
{
let s = $target[0];
{
let l = $target[1];
return /*5637*/(function let_5637() {const $target = /*5645*/free/*<5645*/;
if ($target.type === ",") {
{
let fmap = $target[0];
{
let idx = $target[1];
return /*6340*/(function match_6340($target) {
if ($target.type === "some") {
{
let fmap = $target[0];
return /*2113*/(function match_2113($target) {
if ($target.type === "some") {
{
let s = $target[0];
return /*5618*//*5615*/$co/*<5615*//*5618*/(/*10982*//*5619*/and_loc/*<5619*//*10982*/(/*10983*/locs/*<10983*/)(/*10984*/l/*<10984*/)(/*10985*/s/*<10985*/)/*<10982*/)(/*5620*/free/*<5620*/)/*<5618*/
}
}
{
let none = $target;
return /*5617*/(function let_5617() {const $target = /*5649*//*5817*/at/*<5817*//*5649*/(/*5818*/letters/*<5818*/)(/*5819*/idx/*<5819*/)(/*5820*/"_too_many_vbls_"/*<5820*/)/*<5649*/;
{
let name = $target;
return /*5653*//*5654*/$co/*<5654*//*5653*/(/*10986*//*10987*/and_loc/*<10987*//*10986*/(/*10988*/locs/*<10988*/)(/*10989*/l/*<10989*/)(/*5655*/name/*<5655*/)/*<10986*/)(/*5656*//*5657*/$co/*<5657*//*5656*/(/*6367*//*6368*/some/*<6368*//*6367*/(/*5658*//*5659*/map$slset/*<5659*//*5658*/(/*5660*/fmap/*<5660*/)(/*5661*/s/*<5661*/)(/*5662*/name/*<5662*/)/*<5658*/)/*<6367*/)(/*5663*//*5665*/$pl/*<5665*//*5663*/(/*5666*/1/*<5666*/)(/*5667*/idx/*<5667*/)/*<5663*/)/*<5656*/)/*<5653*/
};
throw new Error('let pattern not matched 5648. ' + valueToString($target));})(/*!*/)/*<5617*/
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 2113');})(/*!*//*5605*//*5609*/map$slget/*<5609*//*5605*/(/*5610*/fmap/*<5610*/)(/*5611*/s/*<5611*/)/*<5605*/)/*<2113*/
}
}
return /*6392*//*6348*/$co/*<6348*//*6392*/(/*10978*//*6393*/and_loc/*<6393*//*10978*/(/*10979*/locs/*<10979*/)(/*10980*/l/*<10980*/)(/*10981*/s/*<10981*/)/*<10978*/)(/*6394*/free/*<6394*/)/*<6392*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 6340');})(/*!*//*6343*/fmap/*<6343*/)/*<6340*/
}
}
};
throw new Error('let pattern not matched 5641. ' + valueToString($target));})(/*!*/)/*<5637*/
}
}
}
if ($target.type === "tcon") {
{
let s = $target[0];
{
let l = $target[1];
return /*5672*//*2118*/$co/*<2118*//*5672*/(/*10990*//*10991*/and_loc/*<10991*//*10990*/(/*10992*/locs/*<10992*/)(/*10993*/l/*<10993*/)(/*5673*/s/*<5673*/)/*<10990*/)(/*5674*/free/*<5674*/)/*<5672*/
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
return /*5675*/(function let_5675() {const $target = /*5909*//*5910*/unwrap_fn/*<5910*//*5909*/(/*5911*/b/*<5911*/)/*<5909*/;
if ($target.type === ",") {
{
let args = $target[0];
{
let r = $target[1];
return (function let_5675() {const $target = /*5913*//*5913*/cons/*<5913*//*5913*/(/*5914*/a/*<5914*/)(/*5915*/args/*<5915*/)/*<5913*/;
{
let args = $target;
return (function let_5675() {const $target = /*5684*//*6209*/tts_list/*<6209*//*5684*/(/*6210*/args/*<6210*/)(/*6211*/free/*<6211*/)(/*10952*/locs/*<10952*/)/*<5684*/;
if ($target.type === ",") {
{
let args = $target[0];
{
let free = $target[1];
return (function let_5675() {const $target = /*5692*//*5693*/tts_inner/*<5693*//*5692*/(/*5694*/r/*<5694*/)(/*5695*/free/*<5695*/)(/*10953*/locs/*<10953*/)/*<5692*/;
if ($target.type === ",") {
{
let two = $target[0];
{
let free = $target[1];
return /*5696*//*5697*/$co/*<5697*//*5696*/(/*10994*//*10995*/and_loc/*<10995*//*10994*/(/*10996*/locs/*<10996*/)(/*10997*/l/*<10997*/)(/*2132*/`(fn [${/*5919*//*2134*/join/*<2134*//*5919*/(/*5940*/" "/*<5940*/)(/*6100*//*6101*/rev/*<6101*//*6100*/(/*5920*/args/*<5920*/)(/*6102*/nil/*<6102*/)/*<6100*/)/*<5919*/}] ${/*2138*/two/*<2138*/})`/*<2132*/)/*<10994*/)(/*5698*/free/*<5698*/)/*<5696*/
}
}
};
throw new Error('let pattern not matched 5688. ' + valueToString($target));})(/*!*/)
}
}
};
throw new Error('let pattern not matched 5680. ' + valueToString($target));})(/*!*/)
};
throw new Error('let pattern not matched 5912. ' + valueToString($target));})(/*!*/)
}
}
};
throw new Error('let pattern not matched 5905. ' + valueToString($target));})(/*!*/)/*<5675*/
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
return /*5699*/(function let_5699() {const $target = /*6142*//*6146*/unwrap_app/*<6146*//*6142*/(/*6147*/a/*<6147*/)/*<6142*/;
if ($target.type === ",") {
{
let target = $target[0];
{
let args = $target[1];
return (function let_5699() {const $target = /*6149*//*6149*/cons/*<6149*//*6149*/(/*6150*/b/*<6150*/)(/*6151*/args/*<6151*/)/*<6149*/;
{
let args = $target;
return (function let_5699() {const $target = /*6156*//*6157*/rev/*<6157*//*6156*/(/*6158*/args/*<6158*/)(/*6255*/nil/*<6255*/)/*<6156*/;
{
let args = $target;
return (function let_5699() {const $target = /*6164*//*6214*/tts_list/*<6214*//*6164*/(/*6215*/args/*<6215*/)(/*6216*/free/*<6216*/)(/*10955*/locs/*<10955*/)/*<6164*/;
if ($target.type === ",") {
{
let args = $target[0];
{
let free = $target[1];
return (function let_5699() {const $target = /*5714*//*5715*/tts_inner/*<5715*//*5714*/(/*5716*/target/*<5716*/)(/*5717*/free/*<5717*/)(/*10954*/locs/*<10954*/)/*<5714*/;
if ($target.type === ",") {
{
let one = $target[0];
{
let free = $target[1];
return /*5718*//*5719*/$co/*<5719*//*5718*/(/*10998*//*10999*/and_loc/*<10999*//*10998*/(/*11000*/locs/*<11000*/)(/*11001*/l/*<11001*/)(/*2148*/`(${/*2150*/one/*<2150*/} ${/*2154*//*6217*/join/*<6217*//*2154*/(/*6218*/" "/*<6218*/)(/*6220*//*6221*/rev/*<6221*//*6220*/(/*6222*/args/*<6222*/)(/*6256*/nil/*<6256*/)/*<6220*/)/*<2154*/})`/*<2148*/)/*<10998*/)(/*5720*/free/*<5720*/)/*<5718*/
}
}
};
throw new Error('let pattern not matched 5710. ' + valueToString($target));})(/*!*/)
}
}
};
throw new Error('let pattern not matched 6159. ' + valueToString($target));})(/*!*/)
};
throw new Error('let pattern not matched 6155. ' + valueToString($target));})(/*!*/)
};
throw new Error('let pattern not matched 6148. ' + valueToString($target));})(/*!*/)
}
}
};
throw new Error('let pattern not matched 6141. ' + valueToString($target));})(/*!*/)/*<5699*/
}
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 2105');})(/*!*//*2107*/t/*<2107*/)/*<2105*/ } } }/*<2099*/;


const tts_list = /*6165*/function name_6165(args) { return function name_6165(free) { return function name_6165(locs) { return /*6174*//*6175*/foldl/*<6175*//*6174*/(/*6176*//*6177*/$co/*<6177*//*6176*/(/*6178*/nil/*<6178*/)(/*6179*/free/*<6179*/)/*<6176*/)(/*6180*/args/*<6180*/)(/*6181*/function name_6181({0: args, 1: free}) {
 return function name_6181(a) { return /*6189*/(function let_6189() {const $target = /*6196*//*6197*/tts_inner/*<6197*//*6196*/(/*6198*/a/*<6198*/)(/*6199*/free/*<6199*/)(/*10949*/locs/*<10949*/)/*<6196*/;
if ($target.type === ",") {
{
let a = $target[0];
{
let free = $target[1];
return /*6200*//*6201*/$co/*<6201*//*6200*/(/*6202*//*6202*/cons/*<6202*//*6202*/(/*6203*/a/*<6203*/)(/*6204*/args/*<6204*/)/*<6202*/)(/*6208*/free/*<6208*/)/*<6200*/
}
}
};
throw new Error('let pattern not matched 6192. ' + valueToString($target));})(/*!*/)/*<6189*/ } }/*<6181*/)/*<6174*/ } } }/*<6165*/;

const one = (v0) => ({type: "one", 0: v0});
const many = (v0) => ({type: "many", 0: v0});
const empty = ({type: "empty"});
const scheme_apply = /*905*/function name_905(subst) { return function name_905({0: vbls, 1: type}) {
 return /*915*//*917*/scheme/*<917*//*915*/(/*918*/vbls/*<918*/)(/*919*//*920*/type_apply/*<920*//*919*/(/*921*//*922*/map_without/*<922*//*921*/(/*923*/subst/*<923*/)(/*924*/vbls/*<924*/)/*<921*/)(/*925*/type/*<925*/)/*<919*/)/*<915*/ } }/*<905*/;

const tenv = (v0) => (v1) => (v2) => (v3) => ({type: "tenv", 0: v0, 1: v1, 2: v2, 3: v3});
const tenv$sltype = /*3270*/function name_3270({0: types}) { return function name_3270(key) { return /*3281*//*3282*/map$slget/*<3282*//*3281*/(/*3283*/types/*<3283*/)(/*3284*/key/*<3284*/)/*<3281*/ } }/*<3270*/;

const tenv$slcon = /*3285*/function name_3285({1: cons}) { return function name_3285(key) { return /*3296*//*3297*/map$slget/*<3297*//*3296*/(/*3298*/cons/*<3298*/)(/*3299*/key/*<3299*/)/*<3296*/ } }/*<3285*/;

const tenv$slnames = /*3300*/function name_3300({2: names}) { return function name_3300(key) { return /*3311*//*3312*/map$slget/*<3312*//*3311*/(/*3313*/names/*<3313*/)(/*3314*/key/*<3314*/)/*<3311*/ } }/*<3300*/;

const tenv$slset_type = /*3336*/function name_3336({0: types, 1: cons, 2: names, 3: alias}) {


 return function name_3336(k) { return function name_3336(v) { return /*3348*//*3349*/tenv/*<3349*//*3348*/(/*3350*//*3351*/map$slset/*<3351*//*3350*/(/*3352*/types/*<3352*/)(/*3353*/k/*<3353*/)(/*3354*/v/*<3354*/)/*<3350*/)(/*3355*/cons/*<3355*/)(/*3356*/names/*<3356*/)(/*13294*/alias/*<13294*/)/*<3348*/ } } }/*<3336*/;

const tenv$slnil = /*3361*//*3362*/tenv/*<3362*//*3361*/(/*3363*/map$slnil/*<3363*/)(/*3364*/map$slnil/*<3364*/)(/*3365*/map$slnil/*<3365*/)(/*13332*/map$slnil/*<13332*/)/*<3361*/;

const type_to_string = /*5590*/function name_5590(t) { return /*5624*/(function let_5624() {const $target = /*5596*//*5597*/tts_inner/*<5597*//*5596*/(/*5598*/t/*<5598*/)(/*5601*//*5599*/$co/*<5599*//*5601*/(/*6349*//*5602*/some/*<5602*//*6349*/(/*6350*/map$slnil/*<6350*/)/*<6349*/)(/*5603*/0/*<5603*/)/*<5601*/)(/*10950*/false/*<10950*/)/*<5596*/;
if ($target.type === ",") {
{
let text = $target[0];
return /*5636*/text/*<5636*/
}
};
throw new Error('let pattern not matched 5632. ' + valueToString($target));})(/*!*/)/*<5624*/ }/*<5590*/;

const type_to_string_raw = /*6370*/function name_6370(t) { return /*6376*/(function let_6376() {const $target = /*6384*//*6385*/tts_inner/*<6385*//*6384*/(/*6386*/t/*<6386*/)(/*6387*//*6388*/$co/*<6388*//*6387*/(/*6389*/none/*<6389*/)(/*6390*/0/*<6390*/)/*<6387*/)(/*10951*/false/*<10951*/)/*<6384*/;
if ($target.type === ",") {
{
let text = $target[0];
return /*6391*/text/*<6391*/
}
};
throw new Error('let pattern not matched 6380. ' + valueToString($target));})(/*!*/)/*<6376*/ }/*<6370*/;

const bag$sland = /*7061*/function name_7061(first) { return function name_7061(second) { return /*7073*/(function match_7073($target) {
if ($target.type === ",") {
if ($target[0].type === "empty") {
{
let a = $target[1];
return /*7083*/a/*<7083*/
}
}
}
if ($target.type === ",") {
{
let a = $target[0];
if ($target[1].type === "empty") {
return /*7088*/a/*<7088*/
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
return /*7090*//*7104*/many/*<7104*//*7090*/(/*7105*//*7105*/cons/*<7105*//*7105*/(/*7106*/a/*<7106*/)(/*7108*/b/*<7108*/)/*<7105*/)/*<7090*/
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
return /*16189*//*16197*/many/*<16197*//*16189*/(/*16198*//*16198*/cons/*<16198*//*16198*/(/*16199*/a/*<16199*/)(/*16200*/b/*<16200*/)/*<16198*/)/*<16189*/
}
}
}
}
return /*7129*//*7130*/many/*<7130*//*7129*/(/*7131*//*7131*/cons/*<7131*//*7131*/(/*7138*/first/*<7138*/)(/*7131*//*7131*/cons/*<7131*//*7131*/(/*7139*/second/*<7139*/)(/*7131*/nil/*<7131*/)/*<7131*/)/*<7131*/)/*<7129*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 7073');})(/*!*//*7075*//*7076*/$co/*<7076*//*7075*/(/*7077*/first/*<7077*/)(/*7078*/second/*<7078*/)/*<7075*/)/*<7073*/ } }/*<7061*/;

const pat_names = /*7177*/function name_7177(pat) { return /*7183*/(function match_7183($target) {
if ($target.type === "pany") {
return /*7208*/set$slnil/*<7208*/
}
if ($target.type === "pvar") {
{
let name = $target[0];
{
let l = $target[1];
return /*7209*//*7210*/set$sladd/*<7210*//*7209*/(/*7211*/set$slnil/*<7211*/)(/*7212*/name/*<7212*/)/*<7209*/
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
return /*7213*//*7214*/foldl/*<7214*//*7213*/(/*15117*/set$slnil/*<15117*/)(/*7216*/args/*<7216*/)(/*7217*/function name_7217(bound) { return function name_7217(arg) { return /*7226*//*7227*/set$slmerge/*<7227*//*7226*/(/*7229*/bound/*<7229*/)(/*7230*//*7231*/pat_names/*<7231*//*7230*/(/*7232*/arg/*<7232*/)/*<7230*/)/*<7226*/ } }/*<7217*/)/*<7213*/
}
}
}
}
if ($target.type === "pstr") {
{
let string = $target[0];
{
let int = $target[1];
return /*7233*/set$slnil/*<7233*/
}
}
}
if ($target.type === "pprim") {
{
let prim = $target[0];
{
let int = $target[1];
return /*7234*/set$slnil/*<7234*/
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 7183');})(/*!*//*7185*/pat/*<7185*/)/*<7183*/ }/*<7177*/;

const externals_type = /*7334*/function name_7334(bound) { return function name_7334(t) { return /*7342*/(function match_7342($target) {
if ($target.type === "tvar") {
return /*14098*/empty/*<14098*/
}
if ($target.type === "tcon") {
{
let name = $target[0];
{
let l = $target[1];
return /*14103*/(function match_14103($target) {
if ($target === true) {
return /*14109*/empty/*<14109*/
}
return /*14110*//*14111*/one/*<14111*//*14110*/(/*14112*//*14113*/$co$co/*<14113*//*14112*/(/*14114*/name/*<14114*/)(/*14141*//*14142*/type/*<14142*//*14141*//*<14141*/)(/*14115*/l/*<14115*/)/*<14112*/)/*<14110*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 14103');})(/*!*//*14105*//*14106*/set$slhas/*<14106*//*14105*/(/*14107*/bound/*<14107*/)(/*14108*/name/*<14108*/)/*<14105*/)/*<14103*/
}
}
}
if ($target.type === "tapp") {
{
let one = $target[0];
{
let two = $target[1];
return /*14121*//*14122*/bag$sland/*<14122*//*14121*/(/*14123*//*14124*/externals_type/*<14124*//*14123*/(/*14126*/bound/*<14126*/)(/*14127*/one/*<14127*/)/*<14123*/)(/*14128*//*14129*/externals_type/*<14129*//*14128*/(/*14130*/bound/*<14130*/)(/*14131*/two/*<14131*/)/*<14128*/)/*<14121*/
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 7342');})(/*!*//*14093*/t/*<14093*/)/*<7342*/ } }/*<7334*/;

const bag$slto_list = /*7377*/function name_7377(bag) { return /*7383*/(function match_7383($target) {
if ($target.type === "empty") {
return /*7390*/nil/*<7390*/
}
if ($target.type === "one") {
{
let a = $target[0];
return /*7395*//*7395*/cons/*<7395*//*7395*/(/*7400*/a/*<7400*/)(/*7395*/nil/*<7395*/)/*<7395*/
}
}
if ($target.type === "many") {
{
let bags = $target[0];
return /*7441*//*7442*/foldr/*<7442*//*7441*/(/*7443*/nil/*<7443*/)(/*7444*/bags/*<7444*/)(/*7445*/function name_7445(res) { return function name_7445(bag) { return /*7450*/(function match_7450($target) {
if ($target.type === "empty") {
return /*7455*/res/*<7455*/
}
if ($target.type === "one") {
{
let a = $target[0];
return /*7459*//*7459*/cons/*<7459*//*7459*/(/*7460*/a/*<7460*/)(/*7461*/res/*<7461*/)/*<7459*/
}
}
return /*7468*//*7469*/concat/*<7469*//*7468*/(/*7470*//*7471*/bag$slto_list/*<7471*//*7470*/(/*7472*/bag/*<7472*/)/*<7470*/)(/*7473*/res/*<7473*/)/*<7468*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 7450');})(/*!*//*7452*/bag/*<7452*/)/*<7450*/ } }/*<7445*/)/*<7441*/
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 7383');})(/*!*//*7385*/bag/*<7385*/)/*<7383*/ }/*<7377*/;

const names = /*7511*/function name_7511(stmt) { return /*7517*/(function match_7517($target) {
if ($target.type === "sdef") {
{
let name = $target[0];
{
let l = $target[1];
return /*7526*//*7526*/cons/*<7526*//*7526*/(/*10654*//*7527*/$co$co/*<7527*//*10654*/(/*10655*/name/*<10655*/)(/*11760*//*11761*/value/*<11761*//*11760*//*<11760*/)(/*10656*/l/*<10656*/)/*<10654*/)(/*7526*/nil/*<7526*/)/*<7526*/
}
}
}
if ($target.type === "sexpr") {
return /*7532*/nil/*<7532*/
}
if ($target.type === "stypealias") {
{
let name = $target[0];
{
let l = $target[1];
return /*13230*//*13230*/cons/*<13230*//*13230*/(/*13231*//*13232*/$co$co/*<13232*//*13231*/(/*13233*/name/*<13233*/)(/*13234*//*13235*/type/*<13235*//*13234*//*<13234*/)(/*13236*/l/*<13236*/)/*<13231*/)(/*13230*/nil/*<13230*/)/*<13230*/
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
return /*13935*//*13935*/cons/*<13935*//*13935*/(/*13936*//*13937*/$co$co/*<13937*//*13936*/(/*13938*/name/*<13938*/)(/*13939*//*13940*/type/*<13940*//*13939*//*<13939*/)(/*13941*/l/*<13941*/)/*<13936*/)(/*13942*//*13968*/map/*<13968*//*13942*/(/*13969*/constructors/*<13969*/)(/*13970*/function name_13970({0: name, 1: l}) {
 return /*13979*//*13980*/$co$co/*<13980*//*13979*/(/*13981*/name/*<13981*/)(/*13982*//*13983*/value/*<13983*//*13982*//*<13982*/)(/*13984*/l/*<13984*/)/*<13979*/ }/*<13970*/)/*<13942*/)/*<13935*/
}
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 7517');})(/*!*//*7519*/stmt/*<7519*/)/*<7517*/ }/*<7511*/;

const show_types = /*7912*/function name_7912(names) { return function name_7912({0: types}) { return /*8079*/(function let_8079() {const $target = /*8083*//*8084*/set$slfrom_list/*<8084*//*8083*/(/*8085*/names/*<8085*/)/*<8083*/;
{
let names = $target;
return /*7924*//*7925*/map/*<7925*//*7924*/(/*8067*//*8068*/filter/*<8068*//*8067*/(/*8069*/function name_8069({0: k, 1: v}) {
 return /*8076*//*8077*/set$slhas/*<8077*//*8076*/(/*8078*/names/*<8078*/)(/*8086*/k/*<8086*/)/*<8076*/ }/*<8069*/)(/*8087*//*8088*/map$slto_list/*<8088*//*8087*/(/*8089*/types/*<8089*/)/*<8087*/)/*<8067*/)(/*7927*/function name_7927({0: name, 1: {0: free, 1: type}}) {

 return /*7938*/(function match_7938($target) {
if ($target.type === "nil") {
return /*8095*/`${/*8098*/name/*<8098*/} = ${/*7990*//*7991*/type_to_string/*<7991*//*7990*/(/*7993*/type/*<7993*/)/*<7990*/}`/*<8095*/
}
{
let free = $target;
return /*7995*/`${/*8093*/name/*<8093*/} = ${/*7997*//*7999*/join/*<7999*//*7997*/(/*8000*/","/*<8000*/)(/*8002*/free/*<8002*/)/*<7997*/} : ${/*8003*//*8005*/type_to_string_raw/*<8005*//*8003*/(/*8006*/type/*<8006*/)/*<8003*/}`/*<7995*/
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 7938');})(/*!*//*7986*//*7987*/set$slto_list/*<7987*//*7986*/(/*7988*/free/*<7988*/)/*<7986*/)/*<7938*/ }/*<7927*/)/*<7924*/
};
throw new Error('let pattern not matched 8082. ' + valueToString($target));})(/*!*/)/*<8079*/ } }/*<7912*/;

const show_types_list = /*8112*/function name_8112(types) { return /*8122*//*8123*/join/*<8123*//*8122*/(/*8124*/"\n"/*<8124*/)(/*8118*//*8119*/map/*<8119*//*8118*/(/*8120*/types/*<8120*/)(/*8121*/type_to_string_raw/*<8121*/)/*<8118*/)/*<8122*/ }/*<8112*/;

const show_subst = /*8126*/function name_8126(subst) { return /*8152*//*8153*/join/*<8153*//*8152*/(/*8154*/"\n"/*<8154*/)(/*8132*//*8133*/map/*<8133*//*8132*/(/*8134*//*8135*/map$slto_list/*<8135*//*8134*/(/*8136*/subst/*<8136*/)/*<8134*/)(/*8137*/function name_8137({0: name, 1: type}) {
 return /*8144*/`${/*8146*/name/*<8146*/} -> ${/*8148*//*8150*/type_to_string_raw/*<8150*//*8148*/(/*8151*/type/*<8151*/)/*<8148*/}`/*<8144*/ }/*<8137*/)/*<8132*/)/*<8152*/ }/*<8126*/;

const show_substs = /*8245*/function name_8245(substs) { return /*8251*//*8252*/join/*<8252*//*8251*/(/*8253*/"\n::\n"/*<8253*/)(/*8255*//*8256*/map/*<8256*//*8255*/(/*8257*/substs/*<8257*/)(/*8258*/show_subst/*<8258*/)/*<8255*/)/*<8251*/ }/*<8245*/;

const expr_loc = /*10814*/function name_10814(expr) { return /*10820*/(function match_10820($target) {
if ($target.type === "estr") {
{
let l = $target[2];
return /*10828*/l/*<10828*/
}
}
if ($target.type === "eprim") {
{
let l = $target[1];
return /*10833*/l/*<10833*/
}
}
if ($target.type === "evar") {
{
let l = $target[1];
return /*10838*/l/*<10838*/
}
}
if ($target.type === "equot") {
{
let l = $target[1];
return /*10848*/l/*<10848*/
}
}
if ($target.type === "elambda") {
{
let l = $target[2];
return /*10870*/l/*<10870*/
}
}
if ($target.type === "elet") {
{
let l = $target[2];
return /*10877*/l/*<10877*/
}
}
if ($target.type === "eapp") {
{
let l = $target[2];
return /*10883*/l/*<10883*/
}
}
if ($target.type === "ematch") {
{
let l = $target[2];
return /*10889*/l/*<10889*/
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 10820');})(/*!*//*10822*/expr/*<10822*/)/*<10820*/ }/*<10814*/;

const pat_loc = /*10897*/function name_10897(pat) { return /*10903*/(function match_10903($target) {
if ($target.type === "pany") {
{
let l = $target[0];
return /*10909*/l/*<10909*/
}
}
if ($target.type === "pprim") {
{
let l = $target[1];
return /*10914*/l/*<10914*/
}
}
if ($target.type === "pstr") {
{
let l = $target[1];
return /*10919*/l/*<10919*/
}
}
if ($target.type === "pvar") {
{
let l = $target[1];
return /*10924*/l/*<10924*/
}
}
if ($target.type === "pcon") {
{
let l = $target[2];
return /*10930*/l/*<10930*/
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 10903');})(/*!*//*10905*/pat/*<10905*/)/*<10903*/ }/*<10897*/;

const pat_to_string = /*11198*/function name_11198(pat) { return /*11204*/(function match_11204($target) {
if ($target.type === "pany") {
return /*11210*/"_"/*<11210*/
}
if ($target.type === "pvar") {
{
let n = $target[0];
return /*11216*/n/*<11216*/
}
}
if ($target.type === "pcon") {
{
let c = $target[0];
{
let pats = $target[1];
return /*11222*/`(${/*11224*/c/*<11224*/} ${/*11226*//*11228*/join/*<11228*//*11226*/(/*11229*/" "/*<11229*/)(/*11231*//*11233*/map/*<11233*//*11231*/(/*11234*/pats/*<11234*/)(/*11235*/pat_to_string/*<11235*/)/*<11231*/)/*<11226*/})`/*<11222*/
}
}
}
if ($target.type === "pstr") {
{
let s = $target[0];
return /*11240*/`\"${/*11242*/s/*<11242*/}\"`/*<11240*/
}
}
if ($target.type === "pprim") {
return /*11248*/"prim"/*<11248*/
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 11204');})(/*!*//*11206*/pat/*<11206*/)/*<11204*/ }/*<11198*/;

const tenv$slmerge = /*11632*/function name_11632({0: values, 1: constructors, 2: types, 3: alias}) {


 return function name_11632({0: nvalues, 1: ncons, 2: ntypes, 3: nalias}) {


 return /*11642*//*11653*/tenv/*<11653*//*11642*/(/*11654*//*11655*/map$slmerge/*<11655*//*11654*/(/*11656*/values/*<11656*/)(/*11657*/nvalues/*<11657*/)/*<11654*/)(/*11658*//*11659*/map$slmerge/*<11659*//*11658*/(/*11660*/constructors/*<11660*/)(/*11661*/ncons/*<11661*/)/*<11658*/)(/*11662*//*11663*/map$slmerge/*<11663*//*11662*/(/*11664*/types/*<11664*/)(/*11665*/ntypes/*<11665*/)/*<11662*/)(/*13302*//*13303*/map$slmerge/*<13303*//*13302*/(/*13304*/alias/*<13304*/)(/*13305*/nalias/*<13305*/)/*<13302*/)/*<11642*/ } }/*<11632*/;

const inference = (v0) => (v1) => (v2) => (v3) => (v4) => ({type: "inference", 0: v0, 1: v1, 2: v2, 3: v3, 4: v4});
const analysis = (v0) => (v1) => (v2) => ({type: "analysis", 0: v0, 1: v1, 2: v2});
const check_invariant = /*12411*/function name_12411(place) { return function name_12411(new_subst) { return function name_12411(old_subst) { return /*12421*//*12422*/foldl/*<12422*//*12421*/(/*12528*//*12530*/none/*<12530*//*12528*//*<12528*/)(/*12424*//*12425*/map$slkeys/*<12425*//*12424*/(/*12426*/old_subst/*<12426*/)/*<12424*/)(/*12428*/function name_12428(current) { return function name_12428(key) { return /*12487*/(function match_12487($target) {
if ($target.type === "some") {
{
let v = $target[0];
return /*12493*/current/*<12493*/
}
}
if ($target.type === "none") {
return /*12454*//*12455*/foldl/*<12455*//*12454*/(/*12531*//*12532*/none/*<12532*//*12531*//*<12531*/)(/*12433*//*12453*/map$slto_list/*<12453*//*12433*/(/*12456*/new_subst/*<12456*/)/*<12433*/)(/*12457*/function name_12457(current) { return function name_12457({0: nkey, 1: type}) {
 return /*12502*/(function match_12502($target) {
if ($target.type === "some") {
{
let v = $target[0];
return /*12508*/current/*<12508*/
}
}
if ($target.type === "none") {
return /*12461*/(function match_12461($target) {
if ($target === true) {
return /*12471*//*12472*/some/*<12472*//*12471*/(/*12473*/`compose-subst[${/*12475*/place/*<12475*/}]: old-subst has key ${/*12477*/key/*<12477*/}, which is used in new-subst for ${/*12479*/nkey/*<12479*/} => ${/*12481*//*12483*/type_to_string_raw/*<12483*//*12481*/(/*12485*/type/*<12485*/)/*<12481*/}`/*<12473*/)/*<12471*/
}
return /*12486*/current/*<12486*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 12461');})(/*!*//*12467*//*12468*/has_free/*<12468*//*12467*/(/*12469*/type/*<12469*/)(/*12470*/key/*<12470*/)/*<12467*/)/*<12461*/
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 12502');})(/*!*//*12504*/current/*<12504*/)/*<12502*/ } }/*<12457*/)/*<12454*/
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 12487');})(/*!*//*12489*/current/*<12489*/)/*<12487*/ } }/*<12428*/)/*<12421*/ } } }/*<12411*/;

const tenv$slset_constructors = /*12796*/function name_12796({0: types, 1: cons, 2: names, 3: alias}) {


 return function name_12796(name) { return function name_12796(vbls) { return function name_12796(ncons) { return /*12809*//*12810*/tenv/*<12810*//*12809*/(/*12811*/types/*<12811*/)(/*12812*//*12813*/map$slmerge/*<12813*//*12812*/(/*12814*/cons/*<12814*/)(/*12815*/ncons/*<12815*/)/*<12812*/)(/*12816*//*12817*/map$slset/*<12817*//*12816*/(/*12818*/names/*<12818*/)(/*12819*/name/*<12819*/)(/*12820*//*12821*/$co/*<12821*//*12820*/(/*12822*/vbls/*<12822*/)(/*12826*//*12827*/set$slfrom_list/*<12827*//*12826*/(/*12823*//*12824*/map$slkeys/*<12824*//*12823*/(/*12825*/ncons/*<12825*/)/*<12823*/)/*<12826*/)/*<12820*/)/*<12816*/)(/*13297*/alias/*<13297*/)/*<12809*/ } } } }/*<12796*/;

const check_type_names = /*13357*/function name_13357(tenv$qu) { return function name_13357(type) { return /*13365*/(function match_13365($target) {
if ($target.type === "tvar") {
return /*13375*/true/*<13375*/
}
if ($target.type === "tcon") {
{
let name = $target[0];
return /*13380*/(function let_13380() {const $target = /*13425*/tenv$qu/*<13425*/;
if ($target.type === "tenv") {
{
let types = $target[2];
{
let alias = $target[3];
return /*13389*/(function match_13389($target) {
if ($target === true) {
return /*13395*/true/*<13395*/
}
return /*13396*/(function match_13396($target) {
if ($target === true) {
return /*13402*/true/*<13402*/
}
return /*13403*//*13404*/fatal/*<13404*//*13403*/(/*13405*/`Unknown type ${/*13407*/name/*<13407*/}`/*<13405*/)/*<13403*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 13396');})(/*!*//*13398*//*13399*/map$slhas/*<13399*//*13398*/(/*13400*/alias/*<13400*/)(/*13401*/name/*<13401*/)/*<13398*/)/*<13396*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 13389');})(/*!*//*13391*//*13392*/map$slhas/*<13392*//*13391*/(/*13393*/types/*<13393*/)(/*13394*/name/*<13394*/)/*<13391*/)/*<13389*/
}
}
};
throw new Error('let pattern not matched 13383. ' + valueToString($target));})(/*!*/)/*<13380*/
}
}
if ($target.type === "tapp") {
{
let one = $target[0];
{
let two = $target[1];
return /*13414*/(function match_13414($target) {
if ($target === true) {
return /*13420*//*13421*/check_type_names/*<13421*//*13420*/(/*13422*/tenv$qu/*<13422*/)(/*13423*/two/*<13423*/)/*<13420*/
}
return /*13424*/false/*<13424*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 13414');})(/*!*//*13416*//*13417*/check_type_names/*<13417*//*13416*/(/*13418*/tenv$qu/*<13418*/)(/*13419*/one/*<13419*/)/*<13416*/)/*<13414*/
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 13365');})(/*!*//*13369*/type/*<13369*/)/*<13365*/ } }/*<13357*/;

const subst_aliases = /*13461*/function name_13461(alias) { return function name_13461(type) { return /*13642*/(function let_13642() {const $target = /*13649*//*13650*/extract_type_call/*<13650*//*13649*/(/*13651*/type/*<13651*/)(/*13738*/nil/*<13738*/)/*<13649*/;
if ($target.type === ",") {
{
let base = $target[0];
{
let args = $target[1];
return (function let_13642() {const $target = /*13709*//*13710*/map/*<13710*//*13709*/(/*13711*/args/*<13711*/)(/*13725*/function name_13725({0: arg, 1: l}) {
 return /*13732*//*13733*/$co/*<13733*//*13732*/(/*13712*//*13713*/subst_aliases/*<13713*//*13712*/(/*13714*/alias/*<13714*/)(/*13735*/arg/*<13735*/)/*<13712*/)(/*13736*/l/*<13736*/)/*<13732*/ }/*<13725*/)/*<13709*/;
{
let args = $target;
return /*13652*/(function match_13652($target) {
if ($target.type === "tcon") {
{
let name = $target[0];
return /*13659*/(function match_13659($target) {
if ($target.type === "some") {
if ($target[0].type === ",") {
{
let names = $target[0][0];
{
let subst = $target[0][1];
return /*13672*/(function match_13672($target) {
if ($target === true) {
return /*13682*//*13683*/fatal/*<13683*//*13682*/(/*13684*/`Wrong number of args given to alias ${/*13686*/name/*<13686*/}: expected ${/*13806*//*13807*/its/*<13807*//*13806*/(/*13688*//*13690*/len/*<13690*//*13688*/(/*13691*/names/*<13691*/)/*<13688*/)/*<13806*/}, given ${/*13808*//*13809*/its/*<13809*//*13808*/(/*13692*//*13694*/len/*<13694*//*13692*/(/*13695*/args/*<13695*/)/*<13692*/)/*<13808*/}.`/*<13684*/)/*<13682*/
}
return /*14025*/(function let_14025() {const $target = /*14042*/(function match_14042($target) {
if ($target === true) {
return /*14050*/subst/*<14050*/
}
return /*14030*//*14031*/replace_in_type/*<14031*//*14030*/(/*14032*//*14033*/map$slfrom_list/*<14033*//*14032*/(/*14034*//*14035*/zip/*<14035*//*14034*/(/*14036*/names/*<14036*/)(/*14037*//*14038*/map/*<14038*//*14037*/(/*14039*/args/*<14039*/)(/*14040*/fst/*<14040*/)/*<14037*/)/*<14034*/)/*<14032*/)(/*14041*/subst/*<14041*/)/*<14030*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 14042');})(/*!*//*14044*//*14045*/$eq/*<14045*//*14044*/(/*14046*//*14047*/len/*<14047*//*14046*/(/*14048*/names/*<14048*/)/*<14046*/)(/*14049*/0/*<14049*/)/*<14044*/)/*<14042*/;
{
let subst = $target;
return /*14021*//*14022*/subst_aliases/*<14022*//*14021*/(/*14023*/alias/*<14023*/)(/*13696*/subst/*<13696*/)/*<14021*/
};
throw new Error('let pattern not matched 14028. ' + valueToString($target));})(/*!*/)/*<14025*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 13672');})(/*!*//*13674*//*13675*/$ex$eq/*<13675*//*13674*/(/*13676*//*13677*/len/*<13677*//*13676*/(/*13678*/names/*<13678*/)/*<13676*/)(/*13679*//*13680*/len/*<13680*//*13679*/(/*13681*/args/*<13681*/)/*<13679*/)/*<13674*/)/*<13672*/
}
}
}
}
return /*13716*//*13717*/foldl/*<13717*//*13716*/(/*13718*/base/*<13718*/)(/*13719*/args/*<13719*/)(/*13720*/function name_13720(target) { return function name_13720({0: arg, 1: l}) {
 return /*13814*//*13818*/tapp/*<13818*//*13814*/(/*13819*/target/*<13819*/)(/*13820*/arg/*<13820*/)(/*13821*/l/*<13821*/)/*<13814*/ } }/*<13720*/)/*<13716*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 13659');})(/*!*//*13661*//*13662*/map$slget/*<13662*//*13661*/(/*13663*/alias/*<13663*/)(/*13664*/name/*<13664*/)/*<13661*/)/*<13659*/
}
}
return /*13824*//*13825*/foldl/*<13825*//*13824*/(/*13826*/base/*<13826*/)(/*13827*/args/*<13827*/)(/*13828*/function name_13828(target) { return function name_13828({0: arg, 1: l}) {
 return /*13836*//*13837*/tapp/*<13837*//*13836*/(/*13838*/target/*<13838*/)(/*13839*/arg/*<13839*/)(/*13840*/l/*<13840*/)/*<13836*/ } }/*<13828*/)/*<13824*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 13652');})(/*!*//*13654*/base/*<13654*/)/*<13652*/
};
throw new Error('let pattern not matched 13708. ' + valueToString($target));})(/*!*/)
}
}
};
throw new Error('let pattern not matched 13645. ' + valueToString($target));})(/*!*/)/*<13642*/ } }/*<13461*/;

const tenv$slalias = /*13474*/function name_13474({3: alias}) { return /*13485*/alias/*<13485*/ }/*<13474*/;

const split_stmts = /*14195*/function name_14195(stmts) { return function name_14195(sdefs) { return function name_14195(stypes) { return function name_14195(salias) { return function name_14195(sexps) { return /*14203*/(function match_14203($target) {
if ($target.type === "nil") {
return /*14208*//*14209*/$co$co$co/*<14209*//*14208*/(/*14210*/sdefs/*<14210*/)(/*14221*/stypes/*<14221*/)(/*14356*/salias/*<14356*/)(/*14281*/sexps/*<14281*/)/*<14208*/
}
if ($target.type === "cons") {
{
let one = $target[0];
{
let rest = $target[1];
return /*14218*/(function match_14218($target) {
if ($target.type === "sdef") {
return /*14228*//*14229*/split_stmts/*<14229*//*14228*/(/*14230*/rest/*<14230*/)(/*14231*//*14231*/cons/*<14231*//*14231*/(/*14232*/one/*<14232*/)(/*14233*/sdefs/*<14233*/)/*<14231*/)(/*14237*/stypes/*<14237*/)(/*14348*/salias/*<14348*/)(/*14282*/sexps/*<14282*/)/*<14228*/
}
if ($target.type === "sdeftype") {
return /*14246*//*14247*/split_stmts/*<14247*//*14246*/(/*14248*/rest/*<14248*/)(/*14249*/sdefs/*<14249*/)(/*14250*//*14250*/cons/*<14250*//*14250*/(/*14251*/one/*<14251*/)(/*14252*/stypes/*<14252*/)/*<14250*/)(/*14349*/salias/*<14349*/)(/*14283*/sexps/*<14283*/)/*<14246*/
}
if ($target.type === "stypealias") {
{
let name = $target[0];
{
let args = $target[2];
{
let body = $target[3];
return /*14262*//*14263*/split_stmts/*<14263*//*14262*/(/*14264*/rest/*<14264*/)(/*14265*/sdefs/*<14265*/)(/*14350*/stypes/*<14350*/)(/*14266*//*14266*/cons/*<14266*//*14266*/(/*14267*//*14358*/$co$co/*<14358*//*14267*/(/*14359*/name/*<14359*/)(/*14360*/args/*<14360*/)(/*14361*/body/*<14361*/)/*<14267*/)(/*14268*/salias/*<14268*/)/*<14266*/)(/*14284*/sexps/*<14284*/)/*<14262*/
}
}
}
}
if ($target.type === "sexpr") {
{
let expr = $target[0];
return /*14273*//*14274*/split_stmts/*<14274*//*14273*/(/*14275*/rest/*<14275*/)(/*14276*/sdefs/*<14276*/)(/*14277*/stypes/*<14277*/)(/*14362*/salias/*<14362*/)(/*14288*//*14288*/cons/*<14288*//*14288*/(/*14289*/expr/*<14289*/)(/*14290*/sexps/*<14290*/)/*<14288*/)/*<14273*/
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 14218');})(/*!*//*14223*/one/*<14223*/)/*<14218*/
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 14203');})(/*!*//*14205*/stmts/*<14205*/)/*<14203*/ } } } } }/*<14195*/;

const tenv$sladd_alias = /*14418*/function name_14418({0: a, 1: b, 2: c, 3: aliases}) {


 return function name_14418(name) { return function name_14418({0: args, 1: body}) {
 return /*14438*//*14439*/tenv/*<14439*//*14438*/(/*14440*/a/*<14440*/)(/*14441*/b/*<14441*/)(/*14442*/c/*<14442*/)(/*14443*//*14444*/map$slset/*<14444*//*14443*/(/*14445*/aliases/*<14445*/)(/*14446*/name/*<14446*/)(/*14447*//*14448*/$co/*<14448*//*14447*/(/*14449*/args/*<14449*/)(/*14450*/body/*<14450*/)/*<14447*/)/*<14443*/)/*<14438*/ } } }/*<14418*/;

const tenv$sladd_builtin_type = /*14630*/function name_14630({0: a, 1: b, 2: names, 3: d}) {


 return function name_14630({0: name, 1: args}) {
 return /*14645*//*14646*/tenv/*<14646*//*14645*/(/*14647*/a/*<14647*/)(/*14648*/b/*<14648*/)(/*14649*//*14650*/map$slset/*<14650*//*14649*/(/*14651*/names/*<14651*/)(/*14652*/name/*<14652*/)(/*14653*//*14654*/$co/*<14654*//*14653*/(/*14655*/args/*<14655*/)(/*14656*/set$slnil/*<14656*/)/*<14653*/)/*<14649*/)(/*14657*/d/*<14657*/)/*<14645*/ } }/*<14630*/;

const pat_externals = /*15121*/function name_15121(pat) { return /*15127*/(function match_15127($target) {
if ($target.type === "pcon") {
{
let name = $target[0];
{
let args = $target[1];
{
let l = $target[2];
return /*15139*//*15140*/bag$sland/*<15140*//*15139*/(/*15141*//*15142*/one/*<15142*//*15141*/(/*15158*//*15143*/$co$co/*<15143*//*15158*/(/*15159*/name/*<15159*/)(/*15160*//*15161*/value/*<15161*//*15160*//*<15160*/)(/*15162*/l/*<15162*/)/*<15158*/)/*<15141*/)(/*15144*//*15145*/many/*<15145*//*15144*/(/*15147*//*15148*/map/*<15148*//*15147*/(/*15149*/args/*<15149*/)(/*15150*/pat_externals/*<15150*/)/*<15147*/)/*<15144*/)/*<15139*/
}
}
}
}
return /*15152*/empty/*<15152*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 15127');})(/*!*//*15129*/pat/*<15129*/)/*<15127*/ }/*<15121*/;

const bag$slfold = /*15216*/function name_15216(f) { return function name_15216(init) { return function name_15216(bag) { return /*15224*/(function match_15224($target) {
if ($target.type === "empty") {
return /*15229*/init/*<15229*/
}
if ($target.type === "one") {
{
let v = $target[0];
return /*15233*//*15234*/f/*<15234*//*15233*/(/*15235*/init/*<15235*/)(/*15236*/v/*<15236*/)/*<15233*/
}
}
if ($target.type === "many") {
{
let items = $target[0];
return /*15240*//*15241*/foldr/*<15241*//*15240*/(/*15242*/init/*<15242*/)(/*15257*/items/*<15257*/)(/*15243*//*15255*/bag$slfold/*<15255*//*15243*/(/*15256*/f/*<15256*/)/*<15243*/)/*<15240*/
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 15224');})(/*!*//*15226*/bag/*<15226*/)/*<15224*/ } } }/*<15216*/;

const report_missing = /*15678*/function name_15678(subst) { return function name_15678({0: missing, 1: missing_vars}) {
 return /*15854*/(function match_15854($target) {
if ($target.type === "nil") {
return /*17030*//*15859*/$lt_/*<15859*//*17030*/(/*17031*/0/*<17031*/)/*<17030*/
}
{
let vars = $target;
return /*16025*/(function let_16025() {const $target = /*16032*//*16033*/foldl/*<16033*//*16032*/(/*16034*//*16035*/$co/*<16035*//*16034*/(/*16036*/nil/*<16036*/)(/*16085*//*16086*/$co/*<16086*//*16085*/(/*16080*//*16037*/some/*<16037*//*16080*/(/*16081*/map$slnil/*<16081*/)/*<16080*/)(/*16088*/0/*<16088*/)/*<16085*/)/*<16034*/)(/*16038*//*16039*/map/*<16039*//*16038*/(/*16040*/missing_vars/*<16040*/)(/*16041*//*16042*/type_apply/*<16042*//*16041*/(/*16043*/subst/*<16043*/)/*<16041*/)/*<16038*/)(/*16045*/function name_16045({0: result, 1: maps}) {
 return function name_16045(t) { return /*16053*/(function let_16053() {const $target = /*16060*//*16061*/tts_inner/*<16061*//*16060*/(/*16062*/t/*<16062*/)(/*16063*/maps/*<16063*/)(/*16069*/false/*<16069*/)/*<16060*/;
if ($target.type === ",") {
{
let text = $target[0];
{
let maps = $target[1];
return /*16070*//*16071*/$co/*<16071*//*16070*/(/*16072*//*16072*/cons/*<16072*//*16072*/(/*16073*/text/*<16073*/)(/*16074*/result/*<16074*/)/*<16072*/)(/*16078*/maps/*<16078*/)/*<16070*/
}
}
};
throw new Error('let pattern not matched 16056. ' + valueToString($target));})(/*!*/)/*<16053*/ } }/*<16045*/)/*<16032*/;
if ($target.type === ",") {
{
let text = $target[0];
return /*15545*//*17027*/$lt_err/*<17027*//*15545*/(/*18525*//*18526*/type_error/*<18526*//*18525*/(/*15547*/"Missing variables"/*<15547*/)(/*15579*//*15580*/map/*<15580*//*15579*/(/*15582*//*15583*/zip/*<15583*//*15582*/(/*15584*/missing/*<15584*/)(/*16206*//*15575*/rev/*<15575*//*16206*/(/*16207*/text/*<16207*/)(/*16208*/nil/*<16208*/)/*<16206*/)/*<15582*/)(/*15585*/function name_15585({0: {0: name, 1: loc}, 1: type}) {

 return /*18527*//*18528*/$co/*<18528*//*18527*/(/*15595*/`${/*15597*/name/*<15597*/} : inferred as ${/*15603*/type/*<15603*/}`/*<15595*/)(/*18529*/loc/*<18529*/)/*<18527*/ }/*<15585*/)/*<15579*/)/*<18525*/)/*<15545*/
}
};
throw new Error('let pattern not matched 16029. ' + valueToString($target));})(/*!*/)/*<16025*/
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 15854');})(/*!*//*15857*/missing_vars/*<15857*/)/*<15854*/ } }/*<15678*/;

const find_missing_names = /*15690*/function name_15690(values) { return function name_15690(ex) { return /*15306*/(function let_15306() {const $target = /*15710*//*15711*/bag$slfold/*<15711*//*15710*/(/*15712*/function name_15712(ext) { return function name_15712({0: name, 2: l}) {
 return /*15721*//*15722*/map$slset/*<15722*//*15721*/(/*15723*/ext/*<15723*/)(/*15724*/name/*<15724*/)(/*15725*/l/*<15725*/)/*<15721*/ } }/*<15712*/)(/*15726*/map$slnil/*<15726*/)(/*15844*/ex/*<15844*/)/*<15710*/;
{
let externals = $target;
return /*15286*//*15288*/filter/*<15288*//*15286*/(/*15293*/function name_15293({0: name, 1: loc}) {
 return /*15301*/(function match_15301($target) {
if ($target.type === "some") {
return /*15329*/false/*<15329*/
}
return /*15331*/true/*<15331*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 15301');})(/*!*//*15303*//*15323*/map$slget/*<15323*//*15303*/(/*15324*/values/*<15324*/)(/*15325*/name/*<15325*/)/*<15303*/)/*<15301*/ }/*<15293*/)(/*15345*//*15346*/map$slto_list/*<15346*//*15345*/(/*15347*/externals/*<15347*/)/*<15345*/)/*<15286*/
};
throw new Error('let pattern not matched 15708. ' + valueToString($target));})(/*!*/)/*<15306*/ } }/*<15690*/;

const tenv$slvalues = /*15757*/function name_15757({0: values}) { return /*15769*/values/*<15769*/ }/*<15757*/;

const $gt$gt$eq = /*16448*/function name_16448({0: f}) { return function name_16448(next) { return /*16458*//*16459*/StateT/*<16459*//*16458*/(/*16460*/function name_16460(state) { return /*16464*/(function let_16464() {const $target = /*16466*//*16481*/f/*<16481*//*16466*/(/*16482*/state/*<16482*/)/*<16466*/;
if ($target.type === ",") {
{
let state = $target[0];
{
let result = $target[1];
return /*18388*/(function match_18388($target) {
if ($target.type === "err") {
{
let e = $target[0];
return /*18391*//*18392*/$co/*<18392*//*18391*/(/*18393*/state/*<18393*/)(/*16508*//*16509*/err/*<16509*//*16508*/(/*16510*/e/*<16510*/)/*<16508*/)/*<18391*/
}
}
if ($target.type === "ok") {
{
let value = $target[0];
return /*16517*//*17069*//*17070*/state_f/*<17070*//*17069*/(/*16519*//*16521*/next/*<16521*//*16519*/(/*16522*/value/*<16522*/)/*<16519*/)/*<17069*//*16517*/(/*16523*/state/*<16523*/)/*<16517*/
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 18388');})(/*!*//*18390*/result/*<18390*/)/*<18388*/
}
}
};
throw new Error('let pattern not matched 18384. ' + valueToString($target));})(/*!*/)/*<16464*/ }/*<16460*/)/*<16458*/ } }/*<16448*/;

const map_$gt = /*16558*/function name_16558(f) { return function name_16558(arr) { return /*16565*/(function match_16565($target) {
if ($target.type === "nil") {
return /*16569*//*16570*/$lt_/*<16570*//*16569*/(/*16571*/nil/*<16571*/)/*<16569*/
}
if ($target.type === "cons") {
{
let one = $target[0];
{
let rest = $target[1];
return /*16578*//*16579*/$gt$gt$eq/*<16579*//*16578*/(/*16582*//*16583*/f/*<16583*//*16582*/(/*16584*/one/*<16584*/)/*<16582*/)(/*16578*/function name_16578(one) { return /*16578*//*16579*/$gt$gt$eq/*<16579*//*16578*/(/*16586*//*16587*/map_$gt/*<16587*//*16586*/(/*16588*/f/*<16588*/)(/*16589*/rest/*<16589*/)/*<16586*/)(/*16578*/function name_16578(rest) { return /*16590*//*16591*/$lt_/*<16591*//*16590*/(/*16592*//*16592*/cons/*<16592*//*16592*/(/*16593*/one/*<16593*/)(/*16594*/rest/*<16594*/)/*<16592*/)/*<16590*/ }/*<16578*/)/*<16578*/ }/*<16578*/)/*<16578*/
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 16565');})(/*!*//*16567*/arr/*<16567*/)/*<16565*/ } }/*<16558*/;

const seq_$gt = /*16625*/function name_16625(arr) { return /*16631*/(function match_16631($target) {
if ($target.type === "nil") {
return /*16637*//*16638*/$lt_/*<16638*//*16637*/(/*16639*/nil/*<16639*/)/*<16637*/
}
if ($target.type === "cons") {
{
let one = $target[0];
{
let rest = $target[1];
return /*16646*//*16647*/$gt$gt$eq/*<16647*//*16646*/(/*16650*/one/*<16650*/)(/*16646*/function name_16646(one) { return /*16646*//*16647*/$gt$gt$eq/*<16647*//*16646*/(/*16652*//*16653*/seq_$gt/*<16653*//*16652*/(/*16654*/rest/*<16654*/)/*<16652*/)(/*16646*/function name_16646(rest) { return /*16655*//*16656*/$lt_/*<16656*//*16655*/(/*16657*//*16657*/cons/*<16657*//*16657*/(/*16658*/one/*<16658*/)(/*16659*/rest/*<16659*/)/*<16657*/)/*<16655*/ }/*<16646*/)/*<16646*/ }/*<16646*/)/*<16646*/
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 16631');})(/*!*//*16635*/arr/*<16635*/)/*<16631*/ }/*<16625*/;

const $lt_idx = /*17397*//*16669*/$gt$gt$eq/*<16669*//*17397*/(/*17398*/$lt_state/*<17398*/)(/*17397*/function name_17397({0: idx}) { return /*17438*//*17406*/$lt_/*<17406*//*17438*/(/*17441*/idx/*<17441*/)/*<17438*/ }/*<17397*/)/*<17397*/;

const idx_$gt = /*16698*/function name_16698(v) { return /*17445*//*16854*/$gt$gt$eq/*<16854*//*17445*/(/*17452*/$lt_state/*<17452*/)(/*17445*/function name_17445({1: b}) { return /*17445*//*16854*/$gt$gt$eq/*<16854*//*17445*/(/*17454*//*17455*/state_$gt/*<17455*//*17454*/(/*17456*//*17457*/$co/*<17457*//*17456*/(/*17458*/v/*<17458*/)(/*17459*/b/*<17459*/)/*<17456*/)/*<17454*/)(/*17445*/function name_17445(_) { return /*17446*//*17460*/$lt_/*<17460*//*17446*/(/*17462*/0/*<17462*/)/*<17446*/ }/*<17445*/)/*<17445*/ }/*<17445*/)/*<17445*/ }/*<16698*/;

const foldl_$gt = /*16753*/function name_16753(init) { return function name_16753(values) { return function name_16753(f) { return /*16761*/(function match_16761($target) {
if ($target.type === "nil") {
return /*16765*//*16766*/$lt_/*<16766*//*16765*/(/*16767*/init/*<16767*/)/*<16765*/
}
if ($target.type === "cons") {
{
let one = $target[0];
{
let rest = $target[1];
return /*16778*//*16779*/$gt$gt$eq/*<16779*//*16778*/(/*16784*//*16785*/f/*<16785*//*16784*/(/*16786*/init/*<16786*/)(/*16789*/one/*<16789*/)/*<16784*/)(/*16778*/function name_16778(one) { return /*16774*//*16775*/foldl_$gt/*<16775*//*16774*/(/*16776*/one/*<16776*/)(/*16787*/rest/*<16787*/)(/*16788*/f/*<16788*/)/*<16774*/ }/*<16778*/)/*<16778*/
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 16761');})(/*!*//*16763*/values/*<16763*/)/*<16761*/ } } }/*<16753*/;

const foldr_$gt = /*16790*/function name_16790(init) { return function name_16790(values) { return function name_16790(f) { return /*16798*/(function match_16798($target) {
if ($target.type === "nil") {
return /*16802*//*16803*/$lt_/*<16803*//*16802*/(/*16804*/init/*<16804*/)/*<16802*/
}
if ($target.type === "cons") {
{
let one = $target[0];
{
let rest = $target[1];
return /*16812*//*16813*/$gt$gt$eq/*<16813*//*16812*/(/*16816*//*16817*/foldr_$gt/*<16817*//*16816*/(/*16818*/init/*<16818*/)(/*16819*/rest/*<16819*/)(/*16820*/f/*<16820*/)/*<16816*/)(/*16812*/function name_16812(init) { return /*16821*//*16822*/f/*<16822*//*16821*/(/*16823*/init/*<16823*/)(/*16824*/one/*<16824*/)/*<16821*/ }/*<16812*/)/*<16812*/
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 16798');})(/*!*//*16800*/values/*<16800*/)/*<16798*/ } } }/*<16790*/;

const record_$gt = /*17484*/function name_17484(loc) { return function name_17484(type) { return /*17491*//*17492*/$gt$gt$eq/*<17492*//*17491*/(/*17498*/$lt_state/*<17498*/)(/*17491*/function name_17491({0: idx, 1: types}) {
 return /*17491*//*17492*/$gt$gt$eq/*<17492*//*17491*/(/*17500*//*17501*/state_$gt/*<17501*//*17500*/(/*17502*//*17503*/$co/*<17503*//*17502*/(/*17504*/idx/*<17504*/)(/*17505*//*17505*/cons/*<17505*//*17505*/(/*17506*//*17507*/$co/*<17507*//*17506*/(/*17508*/loc/*<17508*/)(/*17509*/type/*<17509*/)/*<17506*/)(/*17510*/types/*<17510*/)/*<17505*/)/*<17502*/)/*<17500*/)(/*17491*/function name_17491(_) { return /*17517*//*17518*/$lt_/*<17518*//*17517*/(/*17519*/0/*<17519*/)/*<17517*/ }/*<17491*/)/*<17491*/ }/*<17491*/)/*<17491*/ } }/*<17484*/;

const $lt_types = /*17576*//*17577*/$gt$gt$eq/*<17577*//*17576*/(/*17583*/$lt_state/*<17583*/)(/*17576*/function name_17576({1: types}) { return /*17585*//*17586*/$lt_/*<17586*//*17585*/(/*17587*/types/*<17587*/)/*<17585*/ }/*<17576*/)/*<17576*/;

const externals = /*17848*/function name_17848(bound) { return function name_17848(expr) { return /*17856*/(function match_17856($target) {
if ($target.type === "evar") {
{
let name = $target[0];
{
let l = $target[1];
return /*17863*/(function match_17863($target) {
if ($target === true) {
return /*17870*/empty/*<17870*/
}
return /*17872*//*17873*/one/*<17873*//*17872*/(/*17874*//*17875*/$co$co/*<17875*//*17874*/(/*17876*/name/*<17876*/)(/*17877*//*17878*/value/*<17878*//*17877*//*<17877*/)(/*17879*/l/*<17879*/)/*<17874*/)/*<17872*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 17863');})(/*!*//*17865*//*17866*/set$slhas/*<17866*//*17865*/(/*17867*/bound/*<17867*/)(/*17868*/name/*<17868*/)/*<17865*/)/*<17863*/
}
}
}
if ($target.type === "eprim") {
{
let prim = $target[0];
{
let l = $target[1];
return /*17884*/empty/*<17884*/
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
return /*17890*//*17891*/many/*<17891*//*17890*/(/*17892*//*17893*/map/*<17893*//*17892*/(/*17894*/templates/*<17894*/)(/*17895*/function name_17895(arg) { return /*17899*/(function match_17899($target) {
if ($target.type === ",,") {
{
let expr = $target[0];
return /*17907*//*17908*/externals/*<17908*//*17907*/(/*17909*/bound/*<17909*/)(/*17910*/expr/*<17910*/)/*<17907*/
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 17899');})(/*!*//*17901*/arg/*<17901*/)/*<17899*/ }/*<17895*/)/*<17892*/)/*<17890*/
}
}
}
}
if ($target.type === "equot") {
{
let expr = $target[0];
{
let int = $target[1];
return /*17915*/empty/*<17915*/
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
return /*17921*//*17922*/bag$sland/*<17922*//*17921*/(/*17923*//*17924*/foldl/*<17924*//*17923*/(/*17925*/empty/*<17925*/)(/*17926*//*17927*/map/*<17927*//*17926*/(/*17928*/pats/*<17928*/)(/*17929*/pat_externals/*<17929*/)/*<17926*/)(/*17930*/bag$sland/*<17930*/)/*<17923*/)(/*17931*//*17932*/externals/*<17932*//*17931*/(/*17933*//*17934*/foldl/*<17934*//*17933*/(/*17935*/bound/*<17935*/)(/*17936*//*17937*/map/*<17937*//*17936*/(/*17938*/pats/*<17938*/)(/*17939*/pat_names/*<17939*/)/*<17936*/)(/*17940*/set$slmerge/*<17940*/)/*<17933*/)(/*17941*/body/*<17941*/)/*<17931*/)/*<17921*/
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
return /*18231*/(function let_18231() {const $target = /*17949*//*17950*/foldl/*<17950*//*17949*/(/*18225*//*17951*/$co/*<17951*//*18225*/(/*18226*/empty/*<18226*/)(/*18227*/bound/*<18227*/)/*<18225*/)(/*17952*/bindings/*<17952*/)(/*18213*/function name_18213({0: bag, 1: bound}) {
 return function name_18213({0: pat, 1: init}) {
 return /*18248*//*18249*/$co/*<18249*//*18248*/(/*18228*//*18214*/bag$sland/*<18214*//*18228*/(/*18229*/bag/*<18229*/)(/*18230*//*18240*/bag$sland/*<18240*//*18230*/(/*18241*//*18242*/pat_externals/*<18242*//*18241*/(/*18243*/pat/*<18243*/)/*<18241*/)(/*18244*//*18245*/externals/*<18245*//*18244*/(/*18246*/bound/*<18246*/)(/*18247*/init/*<18247*/)/*<18244*/)/*<18230*/)/*<18228*/)(/*18252*//*18251*/set$slmerge/*<18251*//*18252*/(/*18253*/bound/*<18253*/)(/*18254*//*18255*/pat_names/*<18255*//*18254*/(/*18256*/pat/*<18256*/)/*<18254*/)/*<18252*/)/*<18248*/ } }/*<18213*/)/*<17949*/;
if ($target.type === ",") {
{
let bag = $target[0];
{
let bound = $target[1];
return /*18257*//*18258*/bag$sland/*<18258*//*18257*/(/*18259*/bag/*<18259*/)(/*18260*//*18261*/externals/*<18261*//*18260*/(/*18262*/bound/*<18262*/)(/*18263*/body/*<18263*/)/*<18260*/)/*<18257*/
}
}
};
throw new Error('let pattern not matched 18236. ' + valueToString($target));})(/*!*/)/*<18231*/
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
return /*17997*//*17998*/bag$sland/*<17998*//*17997*/(/*17999*//*18000*/externals/*<18000*//*17999*/(/*18001*/bound/*<18001*/)(/*18002*/target/*<18002*/)/*<17999*/)(/*18003*//*18004*/foldl/*<18004*//*18003*/(/*18005*/empty/*<18005*/)(/*18006*//*18007*/map/*<18007*//*18006*/(/*18008*/args/*<18008*/)(/*18009*//*18010*/externals/*<18010*//*18009*/(/*18011*/bound/*<18011*/)/*<18009*/)/*<18006*/)(/*18012*/bag$sland/*<18012*/)/*<18003*/)/*<17997*/
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
return /*18018*//*18019*/bag$sland/*<18019*//*18018*/(/*18020*//*18021*/externals/*<18021*//*18020*/(/*18022*/bound/*<18022*/)(/*18023*/expr/*<18023*/)/*<18020*/)(/*18024*//*18025*/foldl/*<18025*//*18024*/(/*18026*/empty/*<18026*/)(/*18027*/cases/*<18027*/)(/*18028*/function name_18028(bag) { return function name_18028(arg) { return /*18033*/(function match_18033($target) {
if ($target.type === ",") {
{
let pat = $target[0];
{
let body = $target[1];
return /*18040*//*18041*/bag$sland/*<18041*//*18040*/(/*18042*//*18043*/bag$sland/*<18043*//*18042*/(/*18044*/bag/*<18044*/)(/*18045*//*18046*/pat_externals/*<18046*//*18045*/(/*18047*/pat/*<18047*/)/*<18045*/)/*<18042*/)(/*18048*//*18049*/externals/*<18049*//*18048*/(/*18050*//*18051*/set$slmerge/*<18051*//*18050*/(/*18052*/bound/*<18052*/)(/*18053*//*18054*/pat_names/*<18054*//*18053*/(/*18055*/pat/*<18055*/)/*<18053*/)/*<18050*/)(/*18056*/body/*<18056*/)/*<18048*/)/*<18040*/
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 18033');})(/*!*//*18035*/arg/*<18035*/)/*<18033*/ } }/*<18028*/)/*<18024*/)/*<18018*/
}
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 17856');})(/*!*//*17858*/expr/*<17858*/)/*<17856*/ } }/*<17848*/;

const tenv$slrm = /*926*/function name_926({0: types, 1: cons, 2: names, 3: alias}) {


 return function name_926($var) { return /*3319*//*3320*/tenv/*<3320*//*3319*/(/*981*//*982*/map$slrm/*<982*//*981*/(/*983*/types/*<983*/)(/*984*/$var/*<984*/)/*<981*/)(/*3321*/cons/*<3321*/)(/*3322*/names/*<3322*/)(/*13292*/alias/*<13292*/)/*<3319*/ } }/*<926*/;

const compose_subst = /*956*/function name_956(place) { return function name_956(new_subst) { return function name_956(old_subst) { return /*12160*/(function match_12160($target) {
if ($target.type === "some") {
{
let message = $target[0];
return /*12136*//*12156*/fatal/*<12156*//*12136*/(/*12157*/message/*<12157*/)/*<12136*/
}
}
return /*963*//*964*/map$slmerge/*<964*//*963*/(/*965*//*966*/map$slmap/*<966*//*965*/(/*967*//*968*/type_apply/*<968*//*967*/(/*969*/new_subst/*<969*/)/*<967*/)(/*970*/old_subst/*<970*/)/*<965*/)(/*971*/new_subst/*<971*/)/*<963*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 12160');})(/*!*//*12514*//*12515*/check_invariant/*<12515*//*12514*/(/*12516*/place/*<12516*/)(/*12517*/new_subst/*<12517*/)(/*12518*/old_subst/*<12518*/)/*<12514*/)/*<12160*/ } } }/*<956*/;

const tenv_free = /*985*/function name_985({0: types}) { return /*991*//*992*/foldr/*<992*//*991*/(/*994*/set$slnil/*<994*/)(/*995*//*996*/map/*<996*//*995*/(/*998*//*999*/map$slvalues/*<999*//*998*/(/*1000*/types/*<1000*/)/*<998*/)(/*1135*/scheme_free/*<1135*/)/*<995*/)(/*1169*/set$slmerge/*<1169*/)/*<991*/ }/*<985*/;

const tenv_apply = /*1170*/function name_1170(subst) { return function name_1170({0: types, 1: cons, 2: names, 3: alias}) {


 return /*3332*//*3333*/tenv/*<3333*//*3332*/(/*1179*//*1180*/map$slmap/*<1180*//*1179*/(/*1181*//*1182*/scheme_apply/*<1182*//*1181*/(/*1183*/subst/*<1183*/)/*<1181*/)(/*1185*/types/*<1185*/)/*<1179*/)(/*3334*/cons/*<3334*/)(/*3335*/names/*<3335*/)(/*13299*/alias/*<13299*/)/*<3332*/ } }/*<1170*/;

const generalize = /*1186*/function name_1186(tenv) { return function name_1186(t) { return /*1193*//*1194*/scheme/*<1194*//*1193*/(/*1195*//*1196*/set$sldiff/*<1196*//*1195*/(/*1197*//*1198*/type_free/*<1198*//*1197*/(/*1199*/t/*<1199*/)/*<1197*/)(/*1200*//*1201*/tenv_free/*<1201*//*1200*/(/*1202*/tenv/*<1202*/)/*<1200*/)/*<1195*/)(/*1203*/t/*<1203*/)/*<1193*/ } }/*<1186*/;

const unify_inner = /*1309*/function name_1309(t1) { return function name_1309(t2) { return function name_1309(l) { return /*1317*/(function match_1317($target) {
if ($target.type === ",") {
if ($target[0].type === "tapp") {
{
let target_1 = $target[0][0];
{
let arg_1 = $target[0][1];
if ($target[1].type === "tapp") {
{
let target_2 = $target[1][0];
{
let arg_2 = $target[1][1];
return /*1326*//*1474*/$gt$gt$eq/*<1474*//*1326*/(/*1481*//*1482*/unify_inner/*<1482*//*1481*/(/*1483*/target_1/*<1483*/)(/*1484*/target_2/*<1484*/)(/*11554*/l/*<11554*/)/*<1481*/)(/*1326*/function name_1326(target_subst) { return /*1326*//*1474*/$gt$gt$eq/*<1474*//*1326*/(/*1489*//*1490*/unify_inner/*<1490*//*1489*/(/*1491*//*1492*/type_apply/*<1492*//*1491*/(/*1493*/target_subst/*<1493*/)(/*1494*/arg_1/*<1494*/)/*<1491*/)(/*1495*//*1496*/type_apply/*<1496*//*1495*/(/*1497*/target_subst/*<1497*/)(/*1498*/arg_2/*<1498*/)/*<1495*/)(/*11555*/l/*<11555*/)/*<1489*/)(/*1326*/function name_1326(arg_subst) { return /*16949*//*16950*/$lt_/*<16950*//*16949*/(/*1503*//*1504*/compose_subst/*<1504*//*1503*/(/*12260*/"unify-tapp"/*<12260*/)(/*1506*/arg_subst/*<1506*/)(/*12262*/target_subst/*<12262*/)/*<1503*/)/*<16949*/ }/*<1326*/)/*<1326*/ }/*<1326*/)/*<1326*/
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
let $var = $target[0][0];
{
let t = $target[1];
return /*1621*//*1622*/$lt_/*<1622*//*1621*/(/*1514*//*1515*/var_bind/*<1515*//*1514*/(/*1516*/$var/*<1516*/)(/*1517*/t/*<1517*/)/*<1514*/)/*<1621*/
}
}
}
}
if ($target.type === ",") {
{
let t = $target[0];
if ($target[1].type === "tvar") {
{
let $var = $target[1][0];
return /*1623*//*1624*/$lt_/*<1624*//*1623*/(/*1526*//*1527*/var_bind/*<1527*//*1526*/(/*1528*/$var/*<1528*/)(/*1529*/t/*<1529*/)/*<1526*/)/*<1623*/
}
}
}
}
if ($target.type === ",") {
if ($target[0].type === "tcon") {
{
let a = $target[0][0];
{
let la = $target[0][1];
if ($target[1].type === "tcon") {
{
let b = $target[1][0];
{
let lb = $target[1][1];
return /*1541*/(function match_1541($target) {
if ($target === true) {
return /*2071*//*2072*/$lt_/*<2072*//*2071*/(/*1548*/map$slnil/*<1548*/)/*<2071*/
}
return /*1549*//*1550*/$lt_err/*<1550*//*1549*/(/*18473*//*18474*/type_error/*<18474*//*18473*/(/*18475*/"Incompatible type constructors"/*<18475*/)(/*18477*//*18477*/cons/*<18477*//*18477*/(/*18478*//*18479*/$co/*<18479*//*18478*/(/*18480*/a/*<18480*/)(/*18481*/la/*<18481*/)/*<18478*/)(/*18477*//*18477*/cons/*<18477*//*18477*/(/*18482*//*18483*/$co/*<18483*//*18482*/(/*18484*/b/*<18484*/)(/*18485*/lb/*<18485*/)/*<18482*/)(/*18477*/nil/*<18477*/)/*<18477*/)/*<18477*/)/*<18473*/)/*<1549*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 1541');})(/*!*//*1544*//*1545*/$eq/*<1545*//*1544*/(/*1546*/a/*<1546*/)(/*1547*/b/*<1547*/)/*<1544*/)/*<1541*/
}
}
}
}
}
}
}
return /*1554*//*1555*/$lt_err/*<1555*//*1554*/(/*18452*//*18453*/type_error/*<18453*//*18452*/(/*18454*/"Incompatible types"/*<18454*/)(/*18456*//*18456*/cons/*<18456*//*18456*/(/*18457*//*18458*/$co/*<18458*//*18457*/(/*18459*//*18460*/type_to_string/*<18460*//*18459*/(/*18461*/t1/*<18461*/)/*<18459*/)(/*18462*//*18463*/type_loc/*<18463*//*18462*/(/*18464*/t1/*<18464*/)/*<18462*/)/*<18457*/)(/*18456*//*18456*/cons/*<18456*//*18456*/(/*18465*//*18466*/$co/*<18466*//*18465*/(/*18467*//*18468*/type_to_string/*<18468*//*18467*/(/*18469*/t2/*<18469*/)/*<18467*/)(/*18470*//*18471*/type_loc/*<18471*//*18470*/(/*18472*/t2/*<18472*/)/*<18470*/)/*<18465*/)(/*18456*/nil/*<18456*/)/*<18456*/)/*<18456*/)/*<18452*/)/*<1554*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 1317');})(/*!*//*1319*//*1320*/$co/*<1320*//*1319*/(/*1321*/t1/*<1321*/)(/*1322*/t2/*<1322*/)/*<1319*/)/*<1317*/ } } }/*<1309*/;

const new_type_var = /*1731*/function name_1731(prefix) { return function name_1731(l) { return /*16872*//*16873*/$gt$gt$eq/*<16873*//*16872*/(/*16876*/$lt_idx/*<16876*/)(/*16872*/function name_16872(nidx) { return /*16872*//*16873*/$gt$gt$eq/*<16873*//*16872*/(/*16878*//*16881*/idx_$gt/*<16881*//*16878*/(/*16882*//*16883*/$pl/*<16883*//*16882*/(/*16884*/nidx/*<16884*/)(/*16885*/1/*<16885*/)/*<16882*/)/*<16878*/)(/*16872*/function name_16872(_) { return /*16886*//*16887*/$lt_/*<16887*//*16886*/(/*2074*//*2075*/tvar/*<2075*//*2074*/(/*1741*/`${/*1743*/prefix/*<1743*/}:${/*10496*//*1745*/its/*<1745*//*10496*/(/*10497*/nidx/*<10497*/)/*<10496*/}`/*<1741*/)(/*2076*/l/*<2076*/)/*<2074*/)/*<16886*/ }/*<16872*/)/*<16872*/ }/*<16872*/)/*<16872*/ } }/*<1731*/;

const basic = /*3374*//*3375*/tenv/*<3375*//*3374*/(/*3367*//*3368*/map$slfrom_list/*<3368*//*3367*/(/*3366*//*3366*/cons/*<3366*//*3366*/(/*2042*//*2043*/$co/*<2043*//*2042*/(/*2045*/"+"/*<2045*/)(/*2087*//*2088*/scheme/*<2088*//*2087*/(/*2091*/set$slnil/*<2091*/)(/*2047*//*2048*/tfn/*<2048*//*2047*/(/*2049*/tint/*<2049*/)(/*2094*//*2095*/tfn/*<2095*//*2094*/(/*2096*/tint/*<2096*/)(/*2061*/tint/*<2061*/)(/*2097*/-1/*<2097*/)/*<2094*/)(/*2062*/-1/*<2062*/)/*<2047*/)/*<2087*/)/*<2042*/)(/*3366*//*3366*/cons/*<3366*//*3366*/(/*9705*//*9706*/$co/*<9706*//*9705*/(/*9707*/"-"/*<9707*/)(/*9709*//*9710*/scheme/*<9710*//*9709*/(/*9711*/set$slnil/*<9711*/)(/*9712*//*9713*/tfn/*<9713*//*9712*/(/*9714*/tint/*<9714*/)(/*9715*//*9716*/tfn/*<9716*//*9715*/(/*9717*/tint/*<9717*/)(/*9718*/tint/*<9718*/)(/*9719*/-1/*<9719*/)/*<9715*/)(/*9720*/-1/*<9720*/)/*<9712*/)/*<9709*/)/*<9705*/)(/*3366*//*3366*/cons/*<3366*//*3366*/(/*3369*//*3370*/$co/*<3370*//*3369*/(/*3372*/","/*<3372*/)(/*2374*//*2375*/scheme/*<2375*//*2374*/(/*2376*//*2380*/set$slfrom_list/*<2380*//*2376*/(/*3225*//*3225*/cons/*<3225*//*3225*/(/*2382*/"a"/*<2382*/)(/*3225*//*3225*/cons/*<3225*//*3225*/(/*3226*/"b"/*<3226*/)(/*3225*/nil/*<3225*/)/*<3225*/)/*<3225*/)/*<2376*/)(/*2377*//*2378*/tfn/*<2378*//*2377*/(/*2379*//*2384*/tvar/*<2384*//*2379*/(/*2385*/"a"/*<2385*/)(/*2387*/-1/*<2387*/)/*<2379*/)(/*2388*//*2389*/tfn/*<2389*//*2388*/(/*2390*//*2391*/tvar/*<2391*//*2390*/(/*2392*/"b"/*<2392*/)(/*2394*/-1/*<2394*/)/*<2390*/)(/*2402*//*2403*/tapp/*<2403*//*2402*/(/*2400*//*2401*/tapp/*<2401*//*2400*/(/*2395*//*2396*/tcon/*<2396*//*2395*/(/*2397*/","/*<2397*/)(/*2399*/-1/*<2399*/)/*<2395*/)(/*2404*//*2405*/tvar/*<2405*//*2404*/(/*2406*/"a"/*<2406*/)(/*2408*/-1/*<2408*/)/*<2404*/)(/*2409*/-1/*<2409*/)/*<2400*/)(/*2410*//*2411*/tvar/*<2411*//*2410*/(/*2412*/"b"/*<2412*/)(/*2414*/-1/*<2414*/)/*<2410*/)(/*2415*/-1/*<2415*/)/*<2402*/)(/*2416*/-1/*<2416*/)/*<2388*/)(/*2417*/-1/*<2417*/)/*<2377*/)/*<2374*/)/*<3369*/)(/*3366*/nil/*<3366*/)/*<3366*/)/*<3366*/)/*<3366*/)/*<3367*/)(/*3376*//*3676*/map$slfrom_list/*<3676*//*3376*/(/*3677*//*3677*/cons/*<3677*//*3677*/(/*3678*//*3681*/$co/*<3681*//*3678*/(/*3682*/","/*<3682*/)(/*3684*//*3685*/tconstructor/*<3685*//*3684*/(/*3686*//*3687*/set$slfrom_list/*<3687*//*3686*/(/*3688*//*3688*/cons/*<3688*//*3688*/(/*3689*/"a"/*<3689*/)(/*3688*//*3688*/cons/*<3688*//*3688*/(/*3691*/"b"/*<3691*/)(/*3688*/nil/*<3688*/)/*<3688*/)/*<3688*/)/*<3686*/)(/*3693*//*3693*/cons/*<3693*//*3693*/(/*3696*//*3697*/tvar/*<3697*//*3696*/(/*3698*/"a"/*<3698*/)(/*3700*/-1/*<3700*/)/*<3696*/)(/*3693*//*3693*/cons/*<3693*//*3693*/(/*3701*//*3702*/tvar/*<3702*//*3701*/(/*3703*/"b"/*<3703*/)(/*3705*/-1/*<3705*/)/*<3701*/)(/*3693*/nil/*<3693*/)/*<3693*/)/*<3693*/)(/*3706*//*3707*/tapp/*<3707*//*3706*/(/*3708*//*3709*/tapp/*<3709*//*3708*/(/*3710*//*3711*/tcon/*<3711*//*3710*/(/*3712*/","/*<3712*/)(/*3714*/-1/*<3714*/)/*<3710*/)(/*3715*//*3716*/tvar/*<3716*//*3715*/(/*3717*/"a"/*<3717*/)(/*3719*/-1/*<3719*/)/*<3715*/)(/*3727*/-1/*<3727*/)/*<3708*/)(/*3720*//*3721*/tvar/*<3721*//*3720*/(/*3722*/"b"/*<3722*/)(/*3724*/-1/*<3724*/)/*<3720*/)(/*3726*/-1/*<3726*/)/*<3706*/)/*<3684*/)/*<3678*/)(/*3677*/nil/*<3677*/)/*<3677*/)/*<3376*/)(/*3377*//*14990*/map$slfrom_list/*<14990*//*3377*/(/*14991*//*14991*/cons/*<14991*//*14991*/(/*14992*//*14993*/$co/*<14993*//*14992*/(/*14994*/"int"/*<14994*/)(/*14996*//*14997*/$co/*<14997*//*14996*/(/*14998*/0/*<14998*/)(/*14999*/set$slnil/*<14999*/)/*<14996*/)/*<14992*/)(/*14991*//*14991*/cons/*<14991*//*14991*/(/*15000*//*15001*/$co/*<15001*//*15000*/(/*15002*/"string"/*<15002*/)(/*15004*//*15005*/$co/*<15005*//*15004*/(/*15006*/0/*<15006*/)(/*15007*/set$slnil/*<15007*/)/*<15004*/)/*<15000*/)(/*14991*//*14991*/cons/*<14991*//*14991*/(/*15008*//*15009*/$co/*<15009*//*15008*/(/*15010*/"bool"/*<15010*/)(/*15012*//*15014*/$co/*<15014*//*15012*/(/*15015*/0/*<15015*/)(/*15016*/set$slnil/*<15016*/)/*<15012*/)/*<15008*/)(/*14991*/nil/*<14991*/)/*<14991*/)/*<14991*/)/*<14991*/)/*<3377*/)(/*13333*/map$slnil/*<13333*/)/*<3374*/;

const typecheck = (v0) => (v1) => (v2) => (v3) => ({type: "typecheck", 0: v0, 1: v1, 2: v2, 3: v3});
const subst_to_string = /*6304*/function name_6304(subst) { return /*6330*//*6331*/join/*<6331*//*6330*/(/*6334*/"\n"/*<6334*/)(/*6313*//*6314*/map/*<6314*//*6313*/(/*6310*//*6311*/map$slto_list/*<6311*//*6310*/(/*6312*/subst/*<6312*/)/*<6310*/)(/*6315*/function name_6315({0: k, 1: v}) {
 return /*6322*/`${/*6324*/k/*<6324*/} : ${/*6326*//*6328*/type_to_string_raw/*<6328*//*6326*/(/*6329*/v/*<6329*/)/*<6326*/}`/*<6322*/ }/*<6315*/)/*<6313*/)/*<6330*/ }/*<6304*/;

const externals_stmt = /*7289*/function name_7289(stmt) { return /*7505*//*7506*/bag$slto_list/*<7506*//*7505*/(/*7296*/(function match_7296($target) {
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
return /*14134*/(function let_14134() {const $target = /*14138*//*14139*/set$slfrom_list/*<14139*//*14138*/(/*14143*//*14140*/map/*<14140*//*14143*/(/*14144*/free/*<14144*/)(/*14145*/fst/*<14145*/)/*<14143*/)/*<14138*/;
{
let frees = $target;
return /*14068*//*14069*/many/*<14069*//*14068*/(/*7332*//*14051*/map/*<14051*//*7332*/(/*14053*/constructors/*<14053*/)(/*14054*/function name_14054({0: name, 1: l, 2: args}) {

 return /*14067*/(function match_14067($target) {
if ($target.type === "nil") {
return /*14073*/empty/*<14073*/
}
return /*14075*//*14076*/many/*<14076*//*14075*/(/*14077*//*14078*/map/*<14078*//*14077*/(/*14079*/args/*<14079*/)(/*14080*//*14132*/externals_type/*<14132*//*14080*/(/*14133*/frees/*<14133*/)/*<14080*/)/*<14077*/)/*<14075*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 14067');})(/*!*//*14071*/args/*<14071*/)/*<14067*/ }/*<14054*/)/*<7332*/)/*<14068*/
};
throw new Error('let pattern not matched 14137. ' + valueToString($target));})(/*!*/)/*<14134*/
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
return /*13222*/(function let_13222() {const $target = /*14161*//*14162*/set$slfrom_list/*<14162*//*14161*/(/*14163*//*14164*/map/*<14164*//*14163*/(/*14165*/args/*<14165*/)(/*14166*/fst/*<14166*/)/*<14163*/)/*<14161*/;
{
let frees = $target;
return /*14167*//*14172*/externals_type/*<14172*//*14167*/(/*14173*/frees/*<14173*/)(/*14174*/body/*<14174*/)/*<14167*/
};
throw new Error('let pattern not matched 14160. ' + valueToString($target));})(/*!*/)/*<13222*/
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
return /*7333*//*7360*/externals/*<7360*//*7333*/(/*7363*//*7365*/set$sladd/*<7365*//*7363*/(/*7366*/set$slnil/*<7366*/)(/*7367*/name/*<7367*/)/*<7363*/)(/*7364*/body/*<7364*/)/*<7333*/
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
return /*7368*//*7369*/externals/*<7369*//*7368*/(/*7370*/set$slnil/*<7370*/)(/*7372*/expr/*<7372*/)/*<7368*/
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 7296');})(/*!*//*7299*/stmt/*<7299*/)/*<7296*/)/*<7505*/ }/*<7289*/;

const expr_to_string = /*11103*/function name_11103(expr) { return /*11109*/(function match_11109($target) {
if ($target.type === "evar") {
{
let n = $target[0];
return /*11118*/n/*<11118*/
}
}
if ($target.type === "elambda") {
{
let pats = $target[0];
{
let b = $target[1];
return /*11125*/`(fn [${/*17704*//*17705*/join/*<17705*//*17704*/(/*17706*/" "/*<17706*/)(/*16239*//*11127*/map/*<11127*//*16239*/(/*17708*/pats/*<17708*/)(/*17709*/pat_to_string/*<17709*/)/*<16239*/)/*<17704*/}] ${/*11129*//*11131*/expr_to_string/*<11131*//*11129*/(/*11132*/b/*<11132*/)/*<11129*/})`/*<11125*/
}
}
}
if ($target.type === "eapp") {
{
let a = $target[0];
{
let args = $target[1];
return /*11138*/`(${/*11143*//*11140*/expr_to_string/*<11140*//*11143*/(/*11144*/a/*<11144*/)/*<11143*/} ${/*17698*//*17699*/join/*<17699*//*17698*/(/*17700*/" "/*<17700*/)(/*11145*//*11147*/map/*<11147*//*11145*/(/*17702*/args/*<17702*/)(/*17703*/expr_to_string/*<17703*/)/*<11145*/)/*<17698*/})`/*<11138*/
}
}
}
if ($target.type === "eprim") {
if ($target[0].type === "pint") {
{
let n = $target[0][0];
return /*11159*//*11160*/int_to_string/*<11160*//*11159*/(/*11161*/n/*<11161*/)/*<11159*/
}
}
}
if ($target.type === "ematch") {
{
let t = $target[0];
{
let cases = $target[1];
return /*11167*/`(match ${/*11169*//*11171*/expr_to_string/*<11171*//*11169*/(/*11172*/t/*<11172*/)/*<11169*/} ${/*11173*//*11175*/join/*<11175*//*11173*/(/*11176*/"\n"/*<11176*/)(/*11178*//*11179*/map/*<11179*//*11178*/(/*11180*/cases/*<11180*/)(/*11181*/function name_11181({0: a, 1: b}) {
 return /*11188*/`${/*11190*//*11192*/pat_to_string/*<11192*//*11190*/(/*11193*/a/*<11193*/)/*<11190*/} ${/*11194*//*11196*/expr_to_string/*<11196*//*11194*/(/*11197*/b/*<11197*/)/*<11194*/}`/*<11188*/ }/*<11181*/)/*<11178*/)/*<11173*/}`/*<11167*/
}
}
}
return /*11150*/"??"/*<11150*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 11109');})(/*!*//*11113*/expr/*<11113*/)/*<11109*/ }/*<11103*/;

const unify = /*12922*/function name_12922(t1) { return function name_12922(t2) { return function name_12922(nidx) { return function name_12922(l) { return /*16942*//*16943*/force/*<16943*//*16942*/(/*18499*/type_error_$gts/*<18499*/)(/*16946*//*16947*/run_$gt/*<16947*//*16946*/(/*13006*//*13010*/unify_inner/*<13010*//*13006*/(/*13011*/t1/*<13011*/)(/*13013*/t2/*<13013*/)(/*13015*/l/*<13015*/)/*<13006*/)(/*16948*/nidx/*<16948*/)/*<16946*/)/*<16942*/ } } } }/*<12922*/;

const infer_deftype = /*14702*/function name_14702(tenv$qu) { return function name_14702(bound) { return function name_14702(tname) { return function name_14702(tnl) { return function name_14702(targs) { return function name_14702(constructors) { return function name_14702(l) { return /*14709*//*14710*/$gt$gt$eq/*<14710*//*14709*/(/*17241*//*17242*/$lt_/*<17242*//*17241*/(/*14713*//*14714*/map/*<14714*//*14713*/(/*14715*/constructors/*<14715*/)(/*14716*/function name_14716({0: name}) { return /*14725*/name/*<14725*/ }/*<14716*/)/*<14713*/)/*<17241*/)(/*14709*/function name_14709(names) { return /*14709*//*14710*/$gt$gt$eq/*<14710*//*14709*/(/*17239*//*17240*/$lt_/*<17240*//*17239*/(/*14727*//*14728*/foldl/*<14728*//*14727*/(/*14729*//*14730*/tcon/*<14730*//*14729*/(/*14731*/tname/*<14731*/)(/*14732*/tnl/*<14732*/)/*<14729*/)(/*14733*/targs/*<14733*/)(/*14734*/function name_14734(body) { return function name_14734({0: arg, 1: al}) {
 return /*14742*//*14743*/tapp/*<14743*//*14742*/(/*14744*/body/*<14744*/)(/*14745*//*14746*/tvar/*<14746*//*14745*/(/*14747*/arg/*<14747*/)(/*14748*/al/*<14748*/)/*<14745*/)(/*14749*/l/*<14749*/)/*<14742*/ } }/*<14734*/)/*<14727*/)/*<17239*/)(/*14709*/function name_14709(final) { return /*14709*//*14710*/$gt$gt$eq/*<14710*//*14709*/(/*17237*//*17238*/$lt_/*<17238*//*17237*/(/*14751*//*14752*/foldl/*<14752*//*14751*/(/*14753*/set$slnil/*<14753*/)(/*14754*/targs/*<14754*/)(/*14755*/function name_14755(free) { return function name_14755({0: arg}) { return /*14763*//*14764*/set$sladd/*<14764*//*14763*/(/*14765*/free/*<14765*/)(/*14766*/arg/*<14766*/)/*<14763*/ } }/*<14755*/)/*<14751*/)/*<17237*/)(/*14709*/function name_14709(free_set) { return /*14709*//*14710*/$gt$gt$eq/*<14710*//*14709*/(/*14771*//*14772*/foldl_$gt/*<14772*//*14771*/(/*14773*//*14774*/$co/*<14774*//*14773*/(/*14775*/map$slnil/*<14775*/)(/*14776*/map$slnil/*<14776*/)/*<14773*/)(/*14777*/constructors/*<14777*/)(/*14778*/function name_14778({0: values, 1: cons}) {
 return function name_14778({0: name, 1: nl, 2: args, 3: l}) {


 return /*14791*//*14792*/$gt$gt$eq/*<14792*//*14791*/(/*17231*//*17232*/$lt_/*<17232*//*17231*/(/*14795*//*14796*/map/*<14796*//*14795*/(/*14797*/args/*<14797*/)(/*14798*/function name_14798(arg) { return /*14802*//*14803*/type_with_free/*<14803*//*14802*/(/*14804*/arg/*<14804*/)(/*14805*/free_set/*<14805*/)/*<14802*/ }/*<14798*/)/*<14795*/)/*<17231*/)(/*14791*/function name_14791(args) { return /*14791*//*14792*/$gt$gt$eq/*<14792*//*14791*/(/*17233*//*17234*/$lt_/*<17234*//*17233*/(/*14807*//*14808*/map/*<14808*//*14807*/(/*14809*/args/*<14809*/)(/*14810*//*14811*/subst_aliases/*<14811*//*14810*/(/*14812*//*14813*/tenv$slalias/*<14813*//*14812*/(/*14814*/tenv$qu/*<14814*/)/*<14812*/)/*<14810*/)/*<14807*/)/*<17233*/)(/*14791*/function name_14791(args) { return /*14791*//*14792*/$gt$gt$eq/*<14792*//*14791*/(/*13348*//*13349*/map_$gt/*<13349*//*13348*/(/*13351*/function name_13351(arg) { return /*14883*/(function match_14883($target) {
if ($target.type === "nil") {
return /*17229*//*14895*/$lt_/*<14895*//*17229*/(/*17230*/true/*<17230*/)/*<17229*/
}
{
let names = $target;
return /*14897*//*17227*/$lt_err/*<17227*//*14897*/(/*18546*//*18547*/type_error/*<18547*//*18546*/(/*14899*/`Unbound types (in deftype ${/*14970*/tname/*<14970*/})`/*<14899*/)(/*14906*//*14907*/map/*<14907*//*14906*/(/*14908*/names/*<14908*/)(/*14909*/function name_14909({0: name, 2: l}) {
 return /*18549*//*14917*/$co/*<14917*//*18549*/(/*18550*/name/*<18550*/)(/*18551*/l/*<18551*/)/*<18549*/ }/*<14909*/)/*<14906*/)/*<18546*/)/*<14897*/
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 14883');})(/*!*//*14889*//*14890*/bag$slto_list/*<14890*//*14889*/(/*14885*//*14886*/externals_type/*<14886*//*14885*/(/*14891*//*14887*/set$sladd/*<14887*//*14891*/(/*14892*/bound/*<14892*/)(/*14893*/tname/*<14893*/)/*<14891*/)(/*14888*/arg/*<14888*/)/*<14885*/)/*<14889*/)/*<14883*/ }/*<13351*/)(/*17247*/args/*<17247*/)/*<13348*/)(/*14791*/function name_14791(_) { return /*17235*//*17236*/$lt_/*<17236*//*17235*/(/*14817*//*14818*/$co/*<14818*//*14817*/(/*14819*//*14820*/map$slset/*<14820*//*14819*/(/*14821*/values/*<14821*/)(/*14822*/name/*<14822*/)(/*14823*//*14824*/scheme/*<14824*//*14823*/(/*14825*/free_set/*<14825*/)(/*14826*//*14827*/foldr/*<14827*//*14826*/(/*14828*/final/*<14828*/)(/*14829*/args/*<14829*/)(/*14830*/function name_14830(body) { return function name_14830(arg) { return /*14835*//*14836*/tfn/*<14836*//*14835*/(/*14837*/arg/*<14837*/)(/*14838*/body/*<14838*/)(/*14839*/l/*<14839*/)/*<14835*/ } }/*<14830*/)/*<14826*/)/*<14823*/)/*<14819*/)(/*14840*//*14841*/map$slset/*<14841*//*14840*/(/*14842*/cons/*<14842*/)(/*14843*/name/*<14843*/)(/*14844*//*14845*/tconstructor/*<14845*//*14844*/(/*14846*/free_set/*<14846*/)(/*14847*/args/*<14847*/)(/*14848*/final/*<14848*/)/*<14844*/)/*<14840*/)/*<14817*/)/*<17235*/ }/*<14791*/)/*<14791*/ }/*<14791*/)/*<14791*/ }/*<14791*/)/*<14791*/ } }/*<14778*/)/*<14771*/)(/*14709*/function name_14709({0: values, 1: cons}) {
 return /*17243*//*17244*/$lt_/*<17244*//*17243*/(/*14849*//*14850*/tenv/*<14850*//*14849*/(/*14851*/values/*<14851*/)(/*14852*/cons/*<14852*/)(/*14853*//*14854*/map$slset/*<14854*//*14853*/(/*14855*/map$slnil/*<14855*/)(/*14856*/tname/*<14856*/)(/*14857*//*14858*/$co/*<14858*//*14857*/(/*14859*//*14860*/len/*<14860*//*14859*/(/*14861*/targs/*<14861*/)/*<14859*/)(/*14862*//*14863*/set$slfrom_list/*<14863*//*14862*/(/*14864*/names/*<14864*/)/*<14862*/)/*<14857*/)/*<14853*/)(/*14865*/map$slnil/*<14865*/)/*<14849*/)/*<17243*/ }/*<14709*/)/*<14709*/ }/*<14709*/)/*<14709*/ }/*<14709*/)/*<14709*/ }/*<14709*/)/*<14709*/ } } } } } } }/*<14702*/;

const externals_list = /*11809*/function name_11809(x) { return /*11815*//*11816*/bag$slto_list/*<11816*//*11815*/(/*11806*//*11807*/externals/*<11807*//*11806*/(/*11808*/set$slnil/*<11808*/)(/*11813*/x/*<11813*/)/*<11806*/)/*<11815*/ }/*<11809*/;

const vars_for_names = /*15643*/function name_15643(names) { return function name_15643(tenv) { return /*15474*//*15475*/foldr_$gt/*<15475*//*15474*/(/*15476*//*15477*/$co/*<15477*//*15476*/(/*15479*/tenv/*<15479*/)(/*15480*/nil/*<15480*/)/*<15476*/)(/*15482*/names/*<15482*/)(/*15483*/function name_15483({0: tenv, 1: vars}) {
 return function name_15483({0: name, 1: loc}) {
 return /*15495*//*15496*/$gt$gt$eq/*<15496*//*15495*/(/*15503*//*15504*/new_type_var/*<15504*//*15503*/(/*15505*/name/*<15505*/)(/*15507*/loc/*<15507*/)/*<15503*/)(/*15495*/function name_15495(self) { return /*17017*//*17018*/$lt_/*<17018*//*17017*/(/*15508*//*15509*/$co/*<15509*//*15508*/(/*15528*//*15511*/tenv$slset_type/*<15511*//*15528*/(/*15512*/tenv/*<15512*/)(/*15513*/name/*<15513*/)(/*15514*//*15515*/scheme/*<15515*//*15514*/(/*15516*/set$slnil/*<15516*/)(/*15517*/self/*<15517*/)/*<15514*/)/*<15528*/)(/*15518*//*15518*/cons/*<15518*//*15518*/(/*15519*/self/*<15519*/)(/*15520*/vars/*<15520*/)/*<15518*/)/*<15508*/)/*<17017*/ }/*<15495*/)/*<15495*/ } }/*<15483*/)/*<15474*/ } }/*<15643*/;

const externals_defs = /*15846*/function name_15846(stmts) { return /*15727*//*15728*/foldr/*<15728*//*15727*/(/*15729*/empty/*<15729*/)(/*15730*//*15731*/map/*<15731*//*15730*/(/*15732*/stmts/*<15732*/)(/*15733*/function name_15733({2: body}) { return /*15742*//*15743*/externals/*<15743*//*15742*/(/*15744*/set$slnil/*<15744*/)(/*15745*/body/*<15745*/)/*<15742*/ }/*<15733*/)/*<15730*/)(/*15746*/bag$sland/*<15746*/)/*<15727*/ }/*<15846*/;

const find_missing = /*15911*/function name_15911(tenv) { return function name_15911(externals) { return /*15919*//*15920*/$gt$gt$eq/*<15920*//*15919*/(/*17019*//*17020*/$lt_/*<17020*//*17019*/(/*15923*//*15924*/find_missing_names/*<15924*//*15923*/(/*15925*//*15926*/tenv$slvalues/*<15926*//*15925*/(/*15927*/tenv/*<15927*/)/*<15925*/)(/*15928*/externals/*<15928*/)/*<15923*/)/*<17019*/)(/*15919*/function name_15919(missing_names) { return /*15919*//*15920*/$gt$gt$eq/*<15920*//*15919*/(/*15937*//*15938*/vars_for_names/*<15938*//*15937*/(/*15939*/missing_names/*<15939*/)(/*15941*/tenv/*<15941*/)/*<15937*/)(/*15919*/function name_15919({0: tenv, 1: missing_vars}) {
 return /*17021*//*17022*/$lt_/*<17022*//*17021*/(/*15942*//*15943*/$co/*<15943*//*15942*/(/*15944*/tenv/*<15944*/)(/*15946*//*15947*/$co/*<15947*//*15946*/(/*15948*/missing_names/*<15948*/)(/*15949*/missing_vars/*<15949*/)/*<15946*/)/*<15942*/)/*<17021*/ }/*<15919*/)/*<15919*/ }/*<15919*/)/*<15919*/ } }/*<15911*/;

const run$slrecord = /*17549*/function name_17549(st) { return /*17556*//*17557*/run_$gt/*<17557*//*17556*/(/*17558*//*17559*/$gt$gt$eq/*<17559*//*17558*/(/*17567*/st/*<17567*/)(/*17558*/function name_17558(value) { return /*17558*//*17559*/$gt$gt$eq/*<17559*//*17558*/(/*17569*/$lt_types/*<17569*/)(/*17558*/function name_17558(types) { return /*17592*//*17593*/$lt_/*<17593*//*17592*/(/*17588*//*17589*/$co/*<17589*//*17588*/(/*17590*/value/*<17590*/)(/*17591*/types/*<17591*/)/*<17588*/)/*<17592*/ }/*<17558*/)/*<17558*/ }/*<17558*/)/*<17558*/)(/*17594*/state$slnil/*<17594*/)/*<17556*/ }/*<17549*/;

const instantiate = /*1136*/function name_1136({0: vars, 1: t}) {
 return function name_1136(l) { return /*1211*//*1283*/$gt$gt$eq/*<1283*//*1211*/(/*16930*//*16931*/$lt_/*<16931*//*16930*/(/*16932*//*16933*/set$slto_list/*<16933*//*16932*/(/*16934*/vars/*<16934*/)/*<16932*/)/*<16930*/)(/*1211*/function name_1211(names) { return /*1211*//*1283*/$gt$gt$eq/*<1283*//*1211*/(/*16898*//*16903*/map_$gt/*<16903*//*16898*/(/*16907*/function name_16907(name) { return /*16911*//*16912*/new_type_var/*<16912*//*16911*/(/*16917*/name/*<16917*/)(/*16918*/l/*<16918*/)/*<16911*/ }/*<16907*/)(/*16905*/names/*<16905*/)/*<16898*/)(/*1211*/function name_1211(with_types) { return /*1211*//*1283*/$gt$gt$eq/*<1283*//*1211*/(/*16919*//*16920*/$lt_/*<16920*//*16919*/(/*16921*//*16922*/map$slfrom_list/*<16922*//*16921*/(/*16926*//*16923*/zip/*<16923*//*16926*/(/*16927*/names/*<16927*/)(/*16928*/with_types/*<16928*/)/*<16926*/)/*<16921*/)/*<16919*/)(/*1211*/function name_1211(subst) { return /*16935*//*16936*/$lt_/*<16936*//*16935*/(/*1302*//*1303*/$co/*<1303*//*1302*/(/*1304*//*1305*/type_apply/*<1305*//*1304*/(/*1306*/subst/*<1306*/)(/*1307*/t/*<1307*/)/*<1304*/)(/*3495*/subst/*<3495*/)/*<1302*/)/*<16935*/ }/*<1211*/)/*<1211*/ }/*<1211*/)/*<1211*/ }/*<1211*/)/*<1211*/ } }/*<1136*/;

const infer_stypes = /*14336*/function name_14336(tenv$qu) { return function name_14336(stypes) { return function name_14336(salias) { return /*14343*//*14365*/$gt$gt$eq/*<14365*//*14343*/(/*17215*//*17216*/$lt_/*<17216*//*17215*/(/*14368*//*14369*/foldl/*<14369*//*14368*/(/*14370*//*14371*/map/*<14371*//*14370*/(/*14372*/salias/*<14372*/)(/*14373*/function name_14373({0: name}) { return /*14381*/name/*<14381*/ }/*<14373*/)/*<14370*/)(/*14382*/stypes/*<14382*/)(/*14383*/function name_14383(names) { return function name_14383({0: name}) { return /*14395*//*14395*/cons/*<14395*//*14395*/(/*14393*/name/*<14393*/)(/*14396*/names/*<14396*/)/*<14395*/ } }/*<14383*/)/*<14368*/)/*<17215*/)(/*14343*/function name_14343(names) { return /*14343*//*14365*/$gt$gt$eq/*<14365*//*14343*/(/*17217*//*14545*/$lt_/*<14545*//*17217*/(/*17218*/tenv$qu/*<17218*/)/*<17217*/)(/*14343*/function name_14343({2: types, 3: aliases}) {
 return /*14343*//*14365*/$gt$gt$eq/*<14365*//*14343*/(/*17219*//*17220*/$lt_/*<17220*//*17219*/(/*14571*//*14572*/set$slmerge/*<14572*//*14571*/(/*14573*//*14574*/set$slfrom_list/*<14574*//*14573*/(/*14575*//*14576*/map$slkeys/*<14576*//*14575*/(/*14577*/types/*<14577*/)/*<14575*/)/*<14573*/)(/*14540*//*14541*/set$slmerge/*<14541*//*14540*/(/*14535*//*14536*/set$slfrom_list/*<14536*//*14535*/(/*14537*/names/*<14537*/)/*<14535*/)(/*14561*//*14562*/set$slfrom_list/*<14562*//*14561*/(/*14563*//*14564*/map$slkeys/*<14564*//*14563*/(/*14565*/aliases/*<14565*/)/*<14563*/)/*<14561*/)/*<14540*/)/*<14571*/)/*<17219*/)(/*14343*/function name_14343(bound) { return /*14343*//*14365*/$gt$gt$eq/*<14365*//*14343*/(/*14402*//*14403*/foldl_$gt/*<14403*//*14402*/(/*14404*/tenv$slnil/*<14404*/)(/*14405*/salias/*<14405*/)(/*14406*/function name_14406(tenv) { return function name_14406({0: name, 1: args, 2: body}) {

 return /*14529*/(function match_14529($target) {
if ($target.type === "nil") {
return /*17223*//*17224*/$lt_/*<17224*//*17223*/(/*14417*//*14451*/tenv$sladd_alias/*<14451*//*14417*/(/*14452*/tenv/*<14452*/)(/*14453*/name/*<14453*/)(/*14454*//*14455*/$co/*<14455*//*14454*/(/*14458*//*14456*/map/*<14456*//*14458*/(/*14461*/args/*<14461*/)(/*14462*/fst/*<14462*/)/*<14458*/)(/*14457*/body/*<14457*/)/*<14454*/)/*<14417*/)/*<17223*/
}
{
let names = $target;
return /*14579*//*14580*/$lt_err/*<14580*//*14579*/(/*18540*//*18541*/type_error/*<18541*//*18540*/(/*14581*/"Unbound types"/*<14581*/)(/*14589*//*14588*/map/*<14588*//*14589*/(/*14590*/names/*<14590*/)(/*14591*/function name_14591({0: name, 2: l}) {
 return /*18543*//*14599*/$co/*<14599*//*18543*/(/*18544*/name/*<18544*/)(/*18545*/l/*<18545*/)/*<18543*/ }/*<14591*/)/*<14589*/)/*<18540*/)/*<14579*/
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 14529');})(/*!*//*14566*//*14567*/bag$slto_list/*<14567*//*14566*/(/*14533*//*14553*/externals_type/*<14553*//*14533*/(/*14556*//*14554*/set$slmerge/*<14554*//*14556*/(/*14557*/bound/*<14557*/)(/*14558*//*14559*/set$slfrom_list/*<14559*//*14558*/(/*14568*//*14560*/map/*<14560*//*14568*/(/*14569*/args/*<14569*/)(/*14570*/fst/*<14570*/)/*<14568*/)/*<14558*/)/*<14556*/)(/*14555*/body/*<14555*/)/*<14533*/)/*<14566*/)/*<14529*/ } }/*<14406*/)/*<14402*/)(/*14343*/function name_14343(tenv) { return /*14343*//*14365*/$gt$gt$eq/*<14365*//*14343*/(/*17225*//*17226*/$lt_/*<17226*//*17225*/(/*15053*//*15054*/tenv$slmerge/*<15054*//*15053*/(/*15055*/tenv/*<15055*/)(/*15056*/tenv$qu/*<15056*/)/*<15053*/)/*<17225*/)(/*14343*/function name_14343(merged) { return /*14343*//*14365*/$gt$gt$eq/*<14365*//*14343*/(/*14921*//*14922*/foldl_$gt/*<14922*//*14921*/(/*14923*/tenv/*<14923*/)(/*14924*/stypes/*<14924*/)(/*14925*/function name_14925(tenv) { return function name_14925({0: name, 1: tnl, 2: args, 3: constructors, 4: l}) {



 return /*17261*//*17262*/$gt$gt$eq/*<17262*//*17261*/(/*17267*//*17268*/infer_deftype/*<17268*//*17267*/(/*17269*/merged/*<17269*/)(/*17270*/bound/*<17270*/)(/*17271*/name/*<17271*/)(/*17272*/tnl/*<17272*/)(/*17273*/args/*<17273*/)(/*17274*/constructors/*<17274*/)(/*17275*/l/*<17275*/)/*<17267*/)(/*17261*/function name_17261(tenv$qu) { return /*17276*//*17277*/$lt_/*<17277*//*17276*/(/*15057*//*15058*/tenv$slmerge/*<15058*//*15057*/(/*14938*/tenv$qu/*<14938*/)(/*15060*/tenv/*<15060*/)/*<15057*/)/*<17276*/ }/*<17261*/)/*<17261*/ } }/*<14925*/)/*<14921*/)(/*14343*/function name_14343(tenv) { return /*14343*//*14365*/$gt$gt$eq/*<14365*//*14343*/(/*17278*//*17279*/$lt_/*<17279*//*17278*/(/*14698*//*14699*/tenv$slmerge/*<14699*//*14698*/(/*14700*/tenv/*<14700*/)(/*14701*/tenv$qu/*<14701*/)/*<14698*/)/*<17278*/)(/*14343*/function name_14343(tenv$qu) { return /*17248*//*14400*/$lt_/*<14400*//*17248*/(/*17249*/tenv/*<17249*/)/*<17248*/ }/*<14343*/)/*<14343*/ }/*<14343*/)/*<14343*/ }/*<14343*/)/*<14343*/ }/*<14343*/)/*<14343*/ }/*<14343*/)/*<14343*/ }/*<14343*/)/*<14343*/ }/*<14343*/)/*<14343*/ } } }/*<14336*/;

const t_pat_inner = /*2466*/function name_2466(tenv) { return function name_2466(pat) { return /*2475*/(function match_2475($target) {
if ($target.type === "pany") {
{
let nl = $target[0];
return /*6412*//*6413*/$gt$gt$eq/*<6413*//*6412*/(/*6405*//*6408*/new_type_var/*<6408*//*6405*/(/*6409*/"any"/*<6409*/)(/*10938*/nl/*<10938*/)/*<6405*/)(/*6412*/function name_6412($var) { return /*16991*//*16992*/$lt_/*<16992*//*16991*/(/*6420*//*6421*/$co/*<6421*//*6420*/(/*6422*/$var/*<6422*/)(/*6423*/map$slnil/*<6423*/)/*<6420*/)/*<16991*/ }/*<6412*/)/*<6412*/
}
}
if ($target.type === "pvar") {
{
let name = $target[0];
{
let nl = $target[1];
return /*3450*//*3451*/$gt$gt$eq/*<3451*//*3450*/(/*2482*//*3403*/new_type_var/*<3403*//*2482*/(/*3404*/name/*<3404*/)(/*10939*/nl/*<10939*/)/*<2482*/)(/*3450*/function name_3450($var) { return /*16993*//*16994*/$lt_/*<16994*//*16993*/(/*3459*//*3460*/$co/*<3460*//*3459*/(/*3461*/$var/*<3461*/)(/*3464*//*3465*/map$slset/*<3465*//*3464*/(/*3466*/map$slnil/*<3466*/)(/*3467*/name/*<3467*/)(/*3469*/$var/*<3469*/)/*<3464*/)/*<3459*/)/*<16993*/ }/*<3450*/)/*<3450*/
}
}
}
if ($target.type === "pstr") {
{
let nl = $target[1];
return /*16997*//*16998*/$lt_/*<16998*//*16997*/(/*3407*//*3412*/$co/*<3412*//*3407*/(/*3413*//*3414*/tcon/*<3414*//*3413*/(/*3415*/"string"/*<3415*/)(/*3417*/nl/*<3417*/)/*<3413*/)(/*3472*/map$slnil/*<3472*/)/*<3407*/)/*<16997*/
}
}
if ($target.type === "pprim") {
if ($target[0].type === "pbool") {
{
let l = $target[1];
return /*16999*//*17000*/$lt_/*<17000*//*16999*/(/*3426*//*3427*/$co/*<3427*//*3426*/(/*3428*//*3429*/tcon/*<3429*//*3428*/(/*3430*/"bool"/*<3430*/)(/*3432*/l/*<3432*/)/*<3428*/)(/*3473*/map$slnil/*<3473*/)/*<3426*/)/*<16999*/
}
}
}
if ($target.type === "pprim") {
if ($target[0].type === "pint") {
{
let l = $target[1];
return /*17001*//*17002*/$lt_/*<17002*//*17001*/(/*3441*//*3442*/$co/*<3442*//*3441*/(/*3443*//*3444*/tcon/*<3444*//*3443*/(/*3445*/"int"/*<3445*/)(/*3447*/l/*<3447*/)/*<3443*/)(/*3474*/map$slnil/*<3474*/)/*<3441*/)/*<17001*/
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
return /*3479*//*3480*/$gt$gt$eq/*<3480*//*3479*/(/*3661*/(function match_3661($target) {
if ($target.type === "none") {
return /*3665*//*3666*/$lt_err/*<3666*//*3665*/(/*18518*//*18519*/type_error/*<18519*//*18518*/(/*3668*/"Unknown constructor"/*<3668*/)(/*18520*//*18520*/cons/*<18520*//*18520*/(/*18521*//*18522*/$co/*<18522*//*18521*/(/*18523*/name/*<18523*/)(/*18524*/l/*<18524*/)/*<18521*/)(/*18520*/nil/*<18520*/)/*<18520*/)/*<18518*/)/*<3665*/
}
if ($target.type === "some") {
{
let v = $target[0];
return /*17003*//*3750*/$lt_/*<3750*//*17003*/(/*17004*/v/*<17004*/)/*<17003*/
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 3661');})(/*!*//*3488*//*3489*/tenv$slcon/*<3489*//*3488*/(/*3490*/tenv/*<3490*/)(/*3491*/name/*<3491*/)/*<3488*/)/*<3661*/)(/*3479*/function name_3479({0: free, 1: cargs, 2: cres}) {

 return /*3479*//*3480*/$gt$gt$eq/*<3480*//*3479*/(/*3502*//*3503*/instantiate/*<3503*//*3502*/(/*3504*//*3505*/scheme/*<3505*//*3504*/(/*3506*/free/*<3506*/)(/*3507*/cres/*<3507*/)/*<3504*/)(/*10941*/l/*<10941*/)/*<3502*/)(/*3479*/function name_3479({0: tres, 1: tsubst}) {
 return /*3479*//*3480*/$gt$gt$eq/*<3480*//*3479*/(/*17005*//*17006*/$lt_/*<17006*//*17005*/(/*12912*//*12913*/type$slset_loc/*<12913*//*12912*/(/*12914*/l/*<12914*/)(/*12915*/tres/*<12915*/)/*<12912*/)/*<17005*/)(/*3479*/function name_3479(tres) { return /*3479*//*3480*/$gt$gt$eq/*<3480*//*3479*/(/*17007*//*17008*/$lt_/*<17008*//*17007*/(/*3509*//*3510*/map/*<3510*//*3509*/(/*3511*/cargs/*<3511*/)(/*3512*//*3513*/type_apply/*<3513*//*3512*/(/*3514*/tsubst/*<3514*/)/*<3512*/)/*<3509*/)/*<17007*/)(/*3479*/function name_3479(cargs) { return /*3479*//*3480*/$gt$gt$eq/*<3480*//*3479*/(/*17009*//*17010*/$lt_/*<17010*//*17009*/(/*3581*//*3582*/zip/*<3582*//*3581*/(/*3583*/args/*<3583*/)(/*3584*/cargs/*<3584*/)/*<3581*/)/*<17009*/)(/*3479*/function name_3479(zipped) { return /*3479*//*3480*/$gt$gt$eq/*<3480*//*3479*/(/*10323*/(function match_10323($target) {
if ($target === true) {
return /*10335*//*10336*/$lt_err/*<10336*//*10335*/(/*18511*//*18512*/type_error/*<18512*//*18511*/(/*10337*/`Wrong number of arguments to constructor: given ${/*10511*//*10512*/its/*<10512*//*10511*/(/*10343*//*10345*/len/*<10345*//*10343*/(/*10346*/args/*<10346*/)/*<10343*/)/*<10511*/}, but the type constructor has ${/*10514*//*10515*/its/*<10515*//*10514*/(/*10347*//*10349*/len/*<10349*//*10347*/(/*10350*/cargs/*<10350*/)/*<10347*/)/*<10514*/}`/*<10337*/)(/*18513*//*18513*/cons/*<18513*//*18513*/(/*18514*//*18515*/$co/*<18515*//*18514*/(/*18516*/name/*<18516*/)(/*18517*/l/*<18517*/)/*<18514*/)(/*18513*/nil/*<18513*/)/*<18513*/)/*<18511*/)/*<10335*/
}
return /*10351*//*17011*/$lt_/*<17011*//*10351*/(/*17012*/0/*<17012*/)/*<10351*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 10323');})(/*!*//*10325*//*10326*/$ex$eq/*<10326*//*10325*/(/*10327*//*10328*/len/*<10328*//*10327*/(/*10329*/args/*<10329*/)/*<10327*/)(/*10330*//*10333*/len/*<10333*//*10330*/(/*10334*/cargs/*<10334*/)/*<10330*/)/*<10325*/)/*<10323*/)(/*3479*/function name_3479(_) { return /*3479*//*3480*/$gt$gt$eq/*<3480*//*3479*/(/*3590*//*3591*/foldl_$gt/*<3591*//*3590*/(/*3592*//*3593*/$co/*<3593*//*3592*/(/*3595*/map$slnil/*<3595*/)(/*3596*/map$slnil/*<3596*/)/*<3592*/)(/*3598*/zipped/*<3598*/)(/*3599*/function name_3599({0: subst, 1: bindings}) {
 return function name_3599({0: arg, 1: carg}) {
 return /*3611*//*3612*/$gt$gt$eq/*<3612*//*3611*/(/*3622*//*3623*/t_pat/*<3623*//*3622*/(/*3625*/tenv/*<3625*/)(/*3626*/arg/*<3626*/)/*<3622*/)(/*3611*/function name_3611({0: pat_type, 1: pat_bind}) {
 return /*3611*//*3612*/$gt$gt$eq/*<3612*//*3611*/(/*3637*//*3638*/unify_inner/*<3638*//*3637*/(/*12539*//*3639*/type_apply/*<3639*//*12539*/(/*12540*/subst/*<12540*/)(/*12541*/pat_type/*<12541*/)/*<12539*/)(/*12902*//*3640*/type_apply/*<3640*//*12902*/(/*12903*/subst/*<12903*/)(/*12916*//*12904*/type$slset_loc/*<12904*//*12916*/(/*12917*/l/*<12917*/)(/*12918*/carg/*<12918*/)/*<12916*/)/*<12902*/)(/*11562*/l/*<11562*/)/*<3637*/)(/*3611*/function name_3611(unified_subst) { return /*17013*//*17014*/$lt_/*<17014*//*17013*/(/*3616*//*3629*/$co/*<3629*//*3616*/(/*3630*//*3631*/compose_subst/*<3631*//*3630*/(/*12256*/"t-pat"/*<12256*/)(/*3632*/unified_subst/*<3632*/)(/*3641*/subst/*<3641*/)/*<3630*/)(/*3642*//*3778*/map$slmerge/*<3778*//*3642*/(/*3779*/bindings/*<3779*/)(/*3780*/pat_bind/*<3780*/)/*<3642*/)/*<3616*/)/*<17013*/ }/*<3611*/)/*<3611*/ }/*<3611*/)/*<3611*/ } }/*<3599*/)/*<3590*/)(/*3479*/function name_3479({0: subst, 1: bindings}) {
 return /*17015*//*17016*/$lt_/*<17016*//*17015*/(/*3492*//*3493*/$co/*<3493*//*3492*/(/*3494*//*3645*/type_apply/*<3645*//*3494*/(/*3646*/subst/*<3646*/)(/*3647*/tres/*<3647*/)/*<3494*/)(/*3781*//*3782*/map$slmap/*<3782*//*3781*/(/*3783*//*3784*/type_apply/*<3784*//*3783*/(/*3785*/subst/*<3785*/)/*<3783*/)(/*3851*/bindings/*<3851*/)/*<3781*/)/*<3492*/)/*<17015*/ }/*<3479*/)/*<3479*/ }/*<3479*/)/*<3479*/ }/*<3479*/)/*<3479*/ }/*<3479*/)/*<3479*/ }/*<3479*/)/*<3479*/ }/*<3479*/)/*<3479*/ }/*<3479*/)/*<3479*/
}
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 2475');})(/*!*//*2477*/pat/*<2477*/)/*<2475*/ } }/*<2466*/;


const t_pat = /*13122*/function name_13122(tenv) { return function name_13122(pat) { return /*17595*//*17596*/$gt$gt$eq/*<17596*//*17595*/(/*13190*//*13191*/t_pat_inner/*<13191*//*13190*/(/*13192*/tenv/*<13192*/)(/*13193*/pat/*<13193*/)/*<13190*/)(/*17595*/function name_17595({0: t, 1: subst}) {
 return /*17595*//*17596*/$gt$gt$eq/*<17596*//*17595*/(/*17610*//*17611*/record_$gt/*<17611*//*17610*/(/*17612*//*17613*/pat_loc/*<17613*//*17612*/(/*17614*/pat/*<17614*/)/*<17612*/)(/*17615*/t/*<17615*/)/*<17610*/)(/*17595*/function name_17595(_) { return /*17603*//*17604*/$lt_/*<17604*//*17603*/(/*17605*//*17606*/$co/*<17606*//*17605*/(/*17607*/t/*<17607*/)(/*17608*/subst/*<17608*/)/*<17605*/)/*<17603*/ }/*<17595*/)/*<17595*/ }/*<17595*/)/*<17595*/ } }/*<13122*/;

const t_expr_inner = /*1654*/function name_1654(tenv) { return function name_1654(expr) { return /*1664*/(function match_1664($target) {
if ($target.type === "evar") {
if ($target[0] === "()"){
{
let l = $target[1];
return /*16729*//*16730*/$lt_/*<16730*//*16729*/(/*11036*//*11037*/$co/*<11037*//*11036*/(/*11038*/map$slnil/*<11038*/)(/*11039*//*11040*/tcon/*<11040*//*11039*/(/*11041*/"()"/*<11041*/)(/*11043*/l/*<11043*/)/*<11039*/)/*<11036*/)/*<16729*/
}
}
}
if ($target.type === "evar") {
{
let name = $target[0];
{
let l = $target[1];
return /*1671*/(function match_1671($target) {
if ($target.type === "none") {
return /*1680*//*1681*/$lt_err/*<1681*//*1680*/(/*18500*//*18501*/type_error/*<18501*//*18500*/(/*1682*/"Unbound variable"/*<1682*/)(/*18502*//*18502*/cons/*<18502*//*18502*/(/*18503*//*18504*/$co/*<18504*//*18503*/(/*18506*/name/*<18506*/)(/*18507*/l/*<18507*/)/*<18503*/)(/*18502*/nil/*<18502*/)/*<18502*/)/*<18500*/)/*<1680*/
}
if ($target.type === "some") {
{
let found = $target[0];
return /*1690*//*1691*/$gt$gt$eq/*<1691*//*1690*/(/*1697*//*1698*/instantiate/*<1698*//*1697*/(/*1699*/found/*<1699*/)(/*10940*/l/*<10940*/)/*<1697*/)(/*1690*/function name_1690({0: t}) { return /*16731*//*16732*/$lt_/*<16732*//*16731*/(/*1701*//*1702*/$co/*<1702*//*1701*/(/*1704*/map$slnil/*<1704*/)(/*12908*//*1705*/type$slset_loc/*<1705*//*12908*/(/*12909*/l/*<12909*/)(/*12910*/t/*<12910*/)/*<12908*/)/*<1701*/)/*<16731*/ }/*<1690*/)/*<1690*/
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 1671');})(/*!*//*1673*//*1674*/tenv$sltype/*<1674*//*1673*/(/*1675*/tenv/*<1675*/)(/*1676*/name/*<1676*/)/*<1673*/)/*<1671*/
}
}
}
if ($target.type === "equot") {
{
let quot = $target[0];
{
let l = $target[1];
return /*16733*//*16734*/$lt_/*<16734*//*16733*/(/*5832*//*5833*/$co/*<5833*//*5832*/(/*5835*/map$slnil/*<5835*/)(/*5823*//*5828*/tcon/*<5828*//*5823*/(/*17822*/(function match_17822($target) {
if ($target.type === "quot/expr") {
return /*5829*/"expr"/*<5829*/
}
if ($target.type === "quot/stmt") {
return /*17831*/"stmt"/*<17831*/
}
if ($target.type === "quot/quot") {
return /*17836*/"cst"/*<17836*/
}
if ($target.type === "quot/type") {
return /*17841*/"type"/*<17841*/
}
if ($target.type === "quot/pat") {
return /*17846*/"pat"/*<17846*/
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 17822');})(/*!*//*17824*/quot/*<17824*/)/*<17822*/)(/*5831*/l/*<5831*/)/*<5823*/)/*<5832*/)/*<16733*/
}
}
}
if ($target.type === "eprim") {
{
let prim = $target[0];
return /*16745*//*16746*/$lt_/*<16746*//*16745*/(/*1710*//*1711*/$co/*<1711*//*1710*/(/*1723*/map$slnil/*<1723*/)(/*1712*//*1713*/t_prim/*<1713*//*1712*/(/*1714*/prim/*<1714*/)/*<1712*/)/*<1710*/)/*<16745*/
}
}
if ($target.type === "estr") {
{
let first = $target[0];
{
let templates = $target[1];
{
let l = $target[2];
return /*6800*//*6801*/$gt$gt$eq/*<6801*//*6800*/(/*16749*//*16750*/$lt_/*<16750*//*16749*/(/*6864*//*6865*/tcon/*<6865*//*6864*/(/*6866*/"string"/*<6866*/)(/*6868*/l/*<6868*/)/*<6864*/)/*<16749*/)(/*6800*/function name_6800(string_type) { return /*6800*//*6801*/$gt$gt$eq/*<6801*//*6800*/(/*6804*//*6805*/foldr_$gt/*<6805*//*6804*/(/*6806*/map$slnil/*<6806*/)(/*6810*/templates/*<6810*/)(/*6811*/function name_6811(subst) { return function name_6811({0: expr, 1: suffix, 2: sl}) {

 return /*6827*//*6828*/$gt$gt$eq/*<6828*//*6827*/(/*6831*//*6832*/t_expr/*<6832*//*6831*/(/*6833*/tenv/*<6833*/)(/*6834*/expr/*<6834*/)/*<6831*/)(/*6827*/function name_6827({0: s2, 1: t}) {
 return /*6827*//*6828*/$gt$gt$eq/*<6828*//*6827*/(/*6844*//*6845*/unify_inner/*<6845*//*6844*/(/*6846*/t/*<6846*/)(/*6847*/string_type/*<6847*/)(/*11556*/l/*<11556*/)/*<6844*/)(/*6827*/function name_6827(s3) { return /*16868*//*16869*/$lt_/*<16869*//*16868*/(/*6854*//*6855*/compose_subst/*<6855*//*6854*/(/*12224*/"estr"/*<12224*/)(/*6856*/s3/*<6856*/)(/*6857*//*6858*/compose_subst/*<6858*//*6857*/(/*12226*/"estr2"/*<12226*/)(/*6859*/s2/*<6859*/)(/*6860*/subst/*<6860*/)/*<6857*/)/*<6854*/)/*<16868*/ }/*<6827*/)/*<6827*/ }/*<6827*/)/*<6827*/ } }/*<6811*/)/*<6804*/)(/*6800*/function name_6800(subst) { return /*16747*//*16748*/$lt_/*<16748*//*16747*/(/*6862*//*6872*/$co/*<6872*//*6862*/(/*6873*/subst/*<6873*/)(/*6874*/string_type/*<6874*/)/*<6862*/)/*<16747*/ }/*<6800*/)/*<6800*/ }/*<6800*/)/*<6800*/
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
return /*17795*/(function match_17795($target) {
if ($target.type === "cons") {
{
let pat = $target[0];
if ($target[1].type === "nil") {
return /*16248*//*16249*/$gt$gt$eq/*<16249*//*16248*/(/*16255*//*16256*/new_type_var/*<16256*//*16255*/(/*16257*/(function match_16257($target) {
if ($target.type === "pvar") {
{
let name = $target[0];
return /*16315*/name/*<16315*/
}
}
return /*16317*/"\$arg"/*<16317*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 16257');})(/*!*//*16310*/pat/*<16310*/)/*<16257*/)(/*16259*/l/*<16259*/)/*<16255*/)(/*16248*/function name_16248(arg_type) { return /*16248*//*16249*/$gt$gt$eq/*<16249*//*16248*/(/*16297*//*16298*/pat_and_body/*<16298*//*16297*/(/*16299*/tenv/*<16299*/)(/*16300*/pat/*<16300*/)(/*16301*/body/*<16301*/)(/*16323*//*16302*/$co/*<16302*//*16323*/(/*16324*/map$slnil/*<16324*/)(/*16325*/arg_type/*<16325*/)/*<16323*/)(/*16409*/true/*<16409*/)/*<16297*/)(/*16248*/function name_16248({0: subst, 1: body}) {
 return /*16248*//*16249*/$gt$gt$eq/*<16249*//*16248*/(/*16870*//*16871*/$lt_/*<16871*//*16870*/(/*16389*//*16390*/type_apply/*<16390*//*16389*/(/*16392*/subst/*<16392*/)(/*16393*/arg_type/*<16393*/)/*<16389*/)/*<16870*/)(/*16248*/function name_16248(arg_type) { return /*16952*//*16953*/$lt_/*<16953*//*16952*/(/*16279*//*16280*/$co/*<16280*//*16279*/(/*16281*/subst/*<16281*/)(/*16282*//*16283*/tfn/*<16283*//*16282*/(/*16284*/arg_type/*<16284*/)(/*16288*/body/*<16288*/)(/*16289*/l/*<16289*/)/*<16282*/)/*<16279*/)/*<16952*/ }/*<16248*/)/*<16248*/ }/*<16248*/)/*<16248*/ }/*<16248*/)/*<16248*/
}
}
}
return /*17801*//*17802*/t_expr/*<17802*//*17801*/(/*17806*/tenv/*<17806*/)(/*17807*//*17808*/foldr/*<17808*//*17807*/(/*17809*/body/*<17809*/)(/*17810*/pats/*<17810*/)(/*17811*/function name_17811(body) { return function name_17811(pat) { return /*17816*//*17817*/elambda/*<17817*//*17816*/(/*17821*//*17821*/cons/*<17821*//*17821*/(/*17818*/pat/*<17818*/)(/*17821*/nil/*<17821*/)/*<17821*/)(/*17819*/body/*<17819*/)(/*17820*/l/*<17820*/)/*<17816*/ } }/*<17811*/)/*<17807*/)/*<17801*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 17795');})(/*!*//*17797*/pats/*<17797*/)/*<17795*/
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
return /*17768*/(function match_17768($target) {
if ($target.type === "cons") {
{
let arg = $target[0];
if ($target[1].type === "nil") {
return /*1816*//*1817*/$gt$gt$eq/*<1817*//*1816*/(/*1823*//*1824*/new_type_var/*<1824*//*1823*/(/*1825*/"res"/*<1825*/)(/*10943*/l/*<10943*/)/*<1823*/)(/*1816*/function name_1816(result_var) { return /*1816*//*1817*/$gt$gt$eq/*<1817*//*1816*/(/*1833*//*1834*/t_expr/*<1834*//*1833*/(/*1835*/tenv/*<1835*/)(/*1836*/target/*<1836*/)/*<1833*/)(/*1816*/function name_1816({0: target_subst, 1: target_type}) {
 return /*1816*//*1817*/$gt$gt$eq/*<1817*//*1816*/(/*1842*//*1843*/t_expr/*<1843*//*1842*/(/*1844*//*1845*/tenv_apply/*<1845*//*1844*/(/*1846*/target_subst/*<1846*/)(/*1847*/tenv/*<1847*/)/*<1844*/)(/*1848*/arg/*<1848*/)/*<1842*/)(/*1816*/function name_1816({0: arg_subst, 1: arg_type}) {
 return /*1816*//*1817*/$gt$gt$eq/*<1817*//*1816*/(/*1855*//*1856*/unify_inner/*<1856*//*1855*/(/*1857*//*1858*/type_apply/*<1858*//*1857*/(/*1859*/arg_subst/*<1859*/)(/*1860*/target_type/*<1860*/)/*<1857*/)(/*1861*//*1890*/tfn/*<1890*//*1861*/(/*1891*/arg_type/*<1891*/)(/*1892*/result_var/*<1892*/)(/*1893*/l/*<1893*/)/*<1861*/)(/*11557*/l/*<11557*/)/*<1855*/)(/*1816*/function name_1816(unified_subst) { return /*16954*//*16955*/$lt_/*<16955*//*16954*/(/*1889*//*1896*/$co/*<1896*//*1889*/(/*1897*//*1898*/compose_subst/*<1898*//*1897*/(/*12228*/"eapp"/*<12228*/)(/*1899*/unified_subst/*<1899*/)(/*1900*//*1901*/compose_subst/*<1901*//*1900*/(/*12230*/"eapp2"/*<12230*/)(/*1902*/arg_subst/*<1902*/)(/*1903*/target_subst/*<1903*/)/*<1900*/)/*<1897*/)(/*1905*//*1906*/type_apply/*<1906*//*1905*/(/*1907*/unified_subst/*<1907*/)(/*1908*/result_var/*<1908*/)/*<1905*/)/*<1889*/)/*<16954*/ }/*<1816*/)/*<1816*/ }/*<1816*/)/*<1816*/ }/*<1816*/)/*<1816*/ }/*<1816*/)/*<1816*/
}
}
}
return /*17774*//*17775*/t_expr/*<17775*//*17774*/(/*17794*/tenv/*<17794*/)(/*17777*//*17778*/foldl/*<17778*//*17777*/(/*17779*/target/*<17779*/)(/*17780*/args/*<17780*/)(/*17781*/function name_17781(target) { return function name_17781(arg) { return /*17786*//*17787*/eapp/*<17787*//*17786*/(/*17788*/target/*<17788*/)(/*17789*//*17789*/cons/*<17789*//*17789*/(/*17792*/arg/*<17792*/)(/*17789*/nil/*<17789*/)/*<17789*/)(/*17793*/l/*<17793*/)/*<17786*/ } }/*<17781*/)/*<17777*/)/*<17774*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 17768');})(/*!*//*17770*/args/*<17770*/)/*<17768*/
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
return /*17732*/(function match_17732($target) {
if ($target.type === "cons") {
if ($target[0].type === ",") {
{
let pat = $target[0][0];
{
let init = $target[0][1];
if ($target[1].type === "nil") {
return /*16960*//*16961*/$gt$gt$eq/*<16961*//*16960*/(/*16965*//*16966*/t_expr/*<16966*//*16965*/(/*16967*/tenv/*<16967*/)(/*16968*/init/*<16968*/)/*<16965*/)(/*16960*/function name_16960(inited) { return /*2368*//*4403*/pat_and_body/*<4403*//*2368*/(/*4413*/tenv/*<4413*/)(/*4404*/pat/*<4404*/)(/*4405*/body/*<4405*/)(/*4406*/inited/*<4406*/)(/*16411*/false/*<16411*/)/*<2368*/ }/*<16960*/)/*<16960*/
}
}
}
}
}
return /*17740*//*17741*/t_expr/*<17741*//*17740*/(/*17742*/tenv/*<17742*/)(/*17743*//*17747*/foldr/*<17747*//*17743*/(/*17748*/body/*<17748*/)(/*17749*/bindings/*<17749*/)(/*17750*/function name_17750(body) { return function name_17750({0: pat, 1: init}) {
 return /*17759*//*17760*/elet/*<17760*//*17759*/(/*17761*//*17761*/cons/*<17761*//*17761*/(/*17762*//*17763*/$co/*<17763*//*17762*/(/*17764*/pat/*<17764*/)(/*17765*/init/*<17765*/)/*<17762*/)(/*17761*/nil/*<17761*/)/*<17761*/)(/*17766*/body/*<17766*/)(/*17767*/l/*<17767*/)/*<17759*/ } }/*<17750*/)/*<17743*/)/*<17740*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 17732');})(/*!*//*17725*/bindings/*<17725*/)/*<17732*/
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
return /*2252*//*2257*/$gt$gt$eq/*<2257*//*2252*/(/*4432*//*4436*/new_type_var/*<4436*//*4432*/(/*4437*/"match-res"/*<4437*/)(/*10937*/l/*<10937*/)/*<4432*/)(/*2252*/function name_2252(result_var) { return /*2252*//*2257*/$gt$gt$eq/*<2257*//*2252*/(/*2264*//*2265*/t_expr/*<2265*//*2264*/(/*2266*/tenv/*<2266*/)(/*2267*/target/*<2267*/)/*<2264*/)(/*2252*/function name_2252({0: target_subst, 1: target_type}) {
 return /*2252*//*2257*/$gt$gt$eq/*<2257*//*2252*/(/*10177*//*10250*/foldr_$gt/*<10250*//*10177*/(/*10251*//*10252*/$co$co/*<10252*//*10251*/(/*10253*/target_type/*<10253*/)(/*10254*/target_subst/*<10254*/)(/*10255*/result_var/*<10255*/)/*<10251*/)(/*10257*/cases/*<10257*/)(/*10258*/function name_10258({0: target_type, 1: subst, 2: result}) {

 return function name_10258({0: pat, 1: body}) {
 return /*10271*//*10272*/$gt$gt$eq/*<10272*//*10271*/(/*10280*//*10281*/pat_and_body/*<10281*//*10280*/(/*10282*/tenv/*<10282*/)(/*10283*/pat/*<10283*/)(/*10284*/body/*<10284*/)(/*10285*//*10286*/$co/*<10286*//*10285*/(/*10287*/subst/*<10287*/)(/*10288*/target_type/*<10288*/)/*<10285*/)(/*16410*/false/*<16410*/)/*<10280*/)(/*10271*/function name_10271({0: subst, 1: body}) {
 return /*10271*//*10272*/$gt$gt$eq/*<10272*//*10271*/(/*10294*//*10295*/unify_inner/*<10295*//*10294*/(/*12533*//*10296*/type_apply/*<10296*//*12533*/(/*12534*/subst/*<12534*/)(/*12535*/result/*<12535*/)/*<12533*/)(/*10297*/body/*<10297*/)(/*11558*/l/*<11558*/)/*<10294*/)(/*10271*/function name_10271(unified_subst) { return /*10271*//*10272*/$gt$gt$eq/*<10272*//*10271*/(/*16956*//*16957*/$lt_/*<16957*//*16956*/(/*11288*//*11289*/compose_subst/*<11289*//*11288*/(/*12232*/"ematch"/*<12232*/)(/*11291*/unified_subst/*<11291*/)(/*12201*/subst/*<12201*/)/*<11288*/)/*<16956*/)(/*10271*/function name_10271(composed) { return /*16958*//*16959*/$lt_/*<16959*//*16958*/(/*10299*//*10300*/$co$co/*<10300*//*10299*/(/*10301*//*10302*/type_apply/*<10302*//*10301*/(/*10303*/composed/*<10303*/)(/*10307*/target_type/*<10307*/)/*<10301*/)(/*10308*/composed/*<10308*/)(/*10312*//*10313*/type_apply/*<10313*//*10312*/(/*11284*/composed/*<11284*/)(/*10315*/result/*<10315*/)/*<10312*/)/*<10299*/)/*<16958*/ }/*<10271*/)/*<10271*/ }/*<10271*/)/*<10271*/ }/*<10271*/)/*<10271*/ } }/*<10258*/)/*<10177*/)(/*2252*/function name_2252({1: target_subst, 2: result_type}) {
 return /*16970*//*16971*/$lt_/*<16971*//*16970*/(/*2283*//*10317*/$co/*<10317*//*2283*/(/*10318*/target_subst/*<10318*/)(/*10319*/result_type/*<10319*/)/*<2283*/)/*<16970*/ }/*<2252*/)/*<2252*/ }/*<2252*/)/*<2252*/ }/*<2252*/)/*<2252*/
}
}
}
}
return /*2064*//*2065*/$lt_err/*<2065*//*2064*/(/*18508*//*18509*/type_error/*<18509*//*18508*/(/*2066*/`cannot infer type for ${/*2247*//*2249*/valueToString/*<2249*//*2247*/(/*2250*/expr/*<2250*/)/*<2247*/}`/*<2066*/)(/*18510*/nil/*<18510*/)/*<18508*/)/*<2064*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 1664');})(/*!*//*1666*/expr/*<1666*/)/*<1664*/ } }/*<1654*/;


const t_expr = /*13016*/function name_13016(tenv) { return function name_13016(expr) { return /*16724*//*16725*/$gt$gt$eq/*<16725*//*16724*/(/*13117*//*13118*/t_expr_inner/*<13118*//*13117*/(/*13119*/tenv/*<13119*/)(/*13120*/expr/*<13120*/)/*<13117*/)(/*16724*/function name_16724({0: subst, 1: type}) {
 return /*16724*//*16725*/$gt$gt$eq/*<16725*//*16724*/(/*17527*//*17528*/record_$gt/*<17528*//*17527*/(/*17529*//*17530*/expr_loc/*<17530*//*17529*/(/*17531*/expr/*<17531*/)/*<17529*/)(/*17532*/type/*<17532*/)/*<17527*/)(/*16724*/function name_16724(_) { return /*17533*//*17534*/$lt_/*<17534*//*17533*/(/*17535*//*17536*/$co/*<17536*//*17535*/(/*17537*/subst/*<17537*/)(/*17538*/type/*<17538*/)/*<17535*/)/*<17533*/ }/*<16724*/)/*<16724*/ }/*<16724*/)/*<16724*/ } }/*<13016*/;


const pat_and_body = /*4282*/function name_4282(tenv) { return function name_4282(pat) { return function name_4282(body) { return function name_4282({0: value_subst, 1: value_type}) {
 return function name_4282(monomorphic) { return /*4289*//*4290*/$gt$gt$eq/*<4290*//*4289*/(/*4308*//*4309*/t_pat/*<4309*//*4308*/(/*4310*/tenv/*<4310*/)(/*4311*/pat/*<4311*/)/*<4308*/)(/*4289*/function name_4289({0: pat_type, 1: bindings}) {
 return /*4289*//*4290*/$gt$gt$eq/*<4290*//*4289*/(/*4317*//*4318*/unify_inner/*<4318*//*4317*/(/*4319*/value_type/*<4319*/)(/*4320*/pat_type/*<4320*/)(/*11559*//*11560*/pat_loc/*<11560*//*11559*/(/*11561*/pat/*<11561*/)/*<11559*/)/*<4317*/)(/*4289*/function name_4289(unified_subst) { return /*4289*//*4290*/$gt$gt$eq/*<4290*//*4289*/(/*16972*//*16973*/$lt_/*<16973*//*16972*/(/*12174*//*12175*/compose_subst/*<12175*//*12174*/(/*12234*/"pat-and-body"/*<12234*/)(/*12176*/unified_subst/*<12176*/)(/*12177*/value_subst/*<12177*/)/*<12174*/)/*<16972*/)(/*4289*/function name_4289(composed) { return /*4289*//*4290*/$gt$gt$eq/*<4290*//*4289*/(/*16974*//*16975*/$lt_/*<16975*//*16974*/(/*4323*//*4324*/map$slmap/*<4324*//*4323*/(/*4325*//*4326*/type_apply/*<4326*//*4325*/(/*4327*/composed/*<4327*/)/*<4325*/)(/*4331*/bindings/*<4331*/)/*<4323*/)/*<16974*/)(/*4289*/function name_4289(bindings) { return /*4289*//*4290*/$gt$gt$eq/*<4290*//*4289*/(/*16977*//*16978*/$lt_/*<16978*//*16977*/(/*4333*//*4334*/map$slmap/*<4334*//*4333*/(/*16407*/(function match_16407($target) {
if ($target === true) {
return /*16399*//*16400*/scheme/*<16400*//*16399*/(/*16402*/set$slnil/*<16402*/)/*<16399*/
}
return /*4335*//*4336*/generalize/*<4336*//*4335*/(/*4337*//*4338*/tenv_apply/*<4338*//*4337*/(/*4339*/composed/*<4339*/)(/*4343*/tenv/*<4343*/)/*<4337*/)/*<4335*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 16407');})(/*!*//*16406*/monomorphic/*<16406*/)/*<16407*/)(/*4344*/bindings/*<4344*/)/*<4333*/)/*<16977*/)(/*4289*/function name_4289(schemes) { return /*4289*//*4290*/$gt$gt$eq/*<4290*//*4289*/(/*16979*//*16980*/$lt_/*<16980*//*16979*/(/*4346*//*4347*/foldr/*<4347*//*4346*/(/*4348*//*4349*/tenv_apply/*<4349*//*4348*/(/*4350*/value_subst/*<4350*/)(/*4351*/tenv/*<4351*/)/*<4348*/)(/*4352*//*4353*/map$slto_list/*<4353*//*4352*/(/*4354*/schemes/*<4354*/)/*<4352*/)(/*4355*/function name_4355(tenv) { return function name_4355({0: name, 1: scheme}) {
 return /*4363*//*4364*/tenv$slset_type/*<4364*//*4363*/(/*4365*/tenv/*<4365*/)(/*4366*/name/*<4366*/)(/*4367*/scheme/*<4367*/)/*<4363*/ } }/*<4355*/)/*<4346*/)/*<16979*/)(/*4289*/function name_4289(bound_env) { return /*4289*//*4290*/$gt$gt$eq/*<4290*//*4289*/(/*4373*//*4374*/t_expr/*<4374*//*4373*/(/*4375*//*4376*/tenv_apply/*<4376*//*4375*/(/*4377*/composed/*<4377*/)(/*4381*/bound_env/*<4381*/)/*<4375*/)(/*4382*/body/*<4382*/)/*<4373*/)(/*4289*/function name_4289({0: body_subst, 1: body_type}) {
 return /*16981*//*16982*/$lt_/*<16982*//*16981*/(/*4384*//*4385*/$co/*<4385*//*4384*/(/*4386*//*4387*/compose_subst/*<4387*//*4386*/(/*12236*/"pat-and-body-2"/*<12236*/)(/*4388*/body_subst/*<4388*/)(/*4389*/composed/*<4389*/)/*<4386*/)(/*4393*//*4394*/type_apply/*<4394*//*4393*/(/*4395*/composed/*<4395*/)(/*4396*/body_type/*<4396*/)/*<4393*/)/*<4384*/)/*<16981*/ }/*<4289*/)/*<4289*/ }/*<4289*/)/*<4289*/ }/*<4289*/)/*<4289*/ }/*<4289*/)/*<4289*/ }/*<4289*/)/*<4289*/ }/*<4289*/)/*<4289*/ }/*<4289*/)/*<4289*/ } } } } }/*<4282*/;

const infer = /*1976*/function name_1976(tenv) { return function name_1976(expr) { return /*1984*//*1985*/$gt$gt$eq/*<1985*//*1984*/(/*16003*//*16008*/find_missing/*<16008*//*16003*/(/*16009*/tenv/*<16009*/)(/*16011*//*16012*/externals/*<16012*//*16011*/(/*16013*/set$slnil/*<16013*/)(/*16014*/expr/*<16014*/)/*<16011*/)/*<16003*/)(/*1984*/function name_1984({0: tenv, 1: missing}) {
 return /*1984*//*1985*/$gt$gt$eq/*<1985*//*1984*/(/*1992*//*1993*/t_expr/*<1993*//*1992*/(/*1994*/tenv/*<1994*/)(/*1995*/expr/*<1995*/)/*<1992*/)(/*1984*/function name_1984({0: subst, 1: type}) {
 return /*1984*//*1985*/$gt$gt$eq/*<1985*//*1984*/(/*16016*//*16017*/report_missing/*<16017*//*16016*/(/*16018*/subst/*<16018*/)(/*16019*/missing/*<16019*/)/*<16016*/)(/*1984*/function name_1984(_) { return /*17033*//*17034*/$lt_/*<17034*//*17033*/(/*1997*//*2000*/type_apply/*<2000*//*1997*/(/*2001*/subst/*<2001*/)(/*2002*/type/*<2002*/)/*<1997*/)/*<17033*/ }/*<1984*/)/*<1984*/ }/*<1984*/)/*<1984*/ }/*<1984*/)/*<1984*/ } }/*<1976*/;

const infer_stmt = /*2197*/function name_2197(tenv$qu) { return function name_2197(stmt) { return /*4547*/(function match_4547($target) {
if ($target.type === "sdef") {
{
let name = $target[0];
{
let nl = $target[1];
{
let expr = $target[2];
{
let l = $target[3];
return /*5499*//*5503*/$gt$gt$eq/*<5503*//*5499*/(/*17071*//*17072*/idx_$gt/*<17072*//*17071*/(/*17073*/0/*<17073*/)/*<17071*/)(/*5499*/function name_5499(_) { return /*5499*//*5503*/$gt$gt$eq/*<5503*//*5499*/(/*5569*//*5570*/new_type_var/*<5570*//*5569*/(/*5572*/name/*<5572*/)(/*10944*/l/*<10944*/)/*<5569*/)(/*5499*/function name_5499(self) { return /*5499*//*5503*/$gt$gt$eq/*<5503*//*5499*/(/*17074*//*17075*/$lt_/*<17075*//*17074*/(/*5556*//*5557*/tenv$slset_type/*<5557*//*5556*/(/*5559*/tenv$qu/*<5559*/)(/*5560*/name/*<5560*/)(/*5561*//*5562*/scheme/*<5562*//*5561*/(/*5563*/set$slnil/*<5563*/)(/*5564*/self/*<5564*/)/*<5561*/)/*<5556*/)/*<17074*/)(/*5499*/function name_5499(self_bound) { return /*5499*//*5503*/$gt$gt$eq/*<5503*//*5499*/(/*15956*//*15959*/find_missing/*<15959*//*15956*/(/*15960*/self_bound/*<15960*/)(/*15961*//*15962*/externals/*<15962*//*15961*/(/*15963*/set$slnil/*<15963*/)(/*15964*/expr/*<15964*/)/*<15961*/)/*<15956*/)(/*5499*/function name_5499({0: self_bound, 1: missing}) {
 return /*5499*//*5503*/$gt$gt$eq/*<5503*//*5499*/(/*5510*//*5511*/t_expr/*<5511*//*5510*/(/*5512*/self_bound/*<5512*/)(/*5513*/expr/*<5513*/)/*<5510*/)(/*5499*/function name_5499({0: subst, 1: t}) {
 return /*5499*//*5503*/$gt$gt$eq/*<5503*//*5499*/(/*15838*//*15839*/report_missing/*<15839*//*15838*/(/*15840*/subst/*<15840*/)(/*15965*/missing/*<15965*/)/*<15838*/)(/*5499*/function name_5499(_) { return /*5499*//*5503*/$gt$gt$eq/*<5503*//*5499*/(/*17076*//*17077*/$lt_/*<17077*//*17076*/(/*6510*//*6511*/type_apply/*<6511*//*6510*/(/*6512*/subst/*<6512*/)(/*6513*/self/*<6513*/)/*<6510*/)/*<17076*/)(/*5499*/function name_5499(selfed) { return /*5499*//*5503*/$gt$gt$eq/*<5503*//*5499*/(/*5585*//*5586*/unify_inner/*<5586*//*5585*/(/*6425*/selfed/*<6425*/)(/*5588*/t/*<5588*/)(/*11564*/l/*<11564*/)/*<5585*/)(/*5499*/function name_5499(unified_subst) { return /*5499*//*5503*/$gt$gt$eq/*<5503*//*5499*/(/*17078*//*17079*/$lt_/*<17079*//*17078*/(/*6520*//*6521*/compose_subst/*<6521*//*6520*/(/*12254*/"infer-stmt"/*<12254*/)(/*6522*/unified_subst/*<6522*/)(/*5574*/subst/*<5574*/)/*<6520*/)/*<17078*/)(/*5499*/function name_5499(composed) { return /*5499*//*5503*/$gt$gt$eq/*<5503*//*5499*/(/*17080*//*17081*/$lt_/*<17081*//*17080*/(/*5516*//*5517*/type_apply/*<5517*//*5516*/(/*5518*/composed/*<5518*/)(/*5519*/t/*<5519*/)/*<5516*/)/*<17080*/)(/*5499*/function name_5499(t) { return /*17082*//*17083*/$lt_/*<17083*//*17082*/(/*4554*//*4555*/tenv$slset_type/*<4555*//*4554*/(/*4556*/tenv$slnil/*<4556*/)(/*4557*/name/*<4557*/)(/*4558*//*4559*/generalize/*<4559*//*4558*/(/*4560*/tenv$qu/*<4560*/)(/*4561*/t/*<4561*/)/*<4558*/)/*<4554*/)/*<17082*/ }/*<5499*/)/*<5499*/ }/*<5499*/)/*<5499*/ }/*<5499*/)/*<5499*/ }/*<5499*/)/*<5499*/ }/*<5499*/)/*<5499*/ }/*<5499*/)/*<5499*/ }/*<5499*/)/*<5499*/ }/*<5499*/)/*<5499*/ }/*<5499*/)/*<5499*/ }/*<5499*/)/*<5499*/
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
let body = $target[3];
{
let l = $target[4];
return /*17086*//*17087*/$lt_/*<17087*//*17086*/(/*13273*//*13277*/tenv/*<13277*//*13273*/(/*13278*/map$slnil/*<13278*/)(/*13281*/map$slnil/*<13281*/)(/*13307*/map$slnil/*<13307*/)(/*13308*//*13309*/map$slset/*<13309*//*13308*/(/*13310*/map$slnil/*<13310*/)(/*13311*/name/*<13311*/)(/*13312*//*13313*/$co/*<13313*//*13312*/(/*13314*//*13315*/map/*<13315*//*13314*/(/*13328*/args/*<13328*/)(/*13316*/function name_13316({0: name}) { return /*13327*/name/*<13327*/ }/*<13316*/)/*<13314*/)(/*13552*/body/*<13552*/)/*<13312*/)/*<13308*/)/*<13273*/)/*<17086*/
}
}
}
}
}
}
if ($target.type === "sexpr") {
{
let expr = $target[0];
{
let l = $target[1];
return /*4568*//*4570*/$gt$gt$eq/*<4570*//*4568*/(/*16021*//*16022*/infer/*<16022*//*16021*/(/*16023*/tenv$qu/*<16023*/)(/*16024*/expr/*<16024*/)/*<16021*/)(/*4568*/function name_4568(_) { return /*17084*//*4579*/$lt_/*<4579*//*17084*/(/*17085*/tenv$slnil/*<17085*/)/*<17084*/ }/*<4568*/)/*<4568*/
}
}
}
if ($target.type === "sdeftype") {
{
let tname = $target[0];
{
let tnl = $target[1];
{
let targs = $target[2];
{
let constructors = $target[3];
{
let l = $target[4];
return /*14872*//*14873*/infer_deftype/*<14873*//*14872*/(/*14874*/tenv$qu/*<14874*/)(/*14919*/set$slnil/*<14919*/)(/*14875*/tname/*<14875*/)(/*14876*/tnl/*<14876*/)(/*14877*/targs/*<14877*/)(/*14878*/constructors/*<14878*/)(/*14879*/l/*<14879*/)/*<14872*/
}
}
}
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 4547');})(/*!*//*4549*/stmt/*<4549*/)/*<4547*/ } }/*<2197*/;

const infer_show = /*4985*/function name_4985(tenv) { return function name_4985(x) { return /*17107*/(function match_17107($target) {
if ($target.type === "ok") {
{
let v = $target[0];
return /*17120*//*17121*/type_to_string/*<17121*//*17120*/(/*17122*/v/*<17122*/)/*<17120*/
}
}
if ($target.type === "err") {
{
let e = $target[0];
return /*17127*/`Fatal runtime: ${/*18554*//*17126*/type_error_$gts/*<17126*//*18554*/(/*18556*/e/*<18556*/)/*<18554*/}`/*<17127*/
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 17107');})(/*!*//*17110*//*17111*/run$slnil_$gt/*<17111*//*17110*/(/*17112*//*17113*/infer/*<17113*//*17112*/(/*17114*/tenv/*<17114*/)(/*17115*/x/*<17115*/)/*<17112*/)/*<17110*/)/*<17107*/ } }/*<4985*/;

const infer_several_inner = /*15750*/function name_15750(bound) { return function name_15750({0: subst, 1: types}) {
 return function name_15750({0: $var, 1: {0: name, 2: body, 3: l}}) {


 return /*8391*//*8392*/$gt$gt$eq/*<8392*//*8391*/(/*8399*//*8400*/t_expr/*<8400*//*8399*/(/*8612*//*8401*/tenv_apply/*<8401*//*8612*/(/*8613*/subst/*<8613*/)(/*8614*/bound/*<8614*/)/*<8612*/)(/*8402*/body/*<8402*/)/*<8399*/)(/*8391*/function name_8391({0: body_subst, 1: body_type}) {
 return /*8391*//*8392*/$gt$gt$eq/*<8392*//*8391*/(/*17135*//*17136*/$lt_/*<17136*//*17135*/(/*12248*//*12249*/compose_subst/*<12249*//*12248*/(/*12250*/"infer-several"/*<12250*/)(/*12252*/body_subst/*<12252*/)(/*12253*/subst/*<12253*/)/*<12248*/)/*<17135*/)(/*8391*/function name_8391(both) { return /*8391*//*8392*/$gt$gt$eq/*<8392*//*8391*/(/*17137*//*17138*/$lt_/*<17138*//*17137*/(/*8405*//*8406*/type_apply/*<8406*//*8405*/(/*8505*/both/*<8505*/)(/*8408*/$var/*<8408*/)/*<8405*/)/*<17137*/)(/*8391*/function name_8391(selfed) { return /*8391*//*8392*/$gt$gt$eq/*<8392*//*8391*/(/*8413*//*8414*/unify_inner/*<8414*//*8413*/(/*8415*/selfed/*<8415*/)(/*8416*/body_type/*<8416*/)(/*11563*/l/*<11563*/)/*<8413*/)(/*8391*/function name_8391(u_subst) { return /*8391*//*8392*/$gt$gt$eq/*<8392*//*8391*/(/*17139*//*17140*/$lt_/*<17140*//*17139*/(/*8428*//*8429*/compose_subst/*<8429*//*8428*/(/*12242*/"infer-several-2"/*<12242*/)(/*8502*/u_subst/*<8502*/)(/*8653*/both/*<8653*/)/*<8428*/)/*<17139*/)(/*8391*/function name_8391(subst) { return /*17141*//*17142*/$lt_/*<17142*//*17141*/(/*8418*//*8419*/$co/*<8419*//*8418*/(/*8420*/subst/*<8420*/)(/*8435*//*8435*/cons/*<8435*//*8435*/(/*8425*//*8426*/type_apply/*<8426*//*8425*/(/*8432*/subst/*<8432*/)(/*8433*/body_type/*<8433*/)/*<8425*/)(/*8436*/types/*<8436*/)/*<8435*/)/*<8418*/)/*<17141*/ }/*<8391*/)/*<8391*/ }/*<8391*/)/*<8391*/ }/*<8391*/)/*<8391*/ }/*<8391*/)/*<8391*/ }/*<8391*/)/*<8391*/ } } }/*<15750*/;

const infer_several = /*8292*/function name_8292(tenv) { return function name_8292(stmts) { return /*8300*//*8302*/$gt$gt$eq/*<8302*//*8300*/(/*17144*//*17145*/idx_$gt/*<17145*//*17144*/(/*17146*/0/*<17146*/)/*<17144*/)(/*8300*/function name_8300(_) { return /*8300*//*8302*/$gt$gt$eq/*<8302*//*8300*/(/*17147*//*17148*/$lt_/*<17148*//*17147*/(/*8734*//*8741*/map/*<8741*//*8734*/(/*8742*/stmts/*<8742*/)(/*8743*/function name_8743(stmt) { return /*14179*/(function match_14179($target) {
if ($target.type === "sdef") {
{
let name = $target[0];
return /*14182*/name/*<14182*/
}
}
return /*14184*//*14185*/fatal/*<14185*//*14184*/(/*14186*/"Cant infer-several with sdefs? idk maybe you can ..."/*<14186*/)/*<14184*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 14179');})(/*!*//*14181*/stmt/*<14181*/)/*<14179*/ }/*<8743*/)/*<8734*/)/*<17147*/)(/*8300*/function name_8300(names) { return /*8300*//*8302*/$gt$gt$eq/*<8302*//*8300*/(/*15652*//*15653*/vars_for_names/*<15653*//*15652*/(/*15654*//*15655*/map/*<15655*//*15654*/(/*15656*/stmts/*<15656*/)(/*15657*/function name_15657({0: name, 3: l}) {
 return /*15666*//*15667*/$co/*<15667*//*15666*/(/*15668*/name/*<15668*/)(/*15669*/l/*<15669*/)/*<15666*/ }/*<15657*/)/*<15654*/)(/*15672*/tenv/*<15672*/)/*<15652*/)(/*8300*/function name_8300({0: bound, 1: vars}) {
 return /*8300*//*8302*/$gt$gt$eq/*<8302*//*8300*/(/*15972*//*15977*/find_missing/*<15977*//*15972*/(/*15978*/bound/*<15978*/)(/*15979*//*15980*/externals_defs/*<15980*//*15979*/(/*15981*/stmts/*<15981*/)/*<15979*/)/*<15972*/)(/*8300*/function name_8300({0: bound, 1: missing}) {
 return /*8300*//*8302*/$gt$gt$eq/*<8302*//*8300*/(/*8363*//*8364*/foldr_$gt/*<8364*//*8363*/(/*8365*//*8366*/$co/*<8366*//*8365*/(/*8367*/map$slnil/*<8367*/)(/*8368*/nil/*<8368*/)/*<8365*/)(/*8370*//*8371*/zip/*<8371*//*8370*/(/*8372*/vars/*<8372*/)(/*8373*/stmts/*<8373*/)/*<8370*/)(/*15748*//*15747*/infer_several_inner/*<15747*//*15748*/(/*15749*/bound/*<15749*/)/*<15748*/)/*<8363*/)(/*8300*/function name_8300({0: subst, 1: types}) {
 return /*8300*//*8302*/$gt$gt$eq/*<8302*//*8300*/(/*15674*//*15673*/report_missing/*<15673*//*15674*/(/*15675*/subst/*<15675*/)(/*15982*/missing/*<15982*/)/*<15674*/)(/*8300*/function name_8300(_) { return /*17149*//*17150*/$lt_/*<17150*//*17149*/(/*8753*//*8754*/zip/*<8754*//*8753*/(/*8755*/names/*<8755*/)(/*8496*//*8494*/map/*<8494*//*8496*/(/*8497*/types/*<8497*/)(/*8498*//*8499*/type_apply/*<8499*//*8498*/(/*8500*/subst/*<8500*/)/*<8498*/)/*<8496*/)/*<8753*/)/*<17149*/ }/*<8300*/)/*<8300*/ }/*<8300*/)/*<8300*/ }/*<8300*/)/*<8300*/ }/*<8300*/)/*<8300*/ }/*<8300*/)/*<8300*/ }/*<8300*/)/*<8300*/ } }/*<8292*/;

const infer_defns = /*8724*/function name_8724(tenv) { return function name_8724(stmts) { return /*11782*/(function match_11782($target) {
if ($target.type === "cons") {
{
let one = $target[0];
if ($target[1].type === "nil") {
return /*11789*//*11790*/infer_stmt/*<11790*//*11789*/(/*11791*/tenv/*<11791*/)(/*11792*/one/*<11792*/)/*<11789*/
}
}
}
return /*17190*//*17191*/$gt$gt$eq/*<17191*//*17190*/(/*17199*//*17200*/infer_several/*<17200*//*17199*/(/*17201*/tenv/*<17201*/)(/*17202*/stmts/*<17202*/)/*<17199*/)(/*17190*/function name_17190(zipped) { return /*17203*//*17204*/$lt_/*<17204*//*17203*/(/*8731*//*8775*/foldl/*<8775*//*8731*/(/*8776*/tenv$slnil/*<8776*/)(/*8777*/zipped/*<8777*/)(/*8781*/function name_8781(tenv) { return function name_8781({0: name, 1: type}) {
 return /*8789*//*8790*/tenv$slset_type/*<8790*//*8789*/(/*8791*/tenv/*<8791*/)(/*8792*/name/*<8792*/)(/*8793*//*8794*/generalize/*<8794*//*8793*/(/*8795*/tenv/*<8795*/)(/*8796*/type/*<8796*/)/*<8793*/)/*<8789*/ } }/*<8781*/)/*<8731*/)/*<17203*/ }/*<17190*/)/*<17190*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 11782');})(/*!*//*11785*/stmts/*<11785*/)/*<11782*/ } }/*<8724*/;

const infer_stmtss = /*14294*/function name_14294(tenv$qu) { return function name_14294(stmts) { return /*14301*//*14302*/$gt$gt$eq/*<14302*//*14301*/(/*17205*//*17206*/$lt_/*<17206*//*17205*/(/*14309*//*14310*/split_stmts/*<14310*//*14309*/(/*14312*/stmts/*<14312*/)(/*14313*/nil/*<14313*/)(/*14314*/nil/*<14314*/)(/*14315*/nil/*<14315*/)(/*14353*/nil/*<14353*/)/*<14309*/)/*<17205*/)(/*14301*/function name_14301({0: sdefs, 1: stypes, 2: salias, 3: sexps}) {


 return /*14301*//*14302*/$gt$gt$eq/*<14302*//*14301*/(/*14318*//*14319*/infer_stypes/*<14319*//*14318*/(/*14320*/tenv$qu/*<14320*/)(/*14321*/stypes/*<14321*/)(/*14363*/salias/*<14363*/)/*<14318*/)(/*14301*/function name_14301(type_tenv) { return /*14301*//*14302*/$gt$gt$eq/*<14302*//*14301*/(/*17209*//*17210*/$lt_/*<17210*//*17209*/(/*14603*//*14604*/tenv$slmerge/*<14604*//*14603*/(/*14605*/type_tenv/*<14605*/)(/*14606*/tenv$qu/*<14606*/)/*<14603*/)/*<17209*/)(/*14301*/function name_14301(tenv$qu) { return /*14301*//*14302*/$gt$gt$eq/*<14302*//*14301*/(/*14323*//*14324*/infer_defns/*<14324*//*14323*/(/*14325*/tenv$qu/*<14325*/)(/*14326*/sdefs/*<14326*/)/*<14323*/)(/*14301*/function name_14301(val_tenv) { return /*14301*//*14302*/$gt$gt$eq/*<14302*//*14301*/(/*14328*//*14331*/map_$gt/*<14331*//*14328*/(/*14333*//*14334*/infer/*<14334*//*14333*/(/*15061*//*14335*/tenv$slmerge/*<14335*//*15061*/(/*15062*/val_tenv/*<15062*/)(/*15064*/tenv$qu/*<15064*/)/*<15061*/)/*<14333*/)(/*17282*/sexps/*<17282*/)/*<14328*/)(/*14301*/function name_14301(_) { return /*17213*//*17214*/$lt_/*<17214*//*17213*/(/*14609*//*14316*/tenv$slmerge/*<14316*//*14609*/(/*14610*/type_tenv/*<14610*/)(/*14611*/val_tenv/*<14611*/)/*<14609*/)/*<17213*/ }/*<14301*/)/*<14301*/ }/*<14301*/)/*<14301*/ }/*<14301*/)/*<14301*/ }/*<14301*/)/*<14301*/ }/*<14301*/)/*<14301*/ } }/*<14294*/;

const builtin_env = /*9239*/(function let_9239() {const $target = /*9243*//*9244*/vbl/*<9244*//*9243*/(/*9245*/"k"/*<9245*/)/*<9243*/;
{
let k = $target;
return (function let_9239() {const $target = /*9248*//*9249*/vbl/*<9249*//*9248*/(/*9250*/"v"/*<9250*/)/*<9248*/;
{
let v = $target;
return (function let_9239() {const $target = /*9317*//*9318*/vbl/*<9318*//*9317*/(/*9319*/"v2"/*<9319*/)/*<9317*/;
{
let v2 = $target;
return (function let_9239() {const $target = /*9418*//*9419*/generic/*<9419*//*9418*/(/*9420*//*9420*/cons/*<9420*//*9420*/(/*9421*/"k"/*<9421*/)(/*9420*//*9420*/cons/*<9420*//*9420*/(/*9423*/"v"/*<9423*/)(/*9420*/nil/*<9420*/)/*<9420*/)/*<9420*/)/*<9418*/;
{
let kv = $target;
return (function let_9239() {const $target = /*9426*//*9427*/generic/*<9427*//*9426*/(/*9428*//*9428*/cons/*<9428*//*9428*/(/*9429*/"k"/*<9429*/)(/*9428*/nil/*<9428*/)/*<9428*/)/*<9426*/;
{
let kk = $target;
return /*5253*//*5254*/foldl/*<5254*//*5253*/(/*5255*//*5281*/tenv/*<5281*//*5255*/(/*5282*//*5286*/map$slfrom_list/*<5286*//*5282*/(/*5287*//*5287*/cons/*<5287*//*5287*/(/*5289*//*5290*/$co/*<5290*//*5289*/(/*5291*/"+"/*<5291*/)(/*5293*//*9168*/concrete/*<9168*//*5293*/(/*5296*//*9074*/tfns/*<9074*//*5296*/(/*9075*//*9075*/cons/*<9075*//*9075*/(/*9076*/tint/*<9076*/)(/*9075*//*9075*/cons/*<9075*//*9075*/(/*9077*/tint/*<9077*/)(/*9075*/nil/*<9075*/)/*<9075*/)/*<9075*/)(/*9078*/tint/*<9078*/)/*<5296*/)/*<5293*/)/*<5289*/)(/*5287*//*5287*/cons/*<5287*//*5287*/(/*5380*//*5381*/$co/*<5381*//*5380*/(/*5382*/"-"/*<5382*/)(/*5384*//*9169*/concrete/*<9169*//*5384*/(/*5387*//*9079*/tfns/*<9079*//*5387*/(/*9080*//*9080*/cons/*<9080*//*9080*/(/*9081*/tint/*<9081*/)(/*9080*//*9080*/cons/*<9080*//*9080*/(/*9082*/tint/*<9082*/)(/*9080*/nil/*<9080*/)/*<9080*/)/*<9080*/)(/*9083*/tint/*<9083*/)/*<5387*/)/*<5384*/)/*<5380*/)(/*5287*//*5287*/cons/*<5287*//*5287*/(/*5396*//*5397*/$co/*<5397*//*5396*/(/*5398*/">"/*<5398*/)(/*5400*//*5401*/concrete/*<5401*//*5400*/(/*5403*//*9084*/tfns/*<9084*//*5403*/(/*9085*//*9085*/cons/*<9085*//*9085*/(/*9086*/tint/*<9086*/)(/*9085*//*9085*/cons/*<9085*//*9085*/(/*9087*/tint/*<9087*/)(/*9085*/nil/*<9085*/)/*<9085*/)/*<9085*/)(/*9088*/tbool/*<9088*/)/*<5403*/)/*<5400*/)/*<5396*/)(/*5287*//*5287*/cons/*<5287*//*5287*/(/*5422*//*5423*/$co/*<5423*//*5422*/(/*5424*/"<"/*<5424*/)(/*5426*//*5427*/concrete/*<5427*//*5426*/(/*5429*//*9089*/tfns/*<9089*//*5429*/(/*9090*//*9090*/cons/*<9090*//*9090*/(/*9091*/tint/*<9091*/)(/*9090*//*9090*/cons/*<9090*//*9090*/(/*9092*/tint/*<9092*/)(/*9090*/nil/*<9090*/)/*<9090*/)/*<9090*/)(/*9093*/tbool/*<9093*/)/*<5429*/)/*<5426*/)/*<5422*/)(/*5287*//*5287*/cons/*<5287*//*5287*/(/*5438*//*5439*/$co/*<5439*//*5438*/(/*5440*/"="/*<5440*/)(/*5442*//*5443*/generic/*<5443*//*5442*/(/*10377*//*10377*/cons/*<10377*//*10377*/(/*10382*/"k"/*<10382*/)(/*10377*/nil/*<10377*/)/*<10377*/)(/*5445*//*9094*/tfns/*<9094*//*5445*/(/*9095*//*9095*/cons/*<9095*//*9095*/(/*9096*/k/*<9096*/)(/*9095*//*9095*/cons/*<9095*//*9095*/(/*9097*/k/*<9097*/)(/*9095*/nil/*<9095*/)/*<9095*/)/*<9095*/)(/*9098*/tbool/*<9098*/)/*<5445*/)/*<5442*/)/*<5438*/)(/*5287*//*5287*/cons/*<5287*//*5287*/(/*10385*//*10386*/$co/*<10386*//*10385*/(/*10387*/"!="/*<10387*/)(/*10389*//*10390*/generic/*<10390*//*10389*/(/*10391*//*10391*/cons/*<10391*//*10391*/(/*10392*/"k"/*<10392*/)(/*10391*/nil/*<10391*/)/*<10391*/)(/*10394*//*10395*/tfns/*<10395*//*10394*/(/*10396*//*10396*/cons/*<10396*//*10396*/(/*10397*/k/*<10397*/)(/*10396*//*10396*/cons/*<10396*//*10396*/(/*10398*/k/*<10398*/)(/*10396*/nil/*<10396*/)/*<10396*/)/*<10396*/)(/*10399*/tbool/*<10399*/)/*<10394*/)/*<10389*/)/*<10385*/)(/*5287*//*5287*/cons/*<5287*//*5287*/(/*5454*//*5455*/$co/*<5455*//*5454*/(/*5456*/">="/*<5456*/)(/*5458*//*5459*/concrete/*<5459*//*5458*/(/*5461*//*9099*/tfns/*<9099*//*5461*/(/*9100*//*9100*/cons/*<9100*//*9100*/(/*9101*/tint/*<9101*/)(/*9100*//*9100*/cons/*<9100*//*9100*/(/*9102*/tint/*<9102*/)(/*9100*/nil/*<9100*/)/*<9100*/)/*<9100*/)(/*9103*/tbool/*<9103*/)/*<5461*/)/*<5458*/)/*<5454*/)(/*5287*//*5287*/cons/*<5287*//*5287*/(/*5470*//*5471*/$co/*<5471*//*5470*/(/*5472*/"<="/*<5472*/)(/*5474*//*5475*/concrete/*<5475*//*5474*/(/*5477*//*9104*/tfns/*<9104*//*5477*/(/*9105*//*9105*/cons/*<9105*//*9105*/(/*9106*/tint/*<9106*/)(/*9105*//*9105*/cons/*<9105*//*9105*/(/*9107*/tint/*<9107*/)(/*9105*/nil/*<9105*/)/*<9105*/)/*<9105*/)(/*9108*/tbool/*<9108*/)/*<5477*/)/*<5474*/)/*<5470*/)(/*5287*//*5287*/cons/*<5287*//*5287*/(/*18274*//*18275*/$co/*<18275*//*18274*/(/*18276*/"()"/*<18276*/)(/*18278*//*18279*/concrete/*<18279*//*18278*/(/*18280*//*18281*/tcon/*<18281*//*18280*/(/*18282*/"()"/*<18282*/)(/*18284*/-1/*<18284*/)/*<18280*/)/*<18278*/)/*<18274*/)(/*5287*//*5287*/cons/*<5287*//*5287*/(/*11355*//*11356*/$co/*<11356*//*11355*/(/*11357*/"trace"/*<11357*/)(/*11359*//*11361*/kk/*<11361*//*11359*/(/*11362*//*11363*/tfns/*<11363*//*11362*/(/*11364*//*11364*/cons/*<11364*//*11364*/(/*11380*//*11381*/tapp/*<11381*//*11380*/(/*11382*//*11383*/tcon/*<11383*//*11382*/(/*11384*/"array"/*<11384*/)(/*11424*/-1/*<11424*/)/*<11382*/)(/*11366*//*11367*/tapp/*<11367*//*11366*/(/*11368*//*11369*/tcon/*<11369*//*11368*/(/*11370*/"trace-fmt"/*<11370*/)(/*11372*/-1/*<11372*/)/*<11368*/)(/*11373*/k/*<11373*/)(/*11374*/-1/*<11374*/)/*<11366*/)(/*11386*/-1/*<11386*/)/*<11380*/)(/*11364*/nil/*<11364*/)/*<11364*/)(/*11375*//*11376*/tcon/*<11376*//*11375*/(/*11377*/"()"/*<11377*/)(/*11379*/-1/*<11379*/)/*<11375*/)/*<11362*/)/*<11359*/)/*<11355*/)(/*5287*//*5287*/cons/*<5287*//*5287*/(/*8890*//*8891*/$co/*<8891*//*8890*/(/*8892*/"unescapeString"/*<8892*/)(/*8894*//*8895*/concrete/*<8895*//*8894*/(/*8897*//*8899*/tfns/*<8899*//*8897*/(/*9606*//*9606*/cons/*<9606*//*9606*/(/*8900*/tstring/*<8900*/)(/*9606*/nil/*<9606*/)/*<9606*/)(/*8901*/tstring/*<8901*/)/*<8897*/)/*<8894*/)/*<8890*/)(/*5287*//*5287*/cons/*<5287*//*5287*/(/*8911*//*8912*/$co/*<8912*//*8911*/(/*8913*/"int-to-string"/*<8913*/)(/*8915*//*8916*/concrete/*<8916*//*8915*/(/*8918*//*8920*/tfns/*<8920*//*8918*/(/*9607*//*9607*/cons/*<9607*//*9607*/(/*8921*/tint/*<8921*/)(/*9607*/nil/*<9607*/)/*<9607*/)(/*8922*/tstring/*<8922*/)/*<8918*/)/*<8915*/)/*<8911*/)(/*5287*//*5287*/cons/*<5287*//*5287*/(/*8923*//*8924*/$co/*<8924*//*8923*/(/*8925*/"string-to-int"/*<8925*/)(/*8927*//*8928*/concrete/*<8928*//*8927*/(/*8930*//*8931*/tfns/*<8931*//*8930*/(/*9608*//*9608*/cons/*<9608*//*9608*/(/*8932*/tstring/*<8932*/)(/*9608*/nil/*<9608*/)/*<9608*/)(/*8933*//*9140*/toption/*<9140*//*8933*/(/*9141*/tint/*<9141*/)/*<8933*/)/*<8930*/)/*<8927*/)/*<8923*/)(/*5287*//*5287*/cons/*<5287*//*5287*/(/*16217*//*16218*/$co/*<16218*//*16217*/(/*16219*/"string-to-float"/*<16219*/)(/*16221*//*16222*/concrete/*<16222*//*16221*/(/*16223*//*16224*/tfns/*<16224*//*16223*/(/*16225*//*16225*/cons/*<16225*//*16225*/(/*16231*/tstring/*<16231*/)(/*16225*/nil/*<16225*/)/*<16225*/)(/*16232*//*16233*/toption/*<16233*//*16232*/(/*16234*//*16235*/tcon/*<16235*//*16234*/(/*16236*/"float"/*<16236*/)(/*16238*/-1/*<16238*/)/*<16234*/)/*<16232*/)/*<16223*/)/*<16221*/)/*<16217*/)(/*5287*//*5287*/cons/*<5287*//*5287*/(/*8944*//*8945*/$co/*<8945*//*8944*/(/*8946*/"++"/*<8946*/)(/*8948*//*8949*/concrete/*<8949*//*8948*/(/*8951*//*8952*/tfns/*<8952*//*8951*/(/*9609*//*9609*/cons/*<9609*//*9609*/(/*8953*//*9142*/tarray/*<9142*//*8953*/(/*9143*/tstring/*<9143*/)/*<8953*/)(/*9609*/nil/*<9609*/)/*<9609*/)(/*8962*/tstring/*<8962*/)/*<8951*/)/*<8948*/)/*<8944*/)(/*5287*//*5287*/cons/*<5287*//*5287*/(/*8963*//*8964*/$co/*<8964*//*8963*/(/*8965*/"map/nil"/*<8965*/)(/*8967*//*8968*/kv/*<8968*//*8967*/(/*8989*//*8990*/tmap/*<8990*//*8989*/(/*8984*/k/*<8984*/)(/*8992*/v/*<8992*/)/*<8989*/)/*<8967*/)/*<8963*/)(/*5287*//*5287*/cons/*<5287*//*5287*/(/*9023*//*9024*/$co/*<9024*//*9023*/(/*9025*/"map/set"/*<9025*/)(/*9027*//*9028*/kv/*<9028*//*9027*/(/*9036*//*9037*/tfns/*<9037*//*9036*/(/*9170*//*9170*/cons/*<9170*//*9170*/(/*9039*//*9040*/tmap/*<9040*//*9039*/(/*9171*/k/*<9171*/)(/*9176*/v/*<9176*/)/*<9039*/)(/*9170*//*9170*/cons/*<9170*//*9170*/(/*9191*/k/*<9191*/)(/*9170*//*9170*/cons/*<9170*//*9170*/(/*9195*/v/*<9195*/)(/*9170*/nil/*<9170*/)/*<9170*/)/*<9170*/)/*<9170*/)(/*9199*//*9200*/tmap/*<9200*//*9199*/(/*9201*/k/*<9201*/)(/*9205*/v/*<9205*/)/*<9199*/)/*<9036*/)/*<9027*/)/*<9023*/)(/*5287*//*5287*/cons/*<5287*//*5287*/(/*9222*//*9223*/$co/*<9223*//*9222*/(/*9224*/"map/rm"/*<9224*/)(/*9226*//*9252*/kv/*<9252*//*9226*/(/*9259*//*9261*/tfns/*<9261*//*9259*/(/*9262*//*9262*/cons/*<9262*//*9262*/(/*9263*//*9264*/tmap/*<9264*//*9263*/(/*9265*/k/*<9265*/)(/*9266*/v/*<9266*/)/*<9263*/)(/*9262*//*9262*/cons/*<9262*//*9262*/(/*9267*/k/*<9267*/)(/*9262*/nil/*<9262*/)/*<9262*/)/*<9262*/)(/*9268*//*9269*/tmap/*<9269*//*9268*/(/*9270*/k/*<9270*/)(/*9271*/v/*<9271*/)/*<9268*/)/*<9259*/)/*<9226*/)/*<9222*/)(/*5287*//*5287*/cons/*<5287*//*5287*/(/*9272*//*9273*/$co/*<9273*//*9272*/(/*9274*/"map/get"/*<9274*/)(/*9276*//*9277*/kv/*<9277*//*9276*/(/*9283*//*9284*/tfns/*<9284*//*9283*/(/*9285*//*9285*/cons/*<9285*//*9285*/(/*9286*//*9287*/tmap/*<9287*//*9286*/(/*9288*/k/*<9288*/)(/*9289*/v/*<9289*/)/*<9286*/)(/*9285*//*9285*/cons/*<9285*//*9285*/(/*9290*/k/*<9290*/)(/*9285*/nil/*<9285*/)/*<9285*/)/*<9285*/)(/*9291*//*9293*/toption/*<9293*//*9291*/(/*9294*/v/*<9294*/)/*<9291*/)/*<9283*/)/*<9276*/)/*<9272*/)(/*5287*//*5287*/cons/*<5287*//*5287*/(/*9295*//*9296*/$co/*<9296*//*9295*/(/*9297*/"map/map"/*<9297*/)(/*9299*//*9300*/generic/*<9300*//*9299*/(/*9301*//*9301*/cons/*<9301*//*9301*/(/*9302*/"k"/*<9302*/)(/*9301*//*9301*/cons/*<9301*//*9301*/(/*9304*/"v"/*<9304*/)(/*9301*//*9301*/cons/*<9301*//*9301*/(/*9321*/"v2"/*<9321*/)(/*9301*/nil/*<9301*/)/*<9301*/)/*<9301*/)/*<9301*/)(/*9307*//*9308*/tfns/*<9308*//*9307*/(/*9309*//*9309*/cons/*<9309*//*9309*/(/*9314*//*9315*/tfns/*<9315*//*9314*/(/*9734*//*9734*/cons/*<9734*//*9734*/(/*9323*/v/*<9323*/)(/*9734*/nil/*<9734*/)/*<9734*/)(/*9324*/v2/*<9324*/)/*<9314*/)(/*9309*//*9309*/cons/*<9309*//*9309*/(/*9735*//*9736*/tmap/*<9736*//*9735*/(/*9737*/k/*<9737*/)(/*9738*/v/*<9738*/)/*<9735*/)(/*9309*/nil/*<9309*/)/*<9309*/)/*<9309*/)(/*9325*//*9326*/tmap/*<9326*//*9325*/(/*9327*/k/*<9327*/)(/*9329*/v2/*<9329*/)/*<9325*/)/*<9307*/)/*<9299*/)/*<9295*/)(/*5287*//*5287*/cons/*<5287*//*5287*/(/*9330*//*9331*/$co/*<9331*//*9330*/(/*9332*/"map/merge"/*<9332*/)(/*9334*//*9335*/kv/*<9335*//*9334*/(/*9341*//*9342*/tfns/*<9342*//*9341*/(/*9343*//*9343*/cons/*<9343*//*9343*/(/*9344*//*9345*/tmap/*<9345*//*9344*/(/*9346*/k/*<9346*/)(/*9347*/v/*<9347*/)/*<9344*/)(/*9343*//*9343*/cons/*<9343*//*9343*/(/*9348*//*9349*/tmap/*<9349*//*9348*/(/*9351*/k/*<9351*/)(/*9352*/v/*<9352*/)/*<9348*/)(/*9343*/nil/*<9343*/)/*<9343*/)/*<9343*/)(/*9353*//*9354*/tmap/*<9354*//*9353*/(/*9355*/k/*<9355*/)(/*9356*/v/*<9356*/)/*<9353*/)/*<9341*/)/*<9334*/)/*<9330*/)(/*5287*//*5287*/cons/*<5287*//*5287*/(/*9357*//*9358*/$co/*<9358*//*9357*/(/*9359*/"map/values"/*<9359*/)(/*9361*//*9362*/kv/*<9362*//*9361*/(/*9368*//*9369*/tfns/*<9369*//*9368*/(/*9370*//*9370*/cons/*<9370*//*9370*/(/*9371*//*9372*/tmap/*<9372*//*9371*/(/*9373*/k/*<9373*/)(/*9374*/v/*<9374*/)/*<9371*/)(/*9370*/nil/*<9370*/)/*<9370*/)(/*9375*//*9376*/tarray/*<9376*//*9375*/(/*9377*/v/*<9377*/)/*<9375*/)/*<9368*/)/*<9361*/)/*<9357*/)(/*5287*//*5287*/cons/*<5287*//*5287*/(/*12119*//*12120*/$co/*<12120*//*12119*/(/*12121*/"map/keys"/*<12121*/)(/*12123*//*12124*/kv/*<12124*//*12123*/(/*12125*//*12126*/tfns/*<12126*//*12125*/(/*12127*//*12127*/cons/*<12127*//*12127*/(/*12128*//*12129*/tmap/*<12129*//*12128*/(/*12130*/k/*<12130*/)(/*12131*/v/*<12131*/)/*<12128*/)(/*12127*/nil/*<12127*/)/*<12127*/)(/*12132*//*12133*/tarray/*<12133*//*12132*/(/*12134*/k/*<12134*/)/*<12132*/)/*<12125*/)/*<12123*/)/*<12119*/)(/*5287*//*5287*/cons/*<5287*//*5287*/(/*9378*//*9379*/$co/*<9379*//*9378*/(/*9380*/"set/nil"/*<9380*/)(/*9382*//*9383*/kk/*<9383*//*9382*/(/*9387*//*9388*/tset/*<9388*//*9387*/(/*9389*/k/*<9389*/)/*<9387*/)/*<9382*/)/*<9378*/)(/*5287*//*5287*/cons/*<5287*//*5287*/(/*9407*//*9408*/$co/*<9408*//*9407*/(/*9409*/"set/add"/*<9409*/)(/*9411*//*9412*/kk/*<9412*//*9411*/(/*9416*//*9431*/tfns/*<9431*//*9416*/(/*9432*//*9432*/cons/*<9432*//*9432*/(/*9433*//*9434*/tset/*<9434*//*9433*/(/*9435*/k/*<9435*/)/*<9433*/)(/*9432*//*9432*/cons/*<9432*//*9432*/(/*9436*/k/*<9436*/)(/*9432*/nil/*<9432*/)/*<9432*/)/*<9432*/)(/*9437*//*9438*/tset/*<9438*//*9437*/(/*9439*/k/*<9439*/)/*<9437*/)/*<9416*/)/*<9411*/)/*<9407*/)(/*5287*//*5287*/cons/*<5287*//*5287*/(/*9739*//*9740*/$co/*<9740*//*9739*/(/*9741*/"set/has"/*<9741*/)(/*9743*//*9744*/kk/*<9744*//*9743*/(/*9745*//*9746*/tfns/*<9746*//*9745*/(/*9747*//*9747*/cons/*<9747*//*9747*/(/*9748*//*9749*/tset/*<9749*//*9748*/(/*9750*/k/*<9750*/)/*<9748*/)(/*9747*//*9747*/cons/*<9747*//*9747*/(/*9751*/k/*<9751*/)(/*9747*/nil/*<9747*/)/*<9747*/)/*<9747*/)(/*9752*/tbool/*<9752*/)/*<9745*/)/*<9743*/)/*<9739*/)(/*5287*//*5287*/cons/*<5287*//*5287*/(/*9440*//*9441*/$co/*<9441*//*9440*/(/*9442*/"set/rm"/*<9442*/)(/*9444*//*9445*/kk/*<9445*//*9444*/(/*9446*//*9447*/tfns/*<9447*//*9446*/(/*9448*//*9448*/cons/*<9448*//*9448*/(/*9449*//*9450*/tset/*<9450*//*9449*/(/*9451*/k/*<9451*/)/*<9449*/)(/*9448*//*9448*/cons/*<9448*//*9448*/(/*9452*/k/*<9452*/)(/*9448*/nil/*<9448*/)/*<9448*/)/*<9448*/)(/*9453*//*9454*/tset/*<9454*//*9453*/(/*9455*/k/*<9455*/)/*<9453*/)/*<9446*/)/*<9444*/)/*<9440*/)(/*5287*//*5287*/cons/*<5287*//*5287*/(/*9456*//*9457*/$co/*<9457*//*9456*/(/*9458*/"set/diff"/*<9458*/)(/*9460*//*9461*/kk/*<9461*//*9460*/(/*9462*//*9463*/tfns/*<9463*//*9462*/(/*9464*//*9464*/cons/*<9464*//*9464*/(/*9465*//*9466*/tset/*<9466*//*9465*/(/*9467*/k/*<9467*/)/*<9465*/)(/*9464*//*9464*/cons/*<9464*//*9464*/(/*9468*//*9469*/tset/*<9469*//*9468*/(/*9470*/k/*<9470*/)/*<9468*/)(/*9464*/nil/*<9464*/)/*<9464*/)/*<9464*/)(/*9471*//*9472*/tset/*<9472*//*9471*/(/*9473*/k/*<9473*/)/*<9471*/)/*<9462*/)/*<9460*/)/*<9456*/)(/*5287*//*5287*/cons/*<5287*//*5287*/(/*9474*//*9475*/$co/*<9475*//*9474*/(/*9476*/"set/merge"/*<9476*/)(/*9478*//*9479*/kk/*<9479*//*9478*/(/*9480*//*9483*/tfns/*<9483*//*9480*/(/*9484*//*9484*/cons/*<9484*//*9484*/(/*9485*//*9486*/tset/*<9486*//*9485*/(/*9487*/k/*<9487*/)/*<9485*/)(/*9484*//*9484*/cons/*<9484*//*9484*/(/*9488*//*9489*/tset/*<9489*//*9488*/(/*9490*/k/*<9490*/)/*<9488*/)(/*9484*/nil/*<9484*/)/*<9484*/)/*<9484*/)(/*9492*//*9493*/tset/*<9493*//*9492*/(/*9494*/k/*<9494*/)/*<9492*/)/*<9480*/)/*<9478*/)/*<9474*/)(/*5287*//*5287*/cons/*<5287*//*5287*/(/*9495*//*9496*/$co/*<9496*//*9495*/(/*9497*/"set/to-list"/*<9497*/)(/*9499*//*9500*/kk/*<9500*//*9499*/(/*9501*//*9502*/tfns/*<9502*//*9501*/(/*9503*//*9503*/cons/*<9503*//*9503*/(/*9504*//*9505*/tset/*<9505*//*9504*/(/*9506*/k/*<9506*/)/*<9504*/)(/*9503*/nil/*<9503*/)/*<9503*/)(/*9507*//*9508*/tarray/*<9508*//*9507*/(/*9509*/k/*<9509*/)/*<9507*/)/*<9501*/)/*<9499*/)/*<9495*/)(/*5287*//*5287*/cons/*<5287*//*5287*/(/*9510*//*9511*/$co/*<9511*//*9510*/(/*9512*/"set/from-list"/*<9512*/)(/*9514*//*9515*/kk/*<9515*//*9514*/(/*9516*//*9517*/tfns/*<9517*//*9516*/(/*9518*//*9518*/cons/*<9518*//*9518*/(/*9519*//*9520*/tarray/*<9520*//*9519*/(/*9521*/k/*<9521*/)/*<9519*/)(/*9518*/nil/*<9518*/)/*<9518*/)(/*9522*//*9523*/tset/*<9523*//*9522*/(/*9524*/k/*<9524*/)/*<9522*/)/*<9516*/)/*<9514*/)/*<9510*/)(/*5287*//*5287*/cons/*<5287*//*5287*/(/*9525*//*9526*/$co/*<9526*//*9525*/(/*9527*/"map/from-list"/*<9527*/)(/*9529*//*9530*/kv/*<9530*//*9529*/(/*9531*//*9532*/tfns/*<9532*//*9531*/(/*9533*//*9533*/cons/*<9533*//*9533*/(/*9534*//*9535*/tarray/*<9535*//*9534*/(/*9536*//*9537*/t$co/*<9537*//*9536*/(/*9538*/k/*<9538*/)(/*9539*/v/*<9539*/)/*<9536*/)/*<9534*/)(/*9533*/nil/*<9533*/)/*<9533*/)(/*9540*//*9541*/tmap/*<9541*//*9540*/(/*9542*/k/*<9542*/)(/*9543*/v/*<9543*/)/*<9540*/)/*<9531*/)/*<9529*/)/*<9525*/)(/*5287*//*5287*/cons/*<5287*//*5287*/(/*9564*//*9565*/$co/*<9565*//*9564*/(/*9566*/"map/to-list"/*<9566*/)(/*9568*//*9569*/kv/*<9569*//*9568*/(/*9570*//*9571*/tfns/*<9571*//*9570*/(/*9572*//*9572*/cons/*<9572*//*9572*/(/*9573*//*9574*/tmap/*<9574*//*9573*/(/*9575*/k/*<9575*/)(/*9576*/v/*<9576*/)/*<9573*/)(/*9572*/nil/*<9572*/)/*<9572*/)(/*9577*//*9580*/tarray/*<9580*//*9577*/(/*9581*//*9582*/t$co/*<9582*//*9581*/(/*9583*/k/*<9583*/)(/*9584*/v/*<9584*/)/*<9581*/)/*<9577*/)/*<9570*/)/*<9568*/)/*<9564*/)(/*5287*//*5287*/cons/*<5287*//*5287*/(/*9585*//*9586*/$co/*<9586*//*9585*/(/*9587*/"jsonify"/*<9587*/)(/*9589*//*9590*/generic/*<9590*//*9589*/(/*9591*//*9591*/cons/*<9591*//*9591*/(/*9592*/"v"/*<9592*/)(/*9591*/nil/*<9591*/)/*<9591*/)(/*9594*//*9595*/tfns/*<9595*//*9594*/(/*9610*//*9610*/cons/*<9610*//*9610*/(/*9596*//*9597*/tvar/*<9597*//*9596*/(/*9598*/"v"/*<9598*/)(/*9600*/-1/*<9600*/)/*<9596*/)(/*9610*/nil/*<9610*/)/*<9610*/)(/*9601*/tstring/*<9601*/)/*<9594*/)/*<9589*/)/*<9585*/)(/*5287*//*5287*/cons/*<5287*//*5287*/(/*9602*//*9611*/$co/*<9611*//*9602*/(/*9612*/"valueToString"/*<9612*/)(/*9614*//*9615*/generic/*<9615*//*9614*/(/*9616*//*9616*/cons/*<9616*//*9616*/(/*9617*/"v"/*<9617*/)(/*9616*/nil/*<9616*/)/*<9616*/)(/*9619*//*9620*/tfns/*<9620*//*9619*/(/*9621*//*9621*/cons/*<9621*//*9621*/(/*9622*//*9623*/vbl/*<9623*//*9622*/(/*9624*/"v"/*<9624*/)/*<9622*/)(/*9621*/nil/*<9621*/)/*<9621*/)(/*9627*/tstring/*<9627*/)/*<9619*/)/*<9614*/)/*<9602*/)(/*5287*//*5287*/cons/*<5287*//*5287*/(/*9628*//*9629*/$co/*<9629*//*9628*/(/*9630*/"eval"/*<9630*/)(/*9632*//*9633*/generic/*<9633*//*9632*/(/*9635*//*9635*/cons/*<9635*//*9635*/(/*9636*/"v"/*<9636*/)(/*9635*/nil/*<9635*/)/*<9635*/)(/*9638*//*9639*/tfns/*<9639*//*9638*/(/*9640*//*9640*/cons/*<9640*//*9640*/(/*9641*//*9642*/tcon/*<9642*//*9641*/(/*9643*/"string"/*<9643*/)(/*9645*/-1/*<9645*/)/*<9641*/)(/*9640*/nil/*<9640*/)/*<9640*/)(/*9646*//*9647*/vbl/*<9647*//*9646*/(/*9648*/"v"/*<9648*/)/*<9646*/)/*<9638*/)/*<9632*/)/*<9628*/)(/*5287*//*5287*/cons/*<5287*//*5287*/(/*11819*//*11820*/$co/*<11820*//*11819*/(/*11821*/"errorToString"/*<11821*/)(/*11823*//*11824*/generic/*<11824*//*11823*/(/*11825*//*11825*/cons/*<11825*//*11825*/(/*11826*/"v"/*<11826*/)(/*11825*/nil/*<11825*/)/*<11825*/)(/*11828*//*11829*/tfns/*<11829*//*11828*/(/*11830*//*11830*/cons/*<11830*//*11830*/(/*11840*//*11841*/tfns/*<11841*//*11840*/(/*11842*//*11842*/cons/*<11842*//*11842*/(/*11843*//*11845*/vbl/*<11845*//*11843*/(/*11846*/"v"/*<11846*/)/*<11843*/)(/*11842*/nil/*<11842*/)/*<11842*/)(/*11850*/tstring/*<11850*/)/*<11840*/)(/*11830*//*11830*/cons/*<11830*//*11830*/(/*11831*//*11855*/vbl/*<11855*//*11831*/(/*11856*/"v"/*<11856*/)/*<11831*/)(/*11830*/nil/*<11830*/)/*<11830*/)/*<11830*/)(/*11836*/tstring/*<11836*/)/*<11828*/)/*<11823*/)/*<11819*/)(/*5287*//*5287*/cons/*<5287*//*5287*/(/*9651*//*9652*/$co/*<9652*//*9651*/(/*9653*/"sanitize"/*<9653*/)(/*9655*//*9656*/concrete/*<9656*//*9655*/(/*9657*//*9658*/tfns/*<9658*//*9657*/(/*9659*//*9659*/cons/*<9659*//*9659*/(/*9661*/tstring/*<9661*/)(/*9659*/nil/*<9659*/)/*<9659*/)(/*9662*/tstring/*<9662*/)/*<9657*/)/*<9655*/)/*<9651*/)(/*5287*//*5287*/cons/*<5287*//*5287*/(/*9663*//*9664*/$co/*<9664*//*9663*/(/*9665*/"replace-all"/*<9665*/)(/*9667*//*9668*/concrete/*<9668*//*9667*/(/*9669*//*9670*/tfns/*<9670*//*9669*/(/*9671*//*9671*/cons/*<9671*//*9671*/(/*9672*/tstring/*<9672*/)(/*9671*//*9671*/cons/*<9671*//*9671*/(/*9673*/tstring/*<9673*/)(/*9671*//*9671*/cons/*<9671*//*9671*/(/*10641*/tstring/*<10641*/)(/*9671*/nil/*<9671*/)/*<9671*/)/*<9671*/)/*<9671*/)(/*9674*/tstring/*<9674*/)/*<9669*/)/*<9667*/)/*<9663*/)(/*5287*//*5287*/cons/*<5287*//*5287*/(/*9675*//*9676*/$co/*<9676*//*9675*/(/*9677*/"fatal"/*<9677*/)(/*9679*//*9680*/generic/*<9680*//*9679*/(/*9681*//*9681*/cons/*<9681*//*9681*/(/*9682*/"v"/*<9682*/)(/*9681*/nil/*<9681*/)/*<9681*/)(/*9684*//*9685*/tfns/*<9685*//*9684*/(/*9686*//*9686*/cons/*<9686*//*9686*/(/*9687*/tstring/*<9687*/)(/*9686*/nil/*<9686*/)/*<9686*/)(/*9688*//*9689*/vbl/*<9689*//*9688*/(/*9690*/"v"/*<9690*/)/*<9688*/)/*<9684*/)/*<9679*/)/*<9675*/)(/*5287*/nil/*<5287*/)/*<5287*/)/*<5287*/)/*<5287*/)/*<5287*/)/*<5287*/)/*<5287*/)/*<5287*/)/*<5287*/)/*<5287*/)/*<5287*/)/*<5287*/)/*<5287*/)/*<5287*/)/*<5287*/)/*<5287*/)/*<5287*/)/*<5287*/)/*<5287*/)/*<5287*/)/*<5287*/)/*<5287*/)/*<5287*/)/*<5287*/)/*<5287*/)/*<5287*/)/*<5287*/)/*<5287*/)/*<5287*/)/*<5287*/)/*<5287*/)/*<5287*/)/*<5287*/)/*<5287*/)/*<5287*/)/*<5287*/)/*<5287*/)/*<5287*/)/*<5287*/)/*<5287*/)/*<5287*/)/*<5282*/)(/*5285*//*11016*/map$slfrom_list/*<11016*//*5285*/(/*11017*//*11017*/cons/*<11017*//*11017*/(/*11018*//*11019*/$co/*<11019*//*11018*/(/*11020*/"()"/*<11020*/)(/*11022*//*11023*/tconstructor/*<11023*//*11022*/(/*11024*/set$slnil/*<11024*/)(/*11025*/nil/*<11025*/)(/*11026*//*11027*/tcon/*<11027*//*11026*/(/*11028*/"()"/*<11028*/)(/*11030*/-1/*<11030*/)/*<11026*/)/*<11022*/)/*<11018*/)(/*11017*/nil/*<11017*/)/*<11017*/)/*<5285*/)(/*5284*//*14952*/map$slfrom_list/*<14952*//*5284*/(/*14953*//*14953*/cons/*<14953*//*14953*/(/*14954*//*14955*/$co/*<14955*//*14954*/(/*14956*/"int"/*<14956*/)(/*14958*//*14959*/$co/*<14959*//*14958*/(/*14960*/0/*<14960*/)(/*14961*/set$slnil/*<14961*/)/*<14958*/)/*<14954*/)(/*14953*//*14953*/cons/*<14953*//*14953*/(/*16209*//*16210*/$co/*<16210*//*16209*/(/*16211*/"float"/*<16211*/)(/*16213*//*16214*/$co/*<16214*//*16213*/(/*16215*/0/*<16215*/)(/*16216*/set$slnil/*<16216*/)/*<16213*/)/*<16209*/)(/*14953*//*14953*/cons/*<14953*//*14953*/(/*14962*//*14963*/$co/*<14963*//*14962*/(/*14964*/"string"/*<14964*/)(/*14966*//*14967*/$co/*<14967*//*14966*/(/*14968*/0/*<14968*/)(/*14969*/set$slnil/*<14969*/)/*<14966*/)/*<14962*/)(/*14953*//*14953*/cons/*<14953*//*14953*/(/*14973*//*14974*/$co/*<14974*//*14973*/(/*14975*/"bool"/*<14975*/)(/*14977*//*14979*/$co/*<14979*//*14977*/(/*14980*/0/*<14980*/)(/*14981*/set$slnil/*<14981*/)/*<14977*/)/*<14973*/)(/*14953*//*14953*/cons/*<14953*//*14953*/(/*15172*//*15173*/$co/*<15173*//*15172*/(/*15174*/"map"/*<15174*/)(/*15176*//*15177*/$co/*<15177*//*15176*/(/*15178*/2/*<15178*/)(/*15179*/set$slnil/*<15179*/)/*<15176*/)/*<15172*/)(/*14953*//*14953*/cons/*<14953*//*14953*/(/*15180*//*15181*/$co/*<15181*//*15180*/(/*15182*/"set"/*<15182*/)(/*15184*//*15185*/$co/*<15185*//*15184*/(/*15186*/1/*<15186*/)(/*15187*/set$slnil/*<15187*/)/*<15184*/)/*<15180*/)(/*14953*//*14953*/cons/*<14953*//*14953*/(/*14982*//*14983*/$co/*<14983*//*14982*/(/*14984*/"->"/*<14984*/)(/*14988*//*14986*/$co/*<14986*//*14988*/(/*14989*/2/*<14989*/)(/*14987*/set$slnil/*<14987*/)/*<14988*/)/*<14982*/)(/*14953*/nil/*<14953*/)/*<14953*/)/*<14953*/)/*<14953*/)/*<14953*/)/*<14953*/)/*<14953*/)/*<14953*/)/*<5284*/)(/*13334*/map$slnil/*<13334*/)/*<5255*/)(/*5256*//*5256*/cons/*<5256*//*5256*/(/*5313*/{"0":",","1":5319,"2":{"0":{"0":"a","1":5320,"type":","},"1":{"0":{"0":"b","1":5321,"type":","},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"3":{"0":{"0":",","1":5323,"2":{"0":{"0":"a","1":5324,"type":"tcon"},"1":{"0":{"0":"b","1":5325,"type":"tcon"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"3":5322,"type":",,,"},"1":{"type":"nil"},"type":"cons"},"4":5316,"type":"sdeftype"}/*<5313*/)(/*5256*//*5256*/cons/*<5256*//*5256*/(/*5329*/{"0":",,","1":5335,"2":{"0":{"0":"a","1":5336,"type":","},"1":{"0":{"0":"b","1":5337,"type":","},"1":{"0":{"0":"c","1":5338,"type":","},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"type":"cons"},"3":{"0":{"0":",,","1":5340,"2":{"0":{"0":"a","1":5343,"type":"tcon"},"1":{"0":{"0":"b","1":5344,"type":"tcon"},"1":{"0":{"0":"c","1":5345,"type":"tcon"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"type":"cons"},"3":5339,"type":",,,"},"1":{"type":"nil"},"type":"cons"},"4":5332,"type":"sdeftype"}/*<5329*/)(/*5256*//*5256*/cons/*<5256*//*5256*/(/*5346*/{"0":",,,","1":5351,"2":{"0":{"0":"a","1":5352,"type":","},"1":{"0":{"0":"b","1":5353,"type":","},"1":{"0":{"0":"c","1":5354,"type":","},"1":{"0":{"0":"d","1":5355,"type":","},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"type":"cons"},"type":"cons"},"3":{"0":{"0":",,,","1":5357,"2":{"0":{"0":"a","1":5358,"type":"tcon"},"1":{"0":{"0":"b","1":5359,"type":"tcon"},"1":{"0":{"0":"c","1":5360,"type":"tcon"},"1":{"0":{"0":"d","1":5361,"type":"tcon"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"type":"cons"},"type":"cons"},"3":5356,"type":",,,"},"1":{"type":"nil"},"type":"cons"},"4":5348,"type":"sdeftype"}/*<5346*/)(/*5256*//*5256*/cons/*<5256*//*5256*/(/*5362*/{"0":",,,,","1":5367,"2":{"0":{"0":"a","1":5368,"type":","},"1":{"0":{"0":"b","1":5369,"type":","},"1":{"0":{"0":"c","1":5370,"type":","},"1":{"0":{"0":"d","1":5371,"type":","},"1":{"0":{"0":"e","1":5372,"type":","},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"type":"cons"},"type":"cons"},"type":"cons"},"3":{"0":{"0":",,,,","1":5374,"2":{"0":{"0":"a","1":5375,"type":"tcon"},"1":{"0":{"0":"b","1":5376,"type":"tcon"},"1":{"0":{"0":"c","1":5377,"type":"tcon"},"1":{"0":{"0":"d","1":5378,"type":"tcon"},"1":{"0":{"0":"e","1":5379,"type":"tcon"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"type":"cons"},"type":"cons"},"type":"cons"},"3":5373,"type":",,,"},"1":{"type":"nil"},"type":"cons"},"4":5364,"type":"sdeftype"}/*<5362*/)(/*5256*//*5256*/cons/*<5256*//*5256*/(/*11387*/{"0":"trace-fmt","1":11392,"2":{"0":{"0":"a","1":11393,"type":","},"1":{"type":"nil"},"type":"cons"},"3":{"0":{"0":"tcolor","1":11395,"2":{"0":{"0":"string","1":11396,"type":"tcon"},"1":{"type":"nil"},"type":"cons"},"3":11394,"type":",,,"},"1":{"0":{"0":"tbold","1":11398,"2":{"0":{"0":"bool","1":11399,"type":"tcon"},"1":{"type":"nil"},"type":"cons"},"3":11397,"type":",,,"},"1":{"0":{"0":"titalic","1":11401,"2":{"0":{"0":"bool","1":11402,"type":"tcon"},"1":{"type":"nil"},"type":"cons"},"3":11400,"type":",,,"},"1":{"0":{"0":"tflash","1":11404,"2":{"0":{"0":"bool","1":11405,"type":"tcon"},"1":{"type":"nil"},"type":"cons"},"3":11403,"type":",,,"},"1":{"0":{"0":"ttext","1":11407,"2":{"0":{"0":"string","1":11408,"type":"tcon"},"1":{"type":"nil"},"type":"cons"},"3":11406,"type":",,,"},"1":{"0":{"0":"tval","1":11410,"2":{"0":{"0":"a","1":11411,"type":"tcon"},"1":{"type":"nil"},"type":"cons"},"3":11409,"type":",,,"},"1":{"0":{"0":"tloc","1":11566,"2":{"0":{"0":"int","1":11567,"type":"tcon"},"1":{"type":"nil"},"type":"cons"},"3":11565,"type":",,,"},"1":{"0":{"0":"tnamed","1":11569,"2":{"0":{"0":{"0":"trace-fmt","1":11571,"type":"tcon"},"1":{"0":"a","1":11572,"type":"tcon"},"2":11570,"type":"tapp"},"1":{"type":"nil"},"type":"cons"},"3":11568,"type":",,,"},"1":{"0":{"0":"tfmted","1":11413,"2":{"0":{"0":"a","1":11414,"type":"tcon"},"1":{"0":{"0":"string","1":11415,"type":"tcon"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"3":11412,"type":",,,"},"1":{"0":{"0":"tfmt","1":11417,"2":{"0":{"0":"a","1":11418,"type":"tcon"},"1":{"0":{"0":{"0":{"0":"->","1":-1,"type":"tcon"},"1":{"0":"a","1":11422,"type":"tcon"},"2":-1,"type":"tapp"},"1":{"0":"string","1":11423,"type":"tcon"},"2":-1,"type":"tapp"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"3":11416,"type":",,,"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"type":"cons"},"type":"cons"},"type":"cons"},"type":"cons"},"type":"cons"},"type":"cons"},"type":"cons"},"type":"cons"},"4":11389,"type":"sdeftype"}/*<11387*/)(/*5256*/nil/*<5256*/)/*<5256*/)/*<5256*/)/*<5256*/)/*<5256*/)/*<5256*/)(/*5257*/function name_5257(tenv) { return function name_5257(stmt) { return /*15410*//*15411*/tenv$slmerge/*<15411*//*15410*/(/*15412*/tenv/*<15412*/)(/*17355*//*17356*/force/*<17356*//*17355*/(/*18621*/type_error_$gts/*<18621*/)(/*17357*//*17358*/run$slnil_$gt/*<17358*//*17357*/(/*15413*//*15414*/infer_stmtss/*<15414*//*15413*/(/*15415*/tenv/*<15415*/)(/*15416*//*15416*/cons/*<15416*//*15416*/(/*15417*/stmt/*<15417*/)(/*15416*/nil/*<15416*/)/*<15416*/)/*<15413*/)/*<17357*/)/*<17355*/)/*<15410*/ } }/*<5257*/)/*<5253*/
};
throw new Error('let pattern not matched 9425. ' + valueToString($target));})(/*!*/)
};
throw new Error('let pattern not matched 9417. ' + valueToString($target));})(/*!*/)
};
throw new Error('let pattern not matched 9316. ' + valueToString($target));})(/*!*/)
};
throw new Error('let pattern not matched 9247. ' + valueToString($target));})(/*!*/)
};
throw new Error('let pattern not matched 9242. ' + valueToString($target));})(/*!*/)/*<9239*/;

const several = /*6650*/function name_6650(tenv) { return function name_6650(stmts) { return /*6659*/(function match_6659($target) {
if ($target.type === "nil") {
return /*6689*//*6690*/$lt_err/*<6690*//*6689*/(/*18632*//*18633*/type_error/*<18633*//*18632*/(/*6691*/"Final stmt should be an expr"/*<6691*/)(/*18634*/nil/*<18634*/)/*<18632*/)/*<6689*/
}
if ($target.type === "cons") {
if ($target[0].type === "sexpr") {
{
let expr = $target[0][0];
if ($target[1].type === "nil") {
return /*17290*//*17291*/$gt$gt$eq/*<17291*//*17290*/(/*17294*//*17295*/idx_$gt/*<17295*//*17294*/(/*17296*/0/*<17296*/)/*<17294*/)(/*17290*/function name_17290(_) { return /*6667*//*6668*/infer/*<6668*//*6667*/(/*6669*/tenv/*<6669*/)(/*6671*/expr/*<6671*/)/*<6667*/ }/*<17290*/)/*<17290*/
}
}
}
}
if ($target.type === "cons") {
{
let one = $target[0];
{
let rest = $target[1];
return /*17297*//*17298*/$gt$gt$eq/*<17298*//*17297*/(/*17302*//*17303*/infer_stmtss/*<17303*//*17302*/(/*17304*/tenv/*<17304*/)(/*17305*//*17305*/cons/*<17305*//*17305*/(/*17306*/one/*<17306*/)(/*17305*/nil/*<17305*/)/*<17305*/)/*<17302*/)(/*17297*/function name_17297(tenv$qu) { return /*6678*//*6679*/several/*<6679*//*6678*/(/*11666*//*11667*/tenv$slmerge/*<11667*//*11666*/(/*11668*/tenv/*<11668*/)(/*6680*/tenv$qu/*<6680*/)/*<11666*/)(/*6687*/rest/*<6687*/)/*<6678*/ }/*<17297*/)/*<17297*/
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 6659');})(/*!*//*6661*/stmts/*<6661*/)/*<6659*/ } }/*<6650*/;

const infer_stmts = /*10723*/function name_10723(tenv) { return function name_10723(stmts) { return /*10730*//*10731*/foldl_$gt/*<10731*//*10730*/(/*10732*/tenv/*<10732*/)(/*10733*/stmts/*<10733*/)(/*10734*/function name_10734(tenv) { return function name_10734(stmt) { return /*17324*//*17325*/$gt$gt$eq/*<17325*//*17324*/(/*17329*//*17330*//*17331*/infer_stmtss/*<17331*//*17330*/(/*17332*/tenv/*<17332*/)(/*17333*//*17333*/cons/*<17333*//*17333*/(/*17334*/stmt/*<17334*/)(/*17333*/nil/*<17333*/)/*<17333*/)/*<17330*//*17329*//*<17329*/)(/*17324*/function name_17324(tenv$qu) { return /*17335*//*17336*/$lt_/*<17336*//*17335*/(/*15424*//*15425*/tenv$slmerge/*<15425*//*15424*/(/*15426*/tenv/*<15426*/)(/*15427*/tenv$qu/*<15427*/)/*<15424*/)/*<17335*/ }/*<17324*/)/*<17324*/ } }/*<10734*/)/*<10730*/ } }/*<10723*/;

return /*11773*//*11778*//*11779*/eval/*<11779*//*11778*/(/*11775*/"({0: {0: env_nil, 1: infer_stmts,  2: add_stmt,  3: infer, 4: infer_stmts2},\n  1: {0: externals_stmt, 1: externals_expr, 2: names},\n  2: type_to_string, 3: get_type\n }) => ({type: 'fns',\n   env_nil, infer_stmts, infer_stmts2, add_stmt, infer, externals_stmt, externals_expr, names, type_to_string, get_type \n }) "/*<11775*/)/*<11778*//*11773*/(/*4983*//*5008*/typecheck/*<5008*//*4983*/(/*11753*//*11754*/inference/*<11754*//*11753*/(/*11766*/builtin_env/*<11766*/)(/*17360*/function name_17360(tenv) { return function name_17360(stmts) { return /*17367*//*17361*/force/*<17361*//*17367*/(/*18636*/type_error_$gts/*<18636*/)(/*17369*//*17368*/run$slnil_$gt/*<17368*//*17369*/(/*17371*//*17370*/infer_stmtss/*<17370*//*17371*/(/*17372*/tenv/*<17372*/)(/*17373*/stmts/*<17373*/)/*<17371*/)/*<17369*/)/*<17367*/ } }/*<17360*/)(/*11765*/tenv$slmerge/*<11765*/)(/*17375*/function name_17375(tenv) { return function name_17375(expr) { return /*17381*//*17376*/force/*<17376*//*17381*/(/*18637*/type_error_$gts/*<18637*/)(/*17383*//*17382*/run$slnil_$gt/*<17382*//*17383*/(/*17385*//*17384*/infer/*<17384*//*17385*/(/*17386*/tenv/*<17386*/)(/*17387*/expr/*<17387*/)/*<17385*/)/*<17383*/)/*<17381*/ } }/*<17375*/)(/*18344*/function name_18344(tenv) { return function name_18344(stmts) { return /*18357*/(function let_18357() {const $target = /*18349*//*18366*//*18367*/state_f/*<18367*//*18366*/(/*18353*//*18354*/infer_stmtss/*<18354*//*18353*/(/*18355*/tenv/*<18355*/)(/*18356*/stmts/*<18356*/)/*<18353*/)/*<18366*//*18349*/(/*18369*/state$slnil/*<18369*/)/*<18349*/;
if ($target.type === ",") {
if ($target[0].type === ",") {
{
let types = $target[0][1];
{
let tenv = $target[1];
return /*18365*//*18411*/$co$co/*<18411*//*18365*/(/*18412*/(function match_18412($target) {
if ($target.type === "ok") {
{
let tenv = $target[0];
return /*18418*//*18419*/ok/*<18419*//*18418*/(/*18420*//*18421*/$co/*<18421*//*18420*/(/*18422*/tenv/*<18422*/)(/*18423*/nil/*<18423*/)/*<18420*/)/*<18418*/
}
}
if ($target.type === "err") {
{
let e = $target[0];
return /*18429*//*18430*/err/*<18430*//*18429*/(/*18431*/e/*<18431*/)/*<18429*/
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 18412');})(/*!*//*18414*/tenv/*<18414*/)/*<18412*/)(/*18435*/types/*<18435*/)(/*18436*//*18437*/$co/*<18437*//*18436*/(/*18438*/nil/*<18438*/)(/*18439*/nil/*<18439*/)/*<18436*/)/*<18365*/
}
}
}
};
throw new Error('let pattern not matched 18361. ' + valueToString($target));})(/*!*/)/*<18357*/ } }/*<18344*/)/*<11753*/)(/*11755*//*7376*/analysis/*<7376*//*11755*/(/*11756*/externals_stmt/*<11756*/)(/*15633*/externals_list/*<15633*/)(/*7573*/names/*<7573*/)/*<11755*/)(/*11764*/type_to_string/*<11764*/)(/*10087*/function name_10087(tenv) { return function name_10087(name) { return /*10103*/(function match_10103($target) {
if ($target.type === "some") {
{
let v = $target[0];
return /*10113*//*10114*/some/*<10114*//*10113*/(/*10115*//*10116*/scheme$sltype/*<10116*//*10115*/(/*10117*/v/*<10117*/)/*<10115*/)/*<10113*/
}
}
return /*10118*//*10119*/none/*<10119*//*10118*//*<10118*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 10103');})(/*!*//*10105*//*10106*/tenv$sltype/*<10106*//*10105*/(/*10107*/tenv/*<10107*/)(/*10108*/name/*<10108*/)/*<10105*/)/*<10103*/ } }/*<10087*/)/*<4983*/)/*<11773*/