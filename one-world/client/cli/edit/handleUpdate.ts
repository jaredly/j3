import { splitGraphemes } from '../../../../src/parse/splitGraphemes';
import { Action, ToplevelUpdate } from '../../../shared/action2';
import { IR } from '../../../shared/IR/intermediate';
import {
    cursorSelect,
    goLeftRight,
    IRCache,
    irNavigable,
    lastChild,
    toSelection,
} from '../../../shared/IR/nav';
import {
    parentPath,
    Path,
    pathWithChildren,
    serializePath,
} from '../../../shared/nodes';
import { Store } from '../../StoreContext2';
import { isCollection } from '../../TextEdit/actions';
import { handleMovement } from './handleMovement';
import { joinLeft } from './joinLeft';
import { newNeighbor } from './newNeighbor';
import { split } from './split';
import { wrapWith } from './wrapWith';

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
    const ds = store.getDocSession(docId, store.session);
    if (!ds.selections.length) return false;

    // TODO multiselect
    const sel = ds.selections[0];
    if (sel.end) {
        const path = sel.end.path;
        if (key === 'BACKSPACE') {
            store.update(
                topUpdate(path.root.toplevel, {
                    [lastChild(path)]: {
                        type: 'id',
                        text: '',
                        loc: lastChild(path),
                    },
                }),
                {
                    type: 'selection',
                    doc: path.root.doc,
                    selections: [
                        toSelection({
                            cursor: {
                                type: 'text',
                                end: { index: 0, cursor: 0 },
                            },
                            path: sel.end.path,
                        }),
                    ],
                },
            );
            return true;
        }
        return false; // ugh
    }
    if (sel.start.cursor.type !== 'text') {
        if (key === 'BACKSPACE') {
            return handleMovement(
                'LEFT',
                sel.start.path.root.doc,
                cache,
                store,
            );
        }

        if (key === ' ') {
            return newNeighbor(sel.start.path, store);
        }

        return false; // not a text update
    }
    const { start, end } = sel.start.cursor;
    if (start && end.index !== start?.index) return false; // TODO

    let [st, ed] = start
        ? start.cursor < end.cursor
            ? [start.cursor, end.cursor]
            : [end.cursor, start.cursor]
        : [end.cursor, end.cursor];

    if (key === 'BACKSPACE' && !start) {
        if (end.cursor === 0) {
            // join-left
            if (!joinLeft(sel.start.path, end.text, end.index, cache, store)) {
                handleMovement('LEFT', sel.start.path.root.doc, cache, store);
            }
            return true;
        } else {
            st -= 1;
        }
    }

    const path = sel.start.path;
    const node =
        store.getState().toplevels[path.root.toplevel].nodes[lastChild(path)];

    if (node.type === 'id') {
        if (key === ' ') {
            split(path, st, ed, end.text, end.index, store);
            return true;
        }

        if (st === ed && st === 0) {
            if (key === '[' || key === '(' || key === '{') {
                // only work with empty?
                wrapWith(key, path, end.text, store);
                return true;
            }
        }
    }

    const current =
        end.text ?? splitGraphemes(getIRText(cache, sel.start.path, end.index));

    if (key === '{' && node.type === 'string') {
        const top = store.getState().toplevels[path.root.toplevel];
        const nidx = top.nextLoc;
        const loc = lastChild(path);
        const up = { ...node };
        up.templates = up.templates.slice();
        if (end.index === 0) {
            const text = splitGraphemes(up.first);
            up.first = text.slice(0, end.cursor).join('');
            up.templates.unshift({
                expr: nidx,
                suffix: text.slice(end.cursor).join(''),
            });
        } else {
            const text = splitGraphemes(up.templates[end.index - 1].suffix);
            up.templates[end.index - 1] = {
                ...up.templates[end.index - 1],
                suffix: text.slice(0, end.cursor).join(''),
            };
            up.templates.splice(end.index, 0, {
                expr: nidx,
                suffix: text.slice(end.cursor).join(''),
            });
        }
        const map: ToplevelUpdate['update']['nodes'] = {
            [nidx]: {
                type: 'id',
                text: '',
                loc: nidx,
            },
            [loc]: up,
        };

        store.update(topUpdate(top.id, map, nidx + 1), {
            type: 'selection',
            doc: path.root.doc,
            selections: [
                toSelection({
                    cursor: {
                        type: 'text',
                        end: { index: 0, cursor: 0 },
                    },
                    path: pathWithChildren(path, nidx),
                }),
            ],
        });
        return true;
    }

    if (key === '"' && node.type === 'id') {
        if (st == ed && ed === current.length) {
            const path = sel.start.path;
            const top = store.getState().toplevels[path.root.toplevel];
            const nidx = top.nextLoc;
            const map: ToplevelUpdate['update']['nodes'] = {
                [nidx]: {
                    type: 'string',
                    first: '',
                    templates: [],
                    tag: node.loc,
                    loc: nidx,
                },
            };
            let action: Action;
            if (path.children.length > 1) {
                const parent = parentPath(path);
                const ploc = lastChild(parent);
                const pnode = top.nodes[ploc];
                if (!isCollection(pnode)) return false;
                const items = pnode.items.slice();
                const idx = items.indexOf(node.loc);
                if (idx === -1) return false;
                items[idx] = nidx;
                map[ploc] = { ...pnode, items };
                action = topUpdate(top.id, map, nidx + 1);
            } else {
                action = {
                    type: 'toplevel',
                    id: top.id,
                    action: {
                        type: 'update',
                        update: {
                            nodes: map,
                            root: nidx,
                            nextLoc: nidx + 1,
                        },
                    },
                };
            }
            store.update(action, {
                type: 'selection',
                doc: path.root.doc,
                selections: [
                    toSelection({
                        cursor: {
                            type: 'text',
                            end: { index: 0, cursor: 0 },
                        },
                        path: pathWithChildren(parentPath(path), nidx),
                    }),
                ],
            });

            return true;
        }
    }

    const text =
        key === 'BACKSPACE' ? [] : key === 'ENTER' ? '\n' : splitGraphemes(key);
    if (text.length > 1) return false;

    const updated = current.slice(0, st).concat(text).concat(current.slice(ed));

    store.update({
        type: 'selection',
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
};

export const topUpdate = (
    id: string,
    nodes: ToplevelUpdate['update']['nodes'],
    nidx?: number,
): Action => ({
    type: 'toplevel',
    id,
    action: {
        type: 'update',
        update: nidx != null ? { nodes, nextLoc: nidx } : { nodes },
    },
});
