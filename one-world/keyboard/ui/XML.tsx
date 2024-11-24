import { useState } from 'react';
import { XML } from '../../syntaxes/gleam2';
import React from 'react';

type Path = (string | number)[];
type State = { pinned: Path[]; expanded: Path[]; extra: number };

// key type: path + tag
const peq = (one: Path, two: Path) => one.length === two.length && one.every((n, i) => n === two[i]);
const pstartsWith = (one: Path, prefix: Path, maxDepth: number) =>
    one.length >= prefix.length && one.length <= maxDepth + prefix.length && prefix.every((p, i) => p === one[i]);

const chop = (t: string, max: number) => (t.length > max ? t.slice(0, max - 3) + '...' : t);

const attrs = (v: Record<string, any>) => {
    return Object.keys(v)
        .map((k) => `${k}=${chop(JSON.stringify(v[k]), 10)}`)
        .join(' ');
};

export const XMLNode = ({ node, state, path, toggle }: { node: XML; state: State; path: Path; toggle: (p: Path) => void }) => {
    const open = state.expanded.some((p) => pstartsWith(path, p, state.extra)) || state.pinned.some((p) => peq(p, path));
    if (!open) {
        const pc = state.pinned.filter((p) => pstartsWith(p, path, Infinity));
        if (pc.length) {
            // TODO: TODO
            // return <>
            // </>
        }
        return (
            <div onClick={() => toggle(path)}>
                <div>
                    &lt;{node.tag}
                    {node.attrs ? ' ' + attrs(node.attrs) : ''}
                    {node.children ? ' ...' : ''}&gt;
                </div>
            </div>
        );
    }
    if (!node.children) {
        return (
            <div onClick={() => toggle(path)}>
                &lt;{node.tag}
                {node.attrs ? ' ' + attrs(node.attrs) : ''} /&gt;
            </div>
        );
    }
    return (
        <div>
            <div onClick={() => toggle(path)}>
                &lt;{node.tag}
                {node.attrs ? ' ' + attrs(node.attrs) : ''}&gt;
            </div>
            <div style={{ paddingLeft: 8, display: 'grid', gridTemplateColumns: 'min-content 1fr', gap: 8 }}>
                {/* {node.attrs ? <div style={{ gridColumnStart: 1, gridColumnEnd: 2 }}>{JSON.stringify(node.attrs)}</div> : null} */}
                {node.children
                    ? Object.entries(node.children).map(([key, value]) => (
                          <React.Fragment key={key}>
                              <div style={{ gridColumn: 1 }}>{key}</div>
                              <div style={{ gridColumn: 2 }}>
                                  {Array.isArray(value) ? (
                                      value.map((item, i) => (
                                          <XMLNode key={i} node={item} state={state} path={path.concat([key, i])} toggle={toggle} />
                                      ))
                                  ) : (
                                      <XMLNode node={value} state={state} path={path.concat([key])} toggle={toggle} />
                                  )}
                              </div>
                          </React.Fragment>
                      ))
                    : null}
            </div>
            <div>&lt;/{node.tag}&gt;</div>
        </div>
    );
};

export const ShowXML = ({ root }: { root: XML }) => {
    const [state, setState] = useState<State>({ pinned: [], expanded: [[]], extra: 2 });

    return (
        <XMLNode
            node={root}
            state={state}
            toggle={(p) =>
                setState((s) => {
                    return s.expanded.some((e) => peq(p, e))
                        ? { ...s, expanded: s.expanded.filter((e) => !peq(e, p)) }
                        : { ...s, expanded: s.expanded.concat([p]) };
                })
            }
            path={[]}
        />
    );
};
