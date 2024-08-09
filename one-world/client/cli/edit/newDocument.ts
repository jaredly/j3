import { Action } from '../../../shared/action2';

export const genId = () => Math.random().toString(36).slice(2);

export const newDocument = (id: string): Action[] => {
    const ts = {
        created: Date.now(),
        updated: Date.now(),
    } as const;
    const tid = id + ':top';
    return [
        {
            type: 'toplevel',
            id: tid,
            action: {
                type: 'reset',
                toplevel: {
                    id: tid,
                    macros: {},
                    nextLoc: 1,
                    nodes: { 0: { type: 'id', loc: 0, text: '' } },
                    root: 0,
                    ts,
                },
            },
        },
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
                    namespace: '',
                    nodes: {
                        0: { id: 0, children: [1], toplevel: '', ts },
                        1: { id: 1, children: [], toplevel: tid, ts },
                    },
                    nsAliases: {},
                    title: `Session ${new Date().toLocaleString()}`,
                    ts,
                },
            },
        },
    ];
};
