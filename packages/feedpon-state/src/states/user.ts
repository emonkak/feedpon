import { Atom } from 'barebind/extras/signal';
import type { FeedlyContext } from '../api/feedly.ts';
import type * as Feedly from '../api/feedlyTypes.d.ts';
import type { State, Store } from '../store.ts';

export interface UserSeed {
  profile: Profile | null;
  version: number;
}

export type Profile = Feedly.components['schemas']['Profile'];

export interface UserContext extends FeedlyContext {
  userStore: Store<UserState>;
}

const defaultSeed: UserSeed = {
  profile: null,
  version: 1,
};

export class UserState implements State<UserSeed> {
  readonly profile$: Atom<Profile | null>;

  readonly version$: Atom<number>;

  constructor(seed: UserSeed = defaultSeed) {
    this.profile$ = new Atom(seed.profile);
    this.version$ = new Atom(seed.version);
  }

  toSnapshot(): UserSeed {
    return {
      profile: this.profile$.value,
      version: this.version$.value,
    };
  }
}
