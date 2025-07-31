export default function tryMatch(pattern: string, str: string): boolean {
  try {
    return new RegExp(pattern).test(str);
  } catch {
    return false;
  }
}
