const SPLIT_PATTERN = /,\s+/g;
const SPACES_PATTERN = /\s+/;

export default function parseSrcset(input: string): { url: string, descriptor: string | undefined }[] {
    return input
        .trim()
        .split(SPLIT_PATTERN)
        .map((chunk) => {
            const [url, descriptor] = chunk.split(SPACES_PATTERN, 2);
            return { url: url!, descriptor };
        });
}
