// This is like ... a database? idk

import { Cursor, UpdateMap } from '../../../src/state/getKeyUpdate';
import { Map } from '../../../src/types/mcst';

type Selection = Cursor[];

type ToplevelChange = {
    map: UpdateMap;
    // if empty, then this toplevel doesn't retain selection after this change
    selection?: Selection;
    // HOWW do I handle multi-toplevel selections?
    // not allowing you to sub-block, I think. Yeah.
};

type NamespaceAction =
    | {
          type: 'move';
          from: string;
          to: string;
      }
    | {
          type: 'update';
          name: string;
          // am I really going to hash on every single keystroke?
          // do I have another option?
          // like ... I do want to ...
          // ok no let's not do that. I have an undo stack on toplevels
          // for that.
          // this'll just be ...
          hash: string;
      };

/**
 * For the server, I think I probably want
 * ...
 * a websocket connection
 * and like
 * do the synchronizing. online only, ya know.
 * like, local-first is nice
 * but not for this prototype.
 *
 *
 */

type Database = {
    namespaces: {
        [fullPath: string]: {
            toplevel: number; // an ID into the toplevel whatsit?
            children: string[]; // ordered list of children
        };
    };
    toplevels: {
        [id: number]: {
            map: Map;
            root: number;
            history: ToplevelChange[];
        };
    };
    namespaceHistory: NamespaceAction[];
};

type EditorState = {
    cards: {
        ns: string; // path to the namespace
        // and ... if it ends with '/' we just do the children, right?
    }[];
};
