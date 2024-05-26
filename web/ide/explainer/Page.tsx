import React, { useMemo, useRef, useState } from 'react';
import { Link, LoaderFunction, useLoaderData } from 'react-router-dom';
import { pages } from './pages';
import { urlForId } from '../ground-up/urlForId';
import { NUIState } from '../../custom/UIState';
import { GroundUp } from '../ground-up/GroundUp';
import { AnyEnv } from '../ground-up/FullEvalator';
import { loadEvaluator } from '../ground-up/loadEv';
import lf from 'localforage';
import { onlyLast } from '../ground-up/Outside';
import { loadState } from '../ground-up/reduce';

type Data = {
    page: string;
    dirty: boolean;
    data: NUIState;
    evaluator: AnyEnv | null;
};

const key = (page: string) => 'explainer:' + page;

const fetchState = async (page: string) => {
    const cached = await lf.getItem(key(page));
    if (cached != null && typeof cached === 'string') {
        try {
            return { data: loadState(JSON.parse(cached)), dirty: true };
        } catch (err) {
            // ignoring
        }
    }
    const res = await fetch(urlForId(page + '.json'));
    const data: NUIState = await res.json();
    data.history = [];
    data.at = [];
    return { data: loadState(data), dirty: false };
};

const saveState = async (page: string, state: NUIState) => {
    await lf.setItem(key(page), JSON.stringify({ ...state, regs: {} }));
};

export const pageLoader: LoaderFunction = async (args): Promise<Data> => {
    const page = args.params.page ?? pages[0].id;
    const { data, dirty } = await fetchState(page);

    const evaluator = await new Promise<AnyEnv | null>((res) =>
        loadEvaluator(data.evaluator, (ev) => res(ev)),
    );

    return { page, data, dirty, evaluator };
};

export const Page = () => {
    const lastSaveTime = useRef(Date.now());
    const { page, data, dirty, evaluator } = useLoaderData() as Data;
    const [hasChanged, setHasChanged] = useState(dirty);
    const latestChanged = useRef(dirty);
    const latestState = useRef(data);

    const save = useMemo(
        () =>
            onlyLast<{ state: NUIState }>(
                ({ state }) => {
                    const now = Date.now();
                    // console.log(`Time since last save`, now - lastSaveTime);
                    if (now - lastSaveTime.current < 200) {
                        throw new Error(`saving too fast???`);
                    }
                    if (!latestChanged.current) {
                        setHasChanged(true);
                    }
                    lastSaveTime.current = now;
                    latestState.current = state;
                    return saveState(page, state);
                },
                // minimum time after last change
                500,
                // maximum time between saves
                // if they're coming rapid fire
                10000,
            ),
        [page],
    );

    const pidx = pages.findIndex((p) => p.id === page);
    const next =
        pidx !== -1 && pidx < pages.length - 1 ? pages[pidx + 1] : null;

    return (
        <div
            style={{
                padding: 16,
            }}
        >
            <div
                style={{
                    position: 'fixed',
                    bottom: 40,
                    left: -80,
                    width: 300,
                    textAlign: 'center',
                    // right: 0,
                    backgroundColor: 'red',
                    transform: 'rotate(45deg)',
                    zIndex: 100,
                    fontWeight: 'bold',
                    fontFamily: 'Inter',
                    fontSize: 50,
                }}
            >
                BETA
            </div>
            <GroundUp
                id={page + '.json'}
                key={page}
                listing={[]}
                save={(state) => save({ state })}
                initial={{ state: { ...data, at: [] }, evaluator }}
                footer={
                    next ? (
                        <div
                            style={{
                                display: 'flex',
                                justifyContent: 'center',
                                maxWidth: 1000,
                            }}
                        >
                            <Link
                                to={'../' + next.id}
                                style={{
                                    textDecoration: 'none',
                                    cursor: 'pointer',
                                    // padding: '8px 16px',
                                    borderRadius: 8,
                                    backgroundColor: '#cc99cd',
                                    padding: '8px 16px',
                                    color: 'black',
                                    fontWeight: '600',
                                    fontSize: '24px',
                                    fontFamily: 'Inter',
                                }}
                            >
                                Next up: {next.title}
                            </Link>
                        </div>
                    ) : null
                }
            />
            {hasChanged ? (
                <div
                    style={{
                        position: 'fixed',
                        bottom: 10,
                        right: 10,
                        backgroundColor: 'rgb(18 18 22)',
                        border: '1px solid rgb(50 50 54)',
                        maxWidth: 180,
                        fontSize: '80%',
                        padding: 8,
                        borderRadius: 8,
                    }}
                >
                    You've made changes.{' '}
                    <button
                        style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            textDecoration: 'underline',
                            color: 'inherit',
                            fontFamily: 'inherit',
                            padding: 0,
                            margin: 0,
                        }}
                        onClick={() => {
                            const a = document.createElement('a');
                            a.href = URL.createObjectURL(
                                new Blob(
                                    [
                                        JSON.stringify({
                                            ...latestState.current,
                                            regs: {},
                                        }),
                                    ],
                                    {
                                        type: 'application/json',
                                    },
                                ),
                            );
                            a.download = `${page}.json`;
                            a.click();
                        }}
                    >
                        Click here
                    </button>{' '}
                    to export. Or{' '}
                    <button
                        style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            textDecoration: 'underline',
                            color: 'inherit',
                            fontFamily: 'inherit',
                            padding: 0,
                            margin: 0,
                        }}
                        onClick={() => {
                            lf.removeItem(key(page)).then(() =>
                                location.reload(),
                            );
                        }}
                    >
                        Reset.
                    </button>
                </div>
            ) : null}
        </div>
    );
};
