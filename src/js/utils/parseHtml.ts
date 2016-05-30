export default function parseHtml(str: string): HTMLDocument {
    const parser = new DOMParser();
    return parser.parseFromString(str, 'text/html');
}
