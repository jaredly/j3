import React from 'react';
import { splitGraphemes } from '../../src/parse/parse';
import { pathSelForNode } from '../mods/navigate';
import { sideClick } from '../old/ListLike';
import { rainbow } from '../old/Nodes';
import { ONode } from '../overheat/types';
import { Path } from '../store';
import { Action, State } from './ByHand';
import { textStyle, Render } from './Render';
import { RenderProps } from './types';

export const RenderONode = ({
    i,
    onode,
    onodes,
    props: { idx, state, reg, path, display, dispatch },
}: {
    i: number;
    onodes: ONode[];
    onode: ONode;
    props: RenderProps;
}) => {
    const node = state.map[idx];
    switch (onode.type) {
        case 'blinker':
            return <span ref={(node) => reg(node, idx, path, onode.loc)} />;
        case 'punct':
            return (
                <span
                    style={{
                        whiteSpace: 'pre',
                        color:
                            onode.color === 'rainbow'
                                ? rainbow[path.length % rainbow.length]
                                : onode.color,
                    }}
                    onMouseDown={sideClick((isLeft) => {
                        clickPunct(
                            isLeft,
                            idx,
                            i,
                            onodes,
                            path,
                            state,
                            dispatch,
                        );
                    })}
                >
                    {onode.text}
                </span>
            );
        case 'render':
            return (
                <span
                    ref={(node) => reg(node, idx, path)}
                    style={textStyle(node, display[idx])}
                    onMouseDown={(evt) => {
                        evt.preventDefault();
                        dispatch({
                            type: 'select',
                            pathSel: {
                                path,
                                sel: {
                                    idx,
                                    loc: calcOffset(
                                        evt.currentTarget,
                                        evt.clientX,
                                    ),
                                },
                            },
                        });
                    }}
                >
                    {onode.text}
                </span>
            );
        case 'ref':
            return (
                <Render
                    state={state}
                    display={display}
                    dispatch={dispatch}
                    reg={reg}
                    idx={onode.id}
                    path={path.concat([{ idx, child: onode.path }])}
                />
            );
    }
    let _: never = onode;
    return <span>What ONOde</span>;
};
// TODO I could do a binary search thing to make this faster if I want

export const calcOffset = (node: HTMLSpanElement, x: number) => {
    if (!node.firstChild) {
        return 0;
    }
    let range = new Range();
    const graphemes = splitGraphemes(node.textContent!);
    let offset = 0;
    let prevPos = null;
    const box = node.getBoundingClientRect();
    if (x <= box.left) {
        return 0;
    }
    if (x >= box.right) {
        return graphemes.length;
    }
    for (let i = 0; i < graphemes.length; i++) {
        range.setStart(node.firstChild, offset);
        range.setEnd(node.firstChild, offset);
        let dx = range.getBoundingClientRect().left - x;
        if (Math.abs(dx) < 3) {
            return i;
        }
        if (prevPos && prevPos < 0 && dx > 0) {
            return Math.abs(prevPos) < Math.abs(dx) ? i - 1 : i;
        }
        prevPos = dx;
        offset += graphemes[i].length;
    }
    return graphemes.length;
};

export const clickPunct = (
    isLeft: boolean,
    idx: number,
    i: number,
    onodes: ONode[],
    path: Path[],
    state: State,
    dispatch: React.Dispatch<Action>,
) => {
    if (isLeft) {
        for (let j = i; j >= 0; j--) {
            const prev = onodes[j];
            const ps = pathSelForNode(prev, idx, 'end', state.map);
            if (ps) {
                console.log(ps);
                dispatch({
                    type: 'select',
                    pathSel: {
                        sel: ps.sel,
                        path: path.concat(ps.path),
                    },
                });
                return;
            }
        }
    } else {
        for (let j = i + 1; j < onodes.length; j++) {
            const prev = onodes[j];
            const ps = pathSelForNode(prev, idx, 'start', state.map);
            if (ps) {
                console.log(ps);
                dispatch({
                    type: 'select',
                    pathSel: {
                        sel: ps.sel,
                        path: path.concat(ps.path),
                    },
                });
                return;
            }
        }
    }
};
