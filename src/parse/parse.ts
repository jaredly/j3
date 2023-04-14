// hmm
import { applyMods } from '../../web/custom/getCtx';
import { cmpFullPath } from '../../web/custom/isCoveredBySelection';
import { applyMenuItem, autoCompleteUpdate } from '../../web/custom/reduce';
import { layout } from '../../web/layout';
import { ClipboardItem, collectNodes, paste } from '../../web/mods/clipboard';
import {
    applyUpdate,
    getKeyUpdate,
    Mods,
    State,
} from '../../web/mods/getKeyUpdate';
import { Path } from '../../web/mods/path';
import { applyInferMod, infer } from '../infer/infer';
import { AutoCompleteReplace, Ctx } from '../to-ast/Ctx';
import { CompilationResults, CstCtx } from '../to-ast/library';
import { filterComments, nodeToExpr } from '../to-ast/nodeToExpr';
import { nodeToType } from '../to-ast/nodeToType';
import { Node } from '../types/cst';
import { fromMCST, ListLikeContents, Map, MNode } from '../types/mcst';

export const idText = (node: MNode) => {
    switch (node.type) {
        case 'identifier':
        case 'comment':
            if (!node.text) {
                console.log('empty node text', node);
            }
            return node.text;
        case 'unparsed':
            return node.raw;
        case 'accessText':
        case 'stringText':
            return node.text;
        case 'blank':
            return '';
        case 'hash':
            if (
                typeof node.hash === 'string' &&
                node.hash.startsWith(':builtin:')
            ) {
                return node.hash
                    .slice(':builtin:'.length)
                    .split('/')
                    .slice(-1)[0];
            }
            return '🚨';
    }
};

const seg = new Intl.Segmenter('en');

export const splitGraphemes = (text: string) => {
    return [...seg.segment(text)].map((seg) => seg.segment);
};

export const parseByCharacter = (
    rawText: string,
    ctx: CstCtx | null,
    { kind }: { kind?: 'type' | 'expr'; debug?: boolean } = {},
): State => {
    let state: State = initialState();

    const text = splitGraphemes(rawText);

    let clipboard: ClipboardItem[] = [];

    for (let i = 0; i < text.length; i++) {
        let mods: Mods = {};
        let key;
        ({ key, i } = determineKey(text, i, mods));

        if (key === 'Copy') {
            let { start, end } = state.at[0];
            if (!end) {
                throw new Error(`need end for copy`);
            }

            [start, end] = orderStartAndEnd(start, end);

            clipboard = [
                collectNodes(
                    state.map,
                    start,
                    end,
                    ctx?.results.hashNames ?? {},
                ),
            ];
            continue;
        }
        if (key === 'Paste') {
            state = applyUpdate(
                state,
                0,
                paste(state, ctx?.results.hashNames ?? {}, clipboard),
            );
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
            state.at[0],
            ctx?.results.hashNames ?? {},
            state.nidx,
            mods,
        );

        if (ctx && update?.autoComplete) {
            state = autoCompleteIfNeeded(state, ctx.results.display);
        }

        state = applyUpdate(state, 0, update) ?? state;

        if (ctx) {
            const root = fromMCST(state.root, state.map) as { values: Node[] };
            const exprs =
                !kind || kind === 'expr'
                    ? filterComments(root.values).map((node) =>
                          nodeToExpr(node, ctx),
                      )
                    : null;
            if (kind === 'type') {
                // TODO: Allow deftype here pls
                root.values.map((node) => nodeToType(node, ctx));
            }
            state = { ...state, map: { ...state.map } };
            applyMods(ctx, state.map);

            if (exprs && update?.autoComplete) {
                // Now we do like inference, right?
                const mods = infer(exprs, ctx, state.map);
                Object.keys(mods).forEach((id) => {
                    applyInferMod(mods[+id], state.map, state.nidx, +id);
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

export function orderStartAndEnd(start: Path[], end: Path[]): [Path[], Path[]] {
    return cmpFullPath(start, end) < 0 ? [start, end] : [end, start];
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
        }[text[i + 1]]!;
        if (!key) {
            throw new Error(`Unexpected ^${text[i + 1]}`);
        }
        if (text[i + 1] === 'L' || text[i + 1] === 'R') {
            mods.shift = true;
        }
        i++;
    }
    if (key === '\n') {
        key = 'Enter';
    }
    return { key, i };
}

export function autoCompleteIfNeeded(
    state: State,
    display: CompilationResults['display'],
) {
    const idx = state.at[0].start[state.at[0].start.length - 1].idx;
    const exacts = display[idx]?.autoComplete?.filter(
        (s) => s.type === 'update' && s.exact,
    ) as AutoCompleteReplace[];
    if (exacts?.length === 1) {
        const update = applyMenuItem(state.at[0].start, exacts[0], state);
        state = applyUpdate(state, 0, update);
    }
    return state;
}

function initialState() {
    const nidx = idxSource();
    const top = nidx();

    const map: Map = {
        [-1]: {
            type: 'list',
            values: [top],
            loc: { idx: -1, start: 0, end: 0 },
        },
        [top]: {
            type: 'blank',
            loc: { idx: 0, start: 0, end: 0 },
        },
    };

    let state: State = {
        nidx,
        map,
        at: [
            {
                start: [
                    { idx: -1, type: 'child', at: 0 },
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
