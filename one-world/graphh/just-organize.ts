import { childLocs, foldNode, fromMap, IDRef, Loc } from '../shared/nodes';
import { Toplevel, Toplevels } from '../shared/toplevels';
import { init } from './by-hand';
import { collectModuleComponents } from './collapse-components';

const getReferences = (top: Toplevel) => {
    const references: IDRef[] = [];

    const check = (loc: number) => {
        const node = top.nodes[loc];
        if (node.type === 'id' && node.ref?.type === 'toplevel') {
            references.push(node.ref);
        }
        childLocs(node).forEach(check);
    };

    check(top.root);

    return references;
};

export const hashToplevels = (
    toplevels: Toplevels,
    hasher: (top: Toplevel[]) => string,
) => {
    const { ctx, caches } = init();

    const references: Record<string, IDRef[]> = {};
    Object.values(toplevels).forEach((top) => {
        references[top.id] = getReferences(top);
    });

    Object.keys(toplevels).forEach((id) => {
        collectModuleComponents(
            id,
            ctx.components,
            [],
            (id) => references[id],
            (id) => toplevels[id].module,
        );
    });

    const processed: Record<
        string,
        Omit<Toplevel, 'hash'> & { hash: string; recursives: string[] }
    > = {};
    const process = (id: string): string => {
        const top = toplevels[id];

        const head = ctx.components[top.module].pointers[id];
        const mutuals = ctx.components[top.module].entries[head];
        if (head !== id) {
            const hash = process(head);
            return hash;
        }

        if (processed[id]) return processed[id].hash;

        const tops: Toplevel[] = [];

        mutuals.forEach((mid) => {
            const top = toplevels[mid];
            const nodes = { ...top.nodes };
            Object.values(nodes).forEach((node) => {
                if (
                    node.type === 'id' &&
                    node.ref?.type === 'toplevel' &&
                    references[mid].includes(node.ref)
                ) {
                    const dep = node.ref.loc[0][0];
                    nodes[node.loc] = {
                        ...node,
                        ref: {
                            ...node.ref,
                            lock: mutuals.includes(dep)
                                ? {
                                      manual: false,
                                      hash: 'self',
                                  }
                                : { hash: process(dep), manual: false },
                        },
                    };
                }
            });

            tops.push({ ...top, nodes });
        });

        const hash = hasher(tops);
        tops.forEach((top) => {
            processed[top.id] = { ...top, recursives: mutuals, hash };
        });

        return hash;
    };

    Object.keys(toplevels).forEach((id) => {
        process(id);
    });
    // ok, so now we have things sorted, more or less.
    // is the `head` pointer dealio stable?
    // ok yup it is. it's sorted lexigraphically by id. nice.
    return processed;
};
