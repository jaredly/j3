import { Map, MNodeContents } from '../src/types/mcst';

const maxWidth = 10;

export const calculateLayout = (
    node: MNodeContents,
    pos: number,
    map: Map,
    recursive = false,
): Map[0]['layout'] => {
    switch (node.type) {
        case 'identifier':
            return { type: 'flat', width: node.text.length };
        case 'number':
            return { type: 'flat', width: node.raw.length };
        case 'tag':
            return { type: 'flat', width: node.text.length + 1 };
        case 'array': {
            const cw = childWidth(node.values, recursive, pos, map);
            if (cw === false || cw > maxWidth) {
                return { type: 'multiline', tightFirst: 0 };
            }
            return { type: 'flat', width: cw };
        }
        case 'list': {
            const cw = childWidth(node.values, recursive, pos, map);
            if (cw === false || cw + pos > maxWidth) {
                return {
                    type: 'multiline',
                    tightFirst: howTight(map[node.values[0]]),
                };
            }
            return { type: 'flat', width: cw };
        }
        default:
            return { type: 'flat', width: 10 };
    }
};

const tightFirsts: { [key: string]: number } = { fn: 2, def: 2, defn: 3 };

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
