import React from 'react';
import { OneLineResult } from '../old/ListLike';
import { setSelection, useStore } from '../store';
import { RenderProps } from './Overheat';

export const OutputWatcher = ({ top, idx }: RenderProps<any>) => {
    const _ = useStore(top.store, idx);
    // return <div>Results for {idx}</div>;
    return (
        <div
            style={{ paddingLeft: 16, cursor: 'text' }}
            onMouseDown={(evt) => {
                evt.stopPropagation();
                evt.preventDefault();
                setSelection(top.store, { idx, loc: 'end', from: 'right' });
            }}
        >
            <div style={{ height: 8 }} />
            <OneLineResult ctx={top.ctx.ctx} result={top.ctx.results[idx]} />
            <div style={{ height: 8 }} />
        </div>
    );
};
