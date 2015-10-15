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

interface RefreshTokenInput {
    refresh_token: string;
    client_id: string;
    client_secret: string;
    grant_type: string;
}

interface RefreshTokenResponse {
    id: string;
    plan: string;
    access_token: string;
    expires_in: string;
    token_type: string;
}

interface RevokeTokenInput {
    refresh_token: string;
    client_id: string;
    client_secret: string;
    grant_type: string;
}

interface RevokeTokenResponse {
    id: string;
    expires_in: string;
}

export interface Credential {
    authorized: number;
    body: ExchangeTokenResponse;
}

// Categories API:
interface ICategoriesApi {
    allCategories(): Promise<Category[]>;

    deleteCategory(categoryId: string): Promise<string>;
}

interface Category {
    id: string;
    label: string;
}

// Feeds API:
interface IFeedsApi {
    getFeed(feedId: string): Promise<Feed>;
}

interface Feed {
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
interface IMarkersApi {
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

interface UnreadCountsInput {
    autorefresh?: boolean;
    newerThan?: number;
    streamId?: string;
}

interface UnreadCountsResponce {
    unreadcounts: UnreadCount[];
}

interface UnreadCount {
    count: number;
    updated: number;
    id: string;
}

// Streams API:
interface GetStreamInput {
    streamId: string;
    count?: number;
    ranked?: string;
    unreadOnly?: boolean;
    newerThan?: number;
    continuation?: string;
}

interface GetEntryIdsResponse {
    ids: string[];
    continuation: string;
}

interface Contents {
    continuation: string;
    updated: number;
    alternate: LinkObject[];
    title: string;
    id: string;
    direction: string;
    items: ContentItem[];
}

interface ContentItem {
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

interface LinkObject {
    type: string;
    href: string;
}

interface ContentItemTag {
    id: string;
    label: string;
}

interface ContentItemOrigin {
    htmlUrl: string;
    title: string;
    streamId: string;
}

interface ContentItemContent {
    direction: string;
    content: string;
}

// Subscriptions API:
interface Subscription {
    id: string;
    title: string;
    website: string;
    categories: Category[];
    updated: number;
    velocity: number;
    topics: string[];
    visualUrl: string;
}
