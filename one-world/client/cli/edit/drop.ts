import { ToplevelUpdate } from '../../../shared/action2';
import { DropTarget } from '../../../shared/IR/block-to-text';
import {
    cursorForNodeNoIR,
    lastChild,
    parentLoc,
} from '../../../shared/IR/nav';
import {
    parentPath,
    pathWithChildren,
    serializePath,
} from '../../../shared/nodes';
import { PersistedState } from '../../../shared/state2';
import { Store } from '../../StoreContext2';
import { isCollection } from '../../TextEdit/actions';
import { MultiSelect } from '../resolveMultiSelect';

export const validDropTargets = (
    targets: DropTarget[],
    source: MultiSelect,
    state: PersistedState,
) => {
    if (source.type === 'doc' && source.children.length > 1) {
        return targets.filter((t) => t.path.children.length === 1);
    }
    return targets.filter((t) => {
        if (t.path.children.length === 1) return true;
        const top = state.toplevels[t.path.root.toplevel];
        const node = top.nodes[lastChild(t.path)];
        return (
            (node.type === 'id' &&
                node.text === '' &&
                source.children.length === 1) ||
            isCollection(top.nodes[parentLoc(t.path)])
        );
    });
};

export const drop = (source: MultiSelect, dest: DropTarget, store: Store) => {
    //
    if (
        source.type === 'top' &&
        source.parent.root.toplevel !== dest.path.root.toplevel
    ) {
        // move between, this is more different
        return;
    }

    if (source.type === 'doc') {
        // move toplevels
        return;
    }

    const loc = lastChild(dest.path);
    const ppath = parentPath(dest.path);
    const ploc = lastChild(ppath);
    const state = store.getState();
    const top = state.toplevels[ppath.root.toplevel];
    const parent = top.nodes[ploc];
    const node = top.nodes[loc];
    if (
        node.type === 'id' &&
        !node.text.length &&
        source.children.length === 1
    ) {
        // replace it!
    }
    if (!isCollection(parent)) return;

    const sloc = lastChild(source.parent);

    const sparent = top.nodes[sloc];
    if (!isCollection(sparent)) return; // TODO replace with an empty
    const sitems = sparent.items
        .slice()
        .filter((loc) => !source.children.includes(loc));

    const up = {
        nodes: {
            [sloc]: { ...sparent, items: sitems },
        },
    } satisfies ToplevelUpdate['update'];

    let pitems;
    if (sloc !== ploc) {
        pitems = parent.items.slice();
        up.nodes[ploc] = { ...parent, items: pitems };
    } else {
        pitems = sitems;
    }
    const idx = pitems.indexOf(loc);
    if (idx === -1) return;
    pitems.splice(idx + (dest.side === 'after' ? 1 : 0), 0, ...source.children);

    // let i=0;
    // for (; i < source.parent.root)
    // OK so now I need to /select/ ... the things we just moved.
    // I'm going to /lose/ the original cursor, which I think is just fine.

    const selEnd = pathWithChildren(
        ppath,
        source.children[source.children.length - 1],
    );

    const { cursor, children } = cursorForNodeNoIR(
        [source.children[0]],
        'start',
        top.nodes,
    );
    const selStart = pathWithChildren(ppath, ...children);

    store.update(
        {
            type: 'toplevel',
            id: top.id,
            action: { type: 'update', update: up },
        },
        {
            type: 'selection',
            doc: ppath.root.doc,
            selections: [
                {
                    start: {
                        path: selStart,
                        key: serializePath(selStart),
                        cursor,
                    },
                    end: { path: selEnd, key: serializePath(selEnd) },
                },
            ],
        },
    );
};
