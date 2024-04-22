import React, { ReactNode, useEffect, useRef, useState } from 'react';
import { Cursors } from '../../custom/Cursors';
import { isValidCursorLocation } from '../../custom/isValidCursorLocation';
import { HiddenInput } from '../../custom/HiddenInput';
import { Hover } from '../../custom/Hover';
import { NUIState } from '../../custom/UIState';

import { goLeftUntil } from '../../../src/state/goLeftUntil';
import { Display } from '../../../src/to-ast/library';
import { CardRoot } from '../../custom/CardRoot';
import { NUIResults, Store } from '../../custom/store/Store';
import {
    StoreCtx,
    useGetStore,
    useGlobalState,
    useResults,
    useSubscribe,
} from '../../custom/store/StoreCtx';
// import { useStore } from '../../custom/store/useStore';
import { Path } from '../../store';
import { CommandPalette, pathForIdx } from './CommandPalette';
import { RenderTraces } from './renderTraces';
import { advancePath } from './findTops';
import { ResultsCache } from '../../custom/store/ResultsCache';
import { AnyEnv } from '../../custom/store/getResults';
import { useSyncStore } from '../../custom/store/useSyncStore';
import { Spinner } from './Spinner';
import { filterNulls } from '../../custom/old-stuff/filterNulls';

export const WithStore = ({
    store,
    children,
}: {
    store: Store;
    children: ReactNode | ReactNode[];
}) => {
    return <StoreCtx.Provider value={store}>{children}</StoreCtx.Provider>;
};

export type Results = {
    display: Display;
    errors: { [key: string]: string[] };
    hashNames: { [idx: number]: string };
};

export type Debug = {
    ids: boolean;
    showJs: boolean;
    execOrder: boolean;
    selection: boolean;
    disableEvaluation: boolean;
};

export const GroundUp = ({
    id,
    initial,
    save,
    listing,
}: {
    id: string;
    initial: {
        state: NUIState;
        cache?: ResultsCache<any>;
        evaluator?: AnyEnv | null;
    };
    listing: string[] | null;
    save: (state: NUIState) => void;
}) => {
    // const [state, dispatch] = useReducer(reduce, null, (): NUIState => initial);

    const [debug, setDebug] = useState<Debug>({
        ids: false,
        showJs: false,
        execOrder: false,
        selection: false,
        disableEvaluation: false,
    });

    const store = useSyncStore(initial.state, undefined, initial.evaluator);
    // const store = useStore(initial.state, initial.cache, initial.evaluator);
    const { state } = useGlobalState(store);

    useEffect(() => {
        store.setDebug(debug.execOrder, debug.disableEvaluation, debug.showJs);
    }, [debug.execOrder, debug.disableEvaluation, debug.showJs]);

    let first = useRef(true);
    useEffect(() => {
        if (first.current) {
            first.current = false;
            return;
        }
        save({ ...state, regs: {} });
    }, [
        state.map,
        state.nsMap,
        state.cards,
        state.evaluator,
        state.meta,
        id,
        // cache.run,
    ]);

    useEffect(() => {
        // @ts-ignore
        window.state = state;
        // @ts-ignore
        window.store = store;
    }, [state]);

    useEffect(() => {
        const path = state.at[0]?.start;
        try {
            if (path && !isValidCursorLocation(path, state.regs)) {
                console.log('Not valid sorry', path);
                const left = goLeftUntil(
                    path,
                    state.map,
                    state.nsMap,
                    state.cards,
                    state.regs,
                );
                if (left) {
                    store.dispatch({
                        type: 'select',
                        at: [{ start: left.selection }],
                    });
                    return;
                }
            }
        } catch (err) {
            console.error(err);
            console.log('failed to find valid');
        }
    }, [state.at, state.map, state.regs]);

    // const start = state.at.length ? state.at[0].start : null;

    useEffect(() => {
        console.log('ev', store.getEvaluator());
    }, [store.getEvaluator()]);

    const size = useSize(store);

    return (
        <div
            style={{
                padding: 16,
                cursor: 'text',
                paddingBottom: 300,
                // marginRight: 500,
            }}
        >
            <WithStore store={store}>
                <HiddenInput
                    state={state}
                    dispatch={store.dispatch}
                    menu={undefined}
                    hashNames={{}}
                />
                {state.cards.map((_, i) => (
                    <CardRoot
                        key={i}
                        card={i}
                        state={state}
                        debug={debug}
                        dispatch={store.dispatch}
                    />
                ))}
            </WithStore>
            {/* <div>{JSON.stringify(results.hover)}</div> */}
            {/* <pre>{JSON.stringify(results.errors, null, 2)}</pre> */}
            <div
                style={{
                    position: 'fixed',
                    top: 60,
                    right: 4,
                    backgroundColor: 'black',
                    padding: 16,
                    maxHeight: 'calc(100vh - 60px)',
                    display: 'flex',
                    flexDirection: 'column',
                }}
            >
                {(
                    [
                        'ids',
                        'selection',
                        'execOrder',
                        'showJs',
                        'disableEvaluation',
                    ] as const
                ).map((k) => (
                    <div key={k}>
                        <label>
                            <input
                                type="checkbox"
                                checked={debug[k]}
                                onChange={() =>
                                    setDebug({ ...debug, [k]: !debug[k] })
                                }
                            />
                            {' ' + k}
                        </label>
                    </div>
                ))}
                <WithStore store={store}>
                    <div>
                        <ShowEvaluators
                            state={state}
                            store={store}
                            listing={listing}
                            id={id}
                        />
                    </div>
                    <div>Size: {size}</div>
                    <div style={{ flex: 1, overflow: 'auto' }}>
                        {debug.selection ? (
                            <ShowAt at={state.at} hover={state.hover} />
                        ) : null}
                        <ShowErrors />
                        <RenderTraces />
                    </div>
                </WithStore>
            </div>
            <Cursors at={state.at} regs={state.regs} />
            <WithStore store={store}>
                <Hover />
                <CommandPalette />
            </WithStore>
        </div>
    );
};

