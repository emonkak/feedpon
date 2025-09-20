import { type UpFetch, up } from 'up-fetch';
import * as v from 'valibot';

export const Category = v.object({
  id: v.string(),
  label: v.optional(v.string()),
});

export const Tag = v.object({
  id: v.string(),
  label: v.optional(v.string()),
  description: v.optional(v.string()),
});

export const Direction = v.picklist(['ltr', 'rtl']);

export const Gender = v.picklist(['male', 'female']);

export const Link = v.object({
  href: v.pipe(v.string(), v.url()),
  type: v.string(),
});

export const Content = v.object({
  // The content itself.
  content: v.string(),
  // The text direction ("ltr" for left-to-right, "rtl" for right-to-left).
  direction: Direction,
});

export const Origin = v.object({
  // The feed id
  streamId: v.string(),
  // The feed title
  title: v.string(),
  // The feed's website.
  htmlUrl: v.pipe(v.string(), v.url()),
});

export const Visual = v.object({
  url: v.pipe(v.string(), v.url()),
  width: v.optional(v.number()),
  height: v.optional(v.number()),
  contentType: v.optional(v.string()),
  edgeCacheUrl: v.optional(v.pipe(v.string(), v.url())),
  expirationDate: v.optional(v.number()),
  processor: v.optional(v.string()),
});

export const UnreadCount = v.object({
  id: v.string(),
  count: v.number(),
  updated: v.number(),
});

export const Marker = v.object({
  id: v.string(),
  asOf: v.number(),
});

export const Error = v.object({
  message: v.string(),
});

export const Feed = v.object({
  // The unique, immutable id of this feed.
  id: v.string(),
  // Number of feedly cloud subscribers who have this feed in their
  // subscription list.
  subscribers: v.number(),
  // The feed name.
  title: v.string(),
  // The feed description.
  description: v.optional(v.string()),
  // This field is a combination of the language reported by the RSS feed, and
  // the language automatically detected from the feed's content. It might not
  // be accurate, as many feeds misreport it.
  language: v.optional(v.string()),
  // The average number of articles published weekly. This number is updated
  // every few days.
  velocity: v.optional(v.number()),
  // URL the website for this feed.
  website: v.optional(v.pipe(v.string(), v.url())),
  // An array of topics this feed covers. This list can be used in searches and
  // mixes to build a list of related feeds and articles.
  topics: v.optional(v.array(v.string())),
  // Only returned if the feed cannot be polled. Values include "dead" (cannot
  // be polled), "dead.flooded" (if the feed produces too many articles per
  // day), "dead.dropped" (if the feed has been removed), and "dormant" (if the
  // feed hasn't been updated in a few months).
  state: v.optional(
    v.picklist(['dead', 'dead.flooded', 'dead.dropped', 'dormant']),
  ),
});

