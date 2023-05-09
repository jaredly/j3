import { blank, nilt, none } from '../to-ast/builtins';
import { Node, Type } from '../types/ast';
import { TaskType, maybeEffectsType } from './get-types-new';
import { cmp } from './unifyTypes';

export const expandTask = (task: TaskType, form: Node): Type => {
    const inner = maybeEffectsType(task, task.result);
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
            ...task.locals,
            { type: 'tag', name: 'Return', form: blank, args: [task.result] },
        ],
    };
};
