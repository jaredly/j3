import React, { useEffect, useState } from 'react';
import { nodesEqual } from '../../src/types/cst';
import { fromMCST } from '../../src/types/mcst';
import { advancePath } from '../ide/ground-up/findTops';
import { subRect } from './Cursors';
import { RenderStatic } from './RenderStatic';
import { NUIState, UIState } from './UIState';
import { CombinedResults } from './store/Store';
import { useGetStore, useSubscribe } from './store/StoreCtx';
import { HoverContents } from './worker/types';

const getRegNode = (idx: number, regs: UIState['regs']) => {
    const got = regs[idx];
    return got?.main?.node ?? got?.outside?.node ?? got?.start?.node;
};

// export const calc = (
//     state: NUIState,
//     results: Ctx['results'],
//     errorToString: (err: Error) => void,
// ) => {
//     let found: { idx: number; text: string }[] = [];
//     for (let i = state.hover.length - 1; i >= 0; i--) {
//         let idx = state.hover[i].idx;
//         if (idx === -1) continue;
//         if (results.errors[idx]?.length) {
//             found.push({
//                 idx,
//                 text: results.errors[idx]
//                     .map((err) => errorToString(err))
//                     .join('\n'),
//             });
//         }
//     }
//     const last = state.hover[state.hover.length - 1]?.idx;
//     if (last != null) {
//         const style = results.display[last]?.style;
//         if (
//             (style?.type === 'id' ||
//                 style?.type === 'id-decl' ||
//                 style?.type === 'tag') &&
//             style.ann
//         ) {
//             found.push({
//                 idx: last,
//                 text: nodeToString(
//                     nodeForType(style.ann, results.hashNames),
//                     results.hashNames,
//                 ),
//             });
//         }
//     }

//     return found;
// };

type StyleProp = NonNullable<React.ComponentProps<'div'>['style']>;

export const Hover = ({}: {}) => {
    const [show, setShow] = useState(false);
    const hover = useHover(show);

    const store = useGetStore();
    // const hoverLoc = useSubscribe(
    //     () => store.getState().hover,
    //     (fn) => store.on('hover', fn),
    //     [],
    // );
    const state = useSubscribe(
        () => store.getState(),
        (fn) => store.on('all', fn),
        [],
    );

    useEffect(() => {
        setShow(false);
        const tid = setTimeout(() => {
            setShow(true);
        }, 400);
        return () => clearTimeout(tid);
    }, [state]);

    if (!hover || !show) return null;

    const { box, found } = hover;

    return (
        <div>
            <div
                style={{
                    position: 'absolute',
                    whiteSpace: 'pre-wrap',
                    top: box.bottom + 5,
                    left: box.left,
                    pointerEvents: 'none',
                    // padding: 8,
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
                                      //   marginTop: 4,
                                      //   paddingTop: 4,
                                  }
                                : undefined),
                            ...f.style,
                        }}
                    >
                        {f.contents.type === 'change' ||
                        f.contents.type === 'type' ? (
                            <div
                                style={{
                                    // fontWeight: 'bold',
                                    fontSize: '80%',
                                    fontFamily: 'Inter',
                                    backgroundColor:
                                        f.contents.type === 'change'
                                            ? 'rgb(36 20 20)'
                                            : 'rgb(20 20 36)',
                                    padding: '4px 8px',
                                    color: '#aaa',
                                }}
                            >
                                {f.contents.type === 'type'
                                    ? 'Type'
                                    : f.contents.node
                                    ? 'Previous Version'
                                    : 'This Node was added'}
                            </div>
                        ) : null}
                        {f.contents.type === 'text' ? (
                            <div style={{ padding: 8 }}>{f.contents.text}</div>
                        ) : f.contents.node ? (
                            <div style={{ padding: 8 }}>
                                <RenderStatic
                                    node={f.contents.node}
                                    parent={
                                        f.contents.type === 'change'
                                            ? f.contents.parent
                                            : undefined
                                    }
                                />
                            </div>
                        ) : null}
                    </div>
                ))}
            </div>
        </div>
    );
};

// const RenderNode = ({node}: {node: Node}) => {
//     const nested = useMemo(() => {
//         const map: Map = {}
//         const num = toMCST(node, map)
//         return getNestedNodes(map[num], map)
//     }, [])
//     return <RenderStatic node={} />
// }

type HoverItem = {
    idx: number;
    contents: HoverContents;
    style?: StyleProp;
};

