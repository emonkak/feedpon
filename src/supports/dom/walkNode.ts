export default function walkNode(node: Node, callback: (node: Node) => boolean): void {
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
