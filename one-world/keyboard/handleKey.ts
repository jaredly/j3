import { handleIdKey } from './handleIdKey';
import { handleTextKey } from './insertId';
import { Config } from './test-utils';
import { handleListKey } from './handleListKey';
import { TestState } from './test-utils';
import { Update, getCurrent } from './utils';
import { Mods } from './handleShiftNav';

export const handleKey = (state: TestState, key: string, config: Config, mods?: Mods): Update | void => {
    const current = getCurrent(state.sel, state.top);
    switch (current.type) {
        case 'id':
            return handleIdKey(config, state.top, state.sel.start.path, current.cursor, key);
        case 'list':
            return handleListKey(config, state.top, state.sel.start.path, current.cursor, key);
        case 'text':
            return handleTextKey(config, state.top, state.sel.start.path, current.cursor, key, mods);
        default:
            throw new Error('not doing');
    }
};
