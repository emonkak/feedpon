import React, { PureComponent } from 'react';
import { Link } from 'react-router';

import SubscribeButton from 'components/parts/SubscribeButton';
import { Category, Feed, Subscription } from 'messaging/types';

interface FeedProps {
    categories: Category[];
    feed: Feed;
    onSubscribe: (feed: Feed, categoryIds: (string | number)[]) => void;
    onUnsubscribe: (feedId: string | number) => void;
    subscription: Subscription | null;
}

export default class FeedComponent extends PureComponent<FeedProps, {}> {
    render() {
        const { categories, feed, onSubscribe, onUnsubscribe, subscription } = this.props;

        return (
            <li className="list-group-item">
                <div className="u-margin-right">
                    <Link className="link-strong" to={`/streams/${encodeURIComponent(feed.streamId)}`}>{feed.title}</Link>
                    <div className="u-text-small"><strong>{feed.subscribers}</strong> subscribers</div>
                    <div className="u-text-muted">{feed.description}</div>
                </div>
                <SubscribeButton
                    feed={feed}
                    categories={categories}
                    onSubscribe={onSubscribe}
                    onUnsubscribe={onUnsubscribe}
                    subscription={subscription} />
            </li>
        );
    }
}
