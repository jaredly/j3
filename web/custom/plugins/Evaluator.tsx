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

    render(node, results, dispatch, ns) {
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
                                dispatch({
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

    process(node, meta, evaluate, setTracing, options) {
        return 1;
    },
};
