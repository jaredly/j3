import { Evaluator, ParseResult } from '../boot-ex/types';
import { Loc, RecNode, RecNodeT } from '../../shared/nodes';
import { RenderInfo } from '../../shared/renderables';
// import { parse } from './parse-js';
import * as ts from 'typescript';

// type Fmt = { loc: number; info: RenderInfo };
// type Usage = { decl: number; usage?: number };
// type ParseError = { loc: number; msg: string };
// type Autocomplete = {
//     kind: string;
//     options: string[];
// };

// type Ctx = {
//     cursor?: { loc: number; autocomplete?: Autocomplete };
//     exports: { loc: number; kind: string }[];
// };

// export type Evaluator<Top, Expr> = {
//     parse(node: RecNode): {
//         top: Top;
//         fmt: Fmt[];
//         usages: Usage[];
//         errors: ParseError[];
//         exports: { loc: number; kind: string }[];
//         // is that right? orrrrr likeeeeee do weeeee want ...
//         // to do something really fancy.
//         extraGlobalUsages: string[];
//     };
//     asExpr(top: Top): Expr | null;
// };

/*

Ok so the most basic AST would just be:
- here's this code, and a mapping of ... the IR ... and ... stuff

IR for a def = `const x = what`.
We're going to wrap in iffe's, right?
I mean we don't strictly have to. we could scope it.


const ${name} = () => x + ${y}
const x = 12

->

let ${name};
{
    ${name} = () => x + ${y};
    const x = 12
}

right? That's fine.

*/

type AST =
    | { type: 'def'; code: string }
    | { type: 'expr'; code: string }
    | { type: 'test'; code: string };

const locToKey = (loc: Loc) =>
    loc.map(([top, num]) => `${top} ${num}`).join(',');

const processString = (
    first: string,
    templates: { suffix: string; expr: RecNodeT<Loc> }[],
) => {
    let i = 0;
    const next = () => {
        while (true) {
            const name = `$_${i++}_`;
            if (
                first.includes(name) ||
                templates.some((t) => t.suffix.includes(name))
            ) {
                continue;
            }
            return name;
        }
    };
    const exprToName = (expr: RecNodeT<Loc>) => {
        if (expr.type === 'id') {
            if (expr.ref?.type === 'toplevel') {
                return `$env.toplevels[${JSON.stringify(
                    locToKey(expr.ref.loc),
                )}]`;
            }
            if (expr.ref?.type === 'resource') {
                return `$env.resources[${JSON.stringify(expr.ref.id)}]`;
            }
        }
        return next();
    };
    const mapping: Record<string, RecNodeT<Loc>> = {};
    let text = first;
    templates.forEach(({ expr, suffix }) => {
        const name = exprToName(expr);
        text += name + suffix;
        mapping[name] = expr;
    });
    return { text, mapping };
};

export const JsEvaluator: Evaluator<AST, null, string> = {
    kwds: [],
    macrosToExpand(node) {
        return [];
    },
    parse(node, cursor) {
        if (node.type !== 'string') {
            throw new Error('no');
            // return { top: null };
        }
        if (node.tag.type !== 'id' || node.tag.text !== 'js') {
            throw new Error('no');
            // return { top: null };
        }
        const { text, mapping } = processString(node.first, node.templates);
        const parsed = ts.createSourceFile(
            '*eval*',
            text,
            ts.ScriptTarget.ES2015,
            true,
        );

        let trans = ts.transpileModule(text, {
            compilerOptions: { module: ts.ModuleKind.CommonJS },
            transformers: { after: [returnExpressions()] },
        }).outputText;

        if (
            parsed.statements.length === 1 &&
            ts.isExpressionStatement(parsed.statements[0])
        ) {
            throw new Error('no');
            // return { top: { type: 'expr', code: trans } };
        }

        const exports: NonNullable<ParseResult<any>['exports']> = [];
        const names: { name: string; loc: Loc }[] = [];
        parsed.statements.forEach((node) => {
            if (ts.isVariableStatement(node)) {
                node.declarationList.declarations.forEach((decl) => {
                    if (ts.isIdentifier(decl.name)) {
                        const expr = mapping[decl.name.text];
                        if (expr) {
                            exports.push({ loc: expr.loc, kind: 'value' });
                            names.push({ name: decl.name.text, loc: expr.loc });
                        }
                    }
                });
            }
        });
        names.forEach(({ name, loc }) => {
            trans += `\n$env.toplevels[${JSON.stringify(
                locToKey(loc),
            )}] = ${name};`;
        });

        return {
            top: { type: 'def', code: trans },
            exports,
            layouts: {},
            styles: {},
            tableHeaders: {},
        };
    },
    infer(top, infos) {
        return null;
    },
    compile(top, info) {
        return top.code;
    },
    print(ir, irs) {
        return { code: ir, sourceMap: [] };
    },
    evaluate(ir, irs) {
        const text =
            Object.values(irs)
                .map((t) => `{${t}}`)
                .join('\n') + ir;
        return new Function('$env', text)({ toplevels: {}, resources: {} });
    },
};

function returnExpressions():
    | ts.TransformerFactory<ts.SourceFile>
    | ts.CustomTransformerFactory {
    return () => (node) => {
        if (ts.isSourceFile(node)) {
            node.statements.forEach((st, i) => {
                if (ts.isExpressionStatement(st)) {
                    // @ts-ignore
                    node.statements[i] = ts.factory.createReturnStatement(
                        st.expression,
                    );
                }
            });

            // ugh this does super weird things
            // return ts.factory.createSourceFile(
            //     node.statements.map((st) => {
            //         // if (ts.isExpressionStatement(st)) {
            //         //     return ts.factory.createReturnStatement(st.expression);
            //         // }
            //         return st;
            //     }),
            //     ts.factory.createToken(ts.SyntaxKind.EndOfFileToken),
            //     node.flags,
            // );
        }
        return node;
    };
}
