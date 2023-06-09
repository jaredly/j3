import { Expr, Loc, Node, TRecord, Type } from '../types/ast';
import objectHash from 'object-hash';
import { Global } from './Ctx';

export const noForm = (obj: any): any => {
    if (Array.isArray(obj)) {
        return obj.map(noForm);
    }
    if (obj && typeof obj === 'object') {
        const res: any = {};
        Object.keys(obj).forEach((k) => {
            if (k !== 'form') {
                res[k] = noForm(obj[k]);
            }
        });
        return res;
    }
    return obj;
};

export const noloc: Loc = -1;

export const blank: Node = {
    type: 'blank',
    loc: noloc,
};

export const blankAt = (idx: number): Node => ({
    ...blank,
    loc: idx,
});

export const btype = (v: string): Type => ({
    type: 'builtin',
    form: blank,
    name: v,
});

const builtinTypes: Global['builtins']['types'] = {
    uint: [],
    texture: [],
    int: [],
    float: [],
    bool: [],
    string: [],
    bytes: [],
    // 'attachment-handle': [],
    array: [
        { form: blankAt(-2), name: 'Value' },
        {
            form: blankAt(-3),
            name: 'Length',
            default_: {
                type: 'builtin',
                name: 'uint',
                form: blank,
            },
        },
    ],
    map: [
        { form: blankAt(-4), name: 'Key' },
        { form: blankAt(-5), name: 'Value' },
    ],
};

export const basicBuiltins: Global['builtins'] = {
    bidx: -6,
    types: builtinTypes,
    terms: {},
};

export const addBuiltin = (
    builtins: Global['builtins'],
    name: string,
    type: Type,
) => {
    if (builtins.terms[name]) {
        throw new Error(`Dupliocate hash?? ${name}`);
    }
    builtins.terms[name] = type;
    return name;
};

export const builtinFn = (
    builtins: Global['builtins'],

    name: string,
    args: Type[],
    body: Type,
) => {
    return addBuiltin(builtins, name, {
        type: 'fn',
        args: args.map((type) => ({ type, form: blank })),
        body,
        form: blank,
    });
};

const tint = btype('int');
const tuint = btype('uint');
const tfloat = btype('float');
const tbool = btype('bool');
const tstring = btype('string');
const tbytes = btype('bytes');
// const thandle = btype('attachment-handle');

export const fileBase: Type = {
    type: 'record',
    form: blank,
    open: false,
    spreads: [],
    entries: [
        {
            name: 'name',
            value: tstring,
        },
        {
            name: 'mime',
            value: tstring,
        },
    ],
};

export const extendRecord = (
    t: TRecord,
    entries: TRecord['entries'],
): TRecord => ({
    ...t,
    entries: t.entries.concat(entries),
});

export const fileLazy = extendRecord(fileBase, [
    { name: 'data', value: tbytes },
]);

export const imageFileBase = extendRecord(fileBase, [
    { name: 'width', value: tuint },
    { name: 'height', value: tuint },
]);

export const imageFileLazy = extendRecord(imageFileBase, [
    { name: 'data', value: tbytes },
]);

export const bfn = (name: string, args: Type[], body: Type) => {
    return builtinFn(basicBuiltins, name, args, body);
};

['<', '>', '<=', '>=', '==', '!='].map((name) => {
    bfn(`int/` + name, [tint, tint], tbool);
    bfn(`uint/` + name, [tuint, tuint], tbool);
    bfn(`float/` + name, [tfloat, tfloat], tbool);
});
['+', '-', '*', '/'].map((name) => {
    bfn(`int/` + name, [tint, tint], tint);
    bfn(`uint/` + name, [tuint, tuint], tuint);
    bfn(`float/` + name, [tfloat, tfloat], tfloat);
});

bfn('bool/||', [tbool, tbool], tbool);
bfn('bool/&&', [tbool, tbool], tbool);
bfn('bool/==', [tbool, tbool], tbool);
bfn('int/toString', [tint], tstring);
bfn('int/parse', [tstring], {
    type: 'union',
    form: blank,
    open: false,
    items: [
        { type: 'tag', form: blank, name: 'Some', args: [tint] },
        { type: 'tag', name: 'None', form: blank, args: [] },
    ],
});
bfn('bool/toString', [tbool], tstring);
bfn('string/has-prefix?', [tstring, tstring], tbool);
bfn('string/split', [tstring, tstring], {
    type: 'apply',
    target: { type: 'builtin', form: blank, name: 'array' },
    form: blank,
    args: [tstring],
});
bfn('string/trim', [tstring], tstring);

const tloc = (v: number): Type => ({ type: 'local', form: blank, sym: v });

