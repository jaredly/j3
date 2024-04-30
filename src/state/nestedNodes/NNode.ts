import { MNode } from '../../types/mcst';
import { Path, PathChild } from '../path';
import { NNode } from './NNode';

export type NNode =
    | { type: 'nest'; node: MNode; inner: NNode }
    | { type: 'horiz' | 'vert' | 'inline'; children: NNode[]; style?: any }
    | {
          type: 'pairs';
          firstLine: NNode[];
          children: ([NNode] | [NNode, NNode])[];
      }
    | { type: 'indent'; child: NNode }
    | { type: 'punct'; text: string; color: string }
    | { type: 'text'; text: string }
    | { type: 'rich-text'; contents: any }
    | {
          type: 'brace';
          text: string;
          at: 'start' | 'end';
          color?: string;
          bgColor?: string;
      }
    | {
          type: 'ref';
          id: number;
          path?: PathChild;
          ancestors?: Path[];
          style?: any;
      }
    | {
          type: 'dom';
          node:
              | JSX.Element
              | null
              | ((path: Path[], idx: number) => JSX.Element);
      }
    // | {type: 'sub-path', path: PathChild, child: NNode}
    | { type: 'blinker'; loc: 'start' | 'inside' | 'end' };
export const transformNode = (node: NNode, f: (n: NNode) => NNode): NNode => {
    node = f(node);
    switch (node.type) {
        case 'horiz':
        case 'vert':
        case 'inline':
            node.children = node.children.map((child) =>
                transformNode(child, f),
            );
            break;
        case 'nest':
            node.inner = transformNode(node.inner, f);
            break;
        case 'indent':
            node.child = transformNode(node.child, f);
            break;
        case 'pairs':
            node.children = node.children.map((line) => {
                if (line.length === 1) {
                    return [transformNode(line[0], f)];
                }
                return [transformNode(line[0], f), transformNode(line[1], f)];
            });
            node.firstLine = node.firstLine.map((child) =>
                transformNode(child, f),
            );
            break;
    }
    return node;
};
