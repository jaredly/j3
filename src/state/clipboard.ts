import { NUIState, NsMap, RealizedNamespace } from '../../web/custom/UIState';
import { findTops } from '../../web/ide/ground-up/findTops';
import { reduceUpdate } from '../../web/ide/ground-up/reduce';
import { renderNodeToString } from '../../web/ide/ground-up/renderNodeToString';
import { idText } from '../parse/idText';
import { orderStartAndEnd } from '../parse/parse';
import { splitGraphemes } from '../parse/splitGraphemes';
import { Display } from '../to-ast/library';
// import { Ctx, newCtx } from '../to-ast/Ctx';
import { Node, NodeExtra, accessText, stringText } from '../types/cst';
import {
    ListLikeContents,
    MNodeExtra,
    Map,
    fromMCST,
    toMCST,
} from '../types/mcst';
import { transformNode } from '../types/transform-cst';
import {
    NsUpdateMap,
    StateUpdate,
    getKeyUpdate,
    insertText,
} from './getKeyUpdate';
import { UpdateMap } from '../types/mcst';
import { selectEnd } from './navigate';
import { newNodeAfter } from './newNodeBefore';
import { Path, cmpFullPath } from './path';

export type CoverageLevel =
    | { type: 'inner'; start: Path; end: Path }
    | { type: 'partial' }
    | { type: 'full' };

const isAtStart = (map: Map, path: Path[]): boolean => {
    if (!path.length) {
        return true;
    }
    const next = path[0];
    if (next.type === 'annot-target') {
        return isAtStart(map, path.slice(1));
    }
    if (next.type === 'subtext') {
        return next.at === 0 && path.length === 1;
    }
    return false;
};

export const commonAncestor = (one: Path[], two: Path[]) => {
    let i = 0;
    for (
        ;
        i < one.length && i < two.length && one[i].idx === two[i].idx;
        i++
    ) {}
    return i >= 0 ? one[i - 1].idx : null;
};

export const selectionStatus = (
    path: Path[],
    start: Path[],
    end: Path[],
    map: Map,
    nsMap: NsMap,
): CoverageLevel | null => {
    // if (start.length > path.length + 1 && )
    let s = cmpFullPath(start, path, nsMap);
    if (s > 0) {
        return null;
    }
    if (
        start.length === path.length + 1 &&
        start[start.length - 1].type === 'start'
    ) {
        s = -1;
    }
    if (
        start.length === path.length + 2 &&
        start[start.length - 2].type === 'annot-target'
    ) {
        s = -1;
    }
    if (
        start.length === path.length + 2 &&
        start[start.length - 2].type === 'record-target'
    ) {
        s = -1;
    }

    let e = cmpFullPath(path, end, nsMap);
    if (e > 0) {
        return null;
    }

    if (end.length === path.length + 1 && end[end.length - 1].type === 'end') {
        e = -1;
    }
    if (end.length === path.length + 2) {
        const slast = end[end.length - 2];

        if (slast.type === 'annot-annot') {
            e = -1;
        }
        const node = map[slast.idx];
        if (slast.type === 'attribute' && node.type === 'recordAccess') {
            if (node.items.length === slast.at) {
                e = -1;
            }
        }
    }

    // if (start[start.length - 2].type === 'spread-contents') {
    //     e = -1;
    // }

    if (s < 0 && e < 0) {
        return { type: 'full' };
    }
    if (s === 0 && e === 0) {
        return {
            type: 'inner',
            start: start[start.length - 1],
            end: end[end.length - 1],
        };
    }
    return { type: 'partial' };
};

export type NSExport = {
    top: Node;
    children: NSExport[];
};

export type ClipboardItem =
    | { type: 'ns'; items: NSExport[] }
    | {
          type: 'text';
          text: string;
          trusted: boolean;
          source?: { idx: number; start: number; end: number };
      }
    | { type: 'nodes'; nodes: Node[] };

