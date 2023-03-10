import React, { useCallback, useMemo } from 'react';
import { RichText, RichText as MDT } from '../../src/types/cst';
import { MNodeExtra } from '../../src/types/mcst';
import { getPos, isAtEnd, isAtStart } from '../mods/old/onKeyDown';
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
    COMMAND_PRIORITY_CRITICAL,
    COMMAND_PRIORITY_EDITOR,
    COMMAND_PRIORITY_LOW,
    EditorState,
    KEY_ARROW_LEFT_COMMAND,
    KEY_ARROW_RIGHT_COMMAND,
    KEY_BACKSPACE_COMMAND,
    KEY_DOWN_COMMAND,
    KEY_ENTER_COMMAND,
    LexicalEditor,
    LexicalNode,
    RangeSelection,
    REDO_COMMAND,
    TextNode,
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
import { TRANSFORMERS } from '@lexical/markdown';

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
import { MarkdownShortcutPlugin } from '@lexical/react/LexicalMarkdownShortcutPlugin';
// import { $generateHtmlFromNodes } from '@lexical/html';
import { addSpace, handleSpace, maybeUpdate } from '../mods/old/handleSpace';
import { handleBackspace } from '../mods/old/handleBackspace';

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

const MyPlugin = ({
    top: { store },
    idx,
    path,
    selection,
    events,
}: {
    selection: Selection | null;
    top: Top;
    path: Path[];
    idx: number;
    events: Events;
}) => {
    const [editor] = useLexicalComposerContext();

    useEffect(() => {
        if (selection) {
            editor.focus();
        }
    }, [editor, selection]);

    useEffect(() => {
        editor.registerCommand(
            KEY_ENTER_COMMAND,
            (event: KeyboardEvent) => {
                if (event.metaKey || event.ctrlKey) {
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
            KEY_BACKSPACE_COMMAND,
            (event: KeyboardEvent) => {
                if (isEmpty(editor.getEditorState())) {
                    event.preventDefault();
                    event.stopPropagation();
                    handleBackspace('', true, idx, path, events, store);
                    return true;
                }
                // Handle event here
                return false;
            },
            COMMAND_PRIORITY_LOW,
        );

        editor.registerCommand(
            KEY_ARROW_LEFT_COMMAND,
            (event: KeyboardEvent) => {
                if (isLexAtStart(editor.getEditorState())) {
                    event.preventDefault();
                    event.stopPropagation();
                    events.onLeft();
                    return true;
                }
                // Handle event here
                return false;
            },
            COMMAND_PRIORITY_LOW,
        );

        editor.registerCommand(
            KEY_ARROW_RIGHT_COMMAND,
            (event: KeyboardEvent) => {
                console.log('keyd', event.key);
                if (
                    // event.key === 'ArrowRight' &&
                    isLexAtEnd(editor.getEditorState())
                ) {
                    event.preventDefault();
                    event.stopPropagation();
                    events.onRight();
                    return true;
                }
                // Handle event here
                return false;
            },
            COMMAND_PRIORITY_CRITICAL,
        );

        editor.registerCommand(
            UNDO_COMMAND,
            () => {
                const undid = undo(store);
                if (undid && undid.pre[idx]) {
                    editor.setEditorState(
                        editor.parseEditorState(
                            (undid.pre[idx] as RichText).lexicalJSON,
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
                            (redid.post[idx] as RichText).lexicalJSON,
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

export function RichText({
    idx,
    node,
    top,
    path,
    events,
}: {
    path: Path[];
    top: Top;
    node: MDT & MNodeExtra;
    idx: number;
    events: Events;
}) {
    const initial = useMemo(
        () => ({
            ...initialConfig,
            editorState: JSON.stringify(node.lexicalJSON),
        }),
        [],
    );
    return (
        <div
            onClick={(evt) => evt.stopPropagation()}
            onMouseDown={(evt) => evt.stopPropagation()}
        >
            <LexicalComposer initialConfig={initial}>
                <div
                    className="editor-container"
                    onMouseDown={(evt) => {
                        if (top.store.selection?.idx !== idx) {
                            if (evt.target === evt.currentTarget) {
                                evt.preventDefault();
                            }
                            setSelection(top.store, { idx, loc: 'end' });
                        }
                    }}
                >
                    <MyPlugin
                        events={events}
                        selection={
                            top.store.selection?.idx === idx
                                ? top.store.selection
                                : null
                        }
                        path={path}
                        top={top}
                        idx={idx}
                    />
                    <MarkdownShortcutPlugin transformers={TRANSFORMERS} />

                    <RichTextPlugin
                        contentEditable={
                            <ContentEditable className="editor-input" />
                        }
                        placeholder={null}
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

function onChange(node: RichText & MNodeExtra, top: Top, idx: number) {
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

export const isEmpty = (state: EditorState) => {
    const root = state._nodeMap.get('root')!;
    if (!root.__first) return true;
    if (root.__first !== root.__last) return false;
    const child = state._nodeMap.get(root.__first)!;
    return child.__first == null;
};

export const isLexAtStart = (state: EditorState) => {
    const sel = state._selection;
    if (
        !sel ||
        !('isCollapsed' in sel) ||
        !sel.isCollapsed() ||
        sel.anchor.offset !== 0
    ) {
        return false;
    }
    let id = 'root';
    while (id) {
        const got = state._nodeMap.get(id);
        if (!got || got.__first == null) {
            return false;
        }
        if (got.__first === sel.anchor.key) {
            return true;
        }
        id = got.__first;
    }
    return false;
};

export const isLexAtEnd = (state: EditorState) => {
    const sel = state._selection;
    if (!sel || !('isCollapsed' in sel) || !sel.isCollapsed()) {
        return false;
    }
    const anchor = state._nodeMap.get(sel.anchor.key);
    if (!anchor) {
        return false;
    }
    if ('__text' in anchor && sel.anchor.offset !== anchor.__text.length) {
        return false;
    }
    let id = 'root';
    while (id) {
        const got = state._nodeMap.get(id);
        if (!got || got.__last == null) {
            return false;
        }
        if (got.__last === sel.anchor.key) {
            return true;
        }
        id = got.__last;
    }
    console.log('ran out of first idk');
    return false;
};
