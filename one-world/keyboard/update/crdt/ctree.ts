/*
ok so
the paper has (id, meta, parent, ts) as the quads.
can I just do LWW for that?
*/

import { Link, ListKind, Node, NodeID, Nodes, Style, TextSpan } from '../../../shared/cnodes';
import { isTag } from '../../handleNav';
import { CRDT, LRW } from './crdt';
import { CTop, Up } from './ctree-update';

// Kinds of things we can store:
// CId, CList, CText, CTable
// CCons
// CTextText, CTextEmbed
// CTableRow

export type Child = CList | CCons | CId | CNil | CText | CTextText | CTextEmbed;
export type ParentObj = { parent: string; attr: string };
export type Parent = LRW<ParentObj | null>;

export const isMain = (node: Child) => node instanceof CNode;

export type Op = Child | ParentOp;

export class ParentOp {
    node: string;
    parent: Parent;
    stack: string;
    constructor(node: string, parent: Parent) {
        if (node == null) throw new Error('null node');
        if (node === '') throw new Error('empty node id');
        this.node = node;
        this.parent = parent;
        // const at = new Error().stack!.split('\n').slice(2, 5).join('\n');
        this.stack = ''; //at;
    }
}

export const cmp = (a: any, b: any) => (a < b ? -1 : a > b ? 1 : 0);

const unwrapCons = (tree: CTree, id: string) => {
    const child = tree.node(id);
    if (child instanceof CCons) {
        return child.items;
    }
    if (child instanceof CNil) {
        return [];
    }
    return [id];
};

export abstract class CChild {
    id: string;
    tree: CTree;
    stack: string;
    constructor(id: string, tree: CTree) {
        this.id = id;
        this.tree = tree;
        this.stack = new Error().stack!.split('\n').slice(3, 6).join('\n');
    }
    get parent() {
        return this.tree.parent(this.id);
    }
    abstract show(): string;
}

export abstract class CNode extends CChild {
    abstract asNode(): Node;
}

// MUTABLE. ya know.
export class CTree {
    static kind = 'ctree';
    readonly kind = 'ctree' as const;

    private readonly parents: Record<string, Parent>;
    // IDS... maybe should be namespaced by kind? just do be really clear what we have.
    private readonly nodes: Record<string, Child>;

    // [parent id : parent attr] -> child ids
    private readonly childCache: Record<string, string[]>;

    constructor(parents: Record<string, Parent>, nodes: Record<string, Child>) {
        this.parents = parents;
        this.nodes = nodes;
        this.childCache = {};
        Object.entries(parents).forEach(([key, item]) => {
            if (item.value) {
                const { parent, attr } = item.value;
                this.cacheChild(key, parent, attr);
            }
        });
    }

    private cacheChild(child: string, parent: string, attr: string) {
        const key = `${parent}%${attr}`;
        if (!this.childCache[key]) {
            this.childCache[key] = [child];
        } else {
            this.childCache[key].push(child);
        }
    }

    private uncacheChild(child: string, parent: string, attr: string) {
        const key = `${parent}%${attr}`;
        if (this.childCache[key]) {
            const at = this.childCache[key].indexOf(child);
            if (at !== -1) {
                this.childCache[key].splice(at, 1);
            }
        }
    }

    get root() {
        const ids = this.children('root', 'root');
        if (!ids.length) throw new Error(`no root in tree!`);
        return ids[0];
    }

    ids() {
        return Object.keys(this.nodes);
    }
    showParents() {
        return this.parents;
    }

    asNodes() {
        const nodes: Nodes = {};
        Object.entries(this.nodes).forEach(([key, node]) => {
            if (node instanceof CNode) {
                nodes[node.id] = node.asNode();
            }
        });
        return nodes;
    }

    apply(ops: Op[]) {
        ops.forEach((op) => {
            if (op instanceof ParentOp) {
                if (op.node === '') throw new Error('cant have empty id');
                const cur = this.parents[op.node];
                if (cur) {
                    if (cur.ts > op.parent.ts) {
                        return; // discard this one
                    }
                    if (cur.value) {
                        this.uncacheChild(op.node, cur.value.parent, cur.value.attr);
                    }
                }
                this.parents[op.node] = op.parent;
                if (op.parent.value) this.cacheChild(op.node, op.parent.value.parent, op.parent.value.attr);
            } else {
                if (this.nodes[op.id] && this.nodes[op.id].$kind !== op.$kind) {
                    throw new Error(`cant change 'kind' ${op.id}`);
                }
                this.nodes[op.id] = this.nodes[op.id]?.merge(op as any) ?? op;
            }
        });
    }

    node(id: string): Child | null {
        return this.nodes[id] ?? null;
    }

