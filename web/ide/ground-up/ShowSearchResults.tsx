import React, { useMemo } from 'react';
import { SearchResults } from './GroundUp';
import { useGetStore } from '../../custom/store/StoreCtx';
import { RenderStatic } from '../../custom/RenderStatic';
import { RenderNNode } from '../../custom/Render';
import { getNestedNodes } from '../../../src/state/getNestedNodes';
import { fromMCST } from '../../../src/types/mcst';
import { Node } from '../../../src/types/cst';
import { transformNode } from '../../../src/types/transform-cst';

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
        return results.map((r, i) => {
            const ns = r.path.find((p) => p.type === 'ns-top')!.idx;
            const node = simplify(
                fromMCST(r.path[r.path.length - 2].idx, state.map),
            );
            return (
                <div
                    key={i}
                    className="hover"
                    style={{
                        // margin: 24,
                        display: 'flex',
                        cursor: 'pointer!important',
                    }}
                    onClick={() => {
                        store.dispatch({
                            type: 'select',
                            at: [{ start: r.path }],
                        });
                    }}
                >
                    <button
                        onClick={() => {
                            setResults(results.filter((r, j) => j !== i));
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
                            // marginTop: 12,
                            // marginBottom: 12,
                            margin: 18,
                        }}
                    >
                        <RenderStatic
                            node={node}
                            display={r2.nodes[ns].layout}
                        />
                    </div>
                </div>
            );
            // const p = r.path[r.path.length - 1]
            // const idx = r.path.find(p => p.type === 'ns-top')!.idx
            // const nnode = getNestedNodes(state.map[p.idx], state.map, undefined, r2.nodes[idx].layout[p.idx].layout)
            // return <RenderNNode
            // nnode={nnode}
            // Recurse={Render}
            // />
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
                {results.length} results
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
