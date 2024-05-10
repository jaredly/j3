import { expect, test } from 'vitest';
import { Chunk, chunks, runChunk } from './j.fixture';
// import { typToString } from './j';
import { function_type, t_int, typToString, unrollFn } from './hmx/hmx';

export const testChunk = ({ type, errors, code, line, title }: Chunk) => {
    test(`j.test.clj:${line} - ${
        title ?? code.replaceAll(/\n\s*/g, ' ').slice(0, 50)
    }`, () => {
        const res = runChunk(code);

        if (res.type) {
            expect(typToString(res.type)).toEqual(type);
        }
        expect(res.errors).toEqual(errors);
    });
};

chunks.forEach((chunk) => testChunk(chunk));

test('unrollFn', () => {
    const t = function_type(t_int, function_type(t_int, t_int));
    expect(unrollFn(t)).toEqual({
        args: [t_int, t_int],
        body: t_int,
    });
});
