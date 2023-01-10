// Yeah

import { Type } from './ast';
import { Node } from './cst';

export {};

export type Error =
    | { type: 'malformed'; form: Node }
    | {
          type: 'invalid type';
          form: Node;
          expected: Type;
          found: Type;
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
    | {
          type: 'unification';
          path: string[];
          one: Type;
          two: Type;
          message?: string;
      }
    | { type: 'misc'; message: string };
