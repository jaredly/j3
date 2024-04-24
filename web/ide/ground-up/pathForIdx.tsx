import { NUIState } from '../../custom/UIState';
import { selectStart } from '../../../src/state/navigate';
import { Path } from '../../store';
import { childPath, childPaths } from './findTops';
import { nodeChildren } from './CommandPalette';
import { add } from '../../custom/worker/add';

export const collectPaths = (state: NUIState) => {
    const parentPaths: Record<number, Path[]> = {};
    const nsPaths: Record<number, Path[]> = {};

    Object.keys(state.map).forEach((k) => {
        const node = state.map[+k];
        childPaths(node).forEach(({ path, idx }) => {
            add(parentPaths, idx, { ...path, idx: +k });
        });
    });

    Object.entries(state.nsMap).forEach(([k, ns]) => {
        add(parentPaths, ns.top, { type: 'ns-top', idx: +k });
        ns.children.forEach((child) => {
            add(nsPaths, child, { type: 'ns', child, idx: +k });
        });
    });

    state.cards.forEach((card, i) => {
        add(nsPaths, card.top, { type: 'card', card: i, idx: -1 });
    });

    const nsPathsFor = (idx: number): Path[][] => {
        if (!nsPaths[idx]) {
            console.warn(`reached the end of the line??`);
            return [];
        }
        return nsPaths[idx].flatMap((path) =>
            path.type === 'card'
                ? [[path]]
                : nsPathsFor(path.idx).map((p) => [...p, path]),
        );
    };

    const pathsFor = (idx: number): Path[][] => {
        if (!parentPaths[idx]) {
            console.warn(`reached the end of the line??`);
            return [];
        }
        return parentPaths[idx].flatMap((path) =>
            (path.type === 'ns-top'
                ? nsPathsFor(path.idx)
                : pathsFor(path.idx)
            ).map((p) => [...p, path]),
        );
    };

    return pathsFor;
};

export const pathForIdx = (
    num: number,
    {
        regs,
        map,
        cards,
        nsMap,
    }: Pick<NUIState, 'regs' | 'map' | 'cards' | 'nsMap'>,
) => {
    const got = regs[num]?.main ?? regs[num]?.outside;
    if (got) {
        return selectStart(num, got.path, map);
    }
    const parents: Record<number, number> = {};
    Object.keys(map).forEach((k) => {
        const node = map[+k];
        nodeChildren(node).forEach((child) => {
            if (parents[child] != null) {
                console.log(
                    'DUPLICATE parent or sth',
                    parents[child],
                    node.loc,
                );
            }
            parents[child] = node.loc;
        });
    });
    const nodeToNs: Record<number, number> = {};
    const nsParents: Record<number, number> = {};
    Object.keys(nsMap).forEach((k) => {
        const ns = nsMap[+k];
        if (ns.type === 'normal') {
            nodeToNs[ns.top] = ns.id;
            ns.children.forEach((child) => (nsParents[child] = ns.id));
        }
    });
    const nsToCard: Record<number, number> = {};
    cards.forEach((card, i) => {
        nsToCard[card.top] = i;
    });

    let iter = 0;

    const path: Path[] = [];
    let idx = num;
    let ns: number;
    while (true) {
        if (iter++ > 500) throw new Error('loop?');
        if (parents[idx] == null) {
            ns = nodeToNs[idx];
            if (ns == null) {
                console.error(`cant find ns for idx`, idx, nodeToNs, parents);
                return;
            }
            path.unshift({ type: 'ns-top', idx: ns });
            break;
        }
        const parent = parents[idx];
        const cp = childPath(map[parent], idx);
        if (!cp) {
            console.error(`cant find child path`, map[parent], idx);
            return;
        }
        path.unshift({ ...cp, idx: parent });
        idx = parent;
    }

    while (true) {
        if (iter++ > 500) throw new Error('loop?');
        const parent = nsParents[ns];
        if (parent == null) {
            const card = nsToCard[ns];
            if (card == null) {
                console.error(`no card for ns`, ns, nsToCard);
                return;
            }
            path.unshift({ type: 'card', card, idx: -1 });
            return path;
        }

        path.unshift({
            type: 'ns',
            child: ns,
            idx: parent,
        });
        ns = parent;
    }
    // Ok now trace it all back
};
