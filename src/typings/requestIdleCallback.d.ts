interface RequestIdleCallback {
    didTimeout: boolean;
    timeRemaining(): number;
}

interface RequestIdleOptions {
    timeout?: number;
}

interface Window {
    cancelIdleCallback(id: number): void;
    requestIdleCallback(callback: (deadline: RequestIdleCallback) => void, options?: RequestIdleOptions): number;
}
