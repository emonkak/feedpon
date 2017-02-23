import * as React from 'react';
import * as classnames from 'classnames';

export default class EntryPlaceholder extends React.Component<any, any> {
    static propTypes = {
        viewMode: React.PropTypes.oneOf(['full', 'compact']).isRequired
    };

    renderContent() {
        const { viewMode } = this.props;

        if (viewMode === 'full') {
            return (
                <div>
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
                <span className="placeholder placeholder-animated placeholder-100" />
            );
        }
    }

    render() {
        const { viewMode } = this.props;

        return (
            <article className={classnames('entry', 'entry-' + viewMode)}>
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
                    <div className="entry-content">
                        {this.renderContent()}
                    </div>
                    <footer className="entry-footer">
                        <ul className="list-inline list-inline-dot u-baseline-2">
                            <li><i className="icon icon-32 icon-pin-3"></i></li>
                            <li><i className="icon icon-32 icon-bookmark"></i></li>
                            <li><i className="icon icon-32 icon-comments"></i></li>
                            <li><i className="icon icon-32 icon-share"></i></li>
                        </ul>
                    </footer>
                </div>
            </article>
        );
    }
}
