import React, { PropTypes, PureComponent, cloneElement } from 'react';

import Entry from 'components/parts/Entry';
import EntryPlaceholder from 'components/parts/EntryPlaceholder';
import ScrollSpy from 'components/parts/ScrollSpy';
import { Entry as EntryType } from 'messaging/types';

export default class EntryList extends PureComponent<any, any> {
    static propTypes = {
        entries: PropTypes.arrayOf(PropTypes.object).isRequired,
        isScrolling: PropTypes.bool.isRequired,
        isLoading: PropTypes.bool.isRequired,
        viewMode: PropTypes.oneOf(['expanded', 'collapsible']).isRequired,
        onMarkAsRead: PropTypes.func
    };

    private activeEntryId: string;

    private scrollElement: HTMLElement;

    constructor(props: any, context: any) {
        super(props, context);

        this.state = {
            collapsedEntryId: null
        };
    }

    componentWillReceiveProps(nextProps: any) {
        if (nextProps.viewMode !== this.props.viewMode) {
            this.setState(state => ({
                ...state,
                collapsedEntryId: null
            }));
        }
    }

    componentWillUpdate(nextProps: any, nextState: any) {
        if (nextProps.viewMode !== this.props.viewMode) {
            if (this.activeEntryId != null) {
                this.scrollElement = document.getElementById('entry-' + this.activeEntryId);
            }
        }
    }

    componentDidUpdate(prevProps: any, prevState: any) {
        if (this.scrollElement) {
            this.props.scrollTo(0, this.scrollElement.offsetTop);

            this.scrollElement = null;
        }
    }

    handleActivate(activeEntryId: string, inactiveEntryId: string, activeEntryIndex: number, inactiveEntryIndex: number) {
        this.activeEntryId = activeEntryId;

        const { onMarkAsRead } = this.props;

        if (onMarkAsRead
            && inactiveEntryId != ''
            && activeEntryIndex > inactiveEntryIndex) {
            onMarkAsRead(inactiveEntryId);
        }
    }

    handleInactivate(inactiveEntryId: string) {
        this.activeEntryId = null;

        const { onMarkAsRead } = this.props;

        if (onMarkAsRead) {
            onMarkAsRead(inactiveEntryId);
        }
    }

    handleCollapse(collapsedEntryId: any, collapsedElement: HTMLElement) {
        this.scrollElement = collapsedElement;

        this.setState(state => ({
            ...state,
            collapsedEntryId
        }));
    }

    handleClose() {
        this.setState(state => ({
            ...state,
            collapsedEntryId: null
        }));
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
                onClose={this.handleClose.bind(this)}
                onCollapse={this.handleCollapse.bind(this, entry.entryId)} />
        );
    }

    renderActiveEntry(child: React.ReactElement<any>) {
        return cloneElement(child, {
            ...child.props,
            isActive: true
        });
    }

    render() {
        const { isLoading, viewMode } = this.props;

        if (isLoading) {
            const isExpanded = viewMode === 'expanded';

            return (
                <div className="entry-list">
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
                className="entry-list"
                isDisabled={isScrolling}
                onActivate={this.handleActivate.bind(this)}
                onInactivate={this.handleInactivate.bind(this)}
                renderActiveChild={this.renderActiveEntry.bind(this)}>
                {entries.map(this.renderEntry.bind(this))}
            </ScrollSpy>
        );
    }
}
