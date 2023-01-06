import * as React from 'react';
import { MNodeContents } from '../src/types/mcst';
import { IdentifierLike } from './IdentifierLike';
import { Path, Store, useStore } from './store';

// ListLike
// array, list, record
// ^ there will be some rulios about
//   when to do newlines, that will be a little custom
//   lists need to know the nature of the first item
//   and arrays, when the second item of a dealio, will as well

export type Events = {
    onRight: () => void;
    onLeft: () => void;
    // other things? idk
};

export const idText = (node: MNodeContents) => {
    switch (node.type) {
        case 'identifier':
            return node.text;
        case 'number':
            return node.raw;
        case 'tag':
            return '`' + node.text;
    }
};

const arrayItems = (
    node: MNodeContents,
): [string, string, number[]] | undefined => {
    switch (node.type) {
        case 'array':
            return ['[', ']', node.values];
        case 'list':
            return ['(', ')', node.values];
        case 'record':
            return ['{', '}', node.items];
    }
};

// IdentifierLike (atom?)
// identifier, tag, number?, comment prolly
export const Node = ({
    idx,
    store,
    path,
}: {
    idx: number;
    store: Store;
    path: Path[];
}) => {
    const item = useStore(store, idx);
    const text = idText(item.contents);

    const decs = Object.entries(item.decorators);

    if (text) {
        return (
            <>
                <IdentifierLike
                    text={text}
                    type={item.contents.type}
                    store={store}
                    idx={idx}
                    path={path}
                    events={{
                        onLeft() {},
                        onRight() {},
                    }}
                />
                {decs.map(([key, args]) =>
                    key === 'type' ? (
                        <span key={key} style={{ marginLeft: 8 }}>
                            :
                            {args.length === 1 ? (
                                <Node
                                    idx={args[0]}
                                    store={store}
                                    path={path.concat([
                                        {
                                            idx,
                                            child: {
                                                type: 'decorator',
                                                key,
                                                at: 1,
                                            },
                                        },
                                    ])}
                                />
                            ) : (
                                <>
                                    (
                                    {args.map((arg, i) => (
                                        <span
                                            key={arg}
                                            style={{ marginLeft: 8 }}
                                        >
                                            <Node
                                                idx={arg}
                                                store={store}
                                                path={path.concat([
                                                    {
                                                        idx,
                                                        child: {
                                                            type: 'decorator',
                                                            key,
                                                            at: 1 + i,
                                                        },
                                                    },
                                                ])}
                                            />
                                        </span>
                                    ))}
                                    )
                                </>
                            )}
                        </span>
                    ) : (
                        <span key={key} style={{ marginLeft: 8 }}>
                            @({key}
                            {args.map((arg, i) => (
                                <span key={arg} style={{ marginLeft: 8 }}>
                                    <Node
                                        idx={arg}
                                        store={store}
                                        path={path.concat([
                                            {
                                                idx,
                                                child: {
                                                    type: 'decorator',
                                                    key,
                                                    at: 1 + i,
                                                },
                                            },
                                        ])}
                                    />
                                </span>
                            ))}
                            )
                        </span>
                    ),
                )}
            </>
        );
    }

    const arr = arrayItems(item.contents);

    if (arr) {
        const [left, right, children] = arr;
        return (
            <span className="hover">
                {left}
                {children.map((cidx, i) => (
                    <span
                        key={cidx}
                        style={i !== 0 ? { marginLeft: 8 } : undefined}
                    >
                        <Node
                            idx={cidx}
                            path={path.concat({
                                idx,
                                child: {
                                    type: 'child',
                                    at: i,
                                },
                            })}
                            store={store}
                        />
                    </span>
                ))}
                {right}
            </span>
        );
    }
    return <span>{JSON.stringify(item.contents)}</span>;
};

// Spread is weird, let's wait to support it?
// String is special too

// How far can we get with ListLike and IdentifierLike?

// Also, let's go ahead and just register selection points in the node.
// like, when you're selected, you're the one handling the key stroke.

// export const Apply = ({
//     idx,
//     store,
//     path,
// }: {
//     idx: number;
//     store: Store;
//     path: Path[];
// }): JSX.Element => {
//     let cid = 0;
//     let punct = 0;
//     const item = useStore(store, idx) as t.Apply;
//     return (
//         <span style={selectionStyle(store.selection, path, idx)}>
//             <Applyable
//                 idx={item.target}
//                 store={store}
//                 path={path.concat([{ cid: cid++, idx, punct }])}
//             />
//             {item.suffixes.map((suffix, i) => (
//                 <React.Fragment key={i}>
//                     <Suffix
//                         idx={suffix}
//                         store={store}
//                         path={path.concat([{ cid: cid++, idx, punct }])}
//                     />
//                 </React.Fragment>
//             ))}
//         </span>
//     );
// };
