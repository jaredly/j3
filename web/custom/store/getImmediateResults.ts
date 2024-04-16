import { useLoadSuggestionMenuItems } from '@blocknote/react';
import { Node } from '../../../src/types/cst';
import { Errors, FullEvalator } from '../../ide/ground-up/Evaluators';
import { Top, findTops } from '../../ide/ground-up/findTops';
import { MetaData, MetaDataMap, NUIState, RealizedNamespace } from '../UIState';
import { ChangesMap, ResultsCache } from './ResultsCache';
import { NUIResults } from './Store';
import { LocedName } from './sortTops';
import { fromMCST, layoutEqual } from '../../../src/types/mcst';
import equal from 'fast-deep-equal';
import { layout } from '../../../src/layout';
import { plugins } from '../plugins';
import { AnyEnv } from './getResults';

export type Parsed<Stmt> =
    | void
    | {
          type: 'plugin';
          parsed: any;
          // for now, plugins can't produce definitions...
          // but they do have deps.
          deps: LocedName[];
      }
    | {
          type: 'success';
          stmt: Stmt;
          names: LocedName[];
          deps: LocedName[];
          duplicates?: LocedName[];
      }
    | {
          type: 'failure';
          errors: Errors;
      };

export const blankInitialResults = (): ImmediateResults<any> => ({
    lastState: null,
    lastEvaluator: null,
    jumpToName: { value: {}, type: {} },
    nodes: {},
    changes: {},
});

export type ImmediateResults<Stmt> = {
    lastState: null | NUIState;
    lastEvaluator: string | null;

    jumpToName: {
        value: Record<string, number>;
        type: Record<string, number>;
    };
    nodes: {
        [top: number]: {
            ns: RealizedNamespace;
            // toMCST
            node: Node;
            ids: number[];
            layout: NUIResults['display'];
            parsed: Parsed<Stmt>;
            meta: MetaDataMap;
        };
    };

    changes: Record<
        number,
        {
            plugin?: boolean;
            meta?: boolean;
            source?: boolean;
            // This gives us access to the "previous parsedness"
            // so we can know what individual MNodes to update, e.g.
            // if the "error status" changed.
            parsed?: boolean;
        }
    >;
};

const allChanged = {
    meta: true,
    parsed: true,
    plugin: true,
    source: true,
};

// Ok, so for *reasons*, it would be great to be able to know
// that a given cache item changed since last time, so I could
// send over the deets to the webworker.
// yeah.
// well.
// I guess `cache.changes` ... would let us know, right?
export const getImmediateResults = <
    Env extends { values: { [key: string]: any } },
    Stmt,
    Expr,
