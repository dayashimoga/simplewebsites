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
        // Strict per-directory thresholds commented out as requested.
        // Tests will still run, and coverage will be calculated, but the build won't fail if it dips below 90% in a specific folder.
        // './sites/human-body-explorer/**/*.js': { branches: 90, functions: 90, lines: 90, statements: 90 },
        // './sites/space-mission-control/**/*.js': { branches: 90, functions: 90, lines: 90, statements: 90 },
        // './sites/ocean-marine-explorer/**/*.js': { branches: 90, functions: 90, lines: 90, statements: 90 },
        // './sites/solar-system-explorer/**/*.js': { branches: 90, functions: 90, lines: 90, statements: 90 },
        // './sites/fluid-dynamics-lab/**/*.js': { branches: 90, functions: 90, lines: 90, statements: 90 },
        // './sites/video-compressor/**/*.js': { branches: 90, functions: 90, lines: 90, statements: 90 },
        // './sites/admin-dashboard/**/*.js': { branches: 90, functions: 90, lines: 90, statements: 90 },
        // './sites/ecosystem-simulator/**/*.js': { branches: 90, functions: 90, lines: 90, statements: 90 },
        // './sites/physics-playground/**/*.js': { branches: 90, functions: 90, lines: 90, statements: 90 }
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
