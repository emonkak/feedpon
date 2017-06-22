export default function throttleEventHandler<T extends { timeStamp: number }>(handler: (event?: T) => void, throttleTime: number): (event: T) => void {
    let lastInvoked = 0;
    let timer: number | null = null;

    return function(this: any, event: T): void {
        const { timeStamp } = event;

        if (timer === null) {
            const elapsedTime = timeStamp - lastInvoked;

            if (elapsedTime >= throttleTime) {
                handler(event);
                lastInvoked = timeStamp;
            } else {
                const delay = throttleTime - elapsedTime;

                timer = setTimeout(() => {
                    handler.call(this, event);
                    lastInvoked = timeStamp + delay;
                    timer = null;
                }, delay);
            }
        }
    };
}
