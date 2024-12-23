// import equal from 'fast-deep-equal';
// import { MyEvalError } from '../../ide/ground-up/Evaluators';
// import { DepsOrNoDeps } from './ResultsCache';
// import { ResultsEnv } from './getResults';

import { nodeToString } from '../../../src/to-cst/nodeToString';
import { Node } from '../../../src/types/cst';
import { Map, toMCST } from '../../../src/types/mcst';
import { InferenceError } from '../../ide/ground-up/FullEvalator';
import { renderNodeToString } from '../../ide/ground-up/renderNodeToString';

export const locedErrors = (
    err: InferenceError,
): { loc: number; text: string }[] => {
    switch (err.type) {
        case 'with-items':
            return err.items.map((item) => ({
                loc: item.loc,
                text: showError(err),
            }));
        case 'missing':
            return err.missing.map((err) => ({
                loc: err.loc,
                text: `Missing ${err.name}`,
            }));
        case 'nested':
            return locedErrors(err.inner);
        case 'types':
            const text = showError(err);
            return [
                { loc: err.one.loc, text },
                { loc: err.two.loc, text },
            ];
    }
};

export const showError = (err: InferenceError): string => {
    if (err.type === 'with-items') {
        return `${err.message}${err.items
            .map((item) => `\n - ${item.name} (${item.loc})`)
            .join('')}`;
    }
    if (err.type === 'missing') {
        return `Missing items: ${err.missing
            .map(({ name, loc, type }) => `\n - ${name} (${loc})`)
            .join('')}`;
    }
    if (err.type === 'nested') {
        return `${showError(err.inner)}\n -> \n${showError(err.outer)}`;
    }
    if (err.type === 'types') {
        return `Types dont match\n${nodeToString(err.one, null)} (${
            err.one.loc
        })\nvs\n${nodeToString(err.two, null)} (${err.two.loc})`;
    }
    return 'some other inference error idk ' + JSON.stringify(err);
};
