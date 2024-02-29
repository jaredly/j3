import React from 'react';
import { useLocalStorage } from '../../Debug';
import { stringify } from './reduce';

const ViewJson = ({ v }: { v: any[] }) => {
    const [level, setLevel] = useLocalStorage('view-json', () => 1);
    return (
        <div>
            <input
                type="range"
                min="1"
                max="30"
                style={{ width: 400 }}
                value={level}
                onChange={(evt) => setLevel(+evt.target.value)}
            />
            {v.map((item, i) => (
                <pre key={i}>{stringify(item, 1, 1 + level)}</pre>
            ))}
        </div>
    );
};
