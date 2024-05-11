import React from 'react';
import { createBrowserRouter } from 'react-router-dom';
import { Root } from './Root';
import { Page, pageLoader } from './Page';
import { Outside } from '../ground-up/Outside';
import { pages } from './pages';

export const router = createBrowserRouter([
    {
        path: '/',
        element: <Root />,
        children: [
            { index: true, element: <Page />, loader: pageLoader },
            {
                path: 'edit',
                element: (
                    <Outside override={pages.map((p) => p.id + '.json')} />
                ),
            },
            {
                path: ':page',
                element: <Page />,
                index: true,
                loader: pageLoader,
            },
        ],
    },
]);
