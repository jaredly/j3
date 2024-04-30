import React, { useEffect, useMemo, useState } from 'react';
import { Node } from '../../../src/types/cst';
import { fromMCST } from '../../../src/types/mcst';
import { transformNode } from '../../../src/types/transform-cst';
import { RenderReadOnly, RenderStatic } from '../../custom/RenderStatic';
import { useGetStore } from '../../custom/store/StoreCtx';
import { SearchResults } from './GroundUp';
import { findTops } from './findTops';
import { NUIState } from '../../custom/UIState';
import { collectPaths, pathForIdx } from './pathForIdx';
import { Path } from '../../../src/state/path';

const simplify = (outer: Node) => {
    let max = findMaxLoc(outer) + 1;

    return transformNode(outer, {
        pre(node, path) {
            if (path.length > 2 && node.type !== 'identifier') {
                return { type: 'identifier', loc: max++, text: '...' };
            }
            const maxlen = 7;
            if (
                (node.type === 'list' ||
                    node.type === 'array' ||
                    node.type === 'record') &&
                node.values.length > maxlen
            ) {
                return {
                    ...node,
                    values: node.values
                        .slice(0, maxlen)
                        .concat([
                            { type: 'identifier', loc: max++, text: '...' },
                        ]),
                };
            }
        },
    });
};

export const ShowSearchResults = ({
    results,
    setResults,
}: {
    results: SearchResults;
    setResults: (r: SearchResults | null) => void;
}) => {
    const [searchText, setSearchText] = useState('');
    const store = useGetStore();

    useEffect(() => {
        if (!searchText) return;
        const tid = setTimeout(() => {
            setResults({
                term: {
                    type: 'free',
                    text: searchText,
                },
                results: freeTextSearch(store.getState(), searchText).slice(
                    0,
                    100,
                ),
            });
        }, 200);
        return () => clearTimeout(tid);
    }, [searchText]);

    const data = useMemo(() => {
        const state = store.getState();
        const r2 = store.getResults().results;
        const allTops = findTops(store.getState()).map((t) => t.ns.id);
        return results.results
            .map((r, i) => {
                const ns = r.path.find((p) => p.type === 'ns-top')!.idx;
                let at = getContext(r);

                return { ns, at, r };
            })
            .sort((a, b) => allTops.indexOf(a.ns) - allTops.indexOf(b.ns))
            .map(({ ns, at, r }, i) => {
                // I want to ... sort results ... by ns location

                const parsed = r2.nodes[ns].parsed;
                let container;
                if (parsed?.type === 'success') {
                    const names = parsed.names;
                    container = names.length ? names[0].name : '<eval>';
                } else if (parsed?.type === 'plugin') {
                    container = '<plugin>';
                } else {
                    container = '<parse error>';
                }

                return (
                    <div
                        key={i}
                        className="hover"
                        onClick={() => {
                            store.dispatch({
                                type: 'select',
                                at: [
                                    {
                                        // ugh hack
                                        start: [
                                            'start',
                                            'end',
                                            'subtext',
                                            'text',
                                        ].includes(
                                            r.path[r.path.length - 1].type,
                                        )
                                            ? r.path
                                            : r.path.concat({
                                                  type: 'end',
                                                  idx: r.idx,
                                              }),
                                    },
                                ],
                            });
                        }}
                    >
                        <div
                            style={{
                                opacity: 0.8,
                                marginTop: 18,
                                marginBottom: 8,
                                fontStyle: 'italic',
                            }}
                        >
                            {container}
                        </div>
                        <div
                            style={{
                                display: 'flex',
                                cursor: 'pointer!important',
                            }}
                        >
                            <button
                                onClick={() => {
                                    setResults({
                                        ...results,
                                        results: results.results.filter(
                                            (r, j) => j !== i,
                                        ),
                                    });
                                }}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    color: 'white',
                                    cursor: 'pointer',
                                }}
                            >
                                &times;
                            </button>
                            <div style={{ margin: 18, marginTop: 0 }}>
                                <RenderReadOnly
                                    key={at.idx}
                                    idx={at.idx}
                                    path={at.path}
                                />
                            </div>
                        </div>
                    </div>
                );
            });
    }, [results]);
    return (
        <div
            style={{
                position: 'fixed',
                top: 48,
                right: 24,
                border: '1px solid white',
                padding: 8,
                zIndex: 1000,
                backgroundColor: 'black',
                maxHeight: 'calc(100vh - 56px)',
                display: 'flex',
                flexDirection: 'column',
            }}
        >
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                }}
            >
                <button
                    onClick={() => setResults(null)}
                    style={{
                        backgroundColor: 'transparent',
                        border: 'none',
                        color: 'white',
                        cursor: 'pointer',
                        fontSize: '150%',
                        marginRight: 8,
                    }}
                >
                    &times;
                </button>
                {results.term.type === 'references' ? (
                    <div>
                        {results.results.length} results for "
                        {results.term.name}"
                    </div>
                ) : (
                    <div>
                        <input
                            autoFocus
                            value={searchText}
                            placeholder="Search for..."
                            onChange={(evt) => {
                                setSearchText(evt.target.value);
                            }}
                            onKeyDown={(evt) => {
                                if (evt.key === 'Escape') {
                                    setResults(null);
                                }
                            }}
                        />
                    </div>
                )}
            </div>
            <div style={{ flex: 1, overflow: 'auto', minHeight: 0 }}>
                {data}
            </div>
        </div>
    );
};

const freeTextSearch = (
    state: NUIState,
    text: string,
): SearchResults['results'] => {
    text = text.toLowerCase();
    const matches = Object.entries(state.map)
        .filter(([key, node]) => {
            if (
                (node.type === 'stringText' ||
                    node.type === 'comment' ||
                    node.type === 'identifier') &&
                node.text.toLowerCase().includes(text)
            ) {
                return true;
            }
            return false;
        })
        .slice(0, 100);
    const pathFor = collectPaths(state);
    return matches
        .map(([key]) => ({
            idx: +key,
            path: pathFor(+key)[0],
        }))
        .filter((m) => m.path);
};

function getContext(r: { idx: number; path: Path[] }) {
    const nat = r.path.findIndex((p) => p.type === 'ns-top');
    for (let i = 2; i > 0; i--) {
        if (nat <= r.path.length - i - 1) {
            // return r.path[r.path.length - i].idx;
            return {
                path: r.path.slice(0, -i),
                idx: r.path[r.path.length - i].idx,
            };
        }
    }
    // return r.idx;
    return r;
}

function findMaxLoc(outer: Node) {
    let max = 0;
    transformNode(outer, {
        pre(node) {
            max = Math.max(max, node.loc);
        },
    });
    return max;
}
