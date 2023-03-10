import { fromMCST, MNode } from '../../src/types/mcst';
import { Attachment } from '../old/Attachment';
import { IdentifierLike2 } from '../old/IdentifierLike';
import { RichText } from '../old/Markdown';
import { RecordText2, replacePath } from '../old/RecordText';
import { StringText2 } from '../old/StringText';
import { updateStore } from '../store';
import { OutputWatcher } from './Output';
import { RenderProps } from './Overheat';
import { ONodeOld } from './types';

/**
 * @deprecated this is the old weird one
 */
export const getNodes = (node: MNode, isRoot?: boolean): ONodeOld[] => {
    const nodes = getNodes_(node, isRoot);
    if (nodes && node.tannot != null) {
        nodes.push(
            { type: 'punct', text: ':', color: 'inherit', innerLeft: true },
            {
                type: 'ref',
                id: node.tannot,
                path: { type: 'tannot' },
                innerLeft: true,
            },
        );
    }
    return nodes;
};

export const getNodes_ = (node: MNode, isRoot?: boolean): ONodeOld[] => {
    switch (node.type) {
        case 'spread':
            return [
                { type: 'blinker', loc: 'start' },
                { type: 'punct', text: '...', color: 'unset' },
                {
                    type: 'ref',
                    id: node.contents,
                    path: { type: 'spread-contents' },
                    events(top, path) {
                        return {
                            onBackspace(isEmpty) {
                                if (isEmpty) {
                                    console.log('backspacing');
                                    const map = replacePath(
                                        path[path.length - 1],
                                        node.contents,
                                        top.store,
                                    );
                                    updateStore(top.store, {
                                        map,
                                        selection: {
                                            idx: node.contents,
                                            loc: 'start',
                                        },
                                    });
                                    return true;
                                }
                            },
                        };
                    },
                },
            ];
        case 'recordAccess':
            return [
                {
                    type: 'ref',
                    id: node.target,
                    path: { type: 'record-target' },
                },
                ...node.items.flatMap((id, i): ONodeOld[] => [
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
            if (isRoot) {
                // return withCommas(node.values, '\n');
                return node.values.flatMap((id, i): ONodeOld[] => [
                    { type: 'ref', id, path: { type: 'child', at: i } },
                    {
                        type: 'extra',
                        component: OutputWatcher,
                        props: { idx: id },
                    },
                ]);
            }
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
            return [{ type: 'render', component: IdentifierLike2 }];
        case 'accessText':
            return [{ type: 'render', component: RecordText2 }];
        case 'stringText':
            return [{ type: 'render', component: StringText2 }];
        case 'attachment':
            return [{ type: 'render', component: Attachment }];
        case 'rich-text':
            return [{ type: 'render', component: RichText }];
        case 'string':
            return [
                { type: 'blinker', loc: 'start' },
                { type: 'punct', color: 'yellow', text: '"', boldSelect: true },
                { type: 'ref', id: node.first, path: { type: 'text', at: 0 } },
                ...node.templates.flatMap((item, i): ONodeOld[] => [
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
function withCommas(values: number[], space = ' '): ONodeOld[] {
    if (!values.length) {
        return [{ type: 'blinker', loc: 'inside' }];
    }
    return values.flatMap((id, i): ONodeOld[] =>
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
