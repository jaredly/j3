// interface CanDoThings { }

import { Id, List, ListKind, Node, NodeID } from '../../../shared/cnodes';
import { CUpdate, insertArrayOp, insertNodes, replaceEdges } from '../../keyActionToCRDTUpdate';
import { MNode, GetEdge, Edge, CGraphOp } from './cgraph';
import { LRW } from './crdt';
import { canDeserialize, Registry, serde, SerDe } from './serde';

// MARK: Node Auxiliaries

@serde
export class MListKind implements MNode<ListKind<NodeID>>, SerDe<'list:kind'> {
    id: string;
    static kind = 'list:kind';
    kind = 'list:kind' as const;
    plain: LRW<Extract<ListKind<NodeID>, string>>;
    outs = [];

    constructor(id: string, kind: Extract<ListKind<NodeID>, string>, ts: string) {
        this.id = id;
        this.plain = new LRW(kind, ts);
    }

    construct(getEdge: GetEdge): ListKind<string> | null {
        return this.plain.value;
    }

    static insert(ts: () => string, id: string, kind: Extract<ListKind<NodeID>, string>): MOp {
        return insertNodes([new MListKind(id, kind, ts())], []);
    }

    // trivial
    merge(other: MListKind): MListKind {
        if (other.id !== this.id || other.kind !== this.kind) throw new Error(`not the same id list`);
        return other.plain.ts > this.plain.ts ? other : this;
    }

    toJSON() {
        return { kind: this.kind, value: { id: this.id, plain: this.plain.toJSON() } };
    }

    static fromJSON(data: any, registry: Registry) {
        if (typeof data !== 'object' || typeof data.id !== 'string') return null;
        const raw = data.plain;
        if (!canDeserialize(raw)) return null;
        const plain: typeof MListKind.prototype.plain = registry[raw.kind].fromJSON(raw.value, registry);
        return plain ? new MListKind(data, plain.value, plain.ts) : null;
    }
}

@serde
export class MListTag implements MNode<Extract<ListKind<NodeID>, { type: 'tag' }>>, SerDe<'list:tag'> {
    id: string;
    static kind = 'list:tag';
    kind = 'list:tag' as const;
    plain = undefined;
    outs = ['tag', 'attributes'];

    constructor(id: string) {
        this.id = id;
    }

    static newTagEdge(ts: string, sourceId: string, destId: string) {
        return new Edge(ts, { id: sourceId, attr: 'tag' }, destId);
    }

    static newAttributesEdge(ts: string, sourceId: string, destId: string) {
        return new Edge(ts, { id: sourceId, attr: 'attributes' }, destId);
    }

    static insert(ts: () => string, id: string, kind: Extract<ListKind<NodeID>, { type: 'tag' }>): MOp {
        const edges = [MListTag.newTagEdge(ts(), id, kind.node)];
        const nodes: MNodes[] = [new MListTag(id)];
        if (kind.attributes) {
            edges.push(MListTag.newAttributesEdge(ts(), id, kind.attributes));
        } else {
            const nil = new MNil(ts());
            nodes.push(nil);
            edges.push(MListTag.newAttributesEdge(ts(), id, nil.id));
        }
        return insertNodes(nodes, edges);
    }

    construct(getEdge: GetEdge): Extract<ListKind<NodeID>, { type: 'tag' }> | null {
        const tag = getEdge<MNode<Node>>(this.id, 'tag');
        const attributes = getEdge<MNode<Node>>(this.id, 'attributes');
        if (tag == null || attributes == null) return null;
        return { type: 'tag', node: tag.end.id, attributes: attributes.end.kind === MNil.kind ? undefined : attributes.end.id };
    }

    // trivial
    merge(other: MListTag): MListTag {
        if (other.id !== this.id || other.kind !== this.kind) throw new Error(`not the same id list`);
        return other;
    }

    toJSON() {
        return { kind: this.kind, value: this.id };
    }
    static fromJSON(data: any) {
        if (typeof data !== 'string') return null;
        return new MListTag(data);
    }
}

// Sooo in some cases (List.children) I want the cons to give me 'list of IDs pointed to'
// and in some cases I want it to fully realize the contents 'text spans'

// Do I call that two kinds of ... implementations of MNode?

// when I'm ... "destruct"ing a Text, the spans presumably have IDs on them...
// but also there's like an amount of "check the graph to see what needs to be updated."
// like "if it's already there, that's fine."
// So should the spans have ids on them? or do I just reify the spans list, see if it matches,
// and take action on that?
// AH yeah ok so positional identity is DEFINITELY not enough, sorry folks. gotta have ids. yeah
// that was an easy one. (inserting a new span at the start of a text shouldn't rewrite the whole rest of the thing.)

@serde
export class MNil implements MNode<{ type: 'nil' }>, SerDe<'nil'> {
    id: string;
    static kind = 'nil';
    kind = 'nil' as const;
    plain = undefined;
    outs = [];

    constructor(id: string) {
        this.id = id;
    }

