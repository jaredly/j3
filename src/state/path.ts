// Um the path

export type Path =
    | { idx: number; type: 'child'; at: number }
    | { idx: number; type: 'subtext'; at: number }
    | { idx: number; type: 'expr' | 'text' | 'attribute'; at: number }
    | { idx: number; type: 'annot-target' | 'annot-annot' }
    | { idx: number; type: 'tapply-target' }
    | { idx: number; type: 'inside' | 'start' | 'end' }
    | { idx: number; type: 'record-target' | 'spread-contents' };
