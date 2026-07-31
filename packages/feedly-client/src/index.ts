import type * as v from 'valibot';
import type * as schema from './schema.ts';

export {
  FeedlyClient,
  type FeedlyClientOptions,
  type FeedlyEnvironment,
} from './client.ts';

export type Category = v.InferOutput<typeof schema.Category>;
export type Content = v.InferOutput<typeof schema.Content>;
export type Direction = v.InferOutput<typeof schema.Direction>;
export type Entry = v.InferOutput<typeof schema.Entry>;
export type EntryRanking = v.InferOutput<typeof schema.EntryRanking>;
export type Feed = v.InferOutput<typeof schema.Feed>;
export type Gender = v.InferOutput<typeof schema.Gender>;
export type Link = v.InferOutput<typeof schema.Link>;
export type Marker = v.InferOutput<typeof schema.Marker>;
export type Origin = v.InferOutput<typeof schema.Origin>;
export type Profile = v.InferOutput<typeof schema.Profile>;
export type SearchResult = v.InferOutput<typeof schema.SearchResult>;
export type Stream = v.InferOutput<typeof schema.Stream>;
export type Subscription = v.InferOutput<typeof schema.Subscription>;
export type Tag = v.InferOutput<typeof schema.Tag>;
export type UnreadCount = v.InferOutput<typeof schema.UnreadCount>;
export type Visual = v.InferOutput<typeof schema.Visual>;
