import { IRSelection } from '../../../shared/IR/intermediate';
import { fromMap } from '../../../shared/nodes';
import { DocSession, getDoc, getTop } from '../../../shared/state2';
import { getTopForPath } from '../../selectNode';
import { Store } from '../../StoreContext2';
import { resolveMultiSelect } from '../resolveMultiSelect';
import { deleteMulti } from './handleUpdate';
import { swapTop, swap } from './swap';
import { wrapNodesWith, wrapWith } from './wrapWith';

export const handleMutliSelect = (
    store: Store,
    sel: IRSelection,
    end: NonNullable<IRSelection['end']>,
    key: string,
    ds: DocSession,
): boolean => {
    const state = store.getState();
    const multi = resolveMultiSelect(sel.start.path, end.path, state);
    if (!multi) {
        console.log('cant resolve', multi);
        return false;
    }

    if (key === 'CTRL_C') {
        if (multi.type === 'doc') {
            const doc = getDoc(state, multi.doc);
            ds.clipboard = multi.children.map((nid) => {
                const top = getTop(state, doc.id, doc.nodes[nid].toplevel);
                return fromMap(() => false, top.root, top.nodes);
            });
        } else {
            const top = getTopForPath(multi.parent, state);
            ds.clipboard = multi.children.map((nid) => {
                return fromMap(() => false, nid, top.nodes);
            });
        }
        return true;
    }

    if (key === '[' || key === '(' || key === '{') {
        if (multi.type === 'top') {
            // only work with empty?
            wrapNodesWith(key, multi.parent, multi.children, store);
        } else if (multi.children.length === 1) {
            // one toplevel
            const dnode = state.nodes[multi.children[0]];
            const top = state.toplevels[dnode.toplevel];
            wrapWith(
                key,
                {
                    children: [top.root],
                    root: {
                        type: 'doc-node',
                        doc: state.id,
                        ids: multi.parentIds.concat([multi.children[0]]),
                        toplevel: top.id,
                    },
                },
                store,
            );
        }
        return true;
    }

    if (key === 'CTRL_UP' || key === 'CTRL_DOWN') {
        if (multi.type !== 'top') {
            const actions = swapTop(
                sel.start,
                end.path,
                multi,
                state,
                key === 'CTRL_DOWN' ? 'down' : 'up',
            );
            if (!actions) return false;
            store.update(...actions);
            return true;
        }
        return false;
    }

    if (
        key === 'CTRL_LEFT' ||
        key === 'CTRL_RIGHT' ||
        key === 'CTRL_SHIFT_LEFT' ||
        key === 'CTRL_SHIFT_RIGHT'
    ) {
        const ups = swap(
            store.getState(),
            sel.start,
            end.path,
            key.endsWith('LEFT') ? 'left' : 'right',
            key.includes('SHIFT'),
        );
        console.log('swap', ups);
        if (!ups) return false;
        store.update(...ups);
        return true;
    }

    if (key === 'BACKSPACE') {
        const state = store.getState();
        if (multi.type === 'doc') return false;
        const ups = deleteMulti(multi, state);
        if (!ups) return false;
        store.update(...ups);
        return true;
    }

    return false;
};
