interface Node<T> {
  value: T;
  next: Node<T> | null;
}

export class Queue<T> {
  private _head: Node<T> | null = null;
  private _tail: Node<T> | null = null;

  dequeue(): T | undefined {
    if (this._head === null) {
      return undefined;
    }
    const value = this._head.value;
    this._head = this._head.next;
    if (this._head === null) {
      this._tail = null;
    }
    return value;
  }

  enqueue(value: T): void {
    const newNode = { value, next: null };
    if (this._tail !== null) {
      this._tail.next = newNode;
      this._tail = newNode;
    } else {
      this._head = newNode;
      this._tail = newNode;
    }
  }
}
