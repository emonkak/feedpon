import React, { PureComponent } from 'react';

export default class FeedPlaceholder extends PureComponent<{}, {}> {
    render() {
        return (
            <li className="list-group-item">
                <div className="u-full-width">
                    <div className="feed-title">
                        <span className="placeholder placeholder-animated placeholder-40" />
                    </div>
                    <div className="feed-subscribers">
                        <span className="placeholder placeholder-animated placeholder-10" />
                    </div>
                    <div className="feed-description">
                        <span className="placeholder placeholder-animated placeholder-100" />
                        <span className="placeholder placeholder-animated placeholder-60" />
                    </div>
                </div>
            </li>
        );
    }
}
