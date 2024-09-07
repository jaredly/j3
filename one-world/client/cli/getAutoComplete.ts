import { splitGraphemes } from '../../../src/parse/splitGraphemes';
import { AnyEvaluator } from '../../boot-ex/types';
import { Action } from '../../shared/action2';
import { IRCursor, IRSelection } from '../../shared/IR/intermediate';
import {
    Block,
    hblock,
    line,
    table,
    vblock,
} from '../../shared/IR/ir-to-blocks';
import { lastChild, toSelection } from '../../shared/IR/nav';
import {
    IDRef,
    iterNodes,
    keyForLoc,
    Node,
    Nodes,
    parentPath,
    Path,
    pathWithChildren,
    RecNode,
    RecNodeT,
    serializePath,
    Style,
} from '../../shared/nodes';
import { DocSession } from '../../shared/state2';
import { getNodeForPath } from '../selectNode';
import { Store } from '../StoreContext2';
import { inflateRecNode } from '../TextEdit/actions';
import { normalizeSelection, topUpdate } from './edit/handleUpdate';
import { replaceNode } from './edit/joinLeft';
import { RState } from './render';

export type MenuItem =
    | { type: 'header'; title: string }
    | { type: 'ruler' }
    | {
          type: 'action';
          title: string;
          subtitle?: string;
          action(): void;
      }
    | {
          type: 'toggle';
          title: string;
          subtitle?: string;
          checked: boolean;
          action(): void;
      }
    | {
          type: 'submenu';
          title: string;
          children: MenuItem[];
      };

export const menuToBlocks = (
    menu: MenuItem[],
    selection: number[],
): Block | void => {
    const norm = normalize(menu, selection);
    if (!norm) return;
    return table(
        menu.map((item, i) => {
            const style: Style | undefined =
                i === norm[0]
                    ? { background: { r: 30, g: 80, b: 100 } }
                    : undefined;
            switch (item.type) {
                case 'header':
                    return [line(item.title, undefined, style)];
                case 'action':
                case 'toggle':
                    if (item.subtitle) {
                        return [
                            line(item.title, undefined, style),
                            line(item.subtitle || '', undefined, style),
                        ];
                    } else {
                        return [line(item.title, undefined, style)];
                    }
                default:
                    return [line('[unknown]', undefined, style)];
            }
        }),
        true,
        { background: { r: 50, g: 50, b: 50 } },
    );
};

export const normalize = (
    menu: MenuItem[],
    selection: number[],
): number[] | undefined => {
    const norm: number[] = [];
    for (let sel of selection) {
        let idx = sel % menu.length;
        if (idx < 0) idx += menu.length;
        let found = menu[idx];
        if (!found) {
            throw new Error(`bad sel nav`);
        }
        norm.push(idx);
        if (found.type === 'submenu') {
            menu = found.children;
        } else {
            break;
        }
    }
    return norm;
};

export const findMenuItem = (
    menu: MenuItem[],
    selection: number[],
): MenuItem | undefined => {
    let found;
    for (let sel of selection) {
        let idx = sel % menu.length;
        if (idx < 0) idx += menu.length;
        found = menu[idx];
        if (!found) {
            throw new Error(`bad sel nav`);
        }
        if (found.type === 'submenu') {
            menu = found.children;
        } else {
            break;
        }
    }
    return found;
};

const isToplevel = (path: Path, nodes: Nodes) => {
    if (path.children.length === 1) return true;
    if (path.children.length !== 2) return false;
    const [parent, self] = path.children;
    const pnode = nodes[parent];
    return pnode.type === 'list' && pnode.items[0] === self;
};

