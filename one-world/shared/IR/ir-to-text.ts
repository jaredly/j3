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
    space = ' ',
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
    space = ' ',
): string => {
    switch (ir.type) {
        case 'loc': {
            const { choices } = layouts[ir.loc];
            return irToText(irs[ir.loc], irs, choices, layouts, space);
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
                    last.push(irToText(item, irs, choices, layouts, space));
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
                            addSpaces(chunks, mode, space);
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
                irToText(item, irs, choices, layouts, space),
            );
            if (ir.spaced) {
                addSpaces(chunks, ir.spaced, space);
            }
            return joinChunks(chunks, ir.pullLast);
        case 'indent':
            return joinChunks([
                white(ir.amount ?? 2),
                irToText(ir.item, irs, choices, layouts, space),
            ]);
        case 'squish':
            return irToText(ir.item, irs, choices, layouts, space);
        case 'text': {
            const splits = choices[ir.id];
            if (splits?.type === 'text-wrap') {
                let pieces = [];
                for (let i = splits.splits.length - 1; i >= 0; i--) {
                    if (i === splits.splits.length - 1) {
                        pieces.unshift(ir.text.slice(splits.splits[i]));
                    } else {
                        pieces.unshift(
                            ir.text.slice(
                                splits.splits[i],
                                splits.splits[i + 1],
                            ),
                        );
                    }
                }
                return pieces.join('\n');
            }
            return ir.text; // todo wrappp
        }
        case 'switch':
            const choice = choices[ir.id];
            if (choice?.type !== 'switch') {
                throw new Error(`switch not resolved ${ir.id}`);
            }
            return irToText(
                ir.options[choice.which],
                irs,
                choices,
                layouts,
                space,
            );
        case 'inline':
            return ir.items
                .map((item) => irToText(item, irs, choices, layouts, space))
                .join('');
        case 'vert':
            if (ir.pairs) {
                // ok I'm gonna say, if it's pairs, it's all pairs.
                const pairs: (
                    | { type: 'other'; item: string }
                    | { type: 'pair'; left: string; l: number; right: string }
                )[] = [];
                let lw = 0;
                ir.items.forEach((item) => {
                    if (item.type === 'horiz' && item.items.length === 2) {
                        const left = irToText(
                            item.items[0],
                            irs,
                            choices,
                            layouts,
                            space,
                        );
                        let l = maxLength(left.split('\n'));
                        lw = Math.max(lw, l);
                        pairs.push({
                            type: 'pair',
                            left,
                            l,
                            right: irToText(
                                item.items[1],
                                irs,
                                choices,
                                layouts,
                                space,
                            ),
                        });
                    } else {
                        pairs.push({
                            type: 'other',
                            item: irToText(item, irs, choices, layouts, space),
                        });
                    }
                });
                lw += 1;
                return pairs
                    .map((item) =>
                        item.type === 'other'
                            ? item.item
                            : joinChunks([
                                  item.l < lw
                                      ? item.left
                                            .split('\n')
                                            .map((line) =>
                                                line.length < lw
                                                    ? line +
                                                      white(lw - line.length)
                                                    : line,
                                            )
                                            .join('\n')
                                      : item.left,
                                  item.right,
                              ]),
                    )
                    .join('\n');
            }
            return ir.items
                .map((item) => irToText(item, irs, choices, layouts, space))
                .join('\n');
    }
};
