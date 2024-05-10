import { trace } from '.';
import { calog } from './infer';
import { typToString } from './typToString';
import {
    Type,
    Ctx,
    Subst,
    composeSubst,
    apply,
    TyVar,
    newTyVarWith,
    newTyVar,
    Constraint,
    ftv,
} from './types';

export const varBind = (one: TyVar, two: Type, ctx: Ctx): Subst => {
    const ff = ftv(two);
    if (ff[one.name]) {
        throw new Error(`occur check fails`);
    }
    return one.kind === 'Star'
        ? { [one.name]: two }
        : varBindRow(one, two, ctx);
};

export const unionConstraints = (one: TyVar, two: TyVar, ctx: Ctx): Subst => {
    if (one === two) {
        return {};
    }
    if (one.name === two.name) {
        debugger;
        throw new Error('not quite equal');
    }
    if (one.kind === 'Star' && two.kind === 'Star') {
        return { [one.name]: { type: 'Var', v: two, loc: -1 } };
    }
    if (one.kind === 'Row' && two.kind === 'Row') {
        const c = {
            ...one.constraint,
            ...two.constraint,
        };
        const r = newTyVarWith('Row', c, 'r', -1, ctx);
        return { [one.name]: r, [two.name]: r };
    }
    throw new Error(`kind mismatch`);
};

export const unify = calog('unify', (one: Type, two: Type, ctx: Ctx): Subst => {
    if (one.type === 'Fun' && two.type === 'Fun') {
        const s1 = unify(one.arg, two.arg, ctx);
        const s2 = unify(apply(s1, one.body), apply(s1, two.body), ctx);
        trace.push({ at: 'unified args and bodies', args: s1, bodies: s2 });
        return composeSubst(s1, s2);
    }
    if (one.type === 'Var' && two.type === 'Var') {
        return unionConstraints(one.v, two.v, ctx);
    }
    if (one.type === 'Var') {
        return varBind(one.v, two, ctx);
    }
    if (two.type === 'Var') {
        return varBind(two.v, one, ctx);
    }
    if (one.type === 'Int' && two.type === 'Int') {
        return {};
    }
    if (one.type === 'Bool' && two.type === 'Bool') {
        return {};
    }
    if (one.type === 'Record' && two.type === 'Record') {
        return unify(one.body, two.body, ctx);
    }
    if (one.type === 'Variant' && two.type === 'Variant') {
        return unify(one.body, two.body, ctx);
    }
    if (one.type === 'RowEmpty' && two.type === 'RowEmpty') {
        return {};
    }
    if (one.type === 'RowExtend' && two.type === 'RowExtend') {
        const { name: label1, head: fieldTy1, tail: rowTail1 } = one;
        const [fieldTy2, rowTail2, theta1] = rewriteRow(two, label1, ctx);
        const rt1tv = toList(rowTail1)[1];
        if (rt1tv && theta1[rt1tv.name]) {
            throw new Error(`recursive row type, cant do it`);
        }
        const theta2 = unify(
            apply(theta1, fieldTy1),
            apply(theta1, fieldTy2),
            ctx,
        );
        const s = composeSubst(theta2, theta1);
        const theta3 = unify(apply(s, rowTail1), apply(s, rowTail2), ctx);
        return composeSubst(theta3, s);
    }
    throw new Error(
        `types do not unify ${typToString(one)} vs ${typToString(two)}`,
    );
});

const fromList = (n: string[]): Constraint => {
    const res: Constraint = {};
    n.forEach((k) => (res[k] = true));
    return res;
};

const intersection = (one: Constraint, two: Constraint) => {
    const res: Constraint = {};
    Object.keys(one).forEach((k) => {
        if (two[k]) {
            res[k] = true;
        }
    });
    return res;
};

export const toList = (t: Type): [[string, Type][], TyVar | null] => {
    switch (t.type) {
        case 'Var':
            return [[], t.v];
        case 'RowEmpty':
            return [[], null];
        case 'RowExtend':
            const [ls, mv] = toList(t.tail);
            return [[[t.name, t.head], ...ls], mv];
    }
    throw new Error('cant list it');
};

const varBindRow = (one: TyVar, two: Type, ctx: Ctx): Subst => {
    const ls = one.constraint;
    const [items, mv] = toList(two);
    const ls_ = fromList(items.map((m) => m[0]));
    const s1: Subst = { [one.name]: two };
    const m = Object.keys(intersection(ls, ls_));
    if (m.length === 0 && !mv) {
        return s1;
    }
    if (mv) {
        const c = { ...ls, ...mv.constraint };
        const r2 = newTyVarWith('Row', c, 'r', -1, ctx);
        const s2: Subst = { [mv.name]: r2 };
        return composeSubst(s1, s2);
    }
    throw new Error(`Repeat labels??? ${m.join(', ')}`);
};

export const rewriteRow = (
    t: Type,
    newLabel: string,
    ctx: Ctx,
): [Type, Type, Subst] => {
    if (t.type === 'RowEmpty') {
        throw new Error(`label cannot be inserted ${newLabel}`);
    }
    if (t.type !== 'RowExtend') {
        throw new Error(`Unexpected type...`);
    }
    if (newLabel === t.name) {
        return [t.head, t.tail, {}];
    }
    if (t.tail.type === 'Var') {
        const beta = newTyVarWith('Row', { [newLabel]: true }, 'r', -1, ctx);
        const gamma = newTyVar('a', t.loc, ctx);
        const s = varBindRow(
            t.tail.v,
            {
                type: 'RowExtend',
                name: newLabel,
                head: gamma,
                tail: beta,
                loc: t.loc,
                nameloc: t.loc,
            },
            ctx,
        );
        return [
            gamma,
            apply(s, {
                type: 'RowExtend',
                name: t.name,
                head: t.head,
                tail: beta,
                loc: t.loc,
                nameloc: t.loc,
            }),
            s,
        ];
    }
    const [one_, two_, s] = rewriteRow(t.tail, newLabel, ctx);
    return [
        one_,
        {
            type: 'RowExtend',
            name: t.name,
            head: t.head,
            tail: two_,
            loc: t.loc,
            nameloc: t.loc,
        },
        s,
    ];
};