const targ1 = basicBuiltins.bidx--;
const targ2 = basicBuiltins.bidx--;
const targ3 = basicBuiltins.bidx--;
addBuiltin(basicBuiltins, 'array/reduce', {
    type: 'tfn',
    args: [
        { form: blankAt(targ1), name: 'Input', sym: targ1 },
        { form: blankAt(targ2), name: 'Output', sym: targ2 },
        {
            form: blankAt(targ3),
            name: 'ArrayLen',
            bound: btype('uint'),
            sym: targ3,
        },
    ],
    body: {
        type: 'fn',
        args: [
            {
                type: {
                    type: 'apply',
                    target: { type: 'builtin', form: blank, name: 'array' },
                    form: blank,
                    args: [tloc(targ1), tloc(targ3)],
                },
                form: blank,
            },
            { type: tloc(targ2), form: blank },
            {
                type: {
                    type: 'fn',
                    form: blank,
                    args: [
                        { type: tloc(targ1), form: blank },
                        { type: tloc(targ2), form: blank },
                    ],
                    body: tloc(targ2),
                },
                form: blank,
            },
        ],
        body: tloc(targ2),
        form: blank,
    },
    form: blank,
});

const marg1 = basicBuiltins.bidx--;
const marg2 = basicBuiltins.bidx--;

const record = (entries: TRecord['entries']): TRecord => ({
    type: 'record',
    entries,
    form: { type: 'blank', loc: noloc },
    open: false,
    spreads: [],
});

const mapGet: Type = {
    type: 'tfn',
    args: [
        { form: blankAt(marg1), name: 'Key', sym: marg1 },
        { form: blankAt(marg2), name: 'Value', sym: marg2 },
    ],
    body: {
        type: 'fn',
        args: [
            {
                name: 'target',
                form: blank,
                type: {
                    type: 'apply',
                    target: { type: 'builtin', form: blank, name: 'map' },
                    form: blank,
                    args: [tloc(marg1), tloc(marg2)],
                },
            },
            { type: tloc(marg1), form: blank, name: 'key' },
        ],
        body: {
            type: 'union',
            form: blank,
            open: false,
            items: [
                { type: 'tag', name: 'Some', args: [tloc(marg2)], form: blank },
                { type: 'tag', name: 'None', args: [], form: blank },
            ],
        },
        form: blank,
    },
    form: blank,
};

addBuiltin(basicBuiltins, 'map/get', mapGet);
addBuiltin(basicBuiltins, 'map/[]', mapGet);

const fparg1 = basicBuiltins.bidx--;
const fparg2 = basicBuiltins.bidx--;

addBuiltin(basicBuiltins, 'map/from-pairs', {
    type: 'tfn',
    args: [
        { form: blankAt(fparg1), name: 'Key', sym: fparg1 },
        { form: blankAt(fparg2), name: 'Value', sym: fparg2 },
    ],
    body: {
        type: 'fn',
        form: blank,
        args: [
            {
                type: {
                    type: 'apply',
                    target: { type: 'builtin', form: blank, name: 'array' },
                    form: blank,
                    args: [
                        {
                            type: 'record',
                            entries: [
                                { name: '0', value: tloc(fparg1) },
                                { name: '1', value: tloc(fparg2) },
                            ],
                            form: blank,
                            open: false,
                            spreads: [],
                        },
                    ],
                },
                form: blank,
            },
        ],
        body: {
            type: 'apply',
            target: { type: 'builtin', form: blank, name: 'map' },
            form: blank,
            args: [tloc(fparg1), tloc(fparg2)],
        },
    },
    form: blank,
});

// We want it to be generic, which is the trick
// and ... at this point, do we have to actually do a type
// system?
// bfn(
//     basicBuiltins,
//     'reduce',
// )

const vec2 = record([
    { name: 'x', value: tfloat },
    { name: 'y', value: tfloat },
]);
const vec4 = record([
    { name: 'x', value: tfloat },
    { name: 'y', value: tfloat },
    { name: 'z', value: tfloat },
    { name: 'w', value: tfloat },
]);

bfn('float/fract', [tfloat], tfloat);
bfn('float/sin', [tfloat], tfloat);
bfn('vec2/dot', [vec2, vec2], tfloat);
bfn('vec2/length', [vec2], tfloat);
bfn('texture/[]', [btype('texture'), vec2], vec4);

addBuiltin(basicBuiltins, 'float/PI', tfloat);

const darg = basicBuiltins.bidx--;
addBuiltin(basicBuiltins, 'debug/toString', {
    type: 'tfn',
    args: [{ form: blankAt(darg), name: 'Value', sym: darg }],
    body: {
        type: 'fn',
        args: [
            { type: { type: 'local', sym: darg, form: blank }, form: blank },
        ],
        body: tstring,
        form: blank,
    },
    form: blank,
});

const jarg = basicBuiltins.bidx--;
addBuiltin(basicBuiltins, 'json/encode', {
    type: 'tfn',
    args: [{ form: blankAt(jarg), name: 'Value', sym: jarg }],
    body: {
        type: 'fn',
        args: [
            { type: { type: 'local', sym: jarg, form: blank }, form: blank },
        ],
        body: tstring,
        form: blank,
    },
    form: blank,
});

