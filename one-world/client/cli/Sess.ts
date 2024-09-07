import { existsSync, readFileSync, writeFileSync } from 'fs';
import { IRSelection } from '../../shared/IR/intermediate';
import { Store } from '../StoreContext2';

const sessFile = './.cli.sess';
export type Sess = { ssid: string; doc?: string; selection?: IRSelection[] };
export const readSess = (): Sess => {
    if (existsSync(sessFile)) {
        return JSON.parse(readFileSync('./.cli.sess', 'utf-8'));
    }
    return { ssid: 'cli' };
};
export const writeSess = (sess: Sess) =>
    writeFileSync(sessFile, JSON.stringify(sess));
export function trackSelection(store: Store, sess: Sess, docId: string) {
    const unsel = store.on('selection', () => {
        sess.selection = store.getDocSession(docId).selections;
        writeSess(sess);
    });

    process.on('beforeExit', () => {
        unsel();
        store.update({ type: 'selection', doc: docId, selections: [] });
    });
    return unsel;
}
