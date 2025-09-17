const RED = Symbol('Red');
const BLACK = Symbol('Black');

interface Ref<T> {
  value: T | null;
}

/**
 * @internal
 */
export namespace ImmutableMap {
  export type Tree<TKey, TValue> = Branch<TKey, TValue> | Leaf;

  export interface Branch<TKey, TValue> {
    readonly color: Color;
    readonly key: TKey;
    readonly value: TValue;
    readonly left: Tree<TKey, TValue>;
    readonly right: Tree<TKey, TValue>;
  }

  export type Leaf = null;

  export type Color = typeof RED | typeof BLACK;
}

export class ImmutableMap<TKey, TValue> implements Iterable<[TKey, TValue]> {
  private static readonly _EMPTY: ImmutableMap<any, any> = new ImmutableMap(
    null,
    0,
  );

  private readonly _tree: ImmutableMap.Tree<TKey, TValue>;

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
    let tree = null;
    let size = 0;
    if (selector !== undefined) {
      for (const item of source as Iterable<TItem>) {
        const [key, value] = selector(item);
        const oldTreeRef = {
          value: null,
        };
        tree = insert(tree, key, value, oldTreeRef);
        if (oldTreeRef.value === null) {
          size++;
        }
      }
    } else {
      for (const [key, value] of source as Iterable<[TKey, TValue]>) {
        const oldTreeRef = {
          value: null,
        };
        tree = insert(tree, key, value, oldTreeRef);
        if (oldTreeRef.value === null) {
          size++;
        }
      }
    }
    return new ImmutableMap(tree, size);
  }

  static singleton<TKey, TValue>(
    key: TKey,
    value: TValue,
  ): ImmutableMap<TKey, TValue> {
    return new ImmutableMap(singleton(BLACK, key, value), 1);
  }

  private constructor(tree: ImmutableMap.Tree<TKey, TValue>, size: number) {
    this._tree = tree;
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
    if (this._tree !== null) {
      for (const tree of iterate(this._tree)) {
        yield [tree.key, tree.value];
      }
    }
  }

  *keys(): Generator<TKey> {
    if (this._tree !== null) {
      for (const tree of iterate(this._tree)) {
        yield tree.key;
      }
    }
  }

  *values(): Generator<TValue> {
    if (this._tree !== null) {
      for (const tree of iterate(this._tree)) {
        yield tree.value;
      }
    }
  }

  delete(key: TKey): ImmutableMap<TKey, TValue> {
    const oldTreeRef = { value: null };
    const newTree = deleteFrom(this._tree, key, oldTreeRef);
    const newSize = oldTreeRef.value !== null ? this._size - 1 : this._size;
    return new ImmutableMap(newTree, newSize);
  }

  get(key: TKey): TValue | undefined {
    return search(this._tree, key)?.value;
  }

  has(key: TKey): boolean {
    return search(this._tree, key) !== undefined;
  }

  set(key: TKey, value: TValue): ImmutableMap<TKey, TValue> {
    const oldTreeRef = { value: null };
    const newTree = insert(this._tree, key, value, oldTreeRef);
    const newSize = oldTreeRef.value === null ? this._size + 1 : this._size;
    return new ImmutableMap(newTree, newSize);
  }

  update(
    key: TKey,
    updateFn: (value: TValue) => TValue,
  ): ImmutableMap<TKey, TValue> {
    const newTree = update(this._tree, key, updateFn);
    return new ImmutableMap(newTree, this._size);
  }

  updateOrInsert(
    key: TKey,
    updateFn: (value: TValue) => TValue,
    defaultFn: () => TValue,
  ): ImmutableMap<TKey, TValue> {
    const oldTreeRef = { value: null };
    const newTree = updateOrInsert(
      this._tree,
      key,
      updateFn,
      defaultFn,
      oldTreeRef,
    );
    const newSize = oldTreeRef.value === null ? this._size + 1 : this._size;
    return new ImmutableMap(newTree, newSize);
  }
}

export function inspectTree<TKey, TValue>({
  tree,
}: ImmutableMap<TKey, TValue>): string {
  return tree === null ? '<empty>' : [...drawBranch(tree, '', '')].join('\n');
}

