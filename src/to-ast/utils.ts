// Utils related to parsing and stuff.
// This is to get line / column from
// a loc.start or loc.end

export const idxLines = (raw: string) => {
    const starts: number[] = [];
    let total = 0;
    raw.split('\n').forEach((line) => {
        starts.push(total);
        total += line.length + 1;
    });
    return starts;
};

export const getLine = (lines: number[], idx: number) => {
    for (let i = 1; i < lines.length; i++) {
        if (idx < lines[i]) {
            return i - 1;
        }
    }
    return lines.length - 1;
};

export const getPos = (lines: number[], idx: number) => {
    const line = getLine(lines, idx);
    return { line, col: idx - lines[line] };
};
