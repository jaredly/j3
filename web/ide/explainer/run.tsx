import React from 'react';
import { useEffect, useState } from 'react';
import ReactDOM, { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { router } from './router';

window.root =
    window.root ||
    createRoot(
        (() => {
            const node = document.createElement('div');
            document.body.append(node);
            return node;
        })(),
    );

window.root.render(<RouterProvider router={router} />);