export const Entry = v.object({
  // The unique, immutable ID for this particular article.
  id: v.string(),
  // The article's title. This string does not contain any HTML markup.
  title: v.optional(v.string()),
  // The article content. The content itself contains sanitized HTML markup.
  content: v.optional(Content),
  // The article summary.
  summary: v.optional(Content),
  // The author's name
  author: v.optional(v.string()),
  // The immutable timestamp, in ms, when this article was processed by the
  // feedly Cloud servers.
  crawled: v.number(),
  // The immutable timestamp, in ms, when this article was processed by the
  // feedly Cloud servers.
  recrawled: v.optional(v.number()),
  // The timestamp, in ms, when this article was published, as reported by the
  // RSS feed (often inaccurate).
  published: v.number(),
  // The timestamp, in ms, when this article was updated, as reported by the
  // RSS feed
  updated: v.optional(v.number()),
  // A list of alternate links for this article. Each link object contains
  // a media type and a URL.
  alternate: v.optional(v.array(Link)),
  // The feed from which this article was crawled.
  origin: Origin,
  // A list of keyword strings extracted from the RSS entry.
  keywords: v.optional(v.array(v.string())),
  // An image URL for this entry. If present, "url" will contain the image URL,
  // "width" and "height" its dimension, and "contentType" its MIME type.
  visual: v.optional(Visual),
  // Was this entry read by the user? If an Authorization header is not
  // provided, this will always return false.
  unread: v.boolean(),
  // A list of tag objects ("id" and "label") that the user added to this
  // entry.
  tags: v.optional(v.array(Tag)),
  // A list of category objects ("id" and "label") that the user associated
  // with the feed of this entry.
  categories: v.array(Category),
  // An indicator of how popular this entry is. The higher the number, the more
  // readers have read, saved or shared this particular entry.
  engagement: v.optional(v.number()),
  // A normalized indicator for the relative popularity of this entry compared
  // to past data from the same source.
  engagementRate: v.optional(v.number()),
  // A timestamp for tagged articles, contains the timestamp when the article
  // was tagged by the user.
  actionTimestamp: v.optional(v.number()),
  // A list of media links (videos, images, sound etc) provided by the feed.
  enclosure: v.optional(v.array(Link)),
  // The article fingerprint. This value might change if the article is updated.
  fingerprint: v.string(),
  // The unique id of this post in the RSS feed (not necessarily a URL!)
  originId: v.string(),
  // An internal search id.
  sid: v.optional(v.string()),
  // What is the language associated with this article.
  language: v.optional(v.string()),
  // If available, the canonicalUrl of the article. The alternate might be
  // a non canonical URL
  canonicalUrl: v.optional(v.pipe(v.string(), v.url())),
});

export const UserProfile = v.object({
  // The unique, immutable user id.
  id: v.string(),
  // The email address extracted from the OAuth profile. Not always available,
  // depending on the OAuth method used.
  email: v.optional(v.string()),
  // The given (first) name. Not always available.
  givenName: v.optional(v.string()),
  // The family (last) name. Not always available.
  familyName: v.optional(v.string()),
  // The full name. Not always available.
  fullName: v.optional(v.string()),
  // A picture URL for this user, extracted from the OAuth profile.
  picture: v.optional(v.pipe(v.string(), v.url())),
  // "male" or "female"
  gender: v.optional(Gender),
  // The locale, extracted from the OAuth profile.
  locale: v.optional(v.string()),
  // The Google user id, if the user went through Google's OAuth flow.
  google: v.optional(v.string()),
  // The Google Reader user id. If present, this indicates a user who migrated
  // from Google Reader.
  reader: v.optional(v.string()),
  // The Twitter user id, if the user went through the Twitter OAuth flow.
  twitterUserId: v.optional(v.string()),
  // The Facebook user id, if the user went through the Facebook OAuth flow.
  facebookUserId: v.optional(v.string()),
  // The WordPress user id, if the user went through the WordPress OAuth flow.
  wordPressId: v.optional(v.string()),
  // The Windows Live user id, if the user went through the Windows Live OAuth
  // flow.
  windowsLiveId: v.optional(v.string()),
  // The analytics "wave". Format is: "yyyy.ww" where yyyy is the year, ww is
  // the week number.
  wave: v.string(),
  // The client application used to create this account.
  client: v.optional(v.string()),
  // The client name/version used to create this account.
  source: v.optional(v.string()),
  created: v.optional(v.number()),
});

export const SearchResult = v.object({
  // The unique, immutable id of this feed.
  feedId: v.string(),
  // Number of Feedly Cloud subscribers who have this feed in their
  // subscription list.
  subscribers: v.number(),
  // The feed name.
  title: v.string(),
  // The feed description.
  description: v.optional(v.string()),
  // The website associated with this feed.
  website: v.optional(v.string()),
  // The timestamp, in ms, of the last article received for this feed.
  lastUpdated: v.optional(v.number()),
  // The average number of articles published weekly. This number is updated
  // every few days.
  velocity: v.optional(v.number()),
  // A combination of the language reported by the RSS feed, and the language
  // automatically detected from the feed's content.
  language: v.optional(v.string()),
  // If true, this feed is featured (recommended) for the topic or search query
  featured: v.optional(v.boolean()),
  // A small (square) icon URL
  iconUrl: v.optional(v.pipe(v.string(), v.url())),
  // A larger (square) icon URL
  visualUrl: v.optional(v.pipe(v.string(), v.url())),
  // A large (rectangular) background image
  coverUrl: v.optional(v.pipe(v.string(), v.url())),
  // A small (square) icon URL with transparency
  logo: v.optional(v.pipe(v.string(), v.url())),
  // The auto-detected type of entries this feed publishes.
  contentType: v.optional(v.string()),
  // The background cover color
  coverColor: v.optional(v.string()),
});

