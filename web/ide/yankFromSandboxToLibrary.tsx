import { prevMap } from '../custom/reduce';
import { NodeExtra } from '../../src/types/cst';
import { MNodeList } from '../../src/types/mcst';
import {
    UpdateMap,
    applyUpdateMap,
    clearAllChildren,
} from '../../src/state/getKeyUpdate';
import { validName, validateExpr } from '../../src/get-type/validate';
import { Error } from '../../src/types/types';
import { getType } from '../../src/get-type/get-types-new';
import { transformExpr } from '../../src/types/walk-ast';
import { makeHash } from './initialData';
import { selectEnd } from '../../src/state/navigate';
import { addToHashedTree, flatToTree } from '../../src/db/hash-tree';
import { Def, DefType } from '../../src/types/ast';
import { noForm } from '../../src/to-ast/builtins';
import { getCtx } from '../../src/getCtx';
import { IDEState } from './IDE';
import { Sandbox } from '../../src/to-ast/library';
import { UIState } from '../custom/UIState';

export const yankFromSandboxToLibrary = (
    state: UIState,
    action: { type: 'yank'; expr: DefType | Def; loc: number },
    meta: Sandbox['meta'],
) => {
    // if (state.current.type !== 'sandbox') {
    //     return state;
    // }
    // const sstate = state.current.state;
    const top = state.map[-1] as MNodeList & NodeExtra;
    const pos = top.values.indexOf(action.loc);
    if (pos === -1) {
        console.log('bad yank', top, action.loc);
        return state;
    }

    // Here, we do some validation as well.
    const errors: { [idx: number]: Error[] } = {};
    validateExpr(action.expr, state.ctx, errors);
    const ann = getType(action.expr, state.ctx, {
        errors,
        types: {},
    });

    if (Object.keys(errors).length) {
        console.error('trying to yank something with errors');
        return state;
    }
    if (!ann) {
        console.error('cant get type');
        return state;
    }

    let bad = false;

    let lloc = 1;
    let locMap: { [old: number]: number } = {};
    const reloced = transformExpr(
        action.expr,
        {
            Loc() {
                return 0;
            },
            Type(node, ctx) {
                if (node.type === 'local') {
                    if (!locMap[node.sym]) {
                        console.error(
                            'no locmap for the local sym type',
                            node.sym,
                            node,
                        );
                        bad = true;
                    }
                    return { ...node, sym: locMap[node.sym] };
                }
                return null;
            },
            Expr(node, ctx) {
                if (node.type === 'loop') {
                    locMap[node.form.loc] = lloc++;
                    return {
                        ...node,
                        form: { ...node.form, loc: locMap[node.form.loc] },
                    };
                }
                if (node.type === 'tfn') {
                    const args = node.args.map((arg) => {
                        locMap[arg.form.loc] = lloc++;
                        return {
                            ...arg,
                            form: { ...arg.form, loc: locMap[arg.form.loc] },
                        };
                    });
                    return { ...node, args };
                }
                if (node.type === 'toplevel') {
                    console.error(`depends on a toplevel cant do it`);
                    bad = true;
                }
                if (node.type === 'local' || node.type === 'recur') {
                    if (!locMap[node.sym]) {
                        console.error(
                            'no locmap for the local sym',
                            node.sym,
                            node,
                        );
                        bad = true;
                    }
                    return { ...node, sym: locMap[node.sym] };
                }
                return null;
            },
            Type_tfn(node, ctx) {
                const args = node.args.map((arg) => {
                    locMap[arg.form.loc] = lloc++;
                    return {
                        ...arg,
                        form: { ...arg.form, loc: locMap[arg.form.loc] },
                    };
                });
                return { ...node, args };
            },
            Pattern(node, ctx) {
                if (node.type === 'local') {
                    locMap[node.sym] = lloc++;
                    return { ...node, sym: locMap[node.sym] };
                }
                return null;
            },
        },
        null,
    ) as Def | DefType;

    if (bad) {
        console.error('bad reloc');
        console.log(action.expr);
        console.log(locMap);
        console.log(reloced);
        return state;
    }

    // console.log('reloced', action.expr, reloced);
    const newHash = makeHash(noForm(reloced));

    // TODO if iti's the last one, replace with a blank
    const values = top.values.slice();
    values.splice(pos, 1);
    const update: UpdateMap = {
        [top.loc]: { ...top, values },
        ...clearAllChildren([action.loc], state.map),
    };

    if (values.length === 0) {
        values.push(action.loc);
        update[action.loc] = {
            type: 'blank',
            loc: action.loc,
        };
    }

    // START HERE: add to library,
    // replace refefences
    Object.keys(state.map).map((k) => {
        const node = state.map[+k];
        if (node.type === 'hash' && node.hash === action.loc) {
            update[+k] = {
                ...node,
                hash: newHash,
            };
        }
    });

    const prev: UpdateMap = prevMap(state.map, update);

    const map = applyUpdateMap(state.map, update);
    const ntop = pos < values.length ? values[pos] : values[0];
    const nselect = selectEnd(
        ntop,
        [{ idx: -1, at: values.indexOf(ntop), type: 'child' }],
        map,
    )!;

    const name = action.expr.name;
    if (!validName(name)) {
        console.error('invalid name sry', name);
        return state;
    }

    const nnames = { ...state.ctx.global.library.namespaces };

    const namespacedName = `${meta.settings.namespace.join('/')}/${
        action.expr.name
    }`;

    const newRoot = addToHashedTree(
        nnames,
        flatToTree({
            // Add relevant prefix
            [namespacedName]: newHash,
        }),
        makeHash,
        {
            root: state.ctx.global.library.root,
            tree: nnames,
        },
    );
    const library = {
        ...state.ctx.global.library,
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
        ...state,
        map,
        history: state.history.concat([
            {
                map: update,
                prev,
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
