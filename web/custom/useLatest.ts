import { useRef } from 'react';

export const useLatest = <T,>(v: T) => {
    const r = useRef(v);
    r.current = v;
    return r;
};
