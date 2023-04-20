import { Loc, Node } from '../types/cst';
import { nodeToString, showSourceMap, SourceMap } from './nodeToString';

function loc(): Loc {
    return loc.idx++;
}
loc.idx = 0;

// const noloc: Loc = { idx: -1, start: 0, end: 0 };

const id = (text: string): Node => ({ type: 'identifier', text, loc: loc() });
const list = (...values: Node[]): Node => ({
    type: 'list',
    values,
    loc: loc(),
});
const array = (...values: Node[]): Node => ({
    type: 'array',
    values,
    loc: loc(),
});
const record = (...values: Node[]): Node => ({
    type: 'record',
    values,
    loc: loc(),
});
const spread = (contents: Node): Node => ({
    type: 'spread',
    contents,
    loc: loc(),
});
const string = (first: string, ...templates: [Node, string][]): Node => ({
    type: 'string',
    first: { type: 'stringText', text: first, loc: loc() },
    templates: templates.map(([expr, suffix]) => ({
        expr,
        suffix: { type: 'stringText', text: suffix, loc: loc() },
    })),
    loc: loc(),
});

describe('nodeToString', () => {
    it('should work', () => {
        expect(nodeToString(array(id('hi')), {})).toEqual('[hi]');
    });

    it('should do complex', () => {
        expect(
            nodeToString(
                list(
                    id('hello'),
                    array(id('1'), id('2')),
                    record(spread(id('pos')), id('x'), id('10')),
                ),
                {},
            ),
        ).toEqual('(hello [1 2] {..pos x 10})');
    });

    it('should do string', () => {
        expect(
            nodeToString(string('Hello ', [id('cruel'), ' world']), {}),
        ).toEqual(`"Hello \${cruel} world"`);
    });

    it('should sourcemap', () => {
        const sm: SourceMap = { map: {}, cur: 0 };
        loc.idx = 0;
        const ser = nodeToString(
            list(
                id('hello'),
                array(id('1'), id('2')),
                record(spread(id('pos')), id('x'), id('10')),
                string('Hello ', [id('folks'), ' and'], [id('1'), '']),
            ),
            {},
            sm,
        );
        expect(ser).toEqual(
            '(hello [1 2] {..pos x 10} "Hello ${folks} and${1}")',
        );
        expect(showSourceMap(ser, sm)).toEqual(
            `
        0: hello
        1: 1
        2: 2
        3: [1 2]
        4: pos
        5: ..pos
        6: x
        7: 10
        8: {..pos x 10}
        9: folks
        10: 1
        11: \`Hello \`
        12: \` and\`
        13: \`\`
        14: "Hello \${folks} and\${1}"
        15: ${ser}
        `
                .trim()
                .replace(/\n +/gm, '\n'),
        );
    });
});
