import { parse } from '../src/grammar';
import { newCtx, noForm } from '../src/to-ast/Ctx';
import { Identifier, Loc, Node } from '../src/types/cst';
import { ListLikeContents, Map, MNode } from '../src/types/mcst';
import { compile } from './compile';
import { initialStore, newEvalCtx, TopDef, updateStore } from './store';

const xpath = (map: Map, root: number, path: string[]) => {
    let node = map[root].node;
    for (let i = 0; i < path.length; i++) {
        const next = path[i];
        if (
            node.type === 'list' ||
            node.type === 'array' ||
            node.type === 'record'
        ) {
            const idx = +next;
            if (isNaN(idx) || idx >= node.values.length) {
                return null;
            }
            node = map[node.values[+next]].node;
            continue;
        }
        if (node.type === 'string') {
            if (next === 'first') {
                node = map[node.first].node;
                continue;
            }
            const idx = +next;
            if (isNaN(idx) || idx >= node.templates.length) {
                return null;
            }
            i++;
            const second = path[i];
            if (!second || (second !== 'expr' && second !== 'suffix')) {
                return null;
            }
            node = map[node.templates[idx][second]].node;
            continue;
        }
        return null;
    }
    return node;
};

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

    it('should propagate hash changes', () => {
        const store = initialStore(parse('(def x 10) (def y (, x 20))'));
        const ctx = newEvalCtx(newCtx());
        compile(store, ctx);
        const root = store.map[store.root].node as ListLikeContents;
        const [xi, yi] = root.values;

        const xres = ctx.nodes[xi] as TopDef;
        expect(xres.type).toBe('Def');
        const xhash = xres.names['x'];

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
                    ...store.map,
                    [xref.loc.idx]: {
                        node: {
                            ...(xref as Identifier & { loc: Loc }),
                            hash: xhash,
                        },
                    },
                },
            },
            [],
        );

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
                    ...store.map,
                    [x10!.loc.idx]: {
                        node: {
                            ...x10,
                            raw: '30',
                        },
                    },
                },
            },
            [],
        );
        compile(store, ctx);

        const xres2 = ctx.nodes[xi] as TopDef;
        expect(xres2.type).toBe('Def');
        const xhash2 = xres2.names['x'];

        // Hash is now changed
        expect(xhash2).not.toBe(xhash);

        // Assert
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
