import React, { useState } from 'react';
import { createRoot, Root } from 'react-dom/client';

import { App } from './App';
import { useHash } from '../../../web/ide/ground-up/useHash';
import { Examples } from './Examples';

const getRoot = (): Root => {
    // @ts-ignore
    return window._root ?? (window._root = createRoot(document.getElementById('root')!));
};

const Loader = () => {
    const hash = useHash()?.slice(1) || 'base';
    const namesRaw = localStorage['ow:tabs'];
    const names: string[] = namesRaw ? JSON.parse(namesRaw) : [hash];
    const [name, setName] = useState('');

    if (hash === 'examples') {
        return <Examples />;
    }

    return (
        <div style={{ display: 'flex', inset: 0, position: 'absolute', flexDirection: 'column' }}>
            <div style={{ padding: '8px 12px' }}>
                {names.map((name) => (
                    <a
                        href={'#' + name}
                        key={name}
                        style={{
                            marginRight: 8,
                            ...(name === hash
                                ? {
                                      //   backgroundColor: 'rgb(240,240,240)',
                                      color: 'black',
                                      textDecoration: 'none',
                                  }
                                : {}),
                        }}
                    >
                        {name}
                    </a>
                ))}
                <input
                    onKeyDown={(evt) => evt.stopPropagation()}
                    value={name}
                    onChange={(evt) => setName(evt.target.value)}
                    placeholder="New scratchpad"
                />
                <button
                    onClick={() => {
                        if (name !== '' && !names.includes(name)) {
                            names.push(name);
                            localStorage['ow:tabs'] = JSON.stringify(names);
                            location.hash = '#' + name;
                            setName('');
                        }
                    }}
                >
                    Create
                </button>
                <button
                    onClick={() => {
                        if (confirm('Really delete current scratchpad')) {
                            localStorage.removeItem(hash);
                            localStorage['ow:tabs'] = JSON.stringify(names.filter((n) => n !== hash));
                            setName('');
                        }
                    }}
                >
                    Delete
                </button>
            </div>
            <App key={hash} id={hash} />
        </div>
    );
};

getRoot().render(<Loader />);
