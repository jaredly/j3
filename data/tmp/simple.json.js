const lolz = /*168*/function name_168(x) { return /*575*/(function let_575() {const $target = /*579*/x/*<579*/;
{
let y = $target;
return /*174*//*174*//*177*/$pl/*<177*/(/*174*//*178*/x/*<178*/)/*<174*/(/*174*//*179*/y/*<179*/)/*<174*/
};
throw new Error('let pattern not matched 578. ' + valueToString($target));})(/*!*/)/*<575*/ }/*<168*/;

const what = /*231*/function name_231(f) { return /*240*//*240*//*241*/f/*<241*/(/*240*//*242*//*243*/what/*<243*/(/*242*//*246*/f/*<246*/)/*<242*/)/*<240*/(/*240*//*264*/1/*<264*/)/*<240*/ }/*<231*/;

const y = /*337*/10/*<337*/;

const xx = /*658*/function name_658(one) { return /*607*//*607*//*608*/$pl/*<608*/(/*607*//*609*/1/*<609*/)/*<607*/(/*607*//*610*/one/*<610*/)/*<607*/ }/*<658*/;


const lol = /*690*/10/*<690*/;

const hi = /*699*/10/*<699*/;

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

const x = /*332*/y/*<332*/;

const m = /*441*/a/*<441*/;

const l = /*446*/m/*<446*/;

const lolfn = /*597*//*597*//*598*/$pl/*<598*/(/*597*//*599*/1/*<599*/)/*<597*/(/*597*//*600*/hi/*<600*/)/*<597*/;

return {type: 'fns', a, b, c, cons, e, even, foldr, hi, hio, l, lol, lolfn, lolz, m, nil, odd, what, x, xx, y}