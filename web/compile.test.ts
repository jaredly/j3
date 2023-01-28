import { parse } from '../src/grammar';
import { newCtx, noForm } from '../src/to-ast/Ctx';
import { ListLikeContents } from '../src/types/mcst';
import { compile } from './compile';
import { initialStore, newEvalCtx } from './store';

describe('compile', () => {
    it('should record types for things', () => {
        const store = initialStore(parse('(def x 10) (def y (, x 20))'));
        const ctx = newEvalCtx(newCtx());
        compile(store, ctx);
        const root = store.map[store.root].node as ListLikeContents;
        root.values.forEach((idx) =>
            expect(ctx.results[idx].status === 'success'),
        );
        const [xi, yi] = root.values;
        const tx = ctx.report.types[xi];
        expect(noForm(tx)).toEqual({ type: 'number', kind: 'int', value: 10 });
        const ty = ctx.report.types[yi];
        expect(noForm(ty)).toEqual({
            type: 'record',
            open: false,
            entries: [
                { name: '0', value: noForm(tx) },
                {
                    name: '1',
                    value: { type: 'number', kind: 'int', value: 20 },
                },
            ],
        });
    });
});
