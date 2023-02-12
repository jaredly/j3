import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import ubahn from 'react-ubahn';

// module.exports = {
//     define: {
//         'process.env': {},
//     },
// };

export default defineConfig({
    // plugins: [
    //     react({
    //         babel: {
    //             plugins: [ubahn],
    //         },
    //     }),
    // ],
    define: { 'process.env': {} },
});
