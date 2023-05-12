// So types for things I guess

import { UpdateMap } from '../../src/state/getKeyUpdate';
import { AutoCompleteResult } from '../../src/to-ast/Ctx';
import { Selection } from '../store';

/*
CST
- identifier, tag, number, comment, stringText, blank, unparsed (no children)
- list/record/array 'child' at / 'start' / 'end' / 'inside'
- string 'prefix' / 'suffix' at / 'expr' at / 'start' / 'end'
- spread 'contents' / 'start'
- attrs 'attr' at
- [all] tannot tapply
*/
export type PathItem = PathItemInner & {
    pidx: number;
};
export type PathItemInner =
    | {
          type: 'child' | 'string:suffix' | 'string:expr' | 'attr';
          at: number;
      }
    | {
          type: 'spread:contents';
      }
    | {
          type: 'tannot' | 'tapply';
      }
    | {
          type: 'start' | 'end' | 'inside';
      }
    | {
          type: 'string:prefix';
      };

export type Node = NodeInner & NodeCommon;

export type Update = { map?: UpdateMap; selection?: Selection };

export type NodeCommon = {
    // TODO: Should these actually return like a command?
    // or like an updateMap? Probably tbh
    // onSelect: (pos: number) => void;
    // path: PathItem[];
    // events: {
    //     onLeft(): void;
    //     onRight(): void;
    //     onBackspace(): void;
    //     // Maybe this is just onRight?
    //     // onTab(): void,
    // };
    style?: React.CSSProperties;
};

export type Input = {
    type: 'input';
    text: string;
    idx: number;
    onKeyDown: (key: string) => Update;
    onInput: (text: string) => Update;
};
export type Blinker = {
    type: 'blinker';
    onKeyDown: (key: string) => Update;
};

export type NodeInner =
    | Input
    | Blinker
    | {
          type: 'group';
          children: Node[];
          idx: number;
      }
    | {
          type: 'dressing';
          onMouseDown: (left: boolean) => Selection;
      };

// ok but
/*
would it be nodes: {[idx: number]: Node}?
but then ... I wouldnt be able to do 'dressing'
- which btw dressing doesn't have onBackspaceeeeeee
  and it doesn't super have onLeft or onRight I mean
or 'blinker'
so
WAIT
maybe events don't live on there.
it's just 'onKeyDown' and 'onInput' and stuff
I think?
*/
export type UIState = {
    tree: Node;
    map: { [idx: number]: (Input | Blinker) & NodeCommon };
    menu: { selection: number; items: AutoCompleteResult }[];
    hover: string[];
};
