// hmm
import GraphemeSplitter from 'grapheme-splitter';
import { fixMissingReferences } from '../../web/custom/old-stuff/reduce';
import { applyMods } from '../getCtx';
import { applyInferMod, infer } from '../infer/infer';
import { ClipboardItem } from '../state/clipboard';
import { Mods, State, applyUpdate, getKeyUpdate } from '../state/getKeyUpdate';
import { Path, cmpFullPath } from '../state/path';
import { AutoCompleteReplace } from '../to-ast/Ctx';
import { applyMenuItem } from '../to-ast/autoComplete';
import { CompilationResults, CstCtx } from '../to-ast/library';
import { filterComments, nodeToExpr } from '../to-ast/nodeToExpr';
import { nodeToType } from '../to-ast/nodeToType';
import { Node } from '../types/cst';
import { Map, NsMap, fromMCST } from '../types/mcst';

const seg = new GraphemeSplitter();

export const splitGraphemes = (text: string) => {
    return seg.splitGraphemes(text);
};

export const parseByCharacter = (
    rawText: string,
    ctx: CstCtx | null,
    {
        kind,
        track,
    }: {
        kind?: 'type' | 'expr';
        debug?: boolean;
        track?: { [idx: number]: [number, number] };
    } = {},
): State => {
    let state: State = initialState();

    const text = splitGraphemes(rawText);

    let clipboard: ClipboardItem[] = [];

    for (let i = 0; i < text.length; i++) {
        if (track) {
            state.at[0].start.forEach(({ idx }) => {
                if (!track[idx]) {
                    track[idx] = [i, i];
                }
                // if (i > 0) {
                //     track[idx][0] = Math.min(i - 1, track[idx][0]);
                // }
                track[idx][1] = Math.max(i, track[idx][1]);
            });
        }

        let mods: Mods = {};
        let key;
        ({ key, i } = determineKey(text, i, mods));

        if (key === 'Copy') {
            let { start, end } = state.at[0];
            if (!end) {
                throw new Error(`need end for copy`);
            }

            [start, end] = orderStartAndEnd(start, end, {});

            throw new Error(
                'I dont think this code is used anymore. if so, need to use UIState pls',
            );
            // clipboard = [
            //     collectNodes(state, start, end, ctx?.results.hashNames ?? {}),
            // ];
            continue;
        }
        if (key === 'Paste') {
            throw new Error(
                'I dont think this code is used anymore. if so, need to use UIState pls',
            );

            // state = applyUpdate(
            //     state,
            //     0,
            //     paste(
            //         state,
            //         ctx?.results.hashNames ?? {},
            //         clipboard,
            //         ctx != null,
            //     ),
            // );

            continue;
        }

        if (key === 'Enter' && ctx) {
            const idx = state.at[0].start[state.at[0].start.length - 1].idx;
            const matches = ctx.results.display[idx]?.autoComplete?.filter(
                (s) => s.type === 'update',
            ) as AutoCompleteReplace[];
            if (matches?.length) {
                const update = applyMenuItem(
                    state.at[0].start,
                    matches[0],
                    state,
                );
                state = applyUpdate(state, 0, update);
                nodeToExpr(fromMCST(state.root, state.map), ctx);
                continue;
            }
        }

        const update = getKeyUpdate(
            key,
            state.map,
            {},
            [],
            state.at[0],
            ctx?.results.hashNames ?? {},
            state.nidx,
            mods,
        );

        const prevMap = state.map;

        if (ctx && update && 'autoComplete' in update && update.autoComplete) {
            state = autoCompleteIfNeeded(state, ctx.results.display);
        }

        state = applyUpdate(state, 0, update) ?? state;

        if (ctx) {
            const root = fromMCST(state.root, state.map) as { values: Node[] };

            const prevCtx = ctx;

            // This is where the `ctx` gets updated
            if (!kind || kind === 'expr') {
                filterComments(root.values).forEach((node) => {
                    ctx!.results.toplevel[node.loc] = nodeToExpr(node, ctx!);
                });
            }
            if (kind === 'type') {
                // TODO: Allow deftype here pls
                root.values.map((node) => nodeToType(node, ctx!));
            }
            state = { ...state, map: { ...state.map } };
            applyMods(ctx, state.map, state.nidx);

            if (
                (!kind || kind === 'expr') &&
                update &&
                'autoComplete' in update &&
                update?.autoComplete
            ) {
                // Now we do like inference, right?
                const mods = infer(ctx, state.map);
                Object.keys(mods).forEach((id) => {
                    applyInferMod(mods[+id], state.map, state.nidx, +id);
                });
            }

            const fixed = fixMissingReferences(
                prevCtx,
                ctx,
                state.map,
                prevMap,
            );
            if (fixed) {
                filterComments(root.values).forEach((node) => {
                    ctx!.results.toplevel[node.loc] = nodeToExpr(node, ctx!);
                });
            }
        }
    }
    return state;
};

export const idxSource = () => {
    let idx = 0;
    return () => idx++;
};

export function orderStartAndEnd(
    start: Path[],
    end: Path[],
    nsMap: NsMap,
): [Path[], Path[]] {
    return cmpFullPath(start, end, nsMap) < 0 ? [start, end] : [end, start];
}

function determineKey(text: string[], i: number, mods: Mods) {
    let key = text[i];
    if (key === '^') {
        key = {
            l: 'ArrowLeft',
            r: 'ArrowRight',
            b: 'Backspace',
            L: 'ArrowLeft',
            R: 'ArrowRight',
            C: 'Copy',
            V: 'Paste',
            n: 'Enter',
            T: 'Tab',
            t: 'Tab',
        }[text[i + 1]]!;
        if (!key) {
            throw new Error(`Unexpected ^${text[i + 1]}`);
        }
        if (text[i + 1] === 'L' || text[i + 1] === 'R' || text[i + 1] === 'T') {
            mods.shift = true;
        }
        i++;
    }
    if (key === '\n') {
        key = 'Enter';
    }
    return { key, i };
}

export function getAutoCompleteUpdate(
    state: State,
    display: CompilationResults['display'],
) {
    const idx = state.at[0].start[state.at[0].start.length - 1].idx;
    const exacts = display[idx]?.autoComplete?.filter(
        (s) => s.type === 'update' && s.exact,
    ) as AutoCompleteReplace[];
    return exacts?.length === 1
        ? applyMenuItem(state.at[0].start, exacts[0], state)
        : null;
}

export function autoCompleteIfNeeded(
    state: State,
    display: CompilationResults['display'],
) {
    const update = getAutoCompleteUpdate(state, display);
    if (update) {
        state = applyUpdate(state, 0, update);
    }
    return state;
}

export const emptyMap = (): Map => {
    return {
        [-1]: {
            type: 'list',
            values: [0],
            loc: -1,
        },
        [0]: { type: 'blank', loc: 0 },
    };
};

function initialState() {
    const nidx = idxSource();
    const top = nidx();

    const map: Map = {
        [-1]: {
            type: 'list',
            values: [top],
            loc: -1,
        },
        [top]: {
            type: 'blank',
            loc: 0,
        },
    };

    let state: State = {
        nidx,
        map,
        at: [
            {
                start: [
                    { idx: -1, type: 'card', card: 0 },
                    { idx: top, type: 'start' },
                ],
            },
        ],
        root: -1,
    };
    return state;
}

export function pathPos(path: Path[], curText: string) {
    const last = path[path.length - 1];
    return last.type === 'subtext'
        ? last.at
        : last.type === 'end'
        ? splitGraphemes(curText).length
        : 0;
}
