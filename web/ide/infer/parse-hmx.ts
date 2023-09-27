import { Node } from '../../../src/types/cst';
import { term } from './hmx';

export const parse = (
    node: Node,
    errors: { [key: number]: string },
): term | undefined => {
    switch (node.type) {
        case 'identifier': {
            const num = +node.text;
            if (!isNaN(num)) {
                return {
                    type: 'const',
                    loc: node.loc,
                    value: {
                        type: 'number',
                        value: num,
                    },
                };
            }
            if (node.text === 'true' || node.text === 'false') {
                return {
                    type: 'const',
                    value: { type: 'bool', value: node.text === 'true' },
                    loc: node.loc,
                };
            }
            return { type: 'var', name: node.text, loc: node.loc };
        }
        case 'string':
            return {
                type: 'const',
                loc: node.loc,
                value: { type: 'string', value: node.first.text },
            };
        case 'list': {
            if (
                node.values.length === 3 &&
                node.values[0].type === 'identifier' &&
                node.values[0].text === 'fn' &&
                node.values[1].type === 'array' &&
                node.values[1].values[0].type === 'identifier' &&
                node.values[1].values.every((n) => n.type === 'identifier')
            ) {
                const body = parse(node.values[2], errors);
                if (body == null) return;
                return {
                    type: 'abs',
                    name: node.values[1].values[0].text,
                    loc: node.loc,
                    body,
                };
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
                      }
                    : undefined;
            }

            const values = node.values.map((v) => parse(v, errors));
            return values.every(Boolean)
                ? {
                      type: 'app',
                      fn: values[0]!,
                      arg: values[1]!,
                      loc: node.loc,
                  }
                : undefined;
        }
    }
    errors[node.loc] = `unhandled node type ${node.type}`;
};
