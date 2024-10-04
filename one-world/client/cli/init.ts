import { DocSession, PersistedState } from '../../shared/state2';
import { newStore } from '../newStore2';
import { Store } from '../StoreContext2';
import { Sess } from './Sess';

const load = (key: string): PersistedState => {
    const data = localStorage[key];
    if (!data)
        return {
            _toplevels: {},
            _documents: {},
            modules: {},
            stages: {},
        };
    return JSON.parse(data);
};

const save = (key: string, state: PersistedState) => {
    localStorage[key] = JSON.stringify(state);
};
export const clearState = () => localStorage.removeItem(key);

const key = 'j3:local:state';

export const initLocal = (
    sess: Sess,
    // writeSess: (s: Sess) => void,
    // key: string,
): Promise<Store> => {
    const store = newStore(
        load(key),
        {
            onMessage(fn) {
                // ws.addEventListener('message', (evt) => {
                //     fn(JSON.parse(evt.data));
                // });
            },
            send(msg) {
                // console.log('not sending', msg);
                // ws.send(JSON.stringify(msg));
            },
            close() {},
        },
        sess.ssid,
        (id) => {
            const raw = localStorage['doc:ss:' + id];
            return raw ? JSON.parse(raw) : null;
        },
    );
    // @ts-ignore
    window.state = store.getState();

    store.on('all', () => {
        save(key, store.getState());
        // @ts-ignore
        window.state = store.getState();
    });

    if (sess.doc != null && !store.getState()._documents[sess.doc]) {
        sess.doc = undefined;
    }

    if (sess.selection && sess.doc != null) {
        store.getDocSession(sess.doc, store.session);
        store.update({
            type: 'selection',
            doc: sess.doc,
            selections: sess.selection,
        });
    }

    return Promise.resolve(store);
};

export const init = async (
    sess: Sess,
    writeSess: (s: Sess) => void,
): Promise<Store> => {
    const res = await fetch('http://localhost:8227');
    const state = await res.json();
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
                const store = newStore(
                    state,
                    {
                        onMessage(fn) {
                            ws.addEventListener('message', (evt) => {
                                fn(JSON.parse(evt.data));
                            });
                        },
                        send(msg) {
                            ws.send(JSON.stringify(msg));
                        },
                        close() {
                            ws.close();
                        },
                    },
                    sess.ssid,
                    (id): DocSession => {
                        const raw = localStorage['doc:ss:' + id];
                        return raw ? JSON.parse(raw) : null;
                    },
                );
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
