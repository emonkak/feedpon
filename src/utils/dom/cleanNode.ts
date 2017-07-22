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

function responsify(element: HTMLElement & { width: number, height: number }): void {
    if (element.width < RESPONSIVE_ELEMENT_WIDTH
        && element.height < RESPONSIVE_ELEMENT_HEIGHT) {
        return;
    }

    const container = document.createElement('div');
    container.style.position = 'relative';
    container.style.width = '100%';
    container.style.paddingBottom = (element.height / element.width * 100) + '%';

    const wrapper = document.createElement('div');
    wrapper.style.maxWidth = element.width + 'px';
    wrapper.style.maxHeight = element.height + 'px';
    wrapper.appendChild(container);

    if (element.parentNode) {
        element.parentNode.replaceChild(wrapper, element);

        element.style.position = 'absolute';
        element.style.top = '0';
        element.style.left = '0';
        element.style.width = '100%';
        element.style.height = '100%';

        container.appendChild(element);
    }
}

export default function cleanNode(node: Node, baseUrl: string): boolean {
    switch (node.nodeType) {
        case node.TEXT_NODE:
            return true;

        case node.ELEMENT_NODE:
            const element = node as Element;

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
                    responsify(element as HTMLImageElement);
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
