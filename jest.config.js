/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    globals: {
        'ts-jest': {
            diagnostics: false,
        },
    },
    coveragePathIgnorePatterns: [
        '/node_modules/',
        'transform-tast',
        'base.parser-untyped',
    ],
};
