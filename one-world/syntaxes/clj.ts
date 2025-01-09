import { Src } from '../keyboard/handleShiftNav';
import { Id, Loc, RecNode, TextSpan } from '../shared/cnodes';
import { any, Ctx, id, idp, idt, kwd, list, Matcher, meta, mref, multi, named, opt, sequence, switch_, table, text, tx } from './dsl';

// const expr_ = mref<Expr>('expr');

// export const matchers = {
//     expr: switch_([
//         list('round', sequence([
//             kwd('if', () => ({type: 'if'})),
//             named('cond', expr_),
//             named('yes', expr_),
//             named('no', opt(expr_, idt)),
//         ], true, idt), idt)
//     ], idt),
//     top: switch_([
//         list('round', sequence([
//             kwd('def', () => null),
//             named('name', id(null, () => ({type: 'defn'}))),
//             expr_,
//         ], true, idt), idt)
//     ], idt)
// }
