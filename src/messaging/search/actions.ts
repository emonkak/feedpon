import Enumerable from '@emonkak/enumerable';

import '@emonkak/enumerable/extensions/groupJoin';
import '@emonkak/enumerable/extensions/toArray';

import { AsyncEvent } from 'messaging/types';
import { getFeedlyToken } from 'messaging/credential/actions';
import { searchFeeds as feedlySearchFeeds } from 'adapters/feedly/api';

export function searchFeeds(query: string): AsyncEvent {
    return async (dispatch, getState) => {
        dispatch({
            type: 'FEED_SEARCHING',
            query
        });

        const token = await dispatch(getFeedlyToken());
        const searchResult = await feedlySearchFeeds(token.id, {
            query,
            count: 20
        });

        const { subscriptions } = getState();
        const feeds = new Enumerable(searchResult.results)
            .groupJoin(
                subscriptions.items,
                (feed) => feed.feedId,
                (subscription) => subscription.streamId,
                (feed, subscriptions) => ({
                    feedId: feed.feedId,
                    streamId: feed.feedId,
                    title: feed.title,
                    description: feed.description || '',
                    url: feed.website || '',
                    iconUrl: feed.iconUrl || '',
                    subscribers: feed.subscribers,
                    subscription: subscriptions[0] || null,
                    isSubscribing: false
                })
            )
            .toArray();

        dispatch({
            type: 'FEED_SEARCHED',
            query,
            feeds
        });
    };
}
