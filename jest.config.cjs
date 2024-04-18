// ! Copyright (c) 2024, Brandon Ramirez, brr.dev

module.exports = {
    transform: {
        '^.+\\.ts$': 'ts-jest',
    },
    testEnvironment: 'node',
    testRegex: './src/.*\\.test\\.ts',
    moduleFileExtensions: ['ts', 'js', 'json', 'node'],
    roots: ['<rootDir>/src'],
}
