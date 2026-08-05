import { Queue } from './queue.ts';

export class Mutex {
  private readonly _resolvers: Queue<() => void> = new Queue();
  private _locked: boolean = false;

  async scope<T>(callback: () => T): Promise<Awaited<T>> {
    try {
      await this.lock();
      return await callback();
    } finally {
      this.unlock();
    }
  }

  async lock(): Promise<void> {
    if (!this._locked) {
      this._locked = true;
      return;
    }

    await new Promise<void>((resolve) => {
      this._resolvers.enqueue(resolve);
    });
  }

  unlock(): void {
    const resolver = this._resolvers.dequeue();
    if (resolver !== undefined) {
      resolver();
    } else {
      this._locked = false;
    }
  }
}
