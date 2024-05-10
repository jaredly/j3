import { Sendable } from '../worker/worker';
import equal from 'fast-deep-equal';

// function copyToOldResults(
//     oldResults: NUIResults,
//     results: ImmediateResults<any>,
// ) {
//     oldResults.jumpToName = results.jumpToName.value;
//     oldResults.display = {};
//     oldResults.errors = {};
//     Object.keys(results.nodes).forEach((top) => {
//         const node = results.nodes[+top];
//         Object.assign(oldResults.display, node.layout);
//         if (node.parsed?.type === 'failure') {
//             Object.assign(oldResults.errors, node.parsed.errors);
//         }
//     });
// }
export const calcChangedNodes = (
    nodes: Record<number, Sendable>,
    newNodes: Record<number, Sendable>,
    usages: Record<number, number[]>,
) => {
    const usageRecalc: Record<number, 'missing' | 'unused' | 'used'> = {};
    const addUsage = (k: number, add: number[], rm: number[]) => {
        if (usageRecalc[k] == null) {
            if (usages[k] == null) {
                usageRecalc[k] = 'missing';
            } else {
                usageRecalc[k] = usages[k].length > 0 ? 'used' : 'unused';
            }
        }
        if (!usages[k]) {
            usages[k] = add;
            return;
        }
        if (equal(add, rm)) return;
        // console.log(k, 'removing', rm);
        // console.log(k, 'and adding', add);
        usages[k] = usages[k].filter((u) => !rm.includes(u)).concat(add);
    };

    const result: Record<number, true> = {};
    Object.keys(newNodes).forEach((key) => {
        const add = (k: number) => (result[k] = true);

        // --------------- usages ---------------
        Object.keys(newNodes[+key].usages).forEach((k) => {
            addUsage(
                +k,
                newNodes[+key].usages[+k],
                nodes[+key]?.usages[+k] ?? [],
            );
        });
        if (nodes[+key]) {
            Object.keys(nodes[+key].usages).forEach((k) => {
                if (!newNodes[+key].usages[+k]) {
                    addUsage(+k, [], nodes[+key].usages[+k]);
                }
            });
        }

        // ------------------ errors -----------------
        if (!nodes[+key]) {
            Object.keys(newNodes[+key].errors).forEach((k) => add(+k));
            return;
        }

        const old = Object.keys(nodes[+key].errors);
        const nw = Object.keys(newNodes[+key].errors);
        old.forEach((k) => {
            if (!nw.includes(k)) add(+k);
        });
        nw.forEach((k) => {
            if (
                !old.includes(k) ||
                !equal(nodes[+key].errors[+k], newNodes[+key].errors[+k])
            ) {
                add(+k);
            }
        });
    });

    Object.entries(usageRecalc).forEach(([key, hadItems]) => {
        if (
            hadItems === 'missing' ||
            (hadItems === 'unused') != (usages[+key].length === 0)
        ) {
            result[+key] = true;
        }
    });

    // console.log('cacled changed nodes', usages);
    // console.log(result);

    return result;
};
