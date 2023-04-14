import { parse } from '../src/grammar';
import { Node } from '../src/types/cst';
import { Map, toMCST } from '../src/types/mcst';
import { xpath } from '../web/xpath';
import { attachAnnotations, preprocess } from './preprocess';

it.skip('ok', () => {});

describe.skip('attachAnnotations', () => {
    it('should work', () => {
        const array = parse('[x :int y z :float]')[0] as {
            type: 'array';
            values: Node[];
        };
        const result = attachAnnotations(array.values);
        expect(result).toHaveLength(3);
    });
});

describe.skip('preprocess', () => {
    it('', () => {
        const tree = preprocess(parse('(fn [x :int] 10)')[0]);
        const map: Map = {};
        const root = toMCST(tree, map);
        const args = xpath(map, root, ['1'])!;
        if (args.type === 'array') {
            expect(args.values).toHaveLength(1);
        } else {
            expect(args).toBe('an array');
        }
    });
});
