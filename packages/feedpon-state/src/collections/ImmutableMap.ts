const RED = Symbol('Red');
const BLACK = Symbol('Black');

interface Ref<T> {
  value: T | null;
}

/**
 * @internal
 */
export namespace ImmutableMap {
  export type Node<TKey, TValue> = Branch<TKey, TValue> | Leaf;

  export interface Branch<TKey, TValue> {
    readonly color: Color;
    readonly key: TKey;
    readonly value: TValue;
    readonly left: Node<TKey, TValue>;
    readonly right: Node<TKey, TValue>;
  }

  export type Leaf = null;

  export type Color = typeof RED | typeof BLACK;
}

export class ImmutableMap<TKey, TValue> implements Iterable<[TKey, TValue]> {
  private static readonly _EMPTY: ImmutableMap<any, any> = new ImmutableMap(
    null,
    0,
  );

  private readonly _root: ImmutableMap.Node<TKey, TValue>;

  private readonly _size: number;

  static empty<TKey, TValue>(): ImmutableMap<TKey, TValue> {
    return ImmutableMap._EMPTY;
  }

  static from<TKey, TValue>(
    source: Iterable<readonly [TKey, TValue]>,
  ): ImmutableMap<TKey, TValue>;
  static from<TKey, TValue, TItem>(
    source: Iterable<TItem>,
    selector: (item: TItem) => [TKey, TValue],
  ): ImmutableMap<TKey, TValue>;
  static from<TKey, TValue, TItem>(
    source: Iterable<[TKey, TValue]> | Iterable<TItem>,
    selector?: (item: TItem) => [TKey, TValue],
  ): ImmutableMap<TKey, TValue> {
    let node = null;
    let size = 0;
    if (selector !== undefined) {
      for (const item of source as Iterable<TItem>) {
        const [key, value] = selector(item);
        const oldNodeRef = {
          value: null,
        };
        node = insert(node, key, value, oldNodeRef);
        if (oldNodeRef.value === null) {
          size++;
        }
      }
    } else {
      for (const [key, value] of source as Iterable<[TKey, TValue]>) {
        const oldNodeRef = {
          value: null,
        };
        node = insert(node, key, value, oldNodeRef);
        if (oldNodeRef.value === null) {
          size++;
        }
      }
    }
    return new ImmutableMap(node, size);
  }

  static singleton<TKey, TValue>(
    key: TKey,
    value: TValue,
  ): ImmutableMap<TKey, TValue> {
    return new ImmutableMap(singleton(BLACK, key, value), 1);
  }

  private constructor(node: ImmutableMap.Node<TKey, TValue>, size: number) {
    this._root = node;
    this._size = size;
  }

  get size(): number {
    return this._size;
  }

  /**
   * @internal
   */
  get tree(): ImmutableMap.Tree<TKey, TValue> {
    return this._tree;
  }

  [Symbol.iterator](): Generator<[TKey, TValue]> {
    return this.entries();
  }

  *entries(): Generator<[TKey, TValue]> {
    if (this._root !== null) {
      for (const node of iterate(this._root)) {
        yield [node.key, node.value];
      }
    }
  }

  *keys(): Generator<TKey> {
    if (this._root !== null) {
      for (const node of iterate(this._root)) {
        yield node.key;
      }
    }
  }

  *values(): Generator<TValue> {
    if (this._root !== null) {
      for (const node of iterate(this._root)) {
        yield node.value;
      }
    }
  }

  delete(key: TKey): ImmutableMap<TKey, TValue> {
    const oldNodeRef = { value: null };
    const newRoot = deleteFrom(this._root, key, oldNodeRef);
    const newSize = oldNodeRef.value !== null ? this._size - 1 : this._size;
    return new ImmutableMap(newRoot, newSize);
  }

  get(key: TKey): TValue | undefined {
    return search(this._root, key)?.value;
  }

  has(key: TKey): boolean {
    return search(this._root, key) !== undefined;
  }

  set(key: TKey, value: TValue): ImmutableMap<TKey, TValue> {
    const oldNodeRef = { value: null };
    const newRoot = insert(this._root, key, value, oldNodeRef);
    const newSize = oldNodeRef.value === null ? this._size + 1 : this._size;
    return new ImmutableMap(newRoot, newSize);
  }

  update(
    key: TKey,
    updateFn: (value: TValue) => TValue,
  ): ImmutableMap<TKey, TValue> {
    const newRoot = update(this._root, key, updateFn);
    return new ImmutableMap(newRoot, this._size);
  }

  updateOrInsert(
    key: TKey,
    updateFn: (value: TValue) => TValue,
    defaultFn: () => TValue,
  ): ImmutableMap<TKey, TValue> {
    const oldNodeRef = { value: null };
    const newRoot = updateOrInsert(
      this._root,
      key,
      updateFn,
      defaultFn,
      oldNodeRef,
    );
    const newSize = oldNodeRef.value === null ? this._size + 1 : this._size;
    return new ImmutableMap(newRoot, newSize);
  }
}

