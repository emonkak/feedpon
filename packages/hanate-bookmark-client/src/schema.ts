import * as v from 'valibot';

export const Bookmark = v.object({
  user: v.string(),
  tags: v.array(v.string()),
  timestamp: v.string(),
  comment: v.string(),
});

export const Entry = v.object({
  title: v.string(),
  count: v.number(),
  url: v.pipe(v.string(), v.url()),
  entry_url: v.pipe(v.string(), v.url()),
  screenshot: v.pipe(v.string(), v.url()),
  eid: v.string(),
  bookmarks: v.optional(v.array(Bookmark)),
});

export interface GetMultipleBookmarkCountsRequest {
  url: string[];
}

export const GetMultipleBookmarkCountsResponse = v.record(
  v.string(),
  v.number(),
);

export interface GetEntryRequest {
  url: string;
}
