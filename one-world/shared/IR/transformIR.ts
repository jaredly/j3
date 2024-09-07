import { IR } from './intermediate';

export const transformIR = (ir: IR, fn: (ir: IR) => IR | null): IR => {
    const recur = (ir: IR) => transformIR(ir, fn);
    ir = fn(ir) ?? ir;
    switch (ir.type) {
        case 'text':
        case 'loc':
        case 'control':
        case 'cursor':
        case 'punct':
            return ir;
        case 'table': {
            let changed = false;
            const rows = ir.rows.map((row) =>
                row.map((ir) => {
                    const res = recur(ir);
                    changed = changed || res !== ir;
                    return res;
                }),
            );
            return changed ? { ...ir, rows } : ir;
        }
        case 'horiz':
        case 'vert':
        case 'inline': {
            let changed = false;
            const items = ir.items.map((ir) => {
                const res = recur(ir);
                if (res !== ir) changed = true;
                return res;
            });
            return changed ? { ...ir, items } : ir;
        }
        case 'indent':
        case 'squish':
            const item = recur(ir.item);
            return item !== ir.item ? { ...ir, item } : ir;
        case 'switch':
            let changed = false;
            const options = ir.options.map((ir) => {
                const res = recur(ir);
                if (res !== ir) changed = true;
                return res;
            });
            // THIS RELIES on the navigable items being
            // identical between options of the switch.
            return changed ? { ...ir, options } : ir;
    }
};
