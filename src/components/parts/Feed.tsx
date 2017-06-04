import React, { PureComponent } from 'react';
import { Link } from 'react-router';

import Dropdown from 'components/parts/Dropdown';
import SubscribeButton from 'components/parts/SubscribeButton';
import SubscribeMenu from 'components/parts/SubscribeMenu';
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

export default class FeedComponent extends PureComponent<FeedProps, {}> {
    render() {
        const { categories, feed, onAddToCategory, onCreateCategory, onRemoveFromCategory, onSubscribe, onUnsubscribe, subscription } = this.props;

        return (
            <li className="list-group-item">
                <div className="u-flex u-flex-justify-content-between u-flex-align-items-center">
                    <div className="u-margin-right">
                        <Link className="link-strong" to={`/streams/${encodeURIComponent(feed.streamId)}`}>{feed.title}</Link>
                        <div className="u-text-small"><strong>{feed.subscribers}</strong> subscribers</div>
                        <div className="u-text-muted">{feed.description}</div>
                    </div>
                    <Dropdown
                        toggleButton={
                            <SubscribeButton
                                isSubscribed={!!subscription}
                                isLoading={feed.isLoading} />
                        }
                        menu={
                            <SubscribeMenu
                                categories={categories}
                                feed={feed}
                                onAddToCategory={onAddToCategory}
                                onCreateCategory={onCreateCategory}
                                onRemoveFromCategory={onRemoveFromCategory}
                                onSubscribe={onSubscribe}
                                onUnsubscribe={onUnsubscribe}
                                subscription={subscription} />
                        }
                        pullRight={true} />
                </div>
            </li>
        );
    }
}
