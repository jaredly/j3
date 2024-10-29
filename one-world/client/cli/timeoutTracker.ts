const WORKER_TIMEOUT = 1000;
export const timeoutTracker = (fn: () => void) => {
    let msgId = 0;
    let waiting: { id: number; timer: Timer }[] = [];
    const restart = () => {
        waiting.forEach((w) => clearTimeout(w.timer));
        waiting = [];
        fn();
    };
    return {
        nextMsgId() {
            const id = msgId++;
            waiting.push({
                id,
                timer: setTimeout(restart, WORKER_TIMEOUT),
            });
            return id;
        },
        receivedMessage(id: number) {
            const got = waiting.find((w) => w.id === id);
            if (!got) return;
            waiting.splice(waiting.indexOf(got), 1);
            clearTimeout(got.timer);
        },
    };
};
