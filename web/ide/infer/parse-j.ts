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
                return { type: 'number', value: num };
            }
            if (node.text === 'true' || node.text === 'false') {
                return { type: 'number', value: 0 };
            }
            return { type: 'identifier', id: node.text };
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
                    names: node.values[1].values.map(
                        (m) =>
                            (m as Extract<typeof m, { type: 'identifier' }>)
                                .text,
                    ),
                    expr: body,
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
                    ? { type: 'let', name, init, body }
                    : undefined;
            }

            const values = node.values.map((v) => parse(v, errors));
            return values.every(Boolean)
                ? {
                      type: 'fncall',
                      fn: values[0]!,
                      args: values.slice(1) as expr[],
                  }
                : undefined;
        }
    }
};
