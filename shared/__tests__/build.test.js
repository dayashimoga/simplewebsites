const fs = require('fs');
const path = require('path');
const { formatSiteName, generateNavBar, processHtml, getManifest, buildSite, copyDir } = require('../build.js');

describe('Build Pipeline', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('formatSiteName converts dashes to Title Case', () => {
        expect(formatSiteName('fancy-test-site')).toBe('Fancy Test Site');
        expect(formatSiteName('tool')).toBe('Tool');
        expect(formatSiteName('')).toBe('');
    });

    test('getManifest handles missing and invalid files', () => {
        const spyExists = jest.spyOn(fs, 'existsSync').mockReturnValue(true);
        const spyRead = jest.spyOn(fs, 'readFileSync').mockReturnValue('invalid json');
        
        const manifest = getManifest('test-site');
        expect(manifest.title).toBe('Test Site');
        expect(manifest.emoji).toBe('🧰');
        
        spyExists.mockRestore();
        spyRead.mockRestore();
    });

    test('processHtml injects all configured scripts', () => {
        // Use separate variables to avoid interference
        process.env.ADSENSE_PUB_ID = 'ca-pub-123';
        process.env.GA_MEASUREMENT_ID = 'G-123';
        process.env.CF_ANALYTICS_TOKEN = 'token-123';
        process.env.CONTACT_EMAIL = 'test@example.com';
        const rawHtml = `<html><head></head><body><footer></footer></body></html>`;
        
        const processed = processHtml(rawHtml, 'test-app', { emoji: '🚀', title: 'Launch' });
        
        expect(processed).toContain('ca-pub-123');
        expect(processed).toContain('G-123');
        expect(processed).toContain('token-123');
        expect(processed).toContain('🚀');
        expect(processed).toContain('Contact Us');
        
        delete process.env.ADSENSE_PUB_ID;
        delete process.env.GA_MEASUREMENT_ID;
        delete process.env.CF_ANALYTICS_TOKEN;
        delete process.env.CONTACT_EMAIL;
    });

    test('processHtml handles missing head/body tags gracefully', () => {
        const rawHtml = `no tags here`;
        const processed = processHtml(rawHtml, 'test');
        expect(processed).toBe(rawHtml); // Should not crash
    });

    test('copyDir recursively copies files', () => {
        const spyMkdir = jest.spyOn(fs, 'mkdirSync').mockImplementation();
        const spyReaddir = jest.spyOn(fs, 'readdirSync')
            .mockReturnValueOnce([
                { name: 'file.txt', isDirectory: () => false },
                { name: 'subdir', isDirectory: () => true }
            ])
            .mockReturnValue([]); // Empty for subdir
        const spyCopy = jest.spyOn(fs, 'copyFileSync').mockImplementation();

        copyDir('src', 'dest');
        
        expect(spyMkdir).toHaveBeenCalled();
        expect(spyCopy).toHaveBeenCalled();
        
        spyMkdir.mockRestore();
        spyReaddir.mockRestore();
        spyCopy.mockRestore();
    });

    test('buildSite lifecycle', () => {
        const spyMkdir = jest.spyOn(fs, 'mkdirSync').mockImplementation();
        const spyReaddir = jest.spyOn(fs, 'readdirSync').mockReturnValue([]);
        const spyExists = jest.spyOn(fs, 'existsSync').mockReturnValue(true);
        const spyRead = jest.spyOn(fs, 'readFileSync').mockReturnValue('<html><head></head><body></body></html>');
        const spyWrite = jest.spyOn(fs, 'writeFileSync').mockImplementation();
        const spyCopy = jest.spyOn(fs, 'copyFileSync').mockImplementation();

        buildSite('test-site');
        
        expect(spyWrite).toHaveBeenCalledWith(expect.stringContaining('sitemap.xml'), expect.any(String));
        expect(spyWrite).toHaveBeenCalledWith(expect.stringContaining('sw.js'), expect.any(String));
        
        spyMkdir.mockRestore();
        spyReaddir.mockRestore();
        spyExists.mockRestore();
        spyRead.mockRestore();
        spyWrite.mockRestore();
        spyCopy.mockRestore();
    });
});