export const paste = (
    state: NUIState,
    hashNames: { [idx: number]: string },
    items: ClipboardItem[],
    withCtx: boolean,
): StateUpdate | void => {
    if (state.at.length === 1 && !state.at[0].end && items.length === 1) {
        const item = items[0];
        switch (item.type) {
            case 'text': {
                const path = state.at[0].start;
                if (
                    item.trusted ||
                    (path[path.length - 1].type === 'subtext' &&
                        path[path.length - 2]?.type === 'text')
                ) {
                    return insertText(
                        item.text,
                        state.map,
                        {},
                        path,
                        hashNames,
                        state.nidx,
                    );
                } else {
                    return generateRawPasteUpdate(item, state, withCtx);
                }
            }
            case 'nodes': {
                const map: Map = {};
                const idxes = item.nodes.map((node) =>
                    toMCST(reLoc(node, state.nidx), map),
                );
                const start = state.at[0].start;
                const lidx = idxes[idxes.length - 1];
                const selection = selectEnd(lidx, [], map)!;

                const last = start[start.length - 1];
                const parent = start[start.length - 2];
                if (state.map[last.idx].type !== 'blank') {
                    const update = newNodeAfter; // TODO
                }
                if (state.map[last.idx].type === 'blank') {
                    if (parent.type === 'child') {
                        const pnode = state.map[
                            parent.idx
                        ] as ListLikeContents & MNodeExtra;
                        const values = pnode.values.slice();
                        values.splice(parent.at, 1, ...idxes);
                        map[parent.idx] = {
                            ...pnode,
                            values,
                        };
                        return {
                            type: 'update',
                            map,
                            selection: start
                                .slice(0, -2)
                                .concat({
                                    idx: parent.idx,
                                    type: 'child',
                                    at: parent.at + idxes.length - 1,
                                })
                                .concat(selection),
                        };
                    }

                    if (parent.type === 'ns-top') {
                        const ns = state.nsMap[parent.idx] as RealizedNamespace;
                        map[ns.top] = map[idxes[0]];
                        delete map[idxes[0]];
                        map[ns.top].loc = ns.top;
                        const gparent = start[start.length - 3] as Extract<
                            Path,
                            { type: 'ns' }
                        >;
                        const pspace = state.nsMap[
                            gparent.idx
                        ] as RealizedNamespace;
                        const idx = pspace.children.indexOf(ns.id);
                        const nsm: NsUpdateMap = {};
                        if (idxes.length > 1) {
                            const children = pspace.children.slice();
                            const nsidxes = idxes.slice(1).map((id) => {
                                const n = state.nidx();
                                nsm[n] = {
                                    type: 'normal',
                                    children: [],
                                    id: n,
                                    top: id,
                                };
                                return n;
                            });
                            children.splice(idx + 1, 0, ...nsidxes);
                            nsm[pspace.id] = { ...pspace, children };
                        }
                        return {
                            type: 'update',
                            map,
                            nsMap: nsm,
                            selection: start
                                .slice(0, -2)
                                .concat(
                                    { idx: parent.idx, type: 'ns-top' },
                                    { type: 'start', idx: ns.top },
                                ),
                        };
                    }
                }

                return newNodeAfter(
                    start,
                    state.map,
                    state.nsMap,
                    { map, idx: lidx, selection },
                    state.nidx,
                    idxes.slice(0, -1),
                );
            }
            case 'ns': {
                const nsMap: NsMap = {};
                const map: Map = {};
                const process = (ns: NSExport) => {
                    const id = state.nidx();
                    nsMap[id] = {
                        type: 'normal',
                        id,
                        top: toMCST(reLoc(ns.top, state.nidx), map),
                        children: ns.children.map(process),
                    };
                    return id;
                };
                const added = item.items.map(process);
                const lns = state.at[0].start.findLast(
                    (n) => n.type === 'ns',
                )! as Extract<Path, { type: 'ns' }>;

                Object.keys(map).forEach((k) => {
                    if (state.map[+k]) {
                        throw new Error('overwriting!' + k);
                    }
                });
                Object.keys(nsMap).forEach((k) => {
                    if (state.map[+k]) {
                        throw new Error('overwriting nsMap!' + k);
                    }
                });

                const parent = state.nsMap[lns.idx] as RealizedNamespace;
                const children = parent.children.slice();
                children.splice(children.indexOf(lns.child) + 1, 0, ...added);
                nsMap[parent.id] = { ...parent, children };
                return {
                    type: 'update',
                    map,
                    nsMap,
                    selection: state.at[0].start,
                };
            }

            default:
                const _x: never = item;
        }
    } else {
        console.warn('cant handle the clipboard items... maybe multi');
        console.log(items);
    }
    return;
};

