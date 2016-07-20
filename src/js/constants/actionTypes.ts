import * as feedly from '../services/feedly/interfaces';
import { GenericAction } from '../shared/interfaces';

export type Action = Authenticate | ExpandUrl | FetchContents | FetchCategories | FetchFullContent | FetchSubscriptions | FetchUnreadCounts | GetCategoriesCache | GetCredential | GetSubscriptionsCache | GetUnreadCountsCache | History.Push | History.Replace | History.Go | History.GoBack | History.GoForward;

export const Authenticate: 'Authenticate' = 'Authenticate';
export interface Authenticate extends GenericAction<typeof Authenticate> {
}

export const ExpandUrl: 'ExpandUrl' = 'ExpandUrl';
export interface ExpandUrl extends GenericAction<typeof ExpandUrl> {
    url: string;
}

export const FetchContents: 'FetchContents' = 'FetchContents';
export interface FetchContents extends GenericAction<typeof FetchContents> {
    payload: feedly.GetStreamInput;
}

export const FetchCategories: 'FetchCategories' = 'FetchCategories';
export interface FetchCategories extends GenericAction<typeof FetchCategories> {
}

export const FetchFullContent: 'FetchFullContent' = 'FetchFullContent';
export interface FetchFullContent extends GenericAction<typeof FetchFullContent> {
    streamId: string;
    url: string;
}

export const FetchSubscriptions: 'FetchSubscriptions' = 'FetchSubscriptions';
export interface FetchSubscriptions extends GenericAction<typeof FetchSubscriptions> {
}

export const FetchUnreadCounts: 'FetchUnreadCounts' = 'FetchUnreadCounts';
export interface FetchUnreadCounts extends GenericAction<typeof FetchUnreadCounts> {
    payload: feedly.GetUnreadCountsInput;
}

export const GetCategoriesCache: 'GetCategoriesCache' = 'GetCategoriesCache';
export interface GetCategoriesCache extends GenericAction<typeof GetCategoriesCache> {
}

export const GetCredential: 'GetCredential' = 'GetCredential';
export interface GetCredential extends GenericAction<typeof GetCredential> {
}

export const GetSubscriptionsCache: 'GetSubscriptionsCache' = 'GetSubscriptionsCache';
export interface GetSubscriptionsCache extends GenericAction<typeof GetSubscriptionsCache> {
}

export const GetUnreadCountsCache: 'GetUnreadCountsCache' = 'GetUnreadCountsCache';
export interface GetUnreadCountsCache extends GenericAction<typeof GetUnreadCountsCache> {
}

export namespace History {
    export const Push: 'History/Push' = 'History/Push';
    export interface Push extends GenericAction<typeof Push> {
        path: string;
    }

    export const Replace: 'History/Replace' = 'History/Replace';
    export interface Replace extends GenericAction<typeof Replace> {
        path: string;
    }

    export const Go: 'History/Go' = 'History/Go';
    export interface Go extends GenericAction<typeof Go> {
        n: number;
    }

    export const GoBack: 'History/GoBack' = 'History/GoBack';
    export interface GoBack extends GenericAction<typeof GoBack> {
    }

    export const GoForward: 'History/GoForward' = 'History/GoForward';
    export interface GoForward extends GenericAction<typeof GoForward> {
    }
}
