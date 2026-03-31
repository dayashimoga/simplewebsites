const path = require('path');

module.exports = {
    testEnvironment: 'jsdom',
    setupFiles: ['jest-canvas-mock'],
    coverageThreshold: {
        global: {
            statements: 5,
            branches: 2,
            functions: 5,
            lines: 5
        }
    },
    collectCoverageFrom: [
        'shared/**/*.js',
        'sites/**/*.js',
        '!**/node_modules/**',
        '!**/dist/**',
        '!**/__tests__/**',
        '!**/jest.config.js'
    ],
    moduleNameMapper: {
        '^shared/(.*)$': path.resolve(__dirname, 'shared/$1')
    }
};
