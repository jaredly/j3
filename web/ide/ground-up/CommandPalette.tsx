import { useEffect, useState } from 'react';
import * as React from 'react';
import { Action, NUIState, RegMap } from '../../custom/UIState';
import { Map, traverseMCST } from '../../../src/types/mcst';
import { Path } from '../../store';
import { findTops } from './findTops';
import { CombinedResults, Store } from '../../custom/store/Store';
import { useGetStore, useGlobalState } from '../../custom/store/StoreCtx';
import { replacePath } from '../../../src/state/replacePathWith';
import { newBlank } from '../../../src/state/newNodes';
import { Sendable } from '../../custom/worker/worker';
import { Cursor } from '../../../src/state/getKeyUpdate';
import { SearchResults } from './GroundUp';
import { ImmediateResults } from '../../custom/store/getImmediateResults';
import { collectPaths, pathForIdx } from './pathForIdx';
import { extractToToplevel } from './extractToToplevel';
import { ProduceItem } from './FullEvalator';
import { RenderStatic } from '../../custom/RenderStatic';
import { compareScores, fuzzyScore } from '../../../src/to-ast/fuzzy';
import { filterNulls } from '../../custom/old-stuff/filterNulls';
import { stringText } from '../../../src/types/cst';

export const CommandPalette = ({
    setSearchResults,
}: {
    setSearchResults: (s: SearchResults) => void;
}) => {
    const store = useGetStore();
    const { state } = useGlobalState(store);

    const [open, setOpen] = useState(false);
    const ref = React.useRef<HTMLInputElement>(null);

    const [focus, setFocus] = useState<SuperCommand | InputCommand | null>(
        null,
    );
    const [text, setText] = useState('');
    const [sel, setSel] = useState(0);

    useEffect(() => {
        const fn = (evt: KeyboardEvent) => {
            if ((evt.metaKey || evt.ctrlKey) && evt.key === 'p') {
                evt.preventDefault();
                evt.stopPropagation();
                if (evt.shiftKey) {
                    setOpen(true);
                } else {
                    setOpen(true);
                    setFocus(getJumpToResult(store));
                    // and setFocus
                }
            }
        };
        document.addEventListener('keydown', fn);
        return () => document.removeEventListener('keydown', fn);
    }, []);

    useEffect(() => {
        if (!open) {
            setSel(0);
            setText('');
            setFocus(null);
        }
        if (open) {
            ref.current?.focus();
        }
    }, [open]);

    const commands = React.useMemo(
        () =>
            focus?.type === 'super'
                ? focus.children
                : open
                ? getCommands(store, state, store.dispatch, setSearchResults)
                : [],
        [open, state, focus],
    );

    const filtered = React.useMemo(() => {
        if (!text.trim) return commands;
        const needle = text.toLowerCase();
        return commands
            .map((cmd) => {
                const score = fuzzyScore(0, needle, cmd.title);
                if (!score.full) return null;
                return { cmd, score };
                // return cmd.title.toLowerCase().includes(needle);
            })
            .filter(filterNulls)
            .sort((a, b) => compareScores(a.score, b.score))
            .map((m) => m.cmd);
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
                    maxHeight: 'calc(100vh - 256px)',
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
                    placeholder={focus?.title ?? 'Search for commands'}
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
                                    evt.preventDefault();
                                    evt.stopPropagation();
                                    focus.action(text);
                                    setOpen(false);
                                    return;
                                }
                                return;
                            }
                            const selected = filtered[sel];
                            if (!selected) return;
                            if (selected.type === 'plain') {
                                evt.preventDefault();
                                evt.stopPropagation();
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
{focus ? <button onMouseDown={evt => {evt.stopPropagation();evt.preventDefault()}} onClick={(evt) => {evt.preventDefault(); evt.stopPropagation(); setFocus(null)}}>Back</button> : null}
                <div
                    style={{
                        overflow: 'auto',
                        flex: 1,
                        minHeight: 0,
                        display: 'flex',
                        flexDirection: 'column',
                    }}
                >
                    {focus?.type === 'input'
                        ? focus.detail(text)
                        : filtered.map((cmd, i) => (
                              <button
                                  key={i}
                                  style={{
                                      padding: '12px 24px',
                                      background: sel === i ? '#333' : 'none',
                                      border: 'none',
                                      cursor: 'pointer',
                                      color: 'inherit',
                                      display: 'flex',
                                      flexDirection: 'column',
                                      alignItems: 'center',
                                      fontFamily: 'Jet Brains',
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
                                  <div
                                      style={{
                                          fontSize: '150%',
                                          marginBottom: 8,
                                          ...(cmd.type === 'plain'
                                              ? cmd.style
                                              : {}),
                                      }}
                                  >
                                      {cmd.title}
                                  </div>
                                  {cmd.type === 'plain' && cmd.subtitle && (
                                      <div
                                          style={{
                                              backgroundColor: 'black',
                                              padding: 8,
                                              borderRadius: 4,
                                          }}
                                      >
                                          {cmd.subtitle}
                                      </div>
                                  )}
                              </button>
                          ))}
                </div>
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
          style?: React.CSSProperties;
          subtitle?: string | React.ReactNode;
          action(): void;
      }
    | InputCommand
    | SuperCommand
    | {
          type: 'info';
          title: string;
      };

const getCommands = (
    store: Store,
    state: NUIState,
    dispatch: React.Dispatch<Action>,
    setSearchResults: (r: SearchResults) => void,
) => {
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

        if (node?.type === 'stringText') {
            if (node.text.includes('\\n')) {
                commands.push({
                    type: 'plain',
                    title: '\\n -> newline',
                    action() {
                        dispatch({
                            type: 'update',
                            map: {
                                [node.loc]: {
                                    ...node,
                                    text: node.text.replace(/\\n/g, '\n'),
                                },
                            },
                            selection: sel
                                .slice(0, -1)
                                .concat([
                                    { type: 'subtext', at: 0, idx: node.loc },
                                ]),
                        });
                    },
                });
            }
        }

        const ev = store.getEvaluator();
        if (ev) {
            commands.push({
                type: 'input',
                title: 'Extract to toplevel',
                action(input) {
                    extractToToplevel(store, ev, input, dispatch);
                },
                detail(input) {
                    return `(defn ${input} ...)`;
                },
                validate(input) {
                    return (
                        input.trim().length > 0 && !input.trim().includes(' ')
                    );
                },
            });

            commands.push(getJumpToResult(store));
        }

        const next = findNextError(store, state, sel);
        if (next != null) {
            const path = pathForIdx(next, state);
            if (path) {
                commands.push({
                    type: 'plain',
                    title: 'Jump to next error',
                    action() {
                        dispatch({
                            type: 'select',
                            at: [{ start: path }],
                        });
                    },
                });
            }
        }
    }

    commands.push({
        type: 'plain',
        title: `Search...`,
        action() {
            setSearchResults({ term: { type: 'free', text: '' }, results: [] });
        },
    });

    if (state.highlight?.length) {
        const node = state.map[state.highlight[0]];
        const name = node?.type === 'identifier' ? node.text : '??';

        commands.push({
            type: 'plain',
            title: `Rename ${state.highlight.length} instances of ${name}`,
            action() {
                const pathFor = collectPaths(state);
                dispatch({
                    type: 'select',
                    at: state
                        .highlight!.map((idx): Cursor | null => {
                            const paths = pathFor(idx);
                            if (!paths.length) return null;
                            const path = paths[0];
                            // throw new Error(`no path for ${idx}`);
                            return {
                                start: [...paths[0], { type: 'start', idx }],
                                end: [...paths[0], { type: 'end', idx }],
                            };
                        })
                        .filter(filterNulls),
                });
            },
        });

        commands.push({
            type: 'plain',
            title: `Show ${state.highlight.length} instances of ${name}`,
            action() {
                const pathFor = collectPaths(state);
                setSearchResults({
                    term: { type: 'references', name },
                    results: state
                        .highlight!.map((idx) => {
                            const path = pathFor(idx);
                            if (!path.length) {
                                return;
                            }
                            // throw new Error(
                            //     `cant get path for highlight ${idx}`,
                            // );
                            return { path: path[0], idx };
                        })
                        .filter(filterNulls),
                });
            },
        });
    }

    if (sel) {
        const idx = sel[sel.length - 1].idx;
        const node = state.map[idx];
        commands.push({
            type: 'plain',
            title: 'Set to "raw javascript code"',
            action() {
                dispatch({
                    type: 'update',
                    map: {
                        [idx]: {
                            type: 'raw-code',
                            lang: 'javascript',
                            raw:
                                node.type === 'identifier'
                                    ? node.text
                                    : node.type === 'string'
                                    ? (state.map[node.first] as stringText).text
                                    : '// some code',
                            loc: idx,
                        },
                    },
                    selection: sel
                        .slice(0, -1)
                        .concat([{ type: 'rich-text', idx, sel: null }]),
                });
            },
        });

        if (state.trackChanges?.previous[idx] !== undefined) {
            const toClear = [idx];
            traverseMCST(idx, state.map, (id) => {
                if (state.trackChanges!.previous[id] !== undefined) {
                    toClear.push(id);
                }
            });
            commands.push({
                type: 'plain',
                title: 'Clear trackChanges for this node & all children',
                action() {
                    dispatch({
                        type: 'clear-changes',
                        ids: toClear,
                    });
                },
            });
        }
    }

    return commands;
};

const resultError = (res: Sendable, top: number): number | null => {
    if (!res) return null;
    const eidx = Object.keys(res.errors);
    if (eidx.length) {
        return +eidx[0];
    }
    for (let p of res.produce) {
        if (typeof p === 'string') continue;
        if (p.type === 'eval' || p.type === 'error' || p.type === 'withjs') {
            return top;
        }
    }
    return null;
};

const findNextError = (store: Store, state: NUIState, sel: Path[]) => {
    const ns = sel.find((p) => p.type === 'ns-top');
    if (!ns) return null;
    const results = store.getResults().workerResults.nodes;
    const got = resultError(results[ns.idx], state.nsMap[ns.idx].top);
    if (got != null) return got;
    const tops = findTops(state);
    const at = tops.findIndex((t) => t.ns.id === ns.idx);
    if (at === -1) {
        console.warn(`current ns not in tops??`, tops, ns);
        return null;
    }
    for (let i = at + 1; i < tops.length; i++) {
        const err = resultError(results[tops[i].ns.id], tops[i].top);
        if (err != null) {
            return err;
        }
    }
    return null;
};

const findType = (
    results: ImmediateResults<any>,
    name: string,
    loc: number,
) => {
    results.jumpToName;
};

function getJumpToResult(store: Store): SuperCommand {
    const items: Command[] = [];

    const state = store.getState();
    const tops = findTops(state);
    const results = store.getResults();

    const pathFor = collectPaths(state);

    tops.forEach((top) => {
        const node = results.results.nodes[top.ns.id];
        if (node?.parsed?.type === 'success') {
            const res = results.workerResults.nodes[top.ns.id]?.produce?.filter(
                (p) => typeof p !== 'string' && p.type === 'type',
            ) as Extract<ProduceItem, { type: 'type' }>[];
            node.parsed.allNames?.global.declarations.forEach((name) => {
                const t =
                    name.kind === 'value'
                        ? res?.find((prod) => prod.name === name.name)
                        : undefined;
                items.push({
                    type: 'plain',
                    title: name.name,
                    style:
                        name.kind === 'type'
                            ? {
                                  color: 'rgb(45, 149, 100)',
                                  fontStyle: 'italic',
                              }
                            : undefined,
                    subtitle: t?.cst ? (
                        <RenderStatic node={t.cst} />
                    ) : undefined,
                    action() {
                        const paths = pathFor(name.loc);
                        if (paths.length) {
                            store.dispatch({
                                type: 'select',
                                at: [{ start: paths[0] }],
                            });
                        }
                    },
                });
            });
        }
    });

    return {
        type: 'super',
        title: 'Jump to...',
        children: items,
    };
}
