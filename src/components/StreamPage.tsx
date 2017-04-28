import React, { PureComponent } from 'react';
import { Params } from 'react-router/lib/Router';

import Dropdown from 'components/parts/Dropdown';
import EntryList from 'components/parts/EntryList';
import MenuItem from 'components/parts/MenuItem';
import Navbar from 'components/parts/Navbar';
import bindAction from 'utils/bindAction';
import connect from 'utils/react/connect';
import { Category, State, Stream, StreamOptions, StreamView } from 'messaging/types';
import { changeStreamView, fetchComments, fetchStream, fetchFullContent, fetchMoreEntries, markAsRead } from 'messaging/stream/actions';

interface StreamProps {
    categories: Category[];
    stream: Stream;
    isScrolling: boolean;
    onChangeStreamView: (view: StreamView) => void,
    onFetchComments: (entryId: string, url: string) => void;
    onFetchStream: (streamId: string, options?: StreamOptions) => void;
    onFetchFullContent: (entryId: string, url: string) => void;
    onFetchMoreEntries: (streamId: string, continuation: string, options: StreamOptions) => void;
    onMarkAsRead: (entryIds: string[]) => void;
    onToggleSidebar: () => void,
    params: Params;
    scrollTo: (x: number, y: number) => Promise<void>;
};

interface StreamState {
    readEntryIds: Set<string>;
}

const SCROLL_OFFSET = 48;

class StreamPage extends PureComponent<StreamProps, StreamState> {
    constructor(props: StreamProps, context: any) {
        super(props, context);

        this.state = {
            readEntryIds: new Set()
        };

        this.handleLoadMoreEntries = this.handleLoadMoreEntries.bind(this);
        this.handleReadEntry = this.handleReadEntry.bind(this);
    }

    componentWillMount() {
        const { stream, onFetchStream, params } = this.props;

        if (!stream || (stream.streamId !== params['stream_id'])) {
            onFetchStream(params['stream_id']);
        }
    }

    componentWillUpdate(nextProps: StreamProps, nextState: {}) {
        const { params } = this.props;
        const { readEntryIds } = this.state;

        if (params['stream_id'] !== nextProps.params['stream_id']) {
            const { stream, onFetchStream, onMarkAsRead } = this.props;

            if (stream.streamId === params['stream_id']) {
                onMarkAsRead([...readEntryIds]);
            }

            onFetchStream(nextProps.params['stream_id']);
        }
    }

    componentWillReceiveProps(nextProps: StreamProps) {
        const { stream } = this.props;

        if (stream.streamId !== nextProps.stream.streamId) {
            this.setState({
                readEntryIds: new Set()
            });
        }
    }

    componentWillUnmount() {
        const { stream, onMarkAsRead, params } = this.props;
        const { readEntryIds } = this.state;

        if (stream.streamId === params['stream_id']) {
            onMarkAsRead([...readEntryIds]);
        }
    }

    handleReadEntry(readEntryIds: string[]) {
        this.setState((state) => ({
            readEntryIds: new Set([...state.readEntryIds, ...readEntryIds])
        }));
    }

    handleLoadMoreEntries(event: React.SyntheticEvent<any>) {
        event.preventDefault();

        const { onFetchMoreEntries, stream } = this.props;

        if (stream.streamId && stream.continuation) {
            onFetchMoreEntries(stream.streamId, stream.continuation, stream.options);
        }
    }

    handleChangeEntryOrder(order: 'newest' | 'oldest') {
        const { stream, onFetchStream, scrollTo } = this.props;

        if (stream.streamId) {
            scrollTo(0, 0);

            onFetchStream(stream.streamId, {
                ...stream.options,
                order
            });
        }
    }

    handleToggleOnlyUnread() {
        const { stream, onFetchStream } = this.props;

        if (stream.streamId) {
            scrollTo(0, 0);

            onFetchStream(stream.streamId, {
                ...stream.options,
                onlyUnread: !stream.options.onlyUnread
            });
        }
    }

