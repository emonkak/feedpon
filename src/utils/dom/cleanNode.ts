import sanitizeElement, { SRCSET_ATTRS, URI_ATTRS } from './sanitizeElement';

const RESPONSIVE_ELEMENT_WIDTH = 128;
const RESPONSIVE_ELEMENT_HEIGHT = 128;

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

function responsifyImage(element: HTMLImageElement): void {
    if (element.width < RESPONSIVE_ELEMENT_WIDTH
        || element.height < RESPONSIVE_ELEMENT_HEIGHT) {
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

function resolveLazyLoading(element: HTMLImageElement): void {
    if (!element.src && element.dataset.src) {
        element.src = element.dataset.src!;
    }
}

export default function cleanNode(node: Node, baseUrl: string): boolean {
    switch (node.nodeType) {
        case node.TEXT_NODE:
            return true;

        case node.ELEMENT_NODE:
            const element = node as Element;

            switch (element.tagName) {
                case 'IMG':
                    resolveLazyLoading(element as HTMLImageElement);
                    break;
            }

            if (!sanitizeElement(element)) {
                element.remove();

                return false;
            }

            for (const attrName of URI_ATTRS) {
                if (element.hasAttribute(attrName)) {
                    element.setAttribute(attrName, qualifyUrl(element.getAttribute(attrName)!, baseUrl));
                }
            }

            for (const attrName of SRCSET_ATTRS) {
                if (element.hasAttribute(attrName)) {
                    element.setAttribute(attrName, qualifySrcset(element.getAttribute(attrName)!, baseUrl));
                }
            }

            switch (element.tagName) {
                case 'A':
                    element.setAttribute('target',  '_blank');
                    break;

                case 'IMG':
                    responsifyImage(element as HTMLImageElement);
                    break;
            }

            return true;

        default:
            if (node.parentNode) {
                node.parentNode.removeChild(node);
            }

            return false;
    }
}
