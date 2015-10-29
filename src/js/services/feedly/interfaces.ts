// Authentication API:
export interface AuthenticateInput {
    response_type: string;
    client_id: string;
    redirect_uri: string;
    scope: string;
    state?: string;
}

export interface AuthenticateResponse {
    code: string;
    state?: string;
    error?: string;
}

export interface ExchangeTokenInput {
    code: string;
    client_id: string;
    client_secret: string;
    redirect_uri: string;
    state?: string;
    grant_type: string;
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
    grant_type: string;
}

export interface RefreshTokenResponse {
    id: string;
    plan: string;
    access_token: string;
    expires_in: string;
    token_type: string;
}

export interface RevokeTokenInput {
    refresh_token: string;
    client_id: string;
    client_secret: string;
    grant_type: string;
}

export interface RevokeTokenResponse {
    id: string;
    expires_in: string;
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
    allUnreadCounts(input?: UnreadCountsInput): Promise<UnreadCountsResponce>;

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

export interface UnreadCountsInput {
    autorefresh?: boolean;
    newerThan?: number;
    streamId?: string;
}

export interface UnreadCountsResponce {
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
    items: ContentItem[];
}

export interface ContentItem {
    published: number;
    tags?: ContentItemTag[];
    alternate: LinkObject[];
    updated?: number;
    title: string;
    engagement: number;
    categories: Category[];
    id: string;
    author?: string;
    origin: ContentItemOrigin;
    content?: ContentItemContent;
    unread: boolean;
    crawled: number;
}

export interface LinkObject {
    type: string;
    href: string;
}

export interface ContentItemTag {
    id: string;
    label: string;
}

export interface ContentItemOrigin {
    htmlUrl: string;
    title: string;
    streamId: string;
}

export interface ContentItemContent {
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
export const IEnvironment = class {}
export interface IEnvironment {
    endpoint: string
    client_id: string
    client_secret: string
    scope: string
    redirect_uri: string
}

export interface Credential extends ExchangeTokenResponse {
    authorized: number;
}
