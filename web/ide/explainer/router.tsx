import React from 'react';
import { createBrowserRouter } from 'react-router-dom';
import { Root } from './Root';
import { Page, pageLoader } from './Page';

export const router = createBrowserRouter([
    {
        path: '/',
        element: <Root />,
        children: [
            { index: true, element: <Page />, loader: pageLoader },
            {
                path: ':page',
                element: <Page />,
                index: true,
                loader: pageLoader,
            },
        ],
    },
]);