function balanceLeft<TKey, TValue>(
  tree: ImmutableMap.Branch<TKey, TValue>,
): ImmutableMap.Branch<TKey, TValue> {
  if (tree.left?.color === RED && tree.left.left?.color === RED) {
    return branch(
      RED,
      tree.left.key,
      tree.left.value,
      branch(
        BLACK,
        tree.left.left.key,
        tree.left.left.value,
        tree.left.left.left,
        tree.left.left.right,
      ),
      branch(BLACK, tree.key, tree.value, tree.left.right, tree.right),
    );
  } else if (tree.left?.color === RED && tree.left.right?.color === RED) {
    return branch(
      RED,
      tree.left.right.key,
      tree.left.right.value,
      branch(
        BLACK,
        tree.left.key,
        tree.left.value,
        tree.left.left,
        tree.left.right.left,
      ),
      branch(BLACK, tree.key, tree.value, tree.left.right.right, tree.right),
    );
  } else {
    return tree;
  }
}

function balanceRight<TKey, TValue>(
  tree: ImmutableMap.Branch<TKey, TValue>,
): ImmutableMap.Branch<TKey, TValue> {
  if (tree.right?.color === RED && tree.right.left?.color === RED) {
    return branch(
      RED,
      tree.right.left.key,
      tree.right.left.value,
      branch(BLACK, tree.key, tree.value, tree.left, tree.right.left.left),
      branch(
        BLACK,
        tree.right.key,
        tree.right.value,
        tree.right.left.right,
        tree.right.right,
      ),
    );
  } else if (tree.right?.color === RED && tree.right.right?.color === RED) {
    return branch(
      RED,
      tree.right.key,
      tree.right.value,
      branch(BLACK, tree.key, tree.value, tree.left, tree.right.left),
      branch(
        BLACK,
        tree.right.right.key,
        tree.right.right.value,
        tree.right.right.left,
        tree.right.right.right,
      ),
    );
  } else {
    return tree;
  }
}

function blacken<TKey, TValue>(
  tree: ImmutableMap.Tree<TKey, TValue>,
): ImmutableMap.Tree<TKey, TValue> {
  return tree !== null
    ? branch(BLACK, tree.key, tree.value, tree.left, tree.right)
    : null;
}

function branch<TKey, TValue>(
  color: ImmutableMap.Color,
  key: TKey,
  value: TValue,
  left: ImmutableMap.Tree<TKey, TValue>,
  right: ImmutableMap.Tree<TKey, TValue>,
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
  tree: ImmutableMap.Tree<TKey, TValue>,
  key: TKey,
  oldTreeRef: Ref<ImmutableMap.Branch<TKey, TValue>>,
): ImmutableMap.Tree<TKey, TValue> {
  if (tree === null) {
    return null;
  } else if (key < tree.key) {
    return equalizeLeft(
      branch(
        tree.color,
        tree.key,
        tree.value,
        deleteFrom(tree.left, key, oldTreeRef),
        tree.right,
      ),
    );
  } else if (key > tree.key) {
    return equalizeRight(
      branch(
        tree.color,
        tree.key,
        tree.value,
        tree.left,
        deleteFrom(tree.right, key, oldTreeRef),
      ),
    );
  } else if (tree.right !== null) {
    const minTree: Ref<ImmutableMap.Branch<TKey, TValue>> = { value: null };
    const newTree = deleteMin(tree.right, minTree);
    oldTreeRef.value = tree;
    return equalizeRight(
      branch(
        tree.color,
        minTree.value!.key,
        minTree.value!.value,
        tree.left,
        newTree,
      ),
    );
  } else {
    oldTreeRef.value = tree;
    return blacken(tree.left);
  }
}

