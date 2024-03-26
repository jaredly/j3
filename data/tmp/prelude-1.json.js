const some = (v0) => ({type: "some", 0: v0});
const none = ({type: "none"});
const at = /*13*/function name_13(arr) { return /*13*/function name_13(i) { return /*13*/function name_13(default_) { return /*20*/(function match_20($target) {
if ($target.type === "nil") {
return /*24*/default_/*<24*/
}
if ($target.type === "cons") {
{
let one = $target[0];
{
let rest = $target[1];
return /*29*/(function match_29($target) {
if ($target === true) {
return /*35*/one/*<35*/
}
return /*36*//*36*//*36*//*37*/at/*<37*/(/*36*//*38*/rest/*<38*/)/*<36*/(/*36*//*39*//*39*//*40*/_/*<40*/(/*39*//*41*/i/*<41*/)/*<39*/(/*39*//*42*/1/*<42*/)/*<39*/)/*<36*/(/*36*//*43*/default_/*<43*/)/*<36*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 29');})(/*!*//*31*//*31*//*32*/$eq/*<32*/(/*31*//*33*/i/*<33*/)/*<31*/(/*31*//*34*/0/*<34*/)/*<31*/)/*<29*/
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 20');})(/*!*//*22*/arr/*<22*/)/*<20*/ }/*<13*/ }/*<13*/ }/*<13*/;

const rev = /*45*/function name_45(arr) { return /*45*/function name_45(col) { return /*51*/(function match_51($target) {
if ($target.type === "nil") {
return /*55*/col/*<55*/
}
if ($target.type === "cons") {
{
let one = $target[0];
if ($target[1].type === "nil") {
return /*58*//*58*//*58*/cons/*<58*/(/*58*//*59*/one/*<59*/)/*<58*/(/*58*//*61*/col/*<61*/)/*<58*/
}
}
}
if ($target.type === "cons") {
{
let one = $target[0];
{
let rest = $target[1];
return /*66*//*66*//*67*/rev/*<67*/(/*66*//*68*/rest/*<68*/)/*<66*/(/*66*//*69*//*69*//*69*/cons/*<69*/(/*69*//*70*/one/*<70*/)/*<69*/(/*69*//*72*/col/*<72*/)/*<69*/)/*<66*/
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 51');})(/*!*//*53*/arr/*<53*/)/*<51*/ }/*<45*/ }/*<45*/;

const len = /*73*/function name_73(arr) { return /*78*/(function match_78($target) {
if ($target.type === "nil") {
return /*82*/0/*<82*/
}
if ($target.type === "cons") {
{
let one = $target[0];
{
let rest = $target[1];
return /*87*//*87*//*88*/$pl/*<88*/(/*87*//*89*/1/*<89*/)/*<87*/(/*87*//*90*//*91*/len/*<91*/(/*90*//*92*/rest/*<92*/)/*<90*/)/*<87*/
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 78');})(/*!*//*80*/arr/*<80*/)/*<78*/ }/*<73*/;

const join = /*93*/function name_93(sep) { return /*93*/function name_93(arr) { return /*99*/(function match_99($target) {
if ($target.type === "nil") {
return /*103*/""/*<103*/
}
if ($target.type === "cons") {
{
let one = $target[0];
if ($target[1].type === "nil") {
return /*107*/one/*<107*/
}
}
}
if ($target.type === "cons") {
{
let one = $target[0];
{
let rest = $target[1];
return /*112*/`${/*114*/one/*<114*/}${/*116*/sep/*<116*/}${/*118*//*118*//*119*/join/*<119*/(/*118*//*120*/sep/*<120*/)/*<118*/(/*118*//*121*/rest/*<121*/)/*<118*/}`/*<112*/
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 99');})(/*!*//*101*/arr/*<101*/)/*<99*/ }/*<93*/ }/*<93*/;

const map = /*123*/function name_123(values) { return /*123*/function name_123(f) { return /*129*/(function match_129($target) {
if ($target.type === "nil") {
return /*133*/nil/*<133*/
}
if ($target.type === "cons") {
{
let one = $target[0];
{
let rest = $target[1];
return /*138*//*138*//*138*/cons/*<138*/(/*138*//*139*//*140*/f/*<140*/(/*139*//*141*/one/*<141*/)/*<139*/)/*<138*/(/*138*//*143*//*143*//*144*/map/*<144*/(/*143*//*145*/rest/*<145*/)/*<143*/(/*143*//*146*/f/*<146*/)/*<143*/)/*<138*/
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 129');})(/*!*//*131*/values/*<131*/)/*<129*/ }/*<123*/ }/*<123*/;

const mapi = /*147*/function name_147(i) { return /*147*/function name_147(values) { return /*147*/function name_147(f) { return /*154*/(function match_154($target) {
if ($target.type === "nil") {
return /*158*/nil/*<158*/
}
if ($target.type === "cons") {
{
let one = $target[0];
{
let rest = $target[1];
return /*163*//*163*//*163*/cons/*<163*/(/*163*//*164*//*164*//*165*/f/*<165*/(/*164*//*166*/i/*<166*/)/*<164*/(/*164*//*167*/one/*<167*/)/*<164*/)/*<163*/(/*163*//*169*//*169*//*169*//*170*/mapi/*<170*/(/*169*//*171*//*171*//*172*/$pl/*<172*/(/*171*//*173*/1/*<173*/)/*<171*/(/*171*//*174*/i/*<174*/)/*<171*/)/*<169*/(/*169*//*175*/rest/*<175*/)/*<169*/(/*169*//*176*/f/*<176*/)/*<169*/)/*<163*/
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 154');})(/*!*//*156*/values/*<156*/)/*<154*/ }/*<147*/ }/*<147*/ }/*<147*/;

const zip = /*177*/function name_177(one) { return /*177*/function name_177(two) { return /*183*/(function match_183($target) {
if ($target.type === ",") {
if ($target[0].type === "nil") {
if ($target[1].type === "nil") {
return /*193*/nil/*<193*/
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
return /*204*//*204*//*204*/cons/*<204*/(/*204*//*205*//*205*//*206*/$co/*<206*/(/*205*//*207*/a/*<207*/)/*<205*/(/*205*//*208*/b/*<208*/)/*<205*/)/*<204*/(/*204*//*210*//*210*//*211*/zip/*<211*/(/*210*//*212*/one/*<212*/)/*<210*/(/*210*//*213*/two/*<213*/)/*<210*/)/*<204*/
}
}
}
}
}
}
}
return /*215*/nil/*<215*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 183');})(/*!*//*185*//*185*//*186*/$co/*<186*/(/*185*//*187*/one/*<187*/)/*<185*/(/*185*//*188*/two/*<188*/)/*<185*/)/*<183*/ }/*<177*/ }/*<177*/;

const foldl = /*216*/function name_216(init) { return /*216*/function name_216(items) { return /*216*/function name_216(f) { return /*223*/(function match_223($target) {
if ($target.type === "nil") {
return /*227*/init/*<227*/
}
if ($target.type === "cons") {
{
let one = $target[0];
{
let rest = $target[1];
return /*232*//*232*//*232*//*233*/foldl/*<233*/(/*232*//*234*//*234*//*235*/f/*<235*/(/*234*//*236*/init/*<236*/)/*<234*/(/*234*//*237*/one/*<237*/)/*<234*/)/*<232*/(/*232*//*238*/rest/*<238*/)/*<232*/(/*232*//*239*/f/*<239*/)/*<232*/
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 223');})(/*!*//*225*/items/*<225*/)/*<223*/ }/*<216*/ }/*<216*/ }/*<216*/;

const foldr = /*240*/function name_240(init) { return /*240*/function name_240(items) { return /*240*/function name_240(f) { return /*247*/(function match_247($target) {
if ($target.type === "nil") {
return /*251*/init/*<251*/
}
if ($target.type === "cons") {
{
let one = $target[0];
{
let rest = $target[1];
return /*256*//*256*//*257*/f/*<257*/(/*256*//*258*//*258*//*258*//*259*/foldr/*<259*/(/*258*//*260*/init/*<260*/)/*<258*/(/*258*//*261*/rest/*<261*/)/*<258*/(/*258*//*262*/f/*<262*/)/*<258*/)/*<256*/(/*256*//*263*/one/*<263*/)/*<256*/
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 247');})(/*!*//*249*/items/*<249*/)/*<247*/ }/*<240*/ }/*<240*/ }/*<240*/;

const filter = /*264*/function name_264(fn) { return /*264*/function name_264(list) { return /*270*/(function match_270($target) {
if ($target.type === "nil") {
return /*274*/nil/*<274*/
}
if ($target.type === "cons") {
{
let one = $target[0];
{
let rest = $target[1];
return /*279*/(function match_279($target) {
if ($target === true) {
return /*284*//*284*//*284*/cons/*<284*/(/*284*//*285*/one/*<285*/)/*<284*/(/*284*//*287*//*287*//*288*/filter/*<288*/(/*287*//*289*/fn/*<289*/)/*<287*/(/*287*//*290*/rest/*<290*/)/*<287*/)/*<284*/
}
return /*291*//*291*//*292*/filter/*<292*/(/*291*//*293*/fn/*<293*/)/*<291*/(/*291*//*294*/rest/*<294*/)/*<291*/
throw new Error('failed to match ' + jsonify($target) + '. Loc: 279');})(/*!*//*281*//*282*/fn/*<282*/(/*281*//*283*/one/*<283*/)/*<281*/)/*<279*/
}
}
}
throw new Error('failed to match ' + jsonify($target) + '. Loc: 270');})(/*!*//*272*/list/*<272*/)/*<270*/ }/*<264*/ }/*<264*/;

const map_without = /*321*/function name_321(map) { return /*321*/function name_321(set) { return /*327*//*327*//*327*//*328*/foldr/*<328*/(/*327*//*329*/map/*<329*/)/*<327*/(/*327*//*330*//*331*/set$slto_list/*<331*/(/*330*//*332*/set/*<332*/)/*<330*/)/*<327*/(/*327*//*333*/map$slrm/*<333*/)/*<327*/ }/*<321*/ }/*<321*/;

return {type: 'fns', at, filter, foldl, foldr, join, len, map, map_without, mapi, none, rev, some, zip}