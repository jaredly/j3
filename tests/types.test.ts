import generate from '@babel/generator';
import { readdirSync, readFileSync } from 'fs';
import { parse } from '../src/grammar';
import { nodeToExpr } from '../src/to-ast/nodeToExpr';
import { addDef, newCtx } from '../src/to-ast/to-ast';
import { stmtToTs } from '../src/to-ast/to-ts';
import { newEvalCtx } from '../web/store';
import * as t from '@babel/types';
import { typeForExpr } from '../src/to-ast/typeForExpr';
import { getLine, idxLines } from '../src/to-ast/utils';
import { Node } from '../src/types/cst';
import { transformNode } from '../src/types/transform-cst';

const callWith = (node: Node, name: string): Node[] | void => {
    if (
        node.contents.type === 'list' &&
        node.contents.values.length >= 1 &&
        node.contents.values[0].contents.type === 'identifier' &&
        node.contents.values[0].contents.text === name
    ) {
        return node.contents.values.slice(1);
    }
};

const removeDecorators = (node: Node) => {
    const result: {
        errors: {
            message: string;
            idx: number;
        }[];
        expected: {
            type: Node;
            idx: number;
        }[];
    } = { errors: [], expected: [] };
    node = transformNode(node, {
        pre(node) {
            const values = callWith(node, '@error');
            if (!values) {
                const values = callWith(node, '@type');
                if (!values) {
                    return;
                }
                if (values.length !== 2) {
                    throw new Error(`misconfigured, wrong size`);
                }
                result.expected.push({
                    type: values[0],
                    idx: values[1].loc.idx,
                });
                return values[1];
            }
            if (values.length !== 2) {
                throw new Error(`misconfigured, wrong size`);
            }
            if (values[0].contents.type !== 'string') {
                throw new Error(`error non a string`);
            }
            result.errors.push({
                message: values[0].contents.first,
                idx: values[1].loc.idx,
            });
            return values[1];
        },
    });
    return { ...result, node };
};

readdirSync(__dirname)
    .filter((m) => m.endsWith('.types.jd'))
    .forEach((name) => {
        describe(name, () => {
            const raw = readFileSync(__dirname + '/' + name, 'utf8');
            const parsed = parse(raw);
            const ctx = newEvalCtx(newCtx());
            const results = [];
            const lines = idxLines(raw);

            for (let node of parsed) {
                const results = removeDecorators(node);
                const res = nodeToExpr(node, ctx.ctx);

                const types = {};
                // getType(res, ctx.ctx, types);
            }
        });
    });
