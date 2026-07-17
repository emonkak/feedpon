export const RED = Symbol('Red');

export const BLACK = Symbol('Black');

export namespace ImmutableMap {
  export type Tree<K, V> = Node<K, V> | Nil;

  export interface Node<K, V> {
    readonly color: Color;
    readonly key: K;
    readonly value: V;
    readonly left: Tree<K, V>;
    readonly right: Tree<K, V>;
  }

  export type Nil = null;

  export type Color = typeof RED | typeof BLACK;
}

export class ImmutableMap<K, V> {
  private static _EMPTY: ImmutableMap<any, any> = new ImmutableMap(null);

  static empty<K, V>(): ImmutableMap<K, V> {
    return ImmutableMap._EMPTY;
  }

  private readonly _root: ImmutableMap.Tree<K, V>;

  constructor(root: ImmutableMap.Tree<K, V>) {
    this._root = root;
  }

  delete(key: K): ImmutableMap<K, V> {
    return new ImmutableMap(delete_(this._root, key));
  }

  *entries(): Generator<[K, V]> {
    for (const { key, value } of iterate(this._root)) {
      yield [key, value];
    }
  }

  get(key: K): V | undefined {
    return search(this._root, key)?.value;
  }

  has(key: K): boolean {
    return search(this._root, key) !== null;
  }

  isEmpty(): boolean {
    return this._root === null;
  }

  *keys(): Generator<K> {
    for (const { key } of iterate(this._root)) {
      yield key;
    }
  }

  set(key: K, value: V): ImmutableMap<K, V> {
    return new ImmutableMap(insert(this._root, key, value));
  }

  update(key: K, updateFn: (value: V) => V): ImmutableMap<K, V> {
    return new ImmutableMap(update(this._root, key, updateFn));
  }

  updateOrInsert(
    key: K,
    updateFn: (value: V) => V,
    defaultFn: () => V,
  ): ImmutableMap<K, V> {
    return new ImmutableMap(
      updateOrInsert(this._root, key, updateFn, defaultFn),
    );
  }

  *values(): Generator<V> {
    for (const { value } of iterate(this._root)) {
      yield value;
    }
  }
}

function Black<K, V>(
  key: K,
  value: V,
  left: ImmutableMap.Tree<K, V>,
  right: ImmutableMap.Tree<K, V>,
): ImmutableMap.Node<K, V> {
  return {
    color: BLACK,
    key,
    value,
    left,
    right,
  };
}

function Node<K, V>(
  color: ImmutableMap.Color,
  key: K,
  value: V,
  left: ImmutableMap.Tree<K, V>,
  right: ImmutableMap.Tree<K, V>,
): ImmutableMap.Node<K, V> {
  return {
    color,
    key,
    value,
    left,
    right,
  };
}

function Red<K, V>(
  key: K,
  value: V,
  left: ImmutableMap.Tree<K, V>,
  right: ImmutableMap.Tree<K, V>,
): ImmutableMap.Node<K, V> {
  return {
    color: RED,
    key,
    value,
    left,
    right,
  };
}

function balanceL<K, V>(
  key: K,
  value: V,
  left: ImmutableMap.Tree<K, V>,
  right: ImmutableMap.Tree<K, V>,
): ImmutableMap.Tree<K, V> {
  if (left?.color === RED && left.left?.color === RED) {
    return Red(
      left.key,
      left.value,
      Black(left.left.key, left.left.value, left.left.left, left.left.right),
      Black(key, value, left.right, right),
    );
  } else if (left?.color === RED && left.right?.color === RED) {
    return Red(
      left.right.key,
      left.right.value,
      Black(left.key, left.value, left.left, left.right.left),
      Black(key, value, left.right.right, right),
    );
  } else {
    return Black(key, value, left, right);
  }
}

function balanceR<K, V>(
  key: K,
  value: V,
  left: ImmutableMap.Tree<K, V>,
  right: ImmutableMap.Tree<K, V>,
): ImmutableMap.Tree<K, V> {
  if (right?.color === RED && right.right?.color === RED) {
    return Red(
      right.key,
      right.value,
      Black(key, value, left, right.left),
      Black(
        right.right.key,
        right.right.value,
        right.right.left,
        right.right.right,
      ),
    );
  } else if (right?.color === RED && right.left?.color === RED) {
    return Red(
      right.left.key,
      right.left.value,
      Black(key, value, left, right.left.left),
      Black(right.key, right.value, right.left.right, right.right),
    );
  } else {
    return Black(key, value, left, right);
  }
}

function blacken<K, V>(tree: ImmutableMap.Tree<K, V>): ImmutableMap.Tree<K, V> {
  return tree?.color === RED ? { ...tree, color: BLACK } : tree;
}

function delete_<K, V>(
  tree: ImmutableMap.Tree<K, V>,
  key: K,
): ImmutableMap.Tree<K, V> {
  function go(tree: ImmutableMap.Tree<K, V>): ImmutableMap.Tree<K, V> {
    if (tree === null) {
      return null;
    } else {
      let newTree: ImmutableMap.Tree<K, V>;
      if (key < tree.key) {
        const left = go(tree.left);
        const fixup =
          tree.left === null || tree.left.color === RED ? Red : equalizeL;
        newTree = fixup(tree.key, tree.value, left, tree.right);
      } else if (key > tree.key) {
        const right = go(tree.right);
        const fixup =
          tree.right === null || tree.right.color === RED ? Red : equalizeR;
        newTree = fixup(tree.key, tree.value, tree.left, right);
      } else {
        newTree = fuse(tree.left, tree.right);
      }
      return newTree;
    }
  }

  return blacken(go(tree));
}

