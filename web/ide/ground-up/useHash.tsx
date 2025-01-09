import { useState, useEffect } from 'react';

export const useHash = (): string => {
    const [hash, update] = useState(location.hash);
    useEffect(() => {
        const fn = () => {
            update(location.hash);
        };
        window.addEventListener('hashchange', fn);
        return () => window.removeEventListener('hashchange', fn);
    }, []);
    return hash;
};
