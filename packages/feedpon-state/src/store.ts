export interface State<TSeed extends object> {
  toSnapshot(): TSeed;
}

export interface Middleware {
  handle<TState extends State<any>>(
    state: TState,
    mutation: Mutation,
    commit: (state: TState, mutation: Mutation) => void,
  ): void;
}

export interface Mutation {
  type: string;
}

export type Action<TContext, TResult = void> = (context: TContext) => TResult;

export type AsyncAction<TContext, TResult = void> = Action<
  TContext,
  Promise<TResult>
>;

type ExtractMutations<T> = {
  [K in keyof T]: T[K] extends () => void
    ? { type: K }
    : T[K] extends (payload: infer Payload & { type: K }) => void
      ? { type: K } & Payload
      : never;
}[keyof T & string];

type Immutable<T> = {
  readonly [K in keyof T as T[K] extends Function ? never : K]: Readonly<T[K]>;
};

export class Store<TState extends State<any>> {
  private readonly _state: TState;

  private readonly _middlewares: Middleware[] = [];

  constructor(state: TState) {
    this._state = state;
  }

  get state(): Immutable<TState> {
    return this._state;
  }

  dispatch(mutation: ExtractMutations<TState>): void {
    const middlewares = this._middlewares[Symbol.iterator]();
    const commit = (state: TState, mutation: Mutation) => {
      const { done, value } = middlewares.next();
      if (done) {
        if (typeof state[mutation.type as keyof TState] !== 'function') {
          console.warn(
            `Invalid mutation type "${mutation.type}" for "${this._state.constructor.name}".`,
          );
          return;
        }
        (state[mutation.type as keyof TState] as Function)(mutation);
      } else {
        value.handle(state, mutation, commit);
      }
    };
    commit(this._state, mutation);
  }

  use(middleware: Middleware): void {
    this._middlewares.push(middleware);
  }
}
