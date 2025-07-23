const RED = Symbol('Red');
const BLACK = Symbol('Black');

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

interface Ref<T> {
  value: T | null;
}

export class ImmutableMap<TKey, TValue> implements Iterable<[TKey, TValue]> {
  static readonly #EMPTY: ImmutableMap<any, any> = new ImmutableMap(null, 0);

  readonly #tree: ImmutableMap.Tree<TKey, TValue>;

  readonly #size: number;

  static empty<TKey, TValue>(): ImmutableMap<TKey, TValue> {
    return ImmutableMap.#EMPTY;
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
        const oldTree: Ref<ImmutableMap.Branch<TKey, TValue>> = { value: null };
        tree = insert(key, value, tree, oldTree);
        if (oldTree.value === null) {
          size++;
        }
      }
    } else {
      for (const [key, value] of source as Iterable<[TKey, TValue]>) {
        const oldTree: Ref<ImmutableMap.Branch<TKey, TValue>> = { value: null };
        tree = insert(key, value, tree, oldTree);
        if (oldTree.value === null) {
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
    this.#tree = tree;
    this.#size = size;
  }

  get size(): number {
    return this.#size;
  }

  /**
   * @internal
   */
  get tree(): ImmutableMap.Tree<TKey, TValue> {
    return this.#tree;
  }

  [Symbol.iterator](): Generator<[TKey, TValue]> {
    return this.entries();
  }

  *entries(): Generator<[TKey, TValue]> {
    if (this.#tree !== null) {
      for (const tree of iterate(this.#tree)) {
        yield [tree.key, tree.value];
      }
    }
  }

  *keys(): Generator<TKey> {
    if (this.#tree !== null) {
      for (const tree of iterate(this.#tree)) {
        yield tree.key;
      }
    }
  }

  *values(): Generator<TValue> {
    if (this.#tree !== null) {
      for (const tree of iterate(this.#tree)) {
        yield tree.value;
      }
    }
  }

  delete(key: TKey): ImmutableMap<TKey, TValue> {
    const deleltedTree = { value: null };
    const newTree = deleteFrom(key, this.#tree, deleltedTree);
    const newSize = deleltedTree.value !== null ? this.#size - 1 : this.#size;
    return new ImmutableMap(newTree, newSize);
  }

  get(key: TKey): TValue | undefined {
    return search(key, this.#tree)?.value;
  }

  has(key: TKey): boolean {
    return search(key, this.#tree) !== undefined;
  }

  set(key: TKey, value: TValue): ImmutableMap<TKey, TValue> {
    const oldTree: Ref<ImmutableMap.Branch<TKey, TValue>> = { value: null };
    const newTree = insert(key, value, this.#tree, oldTree);
    const newSize = oldTree.value === null ? this.#size + 1 : this.#size;
    return new ImmutableMap(newTree, newSize);
  }

  update(key: TKey, f: (value: TValue) => TValue): ImmutableMap<TKey, TValue> {
    const oldTree: Ref<ImmutableMap.Branch<TKey, TValue>> = { value: null };
    const newTree = update(key, f, this.#tree, oldTree);
    const newSize = oldTree.value === null ? this.#size + 1 : this.#size;
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
  key: TKey,
  tree: ImmutableMap.Tree<TKey, TValue>,
  deletedTree: Ref<ImmutableMap.Branch<TKey, TValue>>,
): ImmutableMap.Tree<TKey, TValue> {
  if (tree === null) {
    return null;
  } else if (key < tree.key) {
    return equalizeLeft(
      branch(
        tree.color,
        tree.key,
        tree.value,
        deleteFrom(key, tree.left, deletedTree),
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
        deleteFrom(key, tree.right, deletedTree),
      ),
    );
  } else if (tree.right !== null) {
    const minTree: Ref<ImmutableMap.Branch<TKey, TValue>> = { value: null };
    const newTree = deleteMin(tree.right, minTree);
    deletedTree.value = tree;
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
    deletedTree.value = tree;
    return blacken(tree.left);
  }
}

function deleteMin<TKey, TValue>(
  tree: ImmutableMap.Branch<TKey, TValue>,
  deletedTree: Ref<ImmutableMap.Branch<TKey, TValue>>,
): ImmutableMap.Tree<TKey, TValue> {
  if (tree.left !== null) {
    return equalizeLeft(
      branch(
        tree.color,
        tree.key,
        tree.value,
        deleteMin(tree.left, deletedTree),
        tree.right,
      ),
    );
  } else {
    deletedTree.value = tree;
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
  key: TKey,
  value: TValue,
  tree: ImmutableMap.Tree<TKey, TValue>,
  oldTree: Ref<ImmutableMap.Branch<TKey, TValue>>,
): ImmutableMap.Tree<TKey, TValue> {
  return blacken(
    replace(
      key,
      (tree) => {
        oldTree.value = tree;
        return tree === null
          ? singleton(RED, key, value)
          : branch(tree.color, key, value, tree.left, tree.right);
      },
      tree,
    ),
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
  key: TKey,
  f: (tree: ImmutableMap.Tree<TKey, TValue>) => ImmutableMap.Tree<TKey, TValue>,
  tree: ImmutableMap.Tree<TKey, TValue>,
): ImmutableMap.Tree<TKey, TValue> {
  if (tree === null) {
    return f(null);
  } else if (key < tree.key) {
    return balanceLeft(
      branch(
        tree.color,
        tree.key,
        tree.value,
        replace(key, f, tree.left),
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
        replace(key, f, tree.right),
      ),
    );
  } else {
    return f(tree);
  }
}

function search<TKey, TValue>(
  key: TKey,
  tree: ImmutableMap.Tree<TKey, TValue>,
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
  key: TKey,
  f: (value: TValue) => TValue,
  tree: ImmutableMap.Tree<TKey, TValue>,
  oldTree: Ref<ImmutableMap.Branch<TKey, TValue>>,
): ImmutableMap.Tree<TKey, TValue> {
  return blacken(
    replace(
      key,
      (tree) => {
        oldTree.value = tree;
        return tree === null
          ? null
          : branch(tree.color, key, f(tree.value), tree.left, tree.right);
      },
      tree,
    ),
  );
}
