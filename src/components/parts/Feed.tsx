import React, { PureComponent } from 'react';
import { Link } from 'react-router';

import SubscribeButton from 'components/parts/SubscribeButton';
import { Category, Feed, Subscription } from 'messaging/types';

interface FeedProps {
    categories: Category[];
    feed: Feed;
    onCreateCategory: (label: string, callback: (category: Category) => void) => void;
    onSubscribe: (feed: Feed, labels: string[]) => void;
    onUnsubscribe: (feedId: string | number) => void;
    subscription: Subscription | null;
}

export default class FeedComponent extends PureComponent<FeedProps, {}> {
    render() {
        const { categories, feed, onCreateCategory, onSubscribe, onUnsubscribe, subscription } = this.props;

        return (
            <li className="list-group-item">
                <div className="u-flex u-flex-justify-content-between u-flex-align-items-center">
                    <div className="u-margin-right">
                        <Link className="link-strong" to={`/streams/${encodeURIComponent(feed.streamId)}`}>{feed.title}</Link>
                        <div className="u-text-small"><strong>{feed.subscribers}</strong> subscribers</div>
                        <div className="u-text-muted">{feed.description}</div>
                    </div>
                    <SubscribeButton
                        feed={feed}
                        categories={categories}
                        onCreateCategory={onCreateCategory}
                        onSubscribe={onSubscribe}
                        onUnsubscribe={onUnsubscribe}
                        subscription={subscription} />
                </div>
            </li>
        );
    }
}
