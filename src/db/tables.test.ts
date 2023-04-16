// lets go

import { nilt } from '../to-ast/builtins';
import { Library, Sandbox } from '../to-ast/library';
import { getDefinitions } from './library';
import { getMemDb } from './node-db';
import { addDefinitions, addSandbox, getSandboxes, transact } from './sandbox';
import { createTable, initialize } from './tables';

const genId = () => Math.random().toString(36).slice(2);

it('should initialize and add a sandbox', async () => {
    const mem = await getMemDb();
    await initialize(mem);
    const { meta } = await addSandbox(mem, 'an_id', 'Some Sandbox');
    expect(await getSandboxes(mem)).toEqual([meta]);
});

it('should add some definitions', async () => {
    const mem = await getMemDb();
    await initialize(mem);
    const defs: Library['definitions'] = {
        'some-hash': { type: 'type', value: nilt, originalName: 'nil' },
    };
    await transact(mem, () => addDefinitions(mem, defs));
    expect(await getDefinitions(mem)).toEqual(defs);
});

/*

So, basically

we get a db
we initialize it

...

we list the sandboxes

...

we load all the info into a library

...

-> loadLibrary(db)

...

then we need functions for incrementally
updating the library

...

and for updating nodes in a sandbox,
which should be easy.
along with the associated history item.

...


and I think that is about it?

...

how does "undo/redo" play into ... updating nodes in the sandbox?
maybe it just does. yeah that's fine I guess.
do the bulk update, no issues.

*/
