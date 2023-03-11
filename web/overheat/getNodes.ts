import { idText } from '../../src/parse/parse';
import { fromMCST, MNode } from '../../src/types/mcst';
import { Attachment } from '../old/Attachment';
import { IdentifierLike2 } from '../old/IdentifierLike';
import { RichText } from '../old/Markdown';
import { RecordText2, replacePath } from '../old/RecordText';
import { StringText2 } from '../old/StringText';
import { updateStore } from '../store';
import { OutputWatcher } from './Output';
import { RenderProps } from './Overheat';
import { ONode } from './types';

export const getNodes = (node: MNode): ONode[] => {
    const nodes = getNodes_(node);
    if (nodes && node.tannot != null) {
        nodes.push(
            { type: 'punct', text: ':', color: 'inherit' },
            {
                type: 'ref',
                id: node.tannot,
                path: { type: 'tannot' },
            },
        );
    }
    return nodes;
};

export const getNodes_ = (node: MNode): ONode[] => {
    switch (node.type) {
        case 'spread':
            return [
                { type: 'blinker', loc: 'start' },
                { type: 'punct', text: '..', color: 'unset' },
                {
                    type: 'ref',
                    id: node.contents,
                    path: { type: 'spread-contents' },
                },
            ];
        case 'recordAccess':
            return [
                {
                    type: 'ref',
                    id: node.target,
                    path: { type: 'record-target' },
                },
                ...node.items.flatMap((id, i): ONode[] => [
                    { type: 'punct', text: '.', color: 'red' },
                    { type: 'ref', id, path: { type: 'attribute', at: i + 1 } },
                ]),
            ];
        case 'record':
            return [
                { type: 'blinker', loc: 'start' },
                { type: 'punct', text: '{', color: 'rainbow' },
                ...withCommas(node.values),
                { type: 'punct', text: '}', color: 'rainbow' },
                { type: 'blinker', loc: 'end' },
            ];
        case 'list':
            return [
                { type: 'blinker', loc: 'start' },
                { type: 'punct', text: '(', color: 'rainbow' },
                ...withCommas(node.values),
                { type: 'punct', text: ')', color: 'rainbow' },
                { type: 'blinker', loc: 'end' },
            ];
        case 'array':
            return [
                { type: 'blinker', loc: 'start' },
                { type: 'punct', text: '[', color: 'rainbow' },
                ...withCommas(node.values),
                { type: 'punct', text: ']', color: 'rainbow' },
                { type: 'blinker', loc: 'end' },
            ];
        case 'identifier':
        case 'tag':
        case 'comment':
        case 'number':
        case 'unparsed':
        case 'blank':
        case 'accessText':
        case 'stringText':
        case 'attachment':
        case 'rich-text':
            return [{ type: 'render', text: idText(node) ?? '' }];
        case 'string':
            return [
                { type: 'blinker', loc: 'start' },
                { type: 'punct', color: 'yellow', text: '"', boldSelect: true },
                { type: 'ref', id: node.first, path: { type: 'text', at: 0 } },
                ...node.templates.flatMap((item, i): ONode[] => [
                    { type: 'punct', text: '${', color: 'yellow' },
                    {
                        type: 'ref',
                        id: item.expr,
                        path: { type: 'expr', at: i + 1 },
                    },
                    { type: 'punct', text: '}', color: 'yellow' },
                    {
                        type: 'ref',
                        id: item.suffix,
                        path: { type: 'text', at: i + 1 },
                    },
                ]),
                { type: 'punct', color: 'yellow', text: '"', boldSelect: true },
                { type: 'blinker', loc: 'end' },
            ];
        default:
            let _: never = node;
            throw new Error(`not handled ${(node as any).type}`);
    }
    // return null;
};
function withCommas(values: number[], space = ' '): ONode[] {
    if (!values.length) {
        return [{ type: 'blinker', loc: 'inside' }];
    }
    return values.flatMap((id, i): ONode[] =>
        i === 0
            ? [{ type: 'ref', id, path: { type: 'child', at: i } }]
            : [
                  { type: 'punct', text: space, color: 'red' },
                  {
                      type: 'ref',
                      id,
                      path: { type: 'child', at: i },
                  },
              ],
    );
}
