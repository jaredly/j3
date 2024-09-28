import termkit from 'terminal-kit';
import { Store } from '../StoreContext2';
import { renderSelection, RState, selectionPos } from './render';
import { AnyEvaluator } from '../../evaluators/boot-ex/types';
import {
    ABlock,
    blockToABlock,
    blockToText,
    toABlock,
    toChunk,
} from '../../shared/IR/block-to-attributed-text';
import { getAutoComplete, menuToBlocks } from './getAutoComplete';
import { getDoc } from '../../shared/state2';
import { Sess } from './Sess';
import { IncomingMessage, OutgoingMessage } from './worker';

export const moveTo = (write: Write, x: number, y: number, text?: string) => {
    write(`\x1B[${y},${x}M`);
    if (text) {
        write(text);
    }
};
export type Write = (text: string) => void;

export type KeyFn = (key: string) => void;
export type MouseFn = (kind: MouseKind, evt: MouseEvt) => void;
export type Renderer = {
    moveTo(x: number, y: number, text?: ABlock): void;
    write(text: ABlock): void;
    clear(): void;
    height: number;
    width: number;
    onKey(fn: KeyFn): () => void;
    onResize(fn: () => void): () => void;
    onMouse(fn: MouseFn): () => void;
    spawnWorker(onMessage: (data: OutgoingMessage) => void): {
        terminate(): void;
        sendMessage(msg: IncomingMessage): void;
    };
    init(sess: Sess): Promise<Store>;
    readSess: () => Sess;
    writeSess: (s: Sess) => void;
};

export type MouseKind =
    | 'MOUSE_DRAG'
    | 'MOUSE_LEFT_BUTTON_PRESSED'
    | 'MOUSE_LEFT_BUTTON_RELEASED';
export type MouseEvt = {
    x: number;
    y: number;
    shift: boolean;
    ctrl: boolean;
    alt: boolean;
};

export function drawToTerminal(
    rstate: RState,
    term: Renderer,
    store: Store,
    docId: string,
    lastKey: string | null,
    ev: AnyEvaluator,
) {
    term.clear();
    term.moveTo(1, 1, rstate.txt);

    if (lastKey) {
        term.moveTo(
            0,
            term.height - 1,
            toABlock((lastKey === ' ' ? 'SPACE' : lastKey) + '           '),
        );
    }
    term.moveTo(
        0,
        term.height,
        toABlock(getDoc(store.getState(), docId).title),
    );
    const ds = store.getDocSession(docId);
    const dragState = ds.dragState;
    if (dragState?.dest) {
        term.moveTo(
            dragState.dest.pos.x +
                1 +
                (dragState.dest.side === 'after' ? -1 : 0),
            dragState.dest.pos.y,
            toABlock('⬇️'),
        );
        term.moveTo(
            0,
            term.height - 5,
            toABlock(JSON.stringify(dragState.dest)),
        );
    }

    if (ds.dropdown && !ds.dropdown.dismissed) {
        const autocomplete = getAutoComplete(store, rstate, ds, ev);
        if (autocomplete?.length) {
            const block = menuToBlocks(autocomplete, ds.dropdown?.selection);
            if (block) {
                const txt = blockToABlock({ x: 0, y: 0, x0: 0 }, block, {
                    sourceMaps: [],
                    dropTargets: [],
                    color: true,
                    styles: {},
                });
                const pos = selectionPos(store, docId, rstate.sourceMaps, true);
                if (pos) {
                    term.moveTo(pos[0] + 1, pos[1] + 2, txt);
                }
            }
            // render the autocomplete thanks
        }
    }

    renderSelection(term, store, docId, rstate.sourceMaps);
}
