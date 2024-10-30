// websockets (to stream updates to toplevels that are "open" in the document I'm editing...)
// and normal dealios
// things I need to respond to:
// - namespace listing request
// - get me this toplevel
// - get me this document, hydrated with the toplevels I'll need
// -

import { Change, FullServerState, loadState, saveChanges } from './persistence';
import { Action } from '../shared/action2';
import { update } from '../shared/update2';
import { DocSelection, DocSession } from '../shared/state2';
import { ServerWebSocket } from 'bun';
import { rid } from '../shared/rid';
import { genId } from '../client/cli/edit/newDocument';
import { jsonGitBackend } from './json-git';

export type Session = {
    ws: ServerWebSocket<unknown>;
    selections: DocSession['selections'];
};

const CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
} as const;

export type ClientMessage =
    | {
          type: 'presence';
          selections: DocSelection[];
      }
    | { type: 'action'; action: Action };

export type ServerMessage =
    | {
          type: 'presence';
          id: string;
          selections: DocSelection[];
      }
    | { type: 'changes'; changes: Change[] };

const baseDirectory = './.ow-data';

// let state = loadState(baseDirectory);
// let ssid = 0;
const sessions: Record<string, Session> = {};

const serverUpdate = (
    state: FullServerState,
    action: Action,
    docId: string,
): FullServerState => {
    const stage = state.stages[docId];
    if (!stage)
        throw new Error(`handling action, but stage doesnt exist ${docId}`);
    const next = update(stage, action, {
        selections: {},
        toplevels: {},
    });
    return { ...state, stages: { ...state.stages, [docId]: next } };
};

const backend = jsonGitBackend(baseDirectory);

Bun.serve({
    port: process.env.PORT,
    async fetch(req, server) {
        console.log(req.url);
        const url = new URL(req.url);
        if (url.pathname === '/ws') {
            const ssid = url.searchParams.get('ssid');
            if (!ssid) {
                return new Response('no ssid provided', { status: 400 });
            }
            const doc = url.searchParams.get('doc');
            if (!doc) {
                return new Response('no doc provided', { status: 400 });
            }
            // upgrade the request to a WebSocket
            if (
                server.upgrade(req, {
                    data: { ssid, doc },
                    headers: CORS,
                })
            ) {
                return; // do not return a Response
            }
            return new Response('Upgrade failed', { status: 500 });
        }
        if (req.method === 'GET') {
            if (url.pathname === '/docs') {
                return new Response(
                    JSON.stringify(
                        await backend.docsList(),
                        // Object.values(state._documents).map((doc) => ({
                        //     id: doc.id,
                        //     title: doc.title,
                        // })),
                    ),
                    {
                        status: 200,
                        headers: {
                            'Content-Type': 'application/json',
                            ...CORS,
                        },
                    },
                );
            }
            if (url.pathname === '/doc') {
                const id = url.searchParams.get('id');
                if (!id) {
                    return new Response('no id provided', { status: 400 });
                }
                const doc = await backend.doc(id);
                // if (!state._documents[id]) {
                if (!doc) {
                    return new Response('Doc not found', { status: 404 });
                }
                // if (!state.stages[id]) {
                //     state.stages[id] = {
                //         ...state._documents[id],
                //         history: [],
                //         toplevels: {},
                //     };
                //     // TODO: do we prune here? maybe?
                //     Object.values(state.stages[id].nodes).forEach((node) => {
                //         state.stages[id].toplevels[node.toplevel] =
                //             state._toplevels[node.toplevel];
                //     });
                // }

                // Object.values(state.stages[id].nodes).forEach((node) => {
                //     if (!state.stages[id].toplevels[node.toplevel]) {
                //         state.stages[id].toplevels[node.toplevel] =
                //             state._toplevels[node.toplevel];
                //     }
                // });

                return new Response(
                    JSON.stringify(
                        await backend.doc(id),
                        // state.stages[id]
                    ),
                    {
                        status: 200,
                        headers: {
                            'Content-Type': 'application/json',
                            ...CORS,
                        },
                    },
                );
            }
            return new Response('Sorry what', { status: 404, headers: CORS });
        }
        if (req.method === 'POST' && url.pathname === '/doc') {
            const title = await req.text();
            const id = await backend.newDoc(title);

            // const id = genId();

            // const ts = {
            //     created: Date.now(),
            //     updated: Date.now(),
            // } as const;
            // const tid = id + ':top';
            // const mid = id + ':mod';

            // const next = { ...state };

            // next._documents = { ...next._documents };
            // next._toplevels = { ...next._toplevels };
            // next.modules = { ...next.modules };

            // next._documents[id] = {
            //     evaluator: [],
            //     published: false,
            //     id,
            //     nextLoc: 2,
            //     module: mid,
            //     nodes: { 0: { id: 0, children: [], toplevel: '', ts } },
            //     nsAliases: {},
            //     title: title,
            //     ts,
            // };
            // next._toplevels[tid] = {
            //     id: tid,
            //     module: mid,
            //     auxiliaries: [],
            //     nextLoc: 1,
            //     nodes: { 0: { type: 'id', loc: 0, text: '' } },
            //     root: 0,
            //     ts,
            // };
            // next.modules[mid] = {};
            // next.modules.root = { ...next.modules.root };
            // next.modules.root[mid] = title;

            // // const next = serverUpdate(state, msg.action, doc);
            // const changes = saveChanges(baseDirectory, state, next);

            // state = next;
            return new Response(id, { headers: CORS });
        }

        return new Response('ok', {
            headers: CORS,
        });
    },
    websocket: {
        open(ws) {
            let ssid: string = (ws.data as any).ssid;
            if (sessions[ssid]) {
                console.log('need new ssid', ssid, 'is taken');
                ssid = rid() + rid();
                (ws.data as any).ssid = ssid;
            }
            console.log('ws open', ssid);
            sessions[ssid] = { selections: [], ws };
            ws.send(JSON.stringify({ type: 'hello', ssid }));
        },
        close(ws) {
            const ssid: string = (ws.data as any).ssid;
            console.log('ws close', ssid);
            delete sessions[ssid];
        },
        // handler called when a message is received
        async message(ws, message) {
            const msg: ClientMessage = JSON.parse(String(message));
            const { ssid, doc } = ws.data as { ssid: string; doc: string };
            if (msg.type === 'presence') {
                sessions[ssid].selections = msg.selections;

                Object.keys(sessions).forEach((k) => {
                    if (k !== ssid) {
                        sessions[k].ws.send(
                            JSON.stringify({
                                type: 'presence',
                                selections: msg.selections,
                                id: ssid,
                            } satisfies ServerMessage),
                        );
                    }
                });
            } else if (msg.type === 'action') {
                // console.log('action', msg.action);
                // NOTE: this can be sooo much more efficient, by having update
                // also report on what changed.

                const changes = await backend.update(msg.action, doc);

                // const next = serverUpdate(state, msg.action, doc);
                // const changes = saveChanges(baseDirectory, state, next);
                // state = next;

                // notify others of the changes
                Object.keys(sessions).forEach((k) => {
                    if (k !== ssid) {
                        sessions[k].ws.send(
                            JSON.stringify({
                                type: 'changes',
                                changes,
                            } satisfies ServerMessage),
                        );
                    }
                });
            }
        },
    },
});

console.log(`Listening on http://localhost:${process.env.PORT}`);
