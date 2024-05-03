import React, { useState } from 'react';
import { NUIState, RealizedNamespace } from './UIState';
import { plugins } from './plugins';
import { useGetStore, useSubscribe } from './store/StoreCtx';
import { fromMCST } from '../../src/types/mcst';
import { clipboardPrefix, clipboardSuffix } from './ByHand';
import { NSExport } from '../../src/state/clipboard';
import { Store } from './store/Store';
import { displayFunctionIds } from './store/displayFunction';

export const exportNs = (id: number, state: NUIState) => {
    const ns = state.nsMap[id] as RealizedNamespace;
    const res: NSExport = {
        top: fromMCST(ns.top, state.map),
        children: ns.children.map((id) => exportNs(id, state)),
    };
    return res;
};

const sectionStyle = {
    padding: '8px 12px',
    fontSize: '80%',
    fontWeight: 'bold',
    fontStyle: 'italic',
} as const;

const buttonStyle = {
    fontFamily: 'inherit',
    padding: '8px 12px',
    // background: sel === i ? '#333' : 'none',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: 'inherit',
    textAlign: 'left',
    // display: 'flex',
    // flexDirection: 'column',
    // alignItems: 'center',
    // fontFamily: 'Jet Brains',
} as const;

export function NSMenu({
    mref,
    setCM,
    ns,
    setPin,
}: {
    mref: React.RefObject<HTMLDivElement>;
    setCM: React.Dispatch<React.SetStateAction<boolean>>;
    ns: RealizedNamespace;
    setPin: (pin: number | null) => void;
}) {
    const store = useGetStore();
    const items = useSubscribe(
        () => {
            return getItems(store, ns, setPin);
        },
        (fn) => store.onChange('ns:' + ns.id, fn),
        [ns.id],
    );
    const [hover, setHover] = useState(null as null | number);

    return (
        <div
            ref={mref}
            onMouseDown={(evt) => evt.stopPropagation()}
            onClick={() => setCM(false)}
            style={{
                color: 'white',
                cursor: 'default',
                zIndex: 1000,
                position: 'absolute',
                width: 200,
                top: 0,
                left: 0,
                backgroundColor: 'black',
                border: '1px solid #aaa',
                display: 'flex',
                flexDirection: 'column',
            }}
        >
            {items.map((item, i) =>
                item.type === 'section' ? (
                    <div key={i} style={sectionStyle}>
                        {item.text}
                    </div>
                ) : (
                    <button
                        key={i}
                        onMouseEnter={() => setHover(i)}
                        onMouseLeave={() => setHover(null)}
                        style={{
                            ...buttonStyle,
                            background: item.selected
                                ? '#444'
                                : hover === i
                                ? '#333'
                                : 'none',
                            cursor: item.selected ? 'default' : 'pointer',
                        }}
                        onClick={item.action}
                    >
                        {item.name}
                    </button>
                ),
            )}
        </div>
    );
}

const getItems = (
    store: Store,
    ns: RealizedNamespace,
    setPin: (pin: number | null) => void,
): MenuItem[] => {
    const current =
        typeof ns.plugin === 'string'
            ? ns.plugin
            : ns.plugin
            ? ns.plugin.id
            : null;
    return [
        {
            type: 'action',
            name: 'Copy tree',
            action() {
                navigator.clipboard.write([copyNsItem(ns, store.getState())]);
            },
        },
        {
            type: 'action',
            name: 'Pin To Bottom',
            action() {
                setPin(ns.id);
            },
        },
        { type: 'section', text: 'Set plugin' },
        ...plugins.map(
            (plugin): MenuItem => ({
                type: 'action',
                name: `> ${plugin.title}`,
                selected: plugin.id === current,
                action() {
                    if (plugin.id === current) return;
                    store.dispatch({
                        type: 'ns',
                        nsMap: {
                            [ns.id]: {
                                ...ns,
                                plugin: { id: plugin.id, options: null },
                            },
                        },
                    });
                },
            }),
        ),
        {
            type: 'action',
            name: '> No plugin',
            selected: !current,
            action() {
                if (!current) return;
                store.dispatch({
                    type: 'ns',
                    nsMap: {
                        [ns.id]: { ...ns, plugin: undefined },
                    },
                });
            },
        },
        { type: 'section', text: 'Set Render Function' },
        ...displayFunctionIds.map(
            (id): MenuItem => ({
                type: 'action',
                name: '> ' + (id === null ? 'Default' : id),
                selected: ns.display?.id == id,
                action() {
                    store.dispatch({
                        type: 'ns',
                        nsMap: {
                            [ns.id]: {
                                ...ns,
                                display:
                                    id === null
                                        ? undefined
                                        : { id, options: null },
                            },
                        },
                    });
                },
            }),
        ),
    ];
};

type MenuItem =
    | { type: 'section'; text: string }
    | { type: 'action'; name: string; selected?: boolean; action: () => void };
function copyNsItem(ns: RealizedNamespace, state: NUIState) {
    const exported = exportNs(ns.id, state);
    const text = JSON.stringify([
        {
            type: 'ns',
            items: [exported],
        },
    ]);
    const item = new ClipboardItem({
        ['text/plain']: new Blob([text], {
            type: 'text/plain',
        }),
        ['text/html']: new Blob(
            [clipboardPrefix + text + clipboardSuffix + `Copied a namespace`],
            { type: 'text/html' },
        ),
    });
    return item;
}
