import { existsSync, readFileSync, unlinkSync, writeFileSync } from 'fs';
import { IRSelection } from '../../shared/IR/intermediate';
import { Store } from '../StoreContext2';
import { DocSelection } from '../../shared/state2';

const sessFile = './.cli.sess';
export type Sess = { ssid: string; doc: string; selection: DocSelection[] };
export const readSess = (): Sess | null => {
    if (existsSync(sessFile)) {
        return JSON.parse(readFileSync('./.cli.sess', 'utf-8'));
    }
    return null;
};
export const writeSess = (sess: Sess | null) => {
    if (sess == null) {
        unlinkSync(sessFile);
    } else {
        writeFileSync(sessFile, JSON.stringify(sess));
    }
};

// export function trackSelection(
//     store: Store,
//     docId: string,
//     writeSess: () => void,
// ) {
//     const unsel = store.on('selection', () => {
//         sess.selection = store.getDocSession(docId).selections;
//         writeSess(sess);
//     });

//     process.on('beforeExit', () => {
//         unsel();
//         store.update({ type: 'selection', doc: docId, selections: [] });
//     });
//     return unsel;
// }
