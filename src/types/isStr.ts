import { Node } from './cst';

const isStr = (t: any) => typeof t === 'string';
const isNum = (t: any) => typeof t === 'number';
const isArr = (t: any, item: (v: any) => boolean) =>
    Array.isArray(t) && t.every(item);

export const isValidNode = (node: Node): boolean => {
    if (!node || typeof node.loc !== 'number') return false;
    switch (node.type) {
        case 'accessText':
            return isStr(node.text);
        case 'annot':
            return isValidNode(node.annot) && isValidNode(node.target);
        case 'array':
        case 'list':
        case 'record':
            return isArr(node.values, isValidNode);
        case 'blank':
            return true;
        case 'comment':
            return isStr(node.text);
        case 'comment-node':
            return isValidNode(node.contents);
        case 'hash':
            return isStr(node.hash) || isNum(node.hash);
        case 'identifier':
            return isStr(node.text);
        case 'raw-code':
            return isStr(node.raw);
        case 'recordAccess':
            return isValidNode(node.target) && isArr(node.items, isValidNode);
        case 'spread':
            return isValidNode(node.contents);
        case 'string':
            return (
                isValidNode(node.first) &&
                isArr(
                    node.templates,
                    (ab) => isValidNode(ab.expr) && isValidNode(ab.suffix),
                )
            );
        case 'stringText':
            return isStr(node.text);
        case 'tapply':
            return isValidNode(node.target) && isArr(node.values, isValidNode);
    }
    return false;
};
