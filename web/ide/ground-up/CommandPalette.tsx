import { useEffect, useState } from 'react';
import * as React from 'react';
import {
    Action,
    NUIState,
    RealizedNamespace,
    RegMap,
} from '../../custom/UIState';
import { selectStart } from '../../../src/state/navigate';
import { MNode, Map } from '../../../src/types/mcst';
import { Path } from '../../store';
import { childPath } from './findTops';

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
                const path = pathForIdx(num, state);
                if (path) {
                    commands.push({
                        title: 'Jump to idx',
                        action() {
                            dispatch({
                                type: 'select',
                                at: [{ start: path }],
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

export const nodeChildren = (node: MNode): number[] => {
    switch (node.type) {
        case 'list':
        case 'array':
        case 'record':
            return node.values;
        case 'spread':
        case 'comment-node':
            return [node.contents];
        case 'string':
            return [
                node.first,
                ...node.templates.flatMap((t) => [t.expr, t.suffix]),
            ];
    }
    return [];
};

export const pathForIdx = (
    num: number,
    {
        regs,
        map,
        cards,
        nsMap,
    }: Pick<NUIState, 'regs' | 'map' | 'cards' | 'nsMap'>,
) => {
    const got = regs[num]?.main ?? regs[num]?.outside;
    if (got) {
        return selectStart(num, got.path, map);
    }
    const parents: Record<number, number> = {};
    Object.keys(map).forEach((k) => {
        const node = map[+k];
        nodeChildren(node).forEach((child) => {
            parents[child] = node.loc;
        });
    });
    const nodeToNs: Record<number, number> = {};
    const nsParents: Record<number, number> = {};
    Object.keys(nsMap).forEach((k) => {
        const ns = nsMap[+k];
        if (ns.type === 'normal') {
            nodeToNs[ns.top] = ns.id;
            ns.children.forEach((child) => (nsParents[child] = ns.id));
        }
    });
    const nsToCard: Record<number, number> = {};
    cards.forEach((card, i) => {
        nsToCard[card.top] = i;
    });

    let iter = 0;

    const path: Path[] = [];
    let idx = num;
    let ns: number;
    while (true) {
        if (iter++ > 500) throw new Error('loop?');
        if (parents[idx] == null) {
            ns = nodeToNs[idx];
            if (ns == null) {
                console.error(`cant find ns for idx`, idx, nodeToNs);
                return;
            }
            path.unshift({ type: 'ns-top', idx: ns });
            break;
        }
        const parent = parents[idx];
        const cp = childPath(map[parent], idx);
        if (!cp) {
            console.error(`cant find child path`, map[parent], idx);
            return;
        }
        path.unshift({ ...cp, idx: parent });
        idx = parent;
    }

    while (true) {
        if (iter++ > 500) throw new Error('loop?');
        const parent = nsParents[ns];
        if (parent == null) {
            const card = nsToCard[ns];
            if (card == null) {
                console.error(`no card for ns`, ns, nsToCard);
                return;
            }
            path.unshift({ type: 'card', card, idx: -1 });
            return path;
        }

        path.unshift({
            type: 'ns',
            at: (nsMap[parent] as RealizedNamespace).children.indexOf(ns),
            idx: parent,
        });
        ns = parent;
    }
    // Ok now trace it all back
};