    parent(id: string): { parent: string; attr: string } | null {
        return this.parents[id]?.value;
    }

    children(parent: string, attr: string) {
        const key = `${parent}%${attr}`;
        return (
            this.childCache[key]
                ?.map((id) => ({ id, ts: this.parents[id].ts }))
                .sort((a, b) => cmp(a.ts, b.ts))
                .map((a) => a.id) ?? []
        );
    }
}

export class CCons extends CChild {
    static $kind = 'ccons';
    readonly $kind = 'ccons' as const;

    merge(other: CCons) {
        return this;
    }

    setHead(id: string, ts: string) {
        return new ParentOp(id, new LRW({ parent: this.id, attr: 'head' }, ts));
    }

    setTail(id: string, ts: string) {
        return new ParentOp(id, new LRW({ parent: this.id, attr: 'tail' }, ts));
    }

    show() {
        return `cons(${this.head.join(',')} :: ${this.tail.join(',')})`;
    }

    get head() {
        return this.tree.children(this.id, 'head');
    }
    get tail() {
        return this.tree.children(this.id, 'tail');
    }
    get items(): string[] {
        return [...this.head, ...this.tail.flatMap((id) => unwrapCons(this.tree, id))];
    }
}

export class CNil extends CChild {
    static $kind = 'cnil';
    readonly $kind = 'cnil' as const;

    merge(other?: CNil) {
        return this;
    }

    show(): string {
        return `(nil)`;
    }
}

export type TS = () => string;

export const insertAfter = (ts: TS, one: CChild, after: string): Op[] => {
    if (!one.parent) throw new Error(`no parent`);
    if (one.parent.attr === 'head') {
        // in an array
        const parent = one.tree.node(one.parent.parent);
        if (!(parent instanceof CCons)) throw new Error(`parent not a cons`);
        const tail = parent.tail[0];
        const ncons = new CCons(ts(), one.tree);
        return [
            ncons,
            parent.setTail(ncons.id, ncons.id),
            // new ParentOp(ncons.id, new LRW({ parent: parent.id, attr: 'tail' }, ncons.id)),
            ncons.setHead(after, ts()),
            ncons.setTail(tail, ts()),
            // new ParentOp(after, new LRW({ parent: ncons.id, attr: 'head' }, ts())),
            // new ParentOp(tail, new LRW({ parent: ncons.id, attr: 'tail' }, ts())),
        ];
    } else {
        // const parent = one.tree.node(one.parent.parent);
        // if (parent instanceof CCons) {
        // } else {
        //     //
        // }
        const ncons = new CCons(ts(), one.tree);
        return [
            ncons,
            new ParentOp(ncons.id, new LRW(one.parent, ncons.id)),
            // new ParentOp(ncons.id, new LRW({ parent: parent.id, attr: 'tail' }, ncons.id)),
            ncons.setHead(one.id, ts()),
            ncons.setTail(after, ts()),
            // new ParentOp(after, new LRW({ parent: ncons.id, attr: 'head' }, ts())),
            // new ParentOp(tail, new LRW({ parent: ncons.id, attr: 'tail' }, ts())),
        ];
    }
};

export const insertArray = (ts: TS, tree: CTree, items: string[]): { head: string; ops: Op[] } => {
    if (items.length === 1) return { head: items[0], ops: [] };
    if (items.length === 0) {
        const head = ts();
        return { head, ops: [new CNil(head, tree)] };
    }
    const ops: Op[] = [];
    let tail = items[items.length - 1];
    for (let i = items.length - 2; i >= 0; i--) {
        const id = ts();
        ops.push(
            new CCons(id, tree),
            new ParentOp(tail, new LRW({ attr: 'tail', parent: id }, id)),
            new ParentOp(items[i], new LRW({ attr: 'head', parent: id }, id)),
        );
        tail = id;
    }
    return { head: tail, ops };
};

export class CId extends CNode {
    static $kind = 'cid';
    readonly $kind = 'cid' as const;
    meta: LRW<{ text: string; ccls?: number }>;

    constructor(id: string, meta: LRW<{ text: string; ccls?: number }>, tree: CTree) {
        super(id, tree);
        this.meta = meta;
    }

    asNode(): Node {
        return { type: 'id', loc: this.id, text: this.text, ccls: this.ccls };
    }

    setText(ts: string, text: string, ccls?: number): CId {
        return new CId(this.id, new LRW({ text, ccls: ccls ?? this.meta.value.ccls }, ts), this.tree);
    }

    merge(other: CId) {
        return new CId(this.id, this.meta.merge(other.meta), this.tree);
    }

    show(): string {
        return `id(${this.text}/${this.ccls})`;
    }

    get text() {
        return this.meta.value.text;
    }
    get ccls() {
        return this.meta.value.ccls;
    }
}

