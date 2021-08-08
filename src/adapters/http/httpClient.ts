import fetch from './fetch';

export default {
    get<T extends { [K in keyof T]: string[] | string | number | boolean}>(endpoint: string, path: string, params?: T | null, headers?: { [key: string]: string }): Promise<Response> {
        let url = endpoint + path;

        if (params) {
            const searchParams = new URLSearchParams();
            for (const name of Object.keys(params)) {
                const value = params[name as keyof T] as unknown;
                if (typeof value === 'boolean') {
                    searchParams.append(name, value.toString());
                } else if (typeof value === 'number') {
                    searchParams.append(name, value.toString());
                } else if (typeof value === 'string') {
                    searchParams.append(name, value);
                } else if (Array.isArray(value)) {
                    for (const v of value) {
                        searchParams.append(name, v);
                    }
                }
            }
            url += '?' + searchParams.toString();
        }

        const options = {
            method: 'GET',
            headers: new Headers(headers)
        };

        return fetch(url, options);
    },
    postJson(endpoint: string, path: string, data: string | object | null, headers?: { [key: string]: string }): Promise<Response> {
        const url = endpoint + path;

        const options = {
            method: 'POST',
            headers: new Headers({ 'Content-Type': 'application/json', ...headers }),
            body: serializeAsJson(data)
        };

        return fetch(url, options);
    },
    postXml(endpoint: string, path: string, body: string, headers?: { [key: string]: string }): Promise<Response> {
        const url = endpoint + path;

        const options = {
            method: 'POST',
            headers: new Headers({ 'Content-Type': 'application/xml', ...headers }),
            body
        };

        return fetch(url, options);
    },
    putJson(endpoint: string, path: string, data: string | object | null, headers?: { [key: string]: string }): Promise<Response> {
        const url = endpoint + path;

        const options = {
            method: 'PUT',
            headers: new Headers({ 'Content-Type': 'application/json', ...headers }),
            body: serializeAsJson(data)
        };

        return fetch(url, options);
    },
    deleteJson(endpoint: string, path: string, data: string | object | null, headers?: Record<string, string>): Promise<Response> {
        const url = endpoint + path;

        const options = {
            method: 'DELETE',
            headers: new Headers({ 'Content-Type': 'application/json', ...headers }),
            body: serializeAsJson(data)
        };

        return fetch(url, options);
    },
}

function serializeAsJson(data: string | object | null | undefined): string | null {
    if (data == null) {
        return null;
    }
    return typeof data === 'object' ? JSON.stringify(data) : data;
}
