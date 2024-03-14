import { Display } from '../../../../src/to-ast/library';
import { Node } from '../../../../src/types/cst';
import { jcst, toJCST } from './j-cst';

export type arr<a> = { type: 'cons'; 0: a; 1: arr<a> } | { type: 'nil' };

export const unwrapArray = <a>(v: arr<a>): a[] =>
    v.type === 'nil' ? [] : [v[0], ...unwrapArray(v[1])];

export const wrapArray = <a>(v: Array<a>): arr<a> => {
    let res: arr<a> = { type: 'nil' };
    for (let i = v.length - 1; i >= 0; i--) {
        res = { type: 'cons', 0: v[i], 1: res };
    }
    return res;
};

export const wrapTapp = (v: Array<type_>): type_ => {
    let res: type_ = v[v.length - 1];
    for (let i = v.length - 2; i >= 0; i--) {
        res = { type: 'tapp', 0: v[i], 1: res };
    }
    return res;
};

export const printExpr = (e: expr): string => {
    switch (e.type) {
        case 'estr':
            return `${e[0]}${unwrapArray(e[1])
                .map((item) => `${printExpr(item[0])}${item[1]}`)
                .join('')}`;
        case 'eprim':
            return e[0] + '';
        case 'evar':
            return e[0];
        case 'equot':
            return `(@ ${JSON.stringify(e[0])})`;
        case 'elambda':
            return `(fn [${e[0]}] ${printExpr(e[1])})`;
        case 'eapp':
            return `(${printExpr(e[0])} ${printExpr(e[0])})`;
        case 'elet':
            return `(let [${e[0]} ${printExpr(e[1])}] ${printExpr(e[2])})`;
        case 'ematch':
            return 'match';
    }
};

export type prim =
    // | { type: 'pstr'; 0: string }
    { type: 'pint'; 0: number } | { type: 'pbool'; 0: boolean };
export type expr =
    | { type: 'estr'; 0: string; 1: arr<{ type: ','; 0: expr; 1: string }> }
    | { type: 'eprim'; 0: prim }
    | { type: 'equot'; 0: expr | jcst }
    | { type: 'evar'; 0: string }
    | { type: 'elambda'; 0: string; 1: expr }
    | { type: 'eapp'; 0: expr; 1: expr }
    | { type: 'elet'; 0: string; 1: expr; 2: expr }
    | { type: 'ematch'; 0: expr; 1: arr<{ type: ','; 0: pat; 1: expr }> };
export type pat =
    | { type: 'pany' }
    | { type: 'pvar'; 0: string }
    | { type: 'pstr'; 0: string }
    | { type: 'pprim'; 0: prim }
    | { type: 'pcon'; 0: string; 1: arr<pat> };
export type type_ =
    | { type: 'tvar'; 0: number }
    | { type: 'tapp'; 0: type_; 1: type_ }
    | { type: 'tcon'; 0: string };
export type stmt =
    | {
          type: 'sdeftype';
          0: string;
          1: arr<{ type: ','; 0: string; 1: arr<type_> }>;
      }
    | { type: 'sdef'; 0: string; 1: expr }
    | { type: 'sexpr'; 0: expr; 1: number };

export type node =
    | { type: 'nid'; 0: string }
    | { type: 'nstring'; 0: string }
    | { type: 'nlist'; 0: arr<node> };

type Errors = { [loc: number]: string[] };
export type Ctx = { errors: Errors; display: Display };

const addError = (errors: Errors, loc: number, error: string) => {
    if (errors[loc] == null) {
        errors[loc] = [error];
    } else {
        errors[loc].push(error);
    }
};

