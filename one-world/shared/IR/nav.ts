import { splitGraphemes } from '../../../src/parse/splitGraphemes';
import { PathRoot } from '../nodes';
import { IR, IRSelection } from './intermediate';
import { LayoutCtx } from './layout';

export type IRCache = Record<
    string,
    {
        layouts: LayoutCtx['layouts'];
        irs: LayoutCtx['irs'];
        paths: Record<number, number[]>;
        root: PathRoot;
    }
>;

const irTexts = (ir: IR): Extract<IR, { type: 'text' }>[] => {
    switch (ir.type) {
        case 'text':
            return [ir];
        case 'horiz':
        case 'vert':
        case 'inline':
            return ir.items.flatMap(irTexts);
        case 'indent':
        case 'squish':
            return irTexts(ir.item);
        case 'switch':
            return irTexts(ir.options[0]);
    }
    return [];
};

export const navRight = (
    sel: IRSelection,
    cache: IRCache,
): IRSelection | void => {
    if (sel.start.cursor.type === 'text') {
        const path = sel.start.path;
        const ir =
            cache[path.root.toplevel].irs[
                path.children[path.children.length - 1]
            ];
        const texts = irTexts(ir);
        const text = texts[sel.start.cursor.end.index];
        if (!text) return console.warn('text w/ index does not exit');
        const len = splitGraphemes(text.text).length;
        if (sel.start.cursor.end.cursor < len) {
            return {
                start: {
                    ...sel.start,
                    cursor: {
                        type: 'text',
                        end: {
                            index: sel.start.cursor.end.index,
                            cursor: sel.start.cursor.end.cursor + 1,
                        },
                    },
                },
            };
        }
    }
};
