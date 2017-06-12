export default function debounceEventHandler<T extends { timeStamp: number }>(handler: (event?: T) => void, debounceTime: number): (event: T) => void {
    let lastCalled = 0;
    let timer: number | null = null;

    function next(event: T, timeStamp: number) {
        const elapsedTime = timeStamp - lastCalled;

        if (elapsedTime >= debounceTime) {
            handler(event);
        } else {
            timer = setTimeout(() => {
                const currentTime = timeStamp + debounceTime;

                timer = null;

                next(event, currentTime);

                lastCalled = currentTime;
            }, debounceTime);
        }
    }

    return function(event: T): void {
        const { timeStamp } = event;

        if (timer === null) {
            next(event, timeStamp);
        }

        lastCalled = timeStamp;
    };
}
