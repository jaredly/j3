import React, {
    useCallback,
    useEffect,
    useMemo,
    useReducer,
    useState,
} from 'react';
import { layout } from '../../../src/layout';
import { emptyMap } from '../../../src/parse/parse';
import {
    StateChange,
    applyUpdate,
    getKeyUpdate,
    isRootPath,
} from '../../../src/state/getKeyUpdate';
import { Ctx, Env } from '../../../src/to-ast/library';
import { ListLikeContents, fromMCST } from '../../../src/types/mcst';
import { Cursors } from '../../custom/Cursors';
import { HiddenInput } from '../../custom/HiddenInput';
import { Hover, calc } from '../../custom/Hover';
import { Root } from '../../custom/Root';
import { Action, NUIState, UpdatableAction } from '../../custom/UIState';
import { UIStateChange, calcHistoryItem, undoRedo } from '../../custom/reduce';
import { verticalMove } from '../../custom/verticalMove';

// These register themselves into `./infer/types:algos`
// import '../infer/hm/j';
// import '../infer/hmx/hmx';
// import '../infer/algw-cr';
// import '../infer/mini';
// import '../infer/thih';

import { useLocalStorage } from '../../Debug';
import { paste } from '../../../src/state/clipboard';
import { Algo, Trace, algos } from '../infer/types';
import { newResults } from '../Test';

const names = ['what', 'w', 'w2', '10'];

const urlForId = (id: string) => `http://localhost:9189/tmp/${id}`;

const saveState = (id: string, state: NUIState) => {
    return fetch(urlForId(id), {
        method: 'POST',
        body: JSON.stringify(state),
        headers: { 'Content-type': 'application/json' },
    }).then(() => {});
};

function loadState(
    state: NUIState = {
        map: emptyMap(),
        root: -1,
        history: [],
        nidx: () => 0,
        clipboard: [],
        hover: [],
        regs: {},
        at: [],
    },
) {
    let idx = Object.keys(state.map).reduce((a, b) => Math.max(a, +b), 0) + 1;
    return {
        ...state,
        nidx: () => idx++,
    };
}

const useHash = (): string => {
    const [hash, update] = useState(location.hash);
    useEffect(() => {
        const fn = () => {
            update(location.hash);
        };
        window.addEventListener('hashchange', fn);
        return () => window.removeEventListener('hashchange', fn);
    }, []);
    return hash;
};

export const Outside = () => {
    const [listing, setListing] = useState(null as null | string[]);
    const hash = useHash();

    useEffect(() => {
        fetch(urlForId(''))
            .then((res) => res.json())
            .then(setListing);
    }, []);

    const [name, setName] = useState('');

    if (hash) {
        return (
            <div>
                <div>
                    {listing?.map((name) => (
                        <a href={'#' + name} key={name}>
                            {name}
                        </a>
                    ))}
                </div>
                <Loader id={hash.slice(1)} />
            </div>
        );
    }

    return (
        <div>
            Filessss
            <div>
                {listing?.map((name) => (
                    <a href={'#' + name} key={name}>
                        {name}
                    </a>
                ))}
                <input
                    value={name}
                    onChange={(evt) => setName(evt.target.value)}
                />
                <a href={`#${name}`}>Get me a new one</a>
            </div>
        </div>
    );
};

export const Loader = ({ id }: { id: string }) => {
    const save = useMemo(
        () => debounce<NUIState>((state) => saveState(id, state), 500),
        [id],
    );

    const [initial, setInitial] = useState(null as null | NUIState);

    useEffect(() => {
        fetch(urlForId(id)).then(
            (res) =>
                res.status === 200
                    ? res.json().then((state) => {
                          setInitial(loadState(state));
                      })
                    : setInitial(loadState()),
            (err) => {
                setInitial(loadState());
            },
        );
    }, [id]);

    if (!initial) return <div>Loading...</div>;

    return (
        <div>
            <GroundUp id={id} save={save} initial={initial} />
        </div>
    );
};

/**
 * Debounce a function.
 */
export const debounce = <T,>(
    fn: (arg: T) => Promise<void>,
    time: number,
): ((arg: T) => void) => {
    let tid = null as null | NodeJS.Timeout;
    let last = Date.now();
    let wait = null as null | Promise<void>;
    return async (arg: T) => {
        // console.log('called', arg);
        if (tid != null) {
            clearTimeout(tid);
            tid = null;
        }
        const now = Date.now();

        if (wait) {
            await wait;
            // console.log('waited');
        }

        if (now > last + time) {
            last = now;
            // console.log('calling immediate');
            wait = fn(arg);
            return;
        }
        tid = setTimeout(() => {
            tid = null;
            last = now;
            // console.log('calling delayed');
            wait = fn(arg);
        }, time);
    };
};

