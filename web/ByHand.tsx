import React from 'react';
import { idText, parseByCharacter, selPos } from '../src/parse/parse';
import { nodeToString, remapPos, SourceMap } from '../src/to-cst/nodeToString';
import { fromMCST, ListLikeContents } from '../src/types/mcst';
import { getKeyUpdate } from './mods/getKeyUpdate';
import { selectEnd } from './mods/navigate';

const text =
    '(fn [one:two three:(four five)]:six {10 20 yes "ok ${(some [2 3 "inner" ..more] ..things)} and ${a}"})';

export const ByHand = () => {
    const map = React.useMemo(() => parseByCharacter(text).map, []);
    const idx = (map[-1] as ListLikeContents).values[0];
    const { back, sourceMap } = React.useMemo(() => {
        const sourceMap: SourceMap = { map: {}, cur: 0 };
        const back = nodeToString(fromMCST(idx, map), sourceMap);
        return { back, sourceMap };
    }, []);
    const [at, setAt] = React.useState(
        () =>
            selectEnd(
                idx,
                [{ idx: -1, child: { type: 'child', at: 0 } }],
                map,
            )!,
    );
    const pos = remapPos(at.sel, sourceMap);

    return (
        <div>
            <span>{text.slice(0, pos) + '|' + text.slice(pos)}</span>
            <textarea
                onKeyDown={(evt) => {
                    console.log('ok', evt.key);
                    if (evt.key === 'ArrowLeft') {
                        const curText = idText(map[at.sel.idx]) ?? '';
                        const pos = selPos(at.sel, curText);

                        const update = getKeyUpdate(
                            'ArrowLeft',
                            pos,
                            curText,
                            at.sel.idx,
                            at.path,
                            map,
                        );
                        if (update?.type !== 'select') {
                            console.log('wat');
                        } else {
                            console.log(update);
                            setAt({ sel: update.selection, path: update.path });
                        }
                    } else if (evt.key === 'ArrowRight') {
                    }
                }}
            />
            <div>{JSON.stringify(at)}</div>
        </div>
    );
};
