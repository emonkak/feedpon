import React, { PropTypes, PureComponent, cloneElement } from 'react';

import Entry from 'components/parts/Entry';
import EntryPlaceholder from 'components/parts/EntryPlaceholder';
import ScrollSpy from 'components/parts/ScrollSpy';

export default class CollapsibleEntryList extends PureComponent<any, any> {
    static propTypes = {
        entries: PropTypes.arrayOf(PropTypes.object),
        loading: PropTypes.bool,
        scrollTo: PropTypes.func.isRequired
    };

    static defaultProps = {
        loading: false
    };

    constructor(props: any, context: any) {
        super(props, context);

        this.state = {
            collapsedKey: null
        };
    }

    handleCollapse(collapsedKey: any, collapsedElement: HTMLElement) {
        const { scrollTo } = this.props;

        window.requestAnimationFrame(() => {
            scrollTo(0, collapsedElement.offsetTop);
        });

        this.setState(state => ({
            ...state,
            collapsedKey
        }));
    }

    handleClose() {
        this.setState(state => ({
            ...state,
            collapsedKey: null
        }));
    }

    renderActiveChild(child: React.ReactElement<any>) {
        return cloneElement(child, {
            ...child.props,
            active: true
        });
    }

    renderEntry(entry: any) {
        const { collapsedKey } = this.state;
        const collapsed = collapsedKey === entry.entryId;

        return (
            <Entry
                key={entry.entryId}
                closable={collapsed}
                collapsible={!collapsed}
                entry={entry}
                expanded={collapsed}
                onCollapse={this.handleCollapse.bind(this, entry.entryId)}
                onClose={this.handleClose.bind(this)} />
        );
    }

    render() {
        const { entries, loading } = this.props;

        if (loading) {
            return (
                <div className="entry-list">
                    <EntryPlaceholder expanded={false} />
                    <EntryPlaceholder expanded={false} />
                    <EntryPlaceholder expanded={false} />
                    <EntryPlaceholder expanded={false} />
                    <EntryPlaceholder expanded={false} />
                    <EntryPlaceholder expanded={false} />
                    <EntryPlaceholder expanded={false} />
                    <EntryPlaceholder expanded={false} />
                </div>
            );
        }

        return (
            <ScrollSpy
                className="entry-list"
                renderActiveChild={this.renderActiveChild.bind(this)}>
                {entries.map(this.renderEntry.bind(this))}
            </ScrollSpy>
        );
    }
}
