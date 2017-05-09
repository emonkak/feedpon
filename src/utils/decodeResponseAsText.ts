const CHARSET_PATTERN = /charset=([\w-]+)/i;
const QUOTED_CHARSET_PATTERN = /charset=["']?([\w-]+)["']?/i;

export default async function decodeResponseAsText(response: Response): Promise<string> {
    const buffer = await response.arrayBuffer();
    const encoding = detectEncodingFromHeaders(response.headers) ||
                     detectEncodingFromContent(buffer) ||
                     'utf-8';
    const decoder = new TextDecoder(encoding);
    const bytes = new Uint8Array(buffer);
    return decoder.decode(bytes);
}

function detectEncodingFromHeaders(headers: Headers): string | null {
    const contentType = headers.get('Content-Type');
    if (contentType) {
        const matches = contentType.match(CHARSET_PATTERN);
        if (matches) {
            return matches[1];
        }
    }
    return null;
}

function detectEncodingFromContent(buffer: ArrayBuffer): string | null {
    const bytes = new Uint8Array(buffer, 0, Math.min(buffer.byteLength, 1024));
    try {
        const decoder = new TextDecoder();
        const content = decoder.decode(bytes);
        const matches = content.match(QUOTED_CHARSET_PATTERN);
        if (matches) {
            return matches[1];
        }
    } catch (error) {
    }
    return null;
}
