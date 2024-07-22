// yay

import ansis from 'ansis';
import { splitGraphemes } from '../../../src/parse/splitGraphemes';
import { Style } from '../nodes';
import { IR, IRSelection } from './intermediate';
import { LayoutChoices, LayoutCtx } from './layout';

export const maxLength = <T extends { length: number }>(l: T[]) =>
    l.map((l) => l.length).reduce((a, b) => Math.max(a, b));

export const white = (num: number) => Array(num + 1).join(' ');

const justify = (text: string) => {
    const lines = text.split('\n');
    const lls = lines.map(ansis.strip);
    const max = maxLength(lls);
    return lines
        .map(
            (l, i) =>
                l + (lls[i].length < max ? white(max - lls[i].length) : ''),
        )
        .join('\n');
};

export const joinChunks = (chunks: string[], pullLast = false) => {
    const lined = chunks.map((c) => c.split('\n'));
    const max = maxLength(lined.map((l) => l.map((l) => ansis.strip(l)))); // lined.map(l => l.length).reduce((a, b) => Math.max(a, b))
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
            const lls = group.map(ansis.strip);
            const ml = maxLength(lls);
            group.forEach((line, i) => {
                if (lls[i].length < ml) {
                    group[i] = line + white(ml - lls[i].length);
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

type TextCtx = {
    space: string;
    // highlightText?(s: string): string;
    // colorText?(s: string, color: string): string;
    layouts: LayoutCtx['layouts'];
    color?: boolean;
    annotateNewlines?: boolean;
};

export const irToText = (
    ir: IR,
    irs: Record<number, IR>,
    choices: LayoutChoices,
    selection: null | {
        path: number[];
        sel: IRSelection;
        start?: IRSelection;
        cursorChar: string;
    },
    ctx: TextCtx,
    // space = ' ',
): string => {
    switch (ir.type) {
        case 'loc': {
            const { choices } = ctx.layouts[ir.loc];
            const sub =
                selection?.path[0] === ir.loc
                    ? { ...selection, path: selection.path.slice(1) }
                    : null;
            return irToText(irs[ir.loc], irs, choices, sub, ctx);
        }
        case 'cursor':
            if (selection?.path.length === 0) {
                if (
                    selection.sel.type === 'side' &&
                    selection.sel.side === ir.side
                ) {
                    return selection.cursorChar;
                }
                // if (
                //     selection.start?.type === 'side' &&
                //     selection.start.side === ir.side
                // ) {
                //     return '.';
                // }
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
            return applyFormats(ir.text, ir.style, ctx.color);
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
                last.push(irToText(item, irs, choices, selection, ctx));
            });

            // const pre = wrap.groups.length ? wrap.groups.join(',') + '\n' : '';

            const res = lines
                .map((chunks, i) => chunks.join(''))
                .join(ctx.annotateNewlines ? '!\n' : '\n');
            return res; // !ctx.color ? res : ansis.bgRgb(30, 30, 0)(justify(res));
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
                    last.push(irToText(item, irs, choices, selection, ctx));
                });
                return blockFormat(
                    lines
                        .map((chunks, i) => {
                            if (ir.spaced) {
                                addSpaces(chunks, 'all', ctx.space);
                            }
                            if (i > 0 && ir.wrap!.indent > 0) {
                                chunks.unshift(white(ir.wrap!.indent));
                            }
                            return joinChunks(
                                chunks,
                                ir.pullLast && i === lines.length - 1,
                            );
                        })
                        .join('\n'),
                    ir.style,
                    ctx.color,
                );
            }
            const chunks = ir.items.map((item) =>
                irToText(item, irs, choices, selection, ctx),
            );
            if (ir.spaced) {
                addSpaces(chunks, 'all', ctx.space);
            }
            return blockFormat(
                joinChunks(chunks, ir.pullLast),
                ir.style,
                ctx.color,
            );
        case 'indent':
            return joinChunks([
                white(ir.amount ?? 2),
                irToText(ir.item, irs, choices, selection, ctx),
            ]);
        case 'squish':
            return irToText(ir.item, irs, choices, selection, ctx);
        case 'text': {
            // const text = ir.text
            if (ir.wrap == null)
                return applyFormats(ir.text, ir.style, ctx.color);
            const splits = choices[ir.wrap];
            if (splits?.type === 'text-wrap' && splits.splits.length) {
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
                    if (i === 0) {
                        pieces.unshift(ir.text.slice(0, splits.splits[0]));
                    }
                }
                // return pieces.join('↩\n');
                return applyFormats(
                    pieces.join(ctx.annotateNewlines ? '↩\n' : '\n'),
                    ir.style,
                    ctx.color,
                );
            }
            return applyFormats(ir.text, ir.style, ctx.color);
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
                selection,
                ctx,
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
                            selection,
                            ctx,
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
                                selection,
                                ctx,
                            ),
                        });
                    } else {
                        pairs.push({
                            type: 'other',
                            item: irToText(item, irs, choices, selection, ctx),
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
                .map((item) => irToText(item, irs, choices, selection, ctx))
                .join('\n');
    }
};

const normal = 'abcdefghijklmnopqrstuvwxyz';
const bold = splitGraphemes('𝐚𝐛𝐜𝐝𝐞𝐟𝐠𝐡𝐢𝐣𝐤𝐥𝐦𝐧𝐨𝐩𝐪𝐫𝐬𝐭𝐮𝐯𝐰𝐱𝐲𝐳');
const italic = splitGraphemes('𝑎𝑏𝑐𝑑𝑒𝑓𝑔ℎ𝑖𝑗𝑘𝑙𝑚𝑛𝑜𝑝𝑞𝑟𝑠𝑡𝑢𝑣𝑤𝑥𝑦𝑧');
const bolditalic = splitGraphemes('𝒂𝒃𝒄𝒅𝒆𝒇𝒈𝒉𝒊𝒋𝒌𝒍𝒎𝒏𝒐𝒑𝒒𝒓𝒔𝒕𝒖𝒗𝒘𝒙𝒚𝒛');
const underline = String.fromCharCode(818);

const blockFormat = (text: string, style?: Style, enable?: boolean) => {
    if (!style || !enable) return text;
    if (style.background) {
        text = ansis.bgRgb(
            style.background.r,
            style.background.g,
            style.background.b,
        )(justify(text));
        // } else {
        //     text = ansis.bgBlack(text);
    } else if (style.background === false) {
        // Background Base
        // text = ansis.reset(text);
        text = ansis.bgRgb(25, 25, 25)(justify(text));
    }
    if (style.color) {
        text = ansis.rgb(style.color.r, style.color.g, style.color.b)(text);
    }
    return text;
};

const applyFormats = (text: string, style?: Style, color?: boolean) => {
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
    if (color && style.color) {
        text = ansis.rgb(style.color.r, style.color.g, style.color.b)(text);
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
