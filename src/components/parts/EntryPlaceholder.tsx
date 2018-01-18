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
                        <span className="placeholder placeholder-80 a-shining" />
                    </h2>
                    <div className="entry-metadata">
                        <span className="placeholder placeholder-60 a-shining" />
                    </div>
                </header>
                <div className="entry-summary">
                    <span className="placeholder placeholder-100 a-shining" />
                </div>
                <div className="entry-content u-clearfix u-text-wrap">
                    <p>
                        <span className="placeholder placeholder-100 a-shining" />
                        <span className="placeholder placeholder-100 a-shining" />
                        <span className="placeholder placeholder-100 a-shining" />
                        <span className="placeholder placeholder-60 a-shining" />
                    </p>
                    <p>
                        <span className="placeholder placeholder-100 a-shining" />
                        <span className="placeholder placeholder-100 a-shining" />
                        <span className="placeholder placeholder-100 a-shining" />
                        <span className="placeholder placeholder-100 a-shining" />
                        <span className="placeholder placeholder-80 a-shining" />
                    </p>
                    <p>
                        <span className="placeholder placeholder-100 a-shining" />
                        <span className="placeholder placeholder-100 a-shining" />
                        <span className="placeholder placeholder-40 a-shining" />
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

export default EntryPlaceholder;
