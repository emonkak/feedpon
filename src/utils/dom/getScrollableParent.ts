export default function getScrollableParent(el: Element): Element | Window {
    do {
        el = el.parentNode as Element;

        const { overflowX, overflowY } = window.getComputedStyle(el, null);

        if (overflowX === 'auto' ||
            overflowX === 'scroll' ||
            overflowY === 'auto' ||
            overflowY === 'scroll') {
            return el;
        }
    } while (el !== el.ownerDocument.body);

    return window;
}
