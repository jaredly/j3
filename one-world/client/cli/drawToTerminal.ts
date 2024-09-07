import termkit from 'terminal-kit';
import { Store } from '../StoreContext2';
import { renderSelection, RState, selectionPos } from './render';
import { AnyEvaluator } from '../../boot-ex/types';
import { blockToText } from '../../shared/IR/block-to-text';
import { getAutoComplete, menuToBlocks } from './getAutoComplete';

export function drawToTerminal(
    rstate: RState,
    term: termkit.Terminal,
    store: Store,
    docId: string,
    lastKey: string | null,
    ev: AnyEvaluator,
) {
    term.clear();
    term.moveTo(0, 2, rstate.txt);

    if (lastKey) {
        term.moveTo(
            0,
            term.height,
            (lastKey === ' ' ? 'SPACE' : lastKey) + '           ',
        );
    }
    const ds = store.getDocSession(docId);
    const dragState = ds.dragState;
    if (dragState?.dest) {
        term.moveTo(
            dragState.dest.pos.x +
                1 +
                (dragState.dest.side === 'after' ? -1 : 0),
            dragState.dest.pos.y + 1,
            '⬇️',
        );
        term.moveTo(0, term.height - 5, JSON.stringify(dragState.dest));
    }

    if (ds.dropdown && !ds.dropdown.dismissed) {
        const autocomplete = getAutoComplete(store, rstate, ds, ev);
        if (autocomplete?.length) {
            const block = menuToBlocks(autocomplete, ds.dropdown?.selection);
            if (block) {
                const txt = blockToText({ x: 0, y: 0, x0: 0 }, block, {
                    sourceMaps: [],
                    dropTargets: [],
                    color: true,
                    styles: {},
                });
                const pos = selectionPos(store, docId, rstate.sourceMaps, true);
                if (pos) {
                    txt.split('\n').forEach((line, i) => {
                        term.moveTo(pos[0] + 1, pos[1] + 3 + i, line);
                    });
                }
            }
            // render the autocomplete thanks
        }
    }

    renderSelection(term, store, docId, rstate.sourceMaps);
}
