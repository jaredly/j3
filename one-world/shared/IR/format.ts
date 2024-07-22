import ansis from 'ansis';
import { splitGraphemes } from '../../../src/parse/splitGraphemes';
import { Style } from '../nodes';
import { maxLength, white } from './ir-to-text';

const normal = 'abcdefghijklmnopqrstuvwxyz';
const bold = splitGraphemes('𝐚𝐛𝐜𝐝𝐞𝐟𝐠𝐡𝐢𝐣𝐤𝐥𝐦𝐧𝐨𝐩𝐪𝐫𝐬𝐭𝐮𝐯𝐰𝐱𝐲𝐳');
const italic = splitGraphemes('𝑎𝑏𝑐𝑑𝑒𝑓𝑔ℎ𝑖𝑗𝑘𝑙𝑚𝑛𝑜𝑝𝑞𝑟𝑠𝑡𝑢𝑣𝑤𝑥𝑦𝑧');
const bolditalic = splitGraphemes('𝒂𝒃𝒄𝒅𝒆𝒇𝒈𝒉𝒊𝒋𝒌𝒍𝒎𝒏𝒐𝒑𝒒𝒓𝒔𝒕𝒖𝒗𝒘𝒙𝒚𝒛');
const underline = String.fromCharCode(818);

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

export const blockFormat = (text: string, style?: Style, enable?: boolean) => {
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

export const applyFormats = (text: string, style?: Style, color?: boolean) => {
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