function equalizeL<K, V>(
  key: K,
  value: V,
  left: ImmutableMap.Tree<K, V>,
  right: ImmutableMap.Tree<K, V>,
): ImmutableMap.Tree<K, V> {
  if (left?.color === RED) {
    return Red(
      key,
      value,
      Black(left.key, left.value, left.left, left.right),
      right,
    );
  } else if (right?.color === RED && right.left?.color === BLACK) {
    return Red(
      right.left.key,
      right.left.value,
      Black(key, value, left, right.left.left),
      balanceR(right.key, right.value, right.left.right, right.right),
    );
  } else {
    return balanceR(key, value, left, right);
  }
}

function equalizeR<K, V>(
  key: K,
  value: V,
  left: ImmutableMap.Tree<K, V>,
  right: ImmutableMap.Tree<K, V>,
): ImmutableMap.Tree<K, V> {
  if (right?.color === RED) {
    return Red(
      key,
      value,
      left,
      Black(right.key, right.value, right.left, right.right),
    );
  } else if (left?.color === RED && left.right?.color === BLACK) {
    return Red(
      left.right.key,
      left.right.value,
      balanceL(left.key, left.value, left.left, left.right.left),
      Black(key, value, left.right.right, right),
    );
  } else {
    return balanceL(key, value, left, right);
  }
}

function fuse<K, V>(
  left: ImmutableMap.Tree<K, V>,
  right: ImmutableMap.Tree<K, V>,
): ImmutableMap.Tree<K, V> {
  if (left === null) {
    return right;
  } else if (right === null) {
    return left;
  } else if (left.color === BLACK && right.color === RED) {
    return Red(right.key, right.value, fuse(left, right.left), right.right);
  } else if (left.color === RED && right.color === BLACK) {
    return Red(left.key, left.value, left.left, fuse(left.right, right));
  } else {
    const tree = fuse(left.right, right.left);
    if (tree?.color === RED) {
      return Red(
        tree.key,
        tree.value,
        Node(left.color, left.key, left.value, left.left, tree.left),
        Node(right.color, right.key, right.value, tree.right, right.right),
      );
    } else {
      const fixup = left.color === RED ? Red : equalizeL;
      return fixup(
        left.key,
        left.value,
        left.left,
        Node(left.color, right.key, right.value, tree, right.right),
      );
    }
  }
}

function insert<K, V>(
  tree: ImmutableMap.Tree<K, V>,
  key: K,
  value: V,
): ImmutableMap.Tree<K, V> {
  function go(tree: ImmutableMap.Tree<K, V>): ImmutableMap.Tree<K, V> {
    if (tree === null) {
      return Red(key, value, null, null);
    } else if (key < tree.key) {
      const fixup = tree.color === RED ? Red : balanceL;
      return fixup(tree.key, tree.value, go(tree.left), tree.right);
    } else if (key > tree.key) {
      const fixup = tree.color === RED ? Red : balanceR;
      return fixup(tree.key, tree.value, tree.left, go(tree.right));
    } else {
      return Node(tree.color, key, value, tree.left, tree.right);
    }
  }

  return blacken(go(tree));
}

function* iterate<K, V>(
  tree: ImmutableMap.Tree<K, V>,
): Generator<ImmutableMap.Node<K, V>> {
  if (tree !== null) {
    yield* iterate(tree.left);
    yield tree;
    yield* iterate(tree.right);
  }
}

function search<K, V>(
  tree: ImmutableMap.Tree<K, V>,
  key: K,
): ImmutableMap.Tree<K, V> {
  for (
    let current = tree;
    current !== null;
    current = key < current.key ? current.left : current.right
  ) {
    if (key === current.key) {
      return current;
    }
  }
  return null;
}

function update<K, V>(
  tree: ImmutableMap.Tree<K, V>,
  key: K,
  updateFn: (value: V) => V,
): ImmutableMap.Tree<K, V> {
  function go(tree: ImmutableMap.Tree<K, V>): ImmutableMap.Tree<K, V> {
    if (tree === null) {
      return null;
    } else if (key < tree.key) {
      return Node(tree.color, tree.key, tree.value, go(tree.left), tree.right);
    } else if (key > tree.key) {
      return Node(tree.color, tree.key, tree.value, tree.left, go(tree.right));
    } else {
      return Node(tree.color, key, updateFn(tree.value), tree.left, tree.right);
    }
  }

  return go(tree);
}

function updateOrInsert<K, V>(
  tree: ImmutableMap.Tree<K, V>,
  key: K,
  updateFn: (value: V) => V,
  defaultFn: () => V,
): ImmutableMap.Tree<K, V> {
  function go(tree: ImmutableMap.Tree<K, V>): ImmutableMap.Tree<K, V> {
    if (tree === null) {
      return Red(key, defaultFn(), null, null);
    } else if (key < tree.key) {
      const fixup = tree.color === RED ? Red : balanceL;
      return fixup(tree.key, tree.value, go(tree.left), tree.right);
    } else if (key > tree.key) {
      const fixup = tree.color === RED ? Red : balanceR;
      return fixup(tree.key, tree.value, tree.left, go(tree.right));
    } else {
      return Node(tree.color, key, updateFn(tree.value), tree.left, tree.right);
    }
  }

  return blacken(go(tree));
}
