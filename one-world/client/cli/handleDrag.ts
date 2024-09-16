import { matchesSpan } from '../../shared/IR/highlightSpan';
import { IRSelection } from '../../shared/IR/intermediate';
import { DocSession } from '../../shared/state2';
import { Store } from '../StoreContext2';
import { validDropTargets } from './edit/drop';
import { resolveMultiSelect, multiSelectContains } from './resolveMultiSelect';
import { MouseEvt } from './drawToTerminal';
import { RState } from './render';

export const maybeStartDragging = (
    evt: MouseEvt,
    docId: string,
    rstate: RState,
    sel: IRSelection,
    store: Store,
): boolean => {
    if (!sel.end) return false;
    const multi = resolveMultiSelect(
        sel.start.path,
        sel.end.path,
        store.getState(),
    );
    const x = evt.x - 1;
    const y = evt.y - 1;
    if (!multi) return false;

    const found = rstate.sourceMaps.find((m) => matchesSpan(x, y, m.shape));
    if (!found) {
        const closest = rstate.dropTargets
            .map((target) => ({
                target,
                dx: Math.abs(target.pos.x - x),
                dy: Math.abs(target.pos.y - y),
            }))
            .filter((a) => a.dy === 0)
            .sort((a, b) => a.dx - b.dx);
        if (!closest.length) return true;
        let { path } = closest[0].target;
        if (multiSelectContains(multi, path, store.getState())) {
            store.update({
                type: 'drag',
                doc: docId,
                drag: { source: multi },
            });
            return true;
        }
    }

    if (
        found &&
        multiSelectContains(multi, found.source.path, store.getState())
    ) {
        store.update({
            type: 'drag',
            doc: docId,
            drag: { source: multi },
        });
        return true;
    }

    return false;
};
export const handleDrag = (
    evt: MouseEvt,
    docId: string,
    rstate: RState,
    dragState: NonNullable<DocSession['dragState']>,
    store: Store,
) => {
    const pos = { x: evt.x - 1, y: evt.y - 1 };
    const found = validDropTargets(
        rstate.dropTargets,
        dragState.source,
        store.getState(),
    )
        .map((target) => ({
            target,
            dx: Math.abs(target.pos.x - pos.x),
            dy: Math.abs(target.pos.y - pos.y),
        }))
        .filter((a) => a.dy === 0)
        .sort((a, b) => a.dx - b.dx);
    if (!found.length) return;
    const best = found[0];
    if (
        !multiSelectContains(
            dragState.source,
            best.target.path,
            store.getState(),
        )
    ) {
        store.update({
            type: 'drag',
            doc: docId,
            drag: {
                source: dragState.source,
                dest: best.target,
            },
        });
    } else if (dragState.dest) {
        store.update({
            type: 'drag',
            doc: docId,
            drag: {
                source: dragState.source,
            },
        });
    }
};
