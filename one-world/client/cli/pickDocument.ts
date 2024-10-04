import { toABlock } from '../../shared/IR/block-to-attributed-text';
import { getDoc } from '../../shared/state2';
import { Store } from '../StoreContext2';
import { termColors } from '../TextEdit/colors';
import { Renderer } from './drawToTerminal';

export const pickDocument = (
    documents: { id: string; title: string }[],
    term: Renderer,
    previewDoc: (id: string) => void,
): Promise<{ id: string | null; title: string }> => {
    return new Promise<{ id: string | null; title: string }>(
        (resolve, reject) => {
            let sel = 0;
            let renaming = null as null | { text: string; cursor: number };

            const draw = () => {
                console.log('darw pick doc');
                term.clear();
                for (let i = 0; i <= documents.length; i++) {
                    term.moveTo(1, i + 1);
                    if (i === documents.length) {
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
                        if (renaming) {
                            term.write(
                                toABlock(renaming.text, {
                                    background: { r: 0, g: 0, b: 255 },
                                }),
                            );
                        } else {
                            term.write(
                                toABlock(
                                    documents[i].title +
                                        ' (' +
                                        documents[i].id.slice(0, 5) +
                                        ')',
                                    {
                                        background: { r: 0, g: 100, b: 0 },
                                    },
                                ),
                            );
                        }
                    } else {
                        term.write(
                            toABlock(
                                documents[i].title +
                                    ' (' +
                                    documents[i].id.slice(0, 5) +
                                    ')',
                            ),
                        );
                    }
                }
                const id = documents[sel];
                if (id) {
                    previewDoc(documents[sel].id);
                }
            };

            const cleanup: (() => void)[] = [];

            // cleanup.push(
            //     store.on('all', () => {
            //         state = store.getState();
            //         draw();
            //     }),
            // );

            const keyListener = (key: string) => {
                if (renaming) {
                    if (key === 'ENTER') {
                        // store.update({
                        //     type: 'doc',
                        //     action: {
                        //         type: 'update',
                        //         update: { title: renaming.text },
                        //     },
                        //     id: documents[sel],
                        // });
                        documents[sel].title = renaming.text;
                        // TODO: persist lol
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
                    term.drawCursor(termColors.cursor, false);
                    return;
                }
                if (key === 'ENTER') {
                    cleanup.forEach((f) => f());
                    if (sel === documents.length) {
                        resolve({ id: null, title: 'New Doc lol' });
                    } else {
                        resolve(documents[sel]);
                    }
                    return;
                }
                if (key === 'DOWN') {
                    sel = Math.min(sel + 1, documents.length);
                    renaming = null;
                }
                if (key === 'UP') {
                    sel = Math.max(0, sel - 1);
                    renaming = null;
                }
                if (key === 'ESCAPE') {
                    cleanup.forEach((f) => f());
                    reject('quit');
                }
                if (key === 'r') {
                    // const title = getDoc(state, documents[sel]).title;
                    // renaming = { text: title, cursor: title.length };
                }
                draw();
                // if (renaming) {
                //     term.moveTo(renaming.cursor + 1, sel + 1);
                //     term.drawCursor(termColors.cursor, false);
                // }
            };

            cleanup.push(term.onKey(keyListener));
            draw();
        },
    );
};
