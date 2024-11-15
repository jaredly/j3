import { handleIdKey } from './flatenate';
import { Config, handleListKey, handleTextKey } from './insertId';
import { TestState } from './test-utils';
import { Update, getCurrent } from './utils';

export const handleKey = (state: TestState, key: string, config: Config): Update | void => {
    const current = getCurrent(state.sel, state.top);
    switch (current.type) {
        case 'id':
            return handleIdKey(config, state.top, state.sel.start.path, current.cursor, key);
        case 'list':
            return handleListKey(config, state.top, state.sel.start.path, current.cursor, key);
        case 'text':
            return handleTextKey(config, state.top, state.sel.start.path, current.cursor, key);
        default:
            throw new Error('not doing');
    }
};
