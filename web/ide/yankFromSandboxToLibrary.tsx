import { prevMap } from '../custom/reduce';
import { NodeExtra } from '../../src/types/cst';
import { MNodeList, Map } from '../../src/types/mcst';
import {
    UpdateMap,
    applyUpdateMap,
    clearAllChildren,
} from '../../src/state/getKeyUpdate';
import { validName, validateExpr } from '../../src/get-type/validate';
import { Error } from '../../src/types/types';
import { getType } from '../../src/get-type/get-types-new';
import { makeHash } from './makeHash';
import { selectEnd } from '../../src/state/navigate';
import { addToHashedTree, flatToTree } from '../../src/db/hash-tree';
import { Def, DefType } from '../../src/types/ast';
import { noForm } from '../../src/to-ast/builtins';
import { getCtx } from '../../src/getCtx';
import { IDEState } from './IDE';
import { Ctx, Sandbox } from '../../src/to-ast/library';
import { UIState } from '../custom/UIState';
import { Path } from '../store';
import { relocify } from './relocify';

export const yankFromSandboxToLibrary = (
    state: UIState,
    action: { type: 'yank'; expr: DefType | Def; loc: number },
    meta: Sandbox['meta'],
): UIState => {
    const result = yankInner(
        state.map,
        state.ctx,
        action,
        meta.settings.namespace.join('/'),
    );
    if (!result) {
        return state;
    }
    const { update, ntop, npath, library } = result;

    const map = applyUpdateMap(state.map, update);
    const nselect = selectEnd(ntop, npath, map)!;

    const prev: UpdateMap = prevMap(map, update);
    return {
        ...state,
        map,
        history: state.history.concat([
            {
                map: update,
                prev,
                cardChange: [],
                at: [{ start: nselect }],
                prevAt: state.at,
                id: state.history[state.history.length - 1].id + 1,
                ts: Date.now() / 1000,
                libraryRoot: library.root,
            },
        ]),
        at: [{ start: nselect }],
        ctx: getCtx(map, -1, state.nidx, {
            ...state.ctx.global,
            library,
        }).ctx,
    };
};

export const yankInner = (
    map: Map,
    ctx: Ctx,
    item: { expr: DefType | Def; loc: number },
    prefix: string,
) => {
    // if (state.current.type !== 'sandbox') {
    //     return state;
    // }
    // const sstate = state.current.state;
    const top = map[-1] as MNodeList & NodeExtra;
    const pos = top.values.indexOf(item.loc);
    if (pos === -1) {
        console.log('bad yank', top, item.loc);
        return null;
    }

    // Here, we do some validation as well.
    const errors: { [idx: number]: Error[] } = {};
    validateExpr(item.expr, ctx, errors);
    const ann = getType(item.expr, ctx, {
        errors,
        types: {},
    });

    if (Object.keys(errors).length) {
        console.error('trying to yank something with errors');
        console.log(errors);
        return null;
    }
    if (!ann) {
        console.error('cant get type');
        return null;
    }

    const reloced = relocify(item.expr) as Def | DefType;

    if (!reloced) {
        return null;
    }

    // console.log('reloced', action.expr, reloced);
    const newHash = makeHash(noForm(reloced));

    // TODO if iti's the last one, replace with a blank
    const values = top.values.slice();
    values.splice(pos, 1);
    const update: UpdateMap = {
        [top.loc]: { ...top, values },
        ...clearAllChildren([item.loc], map),
    };

    if (values.length === 0) {
        values.push(item.loc);
        update[item.loc] = {
            type: 'blank',
            loc: item.loc,
        };
    }

    // START HERE: add to library,
    // replace refefences
    Object.keys(map).map((k) => {
        const node = map[+k];
        if (node.type === 'hash' && node.hash === item.loc) {
            update[+k] = {
                ...node,
                hash: newHash,
            };
        }
    });

    const ntop = pos < values.length ? values[pos] : values[0];
    // const map2 = applyUpdateMap(map, update);
    // const nselect = selectEnd(
    //     ntop,
    //     [{ idx: -1, at: values.indexOf(ntop), type: 'child' }],
    //     map2,
    // )!;

    const name = item.expr.name;
    if (!validName(name)) {
        console.error('invalid name sry', name);
        return null;
    }

    const nnames = { ...ctx.global.library.namespaces };

    const namespacedName = `${prefix}/${item.expr.name}`;

    const newRoot = addToHashedTree(
        nnames,
        flatToTree({
            // Add relevant prefix
            [namespacedName]: newHash,
        }),
        makeHash,
        {
            root: ctx.global.library.root,
            tree: nnames,
        },
    );
    const library = {
        ...ctx.global.library,
        namespaces: nnames,
    };
    if (newRoot) {
        library.root = newRoot;
        library.history = [
            {
                hash: newRoot,
                date: Date.now() / 1000,
            },
        ].concat(library.history);
    }
    library.definitions = { ...library.definitions };
    library.definitions[newHash] =
        reloced.type === 'def'
            ? {
                  type: 'term',
                  value: reloced.value,
                  ann,
                  originalName: reloced.name,
              }
            : {
                  type: 'type',
                  value: reloced.value,
                  originalName: reloced.name,
              };

    return {
        update,
        ntop,
        npath: [{ idx: -1, at: values.indexOf(ntop), type: 'child' }] as Path[],
        library,
    };
};
