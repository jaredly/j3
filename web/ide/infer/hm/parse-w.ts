import { Node } from '../../../../src/types/cst';
import type { Exp } from './types-w';

export const parse = (
    node: Node,
    errors: { [key: number]: string },
): Exp | undefined => {
    switch (node.type) {
        case 'identifier': {
            const num = +node.text;
            if (!isNaN(num)) {
                return {
                    type: 'lit',
                    value: { type: 'number', value: num },
                    loc: node.loc,
                };
            }
            if (node.text === 'true' || node.text === 'false') {
                return {
                    type: 'lit',
                    value: { type: 'bool', value: node.text === 'true' },
                    loc: node.loc,
                };
            }
            return { type: 'var', name: node.text, loc: node.loc };
        }
        case 'list': {
            if (
                node.values.length === 3 &&
                node.values[0].type === 'identifier' &&
                node.values[0].text === 'fn' &&
                node.values[1].type === 'array' &&
                node.values[1].values.length === 1 &&
                node.values[1].values[0].type === 'identifier'
            ) {
                const body = parse(node.values[2], errors);
                if (body == null) return;
                return {
                    type: 'fn',
                    name: node.values[1].values[0].text,
                    loc: node.loc,
                    body,
                };
            }

            if (node.values.length === 2) {
                const fn = parse(node.values[0], errors);
                const arg = parse(node.values[1], errors);
                return fn && arg
                    ? { type: 'app', fn, arg, loc: node.loc }
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
                          body,
                          init,
                          name,
                          loc: node.loc,
                      }
                    : undefined;
            }
        }
    }
};
