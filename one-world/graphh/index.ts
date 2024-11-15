// lookit this graaph

import { AnyEvaluator, Evaluator } from '../evaluators/boot-ex/types';
import { Loc, RecNode } from '../shared/nodes';

type NodeID = { top: string; name: string };

const idKey = (id: NodeID) => id.top + '/' + id.name;

type Node = {
    id: NodeID;
    dynamicInputs?: (inputs: Record<string, any>) => NodeID[];
    inputs: NodeID[];
    outputs: NodeID[];
    // something called 'links'? maybe?
    run: (inputs: Record<string, any>) => Record<string, any>;
};

// type Value = {
//     id: string;
//     producedBy: string;
//     value: any;
// };

export const assembleGraaph = (
    ev: AnyEvaluator,
    render: (cst: RecNode, errors: any, perrors: any) => void,
    top: string,
) => {
    const nodes: Node[] = [];

    const add = (
        node: Omit<Node, 'id' | 'inputs' | 'outputs'> & {
            id: string;
            inputs: string[];
            outputs: string[];
        },
    ) =>
        nodes.push({
            ...node,
            id: { top, name: node.id },
            inputs: node.inputs.map((name) => ({ top, name })),
            outputs: node.inputs.map((name) => ({ top, name })),
        });

    add({
        id: 'render:toplevel',
        // STOPSHIP: how do I indicate that type:errors are ... optional?
        inputs: ['CST', 'type:errors', 'parse:errors'],
        outputs: [],
        run(inputs) {
            render(
                inputs['CST'],
                inputs['type:errors'],
                inputs['parse:errors'],
            );
            return {};
        },
    });

    add({
        id: 'parse',
        inputs: ['CST'],
        outputs: ['formatting', 'parse:errors', 'references', 'AST', 'exports'],
        run(inputs) {
            return ev.parse(inputs['CST']);
        },
    });

    add({
        id: 'resolve-references',
        dynamicInputs(inputs) {
            return inputs['references'].flatMap((ref: Loc) => [
                { top: ref[0][0], name: 'TINFO' },
                { top: ref[0][0], name: 'IR' },
            ]);
        },
        inputs: ['references'],
        outputs: ['external-tinfos', 'external-irs'],
        run(inputs) {
            const tinfos: Record<string, any> = {};
            const irs: Record<string, any> = {};
            Object.entries(inputs).forEach(([key, value]) => {
                if (key.endsWith('/ir')) {
                    irs[key] = value;
                } else {
                    tinfos[key] = value;
                }
            });
            return {
                'external-tinfos': tinfos,
                'external-irs': irs,
            };
        },
    });

    // Sooo here's the thing.
    // At this point, we need to detect and collapse mutual recursive
    // terms, with something like `ev.combineMutuallyRecursive(asts: AST[]): AST`
    //
    // hm ok, so I think I'll actually try to ... do everything .. by hand? first. And see where that gets me.
    // like write a test script I guess.
    // doc: yiwuvt9b3lb

    add({
        id: 'infer',
        inputs: ['AST', 'external-tinfos'],
        outputs: ['type:errors', 'TINFO'],
        run(inputs) {
            const info = ev.infer(inputs['AST'], inputs['external-tinfos']);
            return { TINFO: info, 'type:errors': [] };
        },
    });

    add({
        id: 'compile',
        inputs: ['AST', 'TINFO'],
        outputs: ['IR'],
        run(inputs) {
            const results = ev.compile(inputs['AST'], inputs['TINFO']);
            return { IR: results };
        },
    });

    add({
        id: 'eval',
        inputs: ['IR', 'external-irs'],
        outputs: ['Value'],
        run(inputs) {
            const value = ev.evaluate(inputs['IR'], inputs['external-irs']);
            return { Value: value };
        },
    });

    add({
        id: 'render:output',
        inputs: ['Value'],
        outputs: [],
        run(inputs) {
            console.log('rendering the output folks');
            return {};
        },
    });
};
