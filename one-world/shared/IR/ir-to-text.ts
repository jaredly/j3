// yay

import { splitGraphemes } from '../../../src/parse/splitGraphemes';
import { Style } from '../nodes';
import { IR, IRSelection } from './intermediate';
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
    mode: 'all' | 'start' | 'end',
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
    selection?: { path: number[]; sel: IRSelection; start?: IRSelection },
    space = ' ',
): string => {
    switch (ir.type) {
        case 'loc': {
            const { choices } = layouts[ir.loc];
            const sub =
                selection?.path[0] === ir.loc
                    ? { ...selection, path: selection.path.slice(1) }
                    : undefined;
            return irToText(irs[ir.loc], irs, choices, layouts, sub, space);
        }
        case 'cursor':
            if (selection?.path.length === 0) {
                if (
                    selection.sel.type === 'side' &&
                    selection.sel.side === ir.side
                ) {
                    return '|';
                }
                if (
                    selection.start?.type === 'side' &&
                    selection.start.side === ir.side
                ) {
                    return '.';
                }
            }
            return '';
        case 'control':
            switch (ir.control.type) {
                case 'check':
                    return ir.control.checked ? '[x] ' : '[ ] ';
                case 'radio':
                    return ir.control.checked ? '(x) ' : '( ) ';
                case 'bullet':
                    return ' - ';
                case 'number':
                    return `${ir.control.num
                        .toString()
                        .padStart(ir.control.width, ' ')}) `;
                default:
                    throw new Error('no');
            }
        case 'punct':
            return ir.text;
        case 'inline': {
            const wrap = choices[ir.wrap];
            if (!wrap || wrap.type !== 'hwrap')
                throw new Error('no wrap for inline ' + ir.wrap);

            const lines: string[][] = [];
            ir.items.forEach((item, i) => {
                if (wrap.groups.includes(i)) {
                    lines.push([]);
                }
                const last = lines[lines.length - 1];
                last.push(
                    irToText(item, irs, choices, layouts, selection, space),
                );
            });

            const pre = wrap.groups.length ? wrap.groups.join(',') + '\n' : '';

            return pre + lines.map((chunks, i) => chunks.join('')).join('!\n');
        }
        case 'horiz':
            const wrap = ir.wrap != null ? choices[ir.wrap.id] : null;
            if (ir.wrap && wrap?.type === 'hwrap') {
                // const pre = wrap.groups.join(',') + '\n';
                const lines: string[][] = [];
                ir.items.forEach((item, i) => {
                    if (wrap.groups.includes(i)) {
                        lines.push([]);
                    }
                    const last = lines[lines.length - 1];
                    last.push(
                        irToText(item, irs, choices, layouts, selection, space),
                    );
                });
                return lines
                    .map((chunks, i) => {
                        if (ir.spaced) {
                            addSpaces(chunks, 'all', space);
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
                irToText(item, irs, choices, layouts, selection, space),
            );
            if (ir.spaced) {
                addSpaces(chunks, 'all', space);
            }
            return joinChunks(chunks, ir.pullLast);
        case 'indent':
            return joinChunks([
                white(ir.amount ?? 2),
                irToText(ir.item, irs, choices, layouts, selection, space),
            ]);
        case 'squish':
            return irToText(ir.item, irs, choices, layouts, selection, space);
        case 'text': {
            const text = applyFormats(ir.text, ir.style);
            if (ir.wrap == null) return text;
            const splits = choices[ir.wrap];
            if (splits?.type === 'text-wrap' && splits.splits.length) {
                let pieces = [];
                for (let i = splits.splits.length - 1; i >= 0; i--) {
                    if (i === splits.splits.length - 1) {
                        pieces.unshift(text.slice(splits.splits[i]));
                    } else {
                        pieces.unshift(
                            text.slice(splits.splits[i], splits.splits[i + 1]),
                        );
                    }
                    if (i === 0) {
                        pieces.unshift(text.slice(0, splits.splits[0]));
                    }
                }
                return pieces.join('↩\n');
            }
            return text; // todo wrappp
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
                selection,
                space,
            );
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
                            selection,
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
                                selection,
                                space,
                            ),
                        });
                    } else {
                        pairs.push({
                            type: 'other',
                            item: irToText(
                                item,
                                irs,
                                choices,
                                layouts,
                                selection,
                                space,
                            ),
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
                .map((item) =>
                    irToText(item, irs, choices, layouts, selection, space),
                )
                .join('\n');
    }
};

const normal = 'abcdefghijklmnopqrstuvwxyz';
const bold = splitGraphemes('𝐚𝐛𝐜𝐝𝐞𝐟𝐠𝐡𝐢𝐣𝐤𝐥𝐦𝐧𝐨𝐩𝐪𝐫𝐬𝐭𝐮𝐯𝐰𝐱𝐲𝐳');
const italic = splitGraphemes('𝑎𝑏𝑐𝑑𝑒𝑓𝑔ℎ𝑖𝑗𝑘𝑙𝑚𝑛𝑜𝑝𝑞𝑟𝑠𝑡𝑢𝑣𝑤𝑥𝑦𝑧');
const bolditalic = splitGraphemes('𝒂𝒃𝒄𝒅𝒆𝒇𝒈𝒉𝒊𝒋𝒌𝒍𝒎𝒏𝒐𝒑𝒒𝒓𝒔𝒕𝒖𝒗𝒘𝒙𝒚𝒛');
const underline = String.fromCharCode(818);

const applyFormats = (text: string, style?: Style) => {
    if (!style) return text;
    if (style.fontWeight === 'bold') {
        if (style.fontStyle === 'italic') {
            text = convert(text, bolditalic);
        } else {
            text = convert(text, bold);
        }
    } else if (style.fontStyle === 'italic') {
        text = convert(text, italic);
    }
    if (style.textDecoration === 'underline') {
        const emes = splitGraphemes(text);
        text = emes.map((m) => m + underline).join('');
    }
    return text;
};

const convert = (text: string, alph: string[]) => {
    let res = '';
    for (let i = 0; i < text.length; i++) {
        const idx = normal.indexOf(text[i]);
        if (idx === -1) res += text[i];
        else res += alph[idx];
    }
    return res;
};
