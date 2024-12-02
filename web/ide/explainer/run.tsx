import React from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { router } from './router';

// @ts-ignore
window.root =
    // @ts-ignore
    window.root ||
    createRoot(
        (() => {
            const node = document.createElement('div');
            document.body.append(node);
            return node;
        })(),
    );

// @ts-ignore
window.root.render(<RouterProvider router={router} />);
