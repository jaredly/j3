import { AutoCompleteReplace } from '../../src/to-ast/Ctx';
import { type ClipboardItem } from '../../src/state/clipboard';
import {
    State,
    Mods,
    StateChange,
    StateUpdate,
    UpdateMap,
} from '../../src/state/getKeyUpdate';
import { Path } from '../../src/state/path';
import { Def, DefType, Node } from '../../src/types/ast';
import { Ctx, HistoryItem } from '../../src/to-ast/library';
import { NNode } from '../../src/state/nestedNodes/NNode';
import { Map, NsMap } from '../../src/types/mcst';
import { NUIResults, Store } from './store/Store';
import {
    AnyEnv,
    Errors,
    FullEvalator,
    InferenceError,
} from '../ide/ground-up/FullEvalator';
import { LocedName } from './store/sortTops';
import { TraceMap } from '../ide/ground-up/loadEv';
import { displayFunctionIds } from './store/displayFunction';
import { AllNames } from '../ide/ground-up/evaluators/interface';

export type MetaData = {
    trace?: {
        name?: string;
        latest?: boolean;
        formatter?: string | null;
    };
    // This is currently probably only respected by the Fixture dealio
    // and maybe the toplevel whatsits
    // but it probably won't be inspected & dealt with if it's embedded deep somewhere.
    traceTop?: { name?: string };
    coverage?: boolean;
};

export type MetaDataMap = { [key: number]: MetaData };
export type MetaDataUpdateMap = { [key: number]: MetaData | null };

export type NUIState = {
    regs: RegMap;
    clipboard: ClipboardItem[][];
    hover: Path[];
    highlight?: number[];
    // highlight: boolean;
    traceScrub?: {
        top: number;
        idx: number;
    };
    history: HistoryItem[];
    cards: Card[];
    nsMap: { [key: number]: RealizedNamespace };
    meta: MetaDataMap;
    evaluator?: string | string[] | null;

    trackChanges?: {
        previous: UpdateMap;
        message: string;
    };
    // config?: {
    //     evaluator: string,
    //     // info ... about ... what kind of evaluator I would be.
    // }
    // you pull up the file ... and
    // evaluate it n stuff
} & State;

/*

Ok, so we come to a certain question.
and the question is
how do I manage change.

When .. a thing is collapsed ...
does its being get subsumed?
does it get removed from the ... map?

I mean
it shouldn't be navigable
also

is it at that point ... that it gets .. published?
I don't think so? I think I want change management to be more explicit?
And like, you can queue up changes? idk

OK SO
current decision is: NO it does not get exised from the map. they live.
which means
namespaces might have members that are realized
and members that are not

SO
a "Card"
has a namespace
and a list of "tops"
and a list of hidden tops
butttt should the position of the tops be remembered? idk probably
like
ok yeah, position is persistent. but honestly maybe it hsould be persisted in the namespace?
although namespace listings ... really want to be alphabetical ... although, do they?
no! they don't need to. And in fact, we can and should do better.

Ok, so namespaces are not unordered whatsits.


OH WAITTT

So
....
things with children, do need names
but some children will be nameless.

and
indeeed
you would be correct
alsoo
sometimes
I might want to "name" my nameless things
and
but not make them like, a definition
just a name
it's fine
well but they'd probably be a definition too, why not
ok
so
we've determined that in fact, it ...
wait
I'm now having second, even third thoughts.

Ok, so, ... are we ... .... .. .... .. .....

so there are multiple kinds of things.

a "Card"
refers to a ... toplevel ... whatsit.
it should / needs / must //// be .... in a certain place & time
but ... I guess it doesn't actually necessarily have to exist in the library already.

anyway, a card has several children
in a couple of flavors

[the expression, no name] [exists in library? y/n]
[the thing that has children, must be named] [exists in library? y/n]
[the named thing with noe children] [exists in library? y/n]

So, I really am thinking
that libraryfied things are identified by their hash.
how else would we know that they ... exist?

yes. ok. so.
the SandboxNamespace may or may not have a `hash`, identifying it as existing
in the library.

*/

// This is the ... "ground truth" in the library
type Namespace = {
    top: string; // it's a hash, no doubt no doubt
    // Children, with just `string`s are just nodes, they don't have children,
    // and they don't have to be definitions, they could be expressions or definitions.
    // BUT if they's a `Namespace`, they must be a definition, thereby having a name,
    // which we can use to name ... space.
    //
    // so, well.
    // do I ... really need... all namespace nodes to be a thing?
    // can we not just organize for the sake of it?
    // are we going to have weird empty __init__.py files lying around?
    children: (Namespace | string)[];
};
// (scope lol)
// (defn) # (a header?)

export type Card = {
    path: string[];
    // So, it seems like, sometimes I'll want
    // to load up just the children of a namespace.
    // not the root of the namespace.
    // this is immediately relevant for ... the root namespace.
    // map: { [key: number]: RealizedNamespace };
    top: number;
};

