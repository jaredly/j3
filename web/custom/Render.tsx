import React from 'react';
import { splitGraphemes } from '../../src/parse/parse';
import { Ctx } from '../../src/to-ast/Ctx';
import { MNode } from '../../src/types/mcst';
import { getNestedNodes, NNode } from '../../src/state/getNestedNodes';
import { isCoveredBySelection } from './isCoveredBySelection';
import { RenderProps } from './types';
import { splitNamespaces } from '../../src/db/hash-tree';
import { useNode, Values } from './Store';
import equal from 'fast-deep-equal';
import { LexicalFolks } from './Lexical';

const raw = '1b9e77d95f027570b3e7298a66a61ee6ab02a6761d666666';
export const rainbow: string[] = ['#669'];
for (let i = 0; i < raw.length; i += 6) {
    rainbow.push('#' + raw.slice(i, i + 6));
}

// We'll start at depth=1, so this just rolls it one over
rainbow.unshift(rainbow.pop()!);

export function getRainbowHashColor(hash: string | number) {
    const idx =
        typeof hash === 'number'
            ? Math.floor(hash * (rainbow.length / 5 - 1))
            : parseInt(hash, 16);
    const color = rainbow[idx % rainbow.length];
    return color;
}

// https://github.com/darkskyapp/string-hash/blob/master/index.js
function fasthash(str: string) {
    var hash = 5381,
        i = str.length;

    while (i) {
        hash = (hash * 33) ^ str.charCodeAt(--i);
    }

    /* JavaScript does bitwise operations (like XOR, above) on 32-bit signed
     * integers. Since we want the results to be always positive, convert the
     * signed int to an unsigned by doing an unsigned bitshift. */
    return hash >>> 0;
}

const nodeColor = (type: MNode['type'], text?: string | null) => {
    return specials.includes(text!)
        ? '#814d4d'
        : type === 'identifier' && text != null
        ? getRainbowHashColor(fasthash(text))
        : colors[type];
};

const columnRecords = true;

const specials = [
    'defn',
    'def',
    'deftype',
    'fn',
    'match',
    'defnrec',
    'fnrec',
    'if',
    'let',
    'match',
];

export const stringColor = '#ff9b00';
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
        case 'comment':
            return { color: '#4eb94e' };
    }
    return { color: 'violet' };
};

export const Render = React.memo(
    (props: RenderProps) => {
        const values = useNode(props.idx, props.path);
        const { node, nnode, display } = values;
        const { idx, path } = props;

        if (path.length > 1000) {
            return <span>DEEP</span>;
        }
        // console.log('render', props.idx);
        const inner = <RenderNNode {...props} nnode={nnode} values={values} />;

        if (values.meta?.trace || values.meta?.traceTop) {
            return (
                <span style={{ display: 'flex' }}>
                    {props.debug ? (
                        <span
                            style={{
                                opacity: 0.5,
                                fontSize: '50%',
                                lineHeight: '20px',
                            }}
                            data-display={JSON.stringify(display)}
                        >
                            {idx}
                        </span>
                    ) : null}
                    <span
                        style={{
                            position: 'absolute',
                            borderRadius: 5,
                            width: 5,
                            height: 5,
                            minHeight: 0,
                            marginLeft: -5,
                            backgroundColor: values.meta?.traceTop
                                ? 'red'
                                : 'green',
                            display: 'inline-block',
                        }}
                    ></span>
                    {inner}
                </span>
            );
        }

        return props.debug ? (
            <span style={{ display: 'flex' }}>
                <span
                    style={{
                        opacity: 0.5,
                        fontSize: '50%',
                        lineHeight: '20px',
                    }}
                    data-display={JSON.stringify(display)}
                >
                    {idx}
                </span>
                {inner}
                {node.type === 'hash' ? (
                    <span
                        style={{
                            opacity: 0.5,
                            fontSize: '50%',
                            lineHeight: '20px',
                        }}
                    >
                        {(node.hash + '').slice(0, 10)}
                    </span>
                ) : null}
            </span>
        ) : (
            inner
        );
    },
    (prev, next) => equal(prev, next),
    // () => false,
    // (prevProps: RenderProps, nextProps: RenderProps) => {
    //     for (let key of Object.keys(prevProps)) {
    //         if (
    //             // key !== 'path' &&
    //             // key !== 'selection' &&
    //             prevProps[key] !== nextProps[key]
    //         ) {
    //             // console.log('diff', key, prevProps[key]);
    //             return false;
    //         }
    //     }
    //     return true;
    // },
);

