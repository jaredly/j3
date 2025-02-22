import { _applyUpdate, applyUpdate } from '../keyboard/applyUpdate';
import { Config } from '../keyboard/test-utils';
import { init, TestState } from '../keyboard/test-utils';
import { keyUpdate } from '../keyboard/ui/keyUpdate';

export const cread = (gremes: string[], config: Config): TestState => {
    let state = init;
    gremes.forEach((greme) => {
        state = _applyUpdate(state, keyUpdate(state, greme, {}, undefined, config));
    });
    return state;
};
