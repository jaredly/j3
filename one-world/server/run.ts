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

export type Session = {
    ws: ServerWebSocket<unknown>;
    selections: DocSession['selections'];
};

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

let state = loadState(baseDirectory);
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

Bun.serve({
    port: process.env.PORT,
    fetch(req, server) {
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
                    headers: {
                        'Access-Control-Allow-Origin': '*',
                        'Access-Control-Allow-Methods':
                            'GET, POST, PUT, DELETE, OPTIONS',
                    },
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
                        Object.values(state._documents).map((doc) => ({
                            id: doc.id,
                            title: doc.title,
                        })),
                    ),
                    {
                        status: 200,
                        headers: {
                            'Content-Type': 'application/json',
                            'Access-Control-Allow-Origin': '*',
                            'Access-Control-Allow-Methods':
                                'GET, POST, PUT, DELETE, OPTIONS',
                        },
                    },
                );
            }
            if (url.pathname === '/doc') {
                const id = url.searchParams.get('id');
                if (!id) {
                    return new Response('no id provided', { status: 400 });
                }
                if (!state._documents[id]) {
                    return new Response('Doc not found', { status: 404 });
                }
                if (!state.stages[id]) {
                    state.stages[id] = {
                        ...state._documents[id],
                        history: [],
                        toplevels: {},
                    };
                    // TODO: do we prune here? maybe?
                    Object.values(state.stages[id].nodes).forEach((node) => {
                        state.stages[id].toplevels[node.toplevel] =
                            state._toplevels[node.toplevel];
                    });
                }

                return new Response(JSON.stringify(state.stages[id]), {
                    status: 200,
                    headers: {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*',
                        'Access-Control-Allow-Methods':
                            'GET, POST, PUT, DELETE, OPTIONS',
                    },
                });
            }
            return new Response(JSON.stringify(state), {
                status: 200,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods':
                        'GET, POST, PUT, DELETE, OPTIONS',
                },
            });
        }
        return new Response('ok', {
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods':
                    'GET, POST, PUT, DELETE, OPTIONS',
            },
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
                const next = serverUpdate(state, msg.action, doc);
                const changes = saveChanges(baseDirectory, state, next);

                state = next;
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
