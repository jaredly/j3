import React from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { createBrowserRouter } from 'react-router-dom';

import { Browse } from './Browse';
// import { Edit } from './Edit';
// import { StoreProvider } from './StoreProvider';

// export const router = createBrowserRouter([
//     {
//         path: '/',
//         element: <Browse />,
//     },
//     {
//         path: '/browse/:path',
//         element: <Browse />,
//     },
//     {
//         path: '/edit/:id',
//         element: <Edit />,
//         index: true,
//     },
// ]);

window.root =
    window.root ||
    createRoot(
        (() => {
            const node = document.createElement('div');
            document.body.append(node);
            return node;
        })(),
    );

// window.root.render(
//     <StoreProvider>
//         <RouterProvider router={router} />
//     </StoreProvider>,
// );
