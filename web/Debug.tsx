import * as React from 'react';
import { parse } from '../src/grammar';
import { newEvalCtx } from './store';
import { addDef } from '../src/to-ast/to-ast';
import { newCtx, noForm } from '../src/to-ast/Ctx';
import { nodeToType } from '../src/to-ast/nodeToType';
import { idxLines, removeDecorators } from '../src/to-ast/utils';
import { nodeToExpr } from '../src/to-ast/nodeToExpr';
import { getType, Report } from '../src/get-type/get-types-new';

export const useLocalStorage = <T,>(key: string, initial: () => T) => {
    const [state, setState] = React.useState<T>(
        localStorage[key] ? JSON.parse(localStorage[key]) : initial(),
    );
    React.useEffect(() => {
        if (state) {
            localStorage[key] = JSON.stringify(state);
        }
    }, [state]);
    return [state, setState] as const;
};

export const Debug = () => {
    const [text, setText] = useLocalStorage('text', () => '23');
    const results = React.useMemo(() => {
        try {
            const parsed = parse(text);
            let ctx = newEvalCtx(newCtx());
            const lines = idxLines(text);
            return parsed.map((node) => {
                const results = removeDecorators(node, ctx.ctx);
                const res = nodeToExpr(results.node, ctx.ctx);
                ctx.ctx = addDef(res, ctx.ctx);
                const report: Report = { types: {}, errors: {} };
                const type = getType(res, ctx.ctx, report);
                return { res, results, report, type };
            });
        } catch (err) {
            console.error(err);
            return 'synntax prolly';
        }
    }, [text]);

    return (
        <div>
            <textarea
                value={text}
                onChange={(evt) => setText(evt.target.value)}
                style={{
                    width: 600,
                    height: 300,
                    background: 'transparent',
                    color: 'inherit',
                }}
            />
            <pre>{JSON.stringify(noForm(results), null, 2)}</pre>
        </div>
    );
};
