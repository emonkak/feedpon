export const PUSH = 'HISTORY/PUSH';
export const REPLACE = 'HISTORY/REPLACE';
export const GO = 'HISTORY/GO';
export const GO_BACK = 'HISTORY/GO_BACK';
export const GO_FORWARD = 'HISTORY/GO_FORWARD';

export function push(path: string) {
    return { type: PUSH, path };
}

export function replace(path: string) {
    return { type: REPLACE, path };
}

export function go(n: number) {
    return { type: GO, n };
}

export function goBack() {
    return { type: GO_BACK };
}

export function goForward() {
    return { type: GO_FORWARD };
}
