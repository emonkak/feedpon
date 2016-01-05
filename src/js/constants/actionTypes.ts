import * as feedly from '../services/feedly/interfaces'
import { Action } from '../shared/interfaces'

export const Authenticate = 'Authenticate'
export interface Authenticate extends Action<string> {
}

export const GetContents = 'GetContents'
export interface GetContents extends Action<string> {
    payload: feedly.GetStreamInput
}

export const GetCategories = 'GetCategories'
export interface GetCategories extends Action<string> {
}

export const GetCategoriesCache = 'GetCategoriesCache'
export interface GetCategoriesCache extends Action<string> {
}

export const GetCredential = 'GetCredential'
export interface GetCredential extends Action<string> {
}

export const GetFullContent = 'GetFullContent'
export interface GetFullContent extends Action<string> {
    streamId: string
    url: string
}

export const GetSubscriptions = 'GetSubscriptions'
export interface GetSubscriptions extends Action<string> {
}

export const GetSubscriptionsCache = 'GetSubscriptionsCache'
export interface GetSubscriptionsCache extends Action<string> {
}

export const GetUnreadCounts = 'GetUnreadCounts'
export interface GetUnreadCounts extends Action<string> {
    payload: feedly.GetUnreadCountsInput
}

export const GetUnreadCountsCache = 'GetUnreadCountsCache'
export interface GetUnreadCountsCache extends Action<string> {
}
