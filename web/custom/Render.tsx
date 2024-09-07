import equal from 'fast-deep-equal';
import React from 'react';
import { splitNamespaces } from '../../src/db/hash-tree';
import { splitGraphemes } from '../../src/parse/splitGraphemes';
import { NNode } from '../../src/state/nestedNodes/NNode';
import { stringBgColor } from '../../src/state/nestedNodes/getNestedNodes';
// import { Ctx } from '../../src/to-ast/Ctx';
import { MNode } from '../../src/types/mcst';
import { blockToHtml } from '../ide/ground-up/blockToText';
import { Path } from '../store';
import { RawCode } from './RawCode';
import { RichText } from './RichText';
import { colors, getRainbowHashColor, nodeColor, rainbow } from './rainbow';
import { Values } from './store/Store';
import { useGetStore } from './store/StoreCtx';
import { useNode } from './store/useNode';
import { RenderProps } from './types';
import { Display } from '../../src/to-ast/library';

const columnRecords = true;

const textStyle = (
    node: MNode,
    display?: Display[0],
): React.CSSProperties | undefined => {
    const color = nodeColor(
        node.type,
        node.type === 'identifier'
            ? node.text
            : node.type === 'accessText'
            ? node.text
            : null,
    );
    if (display?.style) {
        switch (display.style.type) {
            case 'unresolved':
                return { color: 'red' };
            case 'record-attr':
                return {
                    fontStyle: 'italic',
                    fontFamily: 'serif',
                    // color: '#84a4a5',
                    color: color ?? '#84a4a5',
                    // color: getRainbowHashColor(display.style.)
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
        case 'accessText':
            return { color: color };
        case 'stringText':
            return {
                color: color,
                whiteSpace: 'pre',
                backgroundColor: stringBgColor,
            };
        case 'comment':
            return { color: '#4eb94e' };
    }
    return { color: color ?? 'violet' };
};

export const Render = React.memo(
    (props: RenderProps) => {
        const values = useNode(props.idx, props.path);
        const { node, nnode, display } = values;
        const { idx, path } = props;
        const store = useGetStore();

        if (path.length > 1000) {
            return <span>DEEP</span>;
        }

        let changeKind = null;
        if (values.trackChanges !== undefined) {
            if (values.trackChanges === null) {
                changeKind = 'new';
            } else if (
                values.trackChanges.type !== node.type ||
                node.type === 'identifier'
            ) {
                changeKind = 'new';
            } else if (values.trackChanges) {
                changeKind = 'change';
            }
        }
        const isMultiLine = display.layout?.type === 'multiline';

        // console.log('render', props.idx);
        // display.layout?.type
        const inner = (
            <div
                data-path={JSON.stringify(path)}
                data-idx={idx}
                style={{
                    backgroundColor: isMultiLine
                        ? changeKind === 'new'
                            ? 'rgb(10, 20, 10)'
                            : changeKind
                            ? 'rgb(7 22 7)'
                            : undefined
                        : undefined,
                    textDecoration:
                        !isMultiLine && changeKind
                            ? 'underline dotted rgb(20, 136, 30)'
                            : undefined,
                    textUnderlineOffset: 2,
                    border:
                        isMultiLine && changeKind // && changeKind === 'new'
                            ? '2px dotted rgb(20 136 30)'
                            : undefined,
                    // border:
                    //     values.trackChanges === null &&
                    //     display.layout?.type === 'multiline'
                    //         ? '1px solid rgb(100, 150, 100)'
                    //         : undefined,
                }}
                onMouseMove={(evt) => {
                    // Prevent parents from doing this same thing
                    evt.stopPropagation();
                    const hover = store.getState().hover;
                    if (!hover.find((p) => p.idx === idx)) {
                        store.dispatch({ type: 'hover', path });
                    }
                }}
                onMouseLeave={() => {
                    store.dispatch({ type: 'hover', path: [] });
                }}
                // onMouseEnter={() => {
                //     store.dispatch({ type: 'hover', path });
                // }}
            >
                <RenderNNode
                    {...props}
                    nnode={nnode}
                    values={values}
                    hoverPath={path}
                    Recurse={Render}
                />
            </div>
        );

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
                    <div
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
                            cursor: values.meta.trace ? 'pointer' : '',
                        }}
                        onClick={() => {
                            const formatter = prompt('formatter name:');
                            store.dispatch({
                                type: 'meta',
                                meta: {
                                    [idx]: {
                                        ...values.meta,
                                        trace: {
                                            ...values.meta!.trace,
                                            formatter,
                                        },
                                    },
                                },
                            });
                            // props.
                        }}
                    ></div>
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
    props: RenderProps & {
        nnode: NNode;
        values: Values;
        hoverPath: Path[];
        Recurse: React.ComponentType<RenderProps>;
    },
): JSX.Element | null => {
    const { nnode, idx, path, Recurse } = props;
    const { reg, dispatch, node, selection, errors } = props.values;

    const coverageLevel = selection?.coverage;

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
                    // onMouseEnter={() =>
                    //     dispatch?.({ type: 'hover', path: props.hoverPath })
                    // }
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
        case 'nest':
            return (
                <RenderNNode
                    {...props}
                    nnode={nnode.inner}
                    values={{ ...props.values, node: nnode.node }}
                />
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
                    onMouseEnter={() =>
                        dispatch?.({ type: 'hover', path: props.hoverPath })
                    }
                    onMouseLeave={() => {
                        dispatch?.({ type: 'hover', path: [] });
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
                        backgroundColor: nnode.bgColor ?? undefined,
                        alignSelf:
                            nnode.at === 'end' ? 'flex-end' : 'flex-start',
                        // fontVariationSettings: props.values.hover
                        //     ? '"wght" 900'
                        //     : '',
                        outline: props.values.hover
                            ? '1px solid rgba(255,255,255,0.2)'
                            : '1px solid transparent',
                        transition: 'ease .2s outline',
                        ...selectStyle,
                        ...errorStyle,
                    }}
                    onMouseEnter={() =>
                        dispatch?.({ type: 'hover', path: props.hoverPath })
                    }
                    onMouseLeave={() => {
                        dispatch?.({ type: 'hover', path: [] });
                    }}
                >
                    {nnode.text}
                </span>
            );
        case 'text': {
            let rawText = nnode.text;
            if (rawText.endsWith('\n')) {
                rawText += '​';
            }
            let body;
            if (coverageLevel?.type === 'inner') {
                const text = splitGraphemes(rawText);
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
                body = rawText;
                if (
                    rawText.length > 1 &&
                    (props.values.display?.style?.type === 'id' ||
                        props.values.display?.style?.type === 'unresolved')
                ) {
                    const nss = splitNamespaces(rawText);
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
                        ...(props.values.unused
                            ? { opacity: 0.5, fontStyle: 'italic' }
                            : {}),
                        ...(props.values.highlight
                            ? { outline: '1px dashed rgba(255,255,255,0.2)' }
                            : {}),
                    }}
                    onMouseEnter={() =>
                        dispatch?.({ type: 'hover', path: props.hoverPath })
                    }
                    onMouseLeave={() => {
                        dispatch?.({ type: 'hover', path: [] });
                    }}
                    onClick={(evt) => {
                        if (evt.metaKey) {
                            evt.stopPropagation();
                            evt.preventDefault();
                            dispatch?.({ type: 'jump-to-definition', idx });
                        }
                    }}
                    onDoubleClick={() => {
                        dispatch?.({
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
        case 'raw-code': {
            if (props.values.static) {
                // @ts-ignore
                const html = Prism.highlight(
                    nnode.raw,
                    // @ts-ignore
                    Prism.languages.javascript,
                    'javascript',
                );

                return (
                    <pre style={{ padding: '4px 8px', margin: 0 }}>
                        <code dangerouslySetInnerHTML={{ __html: html }} />
                    </pre>
                );
            }

            return (
                <RawCode
                    initial={nnode.raw}
                    lang={nnode.lang}
                    idx={props.idx}
                    path={props.path}
                />
            );
        }
        case 'rich-text': {
            if (props.values.static) {
                const html = nnode.contents.map(blockToHtml).join('\n');
                return (
                    <div
                        className="bn-container"
                        style={{
                            fontFamily: 'Merriweather',
                            fontWeight: 200,
                            backgroundColor: 'rgb(31, 31, 31)',
                            padding: '2px 4px',
                            borderRadius: 8,
                            margin: 0,
                        }}
                        dangerouslySetInnerHTML={{ __html: html }}
                    />
                );
            } else {
                return (
                    <RichText
                        initial={nnode.contents}
                        trackChanges={props.values.trackChanges}
                        idx={props.idx}
                        path={props.path}
                        reg={reg}
                    />
                );
            }
        }
        case 'ref': {
            const child = (
                <Recurse
                    key={nnode.id}
                    idx={nnode.id}
                    debug={props.debug}
                    path={path.concat([
                        ...(nnode.ancestors ?? []),
                        ...(nnode.path ? [{ idx, ...nnode.path }] : []),
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
                        // onMouseEnter={() =>
                        //     dispatch?.({ type: 'hover', path: props.hoverPath })
                        // }
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
                    // onMouseEnter={() =>
                    //     dispatch?.({ type: 'hover', path: props.hoverPath })
                    // }
                >
                    {nnode.firstLine.length ? (
                        <span
                            style={{
                                gridColumn: '1/4',
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
                                          gridColumn: '1/4',
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
                                          display: 'flex',
                                          flexDirection: 'row',
                                          justifyContent: 'flex-start',
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
                    // onMouseEnter={() =>
                    //     dispatch?.({ type: 'hover', path: props.hoverPath })
                    // }
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
