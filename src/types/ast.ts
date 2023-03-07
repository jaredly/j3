import { AttachedFile, Attachment, RichText, Node, NodeExtra } from './cst';
export type {
    Node,
    NodeContents,
    NodeList,
    Loc,
    stringText,
    CString,
    NodeExtra,
    NodeArray,
    accessText,
    spread,
    RichText,
    Attachment,
    AttachedFile,
} from './cst';

export type Term = {
    contents: Expr;
    types: { [sym: number]: Type };
};

export type NumberKind = 'int' | 'uint' | 'float';

export type Bool = {
    type: 'bool';
    value: boolean;
    form: Node;
};
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
    | Bool
    | {
          type: 'record';
          form: Node;
          entries: {
              name: string;
              value: Pattern;
              form: Node;
          }[];
      }
    | { type: 'unresolved'; form: Node; reason?: string }
    | { type: 'tag'; name: string; args: Pattern[]; form: Node };

export type String = {
    type: 'string';
    first: { text: string; form: Node };
    templates: { expr: Expr; suffix: { text: string; form: Node } }[];
    form: Node;
};

export type recordAccess = {
    type: 'recordAccess';
    target: Expr | null;
    items: string[];
    form: Node;
};

export type Expr =
    | Shared
    | {
          type: 'builtin';
          hash: string;
          form: Node;
      }
    | { type: 'blank'; form: Node }
    | { type: 'def'; name: string; hash: string; value: Expr; form: Node }
    | { type: 'deftype'; name: string; hash: string; value: Type; form: Node }
    | String
    | { type: 'if'; cond: Expr; yes: Expr; no: Expr; form: Node }
    | {
          type: 'switch';
          target: Expr;
          cases: { pattern: Pattern; body: Expr }[];
          form: Node;
      }
    // | { type: 'rest'; contents: Expr; form: Node }
    | recordAccess
    // | { type: 'attribute'; attr: string; target: Expr; form: Node }
    | {
          type: 'fn';
          name?: string;
          // TODO: um type?
          args: { pattern: Pattern; type: Type }[];
          ret: Type;
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
    | { type: 'array'; values: Expr[]; form: Node }
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
    | { type: 'rich-text'; lexicalJSON: any; form: RichText & NodeExtra }
    | {
          type: 'attachment';
          form: Node;
          file: AttachedFile;
          name: string;
      }
    | Record;
export type Record = {
    type: 'record';
    entries: { name: string; value: Expr }[];
    spread?: Expr;
    form: Node;
};

export type TVar = {
    sym: number;
    name: string;
    bound?: Type;
    default_?: Type;
    form: Node;
};

export type Identifier =
    | {
          type: 'global';
          hash: string;
          form: Node;
      }
    | {
          type: 'local';
          sym: number;
          form: Node;
      };

export type Shared =
    | Identifier
    | Number
    | Bool
    | { type: 'unresolved'; form: Node; reason?: string };

export type TypeArg = { sym: number; name: string; bound?: Type; form: Node };
export type Type =
    | Shared
    | { type: 'any'; form: Node }
    | { type: 'none'; form: Node }
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
    | { type: 'tfn'; name?: string; args: TypeArg[]; body: Type; form: Node }
    | {
          type: 'union';
          items: Type[];
          open: boolean;
          form: Node;
      }
    | TRecord;
export type TRecord = {
    type: 'record';
    entries: { name: string; value: Type; default?: Expr }[];
    open: boolean;
    spreads: Type[];
    form: Node;
};