const jdarg = basicBuiltins.bidx--;
addBuiltin(basicBuiltins, 'json/decode', {
    type: 'tfn',
    args: [{ form: blankAt(jdarg), name: 'Value', sym: jdarg }],
    body: {
        type: 'fn',
        args: [{ type: tstring, form: blank }],
        body: { type: 'local', sym: jdarg, form: blank },
        form: blank,
    },
    form: blank,
});

const eno: Type = { type: 'union', open: true, form: blank, items: [] };

const whEffects = basicBuiltins.bidx--;
const whResult = basicBuiltins.bidx--;
const whHandled = basicBuiltins.bidx--;
const whFinal = basicBuiltins.bidx--;
addBuiltin(basicBuiltins, 'task/withHandler', {
    type: 'tfn',
    args: [
        {
            form: blankAt(whEffects),
            name: 'Effects',
            bound: eno,
            sym: whEffects,
        },
        { form: blankAt(whResult), name: 'Result', sym: whResult },
        {
            form: blankAt(whHandled),
            name: 'Handled',
            bound: eno,
            sym: whHandled,
        },
        { form: blankAt(whFinal), name: 'Final', sym: whFinal },
    ],
    body: {
        type: 'fn',
        args: [
            {
                name: 'task',
                form: blank,
                type: {
                    type: 'task',
                    effects: { type: 'local', sym: whEffects, form: blank },
                    result: { type: 'local', sym: whResult, form: blank },
                    extraReturnEffects: {
                        type: 'local',
                        sym: whHandled,
                        form: blank,
                    },
                    form: blank,
                },
            },
            {
                name: 'handler',
                form: blank,
                type: {
                    type: 'fn',
                    args: [
                        {
                            name: 'input',
                            form: blank,
                            type: {
                                type: 'task',
                                effects: {
                                    type: 'union',
                                    form: blank,
                                    open: false,
                                    items: [
                                        {
                                            type: 'local',
                                            sym: whEffects,
                                            form: blank,
                                        },
                                        {
                                            type: 'local',
                                            sym: whHandled,
                                            form: blank,
                                        },
                                    ],
                                },
                                form: blank,
                                result: {
                                    type: 'local',
                                    sym: whResult,
                                    form: blank,
                                },
                            },
                        },
                    ],
                    body: {
                        type: 'task',
                        form: blank,
                        effects: { type: 'local', sym: whEffects, form: blank },
                        result: { type: 'local', sym: whFinal, form: blank },
                    },
                    form: blank,
                },
            },
        ],
        body: {
            type: 'task',
            form: blank,
            effects: { type: 'local', sym: whEffects, form: blank },
            result: { type: 'local', sym: whFinal, form: blank },
        },
        form: blank,
    },
    form: blank,
});

/*
task/andThen
(fn<firstEffects:[..] secondEffects:[..] firstResult secondResult>
    [a:(@task firstEffects firstResult) b:(fn [res:firstResult] (@task secondEffects secondResult))]
    (@task [firstEffects secondEffects] secondResult))

task/withHandler
(fn<Effects:[..] Result Handled:[..] Final>
    [task:(@task Effects Result Handled)
     handler:(fn [input:(@task [Effects Handled] Result)] (@task Effects Final))]
    (@task Effects Final))


(defnrec alwaysRead<Inner:[..] R> [readResponse:string task:(@task [Read Inner] R)]:(@task Inner R)
    (switch task
        ('Return result) ('Result result)
        ('Read _ k) (@recur<Inner R> readResponse (k readResponse))
        otherwise (withHandler<Inner R Read R>
            otherwise
            (fn [task:(@task [Inner Read] R)] (@recur<Inner R> readResponse task)))))

(defn alwaysRead<Inner:[..] R> [readResponse:string task:(@task [Read Inner] R)]:(@task Inner R)
    (
        (fnrec [task:(@task [Read Inner] R)]
            (switch task
                ('Return result) ('Result result)
                ('Read _ k) (@recur (k readResponse))
                otherwise (withHandler<Inner R Read R>
                    otherwise
                    (fn [task:(@task [Inner Read] R)] (@recur task))))
    ) task))

(defn alwaysRead<Inner:[..] R> [readResponse:string task:(@task [Read Inner] R)]:(@task Inner R)
    (handle task
        ('Return result) ('Result result)
        ('Read _ k) (@recur (k readResponse))))

Ok but now .. I want ...
*/

export const nil: Expr = {
    type: 'record',
    entries: [],
    spreads: [],
    form: { type: 'list', values: [], loc: noloc },
};

export const any = {
    type: 'any',
    form: { type: 'identifier', text: '𝕌', loc: noloc },
} satisfies Type;

export const none = {
    type: 'none',
    form: { type: 'identifier', text: '⍉', loc: noloc },
} satisfies Type;

export const nilt = {
    type: 'record',
    entries: [],
    open: false,
    spreads: [],
    form: { type: 'list', values: [], loc: noloc },
} satisfies Type;
