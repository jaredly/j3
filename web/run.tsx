import './poly';
import * as React from 'react';
import { createRoot, Root } from 'react-dom/client';
import { App } from './App';
import ubahn from 'react-ubahn/runtime';
import { Markdown } from './old/Markdown';

ubahn.disable();

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
        <App />
    </React.StrictMode>,
);
