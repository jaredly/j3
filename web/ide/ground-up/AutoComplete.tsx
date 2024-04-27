import * as React from 'react';
import { useGetStore, useSubscribe } from '../../custom/store/StoreCtx';
import { calcCursorPos } from '../../custom/Cursors';
import { hierarchy } from 'd3';
import { ProduceItem } from './FullEvalator';

export const AutoComplete = () => {
    const [hidden, setHidden] = React.useState(false);

    React.useEffect(() => {
        const fn = (evt: KeyboardEvent) => {
            if (evt.key === 'Escape') {
                setHidden(true);
            }
        };
        document.addEventListener('keydown', fn);
        return () => document.removeEventListener('keydown', fn);
    }, []);

    const store = useGetStore();
    const data = useSubscribe(
        () => {
            const state = store.getState();
            const results = store.getResults();
            if (state.at.length !== 1) return null;
            if (state.at[0].end) return null;
            const path = state.at[0].start;
            const last = path[path.length - 1];
            const node = state.map[last.idx];
            if (!node) return null;
            if (node.type !== 'identifier') {
                return null;
            }
            const pos = calcCursorPos(path, state.regs, true);
            if (!pos) return;
            const ns = path.find((n) => n.type === 'ns-top')?.idx;
            if (ns == null) return;
            const missings = results.workerResults.nodes[ns].produce
                .filter(
                    (p): p is Extract<typeof p, { type: 'inference-error' }> =>
                        typeof p !== 'string' && p.type === 'inference-error',
                )
                .map((p) => p.err);
            const isMissing = missings.some(
                (p) =>
                    p.type === 'missing' &&
                    p.missing.some((m) => m.loc === last.idx),
            );
            if (!isMissing) return null;

            setHidden(false);
            return {
                pos: { top: pos.top, left: pos.left, height: pos.height },
            };
            // return null
        },
        (fn) => {
            const fns = [store.on('selection', fn), store.on('results', fn)];
            return () => fns.forEach((f) => f());
        },
        [],
    );

    if (!data || hidden) return null;

    return (
        <div
            style={{
                position: 'absolute',
                zIndex: 50,
                top: data.pos.top + data.pos.height,
                left: data.pos.left,
                backgroundColor: 'black',
                color: 'white',
            }}
        >
            Autocomplete????
        </div>
    );
};
