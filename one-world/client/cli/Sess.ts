import { existsSync, readFileSync, writeFileSync } from 'fs';

const sessFile = './.cli.sess';
export type Sess = { ssid: string; doc?: string };
export const readSess = (): Sess => {
    if (existsSync(sessFile)) {
        return JSON.parse(readFileSync('./.cli.sess', 'utf-8'));
    }
    return { ssid: 'cli' };
};
export const writeSess = (sess: Sess) =>
    writeFileSync(sessFile, JSON.stringify(sess));
