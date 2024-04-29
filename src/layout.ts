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
    parentCtx?: ParentCtx,
): Layout => {
    if (!node) debugger;
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
                    pairs: parentCtx === 'let',
                    // display[node.loc]?.style?.type === 'let-pairs',
                };
            }
            return { type: 'flat', width: cw - pos, pos };
        }
        case 'list': {
            let firstNode = map[node.values[0]];
            if (
                firstNode &&
                (firstNode.type === 'rich-text' ||
                    firstNode.type === 'blank' ||
                    firstNode.type === 'comment') &&
                node.values.length > 1
            ) {
                firstNode = map[node.values[1]];
            }
            const firstName = idName(firstNode);
            const cw = childWidth(
                node.values,
                recursive,
                pos,
                display,
                hashNames,
                map,
                firstName === 'let' || firstName === 'let->'
                    ? 'let'
                    : undefined,
            );
            if (
                cw === false ||
                cw > maxWidth ||
                // (firstName === 'let' && node.values.length > 2) ||
                firstName === 'switch' ||
                firstName === 'match' ||
                firstName === 'if'
            ) {
                return {
                    type: 'multiline',
                    tightFirst: howTight(firstNode),
                    pos,
                    pairs: firstName === 'switch' || firstName === 'match',
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
        case 'comment-node':
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
    tfn: 2,
    fn: 2,
    fnrec: 2,
    def: 2,
    defn: 3,
    defnrec: 3,
    deftype: 2,
    switch: 2,
    match: 2,
    let: 2,
    'let->': 2,
    definstance: 2,
    defclass: 2,
    if: 2,
    '<>': 2,
    '->': 2,
};

function howTight(item?: Map[0]) {
    if (item?.type === 'identifier') {
        return tightFirsts[item.text] ?? 1;
    }
    return 1;
}

type ParentCtx = 'let';

export const layout = (
    idx: number,
    pos: number,
    map: Map,
    display: Ctx['display'],
    hashNames: Ctx['hashNames'],
    recursive = false,
    parentCtx?: ParentCtx,
): Layout => {
    const item = display[idx] ?? (display[idx] = {});
    return (item.layout = calculateLayout(
        map[idx],
        pos,
        display,
        hashNames,
        map,
        recursive,
        parentCtx,
    ));
};

function childWidth(
    children: number[],
    recursive: boolean,
    pos: number,
    display: Ctx['display'],
    hashNames: Ctx['hashNames'],
    map: Map,
    parent?: ParentCtx,
    spacer = 1,
) {
    let total = pos;
    let first = true;
    for (let i = 0; i < children.length; i++) {
        let idx = children[i];
        let parentCtx: ParentCtx | undefined =
            parent === 'let' && i === 1 ? 'let' : undefined;
        if (first) {
            first = false;
        } else {
            total += spacer;
        }
        let { layout: l } = display[idx] ?? {};
        if (!l || l.pos !== total) {
            // gotta relayout
            l = layout(
                idx,
                total,
                map,
                display,
                hashNames,
                recursive,
                parentCtx,
            );
        }
        // Break out, relayout everything for multi-bit
        if (l.type === 'multiline' || total >= maxWidth) {
            for (let i = 0; i < children.length; i++) {
                let idx = children[i];
                let parentCtx: ParentCtx | undefined =
                    parent === 'let' && i === 1 ? 'let' : undefined;
                layout(idx, pos, map, display, hashNames, recursive, parentCtx);
            }
            return false;
        } else {
            total += l.width;
        }
    }
    if (total >= maxWidth) {
        for (let i = 0; i < children.length; i++) {
            let idx = children[i];
            let parentCtx: ParentCtx | undefined =
                parent === 'let' && i === 1 ? 'let' : undefined;
            layout(idx, pos, map, display, hashNames, recursive, parentCtx);
        }
    }
    return total;
}