export const Stream = v.object({
  // The stream id, repeated.
  id: v.string(),
  // The timestamp, in ms, of the most recent entry for this stream (regardless
  // of continuation, newerThan, etc).
  updated: v.optional(v.number()),
  // The continuation id to pass to the next stream call, for pagination.
  continuation: v.optional(v.string()),
  // For single feeds only, the feed title.
  title: v.optional(v.string()),
  // For single feeds only, the text direction ("ltr" for left-to-right
  // languages, "rtl" for right-to-left languages).
  direction: v.optional(Direction),
  // For single feeds only, the feed website URL and type.
  alternate: v.optional(Link),
  items: v.array(Entry),
});

export const Subscription = v.object({
  id: v.string(),
  title: v.string(),
  categories: v.array(Category),
  added: v.optional(v.number()),
  updated: v.optional(v.number()),
  website: v.optional(v.string()),
  velocity: v.optional(v.number()),
  topics: v.optional(v.array(v.string())),
  iconUrl: v.optional(v.pipe(v.string(), v.url())),
  visualUrl: v.optional(v.pipe(v.string(), v.url())),
});

interface ExchangeTokenRequest {
  // The code returned from the previous call.
  code: string;
  // The clientId obtained during application registration.
  client_id: string;
  // The client secret obtained during application registration.
  client_secret: string;
  // The URI registered with the application (if you pass it as a URL parameter,
  // be sure to URL-encode it!).
  redirect_uri: string;
  // Indicates any state which may be useful to your application upon receipt
  // of the response.
  state?: string;
  // As defined in the OAuth2 specification, this field must be set to
  // "authorization_code".
  grant_type: 'authorization_code';
}

const ExchangeTokenResponse = v.object({
  // The feedly user id
  id: v.string(),
  // A token that may be used to access APIs. Access tokens are have an
  // expiration
  access_token: v.string(),
  // A token that may be used to obtain a new access token. Refresh tokens are
  // valid until the user revokes access.
  refresh_token: v.string(),
  // The remaining lifetime on the access token
  expires_in: v.number(),
  // Indicates the type of token returned. At this time, this field will always
  // have the value of Bearer
  token_type: v.string(),
  // Indicated the user plan
  plan: v.picklist(['standard', 'pro', 'business']),
  // The state that was passed in
  state: v.optional(v.string()),
});

interface RefreshTokenRequest {
  // The refresh token returned in the previous code.
  refresh_token: string;
  // The clientId obtained during application registration.
  client_id: string;
  // The client secret obtained during application registration.
  client_secret: string;
  // As defined in the OAuth2 specification, this field must be set to
  // "refresh_token".
  grant_type: 'refresh_token';
}

const RefreshTokenResponse = v.object({
  // The feedly user id
  id: v.string(),
  // A token that may be used to access APIs. Access tokens are have an
  // expiration
  access_token: v.string(),
  // The remaining lifetime on the access token
  expires_in: v.number(),
  // Indicates the type of token returned. At this time, this field will always
  // have the value of Bearer
  token_type: v.string(),
  // Indicated the user plan
  plan: v.picklist(['standard', 'pro', 'business']),
});

export interface UpdateCategoryRequest {
  label: string;
}

export type UpdateMarkersRequest =
  | {
      action: 'markAsRead' | 'keepUnread' | 'markAsSaved' | 'markAsUnsaved';
      type: 'entries';
      entryIds: string[];
    }
  | {
      action: 'markAsRead' | 'undoMarkAsRead';
      type: 'feeds';
      feedIds: string[];
      lastReadEntryId?: string;
      asOf?: number;
    }
  | {
      action: 'markAsRead' | 'undoMarkAsRead';
      type: 'categories';
      categoryIds: string[];
      lastReadEntryId?: string;
      asOf?: number;
    }
  | {
      action: 'markAsRead';
      type: 'tags';
      tagIds: string[];
      lastReadEntryId?: string;
      asOf?: number;
    };

