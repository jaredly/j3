import { Path } from '../../web/mods/path';
import { Node } from '../types/cst';

export type SourceMap = {
    map: { [idx: number]: { start: number; end: number } };
    cur: number;
};

export const nodeToString = (
    node: Node,
    sm: SourceMap = { map: {}, cur: 0 },
    addBefore = 0,
): string => {
    sm.cur += addBefore;
    const start = sm.cur;
    let body = nodeToString_(node, sm);
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
    sm: SourceMap = { map: {}, cur: 0 },
): string => {
    switch (node.type) {
        case 'array':
            return `[${node.values
                .map((v) => nodeToString(v, sm, 1))
                .join(' ')}]`;
        case 'list':
            return `(${node.values
                .map((v) => nodeToString(v, sm, 1))
                .join(' ')})`;
        case 'record':
            return `{${node.values
                .map((v) => nodeToString(v, sm, 1))
                .join(' ')}}`;
        case 'identifier':
            return `${node.text}${node.hash ? '#' + node.hash : ''}`;
        case 'blank':
            return '';
        case 'hash':
            return `#${node.hash}`;
        case 'comment':
            return `$comment$`;
        case 'rich-text':
            return `rich?text`;
        case 'attachment':
            return `?attachment?`;
        case 'annot':
            return `${nodeToString(node.target, sm)}:${nodeToString(
                node.annot,
                sm,
                1,
            )}`;
        case 'recordAccess':
            return `${nodeToString(node.target, sm)}${node.items
                .map((item) => '.' + nodeToString(item, sm, 1))
                .join('')}`;
        case 'spread':
            return `..${nodeToString(node.contents, sm, 2)}`;
        case 'accessText':
        case 'stringText':
            return node.text;
        case 'string':
            return `"${nodeToString(node.first, sm, 1)}${node.templates
                .map(
                    (item) =>
                        `\${${nodeToString(item.expr, sm, 2)}}${nodeToString(
                            item.suffix,
                            sm,
                            1,
                        )}`,
                )
                .join('')}"`;
        case 'unparsed':
            return node.raw;
        default:
            let _: never = node;
    }
    return `NOP(${(node as any).type})`;
};
