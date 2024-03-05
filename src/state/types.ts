// The types

import { PathChild } from './path';

export type ONode =
    | { type: 'blinker'; loc: 'start' | 'end' | 'inside' }
    | {
          type: 'punct';
          text: string;
          color: 'rainbow' | string;
          boldSelect?: boolean;
      }
    | {
          type: 'render';
          text: string;
      }
    | {
          type: 'ref';
          id: number;
          path: PathChild;
          ancestors?: (PathChild & { idx: number })[];
      };
