export default function throttleEventHandler(handler: (event?: Event) => void, throttleTime: number): (event: Event) => void {
    let lastInvoked = 0;
    let timer: number | null = null;

    return function(event: Event): void {
        const { timeStamp } = event;
        const elapsedTime = timeStamp - lastInvoked;

        if (elapsedTime < throttleTime) {
            if (timer == null) {
                const delay = throttleTime - elapsedTime;

                timer = setTimeout(() => {
                    handler(event);

                    lastInvoked = timeStamp + delay;
                    timer = null;
                }, delay);
            }
        } else {
            if (timer != null) {
                clearTimeout(timer);

                timer = null;
            }

            handler(event);

            lastInvoked = timeStamp;
        }
    };
}
