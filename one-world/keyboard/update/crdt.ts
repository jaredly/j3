// interface CanDoThings { }

import { Id, List, ListKind } from '../../shared/cnodes';

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

interface CRDT {
    kind: string;
    merge(other: ThisType<this>): ThisType<this>;
}

class MId implements MNode<Id<string>> {
    kind = 'id';
    id: string;
    plain: LRW<{ text: string; ccls: number }>;

    constructor(id: string, text: string, ccls: number) {
        this.id = id;
        this.plain = new LRW({ text, ccls }, 'lol');
    }

    construct(): Id<string> {
        const { text, ccls } = this.plain.value;
        return { type: 'id', text, ccls, loc: this.id };
    }
}

// class MListTag implements MNode<Extract<ListKind<string>, { type: 'tag' }>> {
//     id: string;
//     kind = 'list';
//     plain = undefined;

//     constructor(id: string) {
//         this.id = id;
//     }

//     construct(getEdges: GetEdge): Extract<ListKind<string>, { type: 'tag' }> | null {
//         // const
//     }
// }

type MCNode = MId | MList;

// type Cons<T> = {head: T, tail: T | Cons<T>}

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

class MCons<T> implements MNode<MNode<T>[]> {
    id: string;
    kind = 'cons';
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
}

class MList implements MNode<List<string>> {
    id: string;
    kind = 'list';
    plain: LRW<boolean>;

    constructor(id: string, multi: boolean) {
        this.id = id;
        this.plain = new LRW(multi, 'lol');
    }

    construct(getEdge: GetEdge): List<string> | null {
        const kind = getEdge<MNode<ListKind<string>>>(this.id, 'kind');
        const child = getEdge<MCNode | MCons<MCNode>>(this.id, 'children');
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

        // return { type: 'list', kind: kval, children, loc: this.id };
        return null;
    }
}

class LRW<T> implements CRDT {
    kind = 'LRW';
    value: T;
    ts: string;

    constructor(value: T, ts: string) {
        this.value = value;
        this.ts = ts;
    }

    merge(other: LRW<T>): LRW<T> {
        return other.ts < this.ts ? this : other;
    }
}

// type Edge = {id: string, fromid: string, attr: string, toid: string}
// type Node = {id: string, kind: string, plain: LRWMap}
