import { NamespacePlugin } from '../UIState';
import { evaluatorPlugin } from './Evaluator';
import { fixturePlugin } from './Fixtures';

export const plugins: NamespacePlugin<any, any>[] = [
    fixturePlugin,
    evaluatorPlugin,
];
