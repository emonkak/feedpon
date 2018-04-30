export function getNextEntryScrollPosition(): number {
    const elements = document.getElementsByClassName('entry');
    const scrollOffset = getScrollOffset();

    for (let i = 0; i < elements.length; i++) {
        const element = elements[i] as HTMLElement;
        const top = element.getBoundingClientRect().top;
        const delta = top - scrollOffset;
        if (delta >= 1) {
            return Math.ceil(delta);
        }
    }

    return document.documentElement.scrollHeight - window.innerHeight - window.scrollY;
}

export function getPreviousEntryScrollPosition(): number {
    const elements = document.getElementsByClassName('entry');
    const scrollOffset = getScrollOffset();

    for (let i = elements.length - 1; i >= 0; i--) {
        const element = elements[i] as HTMLElement;
        const top = element.getBoundingClientRect().top;
        const delta = top - scrollOffset;
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

export function getScrollOffset(): number {
    const navbar = document.getElementsByClassName('navbar')[0];
    return navbar ? (navbar as HTMLElement).offsetHeight : 0;
}
