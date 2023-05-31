import React, { useEffect, useRef, useState } from 'react';
import { isParentOf } from './IDE';
import { css } from '@linaria/core';

export const useMenu = (
    actions: { title: string; action: () => void }[],
): [JSX.Element | null, () => void] => {
    const [show, setShow] = useState(false);
    const ref = useRef<HTMLDivElement>(null);
    useEffect(() => {
        if (!show) return;
        const fn = (evt: MouseEvent) => {
            if (!ref.current) {
                return;
            }
            if (isParentOf(ref.current!, evt.target as HTMLElement)) {
                return;
            }
            console.log('what no');
            evt.preventDefault();
            evt.stopPropagation();
            setShow(false);
        };
        document.addEventListener('mousedown', fn, { capture: true });
        return () =>
            document.removeEventListener('mousedown', fn, { capture: true });
    }, [show]);
    if (show) {
        return [
            <div
                ref={ref}
                style={{
                    position: 'absolute',
                    zIndex: 1000,
                    top: '100%',
                    marginTop: 5,
                    backgroundColor: '#333',
                    // padding: 5,
                    left: 0,
                    // right: 0,
                    minWidth: '100%',
                }}
            >
                {actions.map((action, i) => (
                    <div
                        key={i}
                        style={{ cursor: 'pointer' }}
                        onClick={() => {
                            setShow(false);
                            action.action();
                        }}
                        className={css`
                            cursor: pointer;
                            padding: 8px 12px;
                            &:hover {
                                background-color: #444;
                            }
                        `}
                    >
                        {action.title}
                    </div>
                ))}
            </div>,
            () => setShow(false),
        ];
    }
    return [null, () => setShow(true)];
};
