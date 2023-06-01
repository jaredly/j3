import { css } from '@linaria/core';
import * as React from 'react';

// from https://reactsvgicons.com/search?q=home

export function IconBxCheck(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="currentColor"
            height="1em"
            width="1em"
            {...props}
        >
            <path d="M10 15.586l-3.293-3.293-1.414 1.414L10 18.414l9.707-9.707-1.414-1.414z" />
        </svg>
    );
}

export function IconCancel(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="currentColor"
            height="1em"
            width="1em"
            {...props}
        >
            <path d="M12 2c5.5 0 10 4.5 10 10s-4.5 10-10 10S2 17.5 2 12 6.5 2 12 2m0 2c-1.9 0-3.6.6-4.9 1.7l11.2 11.2c1-1.4 1.7-3.1 1.7-4.9 0-4.4-3.6-8-8-8m4.9 14.3L5.7 7.1C4.6 8.4 4 10.1 4 12c0 4.4 3.6 8 8 8 1.9 0 3.6-.6 4.9-1.7z" />
        </svg>
    );
}

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

import { styled } from '@linaria/react';
const Ico = styled.div`
    display: inline-block;
    padding: 8px;
    border: 1px solid #aaa;
    border: none;
    cursor: ${(props: any) => (props.disabled ? 'not-allowed' : 'pointer')};
    background-color: ${(props: any) =>
        props.selected ? 'rgba(150,150,150,0.4)' : 'rgba(0, 0, 0, 0.4)'};
    line-height: 0.5;
    font-size: ${(props: any) => props.size ?? 40};
    color: ${(props: any) =>
        props.color ?? (props.selected ? 'black' : 'white')};
    opacity: ${(props: any) => (props.disabled ? 0.5 : 1)};

    :hover {
        background-color: rgba(50, 50, 50, 0.4);
        border: 1px solid #fff;
        border: none;
    }
`;

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
        <Ico
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
            style={{}}
            className={css`` + ' ' + (className ?? '')}
            onClick={(evt) => {
                evt.stopPropagation();
                onClick();
            }}
        >
            {hover && hoverIcon ? hoverIcon : children}
        </Ico>
    );
};
