import React, { useMemo, useState } from 'react';
import { Style } from '../../shared/cnodes';
import { TestState } from '../test-utils';
import { Path, pathKey, pathWithChildren, SelectionStatuses, Top, Update } from '../utils';

import { asStyle } from '../../shared/shape';
// import { textCursorSides2 } from '../insertId';
import { lightColor } from './colors';
import { RenderId } from './RenderId';
import { RenderList } from './RenderList';
import { RenderText } from './RenderText';
import { RenderTable } from './RenderTable';

export const hlColor = 'rgba(100,100,100,0.2)';
// ? ''
// ? ''
// : '',
// ? ''
// ? ''
// : '',
const topener = { round: '⦇', square: '⟦', curly: '⦃', angle: '⦉' };
const tcloser = { round: '⦈', square: '⟧', curly: '⦄', angle: '⦊' };
export const opener = { round: '(', square: '[', curly: '{', angle: '<' };
export const closer = { round: ')', square: ']', curly: '}', angle: '>' };
export const braceColor = 'rgb(100, 200, 200)';
export const braceColorHl = 'rgb(0, 150, 150)';
export type RCtx = {
    errors: Record<number, string>;
    refs: Record<number, HTMLElement>; // -1 gets you 'cursor' b/c why not
    styles: Record<number, Style>;
    placeholders: Record<number, string>;
    selectionStatuses: SelectionStatuses;
    dispatch: (up: Update) => void;
    msel: null | string[];
    mhover: null | string[];
};
export const textColor = 'rgb(248 136 0)';

export const cursorPositionInSpanForEvt = (evt: React.MouseEvent, target: HTMLSpanElement, text: string[]) => {
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

export const closestVisibleList = (path: Path, top: Top) => {
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

    const nextParent = useMemo(() => pathWithChildren(parent, loc), [parent, loc]);
    const key = useMemo(() => pathKey(nextParent), [nextParent]);

    const status = ctx.selectionStatuses[key];

    let style = nodeStyle(ctx, loc, readOnly, status, key);

    const ref = (el: HTMLElement) => {
        ctx.refs[loc] = el;
    };

    switch (node.type) {
        case 'id':
            return RenderId(status, readOnly, node, style, ref, ctx, nextParent);
        case 'list':
            return RenderList(status, readOnly, node, style, ref, ctx, nextParent, state, inRich);
        case 'text':
            return RenderText(status, readOnly, node, style, ref, ctx, nextParent, state, inRich);
        case 'table':
            return RenderTable(status, readOnly, node, style, ref, ctx, nextParent, state, inRich);
    }
};

export const Section = ({ contents }: { contents: JSX.Element[] }) => {
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

function nodeStyle(
    ctx: RCtx,
    loc: number,
    readOnly: boolean | undefined,
    status: {
        cursors: import('/Users/jared/clone/exploration/j3/one-world/keyboard/utils').Cursor[];
        highlight?: import('/Users/jared/clone/exploration/j3/one-world/keyboard/utils').Highlight;
    },
    key: string,
) {
    let style: React.CSSProperties | undefined = false ? { textDecoration: 'underline' } : ctx.styles[loc] ? asStyle(ctx.styles[loc]) : undefined;

    if (!readOnly && status?.highlight?.type === 'full') {
        if (!style) style = {};
        style.borderRadius = '2px';
        style.backgroundColor = lightColor;
        style.outline = `2px solid ${lightColor}`;
    }

    if (!readOnly && ctx.mhover?.includes(key)) {
        const hoverColor = 'rgb(200,230,255)';
        if (!style) style = {};
        style.borderRadius = '2px';
        style.backgroundColor = hoverColor;
        style.outline = `2px solid ${hoverColor}`;
    }
    return style;
}
