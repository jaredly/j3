import * as React from 'react';
import { useGetStore, useSubscribe } from '../../custom/store/StoreCtx';
import { calcCursorPos } from '../../custom/Cursors';
import { NUIState } from '../../custom/UIState';
import { CombinedResults } from '../../custom/store/Store';
import {
    FuzzyScore,
    compareScores,
    fuzzyScore,
} from '../../../src/to-ast/fuzzy';
import { useLatest } from '../../custom/useLatest';
import { Node } from '../../../src/types/cst';
import { RenderStatic } from '../../custom/RenderStatic';

const wait = 300;

export const AutoComplete = () => {
    const [hidden, setHidden] = React.useState(true);
    const [selection, setSelection] = React.useState(0);
    const [hover, setHover] = React.useState(null as null | number);

    const store = useGetStore();
    const data = useSubscribe(
        () => {
            const found = getAutoCompletePath(
                store.getState(),
                store.getResults(),
            );
            if (!found) {
                setHidden(true);
                return null;
            }
            const { pos, name, path, auto } = found;
            const last = path[path.length - 1];

            return {
                pos: { top: pos.top, left: pos.left, height: pos.height },
                auto: auto.map((auto) => ({
                    ...auto,
                    action: () =>
                        store.dispatch({
                            type: 'update',
                            map: {
                                [last.idx]: {
                                    type: 'identifier',
                                    loc: last.idx,
                                    text: auto.name,
                                },
                            },
                            selection: path
                                .slice(0, -1)
                                .concat([{ type: 'end', idx: last.idx }]),
                        }),
                })),
            };
        },
        (fn) => {
            const fns = [store.on('selection', fn), store.on('results', fn)];
            return () => fns.forEach((f) => f());
        },
        [],
    );

    React.useEffect(() => {
        if (!data) return;
        const tid = setTimeout(() => {
            setHidden(false);
            setSelection(0);
        }, wait);
        return () => clearTimeout(tid);
    }, [data]);

    const latest = useLatest(data);
    const isHidden = useLatest(hidden);
    const latestSel = useLatest(selection);

    React.useEffect(() => {
        const fn = (evt: KeyboardEvent) => {
            const { current: data } = latest;
            if (!data || isHidden.current) return;
            const items = data.auto;
            if (evt.key === 'Escape') {
                evt.preventDefault();
                evt.stopPropagation();
                setHidden(true);
                return;
            }
            if (evt.key === 'Enter') {
                evt.stopPropagation();
                evt.preventDefault();
                setHidden(true);
                items[latestSel.current]?.action();
                return;
            }

            if (data.auto.length < 2) return;
            if (evt.key === 'ArrowDown') {
                evt.preventDefault();
                evt.stopPropagation();
                setSelection((s) => (s >= items.length - 1 ? 0 : s + 1));
                return;
            }
            if (evt.key === 'ArrowUp') {
                evt.preventDefault();
                evt.stopPropagation();
                setSelection((s) => (s <= 0 ? items.length - 1 : s - 1));
                return;
            }
        };
        document.addEventListener('keydown', fn, { capture: true });
        return () =>
            document.removeEventListener('keydown', fn, { capture: true });
    }, []);

    if (!data || !data.auto.length || hidden) return null;

    return (
        <div
            style={{
                position: 'absolute',
                zIndex: 50,
                top: data.pos.top + data.pos.height,
                left: data.pos.left,
                backgroundColor: 'black',
                color: 'white',
                border: '1px solid rgba(200,200,200,0.2)',
            }}
        >
            {data.auto.map(({ name, loc, score, action, type }, i) => (
                <div
                    key={i}
                    onMouseEnter={() => setHover(i)}
                    onMouseLeave={() => setHover(null)}
                    onClick={() => {
                        setHidden(true);
                        action();
                    }}
                    style={{
                        cursor: 'pointer',
                        padding: '4px 8px',
                        backgroundColor:
                            i === hover
                                ? 'rgba(255,255,255,0.2)'
                                : i === selection
                                ? 'rgba(255,255,255,0.1)'
                                : 'unset',
                    }}
                >
                    {name}
                    {type ? (
                        <div>
                            <RenderStatic node={type} />
                        </div>
                    ) : null}
                </div>
            ))}
        </div>
    );
};

const getAutoCompletePath = (state: NUIState, results: CombinedResults) => {
    if (state.at.length !== 1) return null;
    if (state.at[0].end) return null;
    const path = state.at[0].start;
    const last = path[path.length - 1];
    const node = state.map[last.idx];
    if (!node) return null;
    if (node.type !== 'identifier') {
        return null;
    }
    const ns = path.find((n) => n.type === 'ns-top')?.idx;
    if (ns == null) return;
    const missings = results.workerResults.nodes[ns]?.produce
        .filter(
            (p): p is Extract<typeof p, { type: 'inference-error' }> =>
                typeof p !== 'string' && p.type === 'inference-error',
        )
        .map((p) => p.err);
    const isMissing = missings?.some(
        (p) =>
            p.type === 'missing' && p.missing.some((m) => m.loc === last.idx),
    );
    if (!isMissing) return null;

    // So ... all the names .......? right?
    // results.results
    const auto = getAutoCompletes(node.text, results);

    const pos = calcCursorPos(path, state.regs, true);
    if (!pos) return;
    return { path, name: node.text, pos, auto };
};

const getAutoCompletes = (text: string, results: CombinedResults) => {
    const found: {
        score: FuzzyScore;
        name: string;
        loc: number;
        type: Node;
    }[] = [];
    const typesByName: Record<string, Node> = {};

    Object.entries(results.workerResults.nodes).forEach(([ns, node]) => {
        node.produce.forEach((item) => {
            if (
                typeof item !== 'string' &&
                item.type === 'type' &&
                item.name &&
                item.cst
            ) {
                typesByName[item.name] = item.cst;
            }
        });
    });

    // Object.entries(results.results.nodes).forEach(([ns, node]) => {
    //     if (node.parsed?.type === 'success') {
    //         node.parsed.names.forEach(name => {
    //             if (name.kind === 'value') return;
    //             const score = fuzzyScore(0, text, name.name);
    //             if (!score.full) return;
    //             results.workerResults.nodes[+ns].produce.forEach(item => {
    //                 if (typeof item !== 'string' && item.type === 'type') {
    //                     if (item.name === name.name) {
    //                     }
    //                 }
    //             })
    //         })
    //     }
    // })

    Object.entries(results.results.jumpToName.value).forEach(([name, loc]) => {
        const score = fuzzyScore(0, text, name);
        if (!score.full) return;
        found.push({ score, name, loc, type: typesByName[name] });
    });

    return found.sort((a, b) => compareScores(a.score, b.score));
};
