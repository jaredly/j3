import { Ctx } from '../src/to-ast/Ctx';
import { Layout, Map, MNodeContents } from '../src/types/mcst';

const maxWidth = 50;
// const maxWidth = 100;
// const maxWidth = 20;

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
            if (
                cw === false ||
                cw + pos > maxWidth ||
                (firstName === 'let' && node.values.length > 2)
            ) {
                return {
                    type: 'multiline',
                    tightFirst: howTight(map[node.values[0]]),
                    pos,
                    pairs: firstName === 'switch',
                };
            }
            return { type: 'flat', width: cw, pos };
        }
        case 'attachment':
            return { type: 'flat', width: node.name.length, pos };
        case 'recordAccess': {
            const cw = childWidth(
                [node.target, ...node.items],
                recursive,
                pos,
                display,
                map,
            );
            if (cw === false || cw > maxWidth) {
                return { type: 'multiline', pos, tightFirst: 1 };
            }
            return { type: 'flat', width: cw, pos };
        }
        case 'accessText':
        case 'stringText':
            return { type: 'flat', width: node.text.length + 1, pos };
        case 'rich-text':
            return { type: 'multiline', pos, tightFirst: 0 };
        case 'spread': {
            const cw = childWidth(
                [node.contents],
                recursive,
                pos,
                display,
                map,
            );
            if (cw === false || cw > maxWidth) {
                return { type: 'multiline', pos, tightFirst: 1 };
            }
            return { type: 'flat', width: cw + 2, pos };
        }
        case 'string': {
            const cw = childWidth(
                [
                    node.first,
                    ...node.templates.flatMap(({ expr, suffix }) => [
                        expr,
                        suffix,
                    ]),
                ],
                recursive,
                pos,
                display,
                map,
            );
            if (cw === false || cw > maxWidth) {
                return { type: 'multiline', pos, tightFirst: 0 };
            }
            return { type: 'flat', width: cw, pos };
        }
        default:
            let _: never = node;
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
): Layout => {
    const item = display[idx] ?? (display[idx] = {});
    return (item.layout = calculateLayout(
        map[idx],
        pos,
        display,
        map,
        recursive,
    ));
};

function childWidth(
    children: number[],
    recursive: boolean,
    pos: number,
    display: Ctx['display'],
    map: Map,
    spacer = 1,
) {
    let total = pos;
    let first = true;
    for (let idx of children) {
        if (first) {
            first = false;
        } else {
            total += spacer;
        }
        let { layout: l } = display[idx] ?? {};
        if (!l || l.pos !== total) {
            // gotta relayout
            l = layout(idx, total, map, display, recursive);
        }
        // Break out, relayout everything for multi-bit
        if (l.type === 'multiline') {
            for (let idx of children) {
                layout(idx, pos, map, display, recursive);
            }
            return false;
        } else {
            total += l.width;
        }
    }
    return total;
}
