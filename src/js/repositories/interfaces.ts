import * as feedly from '../services/feedly/interfaces'

export const ICredentialRepository = class {}
export interface ICredentialRepository {
    get(): Promise<feedly.Credential>

    put(credential: feedly.Credential): Promise<void>

    delete(): Promise<void>
}

export const ISubscriptionRepository = class {}
export interface ISubscriptionRepository {
    getAll(): Promise<feedly.Subscription[]>

    putAll(subscriptions: feedly.Subscription[]): Promise<void>

    deleteAll(): Promise<void>
}

export const IUnreadCountRepository = class {}
export interface IUnreadCountRepository {
    getAll(): Promise<feedly.UnreadCount[]>

    putAll(unreadCounts: feedly.UnreadCount[]): Promise<void>

    deleteAll(): Promise<void>
}

export const ICategoryRepository = class {}
export interface ICategoryRepository {
    getAll(): Promise<feedly.Category[]>

    putAll(categories: feedly.Category[]): Promise<void>

    deleteAll(): Promise<void>
}
