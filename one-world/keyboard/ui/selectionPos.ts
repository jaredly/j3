import { TestState } from '../test-utils';

import { splitGraphemes } from '../../../src/parse/splitGraphemes';
import { lastChild, NodeSelection, Path, pathWithChildren, selStart, Top } from '../utils';
import { getCurrent } from '../selections';
import { goLeft, goRight, handleNav, isTag, selectEnd, selectStart } from '../handleNav';
import { SelStart } from '../handleShiftNav';
import { idText, spanText } from '../cursorSplit';

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
    const current = selectionPos(sel.start, refs, top);
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
    const current = selectionPos(sel.start, refs, top);
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
    sel: SelStart,
    refs: Record<number, HTMLSpanElement>,
    top: Top,
): { left: number; top: number; height: number } | null => {
    const cur = getCurrent({ start: sel }, top);
    const span = refs[cur.node.loc];
    if (!span) {
        console.log('no span for', cur.node.loc);
        return null;
    }
    const range = new Range();
    switch (cur.type) {
        case 'id': {
            const text = idText(top.tmpText, cur.cursor, cur.node);
            if (text.length === 0) {
                return boxAt(span.getBoundingClientRect());
            }
            const at = text.slice(0, cur.cursor.end).join('').length;
            try {
                range.setStart(span.firstChild!, at);
                range.setEnd(span.firstChild!, at);
                const box = range.getBoundingClientRect();
                return boxAt(box);
            } catch (err) {
                console.log('er', err);
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
                    if (cur.node.type === 'list' && isTag(cur.node.kind)) {
                        range.setStart(span.firstChild!, 2);
                        range.setEnd(span.firstChild!, 3);
                    } else {
                        range.setStart(span, 2);
                        range.setEnd(span, 3);
                    }
                    return boxAt(range.getBoundingClientRect());
                } else {
                    range.setStart(span, span.childNodes.length - 1);
                    range.setEnd(span, span.childNodes.length);
                    const box = range.getBoundingClientRect();
                    return { left: box.right, top: box.top, height: box.height };
                }
            } catch (err) {
                console.log('er', err);
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
                    console.log('er', err);
                    return null;
                }
            }
            if (cur.cursor.type === 'text') {
                const got = span.querySelector(`& > [data-index="${cur.cursor.end.index}"]`);
                if (!got) {
                    console.log('nop');
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
                    const text = spanText(top.tmpText, cur.node.loc, cur.cursor.end, tspan);
                    const at = text.slice(0, cur.cursor.end.cursor).join('').length;
                    range.setStart(first, at);
                    range.setEnd(first, at);
                    return boxAt(range.getBoundingClientRect());
                } catch (err) {
                    console.log('er', err);
                    return null;
                }
            }
        }
    }
    return null;
};

export type CPos = { left: number; top: number; height: number };

// We only need to check the starts & ends of all children for the closest one.
// maybe?
export const posInList = (path: Path, pos: { x: number; y: number }, refs: Record<number, HTMLElement>, top: Top) => {
    // console.log('pos in list', path, pos, refs, top);
    const node = top.nodes[lastChild(path)];

    let best = null as [Dist, NodeSelection['start']] | null;
    type Dist = ReturnType<typeof canDist>;

    const canDist = (candidate: CPos) => {
        const dx = candidate.left - pos.x;
        const dy =
            pos.y >= candidate.top && pos.y <= candidate.top + candidate.height
                ? 0
                : pos.y < candidate.top
                ? pos.y - candidate.top
                : pos.y - (candidate.top + candidate.height);
        // const d = dx * dx + dy * dy;
        return { dx, dy };
    };

    const isBetter = (newD: Dist, oldD: Dist) => {
        if (oldD.dy === 0 && newD.dy !== 0) return false;
        if (newD.dy !== 0 && newD.dy === 0) return true;
        const yd = Math.abs(newD.dy) - Math.abs(oldD.dy);
        if (yd !== 0) return yd < 0;
        return Math.abs(newD.dx) < Math.abs(oldD.dx);
    };

    const isBetter_old = (newD: Dist, oldD: Dist) => newD < oldD;
    const canDist_old = (candidate: CPos) => {
        const dx = candidate.left - pos.x;
        const dy =
            pos.y >= candidate.top && pos.y <= candidate.top + candidate.height
                ? 0
                : pos.y < candidate.top
                ? pos.y - candidate.top
                : pos.y - (candidate.top + candidate.height);
        const d = dx * dx + dy * dy;
        return d;
    };

    const add = (candidate?: CPos | null, value?: SelStart | void) => {
        if (!candidate || !value) return;
        const d = canDist(candidate);
        if (!best || isBetter(d, best[0])) {
            best = [d, value];
        }
    };

    const sides = (path: Path) => {
        const bsel = selectStart(path, top);
        const before = bsel ? selectionPos(bsel, refs, top) : null;
        const asel = selectEnd(path, top);
        const after = asel ? selectionPos(asel, refs, top) : null;
        add(before, bsel);
        add(after, asel);
    };

    sides(path);

    if (node.type === 'table') {
        node.rows.forEach((row) => {
            row.forEach((child) => {
                const cpath = pathWithChildren(path, child);
                sides(cpath);
            });
        });
    } else if (node.type !== 'list') {
        console.warn('not a list', node);
        return null;
    } else {
        node.children.forEach((child) => {
            const cpath = pathWithChildren(path, child);
            sides(cpath);
        });
    }

    return best ? best[1] : null;
};

function above(sel: NodeSelection, top: Top, refs: Record<number, HTMLElement>, current: CPos) {
    const options = [];
    let start = sel.start;
    while (true) {
        // const next = goLeft(sel.start.path, top);
        const next = handleNav('ArrowLeft', { top, sel: { start } });
        if (!next) break;
        start = next;

        const at = selectionPos(start, refs, top);
        if (!at) continue; // or break??

        if (!options.length) {
            if (at.top + at.height > current.top) continue;
        } else if (at.top + at.height / 2 < options[0].at.top) {
            break;
        }
        options.push({
            at,
            next: start,
            dx: Math.abs(at.left - current.left),
        });
    }
    return options;
}

function below(sel: NodeSelection, top: Top, refs: Record<number, HTMLElement>, current: CPos) {
    const options = [];
    let start = sel.start;
    while (true) {
        const next = handleNav('ArrowRight', { top, sel: { start } });
        if (!next) {
            break;
        }
        start = next;

        const at = selectionPos(start, refs, top);
        if (!at) continue; // or break??

        if (!options.length) {
            if (at.top < current.top + current.height) continue;
        } else if (at.top > options[0].at.top + options[0].at.height / 2) {
            // console.log('too low');
            break;
        }
        options.push({
            at,
            next: start,
            dx: Math.abs(at.left - current.left),
        });
    }
    return options;
}
