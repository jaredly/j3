import { Path } from '../store';
import { Map, MNode, MNodeExtra } from '../../src/types/mcst';
import { nidx } from '../../src/grammar';
import { stringText } from '../../src/types/cst';
import { KeyUpdate } from './getKeyUpdate';
import { splitGraphemes } from '../../src/parse/parse';

export function handleStringText({
    key,
    idx,
    node,
    pos,
    path,
    map,
}: {
    key: string;
    idx: number;
    node: stringText & MNodeExtra;
    pos: number;
    path: Path[];
    map: Map;
}): KeyUpdate {
    const last = path[path.length - 1];

    let text = splitGraphemes(node.text);
    if (key === '"' && pos === text.length) {
        return {
            type: 'select',
            selection: { idx: last.idx, loc: 'end' },
            path: path
                .slice(0, -1)
                .concat({ idx: last.idx, child: { type: 'end' } }),
        };
    }

    if (key === '{' && pos > 0 && text[pos - 1] === '$') {
        return splitString(text, pos, map, last, idx, node, path);
    }

    const input = splitGraphemes(key);

    if (pos === 0) {
        text.unshift(...input);
        // text = key + text;
    } else if (pos === text.length) {
        text.push(...input);
        // text = text + key;
    } else {
        text.splice(pos, 0, ...input);
        // text = text.slice(0, pos) + key + text.slice(pos);
    }
    return {
        type: 'update',
        update: {
            map: { [idx]: { ...node, text: text.join('') } },
            path,
            selection: { idx, loc: pos + 1 },
        },
    };
}
function splitString(
    text: string[],
    pos: number,
    map: Map,
    last: Path,
    idx: number,
    node: stringText & MNodeExtra,
    path: Path[],
): KeyUpdate {
    const prefix = text.slice(0, pos - 1);
    const suffix = text.slice(pos);
    const string = map[last.idx];
    if (string.type !== 'string') {
        throw new Error(`stringText parent not a string`);
    }
    if (last.child.type !== 'text') {
        throw new Error(`stringText path not a text`);
    }
    const blank: MNode = {
        type: 'blank',
        loc: {
            idx: nidx(),
            start: 0,
            end: 0,
        },
    };
    const stringText: MNode = {
        type: 'stringText',
        text: suffix.join(''),
        loc: { idx: nidx(), start: 0, end: 0 },
    };
    const templates = string.templates.slice();
    templates.splice(last.child.at, 0, {
        expr: blank.loc.idx,
        suffix: stringText.loc.idx,
    });
    return {
        type: 'update',
        update: {
            map: {
                [idx]: {
                    ...node,
                    text: prefix.join(''),
                },
                [stringText.loc.idx]: stringText,
                [blank.loc.idx]: blank,
                [last.idx]: {
                    ...string,
                    templates,
                },
            },
            selection: { idx: blank.loc.idx, loc: 'start' },
            path: path.slice(0, -1).concat({
                idx: last.idx,
                child: { type: 'expr', at: last.child.at + 1 },
            }),
        },
    };
}
