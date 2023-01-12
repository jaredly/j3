// Yeah

import { Type } from './ast';
import { Node } from './cst';

export {};

export type MatchError =
    | {
          type: 'invalid type';
          form: Node;
          expected: Type;
          found: Type;
          path: string[];
      }
    | {
          type: 'unification';
          path: string[];
          one: Type;
          two: Type;
          message?: string;
      }
    | {
          type: 'not a function';
          form: Node;
          args: Type[];
          path: string[];
      };

export type Error =
    | MatchError
    | { type: 'malformed'; form: Node }
    | {
          type: 'wrong number of arguments';
          form: Node;
          expected: number;
          received: number;
          path: string[];
      }
    | {
          type: 'too few arguments';
          form: Node;
          expected: number;
          received: number;
      }
    | { type: 'extra argument'; form: Node }
    | { type: 'unresolved'; form: Node }
    | { type: 'misc'; message: string };
