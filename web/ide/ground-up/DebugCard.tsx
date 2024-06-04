import React, { useEffect, useState } from 'react';
import { NUIState } from '../../custom/UIState';
import { Store } from '../../custom/store/Store';
import { RenderTraces } from './renderTraces';
import { ShowEvaluators } from './ShowEvaluators';
import { ShowAt } from './ShowAt';
import { ShowErrors } from './ShowErrors';
import { collectErrors } from './collectErrors';
import { Debug, WithStore } from './GroundUp';

export function Commit() {
	const [data, setData] = useState(null)
return <div>
	<button onClick={() => {
		fetch('/data/commit').then(t => t.text()).then(d => setData(d));
	}}>Get Info</button>
	{data ? <pre>{data}<button onClick={() => setData(null)}>Clear</button></pre> : null}
	<button onClick={() => {
		fetch('/data/commit', {method: 'POST', data: 'a message idk'})
			.then(res => {
		console.log(res)
		if (res.status !== 200) alert('what commit failed')
setData(null)
			});
	}}>Do the commit</button>
</div>
}

export function DebugCard({
    debug,
    setDebug,
    store,
    state,
    listing,
    id,
    size,
}: {
    debug: Debug;
    setDebug: React.Dispatch<React.SetStateAction<Debug>>;
    store: Store;
    state: NUIState;
    listing: string[] | null;
    id: string;
    size: number;
}) {
    const [show, setShow] = useState(false);
    useEffect(() => {
        store.setDebug(debug.execOrder, debug.disableEvaluation, debug.showJs);
    }, [debug.execOrder, debug.disableEvaluation, debug.showJs]);

    const errors = collectErrors(store);
    const [hide, setHide] = useState(false);

    return (
        <div
            style={{
                position: 'fixed',
                top: 60,
                right: 4,
                // @ts-ignore
                backgroundColor: store.dispatch === store.reg ? 'red' : '#222',
                padding: show || errors.length ? 16 : 0,
                maxHeight: 'calc(100vh - 60px)',
                display: 'flex',
                flexDirection: 'column',
            }}
        >
            <button
                style={{
                    fontFamily: 'inherit',
                    color: 'inherit',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: 8,
                }}
                onClick={() => setShow(!show)}
            >
                Debug Card
            </button>
            {show || (errors.length && !hide) ? (
                <>
                    {(
                        [
                            'ids',
                            'selection',
                            'execOrder',
                            'showJs',
                            'disableEvaluation',
                        ] as const
                    ).map((k) => (
                        <div key={k}>
                            <label>
                                <input
                                    type="checkbox"
                                    checked={debug[k]}
                                    onChange={() =>
                                        setDebug({ ...debug, [k]: !debug[k] })
                                    }
                                />
                                {' ' + k}
                            </label>
                        </div>
                    ))}
                    <WithStore store={store}>
                        <div>
                            <ShowEvaluators
                                state={state}
                                store={store}
                                listing={listing}
                                id={id}
                            />
                        </div>
                        <div>Size: {size}</div>
                        <div style={{ flex: 1, overflow: 'auto' }}>
                            {debug.selection ? (
                                <ShowAt at={state.at} hover={state.hover} />
                            ) : null}
                            <ShowErrors hide={hide} setHide={setHide} />
                            <RenderTraces />
                        </div>
                    </WithStore>
                </>
            ) : null}
<Commit />
        </div>
    );
}


