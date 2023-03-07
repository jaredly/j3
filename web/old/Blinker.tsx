import * as React from 'react';
import { Map, toMCST } from '../../src/types/mcst';
import { EvalCtx, Path, Store, updateStore } from '../store';
import { Events } from './Nodes';
import { modChildren, onKeyDown } from '../mods/onKeyDown';
import { parse } from '../../src/grammar';

export const parseKey = (text: string) => {
    try {
        return parse(text)[0];
    } catch (e) {
        return null;
    }
};

export const Blinker = ({
    events,
    style,
    idx,
    path,
    store,
    ectx,
}: {
    events: Events;
    style?: React.CSSProperties;
    idx: number;
    path: Path[];
    store: Store;
    ectx: EvalCtx;
}) => {
    const ref = React.useRef<HTMLSpanElement>(null);

    React.useEffect(() => {
        ref.current!.focus();
    }, []);

    return (
        <span
            contentEditable
            ref={ref}
            style={{ ...style, width: 1, marginRight: -1 }}
            onKeyDown={(evt) => {
                onKeyDown(evt, idx, path, events, store, ectx);
                if (
                    !evt.defaultPrevented &&
                    fullAscii.includes(evt.key) &&
                    !evt.metaKey &&
                    !evt.altKey &&
                    !evt.ctrlKey
                ) {
                    const nw = parseKey(evt.key);
                    if (!nw) return;
                    const mp: Map = {};
                    const nidx = toMCST(nw, mp);

                    const parent = path[path.length - 1];
                    if (parent.child.type === 'inside') {
                        const pnode = store.map[parent.idx];
                        mp[parent.idx] = {
                            ...pnode,
                            ...modChildren(pnode, (items) => items.push(nidx)),
                        };
                        updateStore(store, {
                            map: mp,
                            selection: { idx: nidx, loc: 'end' },
                        });
                        evt.preventDefault();
                        return;
                    }

                    const gp = path[path.length - 2];
                    const child = gp.child;
                    if (child.type === 'child') {
                        const pnode = store.map[gp.idx];
                        mp[gp.idx] = {
                            ...pnode,
                            ...modChildren(pnode, (items) => {
                                items.splice(
                                    child.at +
                                        (parent.child.type === 'start' ? 0 : 1),
                                    0,
                                    nidx,
                                );
                            }),
                        };
                        updateStore(store, {
                            map: mp,
                            selection: { idx: nidx, loc: 'end' },
                        });
                        evt.preventDefault();
                    }
                }
            }}
        />
    );
};
const fullAscii =
    ' !"#$%&\'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~';