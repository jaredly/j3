export type Id = string;

export const enumId = (n: number) => `:${n}`;

export type Kind = { type: 'Star' } | { type: 'Fun'; arg: Kind; body: Kind };

export const kindsEqual = (one: Kind, two: Kind): boolean => {
    if (one.type === 'Star' && two.type === 'Star') {
        return true;
    }
    if (one.type === 'Fun' && two.type === 'Fun') {
        return kindsEqual(one.arg, two.arg) && kindsEqual(one.body, two.body);
    }
    return false;
};

export type Type =
    | { type: 'Var'; v: TyVar }
    | { type: 'Con'; con: TyCon }
    | { type: 'App'; fn: Type; arg: Type }
    | { type: 'Gen'; num: number };

export const typesEqual = (one: Type, two: Type): boolean => {
    if (one.type === 'Var' && two.type === 'Var') {
        return one.v.name === two.v.name;
    }
    if (one.type === 'Con' && two.type === 'Con') {
        return one.con.id === two.con.id;
    }
    if (one.type === 'App' && two.type === 'App') {
        return typesEqual(one.fn, two.fn) && typesEqual(one.arg, two.arg);
    }
    if (one.type === 'Gen' && two.type === 'Gen') {
        return one.num === two.num;
    }
    return false;
};

export type TyVar = { type: 'TV'; name: string; k: Kind };

export type TyCon = { type: 'TC'; id: string; k: Kind };

const mkType = (id: string, k: Kind): Type => ({
    type: 'Con',
    con: { type: 'TC', id, k },
});
const star: Kind = { type: 'Star' };
const kf = (arg: Kind, body: Kind): Kind => ({ type: 'Fun', arg, body });

export const builtins = {
    unit: mkType('()', star),
    char: mkType('char', star),
    int: mkType('int', star),
    double: mkType('double', star),
    float: mkType('float', star),
    list: mkType('[]', kf(star, star)),
    arrow: mkType('(->)', kf(star, kf(star, star))),
    tuple: mkType('(,)', kf(star, kf(star, star))),
} satisfies { [key: string]: Type };

export const fn = (arg: Type, body: Type): Type => ({
    type: 'App',
    fn: { type: 'App', fn: builtins.arrow, arg },
    arg: body,
});

export const list = (arg: Type): Type => ({
    type: 'App',
    fn: builtins.list,
    arg,
});

export const pair = (one: Type, two: Type): Type => ({
    type: 'App',
    fn: { type: 'App', fn: builtins.tuple, arg: one },
    arg: two,
});

export const kind = (t: TyVar | TyCon | Type): Kind => {
    switch (t.type) {
        case 'TV':
        case 'TC':
            return t.k;
        case 'Con':
            return kind(t.con);
        case 'Var':
            return kind(t.v);
        case 'App':
            const k = kind(t.fn);
            if (k.type === 'Fun') {
                return k.body;
            }
            throw new Error(`Trying to apply a non-fn kind`);
        case 'Gen':
            throw new Error(`cant kind a gen idk`);
    }
};

export type Subst = [TyVar, Type][];

export const unique = <T>(m: T[], k: (t: T) => string): T[] => {
    const seen: { [key: string]: true } = {};
    return m.filter((t) => {
        const key = k(t);
        return seen[key] ? false : (seen[key] = true);
    });
};

export const apply = (s: Subst, t: Type): Type => {
    switch (t.type) {
        case 'Var': {
            const repl = s.find((s) => s[0].name === t.v.name);
            return repl ? repl[1] : t;
        }
        case 'App':
            return { ...t, fn: apply(s, t.fn), arg: apply(s, t.arg) };
        default:
            return t;
    }
};
export const tv = (t: Type): TyVar[] => {
    switch (t.type) {
        case 'Var':
            return [t.v];
        case 'App':
            return unique([...tv(t.fn), ...tv(t.arg)], (t) => t.name);
        default:
            return [];
    }
};
export const applyM = (s: Subst, t: Type[]): Type[] =>
    t.map((t) => apply(s, t));
