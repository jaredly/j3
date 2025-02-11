// interface CanDoThings { }

import { Id, List, ListKind, Node, NodeID } from '../../../shared/cnodes';
import { LRW } from './crdt';
import { serde, SerDe } from './serde';

// MARK: Graph

// type FancyGraph<T> = {
//     root: string,
//     edges: Record<string, {from: string, attr: string, to: string, dead: boolean}>,
//     nodes: Record<string, T>,
// }

interface Edge {
    id: string;
    fromid: string;
    attr: string;
    toid: string;
}

interface MNode<T> {
    id: string;
    kind: string;
    plain?: LRW<any>;
    construct(getEdges: GetEdge): T | null;
}

type GetEdge = <T extends MNode<any>>(id: string, attr: string) => { edge: Edge; end: T };

// MARK: Node Auxiliaries

@serde
class MListTag implements MNode<Extract<ListKind<NodeID>, { type: 'tag' }>>, SerDe<'list:tag'> {
    id: string;
    static kind = 'list:tag';
    kind = 'list:tag' as const;
    plain = undefined;

    constructor(id: string) {
        this.id = id;
    }

    construct(getEdges: GetEdge): Extract<ListKind<NodeID>, { type: 'tag' }> | null {
        const tag = getEdges<MNode<Node>>(this.id, 'tag');
        const attributes = getEdges<MNode<Node>>(this.id, 'attributes');
        if (tag == null || attributes == null) return null;
        return { type: 'tag', node: tag.end.id, attributes: attributes.end.id };
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
class MCons<T> implements MNode<MNode<T>[]>, SerDe<'cons'> {
    id: string;
    static kind = 'cons';
    kind = 'cons' as const;
    plain = undefined;

    constructor(id: string) {
        this.id = id;
    }

    construct(getEdge: GetEdge): MNode<T>[] | null {
        const head = getEdge<MNode<T>>(this.id, 'head');
        const tail = getEdge<MCons<T> | MNode<T>>(this.id, 'tail');
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

@serde
class MId implements MCNode<Id<string>>, SerDe<'id'> {
    kind = 'id' as const;
    static kind = 'id';
    id: string;
    plain: LRW<{ text: string; ccls: number }>;

    constructor(id: string, plain: { text: string; ccls: number }, ts: string) {
        this.id = id;
        this.plain = new LRW(plain, ts);
    }

    construct(): Id<string> {
        const { text, ccls } = this.plain.value;
        return { type: 'id', text, ccls, loc: this.id };
    }

    toJSON() {
        return { kind: this.kind, value: { id: this.id, plain: this.plain.toJSON() } };
    }
    static fromJSON(data: any) {
        if (typeof data.id !== 'string') return null;
        if (
            typeof data.plain !== 'object' ||
            typeof data.plain.ts !== 'string' ||
            typeof data.plain.value !== 'object' ||
            typeof data.plain.value.text !== 'string' ||
            typeof data.plain.value.ccls !== 'number'
        )
            return null;
        return new MId(data.id, data.plain.value, data.plain.ts);
    }
}

@serde
class MList implements MCNode<List<NodeID>>, SerDe<'list'> {
    id: string;
    static kind = 'list';
    kind = 'list' as const;
    plain: LRW<boolean | null>;

    constructor(id: string, multi: boolean | null, ts: string) {
        this.id = id;
        this.plain = new LRW(multi ?? null, ts);
    }

    construct(getEdge: GetEdge): List<NodeID> | null {
        const kind = getEdge<MNode<ListKind<NodeID>>>(this.id, 'kind');
        const child = getEdge<MNode<Node> | MCons<MNode<Node>>>(this.id, 'children');
        if (!kind || !child) return null;
        const kval = kind.end.construct(getEdge);
        if (kval == null) return null;

        let children: string[];
        if (child.end instanceof MCons) {
            const res = child.end.construct(getEdge);
            if (res == null) return null;
            children = res.map((n) => n.id);
        } else {
            children = [child.end.id];
        }

        return { type: 'list', kind: kval, children, loc: this.id };
    }

    toJSON() {
        return { kind: this.kind, value: { id: this.id, plain: this.plain.toJSON() } };
    }
    static fromJSON(data: any) {
        if (typeof data.id !== 'string') return null;
        if (typeof data.plain !== 'object' || typeof data.plain.ts !== 'string' || data.plain.value === undefined) return null;
        return new MList(data.id, data.plain.value, data.plain.ts);
    }
}
