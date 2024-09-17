import { SimplestEvaluator } from '../../evaluators/simplest';
import { Caches, Context, evaluate } from '../../graphh/by-hand';

// prevents TS errors
declare var self: Worker;

export {};

export type IncomingMessage = {
    type: 'evaluates';
    // This is gonna be super inefficient
    // lots of duplicate data
    ctx: Context;
    evid: string;
    caches: Caches<unknown>;
    tops: string[];
};

export type OutgoingMessage = {
    type: 'evalauted';
    output: Record<string, any>;
};

self.onmessage = (event: MessageEvent) => {
    const data: IncomingMessage = JSON.parse(event.data);

    if (data.evid !== 'simplest') throw new Error('not it');
    const ev = SimplestEvaluator;
    const output: Record<string, any> = {};

    data.tops.forEach((tid) => {
        output[tid] = evaluate(tid, data.ctx, ev, data.caches);
    });

    postMessage(JSON.stringify({ type: 'evaluated', output }));
};
