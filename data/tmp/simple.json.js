/*103*/{"0":{"0":{"0":"cons","1":106,"type":"evar"},"1":{"0":{"0":1,"1":107,"type":"pint"},"1":107,"type":"eprim"},"2":106,"type":"eapp"},"1":{"0":{"0":{"0":"cons","1":106,"type":"evar"},"1":{"0":{"0":2,"1":108,"type":"pint"},"1":108,"type":"eprim"},"2":106,"type":"eapp"},"1":{"0":"nil","1":106,"type":"evar"},"2":106,"type":"eapp"},"2":106,"type":"eapp"}/*<103*/
const lol = /*168*/function name_168(x) { return /*575*/(function let_575() {const $target = /*579*/x/*<579*/;
{
let y = $target;
return /*174*//*174*//*177*/$pl/*<177*/(/*174*//*178*/x/*<178*/)/*<174*/(/*174*//*179*/y/*<179*/)/*<174*/
};
throw new Error('let pattern not matched 578. ' + valueToString($target));})(/*!*/)/*<575*/ }/*<168*/;

/*225*//*227*/lol/*<227*/(/*225*//*228*/2/*<228*/)/*<225*/
const what = /*231*/function name_231(f) { return /*240*//*240*//*241*/f/*<241*/(/*240*//*242*//*243*/what/*<243*/(/*242*//*246*/f/*<246*/)/*<242*/)/*<240*/(/*240*//*264*/1/*<264*/)/*<240*/ }/*<231*/;

/*247*/what/*<247*/
/*269*/lol/*<269*/
/*276*/`hello ${/*279*/"folks"/*<279*/}`/*<276*/
const y = /*337*/10/*<337*/;

