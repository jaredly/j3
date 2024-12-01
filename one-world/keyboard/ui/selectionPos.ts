import { TestState } from '../test-utils';

import { splitGraphemes } from '../../../src/parse/splitGraphemes';
import { getCurrent, NodeSelection, Top } from '../utils';
import { goLeft, goRight, handleNav } from '../handleNav';

const CLOSE = 10;

const deb = (at: { left: number; top: number; height: number }, color: string) => {
    const node = document.createElement('div');
    Object.assign(node.style, {
        position: 'absolute',
        background: color,
        left: at.left + 'px',
        top: at.top + 'px',
        height: at.height + 'px',
        width: '3px',
    });
    node.classList.add('DEB');
    document.body.append(node);
};

export const posUp = (sel: NodeSelection, top: Top, refs: Record<number, HTMLElement>) => {
    const current = selectionPos(sel, refs, top);
    if (!current) return;
    if (sel.start.returnToHoriz != null) {
        current.left = sel.start.returnToHoriz;
    }
    const options = above(sel, top, refs, current);
    if (!options.length) return;
    options.sort((a, b) => a.dx - b.dx);
    if (Math.abs(options[0].at.left - current.left) > CLOSE) {
        options[0].next.returnToHoriz = current.left;
    }
    return options[0].next;
};

export const posDown = (sel: NodeSelection, top: Top, refs: Record<number, HTMLElement>) => {
    const current = selectionPos(sel, refs, top);
    if (!current) return;
    if (sel.start.returnToHoriz != null) {
        current.left = sel.start.returnToHoriz;
    }
    const options = below(sel, top, refs, current);
    if (!options.length) return;
    options.sort((a, b) => a.dx - b.dx);
    if (Math.abs(options[0].at.left - current.left) > CLOSE) {
        options[0].next.returnToHoriz = current.left;
    }
    return options[0].next;
};

const boxAt = (box: DOMRect): CPos => ({ left: box.left, top: box.top, height: box.height });

// OK I broke down and did. I think its the right call.
export const selectionPos = (
    sel: TestState['sel'],
    refs: Record<number, HTMLSpanElement>,
    top: Top,
): { left: number; top: number; height: number } | null => {
    const cur = getCurrent(sel, top);
    const span = refs[cur.node.loc];
    if (!span) return null;
    const range = new Range();
    switch (cur.type) {
        case 'id': {
            const text = cur.cursor.text ?? splitGraphemes(cur.node.text);
            const at = text.slice(0, cur.cursor.end).join('').length;
            try {
                range.setStart(span.firstChild!, at);
                range.setEnd(span.firstChild!, at);
                const box = range.getBoundingClientRect();
                return boxAt(box);
            } catch (err) {
                return null;
            }
        }
        case 'list':
            // TODO controls
            if (cur.cursor.type !== 'list') {
                return null;
            }

            try {
                if (cur.cursor.where === 'before') {
                    range.setStart(span, 0);
                    range.setEnd(span, 1);
                    return boxAt(range.getBoundingClientRect());
                } else if (cur.cursor.where === 'inside') {
                    range.setStart(span, 2);
                    range.setEnd(span, 3);
                    return boxAt(range.getBoundingClientRect());
                } else {
                    range.setStart(span, span.childNodes.length - 1);
                    range.setEnd(span, span.childNodes.length);
                    const box = range.getBoundingClientRect();
                    return { left: box.right, top: box.top, height: box.height };
                }
            } catch (err) {
                return null;
            }
        case 'text': {
            if (cur.cursor.type === 'list') {
                try {
                    if (cur.cursor.where === 'before') {
                        range.setStart(span, 0);
                        range.setEnd(span, 1);
                        return boxAt(range.getBoundingClientRect());
                    } else if (cur.cursor.where === 'inside') {
                        range.setStart(span, 2);
                        range.setEnd(span, 3);
                        return boxAt(range.getBoundingClientRect());
                    } else {
                        range.setStart(span, span.childNodes.length - 1);
                        range.setEnd(span, span.childNodes.length);
                        const box = range.getBoundingClientRect();
                        return { left: box.right, top: box.top, height: box.height };
                    }
                } catch (err) {
                    return null;
                }
            }
            if (cur.cursor.type === 'text') {
                const got = span.querySelector(`& > [data-index="${cur.cursor.end.index}"]`);
                if (!got) {
                    return null;
                }
                try {
                    const tspan = cur.node.spans[cur.cursor.end.index];
                    if (tspan.type === 'embed') {
                        if (cur.cursor.end.cursor === 0) {
                            range.setStart(got, 0);
                            range.setEnd(got, 1);
                            return boxAt(range.getBoundingClientRect());
                        } else {
                            range.setStart(got, got.childNodes.length - 1);
                            range.setEnd(got, got.childNodes.length);
                            const box = range.getBoundingClientRect();
                            return { left: box.right, top: box.top, height: box.height };
                        }
                    }
                    if (tspan.type !== 'text') return null; // TODO embed

                    let first = got.firstChild;
                    while (first && first.nodeName !== '#text') {
                        first = first.firstChild;
                    }
                    if (!first) return null;
                    const text = cur.cursor.end.text ?? splitGraphemes(tspan.text);
                    const at = text.slice(0, cur.cursor.end.cursor).join('').length;
                    range.setStart(first, at);
                    range.setEnd(first, at);
                    return boxAt(range.getBoundingClientRect());
                } catch (err) {
                    return null;
                }
            }
        }
    }
    return null;
};

export type CPos = { left: number; top: number; height: number };

function above(sel: NodeSelection, top: Top, refs: Record<number, HTMLElement>, current: CPos) {
    const options = [];
    while (true) {
        // const next = goLeft(sel.start.path, top);
        const next = handleNav('ArrowLeft', { top, sel });
        if (!next || !next.selection) break;
        sel = next.selection;

        const at = selectionPos(sel, refs, top);
        if (!at) continue; // or break??

        if (!options.length) {
            if (at.top + at.height > current.top) continue;
        } else if (at.top + at.height / 2 < options[0].at.top) {
            break;
        }
        options.push({
            at,
            next: next.selection.start,
            dx: Math.abs(at.left - current.left),
        });
    }
    return options;
}

function below(sel: NodeSelection, top: Top, refs: Record<number, HTMLElement>, current: CPos) {
    const options = [];
    while (true) {
        const next = handleNav('ArrowRight', { top, sel });
        if (!next || !next.selection) {
            break;
        }
        sel = next.selection;

        const at = selectionPos(sel, refs, top);
        if (!at) continue; // or break??

        if (!options.length) {
            if (at.top < current.top + current.height) continue;
        } else if (at.top > options[0].at.top + options[0].at.height / 2) {
            // console.log('too low');
            break;
        }
        options.push({
            at,
            next: next.selection.start,
            dx: Math.abs(at.left - current.left),
        });
    }
    return options;
}
