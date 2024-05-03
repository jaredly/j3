import React, { ReactNode, useEffect, useRef, useState } from 'react';
import { Cursors } from '../../custom/Cursors';
import { isValidCursorLocation } from '../../custom/isValidCursorLocation';
import { HiddenInput } from '../../custom/HiddenInput';
import { Hover } from '../../custom/Hover';
import { NUIState } from '../../custom/UIState';

import { goLeftUntil } from '../../../src/state/goLeftUntil';
import { Display } from '../../../src/to-ast/library';
import { CardRoot } from '../../custom/CardRoot';
import { Store } from '../../custom/store/Store';
import {
    StoreCtx,
    useGetStore,
    useGlobalState,
    useSubscribe,
} from '../../custom/store/StoreCtx';
import { Path } from '../../store';
import { CommandPalette } from './CommandPalette';
import { RenderTraces } from './renderTraces';
import { ResultsCache } from '../../custom/store/ResultsCache';
import { AnyEnv } from '../../custom/store/getResults';
import { useSyncStore } from '../../custom/store/useSyncStore';
import { filterNulls } from '../../custom/old-stuff/filterNulls';
import { ShowSearchResults } from './ShowSearchResults';
import { ShowEvaluators } from './ShowEvaluators';
import { ShowAt } from './ShowAt';
import { ShowErrors } from './ShowErrors';
import { AutoComplete } from './AutoComplete';
import { RenderReadOnly } from '../../custom/RenderStatic';

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
export type SearchResults = {
    term: { type: 'references'; name: string } | { type: 'free'; text: string };
    results: {
        idx: number;
        path: Path[];
    }[];
};

const initialDebug: Debug = {
    ids: false,
    showJs: false,
    execOrder: false,
    selection: false,
    disableEvaluation: false,
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
    const [searchResults, setSearchResults] = useState(
        null as null | SearchResults,
    );

    const [debug, setDebug] = useState<Debug>(initialDebug);
    const [pin, setPin] = useState(null as null | number);

    const store = useSyncStore(initial.state, undefined, initial.evaluator);
    const { state } = useGlobalState(store);

    useSaveState(store, save, state, id);

    useSelectionFixer(state, store);

    const size = useSize(store);

    return (
        <div
            style={{
                padding: 16,
                cursor: 'text',
                paddingBottom: 300,
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
                        setPin={setPin}
                    />
                ))}
            </WithStore>
            <DebugCard
                debug={debug}
                setDebug={setDebug}
                store={store}
                state={state}
                listing={listing}
                id={id}
                size={size}
            />
            <Cursors at={state.at} regs={state.regs} />
            <WithStore store={store}>
                <Hover />
                <CommandPalette setSearchResults={setSearchResults} />
                {searchResults ? (
                    <ShowSearchResults
                        results={searchResults}
                        setResults={setSearchResults}
                    />
                ) : null}
                <AutoComplete />
                {pin ? <ShowPin pin={pin} setPin={setPin} /> : null}
            </WithStore>
        </div>
    );
};

const ShowPin = ({
    pin,
    setPin,
}: {
    pin: number;
    setPin: (pin: number | null) => void;
}) => {
    const store = useGetStore();
    const ns = useSubscribe(
        () => store.getState().nsMap[pin],
        (fn) => store.onChange('ns:' + pin, fn),
        [pin],
    );
    return (
        <div
            style={{
                position: 'fixed',
                bottom: 0,
                left: 0,
                right: 0,
                backgroundColor: 'black',
                zIndex: 100,
                padding: 4,
            }}
        >
            <button
                style={{
                    background: 'none',
                    color: 'white',
                    cursor: 'pointer',
                    border: 'none',
                    padding: 8,
                }}
                onClick={() => setPin(null)}
            >
                &times;
            </button>
            <div
                style={{
                    padding: '24px 36px',
                    paddingTop: 4,
                }}
            >
                <RenderReadOnly
                    idx={ns.top}
                    path={[{ type: 'ns-top', idx: pin }]}
                />
            </div>
        </div>
    );
};

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

function useSaveState(
    store: Store,
    save: (state: NUIState) => void,
    state: NUIState,
    id: string,
) {
    useEffect(() => {
        // @ts-ignore
        window.state = state;
        // @ts-ignore
        window.store = store;
    }, [state]);

    let first = useRef(true);
    useEffect(() => {
        if (first.current) {
            first.current = false;
            return;
        }
        save({ ...state, regs: {} });
    }, [state.map, state.nsMap, state.cards, state.evaluator, state.meta, id]);
}

function useSelectionFixer(state: NUIState, store: Store) {
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
}

function DebugCard({
    debug,
    setDebug,
    store,
    state,
    listing,
    id,
    size,
}: {
    debug: Debug;
    setDebug: React.Dispatch<React.SetStateAction<Debug>>;
    store: Store;
    state: NUIState;
    listing: string[] | null;
    id: string;
    size: number;
}) {
    const [show, setShow] = useState(false);
    useEffect(() => {
        store.setDebug(debug.execOrder, debug.disableEvaluation, debug.showJs);
    }, [debug.execOrder, debug.disableEvaluation, debug.showJs]);

    return (
        <div
            style={{
                position: 'fixed',
                top: 60,
                right: 4,
                // @ts-ignore
                backgroundColor: store.dispatch === store.reg ? 'red' : '#222',
                padding: show ? 16 : 0,
                maxHeight: 'calc(100vh - 60px)',
                display: 'flex',
                flexDirection: 'column',
            }}
        >
            <button
                style={{
                    fontFamily: 'inherit',
                    color: 'inherit',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: 8,
                }}
                onClick={() => setShow(!show)}
            >
                Debug Card
            </button>
            {show ? (
                <>
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
                </>
            ) : null}
        </div>
    );
}
