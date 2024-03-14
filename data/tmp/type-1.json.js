const eprim = (v0) => (v1) => ({type: "eprim", 0: v0, 1: v1});
const estr = (v0) => (v1) => (v2) => ({type: "estr", 0: v0, 1: v1, 2: v2});
const evar = (v0) => (v1) => ({type: "evar", 0: v0, 1: v1});
const equot = (v0) => (v1) => ({type: "equot", 0: v0, 1: v1});
const equotquot = (v0) => (v1) => ({type: "equotquot", 0: v0, 1: v1});
const elambda = (v0) => (v1) => (v2) => (v3) => ({type: "elambda", 0: v0, 1: v1, 2: v2, 3: v3});
const eapp = (v0) => (v1) => (v2) => ({type: "eapp", 0: v0, 1: v1, 2: v2});
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
const sdeftype = (v0) => (v1) => (v2) => ({type: "sdeftype", 0: v0, 1: v1, 2: v2});
const sdef = (v0) => (v1) => (v2) => ({type: "sdef", 0: v0, 1: v1, 2: v2});
const sexpr = (v0) => (v1) => ({type: "sexpr", 0: v0, 1: v1});
const type_to_string = /*2099*/(t) => /*2105*/(($target) => {
if ($target.type === "tvar") {
{
let s = $target[0];
return /*2113*/s/*<2113*/
}
}
if ($target.type === "tcon") {
{
let s = $target[0];
return /*2118*/s/*<2118*/
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
return /*2132*/`(${/*2134*//*2136*/type_to_string/*<2136*/(/*2134*//*2137*/a/*<2137*/)/*<2134*/}) -> ${/*2138*//*2140*/type_to_string/*<2140*/(/*2138*//*2141*/b/*<2141*/)/*<2138*/}`/*<2132*/
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
return /*2148*/`(${/*2150*//*2152*/type_to_string/*<2152*/(/*2150*//*2153*/a/*<2153*/)/*<2150*/} ${/*2154*//*2156*/type_to_string/*<2156*/(/*2154*//*2157*/b/*<2157*/)/*<2154*/})`/*<2148*/
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 2105');})(/*!*//*2107*/t/*<2107*/)/*<2105*//*<2099*/;

const map = /*1005*/(values) => /*1005*/(f) => /*1012*/(($target) => {
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
throw new Error('failed to match ' + jsonify($target) + '. Loc: 1012');})(/*!*//*1014*/values/*<1014*/)/*<1012*//*<1005*//*<1005*/;

const mapi = /*1034*/(i) => /*1034*/(values) => /*1034*/(f) => /*1042*/(($target) => {
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
throw new Error('failed to match ' + jsonify($target) + '. Loc: 1042');})(/*!*//*1044*/values/*<1044*/)/*<1042*//*<1034*//*<1034*//*<1034*/;

const zip = /*3516*/(one) => /*3516*/(two) => /*3523*/(($target) => {
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
throw new Error('failed to match ' + jsonify($target) + '. Loc: 3523');})(/*!*//*3525*//*3525*//*3526*/$co/*<3526*/(/*3525*//*3527*/one/*<3527*/)/*<3525*/(/*3525*//*3528*/two/*<3528*/)/*<3525*/)/*<3523*//*<3516*//*<3516*/;

const foldl = /*1069*/(init) => /*1069*/(items) => /*1069*/(f) => /*1077*/(($target) => {
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
throw new Error('failed to match ' + jsonify($target) + '. Loc: 1077');})(/*!*//*1079*/items/*<1079*/)/*<1077*//*<1069*//*<1069*//*<1069*/;

const foldr = /*1106*/(init) => /*1106*/(items) => /*1106*/(f) => /*1114*/(($target) => {
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
throw new Error('failed to match ' + jsonify($target) + '. Loc: 1114');})(/*!*//*1116*/items/*<1116*/)/*<1114*//*<1106*//*<1106*//*<1106*/;

const map_without = /*2665*/(map) => /*2665*/(set) => /*2672*//*2672*//*2672*//*2673*/foldr/*<2673*/(/*2672*//*2674*/map/*<2674*/)/*<2672*/(/*2672*//*2675*//*2676*/set$slto_list/*<2676*/(/*2675*//*2678*/set/*<2678*/)/*<2675*/)/*<2672*/(/*2672*//*2679*/map$slrm/*<2679*/)/*<2672*//*<2665*//*<2665*/;

const scheme = (v0) => (v1) => ({type: "scheme", 0: v0, 1: v1});
const tconstructor = (v0) => (v1) => (v2) => ({type: "tconstructor", 0: v0, 1: v1, 2: v2});
const tenv = (v0) => (v1) => (v2) => ({type: "tenv", 0: v0, 1: v1, 2: v2});
const tenv$sltype = /*3270*/($fn_arg) => /*3270*/(($target) => {
if ($target.type === "tenv") {
{
let types = $target[0];
return /*3270*/(key) => /*3281*//*3281*//*3282*/map$slget/*<3282*/(/*3281*//*3283*/types/*<3283*/)/*<3281*/(/*3281*//*3284*/key/*<3284*/)/*<3281*//*<3270*/
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 3270');})(/*!*//*-1*/$fn_arg/*<-1*/)/*<3270*//*<3270*/;

const tenv$slcon = /*3285*/($fn_arg) => /*3285*/(($target) => {
if ($target.type === "tenv") {
{
let cons = $target[1];
return /*3285*/(key) => /*3296*//*3296*//*3297*/map$slget/*<3297*/(/*3296*//*3298*/cons/*<3298*/)/*<3296*/(/*3296*//*3299*/key/*<3299*/)/*<3296*//*<3285*/
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 3285');})(/*!*//*-1*/$fn_arg/*<-1*/)/*<3285*//*<3285*/;

const tenv$slnames = /*3300*/($fn_arg) => /*3300*/(($target) => {
if ($target.type === "tenv") {
{
let names = $target[2];
return /*3300*/(key) => /*3311*//*3311*//*3312*/map$slget/*<3312*/(/*3311*//*3313*/names/*<3313*/)/*<3311*/(/*3311*//*3314*/key/*<3314*/)/*<3311*//*<3300*/
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 3300');})(/*!*//*-1*/$fn_arg/*<-1*/)/*<3300*//*<3300*/;

const tenv$slrm = /*926*/($fn_arg) => /*926*/(($target) => {
if ($target.type === "tenv") {
{
let types = $target[0];
{
let cons = $target[1];
{
let names = $target[2];
return /*926*/($var) => /*3319*//*3319*//*3319*//*3320*/tenv/*<3320*/(/*3319*//*981*//*981*//*982*/map$slrm/*<982*/(/*981*//*983*/types/*<983*/)/*<981*/(/*981*//*984*/$var/*<984*/)/*<981*/)/*<3319*/(/*3319*//*3321*/cons/*<3321*/)/*<3319*/(/*3319*//*3322*/names/*<3322*/)/*<3319*//*<926*/
}
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 926');})(/*!*//*-1*/$fn_arg/*<-1*/)/*<926*//*<926*/;

const tenv$slset_type = /*3336*/($fn_arg) => /*3336*/(($target) => {
if ($target.type === "tenv") {
{
let types = $target[0];
{
let cons = $target[1];
{
let names = $target[2];
return /*3336*/(k) => /*3336*/(v) => /*3348*//*3348*//*3348*//*3349*/tenv/*<3349*/(/*3348*//*3350*//*3350*//*3350*//*3351*/map$slset/*<3351*/(/*3350*//*3352*/types/*<3352*/)/*<3350*/(/*3350*//*3353*/k/*<3353*/)/*<3350*/(/*3350*//*3354*/v/*<3354*/)/*<3350*/)/*<3348*/(/*3348*//*3355*/cons/*<3355*/)/*<3348*/(/*3348*//*3356*/names/*<3356*/)/*<3348*//*<3336*//*<3336*/
}
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 3336');})(/*!*//*-1*/$fn_arg/*<-1*/)/*<3336*//*<3336*/;

const type_free = /*754*/(type) => /*761*/(($target) => {
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
throw new Error('failed to match ' + jsonify($target) + '. Loc: 761');})(/*!*//*763*/type/*<763*/)/*<761*//*<754*/;

const scheme_free = /*888*/($fn_arg) => /*888*/(($target) => {
if ($target.type === "scheme") {
{
let vbls = $target[0];
{
let type = $target[1];
return /*895*//*895*//*900*/set$sldiff/*<900*/(/*895*//*901*//*902*/type_free/*<902*/(/*901*//*903*/type/*<903*/)/*<901*/)/*<895*/(/*895*//*904*/vbls/*<904*/)/*<895*/
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 888');})(/*!*//*-1*/$fn_arg/*<-1*/)/*<888*//*<888*/;

const tenv_free = /*985*/($fn_arg) => /*985*/(($target) => {
if ($target.type === "tenv") {
{
let types = $target[0];
return /*991*//*991*//*991*//*992*/foldr/*<992*/(/*991*//*994*/set$slnil/*<994*/)/*<991*/(/*991*//*995*//*995*//*996*/map/*<996*/(/*995*//*998*//*999*/map$slvalues/*<999*/(/*998*//*1000*/types/*<1000*/)/*<998*/)/*<995*/(/*995*//*1135*/scheme_free/*<1135*/)/*<995*/)/*<991*/(/*991*//*1169*/set$slmerge/*<1169*/)/*<991*/
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 985');})(/*!*//*-1*/$fn_arg/*<-1*/)/*<985*//*<985*/;

const type_apply = /*839*/(subst) => /*839*/(type) => /*847*/(($target) => {
if ($target.type === "tvar") {
{
let n = $target[0];
return /*854*/(($target) => {
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
throw new Error('failed to match ' + jsonify($target) + '. Loc: 847');})(/*!*//*849*/type/*<849*/)/*<847*//*<839*//*<839*/;

const scheme_apply = /*905*/(subst) => /*905*/($fn_arg) => /*905*/(($target) => {
if ($target.type === "scheme") {
{
let vbls = $target[0];
{
let type = $target[1];
return /*915*//*915*//*917*/scheme/*<917*/(/*915*//*918*/vbls/*<918*/)/*<915*/(/*915*//*919*//*919*//*920*/type_apply/*<920*/(/*919*//*921*//*921*//*922*/map_without/*<922*/(/*921*//*923*/subst/*<923*/)/*<921*/(/*921*//*924*/vbls/*<924*/)/*<921*/)/*<919*/(/*919*//*925*/type/*<925*/)/*<919*/)/*<915*/
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 905');})(/*!*//*-1*/$fn_arg/*<-1*/)/*<905*//*<905*//*<905*/;

const tenv_apply = /*1170*/(subst) => /*1170*/($fn_arg) => /*1170*/(($target) => {
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
throw new Error('failed to match ' + jsonify($target) + '. Loc: 1170');})(/*!*//*-1*/$fn_arg/*<-1*/)/*<1170*//*<1170*//*<1170*/;

const compose_subst = /*956*/(earlier) => /*956*/(later) => /*963*//*963*//*964*/map$slmerge/*<964*/(/*963*//*965*//*965*//*966*/map$slmap/*<966*/(/*965*//*967*//*968*/type_apply/*<968*/(/*967*//*969*/earlier/*<969*/)/*<967*/)/*<965*/(/*965*//*970*/later/*<970*/)/*<965*/)/*<963*/(/*963*//*971*/earlier/*<971*/)/*<963*//*<956*//*<956*/;

const earlier_subst = /*2692*//*2693*/map$slfrom_list/*<2693*/(/*2692*//*2694*//*2694*//*2694*/cons/*<2694*/(/*2694*//*2695*//*2695*//*2696*/$co/*<2696*/(/*2695*//*2697*/"a"/*<2697*/)/*<2695*/(/*2695*//*2699*//*2699*//*2700*/tcon/*<2700*/(/*2699*//*2701*/"a-mapped"/*<2701*/)/*<2699*/(/*2699*//*2703*/-1/*<2703*/)/*<2699*/)/*<2695*/)/*<2694*/(/*2694*//*2694*//*2694*//*2694*/cons/*<2694*/(/*2694*//*2774*//*2774*//*2775*/$co/*<2775*/(/*2774*//*2776*/"b"/*<2776*/)/*<2774*/(/*2774*//*2778*//*2778*//*2779*/tvar/*<2779*/(/*2778*//*2780*/"c"/*<2780*/)/*<2778*/(/*2778*//*2782*/-1/*<2782*/)/*<2778*/)/*<2774*/)/*<2694*/(/*2694*//*2694*/nil/*<2694*/)/*<2694*/)/*<2694*/)/*<2692*/;

const generalize = /*1186*/(tenv) => /*1186*/(t) => /*1193*//*1193*//*1194*/scheme/*<1194*/(/*1193*//*1195*//*1195*//*1196*/set$sldiff/*<1196*/(/*1195*//*1197*//*1198*/type_free/*<1198*/(/*1197*//*1199*/t/*<1199*/)/*<1197*/)/*<1195*/(/*1195*//*1200*//*1201*/tenv_free/*<1201*/(/*1200*//*1202*/tenv/*<1202*/)/*<1200*/)/*<1195*/)/*<1193*/(/*1193*//*1203*/t/*<1203*/)/*<1193*//*<1186*//*<1186*/;

const new_type_var = /*1731*/(prefix) => /*1731*/(nidx) => /*1739*//*1739*//*1740*/$co/*<1740*/(/*1739*//*2074*//*2074*//*2075*/tvar/*<2075*/(/*2074*//*1741*/`${/*1743*/prefix/*<1743*/}:${/*1745*/nidx/*<1745*/}`/*<1741*/)/*<2074*/(/*2074*//*2076*/-1/*<2076*/)/*<2074*/)/*<1739*/(/*1739*//*1759*//*1759*//*1761*/$pl/*<1761*/(/*1759*//*1762*/1/*<1762*/)/*<1759*/(/*1759*//*1747*/nidx/*<1747*/)/*<1759*/)/*<1739*//*<1731*//*<1731*/;

const make_subst_for_vars = /*1212*/(vars) => /*1212*/(coll) => /*1212*/(nidx) => /*1219*/(($target) => {
if ($target.type === "nil") {
return /*1223*//*1223*//*1224*/$co/*<1224*/(/*1223*//*1225*/coll/*<1225*/)/*<1223*/(/*1223*//*1226*/nidx/*<1226*/)/*<1223*/
}
if ($target.type === "cons") {
{
let v = $target[0];
{
let rest = $target[1];
return /*1748*/(() => {const $target = /*1755*//*1755*//*1756*/new_type_var/*<1756*/(/*1755*//*1757*/v/*<1757*/)/*<1755*/(/*1755*//*1758*/nidx/*<1758*/)/*<1755*/;
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
throw new Error('failed to match ' + jsonify($target) + '. Loc: 1219');})(/*!*//*1221*/vars/*<1221*/)/*<1219*//*<1212*//*<1212*//*<1212*/;

const instantiate = /*1136*/($fn_arg) => /*1136*/(($target) => {
if ($target.type === "scheme") {
{
let vars = $target[0];
{
let t = $target[1];
return /*1136*/(nidx) => /*1211*/(() => {const $target = /*1290*//*1290*//*1290*//*1291*/make_subst_for_vars/*<1291*/(/*1290*//*2036*//*2037*/set$slto_list/*<2037*/(/*2036*//*1298*/vars/*<1298*/)/*<2036*/)/*<1290*/(/*1290*//*1300*/map$slnil/*<1300*/)/*<1290*/(/*1290*//*1301*/nidx/*<1301*/)/*<1290*/;
if ($target.type === ",") {
{
let subst = $target[0];
{
let nidx = $target[1];
return /*1302*//*1302*//*1302*//*1303*/$co$co/*<1303*/(/*1302*//*1304*//*1304*//*1305*/type_apply/*<1305*/(/*1304*//*1306*/subst/*<1306*/)/*<1304*/(/*1304*//*1307*/t/*<1307*/)/*<1304*/)/*<1302*/(/*1302*//*3495*/subst/*<3495*/)/*<1302*/(/*1302*//*1308*/nidx/*<1308*/)/*<1302*/
}
}
};
throw new Error('let pattern not matched 1285. ' + valueToString($target));})(/*!*/)/*<1211*//*<1136*/
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 1136');})(/*!*//*-1*/$fn_arg/*<-1*/)/*<1136*//*<1136*/;

const unify = /*1309*/(t1) => /*1309*/(t2) => /*1309*/(nidx) => /*1317*/(($target) => {
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
return /*1326*/(() => {const $target = /*1481*//*1481*//*1481*//*1482*/unify/*<1482*/(/*1481*//*1483*/target_1/*<1483*/)/*<1481*/(/*1481*//*1484*/target_2/*<1484*/)/*<1481*/(/*1481*//*1499*/nidx/*<1499*/)/*<1481*/;
if ($target.type === ",") {
{
let target_subst = $target[0];
{
let nidx = $target[1];
return /*1326*/(() => {const $target = /*1489*//*1489*//*1489*//*1490*/unify/*<1490*/(/*1489*//*1491*//*1491*//*1492*/type_apply/*<1492*/(/*1491*//*1493*/target_subst/*<1493*/)/*<1491*/(/*1491*//*1494*/arg_1/*<1494*/)/*<1491*/)/*<1489*/(/*1489*//*1495*//*1495*//*1496*/type_apply/*<1496*/(/*1495*//*1497*/target_subst/*<1497*/)/*<1495*/(/*1495*//*1498*/arg_2/*<1498*/)/*<1495*/)/*<1489*/(/*1489*//*1500*/nidx/*<1500*/)/*<1489*/;
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
return /*1541*/(($target) => {
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
return /*1554*//*1555*/fatal/*<1555*/(/*1554*//*1556*/`cant unify ${/*1558*//*1560*/type_to_string/*<1560*/(/*1558*//*1561*/t1/*<1561*/)/*<1558*/} and ${/*1562*//*1564*/type_to_string/*<1564*/(/*1562*//*1566*/t2/*<1566*/)/*<1562*/}`/*<1556*/)/*<1554*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 1317');})(/*!*//*1319*//*1319*//*1320*/$co/*<1320*/(/*1319*//*1321*/t1/*<1321*/)/*<1319*/(/*1319*//*1322*/t2/*<1322*/)/*<1319*/)/*<1317*//*<1309*//*<1309*//*<1309*/;

const var_bind = /*1567*/($var) => /*1567*/(type) => /*1575*/(($target) => {
if ($target.type === "tvar") {
{
let v = $target[0];
return /*1582*/(($target) => {
if ($target === true) {
return /*1588*/map$slnil/*<1588*/
}
return /*1592*//*1592*//*1592*//*1617*/map$slset/*<1617*/(/*1592*//*1618*/map$slnil/*<1618*/)/*<1592*/(/*1592*//*1619*/$var/*<1619*/)/*<1592*/(/*1592*//*1620*/type/*<1620*/)/*<1592*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 1582');})(/*!*//*1584*//*1584*//*1585*/$eq/*<1585*/(/*1584*//*1586*/$var/*<1586*/)/*<1584*/(/*1584*//*1587*/v/*<1587*/)/*<1584*/)/*<1582*/
}
}
return /*1597*/(($target) => {
if ($target === true) {
return /*1605*//*1606*/fatal/*<1606*/(/*1605*//*1607*/"occurs check"/*<1607*/)/*<1605*/
}
return /*1614*//*1614*//*1614*//*1610*/map$slset/*<1610*/(/*1614*//*1611*/map$slnil/*<1611*/)/*<1614*/(/*1614*//*1612*/$var/*<1612*/)/*<1614*/(/*1614*//*1613*/type/*<1613*/)/*<1614*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 1597');})(/*!*//*1599*//*1599*//*1600*/set$slhas/*<1600*/(/*1599*//*1601*//*1602*/type_free/*<1602*/(/*1601*//*1603*/type/*<1603*/)/*<1601*/)/*<1599*/(/*1599*//*1604*/$var/*<1604*/)/*<1599*/)/*<1597*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 1575');})(/*!*//*1577*/type/*<1577*/)/*<1575*//*<1567*//*<1567*/;

const t_prim = /*1627*/(prim) => /*1633*/(($target) => {
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
throw new Error('failed to match ' + jsonify($target) + '. Loc: 1633');})(/*!*//*1635*/prim/*<1635*/)/*<1633*//*<1627*/;

const tfn = /*1865*/(a) => /*1865*/(b) => /*1865*/(l) => /*1873*//*1873*//*1873*//*1874*/tapp/*<1874*/(/*1873*//*1875*//*1875*//*1875*//*1876*/tapp/*<1876*/(/*1875*//*1877*//*1877*//*1878*/tcon/*<1878*/(/*1877*//*1879*/"->"/*<1879*/)/*<1877*/(/*1877*//*1881*/l/*<1881*/)/*<1877*/)/*<1875*/(/*1875*//*1882*/a/*<1882*/)/*<1875*/(/*1875*//*1886*/l/*<1886*/)/*<1875*/)/*<1873*/(/*1873*//*1887*/b/*<1887*/)/*<1873*/(/*1873*//*1888*/l/*<1888*/)/*<1873*//*<1865*//*<1865*//*<1865*/;

const t_expr = /*1654*/(tenv) => /*1654*/(expr) => /*1654*/(nidx) => /*1664*/(($target) => {
if ($target.type === "evar") {
{
let name = $target[0];
{
let l = $target[1];
return /*1671*/(($target) => {
if ($target.type === "none") {
return /*1680*//*1681*/fatal/*<1681*/(/*1680*//*1682*/`Unbound variable ${/*1684*/name/*<1684*/}`/*<1682*/)/*<1680*/
}
if ($target.type === "some") {
{
let found = $target[0];
return /*1690*/(() => {const $target = /*1697*//*1697*//*1698*/instantiate/*<1698*/(/*1697*//*1699*/found/*<1699*/)/*<1697*/(/*1697*//*1700*/nidx/*<1700*/)/*<1697*/;
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
if ($target.type === "eprim") {
{
let prim = $target[0];
return /*1710*//*1710*//*1710*//*1711*/$co$co/*<1711*/(/*1710*//*1723*/map$slnil/*<1723*/)/*<1710*/(/*1710*//*1712*//*1713*/t_prim/*<1713*/(/*1712*//*1714*/prim/*<1714*/)/*<1712*/)/*<1710*/(/*1710*//*1715*/nidx/*<1715*/)/*<1710*/
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
return /*1722*/(() => {const $target = /*1730*//*1730*//*1763*/new_type_var/*<1763*/(/*1730*//*1764*/name/*<1764*/)/*<1730*/(/*1730*//*1765*/nidx/*<1765*/)/*<1730*/;
if ($target.type === ",") {
{
let arg_type = $target[0];
{
let nidx = $target[1];
return /*1722*/(() => {const $target = /*1773*//*1773*//*1773*//*1774*/tenv$slset_type/*<1774*/(/*1773*//*1775*/tenv/*<1775*/)/*<1773*/(/*1773*//*1779*/name/*<1779*/)/*<1773*/(/*1773*//*1780*//*1780*//*1781*/scheme/*<1781*/(/*1780*//*1782*/set$slnil/*<1782*/)/*<1780*/(/*1780*//*1783*/arg_type/*<1783*/)/*<1780*/)/*<1773*/;
{
let env_with_name = $target;
return /*1722*/(() => {const $target = /*1789*//*1789*//*1789*//*1790*/t_expr/*<1790*/(/*1789*//*1791*/env_with_name/*<1791*/)/*<1789*/(/*1789*//*1792*/body/*<1792*/)/*<1789*/(/*1789*//*2068*/nidx/*<2068*/)/*<1789*/;
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
return /*1816*/(() => {const $target = /*1823*//*1823*//*1824*/new_type_var/*<1824*/(/*1823*//*1825*/"a"/*<1825*/)/*<1823*/(/*1823*//*1827*/nidx/*<1827*/)/*<1823*/;
if ($target.type === ",") {
{
let result_var = $target[0];
{
let nidx = $target[1];
return /*1816*/(() => {const $target = /*1833*//*1833*//*1833*//*1834*/t_expr/*<1834*/(/*1833*//*1835*/tenv/*<1835*/)/*<1833*/(/*1833*//*1836*/target/*<1836*/)/*<1833*/(/*1833*//*1850*/nidx/*<1850*/)/*<1833*/;
if ($target.type === ",,") {
{
let target_subst = $target[0];
{
let target_type = $target[1];
{
let nidx = $target[2];
return /*1816*/(() => {const $target = /*1842*//*1842*//*1842*//*1843*/t_expr/*<1843*/(/*1842*//*1844*//*1844*//*1845*/tenv_apply/*<1845*/(/*1844*//*1846*/target_subst/*<1846*/)/*<1844*/(/*1844*//*1847*/tenv/*<1847*/)/*<1844*/)/*<1842*/(/*1842*//*1848*/arg/*<1848*/)/*<1842*/(/*1842*//*1849*/nidx/*<1849*/)/*<1842*/;
if ($target.type === ",,") {
{
let arg_subst = $target[0];
{
let arg_type = $target[1];
{
let nidx = $target[2];
return /*1816*/(() => {const $target = /*1855*//*1855*//*1855*//*1856*/unify/*<1856*/(/*1855*//*1857*//*1857*//*1858*/type_apply/*<1858*/(/*1857*//*1859*/arg_subst/*<1859*/)/*<1857*/(/*1857*//*1860*/target_type/*<1860*/)/*<1857*/)/*<1855*/(/*1855*//*1861*//*1861*//*1861*//*1890*/tfn/*<1890*/(/*1861*//*1891*/arg_type/*<1891*/)/*<1861*/(/*1861*//*1892*/result_var/*<1892*/)/*<1861*/(/*1861*//*1893*/l/*<1893*/)/*<1861*/)/*<1855*/(/*1855*//*1894*/nidx/*<1894*/)/*<1855*/;
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
if ($target[0].type === "pvar") {
{
let name = $target[0][0];
{
let nl = $target[0][1];
{
let value = $target[1];
{
let body = $target[2];
if ($target[3] === 1) {
return /*1920*/(() => {const $target = /*1928*//*1928*//*1928*//*1929*/t_expr/*<1929*/(/*1928*//*1930*/tenv/*<1930*/)/*<1928*/(/*1928*//*1931*/value/*<1931*/)/*<1928*/(/*1928*//*1932*/nidx/*<1932*/)/*<1928*/;
if ($target.type === ",,") {
{
let value_subst = $target[0];
{
let value_type = $target[1];
{
let nidx = $target[2];
return /*1920*/(() => {const $target = /*1940*//*1940*//*1941*/generalize/*<1941*/(/*1940*//*1942*//*1942*//*1943*/tenv_apply/*<1943*/(/*1942*//*1944*/value_subst/*<1944*/)/*<1942*/(/*1942*//*1945*/tenv/*<1945*/)/*<1942*/)/*<1940*/(/*1940*//*1946*/value_type/*<1946*/)/*<1940*/;
{
let value_scheme = $target;
return /*1920*/(() => {const $target = /*1948*//*1948*//*1948*//*1949*/tenv$slset_type/*<1949*/(/*1948*//*1950*/tenv/*<1950*/)/*<1948*/(/*1948*//*1951*/name/*<1951*/)/*<1948*/(/*1948*//*1952*/value_scheme/*<1952*/)/*<1948*/;
{
let env_with_name = $target;
return /*1920*/(() => {const $target = /*2489*//*2489*//*2490*/tenv_apply/*<2490*/(/*2489*//*2491*/value_subst/*<2491*/)/*<2489*/(/*2489*//*2492*/env_with_name/*<2492*/)/*<2489*/;
{
let e2 = $target;
return /*1920*/(() => {const $target = /*1958*//*1958*//*1958*//*1959*/t_expr/*<1959*/(/*1958*//*1960*/e2/*<1960*/)/*<1958*/(/*1958*//*1966*/body/*<1966*/)/*<1958*/(/*1958*//*1967*/nidx/*<1967*/)/*<1958*/;
if ($target.type === ",,") {
{
let body_subst = $target[0];
{
let body_type = $target[1];
{
let nidx = $target[2];
return /*1968*//*1968*//*1968*//*1969*/$co$co/*<1969*/(/*1968*//*1970*//*1970*//*1971*/compose_subst/*<1971*/(/*1970*//*1972*/body_subst/*<1972*/)/*<1970*/(/*1970*//*1973*/value_subst/*<1973*/)/*<1970*/)/*<1968*/(/*1968*//*1974*/body_type/*<1974*/)/*<1968*/(/*1968*//*1975*/nidx/*<1975*/)/*<1968*/
}
}
}
};
throw new Error('let pattern not matched 1953. ' + valueToString($target));})(/*!*/)/*<1920*/
};
throw new Error('let pattern not matched 2488. ' + valueToString($target));})(/*!*/)/*<1920*/
};
throw new Error('let pattern not matched 1947. ' + valueToString($target));})(/*!*/)/*<1920*/
};
throw new Error('let pattern not matched 1938. ' + valueToString($target));})(/*!*/)/*<1920*/
}
}
}
};
throw new Error('let pattern not matched 1923. ' + valueToString($target));})(/*!*/)/*<1920*/
}
}
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
return /*2348*/(() => {const $target = /*2363*//*2363*//*2363*//*2364*/t_expr/*<2364*/(/*2363*//*2365*/tenv/*<2365*/)/*<2363*/(/*2363*//*2366*/init/*<2366*/)/*<2363*/(/*2363*//*2367*/nidx/*<2367*/)/*<2363*/;
if ($target.type === ",,") {
{
let value_subst = $target[0];
{
let value_type = $target[1];
{
let nidx = $target[2];
return /*2348*/(() => {const $target = /*3184*//*3184*//*3185*/generalize/*<3185*/(/*3184*//*3186*//*3186*//*3187*/tenv_apply/*<3187*/(/*3186*//*3188*/value_subst/*<3188*/)/*<3186*/(/*3186*//*3189*/tenv/*<3189*/)/*<3186*/)/*<3184*/(/*3184*//*3190*/value_type/*<3190*/)/*<3184*/;
{
let init_scheme = $target;
return /*2348*/(() => {const $target = /*2424*//*2424*//*2424*//*2426*/t_pat/*<2426*/(/*2424*//*2427*/tenv/*<2427*/)/*<2424*/(/*2424*//*2428*/pat/*<2428*/)/*<2424*/(/*2424*//*2429*/nidx/*<2429*/)/*<2424*/;
if ($target.type === ",,") {
{
let pat_type = $target[0];
{
let bindings = $target[1];
{
let nidx = $target[2];
return /*2348*/(() => {const $target = /*3787*//*3787*//*3787*//*3788*/foldl/*<3788*/(/*3787*//*3789*/tenv/*<3789*/)/*<3787*/(/*3787*//*3790*//*3791*/map$slto_list/*<3791*/(/*3790*//*3792*/bindings/*<3792*/)/*<3790*/)/*<3787*/(/*3787*//*3793*/(tenv) => /*3793*/($fn_arg) => /*3793*/(($target) => {
if ($target.type === ",") {
{
let name = $target[0];
{
let type = $target[1];
return /*3801*//*3801*//*3801*//*3802*/tenv$slset_type/*<3802*/(/*3801*//*3803*/tenv/*<3803*/)/*<3801*/(/*3801*//*3804*/name/*<3804*/)/*<3801*/(/*3801*//*3805*//*3805*//*3806*/generalize/*<3806*/(/*3805*//*3807*/tenv/*<3807*/)/*<3805*/(/*3805*//*3808*/type/*<3808*/)/*<3805*/)/*<3801*/
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 3793');})(/*!*//*-1*/$fn_arg/*<-1*/)/*<3793*//*<3793*//*<3793*/)/*<3787*/;
{
let bound_env = $target;
return /*2348*/(() => {const $target = /*3656*//*3656*//*3656*//*3657*/unify/*<3657*/(/*3656*//*3658*/value_type/*<3658*/)/*<3656*/(/*3656*//*3659*/pat_type/*<3659*/)/*<3656*/(/*3656*//*3660*/nidx/*<3660*/)/*<3656*/;
if ($target.type === ",") {
{
let unified_subst = $target[0];
{
let nidx = $target[1];
return /*2348*/(() => {const $target = /*2437*//*2437*//*2437*//*2438*/t_expr/*<2438*/(/*2437*//*2439*//*2439*//*2440*/tenv_apply/*<2440*/(/*2439*//*3809*//*3809*//*3810*/compose_subst/*<3810*/(/*3809*//*3811*/unified_subst/*<3811*/)/*<3809*/(/*3809*//*2441*/value_subst/*<2441*/)/*<3809*/)/*<2439*/(/*2439*//*2442*/bound_env/*<2442*/)/*<2439*/)/*<2437*/(/*2437*//*2443*/body/*<2443*/)/*<2437*/(/*2437*//*2444*/nidx/*<2444*/)/*<2437*/;
if ($target.type === ",,") {
{
let body_subst = $target[0];
{
let body_type = $target[1];
{
let nidx = $target[2];
return /*2368*//*2368*//*2368*//*2445*/$co$co/*<2445*/(/*2368*//*2462*//*2462*//*2463*/compose_subst/*<2463*/(/*2462*//*2465*/unified_subst/*<2465*/)/*<2462*/(/*2462*//*2446*//*2446*//*2447*/compose_subst/*<2447*/(/*2446*//*2448*/value_subst/*<2448*/)/*<2446*/(/*2446*//*2449*/body_subst/*<2449*/)/*<2446*/)/*<2462*/)/*<2368*/(/*2368*//*3812*//*3812*//*3813*/type_apply/*<3813*/(/*3812*//*3814*/unified_subst/*<3814*/)/*<3812*/(/*3812*//*2450*/body_type/*<2450*/)/*<3812*/)/*<2368*/(/*2368*//*2451*/nidx/*<2451*/)/*<2368*/
}
}
}
};
throw new Error('let pattern not matched 2430. ' + valueToString($target));})(/*!*/)/*<2348*/
}
}
};
throw new Error('let pattern not matched 3652. ' + valueToString($target));})(/*!*/)/*<2348*/
};
throw new Error('let pattern not matched 3786. ' + valueToString($target));})(/*!*/)/*<2348*/
}
}
}
};
throw new Error('let pattern not matched 2369. ' + valueToString($target));})(/*!*/)/*<2348*/
};
throw new Error('let pattern not matched 3183. ' + valueToString($target));})(/*!*/)/*<2348*/
}
}
}
};
throw new Error('let pattern not matched 2357. ' + valueToString($target));})(/*!*/)/*<2348*/
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
return /*2252*/(() => {const $target = /*2264*//*2264*//*2264*//*2265*/t_expr/*<2265*/(/*2264*//*2266*/tenv/*<2266*/)/*<2264*/(/*2264*//*2267*/target/*<2267*/)/*<2264*/(/*2264*//*2268*/nidx/*<2268*/)/*<2264*/;
if ($target.type === ",,") {
{
let s1 = $target[0];
{
let t1 = $target[1];
{
let nidx = $target[2];
return /*2252*/(() => {const $target = /*2270*//*2270*//*2271*/generalize/*<2271*/(/*2270*//*2272*//*2272*//*2273*/tenv_apply/*<2273*/(/*2272*//*2274*/s1/*<2274*/)/*<2272*/(/*2272*//*2275*/tenv/*<2275*/)/*<2272*/)/*<2270*/(/*2270*//*2276*/t1/*<2276*/)/*<2270*/;
{
let t$qu = $target;
return /*2283*//*2284*/fatal/*<2284*/(/*2283*//*2285*/"nope"/*<2285*/)/*<2283*/
};
throw new Error('let pattern not matched 2269. ' + valueToString($target));})(/*!*/)/*<2252*/
}
}
}
};
throw new Error('let pattern not matched 2259. ' + valueToString($target));})(/*!*/)/*<2252*/
}
}
}
}
return /*2064*//*2065*/fatal/*<2065*/(/*2064*//*2066*/`cannot infer type for ${/*2247*//*2249*/valueToString/*<2249*/(/*2247*//*2250*/expr/*<2250*/)/*<2247*/}`/*<2066*/)/*<2064*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 1664');})(/*!*//*1666*/expr/*<1666*/)/*<1664*//*<1654*//*<1654*//*<1654*/;

const t_pat = /*2466*/(tenv) => /*2466*/(pat) => /*2466*/(nidx) => /*2475*/(($target) => {
if ($target.type === "pvar") {
{
let name = $target[0];
{
let nl = $target[1];
return /*3450*/(() => {const $target = /*2482*//*2482*//*3403*/new_type_var/*<3403*/(/*2482*//*3404*/name/*<3404*/)/*<2482*/(/*2482*//*3405*/nidx/*<3405*/)/*<2482*/;
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
return /*3479*/(() => {const $target = /*3661*/(($target) => {
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
return /*3479*/(() => {const $target = /*3502*//*3502*//*3503*/instantiate/*<3503*/(/*3502*//*3504*//*3504*//*3505*/scheme/*<3505*/(/*3504*//*3506*/free/*<3506*/)/*<3504*/(/*3504*//*3507*/cres/*<3507*/)/*<3504*/)/*<3502*/(/*3502*//*3754*/nidx/*<3754*/)/*<3502*/;
if ($target.type === ",,") {
{
let tres = $target[0];
{
let tsubst = $target[1];
{
let nidx = $target[2];
return /*3479*/(() => {const $target = /*3509*//*3509*//*3510*/map/*<3510*/(/*3509*//*3511*/cargs/*<3511*/)/*<3509*/(/*3509*//*3512*//*3513*/type_apply/*<3513*/(/*3512*//*3514*/tsubst/*<3514*/)/*<3512*/)/*<3509*/;
{
let cargs = $target;
return /*3479*/(() => {const $target = /*3581*//*3581*//*3582*/zip/*<3582*/(/*3581*//*3583*/args/*<3583*/)/*<3581*/(/*3581*//*3584*/cargs/*<3584*/)/*<3581*/;
{
let zipped = $target;
return /*3479*/(() => {const $target = /*3590*//*3590*//*3590*//*3591*/foldl/*<3591*/(/*3590*//*3592*//*3592*//*3592*//*3593*/$co$co/*<3593*/(/*3592*//*3595*/map$slnil/*<3595*/)/*<3592*/(/*3592*//*3596*/map$slnil/*<3596*/)/*<3592*/(/*3592*//*3597*/nidx/*<3597*/)/*<3592*/)/*<3590*/(/*3590*//*3598*/zipped/*<3598*/)/*<3590*/(/*3590*//*3599*/($fn_arg) => /*3599*/(($target) => {
if ($target.type === ",,") {
{
let subst = $target[0];
{
let bindings = $target[1];
{
let nidx = $target[2];
return /*3599*/($fn_arg) => /*3599*/(($target) => {
if ($target.type === ",") {
{
let arg = $target[0];
{
let carg = $target[1];
return /*3611*/(() => {const $target = /*3622*//*3622*//*3622*//*3623*/t_pat/*<3623*/(/*3622*//*3625*/tenv/*<3625*/)/*<3622*/(/*3622*//*3626*/arg/*<3626*/)/*<3622*/(/*3622*//*3627*/nidx/*<3627*/)/*<3622*/;
if ($target.type === ",,") {
{
let pat_type = $target[0];
{
let pat_bind = $target[1];
{
let nidx = $target[2];
return /*3611*/(() => {const $target = /*3637*//*3637*//*3637*//*3638*/unify/*<3638*/(/*3637*//*3639*/pat_type/*<3639*/)/*<3637*/(/*3637*//*3640*/carg/*<3640*/)/*<3637*/(/*3637*//*3755*/nidx/*<3755*/)/*<3637*/;
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
throw new Error('failed to match ' + jsonify($target) + '. Loc: 3599');})(/*!*//*-1*/$fn_arg/*<-1*/)/*<3599*//*<3599*/
}
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 3599');})(/*!*//*-1*/$fn_arg/*<-1*/)/*<3599*//*<3599*/)/*<3590*/;
if ($target.type === ",,") {
{
let subst = $target[0];
{
let bindings = $target[1];
{
let nidx = $target[2];
return /*3492*//*3492*//*3492*//*3493*/$co$co/*<3493*/(/*3492*//*3494*//*3494*//*3645*/type_apply/*<3645*/(/*3494*//*3646*/subst/*<3646*/)/*<3494*/(/*3494*//*3647*/tres/*<3647*/)/*<3494*/)/*<3492*/(/*3492*//*3781*//*3781*//*3782*/map$slmap/*<3782*/(/*3781*//*3644*/bindings/*<3644*/)/*<3781*/(/*3781*//*3783*//*3784*/type_apply/*<3784*/(/*3783*//*3785*/subst/*<3785*/)/*<3783*/)/*<3781*/)/*<3492*/(/*3492*//*3648*/nidx/*<3648*/)/*<3492*/
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
throw new Error('failed to match ' + jsonify($target) + '. Loc: 2475');})(/*!*//*2477*/pat/*<2477*/)/*<2475*//*<2466*//*<2466*//*<2466*/;

const tenv$slnil = /*3361*//*3361*//*3361*//*3362*/tenv/*<3362*/(/*3361*//*3363*/map$slnil/*<3363*/)/*<3361*/(/*3361*//*3364*/map$slnil/*<3364*/)/*<3361*/(/*3361*//*3365*/map$slnil/*<3365*/)/*<3361*/;

const infer = /*1976*/(tenv) => /*1976*/(expr) => /*1984*/(() => {const $target = /*1992*//*1992*//*1992*//*1993*/t_expr/*<1993*/(/*1992*//*1994*/tenv/*<1994*/)/*<1992*/(/*1992*//*1995*/expr/*<1995*/)/*<1992*/(/*1992*//*1996*/0/*<1996*/)/*<1992*/;
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
throw new Error('let pattern not matched 1987. ' + valueToString($target));})(/*!*/)/*<1984*//*<1976*//*<1976*/;

const tint = /*2055*//*2055*//*2056*/tcon/*<2056*/(/*2055*//*2057*/"int"/*<2057*/)/*<2055*/(/*2055*//*2059*/-1/*<2059*/)/*<2055*/;

const basic = /*3374*//*3374*//*3374*//*3375*/tenv/*<3375*/(/*3374*//*3367*//*3368*/map$slfrom_list/*<3368*/(/*3367*//*3366*//*3366*//*3366*/cons/*<3366*/(/*3366*//*2042*//*2042*//*2043*/$co/*<2043*/(/*2042*//*2045*/"+"/*<2045*/)/*<2042*/(/*2042*//*2087*//*2087*//*2088*/scheme/*<2088*/(/*2087*//*2091*/set$slnil/*<2091*/)/*<2087*/(/*2087*//*2047*//*2047*//*2047*//*2048*/tfn/*<2048*/(/*2047*//*2049*/tint/*<2049*/)/*<2047*/(/*2047*//*2094*//*2094*//*2094*//*2095*/tfn/*<2095*/(/*2094*//*2096*/tint/*<2096*/)/*<2094*/(/*2094*//*2061*/tint/*<2061*/)/*<2094*/(/*2094*//*2097*/-1/*<2097*/)/*<2094*/)/*<2047*/(/*2047*//*2062*/-1/*<2062*/)/*<2047*/)/*<2087*/)/*<2042*/)/*<3366*/(/*3366*//*3366*//*3366*//*3366*/cons/*<3366*/(/*3366*//*3369*//*3369*//*3370*/$co/*<3370*/(/*3369*//*3372*/","/*<3372*/)/*<3369*/(/*3369*//*2374*//*2374*//*2375*/scheme/*<2375*/(/*2374*//*2376*//*2380*/set$slfrom_list/*<2380*/(/*2376*//*3225*//*3225*//*3225*/cons/*<3225*/(/*3225*//*2382*/"a"/*<2382*/)/*<3225*/(/*3225*//*3225*//*3225*//*3225*/cons/*<3225*/(/*3225*//*3226*/"b"/*<3226*/)/*<3225*/(/*3225*//*3225*/nil/*<3225*/)/*<3225*/)/*<3225*/)/*<2376*/)/*<2374*/(/*2374*//*2377*//*2377*//*2377*//*2378*/tfn/*<2378*/(/*2377*//*2379*//*2379*//*2384*/tvar/*<2384*/(/*2379*//*2385*/"a"/*<2385*/)/*<2379*/(/*2379*//*2387*/-1/*<2387*/)/*<2379*/)/*<2377*/(/*2377*//*2388*//*2388*//*2388*//*2389*/tfn/*<2389*/(/*2388*//*2390*//*2390*//*2391*/tvar/*<2391*/(/*2390*//*2392*/"b"/*<2392*/)/*<2390*/(/*2390*//*2394*/-1/*<2394*/)/*<2390*/)/*<2388*/(/*2388*//*2402*//*2402*//*2402*//*2403*/tapp/*<2403*/(/*2402*//*2400*//*2400*//*2400*//*2401*/tapp/*<2401*/(/*2400*//*2395*//*2395*//*2396*/tcon/*<2396*/(/*2395*//*2397*/","/*<2397*/)/*<2395*/(/*2395*//*2399*/-1/*<2399*/)/*<2395*/)/*<2400*/(/*2400*//*2404*//*2404*//*2405*/tvar/*<2405*/(/*2404*//*2406*/"a"/*<2406*/)/*<2404*/(/*2404*//*2408*/-1/*<2408*/)/*<2404*/)/*<2400*/(/*2400*//*2409*/-1/*<2409*/)/*<2400*/)/*<2402*/(/*2402*//*2410*//*2410*//*2411*/tvar/*<2411*/(/*2410*//*2412*/"b"/*<2412*/)/*<2410*/(/*2410*//*2414*/-1/*<2414*/)/*<2410*/)/*<2402*/(/*2402*//*2415*/-1/*<2415*/)/*<2402*/)/*<2388*/(/*2388*//*2416*/-1/*<2416*/)/*<2388*/)/*<2377*/(/*2377*//*2417*/-1/*<2417*/)/*<2377*/)/*<2374*/)/*<3369*/)/*<3366*/(/*3366*//*3366*/nil/*<3366*/)/*<3366*/)/*<3366*/)/*<3367*/)/*<3374*/(/*3374*//*3376*//*3676*/map$slfrom_list/*<3676*/(/*3376*//*3677*//*3677*//*3677*/cons/*<3677*/(/*3677*//*3678*//*3678*//*3681*/$co/*<3681*/(/*3678*//*3682*/","/*<3682*/)/*<3678*/(/*3678*//*3684*//*3684*//*3684*//*3685*/tconstructor/*<3685*/(/*3684*//*3686*//*3687*/set$slfrom_list/*<3687*/(/*3686*//*3688*//*3688*//*3688*/cons/*<3688*/(/*3688*//*3689*/"a"/*<3689*/)/*<3688*/(/*3688*//*3688*//*3688*//*3688*/cons/*<3688*/(/*3688*//*3691*/"b"/*<3691*/)/*<3688*/(/*3688*//*3688*/nil/*<3688*/)/*<3688*/)/*<3688*/)/*<3686*/)/*<3684*/(/*3684*//*3693*//*3693*//*3693*/cons/*<3693*/(/*3693*//*3696*//*3696*//*3697*/tvar/*<3697*/(/*3696*//*3698*/"a"/*<3698*/)/*<3696*/(/*3696*//*3700*/-1/*<3700*/)/*<3696*/)/*<3693*/(/*3693*//*3693*//*3693*//*3693*/cons/*<3693*/(/*3693*//*3701*//*3701*//*3702*/tvar/*<3702*/(/*3701*//*3703*/"b"/*<3703*/)/*<3701*/(/*3701*//*3705*/-1/*<3705*/)/*<3701*/)/*<3693*/(/*3693*//*3693*/nil/*<3693*/)/*<3693*/)/*<3693*/)/*<3684*/(/*3684*//*3706*//*3706*//*3706*//*3707*/tapp/*<3707*/(/*3706*//*3708*//*3708*//*3708*//*3709*/tapp/*<3709*/(/*3708*//*3710*//*3710*//*3711*/tcon/*<3711*/(/*3710*//*3712*/","/*<3712*/)/*<3710*/(/*3710*//*3714*/-1/*<3714*/)/*<3710*/)/*<3708*/(/*3708*//*3715*//*3715*//*3716*/tvar/*<3716*/(/*3715*//*3717*/"a"/*<3717*/)/*<3715*/(/*3715*//*3719*/-1/*<3719*/)/*<3715*/)/*<3708*/(/*3708*//*3727*/-1/*<3727*/)/*<3708*/)/*<3706*/(/*3706*//*3720*//*3720*//*3721*/tvar/*<3721*/(/*3720*//*3722*/"b"/*<3722*/)/*<3720*/(/*3720*//*3724*/-1/*<3724*/)/*<3720*/)/*<3706*/(/*3706*//*3726*/-1/*<3726*/)/*<3706*/)/*<3684*/)/*<3678*/)/*<3677*/(/*3677*//*3677*/nil/*<3677*/)/*<3677*/)/*<3376*/)/*<3374*/(/*3374*//*3377*/map$slnil/*<3377*/)/*<3374*/;

return {type: 'fns', basic, compose_subst, earlier_subst, foldl, foldr, generalize, infer, instantiate, make_subst_for_vars, map, map_without, mapi, new_type_var, scheme_apply, scheme_free, t_expr, t_pat, t_prim, tenv$slcon, tenv$slnames, tenv$slnil, tenv$slrm, tenv$slset_type, tenv$sltype, tenv_apply, tenv_free, tfn, tint, type_apply, type_free, type_to_string, unify, var_bind, zip}