/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
    testEnvironment: 'node',
    extensionsToTreatAsEsm: ['.ts'],
    transform: {
        '^.+\\.ts$': [
            'ts-jest',
            {
                diagnostics: false,
                useESM: true,
            },
        ],
    },
    coveragePathIgnorePatterns: [
        '/node_modules/',
        'transform-tast',
        'base.parser-untyped',
    ],
};
