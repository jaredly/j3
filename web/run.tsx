import './poly';
import * as React from 'react';
import { createRoot, Root } from 'react-dom/client';
import { App } from './App';
import { Debug } from './Debug';

declare global {
    var root: Root;
}

window.root =
    window.root ||
    createRoot(
        (() => {
            const node = document.createElement('div');
            document.body.append(node);
            return node;
        })(),
    );

root.render(
    <React.StrictMode>
        {/* <App /> */}
        <Debug />
    </React.StrictMode>,
);
