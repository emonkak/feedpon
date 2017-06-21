import React from 'react';
import { Link } from 'react-router';

import SubscribeDropdown from 'components/parts/SubscribeDropdown';
import { Category, Feed, Subscription } from 'messaging/types';

interface FeedProps {
    categories: Category[];
    feed: Feed;
    onAddToCategory: (subscription: Subscription, label: string) => void;
    onCreateCategory: (label: string, callback: (category: Category) => void) => void;
    onRemoveFromCategory: (subscription: Subscription, label: string) => void;
    onSubscribe: (feed: Feed, labels: string[]) => void;
    onUnsubscribe: (subscription: Subscription) => void;
    subscription: Subscription;
}

const FeedComponent: React.SFC<FeedProps> = (props) => {
    const {
        categories,
        feed,
        onAddToCategory,
        onCreateCategory,
        onRemoveFromCategory,
        onSubscribe,
        onUnsubscribe,
        subscription
    } = props;

    return (
        <li className="list-group-item">
            <div className="u-flex u-flex-justify-content-between u-flex-align-items-center">
                <div className="u-margin-right-2">
                    <Link className="link-strong" to={`/streams/${encodeURIComponent(feed.streamId)}`}>{feed.title}</Link>
                    <div className="u-text-small"><strong>{feed.subscribers}</strong> subscribers</div>
                    <div className="u-text-muted">{feed.description}</div>
                </div>
                <SubscribeDropdown
                    categories={categories}
                    feed={feed}
                    onAddToCategory={onAddToCategory}
                    onCreateCategory={onCreateCategory}
                    onRemoveFromCategory={onRemoveFromCategory}
                    onSubscribe={onSubscribe}
                    onUnsubscribe={onUnsubscribe}
                    subscription={subscription} />
            </div>
        </li>
    );
}

export default FeedComponent;
