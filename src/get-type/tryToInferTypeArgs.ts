import { TfnType, Type } from '../types/ast';
import {
    TypeArgs,
    _matchOrExpand,
    _matchesType,
    applyTypeVariables,
    matchesType,
} from './matchesType';
import { Ctx } from '../to-ast/library';
import { unifyManyTypes } from './patternType';
import { Report } from './get-types-new';

export const tryToInferTypeArgs = (
    type: TfnType,
    args: Type[],
    ctx: Ctx,
    report?: Report,
): Type | void => {
    if (type.body.type !== 'fn') {
        return;
    }
    // console.log('infer', type, args);
    const bindings: TypeArgs = {};
    type.args.forEach((arg) => {
        bindings[arg.form.loc] = [];
    });

    for (let i = 0; i < args.length && i < type.body.args.length; i++) {
        const res = _matchOrExpand(
            args[i],
            type.body.args[i].type,
            ctx,
            [],
            bindings,
        );
        if (res !== true) {
            // console.log(res);
            return;
        }
    }

    const boundMap: { [sym: number]: Type } = {};
    for (let i = 0; i < type.args.length; i++) {
        const arg = type.args[i];
        const bound = unifyManyTypes(bindings[arg.form.loc], ctx);

        if (arg.bound) {
            const match = matchesType(bound, arg.bound, ctx, arg.form, report);
            if (!match) {
                return;
            }
        }
        boundMap[type.args[i].form.loc] = bound;
    }

    return applyTypeVariables(type.body, boundMap);
};
