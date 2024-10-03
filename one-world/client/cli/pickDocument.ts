import { toABlock } from '../../shared/IR/block-to-attributed-text';
import { getDoc } from '../../shared/state2';
import { Store } from '../StoreContext2';
import { Renderer } from './drawToTerminal';

export const pickDocument = (
    store: Store,
    term: Renderer,
    previewDoc: (id: string) => void,
) => {
    return new Promise<string | null>((resolve, reject) => {
        let state = store.getState();
        const ids = Object.keys(state._documents);
        let sel = 0;
        let renaming: null | { text: string; cursor: number } = null;

        const draw = () => {
            term.clear();
            for (let i = 0; i <= ids.length; i++) {
                term.moveTo(1, i + 1);
                if (i === ids.length) {
                    if (sel === i) {
                        term.write(
                            toABlock('New Document', {
                                background: { r: 0, g: 100, b: 0 },
                            }),
                        );
                    } else {
                        term.write(
                            toABlock('New Document', {
                                color: { r: 0, g: 0, b: 255 },
                            }),
                        );
                    }
                } else if (sel === i) {
                    const doc = getDoc(state, ids[i]);
                    if (renaming) {
                        term.write(
                            toABlock(renaming.text, {
                                background: { r: 0, g: 0, b: 255 },
                            }),
                        );
                    } else {
                        term.write(
                            toABlock(
                                doc.title + ' (' + ids[i].slice(0, 5) + ')',
                                {
                                    background: { r: 0, g: 100, b: 0 },
                                },
                            ),
                        );
                    }
                } else {
                    const doc = getDoc(state, ids[i]);
                    term.write(
                        toABlock(doc.title + ' (' + ids[i].slice(0, 5) + ')'),
                    );
                }
            }
            const id = ids[sel];
            if (id) {
                previewDoc(ids[sel]);
            }
        };

        store.on('all', () => {
            state = store.getState();
            draw();
        });

        const keyListener = (key: string) => {
            if (renaming) {
                if (key === 'ENTER') {
                    store.update({
                        type: 'doc',
                        action: {
                            type: 'update',
                            update: { title: renaming.text },
                        },
                        id: ids[sel],
                    });
                    renaming = null;
                    draw();
                    return;
                }
                if (key === 'ESCAPE') {
                    renaming = null;
                    draw();
                    return;
                }
                if (key === 'LEFT') {
                    renaming.cursor = Math.max(0, renaming.cursor - 1);
                } else if (key === 'RIGHT') {
                    renaming.cursor = Math.min(
                        renaming.text.length,
                        renaming.cursor + 1,
                    );
                } else if (key === 'BACKSPACE') {
                    if (renaming.cursor > 0) {
                        renaming.text =
                            renaming.text.slice(0, renaming.cursor - 1) +
                            renaming.text.slice(renaming.cursor);
                        renaming.cursor--;
                    }
                } else if (key.length === 1) {
                    renaming.text =
                        renaming.text.slice(0, renaming.cursor) +
                        key +
                        renaming.text.slice(renaming.cursor);
                    renaming.cursor++;
                }
                draw();
                term.moveTo(renaming.cursor + 1, sel + 1);
                term.drawCursor();
                return;
            }
            if (key === 'ENTER') {
                removeKeyListener();
                if (sel === ids.length) {
                    resolve(null);
                } else {
                    resolve(ids[sel]);
                }
                return;
            }
            if (key === 'DOWN') {
                sel = Math.min(sel + 1, ids.length);
                renaming = null;
            }
            if (key === 'UP') {
                sel = Math.max(0, sel - 1);
                renaming = null;
            }
            if (key === 'ESCAPE') {
                reject('quit');
            }
            if (key === 'r') {
                const title = getDoc(state, ids[sel]).title;
                renaming = { text: title, cursor: title.length };
            }
            draw();
            if (renaming) {
                term.moveTo(renaming.cursor + 1, sel + 1);
                term.drawCursor();
            }
        };

        const removeKeyListener = term.onKey(keyListener);
        draw();
    });
};
