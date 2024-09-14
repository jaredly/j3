import { reader } from '../evaluators/boot-ex/reader';
import { AnyEvaluator } from '../evaluators/boot-ex/types';
import { builtins, SimplestEvaluator } from '../evaluators/simplest';
import { foldNode, IDRef, keyForLoc, mapNode, RecNode } from '../shared/nodes';

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

const init = () => {
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

    return { names, add, module };
};

const { add, module } = init();

type Result = {
    tinfo: NonNullable<ReturnType<(typeof SimplestEvaluator)['infer']>['info']>;
    ir: ReturnType<(typeof SimplestEvaluator)['compile']>;
    value?: any;
};

// add(`(def x 3)`);
// const last = add('(if (< x 5) "Hello" "World")');
const evaluate = (
    top: string,
    module: Record<string, RecNode>,
    ev: AnyEvaluator,
    cache: Record<string, Result | true>,
): Result => {
    if (cache[top] === true) throw new Error(`Cycle!`);
    if (cache[top]) return cache[top] as Result;
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
    parsed.references.forEach(({ ref }) => {
        if (ref.type === 'toplevel') {
            const { tinfo, ir } = evaluate(ref.loc[0][0], module, ev, cache);
            tinfos[ref.loc[0][0]] = tinfo;
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
    const res = (cache[top] = { value, tinfo: tinfo.info, ir });
    return res;
};

const terms = [
    // some definitions
    `(def x 3)`,
    `(def y 13)`,
    '(if (< x 5) (+ x y) "World")',
];

const ids = terms.map(add);
const last = ids[ids.length - 1];

const result = evaluate(last, module, SimplestEvaluator, {});
console.log('result', result.value);
