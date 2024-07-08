import * as React from 'react';
import { Link, useParams } from 'react-router-dom';
import { StoreContext } from './StoreContext';

export const Browse = () => {
    const params = useParams();
    const path = params.path || '/';
    const store = React.useContext(StoreContext);
    const state = store.getState();
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
                        <Link to={`/edit/${id}`} key={id}>
                            {state.documents[id].title}
                        </Link>
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
                                nextLoc: 0,
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
