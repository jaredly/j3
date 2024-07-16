import { useState, useRef, useEffect } from 'react';

const blinkTime = 500;
const blinkWait = 200;
// export const useBlink = () => {
//     const [blink, setBlink] = useState(true);
//     const bid = useRef(null as null | Timer);
//     const [blinkHide, setBlinkHide] = useState(false);
//     useEffect(() => {
//         if (!blink) return;
//         setBlinkHide(false);
//         let iv: Timer;
//         let it = setTimeout(() => {
//             setBlinkHide(true);
//             iv = setInterval(() => {
//                 setBlinkHide((h) => !h);
//             }, blinkTime);
//         }, blinkTime - blinkWait);
//         return () => {
//             clearInterval(iv);
//             clearTimeout(it);
//         };
//     }, [blink]);

//     const resetBlink = () => {
//         setBlink(false);
//         clearTimeout(bid.current!);
//         bid.current = setTimeout(() => setBlink(true), blinkWait);
//     };

//     return { blink: blink && blinkHide, resetBlink };
// };
