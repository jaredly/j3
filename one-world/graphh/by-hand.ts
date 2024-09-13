import { reader } from '../evaluators/boot-ex/reader';
import {
    foldNode,
    IDRef,
    keyForLoc,
    Loc,
    mapNode,
    RecNode,
} from '../shared/nodes';
import { builtins, SimplestEvaluator } from '../evaluators/simplest';

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

const module: Record<string, RecNode> = {};

let next = 0;
let names: Record<string, IDRef> = {};
Object.keys(builtins).forEach((name) => {
    names[name] = { type: 'builtin', kind: 'value' };
});

const add = (text: string) => {
    const id = `term${next++}`;
    const node = reader(text, id);
    if (!node) throw new Error(`failed to read:\n${text}`);
    const p = SimplestEvaluator.parse(node);
    const ids: Record<string, string> = {};
    foldNode(null, node, (_, node) => {
        if (node.type === 'id') {
            ids[keyForLoc(node.loc)] = node.text;
        }
        return null;
    });
    p.exports.forEach((exp) => {
        const name = ids[keyForLoc(exp.loc)];
        if (!name) {
            console.log(ids, node);
            throw new Error(`no name ${keyForLoc(exp.loc)}`);
        }
        if (names[name]) throw new Error(`duplicate declaration: ${name}`);
        names[name] = { type: 'toplevel', loc: exp.loc, kind: exp.kind };
    });
    module[id] = mapNode(node, replaceRefs(names));
    return id;
};

// const term1 = reader('(def x 3)', 'term1')!;
// const x1: Loc = [['term1', 5]];

// const term2 = mapNode(
//     reader('(if (< x 5) "Hello" "World")', 'term2')!,
//     replaceRefs({
//         '<': { type: 'builtin', kind: 'value' },
//         x: { type: 'toplevel', loc: x1, kind: 'value' },
//     }),
// );

const ev = SimplestEvaluator;

// const run = () => {
//     const res1 = ev.parse(term1);
//     if (!res1.top) return; //

//     const tinfo1 = ev.infer(res1.top, {});
//     if (!tinfo1.info) return; //

//     const ir1 = ev.compile(res1.top, tinfo1.info);
//     // ok so here we are

//     const res2 = ev.parse(term2);
//     if (!res2.top) return;
//     const tinfo2 = ev.infer(res2.top, { term1: tinfo1.info });
//     if (!tinfo2.info) return;

//     const ir2 = ev.compile(res2.top, tinfo2.info);
//     if (!ir2.evaluate) return;

//     const res = ev.evaluate(ir2.evaluate, ir1.byLoc);
//     console.log('got', res);
// };

// run();

type Result = {
    tinfo: NonNullable<ReturnType<(typeof SimplestEvaluator)['infer']>['info']>;
    ir: ReturnType<(typeof SimplestEvaluator)['compile']>;
    value?: any;
};
const cache: Record<string, Result | true> = {};

const evaluate = (top: string, module: Record<string, RecNode>): Result => {
    if (cache[top] === true) throw new Error(`Cycle!`);
    if (cache[top]) return cache[top];
    console.log('eval', top);
    cache[top] = true;
    const cst = module[top];
    if (!cst) throw new Error(`unknown top referenced`);
    const parsed = ev.parse(cst);
    if (!parsed.top) {
        console.log(cst, parsed);
        throw new Error(`could not parse ${top}`);
    }

    const tinfos: Record<string, Result['tinfo']> = {};
    const irs: Result['ir']['byLoc'] = {};
    parsed.references.forEach((reference) => {
        if (reference.ref.type === 'toplevel') {
            const { tinfo, ir } = evaluate(reference.ref.loc[0][0], module);
            tinfos[reference.loc[0][0]] = tinfo;
            Object.assign(irs, ir.byLoc);
        }
    });

    const tinfo = ev.infer(parsed.top, tinfos);
    if (!tinfo.info) throw new Error(`no type info`);

    const ir = ev.compile(parsed.top, tinfo.info);
    Object.assign(irs, ir.byLoc);
    let value = null;
    if (ir.evaluate) {
        value = ev.evaluate(ir.evaluate, irs);
    }
    cache[top] = { value, tinfo: tinfo.info, ir };
    return cache[top];
};

const terms = [
    // some definitions
    `(def x 3)`,
    `(def y 13)`,
    '(if (< x 5) (+ x y) "World")',
];

const ids = terms.map(add);
const last = ids[ids.length - 1];

// add(`(def x 3)`);
// const last = add('(if (< x 5) "Hello" "World")');

const result = evaluate(last, module);
console.log('result', result.value);
