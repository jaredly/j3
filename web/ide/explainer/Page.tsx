import React from 'react';
import { Link, LoaderFunction, useLoaderData } from 'react-router-dom';
import { pages } from './pages';
import { urlForId } from '../ground-up/urlForId';
import { NUIState } from '../../custom/UIState';
import { GroundUp } from '../ground-up/GroundUp';

type Data = { page: string; data: NUIState };

export const pageLoader: LoaderFunction = async (args): Promise<Data> => {
    const page = args.params.page ?? pages[0].id;
    const res = await fetch(urlForId(page + '.json'));
    const data = await res.json();
    return { page, data };
};

export const Page = () => {
    const { page, data } = useLoaderData() as Data;

    return (
        <div
            style={{
                padding: 16,
            }}
        >
            {page ?? 'no page arg'}
            <GroundUp
                id={page + '.json'}
                key={page}
                listing={[]}
                save={() => {}}
                initial={{ state: { ...data, at: [] } }}
            />
        </div>
    );
};
