// Yeah

import { FnType, Type } from './ast';
import { Node } from './cst';

export type MatchError =
    | {
          type: 'invalid type';
          form: Node;
          expected: Type;
          found: Type;
          path: string[];
          inner?: MatchError;
      }
    | {
          type: 'tag not found in union';
          form: Node;
          path: string[];
          tag: Extract<Type, { type: 'tag' }>;
          union: Extract<Type, { type: 'union' }>;
      }
    | { type: 'misc'; path: string[]; message: string; form: Node; typ?: Type }
    | {
          type: 'unification';
          path: string[];
          one: Type;
          two: Type;
          form: Node;
          message?: string;
      }
    | {
          type: 'not a function';
          form: Node;
          kind: string;
          args: Type[];
          path: string[];
      }
    | { type: 'cannot apply local'; path: string[]; form: Node }
    | {
          type: 'wrong number of arguments';
          form: Node;
          expected: number;
          received: number;
          path: string[];
      }
    | {
          type: 'not a task';
          target: Type;
          form: Node;
          inner: Error;
          path: string[];
      }
    | {
          type: 'enum args mismatch';
          form: Node;
          one: Type[];
          two: Type[];
          tag: string;
          path: string[];
      };

export type Error =
    | MatchError
    | { type: 'malformed'; form: Node }
    | {
          type: 'too few arguments';
          form: Node;
          expected: FnType;
          received: number;
      }
    | { type: 'case'; pattern: Type; target: Type; form: Node }
    | { type: 'not a record'; form: Node }
    | { type: 'extra argument'; form: Node }
    | { type: 'unresolved'; form: Node; reason?: string }
    | { type: 'unparsed'; form: Node }
    | { type: 'misc'; message: string; typ?: Type };
