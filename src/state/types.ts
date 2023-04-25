// The types

import { Path } from '../../web/store';

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
          path: Path['child'];
      };