export const parseStmt = (node: Node, ctx: Ctx): stmt | undefined => {
    switch (node.type) {
        case 'comment':
            return;
        case 'list':
            const values = filterBlanks(node.values);
            if (values.length && values[0].type === 'identifier') {
                switch (values[0].text) {
                    case 'deftype': {
                        if (values.length < 2) return;
                        const vvalues: {
                            type: ',';
                            0: string;
                            1: arr<type_>;
                        }[] = [];
                        for (let item of filterBlanks(values.slice(2))) {
                            if (
                                item.type !== 'list' ||
                                item.values.length < 1 ||
                                item.values[0].type !== 'identifier'
                            ) {
                                addError(
                                    ctx.errors,
                                    item.loc,
                                    'invalid type constructor' +
                                        JSON.stringify(item),
                                );
                                continue;
                            }
                            const args = [];
                            for (let arg of item.values.slice(1)) {
                                const p = parseType(arg, ctx);
                                if (p) {
                                    args.push(p);
                                }
                            }
                            vvalues.push({
                                type: ',',
                                0: item.values[0].text,
                                1: wrapArray(args),
                            });
                        }
                        let name;
                        if (values[1].type === 'identifier') {
                            name = values[1].text;
                        } else if (
                            values[1].type === 'list' &&
                            values[1].values.length >= 1 &&
                            values[1].values[0].type === 'identifier'
                        ) {
                            name = values[1].values[0].text;
                        } else {
                            addError(
                                ctx.errors,
                                values[1].loc,
                                'Unable to determine name for deftype',
                            );
                            return;
                        }
                        return {
                            type: 'sdeftype',
                            0: name,
                            1: wrapArray(vvalues),
                        };
                    }
                    case 'def': {
                        if (
                            values.length < 2 ||
                            values[1].type !== 'identifier'
                        ) {
                            addError(ctx.errors, node.loc, 'def needs id');
                            return;
                        }
                        if (values.length !== 3) {
                            addError(
                                ctx.errors,
                                node.loc,
                                'invalid def - need 3 items, not ' +
                                    values.length,
                            );
                            return;
                        }
                        const body = parseExpr(values[2], ctx);
                        if (!body) {
                            addError(
                                ctx.errors,
                                values[2].loc,
                                'failed to parse body',
                            );
                            return;
                        }
                        return {
                            type: 'sdef',
                            0: values[1].text,
                            1: body,
                        };
                    }
                    case 'defn': {
                        if (
                            values.length < 2 ||
                            values[1].type !== 'identifier'
                        ) {
                            addError(ctx.errors, node.loc, 'def needs id');
                            return;
                        }
                        if (values.length !== 4) {
                            addError(
                                ctx.errors,
                                node.loc,
                                'invalid defn - need 4 items, not ' +
                                    values.length,
                            );
                            return;
                        }
                        if (
                            values[2].type !== 'array' ||
                            values[2].values.some(
                                (t) => t.type !== 'identifier',
                            )
                        ) {
                            addError(
                                ctx.errors,
                                values[2].loc,
                                'invalid argument decl',
                            );
                            return;
                        }
                        const args: string[] = values[2].values.map(
                            (t) =>
                                (t as Extract<Node, { type: 'identifier' }>)
                                    .text,
                        );
                        let body = parseExpr(values[3], ctx);
                        if (!body) return;

                        for (let i = args.length - 1; i >= 0; i--) {
                            body = { type: 'elambda', 0: args[i], 1: body };
                        }

                        return {
                            type: 'sdef',
                            0: values[1].text,
                            1: body,
                        };
                    }
                }
            }
    }
    const inner = parseExpr(node, ctx);
    return inner ? { type: 'sexpr', 0: inner, 1: node.loc } : undefined;
};

// Don't need this until we can self-host
export const parseType = (node: Node, errors: Errors): type_ | void => {
    switch (node.type) {
        case 'identifier':
            return { type: 'tcon', 0: node.text };
        case 'list': {
            const args: type_[] = [];
            for (const arg of filterBlanks(node.values).slice(1)) {
                const t = parseType(arg, errors);
                if (t) {
                    args.push(t);
                }
            }
            return wrapTapp(args);
        }
    }
};