export const RenderNNode = (
    props: RenderProps & { nnode: NNode; values: Values },
): JSX.Element | null => {
    const { nnode, idx, path } = props;
    const { reg, display, dispatch, node, selection, errors } = props.values;

    const edgeSelected = selection?.edge;

    const coverageLevel = selection?.coverage;

    // const errors = props.errors[node.loc];

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
            let firstRenderable = nnode.children.findIndex((item) =>
                ['horiz', 'vert'].includes(item.type),
            );
            return (
                <span
                    style={{
                        display: nnode.type === 'inline' ? 'inline' : 'flex',
                        alignItems: 'flex-start',
                        flexDirection: nnode.type === 'vert' ? 'column' : 'row',
                        ...selectStyle,
                        ...errorStyle,
                        ...(nnode.style ?? {}),
                    }}
                    ref={(node) => reg(node, idx, path, 'outside')}
                    onMouseEnter={() => dispatch({ type: 'hover', path })}
                >
                    {/* {props.debug ? nnode.type : null} */}
                    {(props.firstLineOnly && firstRenderable != -1
                        ? nnode.children.slice(0, firstRenderable + 1)
                        : nnode.children
                    ).map((nnode, i) => (
                        <RenderNNode
                            {...props}
                            firstLineOnly={
                                props.firstLineOnly && firstRenderable != -1
                            }
                            nnode={nnode}
                            key={
                                nnode.type === 'ref'
                                    ? 'id:' + nnode.id + ':' + i
                                    : i
                            }
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
                        fontVariationSettings: edgeSelected ? '"wght" 900' : '',
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
                if (
                    nnode.text.length > 1 &&
                    (props.values.display?.style?.type === 'id' ||
                        props.values.display?.style?.type === 'unresolved')
                ) {
                    const nss = splitNamespaces(nnode.text);
                    if (nss.length) {
                        body = nss.map((n, i) =>
                            i === 0 ? (
                                <span key={i}>{n}</span>
                            ) : (
                                <React.Fragment key={i}>
                                    <span
                                        style={{
                                            transform: 'scale(0.5)',
                                            display: 'inline-block',
                                        }}
                                    >
                                        /
                                    </span>
                                    {n}
                                </React.Fragment>
                            ),
                        );
                    }
                }
            }
            return (
                <span
                    ref={(node) => reg(node, idx, path)}
                    style={{
                        ...textStyle(node, props.values.display),
                        ...selectStyle,
                        ...errorStyle,
                        whiteSpace: 'pre',
                    }}
                    onMouseEnter={() =>
                        dispatch({
                            type: 'hover',
                            path: path.concat({ idx, at: 0, type: 'subtext' }),
                        })
                    }
                    onDoubleClick={() => {
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
                    // className="idlike"
                >
                    {body}
                </span>
            );
        }
        case 'rich-text': {
            return (
                <LexicalFolks
                    initial={nnode.contents}
                    idx={props.idx}
                    path={props.path}
                />
            );
        }
        case 'ref': {
            const child = (
                <Render
                    key={nnode.id}
                    idx={nnode.id}
                    debug={props.debug}
                    path={path.concat([
                        ...(nnode.ancestors ?? []),
                        { idx, ...nnode.path },
                    ])}
                />
            );
            return nnode.style ? (
                <span key={nnode.id} style={nnode.style}>
                    {child}
                </span>
            ) : (
                child
            );
        }
        case 'pairs':
            const oneColor = 'transparent';
            const twoColor = 'rgba(100,100,100,0.1)';
            if (!columnRecords) {
                return (
                    <span
                        style={{
                            display: 'flex',
                            flexWrap: 'nowrap',
                            flexDirection: 'column',
                            // gap: '0 8px',
                        }}
                        onMouseEnter={() => dispatch({ type: 'hover', path })}
                    >
                        {nnode.firstLine.map((node, i) => (
                            <RenderNNode {...props} nnode={node} key={i} />
                        ))}
                        {nnode.children.map((pair, i) =>
                            pair.length === 1 ? (
                                <div
                                    key={i}
                                    style={{
                                        gridColumn: '1/2',
                                        backgroundColor:
                                            i % 2 == 0 ? oneColor : twoColor,
                                    }}
                                >
                                    <RenderNNode {...props} nnode={pair[0]} />
                                </div>
                            ) : (
                                <div
                                    style={{
                                        display: 'flex',
                                        backgroundColor:
                                            i % 2 == 0 ? oneColor : twoColor,
                                    }}
                                >
                                    <span key={i + '-0'}>
                                        <RenderNNode
                                            {...props}
                                            nnode={pair[0]}
                                        />
                                    </span>
                                    <span style={{ width: '0.5em' }} />
                                    <span
                                        key={i + '-1'}
                                        // style={{ position: 'relative' }}
                                    >
                                        {/* <Cross /> */}
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
                    style={{
                        display: 'grid',
                        // gap: '0 8px'
                    }}
                    onMouseEnter={() => dispatch({ type: 'hover', path })}
                >
                    {nnode.firstLine.length ? (
                        <span
                            style={{
                                gridColumn: '1/3',
                                paddingLeft: 4,
                                // backgroundColor: 'red',
                                display: 'flex',
                            }}
                        >
                            {nnode.firstLine.map((node, i) => (
                                <RenderNNode {...props} nnode={node} key={i} />
                            ))}
                        </span>
                    ) : null}
                    {nnode.children.flatMap((pair, i) =>
                        pair.length === 1
                            ? [
                                  <span
                                      key={i}
                                      style={{
                                          gridColumn: '1/3',
                                          paddingLeft: 4,
                                          //   backgroundColor:
                                          //       i % 2 == 0 ? oneColor : twoColor,
                                      }}
                                  >
                                      <RenderNNode {...props} nnode={pair[0]} />
                                  </span>,
                              ]
                            : [
                                  <span
                                      key={i + '-0'}
                                      style={{
                                          gridColumn: '1',
                                          paddingLeft: 4,
                                          marginLeft: nnode.firstLine.length
                                              ? 16
                                              : 0,
                                          //   display: 'flex',
                                          //   flexDirection: 'column',
                                          //   alignItems: 'flex-end',
                                          //   backgroundColor:
                                          //       i % 2 == 0 ? oneColor : twoColor,
                                      }}
                                  >
                                      <RenderNNode {...props} nnode={pair[0]} />
                                  </span>,
                                  <span
                                      key={i + '-1'}
                                      style={{
                                          gridColumn: '2',
                                          paddingLeft: 8,
                                          //   backgroundColor:
                                          //       i % 2 == 0 ? oneColor : twoColor,
                                          //   position: 'relative',
                                      }}
                                  >
                                      {/* {i > 0 ? <Cross /> : null} */}
                                      <RenderNNode {...props} nnode={pair[1]} />
                                  </span>,
                              ],
                    )}
                </span>
            );
        case 'dom':
            if (typeof nnode.node === 'function') {
                return nnode.node(path, idx);
            }
            return nnode.node;
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

const Cross = () => {
    return (
        <div
            style={{
                position: 'absolute',
                top: 0,
                left: 4,
            }}
        >
            <div
                style={{
                    position: 'absolute',
                    top: -3,
                    left: -0.5,
                    width: 1,
                    height: 6,
                    backgroundColor: '#333', //'white',
                }}
            />
            <div
                style={{
                    position: 'absolute',
                    top: -0.5,
                    left: -4,
                    width: 8,
                    height: 1,
                    backgroundColor: '#555', //'white',
                }}
            />
        </div>
    );
};
