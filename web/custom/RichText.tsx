import * as React from 'react';

import { AutoFocusPlugin } from '@lexical/react/LexicalAutoFocusPlugin';
import {
    InitialEditorStateType,
    LexicalComposer,
} from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import LexicalErrorBoundary from '@lexical/react/LexicalErrorBoundary';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';

import '@blocknote/react/style.css';
import {
    BlockNoteView,
    useCreateBlockNote,
    useEditorChange,
    useEditorSelectionChange,
} from '@blocknote/react';
import { Path } from '../store';
import { useGetStore, useSubscribe } from './store/StoreCtx';
import { Reg } from './types';
import { useAutoFocus } from './useAutoFocus';

export const RichText = ({
    initial,
    // onChange,
    // onSelect,
    path,
    idx,
    reg,
}: {
    initial: any;
    // onChange: (v: any) => void;
    // onSelect: (v: any) => void;
    path: Path[];
    idx: number;
    reg: Reg;
}) => {
    // const state = useNode
    const store = useGetStore();
    // Creates a new editor instance.
    const editor = useCreateBlockNote({
        placeholders: { default: '...' },
        initialContent: initial,
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

    useAutoFocus(store, idx, 'rich-text', () => editor?.focus());

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
            style={{ minWidth: 400, maxWidth: 800 }}
            className="rich-text"
            // ref={node}
            editor={editor}
            theme={'dark'}
            sideMenu={false}
            spellCheck={isFocused}
            onKeyDown={(evt) => {
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
