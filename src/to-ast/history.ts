// A B C D E
/*
A B C D E
(undo)
A B C D E E'
        ---
(undo)
A B C D E E' D'
      --------
(redo)
A B C D E E' D' D
      --------
(undo)
A B C D E E' D' D D'
      --------  ---
(undo)
A B C D E E' D' D D' C'
      --------  ---
    ------------------
(F)
A B C D E E' D' D D' C' F
      --------- ---
    ------------------
(undo undo)
A B C D E E' D' D D' C' F F' B'
      --------- ---
    ------------------  ---
  ----------------------------
*/

import { HistoryItem } from './library';

type Minimal = { id: number; revert?: number };

export const status = <T extends Minimal>(
    item: T,
    items: T[],
): null | 'undo' | 'redo' => {
    if (item.revert == null) {
        return null;
    }
    const prev = status(items[item.revert], items);
    if (prev === 'undo') {
        return 'redo';
    }
    return 'undo';
};

export const undoItem = <T extends Minimal>(items: T[]): null | T => {
    let i = items.length - 1;
    while (i >= 0) {
        const st = status(items[i], items);
        if (st === 'undo') {
            i = items[i].revert! - 1;
        } else {
            return items[i];
        }
    }
    return null;
};

export const redoItem = <T extends Minimal>(items: T[]): null | T => {
    let i = items.length - 1;
    while (i >= 0) {
        const st = status(items[i], items);
        if (st == null) {
            return null;
        } else if (st === 'redo') {
            i = items[i].revert! - 1;
        } else {
            return items[i];
        }
    }
    return null;
};

// QUESTONS:
// "undo, what do I undo"
// AND:
// "redo, what do I redo"
/* starting from end
 - if it's an Undo, Redo it.
 - if it's not an Undo try to match pairsssss until you find the next
    - might not be possible
    - THIS MEANS we need a way to indicate either: This is a Revert of This, or this is an Unrevert of This.
    - can I just have a `revert` key, and we follow it back to determine whether it's an undo or a redo?
    - I guess that would work
*/

/*
A B C D E
(undo)
A B C D E E'
        ---
(undo)
A B C D E E' D'
      --------
(redo redo)
A B C D E E' D' D E
      --------
             ====
          =========
(undo)
A B C D E E' D' D E E'
      --------    ---
(undo)
A B C D E E' D' D D' C'
      --------  ---
    ------------------
(F)
A B C D E E' D' D D' C' F
      --------- ---
    ------------------
(undo undo)
A B C D E E' D' D D' C' F F' B'
      --------- ---
    ------------------  ---
  ----------------------------
*/
