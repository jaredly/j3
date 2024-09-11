import { test, expect } from 'bun:test';
import { JsEvaluator } from './js';
import { reader } from '../boot-ex/reader';

test('js eval expr', () => {
    const parsed = reader('js"hello()"')!;
    const result = JsEvaluator.parse(parsed);
    expect(result.top).toEqual({
        type: 'expr',
        code: 'return hello();\n',
    });
});

test('js eval defs', () => {
    const parsed = reader('js"const ${x} = 12\nconst ${y} = 100"')!;
    const result = JsEvaluator.parse(parsed);
    expect(result.top).toEqual({
        type: 'def',
        code: 'var $_0_ = 12;\nvar $_1_ = 100;\n\n$env.toplevels["test-top 11"] = $_0_;\n$env.toplevels["test-top 27"] = $_1_;',
    });
});

test('js full stack', () => {
    const parsed = reader('js"23 + 1"')!;
    const result = JsEvaluator.parse(parsed);
    if (!result.top) return;
    const ir = JsEvaluator.compile(result.top, null);
    const res = JsEvaluator.evaluate(ir, {});
    expect(res).toEqual(24);
});
