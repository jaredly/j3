// An intermediate representation

import { Nodes, Node } from '../shared/nodes';

type Format = any;

const refStyle = { type: 'text', style: { fontWeight: 'bold' } };

export const nodeToIR = (
    node: Node,
    // nodes: Nodes,
    formats: Record<number, Format>,
    names: Record<string, Record<number, string>>,
    // selection: any,
) => {
    switch (node.type) {
        case 'id':
            // TODO lookup format
            // if node.ref is populated, format differently
            return {
                type: 'text',
                text: node.ref
                    ? names[node.ref.toplevel][node.ref.loc]
                    : node.text,
                format: formats[node.loc] ?? node.ref ? refStyle : null,
            };

        case 'string': {
            const multi =
                node.first.includes('\n') ||
                node.templates.some((t) => t.suffix.includes('\n'));
            if (multi) {
                return { type: 'multiline' };
            }
            return {
                type: 'horiz',
                items: [
                    { type: 'loc', loc: node.tag },
                    { type: 'punct', text: '"' },
                    // TODO: something about the key handlers
                    // for this text should be different
                    { type: 'text', text: node.first },
                    ...node.templates.flatMap((t) => [
                        { type: 'punct', text: '${' },
                        { type: 'loc', loc: t.expr },
                        { type: 'punct', text: '}' },
                        { type: 'text', text: t.suffix },
                    ]),
                    { type: 'punct', text: '"' },
                ],
            };
        }

        case 'record-access':
            return {
                type: 'switch',
                options: [
                    {
                        type: 'horiz',
                        items: [
                            { type: 'loc', loc: node.target },
                            ...node.items.flatMap((loc) => [
                                { type: 'punct', text: '.' },
                                { type: 'loc', loc },
                            ]),
                        ],
                    },
                    {
                        type: 'vert',
                        items: [
                            { type: 'loc', loc: node.target },
                            {
                                type: 'indent',
                                items: node.items.map((loc) => ({
                                    type: 'horiz',
                                    items: [
                                        { type: 'punct', text: '.' },
                                        { type: 'loc', loc },
                                    ],
                                })),
                            },
                        ],
                    },
                ],
            };
        case 'annot':
            return {
                type: 'horiz',
                items: [
                    { type: 'loc', loc: node.contents },
                    { type: 'punct', text: ':' },
                    { type: 'loc', loc: node.annot },
                ],
            };
        case 'comment':
        case 'spread':
            return {
                type: 'horiz',
                items: [
                    {
                        type: 'punct',
                        text: node.type === 'spread' ? '..' : ';',
                    },
                    { type: 'loc', loc: node.contents },
                ],
            };
    }
};
