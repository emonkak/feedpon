import IHttpClient from './IHttpClient';
import IRequest from './IRequest';
import IResponse from './IResponse';

export default class HttpClient implements IHttpClient {
    send<T>(request: IRequest): Promise<IResponse<T>> {
        let xhr = new XMLHttpRequest(),
            method = request.method,
            url = request.url,
            params = request.params,
            headers = request.headers,
            withCredentials = request.withCredentials,
            data = request.data || null,
            timeout = request.timeout,
            responseType = request.responseType;

        if (params) {
            url += (url.indexOf('?') === -1 ? '?' : '&') + serializeData(params);
        }

        xhr.open(method, url, true);

        if (headers) {
            for (let key in headers) {
                xhr.setRequestHeader(key, headers[key]);
            }
        }

        if (withCredentials) {
            xhr.withCredentials = true;
        }

        if (responseType) {
            xhr.responseType = responseType;
        }

        if (typeof data === 'object') {
            data = JSON.stringify(data);
        }

        let promise = new Promise((resolve, reject) => {
            xhr.onerror = xhr.onabort = () => {
                reject({
                    data: null,
                    headers: null,
                    status: -1,
                    statusText: ''
                });

                xhr = null;
            };

            xhr.onload = () => {
                let response = {
                    data: ('response' in xhr) ? xhr.response : xhr.responseText,
                    headers: parseHeaders(xhr.getAllResponseHeaders()),
                    status: xhr.status,
                    statusText: xhr.statusText
                };

                if (isSuccess(xhr.status)) {
                    resolve(response);
                } else {
                    reject(response);
                }

                xhr = null;
            };
        });

        xhr.send(data);

        if (timeout > 0) setTimeout(() => xhr && xhr.abort(), timeout);

        return promise;
    }
}

function isSuccess(status: number): boolean {
    return 200 <= status && status < 300;
}

function serializeData(data: any): string { 
    let buffer: string[] = [];

    // Serialize each key in the object.
    for (let name in data) {
        if (!data.hasOwnProperty(name)) {
            continue;
        }

        let value = data[name];

        buffer.push(
            encodeURIComponent(name) +
            '=' +
            encodeURIComponent(value == null ? '' : value)
        );
    }

    // Serialize the buffer and clean it up for transportation.
    return buffer.join('&').replace(/%20/g, '+');
}

function parseHeaders(headers: string): {[key: string]: string} {
    let parsed: {[key: string]: string} = {};

    function fillInParsed(key, val) {
        if (key) {
            parsed[key] = parsed[key] ? parsed[key] + ', ' + val : val;
        }
    }

    headers.split('\n').forEach((line) => {
        let i = line.indexOf(':');
        fillInParsed(line.substr(0, i).trim().toLowerCase(), line.substr(i + 1).trim());
    });

    return parsed;
}
