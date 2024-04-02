const scheme = (v0) => (v1) => ({type: "scheme", 0: v0, 1: v1});
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
const sdeftype = (v0) => (v1) => (v2) => (v3) => (v4) => ({type: "sdeftype", 0: v0, 1: v1, 2: v2, 3: v3, 4: v4});
const stypealias = (v0) => (v1) => (v2) => (v3) => (v4) => ({type: "stypealias", 0: v0, 1: v1, 2: v2, 3: v3, 4: v4});
const sdef = (v0) => (v1) => (v2) => (v3) => ({type: "sdef", 0: v0, 1: v1, 2: v2, 3: v3});
const sexpr = (v0) => (v1) => ({type: "sexpr", 0: v0, 1: v1});
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

const map_without = /*2665*/function name_2665(map) { return /*2665*/function name_2665(set) { return /*2672*//*2672*//*2672*//*2673*/foldr/*<2673*/(/*2672*//*2674*/map/*<2674*/)/*<2672*/(/*2672*//*2675*//*2676*/set$slto_list/*<2676*/(/*2675*//*2678*/set/*<2678*/)/*<2675*/)/*<2672*/(/*2672*//*2679*/map$slrm/*<2679*/)/*<2672*/ }/*<2665*/ }/*<2665*/;

const demo_new_subst = /*2692*//*2693*/map$slfrom_list/*<2693*/(/*2692*//*2694*//*2694*//*2694*/cons/*<2694*/(/*2694*//*2695*//*2695*//*2696*/$co/*<2696*/(/*2695*//*2697*/"a"/*<2697*/)/*<2695*/(/*2695*//*2699*//*2699*//*2700*/tcon/*<2700*/(/*2699*//*2701*/"a-mapped"/*<2701*/)/*<2699*/(/*2699*//*2703*/-1/*<2703*/)/*<2699*/)/*<2695*/)/*<2694*/(/*2694*//*2694*//*2694*//*2694*/cons/*<2694*/(/*2694*//*2774*//*2774*//*2775*/$co/*<2775*/(/*2774*//*2776*/"b"/*<2776*/)/*<2774*/(/*2774*//*2778*//*2778*//*2779*/tvar/*<2779*/(/*2778*//*2780*/"c"/*<2780*/)/*<2778*/(/*2778*//*2782*/-1/*<2782*/)/*<2778*/)/*<2774*/)/*<2694*/(/*2694*//*2694*/nil/*<2694*/)/*<2694*/)/*<2694*/)/*<2692*/;

const tenv = (v0) => (v1) => (v2) => (v3) => ({type: "tenv", 0: v0, 1: v1, 2: v2, 3: v3});
const tconstructor = (v0) => (v1) => (v2) => ({type: "tconstructor", 0: v0, 1: v1, 2: v2});
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

