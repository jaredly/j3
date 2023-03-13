import React from 'react';
import { splitGraphemes } from '../../src/parse/parse';
import { Ctx } from '../../src/to-ast/Ctx';
import { MNode } from '../../src/types/mcst';
import { pathSelForNode } from '../mods/navigate';
import { sideClick } from '../old/ListLike';
import { rainbow } from '../old/Nodes';
import { getNodes } from '../overheat/getNodes';
import { ONode, ONodeOld } from '../overheat/types';
import { Path, Selection } from '../store';
import { Action, State } from './ByHand';

type Reg = (
    node: HTMLSpanElement | null,
    idx: number,
    path: Path[],
    loc?: 'start' | 'end' | 'inside',
) => void;

export function getRainbowHashColor(hash: string) {
    const idx = hash.startsWith(':')
        ? +hash.slice(1) * (rainbow.length / 5 - 1)
        : parseInt(hash, 16);
    const color = rainbow[idx % rainbow.length];
    return color;
}

const nodeColor = (type: MNode['type']) => {
    return colors[type];
};

export const colors: {
    [key: string]: string;
} = {
    identifier: '#5bb6b7',
    comment: '#616162',
    tag: '#82f682',
    number: '#8585ff', //'#4848a5',
    string: 'yellow',
    stringText: 'yellow',
    unparsed: 'red',
};

export const textStyle = (
    node: MNode,
    display?: Ctx['display'][0],
): React.CSSProperties | undefined => {
    const color = nodeColor(node.type);
    if (display?.style) {
        switch (display.style.type) {
            case 'record-attr':
                return {
                    fontStyle: 'italic',
                    fontFamily: 'serif',
                    color: '#84a4a5',
                };
            case 'number':
                return { color: colors['number'] };
            case 'tag':
                return {
                    fontVariationSettings: '"wght" 500',
                    color,
                };
            case 'id':
            case 'id-decl': {
                const color = getRainbowHashColor(display.style.hash);
                return { fontStyle: 'normal', color };
            }
        }
        return { fontStyle: 'normal' };
    }
    switch (node.type) {
        case 'identifier':
            return { color: color };
        case 'stringText':
            return { color: color, whiteSpace: 'pre' };
    }
};

export const Render = ({
    idx,
    state,
    reg,
    path,
    display,
    dispatch,
}: {
    idx: number;
    state: State;
    reg: Reg;
    path: Path[];
    display: Ctx['display'];
    dispatch: React.Dispatch<Action>;
}) => {
    const node = state.map[idx];
    const onodes = getNodes(node, display[idx]?.layout);

    return (
        <span>
            {onodes.map((onode, i) => {
                switch (onode.type) {
                    case 'blinker':
                        return (
                            <span
                                key={i}
                                ref={(node) => reg(node, idx, path, onode.loc)}
                            />
                        );
                    case 'punct':
                        return (
                            <span
                                key={i}
                                style={{
                                    whiteSpace: 'pre',
                                    color:
                                        onode.color === 'rainbow'
                                            ? rainbow[
                                                  path.length % rainbow.length
                                              ]
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
                                key={i}
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
                                key={onode.id + ':' + i}
                                state={state}
                                display={display}
                                dispatch={dispatch}
                                reg={reg}
                                idx={onode.id}
                                path={path.concat([{ idx, child: onode.path }])}
                            />
                        );
                }
            })}
        </span>
    );
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
    for (let i = 0; i < graphemes.length; i++) {
        range.setStart(node.firstChild, offset);
        range.setEnd(node.firstChild, offset);
        let dx = range.getBoundingClientRect().left - x;
        if (Math.abs(dx) < 3) {
            console.log('spot on');
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
