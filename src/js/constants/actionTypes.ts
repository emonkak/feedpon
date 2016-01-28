import * as feedly from '../services/feedly/interfaces'
import { Action, Event } from '../shared/interfaces'

export const Authenticate = 'Authenticate'
export interface Authenticate extends Action<string> {
}

export const DispatchEvent = 'DispatchEvent'
export interface DispatchEvent<TEvent extends Event<string>> extends Action<string> {
    event: TEvent
}

export const ExpandUrl = 'ExpandUrl'
export interface ExpandUrl extends Action<string> {
    url: string
}

export const FetchContents = 'FetchContents'
export interface FetchContents extends Action<string> {
    payload: feedly.GetStreamInput
}

export const FetchCategories = 'FetchCategories'
export interface FetchCategories extends Action<string> {
}

export const FetchFullContent = 'FetchFullContent'
export interface FetchFullContent extends Action<string> {
    streamId: string
    url: string
}

export const FetchSubscriptions = 'FetchSubscriptions'
export interface FetchSubscriptions extends Action<string> {
}

export const FetchUnreadCounts = 'FetchUnreadCounts'
export interface FetchUnreadCounts extends Action<string> {
    payload: feedly.GetUnreadCountsInput
}

export const GetCategoriesCache = 'GetCategoriesCache'
export interface GetCategoriesCache extends Action<string> {
}

export const GetCredential = 'GetCredential'
export interface GetCredential extends Action<string> {
}

export const GetSubscriptionsCache = 'GetSubscriptionsCache'
export interface GetSubscriptionsCache extends Action<string> {
}

export const GetUnreadCountsCache = 'GetUnreadCountsCache'
export interface GetUnreadCountsCache extends Action<string> {
}

export namespace History {
    export const Push = 'History/Push'
    export interface Push extends Action<string> {
        path: string
    }

    export const Replace = 'History/Replace'
    export interface Replace extends Action<string> {
        path: string
    }

    export const Go = 'History/Go'
    export interface Go extends Action<string> {
        n: number
    }

    export const GoBack = 'History/GoBack'
    export interface GoBack extends Action<string> {
    }

    export const GoForward = 'History/GoForward'
    export interface GoForward extends Action<string> {
    }
}
