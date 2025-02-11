import { GMap, LRW } from './crdt';
import { MCons, MId, MList, MListTag } from './crdtnodes';
import { deserialize } from './serde';

const trips = [
    //
    new MListTag('lol'),
    new MCons('lol'),
    new MId('lol', { text: 'hello', ccls: 1 }, 'now'),
    new MList('lol', true, 'now'),
    new MList('lol', false, 'now'),
    new MList('lol', null, 'now'),
    //
    new GMap({ hi: new LRW('yes', 'now'), ho: new LRW('no', 'now+1') }),
];

trips.forEach((t) => {
    test(t.kind + ' serde', () => {
        expect(t.toJSON()).toEqual(deserialize(JSON.stringify(t.toJSON())).toJSON());
    });
});
