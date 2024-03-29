import { SRCSET_ATTRS, URI_ATTRS, sanitizeElement } from './htmlSanitizer';
import parseSrcset from './parseSrcset';

const MINIUM_RESPONSIVE_ELEMENT_WIDTH = 128;
const MINIUM_RESPONSIVE_ELEMENT_HEIGHT = 128;

export default function cleanNode(node: Node, baseUrl: string): Node | null {
    switch (node.nodeType) {
        case node.TEXT_NODE:
            return node.nextSibling ?? null;

        case node.ELEMENT_NODE:
            return cleanElement(node as Element, baseUrl);

        default:
            const nextNode = node.nextSibling ?? null;
            if (node.parentNode) {
                node.parentNode.removeChild(node);
            }
            return nextNode;
    }
}

function cleanElement(element: Element, baseUrl: string): Node | null {
    switch (element.tagName) {
        case 'IMG':
            resolveLazyLoading(element as HTMLImageElement);
            break;
        default:
            // Replace custom elements to wrapper element.
            if (element.tagName.indexOf('-') >= 0) {
                const parentNode = element.parentNode;

                if (parentNode) {
                    const container = document.createElement('div');
                    container.style.display = 'contents';
                    let child;
                    while (child = element.firstChild) {
                        container.appendChild(child);
                    }
                    parentNode.replaceChild(container, element);
                    return container.firstChild ?? container.nextSibling ?? null;
                }
            }
            break;
    }

    for (const attrName in URI_ATTRS) {
        if (element.hasAttribute(attrName)) {
            element.setAttribute(attrName, qualifyUrl(element.getAttribute(attrName)!, baseUrl));
        }
    }

    for (const attrName in SRCSET_ATTRS) {
        if (element.hasAttribute(attrName)) {
            element.setAttribute(attrName, qualifySrcset(element.getAttribute(attrName)!, baseUrl));
        }
    }

    if (!sanitizeElement(element)) {
        const nextNode = element.nextSibling ?? null;
        element.remove();
        return nextNode;
    }

    const nextNode = element.firstChild ?? element.nextSibling ?? null;

    switch (element.tagName) {
        case 'A':
            element.setAttribute('target',  '_blank');
            break;

        case 'TABLE':
            responsifyTable(element as HTMLTableElement);
            break;

        case 'IMG':
            responsify(element as HTMLImageElement);
            break;

        case 'VIDEO':
            responsify(element as HTMLVideoElement);
            break;

        case 'IFRAME':
            responsify(element as any);  // BUG: Defined 'width' as 'string' at the type definition
            sandboxifyIframe(element as HTMLIFrameElement);
            break;
    }

    return nextNode;
}

function qualifyUrl(urlString: string, baseUrlString: string): string {
    try {
        return new URL(urlString, baseUrlString).toString();
    } catch (error) {
        return urlString;
    }
}

function qualifySrcset(srcsetString: string, baseUrlString: string): string {
    return parseSrcset(srcsetString)
        .map(({ url, descriptor }) =>
            qualifyUrl(url, baseUrlString) + (descriptor ? ' ' + descriptor : '')
        )
        .join(', ');
}

function resolveLazyLoading(element: HTMLImageElement): void {
    if (element.dataset.src && !element.src.endsWith(encodeURI(element.dataset.src))) {
        element.src = element.dataset.src;
    }
    if (element.dataset.srcset) {
        element.srcset = element.dataset.srcset;
    }
    if (element.dataset.lazySrc && !element.src.endsWith(encodeURI(element.dataset.lazySrc))) {
        element.src = element.dataset.lazySrc;
    }
    if (element.dataset.lazySrcset) {
        element.srcset = element.dataset.lazySrcset;
    }
}

function responsify(element: HTMLElement & { width: number, height: number }): void {
    if (element.width < MINIUM_RESPONSIVE_ELEMENT_WIDTH
        || element.height < MINIUM_RESPONSIVE_ELEMENT_HEIGHT) {
        return;
    }

    if (element.parentNode) {
        const wrapper = document.createElement('div');
        wrapper.className = 'responsive-wrapper';
        wrapper.style.paddingBottom = (element.height / element.width * 100) + '%';

        const container = document.createElement('div');
        container.className = 'responsive-container';
        container.style.maxWidth = element.width + 'px';
        container.style.maxHeight = element.height + 'px';
        container.appendChild(wrapper);

        element.parentNode.replaceChild(container, element);

        wrapper.appendChild(element);
    }
}

function responsifyTable(element: HTMLTableElement): void {
    const wrapper = document.createElement('div');
    wrapper.className = 'u-responsive';

    if (element.parentNode) {
        element.parentNode.replaceChild(wrapper, element);
        wrapper.appendChild(element);
    }
}

function sandboxifyIframe(element: HTMLElement): void {
    element.setAttribute('sandbox', 'allow-popups allow-same-origin allow-scripts');
}
