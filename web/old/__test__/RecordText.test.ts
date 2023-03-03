import { parse } from '../../../src/grammar';
import { newCtx } from '../../../src/to-ast/Ctx';
import { nodeToString } from '../../../src/to-cst/nodeToString';
import {
    fromMCST,
    ListLikeContents,
    MCRecordAccess,
} from '../../../src/types/mcst';
import { initialStore, newEvalCtx, updateStore } from '../../store';
import { xpath } from '../../xpath';
import { joinExprs } from '../RecordText';

describe('joinExprs', () => {
    it('should work', () => {
        const store = initialStore(parse('one.two.three'));
        const ctx = newEvalCtx(newCtx());
        const record = xpath(store.map, store.root, ['0']);
        const { map, selection } = joinExprs(
            { idx: store.root, child: { type: 'child', at: 0 } },
            record!.loc.idx,
            1,
            store,
            ctx,
            'ree',
        );
        updateStore(store, { map, selection });
        expect(nodeToString(fromMCST(record!.loc.idx, store.map))).toEqual(
            'one.tworee',
        );
    });

    it('should remove the recordAccess when the last item is removed', () => {
        const store = initialStore(parse('one.two'));
        const ctx = newEvalCtx(newCtx());
        const record = xpath(store.map, store.root, ['0']);
        const { map, selection } = joinExprs(
            { idx: store.root, child: { type: 'child', at: 0 } },
            record!.loc.idx,
            0,
            store,
            ctx,
            'o',
        );
        updateStore(store, { map, selection });
        const top = xpath(store.map, store.root, ['0']);
        expect(nodeToString(fromMCST(top!.loc.idx, store.map))).toEqual('oneo');
        expect(top!.type).toEqual('identifier');
        expect(store.selection).toEqual({ idx: top!.loc.idx, loc: 3 });
    });
});
