import React, { useMemo } from 'react';
import { Node } from '../../../src/types/cst';
import { fromMCST } from '../../../src/types/mcst';
import { transformNode } from '../../../src/types/transform-cst';
import { RenderStatic } from '../../custom/RenderStatic';
import { useGetStore } from '../../custom/store/StoreCtx';
import { SearchResults } from './GroundUp';
import { findTops } from './findTops';

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
    const store = useGetStore();
    const data = useMemo(() => {
        const state = store.getState();
        const r2 = store.getResults().results;
        const allTops = findTops(store.getState()).map((t) => t.ns.id);
        return results.results
            .map((r, i) => {
                const ns = r.path.find((p) => p.type === 'ns-top')!.idx;
                const node = simplify(
                    fromMCST(r.path[r.path.length - 2].idx, state.map),
                );

                return { ns, node, r };
            })
            .sort((a, b) => allTops.indexOf(a.ns) - allTops.indexOf(b.ns))
            .map(({ ns, node, r }, i) => {
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
                                at: [{ start: r.path }],
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
                            <div
                                style={{
                                    margin: 18,
                                    marginTop: 0,
                                }}
                            >
                                <RenderStatic
                                    node={node}
                                    display={r2.nodes[ns].layout}
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
                overflow: 'auto',
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
                {results.results.length} results for "{results.term}"
            </div>
            {data}
        </div>
    );
};

function findMaxLoc(outer: Node) {
    let max = 0;
    transformNode(outer, {
        pre(node) {
            max = Math.max(max, node.loc);
        },
    });
    return max;
}
