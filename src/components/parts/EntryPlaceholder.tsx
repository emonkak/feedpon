import React, { PropTypes } from 'react';
import classnames from 'classnames';

export default class EntryPlaceholder extends React.Component<any, any> {
    static propTypes = {
        expanded: PropTypes.bool
    };

    static defaultProps = {
        expanded: false
    };

    renderContent() {
        const { expanded } = this.props;

        if (expanded) {
            return (
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
            );
        } else {
            return (
                <div className="entry-description">
                    <span className="placeholder placeholder-animated placeholder-100" />
                </div>
            );
        }
    }

    render() {
        const { expanded } = this.props;

        return (
            <article className={classnames('entry', {
                'is-expanded': expanded
            })}>
                <div className="container">
                    <header className="entry-header">
                        <h2 className="entry-title"><span className="placeholder placeholder-animated placeholder-60" /></h2>
                        <div className="entry-info">
                            <ul className="list-inline list-inline-dot">
                                <li><span className="placeholder placeholder-animated" style={{ width: '6em' }} /></li>
                                <li><span className="placeholder placeholder-animated" style={{ width: '8em' }} /></li>
                            </ul>
                        </div>
                    </header>
                    {this.renderContent()}
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