export const parsePat = (node: Node, errors: Errors): pat | void => {
    if (node.type === 'string') {
        if (node.templates.length) {
            addError(errors, node.loc, 'No templates in patterns');
            return;
        }
        return { type: 'pstr', '0': node.first.text };
    }
    if (node.type === 'identifier') {
        if (node.text === '_') {
            return { type: 'pany' };
        }
        if (node.text === 'true' || node.text === 'false') {
            return {
                type: 'pprim',
                0: { type: 'pbool', 0: node.text === 'true' },
            };
        }
        const v = +node.text;
        if ('' + Math.floor(v) === node.text) {
            return { type: 'pprim', 0: { type: 'pint', 0: v } };
        }
        return { type: 'pvar', 0: node.text };
    }
    if (
        node.type === 'list' &&
        node.values.length > 0 &&
        node.values[0].type === 'identifier'
    ) {
        const args: pat[] = [];
        for (const arg of filterBlanks(node.values).slice(1)) {
            const parsed = parsePat(arg, errors);
            if (!parsed) continue;
            args.push(parsed);
        }
        return { type: 'pcon', 0: node.values[0].text, 1: wrapArray(args) };
    }
    if (node.type === 'array') {
        if (!node.values.length) {
            return { type: 'pcon', 0: 'nil', 1: { type: 'nil' } };
        }
        const v = filterBlanks(node.values);
        if (v.length === 1) {
            const inner = parsePat(v[0], errors);
            if (!inner) return;
            return {
                type: 'pcon',
                0: 'cons',
                1: wrapArray([
                    inner,
                    { type: 'pcon', 0: 'nil', 1: { type: 'nil' } },
                ]),
            };
        }
        let last: pat = { type: 'pcon', 0: 'nil', 1: { type: 'nil' } };
        let i = v.length - 1;
        const ln = v[i];
        if (ln.type === 'spread') {
            i--;
            const pat = parsePat(ln.contents, errors);
            if (pat) {
                last = pat;
            }
        }
        for (; i >= 0; i--) {
            const node = v[i];
            if (node.type === 'spread') {
                addError(errors, node.loc, 'Cant have a non-terminal spread');
                continue;
            }
            const pat = parsePat(node, errors);
            if (pat) {
                last = { type: 'pcon', 0: 'cons', 1: wrapArray([pat, last]) };
            }
        }
        return last;
    }
    addError(errors, node.loc, 'unknown pat ' + JSON.stringify(node));
    // console.error('bad bad', node);
};

