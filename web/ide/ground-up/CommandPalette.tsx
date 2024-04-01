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
import { useGetStore, useGlobalState } from '../../custom/store/Store';

export const CommandPalette = () => {
    const store = useGetStore();
    const { state, results } = useGlobalState(store);

    const [open, setOpen] = useState(false);
    const ref = React.useRef<HTMLInputElement>(null);

    const [focus, setFocus] = useState<SuperCommand | InputCommand | null>(
        null,
    );
    const [text, setText] = useState('');
    const [sel, setSel] = useState(0);

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
            setSel(0);
            setText('');
            setFocus(null);
        }
    }, [open]);

    const commands = React.useMemo(
        () =>
            focus?.type === 'super'
                ? focus.children
                : getCommands(state, store.dispatch),
        [open, state, focus],
    );

    const filtered = React.useMemo(() => {
        const needle = text.toLowerCase();
        return commands.filter((cmd) => {
            return cmd.title.toLowerCase().includes(needle);
        });
    }, [text, commands]);

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
                    value={text}
                    onChange={(evt) => {
                        setText(evt.target.value);
                        setSel(0);
                    }}
                    placeholder="Search for commands"
                    onBlur={() => setOpen(false)}
                    onKeyDown={(evt) => {
                        if (evt.key === 'Escape') {
                            setOpen(false);
                        }
                        if (evt.key === 'ArrowUp') {
                            setSel(sel <= 0 ? filtered.length - 1 : sel - 1);
                        }
                        if (evt.key === 'ArrowDown') {
                            setSel(sel >= filtered.length - 1 ? 0 : sel + 1);
                        }
                        if (evt.key === 'Enter' || evt.key === 'Return') {
                            if (focus?.type === 'input') {
                                if (!focus.validate || focus.validate(text)) {
                                    focus.action(text);
                                    setOpen(false);
                                    return;
                                }
                                return;
                            }
                            const selected = filtered[sel];
                            if (!selected) return;
                            if (selected.type === 'plain') {
                                selected.action();
                                setOpen(false);
                            } else if (
                                selected.type === 'super' ||
                                selected.type === 'input'
                            ) {
                                setText('');
                                setFocus(selected);
                            }
                        }
                    }}
                    style={{
                        borderRadius: 8,
                        fontSize: 40,
                        padding: 8,
                        color: 'inherit',
                        border: '1px solid #ccc',
                        background: 'none',
                    }}
                />
                {focus?.type === 'input'
                    ? focus.detail(text)
                    : filtered.map((cmd, i) => (
                          <button
                              key={i}
                              style={{
                                  padding: '24px 48px',
                                  background: sel === i ? '#333' : 'none',
                                  border: 'none',
                                  cursor: 'pointer',
                                  color: 'inherit',
                              }}
                              onMouseEnter={() => setSel(i)}
                              onMouseDown={(evt) => {
                                  evt.preventDefault();
                                  if (cmd.type === 'plain') {
                                      cmd.action();
                                      setOpen(false);
                                  } else if (
                                      cmd.type === 'input' ||
                                      cmd.type === 'super'
                                  ) {
                                      setFocus(cmd);
                                      setText('');
                                  }
                              }}
                          >
                              {cmd.title}
                          </button>
                      ))}
            </div>
        </div>
    );
};

type InputCommand = {
    type: 'input';
    title: string;
    detail(input: string): string;
    action(input: string): void;
    validate?(input: string): boolean;
};

type SuperCommand = {
    type: 'super';
    title: string;
    children: Command[];
};

type Command =
    | {
          type: 'plain';
          title: string;
          action(): void;
      }
    | InputCommand
    | SuperCommand
    | {
          type: 'info';
          title: string;
      };

const getCommands = (state: NUIState, dispatch: React.Dispatch<Action>) => {
    const commands: Command[] = [];

    const sel = state.at[0]?.start;
    if (sel) {
        const idx = sel[sel.length - 1].idx;
        const meta = state.meta[idx];

        if (meta?.trace) {
            commands.push({
                type: 'plain',
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
                type: 'plain',
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
                type: 'plain',
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
                type: 'plain',
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
                        type: 'plain',
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
                        type: 'info',
                        title: 'Cannot jump to idx',
                    });
                }
            }
        }

        commands.push({
            type: 'input',
            title: 'Extract to toplevel',
            action(input) {
                // TODO
            },
            detail(input) {
                return `(defn ${input} ...)`;
            },
            validate(input) {
                return input.trim().length > 0 && !input.trim().includes(' ');
            },
        });
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