export type CollapseState = boolean | 'pinned';

export type RealizedNamespace = {
    id: number;
    type: 'normal';
    hash?: string | null; // if hash, then this corresponds to something existing in the library.
    // the idx into the Map
    top: number;
    hidden?: boolean;
    children: number[];
    collapsed?: CollapseState;
    plugin?: { id: string; options: any }; // hash or something, or just a name ya know
    display?: { id: (typeof displayFunctionIds)[any]; options: any };
    // PLUGINS get evaluated ... after everything else?
    //
};

export type WorkerPlugin<Results, Parsed, Options> = {
    test(node: Node): boolean;
    compile?(node: Node, evaluator: AnyEnv, options: Options): string;
    parse(
        node: Node,
        errors: Errors,
        evaluator: FullEvalator<any, any, any>,
    ): { parsed: Parsed; allNames: AllNames } | null;
    infer(
        parsed: Parsed,
        evaluator: FullEvalator<any, any, any>,
        tenv: any,
    ): {
        result:
            | { type: 'ok'; value: null }
            | { type: 'err'; err: InferenceError };
        typesAndLocs: { type: any; loc: number }[];
        usages: Record<number, number[]>;
    };

    process(
        parsed: Parsed,
        meta: NUIState['meta'],
        evaluator: FullEvalator<any, any, any>,
        traces: TraceMap,
        env: any,
        options: Options,
        typeEnv: any,
    ): Results;
    getErrors(results: Results): [string, number][];
};

export type NamespacePlugin<Results, Parsed, Options> = {
    id: string;
    title: string;
    // test(node: Node): boolean;
    // parse(
    //     node: Node,
    //     errors: Errors,
    //     evaluator: FullEvalator<any, any, any>,
    // ): { parsed: Parsed; deps: LocedName[] } | null;
    // process(
    //     parsed: Parsed,
    //     meta: NUIState['meta'],
    //     evaluator: FullEvalator<any, any, any>,
    //     traces: TraceMap,
    //     env: any,
    //     // results: NUIResults,
    //     // meta: MetaDataMap,
    //     // evaluate: (node: Node) => any,
    //     // setTracing: (idx: number | null) => void,
    //     options: Options,
    // ): Results;
    render(
        parsed: Parsed,
        results: Results,
        store: Store,
        ns: RealizedNamespace,
    ): NNode | void;
    newNodeAfter(
        path: Path[],
        map: Map,
        nsMap: NsMap,
        nidx: () => number,
    ): StateChange | null;
    // evaluate: (node: Node, env: T) => T;
    // render: (node: Node, results: T) => NNode;
};

export type SandboxNamespace =
    // | {
    //       id: number;
    //       type: 'placeholder';
    //       hash: string;
    //       // just holding a place
    //       // don't need to know the children, b/c it doesn't really exist.
    //   }
    RealizedNamespace;

export type UIState = { ctx: Ctx } & NUIState;

export type RegMap = {
    [key: number]: {
        main?: { node: HTMLSpanElement; path: Path[] } | null;
        start?: { node: HTMLSpanElement; path: Path[] } | null;
        end?: { node: HTMLSpanElement; path: Path[] } | null;
        inside?: { node: HTMLSpanElement; path: Path[] } | null;
        outside?: { node: HTMLSpanElement; path: Path[] } | null;
    };
};

export type Action =
    | { type: 'undo' }
    | { type: 'redo' }
    | { type: 'clear-changes'; ids: number[] }
    | { type: 'yank'; expr: DefType | Def; loc: number }
    | { type: 'jump-to-definition'; idx: number }
    | { type: 'highlight' }
    // | { type: 'reset'; state: NUIState }
    | UpdatableAction;

/** Actions that can be turned into a StateChange | UIStatechange */
export type UpdatableAction =
    | { type: 'config:evaluator'; id: string | string[] | null }
    | StateUpdate
    | { type: 'hover'; path: Path[] }
    | { type: 'select'; add?: boolean; at: { start: Path[]; end?: Path[] }[] }
    | { type: 'move'; source: { path: Path[]; idx: number }; dest: Path[] }
    | { type: 'copy'; items: ClipboardItem[] }
    | { type: 'menu'; selection: number }
    | { type: 'menu-select'; path: Path[]; item: AutoCompleteReplace }
    // expr:def expr:deftype
    | { type: 'key'; key: string; mods: Mods }
    | { type: 'meta'; meta: NUIState['meta'] }
    | { type: 'rich'; idx: number; content: any }
    | {
          type: 'ns';
          selection?: Path[];
          nsMap: { [key: number]: SandboxNamespace | null };
      }
    | { type: 'paste'; items: ClipboardItem[] }
    | DualAction;

export type DualAction = {
    type: 'namespace-rename';
    from: string[];
    to: string[];
};
