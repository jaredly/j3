import React from 'react';
import { Ctx } from '../../src/to-ast/Ctx';
import { MNode } from '../../src/types/mcst';
import { State } from '../mods/getKeyUpdate';
import { rainbow } from '../old/Nodes';
import { getNestedNodes, NNode, stringColor } from '../overheat/getNestedNodes';
import { Path, PathChild } from '../store';
import { calcOffset } from './RenderONode';
import { RenderProps } from './types';

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

const columnRecords = true;

export const colors: {
    [key: string]: string;
} = {
    identifier: '#5bb6b7',
    comment: '#616162',
    tag: '#82f682',
    number: '#8585ff', //'#4848a5',
    string: 'yellow',
    stringText: stringColor,
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
        return { fontStyle: 'normal', color: 'orange' };
    }
    switch (node.type) {
        case 'identifier':
            return { color: color };
        case 'stringText':
            return { color: color, whiteSpace: 'pre' };
    }
    return { color: 'violet' };
};

export const Render = (props: RenderProps) => {
    const { idx, map, display, path } = props;
    const nnode = getNestedNodes(map[idx], display[idx]?.layout);

    if (path.length > 1000) {
        return <span>DEEP</span>;
    }

    return props.debug ? (
        <span style={{ display: 'flex' }}>
            <span
                style={{ opacity: 0.5, fontSize: '50%' }}
                data-display={JSON.stringify(props.display[idx])}
            >
                {idx}
            </span>
            <RenderNNode {...props} nnode={nnode} />
        </span>
    ) : (
        <RenderNNode {...props} nnode={nnode} />
    );
};

export const cmpPath = (one: PathChild, two: PathChild): number => {
    if (one.type === two.type) {
        switch (one.type) {
            case 'start':
            case 'end':
            case 'inside':
            case 'tannot':
            case 'record-target':
            case 'spread-contents':
                return 0;
            case 'subtext':
            case 'attribute':
            case 'child':
            case 'expr':
            case 'text':
                return one.at - (two as { at: number }).at;
            default:
                let _: never = one;
        }
    }
    if (one.type === 'tannot') {
        return 1;
    }
    if (two.type === 'tannot') {
        return -1;
    }
    if (one.type === 'end') {
        return 1;
    }
    if (two.type === 'end') {
        return -1;
    }
    if (one.type === 'start') {
        return -1;
    }
    if (two.type === 'start') {
        return 1;
    }
    if (one.type === 'expr' && two.type === 'text') {
        return one.at <= two.at ? -1 : 1;
    }
    if (one.type === 'text' && two.type === 'expr') {
        return two.at <= one.at ? 1 : -1;
    }
    if (one.type === 'record-target' && two.type === 'attribute') {
        return -1;
    }
    if (two.type === 'record-target' && one.type === 'attribute') {
        return 1;
    }
    throw new Error(`Comparing ${one.type} to ${two.type}, unexpected`);
};

// If `one` has a *longer* length than two, it will be considered
// greater. Otherwise, it'll be considered equal
export const cmpFullPath = (one: Path[], two: Path[]) => {
    for (let i = 0; i < one.length && i < two.length; i++) {
        const o = one[i];
        const t = two[i];
        if (o.idx !== t.idx) {
            throw new Error(
                `Comparing full paths, different idx for same position?`,
            );
            // return null
        }
        const cmp = cmpPath(o.child, t.child);
        if (cmp !== 0) {
            return cmp;
        }
    }
    // return one.length > two.length + 1 ? 1 : 0;
    // return one.length > two.length ? 1 : -1;
    return 0;
};

const isCoveredBySelection = (
    at: State['at'],
    path: Path[],
    requireFull = true,
) => {
    for (let sel of at) {
        if (!sel.end) {
            continue;
        }
        const start = cmpFullPath(sel.start, path);
        const end = cmpFullPath(path, sel.end);
        if (requireFull) {
            if (start < 0 && end < 0) {
                return true;
            }
        } else {
            if (start <= 0 && end <= 0) {
                return true;
            }
        }
    }
    return false;
};

