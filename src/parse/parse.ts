// hmm
import { applyMods } from '../../web/custom/getCtx';
import { cmpFullPath } from '../../web/custom/isCoveredBySelection';
import { applyMenuItem } from '../../web/custom/reduce';
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
import { nodeToExpr } from '../to-ast/nodeToExpr';
import { Node } from '../types/cst';
import { fromMCST, ListLikeContents, Map, MNode } from '../types/mcst';

export const idText = (node: MNode, style: Ctx['display'][0]['style']) => {
    switch (node.type) {
        case 'identifier':
        case 'comment':
            return node.text;
        case 'unparsed':
            return node.raw;
        case 'accessText':
        case 'stringText':
            return node.text;
        case 'blank':
            return '';
        case 'hash':
            return style?.type === 'id' ? style.text : null;
    }
};

const seg = new Intl.Segmenter('en');

export const splitGraphemes = (text: string) => {
    return [...seg.segment(text)].map((seg) => seg.segment);
};

export const parseByCharacter = (
    rawText: string,
    ctx: Ctx,
    updateCtx = false,
    debug = false,
): State => {
    let state: State = initialState();

    const text = splitGraphemes(rawText);

    let clipboard: ClipboardItem[] = [];

    for (let i = 0; i < text.length; i++) {
        let mods: Mods = {};
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
        if (key === 'Copy') {
            let { start, end } = state.at[0];
            if (!end) {
                throw new Error(`need end for copy`);
            }

            [start, end] =
                cmpFullPath(start, end) < 0 ? [start, end] : [end, start];

            clipboard = [collectNodes(state.map, start, end, ctx.display)];
            continue;
        }
        if (key === 'Paste') {
            state = paste(state, ctx, clipboard);
            continue;
        }

        if (key === 'Enter' && updateCtx) {
            const idx = state.at[0].start[state.at[0].start.length - 1].idx;
            const matches = ctx.display[idx]?.autoComplete?.filter(
                (s) => s.type === 'replace',
            ) as AutoCompleteReplace[];
            if (matches?.length) {
                state = applyMenuItem(
                    state.at[0].start,
                    matches[0],
                    state,
                    ctx,
                );
                nodeToExpr(fromMCST(state.root, state.map), ctx);
                continue;
            }
        }

        const update = getKeyUpdate(
            key,
            state.map,
            state.at[0],
            ctx.display,
            state.nidx,
            mods,
        );

        if (updateCtx && update?.autoComplete) {
            const idx = state.at[0].start[state.at[0].start.length - 1].idx;
            const exacts = ctx.display[idx]?.autoComplete?.filter(
                (s) => s.type === 'replace' && s.exact,
            ) as AutoCompleteReplace[];
            if (exacts?.length === 1) {
                state = applyMenuItem(state.at[0].start, exacts[0], state, ctx);
            }
        }

        if (debug) {
            console.log(JSON.stringify(key), state.at[0].start);
        }

        state = applyUpdate(state, 0, update) ?? state;

        if (updateCtx) {
            const root = fromMCST(state.root, state.map) as { values: Node[] };
            const exprs = root.values.map((node) => nodeToExpr(node, ctx));
            state = { ...state, map: { ...state.map } };
            applyMods(ctx, state.map);

            if (update?.autoComplete) {
                // Now we do like inference, right?
                const mods = infer(exprs, ctx);
                Object.keys(mods).forEach((id) => {
                    applyInferMod(mods[+id], state.map, state.nidx, +id);

                    // state.map[+id] = {
                    //     ...state.map[+id],
                    //     ...mods[+id].node,
                    // };
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
