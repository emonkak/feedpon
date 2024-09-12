export default function walkNode(
  rootNode: Node,
  callback: (node: Node) => Node | null,
): void {
  let currentNode: Node | null = rootNode.firstChild;

  while (currentNode !== null) {
    // Remember that parent node since it may be deleted.
    let { parentNode } = currentNode;

    currentNode = callback(currentNode);

    if (currentNode === null) {
      while (parentNode !== null && parentNode !== rootNode) {
        currentNode = parentNode.nextSibling;
        if (currentNode !== null) {
          break;
        }
        parentNode = parentNode.parentNode;
      }
    }
  }
}