    construct(getEdge: GetEdge) {
        return { type: 'nil' as const };
    }

    // trivial
    merge(other: MNil): MNil {
        if (other.id !== this.id || other.kind !== this.kind) throw new Error(`not the same id list`);
        return other;
    }

    toJSON() {
        return { kind: this.kind, value: this.id };
    }

    static fromJSON(data: any) {
        if (typeof data !== 'string') return null;
        return new MNil(data);
    }
}

@serde
export class MCons<T> implements MNode<MNode<T>[]>, SerDe<'cons'> {
    id: string;
    static kind = 'cons';
    kind = 'cons' as const;
    plain = undefined;
    outs = ['head', 'tail'];

    constructor(id: string) {
        this.id = id;
    }

    // trivial
    merge(other: MCons<T>): MCons<T> {
        if (other.id !== this.id || other.kind !== this.kind) throw new Error(`not the same id list`);
        return other;
    }

    getHeadEdge(getEdge: GetEdge): GotEdge<MNode<T>> {
        return getEdge<MNode<T>>(this.id, 'head');
    }

    getTailEdge(getEdge: GetEdge): GotEdge<MCons<T> | MNode<T>> {
        return getEdge<MCons<T> | MNode<T>>(this.id, 'tail');
    }

    construct(getEdge: GetEdge): MNode<T>[] | null {
        const head = this.getHeadEdge(getEdge);
        const tail = this.getTailEdge(getEdge);
        if (!head || !tail) return null;

        if (!(tail.end instanceof MCons)) {
            return [head.end, tail.end as MNode<T>];
        }
        const tval = tail.end.construct(getEdge);
        if (tval == null) return null;
        return [head.end, ...tval];
    }

    toJSON() {
        return { kind: this.kind, value: this.id };
    }
    static fromJSON(data: any) {
        if (typeof data !== 'string') return null;
        return new MCons(data);
    }
}

// MARK: Nodes Proper

interface MCNode<T extends Node> extends MNode<T> {}

export type MNodes = MId | MList | MNil | MCons<Node> | MListKind | MListTag;

export type MMain = MId | MList;
export const isMain = (node: MNodes): node is MMain => node instanceof MId || node instanceof MList;

export type MOp = CGraphOp<MNodes>;

@serde
export class MId implements MCNode<Id<string>>, SerDe<'id'> {
    kind = 'id' as const;
    static kind = 'id';
    id: string;
    outs = [];
    plain: LRW<{ text: string; ccls?: number }>;

    constructor(id: string, plain: { text: string; ccls?: number }, ts: string = id) {
        this.id = id;
        this.plain = new LRW(plain, ts);
    }

    merge(other: MId): MId {
        if (other.id !== this.id || other.kind !== this.kind) throw new Error(`not the same id list`);
        const plain = this.plain.merge(other.plain);
        return new MId(this.id, plain.value, plain.ts);
    }

    static insert(ts: () => string, id: Id<NodeID>): MOp {
        return insertNodes([new MId(id.loc, { text: id.text, ccls: id.ccls }, ts())], []);
    }

    setText(text: string, ccls: number | undefined, ts: string): MId {
        if (ccls != null && this.plain.value.ccls != null && ccls !== this.plain.value.ccls) {
            throw new Error(`incompatible character classes`);
        }
        return new MId(this.id, { text, ccls: text.length === 0 ? undefined : ccls ?? this.plain.value.ccls }, ts);
    }

    construct(): Id<string> {
        const { text, ccls } = this.plain.value;
        return { type: 'id', text, ccls, loc: this.id };
    }

    toJSON() {
        return { kind: this.kind, value: { id: this.id, plain: this.plain.toJSON() } };
    }
    static fromJSON(data: any, registry: Registry) {
        if (typeof data.id !== 'string') return null;
        if (typeof data.plain !== 'object' || typeof data.plain.kind !== 'string') {
            return null;
        }
        const plain: typeof MId.prototype.plain = registry[data.plain.kind].fromJSON(data.plain.value, registry);
        if (plain == null) return null;
        return new MId(data.id, plain.value, plain.ts);
    }
}

type GotEdge<T> = { edge: Edge; end: T; alts?: Edge[] };

const insertKind = (ts: () => string, id: string, kind: ListKind<NodeID>): MOp => {
    if (typeof kind === 'string') {
        return MListKind.insert(ts, id, kind);
    }
    if (kind.type === 'tag') {
        return MListTag.insert(ts, id, kind);
    }
    throw new Error('nother kind not yett');
};

@serde
export class MList implements MCNode<List<NodeID>>, SerDe<'list'> {
    id: string;
    static kind = 'list';
    kind = 'list' as const;
    outs = ['kind', 'children'];
    plain: LRW<boolean | null>;

    constructor(id: string, multi: boolean | null, ts: string) {
        this.id = id;
        this.plain = new LRW(multi ?? null, ts);
    }

