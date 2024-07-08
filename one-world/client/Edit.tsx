import * as React from 'react';
import { useParams } from 'react-router-dom';
import { useStore } from './StoreContext';

export const Edit = () => {
    const params = useParams();
    const id = params.id;
    if (!id) throw new Error(`no id specified`);

    const store = useStore();
    // store.getState

    return <div>Editing {id}</div>;
};
