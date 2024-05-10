//

Bun.serve({
    fetch(req, server) {
        // upgrade the request to a WebSocket
        if (server.upgrade(req)) {
            return; // do not return a Response
        }
        return new Response('Upgrade failed :(', { status: 500 });
    },
    websocket: {
        message(ws, message) {
            ws.send(message);
        },
    },
});
