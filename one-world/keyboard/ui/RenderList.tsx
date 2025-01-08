import React from 'react';
import { List, isRich } from '../../shared/cnodes';
import { selUpdate } from '../handleNav';
import { interleaveF } from '../interleave';
import { TestState } from '../test-utils';
import { SelectionStatuses, Path, ListWhere, parentPath } from '../utils';
import { lightColor } from './colors';
import { Cursor } from './cursor';
import { RCtx, closestVisibleList, RenderNode, hlColor, Section, braceColorHl, braceColor, opener, closer } from './RenderNode';
import { posInList } from './selectionPos';

export const RenderList = (
    status: SelectionStatuses[''],
    readOnly: boolean | undefined,
    node: List<number>,
    style: React.CSSProperties | undefined,
    ref: (el: HTMLElement) => void,
    ctx: RCtx,
    nextParent: Path,
    state: TestState,
    inRich: boolean,
) => {
    const has = (where: ListWhere) => status?.cursors.some((c) => c.type === 'list' && c.where === where);

    const closest =
        !readOnly &&
        closestVisibleList(
            state.sel.start.cursor.type === 'list' && state.sel.start.cursor.where !== 'inside'
                ? parentPath(state.sel.start.path)
                : state.sel.start.path,
            state.top,
        );

    const hlBraces = closest === node.loc;

    const children = node.children.map((loc) => (
        <RenderNode parent={nextParent} ctx={ctx} key={loc} loc={loc} state={state} inRich={isRich(node.kind)} readOnly={readOnly} />
    ));
    // if (style) {
    //     style.display = 'inline-block';
    // }
    // const cursor = undefined as undefined | CollectionCursor; // current?.cursor;
    // const start = status?.cursors.find(c => c.type === 'list' && c.where === 'before')
    if (typeof node.kind !== 'string') {
        if (node.kind.type === 'tag') {
            return (
                <span style={{ display: 'inline-flex', flexDirection: 'row' }}>
                    <span style={style} ref={ref}>
                        <span
                            style={{
                                backgroundColor: has('start') ? hlColor : undefined,
                            }}
                        >
                            {has('before') ? <Cursor /> : null}
                            <span style={{ fontVariantLigatures: 'none' }}>&lt;</span>
                            <RenderNode
                                loc={node.kind.node}
                                ctx={ctx}
                                readOnly={readOnly}
                                parent={nextParent}
                                key={node.kind.node}
                                state={state}
                                inRich={false}
                            />
                            {node.kind.attributes != null ? (
                                <>
                                    <span style={{ width: 8, display: 'inline-block' }} />
                                    <RenderNode
                                        loc={node.kind.attributes}
                                        ctx={ctx}
                                        readOnly={readOnly}
                                        parent={nextParent}
                                        key={node.kind.attributes}
                                        state={state}
                                        inRich={false}
                                    />
                                </>
                            ) : undefined}
                            {!node.children.length ? (
                                <>
                                    {' /'}
                                    {has('inside') ? <Cursor /> : null}
                                </>
                            ) : null}
                            <span style={{ fontVariantLigatures: 'none' }}>&gt;</span>
                            {!node.children.length && has('after') ? <Cursor /> : null}
                        </span>
                        {node.children.length ? (
                            <>
                                <span style={{ display: 'flex', flexDirection: 'column', paddingLeft: 14 }}>{children}</span>
                                <span>
                                    <span style={{ fontVariantLigatures: 'none' }}>&lt;/</span>
                                    <RenderNode
                                        loc={node.kind.node}
                                        ctx={{ ...ctx, refs: {} }}
                                        parent={nextParent}
                                        key={node.kind.node + 'close'}
                                        state={state}
                                        inRich={false}
                                        readOnly
                                    />
                                    <span style={{ fontVariantLigatures: 'none' }}>&gt;</span>
                                    {has('after') ? <Cursor /> : null}
                                </span>
                            </>
                        ) : null}
                    </span>
                </span>
            );
        }

        if (!style) style = {};
        Object.assign(style, {
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: inRich ? undefined : 'rgb(240,255,240)',
            paddingTop: 4,
            paddingBottom: 4,
            paddingLeft: 8,
            paddingRight: 8,
            color: 'black',
        });

        if (hlBraces) {
            // style.outline = '2px solid teal';
            style.zIndex = 1;
            style.boxShadow = '-2px 0 0 teal';
        }

        if (status?.highlight?.type === 'list' && status.highlight.opener && status.highlight.closer) {
            style.backgroundColor = lightColor;
        }
        if (status?.highlight?.type === 'full') {
            style.backgroundColor = lightColor;
        }
        console.log('here statss', status);

        let contents = children;

        const hasControl = (index: number) => status?.cursors.some((c) => c.type === 'control' && c.index === index);

        switch (node.kind.type) {
            case 'list':
                const ordered = node.kind.ordered;
                contents = node.children.map((loc, i) => (
                    <React.Fragment key={loc}>
                        <div style={{ gridColumn: 1 }}>{ordered ? `${i + 1}.` : '•'}</div>
                        <div style={{ gridColumn: 2 }}>{children[i]}</div>
                    </React.Fragment>
                ));

                style.display = 'grid';
                style.columnGap = 4;
                style.gridTemplateColumns = 'min-content 1fr';
                break;
            case 'checks':
                const ch = node.kind.checked;
                contents = node.children.map((loc, i) => (
                    <React.Fragment key={loc}>
                        <input
                            style={{
                                gridColumn: 1,
                                outline: hasControl(i) ? '2px solid red' : undefined,
                            }}
                            type="checkbox"
                            checked={!!ch[loc]}
                            onClick={(evt) => {
                                evt.stopPropagation();
                            }}
                            onChange={(evt) => {
                                ctx.dispatch({
                                    nodes: {
                                        [node.loc]: {
                                            ...node,
                                            kind: { type: 'checks', checked: { ...ch, [loc]: !ch[loc] } },
                                        },
                                    },
                                });
                            }}
                        />
                        <div style={{ gridColumn: 2 }}>{children[i]}</div>
                    </React.Fragment>
                ));
                style.display = 'grid';
                style.columnGap = 4;
                style.gridTemplateColumns = 'min-content 1fr';
                break;
            case 'opts':
                style.display = 'grid';
                style.columnGap = 4;
                style.gridTemplateColumns = 'min-content 1fr';
                const which = node.kind.which;
                contents = node.children.map((loc, i) => (
                    <React.Fragment key={loc}>
                        <input
                            style={{ gridColumn: 1, outline: hasControl(i) ? '2px solid red' : undefined }}
                            type="radio"
                            checked={loc === which}
                            onClick={(evt) => {
                                evt.stopPropagation();
                                ctx.dispatch({
                                    nodes: {
                                        [node.loc]: {
                                            ...node,
                                            kind: { type: 'opts', which: which === loc ? undefined : loc },
                                        },
                                    },
                                });
                            }}
                            // to appease react
                            onChange={(evt) => {}}
                        />
                        <div style={{ gridColumn: 2 }}>{children[i]}</div>
                    </React.Fragment>
                ));
                break;
            case 'section': {
                if (contents.length) {
                    contents = contents.slice();
                    const style = { margin: 0, padding: 0, marginBottom: '0.3em', marginTop: '0.6em' };
                    if (node.kind.level === 1) {
                        contents[0] = (
                            <h1 style={style} key="header">
                                {contents[0]}
                            </h1>
                        );
                    } else if (node.kind.level === 2) {
                        contents[0] = (
                            <h2 style={style} key="header">
                                {contents[0]}
                            </h2>
                        );
                    } else if (node.kind.level === 3) {
                        contents[0] = (
                            <h3 style={style} key="header">
                                {contents[0]}
                            </h3>
                        );
                    }
                    contents = [<Section key="section" contents={contents} />];
                }
            }
        }
        return (
            <span style={{ display: 'inline-flex', flexDirection: 'row' }}>
                {has('before') ? <Cursor /> : null}
                <span style={style} ref={ref}>
                    {contents}
                </span>
                {has('after') ? <Cursor /> : null}
            </span>
        );
    }

    if (status?.highlight?.type === 'list' && status.highlight.opener && status.highlight.closer) {
        if (!style) style = {};
        style.borderRadius = '2px';
        style.backgroundColor = lightColor;
        style.outline = `2px solid ${lightColor}`;
    }
    switch (node.kind) {
        case 'smooshed':
            return (
                <span style={style} ref={ref}>
                    {children}
                </span>
            );
        case 'spaced':
            return (
                <span
                    style={{ ...style, display: 'inline-block' }}
                    ref={ref}
                    data-yes="yes"
                    onClick={(evt) => {
                        evt.stopPropagation();
                        const sel = posInList(nextParent, { x: evt.clientX, y: evt.clientY }, ctx.refs, state.top);
                        if (sel) {
                            ctx.dispatch(selUpdate(sel)!);
                        }
                    }}
                >
                    {interleaveF(children, (i) => (
                        <span key={'sep' + i}>&nbsp;</span>
                    ))}
                </span>
            );
        default:
            return (
                <span
                    style={style}
                    ref={ref}
                    onClick={(evt) => {
                        evt.stopPropagation();
                        const sel = posInList(nextParent, { x: evt.clientX, y: evt.clientY }, ctx.refs, state.top);
                        if (sel) {
                            ctx.dispatch(selUpdate(sel)!);
                        }
                    }}
                >
                    {has('before') ? <Cursor /> : null}
                    <span
                        style={{
                            backgroundColor: has('start') || (status?.highlight?.type === 'list' && status.highlight.opener) ? lightColor : undefined,
                            color: hlBraces ? braceColorHl : braceColor,
                            fontWeight: hlBraces ? 'bold' : undefined,
                            // outline: hlBraces ? '1px solid teal' : undefined,
                            // textDecoration: hlBraces ? 'underline' : undefined,
                            // textDecorationSkipInk: 'none',
                            // ...style,
                            // borderRadius: style?.borderRadius,
                        }}
                    >
                        {opener[node.kind]}
                    </span>
                    {has('inside') ? <Cursor /> : null}
                    {node.forceMultiline ? (
                        <div style={{ ...style, display: 'flex', width: 'fit-content', flexDirection: 'column', marginLeft: 16 }}>{children}</div>
                    ) : (
                        interleaveF(children, (i) => <span key={'sep' + i}>{node.kind === 'curly' ? ';' : ','}&nbsp;</span>)
                    )}
                    {/* {has('end') ? (
                                <span style={{ backgroundColor: hl }}>{closer[node.kind]}</span>
                            ) : (
                                closer[node.kind]
                            )} */}
                    <span
                        style={{
                            backgroundColor: has('end') || (status?.highlight?.type === 'list' && status.highlight.closer) ? lightColor : undefined,
                            color: hlBraces ? braceColorHl : braceColor,
                            // outline: hlBraces ? '1px solid teal' : undefined,
                            // textDecoration: hlBraces ? 'underline' : undefined,
                            // textDecorationSkipInk: 'none',
                            fontWeight: hlBraces ? 'bold' : undefined,
                            // borderRadius: style?.borderRadius,
                        }}
                    >
                        {closer[node.kind]}
                    </span>
                    {has('after') ? <Cursor /> : null}
                </span>
            );
    }
};
