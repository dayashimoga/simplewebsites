const path = require('path');

module.exports = {
    testEnvironment: 'jsdom',
    setupFiles: ['jest-canvas-mock'],
    coverageThreshold: {
        global: {
            branches: 0,
            functions: 0,
            lines: 0,
            statements: 0
        },
        // './sites/human-body-explorer/**/*.js': { branches: 90, functions: 90, lines: 90, statements: 90 },
        // './sites/space-mission-control/**/*.js': { branches: 90, functions: 90, lines: 90, statements: 90 },
        // './sites/ocean-marine-explorer/**/*.js': { branches: 90, functions: 90, lines: 90, statements: 90 },
        // './sites/solar-system-explorer/**/*.js': { branches: 90, functions: 90, lines: 90, statements: 90 },
        // './sites/fluid-dynamics-lab/**/*.js': { branches: 90, functions: 90, lines: 90, statements: 90 },
        // './sites/video-compressor/**/*.js': { branches: 90, functions: 90, lines: 90, statements: 90 },
        // './sites/admin-dashboard/**/*.js': { branches: 90, functions: 90, lines: 90, statements: 90 }
    },
    collectCoverageFrom: [
        'shared/**/*.js',
        'sites/**/*.js',
        '!**/node_modules/**',
        '!**/dist/**',
        '!**/__tests__/**',
        '!**/jest.config.js',
        '!**/shared-theme-toggle.js'
    ],
    moduleNameMapper: {
        '^shared/(.*)$': path.resolve(__dirname, 'shared/$1')
    }
};
