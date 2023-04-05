import { Path } from '../../web/mods/path';
import { Ctx } from '../to-ast/Ctx';
import { Node } from '../types/cst';

export type SourceMap = {
    map: { [idx: number]: { start: number; end: number } };
    cur: number;
};

// export type NTSConfig = {
//     sm: SourceMap,
//     hashNames: Ctx['display']
// }

export const nodeToString = (
    node: Node,
    hashNames: Ctx['hashNames'],
    sm: SourceMap = { map: {}, cur: 0 },
    addBefore = 0,
): string => {
    sm.cur += addBefore;
    const start = sm.cur;
    let body = nodeToString_(node, hashNames, sm);
    sm.cur = start + body.length;
    sm.map[node.loc.idx] = { start, end: sm.cur };
    return body;
};

const maybeWrap = (text: string) =>
    !text.length || text.trim().length < text.length ? `\`${text}\`` : text;

export const remapPos = (fullPath: Path[], sm: SourceMap) => {
    const last = fullPath[fullPath.length - 1];
    if (!sm.map[last.idx]) {
        throw new Error(`no idx ${last.idx} ${JSON.stringify(sm)}`);
    }
    const { start, end } = sm.map[last.idx];
    switch (last.type) {
        case 'start':
            return start;
        case 'end':
            return end;
        case 'inside':
            return start + 1;
        case 'subtext':
            return start + last.at;
        default:
            return start;
    }
};

export const showSourceMap = (text: string, sm: SourceMap) => {
    return Object.entries(sm.map)
        .map(
            ([idx, { start, end }]) =>
                `${idx}: ${maybeWrap(text.slice(start, end))}`,
        )
        .join('\n');
};

export const nodeToString_ = (
    node: Node,
    hashNames: Ctx['hashNames'],
    sm: SourceMap = { map: {}, cur: 0 },
): string => {
    switch (node.type) {
        case 'array':
            return `[${node.values
                .map((v) => nodeToString(v, hashNames, sm, 1))
                .join(' ')}]`;
        case 'list':
            return `(${node.values
                .map((v) => nodeToString(v, hashNames, sm, 1))
                .join(' ')})`;
        case 'record':
            return `{${node.values
                .map((v) => nodeToString(v, hashNames, sm, 1))
                .join(' ')}}`;
        case 'identifier':
            return node.text;
        case 'blank':
            return '';
        case 'hash': {
            if (
                typeof node.hash === 'string' &&
                node.hash.startsWith(':builtin:')
            ) {
                return node.hash.slice(':builtin:'.length);
            }
            return (
                hashNames[node.loc.idx] ??
                `<hashName not recorded ${node.loc.idx}>`
            );
        }
        case 'comment':
            return `$comment$`;
        case 'rich-text':
            return `rich?text`;
        case 'attachment':
            return `?attachment?`;
        case 'annot':
            return `${nodeToString(node.target, hashNames, sm)}:${nodeToString(
                node.annot,
                hashNames,
                sm,
                1,
            )}`;
        case 'recordAccess':
            return `${nodeToString(node.target, hashNames, sm)}${node.items
                .map((item) => '.' + nodeToString(item, hashNames, sm, 1))
                .join('')}`;
        case 'spread':
            return `..${nodeToString(node.contents, hashNames, sm, 2)}`;
        case 'accessText':
        case 'stringText':
            return node.text;
        case 'string':
            return `"${nodeToString(
                node.first,
                hashNames,
                sm,
                1,
            )}${node.templates
                .map(
                    (item) =>
                        `\${${nodeToString(
                            item.expr,
                            hashNames,
                            sm,
                            2,
                        )}}${nodeToString(item.suffix, hashNames, sm, 1)}`,
                )
                .join('')}"`;
        case 'unparsed':
            return node.raw;
        default:
            let _: never = node;
    }
    return `NOP(${(node as any).type})`;
};
