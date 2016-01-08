export default function matches(pattern: string, str: string): boolean {
    try {
        return new RegExp(pattern).test(str)
    } catch (error) {
        return false
    }
}
