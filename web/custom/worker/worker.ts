//

import { AnyEnv, ProduceItem } from '../../ide/ground-up/FullEvalator';
import { TraceMap, loadEvaluator } from '../../ide/ground-up/loadEv';
import { NUIState } from '../UIState';
import { ImmediateResults, NodeResults } from '../store/getImmediateResults';
import { LocedName } from '../store/sortTops';

import { calculateInitialState } from './calculateInitialState';
import { HoverContents, State } from './types';
import { updateState } from './updateState';

export type Message =
    | {
          type: 'initial';
          nodes: ImmediateResults<any>['nodes'];
          evaluator: NUIState['evaluator'];
          id: number;
      }
    | {
          type: 'update';
          nodes: ImmediateResults<any>['nodes'];
          id: number;
      }
    | {
          type: 'trigger';
          tid: number;
          id: number;
      }
    | {
          type: 'ask:response';
          tid: number;
          value: any;
          id: number;
      }
    | { type: 'debug'; execOrder: boolean; id: number; showJs: boolean };
// | { type: 'plugin'; id: number; top: number };

const mergeMessages = (last: Message, next: Message) => {
    if (last.type === 'update' && next.type === 'update') {
        Object.assign(last.nodes, next.nodes);
        last.id = next.id;
        return true;
    }
    return false;
};

export type Sendable = {
    produce: ProduceItem[];
    errors: Record<number, string[]>;
    hover: Record<number, HoverContents[]>;
    usages: Record<number, number[]>;
    pluginResults: any;
};

export type ToPage =
    | {
          type: 'results';
          results: Record<number, Sendable>;
          traces: TraceMap;
          id: number;
      }
    | {
          type: 'async';
          tid: number;
          produce: ProduceItem[];
          waiting: boolean;
          id: number;
      };
// | { type: 'plugin'; id: number };

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
            if (
                !state ||
                !state.evaluator ||
                (msg.execOrder === state.debugExecOrder &&
                    msg.showJs === state.debugShowJs)
            )
                return state;
            return calculateInitialState(
                state.nodes,
                state.evaluator,
                msg.execOrder,
                msg.showJs,
            );
        case 'initial': {
            const evaluator: AnyEnv | null = await new Promise((res) =>
                loadEvaluator(msg.evaluator, res),
            );
            console.log('loaded ev', evaluator);

            if (!evaluator) {
                // console.error(`cant load evaluator?`);
                return {
                    evaluator: null,
                    nodes: msg.nodes,
                    asyncFns: { fns: {}, nid: 0 },
                };
            }

            return calculateInitialState(msg.nodes, evaluator, false, false);
        }
        case 'update': {
            if (!state) throw new Error(`cant update`);
            return updateState(state, msg.nodes);
        }
        case 'trigger': {
            if (!state) return null;
            state.asyncFns.fns[msg.tid](
                (produce: ProduceItem[], waiting: boolean) => {
                    sendBack({
                        type: 'async',
                        id: msg.id,
                        produce,
                        tid: msg.tid,
                        waiting,
                    });
                },
            );
            // delete state.asyncFns.fns[msg.tid];
            return state;
        }
        case 'ask:response': {
            if (!state) return null;
            if (!state.asyncFns.fns[msg.tid]) {
                console.warn('ask already responded...');
                return state;
            }
            state.asyncFns.fns[msg.tid](msg.value);
            delete state.asyncFns.fns[msg.tid];
            return state;
        }
        default:
            console.log('unexpected message', msg);
    }
    return null;
};

const queue: Message[] = [];

let state: State | null = null;

let running = false;
const next = async () => {
    if (running || !queue.length) return;
    running = true;
    const msg = queue.shift()!;
    state = await handleMessage(msg, state);
    if (
        state?.results &&
        msg.type !== 'trigger' &&
        msg.type !== 'ask:response'
    ) {
        const updated: Record<number, Sendable> = {};
        const traces: TraceMap = {};
        Object.values(state.results.groups).forEach((group) => {
            Object.assign(traces, group.traces);
        });
        Object.entries(state.results.tops).forEach(
            ([
                key,
                { changes, produce, errors, usages, hover, pluginResults },
            ]) => {
                if (changes.results) {
                    updated[+key] = {
                        produce,
                        errors,
                        hover,
                        pluginResults,
                        usages,
                    };
                }
            },
        );
        // Sanitize the traces
        Object.values(traces).forEach((v) => {
            v.forEach((trace, i) => {
                v[i] = trace.map((t) => {
                    try {
                        structuredClone(t);
                        return t;
                    } catch (err) {
                        return {
                            type: 'ttext',
                            '0': 'Unable to clone to send from webworker',
                        };
                    }
                });
            });
        });
        sendBack({ type: 'results', results: updated, id: msg.id, traces });
    }
    running = false;
    // Wait a tick before handling the next one
    setTimeout(() => {
        next();
    }, 10);
};

const enqueue = (msg: Message) => {
    const last = queue.length > 0 ? queue[queue.length - 1] : null;
    // console.log(`here we are`, queue, queue.length, queue[queue.length - 1]);
    if (last && mergeMessages(last, msg)) {
        // console.log('merged');
        setTimeout(() => {
            next();
        }, 10);
        return;
    }
    queue.push(msg);
    // console.log(`enqueued message`, queue.length, last, msg.type);
    setTimeout(() => {
        next();
    }, 10);
};

onmessage = (evt) => {
    enqueue(evt.data as Message);
    // const data = JSON.parse(message.data);
    // switch (data.type) {
    // }
};
