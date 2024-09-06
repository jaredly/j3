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
    Node,
    Nodes,
    parentPath,
    Path,
    pathWithChildren,
    RecNodeT,
    Style,
} from '../../shared/nodes';
import { DocSession } from '../../shared/state2';
import { getNodeForPath } from '../selectNode';
import { Store } from '../StoreContext2';
import { inflateRecNode } from '../TextEdit/actions';
import { normalizeSelection, topUpdate } from './edit/handleUpdate';
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
                    return [
                        line(item.title, undefined, style),
                        line(item.subtitle || '', undefined, style),
                    ];
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
    const autos = ev.kwds.slice();
    const { kinds, local } = cache.result.autocomplete;
    local.forEach((node) => {
        // TODO: make an autocomplete for the local node.
        // would be great to include type info too if we can
    });
    kinds.forEach((kind) => {
        // idk do something with this
    });

    const node = getNodeForPath(path, store.getState());
    if (!node || node.type !== 'id' || (node.ref && !selText)) {
        return;
    }
    const text = selText ? selText.join('') : node.text;
    if (!text.length) return; // don't give autocomplete with no text

    const top = isToplevel(
        path,
        store.getState().toplevels[path.root.toplevel].nodes,
    );

    const filter = (auto: (typeof autos)[0]) => {
        if (auto.toplevel && !top) return false;
        if (auto.text.includes(text)) {
            return true;
        }
        return false;
    };

    return autos.filter(filter).flatMap((auto) => {
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
                            node,
                            tpl.template,
                        ),
                    );
                },
            }));
        }

        // Somethinggg
        // return {
        //     type: 'action',
        //     title: auto.text,
        //     subtitle: auto.docs ?? '',
        //     action() {
        //         // TODO
        //     },
        // };
        return [];
    });
};

const applyTemplate = (
    store: Store,
    sel: IRSelection,
    text: string,
    node: Extract<Node, { type: 'id' }>,
    tpl: RecNodeT<boolean>[],
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

    if (path.children.length === 1) {
        let nextLoc = top.nextLoc;
        const allNodes: Nodes = {};
        // let selecteds: {
        //     cursor: IRCursor;
        //     children: number[];
        //     node: RecNodeT<boolean>;
        // }[] = [];
        const nlocs: number[] = [lastChild(path)];
        let root = nextLoc++;
        allNodes[root] = { type: 'list', items: nlocs, loc: root };
        allNodes[node.loc] = { ...node, text };

        tpl.forEach((sibling) => {
            const { selected, nloc, nodes, nidx } = inflateRecNode(
                nextLoc,
                sibling,
            );
            nextLoc = nidx.next;
            nlocs.push(nloc);
            Object.assign(allNodes, nodes);
            // selecteds.push({ ...selected, node: sibling });
        });

        const selPath = pathWithChildren(parentPath(path), root, node.loc);

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
                selections: [toSelection({ cursor, path: selPath })],
            },
        ];
    }
    // orr if we are the only child

    // Non-template
    return [
        topUpdate(path.root.toplevel, {
            [node.loc]: { ...node, text: text },
        }),
        {
            type: 'selection',
            doc: path.root.doc,
            selections: [toSelection({ cursor, path: sel.start.path })],
        },
    ];
};
