import { type Atom, atom } from '@emonkak/ebit/directives.js';

import type { FeedlyContext } from '../api/feedly.ts';
import type * as Feedly from '../api/feedlyTypes.d.ts';
import type { State, Store } from '../store.ts';

export interface SearchSeed {
  results: SearchResult[];
  version: number;
}

export type SearchResult = Feedly.components['schemas']['SearchResult'];

export interface SearchContext extends FeedlyContext {
  searchStore: Store<SearchState>;
}

const defaultSeed: SearchSeed = {
  results: [],
  version: 1,
};

export class SearchState implements State<SearchSeed> {
  readonly results$: Atom<SearchResult[]>;

  readonly version$: Atom<number>;

  constructor(seed: SearchSeed = defaultSeed) {
    this.results$ = atom(seed.results);
    this.version$ = atom(seed.version);
  }

  toSnapshot(): SearchSeed {
    return {
      results: this.results$.value,
      version: this.version$.value,
    };
  }
}
