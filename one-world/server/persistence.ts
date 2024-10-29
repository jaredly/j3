import { Doc, DocStage, PersistedState } from '../shared/state2';
import {
    existsSync,
    mkdirSync,
    readFileSync,
    readdirSync,
    unlinkSync,
    writeFileSync,
} from 'fs';
import { join } from 'path';
import { Toplevel, Toplevels } from '../shared/toplevels';

export type Change =
    | { type: 'toplevel'; id: string; tl: null | Toplevel }
    | { type: 'document'; id: string; doc: null | Doc }
    | { type: 'stage'; id: string; stage: null | DocStage };

export const saveChanges = (
    base: string,
    prev: FullServerState,
    next: FullServerState,
) => {
    const changes: Change[] = [];
    if (next._toplevels !== prev._toplevels) {
        Object.keys(prev._toplevels).forEach((k) => {
            if (!next._toplevels[k]) {
                unlinkSync(join(base, 'toplevels', k));
                changes.push({ type: 'toplevel', id: k, tl: null });
            }
        });
        Object.keys(next._toplevels).forEach((k) => {
            if (next._toplevels[k] !== prev._toplevels[k]) {
                writeFileSync(
                    join(base, 'toplevels', k),
                    JSON.stringify(next._toplevels[k]),
                );
                changes.push({
                    type: 'toplevel',
                    id: k,
                    tl: next._toplevels[k],
                });
            }
        });
    }

    if (next._documents !== prev._documents) {
        Object.keys(prev._documents).forEach((k) => {
            if (!next._documents[k]) {
                console.log('Deleting document', k);
                unlinkSync(join(base, 'documents', k));
                changes.push({ type: 'document', id: k, doc: null });
            }
        });
        Object.keys(next._documents).forEach((k) => {
            if (next._documents[k] !== prev._documents[k]) {
                writeFileSync(
                    join(base, 'documents', k),
                    JSON.stringify(next._documents[k]),
                );
                changes.push({
                    type: 'document',
                    id: k,
                    doc: next._documents[k],
                });
            }
        });
    }

    if (next.stages !== prev.stages) {
        Object.keys(prev.stages).forEach((k) => {
            if (!next.stages[k]) {
                console.log('Deleting stage', k);
                unlinkSync(join(base, 'stages', k));
                changes.push({ type: 'stage', id: k, stage: null });
            }
        });
        Object.keys(next.stages).forEach((k) => {
            if (next.stages[k] !== prev.stages[k]) {
                const tdir = join(base, 'stages', k, 'toplevels');
                mkdirSync(tdir, { recursive: true });
                writeFileSync(
                    join(base, 'stages', k, 'info.json'),
                    JSON.stringify({ ...next.stages[k], toplevels: {} }),
                );
                Object.keys(next.stages[k].toplevels).forEach((id) => {
                    const nwt = next.stages[k].toplevels[id];
                    const owt = prev.stages[k]?.toplevels[id];
                    if (nwt !== owt) {
                        writeFileSync(join(tdir, id), JSON.stringify(nwt));
                    }
                });
                changes.push({ type: 'stage', id: k, stage: next.stages[k] });
            }
        });
    }

    if (next.modules !== prev.modules) {
        throw new Error('not save yet');
    }

    return changes;
};

export type FullServerState = {
    _toplevels: Toplevels;
    _documents: Record<string, Doc>;
    // moduleid -> (name -> moduleid)
    modules: Record<string, Record<string, string>>;
    stages: Record<string, DocStage>;
};
// iff the server is processing actions, and not just blindly storing a full dump
// there's more risk of split brain.
// would there be any use in hashing the result to send back up? or send down a hash of the expected result or something?
// would that actually save time/effort?
export const loadState = (base: string): FullServerState => {
    const state: FullServerState = {
        _toplevels: {},
        _documents: {},
        modules: {},
        stages: {},
    };

    const tl = join(base, 'toplevels');
    mkdirSync(tl, { recursive: true });
    readdirSync(tl).forEach((id) => {
        state._toplevels[id] = JSON.parse(readFileSync(join(tl, id), 'utf8'));
        if (!state._toplevels[id].auxiliaries) {
            state._toplevels[id].auxiliaries = [];
        }
    });

    const doc = join(base, 'documents');
    mkdirSync(doc, { recursive: true });
    readdirSync(doc).forEach((id) => {
        state._documents[id] = JSON.parse(readFileSync(join(doc, id), 'utf8'));
    });

    const stages = join(base, 'stages');
    mkdirSync(stages, { recursive: true });
    readdirSync(stages).forEach((id) => {
        const dr = join(base, 'stages', id);
        const stage: DocStage = {
            ...JSON.parse(readFileSync(join(dr, 'info.json'), 'utf8')),
            toplevels: {},
        };
        readdirSync(join(dr, 'toplevels')).forEach((name) => {
            stage.toplevels[name] = JSON.parse(
                readFileSync(join(dr, 'toplevels', name), 'utf-8'),
            );
        });
        state.stages[id] = stage;
    });

    if (existsSync(join(base, 'modules.json'))) {
        state.modules = JSON.parse(
            readFileSync(join(base, 'modules.json'), 'utf-8'),
        );
    }

    return state;
};
