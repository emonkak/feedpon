/// <reference path="../../DefinitelyTyped/react-router/react-router.d.ts" />

import * as feedly from '../services/feedly/interfaces'
import { Event, Action } from '../shared/interfaces'

export const ActionDone = 'ActionDone'
export interface ActionDone extends Event<string> {
    action: Action<any>
}

export const ActionFailed = 'ActionFailed'
export interface ActionFailed extends Event<string> {
    action: Action<any>
    error: any
}

export const CategoriesReceived = 'CategoriesReceived'
export interface CategoriesReceived extends Event<string> {
    categories: feedly.Category[]
}

export const ContentsReceived = 'ContentsReceived'
export interface ContentsReceived extends Event<string> {
    contents: feedly.Contents
}

export const CredentialReceived = 'CredentialReceived'
export interface CredentialReceived extends Event<string> {
    credential: feedly.Credential
}

export const FullContentReceived = 'FullContentReceived'
export interface FullContentReceived extends Event<string> {
    fullContent: FullContent
}
interface FullContent {
    streamId: string
    url: string
    content: string
    nextLink?: string
}

export const LocationUpdated = 'LocationUpdated'
export interface LocationUpdated extends Event<string> {
    location: HistoryModule.Location
}

export const SubscriptionsReceived = 'SubscriptionsReceived'
export interface SubscriptionsReceived extends Event<string> {
    subscriptions: feedly.Subscription[]
}

export const UnreadCountsReceived = 'UnreadCountsReceived'
export interface UnreadCountsReceived extends Event<string> {
    unreadCounts: feedly.UnreadCount[]
}

export const UrlExpanded = 'UrlExpanded'
export interface UrlExpanded extends Event<string> {
    url: string
    redirectUrl: string
}
