import { recNodeToText } from '../client/cli/drawDocNode';
import { aBlockToString } from '../shared/IR/block-to-attributed-text';
import { fromMap, Loc } from '../shared/nodes';
import { HistoryItem, DocumentNode } from '../shared/state2';
import { Toplevel } from '../shared/toplevels';

export const showChanges = (changes: HistoryItem['changes']) => {
    const text: string[] = [];

    const nt = (node: DocumentNode) =>
        `${node.id}:${node.toplevel}:${node.children.join(',')}`;
    const tt = (top: Toplevel) => {
        const rn = fromMap((n) => [[top.id, n]] as Loc, top.root, top.nodes, {
            children: [],
            map: {},
        });
        return (
            `top: ${top.id} = ` +
            aBlockToString(
                recNodeToText(
                    rn,
                    {
                        errors: [],
                        exports: [],
                        layouts: [],
                        references: [],
                        styles: {},
                        tableHeaders: {},
                        top: null,
                    },
                    100,
                ),
                false,
            )
        );
    };

    if (changes.nodes || changes.prevNodes) {
        if (changes.nodes) {
            Object.keys(changes.nodes).forEach((k) => {
                if (changes.prevNodes && changes.prevNodes[+k]) {
                    text.push(`- ${nt(changes.prevNodes[+k])}`);
                }
                text.push(`+ ${nt(changes.nodes![+k])}`);
            });
        }
        if (changes.prevNodes) {
            Object.keys(changes.prevNodes).forEach((k) => {
                if (!changes.nodes || !changes.nodes[+k]) {
                    text.push(`- ${nt(changes.prevNodes![+k])}`);
                }
            });
        }
    }

    if (changes.toplevels || changes.prevToplevels) {
        if (changes.toplevels) {
            Object.keys(changes.toplevels).forEach((k) => {
                if (changes.prevToplevels && changes.prevToplevels[k]) {
                    text.push(`- ${tt(changes.prevToplevels[k])}`);
                }
                if (changes.toplevels![k]) {
                    text.push(`+ ${tt(changes.toplevels![k])}`);
                }
            });
        }
        if (changes.prevToplevels) {
            Object.keys(changes.prevToplevels).forEach((k) => {
                if (!changes.toplevels || !changes.toplevels[k]) {
                    text.push(`- ${tt(changes.prevToplevels![k])}`);
                }
            });
        }
    }
    return text.join('\n');
};