/*352*/function name_352($fn_arg) { return /*352*/(function match_352($target) {
if ($target.type === ",") {
{
let a = $target[0];
{
let b = $target[1];
return /*366*/1/*<366*/
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 352');})(/*!*//*-1*/$fn_arg/*<-1*/)/*<352*/ }/*<352*/
/*367*/{"0":{"0":{"0":"1","1":371,"type":"cst/identifier"},"1":{"0":{"0":"2","1":372,"type":"cst/identifier"},"1":{"type":"nil"},"type":"cons"},"type":"cons"},"1":370,"type":"cst/array"}/*<367*/
/*373*/(function match_373($target) {
if ($target === false) {
return /*378*/1/*<378*/
}
if ($target === true) {
return /*380*/2/*<380*/
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 373');})(/*!*//*376*/true/*<376*/)/*<373*/
/*435*/23/*<435*/



/*502*/function name_502($fn_arg) { return /*502*/(function match_502($target) {
if ($target.type === ",") {
{
let a = $target[0];
if ($target[1] === ""){
return /*511*/1/*<511*/
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 502');})(/*!*//*-1*/$fn_arg/*<-1*/)/*<502*/ }/*<502*/

/*537*/(/*539*/function name_539(a) { return /*543*//*544*/a/*<544*/(/*543*//*545*/""/*<545*/)/*<543*/ }/*<539*/)(/*537*//*546*/$co/*<546*/)/*<537*/

/*584*//*584*//*590*/$pl/*<590*/(/*584*//*591*/1/*<591*/)/*<584*/(/*584*//*592*/hi/*<592*/)/*<584*/
const lol = /*597*//*597*//*598*/$pl/*<598*/(/*597*//*599*/1/*<599*/)/*<597*/(/*597*//*600*/hi/*<600*/)/*<597*/;

/*601*/(function let_601() {const $target = /*606*/23/*<606*/;
{
let one = $target;
return /*607*//*607*//*608*/$pl/*<608*/(/*607*//*609*/1/*<609*/)/*<607*/(/*607*//*610*/one/*<610*/)/*<607*/
};
throw new Error('let pattern not matched 605. ' + valueToString($target));})(/*!*/)/*<601*/
const cons = (v0) => (v1) => ({type: "cons", 0: v0, 1: v1});
const nil = ({type: "nil"});
const even = /*288*/function name_288(x) { return /*294*/(function match_294($target) {
if ($target === true) {
return /*300*/true/*<300*/
}
return /*301*//*302*/odd/*<302*/(/*301*//*303*//*303*//*304*/_/*<304*/(/*303*//*305*/x/*<305*/)/*<303*/(/*303*//*306*/1/*<306*/)/*<303*/)/*<301*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 294');})(/*!*//*296*//*296*//*297*/$eq/*<297*/(/*296*//*298*/0/*<298*/)/*<296*/(/*296*//*299*/x/*<299*/)/*<296*/)/*<294*/ }/*<288*/;


const odd = /*307*/function name_307(x) { return /*313*/(function match_313($target) {
if ($target === true) {
return /*319*/true/*<319*/
}
return /*320*//*321*/even/*<321*/(/*320*//*322*//*322*//*323*/_/*<323*/(/*322*//*324*/x/*<324*/)/*<322*/(/*322*//*325*/1/*<325*/)/*<322*/)/*<320*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 313');})(/*!*//*315*//*315*//*316*/$eq/*<316*/(/*315*//*317*/1/*<317*/)/*<315*/(/*315*//*318*/x/*<318*/)/*<315*/)/*<313*/ }/*<307*/;

const a = /*383*/function name_383(m) { return /*413*//*413*//*387*/$pl/*<387*/(/*413*//*416*//*415*/b/*<415*/(/*416*//*417*/2/*<417*/)/*<416*/)/*<413*/(/*413*//*434*/2/*<434*/)/*<413*/ }/*<383*/;


const b = /*388*/function name_388(a) { return /*430*//*392*/c/*<392*/(/*430*//*431*/a/*<431*/)/*<430*/ }/*<388*/;


const c = /*393*/function name_393(a) { return /*432*//*397*/e/*<397*/(/*432*//*433*/a/*<433*/)/*<432*/ }/*<393*/;


const e = /*398*/function name_398(b) { return /*427*//*402*/a/*<402*/(/*427*//*429*/2/*<429*/)/*<427*/ }/*<398*/;

const foldr = /*0*/function name_0(init) { return /*0*/function name_0(items) { return /*0*/function name_0(f) { return /*74*/(function match_74($target) {
if ($target.type === "nil") {
return /*78*/init/*<78*/
}
if ($target.type === "cons") {
{
let one = $target[0];
{
let rest = $target[1];
return /*85*//*85*//*86*/f/*<86*/(/*85*//*87*//*87*//*87*//*88*/foldr/*<88*/(/*87*//*89*/init/*<89*/)/*<87*/(/*87*//*90*/rest/*<90*/)/*<87*/(/*87*//*91*/f/*<91*/)/*<87*/)/*<85*/(/*85*//*92*/one/*<92*/)/*<85*/
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 74');})(/*!*//*76*/items/*<76*/)/*<74*/ }/*<0*/ }/*<0*/ }/*<0*/;

/*93*//*93*//*93*//*95*/foldr/*<95*/(/*93*//*96*/0/*<96*/)/*<93*/(/*93*//*97*//*97*//*97*/cons/*<97*/(/*97*//*98*/1/*<98*/)/*<97*/(/*97*//*97*//*97*//*97*/cons/*<97*/(/*97*//*99*/2/*<99*/)/*<97*/(/*97*//*97*/nil/*<97*/)/*<97*/)/*<97*/)/*<93*/(/*93*//*100*/$pl/*<100*/)/*<93*/
/*109*/(function match_109($target) {
if ($target.type === "nil") {
return /*115*/1/*<115*/
}
if ($target.type === "cons") {
{
let a = $target[0];
{
let asd = $target[1];
return /*118*/2/*<118*/
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 109');})(/*!*//*112*//*112*//*112*/cons/*<112*/(/*112*//*113*/1/*<113*/)/*<112*/(/*112*//*112*//*112*//*112*/cons/*<112*/(/*112*//*123*/2/*<123*/)/*<112*/(/*112*//*112*/nil/*<112*/)/*<112*/)/*<112*/)/*<109*/
/*205*//*205*//*205*/cons/*<205*/(/*205*//*207*/1/*<207*/)/*<205*/(/*205*//*205*//*205*//*205*/cons/*<205*/(/*205*//*208*/2/*<208*/)/*<205*/(/*205*//*205*/nil/*<205*/)/*<205*/)/*<205*/
/*209*/nil/*<209*/
/*211*//*211*//*213*/cons/*<213*/(/*211*//*214*/1/*<214*/)/*<211*/(/*211*//*216*/nil/*<216*/)/*<211*/
/*217*//*217*//*219*/cons/*<219*/(/*217*//*220*/2/*<220*/)/*<217*/(/*217*//*221*/nil/*<221*/)/*<217*/
/*229*/foldr/*<229*/
/*283*//*283*//*283*/cons/*<283*/(/*283*//*285*/1/*<285*/)/*<283*/(/*283*//*283*//*283*//*283*/cons/*<283*/(/*283*//*286*/"hi"/*<286*/)/*<283*/(/*283*//*283*/nil/*<283*/)/*<283*/)/*<283*/
const x = /*332*/y/*<332*/;

/*340*/(function let_340() {const $target = /*345*/x/*<345*/;
{
let a = $target;
return /*346*/2/*<346*/
};
throw new Error('let pattern not matched 344. ' + valueToString($target));})(/*!*/)/*<340*/
/*408*/a/*<408*/
const m = /*441*/a/*<441*/;

const l = /*446*/m/*<446*/;

return {type: 'fns', a, b, c, cons, e, even, foldr, l, lol, lol, m, nil, odd, what, x, y}