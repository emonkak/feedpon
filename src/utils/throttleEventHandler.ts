export default function throttleEventHandler(handler: (event?: Event) => void, throttleTime: number): (event: Event) => void {
    let lastInvoked = 0;

    return function(event: Event): void {
        const { timeStamp } = event;

        if (timeStamp - lastInvoked > throttleTime) {
            handler(event);

            lastInvoked = timeStamp;
        }
    };
}
