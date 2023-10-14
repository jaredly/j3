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

createServer(async (req, res) => {
    if (req.url?.includes('..')) {
        res.writeHead(404);
        return res.end('Nope');
    }
    const full = path.join(base, req.url!);
    if (req.method === 'POST') {
        mkdirSync(path.dirname(full), { recursive: true });
        writeFileSync(full, await readBody(req));
    }
    if (req.method === 'GET') {
        if (!existsSync(full)) {
            res.writeHead(404);
            return res.end('Nope');
        }
        if (statSync(full).isDirectory()) {
            res.writeHead(200, {
                'Content-type': 'application/json',
                'Access-Control-Allow-Origin': '*',
            });
            return res.end(JSON.stringify(readdirSync(full)));
        }
        res.writeHead(200, {
            'Content-type': 'text/plain',
            'Access-Control-Allow-Origin': '*',
        });
        return res.end(JSON.stringify(readFileSync(full, 'utf-8')));
    }
    if (req.method === 'OPTIONS') {
        return res.writeHead(200, {
            'Access-Control-Allow-Origin': '*',
        });
    }
}).listen(9189);
console.log(`http://localhost:9189`);
