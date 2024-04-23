import React from 'react';
import { SearchResults } from './GroundUp';

export const ShowSearchResults = ({ results }: { results: SearchResults }) => {
    return (
        <div
            style={{
                position: 'fixed',
                top: 24,
                right: 24,
                border: '1px solid white',
                padding: 24,
            }}
        >
            Ok
        </div>
    );
};
