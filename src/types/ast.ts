import { AttachedFile, Attachment, RichText, Node, NodeExtra } from './cst';
export type {
    Node,
    NodeContents,
    NodeList,
    Loc,
    stringText,
    tapply,
    CString,
    NodeExtra,
    NodeArray,
    accessText,
    // spread,
    RichText,
    Attachment,
    AttachedFile,
} from './cst';

export type Term = {
    contents: Expr;
    types: { [sym: number]: Type };
};

export type NumberKind = 'int' | 'uint' | 'float';

export type spread = {
    type: 'spread';
    contents: Expr;
    form: Node;
};

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

export type LocalPattern = {
    type: 'local';
    name: string;
    sym: number;
    form: Node;
};

export type Pattern =
    | LocalPattern
    | Number
    | Bool
    | {
          type: 'array';
          form: Node;
          // items: (Pattern | {type: 'spread', binding?: LocalPattern, form: Node})[]
          // [...one, two, three] // left[], right{one, [two, three]}
          // [one, two, ...three] // [one, two], right{three}
          // [one, ...two, three] // [one], right{two, [three]}
          left: Pattern[];
          right: null | { spread?: LocalPattern; items: Pattern[] };
      }
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
    items: { text: string; loc: number }[];
    form: Node;
};

export type DefType = {
    type: 'deftype';
    name: string;
    // hash: string;
    value: Type;
    form: Node;
};

export type Def = {
    type: 'def';
    name: string;
    // hash: string;
    value: Expr;
    form: Node;
    ann: Type | void;
};

export type Expr =
    | Shared
    | {
          type: 'builtin';
          name: string;
          form: Node;
      }
    | { type: 'blank'; form: Node }
    | { type: 'recur'; form: Node; sym: number }
    | { type: 'loop'; form: Node; inner: Expr; ann: Type }
    | { type: 'task'; form: Node; inner: Expr; maybe: boolean }
    | Def
    | DefType
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
    | { type: 'tfn'; name?: string; args: TypeArg[]; body: Expr; form: Node }
    | {
          // so bangs are just "apply ! args"? Yeah I guess. Macro it up my folks.
          type: 'apply';
          target: Expr;
          args: Expr[];
          form: Node;
      }
    | { type: 'array'; values: Expr[]; form: Node }
    | { type: 'spread'; contents: Expr; form: Node }
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
    spreads: Expr[];
    form: Node;
};

export type TVar = {
    name: string;
    bound?: Type;
    default_?: Type;
    form: Node;
};

export type Local = {
    type: 'local';
    sym: number;
    form: Node;
};

export type Identifier =
    | { type: 'global'; hash: string; form: Node }
    | { type: 'toplevel'; hash: number; form: Node }
    | Local;

export type Shared =
    | Identifier
    | Number
    | Bool
    | { type: 'unresolved'; form: Node; reason?: string };

export type TypeArg = { name: string; bound?: Type; form: Node };
export type FnType = {
    type: 'fn';
    name?: string;
    args: {
        name?: string;
        type: Type;
        form: Node;
    }[];
    body: Type;
    form: Node;
};

export type TfnType = {
    type: 'tfn';
    name?: string;
    args: TypeArg[];
    body: Type;
    form: Node;
};

export type Type =
    | Shared
    | {
          type: 'string';
          first: { text: string; form: Node };
          templates: { type: Type; suffix: { text: string; form: Node } }[];
          form: Node;
      }
    | { type: 'any'; form: Node }
    | { type: 'none'; form: Node }
    | { type: 'recur'; form: Node; sym: number }
    | { type: 'loop'; form: Node; inner: Type }
    | { type: 'task'; form: Node; effects: Type; result: Type }
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
    | FnType
    | TfnType
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
