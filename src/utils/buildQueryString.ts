export default function buildQueryString(input: any): string {
    const params = [];
    for (const key of Object.keys(input)) {
        if (Array.isArray(input[key])) {
            for (const value of input[key]) {
                params.push(encodeURIComponent(key) + '=' + encodeURIComponent(value));
            }
        } else {
            params.push(encodeURIComponent(key) + '=' + encodeURIComponent(input[key]));
        }
    }
    return params.join('&');
}