export const clipboardText = (
    items: ClipboardItem[],
    display: Display, //['hashNames'],
    sep = '\n',
) => {
    return items
        .map((item) =>
            item.type === 'text'
                ? item.text
                : item.type === 'ns'
                ? 'Copied namespace'
                : item.nodes
                      .map((node) => {
                          const map: Map = {};
                          const top = toMCST(node, map);
                          return renderNodeToString(
                              top,
                              map,
                              0,
                              display,
                          ).replaceAll(/[“”]/g, '"');
                      })
                      .join(sep),
        )
        .join(sep);
};

export const collectClipboard = (
    state: NUIState,
    hashNames: { [key: number]: string },
) => {
    const items: ClipboardItem[] = [];
    state.at.forEach(({ start, end }) => {
        if (end) {
            [start, end] = orderStartAndEnd(start, end, state.nsMap);
            items.push(collectNodes(state, start, end, hashNames));
        }
    });
    return items;
};

export const collectNodes = (
    state: Pick<NUIState, 'cards' | 'nsMap' | 'map'>,
    start: Path[],
    end: Path[],
    hashNames: { [idx: number]: string },
): ClipboardItem => {
    if (start.length === end.length) {
        const slast = start[start.length - 1];
        const elast = end[end.length - 1];
        if (slast.idx === elast.idx) {
            const node = fromMCST(slast.idx, state.map);
            if ('text' in node || node.type === 'hash') {
                const text = splitGraphemes(
                    hashNames[node.loc] ?? idText(node, state.map) ?? '',
                );
                const sloc =
                    slast.type === 'subtext'
                        ? slast.at
                        : slast.type === 'end'
                        ? text.length
                        : 0;
                const eloc =
                    elast.type === 'subtext'
                        ? elast.at
                        : elast.type === 'start'
                        ? 0
                        : text.length;
                return {
                    type: 'text',
                    trusted: node.type !== 'stringText',
                    text: text.slice(sloc, eloc).join(''),
                    source: {
                        idx: slast.idx,
                        start: sloc,
                        end: eloc,
                    },
                };
            }
        }
    }

    // hrmm I want a transformNode, but that keeps track of your Path[]
    // transformNode()
    const collected: Node[] = [];
    let waiting: { node: Node; children: Node[] }[] = [];

    findTops(state).forEach((top) => {
        transformNode(fromMCST(top.top, state.map), {
            pre(node, path) {
                const isatom = 'text' in node || node.type === 'hash';
                const status = selectionStatus(
                    [...top.path, ...path],
                    start,
                    end,
                    state.map,
                    state.nsMap,
                );
                if (!status) {
                    return false;
                }
                let collect = waiting.length
                    ? waiting[waiting.length - 1].children
                    : collected;
                if (
                    status.type === 'full' ||
                    (status.type === 'partial' && isatom)
                ) {
                    collect.push(node);
                    return false;
                }
                if (
                    node.type === 'recordAccess' ||
                    node.type === 'string' ||
                    node.type === 'annot'
                ) {
                    waiting.push({ node, children: [] });
                }
                if (status.type === 'partial' && 'values' in node) {
                    waiting.push({ node, children: [] });
                }
            },
            post(node) {
                if (
                    waiting.length &&
                    waiting[waiting.length - 1].node === node
                ) {
                    const children = waiting.pop()!.children;
                    switch (node.type) {
                        case 'annot': {
                            if (children.length === 1) {
                                node = children[0];
                            }
                            // Otherwise, we keep both. it's fine
                            break;
                        }
                        case 'recordAccess': {
                            let first = children.length
                                ? children[0]
                                : {
                                      type: 'blank' as const,
                                      loc: -2,
                                  };
                            const kids = children.slice(1) as (accessText &
                                NodeExtra)[];
                            if (first.type !== 'identifier') {
                                first = {
                                    type: 'identifier',
                                    text: (first as accessText).text,
                                    loc: first.loc,
                                };
                            }
                            if (!kids.length) {
                                node = first;
                            } else {
                                node = {
                                    ...node,
                                    target: first,
                                    items: kids,
                                };
                            }
                            break;
                        }
                        case 'string': {
                            if (
                                children.length === 1 &&
                                children[0].type !== 'stringText'
                            ) {
                                node = children[0];
                                break;
                            }
                            if (
                                !children.length ||
                                children[0].type !== 'stringText'
                            ) {
                                children.unshift({
                                    type: 'stringText',
                                    text: '',
                                    loc: -2,
                                });
                            }
                            const templates: {
                                expr: Node;
                                suffix: stringText & NodeExtra;
                            }[] = [];
                            for (let i = 1; i < children.length; i += 2) {
                                templates.push({
                                    expr: children[i],
                                    suffix:
                                        children[i + 1]?.type === 'stringText'
                                            ? (children[i + 1] as stringText &
                                                  NodeExtra)
                                            : {
                                                  type: 'stringText',
                                                  text: '',
                                                  loc: -2,
                                              },
                                });
                            }
                            node = {
                                ...node,
                                first: children[0] as stringText & NodeExtra,
                                templates,
                            };
                            break;
                        }
                        default:
                            node = { ...(node as any), values: children };
                            break;
                    }
                    node = { ...node, loc: -2 };
                    if (waiting.length) {
                        waiting[waiting.length - 1].children.push(node);
                    } else {
                        collected.push(node);
                    }
                }
            },
        });
    });

    while (waiting.length) {
        let { node, children } = waiting.pop()!;
        node = { ...(node as any), values: children };
        let collect = waiting.length
            ? waiting[waiting.length - 1].children
            : collected;
        collect.push(node);
    }

    return { type: 'nodes', nodes: collected };
};

