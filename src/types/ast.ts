import { Node } from './cst';

export type Term = {
    contents: Expr;
    types: { [sym: number]: Type };
};

export type NumberKind = 'int' | 'uint' | 'float';

export type Number = {
    type: 'number';
    form: Node;
    kind: NumberKind;
    value: number;
};
export type Pattern =
    | {
          type: 'local';
          sym: number;
          form: Node;
      }
    | Number
    | { type: 'unresolved'; form: Node; reason?: string }
    | { type: 'tag'; name: string; args: Pattern[] };

export type Expr =
    | Shared
    | {
          type: 'builtin';
          hash: string;
          form: Node;
      }
    | { type: 'def'; name: string; hash: string; value: Expr; form: Node }
    | {
          type: 'string';
          first: string;
          templates: { expr: Expr; suffix: string }[];
          form: Node;
      }
    | { type: 'if'; cond: Expr; yes: Expr; no: Expr; form: Node }
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
          body: Expr[];
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
          type: 'type-fn';
          target: Expr;
          args: { name: string; bound?: Type }[];
          form: Node;
      }
    | {
          type: 'let-type';
          bindings: { name: string; type: Type }[];
          body: Expr[];
          form: Node;
      }
    | {
          type: 'let';
          bindings: { pattern: Pattern; value: Expr; type?: Type }[];
          form: Node;
          body: Expr[];
      }
    | { type: 'tag'; name: string; form: Node } // by itself, this is a constructor function
    | Record;
export type Record = {
    type: 'record';
    entries: { name: string; value: Expr }[];
    form: Node;
};

export type TVar = {
    sym: number;
    bound?: Type;
    default_?: Type;
    form: Node;
};

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
    | Number
    | { type: 'unresolved'; form: Node; reason?: string };

export type Type =
    | Shared
    | {
          type: 'builtin';
          name: string;
          form: Node;
      }
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
