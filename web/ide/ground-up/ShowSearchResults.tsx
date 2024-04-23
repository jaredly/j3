import React, { useMemo } from 'react';
import { SearchResults } from './GroundUp';
import { useGetStore } from '../../custom/store/StoreCtx';
import { RenderStatic } from '../../custom/RenderStatic';
import { RenderNNode } from '../../custom/Render';
import { getNestedNodes } from '../../../src/state/getNestedNodes';
import { fromMCST } from '../../../src/types/mcst';

export const ShowSearchResults = ({
    results,
    setResults,
}: {
    results: SearchResults;
    setResults: (r: SearchResults) => void;
}) => {
    const store = useGetStore();
    const data = useMemo(() => {
        const state = store.getState();
        const r2 = store.getResults().results;
        return results.map((r, i) => {
            const node = fromMCST(r.path[r.path.length - 2].idx, state.map);
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
                        <RenderStatic node={node} />
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
            }}
        >
            {data}
        </div>
    );
};
