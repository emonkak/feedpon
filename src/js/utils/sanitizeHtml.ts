const HTML_ESCAPES: {[key: string]: string} = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;'
}

const ESCAPE_HTML_CHAR_REGEXP = new RegExp('[&<>"\']', 'g')

// Safe Void Elements - HTML5
// http://dev.w3.org/html5/spec/Overview.html#void-elements
const VOID_ELEMENTS = makeMap(['area', 'br', 'col', 'hr', 'img', 'wbr'])

// Elements that you can, intentionally, leave open (and which close themselves)
// http://dev.w3.org/html5/spec/Overview.html#optional-tags
const OPTIONAL_END_TAG_ELEMENTS = makeMap(['colgroup', 'dd', 'dt', 'li', 'p', 'tbody', 'td', 'tfoot', 'th', 'thead', 'tr', 'rp', 'rt'])

// Safe Block Elements - HTML5
const BLOCK_ELEMENTS = makeMap(['address', 'article', 'aside', 'blockquote', 'caption', 'center', 'del', 'dir', 'div', 'dl', 'figcaption', 'figure', 'footer', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'header', 'hgroup', 'hr', 'ins', 'main', 'map', 'menu', 'nav', 'ol', 'pre', 'section', 'table', 'ul'])

// Inline Elements - HTML5
const INLINE_ELEMENTS = makeMap(['a', 'abbr', 'acronym', 'b', 'bdi', 'bdo', 'big', 'br', 'cite', 'code', 'del', 'dfn', 'em', 'font', 'i', 'img', 'ins', 'kbd', 'label', 'map', 'mark', 'q', 'ruby', 'rp', 'rt', 's', 'samp', 'small', 'span', 'strike', 'strong', 'sub', 'sup', 'time', 'tt', 'u', 'var'])

const VALID_ELEMENTS = Object.assign(
    {},
    VOID_ELEMENTS,
    OPTIONAL_END_TAG_ELEMENTS,
    BLOCK_ELEMENTS,
    INLINE_ELEMENTS
)

const URI_ATTRS = makeMap(['background', 'cite', 'href', 'longdesc', 'src', 'usemap', 'xlink:href'])

const HTML_ATTRS = makeMap(['abbr', 'align', 'alt', 'axis', 'bgcolor', 'border', 'cellpadding', 'cellspacing', 'clear', 'color', 'cols', 'colspan', 'compact', 'coords', 'dir', 'face', 'headers', 'height', 'hreflang', 'hspace', 'ismap', 'lang', 'language', 'nohref', 'nowrap', 'rel', 'rev', 'rows', 'rowspan', 'rules', 'scope', 'scrolling', 'shape', 'size', 'span', 'start', 'summary', 'target', 'title', 'type', 'valign', 'value', 'vspace', 'width'])

const VALID_ATTRS = Object.assign(
    {},
    URI_ATTRS,
    HTML_ATTRS
)

function makeMap(items: string[]): { [key: string]: boolean } {
    const obj: { [key: string]: boolean } = {}
    for (let i = 0, l = items.length; i < l; i++) {
        const key = items[i]
        obj[key] = true
    }
    return obj
}

function escapeHtmlChar(char: string): string {
    return HTML_ESCAPES[char]
}

function escapeHtml(str: string): string {
    return str.replace(ESCAPE_HTML_CHAR_REGEXP, escapeHtmlChar)
}

function isSafetyAttribute(attr: Attr): boolean {
    return attr.name.toLowerCase() in VALID_ATTRS
}

function isSafetyNode(node: Node): boolean {
    return node.nodeName.toLowerCase() in VALID_ELEMENTS
}

function isVoidElement(node: Node): boolean {
    return node.nodeName.toLowerCase() in VOID_ELEMENTS
}

function createOpenTag(node: Node): string {
    const attrs = node.attributes;
    const attrValues: string[] = [];

    for (let i = 0, l = attrs.length; i < l; i++) {
        const attr = attrs[i]

        if (isSafetyAttribute(attr)) {
            const attrName = attr.name
            const attrValue = attr.value

            if (attrValue == null) {
                attrValues.push(attrName)
            } else {
                attrValues.push(attrName + '="' + escapeHtml(attrValue) + '"')
            }
        }
    }

    return '<' + node.nodeName.toLowerCase() +
                 (attrValues.length ? ' ' + attrValues.join(' ') : '') + '>'
}

function createCloseTag(node: Node): string {
    return '</' + node.nodeName.toLowerCase() + '>'
}

export default function sanitizeHtml(target: Node): string {
    let html = ''
    let current = target

    const queue: Node[] = []

    do {
        switch (current.nodeType) {
            case current.TEXT_NODE:
                html += current.textContent
                break
            case current.ELEMENT_NODE:
                if (isSafetyNode(current)) {
                    html += createOpenTag(current)

                    const { childNodes } = current
                    if (childNodes.length) {
                        for (let i = childNodes.length - 1; i >= 0; --i) {
                            queue.push(childNodes[i])
                        }
                    } else if (!isVoidElement(current)) {
                        html += createCloseTag(current)
                    }
                }
                break
        }

        while (!current.nextSibling && (current = current.parentNode)) {
            html += createCloseTag(current)
        }
    } while (current = queue.pop())

    return html
}
