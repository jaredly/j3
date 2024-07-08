import * as React from 'react';
import { useParams } from 'react-router-dom';

export const Edit = () => {
    const params = useParams();
    const id = params.id;
    if (!id) throw new Error(`no id specified`);

    return <div>Editing {id}</div>;
};
