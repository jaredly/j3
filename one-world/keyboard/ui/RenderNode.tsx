import React, { useMemo, useState } from 'react';
import { splitGraphemes } from '../../../src/parse/splitGraphemes';
import { isRich, Style } from '../../shared/cnodes';
import { cursorSides } from '../cursorSides';
import { interleaveF } from '../interleave';
import { TestState } from '../test-utils';
import {
    CollectionCursor,
    IdCursor,
    lastChild,
    ListCursor,
    ListWhere,
    parentLoc,
    parentPath,
    Path,
    pathKey,
    pathWithChildren,
    SelectionStatuses,
    selStart,
    TextCursor,
    Top,
    Update,
} from '../utils';
import { getCurrent } from '../selections';

import { asStyle } from '../../shared/shape';
// import { textCursorSides2 } from '../insertId';
import { Cursor, TextWithCursor, Zwd } from './cursor';
import { justSel, selUpdate } from '../handleNav';
import { posInList } from './selectionPos';
import { lightColor } from './colors';

const hlColor = 'rgba(100,100,100,0.2)';
// ? ''
// ? ''
// : '',
// ? ''
// ? ''
// : '',
const topener = { round: '⦇', square: '⟦', curly: '⦃', angle: '⦉' };
const tcloser = { round: '⦈', square: '⟧', curly: '⦄', angle: '⦊' };
const opener = { round: '(', square: '[', curly: '{', angle: '<' };
const closer = { round: ')', square: ']', curly: '}', angle: '>' };
const braceColor = 'rgb(100, 200, 200)';
const braceColorHl = 'rgb(0, 150, 150)';
type RCtx = {
    errors: Record<number, string>;
    refs: Record<number, HTMLElement>; // -1 gets you 'cursor' b/c why not
    styles: Record<number, Style>;
    placeholders: Record<number, string>;
    selectionStatuses: SelectionStatuses;
    dispatch: (up: Update) => void;
    msel: null | string[];
    mhover: null | string[];
};
const textColor = 'rgb(248 136 0)';

const cursorPositionInSpanForEvt = (evt: React.MouseEvent, target: HTMLSpanElement, text: string[]) => {
    const range = new Range();
    let best = null as null | [number, number];
    for (let i = 0; i < text.length; i++) {
        const at = text.slice(0, i).join('').length;
        range.setStart(target.firstChild!, at);
        range.setEnd(target.firstChild!, at);
        const box = range.getBoundingClientRect();
        if (evt.clientY < box.top || evt.clientY > box.bottom) continue;
        const dst = Math.abs(box.left - evt.clientX);
        if (!best || dst < best[0]) best = [dst, i];
    }
    return best ? best[1] : null;
};

const shadow = (x: number, y: number, color: string) => {
    return `${x}px ${y}px 0 ${color},-${x}px ${y}px 0 ${color},-${x}px -${y}px 0 ${color},6px -${y}px 0 ${color},0 ${y}px 0 ${color}, 0 -${y}px 0 ${color}`;
};

// const msk = 'rgb(255,100,100)'

const phBg = 'rgb(240,240,240)';
const placeholderStyle: React.CSSProperties = {
    backgroundColor: phBg,
    fontStyle: 'italic',
    color: 'rgb(100,100,100)',
    borderRadius: 4,
    outline: '2px solid ' + phBg,
    width: 'min-content',
};

const closestVisibleList = (path: Path, top: Top) => {
    for (let i = path.children.length - 1; i >= 0; i--) {
        const node = top.nodes[path.children[i]];
        if (node.type === 'table' || (node.type === 'list' && node.kind !== 'smooshed' && node.kind !== 'spaced')) {
            return node.loc;
        }
    }
};

