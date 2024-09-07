import React, {
    createContext,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';
import { listen } from './listen';

const HiddenCtx = createContext<{
    onKey(f: (k: string, mods: Mods) => void, blur: () => void): () => void;
}>(null as any);

export type EvtKey = 'key';

export type Mods = { shift: boolean; meta: boolean; ctrl: boolean };

export const useKeyListener = (
    active: boolean,
    f: (key: string, mods: Mods) => void,
    blur: () => void,
) => {
    const ctx = useContext(HiddenCtx);
    useEffect(() => {
        if (!active) return;
        return ctx.onKey(f, blur);
    }, [active]);
};

export const HiddenInput = ({ children }: { children: React.ReactNode }) => {
    const ctx = useMemo(() => {
        const listeners: {
            key: ((key: string, mods: Mods) => void)[];
            blur: (() => void)[];
        } = { key: [], blur: [] };
        return {
            listeners,
            onKey(f: (key: string, mods: Mods) => void, blur: () => void) {
                const un = listen(listeners.key, f);
                const unb = listen(listeners.blur, blur);
                ref.current?.focus();
                return () => {
                    un();
                    unb();
                };
            },
        };
    }, []);
    const ref = useRef(null as null | HTMLInputElement);

    return (
        <>
            <input
                ref={ref}
                value=""
                onChange={() => {}}
                autoFocus
                style={{
                    // width: 10,
                    // height: 10,
                    width: 0,
                    height: 0,
                    opacity: 0,
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    border: 'none',
                    pointerEvents: 'none',
                }}
                onKeyDown={(evt) => {
                    ctx.listeners.key.forEach((k) =>
                        k(evt.key, {
                            shift: evt.shiftKey,
                            meta: evt.metaKey,
                            ctrl: evt.ctrlKey,
                        }),
                    );
                }}
                onBlur={(evt) => {
                    if (evt.currentTarget !== document.activeElement) {
                        ctx.listeners.blur.map((f) => f());
                    }
                }}
            />
            <HiddenCtx.Provider value={ctx}>{children}</HiddenCtx.Provider>
        </>
    );
};

// from http://xahlee.info/comp/unicode_computing_symbols.html
const specials: Record<string, string> = {
    Backspace: '⌫',
    Delete: '⌦',
    Meta: '⌘',
    Shift: '⬆',
    ArrowUp: '↑',
    ArrowLeft: '←',
    ArrowDown: '↓',
    ArrowRight: '→',
    // ArrowLeft: '⇦',
    // Shift: '⇧',
    // ArrowUp: '⇧',
    // ArrowRight: '⇨',
    // ArrowDown: '⇩',
    Enter: '⏎',
    Control: '^',
    // Alt: '⎇',
    Alt: '⌥',
    ' ': '␣',
    Tab: '⇥',
};

const showKey = (key: Key) => {
    let text = [specials[key.key] ?? key.key];
    if (key.shift && key.key !== 'Shift') {
        text.unshift(specials.Shift);
    }
    if (key.meta && key.key !== 'Meta') {
        text.unshift(specials.Meta);
    }
    if (key.alt && key.key !== 'Alt') {
        text.unshift(specials.Alt);
    }
    if (key.ctrl && key.key !== 'Control') {
        text.unshift(specials.Control);
    }
    return text.map((t, i) => (
        <span
            key={i}
            style={{
                padding: '4px 8px',
                backgroundColor: '#555',
                color: '#aaa',
                fontWeight: 'bold',
                borderRadius: 12,
            }}
        >
            {t}
        </span>
    ));
};
type Key = {
    key: string;
    meta: boolean;
    shift: boolean;
    ctrl: boolean;
    alt: boolean;
};

export const Hidden = ({
    onKeyDown,
    onBlur,
    iref,
}: {
    onKeyDown: (evt: React.KeyboardEvent) => void;
    onBlur: (evt: React.FocusEvent) => void;
    iref: React.RefObject<HTMLInputElement>;
}) => {
    const [show, setShow] = useState(null as null | Key);

    useEffect(() => {
        if (!show) return;
        const tid = setTimeout(() => {
            setShow(null);
        }, 1500);

        return () => clearTimeout(tid);
    }, [show]);

    return (
        <>
            {show ? (
                <div
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        padding: 24,
                        display: 'flex',
                        gap: 16,
                        color: 'white',
                        fontSize: '200%',
                    }}
                >
                    {showKey(show)}
                </div>
            ) : null}
            <input
                ref={iref}
                value=""
                onChange={() => {}}
                autoFocus
                style={{
                    width: 0,
                    height: 0,
                    opacity: 0,
                    pointerEvents: 'none',

                    position: 'fixed',
                    top: 0,
                    left: 0,
                    border: 'none',
                }}
                onKeyDown={(evt) => {
                    setShow({
                        key: evt.key,
                        meta: evt.metaKey,
                        ctrl: evt.ctrlKey,
                        shift: evt.shiftKey,
                        alt: evt.altKey,
                    });
                    // ctx.listeners.key.forEach((k) =>
                    //     k(evt.key, { shift: evt.shiftKey, meta: evt.metaKey }),
                    // );
                    onKeyDown(evt);
                }}
                onBlur={(evt) => {
                    if (evt.currentTarget !== document.activeElement) {
                        onBlur(evt);
                    }
                }}
            />
        </>
    );
};
