const some = (v0) => ({type: "some", 0: v0});
const none = ({type: "none"});
const at = /*5746*/function name_5746(arr) { return /*5746*/function name_5746(i) { return /*5746*/function name_5746(default_) { return /*5753*/(function match_5753($target) {
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
return /*5785*//*5785*//*5785*//*5786*/at/*<5786*/(/*5785*//*5787*/rest/*<5787*/)/*<5785*/(/*5785*//*5788*//*5788*//*5789*/_/*<5789*/(/*5788*//*5790*/i/*<5790*/)/*<5788*/(/*5788*//*5791*/1/*<5791*/)/*<5788*/)/*<5785*/(/*5785*//*5792*/default_/*<5792*/)/*<5785*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 5776');})(/*!*//*5778*//*5778*//*5781*/$eq/*<5781*/(/*5778*//*5782*/i/*<5782*/)/*<5778*/(/*5778*//*5783*/0/*<5783*/)/*<5778*/)/*<5776*/
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 5753');})(/*!*//*5766*/arr/*<5766*/)/*<5753*/ }/*<5746*/ }/*<5746*/ }/*<5746*/;

const rev = /*6057*/function name_6057(arr) { return /*6057*/function name_6057(col) { return /*6063*/(function match_6063($target) {
if ($target.type === "nil") {
return /*6067*/col/*<6067*/
}
if ($target.type === "cons") {
{
let one = $target[0];
if ($target[1].type === "nil") {
return /*6070*//*6070*//*6070*/cons/*<6070*/(/*6070*//*6071*/one/*<6071*/)/*<6070*/(/*6070*//*6082*/col/*<6082*/)/*<6070*/
}
}
}
if ($target.type === "cons") {
{
let one = $target[0];
{
let rest = $target[1];
return /*6078*//*6078*//*6079*/rev/*<6079*/(/*6078*//*6080*/rest/*<6080*/)/*<6078*/(/*6078*//*6086*//*6086*//*6086*/cons/*<6086*/(/*6086*//*6087*/one/*<6087*/)/*<6086*/(/*6086*//*6088*/col/*<6088*/)/*<6086*/)/*<6078*/
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 6063');})(/*!*//*6065*/arr/*<6065*/)/*<6063*/ }/*<6057*/ }/*<6057*/;

const join = /*5929*/function name_5929(sep) { return /*5929*/function name_5929(arr) { return /*5939*/(function match_5939($target) {
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
return /*5953*/`${/*5955*/one/*<5955*/}${/*5957*/sep/*<5957*/}${/*5959*//*5959*//*5961*/join/*<5961*/(/*5959*//*5962*/sep/*<5962*/)/*<5959*/(/*5959*//*5963*/rest/*<5963*/)/*<5959*/}`/*<5953*/
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 5939');})(/*!*//*5943*/arr/*<5943*/)/*<5939*/ }/*<5929*/ }/*<5929*/;

const map = /*1005*/function name_1005(values) { return /*1005*/function name_1005(f) { return /*1012*/(function match_1012($target) {
if ($target.type === "nil") {
return /*1016*/nil/*<1016*/
}
if ($target.type === "cons") {
{
let one = $target[0];
{
let rest = $target[1];
return /*1023*//*1023*//*1023*/cons/*<1023*/(/*1023*//*1024*//*1025*/f/*<1025*/(/*1024*//*1026*/one/*<1026*/)/*<1024*/)/*<1023*/(/*1023*//*1027*//*1027*//*1031*/map/*<1031*/(/*1027*//*1032*/rest/*<1032*/)/*<1027*/(/*1027*//*1033*/f/*<1033*/)/*<1027*/)/*<1023*/
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 1012');})(/*!*//*1014*/values/*<1014*/)/*<1012*/ }/*<1005*/ }/*<1005*/;

const mapi = /*1034*/function name_1034(i) { return /*1034*/function name_1034(values) { return /*1034*/function name_1034(f) { return /*1042*/(function match_1042($target) {
if ($target.type === "nil") {
return /*1046*/nil/*<1046*/
}
if ($target.type === "cons") {
{
let one = $target[0];
{
let rest = $target[1];
return /*1053*//*1053*//*1053*/cons/*<1053*/(/*1053*//*1054*//*1054*//*1055*/f/*<1055*/(/*1054*//*1056*/i/*<1056*/)/*<1054*/(/*1054*//*1057*/one/*<1057*/)/*<1054*/)/*<1053*/(/*1053*//*1058*//*1058*//*1058*//*1062*/mapi/*<1062*/(/*1058*//*1063*//*1063*//*1064*/$pl/*<1064*/(/*1063*//*1065*/1/*<1065*/)/*<1063*/(/*1063*//*1066*/i/*<1066*/)/*<1063*/)/*<1058*/(/*1058*//*1067*/rest/*<1067*/)/*<1058*/(/*1058*//*1068*/f/*<1068*/)/*<1058*/)/*<1053*/
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 1042');})(/*!*//*1044*/values/*<1044*/)/*<1042*/ }/*<1034*/ }/*<1034*/ }/*<1034*/;

const zip = /*3516*/function name_3516(one) { return /*3516*/function name_3516(two) { return /*3523*/(function match_3523($target) {
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
return /*3561*//*3561*//*3561*/cons/*<3561*/(/*3561*//*3562*//*3562*//*3563*/$co/*<3563*/(/*3562*//*3564*/a/*<3564*/)/*<3562*/(/*3562*//*3565*/b/*<3565*/)/*<3562*/)/*<3561*/(/*3561*//*3566*//*3566*//*3570*/zip/*<3570*/(/*3566*//*3571*/one/*<3571*/)/*<3566*/(/*3566*//*3572*/two/*<3572*/)/*<3566*/)/*<3561*/
}
}
}
}
}
}
}
return /*3576*/nil/*<3576*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 3523');})(/*!*//*3525*//*3525*//*3526*/$co/*<3526*/(/*3525*//*3527*/one/*<3527*/)/*<3525*/(/*3525*//*3528*/two/*<3528*/)/*<3525*/)/*<3523*/ }/*<3516*/ }/*<3516*/;

const foldl = /*1069*/function name_1069(init) { return /*1069*/function name_1069(items) { return /*1069*/function name_1069(f) { return /*1077*/(function match_1077($target) {
if ($target.type === "nil") {
return /*1081*/init/*<1081*/
}
if ($target.type === "cons") {
{
let one = $target[0];
{
let rest = $target[1];
return /*1088*//*1088*//*1088*//*1089*/foldl/*<1089*/(/*1088*//*1090*//*1090*//*1091*/f/*<1091*/(/*1090*//*1092*/init/*<1092*/)/*<1090*/(/*1090*//*1093*/one/*<1093*/)/*<1090*/)/*<1088*/(/*1088*//*1094*/rest/*<1094*/)/*<1088*/(/*1088*//*1095*/f/*<1095*/)/*<1088*/
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 1077');})(/*!*//*1079*/items/*<1079*/)/*<1077*/ }/*<1069*/ }/*<1069*/ }/*<1069*/;

const foldr = /*1106*/function name_1106(init) { return /*1106*/function name_1106(items) { return /*1106*/function name_1106(f) { return /*1114*/(function match_1114($target) {
if ($target.type === "nil") {
return /*1118*/init/*<1118*/
}
if ($target.type === "cons") {
{
let one = $target[0];
{
let rest = $target[1];
return /*1125*//*1125*//*1126*/f/*<1126*/(/*1125*//*1127*//*1127*//*1127*//*1128*/foldr/*<1128*/(/*1127*//*1129*/init/*<1129*/)/*<1127*/(/*1127*//*1130*/rest/*<1130*/)/*<1127*/(/*1127*//*1131*/f/*<1131*/)/*<1127*/)/*<1125*/(/*1125*//*1132*/one/*<1132*/)/*<1125*/
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 1114');})(/*!*//*1116*/items/*<1116*/)/*<1114*/ }/*<1106*/ }/*<1106*/ }/*<1106*/;

const filter = /*8028*/function name_8028(fn) { return /*8028*/function name_8028(list) { return /*8037*/(function match_8037($target) {
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
return /*8054*//*8054*//*8054*/cons/*<8054*/(/*8054*//*8055*/one/*<8055*/)/*<8054*/(/*8054*//*8056*//*8056*//*8060*/filter/*<8060*/(/*8056*//*8061*/fn/*<8061*/)/*<8056*/(/*8056*//*8062*/rest/*<8062*/)/*<8056*/)/*<8054*/
}
return /*8063*//*8063*//*8064*/filter/*<8064*/(/*8063*//*8065*/fn/*<8065*/)/*<8063*/(/*8063*//*8066*/rest/*<8066*/)/*<8063*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 8049');})(/*!*//*8051*//*8052*/fn/*<8052*/(/*8051*//*8053*/one/*<8053*/)/*<8051*/)/*<8049*/
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 8037');})(/*!*//*8040*/list/*<8040*/)/*<8037*/ }/*<8028*/ }/*<8028*/;

const map_without = /*2665*/function name_2665(map) { return /*2665*/function name_2665(set) { return /*2672*//*2672*//*2672*//*2673*/foldr/*<2673*/(/*2672*//*2674*/map/*<2674*/)/*<2672*/(/*2672*//*2675*//*2676*/set$slto_list/*<2676*/(/*2675*//*2678*/set/*<2678*/)/*<2675*/)/*<2672*/(/*2672*//*2679*/map$slrm/*<2679*/)/*<2672*/ }/*<2665*/ }/*<2665*/;

const eprim = (v0) => (v1) => ({type: "eprim", 0: v0, 1: v1});
const estr = (v0) => (v1) => (v2) => ({type: "estr", 0: v0, 1: v1, 2: v2});
const evar = (v0) => (v1) => ({type: "evar", 0: v0, 1: v1});
const equot = (v0) => (v1) => ({type: "equot", 0: v0, 1: v1});
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
const type_with_free = /*5172*/function name_5172(type) { return /*5172*/function name_5172(free) { return /*5179*/(function match_5179($target) {
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
return /*5198*//*5198*//*5199*/tvar/*<5199*/(/*5198*//*5200*/s/*<5200*/)/*<5198*/(/*5198*//*5201*/l/*<5201*/)/*<5198*/
}
return /*5202*/type/*<5202*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 5191');})(/*!*//*5193*//*5193*//*5195*/set$slhas/*<5195*/(/*5193*//*5196*/free/*<5196*/)/*<5193*/(/*5193*//*5197*/s/*<5197*/)/*<5193*/)/*<5191*/
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
return /*5209*//*5209*//*5209*//*5210*/tapp/*<5210*/(/*5209*//*5211*//*5211*//*5212*/type_with_free/*<5212*/(/*5211*//*5213*/a/*<5213*/)/*<5211*/(/*5211*//*5214*/free/*<5214*/)/*<5211*/)/*<5209*/(/*5209*//*5215*//*5215*//*5216*/type_with_free/*<5216*/(/*5215*//*5217*/b/*<5217*/)/*<5215*/(/*5215*//*5218*/free/*<5218*/)/*<5215*/)/*<5209*/(/*5209*//*5219*/l/*<5219*/)/*<5209*/
}
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 5179');})(/*!*//*5181*/type/*<5181*/)/*<5179*/ }/*<5172*/ }/*<5172*/;

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

const letters = /*5798*//*5798*//*5798*/cons/*<5798*/(/*5798*//*5799*/"a"/*<5799*/)/*<5798*/(/*5798*//*5798*//*5798*//*5798*/cons/*<5798*/(/*5798*//*5801*/"b"/*<5801*/)/*<5798*/(/*5798*//*5798*//*5798*//*5798*/cons/*<5798*/(/*5798*//*5803*/"c"/*<5803*/)/*<5798*/(/*5798*//*5798*//*5798*//*5798*/cons/*<5798*/(/*5798*//*5805*/"d"/*<5805*/)/*<5798*/(/*5798*//*5798*//*5798*//*5798*/cons/*<5798*/(/*5798*//*5807*/"e"/*<5807*/)/*<5798*/(/*5798*//*5798*//*5798*//*5798*/cons/*<5798*/(/*5798*//*5809*/"f"/*<5809*/)/*<5798*/(/*5798*//*5798*//*5798*//*5798*/cons/*<5798*/(/*5798*//*5811*/"g"/*<5811*/)/*<5798*/(/*5798*//*5798*//*5798*//*5798*/cons/*<5798*/(/*5798*//*5813*/"h"/*<5813*/)/*<5798*/(/*5798*//*5798*//*5798*//*5798*/cons/*<5798*/(/*5798*//*5815*/"i"/*<5815*/)/*<5798*/(/*5798*//*5798*//*5798*//*5798*/cons/*<5798*/(/*5798*//*6782*/"j"/*<6782*/)/*<5798*/(/*5798*//*5798*//*5798*//*5798*/cons/*<5798*/(/*5798*//*6784*/"k"/*<6784*/)/*<5798*/(/*5798*//*5798*//*5798*//*5798*/cons/*<5798*/(/*5798*//*6786*/"l"/*<6786*/)/*<5798*/(/*5798*//*5798*//*5798*//*5798*/cons/*<5798*/(/*5798*//*6788*/"m"/*<6788*/)/*<5798*/(/*5798*//*5798*//*5798*//*5798*/cons/*<5798*/(/*5798*//*6790*/"n"/*<6790*/)/*<5798*/(/*5798*//*5798*//*5798*//*5798*/cons/*<5798*/(/*5798*//*6792*/"o"/*<6792*/)/*<5798*/(/*5798*//*5798*/nil/*<5798*/)/*<5798*/)/*<5798*/)/*<5798*/)/*<5798*/)/*<5798*/)/*<5798*/)/*<5798*/)/*<5798*/)/*<5798*/)/*<5798*/)/*<5798*/)/*<5798*/)/*<5798*/)/*<5798*/)/*<5798*/;

const unwrap_fn = /*5852*/function name_5852(t) { return /*5858*/(function match_5858($target) {
if ($target.type === "tapp") {
if ($target[0].type === "tapp") {
if ($target[0][0].type === "tcon") {
if ($target[0][0][0] === "->"){
{
let a = $target[0][1];
{
let b = $target[1];
return /*5875*/(function let_5875() {const $target = /*5882*//*5883*/unwrap_fn/*<5883*/(/*5882*//*5884*/b/*<5884*/)/*<5882*/;
if ($target.type === ",") {
{
let args = $target[0];
{
let res = $target[1];
return /*5885*//*5885*//*5886*/$co/*<5886*/(/*5885*//*5887*//*5887*//*5887*/cons/*<5887*/(/*5887*//*5888*/a/*<5888*/)/*<5887*/(/*5887*//*5893*/args/*<5893*/)/*<5887*/)/*<5885*/(/*5885*//*5899*/res/*<5899*/)/*<5885*/
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
return /*5901*//*5901*//*5902*/$co/*<5902*/(/*5901*//*5903*/nil/*<5903*/)/*<5901*/(/*5901*//*5904*/t/*<5904*/)/*<5901*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 5858');})(/*!*//*5860*/t/*<5860*/)/*<5858*/ }/*<5852*/;

const unwrap_app = /*6108*/function name_6108(t) { return /*6114*/(function match_6114($target) {
if ($target.type === "tapp") {
{
let a = $target[0];
{
let b = $target[1];
return /*6122*/(function let_6122() {const $target = /*6129*//*6130*/unwrap_app/*<6130*/(/*6129*//*6131*/a/*<6131*/)/*<6129*/;
if ($target.type === ",") {
{
let target = $target[0];
{
let args = $target[1];
return /*6132*//*6132*//*6133*/$co/*<6133*/(/*6132*//*6134*/target/*<6134*/)/*<6132*/(/*6132*//*6135*//*6135*//*6135*/cons/*<6135*/(/*6135*//*6136*/b/*<6136*/)/*<6135*/(/*6135*//*6137*/args/*<6137*/)/*<6135*/)/*<6132*/
}
}
};
throw new Error('let pattern not matched 6125. ' + valueToString($target));})(/*!*/)/*<6122*/
}
}
}
return /*6251*//*6251*//*6252*/$co/*<6252*/(/*6251*//*6253*/t/*<6253*/)/*<6251*/(/*6251*//*6254*/nil/*<6254*/)/*<6251*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 6114');})(/*!*//*6116*/t/*<6116*/)/*<6114*/ }/*<6108*/;

const tts_list = /*6165*/function name_6165(args) { return /*6165*/function name_6165(free) { return /*6174*//*6174*//*6174*//*6175*/foldl/*<6175*/(/*6174*//*6176*//*6176*//*6177*/$co/*<6177*/(/*6176*//*6178*/nil/*<6178*/)/*<6176*/(/*6176*//*6179*/free/*<6179*/)/*<6176*/)/*<6174*/(/*6174*//*6180*/args/*<6180*/)/*<6174*/(/*6174*//*6181*/function name_6181($fn_arg) { return /*6181*/(function match_6181($target) {
if ($target.type === ",") {
{
let args = $target[0];
{
let free = $target[1];
return /*6181*/function name_6181(a) { return /*6189*/(function let_6189() {const $target = /*6196*//*6196*//*6197*/tts_inner/*<6197*/(/*6196*//*6198*/a/*<6198*/)/*<6196*/(/*6196*//*6199*/free/*<6199*/)/*<6196*/;
if ($target.type === ",") {
{
let a = $target[0];
{
let free = $target[1];
return /*6200*//*6200*//*6201*/$co/*<6201*/(/*6200*//*6202*//*6202*//*6202*/cons/*<6202*/(/*6202*//*6203*/a/*<6203*/)/*<6202*/(/*6202*//*6204*/args/*<6204*/)/*<6202*/)/*<6200*/(/*6200*//*6208*/free/*<6208*/)/*<6200*/
}
}
};
throw new Error('let pattern not matched 6192. ' + valueToString($target));})(/*!*/)/*<6189*/ }/*<6181*/
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 6181');})(/*!*//*-1*/$fn_arg/*<-1*/)/*<6181*/ }/*<6181*/)/*<6174*/ }/*<6165*/ }/*<6165*/;

const tts_inner = /*2099*/function name_2099(t) { return /*2099*/function name_2099(free) { return /*2105*/(function match_2105($target) {
if ($target.type === "tvar") {
{
let s = $target[0];
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
return /*5618*//*5618*//*5615*/$co/*<5615*/(/*5618*//*5619*/s/*<5619*/)/*<5618*/(/*5618*//*5620*/free/*<5620*/)/*<5618*/
}
}
{
let none = $target;
return /*5617*/(function let_5617() {const $target = /*5649*//*5649*//*5649*//*5817*/at/*<5817*/(/*5649*//*5818*/letters/*<5818*/)/*<5649*/(/*5649*//*5819*/idx/*<5819*/)/*<5649*/(/*5649*//*5820*/"_too_many_vbls_"/*<5820*/)/*<5649*/;
{
let name = $target;
return /*5653*//*5653*//*5654*/$co/*<5654*/(/*5653*//*5655*/name/*<5655*/)/*<5653*/(/*5653*//*5656*//*5656*//*5657*/$co/*<5657*/(/*5656*//*6367*//*6368*/some/*<6368*/(/*6367*//*5658*//*5658*//*5658*//*5659*/map$slset/*<5659*/(/*5658*//*5660*/fmap/*<5660*/)/*<5658*/(/*5658*//*5661*/s/*<5661*/)/*<5658*/(/*5658*//*5662*/name/*<5662*/)/*<5658*/)/*<6367*/)/*<5656*/(/*5656*//*5663*//*5663*//*5665*/$pl/*<5665*/(/*5663*//*5666*/1/*<5666*/)/*<5663*/(/*5663*//*5667*/idx/*<5667*/)/*<5663*/)/*<5656*/)/*<5653*/
};
throw new Error('let pattern not matched 5648. ' + valueToString($target));})(/*!*/)/*<5617*/
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 2113');})(/*!*//*5605*//*5605*//*5609*/map$slget/*<5609*/(/*5605*//*5610*/fmap/*<5610*/)/*<5605*/(/*5605*//*5611*/s/*<5611*/)/*<5605*/)/*<2113*/
}
}
return /*6392*//*6392*//*6348*/$co/*<6348*/(/*6392*//*6393*/s/*<6393*/)/*<6392*/(/*6392*//*6394*/free/*<6394*/)/*<6392*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 6340');})(/*!*//*6343*/fmap/*<6343*/)/*<6340*/
}
}
};
throw new Error('let pattern not matched 5641. ' + valueToString($target));})(/*!*/)/*<5637*/
}
}
if ($target.type === "tcon") {
{
let s = $target[0];
return /*5672*//*5672*//*2118*/$co/*<2118*/(/*5672*//*5673*/s/*<5673*/)/*<5672*/(/*5672*//*5674*/free/*<5674*/)/*<5672*/
}
}
if ($target.type === "tapp") {
if ($target[0].type === "tapp") {
if ($target[0][0].type === "tcon") {
if ($target[0][0][0] === "->"){
{
let a = $target[0][1];
{
let b = $target[1];
return /*5675*/(function let_5675() {const $target = /*5909*//*5910*/unwrap_fn/*<5910*/(/*5909*//*5911*/b/*<5911*/)/*<5909*/;
if ($target.type === ",") {
{
let args = $target[0];
{
let r = $target[1];
return /*5675*/(function let_5675() {const $target = /*5913*//*5913*//*5913*/cons/*<5913*/(/*5913*//*5914*/a/*<5914*/)/*<5913*/(/*5913*//*5915*/args/*<5915*/)/*<5913*/;
{
let args = $target;
return /*5675*/(function let_5675() {const $target = /*5684*//*5684*//*6209*/tts_list/*<6209*/(/*5684*//*6210*/args/*<6210*/)/*<5684*/(/*5684*//*6211*/free/*<6211*/)/*<5684*/;
if ($target.type === ",") {
{
let args = $target[0];
{
let free = $target[1];
return /*5675*/(function let_5675() {const $target = /*5692*//*5692*//*5693*/tts_inner/*<5693*/(/*5692*//*5694*/r/*<5694*/)/*<5692*/(/*5692*//*5695*/free/*<5695*/)/*<5692*/;
if ($target.type === ",") {
{
let two = $target[0];
{
let free = $target[1];
return /*5696*//*5696*//*5697*/$co/*<5697*/(/*5696*//*2132*/`(fn [${/*5919*//*5919*//*2134*/join/*<2134*/(/*5919*//*5940*/" "/*<5940*/)/*<5919*/(/*5919*//*6100*//*6100*//*6101*/rev/*<6101*/(/*6100*//*5920*/args/*<5920*/)/*<6100*/(/*6100*//*6102*/nil/*<6102*/)/*<6100*/)/*<5919*/}] ${/*2138*/two/*<2138*/})`/*<2132*/)/*<5696*/(/*5696*//*5698*/free/*<5698*/)/*<5696*/
}
}
};
throw new Error('let pattern not matched 5688. ' + valueToString($target));})(/*!*/)/*<5675*/
}
}
};
throw new Error('let pattern not matched 5680. ' + valueToString($target));})(/*!*/)/*<5675*/
};
throw new Error('let pattern not matched 5912. ' + valueToString($target));})(/*!*/)/*<5675*/
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
if ($target.type === "tapp") {
{
let a = $target[0];
{
let b = $target[1];
return /*5699*/(function let_5699() {const $target = /*6142*//*6146*/unwrap_app/*<6146*/(/*6142*//*6147*/a/*<6147*/)/*<6142*/;
if ($target.type === ",") {
{
let target = $target[0];
{
let args = $target[1];
return /*5699*/(function let_5699() {const $target = /*6149*//*6149*//*6149*/cons/*<6149*/(/*6149*//*6150*/b/*<6150*/)/*<6149*/(/*6149*//*6151*/args/*<6151*/)/*<6149*/;
{
let args = $target;
return /*5699*/(function let_5699() {const $target = /*6156*//*6156*//*6157*/rev/*<6157*/(/*6156*//*6158*/args/*<6158*/)/*<6156*/(/*6156*//*6255*/nil/*<6255*/)/*<6156*/;
{
let args = $target;
return /*5699*/(function let_5699() {const $target = /*6164*//*6164*//*6214*/tts_list/*<6214*/(/*6164*//*6215*/args/*<6215*/)/*<6164*/(/*6164*//*6216*/free/*<6216*/)/*<6164*/;
if ($target.type === ",") {
{
let args = $target[0];
{
let free = $target[1];
return /*5699*/(function let_5699() {const $target = /*5714*//*5714*//*5715*/tts_inner/*<5715*/(/*5714*//*5716*/target/*<5716*/)/*<5714*/(/*5714*//*5717*/free/*<5717*/)/*<5714*/;
if ($target.type === ",") {
{
let one = $target[0];
{
let free = $target[1];
return /*5718*//*5718*//*5719*/$co/*<5719*/(/*5718*//*2148*/`(${/*2150*/one/*<2150*/} ${/*2154*//*2154*//*6217*/join/*<6217*/(/*2154*//*6218*/" "/*<6218*/)/*<2154*/(/*2154*//*6220*//*6220*//*6221*/rev/*<6221*/(/*6220*//*6222*/args/*<6222*/)/*<6220*/(/*6220*//*6256*/nil/*<6256*/)/*<6220*/)/*<2154*/})`/*<2148*/)/*<5718*/(/*5718*//*5720*/free/*<5720*/)/*<5718*/
}
}
};
throw new Error('let pattern not matched 5710. ' + valueToString($target));})(/*!*/)/*<5699*/
}
}
};
throw new Error('let pattern not matched 6159. ' + valueToString($target));})(/*!*/)/*<5699*/
};
throw new Error('let pattern not matched 6155. ' + valueToString($target));})(/*!*/)/*<5699*/
};
throw new Error('let pattern not matched 6148. ' + valueToString($target));})(/*!*/)/*<5699*/
}
}
};
throw new Error('let pattern not matched 6141. ' + valueToString($target));})(/*!*/)/*<5699*/
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 2105');})(/*!*//*2107*/t/*<2107*/)/*<2105*/ }/*<2099*/ }/*<2099*/;

const type_to_string = /*5590*/function name_5590(t) { return /*5624*/(function let_5624() {const $target = /*5596*//*5596*//*5597*/tts_inner/*<5597*/(/*5596*//*5598*/t/*<5598*/)/*<5596*/(/*5596*//*5601*//*5601*//*5599*/$co/*<5599*/(/*5601*//*6349*//*5602*/some/*<5602*/(/*6349*//*6350*/map$slnil/*<6350*/)/*<6349*/)/*<5601*/(/*5601*//*5603*/0/*<5603*/)/*<5601*/)/*<5596*/;
if ($target.type === ",") {
{
let text = $target[0];
return /*5636*/text/*<5636*/
}
};
throw new Error('let pattern not matched 5632. ' + valueToString($target));})(/*!*/)/*<5624*/ }/*<5590*/;

const type_to_string_raw = /*6370*/function name_6370(t) { return /*6376*/(function let_6376() {const $target = /*6384*//*6384*//*6385*/tts_inner/*<6385*/(/*6384*//*6386*/t/*<6386*/)/*<6384*/(/*6384*//*6387*//*6387*//*6388*/$co/*<6388*/(/*6387*//*6389*/none/*<6389*/)/*<6387*/(/*6387*//*6390*/0/*<6390*/)/*<6387*/)/*<6384*/;
if ($target.type === ",") {
{
let text = $target[0];
return /*6391*/text/*<6391*/
}
};
throw new Error('let pattern not matched 6380. ' + valueToString($target));})(/*!*/)/*<6376*/ }/*<6370*/;

const scheme = (v0) => (v1) => ({type: "scheme", 0: v0, 1: v1});
const scheme$sltype = /*10092*/function name_10092($fn_arg) { return /*10092*/(function match_10092($target) {
if ($target.type === "scheme") {
{
let type = $target[1];
return /*10102*/type/*<10102*/
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 10092');})(/*!*//*-1*/$fn_arg/*<-1*/)/*<10092*/ }/*<10092*/;

const tconstructor = (v0) => (v1) => (v2) => ({type: "tconstructor", 0: v0, 1: v1, 2: v2});
const tenv = (v0) => (v1) => (v2) => ({type: "tenv", 0: v0, 1: v1, 2: v2});
const tenv$sltype = /*3270*/function name_3270($fn_arg) { return /*3270*/(function match_3270($target) {
if ($target.type === "tenv") {
{
let types = $target[0];
return /*3270*/function name_3270(key) { return /*3281*//*3281*//*3282*/map$slget/*<3282*/(/*3281*//*3283*/types/*<3283*/)/*<3281*/(/*3281*//*3284*/key/*<3284*/)/*<3281*/ }/*<3270*/
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 3270');})(/*!*//*-1*/$fn_arg/*<-1*/)/*<3270*/ }/*<3270*/;

const tenv$slcon = /*3285*/function name_3285($fn_arg) { return /*3285*/(function match_3285($target) {
if ($target.type === "tenv") {
{
let cons = $target[1];
return /*3285*/function name_3285(key) { return /*3296*//*3296*//*3297*/map$slget/*<3297*/(/*3296*//*3298*/cons/*<3298*/)/*<3296*/(/*3296*//*3299*/key/*<3299*/)/*<3296*/ }/*<3285*/
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 3285');})(/*!*//*-1*/$fn_arg/*<-1*/)/*<3285*/ }/*<3285*/;

const tenv$slnames = /*3300*/function name_3300($fn_arg) { return /*3300*/(function match_3300($target) {
if ($target.type === "tenv") {
{
let names = $target[2];
return /*3300*/function name_3300(key) { return /*3311*//*3311*//*3312*/map$slget/*<3312*/(/*3311*//*3313*/names/*<3313*/)/*<3311*/(/*3311*//*3314*/key/*<3314*/)/*<3311*/ }/*<3300*/
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 3300');})(/*!*//*-1*/$fn_arg/*<-1*/)/*<3300*/ }/*<3300*/;

const tenv$slrm = /*926*/function name_926($fn_arg) { return /*926*/(function match_926($target) {
if ($target.type === "tenv") {
{
let types = $target[0];
{
let cons = $target[1];
{
let names = $target[2];
return /*926*/function name_926($var) { return /*3319*//*3319*//*3319*//*3320*/tenv/*<3320*/(/*3319*//*981*//*981*//*982*/map$slrm/*<982*/(/*981*//*983*/types/*<983*/)/*<981*/(/*981*//*984*/$var/*<984*/)/*<981*/)/*<3319*/(/*3319*//*3321*/cons/*<3321*/)/*<3319*/(/*3319*//*3322*/names/*<3322*/)/*<3319*/ }/*<926*/
}
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 926');})(/*!*//*-1*/$fn_arg/*<-1*/)/*<926*/ }/*<926*/;

const tenv$slset_type = /*3336*/function name_3336($fn_arg) { return /*3336*/(function match_3336($target) {
if ($target.type === "tenv") {
{
let types = $target[0];
{
let cons = $target[1];
{
let names = $target[2];
return /*3336*/function name_3336(k) { return /*3336*/function name_3336(v) { return /*3348*//*3348*//*3348*//*3349*/tenv/*<3349*/(/*3348*//*3350*//*3350*//*3350*//*3351*/map$slset/*<3351*/(/*3350*//*3352*/types/*<3352*/)/*<3350*/(/*3350*//*3353*/k/*<3353*/)/*<3350*/(/*3350*//*3354*/v/*<3354*/)/*<3350*/)/*<3348*/(/*3348*//*3355*/cons/*<3355*/)/*<3348*/(/*3348*//*3356*/names/*<3356*/)/*<3348*/ }/*<3336*/ }/*<3336*/
}
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 3336');})(/*!*//*-1*/$fn_arg/*<-1*/)/*<3336*/ }/*<3336*/;

const type_free = /*754*/function name_754(type) { return /*761*/(function match_761($target) {
if ($target.type === "tvar") {
{
let n = $target[0];
return /*769*//*769*//*953*/set$sladd/*<953*/(/*769*//*954*/set$slnil/*<954*/)/*<769*/(/*769*//*955*/n/*<955*/)/*<769*/
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
return /*781*//*781*//*794*/set$slmerge/*<794*/(/*781*//*795*//*796*/type_free/*<796*/(/*795*//*797*/a/*<797*/)/*<795*/)/*<781*/(/*781*//*798*//*799*/type_free/*<799*/(/*798*//*800*/b/*<800*/)/*<798*/)/*<781*/
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 761');})(/*!*//*763*/type/*<763*/)/*<761*/ }/*<754*/;

const scheme_free = /*888*/function name_888($fn_arg) { return /*888*/(function match_888($target) {
if ($target.type === "scheme") {
{
let vbls = $target[0];
{
let type = $target[1];
return /*895*//*895*//*900*/set$sldiff/*<900*/(/*895*//*901*//*902*/type_free/*<902*/(/*901*//*903*/type/*<903*/)/*<901*/)/*<895*/(/*895*//*904*/vbls/*<904*/)/*<895*/
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 888');})(/*!*//*-1*/$fn_arg/*<-1*/)/*<888*/ }/*<888*/;

const tenv_free = /*985*/function name_985($fn_arg) { return /*985*/(function match_985($target) {
if ($target.type === "tenv") {
{
let types = $target[0];
return /*991*//*991*//*991*//*992*/foldr/*<992*/(/*991*//*994*/set$slnil/*<994*/)/*<991*/(/*991*//*995*//*995*//*996*/map/*<996*/(/*995*//*998*//*999*/map$slvalues/*<999*/(/*998*//*1000*/types/*<1000*/)/*<998*/)/*<995*/(/*995*//*1135*/scheme_free/*<1135*/)/*<995*/)/*<991*/(/*991*//*1169*/set$slmerge/*<1169*/)/*<991*/
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 985');})(/*!*//*-1*/$fn_arg/*<-1*/)/*<985*/ }/*<985*/;

const type_apply = /*839*/function name_839(subst) { return /*839*/function name_839(type) { return /*847*/(function match_847($target) {
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
throw new Error('failed to match ' + jsonify($target) + '. Loc: 854');})(/*!*//*856*//*856*//*928*/map$slget/*<928*/(/*856*//*861*/subst/*<861*/)/*<856*/(/*856*//*929*/n/*<929*/)/*<856*/)/*<854*/
}
}
if ($target.type === "tapp") {
{
let a = $target[0];
{
let b = $target[1];
{
let c = $target[2];
return /*874*//*874*//*874*//*875*/tapp/*<875*/(/*874*//*876*//*876*//*877*/type_apply/*<877*/(/*876*//*878*/subst/*<878*/)/*<876*/(/*876*//*879*/a/*<879*/)/*<876*/)/*<874*/(/*874*//*881*//*881*//*882*/type_apply/*<882*/(/*881*//*883*/subst/*<883*/)/*<881*/(/*881*//*884*/b/*<884*/)/*<881*/)/*<874*/(/*874*//*885*/c/*<885*/)/*<874*/
}
}
}
}
return /*887*/type/*<887*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 847');})(/*!*//*849*/type/*<849*/)/*<847*/ }/*<839*/ }/*<839*/;

const scheme_apply = /*905*/function name_905(subst) { return /*905*/function name_905($fn_arg) { return /*905*/(function match_905($target) {
if ($target.type === "scheme") {
{
let vbls = $target[0];
{
let type = $target[1];
return /*915*//*915*//*917*/scheme/*<917*/(/*915*//*918*/vbls/*<918*/)/*<915*/(/*915*//*919*//*919*//*920*/type_apply/*<920*/(/*919*//*921*//*921*//*922*/map_without/*<922*/(/*921*//*923*/subst/*<923*/)/*<921*/(/*921*//*924*/vbls/*<924*/)/*<921*/)/*<919*/(/*919*//*925*/type/*<925*/)/*<919*/)/*<915*/
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 905');})(/*!*//*-1*/$fn_arg/*<-1*/)/*<905*/ }/*<905*/ }/*<905*/;

const tenv_apply = /*1170*/function name_1170(subst) { return /*1170*/function name_1170($fn_arg) { return /*1170*/(function match_1170($target) {
if ($target.type === "tenv") {
{
let types = $target[0];
{
let cons = $target[1];
{
let names = $target[2];
return /*3332*//*3332*//*3332*//*3333*/tenv/*<3333*/(/*3332*//*1179*//*1179*//*1180*/map$slmap/*<1180*/(/*1179*//*1181*//*1182*/scheme_apply/*<1182*/(/*1181*//*1183*/subst/*<1183*/)/*<1181*/)/*<1179*/(/*1179*//*1185*/types/*<1185*/)/*<1179*/)/*<3332*/(/*3332*//*3334*/cons/*<3334*/)/*<3332*/(/*3332*//*3335*/names/*<3335*/)/*<3332*/
}
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 1170');})(/*!*//*-1*/$fn_arg/*<-1*/)/*<1170*/ }/*<1170*/ }/*<1170*/;

const compose_subst = /*956*/function name_956(earlier) { return /*956*/function name_956(later) { return /*963*//*963*//*964*/map$slmerge/*<964*/(/*963*//*965*//*965*//*966*/map$slmap/*<966*/(/*965*//*967*//*968*/type_apply/*<968*/(/*967*//*969*/earlier/*<969*/)/*<967*/)/*<965*/(/*965*//*970*/later/*<970*/)/*<965*/)/*<963*/(/*963*//*971*/earlier/*<971*/)/*<963*/ }/*<956*/ }/*<956*/;

const earlier_subst = /*2692*//*2693*/map$slfrom_list/*<2693*/(/*2692*//*2694*//*2694*//*2694*/cons/*<2694*/(/*2694*//*2695*//*2695*//*2696*/$co/*<2696*/(/*2695*//*2697*/"a"/*<2697*/)/*<2695*/(/*2695*//*2699*//*2699*//*2700*/tcon/*<2700*/(/*2699*//*2701*/"a-mapped"/*<2701*/)/*<2699*/(/*2699*//*2703*/-1/*<2703*/)/*<2699*/)/*<2695*/)/*<2694*/(/*2694*//*2694*//*2694*//*2694*/cons/*<2694*/(/*2694*//*2774*//*2774*//*2775*/$co/*<2775*/(/*2774*//*2776*/"b"/*<2776*/)/*<2774*/(/*2774*//*2778*//*2778*//*2779*/tvar/*<2779*/(/*2778*//*2780*/"c"/*<2780*/)/*<2778*/(/*2778*//*2782*/-1/*<2782*/)/*<2778*/)/*<2774*/)/*<2694*/(/*2694*//*2694*/nil/*<2694*/)/*<2694*/)/*<2694*/)/*<2692*/;

const generalize = /*1186*/function name_1186(tenv) { return /*1186*/function name_1186(t) { return /*1193*//*1193*//*1194*/scheme/*<1194*/(/*1193*//*1195*//*1195*//*1196*/set$sldiff/*<1196*/(/*1195*//*1197*//*1198*/type_free/*<1198*/(/*1197*//*1199*/t/*<1199*/)/*<1197*/)/*<1195*/(/*1195*//*1200*//*1201*/tenv_free/*<1201*/(/*1200*//*1202*/tenv/*<1202*/)/*<1200*/)/*<1195*/)/*<1193*/(/*1193*//*1203*/t/*<1203*/)/*<1193*/ }/*<1186*/ }/*<1186*/;

const new_type_var = /*1731*/function name_1731(prefix) { return /*1731*/function name_1731(nidx) { return /*1739*//*1739*//*1740*/$co/*<1740*/(/*1739*//*2074*//*2074*//*2075*/tvar/*<2075*/(/*2074*//*1741*/`${/*1743*/prefix/*<1743*/}:${/*1745*/nidx/*<1745*/}`/*<1741*/)/*<2074*/(/*2074*//*2076*/-1/*<2076*/)/*<2074*/)/*<1739*/(/*1739*//*1759*//*1759*//*1761*/$pl/*<1761*/(/*1759*//*1762*/1/*<1762*/)/*<1759*/(/*1759*//*1747*/nidx/*<1747*/)/*<1759*/)/*<1739*/ }/*<1731*/ }/*<1731*/;

const make_subst_for_vars = /*1212*/function name_1212(vars) { return /*1212*/function name_1212(coll) { return /*1212*/function name_1212(nidx) { return /*1219*/(function match_1219($target) {
if ($target.type === "nil") {
return /*1223*//*1223*//*1224*/$co/*<1224*/(/*1223*//*1225*/coll/*<1225*/)/*<1223*/(/*1223*//*1226*/nidx/*<1226*/)/*<1223*/
}
if ($target.type === "cons") {
{
let v = $target[0];
{
let rest = $target[1];
return /*1748*/(function let_1748() {const $target = /*1755*//*1755*//*1756*/new_type_var/*<1756*/(/*1755*//*1757*/v/*<1757*/)/*<1755*/(/*1755*//*1758*/nidx/*<1758*/)/*<1755*/;
if ($target.type === ",") {
{
let vn = $target[0];
{
let nidx = $target[1];
return /*1262*//*1262*//*1262*//*1264*/make_subst_for_vars/*<1264*/(/*1262*//*1269*/rest/*<1269*/)/*<1262*/(/*1262*//*1270*//*1270*//*1270*//*1271*/map$slset/*<1271*/(/*1270*//*1272*/coll/*<1272*/)/*<1270*/(/*1270*//*1273*/v/*<1273*/)/*<1270*/(/*1270*//*1274*/vn/*<1274*/)/*<1270*/)/*<1262*/(/*1262*//*1293*/nidx/*<1293*/)/*<1262*/
}
}
};
throw new Error('let pattern not matched 1751. ' + valueToString($target));})(/*!*/)/*<1748*/
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 1219');})(/*!*//*1221*/vars/*<1221*/)/*<1219*/ }/*<1212*/ }/*<1212*/ }/*<1212*/;

const instantiate = /*1136*/function name_1136($fn_arg) { return /*1136*/(function match_1136($target) {
if ($target.type === "scheme") {
{
let vars = $target[0];
{
let t = $target[1];
return /*1136*/function name_1136(nidx) { return /*1211*/(function let_1211() {const $target = /*1290*//*1290*//*1290*//*1291*/make_subst_for_vars/*<1291*/(/*1290*//*2036*//*2037*/set$slto_list/*<2037*/(/*2036*//*1298*/vars/*<1298*/)/*<2036*/)/*<1290*/(/*1290*//*1300*/map$slnil/*<1300*/)/*<1290*/(/*1290*//*1301*/nidx/*<1301*/)/*<1290*/;
if ($target.type === ",") {
{
let subst = $target[0];
{
let nidx = $target[1];
return /*1302*//*1302*//*1302*//*1303*/$co$co/*<1303*/(/*1302*//*1304*//*1304*//*1305*/type_apply/*<1305*/(/*1304*//*1306*/subst/*<1306*/)/*<1304*/(/*1304*//*1307*/t/*<1307*/)/*<1304*/)/*<1302*/(/*1302*//*3495*/subst/*<3495*/)/*<1302*/(/*1302*//*1308*/nidx/*<1308*/)/*<1302*/
}
}
};
throw new Error('let pattern not matched 1285. ' + valueToString($target));})(/*!*/)/*<1211*/ }/*<1136*/
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 1136');})(/*!*//*-1*/$fn_arg/*<-1*/)/*<1136*/ }/*<1136*/;

const unify = /*1309*/function name_1309(t1) { return /*1309*/function name_1309(t2) { return /*1309*/function name_1309(nidx) { return /*1317*/(function match_1317($target) {
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
return /*1326*/(function let_1326() {const $target = /*1481*//*1481*//*1481*//*1482*/unify/*<1482*/(/*1481*//*1483*/target_1/*<1483*/)/*<1481*/(/*1481*//*1484*/target_2/*<1484*/)/*<1481*/(/*1481*//*1499*/nidx/*<1499*/)/*<1481*/;
if ($target.type === ",") {
{
let target_subst = $target[0];
{
let nidx = $target[1];
return /*1326*/(function let_1326() {const $target = /*1489*//*1489*//*1489*//*1490*/unify/*<1490*/(/*1489*//*1491*//*1491*//*1492*/type_apply/*<1492*/(/*1491*//*1493*/target_subst/*<1493*/)/*<1491*/(/*1491*//*1494*/arg_1/*<1494*/)/*<1491*/)/*<1489*/(/*1489*//*1495*//*1495*//*1496*/type_apply/*<1496*/(/*1495*//*1497*/target_subst/*<1497*/)/*<1495*/(/*1495*//*1498*/arg_2/*<1498*/)/*<1495*/)/*<1489*/(/*1489*//*1500*/nidx/*<1500*/)/*<1489*/;
if ($target.type === ",") {
{
let arg_subst = $target[0];
{
let nidx = $target[1];
return /*1501*//*1501*//*1502*/$co/*<1502*/(/*1501*//*1503*//*1503*//*1504*/compose_subst/*<1504*/(/*1503*//*1505*/target_subst/*<1505*/)/*<1503*/(/*1503*//*1506*/arg_subst/*<1506*/)/*<1503*/)/*<1501*/(/*1501*//*1507*/nidx/*<1507*/)/*<1501*/
}
}
};
throw new Error('let pattern not matched 1485. ' + valueToString($target));})(/*!*/)/*<1326*/
}
}
};
throw new Error('let pattern not matched 1476. ' + valueToString($target));})(/*!*/)/*<1326*/
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
return /*1621*//*1621*//*1622*/$co/*<1622*/(/*1621*//*1514*//*1514*//*1515*/var_bind/*<1515*/(/*1514*//*1516*/$var/*<1516*/)/*<1514*/(/*1514*//*1517*/t/*<1517*/)/*<1514*/)/*<1621*/(/*1621*//*1625*/nidx/*<1625*/)/*<1621*/
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
return /*1623*//*1623*//*1624*/$co/*<1624*/(/*1623*//*1526*//*1526*//*1527*/var_bind/*<1527*/(/*1526*//*1528*/$var/*<1528*/)/*<1526*/(/*1526*//*1529*/t/*<1529*/)/*<1526*/)/*<1623*/(/*1623*//*1626*/nidx/*<1626*/)/*<1623*/
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
return /*2071*//*2071*//*2072*/$co/*<2072*/(/*2071*//*1548*/map$slnil/*<1548*/)/*<2071*/(/*2071*//*2073*/nidx/*<2073*/)/*<2071*/
}
return /*1549*//*1550*/fatal/*<1550*/(/*1549*//*1551*/`cant unify ${/*3020*/a/*<3020*/} (${/*3016*/la/*<3016*/}) and ${/*3022*/b/*<3022*/} (${/*3018*/lb/*<3018*/})`/*<1551*/)/*<1549*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 1541');})(/*!*//*1544*//*1544*//*1545*/$eq/*<1545*/(/*1544*//*1546*/a/*<1546*/)/*<1544*/(/*1544*//*1547*/b/*<1547*/)/*<1544*/)/*<1541*/
}
}
}
}
}
}
}
return /*1554*//*1555*/fatal/*<1555*/(/*1554*//*1556*/`cant unify ${/*1558*//*1560*/type_to_string/*<1560*/(/*1558*//*1561*/t1/*<1561*/)/*<1558*/} (${/*8799*//*8828*/type_loc/*<8828*/(/*8799*//*8829*/t1/*<8829*/)/*<8799*/}) and ${/*1562*//*1564*/type_to_string/*<1564*/(/*1562*//*1566*/t2/*<1566*/)/*<1562*/} (${/*8801*//*8830*/type_loc/*<8830*/(/*8801*//*8831*/t2/*<8831*/)/*<8801*/})`/*<1556*/)/*<1554*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 1317');})(/*!*//*1319*//*1319*//*1320*/$co/*<1320*/(/*1319*//*1321*/t1/*<1321*/)/*<1319*/(/*1319*//*1322*/t2/*<1322*/)/*<1319*/)/*<1317*/ }/*<1309*/ }/*<1309*/ }/*<1309*/;

const var_bind = /*1567*/function name_1567($var) { return /*1567*/function name_1567(type) { return /*1575*/(function match_1575($target) {
if ($target.type === "tvar") {
{
let v = $target[0];
return /*1582*/(function match_1582($target) {
if ($target === true) {
return /*1588*/map$slnil/*<1588*/
}
return /*1592*//*1592*//*1592*//*1617*/map$slset/*<1617*/(/*1592*//*1618*/map$slnil/*<1618*/)/*<1592*/(/*1592*//*1619*/$var/*<1619*/)/*<1592*/(/*1592*//*1620*/type/*<1620*/)/*<1592*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 1582');})(/*!*//*1584*//*1584*//*1585*/$eq/*<1585*/(/*1584*//*1586*/$var/*<1586*/)/*<1584*/(/*1584*//*1587*/v/*<1587*/)/*<1584*/)/*<1582*/
}
}
return /*1597*/(function match_1597($target) {
if ($target === true) {
return /*1605*//*1606*/fatal/*<1606*/(/*1605*//*1607*/"occurs check"/*<1607*/)/*<1605*/
}
return /*1614*//*1614*//*1614*//*1610*/map$slset/*<1610*/(/*1614*//*1611*/map$slnil/*<1611*/)/*<1614*/(/*1614*//*1612*/$var/*<1612*/)/*<1614*/(/*1614*//*1613*/type/*<1613*/)/*<1614*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 1597');})(/*!*//*1599*//*1599*//*1600*/set$slhas/*<1600*/(/*1599*//*1601*//*1602*/type_free/*<1602*/(/*1601*//*1603*/type/*<1603*/)/*<1601*/)/*<1599*/(/*1599*//*1604*/$var/*<1604*/)/*<1599*/)/*<1597*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 1575');})(/*!*//*1577*/type/*<1577*/)/*<1575*/ }/*<1567*/ }/*<1567*/;

const t_prim = /*1627*/function name_1627(prim) { return /*1633*/(function match_1633($target) {
if ($target.type === "pint") {
{
let l = $target[1];
return /*1639*//*1639*//*1640*/tcon/*<1640*/(/*1639*//*1641*/"int"/*<1641*/)/*<1639*/(/*1639*//*1643*/l/*<1643*/)/*<1639*/
}
}
if ($target.type === "pbool") {
{
let l = $target[1];
return /*1649*//*1649*//*1650*/tcon/*<1650*/(/*1649*//*1651*/"bool"/*<1651*/)/*<1649*/(/*1649*//*1653*/l/*<1653*/)/*<1649*/
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 1633');})(/*!*//*1635*/prim/*<1635*/)/*<1633*/ }/*<1627*/;

const tfn = /*1865*/function name_1865(a) { return /*1865*/function name_1865(b) { return /*1865*/function name_1865(l) { return /*1873*//*1873*//*1873*//*1874*/tapp/*<1874*/(/*1873*//*1875*//*1875*//*1875*//*1876*/tapp/*<1876*/(/*1875*//*1877*//*1877*//*1878*/tcon/*<1878*/(/*1877*//*1879*/"->"/*<1879*/)/*<1877*/(/*1877*//*1881*/l/*<1881*/)/*<1877*/)/*<1875*/(/*1875*//*1882*/a/*<1882*/)/*<1875*/(/*1875*//*1886*/l/*<1886*/)/*<1875*/)/*<1873*/(/*1873*//*1887*/b/*<1887*/)/*<1873*/(/*1873*//*1888*/l/*<1888*/)/*<1873*/ }/*<1865*/ }/*<1865*/ }/*<1865*/;

const tint = /*2055*//*2055*//*2056*/tcon/*<2056*/(/*2055*//*2057*/"int"/*<2057*/)/*<2055*/(/*2055*//*2059*/-1/*<2059*/)/*<2055*/;

const tbool = /*5416*//*5416*//*5417*/tcon/*<5417*/(/*5416*//*5418*/"bool"/*<5418*/)/*<5416*/(/*5416*//*5421*/-1/*<5421*/)/*<5416*/;

const tstring = /*8906*//*8906*//*8907*/tcon/*<8907*/(/*8906*//*8908*/"string"/*<8908*/)/*<8906*/(/*8906*//*8910*/-1/*<8910*/)/*<8906*/;

const t_expr = /*1654*/function name_1654(tenv) { return /*1654*/function name_1654(expr) { return /*1654*/function name_1654(nidx) { return /*1664*/(function match_1664($target) {
if ($target.type === "evar") {
{
let name = $target[0];
{
let l = $target[1];
return /*1671*/(function match_1671($target) {
if ($target.type === "none") {
return /*1680*//*1681*/fatal/*<1681*/(/*1680*//*1682*/`Unbound variable ${/*1684*/name/*<1684*/} (${/*6913*/l/*<6913*/})`/*<1682*/)/*<1680*/
}
if ($target.type === "some") {
{
let found = $target[0];
return /*1690*/(function let_1690() {const $target = /*1697*//*1697*//*1698*/instantiate/*<1698*/(/*1697*//*1699*/found/*<1699*/)/*<1697*/(/*1697*//*1700*/nidx/*<1700*/)/*<1697*/;
if ($target.type === ",,") {
{
let t = $target[0];
{
let nidx = $target[2];
return /*1701*//*1701*//*1701*//*1702*/$co$co/*<1702*/(/*1701*//*1704*/map$slnil/*<1704*/)/*<1701*/(/*1701*//*1705*/t/*<1705*/)/*<1701*/(/*1701*//*1706*/nidx/*<1706*/)/*<1701*/
}
}
};
throw new Error('let pattern not matched 1693. ' + valueToString($target));})(/*!*/)/*<1690*/
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 1671');})(/*!*//*1673*//*1673*//*1674*/tenv$sltype/*<1674*/(/*1673*//*1675*/tenv/*<1675*/)/*<1673*/(/*1673*//*1676*/name/*<1676*/)/*<1673*/)/*<1671*/
}
}
}
if ($target.type === "equot") {
{
let l = $target[1];
return /*5832*//*5832*//*5832*//*5833*/$co$co/*<5833*/(/*5832*//*5835*/map$slnil/*<5835*/)/*<5832*/(/*5832*//*5823*//*5823*//*5828*/tcon/*<5828*/(/*5823*//*5829*/"ast"/*<5829*/)/*<5823*/(/*5823*//*5831*/l/*<5831*/)/*<5823*/)/*<5832*/(/*5832*//*5834*/nidx/*<5834*/)/*<5832*/
}
}
if ($target.type === "eprim") {
{
let prim = $target[0];
return /*1710*//*1710*//*1710*//*1711*/$co$co/*<1711*/(/*1710*//*1723*/map$slnil/*<1723*/)/*<1710*/(/*1710*//*1712*//*1713*/t_prim/*<1713*/(/*1712*//*1714*/prim/*<1714*/)/*<1712*/)/*<1710*/(/*1710*//*1715*/nidx/*<1715*/)/*<1710*/
}
}
if ($target.type === "estr") {
{
let first = $target[0];
{
let templates = $target[1];
{
let l = $target[2];
return /*6800*/(function let_6800() {const $target = /*6864*//*6864*//*6865*/tcon/*<6865*/(/*6864*//*6866*/"string"/*<6866*/)/*<6864*/(/*6864*//*6868*/l/*<6868*/)/*<6864*/;
{
let string_type = $target;
return /*6800*/(function let_6800() {const $target = /*6804*//*6804*//*6804*//*6805*/foldr/*<6805*/(/*6804*//*6806*//*6806*//*6807*/$co/*<6807*/(/*6806*//*6808*/map$slnil/*<6808*/)/*<6806*/(/*6806*//*6809*/nidx/*<6809*/)/*<6806*/)/*<6804*/(/*6804*//*6810*/templates/*<6810*/)/*<6804*/(/*6804*//*6811*/function name_6811($fn_arg) { return /*6811*/(function match_6811($target) {
if ($target.type === ",") {
{
let subst = $target[0];
{
let nidx = $target[1];
return /*6811*/function name_6811($fn_arg) { return /*6811*/(function match_6811($target) {
if ($target.type === ",,") {
{
let expr = $target[0];
{
let suffix = $target[1];
{
let sl = $target[2];
return /*6827*/(function let_6827() {const $target = /*6831*//*6831*//*6831*//*6832*/t_expr/*<6832*/(/*6831*//*6833*/tenv/*<6833*/)/*<6831*/(/*6831*//*6834*/expr/*<6834*/)/*<6831*/(/*6831*//*6835*/nidx/*<6835*/)/*<6831*/;
if ($target.type === ",,") {
{
let s2 = $target[0];
{
let t = $target[1];
{
let nidx = $target[2];
return /*6827*/(function let_6827() {const $target = /*6844*//*6844*//*6844*//*6845*/unify/*<6845*/(/*6844*//*6846*/t/*<6846*/)/*<6844*/(/*6844*//*6847*/string_type/*<6847*/)/*<6844*/(/*6844*//*6893*/nidx/*<6893*/)/*<6844*/;
if ($target.type === ",") {
{
let s3 = $target[0];
{
let nidx = $target[1];
return /*6852*//*6852*//*6853*/$co/*<6853*/(/*6852*//*6854*//*6854*//*6855*/compose_subst/*<6855*/(/*6854*//*6856*/s3/*<6856*/)/*<6854*/(/*6854*//*6857*//*6857*//*6858*/compose_subst/*<6858*/(/*6857*//*6859*/s2/*<6859*/)/*<6857*/(/*6857*//*6860*/subst/*<6860*/)/*<6857*/)/*<6854*/)/*<6852*/(/*6852*//*6861*/nidx/*<6861*/)/*<6852*/
}
}
};
throw new Error('let pattern not matched 6840. ' + valueToString($target));})(/*!*/)/*<6827*/
}
}
}
};
throw new Error('let pattern not matched 6830. ' + valueToString($target));})(/*!*/)/*<6827*/
}
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 6811');})(/*!*//*-1*/$fn_arg/*<-1*/)/*<6811*/ }/*<6811*/
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 6811');})(/*!*//*-1*/$fn_arg/*<-1*/)/*<6811*/ }/*<6811*/)/*<6804*/;
if ($target.type === ",") {
{
let subst = $target[0];
{
let nidx = $target[1];
return /*6862*//*6862*//*6862*//*6872*/$co$co/*<6872*/(/*6862*//*6873*/subst/*<6873*/)/*<6862*/(/*6862*//*6874*/string_type/*<6874*/)/*<6862*/(/*6862*//*6875*/nidx/*<6875*/)/*<6862*/
}
}
};
throw new Error('let pattern not matched 6803. ' + valueToString($target));})(/*!*/)/*<6800*/
};
throw new Error('let pattern not matched 6863. ' + valueToString($target));})(/*!*/)/*<6800*/
}
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
return /*1722*/(function let_1722() {const $target = /*1730*//*1730*//*1763*/new_type_var/*<1763*/(/*1730*//*1764*/name/*<1764*/)/*<1730*/(/*1730*//*1765*/nidx/*<1765*/)/*<1730*/;
if ($target.type === ",") {
{
let arg_type = $target[0];
{
let nidx = $target[1];
return /*1722*/(function let_1722() {const $target = /*1773*//*1773*//*1773*//*1774*/tenv$slset_type/*<1774*/(/*1773*//*1775*/tenv/*<1775*/)/*<1773*/(/*1773*//*1779*/name/*<1779*/)/*<1773*/(/*1773*//*1780*//*1780*//*1781*/scheme/*<1781*/(/*1780*//*1782*/set$slnil/*<1782*/)/*<1780*/(/*1780*//*1783*/arg_type/*<1783*/)/*<1780*/)/*<1773*/;
{
let env_with_name = $target;
return /*1722*/(function let_1722() {const $target = /*1789*//*1789*//*1789*//*1790*/t_expr/*<1790*/(/*1789*//*1791*/env_with_name/*<1791*/)/*<1789*/(/*1789*//*1792*/body/*<1792*/)/*<1789*/(/*1789*//*2068*/nidx/*<2068*/)/*<1789*/;
if ($target.type === ",,") {
{
let body_subst = $target[0];
{
let body_type = $target[1];
{
let nidx = $target[2];
return /*1766*//*1766*//*1766*//*1793*/$co$co/*<1793*/(/*1766*//*1794*/body_subst/*<1794*/)/*<1766*/(/*1766*//*1795*//*1795*//*1795*//*1796*/tfn/*<1796*/(/*1795*//*1804*//*1804*//*1805*/type_apply/*<1805*/(/*1804*//*1806*/body_subst/*<1806*/)/*<1804*/(/*1804*//*1807*/arg_type/*<1807*/)/*<1804*/)/*<1795*/(/*1795*//*1808*/body_type/*<1808*/)/*<1795*/(/*1795*//*1811*/l/*<1811*/)/*<1795*/)/*<1766*/(/*1766*//*1809*/nidx/*<1809*/)/*<1766*/
}
}
}
};
throw new Error('let pattern not matched 1784. ' + valueToString($target));})(/*!*/)/*<1722*/
};
throw new Error('let pattern not matched 1772. ' + valueToString($target));})(/*!*/)/*<1722*/
}
}
};
throw new Error('let pattern not matched 1726. ' + valueToString($target));})(/*!*/)/*<1722*/
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
let l = $target[2];
return /*1816*/(function let_1816() {const $target = /*1823*//*1823*//*1824*/new_type_var/*<1824*/(/*1823*//*1825*/"res"/*<1825*/)/*<1823*/(/*1823*//*1827*/nidx/*<1827*/)/*<1823*/;
if ($target.type === ",") {
{
let result_var = $target[0];
{
let nidx = $target[1];
return /*1816*/(function let_1816() {const $target = /*1833*//*1833*//*1833*//*1834*/t_expr/*<1834*/(/*1833*//*1835*/tenv/*<1835*/)/*<1833*/(/*1833*//*1836*/target/*<1836*/)/*<1833*/(/*1833*//*1850*/nidx/*<1850*/)/*<1833*/;
if ($target.type === ",,") {
{
let target_subst = $target[0];
{
let target_type = $target[1];
{
let nidx = $target[2];
return /*1816*/(function let_1816() {const $target = /*1842*//*1842*//*1842*//*1843*/t_expr/*<1843*/(/*1842*//*1844*//*1844*//*1845*/tenv_apply/*<1845*/(/*1844*//*1846*/target_subst/*<1846*/)/*<1844*/(/*1844*//*1847*/tenv/*<1847*/)/*<1844*/)/*<1842*/(/*1842*//*1848*/arg/*<1848*/)/*<1842*/(/*1842*//*1849*/nidx/*<1849*/)/*<1842*/;
if ($target.type === ",,") {
{
let arg_subst = $target[0];
{
let arg_type = $target[1];
{
let nidx = $target[2];
return /*1816*/(function let_1816() {const $target = /*1855*//*1855*//*1855*//*1856*/unify/*<1856*/(/*1855*//*1857*//*1857*//*1858*/type_apply/*<1858*/(/*1857*//*1859*/arg_subst/*<1859*/)/*<1857*/(/*1857*//*1860*/target_type/*<1860*/)/*<1857*/)/*<1855*/(/*1855*//*1861*//*1861*//*1861*//*1890*/tfn/*<1890*/(/*1861*//*1891*/arg_type/*<1891*/)/*<1861*/(/*1861*//*1892*/result_var/*<1892*/)/*<1861*/(/*1861*//*1893*/l/*<1893*/)/*<1861*/)/*<1855*/(/*1855*//*1894*/nidx/*<1894*/)/*<1855*/;
if ($target.type === ",") {
{
let unified_subst = $target[0];
{
let nidx = $target[1];
return /*1889*//*1889*//*1889*//*1896*/$co$co/*<1896*/(/*1889*//*1897*//*1897*//*1898*/compose_subst/*<1898*/(/*1897*//*1899*/unified_subst/*<1899*/)/*<1897*/(/*1897*//*1900*//*1900*//*1901*/compose_subst/*<1901*/(/*1900*//*1902*/arg_subst/*<1902*/)/*<1900*/(/*1900*//*1903*/target_subst/*<1903*/)/*<1900*/)/*<1897*/)/*<1889*/(/*1889*//*1905*//*1905*//*1906*/type_apply/*<1906*/(/*1905*//*1907*/unified_subst/*<1907*/)/*<1905*/(/*1905*//*1908*/result_var/*<1908*/)/*<1905*/)/*<1889*/(/*1889*//*1909*/nidx/*<1909*/)/*<1889*/
}
}
};
throw new Error('let pattern not matched 1851. ' + valueToString($target));})(/*!*/)/*<1816*/
}
}
}
};
throw new Error('let pattern not matched 1837. ' + valueToString($target));})(/*!*/)/*<1816*/
}
}
}
};
throw new Error('let pattern not matched 1828. ' + valueToString($target));})(/*!*/)/*<1816*/
}
}
};
throw new Error('let pattern not matched 1819. ' + valueToString($target));})(/*!*/)/*<1816*/
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
return /*2368*//*2368*//*2368*//*2368*//*4403*/pat_and_body/*<4403*/(/*2368*//*4413*/tenv/*<4413*/)/*<2368*/(/*2368*//*4404*/pat/*<4404*/)/*<2368*/(/*2368*//*4405*/body/*<4405*/)/*<2368*/(/*2368*//*4406*//*4406*//*4406*//*5493*/t_expr/*<5493*/(/*4406*//*5494*/tenv/*<5494*/)/*<4406*/(/*4406*//*5495*/init/*<5495*/)/*<4406*/(/*4406*//*5496*/nidx/*<5496*/)/*<4406*/)/*<2368*/
}
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
return /*2252*/(function let_2252() {const $target = /*4432*//*4432*//*4436*/new_type_var/*<4436*/(/*4432*//*4437*/"match-res"/*<4437*/)/*<4432*/(/*4432*//*4439*/nidx/*<4439*/)/*<4432*/;
if ($target.type === ",") {
{
let result_var = $target[0];
{
let nidx = $target[1];
return /*2252*/(function let_2252() {const $target = /*2264*//*2264*//*2264*//*2265*/t_expr/*<2265*/(/*2264*//*2266*/tenv/*<2266*/)/*<2264*/(/*2264*//*2267*/target/*<2267*/)/*<2264*/(/*2264*//*2268*/nidx/*<2268*/)/*<2264*/;
if ($target.type === ",,") {
{
let target_subst = $target[0];
{
let target_type = $target[1];
{
let nidx = $target[2];
return /*2283*//*2283*//*2283*//*4484*/foldr/*<4484*/(/*2283*//*4485*//*4485*//*4485*//*4486*/$co$co/*<4486*/(/*4485*//*4487*/target_subst/*<4487*/)/*<4485*/(/*4485*//*4488*/result_var/*<4488*/)/*<4485*/(/*4485*//*4489*/nidx/*<4489*/)/*<4485*/)/*<2283*/(/*2283*//*4490*/cases/*<4490*/)/*<2283*/(/*2283*//*4491*/function name_4491($fn_arg) { return /*4491*/(function match_4491($target) {
if ($target.type === ",,") {
{
let subst = $target[0];
{
let result = $target[1];
{
let nidx = $target[2];
return /*4491*/function name_4491($fn_arg) { return /*4491*/(function match_4491($target) {
if ($target.type === ",") {
{
let pat = $target[0];
{
let body = $target[1];
return /*4503*/(function let_4503() {const $target = /*4512*//*4512*//*4512*//*4512*//*4513*/pat_and_body/*<4513*/(/*4512*//*4514*/tenv/*<4514*/)/*<4512*/(/*4512*//*4515*/pat/*<4515*/)/*<4512*/(/*4512*//*4516*/body/*<4516*/)/*<4512*/(/*4512*//*4517*//*4517*//*4517*//*4518*/$co$co/*<4518*/(/*4517*//*4519*/subst/*<4519*/)/*<4517*/(/*4517*//*4520*/target_type/*<4520*/)/*<4517*/(/*4517*//*4521*/nidx/*<4521*/)/*<4517*/)/*<4512*/;
if ($target.type === ",,") {
{
let subst = $target[0];
{
let body = $target[1];
{
let nidx = $target[2];
return /*4503*/(function let_4503() {const $target = /*4526*//*4526*//*4526*//*4527*/unify/*<4527*/(/*4526*//*4528*/result/*<4528*/)/*<4526*/(/*4526*//*4529*/body/*<4529*/)/*<4526*/(/*4526*//*4530*/nidx/*<4530*/)/*<4526*/;
if ($target.type === ",") {
{
let unified_subst = $target[0];
{
let nidx = $target[1];
return /*4531*//*4531*//*4531*//*4532*/$co$co/*<4532*/(/*4531*//*4533*//*4533*//*4534*/compose_subst/*<4534*/(/*4533*//*4535*/subst/*<4535*/)/*<4533*/(/*4533*//*4536*/unified_subst/*<4536*/)/*<4533*/)/*<4531*/(/*4531*//*4537*//*4537*//*4538*/type_apply/*<4538*/(/*4537*//*4539*/unified_subst/*<4539*/)/*<4537*/(/*4537*//*4540*/result/*<4540*/)/*<4537*/)/*<4531*/(/*4531*//*4541*/nidx/*<4541*/)/*<4531*/
}
}
};
throw new Error('let pattern not matched 4522. ' + valueToString($target));})(/*!*/)/*<4503*/
}
}
}
};
throw new Error('let pattern not matched 4506. ' + valueToString($target));})(/*!*/)/*<4503*/
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 4491');})(/*!*//*-1*/$fn_arg/*<-1*/)/*<4491*/ }/*<4491*/
}
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 4491');})(/*!*//*-1*/$fn_arg/*<-1*/)/*<4491*/ }/*<4491*/)/*<2283*/
}
}
}
};
throw new Error('let pattern not matched 4431. ' + valueToString($target));})(/*!*/)/*<2252*/
}
}
};
throw new Error('let pattern not matched 2259. ' + valueToString($target));})(/*!*/)/*<2252*/
}
}
}
}
return /*2064*//*2065*/fatal/*<2065*/(/*2064*//*2066*/`cannot infer type for ${/*2247*//*2249*/valueToString/*<2249*/(/*2247*//*2250*/expr/*<2250*/)/*<2247*/}`/*<2066*/)/*<2064*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 1664');})(/*!*//*1666*/expr/*<1666*/)/*<1664*/ }/*<1654*/ }/*<1654*/ }/*<1654*/;

const pat_and_body = /*4282*/function name_4282(tenv) { return /*4282*/function name_4282(pat) { return /*4282*/function name_4282(body) { return /*4282*/function name_4282($fn_arg) { return /*4282*/(function match_4282($target) {
if ($target.type === ",,") {
{
let value_subst = $target[0];
{
let value_type = $target[1];
{
let nidx = $target[2];
return /*4289*/(function let_4289() {const $target = /*4308*//*4308*//*4308*//*4309*/t_pat/*<4309*/(/*4308*//*4310*/tenv/*<4310*/)/*<4308*/(/*4308*//*4311*/pat/*<4311*/)/*<4308*/(/*4308*//*4312*/nidx/*<4312*/)/*<4308*/;
if ($target.type === ",,") {
{
let pat_type = $target[0];
{
let bindings = $target[1];
{
let nidx = $target[2];
return /*4289*/(function let_4289() {const $target = /*4317*//*4317*//*4317*//*4318*/unify/*<4318*/(/*4317*//*4319*/value_type/*<4319*/)/*<4317*/(/*4317*//*4320*/pat_type/*<4320*/)/*<4317*/(/*4317*//*4321*/nidx/*<4321*/)/*<4317*/;
if ($target.type === ",") {
{
let unified_subst = $target[0];
{
let nidx = $target[1];
return /*4289*/(function let_4289() {const $target = /*4323*//*4323*//*4324*/map$slmap/*<4324*/(/*4323*//*4325*//*4326*/type_apply/*<4326*/(/*4325*//*4327*//*4327*//*4328*/compose_subst/*<4328*/(/*4327*//*4329*/value_subst/*<4329*/)/*<4327*/(/*4327*//*4330*/unified_subst/*<4330*/)/*<4327*/)/*<4325*/)/*<4323*/(/*4323*//*4331*/bindings/*<4331*/)/*<4323*/;
{
let bindings = $target;
return /*4289*/(function let_4289() {const $target = /*4333*//*4333*//*4334*/map$slmap/*<4334*/(/*4333*//*4335*//*4336*/generalize/*<4336*/(/*4335*//*4337*//*4337*//*4338*/tenv_apply/*<4338*/(/*4337*//*4339*//*4339*//*4340*/compose_subst/*<4340*/(/*4339*//*4341*/value_subst/*<4341*/)/*<4339*/(/*4339*//*4342*/unified_subst/*<4342*/)/*<4339*/)/*<4337*/(/*4337*//*4343*/tenv/*<4343*/)/*<4337*/)/*<4335*/)/*<4333*/(/*4333*//*4344*/bindings/*<4344*/)/*<4333*/;
{
let schemes = $target;
return /*4289*/(function let_4289() {const $target = /*4346*//*4346*//*4346*//*4347*/foldr/*<4347*/(/*4346*//*4348*//*4348*//*4349*/tenv_apply/*<4349*/(/*4348*//*4350*/value_subst/*<4350*/)/*<4348*/(/*4348*//*4351*/tenv/*<4351*/)/*<4348*/)/*<4346*/(/*4346*//*4352*//*4353*/map$slto_list/*<4353*/(/*4352*//*4354*/schemes/*<4354*/)/*<4352*/)/*<4346*/(/*4346*//*4355*/function name_4355(tenv) { return /*4355*/function name_4355($fn_arg) { return /*4355*/(function match_4355($target) {
if ($target.type === ",") {
{
let name = $target[0];
{
let scheme = $target[1];
return /*4363*//*4363*//*4363*//*4364*/tenv$slset_type/*<4364*/(/*4363*//*4365*/tenv/*<4365*/)/*<4363*/(/*4363*//*4366*/name/*<4366*/)/*<4363*/(/*4363*//*4367*/scheme/*<4367*/)/*<4363*/
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 4355');})(/*!*//*-1*/$fn_arg/*<-1*/)/*<4355*/ }/*<4355*/ }/*<4355*/)/*<4346*/;
{
let bound_env = $target;
return /*4289*/(function let_4289() {const $target = /*4373*//*4373*//*4373*//*4374*/t_expr/*<4374*/(/*4373*//*4375*//*4375*//*4376*/tenv_apply/*<4376*/(/*4375*//*4377*//*4377*//*4378*/compose_subst/*<4378*/(/*4377*//*4379*/unified_subst/*<4379*/)/*<4377*/(/*4377*//*4380*/value_subst/*<4380*/)/*<4377*/)/*<4375*/(/*4375*//*4381*/bound_env/*<4381*/)/*<4375*/)/*<4373*/(/*4373*//*4382*/body/*<4382*/)/*<4373*/(/*4373*//*4383*/nidx/*<4383*/)/*<4373*/;
if ($target.type === ",,") {
{
let body_subst = $target[0];
{
let body_type = $target[1];
{
let nidx = $target[2];
return /*4384*//*4384*//*4384*//*4385*/$co$co/*<4385*/(/*4384*//*4386*//*4386*//*4387*/compose_subst/*<4387*/(/*4386*//*4388*/unified_subst/*<4388*/)/*<4386*/(/*4386*//*4389*//*4389*//*4390*/compose_subst/*<4390*/(/*4389*//*4391*/value_subst/*<4391*/)/*<4389*/(/*4389*//*4392*/body_subst/*<4392*/)/*<4389*/)/*<4386*/)/*<4384*/(/*4384*//*4393*//*4393*//*4394*/type_apply/*<4394*/(/*4393*//*4395*/unified_subst/*<4395*/)/*<4393*/(/*4393*//*4396*/body_type/*<4396*/)/*<4393*/)/*<4384*/(/*4384*//*4397*/nidx/*<4397*/)/*<4384*/
}
}
}
};
throw new Error('let pattern not matched 4368. ' + valueToString($target));})(/*!*/)/*<4289*/
};
throw new Error('let pattern not matched 4345. ' + valueToString($target));})(/*!*/)/*<4289*/
};
throw new Error('let pattern not matched 4332. ' + valueToString($target));})(/*!*/)/*<4289*/
};
throw new Error('let pattern not matched 4322. ' + valueToString($target));})(/*!*/)/*<4289*/
}
}
};
throw new Error('let pattern not matched 4313. ' + valueToString($target));})(/*!*/)/*<4289*/
}
}
}
};
throw new Error('let pattern not matched 4303. ' + valueToString($target));})(/*!*/)/*<4289*/
}
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 4282');})(/*!*//*-1*/$fn_arg/*<-1*/)/*<4282*/ }/*<4282*/ }/*<4282*/ }/*<4282*/ }/*<4282*/;

const t_pat = /*2466*/function name_2466(tenv) { return /*2466*/function name_2466(pat) { return /*2466*/function name_2466(nidx) { return /*2475*/(function match_2475($target) {
if ($target.type === "pany") {
{
let nl = $target[0];
return /*6412*/(function let_6412() {const $target = /*6405*//*6405*//*6408*/new_type_var/*<6408*/(/*6405*//*6409*/"any"/*<6409*/)/*<6405*/(/*6405*//*6411*/nidx/*<6411*/)/*<6405*/;
if ($target.type === ",") {
{
let $var = $target[0];
{
let nidx = $target[1];
return /*6420*//*6420*//*6420*//*6421*/$co$co/*<6421*/(/*6420*//*6422*/$var/*<6422*/)/*<6420*/(/*6420*//*6423*/map$slnil/*<6423*/)/*<6420*/(/*6420*//*6424*/nidx/*<6424*/)/*<6420*/
}
}
};
throw new Error('let pattern not matched 6416. ' + valueToString($target));})(/*!*/)/*<6412*/
}
}
if ($target.type === "pvar") {
{
let name = $target[0];
{
let nl = $target[1];
return /*3450*/(function let_3450() {const $target = /*2482*//*2482*//*3403*/new_type_var/*<3403*/(/*2482*//*3404*/name/*<3404*/)/*<2482*/(/*2482*//*3405*/nidx/*<3405*/)/*<2482*/;
if ($target.type === ",") {
{
let $var = $target[0];
{
let nidx = $target[1];
return /*3459*//*3459*//*3459*//*3460*/$co$co/*<3460*/(/*3459*//*3461*/$var/*<3461*/)/*<3459*/(/*3459*//*3464*//*3464*//*3464*//*3465*/map$slset/*<3465*/(/*3464*//*3466*/map$slnil/*<3466*/)/*<3464*/(/*3464*//*3467*/name/*<3467*/)/*<3464*/(/*3464*//*3469*/$var/*<3469*/)/*<3464*/)/*<3459*/(/*3459*//*3462*/nidx/*<3462*/)/*<3459*/
}
}
};
throw new Error('let pattern not matched 3455. ' + valueToString($target));})(/*!*/)/*<3450*/
}
}
}
if ($target.type === "pstr") {
{
let nl = $target[1];
return /*3407*//*3407*//*3407*//*3412*/$co$co/*<3412*/(/*3407*//*3413*//*3413*//*3414*/tcon/*<3414*/(/*3413*//*3415*/"string"/*<3415*/)/*<3413*/(/*3413*//*3417*/nl/*<3417*/)/*<3413*/)/*<3407*/(/*3407*//*3472*/map$slnil/*<3472*/)/*<3407*/(/*3407*//*3419*/nidx/*<3419*/)/*<3407*/
}
}
if ($target.type === "pprim") {
if ($target[0].type === "pbool") {
{
let l = $target[1];
return /*3426*//*3426*//*3426*//*3427*/$co$co/*<3427*/(/*3426*//*3428*//*3428*//*3429*/tcon/*<3429*/(/*3428*//*3430*/"bool"/*<3430*/)/*<3428*/(/*3428*//*3432*/l/*<3432*/)/*<3428*/)/*<3426*/(/*3426*//*3473*/map$slnil/*<3473*/)/*<3426*/(/*3426*//*3433*/nidx/*<3433*/)/*<3426*/
}
}
}
if ($target.type === "pprim") {
if ($target[0].type === "pint") {
{
let l = $target[1];
return /*3441*//*3441*//*3441*//*3442*/$co$co/*<3442*/(/*3441*//*3443*//*3443*//*3444*/tcon/*<3444*/(/*3443*//*3445*/"int"/*<3445*/)/*<3443*/(/*3443*//*3447*/l/*<3447*/)/*<3443*/)/*<3441*/(/*3441*//*3474*/map$slnil/*<3474*/)/*<3441*/(/*3441*//*3448*/nidx/*<3448*/)/*<3441*/
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
return /*3479*/(function let_3479() {const $target = /*3661*/(function match_3661($target) {
if ($target.type === "none") {
return /*3665*//*3666*/fatal/*<3666*/(/*3665*//*3668*/`Unknown constructor: ${/*3670*/name/*<3670*/}`/*<3668*/)/*<3665*/
}
if ($target.type === "some") {
{
let v = $target[0];
return /*3750*/v/*<3750*/
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 3661');})(/*!*//*3488*//*3488*//*3489*/tenv$slcon/*<3489*/(/*3488*//*3490*/tenv/*<3490*/)/*<3488*/(/*3488*//*3491*/name/*<3491*/)/*<3488*/)/*<3661*/;
if ($target.type === "tconstructor") {
{
let free = $target[0];
{
let cargs = $target[1];
{
let cres = $target[2];
return /*3479*/(function let_3479() {const $target = /*3502*//*3502*//*3503*/instantiate/*<3503*/(/*3502*//*3504*//*3504*//*3505*/scheme/*<3505*/(/*3504*//*3506*/free/*<3506*/)/*<3504*/(/*3504*//*3507*/cres/*<3507*/)/*<3504*/)/*<3502*/(/*3502*//*3754*/nidx/*<3754*/)/*<3502*/;
if ($target.type === ",,") {
{
let tres = $target[0];
{
let tsubst = $target[1];
{
let nidx = $target[2];
return /*3479*/(function let_3479() {const $target = /*3509*//*3509*//*3510*/map/*<3510*/(/*3509*//*3511*/cargs/*<3511*/)/*<3509*/(/*3509*//*3512*//*3513*/type_apply/*<3513*/(/*3512*//*3514*/tsubst/*<3514*/)/*<3512*/)/*<3509*/;
{
let cargs = $target;
return /*3479*/(function let_3479() {const $target = /*3581*//*3581*//*3582*/zip/*<3582*/(/*3581*//*3583*/args/*<3583*/)/*<3581*/(/*3581*//*3584*/cargs/*<3584*/)/*<3581*/;
{
let zipped = $target;
return /*3479*/(function let_3479() {const $target = /*3590*//*3590*//*3590*//*3591*/foldl/*<3591*/(/*3590*//*3592*//*3592*//*3592*//*3593*/$co$co/*<3593*/(/*3592*//*3595*/map$slnil/*<3595*/)/*<3592*/(/*3592*//*3596*/map$slnil/*<3596*/)/*<3592*/(/*3592*//*3597*/nidx/*<3597*/)/*<3592*/)/*<3590*/(/*3590*//*3598*/zipped/*<3598*/)/*<3590*/(/*3590*//*3599*/function name_3599($fn_arg) { return /*3599*/(function match_3599($target) {
if ($target.type === ",,") {
{
let subst = $target[0];
{
let bindings = $target[1];
{
let nidx = $target[2];
return /*3599*/function name_3599($fn_arg) { return /*3599*/(function match_3599($target) {
if ($target.type === ",") {
{
let arg = $target[0];
{
let carg = $target[1];
return /*3611*/(function let_3611() {const $target = /*3622*//*3622*//*3622*//*3623*/t_pat/*<3623*/(/*3622*//*3625*/tenv/*<3625*/)/*<3622*/(/*3622*//*3626*/arg/*<3626*/)/*<3622*/(/*3622*//*3627*/nidx/*<3627*/)/*<3622*/;
if ($target.type === ",,") {
{
let pat_type = $target[0];
{
let pat_bind = $target[1];
{
let nidx = $target[2];
return /*3611*/(function let_3611() {const $target = /*3637*//*3637*//*3637*//*3638*/unify/*<3638*/(/*3637*//*3639*/pat_type/*<3639*/)/*<3637*/(/*3637*//*3640*/carg/*<3640*/)/*<3637*/(/*3637*//*3755*/nidx/*<3755*/)/*<3637*/;
if ($target.type === ",") {
{
let unified_subst = $target[0];
{
let nidx = $target[1];
return /*3616*//*3616*//*3616*//*3629*/$co$co/*<3629*/(/*3616*//*3630*//*3630*//*3631*/compose_subst/*<3631*/(/*3630*//*3632*/unified_subst/*<3632*/)/*<3630*/(/*3630*//*3641*/subst/*<3641*/)/*<3630*/)/*<3616*/(/*3616*//*3642*//*3642*//*3778*/map$slmerge/*<3778*/(/*3642*//*3779*/bindings/*<3779*/)/*<3642*/(/*3642*//*3780*/pat_bind/*<3780*/)/*<3642*/)/*<3616*/(/*3616*//*3643*/nidx/*<3643*/)/*<3616*/
}
}
};
throw new Error('let pattern not matched 3633. ' + valueToString($target));})(/*!*/)/*<3611*/
}
}
}
};
throw new Error('let pattern not matched 3617. ' + valueToString($target));})(/*!*/)/*<3611*/
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 3599');})(/*!*//*-1*/$fn_arg/*<-1*/)/*<3599*/ }/*<3599*/
}
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 3599');})(/*!*//*-1*/$fn_arg/*<-1*/)/*<3599*/ }/*<3599*/)/*<3590*/;
if ($target.type === ",,") {
{
let subst = $target[0];
{
let bindings = $target[1];
{
let nidx = $target[2];
return /*3492*//*3492*//*3492*//*3493*/$co$co/*<3493*/(/*3492*//*3494*//*3494*//*3645*/type_apply/*<3645*/(/*3494*//*3646*/subst/*<3646*/)/*<3494*/(/*3494*//*3647*/tres/*<3647*/)/*<3494*/)/*<3492*/(/*3492*//*3781*//*3781*//*3782*/map$slmap/*<3782*/(/*3781*//*3783*//*3784*/type_apply/*<3784*/(/*3783*//*3785*/subst/*<3785*/)/*<3783*/)/*<3781*/(/*3781*//*3851*/bindings/*<3851*/)/*<3781*/)/*<3492*/(/*3492*//*3648*/nidx/*<3648*/)/*<3492*/
}
}
}
};
throw new Error('let pattern not matched 3585. ' + valueToString($target));})(/*!*/)/*<3479*/
};
throw new Error('let pattern not matched 3580. ' + valueToString($target));})(/*!*/)/*<3479*/
};
throw new Error('let pattern not matched 3508. ' + valueToString($target));})(/*!*/)/*<3479*/
}
}
}
};
throw new Error('let pattern not matched 3497. ' + valueToString($target));})(/*!*/)/*<3479*/
}
}
}
};
throw new Error('let pattern not matched 3482. ' + valueToString($target));})(/*!*/)/*<3479*/
}
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 2475');})(/*!*//*2477*/pat/*<2477*/)/*<2475*/ }/*<2466*/ }/*<2466*/ }/*<2466*/;

const infer = /*1976*/function name_1976(tenv) { return /*1976*/function name_1976(expr) { return /*1984*/(function let_1984() {const $target = /*1992*//*1992*//*1992*//*1993*/t_expr/*<1993*/(/*1992*//*1994*/tenv/*<1994*/)/*<1992*/(/*1992*//*1995*/expr/*<1995*/)/*<1992*/(/*1992*//*1996*/0/*<1996*/)/*<1992*/;
if ($target.type === ",,") {
{
let s = $target[0];
{
let t = $target[1];
{
let nidx = $target[2];
return /*1997*//*1997*//*2000*/type_apply/*<2000*/(/*1997*//*2001*/s/*<2001*/)/*<1997*/(/*1997*//*2002*/t/*<2002*/)/*<1997*/
}
}
}
};
throw new Error('let pattern not matched 1987. ' + valueToString($target));})(/*!*/)/*<1984*/ }/*<1976*/ }/*<1976*/;

const tenv$slnil = /*3361*//*3361*//*3361*//*3362*/tenv/*<3362*/(/*3361*//*3363*/map$slnil/*<3363*/)/*<3361*/(/*3361*//*3364*/map$slnil/*<3364*/)/*<3361*/(/*3361*//*3365*/map$slnil/*<3365*/)/*<3361*/;

const basic = /*3374*//*3374*//*3374*//*3375*/tenv/*<3375*/(/*3374*//*3367*//*3368*/map$slfrom_list/*<3368*/(/*3367*//*3366*//*3366*//*3366*/cons/*<3366*/(/*3366*//*2042*//*2042*//*2043*/$co/*<2043*/(/*2042*//*2045*/"+"/*<2045*/)/*<2042*/(/*2042*//*2087*//*2087*//*2088*/scheme/*<2088*/(/*2087*//*2091*/set$slnil/*<2091*/)/*<2087*/(/*2087*//*2047*//*2047*//*2047*//*2048*/tfn/*<2048*/(/*2047*//*2049*/tint/*<2049*/)/*<2047*/(/*2047*//*2094*//*2094*//*2094*//*2095*/tfn/*<2095*/(/*2094*//*2096*/tint/*<2096*/)/*<2094*/(/*2094*//*2061*/tint/*<2061*/)/*<2094*/(/*2094*//*2097*/-1/*<2097*/)/*<2094*/)/*<2047*/(/*2047*//*2062*/-1/*<2062*/)/*<2047*/)/*<2087*/)/*<2042*/)/*<3366*/(/*3366*//*3366*//*3366*//*3366*/cons/*<3366*/(/*3366*//*9705*//*9705*//*9706*/$co/*<9706*/(/*9705*//*9707*/"-"/*<9707*/)/*<9705*/(/*9705*//*9709*//*9709*//*9710*/scheme/*<9710*/(/*9709*//*9711*/set$slnil/*<9711*/)/*<9709*/(/*9709*//*9712*//*9712*//*9712*//*9713*/tfn/*<9713*/(/*9712*//*9714*/tint/*<9714*/)/*<9712*/(/*9712*//*9715*//*9715*//*9715*//*9716*/tfn/*<9716*/(/*9715*//*9717*/tint/*<9717*/)/*<9715*/(/*9715*//*9718*/tint/*<9718*/)/*<9715*/(/*9715*//*9719*/-1/*<9719*/)/*<9715*/)/*<9712*/(/*9712*//*9720*/-1/*<9720*/)/*<9712*/)/*<9709*/)/*<9705*/)/*<3366*/(/*3366*//*3366*//*3366*//*3366*/cons/*<3366*/(/*3366*//*3369*//*3369*//*3370*/$co/*<3370*/(/*3369*//*3372*/","/*<3372*/)/*<3369*/(/*3369*//*2374*//*2374*//*2375*/scheme/*<2375*/(/*2374*//*2376*//*2380*/set$slfrom_list/*<2380*/(/*2376*//*3225*//*3225*//*3225*/cons/*<3225*/(/*3225*//*2382*/"a"/*<2382*/)/*<3225*/(/*3225*//*3225*//*3225*//*3225*/cons/*<3225*/(/*3225*//*3226*/"b"/*<3226*/)/*<3225*/(/*3225*//*3225*/nil/*<3225*/)/*<3225*/)/*<3225*/)/*<2376*/)/*<2374*/(/*2374*//*2377*//*2377*//*2377*//*2378*/tfn/*<2378*/(/*2377*//*2379*//*2379*//*2384*/tvar/*<2384*/(/*2379*//*2385*/"a"/*<2385*/)/*<2379*/(/*2379*//*2387*/-1/*<2387*/)/*<2379*/)/*<2377*/(/*2377*//*2388*//*2388*//*2388*//*2389*/tfn/*<2389*/(/*2388*//*2390*//*2390*//*2391*/tvar/*<2391*/(/*2390*//*2392*/"b"/*<2392*/)/*<2390*/(/*2390*//*2394*/-1/*<2394*/)/*<2390*/)/*<2388*/(/*2388*//*2402*//*2402*//*2402*//*2403*/tapp/*<2403*/(/*2402*//*2400*//*2400*//*2400*//*2401*/tapp/*<2401*/(/*2400*//*2395*//*2395*//*2396*/tcon/*<2396*/(/*2395*//*2397*/","/*<2397*/)/*<2395*/(/*2395*//*2399*/-1/*<2399*/)/*<2395*/)/*<2400*/(/*2400*//*2404*//*2404*//*2405*/tvar/*<2405*/(/*2404*//*2406*/"a"/*<2406*/)/*<2404*/(/*2404*//*2408*/-1/*<2408*/)/*<2404*/)/*<2400*/(/*2400*//*2409*/-1/*<2409*/)/*<2400*/)/*<2402*/(/*2402*//*2410*//*2410*//*2411*/tvar/*<2411*/(/*2410*//*2412*/"b"/*<2412*/)/*<2410*/(/*2410*//*2414*/-1/*<2414*/)/*<2410*/)/*<2402*/(/*2402*//*2415*/-1/*<2415*/)/*<2402*/)/*<2388*/(/*2388*//*2416*/-1/*<2416*/)/*<2388*/)/*<2377*/(/*2377*//*2417*/-1/*<2417*/)/*<2377*/)/*<2374*/)/*<3369*/)/*<3366*/(/*3366*//*3366*/nil/*<3366*/)/*<3366*/)/*<3366*/)/*<3366*/)/*<3367*/)/*<3374*/(/*3374*//*3376*//*3676*/map$slfrom_list/*<3676*/(/*3376*//*3677*//*3677*//*3677*/cons/*<3677*/(/*3677*//*3678*//*3678*//*3681*/$co/*<3681*/(/*3678*//*3682*/","/*<3682*/)/*<3678*/(/*3678*//*3684*//*3684*//*3684*//*3685*/tconstructor/*<3685*/(/*3684*//*3686*//*3687*/set$slfrom_list/*<3687*/(/*3686*//*3688*//*3688*//*3688*/cons/*<3688*/(/*3688*//*3689*/"a"/*<3689*/)/*<3688*/(/*3688*//*3688*//*3688*//*3688*/cons/*<3688*/(/*3688*//*3691*/"b"/*<3691*/)/*<3688*/(/*3688*//*3688*/nil/*<3688*/)/*<3688*/)/*<3688*/)/*<3686*/)/*<3684*/(/*3684*//*3693*//*3693*//*3693*/cons/*<3693*/(/*3693*//*3696*//*3696*//*3697*/tvar/*<3697*/(/*3696*//*3698*/"a"/*<3698*/)/*<3696*/(/*3696*//*3700*/-1/*<3700*/)/*<3696*/)/*<3693*/(/*3693*//*3693*//*3693*//*3693*/cons/*<3693*/(/*3693*//*3701*//*3701*//*3702*/tvar/*<3702*/(/*3701*//*3703*/"b"/*<3703*/)/*<3701*/(/*3701*//*3705*/-1/*<3705*/)/*<3701*/)/*<3693*/(/*3693*//*3693*/nil/*<3693*/)/*<3693*/)/*<3693*/)/*<3684*/(/*3684*//*3706*//*3706*//*3706*//*3707*/tapp/*<3707*/(/*3706*//*3708*//*3708*//*3708*//*3709*/tapp/*<3709*/(/*3708*//*3710*//*3710*//*3711*/tcon/*<3711*/(/*3710*//*3712*/","/*<3712*/)/*<3710*/(/*3710*//*3714*/-1/*<3714*/)/*<3710*/)/*<3708*/(/*3708*//*3715*//*3715*//*3716*/tvar/*<3716*/(/*3715*//*3717*/"a"/*<3717*/)/*<3715*/(/*3715*//*3719*/-1/*<3719*/)/*<3715*/)/*<3708*/(/*3708*//*3727*/-1/*<3727*/)/*<3708*/)/*<3706*/(/*3706*//*3720*//*3720*//*3721*/tvar/*<3721*/(/*3720*//*3722*/"b"/*<3722*/)/*<3720*/(/*3720*//*3724*/-1/*<3724*/)/*<3720*/)/*<3706*/(/*3706*//*3726*/-1/*<3726*/)/*<3706*/)/*<3684*/)/*<3678*/)/*<3677*/(/*3677*//*3677*/nil/*<3677*/)/*<3677*/)/*<3376*/)/*<3374*/(/*3374*//*3377*/map$slnil/*<3377*/)/*<3374*/;

const infer_show = /*4985*/function name_4985(tenv) { return /*4985*/function name_4985(x) { return /*4996*//*4997*/type_to_string/*<4997*/(/*4996*//*4998*//*4998*//*5000*/infer/*<5000*/(/*4998*//*5001*/tenv/*<5001*/)/*<4998*/(/*4998*//*5002*/x/*<5002*/)/*<4998*/)/*<4996*/ }/*<4985*/ }/*<4985*/;

const infer_stmt = /*2197*/function name_2197(tenv$qu) { return /*2197*/function name_2197(stmt) { return /*4547*/(function match_4547($target) {
if ($target.type === "sdef") {
{
let name = $target[0];
{
let nl = $target[1];
{
let expr = $target[2];
{
let l = $target[3];
return /*5499*/(function let_5499() {const $target = /*5554*/0/*<5554*/;
{
let nidx = $target;
return /*5499*/(function let_5499() {const $target = /*5569*//*5569*//*5570*/new_type_var/*<5570*/(/*5569*//*5572*/name/*<5572*/)/*<5569*/(/*5569*//*5571*/nidx/*<5571*/)/*<5569*/;
if ($target.type === ",") {
{
let self = $target[0];
{
let nidx = $target[1];
return /*5499*/(function let_5499() {const $target = /*5556*//*5556*//*5556*//*5557*/tenv$slset_type/*<5557*/(/*5556*//*5559*/tenv$qu/*<5559*/)/*<5556*/(/*5556*//*5560*/name/*<5560*/)/*<5556*/(/*5556*//*5561*//*5561*//*5562*/scheme/*<5562*/(/*5561*//*5563*/set$slnil/*<5563*/)/*<5561*/(/*5561*//*5564*/self/*<5564*/)/*<5561*/)/*<5556*/;
{
let self_bound = $target;
return /*5499*/(function let_5499() {const $target = /*5510*//*5510*//*5510*//*5511*/t_expr/*<5511*/(/*5510*//*5512*/self_bound/*<5512*/)/*<5510*/(/*5510*//*5513*/expr/*<5513*/)/*<5510*/(/*5510*//*5514*/nidx/*<5514*/)/*<5510*/;
if ($target.type === ",,") {
{
let s = $target[0];
{
let t = $target[1];
{
let nidx = $target[2];
return /*5499*/(function let_5499() {const $target = /*6510*//*6510*//*6511*/type_apply/*<6511*/(/*6510*//*6512*/s/*<6512*/)/*<6510*/(/*6510*//*6513*/self/*<6513*/)/*<6510*/;
{
let selfed = $target;
return /*5499*/(function let_5499() {const $target = /*5585*//*5585*//*5585*//*5586*/unify/*<5586*/(/*5585*//*6425*/selfed/*<6425*/)/*<5585*/(/*5585*//*5588*/t/*<5588*/)/*<5585*/(/*5585*//*5589*/nidx/*<5589*/)/*<5585*/;
if ($target.type === ",") {
{
let u_subst = $target[0];
{
let nidx = $target[1];
return /*5499*/(function let_5499() {const $target = /*6520*//*6520*//*6521*/compose_subst/*<6521*/(/*6520*//*6522*/u_subst/*<6522*/)/*<6520*/(/*6520*//*5574*//*5574*//*5575*/compose_subst/*<5575*/(/*5574*//*5577*/u_subst/*<5577*/)/*<5574*/(/*5574*//*6519*/s/*<6519*/)/*<5574*/)/*<6520*/;
{
let s2 = $target;
return /*5499*/(function let_5499() {const $target = /*5516*//*5516*//*5517*/type_apply/*<5517*/(/*5516*//*5518*/s2/*<5518*/)/*<5516*/(/*5516*//*5519*/t/*<5519*/)/*<5516*/;
{
let t = $target;
return /*4554*//*4554*//*4554*//*4555*/tenv$slset_type/*<4555*/(/*4554*//*4556*/tenv$qu/*<4556*/)/*<4554*/(/*4554*//*4557*/name/*<4557*/)/*<4554*/(/*4554*//*4558*//*4558*//*4559*/generalize/*<4559*/(/*4558*//*4560*/tenv$qu/*<4560*/)/*<4558*/(/*4558*//*4561*/t/*<4561*/)/*<4558*/)/*<4554*/
};
throw new Error('let pattern not matched 5515. ' + valueToString($target));})(/*!*/)/*<5499*/
};
throw new Error('let pattern not matched 5573. ' + valueToString($target));})(/*!*/)/*<5499*/
}
}
};
throw new Error('let pattern not matched 5581. ' + valueToString($target));})(/*!*/)/*<5499*/
};
throw new Error('let pattern not matched 6509. ' + valueToString($target));})(/*!*/)/*<5499*/
}
}
}
};
throw new Error('let pattern not matched 5505. ' + valueToString($target));})(/*!*/)/*<5499*/
};
throw new Error('let pattern not matched 5555. ' + valueToString($target));})(/*!*/)/*<5499*/
}
}
};
throw new Error('let pattern not matched 5565. ' + valueToString($target));})(/*!*/)/*<5499*/
};
throw new Error('let pattern not matched 5553. ' + valueToString($target));})(/*!*/)/*<5499*/
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
return /*4568*/(function let_4568() {const $target = /*4574*//*4574*//*4575*/infer/*<4575*/(/*4574*//*4576*/tenv$qu/*<4576*/)/*<4574*/(/*4574*//*4577*/expr/*<4577*/)/*<4574*/;
return /*4579*/tenv$qu/*<4579*/;
throw new Error('let pattern not matched 4573. ' + valueToString($target));})(/*!*/)/*<4568*/
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
return /*4583*/(function let_4583() {const $target = /*4592*/tenv$qu/*<4592*/;
if ($target.type === "tenv") {
{
let values = $target[0];
{
let cons = $target[1];
{
let types = $target[2];
return /*4583*/(function let_4583() {const $target = /*4595*//*4595*//*4596*/map/*<4596*/(/*4595*//*4597*/constructors/*<4597*/)/*<4595*/(/*4595*//*4598*/function name_4598($fn_arg) { return /*4598*/(function match_4598($target) {
if ($target.type === ",,,") {
{
let name = $target[0];
return /*4620*/name/*<4620*/
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 4598');})(/*!*//*-1*/$fn_arg/*<-1*/)/*<4598*/ }/*<4598*/)/*<4595*/;
{
let names = $target;
return /*4583*/(function let_4583() {const $target = /*4919*//*4919*//*4919*//*4920*/foldl/*<4920*/(/*4919*//*4921*//*4921*//*4922*/tcon/*<4922*/(/*4921*//*4923*/tname/*<4923*/)/*<4921*/(/*4921*//*4924*/tnl/*<4924*/)/*<4921*/)/*<4919*/(/*4919*//*4925*/targs/*<4925*/)/*<4919*/(/*4919*//*4928*/function name_4928(body) { return /*4928*/function name_4928($fn_arg) { return /*4928*/(function match_4928($target) {
if ($target.type === ",") {
{
let arg = $target[0];
{
let al = $target[1];
return /*4933*//*4933*//*4933*//*4934*/tapp/*<4934*/(/*4933*//*4935*/body/*<4935*/)/*<4933*/(/*4933*//*4936*//*4936*//*4937*/tvar/*<4937*/(/*4936*//*4938*/arg/*<4938*/)/*<4936*/(/*4936*//*4939*/al/*<4939*/)/*<4936*/)/*<4933*/(/*4933*//*4940*/l/*<4940*/)/*<4933*/
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 4928');})(/*!*//*-1*/$fn_arg/*<-1*/)/*<4928*/ }/*<4928*/ }/*<4928*/)/*<4919*/;
{
let final = $target;
return /*4583*/(function let_4583() {const $target = /*5233*//*5233*//*5233*//*5234*/foldl/*<5234*/(/*5233*//*5235*/set$slnil/*<5235*/)/*<5233*/(/*5233*//*5236*/targs/*<5236*/)/*<5233*/(/*5233*//*5237*/function name_5237(free) { return /*5237*/function name_5237($fn_arg) { return /*5237*/(function match_5237($target) {
if ($target.type === ",") {
{
let arg = $target[0];
return /*5245*//*5245*//*5246*/set$sladd/*<5246*/(/*5245*//*5247*/free/*<5247*/)/*<5245*/(/*5245*//*5248*/arg/*<5248*/)/*<5245*/
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 5237');})(/*!*//*-1*/$fn_arg/*<-1*/)/*<5237*/ }/*<5237*/ }/*<5237*/)/*<5233*/;
{
let free_set = $target;
return /*4583*/(function let_4583() {const $target = /*4622*//*4622*//*4622*//*4623*/foldl/*<4623*/(/*4622*//*4734*//*4734*//*4641*/$co/*<4641*/(/*4734*//*4739*/values/*<4739*/)/*<4734*/(/*4734*//*4735*/cons/*<4735*/)/*<4734*/)/*<4622*/(/*4622*//*4625*/constructors/*<4625*/)/*<4622*/(/*4622*//*4626*/function name_4626($fn_arg) { return /*4626*/(function match_4626($target) {
if ($target.type === ",") {
{
let values = $target[0];
{
let cons = $target[1];
return /*4626*/function name_4626($fn_arg) { return /*4626*/(function match_4626($target) {
if ($target.type === ",,,") {
{
let name = $target[0];
{
let nl = $target[1];
{
let args = $target[2];
{
let l = $target[3];
return /*4648*/(function let_4648() {const $target = /*5221*//*5221*//*5222*/map/*<5222*/(/*5221*//*5223*/args/*<5223*/)/*<5221*/(/*5221*//*5224*/function name_5224(arg) { return /*5228*//*5228*//*5229*/type_with_free/*<5229*/(/*5228*//*5230*/arg/*<5230*/)/*<5228*/(/*5228*//*5231*/free_set/*<5231*/)/*<5228*/ }/*<5224*/)/*<5221*/;
{
let args = $target;
return /*4741*//*4741*//*4743*/$co/*<4743*/(/*4741*//*4745*//*4745*//*4745*//*4746*/map$slset/*<4746*/(/*4745*//*4747*/values/*<4747*/)/*<4745*/(/*4745*//*4748*/name/*<4748*/)/*<4745*/(/*4745*//*4749*//*4749*//*4750*/scheme/*<4750*/(/*4749*//*4751*/free_set/*<4751*/)/*<4749*/(/*4749*//*4752*//*4752*//*4752*//*4756*/foldr/*<4756*/(/*4752*//*4757*/final/*<4757*/)/*<4752*/(/*4752*//*4782*/args/*<4782*/)/*<4752*/(/*4752*//*4783*/function name_4783(body) { return /*4783*/function name_4783(arg) { return /*4788*//*4788*//*4788*//*4789*/tfn/*<4789*/(/*4788*//*4790*/arg/*<4790*/)/*<4788*/(/*4788*//*4791*/body/*<4791*/)/*<4788*/(/*4788*//*4890*/l/*<4890*/)/*<4788*/ }/*<4783*/ }/*<4783*/)/*<4752*/)/*<4749*/)/*<4745*/)/*<4741*/(/*4741*//*4636*//*4636*//*4636*//*4637*/map$slset/*<4637*/(/*4636*//*4638*/cons/*<4638*/)/*<4636*/(/*4636*//*4639*/name/*<4639*/)/*<4636*/(/*4636*//*4640*//*4640*//*4640*//*4673*/tconstructor/*<4673*/(/*4640*//*4674*/free_set/*<4674*/)/*<4640*/(/*4640*//*4681*/args/*<4681*/)/*<4640*/(/*4640*//*4840*/final/*<4840*/)/*<4640*/)/*<4636*/)/*<4741*/
};
throw new Error('let pattern not matched 5220. ' + valueToString($target));})(/*!*/)/*<4648*/
}
}
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 4626');})(/*!*//*-1*/$fn_arg/*<-1*/)/*<4626*/ }/*<4626*/
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 4626');})(/*!*//*-1*/$fn_arg/*<-1*/)/*<4626*/ }/*<4626*/)/*<4622*/;
if ($target.type === ",") {
{
let values = $target[0];
{
let cons = $target[1];
return /*4682*//*4682*//*4682*//*4683*/tenv/*<4683*/(/*4682*//*4684*/values/*<4684*/)/*<4682*/(/*4682*//*4685*/cons/*<4685*/)/*<4682*/(/*4682*//*4686*//*4686*//*4686*//*4687*/map$slset/*<4687*/(/*4686*//*4688*/types/*<4688*/)/*<4686*/(/*4686*//*4689*/tname/*<4689*/)/*<4686*/(/*4686*//*4691*//*4692*/set$slfrom_list/*<4692*/(/*4691*//*4693*/names/*<4693*/)/*<4691*/)/*<4686*/)/*<4682*/
}
}
};
throw new Error('let pattern not matched 4731. ' + valueToString($target));})(/*!*/)/*<4583*/
};
throw new Error('let pattern not matched 5232. ' + valueToString($target));})(/*!*/)/*<4583*/
};
throw new Error('let pattern not matched 4918. ' + valueToString($target));})(/*!*/)/*<4583*/
};
throw new Error('let pattern not matched 4594. ' + valueToString($target));})(/*!*/)/*<4583*/
}
}
}
};
throw new Error('let pattern not matched 4586. ' + valueToString($target));})(/*!*/)/*<4583*/
}
}
}
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 4547');})(/*!*//*4549*/stmt/*<4549*/)/*<4547*/ }/*<2197*/ }/*<2197*/;

const several = /*6650*/function name_6650(tenv) { return /*6650*/function name_6650(stmts) { return /*6659*/(function match_6659($target) {
if ($target.type === "nil") {
return /*6689*//*6690*/fatal/*<6690*/(/*6689*//*6691*/"Final stmt should be an expr"/*<6691*/)/*<6689*/
}
if ($target.type === "cons") {
if ($target[0].type === "sexpr") {
{
let expr = $target[0][0];
if ($target[1].type === "nil") {
return /*6667*//*6667*//*6668*/infer/*<6668*/(/*6667*//*6669*/tenv/*<6669*/)/*<6667*/(/*6667*//*6671*/expr/*<6671*/)/*<6667*/
}
}
}
}
if ($target.type === "cons") {
{
let one = $target[0];
{
let rest = $target[1];
return /*6678*//*6678*//*6679*/several/*<6679*/(/*6678*//*6680*//*6680*//*6681*/infer_stmt/*<6681*/(/*6680*//*6682*/tenv/*<6682*/)/*<6680*/(/*6680*//*6683*/one/*<6683*/)/*<6680*/)/*<6678*/(/*6678*//*6687*/rest/*<6687*/)/*<6678*/
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 6659');})(/*!*//*6661*/stmts/*<6661*/)/*<6659*/ }/*<6650*/ }/*<6650*/;

const show_types = /*7912*/function name_7912(names) { return /*7912*/function name_7912($fn_arg) { return /*7912*/(function match_7912($target) {
if ($target.type === "tenv") {
{
let types = $target[0];
return /*8079*/(function let_8079() {const $target = /*8083*//*8084*/set$slfrom_list/*<8084*/(/*8083*//*8085*/names/*<8085*/)/*<8083*/;
{
let names = $target;
return /*7924*//*7924*//*7925*/map/*<7925*/(/*7924*//*8067*//*8067*//*8068*/filter/*<8068*/(/*8067*//*8069*/function name_8069($fn_arg) { return /*8069*/(function match_8069($target) {
if ($target.type === ",") {
{
let k = $target[0];
{
let v = $target[1];
return /*8076*//*8076*//*8077*/set$slhas/*<8077*/(/*8076*//*8078*/names/*<8078*/)/*<8076*/(/*8076*//*8086*/k/*<8086*/)/*<8076*/
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 8069');})(/*!*//*-1*/$fn_arg/*<-1*/)/*<8069*/ }/*<8069*/)/*<8067*/(/*8067*//*8087*//*8088*/map$slto_list/*<8088*/(/*8087*//*8089*/types/*<8089*/)/*<8087*/)/*<8067*/)/*<7924*/(/*7924*//*7927*/function name_7927($fn_arg) { return /*7927*/(function match_7927($target) {
if ($target.type === ",") {
{
let name = $target[0];
if ($target[1].type === "scheme") {
{
let free = $target[1][0];
{
let type = $target[1][1];
return /*7938*/(function match_7938($target) {
if ($target.type === "nil") {
return /*8095*/`${/*8098*/name/*<8098*/} = ${/*7990*//*7991*/type_to_string/*<7991*/(/*7990*//*7993*/type/*<7993*/)/*<7990*/}`/*<8095*/
}
{
let free = $target;
return /*7995*/`${/*8093*/name/*<8093*/} = ${/*7997*//*7997*//*7999*/join/*<7999*/(/*7997*//*8000*/","/*<8000*/)/*<7997*/(/*7997*//*8002*/free/*<8002*/)/*<7997*/} : ${/*8003*//*8005*/type_to_string_raw/*<8005*/(/*8003*//*8006*/type/*<8006*/)/*<8003*/}`/*<7995*/
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 7938');})(/*!*//*7986*//*7987*/set$slto_list/*<7987*/(/*7986*//*7988*/free/*<7988*/)/*<7986*/)/*<7938*/
}
}
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 7927');})(/*!*//*-1*/$fn_arg/*<-1*/)/*<7927*/ }/*<7927*/)/*<7924*/
};
throw new Error('let pattern not matched 8082. ' + valueToString($target));})(/*!*/)/*<8079*/
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 7912');})(/*!*//*-1*/$fn_arg/*<-1*/)/*<7912*/ }/*<7912*/ }/*<7912*/;

const show_types_list = /*8112*/function name_8112(types) { return /*8122*//*8122*//*8123*/join/*<8123*/(/*8122*//*8124*/"\n"/*<8124*/)/*<8122*/(/*8122*//*8118*//*8118*//*8119*/map/*<8119*/(/*8118*//*8120*/types/*<8120*/)/*<8118*/(/*8118*//*8121*/type_to_string_raw/*<8121*/)/*<8118*/)/*<8122*/ }/*<8112*/;

const show_subst = /*8126*/function name_8126(subst) { return /*8152*//*8152*//*8153*/join/*<8153*/(/*8152*//*8154*/"\n"/*<8154*/)/*<8152*/(/*8152*//*8132*//*8132*//*8133*/map/*<8133*/(/*8132*//*8134*//*8135*/map$slto_list/*<8135*/(/*8134*//*8136*/subst/*<8136*/)/*<8134*/)/*<8132*/(/*8132*//*8137*/function name_8137($fn_arg) { return /*8137*/(function match_8137($target) {
if ($target.type === ",") {
{
let name = $target[0];
{
let type = $target[1];
return /*8144*/`${/*8146*/name/*<8146*/} -> ${/*8148*//*8150*/type_to_string_raw/*<8150*/(/*8148*//*8151*/type/*<8151*/)/*<8148*/}`/*<8144*/
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 8137');})(/*!*//*-1*/$fn_arg/*<-1*/)/*<8137*/ }/*<8137*/)/*<8132*/)/*<8152*/ }/*<8126*/;

const show_substs = /*8245*/function name_8245(substs) { return /*8251*//*8251*//*8252*/join/*<8252*/(/*8251*//*8253*/"\n::\n"/*<8253*/)/*<8251*/(/*8251*//*8255*//*8255*//*8256*/map/*<8256*/(/*8255*//*8257*/substs/*<8257*/)/*<8255*/(/*8255*//*8258*/show_subst/*<8258*/)/*<8255*/)/*<8251*/ }/*<8245*/;

const infer_several = /*8292*/function name_8292(tenv) { return /*8292*/function name_8292(stmts) { return /*8300*/(function let_8300() {const $target = /*8305*/0/*<8305*/;
{
let nidx = $target;
return /*8300*/(function let_8300() {const $target = /*8734*//*8734*//*8741*/map/*<8741*/(/*8734*//*8742*/stmts/*<8742*/)/*<8734*/(/*8734*//*8743*/function name_8743($fn_arg) { return /*8743*/(function match_8743($target) {
if ($target.type === "sdef") {
{
let name = $target[0];
return /*8752*/name/*<8752*/
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 8743');})(/*!*//*-1*/$fn_arg/*<-1*/)/*<8743*/ }/*<8743*/)/*<8734*/;
{
let names = $target;
return /*8300*/(function let_8300() {const $target = /*8311*//*8311*//*8311*//*8312*/foldr/*<8312*/(/*8311*//*8313*//*8313*//*8313*//*8314*/$co$co/*<8314*/(/*8313*//*8315*/tenv/*<8315*/)/*<8313*/(/*8313*//*8316*/nil/*<8316*/)/*<8313*/(/*8313*//*8317*/nidx/*<8317*/)/*<8313*/)/*<8311*/(/*8311*//*8318*/stmts/*<8318*/)/*<8311*/(/*8311*//*8319*/function name_8319($fn_arg) { return /*8319*/(function match_8319($target) {
if ($target.type === ",,") {
{
let tenv$qu = $target[0];
{
let vars = $target[1];
{
let nidx = $target[2];
return /*8319*/function name_8319($fn_arg) { return /*8319*/(function match_8319($target) {
if ($target.type === "sdef") {
{
let name = $target[0];
{
let body = $target[2];
return /*8333*/(function let_8333() {const $target = /*8340*//*8340*//*8341*/new_type_var/*<8341*/(/*8340*//*8342*/name/*<8342*/)/*<8340*/(/*8340*//*8343*/nidx/*<8343*/)/*<8340*/;
if ($target.type === ",") {
{
let self = $target[0];
{
let nidx = $target[1];
return /*8344*//*8344*//*8344*//*8345*/$co$co/*<8345*/(/*8344*//*8346*//*8346*//*8346*//*8347*/tenv$slset_type/*<8347*/(/*8346*//*8348*/tenv$qu/*<8348*/)/*<8346*/(/*8346*//*8349*/name/*<8349*/)/*<8346*/(/*8346*//*8350*//*8350*//*8351*/scheme/*<8351*/(/*8350*//*8352*/set$slnil/*<8352*/)/*<8350*/(/*8350*//*8353*/self/*<8353*/)/*<8350*/)/*<8346*/)/*<8344*/(/*8344*//*8354*//*8354*//*8354*/cons/*<8354*/(/*8354*//*8355*/self/*<8355*/)/*<8354*/(/*8354*//*8356*/vars/*<8356*/)/*<8354*/)/*<8344*/(/*8344*//*8360*/nidx/*<8360*/)/*<8344*/
}
}
};
throw new Error('let pattern not matched 8336. ' + valueToString($target));})(/*!*/)/*<8333*/
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 8319');})(/*!*//*-1*/$fn_arg/*<-1*/)/*<8319*/ }/*<8319*/
}
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 8319');})(/*!*//*-1*/$fn_arg/*<-1*/)/*<8319*/ }/*<8319*/)/*<8311*/;
if ($target.type === ",,") {
{
let bound = $target[0];
{
let vars = $target[1];
{
let nidx = $target[2];
return /*8300*/(function let_8300() {const $target = /*8363*//*8363*//*8363*//*8364*/foldr/*<8364*/(/*8363*//*8365*//*8365*//*8365*//*8366*/$co$co/*<8366*/(/*8365*//*8367*/map$slnil/*<8367*/)/*<8365*/(/*8365*//*8368*/nil/*<8368*/)/*<8365*/(/*8365*//*8369*/nidx/*<8369*/)/*<8365*/)/*<8363*/(/*8363*//*8370*//*8370*//*8371*/zip/*<8371*/(/*8370*//*8372*/vars/*<8372*/)/*<8370*/(/*8370*//*8373*/stmts/*<8373*/)/*<8370*/)/*<8363*/(/*8363*//*8374*/function name_8374($fn_arg) { return /*8374*/(function match_8374($target) {
if ($target.type === ",,") {
{
let subst = $target[0];
{
let types = $target[1];
{
let nidx = $target[2];
return /*8374*/function name_8374($fn_arg) { return /*8374*/(function match_8374($target) {
if ($target.type === ",") {
{
let $var = $target[0];
if ($target[1].type === "sdef") {
{
let name = $target[1][0];
{
let body = $target[1][2];
return /*8391*/(function let_8391() {const $target = /*8399*//*8399*//*8399*//*8400*/t_expr/*<8400*/(/*8399*//*8612*//*8612*//*8401*/tenv_apply/*<8401*/(/*8612*//*8613*/subst/*<8613*/)/*<8612*/(/*8612*//*8614*/bound/*<8614*/)/*<8612*/)/*<8399*/(/*8399*//*8402*/body/*<8402*/)/*<8399*/(/*8399*//*8403*/nidx/*<8403*/)/*<8399*/;
if ($target.type === ",,") {
{
let body_subst = $target[0];
{
let body_type = $target[1];
{
let nidx = $target[2];
return /*8391*/(function let_8391() {const $target = /*8405*//*8405*//*8406*/type_apply/*<8406*/(/*8405*//*8505*//*8505*//*8506*/compose_subst/*<8506*/(/*8505*//*8407*/body_subst/*<8407*/)/*<8505*/(/*8505*//*8652*/subst/*<8652*/)/*<8505*/)/*<8405*/(/*8405*//*8408*/$var/*<8408*/)/*<8405*/;
{
let selfed = $target;
return /*8391*/(function let_8391() {const $target = /*8413*//*8413*//*8413*//*8414*/unify/*<8414*/(/*8413*//*8415*/selfed/*<8415*/)/*<8413*/(/*8413*//*8416*/body_type/*<8416*/)/*<8413*/(/*8413*//*8417*/nidx/*<8417*/)/*<8413*/;
if ($target.type === ",") {
{
let u_subst = $target[0];
{
let nidx = $target[1];
return /*8391*/(function let_8391() {const $target = /*8428*//*8428*//*8429*/compose_subst/*<8429*/(/*8428*//*8502*//*8502*//*8431*/compose_subst/*<8431*/(/*8502*//*8503*/u_subst/*<8503*/)/*<8502*/(/*8502*//*8504*/body_subst/*<8504*/)/*<8502*/)/*<8428*/(/*8428*//*8653*/subst/*<8653*/)/*<8428*/;
{
let subst = $target;
return /*8418*//*8418*//*8418*//*8419*/$co$co/*<8419*/(/*8418*//*8420*/subst/*<8420*/)/*<8418*/(/*8418*//*8435*//*8435*//*8435*/cons/*<8435*/(/*8435*//*8425*//*8425*//*8426*/type_apply/*<8426*/(/*8425*//*8432*/subst/*<8432*/)/*<8425*/(/*8425*//*8433*/body_type/*<8433*/)/*<8425*/)/*<8435*/(/*8435*//*8436*/types/*<8436*/)/*<8435*/)/*<8418*/(/*8418*//*8434*/nidx/*<8434*/)/*<8418*/
};
throw new Error('let pattern not matched 8427. ' + valueToString($target));})(/*!*/)/*<8391*/
}
}
};
throw new Error('let pattern not matched 8409. ' + valueToString($target));})(/*!*/)/*<8391*/
};
throw new Error('let pattern not matched 8404. ' + valueToString($target));})(/*!*/)/*<8391*/
}
}
}
};
throw new Error('let pattern not matched 8394. ' + valueToString($target));})(/*!*/)/*<8391*/
}
}
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 8374');})(/*!*//*-1*/$fn_arg/*<-1*/)/*<8374*/ }/*<8374*/
}
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 8374');})(/*!*//*-1*/$fn_arg/*<-1*/)/*<8374*/ }/*<8374*/)/*<8363*/;
if ($target.type === ",,") {
{
let subst = $target[0];
{
let types = $target[1];
{
let nidx = $target[2];
return /*8753*//*8753*//*8754*/zip/*<8754*/(/*8753*//*8755*/names/*<8755*/)/*<8753*/(/*8753*//*8496*//*8496*//*8494*/map/*<8494*/(/*8496*//*8497*/types/*<8497*/)/*<8496*/(/*8496*//*8498*//*8499*/type_apply/*<8499*/(/*8498*//*8500*/subst/*<8500*/)/*<8498*/)/*<8496*/)/*<8753*/
}
}
}
};
throw new Error('let pattern not matched 8488. ' + valueToString($target));})(/*!*/)/*<8300*/
}
}
}
};
throw new Error('let pattern not matched 8306. ' + valueToString($target));})(/*!*/)/*<8300*/
};
throw new Error('let pattern not matched 8732. ' + valueToString($target));})(/*!*/)/*<8300*/
};
throw new Error('let pattern not matched 8304. ' + valueToString($target));})(/*!*/)/*<8300*/ }/*<8292*/ }/*<8292*/;

const infer_defns = /*8724*/function name_8724(tenv) { return /*8724*/function name_8724(stmts) { return /*8731*//*8731*//*8731*//*8775*/foldl/*<8775*/(/*8731*//*8776*/tenv/*<8776*/)/*<8731*/(/*8731*//*8777*//*8777*//*8778*/infer_several/*<8778*/(/*8777*//*8779*/tenv/*<8779*/)/*<8777*/(/*8777*//*8780*/stmts/*<8780*/)/*<8777*/)/*<8731*/(/*8731*//*8781*/function name_8781(tenv) { return /*8781*/function name_8781($fn_arg) { return /*8781*/(function match_8781($target) {
if ($target.type === ",") {
{
let name = $target[0];
{
let type = $target[1];
return /*8789*//*8789*//*8789*//*8790*/tenv$slset_type/*<8790*/(/*8789*//*8791*/tenv/*<8791*/)/*<8789*/(/*8789*//*8792*/name/*<8792*/)/*<8789*/(/*8789*//*8793*//*8793*//*8794*/generalize/*<8794*/(/*8793*//*8795*/tenv/*<8795*/)/*<8793*/(/*8793*//*8796*/type/*<8796*/)/*<8793*/)/*<8789*/
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 8781');})(/*!*//*-1*/$fn_arg/*<-1*/)/*<8781*/ }/*<8781*/ }/*<8781*/)/*<8731*/ }/*<8724*/ }/*<8724*/;

const one = (v0) => ({type: "one", 0: v0});
const many = (v0) => ({type: "many", 0: v0});
const empty = ({type: "empty"});
const bag$sland = /*7061*/function name_7061(first) { return /*7061*/function name_7061(second) { return /*7073*/(function match_7073($target) {
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
return /*7090*//*7104*/many/*<7104*/(/*7090*//*7105*//*7105*//*7105*/cons/*<7105*/(/*7105*//*7106*/a/*<7106*/)/*<7105*/(/*7105*//*7108*/b/*<7108*/)/*<7105*/)/*<7090*/
}
}
}
}
}
}
}
if ($target.type === ",") {
if ($target[0].type === "many") {
{
let a = $target[0][0];
if ($target[1].type === "many") {
if ($target[1][0].type === "cons") {
{
let b = $target[1][0][0];
if ($target[1][0][1].type === "nil") {
return /*7120*//*7121*/many/*<7121*/(/*7120*//*7122*//*7122*//*7122*/cons/*<7122*/(/*7122*//*7123*/b/*<7123*/)/*<7122*/(/*7122*//*7124*/a/*<7124*/)/*<7122*/)/*<7120*/
}
}
}
}
}
}
}
return /*7129*//*7130*/many/*<7130*/(/*7129*//*7131*//*7131*//*7131*/cons/*<7131*/(/*7131*//*7138*/first/*<7138*/)/*<7131*/(/*7131*//*7131*//*7131*//*7131*/cons/*<7131*/(/*7131*//*7139*/second/*<7139*/)/*<7131*/(/*7131*//*7131*/nil/*<7131*/)/*<7131*/)/*<7131*/)/*<7129*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 7073');})(/*!*//*7075*//*7075*//*7076*/$co/*<7076*/(/*7075*//*7077*/first/*<7077*/)/*<7075*/(/*7075*//*7078*/second/*<7078*/)/*<7075*/)/*<7073*/ }/*<7061*/ }/*<7061*/;

const concat = /*7401*/function name_7401(one) { return /*7401*/function name_7401(two) { return /*7408*/(function match_7408($target) {
if ($target.type === "nil") {
return /*7412*/two/*<7412*/
}
if ($target.type === "cons") {
{
let one = $target[0];
if ($target[1].type === "nil") {
return /*7416*//*7416*//*7416*/cons/*<7416*/(/*7416*//*7417*/one/*<7417*/)/*<7416*/(/*7416*//*7418*/two/*<7418*/)/*<7416*/
}
}
}
if ($target.type === "cons") {
{
let one = $target[0];
{
let rest = $target[1];
return /*7428*//*7428*//*7428*/cons/*<7428*/(/*7428*//*7429*/one/*<7429*/)/*<7428*/(/*7428*//*7430*//*7430*//*7434*/concat/*<7434*/(/*7430*//*7437*/rest/*<7437*/)/*<7430*/(/*7430*//*7438*/two/*<7438*/)/*<7430*/)/*<7428*/
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 7408');})(/*!*//*7410*/one/*<7410*/)/*<7408*/ }/*<7401*/ }/*<7401*/;

const bag$slto_list = /*7377*/function name_7377(bag) { return /*7383*/(function match_7383($target) {
if ($target.type === "empty") {
return /*7390*/nil/*<7390*/
}
if ($target.type === "one") {
{
let a = $target[0];
return /*7395*//*7395*//*7395*/cons/*<7395*/(/*7395*//*7400*/a/*<7400*/)/*<7395*/(/*7395*//*7395*/nil/*<7395*/)/*<7395*/
}
}
if ($target.type === "many") {
{
let bags = $target[0];
return /*7441*//*7441*//*7441*//*7442*/foldl/*<7442*/(/*7441*//*7443*/nil/*<7443*/)/*<7441*/(/*7441*//*7444*/bags/*<7444*/)/*<7441*/(/*7441*//*7445*/function name_7445(res) { return /*7445*/function name_7445(bag) { return /*7450*/(function match_7450($target) {
if ($target.type === "empty") {
return /*7455*/res/*<7455*/
}
if ($target.type === "one") {
{
let a = $target[0];
return /*7459*//*7459*//*7459*/cons/*<7459*/(/*7459*//*7460*/a/*<7460*/)/*<7459*/(/*7459*//*7461*/res/*<7461*/)/*<7459*/
}
}
return /*7468*//*7468*//*7469*/concat/*<7469*/(/*7468*//*7470*//*7471*/bag$slto_list/*<7471*/(/*7470*//*7472*/bag/*<7472*/)/*<7470*/)/*<7468*/(/*7468*//*7473*/res/*<7473*/)/*<7468*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 7450');})(/*!*//*7452*/bag/*<7452*/)/*<7450*/ }/*<7445*/ }/*<7445*/)/*<7441*/
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 7383');})(/*!*//*7385*/bag/*<7385*/)/*<7383*/ }/*<7377*/;

const pat_names = /*7177*/function name_7177(pat) { return /*7183*/(function match_7183($target) {
if ($target.type === "pany") {
return /*7208*/set$slnil/*<7208*/
}
if ($target.type === "pvar") {
{
let name = $target[0];
{
let l = $target[1];
return /*7209*//*7209*//*7210*/set$sladd/*<7210*/(/*7209*//*7211*/set$slnil/*<7211*/)/*<7209*/(/*7209*//*7212*/name/*<7212*/)/*<7209*/
}
}
}
if ($target.type === "pcon") {
{
let string = $target[0];
{
let args = $target[1];
{
let int = $target[2];
return /*7213*//*7213*//*7213*//*7214*/foldl/*<7214*/(/*7213*//*7215*/set$slnil/*<7215*/)/*<7213*/(/*7213*//*7216*/args/*<7216*/)/*<7213*/(/*7213*//*7217*/function name_7217(bound) { return /*7217*/function name_7217(arg) { return /*7226*//*7226*//*7227*/set$slmerge/*<7227*/(/*7226*//*7229*/bound/*<7229*/)/*<7226*/(/*7226*//*7230*//*7231*/pat_names/*<7231*/(/*7230*//*7232*/arg/*<7232*/)/*<7230*/)/*<7226*/ }/*<7217*/ }/*<7217*/)/*<7213*/
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

const externals = /*6917*/function name_6917(bound) { return /*6917*/function name_6917(expr) { return /*6925*/(function match_6925($target) {
if ($target.type === "evar") {
{
let name = $target[0];
{
let l = $target[1];
return /*6933*/(function match_6933($target) {
if ($target === true) {
return /*6943*/empty/*<6943*/
}
return /*7029*//*7030*/one/*<7030*/(/*7029*//*6949*//*6949*//*6950*/$co/*<6950*/(/*6949*//*6951*/name/*<6951*/)/*<6949*/(/*6949*//*6953*/l/*<6953*/)/*<6949*/)/*<7029*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 6933');})(/*!*//*6939*//*6939*//*6940*/set$slhas/*<6940*/(/*6939*//*6941*/bound/*<6941*/)/*<6939*/(/*6939*//*6942*/name/*<6942*/)/*<6939*/)/*<6933*/
}
}
}
if ($target.type === "eprim") {
{
let prim = $target[0];
{
let l = $target[1];
return /*7002*/empty/*<7002*/
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
return /*7003*//*7036*/many/*<7036*/(/*7003*//*7037*//*7037*//*7038*/map/*<7038*/(/*7037*//*7043*/templates/*<7043*/)/*<7037*/(/*7037*//*7044*/function name_7044($fn_arg) { return /*7044*/(function match_7044($target) {
if ($target.type === ",,") {
{
let expr = $target[0];
return /*7039*//*7039*//*7041*/externals/*<7041*/(/*7039*//*7042*/bound/*<7042*/)/*<7039*/(/*7039*//*7054*/expr/*<7054*/)/*<7039*/
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 7044');})(/*!*//*-1*/$fn_arg/*<-1*/)/*<7044*/ }/*<7044*/)/*<7037*/)/*<7003*/
}
}
}
}
if ($target.type === "equot") {
{
let expr = $target[0];
{
let int = $target[1];
return /*7005*/empty/*<7005*/
}
}
}
if ($target.type === "equotquot") {
{
let cst = $target[0];
{
let int = $target[1];
return /*7006*/empty/*<7006*/
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
return /*7007*//*7007*//*7055*/externals/*<7055*/(/*7007*//*7056*//*7056*//*7057*/set$sladd/*<7057*/(/*7056*//*7058*/bound/*<7058*/)/*<7056*/(/*7056*//*7059*/name/*<7059*/)/*<7056*/)/*<7007*/(/*7007*//*7060*/body/*<7060*/)/*<7007*/
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
return /*8857*//*8857*//*8858*/bag$sland/*<8858*/(/*8857*//*8859*//*8859*//*8860*/externals/*<8860*/(/*8859*//*8861*/bound/*<8861*/)/*<8859*/(/*8859*//*8862*/init/*<8862*/)/*<8859*/)/*<8857*/(/*8857*//*8863*//*8863*//*8864*/externals/*<8864*/(/*8863*//*8865*//*8865*//*8866*/set$slmerge/*<8866*/(/*8865*//*8867*/bound/*<8867*/)/*<8865*/(/*8865*//*8868*//*8869*/pat_names/*<8869*/(/*8868*//*8870*/pat/*<8870*/)/*<8868*/)/*<8865*/)/*<8863*/(/*8863*//*8871*/body/*<8871*/)/*<8863*/)/*<8857*/
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
return /*7008*//*7008*//*7146*/bag$sland/*<7146*/(/*7008*//*7147*//*7147*//*7148*/externals/*<7148*/(/*7147*//*7150*/bound/*<7150*/)/*<7147*/(/*7147*//*7152*/target/*<7152*/)/*<7147*/)/*<7008*/(/*7008*//*7153*//*7153*//*7154*/externals/*<7154*/(/*7153*//*7155*/bound/*<7155*/)/*<7153*/(/*7153*//*7156*/arg/*<7156*/)/*<7153*/)/*<7008*/
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
return /*7157*//*7157*//*7158*/bag$sland/*<7158*/(/*7157*//*7159*//*7159*//*7160*/externals/*<7160*/(/*7159*//*7161*/bound/*<7161*/)/*<7159*/(/*7159*//*7162*/expr/*<7162*/)/*<7159*/)/*<7157*/(/*7157*//*7163*//*7163*//*7163*//*7164*/foldl/*<7164*/(/*7163*//*7166*/empty/*<7166*/)/*<7163*/(/*7163*//*7167*/cases/*<7167*/)/*<7163*/(/*7163*//*7168*/function name_7168(bag) { return /*7168*/function name_7168($fn_arg) { return /*7168*/(function match_7168($target) {
if ($target.type === ",") {
{
let pat = $target[0];
{
let body = $target[1];
return /*7176*//*7176*//*7244*/bag$sland/*<7244*/(/*7176*//*7245*/bag/*<7245*/)/*<7176*/(/*7176*//*7246*//*7246*//*7247*/externals/*<7247*/(/*7246*//*7248*//*7248*//*7249*/set$slmerge/*<7249*/(/*7248*//*7250*/bound/*<7250*/)/*<7248*/(/*7248*//*7251*//*7252*/pat_names/*<7252*/(/*7251*//*7253*/pat/*<7253*/)/*<7251*/)/*<7248*/)/*<7246*/(/*7246*//*7254*/body/*<7254*/)/*<7246*/)/*<7176*/
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 7168');})(/*!*//*-1*/$fn_arg/*<-1*/)/*<7168*/ }/*<7168*/ }/*<7168*/)/*<7163*/)/*<7157*/
}
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 6925');})(/*!*//*6927*/expr/*<6927*/)/*<6925*/ }/*<6917*/ }/*<6917*/;

const externals_type = /*7334*/function name_7334(bound) { return /*7334*/function name_7334(type) { return /*7342*//*7342*//*7346*/set$sldiff/*<7346*/(/*7342*//*7347*//*7349*/type_free/*<7349*/(/*7347*//*7350*/type/*<7350*/)/*<7347*/)/*<7342*/(/*7342*//*7352*/bound/*<7352*/)/*<7342*/ }/*<7334*/ }/*<7334*/;

const names = /*7511*/function name_7511(stmt) { return /*7517*/(function match_7517($target) {
if ($target.type === "sdef") {
{
let name = $target[0];
return /*7526*//*7526*//*7526*/cons/*<7526*/(/*7526*//*7527*/name/*<7527*/)/*<7526*/(/*7526*//*7526*/nil/*<7526*/)/*<7526*/
}
}
if ($target.type === "sexpr") {
return /*7532*/nil/*<7532*/
}
if ($target.type === "sdeftype") {
{
let constructors = $target[3];
return /*7540*//*7540*//*7541*/map/*<7541*/(/*7540*//*7542*/constructors/*<7542*/)/*<7540*/(/*7540*//*7543*/function name_7543($fn_arg) { return /*7543*/(function match_7543($target) {
if ($target.type === ",,,") {
{
let name = $target[0];
return /*7552*/name/*<7552*/
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 7543');})(/*!*//*-1*/$fn_arg/*<-1*/)/*<7543*/ }/*<7543*/)/*<7540*/
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 7517');})(/*!*//*7519*/stmt/*<7519*/)/*<7517*/ }/*<7511*/;

const externals_stmt = /*7289*/function name_7289(stmt) { return /*7505*//*7506*/bag$slto_list/*<7506*/(/*7505*//*7296*/(function match_7296($target) {
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
return /*7332*/empty/*<7332*/
}
}
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
return /*7333*//*7333*//*7360*/externals/*<7360*/(/*7333*//*7363*//*7363*//*7365*/set$sladd/*<7365*/(/*7363*//*7366*/set$slnil/*<7366*/)/*<7363*/(/*7363*//*7367*/name/*<7367*/)/*<7363*/)/*<7333*/(/*7333*//*7364*/body/*<7364*/)/*<7333*/
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
return /*7368*//*7368*//*7369*/externals/*<7369*/(/*7368*//*7370*/set$slnil/*<7370*/)/*<7368*/(/*7368*//*7372*/expr/*<7372*/)/*<7368*/
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 7296');})(/*!*//*7299*/stmt/*<7299*/)/*<7296*/)/*<7505*/ }/*<7289*/;

const tmap = /*8997*/function name_8997(k) { return /*8997*/function name_8997(v) { return /*9004*//*9004*//*9004*//*9005*/tapp/*<9005*/(/*9004*//*9006*//*9006*//*9006*//*9007*/tapp/*<9007*/(/*9006*//*9008*//*9008*//*9009*/tcon/*<9009*/(/*9008*//*9010*/"map"/*<9010*/)/*<9008*/(/*9008*//*9012*/-1/*<9012*/)/*<9008*/)/*<9006*/(/*9006*//*9013*/k/*<9013*/)/*<9006*/(/*9006*//*9732*/-1/*<9732*/)/*<9006*/)/*<9004*/(/*9004*//*9018*/v/*<9018*/)/*<9004*/(/*9004*//*9730*/-1/*<9730*/)/*<9004*/ }/*<8997*/ }/*<8997*/;

const tfns = /*9041*/function name_9041(args) { return /*9041*/function name_9041(result) { return /*9048*//*9048*//*9048*//*9049*/foldr/*<9049*/(/*9048*//*9050*/result/*<9050*/)/*<9048*/(/*9048*//*9051*/args/*<9051*/)/*<9048*/(/*9048*//*9052*/function name_9052(result) { return /*9052*/function name_9052(arg) { return /*9059*//*9059*//*9059*//*9060*/tfn/*<9060*/(/*9059*//*9061*/arg/*<9061*/)/*<9059*/(/*9059*//*9062*/result/*<9062*/)/*<9059*/(/*9059*//*9063*/-1/*<9063*/)/*<9059*/ }/*<9052*/ }/*<9052*/)/*<9048*/ }/*<9041*/ }/*<9041*/;

const toption = /*9110*/function name_9110(arg) { return /*9116*//*9116*//*9116*//*9117*/tapp/*<9117*/(/*9116*//*9118*//*9118*//*9119*/tcon/*<9119*/(/*9118*//*9120*/"option"/*<9120*/)/*<9118*/(/*9118*//*9122*/-1/*<9122*/)/*<9118*/)/*<9116*/(/*9116*//*9123*/arg/*<9123*/)/*<9116*/(/*9116*//*9139*/-1/*<9139*/)/*<9116*/ }/*<9110*/;

const tarray = /*9124*/function name_9124(arg) { return /*9130*//*9130*//*9130*//*9131*/tapp/*<9131*/(/*9130*//*9132*//*9132*//*9133*/tcon/*<9133*/(/*9132*//*9134*/"array"/*<9134*/)/*<9132*/(/*9132*//*9136*/-1/*<9136*/)/*<9132*/)/*<9130*/(/*9130*//*9137*/arg/*<9137*/)/*<9130*/(/*9130*//*9138*/-1/*<9138*/)/*<9130*/ }/*<9124*/;

const tset = /*9390*/function name_9390(arg) { return /*9396*//*9396*//*9396*//*9397*/tapp/*<9397*/(/*9396*//*9400*//*9400*//*9401*/tcon/*<9401*/(/*9400*//*9402*/"set"/*<9402*/)/*<9400*/(/*9400*//*9404*/-1/*<9404*/)/*<9400*/)/*<9396*/(/*9396*//*9405*/arg/*<9405*/)/*<9396*/(/*9396*//*9406*/-1/*<9406*/)/*<9396*/ }/*<9390*/;

const concrete = /*9144*/function name_9144(t) { return /*9150*//*9150*//*9151*/scheme/*<9151*/(/*9150*//*9152*/set$slnil/*<9152*/)/*<9150*/(/*9150*//*9153*/t/*<9153*/)/*<9150*/ }/*<9144*/;

const generic = /*9154*/function name_9154(vbls) { return /*9154*/function name_9154(t) { return /*9161*//*9161*//*9162*/scheme/*<9162*/(/*9161*//*9164*//*9165*/set$slfrom_list/*<9165*/(/*9164*//*9166*/vbls/*<9166*/)/*<9164*/)/*<9161*/(/*9161*//*9167*/t/*<9167*/)/*<9161*/ }/*<9154*/ }/*<9154*/;

const vbl = /*9178*/function name_9178(k) { return /*9185*//*9185*//*9186*/tvar/*<9186*/(/*9185*//*9187*/k/*<9187*/)/*<9185*/(/*9185*//*9188*/-1/*<9188*/)/*<9185*/ }/*<9178*/;

const t$co = /*9544*/function name_9544(a) { return /*9544*/function name_9544(b) { return /*9551*//*9551*//*9551*//*9552*/tapp/*<9552*/(/*9551*//*9553*//*9553*//*9553*//*9554*/tapp/*<9554*/(/*9553*//*9555*//*9555*//*9556*/tcon/*<9556*/(/*9555*//*9557*/","/*<9557*/)/*<9555*/(/*9555*//*9559*/-1/*<9559*/)/*<9555*/)/*<9553*/(/*9553*//*9560*/a/*<9560*/)/*<9553*/(/*9553*//*9731*/-1/*<9731*/)/*<9553*/)/*<9551*/(/*9551*//*9561*/b/*<9561*/)/*<9551*/(/*9551*//*9729*/-1/*<9729*/)/*<9551*/ }/*<9544*/ }/*<9544*/;

const builtin_env = /*9239*/(function let_9239() {const $target = /*9243*//*9244*/vbl/*<9244*/(/*9243*//*9245*/"k"/*<9245*/)/*<9243*/;
{
let k = $target;
return /*9239*/(function let_9239() {const $target = /*9248*//*9249*/vbl/*<9249*/(/*9248*//*9250*/"v"/*<9250*/)/*<9248*/;
{
let v = $target;
return /*9239*/(function let_9239() {const $target = /*9317*//*9318*/vbl/*<9318*/(/*9317*//*9319*/"v2"/*<9319*/)/*<9317*/;
{
let v2 = $target;
return /*9239*/(function let_9239() {const $target = /*9418*//*9419*/generic/*<9419*/(/*9418*//*9420*//*9420*//*9420*/cons/*<9420*/(/*9420*//*9421*/"k"/*<9421*/)/*<9420*/(/*9420*//*9420*//*9420*//*9420*/cons/*<9420*/(/*9420*//*9423*/"v"/*<9423*/)/*<9420*/(/*9420*//*9420*/nil/*<9420*/)/*<9420*/)/*<9420*/)/*<9418*/;
{
let kv = $target;
return /*9239*/(function let_9239() {const $target = /*9426*//*9427*/generic/*<9427*/(/*9426*//*9428*//*9428*//*9428*/cons/*<9428*/(/*9428*//*9429*/"k"/*<9429*/)/*<9428*/(/*9428*//*9428*/nil/*<9428*/)/*<9428*/)/*<9426*/;
{
let kk = $target;
return /*5253*//*5253*//*5253*//*5254*/foldl/*<5254*/(/*5253*//*5255*//*5255*//*5255*//*5281*/tenv/*<5281*/(/*5255*//*5282*//*5286*/map$slfrom_list/*<5286*/(/*5282*//*5287*//*5287*//*5287*/cons/*<5287*/(/*5287*//*5289*//*5289*//*5290*/$co/*<5290*/(/*5289*//*5291*/"+"/*<5291*/)/*<5289*/(/*5289*//*5293*//*9168*/concrete/*<9168*/(/*5293*//*5296*//*5296*//*9074*/tfns/*<9074*/(/*5296*//*9075*//*9075*//*9075*/cons/*<9075*/(/*9075*//*9076*/tint/*<9076*/)/*<9075*/(/*9075*//*9075*//*9075*//*9075*/cons/*<9075*/(/*9075*//*9077*/tint/*<9077*/)/*<9075*/(/*9075*//*9075*/nil/*<9075*/)/*<9075*/)/*<9075*/)/*<5296*/(/*5296*//*9078*/tint/*<9078*/)/*<5296*/)/*<5293*/)/*<5289*/)/*<5287*/(/*5287*//*5287*//*5287*//*5287*/cons/*<5287*/(/*5287*//*5380*//*5380*//*5381*/$co/*<5381*/(/*5380*//*5382*/"-"/*<5382*/)/*<5380*/(/*5380*//*5384*//*9169*/concrete/*<9169*/(/*5384*//*5387*//*5387*//*9079*/tfns/*<9079*/(/*5387*//*9080*//*9080*//*9080*/cons/*<9080*/(/*9080*//*9081*/tint/*<9081*/)/*<9080*/(/*9080*//*9080*//*9080*//*9080*/cons/*<9080*/(/*9080*//*9082*/tint/*<9082*/)/*<9080*/(/*9080*//*9080*/nil/*<9080*/)/*<9080*/)/*<9080*/)/*<5387*/(/*5387*//*9083*/tint/*<9083*/)/*<5387*/)/*<5384*/)/*<5380*/)/*<5287*/(/*5287*//*5287*//*5287*//*5287*/cons/*<5287*/(/*5287*//*5396*//*5396*//*5397*/$co/*<5397*/(/*5396*//*5398*/">"/*<5398*/)/*<5396*/(/*5396*//*5400*//*5401*/concrete/*<5401*/(/*5400*//*5403*//*5403*//*9084*/tfns/*<9084*/(/*5403*//*9085*//*9085*//*9085*/cons/*<9085*/(/*9085*//*9086*/tint/*<9086*/)/*<9085*/(/*9085*//*9085*//*9085*//*9085*/cons/*<9085*/(/*9085*//*9087*/tint/*<9087*/)/*<9085*/(/*9085*//*9085*/nil/*<9085*/)/*<9085*/)/*<9085*/)/*<5403*/(/*5403*//*9088*/tbool/*<9088*/)/*<5403*/)/*<5400*/)/*<5396*/)/*<5287*/(/*5287*//*5287*//*5287*//*5287*/cons/*<5287*/(/*5287*//*5422*//*5422*//*5423*/$co/*<5423*/(/*5422*//*5424*/"<"/*<5424*/)/*<5422*/(/*5422*//*5426*//*5427*/concrete/*<5427*/(/*5426*//*5429*//*5429*//*9089*/tfns/*<9089*/(/*5429*//*9090*//*9090*//*9090*/cons/*<9090*/(/*9090*//*9091*/tint/*<9091*/)/*<9090*/(/*9090*//*9090*//*9090*//*9090*/cons/*<9090*/(/*9090*//*9092*/tint/*<9092*/)/*<9090*/(/*9090*//*9090*/nil/*<9090*/)/*<9090*/)/*<9090*/)/*<5429*/(/*5429*//*9093*/tbool/*<9093*/)/*<5429*/)/*<5426*/)/*<5422*/)/*<5287*/(/*5287*//*5287*//*5287*//*5287*/cons/*<5287*/(/*5287*//*5438*//*5438*//*5439*/$co/*<5439*/(/*5438*//*5440*/"="/*<5440*/)/*<5438*/(/*5438*//*5442*//*5443*/concrete/*<5443*/(/*5442*//*5445*//*5445*//*9094*/tfns/*<9094*/(/*5445*//*9095*//*9095*//*9095*/cons/*<9095*/(/*9095*//*9096*/tint/*<9096*/)/*<9095*/(/*9095*//*9095*//*9095*//*9095*/cons/*<9095*/(/*9095*//*9097*/tint/*<9097*/)/*<9095*/(/*9095*//*9095*/nil/*<9095*/)/*<9095*/)/*<9095*/)/*<5445*/(/*5445*//*9098*/tbool/*<9098*/)/*<5445*/)/*<5442*/)/*<5438*/)/*<5287*/(/*5287*//*5287*//*5287*//*5287*/cons/*<5287*/(/*5287*//*5454*//*5454*//*5455*/$co/*<5455*/(/*5454*//*5456*/">="/*<5456*/)/*<5454*/(/*5454*//*5458*//*5459*/concrete/*<5459*/(/*5458*//*5461*//*5461*//*9099*/tfns/*<9099*/(/*5461*//*9100*//*9100*//*9100*/cons/*<9100*/(/*9100*//*9101*/tint/*<9101*/)/*<9100*/(/*9100*//*9100*//*9100*//*9100*/cons/*<9100*/(/*9100*//*9102*/tint/*<9102*/)/*<9100*/(/*9100*//*9100*/nil/*<9100*/)/*<9100*/)/*<9100*/)/*<5461*/(/*5461*//*9103*/tbool/*<9103*/)/*<5461*/)/*<5458*/)/*<5454*/)/*<5287*/(/*5287*//*5287*//*5287*//*5287*/cons/*<5287*/(/*5287*//*5470*//*5470*//*5471*/$co/*<5471*/(/*5470*//*5472*/"<="/*<5472*/)/*<5470*/(/*5470*//*5474*//*5475*/concrete/*<5475*/(/*5474*//*5477*//*5477*//*9104*/tfns/*<9104*/(/*5477*//*9105*//*9105*//*9105*/cons/*<9105*/(/*9105*//*9106*/tint/*<9106*/)/*<9105*/(/*9105*//*9105*//*9105*//*9105*/cons/*<9105*/(/*9105*//*9107*/tint/*<9107*/)/*<9105*/(/*9105*//*9105*/nil/*<9105*/)/*<9105*/)/*<9105*/)/*<5477*/(/*5477*//*9108*/tbool/*<9108*/)/*<5477*/)/*<5474*/)/*<5470*/)/*<5287*/(/*5287*//*5287*//*5287*//*5287*/cons/*<5287*/(/*5287*//*8890*//*8890*//*8891*/$co/*<8891*/(/*8890*//*8892*/"unescapeString"/*<8892*/)/*<8890*/(/*8890*//*8894*//*8895*/concrete/*<8895*/(/*8894*//*8897*//*8897*//*8899*/tfns/*<8899*/(/*8897*//*9606*//*9606*//*9606*/cons/*<9606*/(/*9606*//*8900*/tstring/*<8900*/)/*<9606*/(/*9606*//*9606*/nil/*<9606*/)/*<9606*/)/*<8897*/(/*8897*//*8901*/tstring/*<8901*/)/*<8897*/)/*<8894*/)/*<8890*/)/*<5287*/(/*5287*//*5287*//*5287*//*5287*/cons/*<5287*/(/*5287*//*8911*//*8911*//*8912*/$co/*<8912*/(/*8911*//*8913*/"int-to-string"/*<8913*/)/*<8911*/(/*8911*//*8915*//*8916*/concrete/*<8916*/(/*8915*//*8918*//*8918*//*8920*/tfns/*<8920*/(/*8918*//*9607*//*9607*//*9607*/cons/*<9607*/(/*9607*//*8921*/tint/*<8921*/)/*<9607*/(/*9607*//*9607*/nil/*<9607*/)/*<9607*/)/*<8918*/(/*8918*//*8922*/tstring/*<8922*/)/*<8918*/)/*<8915*/)/*<8911*/)/*<5287*/(/*5287*//*5287*//*5287*//*5287*/cons/*<5287*/(/*5287*//*8923*//*8923*//*8924*/$co/*<8924*/(/*8923*//*8925*/"string-to-int"/*<8925*/)/*<8923*/(/*8923*//*8927*//*8928*/concrete/*<8928*/(/*8927*//*8930*//*8930*//*8931*/tfns/*<8931*/(/*8930*//*9608*//*9608*//*9608*/cons/*<9608*/(/*9608*//*8932*/tstring/*<8932*/)/*<9608*/(/*9608*//*9608*/nil/*<9608*/)/*<9608*/)/*<8930*/(/*8930*//*8933*//*9140*/toption/*<9140*/(/*8933*//*9141*/tint/*<9141*/)/*<8933*/)/*<8930*/)/*<8927*/)/*<8923*/)/*<5287*/(/*5287*//*5287*//*5287*//*5287*/cons/*<5287*/(/*5287*//*8944*//*8944*//*8945*/$co/*<8945*/(/*8944*//*8946*/"++"/*<8946*/)/*<8944*/(/*8944*//*8948*//*8949*/concrete/*<8949*/(/*8948*//*8951*//*8951*//*8952*/tfns/*<8952*/(/*8951*//*9609*//*9609*//*9609*/cons/*<9609*/(/*9609*//*8953*//*9142*/tarray/*<9142*/(/*8953*//*9143*/tstring/*<9143*/)/*<8953*/)/*<9609*/(/*9609*//*9609*/nil/*<9609*/)/*<9609*/)/*<8951*/(/*8951*//*8962*/tstring/*<8962*/)/*<8951*/)/*<8948*/)/*<8944*/)/*<5287*/(/*5287*//*5287*//*5287*//*5287*/cons/*<5287*/(/*5287*//*8963*//*8963*//*8964*/$co/*<8964*/(/*8963*//*8965*/"map/nil"/*<8965*/)/*<8963*/(/*8963*//*8967*//*8968*/kv/*<8968*/(/*8967*//*8989*//*8989*//*8990*/tmap/*<8990*/(/*8989*//*8984*/k/*<8984*/)/*<8989*/(/*8989*//*8992*/v/*<8992*/)/*<8989*/)/*<8967*/)/*<8963*/)/*<5287*/(/*5287*//*5287*//*5287*//*5287*/cons/*<5287*/(/*5287*//*9023*//*9023*//*9024*/$co/*<9024*/(/*9023*//*9025*/"map/set"/*<9025*/)/*<9023*/(/*9023*//*9027*//*9028*/kv/*<9028*/(/*9027*//*9036*//*9036*//*9037*/tfns/*<9037*/(/*9036*//*9170*//*9170*//*9170*/cons/*<9170*/(/*9170*//*9039*//*9039*//*9040*/tmap/*<9040*/(/*9039*//*9171*/k/*<9171*/)/*<9039*/(/*9039*//*9176*/v/*<9176*/)/*<9039*/)/*<9170*/(/*9170*//*9170*//*9170*//*9170*/cons/*<9170*/(/*9170*//*9191*/k/*<9191*/)/*<9170*/(/*9170*//*9170*//*9170*//*9170*/cons/*<9170*/(/*9170*//*9195*/v/*<9195*/)/*<9170*/(/*9170*//*9170*/nil/*<9170*/)/*<9170*/)/*<9170*/)/*<9170*/)/*<9036*/(/*9036*//*9199*//*9199*//*9200*/tmap/*<9200*/(/*9199*//*9201*/k/*<9201*/)/*<9199*/(/*9199*//*9205*/v/*<9205*/)/*<9199*/)/*<9036*/)/*<9027*/)/*<9023*/)/*<5287*/(/*5287*//*5287*//*5287*//*5287*/cons/*<5287*/(/*5287*//*9222*//*9222*//*9223*/$co/*<9223*/(/*9222*//*9224*/"map/rm"/*<9224*/)/*<9222*/(/*9222*//*9226*//*9252*/kv/*<9252*/(/*9226*//*9259*//*9259*//*9261*/tfns/*<9261*/(/*9259*//*9262*//*9262*//*9262*/cons/*<9262*/(/*9262*//*9263*//*9263*//*9264*/tmap/*<9264*/(/*9263*//*9265*/k/*<9265*/)/*<9263*/(/*9263*//*9266*/v/*<9266*/)/*<9263*/)/*<9262*/(/*9262*//*9262*//*9262*//*9262*/cons/*<9262*/(/*9262*//*9267*/k/*<9267*/)/*<9262*/(/*9262*//*9262*/nil/*<9262*/)/*<9262*/)/*<9262*/)/*<9259*/(/*9259*//*9268*//*9268*//*9269*/tmap/*<9269*/(/*9268*//*9270*/k/*<9270*/)/*<9268*/(/*9268*//*9271*/v/*<9271*/)/*<9268*/)/*<9259*/)/*<9226*/)/*<9222*/)/*<5287*/(/*5287*//*5287*//*5287*//*5287*/cons/*<5287*/(/*5287*//*9272*//*9272*//*9273*/$co/*<9273*/(/*9272*//*9274*/"map/get"/*<9274*/)/*<9272*/(/*9272*//*9276*//*9277*/kv/*<9277*/(/*9276*//*9283*//*9283*//*9284*/tfns/*<9284*/(/*9283*//*9285*//*9285*//*9285*/cons/*<9285*/(/*9285*//*9286*//*9286*//*9287*/tmap/*<9287*/(/*9286*//*9288*/k/*<9288*/)/*<9286*/(/*9286*//*9289*/v/*<9289*/)/*<9286*/)/*<9285*/(/*9285*//*9285*//*9285*//*9285*/cons/*<9285*/(/*9285*//*9290*/k/*<9290*/)/*<9285*/(/*9285*//*9285*/nil/*<9285*/)/*<9285*/)/*<9285*/)/*<9283*/(/*9283*//*9291*//*9293*/toption/*<9293*/(/*9291*//*9294*/v/*<9294*/)/*<9291*/)/*<9283*/)/*<9276*/)/*<9272*/)/*<5287*/(/*5287*//*5287*//*5287*//*5287*/cons/*<5287*/(/*5287*//*9295*//*9295*//*9296*/$co/*<9296*/(/*9295*//*9297*/"map/map"/*<9297*/)/*<9295*/(/*9295*//*9299*//*9299*//*9300*/generic/*<9300*/(/*9299*//*9301*//*9301*//*9301*/cons/*<9301*/(/*9301*//*9302*/"k"/*<9302*/)/*<9301*/(/*9301*//*9301*//*9301*//*9301*/cons/*<9301*/(/*9301*//*9304*/"v"/*<9304*/)/*<9301*/(/*9301*//*9301*//*9301*//*9301*/cons/*<9301*/(/*9301*//*9321*/"v2"/*<9321*/)/*<9301*/(/*9301*//*9301*/nil/*<9301*/)/*<9301*/)/*<9301*/)/*<9301*/)/*<9299*/(/*9299*//*9307*//*9307*//*9308*/tfns/*<9308*/(/*9307*//*9309*//*9309*//*9309*/cons/*<9309*/(/*9309*//*9314*//*9314*//*9315*/tfns/*<9315*/(/*9314*//*9734*//*9734*//*9734*/cons/*<9734*/(/*9734*//*9323*/v/*<9323*/)/*<9734*/(/*9734*//*9734*/nil/*<9734*/)/*<9734*/)/*<9314*/(/*9314*//*9324*/v2/*<9324*/)/*<9314*/)/*<9309*/(/*9309*//*9309*//*9309*//*9309*/cons/*<9309*/(/*9309*//*9735*//*9735*//*9736*/tmap/*<9736*/(/*9735*//*9737*/k/*<9737*/)/*<9735*/(/*9735*//*9738*/v/*<9738*/)/*<9735*/)/*<9309*/(/*9309*//*9309*/nil/*<9309*/)/*<9309*/)/*<9309*/)/*<9307*/(/*9307*//*9325*//*9325*//*9326*/tmap/*<9326*/(/*9325*//*9327*/k/*<9327*/)/*<9325*/(/*9325*//*9329*/v2/*<9329*/)/*<9325*/)/*<9307*/)/*<9299*/)/*<9295*/)/*<5287*/(/*5287*//*5287*//*5287*//*5287*/cons/*<5287*/(/*5287*//*9330*//*9330*//*9331*/$co/*<9331*/(/*9330*//*9332*/"map/merge"/*<9332*/)/*<9330*/(/*9330*//*9334*//*9335*/kv/*<9335*/(/*9334*//*9341*//*9341*//*9342*/tfns/*<9342*/(/*9341*//*9343*//*9343*//*9343*/cons/*<9343*/(/*9343*//*9344*//*9344*//*9345*/tmap/*<9345*/(/*9344*//*9346*/k/*<9346*/)/*<9344*/(/*9344*//*9347*/v/*<9347*/)/*<9344*/)/*<9343*/(/*9343*//*9343*//*9343*//*9343*/cons/*<9343*/(/*9343*//*9348*//*9348*//*9349*/tmap/*<9349*/(/*9348*//*9351*/k/*<9351*/)/*<9348*/(/*9348*//*9352*/v/*<9352*/)/*<9348*/)/*<9343*/(/*9343*//*9343*/nil/*<9343*/)/*<9343*/)/*<9343*/)/*<9341*/(/*9341*//*9353*//*9353*//*9354*/tmap/*<9354*/(/*9353*//*9355*/k/*<9355*/)/*<9353*/(/*9353*//*9356*/v/*<9356*/)/*<9353*/)/*<9341*/)/*<9334*/)/*<9330*/)/*<5287*/(/*5287*//*5287*//*5287*//*5287*/cons/*<5287*/(/*5287*//*9357*//*9357*//*9358*/$co/*<9358*/(/*9357*//*9359*/"map/values"/*<9359*/)/*<9357*/(/*9357*//*9361*//*9362*/kv/*<9362*/(/*9361*//*9368*//*9368*//*9369*/tfns/*<9369*/(/*9368*//*9370*//*9370*//*9370*/cons/*<9370*/(/*9370*//*9371*//*9371*//*9372*/tmap/*<9372*/(/*9371*//*9373*/k/*<9373*/)/*<9371*/(/*9371*//*9374*/v/*<9374*/)/*<9371*/)/*<9370*/(/*9370*//*9370*/nil/*<9370*/)/*<9370*/)/*<9368*/(/*9368*//*9375*//*9376*/tarray/*<9376*/(/*9375*//*9377*/v/*<9377*/)/*<9375*/)/*<9368*/)/*<9361*/)/*<9357*/)/*<5287*/(/*5287*//*5287*//*5287*//*5287*/cons/*<5287*/(/*5287*//*9378*//*9378*//*9379*/$co/*<9379*/(/*9378*//*9380*/"set/nil"/*<9380*/)/*<9378*/(/*9378*//*9382*//*9383*/kk/*<9383*/(/*9382*//*9387*//*9388*/tset/*<9388*/(/*9387*//*9389*/k/*<9389*/)/*<9387*/)/*<9382*/)/*<9378*/)/*<5287*/(/*5287*//*5287*//*5287*//*5287*/cons/*<5287*/(/*5287*//*9407*//*9407*//*9408*/$co/*<9408*/(/*9407*//*9409*/"set/add"/*<9409*/)/*<9407*/(/*9407*//*9411*//*9412*/kk/*<9412*/(/*9411*//*9416*//*9416*//*9431*/tfns/*<9431*/(/*9416*//*9432*//*9432*//*9432*/cons/*<9432*/(/*9432*//*9433*//*9434*/tset/*<9434*/(/*9433*//*9435*/k/*<9435*/)/*<9433*/)/*<9432*/(/*9432*//*9432*//*9432*//*9432*/cons/*<9432*/(/*9432*//*9436*/k/*<9436*/)/*<9432*/(/*9432*//*9432*/nil/*<9432*/)/*<9432*/)/*<9432*/)/*<9416*/(/*9416*//*9437*//*9438*/tset/*<9438*/(/*9437*//*9439*/k/*<9439*/)/*<9437*/)/*<9416*/)/*<9411*/)/*<9407*/)/*<5287*/(/*5287*//*5287*//*5287*//*5287*/cons/*<5287*/(/*5287*//*9739*//*9739*//*9740*/$co/*<9740*/(/*9739*//*9741*/"set/has"/*<9741*/)/*<9739*/(/*9739*//*9743*//*9744*/kk/*<9744*/(/*9743*//*9745*//*9745*//*9746*/tfns/*<9746*/(/*9745*//*9747*//*9747*//*9747*/cons/*<9747*/(/*9747*//*9748*//*9749*/tset/*<9749*/(/*9748*//*9750*/k/*<9750*/)/*<9748*/)/*<9747*/(/*9747*//*9747*//*9747*//*9747*/cons/*<9747*/(/*9747*//*9751*/k/*<9751*/)/*<9747*/(/*9747*//*9747*/nil/*<9747*/)/*<9747*/)/*<9747*/)/*<9745*/(/*9745*//*9752*/tbool/*<9752*/)/*<9745*/)/*<9743*/)/*<9739*/)/*<5287*/(/*5287*//*5287*//*5287*//*5287*/cons/*<5287*/(/*5287*//*9440*//*9440*//*9441*/$co/*<9441*/(/*9440*//*9442*/"set/rm"/*<9442*/)/*<9440*/(/*9440*//*9444*//*9445*/kk/*<9445*/(/*9444*//*9446*//*9446*//*9447*/tfns/*<9447*/(/*9446*//*9448*//*9448*//*9448*/cons/*<9448*/(/*9448*//*9449*//*9450*/tset/*<9450*/(/*9449*//*9451*/k/*<9451*/)/*<9449*/)/*<9448*/(/*9448*//*9448*//*9448*//*9448*/cons/*<9448*/(/*9448*//*9452*/k/*<9452*/)/*<9448*/(/*9448*//*9448*/nil/*<9448*/)/*<9448*/)/*<9448*/)/*<9446*/(/*9446*//*9453*//*9454*/tset/*<9454*/(/*9453*//*9455*/k/*<9455*/)/*<9453*/)/*<9446*/)/*<9444*/)/*<9440*/)/*<5287*/(/*5287*//*5287*//*5287*//*5287*/cons/*<5287*/(/*5287*//*9456*//*9456*//*9457*/$co/*<9457*/(/*9456*//*9458*/"set/diff"/*<9458*/)/*<9456*/(/*9456*//*9460*//*9461*/kk/*<9461*/(/*9460*//*9462*//*9462*//*9463*/tfns/*<9463*/(/*9462*//*9464*//*9464*//*9464*/cons/*<9464*/(/*9464*//*9465*//*9466*/tset/*<9466*/(/*9465*//*9467*/k/*<9467*/)/*<9465*/)/*<9464*/(/*9464*//*9464*//*9464*//*9464*/cons/*<9464*/(/*9464*//*9468*//*9469*/tset/*<9469*/(/*9468*//*9470*/k/*<9470*/)/*<9468*/)/*<9464*/(/*9464*//*9464*/nil/*<9464*/)/*<9464*/)/*<9464*/)/*<9462*/(/*9462*//*9471*//*9472*/tset/*<9472*/(/*9471*//*9473*/k/*<9473*/)/*<9471*/)/*<9462*/)/*<9460*/)/*<9456*/)/*<5287*/(/*5287*//*5287*//*5287*//*5287*/cons/*<5287*/(/*5287*//*9474*//*9474*//*9475*/$co/*<9475*/(/*9474*//*9476*/"set/merge"/*<9476*/)/*<9474*/(/*9474*//*9478*//*9479*/kk/*<9479*/(/*9478*//*9480*//*9480*//*9483*/tfns/*<9483*/(/*9480*//*9484*//*9484*//*9484*/cons/*<9484*/(/*9484*//*9485*//*9486*/tset/*<9486*/(/*9485*//*9487*/k/*<9487*/)/*<9485*/)/*<9484*/(/*9484*//*9484*//*9484*//*9484*/cons/*<9484*/(/*9484*//*9488*//*9489*/tset/*<9489*/(/*9488*//*9490*/k/*<9490*/)/*<9488*/)/*<9484*/(/*9484*//*9484*/nil/*<9484*/)/*<9484*/)/*<9484*/)/*<9480*/(/*9480*//*9492*//*9493*/tset/*<9493*/(/*9492*//*9494*/k/*<9494*/)/*<9492*/)/*<9480*/)/*<9478*/)/*<9474*/)/*<5287*/(/*5287*//*5287*//*5287*//*5287*/cons/*<5287*/(/*5287*//*9495*//*9495*//*9496*/$co/*<9496*/(/*9495*//*9497*/"set/to-list"/*<9497*/)/*<9495*/(/*9495*//*9499*//*9500*/kk/*<9500*/(/*9499*//*9501*//*9501*//*9502*/tfns/*<9502*/(/*9501*//*9503*//*9503*//*9503*/cons/*<9503*/(/*9503*//*9504*//*9505*/tset/*<9505*/(/*9504*//*9506*/k/*<9506*/)/*<9504*/)/*<9503*/(/*9503*//*9503*/nil/*<9503*/)/*<9503*/)/*<9501*/(/*9501*//*9507*//*9508*/tarray/*<9508*/(/*9507*//*9509*/k/*<9509*/)/*<9507*/)/*<9501*/)/*<9499*/)/*<9495*/)/*<5287*/(/*5287*//*5287*//*5287*//*5287*/cons/*<5287*/(/*5287*//*9510*//*9510*//*9511*/$co/*<9511*/(/*9510*//*9512*/"set/from-list"/*<9512*/)/*<9510*/(/*9510*//*9514*//*9515*/kk/*<9515*/(/*9514*//*9516*//*9516*//*9517*/tfns/*<9517*/(/*9516*//*9518*//*9518*//*9518*/cons/*<9518*/(/*9518*//*9519*//*9520*/tarray/*<9520*/(/*9519*//*9521*/k/*<9521*/)/*<9519*/)/*<9518*/(/*9518*//*9518*/nil/*<9518*/)/*<9518*/)/*<9516*/(/*9516*//*9522*//*9523*/tset/*<9523*/(/*9522*//*9524*/k/*<9524*/)/*<9522*/)/*<9516*/)/*<9514*/)/*<9510*/)/*<5287*/(/*5287*//*5287*//*5287*//*5287*/cons/*<5287*/(/*5287*//*9525*//*9525*//*9526*/$co/*<9526*/(/*9525*//*9527*/"map/from-list"/*<9527*/)/*<9525*/(/*9525*//*9529*//*9530*/kv/*<9530*/(/*9529*//*9531*//*9531*//*9532*/tfns/*<9532*/(/*9531*//*9533*//*9533*//*9533*/cons/*<9533*/(/*9533*//*9534*//*9535*/tarray/*<9535*/(/*9534*//*9536*//*9536*//*9537*/t$co/*<9537*/(/*9536*//*9538*/k/*<9538*/)/*<9536*/(/*9536*//*9539*/v/*<9539*/)/*<9536*/)/*<9534*/)/*<9533*/(/*9533*//*9533*/nil/*<9533*/)/*<9533*/)/*<9531*/(/*9531*//*9540*//*9540*//*9541*/tmap/*<9541*/(/*9540*//*9542*/k/*<9542*/)/*<9540*/(/*9540*//*9543*/v/*<9543*/)/*<9540*/)/*<9531*/)/*<9529*/)/*<9525*/)/*<5287*/(/*5287*//*5287*//*5287*//*5287*/cons/*<5287*/(/*5287*//*9564*//*9564*//*9565*/$co/*<9565*/(/*9564*//*9566*/"map/to-list"/*<9566*/)/*<9564*/(/*9564*//*9568*//*9569*/kv/*<9569*/(/*9568*//*9570*//*9570*//*9571*/tfns/*<9571*/(/*9570*//*9572*//*9572*//*9572*/cons/*<9572*/(/*9572*//*9573*//*9573*//*9574*/tmap/*<9574*/(/*9573*//*9575*/k/*<9575*/)/*<9573*/(/*9573*//*9576*/v/*<9576*/)/*<9573*/)/*<9572*/(/*9572*//*9572*/nil/*<9572*/)/*<9572*/)/*<9570*/(/*9570*//*9577*//*9580*/tarray/*<9580*/(/*9577*//*9581*//*9581*//*9582*/t$co/*<9582*/(/*9581*//*9583*/k/*<9583*/)/*<9581*/(/*9581*//*9584*/v/*<9584*/)/*<9581*/)/*<9577*/)/*<9570*/)/*<9568*/)/*<9564*/)/*<5287*/(/*5287*//*5287*//*5287*//*5287*/cons/*<5287*/(/*5287*//*9585*//*9585*//*9586*/$co/*<9586*/(/*9585*//*9587*/"jsonify"/*<9587*/)/*<9585*/(/*9585*//*9589*//*9589*//*9590*/generic/*<9590*/(/*9589*//*9591*//*9591*//*9591*/cons/*<9591*/(/*9591*//*9592*/"v"/*<9592*/)/*<9591*/(/*9591*//*9591*/nil/*<9591*/)/*<9591*/)/*<9589*/(/*9589*//*9594*//*9594*//*9595*/tfns/*<9595*/(/*9594*//*9610*//*9610*//*9610*/cons/*<9610*/(/*9610*//*9596*//*9596*//*9597*/tvar/*<9597*/(/*9596*//*9598*/"v"/*<9598*/)/*<9596*/(/*9596*//*9600*/-1/*<9600*/)/*<9596*/)/*<9610*/(/*9610*//*9610*/nil/*<9610*/)/*<9610*/)/*<9594*/(/*9594*//*9601*/tstring/*<9601*/)/*<9594*/)/*<9589*/)/*<9585*/)/*<5287*/(/*5287*//*5287*//*5287*//*5287*/cons/*<5287*/(/*5287*//*9602*//*9602*//*9611*/$co/*<9611*/(/*9602*//*9612*/"valueToString"/*<9612*/)/*<9602*/(/*9602*//*9614*//*9614*//*9615*/generic/*<9615*/(/*9614*//*9616*//*9616*//*9616*/cons/*<9616*/(/*9616*//*9617*/"v"/*<9617*/)/*<9616*/(/*9616*//*9616*/nil/*<9616*/)/*<9616*/)/*<9614*/(/*9614*//*9619*//*9619*//*9620*/tfns/*<9620*/(/*9619*//*9621*//*9621*//*9621*/cons/*<9621*/(/*9621*//*9622*//*9623*/vbl/*<9623*/(/*9622*//*9624*/"v"/*<9624*/)/*<9622*/)/*<9621*/(/*9621*//*9621*/nil/*<9621*/)/*<9621*/)/*<9619*/(/*9619*//*9627*/tstring/*<9627*/)/*<9619*/)/*<9614*/)/*<9602*/)/*<5287*/(/*5287*//*5287*//*5287*//*5287*/cons/*<5287*/(/*5287*//*9628*//*9628*//*9629*/$co/*<9629*/(/*9628*//*9630*/"eval"/*<9630*/)/*<9628*/(/*9628*//*9632*//*9632*//*9633*/generic/*<9633*/(/*9632*//*9635*//*9635*//*9635*/cons/*<9635*/(/*9635*//*9636*/"v"/*<9636*/)/*<9635*/(/*9635*//*9635*/nil/*<9635*/)/*<9635*/)/*<9632*/(/*9632*//*9638*//*9638*//*9639*/tfns/*<9639*/(/*9638*//*9640*//*9640*//*9640*/cons/*<9640*/(/*9640*//*9641*//*9641*//*9642*/tcon/*<9642*/(/*9641*//*9643*/"ast"/*<9643*/)/*<9641*/(/*9641*//*9645*/-1/*<9645*/)/*<9641*/)/*<9640*/(/*9640*//*9640*/nil/*<9640*/)/*<9640*/)/*<9638*/(/*9638*//*9646*//*9647*/vbl/*<9647*/(/*9646*//*9648*/"v"/*<9648*/)/*<9646*/)/*<9638*/)/*<9632*/)/*<9628*/)/*<5287*/(/*5287*//*5287*//*5287*//*5287*/cons/*<5287*/(/*5287*//*9651*//*9651*//*9652*/$co/*<9652*/(/*9651*//*9653*/"sanitize"/*<9653*/)/*<9651*/(/*9651*//*9655*//*9656*/concrete/*<9656*/(/*9655*//*9657*//*9657*//*9658*/tfns/*<9658*/(/*9657*//*9659*//*9659*//*9659*/cons/*<9659*/(/*9659*//*9661*/tstring/*<9661*/)/*<9659*/(/*9659*//*9659*/nil/*<9659*/)/*<9659*/)/*<9657*/(/*9657*//*9662*/tstring/*<9662*/)/*<9657*/)/*<9655*/)/*<9651*/)/*<5287*/(/*5287*//*5287*//*5287*//*5287*/cons/*<5287*/(/*5287*//*9663*//*9663*//*9664*/$co/*<9664*/(/*9663*//*9665*/"replace-all"/*<9665*/)/*<9663*/(/*9663*//*9667*//*9668*/concrete/*<9668*/(/*9667*//*9669*//*9669*//*9670*/tfns/*<9670*/(/*9669*//*9671*//*9671*//*9671*/cons/*<9671*/(/*9671*//*9672*/tstring/*<9672*/)/*<9671*/(/*9671*//*9671*//*9671*//*9671*/cons/*<9671*/(/*9671*//*9673*/tstring/*<9673*/)/*<9671*/(/*9671*//*9671*/nil/*<9671*/)/*<9671*/)/*<9671*/)/*<9669*/(/*9669*//*9674*/tstring/*<9674*/)/*<9669*/)/*<9667*/)/*<9663*/)/*<5287*/(/*5287*//*5287*//*5287*//*5287*/cons/*<5287*/(/*5287*//*9675*//*9675*//*9676*/$co/*<9676*/(/*9675*//*9677*/"fatal"/*<9677*/)/*<9675*/(/*9675*//*9679*//*9679*//*9680*/generic/*<9680*/(/*9679*//*9681*//*9681*//*9681*/cons/*<9681*/(/*9681*//*9682*/"v"/*<9682*/)/*<9681*/(/*9681*//*9681*/nil/*<9681*/)/*<9681*/)/*<9679*/(/*9679*//*9684*//*9684*//*9685*/tfns/*<9685*/(/*9684*//*9686*//*9686*//*9686*/cons/*<9686*/(/*9686*//*9687*/tstring/*<9687*/)/*<9686*/(/*9686*//*9686*/nil/*<9686*/)/*<9686*/)/*<9684*/(/*9684*//*9688*//*9689*/vbl/*<9689*/(/*9688*//*9690*/"v"/*<9690*/)/*<9688*/)/*<9684*/)/*<9679*/)/*<9675*/)/*<5287*/(/*5287*//*5287*/nil/*<5287*/)/*<5287*/)/*<5287*/)/*<5287*/)/*<5287*/)/*<5287*/)/*<5287*/)/*<5287*/)/*<5287*/)/*<5287*/)/*<5287*/)/*<5287*/)/*<5287*/)/*<5287*/)/*<5287*/)/*<5287*/)/*<5287*/)/*<5287*/)/*<5287*/)/*<5287*/)/*<5287*/)/*<5287*/)/*<5287*/)/*<5287*/)/*<5287*/)/*<5287*/)/*<5287*/)/*<5287*/)/*<5287*/)/*<5287*/)/*<5287*/)/*<5287*/)/*<5287*/)/*<5287*/)/*<5287*/)/*<5282*/)/*<5255*/(/*5255*//*5285*/map$slnil/*<5285*/)/*<5255*/(/*5255*//*5284*/map$slnil/*<5284*/)/*<5255*/)/*<5253*/(/*5253*//*5256*//*5256*//*5256*/cons/*<5256*/(/*5256*//*5258*/{"0":"array","1":5264,"2":{"0":{"0":"a","1":5265,"type":","},"1":{"type":"nil"},"type":"cons"},"3":{"0":{"0":"cons","1":5267,"2":{"0":{"0":"a","1":5268,"type":"tcon"},"1":{"0":{"0":{"0":"array","1":5270,"type":"tcon"},"1":{"0":"a","1":5272,"type":"tcon"},"2":5269,"type":"tapp"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"3":5266,"type":",,,"},"1":{"0":{"0":"nil","1":5274,"2":{"type":"nil"},"3":5273,"type":",,,"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"4":5261,"type":"sdeftype"}/*<5258*/)/*<5256*/(/*5256*//*5256*//*5256*//*5256*/cons/*<5256*/(/*5256*//*8832*/{"0":"option","1":8837,"2":{"0":{"0":"a","1":8838,"type":","},"1":{"type":"nil"},"type":"cons"},"3":{"0":{"0":"some","1":8840,"2":{"0":{"0":"a","1":8841,"type":"tcon"},"1":{"type":"nil"},"type":"cons"},"3":8839,"type":",,,"},"1":{"0":{"0":"none","1":8843,"2":{"type":"nil"},"3":8842,"type":",,,"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"4":8834,"type":"sdeftype"}/*<8832*/)/*<5256*/(/*5256*//*5256*//*5256*//*5256*/cons/*<5256*/(/*5256*//*5313*/{"0":",","1":5319,"2":{"0":{"0":"a","1":5320,"type":","},"1":{"0":{"0":"b","1":5321,"type":","},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"3":{"0":{"0":",","1":5323,"2":{"0":{"0":"a","1":5324,"type":"tcon"},"1":{"0":{"0":"b","1":5325,"type":"tcon"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"3":5322,"type":",,,"},"1":{"type":"nil"},"type":"cons"},"4":5316,"type":"sdeftype"}/*<5313*/)/*<5256*/(/*5256*//*5256*//*5256*//*5256*/cons/*<5256*/(/*5256*//*5329*/{"0":",,","1":5335,"2":{"0":{"0":"a","1":5336,"type":","},"1":{"0":{"0":"b","1":5337,"type":","},"1":{"0":{"0":"c","1":5338,"type":","},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"type":"cons"},"3":{"0":{"0":",,","1":5340,"2":{"0":{"0":"a","1":5343,"type":"tcon"},"1":{"0":{"0":"b","1":5344,"type":"tcon"},"1":{"0":{"0":"c","1":5345,"type":"tcon"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"type":"cons"},"3":5339,"type":",,,"},"1":{"type":"nil"},"type":"cons"},"4":5332,"type":"sdeftype"}/*<5329*/)/*<5256*/(/*5256*//*5256*//*5256*//*5256*/cons/*<5256*/(/*5256*//*5346*/{"0":",,,","1":5351,"2":{"0":{"0":"a","1":5352,"type":","},"1":{"0":{"0":"b","1":5353,"type":","},"1":{"0":{"0":"c","1":5354,"type":","},"1":{"0":{"0":"d","1":5355,"type":","},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"type":"cons"},"type":"cons"},"3":{"0":{"0":",,,","1":5357,"2":{"0":{"0":"a","1":5358,"type":"tcon"},"1":{"0":{"0":"b","1":5359,"type":"tcon"},"1":{"0":{"0":"c","1":5360,"type":"tcon"},"1":{"0":{"0":"d","1":5361,"type":"tcon"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"type":"cons"},"type":"cons"},"3":5356,"type":",,,"},"1":{"type":"nil"},"type":"cons"},"4":5348,"type":"sdeftype"}/*<5346*/)/*<5256*/(/*5256*//*5256*//*5256*//*5256*/cons/*<5256*/(/*5256*//*5362*/{"0":",,,,","1":5367,"2":{"0":{"0":"a","1":5368,"type":","},"1":{"0":{"0":"b","1":5369,"type":","},"1":{"0":{"0":"c","1":5370,"type":","},"1":{"0":{"0":"d","1":5371,"type":","},"1":{"0":{"0":"e","1":5372,"type":","},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"type":"cons"},"type":"cons"},"type":"cons"},"3":{"0":{"0":",,,,","1":5374,"2":{"0":{"0":"a","1":5375,"type":"tcon"},"1":{"0":{"0":"b","1":5376,"type":"tcon"},"1":{"0":{"0":"c","1":5377,"type":"tcon"},"1":{"0":{"0":"d","1":5378,"type":"tcon"},"1":{"0":{"0":"e","1":5379,"type":"tcon"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"type":"cons"},"type":"cons"},"type":"cons"},"3":5373,"type":",,,"},"1":{"type":"nil"},"type":"cons"},"4":5364,"type":"sdeftype"}/*<5362*/)/*<5256*/(/*5256*//*5256*/nil/*<5256*/)/*<5256*/)/*<5256*/)/*<5256*/)/*<5256*/)/*<5256*/)/*<5256*/)/*<5253*/(/*5253*//*5257*/infer_stmt/*<5257*/)/*<5253*/
};
throw new Error('let pattern not matched 9425. ' + valueToString($target));})(/*!*/)/*<9239*/
};
throw new Error('let pattern not matched 9417. ' + valueToString($target));})(/*!*/)/*<9239*/
};
throw new Error('let pattern not matched 9316. ' + valueToString($target));})(/*!*/)/*<9239*/
};
throw new Error('let pattern not matched 9247. ' + valueToString($target));})(/*!*/)/*<9239*/
};
throw new Error('let pattern not matched 9242. ' + valueToString($target));})(/*!*/)/*<9239*/;

const subst_to_string = /*6304*/function name_6304(subst) { return /*6330*//*6330*//*6331*/join/*<6331*/(/*6330*//*6334*/"\n"/*<6334*/)/*<6330*/(/*6330*//*6313*//*6313*//*6314*/map/*<6314*/(/*6313*//*6310*//*6311*/map$slto_list/*<6311*/(/*6310*//*6312*/subst/*<6312*/)/*<6310*/)/*<6313*/(/*6313*//*6315*/function name_6315($fn_arg) { return /*6315*/(function match_6315($target) {
if ($target.type === ",") {
{
let k = $target[0];
{
let v = $target[1];
return /*6322*/`${/*6324*/k/*<6324*/} : ${/*6326*//*6328*/type_to_string_raw/*<6328*/(/*6326*//*6329*/v/*<6329*/)/*<6326*/}`/*<6322*/
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 6315');})(/*!*//*-1*/$fn_arg/*<-1*/)/*<6315*/ }/*<6315*/)/*<6313*/)/*<6330*/ }/*<6304*/;

const typecheck = (v0) => (v1) => (v2) => (v3) => (v4) => (v5) => (v6) => (v7) => ({type: "typecheck", 0: v0, 1: v1, 2: v2, 3: v3, 4: v4, 5: v5, 6: v6, 7: v7});
return {type: 'fns', at, bag$sland, bag$slto_list, basic, builtin_env, compose_subst, concat, concrete, earlier_subst, externals, externals_stmt, externals_type, filter, foldl, foldr, generalize, generic, infer, infer_defns, infer_several, infer_show, infer_stmt, instantiate, join, letters, make_subst_for_vars, map, map_without, mapi, names, new_type_var, pat_and_body, pat_names, rev, scheme$sltype, scheme_apply, scheme_free, several, show_subst, show_substs, show_types, show_types_list, subst_to_string, t$co, t_expr, t_pat, t_prim, tarray, tbool, tenv$slcon, tenv$slnames, tenv$slnil, tenv$slrm, tenv$slset_type, tenv$sltype, tenv_apply, tenv_free, tfn, tfns, tint, tmap, toption, tset, tstring, tts_inner, tts_list, type_apply, type_free, type_loc, type_to_string, type_to_string_raw, type_with_free, unify, unwrap_app, unwrap_fn, var_bind, vbl, zip}