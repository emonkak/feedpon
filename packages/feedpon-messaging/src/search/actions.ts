import type { AsyncThunk } from '../index';
import { getFeedlyToken } from '../backend/actions';
import { searchFeeds as feedlySearchFeeds } from 'feedpon-adapters/feedly';

export function searchFeeds(query: string): AsyncThunk {
    return async ({ dispatch }) => {
        dispatch({
            type: 'FEED_SEARCHING',
            query
        });

        try {
            const token = await dispatch(getFeedlyToken());
            const searchResult = await feedlySearchFeeds(token.id, {
                query,
                count: 20
            });

            const feeds = searchResult.results
                .map((feed) => ({
                    feedId: feed.feedId,
                    streamId: feed.feedId,
                    title: feed.title,
                    description: feed.description || '',
                    url: feed.website || '',
                    feedUrl: feed.feedId.replace(/^feed\//, ''),
                    iconUrl: feed.iconUrl || '',
                    subscribers: feed.subscribers || 0,
                    isLoading: false
                }));

            dispatch({
                type: 'FEED_SEARCHED',
                query,
                feeds
            });
        } catch (error) {
            dispatch({
                type: 'FEED_SEARCHING_FAILED',
                query
            });

            throw error;
        }
    };
}
