import { Doc, PersistedState, Stage } from '../shared/state';
import {
    existsSync,
    mkdirSync,
    readFileSync,
    readdirSync,
    unlinkSync,
    writeFileSync,
} from 'fs';
import { join } from 'path';
import { Toplevel } from '../shared/toplevels';

export type Change =
    | { type: 'toplevel'; id: string; tl: null | Toplevel }
    | { type: 'document'; id: string; doc: null | Doc };

export const saveChanges = (
    base: string,
    prev: PersistedState,
    next: PersistedState,
) => {
    const changes: Change[] = [];
    if (next.toplevels !== prev.toplevels) {
        Object.keys(prev.toplevels).forEach((k) => {
            if (!next.toplevels[k]) {
                unlinkSync(join(base, 'toplevels', k));
                changes.push({ type: 'toplevel', id: k, tl: null });
            }
        });
        Object.keys(next.toplevels).forEach((k) => {
            if (next.toplevels[k] !== prev.toplevels[k]) {
                writeFileSync(
                    join(base, 'toplevels', k),
                    JSON.stringify(next.toplevels[k]),
                );
                changes.push({
                    type: 'toplevel',
                    id: k,
                    tl: next.toplevels[k],
                });
            }
        });
    }

    if (next.documents !== prev.documents) {
        Object.keys(prev.documents).forEach((k) => {
            if (!next.documents[k]) {
                unlinkSync(join(base, 'documents', k));
                changes.push({ type: 'document', id: k, doc: null });
            }
        });
        Object.keys(next.documents).forEach((k) => {
            if (next.documents[k] !== prev.documents[k]) {
                writeFileSync(
                    join(base, 'documents', k),
                    JSON.stringify(next.documents[k]),
                );
                changes.push({
                    type: 'document',
                    id: k,
                    doc: next.documents[k],
                });
            }
        });
    }

    if (next.namespaces !== prev.namespaces) {
        throw new Error('not save yet');
    }
    if (next.stages !== prev.stages) {
        throw new Error('not save yet');
    }

    return changes;
};

// iff the server is processing actions, and not just blindly storing a full dump
// there's more risk of split brain.
// would there be any use in hashing the result to send back up? or send down a hash of the expected result or something?
// would that actually save time/effort?
export const loadState = (base: string): PersistedState => {
    const state: PersistedState = {
        toplevels: {},
        documents: {},
        namespaces: {},
        stages: {},
    };

    const tl = join(base, 'toplevels');
    mkdirSync(tl, { recursive: true });
    readdirSync(tl).forEach((id) => {
        state.toplevels[id] = JSON.parse(readFileSync(join(tl, id), 'utf8'));
    });

    const doc = join(base, 'documents');
    mkdirSync(doc, { recursive: true });
    readdirSync(doc).forEach((id) => {
        state.documents[id] = JSON.parse(readFileSync(join(doc, id), 'utf8'));
    });

    const stages = join(base, 'stages');
    mkdirSync(stages, { recursive: true });
    readdirSync(stages).forEach((id) => {
        const dr = join(base, 'stages', id);
        const stage: Stage = {
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

    if (existsSync(join(base, 'namespaces.json'))) {
        state.namespaces = JSON.parse(
            readFileSync(join(base, 'namespaces.json'), 'utf-8'),
        );
    }

    return state;
};
