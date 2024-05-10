import { WorkerPlugin } from '../UIState';
import { evaluatorWorker } from './evaluatorWorker';
import { fixtureWorker } from './fixtureWorker';

export const workerPlugins: Record<string, WorkerPlugin<any, any, any>> = {
    fixture: fixtureWorker,
    evaluator: evaluatorWorker,
};
