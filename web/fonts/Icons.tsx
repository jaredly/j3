import { css } from '@linaria/core';
import * as React from 'react';

// from https://reactsvgicons.com/search?q=home

export function IconHome(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg
            viewBox="0 0 1024 1024"
            fill="currentColor"
            height="1em"
            width="1em"
            {...props}
        >
            <path d="M946.5 505L534.6 93.4a31.93 31.93 0 00-45.2 0L77.5 505c-12 12-18.8 28.3-18.8 45.3 0 35.3 28.7 64 64 64h43.4V908c0 17.7 14.3 32 32 32H448V716h112v224h265.9c17.7 0 32-14.3 32-32V614.3h43.4c17 0 33.3-6.7 45.3-18.8 24.9-25 24.9-65.5-.1-90.5z" />
        </svg>
    );
}

export function IconBxsPencil(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="currentColor"
            height="1em"
            width="1em"
            {...props}
        >
            <path d="M8.707 19.707L18 10.414 13.586 6l-9.293 9.293a1.003 1.003 0 00-.263.464L3 21l5.242-1.03c.176-.044.337-.135.465-.263zM21 7.414a2 2 0 000-2.828L19.414 3a2 2 0 00-2.828 0L15 4.586 19.414 9 21 7.414z" />
        </svg>
    );
}

export const useTouchClick = <T,>(fn: (arg: T) => void) => {
    const valid = React.useRef(null as null | boolean);
    return (arg: T) => ({
        onTouchStart: (evt: React.TouchEvent) => {
            if (valid.current === null) {
                valid.current = true;
            } else {
                valid.current = false;
            }
        },
        onTouchMove: (evt: React.TouchEvent) => {
            valid.current = false;
        },
        onTouchEnd: (evt: React.TouchEvent) => {
            evt.preventDefault(); // stop onclick from happening.
            if (evt.touches.length > 0) {
                return;
            }
            if (valid.current === true) {
                fn(arg);
            }
            valid.current = null;
        },
    });
};

export const IconButton = ({
    onClick,
    onMouseOver,
    onMouseOut,
    hoverIcon,
    children,
    selected,
    disabled,
    color,
    className,
    size,
}: {
    onClick: () => void;
    onMouseOver?: (evt: React.MouseEvent) => void;
    onMouseOut?: (evt: React.MouseEvent) => void;
    hoverIcon?: React.ReactNode;
    children: React.ReactNode;
    selected?: boolean;
    disabled?: boolean;
    color?: string;
    className?: string;
    size?: number;
}) => {
    const handlers = useTouchClick<void>((_) => onClick());
    const [hover, setHover] = React.useState(false);
    return (
        <div
            {...handlers(undefined)}
            onMouseOver={(evt) => {
                setHover(true);
                if (onMouseOver) {
                    onMouseOver(evt);
                }
            }}
            onMouseOut={(evt) => {
                setHover(false);
                if (onMouseOut) {
                    onMouseOut(evt);
                }
            }}
            className={
                css`
                    display: inline-block;
                    padding: 8px;
                    cursor: ${disabled ? 'not-allowed' : 'pointer'};
                    border: 1px solid #aaa;
                    backgroundcolor: ${selected
                        ? 'rgba(150,150,150,0.4)'
                        : 'rgba(0,0,0,0.4)'};
                    fontsize: ${size ?? 40}px;
                    color: ${color ?? (selected ? 'black' : 'white')};
                    opacity: ${disabled ? 0.5 : 1};
                    lineheight: 0.5;
                    :hover {
                        backgroundcolor: rgba(50, 50, 50, 0.4);
                        border: 1px solid #fff;
                    }
                ` +
                ' ' +
                (className ?? '')
            }
            onClick={(evt) => {
                evt.stopPropagation();
                onClick();
            }}
        >
            {hover && hoverIcon ? hoverIcon : children}
        </div>
    );
};
