export default function asyncMiddleware(action: any, next: (action: any) => void): void {
    if (typeof action === 'function') {
        action(next);
    } else {
        next(action);
    }
}