export const GroundUp = ({
    id,
    initial,
    save,
}: {
    id: string;
    initial: NUIState;
    save: (state: NUIState) => void;
}) => {
    const [state, dispatch] = useReducer(reduce, null, (): NUIState => initial);

    const [debug, setDebug] = useState(true);

    useEffect(() => {
        save({ ...state, regs: {} });
    }, [state.map, id]);

    const [hidden, setHidden] = useState({} as { [idx: number]: boolean });
    const tops = (state.map[state.root] as ListLikeContents).values.filter(
        (t) => !hidden[t],
    );

    const results = useMemo(() => {
        const results = newResults();

        tops.map((top) => {
            layout(top, 0, state.map, results.display, results.hashNames, true);
        });

        return results;
    }, [state.map]);
    // const results = useMemo(() => {
    //     return calcResults(state, algos[alg]);
    // }, [state.map, k, alg]);

    const start = state.at.length ? state.at[0].start : null;
    const selTop = start?.[1].idx;
    // @ts-ignore
    // window.data = selTop ? results.tops[selTop].data : null;

    return (
        <div>
            {/* <div>
                {Object.keys(algos).map((algo) => (
                    <button
                        key={algo}
                        onClick={() => setAlg(algo)}
                        style={algo === alg ? { fontWeight: 'bold' } : {}}
                    >
                        {algo}
                    </button>
                ))}
            </div> */}
            <HiddenInput
                hashNames={{}}
                state={state}
                dispatch={dispatch}
                menu={undefined}
            />
            <Root
                state={state}
                dispatch={dispatch}
                tops={tops}
                debug={false}
                clickTop={(top) => setHidden((t) => ({ ...t, [top]: true }))}
                // showTop={(top) =>
                //     (results.tops[top].failed ? '🚨 ' : '') +
                //     results.tops[top].summary
                // }
                results={results}
            />
            <button
                onClick={() => setDebug(!debug)}
                style={{
                    position: 'absolute',
                    top: 4,
                    right: 4,
                }}
            >
                {debug ? 'Debug on' : 'Debug off'}
            </button>
            <Hover
                state={state}
                dispatch={dispatch}
                calc={() => {
                    // for (let i = state.hover.length - 1; i >= 0; i--) {
                    //     const last = state.hover[i].idx;
                    //     const typ = results.typs[last];
                    //     if (typ) {
                    //         return [{ idx: last, text: typToString(typ) }];
                    //     }
                    // }
                    return [];
                }}
            />
            <Cursors at={state.at} regs={state.regs} />
            {/* {selTop ? JSON.stringify(results.tops[selTop].data) : null} */}
            {/* {selTop != null ? <ViewJson v={results.tops[selTop].data} /> : null} */}
            {/* {JSON.stringify(state.at)} */}
            {/* <div>{JSON.stringify(state.hover)}</div> */}
        </div>
    );
};

const white = (n: number) => ''.padStart(n, ' ');

const stringify = (v: any, level: number, max: number): string => {
    if (level === max) {
        return JSON.stringify(v);
    }
    const id = white(level * 2);
    if (Array.isArray(v)) {
        if (!v.length) return '[]';
        return `[\n${v
            .map((n) => id + stringify(n, level + 1, max))
            .join('\n')}\n${white(level * 2 - 2)}]`;
    }
    if (v && typeof v === 'object') {
        const items = Object.entries(v);
        if (!items.length) return '{}';
        return `{\n${items
            .map(([k, v]) => id + `${k}: ${stringify(v, level + 1, max)}`)
            .join('\n')}\n${white(level * 2 - 2)}}`;
    }
    return JSON.stringify(v);
};

const ViewJson = ({ v }: { v: any[] }) => {
    const [level, setLevel] = useLocalStorage('view-json', () => 1);
    return (
        <div>
            <input
                type="range"
                min="1"
                max="30"
                style={{ width: 400 }}
                value={level}
                onChange={(evt) => setLevel(+evt.target.value)}
            />
            {v.map((item, i) => (
                <pre key={i}>{stringify(item, 1, 1 + level)}</pre>
            ))}
        </div>
    );
};

