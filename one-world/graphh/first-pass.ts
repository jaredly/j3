import { reader } from '../evaluators/boot-ex/reader';
import { IDRef, Loc, mapNode, RecNode } from '../shared/nodes';
import { SimplestEvaluator } from '../evaluators/simplest';

const ev = SimplestEvaluator;

const replaceRefs =
    (refs: Record<string, IDRef>) =>
    (node: RecNode): RecNode => {
        if (node.type === 'id') {
            if (refs[node.text]) {
                return { ...node, ref: refs[node.text] };
            }
        }
        return node;
    };

const term1 = reader('(def x 3)', 'term1')!;
const x1: Loc = [['term1', 5]];

const term2 = mapNode(
    reader('(if (< x 5) "Hello" "World")', 'term2')!,
    replaceRefs({
        '<': { type: 'builtin', kind: 'value' },
        x: { type: 'toplevel', loc: x1, kind: 'value' },
    }),
);

const run = () => {
    const res1 = ev.parse(term1);
    if (!res1.top) return; //

    const tinfo1 = ev.infer(res1.top, {});
    if (!tinfo1.info) return; //

    const ir1 = ev.compile(res1.top, tinfo1.info);
    // ok so here we are

    const res2 = ev.parse(term2);
    if (!res2.top) return;
    const tinfo2 = ev.infer(res2.top, { term1: tinfo1.info });
    if (!tinfo2.info) return;

    const ir2 = ev.compile(res2.top, tinfo2.info);
    if (!ir2.evaluate) return;

    const res = ev.evaluate(ir2.evaluate, ir1.byLoc);
    console.log('got', res);
};

run();
