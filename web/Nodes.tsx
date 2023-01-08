import * as React from 'react';
import { MNodeContents } from '../src/types/mcst';
import { SetHover } from './App';
import { IdentifierLike } from './IdentifierLike';
import { ListLike } from './ListLike';
import { EvalCtx, Path, Store, useStore } from './store';

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
        case 'comment':
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
            return ['{', '}', node.values];
    }
};

// IdentifierLike (atom?)
// identifier, tag, number?, comment prolly
export const Node = ({
    idx,
    store,
    path,
    events,
    ctx,
    setHover,
}: {
    idx: number;
    store: Store;
    path: Path[];
    events: Events;
    ctx: EvalCtx;
    setHover: SetHover;
}) => {
    const both = useStore(store, idx);
    if (!both) {
        return null;
    }
    const { node: item, layout } = both;
    const text = idText(item.contents);

    // const decs = Object.entries(item.decorators);

    if (text != null) {
        return (
            <IdentifierLike
                text={text}
                type={item.contents.type}
                store={store}
                idx={idx}
                path={path}
                events={events}
                ctx={ctx}
                setHover={setHover}
            />
        );
    }

    const arr = arrayItems(item.contents);

    if (arr) {
        const [left, right, children] = arr;
        return (
            <ListLike
                {...{
                    left,
                    right,
                    children,
                    store,
                    path,
                    layout,
                    idx,
                    events,
                    ctx,
                    setHover,
                }}
            />
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
