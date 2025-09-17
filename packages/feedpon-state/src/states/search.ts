import type { Reactive } from 'barebind/extras/reactive';
import type * as v from 'valibot';
import type { FeedlyClient, SearchResult } from '../apis/feedly.ts';

export type SearchAction<T> = (context: SearchContext) => T;

export interface SearchContext {
  feedlyClient: FeedlyClient;
  state$: Reactive<{ searchState: SearchState }>;
}

export type SearchResult = v.InferOutput<typeof SearchResult>;

export class SearchState {
  results: SearchResult[] = [];
}
