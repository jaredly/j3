import equal from 'fast-deep-equal';
import { trace } from '.';

export type Id = string;

export const enumId = (n: number) => `:${n}`;

export type Kind =
    | { type: 'Star' }
    | { type: 'Fun'; arg: Kind; body: Kind }
    | { type: 'Row' };

export const kindsEqual = (one: Kind, two: Kind): boolean => {
    if (one.type === 'Star' && two.type === 'Star') {
        return true;
    }
    if (one.type === 'Row' && two.type === 'Row') {
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

const genName = (i: number) => "'" + `abcdefghij`[i];

export const unrollFn = (t: Type): null | { args: Type[]; body: Type } => {
    if (
        t.type === 'App' &&
        t.fn.type === 'App' &&
        t.fn.fn.type === 'Con' &&
        t.fn.fn.con.id === '(->)'
    ) {
        const args = [t.fn.arg];
        const body = unrollFn(t.arg);
        if (body) {
            args.push(...body.args);
            return { args, body: body.body };
        }
        return { args, body: t.arg };
    }
    return null;
};

export const printType = (t: Type): string => {
    switch (t.type) {
        case 'Var':
            return t.v.name;
        // return `{v} ${t.v.name} (${printKind(t.v.k)})`;
        case 'Con':
            return t.con.id;
        case 'App':
            const res = unrollFn(t);
            if (res) {
                return `(fn [${res.args
                    .map((t) => printType(t))
                    .join(' ')}] ${printType(res.body)})`;
            }
            if (t.fn.type === 'Con' && t.fn.con.id === 'rec') {
                const ts = toList(t.arg);
                return `{${ts[0]
                    .map(([n, v]) => `${n} ${printType(v)}`)
                    .join(' ')}${
                    ts[1]
                        ? (ts[0].length ? ' ' : '') + '..' + printType(ts[1])
                        : ''
                }}`;
            }
            if (t.fn.type === 'Con' && t.fn.con.id === 'var') {
                const ts = toList(t.arg);
                return `[${ts[0]
                    .map(([n, v]) => `(${n} ${printType(v)})`)
                    .join(' ')}${
                    ts[1] ? (ts[0].length ? ' ' : '') + printType(ts[1]) : ''
                }]`;
            }
            return `(${printType(t.fn)} ${printType(t.arg)})`;
        case 'Gen':
            return genName(t.num);
    }
};

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

export type TyVar = {
    type: 'TV';
    name: string;
    k: Kind;
    lacks?: { [name: string]: boolean };
};

export type TyCon = { type: 'TC'; id: string; k: Kind };

const mkType = (id: string, k: Kind): Type => ({
    type: 'Con',
    con: { type: 'TC', id, k },
});
export const star: Kind = { type: 'Star' };
export const row: Kind = { type: 'Row' };
export const kf = (arg: Kind, body: Kind): Kind => ({ type: 'Fun', arg, body });

export const builtins = {
    unit: mkType('()', star),
    char: mkType('char', star),
    string: mkType('string', star),
    int: mkType('int', star),
    double: mkType('double', star),
    float: mkType('float', star),
    list: mkType('[]', kf(star, star)),
    arrow: mkType('(->)', kf(star, kf(star, star))),
    tuple: mkType('(,)', kf(star, kf(star, star))),
    // things from the hugs records paper thing
    emptyRow: mkType('{}', row),
    rec: mkType('rec', kf(row, star)),
    var: mkType('var', kf(row, star)),
    // So the "one constant constructor per row" thing is a little funky
    // but I'll not mess with it just yet
} satisfies { [key: string]: Type };

export const rowExtend = (label: string): Type =>
    mkType(`=${label}`, kf(star, kf(row, row)));

export const app = (fn: Type, arg: Type): Type => ({ type: 'App', fn, arg });

export const fn = (arg: Type, body: Type): Type =>
    app(app(builtins.arrow, arg), body);

export const list = (arg: Type): Type => app(builtins.list, arg);

export const pair = (one: Type, two: Type): Type =>
    app(app(builtins.tuple, one), two);

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

const extractRecordExtend = (one: Type) => {
    if (
        one.type === 'App' &&
        one.fn.type === 'App' &&
        one.fn.fn.type === 'Con' &&
        one.fn.fn.con.id.startsWith('=')
    ) {
        const label = one.fn.fn.con.id.slice(1);
        const head = one.fn.arg;
        const tail = one.arg;
        return { label, head, tail };
    }
};

const toList = (t: Type): [[string, Type][], Type | null] => {
    if (t === builtins.emptyRow) {
        return [[], null];
    }
    const rec = extractRecordExtend(t);
    if (rec) {
        const [ls, mv] = toList(rec.tail);
        return [[[rec.label, rec.head], ...ls], mv];
    }
    return [[], t];
};

const fromList = (n: string[]): Lacks => {
    const res: Lacks = {};
    n.forEach((k) => (res[k] = true));
    return res;
};

type Lacks = { [key: string]: boolean };
const cintersection = (one: Lacks, two: Lacks) => {
    const res: Lacks = {};
    Object.keys(one).forEach((k) => {
        if (two[k]) {
            res[k] = true;
        }
    });
    return res;
};

const varBindRow = (one: TyVar, two: Type, ctx: Ctx): Subst => {
    const ls = one.lacks ?? {};
    const [items, mv] = toList(two);
    if (mv && mv?.type !== 'Var') {
        throw new Error('cant list it');
    }
    const ls_ = fromList(items.map((m) => m[0]));
    const s1: Subst = [[one, two]];
    const m = cintersection(ls, ls_);
    if (Object.keys(m).length === 0 && !mv) {
        return s1;
    }
    if (mv) {
        const c = { ...ls, ...mv.v.lacks };
        const r2 = newTVar(row, ctx);
        r2.v.lacks = c;
        const s2: Subst = [[mv.v, r2]];
        return at_at(s1, s2);
    }
    throw new Error(`Repeat labels??? ${Object.keys(m).join(', ')}`);
};

// {ADDED}
const rewriteRow = (
    { label, head, tail }: { label: string; head: Type; tail: Type },
    newLabel: string,
    ctx: Ctx,
): [{ head: Type; tail: Type }, Subst] => {
    if (newLabel === label) {
        return [{ head, tail }, []];
    }
    if (tail.type === 'Var') {
        const beta = newTVar(row, ctx);
        beta.v.lacks = { [newLabel]: true };
        const gamma = newTVar(star, ctx);
        const s = varBindRow(
            tail.v,
            app(app(rowExtend(newLabel), gamma), beta),
            ctx,
        );
        return [
            {
                head: gamma,
                tail: apply(s, app(app(rowExtend(label), head), beta)),
            },
            s,
        ];
    }
    const trex = extractRecordExtend(tail);
    if (!trex) {
        throw new Error(`cannot insert label ${newLabel}`);
    }
    const [nw, s] = rewriteRow(trex, newLabel, ctx);
    return [
        { head: nw.head, tail: app(app(rowExtend(label), head), nw.tail) },
        s,
    ];
};

// MostGeneralUnifier
const mgu = (one: Type, two: Type, ctx: Ctx): Subst => {
    trace.push({ at: 'mgu', one, two, ot: printType(one), tt: printType(two) });

    const ore = extractRecordExtend(one);
    const tre = extractRecordExtend(two);
    if (ore && tre) {
        const [tr2, theta1] = rewriteRow(tre, ore.label, ctx);
        const rt1tv = toList(tr2.tail)[1];
        if (rt1tv && rt1tv.type !== 'Var') {
            throw new Error('cant list it');
        }
        if (rt1tv && theta1.some((s) => s[0].name === rt1tv.v.name)) {
            throw new Error(`recursive row type, cant do it`);
        }
        const theta2 = mgu(
            apply(theta1, ore.head),
            apply(theta1, tr2.head),
            ctx,
        );
        const s = at_at(theta2, theta1);
        const theta3 = mgu(apply(s, ore.tail), apply(s, tr2.tail), ctx);
        return at_at(theta3, s);
    }

    if (one.type === 'App' && two.type === 'App') {
        const s1 = mgu(one.fn, two.fn, ctx);
        const s2 = mgu(apply(s1, one.arg), apply(s1, two.arg), ctx);
        return at_at(s2, s1);
    }
    if (one.type === 'Var') {
        return varBind(one.v, two, ctx);
    }
    if (two.type === 'Var') {
        return varBind(two.v, one, ctx);
    }
    if (one.type === 'Con' && two.type === 'Con' && one.con.id === two.con.id) {
        return [];
    }
    throw new Error(
        `types do not unify ${printType(one)} vs ${printType(two)}`,
    );
};

const varBind = (u: TyVar, t: Type, ctx: Ctx): Subst => {
    if (t.type === 'Var' && t.v.name === u.name) {
        return [];
    }
    if (tv(t).find((m) => m.name === u.name)) {
        throw new Error('occurs check fails');
    }
    if (!kindsEqual(u.k, kind(t))) {
        trace.push({ at: 'varBind', u, t });
        throw new Error(
            `kinds do not match: ${printKind(u.k)} vs ${printType(t)}`,
        );
    }
    if (u.k.type === 'Row') {
        return varBindRow(u, t, ctx);
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

const printPred = (p: Pred) => `IsIn ${p.id} ${printType(p.t)}`;

// const printQual = <T>(q: Qual<T>, p: (t: T) => string) =>
//     `[${q.context.map((p) => printPred(p))}] :=> ${p(q.head)}`;

type Apply<T> = (s: Subst, t: T) => T;
type TV<T> = (t: T) => TyVar[];

const applyQ = <T>(s: Subst, q: Qual<T>, apt: Apply<T>): Qual<T> => ({
    type: 'Qual',
    context: applyP(s, q.context),
    head: apt(s, q.head),
});
const tvQ = <T>(q: Qual<T>, tv: TV<T>) =>
    unique(tvP(q.context).concat(tv(q.head)), (m) => m.name);
const applyP1 = (s: Subst, p: Pred) => ({ ...p, t: apply(s, p.t) });
const applyP = (s: Subst, p: Pred[]) =>
    p.map((p) => ({ ...p, t: apply(s, p.t) }));
const tvP = (p: Pred[]) =>
    unique(
        p.flatMap((p) => tv(p.t)),
        (m) => m.name,
    );

const lift = <R>(
    one: Pred,
    two: Pred,
    f: (a: Type, b: Type, ctx: Ctx) => R,
    ctx: Ctx,
) => {
    if (one.id === two.id) {
        return f(one.t, two.t, ctx);
    }
    throw new Error('classes differ');
};
const mguPred = (one: Pred, two: Pred, ctx: Ctx): Subst =>
    lift(one, two, mgu, ctx);
const matchPred = (one: Pred, two: Pred, ctx: Ctx): Subst =>
    lift(one, two, match, ctx);

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

export const initialEnv: ClassEnv = {
    type: 'ClassEnv',
    defaults: [builtins.int, builtins.double],
    classes: (id) => {
        throw new Error('class not defined: ' + id);
    },
};

type ET = (ce: ClassEnv) => ClassEnv;
const arrow_colon_arrow =
    (...one: ET[]): ET =>
    (ce: ClassEnv) => {
        let res = ce;
        for (let et of one) {
            res = et(res);
        }
        return res;
    };

const addClass = (i: string, Is: string[]) => (ce: ClassEnv) => {
    let exists = false;
    try {
        ce.classes(i);
        exists = true;
    } catch (err) {}
    if (exists) {
        throw new Error('class already defined ' + i);
    }
    try {
        Is.forEach((c) => ce.classes(c));
    } catch (err) {
        throw new Error(`some superclass not defined: ${(err as any).message}`);
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
export const addPreludeClasses = arrow_colon_arrow(
    addCoreClasses,
    addNumClasses,
);
export const addInst = (ps: Pred[], p: Pred) => (ce: ClassEnv, ctx: Ctx) => {
    if (!ce.classes(p.id)) {
        throw new Error('no class for instance');
    }
    const its = insts(ce, p.id)!;
    if (its) {
        for (let p_ of its) {
            try {
                mguPred(p, p_.head, ctx);
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
        ...(super_(ce, pred.id)?.flatMap((m) =>
            bySuper(ce, { type: 'IsIn', id: m, t: pred.t }),
        ) ?? []),
    ];
};
const byInst = (ce: ClassEnv, pred: Pred, ctx: Ctx): Pred[] => {
    const tryInst = (qu: Qual<Pred>) => {
        const u = matchPred(qu.head, pred, ctx);
        return qu.context.map((p) => applyP1(u, p));
    };
    const got = insts(ce, pred.id);
    if (!got?.length) {
        throw new Error('no instances of ' + pred.id + ' found');
    }
    for (let it of got) {
        try {
            return tryInst(it);
        } catch (err) {}
    }
    trace.push({ byInst: got });
    throw new Error('nope by inst, none of them');
};

const entail = (ce: ClassEnv, preds: Pred[], pred: Pred, ctx: Ctx): boolean => {
    trace.push({ at: 'entail', preds, pred });
    const found = preds
        .map((p) => bySuper(ce, p))
        .some((got) => got.find((a) => equal(a, pred)));

    if (found) {
        return found;
    }
    try {
        const qs = byInst(ce, pred, ctx);
        return qs.every((q) => entail(ce, preds, q, ctx));
    } catch (err) {
        trace.push({ entail: 'err', err: (err as Error).message });
        return false;
    }
}; // p17
const inHnf = (pred: Pred) => {
    const hnf = (t: Type): boolean => {
        switch (t.type) {
            case 'Var':
                return true;
            case 'Gen':
            case 'Con':
                return false;
            case 'App':
                return hnf(t.fn);
        }
    };
    return hnf(pred.t);
};
const toHnfs = (ce: ClassEnv, preds: Pred[], ctx: Ctx): Pred[] => {
    return preds.flatMap((m) => toHnf(ce, m, ctx));
};
const toHnf = (ce: ClassEnv, pred: Pred, ctx: Ctx): Pred[] => {
    if (inHnf(pred)) {
        return [pred];
    }
    try {
        const ps = byInst(ce, pred, ctx);
        return toHnfs(ce, ps, ctx);
    } catch (err) {
        throw new Error('context reduction');
    }
};
const simplify = (ce: ClassEnv, preds: Pred[], ctx: Ctx): Pred[] => {
    const loop = (rs: Pred[], preds: Pred[]): Pred[] => {
        if (preds.length === 0) {
            return rs;
        }
        const [p, ...ps] = preds;
        if (entail(ce, [...rs, ...ps], p, ctx)) {
            return loop(rs, ps);
        } else {
            return loop([p, ...rs], ps);
        }
    };
    return loop([], preds);
};

const reduce = (ce: ClassEnv, preds: Pred[], ctx: Ctx): Pred[] =>
    simplify(ce, toHnfs(ce, preds, ctx), ctx);

// OK Chapter 8!
export type Scheme = { type: 'Forall'; kinds: Kind[]; qual: Qual<Type> };

const applyS = (s: Subst, { kinds, qual }: Scheme): Scheme => ({
    type: 'Forall',
    kinds,
    qual: applyQ(s, qual, apply),
});
const tvS = ({ qual }: Scheme) => tvQ(qual, tv);

const quantify = (vs: TyVar[], qt: Qual<Type>): Scheme => {
    const ids = vs.map((v) => v.name);
    const vs_ = tvQ(qt, tv).filter((v) => ids.includes(v.name));
    const ks = vs_.map(kind);
    const s = vs_.map((v): Subst[0] => [v, { type: 'Gen', num: 0 }]);
    return { type: 'Forall', kinds: ks, qual: applyQ(s, qt, apply) };
};
const toScheme = (t: Type): Scheme => ({
    type: 'Forall',
    kinds: [],
    qual: { type: 'Qual', context: [], head: t },
});

// Chapter 9!
// :>: is the constructor they use
export type Assump = { type: 'Assump'; id: string; scheme: Scheme };
const bird_face = (id: string, scheme: Scheme): Assump => ({
    type: 'Assump',
    id,
    scheme,
});

export const printAssump = (a: Assump) =>
    `${a.id} :>: ${printScheme(a.scheme)}`;

export const printScheme = (s: Scheme) => {
    if (!s.kinds.length && !s.qual.context.length) {
        return printType(s.qual.head);
    }
    const ts: string[] = s.kinds.map((_, i) => genName(i));
    s.kinds.forEach((k, i) => {
        if (k.type !== 'Star') {
            ts.push(`(kind ${genName(i)} ${printKind(k)})`);
        }
    });
    s.qual.context.forEach((pred) => {
        ts.push(`(has ${pred.id} ${printType(pred.t)})`);
    });
    const res = unrollFn(s.qual.head);
    if (res) {
        return `(fn<${ts.join(' ')}> [${res.args
            .map(printType)
            .join(' ')}] ${printType(res.body)})`;
    }
    return `(tfn [${ts.join(' ')}] ${printType(s.qual.head)})`;
    // return `Forall ${s.kinds.map((k) => printKind(k)).join(' ')} ${q}`;
};

const printKind = (k: Kind): string =>
    k.type === 'Star'
        ? '*'
        : k.type === 'Row'
        ? '®'
        : `(${printKind(k.arg)} -> ${printKind(k.body)})`;

const applyA = (s: Subst, a: Assump): Assump => ({
    ...a,
    scheme: applyS(s, a.scheme),
});
const tvA = (a: Assump) => tvS(a.scheme);

const find = (id: string, assumps: Assump[]): Scheme => {
    for (let a of assumps) {
        if (a.id === id) {
            return a.scheme;
        }
    }
    throw new Error('unbound identifier');
};

// Chapter 10

type Ctx = {
    counter: number;
    subst: Subst;
};
const initialCtx = (): Ctx => ({ counter: 0, subst: [] });

const extSubst = (subs: Subst, ctx: Ctx) => {
    trace.push({ adding: subs });
    ctx.subst = at_at(subs, ctx.subst);
};

const unify = (one: Type, two: Type, ctx: Ctx) => {
    const u = mgu(apply(ctx.subst, one), apply(ctx.subst, two), ctx);
    trace.push({ at: 'unity', one, two, u });
    extSubst(u, ctx);
};

const newTVar = (k: Kind, ctx: Ctx): Extract<Type, { type: 'Var' }> => {
    const v: TyVar = { type: 'TV', k, name: enumId(ctx.counter) };
    ctx.counter += 1;
    return { type: 'Var', v };
};

const freshInst = (scheme: Scheme, ctx: Ctx): Qual<Type> => {
    return instQ(
        scheme.kinds.map((k) => newTVar(k, ctx)),
        scheme.qual,
        inst,
    );
};

type Inst_<T> = (ts: Type[], t: T) => T;

const inst = (ts: Type[], t: Type): Type => {
    switch (t.type) {
        case 'App':
            return { ...t, fn: inst(ts, t.fn), arg: inst(ts, t.arg) };
        case 'Gen':
            return ts[t.num];
        default:
            return t;
    }
};

const instQ = <T>(ts: Type[], q: Qual<T>, inst: Inst_<T>): Qual<T> => {
    return {
        ...q,
        context: q.context.map((c) => instP(ts, c)),
        head: inst(ts, q.head),
    };
};
const instP: Inst_<Pred> = (ts, p) => ({ ...p, t: inst(ts, p.t) });

// Chapter 11

export type Infer<E, T> = (
    ce: ClassEnv,
    a: Assump[],
    e: E,
    ctx: Ctx,
) => [Pred[], T];

type Literal =
    | { type: 'Int'; value: number }
    | { type: 'Char'; value: string }
    | { type: 'Rat'; value: number }
    | { type: 'Float'; value: number }
    | { type: 'Str'; value: string };

const tiLit = (lit: Literal, ctx: Ctx): [Pred[], Type] => {
    switch (lit.type) {
        case 'Char':
            return [[], builtins.char];
        case 'Str':
            return [[], builtins.string];
        case 'Int': {
            // return [[], builtins.int];
            const v = newTVar(star, ctx);
            return [[{ type: 'IsIn', id: 'Num', t: v }], v];
        }
        case 'Float': {
            const v = newTVar(star, ctx);
            return [[{ type: 'IsIn', id: 'Floating', t: v }], v];
        }
        case 'Rat': {
            const v = newTVar(star, ctx);
            return [[{ type: 'IsIn', id: 'Fractional', t: v }], v];
        }
    }
};

type Pat =
    | { type: 'Var'; id: string }
    | { type: 'Wildcard' }
    | { type: 'As'; name: string; pat: Pat }
    | { type: 'Lit'; lit: Literal }
    | { type: 'Npk'; name: string; num: number }
    | { type: 'Con'; assump: Assump; pat: Pat[] };

export const foldr = <A, B>(
    f: (x: A, acc: B) => B,
    acc: B,
    [h, ...t]: A[],
): B => (h === undefined ? acc : f(h, foldr(f, acc, t)));

const tiPat = (pat: Pat, ctx: Ctx): [Pred[], Assump[], Type] => {
    switch (pat.type) {
        case 'Var': {
            const v = newTVar(star, ctx);
            return [[], [bird_face(pat.id, toScheme(v))], v];
        }
        case 'Wildcard': {
            const v = newTVar(star, ctx);
            return [[], [], v];
        }
        case 'As': {
            const [ps, as, t] = tiPat(pat.pat, ctx);
            return [ps, [bird_face(pat.name, toScheme(t)), ...as], t];
        }
        case 'Lit': {
            const [ps, t] = tiLit(pat.lit, ctx);
            return [ps, [], t];
        }
        // lol wat is this even
        case 'Npk': {
            const t = newTVar(star, ctx);
            return [
                [{ type: 'IsIn', id: 'Integral', t }],
                [bird_face(pat.name, toScheme(t))],
                t,
            ];
        }
        case 'Con': {
            const [ps, as, ts] = tiPats(pat.pat, ctx);
            const t_ = newTVar(star, ctx);
            const { context, head } = freshInst(pat.assump.scheme, ctx);
            unify(head, foldr(fn, t_, ts), ctx);
            return [ps.concat(context), as, t_];
        }
    }
};

const tiPats = (pats: Pat[], ctx: Ctx): [Pred[], Assump[], Type[]] => {
    const psasts = pats.map((p) => tiPat(p, ctx));
    const ps = psasts.flatMap((p) => p[0]);
    const as = psasts.flatMap((p) => p[1]);
    const ts = psasts.flatMap((p) => p[2]);
    return [ps, as, ts];
};

export type Expr =
    | { type: 'Var'; id: string; loc: number }
    | { type: 'Lit'; lit: Literal; loc: number }
    | { type: 'Const'; assump: Assump; loc: number }
    | { type: 'Ap'; fn: Expr; arg: Expr; loc: number }
    | { type: 'Let'; group: BindGroup; body: Expr; loc: number }
    | { type: 'Abs'; pats: Pat[]; body: Expr; loc: number }
    | { type: 'RecordEmpty'; loc: number }
    | { type: 'RecordExtend'; label: string; loc: number }
    | { type: 'Variant'; label: string; loc: number };

const tiExpr: Infer<Expr, Type> = (ce, as, expr, ctx) => {
    trace.push({ at: 'tiExpr', expr });
    switch (expr.type) {
        case 'Variant': {
            const t = newTVar(star, ctx);
            const a = newTVar(row, ctx);
            a.v.lacks = { [expr.label]: true };
            return [
                [],
                fn(t, app(builtins.var, app(app(rowExtend(expr.label), t), a))),
            ];
        }
        case 'RecordEmpty':
            return [[], app(builtins.rec, builtins.emptyRow)];
        case 'RecordExtend': {
            const t = newTVar(star, ctx);
            const a = newTVar(row, ctx);
            a.v.lacks = { [expr.label]: true };
            return [
                [],
                fn(
                    t,
                    fn(
                        app(builtins.rec, a),
                        app(
                            builtins.rec,
                            app(app(rowExtend(expr.label), t), a),
                        ),
                    ),
                ),
            ];
        }
        case 'Var': {
            const sc = find(expr.id, as);
            const { context, head } = freshInst(sc, ctx);
            return [context, head];
        }
        case 'Const': {
            const { context, head } = freshInst(expr.assump.scheme, ctx);
            return [context, head];
        }
        case 'Lit': {
            return tiLit(expr.lit, ctx);
        }
        case 'Ap': {
            const [ps, te] = tiExpr(ce, as, expr.fn, ctx);
            const [qs, tf] = tiExpr(ce, as, expr.arg, ctx);
            const t = newTVar(star, ctx);
            unify(fn(tf, t), te, ctx);
            return [[...ps, ...qs], t];
        }
        case 'Let': {
            const [ps, as_] = tiBindGroup(ce, as, expr.group, ctx);
            const [qs, t] = tiExpr(ce, [...as_, ...as], expr.body, ctx);
            return [[...ps, ...qs], t];
        }
        case 'Abs': {
            return tiAlt(ce, as, [expr.pats, expr.body], ctx);
        }
    }
};

type Alt = [Pat[], Expr];

const tiAlt: Infer<Alt, Type> = (ce, as, alt, ctx) => {
    const [ps, as_, ts] = tiPats(alt[0], ctx);
    const [qs, t] = tiExpr(ce, [...as_, ...as], alt[1], ctx);
    return [[...ps, ...qs], foldr(fn, t, ts)];
};

const tiAlts = (
    ce: ClassEnv,
    as: Assump[],
    alts: Alt[],
    t: Type,
    ctx: Ctx,
): Pred[] => {
    const psts = alts.map((m) => tiAlt(ce, as, m, ctx));
    psts.map((p) => p[1]).forEach((m) => unify(t, m, ctx));
    return psts.flatMap((p) => p[0]);
};

const partition = <T>(a: T[], f: (t: T) => boolean): [T[], T[]] => {
    const yes: T[] = [];
    const no: T[] = [];
    a.forEach((t) => {
        if (f(t)) {
            yes.push(t);
        } else {
            no.push(t);
        }
    });
    return [yes, no];
};

const split = (
    ce: ClassEnv,
    fs: TyVar[],
    gs: TyVar[],
    ps: Pred[],
    ctx: Ctx,
) => {
    const ps_ = reduce(ce, ps, ctx);
    const [ds, rs] = partition(ps_, (p) =>
        tv(p.t).every((x) => fs.find((f) => f.name === x.name)),
    );
    const rs_ = defaultedPreds(ce, [...fs, ...gs], rs, ctx);
    return [ds, rs];
};

const without = <T>(one: T[], two: T[], eq: (a: T, b: T) => boolean) =>
    one.filter((o) => !two.some((t) => eq(o, t)));

type Ambiguity = [TyVar, Pred[]];
const ambiguities = (ce: ClassEnv, vs: TyVar[], ps: Pred[]): Ambiguity[] => {
    return without(tvP(ps), vs, (a, b) => a.name === b.name).map((v) => [
        v,
        ps.filter((p) => tv(p.t).some((t) => t.name === v.name)),
    ]);
};

const numClasses = [
    'Num',
    'Integral',
    'Floating',
    'Fractional',
    'Real',
    'RealFloat',
    'RealFrac',
];
const stdClasses = [
    'Eq',
    'Ord',
    'Show',
    'Read',
    'Bounded',
    'Enum',
    'Ix',
    'Functor',
    'Monad',
    'MonadPlus',
    ...numClasses,
];

const candidates = (ce: ClassEnv, [v, qs]: Ambiguity, ctx: Ctx): Type[] => {
    if (qs.some((q) => q.t.type !== 'Var' || v.name !== q.t.v.name)) {
        trace.push({ err: 'some not var' });
        return [];
    }
    const is_ = qs.map((q) => q.id);
    if (is_.every((i) => !numClasses.includes(i))) {
        trace.push({ err: 'some not numclasses', is_ });
        return [];
    }
    if (is_.some((i) => !stdClasses.includes(i))) {
        trace.push({ err: 'not all stdclasses', is_ });
        return [];
    }
    trace.push({ at: 'candidates', defaults: ce.defaults, is_ });
    return ce.defaults.filter((t_) => {
        return is_.every((i) =>
            entail(ce, [], { type: 'IsIn', id: i, t: t_ }, ctx),
        );
    });
};

const withDefaults = <a>(
    f: (a: Ambiguity[], t: Type[]) => a,
    ce: ClassEnv,
    vs: TyVar[],
    ps: Pred[],
    ctx: Ctx,
): a => {
    const vps = ambiguities(ce, vs, ps);
    const tss = vps.map((v) => candidates(ce, v, ctx));
    if (tss.some((s) => !s.length)) {
        trace.push({ vs, ps, vps, tss });
        throw new Error('cannot resolve ambiguity');
    }
    return f(
        vps,
        tss.map((ts) => ts[0]),
    );
};

const defaultedPreds = (ce: ClassEnv, tv: TyVar[], ps: Pred[], ctx: Ctx) =>
    withDefaults((vps, ts) => vps.flatMap((v) => v[1]), ce, tv, ps, ctx);

const defaultSubst = (ce: ClassEnv, tv: TyVar[], ps: Pred[], ctx: Ctx) =>
    withDefaults(
        (vps, ts) =>
            zipWith(
                vps.map((v) => v[0]),
                ts,
                (a, b): [typeof a, typeof b] => [a, b],
            ),
        ce,
        tv,
        ps,
        ctx,
    );

type Expl = [string, Scheme, Alt[]];

const tiExpl = (
    ce: ClassEnv,
    as: Assump[],
    [i, sc, alts]: Expl,
    ctx: Ctx,
): Pred[] => {
    const { context: qs, head: t } = freshInst(sc, ctx);
    const ps = tiAlts(ce, as, alts, t, ctx);
    const s = ctx.subst;
    const qs_ = applyP(s, qs);
    const t_ = apply(s, t);
    const fs = as.map((a) => applyA(s, a)).flatMap(tvA);
    const gs = without(tv(t_), fs, (a, b) => a.name === b.name);
    const sc_ = quantify(gs, { type: 'Qual', context: qs_, head: t_ });
    const ps_ = applyP(s, ps).filter((p) => !entail(ce, qs_, p, ctx));
    const [ds, rs] = split(ce, fs, gs, ps_, ctx);
    if (!equal(sc, sc_)) {
        throw new Error('signature is too general');
    } else if (rs.length) {
        throw new Error('context is too weak');
    } else {
        return ds;
    }
};

export type Impl = [string, Alt[]];

const restricted = (bs: Impl[]) =>
    bs.some(([i, alts]) => alts.some((a) => !a[0].length));

// const zipBird = (is: string[], as: Scheme[]): Assump[] => {
//     const res = [];
//     for (let i=0; i<is.length && i < as.length; i++) {
//         res.push(bird_face(is[i], as[i]))
//     }
//     return res
// }

const zipWith = <A, B, C>(is: A[], as: B[], f: (a: A, b: B) => C): C[] => {
    const res: C[] = [];
    for (let i = 0; i < is.length && i < as.length; i++) {
        res.push(f(is[i], as[i]));
    }
    return res;
};

const intersection = (t: TyVar[][]) => {
    let got = t[0];
    for (let ts of t.slice(1)) {
        got = got.filter((t) => ts.some((s) => s.name === t.name));
    }
    return got;
};

const tiImpls: Infer<Impl[], Assump[]> = (ce, as, bs, ctx) => {
    const ts = bs.map(() => newTVar(star, ctx));
    const is = bs.map((b) => b[0]);
    const scs = ts.map(toScheme);
    const as_ = [...zipWith(is, scs, bird_face), ...as];
    const altss = bs.map((b) => b[1]);
    const pss = zipWith(altss, ts, (a, b) => tiAlts(ce, as_, a, b, ctx));
    const s = ctx.subst;
    const ps_ = applyP(s, pss.flat());
    const ts_ = ts.map((t) => apply(s, t));
    const fs = as.map((a) => tvA(applyA(s, a))).flat();
    const vss = ts_.map(tv);
    const gs = without(
        unique(vss.flat(), (a) => a.name),
        fs,
        (a, b) => a.name === b.name,
    );
    const [ds, rs] = split(ce, fs, intersection(vss), ps_, ctx);
    if (restricted(bs)) {
        const gs_ = without(gs, tvP(rs), (a, b) => a.name === b.name);
        const scs_ = ts_.map((t) =>
            quantify(gs_, { type: 'Qual', context: [], head: t }),
        );
        return [[...ds, ...rs], zipWith(is, scs_, bird_face)];
    } else {
        let scs_ = ts_.map((t) =>
            quantify(gs, { type: 'Qual', context: rs, head: t }),
        );
        return [ds, zipWith(is, scs_, bird_face)];
    }
};

export type BindGroup = [Expl[], Impl[][]];

const tiBindGroup: Infer<BindGroup, Assump[]> = (ce, as, [es, iss], ctx) => {
    const as_ = es.map(([v, sc, alts]) => bird_face(v, sc));
    const [ps, as__] = tiSeq(tiImpls, ce, [...as_, ...as], iss, ctx);
    const qss = es.map((e) => tiExpl(ce, [...as__, ...as_, ...as], e, ctx));
    return [
        [...ps, ...qss.flat()],
        [...as__, ...as_],
    ];
};

const tiSeq = <bg>(
    ti: Infer<bg, Assump[]>,
    ce: ClassEnv,
    as: Assump[],
    bs: bg[],
    ctx: Ctx,
): [Pred[], Assump[]] => {
    if (!bs.length) {
        return [[], []];
    }
    const [ps, as_] = ti(ce, as, bs[0], ctx);
    const [qs, as__] = tiSeq(ti, ce, [...as_, ...as], bs.slice(1), ctx);
    return [
        [...ps, ...qs],
        [...as__, ...as_],
    ];
};

export type Program = BindGroup[];

export const tiProgram = (
    ce: ClassEnv,
    as: Assump[],
    bgs: Program,
): Assump[] => {
    const ctx = initialCtx();
    const [ps, as_] = tiSeq(tiBindGroup, ce, as, bgs, ctx);
    const s = ctx.subst;
    const rs = reduce(ce, applyP(s, ps), ctx);
    const s_ = defaultSubst(ce, [], rs, ctx);
    return as_.map((a) => applyA(at_at(s_, s), a));
};
