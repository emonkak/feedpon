import React from 'react';

const FeedPlaceholder: React.SFC<{}> = () => {
    return (
        <li className="list-group-item">
            <div className="link-strong">
                <span className="placeholder placeholder-40 a-shining" />
            </div>
            <div className="u-text-small">
                <span className="placeholder placeholder-10 a-shining" />
            </div>
            <div className="u-text-muted">
                <span className="placeholder placeholder-100 a-shining" />
                <span className="placeholder placeholder-60 a-shining" />
            </div>
        </li>
    );
};

export default FeedPlaceholder;
