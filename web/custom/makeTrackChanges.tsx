import { MNode } from '../../src/types/mcst';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { Extension } from '@tiptap/core';
import { Decoration, DecorationSet } from '@tiptap/pm/view';
import { Store } from './store/Store';
import { Block, StyledText } from '@blocknote/core';
import { Fragment, Node } from '@tiptap/pm/model';

const compareBlocks = (inner: Node, block: Block<any>) => {
    if (!inner || !block) return false;
    if (inner.type.name === 'text') {
        if (block.type !== 'text' && block.type !== 'link') {
            console.log(`inner is text but bock is not`, inner, block);
            return false;
        }
        // @ts-ignore
        const bt = block.type === 'link' ? block.content[0].text : block.text;
        if (bt !== inner.text) {
            console.log('the text differ', bt, inner.text);
        }
        return bt === inner.text;
    }
    if (inner.type.name === block.type && Array.isArray(block.content)) {
        for (let i = 0; i < inner.content.childCount; i++) {
            if (
                !compareBlocks(inner.content.child(i), block.content[i] as any)
            ) {
                return false;
            }
        }
        if (block.content.length > inner.content.childCount) {
            return false;
        }
        return true;
    }
    // if (inner.type.name === 'heading') {
    //     if (block.type !== 'heading') {
    //         console.log('inner is heading block is not', inner, block);
    //         return false;
    //     }
    //     if (!Array.isArray(block.content)) {
    //         console.log('block cont not arr', block);
    //         return false;
    //     }
    //     for (let i = 0; i < inner.content.childCount; i++) {
    //         if (
    //             !compareBlocks(inner.content.child(i), block.content[i] as any)
    //         ) {
    //             return false;
    //         }
    //     }
    //     return true;
    // }
    // // const inner = fragment.child(0)
    // if (block.type === 'heading' && inner.type.name !== 'heading') return false
    // if (inner.type.name)
    // if (inner.content.size !== block.content.length) {
    //     return false
    // }
    // block.content
    console.log('something else', inner, block);
    return false;
};

//
export const makeTrackChanges = (store: Store, idx: number) =>
    Extension.create({
        name: 'TrackChanges',
        addProseMirrorPlugins() {
            const prev = store.getState().trackChanges?.previous[idx];
            if (!prev || prev.type !== 'rich-text') return [];
            const cont: Block<any>[] = prev.contents;
            return [
                new Plugin({
                    key: new PluginKey('TrackChanges'),
                    props: {
                        decorations(state) {
                            // window['st' + idx] = {
                            //     doc: state.doc,
                            //     contents: prev.contents,
                            // };
                            const dec = [];
                            const blocksFragment =
                                state.doc.content.child(0).content;
                            let at = 0;
                            for (
                                let i = 0;
                                i < blocksFragment.childCount;
                                i++
                            ) {
                                const b = blocksFragment.child(i);
                                if (
                                    !compareBlocks(b.content.child(0), cont[i])
                                ) {
                                    console.log('diff', b, cont[i]);
                                    dec.push(
                                        Decoration.inline(at, at + b.nodeSize, {
                                            style: 'background-color: rgb(20 60 20)',
                                        }),
                                    );
                                }
                                at += b.nodeSize;
                            }
                            console.log(
                                'TRACK',
                                'st' + idx,
                                // state.doc.toJSON(),
                                // prev.contents,
                            );
                            return DecorationSet.create(
                                state.doc,
                                dec,
                                //     [
                                //     Decoration.inline(0, 4, {
                                //         style: 'background-color: red',
                                //     }),
                                // ]
                            );
                        },
                    },
                }),
            ];
        },
        // Your code here
    });
