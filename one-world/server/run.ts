// websockets (to stream updates to toplevels that are "open" in the document I'm editing...)
// and normal dealios
// things I need to respond to:
// - namespace listing request
// - get me this toplevel
// - get me this document, hydrated with the toplevels I'll need
// -

import { IncomingMessage, createServer } from 'http';
import { loadState, saveChanges } from './persistence';
import { Action } from '../shared/action';
import { update } from '../shared/update';
import { UserDocument } from '../shared/state';

const baseDirectory = './.ow-data';

let state = loadState(baseDirectory);
let ssid = 0;
const sessions: Record<number, { selections: UserDocument['selections'] }> = {};

Bun.serve({
    port: process.env.PORT,
    fetch(req, server) {
        if (req.url === '/ws') {
            // upgrade the request to a WebSocket
            const id = ssid++;
            if (server.upgrade(req, { data: { id } })) {
                sessions[id] = { selections: [] };
                return; // do not return a Response
            }
            return new Response('Upgrade failed', { status: 500 });
        }
        if (req.method === 'GET') {
            return new Response(JSON.stringify(state), {
                status: 200,
                headers: {
                    'Content-Type': 'application/json',
                },
            });
        }
    },
    websocket: {
        // handler called when a message is received
        async message(ws, message) {
            const msg = JSON.parse(String(message));
            const id: number = (ws.data as any).id;
            if (msg.type === 'presence') {
                sessions[id].selections = msg.selections;
            } else if (msg.type === 'action') {
                const action: Action = msg.action;
                const next = update(state, action);
                saveChanges(baseDirectory, state, next);
                state = next;
            }
        },
    }, // handlers
});

// createServer(async (req, res) => {
//     if (req.method === 'GET') {
//         // for simplicity, let's load up the whole kit and kabootle
//         // we can be lazy and efficient later when we care about it
//         res.writeHead(200, { 'Content-Type': 'application/json' });
//         res.write(JSON.stringify(state));
//         res.end();
//         return;
//     }
//     if (req.method === 'POST') {
//         // itt would be nice to validate this lol
//         const action: Action = JSON.parse(await readBody(req));
//         const next = update(state, action);
//         saveChanges(baseDirectory, state, next);
//         state = next;
//         res.writeHead(200);
//         res.end('ok');
//         return;
//     }
// }).listen(process.env.PORT);

console.log(`Listening on http://localhost:${process.env.PORT}`);

function readBody(readable: IncomingMessage) {
    return new Promise<string>((res) => {
        const chunks: string[] = [];

        readable.on('readable', () => {
            let chunk;
            while (null !== (chunk = readable.read())) {
                chunks.push(chunk);
            }
        });

        readable.on('end', () => {
            const content = chunks.join('');
            res(content);
        });
    });
}