function deleteMin<TKey, TValue>(
  tree: ImmutableMap.Branch<TKey, TValue>,
  oldTreeRef: Ref<ImmutableMap.Branch<TKey, TValue>>,
): ImmutableMap.Tree<TKey, TValue> {
  if (tree.left !== null) {
    return equalizeLeft(
      branch(
        tree.color,
        tree.key,
        tree.value,
        deleteMin(tree.left, oldTreeRef),
        tree.right,
      ),
    );
  } else {
    oldTreeRef.value = tree;
    return blacken(tree.right);
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
  tree: ImmutableMap.Branch<TKey, TValue>,
): ImmutableMap.Branch<TKey, TValue> {
  if (tree.right?.color === BLACK) {
    return balanceLeft(
      branch(
        tree.color,
        tree.key,
        tree.value,
        tree.left,
        branch(
          RED,
          tree.right.key,
          tree.right.value,
          tree.right.left,
          tree.right.right,
        ),
      ),
    );
  } else if (tree.right?.color === RED) {
    return branch(
      BLACK,
      tree.key,
      tree.value,
      equalizeLeft(
        branch(RED, tree.key, tree.value, tree.left, tree.right.left),
      ),
      tree.right.right,
    );
  } else {
    return tree;
  }
}

function equalizeRight<TKey, TValue>(
  tree: ImmutableMap.Branch<TKey, TValue>,
): ImmutableMap.Branch<TKey, TValue> {
  if (tree.left?.color === BLACK) {
    return balanceRight(
      branch(
        tree.color,
        tree.key,
        tree.value,
        branch(
          RED,
          tree.left.key,
          tree.left.value,
          tree.left.left,
          tree.left.right,
        ),
        tree.right,
      ),
    );
  } else if (tree.left?.color === RED) {
    return branch(
      BLACK,
      tree.key,
      tree.value,
      equalizeRight(
        branch(RED, tree.key, tree.value, tree.left.right, tree.right),
      ),
      tree.left.right,
    );
  } else {
    return tree;
  }
}

function insert<TKey, TValue>(
  tree: ImmutableMap.Tree<TKey, TValue>,
  key: TKey,
  value: TValue,
  oldTreeRef: Ref<ImmutableMap.Branch<TKey, TValue>>,
): ImmutableMap.Tree<TKey, TValue> {
  return blacken(
    replace(tree, key, (tree) => {
      oldTreeRef.value = tree;
      return tree === null
        ? singleton(RED, key, value)
        : branch(tree.color, key, value, tree.left, tree.right);
    }),
  );
}

function* iterate<TKey, TValue>(
  tree: ImmutableMap.Branch<TKey, TValue>,
): Generator<ImmutableMap.Branch<TKey, TValue>> {
  if (tree.left !== null) {
    yield* iterate(tree.left);
  }
  yield tree;
  if (tree.right !== null) {
    yield* iterate(tree.right);
  }
}

function replace<TKey, TValue>(
  tree: ImmutableMap.Tree<TKey, TValue>,
  key: TKey,
  updateFn: (
    tree: ImmutableMap.Tree<TKey, TValue>,
  ) => ImmutableMap.Tree<TKey, TValue>,
): ImmutableMap.Tree<TKey, TValue> {
  if (tree === null) {
    return updateFn(null);
  } else if (key < tree.key) {
    return balanceLeft(
      branch(
        tree.color,
        tree.key,
        tree.value,
        replace(tree.left, key, updateFn),
        tree.right,
      ),
    );
  } else if (key > tree.key) {
    return balanceRight(
      branch(
        tree.color,
        tree.key,
        tree.value,
        tree.left,
        replace(tree.right, key, updateFn),
      ),
    );
  } else {
    return updateFn(tree);
  }
}

function search<TKey, TValue>(
  tree: ImmutableMap.Tree<TKey, TValue>,
  key: TKey,
): ImmutableMap.Branch<TKey, TValue> | undefined {
  for (
    let current = tree;
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
  tree: ImmutableMap.Tree<TKey, TValue>,
  key: TKey,
  updateFn: (value: TValue) => TValue,
): ImmutableMap.Tree<TKey, TValue> {
  return blacken(
    replace(tree, key, (tree) => {
      return tree === null
        ? null
        : branch(tree.color, key, updateFn(tree.value), tree.left, tree.right);
    }),
  );
}

function updateOrInsert<TKey, TValue>(
  tree: ImmutableMap.Tree<TKey, TValue>,
  key: TKey,
  updateFn: (value: TValue) => TValue,
  defaultFn: () => TValue,
  oldTreeRef: Ref<ImmutableMap.Branch<TKey, TValue>>,
): ImmutableMap.Tree<TKey, TValue> {
  return blacken(
    replace(tree, key, (tree) => {
      oldTreeRef.value = tree;
      return tree === null
        ? singleton(RED, key, defaultFn())
        : branch(tree.color, key, updateFn(tree.value), tree.left, tree.right);
    }),
  );
}
