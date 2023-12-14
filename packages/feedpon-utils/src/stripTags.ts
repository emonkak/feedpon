const TAG_PATTERN = /<\/?[^>]+>/gi;

const TRIM_PATTERN = /^\s+|\s+$/gi;

const SPACES_PATTERN = /\s+/gi;

export default function stripTags(input: string): string {
  return input
    .replace(TAG_PATTERN, '')
    .replace(TRIM_PATTERN, '')
    .replace(SPACES_PATTERN, ' ')
    .trim();
}
