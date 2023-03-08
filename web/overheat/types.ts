// The types

import { Top } from '../old/IdentifierLike';
import { Events } from '../old/Nodes';
import { Path } from '../store';
import { RenderProps } from './Overheat';

export type ONode =
    | { type: 'blinker'; loc: 'start' | 'end' | 'inside'; innerLeft?: boolean }
    | {
          type: 'punct';
          text: string;
          color: 'rainbow' | string;
          boldSelect?: boolean;
          innerLeft?: boolean;
      }
    | {
          type: 'render';
          component: React.ComponentType<RenderProps<any>>;
          props?: any;
          innerLeft?: boolean;
      }
    | {
          type: 'extra';
          component: React.ComponentType<RenderProps<any>>;
          props?: any;
          innerLeft?: boolean;
      }
    | {
          type: 'ref';
          id: number;
          path: Path['child'];
          innerLeft?: boolean;
          events?: (top: Top, path: Path[]) => Partial<Events>;
      };