export interface GetUnreadCountsRequest {
  // Let's the server know if this is a background auto-refresh or not. In case
  // of very high load on the service, the server can deny access to background
  // requests and give priority to user facing operations.
  autorefresh?: boolean;
  // Timestamp used as a lower time limit, instead of the default 30 days.
  newerThan?: number;
  // A user or system category can be passed to restrict the unread count
  // response to feeds in this category.
  streamId?: string;
}

export const GetUnreadCountsResponse = v.object({
  unreadCounts: v.array(UnreadCount),
  updated: v.number(),
});

export const GetLatestReadOperationsResponse = v.object({
  // Feeds that were marked as read in the time period. For each feed, the
  // timestamp of the read marker will be returned.
  feeds: v.optional(v.array(Marker)),
  // The list of individual entries that were marked as read.
  entires: v.optional(v.array(v.string())),
  // The list of individual entries that were kept unread. Note: only entries
  // before the read marker will be returned here. unread:
  // v.optional(v.array(v.string())),
  updated: v.optional(v.number()),
});

export const GetLatestTaggedEntryIdsResponse = v.object({
  taggedEntries: v.record(v.string(), v.array(v.string())),
});

export interface UpdateProfileRequest {
  id: string;
  email: string;
  givenName: string;
  familyName: string;
  picture: string;
  gender: v.InferOutput<typeof Gender>;
  locale: string;
  twitter: string;
  facebook: string;
  wave: string;
}

export const UpdateProfileResponse = v.object({
  email: v.optional(v.string()),
  givenName: v.optional(v.string()),
  familyName: v.optional(v.string()),
  picture: v.optional(v.string()),
  gender: v.optional(Gender),
  locale: v.optional(v.string()),
  twitter: v.optional(v.string()),
  facebook: v.optional(v.string()),
  wave: v.optional(v.string()),
});

export interface SearchFeedsRequest {
  // Search query. Can be a feed url, a site title, a site url or a #topic.
  query: string;
  // Number of results.
  count?: number;
  // Hint the search engine to return feeds in that locale (e.g. "pt", "fr_FR")
  locale?: string;
}

export const SearchFeedsResponse = v.object({
  // An auto-completion guess of the keyword the user is trying to search for.
  hint: v.string(),
  // A list of other keywords the user might be interested in searching.
  related: v.array(v.string()),
  // A list of feeds matching the search query. Feeds which are sponsored
  // should be listed above feeds which are featured and above other search
  // results.
  results: v.array(SearchResult),
});

export interface SearchStreamContentsRequest {
  // Search query.
  query: string;
  // Number of entries to return. Note: if the user isn't pro, only 2 articles
  // will be returned.
  count?: number;
  // Timestamp in ms; cannot be older than 31 days ago.
  newerThan?: number;
  // If true, only unread articles will be returned. Reminder: entries older
  // than 31 days are automatically marked as read.
  unreadOnly?: boolean;
  // A continuation id is used to page through the content. Pass the
  // continuation from a search result to get the next set of results for this
  // search. Note: this value is ignored for non-Pro users.
  continuation?: string;
  // A comma-separated list of fields. By default, all fields are used for
  // matching. Valid field names: "all", "title", "author", "keywords".
  fields?: ('all' | 'title' | 'author' | 'keywords')[];
  // "audio", "video", doc or "any" limit results to also include this media
  // type. "any" means the article must contain at least one embed. Default
  // behavior is to not filter by embedded.
  embedded?: 'audio' | 'video' | 'doc' | 'any';
  // "medium" or "high" limit results to articles that have the specified
  // engagement. Default behavior is to not filter by engagement.
  engagement?: 'mdium' | 'high';
  // Hint the search engine to return feeds in that locale (e.g. "pt", "fr_FR")
  locale?: string;
}

