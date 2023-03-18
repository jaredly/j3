import equal from 'fast-deep-equal';
import { splitGraphemes } from '../../src/parse/parse';
import { Node } from '../../src/types/cst';
import { fromMCST, Map } from '../../src/types/mcst';
import { transformNode } from '../../src/types/transform-cst';
import { cmpFullPath } from '../custom/isCoveredBySelection';
import { getNodes } from '../overheat/getNodes';
import { Path } from '../store';

export const collectNodes = (map: Map, start: Path[], end: Path[]): Node[] => {
    if (start.length === end.length) {
        const slast = start[start.length - 1];
        const elast = end[end.length - 1];
        if (slast.idx === elast.idx) {
            const node = fromMCST(slast.idx, map);
            if ('text' in node) {
                const text = splitGraphemes(node.text);
                const sloc =
                    slast.child.type === 'subtext'
                        ? slast.child.at
                        : slast.child.type === 'end'
                        ? text.length
                        : 0;
                const eloc =
                    elast.child.type === 'subtext'
                        ? elast.child.at
                        : elast.child.type === 'start'
                        ? 0
                        : text.length;
                return [{ ...node, text: text.slice(sloc, eloc).join('') }];
            }
        }
    }
    // hrmm I want a transformNode, but that keeps track of your Path[]
    // transformNode()
    const collected: Node[] = [];
    transformNode(fromMCST(-1, map), {
        pre(node, path) {
            const isatom = 'text' in node;
            const cmp = cmpFullPath(start, path);
            if (cmp === 1) {
                return false;
            }
            const emp = cmpFullPath(path, end);
            if (emp === 1) {
                return false;
            }
            if (isatom ? cmp <= 0 && emp <= 0 : cmp === -1 && emp === -1) {
                collected.push(node);
                return false;
            }
        },
    });
    return collected;
    // let i = 0;
    // for (; i < start.length - 1 && i < end.length - 1 && equal(start[i + 1], end[i + 1]); i++) { }
    // const common = start.slice(0, i + 1)
    // const last = start[i]
    // const nodes = getNodes(map[last.idx])
    // let s = 0;
    // let e = nodes.length;
    // for (; s < e ; s++) {

    // }
};
