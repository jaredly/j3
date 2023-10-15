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

const serializeFile = (state: NUIState) => {
    const tops = (state.map[-1] as ListLikeContents).values;
    const display = {};
    tops.map((top) => {
        layout(top, 0, state.map, display, {}, true);
    });

    const { map, ...others } = state;

    return (
        `;!! ${JSON.stringify(others)}\n\n` +
        tops
            .map(
                (id) =>
                    `;! ${JSON.stringify(
                        fromMCST(id, state.map),
                    )}\n\n${renderNodeToString(id, state.map, 0, display)}`,
            )
            .join('\n\n')
    );
};

const deserializeFile = (raw: string) => {
    if (!raw.startsWith(';!! ')) {
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
        if (line.startsWith(':!! ')) {
            state = JSON.parse(line.slice(4));
        } else if (line.startsWith(';! ')) {
            const node = JSON.parse(line.slice(3));
            map[node.loc] = node;
            tops.push(node.loc);
        }
    });
    state!.map = map;
    return state!;
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
