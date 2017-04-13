import React, { PropTypes } from 'react';
import classnames from 'classnames';

interface Props {
    isCollapsible?: boolean;
    isExpanded?: boolean;
}

export default class EntryPlaceholder extends React.Component<Props, {}> {
    static propTypes = {
        isCollapsible: PropTypes.bool.isRequired,
        isExpanded: PropTypes.bool.isRequired
    };

    static defaultProps = {
        isCollapsible: false,
        isExpanded: false
    };

    render() {
        const { isCollapsible, isExpanded } = this.props;

        return (
            <article className={classnames('entry', {
                'is-collapsible': isCollapsible,
                'is-expanded': isExpanded
            })}>
                <div className="container">
                    <header className="entry-header">
                        <h2 className="entry-title"><span className="placeholder placeholder-animated placeholder-80" /></h2>
                        <div className="entry-info-list">
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
                        <div className="entry-action-list">
                            <span className="entry-action"><i className="icon icon-20 icon-comments"></i></span>
                            <span className="entry-action"><i className="icon icon-20 icon-share"></i></span>
                            <span className="entry-action"><i className="icon icon-20 icon-external-link"></i></span>
                        </div>
                    </footer>
                </div>
            </article>
        );
    }
}
