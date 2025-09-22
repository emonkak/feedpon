import { ImmutableMap } from './ImmutableMap.ts';

const PREFIX_NODE: ImmutableTrie.PrefixNode<any, any> = {
  children: ImmutableMap.empty(),
  value: undefined,
  hasValue: false,
};

export namespace ImmutableTrie {
  export type Node<TKey, TValue> =
    | PrefixNode<TKey, TValue>
    | TerminalNode<TKey, TValue>;

  export interface PrefixNode<TKey, TValue> {
    readonly children: ImmutableMap<TKey, Node<TKey, TValue>>;
    readonly value: undefined;
    readonly hasValue: false;
  }

  export interface TerminalNode<TKey, TValue> {
    readonly children: ImmutableMap<TKey, Node<TKey, TValue>>;
    readonly value: TValue;
    readonly hasValue: true;
  }
}

export class ImmutableTrie<TKey, TValue> implements Iterable<[TKey[], TValue]> {
  private static readonly _EMPTY: ImmutableTrie<any, any> = new ImmutableTrie(
    PREFIX_NODE,
  );

  private readonly _root: ImmutableTrie.Node<TKey, TValue>;

  static empty<TKey, TValue>(): ImmutableTrie<TKey, TValue> {
    return ImmutableTrie._EMPTY;
  }

  static from<TKey, TValue>(
    source: Iterable<[TKey[], TValue]>,
  ): ImmutableTrie<TKey, TValue> {
    let trie = ImmutableTrie._EMPTY;

    for (const [path, value] of source) {
      trie = trie.insert(path, value);
    }

    return trie;
  }

  constructor(root: ImmutableTrie.Node<TKey, TValue>) {
    this._root = root;
  }

  [Symbol.iterator](): Iterator<[TKey[], TValue]> {
    return iterate(this._root, []);
  }

  delete(path: TKey[]): ImmutableTrie<TKey, TValue> {
    return new ImmutableTrie(deleteFrom(this._root, path));
  }

  find(path: TKey[]): ImmutableTrie.Node<TKey, TValue> | null {
    let current = this._root;

    for (const key of path) {
      const child = current.children.get(key);
      if (child === undefined) {
        return null;
      }
      current = child;
    }

    return current;
  }

  insert(path: TKey[], value: TValue): ImmutableTrie<TKey, TValue> {
    return new ImmutableTrie(insert(this._root, path, value));
  }
}

function deleteFrom<TKey, TValue>(
  node: ImmutableTrie.Node<TKey, TValue>,
  path: TKey[],
): ImmutableTrie.Node<TKey, TValue> {
  if (path.length === 0) {
    return PREFIX_NODE;
  } else if (path.length === 1) {
    return {
      children: node.children.delete(path[0]!),
      value: node.value,
      hasValue: node.hasValue,
    } as ImmutableTrie.Node<TKey, TValue>;
  } else {
    return {
      children: node.children.update(path[0]!, (oldChild) =>
        deleteFrom(oldChild, path.slice(1)),
      ),
      value: node.value,
      hasValue: node.hasValue,
    } as ImmutableTrie.Node<TKey, TValue>;
  }
}

function insert<TKey, TValue>(
  node: ImmutableTrie.Node<TKey, TValue>,
  path: TKey[],
  value: TValue,
): ImmutableTrie.Node<TKey, TValue> {
  if (path.length === 0) {
    return {
      children: ImmutableMap.empty(),
      value,
      hasValue: true,
    };
  } else {
    return {
      children: node.children.updateOrInsert(
        path[0]!,
        (oldChild) => insert(oldChild, path.slice(1), value),
        () => insert(PREFIX_NODE, path.slice(1), value),
      ),
      value: node.value,
      hasValue: node.hasValue,
    } as ImmutableTrie.Node<TKey, TValue>;
  }
}

function* iterate<TKey, TValue>(
  node: ImmutableTrie.Node<TKey, TValue>,
  path: TKey[],
): Generator<[TKey[], TValue]> {
  if (node.hasValue) {
    yield [path, node.value];
  }
  for (const [component, child] of node.children) {
    yield* iterate(child, path.concat(component));
  }
}
