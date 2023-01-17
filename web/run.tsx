import './poly';
import * as React from 'react';
import { createRoot, Root } from 'react-dom/client';
import { App } from './App';
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

localforage.getItem('j3:app').then((value) => {
    if (value) {
        let mx = Object.keys((value as Store).map).reduce(
            (mx, k) => Math.max(mx, parseInt(k)),
            0,
        );
        setIdx(mx + 1);
    } else {
        value = initialStore(parse(`(def hello 23)`));
    }
    root.render(
        <React.StrictMode>
            <App store={value as Store} />
            {/* <Debug /> */}
        </React.StrictMode>,
    );
});
