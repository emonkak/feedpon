// Safe Void Elements - HTML5
// http://dev.w3.org/html5/spec/Overview.html#void-elements
const VOID_ELEMENTS = new Set(['area', 'br', 'col', 'hr', 'img', 'wbr']);

// Elements that you can, intentionally, leave open (and which close themselves)
// http://dev.w3.org/html5/spec/Overview.html#optional-tags
const OPTIONAL_END_TAG_ELEMENTS = new Set(['colgroup', 'dd', 'dt', 'li', 'p', 'tbody', 'td', 'tfoot', 'th', 'thead', 'tr', 'rp', 'rt']);

// Safe Block Elements - HTML5
const BLOCK_ELEMENTS = new Set(['address', 'article', 'aside', 'blockquote', 'caption', 'center', 'del', 'details', 'dialog', 'dir', 'div', 'dl', 'figcaption', 'figure', 'footer', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'header', 'hgroup', 'hr', 'ins', 'main', 'map', 'menu', 'nav', 'ol', 'pre', 'section', 'summary', 'table', 'ul']);

// Inline Elements - HTML5
const INLINE_ELEMENTS = new Set(['a', 'abbr', 'acronym', 'audio', 'b', 'bdi', 'bdo', 'big', 'br', 'cite', 'code', 'del', 'dfn', 'em', 'font', 'i', 'img', 'ins', 'kbd', 'label', 'map', 'mark', 'picture', 'q', 'rp', 'rt', 'ruby', 's', 'samp', 'small', 'span', 'strike', 'strong', 'sub', 'sup', 'time', 'track',  'tt', 'u', 'var', 'video']);

const VALID_ELEMENTS = new Set([
    ...VOID_ELEMENTS,
    ...OPTIONAL_END_TAG_ELEMENTS,
    ...BLOCK_ELEMENTS,
    ...INLINE_ELEMENTS
]);

const URI_ATTRS = new Set(['background', 'cite', 'href', 'longdesc', 'src', 'usemap', 'xlink:href']);

const SRCSET_ATTRS = new Set(['srcset']);

const HTML_ATTRS = new Set(['abbr', 'accesskey', 'align', 'alt', 'autoplay', 'axis', 'bgcolor', 'border', 'cellpadding', 'cellspacing', 'clear', 'color', 'cols', 'colspan',  'compact', 'controls', 'coords', 'datetime', 'default', 'dir', 'download', 'face', 'headers', 'height', 'hidden', 'hreflang', 'hspace',  'ismap', 'itemprop', 'itemscope', 'kind', 'label', 'lang', 'language', 'loop', 'media', 'muted', 'nohref', 'nowrap', 'open', 'preload', 'rel', 'rev', 'role', 'rows', 'rowspan', 'rules',  'scope', 'scrolling', 'shape', 'size', 'sizes', 'span', 'srclang', 'start', 'summary', 'tabindex', 'target', 'title', 'translate', 'type', 'usemap',  'valign', 'value', 'vspace', 'width']);

const VAILD_ATTRS = new Set([
    ...HTML_ATTRS,
    ...SRCSET_ATTRS,
    ...URI_ATTRS,
]);

const SAFE_URL_PATTERN = /^(?:(?:https?|mailto|ftp|tel|file):|[^&:/?#]*(?:[/?#]|$))/gi;

const DATA_URL_PATTERN =
    /^data:(?:image\/(?:bmp|gif|jpeg|jpg|png|tiff|webp)|video\/(?:mpeg|mp4|ogg|webm)|audio\/(?:mp3|oga|ogg|opus));base64,[a-z0-9+\/]+=*$/i;

function isValidElement(tagNmae: string): boolean {
    return VALID_ELEMENTS.has(tagNmae.toLowerCase());
}

function isUriAttribute(attrName: string): boolean {
    return URI_ATTRS.has(attrName.toLowerCase());
}

function isSrcsetAttribute(attrName: string): boolean {
    return SRCSET_ATTRS.has(attrName.toLowerCase());
}

function isValidAttribute(attrName: string): boolean {
    return VAILD_ATTRS.has(attrName.toLowerCase());
}

function sanitizeUrl(url: string): string {
    if (url.match(SAFE_URL_PATTERN) || url.match(DATA_URL_PATTERN)) {
        return url;
    }

    return 'unsafe:' + url;
}

function sanitizeSrcset(srcset: string): string {
    return srcset
        .split(',')
        .map(url => sanitizeUrl(url.trim()))
        .join(',');
}

function sanitizeAttribute(node: Element, attr: Attr): void {
    if (isValidAttribute(attr.name)) {
        if (isUriAttribute(attr.name)) {
            node.setAttribute(attr.name, sanitizeUrl(attr.value));
        }
        if (isSrcsetAttribute(attr.name)) {
            node.setAttribute(attr.name, sanitizeSrcset(attr.value));
        }
    } else {
        node.removeAttribute(attr.name);
    }
}

function step(node: Node): boolean {
    switch (node.nodeType) {
        case node.TEXT_NODE:
            return true;

        case node.ELEMENT_NODE:
            if (isValidElement(node.nodeName)) {
                const { attributes } = node;

                for (let i = attributes.length - 1; i >= 0; i--) {
                    sanitizeAttribute(node as Element, attributes[i]);
                }

                return true;
            }

            (node as Element).remove();

            break;
    }

    return false;
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
    walkNode(node, step);
}
