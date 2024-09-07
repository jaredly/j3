// testingi t up
import { expect, test } from 'bun:test';
import { joinChunks } from '../shared/IR/ir-to-text';

test('joinChunks', () => {
    expect(joinChunks(['a', 'b'])).toBe('ab');
    expect(joinChunks(['a\nc', 'b'])).toBe('ab\nc');
    expect(joinChunks(['a\ncd', 'b'])).toBe('a b\ncd');
    expect(joinChunks(['a\ncd', 'b', 'abc\na'])).toBe('a babc\ncd a');
});
