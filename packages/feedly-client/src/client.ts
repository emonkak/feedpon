import { type UpFetch, up } from 'up-fetch';
import * as v from 'valibot';
import {
  Category,
  type ExchangeTokenRequest,
  ExchangeTokenResponse,
  Feed,
  type GetEntryIdsRequest,
  GetEntryIdsResponse,
  GetLatestReadOperationsResponse,
  GetLatestTaggedEntryIdsResponse,
  type GetStreamContentsRequest,
  type GetUnreadCountsRequest,
  GetUnreadCountsResponse,
  Profile,
  type RefreshTokenRequest,
  RefreshTokenResponse,
  type SearchFeedsRequest,
  SearchFeedsResponse,
  type SearchStreamContentsRequest,
  Stream,
  type SubscribeToFeedRequest,
  Subscription,
  Tag,
  type TagEntryRequest,
  type TagMultipleEntriesRequest,
  type UntagEntryRequest,
  type UpdateCategoryRequest,
  type UpdateMarkerRequest,
  type UpdateMultipleSubscriptionsRequest,
  type UpdateProfileRequest,
  UpdateProfileResponse,
  type UpdateSubscriptionRequest,
  type UpdateTagRequest,
} from './schema.ts';

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

  get authenticationUrl(): string {
    const { baseUrl, clientId, redirectUrl, scope } = this._environment;
    const url = new URL('/v3/auth/auth', baseUrl);
    const { searchParams } = url;

    searchParams.set('client_id', clientId);
    searchParams.set('redirect_uri', redirectUrl);
    searchParams.set('response_type', 'code');
    searchParams.set('scope', scope);

    return url.toString();
  }

  get baseUrl(): string {
    return this._environment.baseUrl;
  }

  get redirectUrl(): string {
    return this._environment.redirectUrl;
  }

  /**
   * Exchanging an auth code for a refresh token and an access token.
   */
  async exchangeCode(
    code: string,
  ): Promise<v.InferOutput<typeof ExchangeTokenResponse>> {
    const { clientId, clientSecret, redirectUrl } = this._environment;
    return this._upfetch('/v3/auth/token', {
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
    return this._upfetch('/v3/auth/token', {
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
    return this._upfetch('/v3/auth/logout', {
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
    return this._upfetch('/v3/categories', {
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
    return this._upfetch(`/v3/categories/${encodeURIComponent(categoryId)}`, {
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
    return this._upfetch(`/v3/categories/${encodeURIComponent(categoryId)}`, {
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
    return this._upfetch(`/v3/feeds/${encodeURIComponent(feedId)}`, {
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
    return this._upfetch('/v3/feeds/.mget', {
      body,
      headers: createAuthHeaders(accessToken),
      method: 'GET',
      schema: v.array(Feed),
    });
  }

  /**
   * Mark one or multiple articles as read or saved.
   */
  async updateMarker(
    accessToken: string,
    body: UpdateMarkerRequest,
  ): Promise<void> {
    return this._upfetch('/v3/markers', {
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
    return this._upfetch('/v3/markers/counts', {
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
    return this._upfetch('/v3/markers/read', {
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
    return this._upfetch('/v3/markers/tags', {
      headers: createAuthHeaders(accessToken),
      method: 'GET',
      schema: GetLatestTaggedEntryIdsResponse,
    });
  }

  /**
   * Export the user's subscriptions as an OPML file.
   */
  async exportOPML(accessToken: string): Promise<string> {
    return this._upfetch('/v3/opml', {
      headers: createAuthHeaders(accessToken),
      method: 'GET',
      parseResponse: (response) => response.text(),
    });
  }

  /**
   * Import an OPML.
   */
  async importOPML(accessToken: string, opmlString: string): Promise<void> {
    return this._upfetch('/v3/opml', {
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
  async getProfile(
    accessToken: string,
  ): Promise<v.InferOutput<typeof Profile>> {
    return this._upfetch('/v3/profile', {
      headers: createAuthHeaders(accessToken),
      method: 'GET',
      schema: Profile,
    });
  }

  /**
   * Update the profile of the user.
   */
  async updateProfile(
    accessToken: string,
    body: UpdateProfileRequest,
  ): Promise<v.InferOutput<typeof UpdateProfileResponse>> {
    return this._upfetch('/v3/profile', {
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
    return this._upfetch('/v3/search', {
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
    return this._upfetch(
      `/v3/search/${encodeURIComponent(streamId)}/contents`,
      {
        headers: createAuthHeaders(accessToken),
        method: 'GET',
        params,
        schema: v.array(Stream),
      },
    );
  }

  /**
   * Get the content of a stream.
   */
  async getStreamContents(
    accessToken: string,
    streamId: string,
    params: GetStreamContentsRequest = {},
  ): Promise<v.InferOutput<typeof Stream>> {
    return this._upfetch(
      `/v3/streams/${encodeURIComponent(streamId)}/contents`,
      {
        headers: createAuthHeaders(accessToken),
        method: 'GET',
        params,
        schema: Stream,
      },
    );
  }

  /**
   * Get a list of entry ids for a specific stream.
   */
  async getEntryIds(
    accessToken: string,
    streamId: string,
    params: GetEntryIdsRequest = {},
  ): Promise<v.InferOutput<typeof GetEntryIdsResponse>> {
    return this._upfetch(`/v3/streams/${encodeURIComponent(streamId)}/ids`, {
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
    return this._upfetch('/v3/subscriptions', {
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
    return this._upfetch('/v3/subscriptions', {
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
    return this._upfetch('/v3/subscriptions', {
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
    return this._upfetch('/v3/subscriptions/.mput', {
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
    return this._upfetch(`/v3/subscriptions/${encodeURIComponent(feedId)}`, {
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
    return this._upfetch('/v3/subscriptions/.mdelete', {
      body: feedIds,
      headers: createAuthHeaders(accessToken),
      method: 'DELETE',
    });
  }

  /**
   * Get the list of tags created by the user.
   */
  async getTags(accessToken: string): Promise<v.InferOutput<typeof Tag>[]> {
    return this._upfetch('/v3/tags', {
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
    return this._upfetch(`/v3/tags/${encodeURIComponent(tagIds.join(','))}`, {
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
    return this._upfetch(`/v3/tags/${encodeURIComponent(tagIds.join(','))}`, {
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
    return this._upfetch(`/v3/tags/${encodeURIComponent(tagId)}`, {
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
    return this._upfetch(`/v3/tags/${encodeURIComponent(tagIds.join(','))}`, {
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
      `/v3/tags/${encodeURIComponent(tagIds.join(','))}/${encodeURIComponent(entryIds.join(','))}`,
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
    return this._upfetch(`/v3/tags/${encodeURIComponent(tagIds.join(','))}`, {
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
