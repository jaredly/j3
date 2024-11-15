export const genId = () =>
    Date.now().toString(36) + Math.random().toString(36).slice(2);

/*
export const newDocument = (id: string, title?: string): Action[] => {
    const ts = {
        created: Date.now(),
        updated: Date.now(),
    } as const;
    const tid = id + ':top';
    const mid = id + ':mod';
    return [
        {
            type: 'doc',
            id,
            action: {
                type: 'reset',
                doc: {
                    evaluator: [],
                    published: false,
                    id,
                    nextLoc: 2,
                    module: mid,
                    nodes: { 0: { id: 0, children: [], toplevel: '', ts } },
                    nsAliases: {},
                    title: title ?? `Session ${new Date().toLocaleString()}`,
                    ts,
                },
            },
        },
        {
            type: 'toplevel',
            id: tid,
            doc: id,
            action: {
                type: 'reset',
                toplevel: {
                    id: tid,
                    module: mid,
                    auxiliaries: [],
                    nextLoc: 1,
                    nodes: { 0: { type: 'id', loc: 0, text: '' } },
                    root: 0,
                    ts,
                },
            },
        },
        {
            type: 'module',
            action: {
                type: 'add',
                parent: 'root',
                id: mid,
                name: 'session:' + id,
            },
        },
        {
            type: 'doc',
            id,
            action: {
                type: 'update',
                // type: 'reset',
                update: {
                    nextLoc: 2,
                    nodes: {
                        0: { id: 0, children: [1], toplevel: '', ts },
                        1: { id: 1, children: [], toplevel: tid, ts },
                    },
                },
            },
        },
    ];
};

*/
