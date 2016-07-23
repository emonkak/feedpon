import * as feedly from '../services/feedly/interfaces';
import { IEvent, IAction } from '../shared/interfaces';

export type Event = ActionDone | ActionFailed | CategoriesReceived | ContentsReceived | CredentialReceived | CredentialRevoked | EntryActivated | FullContentReceived | LocationUpdated | SubscriptionsReceived | UnreadCountsReceived | UrlExpanded;

export const ActionDone: 'ActionDone' = 'ActionDone';
export interface ActionDone extends IEvent<typeof ActionDone> {
    action: IAction<any>;
}

export const ActionFailed: 'ActionFailed' = 'ActionFailed';
export interface ActionFailed extends IEvent<typeof ActionFailed> {
    action: IAction<any>;
    error: any;
}

export const CategoriesReceived: 'CategoriesReceived' = 'CategoriesReceived';
export interface CategoriesReceived extends IEvent<typeof CategoriesReceived> {
    categories: feedly.Category[];
}

export const ContentsReceived: 'ContentsReceived' = 'ContentsReceived';
export interface ContentsReceived extends IEvent<typeof ContentsReceived> {
    contents: feedly.Contents;
}

export const CredentialReceived: 'CredentialReceived' = 'CredentialReceived';
export interface CredentialReceived extends IEvent<typeof CredentialReceived> {
    credential: feedly.Credential;
}

export const CredentialRevoked: 'CredentialRevoked' = 'CredentialRevoked';
export interface CredentialRevoked extends IEvent<typeof CredentialRevoked> {
}

export const EntryActivated: 'EntryActivated' = 'EntryActivated';
export interface EntryActivated extends IEvent<typeof EntryActivated> {
    entry: feedly.Entry;
}

export const FullContentReceived: 'FullContentReceived' = 'FullContentReceived';
export interface FullContentReceived extends IEvent<typeof FullContentReceived> {
    fullContent: {
        streamId: string;
        url: string;
        content: string;
        nextLink?: string;
    };
}

export const LocationUpdated: 'LocationUpdated' = 'LocationUpdated';
export interface LocationUpdated extends IEvent<typeof LocationUpdated> {
    location: HistoryModule.Location;
}

export const SubscriptionsReceived: 'SubscriptionsReceived' = 'SubscriptionsReceived';
export interface SubscriptionsReceived extends IEvent<typeof SubscriptionsReceived> {
    subscriptions: feedly.Subscription[];
}

export const UnreadCountsReceived: 'UnreadCountsReceived' = 'UnreadCountsReceived';
export interface UnreadCountsReceived extends IEvent<typeof UnreadCountsReceived> {
    unreadCounts: feedly.UnreadCount[];
}

export const UrlExpanded: 'UrlExpanded' = 'UrlExpanded';
export interface UrlExpanded extends IEvent<typeof UrlExpanded> {
    url: string;
    redirectUrl: string;
}
