import * as React from 'react';
import { useParams } from 'react-router-dom';
import { useStore } from './StoreContext';

/*
ok new idea:
- RawCode has children, and it's the `ref`s.
    but they aren't rendered.
*/

const SuperRich = () => {
    // const [infos, setInfos] = React.useState(['// some code idk'] as Array<string | {
    //     loc: number,
    //     top: string
    // }>)

    const r = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        const node = r.current!;
        node.contentEditable = 'plaintext-only';
        node.textContent = 'Hello\nFolks';
        const sp = document.createElement('span');
        sp.textContent = 'red';
        sp.style.color = 'red';
        sp.contentEditable = 'false';
        node.append(sp);
        // node.addEventListener('input', () => {
        //     const text = node.textContent!
        // })
    }, []);

    return (
        <div>
            <div ref={r} />
            {/* {infos.map(info => (
                typeof info === 'string'
                ?
                <div contentEditable='plaintext-only' />
            ))} */}
        </div>
    );
};

export const Edit = () => {
    const params = useParams();
    const id = params.id;
    if (!id) throw new Error(`no id specified`);

    const store = useStore();
    // store.getState

    return (
        <div style={{ padding: 100 }}>
            Editing {id}
            <SuperRich />
        </div>
    );
};
