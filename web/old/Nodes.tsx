import * as React from 'react';
import { Ctx } from '../../src/to-ast/Ctx';
import { MNodeContents } from '../../src/types/mcst';
import { SetHover } from './Doc';
import { IdentifierLike, Top } from './IdentifierLike';
import { ListLike, sideClick } from './ListLike';
import { EvalCtx, Path, setSelection, Store, useStore } from '../store';
import { StringView } from './String';

// ListLike
// array, list, record
// ^ there will be some rulios about
//   when to do newlines, that will be a little custom
//   lists need to know the nature of the first item
//   and arrays, when the second item of a dealio, will as well

const raw = '1b9e77d95f027570b3e7298a66a61ee6ab02a6761d666666';
// const raw = '7fc97fbeaed4fdc086ffff99386cb0f0027fbf5b17666666';

export const rainbow: string[] = ['#669'];

for (let i = 0; i < raw.length; i += 6) {
    rainbow.push('#' + raw.slice(i, i + 6));
}

// We'll start at depth=1, so this just rolls it one over
rainbow.unshift(rainbow.pop()!);

export type Events = {
    onRight: () => void;
    onLeft: () => void;
    onKeyDown?: (evt: React.KeyboardEvent) => true | void;
    // other things? idk
};

export const idText = (node: MNodeContents, idx: number, ctx: Ctx) => {
    switch (node.type) {
        case 'identifier':
            if (node.text === '' && node.hash) {
                const style = ctx.display[idx]?.style;
                if (style?.type === 'id' && style.text != null) {
                    return style.text;
                }
                return ``;
            }
        case 'comment':
            return node.text;
        case 'number':
        case 'unparsed':
            return node.raw;
        case 'tag':
            return "'" + node.text;
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
export const Node = React.memo(
    ({
        idx,
        path,
        events,
        top,
    }: {
        idx: number;
        path: Path[];
        events: Events;
        top: Top;
    }) => {
        const item = useStore(top.store, idx);
        if (!item) {
            return null;
        }

        if (item.type === 'string') {
            return (
                <StringView
                    node={item}
                    top={top}
                    idx={idx}
                    path={path}
                    events={events}
                />
            );
        }

        const text = idText(item, idx, top.ctx.ctx);

        const tannot = item.tannot ? (
            <>
                <span
                    style={{
                        opacity: 0.5,
                        alignSelf: 'flex-end',
                        paddingLeft: '0.75em',
                    }}
                    onMouseDown={sideClick((left) => {
                        if (left) {
                            setSelection(
                                top.store,
                                // children.length
                                //     ? {
                                //           idx: children[children.length - 1],
                                //           loc: 'end',
                                //           from: 'right',
                                //       }
                                //     : { idx, loc: 'inside', from: 'right' },
                                { idx, loc: 'end' },
                            );
                        } else {
                            setSelection(top.store, {
                                idx: item.tannot!,
                                loc: 'start',
                                from: 'left',
                            });
                        }
                    })}
                >
                    :
                </span>
                <Node
                    idx={item.tannot}
                    events={{
                        ...events,
                        onLeft() {
                            setSelection(top.store, {
                                idx,
                                loc: 'end',
                            });
                        },
                    }}
                    {...{
                        top,
                        path,
                    }}
                />
            </>
        ) : null;

        events = tannot
            ? {
                  ...events,
                  onRight() {
                      setSelection(top.store, {
                          idx: item.tannot!,
                          loc: 'start',
                      });
                  },
              }
            : events;

        // const decs = Object.entries(item.decorators);

        if (text != null) {
            const res = (
                <IdentifierLike
                    text={text}
                    type={item.type}
                    top={top}
                    idx={idx}
                    path={path}
                    events={events}
                />
            );
            if (item.tannot) {
                return (
                    <>
                        {res}
                        {tannot}
                    </>
                );
            }
            return res;
        }

        const arr = arrayItems(item);

        if (arr) {
            const [left, right, children] = arr;
            const res = (
                <ListLike
                    {...{
                        left,
                        right,
                        children,
                        top,
                        path,
                        idx,
                        events,
                    }}
                />
            );
            if (item.tannot) {
                return (
                    <div
                        style={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            alignItems: 'flex-start',
                            whiteSpace: 'pre',
                        }}
                    >
                        {res}
                        {tannot}
                    </div>
                );
            }
            return res;
        }

        return <span>{JSON.stringify(item)}</span>;
    },
);

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
