// Safe Void Elements - HTML5
// http://dev.w3.org/html5/spec/Overview.html#void-elements
const VOID_ELEMENTS = new Set(['area', 'br', 'col', 'hr', 'img', 'wbr']);

// Elements that you can, intentionally, leave open (and which close themselves)
// http://dev.w3.org/html5/spec/Overview.html#optional-tags
const OPTIONAL_END_TAG_ELEMENTS = new Set(['colgroup', 'dd', 'dt', 'li', 'p', 'tbody', 'td', 'tfoot', 'th', 'thead', 'tr', 'rp', 'rt']);

// Safe Block Elements - HTML5
const BLOCK_ELEMENTS = new Set(['address', 'article', 'aside', 'blockquote', 'caption', 'center', 'del', 'dir', 'div', 'dl', 'figcaption', 'figure', 'footer', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'header', 'hgroup', 'hr', 'ins', 'main', 'map', 'menu', 'nav', 'ol', 'pre', 'section', 'table', 'ul']);

// Inline Elements - HTML5
const INLINE_ELEMENTS = new Set(['a', 'abbr', 'acronym', 'b', 'bdi', 'bdo', 'big', 'br', 'cite', 'code', 'del', 'dfn', 'em', 'font', 'i', 'img', 'ins', 'kbd', 'label', 'map', 'mark', 'nobr', 'q', 'rp', 'rt', 'ruby', 's', 'samp', 'small', 'span', 'strike', 'strong', 'sub', 'sup', 'time', 'tt', 'u', 'var']);

const SAFE_ELEMENTS = new Set([
    ...VOID_ELEMENTS,
    ...OPTIONAL_END_TAG_ELEMENTS,
    ...BLOCK_ELEMENTS,
    ...INLINE_ELEMENTS
]);

const URI_ATTRS = new Set(['background', 'cite', 'href', 'longdesc', 'src', 'usemap', 'xlink:href']);

const HTML_ATTRS = new Set(['abbr', 'align', 'alt', 'axis', 'bgcolor', 'border', 'cellpadding', 'cellspacing', 'clear', 'color', 'cols', 'colspan', 'compact', 'coords', 'dir', 'face', 'headers', 'height', 'hreflang', 'hspace', 'ismap', 'lang', 'language', 'nohref', 'nowrap', 'rel', 'rev', 'rows', 'rowspan', 'rules', 'scope', 'scrolling', 'shape', 'size', 'span', 'start', 'summary', 'target', 'title', 'type', 'valign', 'value', 'vspace', 'width']);

const SAFE_ATTRS = new Set([
    ...URI_ATTRS,
    ...HTML_ATTRS
]);

const SAFE_HREF_REGEXP = new RegExp('^https?://');

function isSafeAttribute(attrnName: string): boolean {
    return SAFE_ATTRS.has(attrnName.toLowerCase());
}

function isSafeElement(tagNmae: string): boolean {
    return SAFE_ELEMENTS.has(tagNmae.toLowerCase());
}

function sanitize(node: Node) {
    if (node.nodeType === node.TEXT_NODE) {
        return true;
    }

    if (node.nodeType === node.ELEMENT_NODE) {
        if (isSafeElement(node.nodeName)) {
            sanitizeAttributes(node as Element);
            return true;
        }

        (node as Element).remove();
    }

    return false;
}

function sanitizeAttributes(node: Element) {
    const { attributes } = node;

    for (let i = attributes.length - 1; i >= 0; i--) {
        const attr = attributes[i];

        if (!isSafeAttribute(attr.name)) {
            node.removeAttribute(attr.name);
        }

        if (attr.name.toLowerCase() === 'href') {
            if (!SAFE_HREF_REGEXP.test(attr.value)) {
                node.setAttribute('href', 'javascript:void(0)');
            }
        }
    }
}

function walkNode(node: Node, callback: (node: Node) => boolean): void {
    let walk = true;
    let depth = 0;

    do {
        const { parentNode } = node;

        if (walk) {
            walk = callback(node);
        }

        let nextNode: Node;

        if (walk && (nextNode = node.firstChild)) {
            depth++;
        } else if (depth > 0 && (nextNode = node.nextSibling)) {
            walk = true;
        } else {
            nextNode = parentNode;
            walk = false;
            depth--;
        }

        node = nextNode;
    } while (depth > 0);
}

export default function sanitizeNode(node: Node): void {
    for (const child of node.childNodes) {
        walkNode(child, sanitize);
    }
}