/*
so, there's a case where I want to:
- replace N with M
- /move/ M, replacing with N
*/

export const replaceChild = (ts: TS, node: CChild, ...locs: string[]): Op[] => {
    if (node instanceof CCons) {
        const ops: Op[] = node.head.map((id) => new ParentOp(id, new LRW(null, ts())));
        ops.push(node.setHead(locs[0], ts()));
        if (locs.length > 1) {
            const res = insertArray(ts, node.tree, locs.slice(1).concat(node.tail));
            ops.push(...res.ops);
            ops.push(node.setTail(res.head, ts()));
        }
        return ops;
    }
    const parent = node.parent;
    if (!parent) throw new Error(`replacing orphan?`);
    if (parent.attr === 'head') {
        const pnode = node.tree.node(parent.parent);
        if (pnode instanceof CCons) {
            return replaceChild(ts, pnode, ...locs);
        }
    }

    const res = insertArray(ts, node.tree, locs);

    return [...res.ops, new ParentOp(res.head, new LRW(parent, ts()))];
};

export abstract class CTextSpan extends CChild {
    style: LRW<{ link?: Link; style?: Style }>;
    constructor(id: string, tree: CTree, style: LRW<{ link?: Link; style?: Style }>) {
        super(id, tree);
        this.style = style;
    }
    abstract asSpan(): TextSpan<string>;
}

export class CTextEmbed extends CTextSpan {
    static $kind = 'ctext:embed';
    readonly $kind = 'ctext:embed' as const;

    asSpan(): TextSpan<string> {
        return { type: 'embed', item: this.item!, style: this.style.value.style, link: this.style.value.link, loc: this.id };
    }

    get item(): string | null {
        return this.tree.children(this.id, 'item')[0] ?? null;
    }

    show(): string {
        return `text:embed"${this.item}"`;
    }

    merge(other: CTextEmbed): CTextEmbed {
        return new CTextEmbed(this.id, this.tree, this.style.merge(other.style));
    }
}

export class CTextText extends CTextSpan {
    static $kind = 'ctext:text';
    readonly $kind = 'ctext:text' as const;

    text: LRW<string>;
    constructor(id: string, tree: CTree, style: LRW<{ link?: Link; style?: Style }>, text: LRW<string>) {
        super(id, tree, style);
        this.text = text;
    }

    setText(text: string, ts: string) {
        return new CTextText(this.id, this.tree, this.style, this.text.set(text, ts));
    }

    clone(id: string) {
        return new CTextText(id, this.tree, this.style, this.text);
    }

    asSpan(): TextSpan<string> {
        return { type: 'text', text: this.text.value, style: this.style.value.style, link: this.style.value.link, loc: this.id };
    }

    show(): string {
        return `text:text"${this.text.value}"`;
    }

    merge(other: CTextText): CTextText {
        return new CTextText(this.id, this.tree, this.style.merge(other.style), this.text.merge(other.text));
    }
}

export class CText extends CNode {
    static $kind = 'ctext';
    readonly $kind = 'ctext' as const;

    get spans() {
        return this.tree
            .children(this.id, 'spans')
            .flatMap((id) => unwrapCons(this.tree, id))
            .map((sid) => this.tree.node(sid) as CTextSpan);
    }

    merge(other: CText): CText {
        return this;
    }

    show(): string {
        return `text(${this.spans.map((s) => s.id)})`;
    }

    asNode(): Node {
        const spans = this.spans.map((span) => span.asSpan());
        return { type: 'text', spans, loc: this.id };
    }
}

export class CList extends CNode {
    static $kind = 'clist';
    readonly $kind = 'clist' as const;
    _kind: LRW<ListKind<string>>;
    multi: LRW<boolean | null>;

    constructor(id: string, kind: LRW<ListKind<string>>, multi: LRW<boolean | null>, tree: CTree) {
        super(id, tree);
        this._kind = kind;
        this.multi = multi;
    }

    setMulti(multi: boolean | null, ts: string) {
        return new CList(this.id, this._kind, this.multi.set(multi, ts), this.tree);
    }

    show(): string {
        return `list(${JSON.stringify(this.kind)})[${this.children.join(',')}]`;
    }

    asNode(): Node {
        let kind = this.kind;

        // inflate tag kind with links
        if (typeof kind !== 'string' && kind.type === 'tag') {
            const tag = this.tree.children(this.id, 'tag')[0];
            let attributes: string | undefined = this.tree.children(this.id, 'attributes')[0];
            if (this.tree.node(attributes) instanceof CNil) {
                attributes = undefined;
            }
            kind = { ...kind, node: tag, attributes };
        }

        return { type: 'list', kind: this.kind, loc: this.id, children: this.children, forceMultiline: this.multi.value ?? undefined };
    }

