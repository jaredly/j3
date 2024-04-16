//

import { AnyEnv, ProduceItem } from '../../ide/ground-up/FullEvalator';
import { TraceMap, loadEvaluator } from '../../ide/ground-up/loadEv';
import { NUIState } from '../UIState';
import { ImmediateResults, NodeResults } from '../store/getImmediateResults';
import { LocedName } from '../store/sortTops';

import { calculateInitialState } from './calculateInitialState';
import { State } from './types';
import { updateState } from './updateState';

export type Message =
    | {
          type: 'initial';
          nodes: ImmediateResults<any>['nodes'];
          evaluator: NUIState['evaluator'];
      }
    | {
          type: 'update';
          nodes: ImmediateResults<any>['nodes'];
      }
    | { type: 'debug'; execOrder: boolean };

export type Sendable = {
    produce: ProduceItem[];
    errors: Record<number, string[]>;
    hover: Record<number, string[]>;
};

export type ToPage = {
    type: 'results';
    results: Record<number, Sendable>;
};

const sendBack = (msg: ToPage) => postMessage(msg);

// | {
//       type: 'cache';
//       url: string;
//   }
// | {
//       type: 'checknstuff';
//       whatsit: string;
//   }
// | {
//       type: 'update';
//       state: 'whatttt';
//   };

// so ...
// does this mean I'll be maintaining ... a parallel ... state ... something?
// naw, I want to send over ... the nodes. I think.

const handleMessage = async (
    msg: Message,
    state: State | null,
): Promise<State | null> => {
    switch (msg.type) {
        case 'debug':
            if (!state || !state.evaluator) return state;
            return calculateInitialState(
                state.nodes,
                state.evaluator,
                msg.execOrder,
            );
        case 'initial': {
            const evaluator: AnyEnv | null = await new Promise((res) =>
                loadEvaluator(msg.evaluator, res),
            );
            console.log('loaded ev', evaluator);

            if (!evaluator) {
                console.error(`cant load evaluator`);
                return {
                    evaluator: null,
                    nodes: msg.nodes,
                };
            }

            return calculateInitialState(msg.nodes, evaluator, false);
        }
        case 'update': {
            if (!state) throw new Error(`cant update`);
            return updateState(state, msg.nodes);
        }
    }
    return null;
};

const queue: Message[] = [];

let state: State | null = null;

let running = false;
const next = async () => {
    if (running || !queue.length) return;
    running = true;
    const msg = queue.shift()!; // TODO can do fancy line skipping things, potentially.
    state = await handleMessage(msg, state);
    if (state?.results) {
        const updated: Record<number, Sendable> = {};
        let change = false;
        Object.entries(state.results.tops).forEach(
            ([key, { changes, produce, errors, hover }]) => {
                if (changes.results) {
                    // console.log('a top change', key);
                    change = true;
                    updated[+key] = {
                        produce,
                        errors,
                        hover,
                    };
                }
            },
        );
        if (change) {
            sendBack({ type: 'results', results: updated });
        }
    }
    running = false;
    next();
};

const enqueue = (msg: Message) => {
    queue.push(msg);
    next();
};

onmessage = (evt) => {
    enqueue(evt.data as Message);
    // const data = JSON.parse(message.data);
    // switch (data.type) {
    // }
};

postMessage('hi');
