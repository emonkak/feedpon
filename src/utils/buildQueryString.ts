export default function buildQueryString(input: any): string {
    const params = new URLSearchParams();
    for (const key of Object.keys(input)) {
        if (Array.isArray(input[key])) {
            for (const value of input[key]) {
                params.append(key, value);
            }
        } else {
            params.append(key, input[key]);
        }
    }
    return params.toString();
}
