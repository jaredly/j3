import { blank } from '../to-ast/builtins';
import { Node, Type } from '../types/ast';
import { TaskType } from './get-types-new';
import { cmp } from './unifyTypes';

export const expandTask = (task: TaskType, form: Node): Type => {
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
                        args: v.output ? [v.input, v.output] : [v.input],
                        form: v.input.form,
                        name: key,
                    }),
                ),
            ...task.locals,
            { type: 'tag', name: 'Return', form: blank, args: [task.result] },
        ],
    };
};
