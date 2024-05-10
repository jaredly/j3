// /**
//  * Ok this is our root class for explainers.
//  * Some things about explainers:
//  * - the files list is fixed
//  * - we set things up so you can use a server, or alternatively localforage
//  * - links ... I think we want `?` query strings instead of hashes. `pushstate` right?
//  */

// import { useEffect, useState } from 'react';
// import {
//     createBrowserRouter,
//     RouterProvider,
//   } from "react-router-dom";

// const router = createBrowserRouter([
// {
//     path: "/",
//     element: <Root />,
//     loader: rootLoader,
//     children: [
//     {
//         path: "team",
//         element: <Team />,
//         loader: teamLoader,
//     },
//     ],
// },
// ]);

// // Oh maybe I should use react-router? hmmmm
// export const Explainers = ({ files }: { files: string[] }) => {
//     const id = useState(location.search ? location.search.slice(1) : null);
//     useEffect(() => {
//         const fn = () => {};
//         location.replace;
//         window.addEventListener('hist');
//     });
// };
