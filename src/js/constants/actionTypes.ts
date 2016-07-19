import * as feedly from '../services/feedly/interfaces';
import { AnyEvent, IAction } from '../shared/interfaces';

export type Action = Authenticate | DispatchEvent | ExpandUrl | FetchContents | FetchCategories | FetchFullContent | FetchSubscriptions | FetchUnreadCounts | GetCategoriesCache | GetCredential | GetSubscriptionsCache | GetUnreadCountsCache | History.Push | History.Replace | History.Go | History.GoBack | History.GoForward;

export const Authenticate: 'Authenticate' = 'Authenticate';
export interface Authenticate extends IAction<typeof Authenticate> {
}

export const DispatchEvent: 'DispatchEvent' = 'DispatchEvent';
export interface DispatchEvent extends IAction<typeof DispatchEvent> {
    event: AnyEvent;
}

export const ExpandUrl: 'ExpandUrl' = 'ExpandUrl';
export interface ExpandUrl extends IAction<typeof ExpandUrl> {
    url: string;
}

export const FetchContents: 'FetchContents' = 'FetchContents';
export interface FetchContents extends IAction<typeof FetchContents> {
    payload: feedly.GetStreamInput;
}

export const FetchCategories: 'FetchCategories' = 'FetchCategories';
export interface FetchCategories extends IAction<typeof FetchCategories> {
}

export const FetchFullContent: 'FetchFullContent' = 'FetchFullContent';
export interface FetchFullContent extends IAction<typeof FetchFullContent> {
    streamId: string;
    url: string;
}

export const FetchSubscriptions: 'FetchSubscriptions' = 'FetchSubscriptions';
export interface FetchSubscriptions extends IAction<typeof FetchSubscriptions> {
}

export const FetchUnreadCounts: 'FetchUnreadCounts' = 'FetchUnreadCounts';
export interface FetchUnreadCounts extends IAction<typeof FetchUnreadCounts> {
    payload: feedly.GetUnreadCountsInput;
}

export const GetCategoriesCache: 'GetCategoriesCache' = 'GetCategoriesCache';
export interface GetCategoriesCache extends IAction<typeof GetCategoriesCache> {
}

export const GetCredential: 'GetCredential' = 'GetCredential';
export interface GetCredential extends IAction<typeof GetCredential> {
}

export const GetSubscriptionsCache: 'GetSubscriptionsCache' = 'GetSubscriptionsCache';
export interface GetSubscriptionsCache extends IAction<typeof GetSubscriptionsCache> {
}

export const GetUnreadCountsCache: 'GetUnreadCountsCache' = 'GetUnreadCountsCache';
export interface GetUnreadCountsCache extends IAction<typeof GetUnreadCountsCache> {
}

export namespace History {
    export const Push: 'History/Push' = 'History/Push';
    export interface Push extends IAction<typeof Push> {
        path: string;
    }

    export const Replace: 'History/Replace' = 'History/Replace';
    export interface Replace extends IAction<typeof Replace> {
        path: string;
    }

    export const Go: 'History/Go' = 'History/Go';
    export interface Go extends IAction<typeof Go> {
        n: number;
    }

    export const GoBack: 'History/GoBack' = 'History/GoBack';
    export interface GoBack extends IAction<typeof GoBack> {
    }

    export const GoForward: 'History/GoForward' = 'History/GoForward';
    export interface GoForward extends IAction<typeof GoForward> {
    }
}