export function inspectTree<TKey, TValue>({
  tree,
}: ImmutableMap<TKey, TValue>): string {
  return tree === null ? '<empty>' : [...drawBranch(tree, '', '')].join('\n');
}

function balanceLeft<TKey, TValue>(
  node: ImmutableMap.Branch<TKey, TValue>,
): ImmutableMap.Branch<TKey, TValue> {
  if (node.left?.color === RED && node.left.left?.color === RED) {
    return branch(
      RED,
      node.left.key,
      node.left.value,
      branch(
        BLACK,
        node.left.left.key,
        node.left.left.value,
        node.left.left.left,
        node.left.left.right,
      ),
      branch(BLACK, node.key, node.value, node.left.right, node.right),
    );
  } else if (node.left?.color === RED && node.left.right?.color === RED) {
    return branch(
      RED,
      node.left.right.key,
      node.left.right.value,
      branch(
        BLACK,
        node.left.key,
        node.left.value,
        node.left.left,
        node.left.right.left,
      ),
      branch(BLACK, node.key, node.value, node.left.right.right, node.right),
    );
  } else {
    return node;
  }
}

function balanceRight<TKey, TValue>(
  node: ImmutableMap.Branch<TKey, TValue>,
): ImmutableMap.Branch<TKey, TValue> {
  if (node.right?.color === RED && node.right.left?.color === RED) {
    return branch(
      RED,
      node.right.left.key,
      node.right.left.value,
      branch(BLACK, node.key, node.value, node.left, node.right.left.left),
      branch(
        BLACK,
        node.right.key,
        node.right.value,
        node.right.left.right,
        node.right.right,
      ),
    );
  } else if (node.right?.color === RED && node.right.right?.color === RED) {
    return branch(
      RED,
      node.right.key,
      node.right.value,
      branch(BLACK, node.key, node.value, node.left, node.right.left),
      branch(
        BLACK,
        node.right.right.key,
        node.right.right.value,
        node.right.right.left,
        node.right.right.right,
      ),
    );
  } else {
    return node;
  }
}

function blacken<TKey, TValue>(
  node: ImmutableMap.Node<TKey, TValue>,
): ImmutableMap.Node<TKey, TValue> {
  return node !== null
    ? branch(BLACK, node.key, node.value, node.left, node.right)
    : null;
}

function branch<TKey, TValue>(
  color: ImmutableMap.Color,
  key: TKey,
  value: TValue,
  left: ImmutableMap.Node<TKey, TValue>,
  right: ImmutableMap.Node<TKey, TValue>,
): ImmutableMap.Branch<TKey, TValue> {
  return {
    color,
    key,
    value,
    left,
    right,
  };
}

function deleteFrom<TKey, TValue>(
  node: ImmutableMap.Node<TKey, TValue>,
  key: TKey,
  oldNodeRef: Ref<ImmutableMap.Branch<TKey, TValue>>,
): ImmutableMap.Node<TKey, TValue> {
  if (node === null) {
    return null;
  } else if (key < node.key) {
    return equalizeLeft(
      branch(
        node.color,
        node.key,
        node.value,
        deleteFrom(node.left, key, oldNodeRef),
        node.right,
      ),
    );
  } else if (key > node.key) {
    return equalizeRight(
      branch(
        node.color,
        node.key,
        node.value,
        node.left,
        deleteFrom(node.right, key, oldNodeRef),
      ),
    );
  } else if (node.right !== null) {
    const minNode: Ref<ImmutableMap.Branch<TKey, TValue>> = { value: null };
    const newNode = deleteMin(node.right, minNode);
    oldNodeRef.value = node;
    return equalizeRight(
      branch(
        node.color,
        minNode.value!.key,
        minNode.value!.value,
        node.left,
        newNode,
      ),
    );
  } else {
    oldNodeRef.value = node;
    return blacken(node.left);
  }
}

function deleteMin<TKey, TValue>(
  node: ImmutableMap.Branch<TKey, TValue>,
  oldNodeRef: Ref<ImmutableMap.Branch<TKey, TValue>>,
): ImmutableMap.Node<TKey, TValue> {
  if (node.left !== null) {
    return equalizeLeft(
      branch(
        node.color,
        node.key,
        node.value,
        deleteMin(node.left, oldNodeRef),
        node.right,
      ),
    );
  } else {
    oldNodeRef.value = node;
    return blacken(node.right);
  }
}

function* drawBranch<TKey, TValue>(
  tree: ImmutableMap.Branch<TKey, TValue>,
  parentBorder: string,
  childBorder: string,
): Generator<string> {
  yield parentBorder +
    (tree.color === RED ? '🔴' : '⚫') +
    String(tree.key) +
    ':' +
    String(tree.value);
  if (tree.left !== null) {
    for (const child of drawBranch(tree.left, '+- ', '|  ')) {
      yield childBorder + child;
    }
  }
  if (tree.right !== null) {
    for (const child of drawBranch(tree.right, '`- ', '   ')) {
      yield childBorder + child;
    }
  }
}

