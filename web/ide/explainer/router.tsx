import React from 'react';
import { Outlet, createBrowserRouter } from 'react-router-dom';
import { Root } from './Root';
import { Page, pageLoader } from './Page';
import { Outside } from '../ground-up/Outside';
import { pages } from './pages';

export const router = createBrowserRouter([
    {
        path: '/',
        element: (
            <div>
                <Outlet />
            </div>
        ),
        children: [
            {
                path: 'edit',
                element: (
                    <Outside override={pages.map((p) => p.id + '.json')} />
                ),
            },
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
        ],
    },
]);
