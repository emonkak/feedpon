export default function throttleEventHandler(handler: (event?: Event) => void, throttleTime: number): (event: Event) => void {
    let lastInvoked = 0;
    let timer = null;

    return function(event: Event): void {
        if (timer == null) {
            const { timeStamp } = event;
            const elapsedTime = timeStamp - lastInvoked;

            if (elapsedTime < throttleTime) {
                const delay = throttleTime - elapsedTime;

                timer = setTimeout(() => {
                    handler(event);

                    lastInvoked = timeStamp + delay;
                    timer = null;
                }, delay);
            } else {
                handler(event);

                lastInvoked = timeStamp;
            }
        }
    };
}
