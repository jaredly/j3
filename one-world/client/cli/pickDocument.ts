import termkit from 'terminal-kit';
import { Store } from '../StoreContext2';

export const pickDocument = (store: Store, term: termkit.Terminal) => {
    return new Promise<string | null>((resolve, reject) => {
        const state = store.getState();
        const ids = Object.keys(state.documents);
        let sel = 0;

        const draw = () => {
            term.clear();
            // sb.clear()
            for (let i = 0; i <= ids.length; i++) {
                term.moveTo(0, i + 1);
                if (i === ids.length) {
                    if (sel === i) {
                        term.bgGreen('New Document');
                    } else {
                        term('New Document');
                    }
                } else if (sel === i) {
                    term.bgGreen(state.documents[ids[i]].title);
                } else {
                    term(state.documents[ids[i]].title);
                }
            }
        };

        const key = (key: string) => {
            if (key === 'ENTER') {
                term.off('key', key);
                if (sel === ids.length) {
                    resolve(null);
                } else {
                    resolve(ids[sel]);
                }
                return;
            }
            if (key === 'DOWN') {
                sel = Math.min(sel + 1, ids.length);
            }
            if (key === 'UP') {
                sel = Math.max(0, sel - 1);
            }
            if (key === 'ESCAPE') {
                reject('quit');
            }
            draw();
        };

        term.on('key', key);
        draw();
    });
};
