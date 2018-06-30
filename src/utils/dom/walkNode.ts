export default function walkNode(rootNode: Node, callback: (node: Node) => boolean): void {
    let walk = true;
    let currentNode: Node | null = rootNode;

    do {
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
            currentNode = firstChild;
        } else if (nextSibling) {
            currentNode = nextSibling;
            walk = true;
        } else {
            currentNode = parentNode;
            walk = false;
        }
    } while (currentNode && currentNode !== rootNode);
}
