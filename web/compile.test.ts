import { parse } from '../src/grammar';
import { newCtx } from '../src/to-ast/Ctx';
import { compile } from './compile';
import { initialStore, newEvalCtx } from './store';

describe('compile', () => {
    it('should work', () => {
        const store = initialStore(parse('(def x 10) (def y (+ x 20))'));
        const ctx = newEvalCtx(newCtx());
        compile(store, ctx);
        const root = store.map[store.root].node;
        if (root.type !== 'list') {
            expect(root).toBe({ type: 'list' });
            return;
        }
        const [xi, yi] = root.values;
        const tx = ctx.report.types[xi];
        expect(tx).toEqual({ type: 'number' });
    });
});
