/*

so this will be my little crdtgraph
based on that one paper from POPL'25
by the hazel folks

*/

import equal from 'fast-deep-equal';
import { CRDT, LRW } from './crdt';
import { canDeserialize, Registry, serde, SerDe } from './serde';

// interface Edge {
//     // ID should include serliazed source and dest.
//     readonly id: string;
//     readonly source: { readonly id: string; readonly attr: string };
//     readonly dest: string;
//     readonly deleted?: string;
// }

@serde
export class Edge implements CRDT, SerDe<'edge'> {
    static kind = 'edge';
    kind = 'edge' as const;
    readonly id: string;
    readonly source: { readonly id: string; readonly attr: string };
    readonly dest: string;
    readonly deleted?: string;

    constructor(id: string, source: typeof this.source, dest: string, deleted?: string) {
        this.id = id;
        this.source = source;
        this.dest = dest;
        this.deleted = deleted;
    }

    toString() {
        return `Edge {${this.id}, ${this.source.id}:${this.source.attr} -> ${this.dest}${this.deleted ? ' DEL' : ''}}`;
    }

    to(ts: () => string, dest: string) {
        return new Edge(ts(), this.source, dest);
    }

    del(ts: string): Edge {
        return new Edge(this.id, this.source, this.dest, ts);
    }

    merge(other: Edge): Edge {
        if (other.id !== this.id || other.source.id !== this.source.id || other.source.attr !== this.source.attr || other.dest !== this.dest) {
            console.log(`not equal`, this, other);
            throw new Error(`can't merge non-equal edges ${this.id} and ${other.id}`);
        }
        return other.deleted ? other : this;
    }

    toJSON(): { kind: 'edge'; value: any } {
        return { kind: 'edge', value: { id: this.id, source: this.source, dest: this.dest, deleted: this.deleted } };
    }

    static fromJSON(value: any, registry: Registry): Edge | null {
        if (
            typeof value === 'object' &&
            value &&
            typeof value.id === 'string' &&
            typeof value.source === 'object' &&
            typeof value.source?.id === 'string' &&
            typeof value.source.attr === 'string' &&
            typeof value.dest === 'string' &&
            (!value.deleted || typeof value.deleted === 'string')
        ) {
            return new Edge(value.id, value.source, value.dest, value.deleted);
        }
        return null;
    }
}

export interface MNode<T> extends CRDT {
    id: string;
    kind: string;
    plain?: CRDT;
    outs: string[];
    construct(getEdge: GetEdge): T | null;
}

export type GetEdge = <T extends MNode<any>>(id: string, attr: string) => { edge: Edge; end: T; alts?: Edge[] };

// MARK: Graph
// type FancyGraph<T> = {
//     root: string,
// }

export type CGraphOp<T> =
    // all edge sources and dests must be within the nodes added
    | { type: 'cgraph:add-nodes'; nodes: T[]; edges: Edge[] }
    // sources must be the same
    | { type: 'cgraph:replace-edges'; edges: Edge[]; edge: Edge }
    // can update nodes ... hmm ... but we'll assert that the node has to exist.
    | { type: 'cgraph:node'; node: T };
// NOTE: to set the initial root node, you do a replace-edges with empty replacement edges

export function rootEdge(ts: string, nid: string) {
    return new Edge(ts, { id: 'root', attr: 'root' }, nid);
}

export const checkConflicts = (graph: CGraph<any, unknown>) => {
    Object.entries(graph.edgeFrom).forEach(([k, v]) => {
        if (v.length > 1) {
            const live = v.filter((id) => graph.edges[id].deleted == null);
            if (live.length > 1) {
                throw new Error(`Outgoing Conflict: ${k}`);
            }
        }
    });
};

@serde
export class CGraph<T extends MNode<V> & CRDT & SerDe<any>, V> implements CRDT, SerDe<'cgraph'> {
    static kind = 'cgraph';
    readonly kind = 'cgraph' as const;

    readonly edges: Record<string, Edge>;
    readonly nodes: Record<string, T>;
    edgeFrom: Record<string, string[]>; // '{nodeid} {attr}': edgeid[] <- have that node as the source
    edgeTo: Record<string, string[]>; // '{nodeid}': edgeid[] <- have that node as the dest

    constructor(edges: typeof this.edges, nodes: typeof this.nodes) {
        this.edges = edges;
        this.nodes = nodes;
        this.edgeFrom = {};
        this.edgeTo = {};
        Object.values(edges).forEach((edge) => this.cacheEdge(edge));
    }

    private cacheEdge(edge: Edge) {
        const k = `${edge.source.id} ${edge.source.attr}`;
        if (!this.edgeFrom[k]) {
            this.edgeFrom[k] = [edge.id];
        } else if (!this.edgeFrom[k].includes(edge.id)) {
            this.edgeFrom[k].push(edge.id);
        }
        if (!this.edgeTo[edge.dest]) {
            this.edgeTo[edge.dest] = [edge.id];
        } else if (!this.edgeTo[edge.dest].includes(edge.id)) {
            this.edgeTo[edge.dest].push(edge.id);
        }
    }

    insertNodes(nodes: T[], edges: Edge[]): CGraphOp<T> {
        return { type: 'cgraph:add-nodes', edges, nodes };
    }

    updateNode(node: T): CGraphOp<T> {
        return { type: 'cgraph:node', node };
    }

    replaceEdges(edges: Edge[], edge: Edge): CGraphOp<T> {
        return { type: 'cgraph:replace-edges', edge, edges };
    }

    getNode<V1 extends V>(id: string): V1 | null {
        const node = this.nodes[id] as MNode<V1>;
        if (!node) throw new Error(`no node ${id}`);
        return node.construct(this.getEdge);
    }

