import React, { useEffect, useState } from 'react';
import { NUIState } from '../../custom/UIState';
import { Store } from '../../custom/store/Store';
import { Spinner } from './Spinner';
import { useGetStore } from '../../custom/store/StoreCtx';

export function ShowEvaluators({
    state,
    store,
    listing,
    id,
}: {
    state: NUIState;
    store: Store;
    listing: string[] | null;
    id: string;
}) {
    const pending = usePending();
    if (!state.evaluator)
        return evSelect(
            null,
            (id) =>
                store.dispatch({
                    type: 'config:evaluator',
                    id: id?.startsWith(':') ? id : id ? [id] : null,
                }),
            listing,
            true,
        );
    if (typeof state.evaluator === 'string') {
        return (
            <div>
                {evSelect(
                    state.evaluator,
                    (id) =>
                        store.dispatch({
                            type: 'config:evaluator',
                            id: id?.startsWith(':') ? id : id ? [id] : null,
                        }),
                    listing,
                    true,
                )}
            </div>
        );
    }

    return (
        <div>
            <div style={{ color: pending > 0 ? 'green' : 'white' }}>
                {pending > 0 ? <Spinner /> : null}
                {pending} pending requests
            </div>
            {state.evaluator.map((id, i) => (
                <div key={id}>
                    {evSelect(
                        id,
                        (id) => {
                            const ev = (state.evaluator as string[]).slice();
                            if (!id) {
                                ev.splice(i, 1);
                            } else {
                                ev[i] = id;
                            }
                            if (!ev.length)
                                return store.dispatch({
                                    type: 'config:evaluator',
                                    id: null,
                                });
                            store.dispatch({
                                type: 'config:evaluator',
                                id: ev,
                            });
                        },
                        listing,
                        false,
                    )}
                </div>
            ))}
            {evSelect(
                null,
                (id) => {
                    if (!id) return;
                    const ids = (state.evaluator as string[]).slice();
                    ids.push(id);
                    store.dispatch({ type: 'config:evaluator', id: ids });
                },
                listing,
                false,
            )}
        </div>
    );
}
const evSelect = (
    ev: string | null,
    onChange: (ev: string | null) => void,
    listing: string[] | null,
    simples: boolean,
) => {
    return (
        <select
            value={ev ?? ''}
            onChange={(evt) => {
                onChange(evt.target.value);
            }}
            data-what={ev}
        >
            <option value={''}>{ev ? 'Remove' : 'Add evaluator'}</option>
            {simples ? (
                <>
                    <option value={':repr:'}>REPR</option>
                    <option value={':bootstrap:'}>Bootstrap</option>
                    <option value={':js:'}>JavaScript</option>
                </>
            ) : null}
            {listing
                ?.filter((n) => n.endsWith('.js'))
                .map((name, i) => (
                    <option value={name} key={name}>
                        {name}
                    </option>
                ))}
        </select>
    );
};

export const usePending = () => {
    const store = useGetStore();
    const [state, setState] = useState(0);
    useEffect(() =>
        store.on('pending', (_, count) => {
            setState(count);
        }),
    );
    return state;
};
