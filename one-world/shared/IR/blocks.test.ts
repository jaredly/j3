import { expect, test } from 'bun:test';
import { showLayout, showSpans } from './test-utils';

test('showing spans of simple string', () => {
    expect('\n' + showSpans('"hi"')).toMatchSnapshot();
});

test('showing spans of id', () => {
    expect('\n' + showSpans('hi')).toMatchSnapshot();
});

test('showing spans of string with tag', () => {
    expect('\n' + showSpans('js"hi"')).toMatchSnapshot();
});

test('showing spans of string with inclusion', () => {
    expect('\n' + showSpans('"hi${abc}ho"')).toMatchSnapshot();
});

test('showing spans of wrap string', () => {
    expect(
        '\n' + showSpans('"Hello folks this will wrap, thanks."'),
    ).toMatchSnapshot();
});

test('showing spans of wrap string, short last', () => {
    expect('\n' + showSpans('"Hello folks this will wrap."')).toMatchSnapshot();
});

test('showing spans of wrap string, short last', () => {
    expect(
        '\n' + showSpans('"Hello folks this will ${a} wrap."'),
    ).toMatchSnapshot();
});

test('text with wrap on inclusion', () => {
    expect(
        '\n' + showSpans('"Hello folks ${this} will wrap."'),
    ).toMatchSnapshot();
});

test('highlight over wrap', () => {
    expect('\n' + showSpans('"Hello ${folks} this will."')).toMatchSnapshot();
});

test('showing spans of string with inclusion', () => {
    expect(
        '\n' + showSpans('"hi this is ${a} something ${abc} that will wrap"'),
    ).toMatchSnapshot();
});

// test('showing spans of string with inclusion', () => {
//     expect(
//         '\n' +
//             showSpans(
//                 '(What ok-folks js"abcd${what}here${(what and such js"ok" and stuff)}")',
//             ),
//     ).toMatchSnapshot();
// });

test('simple list', () => {
    expect(
        '\n' + showSpans('(what is)', 100).replaceAll('$', '!'),
    ).toMatchSnapshot();
});

test('list in inclusion', () => {
    expect(
        '\n' + showSpans('"${(what is)}"', 100).replaceAll('$', '!'),
    ).toMatchSnapshot();
});

test('wow ok so bigbug here', () => {
    expect(
        '\n' +
            showSpans(
                'js"sdfgsad${what}asdfjkljsdfk${(loveit and-what"${for}" -what you)}P{} sdfb"',
                100,
            ),
    ).toMatchSnapshot();
    expect(
        '\n' +
            showSpans(
                'js"sdfgsad${what}asdfjkljsdfk${(loveit and-what"${for}" -what you)}P{} sdfb"',
                20,
            ),
    ).toMatchSnapshot();
    expect('\n' + showSpans('"${(lov -sss)}NNN"', 10)).toMatchSnapshot();

    expect(
        '\n' +
            showLayout(
                // STOPSHIP:It should be wrapping before the $(loveit
                // ALSO: The trailing " is way too far out
                '(What js"${10}P n sdfb")',
                10,
            ),
    ).toMatchSnapshot();
    expect(
        '\n' +
            showLayout(
                // STOPSHIP:It should be wrapping before the $(loveit
                // ALSO: The trailing " is way too far out
                '(What js"${10}P nnsdfb")',
                10,
            ),
    ).toMatchSnapshot();

    expect(
        '\n' +
            showSpans(
                // STOPSHIP:It should be wrapping before the $(loveit
                // ALSO: The trailing " is way too far out
                '(What js"${what}asdfaASDJK ${(loveit and-what"${for}" -what you)}P{} sdfb")',
                10,
            ),
    ).toMatchSnapshot();
    expect(
        '\n' +
            showSpans(
                '(What ok-folks hs "" js"sdfasdf${what}asdfaASDJK${(loveit and-what"${for}" -what you)}P{} sdfb")',
                50,
            ),
    ).toMatchSnapshot();
});

test('template string', () => {
    expect('\n' + showSpans('nnnnnnnn"${lol}"')).toMatchSnapshot();
    expect('\n' + showSpans('nnnnnnnnnnnnnnnnn"${lol}"')).toMatchSnapshot();
});

test('small inline', () => {
    let res = [];
    for (let i = 10; i < 20; i++) {
        res.push(showSpans('"One ${two} three"', i));
    }
    expect('\n' + res.join('\n')).toMatchSnapshot();
});

test('one wrap', () => {
    let res = [];
    for (let i = 12; i >= 7; i--) {
        res.push(showLayout('(one two 3)', i));
    }
    expect('\n' + res.join('\n')).toMatchSnapshot();
});

test('nested wraps', () => {
    let res = [];
    for (let i = 21; i >= 15; i--) {
        res.push(showLayout('(one two (three four five) six seven)', i));
    }
    expect('\n' + res.join('\n')).toMatchSnapshot();
});

test('string with newlines', () => {
    let res = [];
    res.push(showSpans('(one "Hello\nYall" two)', 20));
    res.push(showSpans('"Hello\nYall"', 20));
    expect('\n' + res.join('\n')).toMatchSnapshot();
});

test('wrap after interpolation', () => {
    let res = [];
    for (let i = 12; i >= 10; i--) {
        res.push(showLayout('"${abc} A B three four"', i));
    }
    expect('\n' + res.join('\n')).toMatchSnapshot();
});

test('simple a/b', () => {
    let res = [];
    res.push(showSpans('"A\nB"', 20));
    expect('\n' + res.join('\n')).toMatchSnapshot();
});

test('simple a/b with interp', () => {
    debugger;
    let res = [];
    res.push(showSpans('"${0}A\nB"', 20));
    expect('\n' + res.join('\n')).toMatchSnapshot();
});

test('string with newlines in interp', () => {
    let res = [];
    res.push(showSpans('"A${"B\nC"}D E F"', 20));
    expect('\n' + res.join('\n')).toMatchSnapshot();
});

test('pairs placement?', () => {
    let res = [];
    res.push(showSpans('(let [a b] ))', 10));
    expect('\n' + res.join('\n')).toMatchSnapshot();
});

test('try a table maybe', () => {
    let res = [];
    res.push(showSpans('(|lol|folks\nhi  |ho\n(lol what)|)', 10));
    expect('\n' + res.join('\n')).toMatchSnapshot();
});
