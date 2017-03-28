export default function asyncMiddleware(action: any, next: (action: any) => void, getState: () => any): void {
    if (typeof action === 'function') {
        action(next, getState);
    } else {
        next(action);
    }
}
