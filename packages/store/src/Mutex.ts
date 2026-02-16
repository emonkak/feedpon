import { LinkedList } from 'barebind';

export class Mutex {
  private readonly _resolvers: LinkedList<() => void> = new LinkedList();

  private _locked: boolean = false;

  async lock(): Promise<void> {
    if (!this._locked) {
      this._locked = true;
      return;
    }

    await new Promise<void>((resolve) => {
      this._resolvers.pushBack(resolve);
    });
  }

  unlock(): void {
    const resolver = this._resolvers.popFront()?.value;
    if (resolver !== undefined) {
      resolver();
    } else {
      this._locked = false;
    }
  }
}
