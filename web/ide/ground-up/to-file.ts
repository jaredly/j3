import { fromMCST } from '../../../src/types/mcst';
import { NUIState } from '../../custom/UIState';
import { bootstrap } from './bootstrap';
import { findTops } from './findTops';

export function stateToBootstrapJs(state: NUIState) {
    return `return {type: 'bootstrap', stmts: ${JSON.stringify(
        findTops(state)
            .map((stmt) => bootstrap.parse(fromMCST(stmt.top, state.map)).stmt)
            .filter(Boolean),
        null,
        2,
    )}}`;
}
