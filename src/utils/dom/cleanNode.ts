import sanitizeElement, { SRCSET_ATTRS, URI_ATTRS } from './sanitizeElement';

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

            switch (element.tagName) {
                case 'A':
                    element.setAttribute('target',  '_blank');
                    break;
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

            return true;

        default:
            if (node.parentNode) {
                node.parentNode.removeChild(node);
            }

            return false;
    }
}
