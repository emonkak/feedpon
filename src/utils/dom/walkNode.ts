export default function walkNode(node: Node, callback: (node: Node) => boolean): void {
    let walk = true;
    let depth = 0;
    let currentNode: Node | null = node;

    do {
        // Save in advance
        const { firstChild, nextSibling, parentNode }: {
            firstChild: Node | null,
            nextSibling: Node | null,
            parentNode: Node | null
        } = currentNode;

        if (walk) {
            walk = callback(currentNode)
        }

        if (walk && (currentNode = firstChild)) {
            depth++;
        } else if (currentNode = nextSibling) {
            walk = true;
        } else {
            currentNode = parentNode;
            depth--;
            walk = false;
        }
    } while (depth > 0 && currentNode);
}
