import { RecNode, TextSpan } from '../shared/cnodes';
import { Src } from './gleam2';

export type XML = { tag: string; src: Src; attrs?: Record<string, any>; children?: Record<string, XML | XML[] | undefined> };

export const textSpanToXML = <T>(span: TextSpan<T>, toXML: (t: T) => XML): XML => {
    switch (span.type) {
        case 'text':
            return { tag: span.type, src: { left: [] }, attrs: { text: span.text, style: span.style, link: span.link } };
        case 'embed':
            return { tag: span.type, src: { left: [] }, attrs: { style: span.style, link: span.link }, children: { item: toXML(span.item) } };
        default:
            return { tag: span.type, src: { left: [] } };
    }
};

export const nodeToXML = (node: RecNode): XML => {
    switch (node.type) {
        case 'id':
            return { tag: node.type, src: { left: node.loc }, attrs: { text: node.text, ref: node.ref, ccls: node.ccls } };
        case 'list':
            return {
                tag: node.type,
                src: { left: node.loc },
                attrs: { kind: node.kind, forceMultiline: node.forceMultiline },
                children: {
                    attributes: node.attributes ? nodeToXML(node.attributes) : undefined,
                    children: node.children.map(nodeToXML),
                },
            };
        case 'table':
            return {
                tag: node.type,
                src: { left: node.loc },
                attrs: { kind: node.kind, forceMultiline: node.forceMultiline },
                children: {
                    rows: node.rows.map((row) => ({
                        tag: 'row',
                        children: {
                            cells: row.map(nodeToXML),
                        },
                        src: { left: row[0].loc, right: row.length > 1 ? row[row.length - 1].loc : undefined },
                    })),
                },
            };
        case 'text':
            return { tag: node.type, src: { left: node.loc }, children: { spans: node.spans.map((span) => textSpanToXML(span, nodeToXML)) } };
    }
};