export interface GetStreamContentsRequest {
  // Number of entries to return.
  count?: number;
  // "newest", "oldest", or "engagement" (sort by popularity).
  ranked?: 'newest' | 'oldest' | 'engagement';
  // If true, only unread articles will be returned. Reminder: entries older
  // than 31 days are automatically marked as read. This flag requires the
  // authorization header. It is ignored for tag streams.
  unreadOnly?: boolean;
  // Timestamp in ms; cannot be older than 31 days ago.
  newerThan?: number;
  // A continuation id is used to page through the entry ids; you can also pass
  // a timestamp in ms, which will act as an "older than" limit.
  continuation?: string;
}

export interface GetEntryIdsRequest {
  // Number of entry ids to return. default is 20. max is 10,000 for feeds or categories, and 2,500 for tags.
  count?: number;
  // "newest", "oldest", or "engagement" (sort by popularity). default is "newest".
  ranked?: 'newest' | 'oldest' | 'engagement';
  // if true, only unread articles will be returned; default is false. Reminder:
  // entries older than 31 days are automatically marked as read. This flag
  // requires the authorization header. It is ignored for tag streams.
  unreadOnly?: boolean;
  // Timestamp in ms; cannot be older than 31 days ago.
  newerThan?: number;
  // A continuation id is used to page through the entry ids; you can also pass
  // a timestamp in ms, which will act as an "older than" limit.
  continuation?: string;
}

export const GetEntryIdsResponse = v.object({
  // A list of IDs which can be used with the entries API to retrieve the content.
  ids: v.array(v.string()),
  // The continuation id to pass to the next stream call, for pagination.
  continuation: v.optional(v.string()),
});

export interface SubscribeToFeedRequest {
  id: string;
  title?: string;
  categories?: v.InferOutput<typeof Category>[];
}

export interface UpdateSubscriptionRequest {
  id: string;
  title?: string;
  categories?: v.InferOutput<typeof Category>[];
}

export type UpdateMultipleSubscriptionsRequest = UpdateSubscriptionRequest[];

export interface UpdateTagRequest {
  label: string;
}

export interface TagEntryRequest {
  entryId: string;
}

export interface TagMultipleEntriesRequest {
  entryIds: string[];
}

export interface UntagEntryRequest {
  entryId: string;
}

export type FeedlyAuthCode = string;

export interface FeedlyAuthenticator {
  acquireLock(): Promise<void>;
  releaseLock(): void;
  authenticate(url: URL): Promise<FeedlyAuthCode>;
}

export interface FeedlyClientOptions {
  fetch?: typeof fetch;
}

export interface FeedlyCredential {
  id: string;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  timestamp: number;
}

export interface FeedlyEnvironment {
  baseUrl: string;
  clientId: string;
  clientSecret: string;
  redirectUrl: string;
  scope: string;
}

export const PRODUCTION_ENVIRONMENT: FeedlyEnvironment = {
  baseUrl: 'https://cloud.feedly.com',
  clientId: 'feedly',
  clientSecret: '0XP4XQ07VVMDWBKUHTJM4WUQ',
  redirectUrl: 'https://feedly.com/feedly.html',
  scope: 'https://cloud.feedly.com/subscriptions',
};

export class FeedlyClient {
  private readonly _environment: FeedlyEnvironment;

  private readonly _upfetch: UpFetch;

  constructor(
    environment: FeedlyEnvironment,
    options: FeedlyClientOptions = {},
  ) {
    this._environment = environment;
    this._upfetch = up(options.fetch ?? fetch, () => ({
      baseUrl: environment.baseUrl,
    }));
  }

  getAuthUrl(): URL {
    const { baseUrl, clientId, redirectUrl, scope } = this._environment;
    const url = new URL('/v3/auth/auth', baseUrl);
    const { searchParams } = url;

    searchParams.set('client_id', clientId);
    searchParams.set('redirect_uri', redirectUrl);
    searchParams.set('response_type', 'code');
    searchParams.set('scope', scope);

    return url;
  }

