import { watch } from 'fs';
import { join } from 'path';

const bounce = (time: number, fn: () => unknown) => {
    let wait: null | Timer = null;
    return () => {
        if (wait != null) clearTimeout(wait);
        wait = setTimeout(() => fn(), time);
    };
};

let edited: string[] = [];
const rebuild = bounce(10, () => {
    console.log('rebuilding for', edited);
    edited = [];
    Promise.all([
        Bun.build({
            entrypoints: ['./one-world/client/cli/worker.ts'],
            outdir: './',
            naming: 'worker.js',
        }),
        Bun.build({
            entrypoints: ['./one-world/client/cli/xterm/run.ts'],
            outdir: './',
            naming: 'run.js',
        }),
    ])
        .then(([one, two]) => {
            console.log(one.logs, two.logs);
        })
        .catch((err) => {
            console.log('failed? idk');
        });
});

watch('.', { recursive: true }, (event, filename) => {
    if (filename.match(/\.tsx?$/)) {
        edited.push(filename);
        rebuild();
    } else {
        console.log('ignore', filename);
    }
});

const service = Bun.serve({
    async fetch(req) {
        let pathname = new URL(req.url).pathname;
        if (pathname === '/') {
            pathname = '/run.html';
        } else if (pathname.endsWith('/')) {
            pathname += 'index.html';
        }
        const file = Bun.file(join('.', pathname));
        return new Response(file);
    },
});

console.log(`Serving http://${service.hostname}:${service.port}`);
