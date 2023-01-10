/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    extensionsToTreatAsEsm: ['.ts'],
    globals: {
        'ts-jest': {
            diagnostics: false,
            useESM: true,
        },
    },
    coveragePathIgnorePatterns: [
        '/node_modules/',
        'transform-tast',
        'base.parser-untyped',
    ],
};
