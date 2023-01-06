import * as React from 'react';
import { Map, MNodeContents, toMCST } from '../src/types/mcst';
import { Path, setSelection, Store, updateStore } from './store';
import { Events } from './Nodes';
import { parse } from '../src/grammar';

export const IdentifierLike = ({
    type,
    text,
    store,
    idx,
}: {
    type: MNodeContents['type'];
    text: string;
    idx: number;
    store: Store;
    path: Path[];
    events: Events;
}) => {
    const editing = store.selection?.idx === idx;
    let [edit, setEdit] = React.useState(null as null | string);

    // React.useEffect(() => {
    //     const current =
    // }, [edit])

    edit = edit == null ? text : edit;

    React.useLayoutEffect(() => {
        if (editing) {
            ref.current!.textContent = text;
        }
    }, [editing, text]);

    const ref = React.useRef(null as null | HTMLSpanElement);
    if (!editing) {
        return (
            <span
                className="hover"
                style={{
                    color: colors[type],
                    // color: pathColor(
                    //     path.concat([{ idx, cid: 0, punct: 0 }]),
                    //     store,
                    // ),
                    minHeight: '1.5em',
                    // backgroundColor: 'rgba(255, 255, 0, 0.05)',
                }}
                onMouseDown={(evt) => {
                    setEdit(text);
                    setSelection(store, { idx });
                }}
            >
                {text}
            </span>
        );
    }
    return (
        <span
            data-idx={idx}
            contentEditable
            ref={ref}
            className="hover"
            onInput={(evt) => {
                const text = evt.currentTarget.textContent!;
                setEdit(text);
                try {
                    const parsed = parse(text);
                    if (parsed.length === 1) {
                        const nw = {
                            ...parsed[0],
                            loc: { ...parsed[0].loc, idx },
                        };
                        const mp: Map = {};
                        toMCST(nw, mp);
                        updateStore(store, { map: mp });
                    } else {
                        // TODO remove it
                        // and like update the parent pls
                    }
                } catch (err) {
                    console.warn(err);
                }
            }}
            onBlur={() => {
                setEdit(null);
                setSelection(store, null);
            }}
            style={{
                color: colors[type],
                outline: 'none',
                minHeight: '1.5em',
            }}
            onKeyDown={(evt) => {
                if (evt.key === 'Enter') {
                    evt.preventDefault();
                    // commit();
                    return;
                }
                // if (keyHandlers[evt.key]) {
                //     const res = handleKey(
                //         store,
                //         path.concat([{ idx, cid: 0, punct: 0 }]),
                //         evt.key,
                //         evt.currentTarget.textContent!,
                //     );
                //     if (res !== false) {
                //         evt.preventDefault();
                //         evt.stopPropagation();
                //     }
                //     return;
                // }
                // if (
                //     evt.key === 'ArrowRight' &&
                //     getSelection()?.toString() === '' &&
                //     getPos(evt.currentTarget) ===
                //         evt.currentTarget.textContent!.length
                // ) {
                //     evt.preventDefault();
                //     evt.stopPropagation();
                //     const right = goRight(store, path);
                //     // console.log(`going right`, right);
                //     if (right) {
                //         setSelection(store, right.sel);
                //     }
                // }
                // if (
                //     evt.key === 'ArrowLeft' &&
                //     getSelection()?.toString() === '' &&
                //     getPos(evt.currentTarget) === 0
                // ) {
                //     evt.preventDefault();
                //     evt.stopPropagation();
                //     const left = goLeft(store, path);
                //     // console.log(`going left`, left);
                //     if (left) {
                //         setSelection(store, left.sel);
                //     }
                // }
            }}
        />
    );
};

export const colors: {
    [key in MNodeContents['type']]: string;
} = {
    identifier: '#5bb6b7',
    tag: '#82f682',
    number: '#4848a5',
    // lol
    ...({} as any),
};
