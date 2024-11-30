import { RecNodeT, RGB, Style } from './cnodes';

export const shape = (node: RecNodeT<unknown>): string => {
    switch (node.type) {
        case 'id':
            if (node.ref) {
                return 'REF';
            }
            return `id(${node.text}${node.ccls != null ? '/' + node.ccls : ''})`;
        case 'list':
            if (node.kind === 'round') {
                return `(${node.children.map(shape).join(' ')})`;
            }
            if (node.kind === 'square') {
                return `[${node.children.map(shape).join(' ')}]`;
            }
            if (typeof node.kind === 'string') {
                return `list[${node.kind}](${node.children.map(shape).join(' ')})`;
            }
            return `list[${node.kind.type}](${node.children.map(shape).join(' ')})`;
        case 'table':
            return `table...`;
        case 'text':
            return `text(${node.spans
                .map((span) => {
                    switch (span.type) {
                        case 'text':
                            return `${span.text}${styleText(span.style)}`;
                        case 'embed':
                            return `\${${shape(span.item)}}`;
                        default:
                            throw new Error('not shaping a ' + span.type);
                    }
                })
                .join('|')})`;
    }
};

const rgb = ({ r, g, b }: RGB) => `rgb(${r},${g},${b})`;

const styleText = (style?: Style) => {
    if (!style || Object.keys(style).length === 0) return '';
    return `{${Object.keys(style)
        .sort()
        .map(
            (key) =>
                `${key}:${
                    (key === 'color' || key === 'background') && style[key as 'color'] ? rgb(style[key as 'color'] as RGB) : style[key as 'color']
                }`,
        )}}`;
};

export const asStyle = (style?: Style): React.CSSProperties | undefined => {
    if (!style) return undefined;
    const res: React.CSSProperties = {};
    if (style.color) {
        res.color = rgb(style.color);
    }
    if (style.background) {
        res.background = rgb(style.background);
    }
    if (style.fontStyle) {
        res.fontStyle = style.fontStyle;
    }
    if (style.fontFamily) {
        res.fontFamily = style.fontFamily;
    }
    if (style.fontWeight) {
        res.fontWeight = style.fontWeight;
    }
    if (style.border) {
        res.border = style.border;
    }
    if (style.outline) {
        res.outline = style.outline;
    }
    if (style.textDecoration) {
        res.textDecoration = style.textDecoration;
    }
    return res;
};
