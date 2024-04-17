import React, { useState } from 'react';
import { NamespacePlugin } from '../UIState';
import { urlForId } from '../../ide/ground-up/urlForId';
import { Node } from '../../../src/types/cst';

export const evaluatorPlugin: NamespacePlugin<
    null,
    { expr: any; id: number },
    string
> = {
    id: 'evaluator',
    title: 'Save Evaluator',

    newNodeAfter(path, map, nsMap, nidx) {
        return null;
    },

    // So... I want a way to send a message to the worker.

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
};

const Saver = ({
    onClick,
    children,
}: {
    onClick: () => Promise<unknown>;
    children: (v: boolean) => JSX.Element | string;
}) => {
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(false);
    return (
        <button
            onClick={() => {
                setError(false);
                setSaving(true);
                onClick()
                    .catch((err) => {
                        console.error(err);
                        setError(true);
                    })
                    .then(() => {
                        setSaving(false);
                    });
            }}
        >
            {error ? 'Error!!' : children(saving)}
        </button>
    );
};
