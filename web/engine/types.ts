// So types for things I guess

export type NodeCommon = {
    idx: number;
    events: {
        onLeft(): void;
        onRight(): void;
        onBackspace(): void;
        // Maybe this is just onRight?
        // onTab(): void,
    };
    path: PathItem[];
};

/*
CST
- identifier, tag, number, comment, stringText, blank, unparsed (no children)
- list/record/array 'child' at / 'start' / 'end' / 'inside'
- string 'prefix' / 'suffix' at / 'expr' at / 'start' / 'end'
- spread 'contents' / 'start'
- attrs 'attr' at

*/

// So, you can be a >child of a list-like (list array record)
// OR a start/end of a group (listlike or )
// you can also be an item of a attr.things
// or the value of a ...spread
// ^ should those be folded into listlikes somehow? prolly not.
// but they render as 'group's anyway
// OH you can also be in a `:tannot` or a `<tapply>`
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

export type NodeInner =
    | {
          type: 'input';
          text: string;
      }
    | {
          type: 'blinker';
      }
    | {
          type: 'group';
          children: Node[];
          left?: string; // TODO styling for this
          right?: string;
      }
    | {
          type: 'dressing';
      };
