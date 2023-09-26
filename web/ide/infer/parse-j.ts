import { Node } from '../../../src/types/cst';
import type { expr } from './j';

export const parse = (
    node: Node,
    errors: { [key: number]: string },
): expr | undefined => {
    switch (node.type) {
        case 'identifier': {
            const num = +node.text;
            if (!isNaN(num)) {
                return { type: 'number', value: num, loc: node.loc };
            }
            if (node.text === 'true' || node.text === 'false') {
                return {
                    type: 'bool',
                    value: node.text === 'true',
                    loc: node.loc,
                };
            }
            if (node.text.startsWith('.')) {
                return {
                    type: 'accessor',
                    id: node.text.slice(1),
                    loc: node.loc,
                };
            }
            return { type: 'identifier', id: node.text, loc: node.loc };
        }
        case 'string':
            return { type: 'string', value: node.first.text, loc: node.loc };
        case 'record': {
            const items: { name: string; value: expr; loc: number }[] = [];
            for (let i = 0; i < node.values.length; i += 2) {
                const name = node.values[i];
                const value = node.values[i + 1];
                if (name.type !== 'identifier') {
                    errors[name.loc] = `record key must be an identifier`;
                    return;
                }
                if (!value) {
                    errors[name.loc] = `record key has no value`;
                    return;
                }
                const v = parse(value, errors);
                if (!v) return;
                items.push({ name: name.text, value: v, loc: name.loc });
            }

            return {
                type: 'record',
                items,
                loc: node.loc,
            };
        }
        case 'list': {
            if (
                node.values.length === 3 &&
                node.values[0].type === 'identifier' &&
                node.values[0].text === 'fn' &&
                node.values[1].type === 'array' &&
                node.values[1].values.every((n) => n.type === 'identifier')
            ) {
                const body = parse(node.values[2], errors);
                if (body == null) return;
                return {
                    type: 'lambda',
                    names: node.values[1].values.map((m) => ({
                        name: (m as Extract<typeof m, { type: 'identifier' }>)
                            .text,
                        loc: m.loc,
                    })),
                    expr: body,
                    loc: node.loc,
                };
            }

            if (
                node.values.length === 4 &&
                node.values[0].type === 'identifier' &&
                node.values[0].text === 'if'
            ) {
                const cond = parse(node.values[1], errors);
                const yes = parse(node.values[2], errors);
                const no = parse(node.values[3], errors);
                return cond && yes && no
                    ? { type: 'if', cond, yes, no, loc: node.loc }
                    : undefined;
            }

            if (
                node.values.length === 3 &&
                node.values[0].type === 'identifier' &&
                node.values[0].text === 'let' &&
                node.values[1].type === 'array' &&
                node.values[1].values.length === 2 &&
                node.values[1].values[0].type === 'identifier'
            ) {
                const name = node.values[1].values[0].text;
                const init = parse(node.values[1].values[1], errors);
                const body = parse(node.values[2], errors);

                return init && body
                    ? {
                          type: 'let',
                          name,
                          init,
                          body,
                          loc: node.loc,
                          nameloc: node.values[1].values[0].loc,
                      }
                    : undefined;
            }

            const values = node.values.map((v) => parse(v, errors));
            return values.every(Boolean)
                ? {
                      type: 'fncall',
                      fn: values[0]!,
                      args: values.slice(1) as expr[],
                      loc: node.loc,
                  }
                : undefined;
        }
    }
    errors[node.loc] = `unhandled node type ${node.type}`;
};
