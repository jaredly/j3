// websockets (to stream updates to toplevels that are "open" in the document I'm editing...)
// and normal dealios
// things I need to respond to:
// - namespace listing request
// - get me this toplevel
// - get me this document, hydrated with the toplevels I'll need
// -

import { Change, loadState, saveChanges } from './persistence';
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

Bun.serve({
    port: process.env.PORT,
    fetch(req, server) {
        console.log(req.url);
        const url = new URL(req.url);
        if (url.pathname === '/ws') {
            if (!url.search.startsWith('?ssid=')) {
                throw new Error(`no ssid provided`);
            }
            const ssid = url.search.slice('?ssid='.length);
            // upgrade the request to a WebSocket
            // const id = ssid++;
            if (
                server.upgrade(req, {
                    data: { ssid },
                    headers: {
                        'Access-Control-Allow-Origin': '*',
                        'Access-Control-Allow-Methods':
                            'GET, POST, PUT, DELETE, OPTIONS',
                    },
                })
            ) {
                // sessions[id] = { selections: [] };
                return; // do not return a Response
            }
            return new Response('Upgrade failed', { status: 500 });
        }
        if (req.method === 'GET') {
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
            const ssid: string = (ws.data as any).ssid;
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
                console.log('action', msg.action);
                // NOTE: this can be sooo much more efficient, by having update
                // also report on what changed.
                const next = update(state, msg.action, {
                    selections: {},
                    toplevels: {},
                });
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
