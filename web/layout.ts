import { Map, MNodeContents } from '../src/types/mcst';

const maxWidth = 20;

export const calculateLayout = (
    node: MNodeContents,
    pos: number,
    map: Map,
    recursive = false,
): Map[0]['layout'] => {
    switch (node.type) {
        case 'identifier':
            return { type: 'flat', width: node.text.length, pos };
        case 'unparsed':
        case 'number':
            return { type: 'flat', width: node.raw.length, pos };
        case 'tag':
            return { type: 'flat', width: node.text.length + 1, pos };
        case 'record': {
            const cw = childWidth(node.values, recursive, pos, map);
            if (cw === false || cw > maxWidth) {
                return { type: 'multiline', tightFirst: 0, pos, pairs: true };
            }
            return { type: 'flat', width: cw, pos };
        }
        case 'array': {
            const cw = childWidth(node.values, recursive, pos, map);
            if (cw === false || cw > maxWidth) {
                return { type: 'multiline', tightFirst: 0, pos };
            }
            return { type: 'flat', width: cw, pos };
        }
        case 'list': {
            const cw = childWidth(node.values, recursive, pos, map);
            const firstName = idName(map[node.values[0]]);
            if (cw === false || cw + pos > maxWidth || firstName === 'let') {
                return {
                    type: 'multiline',
                    tightFirst: howTight(map[node.values[0]]),
                    pos,
                };
            }
            return { type: 'flat', width: cw, pos };
        }
        default:
            return { type: 'flat', width: 10, pos };
    }
};

const idName = (item?: Map[0]) =>
    item?.node.contents.type === 'identifier' ? item.node.contents.text : null;

const tightFirsts: { [key: string]: number } = {
    fn: 2,
    def: 2,
    defn: 3,
    let: 2,
    if: 2,
};

function howTight(item?: Map[0]) {
    if (item?.node.contents.type === 'identifier') {
        return tightFirsts[item.node.contents.text] ?? 1;
    }
    return 1;
}

export const layout = (
    idx: number,
    pos: number,
    map: Map,
    recursive = false,
) => {
    const item = map[idx];
    item.layout = calculateLayout(item.node.contents, pos, map, recursive);
};

function childWidth(
    children: number[],
    recursive: boolean,
    pos: number,
    map: Map,
) {
    return children.reduce((acc, idx) => {
        if (acc === false) {
            return false;
        }
        if (recursive) {
            layout(idx, pos, map, recursive);
        }
        const { layout: l } = map[idx];
        if (l?.type === 'flat') {
            return acc + l.width;
        }
        return false;
    }, 0 as number | false);
}
