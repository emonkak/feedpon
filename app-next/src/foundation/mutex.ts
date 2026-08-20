export class Mutex {
  private readonly _resolvers: (() => void)[] = [];
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
      this._resolvers.push(resolve);
    });
  }

  unlock(): void {
    const resolver = this._resolvers.shift();
    if (resolver !== undefined) {
      resolver();
    } else {
      this._locked = false;
    }
  }
}
