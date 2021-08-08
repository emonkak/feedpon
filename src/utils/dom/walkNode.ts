export default function walkNode(rootNode: Node, callback: (node: Node) => boolean): void {
    let walk = true;
    let currentNode = rootNode;
    let nextNode: Node | null = null;

    while (true) {
        // Save the parent-child relationship in advance because it may be deleted
        const { firstChild, nextSibling, parentNode }: {
            firstChild: Node | null,
            nextSibling: Node | null,
            parentNode: Node | null
        } = currentNode;

        if (walk) {
            walk = callback(currentNode);
        }

        if (walk && firstChild) {
            nextNode = firstChild;
        } else if (nextSibling) {
            nextNode = nextSibling;
            walk = true;
        } else {
            nextNode = parentNode;
            walk = false;
        }
        if (nextNode && nextNode !== rootNode) {
            currentNode = nextNode;
        } else {
            break;
        }
    }
}
