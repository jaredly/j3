#!/usr/bin/env bun
import {
    existsSync,
    mkdirSync,
    readFileSync,
    readdirSync,
    statSync,
    writeFileSync,
} from 'fs';
import { IncomingMessage, createServer } from 'http';
import path from 'path';
import { NUIState } from './web/custom/UIState';
import { ListLikeContents, fromMCST, toMCST } from './src/types/mcst';
import { renderNodeToString } from './web/ide/ground-up/renderNodeToString';
import { layout } from './src/layout';
import { findTops } from './web/ide/ground-up/reduce';
import { bootstrap } from './web/ide/ground-up/Evaluators';
import { evaluatorFromText } from './web/ide/ground-up/loadEv';

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
    if (!state.evaluator || state.evaluator === ':repr:') return;
    if (state.evaluator === ':bootstrap:') {
        return `return {type: 'bootstrap', stmts: ${JSON.stringify(
            findTops(state)
                .map((stmt) =>
                    bootstrap.parse(fromMCST(stmt.top, state.map), {}),
                )
                .filter(Boolean),
            null,
            2,
        )}}`;
    }
    if (state.evaluator.endsWith('.json')) {
        const evjs = readFileSync(`data/tmp/${state.evaluator}.js`, 'utf-8');
        const ev = evaluatorFromText(evjs);
        if (ev?.toFile) {
            const res = ev.toFile(state);
            if (Object.keys(res.errors).length) {
                console.log(`Failed to turn to file`, res.errors);
                return;
            }
            console.log('Done to js');
            return res.js;
        }
    }
};

const serializeFile = (raw: string) => {
    const state: NUIState = JSON.parse(raw);
    const all = findTops(state);
    // const tops = (state.map[-1] as ListLikeContents).values;
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
        js: fileToJs(state),
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

createServer(async (req, res) => {
    console.log(nowString(), req.url, req.method);
    if (req.url?.includes('..')) {
        res.writeHead(404, {
            'Content-type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'content-type',
        });
        return res.end('Nope');
    }
    const full = path.join(base, req.url!);
    if (req.method === 'POST') {
        console.log('posting', full);
        if (!full.endsWith('.json')) {
            return res.end('Need an end ok');
        }
        mkdirSync(path.dirname(full), { recursive: true });
        const state = await readBody(req);
        writeFileSync(full, state);
        try {
            const { clj, js } = serializeFile(state);
            writeFileSync(full.replace('.json', '.clj'), clj);
            if (js) {
                writeFileSync(full + '.js', js);
            }
        } catch (err) {
            console.log('Agh what');
            console.error(err);
        }
        res.writeHead(200, {
            'Content-type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'content-type',
        });
        return res.end('Saved');
    }
    if (req.method === 'GET') {
        if (!existsSync(full)) {
            console.log('404 sorry', full);
            res.writeHead(404, {
                'Content-type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'content-type',
            });
            return res.end('Nope');
        }
        if (statSync(full).isDirectory()) {
            res.writeHead(200, {
                'Content-type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'content-type',
            });
            return res.end(JSON.stringify(readdirSync(full)));
        }
        const raw = readFileSync(full, 'utf-8');
        if (full.endsWith('.js')) {
            res.writeHead(200, {
                'Content-type': 'script/javascript',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'content-type',
            });
            return res.end(raw);
        }
        res.writeHead(200, {
            'Content-type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'content-type',
        });
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
