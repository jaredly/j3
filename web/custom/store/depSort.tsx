import { filterNulls } from '../old-stuff/reduce';
import { unique } from './getResults';

export const depSort = <T,>(
    nodes: ({
        id: number;
        names: { name: string; loc: number; kind: 'value' | 'type' }[];
        deps: { name: string; kind: 'value' | 'type' }[];
        hidden?: boolean;
    } & T)[],
) => {
    const idForName: { [name: string]: number } = {};
    nodes.forEach((node) =>
        node.names.forEach(
            ({ name, kind }) => (idForName[name + ' ' + kind] = node.id),
        ),
    );

    // Record<a, b> where a depends on b
    const edges: { [key: number]: number[] } = {};
    // Record<b, a> where b is a dependency of a
    const back: { [key: number]: number[] } = {};

    let hasDeps = false;
    nodes.forEach((node) => {
        if (node.deps.length) hasDeps = true;
        edges[node.id] = unique(
            node.deps
                .map(({ name, kind }) => idForName[name + ' ' + kind])
                .filter(filterNulls),
        );
        edges[node.id].forEach((id) => {
            if (!back[id]) {
                back[id] = [node.id];
            } else {
                back[id].push(node.id);
            }
        });
    });

    if (!hasDeps) return nodes.map((node) => [node]);

    const keys = Object.keys(edges).map((m) => +m);

    let changed = true;
    while (changed) {
        changed = false;
        for (let key of keys) {
            const added: number[] = [];
            edges[key].forEach((dep) => {
                if (dep === key) return;
                added.push(
                    ...edges[dep].filter((k) => !edges[key].includes(k)),
                );
            });
            if (added.length) {
                changed = true;
                added.forEach((k) => {
                    if (!edges[key].includes(k)) {
                        edges[key].push(k);
                    }
                });
            }
        }
    }

    const cycles: { members: number[]; deps: number[] }[] = [];
    const used: Record<number, true> = {};
    const left: number[] = [];
    keys.forEach((k) => {
        if (used[k]) return;
        if (edges[k].includes(k)) {
            const cycle = [k];
            const deps: number[] = [];
            edges[k].forEach((d) => {
                if (edges[d].includes(k)) {
                    if (!cycle.includes(d)) {
                        cycle.push(d);
                    }
                } else {
                    deps.push(d);
                }
            });
            cycle.forEach((k) => (used[k] = true));
            cycles.push({ members: cycle, deps });
        } else {
            left.push(k);
        }
    });

    // Here's what we can do.
    const sorted: number[][] = [];

    const seen: Record<number, true> = {};

    let tick = 0;

    while (left.length || cycles.length) {
        if (tick++ > 10000) throw new Error('too many cycles');
        let toRemove: number[] = [];
        for (let i = 0; i < left.length; i++) {
            if (edges[left[i]].every((k) => seen[k])) {
                sorted.push([left[i]]);
                seen[left[i]] = true;
                toRemove.unshift(i);
                // left.splice(i, 1)
                // break
            }
        }
        if (toRemove.length) {
            toRemove.forEach((i) => left.splice(i, 1));
        }
        toRemove = [];
        for (let i = 0; i < cycles.length; i++) {
            if (cycles[i].deps.every((k) => seen[k])) {
                sorted.push(cycles[i].members);
                cycles[i].members.forEach((k) => (seen[k] = true));
                // cycles.splice(i, 1)
                // break
                toRemove.unshift(i);
            }
        }
        if (toRemove.length) {
            toRemove.forEach((i) => cycles.splice(i, 1));
        }
    }

    const byKey: Record<string, T> = {};
    nodes.forEach((n) => (byKey[n.id] = n));

    return sorted.map((group) => group.map((k) => byKey[k]));
};
