import { isTag } from '../keyboard/handleNav';
import { Src } from '../keyboard/handleShiftNav';
import { RecNode, TextSpan } from '../shared/cnodes';

export type XML = { tag: string; src: null | Src; attrs?: Record<string, any>; children?: Record<string, XML | XML[] | undefined> };

const white = (n: number) => Array(n + 1).join(' ');

const indent = (text: string, amt: number) => {
    const lines = text.split('\n');
    for (let i = 1; i < lines.length; i++) {
        lines[i] = white(amt) + lines[i];
    }
    return lines.join('\n');
};

const cols = (one: string, two: string) => one + indent(two, one.length);

export const showXML = (xml: XML): string => {
    const open = `${xml.tag}${xml.attrs ? ' ' + attrs(xml.attrs) : ''}`;
    if (!xml.children) return `<${open}/>`;
    return `<${open}>${indent(
        Object.entries(xml.children)
            .filter((m) => m[1] != null)
            .map(
                ([key, value]) =>
                    '\n' +
                    cols(key + (Array.isArray(value) ? '[]' : '') + ' ', Array.isArray(value) ? value.map(showXML).join('\n') : showXML(value!)),
            )
            .join(''),
        2,
    )}\n</${xml.tag}>`;
};

export const chop = (t: string, max: number) => (t.length > max ? t.slice(0, max - 3) + '...' : t);
export const attrs = (v: Record<string, any>, max = 20) => {
    return Object.keys(v)
        .filter((k) => v[k] !== undefined)
        .map((k) => `${k}=${chop(JSON.stringify(v[k]), max)}`)
        .join(' ');
};

export const textSpanToXML = <T>(span: TextSpan<T>, toXML: (t: T) => XML): XML => {
    switch (span.type) {
        case 'text':
            return { tag: 'span:' + span.type, src: { left: [] }, attrs: { text: span.text, style: span.style, link: span.link } };
        case 'embed':
            return {
                tag: 'span:' + span.type,
                src: { left: [] },
                attrs: { style: span.style, link: span.link },
                children: { children: toXML(span.item) },
            };
        default:
            return { tag: 'span:' + span.type, src: { left: [] } };
    }
};

export const nodeToXML = (node: RecNode): XML => {
    switch (node.type) {
        case 'id':
            return { tag: node.type, src: { left: node.loc }, attrs: { text: node.text, ref: node.ref, ccls: node.ccls, loc: node.loc[0].idx } };
        case 'list':
            return {
                tag: node.type,
                src: { left: node.loc },
                attrs: { kind: isTag(node.kind) ? undefined : node.kind, forceMultiline: node.forceMultiline, loc: node.loc[0].idx },
                children: {
                    tag: isTag(node.kind) ? nodeToXML(node.kind.node) : undefined,
                    attributes: isTag(node.kind) && node.kind.attributes ? nodeToXML(node.kind.attributes) : undefined,
                    children: node.children.map(nodeToXML),
                },
            };
        case 'table':
            return {
                tag: node.type,
                src: { left: node.loc },
                attrs: { kind: node.kind, forceMultiline: node.forceMultiline, loc: node.loc[0].idx },
                children: {
                    children: node.rows.map((row) => ({
                        tag: 'row',
                        children: {
                            children: row.map(nodeToXML),
                        },
                        src: { left: row[0].loc, right: row.length > 1 ? row[row.length - 1].loc : undefined },
                    })),
                },
            };
        case 'text':
            return {
                tag: node.type,
                src: { left: node.loc },
                attrs: { loc: node.loc[0].idx },
                children: { children: node.spans.map((span) => textSpanToXML(span, nodeToXML)) },
            };
    }
};
const aToXML = (v: any, name?: string): XML | XML[] | null => {
    if (Array.isArray(v)) {
        const sub = v.map((n) => aToXML(n, name));
        if (sub.every(Boolean)) {
            return sub as XML[];
        }
        return null;
    }
    if (!v || typeof v !== 'object') {
        return null;
    }
    if (Object.keys(v).length === 0) return null;
    const attrs: XML['attrs'] = {};
    const children: XML['children'] = {};
    Object.keys(v).forEach((k) => {
        if (k === 'type' || k === 'src') return;
        // if (k === 'type') return;
        const res = aToXML(v[k], k);
        if (res === null || k === 'src') attrs[k] = v[k];
        else children[k] = res;
    });
    const res: XML = { tag: v.type ?? name ?? '?', src: v.src };
    if (Object.keys(attrs).length) res.attrs = attrs;
    if (Object.keys(children).length) res.children = children;
    return res;
};

export const toXML = (v: any) => {
    const res = aToXML(v);
    if (!res || Array.isArray(res)) {
        console.log(v, res);
        throw new Error('why not');
    }
    return res;
};