  /**
   * Exchanging an auth code for a refresh token and an access token.
   */
  async exchangeCode(
    code: FeedlyAuthCode,
  ): Promise<v.InferOutput<typeof ExchangeTokenResponse>> {
    const { clientId, clientSecret, redirectUrl } = this._environment;
    return this._upfetch('/auth/token', {
      body: {
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUrl,
        grant_type: 'authorization_code',
      } satisfies ExchangeTokenRequest,
      method: 'POST',
      schema: ExchangeTokenResponse,
    });
  }

  /**
   * Refreshing an access token.
   */
  async refreshToken(
    refreshToken: string,
  ): Promise<v.InferOutput<typeof RefreshTokenResponse>> {
    const { clientId, clientSecret } = this._environment;
    return this._upfetch('/auth/token', {
      body: {
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
      } satisfies RefreshTokenRequest,
      method: 'POST',
      schema: RefreshTokenResponse,
    });
  }

  /**
   * Logout.
   */
  async logout(accessToken: string): Promise<void> {
    return this._upfetch('/auth/logout', {
      method: 'POST',
      headers: createAuthHeaders(accessToken),
    });
  }

  /**
   * Get the list of all categories.
   */
  async getAllCategories(
    accessToken: string,
  ): Promise<v.InferOutput<typeof Category>[]> {
    return this._upfetch('/categories', {
      headers: createAuthHeaders(accessToken),
      method: 'GET',
      schema: v.array(Category),
    });
  }

  /**
   * Change the label of an existing category.
   */
  async updateCategory(
    accessToken: string,
    categoryId: string,
    body: UpdateCategoryRequest,
  ): Promise<v.InferOutput<typeof Category>> {
    return this._upfetch(`/categories/${encodeURIComponent(categoryId)}`, {
      body,
      headers: createAuthHeaders(accessToken),
      method: 'POST',
      schema: Category,
    });
  }

  /**
   * Delete a category.
   */
  async deleteCategory(accessToken: string, categoryId: string): Promise<void> {
    return this._upfetch(`/categories/${encodeURIComponent(categoryId)}`, {
      headers: createAuthHeaders(accessToken),
      method: 'DELETE',
    });
  }

  /**
   * Get the metadata about a specific feed
   */
  async getFeed(
    accessToken: string,
    feedId: string,
  ): Promise<v.InferOutput<typeof Feed>> {
    return this._upfetch(`/feeds/${encodeURIComponent(feedId)}`, {
      headers: createAuthHeaders(accessToken),
      method: 'GET',
      schema: Feed,
    });
  }

  /**
   * Get the metadata about a specific feed
   */
  async getMultipleFeeds(
    accessToken: string,
    body: string[],
  ): Promise<v.InferOutput<typeof Feed>[]> {
    return this._upfetch('/feeds/.mget', {
      body,
      headers: createAuthHeaders(accessToken),
      method: 'GET',
      schema: v.array(Feed),
    });
  }

  /**
   * Mark one or multiple articles as read or saved.
   */
  async updateMarkers(
    accessToken: string,
    body: UpdateMarkersRequest,
  ): Promise<void> {
    return this._upfetch('/markers', {
      body,
      headers: createAuthHeaders(accessToken),
      method: 'POST',
    });
  }

  /**
   * Get the list of unread counts
   */
  async getUnreadCounts(
    accessToken: string,
    params: GetUnreadCountsRequest = {},
  ): Promise<v.InferOutput<typeof GetUnreadCountsResponse>> {
    return this._upfetch('/markers/counts', {
      headers: createAuthHeaders(accessToken),
      method: 'GET',
      params,
      schema: GetUnreadCountsResponse,
    });
  }

  /**
   * Get the latest read operations (to sync local cache).
   */
  async getLatestReadOperations(
    accessToken: string,
  ): Promise<v.InferOutput<typeof GetLatestReadOperationsResponse>> {
    return this._upfetch('/markers/read', {
      headers: createAuthHeaders(accessToken),
      method: 'GET',
      schema: GetLatestReadOperationsResponse,
    });
  }

