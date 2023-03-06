import React, { useCallback } from 'react';
import { Markdown, Markdown as MDT } from '../../src/types/cst';
import { MNodeExtra } from '../../src/types/mcst';
import { getPos, isAtEnd, isAtStart } from '../mods/onKeyDown';
import {
    Path,
    redo,
    Selection,
    setSelection,
    undo,
    UpdateMap,
    updateStore,
} from '../store';
import { focus, Top } from './IdentifierLike';
import { Events } from './Nodes';
import equal from 'fast-deep-equal';

import {
    $getRoot,
    $getSelection,
    COMMAND_PRIORITY_EDITOR,
    COMMAND_PRIORITY_LOW,
    EditorState,
    KEY_DOWN_COMMAND,
    LexicalEditor,
    LexicalNode,
    REDO_COMMAND,
    UNDO_COMMAND,
} from 'lexical';
import { useEffect } from 'react';

import { LexicalComposer } from '@lexical/react/LexicalComposer';
// import { PlainTextPlugin } from '@lexical/react/LexicalPlainTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
// import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import LexicalErrorBoundary from '@lexical/react/LexicalErrorBoundary';

// import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
// import { ContentEditable } from "@lexical/react/LexicalContentEditable";
// import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
// import { AutoFocusPlugin } from '@lexical/react/LexicalAutoFocusPlugin';
// import LexicalErrorBoundary from "@lexical/react/LexicalErrorBoundary";
// import TreeViewPlugin from "./plugins/TreeViewPlugin";
// import ToolbarPlugin from "./plugins/ToolbarPlugin";

// @ts-ignore
import { HeadingNode, QuoteNode } from '@lexical/rich-text';
// @ts-ignore
import { TableCellNode, TableNode, TableRowNode } from '@lexical/table';
// @ts-ignore
import { ListItemNode, ListNode } from '@lexical/list';
// @ts-ignore
import { CodeHighlightNode, CodeNode } from '@lexical/code';
// @ts-ignore
import { AutoLinkNode, LinkNode } from '@lexical/link';

// import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin';
// import { ListPlugin } from '@lexical/react/LexicalListPlugin';
// import { MarkdownShortcutPlugin } from '@lexical/react/LexicalMarkdownShortcutPlugin';
// import { $generateHtmlFromNodes } from '@lexical/html';
import { addSpace, handleSpace, maybeUpdate } from '../mods/handleSpace';
import { handleBackspace } from '../mods/handleBackspace';

const theme = {
    ltr: 'ltr',
    rtl: 'rtl',
    placeholder: 'editor-placeholder',
    paragraph: 'editor-paragraph',
};

// function MyCustomAutoFocusPlugin() {
//     const [editor] = useLexicalComposerContext();
//     useEffect(() => {
//         console.log('focusing');
//         // Focus the editor when the effect fires!
//         editor.focus();
//     }, [editor]);
//     return null;
// }

function Placeholder() {
    return <div className="editor-placeholder">Enter some rich text</div>;
}

const initialConfig = {
    namespace: 'MyEditor',
    theme,
    onError: (err: Error) => console.error(err),

    // Any custom nodes go here
    nodes: [
        HeadingNode,
        ListNode,
        ListItemNode,
        QuoteNode,
        CodeNode,
        CodeHighlightNode,
        TableNode,
        TableCellNode,
        TableRowNode,
        AutoLinkNode,
        LinkNode,
    ],
};

const UndoPlugin = ({
    top: { store },
    idx,
    path,
    selection,
}: {
    selection: Selection | null;
    top: Top;
    path: Path[];
    idx: number;
}) => {
    const [editor] = useLexicalComposerContext();

    useEffect(() => {
        if (selection) {
            editor.focus();
        }
    }, [editor, selection]);

    useEffect(() => {
        editor.registerCommand(
            KEY_DOWN_COMMAND,
            (event: KeyboardEvent) => {
                if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
                    console.log('yes wow ok like ');
                    const update = addSpace(store, path, true);
                    maybeUpdate(store, update);
                    return true;
                }

                return false;
            },
            COMMAND_PRIORITY_LOW,
        );

        editor.registerCommand(
            UNDO_COMMAND,
            () => {
                const undid = undo(store);
                if (undid && undid.pre[idx]) {
                    editor.setEditorState(
                        editor.parseEditorState(
                            (undid.pre[idx] as Markdown).lexicalJSON,
                        ),
                        { tag: 'historic' },
                    );
                    editor.focus();
                    console.log('yeah undidness');
                }
                return true;
            },
            COMMAND_PRIORITY_EDITOR,
        );

        editor.registerCommand(
            REDO_COMMAND,
            () => {
                const redid = redo(store);
                if (redid && redid.post[idx]) {
                    editor.setEditorState(
                        editor.parseEditorState(
                            (redid.post[idx] as Markdown).lexicalJSON,
                        ),
                        { tag: 'historic' },
                    );
                    editor.focus();
                    console.log('yeah redidness');
                }
                return true;
            },
            COMMAND_PRIORITY_EDITOR,
        );
    }, []);

    return null;
};