export const tvM = (t: Type[]): TyVar[] => unique(t.flatMap(tv), (t) => t.name);

export const at_at = (one: Subst, two: Subst): Subst => {
    return two.map(([u, t]): [TyVar, Type] => [u, apply(one, t)]).concat(one);
};

export const merge = (one: Subst, two: Subst): Subst => {
    const map: { [key: string]: Type } = {};
    one.forEach(([u, t]) => (map[u.name] = t));
    for (let [u, t] of two) {
        if (map[u.name] && !typesEqual(map[u.name], t)) {
            throw new Error(`merge fails`);
        }
    }
    return one.concat(two.filter((t) => !map[t[0].name]));
};

// through page 9

// MostGeneralUnifier
const mgu = (one: Type, two: Type): Subst => {
    if (one.type === 'App' && two.type === 'App') {
        const s1 = mgu(one.fn, two.fn);
        const s2 = mgu(apply(s1, one.arg), apply(s1, two.arg));
        return at_at(s2, s1);
    }
    if (one.type === 'Var') {
        return varBind(one.v, two);
    }
    if (two.type === 'Var') {
        return varBind(two.v, one);
    }
    if (one.type === 'Con' && two.type === 'Con' && one.con.id === two.con.id) {
        return [];
    }
    throw new Error(`types do not unify`);
};

const varBind = (u: TyVar, t: Type): Subst => {
    if (t.type === 'Var' && t.v.name === u.name) {
        return [];
    }
    if (tv(t).find((m) => m.name === u.name)) {
        throw new Error('occurs check fails');
    }
    if (!kindsEqual(u.k, kind(t))) {
        throw new Error('kinds do not match');
    }
    return [[u, t]];
};

const match = (one: Type, two: Type): Subst => {
    if (one.type === 'App' && two.type === 'App') {
        const sl = match(one.fn, two.fn);
        const sr = match(one.arg, two.arg);
        return merge(sl, sr);
    }
    if (one.type === 'Var' && kindsEqual(one.v.k, kind(two))) {
        return [[one.v, two]];
    }
    if (one.type === 'Con' && two.type === 'Con' && one.con.id === two.con.id) {
        return [];
    }
    throw new Error('types do not match');
};

// Hmm "Trex records" in Hugs (Jones & Peterson, 1999)? Look that up
type Qual<T> = { type: 'Qual'; context: Pred[]; head: T };
type Pred = { type: 'IsIn'; id: string; t: Type };

type Apply<T> = (s: Subst, t: T) => T;
type TV<T> = (t: T) => TyVar[];

const applyQ = <T>(s: Subst, q: Qual<T>, apt: Apply<T>) => ({
    context: applyP(s, q.context),
    head: apt(s, q.head),
});
const tvQ = <T>(q: Qual<T>, tv: TV<T>) =>
    unique(tvP(q.context).concat(tv(q.head)), (m) => m.name);
const applyP = (s: Subst, p: Pred[]) =>
    p.map((p) => ({ ...p, t: apply(s, p.t) }));
const tvP = (p: Pred[]) =>
    unique(
        p.flatMap((p) => tv(p.t)),
        (m) => m.name,
    );

const lift = <R>(one: Pred, two: Pred, f: (a: Type, b: Type) => R) => {
    if (one.id === two.id) {
        return f(one.t, two.t);
    }
    throw new Error('classes differ');
};
const mguPred = (one: Pred, two: Pred): Subst => lift(one, two, mgu);
const matchPred = (one: Pred, two: Pred): Subst => lift(one, two, match);

type Class = [string[], Inst[]];
type Inst = Qual<Pred>;

const qtc = (context: Pred[], head: Pred): Qual<Pred> => ({
    type: 'Qual',
    context,
    head,
});

