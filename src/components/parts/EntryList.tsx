import React, { PropTypes, PureComponent, cloneElement } from 'react';

import Entry from 'components/parts/Entry';
import EntryPlaceholder from 'components/parts/EntryPlaceholder';
import ScrollSpy from 'components/parts/ScrollSpy';
import { Entry as EntryType } from 'messaging/types';

export default class EntryList extends PureComponent<any, any> {
    static propTypes = {
        entries: PropTypes.arrayOf(PropTypes.object),
        loading: PropTypes.bool,
        viewMode: PropTypes.oneOf(['expanded', 'collapsible']).isRequired
    };

    static defaultProps = {
        loading: false
    };

    private activeId: string;

    private scrollElement: HTMLElement;

    constructor(props: any, context: any) {
        super(props, context);

        this.state = {
            collapsedId: null
        };
    }

    componentWillReceiveProps(nextProps: any) {
        if (nextProps.viewMode !== this.props.viewMode) {
            this.setState(state => ({
                ...state,
                collapsedId: null
            }));
        }
    }

    componentWillUpdate(nextProps: any, nextState: any) {
        if (nextProps.viewMode !== this.props.viewMode) {
            if (this.activeId != null) {
                this.scrollElement = document.getElementById('entry-' + this.activeId);
            }
        }
    }

    componentDidUpdate(prevProps: any, prevState: any) {
        if (this.scrollElement) {
            this.props.scrollTo(0, this.scrollElement.offsetTop);

            this.scrollElement = null;
        }
    }

    handleActivateEntry(activeId: string, inactiveId: string | null) {
        this.activeId = activeId;
    }

    handleInactivateEntry(inactiveId: string) {
        this.activeId = null;
    }

    handleCollapse(collapsedId: any, collapsedElement: HTMLElement) {
        this.scrollElement = collapsedElement;

        this.setState(state => ({
            ...state,
            collapsedId
        }));
    }

    handleClose() {
        this.setState(state => ({
            ...state,
            collapsedId: null
        }));
    }

    renderEntry(entry: EntryType) {
        const { collapsedId } = this.state;
        const { viewMode } = this.props;
        const collapsible = viewMode === 'collapsible';
        const expanded = viewMode === 'expanded' || collapsedId === entry.entryId;

        return (
            <Entry
                collapsible={collapsible}
                entry={entry}
                expanded={expanded}
                key={entry.entryId}
                onClose={this.handleClose.bind(this)}
                onCollapse={this.handleCollapse.bind(this, entry.entryId)} />
        );
    }

    renderActiveEntry(child: React.ReactElement<any>) {
        return cloneElement(child, {
            ...child.props,
            active: true
        });
    }

    render() {
        const { entries, loading, viewMode } = this.props;

        if (loading) {
            const expanded = viewMode === 'expanded';

            return (
                <div className="entry-list">
                    <EntryPlaceholder expanded={expanded} />
                    <EntryPlaceholder expanded={expanded} />
                    <EntryPlaceholder expanded={expanded} />
                    <EntryPlaceholder expanded={expanded} />
                    <EntryPlaceholder expanded={expanded} />
                </div>
            );
        }

        return (
            <ScrollSpy
                onActivate={this.handleActivateEntry.bind(this)}
                onInactivate={this.handleInactivateEntry.bind(this)}
                className="entry-list"
                renderActiveChild={this.renderActiveEntry.bind(this)}>
                {entries.map(this.renderEntry.bind(this))}
            </ScrollSpy>
        );
    }
}
