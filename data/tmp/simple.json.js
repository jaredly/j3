const foldr = /*0*/(init) => /*0*/(items) => /*0*/(f) => /*74*/(($target) => {
if ($target.type === "nil") {
return /*78*//*127*/fatal/*<127*/(/*78*//*128*/"nope"/*<128*/)/*<78*/
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
throw new Error('failed to match ' + jsonify($target) + '. Loc: 74');})(/*!*//*76*/items/*<76*/)/*<74*//*<0*//*<0*//*<0*/;

return {type: 'fns', foldr}