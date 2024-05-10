import * as React from 'react';

export const Spinner = ({ size = 5 }: { size?: number }) => (
    <svg
        width={size * 2.4}
        height={size * 2.4}
        viewBox={`0 0 ${size * 2.4} ${size * 2.4}`}
        xmlns="http://www.w3.org/2000/svg"
        style={{ marginRight: 8 }}
    >
        <style>
            {`.spinner_9Mto {animation:spinner_5GqJ 1.6s linear infinite;animation-delay:-1.6s}
            .spinner_bb12 {animation-delay:-1s}
            @keyframes spinner_5GqJ{
                12.5%{x:${size * 1.3}px;y:1px}
                25%{x:${size * 1.3}px;y:1px}
                37.5%{x:${size * 1.3}px;y:${size * 1.3}px}
                50%{x:${size * 1.3}px;y:${size * 1.3}px}
                62.5%{x:1px;y:${size * 1.3}px}
                75%{x:1px;y:${size * 1.3}px}
                87.5%{x:1px;y:1px}
            }`}
        </style>
        <rect
            className="spinner_9Mto"
            x="1"
            y="1"
            rx="1"
            fill="currentColor"
            width={size}
            height={size}
        />
        <rect
            className="spinner_9Mto spinner_bb12"
            x="1"
            y="1"
            rx="1"
            fill="currentColor"
            width={size}
            height={size}
        />
    </svg>
);
