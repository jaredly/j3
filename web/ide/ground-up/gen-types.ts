import { readFileSync } from 'fs';
import * as ts from 'typescript';

const file = ts.createSourceFile(
    'lol.ts',
    readFileSync('./src/types/cst.ts', 'utf8'),
    ts.ScriptTarget.ES2015,
    true,
);

/*

export type One = {type: X, 0: a, 1: b}


hrmmmmmmmmmmm


*/

const output: string[] = [];

for (let st of file.statements) {
    if (ts.isTypeAliasDeclaration(st)) {
        if (ts.isTypeLiteralNode(st.type)) {
            const map: { [key: string]: ts.TypeNode } = {};
            st.type.members.forEach((member) => {
                if (ts.isPropertySignature(member)) {
                    if (
                        member.name &&
                        member.type &&
                        ts.isIdentifier(member.name)
                    ) {
                        map[member.name.text] = member.type;
                    }
                }
            });
            if (
                map.type &&
                ts.isLiteralTypeNode(map.type) &&
                ts.isStringLiteral(map.type.literal)
            ) {
                output.push(
                    `export type ${map.type.literal.text} = {type: '${
                        map.type.literal.text
                    }', ${Object.keys(map)
                        .filter((k) => k !== 'type')
                        .map((k, i) => `${i}: lol`)
                        .join(', ')}}`,
                );
            }
        } else if (ts.isUnionTypeNode(st.type)) {
            st.type.types;
        }
    }
}

console.log(output.join('\n\n'));
