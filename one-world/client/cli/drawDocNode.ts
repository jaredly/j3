import { splitGraphemes } from '../../../src/parse/splitGraphemes';
import { Control } from '../../shared/IR/intermediate';
import { Style } from '../../shared/nodes';

export const textLayout = (text: string, firstLine: number, style?: Style) => {
    const lines = text.split('\n');
    const height = lines.length;
    const inlineHeight = 1;
    let inlineWidth = firstLine;
    let maxWidth = 0;
    let firstLineWidth = 0;
    lines.forEach((line, i) => {
        inlineWidth = splitGraphemes(line).length;
        if (i === 0) {
            firstLineWidth = inlineWidth + firstLine;
        }
        if (i === 0) inlineWidth += firstLine;
        maxWidth = Math.max(maxWidth, inlineWidth);
    });
    return {
        height,
        inlineHeight,
        inlineWidth,
        maxWidth,
        firstLineWidth,
        multiLine: lines.length > 1,
    };
};

export const controlLayout = (control: Control) => {
    let w = 4;
    if (control.type === 'number') {
        w = control.width + 3;
    }
    return {
        height: 1,
        inlineHeight: 1,
        firstLineWidth: w,
        inlineWidth: w,
        maxWidth: w,
    };
};
