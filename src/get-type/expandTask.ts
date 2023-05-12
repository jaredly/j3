import { blank, nilt, none } from '../to-ast/builtins';
import { Ctx } from '../to-ast/library';
import { Node, Type, TypeTask } from '../types/ast';
import { MatchError } from '../types/types';
import { expandTaskEffects } from './asTaskType';
import { TaskType, maybeEffectsType } from './get-types-new';
import { cmp } from './unifyTypes';

export const expandTask = (
    task: TaskType,
    form: Node,
    ctx: Ctx,
): Extract<Type, { type: 'union' }> | { type: 'error'; error: MatchError } => {
    let inner = maybeEffectsType(task, task.result) as TypeTask;
    if (task.extraReturn) {
        // const ex = expandTaskEffects(task.extraReturn, ctx);
        // if (ex.type === 'error') {
        //     return ex;
        // }
        // const ext = expandTask(ex, task.extraReturn.form, ctx);
        // if (ext.type === 'error') {
        //     return ext;
        // }
        inner.extraReturnEffects = void 0;
        inner.effects = {
            type: 'union',
            items: [inner.effects, task.extraReturn],
            form: inner.effects.form,
            open: false,
        };
    }
    return {
        type: 'union',
        open: false,
        form,
        items: [
            ...Object.entries(task.effects)
                .sort((a, b) => cmp(a[0], b[0]))
                .map(
                    ([key, v]): Type => ({
                        type: 'tag',
                        args: v.output
                            ? [
                                  v.input,
                                  {
                                      type: 'fn',
                                      args: [
                                          {
                                              name: 'value',
                                              form: blank,
                                              type: v.output,
                                          },
                                      ],
                                      body: inner,
                                      form: blank,
                                  },
                              ]
                            : [v.input],
                        form: v.input.form,
                        name: key,
                    }),
                ),
            ...task.locals.map(
                (local): Type => ({
                    type: 'task',
                    effects: local,
                    result: none,
                    form: local.form,
                }),
            ),
            { type: 'tag', name: 'Return', form: blank, args: [task.result] },
        ],
    };
};
