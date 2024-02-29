import React, { useEffect, useMemo, useState } from 'react';
import { NUIState } from '../../custom/UIState';
import { debounce } from './reduce';
import { useHash, urlForId, saveState, loadState } from './reduce';
import { GroundUp } from './GroundUp';

export const Outside = () => {
    const [listing, setListing] = useState(null as null | string[]);
    const hash = useHash();

    useEffect(() => {
        fetch(urlForId(''))
            .then((res) => res.json())
            .then(setListing);
    }, []);

    const [name, setName] = useState('');

    if (hash) {
        return (
            <div>
                <div>
                    {listing
                        ?.filter((k) => !k.endsWith('.clj'))
                        .map((name) => (
                            <a
                                href={'#' + name}
                                key={name}
                                style={{
                                    display: 'inline-block',
                                    padding: '8px 16px',
                                    color:
                                        hash === '#' + name
                                            ? 'yellow'
                                            : 'white',
                                }}
                            >
                                {name}
                            </a>
                        ))}
                    <a
                        href={'#'}
                        style={{
                            display: 'inline-block',
                            padding: '8px 16px',
                            color: 'white',
                        }}
                    >
                        Close
                    </a>
                </div>
                <Loader id={hash.slice(1)} key={hash.slice(1)} />
            </div>
        );
    }

    return (
        <div>
            <h3 style={{ paddingLeft: 24 }}>Pick a file to open</h3>
            <div>
                {listing
                    ?.filter((k) => !k.endsWith('.clj'))
                    .map((name) => (
                        <a
                            href={'#' + name}
                            key={name}
                            style={{
                                padding: '8px 16px',
                                color: 'white',
                                display: 'inline-block',
                            }}
                        >
                            {name}
                        </a>
                    ))}
                <div
                    style={{
                        padding: '8px 16px',
                    }}
                >
                    <input
                        value={name}
                        onChange={(evt) => setName(evt.target.value)}
                        placeholder="New file name"
                    />

                    <a
                        href={name ? `#${name}` : ''}
                        style={{
                            padding: '8px 16px',
                            color: name.length ? 'white' : '#aaa',
                            cursor: name.length ? 'pointer' : 'not-allowed',
                        }}
                    >
                        New File
                    </a>
                </div>
            </div>
        </div>
    );
};

export const Loader = ({ id }: { id: string }) => {
    const save = useMemo(
        () => debounce<NUIState>((state) => saveState(id, state), 500),
        [id],
    );

    const [initial, setInitial] = useState(null as null | NUIState);

    useEffect(() => {
        fetch(urlForId(id)).then(
            (res) =>
                res.status === 200
                    ? res.json().then((state) => {
                          setInitial(loadState(state));
                      })
                    : setInitial(loadState()),
            (err) => {
                setInitial(loadState());
            },
        );
    }, [id]);

    if (!initial) return <div>Loading...</div>;

    return (
        <div>
            <GroundUp id={id} save={save} initial={initial} />
        </div>
    );
};
