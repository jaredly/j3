import { Node } from '../../../../src/types/cst';

export type prim =
    | { type: 'pstr'; 0: string }
    | { type: 'pint'; 0: number }
    | { type: 'pbool'; 0: boolean };
export type expr =
    | { type: 'eprim'; 0: prim }
    | { type: 'evar'; 0: string }
    | { type: 'elambda'; 0: string; 1: expr }
    | { type: 'eapp'; 0: expr; 1: expr }
    | { type: 'elet'; 0: string; 1: expr; 2: expr }
    | { type: 'ematch'; 0: expr; 1: { type: 'tuple'; 0: pat; 1: expr }[] };
export type pat =
    | { type: 'pany' }
    | { type: 'pvar'; 0: string }
    | { type: 'pcon'; 0: string; 1: string[] };
export type type_ =
    | { type: 'tvar'; 0: number }
    | { type: 'tapp'; 0: type_; 1: type_ }
    | { type: 'tcon'; 0: string };
export type stmt =
    | {
          type: 'sdeftype';
          0: string;
          1: { type: 'tuple'; 0: string; 1: type_[] }[];
      }
    | { type: 'sdef'; 0: string; 1: expr }
    | { type: 'sexpr'; 0: expr };

export type node =
    | { type: 'nid'; 0: string }
    | { type: 'nstring'; 0: string }
    | { type: 'nlist'; 0: node[] };

// type Shape = {type: 'identifier', text?: string} | {type: 'array', length?: number} | {type: 'list', length?: number}
// const listShape = (shape: Shape[], nodes: Node[]) => {
// }

