export default function getScrollable(element: Element): Element {
    do {
        const style = getComputedStyle(element, null);
        const overflowY = style.getPropertyValue('overflow-y');

        if (overflowY === 'auto' || overflowY === 'scroll') {
            break;
        }
    } while (element.parentNode instanceof Element && (element = element.parentNode));

    return element;
}
