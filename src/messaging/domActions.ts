const SCROLL_OFFSET = 48;

export function getNextEntryScrollPosition(): number {
    const elements = document.getElementsByClassName('entry');

    for (let i = 0; i < elements.length; i++) {
        const element = elements[i] as HTMLElement;
        const top = element.getBoundingClientRect().top;
        const delta = top - SCROLL_OFFSET;
        if (delta >= 1) {
            return Math.ceil(delta);
        }
    }

    return document.documentElement.scrollHeight - window.innerHeight - window.scrollY;
}

export function getPreviousEntryScrollPosition(): number {
    const elements = document.getElementsByClassName('entry');

    for (let i = elements.length - 1; i >= 0; i--) {
        const element = elements[i] as HTMLElement;
        const top = element.getBoundingClientRect().top;
        const delta = top - SCROLL_OFFSET;
        if (delta <= -1) {
            return Math.ceil(delta);
        }
    }

    return -window.scrollY;
}

export function openUrlInBackground(url: string): void {
    if (chrome) {
        chrome.tabs.getCurrent((tab) => {
            chrome.tabs.create({
                url,
                index: tab ? tab.index + 1 : 0,
                active: false
            });
        });
    } else {
        const a = document.createElement('a');
        a.href = url;

        const event = document.createEvent('MouseEvents');
        event.initMouseEvent(
            'click', true, true, window,
            0, 0, 0, 0, 0,
            false, false, false, false,
            1, null
        );

        a.dispatchEvent(event);
    }
}
