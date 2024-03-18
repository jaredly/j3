//

Bun.serve({
    fetch(req, server) {}, // upgrade logic
    websocket: {
        message(ws, message) {
            ws.send(message);
        },
    },
});
