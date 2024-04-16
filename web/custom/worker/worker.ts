//

import { AnyEnv, ProduceItem } from '../../ide/ground-up/FullEvalator';
import { MetaDataMap, NUIState } from '../UIState';
import { TraceMap, loadEvaluator } from '../../ide/ground-up/loadEv';
import {
    ImmediateResults,
    NodeResults,
    SuccessParsed,
} from '../store/getImmediateResults';
import { depSort } from '../store/depSort';
import { filterNulls } from '../old-stuff/filterNulls';
import { LocedName } from '../store/sortTops';
import { showError } from '../store/processTypeInference';
import { displayFunction } from '../store/displayFunction';

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

type Sortable = {
    id: number;
    names: LocedName[];
    deps: LocedName[];
    isPlugin: boolean;
};

type Tenv = { _type: 'tenv' };
type Env = { values: { [key: string]: any } };

type AsyncResults = {
    tops: Record<
        number,
        {
            produce: ProduceItem[];
            changes: { type?: boolean; value?: boolean; results?: boolean };
            errors: Record<number, string[]>;
            hover: Record<number, string[]>;
            pluginResults?: any;
            values: Record<string, any>;
        }
    >;

    // We cache the sort order. If a node comes in w/ different
    // names or deps, we re-sort (?). Well, maybe we could
    // first "check" to see if it's sorted correctly. And if not,
    // we re-shuffle everything.
    sorted: Sortable[][];

    groups: Record<
        string,
        {
            tops: number[];
            tenv: Tenv | null;
            traces: TraceMap;
        }
    >;
};

type State = {
    evaluator: AnyEnv | null;
    nodes: ImmediateResults<any>['nodes'];
    results?: AsyncResults;
};

const add = <K extends string | number, T>(
    obj: Record<K, T[]>,
    k: K,
    item: T,
) => {
    if (!obj[k]) obj[k] = [item];
    else obj[k].push(item);
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

            if (!evaluator) {
                console.error(`cant load evaluator`);
                return {
                    evaluator: null,
                    nodes: msg.nodes,
                };
            }

            return calculateInitialState(msg.nodes, evaluator);
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
    running = false;
    next();
};

const nodeToSortable = (node: NodeResults<any>): Sortable | null => {
    if (node.parsed?.type === 'plugin') {
        return {
            id: node.ns.id,
            deps: node.parsed.deps,
            names: [],
            isPlugin: true,
        };
    } else if (node.parsed?.type === 'success') {
        return {
            id: node.ns.id,
            deps: node.parsed.deps,
            names: node.parsed.names,
            isPlugin: false,
        };
    } else {
        return null;
    }
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

function calculateInitialState(nodes: Message['nodes'], evaluator: AnyEnv) {
    const topForLoc: Record<number, number> = {};
    Object.values(nodes).forEach((node) => {
        node.ids.forEach((id) => (topForLoc[id] = node.ns.id));
    });

    const sorted = depSort(
        Object.values(nodes).map(nodeToSortable).filter(filterNulls),
    );

    const results: AsyncResults = {
        groups: {},
        sorted,
        tops: {},
    };
    Object.keys(nodes).forEach((id) => {
        results.tops[+id] = {
            changes: { results: true },
            errors: {},
            hover: {},
            produce: [],
            values: {},
        };
    });

    for (let group of sorted) {
        const groupKey = group.map((g) => g.id).join(';');
        results.groups[groupKey] = {
            tenv: null,
            tops: group.map((g) => g.id),
            traces: {},
        };
    }

    if (evaluator.inference) {
        let tenv = evaluator.inference.initType();
        for (let group of sorted) {
            if (group.length === 1 && group[0].isPlugin) {
                // tbh
                continue;
            }
            const { result, typesAndLocs } = evaluator.inference.infer(
                group.map(
                    (g) => (nodes[g.id].parsed as SuccessParsed<any>).stmt,
                ),
                tenv,
            );

            const groupKey = group.map((g) => g.id).join(';');
            typesAndLocs.forEach(({ loc, type }) => {
                add(
                    results.tops[topForLoc[loc]].hover,
                    loc,
                    evaluator.inference!.typeToString(type),
                );
            });
            // hovers[groupKey] = groupHover;
            if (result.type === 'err') {
                const text = showError(result.err);
                result.err.items.forEach(({ loc }) => {
                    add(results.tops[topForLoc[loc]].errors, loc, text);
                });
                group.forEach((g) =>
                    results.tops[g.id].produce.push({
                        type: 'error',
                        message: text,
                    }),
                );
                continue;
            }
            results.groups[groupKey].tenv = result.value;

            tenv = evaluator.inference.addTypes(tenv, result.value);

            for (let one of group) {
                for (let { name, kind } of one.names) {
                    if (kind === 'value') {
                        const t = evaluator.inference!.typeForName(tenv, name);
                        results.tops[one.id].produce.push(
                            t
                                ? evaluator.inference!.typeToString(t)
                                : `No type for ${name}`,
                        );
                    }
                }
            }
        }
    }

    let env = evaluator.init();
    for (let group of sorted) {
        if (group.length === 1 && group[0].isPlugin) {
            // umm gotta plugin please
            continue;
        }
        const groupKey = group.map((g) => g.id).join(';');
        const stmts = group.map(
            (g) => (nodes[g.id].parsed as SuccessParsed<any>).stmt,
        );
        const meta: MetaDataMap = {};
        group.forEach((one) => {
            const node = nodes[one.id];
            Object.assign(meta, node.meta);
        });

        const renderValue = displayFunction(
            group.length === 1 ? nodes[group[0].id].ns.display : undefined,
        );
        const added = evaluator.addStatements(
            stmts,
            env,
            meta,
            results.groups[groupKey].traces,
            renderValue,
        );

        group.forEach((one) => {
            const node = nodes[one.id];
            if (node.parsed?.type === 'success') {
                node.parsed.names.forEach((name) => {
                    if (name.kind === 'value') {
                        results.tops[one.id].values[name.name] =
                            added.values[name.name];
                    }
                });
            }
        });

        Object.entries(added.display).forEach(([key, produce]) => {
            results.tops[+key].produce.push(
                ...(Array.isArray(produce) ? produce : [produce]),
            );
        });
    }

    return { evaluator, nodes: nodes, results };
}
// postMessage
