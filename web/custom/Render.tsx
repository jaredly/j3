import React from 'react';
import { splitGraphemes } from '../../src/parse/parse';
import { Ctx } from '../../src/to-ast/Ctx';
import { MNode } from '../../src/types/mcst';
import { getNestedNodes, NNode, stringColor } from '../overheat/getNestedNodes';
import { isCoveredBySelection } from './isCoveredBySelection';
import { calcOffset } from './calcOffset';
import { RenderProps } from './types';

const raw = '1b9e77d95f027570b3e7298a66a61ee6ab02a6761d666666';
export const rainbow: string[] = ['#669'];
for (let i = 0; i < raw.length; i += 6) {
    rainbow.push('#' + raw.slice(i, i + 6));
}

// We'll start at depth=1, so this just rolls it one over
rainbow.unshift(rainbow.pop()!);

export function getRainbowHashColor(hash: string) {
    const idx = hash.startsWith(':')
        ? Math.floor(+hash.slice(1) * (rainbow.length / 5 - 1))
        : parseInt(hash, 16);
    // console.log('rainbow', hash, idx, rainbow[idx % rainbow.length]);
    const color = rainbow[idx % rainbow.length];
    return color;
}

const nodeColor = (type: MNode['type'], text?: string | null) => {
    return specials.includes(text!) ? '#814d4d' : colors[type];
};

const columnRecords = true;

const specials = ['defn', 'def', 'deftype', 'fn', 'match'];

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
    const color = nodeColor(
        node.type,
        node.type === 'identifier' ? node.text : null,
    );
    if (display?.style) {
        switch (display.style.type) {
            case 'unresolved':
                return { color: 'red' };
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
    const { idx, map, display, hashNames, path } = props;
    const nnode = getNestedNodes(
        map[idx],
        hashNames[idx],
        display[idx]?.layout,
    );

    if (path.length > 1000) {
        return <span>DEEP</span>;
    }

    const node = map[idx];
    return props.debug ? (
        <span style={{ display: 'flex' }}>
            <span
                style={{ opacity: 0.5, fontSize: '50%', lineHeight: '20px' }}
                data-display={JSON.stringify(props.display[idx])}
            >
                {idx}
            </span>
            <RenderNNode {...props} nnode={nnode} />
            {node.type === 'hash' || node.type === 'identifier' ? (
                <span
                    style={{
                        opacity: 0.5,
                        fontSize: '50%',
                        lineHeight: '20px',
                    }}
                >
                    {node.hash}
                </span>
            ) : null}
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

    const coverageLevel = isCoveredBySelection(props.selection, path, map);

    const errors = props.errors[node.loc.idx];

    const errorStyle = errors?.length
        ? {
              textDecoration: 'underline wavy',
              textDecorationColor: 'rgba(255,0,0,0.4)',
          }
        : {};

    const selectStyle =
        coverageLevel?.type === 'full' ||
        (('text' in node || node.type === 'hash') &&
            coverageLevel?.type === 'partial')
            ? {
                  borderRadius: 6,
                  backgroundColor: '#225',
                  textShadow: '2px 2px 1px black',
              }
            : {};

    switch (nnode.type) {
        case 'vert':
        case 'horiz':
        case 'inline':
            return (
                <span
                    style={{
                        display: nnode.type === 'inline' ? 'inline' : 'flex',
                        alignItems: 'flex-start',
                        flexDirection: nnode.type === 'vert' ? 'column' : 'row',
                        ...selectStyle,
                        ...errorStyle,
                    }}
                    onMouseEnter={() => dispatch({ type: 'hover', path })}
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
                        ...errorStyle,
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
                        ...errorStyle,
                    }}
                    onMouseEnter={() =>
                        dispatch({
                            type: 'hover',
                            path: path.concat({ idx, type: 'start' }),
                        })
                    }
                >
                    {nnode.text}
                </span>
            );
        case 'text': {
            let body;
            if (coverageLevel?.type === 'inner') {
                const text = splitGraphemes(nnode.text);
                const start =
                    coverageLevel.start.type === 'subtext'
                        ? coverageLevel.start.at
                        : coverageLevel.start.type === 'end'
                        ? text.length
                        : 0;
                const end =
                    coverageLevel.end.type === 'subtext'
                        ? coverageLevel.end.at
                        : coverageLevel.end.type === 'start'
                        ? 0
                        : text.length;
                body = (
                    <>
                        {text.slice(0, start).join('')}
                        <span
                            style={{ backgroundColor: '#225', borderRadius: 6 }}
                        >
                            {text.slice(start, end).join('')}
                        </span>
                        {text.slice(end).join('')}
                    </>
                );
            } else {
                body = nnode.text;
            }
            return (
                <span
                    ref={(node) => reg(node, idx, path)}
                    style={{
                        ...textStyle(node, display[idx]),
                        ...selectStyle,
                        ...errorStyle,
                    }}
                    onMouseEnter={() =>
                        dispatch({
                            type: 'hover',
                            path: path.concat({ idx, at: 0, type: 'subtext' }),
                        })
                    }
                    onDoubleClick={() => {
                        // console.log('dbl');
                        dispatch({
                            type: 'select',
                            at: [
                                {
                                    start: path.concat({ idx, type: 'start' }),
                                    end: path.concat({ idx, type: 'end' }),
                                },
                            ],
                        });
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
                                        type: 'subtext',
                                        at: calcOffset(
                                            evt.currentTarget,
                                            evt.clientX,
                                        ),
                                    }),
                                },
                            ],
                        });
                    }}
                >
                    {body}
                </span>
            );
        }
        case 'ref':
            return (
                <Render
                    map={map}
                    display={display}
                    errors={props.errors}
                    dispatch={dispatch}
                    reg={reg}
                    hashNames={props.hashNames}
                    idx={nnode.id}
                    selection={props.selection}
                    debug={props.debug}
                    path={path.concat([{ idx, ...nnode.path }])}
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
                        onMouseEnter={() => dispatch({ type: 'hover', path })}
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
                <span
                    style={{ display: 'grid', gap: '0 8px' }}
                    onMouseEnter={() => dispatch({ type: 'hover', path })}
                >
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
                <span
                    onMouseEnter={() => dispatch({ type: 'hover', path })}
                    style={{ display: 'inline-block', paddingLeft: 10 }}
                >
                    <RenderNNode {...props} nnode={nnode.child} />
                </span>
            );
    }
    let _: never = nnode;
    return <span>NOPE</span>;
};
