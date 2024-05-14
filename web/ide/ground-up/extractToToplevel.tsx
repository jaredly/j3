import * as React from 'react';
import { Action, RealizedNamespace } from '../../custom/UIState';
import { fromMCST } from '../../../src/types/mcst';
import { Path } from '../../store';
import { Store } from '../../custom/store/Store';
import { replacePathWith } from '../../../src/state/replacePathWith';
import { newId, newListLike } from '../../../src/state/newNodes';
import { FullEvalator } from './FullEvalator';
import { unique } from '../../custom/store/unique';

export function extractToToplevel(
    store: Store,
    ev: FullEvalator<any, any, any>,
    input: string,
    dispatch: React.Dispatch<Action>,
) {
    if (!ev.analysis) {
        throw new Error('evaluator doesnt have analysis');
    }
    const state = store.getState();
    const path = state.at[0].start;

    const nsParent = path.findLast((p) => p.type === 'ns') as Extract<
        Path,
        { type: 'ns' }
    >;
    const nsId = path.find((p) => p.type === 'ns-top')?.idx;
    if (!nsId || !nsParent) {
        throw new Error('cant find toplevel ns');
    }
    const atTop = (state.nsMap[nsId] as RealizedNamespace).top;

    // const errors = {};
    const topNode = fromMCST(atTop, state.map);
    const { stmt } = ev.parse(topNode);
    if (!stmt) {
        throw new Error(`no stmt`);
    }
    const topExternals = ev.analysis.allNames(stmt).global.usages;
    const extMap: Record<string, true> = {};
    topExternals.forEach((ex) => (extMap[ex.name] = true));

    const at = path[path.length - 1].idx;
    const node = fromMCST(at, state.map);
    const { stmt: parsed } = ev.parse(node);
    if (!parsed) {
        throw new Error(`doesn't parse`);
    }

    const externals = unique(
        ev.analysis
            .allNames(parsed)
            .global.usages.filter(
                (ex) => !extMap[ex.name] && ex.kind === 'value',
            )
            .map((n) => n.name),
    );

    const nid = newId([input], state.nidx());
    const repl = externals.length
        ? newListLike('list', state.nidx(), [
              nid,
              ...externals.map((ex) => newId([ex], state.nidx())),
          ])
        : nid;

    const newTop = newListLike('list', state.nidx(), [
        newId([externals.length ? 'defn' : 'def'], state.nidx()),
        newId([input], state.nidx()),
        ...(externals.length
            ? [
                  newListLike(
                      'array',
                      state.nidx(),
                      externals.map((ex) => newId([ex], state.nidx())),
                  ),
              ]
            : []),
        { idx: at, map: {}, selection: [] },
    ]);

    // ev.addStatements
    const update = replacePathWith(
        path.slice(0, -1),
        state.map,
        state.nsMap,
        repl,
    );

    if (!update) {
        return;
    }

    Object.assign(update.map, newTop.map);
    if (!update.nsMap) {
        update.nsMap = {};
    }
    const nns = state.nidx();
    update.nsMap[nns] = {
        children: [],
        top: newTop.idx,
        id: nns,
        type: 'normal',
    };
    const parent = state.nsMap[nsParent.idx] as RealizedNamespace;
    const children = parent.children.slice();
    children.splice(children.indexOf(nsParent.idx), 0, nns);
    update.nsMap[nsParent.idx] = {
        ...parent,
        children,
    };
    update.selection = path.slice(0, path.indexOf(nsParent) + 1).concat([
        { type: 'ns-top', idx: nns },
        { type: 'end', idx: newTop.idx },
    ]);

    dispatch(update);
}
