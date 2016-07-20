import * as feedly from '../services/feedly/interfaces';
import { GenericEvent, GenericAction } from '../shared/interfaces';

export type Event = ActionDone | ActionFailed | CategoriesReceived | ContentsReceived | CredentialReceived | EntryActivated | FullContentReceived | LocationUpdated | SubscriptionsReceived | UnreadCountsReceived | UrlExpanded;

export const ActionDone: 'ActionDone' = 'ActionDone';
export interface ActionDone extends GenericEvent<typeof ActionDone> {
    action: GenericAction<any>;
}

export const ActionFailed: 'ActionFailed' = 'ActionFailed';
export interface ActionFailed extends GenericEvent<typeof ActionFailed> {
    action: GenericAction<any>;
    error: any;
}

export const CategoriesReceived: 'CategoriesReceived' = 'CategoriesReceived';
export interface CategoriesReceived extends GenericEvent<typeof CategoriesReceived> {
    categories: feedly.Category[];
}

export const ContentsReceived: 'ContentsReceived' = 'ContentsReceived';
export interface ContentsReceived extends GenericEvent<typeof ContentsReceived> {
    contents: feedly.Contents;
}

export const CredentialReceived: 'CredentialReceived' = 'CredentialReceived';
export interface CredentialReceived extends GenericEvent<typeof CredentialReceived> {
    credential: feedly.Credential;
}

export const EntryActivated: 'EntryActivated' = 'EntryActivated';
export interface EntryActivated extends GenericEvent<typeof EntryActivated> {
    entry: feedly.Entry;
}

export const FullContentReceived: 'FullContentReceived' = 'FullContentReceived';
export interface FullContentReceived extends GenericEvent<typeof FullContentReceived> {
    fullContent: {
        streamId: string;
        url: string;
        content: string;
        nextLink?: string;
    };
}

export const LocationUpdated: 'LocationUpdated' = 'LocationUpdated';
export interface LocationUpdated extends GenericEvent<typeof LocationUpdated> {
    location: HistoryModule.Location;
}

export const SubscriptionsReceived: 'SubscriptionsReceived' = 'SubscriptionsReceived';
export interface SubscriptionsReceived extends GenericEvent<typeof SubscriptionsReceived> {
    subscriptions: feedly.Subscription[];
}

export const UnreadCountsReceived: 'UnreadCountsReceived' = 'UnreadCountsReceived';
export interface UnreadCountsReceived extends GenericEvent<typeof UnreadCountsReceived> {
    unreadCounts: feedly.UnreadCount[];
}

export const UrlExpanded: 'UrlExpanded' = 'UrlExpanded';
export interface UrlExpanded extends GenericEvent<typeof UrlExpanded> {
    url: string;
    redirectUrl: string;
}
