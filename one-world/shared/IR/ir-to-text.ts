// yay

import { IR } from './intermediate';
import { LayoutChoices, LayoutCtx } from './layout';

export const maxLength = <T extends { length: number }>(l: T[]) =>
    l.map((l) => l.length).reduce((a, b) => Math.max(a, b));

const white = (num: number) => Array(num + 1).join(' ');

export const joinChunks = (chunks: string[], pullLast = false) => {
    const lined = chunks.map((c) => c.split('\n'));
    const max = maxLength(lined); // lined.map(l => l.length).reduce((a, b) => Math.max(a, b))
    if (max === 1) return chunks.join('');
    lined.forEach((group, i) => {
        for (let k = group.length; k < max; k++) {
            if (pullLast && i === chunks.length - 1) {
                group.unshift('');
            } else {
                group.push('');
            }
        }
        if (i < lined.length - 1) {
            const ml = maxLength(group);
            group.forEach((line, i) => {
                if (line.length < ml) {
                    group[i] = line + white(ml - line.length);
                }
            });
        }
    });
    const result = [];
    for (let i = 0; i < max; i++) {
        result.push(lined.map((l) => l[i]).join(''));
    }
    return result.join('\n');
};

const addSpaces = (
    items: string[],
    mode: 'all' | 'braced' | 'start' | 'end',
    space = '.',
) => {
    let min = mode === 'all' || mode === 'end' ? 1 : 2;
    let max = items.length - (mode === 'all' || mode === 'start' ? 1 : 2);
    for (let i = max; i >= min; i--) {
        items.splice(i, 0, space);
    }
};

export const irToText = (
    ir: IR,
    irs: Record<number, IR>,
    choices: LayoutChoices,
    layouts: LayoutCtx['layouts'],
): string => {
    switch (ir.type) {
        case 'loc': {
            const { choices } = layouts[ir.loc];
            return irToText(irs[ir.loc], irs, choices, layouts);
        }
        case 'punct':
            return ir.text;
        case 'horiz':
            const wrap = ir.wrap != null ? choices[ir.wrap.id] : null;
            if (ir.wrap && wrap?.type === 'hwrap') {
                const lines: string[][] = [];
                ir.items.forEach((item, i) => {
                    if (wrap.groups.includes(i)) {
                        lines.push([]);
                    }
                    const last = lines[lines.length - 1];
                    // if (last.length && (
                    //     ir.spaced === 'all')
                    // ) {
                    //     last.push()
                    // }
                    last.push(irToText(item, irs, choices, layouts));
                });
                return lines
                    .map((chunks, i) => {
                        if (ir.spaced) {
                            const mode =
                                ir.spaced === 'braced'
                                    ? lines.length === 1
                                        ? 'braced'
                                        : i === 0
                                        ? 'start'
                                        : i === lines.length - 1
                                        ? 'end'
                                        : 'all'
                                    : 'all';
                            addSpaces(chunks, mode);
                        }
                        if (i > 0 && ir.wrap!.indent > 0) {
                            chunks.unshift(white(ir.wrap!.indent));
                        }
                        return joinChunks(
                            chunks,
                            ir.pullLast && i === lines.length - 1,
                        );
                    })
                    .join('\n');
            }
            const chunks = ir.items.map((item) =>
                irToText(item, irs, choices, layouts),
            );
            if (ir.spaced) {
                addSpaces(chunks, ir.spaced);
            }
            return joinChunks(chunks, ir.pullLast);
        case 'indent':
            return joinChunks([
                white(ir.amount ?? 2),
                irToText(ir.item, irs, choices, layouts),
            ]);
        case 'squish':
            return irToText(ir.item, irs, choices, layouts);
        case 'text':
            return ir.text; // todo wrappp
        case 'switch':
            const choice = choices[ir.id];
            if (choice?.type !== 'switch') {
                throw new Error(`switch not resolved ${ir.id}`);
            }
            return irToText(ir.options[choice.which], irs, choices, layouts);
        case 'inline':
            return ir.items
                .map((item) => irToText(item, irs, choices, layouts))
                .join('');
        case 'vert':
            return ir.items
                .map((item) => irToText(item, irs, choices, layouts))
                .join('\n');
    }
};
