import { useLocalStorage } from './App';
import * as React from 'react';
import { parse } from '../src/grammar';
import { newEvalCtx } from './store';
import { newCtx, nodeToType, noForm } from '../src/to-ast/to-ast';
import { idxLines, removeDecorators } from '../src/to-ast/utils';
import { nodeToExpr } from '../src/to-ast/nodeToExpr';
import { getType, Report } from '../src/types/get-types-new';

export const Debug = () => {
    const [text, setText] = useLocalStorage('text', () => '23');
    const results = React.useMemo(() => {
        try {
            const parsed = parse(text);
            const ctx = newEvalCtx(newCtx());
            const lines = idxLines(text);
            return parsed.map((node) => {
                const results = removeDecorators(node, ctx.ctx);
                const res = nodeToExpr(results.node, ctx.ctx);
                const report: Report = { types: {}, errors: {} };
                const type = getType(res, ctx.ctx, report);
                return { res, results, report, type };
            });
        } catch (err) {
            return 'synntax prolly';
        }
    }, [text]);

    return (
        <div>
            <textarea
                value={text}
                onChange={(evt) => setText(evt.target.value)}
                style={{ width: 600, height: 300 }}
            />
            <pre>{JSON.stringify(results, null, 2)}</pre>
        </div>
    );
};
