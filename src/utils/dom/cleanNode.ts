import { SRCSET_ATTRS, URI_ATTRS, sanitizeElement } from './htmlSanitizer';

const MINIUM_RESPONSIVE_ELEMENT_WIDTH = 128;
const MINIUM_RESPONSIVE_ELEMENT_HEIGHT = 128;

export default function cleanNode(node: Node, baseUrl: string): boolean {
    switch (node.nodeType) {
        case node.TEXT_NODE:
            return true;

        case node.ELEMENT_NODE:
            return cleanElement(node as Element, baseUrl);

        default:
            if (node.parentNode) {
                node.parentNode.removeChild(node);
            }

            return false;
    }
}

function cleanElement(element: Element, baseUrl: string): boolean {
    switch (element.tagName) {
        case 'IMG':
            resolveLazyLoading(element as HTMLImageElement);
            break;
    }

    if (!sanitizeElement(element)) {
        return false;
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

    switch (element.tagName) {
        case 'A':
            element.setAttribute('target',  '_blank');
            break;

        case 'IMG':
            responsify(element as HTMLImageElement);
            break;

        case 'VIDEO':
            responsify(element as HTMLVideoElement);
            break;

        case 'IFRAME':
            responsify(element as any);  // BUG: defnied 'width' as 'string'
            sandboxifyIframe(element as HTMLIFrameElement);
            break;
    }

    return true;
}

function qualifyUrl(urlString: string, baseUrlString: string): string {
    try {
        return new URL(urlString, baseUrlString).toString();
    } catch (error) {
        return urlString;
    }
}

function qualifySrcset(srcsetString: string, baseUrlString: string): string {
    return srcsetString
        .split(',')
        .map((url) => {
            const [first, second] = url.trim().split(' ', 2);
            return qualifyUrl(first, baseUrlString) + ' ' + (second || '');
        })
        .join(',');
}

function resolveLazyLoading(element: HTMLImageElement): void {
    if (!element.src && element.dataset.src) {
        element.src = element.dataset.src!;
    }
}

function responsify(element: HTMLElement & { width: number, height: number }): void {
    if (element.width < MINIUM_RESPONSIVE_ELEMENT_WIDTH
        || element.height < MINIUM_RESPONSIVE_ELEMENT_HEIGHT) {
        return;
    }

    const inner = document.createElement('div');
    inner.className = 'responsive-container-inner';
    inner.style.paddingBottom = (element.height / element.width * 100) + '%';

    const container = document.createElement('div');
    container.className = 'responsive-container';
    container.style.maxWidth = element.width + 'px';
    container.style.maxHeight = element.height + 'px';
    container.appendChild(inner);

    if (element.parentNode) {
        element.parentNode.replaceChild(container, element);

        inner.appendChild(element);
    }
}

function sandboxifyIframe(element: HTMLElement): void {
    element.setAttribute('sandbox', 'allow-popups allow-same-origin allow-scripts');
}
