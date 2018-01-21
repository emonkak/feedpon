import React from 'react';

interface ExpandedEntryPlaceholderProps {
}

interface CollapsedEntryPlaceholderProps {
}

export const ExpandedEntryPlaceholder: React.SFC<ExpandedEntryPlaceholderProps> = () => {
    return (
        <article className="entry is-expanded">
            <div className="container">
                <header className="entry-header">
                    <h2 className="entry-title">
                        <span className="placeholder placeholder-80 animation-shining" />
                    </h2>
                    <div className="entry-metadata">
                        <span className="placeholder placeholder-60 animation-shining" />
                    </div>
                </header>
                <div className="entry-content u-clearfix u-text-wrap">
                    <p>
                        <span className="placeholder placeholder-100 animation-shining" />
                        <span className="placeholder placeholder-100 animation-shining" />
                        <span className="placeholder placeholder-100 animation-shining" />
                        <span className="placeholder placeholder-60 animation-shining" />
                    </p>
                    <p>
                        <span className="placeholder placeholder-100 animation-shining" />
                        <span className="placeholder placeholder-100 animation-shining" />
                        <span className="placeholder placeholder-100 animation-shining" />
                        <span className="placeholder placeholder-100 animation-shining" />
                        <span className="placeholder placeholder-80 animation-shining" />
                    </p>
                    <p>
                        <span className="placeholder placeholder-100 animation-shining" />
                        <span className="placeholder placeholder-100 animation-shining" />
                        <span className="placeholder placeholder-40 animation-shining" />
                    </p>
                </div>
                <footer className="entry-footer">
                    <div className="button-toolbar u-text-center">
                        <span className="button button-pill button-outline-default"><i className="icon icon-20 icon-comments" /></span>
                        <span className="button button-pill button-outline-default"><i className="icon icon-20 icon-share" /></span>
                        <span className="button button-pill button-outline-default"><i className="icon icon-20 icon-external-link" /></span>
                    </div>
                </footer>
            </div>
        </article>
    );
};

export const CollapsedEntryPlaceholder: React.SFC<CollapsedEntryPlaceholderProps> = () => {
    return (
        <article className="entry">
            <div className="container">
                <header className="entry-header">
                    <h2 className="entry-title">
                        <span className="placeholder placeholder-80 animation-shining" />
                    </h2>
                    <div className="entry-metadata">
                        <span className="placeholder placeholder-60 animation-shining" />
                    </div>
                </header>
                <div className="entry-summary">
                    <span className="placeholder placeholder-100 animation-shining" />
                </div>
            </div>
        </article>
    );
};
