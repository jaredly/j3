import { full } from './by-hand';

test('single expression', () => {
    expect(full({ one: ['(+ 2 3)'] })).toEqual(5);
});

test('single reference', () => {
    expect(full({ one: ['(def x 3)', '(+ 2 x)'] })).toEqual(5);
});

test('multiple reference', () => {
    expect(
        full({
            one: [
                // some definitions
                `(def x 3)`,
                `(def y 13)`,
                '(if (< x 5) (+ x y) "World")',
            ],
        }),
    ).toEqual(16);
});

test('transitive reference', () => {
    expect(
        full({
            one: [
                // Transitive dependency
                `(def x 3)`,
                `(def y (+ x 2))`,
                '(if (< x 5) (+ x y) "World")',
            ],
        }),
    ).toEqual(8);
});

test('modules', () => {
    expect(
        full({
            // Modules
            one: [`(def x 3)`, `(def y (+ x 2))`],
            two: ['(if (< x 5) (+ x y) "World")'],
        }),
    ).toEqual(8);
});

test('lambda', () => {
    expect(
        full({
            one: [`((fn [x] (+ x 10)) 34)`],
        }),
    ).toEqual(44);
});

test('defn', () => {
    expect(
        full({
            one: [`(defn hi [x] (+ x 10))`, `(hi 34)`],
        }),
    ).toEqual(44);
});

test('recursive', () => {
    expect(
        full({
            one: [
                `(defn even [x] (if (= x 0) true (odd (- x 1))))`,
                `(defn odd [x] (not (even x)))`,
                `[(even 4) (even 3) (even 2)]`,
            ],
        }),
    ).toEqual([true, false, true]);
});

test('recursive diff module', () => {
    expect(
        full({
            zero: [
                `(defn even [x] (if (= x 0) true (odd (- x 1))))`,
                `(defn odd [x] (not (even x)))`,
            ],
            one: [`[(even 4) (even 3) (even 2)]`],
        }),
    ).toEqual([true, false, true]);
});

test('cant recurse across modules', () => {
    expect(() =>
        full({
            zero: [`(defn even [x] (if (= x 0) true (odd (- x 1))))`],
            one: [
                `(defn odd [x] (not (even x)))`,
                `[(even 4) (even 3) (even 2)]`,
            ],
        }),
    ).toThrow('module dependency cycle');
});

test("let's do a macrooo", () => {
    expect(
        full({
            booleans: [
                '(defmacro and [one two] (` if @one @two false))',
                '(defmacro or [one two] (` if @one true @two))',
            ],
            main: [
                '[(and true false) (and true true) (or true false) (or false false)]',
            ],
        }),
    ).toEqual([false, true, true, false]);
});

test('macro in the same module', () => {
    expect(() =>
        full({
            main: [
                '(defmacro and [one two] (` if @one @two false))',
                '(and true false)',
            ],
        }),
    ).toThrow('macro in the same module');
});

test('macro cross-module recursion', () => {
    expect(() =>
        full({
            macros: [
                '(defmacro and [one two] (if (go false) (` if @one @two false) (` true)))',
            ],
            main: [
                '(defn go [x] (if x true (and false true)))',
                '(and true false)',
            ],
        }),
    ).toThrow('dependency cycle');
});

test('macro cross-module recursion through two modules', () => {
    expect(() =>
        full({
            macros: [
                '(defmacro and [one two] (if (lol false) (` if @one @two false) (` true)))',
            ],
            two: ['(def lol go)'],
            main: [
                '(defn go [x] (if x true (and false true)))',
                '(and true false)',
            ],
        }),
    ).toThrow('dependency cycle');
});