const useHover = (show: boolean) => {
    const store = useGetStore();
    return useSubscribe(
        () => {
            const state = store.getState();
            const results = store.getResults();
            return getHoverState(state, results);
        },
        (fn) => [store.on('hover', fn), store.on('results', fn)],
        [],
    );
};

function getHoverState(state: NUIState, results: CombinedResults) {
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

function calculateHovers(
    state: NUIState,
    results: CombinedResults,
): HoverItem[] {
    const hovers: HoverItem[] = [];

    const ns = state.hover.find((p) => p.type === 'ns-top');
    if (!ns) return [];

    // Changes!
    if (state.trackChanges) {
        for (let i = state.hover.length - 1; i >= 0; i--) {
            const last = state.hover[i];
            if (last.type === 'ns' || last.type === 'card') break;

            const node = state.map[last.idx];
            let next;
            try {
                next = advancePath(state.hover[i], node, state, true);
            } catch (err) {
                continue;
            }
            if (!next) break;

            const prev = state.trackChanges.previous[next.loc];
            // A change!
            if (prev !== undefined) {
                // const parent = state.hover[i - i].idx;
                if (
                    true
                    // prev !== null
                    // || state.trackChanges.previous[last.idx] !== null
                ) {
                    hovers.push({
                        idx: next.loc,
                        contents: {
                            type: 'change',
                            node: prev
                                ? fromMCST(prev.loc, {
                                      ...state.map,
                                      ...state.trackChanges.previous,
                                  })
                                : null,
                            parent:
                                prev && getIsLet(state, last.idx)
                                    ? 'let'
                                    : undefined,
                        },
                        style: {
                            // backgroundColor: 'rgb(36 20 20)',
                        },
                    });
                    break;
                }
            }
        }
    }

    // Check errors
    for (let i = state.hover.length - 1; i >= 0; i--) {
        const last = state.hover[i];
        if (last.type === 'ns' || last.type === 'card') break;
        const node = state.map[last.idx];
        let next;
        try {
            next = advancePath(state.hover[i], node, state, true);
        } catch (err) {
            continue;
        }
        if (!next) break;

        const idx = next.loc;
        const parsed = results.results.nodes[ns.idx]?.parsed;
        if (parsed?.type === 'failure') {
            const errs = parsed.errors[idx];
            if (errs?.length) {
                hovers.push({
                    idx: idx,
                    contents: {
                        type: 'text',
                        text: errs.join('\n'),
                    },
                    style: {
                        color: '#f66',
                    },
                });
                break;
            }
        }

        if (parsed?.type === 'success') {
            const errs = parsed.errors.filter((k) => k[0] === idx);
            if (errs?.length) {
                hovers.push({
                    idx: idx,
                    contents: {
                        type: 'text',
                        text: errs.map((k) => k[1]).join('\n'),
                    },
                    style: {
                        color: '#f66',
                    },
                });
                break;
            }
        }

        const errs = results.workerResults.nodes[ns.idx]?.errors[idx];
        if (errs?.length) {
            hovers.push({
                idx: idx,
                contents: {
                    type: 'text',
                    text: errs.join('\n'),
                },
                style: {
                    color: '#f66',
                },
            });
            break;
        }
    }

    // Ok types
    for (let i = state.hover.length - 1; i >= 0; i--) {
        const last = state.hover[i];
        if (last.type === 'ns' || last.type === 'card') break;
        const node = state.map[last.idx];
        let next;
        try {
            next = advancePath(state.hover[i], node, state, true);
        } catch (err) {
            continue;
        }
        if (!next) break;

        const idx = next.loc;

        const current = results.workerResults.nodes[ns.idx]?.hover[idx];
        if (current?.length) {
            for (let item of current) {
                if (item.type === 'text') {
                    if (
                        hovers.some(
                            (h) =>
                                h.contents.type === 'text' &&
                                h.contents.text === item.text,
                        )
                    ) {
                        continue;
                    }
                } else if (item.type === 'type') {
                    if (
                        hovers.some(
                            (h) =>
                                h.contents.type === 'type' &&
                                nodesEqual(h.contents.node, item.node),
                        )
                    ) {
                        continue;
                    }
                }
                hovers.push({ idx, contents: item });
            }
            break;
        }
    }
    return hovers;
}
function getIsLet(state: NUIState, parentIdx: number) {
    const parent = state.map[parentIdx];
    let isLet = false;
    if (parent?.type === 'list' && parent.values.length > 0) {
        const first = state.map[parent.values[0]];
        if (
            first.type === 'identifier' &&
            (first.text === 'let' || first.text === 'let->')
        ) {
            isLet = true;
        }
    }
    return isLet;
}
