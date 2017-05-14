export default function walkNode(node: Node, callback: (node: Node) => boolean): void {
    let walk = true;
    let depth = 0;
    let currentNode: Node | null = node;

    do {
        // Save the parent-child relationship in advance because it may be deleted
        const { firstChild, nextSibling, parentNode }: {
            firstChild: Node | null,
            nextSibling: Node | null,
            parentNode: Node | null
        } = currentNode;

        if (walk && depth > 0) {
            walk = callback(currentNode)
        }

        if (walk && firstChild) {
            currentNode = firstChild;
            depth++;
        } else if (nextSibling) {
            currentNode = nextSibling;
            walk = true;
        } else {
            currentNode = parentNode;
            walk = false;
            depth--;
        }
    } while (depth > 0 && currentNode);
}
