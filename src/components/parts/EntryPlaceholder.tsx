import React from 'react';
import classnames from 'classnames';

interface EntryPlaceholderProps {
    isExpanded: boolean;
}

const EntryPlaceholder: React.SFC<EntryPlaceholderProps> = ({ isExpanded }) => {
    return (
        <article className={classnames('entry', {
            'is-expanded': isExpanded
        })}>
            <div className="container">
                <header className="entry-header">
                    <h2 className="entry-title">
                        <span className="placeholder placeholder-animated placeholder-80" />
                    </h2>
                    <div className="entry-metadata">
                        <span className="placeholder placeholder-animated placeholder-60" />
                    </div>
                </header>
                <div className="entry-summary">
                    <span className="placeholder placeholder-animated placeholder-100" />
                </div>
                <div className="entry-content">
                    <p>
                        <span className="placeholder placeholder-animated placeholder-100" />
                        <span className="placeholder placeholder-animated placeholder-100" />
                        <span className="placeholder placeholder-animated placeholder-100" />
                        <span className="placeholder placeholder-animated placeholder-60" />
                    </p>
                    <p>
                        <span className="placeholder placeholder-animated placeholder-100" />
                        <span className="placeholder placeholder-animated placeholder-100" />
                        <span className="placeholder placeholder-animated placeholder-100" />
                        <span className="placeholder placeholder-animated placeholder-100" />
                        <span className="placeholder placeholder-animated placeholder-80" />
                    </p>
                    <p>
                        <span className="placeholder placeholder-animated placeholder-100" />
                        <span className="placeholder placeholder-animated placeholder-100" />
                        <span className="placeholder placeholder-animated placeholder-40" />
                    </p>
                </div>
                <footer className="entry-footer">
                    <div className="button-toolbar u-text-center">
                        <span className="button button-pill button-outline-default"><i className="icon icon-20 icon-comments"></i></span> <span className="entry-action"><i className="icon icon-20 icon-share"></i></span>
                        <span className="button button-pill button-outline-default"><i className="icon icon-20 icon-external-link"></i></span>
                    </div>
                </footer>
            </div>
        </article>
    );
}

export default EntryPlaceholder;
