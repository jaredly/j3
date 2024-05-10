import React from 'react';
import { Link, LoaderFunction, useLoaderData } from 'react-router-dom';
import { pages } from './pages';
import { urlForId } from '../ground-up/urlForId';
import { NUIState } from '../../custom/UIState';
import { GroundUp } from '../ground-up/GroundUp';
import { AnyEnv } from '../ground-up/FullEvalator';
import { loadEvaluator } from '../ground-up/loadEv';

type Data = { page: string; data: NUIState; evaluator: AnyEnv | null };

export const pageLoader: LoaderFunction = async (args): Promise<Data> => {
    const page = args.params.page ?? pages[0].id;
    const res = await fetch(urlForId(page + '.json'));
    const data: NUIState = await res.json();
    data.history = [];
    data.at = [];

    const evaluator = await new Promise<AnyEnv | null>((res) =>
        loadEvaluator(data.evaluator, (ev) => res(ev)),
    );

    return { page, data, evaluator };
};

export const Page = () => {
    const { page, data, evaluator } = useLoaderData() as Data;

    return (
        <div
            style={{
                padding: 16,
            }}
        >
            <GroundUp
                id={page + '.json'}
                key={page}
                listing={[]}
                save={() => {}}
                initial={{ state: { ...data, at: [] }, evaluator }}
            />
        </div>
    );
};
