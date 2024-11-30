import React from 'react';
import { createRoot, Root } from 'react-dom/client';

import { App } from './App';

const getRoot = (): Root => {
    // @ts-ignore
    return window._root ?? (window._root = createRoot(document.getElementById('root')!));
};

getRoot().render(<App />);
