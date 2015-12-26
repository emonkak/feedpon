import * as feedly from '../services/feedly/interfaces'
import { Action } from './actionTypes'

export interface Event<T> {
    eventType: T
}

export const ActionDone = 'ActionDone'
export interface ActionDone extends Event<string> {
    action: Action<any>
    result: any
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
    content: string
    nextLink?: string
}

export const StreamSelected = 'StreamSelected'
export interface StreamSelected extends Event<string> {
    streamId: string
}

export const SubscriptionsReceived = 'SubscriptionsReceived'
export interface SubscriptionsReceived extends Event<string> {
    subscriptions: feedly.Subscription[]
}

export const UnreadCountsReceived = 'UnreadCountsReceived'
export interface UnreadCountsReceived extends Event<string> {
    unreadCounts: feedly.UnreadCount[]
}
