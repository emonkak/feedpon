import { ImmutableMap } from './ImmutableMap.ts';

const PREFIX_NODE: ImmutableTrie.PrefixNode<any> = {
  children: ImmutableMap.empty(),
  value: undefined,
  hasValue: false,
};

export namespace ImmutableTrie {
  export type Node<T> = PrefixNode<T> | TerminalNode<T>;

  export interface PrefixNode<T> {
    readonly children: ImmutableMap<string, Node<T>>;
    readonly value: undefined;
    readonly hasValue: false;
  }

  export interface TerminalNode<T> {
    readonly children: ImmutableMap<string, Node<T>>;
    readonly value: T;
    readonly hasValue: true;
  }
}

export class ImmutableTrie<T> implements Iterable<[string[], T]> {
  private static readonly _EMPTY: ImmutableTrie<any> = new ImmutableTrie(
    PREFIX_NODE,
  );

  private readonly _root: ImmutableTrie.Node<T>;

  static empty<T>(): ImmutableTrie<T> {
    return ImmutableTrie._EMPTY;
  }

  static from<T>(source: Iterable<[string[], T]>): ImmutableTrie<T> {
    let trie = ImmutableTrie._EMPTY;

    for (const [path, value] of source) {
      trie = trie.insert(path, value);
    }

    return trie;
  }

  private constructor(root: ImmutableTrie.Node<T>) {
    this._root = root;
  }

  [Symbol.iterator](): Iterator<[string[], T]> {
    return iterate(this._root, []);
  }

  delete(path: string[]): ImmutableTrie<T> {
    return new ImmutableTrie(deleteFrom(this._root, path));
  }

  insert(path: string[], value: T): ImmutableTrie<T> {
    return new ImmutableTrie(insert(this._root, path, value));
  }

  search(path: string[]): T | null {
    let current = this._root;

    for (const key of path) {
      const child = current.children.get(key);
      if (child === undefined) {
        return null;
      }
      current = child;
    }

    return current.hasValue ? current.value : null;
  }
}

function createTerminalNode<T>(value: T): ImmutableTrie.TerminalNode<T> {
  return {
    children: ImmutableMap.empty(),
    value,
    hasValue: true,
  };
}

function deleteFrom<T>(
  node: ImmutableTrie.Node<T>,
  path: string[],
): ImmutableTrie.Node<T> {
  if (path.length === 0) {
    return PREFIX_NODE;
  } else if (path.length === 1) {
    return {
      children: node.children.delete(path[0]!),
      value: node.value,
      hasValue: node.hasValue,
    } as ImmutableTrie.Node<T>;
  } else {
    return {
      children: node.children.update(path[0]!, (oldChild) =>
        deleteFrom(oldChild, path.slice(1)),
      ),
      value: node.value,
      hasValue: node.hasValue,
    } as ImmutableTrie.Node<T>;
  }
}

function insert<T>(
  node: ImmutableTrie.Node<T>,
  path: string[],
  value: T,
): ImmutableTrie.Node<T> {
  if (path.length === 0) {
    return createTerminalNode(value);
  } else {
    return {
      children: node.children.updateOrInsert(
        path[0]!,
        (oldChild) => insert(oldChild, path.slice(1), value),
        () => insert(PREFIX_NODE, path.slice(1), value),
      ),
      value: node.value,
      hasValue: node.hasValue,
    } as ImmutableTrie.Node<T>;
  }
}

function* iterate<T>(
  node: ImmutableTrie.Node<T>,
  path: string[],
): Generator<[string[], T]> {
  if (node.hasValue) {
    yield [path, node.value];
  }
  for (const [component, child] of node.children) {
    yield* iterate(child, path.concat(component));
  }
}
