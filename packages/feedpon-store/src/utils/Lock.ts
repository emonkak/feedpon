import { LinkedList } from 'barebind/collections/linked-list';

export class Lock {
  private _queue: LinkedList<() => void> = new LinkedList();

  private _locked: boolean = false;

  async acquire(): Promise<void> {
    if (!this._locked) {
      this._locked = true;
      return;
    }

    await new Promise<void>((resolve) => {
      this._queue.pushBack(resolve);
    });
  }

  release(): void {
    const node = this._queue.popFront();
    if (node !== null) {
      const resolve = node.value;
      resolve();
    } else {
      this._locked = false;
    }
  }
}
