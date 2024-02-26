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

const serializeFile = (raw: string) => {
    const state: NUIState = JSON.parse(raw);
    const tops = (state.map[-1] as ListLikeContents).values;
    const display = {};
    tops.map((top) => {
        layout(top, 0, state.map, display, {}, true);
    });

    return tops
        .map((id) => renderNodeToString(id, state.map, 0, display))
        .join('\n\n')
        .replaceAll(/[“”]/g, '"');
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
        writeFileSync(full.replace('.json', '.clj'), serializeFile(state));
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
        res.writeHead(200, {
            'Content-type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'content-type',
        });
        const raw = readFileSync(full, 'utf-8');
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
