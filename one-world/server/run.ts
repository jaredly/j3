// websockets (to stream updates to toplevels that are "open" in the document I'm editing...)
// and normal dealios
// things I need to respond to:
// - namespace listing request
// - get me this toplevel
// - get me this document, hydrated with the toplevels I'll need
// -

import { ServerWebSocket } from 'bun';
import { Action } from '../shared/action2';
import { rid } from '../shared/rid';
import { DocSelection, DocSession } from '../shared/state2';
import { jsonGitBackend } from './json-git';
import { Change } from './persistence';

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

const sessions: Record<string, Session> = {};

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
                return new Response(JSON.stringify(await backend.docsList()), {
                    status: 200,
                    headers: {
                        'Content-Type': 'application/json',
                        ...CORS,
                    },
                });
            }
            if (url.pathname === '/doc') {
                const id = url.searchParams.get('id');
                if (!id) {
                    return new Response('no id provided', { status: 400 });
                }
                const doc = await backend.doc(id);
                if (!doc) {
                    return new Response('Doc not found', { status: 404 });
                }
                return new Response(JSON.stringify(await backend.doc(id)), {
                    status: 200,
                    headers: {
                        'Content-Type': 'application/json',
                        ...CORS,
                    },
                });
            }
            return new Response('Sorry what', { status: 404, headers: CORS });
        }
        if (req.method === 'POST' && url.pathname === '/doc') {
            const title = await req.text();
            const id = await backend.newDoc(title);
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
                const changes = await backend.update(msg.action, doc);

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
