import { existsSync, readFileSync, writeFileSync } from 'fs';
import { IRSelection } from '../../shared/IR/intermediate';

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
