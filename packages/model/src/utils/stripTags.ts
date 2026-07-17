const TAG_PATTERN = /\s*<\/?[^>]+>\s*/g;

export function stripTags(input: string): string {
  return input.replace(TAG_PATTERN, '');
}
