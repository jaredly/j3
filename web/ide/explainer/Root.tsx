import React from 'react';
import { Link, Outlet, useParams } from 'react-router-dom';
import { pages } from './pages';

export const Root = () => {
    const { page } = useParams();
    return (
        <div
            style={{
                display: 'flex',
            }}
        >
            <div
                style={
                    {
                        // padding: 8,
                    }
                }
            >
                {pages.map((name) => (
                    <Link
                        to={'/' + name.id}
                        key={name.id}
                        style={{
                            padding: 8,
                            cursor: 'pointer',
                            display: 'block',
                            background:
                                page === name.id ||
                                (!page && name.id === 'intro')
                                    ? '#333'
                                    : 'none',
                            color: 'white',
                            textDecorationColor: '#333',
                        }}
                    >
                        {name.title}
                    </Link>
                ))}
            </div>
            <div style={{ flex: 1 }}>
                <Outlet />
            </div>
        </div>
    );
};
