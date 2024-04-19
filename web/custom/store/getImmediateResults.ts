import { useLoadSuggestionMenuItems } from '@blocknote/react';
import { Node } from '../../../src/types/cst';
import { Errors, FullEvalator } from '../../ide/ground-up/FullEvalator';
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
import { Sendable } from '../worker/worker';
import { workerPlugins } from '../plugins/worker';

export type SuccessParsed<Stmt> = {
    type: 'success';
    stmt: Stmt;
    names: LocedName[];
    deps: LocedName[];
    size: null | number;
    // duplicates?: LocedName[];
};

export type PluginParsed = {
    type: 'plugin';
    parsed: any;
    // for now, plugins can't produce definitions...
    // but they do have deps.
    deps: LocedName[];
    size: null | number;
};

export type Parsed<Stmt> =
    | void
    | PluginParsed
    | SuccessParsed<Stmt>
    | { type: 'failure'; errors: Errors };

export const blankInitialResults = (): ImmediateResults<any> => ({
    lastState: null,
    lastEvaluator: null,
    jumpToName: { value: {}, type: {}, tcls: {} },
    nodes: {},
    changes: {},
    topForLoc: {},
});

export type NodeResults<Stmt> = {
    ns: RealizedNamespace;
    // toMCST
    node: Node;
    ids: number[];
    layout: NUIResults['display'];
    parsed: Parsed<Stmt>;
    meta: MetaDataMap;
};

export type ImmediateResults<Stmt> = {
    lastState: null | NUIState;
    lastEvaluator: string | null;

    topForLoc: Record<number, number>;
    jumpToName: {
        value: Record<string, number>;
        type: Record<string, number>;
        tcls: Record<string, number>;
    };
    nodes: {
        [top: number]: NodeResults<Stmt>;
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
    if (
        state.map === results.lastState?.map &&
        state.meta === results.lastState?.meta
    ) {
        results.changes = {};
        return {};
    }

    const tops = findTops(state);

    const nodeChanges: Record<number, number> = {};

    tops.forEach((top) => (results.changes[top.ns.id] = {}));

    const lastState = results.lastState;

    // console.time('get immediate');

    for (let top of tops) {
        const changes = results.changes[top.ns.id];

        // Fresh!
        if (!results.nodes[top.ns.id] || !lastState) {
            results.nodes[top.ns.id] = getFreshResults(top, state, evaluator);
            results.changes[top.ns.id] = allChanged;
            results.nodes[top.ns.id].ids.forEach(
                (id) => (nodeChanges[id] = top.ns.id),
            );
            continue;
        }

        const ncache = results.nodes[top.ns.id];

        changes.plugin = ncache.ns.plugin !== top.ns.plugin;
        ncache.ns = top.ns;

        // Source change!
        const changed = ncache.ids.filter(
            (id) => state.map[id] !== lastState.map[id],
        );
        const topChange = top.top !== lastState.nsMap[top.ns.id].top;
        if (changed.length || topChange) {
            // console.log('map change', top.top);
            changed.forEach((id) => (nodeChanges[id] = top.ns.id));
            const ids: number[] = [];
            const node = fromMCST(top.top, state.map, ids);

            if (topChange) {
                nodeChanges[top.top] = top.ns.id;
            }

            if (!equal(ncache.node, node)) {
                // console.log('node change', top.top);
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
                        nodeChanges[id] = top.ns.id;
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
            // console.log('meta change', top.top);
            metaChanges.forEach((id) => (nodeChanges[id] = top.ns.id));
            ncache.meta = {};
            ncache.ids.forEach((id) => {
                if (state.meta[id]) {
                    ncache.meta[id] = state.meta[id];
                }
            });
        }

        // Parsed change!
        if (!evaluator) {
            recordNodeChanges(ncache.parsed, nodeChanges, top.ns.id);
            changes.parsed = ncache.parsed !== undefined;
            ncache.parsed = undefined;
        } else if (
            changes.plugin ||
            changes.source ||
            evaluator.id !== results.lastEvaluator
        ) {
            // console.log(
            //     'parsing here we are',
            //     top.top,
            //     changes.plugin,
            //     changes.source,
            //     evaluator.id,
            //     results.lastEvaluator,
            // );
            const parsed = getParsed(top.ns.plugin, evaluator, ncache.node);
            if (!equal(parsed, ncache.parsed)) {
                // console.log('parsed change', top.top);
                // NOTE: This is overly conservative, because we're not actually checking
                // if the errors change. Any nodes that have errors, even if they're the
                // same between runs, will get rerendered. I think that's fine.
                recordNodeChanges(ncache.parsed, nodeChanges, top.ns.id);
                recordNodeChanges(parsed, nodeChanges, top.ns.id);
                ncache.parsed = parsed;
                changes.parsed = true;
            }
        }
    }

    // console.time('jump');
    results.jumpToName = { value: {}, type: {}, tcls: {} };
    for (let top of tops) {
        const parsed = results.nodes[top.ns.id].parsed;
        if (parsed?.type === 'success') {
            for (let name of parsed.names) {
                if (results.jumpToName[name.kind][name.name]) {
                    nodeChanges[name.loc] = top.ns.id;
                    // if (!parsed.duplicates) {
                    //     parsed.duplicates = [name];
                    // } else {
                    //     parsed.duplicates.push(name);
                    // }
                } else {
                    results.jumpToName[name.kind][name.name] = name.loc;
                }
            }
        }
    }
    // TODO this is a little leaky, doesn't clean up deleted nodes.
    Object.values(results.nodes).forEach((node) => {
        node.ids.forEach((id) => (results.topForLoc[id] = node.ns.id));
    });

    results.lastState = state;
    results.lastEvaluator = evaluator?.id ?? null;

    // console.timeEnd('get immediate');

    return nodeChanges;
};

const getParsed = (
    pluginConfig: RealizedNamespace['plugin'],
    evaluator: AnyEnv,
    node: Node,
): Parsed<any> => {
    if (pluginConfig) {
        const errors: Errors = {};
        const plugin = workerPlugins[pluginConfig!.id];
        const result = plugin?.parse(node, errors, evaluator);
        if (!result) {
            if (Object.keys(errors).length) {
                return { type: 'failure', errors };
            } else {
                return;
            }
        } else {
            return {
                type: 'plugin',
                parsed: result.parsed,
                deps: result.deps,
                size: null,
            };
        }
    } else {
        const errors: Errors = {};
        const stmt = evaluator?.parse(node, errors);
        if (!stmt) {
            if (Object.keys(errors).length) {
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
                size: evaluator.analysis?.size(stmt) ?? null,
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
    // if (parsed?.type === 'success' && parsed.duplicates) {
    //     parsed.duplicates.forEach(({ loc }) => {
    //         nodeChanges[loc] = top;
    //     });
    // }
};
