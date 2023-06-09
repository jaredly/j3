import * as blake from 'blakejs';

export const makeHash = (map: unknown): string =>
    blake.blake2bHex(JSON.stringify(map));
