import React, { PropTypes, PureComponent, cloneElement } from 'react';

import Entry from 'components/parts/Entry';
import EntryPlaceholder from 'components/parts/EntryPlaceholder';
import ScrollSpy from 'components/parts/ScrollSpy';
import { Entry as EntryType, ViewMode } from 'messaging/types';

const SCROLL_OFFSET = 48;

interface Props {
    entries: EntryType[];
    isLoading: boolean;
    isScrolling: boolean;
    onFetchComments: (entryId: string, url: string) => void;
    onMarkAsRead: (entryIds: string[]) => void;
    scrollTo: (x: number, y: number) => Promise<void>;
    viewMode: ViewMode;
}

interface State {
    collapsedEntryId: string | null;
}

function renderActiveEntry(child: React.ReactElement<any>) {
    return cloneElement(child, {
        ...child.props,
        isActive: true
    });
}

export default class EntryList extends PureComponent<Props, State> {
    static propTypes = {
        entries: PropTypes.arrayOf(PropTypes.object).isRequired,
        isLoading: PropTypes.bool.isRequired,
        isScrolling: PropTypes.bool.isRequired,
        onFetchComments: PropTypes.func,
        onMarkAsRead: PropTypes.func,
        scrollTo: PropTypes.func.isRequired,
        viewMode: PropTypes.oneOf(['expanded', 'collapsible']).isRequired
    };

    private activeEntryId: string | null = null;

    private scrollElement: HTMLElement | null = null;

    constructor(props: Props, context: any) {
        super(props, context);

        this.state = {
            collapsedEntryId: null
        };

        this.handleActivate = this.handleActivate.bind(this);
        this.handleInactivate = this.handleInactivate.bind(this);
        this.handleCollapse = this.handleCollapse.bind(this);
        this.handleClose = this.handleClose.bind(this);
        this.handleFetchComments = this.handleFetchComments.bind(this);
    }

    componentWillReceiveProps(nextProps: Props) {
        if (nextProps.viewMode !== this.props.viewMode) {
            this.setState({
                collapsedEntryId: null
            });
        }
    }

    componentWillUpdate(nextProps: Props, nextState: State) {
        if (nextProps.viewMode !== this.props.viewMode) {
            if (this.activeEntryId != null) {
                this.scrollElement = document.getElementById('entry--' + this.activeEntryId);
            }
        }
    }

    componentDidUpdate(prevProps: Props, prevState: State) {
        if (this.scrollElement) {
            this.props.scrollTo(0, this.scrollElement.offsetTop - SCROLL_OFFSET);

            this.scrollElement = null;
        }
    }

    handleActivate(activeEntryId: string, activeEntryIndex: number) {
        this.activeEntryId = activeEntryId;

        const { onMarkAsRead } = this.props;

        if (onMarkAsRead) {
            const { entries } = this.props;

            const readEntryIds = entries
                .slice(0, activeEntryIndex)
                .filter(entry => entry.readAt == null)
                .map(entry => entry.entryId);

            if (readEntryIds.length > 0) {
                onMarkAsRead(readEntryIds);
            }
        }
    }

    handleInactivate(inactiveEntryId: string, inactiveEntryIndex: number) {
        this.activeEntryId = null;

        const { onMarkAsRead } = this.props;

        if (onMarkAsRead) {
            const { entries } = this.props;
            const latestIndex = entries.length - 1;

            if (inactiveEntryIndex === latestIndex) {
                const entry = entries[latestIndex];

                if (entry.readAt == null) {
                    onMarkAsRead([entry.entryId]);
                }
            }
        }
    }

    handleCollapse(collapsedEntryId: string, collapsedElement: HTMLElement) {
        this.scrollElement = collapsedElement;

        this.setState({
            collapsedEntryId
        });
    }

    handleClose() {
        this.setState({
            collapsedEntryId: null
        });
    }

    handleFetchComments(entryId: string, url: string) {
        const { onFetchComments } = this.props;

        if (onFetchComments) {
            onFetchComments(entryId, url);
        }
    }

    renderEntry(entry: EntryType) {
        const { collapsedEntryId } = this.state;
        const { viewMode } = this.props;
        const isCollapsible = viewMode === 'collapsible';
        const isExpanded = viewMode === 'expanded' || collapsedEntryId === entry.entryId;

        return (
            <Entry
                entry={entry}
                isCollapsible={isCollapsible}
                isExpanded={isExpanded}
                key={entry.entryId}
                onClose={this.handleClose}
                onCollapse={this.handleCollapse}
                onFetchComments={this.handleFetchComments} />
        );
    }

    render() {
        const { isLoading, viewMode } = this.props;

        if (isLoading) {
            const isExpanded = viewMode === 'expanded';
            const isCollapsible = viewMode === 'collapsible';

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
                className="entry-list"
                isDisabled={isScrolling}
                marginTop={SCROLL_OFFSET}
                onActivate={this.handleActivate}
                onInactivate={this.handleInactivate}
                renderActiveChild={renderActiveEntry}>
                {entries.map(this.renderEntry.bind(this))}
            </ScrollSpy>
        );
    }
}