export function Markdown({
    idx,
    node,
    top,
    path,
}: {
    path: Path[];
    top: Top;
    node: MDT & MNodeExtra;
    idx: number;
    events: Events;
}) {
    return (
        <div
            onMouseDown={(evt) => evt.stopPropagation()}
            onClick={(evt) => evt.stopPropagation()}
        >
            <LexicalComposer
                initialConfig={{
                    ...initialConfig,
                    editorState: JSON.stringify(node.lexicalJSON),
                }}
            >
                <div className="editor-container">
                    <UndoPlugin
                        selection={
                            top.store.selection?.idx === idx
                                ? top.store.selection
                                : null
                        }
                        path={path}
                        top={top}
                        idx={idx}
                    />

                    <RichTextPlugin
                        contentEditable={
                            <ContentEditable className="editor-input" />
                        }
                        placeholder={<Placeholder />}
                        ErrorBoundary={LexicalErrorBoundary}
                    />
                    <OnChangePlugin onChange={onChange(node, top, idx)} />
                </div>
            </LexicalComposer>
        </div>
    );
}

export const Markdown_ = ({
    top,
    node,
    idx,
    events,
    path,
}: {
    path: Path[];
    top: Top;
    node: { text: string; loc: MNodeExtra['loc'] };
    idx: number;
    events: Events;
}) => {
    const editing = top.store.selection?.idx === idx;
    let [edit, setEdit] = React.useState(null as null | string);
    edit = edit == null ? node.text : edit;

    const presel = React.useRef(null as null | number);
    const ref = React.useRef(null as null | HTMLSpanElement);
    React.useLayoutEffect(() => {
        if (!ref.current) {
            return;
        }
        if (editing) {
            ref.current.textContent = node.text.trim();
            if (ref.current !== document.activeElement || true) {
                focus(ref.current, top.store);
            }
            presel.current = getPos(ref.current);
        }
    }, [editing, node.text, editing ? top.store.selection!.loc : null]);

    return !editing ? (
        <span
            style={{
                color: 'yellow',
                minHeight: '1.3em',
                whiteSpace: 'pre-wrap',
                // paddingLeft: 8,
            }}
            onMouseDown={(evt) => {
                evt.stopPropagation();
                setEdit(node.text);
                setSelection(top.store, { idx });
            }}
            onMouseOver={(evt) =>
                top.setHover({
                    idx,
                    box: evt.currentTarget.getBoundingClientRect(),
                })
            }
            onMouseLeave={() => top.setHover({ idx, box: null })}
        >
            {node.text}
        </span>
    ) : (
        <span
            data-idx={idx}
            contentEditable
            ref={ref}
            autoCorrect="off"
            spellCheck="false"
            autoCapitalize="off"
            className="idlike"
            style={{
                color: 'yellow',
                whiteSpace: 'pre-wrap',
                outline: 'none',
                minHeight: '1.3em',
                // paddingLeft: 8,
                // textDecoration: dec,
                // ...style,
            }}
            onMouseDown={(evt) => evt.stopPropagation()}
            onMouseOver={(evt) =>
                top.setHover({
                    idx,
                    box: evt.currentTarget.getBoundingClientRect(),
                })
            }
            onMouseUp={(evt) => {
                presel.current = getPos(evt.currentTarget);
            }}
            onMouseLeave={() => top.setHover({ idx, box: null })}
            onInput={(evt) => {
                const text = evt.currentTarget.textContent ?? '';
                setEdit(text);
                const pos = getPos(evt.currentTarget);

                // const mp: UpdateMap = {
                //     [node.loc.idx]: { ...node, text },
                // };
                // updateStore(top.store, {
                //     map: mp,
                //     selection: { idx, loc: pos },
                //     prev: { idx, loc: presel.current ?? undefined },
                // });
            }}
            onBlur={() => {
                setEdit(null);
                setSelection(top.store, null);
            }}
            onKeyDown={(evt) => {
                if (evt.key === 'ArrowLeft' && isAtStart(evt.currentTarget)) {
                    evt.preventDefault();
                    evt.stopPropagation();
                    events.onLeft();
                    return;
                }
                if (evt.key === 'ArrowRight' && isAtEnd(evt.currentTarget)) {
                    evt.preventDefault();
                    evt.stopPropagation();
                    events.onRight();
                    return;
                }
                if (evt.key === 'Backspace' && isAtStart(evt.currentTarget)) {
                    handleBackspace(
                        evt.currentTarget.textContent!,
                        true,
                        idx,
                        path,
                        events,
                        top.store,
                    );
                    evt.preventDefault();
                    evt.stopPropagation();
                    return;
                }
                if (evt.key === 'Enter' && evt.metaKey) {
                    handleSpace(evt, idx, path, events, top.store);
                }
            }}
        />
    );
};

function onChange(node: Markdown & MNodeExtra, top: Top, idx: number) {
    return (editorState: EditorState, editor: LexicalEditor) => {
        const lexicalJSON = editorState.toJSON();
        if (equal(lexicalJSON, node.lexicalJSON)) {
            console.log('ignoreee');
            return;
        }
        const now = Date.now();
        updateStore(
            top.store,
            { map: { [idx]: { ...node, lexicalJSON } } },
            (last) => {
                if (!last) {
                    return 'add';
                }
                if (now - last.ts < 500 && last.post[idx] != null) {
                    return 'update';
                }
                return 'add';
            },
        );
    };
}