export const RenderNNode = (
    props: RenderProps & { nnode: NNode },
): JSX.Element => {
    const { nnode, reg, idx, path, display, map, dispatch } = props;
    const node = map[idx];

    const isSelected = props.selection.some(
        (s) =>
            s.start[s.start.length - 1].idx === idx ||
            (s.end && s.end[s.end.length - 1].idx === idx),
    );

    const selectStyle = isCoveredBySelection(
        props.selection,
        path,
        !('text' in node),
    )
        ? {
              color: '#777',
              backgroundColor: '#1a1a1a',
              //   textDecoration: 'underline',
              //   textShadow: '0 3px 0px white',
          }
        : {};

    switch (nnode.type) {
        case 'vert':
        case 'horiz':
            return (
                <span
                    style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        flexDirection: nnode.type === 'vert' ? 'column' : 'row',
                        ...selectStyle,
                    }}
                >
                    {nnode.children.map((nnode, i) => (
                        <RenderNNode
                            {...props}
                            nnode={nnode}
                            key={nnode.type === 'ref' ? 'id:' + nnode.id : i}
                        />
                    ))}
                </span>
            );
        case 'blinker':
            return (
                <span
                    ref={(node) => reg(node, idx, path, nnode.loc)}
                    style={{
                        alignSelf:
                            nnode.loc === 'start'
                                ? 'flex-start'
                                : nnode.loc === 'end'
                                ? 'flex-end'
                                : 'stretch',
                    }}
                />
            );
        case 'punct':
            return (
                <span
                    style={{
                        whiteSpace: 'pre',
                        color: nnode.color,
                        ...selectStyle,
                    }}
                >
                    {nnode.text}
                </span>
            );
        case 'brace':
            return (
                <span
                    style={{
                        whiteSpace: 'pre',
                        color:
                            nnode.color ??
                            rainbow[path.length % rainbow.length],
                        alignSelf:
                            nnode.at === 'end' ? 'flex-end' : 'flex-start',
                        fontVariationSettings: isSelected ? '"wght" 900' : '',
                        ...selectStyle,
                    }}
                >
                    {nnode.text}
                </span>
            );
        case 'text':
            return (
                <span
                    ref={(node) => reg(node, idx, path)}
                    style={{
                        ...textStyle(node, display[idx]),
                        ...selectStyle,
                    }}
                    className="idlike"
                    onMouseDown={(evt) => {
                        evt.stopPropagation();
                        evt.preventDefault();
                        dispatch({
                            type: 'select',
                            add: evt.altKey,
                            at: [
                                {
                                    start: path.concat({
                                        idx,
                                        child: {
                                            type: 'subtext',
                                            at: calcOffset(
                                                evt.currentTarget,
                                                evt.clientX,
                                            ),
                                        },
                                    }),
                                },
                            ],
                        });
                    }}
                >
                    {nnode.text}
                </span>
            );
        case 'ref':
            return (
                <Render
                    map={map}
                    display={display}
                    dispatch={dispatch}
                    reg={reg}
                    idx={nnode.id}
                    selection={props.selection}
                    debug={props.debug}
                    path={path.concat([{ idx, child: nnode.path }])}
                />
            );
        case 'pairs':
            if (!columnRecords) {
                return (
                    <span
                        style={{
                            display: 'flex',
                            flexWrap: 'nowrap',
                            flexDirection: 'column',
                            gap: '0 8px',
                        }}
                    >
                        {nnode.children.map((pair, i) =>
                            pair.length === 1 ? (
                                <div key={i} style={{ gridColumn: '1/2' }}>
                                    <RenderNNode {...props} nnode={pair[0]} />
                                </div>
                            ) : (
                                <div style={{ display: 'flex' }}>
                                    <span key={i + '-0'}>
                                        <RenderNNode
                                            {...props}
                                            nnode={pair[0]}
                                        />
                                    </span>
                                    <span style={{ width: '0.5em' }} />
                                    <span key={i + '-1'}>
                                        <RenderNNode
                                            {...props}
                                            nnode={pair[1]}
                                        />
                                    </span>
                                </div>
                            ),
                        )}
                    </span>
                );
            }
            return (
                <span style={{ display: 'grid', gap: '0 8px' }}>
                    {nnode.children.flatMap((pair, i) =>
                        pair.length === 1
                            ? [
                                  <span key={i} style={{ gridColumn: '1/2' }}>
                                      <RenderNNode {...props} nnode={pair[0]} />
                                  </span>,
                              ]
                            : [
                                  <span
                                      key={i + '-0'}
                                      style={{ gridColumn: '1' }}
                                  >
                                      <RenderNNode {...props} nnode={pair[0]} />
                                  </span>,
                                  <span
                                      key={i + '-1'}
                                      style={{ gridColumn: '2' }}
                                  >
                                      <RenderNNode {...props} nnode={pair[1]} />
                                  </span>,
                              ],
                    )}
                </span>
            );
        case 'indent':
            return (
                <span style={{ display: 'inline-block', paddingLeft: 10 }}>
                    <RenderNNode {...props} nnode={nnode.child} />
                </span>
            );
    }
    let _: never = nnode;
    return <span>NOPE</span>;
};