const ShowErrors = () => {
    const [hide, setHide] = useState(false);
    const store = useGetStore();
    const results = useResults(store);
    const state = store.getState();
    const found: { loc: number; errs: string[] }[] = [];
    Object.values(results.results.nodes).forEach((node) => {
        if (node.parsed?.type === 'failure') {
            Object.entries(node.parsed.errors).forEach(([loc, errs]) => {
                found.push({ loc: +loc, errs });
            });
        }
    });
    Object.entries(results.workerResults.nodes).forEach(([key, send]) => {
        Object.entries(send.errors).forEach(([loc, errs]) => {
            found.push({ loc: +loc, errs });
        });
        send.produce.forEach((item) => {
            if (typeof item === 'string') return;
            if (
                item.type === 'error' ||
                item.type === 'withjs' ||
                item.type === 'eval'
            ) {
                found.push({
                    loc: state.nsMap[+key]?.top,
                    errs: [item.message],
                });
            }
        });
    });

    if (!found.length) return null;
    return (
        <div
            style={{
                maxWidth: 400,
            }}
        >
            <strong style={{ color: 'red' }}>Errors</strong>
            <button onClick={() => setHide(!hide)}>
                {hide ? 'Show' : 'Hide'}
            </button>
            {!hide &&
                found.map(({ loc, errs }, i) => (
                    <div
                        key={i}
                        onClick={() => {
                            const path = pathForIdx(loc, state);
                            if (!path)
                                return alert('cant find path for ' + loc);
                            store.dispatch({
                                type: 'select',
                                at: [{ start: path }],
                            });
                        }}
                        style={{
                            fontSize: '80%',
                            borderBottom: '1px solid white',
                            marginBottom: 8,
                            paddingBottom: 8,
                        }}
                    >
                        {loc}: {errs.join(', ').slice(0, 100)}
                    </div>
                ))}
        </div>
    );
};