export const RenderNode = ({
    loc,
    state,
    inRich,
    ctx,
    parent,
    readOnly,
}: {
    loc: number;
    state: TestState;
    inRich: boolean;
    ctx: RCtx;
    parent: Path;
    readOnly?: boolean;
}) => {
    const node = state.top.nodes[loc];

    let style: React.CSSProperties | undefined = false ? { textDecoration: 'underline' } : ctx.styles[loc] ? asStyle(ctx.styles[loc]) : undefined;

    const nextParent = useMemo(() => pathWithChildren(parent, loc), [parent, loc]);
    const key = useMemo(() => pathKey(nextParent), [nextParent]);

    const closest =
        !readOnly &&
        closestVisibleList(
            state.sel.start.cursor.type === 'list' && state.sel.start.cursor.where !== 'inside'
                ? parentPath(state.sel.start.path)
                : state.sel.start.path,
            state.top,
        );

    const status = ctx.selectionStatuses[key];

    if (!readOnly && status?.highlight?.type === 'full') {
        if (!style) style = {};
        style.borderRadius = '2px';
        style.backgroundColor = lightColor;
        style.outline = `2px solid ${lightColor}`;
    }

    // if (!readOnly && state.sel.multi?.end?.key === key) {
    //     if (!style) style = {};
    //     style.borderRadius = '2px';
    //     const color = 'rgb(255,100,100)';
    //     style.backgroundColor = lightColor;
    //     style.outline = `2px solid ${color}`;
    //     style.position = 'relative';
    // }

    const hoverColor = 'rgb(200,230,255)';
    if (!readOnly && ctx.mhover?.includes(key)) {
        if (!style) style = {};
        style.borderRadius = '2px';
        // const lightColor = 'rgb(255,100,100,0.5)';
        style.backgroundColor = hoverColor;
        style.outline = `2px solid ${hoverColor}`;
    }

    const hlBraces = closest === loc;

    // if (closest === loc) {
    //     if (!style) style = {};
    //     style.outline = '4px solid red';
    // }
    const has = (where: ListWhere) => status?.cursors.some((c) => c.type === 'list' && c.where === where);

    const ref = (el: HTMLElement) => {
        ctx.refs[loc] = el;
    };

    switch (node.type) {
        case 'id':
            if (status?.cursors.length && !readOnly) {
                const cursorText = (status.cursors.find((c) => c.type === 'id' && c.text) as IdCursor)?.text;
                const text = cursorText ?? splitGraphemes(node.text);
                return (
                    <span style={{ ...style, position: 'relative' }}>
                        <TextWithCursor
                            innerRef={ref}
                            onClick={(evt) => {
                                evt.stopPropagation();
                                const pos = cursorPositionInSpanForEvt(evt, evt.currentTarget, text);
                                ctx.dispatch(justSel(nextParent, { type: 'id', end: pos ?? 0, text: cursorText }));
                            }}
                            text={text}
                            highlight={status.highlight?.type === 'id' ? status.highlight : undefined}
                            cursors={(status.cursors.filter((c) => c.type === 'id') as IdCursor[]).map((c) => c.end)}
                        />
                        {/* {text.length === 0 && plh != null ? <PLHPopover text={plh} /> : null} */}
                    </span>
                );
            }
            let text = node.text;
            // if (text === '' && plh != null) {
            //     const pnode = state.top.nodes[lastChild(parent)];
            //     if (
            //         (pnode.type === 'list' && pnode.children.length === 1) ||
            //         (pnode.type === 'table' && pnode.rows.length === 1 && pnode.rows[0].length === 1)
            //     ) {
            //     } else {
            //         if (!style) style = {};
            //         Object.assign(style, placeholderStyle);
            //         text = plh;
            //     }
            // }
            return (
                <span
                    style={style}
                    ref={ref}
                    onClick={(evt) => {
                        evt.stopPropagation();
                        const pos = cursorPositionInSpanForEvt(evt, evt.currentTarget, splitGraphemes(node.text));
                        ctx.dispatch(justSel(nextParent, { type: 'id', end: pos ?? 0 }));
                        // ok I cant dispatch just yet
                    }}
                >
                    {text === '' ? <Zwd /> : text}
                </span>
            );
        case 'list': {
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
                    backgroundColor: 'rgb(240,255,240)',
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
                                    backgroundColor:
                                        has('start') || (status?.highlight?.type === 'list' && status.highlight.opener) ? lightColor : undefined,
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
                                <div style={{ ...style, display: 'flex', width: 'fit-content', flexDirection: 'column', marginLeft: 16 }}>
                                    {children}
                                </div>
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
                                    backgroundColor:
                                        has('end') || (status?.highlight?.type === 'list' && status.highlight.closer) ? lightColor : undefined,
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
        }

        case 'text': {
            // const cursor = undefined as undefined | TextCursor | CollectionCursor; //  current?.cursor;
            // const sides = cursor?.type === 'text' ? textCursorSides2(cursor) : null;
            const children = node.spans.map((span, i) => {
                if (span.type === 'text') {
                    const style = inRich ? asStyle(span.style) : { color: textColor, ...asStyle(span.style) };
                    const sc = status?.cursors.filter((c) => c.type === 'text' && c.end.index === i);
                    if (sc?.length) {
                        const cursorText = (sc.find((c) => c.type === 'text' && c.end.index === i && c.end.text) as TextCursor)?.end.text;
                        const text = cursorText ?? splitGraphemes(span.text);
                        // const text = sides.text?.index === i ? sides.text.grems : splitGraphemes(span.text);
                        // const left = i === sides.left.index ? sides.left.cursor : 0;
                        // const right = i === sides.right.index ? sides.right.cursor : text.length;
                        const hl = status?.highlight?.type === 'text' ? status.highlight.spans[i] : undefined;
                        return (
                            <span key={i} style={style} data-index={i}>
                                <TextWithCursor
                                    rich
                                    onClick={(evt) => {
                                        evt.stopPropagation();
                                        const pos = cursorPositionInSpanForEvt(evt, evt.currentTarget, text);
                                        ctx.dispatch(
                                            justSel(nextParent, {
                                                type: 'text',
                                                end: {
                                                    index: i,
                                                    cursor: pos ?? 0,
                                                    text: cursorText,
                                                },
                                            }),
                                        );
                                    }}
                                    text={text}
                                    highlight={hl}
                                    cursors={sc.map((s) => (s.type === 'text' ? s.end.cursor : 0))}
                                />
                            </span>
                        );
                    }
                    const hl = status?.highlight?.type === 'text' ? status.highlight.spans[i] : undefined;
                    // TODO show cursor here
                    return (
                        <span
                            key={i}
                            data-index={i}
                            style={hl ? { ...style, backgroundColor: lightColor } : style}
                            // style={style}
                            // style={{ backgroundColor: 'red' }}
                            onClick={(evt) => {
                                evt.stopPropagation();
                                const pos = cursorPositionInSpanForEvt(evt, evt.currentTarget, splitGraphemes(span.text));
                                ctx.dispatch(justSel(nextParent, { type: 'text', end: { index: i, cursor: pos ?? 0 } }));
                            }}
                        >
                            {span.text === '' ? '\u200B' : span.text}
                        </span>
                    );
                } else if (span.type === 'embed') {
                    const spa = status?.highlight?.type === 'text' ? status.highlight.spans[i] : null;
                    const selected = spa === true || (spa && (spa.start == null || spa.start === 0) && (spa.end == null || spa.end >= 1));
                    return (
                        <span
                            style={{
                                fontFamily: 'Jet Brains',
                                backgroundColor: selected ? lightColor : 'rgba(255,255,255,0.5)',
                            }}
                            data-index={i}
                            key={i}
                        >
                            {status?.cursors.some((c) => c.type === 'text' && c.end.index === i && c.end.cursor === 0) ? <Cursor /> : null}
                            <span style={{ color: 'rgb(248 136 0)' }}>{'${'}</span>
                            <RenderNode ctx={ctx} parent={nextParent} inRich={false} loc={span.item} state={state} readOnly={readOnly} />
                            <span style={{ color: 'rgb(248 136 0)' }}>{'}'}</span>
                            {status?.cursors.some((c) => c.type === 'text' && c.end.index === i && c.end.cursor === 1) ? <Cursor /> : null}
                        </span>
                    );
                } else {
                    return (
                        <span data-index={i} key={i}>
                            custom?
                        </span>
                    );
                }
            });
            if (inRich) {
                // no quotes, and like ... some other things
                // are maybe different?
                return (
                    <span ref={ref} style={{ ...style, fontFamily: 'Merriweather' }}>
                        {has('inside') ? <Cursor rich /> : null}
                        {children}
                        {!children.length ? <Zwd /> : null}
                    </span>
                );
            }
            return (
                <span style={style} ref={ref}>
                    {has('before') ? <Cursor /> : null}
                    <span
                        style={{
                            backgroundColor: has('start') || (status?.highlight?.type === 'text' && status.highlight.opener) ? lightColor : undefined,
                            color: textColor,
                        }}
                    >
                        "
                    </span>
                    {has('inside') ? <Cursor /> : null}
                    {children}
                    {!children.length ? <Zwd /> : null}
                    <span
                        style={{
                            backgroundColor: has('end') || (status?.highlight?.type === 'text' && status.highlight.closer) ? lightColor : undefined,
                            color: textColor,
                        }}
                    >
                        "
                    </span>
                    {has('after') ? <Cursor /> : null}
                </span>
            );
        }

        case 'table': {
            const mx = node.rows.reduce((c, r) => Math.max(c, r.length), 0);
            const cursor = undefined as CollectionCursor | undefined;
            if (isRich(node.kind)) {
                const cols: string[] = [];
                for (let i = 0; i < mx; i++) {
                    if (i > 0) cols.push('min-content');
                    cols.push('max-content');
                }
                return (
                    <span style={{ display: 'inline-flex', flexDirection: 'row' }}>
                        {cursor?.type === 'list' && cursor.where === 'before' ? <Cursor /> : null}

                        <span
                            ref={ref}
                            style={{
                                ...style,
                                border: '1px solid teal',
                                padding: 8,
                                gridTemplateColumns: cols.join(' '),
                                columnGap: 4,
                                display: 'grid',
                            }}
                        >
                            {node.rows.map((row) =>
                                row.map((cell, i) => [
                                    i > 0 ? (
                                        <span key={cell + ' |'} style={{ gridColumn: i * 2 }}>
                                            {'|'}
                                        </span>
                                    ) : null,
                                    <span key={cell} style={{ gridColumn: row.length === 1 ? `span ${mx * 2 - 1}` : i * 2 + 1 }}>
                                        <RenderNode parent={nextParent} ctx={ctx} loc={cell} state={state} inRich={true} readOnly={readOnly} />
                                    </span>,
                                ]),
                            )}
                        </span>
                        {cursor?.type === 'list' && cursor.where === 'after' ? <Cursor /> : null}
                    </span>
                );
            }

            const children = node.rows.map((row) => {
                const nodes = row.map((loc) => (
                    <RenderNode parent={nextParent} ctx={ctx} key={loc} loc={loc} state={state} inRich={false} readOnly={readOnly} />
                ));
                if (!node.forceMultiline) {
                    return interleaveF(nodes, (i) => <span key={`sep${i}`}>: </span>);
                }
                return interleaveF(
                    nodes.map((node, i) => (
                        <span
                            key={i}
                            style={{
                                gridColumn: row.length === 1 ? `span ${mx * 2 - 1}` : i * 2 + 1,
                            }}
                        >
                            {node}
                        </span>
                    )),
                    (i) => (
                        <span
                            style={{
                                gridColumn: i * 2 + 2,
                            }}
                            key={`sep${i}`}
                        >
                            {': '}
                        </span>
                    ),
                );
            });

            const cols: string[] = [];
            for (let i = 0; i < mx; i++) {
                if (i > 0) cols.push('min-content');
                cols.push('max-content');
            }

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
                    {cursor?.type === 'list' && cursor.where === 'before' ? <Cursor /> : null}
                    <span
                        style={{
                            backgroundColor: cursor?.type === 'list' && cursor.where === 'start' ? hlColor : undefined,
                            color: braceColor,
                            // ...style,
                            // borderRadius: style?.borderRadius,
                        }}
                    >
                        {opener[node.kind]}
                        <span style={{ marginLeft: '-0.3em', fontVariantLigatures: 'none' }}>:</span>
                    </span>
                    {cursor?.type === 'list' && cursor.where === 'inside' ? <Cursor /> : null}

                    {node.forceMultiline ? (
                        <div
                            style={{
                                ...style,
                                display: 'grid',
                                width: 'fit-content',
                                gridTemplateColumns: cols.join(' '),
                                flexDirection: 'column',
                                marginLeft: 16,
                            }}
                        >
                            {children}
                        </div>
                    ) : (
                        interleaveF(children, (i) => [<span key={`row${i}`}>{'; '}</span>])
                    )}
                    <span
                        style={{
                            backgroundColor: cursor?.type === 'list' && cursor.where === 'end' ? hlColor : undefined,
                            color: braceColor,
                            // borderRadius: style?.borderRadius,
                        }}
                    >
                        <span style={{ marginRight: '-0.3em', fontVariantLigatures: 'none' }}>:</span>
                        {closer[node.kind]}
                    </span>
                    {cursor?.type === 'list' && cursor.where === 'after' ? <Cursor /> : null}
                </span>
            );
        }
    }
};

