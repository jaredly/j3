import React, { useEffect, useRef } from 'react';

const shouldIgnore = (el: Element | null) => {
    if (!el) return false;
    // if (el.classList.contains('bn-editor')) return true;
    // if (el.getAttribute('contenteditable')) return true;
    if (el.nodeName === 'INPUT') return true;
};

export const clipboardPrefix = '<!--""" stoa-clipboard ';
export const clipboardSuffix = ' """-->';

export function HiddenInput({
    getDataToCopy,
    onPaste,
    onKeyDown,
    onInput,
    sel,
}: {
    onKeyDown(evt: React.KeyboardEvent): void;
    getDataToCopy(): { display: string; json: any } | null;
    onPaste(data: { type: 'plain'; text: string } | { type: 'json'; data: any }): void;
    onInput(text: string): void;
    sel: any;
}) {
    useEffect(() => {
        if (document.activeElement !== hiddenInput.current && !shouldIgnore(document.activeElement)) {
            console.log('stealing focus', document.activeElement);
            hiddenInput.current?.focus();
        }
    }, [sel]);

    useEffect(() => {
        const key = (evt: KeyboardEvent) => {
            if (evt.key === 'd' && (evt.metaKey || evt.ctrlKey)) {
                evt.preventDefault();
                console.log('ctrl d is not allowed? idk');
            }
        };
        window.addEventListener('keydown', key);
        const fn = () => {
            setTimeout(() => {
                if (document.activeElement === document.body) {
                    console.log('stealing focus lol');
                    hiddenInput.current?.focus();
                }
            }, 50);
        };
        window.addEventListener('blur', fn, true);
        return () => {
            window.removeEventListener('keydown', key);
            window.removeEventListener('blur', fn, true);
        };
    }, []);

    const hiddenInput = useRef(null as null | HTMLInputElement);

    return (
        <input
            ref={hiddenInput}
            autoFocus
            value=""
            style={{
                width: 0,
                height: 0,
                opacity: 0,
                position: 'fixed',
                top: 0,
                left: 0,
                border: 'none',
                pointerEvents: 'none',
            }}
            onCopy={(evt) => {
                evt.preventDefault();
                const data = getDataToCopy();
                if (data == null) return;

                navigator.clipboard.write([
                    new ClipboardItem({
                        ['text/plain']: new Blob([data.display], {
                            type: 'text/plain',
                        }),
                        ['text/html']: new Blob([clipboardPrefix + JSON.stringify(data.json) + clipboardSuffix + data.display], {
                            type: 'text/html',
                        }),
                    }),
                ]);
            }}
            onPaste={(evt) => {
                console.log('paste?', evt);
                evt.preventDefault();
                const text = evt.clipboardData.getData('text/html');
                // TODO: We should do rich copy/paste!
                if (text) {
                    console.log('goit', text);
                    const start = text.indexOf(clipboardPrefix);
                    const end = text.indexOf(clipboardSuffix);
                    if (start !== -1 && end !== -1) {
                        const sub = text.slice(start + clipboardPrefix.length, end);
                        try {
                            const data = JSON.parse(sub);
                            onPaste({ type: 'json', data });
                        } catch (err) {
                            console.error(err);
                        }
                    }
                    return;
                }
                const plain = evt.clipboardData.getData('text/plain');
                if (plain) {
                    onPaste({ type: 'plain', text: plain });
                }
            }}
            onKeyDown={onKeyDown}
            onInput={(evt) => {
                if (evt.currentTarget.value) {
                    onInput(evt.currentTarget.value);
                    evt.currentTarget.value = '';
                }
            }}
            onCompositionStart={(evt) => {
                console.log(evt);
            }}
            onCompositionEnd={(evt) => {
                console.log('end', evt);
            }}
            onCompositionUpdate={(evt) => {
                console.log('update', evt);
            }}
        />
    );
}
