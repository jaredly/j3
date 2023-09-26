import { expect, test } from 'vitest';
import { Chunk, chunks, runChunk } from './j.fixture';
import { typToString } from './j';
import txt from './j.test.clj';

export const testChunk = ({ type, errors, code, line, title }: Chunk) => {
    console.log(txt);
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
