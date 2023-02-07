import { parse } from '../src/grammar';
import { newCtx, noForm } from '../src/to-ast/Ctx';
import { Identifier, Loc, Node } from '../src/types/cst';
import { ListLikeContents, MNode } from '../src/types/mcst';
import { compile } from './compile';
import {
    initialStore,
    newEvalCtx,
    Success,
    TopDef,
    undo,
    updateStore,
} from './store';
import { xpath } from './xpath';

describe.skip('compile', () => {
    it('undo should restore hashes', () => {
        const store = initialStore(parse('(def x 10) (def y (, x 20))'));
        const ctx = newEvalCtx(newCtx());
        const n10 = xpath(store.map, store.root, ['0', '2'])! as {
            type: 'number';
            raw: string;
        } & { loc: Loc };
        expect(noLoc(n10)).toEqual({
            type: 'number',
            raw: '10',
        });
        compile(store, ctx);
        const xi = xpath(store.map, store.root, ['0'])!;
        const yi = xpath(store.map, store.root, ['1'])!;
        expect(ctx.results[xi.loc.idx].status).toEqual('success');
        expect(ctx.results[yi.loc.idx].status).toEqual('success');
        const xHash = ctx.ctx.global.names['x'];
        const yHash = ctx.ctx.global.names['y'];
        expect(xHash).toHaveLength(1);
        const prevGlobal = { ...ctx.ctx.global };
        const hashes = Object.keys(ctx.ctx.global.terms);
        expect(hashes).toHaveLength(2);

        // Act
        const map = {
            [n10!.loc.idx]: { ...n10, raw: '30' },
        };
        updateStore(store, { map }, []);
        compile(store, ctx);

        // Assert
        expect(ctx.ctx.global.names['x']).not.toEqual(xHash);

        // Act2
        undo(store);
        compile(store, ctx);
        expect(ctx.ctx.global.names['x']).toEqual(xHash);
        expect(ctx.ctx.global.names['y']).toEqual(yHash);
        // expect(ctx.ctx.global).toEqual(prevGlobal);
    });

    it('should record types for things', () => {
        const store = initialStore(parse('(def x 10) (def y (, x 20))'));
        const ctx = newEvalCtx(newCtx());
        compile(store, ctx);
        const root = store.map[store.root] as ListLikeContents;
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

    it('should propagate hash changes', () => {
        const store = initialStore(parse('(def x 10) (def y (, x 20))'));
        const ctx = newEvalCtx(newCtx());
        compile(store, ctx);
        const root = store.map[store.root] as ListLikeContents;
        const [xi, yi] = root.values;

        const xres = ctx.nodes[xi] as TopDef;
        expect(xres.type).toBe('Def');
        const xhash = xres.names['x'];

        expect((ctx.results[xi] as Success).value).toBe(10);
        expect((ctx.results[yi] as Success).value).toEqual([10, 20]);

        // Setup
        /// No hash initially
        const xref = xpath(store.map, yi, ['2', '1'])!;
        expect(noLoc(xref)).toEqual({
            type: 'identifier',
            text: 'x',
            hash: '',
        });

        /// Lock it down
        updateStore(
            store,
            {
                map: {
                    [xref.loc.idx]: {
                        ...(xref as Identifier & { loc: Loc }),
                        hash: xhash,
                    },
                },
            },
            [],
        );
        compile(store, ctx);
        expect((ctx.results[yi] as Success).value).toEqual([10, 20]);

        /// Now there's a hash
        expect(noLoc(xpath(store.map, yi, ['2', '1']))).toEqual({
            type: 'identifier',
            text: 'x',
            hash: xhash,
        });

        // Act
        /// Update the contents of 'x', which will change the hash
        const x10 = xpath(store.map, xi, ['2']) as {
            type: 'number';
            raw: string;
            loc: Loc;
        };
        updateStore(
            store,
            {
                map: {
                    [x10!.loc.idx]: {
                        ...x10,
                        raw: '30',
                    },
                },
            },
            [],
        );
        expect(store.history.items.length).toBe(2);

        compile(store, ctx);

        // Assert
        /// We haven't created a new history item
        expect(store.history.items.length).toBe(2);

        expect((ctx.results[xi] as Success).value).toBe(30);
        expect((ctx.results[yi] as Success).value).toEqual([30, 20]);

        const xres2 = ctx.nodes[xi] as TopDef;
        expect(xres2.type).toBe('Def');
        const xhash2 = xres2.names['x'];

        // Hash is now changed
        expect(xhash2).not.toBe(xhash);

        /// The hash is updated to the new one
        expect(noLoc(xpath(store.map, yi, ['2', '1']))).toEqual({
            type: 'identifier',
            text: 'x',
            hash: xhash2,
        });
    });
});

const noLoc = (node: MNode | null) => {
    return node ? { ...node, loc: undefined } : null;
};
