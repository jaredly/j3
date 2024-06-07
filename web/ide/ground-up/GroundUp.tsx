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
import { ResultsCache } from '../../custom/store/ResultsCache';
import { AnyEnv } from '../../custom/store/getResults';
import { useSyncStore } from '../../custom/store/useSyncStore';
import { filterNulls } from '../../custom/old-stuff/filterNulls';
import { ShowSearchResults } from './ShowSearchResults';
import { AutoComplete } from './AutoComplete';
import { RenderReadOnly } from '../../custom/RenderStatic';
import { selectEnd } from '../../../src/state/navigate';
import { DebugCard } from './DebugCard';

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
    footer,
}: {
    footer?: React.ReactNode;
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
    const [zoom, setZoom] = useState(null as null | Path[]);

    const store = useSyncStore(initial.state, undefined, initial.evaluator);
    const { state } = useGlobalState(store);

    useEffect(() => {
        const state = store.getState();
        if (!state.at.length) {
            const ns = state.cards[0].top;
            if (ns == null) return;
            const child = state.nsMap[ns].children[0];
            if (child == null) return;
            const node = state.nsMap[child].top;
            const sel = selectEnd(
                node,
                [
                    { type: 'card', card: 0, idx: -1 },
                    { type: 'ns', child: child, idx: ns },
                    { type: 'ns-top', idx: child },
                ],
                state.map,
            );
            if (sel) {
                store.dispatch({ type: 'select', at: [{ start: sel }] });
            }
        }
    }, []);

    useSaveState(store, save, state, id);

    useSelectionFixer(state, store);

    const size = useSize(store);

    return (
        <div
            style={{
                padding: 16,
                cursor: 'text',
                paddingBottom: 600,
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
                        setZoom={setZoom}
                        zoom={zoom}
                    />
                ))}
            </WithStore>
            {footer}
            <DebugCard
                debug={debug}
                setDebug={setDebug}
                store={store}
                state={state}
                listing={listing}
                id={id}
                size={size}
            />
            <WithStore store={store}>
                <Cursors at={state.at} regs={state.regs} />
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
                    key={ns.top}
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