    handleScrollToEntry(entryId: string) {
        const scrollElement = document.getElementById('entry-' + entryId);

        if (scrollElement) {
            this.props.scrollTo(0, scrollElement.offsetTop - SCROLL_OFFSET);
        }
    }

    handleClearReadEntries(entryId: string) {
        const { scrollTo } = this.props;

        scrollTo(0, 0).then(() => this.setState({ readEntryIds: new Set() }));
    }

    renderReadEntriesDropdown() {
        const { stream } = this.props;
        const { readEntryIds } = this.state;

        const readEntries = stream.entries.filter(entry => readEntryIds.has(entry.entryId));

        return (
            <Dropdown
                className="navbar-action"
                toggleButton={
                    <a href="#">
                        <i className="icon icon-24 icon-checkmark" />
                        <span className="badge badge-overlap badge-negative">{readEntries.length || ''}</span>
                    </a>
                }
                pullRight={true}>
                <div className="menu-heading">Read entries</div>
                {readEntries.map((entry) => (
                    <MenuItem 
                        onSelect={this.handleScrollToEntry.bind(this, entry.entryId)}
                        key={entry.entryId}
                        primaryText={entry.title} />
                ))}
                <div className="menu-divider" />
                <MenuItem
                    onSelect={this.handleClearReadEntries.bind(this)}
                    isDisabled={readEntries.length === 0}
                    primaryText="Clear all read entries" />
                <div className="menu-divider" />
                <MenuItem
                    isDisabled={stream.entries.length === 0}
                    primaryText="Mark all as read" />
            </Dropdown>
        );
    }

    renderConfigDropdown() {
        const { stream, onChangeStreamView } = this.props;

        return (
            <Dropdown
                className="navbar-action"
                toggleButton={<a href="#"><i className="icon icon-24 icon-more" /></a>}
                pullRight={true}>
                <div className="menu-heading">View</div>
                <MenuItem
                    icon={stream.options.view === 'expanded' ? <i className="icon icon-16 icon-checkmark" /> : null}
                    primaryText="Expanded view"
                    onSelect={onChangeStreamView.bind(null, 'expanded')} />
                <MenuItem
                    icon={stream.options.view === 'collapsible' ? <i className="icon icon-16 icon-checkmark" /> : null}
                    primaryText="Collapsible view"
                    onSelect={onChangeStreamView.bind(null, 'collapsible')} />
                <div className="menu-divider" />
                <div className="menu-heading">Order</div>
                <MenuItem
                    icon={stream.options.order === 'newest' ? <i className="icon icon-16 icon-checkmark" /> : null}
                    primaryText="Newest first"
                    onSelect={this.handleChangeEntryOrder.bind(this, 'newest')} />
                <MenuItem
                    icon={stream.options.order === 'oldest' ? <i className="icon icon-16 icon-checkmark" /> : null}
                    primaryText="Oldest first"
                    onSelect={this.handleChangeEntryOrder.bind(this, 'oldest')} />
                <div className="menu-divider" />
                <MenuItem
                    icon={stream.options.onlyUnread ? <i className="icon icon-16 icon-checkmark" /> : null}
                    primaryText="Only unread"
                    onSelect={this.handleToggleOnlyUnread.bind(this)} />
            </Dropdown>
        );
    }

    renderNavbarTitle() {
        const { stream } = this.props;

        if (stream.feed) {
            return (
                <a className="link-default" href={stream.feed.url} target="_blank">{stream.title}</a>
            );
        } else {
            return stream.title;
        }
    }

    renderNavbar() {
        const { onToggleSidebar } = this.props;

        return (
            <Navbar onToggleSidebar={onToggleSidebar}>
                <div className="navbar-title" href="#">{this.renderNavbarTitle()}</div>
                <div className="navbar-action">
                    <a href="#"><i className="icon icon-24 icon-refresh" /></a>
                </div>
                {this.renderReadEntriesDropdown()}
                {this.renderConfigDropdown()}
            </Navbar>
        );
    }