type Errors = { [loc: number]: string };
export const parseStmt = (node: Node, errors: Errors): stmt | undefined => {
    switch (node.type) {
        case 'comment':
            return;
        case 'list':
            const values = filterBlanks(node.values);
            if (
                values.length &&
                values[0].type === 'identifier' &&
                values[1].type === 'identifier'
            ) {
                switch (values[0].text) {
                    case 'deftype': {
                        const vvalues: Extract<stmt, { type: 'sdeftype' }>[1] =
                            [];
                        for (let item of filterBlanks(values.slice(2))) {
                            if (
                                item.type !== 'list' ||
                                item.values.length < 1 ||
                                item.values[0].type !== 'identifier'
                            ) {
                                errors[item.loc] =
                                    'invalid type constructor' +
                                    JSON.stringify(item);
                                continue;
                            }
                            const args = [];
                            for (let arg of item.values.slice(1)) {
                                const p = parseType(arg, errors);
                                if (p) {
                                    args.push(p);
                                }
                            }
                            vvalues.push({
                                type: 'tuple',
                                0: item.values[0].text,
                                1: args,
                            });
                        }
                        return {
                            type: 'sdeftype',
                            0: values[1].text,
                            1: vvalues,
                        };
                    }
                    case 'def': {
                        if (values.length !== 3) {
                            errors[node.loc] =
                                'invalid def - need 3 items, not ' +
                                values.length;
                            return;
                        }
                        const body = parseExpr(values[2], errors);
                        if (!body) {
                            errors[values[2].loc] = 'failed to parse body';
                            return;
                        }
                        return {
                            type: 'sdef',
                            0: values[1].text,
                            1: body,
                        };
                    }
                    case 'defn': {
                        if (values.length !== 4) {
                            errors[node.loc] =
                                'invalid defn - need 4 items, not ' +
                                values.length;
                            return;
                        }
                        if (
                            values[2].type !== 'array' ||
                            values[2].values.some(
                                (t) => t.type !== 'identifier',
                            )
                        ) {
                            errors[values[2].loc] = 'invalid argument decl';
                            return;
                        }
                        const args: string[] = values[2].values.map(
                            (t) =>
                                (t as Extract<Node, { type: 'identifier' }>)
                                    .text,
                        );
                        let body = parseExpr(values[3], errors);
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
    errors[node.loc] = 'unknown statement ' + JSON.stringify(node);
};

// Don't need this until we can self-host
export const parseType = (node: Node, errors: Errors): type_ | void => {
    switch (node.type) {
        case 'identifier':
            return { type: 'tcon', 0: node.text };
        case 'list':
            return;
    }
};

export const parsePat = (node: Node, errors: Errors): pat | void => {
    if (node.type === 'identifier') {
        if (node.text === '_') {
            return { type: 'pany' };
        }
        return { type: 'pvar', 0: node.text };
    }
    if (
        node.type === 'list' &&
        node.values.length > 0 &&
        node.values[0].type === 'identifier'
    ) {
        const args: string[] = [];
        for (const arg of filterBlanks(node.values).slice(1)) {
            if (arg.type !== 'identifier') {
                errors[arg.loc] =
                    'only idents allowed in nested patterns at the moment not ' +
                    arg.type +
                    ' ' +
                    JSON.stringify(arg);
                continue;
            }
            args.push(arg.text);
            // const p = parsePat(arg, errors)
            // if (!p) continue
        }
        return { type: 'pcon', 0: node.values[0].type, 1: args };
    }
    if (node.type === 'array') {
        if (!node.values.length) {
            return { type: 'pcon', 0: 'nil', 1: [] };
        }
        if (
            node.values.length === 2 &&
            node.values[0].type === 'identifier' &&
            node.values[1].type === 'spread' &&
            node.values[1].contents.type === 'identifier'
        ) {
            return {
                type: 'pcon',
                0: 'cons',
                1: [node.values[0].text, node.values[1].contents.text],
            };
        }
    }
    errors[node.loc] = 'unknown pat ' + JSON.stringify(node);
};

export const parseExpr = (node: Node, errors: Errors): expr | void => {
    switch (node.type) {
        case 'identifier': {
            const num = +node.text;
            if (isNaN(num)) {
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
            return { type: 'eprim', 0: { type: 'pstr', 0: node.first.text } };
        case 'list': {
            // (fn [args] body)
            if (
                node.values.length === 3 &&
                node.values[0].type === 'identifier' &&
                node.values[0].text === 'fn'
            ) {
                if (node.values[1].type !== 'array') {
                    errors[node.values[1].loc] = 'expected array';
                    return;
                }
                const args: string[] = [];
                for (let arg of node.values[1].values) {
                    if (arg.type === 'identifier') {
                        args.push(arg.text);
                    } else {
                        errors[arg.loc] = 'expected ident';
                    }
                }
                let body = parseExpr(node.values[2], errors);
                if (!body) return;
                for (let i = args.length - 1; i >= 0; i--) {
                    body = { type: 'elambda', 0: args[i], 1: body };
                }
                return body;
            }

            // (let [...bindings] body)
            if (
                node.values.length === 3 &&
                node.values[0].type === 'identifier' &&
                node.values[0].text === 'let'
            ) {
                if (node.values[1].type !== 'array') {
                    errors[node.values[1].loc] = 'expected buinding array';
                    return;
                }
                let body = parseExpr(node.values[2], errors);
                if (!body) return;
                for (
                    let i =
                        Math.floor(node.values[1].values.length / 2) * 2 - 2;
                    i >= 0;
                    i -= 2
                ) {
                    const id = node.values[1].values[i];
                    const value = parseExpr(
                        node.values[1].values[i + 1],
                        errors,
                    );
                    if (!value) continue;
                    if (id.type === 'identifier') {
                        body = { type: 'elet', 0: id.text, 1: value, 2: body };
                    } else {
                        const pat = parsePat(id, errors);
                        if (!pat) continue;
                        body = {
                            type: 'ematch',
                            0: value,
                            1: [{ type: 'tuple', 0: pat, 1: body }],
                        };
                    }
                }
                return body;
            }

            // (match target ...cases)
            if (
                node.values.length > 2 &&
                node.values[0].type === 'identifier' &&
                node.values[0].text === 'match'
            ) {
                const target = parseExpr(node.values[1], errors);
                if (!target) return;
                const cases: Extract<expr, { type: 'ematch' }>[1] = [];
                for (let i = 2; i < node.values.length - 1; i += 2) {
                    const pat = parsePat(node.values[i], errors);
                    const body = parseExpr(node.values[i + 1], errors);
                    if (!pat) continue;
                    if (!body) continue;
                    cases.push({ type: 'tuple', 0: pat, 1: body });
                }
                return { type: 'ematch', 0: target, 1: cases };
            }

            // (a-fn ...args)
            if (!node.values.length) {
                errors[node.loc] = 'empty list';
                return;
            }
            let fn = parseExpr(node.values[0], errors);
            if (!fn) return;
            for (let i = 1; i < node.values.length; i++) {
                const arg = parseExpr(node.values[i], errors);
                if (!arg) return;
                fn = { type: 'eapp', 0: fn, 1: arg };
            }
            return fn;
        }
    }
    errors[node.loc] = 'unexpected expr ' + JSON.stringify(node);
};
function filterBlanks(arg0: Node[]) {
    return arg0.filter((a) => a.type !== 'blank' && a.type !== 'comment');
}
