export type Literal =
    | { type: 'number'; value: number }
    | {
          type: 'bool';
          value: boolean;
      };

export type Exp =
    | {
          type: 'var';
          name: string;
          loc: number;
      }
    | {
          type: 'lit';
          value: Literal;
          loc: number;
      }
    | {
          type: 'app';
          fn: Exp;
          arg: Exp;
          loc: number;
      }
    | {
          type: 'fn';
          name: string;
          body: Exp;
          loc: number;
      }
    | {
          type: 'let';
          name: string;
          init: Exp;
          body: Exp;
          loc: number;
      };

export type Type =
    | {
          type: 'concrete';
          name: 'number' | 'bool';
      }
    | {
          type: 'var';
          name: string;
      }
    | {
          type: 'fn';
          arg: Type;
          body: Type;
      };