const showPath = (path: Path[]) => {
    return (
        <table>
            <tbody>
                {path.map((item, i) => (
                    <tr key={i}>
                        <td style={{ width: '3em', display: 'inline-block' }}>
                            {item.idx}
                        </td>
                        <td
                            style={{
                                whiteSpace: 'nowrap',
                                wordBreak: 'keep-all',
                                minWidth: '5em',
                            }}
                        >
                            {item.type}
                        </td>
                        {'at' in item ? <td>{item.at}</td> : null}
                    </tr>
                ))}
            </tbody>
        </table>
    );
};

const ShowAt = ({ at, hover }: { at: NUIState['at']; hover: Path[] }) => {
    return (
        <>
            {at.map(({ start, end }, i) => (
                <div key={i}>
                    {showPath(start)}
                    {end ? '[...]' : null}
                    {end ? showPath(end) : null}
                </div>
            ))}
            <div>{showPath(hover)}</div>
        </>
    );
};

type StyleProp = NonNullable<React.ComponentProps<'div'>['style']>;

const useSize = (store: Store) => {
    return useSubscribe(
        () => {
            const items = Object.values(store.getResults().results.nodes);
            const sizes = items
                .map((node) => {
                    if (node.parsed?.type === 'success') {
                        return node.parsed.size;
                    }
                })
                .filter(filterNulls);
            if (!sizes.length) return null;
            return sizes.reduce((a, b) => a + b);
        },
        (fn) => store.on('parse', fn),
        [],
    );
};

const usePending = () => {
    const store = useGetStore();
    const [state, setState] = useState(0);
    useEffect(() =>
        store.on('pending', (_, count) => {
            setState(count);
        }),
    );
    return state;
};

function ShowEvaluators({
    state,
    store,
    listing,
    id,
}: {
    state: NUIState;
    store: Store;
    listing: string[] | null;
    id: string;
}) {
    const pending = usePending();
    if (!state.evaluator)
        return evSelect(
            null,
            (id) =>
                store.dispatch({
                    type: 'config:evaluator',
                    id: id?.startsWith(':') ? id : id ? [id] : null,
                }),
            listing,
            true,
        );
    if (typeof state.evaluator === 'string') {
        return (
            <div>
                {evSelect(
                    state.evaluator,
                    (id) =>
                        store.dispatch({
                            type: 'config:evaluator',
                            id: id?.startsWith(':') ? id : id ? [id] : null,
                        }),
                    listing,
                    true,
                )}
            </div>
        );
    }

    return (
        <div>
            <div style={{ color: pending > 0 ? 'green' : 'white' }}>
                {pending > 0 ? <Spinner /> : null}
                {pending} pending requests
            </div>
            {state.evaluator.map((id, i) => (
                <div key={id}>
                    {evSelect(
                        id,
                        (id) => {
                            const ev = (state.evaluator as string[]).slice();
                            if (!id) {
                                ev.splice(i, 1);
                            } else {
                                ev[i] = id;
                            }
                            if (!ev.length)
                                return store.dispatch({
                                    type: 'config:evaluator',
                                    id: null,
                                });
                            store.dispatch({
                                type: 'config:evaluator',
                                id: ev,
                            });
                        },
                        listing,
                        false,
                    )}
                </div>
            ))}
            {evSelect(
                null,
                (id) => {
                    if (!id) return;
                    const ids = (state.evaluator as string[]).slice();
                    ids.push(id);
                    store.dispatch({ type: 'config:evaluator', id: ids });
                },
                listing,
                false,
            )}
        </div>
    );
}

const evSelect = (
    ev: string | null,
    onChange: (ev: string | null) => void,
    listing: string[] | null,
    simples: boolean,
) => {
    return (
        <select
            value={ev ?? ''}
            onChange={(evt) => {
                onChange(evt.target.value);
            }}
            data-what={ev}
        >
            <option value={''}>{ev ? 'Remove' : 'Add evaluator'}</option>
            {simples ? (
                <>
                    <option value={':repr:'}>REPR</option>
                    <option value={':bootstrap:'}>Bootstrap</option>
                </>
            ) : null}
            {listing
                ?.filter((n) => n.endsWith('.js'))
                .map((name, i) => (
                    <option value={name} key={name}>
                        {name}
                    </option>
                ))}
        </select>
    );
};
