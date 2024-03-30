const cst$sllist = (v0) => (v1) => ({type: "cst/list", 0: v0, 1: v1});
const cst$slarray = (v0) => (v1) => ({type: "cst/array", 0: v0, 1: v1});
const cst$slspread = (v0) => (v1) => ({type: "cst/spread", 0: v0, 1: v1});
const cst$slidentifier = (v0) => (v1) => ({type: "cst/identifier", 0: v0, 1: v1});
const cst$slstring = (v0) => (v1) => (v2) => ({type: "cst/string", 0: v0, 1: v1, 2: v2});
const nil = ({type: "nil"});
const cons = (v0) => (v1) => ({type: "cons", 0: v0, 1: v1});
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
const enumId = /*154*/function name_154(num) { return /*159*/`v${/*161*//*162*/int_to_string/*<162*/(/*161*//*163*/num/*<163*/)/*<161*/}`/*<159*/ }/*<154*/;

const star = ({type: "star"});
const kfun = (v0) => (v1) => ({type: "kfun", 0: v0, 1: v1});
const tyvar = (v0) => (v1) => ({type: "tyvar", 0: v0, 1: v1});
const tvar = (v0) => (v1) => ({type: "tvar", 0: v0, 1: v1});
const tapp = (v0) => (v1) => (v2) => ({type: "tapp", 0: v0, 1: v1, 2: v2});
const tcon = (v0) => (v1) => ({type: "tcon", 0: v0, 1: v1});
const tgen = (v0) => (v1) => ({type: "tgen", 0: v0, 1: v1});
const tycon = (v0) => (v1) => ({type: "tycon", 0: v0, 1: v1});
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

const nullSubst = /*426*/nil/*<426*/;

const $bar_$gt = /*427*/function name_427(u) { return /*427*/function name_427(t) { return /*434*//*434*//*434*//*435*/map$slset/*<435*/(/*434*//*526*/map$slnil/*<526*/)/*<434*/(/*434*//*436*/u/*<436*/)/*<434*/(/*434*//*437*/t/*<437*/)/*<434*/ }/*<427*/ }/*<427*/;

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
return /*1109*/`${/*1111*/name/*<1111*/} : ${/*1116*//*1113*/kind_$gts/*<1113*/(/*1116*//*1117*/kind/*<1117*/)/*<1116*/}`/*<1109*/
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 1100');})(/*!*//*-1*/$fn_arg/*<-1*/)/*<1100*/ }/*<1100*/;

const $eq$gt = (v0) => (v1) => ({type: "=>", 0: v0, 1: v1});
const isin = (v0) => (v1) => ({type: "isin", 0: v0, 1: v1});
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

