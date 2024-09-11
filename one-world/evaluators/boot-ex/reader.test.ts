// testing the reader I guess

import { reader } from './reader';
import { test, expect } from 'bun:test';

test('ok', () => {
    expect(reader('()')).toMatchSnapshot();
    expect(reader('(1 2 3)')).toMatchSnapshot();
    expect(reader('(hi "folks")')).toMatchSnapshot();
    expect(reader('what"things"')).toMatchSnapshot();
    expect(reader('(hi "folks" and "such${is}life")')).toMatchSnapshot();

    expect(reader('["a\nb" "a\\nb" "a\\\\nb"]')).toMatchSnapshot();
});
