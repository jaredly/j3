import { useEffect, useState } from 'react';
import * as React from 'react';
import { Action, NUIState } from '../../custom/UIState';

export const CommandPalette = ({
    state,
    dispatch,
}: {
    state: NUIState;
    dispatch: React.Dispatch<Action>;
}) => {
    const [open, setOpen] = useState(false);
    const ref = React.useRef<HTMLInputElement>(null);

    useEffect(() => {
        const fn = (evt: KeyboardEvent) => {
            if (evt.metaKey && evt.shiftKey && evt.key === 'p') {
                setOpen(true);
            }
        };
        document.addEventListener('keydown', fn);
        return () => document.removeEventListener('keydown', fn);
    }, []);

    useEffect(() => {
        if (open) {
            ref.current?.focus();
        }
    }, [open]);

    const commands = React.useMemo(
        () => getCommands(state, dispatch),
        [open, state],
    );

    if (!open) return null;

    return (
        <div
            style={{
                position: 'fixed',
                inset: 0,
                backgroundColor: 'rgba(0,0,0,0.2)',
                display: 'flex',
                flexDirection: 'column',
            }}
            onClick={() => setOpen(false)}
        >
            <div
                style={{
                    margin: 128,
                    maxWidth: 800,
                    alignSelf: 'center',
                    padding: 24,
                    backgroundColor: '#222',
                    display: 'flex',
                    flexDirection: 'column',
                    flex: 1,
                }}
                onClick={(evt) => evt.stopPropagation()}
            >
                <input
                    ref={ref}
                    placeholder="Search for commands"
                    onBlur={() => setOpen(false)}
                    onKeyDown={(evt) => {
                        if (evt.key === 'Escape') {
                            setOpen(false);
                        }
                    }}
                    style={{
                        borderRadius: 8,
                        fontSize: 40,
                        padding: 8,
                        color: 'inherit',
                        border: '1px solid #ccc',
                        backgroundColor: 'transparent',
                    }}
                />
                {commands.map((cmd, i) => (
                    <button
                        key={i}
                        // onClick={() => cmd.action()}
                        style={{
                            padding: '24px 48px',
                            backgroundColor: 'none',
                        }}
                        onMouseDown={(evt) => {
                            evt.preventDefault();
                            cmd.action();
                        }}
                    >
                        {cmd.title}
                    </button>
                ))}
            </div>
        </div>
    );
};

const getCommands = (state: NUIState, dispatch: React.Dispatch<Action>) => {
    const commands: { title: string; action(): void }[] = [];

    const sel = state.at[0]?.start;
    if (sel) {
        const idx = sel[sel.length - 1].idx;
        const meta = state.meta[idx];

        if (meta?.trace) {
            commands.push({
                title: 'Remove Trace',
                action() {
                    dispatch({
                        type: 'meta',
                        meta: { [idx]: { ...meta, trace: undefined } },
                    });
                },
            });
        } else {
            commands.push({
                title: 'Trace',
                action() {
                    dispatch({
                        type: 'meta',
                        meta: { [idx]: { ...(meta ?? {}), trace: {} } },
                    });
                },
            });
        }

        if (meta?.traceTop) {
            commands.push({
                title: 'Turn off Trace Top',
                action() {
                    dispatch({
                        type: 'meta',
                        meta: { [idx]: { ...meta, traceTop: undefined } },
                    });
                },
            });
        } else {
            commands.push({
                title: 'Set Trace Top',
                action() {
                    dispatch({
                        type: 'meta',
                        meta: { [idx]: { ...(meta ?? {}), traceTop: {} } },
                    });
                },
            });
        }

        const node = state.map[idx];
        if (node?.type === 'identifier') {
            const num = +node.text;
            if (!isNaN(num) && num + '' === node.text && state.map[num]) {
                const got = state.regs[num]?.main ?? state.regs[num]?.outside;
                if (got) {
                    commands.push({
                        title: 'Jump to idx',
                        action() {
                            dispatch({
                                type: 'select',
                                at: [{ start: got.path }],
                            });
                        },
                    });
                } else {
                    commands.push({
                        title: 'Cannot jump to idx',
                        action() {
                            // dispatch({
                            //     type: 'select',
                            //     at: [{ start: got.path }],
                            // });
                        },
                    });
                }
            }
        }
    }

    return commands;
};
