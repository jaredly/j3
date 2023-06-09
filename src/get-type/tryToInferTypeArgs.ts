import { TfnType, Type } from '../types/ast';
import { TypeArgs, _matchOrExpand, matchesType } from './matchesType';
import { applyTypeVariables } from './applyAndResolve';
import { Ctx } from '../to-ast/library';
import { unifyManyTypes } from './patternType';
import { Report } from './get-types-new';
import { MatchError } from '../types/types';

export const tryToInferTypeArgs = (
    type: TfnType,
    args: Type[],
    ctx: Ctx,
    report?: Report,
): Type | { type: 'error'; error: MatchError } => {
    if (type.body.type !== 'fn') {
        return {
            type: 'error',
            error: {
                type: 'misc',
                message: 'not a fn inside',
                form: type.form,
                path: [],
            },
        };
    }
    // console.log('infer', type, args);
    const bindings: TypeArgs = {};
    type.args.forEach((arg) => {
        bindings[arg.sym] = [];
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
            return { type: 'error', error: res };
        }
    }

    const boundMap: { [sym: number]: Type } = {};
    for (let i = 0; i < type.args.length; i++) {
        const arg = type.args[i];
        let bound = unifyManyTypes(bindings[arg.sym], ctx);

        if (arg.bound) {
            const match = _matchOrExpand(bound, arg.bound, ctx, []);
            if (match !== true) {
                return { type: 'error', error: match };
            }
            if (
                bound.type === 'none' &&
                arg.bound.type === 'union' &&
                arg.bound.open &&
                arg.bound.items.length === 0
            ) {
                bound = {
                    type: 'union',
                    items: [],
                    open: false,
                    form: arg.bound.form,
                };
            }
        }
        boundMap[type.args[i].sym] = bound;
    }

    return applyTypeVariables(type.body, boundMap);
};
