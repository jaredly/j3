import { applyUpdate } from '../keyboard/applyUpdate';
import { Config } from '../keyboard/insertId';
import { init, TestState } from '../keyboard/test-utils';
import { keyUpdate } from '../keyboard/ui/keyUpdate';

export const cread = (gremes: string[], config: Config): TestState => {
    let state = init;
    gremes.forEach((greme) => {
        state = applyUpdate(state, keyUpdate(state, greme, {}, undefined, config));
    });
    return state;
};
