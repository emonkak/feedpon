export interface State {
    subscriptions: any[];
}

export type Action = FetchSubscriptions;

export type AsyncAction = (dispatch: (action: Action) => void) => void;

export type FetchSubscriptions = {
    type: 'FETCH_SUBSCRIPTIONS';
    subscriptions: any[];
};