export const parseExpr = (node: Node, ctx: Ctx): expr | void => {
    switch (node.type) {
        case 'identifier': {
            const num = +node.text;
            if (!isNaN(num)) {
                return { type: 'eprim', 0: { type: 'pint', 0: num } };
            }
            if (node.text === 'true' || node.text === 'false') {
                return {
                    type: 'eprim',
                    0: { type: 'pbool', 0: node.text === 'true' },
                };
            }
            return { type: 'evar', 0: node.text };
        }
        case 'string':
            const parsed = node.templates.map((t) => parseExpr(t.expr, ctx));
            if (parsed.some((m) => !m)) {
                return;
            }
            return {
                type: 'estr',
                0: node.first.text,
                1: wrapArray(
                    node.templates.map((t, i) => ({
                        type: ',',
                        0: parsed[i]!,
                        1: t.suffix.text,
                    })),
                ),
            };
        case 'list': {
            const values = filterBlanks(node.values);
            if (
                values.length === 3 &&
                values[0].type === 'identifier' &&
                values[0].text === 'fn'
            ) {
                if (values[1].type !== 'array') {
                    addError(ctx.errors, values[1].loc, 'expected array');
                    return;
                }
                const args: string[] = [];
                for (let arg of values[1].values) {
                    if (arg.type === 'identifier') {
                        args.push(arg.text);
                    } else {
                        addError(ctx.errors, arg.loc, 'expected ident');
                    }
                }
                let body = parseExpr(values[2], ctx);
                if (!body) return;
                for (let i = args.length - 1; i >= 0; i--) {
                    body = { type: 'elambda', 0: args[i], 1: body };
                }
                return body;
            }

            // (let [...bindings] body)
            if (
                values.length === 3 &&
                values[0].type === 'identifier' &&
                values[0].text === 'let'
            ) {
                if (values[1].type !== 'array') {
                    addError(
                        ctx.errors,
                        values[1].loc,
                        'expected buinding array',
                    );
                    return;
                }
                let body = parseExpr(values[2], ctx);
                if (!body) return;
                const bv = filterBlanks(values[1].values);
                for (
                    let i = Math.floor(bv.length / 2) * 2 - 2;
                    i >= 0;
                    i -= 2
                ) {
                    const id = bv[i];
                    const value = parseExpr(bv[i + 1], ctx);
                    if (!value) continue;
                    if (id.type === 'identifier') {
                        body = { type: 'elet', 0: id.text, 1: value, 2: body };
                    } else {
                        const pat = parsePat(id, ctx.errors);
                        if (!pat) continue;
                        body = {
                            type: 'ematch',
                            0: value,
                            1: wrapArray([{ type: ',', 0: pat, 1: body }]),
                        };
                    }
                }
                return body;
            }

            // (match target ...cases)
            if (
                values.length > 2 &&
                values[0].type === 'identifier' &&
                values[0].text === 'match'
            ) {
                const target = parseExpr(values[1], ctx);
                if (!target) return;
                const cases: { type: ','; 0: pat; 1: expr }[] = [];
                for (let i = 2; i < values.length - 1; i += 2) {
                    const pat = parsePat(values[i], ctx.errors);
                    const body = parseExpr(values[i + 1], ctx);
                    if (!pat) continue;
                    if (!body) continue;
                    cases.push({ type: ',', 0: pat, 1: body });
                }
                return { type: 'ematch', 0: target, 1: wrapArray(cases) };
            }

            if (
                values.length === 2 &&
                values[0].type === 'identifier' &&
                values[0].text === '@'
            ) {
                const inner = parseExpr(values[1], ctx);
                return inner ? { type: 'equot', 0: inner } : undefined;
            }

            if (
                values.length === 2 &&
                values[0].type === 'identifier' &&
                values[0].text === '@@'
            ) {
                const inner = toJCST(values[1]);
                return inner ? { type: 'equot', 0: inner } : undefined;
            }

            if (
                values.length === 2 &&
                values[0].type === 'identifier' &&
                values[0].text === "@@'"
            ) {
                const inner = toJCST(values[1]);
                return inner
                    ? {
                          type: 'eapp',
                          0: {
                              type: 'eapp',
                              0: { type: 'evar', 0: ',' },
                              1: { type: 'equot', 0: inner },
                          },
                          1: { type: 'eprim', 0: { type: 'pint', 0: 42 } },
                      }
                    : undefined;
            }

            // if (values.length > 1 && values[0].type === 'identifier' && values[0].text === ',') {
            //     const inner = values.slice(1).map(p => parseExpr(p, ctx))
            //     if (!inner.every(Boolean)) return
            //     return {type: 'eapp'}
            // }

            // (a-fn ...args)
            if (!values.length) {
                addError(ctx.errors, node.loc, 'empty list');
                return;
            }
            let fn = parseExpr(values[0], ctx);
            if (!fn) return;
            for (let i = 1; i < values.length; i++) {
                const arg = parseExpr(values[i], ctx);
                if (!arg) return;
                fn = { type: 'eapp', 0: fn, 1: arg };
            }
            return fn;
        }
        case 'array':
            const v = filterBlanks(node.values);
            if (v.length === 0) {
                return { type: 'evar', 0: 'nil' };
            }
            let res: expr = { type: 'evar', 0: 'nil' };
            for (let i = v.length - 1; i >= 0; i--) {
                const node = v[i];
                if (i === v.length - 1) {
                    if (node.type === 'spread') {
                        const spread = parseExpr(node.contents, ctx);
                        if (!spread) return;
                        res = spread;
                    } else {
                        const expr = parseExpr(node, ctx);
                        if (!expr) return;
                        res = {
                            type: 'eapp',
                            0: {
                                type: 'eapp',
                                0: { type: 'evar', 0: 'cons' },
                                1: expr,
                            },
                            1: res,
                        };
                    }
                } else {
                    const expr = parseExpr(node, ctx);
                    if (!expr) return;
                    res = {
                        type: 'eapp',
                        0: {
                            type: 'eapp',
                            0: { type: 'evar', 0: 'cons' },
                            1: expr,
                        },
                        1: res,
                    };
                }
            }
            return res;
    }
    addError(ctx.errors, node.loc, 'unexpected expr ' + JSON.stringify(node));
};
export function filterBlanks(arg0: Node[]) {
    return arg0.filter(
        (a) =>
            a.type !== 'blank' &&
            a.type !== 'comment' &&
            a.type !== 'rich-text',
    );
}
