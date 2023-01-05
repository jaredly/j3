export type Loc = {
    start: number;
    end: number;
    idx: number;
};

export type Node = {
    contents: NodeContents;
    decorators: { [key: string]: Node };
    loc: Loc;
};

export type NodeContents =
    | {
          type: 'identifier'; // likeThis
          text: string;
      }
    | {
          type: 'tag'; // `LikeThis
          text: string;
      }
    | {
          type: 'number'; // 12.32
          raw: string;
      }
    | {
          type: 'list'; // eh this should be cons & nil, right?
          values: Node[];
      }
    | { type: 'record'; items: Node[] }
    | {
          type: 'array';
          values: Node[];
      }
    | { type: 'comment'; text: string }
    | {
          type: 'spread';
          contents: Node;
      }
    | {
          type: 'string';
          first: string;
          templates: { expr: Node; suffix: string }[];
      }
    | {
          type: 'blank';
      };

export type Term = {
    contents: Expr;
    types: { [sym: number]: Type };
};

export type Pattern =
    | {
          type: 'local';
          sym: number;
          form: Node;
      }
    | {
          type: 'constant';
          form: Node;
      }
    | { type: 'unresolved'; form: Node }
    | { type: 'tag'; name: string; args: Pattern[] };

export type Expr =
    | Shared
    | {
          type: 'string';
          first: string;
          templates: { expr: Expr; suffix: string }[];
          form: Node;
      }
    | {
          type: 'switch';
          target: Expr;
          cases: { pattern: Pattern; body: Expr }[];
          form: Node;
      }
    | { type: 'rest'; contents: Expr; form: Node }
    | {
          type: 'fn';
          name?: string;
          args: { pattern: Pattern; type?: Type }[];
          body: Expr;
          form: Node;
      }
    | { type: 'recur'; depth: number; form: Node }
    | {
          // so bangs are just "apply ! args"? Yeah I guess. Macro it up my folks.
          type: 'apply';
          target: Expr;
          args: Expr[];
          form: Node;
      }
    | {
          type: 'type-apply';
          target: Expr;
          args: Type[];
          form: Node;
      }
    | {
          type: 'let-type';
          bindings: { name: string; type: Type }[];
          body: Expr;
          form: Node;
      }
    | {
          type: 'let';
          bindings: { pattern: Pattern; value: Expr; type?: Type }[];
          form: Node;
          body: Expr;
      }
    | { type: 'tag'; name: string; form: Node } // by itself, this is a constructor function
    | { type: 'record'; entries: { name: string; value: Expr }[]; form: Node };

export type Shared =
    | {
          type: 'global';
          hash: string;
          form: Node;
      }
    | {
          type: 'local';
          sym: number;
          form: Node;
      }
    | {
          type: 'constant';
          form: Node;
      }
    | { type: 'unresolved'; form: Node }
    | {
          type: 'builtin';
          name: string;
          form: Node;
      };

export type Type =
    | Shared
    | {
          type: 'apply';
          target: Type;
          args: Type[];
          form: Node;
      }
    | { type: 'tag'; name: string; args: Type[]; form: Node }
    | { type: 'fn'; name?: string; args: Type[]; body: Type; form: Node }
    | {
          type: 'union';
          items: Type[];
          open: boolean;
          form: Node;
      }
    | {
          type: 'record';
          entries: { name: string; value: Type; default?: Expr }[];
          open: boolean;
          form: Node;
      };
