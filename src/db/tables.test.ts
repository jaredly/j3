// lets go

import { Sandbox } from '../to-ast/library';
import { getMemDb } from './node-db';
import { addSandbox, createTable, getSandboxes, tables } from './tables';

const genId = () => Math.random().toString(36).slice(2);

it('should be ok', async () => {
    //
    const mem = await getMemDb();
    for (let config of tables) {
        await createTable(mem, config);
    }
    const { meta } = await addSandbox(mem, 'an_id', 'Some Sandbox');
    expect(await getSandboxes(mem)).toEqual([meta]);
});