export const reLoc = (node: Node, nidx: () => number): Node => {
    return transformNode(node, {
        pre(node) {
            return { ...node, loc: nidx() };
        },
    });
};

const basicLex = (text: string) => {
    let at = 0;
    const chunks: string[] = [];
    let m = 0;
    while (at < text.length) {
        // console.log('at', at, chunks);
        if (m++ > 1000) {
            break;
        }
        const c = text[at];
        if (c.match(/^[a-zA-Z0-9_]/)) {
            const rest = text.slice(at);
            const token = rest.match(/^[a-zA-Z0-9_]+/)!;
            chunks.push(token[0]);
            at += token[0].length;
            continue;
        }

        if (c.match(/[\s\n]/)) {
            const rest = text.slice(at);
            const white = rest.match(/^[\s\n]+/)![0];
            at += white.length;
            // ignore white before a closing brace
            if (!'])}'.includes(text[at])) {
                chunks.push(white.includes('\n') ? '\n' : ' '); // collapsing whitespace
            }
            continue;
        }

        if (c === '"') {
            chunks.push(c);
            at++;
            let rest = text.slice(at);
            let found = rest.match(/^[^"]*"/);
            if (!found) {
                continue;
            }
            let string = found[0];
            at += string.length;
            // console.log('string', string, at, text[at]);
            while (string.endsWith('\\"')) {
                rest = text.slice(at);
                let next = rest.match(/^[^"]*"/);
                if (!next) {
                    // console.log(rest);
                    break;
                }
                at += next[0].length;
                string += next[0];
                // console.log('next pit', string, next, at);
            }
            chunks.push(string.slice(0, -1));
            chunks.push('"');
            // console.log('final splot', string, at, text[at]);
            continue;
        }

        if (c === ';') {
            chunks.push(c);
            const i = text.indexOf('\n', at);
            if (i === -1) {
                chunks.push(text.slice(at + 1));
                chunks.push('\n');
                at = text.length;
                continue;
            }
            chunks.push(text.slice(at + 1, i));
            chunks.push('\n');
            at = i + 1;
            const m = text.slice(at).match(/^[\s\n]*/);
            if (m) {
                at += m[0].length;
            }
            continue;
        }

        chunks.push(c);
        at++;
    }
    console.log('lexed', chunks);
    return chunks;
};

export function generateRawPasteUpdate(
    item: Extract<ClipboardItem, { type: 'text' }>,
    state: NUIState,
    withCtx: boolean,
): StateUpdate {
    const chars = basicLex(item.text.trim()); // splitGraphemes(item.text); //.replace(/\s+/g, ' '));
    let tmp = { ...state };
    let tctx = null;
    for (let char of chars) {
        console.log(char);
        const update = getKeyUpdate(
            char,
            tmp.map,
            tmp.nsMap,
            tmp.cards,
            tmp.at[0],
            {},
            tmp.nidx,
        );
        // if (update?.autoComplete && tctx) {
        //     tmp = autoCompleteIfNeeded(tmp, tctx.results.display);
        // }

        // console.log('up', update, tmp);
        tmp = reduceUpdate(tmp, update);
        // console.log('mod', tmp);
        // applyUpdate(tmp, 0, update);

        //     if (tctx) {
        //         tctx = newCtx();

        //         const root = fromMCST(tmp.root, tmp.map) as {
        //             values: Node[];
        //         };
        //         filterComments(root.values).forEach((node) => {
        //             const expr = nodeToExpr(node, tctx!);
        //             let t = getType(expr, tctx!, {
        //                 errors: tctx!.results.errors,
        //                 types: {},
        //             });
        //             validateExpr(expr, tctx!, tctx!.results.errors);
        //             tctx = addDef(expr, tctx!) as CstCtx;
        //         });

        //         tmp = { ...tmp, map: { ...tmp.map } };
        //         applyMods(tctx, tmp.map, state.nidx);

        //         if (update && 'autoComplete' in update && update.autoComplete) {
        //             const mods = infer(tctx, tmp.map);
        //             Object.keys(mods).forEach((id) => {
        //                 applyInferMod(mods[+id], tmp.map, tmp.nidx, +id);
        //             });
        //         }
        //     }
    }

    const update: UpdateMap = {};
    for (let key of Object.keys(tmp.map)) {
        if (tmp.map[+key] !== state.map[+key]) {
            update[+key] = tmp.map[+key];
        }
    }
    for (let key of Object.keys(state.map)) {
        if (!tmp.map[+key]) {
            update[+key] = null;
        }
    }
    const nsUpdate: NsUpdateMap = {};
    Object.keys(tmp.nsMap).forEach((k) => {
        if (tmp.nsMap[+k] !== state.nsMap[+k]) {
            nsUpdate[+k] = tmp.nsMap[+k];
        }
    });
    Object.keys(state.nsMap).forEach((k) => {
        if (!tmp.nsMap[+k]) {
            nsUpdate[+k] = null;
        }
    });

    return {
        type: 'update',
        map: update,
        nsMap: nsUpdate,
        selection: tmp.at[0].start,
        selectionEnd: tmp.at[0].end,
    };
}
