import React from 'react';
import { useEffect, useState } from 'react';

export const KeyMonitor = () => {
    const [latest, setLatest] = useState(null as null | string);

    useEffect(() => {
        const fn = (evt: KeyboardEvent) => {
            setLatest(evt.key);
        };
        document.addEventListener('keydown', fn, true);
        return () => document.removeEventListener('keydown', fn, true);
    }, []);

    if (!latest) return null;

    return (
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <div
                style={{
                    padding: 32,
                    fontSize: 32,
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    borderRadius: 8,
                }}
            >
                {latest}
            </div>
        </div>
    );
};