export const getAutoComplete = (
    store: Store,
    rstate: RState,
    ds: DocSession,
    ev: AnyEvaluator,
): MenuItem[] | void => {
    if (!ds.selections.length) return;
    const sel = ds.selections[0];
    if (sel.end || sel.start.cursor.type !== 'text') return;
    const selText = sel.start.cursor.end.text;
    const path = sel.start.path;
    // const loc = lastChild(path);
    const cache = rstate.cache[path.root.toplevel];
    if (!cache) throw new Error(`no cache for selected toplevel`);
    if (!cache.result.autocomplete) {
        return;
    }

    const idNode = getNodeForPath(path, store.getState());
    if (!idNode || idNode.type !== 'id' || (idNode.ref && !selText)) {
        return;
    }
    const text = selText ? selText.join('') : idNode.text;
    if (!text.length) return; // don't give autocomplete with no text

    const top = isToplevel(
        path,
        store.getState().toplevels[path.root.toplevel].nodes,
    );

    const filter = (auto: (typeof ev.kwds)[0]) => {
        if (auto.toplevel && !top) return false;
        if (auto.text.includes(text)) {
            return true;
        }
        return false;
    };
    const autos = ev.kwds.filter(filter);

    const { kinds, local } = cache.result.autocomplete;
    local.forEach((node) => {
        // TODO: make an autocomplete for the local node.
        // would be great to include type info too if we can
    });
    kinds.forEach((kind) => {
        // idk do something with this
    });
    // const state = store.getState();

    const items: MenuItem[] = autos.flatMap((auto) => {
        if (auto.templates.length) {
            return auto.templates.map((tpl) => ({
                type: 'action',
                title: auto.text,
                subtitle: tpl.docs ?? auto.docs,
                action() {
                    store.update(
                        ...applyTemplate(
                            store,
                            sel,
                            auto.text,
                            idNode,
                            tpl.template,
                        ),
                    );
                },
            }));
        }

        return {
            type: 'action',
            title: auto.text,
            subtitle: auto.docs ?? '',
            action() {
                store.update(
                    ...applyTemplate(store, sel, auto.text, idNode, []),
                );
            },
        };
    });

    Object.entries(rstate.cache).forEach(([tid, { result, node }]) => {
        if (!result.exports?.length) {
            return;
        }
        const byLoc: Record<string, RecNode> = {};
        iterNodes(node, (node) => (byLoc[keyForLoc(node.loc)] = node));

        result.exports.forEach(({ loc, kind }) => {
            const got = byLoc[keyForLoc(loc)];
            if (got && got.type === 'id') {
                items.push({
                    type: 'action',
                    title: got.text,
                    action() {
                        store.update(
                            ...applyTemplate(store, sel, got.text, idNode, [], {
                                type: 'toplevel',
                                kind,
                                loc,
                            }),
                        );
                    },
                });
                // autos.push({
                //     text: got.text,
                //     templates: [{ template: [] }],
                // });
            }
            // sooo then we find ... the
        });
    });

    return items;
};

const applyTemplate = (
    store: Store,
    sel: IRSelection,
    text: string,
    node: Extract<Node, { type: 'id' }>,
    tpl: RecNodeT<boolean>[],
    link?: IDRef,
): Action[] => {
    const path = sel.start.path;
    const state = store.getState();
    const top = state.toplevels[path.root.toplevel];

    const cursor: IRCursor = {
        type: 'text',
        end: {
            index: 0,
            cursor: splitGraphemes(text).length,
        },
    };

    let fillOut:
        | 'wrap'
        | Extract<Node, { type: 'list' | 'array' | 'record' }>
        | null = 'wrap';

    /*
    ok so the behavior is:
    - if we are the first child of a list that has other children,
        dont template
    - otherwise, if we are the only child of a list
        template into that list
    - otherwise, wrap it up.
    */

    if (path.children.length > 1) {
        const pnode = top.nodes[path.children[path.children.length - 2]];

        if (pnode.type === 'list') {
            if (pnode.items.length > 1 && pnode.items[0] === node.loc) {
                fillOut = null;
            } else if (pnode.items.length === 1) {
                fillOut = pnode;
            }
        }
    }

    if (fillOut == null || tpl.length === 0) {
        // Non-template
        return [
            topUpdate(path.root.toplevel, {
                [node.loc]: { ...node, text: text, ref: link },
            }),
            {
                type: 'selection',
                doc: path.root.doc,
                selections: [toSelection({ cursor, path: sel.start.path })],
            },
        ];
    }

    let nextLoc = top.nextLoc;
    const allNodes: Nodes = {};
    const nlocs: number[] = [lastChild(path)];
    allNodes[node.loc] = { ...node, text, ref: link };

    let root = top.root;
    let selecteds: {
        cursor: IRCursor;
        children: number[];
        node: RecNodeT<boolean>;
    }[] = [];

    tpl.forEach((sibling) => {
        const { selected, nloc, nodes, nidx } = inflateRecNode(
            nextLoc,
            sibling,
        );
        nextLoc = nidx.next;
        nlocs.push(nloc);
        Object.assign(allNodes, nodes);
        selecteds.push({ ...selected, node: sibling });
    });

    let parent = parentPath(path);
    if (fillOut === 'wrap') {
        const wrapper = nextLoc++;
        allNodes[wrapper] = { type: 'list', items: nlocs, loc: wrapper };

        const update = replaceNode(path, wrapper, top);
        if (!update) return [];
        if (update.nodes) {
            Object.assign(allNodes, update.nodes);
        }
        if (update.root != null) {
            root = update.root;
        }

        parent = pathWithChildren(parentPath(path), wrapper);
    } else {
        allNodes[fillOut.loc] = { ...fillOut, items: nlocs };
    }

    const selected = selecteds[0];

    const selPath = pathWithChildren(parent, ...selected.children);

    return [
        {
            type: 'toplevel',
            id: top.id,
            action: {
                type: 'update',
                update: { nextLoc, root, nodes: allNodes },
            },
        },
        {
            type: 'selection',
            doc: path.root.doc,
            selections: [
                {
                    ...toSelection({
                        cursor: selected.cursor,
                        path: selPath,
                    }),
                    end: { path: selPath, key: serializePath(selPath) },
                },
            ],
        },
    ];
};
