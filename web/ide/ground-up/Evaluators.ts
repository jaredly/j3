// Step 1: produce an `evaluator` for the bootstrap evaluator
// Step 2: use the bootstrap evaluator + state => a new evaluator

import { Node } from '../../../src/types/cst';
import { FullEvalator, Produce, Errors } from './FullEvalator';

// export type BasicEvaluator<T> = {};

export class MyEvalError extends Error {
    source: Error;
    constructor(name: string, source: Error) {
        super(name);
        this.source = source;
    }
}

export class LocError extends Error {
    locs: { loc: number; row: number; col: number }[] = [];
    js: string;
    constructor(source: Error, js: string) {
        super(source.message);
        this.js = js;
        const locs: { row: number; col: number }[] = [];
        source.stack!.replace(/<anonymous>:(\d+):(\d+)/g, (a, row, col) => {
            locs.push({ row: +row, col: +col });
            return '';
        });

        const lines = js.split('\n');

        locs.forEach(({ row, col }) => {
            if (row - 1 >= lines.length) {
                return; // console.error('Row out of bounds?', row, lines.length);
            }

            for (let i = row - 1; i >= 0; i--) {
                let line = lines[i];
                const found: { num?: number; col: number; end: boolean }[] = [];
                line.replaceAll(
                    /\/\*(<)?(\d+)\*\//g,
                    (_, end, num, col) => (
                        found.push({ num: +num, col, end: !!end }), ''
                    ),
                );
                line.replaceAll(/\/\*!\*\//g, (_, col) => {
                    found.push({ col, end: false });
                    return '';
                });
                found.sort((a, b) => a.col - b.col);
                const start = found.findLast((f) => f.col <= col && !f.end);
                const end = found.find((f) => f.col >= col && f.end);
                if (start) {
                    if (start.num == null) return; // skip
                    this.locs.push({ loc: start.num, col, row });
                    return;
                }
                if (end) {
                    if (end.num == null) return; // skip
                    // this.locs.push(end.num);
                    this.locs.push({ loc: end.num, col, row });
                    return;
                }
            }

            // console.error(`Cant symbolicate`, { row, col });
        });
    }
}

export const repr: FullEvalator<{ values: {} }, Node, Node> = {
    id: 'repr',
    init: () => ({ values: {} }),
    parse(node: Node) {
        return { stmt: node, errors: [] };
    },
    parseExpr(node: Node) {
        return { expr: node, errors: [] };
    },
    setTracing(idx) {},
    addStatements(stmts, env) {
        const display: Record<number, Produce> = {};
        Object.keys(stmts).forEach((id) => {
            display[+id] = JSON.stringify(stmts[+id]);
        });
        return { env, display, values: {} };
    },
    evaluate() {
        return null;
    },
    toFile() {
        return { js: 'lol its a repr', errors: {} };
    },
};
