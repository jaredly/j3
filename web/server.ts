#!/usr/bin/env bun
import {
    existsSync,
    mkdirSync,
    readFileSync,
    readdirSync,
    renameSync,
    statSync,
    writeFileSync,
} from 'fs';
import { IncomingMessage, createServer } from 'http';
import path from 'path';
import { layout } from '../src/old-layout';
import { toMCST } from '../src/types/mcst';
import { NUIState } from './custom/UIState';
import { compressState } from './custom/compressState';
import { findTops } from './ide/ground-up/findTops';
import { renderNodeToString } from './ide/ground-up/renderNodeToString';

const base = path.join(__dirname, 'data');

const readBody = (readable: IncomingMessage) => {
    return new Promise<string>((res) => {
        const chunks: string[] = [];

        readable.on('readable', () => {
            let chunk;
            while (null !== (chunk = readable.read())) {
                chunks.push(chunk);
            }
        });

        readable.on('end', () => {
            const content = chunks.join('');
            res(content);
        });
    });
};

// const fileToJs = (state: NUIState) => {
//     if (!state.evaluator) return;

//     if (!state.evaluator || state.evaluator === ':repr:') return;

//     try {
//         const evaluator =
//             state.evaluator === ':bootstrap:'
//                 ? bootstrap
//                 : Array.isArray(state.evaluator)
//                 ? evaluatorFromText(
//                       state.evaluator.join(':'),
//                       state.evaluator.map((id) =>
//                           readFileSync(
//                               `data/tmp/${
//                                   id + (id.endsWith('.js') ? '' : '.js')
//                               }`,
//                               'utf-8',
//                           ),
//                       ),
//                   )
//                 : null;

//         return evaluator?.toFile?.(state).js;
//     } catch (err) {
//         console.log('Couldnt evaluator to js');
//         console.log(err);
//         return;
//     }
// };

const serializeFile = (state: NUIState) => {
    const all = findTops(state);
    const display = {};
    all.map((top) => {
        try {
            layout(top.top, 0, state.map, display, {}, true);
        } catch (err) {
            console.log('Failed to handle' + top);
        }
    });

    return {
        clj: all
            .map((id) => renderNodeToString(id.top, state.map, 0, display))
            .join('\n\n')
            .replaceAll(/[“”]/g, '"'),
        // js: fileToJs(state),
    };
};

const deserializeFile = (raw: string) => {
    if (!raw.startsWith(';!')) {
        const data: NUIState = JSON.parse(raw);
        return data;
    }
    const lines = raw.split('\n');
    const tops: number[] = [];
    const map: NUIState['map'] = {
        [-1]: { type: 'list', loc: -1, values: tops },
    };
    let state: NUIState;
    lines.forEach((line) => {
        if (line.startsWith(';!! ')) {
            try {
                state = JSON.parse(line.slice(4));
            } catch (err) {
                console.warn(err);
                throw err;
            }
        } else if (line.startsWith(';! ')) {
            try {
                const node = JSON.parse(line.slice(3));
                tops.push(toMCST(node, map));
            } catch (err) {
                console.warn(err);
                throw err;
            }
        }
    });
    state!.map = map;
    return state!;
};

const nowString = () => {
    const now = new Date();
    return `[${now.getHours()}:${now
        .getMinutes()
        .toString()
        .padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${now
        .getMilliseconds()
        .toString()
        .padStart(3, '0')}]`;
};

const headers = (mime: string) => ({
    'Content-type': mime,
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'content-type',
});

createServer(async (req, res) => {
    console.log(nowString(), req.url, req.method);
    if (req.url?.includes('..')) {
        res.writeHead(404, headers('application/json'));
        return res.end('Nope');
    }
    const full = path.join(base, req.url!);

    if (req.method === 'POST') {
        if (!req.url!.startsWith('/tmp/')) {
            res.writeHead(400, headers('text/plain'));
            return res.end('Not in the tmp directory: ' + req.url!);
        }

        console.log('posting', full);
        if (full.endsWith('.js')) {
            res.writeHead(200, headers('text/plain'));
            writeFileSync(full, await readBody(req));
            return res.end('Saved ' + req.url!);
        }
        if (!full.endsWith('.json')) {
            res.writeHead(400, headers('text/plain'));
            return res.end('Need an end ok');
        }

        mkdirSync(path.dirname(full), { recursive: true });

        let state: NUIState = JSON.parse(await readBody(req));
        const last = state.history[state.history.length - 1].ts;
        try {
            state = compressState(state);
        } catch (err) {
            console.warn(`Couldn't compress state!`);
            console.error(err);
            console.log('^ ignoring the above error');
        }

        const raw = JSON.stringify(state);
        if (existsSync(full)) {
            const prev: NUIState = JSON.parse(readFileSync(full, 'utf-8'));
            const plast = prev.history[prev.history.length - 1];
            if (plast && plast.ts > last) {
                console.warn(
                    `AHH we lost some history somehow: plast vs last: `,
                    plast.ts - last,
                    // 'items',
                );
                writeFileSync(full + '.bad-' + Date.now(), raw);
                res.writeHead(400, headers('text/plain'));
                return res.end('History regression!');
            }
        }

        const cacheFile = full + '.cache';
        // if (cache) {
        //     writeFileSync(cacheFile, JSON.stringify(cache));
        // } else if (existsSync(cacheFile)) {
        //     unlinkSync(cacheFile);
        // }

        // Two step to get around the laptop hard-stopping when the battery gives out
        writeFileSync(full + '.next', raw);
        renameSync(full + '.next', full);

        try {
            const { clj } = serializeFile(state);
            writeFileSync(full.replace('.json', '.clj'), clj);
            // if (js) {
            //     writeFileSync(full + '.js', js);
            // }
        } catch (err) {
            console.log('Agh what');
            console.error(err);
        }
        res.writeHead(200, headers('text/plain'));
        return res.end('Saved ' + req.url!);
    }

    if (req.method === 'GET') {
        if (!existsSync(full)) {
            console.log('404 sorry', full);
            res.writeHead(404, headers('application/json'));
            return res.end('File does not exist: ' + full);
        }
        if (statSync(full).isDirectory()) {
            res.writeHead(200, headers('application/json'));
            return res.end(JSON.stringify(readdirSync(full)));
        }
        const raw = readFileSync(full, 'utf-8');
        if (full.endsWith('.js')) {
            res.writeHead(200, headers('script/javascript'));
            return res.end(raw);
        }
        res.writeHead(200, headers('application/json'));
        const v = deserializeFile(raw);
        return res.end(JSON.stringify(v));
    }
    if (req.method === 'OPTIONS') {
        res.writeHead(200, {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET,POST',
            'Access-Control-Allow-Headers': 'content-type',
        });
        return res.end();
    }
    console.log('what', req.method);
}).listen(9189);
console.log(`http://localhost:9189`);
