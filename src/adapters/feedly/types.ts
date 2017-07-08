export interface Error {
    errorCode: number;
    errorId: string;
    errorMessage: string;
}

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
    description?: string;
    language?: string;
    velocity?: number;
    website?: string;
    topics?: string[];
    status?: 'dead' | 'dead.flooded';

    // Undocumented properties:
    contentType: string;
    coverColor: string;
    iconUrl?: string;
    partial: boolean;
    visualUrl?: string;
}

// Markers API:
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

// Profile API:
export interface Profile {
    id: string;
    email?: string;
    givenName?: string;
    familyName?: string;
    fullName?: string;
    picture?: string;
    gender?: string;
    locale?: string;
    google?: string;
    reader?: string;
    twitter?: string;
    twitterUserId?: string;
    facebookUserId?: string;
    wordPressId?: string;
    windowsLiveId?: string;
    wave: string;
    client: string;
    source: string;
    created?: number;

    // Pro accounts only:
    product?: string;
    productExpiration?: number;
    subscriptionStatus?: 'Active' | 'PastDue' | 'Canceled' | 'Unpaid' | 'Deleted' | 'Expired';
    isEvernoteConnected?: boolean;
    isPocketConnected?: boolean;
}

export interface UpdateProfileInput {
    email?: string;
    givenName?: string;
    familyName?: string;
    picture?: string;
    gender?: string;
    locale?: boolean;
    twitter?: string;
    facebook?: string;
}

// Search API:
export interface SearchInput {
    query: string;
    count?: number;
    locale?: string;
}

export interface SearchResponse {
    hint: string;
    related: string[];
    results: SearchResult[];
}

export interface SearchResult {
    feedId: string;
    subscribers: number;
    title: string;
    description?: string;
    language?: string;
    velocity?: number;
    website?: string;
    visualUrl?: string;
    lastUpdated?: number;

    // Undocumented properties:
    art: number;
    contentType: string;
    coverColor: string;
    coverage: number;
    coverageScore: number;
    deliciousTags: string[];
    estimatedEngagement: number;
    hint: string;
    iconUrl?: string;
    partial: boolean;
    scheme: string;
    score: number;
}

// Streams API:
export interface GetStreamInput {
    streamId: string;
    count?: number;
    ranked?: 'newest' | 'oldest';
    unreadOnly?: boolean;
    newerThan?: number;
    continuation?: string;
}

export interface GetEntryIdsResponse {
    ids: string[];
    continuation: string;
}

export interface SubscribeFeedInput {
    categories: Category[];
    id: string;
    title?: string;
}

export interface Contents {
    continuation?: string;
    updated: number;
    alternate: Link[];
    title: string;
    id: string;
    direction: string;
    items: Entry[];
}

export interface Entry {
    id: string;
    title: string;
    content?: Content;
    summary?: Content;
    author?: string;
    crawled: number;
    recrawled?: number;
    published: number;
    updated?: number;
    alternate?: Link[];
    origin?: Origin;
    keywords?: string[];
    visual?: Visual;
    unread: boolean;
    tags?: Tag[];
    categories?: Category[];
    engagement?: number;
    actionTimestamp?: number;
    enclosure?: Link[];
    fingerprint: string;
    originId: string;
    sid?: string;
}

export interface Content {
    direction: string;
    content: string;
}

export interface Link {
    type: string;
    href: string;
}

export interface Origin {
    htmlUrl: string;
    title: string;
    streamId: string;
}

export interface Visual {
    url: string;
    width: number;
    height: number;
    contentType: string;
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
    visualUrl?: string;
    iconUrl?: string;
}

// Tags API:
export interface Tag {
    id: string;
    label?: string;
    description?: string;
}
