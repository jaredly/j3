/*
ok so
the paper has (id, meta, parent, ts) as the quads.
can I just do LWW for that?
*/

import { ListKind, Node, Nodes } from '../../../shared/cnodes';
import { CRDT, LRW } from './crdt';

// Kinds of things we can store:
// CId, CList, CText, CTable
// CCons
// CTextText, CTextEmbed
// CTableRow

type Child = CList | CCons | CId | CNil;
type Parent = LRW<{ parent: string; attr: string }>;

export const isMain = (node: Child) => node instanceof CNode;

export type Op = Child | ParentOp;

export class ParentOp {
    node: string;
    parent: Parent;
    constructor(node: string, parent: Parent) {
        this.node = node;
        this.parent = parent;
    }
}

export const cmp = (a: any, b: any) => (a < b ? -1 : a > b ? 1 : 0);

const unwrapCons = (tree: CTree, id: string) => {
    const child = tree.node(id);
    if (child instanceof CCons) {
        return child.items;
    }
    return [id];
};

export abstract class CNode {
    id: string;
    constructor(id: string) {
        this.id = id;
    }
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
            const { parent, attr } = item.value;
            this.cacheChild(key, parent, attr);
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
                const cur = this.parents[op.node];
                if (cur) {
                    if (cur.ts > op.parent.ts) {
                        return; // discard this one
                    }
                    this.uncacheChild(op.node, cur.value.parent, cur.value.attr);
                }
                this.parents[op.node] = op.parent;
                this.cacheChild(op.node, op.parent.value.parent, op.parent.value.attr);
            } else {
                this.nodes[op.id] = this.nodes[op.id]?.merge(op as any) ?? op;
            }
        });
    }

    node(id: string): Child | null {
        return this.nodes[id] ?? null;
    }

    parent(id: string): { parent: string; attr: string } {
        return this.parents[id].value;
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

export class CCons {
    static kind = 'ccons';
    readonly kind = 'ccons' as const;
    id: string;
    tree: CTree;

    constructor(id: string, tree: CTree) {
        this.id = id;
        this.tree = tree;
    }

    merge(other: CCons) {
        return this;
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

export class CNil {
    static kind = 'cnil';
    readonly kind = 'cnil' as const;
    id: string;
    constructor(id: string) {
        this.id = id;
    }
    merge(other?: CNil) {
        return this;
    }
}

export type TS = () => string;

export const insertArray = (ts: TS, tree: CTree, items: string[]): { head: string; ops: Op[] } => {
    if (items.length === 1) return { head: items[0], ops: [] };
    if (items.length === 0) {
        const head = ts();
        return { head, ops: [new CNil(head)] };
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
    tree: CTree;
    meta: LRW<{ text: string; ccls?: number }>;

    constructor(id: string, meta: LRW<{ text: string; ccls?: number }>, tree: CTree) {
        super(id);
        this.meta = meta;
        this.tree = tree;
    }

    asNode(): Node {
        return { type: 'id', loc: this.id, text: this.text, ccls: this.ccls };
    }

    setText(ts: string, text: string, ccls?: number): CId {
        return new CId(this.id, new LRW({ text, ccls }, ts), this.tree);
    }

    merge(other: CId) {
        return new CId(this.id, this.meta.merge(other.meta), this.tree);
    }

    get text() {
        return this.meta.value.text;
    }
    get ccls() {
        return this.meta.value.ccls;
    }
}

export class CList extends CNode {
    static $kind = 'clist';
    readonly $kind = 'clist' as const;
    tree: CTree;
    _kind: LRW<ListKind<string>>;
    multi: LRW<boolean | null>;

    constructor(id: string, kind: LRW<ListKind<string>>, multi: LRW<boolean | null>, tree: CTree) {
        super(id);
        this.tree = tree;
        this._kind = kind;
        this.multi = multi;
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
}