  /**
   * Get the latest tagged entry ids.
   */
  async getLatestTaggedEntryIds(
    accessToken: string,
  ): Promise<v.InferOutput<typeof GetLatestTaggedEntryIdsResponse>> {
    return this._upfetch('/markers/tags', {
      headers: createAuthHeaders(accessToken),
      method: 'GET',
      schema: GetLatestTaggedEntryIdsResponse,
    });
  }

  /**
   * Export the user's subscriptions as an OPML file.
   */
  async exportOPML(accessToken: string): Promise<string> {
    return this._upfetch('/opml', {
      headers: createAuthHeaders(accessToken),
      method: 'GET',
      parseResponse: (response) => response.text(),
    });
  }

  /**
   * Import an OPML.
   */
  async importOPML(accessToken: string, opmlString: string): Promise<void> {
    return this._upfetch('/opml', {
      body: opmlString,
      headers: {
        ...createAuthHeaders(accessToken),
        'content-type': 'text/xml',
      },
      method: 'POST',
      serializeBody: (body) => body,
    });
  }

  /**
   * Get the profile of the user.
   */
  async getUserProfile(
    accessToken: string,
  ): Promise<v.InferOutput<typeof UserProfile>> {
    return this._upfetch('/profile', {
      headers: createAuthHeaders(accessToken),
      method: 'GET',
      schema: UserProfile,
    });
  }

  /**
   * Update the profile of the user.
   */
  async updateProfile(
    accessToken: string,
    body: UpdateProfileRequest,
  ): Promise<v.InferOutput<typeof UpdateProfileResponse>> {
    return this._upfetch('/profile', {
      body,
      headers: createAuthHeaders(accessToken),
      method: 'POST',
      schema: UpdateProfileResponse,
    });
  }

  /**
   * Find feeds based on title, url or #topic.
   */
  async searchFeeds(
    accessToken: string,
    params: SearchFeedsRequest,
  ): Promise<v.InferOutput<typeof SearchFeedsResponse>> {
    return this._upfetch('/search', {
      headers: createAuthHeaders(accessToken),
      method: 'GET',
      params,
      schema: SearchFeedsResponse,
    });
  }

  /**
   * Search the content of a stream.
   */
  async searchStreamContents(
    accessToken: string,
    streamId: string,
    params: SearchStreamContentsRequest,
  ): Promise<v.InferOutput<typeof Stream>[]> {
    return this._upfetch(`/search/${encodeURIComponent(streamId)}/contents`, {
      headers: createAuthHeaders(accessToken),
      method: 'GET',
      params,
      schema: v.array(Stream),
    });
  }

  /**
   * Get the content of a stream.
   */
  async getStreamContents(
    accessToken: string,
    streamId: string,
    params: GetStreamContentsRequest = {},
  ): Promise<v.InferOutput<typeof Stream>> {
    return this._upfetch(`/streams/${encodeURIComponent(streamId)}/contents`, {
      headers: createAuthHeaders(accessToken),
      method: 'GET',
      params,
      schema: Stream,
    });
  }

  /**
   * Get a list of entry ids for a specific stream.
   */
  async getEntryIds(
    accessToken: string,
    streamId: string,
    params: GetEntryIdsRequest = {},
  ): Promise<v.InferOutput<typeof GetEntryIdsResponse>> {
    return this._upfetch(`/streams/${encodeURIComponent(streamId)}/ids`, {
      headers: createAuthHeaders(accessToken),
      method: 'GET',
      params,
      schema: GetEntryIdsResponse,
    });
  }

  /**
   * Get the user’s subscriptions.
   */
  async getSubscriptions(
    accessToken: string,
  ): Promise<v.InferOutput<typeof Subscription>[]> {
    return this._upfetch('/subscriptions', {
      headers: createAuthHeaders(accessToken),
      method: 'GET',
      schema: v.array(Subscription),
    });
  }

  /**
   * Subscribe to a feed.
   */
  async subscrieToFeed(
    accessToken: string,
    body: SubscribeToFeedRequest,
  ): Promise<void> {
    return this._upfetch('/subscriptions', {
      body,
      headers: createAuthHeaders(accessToken),
      method: 'POST',
    });
  }

