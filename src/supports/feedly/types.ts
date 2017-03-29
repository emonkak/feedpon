// Authentication API:
export interface AuthenticateInput {
    response_type: string;
    client_id: string;
    redirect_uri: string;
    scope: string;
    state?: string;
}

export interface ExchangeTokenInput {
    code: string;
    client_id: string;
    client_secret: string;
    redirect_uri: string;
    state?: string;
    grant_type: 'authorization_code';
}

export interface ExchangeTokenResponse {
    id: string;
    access_token: string;
    refresh_token: string;
    expires_in: number;
    token_type: string;
    plan: string;
    state?: string;
}

export interface RefreshTokenInput {
    refresh_token: string;
    client_id: string;
    client_secret: string;
    grant_type: 'refresh_token';
}

export interface RefreshTokenResponse {
    id: string;
    plan: string;
    access_token: string;
    expires_in: number;
    token_type: string;
}

export interface RevokeTokenInput {
    refresh_token: string;
    client_id: string;
    client_secret: string;
    grant_type: 'revoke_token';
}

export interface RevokeTokenResponse {
    id: string;
    expires_in: number;
}

// Categories API:
export interface Category {
    id: string;
    label: string;
}

// Feeds API:
export interface Feed {
    id: string;
    subscribers: number;
    title: string;
    description: string;
    language: string;
    velocity: number;
    website: string;
    topics: string[];
    status: string;
}

// Markers API:
export interface IMarkersApi {
    allUnreadCounts(input?: GetUnreadCountsInput): Promise<GetUnreadCountsResponce>;

    markAsReadForEntries(entryId: string): Promise<void>;
    markAsReadForEntries(entryIds: string[]): Promise<void>;

    markAsReadForFeeds(feedId: string): Promise<void>;
    markAsReadForFeeds(feedIds: string[]): Promise<void>;

    markAsReadForCetegories(categoryId: string): Promise<void>;
    markAsReadForCetegories(categoryIds: string[]): Promise<void>;

    keepUnreadForEntries(entryId: string): Promise<void>;
    keepUnreadForEntries(entryIds: string[]): Promise<void>;

    keepUnreadForFeeds(feedId: string): Promise<void>;
    keepUnreadForFeeds(feedIds: string[]): Promise<void>;

    keepUnreadForCetegories(categoryId: string): Promise<void>;
    keepUnreadForCetegories(categoryIds: string[]): Promise<void>;
}

export interface GetUnreadCountsInput {
    autorefresh?: boolean;
    newerThan?: number;
    streamId?: string;
}

export interface GetUnreadCountsResponce {
    unreadcounts: UnreadCount[];
}

export interface UnreadCount {
    count: number;
    updated: number;
    id: string;
}

// Streams API:
export interface GetStreamInput {
    streamId: string;
    count?: number;
    ranked?: string;
    unreadOnly?: boolean;
    newerThan?: number;
    continuation?: string;
}

export interface GetEntryIdsResponse {
    ids: string[];
    continuation: string;
}

export interface Contents {
    continuation: string;
    updated: number;
    alternate: LinkObject[];
    title: string;
    id: string;
    direction: string;
    items: Entry[];
}

export interface Entry {
    published: number;
    tags?: EntryTag[];
    alternate: LinkObject[];
    updated?: number;
    title: string;
    engagement: number;
    categories: Category[];
    id: string;
    author?: string;
    origin: EntryOrigin;
    content?: EntryContent;
    unread: boolean;
    crawled: number;
}

export interface LinkObject {
    type: string;
    href: string;
}

export interface EntryTag {
    id: string;
    label: string;
}

export interface EntryOrigin {
    htmlUrl: string;
    title: string;
    streamId: string;
}

export interface EntryContent {
    direction: string;
    content: string;
}

// Subscriptions API:
export interface Subscription {
    id: string;
    title: string;
    website: string;
    categories: Category[];
    updated: number;
    velocity: number;
    topics: string[];
    visualUrl: string;
}

// Ohters:
export interface Credential extends ExchangeTokenResponse {
    authorized: number;
}
