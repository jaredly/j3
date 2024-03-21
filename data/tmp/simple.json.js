const cons = (v0) => (v1) => ({type: "cons", 0: v0, 1: v1});
const nil = ({type: "nil"});
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

const what = /*231*/function name_231(f) { return /*240*//*240*//*241*/f/*<241*/(/*240*//*242*//*243*/what/*<243*/(/*242*//*246*/f/*<246*/)/*<242*/)/*<240*/(/*240*//*264*/1/*<264*/)/*<240*/ }/*<231*/;

const lol = /*168*/function name_168(x) { return /*174*//*174*//*177*/$pl/*<177*/(/*174*//*178*/x/*<178*/)/*<174*/(/*174*//*179*/2/*<179*/)/*<174*/ }/*<168*/;

const y = /*337*/10/*<337*/;

return {type: 'fns', even, foldr, lol, odd, what, x, y}