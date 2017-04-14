export default function persistenceMiddleware(key: string, predicate: (event: any) => boolean): (action: any, next: (action: any) => void, getState: () => any) => void {
    return (action, next, getState) => {
        next(action);

        if (predicate(action)) {
            localStorage.setItem(key, JSON.stringify(getState()));
        }
    };
}
