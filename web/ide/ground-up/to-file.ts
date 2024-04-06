import { fromMCST } from '../../../src/types/mcst';
import { NUIState } from '../../custom/UIState';
import { bootstrap } from './Evaluators';
import { findTops } from './findTops';

export function stateToBootstrapJs(state: NUIState) {
    return `return {type: 'bootstrap', stmts: ${JSON.stringify(
        findTops(state)
            .map((stmt) => bootstrap.parse(fromMCST(stmt.top, state.map), {}))
            .filter(Boolean),
        null,
        2,
    )}}`;
}
