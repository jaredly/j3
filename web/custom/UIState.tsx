import { AutoCompleteReplace } from '../../src/to-ast/Ctx';
import { type ClipboardItem } from '../../src/state/clipboard';
import { State, Mods } from '../../src/state/getKeyUpdate';
import { Path } from '../../src/state/path';
import { Def, DefType } from '../../src/types/ast';
import { Ctx, HistoryItem } from '../../src/to-ast/library';

export type UIState = {
    // ui:{
    regs: RegMap;
    clipboard: ClipboardItem[][];
    ctx: Ctx;
    hover: Path[];
    history: HistoryItem[];
} & State;

export type RegMap = {
    [key: number]: {
        main?: { node: HTMLSpanElement; path: Path[] } | null;
        start?: { node: HTMLSpanElement; path: Path[] } | null;
        end?: { node: HTMLSpanElement; path: Path[] } | null;
        inside?: { node: HTMLSpanElement; path: Path[] } | null;
        outside?: { node: HTMLSpanElement; path: Path[] } | null;
    };
};

export type Action =
    | { type: 'undo' }
    | { type: 'redo' }
    | { type: 'yank'; expr: DefType | Def; loc: number }
    | UpdatableAction;

/** Actions that can be turned into a StateChange | UIStatechange */
export type UpdatableAction =
    | { type: 'hover'; path: Path[] }
    | {
          type: 'select';
          add?: boolean;
          at: { start: Path[]; end?: Path[] }[];
      }
    | { type: 'copy'; items: ClipboardItem[] }
    | { type: 'menu'; selection: number }
    | { type: 'menu-select'; path: Path[]; item: AutoCompleteReplace }
    // expr:def expr:deftype
    | {
          type: 'key';
          key: string;
          mods: Mods;
      }
    | {
          type: 'paste';
          items: ClipboardItem[];
      }
    | DualAction;

export type DualAction = {
    type: 'namespace-rename';
    from: string[];
    to: string[];
};
