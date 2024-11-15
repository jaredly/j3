import { test, expect } from 'bun:test';
// so

import { reader } from '../evaluators/boot-ex/reader';
import { IDRef, Loc, mapNode, RecNode } from '../shared/nodes';

// we load .. the ... datas?

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

test('ok', () => {
    const term1 = reader('(def x 3)', 'term1')!;
    const x1: Loc = [['term1', 5]];

    const term2 = mapNode(
        reader('(if (< x 5) "Hello" "World")', 'term2')!,
        replaceRefs({
            '<': { type: 'builtin', kind: 'value' },
            x: { type: 'toplevel', loc: x1, kind: 'value' },
        }),
    );

    expect(term1).toMatchSnapshot();
    expect(term2).toMatchSnapshot();

    // as inputs, we have {'module1': ['term1', 'term2']}
    // and ... {term1: cst, term2: cst}

    const state = {
        modules: { module1: ['term1', 'term2'] },
        moduleForTerm: { term1: 'module1', term2: 'module1' },
        terms: { term1, term2 },
    };

    /*
    procedure:
    - do a parse on everything
    - ensure that module recursion isn't happening
    - ...
    - profit

    */
});
