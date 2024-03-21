import React from 'react';
import { NamespacePlugin } from '../UIState';
import { urlForId } from '../../ide/ground-up/reduce';

export const evaluatorPlugin: NamespacePlugin<false | number, string> = {
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
                { type: 'ref', id: node.loc },
                {
                    type: 'dom',
                    node: (
                        <div>
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
                            {results === false
                                ? 'Not saving'
                                : `Saved at ${new Date(
                                      results,
                                  ).toLocaleTimeString()}`}
                        </div>
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
        if (!options || !options.endsWith('.js')) {
            // throw new Error(`Bad name`);
            return false;
        }
        if (
            node.type === 'blank' ||
            node.type === 'comment' ||
            node.type === 'comment-node'
        ) {
            return false; // ignoring
        }
        const text = evaluator.toFile?.(state, node.loc).js;
        fetch(urlForId(options), {
            body: text,
            method: 'POST',
        });
        // console.log(text);
        return Date.now();
    },
};
