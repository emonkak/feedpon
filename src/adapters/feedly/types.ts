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
    status?: string;
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
