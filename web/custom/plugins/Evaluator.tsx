import React from 'react';
import { NamespacePlugin } from '../UIState';

export const evaluatorPlugin: NamespacePlugin<1, string> = {
    id: 'evaluator',
    title: 'Save Evaluator',

    test(node) {
        return true;
    },

    newNodeAfter(path, map, nsMap, nidx) {
        return null;
    },

    render(node, results, store, ns) {
        const options: string | null =
            typeof ns.plugin === 'string' ? null : ns.plugin?.options;
        return {
            type: 'vert',
            children: [
                { type: 'ref', id: node.loc, path: { type: 'start' } },
                {
                    type: 'dom',
                    node: (
                        <button
                            onClick={(evt) => {
                                evt.stopPropagation();
                                const name = prompt('Name to save it to');
                                console.log(name);
                                store.dispatch({
                                    type: 'ns',
                                    nsMap: {
                                        [ns.id]: {
                                            ...ns,
                                            plugin: {
                                                id: 'evaluator',
                                                options: name,
                                            },
                                        },
                                    },
                                });
                            }}
                            onMouseDown={(evt) => {
                                evt.stopPropagation();
                            }}
                        >
                            {options ?? 'Set name'}
                        </button>
                    ),
                },
            ],
        };
    },

    // So is this where ... we would kick things off?
    // ORRR what if the `store` is responsible for
    // keeping a map of evaluators,
    // and we just do a thing where it's like
    // "send your evaluator..."
    // OK SO
    process(node, state, evaluator, results, options) {
        return 1;
    },
};
