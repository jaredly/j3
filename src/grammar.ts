import { Node } from './types/cst';
import * as raw from './grammar-raw';

export const parse: (text: string, options?: any) => Node[] = raw.parse;
export const setIdx: (idx: number) => void = raw.setIdx;
export const nidx: () => number = raw.nidx;
