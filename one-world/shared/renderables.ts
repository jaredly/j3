// Can this do "nested node" rendering, as well as
// adaptive layout stuff?

export type ListDisplay =
    | { type: 'horiz' }
    | {
          // either means it will be horiz as long as it is under
          // the width limit
          type: 'vert' | 'either';
          tightFirst: number;
          indent: number;
          // the pairsliness of things
          // will require me to
          // do a certain thing
          // I'll lean on `RenderInfo`
          // which the Evaluator will respond with after parsing.
          pairs: boolean;
      }
    | { type: 'wrap'; indent: number };

export type RenderInfo =
    // indicates that this node should take up a full line
    // in a pairs dealio
    | { type: 'pairs-full-line' }
    | ListDisplay
    | {
          // we can use this to show record keywords in a different fontlyness
          type: 'text';
          italic?: boolean;
          bold?: boolean;
          underline?: string;
          color?: string;
      };

export type Renderable =
    | { type: 'ref'; loc: number }
    // RenderInfo.text can help here
    | { type: 'text'; text: string }
    | {
          type: 'list';
          items: Renderable[];
          display: ListDisplay;
      }
    | { type: 'blinker'; location: 'start' | 'end' | 'inside' }
    | { type: 'syntax'; text: string; color: string };
