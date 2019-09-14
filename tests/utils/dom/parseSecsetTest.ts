import * as assert from 'assert';

import parseSrcset from 'utils/dom/parseSrcset';

describe('parseSrcset()', () => {
    it('should parse urls', () => {
        const urls = parseSrcset(' https://example.com/foo,bar 100w, https://example.com/baz,qux 1.5x ');
        assert.deepEqual(urls, [
            { url: 'https://example.com/foo,bar', descriptor: '100w' },
            { url: 'https://example.com/baz,qux', descriptor: '1.5x' },
        ]);
    });
});
