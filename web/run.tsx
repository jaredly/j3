import './poly';
import * as React from 'react';
import { createRoot, Root } from 'react-dom/client';
import { App, updateIdxForStore } from './App';
import { Debug } from './Debug';
import localforage from 'localforage';
import { initialStore, Store } from './store';
import { parse, setIdx } from '../src/grammar';

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
