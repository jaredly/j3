//

import { AnyEnv } from '../../ide/ground-up/FullEvalator';
import { NUIState } from '../UIState';
import { loadEvaluator } from '../../ide/ground-up/loadEv';
import { ImmediateResults } from '../store/getImmediateResults';

export type Message = {
    type: 'initial';
    nodes: ImmediateResults<any>['nodes'];
    evaluator: NUIState['evaluator'];
};
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

type State = {
    evaluator: AnyEnv | null;
};

const queue: Message[] = [];

let state: State | null = null;

let running = false;
const next = async () => {
    if (running || !queue.length) return;
    running = true;
    const msg = queue.shift()!; // TODO can do fancy line skipping things, potentially.
    state = await handleMessage(msg, state);
    running = false;
    next();
};

const handleMessage = async (
    msg: Message,
    state: State | null,
): Promise<State | null> => {
    switch (msg.type) {
        case 'initial': {
            const evaluator: AnyEnv | null = await new Promise((res) =>
                loadEvaluator(msg.evaluator, res),
            );
            console.log('loaded ev', evaluator);

            // STOSHIP: START HERE
            // We want to:
            // - group & sort tops by deps (maybe with caching??? idk.)
            // - do the type inference that's needed
            // - do the evaluation that's needed
            // - send back info, so the web UI can update.

            return { evaluator };
        }
    }
    return null;
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
// postMessage
