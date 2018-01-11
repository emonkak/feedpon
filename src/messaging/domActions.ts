const SCROLL_OFFSET = 48;

export function getNextEntryScrollPosition(): number {
    const elements = document.getElementsByClassName('entry');
    const scrollY = window.scrollY + SCROLL_OFFSET;

    for (let i = 0; i < elements.length; i++) {
        const element = elements[i] as HTMLElement;
        if (element.offsetTop > scrollY) {
            return element.offsetTop - SCROLL_OFFSET;
        }
    }

    return document.documentElement.scrollHeight - window.innerHeight;
}

export function getPreviousEntryScrollPosition(): number {
    const elements = document.getElementsByClassName('entry');
    const scrollY = window.scrollY + SCROLL_OFFSET;

    for (let i = elements.length - 1; i >= 0; i--) {
        const element = elements[i] as HTMLElement;
        if (element.offsetTop < scrollY) {
            return element.offsetTop - SCROLL_OFFSET;
        }
    }

    return 0;
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
