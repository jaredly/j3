#!/usr/bin/env bun
import {
    copyFileSync,
    existsSync,
    mkdirSync,
    readFileSync,
    readdirSync,
    statSync,
    unlinkSync,
    writeFileSync,
} from 'fs';
import { IncomingMessage, createServer } from 'http';
import path from 'path';
import { NUIState } from './web/custom/UIState';
import { ListLikeContents, fromMCST, toMCST } from './src/types/mcst';
import { renderNodeToString } from './web/ide/ground-up/renderNodeToString';
import { layout } from './src/layout';
import { findTops } from './web/ide/ground-up/findTops';
import { bootstrap } from './web/ide/ground-up/Evaluators';
import { evaluatorFromText } from './web/ide/ground-up/loadEv';
import { compressState } from './web/custom/compressState';
import { stateToBootstrapJs } from './web/ide/ground-up/to-file';
import { ResultsCache } from './web/custom/store/ResultsCache';

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

const fileToJs = (state: NUIState) => {
    if (!state.evaluator) return;

    if (!state.evaluator || state.evaluator === ':repr:') return;

    try {
        const evaluator =
            state.evaluator === ':bootstrap:'
                ? bootstrap
                : Array.isArray(state.evaluator)
                ? evaluatorFromText(
                      state.evaluator.join(':'),
                      state.evaluator.map((id) =>
                          readFileSync(
                              `data/tmp/${
                                  id + (id.endsWith('.js') ? '' : '.js')
                              }`,
                              'utf-8',
                          ),
                      ),
                  )
                : null;

        return evaluator?.toFile?.(state).js;
    } catch (err) {
        console.log('Couldnt evaluator to js');
        console.log(err);
        return;
    }

    // if (state.evaluator === ':bootstrap:') {
    //     return stateToBootstrapJs(state);
    // }
    // if (Array.isArray(state.evaluator)) {
    //     const text = state.evaluator.map((id) =>
    //         readFileSync(
    //             `data/tmp/${id + (id.endsWith('.js') ? '' : '.js')}`,
    //             'utf-8',
    //         ),
    //     );
    //     try {
    //         const ev = evaluatorFromText(state.evaluator.join(':'), text);
    //         if (ev?.toFile) {
    //             try {
    //                 const res = ev.toFile(state);
    //                 if (Object.keys(res.errors).length) {
    //                     console.log(`Failed to turn to file`, res.errors);
    //                     return;
    //                 }
    //                 return res.js;
    //             } catch (err) {
    //                 console.log('Failed to do turn file to js');
    //                 return;
    //             }
    //         }
    //     } catch (err) {
    //         console.log('Couldnt make an evaluator');
    //         console.log(err);
    //         return;
    //     }
    // }
};

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

        let { state, cache }: { state: NUIState; cache?: ResultsCache<any> } =
            JSON.parse(await readBody(req));
        const last = state.history[state.history.length - 1].ts;
        state = compressState(state);

        const raw = JSON.stringify(state);
        if (existsSync(full)) {
            const prev: NUIState = JSON.parse(readFileSync(full, 'utf-8'));
            const plast = prev.history[prev.history.length - 1];
            if (plast.ts > last) {
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
        if (cache) {
            writeFileSync(cacheFile, JSON.stringify(cache));
        } else if (existsSync(cacheFile)) {
            unlinkSync(cacheFile);
        }

        writeFileSync(full, raw);
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
            return res.end('Nope');
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