>(
    state: NUIState,
    evaluator: FullEvalator<Env, Stmt, Expr> | null,
    results: ImmediateResults<Stmt>,
) => {
    const tops = findTops(state);

    const nodeChanges: Record<number, number> = {};

    tops.forEach((top) => (results.changes[top.top] = {}));

    const lastState = results.lastState;

    for (let top of tops) {
        const changes = results.changes[top.top];

        // Fresh!
        if (!results.nodes[top.top] || !lastState) {
            results.nodes[top.top] = getFreshResults(top, state, evaluator);
            results.changes[top.top] = allChanged;
            results.nodes[top.top].ids.forEach(
                (id) => (nodeChanges[id] = top.top),
            );
            continue;
        }

        const ncache = results.nodes[top.top];

        changes.plugin = ncache.ns.plugin !== top.ns.plugin;
        ncache.ns = top.ns;

        // Source change!
        const changed = ncache.ids.filter(
            (id) => state.map[id] !== lastState.map[id],
        );
        if (changed.length) {
            console.log('map change', top.top);
            changed.forEach((id) => (nodeChanges[id] = top.top));
            const ids: number[] = [];
            const node = fromMCST(top.top, state.map, ids);

            if (!equal(ncache.node, node)) {
                console.log('node change', top.top);
                changes.source = true;
                ncache.node = node;
                ncache.ids = ids;
                const prevLayout = ncache.layout;
                ncache.layout = {};
                layout(top.top, 0, state.map, ncache.layout, {}, true);
                ncache.ids.forEach((id) => {
                    if (
                        !layoutEqual(
                            prevLayout[id]?.layout,
                            ncache.layout[id]?.layout,
                        )
                    ) {
                        nodeChanges[id] = top.top;
                    }
                });
            }
        }

        // Meta change!
        const metaChanges = ncache.ids.filter(
            (id) => state.meta[id] !== ncache.meta[id],
        );
        changes.meta = metaChanges.length > 0;
        if (changes.meta) {
            console.log('meta change', top.top);
            metaChanges.forEach((id) => (nodeChanges[id] = top.top));
            ncache.meta = {};
            ncache.ids.forEach((id) => {
                if (state.meta[id]) {
                    ncache.meta[id] = state.meta[id];
                }
            });
        }

        // Parsed change!
        if (!evaluator) {
            recordNodeChanges(ncache.parsed, nodeChanges, top.top);
            changes.parsed = ncache.parsed !== undefined;
            ncache.parsed = undefined;
        } else if (
            changes.plugin ||
            changes.source ||
            evaluator.id !== results.lastEvaluator
        ) {
            const parsed = getParsed(top.ns.plugin, evaluator, ncache.node);
            if (!equal(parsed, ncache.parsed)) {
                console.log('parsed change', top.top);
                // NOTE: This is overly conservative, because we're not actually checking
                // if the errors change. Any nodes that have errors, even if they're the
                // same between runs, will get rerendered. I think that's fine.
                recordNodeChanges(ncache.parsed, nodeChanges, top.top);
                recordNodeChanges(parsed, nodeChanges, top.top);
                ncache.parsed = parsed;
                changes.parsed = true;
            }
        }
    }

    results.jumpToName = { value: {}, type: {} };
    for (let top of tops) {
        const parsed = results.nodes[top.top].parsed;
        if (parsed?.type === 'success') {
            for (let name of parsed.names) {
                if (results.jumpToName[name.kind][name.name]) {
                    nodeChanges[name.loc] = top.top;
                    if (!parsed.duplicates) {
                        parsed.duplicates = [name];
                    } else {
                        parsed.duplicates.push(name);
                    }
                } else {
                    results.jumpToName[name.kind][name.name] = name.loc;
                }
            }
        }
    }

    results.lastState = state;

    return nodeChanges;
};

const getParsed = (
    pluginConfig: RealizedNamespace['plugin'],
    evaluator: AnyEnv,
    node: Node,
): Parsed<any> => {
    if (pluginConfig) {
        const errors: Errors = {};
        const plugin = plugins.find((p) => p.id === pluginConfig!.id);
        const result = plugin?.parse(node, errors, evaluator);
        if (!result) {
            if (Object.keys(errors)) {
                return { type: 'failure', errors };
            } else {
                return;
            }
        } else {
            return {
                type: 'plugin',
                parsed: result.parsed,
                deps: result.deps,
            };
        }
    } else {
        const errors: Errors = {};
        const stmt = evaluator?.parse(node, errors);
        if (!stmt) {
            if (Object.keys(errors)) {
                return { type: 'failure', errors };
            } else {
                return undefined;
            }
        } else {
            // OK we're maybe duplicating this work, sometimes.
            // but I'm fine with it.
            const deps = evaluator?.analysis?.dependencies(stmt) ?? [];
            const names = evaluator?.analysis?.stmtNames(stmt) ?? [];
            return {
                type: 'success',
                stmt,
                deps,
                names,
            };
        }
    }
};

function getFreshResults<
    Env extends { values: { [key: string]: any } },
    Stmt,
    Expr,
>(top: Top, state: NUIState, evaluator: FullEvalator<Env, Stmt, Expr> | null) {
    const ids: number[] = [];
    const node = fromMCST(top.top, state.map, ids);
    const layoutDisplay: NUIResults['display'] = {};
    layout(top.top, 0, state.map, layoutDisplay, {}, true);

    const meta: MetaDataMap = {};
    ids.forEach((id) => {
        if (state.meta[id]) {
            meta[id] = state.meta[id];
        }
    });

    return {
        ns: top.ns,
        ids,
        node,
        meta,
        layout: layoutDisplay,
        parsed: evaluator
            ? getParsed(top.ns.plugin, evaluator, node)
            : undefined,
    };
}

const recordNodeChanges = (
    parsed: Parsed<unknown> | undefined,
    nodeChanges: Record<number, number>,
    top: number,
) => {
    if (parsed?.type === 'failure') {
        // got to clear error marks
        Object.keys(parsed.errors).forEach((id) => {
            nodeChanges[+id] = top;
        });
    }
    if (parsed?.type === 'success' && parsed.duplicates) {
        parsed.duplicates.forEach(({ loc }) => {
            nodeChanges[loc] = top;
        });
    }
};
