import { PathChild } from '../../../src/state/path';
import { MNode, Map } from '../../../src/types/mcst';
import { NUIState, RealizedNamespace } from '../../custom/UIState';
import { Path } from '../../store';

export const verifyPath = (path: Path[], state: NUIState) => {
    if (path.length < 2) throw new Error(`path of length ${path.length}`);
    if (path[0].type !== 'card') throw new Error('first not a card');
    const card = state.cards[path[0].card];
    if (card.top !== path[1].idx) {
        throw new Error(`path card top : ${card.top} vs ${path[1].idx}`);
    }
    if (path[1].type !== 'ns') throw new Error('not ns');
    let ns = state.nsMap[card.top];
    let i = 1;
    let node: MNode | null = null;
    for (; i < path.length; i++) {
        if (!ns || ns.type !== 'normal') throw new Error('placeholder ns');
        if (path[i].idx !== ns.id) {
            throw new Error(`ns ${i} - ${ns.id} vs ${path[i].idx}`);
        }
        const p = path[i];
        if (p.type === 'ns') {
            const next = path[i + 1];
            if (!ns.children.includes(next.idx)) {
                throw new Error(`ns ${next.idx} not a child of ${ns.id}`);
            }
            ns = state.nsMap[next.idx];
            continue;
        }
        if (path[i].type === 'ns-top') {
            node = state.map[ns.top];
            i++;
            break;
        }
    }
    if (!node) {
        throw new Error('no node');
    }
    for (; i < path.length; i++) {
        const p = path[i];
        if (node.loc !== p.idx) {
            throw new Error(
                `Node loc doesn't match path(${i}) idx node:${
                    node.loc
                } vs path:${p.idx} - ${JSON.stringify(p)}`,
            );
        }
        try {
            node = advancePath(p, node, state, i === path.length - 1);
            if (!node) throw new Error(`Node returned doesn't exist...`);
        } catch (err) {
            throw new Error(
                `Bad path item ${i} : ${JSON.stringify(p)}\n${
                    (err as Error).message
                }`,
            );
        }
    }
};

export const childPath = (parent: MNode, child: number): PathChild | null => {
    switch (parent.type) {
        case 'list':
        case 'array':
        case 'record': {
            const idx = parent.values.indexOf(child);
            if (idx === -1) return null;
            return { type: 'child', at: idx };
        }
        case 'string':
            if (parent.first === child) {
                return { type: 'text', at: 0 };
            }
            for (let i = 0; i < parent.templates.length; i++) {
                const { expr, suffix } = parent.templates[i];
                if (child === expr) {
                    return { type: 'expr', at: i + 1 };
                }
                if (child === suffix) {
                    return { type: 'text', at: i + 1 };
                }
            }
            return null;
        case 'comment-node':
        case 'spread':
            return parent.contents === child
                ? { type: 'spread-contents' }
                : null;
    }
    return null;
};

export const advancePath = (
    p: Path,
    node: MNode,
    state: NUIState,
    isLast: boolean,
) => {
    switch (p.type) {
        case 'ns':
        case 'card':
            throw new Error('invalid placement ' + p.type);
        case 'ns-top':
            return state.map[(state.nsMap[p.idx] as RealizedNamespace).top];
        case 'child':
            if (!('values' in node)) {
                throw new Error(`child, of node ${node.type}`);
            }
            return state.map[node.values[p.at]];
        case 'text':
            if (node.type !== 'string') {
                throw new Error(`node not string ${node.type}`);
            }
            if (p.at === 0) {
                return state.map[node.first];
            }
            if (p.at > node.templates.length) {
                throw new Error(
                    `not enough templates ${node.templates.length} vs text@${p.at}`,
                );
            }
            return state.map[node.templates[p.at - 1].suffix];
        case 'expr':
            if (node.type !== 'string') {
                throw new Error(`node not string ${node.type}`);
            }
            if (p.at === 0) {
                throw new Error(`cant do expr@0 in string`);
            }
            if (p.at > node.templates.length) {
                throw new Error(
                    `not enough templates ${node.templates.length} vs text@${p.at}`,
                );
            }
            return state.map[node.templates[p.at - 1].expr];
        case 'attribute':
            if (node.type === 'recordAccess') {
                return state.map[node.items[p.at - 1]];
            }
        case 'annot-annot':
            if (node.type !== 'annot') {
                throw new Error(`Node not an annot, ${node.type}`);
            }
            return state.map[node.annot];
        case 'annot-target':
            if (node.type !== 'annot') {
                throw new Error(`Node not an annot, ${node.type}`);
            }
            return state.map[node.target];
        case 'record-target':
            if (node.type !== 'recordAccess') {
                throw new Error(`node not a recordAccess, ${node.type}`);
            }
            return state.map[node.target];
        case 'tapply-target':
            if (node.type === 'tapply') {
                return state.map[node.target];
            }
            throw new Error(`Node not a tapply, ${node.type}`);
        case 'spread-contents':
            if (!('contents' in node)) {
                throw new Error(`contents? ${node.type}`);
            }
            return state.map[node.contents];
        // return;
        case 'rich-text':
        case 'subtext':
        case 'inside':
        case 'start':
        case 'end':
            if (!isLast) {
                throw new Error(`non terminal ${p.type}`);
            }
            return node;
    }
};

export const findTops = (state: Pick<NUIState, 'cards' | 'nsMap' | 'map'>) => {
    let all: {
        top: number;
        path: Path[];
        // hidden?: boolean;
        // plugin?: RealizedNamespace['plugin'];
        // display?: RealizedNamespace['display'];
        ns: RealizedNamespace;
    }[] = [];
    const seen: { [top: number]: boolean } = { [-1]: true };
    const add = (id: number, path: Path[]) => {
        const ns = state.nsMap[id];
        if (ns.type === 'normal') {
            if (!seen[ns.top]) {
                seen[ns.top] = true;
                all.push({
                    top: ns.top,
                    // hidden: ns.hidden,
                    path: [...path, { type: 'ns-top', idx: id }],
                    // plugin: ns.plugin,
                    // display: ns.display,
                    ns,
                });
            }
            ns.children.forEach((child, i) =>
                add(child, [
                    ...path,
                    {
                        type: 'ns',
                        child,
                        idx: id,
                    },
                ]),
            );
        }
    };
    state.cards.forEach((card, i) =>
        add(card.top, [{ type: 'card', idx: -1, card: i }]),
    );

    return all;
};
