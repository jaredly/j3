import { Path } from '../../src/state/path';
import { StartDrag } from './useNSDrag';

export type Drag = { start: StartDrag; cancel: () => void };

export type NsReg = {
    [key: string]: {
        node: HTMLDivElement;
        path: Path[];
        dest: { idx: number; child: number };
    } | null;
};
