export default function cleanNode(node: Node): void {
    if (node.nodeType !== node.ELEMENT_NODE) {
        return;
    }

    const element = node as Element;

    switch (element.tagName) {
        case 'A':
            (element as HTMLAnchorElement).target = '_blank';
            break;

        case 'CENTER':
            (element as HTMLElement).style.textAlign = 'left';
            break;

        case 'FONT':
            element.removeAttribute("color");
            element.removeAttribute("face");
            element.removeAttribute("size");
            break;
    }
}