    merge(other: CList) {
        return new CList(this.id, this._kind.merge(other._kind), this.multi.merge(other.multi), this.tree);
    }

    get kind() {
        return this._kind.value;
    }

    get children() {
        return this.tree.children(this.id, 'children').flatMap((id) => unwrapCons(this.tree, id));
    }

    clearChildren(ts: string) {
        return this.tree.children(this.id, 'children').map((id) => new ParentOp(id, new LRW(null, ts)));
    }
}

export const filterConsList = (ts: () => string, head: Child, hp: ParentObj, filter: (v: Child) => boolean): Op[] => {
    if (head instanceof CCons) {
        const hd = head.tree.node(head.head[0]);
        const tl = head.tree.node(head.tail[0]);
        if (!hd || !tl) return [];
        if (filter(hd)) {
            return filterConsList(ts, tl, { parent: head.id, attr: 'tail' }, filter);
        }
        return [
            //
            new ParentOp(hd.id, new LRW(null, ts())),
            new ParentOp(head.id, new LRW(null, ts())),
            new ParentOp(tl.id, new LRW(hp, ts())),
            ...filterConsList(ts, tl, hp, filter),
        ];
    } else {
        if (!head.parent) return [];
        // we are at the tail, it's a single-element list
        if (!filter(head)) {
            const nid = ts();
            return [
                //
                new ParentOp(head.id, new LRW(null, ts())),
                new CNil(nid, head.tree),
                new ParentOp(nid, new LRW(head.parent, ts())),
            ];
        }
        return [];
    }
};

export const insertTextSpan = (top: CTop, span: TextSpan<NodeID>): Op[] => {
    if (span.type === 'embed') {
        // return insertNodes(
        //     [new MTextEmbed(span.loc, new TextMeta(new LRW(span.link ?? null, span.loc), new LRW(span.style ?? null, span.loc)))],
        //     [MTextEmbed.newItemEdge(span.loc, span.item, top.ts())],
        // );
        return [
            new CTextEmbed(span.loc, top.tree, new LRW({ style: span.style, link: span.link }, top.ts())),
            new ParentOp(span.item, new LRW({ parent: span.loc, attr: 'item' }, top.ts())),
        ];
    }
    if (span.type === 'text') {
        return [new CTextText(span.loc, top.tree, new LRW({ style: span.style, link: span.link }, top.ts()), new LRW(span.text, top.ts()))];
        // return insertNodes(
        //     [new MTextText(span.loc, new LRW(span.text, span.loc), new TextMeta(new LRW(null, span.loc), new LRW(null, span.loc)))],
        //     [],
        // );
    }
    throw new Error(`text span type not supported ${span.type}`);
};

export const insert = (node: Node, top: CTop): Op[] => {
    const { ts, tree } = top;
    switch (node.type) {
        case 'id':
            return [new CId(node.loc, new LRW({ text: node.text, ccls: node.ccls }, node.loc), tree)];
        case 'list': {
            const result = insertArray(ts, tree, node.children);
            let kind = node.kind;
            const ops: Op[] = [];
            if (isTag(kind)) {
                ops.push(new ParentOp(kind.node, new LRW({ attr: 'tag', parent: node.loc }, ts())));
                if (kind.attributes) {
                    ops.push(new ParentOp(kind.attributes, new LRW({ attr: 'attributes', parent: node.loc }, ts())));
                }
                kind = { ...kind, node: '', attributes: '' };
            }
            return [
                new CList(node.loc, new LRW(node.kind, node.loc), new LRW(node.forceMultiline ?? null, node.loc), tree),
                ...result.ops,
                new ParentOp(result.head, new LRW({ attr: 'children', parent: node.loc }, ts())),
            ];
        }
        case 'text': {
            const spans = insertArray(
                ts,
                tree,
                node.spans.map((s) => s.loc),
            );
            return [
                ...node.spans.flatMap((span) => insertTextSpan(top, span)),
                ...spans.ops,
                new CText(node.loc, tree),
                new ParentOp(spans.head, new LRW({ attr: 'spans', parent: node.loc }, ts())),
            ];
        }
    }
    throw new Error(`node type not yet ${node.type}`);
};

export const showOp = (op: Up) => {
    if (op instanceof ParentOp) {
        if (!op.parent.value) return `[x parent] ${op.node} - ${op.stack} (${op.parent.ts})`;
        return `[parent] ${op.node} -> ${op.parent.value?.parent}.${op.parent.value?.attr} - ${op.stack} (${op.parent.ts})`;
    }
    if ('type' in op) return `sel:${op.type}`;
    return op.id + ' : ' + op.show() + ' ' + op.stack;
};
