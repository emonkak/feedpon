import Enumerable from '@emonkak/enumerable'
import React, { PureComponent, cloneElement } from 'react';

import '@emonkak/enumerable/extensions/select';
import '@emonkak/enumerable/extensions/takeWhile';
import '@emonkak/enumerable/extensions/toArray';
import '@emonkak/enumerable/extensions/where';

import Entry from 'components/parts/Entry';
import EntryPlaceholder from 'components/parts/EntryPlaceholder';
import ScrollSpy from 'components/parts/ScrollSpy';
import { Entry as EntryType, FeedView } from 'messaging/types';

import getScrollableParent from 'utils/dom/getScrollableParent';

const SCROLL_OFFSET = 48;

interface EntryListProps {
    entries: EntryType[];
    isLoading: boolean;
    isScrolling: boolean;
    onFetchComments: (entryId: string, url: string) => void;
    onFetchFullContent: (entryId: string, url: string) => void;
    onMarkAsRead: (entryIds: string[]) => void;
    scrollTo: (x: number, y: number) => Promise<void>;
    view: FeedView;
}

interface EntryListState {
    expandedEntryId: string | null;
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

    private scrollElement: HTMLElement | null = null;

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

    componentWillUpdate(nextProps: EntryListProps, nextState: EntryListState) {
        if (nextProps.view !== this.props.view) {
            if (this.activeEntryId != null) {
                this.scrollElement = document.getElementById('entry-' + this.activeEntryId);
            }
        }
    }

    componentDidUpdate(prevProps: EntryListProps, prevState: EntryListState) {
        if (this.scrollElement) {
            this.props.scrollTo(0, this.scrollElement.offsetTop - SCROLL_OFFSET);

            this.scrollElement = null;
        }
    }

    handleActivate(activeKey: string) {
        const { onMarkAsRead } = this.props;

        if (onMarkAsRead) {
            const { entries } = this.props;

            const readEntryIds = new Enumerable(entries)
                .takeWhile((entry) => entry.entryId !== activeKey)
                .where(entry => entry.readAt == null)
                .select(entry => entry.entryId)
                .toArray();

            if (readEntryIds.length > 0) {
                onMarkAsRead(readEntryIds);
            }
        }

        this.activeEntryId = activeKey;
    }

    handleInactivate(inactiveKey: string) {
        this.activeEntryId = null;

        const { onMarkAsRead } = this.props;

        if (onMarkAsRead) {
            const { entries } = this.props;
            const latestEntry = entries[entries.length - 1];

            if (latestEntry.entryId === inactiveKey && latestEntry.readAt == null) {
                onMarkAsRead([latestEntry.entryId]);
            }
        }
    }

    handleExpand(expandedEntryId: string, collapsedElement: HTMLElement) {
        this.scrollElement = collapsedElement;

        this.setState({
            expandedEntryId
        });
    }

    handleClose() {
        this.setState({
            expandedEntryId: null
        });
    }

    renderEntry(entry: EntryType) {
        const { expandedEntryId } = this.state;
        const { onFetchComments, onFetchFullContent, view } = this.props;
        const isCollapsible = view === 'collapsible';
        const isExpanded = view === 'expanded' || expandedEntryId === entry.entryId;

        return (
            <Entry
                entry={entry}
                isCollapsible={isCollapsible}
                isExpanded={isExpanded}
                key={entry.entryId}
                onClose={this.handleClose}
                onExpand={this.handleExpand}
                onFetchComments={onFetchComments}
                onFetchFullContent={onFetchFullContent} />
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
                getScrollableParent={getScrollableParent}
                isDisabled={isScrolling}
                marginTop={SCROLL_OFFSET}
                onActivate={this.handleActivate}
                onInactivate={this.handleInactivate}
                renderList={renderList}
                renderChild={renderChild}>
                {entries.map(this.renderEntry.bind(this))}
            </ScrollSpy>
        );
    }
}
