export default function walkNode(node: Node, callback: (node: Node) => boolean): void {
    let walk = true;
    let depth = 0;

    do {
        if (walk) {
            walk = callback(node);
        }

        let nextNode: Node | null = null;

        if (walk && (nextNode = node.firstChild)) {
            depth++;
        } else if (depth > 0 && (nextNode = node.nextSibling)) {
            walk = true;
        } else {
            nextNode = node.parentNode;
            walk = false;
            depth--;
        }

        if (!nextNode) {
            break;
        }

        node = nextNode;
    } while (depth > 0);
}
