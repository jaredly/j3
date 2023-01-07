import * as React from 'react';
import { MNodeContents } from '../src/types/mcst';
import { IdentifierLike } from './IdentifierLike';
import { ListLike } from './ListLike';
import { Path, Store, useStore } from './store';

// ListLike
// array, list, record
// ^ there will be some rulios about
//   when to do newlines, that will be a little custom
//   lists need to know the nature of the first item
//   and arrays, when the second item of a dealio, will as well

export const rainbow = [
    '#669',
    'orange',
    'green',
    'blue',
    'yellow',
    'indigo',
    'violet',
    'magenta',
    'red',
];

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
        case 'unparsed':
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
    events,
}: {
    idx: number;
    store: Store;
    path: Path[];
    events: Events;
}) => {
    const both = useStore(store, idx);
    if (!both) {
        return null;
    }
    const { node: item, layout } = both;
    const text = idText(item.contents);

    const decs = Object.entries(item.decorators);

    if (text != null) {
        return (
            <>
                <IdentifierLike
                    text={text}
                    type={item.contents.type}
                    store={store}
                    idx={idx}
                    path={path}
                    events={events}
                />
                {decs.length ? (
                    <Decorators
                        decs={decs}
                        store={store}
                        path={path}
                        idx={idx}
                    />
                ) : null}
            </>
        );
    }

    const arr = arrayItems(item.contents);

    if (arr) {
        const [left, right, children] = arr;
        return (
            <ListLike
                {...{ left, right, children, store, path, layout, idx, events }}
            />
        );
    }
    return <span>{JSON.stringify(item.contents)}</span>;
};

function Decorators({
    decs,
    store,
    path,
    idx,
}: {
    decs: [string, number[]][];
    store: Store;
    path: Path[];
    idx: number;
}) {
    return (
        <>
            {decs.map(([key, args]) =>
                key === 'type' ? (
                    <span key={key} style={{ marginLeft: 8 }}>
                        :
                        {args.length === 1 ? (
                            <Node
                                idx={args[0]}
                                store={store}
                                events={{ onLeft() {}, onRight() {} }}
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
                                    <span key={arg} style={{ marginLeft: 8 }}>
                                        <Node
                                            idx={arg}
                                            store={store}
                                            events={{
                                                onLeft() {},
                                                onRight() {},
                                            }}
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
                                    events={{ onLeft() {}, onRight() {} }}
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
