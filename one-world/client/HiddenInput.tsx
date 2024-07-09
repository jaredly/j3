import React, {
    createContext,
    useContext,
    useEffect,
    useMemo,
    useRef,
} from 'react';

const HiddenCtx = createContext<{
    onKey(f: (k: string, mods: Mods) => void): () => void;
}>(null as any);

export type EvtKey = 'key';

export type Mods = { shift: boolean; meta: boolean };

export const useKeyListener = (
    active: boolean,
    f: (key: string, mods: Mods) => void,
) => {
    const ctx = useContext(HiddenCtx);
    useEffect(() => {
        if (!active) return;
        return ctx.onKey(f);
    }, [active]);
};

export const HiddenInput = ({ children }: { children: React.ReactNode }) => {
    const ctx = useMemo(() => {
        const listeners: {
            key: ((key: string, mods: Mods) => void)[];
        } = { key: [] };
        return {
            listeners,
            onKey(f: (key: string, mods: Mods) => void) {
                listeners.key.push(f);
                ref.current?.focus();
                return () => {
                    const idx = listeners.key.indexOf(f);
                    if (idx !== -1) {
                        listeners.key.splice(idx, 1);
                    }
                };
            },
        };
    }, []);
    const ref = useRef(null as null | HTMLInputElement);

    useEffect(() => {
        // ref.current!.focus();
        // document.addEventListener('focus', () => {
        //     ref.current!.focus();
        // });
    }, []);

    return (
        <>
            <input
                ref={ref}
                value=""
                onChange={() => {}}
                autoFocus
                onBlur={(evt) => {
                    if (ctx.listeners.key.length) {
                        evt.currentTarget.focus();
                    }
                }}
                style={{
                    width: 10,
                    height: 10,
                    // width: 0,
                    // height: 0,
                    // opacity: 0,
                    // position: 'fixed',
                    // top: 0,
                    // left: 0,
                    // border: 'none',
                    // pointerEvents: 'none',
                }}
                onKeyDown={(evt) => {
                    ctx.listeners.key.forEach((k) =>
                        k(evt.key, { shift: evt.shiftKey, meta: evt.metaKey }),
                    );
                }}
            />
            <HiddenCtx.Provider value={ctx}>{children}</HiddenCtx.Provider>
        </>
    );
};
