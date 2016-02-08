import * as feedly from '../services/feedly/interfaces'
import { Action, Event } from '../shared/interfaces'

export const Authenticate: 'Authenticate' = 'Authenticate'
export interface Authenticate extends Action<typeof Authenticate> {
}

export const DispatchEvent: 'DispatchEvent' = 'DispatchEvent'
export interface DispatchEvent<TEvent extends Event<string>> extends Action<typeof DispatchEvent> {
    event: TEvent
}

export const ExpandUrl: 'ExpandUrl' = 'ExpandUrl'
export interface ExpandUrl extends Action<typeof ExpandUrl> {
    url: string
}

export const FetchContents: 'FetchContents' = 'FetchContents'
export interface FetchContents extends Action<typeof FetchContents> {
    payload: feedly.GetStreamInput
}

export const FetchCategories: 'FetchCategories' = 'FetchCategories'
export interface FetchCategories extends Action<typeof FetchCategories> {
}

export const FetchFullContent: 'FetchFullContent' = 'FetchFullContent'
export interface FetchFullContent extends Action<typeof FetchFullContent> {
    streamId: string
    url: string
}

export const FetchSubscriptions: 'FetchSubscriptions' = 'FetchSubscriptions'
export interface FetchSubscriptions extends Action<typeof FetchSubscriptions> {
}

export const FetchUnreadCounts: 'FetchUnreadCounts' = 'FetchUnreadCounts'
export interface FetchUnreadCounts extends Action<typeof FetchUnreadCounts> {
    payload: feedly.GetUnreadCountsInput
}

export const GetCategoriesCache: 'GetCategoriesCache' = 'GetCategoriesCache'
export interface GetCategoriesCache extends Action<typeof GetCategoriesCache> {
}

export const GetCredential: 'GetCredential' = 'GetCredential'
export interface GetCredential extends Action<typeof GetCredential> {
}

export const GetSubscriptionsCache: 'GetSubscriptionsCache' = 'GetSubscriptionsCache'
export interface GetSubscriptionsCache extends Action<typeof GetSubscriptionsCache> {
}

export const GetUnreadCountsCache: 'GetUnreadCountsCache' = 'GetUnreadCountsCache'
export interface GetUnreadCountsCache extends Action<typeof GetUnreadCountsCache> {
}

export namespace History {
    export const Push: 'History/Push' = 'History/Push'
    export interface Push extends Action<typeof Push> {
        path: string
    }

    export const Replace: 'History/Replace' = 'History/Replace'
    export interface Replace extends Action<typeof Replace> {
        path: string
    }

    export const Go: 'History/Go' = 'History/Go'
    export interface Go extends Action<typeof Go> {
        n: number
    }

    export const GoBack: 'History/GoBack' = 'History/GoBack'
    export interface GoBack extends Action<typeof GoBack> {
    }

    export const GoForward: 'History/GoForward' = 'History/GoForward'
    export interface GoForward extends Action<typeof GoForward> {
    }
}
