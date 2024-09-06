import { AnyEvaluator } from '../../boot-ex/types';
import {
    Block,
    hblock,
    line,
    table,
    vblock,
} from '../../shared/IR/ir-to-blocks';
import { lastChild } from '../../shared/IR/nav';
import { Style } from '../../shared/nodes';
import { DocSession } from '../../shared/state2';
import { getNodeForPath } from '../selectNode';
import { Store } from '../StoreContext2';
import { normalizeSelection } from './edit/handleUpdate';
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

    const filter = (auto: (typeof autos)[0]) => {
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
                    // TODO
                },
            }));
        }
        return {
            type: 'action',
            title: auto.text,
            subtitle: auto.docs ?? '',
            action() {
                // TODO
            },
        };
    });
};
