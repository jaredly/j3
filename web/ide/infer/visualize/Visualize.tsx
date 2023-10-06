import React, { useEffect, useMemo, useReducer, useState } from 'react';
import { layout } from '../../../../src/layout';
import { emptyMap, parseByCharacter } from '../../../../src/parse/parse';
import {
    StateChange,
    applyUpdate,
    getKeyUpdate,
    isRootPath,
} from '../../../../src/state/getKeyUpdate';
import { Ctx, Env } from '../../../../src/to-ast/library';
import { ListLikeContents, fromMCST } from '../../../../src/types/mcst';
import { Cursors } from '../../../custom/Cursors';
import { HiddenInput } from '../../../custom/HiddenInput';
import { Hover, calc } from '../../../custom/Hover';
import { Root } from '../../../custom/Root';
import { Action, NUIState, UpdatableAction } from '../../../custom/UIState';
import {
    UIStateChange,
    calcHistoryItem,
    undoRedo,
} from '../../../custom/reduce';
import { verticalMove } from '../../../custom/verticalMove';
import { calcResults, loadState, stateFromMap } from '../../Test';
import { useLocalStorage } from '../../../Debug';
import { algos } from '../types';
import { Node, Tree } from './Tree';
import { transformNode } from '../../../../src/types/transform-cst';
import { Node as CNode } from '../../../../src/types/cst';

const fixtures = [
    `(+ 1 2)`,
    `(let [x 2] (+ 2 x))`,
    `(fn [x] (+ 2 x))`,
    `(fn [x] (let [y x] (+ 2 y)))`,
    `(let [x (fn [v] (if (> v 2) v (x (+ v 1))))] (x 0))`,
];

export const Visualize = ({ env }: { env: Env }) => {
    const [alg, setAlg] = useLocalStorage('test:infer-alg', () => 'thih');
    const [focus, setFocus] = useLocalStorage('test:vis-focus', () => 0);

    return (
        <div>
            {fixtures.map((fix, i) => (
                <Fixture
                    fix={fix}
                    key={i}
                    alg={alg}
                    focus={i === focus}
                    setFocus={() => setFocus(i)}
                />
            ))}
        </div>
    );
};

const Fixture = ({
    fix,
    alg,
    focus,
    setFocus,
}: {
    fix: string;
    alg: string;
    focus: boolean;
    setFocus: () => void;
}) => {
    const state = useMemo(() => {
        const res = parseByCharacter(fix.replaceAll(/\n\s*/g, ' '), null);
        return stateFromMap(res.map);
    }, []);
    const results = useMemo(
        () => calcResults(state, algos[alg]),
        [alg, state.map],
    );
    const tops = (state.map[state.root] as ListLikeContents).values;
    const data = useMemo(() => toTree(state.map, tops[0]), [state.map]);
    return (
        <div
            onClick={() => setFocus()}
            style={{
                border: focus ? '1px solid magenta' : '1px solid transparent',
            }}
        >
            <pre>{fix}</pre>
            <Root
                state={state}
                dispatch={() => {}}
                results={results}
                tops={tops}
                showTop={() => 'ehllo'}
                debug={false}
            />
            {focus ? <Tree data={data} /> : null}
        </div>
    );
};

type Item = { node: CNode; children: Item[] };

const nodeName = (node: CNode) => {
    switch (node.type) {
        case 'identifier':
            return node.text;
        case 'array':
            return '[ ]';
        case 'record':
            return '{ }';
        case 'list':
            return '( )';
    }
    return node.type;
};

const itemToData = (item: Item): Node => {
    return {
        name: nodeName(item.node),
        children: item.children.map(itemToData),
    };
};

const toTree = (map: NUIState['map'], root: number): Node => {
    const node = map[root];
    const byPath: { [key: string]: Item } = {};
    transformNode(fromMCST(root, map), {
        pre(node, path) {
            const key = JSON.stringify(path);
            byPath[key] = { node, children: [] };
            if (path.length > 0) {
                const parent = JSON.stringify(path.slice(0, -1));
                byPath[parent].children.push(byPath[key]);
            }
        },
    });
    return itemToData(byPath['[]']);
};
