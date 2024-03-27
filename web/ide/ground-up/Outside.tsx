import React, { useEffect, useMemo, useRef, useState } from 'react';
import { NUIState } from '../../custom/UIState';
import { debounce } from './reduce';
import { useHash, urlForId, saveState, loadState } from './reduce';
import { GroundUp } from './GroundUp';
import { useLocalStorage } from '../../Debug';

export const Outside = () => {
    const [listing, setListing] = useState(null as null | string[]);
    const hash = useHash();

    const [recent, setRecent] = useLocalStorage<
        { title: string; access: number }[]
    >('recent', () => []);

    useEffect(() => {
        fetch(urlForId(''))
            .then((res) => res.json())
            .then((list) => setListing(list.sort()));
    }, []);
    useEffect(() => {
        const title = hash.slice(1);
        if (!recent.find((f) => f.title === title)) {
            setRecent((r) => r.concat([{ title, access: Date.now() }]));
        }
    }, [hash]);

    const [name, setName] = useState('');

    if (hash) {
        return (
            <div>
                <div
                    style={{
                        position: 'sticky',
                        top: 0,
                        backgroundColor: 'black',
                        zIndex: 100,
                    }}
                >
                    {recent.map(({ title }) => (
                        <span key={title}>
                            <a
                                href={'#' + title}
                                style={{
                                    display: 'inline-block',
                                    padding: '8px 0px 8px 16px',
                                    color:
                                        hash === '#' + title
                                            ? 'yellow'
                                            : 'white',
                                    textDecoration:
                                        hash === '#' + title
                                            ? 'none'
                                            : 'underline',
                                }}
                            >
                                {title}
                            </a>
                            <button
                                onClick={() => {
                                    setRecent((r) =>
                                        r.filter((r) => r.title !== title),
                                    );
                                    // location.hash = '';
                                }}
                                style={{
                                    border: 'none',
                                    background: 'transparent',
                                    color: 'inherit',
                                    cursor: 'pointer',
                                }}
                            >
                                &times;
                            </button>
                        </span>
                    ))}
                    <select
                        style={{ marginLeft: 16 }}
                        value=""
                        onChange={(evt) => {
                            const title = evt.target.value;
                            // setRecent(r => r.filter(r => r.title !== title).concat([{title, access: Date.now()}]))
                            document.location.hash = '#' + title;
                        }}
                    >
                        <option value="">Open file</option>
                        {listing
                            ?.filter((k) => k.endsWith('.json'))
                            .filter((k) => !recent.find((f) => f.title === k))
                            .map((file) => (
                                <option key={file} value={file}>
                                    {file}
                                </option>
                            )) ?? null}
                    </select>
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
                <Loader
                    id={hash.slice(1)}
                    key={hash.slice(1)}
                    listing={listing}
                />
            </div>
        );
    }

    return (
        <div>
            <h3 style={{ paddingLeft: 24 }}>Pick a file to open</h3>
            <div>
                {listing
                    ?.filter((k) => k.endsWith('.json'))
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

const onlyLast = <T,>(fn: (arg: T) => void, time: number, longTime: number) => {
    let last = Date.now();
    let tid: Timer | null = null;
    return (arg: T) => {
        if (tid != null) clearTimeout(tid);
        const now = Date.now();
        if (now - last > longTime) {
            last = now;
            return fn(arg);
        }
        tid = setTimeout(() => {
            tid = null;
            last = Date.now();
            fn(arg);
        }, time);
    };
};

let lastSaveTime = Date.now();
export const Loader = ({
    id,
    listing,
}: {
    id: string;
    listing: null | string[];
}) => {
    const latest = useRef<NUIState | null>(null);

    const save = useMemo(
        () =>
            onlyLast<NUIState>(
                (state) => {
                    const now = Date.now();
                    // console.log(`Time since last save`, now - lastSaveTime);
                    if (now - lastSaveTime < 200) {
                        throw new Error(`saving too fast???`);
                    }
                    lastSaveTime = now;
                    latest.current = state;
                    return saveState(id, state);
                },
                // minimum time after last change
                500,
                // maximum time between saves
                // if they're coming rapid fire
                10000,
            ),
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
            <button
                onClick={() => {
                    const id = prompt('Clone name');
                    if (id && id.endsWith('.json')) {
                        saveState(id, latest.current!).then(
                            () => (location.hash = '#' + id),
                        );
                    }
                }}
            >
                Clone
            </button>
            <GroundUp id={id} listing={listing} save={save} initial={initial} />
        </div>
    );
};