    edges(ts: () => string, attrs: { kind: string; children: string }) {
        return [this.newKindEdge(ts, attrs.kind), new Edge(ts(), { id: this.id, attr: 'children' }, attrs.children)];
    }

    static insert(ts: () => string, list: List<NodeID>): MOp[] {
        const kid = ts();

        const { head: child, op } = insertArrayOp(ts, list.children);

        return [
            op,
            insertKind(ts, kid, list.kind),
            insertNodes(
                [new MList(list.loc, list.forceMultiline ?? null, ts())],
                [MList.newKindEdge(ts, list.loc, kid), MList.newChildrenEdge(ts, list.loc, child)],
            ),
        ];
    }

    static newChildrenEdge(ts: () => string, id: string, dest: string) {
        return new Edge(ts(), { id: id, attr: 'children' }, dest);
    }

    static newKindEdge(ts: () => string, id: string, kindId: string) {
        return new Edge(ts(), { id: id, attr: 'kind' }, kindId);
    }

    newKindEdge(ts: () => string, kindId: string) {
        return new Edge(ts(), { id: this.id, attr: 'kind' }, kindId);
    }

    getKind(getEdge: GetEdge): ListKind<NodeID> | null {
        const kind = this.getKindEdge(getEdge);
        return kind?.end.construct(getEdge) ?? null;
    }

    getChildren(getEdge: GetEdge): NodeID[] | null {
        const child = getEdge<MNode<Node> | MCons<MNode<Node>>>(this.id, 'children');
        if (child.end instanceof MCons) {
            const res = child.end.construct(getEdge);
            if (res == null) return null;
            return res.map((n) => n.id);
        } else {
            return [child.end.id];
        }
    }

    replaceChild(getEdge: GetEdge, ts: () => string, at: number, loc: NodeID) {
        type Child = MCons<Node> | MNode<Node>;

        let edge: GotEdge<Child> | null = this.getChildEdge(getEdge);
        if (!edge) return null;
        for (let i = 0; i < at; i++) {
            const node: Child = edge.end;
            if (!(node instanceof MCons)) {
                return null;
            }
            edge = node.getTailEdge(getEdge);
        }
        if (edge.end instanceof MCons) {
            const hedge = edge.end.getHeadEdge(getEdge);
            return [replaceEdges([hedge.edge.del(ts())], new Edge(ts(), hedge.edge.source, loc))];
            // return [replaceEdges([edge.edge.del(ts())], new Edge(ts(), edge.edge.source, edge.end.getTailEdge(getEdge).end.id))];
        }
        return [replaceEdges([edge.edge.del(ts())], new Edge(ts(), edge.edge.source, loc))];
        // const nts = ts();
        // return [insertNodes([new MNil(nts)], []), replaceEdges([edge.edge.del(ts())], new Edge(ts(), edge.edge.source, nts))];
    }

    removeChild(getEdge: GetEdge, at: number, ts: () => string): null | CUpdate[] {
        type Child = MCons<Node> | MNode<Node>;

        let edge: GotEdge<Child> | null = this.getChildEdge(getEdge);
        if (!edge) return null;
        for (let i = 0; i < at; i++) {
            const node: Child = edge.end;
            if (!(node instanceof MCons)) {
                return null;
            }
            edge = node.getTailEdge(getEdge);
        }
        if (edge.end instanceof MCons) {
            return [replaceEdges([edge.edge.del(ts())], new Edge(ts(), edge.edge.source, edge.end.getTailEdge(getEdge).end.id))];
        }
        const nts = ts();
        return [insertNodes([new MNil(nts)], []), replaceEdges([edge.edge.del(ts())], new Edge(ts(), edge.edge.source, nts))];
    }

    getKindEdge(getEdge: GetEdge): GotEdge<MNode<ListKind<NodeID>>> | null {
        return getEdge<MNode<ListKind<NodeID>>>(this.id, 'kind');
    }

    getChildEdge(getEdge: GetEdge): GotEdge<MNode<Node> | MCons<Node>> | null {
        return getEdge<MNode<Node> | MCons<Node>>(this.id, 'children');
    }

    merge(other: MList): MList {
        if (other.id !== this.id || other.kind !== this.kind) throw new Error(`not the same id list`);
        const plain = this.plain.merge(other.plain);
        return new MList(this.id, plain.value, plain.ts);
    }

    construct(getEdge: GetEdge): List<NodeID> | null {
        const kind = this.getKind(getEdge);
        const children = this.getChildren(getEdge);
        if (!kind || !children) return null;

        return { type: 'list', kind, children, loc: this.id };
    }

    toJSON() {
        return { kind: this.kind, value: { id: this.id, plain: this.plain.toJSON() } };
    }

    static fromJSON(data: any, registry: Registry) {
        if (typeof data.id !== 'string') return null;
        const praw = data.plain;
        if (!canDeserialize(praw)) return null;
        const plain: typeof MList.prototype.plain = registry[praw.kind].fromJSON(praw.value, registry);
        if (plain == null) return null;
        return new MList(data.id, plain.value, plain.ts);
    }
}
