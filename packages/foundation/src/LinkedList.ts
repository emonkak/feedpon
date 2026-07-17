export namespace LinkedList {
  export interface Node<T> {
    readonly value: T;
    readonly prev: Node<T> | null;
    readonly next: Node<T> | null;
    readonly ownership: Ownership | null;
  }
}

interface OwnedNode<T> {
  value: T;
  prev: OwnedNode<T> | null;
  next: OwnedNode<T> | null;
  ownership: Ownership | null;
}

interface Ownership {
  id: symbol;
}

export class LinkedList<T> implements Iterable<T> {
  private _head: OwnedNode<T> | null = null;

  private _tail: OwnedNode<T> | null = null;

  private _ownership: Ownership = createOwnership();

  static concat<T>(...sources: LinkedList<T>[]): LinkedList<T> {
    const target = new LinkedList<T>();

    for (const source of sources) {
      source._ownership.id = target._ownership.id;

      if (target._tail === null) {
        target._head = source._head;
        target._tail = source._tail;
      } else {
        if (source._head !== null) {
          source._head.prev = target._tail;
          target._tail.next = source._head;
          target._tail = source._tail;
        }
      }

      source.clear();
    }

    return target;
  }

  *[Symbol.iterator](): Generator<T> {
    for (let node = this._head; node !== null; node = node.next) {
      yield node.value;
    }
  }

  back(): LinkedList.Node<T> | null {
    return this._tail;
  }

  clear(): void {
    this._head = null;
    this._tail = null;
    this._ownership = createOwnership();
  }

  front(): LinkedList.Node<T> | null {
    return this._head;
  }

  isEmpty(): boolean {
    return this._head === null;
  }

  popBack(): LinkedList.Node<T> | null {
    const tail = this._tail;
    if (tail === null) {
      return null;
    }
    if (tail.prev !== null) {
      this._tail = tail.prev;
      this._tail.next = null;
      tail.prev = null;
    } else {
      this._head = null;
      this._tail = null;
    }
    tail.ownership = null;
    return tail;
  }

  popFront(): LinkedList.Node<T> | null {
    const head = this._head;
    if (head === null) {
      return null;
    }
    if (head.next !== null) {
      this._head = head.next;
      this._head.prev = null;
      head.next = null;
    } else {
      this._head = null;
      this._tail = null;
    }
    head.ownership = null;
    return head;
  }

  pushBack(value: T): LinkedList.Node<T> {
    const node: OwnedNode<T> = {
      value,
      prev: this._tail,
      next: null,
      ownership: this._ownership,
    };
    if (this._tail !== null) {
      this._tail.next = node;
      this._tail = node;
    } else {
      this._head = node;
      this._tail = node;
    }
    return node;
  }

  pushFront(value: T): LinkedList.Node<T> {
    const node: OwnedNode<T> = {
      value,
      prev: null,
      next: this._head,
      ownership: this._ownership,
    };
    if (this._head !== null) {
      this._head.prev = node;
      this._head = node;
    } else {
      this._head = node;
      this._tail = node;
    }
    return node;
  }

  remove(node: LinkedList.Node<T>): boolean {
    if (!isOwnedNode(node, this._ownership)) {
      return false;
    }
    const { prev, next } = node;
    if (prev !== null) {
      prev.next = next;
    } else {
      this._head = next;
    }
    if (next !== null) {
      next.prev = prev;
    } else {
      this._tail = prev;
    }
    node.ownership = null;
    return true;
  }
}

function createOwnership(): Ownership {
  return { id: Symbol() };
}

function isOwnedNode<T>(
  node: LinkedList.Node<T>,
  ownership: Ownership,
): node is OwnedNode<T> {
  return node.ownership?.id === ownership.id;
}
