import GraphemeSplitter from 'grapheme-splitter';

const seg = new GraphemeSplitter();

export const splitGraphemes = (text: string) => {
    return seg.splitGraphemes(text);
};