const tenv$slset_type = /*3336*/function name_3336($fn_arg) { return /*3336*/(function match_3336($target) {
if ($target.type === "tenv") {
{
let types = $target[0];
{
let cons = $target[1];
{
let names = $target[2];
{
let alias = $target[3];
return /*3336*/function name_3336(k) { return /*3336*/function name_3336(v) { return /*3348*//*3348*//*3348*//*3348*//*3349*/tenv/*<3349*/(/*3348*//*3350*//*3350*//*3350*//*3351*/map$slset/*<3351*/(/*3350*//*3352*/types/*<3352*/)/*<3350*/(/*3350*//*3353*/k/*<3353*/)/*<3350*/(/*3350*//*3354*/v/*<3354*/)/*<3350*/)/*<3348*/(/*3348*//*3355*/cons/*<3355*/)/*<3348*/(/*3348*//*3356*/names/*<3356*/)/*<3348*/(/*3348*//*13294*/alias/*<13294*/)/*<3348*/ }/*<3336*/ }/*<3336*/
}
}
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 3336');})(/*!*//*-1*/$fn_arg/*<-1*/)/*<3336*/ }/*<3336*/;

const tenv$slnil = /*3361*//*3361*//*3361*//*3361*//*3362*/tenv/*<3362*/(/*3361*//*3363*/map$slnil/*<3363*/)/*<3361*/(/*3361*//*3364*/map$slnil/*<3364*/)/*<3361*/(/*3361*//*3365*/map$slnil/*<3365*/)/*<3361*/(/*3361*//*13332*/map$slnil/*<13332*/)/*<3361*/;

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

const typecheck = (v0) => (v1) => (v2) => (v3) => ({type: "typecheck", 0: v0, 1: v1, 2: v2, 3: v3});
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

const tbool = /*5416*//*5416*//*5417*/tcon/*<5417*/(/*5416*//*5418*/"bool"/*<5418*/)/*<5416*/(/*5416*//*5421*/-1/*<5421*/)/*<5416*/;

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

const some = (v0) => ({type: "some", 0: v0});
const none = ({type: "none"});
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
{
let a = $target[0];
if ($target[1].type === "many") {
{
let b = $target[1][0];
return /*16189*//*16197*/many/*<16197*/(/*16189*//*16198*//*16198*//*16198*/cons/*<16198*/(/*16198*//*16199*/a/*<16199*/)/*<16198*/(/*16198*//*16200*/b/*<16200*/)/*<16198*/)/*<16189*/
}
}
}
}
return /*7129*//*7130*/many/*<7130*/(/*7129*//*7131*//*7131*//*7131*/cons/*<7131*/(/*7131*//*7138*/first/*<7138*/)/*<7131*/(/*7131*//*7131*//*7131*//*7131*/cons/*<7131*/(/*7131*//*7139*/second/*<7139*/)/*<7131*/(/*7131*//*7131*/nil/*<7131*/)/*<7131*/)/*<7131*/)/*<7129*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 7073');})(/*!*//*7075*//*7075*//*7076*/$co/*<7076*/(/*7075*//*7077*/first/*<7077*/)/*<7075*/(/*7075*//*7078*/second/*<7078*/)/*<7075*/)/*<7073*/ }/*<7061*/ }/*<7061*/;

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
let name = $target[0];
{
let args = $target[1];
{
let l = $target[2];
return /*7213*//*7213*//*7213*//*7214*/foldl/*<7214*/(/*7213*//*15117*/set$slnil/*<15117*/)/*<7213*/(/*7213*//*7216*/args/*<7216*/)/*<7213*/(/*7213*//*7217*/function name_7217(bound) { return /*7217*/function name_7217(arg) { return /*7226*//*7226*//*7227*/set$slmerge/*<7227*/(/*7226*//*7229*/bound/*<7229*/)/*<7226*/(/*7226*//*7230*//*7231*/pat_names/*<7231*/(/*7230*//*7232*/arg/*<7232*/)/*<7230*/)/*<7226*/ }/*<7217*/ }/*<7217*/)/*<7213*/
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

const filter = /*8028*/function name_8028(f) { return /*8028*/function name_8028(list) { return /*8037*/(function match_8037($target) {
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
return /*8054*//*8054*//*8054*/cons/*<8054*/(/*8054*//*8055*/one/*<8055*/)/*<8054*/(/*8054*//*8056*//*8056*//*8060*/filter/*<8060*/(/*8056*//*8061*/f/*<8061*/)/*<8056*/(/*8056*//*8062*/rest/*<8062*/)/*<8056*/)/*<8054*/
}
return /*8063*//*8063*//*8064*/filter/*<8064*/(/*8063*//*8065*/f/*<8065*/)/*<8063*/(/*8063*//*8066*/rest/*<8066*/)/*<8063*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 8049');})(/*!*//*8051*//*8052*/f/*<8052*/(/*8051*//*8053*/one/*<8053*/)/*<8051*/)/*<8049*/
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 8037');})(/*!*//*8040*/list/*<8040*/)/*<8037*/ }/*<8028*/ }/*<8028*/;

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

const tstring = /*8906*//*8906*//*8907*/tcon/*<8907*/(/*8906*//*8908*/"string"/*<8908*/)/*<8906*/(/*8906*//*8910*/-1/*<8910*/)/*<8906*/;

const tmap = /*8997*/function name_8997(k) { return /*8997*/function name_8997(v) { return /*9004*//*9004*//*9004*//*9005*/tapp/*<9005*/(/*9004*//*9006*//*9006*//*9006*//*9007*/tapp/*<9007*/(/*9006*//*9008*//*9008*//*9009*/tcon/*<9009*/(/*9008*//*9010*/"map"/*<9010*/)/*<9008*/(/*9008*//*9012*/-1/*<9012*/)/*<9008*/)/*<9006*/(/*9006*//*9013*/k/*<9013*/)/*<9006*/(/*9006*//*9732*/-1/*<9732*/)/*<9006*/)/*<9004*/(/*9004*//*9018*/v/*<9018*/)/*<9004*/(/*9004*//*9730*/-1/*<9730*/)/*<9004*/ }/*<8997*/ }/*<8997*/;

const tfns = /*9041*/function name_9041(args) { return /*9041*/function name_9041(result) { return /*9048*//*9048*//*9048*//*9049*/foldr/*<9049*/(/*9048*//*9050*/result/*<9050*/)/*<9048*/(/*9048*//*9051*/args/*<9051*/)/*<9048*/(/*9048*//*9052*/function name_9052(result) { return /*9052*/function name_9052(arg) { return /*9059*//*9059*//*9059*//*9060*/tfn/*<9060*/(/*9059*//*9061*/arg/*<9061*/)/*<9059*/(/*9059*//*9062*/result/*<9062*/)/*<9059*/(/*9059*//*9063*/-1/*<9063*/)/*<9059*/ }/*<9052*/ }/*<9052*/)/*<9048*/ }/*<9041*/ }/*<9041*/;

const toption = /*9110*/function name_9110(arg) { return /*9116*//*9116*//*9116*//*9117*/tapp/*<9117*/(/*9116*//*9118*//*9118*//*9119*/tcon/*<9119*/(/*9118*//*9120*/"option"/*<9120*/)/*<9118*/(/*9118*//*9122*/-1/*<9122*/)/*<9118*/)/*<9116*/(/*9116*//*9123*/arg/*<9123*/)/*<9116*/(/*9116*//*9139*/-1/*<9139*/)/*<9116*/ }/*<9110*/;

const tarray = /*9124*/function name_9124(arg) { return /*9130*//*9130*//*9130*//*9131*/tapp/*<9131*/(/*9130*//*9132*//*9132*//*9133*/tcon/*<9133*/(/*9132*//*9134*/"array"/*<9134*/)/*<9132*/(/*9132*//*9136*/-1/*<9136*/)/*<9132*/)/*<9130*/(/*9130*//*9137*/arg/*<9137*/)/*<9130*/(/*9130*//*9138*/-1/*<9138*/)/*<9130*/ }/*<9124*/;

const concrete = /*9144*/function name_9144(t) { return /*9150*//*9150*//*9151*/scheme/*<9151*/(/*9150*//*9152*/set$slnil/*<9152*/)/*<9150*/(/*9150*//*9153*/t/*<9153*/)/*<9150*/ }/*<9144*/;

const generic = /*9154*/function name_9154(vbls) { return /*9154*/function name_9154(t) { return /*9161*//*9161*//*9162*/scheme/*<9162*/(/*9161*//*9164*//*9165*/set$slfrom_list/*<9165*/(/*9164*//*9166*/vbls/*<9166*/)/*<9164*/)/*<9161*/(/*9161*//*9167*/t/*<9167*/)/*<9161*/ }/*<9154*/ }/*<9154*/;

const vbl = /*9178*/function name_9178(k) { return /*9185*//*9185*//*9186*/tvar/*<9186*/(/*9185*//*9187*/k/*<9187*/)/*<9185*/(/*9185*//*9188*/-1/*<9188*/)/*<9185*/ }/*<9178*/;

const tset = /*9390*/function name_9390(arg) { return /*9396*//*9396*//*9396*//*9397*/tapp/*<9397*/(/*9396*//*9400*//*9400*//*9401*/tcon/*<9401*/(/*9400*//*9402*/"set"/*<9402*/)/*<9400*/(/*9400*//*9404*/-1/*<9404*/)/*<9400*/)/*<9396*/(/*9396*//*9405*/arg/*<9405*/)/*<9396*/(/*9396*//*9406*/-1/*<9406*/)/*<9396*/ }/*<9390*/;

const t$co = /*9544*/function name_9544(a) { return /*9544*/function name_9544(b) { return /*9551*//*9551*//*9551*//*9552*/tapp/*<9552*/(/*9551*//*9553*//*9553*//*9553*//*9554*/tapp/*<9554*/(/*9553*//*9555*//*9555*//*9556*/tcon/*<9556*/(/*9555*//*9557*/","/*<9557*/)/*<9555*/(/*9555*//*9559*/-1/*<9559*/)/*<9555*/)/*<9553*/(/*9553*//*9560*/a/*<9560*/)/*<9553*/(/*9553*//*9731*/-1/*<9731*/)/*<9553*/)/*<9551*/(/*9551*//*9561*/b/*<9561*/)/*<9551*/(/*9551*//*9729*/-1/*<9729*/)/*<9551*/ }/*<9544*/ }/*<9544*/;

const scheme$sltype = /*10092*/function name_10092($fn_arg) { return /*10092*/(function match_10092($target) {
if ($target.type === "scheme") {
{
let type = $target[1];
return /*10102*/type/*<10102*/
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 10092');})(/*!*//*-1*/$fn_arg/*<-1*/)/*<10092*/ }/*<10092*/;

const len = /*10352*/function name_10352(arr) { return /*10358*/(function match_10358($target) {
if ($target.type === "nil") {
return /*10362*/0/*<10362*/
}
if ($target.type === "cons") {
{
let one = $target[0];
{
let rest = $target[1];
return /*10369*//*10369*//*10370*/$pl/*<10370*/(/*10369*//*10371*/1/*<10371*/)/*<10369*/(/*10369*//*10372*//*10373*/len/*<10373*/(/*10372*//*10374*/rest/*<10374*/)/*<10372*/)/*<10369*/
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 10358');})(/*!*//*10360*/arr/*<10360*/)/*<10358*/ }/*<10352*/;

const its = /*10495*/int_to_string/*<10495*/;

const type$slset_loc = /*10661*/function name_10661(loc) { return /*10661*/function name_10661(type) { return /*10668*/(function match_10668($target) {
if ($target.type === "tvar") {
{
let name = $target[0];
return /*10675*//*10675*//*10676*/tvar/*<10676*/(/*10675*//*10677*/name/*<10677*/)/*<10675*/(/*10675*//*10678*/loc/*<10678*/)/*<10675*/
}
}
if ($target.type === "tapp") {
{
let a = $target[0];
{
let b = $target[1];
return /*10684*//*10684*//*10684*//*10685*/tapp/*<10685*/(/*10684*//*11010*//*11010*//*10686*/type$slset_loc/*<10686*/(/*11010*//*11011*/loc/*<11011*/)/*<11010*/(/*11010*//*11012*/a/*<11012*/)/*<11010*/)/*<10684*/(/*10684*//*11013*//*11013*//*11014*/type$slset_loc/*<11014*/(/*11013*//*11015*/loc/*<11015*/)/*<11013*/(/*11013*//*10687*/b/*<10687*/)/*<11013*/)/*<10684*/(/*10684*//*10688*/loc/*<10688*/)/*<10684*/
}
}
}
if ($target.type === "tcon") {
{
let name = $target[0];
return /*10693*//*10693*//*10694*/tcon/*<10694*/(/*10693*//*10695*/name/*<10695*/)/*<10693*/(/*10693*//*10696*/loc/*<10696*/)/*<10693*/
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 10668');})(/*!*//*10670*/type/*<10670*/)/*<10668*/ }/*<10661*/ }/*<10661*/;

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
if ($target.type === "equotquot") {
{
let l = $target[1];
return /*10843*/l/*<10843*/
}
}
if ($target.type === "equot") {
{
let l = $target[1];
return /*10848*/l/*<10848*/
}
}
if ($target.type === "equot/stmt") {
{
let l = $target[1];
return /*10853*/l/*<10853*/
}
}
if ($target.type === "equot/pat") {
{
let l = $target[1];
return /*10858*/l/*<10858*/
}
}
if ($target.type === "equot/type") {
{
let l = $target[1];
return /*10863*/l/*<10863*/
}
}
if ($target.type === "elambda") {
{
let l = $target[3];
return /*10870*/l/*<10870*/
}
}
if ($target.type === "elet") {
{
let l = $target[3];
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

const and_loc = /*10956*/function name_10956(locs) { return /*10956*/function name_10956(l) { return /*10956*/function name_10956(s) { return /*10964*/(function match_10964($target) {
if ($target === true) {
return /*10968*/`${/*10970*/s/*<10970*/}:${/*11002*/(function match_11002($target) {
if ($target === true) {
return /*11008*/"🚨"/*<11008*/
}
return /*10975*//*10972*/its/*<10972*/(/*10975*//*10976*/l/*<10976*/)/*<10975*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 11002');})(/*!*//*11004*//*11004*//*11005*/$eq/*<11005*/(/*11004*//*11006*/l/*<11006*/)/*<11004*/(/*11004*//*11007*/-1/*<11007*/)/*<11004*/)/*<11002*/}`/*<10968*/
}
return /*10977*/s/*<10977*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 10964');})(/*!*//*10967*/locs/*<10967*/)/*<10964*/ }/*<10956*/ }/*<10956*/ }/*<10956*/;

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
return /*11222*/`(${/*11224*/c/*<11224*/} ${/*11226*//*11226*//*11228*/join/*<11228*/(/*11226*//*11229*/" "/*<11229*/)/*<11226*/(/*11226*//*11231*//*11231*//*11233*/map/*<11233*/(/*11231*//*11234*/pats/*<11234*/)/*<11231*/(/*11231*//*11235*/pat_to_string/*<11235*/)/*<11231*/)/*<11226*/})`/*<11222*/
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
const tenv$slmerge = /*11632*/function name_11632($fn_arg) { return /*11632*/(function match_11632($target) {
if ($target.type === "tenv") {
{
let values = $target[0];
{
let constructors = $target[1];
{
let types = $target[2];
{
let alias = $target[3];
return /*11632*/function name_11632($fn_arg) { return /*11632*/(function match_11632($target) {
if ($target.type === "tenv") {
{
let nvalues = $target[0];
{
let ncons = $target[1];
{
let ntypes = $target[2];
{
let nalias = $target[3];
return /*11642*//*11642*//*11642*//*11642*//*11653*/tenv/*<11653*/(/*11642*//*11654*//*11654*//*11655*/map$slmerge/*<11655*/(/*11654*//*11656*/values/*<11656*/)/*<11654*/(/*11654*//*11657*/nvalues/*<11657*/)/*<11654*/)/*<11642*/(/*11642*//*11658*//*11658*//*11659*/map$slmerge/*<11659*/(/*11658*//*11660*/constructors/*<11660*/)/*<11658*/(/*11658*//*11661*/ncons/*<11661*/)/*<11658*/)/*<11642*/(/*11642*//*11662*//*11662*//*11663*/map$slmerge/*<11663*/(/*11662*//*11664*/types/*<11664*/)/*<11662*/(/*11662*//*11665*/ntypes/*<11665*/)/*<11662*/)/*<11642*/(/*11642*//*13302*//*13302*//*13303*/map$slmerge/*<13303*/(/*13302*//*13304*/alias/*<13304*/)/*<13302*/(/*13302*//*13305*/nalias/*<13305*/)/*<13302*/)/*<11642*/
}
}
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 11632');})(/*!*//*-1*/$fn_arg/*<-1*/)/*<11632*/ }/*<11632*/
}
}
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 11632');})(/*!*//*-1*/$fn_arg/*<-1*/)/*<11632*/ }/*<11632*/;

const inference = (v0) => (v1) => (v2) => (v3) => ({type: "inference", 0: v0, 1: v1, 2: v2, 3: v3});
const analysis = (v0) => (v1) => (v2) => ({type: "analysis", 0: v0, 1: v1, 2: v2});
const value = ({type: "value"});
const type = ({type: "type"});
const has_free = /*12010*/function name_12010(type) { return /*12010*/function name_12010(name) { return /*12017*/(function match_12017($target) {
if ($target.type === "tvar") {
{
let n = $target[0];
return /*12024*//*12024*//*12025*/$eq/*<12025*/(/*12024*//*12026*/n/*<12026*/)/*<12024*/(/*12024*//*12027*/name/*<12027*/)/*<12024*/
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
return /*12045*//*12045*//*12046*/has_free/*<12046*/(/*12045*//*12047*/b/*<12047*/)/*<12045*/(/*12045*//*12048*/name/*<12048*/)/*<12045*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 12039');})(/*!*//*12041*//*12041*//*12042*/has_free/*<12042*/(/*12041*//*12043*/a/*<12043*/)/*<12041*/(/*12041*//*12044*/name/*<12044*/)/*<12041*/)/*<12039*/
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 12017');})(/*!*//*12019*/type/*<12019*/)/*<12017*/ }/*<12010*/ }/*<12010*/;

const any = /*12080*/function name_12080(values) { return /*12080*/function name_12080(f) { return /*12087*/(function match_12087($target) {
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
return /*12104*//*12104*//*12105*/any/*<12105*/(/*12104*//*12106*/rest/*<12106*/)/*<12104*/(/*12104*//*12107*/f/*<12107*/)/*<12104*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 12098');})(/*!*//*12100*//*12101*/f/*<12101*/(/*12100*//*12102*/one/*<12102*/)/*<12100*/)/*<12098*/
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 12087');})(/*!*//*12089*/values/*<12089*/)/*<12087*/ }/*<12080*/ }/*<12080*/;

const tenv$slset_constructors = /*12796*/function name_12796($fn_arg) { return /*12796*/(function match_12796($target) {
if ($target.type === "tenv") {
{
let types = $target[0];
{
let cons = $target[1];
{
let names = $target[2];
{
let alias = $target[3];
return /*12796*/function name_12796(name) { return /*12796*/function name_12796(vbls) { return /*12796*/function name_12796(ncons) { return /*12809*//*12809*//*12809*//*12809*//*12810*/tenv/*<12810*/(/*12809*//*12811*/types/*<12811*/)/*<12809*/(/*12809*//*12812*//*12812*//*12813*/map$slmerge/*<12813*/(/*12812*//*12814*/cons/*<12814*/)/*<12812*/(/*12812*//*12815*/ncons/*<12815*/)/*<12812*/)/*<12809*/(/*12809*//*12816*//*12816*//*12816*//*12817*/map$slset/*<12817*/(/*12816*//*12818*/names/*<12818*/)/*<12816*/(/*12816*//*12819*/name/*<12819*/)/*<12816*/(/*12816*//*12820*//*12820*//*12821*/$co/*<12821*/(/*12820*//*12822*/vbls/*<12822*/)/*<12820*/(/*12820*//*12826*//*12827*/set$slfrom_list/*<12827*/(/*12826*//*12823*//*12824*/map$slkeys/*<12824*/(/*12823*//*12825*/ncons/*<12825*/)/*<12823*/)/*<12826*/)/*<12820*/)/*<12816*/)/*<12809*/(/*12809*//*13297*/alias/*<13297*/)/*<12809*/ }/*<12796*/ }/*<12796*/ }/*<12796*/
}
}
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 12796');})(/*!*//*-1*/$fn_arg/*<-1*/)/*<12796*/ }/*<12796*/;

const map$slhas = /*13428*/function name_13428(map) { return /*13428*/function name_13428(k) { return /*13436*/(function match_13436($target) {
if ($target.type === "some") {
return /*13445*/true/*<13445*/
}
return /*13447*/false/*<13447*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 13436');})(/*!*//*13438*//*13438*//*13439*/map$slget/*<13439*/(/*13438*//*13440*/map/*<13440*/)/*<13438*/(/*13438*//*13441*/k/*<13441*/)/*<13438*/)/*<13436*/ }/*<13428*/ }/*<13428*/;

const tenv$slalias = /*13474*/function name_13474($fn_arg) { return /*13474*/(function match_13474($target) {
if ($target.type === "tenv") {
{
let alias = $target[3];
return /*13485*/alias/*<13485*/
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 13474');})(/*!*//*-1*/$fn_arg/*<-1*/)/*<13474*/ }/*<13474*/;

const extract_type_call = /*13611*/function name_13611(type) { return /*13611*/function name_13611(args) { return /*13617*/(function match_13617($target) {
if ($target.type === "tapp") {
{
let one = $target[0];
{
let arg = $target[1];
{
let l = $target[2];
return /*13631*//*13631*//*13632*/extract_type_call/*<13632*/(/*13631*//*13633*/one/*<13633*/)/*<13631*/(/*13631*//*13636*//*13636*//*13636*/cons/*<13636*/(/*13636*//*13721*//*13721*//*13637*/$co/*<13637*/(/*13721*//*13722*/arg/*<13722*/)/*<13721*/(/*13721*//*13724*/l/*<13724*/)/*<13721*/)/*<13636*/(/*13636*//*13931*/args/*<13931*/)/*<13636*/)/*<13631*/
}
}
}
}
return /*13638*//*13638*//*13639*/$co/*<13639*/(/*13638*//*13640*/type/*<13640*/)/*<13638*/(/*13638*//*13641*/args/*<13641*/)/*<13638*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 13617');})(/*!*//*13619*/type/*<13619*/)/*<13617*/ }/*<13611*/ }/*<13611*/;

const fst = /*13743*/function name_13743($fn_arg) { return /*13743*/(function match_13743($target) {
if ($target.type === ",") {
{
let a = $target[0];
return /*13752*/a/*<13752*/
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 13743');})(/*!*//*-1*/$fn_arg/*<-1*/)/*<13743*/ }/*<13743*/;

const replace_in_type = /*13753*/function name_13753(subst) { return /*13753*/function name_13753(type) { return /*13762*/(function match_13762($target) {
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
return /*13785*//*13785*//*13783*/type$slset_loc/*<13783*/(/*13785*//*13787*/l/*<13787*/)/*<13785*/(/*13785*//*13805*/v/*<13805*/)/*<13785*/
}
}
return /*13788*/type/*<13788*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 13774');})(/*!*//*13776*//*13776*//*13777*/map$slget/*<13777*/(/*13776*//*13778*/subst/*<13778*/)/*<13776*/(/*13776*//*13779*/name/*<13779*/)/*<13776*/)/*<13774*/
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
return /*13794*//*13794*//*13794*//*13795*/tapp/*<13795*/(/*13794*//*13796*//*13796*//*13797*/replace_in_type/*<13797*/(/*13796*//*13798*/subst/*<13798*/)/*<13796*/(/*13796*//*13799*/one/*<13799*/)/*<13796*/)/*<13794*/(/*13794*//*13800*//*13800*//*13801*/replace_in_type/*<13801*/(/*13800*//*13802*/subst/*<13802*/)/*<13800*/(/*13800*//*13803*/two/*<13803*/)/*<13800*/)/*<13794*/(/*13794*//*13804*/l/*<13804*/)/*<13794*/
}
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 13762');})(/*!*//*13764*/type/*<13764*/)/*<13762*/ }/*<13753*/ }/*<13753*/;

const split_stmts = /*14195*/function name_14195(stmts) { return /*14195*/function name_14195(sdefs) { return /*14195*/function name_14195(stypes) { return /*14195*/function name_14195(salias) { return /*14195*/function name_14195(sexps) { return /*14203*/(function match_14203($target) {
if ($target.type === "nil") {
return /*14208*//*14208*//*14208*//*14208*//*14209*/$co$co$co/*<14209*/(/*14208*//*14210*/sdefs/*<14210*/)/*<14208*/(/*14208*//*14221*/stypes/*<14221*/)/*<14208*/(/*14208*//*14356*/salias/*<14356*/)/*<14208*/(/*14208*//*14281*/sexps/*<14281*/)/*<14208*/
}
if ($target.type === "cons") {
{
let one = $target[0];
{
let rest = $target[1];
return /*14218*/(function match_14218($target) {
if ($target.type === "sdef") {
return /*14228*//*14228*//*14228*//*14228*//*14228*//*14229*/split_stmts/*<14229*/(/*14228*//*14230*/rest/*<14230*/)/*<14228*/(/*14228*//*14231*//*14231*//*14231*/cons/*<14231*/(/*14231*//*14232*/one/*<14232*/)/*<14231*/(/*14231*//*14233*/sdefs/*<14233*/)/*<14231*/)/*<14228*/(/*14228*//*14237*/stypes/*<14237*/)/*<14228*/(/*14228*//*14348*/salias/*<14348*/)/*<14228*/(/*14228*//*14282*/sexps/*<14282*/)/*<14228*/
}
if ($target.type === "sdeftype") {
return /*14246*//*14246*//*14246*//*14246*//*14246*//*14247*/split_stmts/*<14247*/(/*14246*//*14248*/rest/*<14248*/)/*<14246*/(/*14246*//*14249*/sdefs/*<14249*/)/*<14246*/(/*14246*//*14250*//*14250*//*14250*/cons/*<14250*/(/*14250*//*14251*/one/*<14251*/)/*<14250*/(/*14250*//*14252*/stypes/*<14252*/)/*<14250*/)/*<14246*/(/*14246*//*14349*/salias/*<14349*/)/*<14246*/(/*14246*//*14283*/sexps/*<14283*/)/*<14246*/
}
if ($target.type === "stypealias") {
{
let name = $target[0];
{
let args = $target[2];
{
let body = $target[3];
return /*14262*//*14262*//*14262*//*14262*//*14262*//*14263*/split_stmts/*<14263*/(/*14262*//*14264*/rest/*<14264*/)/*<14262*/(/*14262*//*14265*/sdefs/*<14265*/)/*<14262*/(/*14262*//*14350*/stypes/*<14350*/)/*<14262*/(/*14262*//*14266*//*14266*//*14266*/cons/*<14266*/(/*14266*//*14267*//*14267*//*14267*//*14358*/$co$co/*<14358*/(/*14267*//*14359*/name/*<14359*/)/*<14267*/(/*14267*//*14360*/args/*<14360*/)/*<14267*/(/*14267*//*14361*/body/*<14361*/)/*<14267*/)/*<14266*/(/*14266*//*14268*/salias/*<14268*/)/*<14266*/)/*<14262*/(/*14262*//*14284*/sexps/*<14284*/)/*<14262*/
}
}
}
}
if ($target.type === "sexpr") {
{
let expr = $target[0];
return /*14273*//*14273*//*14273*//*14273*//*14273*//*14274*/split_stmts/*<14274*/(/*14273*//*14275*/rest/*<14275*/)/*<14273*/(/*14273*//*14276*/sdefs/*<14276*/)/*<14273*/(/*14273*//*14277*/stypes/*<14277*/)/*<14273*/(/*14273*//*14362*/salias/*<14362*/)/*<14273*/(/*14273*//*14288*//*14288*//*14288*/cons/*<14288*/(/*14288*//*14289*/expr/*<14289*/)/*<14288*/(/*14288*//*14290*/sexps/*<14290*/)/*<14288*/)/*<14273*/
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 14218');})(/*!*//*14223*/one/*<14223*/)/*<14218*/
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 14203');})(/*!*//*14205*/stmts/*<14205*/)/*<14203*/ }/*<14195*/ }/*<14195*/ }/*<14195*/ }/*<14195*/ }/*<14195*/;

const tenv$sladd_alias = /*14418*/function name_14418($fn_arg) { return /*14418*/(function match_14418($target) {
if ($target.type === "tenv") {
{
let a = $target[0];
{
let b = $target[1];
{
let c = $target[2];
{
let aliases = $target[3];
return /*14418*/function name_14418(name) { return /*14418*/function name_14418($fn_arg) { return /*14418*/(function match_14418($target) {
if ($target.type === ",") {
{
let args = $target[0];
{
let body = $target[1];
return /*14438*//*14438*//*14438*//*14438*//*14439*/tenv/*<14439*/(/*14438*//*14440*/a/*<14440*/)/*<14438*/(/*14438*//*14441*/b/*<14441*/)/*<14438*/(/*14438*//*14442*/c/*<14442*/)/*<14438*/(/*14438*//*14443*//*14443*//*14443*//*14444*/map$slset/*<14444*/(/*14443*//*14445*/aliases/*<14445*/)/*<14443*/(/*14443*//*14446*/name/*<14446*/)/*<14443*/(/*14443*//*14447*//*14447*//*14448*/$co/*<14448*/(/*14447*//*14449*/args/*<14449*/)/*<14447*/(/*14447*//*14450*/body/*<14450*/)/*<14447*/)/*<14443*/)/*<14438*/
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 14418');})(/*!*//*-1*/$fn_arg/*<-1*/)/*<14418*/ }/*<14418*/ }/*<14418*/
}
}
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 14418');})(/*!*//*-1*/$fn_arg/*<-1*/)/*<14418*/ }/*<14418*/;

const tenv$sladd_builtin_type = /*14630*/function name_14630($fn_arg) { return /*14630*/(function match_14630($target) {
if ($target.type === "tenv") {
{
let a = $target[0];
{
let b = $target[1];
{
let names = $target[2];
{
let d = $target[3];
return /*14630*/function name_14630($fn_arg) { return /*14630*/(function match_14630($target) {
if ($target.type === ",") {
{
let name = $target[0];
{
let args = $target[1];
return /*14645*//*14645*//*14645*//*14645*//*14646*/tenv/*<14646*/(/*14645*//*14647*/a/*<14647*/)/*<14645*/(/*14645*//*14648*/b/*<14648*/)/*<14645*/(/*14645*//*14649*//*14649*//*14649*//*14650*/map$slset/*<14650*/(/*14649*//*14651*/names/*<14651*/)/*<14649*/(/*14649*//*14652*/name/*<14652*/)/*<14649*/(/*14649*//*14653*//*14653*//*14654*/$co/*<14654*/(/*14653*//*14655*/args/*<14655*/)/*<14653*/(/*14653*//*14656*/set$slnil/*<14656*/)/*<14653*/)/*<14649*/)/*<14645*/(/*14645*//*14657*/d/*<14657*/)/*<14645*/
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 14630');})(/*!*//*-1*/$fn_arg/*<-1*/)/*<14630*/ }/*<14630*/
}
}
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 14630');})(/*!*//*-1*/$fn_arg/*<-1*/)/*<14630*/ }/*<14630*/;

const pat_externals = /*15121*/function name_15121(pat) { return /*15127*/(function match_15127($target) {
if ($target.type === "pcon") {
{
let name = $target[0];
{
let args = $target[1];
{
let l = $target[2];
return /*15139*//*15139*//*15140*/bag$sland/*<15140*/(/*15139*//*15141*//*15142*/one/*<15142*/(/*15141*//*15158*//*15158*//*15158*//*15143*/$co$co/*<15143*/(/*15158*//*15159*/name/*<15159*/)/*<15158*/(/*15158*//*15161*/value/*<15161*/)/*<15158*/(/*15158*//*15162*/l/*<15162*/)/*<15158*/)/*<15141*/)/*<15139*/(/*15139*//*15144*//*15145*/many/*<15145*/(/*15144*//*15147*//*15147*//*15148*/map/*<15148*/(/*15147*//*15149*/args/*<15149*/)/*<15147*/(/*15147*//*15150*/pat_externals/*<15150*/)/*<15147*/)/*<15144*/)/*<15139*/
}
}
}
}
return /*15152*/empty/*<15152*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 15127');})(/*!*//*15129*/pat/*<15129*/)/*<15127*/ }/*<15121*/;

const bag$slfold = /*15216*/function name_15216(f) { return /*15216*/function name_15216(init) { return /*15216*/function name_15216(bag) { return /*15224*/(function match_15224($target) {
if ($target.type === "empty") {
return /*15229*/init/*<15229*/
}
if ($target.type === "one") {
{
let v = $target[0];
return /*15233*//*15233*//*15234*/f/*<15234*/(/*15233*//*15235*/init/*<15235*/)/*<15233*/(/*15233*//*15236*/v/*<15236*/)/*<15233*/
}
}
if ($target.type === "many") {
{
let items = $target[0];
return /*15240*//*15240*//*15240*//*15241*/foldr/*<15241*/(/*15240*//*15242*/init/*<15242*/)/*<15240*/(/*15240*//*15257*/items/*<15257*/)/*<15240*/(/*15240*//*15243*//*15255*/bag$slfold/*<15255*/(/*15243*//*15256*/f/*<15256*/)/*<15243*/)/*<15240*/
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 15224');})(/*!*//*15226*/bag/*<15226*/)/*<15224*/ }/*<15216*/ }/*<15216*/ }/*<15216*/;

const find_missing_names = /*15690*/function name_15690(values) { return /*15690*/function name_15690(ex) { return /*15306*/(function let_15306() {const $target = /*15710*//*15710*//*15710*//*15711*/bag$slfold/*<15711*/(/*15710*//*15712*/function name_15712(ext) { return /*15712*/function name_15712($fn_arg) { return /*15712*/(function match_15712($target) {
if ($target.type === ",,") {
{
let name = $target[0];
{
let l = $target[2];
return /*15721*//*15721*//*15721*//*15722*/map$slset/*<15722*/(/*15721*//*15723*/ext/*<15723*/)/*<15721*/(/*15721*//*15724*/name/*<15724*/)/*<15721*/(/*15721*//*15725*/l/*<15725*/)/*<15721*/
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 15712');})(/*!*//*-1*/$fn_arg/*<-1*/)/*<15712*/ }/*<15712*/ }/*<15712*/)/*<15710*/(/*15710*//*15726*/map$slnil/*<15726*/)/*<15710*/(/*15710*//*15844*/ex/*<15844*/)/*<15710*/;
{
let externals = $target;
return /*15286*//*15286*//*15288*/filter/*<15288*/(/*15286*//*15293*/function name_15293($fn_arg) { return /*15293*/(function match_15293($target) {
if ($target.type === ",") {
{
let name = $target[0];
{
let loc = $target[1];
return /*15301*/(function match_15301($target) {
if ($target.type === "some") {
return /*15329*/false/*<15329*/
}
return /*15331*/true/*<15331*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 15301');})(/*!*//*15303*//*15303*//*15323*/map$slget/*<15323*/(/*15303*//*15324*/values/*<15324*/)/*<15303*/(/*15303*//*15325*/name/*<15325*/)/*<15303*/)/*<15301*/
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 15293');})(/*!*//*-1*/$fn_arg/*<-1*/)/*<15293*/ }/*<15293*/)/*<15286*/(/*15286*//*15345*//*15346*/map$slto_list/*<15346*/(/*15345*//*15347*/externals/*<15347*/)/*<15345*/)/*<15286*/
};
throw new Error('let pattern not matched 15708. ' + valueToString($target));})(/*!*/)/*<15306*/ }/*<15690*/ }/*<15690*/;

const tenv$slvalues = /*15757*/function name_15757($fn_arg) { return /*15757*/(function match_15757($target) {
if ($target.type === "tenv") {
{
let values = $target[0];
return /*15769*/values/*<15769*/
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 15757');})(/*!*//*-1*/$fn_arg/*<-1*/)/*<15757*/ }/*<15757*/;

const dot = /*16114*/function name_16114(a) { return /*16114*/function name_16114(b) { return /*16114*/function name_16114(c) { return /*16123*//*16124*/a/*<16124*/(/*16123*//*16125*//*16126*/b/*<16126*/(/*16125*//*16127*/c/*<16127*/)/*<16125*/)/*<16123*/ }/*<16114*/ }/*<16114*/ }/*<16114*/;

const tts_inner = /*2099*/function name_2099(t) { return /*2099*/function name_2099(free) { return /*2099*/function name_2099(locs) { return /*2105*/(function match_2105($target) {
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
return /*5618*//*5618*//*5615*/$co/*<5615*/(/*5618*//*10982*//*10982*//*10982*//*5619*/and_loc/*<5619*/(/*10982*//*10983*/locs/*<10983*/)/*<10982*/(/*10982*//*10984*/l/*<10984*/)/*<10982*/(/*10982*//*10985*/s/*<10985*/)/*<10982*/)/*<5618*/(/*5618*//*5620*/free/*<5620*/)/*<5618*/
}
}
{
let none = $target;
return /*5617*/(function let_5617() {const $target = /*5649*//*5649*//*5649*//*5817*/at/*<5817*/(/*5649*//*5818*/letters/*<5818*/)/*<5649*/(/*5649*//*5819*/idx/*<5819*/)/*<5649*/(/*5649*//*5820*/"_too_many_vbls_"/*<5820*/)/*<5649*/;
{
let name = $target;
return /*5653*//*5653*//*5654*/$co/*<5654*/(/*5653*//*10986*//*10986*//*10986*//*10987*/and_loc/*<10987*/(/*10986*//*10988*/locs/*<10988*/)/*<10986*/(/*10986*//*10989*/l/*<10989*/)/*<10986*/(/*10986*//*5655*/name/*<5655*/)/*<10986*/)/*<5653*/(/*5653*//*5656*//*5656*//*5657*/$co/*<5657*/(/*5656*//*6367*//*6368*/some/*<6368*/(/*6367*//*5658*//*5658*//*5658*//*5659*/map$slset/*<5659*/(/*5658*//*5660*/fmap/*<5660*/)/*<5658*/(/*5658*//*5661*/s/*<5661*/)/*<5658*/(/*5658*//*5662*/name/*<5662*/)/*<5658*/)/*<6367*/)/*<5656*/(/*5656*//*5663*//*5663*//*5665*/$pl/*<5665*/(/*5663*//*5666*/1/*<5666*/)/*<5663*/(/*5663*//*5667*/idx/*<5667*/)/*<5663*/)/*<5656*/)/*<5653*/
};
throw new Error('let pattern not matched 5648. ' + valueToString($target));})(/*!*/)/*<5617*/
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 2113');})(/*!*//*5605*//*5605*//*5609*/map$slget/*<5609*/(/*5605*//*5610*/fmap/*<5610*/)/*<5605*/(/*5605*//*5611*/s/*<5611*/)/*<5605*/)/*<2113*/
}
}
return /*6392*//*6392*//*6348*/$co/*<6348*/(/*6392*//*10978*//*10978*//*10978*//*6393*/and_loc/*<6393*/(/*10978*//*10979*/locs/*<10979*/)/*<10978*/(/*10978*//*10980*/l/*<10980*/)/*<10978*/(/*10978*//*10981*/s/*<10981*/)/*<10978*/)/*<6392*/(/*6392*//*6394*/free/*<6394*/)/*<6392*/
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
return /*5672*//*5672*//*2118*/$co/*<2118*/(/*5672*//*10990*//*10990*//*10990*//*10991*/and_loc/*<10991*/(/*10990*//*10992*/locs/*<10992*/)/*<10990*/(/*10990*//*10993*/l/*<10993*/)/*<10990*/(/*10990*//*5673*/s/*<5673*/)/*<10990*/)/*<5672*/(/*5672*//*5674*/free/*<5674*/)/*<5672*/
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
return /*5675*/(function let_5675() {const $target = /*5909*//*5910*/unwrap_fn/*<5910*/(/*5909*//*5911*/b/*<5911*/)/*<5909*/;
if ($target.type === ",") {
{
let args = $target[0];
{
let r = $target[1];
return /*5675*/(function let_5675() {const $target = /*5913*//*5913*//*5913*/cons/*<5913*/(/*5913*//*5914*/a/*<5914*/)/*<5913*/(/*5913*//*5915*/args/*<5915*/)/*<5913*/;
{
let args = $target;
return /*5675*/(function let_5675() {const $target = /*5684*//*5684*//*5684*//*6209*/tts_list/*<6209*/(/*5684*//*6210*/args/*<6210*/)/*<5684*/(/*5684*//*6211*/free/*<6211*/)/*<5684*/(/*5684*//*10952*/locs/*<10952*/)/*<5684*/;
if ($target.type === ",") {
{
let args = $target[0];
{
let free = $target[1];
return /*5675*/(function let_5675() {const $target = /*5692*//*5692*//*5692*//*5693*/tts_inner/*<5693*/(/*5692*//*5694*/r/*<5694*/)/*<5692*/(/*5692*//*5695*/free/*<5695*/)/*<5692*/(/*5692*//*10953*/locs/*<10953*/)/*<5692*/;
if ($target.type === ",") {
{
let two = $target[0];
{
let free = $target[1];
return /*5696*//*5696*//*5697*/$co/*<5697*/(/*5696*//*10994*//*10994*//*10994*//*10995*/and_loc/*<10995*/(/*10994*//*10996*/locs/*<10996*/)/*<10994*/(/*10994*//*10997*/l/*<10997*/)/*<10994*/(/*10994*//*2132*/`(fn [${/*5919*//*5919*//*2134*/join/*<2134*/(/*5919*//*5940*/" "/*<5940*/)/*<5919*/(/*5919*//*6100*//*6100*//*6101*/rev/*<6101*/(/*6100*//*5920*/args/*<5920*/)/*<6100*/(/*6100*//*6102*/nil/*<6102*/)/*<6100*/)/*<5919*/}] ${/*2138*/two/*<2138*/})`/*<2132*/)/*<10994*/)/*<5696*/(/*5696*//*5698*/free/*<5698*/)/*<5696*/
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
}
}
if ($target.type === "tapp") {
{
let a = $target[0];
{
let b = $target[1];
{
let l = $target[2];
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
return /*5699*/(function let_5699() {const $target = /*6164*//*6164*//*6164*//*6214*/tts_list/*<6214*/(/*6164*//*6215*/args/*<6215*/)/*<6164*/(/*6164*//*6216*/free/*<6216*/)/*<6164*/(/*6164*//*10955*/locs/*<10955*/)/*<6164*/;
if ($target.type === ",") {
{
let args = $target[0];
{
let free = $target[1];
return /*5699*/(function let_5699() {const $target = /*5714*//*5714*//*5714*//*5715*/tts_inner/*<5715*/(/*5714*//*5716*/target/*<5716*/)/*<5714*/(/*5714*//*5717*/free/*<5717*/)/*<5714*/(/*5714*//*10954*/locs/*<10954*/)/*<5714*/;
if ($target.type === ",") {
{
let one = $target[0];
{
let free = $target[1];
return /*5718*//*5718*//*5719*/$co/*<5719*/(/*5718*//*10998*//*10998*//*10998*//*10999*/and_loc/*<10999*/(/*10998*//*11000*/locs/*<11000*/)/*<10998*/(/*10998*//*11001*/l/*<11001*/)/*<10998*/(/*10998*//*2148*/`(${/*2150*/one/*<2150*/} ${/*2154*//*2154*//*6217*/join/*<6217*/(/*2154*//*6218*/" "/*<6218*/)/*<2154*/(/*2154*//*6220*//*6220*//*6221*/rev/*<6221*/(/*6220*//*6222*/args/*<6222*/)/*<6220*/(/*6220*//*6256*/nil/*<6256*/)/*<6220*/)/*<2154*/})`/*<2148*/)/*<10998*/)/*<5718*/(/*5718*//*5720*/free/*<5720*/)/*<5718*/
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
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 2105');})(/*!*//*2107*/t/*<2107*/)/*<2105*/ }/*<2099*/ }/*<2099*/ }/*<2099*/;


const tts_list = /*6165*/function name_6165(args) { return /*6165*/function name_6165(free) { return /*6165*/function name_6165(locs) { return /*6174*//*6174*//*6174*//*6175*/foldl/*<6175*/(/*6174*//*6176*//*6176*//*6177*/$co/*<6177*/(/*6176*//*6178*/nil/*<6178*/)/*<6176*/(/*6176*//*6179*/free/*<6179*/)/*<6176*/)/*<6174*/(/*6174*//*6180*/args/*<6180*/)/*<6174*/(/*6174*//*6181*/function name_6181($fn_arg) { return /*6181*/(function match_6181($target) {
if ($target.type === ",") {
{
let args = $target[0];
{
let free = $target[1];
return /*6181*/function name_6181(a) { return /*6189*/(function let_6189() {const $target = /*6196*//*6196*//*6196*//*6197*/tts_inner/*<6197*/(/*6196*//*6198*/a/*<6198*/)/*<6196*/(/*6196*//*6199*/free/*<6199*/)/*<6196*/(/*6196*//*10949*/locs/*<10949*/)/*<6196*/;
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
throw new Error('failed to match ' + jsonify($target) + '. Loc: 6181');})(/*!*//*-1*/$fn_arg/*<-1*/)/*<6181*/ }/*<6181*/)/*<6174*/ }/*<6165*/ }/*<6165*/ }/*<6165*/;

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

const tenv$slrm = /*926*/function name_926($fn_arg) { return /*926*/(function match_926($target) {
if ($target.type === "tenv") {
{
let types = $target[0];
{
let cons = $target[1];
{
let names = $target[2];
{
let alias = $target[3];
return /*926*/function name_926($var) { return /*3319*//*3319*//*3319*//*3319*//*3320*/tenv/*<3320*/(/*3319*//*981*//*981*//*982*/map$slrm/*<982*/(/*981*//*983*/types/*<983*/)/*<981*/(/*981*//*984*/$var/*<984*/)/*<981*/)/*<3319*/(/*3319*//*3321*/cons/*<3321*/)/*<3319*/(/*3319*//*3322*/names/*<3322*/)/*<3319*/(/*3319*//*13292*/alias/*<13292*/)/*<3319*/ }/*<926*/
}
}
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 926');})(/*!*//*-1*/$fn_arg/*<-1*/)/*<926*/ }/*<926*/;

const tenv_free = /*985*/function name_985($fn_arg) { return /*985*/(function match_985($target) {
if ($target.type === "tenv") {
{
let types = $target[0];
return /*991*//*991*//*991*//*992*/foldr/*<992*/(/*991*//*994*/set$slnil/*<994*/)/*<991*/(/*991*//*995*//*995*//*996*/map/*<996*/(/*995*//*998*//*999*/map$slvalues/*<999*/(/*998*//*1000*/types/*<1000*/)/*<998*/)/*<995*/(/*995*//*1135*/scheme_free/*<1135*/)/*<995*/)/*<991*/(/*991*//*1169*/set$slmerge/*<1169*/)/*<991*/
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 985');})(/*!*//*-1*/$fn_arg/*<-1*/)/*<985*/ }/*<985*/;

const tenv_apply = /*1170*/function name_1170(subst) { return /*1170*/function name_1170($fn_arg) { return /*1170*/(function match_1170($target) {
if ($target.type === "tenv") {
{
let types = $target[0];
{
let cons = $target[1];
{
let names = $target[2];
{
let alias = $target[3];
return /*3332*//*3332*//*3332*//*3332*//*3333*/tenv/*<3333*/(/*3332*//*1179*//*1179*//*1180*/map$slmap/*<1180*/(/*1179*//*1181*//*1182*/scheme_apply/*<1182*/(/*1181*//*1183*/subst/*<1183*/)/*<1181*/)/*<1179*/(/*1179*//*1185*/types/*<1185*/)/*<1179*/)/*<3332*/(/*3332*//*3334*/cons/*<3334*/)/*<3332*/(/*3332*//*3335*/names/*<3335*/)/*<3332*/(/*3332*//*13299*/alias/*<13299*/)/*<3332*/
}
}
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 1170');})(/*!*//*-1*/$fn_arg/*<-1*/)/*<1170*/ }/*<1170*/ }/*<1170*/;

const generalize = /*1186*/function name_1186(tenv) { return /*1186*/function name_1186(t) { return /*1193*//*1193*//*1194*/scheme/*<1194*/(/*1193*//*1195*//*1195*//*1196*/set$sldiff/*<1196*/(/*1195*//*1197*//*1198*/type_free/*<1198*/(/*1197*//*1199*/t/*<1199*/)/*<1197*/)/*<1195*/(/*1195*//*1200*//*1201*/tenv_free/*<1201*/(/*1200*//*1202*/tenv/*<1202*/)/*<1200*/)/*<1195*/)/*<1193*/(/*1193*//*1203*/t/*<1203*/)/*<1193*/ }/*<1186*/ }/*<1186*/;

const new_type_var = /*1731*/function name_1731(prefix) { return /*1731*/function name_1731(nidx) { return /*1731*/function name_1731(l) { return /*1739*//*1739*//*1740*/$co/*<1740*/(/*1739*//*2074*//*2074*//*2075*/tvar/*<2075*/(/*2074*//*1741*/`${/*1743*/prefix/*<1743*/}:${/*10496*//*1745*/its/*<1745*/(/*10496*//*10497*/nidx/*<10497*/)/*<10496*/}`/*<1741*/)/*<2074*/(/*2074*//*2076*/l/*<2076*/)/*<2074*/)/*<1739*/(/*1739*//*1759*//*1759*//*1761*/$pl/*<1761*/(/*1759*//*1762*/1/*<1762*/)/*<1759*/(/*1759*//*1747*/nidx/*<1747*/)/*<1759*/)/*<1739*/ }/*<1731*/ }/*<1731*/ }/*<1731*/;

const basic = /*3374*//*3374*//*3374*//*3374*//*3375*/tenv/*<3375*/(/*3374*//*3367*//*3368*/map$slfrom_list/*<3368*/(/*3367*//*3366*//*3366*//*3366*/cons/*<3366*/(/*3366*//*2042*//*2042*//*2043*/$co/*<2043*/(/*2042*//*2045*/"+"/*<2045*/)/*<2042*/(/*2042*//*2087*//*2087*//*2088*/scheme/*<2088*/(/*2087*//*2091*/set$slnil/*<2091*/)/*<2087*/(/*2087*//*2047*//*2047*//*2047*//*2048*/tfn/*<2048*/(/*2047*//*2049*/tint/*<2049*/)/*<2047*/(/*2047*//*2094*//*2094*//*2094*//*2095*/tfn/*<2095*/(/*2094*//*2096*/tint/*<2096*/)/*<2094*/(/*2094*//*2061*/tint/*<2061*/)/*<2094*/(/*2094*//*2097*/-1/*<2097*/)/*<2094*/)/*<2047*/(/*2047*//*2062*/-1/*<2062*/)/*<2047*/)/*<2087*/)/*<2042*/)/*<3366*/(/*3366*//*3366*//*3366*//*3366*/cons/*<3366*/(/*3366*//*9705*//*9705*//*9706*/$co/*<9706*/(/*9705*//*9707*/"-"/*<9707*/)/*<9705*/(/*9705*//*9709*//*9709*//*9710*/scheme/*<9710*/(/*9709*//*9711*/set$slnil/*<9711*/)/*<9709*/(/*9709*//*9712*//*9712*//*9712*//*9713*/tfn/*<9713*/(/*9712*//*9714*/tint/*<9714*/)/*<9712*/(/*9712*//*9715*//*9715*//*9715*//*9716*/tfn/*<9716*/(/*9715*//*9717*/tint/*<9717*/)/*<9715*/(/*9715*//*9718*/tint/*<9718*/)/*<9715*/(/*9715*//*9719*/-1/*<9719*/)/*<9715*/)/*<9712*/(/*9712*//*9720*/-1/*<9720*/)/*<9712*/)/*<9709*/)/*<9705*/)/*<3366*/(/*3366*//*3366*//*3366*//*3366*/cons/*<3366*/(/*3366*//*3369*//*3369*//*3370*/$co/*<3370*/(/*3369*//*3372*/","/*<3372*/)/*<3369*/(/*3369*//*2374*//*2374*//*2375*/scheme/*<2375*/(/*2374*//*2376*//*2380*/set$slfrom_list/*<2380*/(/*2376*//*3225*//*3225*//*3225*/cons/*<3225*/(/*3225*//*2382*/"a"/*<2382*/)/*<3225*/(/*3225*//*3225*//*3225*//*3225*/cons/*<3225*/(/*3225*//*3226*/"b"/*<3226*/)/*<3225*/(/*3225*//*3225*/nil/*<3225*/)/*<3225*/)/*<3225*/)/*<2376*/)/*<2374*/(/*2374*//*2377*//*2377*//*2377*//*2378*/tfn/*<2378*/(/*2377*//*2379*//*2379*//*2384*/tvar/*<2384*/(/*2379*//*2385*/"a"/*<2385*/)/*<2379*/(/*2379*//*2387*/-1/*<2387*/)/*<2379*/)/*<2377*/(/*2377*//*2388*//*2388*//*2388*//*2389*/tfn/*<2389*/(/*2388*//*2390*//*2390*//*2391*/tvar/*<2391*/(/*2390*//*2392*/"b"/*<2392*/)/*<2390*/(/*2390*//*2394*/-1/*<2394*/)/*<2390*/)/*<2388*/(/*2388*//*2402*//*2402*//*2402*//*2403*/tapp/*<2403*/(/*2402*//*2400*//*2400*//*2400*//*2401*/tapp/*<2401*/(/*2400*//*2395*//*2395*//*2396*/tcon/*<2396*/(/*2395*//*2397*/","/*<2397*/)/*<2395*/(/*2395*//*2399*/-1/*<2399*/)/*<2395*/)/*<2400*/(/*2400*//*2404*//*2404*//*2405*/tvar/*<2405*/(/*2404*//*2406*/"a"/*<2406*/)/*<2404*/(/*2404*//*2408*/-1/*<2408*/)/*<2404*/)/*<2400*/(/*2400*//*2409*/-1/*<2409*/)/*<2400*/)/*<2402*/(/*2402*//*2410*//*2410*//*2411*/tvar/*<2411*/(/*2410*//*2412*/"b"/*<2412*/)/*<2410*/(/*2410*//*2414*/-1/*<2414*/)/*<2410*/)/*<2402*/(/*2402*//*2415*/-1/*<2415*/)/*<2402*/)/*<2388*/(/*2388*//*2416*/-1/*<2416*/)/*<2388*/)/*<2377*/(/*2377*//*2417*/-1/*<2417*/)/*<2377*/)/*<2374*/)/*<3369*/)/*<3366*/(/*3366*//*3366*/nil/*<3366*/)/*<3366*/)/*<3366*/)/*<3366*/)/*<3367*/)/*<3374*/(/*3374*//*3376*//*3676*/map$slfrom_list/*<3676*/(/*3376*//*3677*//*3677*//*3677*/cons/*<3677*/(/*3677*//*3678*//*3678*//*3681*/$co/*<3681*/(/*3678*//*3682*/","/*<3682*/)/*<3678*/(/*3678*//*3684*//*3684*//*3684*//*3685*/tconstructor/*<3685*/(/*3684*//*3686*//*3687*/set$slfrom_list/*<3687*/(/*3686*//*3688*//*3688*//*3688*/cons/*<3688*/(/*3688*//*3689*/"a"/*<3689*/)/*<3688*/(/*3688*//*3688*//*3688*//*3688*/cons/*<3688*/(/*3688*//*3691*/"b"/*<3691*/)/*<3688*/(/*3688*//*3688*/nil/*<3688*/)/*<3688*/)/*<3688*/)/*<3686*/)/*<3684*/(/*3684*//*3693*//*3693*//*3693*/cons/*<3693*/(/*3693*//*3696*//*3696*//*3697*/tvar/*<3697*/(/*3696*//*3698*/"a"/*<3698*/)/*<3696*/(/*3696*//*3700*/-1/*<3700*/)/*<3696*/)/*<3693*/(/*3693*//*3693*//*3693*//*3693*/cons/*<3693*/(/*3693*//*3701*//*3701*//*3702*/tvar/*<3702*/(/*3701*//*3703*/"b"/*<3703*/)/*<3701*/(/*3701*//*3705*/-1/*<3705*/)/*<3701*/)/*<3693*/(/*3693*//*3693*/nil/*<3693*/)/*<3693*/)/*<3693*/)/*<3684*/(/*3684*//*3706*//*3706*//*3706*//*3707*/tapp/*<3707*/(/*3706*//*3708*//*3708*//*3708*//*3709*/tapp/*<3709*/(/*3708*//*3710*//*3710*//*3711*/tcon/*<3711*/(/*3710*//*3712*/","/*<3712*/)/*<3710*/(/*3710*//*3714*/-1/*<3714*/)/*<3710*/)/*<3708*/(/*3708*//*3715*//*3715*//*3716*/tvar/*<3716*/(/*3715*//*3717*/"a"/*<3717*/)/*<3715*/(/*3715*//*3719*/-1/*<3719*/)/*<3715*/)/*<3708*/(/*3708*//*3727*/-1/*<3727*/)/*<3708*/)/*<3706*/(/*3706*//*3720*//*3720*//*3721*/tvar/*<3721*/(/*3720*//*3722*/"b"/*<3722*/)/*<3720*/(/*3720*//*3724*/-1/*<3724*/)/*<3720*/)/*<3706*/(/*3706*//*3726*/-1/*<3726*/)/*<3706*/)/*<3684*/)/*<3678*/)/*<3677*/(/*3677*//*3677*/nil/*<3677*/)/*<3677*/)/*<3376*/)/*<3374*/(/*3374*//*3377*//*14990*/map$slfrom_list/*<14990*/(/*3377*//*14991*//*14991*//*14991*/cons/*<14991*/(/*14991*//*14992*//*14992*//*14993*/$co/*<14993*/(/*14992*//*14994*/"int"/*<14994*/)/*<14992*/(/*14992*//*14996*//*14996*//*14997*/$co/*<14997*/(/*14996*//*14998*/0/*<14998*/)/*<14996*/(/*14996*//*14999*/set$slnil/*<14999*/)/*<14996*/)/*<14992*/)/*<14991*/(/*14991*//*14991*//*14991*//*14991*/cons/*<14991*/(/*14991*//*15000*//*15000*//*15001*/$co/*<15001*/(/*15000*//*15002*/"string"/*<15002*/)/*<15000*/(/*15000*//*15004*//*15004*//*15005*/$co/*<15005*/(/*15004*//*15006*/0/*<15006*/)/*<15004*/(/*15004*//*15007*/set$slnil/*<15007*/)/*<15004*/)/*<15000*/)/*<14991*/(/*14991*//*14991*//*14991*//*14991*/cons/*<14991*/(/*14991*//*15008*//*15008*//*15009*/$co/*<15009*/(/*15008*//*15010*/"bool"/*<15010*/)/*<15008*/(/*15008*//*15012*//*15012*//*15014*/$co/*<15014*/(/*15012*//*15015*/0/*<15015*/)/*<15012*/(/*15012*//*15016*/set$slnil/*<15016*/)/*<15012*/)/*<15008*/)/*<14991*/(/*14991*//*14991*/nil/*<14991*/)/*<14991*/)/*<14991*/)/*<14991*/)/*<3377*/)/*<3374*/(/*3374*//*13333*/map$slnil/*<13333*/)/*<3374*/;

const type_to_string = /*5590*/function name_5590(t) { return /*5624*/(function let_5624() {const $target = /*5596*//*5596*//*5596*//*5597*/tts_inner/*<5597*/(/*5596*//*5598*/t/*<5598*/)/*<5596*/(/*5596*//*5601*//*5601*//*5599*/$co/*<5599*/(/*5601*//*6349*//*5602*/some/*<5602*/(/*6349*//*6350*/map$slnil/*<6350*/)/*<6349*/)/*<5601*/(/*5601*//*5603*/0/*<5603*/)/*<5601*/)/*<5596*/(/*5596*//*10950*/false/*<10950*/)/*<5596*/;
if ($target.type === ",") {
{
let text = $target[0];
return /*5636*/text/*<5636*/
}
};
throw new Error('let pattern not matched 5632. ' + valueToString($target));})(/*!*/)/*<5624*/ }/*<5590*/;

const type_to_string_raw = /*6370*/function name_6370(t) { return /*6376*/(function let_6376() {const $target = /*6384*//*6384*//*6384*//*6385*/tts_inner/*<6385*/(/*6384*//*6386*/t/*<6386*/)/*<6384*/(/*6384*//*6387*//*6387*//*6388*/$co/*<6388*/(/*6387*//*6389*/none/*<6389*/)/*<6387*/(/*6387*//*6390*/0/*<6390*/)/*<6387*/)/*<6384*/(/*6384*//*10951*/false/*<10951*/)/*<6384*/;
if ($target.type === ",") {
{
let text = $target[0];
return /*6391*/text/*<6391*/
}
};
throw new Error('let pattern not matched 6380. ' + valueToString($target));})(/*!*/)/*<6376*/ }/*<6370*/;

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
return /*7029*//*7030*/one/*<7030*/(/*7029*//*6949*//*6949*//*6949*//*6950*/$co$co/*<6950*/(/*6949*//*6951*/name/*<6951*/)/*<6949*/(/*6949*//*11758*/value/*<11758*/)/*<6949*/(/*6949*//*6953*/l/*<6953*/)/*<6949*/)/*<7029*/
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
if ($target.type === "equot/type") {
return /*10473*/empty/*<10473*/
}
if ($target.type === "equot/pat") {
return /*10479*/empty/*<10479*/
}
if ($target.type === "equot/stmt") {
return /*10485*/empty/*<10485*/
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
return /*8857*//*8857*//*8858*/bag$sland/*<8858*/(/*8857*//*15153*//*15153*//*15154*/bag$sland/*<15154*/(/*15153*//*15155*//*15156*/pat_externals/*<15156*/(/*15155*//*15157*/pat/*<15157*/)/*<15155*/)/*<15153*/(/*15153*//*8859*//*8859*//*8860*/externals/*<8860*/(/*8859*//*8861*/bound/*<8861*/)/*<8859*/(/*8859*//*8862*/init/*<8862*/)/*<8859*/)/*<15153*/)/*<8857*/(/*8857*//*8863*//*8863*//*8864*/externals/*<8864*/(/*8863*//*8865*//*8865*//*8866*/set$slmerge/*<8866*/(/*8865*//*8867*/bound/*<8867*/)/*<8865*/(/*8865*//*8868*//*8869*/pat_names/*<8869*/(/*8868*//*8870*/pat/*<8870*/)/*<8868*/)/*<8865*/)/*<8863*/(/*8863*//*8871*/body/*<8871*/)/*<8863*/)/*<8857*/
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
return /*7176*//*7176*//*7244*/bag$sland/*<7244*/(/*7176*//*15165*//*15165*//*7245*/bag$sland/*<7245*/(/*15165*//*15166*/bag/*<15166*/)/*<15165*/(/*15165*//*15167*//*15168*/pat_externals/*<15168*/(/*15167*//*15169*/pat/*<15169*/)/*<15167*/)/*<15165*/)/*<7176*/(/*7176*//*7246*//*7246*//*7247*/externals/*<7247*/(/*7246*//*7248*//*7248*//*7249*/set$slmerge/*<7249*/(/*7248*//*7250*/bound/*<7250*/)/*<7248*/(/*7248*//*7251*//*7252*/pat_names/*<7252*/(/*7251*//*7253*/pat/*<7253*/)/*<7251*/)/*<7248*/)/*<7246*/(/*7246*//*7254*/body/*<7254*/)/*<7246*/)/*<7176*/
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 7168');})(/*!*//*-1*/$fn_arg/*<-1*/)/*<7168*/ }/*<7168*/ }/*<7168*/)/*<7163*/)/*<7157*/
}
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 6925');})(/*!*//*6927*/expr/*<6927*/)/*<6925*/ }/*<6917*/ }/*<6917*/;

const externals_type = /*7334*/function name_7334(bound) { return /*7334*/function name_7334(t) { return /*7342*/(function match_7342($target) {
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
return /*14110*//*14111*/one/*<14111*/(/*14110*//*14112*//*14112*//*14112*//*14113*/$co$co/*<14113*/(/*14112*//*14114*/name/*<14114*/)/*<14112*/(/*14112*//*14142*/type/*<14142*/)/*<14112*/(/*14112*//*14115*/l/*<14115*/)/*<14112*/)/*<14110*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 14103');})(/*!*//*14105*//*14105*//*14106*/set$slhas/*<14106*/(/*14105*//*14107*/bound/*<14107*/)/*<14105*/(/*14105*//*14108*/name/*<14108*/)/*<14105*/)/*<14103*/
}
}
}
if ($target.type === "tapp") {
{
let one = $target[0];
{
let two = $target[1];
return /*14121*//*14121*//*14122*/bag$sland/*<14122*/(/*14121*//*14123*//*14123*//*14124*/externals_type/*<14124*/(/*14123*//*14126*/bound/*<14126*/)/*<14123*/(/*14123*//*14127*/one/*<14127*/)/*<14123*/)/*<14121*/(/*14121*//*14128*//*14128*//*14129*/externals_type/*<14129*/(/*14128*//*14130*/bound/*<14130*/)/*<14128*/(/*14128*//*14131*/two/*<14131*/)/*<14128*/)/*<14121*/
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 7342');})(/*!*//*14093*/t/*<14093*/)/*<7342*/ }/*<7334*/ }/*<7334*/;

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
return /*7441*//*7441*//*7441*//*7442*/foldr/*<7442*/(/*7441*//*7443*/nil/*<7443*/)/*<7441*/(/*7441*//*7444*/bags/*<7444*/)/*<7441*/(/*7441*//*7445*/function name_7445(res) { return /*7445*/function name_7445(bag) { return /*7450*/(function match_7450($target) {
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

const names = /*7511*/function name_7511(stmt) { return /*7517*/(function match_7517($target) {
if ($target.type === "sdef") {
{
let name = $target[0];
{
let l = $target[1];
return /*7526*//*7526*//*7526*/cons/*<7526*/(/*7526*//*10654*//*10654*//*10654*//*7527*/$co$co/*<7527*/(/*10654*//*10655*/name/*<10655*/)/*<10654*/(/*10654*//*11761*/value/*<11761*/)/*<10654*/(/*10654*//*10656*/l/*<10656*/)/*<10654*/)/*<7526*/(/*7526*//*7526*/nil/*<7526*/)/*<7526*/
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
return /*13230*//*13230*//*13230*/cons/*<13230*/(/*13230*//*13231*//*13231*//*13231*//*13232*/$co$co/*<13232*/(/*13231*//*13233*/name/*<13233*/)/*<13231*/(/*13231*//*13235*/type/*<13235*/)/*<13231*/(/*13231*//*13236*/l/*<13236*/)/*<13231*/)/*<13230*/(/*13230*//*13230*/nil/*<13230*/)/*<13230*/
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
return /*13935*//*13935*//*13935*/cons/*<13935*/(/*13935*//*13936*//*13936*//*13936*//*13937*/$co$co/*<13937*/(/*13936*//*13938*/name/*<13938*/)/*<13936*/(/*13936*//*13940*/type/*<13940*/)/*<13936*/(/*13936*//*13941*/l/*<13941*/)/*<13936*/)/*<13935*/(/*13935*//*13942*//*13942*//*13968*/map/*<13968*/(/*13942*//*13969*/constructors/*<13969*/)/*<13942*/(/*13942*//*13970*/function name_13970($fn_arg) { return /*13970*/(function match_13970($target) {
if ($target.type === ",,,") {
{
let name = $target[0];
{
let l = $target[1];
return /*13979*//*13979*//*13979*//*13980*/$co$co/*<13980*/(/*13979*//*13981*/name/*<13981*/)/*<13979*/(/*13979*//*13983*/value/*<13983*/)/*<13979*/(/*13979*//*13984*/l/*<13984*/)/*<13979*/
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 13970');})(/*!*//*-1*/$fn_arg/*<-1*/)/*<13970*/ }/*<13970*/)/*<13942*/)/*<13935*/
}
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 7517');})(/*!*//*7519*/stmt/*<7519*/)/*<7517*/ }/*<7511*/;

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

const expr_to_string = /*11103*/function name_11103(expr) { return /*11109*/(function match_11109($target) {
if ($target.type === "evar") {
{
let n = $target[0];
return /*11118*/n/*<11118*/
}
}
if ($target.type === "elambda") {
{
let n = $target[0];
{
let b = $target[2];
return /*11125*/`(fn [${/*11127*/n/*<11127*/}] ${/*11129*//*11131*/expr_to_string/*<11131*/(/*11129*//*11132*/b/*<11132*/)/*<11129*/})`/*<11125*/
}
}
}
if ($target.type === "eapp") {
{
let a = $target[0];
{
let b = $target[1];
return /*11138*/`(${/*11143*//*11140*/expr_to_string/*<11140*/(/*11143*//*11144*/a/*<11144*/)/*<11143*/} ${/*11145*//*11147*/expr_to_string/*<11147*/(/*11145*//*11148*/b/*<11148*/)/*<11145*/})`/*<11138*/
}
}
}
if ($target.type === "eprim") {
if ($target[0].type === "pint") {
{
let n = $target[0][0];
return /*11159*//*11160*/int_to_string/*<11160*/(/*11159*//*11161*/n/*<11161*/)/*<11159*/
}
}
}
if ($target.type === "ematch") {
{
let t = $target[0];
{
let cases = $target[1];
return /*11167*/`(match ${/*11169*//*11171*/expr_to_string/*<11171*/(/*11169*//*11172*/t/*<11172*/)/*<11169*/} ${/*11173*//*11173*//*11175*/join/*<11175*/(/*11173*//*11176*/"\n"/*<11176*/)/*<11173*/(/*11173*//*11178*//*11178*//*11179*/map/*<11179*/(/*11178*//*11180*/cases/*<11180*/)/*<11178*/(/*11178*//*11181*/function name_11181($fn_arg) { return /*11181*/(function match_11181($target) {
if ($target.type === ",") {
{
let a = $target[0];
{
let b = $target[1];
return /*11188*/`${/*11190*//*11192*/pat_to_string/*<11192*/(/*11190*//*11193*/a/*<11193*/)/*<11190*/} ${/*11194*//*11196*/expr_to_string/*<11196*/(/*11194*//*11197*/b/*<11197*/)/*<11194*/}`/*<11188*/
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 11181');})(/*!*//*-1*/$fn_arg/*<-1*/)/*<11181*/ }/*<11181*/)/*<11178*/)/*<11173*/}`/*<11167*/
}
}
}
return /*11150*/"??"/*<11150*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 11109');})(/*!*//*11113*/expr/*<11113*/)/*<11109*/ }/*<11103*/;

const check_invariant = /*12411*/function name_12411(place) { return /*12411*/function name_12411(new_subst) { return /*12411*/function name_12411(old_subst) { return /*12421*//*12421*//*12421*//*12422*/foldl/*<12422*/(/*12421*//*12530*/none/*<12530*/)/*<12421*/(/*12421*//*12424*//*12425*/map$slkeys/*<12425*/(/*12424*//*12426*/old_subst/*<12426*/)/*<12424*/)/*<12421*/(/*12421*//*12428*/function name_12428(current) { return /*12428*/function name_12428(key) { return /*12487*/(function match_12487($target) {
if ($target.type === "some") {
{
let v = $target[0];
return /*12493*/current/*<12493*/
}
}
if ($target.type === "none") {
return /*12454*//*12454*//*12454*//*12455*/foldl/*<12455*/(/*12454*//*12532*/none/*<12532*/)/*<12454*/(/*12454*//*12433*//*12453*/map$slto_list/*<12453*/(/*12433*//*12456*/new_subst/*<12456*/)/*<12433*/)/*<12454*/(/*12454*//*12457*/function name_12457(current) { return /*12457*/function name_12457($fn_arg) { return /*12457*/(function match_12457($target) {
if ($target.type === ",") {
{
let nkey = $target[0];
{
let type = $target[1];
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
return /*12471*//*12472*/some/*<12472*/(/*12471*//*12473*/`compose-subst[${/*12475*/place/*<12475*/}]: old-subst has key ${/*12477*/key/*<12477*/}, which is used in new-subst for ${/*12479*/nkey/*<12479*/} => ${/*12481*//*12483*/type_to_string_raw/*<12483*/(/*12481*//*12485*/type/*<12485*/)/*<12481*/}`/*<12473*/)/*<12471*/
}
return /*12486*/current/*<12486*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 12461');})(/*!*//*12467*//*12467*//*12468*/has_free/*<12468*/(/*12467*//*12469*/type/*<12469*/)/*<12467*/(/*12467*//*12470*/key/*<12470*/)/*<12467*/)/*<12461*/
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 12502');})(/*!*//*12504*/current/*<12504*/)/*<12502*/
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 12457');})(/*!*//*-1*/$fn_arg/*<-1*/)/*<12457*/ }/*<12457*/ }/*<12457*/)/*<12454*/
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 12487');})(/*!*//*12489*/current/*<12489*/)/*<12487*/ }/*<12428*/ }/*<12428*/)/*<12421*/ }/*<12411*/ }/*<12411*/ }/*<12411*/;

const check_type_names = /*13357*/function name_13357(tenv$qu) { return /*13357*/function name_13357(type) { return /*13365*/(function match_13365($target) {
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
return /*13403*//*13404*/fatal/*<13404*/(/*13403*//*13405*/`Unknown type ${/*13407*/name/*<13407*/}`/*<13405*/)/*<13403*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 13396');})(/*!*//*13398*//*13398*//*13399*/map$slhas/*<13399*/(/*13398*//*13400*/alias/*<13400*/)/*<13398*/(/*13398*//*13401*/name/*<13401*/)/*<13398*/)/*<13396*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 13389');})(/*!*//*13391*//*13391*//*13392*/map$slhas/*<13392*/(/*13391*//*13393*/types/*<13393*/)/*<13391*/(/*13391*//*13394*/name/*<13394*/)/*<13391*/)/*<13389*/
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
return /*13420*//*13420*//*13421*/check_type_names/*<13421*/(/*13420*//*13422*/tenv$qu/*<13422*/)/*<13420*/(/*13420*//*13423*/two/*<13423*/)/*<13420*/
}
return /*13424*/false/*<13424*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 13414');})(/*!*//*13416*//*13416*//*13417*/check_type_names/*<13417*/(/*13416*//*13418*/tenv$qu/*<13418*/)/*<13416*/(/*13416*//*13419*/one/*<13419*/)/*<13416*/)/*<13414*/
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 13365');})(/*!*//*13369*/type/*<13369*/)/*<13365*/ }/*<13357*/ }/*<13357*/;

const subst_aliases = /*13461*/function name_13461(alias) { return /*13461*/function name_13461(type) { return /*13642*/(function let_13642() {const $target = /*13649*//*13649*//*13650*/extract_type_call/*<13650*/(/*13649*//*13651*/type/*<13651*/)/*<13649*/(/*13649*//*13738*/nil/*<13738*/)/*<13649*/;
if ($target.type === ",") {
{
let base = $target[0];
{
let args = $target[1];
return /*13642*/(function let_13642() {const $target = /*13709*//*13709*//*13710*/map/*<13710*/(/*13709*//*13711*/args/*<13711*/)/*<13709*/(/*13709*//*13725*/function name_13725($fn_arg) { return /*13725*/(function match_13725($target) {
if ($target.type === ",") {
{
let arg = $target[0];
{
let l = $target[1];
return /*13732*//*13732*//*13733*/$co/*<13733*/(/*13732*//*13712*//*13712*//*13713*/subst_aliases/*<13713*/(/*13712*//*13714*/alias/*<13714*/)/*<13712*/(/*13712*//*13735*/arg/*<13735*/)/*<13712*/)/*<13732*/(/*13732*//*13736*/l/*<13736*/)/*<13732*/
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 13725');})(/*!*//*-1*/$fn_arg/*<-1*/)/*<13725*/ }/*<13725*/)/*<13709*/;
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
return /*13682*//*13683*/fatal/*<13683*/(/*13682*//*13684*/`Wrong number of args given to alias ${/*13686*/name/*<13686*/}: expected ${/*13806*//*13807*/its/*<13807*/(/*13806*//*13688*//*13690*/len/*<13690*/(/*13688*//*13691*/names/*<13691*/)/*<13688*/)/*<13806*/}, given ${/*13808*//*13809*/its/*<13809*/(/*13808*//*13692*//*13694*/len/*<13694*/(/*13692*//*13695*/args/*<13695*/)/*<13692*/)/*<13808*/}.`/*<13684*/)/*<13682*/
}
return /*14025*/(function let_14025() {const $target = /*14042*/(function match_14042($target) {
if ($target === true) {
return /*14050*/subst/*<14050*/
}
return /*14030*//*14030*//*14031*/replace_in_type/*<14031*/(/*14030*//*14032*//*14033*/map$slfrom_list/*<14033*/(/*14032*//*14034*//*14034*//*14035*/zip/*<14035*/(/*14034*//*14036*/names/*<14036*/)/*<14034*/(/*14034*//*14037*//*14037*//*14038*/map/*<14038*/(/*14037*//*14039*/args/*<14039*/)/*<14037*/(/*14037*//*14040*/fst/*<14040*/)/*<14037*/)/*<14034*/)/*<14032*/)/*<14030*/(/*14030*//*14041*/subst/*<14041*/)/*<14030*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 14042');})(/*!*//*14044*//*14044*//*14045*/$eq/*<14045*/(/*14044*//*14046*//*14047*/len/*<14047*/(/*14046*//*14048*/names/*<14048*/)/*<14046*/)/*<14044*/(/*14044*//*14049*/0/*<14049*/)/*<14044*/)/*<14042*/;
{
let subst = $target;
return /*14021*//*14021*//*14022*/subst_aliases/*<14022*/(/*14021*//*14023*/alias/*<14023*/)/*<14021*/(/*14021*//*13696*/subst/*<13696*/)/*<14021*/
};
throw new Error('let pattern not matched 14028. ' + valueToString($target));})(/*!*/)/*<14025*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 13672');})(/*!*//*13674*//*13674*//*13675*/$ex$eq/*<13675*/(/*13674*//*13676*//*13677*/len/*<13677*/(/*13676*//*13678*/names/*<13678*/)/*<13676*/)/*<13674*/(/*13674*//*13679*//*13680*/len/*<13680*/(/*13679*//*13681*/args/*<13681*/)/*<13679*/)/*<13674*/)/*<13672*/
}
}
}
}
return /*13716*//*13716*//*13716*//*13717*/foldl/*<13717*/(/*13716*//*13718*/base/*<13718*/)/*<13716*/(/*13716*//*13719*/args/*<13719*/)/*<13716*/(/*13716*//*13720*/function name_13720(target) { return /*13720*/function name_13720($fn_arg) { return /*13720*/(function match_13720($target) {
if ($target.type === ",") {
{
let arg = $target[0];
{
let l = $target[1];
return /*13814*//*13814*//*13814*//*13818*/tapp/*<13818*/(/*13814*//*13819*/target/*<13819*/)/*<13814*/(/*13814*//*13820*/arg/*<13820*/)/*<13814*/(/*13814*//*13821*/l/*<13821*/)/*<13814*/
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 13720');})(/*!*//*-1*/$fn_arg/*<-1*/)/*<13720*/ }/*<13720*/ }/*<13720*/)/*<13716*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 13659');})(/*!*//*13661*//*13661*//*13662*/map$slget/*<13662*/(/*13661*//*13663*/alias/*<13663*/)/*<13661*/(/*13661*//*13664*/name/*<13664*/)/*<13661*/)/*<13659*/
}
}
return /*13824*//*13824*//*13824*//*13825*/foldl/*<13825*/(/*13824*//*13826*/base/*<13826*/)/*<13824*/(/*13824*//*13827*/args/*<13827*/)/*<13824*/(/*13824*//*13828*/function name_13828(target) { return /*13828*/function name_13828($fn_arg) { return /*13828*/(function match_13828($target) {
if ($target.type === ",") {
{
let arg = $target[0];
{
let l = $target[1];
return /*13836*//*13836*//*13836*//*13837*/tapp/*<13837*/(/*13836*//*13838*/target/*<13838*/)/*<13836*/(/*13836*//*13839*/arg/*<13839*/)/*<13836*/(/*13836*//*13840*/l/*<13840*/)/*<13836*/
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 13828');})(/*!*//*-1*/$fn_arg/*<-1*/)/*<13828*/ }/*<13828*/ }/*<13828*/)/*<13824*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 13652');})(/*!*//*13654*/base/*<13654*/)/*<13652*/
};
throw new Error('let pattern not matched 13708. ' + valueToString($target));})(/*!*/)/*<13642*/
}
}
};
throw new Error('let pattern not matched 13645. ' + valueToString($target));})(/*!*/)/*<13642*/ }/*<13461*/ }/*<13461*/;

const infer_deftype = /*14702*/function name_14702(tenv$qu) { return /*14702*/function name_14702(bound) { return /*14702*/function name_14702(tname) { return /*14702*/function name_14702(tnl) { return /*14702*/function name_14702(targs) { return /*14702*/function name_14702(constructors) { return /*14702*/function name_14702(l) { return /*14709*/(function let_14709() {const $target = /*14713*//*14713*//*14714*/map/*<14714*/(/*14713*//*14715*/constructors/*<14715*/)/*<14713*/(/*14713*//*14716*/function name_14716($fn_arg) { return /*14716*/(function match_14716($target) {
if ($target.type === ",,,") {
{
let name = $target[0];
return /*14725*/name/*<14725*/
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 14716');})(/*!*//*-1*/$fn_arg/*<-1*/)/*<14716*/ }/*<14716*/)/*<14713*/;
{
let names = $target;
return /*14709*/(function let_14709() {const $target = /*14727*//*14727*//*14727*//*14728*/foldl/*<14728*/(/*14727*//*14729*//*14729*//*14730*/tcon/*<14730*/(/*14729*//*14731*/tname/*<14731*/)/*<14729*/(/*14729*//*14732*/tnl/*<14732*/)/*<14729*/)/*<14727*/(/*14727*//*14733*/targs/*<14733*/)/*<14727*/(/*14727*//*14734*/function name_14734(body) { return /*14734*/function name_14734($fn_arg) { return /*14734*/(function match_14734($target) {
if ($target.type === ",") {
{
let arg = $target[0];
{
let al = $target[1];
return /*14742*//*14742*//*14742*//*14743*/tapp/*<14743*/(/*14742*//*14744*/body/*<14744*/)/*<14742*/(/*14742*//*14745*//*14745*//*14746*/tvar/*<14746*/(/*14745*//*14747*/arg/*<14747*/)/*<14745*/(/*14745*//*14748*/al/*<14748*/)/*<14745*/)/*<14742*/(/*14742*//*14749*/l/*<14749*/)/*<14742*/
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 14734');})(/*!*//*-1*/$fn_arg/*<-1*/)/*<14734*/ }/*<14734*/ }/*<14734*/)/*<14727*/;
{
let final = $target;
return /*14709*/(function let_14709() {const $target = /*14751*//*14751*//*14751*//*14752*/foldl/*<14752*/(/*14751*//*14753*/set$slnil/*<14753*/)/*<14751*/(/*14751*//*14754*/targs/*<14754*/)/*<14751*/(/*14751*//*14755*/function name_14755(free) { return /*14755*/function name_14755($fn_arg) { return /*14755*/(function match_14755($target) {
if ($target.type === ",") {
{
let arg = $target[0];
return /*14763*//*14763*//*14764*/set$sladd/*<14764*/(/*14763*//*14765*/free/*<14765*/)/*<14763*/(/*14763*//*14766*/arg/*<14766*/)/*<14763*/
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 14755');})(/*!*//*-1*/$fn_arg/*<-1*/)/*<14755*/ }/*<14755*/ }/*<14755*/)/*<14751*/;
{
let free_set = $target;
return /*14709*/(function let_14709() {const $target = /*14771*//*14771*//*14771*//*14772*/foldl/*<14772*/(/*14771*//*14773*//*14773*//*14774*/$co/*<14774*/(/*14773*//*14775*/map$slnil/*<14775*/)/*<14773*/(/*14773*//*14776*/map$slnil/*<14776*/)/*<14773*/)/*<14771*/(/*14771*//*14777*/constructors/*<14777*/)/*<14771*/(/*14771*//*14778*/function name_14778($fn_arg) { return /*14778*/(function match_14778($target) {
if ($target.type === ",") {
{
let values = $target[0];
{
let cons = $target[1];
return /*14778*/function name_14778($fn_arg) { return /*14778*/(function match_14778($target) {
if ($target.type === ",,,") {
{
let name = $target[0];
{
let nl = $target[1];
{
let args = $target[2];
{
let l = $target[3];
return /*14791*/(function let_14791() {const $target = /*14795*//*14795*//*14796*/map/*<14796*/(/*14795*//*14797*/args/*<14797*/)/*<14795*/(/*14795*//*14798*/function name_14798(arg) { return /*14802*//*14802*//*14803*/type_with_free/*<14803*/(/*14802*//*14804*/arg/*<14804*/)/*<14802*/(/*14802*//*14805*/free_set/*<14805*/)/*<14802*/ }/*<14798*/)/*<14795*/;
{
let args = $target;
return /*14791*/(function let_14791() {const $target = /*14807*//*14807*//*14808*/map/*<14808*/(/*14807*//*14809*/args/*<14809*/)/*<14807*/(/*14807*//*14810*//*14811*/subst_aliases/*<14811*/(/*14810*//*14812*//*14813*/tenv$slalias/*<14813*/(/*14812*//*14814*/tenv$qu/*<14814*/)/*<14812*/)/*<14810*/)/*<14807*/;
{
let args = $target;
return /*14791*/(function let_14791() {const $target = /*13348*//*13348*//*13349*/map/*<13349*/(/*13348*//*13350*/args/*<13350*/)/*<13348*/(/*13348*//*13351*/function name_13351(arg) { return /*14883*/(function match_14883($target) {
if ($target.type === "nil") {
return /*14895*/true/*<14895*/
}
{
let names = $target;
return /*14897*//*14898*/fatal/*<14898*/(/*14897*//*14899*/`Unbound types (in deftype ${/*14970*/tname/*<14970*/}) ${/*14901*//*14901*//*14903*/join/*<14903*/(/*14901*//*14904*/", "/*<14904*/)/*<14901*/(/*14901*//*14906*//*14906*//*14907*/map/*<14907*/(/*14906*//*14908*/names/*<14908*/)/*<14906*/(/*14906*//*14909*/function name_14909($fn_arg) { return /*14909*/(function match_14909($target) {
if ($target.type === ",,") {
{
let name = $target[0];
return /*14917*/name/*<14917*/
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 14909');})(/*!*//*-1*/$fn_arg/*<-1*/)/*<14909*/ }/*<14909*/)/*<14906*/)/*<14901*/}`/*<14899*/)/*<14897*/
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 14883');})(/*!*//*14889*//*14890*/bag$slto_list/*<14890*/(/*14889*//*14885*//*14885*//*14886*/externals_type/*<14886*/(/*14885*//*14891*//*14891*//*14887*/set$sladd/*<14887*/(/*14891*//*14892*/bound/*<14892*/)/*<14891*/(/*14891*//*14893*/tname/*<14893*/)/*<14891*/)/*<14885*/(/*14885*//*14888*/arg/*<14888*/)/*<14885*/)/*<14889*/)/*<14883*/ }/*<13351*/)/*<13348*/;
return /*14817*//*14817*//*14818*/$co/*<14818*/(/*14817*//*14819*//*14819*//*14819*//*14820*/map$slset/*<14820*/(/*14819*//*14821*/values/*<14821*/)/*<14819*/(/*14819*//*14822*/name/*<14822*/)/*<14819*/(/*14819*//*14823*//*14823*//*14824*/scheme/*<14824*/(/*14823*//*14825*/free_set/*<14825*/)/*<14823*/(/*14823*//*14826*//*14826*//*14826*//*14827*/foldr/*<14827*/(/*14826*//*14828*/final/*<14828*/)/*<14826*/(/*14826*//*14829*/args/*<14829*/)/*<14826*/(/*14826*//*14830*/function name_14830(body) { return /*14830*/function name_14830(arg) { return /*14835*//*14835*//*14835*//*14836*/tfn/*<14836*/(/*14835*//*14837*/arg/*<14837*/)/*<14835*/(/*14835*//*14838*/body/*<14838*/)/*<14835*/(/*14835*//*14839*/l/*<14839*/)/*<14835*/ }/*<14830*/ }/*<14830*/)/*<14826*/)/*<14823*/)/*<14819*/)/*<14817*/(/*14817*//*14840*//*14840*//*14840*//*14841*/map$slset/*<14841*/(/*14840*//*14842*/cons/*<14842*/)/*<14840*/(/*14840*//*14843*/name/*<14843*/)/*<14840*/(/*14840*//*14844*//*14844*//*14844*//*14845*/tconstructor/*<14845*/(/*14844*//*14846*/free_set/*<14846*/)/*<14844*/(/*14844*//*14847*/args/*<14847*/)/*<14844*/(/*14844*//*14848*/final/*<14848*/)/*<14844*/)/*<14840*/)/*<14817*/;
throw new Error('let pattern not matched 13347. ' + valueToString($target));})(/*!*/)/*<14791*/
};
throw new Error('let pattern not matched 14806. ' + valueToString($target));})(/*!*/)/*<14791*/
};
throw new Error('let pattern not matched 14794. ' + valueToString($target));})(/*!*/)/*<14791*/
}
}
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 14778');})(/*!*//*-1*/$fn_arg/*<-1*/)/*<14778*/ }/*<14778*/
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 14778');})(/*!*//*-1*/$fn_arg/*<-1*/)/*<14778*/ }/*<14778*/)/*<14771*/;
if ($target.type === ",") {
{
let values = $target[0];
{
let cons = $target[1];
return /*14849*//*14849*//*14849*//*14849*//*14850*/tenv/*<14850*/(/*14849*//*14851*/values/*<14851*/)/*<14849*/(/*14849*//*14852*/cons/*<14852*/)/*<14849*/(/*14849*//*14853*//*14853*//*14853*//*14854*/map$slset/*<14854*/(/*14853*//*14855*/map$slnil/*<14855*/)/*<14853*/(/*14853*//*14856*/tname/*<14856*/)/*<14853*/(/*14853*//*14857*//*14857*//*14858*/$co/*<14858*/(/*14857*//*14859*//*14860*/len/*<14860*/(/*14859*//*14861*/targs/*<14861*/)/*<14859*/)/*<14857*/(/*14857*//*14862*//*14863*/set$slfrom_list/*<14863*/(/*14862*//*14864*/names/*<14864*/)/*<14862*/)/*<14857*/)/*<14853*/)/*<14849*/(/*14849*//*14865*/map$slnil/*<14865*/)/*<14849*/
}
}
};
throw new Error('let pattern not matched 14767. ' + valueToString($target));})(/*!*/)/*<14709*/
};
throw new Error('let pattern not matched 14750. ' + valueToString($target));})(/*!*/)/*<14709*/
};
throw new Error('let pattern not matched 14726. ' + valueToString($target));})(/*!*/)/*<14709*/
};
throw new Error('let pattern not matched 14712. ' + valueToString($target));})(/*!*/)/*<14709*/ }/*<14702*/ }/*<14702*/ }/*<14702*/ }/*<14702*/ }/*<14702*/ }/*<14702*/ }/*<14702*/;

const externals_list = /*11809*/function name_11809(x) { return /*11815*//*11816*/bag$slto_list/*<11816*/(/*11815*//*11806*//*11806*//*11807*/externals/*<11807*/(/*11806*//*11808*/set$slnil/*<11808*/)/*<11806*/(/*11806*//*11813*/x/*<11813*/)/*<11806*/)/*<11815*/ }/*<11809*/;

const vars_for_names = /*15643*/function name_15643(names) { return /*15643*/function name_15643(nidx) { return /*15643*/function name_15643(tenv) { return /*15474*//*15474*//*15474*//*15475*/foldr/*<15475*/(/*15474*//*15476*//*15476*//*15476*//*15477*/$co$co/*<15477*/(/*15476*//*15479*/tenv/*<15479*/)/*<15476*/(/*15476*//*15480*/nil/*<15480*/)/*<15476*/(/*15476*//*15481*/nidx/*<15481*/)/*<15476*/)/*<15474*/(/*15474*//*15482*/names/*<15482*/)/*<15474*/(/*15474*//*15483*/function name_15483($fn_arg) { return /*15483*/(function match_15483($target) {
if ($target.type === ",,") {
{
let tenv = $target[0];
{
let vars = $target[1];
{
let nidx = $target[2];
return /*15483*/function name_15483($fn_arg) { return /*15483*/(function match_15483($target) {
if ($target.type === ",") {
{
let name = $target[0];
{
let loc = $target[1];
return /*15495*/(function let_15495() {const $target = /*15503*//*15503*//*15503*//*15504*/new_type_var/*<15504*/(/*15503*//*15505*/name/*<15505*/)/*<15503*/(/*15503*//*15506*/nidx/*<15506*/)/*<15503*/(/*15503*//*15507*/loc/*<15507*/)/*<15503*/;
if ($target.type === ",") {
{
let self = $target[0];
{
let nidx = $target[1];
return /*15508*//*15508*//*15508*//*15509*/$co$co/*<15509*/(/*15508*//*15528*//*15528*//*15528*//*15511*/tenv$slset_type/*<15511*/(/*15528*//*15512*/tenv/*<15512*/)/*<15528*/(/*15528*//*15513*/name/*<15513*/)/*<15528*/(/*15528*//*15514*//*15514*//*15515*/scheme/*<15515*/(/*15514*//*15516*/set$slnil/*<15516*/)/*<15514*/(/*15514*//*15517*/self/*<15517*/)/*<15514*/)/*<15528*/)/*<15508*/(/*15508*//*15518*//*15518*//*15518*/cons/*<15518*/(/*15518*//*15519*/self/*<15519*/)/*<15518*/(/*15518*//*15520*/vars/*<15520*/)/*<15518*/)/*<15508*/(/*15508*//*15527*/nidx/*<15527*/)/*<15508*/
}
}
};
throw new Error('let pattern not matched 15498. ' + valueToString($target));})(/*!*/)/*<15495*/
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 15483');})(/*!*//*-1*/$fn_arg/*<-1*/)/*<15483*/ }/*<15483*/
}
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 15483');})(/*!*//*-1*/$fn_arg/*<-1*/)/*<15483*/ }/*<15483*/)/*<15474*/ }/*<15643*/ }/*<15643*/ }/*<15643*/;

const report_missing = /*15678*/function name_15678(subst) { return /*15678*/function name_15678($fn_arg) { return /*15678*/(function match_15678($target) {
if ($target.type === ",") {
{
let missing = $target[0];
{
let missing_vars = $target[1];
return /*15854*/(function match_15854($target) {
if ($target.type === "nil") {
return /*15859*/0/*<15859*/
}
{
let vars = $target;
return /*16025*/(function let_16025() {const $target = /*16032*//*16032*//*16032*//*16033*/foldl/*<16033*/(/*16032*//*16034*//*16034*//*16035*/$co/*<16035*/(/*16034*//*16036*/nil/*<16036*/)/*<16034*/(/*16034*//*16085*//*16085*//*16086*/$co/*<16086*/(/*16085*//*16080*//*16037*/some/*<16037*/(/*16080*//*16081*/map$slnil/*<16081*/)/*<16080*/)/*<16085*/(/*16085*//*16088*/0/*<16088*/)/*<16085*/)/*<16034*/)/*<16032*/(/*16032*//*16038*//*16038*//*16039*/map/*<16039*/(/*16038*//*16040*/missing_vars/*<16040*/)/*<16038*/(/*16038*//*16041*//*16042*/type_apply/*<16042*/(/*16041*//*16043*/subst/*<16043*/)/*<16041*/)/*<16038*/)/*<16032*/(/*16032*//*16045*/function name_16045($fn_arg) { return /*16045*/(function match_16045($target) {
if ($target.type === ",") {
{
let result = $target[0];
{
let maps = $target[1];
return /*16045*/function name_16045(t) { return /*16053*/(function let_16053() {const $target = /*16060*//*16060*//*16060*//*16061*/tts_inner/*<16061*/(/*16060*//*16062*/t/*<16062*/)/*<16060*/(/*16060*//*16063*/maps/*<16063*/)/*<16060*/(/*16060*//*16069*/false/*<16069*/)/*<16060*/;
if ($target.type === ",") {
{
let text = $target[0];
{
let maps = $target[1];
return /*16070*//*16070*//*16071*/$co/*<16071*/(/*16070*//*16072*//*16072*//*16072*/cons/*<16072*/(/*16072*//*16073*/text/*<16073*/)/*<16072*/(/*16072*//*16074*/result/*<16074*/)/*<16072*/)/*<16070*/(/*16070*//*16078*/maps/*<16078*/)/*<16070*/
}
}
};
throw new Error('let pattern not matched 16056. ' + valueToString($target));})(/*!*/)/*<16053*/ }/*<16045*/
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 16045');})(/*!*//*-1*/$fn_arg/*<-1*/)/*<16045*/ }/*<16045*/)/*<16032*/;
if ($target.type === ",") {
{
let text = $target[0];
return /*15545*//*15546*/fatal/*<15546*/(/*15545*//*15547*/`Missing variables\n - ${/*15549*//*15549*//*15551*/join/*<15551*/(/*15549*//*15552*/"\n - "/*<15552*/)/*<15549*/(/*15549*//*15579*//*15579*//*15580*/map/*<15580*/(/*15579*//*15582*//*15582*//*15583*/zip/*<15583*/(/*15582*//*15584*/missing/*<15584*/)/*<15582*/(/*15582*//*16206*//*16206*//*15575*/rev/*<15575*/(/*16206*//*16207*/text/*<16207*/)/*<16206*/(/*16206*//*16208*/nil/*<16208*/)/*<16206*/)/*<15582*/)/*<15579*/(/*15579*//*15585*/function name_15585($fn_arg) { return /*15585*/(function match_15585($target) {
if ($target.type === ",") {
if ($target[0].type === ",") {
{
let name = $target[0][0];
{
let loc = $target[0][1];
{
let type = $target[1];
return /*15595*/`${/*15597*/name/*<15597*/} (${/*15599*//*15601*/int_to_string/*<15601*/(/*15599*//*15602*/loc/*<15602*/)/*<15599*/}) : inferred as ${/*15603*/type/*<15603*/}`/*<15595*/
}
}
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 15585');})(/*!*//*-1*/$fn_arg/*<-1*/)/*<15585*/ }/*<15585*/)/*<15579*/)/*<15549*/}`/*<15547*/)/*<15545*/
}
};
throw new Error('let pattern not matched 16029. ' + valueToString($target));})(/*!*/)/*<16025*/
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 15854');})(/*!*//*15857*/missing_vars/*<15857*/)/*<15854*/
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 15678');})(/*!*//*-1*/$fn_arg/*<-1*/)/*<15678*/ }/*<15678*/ }/*<15678*/;

const externals_defs = /*15846*/function name_15846(stmts) { return /*15727*//*15727*//*15727*//*15728*/foldr/*<15728*/(/*15727*//*15729*/empty/*<15729*/)/*<15727*/(/*15727*//*15730*//*15730*//*15731*/map/*<15731*/(/*15730*//*15732*/stmts/*<15732*/)/*<15730*/(/*15730*//*15733*/function name_15733($fn_arg) { return /*15733*/(function match_15733($target) {
if ($target.type === "sdef") {
{
let body = $target[2];
return /*15742*//*15742*//*15743*/externals/*<15743*/(/*15742*//*15744*/set$slnil/*<15744*/)/*<15742*/(/*15742*//*15745*/body/*<15745*/)/*<15742*/
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 15733');})(/*!*//*-1*/$fn_arg/*<-1*/)/*<15733*/ }/*<15733*/)/*<15730*/)/*<15727*/(/*15727*//*15746*/bag$sland/*<15746*/)/*<15727*/ }/*<15846*/;

const find_missing = /*15911*/function name_15911(tenv) { return /*15911*/function name_15911(nidx) { return /*15911*/function name_15911(externals) { return /*15919*/(function let_15919() {const $target = /*15923*//*15923*//*15924*/find_missing_names/*<15924*/(/*15923*//*15925*//*15926*/tenv$slvalues/*<15926*/(/*15925*//*15927*/tenv/*<15927*/)/*<15925*/)/*<15923*/(/*15923*//*15928*/externals/*<15928*/)/*<15923*/;
{
let missing_names = $target;
return /*15919*/(function let_15919() {const $target = /*15937*//*15937*//*15937*//*15938*/vars_for_names/*<15938*/(/*15937*//*15939*/missing_names/*<15939*/)/*<15937*/(/*15937*//*15940*/nidx/*<15940*/)/*<15937*/(/*15937*//*15941*/tenv/*<15941*/)/*<15937*/;
if ($target.type === ",,") {
{
let tenv = $target[0];
{
let missing_vars = $target[1];
{
let nidx = $target[2];
return /*15942*//*15942*//*15942*//*15943*/$co$co/*<15943*/(/*15942*//*15944*/tenv/*<15944*/)/*<15942*/(/*15942*//*15946*//*15946*//*15947*/$co/*<15947*/(/*15946*//*15948*/missing_names/*<15948*/)/*<15946*/(/*15946*//*15949*/missing_vars/*<15949*/)/*<15946*/)/*<15942*/(/*15942*//*15950*/nidx/*<15950*/)/*<15942*/
}
}
}
};
throw new Error('let pattern not matched 15932. ' + valueToString($target));})(/*!*/)/*<15919*/
};
throw new Error('let pattern not matched 15922. ' + valueToString($target));})(/*!*/)/*<15919*/ }/*<15911*/ }/*<15911*/ }/*<15911*/;

const compose_subst = /*956*/function name_956(place) { return /*956*/function name_956(new_subst) { return /*956*/function name_956(old_subst) { return /*12160*/(function match_12160($target) {
if ($target.type === "some") {
{
let message = $target[0];
return /*12136*//*12156*/fatal/*<12156*/(/*12136*//*12157*/message/*<12157*/)/*<12136*/
}
}
return /*963*//*963*//*964*/map$slmerge/*<964*/(/*963*//*965*//*965*//*966*/map$slmap/*<966*/(/*965*//*967*//*968*/type_apply/*<968*/(/*967*//*969*/new_subst/*<969*/)/*<967*/)/*<965*/(/*965*//*970*/old_subst/*<970*/)/*<965*/)/*<963*/(/*963*//*971*/new_subst/*<971*/)/*<963*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 12160');})(/*!*//*12514*//*12514*//*12514*//*12515*/check_invariant/*<12515*/(/*12514*//*12516*/place/*<12516*/)/*<12514*/(/*12514*//*12517*/new_subst/*<12517*/)/*<12514*/(/*12514*//*12518*/old_subst/*<12518*/)/*<12514*/)/*<12160*/ }/*<956*/ }/*<956*/ }/*<956*/;

const make_subst_for_vars = /*1212*/function name_1212(vars) { return /*1212*/function name_1212(coll) { return /*1212*/function name_1212(nidx) { return /*1212*/function name_1212(l) { return /*1219*/(function match_1219($target) {
if ($target.type === "nil") {
return /*1223*//*1223*//*1224*/$co/*<1224*/(/*1223*//*1225*/coll/*<1225*/)/*<1223*/(/*1223*//*1226*/nidx/*<1226*/)/*<1223*/
}
if ($target.type === "cons") {
{
let v = $target[0];
{
let rest = $target[1];
return /*1748*/(function let_1748() {const $target = /*1755*//*1755*//*1755*//*1756*/new_type_var/*<1756*/(/*1755*//*1757*/v/*<1757*/)/*<1755*/(/*1755*//*1758*/nidx/*<1758*/)/*<1755*/(/*1755*//*10933*/l/*<10933*/)/*<1755*/;
if ($target.type === ",") {
{
let vn = $target[0];
{
let nidx = $target[1];
return /*1262*//*1262*//*1262*//*1262*//*1264*/make_subst_for_vars/*<1264*/(/*1262*//*1269*/rest/*<1269*/)/*<1262*/(/*1262*//*1270*//*1270*//*1270*//*1271*/map$slset/*<1271*/(/*1270*//*1272*/coll/*<1272*/)/*<1270*/(/*1270*//*1273*/v/*<1273*/)/*<1270*/(/*1270*//*1274*/vn/*<1274*/)/*<1270*/)/*<1262*/(/*1262*//*1293*/nidx/*<1293*/)/*<1262*/(/*1262*//*10946*/l/*<10946*/)/*<1262*/
}
}
};
throw new Error('let pattern not matched 1751. ' + valueToString($target));})(/*!*/)/*<1748*/
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 1219');})(/*!*//*1221*/vars/*<1221*/)/*<1219*/ }/*<1212*/ }/*<1212*/ }/*<1212*/ }/*<1212*/;

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
return /*14134*/(function let_14134() {const $target = /*14138*//*14139*/set$slfrom_list/*<14139*/(/*14138*//*14143*//*14143*//*14140*/map/*<14140*/(/*14143*//*14144*/free/*<14144*/)/*<14143*/(/*14143*//*14145*/fst/*<14145*/)/*<14143*/)/*<14138*/;
{
let frees = $target;
return /*14068*//*14069*/many/*<14069*/(/*14068*//*7332*//*7332*//*14051*/map/*<14051*/(/*7332*//*14053*/constructors/*<14053*/)/*<7332*/(/*7332*//*14054*/function name_14054($fn_arg) { return /*14054*/(function match_14054($target) {
if ($target.type === ",,,") {
{
let name = $target[0];
{
let l = $target[1];
{
let args = $target[2];
return /*14067*/(function match_14067($target) {
if ($target.type === "nil") {
return /*14073*/empty/*<14073*/
}
return /*14075*//*14076*/many/*<14076*/(/*14075*//*14077*//*14077*//*14078*/map/*<14078*/(/*14077*//*14079*/args/*<14079*/)/*<14077*/(/*14077*//*14080*//*14132*/externals_type/*<14132*/(/*14080*//*14133*/frees/*<14133*/)/*<14080*/)/*<14077*/)/*<14075*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 14067');})(/*!*//*14071*/args/*<14071*/)/*<14067*/
}
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 14054');})(/*!*//*-1*/$fn_arg/*<-1*/)/*<14054*/ }/*<14054*/)/*<7332*/)/*<14068*/
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
return /*13222*/(function let_13222() {const $target = /*14161*//*14162*/set$slfrom_list/*<14162*/(/*14161*//*14163*//*14163*//*14164*/map/*<14164*/(/*14163*//*14165*/args/*<14165*/)/*<14163*/(/*14163*//*14166*/fst/*<14166*/)/*<14163*/)/*<14161*/;
{
let frees = $target;
return /*14167*//*14167*//*14172*/externals_type/*<14172*/(/*14167*//*14173*/frees/*<14173*/)/*<14167*/(/*14167*//*14174*/body/*<14174*/)/*<14167*/
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

const infer_stypes = /*14336*/function name_14336(tenv$qu) { return /*14336*/function name_14336(stypes) { return /*14336*/function name_14336(salias) { return /*14343*/(function let_14343() {const $target = /*14368*//*14368*//*14368*//*14369*/foldl/*<14369*/(/*14368*//*14370*//*14370*//*14371*/map/*<14371*/(/*14370*//*14372*/salias/*<14372*/)/*<14370*/(/*14370*//*14373*/function name_14373($fn_arg) { return /*14373*/(function match_14373($target) {
if ($target.type === ",,") {
{
let name = $target[0];
return /*14381*/name/*<14381*/
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 14373');})(/*!*//*-1*/$fn_arg/*<-1*/)/*<14373*/ }/*<14373*/)/*<14370*/)/*<14368*/(/*14368*//*14382*/stypes/*<14382*/)/*<14368*/(/*14368*//*14383*/function name_14383(names) { return /*14383*/function name_14383($fn_arg) { return /*14383*/(function match_14383($target) {
if ($target.type === "sdeftype") {
{
let name = $target[0];
return /*14395*//*14395*//*14395*/cons/*<14395*/(/*14395*//*14393*/name/*<14393*/)/*<14395*/(/*14395*//*14396*/names/*<14396*/)/*<14395*/
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 14383');})(/*!*//*-1*/$fn_arg/*<-1*/)/*<14383*/ }/*<14383*/ }/*<14383*/)/*<14368*/;
{
let names = $target;
return /*14343*/(function let_14343() {const $target = /*14545*/tenv$qu/*<14545*/;
if ($target.type === "tenv") {
{
let types = $target[2];
{
let aliases = $target[3];
return /*14343*/(function let_14343() {const $target = /*14571*//*14571*//*14572*/set$slmerge/*<14572*/(/*14571*//*14573*//*14574*/set$slfrom_list/*<14574*/(/*14573*//*14575*//*14576*/map$slkeys/*<14576*/(/*14575*//*14577*/types/*<14577*/)/*<14575*/)/*<14573*/)/*<14571*/(/*14571*//*14540*//*14540*//*14541*/set$slmerge/*<14541*/(/*14540*//*14535*//*14536*/set$slfrom_list/*<14536*/(/*14535*//*14537*/names/*<14537*/)/*<14535*/)/*<14540*/(/*14540*//*14561*//*14562*/set$slfrom_list/*<14562*/(/*14561*//*14563*//*14564*/map$slkeys/*<14564*/(/*14563*//*14565*/aliases/*<14565*/)/*<14563*/)/*<14561*/)/*<14540*/)/*<14571*/;
{
let bound = $target;
return /*14343*/(function let_14343() {const $target = /*14402*//*14402*//*14402*//*14403*/foldl/*<14403*/(/*14402*//*14404*/tenv$slnil/*<14404*/)/*<14402*/(/*14402*//*14405*/salias/*<14405*/)/*<14402*/(/*14402*//*14406*/function name_14406(tenv) { return /*14406*/function name_14406($fn_arg) { return /*14406*/(function match_14406($target) {
if ($target.type === ",,") {
{
let name = $target[0];
{
let args = $target[1];
{
let body = $target[2];
return /*14529*/(function match_14529($target) {
if ($target.type === "nil") {
return /*14417*//*14417*//*14417*//*14451*/tenv$sladd_alias/*<14451*/(/*14417*//*14452*/tenv/*<14452*/)/*<14417*/(/*14417*//*14453*/name/*<14453*/)/*<14417*/(/*14417*//*14454*//*14454*//*14455*/$co/*<14455*/(/*14454*//*14458*//*14458*//*14456*/map/*<14456*/(/*14458*//*14461*/args/*<14461*/)/*<14458*/(/*14458*//*14462*/fst/*<14462*/)/*<14458*/)/*<14454*/(/*14454*//*14457*/body/*<14457*/)/*<14454*/)/*<14417*/
}
{
let names = $target;
return /*14579*//*14580*/fatal/*<14580*/(/*14579*//*14581*/`Unbound types ${/*14583*//*14583*//*14585*/join/*<14585*/(/*14583*//*14586*/", "/*<14586*/)/*<14583*/(/*14583*//*14589*//*14589*//*14588*/map/*<14588*/(/*14589*//*14590*/names/*<14590*/)/*<14589*/(/*14589*//*14591*/function name_14591($fn_arg) { return /*14591*/(function match_14591($target) {
if ($target.type === ",,") {
{
let name = $target[0];
return /*14599*/name/*<14599*/
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 14591');})(/*!*//*-1*/$fn_arg/*<-1*/)/*<14591*/ }/*<14591*/)/*<14589*/)/*<14583*/}`/*<14581*/)/*<14579*/
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 14529');})(/*!*//*14566*//*14567*/bag$slto_list/*<14567*/(/*14566*//*14533*//*14533*//*14553*/externals_type/*<14553*/(/*14533*//*14556*//*14556*//*14554*/set$slmerge/*<14554*/(/*14556*//*14557*/bound/*<14557*/)/*<14556*/(/*14556*//*14558*//*14559*/set$slfrom_list/*<14559*/(/*14558*//*14568*//*14568*//*14560*/map/*<14560*/(/*14568*//*14569*/args/*<14569*/)/*<14568*/(/*14568*//*14570*/fst/*<14570*/)/*<14568*/)/*<14558*/)/*<14556*/)/*<14533*/(/*14533*//*14555*/body/*<14555*/)/*<14533*/)/*<14566*/)/*<14529*/
}
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 14406');})(/*!*//*-1*/$fn_arg/*<-1*/)/*<14406*/ }/*<14406*/ }/*<14406*/)/*<14402*/;
{
let tenv = $target;
return /*14343*/(function let_14343() {const $target = /*15053*//*15053*//*15054*/tenv$slmerge/*<15054*/(/*15053*//*15055*/tenv/*<15055*/)/*<15053*/(/*15053*//*15056*/tenv$qu/*<15056*/)/*<15053*/;
{
let merged = $target;
return /*14343*/(function let_14343() {const $target = /*14921*//*14921*//*14921*//*14922*/foldl/*<14922*/(/*14921*//*14923*/tenv/*<14923*/)/*<14921*/(/*14921*//*14924*/stypes/*<14924*/)/*<14921*/(/*14921*//*14925*/function name_14925(tenv) { return /*14925*/function name_14925($fn_arg) { return /*14925*/(function match_14925($target) {
if ($target.type === "sdeftype") {
{
let name = $target[0];
{
let tnl = $target[1];
{
let args = $target[2];
{
let constructors = $target[3];
{
let l = $target[4];
return /*15057*//*15057*//*15058*/tenv$slmerge/*<15058*/(/*15057*//*14938*//*14938*//*14938*//*14938*//*14938*//*14938*//*14938*//*14939*/infer_deftype/*<14939*/(/*14938*//*14940*/merged/*<14940*/)/*<14938*/(/*14938*//*14941*/bound/*<14941*/)/*<14938*/(/*14938*//*14942*/name/*<14942*/)/*<14938*/(/*14938*//*14943*/tnl/*<14943*/)/*<14938*/(/*14938*//*14944*/args/*<14944*/)/*<14938*/(/*14938*//*14945*/constructors/*<14945*/)/*<14938*/(/*14938*//*14946*/l/*<14946*/)/*<14938*/)/*<15057*/(/*15057*//*15060*/tenv/*<15060*/)/*<15057*/
}
}
}
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 14925');})(/*!*//*-1*/$fn_arg/*<-1*/)/*<14925*/ }/*<14925*/ }/*<14925*/)/*<14921*/;
{
let tenv = $target;
return /*14343*/(function let_14343() {const $target = /*14698*//*14698*//*14699*/tenv$slmerge/*<14699*/(/*14698*//*14700*/tenv/*<14700*/)/*<14698*/(/*14698*//*14701*/tenv$qu/*<14701*/)/*<14698*/;
{
let tenv$qu = $target;
return /*14400*/tenv/*<14400*/
};
throw new Error('let pattern not matched 14697. ' + valueToString($target));})(/*!*/)/*<14343*/
};
throw new Error('let pattern not matched 14920. ' + valueToString($target));})(/*!*/)/*<14343*/
};
throw new Error('let pattern not matched 15052. ' + valueToString($target));})(/*!*/)/*<14343*/
};
throw new Error('let pattern not matched 14401. ' + valueToString($target));})(/*!*/)/*<14343*/
};
throw new Error('let pattern not matched 14534. ' + valueToString($target));})(/*!*/)/*<14343*/
}
}
};
throw new Error('let pattern not matched 14544. ' + valueToString($target));})(/*!*/)/*<14343*/
};
throw new Error('let pattern not matched 14367. ' + valueToString($target));})(/*!*/)/*<14343*/ }/*<14336*/ }/*<14336*/ }/*<14336*/;

const unify_inner = /*1309*/function name_1309(t1) { return /*1309*/function name_1309(t2) { return /*1309*/function name_1309(nidx) { return /*1309*/function name_1309(l) { return /*1317*/(function match_1317($target) {
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
return /*1326*/(function let_1326() {const $target = /*1481*//*1481*//*1481*//*1481*//*1482*/unify/*<1482*/(/*1481*//*1483*/target_1/*<1483*/)/*<1481*/(/*1481*//*1484*/target_2/*<1484*/)/*<1481*/(/*1481*//*1499*/nidx/*<1499*/)/*<1481*/(/*1481*//*11554*/l/*<11554*/)/*<1481*/;
if ($target.type === ",") {
{
let target_subst = $target[0];
{
let nidx = $target[1];
return /*1326*/(function let_1326() {const $target = /*1489*//*1489*//*1489*//*1489*//*1490*/unify/*<1490*/(/*1489*//*1491*//*1491*//*1492*/type_apply/*<1492*/(/*1491*//*1493*/target_subst/*<1493*/)/*<1491*/(/*1491*//*1494*/arg_1/*<1494*/)/*<1491*/)/*<1489*/(/*1489*//*1495*//*1495*//*1496*/type_apply/*<1496*/(/*1495*//*1497*/target_subst/*<1497*/)/*<1495*/(/*1495*//*1498*/arg_2/*<1498*/)/*<1495*/)/*<1489*/(/*1489*//*1500*/nidx/*<1500*/)/*<1489*/(/*1489*//*11555*/l/*<11555*/)/*<1489*/;
if ($target.type === ",") {
{
let arg_subst = $target[0];
{
let nidx = $target[1];
return /*1501*//*1501*//*1502*/$co/*<1502*/(/*1501*//*1503*//*1503*//*1503*//*1504*/compose_subst/*<1504*/(/*1503*//*12260*/"unify-tapp"/*<12260*/)/*<1503*/(/*1503*//*1506*/arg_subst/*<1506*/)/*<1503*/(/*1503*//*12262*/target_subst/*<12262*/)/*<1503*/)/*<1501*/(/*1501*//*1507*/nidx/*<1507*/)/*<1501*/
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
return /*1549*//*1550*/fatal/*<1550*/(/*1549*//*1551*/`cant unify ${/*3020*/a/*<3020*/} (${/*10498*//*3016*/its/*<3016*/(/*10498*//*10499*/la/*<10499*/)/*<10498*/}) and ${/*3022*/b/*<3022*/} (${/*10500*//*3018*/its/*<3018*/(/*10500*//*10501*/lb/*<10501*/)/*<10500*/})`/*<1551*/)/*<1549*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 1541');})(/*!*//*1544*//*1544*//*1545*/$eq/*<1545*/(/*1544*//*1546*/a/*<1546*/)/*<1544*/(/*1544*//*1547*/b/*<1547*/)/*<1544*/)/*<1541*/
}
}
}
}
}
}
}
return /*1554*//*1555*/fatal/*<1555*/(/*1554*//*1556*/`cant unify ${/*1558*//*1560*/type_to_string/*<1560*/(/*1558*//*1561*/t1/*<1561*/)/*<1558*/} (${/*10502*//*10503*/its/*<10503*/(/*10502*//*8799*//*8828*/type_loc/*<8828*/(/*8799*//*8829*/t1/*<8829*/)/*<8799*/)/*<10502*/}) and ${/*1562*//*1564*/type_to_string/*<1564*/(/*1562*//*1566*/t2/*<1566*/)/*<1562*/} (${/*10504*//*10505*/its/*<10505*/(/*10504*//*8801*//*8830*/type_loc/*<8830*/(/*8801*//*8831*/t2/*<8831*/)/*<8801*/)/*<10504*/})`/*<1556*/)/*<1554*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 1317');})(/*!*//*1319*//*1319*//*1320*/$co/*<1320*/(/*1319*//*1321*/t1/*<1321*/)/*<1319*/(/*1319*//*1322*/t2/*<1322*/)/*<1319*/)/*<1317*/ }/*<1309*/ }/*<1309*/ }/*<1309*/ }/*<1309*/;


const unify = /*12922*/function name_12922(t1) { return /*12922*/function name_12922(t2) { return /*12922*/function name_12922(nidx) { return /*12922*/function name_12922(l) { return /*13006*//*13006*//*13006*//*13006*//*13010*/unify_inner/*<13010*/(/*13006*//*13011*/t1/*<13011*/)/*<13006*/(/*13006*//*13013*/t2/*<13013*/)/*<13006*/(/*13006*//*13014*/nidx/*<13014*/)/*<13006*/(/*13006*//*13015*/l/*<13015*/)/*<13006*/ }/*<12922*/ }/*<12922*/ }/*<12922*/ }/*<12922*/;

const instantiate = /*1136*/function name_1136($fn_arg) { return /*1136*/(function match_1136($target) {
if ($target.type === "scheme") {
{
let vars = $target[0];
{
let t = $target[1];
return /*1136*/function name_1136(nidx) { return /*1136*/function name_1136(l) { return /*1211*/(function let_1211() {const $target = /*1290*//*1290*//*1290*//*1290*//*1291*/make_subst_for_vars/*<1291*/(/*1290*//*2036*//*2037*/set$slto_list/*<2037*/(/*2036*//*1298*/vars/*<1298*/)/*<2036*/)/*<1290*/(/*1290*//*1300*/map$slnil/*<1300*/)/*<1290*/(/*1290*//*1301*/nidx/*<1301*/)/*<1290*/(/*1290*//*10936*/l/*<10936*/)/*<1290*/;
if ($target.type === ",") {
{
let subst = $target[0];
{
let nidx = $target[1];
return /*1302*//*1302*//*1302*//*1303*/$co$co/*<1303*/(/*1302*//*1304*//*1304*//*1305*/type_apply/*<1305*/(/*1304*//*1306*/subst/*<1306*/)/*<1304*/(/*1304*//*1307*/t/*<1307*/)/*<1304*/)/*<1302*/(/*1302*//*3495*/subst/*<3495*/)/*<1302*/(/*1302*//*1308*/nidx/*<1308*/)/*<1302*/
}
}
};
throw new Error('let pattern not matched 1285. ' + valueToString($target));})(/*!*/)/*<1211*/ }/*<1136*/ }/*<1136*/
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 1136');})(/*!*//*-1*/$fn_arg/*<-1*/)/*<1136*/ }/*<1136*/;

const t_pat_inner = /*2466*/function name_2466(tenv) { return /*2466*/function name_2466(pat) { return /*2466*/function name_2466(nidx) { return /*2475*/(function match_2475($target) {
if ($target.type === "pany") {
{
let nl = $target[0];
return /*6412*/(function let_6412() {const $target = /*6405*//*6405*//*6405*//*6408*/new_type_var/*<6408*/(/*6405*//*6409*/"any"/*<6409*/)/*<6405*/(/*6405*//*6411*/nidx/*<6411*/)/*<6405*/(/*6405*//*10938*/nl/*<10938*/)/*<6405*/;
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
return /*3450*/(function let_3450() {const $target = /*2482*//*2482*//*2482*//*3403*/new_type_var/*<3403*/(/*2482*//*3404*/name/*<3404*/)/*<2482*/(/*2482*//*3405*/nidx/*<3405*/)/*<2482*/(/*2482*//*10939*/nl/*<10939*/)/*<2482*/;
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
return /*3479*/(function let_3479() {const $target = /*3502*//*3502*//*3502*//*3503*/instantiate/*<3503*/(/*3502*//*3504*//*3504*//*3505*/scheme/*<3505*/(/*3504*//*3506*/free/*<3506*/)/*<3504*/(/*3504*//*3507*/cres/*<3507*/)/*<3504*/)/*<3502*/(/*3502*//*3754*/nidx/*<3754*/)/*<3502*/(/*3502*//*10941*/l/*<10941*/)/*<3502*/;
if ($target.type === ",,") {
{
let tres = $target[0];
{
let tsubst = $target[1];
{
let nidx = $target[2];
return /*3479*/(function let_3479() {const $target = /*12912*//*12912*//*12913*/type$slset_loc/*<12913*/(/*12912*//*12914*/l/*<12914*/)/*<12912*/(/*12912*//*12915*/tres/*<12915*/)/*<12912*/;
{
let tres = $target;
return /*3479*/(function let_3479() {const $target = /*3509*//*3509*//*3510*/map/*<3510*/(/*3509*//*3511*/cargs/*<3511*/)/*<3509*/(/*3509*//*3512*//*3513*/type_apply/*<3513*/(/*3512*//*3514*/tsubst/*<3514*/)/*<3512*/)/*<3509*/;
{
let cargs = $target;
return /*3479*/(function let_3479() {const $target = /*3581*//*3581*//*3582*/zip/*<3582*/(/*3581*//*3583*/args/*<3583*/)/*<3581*/(/*3581*//*3584*/cargs/*<3584*/)/*<3581*/;
{
let zipped = $target;
return /*3479*/(function let_3479() {const $target = /*10323*/(function match_10323($target) {
if ($target === true) {
return /*10335*//*10336*/fatal/*<10336*/(/*10335*//*10337*/`Wrong number of arguments to constructor ${/*10339*/name/*<10339*/} (${/*10509*//*10375*/its/*<10375*/(/*10509*//*10510*/l/*<10510*/)/*<10509*/}): given ${/*10511*//*10512*/its/*<10512*/(/*10511*//*10343*//*10345*/len/*<10345*/(/*10343*//*10346*/args/*<10346*/)/*<10343*/)/*<10511*/}, but the type constructor has ${/*10514*//*10515*/its/*<10515*/(/*10514*//*10347*//*10349*/len/*<10349*/(/*10347*//*10350*/cargs/*<10350*/)/*<10347*/)/*<10514*/}`/*<10337*/)/*<10335*/
}
return /*10351*/0/*<10351*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 10323');})(/*!*//*10325*//*10325*//*10326*/$ex$eq/*<10326*/(/*10325*//*10327*//*10328*/len/*<10328*/(/*10327*//*10329*/args/*<10329*/)/*<10327*/)/*<10325*/(/*10325*//*10330*//*10333*/len/*<10333*/(/*10330*//*10334*/cargs/*<10334*/)/*<10330*/)/*<10325*/)/*<10323*/;
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
return /*3611*/(function let_3611() {const $target = /*3637*//*3637*//*3637*//*3637*//*3638*/unify/*<3638*/(/*3637*//*12539*//*12539*//*3639*/type_apply/*<3639*/(/*12539*//*12540*/subst/*<12540*/)/*<12539*/(/*12539*//*12541*/pat_type/*<12541*/)/*<12539*/)/*<3637*/(/*3637*//*12902*//*12902*//*3640*/type_apply/*<3640*/(/*12902*//*12903*/subst/*<12903*/)/*<12902*/(/*12902*//*12916*//*12916*//*12904*/type$slset_loc/*<12904*/(/*12916*//*12917*/l/*<12917*/)/*<12916*/(/*12916*//*12918*/carg/*<12918*/)/*<12916*/)/*<12902*/)/*<3637*/(/*3637*//*3755*/nidx/*<3755*/)/*<3637*/(/*3637*//*11562*/l/*<11562*/)/*<3637*/;
if ($target.type === ",") {
{
let unified_subst = $target[0];
{
let nidx = $target[1];
return /*3616*//*3616*//*3616*//*3629*/$co$co/*<3629*/(/*3616*//*3630*//*3630*//*3630*//*3631*/compose_subst/*<3631*/(/*3630*//*12256*/"t-pat"/*<12256*/)/*<3630*/(/*3630*//*3632*/unified_subst/*<3632*/)/*<3630*/(/*3630*//*3641*/subst/*<3641*/)/*<3630*/)/*<3616*/(/*3616*//*3642*//*3642*//*3778*/map$slmerge/*<3778*/(/*3642*//*3779*/bindings/*<3779*/)/*<3642*/(/*3642*//*3780*/pat_bind/*<3780*/)/*<3642*/)/*<3616*/(/*3616*//*3643*/nidx/*<3643*/)/*<3616*/
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
throw new Error('let pattern not matched 3585. ' + valueToString($target));})(/*!*/)/*<3479*/;
throw new Error('let pattern not matched 10322. ' + valueToString($target));})(/*!*/)/*<3479*/
};
throw new Error('let pattern not matched 3580. ' + valueToString($target));})(/*!*/)/*<3479*/
};
throw new Error('let pattern not matched 3508. ' + valueToString($target));})(/*!*/)/*<3479*/
};
throw new Error('let pattern not matched 12911. ' + valueToString($target));})(/*!*/)/*<3479*/
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


const t_pat = /*13122*/function name_13122(tenv) { return /*13122*/function name_13122(pat) { return /*13122*/function name_13122(nidx) { return /*13190*//*13190*//*13190*//*13191*/t_pat_inner/*<13191*/(/*13190*//*13192*/tenv/*<13192*/)/*<13190*/(/*13190*//*13193*/pat/*<13193*/)/*<13190*/(/*13190*//*13194*/nidx/*<13194*/)/*<13190*/ }/*<13122*/ }/*<13122*/ }/*<13122*/;

const t_expr_inner = /*1654*/function name_1654(tenv) { return /*1654*/function name_1654(expr) { return /*1654*/function name_1654(nidx) { return /*1664*/(function match_1664($target) {
if ($target.type === "evar") {
if ($target[0] === "()"){
{
let l = $target[1];
return /*11036*//*11036*//*11036*//*11037*/$co$co/*<11037*/(/*11036*//*11038*/map$slnil/*<11038*/)/*<11036*/(/*11036*//*11039*//*11039*//*11040*/tcon/*<11040*/(/*11039*//*11041*/"()"/*<11041*/)/*<11039*/(/*11039*//*11043*/l/*<11043*/)/*<11039*/)/*<11036*/(/*11036*//*11044*/nidx/*<11044*/)/*<11036*/
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
return /*1680*//*1681*/fatal/*<1681*/(/*1680*//*1682*/`Unbound variable ${/*1684*/name/*<1684*/} (${/*10518*//*6913*/its/*<6913*/(/*10518*//*10519*/l/*<10519*/)/*<10518*/})`/*<1682*/)/*<1680*/
}
if ($target.type === "some") {
{
let found = $target[0];
return /*1690*/(function let_1690() {const $target = /*1697*//*1697*//*1697*//*1698*/instantiate/*<1698*/(/*1697*//*1699*/found/*<1699*/)/*<1697*/(/*1697*//*1700*/nidx/*<1700*/)/*<1697*/(/*1697*//*10940*/l/*<10940*/)/*<1697*/;
if ($target.type === ",,") {
{
let t = $target[0];
{
let nidx = $target[2];
return /*1701*//*1701*//*1701*//*1702*/$co$co/*<1702*/(/*1701*//*1704*/map$slnil/*<1704*/)/*<1701*/(/*1701*//*12908*//*12908*//*1705*/type$slset_loc/*<1705*/(/*12908*//*12909*/l/*<12909*/)/*<12908*/(/*12908*//*12910*/t/*<12910*/)/*<12908*/)/*<1701*/(/*1701*//*1706*/nidx/*<1706*/)/*<1701*/
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
return /*5832*//*5832*//*5832*//*5833*/$co$co/*<5833*/(/*5832*//*5835*/map$slnil/*<5835*/)/*<5832*/(/*5832*//*5823*//*5823*//*5828*/tcon/*<5828*/(/*5823*//*5829*/"expr"/*<5829*/)/*<5823*/(/*5823*//*5831*/l/*<5831*/)/*<5823*/)/*<5832*/(/*5832*//*5834*/nidx/*<5834*/)/*<5832*/
}
}
if ($target.type === "equot/stmt") {
{
let l = $target[1];
return /*10430*//*10430*//*10430*//*10431*/$co$co/*<10431*/(/*10430*//*10432*/map$slnil/*<10432*/)/*<10430*/(/*10430*//*10433*//*10433*//*10434*/tcon/*<10434*/(/*10433*//*10435*/"stmt"/*<10435*/)/*<10433*/(/*10433*//*10437*/l/*<10437*/)/*<10433*/)/*<10430*/(/*10430*//*10438*/nidx/*<10438*/)/*<10430*/
}
}
if ($target.type === "equot/pat") {
{
let l = $target[1];
return /*10443*//*10443*//*10443*//*10444*/$co$co/*<10444*/(/*10443*//*10445*/map$slnil/*<10445*/)/*<10443*/(/*10443*//*10446*//*10446*//*10447*/tcon/*<10447*/(/*10446*//*10448*/"pat"/*<10448*/)/*<10446*/(/*10446*//*10450*/l/*<10450*/)/*<10446*/)/*<10443*/(/*10443*//*10451*/nidx/*<10451*/)/*<10443*/
}
}
if ($target.type === "equot/type") {
{
let l = $target[1];
return /*10456*//*10456*//*10456*//*10458*/$co$co/*<10458*/(/*10456*//*10460*/map$slnil/*<10460*/)/*<10456*/(/*10456*//*10461*//*10461*//*10462*/tcon/*<10462*/(/*10461*//*10463*/"type"/*<10463*/)/*<10461*/(/*10461*//*10465*/l/*<10465*/)/*<10461*/)/*<10456*/(/*10456*//*10466*/nidx/*<10466*/)/*<10456*/
}
}
if ($target.type === "equotquot") {
{
let l = $target[1];
return /*10405*//*10405*//*10405*//*10406*/$co$co/*<10406*/(/*10405*//*10407*/map$slnil/*<10407*/)/*<10405*/(/*10405*//*10408*//*10408*//*10409*/tcon/*<10409*/(/*10408*//*10410*/"cst"/*<10410*/)/*<10408*/(/*10408*//*10412*/l/*<10412*/)/*<10408*/)/*<10405*/(/*10405*//*10413*/nidx/*<10413*/)/*<10405*/
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
return /*6827*/(function let_6827() {const $target = /*6844*//*6844*//*6844*//*6844*//*6845*/unify/*<6845*/(/*6844*//*6846*/t/*<6846*/)/*<6844*/(/*6844*//*6847*/string_type/*<6847*/)/*<6844*/(/*6844*//*6893*/nidx/*<6893*/)/*<6844*/(/*6844*//*11556*/l/*<11556*/)/*<6844*/;
if ($target.type === ",") {
{
let s3 = $target[0];
{
let nidx = $target[1];
return /*6852*//*6852*//*6853*/$co/*<6853*/(/*6852*//*6854*//*6854*//*6854*//*6855*/compose_subst/*<6855*/(/*6854*//*12224*/"estr"/*<12224*/)/*<6854*/(/*6854*//*6856*/s3/*<6856*/)/*<6854*/(/*6854*//*6857*//*6857*//*6857*//*6858*/compose_subst/*<6858*/(/*6857*//*12226*/"estr2"/*<12226*/)/*<6857*/(/*6857*//*6859*/s2/*<6859*/)/*<6857*/(/*6857*//*6860*/subst/*<6860*/)/*<6857*/)/*<6854*/)/*<6852*/(/*6852*//*6861*/nidx/*<6861*/)/*<6852*/
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
return /*1722*/(function let_1722() {const $target = /*1730*//*1730*//*1730*//*1763*/new_type_var/*<1763*/(/*1730*//*1764*/name/*<1764*/)/*<1730*/(/*1730*//*1765*/nidx/*<1765*/)/*<1730*/(/*1730*//*10942*/l/*<10942*/)/*<1730*/;
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
return /*1816*/(function let_1816() {const $target = /*1823*//*1823*//*1823*//*1824*/new_type_var/*<1824*/(/*1823*//*1825*/"res"/*<1825*/)/*<1823*/(/*1823*//*1827*/nidx/*<1827*/)/*<1823*/(/*1823*//*10943*/l/*<10943*/)/*<1823*/;
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
return /*1816*/(function let_1816() {const $target = /*1855*//*1855*//*1855*//*1855*//*1856*/unify/*<1856*/(/*1855*//*1857*//*1857*//*1858*/type_apply/*<1858*/(/*1857*//*1859*/arg_subst/*<1859*/)/*<1857*/(/*1857*//*1860*/target_type/*<1860*/)/*<1857*/)/*<1855*/(/*1855*//*1861*//*1861*//*1861*//*1890*/tfn/*<1890*/(/*1861*//*1891*/arg_type/*<1891*/)/*<1861*/(/*1861*//*1892*/result_var/*<1892*/)/*<1861*/(/*1861*//*1893*/l/*<1893*/)/*<1861*/)/*<1855*/(/*1855*//*1894*/nidx/*<1894*/)/*<1855*/(/*1855*//*11557*/l/*<11557*/)/*<1855*/;
if ($target.type === ",") {
{
let unified_subst = $target[0];
{
let nidx = $target[1];
return /*1889*//*1889*//*1889*//*1896*/$co$co/*<1896*/(/*1889*//*1897*//*1897*//*1897*//*1898*/compose_subst/*<1898*/(/*1897*//*12228*/"eapp"/*<12228*/)/*<1897*/(/*1897*//*1899*/unified_subst/*<1899*/)/*<1897*/(/*1897*//*1900*//*1900*//*1900*//*1901*/compose_subst/*<1901*/(/*1900*//*12230*/"eapp2"/*<12230*/)/*<1900*/(/*1900*//*1902*/arg_subst/*<1902*/)/*<1900*/(/*1900*//*1903*/target_subst/*<1903*/)/*<1900*/)/*<1897*/)/*<1889*/(/*1889*//*1905*//*1905*//*1906*/type_apply/*<1906*/(/*1905*//*1907*/unified_subst/*<1907*/)/*<1905*/(/*1905*//*1908*/result_var/*<1908*/)/*<1905*/)/*<1889*/(/*1889*//*1909*/nidx/*<1909*/)/*<1889*/
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
return /*2252*/(function let_2252() {const $target = /*4432*//*4432*//*4432*//*4436*/new_type_var/*<4436*/(/*4432*//*4437*/"match-res"/*<4437*/)/*<4432*/(/*4432*//*4439*/nidx/*<4439*/)/*<4432*/(/*4432*//*10937*/l/*<10937*/)/*<4432*/;
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
return /*2252*/(function let_2252() {const $target = /*10177*//*10177*//*10177*//*10250*/foldr/*<10250*/(/*10177*//*10251*//*10251*//*10251*//*10251*//*10252*/$co$co$co/*<10252*/(/*10251*//*10253*/target_type/*<10253*/)/*<10251*/(/*10251*//*10254*/target_subst/*<10254*/)/*<10251*/(/*10251*//*10255*/result_var/*<10255*/)/*<10251*/(/*10251*//*10256*/nidx/*<10256*/)/*<10251*/)/*<10177*/(/*10177*//*10257*/cases/*<10257*/)/*<10177*/(/*10177*//*10258*/function name_10258($fn_arg) { return /*10258*/(function match_10258($target) {
if ($target.type === ",,,") {
{
let target_type = $target[0];
{
let subst = $target[1];
{
let result = $target[2];
{
let nidx = $target[3];
return /*10258*/function name_10258($fn_arg) { return /*10258*/(function match_10258($target) {
if ($target.type === ",") {
{
let pat = $target[0];
{
let body = $target[1];
return /*10271*/(function let_10271() {const $target = /*10280*//*10280*//*10280*//*10280*//*10281*/pat_and_body/*<10281*/(/*10280*//*10282*/tenv/*<10282*/)/*<10280*/(/*10280*//*10283*/pat/*<10283*/)/*<10280*/(/*10280*//*10284*/body/*<10284*/)/*<10280*/(/*10280*//*10285*//*10285*//*10285*//*10286*/$co$co/*<10286*/(/*10285*//*10287*/subst/*<10287*/)/*<10285*/(/*10285*//*10288*/target_type/*<10288*/)/*<10285*/(/*10285*//*10289*/nidx/*<10289*/)/*<10285*/)/*<10280*/;
if ($target.type === ",,") {
{
let subst = $target[0];
{
let body = $target[1];
{
let nidx = $target[2];
return /*10271*/(function let_10271() {const $target = /*10294*//*10294*//*10294*//*10294*//*10295*/unify/*<10295*/(/*10294*//*12533*//*12533*//*10296*/type_apply/*<10296*/(/*12533*//*12534*/subst/*<12534*/)/*<12533*/(/*12533*//*12535*/result/*<12535*/)/*<12533*/)/*<10294*/(/*10294*//*10297*/body/*<10297*/)/*<10294*/(/*10294*//*10298*/nidx/*<10298*/)/*<10294*/(/*10294*//*11558*/l/*<11558*/)/*<10294*/;
if ($target.type === ",") {
{
let unified_subst = $target[0];
{
let nidx = $target[1];
return /*10271*/(function let_10271() {const $target = /*11288*//*11288*//*11288*//*11289*/compose_subst/*<11289*/(/*11288*//*12232*/"ematch"/*<12232*/)/*<11288*/(/*11288*//*11291*/unified_subst/*<11291*/)/*<11288*/(/*11288*//*12201*/subst/*<12201*/)/*<11288*/;
{
let composed = $target;
return /*10299*//*10299*//*10299*//*10299*//*10300*/$co$co$co/*<10300*/(/*10299*//*10301*//*10301*//*10302*/type_apply/*<10302*/(/*10301*//*10303*/composed/*<10303*/)/*<10301*/(/*10301*//*10307*/target_type/*<10307*/)/*<10301*/)/*<10299*/(/*10299*//*10308*/composed/*<10308*/)/*<10299*/(/*10299*//*10312*//*10312*//*10313*/type_apply/*<10313*/(/*10312*//*11284*/composed/*<11284*/)/*<10312*/(/*10312*//*10315*/result/*<10315*/)/*<10312*/)/*<10299*/(/*10299*//*10316*/nidx/*<10316*/)/*<10299*/
};
throw new Error('let pattern not matched 11287. ' + valueToString($target));})(/*!*/)/*<10271*/
}
}
};
throw new Error('let pattern not matched 10290. ' + valueToString($target));})(/*!*/)/*<10271*/
}
}
}
};
throw new Error('let pattern not matched 10274. ' + valueToString($target));})(/*!*/)/*<10271*/
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 10258');})(/*!*//*-1*/$fn_arg/*<-1*/)/*<10258*/ }/*<10258*/
}
}
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 10258');})(/*!*//*-1*/$fn_arg/*<-1*/)/*<10258*/ }/*<10258*/)/*<10177*/;
if ($target.type === ",,,") {
{
let target_subst = $target[1];
{
let result_type = $target[2];
{
let nidx = $target[3];
return /*2283*//*2283*//*2283*//*10317*/$co$co/*<10317*/(/*2283*//*10318*/target_subst/*<10318*/)/*<2283*/(/*2283*//*10319*/result_type/*<10319*/)/*<2283*/(/*2283*//*10320*/nidx/*<10320*/)/*<2283*/
}
}
}
};
throw new Error('let pattern not matched 10171. ' + valueToString($target));})(/*!*/)/*<2252*/
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
return /*4289*/(function let_4289() {const $target = /*4317*//*4317*//*4317*//*4317*//*4318*/unify/*<4318*/(/*4317*//*4319*/value_type/*<4319*/)/*<4317*/(/*4317*//*4320*/pat_type/*<4320*/)/*<4317*/(/*4317*//*4321*/nidx/*<4321*/)/*<4317*/(/*4317*//*11559*//*11560*/pat_loc/*<11560*/(/*11559*//*11561*/pat/*<11561*/)/*<11559*/)/*<4317*/;
if ($target.type === ",") {
{
let unified_subst = $target[0];
{
let nidx = $target[1];
return /*4289*/(function let_4289() {const $target = /*12174*//*12174*//*12174*//*12175*/compose_subst/*<12175*/(/*12174*//*12234*/"pat-and-body"/*<12234*/)/*<12174*/(/*12174*//*12176*/unified_subst/*<12176*/)/*<12174*/(/*12174*//*12177*/value_subst/*<12177*/)/*<12174*/;
{
let composed = $target;
return /*4289*/(function let_4289() {const $target = /*4323*//*4323*//*4324*/map$slmap/*<4324*/(/*4323*//*4325*//*4326*/type_apply/*<4326*/(/*4325*//*4327*/composed/*<4327*/)/*<4325*/)/*<4323*/(/*4323*//*4331*/bindings/*<4331*/)/*<4323*/;
{
let bindings = $target;
return /*4289*/(function let_4289() {const $target = /*4333*//*4333*//*4334*/map$slmap/*<4334*/(/*4333*//*4335*//*4336*/generalize/*<4336*/(/*4335*//*4337*//*4337*//*4338*/tenv_apply/*<4338*/(/*4337*//*4339*/composed/*<4339*/)/*<4337*/(/*4337*//*4343*/tenv/*<4343*/)/*<4337*/)/*<4335*/)/*<4333*/(/*4333*//*4344*/bindings/*<4344*/)/*<4333*/;
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
return /*4289*/(function let_4289() {const $target = /*4373*//*4373*//*4373*//*4374*/t_expr/*<4374*/(/*4373*//*4375*//*4375*//*4376*/tenv_apply/*<4376*/(/*4375*//*4377*/composed/*<4377*/)/*<4375*/(/*4375*//*4381*/bound_env/*<4381*/)/*<4375*/)/*<4373*/(/*4373*//*4382*/body/*<4382*/)/*<4373*/(/*4373*//*4383*/nidx/*<4383*/)/*<4373*/;
if ($target.type === ",,") {
{
let body_subst = $target[0];
{
let body_type = $target[1];
{
let nidx = $target[2];
return /*4384*//*4384*//*4384*//*4385*/$co$co/*<4385*/(/*4384*//*4386*//*4386*//*4386*//*4387*/compose_subst/*<4387*/(/*4386*//*12236*/"pat-and-body-2"/*<12236*/)/*<4386*/(/*4386*//*4388*/body_subst/*<4388*/)/*<4386*/(/*4386*//*4389*/composed/*<4389*/)/*<4386*/)/*<4384*/(/*4384*//*4393*//*4393*//*4394*/type_apply/*<4394*/(/*4393*//*4395*/composed/*<4395*/)/*<4393*/(/*4393*//*4396*/body_type/*<4396*/)/*<4393*/)/*<4384*/(/*4384*//*4397*/nidx/*<4397*/)/*<4384*/
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
};
throw new Error('let pattern not matched 12173. ' + valueToString($target));})(/*!*/)/*<4289*/
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


const t_expr = /*13016*/function name_13016(tenv) { return /*13016*/function name_13016(expr) { return /*13016*/function name_13016(nidx) { return /*13117*//*13117*//*13117*//*13118*/t_expr_inner/*<13118*/(/*13117*//*13119*/tenv/*<13119*/)/*<13117*/(/*13117*//*13120*/expr/*<13120*/)/*<13117*/(/*13117*//*13121*/nidx/*<13121*/)/*<13117*/ }/*<13016*/ }/*<13016*/ }/*<13016*/;

const infer = /*1976*/function name_1976(tenv) { return /*1976*/function name_1976(expr) { return /*1984*/(function let_1984() {const $target = /*16003*//*16003*//*16003*//*16008*/find_missing/*<16008*/(/*16003*//*16009*/tenv/*<16009*/)/*<16003*/(/*16003*//*16010*/0/*<16010*/)/*<16003*/(/*16003*//*16011*//*16011*//*16012*/externals/*<16012*/(/*16011*//*16013*/set$slnil/*<16013*/)/*<16011*/(/*16011*//*16014*/expr/*<16014*/)/*<16011*/)/*<16003*/;
if ($target.type === ",,") {
{
let tenv = $target[0];
{
let missing = $target[1];
{
let nidx = $target[2];
return /*1984*/(function let_1984() {const $target = /*1992*//*1992*//*1992*//*1993*/t_expr/*<1993*/(/*1992*//*1994*/tenv/*<1994*/)/*<1992*/(/*1992*//*1995*/expr/*<1995*/)/*<1992*/(/*1992*//*1996*/nidx/*<1996*/)/*<1992*/;
if ($target.type === ",,") {
{
let subst = $target[0];
{
let type = $target[1];
{
let nidx = $target[2];
return /*1984*/(function let_1984() {const $target = /*16016*//*16016*//*16017*/report_missing/*<16017*/(/*16016*//*16018*/subst/*<16018*/)/*<16016*/(/*16016*//*16019*/missing/*<16019*/)/*<16016*/;
return /*1997*//*1997*//*2000*/type_apply/*<2000*/(/*1997*//*2001*/subst/*<2001*/)/*<1997*/(/*1997*//*2002*/type/*<2002*/)/*<1997*/;
throw new Error('let pattern not matched 16015. ' + valueToString($target));})(/*!*/)/*<1984*/
}
}
}
};
throw new Error('let pattern not matched 1987. ' + valueToString($target));})(/*!*/)/*<1984*/
}
}
}
};
throw new Error('let pattern not matched 16002. ' + valueToString($target));})(/*!*/)/*<1984*/ }/*<1976*/ }/*<1976*/;

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
return /*5499*/(function let_5499() {const $target = /*5569*//*5569*//*5569*//*5570*/new_type_var/*<5570*/(/*5569*//*5572*/name/*<5572*/)/*<5569*/(/*5569*//*5571*/nidx/*<5571*/)/*<5569*/(/*5569*//*10944*/l/*<10944*/)/*<5569*/;
if ($target.type === ",") {
{
let self = $target[0];
{
let nidx = $target[1];
return /*5499*/(function let_5499() {const $target = /*5556*//*5556*//*5556*//*5557*/tenv$slset_type/*<5557*/(/*5556*//*5559*/tenv$qu/*<5559*/)/*<5556*/(/*5556*//*5560*/name/*<5560*/)/*<5556*/(/*5556*//*5561*//*5561*//*5562*/scheme/*<5562*/(/*5561*//*5563*/set$slnil/*<5563*/)/*<5561*/(/*5561*//*5564*/self/*<5564*/)/*<5561*/)/*<5556*/;
{
let self_bound = $target;
return /*5499*/(function let_5499() {const $target = /*15956*//*15956*//*15956*//*15959*/find_missing/*<15959*/(/*15956*//*15960*/self_bound/*<15960*/)/*<15956*/(/*15956*//*16001*/nidx/*<16001*/)/*<15956*/(/*15956*//*15961*//*15961*//*15962*/externals/*<15962*/(/*15961*//*15963*/set$slnil/*<15963*/)/*<15961*/(/*15961*//*15964*/expr/*<15964*/)/*<15961*/)/*<15956*/;
if ($target.type === ",,") {
{
let self_bound = $target[0];
{
let missing = $target[1];
{
let nidx = $target[2];
return /*5499*/(function let_5499() {const $target = /*5510*//*5510*//*5510*//*5511*/t_expr/*<5511*/(/*5510*//*5512*/self_bound/*<5512*/)/*<5510*/(/*5510*//*5513*/expr/*<5513*/)/*<5510*/(/*5510*//*5514*/nidx/*<5514*/)/*<5510*/;
if ($target.type === ",,") {
{
let subst = $target[0];
{
let t = $target[1];
{
let nidx = $target[2];
return /*5499*/(function let_5499() {const $target = /*15838*//*15838*//*15839*/report_missing/*<15839*/(/*15838*//*15840*/subst/*<15840*/)/*<15838*/(/*15838*//*15965*/missing/*<15965*/)/*<15838*/;
return /*5499*/(function let_5499() {const $target = /*6510*//*6510*//*6511*/type_apply/*<6511*/(/*6510*//*6512*/subst/*<6512*/)/*<6510*/(/*6510*//*6513*/self/*<6513*/)/*<6510*/;
{
let selfed = $target;
return /*5499*/(function let_5499() {const $target = /*5585*//*5585*//*5585*//*5585*//*5586*/unify/*<5586*/(/*5585*//*6425*/selfed/*<6425*/)/*<5585*/(/*5585*//*5588*/t/*<5588*/)/*<5585*/(/*5585*//*5589*/nidx/*<5589*/)/*<5585*/(/*5585*//*11564*/l/*<11564*/)/*<5585*/;
if ($target.type === ",") {
{
let unified_subst = $target[0];
{
let nidx = $target[1];
return /*5499*/(function let_5499() {const $target = /*6520*//*6520*//*6520*//*6521*/compose_subst/*<6521*/(/*6520*//*12254*/"infer-stmt"/*<12254*/)/*<6520*/(/*6520*//*6522*/unified_subst/*<6522*/)/*<6520*/(/*6520*//*5574*/subst/*<5574*/)/*<6520*/;
{
let composed = $target;
return /*5499*/(function let_5499() {const $target = /*5516*//*5516*//*5517*/type_apply/*<5517*/(/*5516*//*5518*/composed/*<5518*/)/*<5516*/(/*5516*//*5519*/t/*<5519*/)/*<5516*/;
{
let t = $target;
return /*4554*//*4554*//*4554*//*4555*/tenv$slset_type/*<4555*/(/*4554*//*4556*/tenv$slnil/*<4556*/)/*<4554*/(/*4554*//*4557*/name/*<4557*/)/*<4554*/(/*4554*//*4558*//*4558*//*4559*/generalize/*<4559*/(/*4558*//*4560*/tenv$qu/*<4560*/)/*<4558*/(/*4558*//*4561*/t/*<4561*/)/*<4558*/)/*<4554*/
};
throw new Error('let pattern not matched 5515. ' + valueToString($target));})(/*!*/)/*<5499*/
};
throw new Error('let pattern not matched 5573. ' + valueToString($target));})(/*!*/)/*<5499*/
}
}
};
throw new Error('let pattern not matched 5581. ' + valueToString($target));})(/*!*/)/*<5499*/
};
throw new Error('let pattern not matched 6509. ' + valueToString($target));})(/*!*/)/*<5499*/;
throw new Error('let pattern not matched 15831. ' + valueToString($target));})(/*!*/)/*<5499*/
}
}
}
};
throw new Error('let pattern not matched 5505. ' + valueToString($target));})(/*!*/)/*<5499*/
}
}
}
};
throw new Error('let pattern not matched 15953. ' + valueToString($target));})(/*!*/)/*<5499*/
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
return /*13273*//*13273*//*13273*//*13273*//*13277*/tenv/*<13277*/(/*13273*//*13278*/map$slnil/*<13278*/)/*<13273*/(/*13273*//*13281*/map$slnil/*<13281*/)/*<13273*/(/*13273*//*13307*/map$slnil/*<13307*/)/*<13273*/(/*13273*//*13308*//*13308*//*13308*//*13309*/map$slset/*<13309*/(/*13308*//*13310*/map$slnil/*<13310*/)/*<13308*/(/*13308*//*13311*/name/*<13311*/)/*<13308*/(/*13308*//*13312*//*13312*//*13313*/$co/*<13313*/(/*13312*//*13314*//*13314*//*13315*/map/*<13315*/(/*13314*//*13328*/args/*<13328*/)/*<13314*/(/*13314*//*13316*/function name_13316($fn_arg) { return /*13316*/(function match_13316($target) {
if ($target.type === ",") {
{
let name = $target[0];
return /*13327*/name/*<13327*/
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 13316');})(/*!*//*-1*/$fn_arg/*<-1*/)/*<13316*/ }/*<13316*/)/*<13314*/)/*<13312*/(/*13312*//*13552*/body/*<13552*/)/*<13312*/)/*<13308*/)/*<13273*/
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
return /*4568*/(function let_4568() {const $target = /*16021*//*16021*//*16022*/infer/*<16022*/(/*16021*//*16023*/tenv$qu/*<16023*/)/*<16021*/(/*16021*//*16024*/expr/*<16024*/)/*<16021*/;
return /*4579*/tenv$slnil/*<4579*/;
throw new Error('let pattern not matched 16020. ' + valueToString($target));})(/*!*/)/*<4568*/
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
return /*14872*//*14872*//*14872*//*14872*//*14872*//*14872*//*14872*//*14873*/infer_deftype/*<14873*/(/*14872*//*14874*/tenv$qu/*<14874*/)/*<14872*/(/*14872*//*14919*/set$slnil/*<14919*/)/*<14872*/(/*14872*//*14875*/tname/*<14875*/)/*<14872*/(/*14872*//*14876*/tnl/*<14876*/)/*<14872*/(/*14872*//*14877*/targs/*<14877*/)/*<14872*/(/*14872*//*14878*/constructors/*<14878*/)/*<14872*/(/*14872*//*14879*/l/*<14879*/)/*<14872*/
}
}
}
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 4547');})(/*!*//*4549*/stmt/*<4549*/)/*<4547*/ }/*<2197*/ }/*<2197*/;

const infer_show = /*4985*/function name_4985(tenv) { return /*4985*/function name_4985(x) { return /*4996*//*4997*/type_to_string/*<4997*/(/*4996*//*4998*//*4998*//*5000*/infer/*<5000*/(/*4998*//*5001*/tenv/*<5001*/)/*<4998*/(/*4998*//*5002*/x/*<5002*/)/*<4998*/)/*<4996*/ }/*<4985*/ }/*<4985*/;

const infer_several_inner = /*15750*/function name_15750(bound) { return /*15750*/function name_15750($fn_arg) { return /*15750*/(function match_15750($target) {
if ($target.type === ",,") {
{
let subst = $target[0];
{
let types = $target[1];
{
let nidx = $target[2];
return /*15750*/function name_15750($fn_arg) { return /*15750*/(function match_15750($target) {
if ($target.type === ",") {
{
let $var = $target[0];
if ($target[1].type === "sdef") {
{
let name = $target[1][0];
{
let body = $target[1][2];
{
let l = $target[1][3];
return /*8391*/(function let_8391() {const $target = /*8399*//*8399*//*8399*//*8400*/t_expr/*<8400*/(/*8399*//*8612*//*8612*//*8401*/tenv_apply/*<8401*/(/*8612*//*8613*/subst/*<8613*/)/*<8612*/(/*8612*//*8614*/bound/*<8614*/)/*<8612*/)/*<8399*/(/*8399*//*8402*/body/*<8402*/)/*<8399*/(/*8399*//*8403*/nidx/*<8403*/)/*<8399*/;
if ($target.type === ",,") {
{
let body_subst = $target[0];
{
let body_type = $target[1];
{
let nidx = $target[2];
return /*8391*/(function let_8391() {const $target = /*12248*//*12248*//*12248*//*12249*/compose_subst/*<12249*/(/*12248*//*12250*/"infer-several"/*<12250*/)/*<12248*/(/*12248*//*12252*/body_subst/*<12252*/)/*<12248*/(/*12248*//*12253*/subst/*<12253*/)/*<12248*/;
{
let both = $target;
return /*8391*/(function let_8391() {const $target = /*8405*//*8405*//*8406*/type_apply/*<8406*/(/*8405*//*8505*/both/*<8505*/)/*<8405*/(/*8405*//*8408*/$var/*<8408*/)/*<8405*/;
{
let selfed = $target;
return /*8391*/(function let_8391() {const $target = /*8413*//*8413*//*8413*//*8413*//*8414*/unify/*<8414*/(/*8413*//*8415*/selfed/*<8415*/)/*<8413*/(/*8413*//*8416*/body_type/*<8416*/)/*<8413*/(/*8413*//*8417*/nidx/*<8417*/)/*<8413*/(/*8413*//*11563*/l/*<11563*/)/*<8413*/;
if ($target.type === ",") {
{
let u_subst = $target[0];
{
let nidx = $target[1];
return /*8391*/(function let_8391() {const $target = /*8428*//*8428*//*8428*//*8429*/compose_subst/*<8429*/(/*8428*//*12242*/"infer-several-2"/*<12242*/)/*<8428*/(/*8428*//*8502*/u_subst/*<8502*/)/*<8428*/(/*8428*//*8653*/both/*<8653*/)/*<8428*/;
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
};
throw new Error('let pattern not matched 12246. ' + valueToString($target));})(/*!*/)/*<8391*/
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
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 15750');})(/*!*//*-1*/$fn_arg/*<-1*/)/*<15750*/ }/*<15750*/
}
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 15750');})(/*!*//*-1*/$fn_arg/*<-1*/)/*<15750*/ }/*<15750*/ }/*<15750*/;

const infer_several = /*8292*/function name_8292(tenv) { return /*8292*/function name_8292(stmts) { return /*8300*/(function let_8300() {const $target = /*8305*/0/*<8305*/;
{
let nidx = $target;
return /*8300*/(function let_8300() {const $target = /*8734*//*8734*//*8741*/map/*<8741*/(/*8734*//*8742*/stmts/*<8742*/)/*<8734*/(/*8734*//*8743*/function name_8743(stmt) { return /*14179*/(function match_14179($target) {
if ($target.type === "sdef") {
{
let name = $target[0];
return /*14182*/name/*<14182*/
}
}
return /*14184*//*14185*/fatal/*<14185*/(/*14184*//*14186*/"Cant infer-several with sdefs? idk maybe you can ..."/*<14186*/)/*<14184*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 14179');})(/*!*//*14181*/stmt/*<14181*/)/*<14179*/ }/*<8743*/)/*<8734*/;
{
let names = $target;
return /*8300*/(function let_8300() {const $target = /*15652*//*15652*//*15652*//*15653*/vars_for_names/*<15653*/(/*15652*//*15654*//*15654*//*15655*/map/*<15655*/(/*15654*//*15656*/stmts/*<15656*/)/*<15654*/(/*15654*//*15657*/function name_15657($fn_arg) { return /*15657*/(function match_15657($target) {
if ($target.type === "sdef") {
{
let name = $target[0];
{
let l = $target[3];
return /*15666*//*15666*//*15667*/$co/*<15667*/(/*15666*//*15668*/name/*<15668*/)/*<15666*/(/*15666*//*15669*/l/*<15669*/)/*<15666*/
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 15657');})(/*!*//*-1*/$fn_arg/*<-1*/)/*<15657*/ }/*<15657*/)/*<15654*/)/*<15652*/(/*15652*//*15670*/nidx/*<15670*/)/*<15652*/(/*15652*//*15672*/tenv/*<15672*/)/*<15652*/;
if ($target.type === ",,") {
{
let bound = $target[0];
{
let vars = $target[1];
{
let nidx = $target[2];
return /*8300*/(function let_8300() {const $target = /*15972*//*15972*//*15972*//*15977*/find_missing/*<15977*/(/*15972*//*15978*/bound/*<15978*/)/*<15972*/(/*15972*//*15983*/nidx/*<15983*/)/*<15972*/(/*15972*//*15979*//*15980*/externals_defs/*<15980*/(/*15979*//*15981*/stmts/*<15981*/)/*<15979*/)/*<15972*/;
if ($target.type === ",,") {
{
let bound = $target[0];
{
let missing = $target[1];
{
let nidx = $target[2];
return /*8300*/(function let_8300() {const $target = /*8363*//*8363*//*8363*//*8364*/foldr/*<8364*/(/*8363*//*8365*//*8365*//*8365*//*8366*/$co$co/*<8366*/(/*8365*//*8367*/map$slnil/*<8367*/)/*<8365*/(/*8365*//*8368*/nil/*<8368*/)/*<8365*/(/*8365*//*8369*/nidx/*<8369*/)/*<8365*/)/*<8363*/(/*8363*//*8370*//*8370*//*8371*/zip/*<8371*/(/*8370*//*8372*/vars/*<8372*/)/*<8370*/(/*8370*//*8373*/stmts/*<8373*/)/*<8370*/)/*<8363*/(/*8363*//*15748*//*15747*/infer_several_inner/*<15747*/(/*15748*//*15749*/bound/*<15749*/)/*<15748*/)/*<8363*/;
if ($target.type === ",,") {
{
let subst = $target[0];
{
let types = $target[1];
{
let nidx = $target[2];
return /*8300*/(function let_8300() {const $target = /*15674*//*15674*//*15673*/report_missing/*<15673*/(/*15674*//*15675*/subst/*<15675*/)/*<15674*/(/*15674*//*15982*/missing/*<15982*/)/*<15674*/;
return /*8753*//*8753*//*8754*/zip/*<8754*/(/*8753*//*8755*/names/*<8755*/)/*<8753*/(/*8753*//*8496*//*8496*//*8494*/map/*<8494*/(/*8496*//*8497*/types/*<8497*/)/*<8496*/(/*8496*//*8498*//*8499*/type_apply/*<8499*/(/*8498*//*8500*/subst/*<8500*/)/*<8498*/)/*<8496*/)/*<8753*/;
throw new Error('let pattern not matched 15538. ' + valueToString($target));})(/*!*/)/*<8300*/
}
}
}
};
throw new Error('let pattern not matched 8488. ' + valueToString($target));})(/*!*/)/*<8300*/
}
}
}
};
throw new Error('let pattern not matched 15971. ' + valueToString($target));})(/*!*/)/*<8300*/
}
}
}
};
throw new Error('let pattern not matched 8306. ' + valueToString($target));})(/*!*/)/*<8300*/
};
throw new Error('let pattern not matched 8732. ' + valueToString($target));})(/*!*/)/*<8300*/
};
throw new Error('let pattern not matched 8304. ' + valueToString($target));})(/*!*/)/*<8300*/ }/*<8292*/ }/*<8292*/;

const infer_defns = /*8724*/function name_8724(tenv) { return /*8724*/function name_8724(stmts) { return /*11782*/(function match_11782($target) {
if ($target.type === "cons") {
{
let one = $target[0];
if ($target[1].type === "nil") {
return /*11789*//*11789*//*11790*/infer_stmt/*<11790*/(/*11789*//*11791*/tenv/*<11791*/)/*<11789*/(/*11789*//*11792*/one/*<11792*/)/*<11789*/
}
}
}
return /*8731*//*8731*//*8731*//*8775*/foldl/*<8775*/(/*8731*//*8776*/tenv$slnil/*<8776*/)/*<8731*/(/*8731*//*8777*//*8777*//*8778*/infer_several/*<8778*/(/*8777*//*8779*/tenv/*<8779*/)/*<8777*/(/*8777*//*8780*/stmts/*<8780*/)/*<8777*/)/*<8731*/(/*8731*//*8781*/function name_8781(tenv) { return /*8781*/function name_8781($fn_arg) { return /*8781*/(function match_8781($target) {
if ($target.type === ",") {
{
let name = $target[0];
{
let type = $target[1];
return /*8789*//*8789*//*8789*//*8790*/tenv$slset_type/*<8790*/(/*8789*//*8791*/tenv/*<8791*/)/*<8789*/(/*8789*//*8792*/name/*<8792*/)/*<8789*/(/*8789*//*8793*//*8793*//*8794*/generalize/*<8794*/(/*8793*//*8795*/tenv/*<8795*/)/*<8793*/(/*8793*//*8796*/type/*<8796*/)/*<8793*/)/*<8789*/
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 8781');})(/*!*//*-1*/$fn_arg/*<-1*/)/*<8781*/ }/*<8781*/ }/*<8781*/)/*<8731*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 11782');})(/*!*//*11785*/stmts/*<11785*/)/*<11782*/ }/*<8724*/ }/*<8724*/;

const infer_stmtss = /*14294*/function name_14294(tenv$qu) { return /*14294*/function name_14294(stmts) { return /*14301*/(function let_14301() {const $target = /*14309*//*14309*//*14309*//*14309*//*14309*//*14310*/split_stmts/*<14310*/(/*14309*//*14312*/stmts/*<14312*/)/*<14309*/(/*14309*//*14313*/nil/*<14313*/)/*<14309*/(/*14309*//*14314*/nil/*<14314*/)/*<14309*/(/*14309*//*14315*/nil/*<14315*/)/*<14309*/(/*14309*//*14353*/nil/*<14353*/)/*<14309*/;
if ($target.type === ",,,") {
{
let sdefs = $target[0];
{
let stypes = $target[1];
{
let salias = $target[2];
{
let sexps = $target[3];
return /*14301*/(function let_14301() {const $target = /*14318*//*14318*//*14318*//*14319*/infer_stypes/*<14319*/(/*14318*//*14320*/tenv$qu/*<14320*/)/*<14318*/(/*14318*//*14321*/stypes/*<14321*/)/*<14318*/(/*14318*//*14363*/salias/*<14363*/)/*<14318*/;
{
let type_tenv = $target;
return /*14301*/(function let_14301() {const $target = /*14603*//*14603*//*14604*/tenv$slmerge/*<14604*/(/*14603*//*14605*/type_tenv/*<14605*/)/*<14603*/(/*14603*//*14606*/tenv$qu/*<14606*/)/*<14603*/;
{
let tenv$qu = $target;
return /*14301*/(function let_14301() {const $target = /*14323*//*14323*//*14324*/infer_defns/*<14324*/(/*14323*//*14325*/tenv$qu/*<14325*/)/*<14323*/(/*14323*//*14326*/sdefs/*<14326*/)/*<14323*/;
{
let val_tenv = $target;
return /*14301*/(function let_14301() {const $target = /*14328*//*14328*//*14331*/map/*<14331*/(/*14328*//*14332*/sexps/*<14332*/)/*<14328*/(/*14328*//*14333*//*14334*/infer/*<14334*/(/*14333*//*15061*//*15061*//*14335*/tenv$slmerge/*<14335*/(/*15061*//*15062*/val_tenv/*<15062*/)/*<15061*/(/*15061*//*15064*/tenv$qu/*<15064*/)/*<15061*/)/*<14333*/)/*<14328*/;
return /*14609*//*14609*//*14316*/tenv$slmerge/*<14316*/(/*14609*//*14610*/type_tenv/*<14610*/)/*<14609*/(/*14609*//*14611*/val_tenv/*<14611*/)/*<14609*/;
throw new Error('let pattern not matched 14327. ' + valueToString($target));})(/*!*/)/*<14301*/
};
throw new Error('let pattern not matched 14322. ' + valueToString($target));})(/*!*/)/*<14301*/
};
throw new Error('let pattern not matched 14602. ' + valueToString($target));})(/*!*/)/*<14301*/
};
throw new Error('let pattern not matched 14317. ' + valueToString($target));})(/*!*/)/*<14301*/
}
}
}
}
};
throw new Error('let pattern not matched 14304. ' + valueToString($target));})(/*!*/)/*<14301*/ }/*<14294*/ }/*<14294*/;

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
return /*5253*//*5253*//*5253*//*5254*/foldl/*<5254*/(/*5253*//*5255*//*5255*//*5255*//*5255*//*5281*/tenv/*<5281*/(/*5255*//*5282*//*5286*/map$slfrom_list/*<5286*/(/*5282*//*5287*//*5287*//*5287*/cons/*<5287*/(/*5287*//*5289*//*5289*//*5290*/$co/*<5290*/(/*5289*//*5291*/"+"/*<5291*/)/*<5289*/(/*5289*//*5293*//*9168*/concrete/*<9168*/(/*5293*//*5296*//*5296*//*9074*/tfns/*<9074*/(/*5296*//*9075*//*9075*//*9075*/cons/*<9075*/(/*9075*//*9076*/tint/*<9076*/)/*<9075*/(/*9075*//*9075*//*9075*//*9075*/cons/*<9075*/(/*9075*//*9077*/tint/*<9077*/)/*<9075*/(/*9075*//*9075*/nil/*<9075*/)/*<9075*/)/*<9075*/)/*<5296*/(/*5296*//*9078*/tint/*<9078*/)/*<5296*/)/*<5293*/)/*<5289*/)/*<5287*/(/*5287*//*5287*//*5287*//*5287*/cons/*<5287*/(/*5287*//*5380*//*5380*//*5381*/$co/*<5381*/(/*5380*//*5382*/"-"/*<5382*/)/*<5380*/(/*5380*//*5384*//*9169*/concrete/*<9169*/(/*5384*//*5387*//*5387*//*9079*/tfns/*<9079*/(/*5387*//*9080*//*9080*//*9080*/cons/*<9080*/(/*9080*//*9081*/tint/*<9081*/)/*<9080*/(/*9080*//*9080*//*9080*//*9080*/cons/*<9080*/(/*9080*//*9082*/tint/*<9082*/)/*<9080*/(/*9080*//*9080*/nil/*<9080*/)/*<9080*/)/*<9080*/)/*<5387*/(/*5387*//*9083*/tint/*<9083*/)/*<5387*/)/*<5384*/)/*<5380*/)/*<5287*/(/*5287*//*5287*//*5287*//*5287*/cons/*<5287*/(/*5287*//*5396*//*5396*//*5397*/$co/*<5397*/(/*5396*//*5398*/">"/*<5398*/)/*<5396*/(/*5396*//*5400*//*5401*/concrete/*<5401*/(/*5400*//*5403*//*5403*//*9084*/tfns/*<9084*/(/*5403*//*9085*//*9085*//*9085*/cons/*<9085*/(/*9085*//*9086*/tint/*<9086*/)/*<9085*/(/*9085*//*9085*//*9085*//*9085*/cons/*<9085*/(/*9085*//*9087*/tint/*<9087*/)/*<9085*/(/*9085*//*9085*/nil/*<9085*/)/*<9085*/)/*<9085*/)/*<5403*/(/*5403*//*9088*/tbool/*<9088*/)/*<5403*/)/*<5400*/)/*<5396*/)/*<5287*/(/*5287*//*5287*//*5287*//*5287*/cons/*<5287*/(/*5287*//*5422*//*5422*//*5423*/$co/*<5423*/(/*5422*//*5424*/"<"/*<5424*/)/*<5422*/(/*5422*//*5426*//*5427*/concrete/*<5427*/(/*5426*//*5429*//*5429*//*9089*/tfns/*<9089*/(/*5429*//*9090*//*9090*//*9090*/cons/*<9090*/(/*9090*//*9091*/tint/*<9091*/)/*<9090*/(/*9090*//*9090*//*9090*//*9090*/cons/*<9090*/(/*9090*//*9092*/tint/*<9092*/)/*<9090*/(/*9090*//*9090*/nil/*<9090*/)/*<9090*/)/*<9090*/)/*<5429*/(/*5429*//*9093*/tbool/*<9093*/)/*<5429*/)/*<5426*/)/*<5422*/)/*<5287*/(/*5287*//*5287*//*5287*//*5287*/cons/*<5287*/(/*5287*//*5438*//*5438*//*5439*/$co/*<5439*/(/*5438*//*5440*/"="/*<5440*/)/*<5438*/(/*5438*//*5442*//*5442*//*5443*/generic/*<5443*/(/*5442*//*10377*//*10377*//*10377*/cons/*<10377*/(/*10377*//*10382*/"k"/*<10382*/)/*<10377*/(/*10377*//*10377*/nil/*<10377*/)/*<10377*/)/*<5442*/(/*5442*//*5445*//*5445*//*9094*/tfns/*<9094*/(/*5445*//*9095*//*9095*//*9095*/cons/*<9095*/(/*9095*//*9096*/k/*<9096*/)/*<9095*/(/*9095*//*9095*//*9095*//*9095*/cons/*<9095*/(/*9095*//*9097*/k/*<9097*/)/*<9095*/(/*9095*//*9095*/nil/*<9095*/)/*<9095*/)/*<9095*/)/*<5445*/(/*5445*//*9098*/tbool/*<9098*/)/*<5445*/)/*<5442*/)/*<5438*/)/*<5287*/(/*5287*//*5287*//*5287*//*5287*/cons/*<5287*/(/*5287*//*10385*//*10385*//*10386*/$co/*<10386*/(/*10385*//*10387*/"!="/*<10387*/)/*<10385*/(/*10385*//*10389*//*10389*//*10390*/generic/*<10390*/(/*10389*//*10391*//*10391*//*10391*/cons/*<10391*/(/*10391*//*10392*/"k"/*<10392*/)/*<10391*/(/*10391*//*10391*/nil/*<10391*/)/*<10391*/)/*<10389*/(/*10389*//*10394*//*10394*//*10395*/tfns/*<10395*/(/*10394*//*10396*//*10396*//*10396*/cons/*<10396*/(/*10396*//*10397*/k/*<10397*/)/*<10396*/(/*10396*//*10396*//*10396*//*10396*/cons/*<10396*/(/*10396*//*10398*/k/*<10398*/)/*<10396*/(/*10396*//*10396*/nil/*<10396*/)/*<10396*/)/*<10396*/)/*<10394*/(/*10394*//*10399*/tbool/*<10399*/)/*<10394*/)/*<10389*/)/*<10385*/)/*<5287*/(/*5287*//*5287*//*5287*//*5287*/cons/*<5287*/(/*5287*//*5454*//*5454*//*5455*/$co/*<5455*/(/*5454*//*5456*/">="/*<5456*/)/*<5454*/(/*5454*//*5458*//*5459*/concrete/*<5459*/(/*5458*//*5461*//*5461*//*9099*/tfns/*<9099*/(/*5461*//*9100*//*9100*//*9100*/cons/*<9100*/(/*9100*//*9101*/tint/*<9101*/)/*<9100*/(/*9100*//*9100*//*9100*//*9100*/cons/*<9100*/(/*9100*//*9102*/tint/*<9102*/)/*<9100*/(/*9100*//*9100*/nil/*<9100*/)/*<9100*/)/*<9100*/)/*<5461*/(/*5461*//*9103*/tbool/*<9103*/)/*<5461*/)/*<5458*/)/*<5454*/)/*<5287*/(/*5287*//*5287*//*5287*//*5287*/cons/*<5287*/(/*5287*//*5470*//*5470*//*5471*/$co/*<5471*/(/*5470*//*5472*/"<="/*<5472*/)/*<5470*/(/*5470*//*5474*//*5475*/concrete/*<5475*/(/*5474*//*5477*//*5477*//*9104*/tfns/*<9104*/(/*5477*//*9105*//*9105*//*9105*/cons/*<9105*/(/*9105*//*9106*/tint/*<9106*/)/*<9105*/(/*9105*//*9105*//*9105*//*9105*/cons/*<9105*/(/*9105*//*9107*/tint/*<9107*/)/*<9105*/(/*9105*//*9105*/nil/*<9105*/)/*<9105*/)/*<9105*/)/*<5477*/(/*5477*//*9108*/tbool/*<9108*/)/*<5477*/)/*<5474*/)/*<5470*/)/*<5287*/(/*5287*//*5287*//*5287*//*5287*/cons/*<5287*/(/*5287*//*11355*//*11355*//*11356*/$co/*<11356*/(/*11355*//*11357*/"trace"/*<11357*/)/*<11355*/(/*11355*//*11359*//*11361*/kk/*<11361*/(/*11359*//*11362*//*11362*//*11363*/tfns/*<11363*/(/*11362*//*11364*//*11364*//*11364*/cons/*<11364*/(/*11364*//*11380*//*11380*//*11380*//*11381*/tapp/*<11381*/(/*11380*//*11382*//*11382*//*11383*/tcon/*<11383*/(/*11382*//*11384*/"array"/*<11384*/)/*<11382*/(/*11382*//*11424*/-1/*<11424*/)/*<11382*/)/*<11380*/(/*11380*//*11366*//*11366*//*11366*//*11367*/tapp/*<11367*/(/*11366*//*11368*//*11368*//*11369*/tcon/*<11369*/(/*11368*//*11370*/"trace-fmt"/*<11370*/)/*<11368*/(/*11368*//*11372*/-1/*<11372*/)/*<11368*/)/*<11366*/(/*11366*//*11373*/k/*<11373*/)/*<11366*/(/*11366*//*11374*/-1/*<11374*/)/*<11366*/)/*<11380*/(/*11380*//*11386*/-1/*<11386*/)/*<11380*/)/*<11364*/(/*11364*//*11364*/nil/*<11364*/)/*<11364*/)/*<11362*/(/*11362*//*11375*//*11375*//*11376*/tcon/*<11376*/(/*11375*//*11377*/"()"/*<11377*/)/*<11375*/(/*11375*//*11379*/-1/*<11379*/)/*<11375*/)/*<11362*/)/*<11359*/)/*<11355*/)/*<5287*/(/*5287*//*5287*//*5287*//*5287*/cons/*<5287*/(/*5287*//*8890*//*8890*//*8891*/$co/*<8891*/(/*8890*//*8892*/"unescapeString"/*<8892*/)/*<8890*/(/*8890*//*8894*//*8895*/concrete/*<8895*/(/*8894*//*8897*//*8897*//*8899*/tfns/*<8899*/(/*8897*//*9606*//*9606*//*9606*/cons/*<9606*/(/*9606*//*8900*/tstring/*<8900*/)/*<9606*/(/*9606*//*9606*/nil/*<9606*/)/*<9606*/)/*<8897*/(/*8897*//*8901*/tstring/*<8901*/)/*<8897*/)/*<8894*/)/*<8890*/)/*<5287*/(/*5287*//*5287*//*5287*//*5287*/cons/*<5287*/(/*5287*//*8911*//*8911*//*8912*/$co/*<8912*/(/*8911*//*8913*/"int-to-string"/*<8913*/)/*<8911*/(/*8911*//*8915*//*8916*/concrete/*<8916*/(/*8915*//*8918*//*8918*//*8920*/tfns/*<8920*/(/*8918*//*9607*//*9607*//*9607*/cons/*<9607*/(/*9607*//*8921*/tint/*<8921*/)/*<9607*/(/*9607*//*9607*/nil/*<9607*/)/*<9607*/)/*<8918*/(/*8918*//*8922*/tstring/*<8922*/)/*<8918*/)/*<8915*/)/*<8911*/)/*<5287*/(/*5287*//*5287*//*5287*//*5287*/cons/*<5287*/(/*5287*//*8923*//*8923*//*8924*/$co/*<8924*/(/*8923*//*8925*/"string-to-int"/*<8925*/)/*<8923*/(/*8923*//*8927*//*8928*/concrete/*<8928*/(/*8927*//*8930*//*8930*//*8931*/tfns/*<8931*/(/*8930*//*9608*//*9608*//*9608*/cons/*<9608*/(/*9608*//*8932*/tstring/*<8932*/)/*<9608*/(/*9608*//*9608*/nil/*<9608*/)/*<9608*/)/*<8930*/(/*8930*//*8933*//*9140*/toption/*<9140*/(/*8933*//*9141*/tint/*<9141*/)/*<8933*/)/*<8930*/)/*<8927*/)/*<8923*/)/*<5287*/(/*5287*//*5287*//*5287*//*5287*/cons/*<5287*/(/*5287*//*16217*//*16217*//*16218*/$co/*<16218*/(/*16217*//*16219*/"string-to-float"/*<16219*/)/*<16217*/(/*16217*//*16221*//*16222*/concrete/*<16222*/(/*16221*//*16223*//*16223*//*16224*/tfns/*<16224*/(/*16223*//*16225*//*16225*//*16225*/cons/*<16225*/(/*16225*//*16231*/tstring/*<16231*/)/*<16225*/(/*16225*//*16225*/nil/*<16225*/)/*<16225*/)/*<16223*/(/*16223*//*16232*//*16233*/toption/*<16233*/(/*16232*//*16234*//*16234*//*16235*/tcon/*<16235*/(/*16234*//*16236*/"float"/*<16236*/)/*<16234*/(/*16234*//*16238*/-1/*<16238*/)/*<16234*/)/*<16232*/)/*<16223*/)/*<16221*/)/*<16217*/)/*<5287*/(/*5287*//*5287*//*5287*//*5287*/cons/*<5287*/(/*5287*//*8944*//*8944*//*8945*/$co/*<8945*/(/*8944*//*8946*/"++"/*<8946*/)/*<8944*/(/*8944*//*8948*//*8949*/concrete/*<8949*/(/*8948*//*8951*//*8951*//*8952*/tfns/*<8952*/(/*8951*//*9609*//*9609*//*9609*/cons/*<9609*/(/*9609*//*8953*//*9142*/tarray/*<9142*/(/*8953*//*9143*/tstring/*<9143*/)/*<8953*/)/*<9609*/(/*9609*//*9609*/nil/*<9609*/)/*<9609*/)/*<8951*/(/*8951*//*8962*/tstring/*<8962*/)/*<8951*/)/*<8948*/)/*<8944*/)/*<5287*/(/*5287*//*5287*//*5287*//*5287*/cons/*<5287*/(/*5287*//*8963*//*8963*//*8964*/$co/*<8964*/(/*8963*//*8965*/"map/nil"/*<8965*/)/*<8963*/(/*8963*//*8967*//*8968*/kv/*<8968*/(/*8967*//*8989*//*8989*//*8990*/tmap/*<8990*/(/*8989*//*8984*/k/*<8984*/)/*<8989*/(/*8989*//*8992*/v/*<8992*/)/*<8989*/)/*<8967*/)/*<8963*/)/*<5287*/(/*5287*//*5287*//*5287*//*5287*/cons/*<5287*/(/*5287*//*9023*//*9023*//*9024*/$co/*<9024*/(/*9023*//*9025*/"map/set"/*<9025*/)/*<9023*/(/*9023*//*9027*//*9028*/kv/*<9028*/(/*9027*//*9036*//*9036*//*9037*/tfns/*<9037*/(/*9036*//*9170*//*9170*//*9170*/cons/*<9170*/(/*9170*//*9039*//*9039*//*9040*/tmap/*<9040*/(/*9039*//*9171*/k/*<9171*/)/*<9039*/(/*9039*//*9176*/v/*<9176*/)/*<9039*/)/*<9170*/(/*9170*//*9170*//*9170*//*9170*/cons/*<9170*/(/*9170*//*9191*/k/*<9191*/)/*<9170*/(/*9170*//*9170*//*9170*//*9170*/cons/*<9170*/(/*9170*//*9195*/v/*<9195*/)/*<9170*/(/*9170*//*9170*/nil/*<9170*/)/*<9170*/)/*<9170*/)/*<9170*/)/*<9036*/(/*9036*//*9199*//*9199*//*9200*/tmap/*<9200*/(/*9199*//*9201*/k/*<9201*/)/*<9199*/(/*9199*//*9205*/v/*<9205*/)/*<9199*/)/*<9036*/)/*<9027*/)/*<9023*/)/*<5287*/(/*5287*//*5287*//*5287*//*5287*/cons/*<5287*/(/*5287*//*9222*//*9222*//*9223*/$co/*<9223*/(/*9222*//*9224*/"map/rm"/*<9224*/)/*<9222*/(/*9222*//*9226*//*9252*/kv/*<9252*/(/*9226*//*9259*//*9259*//*9261*/tfns/*<9261*/(/*9259*//*9262*//*9262*//*9262*/cons/*<9262*/(/*9262*//*9263*//*9263*//*9264*/tmap/*<9264*/(/*9263*//*9265*/k/*<9265*/)/*<9263*/(/*9263*//*9266*/v/*<9266*/)/*<9263*/)/*<9262*/(/*9262*//*9262*//*9262*//*9262*/cons/*<9262*/(/*9262*//*9267*/k/*<9267*/)/*<9262*/(/*9262*//*9262*/nil/*<9262*/)/*<9262*/)/*<9262*/)/*<9259*/(/*9259*//*9268*//*9268*//*9269*/tmap/*<9269*/(/*9268*//*9270*/k/*<9270*/)/*<9268*/(/*9268*//*9271*/v/*<9271*/)/*<9268*/)/*<9259*/)/*<9226*/)/*<9222*/)/*<5287*/(/*5287*//*5287*//*5287*//*5287*/cons/*<5287*/(/*5287*//*9272*//*9272*//*9273*/$co/*<9273*/(/*9272*//*9274*/"map/get"/*<9274*/)/*<9272*/(/*9272*//*9276*//*9277*/kv/*<9277*/(/*9276*//*9283*//*9283*//*9284*/tfns/*<9284*/(/*9283*//*9285*//*9285*//*9285*/cons/*<9285*/(/*9285*//*9286*//*9286*//*9287*/tmap/*<9287*/(/*9286*//*9288*/k/*<9288*/)/*<9286*/(/*9286*//*9289*/v/*<9289*/)/*<9286*/)/*<9285*/(/*9285*//*9285*//*9285*//*9285*/cons/*<9285*/(/*9285*//*9290*/k/*<9290*/)/*<9285*/(/*9285*//*9285*/nil/*<9285*/)/*<9285*/)/*<9285*/)/*<9283*/(/*9283*//*9291*//*9293*/toption/*<9293*/(/*9291*//*9294*/v/*<9294*/)/*<9291*/)/*<9283*/)/*<9276*/)/*<9272*/)/*<5287*/(/*5287*//*5287*//*5287*//*5287*/cons/*<5287*/(/*5287*//*9295*//*9295*//*9296*/$co/*<9296*/(/*9295*//*9297*/"map/map"/*<9297*/)/*<9295*/(/*9295*//*9299*//*9299*//*9300*/generic/*<9300*/(/*9299*//*9301*//*9301*//*9301*/cons/*<9301*/(/*9301*//*9302*/"k"/*<9302*/)/*<9301*/(/*9301*//*9301*//*9301*//*9301*/cons/*<9301*/(/*9301*//*9304*/"v"/*<9304*/)/*<9301*/(/*9301*//*9301*//*9301*//*9301*/cons/*<9301*/(/*9301*//*9321*/"v2"/*<9321*/)/*<9301*/(/*9301*//*9301*/nil/*<9301*/)/*<9301*/)/*<9301*/)/*<9301*/)/*<9299*/(/*9299*//*9307*//*9307*//*9308*/tfns/*<9308*/(/*9307*//*9309*//*9309*//*9309*/cons/*<9309*/(/*9309*//*9314*//*9314*//*9315*/tfns/*<9315*/(/*9314*//*9734*//*9734*//*9734*/cons/*<9734*/(/*9734*//*9323*/v/*<9323*/)/*<9734*/(/*9734*//*9734*/nil/*<9734*/)/*<9734*/)/*<9314*/(/*9314*//*9324*/v2/*<9324*/)/*<9314*/)/*<9309*/(/*9309*//*9309*//*9309*//*9309*/cons/*<9309*/(/*9309*//*9735*//*9735*//*9736*/tmap/*<9736*/(/*9735*//*9737*/k/*<9737*/)/*<9735*/(/*9735*//*9738*/v/*<9738*/)/*<9735*/)/*<9309*/(/*9309*//*9309*/nil/*<9309*/)/*<9309*/)/*<9309*/)/*<9307*/(/*9307*//*9325*//*9325*//*9326*/tmap/*<9326*/(/*9325*//*9327*/k/*<9327*/)/*<9325*/(/*9325*//*9329*/v2/*<9329*/)/*<9325*/)/*<9307*/)/*<9299*/)/*<9295*/)/*<5287*/(/*5287*//*5287*//*5287*//*5287*/cons/*<5287*/(/*5287*//*9330*//*9330*//*9331*/$co/*<9331*/(/*9330*//*9332*/"map/merge"/*<9332*/)/*<9330*/(/*9330*//*9334*//*9335*/kv/*<9335*/(/*9334*//*9341*//*9341*//*9342*/tfns/*<9342*/(/*9341*//*9343*//*9343*//*9343*/cons/*<9343*/(/*9343*//*9344*//*9344*//*9345*/tmap/*<9345*/(/*9344*//*9346*/k/*<9346*/)/*<9344*/(/*9344*//*9347*/v/*<9347*/)/*<9344*/)/*<9343*/(/*9343*//*9343*//*9343*//*9343*/cons/*<9343*/(/*9343*//*9348*//*9348*//*9349*/tmap/*<9349*/(/*9348*//*9351*/k/*<9351*/)/*<9348*/(/*9348*//*9352*/v/*<9352*/)/*<9348*/)/*<9343*/(/*9343*//*9343*/nil/*<9343*/)/*<9343*/)/*<9343*/)/*<9341*/(/*9341*//*9353*//*9353*//*9354*/tmap/*<9354*/(/*9353*//*9355*/k/*<9355*/)/*<9353*/(/*9353*//*9356*/v/*<9356*/)/*<9353*/)/*<9341*/)/*<9334*/)/*<9330*/)/*<5287*/(/*5287*//*5287*//*5287*//*5287*/cons/*<5287*/(/*5287*//*9357*//*9357*//*9358*/$co/*<9358*/(/*9357*//*9359*/"map/values"/*<9359*/)/*<9357*/(/*9357*//*9361*//*9362*/kv/*<9362*/(/*9361*//*9368*//*9368*//*9369*/tfns/*<9369*/(/*9368*//*9370*//*9370*//*9370*/cons/*<9370*/(/*9370*//*9371*//*9371*//*9372*/tmap/*<9372*/(/*9371*//*9373*/k/*<9373*/)/*<9371*/(/*9371*//*9374*/v/*<9374*/)/*<9371*/)/*<9370*/(/*9370*//*9370*/nil/*<9370*/)/*<9370*/)/*<9368*/(/*9368*//*9375*//*9376*/tarray/*<9376*/(/*9375*//*9377*/v/*<9377*/)/*<9375*/)/*<9368*/)/*<9361*/)/*<9357*/)/*<5287*/(/*5287*//*5287*//*5287*//*5287*/cons/*<5287*/(/*5287*//*12119*//*12119*//*12120*/$co/*<12120*/(/*12119*//*12121*/"map/keys"/*<12121*/)/*<12119*/(/*12119*//*12123*//*12124*/kv/*<12124*/(/*12123*//*12125*//*12125*//*12126*/tfns/*<12126*/(/*12125*//*12127*//*12127*//*12127*/cons/*<12127*/(/*12127*//*12128*//*12128*//*12129*/tmap/*<12129*/(/*12128*//*12130*/k/*<12130*/)/*<12128*/(/*12128*//*12131*/v/*<12131*/)/*<12128*/)/*<12127*/(/*12127*//*12127*/nil/*<12127*/)/*<12127*/)/*<12125*/(/*12125*//*12132*//*12133*/tarray/*<12133*/(/*12132*//*12134*/k/*<12134*/)/*<12132*/)/*<12125*/)/*<12123*/)/*<12119*/)/*<5287*/(/*5287*//*5287*//*5287*//*5287*/cons/*<5287*/(/*5287*//*9378*//*9378*//*9379*/$co/*<9379*/(/*9378*//*9380*/"set/nil"/*<9380*/)/*<9378*/(/*9378*//*9382*//*9383*/kk/*<9383*/(/*9382*//*9387*//*9388*/tset/*<9388*/(/*9387*//*9389*/k/*<9389*/)/*<9387*/)/*<9382*/)/*<9378*/)/*<5287*/(/*5287*//*5287*//*5287*//*5287*/cons/*<5287*/(/*5287*//*9407*//*9407*//*9408*/$co/*<9408*/(/*9407*//*9409*/"set/add"/*<9409*/)/*<9407*/(/*9407*//*9411*//*9412*/kk/*<9412*/(/*9411*//*9416*//*9416*//*9431*/tfns/*<9431*/(/*9416*//*9432*//*9432*//*9432*/cons/*<9432*/(/*9432*//*9433*//*9434*/tset/*<9434*/(/*9433*//*9435*/k/*<9435*/)/*<9433*/)/*<9432*/(/*9432*//*9432*//*9432*//*9432*/cons/*<9432*/(/*9432*//*9436*/k/*<9436*/)/*<9432*/(/*9432*//*9432*/nil/*<9432*/)/*<9432*/)/*<9432*/)/*<9416*/(/*9416*//*9437*//*9438*/tset/*<9438*/(/*9437*//*9439*/k/*<9439*/)/*<9437*/)/*<9416*/)/*<9411*/)/*<9407*/)/*<5287*/(/*5287*//*5287*//*5287*//*5287*/cons/*<5287*/(/*5287*//*9739*//*9739*//*9740*/$co/*<9740*/(/*9739*//*9741*/"set/has"/*<9741*/)/*<9739*/(/*9739*//*9743*//*9744*/kk/*<9744*/(/*9743*//*9745*//*9745*//*9746*/tfns/*<9746*/(/*9745*//*9747*//*9747*//*9747*/cons/*<9747*/(/*9747*//*9748*//*9749*/tset/*<9749*/(/*9748*//*9750*/k/*<9750*/)/*<9748*/)/*<9747*/(/*9747*//*9747*//*9747*//*9747*/cons/*<9747*/(/*9747*//*9751*/k/*<9751*/)/*<9747*/(/*9747*//*9747*/nil/*<9747*/)/*<9747*/)/*<9747*/)/*<9745*/(/*9745*//*9752*/tbool/*<9752*/)/*<9745*/)/*<9743*/)/*<9739*/)/*<5287*/(/*5287*//*5287*//*5287*//*5287*/cons/*<5287*/(/*5287*//*9440*//*9440*//*9441*/$co/*<9441*/(/*9440*//*9442*/"set/rm"/*<9442*/)/*<9440*/(/*9440*//*9444*//*9445*/kk/*<9445*/(/*9444*//*9446*//*9446*//*9447*/tfns/*<9447*/(/*9446*//*9448*//*9448*//*9448*/cons/*<9448*/(/*9448*//*9449*//*9450*/tset/*<9450*/(/*9449*//*9451*/k/*<9451*/)/*<9449*/)/*<9448*/(/*9448*//*9448*//*9448*//*9448*/cons/*<9448*/(/*9448*//*9452*/k/*<9452*/)/*<9448*/(/*9448*//*9448*/nil/*<9448*/)/*<9448*/)/*<9448*/)/*<9446*/(/*9446*//*9453*//*9454*/tset/*<9454*/(/*9453*//*9455*/k/*<9455*/)/*<9453*/)/*<9446*/)/*<9444*/)/*<9440*/)/*<5287*/(/*5287*//*5287*//*5287*//*5287*/cons/*<5287*/(/*5287*//*9456*//*9456*//*9457*/$co/*<9457*/(/*9456*//*9458*/"set/diff"/*<9458*/)/*<9456*/(/*9456*//*9460*//*9461*/kk/*<9461*/(/*9460*//*9462*//*9462*//*9463*/tfns/*<9463*/(/*9462*//*9464*//*9464*//*9464*/cons/*<9464*/(/*9464*//*9465*//*9466*/tset/*<9466*/(/*9465*//*9467*/k/*<9467*/)/*<9465*/)/*<9464*/(/*9464*//*9464*//*9464*//*9464*/cons/*<9464*/(/*9464*//*9468*//*9469*/tset/*<9469*/(/*9468*//*9470*/k/*<9470*/)/*<9468*/)/*<9464*/(/*9464*//*9464*/nil/*<9464*/)/*<9464*/)/*<9464*/)/*<9462*/(/*9462*//*9471*//*9472*/tset/*<9472*/(/*9471*//*9473*/k/*<9473*/)/*<9471*/)/*<9462*/)/*<9460*/)/*<9456*/)/*<5287*/(/*5287*//*5287*//*5287*//*5287*/cons/*<5287*/(/*5287*//*9474*//*9474*//*9475*/$co/*<9475*/(/*9474*//*9476*/"set/merge"/*<9476*/)/*<9474*/(/*9474*//*9478*//*9479*/kk/*<9479*/(/*9478*//*9480*//*9480*//*9483*/tfns/*<9483*/(/*9480*//*9484*//*9484*//*9484*/cons/*<9484*/(/*9484*//*9485*//*9486*/tset/*<9486*/(/*9485*//*9487*/k/*<9487*/)/*<9485*/)/*<9484*/(/*9484*//*9484*//*9484*//*9484*/cons/*<9484*/(/*9484*//*9488*//*9489*/tset/*<9489*/(/*9488*//*9490*/k/*<9490*/)/*<9488*/)/*<9484*/(/*9484*//*9484*/nil/*<9484*/)/*<9484*/)/*<9484*/)/*<9480*/(/*9480*//*9492*//*9493*/tset/*<9493*/(/*9492*//*9494*/k/*<9494*/)/*<9492*/)/*<9480*/)/*<9478*/)/*<9474*/)/*<5287*/(/*5287*//*5287*//*5287*//*5287*/cons/*<5287*/(/*5287*//*9495*//*9495*//*9496*/$co/*<9496*/(/*9495*//*9497*/"set/to-list"/*<9497*/)/*<9495*/(/*9495*//*9499*//*9500*/kk/*<9500*/(/*9499*//*9501*//*9501*//*9502*/tfns/*<9502*/(/*9501*//*9503*//*9503*//*9503*/cons/*<9503*/(/*9503*//*9504*//*9505*/tset/*<9505*/(/*9504*//*9506*/k/*<9506*/)/*<9504*/)/*<9503*/(/*9503*//*9503*/nil/*<9503*/)/*<9503*/)/*<9501*/(/*9501*//*9507*//*9508*/tarray/*<9508*/(/*9507*//*9509*/k/*<9509*/)/*<9507*/)/*<9501*/)/*<9499*/)/*<9495*/)/*<5287*/(/*5287*//*5287*//*5287*//*5287*/cons/*<5287*/(/*5287*//*9510*//*9510*//*9511*/$co/*<9511*/(/*9510*//*9512*/"set/from-list"/*<9512*/)/*<9510*/(/*9510*//*9514*//*9515*/kk/*<9515*/(/*9514*//*9516*//*9516*//*9517*/tfns/*<9517*/(/*9516*//*9518*//*9518*//*9518*/cons/*<9518*/(/*9518*//*9519*//*9520*/tarray/*<9520*/(/*9519*//*9521*/k/*<9521*/)/*<9519*/)/*<9518*/(/*9518*//*9518*/nil/*<9518*/)/*<9518*/)/*<9516*/(/*9516*//*9522*//*9523*/tset/*<9523*/(/*9522*//*9524*/k/*<9524*/)/*<9522*/)/*<9516*/)/*<9514*/)/*<9510*/)/*<5287*/(/*5287*//*5287*//*5287*//*5287*/cons/*<5287*/(/*5287*//*9525*//*9525*//*9526*/$co/*<9526*/(/*9525*//*9527*/"map/from-list"/*<9527*/)/*<9525*/(/*9525*//*9529*//*9530*/kv/*<9530*/(/*9529*//*9531*//*9531*//*9532*/tfns/*<9532*/(/*9531*//*9533*//*9533*//*9533*/cons/*<9533*/(/*9533*//*9534*//*9535*/tarray/*<9535*/(/*9534*//*9536*//*9536*//*9537*/t$co/*<9537*/(/*9536*//*9538*/k/*<9538*/)/*<9536*/(/*9536*//*9539*/v/*<9539*/)/*<9536*/)/*<9534*/)/*<9533*/(/*9533*//*9533*/nil/*<9533*/)/*<9533*/)/*<9531*/(/*9531*//*9540*//*9540*//*9541*/tmap/*<9541*/(/*9540*//*9542*/k/*<9542*/)/*<9540*/(/*9540*//*9543*/v/*<9543*/)/*<9540*/)/*<9531*/)/*<9529*/)/*<9525*/)/*<5287*/(/*5287*//*5287*//*5287*//*5287*/cons/*<5287*/(/*5287*//*9564*//*9564*//*9565*/$co/*<9565*/(/*9564*//*9566*/"map/to-list"/*<9566*/)/*<9564*/(/*9564*//*9568*//*9569*/kv/*<9569*/(/*9568*//*9570*//*9570*//*9571*/tfns/*<9571*/(/*9570*//*9572*//*9572*//*9572*/cons/*<9572*/(/*9572*//*9573*//*9573*//*9574*/tmap/*<9574*/(/*9573*//*9575*/k/*<9575*/)/*<9573*/(/*9573*//*9576*/v/*<9576*/)/*<9573*/)/*<9572*/(/*9572*//*9572*/nil/*<9572*/)/*<9572*/)/*<9570*/(/*9570*//*9577*//*9580*/tarray/*<9580*/(/*9577*//*9581*//*9581*//*9582*/t$co/*<9582*/(/*9581*//*9583*/k/*<9583*/)/*<9581*/(/*9581*//*9584*/v/*<9584*/)/*<9581*/)/*<9577*/)/*<9570*/)/*<9568*/)/*<9564*/)/*<5287*/(/*5287*//*5287*//*5287*//*5287*/cons/*<5287*/(/*5287*//*9585*//*9585*//*9586*/$co/*<9586*/(/*9585*//*9587*/"jsonify"/*<9587*/)/*<9585*/(/*9585*//*9589*//*9589*//*9590*/generic/*<9590*/(/*9589*//*9591*//*9591*//*9591*/cons/*<9591*/(/*9591*//*9592*/"v"/*<9592*/)/*<9591*/(/*9591*//*9591*/nil/*<9591*/)/*<9591*/)/*<9589*/(/*9589*//*9594*//*9594*//*9595*/tfns/*<9595*/(/*9594*//*9610*//*9610*//*9610*/cons/*<9610*/(/*9610*//*9596*//*9596*//*9597*/tvar/*<9597*/(/*9596*//*9598*/"v"/*<9598*/)/*<9596*/(/*9596*//*9600*/-1/*<9600*/)/*<9596*/)/*<9610*/(/*9610*//*9610*/nil/*<9610*/)/*<9610*/)/*<9594*/(/*9594*//*9601*/tstring/*<9601*/)/*<9594*/)/*<9589*/)/*<9585*/)/*<5287*/(/*5287*//*5287*//*5287*//*5287*/cons/*<5287*/(/*5287*//*9602*//*9602*//*9611*/$co/*<9611*/(/*9602*//*9612*/"valueToString"/*<9612*/)/*<9602*/(/*9602*//*9614*//*9614*//*9615*/generic/*<9615*/(/*9614*//*9616*//*9616*//*9616*/cons/*<9616*/(/*9616*//*9617*/"v"/*<9617*/)/*<9616*/(/*9616*//*9616*/nil/*<9616*/)/*<9616*/)/*<9614*/(/*9614*//*9619*//*9619*//*9620*/tfns/*<9620*/(/*9619*//*9621*//*9621*//*9621*/cons/*<9621*/(/*9621*//*9622*//*9623*/vbl/*<9623*/(/*9622*//*9624*/"v"/*<9624*/)/*<9622*/)/*<9621*/(/*9621*//*9621*/nil/*<9621*/)/*<9621*/)/*<9619*/(/*9619*//*9627*/tstring/*<9627*/)/*<9619*/)/*<9614*/)/*<9602*/)/*<5287*/(/*5287*//*5287*//*5287*//*5287*/cons/*<5287*/(/*5287*//*9628*//*9628*//*9629*/$co/*<9629*/(/*9628*//*9630*/"eval"/*<9630*/)/*<9628*/(/*9628*//*9632*//*9632*//*9633*/generic/*<9633*/(/*9632*//*9635*//*9635*//*9635*/cons/*<9635*/(/*9635*//*9636*/"v"/*<9636*/)/*<9635*/(/*9635*//*9635*/nil/*<9635*/)/*<9635*/)/*<9632*/(/*9632*//*9638*//*9638*//*9639*/tfns/*<9639*/(/*9638*//*9640*//*9640*//*9640*/cons/*<9640*/(/*9640*//*9641*//*9641*//*9642*/tcon/*<9642*/(/*9641*//*9643*/"string"/*<9643*/)/*<9641*/(/*9641*//*9645*/-1/*<9645*/)/*<9641*/)/*<9640*/(/*9640*//*9640*/nil/*<9640*/)/*<9640*/)/*<9638*/(/*9638*//*9646*//*9647*/vbl/*<9647*/(/*9646*//*9648*/"v"/*<9648*/)/*<9646*/)/*<9638*/)/*<9632*/)/*<9628*/)/*<5287*/(/*5287*//*5287*//*5287*//*5287*/cons/*<5287*/(/*5287*//*11819*//*11819*//*11820*/$co/*<11820*/(/*11819*//*11821*/"errorToString"/*<11821*/)/*<11819*/(/*11819*//*11823*//*11823*//*11824*/generic/*<11824*/(/*11823*//*11825*//*11825*//*11825*/cons/*<11825*/(/*11825*//*11826*/"v"/*<11826*/)/*<11825*/(/*11825*//*11825*/nil/*<11825*/)/*<11825*/)/*<11823*/(/*11823*//*11828*//*11828*//*11829*/tfns/*<11829*/(/*11828*//*11830*//*11830*//*11830*/cons/*<11830*/(/*11830*//*11840*//*11840*//*11841*/tfns/*<11841*/(/*11840*//*11842*//*11842*//*11842*/cons/*<11842*/(/*11842*//*11843*//*11845*/vbl/*<11845*/(/*11843*//*11846*/"v"/*<11846*/)/*<11843*/)/*<11842*/(/*11842*//*11842*/nil/*<11842*/)/*<11842*/)/*<11840*/(/*11840*//*11850*/tstring/*<11850*/)/*<11840*/)/*<11830*/(/*11830*//*11830*//*11830*//*11830*/cons/*<11830*/(/*11830*//*11831*//*11855*/vbl/*<11855*/(/*11831*//*11856*/"v"/*<11856*/)/*<11831*/)/*<11830*/(/*11830*//*11830*/nil/*<11830*/)/*<11830*/)/*<11830*/)/*<11828*/(/*11828*//*11836*/tstring/*<11836*/)/*<11828*/)/*<11823*/)/*<11819*/)/*<5287*/(/*5287*//*5287*//*5287*//*5287*/cons/*<5287*/(/*5287*//*9651*//*9651*//*9652*/$co/*<9652*/(/*9651*//*9653*/"sanitize"/*<9653*/)/*<9651*/(/*9651*//*9655*//*9656*/concrete/*<9656*/(/*9655*//*9657*//*9657*//*9658*/tfns/*<9658*/(/*9657*//*9659*//*9659*//*9659*/cons/*<9659*/(/*9659*//*9661*/tstring/*<9661*/)/*<9659*/(/*9659*//*9659*/nil/*<9659*/)/*<9659*/)/*<9657*/(/*9657*//*9662*/tstring/*<9662*/)/*<9657*/)/*<9655*/)/*<9651*/)/*<5287*/(/*5287*//*5287*//*5287*//*5287*/cons/*<5287*/(/*5287*//*9663*//*9663*//*9664*/$co/*<9664*/(/*9663*//*9665*/"replace-all"/*<9665*/)/*<9663*/(/*9663*//*9667*//*9668*/concrete/*<9668*/(/*9667*//*9669*//*9669*//*9670*/tfns/*<9670*/(/*9669*//*9671*//*9671*//*9671*/cons/*<9671*/(/*9671*//*9672*/tstring/*<9672*/)/*<9671*/(/*9671*//*9671*//*9671*//*9671*/cons/*<9671*/(/*9671*//*9673*/tstring/*<9673*/)/*<9671*/(/*9671*//*9671*//*9671*//*9671*/cons/*<9671*/(/*9671*//*10641*/tstring/*<10641*/)/*<9671*/(/*9671*//*9671*/nil/*<9671*/)/*<9671*/)/*<9671*/)/*<9671*/)/*<9669*/(/*9669*//*9674*/tstring/*<9674*/)/*<9669*/)/*<9667*/)/*<9663*/)/*<5287*/(/*5287*//*5287*//*5287*//*5287*/cons/*<5287*/(/*5287*//*9675*//*9675*//*9676*/$co/*<9676*/(/*9675*//*9677*/"fatal"/*<9677*/)/*<9675*/(/*9675*//*9679*//*9679*//*9680*/generic/*<9680*/(/*9679*//*9681*//*9681*//*9681*/cons/*<9681*/(/*9681*//*9682*/"v"/*<9682*/)/*<9681*/(/*9681*//*9681*/nil/*<9681*/)/*<9681*/)/*<9679*/(/*9679*//*9684*//*9684*//*9685*/tfns/*<9685*/(/*9684*//*9686*//*9686*//*9686*/cons/*<9686*/(/*9686*//*9687*/tstring/*<9687*/)/*<9686*/(/*9686*//*9686*/nil/*<9686*/)/*<9686*/)/*<9684*/(/*9684*//*9688*//*9689*/vbl/*<9689*/(/*9688*//*9690*/"v"/*<9690*/)/*<9688*/)/*<9684*/)/*<9679*/)/*<9675*/)/*<5287*/(/*5287*//*5287*/nil/*<5287*/)/*<5287*/)/*<5287*/)/*<5287*/)/*<5287*/)/*<5287*/)/*<5287*/)/*<5287*/)/*<5287*/)/*<5287*/)/*<5287*/)/*<5287*/)/*<5287*/)/*<5287*/)/*<5287*/)/*<5287*/)/*<5287*/)/*<5287*/)/*<5287*/)/*<5287*/)/*<5287*/)/*<5287*/)/*<5287*/)/*<5287*/)/*<5287*/)/*<5287*/)/*<5287*/)/*<5287*/)/*<5287*/)/*<5287*/)/*<5287*/)/*<5287*/)/*<5287*/)/*<5287*/)/*<5287*/)/*<5287*/)/*<5287*/)/*<5287*/)/*<5287*/)/*<5287*/)/*<5282*/)/*<5255*/(/*5255*//*5285*//*11016*/map$slfrom_list/*<11016*/(/*5285*//*11017*//*11017*//*11017*/cons/*<11017*/(/*11017*//*11018*//*11018*//*11019*/$co/*<11019*/(/*11018*//*11020*/"()"/*<11020*/)/*<11018*/(/*11018*//*11022*//*11022*//*11022*//*11023*/tconstructor/*<11023*/(/*11022*//*11024*/set$slnil/*<11024*/)/*<11022*/(/*11022*//*11025*/nil/*<11025*/)/*<11022*/(/*11022*//*11026*//*11026*//*11027*/tcon/*<11027*/(/*11026*//*11028*/"()"/*<11028*/)/*<11026*/(/*11026*//*11030*/-1/*<11030*/)/*<11026*/)/*<11022*/)/*<11018*/)/*<11017*/(/*11017*//*11017*/nil/*<11017*/)/*<11017*/)/*<5285*/)/*<5255*/(/*5255*//*5284*//*14952*/map$slfrom_list/*<14952*/(/*5284*//*14953*//*14953*//*14953*/cons/*<14953*/(/*14953*//*14954*//*14954*//*14955*/$co/*<14955*/(/*14954*//*14956*/"int"/*<14956*/)/*<14954*/(/*14954*//*14958*//*14958*//*14959*/$co/*<14959*/(/*14958*//*14960*/0/*<14960*/)/*<14958*/(/*14958*//*14961*/set$slnil/*<14961*/)/*<14958*/)/*<14954*/)/*<14953*/(/*14953*//*14953*//*14953*//*14953*/cons/*<14953*/(/*14953*//*16209*//*16209*//*16210*/$co/*<16210*/(/*16209*//*16211*/"float"/*<16211*/)/*<16209*/(/*16209*//*16213*//*16213*//*16214*/$co/*<16214*/(/*16213*//*16215*/0/*<16215*/)/*<16213*/(/*16213*//*16216*/set$slnil/*<16216*/)/*<16213*/)/*<16209*/)/*<14953*/(/*14953*//*14953*//*14953*//*14953*/cons/*<14953*/(/*14953*//*14962*//*14962*//*14963*/$co/*<14963*/(/*14962*//*14964*/"string"/*<14964*/)/*<14962*/(/*14962*//*14966*//*14966*//*14967*/$co/*<14967*/(/*14966*//*14968*/0/*<14968*/)/*<14966*/(/*14966*//*14969*/set$slnil/*<14969*/)/*<14966*/)/*<14962*/)/*<14953*/(/*14953*//*14953*//*14953*//*14953*/cons/*<14953*/(/*14953*//*14973*//*14973*//*14974*/$co/*<14974*/(/*14973*//*14975*/"bool"/*<14975*/)/*<14973*/(/*14973*//*14977*//*14977*//*14979*/$co/*<14979*/(/*14977*//*14980*/0/*<14980*/)/*<14977*/(/*14977*//*14981*/set$slnil/*<14981*/)/*<14977*/)/*<14973*/)/*<14953*/(/*14953*//*14953*//*14953*//*14953*/cons/*<14953*/(/*14953*//*15172*//*15172*//*15173*/$co/*<15173*/(/*15172*//*15174*/"map"/*<15174*/)/*<15172*/(/*15172*//*15176*//*15176*//*15177*/$co/*<15177*/(/*15176*//*15178*/2/*<15178*/)/*<15176*/(/*15176*//*15179*/set$slnil/*<15179*/)/*<15176*/)/*<15172*/)/*<14953*/(/*14953*//*14953*//*14953*//*14953*/cons/*<14953*/(/*14953*//*15180*//*15180*//*15181*/$co/*<15181*/(/*15180*//*15182*/"set"/*<15182*/)/*<15180*/(/*15180*//*15184*//*15184*//*15185*/$co/*<15185*/(/*15184*//*15186*/1/*<15186*/)/*<15184*/(/*15184*//*15187*/set$slnil/*<15187*/)/*<15184*/)/*<15180*/)/*<14953*/(/*14953*//*14953*//*14953*//*14953*/cons/*<14953*/(/*14953*//*14982*//*14982*//*14983*/$co/*<14983*/(/*14982*//*14984*/"->"/*<14984*/)/*<14982*/(/*14982*//*14988*//*14988*//*14986*/$co/*<14986*/(/*14988*//*14989*/2/*<14989*/)/*<14988*/(/*14988*//*14987*/set$slnil/*<14987*/)/*<14988*/)/*<14982*/)/*<14953*/(/*14953*//*14953*/nil/*<14953*/)/*<14953*/)/*<14953*/)/*<14953*/)/*<14953*/)/*<14953*/)/*<14953*/)/*<14953*/)/*<5284*/)/*<5255*/(/*5255*//*13334*/map$slnil/*<13334*/)/*<5255*/)/*<5253*/(/*5253*//*5256*//*5256*//*5256*/cons/*<5256*/(/*5256*//*5313*/{"0":",","1":5319,"2":{"0":{"0":"a","1":5320,"type":","},"1":{"0":{"0":"b","1":5321,"type":","},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"3":{"0":{"0":",","1":5323,"2":{"0":{"0":"a","1":5324,"type":"tcon"},"1":{"0":{"0":"b","1":5325,"type":"tcon"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"3":5322,"type":",,,"},"1":{"type":"nil"},"type":"cons"},"4":5316,"type":"sdeftype"}/*<5313*/)/*<5256*/(/*5256*//*5256*//*5256*//*5256*/cons/*<5256*/(/*5256*//*5329*/{"0":",,","1":5335,"2":{"0":{"0":"a","1":5336,"type":","},"1":{"0":{"0":"b","1":5337,"type":","},"1":{"0":{"0":"c","1":5338,"type":","},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"type":"cons"},"3":{"0":{"0":",,","1":5340,"2":{"0":{"0":"a","1":5343,"type":"tcon"},"1":{"0":{"0":"b","1":5344,"type":"tcon"},"1":{"0":{"0":"c","1":5345,"type":"tcon"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"type":"cons"},"3":5339,"type":",,,"},"1":{"type":"nil"},"type":"cons"},"4":5332,"type":"sdeftype"}/*<5329*/)/*<5256*/(/*5256*//*5256*//*5256*//*5256*/cons/*<5256*/(/*5256*//*5346*/{"0":",,,","1":5351,"2":{"0":{"0":"a","1":5352,"type":","},"1":{"0":{"0":"b","1":5353,"type":","},"1":{"0":{"0":"c","1":5354,"type":","},"1":{"0":{"0":"d","1":5355,"type":","},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"type":"cons"},"type":"cons"},"3":{"0":{"0":",,,","1":5357,"2":{"0":{"0":"a","1":5358,"type":"tcon"},"1":{"0":{"0":"b","1":5359,"type":"tcon"},"1":{"0":{"0":"c","1":5360,"type":"tcon"},"1":{"0":{"0":"d","1":5361,"type":"tcon"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"type":"cons"},"type":"cons"},"3":5356,"type":",,,"},"1":{"type":"nil"},"type":"cons"},"4":5348,"type":"sdeftype"}/*<5346*/)/*<5256*/(/*5256*//*5256*//*5256*//*5256*/cons/*<5256*/(/*5256*//*5362*/{"0":",,,,","1":5367,"2":{"0":{"0":"a","1":5368,"type":","},"1":{"0":{"0":"b","1":5369,"type":","},"1":{"0":{"0":"c","1":5370,"type":","},"1":{"0":{"0":"d","1":5371,"type":","},"1":{"0":{"0":"e","1":5372,"type":","},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"type":"cons"},"type":"cons"},"type":"cons"},"3":{"0":{"0":",,,,","1":5374,"2":{"0":{"0":"a","1":5375,"type":"tcon"},"1":{"0":{"0":"b","1":5376,"type":"tcon"},"1":{"0":{"0":"c","1":5377,"type":"tcon"},"1":{"0":{"0":"d","1":5378,"type":"tcon"},"1":{"0":{"0":"e","1":5379,"type":"tcon"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"type":"cons"},"type":"cons"},"type":"cons"},"3":5373,"type":",,,"},"1":{"type":"nil"},"type":"cons"},"4":5364,"type":"sdeftype"}/*<5362*/)/*<5256*/(/*5256*//*5256*//*5256*//*5256*/cons/*<5256*/(/*5256*//*11387*/{"0":"trace-fmt","1":11392,"2":{"0":{"0":"a","1":11393,"type":","},"1":{"type":"nil"},"type":"cons"},"3":{"0":{"0":"tcolor","1":11395,"2":{"0":{"0":"string","1":11396,"type":"tcon"},"1":{"type":"nil"},"type":"cons"},"3":11394,"type":",,,"},"1":{"0":{"0":"tbold","1":11398,"2":{"0":{"0":"bool","1":11399,"type":"tcon"},"1":{"type":"nil"},"type":"cons"},"3":11397,"type":",,,"},"1":{"0":{"0":"titalic","1":11401,"2":{"0":{"0":"bool","1":11402,"type":"tcon"},"1":{"type":"nil"},"type":"cons"},"3":11400,"type":",,,"},"1":{"0":{"0":"tflash","1":11404,"2":{"0":{"0":"bool","1":11405,"type":"tcon"},"1":{"type":"nil"},"type":"cons"},"3":11403,"type":",,,"},"1":{"0":{"0":"ttext","1":11407,"2":{"0":{"0":"string","1":11408,"type":"tcon"},"1":{"type":"nil"},"type":"cons"},"3":11406,"type":",,,"},"1":{"0":{"0":"tval","1":11410,"2":{"0":{"0":"a","1":11411,"type":"tcon"},"1":{"type":"nil"},"type":"cons"},"3":11409,"type":",,,"},"1":{"0":{"0":"tloc","1":11566,"2":{"0":{"0":"int","1":11567,"type":"tcon"},"1":{"type":"nil"},"type":"cons"},"3":11565,"type":",,,"},"1":{"0":{"0":"tnamed","1":11569,"2":{"0":{"0":{"0":"trace-fmt","1":11571,"type":"tcon"},"1":{"0":"a","1":11572,"type":"tcon"},"2":11570,"type":"tapp"},"1":{"type":"nil"},"type":"cons"},"3":11568,"type":",,,"},"1":{"0":{"0":"tfmted","1":11413,"2":{"0":{"0":"a","1":11414,"type":"tcon"},"1":{"0":{"0":"string","1":11415,"type":"tcon"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"3":11412,"type":",,,"},"1":{"0":{"0":"tfmt","1":11417,"2":{"0":{"0":"a","1":11418,"type":"tcon"},"1":{"0":{"0":{"0":{"0":"->","1":-1,"type":"tcon"},"1":{"0":"a","1":11422,"type":"tcon"},"2":-1,"type":"tapp"},"1":{"0":"string","1":11423,"type":"tcon"},"2":-1,"type":"tapp"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"3":11416,"type":",,,"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"type":"cons"},"type":"cons"},"type":"cons"},"type":"cons"},"type":"cons"},"type":"cons"},"type":"cons"},"type":"cons"},"4":11389,"type":"sdeftype"}/*<11387*/)/*<5256*/(/*5256*//*5256*/nil/*<5256*/)/*<5256*/)/*<5256*/)/*<5256*/)/*<5256*/)/*<5256*/)/*<5253*/(/*5253*//*5257*/function name_5257(tenv) { return /*5257*/function name_5257(stmt) { return /*15410*//*15410*//*15411*/tenv$slmerge/*<15411*/(/*15410*//*15412*/tenv/*<15412*/)/*<15410*/(/*15410*//*15413*//*15413*//*15414*/infer_stmtss/*<15414*/(/*15413*//*15415*/tenv/*<15415*/)/*<15413*/(/*15413*//*15416*//*15416*//*15416*/cons/*<15416*/(/*15416*//*15417*/stmt/*<15417*/)/*<15416*/(/*15416*//*15416*/nil/*<15416*/)/*<15416*/)/*<15413*/)/*<15410*/ }/*<5257*/ }/*<5257*/)/*<5253*/
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
return /*6678*//*6678*//*6679*/several/*<6679*/(/*6678*//*11666*//*11666*//*11667*/tenv$slmerge/*<11667*/(/*11666*//*11668*/tenv/*<11668*/)/*<11666*/(/*11666*//*6680*//*6680*//*6681*/infer_stmtss/*<6681*/(/*6680*//*6682*/tenv/*<6682*/)/*<6680*/(/*6680*//*15017*//*15017*//*15017*/cons/*<15017*/(/*15017*//*6683*/one/*<6683*/)/*<15017*/(/*15017*//*15017*/nil/*<15017*/)/*<15017*/)/*<6680*/)/*<11666*/)/*<6678*/(/*6678*//*6687*/rest/*<6687*/)/*<6678*/
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 6659');})(/*!*//*6661*/stmts/*<6661*/)/*<6659*/ }/*<6650*/ }/*<6650*/;

const infer_stmts = /*10723*/function name_10723(tenv) { return /*10723*/function name_10723(stmts) { return /*10730*//*10730*//*10730*//*10731*/foldl/*<10731*/(/*10730*//*10732*/tenv/*<10732*/)/*<10730*/(/*10730*//*10733*/stmts/*<10733*/)/*<10730*/(/*10730*//*10734*/function name_10734(tenv) { return /*10734*/function name_10734(stmt) { return /*15424*//*15424*//*15425*/tenv$slmerge/*<15425*/(/*15424*//*15426*/tenv/*<15426*/)/*<15424*/(/*15424*//*15427*//*15427*//*15428*/infer_stmtss/*<15428*/(/*15427*//*15429*/tenv/*<15429*/)/*<15427*/(/*15427*//*15430*//*15430*//*15430*/cons/*<15430*/(/*15430*//*15431*/stmt/*<15431*/)/*<15430*/(/*15430*//*15430*/nil/*<15430*/)/*<15430*/)/*<15427*/)/*<15424*/ }/*<10734*/ }/*<10734*/)/*<10730*/ }/*<10723*/ }/*<10723*/;

return /*11773*//*11778*//*11779*/eval/*<11779*/(/*11778*//*11775*/"({0: {0: env_nil, 1: infer_stmts,  2: add_stmt,  3: infer},\n  1: {0: externals_stmt, 1: externals_expr, 2: names},\n  2: type_to_string, 3: get_type\n }) => ({type: 'fns',\n   env_nil, infer_stmts, add_stmt, infer, externals_stmt, externals_expr, names, type_to_string, get_type \n }) "/*<11775*/)/*<11778*/(/*11773*//*4983*//*4983*//*4983*//*4983*//*5008*/typecheck/*<5008*/(/*4983*//*11753*//*11753*//*11753*//*11753*//*11754*/inference/*<11754*/(/*11753*//*11766*/builtin_env/*<11766*/)/*<11753*/(/*11753*//*5010*/infer_stmtss/*<5010*/)/*<11753*/(/*11753*//*11765*/tenv$slmerge/*<11765*/)/*<11753*/(/*11753*//*5011*/infer/*<5011*/)/*<11753*/)/*<4983*/(/*4983*//*11755*//*11755*//*11755*//*7376*/analysis/*<7376*/(/*11755*//*11756*/externals_stmt/*<11756*/)/*<11755*/(/*11755*//*15633*/externals_list/*<15633*/)/*<11755*/(/*11755*//*7573*/names/*<7573*/)/*<11755*/)/*<4983*/(/*4983*//*11764*/type_to_string/*<11764*/)/*<4983*/(/*4983*//*10087*/function name_10087(tenv) { return /*10087*/function name_10087(name) { return /*10103*/(function match_10103($target) {
if ($target.type === "some") {
{
let v = $target[0];
return /*10113*//*10114*/some/*<10114*/(/*10113*//*10115*//*10116*/scheme$sltype/*<10116*/(/*10115*//*10117*/v/*<10117*/)/*<10115*/)/*<10113*/
}
}
return /*10119*/none/*<10119*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 10103');})(/*!*//*10105*//*10105*//*10106*/tenv$sltype/*<10106*/(/*10105*//*10107*/tenv/*<10107*/)/*<10105*/(/*10105*//*10108*/name/*<10108*/)/*<10105*/)/*<10103*/ }/*<10087*/ }/*<10087*/)/*<4983*/)/*<11773*/