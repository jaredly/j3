import { useState } from 'react';
import { XML } from '../../syntaxes/xml';
import React from 'react';
import { NodeSelection, SelectionStatuses, Top } from '../utils';
import { allPaths, Src } from '../handleShiftNav';
import { Loc } from '../../shared/cnodes';

type Path = (string | number)[];
type State = { pinned: Path[]; expanded: Path[]; extra: number };

// key type: path + tag
const peq = (one: Path, two: Path) => one.length === two.length && one.every((n, i) => n === two[i]);
const pstartsWith = (one: Path, prefix: Path, maxDepth: number) =>
    one.length >= prefix.length && one.length <= maxDepth + prefix.length && prefix.every((p, i) => p === one[i]);

const chop = (t: string, max: number) => (t.length > max ? t.slice(0, max - 3) + '...' : t);

const attrs = (v: Record<string, any>) => {
    return Object.keys(v)
        .filter((k) => v[k] !== undefined)
        .map((k) => `${k}=${chop(JSON.stringify(v[k]), 20)}`)
        .join(' ');
};

const tagStyle = {
    cursor: 'pointer',
    //
    // backgroundColor: 'rgb(200,200,255)',
    color: 'rgb(50, 50, 200)',
    borderRadius: 4,
    width: 'fit-content',
};

const isSelected = (src: Src, statuses: SelectionStatuses) => {
    const lno = src.left[0]?.idx;
    const rno = src.right?.[0]?.idx;
    return Object.keys(statuses).some((key) => {
        return key.endsWith(';' + lno) || key.endsWith(',' + lno) || key.endsWith(';' + rno) || key.endsWith(',' + rno);
    });
    // if (statuses[src.left[0]?.idx]) return true;
    // if (statuses[src.right?.[0]?.idx!]) return true;
};

export const XMLNode = ({
    sel,
    parentSelected,
    node,
    state,
    path,
    toggle,
    setHover,
    onClick,
    statuses,
}: {
    setHover: (hover: null | Src) => void;
    onClick: (src: null | Src) => void;
    parentSelected?: boolean | null;
    sel: number[];
    node: XML;
    state: State;
    path: Path;
    toggle: (p: Path) => void;
    statuses: SelectionStatuses;
}) => {
    const open = state.expanded.some((p) => pstartsWith(path, p, state.extra)) || state.pinned.some((p) => peq(p, path));
    const exact = state.expanded.some((p) => peq(p, path));

    const selected = node.src && isSelected(node.src, statuses);
    // parentSelected ||
    // (node.src && sel.includes(node.src.left[0]?.idx) && (!node.src.right || sel.includes(node.src.right[0]?.idx)));

    const style = { ...tagStyle, background: 'transparent' };
    if (selected) {
        style.background = 'rgb(200,230,255)';
    }

    if (!open) {
        const pc = state.pinned.filter((p) => pstartsWith(p, path, Infinity));
        if (pc.length) {
            // TODO: TODO
            // return <>
            // </>
        }
        return (
            <div
                onClick={() => onClick(node.src)}
                style={{ display: 'flex', ...style }}
                onMouseOver={() => setHover(node.src)}
                onMouseOut={() => setHover(null)}
            >
                <div style={{ width: 10 }} onClick={() => toggle(path)}>
                    -
                </div>
                <div>
                    &lt;{node.tag}
                    {node.attrs ? ' ' + attrs(node.attrs) : ''}
                    {node.children ? ' ...' : ' /'}&gt;
                </div>
            </div>
        );
    }

    if (!node.children) {
        return (
            <div
                onClick={() => onClick(node.src)}
                style={{ display: 'flex', ...style }}
                onMouseOver={() => setHover(node.src)}
                onMouseOut={() => setHover(null)}
            >
                <div style={{ width: 10 }} onClick={() => toggle(path)}>
                    {exact ? '•' : ''}
                </div>
                <div>
                    &lt;{node.tag}
                    {node.attrs ? ' ' + attrs(node.attrs) : ''} /&gt;
                </div>
            </div>
        );
    }

    return (
        <div>
            <div
                style={{ display: 'flex', ...style }}
                onMouseOver={() => setHover(node.src)}
                onMouseOut={() => setHover(null)}
                onClick={() => onClick(node.src)}
            >
                <div style={{ width: 10 }} onClick={() => toggle(path)}>
                    {exact ? '•' : ''}
                </div>
                &lt;{node.tag}
                {/* {node.src?.left[0].idx}-{node.src?.right?.[0].idx} */}
                {node.attrs ? ' ' + attrs(node.attrs) : ''}&gt;
            </div>
            <div style={{ paddingLeft: 24, display: 'grid', gridTemplateColumns: 'max-content 1fr', gap: 8 }}>
                {node.children
                    ? Object.entries(node.children).map(([key, value]) =>
                          value === undefined ? null : (
                              <React.Fragment key={key}>
                                  {key !== 'children' ? (
                                      <div style={{ gridColumn: 1, fontWeight: 'bold' }}>
                                          {key}
                                          {Array.isArray(value) ? `[${value.length}]` : ''}
                                      </div>
                                  ) : null}
                                  <div style={key === 'children' ? { gridColumnStart: 1, gridColumnEnd: 3 } : { gridColumn: 2 }}>
                                      {Array.isArray(value) ? (
                                          value.map((item, i) => (
                                              <XMLNode
                                                  key={i}
                                                  parentSelected={selected}
                                                  onClick={onClick}
                                                  statuses={statuses}
                                                  sel={sel}
                                                  setHover={setHover}
                                                  node={item}
                                                  state={state}
                                                  path={path.concat([key, i])}
                                                  toggle={toggle}
                                              />
                                          ))
                                      ) : (
                                          <XMLNode
                                              node={value}
                                              sel={sel}
                                              onClick={onClick}
                                              statuses={statuses}
                                              parentSelected={selected}
                                              setHover={setHover}
                                              state={state}
                                              path={path.concat([key])}
                                              toggle={toggle}
                                          />
                                      )}
                                  </div>
                              </React.Fragment>
                          ),
                      )
                    : null}
            </div>
            <div style={{ paddingLeft: 10, ...style }} onMouseOver={() => setHover(node.src)} onMouseOut={() => setHover(null)}>
                &lt;/{node.tag}&gt;
            </div>
        </div>
    );
};

export const ShowXML = ({
    root,
    setHover,
    sel,
    onClick,
    statuses,
}: {
    root: XML;
    setHover: (hover: null | Src) => void;
    sel: number[];
    onClick: (src: null | Src) => void;
    statuses: SelectionStatuses;
}) => {
    const [state, setState] = useState<State>({ pinned: [], expanded: [[]], extra: Infinity });

    // console.log('sell', sel);

    return (
        <XMLNode
            sel={sel}
            node={root}
            state={state}
            setHover={setHover}
            onClick={onClick}
            statuses={statuses}
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
