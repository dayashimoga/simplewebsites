const path = require('path');

module.exports = {
    testEnvironment: 'jsdom',
    setupFiles: ['jest-canvas-mock'],
    coverageThreshold: {
        global: {
            branches: 65,
            functions: 83,
            lines: 98,
            statements: 76
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
