import { parse } from '../../../src/grammar';
import { nodeToString } from '../../../src/to-cst/nodeToString';
import {
    fromMCST,
    ListLikeContents,
    MCRecordAccess,
} from '../../../src/types/mcst';
import { initialStore, updateStore } from '../../store';
import { xpath } from '../../xpath';
import { joinExprs } from '../RecordText';

describe('joinExprs', () => {
    it('should work', () => {
        const store = initialStore(parse('one.two.three'));
        // const base = store.map[store.root];
        // expect(base.type).toEqual('list');
        // const top = (base as ListLikeContents).values[0];
        // const topn = store.map[top];
        // expect(topn.type).toEqual('recordAccess');
        // expect((topn as MCRecordAccess).items).toHaveLength(2);
        const record = xpath(store.map, store.root, ['0']);
        expect(record).toBeTruthy();
        const { map, selection } = joinExprs(record!.loc.idx, 1, store, 'ree');
        updateStore(store, { map, selection });
        expect(nodeToString(fromMCST(record!.loc.idx, store.map))).toEqual(
            'one.tworee',
        );
    });
});
