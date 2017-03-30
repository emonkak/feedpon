const TAG_PATTERN = new RegExp('<\/?[^>]+>', 'gi');

const TRIM_PATTERN = new RegExp('^\s+|\s+$', 'gi');

const SPACES_PATTERN = new RegExp('\s+', 'gi');

export default function stripTags(input: string): string {
    return input
        .replace(TAG_PATTERN, '')
        .replace(TRIM_PATTERN, '')
        .replace(SPACES_PATTERN, ' ')
        .trim();
}
