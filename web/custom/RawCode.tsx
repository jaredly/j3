import React from 'react';
import { Path } from '../../src/state/path';
import { ReactCodeJar } from 'react-codejar';
import { useGetStore } from './store/StoreCtx';

export const RawCode = ({
    initial,
    lang,
    path,
    idx,
}: {
    initial: string;
    lang: string;
    path: Path[];
    idx: number;
}) => {
    const store = useGetStore();

    return (
        <div className="rich-text">
            {/* <textarea defaultValue={initial} /> */}
            <ReactCodeJar
                code={initial}
                highlight={() => {}}
                style={{}}
                // lineNumbers
                onUpdate={(code) => {
                    store.dispatch({
                        type: 'update',
                        map: {
                            [idx]: {
                                type: 'raw-code',
                                lang,
                                raw: code,
                                loc: idx,
                            },
                        },
                        selection: path.concat([
                            { type: 'rich-text', idx, sel: null },
                        ]),
                    });
                }}
            />
        </div>
    );
};
