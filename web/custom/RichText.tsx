import * as React from 'react';

import '@blocknote/core/fonts/inter.css';
// import '@blocknote/mantine/style.css';
import '@blocknote/ariakit/style.css';
// import '@fontsource/merriweather/300.css';
import { BlockNoteView } from '@blocknote/ariakit';
import { useCreateBlockNote, useEditorChange } from '@blocknote/react';
// import '@blocknote/react/style.css';
import { Path } from '../store';
import { useGetStore, useSubscribe } from './store/StoreCtx';
import { Reg } from './types';
import { useAutoFocus } from './useAutoFocus';
import { MNode } from '../../src/types/mcst';

import { makeTrackChanges } from './makeTrackChanges';

export const RichText = ({
    initial,
    // onChange,
    // onSelect,
    trackChanges,
    path,
    idx,
    reg,
}: {
    trackChanges?: MNode | null;
    initial: any;
    // onChange: (v: any) => void;
    // onSelect: (v: any) => void;
    path: Path[];
    idx: number;
    reg: Reg;
}) => {
    // const state = useNode
    const store = useGetStore();
    const tc = React.useMemo(() => makeTrackChanges(store, idx), []);
    // Creates a new editor instance.
    const editor = useCreateBlockNote({
        placeholders: { default: '...' },
        initialContent: initial,
        _tiptapOptions: { extensions: tc ? [tc as any] : [] },
    });
    React.useMemo(() => {
        const configured = editor._tiptapEditor.extensionManager.extensions;
        const ext = configured.find((e) => e.name === 'trailingNode');
        if (ext) {
            ext.config.addProseMirrorPlugins = () => [];
        }
    }, []);
    // @ts-ignore
    window.editor = editor;
    // const node = React.useRef<HTMLDivElement>(null);

    useAutoFocus(store, idx, 'rich-text', () => {
        console.log('Focus the rick editor');
        editor?.focus();
    });

    const isFocused = useSubscribe(
        () => {
            const path = store.getState().at[0]?.start;
            return path && path[path.length - 1].idx === idx;
        },
        (fn) => store.on('selection', fn),
        [idx],
    );

    const contents = useSubscribe(
        () => {
            const node = store.getState().map[idx];
            return node?.type === 'rich-text' ? node.contents : null;
        },
        (fn) => store.onChange(idx, fn),
        [idx],
    );

    let firstRender = React.useRef(true);
    React.useEffect(() => {
        if (firstRender.current) {
            firstRender.current = false;
            return;
        }
        // erg
        // editor.removeBlocks()
    }, [contents]);

    // useEditorSelectionChange(() => {
    //     // console.log(editor.getSelection());
    //     // onSelect(editor.getTextCursorPosition().block.id);
    //     store.dispatch({
    //         type: 'select',
    //         at: [{ start: path }],
    //     });
    // }, editor);
    useEditorChange(() => {
        // console.log('editor change');
        // onChange(editor.document);
        store.dispatch({
            type: 'rich',
            idx,
            content: editor.document,
        });
    }, editor);

    // Renders the editor instance using a React component.
    return (
        <BlockNoteView
            // @ts-ignore
            style={{
                minWidth: 400,
                maxWidth: 1000,
                // outline:
                //     trackChanges !== undefined
                //         ? '1px solid rgb(20,155,20)'
                //         : undefined,
            }}
            className="rich-text"
            // ref={node}
            editor={editor}
            theme={'dark'}
            sideMenu={false}
            spellCheck={isFocused}
            onKeyDown={(evt: React.KeyboardEvent) => {
                // console.log('key down', evt.key, editor.document);
                if (
                    evt.key === 'Backspace' &&
                    editor.document.length === 1 &&
                    (editor.document[0].content as any[]).length === 0
                ) {
                    store.dispatch({
                        type: 'key',
                        key: 'Backspace',
                        mods: {},
                    });
                    evt.preventDefault();
                    (document.activeElement as HTMLElement).blur();
                }
                if (evt.key === 'Tab') {
                    store.dispatch({
                        type: 'key',
                        key: 'ArrowRight',
                        mods: {},
                    });
                    evt.preventDefault();
                    (document.activeElement as HTMLElement).blur();
                }
                // if (editor.document)
            }}
            placeholder="..."
            onFocus={() => {
                // console.log('got focus yall');
                // editor.getSelection()
                store.dispatch({
                    type: 'select',
                    at: [
                        {
                            start: path.concat([
                                {
                                    type: 'rich-text',
                                    idx,
                                    sel: editor.getTextCursorPosition().block
                                        .id,
                                },
                            ]),
                        },
                    ],
                });
            }}
        />
    );

    // const initialConfig = {
    //     namespace: 'MyEditor',
    //     theme: {},
    //     onError(err: any) {
    //         console.log('hm failed', err);
    //     },
    //     editorState: state,
    // };

    // return (
    //     // <LexicalComposer initialConfig={initialConfig}>
    //     //     <RichTextPlugin
    //     //         contentEditable={<ContentEditable />}
    //     //         placeholder={<div>Enter some text...</div>}
    //     //         ErrorBoundary={LexicalErrorBoundary}
    //     //     />
    //     //     <HistoryPlugin />
    //     //     <AutoFocusPlugin />
    //     //     {/* <OnChangePlugin
    //     //         onChange={(change) => {
    //     //             console.log('chage', change);
    //     //         }}
    //     //         ignoreSelectionChange
    //     //     /> */}
    //     //     <OnChangePlugin
    //     //         onChange={(change) => {
    //     //             window.st = change;
    //     //             console.log('sel chage', change);
    //     //         }}
    //     //         ignoreSelectionChange={false}
    //     //     />
    //     // </LexicalComposer>
    // );
};
