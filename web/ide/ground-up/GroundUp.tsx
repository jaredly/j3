import React, { useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { layout } from '../../../src/layout';
import { fromMCST } from '../../../src/types/mcst';
import { Cursors, isValidCursorLocation } from '../../custom/Cursors';
import { HiddenInput } from '../../custom/HiddenInput';
import { Hover } from '../../custom/Hover';
import { NUIState } from '../../custom/UIState';

import { Display } from '../../../src/to-ast/library';
import { CardRoot } from '../../custom/CardRoot';
import { FullEvalator, bootstrap, repr } from './Evaluators';
import { findTops, reduce, valueToString } from './reduce';
import { goLeftUntil } from '../../../src/state/navigate';
import { Path } from '../../store';
import { WithStore, useGlobalState, useStore } from '../../custom/Store';
import { loadEv } from './loadEv';
import { CommandPalette, pathForIdx } from './CommandPalette';

export type Results = {
    display: Display;
    errors: { [key: string]: string[] };
    hashNames: { [idx: number]: string };
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

    const [debug, setDebug] = useState(true);

    const store = useStore(initial);
    const { state, results } = useGlobalState(store);

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
    // const selTop = start?.[1].idx;

    return (
        <div style={{ padding: 16, cursor: 'text', marginBottom: 300 }}>
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
                        state={state}
                        key={i}
                        ev={store.getEvaluator()}
                        dispatch={store.dispatch}
                        card={i}
                        results={results}
                        produce={results.produce}
                        env={results.env}
                    />
                ))}
            </WithStore>
            <div
                style={{
                    position: 'fixed',
                    top: 4,
                    right: 4,
                    backgroundColor: 'black',
                    padding: 16,
                }}
            >
                <button onClick={() => setDebug(!debug)}>
                    {debug ? 'Debug on' : 'Debug off'}
                </button>
                <div>
                    {state.evaluator ?? 'Non set'}
                    <select
                        value={state.evaluator ?? ''}
                        onChange={(evt) => {
                            store.dispatch({
                                type: 'config:evaluator',
                                id: evt.target.value,
                            });
                        }}
                    >
                        <option value={''}>No evaluator</option>
                        <option value={':repr:'}>REPR</option>
                        <option value={':bootstrap:'}>Bootstrap</option>
                        {listing
                            ?.filter((n) => n.endsWith('.json'))
                            .map((name, i) =>
                                name === id ? null : (
                                    <option value={name} key={name}>
                                        {name}
                                    </option>
                                ),
                            )}
                    </select>
                </div>
                {debug ? (
                    <div
                        style={{
                            position: 'absolute',
                            backgroundColor: 'black',
                            border: '1px solid #aaa',
                            top: '100%',
                            marginTop: 4,
                            right: 0,
                        }}
                    >
                        <ShowAt at={state.at} />
                        {/* <br />
                        {JSON.stringify(state.hover)} */}
                    </div>
                ) : null}
                {Object.entries(results.traces).map(([top, traces]) => (
                    <div key={top}>
                        <div
                            onClick={() => {
                                const path = pathForIdx(
                                    +top,
                                    state.regs,
                                    state.map,
                                );
                                if (path) {
                                    store.dispatch({
                                        type: 'select',
                                        at: [{ start: path }],
                                    });
                                }
                            }}
                        >
                            Top trace: {top}
                        </div>
                        <table>
                            <tbody>
                                {Object.entries(traces).map(([key, values]) => (
                                    <tr key={key}>
                                        <td>
                                            <div
                                                onClick={() => {
                                                    const path = pathForIdx(
                                                        +key,
                                                        state.regs,
                                                        state.map,
                                                    );
                                                    if (path) {
                                                        store.dispatch({
                                                            type: 'select',
                                                            at: [
                                                                { start: path },
                                                            ],
                                                        });
                                                    }
                                                }}
                                            >
                                                {key}
                                            </div>
                                        </td>
                                        <td>
                                            {values.map((v, i) => (
                                                <div key={i}>
                                                    {valueToString(v)}
                                                </div>
                                            ))}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ))}
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
