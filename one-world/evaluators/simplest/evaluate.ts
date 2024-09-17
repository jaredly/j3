import { IR } from '.';
import { keyForLoc, mapNode, RecNode } from '../../shared/nodes';

export const builtins: Record<string, any> = {
    '=': (a: number, b: number) => a === b,
    '<': (a: number, b: number) => a < b,
    '>': (a: number, b: number) => a > b,
    '-': (a: number, b: number) => a - b,
    '+': (a: number, b: number) => a + b,
    not: (b: boolean) => !b,
    trace: (text: string, v: any) => (console.log(text, v), v),
    false: false,
    true: true,
    null: null,
};

const handlers: {
    [key in IR['type']]: (
        ir: Extract<IR, { type: key }>,
        irs: Record<string, IR>,
        locals: Record<string, any>,
    ) => any;
} = {
    quote(ir, irs, locals): RecNode {
        const sub = (node: RecNode) => {
            if (node.type === 'id' && !node.ref && node.text.startsWith('@')) {
                const name = node.text.slice(1);
                if (name in locals) {
                    return locals[name];
                }
                throw new Error(`quoted local not found: ${name}`);
            }
            return node;
        };
        const nodes = ir.items.map((node) => mapNode(node, sub));
        if (nodes.length === 1) {
            return nodes[0];
        }
        return { type: 'list', loc: ir.loc, items: nodes };
    },

    string: (ir, irs, locals) =>
        ir.first +
        ir.templates.map((tpl) => evaluate(tpl.expr, irs, locals) + tpl.suffix),
    int: (ir) => ir.value,
    float: (ir) => ir.value,
    apply: (ir, irs, locals) =>
        evaluate(
            ir.target,
            irs,
            locals,
        )(...ir.args.map((arg) => evaluate(arg, irs, locals))),
    builtin({ name }) {
        if (name in builtins) {
            return builtins[name];
        }
        throw new Error('unknown builtin: ' + name);
    },
    if(ir, irs, locals) {
        return evaluate(ir.cond, irs, locals)
            ? evaluate(ir.yes, irs, locals)
            : evaluate(ir.no, irs, locals);
    },
    ref(ir, irs, locals) {
        const key = keyForLoc(ir.loc);
        if (!irs[key]) {
            console.log(irs);
            throw new Error(`cant resolve ref: ${key}`);
        }
        return evaluate(irs[key], irs, locals);
    },
    local({ name }, _, locals) {
        if (name in locals) {
            return locals[name];
        }
        if (name === '') {
            throw new Error(`unhandled blank node`);
        }
        throw new Error(`no local ${name}`);
    },
    list: (ir, irs, locals) =>
        ir.items.map((item) => evaluate(item, irs, locals)),
    fn(ir, irs, locals) {
        return (...args: any[]) => {
            if (args.length !== ir.args.length) {
                throw new Error(
                    `wrong number of args expected ${ir.args.length}, found ${args.length}`,
                );
            }
            const sub = { ...locals };
            args.forEach((arg, i) => {
                sub[ir.args[i]] = arg;
            });
            return evaluate(ir.body, irs, sub);
        };
    },
};

export const evaluate = (
    ir: IR,
    irs: Record<string, IR>,
    locals: Record<string, any>,
): any => {
    if (!ir) throw new Error(`evaluate empty`);
    return handlers[ir.type](ir as any, irs, locals);
};
