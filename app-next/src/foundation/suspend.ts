const STATUS_PENDING = 'pending';
const STATUS_FULFILLED = 'fulfilled';
const STATUS_REJECTED = 'rejected';

export type SuspendStatus =
  | typeof STATUS_PENDING
  | typeof STATUS_FULFILLED
  | typeof STATUS_REJECTED;

export namespace Suspend {
  export type Awaited<T> = Pending<T> | Fulfilled<T> | Rejected<T>;
  export type Pending<T> = Suspend<T> & {
    status: typeof STATUS_PENDING;
    value: undefined;
    reason: undefined;
  };
  export type Fulfilled<T> = Suspend<T> & {
    status: typeof STATUS_FULFILLED;
    value: T;
    reason: undefined;
  };
  export type Rejected<T> = Suspend<T> & {
    status: typeof STATUS_REJECTED;
    value: undefined;
    reason: unknown;
  };
}

export class Suspend<T> implements PromiseLike<T> {
  readonly #promise: PromiseLike<T>;

  #status: SuspendStatus;

  #value: T | undefined;

  #reason: unknown;

  static await<T>(promise: PromiseLike<T>): Suspend.Awaited<T> {
    const suspend = new Suspend<T>(promise, STATUS_PENDING);
    promise.then(
      (value) => {
        suspend.#status = STATUS_FULFILLED;
        suspend.#value = value;
      },
      (reason) => {
        suspend.#status = STATUS_REJECTED;
        suspend.#reason = reason;
      },
    );
    return suspend as Suspend.Awaited<T>;
  }

  static fulfill<T>(value: T): Suspend.Fulfilled<T> {
    return new Suspend<T>(
      Promise.resolve(value),
      STATUS_FULFILLED,
      value,
    ) as Suspend.Fulfilled<T>;
  }

  static reject<T>(reason?: unknown): Suspend.Rejected<T> {
    return new Suspend<T>(
      Promise.reject(reason),
      STATUS_REJECTED,
      undefined,
      reason,
    ) as Suspend.Rejected<T>;
  }

  private constructor(
    promise: PromiseLike<T>,
    status: SuspendStatus,
    value?: T | undefined,
    reason?: unknown,
  ) {
    this.#promise = promise;
    this.#status = status;
    this.#value = value;
    this.#reason = reason;
  }

  get status(): SuspendStatus {
    return this.#status;
  }

  get value(): T | undefined {
    return this.#value;
  }

  get reason(): unknown {
    return this.#reason;
  }

  then<TFulfilled = T, TRejected = never>(
    onFulfilled?:
      | ((value: T) => TFulfilled | PromiseLike<TFulfilled>)
      | undefined
      | null,
    onRejected?:
      | ((reason: any) => TRejected | PromiseLike<TRejected>)
      | undefined
      | null,
  ): PromiseLike<TFulfilled | TRejected> {
    return this.#promise.then(onFulfilled, onRejected);
  }

  unwrap(): T {
    switch (this.#status) {
      case STATUS_PENDING:
        throw this;
      case STATUS_FULFILLED:
        return this.#value!;
      case STATUS_REJECTED:
        throw this.#reason;
    }
  }
}
