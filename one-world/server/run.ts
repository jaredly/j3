// websockets (to stream updates to toplevels that are "open" in the document I'm editing...)
// and normal dealios
// things I need to respond to:
// - namespace listing request
// - get me this toplevel
// - get me this document, hydrated with the toplevels I'll need
// -

import { loadState, saveChanges } from './persistence';
import { Action } from '../shared/action';
import { update } from '../shared/update';
import { UserDocument } from '../shared/state';
import { ServerWebSocket } from 'bun';

type Session = {
    ws: ServerWebSocket<unknown>;
    selections: UserDocument['selections'];
};

const baseDirectory = './.ow-data';

let state = loadState(baseDirectory);
let ssid = 0;
const sessions: Record<number, Session> = {};

Bun.serve({
    port: process.env.PORT,
    fetch(req, server) {
        console.log(req.url);
        if (req.url.endsWith('/ws')) {
            // upgrade the request to a WebSocket
            const id = ssid++;
            if (
                server.upgrade(req, {
                    data: { id },
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
            const id: number = (ws.data as any).id;
            console.log('ws open', id);
            sessions[id] = { selections: [], ws };
        },
        close(ws) {
            const id: number = (ws.data as any).id;
            console.log('ws close', id);
            delete sessions[id];
        },
        // handler called when a message is received
        async message(ws, message) {
            const msg = JSON.parse(String(message));
            const id: number = (ws.data as any).id;
            if (msg.type === 'presence') {
                sessions[id].selections = msg.selections;

                Object.keys(sessions).forEach((k) => {
                    if (+k !== id) {
                        sessions[+k].ws.send(
                            JSON.stringify({
                                type: 'presence',
                                selections: msg.selections,
                                id,
                            }),
                        );
                    }
                });
            } else if (msg.type === 'action') {
                const action: Action = msg.action;

                // NOTE: this can be sooo much more efficient, by having update
                // also report on what changed.
                const next = update(state, action);
                const changes = saveChanges(baseDirectory, state, next);

                state = next;
                // notify others of the changes
                Object.keys(sessions).forEach((k) => {
                    if (+k !== id) {
                        sessions[+k].ws.send(
                            JSON.stringify({ type: 'changes', changes }),
                        );
                    }
                });
            }
        },
    },
});

console.log(`Listening on http://localhost:${process.env.PORT}`);
