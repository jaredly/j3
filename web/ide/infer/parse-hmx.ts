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
        case 'recordAccess':
            if (node.target.type === 'blank') {
                return {
                    type: 'accessor',
                    id: node.items[0].text,
                    loc: node.loc,
                };
            }
            return;
        case 'record': {
            const items: { name: string; value: term; loc: number }[] = [];
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

            return { type: 'record', items, loc: node.loc };
        }
        case 'list': {
            if (
                node.values.length === 3 &&
                node.values[0].type === 'identifier' &&
                node.values[0].text === 'fn' &&
                node.values[1].type === 'array' &&
                node.values[1].values[0].type === 'identifier' &&
                node.values[1].values.every((n) => n.type === 'identifier')
            ) {
                let body = parse(node.values[2], errors);
                if (body == null) return;
                for (let i = node.values[1].values.length - 1; i >= 0; i--) {
                    let name = node.values[1].values[i];
                    if (name.type !== 'identifier') {
                        throw new Error('fn arg not identifier');
                    }
                    body = {
                        type: 'abs',
                        name: name.text,
                        loc: node.loc,
                        body: body!,
                        nameloc: name.loc,
                    };
                }
                return body!;
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

            const values = node.values.map((v) => parse(v, errors));
            if (!values.every(Boolean)) {
                return;
            }
            let res = values[0];
            for (let i = 1; i < values.length; i++) {
                res = {
                    type: 'app',
                    fn: res!,
                    arg: values[i]!,
                    loc: node.loc,
                };
            }
            return res;
        }
    }
    errors[node.loc] = `unhandled node type ${node.type}`;
};
