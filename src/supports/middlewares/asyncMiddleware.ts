export default function asyncMiddleware(event: any, next: (event: any) => void, getState: () => any): void {
    if (typeof event === 'function') {
        event(next, getState);
    } else {
        next(event);
    }
}