    renderHeader() {
        const { stream } = this.props;
        const { feed, subscription } = stream;

        if (feed) {
            const { categories } = this.props;

            const subscribeButton = subscription
                ?  (
                    <Dropdown
                        toggleButton={
                            <a className="button button-outline-default dropdown-arrow" href="#">
                                <i className="icon icon-20 icon-settings" />
                            </a>
                        }
                        pullRight={true}>
                        <div className="menu-heading">Category</div>
                        {categories.map(category => (
                            <MenuItem
                                key={category.categoryId}
                                icon={category.categoryId === subscription.categoryId ? <i className="icon icon-16 icon-checkmark" /> : null}
                                primaryText={category.label} />
                        ))}
                        <div className="menu-divider" />
                        <MenuItem primaryText="New Category..." />
                        <div className="menu-divider" />
                        <MenuItem
                            isDisabled={!subscription}
                            primaryText="Unsubscribe" />
                    </Dropdown>
                ) : (<a className="button button-outline-positive dropdown-arrow" href="#">Subscribe</a>);

            return (
                <header className="stream-header">
                    <div className="container">
                        <div className="stream-header-content">
                            <div className="stream-metadata">
                                <div className="stream-info-list">
                                    <span className="stream-info"><strong>{feed.velocity.toFixed(1)}</strong> entries per week</span>
                                    <span className="stream-info"><strong>{feed.subscribers}</strong> subscribers</span>
                                </div>
                                <div className="stream-description">{feed.description}</div>
                            </div>
                            {subscribeButton}
                        </div>
                    </div>
                </header>
            );
        }

        return null;
    }

    renderEntryList() {
        const { stream, isScrolling, onFetchComments, onFetchFullContent, scrollTo } = this.props;
        const { readEntryIds } = this.state;

        return (
            <EntryList
                entries={stream ? stream.entries : []}
                isLoading={stream.isLoading && !stream.isLoaded}
                isScrolling={isScrolling}
                onFetchComments={onFetchComments}
                onFetchFullContent={onFetchFullContent}
                onRead={this.handleReadEntry}
                readEntryIds={readEntryIds}
                scrollTo={scrollTo}
                view={stream.options.view} />
        );
    }

    renderFooter() {
        const { stream } = this.props;

        if (stream.continuation) {
            if (stream.isLoading) {
                return (
                    <footer className="stream-footer">
                        <i className="icon icon-32 icon-spinner animation-clockwise-rotation" />
                    </footer>
                );
            } else {
                return (
                    <footer className="stream-footer">
                        <a
                            className="link-default"
                            href="#"
                            onClick={this.handleLoadMoreEntries}>
                            Load more entries...
                        </a>
                    </footer>
                );
            }
        } else {
            return (
                <footer className="stream-footer">
                    No more entries here.
                </footer>
            );
        }
    }

    render() {
        return (
            <div className="l-main">
                <div className="l-main-header">
                    {this.renderNavbar()}
                </div>
                <div className="l-main-content">
                    {this.renderHeader()}
                    {this.renderEntryList()}
                    {this.renderFooter()}
                </div>
            </div>
        );
    }
}

export default connect(
    (state: State) => ({
        categories: state.subscriptions.categories,
        stream: state.stream
    }),
    (dispatch) => ({
        onChangeStreamView: bindAction(changeStreamView, dispatch),
        onFetchComments: bindAction(fetchComments, dispatch),
        onFetchStream: bindAction(fetchStream, dispatch),
        onFetchFullContent: bindAction(fetchFullContent, dispatch),
        onFetchMoreEntries: bindAction(fetchMoreEntries, dispatch),
        onMarkAsRead: bindAction(markAsRead, dispatch)
    })
)(StreamPage);
