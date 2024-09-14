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
            zero: [
                `(defmacro and [one two] (\` if #one #two false))`,
                `(defmacro or [one two] (\` if #one true #two))`,
            ],
            one: [
                `[(and true false) (and true true) (or true false) (or false false)]`,
            ],
        }),
    ).toEqual([true, false, true]);
});