export const reduce = (state: NUIState, action: Action): NUIState => {
    if (action.type === 'undo' || action.type === 'redo') {
        return undoRedo(state, action.type);
    }
    if (action.type === 'yank') {
        return state;
    }
    // if (action.type === 'reset') {
    //     return action.state;
    // }
    const update = actionToUpdate(state, action);
    if (!update) {
        return state;
    }
    const next = reduceUpdate(state, update);
    const item = calcHistoryItem(state, next, '');
    if (item) {
        next.history = state.history.concat([item]);
    }
    return next;
};

export const reduceUpdate = (
    state: NUIState,
    update: StateChange | UIStateChange,
): NUIState => {
    if (!update) {
        return state;
    }
    switch (update.type) {
        case 'full-select':
            return { ...state, at: update.at, menu: undefined };
        case 'ui':
            return {
                ...state,
                clipboard: update.clipboard ?? state.clipboard,
                hover: update.hover ?? state.hover,
            };
        case 'menu':
            return { ...state, menu: update.menu };
        case 'select':
        case 'update':
            state = { ...state, ...applyUpdate(state, 0, update) };
            return state;
        case 'namespace-rename':
            console.warn('ignoring namespace rename');
            return state;
        // return state;
        default:
            const _: never = update;
            throw new Error('nope update');
    }
};

const actionToUpdate = (
    state: NUIState,
    action: UpdatableAction,
): StateChange | UIStateChange | void => {
    switch (action.type) {
        case 'hover':
            return { type: 'ui', hover: action.path };
        case 'menu':
            return { type: 'menu', menu: { selection: action.selection } };
        case 'key':
            if (!state.at.length) {
                return;
            }
            if (action.key === 'ArrowUp' || action.key === 'ArrowDown') {
                return verticalMove(
                    { ...state, menu: undefined },
                    action.key === 'ArrowUp',
                    action.mods,
                );
            }
            if (action.key === 'Escape') {
                return {
                    type: 'menu',
                    menu: { dismissed: true, selection: 0 },
                };
            }
            return getKeyUpdate(
                action.key,
                state.map,
                state.at[0],
                // TODO do I want some hashnames?
                {},
                state.nidx,
                action.mods,
            );
        case 'select':
            // Ignore attempts to select the root node
            if (action.at.some((at) => isRootPath(at.start))) {
                return;
            }
            return {
                type: 'full-select',
                at: action.add ? state.at.concat(action.at) : action.at,
            };
        case 'paste': {
            const res = paste(state, {}, action.items, false);
            // console.log(res);
            return res;
        }
        // case 'namespace-rename':
        //     return action;
    }
};

export function calcResults(
    state: NUIState,
    { builtins, getTrace, infer, parse, typToString }: Algo<any, any, any>,
    doLayout = true,
) {
    const tops = (state.map[state.root] as ListLikeContents).values;
    const results: Ctx['results'] & {
        tops: {
            [key: number]: {
                summary: string;
                data: Trace[];
                failed: boolean;
                expr?: any;
            };
        };
        typs: { [loc: number]: any };
    } = {
        display: {},
        errors: {},
        globalNames: {},
        hashNames: {},
        localMap: {
            terms: {},
            types: {},
        },
        mods: {},
        toplevel: {},
        tops: {},
        typs: {},
    };

    tops.forEach((top) => {
        const node = fromMCST(top, state.map);
        const errors = {};
        const expr = parse(node, { errors, display: results.display });
        if (expr) {
            try {
                const typ = infer(builtins, expr, {
                    display: results.display,
                    typs: results.typs,
                });
                const trace = getTrace();
                // console.log(typ);
                results.tops[top] = {
                    summary: typToString(typ),
                    data: trace,
                    failed: false,
                    expr,
                };
            } catch (err) {
                // console.log('no typ sorry', err);
                results.tops[top] = {
                    summary: 'Type Error: ' + (err as Error).message,
                    data: getTrace(),
                    failed: true,
                };
            }
        } else {
            results.tops[top] = {
                summary: 'not parse: ' + Object.values(errors).join('; '),
                data: getTrace(),
                failed: true,
            };
        }

        if (doLayout) {
            layout(top, 0, state.map, results.display, results.hashNames, true);
        }
    });

    return results;
}

export function stateFromMap(map: NUIState['map']): NUIState {
    let idx = Object.keys(map).reduce((a, b) => Math.max(a, +b), 0) + 1;
    return {
        map,
        root: -1,
        history: [],
        nidx: () => idx++,
        clipboard: [],
        hover: [],
        regs: {},
        at: [],
    };
}