const Section = ({ contents }: { contents: JSX.Element[] }) => {
    const [open, setOpen] = useState(true);

    const head = (
        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
            <button
                style={{ marginRight: 4, marginTop: '0.6em', background: 'none', border: 'none', cursor: 'pointer' }}
                onClick={() => setOpen(!open)}
            >
                {open ? '▼' : '▶'}
            </button>
            {contents[0]}
        </div>
    );
    return open ? (
        <>
            {head}
            {contents.slice(1)}
        </>
    ) : (
        head
    );
};

const PLHPopover = ({ text }: { text: string }) => {
    return (
        <div
            style={{
                position: 'absolute',
                bottom: '100%',
                left: 0,
                marginLeft: -10,
                marginBottom: 10,
                zIndex: 10,
                backgroundColor: '#eef',
                borderRadius: 4,
                padding: '0px 3px',
                border: '1px solid #777',
                fontSize: '80%',
            }}
        >
            {text}
            <div
                style={{
                    width: 0,
                    height: 0,
                    borderLeft: '4px solid transparent',
                    borderRight: '4px solid transparent',
                    borderTop: '8px solid #777',
                    position: 'absolute',
                    left: 6,
                    top: '100%',
                }}
            />
            <div
                style={{
                    width: 0,
                    height: 0,
                    borderLeft: '3px solid transparent',
                    borderRight: '3px solid transparent',
                    borderTop: '6px solid #eef',
                    position: 'absolute',
                    left: 7,
                    top: '100%',
                }}
            />
        </div>
    );
};
