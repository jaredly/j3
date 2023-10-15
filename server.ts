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
import { ListLikeContents, fromMCST } from './src/types/mcst';

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

const serializeFile = (state: NUIState) => {
    const tops = (state.map[-1] as ListLikeContents).values;
    return tops
        .map(
            (id) =>
                `;! ${JSON.stringify(
                    fromMCST(id, state.map),
                )}\npretty . print . lol`,
        )
        .join('\n');
};
const deserializeFile = (raw: string) => {
    const data: NUIState = JSON.parse(raw);
};

createServer(async (req, res) => {
    console.log('got', req.url, req.method);
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
        mkdirSync(path.dirname(full), { recursive: true });
        writeFileSync(full, await readBody(req));
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
        return res.end(readFileSync(full, 'utf-8'));
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
