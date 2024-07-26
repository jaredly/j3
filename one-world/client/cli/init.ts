import { newStore } from '../newStore2';
import { Store } from '../StoreContext2';
import { Sess, writeSess } from './Sess';

export const init = async (sess: Sess) => {
    const res = await fetch('http://localhost:8227');
    const state = await res.json();
    // const ssid = 'cli';
    const ws = new WebSocket('ws://localhost:8227/ws?ssid=' + sess.ssid);
    const store = await new Promise<Store>((res, rej) => {
        ws.onerror = (err) => rej(err);
        ws.onopen = () => {
            const f = (msg: MessageEvent<any>) => {
                ws.removeEventListener('message', f);
                const data = JSON.parse(String(msg.data));
                if (data.type !== 'hello') {
                    throw new Error(`first message wasnt hello.`);
                }
                if (data.ssid !== sess.ssid) {
                    sess.ssid = data.ssid;
                    writeSess(sess);
                }
                res(newStore(state, ws, sess.ssid));
            };
            ws.addEventListener('message', f);
        };
    });
    return store;
};
