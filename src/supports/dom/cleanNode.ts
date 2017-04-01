export default function cleanNode(node: Node): boolean {
    if (node.nodeType !== node.ELEMENT_NODE) {
        return true;
    }

    const element = node as Element;

    switch (element.tagName) {
        case 'A':
            (element as HTMLAnchorElement).target = '_blank';
            break;

        case 'FONT':
            element.removeAttribute('color');
            element.removeAttribute('face');
            element.removeAttribute('size');
            break;
    }

    return true;
}
