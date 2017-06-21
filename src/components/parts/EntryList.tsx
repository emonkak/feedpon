import Enumerable from '@emonkak/enumerable'
import React, { PureComponent } from 'react';

import '@emonkak/enumerable/extensions/select';
import '@emonkak/enumerable/extensions/takeWhile';
import '@emonkak/enumerable/extensions/toArray';
import '@emonkak/enumerable/extensions/where';

import EntryComponent from 'components/parts/Entry';
import EntryPlaceholder from 'components/parts/EntryPlaceholder';
import ScrollSpy from 'components/parts/ScrollSpy';
import { Entry, StreamViewKind } from 'messaging/types';

const SCROLL_OFFSET = 48;

interface EntryListProps {
    entries: Entry[];
    isLoading: boolean;
    isScrolling: boolean;
    onFetchComments: (entryId: string | number, url: string) => void;
    onFetchFullContent: (entryId: string | number, url: string) => void;
    onHideFullContents: (entryId: string | number) => void;
    onPin: (entryId: string | number) => void;
    onRead: (entryIds: (string | number)[]) => void;
    onShowFullContents: (entryId: string | number) => void;
    onUnpin: (entryId: string | number) => void;
    sameOrigin: boolean;
    scrollTo: (x: number, y: number) => Promise<void>;
    streamView: StreamViewKind;
}

interface EntryListState {
    expandedEntryId: string | number | null;
}

export default class EntryList extends PureComponent<EntryListProps, EntryListState> {
    private activeEntryId: string | null = null;

    constructor(props: EntryListProps, context: any) {
        super(props, context);

        this.state = {
            expandedEntryId: null
        };

        this.handleActivate = this.handleActivate.bind(this);
        this.handleInactivate = this.handleInactivate.bind(this);
        this.handleExpand = this.handleExpand.bind(this);
        this.handleClose = this.handleClose.bind(this);
    }

    componentWillReceiveProps(nextProps: EntryListProps) {
        if (nextProps.streamView !== this.props.streamView) {
            this.setState({
                expandedEntryId: null
            });
        }
    }

    componentDidUpdate(prevProps: EntryListProps, prevState: EntryListState) {
        let scrollElement: HTMLElement | null = null;

        if (this.state.expandedEntryId !== prevState.expandedEntryId && this.state.expandedEntryId) {
            scrollElement = document.getElementById('entry-' + this.state.expandedEntryId);
        }

        if (this.props.streamView !== prevProps.streamView && this.activeEntryId) {
            scrollElement = document.getElementById('entry-' + this.activeEntryId);
        }

        if (scrollElement) {
            const { scrollTo } = this.props;

            scrollTo(0, scrollElement.offsetTop - SCROLL_OFFSET);
        }
    }

    handleActivate(activeKey: string) {
        const { entries, onRead } = this.props;

        const newReadEntryIds = new Enumerable(entries)
            .takeWhile((entry) => entry.entryId !== activeKey)
            .where((entry) => !entry.markedAsRead)
            .select((entry) => entry.entryId)
            .toArray();

        if (newReadEntryIds.length > 0) {
            onRead(newReadEntryIds);
        }

        this.activeEntryId = activeKey;
    }

    handleInactivate(inactiveKey: string) {
        const { entries, onRead } = this.props;
        const latestEntry = entries[entries.length - 1];

        if (latestEntry.entryId === inactiveKey
            && !latestEntry.markedAsRead) {
            onRead([latestEntry.entryId]);
        }

        this.activeEntryId = null;
    }

    handleExpand(expandedEntryId: string, collapsedElement: HTMLElement) {
        this.setState({ expandedEntryId });
    }

    handleClose() {
        this.setState({ expandedEntryId: null });
    }

    renderEntry(entry: Entry) {
        const { 
            onFetchComments,
            onFetchFullContent,
            onHideFullContents,
            onPin,
            onShowFullContents,
            onUnpin,
            sameOrigin,
            streamView
        } = this.props;
        const { expandedEntryId } = this.state;

        return (
            <EntryComponent
                entry={entry}
                isCollapsible={streamView === 'collapsible'}
                isExpanded={streamView === 'expanded' || expandedEntryId === entry.entryId}
                key={entry.entryId}
                onClose={this.handleClose}
                onExpand={this.handleExpand}
                onFetchComments={onFetchComments}
                onFetchFullContent={onFetchFullContent}
                onHideFullContents={onHideFullContents}
                onPin={onPin}
                onShowFullContents={onShowFullContents}
                onUnpin={onUnpin}
                sameOrigin={sameOrigin} />
        );
    }

    render() {
        const { isLoading, streamView } = this.props;

        if (isLoading) {
            const isExpanded = streamView === 'expanded';

            return (
                <div className="entry-list">
                    <EntryPlaceholder isExpanded={isExpanded} />
                    <EntryPlaceholder isExpanded={isExpanded} />
                    <EntryPlaceholder isExpanded={isExpanded} />
                    <EntryPlaceholder isExpanded={isExpanded} />
                    <EntryPlaceholder isExpanded={isExpanded} />
                    <EntryPlaceholder isExpanded={isExpanded} />
                    <EntryPlaceholder isExpanded={isExpanded} />
                    <EntryPlaceholder isExpanded={isExpanded} />
                    <EntryPlaceholder isExpanded={isExpanded} />
                    <EntryPlaceholder isExpanded={isExpanded} />
                </div>
            );
        }

        const { entries, isScrolling } = this.props;

        return (
            <ScrollSpy
                getKey={getKey}
                isDisabled={isScrolling}
                marginTop={SCROLL_OFFSET}
                onActivate={this.handleActivate}
                onInactivate={this.handleInactivate}
                renderList={renderList}>
                {entries.map(this.renderEntry.bind(this))}
            </ScrollSpy>
        );
    }
}

function renderList(children: React.ReactNode): React.ReactElement<any> {
    return (
        <div className="entry-list">{children}</div>
    );
}

function getKey(child: React.ReactElement<any>): string {
    return child.props.entry.entryId;
}
