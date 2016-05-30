import * as feedly from '../services/feedly/interfaces';
import { Event, Action } from '../shared/interfaces';

export const ActionDone: 'ActionDone' = 'ActionDone';
export interface ActionDone extends Event<typeof ActionDone> {
    action: Action<any>;
}

export const ActionFailed: 'ActionFailed' = 'ActionFailed';
export interface ActionFailed extends Event<typeof ActionFailed> {
    action: Action<any>;
    error: any;
}

export const CategoriesReceived: 'CategoriesReceived' = 'CategoriesReceived';
export interface CategoriesReceived extends Event<typeof CategoriesReceived> {
    categories: feedly.Category[];
}

export const ContentsReceived: 'ContentsReceived' = 'ContentsReceived';
export interface ContentsReceived extends Event<typeof ContentsReceived> {
    contents: feedly.Contents;
}

export const CredentialReceived: 'CredentialReceived' = 'CredentialReceived';
export interface CredentialReceived extends Event<typeof CredentialReceived> {
    credential: feedly.Credential;
}

export const EntryActivated: 'EntryActivated' = 'EntryActivated';
export interface EntryActivated extends Event<typeof EntryActivated> {
    entry: feedly.Entry;
}

export const FullContentReceived: 'FullContentReceived' = 'FullContentReceived';
export interface FullContentReceived extends Event<typeof FullContentReceived> {
    fullContent: FullContent;
}
interface FullContent {
    streamId: string;
    url: string;
    content: string;
    nextLink?: string;
}

export const LocationUpdated: 'LocationUpdated' = 'LocationUpdated';
export interface LocationUpdated extends Event<typeof LocationUpdated> {
    location: HistoryModule.Location;
}

export const SubscriptionsReceived: 'SubscriptionsReceived' = 'SubscriptionsReceived';
export interface SubscriptionsReceived extends Event<typeof SubscriptionsReceived> {
    subscriptions: feedly.Subscription[];
}

export const UnreadCountsReceived: 'UnreadCountsReceived' = 'UnreadCountsReceived';
export interface UnreadCountsReceived extends Event<typeof UnreadCountsReceived> {
    unreadCounts: feedly.UnreadCount[];
}

export const UrlExpanded: 'UrlExpanded' = 'UrlExpanded';
export interface UrlExpanded extends Event<typeof UrlExpanded> {
    url: string;
    redirectUrl: string;
}
