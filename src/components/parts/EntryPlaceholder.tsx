import React, { PropTypes } from 'react';
import classnames from 'classnames';

export default class EntryPlaceholder extends React.Component<any, any> {
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
                        <div>
                            <span className="placeholder placeholder-animated placeholder-60" />
                        </div>
                    </header>
                    <div className="entry-description">
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
                    <div className="entry-action-list">
                        <div className="entry-action"><i className="icon icon-24 icon-pin-3"></i></div>
                        <div className="entry-action"><i className="icon icon-24 icon-bookmark"></i></div>
                        <div className="entry-action"><i className="icon icon-24 icon-comments"></i></div>
                        <div className="entry-action"><i className="icon icon-24 icon-share"></i></div>
                    </div>
                </div>
            </article>
        );
    }
}
