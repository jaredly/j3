// Can this do "nested node" rendering, as well as
// adaptive layout stuff?

type ListDisplay =
    | { type: 'horiz' }
    | {
          type: 'vert' | 'switch';
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

type RenderInfo =
    | { type: 'single-line' }
    | ListDisplay
    | {
          // we can use this to show record keywords in a different fontlyness
          type: 'text';
          italic?: boolean;
          bold?: boolean;
          underline?: string;
          color?: string;
      };

type Renderable =
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
