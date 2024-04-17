import React, { useEffect, useState } from 'react';
import { Ctx } from '../../src/to-ast/library';
import { nodeForType } from '../../src/to-cst/nodeForType';
import { nodeToString } from '../../src/to-cst/nodeToString';
import type { Error } from '../../src/types/types';
import { advancePath } from '../ide/ground-up/findTops';
import { CursorRect, subRect } from './Cursors';
import { NUIState, UIState } from './UIState';
import { useGetStore } from './store/StoreCtx';
import { WorkerResults } from './store/useSyncStore';

export const getRegNode = (idx: number, regs: UIState['regs']) => {
    const got = regs[idx];
    return got?.main?.node ?? got?.start?.node ?? got?.outside?.node;
};

export const calc = (
    state: NUIState,
    results: Ctx['results'],
    errorToString: (err: Error) => void,
) => {
    let found: { idx: number; text: string }[] = [];
    for (let i = state.hover.length - 1; i >= 0; i--) {
        let idx = state.hover[i].idx;
        if (idx === -1) continue;
        if (results.errors[idx]?.length) {
            found.push({
                idx,
                text: results.errors[idx]
                    .map((err) => errorToString(err))
                    .join('\n'),
            });
        }
    }
    const last = state.hover[state.hover.length - 1]?.idx;
    if (last != null) {
        const style = results.display[last]?.style;
        if (
            (style?.type === 'id' ||
                style?.type === 'id-decl' ||
                style?.type === 'tag') &&
            style.ann
        ) {
            found.push({
                idx: last,
                text: nodeToString(
                    nodeForType(style.ann, results.hashNames),
                    results.hashNames,
                ),
            });
        }
    }

    return found;
};

type StyleProp = NonNullable<React.ComponentProps<'div'>['style']>;

export const Hover = ({}: {}) => {
    const [show, setShow] = useState(false);
    const hover = useHover(show);

    useEffect(() => {
        const down = (evt: KeyboardEvent) => {
            if (evt.key === 'Alt') {
                setShow(true);
            }
        };
        const up = (evt: KeyboardEvent) => {
            if (evt.key === 'Alt') {
                setShow(false);
            }
            // console.log(evt.key);
        };
        document.addEventListener('keydown', down);
        document.addEventListener('keyup', up);
        return () => {
            document.removeEventListener('keydown', down);
            document.removeEventListener('keyup', up);
        };
    }, []);

    if (!hover || !show) return null;

    const { box, found } = hover;

    return (
        <div>
            <div
                style={{
                    position: 'absolute',
                    whiteSpace: 'pre-wrap',
                    top: box.top + box.height + 5,
                    left: box.left,
                    pointerEvents: 'none',
                    padding: 8,
                    // maxHeight: 500,
                    overflow: 'auto',
                    zIndex: 1000,
                    backgroundColor: 'black',
                    color: '#777',
                    border: '1px solid #555',
                    display: 'block',
                    gridTemplateColumns: 'max-content max-content',
                }}
            >
                {found.map((f, i) => (
                    <div
                        key={i}
                        style={{
                            ...(i > 0
                                ? {
                                      borderTop:
                                          '1px solid rgba(200,200,200,0.4)',
                                      marginTop: 4,
                                      paddingTop: 4,
                                  }
                                : undefined),
                            ...f.style,
                        }}
                    >
                        {f.text}
                    </div>
                ))}
            </div>
        </div>
    );
};

type HoverItem = {
    idx: number;
    text: string;
    style?: StyleProp;
};

const useHover = (show: boolean) => {
    const [state, setState] = useState(
        null as null | { box: CursorRect; found: HoverItem[] },
    );
    const store = useGetStore();

    useEffect(() => {
        if (!show) return;

        const state = store.getState();
        const results = store.getResults().workerResults;
        setState(getHoverState(state, results));

        const f = (state: NUIState) => {
            setState(getHoverState(state, store.getResults().workerResults));
        };

        const one = store.on('hover', f);
        const two = store.on('hover', f);
        return () => {
            one();
            two();
        };
    }, [show]);

    return state;
};

function getHoverState(state: NUIState, results: WorkerResults) {
    const found = calculateHovers(state, results);
    if (!found.length) return null;
    const node = getRegNode(found[0].idx, state.regs);
    if (!node) return null;
    const box = subRect(
        node.getBoundingClientRect(),
        node.offsetParent!.getBoundingClientRect(),
    );
    return { box, found };
}

function calculateHovers(state: NUIState, results: WorkerResults): HoverItem[] {
    const hovers: HoverItem[] = [];

    const ns = state.hover.find((p) => p.type === 'ns-top');
    if (!ns) return [];

    // Check errors
    for (let i = state.hover.length - 1; i >= 0; i--) {
        const last = state.hover[i].idx;
        const node = state.map[last];
        let next;
        try {
            next = advancePath(state.hover[i], node, state, true);
        } catch (err) {
            continue;
        }
        if (!next) break;

        const idx = next.loc;
        const errs = results.nodes[ns.idx]?.errors[idx];
        if (errs?.length) {
            hovers.push({
                idx: idx,
                text: errs.join('\n'),
                style: {
                    color: '#f66',
                },
            });
            break;
        }
    }

    // Ok types
    for (let i = state.hover.length - 1; i >= 0; i--) {
        const last = state.hover[i].idx;
        const node = state.map[last];
        let next;
        try {
            next = advancePath(state.hover[i], node, state, true);
        } catch (err) {
            continue;
        }
        if (!next) break;

        const idx = next.loc;

        const current = results.nodes[ns.idx]?.hover[idx];
        if (current?.length) {
            hovers.push({ idx: idx, text: current.join('\n') });
            break;
        }
    }
    return hovers;
}
