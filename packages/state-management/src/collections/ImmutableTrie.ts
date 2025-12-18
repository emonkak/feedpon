import { ImmutableMap } from './ImmutableMap.ts';

const NIL: ImmutableTrie.Prefix<any, any> = {
  children: ImmutableMap.empty(),
  value: undefined,
};

export namespace ImmutableTrie {
  export type Node<K, V> = Prefix<K, V> | Terminal<K, V>;

  export interface Prefix<K, V> {
    readonly children: ImmutableMap<K, Node<K, V>>;
    readonly value: undefined;
  }

  export interface Terminal<K, V> {
    readonly children: ImmutableMap<K, Node<K, V>>;
    readonly value: V;
  }
}

export class ImmutableTrie<K, V> implements Iterable<[K[], V]> {
  private static readonly _EMPTY: ImmutableTrie<any, any> = new ImmutableTrie(
    NIL,
  );

  private readonly _root: ImmutableTrie.Node<K, V>;

  static empty<K, V>(): ImmutableTrie<K, V> {
    return ImmutableTrie._EMPTY;
  }

  constructor(root: ImmutableTrie.Node<K, V>) {
    this._root = root;
  }

  [Symbol.iterator](): Iterator<[K[], V]> {
    return iterate(this._root, []);
  }

  delete(path: K[]): ImmutableTrie<K, V> {
    return new ImmutableTrie(delete_(this._root, path));
  }

  find(path: K[]): ImmutableTrie.Node<K, V> | undefined {
    let current = this._root;

    for (let i = 0, l = path.length; i < l; i++) {
      const component = path[i]!;
      const child = current.children.get(component);
      if (child === undefined) {
        return undefined;
      }
      current = child;
    }

    return current;
  }

  insert(path: K[], value: V): ImmutableTrie<K, V> {
    return new ImmutableTrie(insert(this._root, path, value));
  }
}

function delete_<K, V>(
  node: ImmutableTrie.Node<K, V>,
  path: K[],
): ImmutableTrie.Node<K, V> {
  if (path.length === 0) {
    return NIL;
  } else if (path.length === 1) {
    return {
      children: node.children.delete(path[0]!),
      value: node.value,
    } as ImmutableTrie.Node<K, V>;
  } else {
    return {
      children: node.children.update(path[0]!, (child) =>
        delete_(child, path.slice(1)),
      ),
      value: node.value,
    } as ImmutableTrie.Node<K, V>;
  }
}

function insert<K, V>(
  node: ImmutableTrie.Node<K, V>,
  path: K[],
  value: V,
): ImmutableTrie.Node<K, V> {
  if (path.length > 0) {
    return {
      children: node.children.upsert(
        path[0]!,
        (child) => insert(child, path.slice(1), value),
        () => insert(NIL, path.slice(1), value),
      ),
      value: node.value,
    } as ImmutableTrie.Node<K, V>;
  } else {
    return {
      children: ImmutableMap.empty(),
      value,
    };
  }
}

function* iterate<K, V>(
  node: ImmutableTrie.Node<K, V>,
  path: K[],
): Generator<[K[], V]> {
  if (node.value !== undefined) {
    yield [path, node.value];
  }
  for (const [component, child] of node.children.entries()) {
    yield* iterate(child, path.concat(component));
  }
}
