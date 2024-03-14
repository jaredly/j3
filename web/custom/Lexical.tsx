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
import { useGetStore } from './Store';

export const LexicalFolks = ({
    initial,
    // onChange,
    // onSelect,
    path,
    idx,
}: {
    initial: any;
    // onChange: (v: any) => void;
    // onSelect: (v: any) => void;
    path: Path[];
    idx: number;
}) => {
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
    // return <BlockNoteView editor={editor} />;
    return (
        <BlockNoteView
            style={{ minWidth: 400, maxWidth: 800 }}
            className="rich-text"
            editor={editor}
            theme={'dark'}
            sideMenu={false}
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
