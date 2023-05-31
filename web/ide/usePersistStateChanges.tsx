import { useEffect, useMemo, useRef } from 'react';
import { HistoryItem, Library, Sandbox } from '../../src/to-ast/library';
import { UIState } from '../custom/UIState';
import {
    addUpdateHistoryItems,
    addUpdateNodes,
    updateSandboxUpdatedDate,
} from '../../src/db/sandbox';
import { Db } from '../../src/db/tables';
import { HashedTree } from '../../src/db/hash-tree';
import { addDefinitions, addNamespaces } from '../../src/db/library';
import { IDEState } from './IDE';
import { UpdateMap } from '../../src/state/getKeyUpdate';

// so
// like the sandbox meta
// right?

export type DBUpdate =
    | { type: 'sandbox-updated'; id: string; updated: number }
    | {
          type: 'sandbox-nodes';
          id: string;
          map: UpdateMap;
      }
    | {
          type: 'sandbox-history';
          id: string;
          history: Sandbox['history'];
      }
    | {
          type: 'names';
          namespaces: Library['namespaces'];
          root: { hash: string; date: number };
      }
    | {
          type: 'definitions';
          definitions: Library['definitions'];
      };

export const applyChanges = async (db: Db, changes: DBUpdate[]) => {
    await db.transact(async () => {
        for (let change of changes) {
            switch (change.type) {
                case 'sandbox-updated':
                    await updateSandboxUpdatedDate(
                        db,
                        change.id,
                        change.updated,
                    );
                    break;
                case 'sandbox-nodes':
                    await addUpdateNodes(db, change.id, change.map);
                    break;
                case 'sandbox-history':
                    await addUpdateHistoryItems(db, change.id, change.history);
                    break;
                case 'definitions':
                    await addDefinitions(db, change.definitions);
                    break;
                case 'names':
                    await addNamespaces(db, change.namespaces, change.root);
                    break;
            }
        }
    });
};

export function collectDatabaseChanges(
    last: UIState,
    next: UIState,
    id: string,
) {
    const changes: DBUpdate[] = [];
    if (last.ctx.global.library !== next.ctx.global.library) {
        // console.log('library change');
        const lg = last.ctx.global.library;
        const ng = next.ctx.global.library;
        if (lg.definitions !== ng.definitions) {
            const definitions: Library['definitions'] = {};
            Object.keys(ng.definitions).forEach((k) => {
                if (!lg.definitions[k]) {
                    definitions[k] = ng.definitions[k];
                }
            });
            changes.push({ type: 'definitions', definitions });
        }
        if (lg.namespaces !== ng.namespaces) {
            const ns: HashedTree = {};
            Object.keys(ng.namespaces).forEach((k) => {
                if (!lg.namespaces[k]) {
                    ns[k] = ng.namespaces[k];
                }
            });
            if (ng.history[0].hash !== ng.root) {
                throw new Error(
                    `Inconsistent root vs history in new namespaces`,
                );
            }
            changes.push({
                type: 'names',
                namespaces: ns,
                root: ng.history[0],
            });
        }
    }
    if (last.history !== next.history) {
        // Possibilities:
        // - we've done an `undo`
        //

        const map: UpdateMap = {};
        const hist: HistoryItem[] = [];
        for (let i = 0; i < next.history.length; i++) {
            if (next.history[i] !== last.history[i]) {
                Object.assign(map, next.history[i].map);
                hist.push(next.history[i]);
            }
        }
        changes.push({ type: 'sandbox-nodes', map, id });
        changes.push({ type: 'sandbox-history', history: hist, id });
        changes.push({
            type: 'sandbox-updated',
            id,
            updated: Date.now() / 1000,
        });
    }
    return changes;
}

export function usePersistStateChanges(db: Db, state: IDEState) {
    const enqueueChanges = useMemo(() => {
        let allChanges: DBUpdate[] = [];
        let waiting = false;

        const tick = () => {
            if (waiting) return;
            let toApply = allChanges;
            allChanges = [];
            waiting = true;
            applyChanges(db, toApply).then(
                () => {
                    waiting = false;
                    // Trampoline it up
                    if (allChanges.length) {
                        tick();
                    }
                },
                (err) => {
                    console.error(err);
                    allChanges = toApply.concat(allChanges);
                    waiting = false;
                    // Don't loop, but try again the next time?
                },
            );
        };

        return (changes: DBUpdate[]) => {
            allChanges.push(...changes);
            tick();
        };
    }, []);

    const lastPersisted = useRef(state);
    useEffect(() => {
        const last = lastPersisted.current;
        lastPersisted.current = state;

        // ummmmm we'll have to handle asynchrony, right?
        if (
            last.current.type === 'sandbox' &&
            state.current.type === 'sandbox'
        ) {
            if (last.current.id !== state.current.id) {
                return;
            }
            const changes = collectDatabaseChanges(
                last.current.state,
                state.current.state,
                state.current.id,
            );
            if (!changes.length) {
                return;
            }
            // console.log('got changes', changes);
            enqueueChanges(changes);
        }
    }, [state]);
}
