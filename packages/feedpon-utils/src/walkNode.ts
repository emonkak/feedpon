export default function walkNode(
  rootNode: Node,
  callback: (node: Node) => Node | null,
): void {
  let nextNode: Node | null = rootNode;

  do {
    const currentNode = nextNode! as Node;

    // Save the parent node because it may be deleted
    let { parentNode } = currentNode;

    nextNode = callback(currentNode);

    if (!nextNode) {
      while (parentNode && parentNode !== rootNode) {
        if (parentNode.nextSibling) {
          nextNode = parentNode.nextSibling;
          break;
        }
        parentNode = parentNode.parentNode;
      }
    }
  } while (nextNode);
}
