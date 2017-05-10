import Enumerable from '@emonkak/enumerable'
import React, { PureComponent, cloneElement } from 'react';

import '@emonkak/enumerable/extensions/select';
import '@emonkak/enumerable/extensions/takeWhile';
import '@emonkak/enumerable/extensions/toArray';
import '@emonkak/enumerable/extensions/where';

import Entry from 'components/parts/Entry';
import EntryPlaceholder from 'components/parts/EntryPlaceholder';
import ScrollSpy from 'components/parts/ScrollSpy';
import { Entry as EntryInterface, StreamView } from 'messaging/types';

const SCROLL_OFFSET = 48;

interface EntryListProps {
    entries: EntryInterface[];
    isLoading: boolean;
    isScrolling: boolean;
    onFetchComments: (entryId: string | number, url: string) => void;
    onFetchFullContent: (entryId: string | number, url: string) => void;
    onUnpin: (entryId: string | number) => void;
    onPin: (entryId: string | number) => void;
    onRead: (entryIds: (string | number)[]) => void;
    readEntryIds: Set<string | number>;
    scrollTo: (x: number, y: number) => Promise<void>;
    view: StreamView;
}

interface EntryListState {
    expandedEntryId: string | number | null;
}

function renderChild(child: React.ReactElement<any>, isActive: boolean) {
    return isActive ? cloneElement(child, {
        ...child.props,
        isActive
    }) : child;
}

function renderList(children: React.ReactNode): React.ReactElement<any> {
    return (
        <div className="entry-list">{children}</div>
    );
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
        if (nextProps.view !== this.props.view) {
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

        if (this.props.view !== prevProps.view && this.activeEntryId) {
            scrollElement = document.getElementById('entry-' + this.activeEntryId);
        }

        if (scrollElement) {
            const { scrollTo } = this.props;

            scrollTo(0, scrollElement.offsetTop - SCROLL_OFFSET);
        }
    }

    handleActivate(activeKey: string) {
        const { entries, onRead, readEntryIds } = this.props;

        const newReadEntryIds = new Enumerable(entries)
            .takeWhile((entry) => entry.entryId !== activeKey)
            .where((entry) => !entry.markedAsRead && !readEntryIds.has(entry.entryId))
            .select((entry) => entry.entryId)
            .toArray();

        if (newReadEntryIds.length > 0) {
            onRead(newReadEntryIds);
        }

        this.activeEntryId = activeKey;
    }

    handleInactivate(inactiveKey: string) {
        const { entries, onRead, readEntryIds } = this.props;
        const latestEntry = entries[entries.length - 1];

        if (latestEntry.entryId === inactiveKey
            && !latestEntry.markedAsRead
            && !readEntryIds.has(latestEntry.entryId)) {
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

    renderEntry(entry: EntryInterface) {
        const { onFetchComments, onFetchFullContent, onPin, onUnpin, readEntryIds, view } = this.props;
        const { expandedEntryId } = this.state;
        const isCollapsible = view === 'collapsible';
        const isExpanded = view === 'expanded' || expandedEntryId === entry.entryId;
        const isRead = readEntryIds.has(entry.entryId);

        return (
            <Entry
                entry={entry}
                isCollapsible={isCollapsible}
                isExpanded={isExpanded}
                isRead={isRead}
                key={entry.entryId}
                onClose={this.handleClose}
                onExpand={this.handleExpand}
                onFetchComments={onFetchComments}
                onFetchFullContent={onFetchFullContent}
                onPin={onPin}
                onUnpin={onUnpin} />
        );
    }

    render() {
        const { isLoading, view } = this.props;

        if (isLoading) {
            const isExpanded = view === 'expanded';
            const isCollapsible = view === 'collapsible';

            return (
                <div className="entry-list">
                    <EntryPlaceholder isCollapsible={isCollapsible} isExpanded={isExpanded} />
                    <EntryPlaceholder isCollapsible={isCollapsible} isExpanded={isExpanded} />
                    <EntryPlaceholder isCollapsible={isCollapsible} isExpanded={isExpanded} />
                    <EntryPlaceholder isCollapsible={isCollapsible} isExpanded={isExpanded} />
                    <EntryPlaceholder isCollapsible={isCollapsible} isExpanded={isExpanded} />
                    <EntryPlaceholder isCollapsible={isCollapsible} isExpanded={isExpanded} />
                    <EntryPlaceholder isCollapsible={isCollapsible} isExpanded={isExpanded} />
                    <EntryPlaceholder isCollapsible={isCollapsible} isExpanded={isExpanded} />
                    <EntryPlaceholder isCollapsible={isCollapsible} isExpanded={isExpanded} />
                    <EntryPlaceholder isCollapsible={isCollapsible} isExpanded={isExpanded} />
                </div>
            );
        }

        const { entries, isScrolling } = this.props;

        return (
            <ScrollSpy
                isDisabled={isScrolling}
                marginTop={SCROLL_OFFSET}
                onActivate={this.handleActivate}
                onInactivate={this.handleInactivate}
                renderChild={renderChild}
                renderList={renderList}>
                {entries.map(this.renderEntry.bind(this))}
            </ScrollSpy>
        );
    }
}
