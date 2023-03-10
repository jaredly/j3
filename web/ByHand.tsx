import React from 'react';
import { idText, parseByCharacter, selPos } from '../src/parse/parse';
import { nodeToString, remapPos, SourceMap } from '../src/to-cst/nodeToString';
import { fromMCST, ListLikeContents } from '../src/types/mcst';
import { getKeyUpdate } from './mods/getKeyUpdate';
import { selectEnd } from './mods/navigate';

const initialText =
    '(fn [one:two three:(four five)]:six {10 20 yes "ok ${(some [2 3 "inner" ..more] ..things)} and ${a}"})';

export const ByHand = () => {
    const [state, setState] = React.useState(() => {
        const map = parseByCharacter(initialText).map;
        const idx = (map[-1] as ListLikeContents).values[0];
        const at = selectEnd(
            idx,
            [{ idx: -1, child: { type: 'child', at: 0 } }],
            map,
        )!;
        return { map, root: idx, at };
    });

    const { back, sourceMap } = React.useMemo(() => {
        const sourceMap: SourceMap = { map: {}, cur: 0 };
        const back = nodeToString(fromMCST(state.root, state.map), sourceMap);
        return { back, sourceMap };
    }, [state.root, state.map]);

    const pos = remapPos(state.at.sel, sourceMap);
    console.log(state);

    React.useEffect(() => {
        const fn = (evt: KeyboardEvent) => {
            setState((state) => {
                console.log('ok', evt.key);

                try {
                    const curText = idText(state.map[state.at.sel.idx]) ?? '';
                    const pos = selPos(state.at.sel, curText);

                    const update = getKeyUpdate(
                        evt.key,
                        pos,
                        curText,
                        state.at.sel.idx,
                        state.at.path,
                        state.map,
                    );
                    if (update?.type === 'update' && update?.update) {
                        console.log('wat');
                        const map = { ...state.map };
                        Object.keys(update.update.map).forEach((key) => {
                            if (update.update!.map[+key] == null) {
                                delete map[+key];
                            } else {
                                map[+key] = update.update!.map[+key]!;
                            }
                        });
                        return {
                            ...state,
                            map,
                            at: {
                                sel: update.update.selection,
                                path: update.update.path,
                            },
                        };
                        // selection = update.update.selection;
                        // path = update.update.path;
                    } else if (update?.type === 'select') {
                        console.log('settings');
                        return {
                            ...state,
                            at: { sel: update.selection, path: update.path },
                        };
                    }
                } catch (err) {
                    console.log(err);
                }
                return state;
            });
        };
        document.addEventListener('keydown', fn);
        return () => document.removeEventListener('keydown', fn);
    }, []);

    return (
        <div style={{ padding: 16 }}>
            <div style={{ position: 'relative' }}>
                <span style={{ whiteSpace: 'pre' }}>{back}</span>
                <div
                    style={{
                        position: 'absolute',
                        height: '1em',
                        width: 2,
                        backgroundColor: 'red',
                        left: pos * 9.6,
                        top: 0,
                    }}
                />
            </div>
            <div>{JSON.stringify(state.at)}</div>
        </div>
    );
};
