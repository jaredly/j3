import { splitGraphemes } from '../../../src/parse/splitGraphemes';
import { BlockEntry } from './block-to-text';
import { underlineText } from './format';

export const matchesSpan = (
    x: number,
    y: number,
    span: BlockEntry['shape'],
) => {
    if (span.type === 'block') {
        return (
            span.start[0] <= x &&
            span.start[0] + span.width > x &&
            span.start[1] <= y &&
            span.start[1] + span.height > y
        );
    }
    if (y === span.start[1]) {
        return x >= span.start[0] && x <= span.hbounds[1];
    }
    if (y === span.end[1]) {
        return x >= span.hbounds[0] && x <= span.end[0];
    }
    return (
        y > span.start[1] &&
        y < span.end[1] &&
        x >= span.hbounds[0] &&
        x <= span.hbounds[1]
    );
};

export const highlightSpan = (text: string, span: BlockEntry['shape']) => {
    const lines = text.split('\n');
    if (span.type === 'block') {
        return lines
            .map((line, i) => {
                if (
                    i >= span.start[1] &&
                    i <= span.start[1] + span.height - 1
                ) {
                    const chars = splitGraphemes(line);
                    if (span.width === 0 && span.height === 1) {
                        return (
                            chars.slice(0, span.start[0]).join('') +
                            '|' +
                            chars.slice(span.start[0]).join('')
                        );
                    }
                    return (
                        chars.slice(0, span.start[0]).join('') +
                        underlineText(
                            chars
                                .slice(
                                    span.start[0],
                                    span.start[0] + span.width,
                                )
                                .join(''),
                        ) +
                        chars.slice(span.start[0] + span.width).join('')
                    );
                }
                return line;
            })
            .join('\n');
    }
    return lines
        .map((line, i) => {
            if (i >= span.start[1] && i <= span.end[1]) {
                const chars = splitGraphemes(line);
                const start =
                    i === span.start[1] ? span.start[0] : span.hbounds[0];
                const end = i === span.end[1] ? span.end[0] : span.hbounds[1];
                // if (start > end) return line;
                return (
                    chars.slice(0, start).join('') +
                    underlineText(chars.slice(start, end).join('')) +
                    chars.slice(end).join('')
                );
            }
            return line;
        })
        .join('\n');
};
