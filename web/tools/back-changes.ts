import { readFileSync, writeFileSync } from 'fs';
import { NUIState } from '../custom/UIState';
import equal from 'fast-deep-equal';

const [_, __, source, sink, message] = process.argv;
if (!sink) {
    const state1: NUIState = JSON.parse(readFileSync(source, 'utf-8'));
    delete state1.trackChanges;
    writeFileSync(source, JSON.stringify(state1));
    process.exit(0);
}
if (!source || !sink || !message) {
    console.log('Need: source sink message');
    process.exit(2);
}

const state1: NUIState = JSON.parse(readFileSync(source, 'utf-8'));
const state2: NUIState = JSON.parse(readFileSync(sink, 'utf-8'));

state2.trackChanges = {
    message,
    previous: {},
};
Object.entries(state2.map).forEach(([key, value]) => {
    if (!equal(value, state1.map[+key])) {
        // const prev = state1.map[+key];
        // if (
        //     prev &&
        //     prev.type === value.type &&
        //     ['list', 'array', 'record'].includes(value.type)
        // ) {
        //     // If the only changes are "an addition", then ... don't bother?
        //     return;
        // }
        state2.trackChanges!.previous[+key] = state1.map[+key] ?? null;
    }
});
Object.keys(state1.map).forEach((key) => {
    if (!state2.map[+key]) {
        state2.trackChanges!.previous[+key] = state1.map[+key];
    }
});

writeFileSync(sink, JSON.stringify(state2));
