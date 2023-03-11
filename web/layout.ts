import { Ctx } from '../src/to-ast/Ctx';
import { Layout, Map, MNodeContents } from '../src/types/mcst';

const maxWidth = 10;

export const calculateLayout = (
    node: MNodeContents,
    pos: number,
    display: Ctx['display'],
    map: Map,
    recursive = false,
): Layout => {
    switch (node.type) {
        case 'identifier':
        case 'comment':
            return { type: 'flat', width: node.text.length, pos };
        case 'unparsed':
        case 'number':
            return { type: 'flat', width: node.raw.length, pos };
        case 'tag':
            return { type: 'flat', width: node.text.length + 1, pos };
        case 'record': {
            const cw = childWidth(node.values, recursive, pos, display, map);
            if (cw === false || cw > maxWidth) {
                return { type: 'multiline', tightFirst: 0, pos, pairs: true };
            }
            return { type: 'flat', width: cw, pos };
        }
        case 'blank':
            return { type: 'flat', width: 0, pos };
        case 'array': {
            const cw = childWidth(node.values, recursive, pos, display, map);
            if (cw === false || cw > maxWidth) {
                return { type: 'multiline', tightFirst: 0, pos };
            }
            return { type: 'flat', width: cw, pos };
        }
        case 'list': {
            const cw = childWidth(node.values, recursive, pos, display, map);
            const firstName = idName(map[node.values[0]]);
            if (cw === false || cw + pos > maxWidth || firstName === 'let') {
                return {
                    type: 'multiline',
                    tightFirst: howTight(map[node.values[0]]),
                    pos,
                    pairs: firstName === 'switch',
                };
            }
            return { type: 'flat', width: cw, pos };
        }
        default:
            return { type: 'flat', width: 10, pos };
    }
};

const idName = (item?: Map[0]) =>
    item?.type === 'identifier' ? item.text : null;

const tightFirsts: { [key: string]: number } = {
    fn: 2,
    def: 2,
    defn: 3,
    deftype: 2,
    switch: 2,
    let: 2,
    if: 2,
    '<>': 2,
};

function howTight(item?: Map[0]) {
    if (item?.type === 'identifier') {
        return tightFirsts[item.text] ?? 1;
    }
    return 1;
}

export const layout = (
    idx: number,
    pos: number,
    map: Map,
    display: Ctx['display'],
    recursive = false,
) => {
    const item = display[idx] ?? (display[idx] = {});
    item.layout = calculateLayout(map[idx], pos, display, map, recursive);
};

function childWidth(
    children: number[],
    recursive: boolean,
    pos: number,
    display: Ctx['display'],
    map: Map,
) {
    return children.reduce((acc, idx) => {
        if (acc === false) {
            return false;
        }
        if (recursive) {
            layout(idx, pos, map, display, recursive);
        }
        const { layout: l } = display[idx] ?? {};
        if (l?.type === 'flat') {
            return acc + l.width;
        }
        return false;
    }, 0 as number | false);
}
