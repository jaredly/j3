import { splitGraphemes } from '../../../src/parse/splitGraphemes';
import { IR } from '../../shared/IR/intermediate';
import {
    goLeftRight,
    IRCache,
    irNavigable,
    lastChild,
} from '../../shared/IR/nav';
import { Path, serializePath } from '../../shared/nodes';
import { Store } from '../StoreContext2';

const getIRText = (cache: IRCache, path: Path, index: number) => {
    const irRoot = cache[path.root.toplevel].irs[lastChild(path)];
    if (!irRoot) return '';
    const ir = irNavigable(irRoot).filter((t) => t.type === 'text')[
        index
    ] as Extract<IR, { type: 'text' }>;
    return ir.text;
};

export const handleUpdate = (
    key: string,
    docId: string,
    cache: IRCache,
    store: Store,
): boolean => {
    const text = key === 'BACKSPACE' ? [] : splitGraphemes(key);
    if (text.length > 1) return false;

    const ds = store.getDocSession(docId, store.session);
    if (!ds.selections.length) return false;

    // TODO multiselect
    const sel = ds.selections[0];
    if (sel.end) return false; // ugh
    if (sel.start.cursor.type !== 'text') return false; // not a text update
    const { start, end } = sel.start.cursor;
    if (start && end.index !== start?.index) return false; // TODO

    let [st, ed] = start
        ? start.cursor < end.cursor
            ? [start.cursor, end.cursor]
            : [end.cursor, start.cursor]
        : [end.cursor, end.cursor];

    if (key === 'BACKSPACE' && !start && end.cursor > 0) {
        st -= 1;
    }

    // const irRoot = cache[sel.start.path.root.toplevel].irs[]

    const current =
        end.text ?? splitGraphemes(getIRText(cache, sel.start.path, end.index));

    const updated = current.slice(0, st).concat(text).concat(current.slice(ed));

    store.update({
        type: 'in-session',
        action: { type: 'multi', actions: [] },
        doc: docId,
        selections: [
            {
                start: {
                    path: sel.start.path,
                    key: serializePath(sel.start.path),
                    cursor: {
                        type: 'text',
                        end: {
                            cursor: st + text.length,
                            index: end.index,
                            text: updated,
                        },
                    },
                },
            },
        ],
    });
    return true;

    // if (key === 'RIGHT') {
    //     const ds = store.getDocSession(docId, store.session);
    //     if (ds.selections.length) {
    //         const sel = ds.selections[0];
    //         const next = goLeftRight(sel, cache, false);
    //         if (next) {
    //             store.update({
    //                 type: 'in-session',
    //                 action: { type: 'multi', actions: [] },
    //                 doc: docId,
    //                 selections: [next],
    //             });
    //             return true;
    //         }
    //     }
    // }
    // if (key === 'LEFT') {
    //     const ds = store.getDocSession(docId, store.session);
    //     if (ds.selections.length) {
    //         const sel = ds.selections[0];
    //         const next = goLeftRight(sel, cache, true);
    //         if (next) {
    //             store.update({
    //                 type: 'in-session',
    //                 action: { type: 'multi', actions: [] },
    //                 doc: docId,
    //                 selections: [next],
    //             });
    //             return true;
    //         }
    //     }
    // }
    // return false;
};
