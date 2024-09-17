// import termkit from 'terminal-kit';
import ansis from 'ansis';
import { Store } from '../StoreContext2';
import { Terminal } from './drawToTerminal';

export const pickDocument = (store: Store, term: Terminal) => {
    return new Promise<string | null>((resolve, reject) => {
        let state = store.getState();
        const ids = Object.keys(state.documents);
        let sel = 0;
        let renaming: null | { text: string; cursor: number } = null;

        const draw = () => {
            term.clear();
            for (let i = 0; i <= ids.length; i++) {
                term.moveTo(0, i + 1);
                if (i === ids.length) {
                    if (sel === i) {
                        term.write(ansis.bgGreen('New Document'));
                    } else {
                        term.write(ansis.blue('New Document'));
                    }
                } else if (sel === i) {
                    if (renaming) {
                        term.write(ansis.bgBlue(renaming.text));
                    } else {
                        term.write(
                            ansis.bgGreen(state.documents[ids[i]].title),
                        );
                    }
                } else {
                    term.write(state.documents[ids[i]].title);
                }
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
                const title = state.documents[ids[sel]].title;
                renaming = { text: title, cursor: title.length };
            }
            draw();
            if (renaming) {
                term.moveTo(renaming.cursor + 1, sel + 1);
            }
        };

        const removeKeyListener = term.onKey(keyListener);
        draw();
    });
};
