/// <reference path="../../typings/whatwg-fetch.d.ts" />

export function getRequest(url: string, data?: { [key: string]: any }): Request {
    const body = data ? Object.keys(data).reduce((acc, key) => {
        acc.append(key, data[key])
        return acc
    }, new FormData()) : null
    return new Request(url, {
        method: 'GET',
        body
    })
}

export function postRequest(url: string, data?: { [key: string]: any }): Request {
    return new Request(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: data ? JSON.stringify(data) : null
    })
}

export function deleteRequest(url: string, data?: { [key: string]: any }): Request {
    return new Request(url, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        },
        body: data ? JSON.stringify(data) : null
    })
}