const builtinClasses = {
    Ord: [
        ['Eq'],
        [
            qtc([], { type: 'IsIn', id: 'Ord', t: builtins.unit }),
            qtc([], { type: 'IsIn', id: 'Ord', t: builtins.char }),
            qtc([], { type: 'IsIn', id: 'Ord', t: builtins.int }),
            qtc(
                [
                    {
                        type: 'IsIn',
                        id: 'Ord',
                        t: {
                            type: 'Var',
                            v: { type: 'TV', k: star, name: 'a' },
                        },
                    },
                    {
                        type: 'IsIn',
                        id: 'Ord',
                        t: {
                            type: 'Var',
                            v: { type: 'TV', k: star, name: 'b' },
                        },
                    },
                ],
                {
                    type: 'IsIn',
                    id: 'Ord',
                    t: pair(
                        { type: 'Var', v: { type: 'TV', k: star, name: 'a' } },
                        { type: 'Var', v: { type: 'TV', k: star, name: 'b' } },
                    ),
                },
            ),
        ],
    ],
};

type ClassEnv = {
    type: 'ClassEnv';
    classes: (id: string) => Class | null;
    defaults: Type[];
};
const super_ = (ce: ClassEnv, i: string) => ce.classes(i)?.[0];
const insts = (ce: ClassEnv, i: string) => ce.classes(i)?.[1];
const modify = (ce: ClassEnv, i: string, c: Class) => ({
    ...ce,
    classes: (id: string) => (id === i ? c : ce.classes(id)),
});

const initialEnv: ClassEnv = {
    type: 'ClassEnv',
    defaults: [builtins.int, builtins.double],
    classes: (id) => {
        throw new Error('class not defined');
    },
};

type ET = (ce: ClassEnv) => ClassEnv | null;
const arrow_colon_arrow =
    (...one: ET[]): ET =>
    (ce: ClassEnv) => {
        let res = ce as ClassEnv | null;
        for (let et of one) {
            res = et(ce);
            if (!res) {
                return null;
            }
        }
        return res;
    };

const addClass = (i: string, Is: string[]) => (ce: ClassEnv) => {
    if (ce.classes(i)) {
        throw new Error('class already defined');
    }
    if (Is.some(ce.classes)) {
        throw new Error('superclass not defined');
    }
    return modify(ce, i, [Is, []]);
};

const addCoreClasses = arrow_colon_arrow(
    addClass('Eq', []),
    addClass('Ord', ['Eq']),
    addClass('Show', []),
    addClass('Read', []),
    addClass('Bounded', []),
    addClass('Enum', []),
    addClass('Functor', []),
    addClass('Monad', []),
);
const addNumClasses = arrow_colon_arrow(
    addClass('Num', ['Eq', 'Show']),
    addClass('Real', ['Num', 'Ord']),
    addClass('Fractional', ['Num']),
    addClass('Integral', ['Real', 'Enum']),
    addClass('RealFrac', ['Real', 'Fractional']),
    addClass('Floating', ['Fractional']),
    addClass('RealFloat', ['RealFrac', 'Floating']),
);
const addPreludeClasses = arrow_colon_arrow(addCoreClasses, addNumClasses);
const addInst = (ps: Pred[], p: Pred) => (ce: ClassEnv) => {
    if (!ce.classes(p.id)) {
        throw new Error('no class for instance');
    }
    const its = insts(ce, p.id)!;
    if (its) {
        for (let p_ of its) {
            try {
                mguPred(p, p_.head);
            } catch (err) {
                continue;
            }
            throw new Error('overlapping instance');
        }
    }
    return modify(ce, p.id, [
        super_(ce, p.id)!,
        [{ type: 'Qual', context: ps, head: p }, ...(its || [])],
    ]);
};

const bySuper = (ce: ClassEnv, pred: Pred): Pred[] => {
    return [
        pred,
        ...(super_(ce, pred.id)?.map((m) =>
            bySuper(ce, { type: 'IsIn', id: m, t: pred.t }),
        ) ?? []),
    ];
};
const byInst = () => {};
const entail = () => {}; // p17
const toHnfs = () => {};
const simplify = () => {};

type Ctx = {
    counter: number;
    subst: Subst[];
};

export type Infer = (
    ce: ClassEnv,
    a: Assump[],
    e: expr,
    ctx: Ctx,
) => [Pred[], Type];
