import React, { useState } from 'react';
import { NamespacePlugin } from '../UIState';
import { urlForId } from '../../ide/ground-up/reduce';
import { Node } from '../../../src/types/cst';

export const evaluatorPlugin: NamespacePlugin<
    null,
    { expr: any; id: number },
    string
> = {
    id: 'evaluator',
    title: 'Save Evaluator',

    test(node) {
        return true;
    },
    parse(node, errors, evaluator) {
        try {
            const expr = evaluator.parseExpr(node, errors);
            return {
                parsed: { expr, id: node.loc },
                deps: evaluator.analysis?.exprDependencies(expr) ?? [],
            };
        } catch (err) {
            errors[node.loc] = [`Failed to parse ${(err as Error).message}`];
            return null;
        }
    },

    newNodeAfter(path, map, nsMap, nidx) {
        return null;
    },

    render({ id }, results, store, ns) {
        const options: string | null =
            typeof ns.plugin === 'string' ? null : ns.plugin?.options;
        return {
            type: 'vert',
            children: [
                { type: 'ref', id },
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
                            {options && (
                                <Saver
                                    onClick={async () => {
                                        const ev = store.getEvaluator();
                                        if (!ev?.toFile) {
                                            return;
                                        }
                                        let text;
                                        try {
                                            // TODO `toFile` should know what to do with caches!
                                            // Alsooooo should `store` expose a way to talk to the
                                            // web worker(s)? Seems like it.
                                            text = ev.toFile!(
                                                store.getState(),
                                                id,
                                            ).js;
                                        } catch (err) {
                                            console.error(err);
                                            return alert(
                                                `Failed (see console)`,
                                            );
                                        }

                                        return fetch(urlForId(options), {
                                            body: text,
                                            method: 'POST',
                                        });
                                    }}
                                >
                                    {(saving) =>
                                        saving ? 'Saving...' : 'Save'
                                    }
                                </Saver>
                            )}
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
    process() {
        return null;
        // if (!options || !options.endsWith('.js')) {
        //     // throw new Error(`Bad name`);
        //     return {
        //         type: 'error',
        //         message: options ? `Name must end in .js` : `Please set a name`,
        //     };
        // }
        // if (
        //     node.type === 'blank' ||
        //     node.type === 'comment' ||
        //     node.type === 'comment-node'
        // ) {
        //     return {
        //         type: 'error',
        //         message: `Expression must not be blank or comment`,
        //     };
        // }
        // if (!evaluator.toFile) {
        //     return { type: 'error', message: `No toFile for evaluator` };
        // }
        // let text;
        // try {
        //     text = evaluator.toFile!(state, id).js;
        // } catch (err) {
        //     console.error(err);
        //     return {
        //         type: 'error',
        //         message: `Failed ` + (err as Error).message,
        //     };
        // }
        // return { type: 'success', text }; // Date.now();
    },
};

const Saver = ({
    onClick,
    children,
}: {
    onClick: () => Promise<unknown>;
    children: (v: boolean) => JSX.Element | string;
}) => {
    const [saving, setSaving] = useState(false);
    return (
        <button
            onClick={() => {
                setSaving(true);
                onClick()
                    .catch(() => {})
                    .then(() => {
                        setSaving(false);
                    });
            }}
        >
            {children(saving)}
        </button>
    );
};
