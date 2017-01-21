export function pushHistory(path: string) {
    return { type: 'PUSH_HISTORY', path };
}

export function replaceHistory(path: string) {
    return { type: 'REPLACE_HISTORY', path };
}

export function goHistory(n: number) {
    return { type: 'GO_HISTORY', n };
}

export function goBackHistory() {
    return { type: 'GO_BACK_HISTORY' };
}

export function goForwardHistory() {
    return { type: 'GO_FORWARD_HISTORY' };
}