function equalizeLeft<TKey, TValue>(
  node: ImmutableMap.Branch<TKey, TValue>,
): ImmutableMap.Branch<TKey, TValue> {
  if (node.right?.color === BLACK) {
    return balanceLeft(
      branch(
        node.color,
        node.key,
        node.value,
        node.left,
        branch(
          RED,
          node.right.key,
          node.right.value,
          node.right.left,
          node.right.right,
        ),
      ),
    );
  } else if (node.right?.color === RED) {
    return branch(
      BLACK,
      node.key,
      node.value,
      equalizeLeft(
        branch(RED, node.key, node.value, node.left, node.right.left),
      ),
      node.right.right,
    );
  } else {
    return node;
  }
}

function equalizeRight<TKey, TValue>(
  node: ImmutableMap.Branch<TKey, TValue>,
): ImmutableMap.Branch<TKey, TValue> {
  if (node.left?.color === BLACK) {
    return balanceRight(
      branch(
        node.color,
        node.key,
        node.value,
        branch(
          RED,
          node.left.key,
          node.left.value,
          node.left.left,
          node.left.right,
        ),
        node.right,
      ),
    );
  } else if (node.left?.color === RED) {
    return branch(
      BLACK,
      node.key,
      node.value,
      equalizeRight(
        branch(RED, node.key, node.value, node.left.right, node.right),
      ),
      node.left.right,
    );
  } else {
    return node;
  }
}

function insert<TKey, TValue>(
  node: ImmutableMap.Node<TKey, TValue>,
  key: TKey,
  value: TValue,
  oldNodeRef: Ref<ImmutableMap.Branch<TKey, TValue>>,
): ImmutableMap.Node<TKey, TValue> {
  return blacken(
    replace(node, key, (node) => {
      oldNodeRef.value = node;
      return node === null
        ? singleton(RED, key, value)
        : branch(node.color, key, value, node.left, node.right);
    }),
  );
}

function* iterate<TKey, TValue>(
  node: ImmutableMap.Branch<TKey, TValue>,
): Generator<ImmutableMap.Branch<TKey, TValue>> {
  if (node.left !== null) {
    yield* iterate(node.left);
  }
  yield node;
  if (node.right !== null) {
    yield* iterate(node.right);
  }
}

function replace<TKey, TValue>(
  node: ImmutableMap.Node<TKey, TValue>,
  key: TKey,
  updateFn: (
    node: ImmutableMap.Node<TKey, TValue>,
  ) => ImmutableMap.Node<TKey, TValue>,
): ImmutableMap.Node<TKey, TValue> {
  if (node === null) {
    return updateFn(null);
  } else if (key < node.key) {
    return balanceLeft(
      branch(
        node.color,
        node.key,
        node.value,
        replace(node.left, key, updateFn),
        node.right,
      ),
    );
  } else if (key > node.key) {
    return balanceRight(
      branch(
        node.color,
        node.key,
        node.value,
        node.left,
        replace(node.right, key, updateFn),
      ),
    );
  } else {
    return updateFn(node);
  }
}

function search<TKey, TValue>(
  node: ImmutableMap.Node<TKey, TValue>,
  key: TKey,
): ImmutableMap.Branch<TKey, TValue> | undefined {
  for (
    let current = node;
    current !== null;
    current = key < current.key ? current.left : current.right
  ) {
    if (key === current.key) {
      return current;
    }
  }
  return undefined;
}

function singleton<TKey, TValue>(
  color: ImmutableMap.Color,
  key: TKey,
  value: TValue,
): ImmutableMap.Branch<TKey, TValue> {
  return branch(color, key, value, null, null);
}

function update<TKey, TValue>(
  node: ImmutableMap.Node<TKey, TValue>,
  key: TKey,
  updateFn: (value: TValue) => TValue,
): ImmutableMap.Node<TKey, TValue> {
  return blacken(
    replace(node, key, (node) => {
      return node === null
        ? null
        : branch(node.color, key, updateFn(node.value), node.left, node.right);
    }),
  );
}

function updateOrInsert<TKey, TValue>(
  node: ImmutableMap.Node<TKey, TValue>,
  key: TKey,
  updateFn: (value: TValue) => TValue,
  defaultFn: () => TValue,
  oldNodeRef: Ref<ImmutableMap.Branch<TKey, TValue>>,
): ImmutableMap.Node<TKey, TValue> {
  return blacken(
    replace(node, key, (node) => {
      oldNodeRef.value = node;
      return node === null
        ? singleton(RED, key, defaultFn())
        : branch(node.color, key, updateFn(node.value), node.left, node.right);
    }),
  );
}
