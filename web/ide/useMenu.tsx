import React, { useCallback, useEffect, useRef, useState } from 'react';
import { css } from '@linaria/core';

export const isParentOf = (parent: HTMLElement, child: HTMLElement) => {
    if (child === parent) {
        return true;
    }
    while (child.parentElement && child.parentElement !== document.body) {
        child = child.parentElement;
        if (child === parent) {
            return true;
        }
    }
    return false;
};

type Action = {
    title: string;
    action: () => void;
};

export const useMenu = <T,>(
    actions: (v: T) => Action[],
): [JSX.Element | null, (v: T | null) => void] => {
    const [show, setShow] = useState(null as null | Action[]);
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
            evt.preventDefault();
            evt.stopPropagation();
            setShow(null);
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
                    left: 0,
                    minWidth: '100%',
                }}
                onMouseDown={(evt) => {
                    evt.preventDefault();
                    evt.stopPropagation();
                }}
            >
                {show.map((action, i) => (
                    <div
                        key={i}
                        style={{ cursor: 'pointer' }}
                        onClick={(evt) => {
                            evt.preventDefault();
                            evt.stopPropagation();
                            setShow(null);
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
            (v: T | null) => {
                setShow(v ? actions(v) : null);
            },
        ];
    }
    return [
        null,
        (v: T | null) => {
            setShow(v ? actions(v) : null);
        },
    ];
};
