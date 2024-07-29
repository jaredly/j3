import { lastChild, toSelection } from '../../../shared/IR/nav';
import { Path, parentPath, pathWithChildren } from '../../../shared/nodes';
import { Store } from '../../StoreContext2';
import { isCollection } from '../../TextEdit/actions';
import { topUpdate } from './handleUpdate';

export const newNeighbor = (path: Path, store: Store, after = true) => {
    const state = store.getState();
    const top = state.toplevels[path.root.toplevel];
    const loc = lastChild(path);
    const node = top.nodes[loc];
    // Here are the things that can have a `text` IR in them:
    // that's a thing
    const parent = parentPath(path);
    if (!parent.children.length) return false;
    const ploc = lastChild(parent);
    const pnode = top.nodes[ploc];
    // ugh I probably should just make a type === 'collection'...
    if (!isCollection(pnode)) {
        return false;
    }
    const idx = pnode.items.indexOf(loc);
    const nidx = top.nextLoc;
    const items = pnode.items.slice();
    items.splice(idx + (after ? 1 : 0), 0, nidx);
    // ok we can do this now.
    store.update(
        topUpdate(
            top.id,
            {
                [ploc]: { ...pnode, items },
                [nidx]: { type: 'id', text: '', loc: nidx },
            },
            nidx + 1,
        ),
        {
            type: 'selection',
            doc: path.root.doc,
            selections: [
                toSelection({
                    cursor: {
                        type: 'text',
                        end: { index: 0, cursor: 0 },
                    },
                    path: pathWithChildren(parent, nidx),
                }),
            ],
        },
    );
    return true;
    // ->
};
