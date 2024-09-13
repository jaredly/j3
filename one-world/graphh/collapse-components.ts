import { IDRef } from '../shared/nodes';

export type ComponentsByModule = Record<string, Components>;

export const collectModuleComponents = (
    top: string,
    graphs: ComponentsByModule,
    moduleParents: string[],
    getReferences: (top: string) => IDRef[],
    getModule: (top: string) => string,
) => {
    const module = getModule(top);
    // we've already seen this one
    if (graphs[module]?.pointers[top]) return;

    const graph: Record<string, string[]> = {};
    const ignore = graphs[module] ? Object.keys(graphs[module].pointers) : [];

    const next = (top: string) => {
        if (graph[top]) return; // already seen
        graph[top] = [];
        getReferences(top).forEach((ref) => {
            if (ref.type === 'toplevel') {
                const other = ref.loc[0][0];
                if (ignore.includes(other)) return; // already processed this dep
                const omod = getModule(other);
                if (omod !== module) {
                    if (moduleParents.includes(omod)) {
                        throw new Error(
                            `module dependency cycle ${omod} from ${module} - ${moduleParents.join(
                                ' -> ',
                            )}`,
                        );
                    }
                    collectModuleComponents(
                        other,
                        graphs,
                        moduleParents.concat([module]),
                        getReferences,
                        getModule,
                    );
                } else {
                    graph[top].push(other);
                    next(other);
                }
            }
        });
    };

    next(top);

    const result = collapseComponents(top, graph);

    // The two sets of components are guaranteed to be disjoint, so we can blindly merge these results
    if (graphs[module]) {
        Object.assign(graphs[module].pointers, result.pointers);
        Object.assign(graphs[module].entries, result.entries);
    } else {
        graphs[module] = result;
    }
};

// Tarjin's algorithm
// https://www.baeldung.com/cs/scc-tarjans-algorithm
const findCycles = (top: string, graph: Record<string, string[]>) => {
    const num: Record<string, number> = {};
    const lowest: Record<string, number> = {};
    const visited: Record<string, true> = {};
    const processed: Record<string, true> = {};
    const s: string[] = [];
    let i = 0;

    const components: string[][] = [];

    const dfs = (v: string) => {
        num[v] = i;
        lowest[v] = num[v];
        i++;
        visited[v] = true;
        s.push(v);

        graph[v].forEach((u) => {
            if (!visited[u]) {
                dfs(u);
                lowest[v] = Math.min(lowest[v], lowest[u]);
            } else if (!processed[u]) {
                lowest[v] = Math.min(lowest[v], num[u]);
            }
        });

        processed[v] = true;

        if (lowest[v] === num[v]) {
            let sccVertex = s.pop();
            if (!sccVertex) throw new Error(`ran out of stack`);
            const scc: string[] = [];
            while (sccVertex !== v) {
                scc.push(sccVertex);
                sccVertex = s.pop();
                if (!sccVertex) throw new Error(`ran out of stack`);
            }

            scc.push(sccVertex);
            components.push(scc);
        }
    };

    dfs(top); // everything is reachable from `top`, by definition

    return components;
};

// "Component" here as a "Strongly Connected Component" in a DAG
type Components = {
    // mutual -> "cycle head"
    pointers: Record<string, string>;
    // id -> mutuals
    entries: Record<string, string[]>;
};

const collapseComponents = (
    top: string,
    graph: Record<string, string[]>,
): Components => {
    const components = findCycles(top, graph);

    const pointers: Record<string, string> = {};
    const entries: Record<string, string[]> = {};

    components.forEach((component) => {
        component.sort();
        const first = component[0];
        component.forEach((id) => (pointers[id] = first));
        entries[first] = component;
    });

    return { pointers, entries };
};
