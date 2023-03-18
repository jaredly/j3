import React from 'react';
import { Ctx } from '../../src/to-ast/Ctx';
import { MNode } from '../../src/types/mcst';
import { rainbow } from '../old/Nodes';
import { getNestedNodes, NNode, stringColor } from '../overheat/getNestedNodes';
import { isCoveredBySelection } from './isCoveredBySelection';
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
              color: '#ccc',
              borderRadius: 6,
              backgroundColor: '#225',
              //   backgroundColor: '#1a1a1a',
              //   outline: '1px solid white',
              //   boxShadow: '1px 1px 1px white',
              //   backgroundColor: 'rgb(18 20 42)',
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
