import type * as v from 'valibot';
import type * as schema from './schema.ts';

export {
  HatenaBookmarkClient,
  type HatenaBookmarkClientOptions,
} from './client.ts';

export type Bookmark = v.InferOutput<typeof schema.Bookmark>;
export type Entry = v.InferOutput<typeof schema.Entry>;