    getRoot() {
        const edge = this.getEdge('root', 'root');
        return edge.end;
    }

    private _getEdge = <V1 extends T>(id: string, attr: string) => {
        // TODO(perf): keep a cache of 'source:edgeid[]' to make this so much faster
        const ids = this.edgeFrom[`${id} ${attr}`] ?? [];
        const matching = ids.map((id) => this.edges[id]).filter((e) => !e.deleted);
        if (!matching || !matching.length) throw new Error(`no edge found from ${id} ${attr}`);
        matching.sort((a, b) => (a.id > b.id ? -1 : a.id < b.id ? 1 : 0));
        const edge = matching[0];
        const node = this.nodes[edge.dest];
        if (!node) throw new Error(`edge points to nonexistant node`);
        return { edge, end: node as V1, alts: matching.length > 1 ? matching.slice(1) : null };
    };

    getEdge = this._getEdge as GetEdge;

    // validateeeee the ops pls
    valid_op(op: CGraphOp<MNode<any>>, nodes: typeof this.nodes) {
        switch (op.type) {
            case 'cgraph:node':
                return true;
            case 'cgraph:add-nodes':
                const sources: Record<string, true> = {};
                const nides = op.nodes.map((n) => n.id);
                for (let edge of op.edges) {
                    sources[`${edge.source.id} ${edge.source.attr}`] = true;
                    //  - ${edge.dest}
                    //  || !nides.includes(edge.dest)
                    if (!nides.includes(edge.source.id)) {
                        throw new Error(`edge outside of nodes provided ${edge.source.id}`);
                        // return false;
                    }
                    if (!nides.includes(edge.dest) && !nodes[edge.dest]) {
                        console.log(op);
                        throw new Error(`edge dest ${edge.dest} doesnt exist in nodes provided or nodes that already exist`);
                    }
                }
                for (let node of op.nodes) {
                    for (let attr of node.outs) {
                        if (!sources[`${node.id} ${attr}`]) {
                            console.log(op.edges);
                            console.log(op.nodes);
                            throw new Error(`no attr ${attr} given for node ${node.id}`);
                        }
                    }
                }
                return true;
            case 'cgraph:replace-edges':
                for (let edge of op.edges) {
                    if (!edge.deleted) {
                        throw new Error(`replaced edge is not deleted`);
                        // return false;
                    }
                    if (edge.source.id !== op.edge.source.id || edge.source.attr !== op.edge.source.attr) {
                        // return false;
                        throw new Error(`replacing edge doesnt match`);
                    }
                }
                if (op.edge.deleted) {
                    throw new Error(`replacing edge is deleted`);
                }
                return true;
        }
    }

    merge_ops(ops: CGraphOp<T>[]) {
        const edges = { ...this.edges };
        const nodes = { ...this.nodes };
        ops.forEach((op) => {
            if (!this.valid_op(op, nodes)) {
                throw new Error(`invalid op!!`);
            }
            switch (op.type) {
                case 'cgraph:node':
                    nodes[op.node.id] = (nodes[op.node.id]?.merge(op.node) as T) ?? op.node;
                    return;

                case 'cgraph:add-nodes':
                    op.nodes.forEach((node) => {
                        nodes[node.id] = (nodes[node.id]?.merge(node) as T) ?? node;
                    });
                    op.edges.forEach((edge) => {
                        edges[edge.id] = edges[edge.id]?.merge(edge) ?? edge;
                    });
                    break;
                case 'cgraph:replace-edges':
                    op.edges.forEach((edge) => {
                        edges[edge.id] = edges[edge.id]?.merge(edge) ?? edge;
                    });
                    edges[op.edge.id] = edges[op.edge.id]?.merge(op.edge) ?? op.edge;
                    break;
            }
        });
        return new CGraph(edges, nodes);
    }

    merge(other: CGraph<T, V>): CGraph<T, V> {
        const edges = { ...this.edges };
        const nodes = { ...this.nodes };
        Object.values(other.edges).forEach((edge) => {
            edges[edge.id] = edges[edge.id]?.merge(edge) ?? edge;
        });
        Object.values(other.nodes).forEach((node) => {
            nodes[node.id] = (nodes[node.id]?.merge(node) as T) ?? node;
        });
        return new CGraph(edges, nodes);
    }

    toJSON() {
        const edges: Record<string, any> = {};
        const nodes: Record<string, any> = {};
        Object.values(this.edges).forEach((edge) => {
            edges[edge.id] = edge.toJSON();
        });
        Object.values(this.nodes).forEach((node) => {
            nodes[node.id] = node.toJSON();
        });
        return { kind: 'cgraph' as const, value: { edges, nodes } };
    }

    static fromJSON<T extends MNode<V> & CRDT & SerDe<any>, V>(value: any, registry: Registry): CGraph<T, V> | null {
        if (typeof value === 'object' && value && typeof value.edges === 'object' && typeof value.nodes === 'object') {
            const edges: typeof CGraph.prototype.edges = {};
            for (let raw of Object.values(value.edges)) {
                if (!canDeserialize(raw)) {
                    return null;
                }
                const edge = registry[raw.kind].fromJSON(raw.value, registry) as Edge | null;
                if (edge == null) return null;
                edges[edge.id] = edge;
            }
            const nodes: typeof CGraph.prototype.nodes = {};
            for (let raw of Object.values(value.nodes)) {
                if (!canDeserialize(raw)) {
                    return null;
                }
                const node = registry[raw.kind].fromJSON(raw.value, registry) as T | null;
                if (node == null) return null;
                nodes[node.id] = node;
            }
            return new CGraph(edges, nodes);
        }
        return null;
    }
}