const defined = /*7013*/function name_7013(opt) { return /*7019*/(function match_7019($target) {
if ($target.type === "some") {
return /*7026*/true/*<7026*/
}
return /*7028*/false/*<7028*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 7019');})(/*!*//*7022*/opt/*<7022*/)/*<7019*/ }/*<7013*/;

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

const compose_transformers = /*7093*/function name_7093(one) { return /*7093*/function name_7093(two) { return /*7093*/function name_7093(ce) { return /*7101*//*7102*/two/*<7102*/(/*7101*//*7103*//*7104*/one/*<7104*/(/*7103*//*7105*/ce/*<7105*/)/*<7103*/)/*<7101*/ }/*<7093*/ }/*<7093*/ }/*<7093*/;

const not = /*7364*/function name_7364(v) { return /*7370*/(function match_7370($target) {
if ($target === true) {
return /*7373*/false/*<7373*/
}
return /*7374*/true/*<7374*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 7370');})(/*!*//*7372*/v/*<7372*/)/*<7370*/ }/*<7364*/;

const map$slhas = /*7375*/function name_7375(map) { return /*7375*/function name_7375(key) { return /*7385*/(function match_7385($target) {
if ($target.type === "some") {
return /*7394*/true/*<7394*/
}
return /*7396*/false/*<7396*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 7385');})(/*!*//*7387*//*7387*//*7388*/map$slget/*<7388*/(/*7387*//*7389*/map/*<7389*/)/*<7387*/(/*7387*//*7390*/key/*<7390*/)/*<7387*/)/*<7385*/ }/*<7375*/ }/*<7375*/;

const some = (v0) => ({type: "some", 0: v0});
const none = ({type: "none"});
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

const ok = (v0) => ({type: "ok", 0: v0});
const err = (v0) => ({type: "err", 0: v0});
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

const forall = (v0) => (v1) => ({type: "forall", 0: v0, 1: v1});
const to_scheme = /*8643*/function name_8643(t) { return /*8740*//*8740*//*8741*/forall/*<8741*/(/*8740*//*8742*/nil/*<8742*/)/*<8740*/(/*8740*//*8743*//*8743*//*8744*/$eq$gt/*<8744*/(/*8743*//*8745*/nil/*<8745*/)/*<8743*/(/*8743*//*8746*/t/*<8746*/)/*<8743*/)/*<8740*/ }/*<8643*/;

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

const $ex$gt$ex = (v0) => (v1) => ({type: "!>!", 0: v0, 1: v1});
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

const TI = (v0) => ({type: "TI", 0: v0});
const type_$gts = /*8982*/function name_8982(a) { return /*8990*/(function match_8990($target) {
if ($target.type === "tvar") {
if ($target[0].type === "tyvar") {
{
let name = $target[0][0];
{
let kind = $target[0][1];
return /*9065*/`${/*9071*/name/*<9071*/} : ${/*9073*//*9075*/kind_$gts/*<9075*/(/*9073*//*9076*/kind/*<9076*/)/*<9073*/}`/*<9065*/
}
}
}
}
if ($target.type === "tapp") {
{
let target = $target[0];
{
let arg = $target[1];
return /*9082*/`(${/*9084*//*9086*/type_$gts/*<9086*/(/*9084*//*9087*/target/*<9087*/)/*<9084*/} ${/*9088*//*9090*/type_$gts/*<9090*/(/*9088*//*9091*/arg/*<9091*/)/*<9088*/})`/*<9082*/
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
throw new Error('failed to match ' + jsonify($target) + '. Loc: 8990');})(/*!*//*8992*/a/*<8992*/)/*<8990*/ }/*<8982*/;

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

const tbool = /*9722*//*9723*/star_con/*<9723*/(/*9722*//*9724*/"bool"/*<9724*/)/*<9722*/;

const type_env = (v0) => (v1) => ({type: "type-env", 0: v0, 1: v1});
const tenv$slconstr = /*9935*/function name_9935($fn_arg) { return /*9935*/(function match_9935($target) {
if ($target.type === "type-env") {
{
let constrs = $target[0];
return /*9935*/function name_9935(name) { return /*9945*//*9945*//*9946*/map$slget/*<9946*/(/*9945*//*9947*/constrs/*<9947*/)/*<9945*/(/*9945*//*9948*/name/*<9948*/)/*<9945*/ }/*<9935*/
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 9935');})(/*!*//*-1*/$fn_arg/*<-1*/)/*<9935*/ }/*<9935*/;

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

const ti_fail = /*10246*/function name_10246(e) { return /*10252*//*10253*/TI/*<10253*/(/*10252*//*10254*/function name_10254(a) { return /*10254*/function name_10254(b) { return /*10254*/function name_10254(c) { return /*10260*//*10261*/err/*<10261*/(/*10260*//*10262*/e/*<10262*/)/*<10260*/ }/*<10254*/ }/*<10254*/ }/*<10254*/)/*<10252*/ }/*<10246*/;

const tenv$slvalue = /*10288*/function name_10288($fn_arg) { return /*10288*/(function match_10288($target) {
if ($target.type === "type-env") {
{
let values = $target[1];
return /*10288*/function name_10288(name) { return /*10303*//*10303*//*10304*/map$slget/*<10304*/(/*10303*//*10305*/values/*<10305*/)/*<10303*/(/*10303*//*10306*/name/*<10306*/)/*<10303*/ }/*<10288*/
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 10288');})(/*!*//*-1*/$fn_arg/*<-1*/)/*<10288*/ }/*<10288*/;

const set$slintersect = /*691*/function name_691(one) { return /*691*/function name_691(two) { return /*700*//*700*//*701*/filter/*<701*/(/*700*//*706*/function name_706(k) { return /*710*//*710*//*711*/set$slhas/*<711*/(/*710*//*712*/two/*<712*/)/*<710*/(/*710*//*713*/k/*<713*/)/*<710*/ }/*<706*/)/*<700*/(/*700*//*702*//*703*/set$slto_list/*<703*/(/*702*//*704*/one/*<704*/)/*<702*/)/*<700*/ }/*<691*/ }/*<691*/;

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
throw new Error('failed to match ' + jsonify($target) + '. Loc: 892');})(/*!*//*894*//*894*//*895*/$eq/*<895*/(/*894*//*896*/tc1/*<896*/)/*<894*/(/*894*//*897*/tc2/*<897*/)/*<894*/)/*<892*/
}
}
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 815');})(/*!*//*817*//*817*//*818*/$co/*<818*/(/*817*//*819*/t1/*<819*/)/*<817*/(/*817*//*820*/t2/*<820*/)/*<817*/)/*<815*/ }/*<808*/ }/*<808*/;

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

const mguPred = /*6802*//*6803*/lift/*<6803*/(/*6802*//*6804*/mgu/*<6804*/)/*<6802*/;

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

const overlap = /*7615*/function name_7615(p) { return /*7615*/function name_7615(q) { return /*7622*/(function match_7622($target) {
if ($target.type === "ok") {
return /*7631*/true/*<7631*/
}
return /*7633*/false/*<7633*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 7622');})(/*!*//*7624*//*7624*//*7625*/mguPred/*<7625*/(/*7624*//*7626*/p/*<7626*/)/*<7624*/(/*7624*//*7627*/q/*<7627*/)/*<7624*/)/*<7622*/ }/*<7615*/ }/*<7615*/;

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

const ntv = /*9808*/function name_9808(kind) { return /*9816*//*9817*/ti_then/*<9817*/(/*9816*//*9818*//*9819*/new_tvar/*<9819*/(/*9818*//*9820*/kind/*<9820*/)/*<9818*/)/*<9816*/ }/*<9808*/;

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

const matchPred = /*6809*//*6810*/lift/*<6810*/(/*6809*//*6811*/type_match/*<6811*/)/*<6809*/;

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

/*7446*//*7448*/core_classes/*<7448*/(/*7446*//*7449*/initial_env/*<7449*/)/*<7446*/
const example_insts = /*7719*//*7719*//*7719*/cons/*<7719*/(/*7719*//*7720*//*7720*//*7721*/add_inst/*<7721*/(/*7720*//*7722*/nil/*<7722*/)/*<7720*/(/*7720*//*7723*//*7723*//*7724*/isin/*<7724*/(/*7723*//*7725*/"ord"/*<7725*/)/*<7723*/(/*7723*//*7727*/tunit/*<7727*/)/*<7723*/)/*<7720*/)/*<7719*/(/*7719*//*7719*//*7719*//*7719*/cons/*<7719*/(/*7719*//*7729*//*7729*//*7730*/add_inst/*<7730*/(/*7729*//*7731*/nil/*<7731*/)/*<7729*/(/*7729*//*7732*//*7732*//*7733*/isin/*<7733*/(/*7732*//*7734*/"ord"/*<7734*/)/*<7732*/(/*7732*//*7736*/tchar/*<7736*/)/*<7732*/)/*<7729*/)/*<7719*/(/*7719*//*7719*//*7719*//*7719*/cons/*<7719*/(/*7719*//*7737*//*7737*//*7738*/add_inst/*<7738*/(/*7737*//*7739*/nil/*<7739*/)/*<7737*/(/*7737*//*7740*//*7740*//*7741*/isin/*<7741*/(/*7740*//*7742*/"ord"/*<7742*/)/*<7740*/(/*7740*//*7744*/tint/*<7744*/)/*<7740*/)/*<7737*/)/*<7719*/(/*7719*//*7719*//*7719*//*7719*/cons/*<7719*/(/*7719*//*7745*//*7745*//*7746*/add_inst/*<7746*/(/*7745*//*7747*//*7747*//*7747*/cons/*<7747*/(/*7747*//*7748*//*7748*//*7749*/isin/*<7749*/(/*7748*//*7750*/"ord"/*<7750*/)/*<7748*/(/*7748*//*7752*//*7752*//*7753*/tvar/*<7753*/(/*7752*//*7754*//*7754*//*7755*/tyvar/*<7755*/(/*7754*//*7756*/"a"/*<7756*/)/*<7754*/(/*7754*//*7758*/star/*<7758*/)/*<7754*/)/*<7752*/(/*7752*//*7759*/-1/*<7759*/)/*<7752*/)/*<7748*/)/*<7747*/(/*7747*//*7747*//*7747*//*7747*/cons/*<7747*/(/*7747*//*7760*//*7760*//*7761*/isin/*<7761*/(/*7760*//*7762*/"ord"/*<7762*/)/*<7760*/(/*7760*//*7764*//*7764*//*7765*/tvar/*<7765*/(/*7764*//*7766*//*7766*//*7767*/tyvar/*<7767*/(/*7766*//*7768*/"b"/*<7768*/)/*<7766*/(/*7766*//*7770*/star/*<7770*/)/*<7766*/)/*<7764*/(/*7764*//*7771*/-1/*<7771*/)/*<7764*/)/*<7760*/)/*<7747*/(/*7747*//*7747*/nil/*<7747*/)/*<7747*/)/*<7747*/)/*<7745*/(/*7745*//*7776*//*7776*//*7777*/isin/*<7777*/(/*7776*//*7778*/"ord"/*<7778*/)/*<7776*/(/*7776*//*7798*//*7798*//*7781*/mkpair/*<7781*/(/*7798*//*7782*//*7782*//*7783*/tvar/*<7783*/(/*7782*//*7784*//*7784*//*7785*/tyvar/*<7785*/(/*7784*//*7786*/"a"/*<7786*/)/*<7784*/(/*7784*//*7788*/star/*<7788*/)/*<7784*/)/*<7782*/(/*7782*//*7789*/-1/*<7789*/)/*<7782*/)/*<7798*/(/*7798*//*7790*//*7790*//*7791*/tvar/*<7791*/(/*7790*//*7792*//*7792*//*7793*/tyvar/*<7793*/(/*7792*//*7794*/"b"/*<7794*/)/*<7792*/(/*7792*//*7796*/star/*<7796*/)/*<7792*/)/*<7790*/(/*7790*//*7797*/-1/*<7797*/)/*<7790*/)/*<7798*/)/*<7776*/)/*<7745*/)/*<7719*/(/*7719*//*7719*/nil/*<7719*/)/*<7719*/)/*<7719*/)/*<7719*/)/*<7719*/;

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

const inst$slpreds = /*9504*/function name_9504(types) { return /*9504*/function name_9504(preds) { return /*9510*//*9510*//*9511*/map/*<9511*/(/*9510*//*9512*//*9513*/inst$slpred/*<9513*/(/*9512*//*9514*/types/*<9514*/)/*<9512*/)/*<9510*/(/*9510*//*9515*/preds/*<9515*/)/*<9510*/ }/*<9504*/ }/*<9504*/;

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

const add_prelude_classes = /*7215*//*7215*//*7438*/compose_transformers/*<7438*/(/*7215*//*7439*/core_classes/*<7439*/)/*<7215*/(/*7215*//*7440*/num_classes/*<7440*/)/*<7215*/;

/*7441*//*7444*/add_prelude_classes/*<7444*/(/*7441*//*7445*/initial_env/*<7445*/)/*<7441*/
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
return /*9977*//*10104*//*10105*/ti_then/*<10105*/(/*10104*//*10014*//*10014*//*10015*/unify/*<10015*/(/*10014*//*10016*/t/*<10016*/)/*<10014*/(/*10014*//*10017*//*10017*//*10017*//*10018*/foldr/*<10018*/(/*10017*//*10020*/t$qu/*<10020*/)/*<10017*/(/*10017*//*10021*/ts/*<10021*/)/*<10017*/(/*10017*//*10156*/tfn/*<10156*/)/*<10017*/)/*<10014*/)/*<10104*/(/*9977*//*9977*/function name_9977($let) { return /*9977*/(function match_9977($target) {
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
let te = $target[1];
return /*10388*//*10414*//*10415*/ti_then/*<10415*/(/*10414*//*10405*//*10405*//*10405*//*10406*/infer$slexpr/*<10406*/(/*10405*//*10407*/ce/*<10407*/)/*<10405*/(/*10405*//*10408*/as/*<10408*/)/*<10405*/(/*10405*//*10409*/arg/*<10409*/)/*<10405*/)/*<10414*/(/*10388*//*10388*/function name_10388($let) { return /*10388*/(function match_10388($target) {
if ($target.type === ",") {
{
let qs = $target[0];
{
let tf = $target[1];
return /*10388*//*10416*//*10418*/ntv/*<10418*/(/*10416*//*10419*/star/*<10419*/)/*<10416*/(/*10388*//*10388*/function name_10388($let) { return /*10388*/(function match_10388($target) {
{
let t = $target;
return /*10388*//*10422*//*10424*/ti_then/*<10424*/(/*10422*//*10425*//*10425*//*10426*/unify/*<10426*/(/*10425*//*10427*//*10427*//*10428*/tfn/*<10428*/(/*10427*//*10429*/tf/*<10429*/)/*<10427*/(/*10427*//*10431*/t/*<10431*/)/*<10427*/)/*<10425*/(/*10425*//*10432*/te/*<10432*/)/*<10425*/)/*<10422*/(/*10388*//*10388*/function name_10388($let) { return /*10388*/(function match_10388($target) {
return /*10433*//*10434*/ti_return/*<10434*/(/*10433*//*10436*//*10436*//*10437*/$co/*<10437*/(/*10436*//*10438*//*10439*/concat/*<10439*/(/*10438*//*10440*//*10440*//*10440*/cons/*<10440*/(/*10440*//*10441*/ps/*<10441*/)/*<10440*/(/*10440*//*10440*//*10440*//*10440*/cons/*<10440*/(/*10440*//*10442*/qs/*<10442*/)/*<10440*/(/*10440*//*10440*/nil/*<10440*/)/*<10440*/)/*<10440*/)/*<10438*/)/*<10436*/(/*10436*//*10443*/t/*<10443*/)/*<10436*/)/*<10433*/
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
if ($target.type === "elet") {
{
let pat = $target[0];
{
let init = $target[1];
{
let body = $target[2];
{
let l = $target[3];
return /*10451*//*10452*/let_$gt/*<10452*/(/*10451*//*10453*//*10453*//*10453*/cons/*<10453*/(/*10453*//*10454*//*10454*//*10455*/$co/*<10455*/(/*10454*//*10456*/ps/*<10456*/)/*<10454*/(/*10454*//*10457*/as$qu/*<10457*/)/*<10454*/)/*<10453*/(/*10453*//*10453*//*10453*//*10453*/cons/*<10453*/(/*10453*//*10458*//*10459*/infer$slpat/*<10459*/(/*10458*//*10460*/pat/*<10460*/)/*<10458*/)/*<10453*/(/*10453*//*10453*/nil/*<10453*/)/*<10453*/)/*<10453*/)/*<10451*/
}
}
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 10168');})(/*!*//*10170*/expr/*<10170*/)/*<10168*/ }/*<10162*/ }/*<10162*/ }/*<10162*/;

return {type: 'fns', $bar_$gt, $eq$gt, $ex$gt$ex, TI, add_class, add_inst, add_prelude_classes, all, any, apply_transformers, array$eq, assump$slapply, assump$sltv, by_inst, by_super, class$slord, class_env, compose_subst, compose_transformers, concat, cons, core_classes, cst$slarray, cst$slidentifier, cst$sllist, cst$slspread, cst$slstring, defined, eapp, elambda, elet, ematch, entail, enumId, eprim, equot, equot$slpat, equot$slstmt, equot$sltype, equotquot, err, estr, evar, example_insts, ext_subst, filter, find, find_scheme, find_some, foldl, foldr, forall, fresh_inst, get_subst, in_hnf, infer$slexpr, infer$slpat, infer$slpats, infer$slprim, initial_env, inst$slpred, inst$slpreds, inst$slqual, inst$sltype, insts, isin, kfun, kind$eq, kind_$gts, lift, list$slget, map, map$slhas, map$slok, map$slti, mapi, matchPred, merge, mgu, mguPred, mklist, mkpair, modify, new_tvar, nil, none, not, ntv, nullSubst, num_classes, ok, overlap, pany, pbool, pcon, pint, pprim, pred$eq, pred$slapply, pred$sltv, pstr, pvar, qual$eq, qual$slapply, qual$sltv, quantify, reduce, result_then, sc_entail, scheme$eq, scheme$slapply, scheme$sltv, set$slintersect, simplify, simplify_inner, some, star, star_con, supers, tapp, tarrow, tbool, tchar, tcon, tdouble, tenv$slconstr, tenv$slvalue, tfloat, tfn, tgen, ti_fail, ti_return, ti_run, ti_then, tint, tinteger, tlist, to_hnf, to_hnfs, to_scheme, tstring, ttuple2, tunit, tvar, tycon, tycon$eq, tycon$slkind, tycon_$gts, type$eq, type$slapply, type$slhnf, type$slkind, type$sltv, type_$gts, type_env, type_match, tyvar, tyvar$eq, tyvar$slkind, unify, varBind}