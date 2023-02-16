import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { getType } from '../src/get-type/get-types-new';
import { attachAnnotations, preprocess } from './preprocess';
import { parse } from '../src/grammar';
import { initialStore, newEvalCtx } from '../web/store';
import { Map, toMCST } from '../src/types/mcst';
import { Node } from '../src/types/cst';
import { compile } from '../web/compile';
import { newCtx } from '../src/to-ast/Ctx';
import { nodeForExpr } from '../src/to-cst/nodeForExpr';
import { xpath } from '../web/xpath';
import { Type } from '../src/types/ast';
import { nodeToType } from '../src/to-ast/nodeToType';
import { errorToString } from '../src/to-cst/show-errors';
import {
    AutoCompleteChoices,
    emptyHistoryItem,
    getRoot,
    incrementallyBuildTree,
} from './incrementallyBuildTree';
import {
    verifyExistingToplevels,
    verifyToplevels,
} from './verifyExistingToplevels';

it('ok', () => {});

describe('attachAnnotations', () => {
    it('should work', () => {
        const array = parse('[x :int y z :float]')[0] as {
            type: 'array';
            values: Node[];
        };
        const result = attachAnnotations(array.values);
        expect(result).toHaveLength(3);
    });
});

describe('preprocess', () => {
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

const testValid = (text: string, autoCompleteChoices?: AutoCompleteChoices) =>
    describe(text, () => {
        const { root, omap } = getRoot(text);
        const ectx = newEvalCtx(newCtx());
        const store = initialStore([]);
        store.history.items.push(emptyHistoryItem());

        it('innner', () => {
            incrementallyBuildTree(
                store,
                omap,
                ectx,
                autoCompleteChoices,
                () => {
                    verifyExistingToplevels(root, ectx);
                },
            );
        });

        compile(store, ectx);
        verifyToplevels(root, ectx, store);
    });

const testInvalid = (
    text: string,
    errors: (string | RegExp)[],
    autoCompleteChoices?: AutoCompleteChoices,
) =>
    describe('invalid ' + text, () => {
        const { root, omap } = getRoot(text);
        const ectx = newEvalCtx(newCtx());
        const store = initialStore([]);
        store.history.items.push(emptyHistoryItem());

        it('should be invalid', () => {
            incrementallyBuildTree(
                store,
                omap,
                ectx,
                autoCompleteChoices,
                () => {
                    verifyExistingToplevels(root, ectx);
                },
            );

            compile(store, ectx);
            // verifyToplevels(root, ectx, store);
            const result = ectx.results[root.values[0].loc.idx];
            if (result.status !== 'errors') {
                expect(result.status).toBe('errors');
            } else {
                const strings = Object.values(result.errors)
                    .flat()
                    .map((err) => errorToString(err, ectx.ctx));
                // expect(strings).toEqual(errors);
                strings.forEach((string, i) => {
                    const h = errors[i];
                    if (
                        // @ts-ignore
                        h.__proto__.constructor === RegExp
                    ) {
                        expect(string).toMatch(h);
                    } else {
                        expect(string).toEqual(h);
                    }
                });
            }
        });
    });

const parseType = (raw: string) => {
    const ctx = newCtx();
    const node = parse(raw)[0];
    return nodeToType(node, ctx);
};

testValid('(def x 10) (def y (, x 20))');
// So, what do we do here ...
testValid('(defn what [x :int] 100)');
testValid('+', {
    '+': {
        type: 'global',
        ann: parseType('(fn [float float] float)'),
    },
});
testInvalid('+', ['Unresolved identifier: +']);
testInvalid('(defn what [x] 100)', [/universal type/]);