  /**
   * Update an existing subscription
   */
  async updateSubscription(
    accessToken: string,
    body: UpdateSubscriptionRequest,
  ): Promise<void> {
    return this._upfetch('/subscriptions', {
      body,
      headers: createAuthHeaders(accessToken),
      method: 'POST',
    });
  }

  /**
   * Update multiple subscriptions.
   */
  async updateMultipleSubscriptions(
    accessToken: string,
    body: UpdateMultipleSubscriptionsRequest,
  ): Promise<void> {
    return this._upfetch('/subscriptions/.mput', {
      body,
      headers: createAuthHeaders(accessToken),
      method: 'POST',
    });
  }

  /**
   * Unsubscribe from a feed.
   */
  async unsubscribeFromFeed(
    accessToken: string,
    feedId: string,
  ): Promise<void> {
    return this._upfetch(`/subscriptions/${encodeURIComponent(feedId)}`, {
      headers: createAuthHeaders(accessToken),
      method: 'DELETE',
    });
  }

  /**
   * Unsubscribe from multiple feeds.
   */
  async unsubscribeFromMultipleFeeds(
    accessToken: string,
    feedIds: string[],
  ): Promise<void> {
    return this._upfetch('/subscriptions/.mdelete', {
      body: feedIds,
      headers: createAuthHeaders(accessToken),
      method: 'DELETE',
    });
  }

  /**
   * Get the list of tags created by the user.
   */
  async getTags(accessToken: string): Promise<v.InferOutput<typeof Tag>[]> {
    return this._upfetch('/tags', {
      method: 'GET',
      headers: createAuthHeaders(accessToken),
      schema: v.array(Tag),
    });
  }

  /**
   * Tag an existing entry.
   */
  async tagEntry(
    accessToken: string,
    tagIds: string[],
    body: TagEntryRequest,
  ): Promise<void> {
    return this._upfetch(`/tags/${encodeURIComponent(tagIds.join(','))}`, {
      body,
      headers: createAuthHeaders(accessToken),
      method: 'PUT',
    });
  }

  /**
   * Tag multiple entries.
   */
  async tagMultipleEntries(
    accessToken: string,
    tagIds: string[],
    body: TagMultipleEntriesRequest,
  ): Promise<void> {
    return this._upfetch(`/tags/${encodeURIComponent(tagIds.join(','))}`, {
      body,
      headers: createAuthHeaders(accessToken),
      method: 'PUT',
    });
  }

  /**
   * Change a tag label.
   */
  async updateTag(
    accessToken: string,
    tagId: string,
    body: UpdateTagRequest,
  ): Promise<void> {
    return this._upfetch(`/tags/${encodeURIComponent(tagId)}`, {
      body,
      headers: createAuthHeaders(accessToken),
      method: 'POST',
    });
  }

  /**
   * Untag an existing entry.
   */
  async untagEntry(
    accessToken: string,
    tagIds: string[],
    body: UntagEntryRequest,
  ): Promise<void> {
    return this._upfetch(`/tags/${encodeURIComponent(tagIds.join(','))}`, {
      body,
      headers: createAuthHeaders(accessToken),
      method: 'DELETE',
    });
  }

  /**
   * Untag multiple entries.
   */
  async untagMultipleEntries(
    accessToken: string,
    tagIds: string[],
    entryIds: string[],
  ): Promise<void> {
    return this._upfetch(
      `/tags/${encodeURIComponent(tagIds.join(','))}/${encodeURIComponent(entryIds.join(','))}`,
      {
        headers: createAuthHeaders(accessToken),
        method: 'DELETE',
      },
    );
  }

  /**
   * Delete tags.
   */
  async deleteTags(accessToken: string, tagIds: string[]): Promise<void> {
    return this._upfetch(`/tags/${encodeURIComponent(tagIds.join(','))}`, {
      headers: createAuthHeaders(accessToken),
      method: 'DELETE',
    });
  }
}

function createAuthHeaders(accessToken: string): HeadersInit {
  return {
    authorization: `OAuth ${accessToken}`,
  };
}
