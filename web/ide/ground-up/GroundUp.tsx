import React, { useEffect, useRef, useState } from 'react';
import { Cursors, isValidCursorLocation } from '../../custom/Cursors';
import { HiddenInput } from '../../custom/HiddenInput';
import { Hover } from '../../custom/Hover';
import { NUIState } from '../../custom/UIState';

import { goLeftUntil } from '../../../src/state/navigate';
import { Display } from '../../../src/to-ast/library';
import { CardRoot } from '../../custom/CardRoot';
import { Store, WithStore, useGlobalState } from '../../custom/store/Store';
import { useStore } from '../../custom/store/useStore';
import { Path } from '../../store';
import { CommandPalette } from './CommandPalette';
import { valueToString } from './reduce';
import { renderTraces } from './renderTraces';

export type Results = {
    display: Display;
    errors: { [key: string]: string[] };
    hashNames: { [idx: number]: string };
};

export type Debug = {
    ids: boolean;
    execOrder: boolean;
    selection: boolean;
};

export const GroundUp = ({
    id,
    initial,
    save,
    listing,
}: {
    id: string;
    initial: NUIState;
    listing: string[] | null;
    save: (state: NUIState) => void;
}) => {
    // const [state, dispatch] = useReducer(reduce, null, (): NUIState => initial);

    const [debug, setDebug] = useState<Debug>({
        ids: false,
        execOrder: false,
        selection: false,
    });

    const store = useStore(initial);
    const { state, results } = useGlobalState(store);

    useEffect(() => {
        store.setDebug(debug.execOrder);
    }, [debug.execOrder]);

    let first = useRef(true);
    useEffect(() => {
        if (first.current) {
            first.current = false;
            return;
        }
        save({ ...state, regs: {} });
    }, [state.map, state.nsMap, state.cards, state.evaluator, state.meta, id]);

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
                    return store.dispatch({
                        type: 'select',
                        at: [{ start: left.selection }],
                    });
                }
            }
        } catch (err) {
            console.error(err);
            console.log('failed to find valid');
        }
    }, [state.at, state.map, state.regs]);

    const start = state.at.length ? state.at[0].start : null;

    useEffect(() => {
        console.log('ev', store.getEvaluator());
    }, [store.getEvaluator()]);

    return (
        <div
            style={{
                padding: 16,
                cursor: 'text',
                paddingBottom: 300,
                // marginRight: 500,
            }}
        >
            <HiddenInput
                display={results.display}
                state={state}
                dispatch={store.dispatch}
                menu={undefined}
                hashNames={{}}
            />
            <WithStore store={store}>
                {state.cards.map((_, i) => (
                    <CardRoot
                        key={i}
                        card={i}
                        state={state}
                        debug={debug}
                        ev={store.getEvaluator()}
                        dispatch={store.dispatch}
                        produce={results.produce}
                        env={results.env}
                    />
                ))}
            </WithStore>
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
                {(['ids', 'selection', 'execOrder'] as const).map((k) => (
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
                <div>
                    <ShowEvaluators
                        state={state}
                        store={store}
                        listing={listing}
                        id={id}
                    />
                </div>
                <div style={{ flex: 1, overflow: 'auto' }}>
                    {debug.selection ? <ShowAt at={state.at} /> : null}
                    {renderTraces(results, state, store)}
                </div>
            </div>
            <Hover
                state={state}
                dispatch={store.dispatch}
                calc={() => {
                    for (let i = state.hover.length - 1; i >= 0; i--) {
                        const last = state.hover[i].idx;
                        const errs = results.errors[last];
                        if (errs?.length) {
                            return [{ idx: last, text: errs.join('\n') }];
                        }
                    }
                    return [];
                }}
            />
            <Cursors at={state.at} regs={state.regs} />
            <CommandPalette state={state} dispatch={store.dispatch} />
            {/* {selTop ? JSON.stringify(results.tops[selTop].data) : null} */}
            {/* {selTop != null ? <ViewJson v={results.tops[selTop].data} /> : null} */}
            {/* {JSON.stringify(state.at)} */}
            {/* <div>{JSON.stringify(state.hover)}</div> */}
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

const ShowAt = ({ at }: { at: NUIState['at'] }) => {
    return (
        <>
            {at.map(({ start, end }, i) => (
                <div key={i}>
                    {showPath(start)}
                    {end ? '[...]' : null}
                    {end ? showPath(end) : null}
                </div>
            ))}
        </>
    );
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
