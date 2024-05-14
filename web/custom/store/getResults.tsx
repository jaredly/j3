// import { MetaData, NUIState, RealizedNamespace } from '../UIState';
// import { findTops } from '../../ide/ground-up/findTops';
import { FullEvalator, AnyEnv } from '../../ide/ground-up/FullEvalator';
// import { layout } from '../../../src/layout';
// import { plugins } from '../plugins';
import { NUIResults } from './Store';
// import { Node } from '../../../src/types/cst';
// import { fromMCST } from '../../../src/types/mcst';
// import { filterNulls } from '../old-stuff/filterNulls';
// import { parseNodesAndDeps, sortTopsWithDeps } from './parseNodesAndDeps';
// import { processTypeInference } from './processTypeInference';
// import {
//     handlePluginGroup,
//     evaluateGroup,
//     cacheEvaluation,
// } from './handlePluginGroup';
import { ResultsCache, DepsOrNoDeps, ChangesMap } from './ResultsCache';
// import { Path } from '../../store';
// import { unique } from './unique';
// import { workerPlugins } from '../plugins/worker';

export type { AnyEnv };
export function emptyResults(): NUIResults {
    return {
        jumpToName: {},
        display: {},
        errors: {},
        hashNames: {},
        produce: {},
        hover: {},
        env: { values: {} },
        traces: [],
        pluginResults: {},
        tenv: null,
    };
}

export const registerNames = (
    cache: ResultsCache<any>,
    top: number,
    results: NUIResults,
    idForName: { [name: string]: number },
) => {
    for (let name of cache.deps![top].allNames.global.declarations) {
        results.jumpToName[name.name] = name.loc;
        if (name.kind === 'value') {
            if (idForName[name.name] != null) {
                cache.deps![top].duplicate = true;
                results.produce[top] = [
                    {
                        type: 'error',
                        message: `Name already defined: ${name.name}`,
                    },
                ];

                return true;
            }
            // console.log('cached ...', name.name, top.top);
            idForName[name.name] = top;
        }
    }
};
