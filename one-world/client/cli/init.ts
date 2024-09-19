import { newStore } from '../newStore2';
import { Store } from '../StoreContext2';
import { Sess } from './Sess';

export const init = async (sess: Sess, writeSess: (s: Sess) => void) => {
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
                const store = newStore(state, ws, sess.ssid);
                if (sess.selection && sess.doc != null) {
                    store.getDocSession(sess.doc, store.session);
                    store.update({
                        type: 'selection',
                        doc: sess.doc,
                        selections: sess.selection,
                    });
                }
                res(store);
            };
            ws.addEventListener('message', f);
        };
        ws.onclose = () => {
            console.log('closed ... reloading');
            setTimeout(() => {
                location.reload();
            }, 2000);
        };
    });
    return store;
};
