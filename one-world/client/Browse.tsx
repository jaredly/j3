import * as React from 'react';
import { useParams } from 'react-router-dom';
import { StateContext } from './StoreContext';

export const Browse = () => {
    const params = useParams();
    const store = React.useContext(StateContext);
    const state = store.getState();
    const path = params.path || '/';
    return (
        <div style={{ padding: 50 }}>
            All namespaces that exist
            <ul>
                {Object.keys(state.namespaces)
                    .sort()
                    .map((name) => (
                        <li key={name}>{name}</li>
                    ))}
            </ul>
            All documents
            <ul>
                {Object.keys(state.documents).map((id) => (
                    <li key={id}>
                        <button key={id}>{state.documents[id].title}</button>
                    </li>
                ))}
            </ul>
            <button
                onClick={() => {
                    // ws send a message ... and ... update the state locally too,
                    // right?
                    const id = Math.random().toString(36).slice(2);
                    store.update({
                        type: 'doc',
                        id,
                        action: {
                            type: 'reset',
                            doc: {
                                evaluator: [],
                                id,
                                namespace: '',
                                nodes: {},
                                nsAliases: {},
                                title: 'Untitled',
                                ts: {
                                    created: Date.now(),
                                    updated: Date.now(),
                                },
                            },
                        },
                    });
                }}
            >
                New Doc Pls
            </button>
        </div>
    );
};
