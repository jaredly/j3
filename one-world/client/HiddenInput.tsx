import React, {
    createContext,
    useContext,
    useEffect,
    useMemo,
    useRef,
} from 'react';
import { listen } from './listen';

const HiddenCtx = createContext<{
    onKey(f: (k: string, mods: Mods) => void, blur: () => void): () => void;
}>(null as any);

export type EvtKey = 'key';

export type Mods = { shift: boolean; meta: boolean };

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
                        k(evt.key, { shift: evt.shiftKey, meta: evt.metaKey }),
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

export const Hidden = ({
    onKeyDown,
    onBlur,
}: {
    onKeyDown: (evt: React.KeyboardEvent) => void;
    onBlur: (evt: React.FocusEvent) => void;
}) => {
    return (
        <>
            <input
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
                    // ctx.listeners.key.forEach((k) =>
                    //     k(evt.key, { shift: evt.shiftKey, meta: evt.metaKey }),
                    // );
                    onKeyDown(evt);
                }}
                onBlur={(evt) => {
                    // if (evt.currentTarget !== document.activeElement) {
                    //     ctx.listeners.blur.map((f) => f());
                    // }
                    onBlur(evt);
                }}
            />
        </>
    );
};
