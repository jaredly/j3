import { Ctx } from './to-ast/Ctx';
import { Layout, Map, MNode, MNodeContents } from './types/mcst';

const maxWidth = 60;
// const maxWidth = 100;
// const maxWidth = 20;

export const calculateLayout = (
    node: MNode,
    pos: number,
    display: Ctx['display'],
    hashNames: Ctx['hashNames'],
    map: Map,
    recursive = false,
): Layout => {
    switch (node.type) {
        case 'identifier':
        case 'comment':
            return { type: 'flat', width: node.text.length, pos };
        case 'hash': {
            return {
                type: 'flat',
                width: hashNames[node.loc]?.length ?? 0,
                pos,
            };
        }
        case 'unparsed':
            return { type: 'flat', width: node.raw.length, pos };
        case 'record': {
            const cw = childWidth(
                node.values,
                recursive,
                pos,
                display,
                hashNames,
                map,
            );
            if (cw === false || cw > maxWidth) {
                return {
                    type: 'multiline',
                    tightFirst: 0,
                    pos,
                    pairs: true,
                    cw,
                };
            }
            return { type: 'flat', width: cw - pos, pos };
        }
        case 'blank':
            return { type: 'flat', width: 0, pos };
        case 'array': {
            const cw = childWidth(
                node.values,
                recursive,
                pos,
                display,
                hashNames,
                map,
            );
            if (cw === false || cw > maxWidth) {
                return {
                    type: 'multiline',
                    tightFirst: 0,
                    pos,
                    cw,
                    pairs: display[node.loc]?.style?.type === 'let-pairs',
                };
            }
            return { type: 'flat', width: cw - pos, pos };
        }
        case 'list': {
            const cw = childWidth(
                node.values,
                recursive,
                pos,
                display,
                hashNames,
                map,
            );
            const firstName = idName(map[node.values[0]]);
            if (
                cw === false ||
                cw > maxWidth ||
                (firstName === 'let' && node.values.length > 2)
            ) {
                return {
                    type: 'multiline',
                    tightFirst: howTight(map[node.values[0]]),
                    pos,
                    pairs: firstName === 'switch',
                    cw,
                };
            }
            return { type: 'flat', width: cw - pos, pos };
        }
        case 'attachment':
            return { type: 'flat', width: node.name.length, pos };
        case 'recordAccess': {
            const cw = childWidth(
                [node.target, ...node.items],
                recursive,
                pos,
                display,
                hashNames,
                map,
            );
            if (cw === false || cw > maxWidth) {
                return { type: 'multiline', pos, tightFirst: 1, cw };
            }
            return { type: 'flat', width: cw - pos, pos };
        }
        case 'accessText':
            return { type: 'flat', width: node.text.length + 1, pos };
        case 'stringText':
            return node.text.includes('\n')
                ? { type: 'multiline', pos, tightFirst: 0, cw: 0 }
                : { type: 'flat', width: node.text.length + 1, pos };
        case 'rich-text':
            return { type: 'multiline', pos, tightFirst: 0, cw: false };
        case 'spread': {
            const cw = childWidth(
                [node.contents],
                recursive,
                pos,
                display,
                hashNames,
                map,
            );
            if (cw === false || cw > maxWidth) {
                return { type: 'multiline', pos, tightFirst: 1, cw };
            }
            return { type: 'flat', width: cw + 2 - pos, pos };
        }
        case 'annot': {
            const cw = childWidth(
                [node.target, node.annot],
                recursive,
                pos,
                display,
                hashNames,
                map,
            );
            if (cw === false || cw > maxWidth) {
                return { type: 'multiline', pos, tightFirst: 1, cw };
            }
            return { type: 'flat', width: cw + 1 - pos, pos };
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
                hashNames,
                map,
            );
            if (cw === false || cw > maxWidth) {
                return { type: 'multiline', pos, tightFirst: 0, cw };
            }
            return { type: 'flat', width: cw - pos, pos };
        }
        case 'tapply': {
            const cw = childWidth(
                [node.target, ...node.values],
                recursive,
                pos,
                display,
                hashNames,
                map,
            );
            if (cw === false || cw > maxWidth) {
                return { type: 'multiline', pos, tightFirst: 1, cw };
            }
            return { type: 'flat', width: cw - pos, pos };
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
    hashNames: Ctx['hashNames'],
    recursive = false,
): Layout => {
    const item = display[idx] ?? (display[idx] = {});
    return (item.layout = calculateLayout(
        map[idx],
        pos,
        display,
        hashNames,
        map,
        recursive,
    ));
};

function childWidth(
    children: number[],
    recursive: boolean,
    pos: number,
    display: Ctx['display'],
    hashNames: Ctx['hashNames'],
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
            l = layout(idx, total, map, display, hashNames, recursive);
        }
        // Break out, relayout everything for multi-bit
        if (l.type === 'multiline' || total >= maxWidth) {
            for (let idx of children) {
                layout(idx, pos, map, display, hashNames, recursive);
            }
            return false;
        } else {
            total += l.width;
        }
    }
    if (total >= maxWidth) {
        for (let idx of children) {
            layout(idx, pos, map, display, hashNames, recursive);
        }
    }
    return total;
}
