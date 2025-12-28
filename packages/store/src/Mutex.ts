import { LinkedList } from 'barebind';

export class Mutex {
  private _queue: LinkedList<() => void> = new LinkedList();

  private _locked: boolean = false;

  async lock(): Promise<void> {
    if (!this._locked) {
      this._locked = true;
      return;
    }

    await new Promise<void>((resolve) => {
      this._queue.pushBack(resolve);
    });
  }

  unlock(): void {
    const node = this._queue.popFront();
    if (node !== null) {
      const resolve = node.value;
      resolve();
    } else {
      this._locked = false;
    }
  }
}
