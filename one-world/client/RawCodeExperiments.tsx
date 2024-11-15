// import * as React from 'react';
// import { useParams } from 'react-router-dom';
// import { useStore } from './StoreContext';
// import { CodeJar } from 'codejar';

// /*
// ok new idea:
// - RawCode has children, and it's the `ref`s.
//     but they aren't rendered.

// oooh you know what, I can also use this
// for exports. That's pretty nifty if you ask me.

// Ok sweet you can make this happen.

// */

// const Somewhat = () => {
//     const [text, setText] = React.useState('');
//     const r = React.useRef<HTMLDivElement>(null);

//     React.useEffect(() => {
//         const cj = CodeJar(r.current!, (el) => {
//             const refs: string[] = [];
//             // let's use the snowman emoji, for old times sake
//             // @ts-ignore
//             let html: string = Prism.highlight(
//                 el.textContent!.replace(/\$env\["([^"]+)"\]/g, (n, id) => {
//                     refs.push(id);
//                     return `$env_${refs.length - 1}`;
//                 }),
//                 // @ts-ignore
//                 Prism.languages.javascript,
//                 'javascript',
//             );
//             html = html.replace(
//                 /\$env_(\d+)/g,
//                 (n, id) =>
//                     `<span data-prefix="${
//                         refs[+id]
//                     }" contentEditable=false><span style="display:none">$env["${
//                         refs[+id]
//                     }"]</span></span>`,
//             );
//             el.innerHTML = html;
//         });
//     }, []);

//     return (
//         <div style={{ padding: 20 }}>
//             <div
//                 ref={r}
//                 style={{
//                     border: '1px solid #777',
//                     padding: 8,
//                 }}
//             />
//         </div>
//     );
// };

// const SuperRich = () => {
//     // const [infos, setInfos] = React.useState(['// some code idk'] as Array<string | {
//     //     loc: number,
//     //     top: string
//     // }>)

//     const r = React.useRef<HTMLDivElement>(null);

//     React.useEffect(() => {
//         const node = r.current!;
//         node.contentEditable = 'plaintext-only';
//         node.textContent = 'Hello\nFolks';
//         const sp = document.createElement('span');
//         sp.textContent = 'red';
//         sp.style.color = 'red';
//         sp.contentEditable = 'false';
//         node.append(sp);
//         // node.addEventListener('input', () => {
//         //     const text = node.textContent!
//         // })
//     }, []);

//     return (
//         <div>
//             <div ref={r} />
//             {/* {infos.map(info => (
//                 typeof info === 'string'
//                 ?
//                 <div contentEditable='plaintext-only' />
//             ))} */}
//         </div>
//     );
// };
